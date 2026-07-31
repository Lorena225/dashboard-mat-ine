-- ═══════════════════════════════════════════════════════════════════
-- DATA PAGAMENTO MATRICULA — campo 1375496 do contato no Kommo
--
-- Descoberta relevante: o campo é do tipo TEXTO, não data. Os valores são
-- digitados à mão e vêm com variações. Por isso o sync grava o texto CRU em
-- kommo_contacts.data_pagamento_raw e a conversão fica concentrada na função
-- parse_data_pagamento, acionada por trigger. Ajustar o parser reprocessa todo
-- o histórico sem precisar bater de novo na API.
--
-- Formatos observados em jul/2026 (268 preenchidos):
--   DD/MM/YYYY  maioria
--   DD/MM/YY    ex.: 29/07/26
--   DDMMYYYY    sem separador, ex.: 09062026
--   DDMM/YYYY   barra faltando, ex.: 1806/2026
-- Ambíguos ficam NULL de propósito (ex.: "15/05" sem ano, "04/05/20226"):
-- é preferível cair na base de fallback a datar a matrícula errado.
-- ═══════════════════════════════════════════════════════════════════

alter table public.kommo_contacts add column if not exists data_pagamento_raw text;

comment on column public.kommo_contacts.data_pagamento_raw is
  'Campo 1375496 "Data Pagamento Matricula" do Kommo, texto cru como digitado.';

create or replace function public.parse_data_pagamento(p text)
returns timestamptz
language plpgsql
immutable
as $$
declare
  s text := btrim(coalesce(p, ''));
  d date;
begin
  if s = '' then return null; end if;
  s := replace(s, ' ', '');

  begin
    if    s ~ '^\d{1,2}/\d{1,2}/\d{4}$'   then d := to_date(s, 'DD/MM/YYYY');
    elsif s ~ '^\d{1,2}/\d{1,2}/\d{2}$'   then d := to_date(s, 'DD/MM/YY');
    elsif s ~ '^\d{8}$'                   then d := to_date(s, 'DDMMYYYY');
    elsif s ~ '^\d{4}/\d{4}$'             then d := to_date(s, 'DDMM/YYYY');
    elsif s ~ '^\d{1,2}-\d{1,2}-\d{4}$'   then d := to_date(s, 'DD-MM-YYYY');
    elsif s ~ '^\d{1,2}\.\d{1,2}\.\d{4}$' then d := to_date(s, 'DD.MM.YYYY');
    elsif s ~ '^\d{4}-\d{2}-\d{2}'        then d := to_date(substr(s, 1, 10), 'YYYY-MM-DD');
    else  return null;
    end if;
  exception when others then
    return null;
  end;

  -- limites fixos de propósito: a função é IMMUTABLE e não pode depender de current_date
  if d < date '2020-01-01' or d > date '2035-12-31' then
    return null;
  end if;

  return d::timestamptz;
end;
$$;

create or replace function public.trg_kommo_contacts_data_pagamento()
returns trigger language plpgsql as $$
begin
  new.data_pagamento := parse_data_pagamento(new.data_pagamento_raw);
  return new;
end;
$$;

drop trigger if exists kommo_contacts_data_pagamento on public.kommo_contacts;
create trigger kommo_contacts_data_pagamento
  before insert or update of data_pagamento_raw on public.kommo_contacts
  for each row execute function public.trg_kommo_contacts_data_pagamento();

grant execute on function public.parse_data_pagamento(text) to anon, authenticated, service_role;

-- ── Backfill histórico ──
-- Lê respostas já baixadas da API do Kommo via pg_net (net._http_response),
-- extrai o campo 1375496 e grava o texto cru. Ignora respostas que não sejam
-- 200/JSON (ex.: 429 por rate limit), então pode ser reexecutada à vontade.
create or replace function public.backfill_data_pagamento(p_de bigint, p_ate bigint)
returns table (paginas int, contatos int, com_data int, nao_parseados int)
language plpgsql
as $$
declare
  v_paginas int := 0; v_contatos int := 0; v_com int := 0; v_falha int := 0;
begin
  create temp table if not exists _tmp_dp (id bigint primary key, valor text) on commit drop;
  delete from _tmp_dp;

  with respostas as (
    select content::jsonb as j
    from net._http_response
    where id between p_de and p_ate
      and status_code = 200
      and left(btrim(coalesce(content, '')), 1) = '{'
  ),
  contatos as (
    -- contatos sem nenhum campo preenchido trazem custom_fields_values = null
    select jsonb_array_elements(
             coalesce(nullif(j #> '{_embedded,contacts}', 'null'::jsonb), '[]'::jsonb)
           ) as ct
    from respostas
  )
  insert into _tmp_dp (id, valor)
  select (ct->>'id')::bigint,
         (select cf->'values'->0->>'value'
          from jsonb_array_elements(
                 coalesce(nullif(ct->'custom_fields_values', 'null'::jsonb), '[]'::jsonb)
               ) cf
          where cf->>'field_id' = '1375496')
  from contatos
  on conflict (id) do update set valor = coalesce(excluded.valor, _tmp_dp.valor);

  select count(*) into v_paginas from net._http_response
   where id between p_de and p_ate and status_code = 200
     and left(btrim(coalesce(content,'')), 1) = '{';

  select count(*), count(*) filter (where valor is not null),
         count(*) filter (where valor is not null and parse_data_pagamento(valor) is null)
    into v_contatos, v_com, v_falha
  from _tmp_dp;

  update kommo_contacts c
     set data_pagamento_raw = t.valor
    from _tmp_dp t
   where c.id = t.id
     and t.valor is not null
     and t.valor is distinct from c.data_pagamento_raw;

  return query select v_paginas, v_contatos, v_com, v_falha;
end;
$$;

-- Como o backfill foi disparado (o subdomínio vem da edge function kommo-sync):
--
--   select net.http_get(
--     url := 'https://gerenteineproteccombr.kommo.com/api/v4/contacts?limit=250&'
--            || string_agg('filter[id][]=' || contact_id, '&'),
--     headers := jsonb_build_object('Authorization', 'Bearer ' ||
--       (select decrypted_secret from vault.decrypted_secrets where name = 'KOMMO_TOKEN'))
--   ) from ( ... contact_id dos leads de matricula, em blocos de ~75 ... ) t;
--
--   select * from backfill_data_pagamento(<primeiro_request_id>, <ultimo_request_id>);
--
-- Disparar mais de ~5 requisicoes em paralelo devolve 429 na API do Kommo.

-- Registros com texto preenchido que o parser nao conseguiu converter —
-- devem ser corrigidos manualmente no Kommo:
--   select id, data_pagamento_raw from kommo_contacts
--    where data_pagamento_raw is not null and data_pagamento is null;
