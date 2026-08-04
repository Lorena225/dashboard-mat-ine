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

### 1b. Qual etapa conta

Vale o card em **MATRÍCULA REALIZADA** *ou* em qualquer etapa **não-perdida** do funil
**SUCESSO DO ALUNO** (Boas-vindas e Integração, Jornada do Aluno, Aluno Formado).

O motivo é o ciclo de vida: depois de matricular, a operação move o aluno adiante —
em 04/08/2026 esse movimento começou e derrubou silenciosamente uma matrícula de
junho e (quase) uma de julho. Aluno só chega ao funil de sucesso depois de
matricular, então estar lá **é** evidência da matrícula.

**ALUNO CANCELADO** (`is_lost`) fica fora, igual a MATRÍCULA PERDIDA: o cancelamento
remove a matrícula do mês da venda. Se a gestão preferir que estorno não abata o
histórico, é ajuste de uma linha em `matriculas_periodo` — decisão de negócio.

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

## Insights estratégicos (hover)

Os tooltips da aba Matrículas & Auditoria trazem, além da definição da métrica,
uma leitura estratégica calculada por `insights_matriculas(from, to)`.

Regra de projeto: **toda frase carrega o número que a sustenta**. Nada de texto
genérico do tipo "acompanhe de perto" — isso só ensina o gestor a ignorar o
tooltip. Como as frases são geradas no banco a partir do período consultado,
elas nunca ficam desatualizadas e acompanham qualquer filtro.

As frases vêm da RPC `dashboard_insights(token, from, to)`, **deliberadamente separada**
das RPCs de dados: acrescentar leitura estratégica nunca põe em risco os números do painel.

O que é computado:

| Onde | Leitura |
|---|---|
| KPI de matrículas por escola | Volume e ticket contra o período anterior, com a interpretação do cruzamento (cresceu em volume mas caiu o ticket, etc.) |
| Coluna Total, por atendente | Participação no período, ticket contra a média, taxa de cross-sell e especialização por escola |
| KPI "Matrículas no período" | Concentração da operação: quanto o primeiro colocado representa e risco de dependência |
| KPI "Alunos com mais de um curso" | Taxa de cross-sell do período |

### Marketing

| Onde | Leitura |
|---|---|
| KPI Investimento | Gasto por plataforma, custo por lead, custo por matrícula, retorno por real investido e conversão lead→matrícula |
| KPI Leads (mídia) | Alerta quando uma plataforma recebeu verba e devolveu zero conversões |
| KPI CPL | Comparativo de custo por matrícula entre as escolas e ressalva sobre atribuição |

### Funil & Perdas

| Onde | Leitura |
|---|---|
| Painel de perdas | Motivo mais frequente por escola, com a interpretação do que aquele motivo indica, e alerta de perdas sem motivo preenchido |

### Pipeline, Região, Jornada e SDR

| Onde | Leitura |
|---|---|
| Pipeline qualificado | Leads abertos, quanto está parado há mais de 14 dias e o tamanho da fila acumulada contra os leads novos do período |
| Leads por grupo de origem | Dispersão de conversão entre estados com volume relevante |
| Leads por canal de origem | Tempo entre criação do lead e matrícula, com a leitura sobre ciclo curto vs. follow-up estruturado |
| Leads recebidos (SDR) | Cobertura do agente sobre o total de leads |

O insight do SDR é deliberadamente diferente: com 6 leads em 1.445, qualquer taxa
oscila com um caso a mais ou a menos. Em vez de exibir percentuais frágeis, o
tooltip diz que a base é pequena e que o número relevante é a própria cobertura.
Abaixo de 30 leads no período, é sempre esse o texto.

### Guardas contra insight falso

Duas travas importantes, ambas motivadas por erros reais encontrados ao construir:

- **Base incompleta não vira tendência.** O período anterior só é usado para
  comparação se tiver ao menos 80% dos dias com dado, inclusive de Google.
  Sem isso, junho/2026 (com carga parcial do Google) produzia "+4.762% de
  investimento", número que não significava nada.
- **CPL por canal não é calculado a partir da origem.** Em jul/2026, 774 leads
  chegam marcados como `SITE` enquanto Meta e Google somam poucas dezenas, embora
  concentrem todo o investimento — o campo não separa tráfego pago de orgânico.
  Os cálculos usam investimento por conta, que é confiável, e o painel explica
  essa limitação no lugar de exibir um número inventado.

Quando não há base comparável, a frase é omitida em vez de inventar tendência.

## Aba Matrículas & Auditoria — duas seções

A aba é dividida de propósito, porque mistura duas atividades diferentes:

**Resultado do período** (análise) — KPIs por escola, matrículas por usuário, ranking
por curso e faturamento por forma de pagamento.

**Auditoria e conferência** — relatório nome a nome e o bloco de consistência, com os
cadastros que precisam de correção no Kommo antes do fechamento.

O separador entre as duas existe para que o gestor que quer o número não tropece na
conferência, e para que quem está conferindo não confunda alerta com resultado.

### Ranking por curso e forma de pagamento

Ambos seguem o **critério canônico** (etapa + DATA PAGAMENTO), então somam exatamente
o total da aba. O ranking por curso mostra o que foi *vendido*; o que foi *procurado*
e não converteu está na aba Origem, Canal & Região — a comparação entre os dois é
onde mora a decisão.

> **Atenção a uma duplicidade conhecida:** a aba Financeiro & Produto tem um bloco de
> mesmo nome que usa a base histórica daquela aba (fechamento do card + etapa atual),
> incluindo cadastros sem data de pagamento. Em jul/2026 ela conta 150 matrículas com
> 33 "(não informado)", contra 124 do critério conferido. Os dois blocos trazem nota
> explicando a diferença; unificar depende da mesma decisão pendente sobre a base da
> aba Vendedores.

## Orgânico (Instagram e Facebook)

Bloco **Alcance orgânico** no menu Marketing, alimentado pela edge function
`social-sync` (cron diário 06:25) e pela RPC `dashboard_social`.

Credenciais em `META_ORGANIC_SOURCES` no Vault: por escola, o `page_id`, o
`ig_id` e o token do usuário de sistema. **Não guardamos token de página** —
ele é derivado em execução via `GET /{page_id}?fields=access_token`.

### Mapa da API levantado empiricamente (04/08/2026)

A documentação do Meta está atrás da realidade; isto foi testado métrica a métrica.

| Instagram | Situação |
|---|---|
| `reach` | série diária, janelas de no máximo 30 dias |
| `follower_count` | série diária, **só os últimos 30 dias** |
| `profile_views`, `website_clicks`, `accounts_engaged`, `total_interactions` | exigem `metric_type=total_value`; devolvem agregado, não série |
| `impressions` | **removida** |

| Facebook (exige token DE PÁGINA) | Situação |
|---|---|
| `page_post_engagements`, `page_daily_follows`, `page_daily_follows_unique`, `page_views_total`, `page_total_actions` | funcionam |
| `page_impressions`, `page_fans`, `page_impressions_unique` | **removidas** |

Por isso a tabela `social_daily` é esparsa por natureza. **Coluna nula significa
"a plataforma não fornece mais", não "faltou sincronizar"** — e o painel escreve
*não fornecido* em vez de mostrar zero, que seria mentira.

## Auditoria e qualidade do dado

O painel foi auditado em 04/08/2026 (bateria em `supabase/migrations/20260804_auditoria_completa.sql`).
Três mecanismos mantêm o gestor protegido de número silenciosamente errado:

- **Pendências visíveis, nunca descarte mudo.** Matrícula sem data, com data
  inválida (ano errado, data sem ano) ou sem Registro de Atendimento aparece
  nomeada no bloco Consistência — com o valor digitado, para corrigir no Kommo.
- **Duas bases, aviso explícito.** Enquanto o ranking da aba Vendedores contar
  pela base antiga (que define faixa e comissão), um banner mostra a diferença
  por vendedor contra o critério conferido. Unificar depende de decisão da
  gestão, por alterar a base de comissionamento.
- **Datas implausíveis não entram.** Pagamento no futuro (>7 dias) é rejeitado
  na conversão e vira pendência; cartões criados retroativamente contam certo
  e entram como jornada zero, com nota no insight.

## Cursos e estados (aba Origem, Canal & Região)

Dois blocos alimentados pela RPC `dashboard_cursos(token, from, to)`.

**Cursos mais procurados x mais vendidos** — procura e venda na mesma linha, porque
a diferença entre as duas é o que interessa. *Procurado* conta os leads que
declararam interesse (campos de curso 1, 2 e 3); *vendido* são as matrículas do
período. A conversão só ganha cor a partir de 15 procuras: abaixo disso o
percentual oscila demais para significar algo.

Rótulos genéricos (`OUTROS CURSOS`, `NAO INFORMADO`) ficam fora do ranking e viram
um indicador próprio de qualidade de cadastro — em jul/2026, 44% dos leads da
Matrícula EAD e 27% do Ineprotec entram sem curso declarado.

**Estados que mais vendem** — matrículas, faturamento e ticket médio por UF. O
estado vem do DDD do telefone; sem telefone, a matrícula aparece como `(sem UF)`.

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

## Google Ads (edge function `google-ingest` + Google Ads Script)

A conta não tem developer token da Google Ads API nem assinatura ativa do
Supermetrics (o teste gratuito expirou em 29/07/2026). A integração usa
**Google Ads Scripts**: um script roda dentro da própria conta de anúncios,
com as permissões do usuário que autorizou, e envia as métricas por POST
para a edge function `google-ingest`. Sem OAuth, sem developer token, sem custo.

- Script para colar no Google Ads: [`docs/google-ads-script.js`](docs/google-ads-script.js)
- Instalar nas **duas** contas: INEPROTEC (`992-634-0346`) e Matrícula EaD (`250-021-2013`)
- Agendamento sugerido: diário, ~06:00
- A escola é definida pelo ID da conta, dentro da edge function. Conta não
  mapeada é **recusada** em vez de gravada com escola errada.
- Cada execução reenvia os últimos 7 dias, para capturar conversões que o
  Google credita retroativamente. O upsert é idempotente.
- Acompanhe em `sync_state`, chaves `google_ads_<id_da_conta>`.

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
