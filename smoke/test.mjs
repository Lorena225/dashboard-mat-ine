import fs from "node:fs";
import { JSDOM } from "jsdom";

const R = (p) => fs.readFileSync(p, "utf8");
const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  runScripts: "outside-only", pretendToBeVisual: true, url: "https://local.test/",
});
const w = dom.window;

// Payload da RPC nova (formato real de dashboard_matriculas)
const MAT = {
  periodo: { from: "2026-07-01T00:00:00+00:00", to: "2026-08-01T00:00:00+00:00" },
  por_escola: [
    { escola: "ineprotec", leads: 78, matriculas: 78.0, faturamento: 181166, ticket_medio: 2322.64 },
    { escola: "matricula_ead", leads: 46, matriculas: 46.0, faturamento: 104604, ticket_medio: 2274.0 },
  ],
  por_atendente: [
    { atendente: "INE - JESSICA ALVES", escola_atendente: "ineprotec", matriculas: 48.0, leads: 48, faturamento: 120670, compartilhadas: 0, ticket_medio: 2513.96 },
    { atendente: "MAT - BRUNA PEREIRA", escola_atendente: "matricula_ead", matriculas: 29.5, leads: 30, faturamento: 65765, compartilhadas: 1, ticket_medio: 2192.17 },
    { atendente: "(sem registro de atendimento)", escola_atendente: null, matriculas: 2.0, leads: 2, faturamento: 5113, compartilhadas: 0, ticket_medio: 2556.5 },
  ],
  por_atendente_escola: [
    { atendente: "INE - JESSICA ALVES", escola: "ineprotec", matriculas: 43.0, faturamento: 108000 },
    { atendente: "MAT - BRUNA PEREIRA", escola: "matricula_ead", matriculas: 29.0, faturamento: 63000 },
  ],
  lista: [
    { lead_id: 34353712, aluno: "MAIK MATHEUS XAVIER DIAS DE MOURA", escola: "ineprotec", atendente: "INE - MARCELA RABELO", escola_atendente: "ineprotec", atendentes_no_lead: 1, credito: 1.0, valor: 2400, valor_credito: 2400, curso: "Técnico em Enfermagem", data_matricula: "2026-07-31T17:40:55+00:00", base_data: "Entrada em MATRICULA REALIZADA", divergencia_escola: false },
    { lead_id: 34261482, aluno: "RENATO DE SOUZA MONTEIRO", escola: "matricula_ead", atendente: "MAT - BRUNA PEREIRA", escola_atendente: "matricula_ead", atendentes_no_lead: 2, credito: 0.5, valor: 2200, valor_credito: 1100, curso: null, data_matricula: "2026-07-31T17:29:31+00:00", base_data: "DATA DO PAGAMENTO", divergencia_escola: false },
    { lead_id: 34174236, aluno: "ARIELA CARRARO", escola: "ineprotec", atendente: "(sem registro de atendimento)", escola_atendente: null, atendentes_no_lead: 1, credito: 1.0, valor: 2513, valor_credito: 2513, curso: "Radiologia", data_matricula: "2026-07-31T11:32:12+00:00", base_data: "Fechamento do lead", divergencia_escola: false },
  ],
  diagnostico: { total_matriculas: 124.0, total_leads: 124, por_data_pagamento: 0, por_entrada_status: 105, por_fechamento: 19, sem_atendente: 2, compartilhadas: 1, divergencia_escola: 8 },
};

const erros = [];
w.addEventListener("error", (e) => erros.push("window.error: " + e.message));
w.console.error = (...a) => erros.push("console.error: " + a.join(" "));

w.EDILVO_ANON_KEY = "test-key";
w.fetch = async (url) => ({
  ok: true,
  status: 200,
  json: async () => {
    if (String(url).includes("dashboard_matriculas")) return MAT;
    if (String(url).includes("data_freshness")) return { kommo: new Date().toISOString() };
    // As demais RPCs nao sao o alvo do teste.
    // dashboard_comercial e _v3 sofrem spread ({...j}) no app, entao precisam ser
    // objetos reais. Os outros payloads nao sao copiados: um Proxy tolerante
    // resolve qualquer chave que o componente venha a acessar.
    const CHAVES = ["visao_geral","fechamentos","fechamentos_ant","visao_ant","serie_diaria",
      "funil","motivos_perda","perdas_por_origem","heatmap_perda","tempo_por_etapa",
      "vendedores","origens","campanhas","regioes","cursos","pagamentos","parados",
      "faixas","vendedores_coorte"];
    if (/dashboard_comercial(_v3)?\b/.test(String(url))) {
      const o = { periodo: {} };
      for (const k of CHAVES) o[k] = [];
      return o;
    }
    return new Proxy({ periodo: {} }, {
      get: (t, k) => (k in t ? t[k] : (typeof k === "string" ? [] : undefined)),
    });
  },
});
w.matchMedia = w.matchMedia || (() => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
w.URL.createObjectURL = () => "blob:mock";
w.URL.revokeObjectURL = () => {};

const run = (code, nome) => {
  try { w.eval(code); } catch (e) { erros.push(`${nome}: ${e.message}`); }
};

run(R("node_modules/react/umd/react.production.min.js"), "react");
run(R("node_modules/react-dom/umd/react-dom.production.min.js"), "react-dom");
run(R("node_modules/prop-types/prop-types.min.js"), "prop-types");
// O Recharts nao funciona sob jsdom (depende de medicao de layout) e derruba o
// render tanto no app.js original quanto no novo. Como a aba Matriculas nao usa
// grafico algum, trocamos por stubs. Precisam ser propriedades reais do objeto:
// o interop __toESM do esbuild copia ownKeys, entao um Proxy vazio viraria undefined.
w.eval(`(function () {
  var nomes = ["BarChart","Bar","XAxis","YAxis","Tooltip","ResponsiveContainer",
    "LineChart","Line","Legend","CartesianGrid","LabelList","PieChart","Pie","Cell",
    "AreaChart","Area","ComposedChart","Scatter","ScatterChart","RadialBarChart",
    "RadialBar","PolarGrid","PolarAngleAxis","Radar","RadarChart","ReferenceLine"];
  var R = {};
  nomes.forEach(function (n) {
    R[n] = function Stub(props) {
      return window.React.createElement("div", { "data-chart": n },
        props && props.children ? props.children : null);
    };
  });
  window.Recharts = R;
})();`);

if (!w.React || !w.ReactDOM || !w.Recharts) {
  console.log("FALHA: globais UMD ausentes ->", { React: !!w.React, ReactDOM: !!w.ReactDOM, Recharts: !!w.Recharts });
  process.exit(1);
}

run(R("../app.js"), "app.js");

await new Promise((r) => setTimeout(r, 900));

const root = w.document.getElementById("root");
const txt = root.textContent || "";

const clicar = (rotulo) => {
  const b = [...w.document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === rotulo);
  if (!b) return false;
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  return true;
};

const passos = [];
passos.push(["montou o app", root.children.length > 0]);
passos.push(["renderizou conteúdo", txt.length > 200]);

const okComercial = clicar("Comercial");
await new Promise((r) => setTimeout(r, 400));
passos.push(["abriu o menu Comercial", okComercial]);

const okAba = clicar("Matrículas & Auditoria");
await new Promise((r) => setTimeout(r, 600));
passos.push(["abriu a aba Matrículas & Auditoria", okAba]);

const t2 = root.textContent || "";
passos.push(["mostrou o aviso de base provisória", /DATA DO PAGAMENTO ainda não sincronizado/.test(t2)]);
passos.push(["listou atendentes", /JESSICA ALVES/.test(t2) && /BRUNA PEREIRA/.test(t2)]);
passos.push(["trouxe o relatório nominal", /MAIK MATHEUS/.test(t2) && /ARIELA CARRARO/.test(t2)]);
passos.push(["sinalizou matrícula dividida", /0,5/.test(t2)]);
passos.push(["sinalizou lead sem atendimento", /sem registro de atendimento/.test(t2)]);
passos.push(["ofereceu exportação CSV", /Baixar CSV/.test(t2)]);

let falhou = false;
for (const [nome, ok] of passos) {
  console.log(`${ok ? "  ok  " : " FALHA"}  ${nome}`);
  if (!ok) falhou = true;
}
if (erros.length) {
  console.log("\nErros capturados:");
  erros.slice(0, 10).forEach((e) => console.log("  - " + e));
  falhou = true;
}
console.log(falhou ? "\nRESULTADO: FALHOU" : "\nRESULTADO: PASSOU");
process.exit(falhou ? 1 : 0);
