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

O campo é o **1375496**, do cartão do contato. Detalhe que muda tudo: ele é do
tipo **texto**, não data — preenchido à mão, com variações. Por isso o sync grava o
texto cru em `kommo_contacts.data_pagamento_raw` e a conversão fica concentrada na
função `parse_data_pagamento`, acionada por trigger. Ajustar o parser reprocessa
todo o histórico sem rebater na API.

Formatos aceitos: `DD/MM/YYYY`, `DD/MM/YY`, `DDMMYYYY`, `DDMM/YYYY`, `DD-MM-YYYY`,
`DD.MM.YYYY`, `YYYY-MM-DD`. Valores ambíguos (`15/05` sem ano, `04/05/20226`) ficam
como `NULL` de propósito — é preferível a matrícula cair no fallback a ser datada
errado. Para listar o que precisa de correção manual no Kommo:

```sql
select id, data_pagamento_raw from kommo_contacts
 where data_pagamento_raw is not null and data_pagamento is null;
```

Quando o campo não está preenchido, a função cai nesta ordem:

1. `DATA PAGAMENTO MATRICULA` — critério definitivo
2. Entrada do lead na etapa `MATRICULA REALIZADA` (via `kommo_status_history_full`)
3. `closed_at` do lead

Cada linha do relatório carrega a coluna **Base da data**, indicando qual das três
foi usada, e o painel só mostra o selo verde quando o período inteiro roda pelo
critério definitivo. Cobertura após o backfill de jul/2026:

| Mês | Matrículas | Por DATA PAGAMENTO | Por etapa | Por fechamento |
|---|---:|---:|---:|---:|
| jul/2026 | 116 | 116 | 0 | 0 |
| jun/2026 | 98 | 97 | 1 | 0 |
| mai/2026 | 88 | 52 | 28 | 8 |

Maio ainda depende do fallback porque o campo não era preenchido de forma
consistente naquele período.

### 2. Quem recebe o crédito

Exclusivamente pelo campo **REGISTRO DE ATENDIMENTO** do lead (`kommo_leads.atendentes`). O responsável do card (`responsible_user_id`) **não** é usado.

- Um atendente registrado → crédito integral (1,0)
- Mais de um → dividido em partes iguais (2 atendentes = 0,5 cada)
- Nenhum → entra no total da escola como `(sem registro de atendimento)`, sem creditar ninguém

Por isso o total por atendente pode ser fracionado.

### 3. Separação por escola

Os usuários atendem as duas escolas. O prefixo `INE - ` / `MAT - ` faz parte do nome
cadastrado no Kommo e **não** classifica a matrícula.

- **Total por escola** — sempre pela escola do lead (funil).
- **Total por usuário** — aberto por escola: quantas matrículas ele fez em cada uma.

Os dois fecham entre si. Em julho/2026: Ineprotec 78 (43 Jessica + 26 Marcela + 6 Giselda
+ 1 Bruna + 2 sem registro) e Matrícula EAD 46 (29 Bruna + 10 Pedro + 5 Jessica
+ 1 Marcela + 1 Giselda).

---

## RPCs

| RPC | Função |
|---|---|
| `matriculas_periodo(from, to)` | Base canônica: uma linha por matrícula × atendente, com crédito rateado |
| `dashboard_matriculas(token, from, to, school)` | Total por escola, total por usuário aberto por escola, relatório nominal e diagnóstico |
| `dashboard_comercial` e demais | Abas anteriores, inalteradas |

O relatório nominal aparece em duas telas, pelo mesmo componente:

- **Matrículas & Auditoria** — agrupado pelo nome cru do Registro de Atendimento, que é como se confere no Kommo
- **Vendedores**, como último bloco da página — agrupado pelo nome normalizado do vendedor, para casar com o ranking exibido acima

Nos dois casos exporta CSV (separador `;` e BOM, abre direto no Excel pt-BR) com o nome do vendedor e o Registro de Atendimento lado a lado.

> A aba Vendedores conta matrículas por `closed_at` + etapa atual (base antiga), enquanto o relatório no rodapé segue o critério canônico. Em julho/2026 a diferença é de 2 matrículas para mais em Jessica, 2 para menos em Giselda e 2 sem registro de atendimento que a base antiga atribuía ao responsável do card. Migrar o ranking e as comissões para o critério canônico é uma decisão em aberto, porque mexe em base de comissionamento.

---

## Testes

Os testes rodam o bundle em jsdom com os globais UMD reais. O Recharts é substituído por stubs porque depende de medição de layout, indisponível fora do navegador.

```bash
cd smoke && npm install jsdom react react-dom prop-types
node test.mjs                   # base provisória
BASE=canonico node test.mjs    # critério definitivo
node regressao.mjs ../app.js   # todas as telas
```

---

## Sync (edge function `kommo-sync`)

Roda a cada 30 min via `cron.job` chamando a função por `pg_net`. **Não está versionada neste repositório** — vive só no Supabase. Alterações feitas na v14:

```ts
const CF_DATA_PAGAMENTO = 1375496; // contato: "Data Pagamento Matricula" (texto livre)
```

e, no mapeamento de contatos, o campo passou a ser gravado cru:

```ts
const dataPagamentoRaw = cfText(c, CF_DATA_PAGAMENTO);
return { id: c.id, phone, ddd, estado_uf, email,
         data_pagamento_raw: dataPagamentoRaw ? String(dataPagamentoRaw) : null,
         synced_at: new Date().toISOString() };
```

A função responde com `contactsComDataPagamento` no relatório de execução, para dar visibilidade da cobertura a cada rodada. Ao republicar, manter `verify_jwt: false` — ela faz a própria checagem por token e o cron depende disso.

O sync de contatos processa no máximo 5 páginas por execução (`MAX_CONTACT_PAGES`), então a tabela `kommo_contacts` fica atrás do Kommo. Contatos de matrículas ausentes foram inseridos no backfill.

---

## Deploy (Vercel)

O projeto era um site estático sem `package.json`; a Vercel servia a raiz direto. Ao introduzir o build com esbuild, ela passou a rodar `npm run build` e a exigir uma pasta de saída — sem isso o deploy falha com *No Output Directory named "public"*.

Por isso existe o `vercel.json` apontando `outputDirectory` para `dist/`, que o build monta com `index.html` + `app.js`. O `dist/` é gerado e não vai para o repositório.

Ao mexer no build, confira em Vercel → Deployments se o estado ficou **Ready**: um push aceito pelo Git não garante deploy bem-sucedido.
