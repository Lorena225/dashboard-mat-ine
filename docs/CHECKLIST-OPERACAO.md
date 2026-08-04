# Checklist de operação — Painel Edilvo

Rotina mínima para o painel continuar confiável.

## Diário (30 segundos)

Olhe o **cabeçalho do painel**. As três fontes — Kommo, Google, Meta — devem estar
com o ponto verde. Se alguma aparecer com o atraso escrito ao lado (ex.: `Google 8d`),
a integração parou e os números do período estão incompletos.

| Fonte | Atualiza | Se parar |
|---|---|---|
| Kommo | a cada 30 min, via cron | Verificar `sync_state` e a edge function `kommo-sync` |
| Google Ads | diário, ~06:00 | Conferir se o script segue agendado nas duas contas |
| Meta Ads | a cada 30 min, via cron | Campanha pausada não é falha: confirmar no Business Manager |

## Mensal, no fechamento

1. **Zerar as pendências de cadastro.** Aba Matrículas & Auditoria → bloco
   "Consistência do período". Os quatro indicadores devem estar em zero:
   - Sem Registro de Atendimento
   - Na etapa sem data de pagamento
2. **Conferir o relatório nominal** contra o controle da operação. Aba Vendedores,
   último bloco, ou Matrículas & Auditoria. O CSV abre direto no Excel.
3. **Fechar o mês antes de rodar comissão**, já que matrícula com cadastro pendente
   não entra na contagem.

## O que quebra o número, por ordem de frequência

1. **DATA PAGAMENTO MATRÍCULA em branco** — a matrícula não conta. Aparece como
   pendência no painel.
2. **Data digitada errada** — já apareceram `22/07/2027`, `31/07/20226` e `15/05`
   sem ano. O parser cobre os formatos comuns; o que for ambíguo vira pendência
   em vez de data errada.
3. **REGISTRO DE ATENDIMENTO em branco** — a matrícula conta para a escola, mas
   fica sem vendedor.
4. **Card na etapa errada** — matrícula fechada com o card em MATRÍCULA PERDIDA
   não é contabilizada.
5. **Lead duplicado** — o sistema deduplica (mesmo aluno, curso e data), mas o
   ideal é excluir a repetição no CRM.

## Ao mexer no código

```bash
npm install
npm run build          # source-app.jsx -> app.js + dist/
cd smoke && node test.mjs && node regressao.mjs ../dist/app.js
```

Nunca edite `app.js` à mão: ele é gerado. Depois do push, **confirme em
Vercel → Deployments que o estado ficou Ready** — push aceito pelo Git não
garante deploy concluído.
