# Dashboard Edilvo — Matrícula EAD & Ineprotec

Painel de indicadores da VirtruvIA para o grupo Edilvo. Site estático (React UMD + Recharts) que consome RPCs do Supabase em tempo real.

- **Produção:** https://dashboard-mat-ine.vercel.app
- **Dados:** Kommo CRM (sync de 30 em 30 min), Meta Ads, Google Ads
- **Menus:** Home Executivo · Comercial (10 abas) · Marketing · Marca & Reputação

Deploy: qualquer push na `main` com o projeto Vercel conectado a este repositório.

---

## Build

O `app.js` publicado é gerado a partir do `source-app.jsx`. **Não edite o `app.js` à mão** — a alteração é sobrescrita no build seguinte.

```bash
npm install
npm run build     # source-app.jsx -> app.js
```

React, ReactDOM e Recharts entram como globais UMD via `index.html`; o build apenas os referencia, não os empacota.

---

## Critério de matrícula

Definido com a operação em julho/2026 e implementado na função `matriculas_periodo(from, to)` do Supabase.

### 1. Qual data conta

Uma matrícula pertence ao período filtrado pelo campo **DATA PAGAMENTO MATRICULA**, do cartão do **contato** no Kommo.

Quando esse campo não está disponível, a função cai, nesta ordem, para:

1. `DATA PAGAMENTO MATRICULA` — critério definitivo
2. Entrada do lead na etapa `MATRICULA REALIZADA` (via `kommo_status_history_full`)
3. `closed_at` do lead

Cada linha do relatório carrega a coluna **Base da data**, indicando qual das três foi usada. O painel exibe um aviso enquanto a base não for integralmente a definitiva.

> **Pendência aberta:** a rotina `kommo-sync` (edge function, cron de 30 min) não traz o campo `DATA PAGAMENTO MATRICULA`, que existe no contato do Kommo mas não no banco. As colunas `kommo_contacts.data_pagamento` e `kommo_leads.data_pagamento` já existem e estão indexadas, prontas para receber o valor. Enquanto o sync não preencher, a contagem roda pela base 2.

### 2. Quem recebe o crédito

Exclusivamente pelo campo **REGISTRO DE ATENDIMENTO** do lead (`kommo_leads.atendentes`). O responsável do card (`responsible_user_id`) **não** é usado.

- Um atendente registrado → crédito integral (1,0)
- Mais de um → dividido em partes iguais (2 atendentes = 0,5 cada)
- Nenhum → entra no total da escola como `(sem registro de atendimento)`, sem creditar ninguém

Por isso o total por atendente pode ser fracionado.

### 3. Separação por escola

A função devolve duas dimensões, porque elas divergem em parte dos casos:

- `escola` — a escola do lead, definida pelo funil. **É a que o painel usa para totalizar.**
- `escola_atendente` — derivada do prefixo do Registro de Atendimento (`INE - ` / `MAT - `)

Quando as duas diferem, a linha é marcada com `divergencia_escola` e contabilizada no bloco "Consistência do período". Em julho/2026 eram 8 casos em 124 matrículas.

---

## RPCs

| RPC | Função |
|---|---|
| `matriculas_periodo(from, to)` | Base canônica: uma linha por matrícula × atendente, com crédito rateado |
| `dashboard_matriculas(token, from, to, school)` | Resumo por escola, por atendente, por atendente × escola, relatório nominal e diagnóstico |
| `dashboard_comercial` e demais | Abas anteriores, inalteradas |

A aba **Matrículas & Auditoria** consome `dashboard_matriculas` e exporta o relatório nominal em CSV (separador `;` e BOM, abre direto no Excel pt-BR).

---

## Testes

Os testes rodam o bundle em jsdom com os globais UMD reais. O Recharts é substituído por stubs porque depende de medição de layout, indisponível fora do navegador.

```bash
cd smoke && npm install jsdom react react-dom prop-types
node test.mjs        # aba de matrículas
node regressao.mjs ../app.js   # todas as telas
```
