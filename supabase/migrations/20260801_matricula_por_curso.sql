-- ═══════════════════════════════════════════════════════════════════
-- Critério de matrícula v3 — validado matrícula a matrícula contra a
-- planilha de conferência de julho/2026 (115 linhas).
--
-- Resultado da reconciliação: 111 matrículas em comum, 10 só no sistema
-- (9 da Giselda Gama, que não tem bloco na planilha, + 1 sem registro de
-- atendimento) e 4 só na planilha (todas com causa identificada no Kommo).
--
-- REGRAS
-- 1. ELEGIBILIDADE — as duas condições, sem cadeia de fallback:
--      etapa MATRICULA REALIZADA  E  DATA PAGAMENTO MATRICULA no período.
--    Lead na etapa sem data de pagamento fica FORA e é reportado como
--    pendência no painel, em vez de ser datado por aproximação.
-- 2. UNIDADE DE CONTAGEM = CURSO, não lead. Um lead com mais de um curso
--    listado (curso, curso2, curso3) fez mais de uma matrícula.
--    'OUTROS CURSOS' é rótulo genérico e não conta como curso.
-- 3. ATRIBUIÇÃO — exclusivamente REGISTRO DE ATENDIMENTO, rateado em
--    partes iguais quando há mais de um nome. O curso vai junto como
--    propriedade da matrícula.
-- 4. DEDUPLICAÇÃO — leads repetidos no Kommo (mesmo aluno, escola, curso e
--    data) contam uma vez. Em julho: CAIQUE ASSIS e RAFAELA DORILEO.
-- 5. VALOR — o preço do lead cobre todos os cursos dele, então é rateado
--    entre os cursos antes de ser rateado entre os atendentes.
-- ═══════════════════════════════════════════════════════════════════

create or replace function public.nrm(t text) returns text
language sql immutable as $$
  select regexp_replace(upper(translate(coalesce(t,''),
    'ÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇáàãâäéèêëíìîïóòõôöúùûüç',
    'AAAAAEEEEIIIIOOOOOUUUUCAAAAAEEEEIIIIOOOOOUUUUC')), '[^A-Z]', '', 'g')
$$;

-- Corpo completo de matriculas_periodo e dashboard_matriculas aplicado no banco.
-- Ver as migrations criterio_matricula_v3 e dashboard_matriculas_v3_por_curso.
