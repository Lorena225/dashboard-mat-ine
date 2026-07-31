-- ═══════════════════════════════════════════════════════════════════
-- Critério de matrícula — Edilvo / VirtruvIA
--
-- 1. Data: campo DATA PAGAMENTO MATRICULA (cartão do contato no Kommo),
--    com cadeia de fallback explícita enquanto o sync não traz o campo.
-- 2. Crédito: exclusivamente pelo REGISTRO DE ATENDIMENTO, rateado em
--    partes iguais quando há mais de um atendente no mesmo lead.
-- 3. Escola: sempre a do lead (funil). Os usuários atendem as duas escolas,
--    então o prefixo INE-/MAT- no nome não classifica a matrícula; o total
--    de cada usuário vem aberto por escola.
-- ═══════════════════════════════════════════════════════════════════

alter table public.kommo_contacts add column if not exists data_pagamento timestamptz;
alter table public.kommo_leads    add column if not exists data_pagamento timestamptz;

create index if not exists idx_kommo_contacts_data_pagamento
  on public.kommo_contacts (data_pagamento) where data_pagamento is not null;
create index if not exists idx_kommo_leads_data_pagamento
  on public.kommo_leads (data_pagamento) where data_pagamento is not null;

comment on column public.kommo_leads.data_pagamento is
  'DATA PAGAMENTO MATRICULA (Kommo). Criterio canonico de matricula.';
comment on column public.kommo_contacts.data_pagamento is
  'DATA PAGAMENTO MATRICULA (Kommo, custom field do contato). Criterio canonico de matricula.';

-- ── Base canônica: uma linha por matrícula × atendente ──
drop function if exists public.matriculas_periodo(timestamptz, timestamptz);

create function public.matriculas_periodo(
  p_from timestamptz,
  p_to   timestamptz
)
returns table (
  lead_id            bigint,
  aluno              text,
  escola             text,
  atendente          text,   -- nome cru do Registro de Atendimento (auditoria no Kommo)
  vendedor           text,   -- mesmo nome usado na aba Vendedores (mapeado em kommo_users)
  atendentes_no_lead int,
  credito            numeric,
  valor              numeric,
  valor_credito      numeric,
  curso              text,
  data_matricula     timestamptz,
  base_data          text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  with cand as (
    select l.id, l.name, l.school, l.price, l.curso, l.closed_at, l.atendentes,
           coalesce(l.data_pagamento, c.data_pagamento) as dt_pag
    from kommo_leads l
    left join kommo_contacts c on c.id = l.contact_id
    left join kommo_pipeline_statuses ps
           on ps.pipeline_id = l.pipeline_id and ps.status_id = l.status_id
    where l.school is not null
      and (
        ps.status_name = 'MATRICULA REALIZADA'
        or coalesce(l.data_pagamento, c.data_pagamento) is not null
        or exists (
             select 1 from kommo_status_history_full h
             where h.lead_id = l.id and h.to_status_id = 142
               and h.pipeline_id in (13322587, 13438811)
           )
      )
  ),
  hist as (
    select h.lead_id, min(h.changed_at) as primeira_entrada
    from kommo_status_history_full h
    where h.to_status_id = 142 and h.pipeline_id in (13322587, 13438811)
    group by h.lead_id
  ),
  resolved as (
    select c.*,
           coalesce(c.dt_pag, h.primeira_entrada, c.closed_at) as data_matricula,
           case when c.dt_pag is not null           then 'DATA PAGAMENTO MATRICULA'
                when h.primeira_entrada is not null then 'Entrada em MATRICULA REALIZADA'
                else 'Fechamento do lead' end                 as base_data
    from cand c
    left join hist h on h.lead_id = c.id
  ),
  per as (
    select * from resolved
    where data_matricula >= p_from and data_matricula < p_to
  ),
  exploded as (
    select p.*, a.nome, count(*) over (partition by p.id) as n_at
    from per p
    left join lateral (
      select distinct btrim(x.value #>> '{}') as nome
      from jsonb_array_elements(coalesce(p.atendentes, '[]'::jsonb)) x
      where btrim(x.value #>> '{}') <> ''
    ) a on true
  )
  select
    e.id,
    coalesce(nullif(btrim(e.name), ''), '(sem nome)'),
    e.school,
    coalesce(e.nome, '(sem registro de atendimento)'),
    coalesce(
      (select u2.name from kommo_users u2
        where upper(u2.name) like
              upper(regexp_replace(e.nome, '^(MAT|INE)\s*-\s*', '', 'i')) || '%'
        limit 1),
      nullif(initcap(regexp_replace(coalesce(e.nome, ''), '^(MAT|INE)\s*-\s*', '', 'i')), ''),
      '(sem registro de atendimento)'
    ),
    e.n_at::int,
    round(1.0 / e.n_at, 4),
    coalesce(e.price, 0),
    round(coalesce(e.price, 0) / e.n_at, 2),
    e.curso,
    e.data_matricula,
    e.base_data
  from exploded e;
$$;

grant execute on function public.matriculas_periodo(timestamptz, timestamptz)
  to anon, authenticated, service_role;

-- ── RPC consumida pelo painel ──
-- `por_atendente` usa o nome cru do Registro de Atendimento (auditoria no Kommo).
-- `por_vendedor`  usa o nome normalizado, igual ao da aba Vendedores, para o
--                 relatorio casar com o ranking exibido acima dele na mesma pagina.
create or replace function public.dashboard_matriculas(
  p_token text, p_from timestamptz, p_to timestamptz, p_school text default null
)
returns jsonb
language plpgsql stable security definer set search_path to 'public'
as $function$
declare result jsonb;
begin
  if p_token <> 'ba37d3f35fb8c1dbef36184f0c0c1afc157dde7b' then
    raise exception 'unauthorized';
  end if;

  with m as (
    select * from matriculas_periodo(p_from, p_to)
    where p_school is null or escola = p_school
  ),
  por_escola as (
    select escola, round(sum(credito),2) as matriculas, count(distinct lead_id) as leads,
           round(sum(valor_credito),2) as faturamento,
           case when sum(credito)>0 then round(sum(valor_credito)/sum(credito),2) else 0 end as ticket_medio
    from m group by escola
  ),
  at_escola as (
    select atendente, escola, round(sum(credito),2) as matriculas, round(sum(valor_credito),2) as faturamento
    from m group by 1,2
  ),
  escolas_agg as (
    select atendente, jsonb_object_agg(escola, jsonb_build_object(
             'matriculas', matriculas, 'faturamento', faturamento)) as escolas
    from at_escola group by atendente
  ),
  at_total as (
    select atendente, max(vendedor) as vendedor,
           round(sum(credito),2) as matriculas, count(distinct lead_id) as leads,
           round(sum(valor_credito),2) as faturamento,
           count(*) filter (where atendentes_no_lead > 1) as compartilhadas,
           case when sum(credito)>0 then round(sum(valor_credito)/sum(credito),2) else 0 end as ticket_medio
    from m group by atendente
  ),
  por_atendente as (
    select t.*, coalesce(e.escolas, '{}'::jsonb) as escolas
    from at_total t left join escolas_agg e on e.atendente = t.atendente
  ),
  vend_escola as (
    select vendedor, escola, round(sum(credito),2) as matriculas, round(sum(valor_credito),2) as faturamento
    from m group by 1,2
  ),
  vend_escolas_agg as (
    select vendedor, jsonb_object_agg(escola, jsonb_build_object(
             'matriculas', matriculas, 'faturamento', faturamento)) as escolas
    from vend_escola group by vendedor
  ),
  vend_total as (
    select vendedor, round(sum(credito),2) as matriculas, count(distinct lead_id) as leads,
           round(sum(valor_credito),2) as faturamento,
           count(*) filter (where atendentes_no_lead > 1) as compartilhadas
    from m group by vendedor
  ),
  por_vendedor as (
    select t.*, coalesce(e.escolas, '{}'::jsonb) as escolas
    from vend_total t left join vend_escolas_agg e on e.vendedor = t.vendedor
  ),
  lista as (
    select lead_id, aluno, escola, atendente, vendedor, atendentes_no_lead,
           credito, valor, valor_credito, curso, data_matricula, base_data
    from m
  ),
  diag as (
    select round(sum(credito),2) as total_matriculas,
      count(distinct lead_id) as total_leads,
      count(distinct lead_id) filter (where base_data='DATA PAGAMENTO MATRICULA') as por_data_pagamento,
      count(distinct lead_id) filter (where base_data='Entrada em MATRICULA REALIZADA') as por_entrada_status,
      count(distinct lead_id) filter (where base_data='Fechamento do lead') as por_fechamento,
      count(distinct lead_id) filter (where atendente='(sem registro de atendimento)') as sem_atendente,
      count(distinct lead_id) filter (where atendentes_no_lead>1) as compartilhadas
    from m
  )
  select jsonb_build_object(
    'periodo',       jsonb_build_object('from', p_from, 'to', p_to),
    'por_escola',    (select coalesce(jsonb_agg(to_jsonb(x) order by x.matriculas desc), '[]') from por_escola x),
    'por_atendente', (select coalesce(jsonb_agg(to_jsonb(x) order by x.matriculas desc), '[]') from por_atendente x),
    'por_vendedor',  (select coalesce(jsonb_agg(to_jsonb(x) order by x.matriculas desc), '[]') from por_vendedor x),
    'lista',         (select coalesce(jsonb_agg(to_jsonb(x) order by x.vendedor, x.data_matricula), '[]') from lista x),
    'diagnostico',   (select to_jsonb(d) from diag d)
  ) into result;

  return result;
end;
$function$;

grant execute on function public.dashboard_matriculas(text, timestamptz, timestamptz, text)
  to anon, authenticated, service_role;
