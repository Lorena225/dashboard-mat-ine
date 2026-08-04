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
  // Nome normalizado (mesmo da aba Vendedores) para os dois recortes casarem.
  por_vendedor: [
    { vendedor: "Jessica Alves Torres", matriculas: 48.0, leads: 48, faturamento: 120670, compartilhadas: 0,
      escolas: { ineprotec: { matriculas: 43.0, faturamento: 108000 }, matricula_ead: { matriculas: 5.0, faturamento: 12670 } } },
    { vendedor: "Pedro Henrique Reis dos Santos", matriculas: 6, leads: 6, faturamento: 13508, compartilhadas: 0,
      multi_curso: 0, escolas: {} },
    { vendedor: "Bruna Pereira Benevides", matriculas: 29.5, leads: 30, faturamento: 65765, compartilhadas: 1,
      escolas: { matricula_ead: { matriculas: 28.5, faturamento: 63000 } } },
  ],
  // Usuarios atendem as duas escolas: a quebra vem aninhada em `escolas`.
  por_atendente: [
    { atendente: "INE - JESSICA ALVES", matriculas: 48.0, leads: 48, faturamento: 120670, compartilhadas: 0, ticket_medio: 2513.96,
      escolas: { ineprotec: { matriculas: 43.0, faturamento: 108000 }, matricula_ead: { matriculas: 5.0, faturamento: 12670 } } },
    { atendente: "MAT - BRUNA PEREIRA", matriculas: 29.5, leads: 30, faturamento: 65765, compartilhadas: 1, ticket_medio: 2192.17,
      escolas: { matricula_ead: { matriculas: 28.5, faturamento: 63000 }, ineprotec: { matriculas: 1.0, faturamento: 2765 } } },
    { atendente: "(sem registro de atendimento)", matriculas: 2.0, leads: 2, faturamento: 5113, compartilhadas: 0, ticket_medio: 2556.5,
      escolas: { ineprotec: { matriculas: 2.0, faturamento: 5113 } } },
  ],
  lista: [
    { lead_id: 34353712, aluno: "MAIK MATHEUS XAVIER DIAS DE MOURA", escola: "ineprotec", atendente: "INE - MARCELA RABELO", vendedor: "Marcela Rabelo do Carmo", atendentes_no_lead: 1, credito: 1.0, valor: 2400, valor_credito: 2400, curso: "Tecnico em Enfermagem", cursos_no_lead: 1, data_matricula: "2026-07-31T17:40:55+00:00", base_data: "Entrada em MATRICULA REALIZADA" },
    { lead_id: 34261482, aluno: "RENATO DE SOUZA MONTEIRO", escola: "matricula_ead", atendente: "MAT - BRUNA PEREIRA", vendedor: "Bruna Pereira Benevides", atendentes_no_lead: 2, credito: 0.5, valor: 2200, valor_credito: 1100, curso: "Tecnico em Mineracao", cursos_no_lead: 2, data_matricula: "2026-07-31T17:29:31+00:00", base_data: "DATA PAGAMENTO MATRICULA" },
    { lead_id: 34174236, aluno: "ARIELA CARRARO", escola: "ineprotec", atendente: "(sem registro de atendimento)", vendedor: "(sem registro de atendimento)", atendentes_no_lead: 1, credito: 1.0, valor: 2513, valor_credito: 2513, curso: "Radiologia", cursos_no_lead: 1, data_matricula: "2026-07-31T11:32:12+00:00", base_data: "Fechamento do lead" },
  ],
  diagnostico: { total_matriculas: 121.0, total_leads: 113, alunos_multi_curso: 8,
    matriculas_multi_curso: 16, sem_atendente: 1, compartilhadas: 0, sem_curso: 0,
    sem_data_pagamento: 2, data_invalida: 1, sucesso_sem_data: 27, sem_forma_pagamento: 5 },
  pendencias: [{ id: 1, name: "ALUNO SEM DATA A", school: "ineprotec" },
               { id: 2, name: "ALUNO SEM DATA B", school: "matricula_ead" }],
  pendencias_data: [{ id: 9, name: "ALUNA ANO ERRADO", school: "matricula_ead", valor: "08/06/2027" }],
  pendencias_forma: [
    { id: 21, name: "ARNALDO SANTOS SOUZA JUNIOR", school: "matricula_ead",
      curso: "TECNICO EM AGRICULTURA", valor: 2804, atendente: "PEDRO HENRIQUE" },
  ],
  pendencias_registro: [
    { id: 22, name: "LUIS HENRIQUE FONSECA", school: "ineprotec", curso: "TECNICO EM ELETROMECANICA" },
  ],
  por_curso: [
    { curso: "TECNICO EM AGRIMENSURA", escola: "ineprotec", matriculas: 26, faturamento: 64637, ticket_medio: 2486 },
    { curso: "ESP. TEC. EM GEORREFERENCIAMENTO", escola: "ineprotec", matriculas: 21, faturamento: 38000, ticket_medio: 1809 },
    { curso: "TECNICO EM ELETROTECNICA", escola: "ineprotec", matriculas: 11, faturamento: 22903, ticket_medio: 2082 },
    { curso: "TECNICO EM ELETROTECNICA", escola: "matricula_ead", matriculas: 3, faturamento: 4643, ticket_medio: 1548 },
    { curso: "TECNICO EM MINERACAO", escola: "matricula_ead", matriculas: 9, faturamento: 21949, ticket_medio: 2439 },
    { curso: "TECNICO EM ELETROMECANICA", escola: "ineprotec", matriculas: 8, faturamento: 20080, ticket_medio: 2510 },
    { curso: "TECNICO EM AGRICULTURA", escola: "matricula_ead", matriculas: 7, faturamento: 16594, ticket_medio: 2371 },
    { curso: "TECNICO EM SEGURANCA DO TRABALHO", escola: "matricula_ead", matriculas: 7, faturamento: 12614, ticket_medio: 1802 },
    { curso: "POS EM GEORREFERENCIAMENTO", escola: "ineprotec", matriculas: 6, faturamento: 13187, ticket_medio: 2198 },
    { curso: "TECNICO EM QUIMICA", escola: "matricula_ead", matriculas: 6, faturamento: 16346, ticket_medio: 2724 },
    { curso: "SUPLETIVO EJA MEDIO", escola: "matricula_ead", matriculas: 5, faturamento: 6504, ticket_medio: 1301 },
    { curso: "TECNICO EM ACUCAR E ALCOOL", escola: "matricula_ead", matriculas: 3, faturamento: 6066, ticket_medio: 2022 },
    { curso: "TECNICO EM AGROPECUARIA", escola: "matricula_ead", matriculas: 2, faturamento: 4438, ticket_medio: 2219 },
  ],
  por_forma: [
    { forma: "BOLETO PARCELADO", escola: "ineprotec", matriculas: 32, faturamento: 85565, ticket_medio: 2674 },
    { forma: "PIX", escola: "ineprotec", matriculas: 24, faturamento: 44441, ticket_medio: 1852 },
    { forma: "(sem forma)", escola: "matricula_ead", matriculas: 5, faturamento: 10218, ticket_medio: 2044 },
  ],
  insights: {
    concentracao: "Jessica Alves concentra 40% das matrículas; os dois primeiros somam 65%.",
    cross_sell: "8 de 116 alunos levaram mais de um curso (7%).",
    por_escola: {
      ineprotec: "79 matrículas contra 55 no período anterior (+44%).",
      matricula_ead: "45 matrículas contra 38 no período anterior (+18%).",
    },
    por_atendente: {
      "JESSICA ALVES": "Responde por 40% das matrículas do período. Ticket 7% acima da média.",
      "BRUNA PEREIRA": "Responde por 26% das matrículas do período.",
    },
  },
};

// BASE=canonico simula o periodo inteiro datado por DATA PAGAMENTO MATRICULA
// (estado de jul/2026 em producao). Sem a variavel, testa a base provisoria.
const CANONICO = process.env.BASE === "canonico";
if (CANONICO) {
  MAT.diagnostico = { total_matriculas: 116.0, total_leads: 116, por_data_pagamento: 116,
    por_entrada_status: 0, por_fechamento: 0, sem_atendente: 2, compartilhadas: 0 };
  MAT.lista = MAT.lista.map((r) => ({ ...r, base_data: "DATA PAGAMENTO MATRICULA" }));
}

const erros = [];
w.addEventListener("error", (e) => erros.push("window.error: " + e.message));
w.console.error = (...a) => erros.push("console.error: " + a.join(" "));

w.EDILVO_ANON_KEY = "test-key";
w.fetch = async (url, opts) => ({
  ok: true,
  status: 200,
  json: async () => {
    if (String(url).includes("dashboard_matriculas")) return MAT;
    if (String(url).includes("dashboard_canal")) {
      // o canal vem no corpo do POST da RPC
      const meta = /"p_channel"\s*:\s*"meta"/.test(String(opts?.body || ""));
      return meta ? {
        canal: "meta",
        por_escola: [{ school: "matricula_ead", gasto: 3472.59, impressoes: 74858, alcance: 63786,
          cliques: 1095, cliques_link: 875, conversoes: 0, campanhas: 2, ctr: 1.46,
          cpc: 3.17, cpm: 46.39, custo_conversao: null, frequencia: 1.17 }],
        campanhas: [{ school: "matricula_ead", campaign_id: "1", campaign_name: "BY | Engajamento - WhatsApp",
          gasto: 3255.51, impressoes: 71782, alcance: 61000, cliques: 1018, conversoes: 0,
          ctr: 1.42, cpc: 3.2, custo_conversao: null }],
        serie: [{ date: "2026-07-01", school: "matricula_ead", gasto: 120, cliques: 40, conversoes: 0 },
                { date: "2026-07-02", school: "matricula_ead", gasto: 140, cliques: 50, conversoes: 0 }],
      } : {
        canal: "google",
        por_escola: [{ school: "ineprotec", gasto: 4055.56, impressoes: 20659, alcance: 0,
          cliques: 1827, cliques_link: 0, conversoes: 129, campanhas: 3, ctr: 8.84,
          cpc: 2.22, cpm: 196.31, custo_conversao: 31.44, frequencia: null }],
        campanhas: [{ school: "ineprotec", campaign_id: "g1", campaign_name: "INE | Pesquisa | Agrimensura",
          gasto: 2000, impressoes: 10000, alcance: 0, cliques: 900, conversoes: 70,
          ctr: 9.0, cpc: 2.22, custo_conversao: 28.57 }],
        serie: [{ date: "2026-07-01", school: "ineprotec", gasto: 130, cliques: 60, conversoes: 5 },
                { date: "2026-07-02", school: "ineprotec", gasto: 150, cliques: 70, conversoes: 6 }],
      };
    }
    if (String(url).includes("dashboard_social")) return {
      resumo: [
        { school: "ineprotec", network: "instagram", handle: "ineprotec", seguidores: 6633,
          publicacoes: 374, alcance: 9633, novos: 18, engajamento: 91, visitas: 200,
          cliques: 29, dias: 31, alcance_ant: 8100, novos_ant: 12 },
        { school: "matricula_ead", network: "instagram", handle: "matricula_ead", seguidores: 6911,
          publicacoes: 300, alcance: 51402, novos: 31, engajamento: 227, visitas: 174,
          cliques: 16, dias: 31, alcance_ant: 40000, novos_ant: 20 },
        { school: "ineprotec", network: "facebook", handle: "Ineprotec - Escola Técnica",
          seguidores: 785, alcance: null, novos: 1, engajamento: 433, visitas: 172,
          cliques: null, dias: 31 },
      ],
      posts: [
        { id: "ig_1", school: "ineprotec", network: "instagram", posted_at: "2026-07-15T12:00:00+0000",
          tipo: "CAROUSEL_ALBUM", permalink: "https://instagram.com/p/x", legenda: "Escolher uma instituição de ensino",
          curtidas: 84, comentarios: 6, compart: 0, interacoes: 90 },
      ],
      cadencia: [{ school: "ineprotec", network: "instagram", publicados: 8, por_semana: 1.8 }],
    };
    if (String(url).includes("dashboard_marketing_resumo")) return {
      por_escola: [
        { school: "ineprotec", investimento: 4614.35, orcamento: 2500, leads: 626,
          matriculas: 79, receita: 167993, meta_leads: 450, meta_matriculas: 45,
          meta_receita: 115000, custo_por_lead: 7.37, custo_por_matricula: 58.41,
          retorno_por_real: 36.41, conversao: 12.6 },
        { school: "matricula_ead", investimento: 8945.2, orcamento: 6000, leads: 819,
          matriculas: 45, receita: 94215, meta_leads: 700, meta_matriculas: 55,
          meta_receita: 125000, custo_por_lead: 10.92, custo_por_matricula: 198.78,
          retorno_por_real: 10.53, conversao: 5.5 },
      ],
    };
    if (String(url).includes("dashboard_cursos")) return {
      cursos: [
        { curso: "TECNICO EM ELETROTECNICA", escola: "ineprotec", procurado: 184, vendido: 11, conversao: 6.0, faturamento: 22903 },
        { curso: "TECNICO EM SEGURANCA DO TRABALHO", escola: "matricula_ead", procurado: 159, vendido: 6, conversao: 3.8, faturamento: 10456 },
        { curso: "TECNICO EM AGRIMENSURA", escola: "ineprotec", procurado: 140, vendido: 26, conversao: 18.6, faturamento: 64637 },
        { curso: "ESP. TEC. EM GEORREFERENCIAMENTO", escola: "ineprotec", procurado: 46, vendido: 21, conversao: 45.7, faturamento: 38000 },
      ],
      estados: [
        { uf: "SP", escola: "matricula_ead", matriculas: 22, faturamento: 48301 },
        { uf: "MG", escola: "ineprotec", matriculas: 20, faturamento: 44122 },
      ],
      sem_curso: { ineprotec: { leads: 174, pct: 27.5 }, matricula_ead: { leads: 359, pct: 44.2 } },
    };
    if (String(url).includes("dashboard_insights")) return {
      matriculas: MAT.insights,
      marketing: {
        por_escola: {
          ineprotec: "Investimento de R$ 4.614 no período. Custo por matrícula R$ 58,41.",
          matricula_ead: "Investimento de R$ 8.945 no período. Custo por matrícula R$ 198,78.",
        },
        comparativo: "Custo por matrícula: R$ 198,78 na Matrícula EAD contra R$ 58,41 na Ineprotec.",
        rastreio: "O Meta recebeu R$ 4.031 no período mas devolveu zero conversões registradas.",
        atribuicao: "774 leads do período estão marcados como SITE.",
      },
      pipeline: { por_escola: {
        ineprotec: "10.183 leads abertos, 91,3% sem movimentação há mais de 14 dias.",
        matricula_ead: "27.149 leads abertos, 94,7% sem movimentação há mais de 14 dias." } },
      regiao: { dispersao: "SC converte 8,9% e PR converte 2,2% — 4,1x de diferença." },
      jornada: { por_escola: {
        ineprotec: "Metade fecha em até 0 dia(s). Ciclo curto.",
        matricula_ead: "Metade fecha em até 2 dia(s)." } },
      sdr: { cobertura: "O agente recebeu 6 leads dos 1.445 gerados no período (0,4%)." },
      funil: {
        por_escola: { matricula_ead: "179 perdas no período. O motivo mais frequente é CURSO NAO ENCONTRADO." },
        sem_motivo: { matricula_ead: "12% das perdas estão sem motivo preenchido." },
      },
    };
    if (String(url).includes("data_freshness")) {
      const d = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
      return {
        kommo: new Date().toISOString(),
        google: d(1), meta: d(4), social: d(0),
        status: {
          google: { status: "ok", dias: 1, ultimo_gasto: d(1) },
          meta: { status: "pausado", dias: 4, ultimo_gasto: d(7) },
        },
      };
    }
    // essas duas abas so renderizam com linhas; sem elas caem em Placeholder
    if (String(url).includes("dashboard_sdr")) return {
      resumo: [{ school: "ineprotec", leads_recebidos: 5, em_triagem_agora: 0, leads_processados: 5,
                 matriculas_diretas: 0, p_atendimento_humano: 5, convertidos_por_humano: 0,
                 horas_medias_triagem: 11.6, perdas: 0, retornos: 0, sem_resposta: 0,
                 receita_direta: 0, receita_pos_handoff: 0 }],
      serie: [], destinos: [],
    };
    if (String(url).includes("dashboard_pipeline")) return {
      etapas: [{ school: "ineprotec", etapa: "Negociação", qtd: 12, valor: 30000, sort: 1 }],
      resumo: [{ school: "ineprotec", qualificado: 120, forecast: 50000, sem_resposta: 30 }],
      aging: [], contactabilidade: [], forecast: [],
    };
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
      if (/_v3/.test(String(url))) {
        // base antiga divergindo do canonico, para acionar o aviso de duas bases
        o.vendedores = [
          { vendedor: "Jessica Alves Torres", school: "ineprotec", matriculas: 46, matr_total: 46,
            leads_atribuidos: 78, perdas: 0, faixa_nome: "Super Meta", comissao: 1327,
            faturamento: 104526, ticket_medio: 2272, dias_fechamento: 9.6, falta_proxima: null, generico: false },
          { vendedor: "Pedro Henrique Reis dos Santos", school: "matricula_ead", matriculas: 10, matr_total: 10,
            leads_atribuidos: 30, perdas: 0, faixa_nome: "Base", comissao: 70,
            faturamento: 22438, ticket_medio: 2243, dias_fechamento: 5.2, falta_proxima: 5, generico: false },
        ];
      }
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
passos.push(["explicou a regra de contagem por curso",
  /Critério conferido contra a planilha/.test(t2) && /A unidade contada é o/.test(t2)]);
passos.push(["marcou aluno com mais de um curso", /2 cursos/.test(t2)]);
passos.push(["mostrou o curso como propriedade da matrícula",
  /Tecnico em Mineracao/.test(t2) && /Radiologia/.test(t2)]);
// os insights ficam em atributos title (hover), nao no texto visivel
const titulos = [...w.document.querySelectorAll("[title]")].map((e) => e.getAttribute("title") || "");
passos.push(["trouxe insight de concentração no hover",
  titulos.some((t) => /concentra 40% das matrículas/.test(t))]);
passos.push(["trouxe insight por escola no hover",
  titulos.some((t) => /79 matrículas contra 55/.test(t))]);
passos.push(["trouxe insight por atendente no hover",
  titulos.some((t) => /Ticket 7% acima da média/.test(t))]);
passos.push(["manteve a definição junto do insight",
  titulos.some((t) => /uma matrícula por curso/.test(t) && /concentra 40%/.test(t))]);
// O Recharts esta stubado neste teste (ver topo do arquivo), entao o SVG nunca
// existe. Validamos o que e codigo nosso: a legenda do grafico e o alternador.
passos.push(["montou o bloco do gráfico de cursos",
  /Top 10 cursos/.test(t2) && /empilhadas por escola/.test(t2)]);
passos.push(["ofereceu alternar entre volume e faturamento",
  /Por matrículas/.test(t2) && /Por faturamento/.test(t2)]);
passos.push(["trouxe o ranking de matrículas por curso",
  /Matrículas por curso/.test(t2) && /TECNICO EM AGRIMENSURA/.test(t2)]);
passos.push(["trouxe o faturamento por forma de pagamento",
  /Faturamento por forma de pagamento/.test(t2) && /BOLETO PARCELADO/.test(t2)]);
passos.push(["separou análise de auditoria",
  /Auditoria e conferência/.test(t2)]);
passos.push(["alertou matrícula sem forma de pagamento com nome",
  /Sem forma de pagamento preenchida/.test(t2) && /ARNALDO SANTOS SOUZA JUNIOR/.test(t2)]);
passos.push(["alertou matrícula sem Registro de Atendimento com nome",
  /Sem Registro de Atendimento/.test(t2) && /LUIS HENRIQUE FONSECA/.test(t2)]);
passos.push(["contou os cards do funil do aluno sem data",
  /No funil do aluno sem data/.test(t2) && /27/.test(t2)]);
passos.push(["mostrou a pendência de data inválida com o valor digitado",
  /Data de pagamento que não converte/.test(t2) && /08\/06\/2027/.test(t2) && /ALUNA ANO ERRADO/.test(t2)]);
passos.push(["alertou sobre matrículas fora da contagem",
  /não estão sendo contadas/.test(t2) && /ALUNO SEM DATA A/.test(t2)]);
passos.push(["listou atendentes", /JESSICA ALVES/.test(t2) && /BRUNA PEREIRA/.test(t2)]);
passos.push(["trouxe o relatório nominal", /MAIK MATHEUS/.test(t2) && /ARIELA CARRARO/.test(t2)]);
passos.push(["sinalizou matrícula dividida", /0,5/.test(t2)]);
passos.push(["sinalizou lead sem atendimento", /sem registro de atendimento/.test(t2)]);
passos.push(["ofereceu exportação CSV", /Baixar CSV/.test(t2)]);
passos.push(["abriu o total do usuário por escola", /Matrículas por usuário/.test(t2)]);
// Jessica: 5 na Matricula EAD + 43 no Ineprotec = 48. Conferido celula a celula,
// porque o textContent da linha concatena os numeros ("5"+"43"+"48" -> "54348").
const linhaDe = (nome) => {
  const tr = [...w.document.querySelectorAll("table tr")]
    .find((x) => (x.querySelector("td") || {}).textContent === nome);
  return tr ? [...tr.querySelectorAll("td")].map((c) => (c.textContent || "").trim()) : null;
};
const jes = linhaDe("INE - JESSICA ALVES");
const bru = linhaDe("MAT - BRUNA PEREIRA");
passos.push(["abriu a quebra por escola de cada usuário",
  !!jes && jes[1] === "5" && jes[2] === "43" && jes[3] === "48"]);
passos.push(["rateou a matrícula dividida no total do usuário",
  !!bru && bru[1] === "28,5" && bru[2] === "1" && bru[3] === "29,5"]);
passos.push(["não classificou usuário por prefixo", !/escola do atendente/i.test(t2)]);

const okVend = clicar("Vendedores");
await new Promise((r) => setTimeout(r, 600));
const t3 = root.textContent || "";
passos.push(["abriu a aba Vendedores", okVend]);
{
  const tv = root.textContent || "";
  passos.push(["avisou sobre as duas bases de contagem",
    /Duas bases de contagem/.test(tv) && /Jessica/.test(tv) && /Pedro/.test(tv)]);
}
passos.push(["trouxe o relatório para o fim da aba Vendedores", /Matrículas por vendedor · detalhe/.test(t3)]);
passos.push(["agrupou pelo nome normalizado do vendedor",
  /Jessica Alves Torres/.test(t3) && /Bruna Pereira Benevides/.test(t3)]);
passos.push(["manteve os nomes dos alunos no relatório", /MAIK MATHEUS/.test(t3)]);
// o relatorio precisa ser o ultimo bloco: nada de painel depois dele
const paineis = [...w.document.querySelectorAll("h2")].map((h) => (h.textContent || "").trim());
passos.push(["posicionou o relatório como último bloco da página",
  /Matrículas por vendedor/.test(paineis[paineis.length - 1] || "")]);

const okFunil = clicar("Funil & Perdas");
await new Promise((r) => setTimeout(r, 450));
const tf = [...w.document.querySelectorAll("[title]")].map((e) => e.getAttribute("title") || "");
passos.push(["abriu a aba Funil & Perdas", okFunil]);
passos.push(["trouxe insight de perdas no hover",
  tf.some((t) => /CURSO NAO ENCONTRADO/.test(t) && /12% das perdas/.test(t))]);

const okMkt = clicar("Marketing");
await new Promise((r) => setTimeout(r, 550));
const tm = [...w.document.querySelectorAll("[title]")].map((e) => e.getAttribute("title") || "");
const tm2 = root.textContent || "";
passos.push(["abriu o menu Marketing", okMkt]);
{
  const abaG = clicar("Google Ads");
  await new Promise((r) => setTimeout(r, 450));
  const tg = root.textContent || "";
  passos.push(["abriu a aba Google Ads", abaG]);
  passos.push(["mostrou conversões só no Google",
    /Conversões/.test(tg) && /Custo por conversão/.test(tg) && !/Pessoas alcançadas/.test(tg)]);

  const abaM = clicar("Meta Ads");
  await new Promise((r) => setTimeout(r, 450));
  const tmeta = root.textContent || "";
  passos.push(["abriu a aba Meta Ads", abaM]);
  passos.push(["mostrou alcance e frequência só no Meta",
    /Pessoas alcançadas/.test(tmeta) && /1,2x em média|1,17/.test(tmeta)]);
  passos.push(["alertou sobre o Meta sem conversões na aba própria",
    /não registrou nenhuma conversão/.test(tmeta)]);

  const abaO = clicar("Redes Orgânicas");
  await new Promise((r) => setTimeout(r, 450));
  const torg = root.textContent || "";
  passos.push(["abriu a aba Redes Orgânicas", abaO && /Alcance orgânico/.test(torg)]);
  passos.push(["trouxe seguidores e perfil no orgânico",
    /6.633/.test(torg) && /ineprotec/.test(torg)]);
  passos.push(["mostrou ritmo de publicação", /1,8 publicações por semana/.test(torg)]);
  passos.push(["listou as publicações que mais engajaram",
    /Publicações que mais engajaram/.test(torg) && /Escolher uma instituição/.test(torg)]);

  clicar("Visão Geral");
  await new Promise((r) => setTimeout(r, 450));
}
passos.push(["abriu o Marketing com o resumo para a direção",
  /O essencial do período/.test(tm2) && /Cada R\$ 1 investido virou/.test(tm2)]);
passos.push(["comparou investimento com o orçamento do mês",
  /85% acima/.test(tm2) && /49% acima/.test(tm2)]);
passos.push(["mostrou meta batida e meta perdida",
  /176% da meta/.test(tm2) && /82% da meta/.test(tm2)]);
passos.push(["deu o veredito em linguagem simples",
  /pede revisão antes de liberar mais verba/.test(tm2)]);
passos.push(["declarou para quem é cada seção",
  /Detalhe da mídia paga/.test(tm2) && /De onde vem o resultado/.test(tm2)]);
passos.push(["removeu os blocos vazios de jargão",
  !/CPQL/.test(tm2) && !/Qualidade & Diagnóstico/.test(tm2)]);
passos.push(["trouxe insight de investimento no hover",
  tm.some((t) => /Custo por matrícula R\$ 58,41/.test(t))]);
passos.push(["alertou sobre o Meta sem conversões",
  tm.some((t) => /zero conversões registradas/.test(t))]);
passos.push(["avisou sobre a atribuição por origem",
  tm.some((t) => /marcados como SITE/.test(t))]);

// o teste ja navegou para o menu Marketing: volta ao Comercial antes das abas
clicar("Comercial");
await new Promise((r) => setTimeout(r, 400));

for (const [rot, aba, re] of [
  ["Pipeline & Contato", "Pipeline & Contato", /91,3% sem movimentação/],
  ["Origem, Canal & Região", "Origem, Canal & Região", /SC converte 8,9%/],
  ["Jornada & Origem", "Jornada & Origem", /Metade fecha em até 0 dia/],
  ["Agente SDR", "Agente SDR", /6 leads dos 1.445/],
]) {
  const ok = clicar(aba);
  await new Promise((r) => setTimeout(r, 420));
  const tt = [...w.document.querySelectorAll("[title]")].map((e) => e.getAttribute("title") || "");
  passos.push([`insight na aba ${rot}`, ok && tt.some((t) => re.test(t))]);
}

clicar("Comercial");
await new Promise((r) => setTimeout(r, 350));
clicar("Origem, Canal & Região");
await new Promise((r) => setTimeout(r, 500));
const to = root.textContent || "";
passos.push(["trouxe o ranking de cursos procurados x vendidos",
  /Cursos mais procurados x mais vendidos/.test(to) && /TECNICO EM AGRIMENSURA/.test(to)]);
passos.push(["mostrou procura e venda lado a lado", /184/.test(to) && /18,6%/.test(to)]);
passos.push(["trouxe o relatório de estados que mais vendem",
  /Estados que mais vendem/.test(to) && /SP/.test(to) && /48.301/.test(to)]);
passos.push(["calculou o ticket médio por estado", /2.195|2.196/.test(to)]);
passos.push(["alertou sobre leads sem curso declarado",
  /Leads sem curso declarado/.test(to) && /44,2%/.test(to)]);

{
  const tf2 = root.textContent || "";
  const tt = [...w.document.querySelectorAll("[title]")].map((e) => e.getAttribute("title") || "");
  passos.push(["marcou o Meta como pausado, não como atrasado",
    /Meta pausado/.test(tf2) && !/Meta 4d/.test(tf2)]);
  passos.push(["explicou que pausado não é falha do painel",
    tt.some((t) => /não é falha do painel/.test(t))]);
  passos.push(["manteve o Google como saudável", /Google/.test(tf2) && !/Google \d+d/.test(tf2)]);
}

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
