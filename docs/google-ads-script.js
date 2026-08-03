/**
 * Painel Edilvo — envio diário do Google Ads para o Supabase
 * VirtruvIA · agosto/2026
 *
 * COMO USAR
 *   1. No Google Ads: Ferramentas → Ações em massa → Scripts → "+"
 *   2. Cole este arquivo inteiro, dê um nome (ex.: "Envio Painel Edilvo")
 *   3. Clique em "Autorizar" e depois em "Visualizar" para testar
 *   4. Salve e agende: Frequência = Diariamente, por volta das 06:00
 *   5. Repita nas DUAS contas (INEPROTEC e Matrícula EaD) — o script
 *      identifica sozinho de qual conta veio, pelo ID.
 *
 * POR QUE ASSIM
 *   Roda dentro da própria conta de anúncios, com as permissões do usuário
 *   que autorizou. Não precisa de developer token da Google Ads API, nem de
 *   OAuth, nem do Supermetrics. Sem custo.
 *
 * REPROCESSAR UM PERÍODO
 *   Ajuste DIAS_PARA_TRAS abaixo (máx. ~90), rode manualmente uma vez e
 *   devolva ao valor original. O envio é idempotente: reenviar a mesma data
 *   atualiza a linha em vez de duplicar.
 */

// ── Configuração ──────────────────────────────────────────────────────────
var ENDPOINT = 'https://svmxlhhsgvbhjpcdhnhy.supabase.co/functions/v1/google-ingest';
var TOKEN    = 'ba37d3f35fb8c1dbef36184f0c0c1afc157dde7b';

// Janela reenviada a cada execução. 7 dias cobre ajustes retroativos que o
// Google faz nos números dos dias anteriores (conversões que chegam atrasadas).
var DIAS_PARA_TRAS = 7;

var LOTE = 400;   // linhas por requisição
// ──────────────────────────────────────────────────────────────────────────

function main() {
  var conta = AdsApp.currentAccount();
  var contaId = conta.getCustomerId();

  var ate = diasAtras(1);            // ontem: o dia corrente ainda está aberto
  var de  = diasAtras(DIAS_PARA_TRAS);

  Logger.log('Conta %s (%s) — período %s a %s',
             contaId, conta.getName(), de, ate);

  var linhas = coletar(de, ate);
  Logger.log('Linhas coletadas: %s', linhas.length);

  if (linhas.length === 0) {
    Logger.log('Nada a enviar. Se não era esperado, confira se houve veiculação no período.');
    return;
  }

  var enviadas = 0, gravadas = 0;
  for (var i = 0; i < linhas.length; i += LOTE) {
    var lote = linhas.slice(i, i + LOTE);
    var r = enviar(contaId, lote);
    enviadas += lote.length;
    gravadas += (r && r.gravadas) || 0;
  }

  Logger.log('Concluído: %s linhas enviadas, %s gravadas no painel.', enviadas, gravadas);
}

/** Lê as métricas diárias por campanha via GAQL. */
function coletar(de, ate) {
  var query =
    'SELECT campaign.id, campaign.name, segments.date, ' +
    '       metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM campaign ' +
    'WHERE segments.date BETWEEN "' + de + '" AND "' + ate + '" ' +
    '  AND metrics.impressions > 0';

  var linhas = [];
  var it = AdsApp.search(query, { apiVersion: 'v18' });

  while (it.hasNext()) {
    var row = it.next();
    linhas.push({
      date:          row.segments.date,
      campaign_id:   String(row.campaign.id),
      campaign_name: row.campaign.name,
      // cost_micros vem em milionésimos da moeda da conta
      spend:         Number(row.metrics.costMicros || 0) / 1000000,
      impressions:   Number(row.metrics.impressions || 0),
      clicks:        Number(row.metrics.clicks || 0),
      conversions:   Number(row.metrics.conversions || 0)
    });
  }
  return linhas;
}

/** POST de um lote. Erro de rede não derruba a execução inteira. */
function enviar(contaId, linhas) {
  var opcoes = {
    method: 'POST',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({ account_id: contaId, rows: linhas })
  };

  try {
    var resp = UrlFetchApp.fetch(ENDPOINT + '?token=' + TOKEN, opcoes);
    var codigo = resp.getResponseCode();
    var corpo  = resp.getContentText();

    if (codigo !== 200) {
      Logger.log('ERRO HTTP %s: %s', codigo, corpo);
      return null;
    }
    var json = JSON.parse(corpo);
    if (json.ignoradas) {
      Logger.log('Aviso: %s linha(s) descartadas por data ou campanha ausente.', json.ignoradas);
    }
    return json;
  } catch (e) {
    Logger.log('ERRO ao enviar lote: %s', e);
    return null;
  }
}

/** Data de N dias atrás, no fuso da conta, no formato YYYY-MM-DD. */
function diasAtras(n) {
  var d = new Date();
  d.setDate(d.getDate() - n);
  return Utilities.formatDate(d, AdsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
}
