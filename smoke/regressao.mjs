import fs from "node:fs";
import { JSDOM } from "jsdom";

const alvo = process.argv[2];
const R = (p) => fs.readFileSync(p, "utf8");

const dom = new JSDOM(`<!doctype html><html><body><div id="root"></div></body></html>`, {
  runScripts: "outside-only", pretendToBeVisual: true, url: "https://local.test/",
});
const w = dom.window;
const erros = [];
w.addEventListener("error", (e) => erros.push(e.message));
w.console.error = (...a) => erros.push(a.join(" "));

w.EDILVO_ANON_KEY = "k";
w.fetch = async (url) => ({
  ok: true, status: 200,
  json: async () => {
    if (String(url).includes("data_freshness")) return { kommo: new Date().toISOString() };
    const CH = ["visao_geral","fechamentos","fechamentos_ant","visao_ant","serie_diaria","funil",
      "motivos_perda","perdas_por_origem","heatmap_perda","tempo_por_etapa","vendedores",
      "origens","campanhas","regioes","cursos","pagamentos","parados","faixas","vendedores_coorte"];
    if (/dashboard_comercial(_v3)?\b/.test(String(url))) {
      const o = { periodo: {} }; for (const k of CH) o[k] = []; return o;
    }
    return new Proxy({ periodo: {} }, { get: (t, k) => (k in t ? t[k] : (typeof k === "string" ? [] : undefined)) });
  },
});
w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
w.URL.createObjectURL = () => "blob:m"; w.URL.revokeObjectURL = () => {};

w.eval(R("node_modules/react/umd/react.production.min.js"));
w.eval(R("node_modules/react-dom/umd/react-dom.production.min.js"));
w.eval(R("node_modules/prop-types/prop-types.min.js"));
w.eval(`(function(){var n=["BarChart","Bar","XAxis","YAxis","Tooltip","ResponsiveContainer","LineChart","Line","Legend","CartesianGrid","LabelList"];var R={};n.forEach(function(k){R[k]=function S(p){return window.React.createElement("div",{"data-chart":k},p&&p.children?p.children:null)}});window.Recharts=R})();`);
w.eval(R(alvo));

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const clicar = (rot) => {
  const b = [...w.document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === rot);
  if (!b) return false;
  b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  return true;
};

await esperar(800);
const raiz = w.document.getElementById("root");

const MENUS = ["Home Executivo", "Comercial", "Marketing", "Marca & Reputação"];
const ABAS = ["Visão Geral", "Pipeline & Contato", "Origem, Canal & Região", "Jornada & Origem",
  "Metas & Comissões", "Vendedores", "Matrículas & Auditoria", "Funil & Perdas",
  "Agente SDR", "Financeiro & Produto"];

const visitados = [];
for (const m of MENUS) {
  if (!clicar(m)) continue;
  await esperar(250);
  visitados.push("menu:" + m);
  if (m === "Comercial") {
    for (const a of ABAS) {
      if (!clicar(a)) continue;
      await esperar(250);
      visitados.push("aba:" + a);
      if ((raiz.textContent || "").length < 50) erros.push(`aba ${a} renderizou vazia`);
    }
  }
}

console.log(`arquivo: ${alvo}`);
console.log(`telas visitadas: ${visitados.length}`);
console.log(visitados.join(" | "));
console.log(`erros: ${erros.length}`);
erros.slice(0, 6).forEach((e) => console.log("  - " + String(e).slice(0, 160)));
