import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, LabelList } from "recharts";

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD EDILVO — MENU 1: COMERCIAL (Kommo)
// VirtruvIA · Matrícula EAD & Ineprotec
// Modo: LIVE (fetch à RPC do Supabase) ou SNAPSHOT (dados reais de 01–14/07/2026)
// ═══════════════════════════════════════════════════════════════════

const LIVE = typeof window !== "undefined" && window.EDILVO_LIVE === true;
const SUPABASE_URL = "https://svmxlhhsgvbhjpcdhnhy.supabase.co";
const RPC_TOKEN = "ba37d3f35fb8c1dbef36184f0c0c1afc157dde7b";

// ── Identidade VirtruvIA ──
const THEMES = {
  claro: {
    bg: "#FFFFFF", panel: "#FFFFFF", panelSoft: "#F6F6F5", border: "#E4E4E2",
    text: "#111111", muted: "#6E6E6A", gold: "#B08D3E", steel: "#2E7D95",
    green: "#1F7A3F", red: "#C0392B", amber: "#A8720A", ink: "#111111", onInk: "#FFFFFF",
    shadow: "0 1px 3px rgba(20,18,12,.06)",
  },
  escuro: {
    bg: "#0E0E10", panel: "#17171A", panelSoft: "#1F1F23", border: "#2C2C33",
    text: "#ECEAE4", muted: "#9B968B", gold: "#D9B45B", steel: "#6FB5C9",
    green: "#5FBF77", red: "#E06C5F", amber: "#D9A05B", ink: "#ECEAE4", onInk: "#111111",
    shadow: "0 1px 3px rgba(0,0,0,.5)",
  },
};
const T = { ...THEMES.claro };
const SCHOOLS = {
  matricula_ead: { label: "Matrícula EAD", color: T.gold },
  ineprotec: { label: "Ineprotec", color: T.steel },
};
const font = "'Poppins', -apple-system, 'Segoe UI', sans-serif";

// ── SNAPSHOT: dados reais do Supabase (RPC dashboard_comercial, 01–14/07/2026) ──
const SNAPSHOT = {
  periodo: { from: "2026-07-01", to: "2026-07-15" },
  visao_geral: [
    { school: "ineprotec", leads: 215, em_aberto: 179, perdas_criadas: 22, matriculas_criadas: 14, faturamento_coorte: 24711 },
    { school: "matricula_ead", leads: 385, em_aberto: 318, perdas_criadas: 41, matriculas_criadas: 26, faturamento_coorte: 16878 },
  ],
  visao_ant: [
    { school: "ineprotec", leads: 160 },
    { school: "matricula_ead", leads: 419 },
  ],
  fechamentos: [
    { school: "ineprotec", matriculas: 24, perdas: 31, faturamento: 51907, ticket_medio: 2595.35 },
    { school: "matricula_ead", matriculas: 39, perdas: 66, faturamento: 36958, ticket_medio: 2309.88 },
  ],
  fechamentos_ant: [
    { school: "ineprotec", matriculas: 29, perdas: 40, faturamento: 56971 },
    { school: "matricula_ead", matriculas: 42, perdas: 40, faturamento: 35522 },
  ],
  serie_diaria: [
    { dia: "2026-07-01", school: "ineprotec", entradas: 15, matriculas: 3, perdas: 5 },
    { dia: "2026-07-01", school: "matricula_ead", entradas: 43, matriculas: 7, perdas: 18 },
    { dia: "2026-07-02", school: "ineprotec", entradas: 21, matriculas: 2, perdas: 5 },
    { dia: "2026-07-02", school: "matricula_ead", entradas: 46, matriculas: 1, perdas: 3 },
    { dia: "2026-07-03", school: "ineprotec", entradas: 9, matriculas: 2, perdas: 7 },
    { dia: "2026-07-03", school: "matricula_ead", entradas: 63, matriculas: 4, perdas: 4 },
    { dia: "2026-07-04", school: "ineprotec", entradas: 7, matriculas: 0, perdas: 0 },
    { dia: "2026-07-04", school: "matricula_ead", entradas: 20, matriculas: 1, perdas: 0 },
    { dia: "2026-07-05", school: "ineprotec", entradas: 5, matriculas: 0, perdas: 0 },
    { dia: "2026-07-05", school: "matricula_ead", entradas: 11, matriculas: 0, perdas: 0 },
    { dia: "2026-07-06", school: "ineprotec", entradas: 27, matriculas: 3, perdas: 3 },
    { dia: "2026-07-06", school: "matricula_ead", entradas: 26, matriculas: 5, perdas: 9 },
    { dia: "2026-07-07", school: "ineprotec", entradas: 21, matriculas: 3, perdas: 2 },
    { dia: "2026-07-07", school: "matricula_ead", entradas: 32, matriculas: 9, perdas: 5 },
    { dia: "2026-07-08", school: "ineprotec", entradas: 19, matriculas: 4, perdas: 2 },
    { dia: "2026-07-08", school: "matricula_ead", entradas: 25, matriculas: 4, perdas: 9 },
    { dia: "2026-07-09", school: "ineprotec", entradas: 10, matriculas: 2, perdas: 0 },
    { dia: "2026-07-09", school: "matricula_ead", entradas: 19, matriculas: 2, perdas: 10 },
    { dia: "2026-07-10", school: "ineprotec", entradas: 19, matriculas: 2, perdas: 4 },
    { dia: "2026-07-10", school: "matricula_ead", entradas: 19, matriculas: 3, perdas: 1 },
    { dia: "2026-07-11", school: "ineprotec", entradas: 7, matriculas: 0, perdas: 0 },
    { dia: "2026-07-11", school: "matricula_ead", entradas: 10, matriculas: 0, perdas: 0 },
    { dia: "2026-07-12", school: "ineprotec", entradas: 10, matriculas: 0, perdas: 0 },
    { dia: "2026-07-12", school: "matricula_ead", entradas: 11, matriculas: 0, perdas: 0 },
    { dia: "2026-07-13", school: "ineprotec", entradas: 19, matriculas: 0, perdas: 0 },
    { dia: "2026-07-13", school: "matricula_ead", entradas: 26, matriculas: 0, perdas: 5 },
    { dia: "2026-07-14", school: "ineprotec", entradas: 26, matriculas: 3, perdas: 3 },
    { dia: "2026-07-14", school: "matricula_ead", entradas: 34, matriculas: 3, perdas: 2 },
  ],
  funil: [
    { school: "ineprotec", status_name: "FOLLOW UP ATIVO", sort: 40, qtd: 67 },
    { school: "ineprotec", status_name: "AGUARDANDO DECISÃO", sort: 50, qtd: 54 },
    { school: "ineprotec", status_name: "LEAD SEM RESPOSTA", sort: 70, qtd: 35 },
    { school: "ineprotec", status_name: "PRÉ-MATRICULADO", sort: 80, qtd: 5 },
    { school: "ineprotec", status_name: "MATRICULA REALIZADA", sort: 10000, qtd: 11 },
    { school: "ineprotec", status_name: "MATRICULA PERDIDA", sort: 11000, qtd: 22 },
    { school: "matricula_ead", status_name: "FOLLOW UP ATIVO", sort: 40, qtd: 64 },
    { school: "matricula_ead", status_name: "AGUARDANDO DECISÃO", sort: 50, qtd: 77 },
    { school: "matricula_ead", status_name: "LEAD SEM RESPOSTA", sort: 70, qtd: 163 },
    { school: "matricula_ead", status_name: "PRÉ-MATRICULADO", sort: 80, qtd: 4 },
    { school: "matricula_ead", status_name: "MATRICULA REALIZADA", sort: 10000, qtd: 7 },
    { school: "matricula_ead", status_name: "MATRICULA PERDIDA", sort: 11000, qtd: 41 },
  ],
  motivos_perda: [
    { school: "matricula_ead", motivo: "(sem motivo)", categoria: "Outros", qtd: 20 },
    { school: "matricula_ead", motivo: "CURSO NAO ENCONTRADO", categoria: "Sem interesse real", qtd: 15 },
    { school: "ineprotec", motivo: "PREFERE CURSO PRESENCIAL", categoria: "Sem interesse real", qtd: 11 },
    { school: "matricula_ead", motivo: "SEM RESPOSTA", categoria: "Sumiu / não engajou", qtd: 10 },
    { school: "ineprotec", motivo: "LEAD DUPLICADO", categoria: "Lead de baixa qualidade", qtd: 8 },
    { school: "matricula_ead", motivo: "LEAD DUPLICADO", categoria: "Lead de baixa qualidade", qtd: 5 },
    { school: "matricula_ead", motivo: "PREFERE CURSO PRESENCIAL", categoria: "Sem interesse real", qtd: 5 },
    { school: "ineprotec", motivo: "SPAM", categoria: "Sumiu / não engajou", qtd: 3 },
    { school: "matricula_ead", motivo: "SPAM", categoria: "Sumiu / não engajou", qtd: 3 },
    { school: "ineprotec", motivo: "TERCEIROS ENTRARAM EM CONTATO", categoria: "Sumiu / não engajou", qtd: 2 },
    { school: "ineprotec", motivo: "DESISTIU DE ESTUDAR", categoria: "Sem interesse real", qtd: 2 },
    { school: "matricula_ead", motivo: "DESISTIU DE ESTUDAR", categoria: "Sem interesse real", qtd: 2 },
    { school: "matricula_ead", motivo: "ESCOLHEU OUTRA INSTITUIÇAO", categoria: "Preço / concorrência", qtd: 2 },
    { school: "ineprotec", motivo: "ESCOLHEU OUTRA INSTITUIÇAO", categoria: "Preço / concorrência", qtd: 2 },
    { school: "matricula_ead", motivo: "MOTIVOS FINANCEIROS", categoria: "Preço / concorrência", qtd: 2 },
    { school: "matricula_ead", motivo: "VAGA DE EMPREGO", categoria: "Sem interesse real", qtd: 1 },
    { school: "ineprotec", motivo: "CURSO NAO ENCONTRADO", categoria: "Sem interesse real", qtd: 1 },
    { school: "ineprotec", motivo: "SEM RESPOSTA", categoria: "Sumiu / não engajou", qtd: 1 },
    { school: "matricula_ead", motivo: "TERCEIROS ENTRARAM EM CONTATO", categoria: "Sumiu / não engajou", qtd: 1 },
    { school: "ineprotec", motivo: "(sem motivo)", categoria: "Outros", qtd: 1 },
  ],
  heatmap_perda: [
    { school: "matricula_ead", etapa: "AGUARDANDO DECISÃO", motivo: "(sem motivo)", qtd: 1 },
    { school: "matricula_ead", etapa: "MATRICULA PERDIDA", motivo: "(sem motivo)", qtd: 1 },
  ],
  tempo_por_etapa: [],
  vendedores: [
    { school: "matricula_ead", vendedor: "Pedro Henrique Reis dos Santos", leads_atribuidos: 102, matriculas: 17, faturamento: 7871, ticket_medio: 2623.67, dias_fechamento: 1.0, parados_7d: 1 },
    { school: "matricula_ead", vendedor: "Bruna Pereira Benevides", leads_atribuidos: 78, matriculas: 9, faturamento: 9007, ticket_medio: 3002.33, dias_fechamento: 0.3, parados_7d: 4 },
    { school: "ineprotec", vendedor: "Marcela Rabelo do Carmo", leads_atribuidos: 50, matriculas: 8, faturamento: 15043, ticket_medio: 2507.17, dias_fechamento: 1.4, parados_7d: 8 },
    { school: "ineprotec", vendedor: "Jessica Alves Torres", leads_atribuidos: 106, matriculas: 5, faturamento: 9668, ticket_medio: 2417, dias_fechamento: 2.6, parados_7d: 0 },
    { school: "ineprotec", vendedor: "Bruna Pereira Benevides", leads_atribuidos: 1, matriculas: 1, faturamento: 0, ticket_medio: 0, dias_fechamento: 0, parados_7d: 0 },
    { school: "matricula_ead", vendedor: "Lorena Chaves", leads_atribuidos: 203, matriculas: 0, faturamento: 0, ticket_medio: 0, dias_fechamento: null, parados_7d: 0 },
    { school: "ineprotec", vendedor: "Lorena Chaves", leads_atribuidos: 57, matriculas: 0, faturamento: 0, ticket_medio: 0, dias_fechamento: null, parados_7d: 0 },
    { school: "matricula_ead", vendedor: "Jessica Alves Torres", leads_atribuidos: 2, matriculas: 0, faturamento: 0, ticket_medio: 0, dias_fechamento: null, parados_7d: 0 },
    { school: "ineprotec", vendedor: "INEPROTEC", leads_atribuidos: 1, matriculas: 0, faturamento: 0, ticket_medio: 0, dias_fechamento: null, parados_7d: 1 },
  ],
  origens: [
    { school: "matricula_ead", origem: "MAT - SITE", leads: 181, matriculas: 3 },
    { school: "ineprotec", origem: "INE - SITE", leads: 79, matriculas: 4 },
    { school: "matricula_ead", origem: "MAT - INSTAGRAM", leads: 78, matriculas: 0 },
    { school: "ineprotec", origem: "(não informado)", leads: 71, matriculas: 5 },
    { school: "matricula_ead", origem: "(não informado)", leads: 42, matriculas: 17 },
    { school: "ineprotec", origem: "INE - FORMULARIO SITE", leads: 39, matriculas: 1 },
    { school: "matricula_ead", origem: "CONTATO WHATSAPP", leads: 30, matriculas: 0 },
    { school: "matricula_ead", origem: "INDICAÇÃO", leads: 22, matriculas: 3 },
    { school: "matricula_ead", origem: "SITE", leads: 9, matriculas: 1 },
    { school: "ineprotec", origem: "CONTATO WHATSAPP", leads: 8, matriculas: 2 },
    { school: "ineprotec", origem: "INDICAÇÃO", leads: 7, matriculas: 1 },
    { school: "matricula_ead", origem: "INSTAGRAM", leads: 5, matriculas: 0 },
    { school: "matricula_ead", origem: "INDICAÇAO", leads: 5, matriculas: 0 },
    { school: "ineprotec", origem: "SITE", leads: 5, matriculas: 0 },
    { school: "matricula_ead", origem: "INE - FORMULARIO SITE", leads: 4, matriculas: 0 },
    { school: "matricula_ead", origem: "INDICAÇAO WPP", leads: 2, matriculas: 1 },
    { school: "matricula_ead", origem: "MAT - FORMULARIO SITE", leads: 2, matriculas: 1 },
    { school: "ineprotec", origem: "INE - WHATSAPP DIRETO", leads: 1, matriculas: 1 },
  ],
  campanhas: [
    { school: "ineprotec", campanha: "{campaignname}", leads: 11, matriculas: 0 },
  ],
  regioes: [
    { school: "matricula_ead", estado_uf: "SP", regiao: "Sudeste", leads: 94, matriculas: 5 },
    { school: "matricula_ead", estado_uf: "RJ", regiao: "Sudeste", leads: 60, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "MG", regiao: "Sudeste", leads: 51, matriculas: 7 },
    { school: "ineprotec", estado_uf: "RJ", regiao: "Sudeste", leads: 27, matriculas: 0 },
    { school: "ineprotec", estado_uf: "SP", regiao: "Sudeste", leads: 24, matriculas: 3 },
    { school: "ineprotec", estado_uf: "MG", regiao: "Sudeste", leads: 21, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "GO", regiao: "Centro-Oeste", leads: 19, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "DF", regiao: "Centro-Oeste", leads: 18, matriculas: 2 },
    { school: "matricula_ead", estado_uf: "RS", regiao: "Sul", leads: 17, matriculas: 3 },
    { school: "ineprotec", estado_uf: "DF", regiao: "Centro-Oeste", leads: 17, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "SC", regiao: "Sul", leads: 14, matriculas: 1 },
    { school: "ineprotec", estado_uf: "MA", regiao: "Norte", leads: 13, matriculas: 0 },
    { school: "ineprotec", estado_uf: "RS", regiao: "Sul", leads: 13, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "BA", regiao: "Nordeste", leads: 13, matriculas: 0 },
    { school: "ineprotec", estado_uf: "BA", regiao: "Nordeste", leads: 13, matriculas: 1 },
    { school: "ineprotec", estado_uf: "SC", regiao: "Sul", leads: 11, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "PA", regiao: "Norte", leads: 10, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "MS", regiao: "Centro-Oeste", leads: 10, matriculas: 2 },
    { school: "matricula_ead", estado_uf: "PR", regiao: "Sul", leads: 9, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "MT", regiao: "Centro-Oeste", leads: 9, matriculas: 2 },
    { school: "ineprotec", estado_uf: "PR", regiao: "Sul", leads: 8, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "MA", regiao: "Norte", leads: 8, matriculas: 0 },
    { school: "ineprotec", estado_uf: "CE", regiao: "Nordeste", leads: 7, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "TO", regiao: "Norte", leads: 7, matriculas: 1 },
    { school: "ineprotec", estado_uf: "PA", regiao: "Norte", leads: 7, matriculas: 1 },
    { school: "ineprotec", estado_uf: "PE", regiao: "Nordeste", leads: 7, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "PI", regiao: "Nordeste", leads: 6, matriculas: 0 },
    { school: "ineprotec", estado_uf: "PI", regiao: "Nordeste", leads: 6, matriculas: 1 },
    { school: "matricula_ead", estado_uf: "CE", regiao: "Nordeste", leads: 6, matriculas: 0 },
    { school: "ineprotec", estado_uf: "MT", regiao: "Centro-Oeste", leads: 6, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "AM", regiao: "Norte", leads: 6, matriculas: 1 },
    { school: "ineprotec", estado_uf: "GO", regiao: "Centro-Oeste", leads: 5, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "PE", regiao: "Nordeste", leads: 5, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "ES", regiao: "Sudeste", leads: 5, matriculas: 0 },
    { school: "ineprotec", estado_uf: "ES", regiao: "Sudeste", leads: 4, matriculas: 1 },
    { school: "ineprotec", estado_uf: "AM", regiao: "Norte", leads: 4, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "RN", regiao: "Nordeste", leads: 4, matriculas: 0 },
    { school: "ineprotec", estado_uf: "RO", regiao: "Norte", leads: 4, matriculas: 0 },
    { school: "ineprotec", estado_uf: "RR", regiao: "Norte", leads: 3, matriculas: 0 },
    { school: "ineprotec", estado_uf: "AL", regiao: "Nordeste", leads: 3, matriculas: 1 },
    { school: "ineprotec", estado_uf: "PB", regiao: "Nordeste", leads: 3, matriculas: 0 },
    { school: "matricula_ead", estado_uf: "AL", regiao: "Nordeste", leads: 3, matriculas: 0 },
    { school: "ineprotec", estado_uf: "MS", regiao: "Centro-Oeste", leads: 2, matriculas: 0 },
    { school: "ineprotec", estado_uf: "RN", regiao: "Nordeste", leads: 2, matriculas: 1 },
    { school: "ineprotec", estado_uf: "SE", regiao: "Nordeste", leads: 2, matriculas: 0 },
  ],
  cursos: [
    { school: "ineprotec", curso: "TECNICO EM AGRIMENSURA", leads: 22, matriculas: 15, faturamento: 39796, ticket_medio: 2842.57 },
    { school: "ineprotec", curso: "TECNICO EM ELETROTECNICA", leads: 19, matriculas: 4, faturamento: 6709, ticket_medio: 2236.33 },
    { school: "matricula_ead", curso: "TECNICO EM AGRICULTURA", leads: 3, matriculas: 2, faturamento: 5252, ticket_medio: 2626 },
    { school: "matricula_ead", curso: "SUPLETIVO EJA MEDIO", leads: 2, matriculas: 2, faturamento: 4391, ticket_medio: 2195.5 },
    { school: "matricula_ead", curso: "TECNICO EM ACUCAR E ALCOOL", leads: 3, matriculas: 2, faturamento: 2900, ticket_medio: 2900 },
    { school: "matricula_ead", curso: "TECNICO EM QUIMICA", leads: 4, matriculas: 1, faturamento: 2878, ticket_medio: 2878 },
    { school: "matricula_ead", curso: "TECNICO EM AGRIMENSURA", leads: 1, matriculas: 1, faturamento: 2733, ticket_medio: 2733 },
    { school: "ineprotec", curso: "TECNICO EM MINERACAO", leads: 1, matriculas: 1, faturamento: 2235, ticket_medio: 2235 },
    { school: "matricula_ead", curso: "TECNICO EM SEGURANCA DO TRABALHO", leads: 7, matriculas: 1, faturamento: 2093, ticket_medio: 2093 },
    { school: "matricula_ead", curso: "TECNICO EM ELETROTECNICA", leads: 3, matriculas: 1, faturamento: 1853, ticket_medio: 1853 },
    { school: "ineprotec", curso: "TECNICO EM ADMINISTRACAO", leads: 1, matriculas: 1, faturamento: 1641, ticket_medio: 1641 },
    { school: "matricula_ead", curso: "TECNICO EM TRANSAÇOES IMOBILIARIAS", leads: 2, matriculas: 1, faturamento: 1558, ticket_medio: 1558 },
    { school: "ineprotec", curso: "ESP. EM GEORREFERENCIAMENTO", leads: 3, matriculas: 1, faturamento: 1526, ticket_medio: 1526 },
    { school: "matricula_ead", curso: "TECNICO EM SECRETARIO ESCOLAR", leads: 2, matriculas: 1, faturamento: 1069, ticket_medio: 1069 },
    { school: "matricula_ead", curso: "TECNICO EM MINERACAO", leads: 6, matriculas: 1, faturamento: 0, ticket_medio: 0 },
    { school: "matricula_ead", curso: "TECNICO EM AGROPECUARIA", leads: 1, matriculas: 1, faturamento: 0, ticket_medio: 0 },
    { school: "matricula_ead", curso: "TECNICO EM ELETROMECANICA", leads: 3, matriculas: 1, faturamento: 0, ticket_medio: 0 },
    { school: "matricula_ead", curso: "OUTROS CURSOS", leads: 6, matriculas: 0, faturamento: 0, ticket_medio: 0 },
    { school: "matricula_ead", curso: "TECNICO EM EDIFICACOES", leads: 3, matriculas: 0, faturamento: 0, ticket_medio: 0 },
    { school: "matricula_ead", curso: "TECNICO EM PETROLEO E GAS", leads: 2, matriculas: 0, faturamento: 0, ticket_medio: 0 },
  ],
  pagamentos: [
    { school: "ineprotec", forma: "BOLETO", matriculas: 8, faturamento: 20062 },
    { school: "ineprotec", forma: "(não informado)", matriculas: 8, faturamento: 14595 },
    { school: "matricula_ead", forma: "BOLETO", matriculas: 5, faturamento: 12814 },
    { school: "matricula_ead", forma: "(não informado)", matriculas: 28, faturamento: 12099 },
    { school: "matricula_ead", forma: "CARTAO", matriculas: 5, faturamento: 11445 },
    { school: "ineprotec", forma: "CARTAO", matriculas: 4, faturamento: 8736 },
    { school: "ineprotec", forma: "PIX", matriculas: 4, faturamento: 8514 },
    { school: "matricula_ead", forma: "A VISTA", matriculas: 1, faturamento: 600 },
  ],
  parados: [
    { school: "matricula_ead", vendedor: "Lorena Chaves", qtd: 25751, dias_medio: 33 },
    { school: "ineprotec", vendedor: "Lorena Chaves", qtd: 9484, dias_medio: 33 },
    { school: "ineprotec", vendedor: "Marcela Rabelo do Carmo", qtd: 44, dias_medio: 8 },
    { school: "ineprotec", vendedor: "Jessica Alves Torres", qtd: 37, dias_medio: 23 },
    { school: "matricula_ead", vendedor: "Bruna Pereira Benevides", qtd: 31, dias_medio: 24 },
    { school: "ineprotec", vendedor: "INEPROTEC", qtd: 11, dias_medio: 11 },
    { school: "matricula_ead", vendedor: "Marcela Rabelo do Carmo", qtd: 6, dias_medio: 8 },
    { school: "ineprotec", vendedor: "Bruna Pereira Benevides", qtd: 2, dias_medio: 33 },
    { school: "ineprotec", vendedor: "Pedro Henrique Reis dos Santos", qtd: 1, dias_medio: 33 },
    { school: "matricula_ead", vendedor: "Pedro Henrique Reis dos Santos", qtd: 1, dias_medio: 12 },
  ],
};

// ── Utilitários ──
const brl = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const num = (v) => Number(v || 0).toLocaleString("pt-BR");
const pct = (v) => (v == null ? "—" : (v * 100).toFixed(1).replace(".", ",") + "%");
const deltaPct = (cur, prev) => (prev > 0 ? (cur - prev) / prev : null);
const bySchool = (rows, school) => rows.filter((r) => r.school === school);
const sum = (rows, key) => rows.reduce((a, r) => a + Number(r[key] || 0), 0);

// ── Componentes base ──
function Delta({ value, invert = false }) {
  if (value == null) return <span style={{ fontSize: 11, color: T.muted }}>—</span>;
  const good = invert ? value < 0 : value > 0;
  const color = value === 0 ? T.muted : good ? T.green : T.red;
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "•";
  return (
    <span style={{ fontSize: 11.5, color, fontWeight: 500, whiteSpace: "nowrap" }}>
      {arrow} {Math.abs(value * 100).toFixed(0)}% vs anterior
    </span>
  );
}

function Kpi({ label, value, delta, invert, accent }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderTop: `2px solid ${accent || T.border}`, borderRadius: 10, padding: "13px 15px", minWidth: 0 }}>
      <div style={{ fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 600, margin: "3px 0 2px", fontVariantNumeric: "tabular-nums", color: T.text }}>{value}</div>
      <Delta value={delta} invert={invert} />
    </div>
  );
}

function SchoolTag({ school }) {
  const s = SCHOOLS[school];
  if (!s) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: s.color, fontWeight: 500 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
      {s.label}
    </span>
  );
}

function Panel({ title, right, children, style }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, boxShadow: T.shadow, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Placeholder({ label, detail }) {
  return (
    <div style={{ border: `1px dashed ${T.border}`, borderRadius: 8, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 12.5, color: T.muted, fontWeight: 500 }}>{label}</div>
      {detail && <div style={{ fontSize: 11.5, color: T.muted, opacity: 0.75, marginTop: 4, lineHeight: 1.5 }}>{detail}</div>}
    </div>
  );
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: font }}>
      <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.text }}>{p.name}: <b>{num(p.value)}</b></div>
      ))}
    </div>
  );
}

// Tabela ordenável + paginada (10 por página)
function DataTable({ columns, rows, initialSort, pageSize = 10 }) {
  const [sort, setSort] = useState(initialSort || { key: columns[0].key, dir: "desc" });
  const [page, setPage] = useState(0);
  const sorted = useMemo(() => {
    const r = [...rows];
    r.sort((a, b) => {
      const va = a[sort.key], vb = b[sort.key];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return sort.dir === "asc" ? va - vb : vb - va;
      return sort.dir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return r;
  }, [rows, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const slice = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const th = { textAlign: "left", padding: "8px 10px", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: T.muted, borderBottom: `1px solid ${T.border}`, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" };
  const td = { padding: "8px 10px", fontSize: 12.5, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={th} onClick={() => { setSort((s) => ({ key: c.key, dir: s.key === c.key && s.dir === "desc" ? "asc" : "desc" })); setPage(0); }}>
                  {c.label} {sort.key === c.key ? (sort.dir === "desc" ? "↓" : "↑") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} style={{ ...td, ...(c.style || {}) }}>{c.render ? c.render(r) : r[c.key]}</td>
                ))}
              </tr>
            ))}
            {!slice.length && (
              <tr><td colSpan={columns.length} style={{ ...td, color: T.muted, textAlign: "center" }}>Sem dados no período</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 10 }}>
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pgBtn(page === 0)}>‹</button>
          <span style={{ fontSize: 11.5, color: T.muted }}>{page + 1} / {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page === pages - 1} style={pgBtn(page === pages - 1)}>›</button>
        </div>
      )}
    </div>
  );
}
const pgBtn = (off) => ({ background: T.panelSoft, color: off ? T.muted : T.text, border: `1px solid ${T.border}`, borderRadius: 6, width: 26, height: 26, cursor: off ? "default" : "pointer", fontFamily: font });

// ═══════════════════════════════════════════════════════════════════
// ABAS
// ═══════════════════════════════════════════════════════════════════

// ── Aba 1: Visão Geral Comercial ──
function AbaVisaoGeral({ data, extra, qual, fila, schools }) {
  const vg = data.visao_geral, fe = data.fechamentos, fea = data.fechamentos_ant, va = data.visao_ant;
  const kpiRow = (school) => {
    const v = bySchool(vg, school)[0] || {};
    const f = bySchool(fe, school)[0] || {};
    const fa = bySchool(fea, school)[0] || {};
    const a = bySchool(va, school)[0] || {};
    const conv = (f.matriculas || 0) + (f.perdas || 0) > 0 ? f.matriculas / (f.matriculas + f.perdas) : null;
    const convAnt = (fa.matriculas || 0) + (fa.perdas || 0) > 0 ? fa.matriculas / (fa.matriculas + fa.perdas) : null;
    const c = SCHOOLS[school].color;
    return (
      <div key={school} style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10 }}>
          <Kpi accent={c} label="Leads entrados" value={num(v.leads)} delta={deltaPct(v.leads, a.leads)} />
          <Kpi accent={c} label="Matrículas" value={num(f.matriculas)} delta={deltaPct(f.matriculas, fa.matriculas)} />
          <Kpi accent={c} label="Perdas" value={num(f.perdas)} delta={deltaPct(f.perdas, fa.perdas)} invert />
          <Kpi accent={c} label="Em aberto" value={num(v.em_aberto)} />
          <Kpi accent={c} label="Conversão" value={pct(conv)} delta={conv != null && convAnt != null ? conv - convAnt : null} />
          <Kpi accent={c} label="Faturamento" value={brl(f.faturamento)} delta={deltaPct(f.faturamento, fa.faturamento)} />
          <Kpi accent={c} label="Ticket médio" value={brl(f.ticket_medio)} />
        </div>
      </div>
    );
  };

  // funil consolidado por escola (barras horizontais)
  const funnelFor = (school) => {
    const rows = bySchool(data.funil, school).sort((a, b) => a.sort - b.sort);
    const max = Math.max(...rows.map((r) => r.qtd), 1);
    const c = SCHOOLS[school].color;
    return (
      <div key={school} style={{ flex: 1, minWidth: 260 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        {rows.map((r) => (
          <div key={r.status_name} style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3 }}>
              <span style={{ color: T.muted }}>{r.status_name}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{num(r.qtd)}</span>
            </div>
            <div style={{ height: 9, background: T.panelSoft, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(r.qtd / max) * 100}%`, height: "100%", background: r.status_name.includes("PERDIDA") ? T.red : r.status_name.includes("REALIZADA") ? T.green : c, borderRadius: 5 }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // série diária multi-escola
  const days = [...new Set(data.serie_diaria.map((r) => r.dia))].sort();
  const serieData = days.map((d) => {
    const row = { dia: d.slice(8, 10) + "/" + d.slice(5, 7) };
    schools.forEach((s) => {
      const r = data.serie_diaria.find((x) => x.dia === d && x.school === s) || {};
      row[`entradas_${s}`] = r.entradas || 0;
      row[`matriculas_${s}`] = r.matriculas || 0;
    });
    return row;
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>{schools.map(kpiRow)}</div>
      <Panel title="Funil consolidado (leads do período, por etapa)">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{schools.map(funnelFor)}</div>
      </Panel>
      <Panel title="Entrada de leads × matrículas por dia">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: T.muted, marginBottom: 8 }}>
          {schools.map((s) => (
            <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 3, background: SCHOOLS[s].color, borderRadius: 2 }} /> Leads {SCHOOLS[s].label}
            </span>
          ))}
          {schools.map((s) => (
            <span key={s + "m"} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 3, background: SCHOOLS[s].color, borderRadius: 2, opacity: 0.45 }} /> Matrículas {SCHOOLS[s].label}
            </span>
          ))}
        </div>
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={serieData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={T.border} strokeDasharray="0" vertical={false} />
              <XAxis dataKey="dia" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              {schools.map((s) => (
                <Line key={s} type="monotone" dataKey={`entradas_${s}`} name={`Leads ${SCHOOLS[s].label}`} stroke={SCHOOLS[s].color} strokeWidth={2} dot={false} />
              ))}
              {schools.map((s) => (
                <Line key={s + "m"} type="monotone" dataKey={`matriculas_${s}`} name={`Matr. ${SCHOOLS[s].label}`} stroke={SCHOOLS[s].color} strokeWidth={2} strokeOpacity={0.45} strokeDasharray="5 3" dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {fila && (() => {
        const per = (fila.por_periodo || []).filter((f) => schools.includes(f.school));
        const ven = (fila.por_vendedor || []).filter((f) => schools.includes(f.school));
        const eta = (fila.por_etapa || []).filter((f) => schools.includes(f.school));
        const acu = (fila.acumulado || []).filter((f) => schools.includes(f.school));
        const totalPeriodo = sum(per, "caiu_na_fila");
        const totalAcum = sum(acu, "fila_acumulada");
        if (totalPeriodo === 0 && totalAcum === 0) return null;
        const etapasNomes = [...new Set(eta.map((e) => e.etapa_origem))];
        const etaChart = etapasNomes.map((nome) => {
          const row = { etapa: nome };
          schools.forEach((s) => { row[s] = sum(eta.filter((e) => e.etapa_origem === nome && e.school === s), "caiu_na_fila"); });
          row._t = schools.reduce((a, s) => a + row[s], 0);
          return row;
        }).sort((a, b) => b._t - a._t);
        const vendNomes = [...new Set(ven.map((v) => v.vendedor))];
        const venRows = vendNomes.map((nome) => {
          const row = { vendedor: nome };
          schools.forEach((s) => { row[s] = sum(ven.filter((v) => v.vendedor === nome && v.school === s), "caiu_na_fila"); });
          row.total = schools.reduce((a, s) => a + row[s], 0);
          return row;
        }).sort((a, b) => b.total - a.total);

        return (
          <Panel title="Fila automática — leads sem resposta (rastreamento)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 4 }}>
              {per.map((f) => (
                <Kpi key={f.school} accent={SCHOOLS[f.school].color} label={`Ca\u00edram na fila no per\u00edodo \u00b7 ${SCHOOLS[f.school].label}`} value={num(f.caiu_na_fila)} />
              ))}
              {acu.map((f) => (
                <Kpi key={f.school + "a"} label={`Fila acumulada (hist\u00f3rico) \u00b7 ${SCHOOLS[f.school].label}`} value={num(f.fila_acumulada)} />
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: T.muted, margin: "6px 0 14px", lineHeight: 1.6 }}>
              "Ca\u00edram na fila no per\u00edodo" respeita o filtro de data ativo (LEAD SEM RESPOSTA). Estes leads ficam fora de leads parados, das m\u00e9dias de convers\u00e3o e do ranking de vendedores \u2014 n\u00e3o s\u00e3o fracasso de convers\u00e3o, s\u00e3o contato n\u00e3o estabelecido. As tabelas abaixo s\u00e3o informativas, para achar gargalos por etapa e volume de carteira por vendedor.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>De qual etapa a fila est\u00e1 vazando</div>
                {etaChart.length ? (
                  <div style={{ width: "100%", height: Math.max(150, etaChart.length * 34 + 30) }}>
                    <ResponsiveContainer>
                      <BarChart data={etaChart} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }} barGap={2}>
                        <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <YAxis type="category" dataKey="etapa" stroke={T.muted} fontSize={10.5} width={155} tickLine={false} axisLine={false} />
                        <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                        {schools.map((s) => (
                          <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                            <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <Placeholder label="Nenhuma queda em fila no per\u00edodo" />}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Volume de carteira por vendedor de origem</div>
                <DataTable
                  columns={[
                    { key: "vendedor", label: "Vendedor de origem", style: { fontWeight: 500 } },
                    ...schools.map((s) => ({ key: s, label: SCHOOLS[s].label, render: (r) => num(r[s]) })),
                    { key: "total", label: "Total", render: (r) => <b>{num(r.total)}</b> },
                  ]}
                  rows={venRows}
                  initialSort={{ key: "total", dir: "desc" }}
                  pageSize={6}
                />
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Informativo: de quem era o lead antes de cair na fila. Volume/qualidade de carteira, n\u00e3o convers\u00e3o.</div>
              </div>
            </div>
          </Panel>
        );
      })()}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Carteira atual (todos os leads em aberto, por etapa)">
          {extra ? <DataTable
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "etapa", label: "Etapa" },
              { key: "leads", label: "Leads", render: (r) => num(r.leads) },
              { key: "valor", label: "Valor potencial", render: (r) => brl(r.valor) },
            ]}
            rows={extra.carteira_atual.filter((c) => schools.includes(c.school))}
            initialSort={{ key: "leads", dir: "desc" }} pageSize={7}
          /> : <Placeholder label="Carregando…" />}
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Fotografia de agora, independente do período selecionado.</div>
        </Panel>

        <Panel title="Entrada de leads por dia da semana × turno">
          {extra ? (() => {
            const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
            const turnos = ["Manhã", "Tarde", "Noite", "Madrugada"];
            const rows = extra.entrada_turnos.filter((t) => schools.includes(t.school));
            const cell = (d, t) => sum(rows.filter((r) => r.dia_semana === d + 1 && r.turno === t), "leads");
            const max = Math.max(1, ...dias.flatMap((_, d) => turnos.map((t) => cell(d, t))));
            return (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                  <thead><tr><th style={{ fontSize: 10, color: T.muted, textAlign: "left", padding: 4 }}></th>
                    {dias.map((d) => <th key={d} style={{ fontSize: 10, color: T.muted, padding: 4 }}>{d}</th>)}</tr></thead>
                  <tbody>{turnos.map((t) => <tr key={t}>
                    <td style={{ fontSize: 10.5, color: T.muted, padding: 4, whiteSpace: "nowrap" }}>{t}</td>
                    {dias.map((_, d) => { const v = cell(d, t); return (
                      <td key={d} style={{ padding: 3, textAlign: "center" }}>
                        <div style={{ background: v ? `rgba(176,141,62,${0.12 + 0.7 * v / max})` : T.panelSoft, borderRadius: 5, padding: "7px 0", fontSize: 11, fontVariantNumeric: "tabular-nums", color: v / max > 0.55 ? "#fff" : T.text }}>{v || ""}</div>
                      </td>); })}
                  </tr>)}</tbody>
                </table>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Horário de Brasília — útil para dimensionar o plantão comercial nos picos.</div>
              </div>
            );
          })() : <Placeholder label="Carregando…" />}
        </Panel>
      </div>
    </div>
  );
}

// ── Aba 2: Funil & Perdas ──
function AbaFunilPerdas({ data, schools }) {
  const categorias = ["Sumiu / não engajou", "Sem interesse real", "Preço / concorrência", "Lead de baixa qualidade", "Outros"];
  const catData = categorias.map((cat) => {
    const row = { categoria: cat.replace(" / ", "/") };
    schools.forEach((s) => {
      row[s] = sum(data.motivos_perda.filter((m) => m.school === s && m.categoria === cat), "qtd");
    });
    return row;
  }).filter((r) => schools.some((s) => r[s] > 0));

  const motivosCols = [
    { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
    { key: "motivo", label: "Motivo", style: { whiteSpace: "normal", minWidth: 180 } },
    { key: "categoria", label: "Categoria macro" },
    { key: "qtd", label: "Perdas" },
  ];

  const paradosCols = [
    { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
    { key: "vendedor", label: "Responsável" },
    { key: "qtd", label: "Leads parados +7d", render: (r) => num(r.qtd) },
    { key: "dias_medio", label: "Dias parados (média)", render: (r) => `${num(r.dias_medio)} d` },
  ];

  const heat = data.heatmap_perda || [];
  const tempo = data.tempo_por_etapa || [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title="Perdas por categoria macro (período)">
        {catData.length ? (
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={catData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="categoria" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={38} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem perdas registradas no período" />}
      </Panel>

      <Panel title="Ranking de motivos de perda (detalhado)">
        <DataTable columns={motivosCols} rows={data.motivos_perda.filter((m) => schools.includes(m.school))} initialSort={{ key: "qtd", dir: "desc" }} />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Heatmap: etapa da perda × motivo">
          {heat.length ? (
            <DataTable
              columns={[
                { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                { key: "etapa", label: "Etapa da perda" },
                { key: "motivo", label: "Motivo" },
                { key: "qtd", label: "Qtd" },
              ]}
              rows={heat.filter((h) => schools.includes(h.school))}
              initialSort={{ key: "qtd", dir: "desc" }}
              pageSize={6}
            />
          ) : null}
          <div style={{ marginTop: heat.length ? 10 : 0 }}>
            <Placeholder label="Coleta em andamento desde 14/07/2026" detail="A etapa exata em que cada lead é perdido vem do histórico de mudanças de status (webhook). Perdas anteriores à ativação não têm essa informação retroativa — o mapa engrossa a cada semana." />
          </div>
        </Panel>

        <Panel title="Tempo médio por etapa">
          {tempo.filter((t) => schools.includes(t.school) && t.horas_media > 0).length ? (
            <DataTable
              columns={[
                { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                { key: "etapa", label: "Etapa" },
                { key: "horas_media", label: "Horas (média)" },
                { key: "amostra", label: "Amostra" },
              ]}
              rows={tempo.filter((t) => schools.includes(t.school))}
              initialSort={{ key: "horas_media", dir: "desc" }}
              pageSize={6}
            />
          ) : (
            <Placeholder label="Coleta em andamento desde 14/07/2026" detail="O tempo de permanência em cada etapa é medido pelo histórico de webhooks. Amostra ainda insuficiente para médias confiáveis — os números aparecem aqui automaticamente conforme os leads transitam pelo funil." />
          )}
        </Panel>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Leads parados (sem atualização há 7+ dias)">
          <DataTable columns={paradosCols} rows={data.parados.filter((p) => schools.includes(p.school))} initialSort={{ key: "qtd", dir: "desc" }} pageSize={6} />
        </Panel>
        <Panel title="Perdas por origem">
          <DataTable
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "origem", label: "Origem" },
              { key: "qtd", label: "Perdas" },
            ]}
            rows={data.perdas_por_origem ? data.perdas_por_origem.filter((p) => schools.includes(p.school)) : []}
            initialSort={{ key: "qtd", dir: "desc" }}
            pageSize={6}
          />
        </Panel>
      </div>

      <Panel title="Tempo médio de primeira resposta">
        <Placeholder label="Métrica em construção" detail="Depende do registro de eventos de mensagem no Kommo (primeira interação do vendedor após a criação do lead). Será ativada junto com a coleta do histórico." />
      </Panel>
    </div>
  );
}

// ── Aba 3: Performance por Vendedor ──
function AbaVendedores({ data, schools }) {
  const [selVend, setSelVend] = useState("todos");
  const rows0 = data.vendedores
    .filter((v) => schools.includes(v.school))
    .map((v) => ({ ...v, conversao: v.leads_atribuidos > 0 ? v.matriculas / v.leads_atribuidos : 0 }));
  const nomes = [...new Set(rows0.filter((v) => !(v.generico || ["INEPROTEC", "MATRICULA EAD", "(sem responsável)"].includes(v.vendedor))).map((v) => v.vendedor))].sort();
  const ehGenerico = (v) => v.generico || ["INEPROTEC", "MATRICULA EAD", "(sem responsável)"].includes(v.vendedor);
  const rowsHumanos = rows0.filter((v) => !ehGenerico(v));
  const rowsGenericos = rows0.filter(ehGenerico);
  const rows = selVend === "todos" ? rowsHumanos : rowsHumanos.filter((v) => v.vendedor === selVend);

  const cols = [
    { key: "vendedor", label: "Vendedor", style: { fontWeight: 500 } },
    { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
    { key: "leads_atribuidos", label: "Leads", render: (r) => num(r.leads_atribuidos) },
    { key: "matriculas", label: "Matrículas", render: (r) => String(Math.round(r.matriculas * 10) / 10).replace(".", ",") },
    { key: "perdas", label: "Perdas", render: (r) => num(r.perdas) },
    { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
    { key: "faixa_nome", label: "Faixa", render: (r) => {
      const base = !r.faixa_nome || r.faixa_nome === "Base";
      return <span style={{ color: base ? T.muted : T.green, fontWeight: base ? 400 : 600 }}>{r.faixa_nome || "—"}{base ? "" : " ✓"}</span>;
    } },
    { key: "falta_proxima", label: "Falta p/ próxima", render: (r) => r.falta_proxima == null ? "—" : String(Math.round(r.falta_proxima * 10) / 10).replace(".", ",") },
    { key: "comissao", label: "Comissão", render: (r) => brl(r.comissao) },
    { key: "faturamento", label: "Faturamento", render: (r) => brl(r.faturamento) },
    { key: "ticket_medio", label: "Ticket médio", render: (r) => brl(r.ticket_medio) },
    { key: "dias_fechamento", label: "Fechamento (dias)", render: (r) => (r.dias_fechamento == null ? "—" : r.dias_fechamento.toFixed(1).replace(".", ",")) },
  ];

  const chartData = schools.flatMap((s) =>
    bySchool(rows, s).filter((v) => v.matriculas > 0).map((v) => ({ nome: v.vendedor.split(" ")[0] + ` (${SCHOOLS[s].label.slice(0, 3)})`, matriculas: v.matriculas, fill: SCHOOLS[s].color }))
  ).sort((a, b) => b.matriculas - a.matriculas);

  const selRows = selVend === "todos" ? [] : rows;
  const selKpi = selRows.length ? {
    leads: sum(selRows, "leads_atribuidos"), matr: sum(selRows, "matriculas"), perdas: sum(selRows, "perdas"),
    fat: sum(selRows, "faturamento"),
    dias: (() => { const d = selRows.filter((r) => r.dias_fechamento != null); return d.length ? d.reduce((a, r) => a + Number(r.dias_fechamento), 0) / d.length : null; })(),
  } : null;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {selKpi && <Panel title={`Visão do atendente — ${selVend}`}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <Kpi accent={T.ink} label="Leads atendidos" value={num(selKpi.leads)} />
          <Kpi accent={T.ink} label="Matrículas (rateadas)" value={String(Math.round(selKpi.matr * 10) / 10).replace(".", ",")} />
          <Kpi accent={T.ink} label="Perdas" value={num(selKpi.perdas)} />
          <Kpi accent={T.ink} label="Conversão" value={pct(selKpi.leads > 0 ? selKpi.matr / selKpi.leads : null)} />
          <Kpi accent={T.ink} label="Faturamento" value={brl(selKpi.fat)} />
          <Kpi accent={T.ink} label="Tempo médio (dias)" value={selKpi.dias != null ? selKpi.dias.toFixed(1).replace(".", ",") : "—"} />
        </div>
      </Panel>}
      <Panel title="Matrículas por vendedor (período)">
        {chartData.length ? (
          <div style={{ width: "100%", height: Math.max(160, chartData.length * 42 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" stroke={T.muted} fontSize={11} width={150} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                <Bar dataKey="matriculas" name="Matrículas" radius={[0, 4, 4, 0]} maxBarSize={22}>
                  <LabelList dataKey="matriculas" position="right" fill={T.text} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem matrículas no período" />}
      </Panel>
      <Panel title="Relatório por vendedor (clique nas colunas para ordenar)" right={
        <select value={selVend} onChange={(e) => setSelVend(e.target.value)} style={{ background: T.panelSoft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: font }}>
          <option value="todos">Todos os usuários</option>
          {nomes.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>}>
        <DataTable columns={cols} rows={rows} initialSort={{ key: "matriculas", dir: "desc" }} />
      </Panel>
      {rowsGenericos.length > 0 && (
        <Panel title="Contas genéricas e sem responsável (fora do ranking)">
          <DataTable
            columns={[
              { key: "vendedor", label: "Conta" },
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "leads_atribuidos", label: "Leads", render: (r) => num(r.leads_atribuidos) },
              { key: "matriculas", label: "Matrículas", render: (r) => String(Math.round(r.matriculas * 10) / 10).replace(".", ",") },
              { key: "faturamento", label: "Faturamento", render: (r) => brl(r.faturamento) },
            ]}
            rows={rowsGenericos}
            initialSort={{ key: "leads_atribuidos", dir: "desc" }}
            pageSize={5}
          />
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Contas da própria escola ou leads sem responsável atribuído. Ficam separadas para não distorcer médias e rankings, mas o volume continua visível.</div>
        </Panel>
      )}

      <Panel title="Tempo médio de primeira resposta por vendedor">
        <Placeholder label="Métrica em construção" detail="Ativada junto com o histórico de interações — mesma dependência da aba Funil & Perdas." />
      </Panel>
      <div style={{ fontSize: 11.5, color: T.muted }}>Matrícula = lead na etapa MATRÍCULA REALIZADA dos funis de venda, no período pesquisado (ALUNO FORMADO não conta). Com mais de um atendente no "Registro de Atendimento", a matrícula é rateada igualmente entre eles (por isso podem aparecer valores como 2,5). "Fechamento (dias)" = tempo médio entre a criação do lead e a matrícula.</div>
    </div>
  );
}

// ── Aba 4: Origem, Canal e Região ──
function AbaOrigem({ data, extra, schools }) {
  const origensRows = data.origens.filter((o) => schools.includes(o.school))
    .map((o) => ({ ...o, conversao: o.leads > 0 ? o.matriculas / o.leads : 0 }));

  const topOrigens = [...origensRows].sort((a, b) => b.leads - a.leads).slice(0, 8)
    .map((o) => ({ nome: o.origem.length > 22 ? o.origem.slice(0, 21) + "…" : o.origem, leads: o.leads, matriculas: o.matriculas, fill: SCHOOLS[o.school].color }));

  const regioesRows = data.regioes.filter((r) => schools.includes(r.school))
    .map((r) => ({ ...r, conversao: r.leads > 0 ? r.matriculas / r.leads : 0 }));

  const ufAgg = {};
  regioesRows.forEach((r) => {
    ufAgg[r.estado_uf] = ufAgg[r.estado_uf] || { uf: r.estado_uf };
    ufAgg[r.estado_uf][r.school] = (ufAgg[r.estado_uf][r.school] || 0) + r.leads;
  });
  const ufChart = Object.values(ufAgg)
    .map((r) => ({ ...r, total: schools.reduce((a, s) => a + (r[s] || 0), 0) }))
    .sort((a, b) => b.total - a.total).slice(0, 10);

  const campanhasReais = data.campanhas.filter((c) => schools.includes(c.school) && c.campanha && !c.campanha.includes("{"));
  const campanhasQuebradas = data.campanhas.filter((c) => schools.includes(c.school) && c.campanha && c.campanha.includes("{"));

  const grupos = extra ? extra.origem_grupos.filter((g) => schools.includes(g.school)) : [];
  const gruposChart = [...new Set(grupos.map((g) => g.grupo))].map((gr) => {
    const row = { grupo: gr };
    schools.forEach((s) => { row[s] = sum(grupos.filter((g) => g.grupo === gr && g.school === s), "leads"); });
    row._t = schools.reduce((a, s) => a + row[s], 0); return row;
  }).sort((a, b) => b._t - a._t);
  const cob = extra ? extra.cobertura.filter((c) => schools.includes(c.school)) : [];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title="Leads por grupo de origem (normalizado)">
        {gruposChart.length ? <div style={{ width: "100%", height: Math.max(180, gruposChart.length * 36 + 40) }}>
          <ResponsiveContainer>
            <BarChart data={gruposChart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
              <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="grupo" stroke={T.muted} fontSize={11} width={140} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
              {schools.map((s) => (
                <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                  <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div> : <Placeholder label="Carregando grupos de origem…" />}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginTop: 10 }}>
          {grupos.length > 0 && [...new Set(grupos.map((g) => g.grupo))].filter((gr) => gr !== "(sem origem)").map((gr) => {
            const rows = grupos.filter((g) => g.grupo === gr);
            const l = sum(rows, "leads"), m = sum(rows, "matriculas");
            return l >= 10 ? <div key={gr} style={{ fontSize: 11.5, color: T.muted }}><b style={{ color: T.text }}>{gr}</b>: {pct(m / l)} de conversão ({m}/{l})</div> : null;
          })}
        </div>
        {cob.length > 0 && <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
          Cobertura do campo Origem no período: {cob.map((c) => `${SCHOOLS[c.school].label} ${Math.round(c.com_origem / c.total * 100)}%`).join(" · ")} — "(sem origem)" é preenchimento pendente no Kommo, não um canal.
        </div>}
      </Panel>
      <Panel title="Leads e matrículas por origem (top 8)">
        {topOrigens.length ? (
          <div style={{ width: "100%", height: Math.max(180, topOrigens.length * 40 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={topOrigens} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" stroke={T.muted} fontSize={11} width={165} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                <Bar dataKey="leads" name="Leads" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  <LabelList dataKey="leads" position="right" fill={T.muted} fontSize={10.5} />
                </Bar>
                <Bar dataKey="matriculas" name="Matrículas" fill={T.green} radius={[0, 4, 4, 0]} maxBarSize={16}>
                  <LabelList dataKey="matriculas" position="right" fill={T.green} fontSize={10.5} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Origem ainda não preenchida nos leads deste período" />}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Barra colorida = escola da origem · barra verde = matrículas dessa origem</div>
      </Panel>

      <Panel title="Conversão por origem (matrículas ÷ leads da origem)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "origem", label: "Origem", style: { whiteSpace: "normal", minWidth: 170 } },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
          ]}
          rows={origensRows}
          initialSort={{ key: "leads", dir: "desc" }}
        />
      </Panel>

      <Panel title="Leads por estado (via DDD do telefone) — top 10">
        {ufChart.length ? (
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={ufChart} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="uf" stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={30} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem dados de região" detail="A extração de DDD depende da sincronização de contatos, que está em andamento — a cobertura cresce a cada hora." />}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Cobertura parcial: contatos ainda em sincronização — os números crescem conforme a base completa.</div>
      </Panel>

      <Panel title="Matrículas por estado (via DDD do telefone) — top 10">
        {(() => {
          const cm = {};
          regioesRows.forEach((e) => { cm[e.estado_uf] = cm[e.estado_uf] || { uf: e.estado_uf }; cm[e.estado_uf][e.school] = (cm[e.estado_uf][e.school] || 0) + Number(e.matriculas || 0); });
          const dataM = Object.values(cm).map((e) => ({ ...e, total: schools.reduce((a, s) => a + (e[s] || 0), 0) }))
            .filter((e) => e.total > 0).sort((a, b) => b.total - a.total).slice(0, 10);
          if (!dataM.length) return <Placeholder label="Sem matrículas com estado identificado no período" />;
          return <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dataM} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="uf" stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={30} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>;
        })()}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Matrículas por campanha (utm_campaign)">
          {campanhasReais.length ? (
            <DataTable
              columns={[
                { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                { key: "campanha", label: "Campanha" },
                { key: "leads", label: "Leads" },
                { key: "matriculas", label: "Matrículas" },
              ]}
              rows={campanhasReais}
              initialSort={{ key: "leads", dir: "desc" }}
              pageSize={6}
            />
          ) : (
            <Placeholder label="Atribuição de campanha indisponível" detail={campanhasQuebradas.length ? `Detectados ${sum(campanhasQuebradas, "leads")} leads com UTM literal "{campaignname}" — o macro do Meta não está sendo substituído no anúncio. Corrigir o parâmetro de URL na captação (Kwid) para ativar este bloco.` : "Apenas 0,1% dos leads têm utm_campaign preenchida. Configurar UTMs nos anúncios + gravação no Kwid para ativar este bloco."} />
          )}
        </Panel>
        <Panel title="Matrículas por canal (Duotalk, WhatsApp, formulário…)">
          <Placeholder label='Campo "Canal" não configurado no Kommo' detail="O checklist da especificação (seção 3) prevê um campo customizado de Canal no lead. Assim que for criado e preenchido na entrada, este bloco liga sozinho — sem mudança de código." />
        </Panel>
      </div>
    </div>
  );
}

// ── Aba 5: Financeiro & Produto ──
function AbaFinanceiro({ data, schools }) {
  const cursosRows = data.cursos.filter((c) => schools.includes(c.school));
  const pagRows = data.pagamentos.filter((p) => schools.includes(p.school));

  const topCursos = [...cursosRows].sort((a, b) => b.faturamento - a.faturamento).slice(0, 8)
    .map((c) => ({ nome: (c.curso.length > 26 ? c.curso.slice(0, 25) + "…" : c.curso) + ` (${SCHOOLS[c.school].label.slice(0, 3)})`, faturamento: c.faturamento, fill: SCHOOLS[c.school].color }));

  const pagAgg = {};
  pagRows.forEach((p) => {
    pagAgg[p.forma] = pagAgg[p.forma] || { forma: p.forma };
    pagAgg[p.forma][p.school] = (pagAgg[p.forma][p.school] || 0) + Number(p.faturamento);
  });
  const pagChart = Object.values(pagAgg).sort((a, b) =>
    schools.reduce((x, s) => x + (b[s] || 0), 0) - schools.reduce((x, s) => x + (a[s] || 0), 0));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title="Faturamento por curso (top 8)">
        {topCursos.length ? (
          <div style={{ width: "100%", height: Math.max(180, topCursos.length * 40 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={topCursos} layout="vertical" margin={{ top: 0, right: 70, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => "R$" + (v / 1000).toFixed(0) + "k"} />
                <YAxis type="category" dataKey="nome" stroke={T.muted} fontSize={10.5} width={215} tickLine={false} axisLine={false} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: font }}>
                    <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
                    <div>{brl(payload[0].value)}</div>
                  </div>
                ) : null} cursor={{ fill: "#00000006" }} />
                <Bar dataKey="faturamento" name="Faturamento" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  <LabelList dataKey="faturamento" position="right" fill={T.text} fontSize={10.5} formatter={(v) => brl(v)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem matrículas com curso no período" />}
      </Panel>

      <Panel title="Ranking de cursos (matrículas, faturamento e ticket)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "curso", label: "Curso", style: { whiteSpace: "normal", minWidth: 200 } },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "faturamento", label: "Faturamento", render: (r) => brl(r.faturamento) },
            { key: "ticket_medio", label: "Ticket médio", render: (r) => brl(r.ticket_medio) },
            { key: "leads", label: "Fechamentos", render: (r) => num(r.leads) },
          ]}
          rows={cursosRows}
          initialSort={{ key: "faturamento", dir: "desc" }}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Faturamento por forma de pagamento">
          {pagChart.length ? (
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={pagChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barGap={3}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="forma" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                  <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => "R$" + (v / 1000).toFixed(0) + "k"} />
                  <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                    <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: font }}>
                      <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
                      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <b>{brl(p.value)}</b></div>)}
                    </div>
                  ) : null} cursor={{ fill: "#00000006" }} />
                  {schools.map((s) => (
                    <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={34} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <Placeholder label="Sem matrículas no período" />}
          <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>"(não informado)" = matrículas sem o campo Forma de Pagamento preenchido no Kommo.</div>
        </Panel>

        <Panel title="Descontos aplicados">
          <Placeholder label='Campo "Desconto" não configurado no Kommo' detail="O checklist da especificação (seção 3) prevê um campo de desconto (%) no lead. Assim que existir e for preenchido no fechamento, o dashboard passa a mostrar % de matrículas com desconto e desconto médio — sem mudança de código." />
        </Panel>
      </div>
    </div>
  );
}



// ── Aba 6: Metas & Comissões ──
function AbaMetas({ data, periodoFrom, onSaved }) {
  const [faixas, setFaixas] = useState(() => (data.faixas || []).map((f) => ({ ...f })));
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);
  useEffect(() => { setFaixas((data.faixas || []).map((f) => ({ ...f }))); }, [data.faixas]);

  const mesRef = periodoFrom ? String(periodoFrom).slice(0, 7) : "";
  const set = (i, campo, valor) => setFaixas((fs) => fs.map((f, j) => (j === i ? { ...f, [campo]: campo === "nome" ? valor : valor } : f)));
  const addFaixa = () => setFaixas((fs) => [...fs, { nome: "Nova faixa", min: 0, boleto: 0, cartao: 0, pix: 0 }]);
  const delFaixa = (i) => setFaixas((fs) => fs.filter((_, j) => j !== i));

  const salvar = () => {
    setSalvando(true); setMsg(null);
    const payload = faixas.map((f) => ({ nome: f.nome, min: Number(f.min) || 0, boleto: Number(f.boleto) || 0, cartao: Number(f.cartao) || 0, pix: Number(f.pix) || 0 }));
    fetch(`${SUPABASE_URL}/rest/v1/rpc/metas_set`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: window.EDILVO_ANON_KEY, Authorization: `Bearer ${window.EDILVO_ANON_KEY}` },
      body: JSON.stringify({ p_token: RPC_TOKEN, p_month: String(periodoFrom || "").slice(0, 8) + "01", p_faixas: payload }),
    })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(() => { setSalvando(false); setMsg("Metas salvas — relatórios recalculados."); if (onSaved) onSaved(); })
      .catch((e) => { setSalvando(false); setMsg("Não foi possível salvar (" + e.message + ")."); });
  };

  const inp = { background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 6, padding: "5px 8px", fontSize: 12.5, fontFamily: font, width: "100%" };
  const th = { textAlign: "left", padding: "6px 8px", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".06em", color: T.muted, borderBottom: `1px solid ${T.border}` };

  const porPessoa = {};
  (data.vendedores || []).forEach((v) => {
    if (!porPessoa[v.vendedor]) porPessoa[v.vendedor] = { vendedor: v.vendedor, matriculas: 0, boleto: 0, cartao: 0, pix: 0, sem_forma: 0, comissao: 0, faixa_nome: v.faixa_nome, falta_proxima: v.falta_proxima };
    const p = porPessoa[v.vendedor];
    p.matriculas += Number(v.matriculas || 0);
    p.boleto += Number(v.m_boleto || 0);
    p.cartao += Number(v.m_cartao || 0);
    p.pix += Number(v.m_pix || 0);
    p.sem_forma += Number(v.m_sem_forma || 0);
    p.comissao += Number(v.comissao || 0);
    if (v.faixa_nome) { p.faixa_nome = v.faixa_nome; p.falta_proxima = v.falta_proxima; }
  });
  const pessoas = Object.values(porPessoa).filter((p) => p.matriculas > 0).sort((a, b) => b.matriculas - a.matriculas);
  const totalComissao = pessoas.reduce((a, p) => a + p.comissao, 0);
  const semForma = pessoas.reduce((a, p) => a + p.sem_forma, 0);
  const d1 = (n) => String(Math.round(Number(n || 0) * 10) / 10).replace(".", ",");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title={`Tabela de metas e premiação — ${mesRef ? mesRef.split("-").reverse().join("/") : "mês do período"}`}
        right={<button onClick={salvar} disabled={salvando} style={{ background: T.ink, color: T.onInk, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: font, opacity: salvando ? 0.5 : 1 }}>{salvando ? "Salvando…" : "Salvar metas"}</button>}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <th style={th}>Faixa</th><th style={th}>A partir de (matrículas)</th>
              <th style={th}>Boleto (R$)</th><th style={th}>Cartão (R$)</th><th style={th}>PIX (R$)</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {faixas.map((f, i) => (
                <tr key={i}>
                  <td style={{ padding: "5px 8px", minWidth: 130 }}><input value={f.nome == null ? "" : f.nome} onChange={(e) => set(i, "nome", e.target.value)} style={inp} /></td>
                  <td style={{ padding: "5px 8px", width: 130 }}><input type="number" value={f.min == null ? "" : f.min} onChange={(e) => set(i, "min", e.target.value)} style={inp} /></td>
                  <td style={{ padding: "5px 8px", width: 110 }}><input type="number" step="0.01" value={f.boleto == null ? "" : f.boleto} onChange={(e) => set(i, "boleto", e.target.value)} style={inp} /></td>
                  <td style={{ padding: "5px 8px", width: 110 }}><input type="number" step="0.01" value={f.cartao == null ? "" : f.cartao} onChange={(e) => set(i, "cartao", e.target.value)} style={inp} /></td>
                  <td style={{ padding: "5px 8px", width: 110 }}><input type="number" step="0.01" value={f.pix == null ? "" : f.pix} onChange={(e) => set(i, "pix", e.target.value)} style={inp} /></td>
                  <td style={{ padding: "5px 8px", width: 34 }}><button onClick={() => delFaixa(i)} title="Remover faixa" style={{ background: "transparent", border: `1px solid ${T.border}`, borderRadius: 6, color: T.muted, cursor: "pointer", width: 26, height: 26, fontFamily: font }}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={addFaixa} style={{ background: T.panelSoft, color: T.ink, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: font }}>+ Adicionar faixa</button>
          {msg && <span style={{ fontSize: 12, color: msg.indexOf("salvas") > 0 ? T.green : T.red }}>{msg}</span>}
        </div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          As metas valem por mês e são iguais para as duas empresas. A faixa de cada atendente vem do total de matrículas do mês somando Matrícula EAD e Ineprotec; a comissão é calculada matrícula a matrícula pelo valor da forma de pagamento na faixa atingida. Ao salvar, o mês do período selecionado é atualizado e os relatórios recalculam.
        </div>
      </Panel>

      <Panel title="Comissões do período por atendente">
        <DataTable
          columns={[
            { key: "vendedor", label: "Atendente", style: { fontWeight: 500 } },
            { key: "matriculas", label: "Matrículas", render: (p) => d1(p.matriculas) },
            { key: "faixa_nome", label: "Faixa", render: (p) => {
              const base = !p.faixa_nome || p.faixa_nome === "Base";
              return <span style={{ color: base ? T.muted : T.green, fontWeight: base ? 400 : 600 }}>{p.faixa_nome || "—"}{base ? "" : " ✓"}</span>;
            } },
            { key: "falta_proxima", label: "Falta p/ próxima", render: (p) => (p.falta_proxima == null ? "—" : d1(p.falta_proxima)) },
            { key: "boleto", label: "Boleto", render: (p) => d1(p.boleto) },
            { key: "cartao", label: "Cartão", render: (p) => d1(p.cartao) },
            { key: "pix", label: "PIX", render: (p) => d1(p.pix) },
            { key: "sem_forma", label: "Sem forma", render: (p) => (p.sem_forma > 0 ? <span style={{ color: T.amber }}>{d1(p.sem_forma)}</span> : "0") },
            { key: "comissao", label: "Comissão", render: (p) => <b>{brl(p.comissao)}</b> },
          ]}
          rows={pessoas}
          initialSort={{ key: "matriculas", dir: "desc" }}
          pageSize={15}
        />
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>Total de comissões no período: <b>{brl(totalComissao)}</b></div>
          {semForma > 0 && <div style={{ fontSize: 11.5, color: T.amber }}>⚠ {d1(semForma)} matrículas sem forma de pagamento no Kommo — contam para a faixa, mas não geram comissão até o campo ser preenchido.</div>}
        </div>
      </Panel>
    </div>
  );
}


// ── Indicador de frescor dos dados ──
function FreshChip({ fresh }) {
  const hoje = new Date();
  const diasDe = (v) => { if (!v) return null; const d = new Date(v); return Math.floor((hoje - d) / 86400000); };
  const itens = [
    { lab: "Kommo", d: diasDe(fresh.kommo), lim: 1 },
    { lab: "Google", d: diasDe(fresh.google), lim: 2 },
    { lab: "Meta", d: diasDe(fresh.meta), lim: 2 },
  ];
  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center", marginRight: 6, fontSize: 11, color: T.muted }}>
      {itens.map((i) => (
        <span key={i.lab} title={`Última atualização: ${i.d == null ? "—" : i.d === 0 ? "hoje" : i.d + " dia(s) atrás"}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: i.d == null ? T.muted : i.d <= i.lim ? T.green : i.d <= i.lim + 3 ? T.amber : T.red }} />
          {i.lab}
        </span>
      ))}
    </span>
  );
}

// ── Aba 7: Agente SDR ──
function AbaSDR({ sdr, schools }) {
  if (!sdr) return <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando métricas do agente…</div>;
  const resumo = (sdr.resumo || []).filter((r) => schools.includes(r.school));
  if (!resumo.length) return <Placeholder label="Sem movimentações na etapa de triagem no período" detail="O histórico de etapas é coletado por webhook — períodos anteriores à ativação não têm dados retroativos." />;

  const cards = (r) => {
    const c = SCHOOLS[r.school].color;
    const convDireta = r.leads_processados > 0 ? r.matriculas_diretas / r.leads_processados : null;
    const convHumano = r.p_atendimento_humano > 0 ? r.convertidos_por_humano / r.p_atendimento_humano : null;
    return (
      <div key={r.school} style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={r.school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10 }}>
          <Kpi accent={c} label="Leads recebidos" value={num(r.leads_recebidos)} />
          <Kpi accent={c} label="Na fila agora" value={num(r.em_triagem_agora)} />
          <Kpi accent={c} label="Processados" value={num(r.leads_processados)} />
          <Kpi accent={c} label="Matrículas diretas" value={num(r.matriculas_diretas)} />
          <Kpi accent={c} label="Conversão direta" value={pct(convDireta)} />
          <Kpi accent={c} label="Receita direta" value={brl(r.receita_direta)} />
          <Kpi accent={c} label="Enviados p/ humano" value={num(r.p_atendimento_humano)} />
          <Kpi accent={c} label="Convertidos pós-handoff" value={`${num(r.convertidos_por_humano)} · ${pct(convHumano)}`} />
          <Kpi accent={c} label="Sem resposta" value={num(r.sem_resposta)} />
          <Kpi accent={c} label="Perdas na triagem" value={num(r.perdas)} invert />
          <Kpi accent={c} label="Tempo médio na triagem" value={r.horas_medias_triagem != null ? `${String(r.horas_medias_triagem).replace(".", ",")} h` : "—"} />
        </div>
      </div>
    );
  };

  const dest = (sdr.destinos || []).filter((d) => schools.includes(d.school));
  const rotulos = { matricula_direta: "Matrícula direta", atendimento_humano: "Atendimento humano", sem_resposta: "Sem resposta", perda: "Perda", retorno: "Retorno ao início" };
  const destChart = [...new Set(dest.map((d) => d.destino))].map((k) => {
    const row = { destino: rotulos[k] || k };
    schools.forEach((s) => { row[s] = sum(dest.filter((d) => d.destino === k && d.school === s), "movs"); });
    row._t = schools.reduce((a, s) => a + row[s], 0);
    return row;
  }).sort((a, b) => b._t - a._t);

  const serie = (sdr.serie || []).filter((s) => schools.includes(s.school));
  const dias = [...new Set(serie.map((s) => s.dia))].sort();
  const serieChart = dias.map((d) => {
    const row = { dia: d.slice(8, 10) + "/" + d.slice(5, 7) };
    ["entradas", "diretas", "humano", "perdas"].forEach((k) => { row[k] = sum(serie.filter((s) => s.dia === d), k); });
    return row;
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>{resumo.map(cards)}</div>

      <Panel title="Para onde o agente encaminha os leads">
        {destChart.length ? (
          <div style={{ width: "100%", height: Math.max(180, destChart.length * 42 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={destChart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="destino" stroke={T.muted} fontSize={11} width={150} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={16}>
                    <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem saídas da triagem no período" />}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Base: movimentações que saíram da etapa TRIAGEM E QUALIFICAÇÃO, onde o agente atua.</div>
      </Panel>

      <Panel title="Fluxo diário da triagem">
        {serieChart.length ? (
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={serieChart} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="dia" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="entradas" name="Entradas" stroke={T.ink} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="diretas" name="Matrículas diretas" stroke={T.green} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humano" name="Enviados p/ humano" stroke={T.steel} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="perdas" name="Perdas" stroke={T.red} strokeWidth={2} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem série no período" />}
      </Panel>

      <Panel title="Detalhe por etapa de destino">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "destino", label: "Tipo de saída", render: (r) => rotulos[r.destino] || r.destino },
            { key: "etapa_destino", label: "Etapa de destino", style: { whiteSpace: "normal", minWidth: 180 } },
            { key: "movs", label: "Leads", render: (r) => num(r.movs) },
          ]}
          rows={dest}
          initialSort={{ key: "movs", dir: "desc" }}
        />
      </Panel>
    </div>
  );
}

// ── Aba 8: Jornada & Origem ──
function AbaJornada({ jor, schools }) {
  if (!jor) return <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando jornada…</div>;
  const canais = (jor.por_canal || []).filter((c) => schools.includes(c.school));
  const origens = (jor.por_origem || []).filter((c) => schools.includes(c.school));
  const jornada = (jor.jornada || []).filter((c) => schools.includes(c.school));
  const tempos = (jor.tempos_etapa || []).filter((c) => schools.includes(c.school));
  const ciclo = (jor.ciclo || []).filter((c) => schools.includes(c.school));
  const preenchimento = (jor.preenchimento || []).filter((c) => schools.includes(c.school));
  const origemMatr = (jor.origem_matricula || []).filter((c) => schools.includes(c.school));

  const canalChart = [...new Set(canais.map((c) => c.canal))].map((k) => {
    const row = { canal: k };
    schools.forEach((s) => { row[s] = sum(canais.filter((c) => c.canal === k && c.school === s), "leads"); });
    row._t = schools.reduce((a, s) => a + row[s], 0);
    return row;
  }).sort((a, b) => b._t - a._t);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {ciclo.map((c) => (
          <Kpi key={c.school} accent={SCHOOLS[c.school].color} label={`Ciclo de venda · ${SCHOOLS[c.school].label}`}
            value={c.dias_ate_matricula != null ? `${String(c.dias_ate_matricula).replace(".", ",")} dias` : "—"} />
        ))}
        {preenchimento.map((p) => (
          <Kpi key={p.school + "p"} accent={SCHOOLS[p.school].color} label={`Origem preenchida · ${SCHOOLS[p.school].label}`}
            value={`${String(p.pct_preenchido).replace(".", ",")}%`} />
        ))}
      </div>

      <Panel title="Leads por canal de origem">
        {canalChart.length ? (
          <div style={{ width: "100%", height: Math.max(180, canalChart.length * 38 + 40) }}>
            <ResponsiveContainer>
              <BarChart data={canalChart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="canal" stroke={T.muted} fontSize={11} width={150} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                    <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem canais identificados no período" />}
      </Panel>

      <Panel title="Desempenho por canal (leads → matrículas → receita)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "canal", label: "Canal" },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "perdidos", label: "Perdidos", render: (r) => num(r.perdidos) },
            { key: "conv_pct", label: "Conversão", render: (r) => `${String(r.conv_pct).replace(".", ",")}%` },
            { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
          ]}
          rows={canais}
          initialSort={{ key: "leads", dir: "desc" }}
        />
      </Panel>

      <Panel title="Desempenho por campanha (valor gravado em Origem do Lead)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "origem", label: "Origem", style: { whiteSpace: "normal", minWidth: 170 } },
            { key: "canal", label: "Canal" },
            { key: "campanha", label: "Campanha" },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "conv_pct", label: "Conversão", render: (r) => `${String(r.conv_pct).replace(".", ",")}%` },
            { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
          ]}
          rows={origens}
          initialSort={{ key: "leads", dir: "desc" }}
          pageSize={12}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Onde os leads estão hoje (jornada por etapa)">
          <DataTable
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "etapa", label: "Etapa", style: { whiteSpace: "normal", minWidth: 160 } },
              { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            ]}
            rows={jornada}
            initialSort={{ key: "leads", dir: "desc" }}
            pageSize={8}
          />
        </Panel>

        <Panel title="Tempo médio de permanência por etapa">
          {tempos.length ? (
            <DataTable
              columns={[
                { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                { key: "etapa", label: "Etapa", style: { whiteSpace: "normal", minWidth: 160 } },
                { key: "horas_medias", label: "Horas (média)", render: (r) => String(r.horas_medias).replace(".", ",") },
              ]}
              rows={tempos}
              initialSort={{ key: "horas_medias", dir: "desc" }}
              pageSize={8}
            />
          ) : <Placeholder label="Amostra insuficiente" detail="Medido pelo histórico de mudanças de etapa (webhook), que engrossa a cada semana." />}
        </Panel>
      </div>

      <Panel title="De onde vêm as matrículas (canal × receita × velocidade)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "canal", label: "Canal" },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
            { key: "dias_ate_matricula", label: "Dias até matricular", render: (r) => r.dias_ate_matricula == null ? "—" : String(r.dias_ate_matricula).replace(".", ",") },
          ]}
          rows={origemMatr}
          initialSort={{ key: "receita", dir: "desc" }}
        />
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Rastreio pelo campo Origem do Lead no Kommo — canal e campanha extraídos do padrão gravado na entrada.</div>
      </Panel>
    </div>
  );
}

// ═══════════════ MENU 2: MARKETING ═══════════════
function MenuMarketing({ mkt, qual, schools }) {
  if (!mkt) return <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando dados de mídia…</div>;
  const kpis = mkt.kpis.filter((k) => schools.includes(k.school));
  const kpisAnt = mkt.kpis_ant || [];
  const campanhas = mkt.campanhas.filter((c) => schools.includes(c.school));
  const canais = (mkt.kommo_por_canal || []).filter((c) => schools.includes(c.school));
  const budgets = (mkt.budgets || []).filter((b) => schools.includes(b.school));

  const agg = (rows, school, ch) => rows.filter((k) => k.school === school && (!ch || k.channel === ch));
  const kpiRow = (school) => {
    const rows = agg(kpis, school), ant = agg(kpisAnt, school);
    const spend = sum(rows, "spend"), leads = sum(rows, "leads"), clicks = sum(rows, "clicks");
    const spendAnt = sum(ant, "spend"), leadsAnt = sum(ant, "leads");
    const cpl = leads > 0 ? spend / leads : null, cplAnt = leadsAnt > 0 ? spendAnt / leadsAnt : null;
    const c = SCHOOLS[school].color;
    return (
      <div key={school} style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10 }}>
          <Kpi accent={c} label="Investimento" value={brl(spend)} delta={deltaPct(spend, spendAnt)} invert />
          <Kpi accent={c} label="Leads (mídia)" value={num(leads)} delta={deltaPct(leads, leadsAnt)} />
          <Kpi accent={c} label="CPL" value={cpl != null ? brl(cpl) : "—"} delta={cpl != null && cplAnt != null ? (cpl - cplAnt) / cplAnt : null} invert />
          <Kpi accent={c} label="Cliques" value={num(clicks)} />
          <Kpi accent={c} label="CPQL / ROAS" value="—" />
        </div>
      </div>
    );
  };

  const distData = schools.map((s) => ({
    escola: SCHOOLS[s].label,
    google: sum(agg(kpis, s, "google"), "spend"),
    meta: sum(agg(kpis, s, "meta"), "spend"),
  }));

  const cplMedio = (() => { const withLeads = campanhas.filter((c) => c.leads > 0 && c.cpl != null); return withLeads.length ? sum(withLeads, "spend") / sum(withLeads, "leads") : null; })();
  const alertas = campanhas.filter((c) => c.leads > 0 && c.cpl != null && cplMedio && c.cpl > cplMedio * 1.4);

  const compData = ["google", "meta"].map((ch) => {
    const rows = kpis.filter((k) => k.channel === ch);
    const spend = sum(rows, "spend"), leads = sum(rows, "leads"), clicks = sum(rows, "clicks"), impr = sum(rows, "impressions");
    return { plataforma: ch === "google" ? "Google" : "Meta", investimento: spend, leads, cpl: leads > 0 ? Math.round(spend / leads * 100) / 100 : 0, ctr: impr > 0 ? Math.round(clicks / impr * 10000) / 100 : 0 };
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>{schools.map(kpiRow)}</div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: -8 }}>CPQL e ROAS dependem da atribuição de campanha (UTM) na captação — ativam junto com o Bloco Funil abaixo.</div>

      <Panel title="Distribuição de investimento — Meta × Google">
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={distData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barGap={3}>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="escola" stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => "R$" + (v / 1000).toFixed(1) + "k"} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: font }}>
                  <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
                  {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <b>{brl(p.value)}</b></div>)}
                </div>) : null} cursor={{ fill: "#00000006" }} />
              <Bar dataKey="google" name="Google Ads" fill="#4285F4" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="meta" name="Meta Ads" fill="#0668E1" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!kpis.some((k) => k.channel === "meta") && <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Sem investimento Meta atribuível às escolas no período — a única campanha ativa não tem prefixo de escola no nome (aparecerá aqui quando os nomes forem padronizados).</div>}
      </Panel>

      <Panel title="Investimento e leads por dia — Meta × Google">
        {(() => {
          const serie = (mkt.serie_diaria || []).filter((s) => schools.includes(s.school));
          const dias = [...new Set(serie.map((s) => s.dia))].sort();
          if (!dias.length) return <Placeholder label="Sem investimento no período" />;
          const dd = dias.map((d) => {
            const row = { dia: d.slice(8, 10) + "/" + d.slice(5, 7) };
            ["google", "meta"].forEach((ch) => {
              row[ch] = sum(serie.filter((s) => s.dia === d && s.channel === ch), "spend");
              row[ch + "_leads"] = sum(serie.filter((s) => s.dia === d && s.channel === ch), "leads");
            });
            return row;
          });
          return <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer>
              <LineChart data={dd} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="dia" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => "R$" + v.toFixed(0)} />
                <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                  <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontFamily: font }}>
                    <div style={{ color: T.muted, marginBottom: 4 }}>{label}</div>
                    {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: <b>{p.name.includes("leads") ? num(p.value) : brl(p.value)}</b></div>)}
                  </div>) : null} />
                <Line type="monotone" dataKey="google" name="Google (R$)" stroke="#4285F4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="meta" name="Meta (R$)" stroke="#0668E1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="google_leads" name="Google leads" stroke="#4285F4" strokeWidth={2} strokeOpacity={0.4} strokeDasharray="4 3" dot={false} />
                <Line type="monotone" dataKey="meta_leads" name="Meta leads" stroke="#0668E1" strokeWidth={2} strokeOpacity={0.4} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>;
        })()}
      </Panel>

      <Panel title="Performance por campanha">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "channel", label: "Canal", render: (r) => r.channel === "google" ? "Google" : "Meta" },
            { key: "campaign_name", label: "Campanha", style: { whiteSpace: "normal", minWidth: 180 } },
            { key: "spend", label: "Invest.", render: (r) => brl(r.spend) },
            { key: "impressions", label: "Impr.", render: (r) => num(r.impressions) },
            { key: "clicks", label: "Cliques", render: (r) => num(r.clicks) },
            { key: "ctr", label: "CTR", render: (r) => r.ctr != null ? String(r.ctr).replace(".", ",") + "%" : "—" },
            { key: "cpc", label: "CPC", render: (r) => r.cpc != null ? brl(r.cpc) : "—" },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "cpl", label: "CPL", render: (r) => r.cpl != null ? brl(r.cpl) : "—" },
          ]}
          rows={campanhas}
          initialSort={{ key: "spend", dir: "desc" }}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Qualidade & Diagnóstico">
          {alertas.length ? (
            <div style={{ marginBottom: 12 }}>
              {alertas.map((a, i) => (
                <div key={i} style={{ border: `1px solid ${T.red}44`, background: T.red + "0d", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 6 }}>
                  ⚠ <b>{a.campaign_name}</b> ({SCHOOLS[a.school].label}) — CPL {brl(a.cpl)}, {Math.round((a.cpl / cplMedio - 1) * 100)}% acima da média ({brl(cplMedio)})
                </div>
              ))}
            </div>
          ) : <div style={{ fontSize: 12.5, color: T.green, marginBottom: 12 }}>✓ Nenhuma campanha com CPL 40% acima da média no período</div>}
          <Placeholder label="Diagnósticos de relevância (Meta) e Quality Score (Google)" detail="Rankings categóricos do Meta (Acima/Média/Abaixo — nunca somados) e % de termos com Quality Score < 5 no Google (nunca média geral) entram quando a sincronização desses campos for ativada nas APIs." />
        </Panel>

        <Panel title="Metas & Pacing">
          {budgets.length ? (
            budgets.map((b, i) => {
              const rows = agg(kpis, b.school);
              const gasto = sum(rows, "spend");
              const hoje = new Date(); const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
              const pctMes = hoje.getDate() / diasMes, pctGasto = b.budget > 0 ? gasto / Number(b.budget) : 0;
              const proj = pctMes > 0 ? gasto / pctMes : 0;
              return (
                <div key={i} style={{ marginBottom: 10, fontSize: 12.5 }}>
                  <SchoolTag school={b.school} /> — orçamento {brl(b.budget)} · gasto {brl(gasto)} ({pct(pctGasto)}) · mês {pct(pctMes)} · projeção {brl(proj)}
                </div>
              );
            })
          ) : (
            <Placeholder label="Metas do mês não definidas" detail='Preencha a tabela marketing_budgets no Supabase (escola, mês, orçamento, meta de leads/matrículas/receita) e este bloco liga sozinho: orçamento vs. gasto, pacing do mês e projeção de fechamento.' />
          )}
        </Panel>
      </div>

      <Panel title="Leads e investimento por campanha (origem Kommo × plataformas)">
        {(() => {
          const kc = (mkt.kommo_por_campanha || []).filter((k) => schools.includes(k.school));
          if (!kc.length) return <Placeholder label="Nenhum lead com campanha atribuída no período" detail="A atribuição pela especificação de campanha no campo Origem alimenta este bloco automaticamente." />;
          const nrm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
          const rows = kc.map((k) => {
            const ad = campanhas.find((c) => c.school === k.school && (nrm(c.campaign_name).includes(nrm(k.campanha)) || nrm(k.campanha).includes(nrm(c.campaign_name))));
            const inv = ad ? Number(ad.spend) : null;
            return { ...k, investimento: inv, cpl_real: inv != null && k.leads > 0 ? inv / k.leads : null, cac: inv != null && k.matriculas > 0 ? inv / k.matriculas : null };
          });
          return <DataTable
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "campanha", label: "Campanha (Origem)", style: { whiteSpace: "normal", minWidth: 180 } },
              { key: "leads", label: "Leads", render: (r) => num(r.leads) },
              { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
              { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
              { key: "investimento", label: "Investimento", render: (r) => r.investimento != null ? brl(r.investimento) : "—" },
              { key: "cpl_real", label: "CPL real", render: (r) => r.cpl_real != null ? brl(r.cpl_real) : "—" },
              { key: "cac", label: "CAC", render: (r) => r.cac != null ? brl(r.cac) : "—" },
            ]}
            rows={rows} initialSort={{ key: "leads", dir: "desc" }} />;
        })()}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Investimento cruzado quando o nome no campo Origem corresponde ao nome da campanha no Meta/Google Ads — padronize os nomes para o cruzamento completo.</div>
      </Panel>

      <Panel title="Funil Mídia → Comercial (leads do Kommo por canal de origem)">
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "canal", label: "Canal (utm_source)" },
            { key: "leads", label: "Leads" },
            { key: "matriculas", label: "Matrículas" },
          ]}
          rows={canais}
          initialSort={{ key: "leads", dir: "desc" }}
          pageSize={6}
        />
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
          Quase todos os leads aparecem como "organico" porque as UTMs não estão sendo gravadas na captação (só 0,1% têm utm preenchida, e o macro do Meta está literal). Corrigindo os parâmetros de URL nos anúncios + gravação no Kwid, este funil passa a atribuir lead pago → matrícula por campanha, e o CPQL/ROAS do topo ligam automaticamente.
        </div>
      </Panel>

      <Panel title="Atribuição de mídia — leads reportados × leads rastreados pela Origem">
        {qual && qual.atribuicao_midia && qual.atribuicao_midia.filter((a) => schools.includes(a.school)).length ? (
          <>
            <DataTable
              columns={[
                { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                { key: "canal", label: "Canal", render: (r) => r.canal === "GOOGLE" ? "Google" : "Meta" },
                { key: "spend", label: "Investimento", render: (r) => brl(r.spend) },
                { key: "leads_reportados", label: "Leads (plataforma)", render: (r) => num(r.leads_reportados) },
                { key: "leads_origem", label: "Leads (Origem no Kommo)", render: (r) => num(r.leads_origem) },
                { key: "cpl_origem", label: "CPL pela Origem", render: (r) => r.cpl_origem != null ? brl(r.cpl_origem) : "—" },
                { key: "matriculas_origem", label: "Matrículas", render: (r) => num(r.matriculas_origem) },
              ]}
              rows={qual.atribuicao_midia.filter((a) => schools.includes(a.school))}
              initialSort={{ key: "spend", dir: "desc" }}
            />
            <div style={{ border: `1px solid ${T.amber}55`, background: T.amber + "0d", borderRadius: 8, padding: "10px 12px", fontSize: 11.5, color: T.text, marginTop: 10, lineHeight: 1.6 }}>
              <b>Como ler estas duas colunas.</b> "Leads (plataforma)" é o que Meta e Google reportam; "Leads (Origem no Kommo)" é o que foi efetivamente rastreado na entrada do lead.
              O Meta reporta zero porque as conversões de mensagem não voltam para a plataforma — a Origem é a fonte confiável para ele.
              O Google aparece subestimado na coluna da Origem: os cliques de busca paga chegam ao Kommo como SITE, e não como GOOGLE, até que a captação diferencie tráfego pago de orgânico.
              Enquanto isso, use a plataforma para o Google e a Origem para o Meta.
            </div>
          </>
        ) : <Placeholder label="Sem investimento no período" />}
      </Panel>

      <Panel title="Comparativo Meta × Google (leads reportados pelas plataformas)">
        <DataTable
          columns={[
            { key: "plataforma", label: "Plataforma", style: { fontWeight: 500 } },
            { key: "investimento", label: "Investimento", render: (r) => brl(r.investimento) },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "cpl", label: "CPL", render: (r) => r.leads > 0 ? brl(r.cpl) : "—" },
            { key: "ctr", label: "CTR", render: (r) => String(r.ctr).replace(".", ",") + "%" },
          ]}
          rows={compData}
          initialSort={{ key: "investimento", dir: "desc" }}
        />
      </Panel>
    </div>
  );
}

// ═══════════════ MENU 3: HOME EXECUTIVO ═══════════════
function MenuHome({ data, mkt, extra, qual, schools, goTo }) {
  if (!data || !mkt) return <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando…</div>;
  const budgets = (mkt.budgets || []).filter((b) => schools.includes(b.school));

  const linha = (school) => {
    const mk = mkt.kpis.filter((k) => k.school === school);
    const fe = bySchool(data.fechamentos, school)[0] || {};
    const vg = bySchool(data.visao_geral, school)[0] || {};
    const spend = sum(mk, "spend"), clicks = sum(mk, "clicks"), leadsMidia = sum(mk, "leads");
    const cac = fe.matriculas > 0 ? spend / fe.matriculas : null;
    return { school, spend, clicks, leadsMidia, leadsKommo: vg.leads || 0, matriculas: fe.matriculas || 0, receita: Number(fe.faturamento || 0), cpl: leadsMidia > 0 ? spend / leadsMidia : null, cac };
  };
  const linhas = schools.map(linha);

  // Funil herói por escola
  const funilHero = (l) => {
    const c = SCHOOLS[l.school].color;
    const steps = [
      ["Investimento", brl(l.spend)], ["Cliques", num(l.clicks)], ["Leads mídia", num(l.leadsMidia)],
      ["Leads Kommo", num(l.leadsKommo)], ["Matrículas", num(l.matriculas)], ["Receita", brl(l.receita)],
    ];
    return (
      <div key={l.school} style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={l.school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 0, alignItems: "stretch" }}>
          {steps.map(([lab, val], i) => (
            <div key={lab} style={{ position: "relative", background: i === steps.length - 1 ? c + "18" : T.panelSoft, border: `1px solid ${T.border}`, borderLeft: i === 0 ? `3px solid ${c}` : `1px solid ${T.border}`, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".05em", color: T.muted }}>{lab}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Top 3 alertas automáticos
  const alertas = [];
  const campComLeads = mkt.campanhas.filter((c) => schools.includes(c.school) && c.leads > 0 && c.cpl != null);
  if (campComLeads.length > 1) {
    const cplMed = sum(campComLeads, "spend") / sum(campComLeads, "leads");
    const ruins = campComLeads.filter((c) => c.cpl > cplMed * 1.4).sort((a, b) => b.cpl - a.cpl);
    if (ruins.length) alertas.push({ tipo: "CPL alto", texto: `${ruins[0].campaign_name} (${SCHOOLS[ruins[0].school].label}) com CPL ${brl(ruins[0].cpl)} — ${Math.round((ruins[0].cpl / cplMed - 1) * 100)}% acima da média` });
  }
  const perdas = data.motivos_perda.filter((m) => schools.includes(m.school) && m.motivo !== "(sem motivo)");
  if (perdas.length) {
    const porMotivo = {}; perdas.forEach((m) => { porMotivo[m.motivo] = (porMotivo[m.motivo] || 0) + m.qtd; });
    const [motivo, qtd] = Object.entries(porMotivo).sort((a, b) => b[1] - a[1])[0];
    const total = perdas.reduce((a, m) => a + m.qtd, 0);
    if (qtd / total > 0.25) alertas.push({ tipo: "Perda dominante", texto: `"${motivo}" responde por ${Math.round(qtd / total * 100)}% das perdas com motivo no período` });
  }
  const vend = data.vendedores.filter((v) => schools.includes(v.school) && v.leads_atribuidos >= 20 && v.vendedor !== "Lorena Chaves");
  if (vend.length > 1) {
    const convs = vend.map((v) => ({ ...v, conv: v.matriculas / v.leads_atribuidos })).sort((a, b) => a.conv - b.conv);
    const med = convs.reduce((a, v) => a + v.conv, 0) / convs.length;
    if (convs[0].conv < med * 0.5) alertas.push({ tipo: "Vendedor abaixo", texto: `${convs[0].vendedor} (${SCHOOLS[convs[0].school].label}) converte ${pct(convs[0].conv)} vs. média ${pct(med)} — vale revisar carteira/abordagem` });
  }
  // alertas de qualidade de dados
  if (qual) {
    (qual.qualidade || []).filter((q) => schools.includes(q.school)).forEach((q) => {
      if (q.pct_origem != null && q.pct_origem < 70) {
        const naoAtrib = (qual.atribuicao_midia || []).filter((a) => a.school === q.school).reduce((s, a) => s + Number(a.spend || 0) * (1 - Number(q.pct_origem) / 100), 0);
        alertas.push({ tipo: "Rastreio incompleto", texto: `${SCHOOLS[q.school].label}: só ${String(q.pct_origem).replace(".", ",")}% dos leads têm Origem preenchida — ${brl(naoAtrib)} de investimento sem atribuição confiável no período` });
      }
    });
    (qual.campanhas_zero || []).filter((c) => schools.includes(c.school)).forEach((c) => {
      alertas.push({ tipo: "Campanha sem conversão", texto: `${c.campanha} (${SCHOOLS[c.school].label}): ${num(c.leads)} leads e nenhuma matrícula no período — revisar oferta, público ou qualificação` });
    });
    (qual.atribuicao_midia || []).filter((a) => schools.includes(a.school) && Number(a.spend) > 0 && Number(a.leads_origem) === 0 && Number(a.leads_reportados) === 0).forEach((a) => {
      alertas.push({ tipo: "Investimento sem retorno rastreado", texto: `${a.canal === "GOOGLE" ? "Google" : "Meta"} ${SCHOOLS[a.school].label}: ${brl(a.spend)} investidos sem nenhum lead atribuído` });
    });
  }
  const utmQuebrada = data.campanhas.some((c) => c.campanha && c.campanha.includes("{"));
  if (alertas.length < 3 && utmQuebrada) alertas.push({ tipo: "Atribuição", texto: 'UTMs com macro literal "{campaignname}" detectadas — atribuição de campanha inativa até corrigir os parâmetros nos anúncios' });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title="Painel de metas do mês">
        {budgets.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {budgets.map((b, i) => {
              const l = linhas.find((x) => x.school === b.school) || {};
              const cards = [
                ["Investimento", l.spend, b.budget], ["Leads", l.leadsKommo, b.meta_leads],
                ["Matrículas", l.matriculas, b.meta_matriculas], ["Receita", l.receita, b.meta_receita],
              ].filter(([, , meta]) => meta != null);
              return cards.map(([lab, real, meta], j) => {
                const p = meta > 0 ? real / meta : 0;
                const cor = p >= 0.95 ? T.green : p >= 0.8 ? T.amber : T.red;
                return (
                  <div key={i + "-" + j} style={{ background: T.panel, border: `1px solid ${T.border}`, borderTop: `3px solid ${cor}`, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase" }}>{SCHOOLS[b.school].label} · {lab}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, marginTop: 3 }}>{lab.includes("Invest") || lab === "Receita" ? brl(real) : num(real)} <span style={{ fontSize: 12, color: T.muted }}>/ {lab.includes("Invest") || lab === "Receita" ? brl(meta) : num(meta)}</span></div>
                    <div style={{ fontSize: 11.5, color: cor, fontWeight: 500 }}>{pct(p)} da meta</div>
                  </div>
                );
              });
            })}
          </div>
        ) : (
          <Placeholder label="Metas do mês não definidas" detail="Assim que as metas mensais forem cadastradas (tabela marketing_budgets), este painel mostra cada indicador com semáforo: verde ≥ 95% da meta, amarelo 80–95%, vermelho < 80%." />
        )}
      </Panel>

      <Panel title="Funil ponta a ponta — mídia → comercial">
        {linhas.map(funilHero)}
        <div style={{ fontSize: 11, color: T.muted }}>Leads mídia = reportados pelas plataformas de anúncio · Leads Kommo = todos os leads criados no CRM (inclui orgânico e outros canais).</div>
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title="Comparativo Matrícula EAD × Ineprotec">
          <DataTable
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "spend", label: "Invest.", render: (r) => brl(r.spend) },
              { key: "leadsKommo", label: "Leads", render: (r) => num(r.leadsKommo) },
              { key: "cpl", label: "CPL", render: (r) => r.cpl != null ? brl(r.cpl) : "—" },
              { key: "matriculas", label: "Matríc.", render: (r) => num(r.matriculas) },
              { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
              { key: "cac", label: "CAC (mídia)", render: (r) => r.cac != null ? brl(r.cac) : "—" },
            ]}
            rows={linhas}
            initialSort={{ key: "receita", dir: "desc" }}
          />
        </Panel>

        <Panel title={`Alertas automáticos (${alertas.length})`}>
          {alertas.length ? alertas.map((a, i) => (
            <div key={i} style={{ border: `1px solid ${T.amber}55`, background: T.amber + "0d", borderRadius: 8, padding: "10px 12px", fontSize: 12.5, marginBottom: 8 }}>
              <span style={{ fontWeight: 600, color: T.amber }}>{a.tipo}:</span> {a.texto}
            </div>
          )) : <div style={{ fontSize: 12.5, color: T.green }}>✓ Nenhum alerta disparado pelas regras no período</div>}
        </Panel>
      </div>

      <Panel title="Evolução — últimos 6 meses">
        {extra ? (() => {
          const meses = [...new Set(extra.evolucao_mensal.map((e) => e.mes))].sort();
          const dataEv = meses.map((m) => {
            const row = { mes: m.slice(5) + "/" + m.slice(2, 4) };
            schools.forEach((s) => {
              const e = extra.evolucao_mensal.find((x) => x.mes === m && x.school === s) || {};
              row[`leads_${s}`] = e.leads || 0; row[`mat_${s}`] = e.matriculas || 0;
            });
            return row;
          });
          return (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={dataEv} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="mes" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} />
                  {schools.map((s) => <Line key={s} type="monotone" dataKey={`leads_${s}`} name={`Leads ${SCHOOLS[s].label}`} stroke={SCHOOLS[s].color} strokeWidth={2} dot={false} />)}
                  {schools.map((s) => <Line key={s + "m"} type="monotone" dataKey={`mat_${s}`} name={`Matr. ${SCHOOLS[s].label}`} stroke={SCHOOLS[s].color} strokeWidth={2} strokeOpacity={0.45} strokeDasharray="5 3" dot={false} />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })() : <Placeholder label="Carregando…" />}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Linha cheia = leads criados · tracejada = matrículas — visão estrutural, independe do filtro de período.</div>
      </Panel>

      <Panel title="Atalhos">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["comercial", "Ver funil comercial completo"], ["marketing", "Ver campanhas e mídia"]].map(([id, lab]) => (
            <button key={id} onClick={() => goTo(id)} style={{ background: T.panelSoft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 16px", fontSize: 12.5, cursor: "pointer", fontFamily: font }}>{lab} →</button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHELL DA APLICAÇÃO (navegação + filtros globais + fetch)
// ═══════════════════════════════════════════════════════════════════

const MENUS = [
  { id: "home", label: "Dashboard", ready: true },
  { id: "comercial", label: "Comercial", ready: true },
  { id: "marketing", label: "Marketing", ready: true },
];

const PERIODOS = [
  { id: "7d", label: "7 dias" },
  { id: "14d", label: "14 dias" },
  { id: "mes_atual", label: "Mês atual" },
  { id: "mes_anterior", label: "Mês anterior" },
  { id: "30d", label: "30 dias" },
];

function periodoRange(id) {
  const now = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const day = 24 * 3600 * 1000;
  if (id === "7d") return { from: iso(new Date(now - 7 * day)), to: iso(new Date(+now + day)) };
  if (id === "14d") return { from: iso(new Date(now - 14 * day)), to: iso(new Date(+now + day)) };
  if (id === "30d") return { from: iso(new Date(now - 30 * day)), to: iso(new Date(+now + day)) };
  if (id === "mes_anterior") {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: iso(first), to: iso(end) };
  }
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { from: iso(first), to: iso(new Date(+now + day)) };
}

const ABAS = [
  { id: "visao", label: "Visão Geral" },
  { id: "funil", label: "Funil & Perdas" },
  { id: "vendedores", label: "Vendedores" },
  { id: "origem", label: "Origem, Canal & Região" },
  { id: "financeiro", label: "Financeiro & Produto" },
  { id: "metas", label: "Metas & Comissões" },
  { id: "sdr", label: "Agente SDR" },
  { id: "jornada", label: "Jornada & Origem" },
];

export default function DashboardEdilvo() {
  const [tema, setTema] = useState(() => {
    try { return window.localStorage.getItem("edilvo_tema") || "claro"; } catch (e) { return "claro"; }
  });
  Object.assign(T, THEMES[tema] || THEMES.claro);
  useEffect(() => {
    try { window.localStorage.setItem("edilvo_tema", tema); } catch (e) {}
    document.body.style.background = T.bg;
    document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
  }, [tema]);
  const [menu, setMenu] = useState("home");
  const [periodo, setPeriodo] = useState("mes_atual");
  const [escola, setEscola] = useState("todas");
  const [aba, setAba] = useState("visao");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [applied, setApplied] = useState(null);
  const [reload, setReload] = useState(0);
  const [periodoAtualFrom, setPeriodoAtualFrom] = useState(null);
  const [sdr, setSdr] = useState(null);
  const [jor, setJor] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [qual, setQual] = useState(null);
  const [fila, setFila] = useState(null);
  const [data, setData] = useState(LIVE ? null : SNAPSHOT);
  const [mkt, setMkt] = useState(null);
  const [extra, setExtra] = useState(null);
  const [loading, setLoading] = useState(LIVE);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!LIVE) return;
    let from, to;
    if (periodo === "custom") {
      if (!applied) return;
      from = applied.from; to = applied.to;
    } else ({ from, to } = periodoRange(periodo));
    setLoading(true); setError(null); setPeriodoAtualFrom(from);
    const rpc = (name, body) => fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: window.EDILVO_ANON_KEY, Authorization: `Bearer ${window.EDILVO_ANON_KEY}` },
      body: JSON.stringify(body),
    }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); });
    Promise.all([
      rpc("dashboard_comercial", { p_token: RPC_TOKEN, p_from: from, p_to: to, p_school: null }),
      rpc("dashboard_marketing", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_comercial_extra", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_comercial_v3", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_sdr", { p_token: RPC_TOKEN, p_from: from, p_to: to, p_school: null }),
      rpc("dashboard_jornada", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_qualidade", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_fila", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
    ])
      .then(([j, m, x, w, s, jo, q, fl]) => {
        setQual(q); setFila(fl);
        if (w) { j = { ...j, vendedores: w.vendedores, cursos: w.cursos, faixas: w.faixas }; }
        setData(j); setMkt(m); setExtra(x); setSdr(s); setJor(jo); setLoading(false);
      })
      .catch((e) => { setError(String(e.message)); setLoading(false); });
  }, [periodo, applied, reload]);

  useEffect(() => {
    if (!LIVE) return;
    fetch(`${SUPABASE_URL}/rest/v1/rpc/data_freshness`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: window.EDILVO_ANON_KEY, Authorization: `Bearer ${window.EDILVO_ANON_KEY}` },
      body: JSON.stringify({ p_token: RPC_TOKEN }),
    }).then((r) => r.json()).then(setFresh).catch(() => {});
  }, [reload]);

  const schools = escola === "todas" ? ["matricula_ead", "ineprotec"] : [escola];
  const rotulo = periodo === "custom" && applied ? `${applied.from.split("-").reverse().join("/")} – ${new Date(new Date(applied.to) - 86400000).toLocaleDateString("pt-BR")}` : (PERIODOS.find((p) => p.id === periodo) || {}).label;

  const btn = (active, color) => ({
    background: active ? T.ink : "transparent", color: active ? T.onInk : T.ink,
    border: `1px solid ${active ? T.ink : T.border}`, borderRadius: 8,
    padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
  });
  const navItem = (active) => ({
    display: "block", width: "100%", textAlign: "left", background: active ? T.ink : "transparent",
    color: active ? T.onInk : T.ink, border: "none", borderRadius: 8, padding: "10px 14px",
    fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", fontFamily: font, marginBottom: 4,
  });
  const dateInp = { background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 8px", fontSize: 12, fontFamily: font };

  return (
    <div style={{ fontFamily: font, background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); *{box-sizing:border-box} body{margin:0} img{max-width:100%}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:225px;flex-shrink:0;border-right:1px solid ${T.border};padding:18px 14px;position:sticky;top:0;height:100vh;overflow-y:auto;background:${T.panel};display:flex;flex-direction:column}
        .content{flex:1;min-width:0}
        @media(max-width:760px){
          .layout{display:block}
          .sidebar{width:100%;height:auto;position:static;border-right:none;border-bottom:1px solid ${T.border};padding:12px 10px}
          .sidebar .subnav{display:flex;gap:4px;overflow-x:auto}
          .sidebar nav{display:flex;gap:6px;overflow-x:auto}
          .sidebar nav button{width:auto;white-space:nowrap}
          .pad{padding:12px 10px 30px !important}
          table{font-size:11px !important}
        }`}</style>

      <div className="layout">
        {/* ───── MENU LATERAL ───── */}
        <aside className="sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "12px 0 18px" }}>
            <img src="https://ineprotec-landing.vercel.app/images/logo.png" alt="Ineprotec" style={{ height: 34, alignSelf: "flex-start" }} onError={(e) => { e.target.style.display = "none"; }} />
            <img src="https://matriculaead-landing.vercel.app/images/logo.png" alt="Matrícula EAD" style={{ height: 34, alignSelf: "flex-start" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <nav>
            {MENUS.map((m) => (
              <button key={m.id} onClick={() => setMenu(m.id)} style={navItem(menu === m.id)}>{m.label}</button>
            ))}
          </nav>
          {menu === "comercial" && (
            <div className="subnav" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
              {ABAS.map((a) => (
                <button key={a.id} onClick={() => setAba(a.id)}
                  style={{ ...navItem(aba === a.id), fontSize: 12, padding: "8px 12px", background: aba === a.id ? T.panelSoft : "transparent", color: T.ink, borderLeft: aba === a.id ? `3px solid ${T.ink}` : "3px solid transparent", borderRadius: 6 }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 11, color: T.muted }}>@AgenciaVirtruvia</span>
            <button onClick={() => setTema(tema === "claro" ? "escuro" : "claro")}
              title={tema === "claro" ? "Mudar para tema escuro" : "Mudar para tema claro"}
              style={{ background: T.panelSoft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 20, padding: "5px 11px", fontSize: 11.5, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
              {tema === "claro" ? "\u25D0 Escuro" : "\u25D1 Claro"}
            </button>
          </div>
        </aside>

        {/* ───── CONTEÚDO ───── */}
        <div className="content">
          <div style={{ borderBottom: `1px solid ${T.border}`, padding: "12px 18px", background: T.bg, position: "sticky", top: 0, zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: T.muted, marginRight: 2 }}>Período</span>
              <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}
                style={{ background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12.5, fontFamily: font, cursor: "pointer", minWidth: 132 }}>
                {PERIODOS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                <option value="custom">Período (escolher datas)</option>
              </select>
              {periodo === "custom" && (
                <span style={{ display: "inline-flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={dateInp} />
                  <span style={{ color: T.muted, fontSize: 12 }}>até</span>
                  <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={dateInp} />
                  <button disabled={!customFrom || !customTo}
                    onClick={() => { const t = new Date(customTo); t.setDate(t.getDate() + 1); setApplied({ from: customFrom, to: t.toISOString().slice(0, 10) }); }}
                    style={{ ...btn(true), opacity: customFrom && customTo ? 1 : 0.4 }}>Aplicar</button>
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {fresh && <FreshChip fresh={fresh} />}
              <button onClick={() => setEscola("todas")} style={btn(escola === "todas")}>Todas</button>
              <button onClick={() => setEscola("matricula_ead")} style={{ ...btn(escola === "matricula_ead"), ...(escola === "matricula_ead" ? { background: T.gold, borderColor: T.gold } : {}) }}>Matrícula EAD</button>
              <button onClick={() => setEscola("ineprotec")} style={{ ...btn(escola === "ineprotec"), ...(escola === "ineprotec" ? { background: T.steel, borderColor: T.steel } : {}) }}>Ineprotec</button>
            </div>
          </div>

          <div className="pad" style={{ padding: "16px 18px 40px", maxWidth: 1240 }}>
            <div style={{ fontSize: 11.5, color: T.muted, marginBottom: 10 }}>
              {MENUS.find((m) => m.id === menu)?.label}{menu === "comercial" ? ` · ${ABAS.find((a) => a.id === aba)?.label}` : ""} · período: {rotulo || "—"} · escolas sempre lado a lado, nunca somadas
            </div>
            {periodo === "custom" && !applied && <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Escolha as datas e clique em Aplicar.</div>}
            {loading && <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando dados…</div>}
            {error && <div style={{ color: T.red, fontSize: 13, padding: 30, textAlign: "center" }}>Não foi possível carregar os dados agora ({error}). Tente novamente em instantes.</div>}
            {data && !loading && !error && (
              <>
                {menu === "comercial" && (
                  <>
                    {aba === "visao" && <AbaVisaoGeral data={data} extra={extra} qual={qual} fila={fila} schools={schools} />}
                    {aba === "funil" && <AbaFunilPerdas data={data} schools={schools} />}
                    {aba === "vendedores" && <AbaVendedores data={data} schools={schools} />}
                    {aba === "origem" && <AbaOrigem data={data} extra={extra} schools={schools} />}
                    {aba === "financeiro" && <AbaFinanceiro data={data} schools={schools} />}
                    {aba === "metas" && <AbaMetas data={data} periodoFrom={periodoAtualFrom} onSaved={() => setReload((r) => r + 1)} />}
                    {aba === "sdr" && <AbaSDR sdr={sdr} schools={schools} />}
                    {aba === "jornada" && <AbaJornada jor={jor} schools={schools} />}
                  </>
                )}
                {menu === "marketing" && <MenuMarketing mkt={mkt} qual={qual} schools={schools} />}
                {menu === "home" && <MenuHome data={data} mkt={mkt} extra={extra} qual={qual} schools={schools} goTo={setMenu} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
