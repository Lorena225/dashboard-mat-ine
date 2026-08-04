import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, LabelList } from "recharts";

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD EDILVO — MENU 1: COMERCIAL (Kommo)
// VirtruvIA · Matrícula EAD & Ineprotec
// Modo: LIVE (fetch à RPC do Supabase) ou SNAPSHOT (dados reais de 01–14/07/2026)
// ═══════════════════════════════════════════════════════════════════

const LIVE = true;
const SUPABASE_URL = "https://svmxlhhsgvbhjpcdhnhy.supabase.co";
const RPC_TOKEN = "ba37d3f35fb8c1dbef36184f0c0c1afc157dde7b";

// ── Identidade VirtruvIA ──
const THEMES = {
  claro: {
    bg: "#FFFFFF", panel: "#FFFFFF", panelSoft: "#F6F6F5", border: "#E4E4E2",
    text: "#111111", muted: "#6E6E6A", gold: "#C8102E", steel: "#0B4EA2",
    green: "#1F7A3F", red: "#C0392B", amber: "#A8720A", ink: "#111111", onInk: "#FFFFFF",
    shadow: "0 1px 3px rgba(20,18,12,.06)", tint: "12", tintForte: "22",
  },
  escuro: {
    bg: "#0E0E10", panel: "#17171A", panelSoft: "#1F1F23", border: "#2C2C33",
    text: "#ECEAE4", muted: "#9B968B", gold: "#F2635F", steel: "#5AA9E6",
    green: "#5FBF77", red: "#E06C5F", amber: "#D9A05B", ink: "#ECEAE4", onInk: "#111111",
    shadow: "0 1px 3px rgba(0,0,0,.5)", tint: "1F", tintForte: "33",
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
// moeda com centavos, para custos unitarios (CPC, CPM) onde arredondar mente
const brl2 = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// uma casa decimal quando ha fracao, inteiro quando nao ha (18,6 / 26)
const dec1 = (v) => Number(v || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const pct = (v) => (v == null ? "—" : (v * 100).toFixed(1).replace(".", ",") + "%");
const deltaPct = (cur, prev) => (prev > 0 ? (cur - prev) / prev : null);
const bySchool = (rows, school) => rows.filter((r) => r.school === school);
const sum = (rows, key) => rows.reduce((a, r) => a + Number(r[key] || 0), 0);

// ── Componentes base ──
let PREV_LABEL = "";

// ícone de ajuda com explicação em popup
function Info({ texto }) {
  const [aberto, setAberto] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", marginLeft: 5, verticalAlign: "middle" }}>
      <button onClick={() => setAberto(!aberto)} onBlur={() => setTimeout(() => setAberto(false), 150)}
        title="O que significa?" aria-label="O que significa?"
        style={{ width: 15, height: 15, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panelSoft,
          color: T.muted, fontSize: 10, lineHeight: "13px", cursor: "pointer", fontFamily: font, padding: 0 }}>?</button>
      {aberto && (
        <span style={{ position: "absolute", top: 20, left: -8, zIndex: 60, width: 290, background: T.panel,
          border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: "0 6px 20px rgba(0,0,0,.18)", padding: "10px 12px",
          fontSize: 11.5, lineHeight: 1.6, color: T.text, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
          {texto}
        </span>
      )}
    </span>
  );
}
function Delta({ value, invert = false }) {
  if (value == null) return <span style={{ fontSize: 11, color: T.muted }}>—</span>;
  const good = invert ? value < 0 : value > 0;
  const color = value === 0 ? T.muted : good ? T.green : T.red;
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "•";
  return (
    <span
      title={`Variação em relação ao período anterior de mesma duração${PREV_LABEL ? ` (${PREV_LABEL})` : ""}. Ex.: ao filtrar "Mês atual", compara com o mês anterior; ao filtrar "7 dias", com os 7 dias imediatamente anteriores.`}
      style={{ fontSize: 11.5, color, fontWeight: 500, whiteSpace: "nowrap", cursor: "help", borderBottom: `1px dotted ${T.border}` }}>
      {arrow} {Math.abs(value * 100).toFixed(0)}% vs anterior
    </span>
  );
}

function Kpi({ label, value, delta, invert, accent, title, sub }) {
  return (
    <div style={{ background: accent && accent !== T.ink ? accent + T.tint : T.panel, border: `1px solid ${accent && accent !== T.ink ? accent + T.tintForte : T.border}`, borderTop: `3px solid ${accent || T.border}`, borderRadius: 10, padding: "13px 15px", minWidth: 0, boxShadow: T.shadow }}>
      <div title={title} style={{ fontSize: 10.5, letterSpacing: ".07em", textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: title ? "help" : "default" }}>{label}</div>
      <div style={{ fontSize: 25, fontWeight: 600, margin: "3px 0 2px", fontVariantNumeric: "tabular-nums", color: T.text }}>{value}</div>
      <Delta value={delta} invert={invert} />
      {sub && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function SchoolTag({ school }) {
  const s = SCHOOLS[school];
  if (!s) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: s.color, fontWeight: 600,
      background: s.color + T.tint, border: `1px solid ${s.color}${T.tintForte}`, borderRadius: 20, padding: "3px 10px 3px 8px" }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: s.color }} />
      {s.label}
    </span>
  );
}

function Panel({ title, right, children, style }) {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, boxShadow: T.shadow, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</h2>
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
  const [modoFunil, setModoFunil] = useState("atual");
  const vg = data.visao_geral, fe = data.fechamentos, fea = data.fechamentos_ant, va = data.visao_ant;
  const kpiRow = (school) => {
    const v = bySchool(vg, school)[0] || {};
    const f = bySchool(fe, school)[0] || {};
    const fa = bySchool(fea, school)[0] || {};
    const a = bySchool(va, school)[0] || {};
    const conv = (f.matriculas || 0) + (f.perdas || 0) > 0 ? f.matriculas / (f.matriculas + f.perdas) : null;
    const convAnt = (fa.matriculas || 0) + (fa.perdas || 0) > 0 ? fa.matriculas / (fa.matriculas + fa.perdas) : null;
    const convLeads = v.leads > 0 ? (v.matriculas_criadas || 0) / v.leads : null;
    const convLeadsAnt = a.leads > 0 ? (a.matriculas_criadas || 0) / a.leads : null;
    const c = SCHOOLS[school].color;
    return (
      <div key={school} style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10 }}>
          <Kpi accent={c} label="Leads entrados" value={num(v.leads)} delta={deltaPct(v.leads, a.leads)}
            title="Leads criados no Kommo dentro do período filtrado, independentemente do que aconteceu com eles depois." />
          <Kpi accent={c} label="Matrículas" value={num(f.matriculas)} delta={deltaPct(f.matriculas, fa.matriculas)}
            title="Leads que entraram na etapa MATRÍCULA REALIZADA dentro do período. O lead pode ter sido criado antes — aqui conta a data do fechamento." />
          <Kpi accent={c} label="Perdas" value={num(f.perdas)} delta={deltaPct(f.perdas, fa.perdas)} invert
            title="Leads marcados como MATRÍCULA PERDIDA dentro do período, pela data da perda." />
          <Kpi accent={c} label="Em aberto" value={num(v.em_aberto)}
            title="Dos leads criados no período, quantos ainda estão em negociação — nem ganhos nem perdidos." />
          <Kpi accent={c} label="Conversão de leads" value={pct(convLeads)} delta={convLeads != null && convLeadsAnt != null ? convLeads - convLeadsAnt : null}
            title="Dos leads que ENTRARAM no período, quantos já viraram matrícula. É a taxa comercial no sentido comum — tende a ser baixa porque parte dos leads ainda está em negociação e vai converter depois." />
          <Kpi accent={c} label="Aproveitamento (decididos)" value={pct(conv)} delta={conv != null && convAnt != null ? conv - convAnt : null}
            title="Entre os leads DECIDIDOS no período (matrículas + perdas fechadas), quantos viraram matrícula. Ignora quem ainda está em aberto, por isso é sempre maior que a conversão de leads. Serve para medir a qualidade do fechamento, não o volume de entrada." />
          <Kpi accent={c} label="Faturamento" value={brl(f.faturamento)} delta={deltaPct(f.faturamento, fa.faturamento)}
            title="Soma do valor das matrículas fechadas no período, conforme o campo de valor do lead no Kommo." />
          <Kpi accent={c} label="Ticket médio" value={brl(f.ticket_medio)}
            title="Faturamento dividido pelo número de matrículas fechadas no período." />
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

  // carteira atual por escola (situação de agora)
  const carteiraFor = (school) => {
    const rows = (extra ? extra.carteira_atual.filter((c) => c.school === school) : []).sort((a, b) => a.sort - b.sort);
    if (!rows.length) return (
      <div key={school} style={{ flex: 1, minWidth: 260 }}>
        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        <Placeholder label="Sem leads em aberto" />
      </div>
    );
    const max = Math.max(...rows.map((r) => r.leads), 1);
    const total = rows.reduce((a, r) => a + Number(r.leads), 0);
    const valorTotal = rows.reduce((a, r) => a + Number(r.valor || 0), 0);
    const c = SCHOOLS[school].color;
    return (
      <div key={school} style={{ flex: 1, minWidth: 260 }}>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
          <SchoolTag school={school} />
          <span style={{ fontSize: 11.5, color: T.muted }}>{num(total)} em aberto · {brl(valorTotal)}</span>
        </div>
        {rows.map((r) => (
          <div key={r.etapa} style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 3, gap: 8 }}>
              <span style={{ color: T.muted }}>{r.etapa}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{num(r.leads)} · {brl(r.valor)}</span>
            </div>
            <div style={{ height: 9, background: T.panelSoft, borderRadius: 5, overflow: "hidden" }}>
              <div style={{ width: `${(r.leads / max) * 100}%`, height: "100%", background: c, borderRadius: 5 }} />
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
      <Panel title={modoFunil === "atual" ? "Situação atual do funil (todos os leads em aberto)" : "Funil dos leads criados no período"}
        right={
          <span style={{ display: "inline-flex", gap: 4 }}>
            {[["atual", "Situação atual"], ["periodo", "Leads do período"]].map(([id, lab]) => (
              <button key={id} onClick={() => setModoFunil(id)}
                style={{ background: modoFunil === id ? T.ink : "transparent", color: modoFunil === id ? T.onInk : T.ink,
                  border: `1px solid ${modoFunil === id ? T.ink : T.border}`, borderRadius: 7, padding: "5px 11px",
                  fontSize: 11.5, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{lab}</button>
            ))}
          </span>
        }>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{schools.map(modoFunil === "atual" ? carteiraFor : funnelFor)}</div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, lineHeight: 1.6 }}>
          {modoFunil === "atual"
            ? "Fotografia de agora: onde estão todos os leads em aberto neste momento, com o valor potencial de cada etapa. Independe do filtro de período — serve para o supervisor decidir a ação do dia."
            : "Todos os leads criados dentro do período filtrado, incluindo ganhos, perdidos e os que migraram para outros funis (linha \"Outros funis\"). A soma das etapas fecha exatamente com o total de leads entrados no período."}
        </div>
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
                        <div style={{ background: v ? `rgba(11,78,162,${0.12 + 0.7 * v / max})` : T.panelSoft, borderRadius: 5, padding: "7px 0", fontSize: 11, fontVariantNumeric: "tabular-nums", color: v / max > 0.55 ? "#fff" : T.text }}>{v || ""}</div>
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
function AbaFunilPerdas({ data, schools, insg }) {
  const [catSel, setCatSel] = useState(null);
  const insF = (insg && insg.funil) || {};
  const insPerda = insF.por_escola || {};
  const insSemMotivo = insF.sem_motivo || {};
  const [etapaSel, setEtapaSel] = useState(null);
  const [motivoSel, setMotivoSel] = useState(null);
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
    { key: "categoria", label: "Categoria de objeção" },
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
      <Panel title={(() => {
        // hover, nao clique: o componente Info abre por clique e o pedido era
        // que a leitura aparecesse ao passar o mouse
        const t = schools.map((e) => {
          const p = [insPerda[e], insSemMotivo[e]].filter(Boolean).join(" ");
          return p ? `${(SCHOOLS[e] || {}).label || e}: ${p}` : null;
        }).filter(Boolean).join("\n\n");
        return (
          <span title={t || undefined}
            style={t ? { borderBottom: `1px dotted ${T.muted}`, cursor: "help" } : undefined}>
            Perdas por Categoria de Objeções
          </span>
        );
      })()}>
        {catData.length ? (
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={catData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke={T.border} vertical={false} />
                <XAxis dataKey="categoria" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={38}>
                    <LabelList dataKey={s} position="top" fill={T.text} fontSize={10} formatter={(v) => (v > 0 ? v : "")} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem perdas registradas no período" />}
      </Panel>

      <Panel title="Objeções por categoria — selecione uma categoria">
        {(() => {
          const base = data.motivos_perda.filter((m) => schools.includes(m.school));
          const cats = categorias.filter((c) => base.some((m) => m.categoria === c && m.qtd > 0));
          if (!cats.length) return <Placeholder label="Sem perdas com motivo registrado no período" />;
          const cat = catSel && cats.includes(catSel) ? catSel : cats[0];
          const doCat = base.filter((m) => m.categoria === cat);
          const nomes = [...new Set(doCat.map((m) => m.motivo))];
          const chart = nomes.map((nome) => {
            const row = { motivo: nome.length > 34 ? nome.slice(0, 33) + "…" : nome };
            schools.forEach((s) => { row[s] = sum(doCat.filter((m) => m.motivo === nome && m.school === s), "qtd"); });
            row._t = schools.reduce((a, s) => a + row[s], 0);
            return row;
          }).sort((a, b) => b._t - a._t).slice(0, 12);
          const totalCat = doCat.reduce((a, m) => a + Number(m.qtd), 0);
          return (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {cats.map((c) => {
                  const ativo = c === cat;
                  const qtd = base.filter((m) => m.categoria === c).reduce((a, m) => a + Number(m.qtd), 0);
                  return (
                    <button key={c} onClick={() => setCatSel(c)}
                      style={{ background: ativo ? T.ink : "transparent", color: ativo ? T.onInk : T.ink,
                        border: `1px solid ${ativo ? T.ink : T.border}`, borderRadius: 8, padding: "6px 12px",
                        fontSize: 12, fontWeight: ativo ? 600 : 400, cursor: "pointer", fontFamily: font }}>
                      {c} · {num(qtd)}
                    </button>
                  );
                })}
              </div>
              <div style={{ width: "100%", height: Math.max(170, chart.length * 34 + 30) }}>
                <ResponsiveContainer>
                  <BarChart data={chart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                    <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="motivo" stroke={T.muted} fontSize={10.5} width={230} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                    {schools.map((s) => (
                      <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                        <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>{num(totalCat)} perdas na categoria "{cat}" no período, detalhadas por objeção declarada pelo vendedor no Kommo.</div>
            </>
          );
        })()}
      </Panel>

      <Panel title={<span>Ranking de motivos por etapa<Info texto="Base: perdas do período cuja etapa de saída foi capturada pelo histórico de mudanças de status (webhook ativo desde 14/07/2026). Perdas anteriores a essa data, ou registradas sem passagem de etapa, aparecem no ranking geral de motivos mas não aqui — por isso o total desta seção é menor. Cada lead conta uma vez, pela última perda." /></span>}
        right={(() => {
          const comEtapa = sum(heat.filter((h) => schools.includes(h.school)), "qtd");
          const total = sum(data.motivos_perda.filter((m) => schools.includes(m.school)), "qtd");
          return <span style={{ fontSize: 11.5, color: T.muted }}>{num(comEtapa)} de {num(total)} perdas com etapa identificada</span>;
        })()}>
        {(() => {
          const base = heat.filter((h) => schools.includes(h.school));
          if (!base.length) return <Placeholder label="Sem histórico de etapa da perda no período" detail="A etapa em que o lead foi perdido vem do histórico de mudanças de status (webhook), coletado desde 14/07/2026." />;
          const etapas = [...new Set(base.map((h) => h.etapa))]
            .map((e) => ({ etapa: e, qtd: base.filter((h) => h.etapa === e).reduce((a, h) => a + Number(h.qtd), 0) }))
            .sort((a, b) => b.qtd - a.qtd);
          const etapa = etapaSel && etapas.some((e) => e.etapa === etapaSel) ? etapaSel : etapas[0].etapa;
          const daEtapa = base.filter((h) => h.etapa === etapa);
          const nomes = [...new Set(daEtapa.map((h) => h.motivo))];
          const chart = nomes.map((nome) => {
            const row = { motivo: nome.length > 34 ? nome.slice(0, 33) + "…" : nome };
            schools.forEach((s) => { row[s] = sum(daEtapa.filter((h) => h.motivo === nome && h.school === s), "qtd"); });
            row._t = schools.reduce((a, s) => a + row[s], 0);
            return row;
          }).sort((a, b) => b._t - a._t).slice(0, 12);
          return (
            <>
              <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11.5, color: T.muted }}>Etapa da perda</span>
                <select value={etapa} onChange={(e) => setEtapaSel(e.target.value)}
                  style={{ background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12.5, fontFamily: font, cursor: "pointer", maxWidth: 320 }}>
                  {etapas.map((e) => <option key={e.etapa} value={e.etapa}>{e.etapa} ({e.qtd})</option>)}
                </select>
              </div>
              <div style={{ width: "100%", height: Math.max(170, chart.length * 34 + 30) }}>
                <ResponsiveContainer>
                  <BarChart data={chart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                    <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="motivo" stroke={T.muted} fontSize={10.5} width={230} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                    {schools.map((s) => (
                      <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                        <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Por que os leads são perdidos nesta etapa específica do funil — útil para treinar a abordagem certa em cada momento da negociação.</div>
            </>
          );
        })()}
      </Panel>

      <Panel title="Em que etapa cada motivo derruba mais — selecione o motivo">
        {(() => {
          const base = heat.filter((h) => schools.includes(h.school));
          if (!base.length) return <Placeholder label="Sem histórico de etapa da perda no período" detail="Depende do histórico de mudanças de status, em coleta desde 14/07/2026." />;
          const motivos = [...new Set(base.map((h) => h.motivo))]
            .map((m) => ({ motivo: m, qtd: base.filter((h) => h.motivo === m).reduce((a, h) => a + Number(h.qtd), 0) }))
            .sort((a, b) => b.qtd - a.qtd).slice(0, 10);
          const motivo = motivoSel && motivos.some((m) => m.motivo === motivoSel) ? motivoSel : motivos[0].motivo;
          const doMotivo = base.filter((h) => h.motivo === motivo);
          const nomes = [...new Set(doMotivo.map((h) => h.etapa))];
          const chart = nomes.map((nome) => {
            const row = { etapa: nome.length > 30 ? nome.slice(0, 29) + "…" : nome };
            schools.forEach((s) => { row[s] = sum(doMotivo.filter((h) => h.etapa === nome && h.school === s), "qtd"); });
            row._t = schools.reduce((a, s) => a + row[s], 0);
            return row;
          }).sort((a, b) => b._t - a._t);
          return (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {motivos.map((m) => {
                  const ativo = m.motivo === motivo;
                  const curto = m.motivo.length > 28 ? m.motivo.slice(0, 27) + "…" : m.motivo;
                  return (
                    <button key={m.motivo} onClick={() => setMotivoSel(m.motivo)} title={m.motivo}
                      style={{ background: ativo ? T.ink : "transparent", color: ativo ? T.onInk : T.ink,
                        border: `1px solid ${ativo ? T.ink : T.border}`, borderRadius: 8, padding: "6px 12px",
                        fontSize: 11.5, fontWeight: ativo ? 600 : 400, cursor: "pointer", fontFamily: font }}>
                      {curto} · {num(m.qtd)}
                    </button>
                  );
                })}
              </div>
              <div style={{ width: "100%", height: Math.max(170, chart.length * 34 + 30) }}>
                <ResponsiveContainer>
                  <BarChart data={chart} layout="vertical" margin={{ top: 0, right: 34, left: 10, bottom: 0 }} barGap={2}>
                    <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="etapa" stroke={T.muted} fontSize={10.5} width={200} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                    {schools.map((s) => (
                      <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={15}>
                        <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Onde no funil esta objeção mais aparece: se concentra no início, é qualificação; se aparece tarde, é fechamento.</div>
            </>
          );
        })()}
      </Panel>

      <Panel title="Ranking completo de motivos (tabela)">
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
function AbaVendedores({ data, schools, mat }) {
  const [selVend, setSelVend] = useState("todos");
  const [indicador, setIndicador] = useState("todos");
  const [visao, setVisao] = useState("producao");
  const rows0 = data.vendedores
    .filter((v) => schools.includes(v.school))
    .map((v) => ({ ...v, conversao: v.leads_atribuidos > 0 ? v.matriculas / v.leads_atribuidos : 0 }));
  // contas administrativas: não são vendedores, ficam fora de rankings e médias
  const ADMINS = ["LORENA CHAVES", "INEPROTEC", "MATRICULA EAD", "MATRÍCULA EAD", "(SEM RESPONSÁVEL)"];
  const ehGenerico = (v) => v.generico || ADMINS.includes(String(v.vendedor).trim().toUpperCase());
  const nomes = [...new Set(rows0.filter((v) => !ehGenerico(v)).map((v) => v.vendedor))].sort();
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
    { key: "falta_proxima", label: "Falta p/ Meta", render: (r) => r.falta_proxima == null ? "—" : String(Math.round(r.falta_proxima * 10) / 10).replace(".", ",") },
    { key: "comissao", label: "Comissão", render: (r) => brl(r.comissao) },
    { key: "faturamento", label: "Faturamento", render: (r) => brl(r.faturamento) },
    { key: "ticket_medio", label: "Ticket médio", render: (r) => brl(r.ticket_medio) },
    { key: "dias_fechamento", label: "Fechamento (dias)", render: (r) => (r.dias_fechamento == null ? "—" : r.dias_fechamento.toFixed(1).replace(".", ",")) },
  ];

  // Auditoria ago/2026: o ranking desta aba conta por fechamento + etapa atual
  // (base que alimenta faixa e comissao). O relatorio nominal do fim da pagina
  // conta pelo criterio conferido com a planilha (DATA PAGAMENTO + etapa).
  // Quando divergem, o aviso abaixo mostra a diferenca por vendedor em vez de
  // deixar dois numeros diferentes na mesma tela sem explicacao.
  const canonPorVend = {};
  ((mat && mat.por_vendedor) || []).forEach((v) => { canonPorVend[v.vendedor] = Number(v.matriculas || 0); });
  const divergencias = nomes
    .map((n) => {
      const antiga = rowsHumanos.filter((r) => r.vendedor === n).reduce((a, r) => a + Number(r.matriculas || 0), 0);
      const canon = canonPorVend[n];
      return canon == null ? null : { vendedor: n, antiga, canon, dif: Math.round((antiga - canon) * 10) / 10 };
    })
    .filter((d) => d && Math.abs(d.dif) >= 0.5);

  // uma barra por vendedor, empilhada pelas escolas que ele atende
  const chartData = [...new Set(rows.filter((v) => v.matriculas > 0).map((v) => v.vendedor))]
    .map((nome) => {
      const row = { nome: nome.split(" ").slice(0, 2).join(" ") };
      schools.forEach((s) => {
        row[s] = Math.round(sum(rows.filter((v) => v.vendedor === nome && v.school === s), "matriculas") * 10) / 10;
      });
      row._total = Math.round(schools.reduce((a, s) => a + row[s], 0) * 10) / 10;
      return row;
    })
    .filter((r) => r._total > 0)
    .sort((a, b) => b._total - a._total);

  const selRows = selVend === "todos" ? [] : rows;
  const selKpi = selRows.length ? {
    leads: sum(selRows, "leads_atribuidos"), matr: sum(selRows, "matriculas"), perdas: sum(selRows, "perdas"),
    fat: sum(selRows, "faturamento"),
    dias: (() => { const d = selRows.filter((r) => r.dias_fechamento != null); return d.length ? d.reduce((a, r) => a + Number(r.dias_fechamento), 0) / d.length : null; })(),
  } : null;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {divergencias.length > 0 && (
        <div style={{
          padding: "11px 14px", borderRadius: 10, marginBottom: 2,
          background: T.amber + T.tint, border: `1px solid ${T.amber}${T.tintForte}`,
          borderLeft: `3px solid ${T.amber}`, fontSize: 11.5, lineHeight: 1.65,
        }}>
          <b>Duas bases de contagem nesta página.</b> O ranking abaixo conta pela data de
          fechamento do card (base que define faixa e comissão); o relatório nominal, no fim
          da página, conta pelo critério conferido com a planilha (DATA PAGAMENTO MATRÍCULA).
          No período, divergem:{" "}
          {divergencias.map((d, i) => (
            <span key={d.vendedor}>
              {i > 0 && " · "}
              <b>{d.vendedor.split(" ")[0]}</b> {String(d.antiga).replace(".", ",")} → {String(d.canon).replace(".", ",")}
            </span>
          ))}
          . Unificar o ranking no critério conferido altera a base de comissão — mudança que
          depende de decisão da gestão.
        </div>
      )}
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
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 48, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" stroke={T.muted} fontSize={11} width={150} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s, i) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} stackId="v" fill={SCHOOLS[s].color} maxBarSize={24}
                    radius={i === schools.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}>
                    <LabelList dataKey={s} position="center" fill="#FFFFFF" fontSize={10.5} fontWeight={600}
                      formatter={(v) => (v > 0 ? String(v).replace(".", ",") : "")} />
                    {i === schools.length - 1 && (
                      <LabelList dataKey="_total" position="right" fill={T.text} fontSize={11.5} fontWeight={600}
                        formatter={(v) => String(v).replace(".", ",")} />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem matrículas no período" />}
        {schools.length > 1 && <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Vendedores que atendem as duas escolas aparecem em uma única barra: cada cor é uma escola, com o número dentro do segmento, e o total à direita.</div>}
      </Panel>
      <Panel title={<span>{visao === "producao" ? "Ranking por produção (fechamentos no período)" : "Ranking por eficiência (coorte de leads do período)"}
        <Info texto={visao === "producao"
          ? "Conta matrículas FECHADAS dentro do período, mesmo que o lead tenha entrado meses antes. Mede entrega e é a base da comissão. Não use a conversão desta visão: o denominador (leads criados no período) é outra população."
          : "Acompanha apenas os leads CRIADOS no período e o que aconteceu com eles até hoje: quantos já fecharam, quantos foram perdidos e quantos seguem em aberto. É a visão correta para comparar eficiência entre vendedores, porque numerador e denominador são a mesma população. Vendedores com menos de 10 leads na coorte ficam fora do ranking por falta de amostra."} /></span>}
        right={
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[["producao", "Produção"], ["coorte", "Eficiência"]].map(([id, lab]) => (
            <button key={id} onClick={() => setVisao(id)}
              style={{ background: visao === id ? T.ink : "transparent", color: visao === id ? T.onInk : T.ink,
                border: `1px solid ${visao === id ? T.ink : T.border}`, borderRadius: 7, padding: "5px 11px",
                fontSize: 11.5, cursor: "pointer", fontFamily: font }}>{lab}</button>
          ))}
        </span>
        <select value={indicador} onChange={(e) => setIndicador(e.target.value)}
          style={{ background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: font, cursor: "pointer", maxWidth: 300 }}>
          <option value="todos">Todos os indicadores (índice ponderado)</option>
          <option value="matriculas">Matrículas efetivadas</option>
          <option value="faturamento">Faturamento gerado</option>
          <option value="ticket_medio">Ticket médio</option>
          <option value="velocidade">Velocidade de fechamento</option>
          <option value="leads_atribuidos">Volume de leads atendidos</option>
          <option value="" disabled>── Dependem de dados ainda não coletados ──</option>
          <option value="" disabled>Tempo médio de resposta (requer Chats API)</option>
          <option value="" disabled>Fechamento no 1º contato (requer histórico de mensagens)</option>
          <option value="" disabled>Satisfação do lead (requer campo no Kommo)</option>
        </select></span>}>
        {(() => {
          // consolida o vendedor entre as escolas
          if (visao === "coorte") {
            const co = (data.vendedores_coorte || []).filter((v) => schools.includes(v.school) && !ehGenerico(v));
            const nomesC = [...new Set(co.map((v) => v.vendedor))];
            const cons = nomesC.map((nome) => {
              const rs = co.filter((v) => v.vendedor === nome);
              const leads = sum(rs, "leads_coorte"), ganhos = sum(rs, "ganhos_coorte");
              const perdidos = sum(rs, "perdidos_coorte"), abertos = sum(rs, "abertos_coorte");
              const decididos = ganhos + perdidos;
              return { vendedor: nome, leads, ganhos, perdidos, abertos, receita: sum(rs, "receita_coorte"),
                conversao: leads > 0 ? ganhos / leads : 0, aproveitamento: decididos > 0 ? ganhos / decididos : null };
            }).filter((v) => v.leads >= 10).sort((a, b) => b.conversao - a.conversao);
            if (!cons.length) return <Placeholder label="Nenhum vendedor com 10+ leads na coorte do período" detail="Amostra pequena demais para comparar eficiência — amplie o período." />;
            const maxConv = Math.max(...cons.map((v) => v.conversao), 0.0001);
            return (
              <>
                <div style={{ display: "grid", gap: 8 }}>
                  {cons.map((v, i) => (
                    <div key={v.vendedor} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: i < 3 ? T.panelSoft : "transparent", border: `1px solid ${i < 3 ? T.border : "transparent"}`, borderRadius: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, width: 28, textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`}</span>
                      <span style={{ fontSize: 12.5, fontWeight: i < 3 ? 600 : 400, minWidth: 140 }}>{v.vendedor}</span>
                      <div style={{ flex: 1, height: 8, background: T.panelSoft, borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
                        <div style={{ width: `${Math.max(2, v.conversao / maxConv * 100)}%`, height: "100%", background: i === 0 ? T.green : T.steel, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 62, textAlign: "right" }}>{pct(v.conversao)}</span>
                      <span style={{ fontSize: 11, color: T.muted, minWidth: 210, textAlign: "right" }}>
                        {num(v.ganhos)} de {num(v.leads)} leads · {num(v.abertos)} em aberto · {brl(v.receita)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, lineHeight: 1.6 }}>
                  Mesma população no numerador e no denominador: leads criados no período por responsável. "Em aberto" ainda pode converter, então a taxa tende a subir com o tempo — compare períodos fechados para leitura justa. Leads na fila automática não entram.
                </div>
              </>
            );
          }
          const nomesV = [...new Set(rows.map((v) => v.vendedor))];
          const cons = nomesV.map((nome) => {
            const rs = rows.filter((v) => v.vendedor === nome);
            const matriculas = sum(rs, "matriculas");
            const faturamento = sum(rs, "faturamento");
            const leads = sum(rs, "leads_atribuidos");
            const perdas = sum(rs, "perdas");
            const comDias = rs.filter((r) => r.dias_fechamento != null && r.matriculas > 0);
            const dias = comDias.length ? comDias.reduce((a, r) => a + Number(r.dias_fechamento) * Number(r.matriculas), 0) / sum(comDias, "matriculas") : null;
            return {
              vendedor: nome, matriculas: Math.round(matriculas * 10) / 10, faturamento, leads_atribuidos: leads, perdas,
              conversao: leads > 0 ? matriculas / leads : 0,
              ticket_medio: matriculas > 0 ? faturamento / matriculas : 0,
              dias_fechamento: dias, velocidade: dias != null && dias > 0 ? 1 / dias : 0,
              comissao: sum(rs, "comissao"),
            };
          }).filter((v) => v.matriculas > 0 || v.leads_atribuidos > 0);
          if (!cons.length) return <Placeholder label="Sem atividade de vendedores no período" />;

          // normaliza 0–100 e aplica pesos
          const norm = (campo) => {
            const vals = cons.map((v) => Number(v[campo]) || 0);
            const mx = Math.max(...vals), mn = Math.min(...vals);
            return (v) => (mx === mn ? (mx > 0 ? 100 : 0) : ((Number(v[campo]) || 0) - mn) / (mx - mn) * 100);
          };
          const pesos = [["matriculas", 0.45], ["faturamento", 0.30], ["ticket_medio", 0.15], ["velocidade", 0.10]];
          const normalizadores = Object.fromEntries(pesos.map(([c]) => [c, norm(c)]));
          const comScore = cons.map((v) => ({ ...v, score: Math.round(pesos.reduce((a, [c, p]) => a + normalizadores[c](v) * p, 0) * 10) / 10 }));

          const chaveOrd = indicador === "todos" ? "score" : indicador;
          const ranking = [...comScore].sort((a, b) => (Number(b[chaveOrd]) || 0) - (Number(a[chaveOrd]) || 0));
          const medalha = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`);
          const maxRef = Math.max(...ranking.map((v) => Number(v[chaveOrd]) || 0), 1);
          const rotulos = { todos: "Índice", matriculas: "Matrículas", faturamento: "Faturamento", conversao: "Conversão", ticket_medio: "Ticket médio", velocidade: "Velocidade", leads_atribuidos: "Leads atendidos" };
          const fmt = (v) => {
            const x = Number(v[chaveOrd]) || 0;
            if (chaveOrd === "faturamento" || chaveOrd === "ticket_medio") return brl(x);
            if (chaveOrd === "conversao") return pct(x);
            if (chaveOrd === "velocidade") return v.dias_fechamento != null ? `${v.dias_fechamento.toFixed(1).replace(".", ",")} dias` : "—";
            if (chaveOrd === "score") return `${String(x).replace(".", ",")} pts`;
            return String(Math.round(x * 10) / 10).replace(".", ",");
          };

          return (
            <>
              <div style={{ display: "grid", gap: 8 }}>
                {ranking.map((v, i) => (
                  <div key={v.vendedor} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: i < 3 ? T.panelSoft : "transparent", border: `1px solid ${i < 3 ? T.border : "transparent"}`, borderRadius: 8 }}>
                    <span style={{ fontSize: 14, width: 28, textAlign: "center" }}>{medalha(i)}</span>
                    <span style={{ fontSize: 12.5, fontWeight: i < 3 ? 600 : 400, minWidth: 140, flexShrink: 0 }}>{v.vendedor}</span>
                    <div style={{ flex: 1, height: 8, background: T.panelSoft, borderRadius: 4, overflow: "hidden", minWidth: 60 }}>
                      <div style={{ width: `${Math.max(2, (Number(v[chaveOrd]) || 0) / maxRef * 100)}%`, height: "100%", background: i === 0 ? T.green : T.steel, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, minWidth: 92, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(v)}</span>
                    <span style={{ fontSize: 11, color: T.muted, minWidth: 130, textAlign: "right" }}>
                      {String(v.matriculas).replace(".", ",")} matrículas · {brl(v.faturamento)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 10, lineHeight: 1.6 }}>
                {indicador === "todos"
                  ? "Índice ponderado (0 a 100) sobre o desempenho relativo do grupo: matrículas 45%, faturamento 30%, ticket médio 15% e velocidade de fechamento 10%. Só usa métricas de produção — a conversão saiu do índice porque misturava populações (matrículas fechadas no período com leads criados no período). Para comparar eficiência, use a visão Eficiência."
                  : `Ordenado por ${rotulos[chaveOrd] || chaveOrd}. Use "Todos os indicadores" para o ranking equilibrado, que evita premiar volume sem conversão ou conversão sem volume.`}
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                Tempo de resposta, fechamento no primeiro contato e satisfação do lead aparecem desativados na lista porque dependem de dados que o Kommo ainda não entrega ao painel — entram no índice assim que forem coletados.
              </div>
            </>
          );
        })()}
      </Panel>

      <Panel title="Relatório por vendedor (clique nas colunas para ordenar)" right={
        <select value={selVend} onChange={(e) => setSelVend(e.target.value)} style={{ background: T.panelSoft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, fontFamily: font }}>
          <option value="todos">Todos os usuários</option>
          {nomes.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>}>
        <DataTable columns={cols} rows={rows} initialSort={{ key: "matriculas", dir: "desc" }} />
      </Panel>
      {rowsGenericos.length > 0 && (
        <Panel title="Contas administrativas e sem responsável (fora das métricas)">
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
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Contas administrativas (Lorena Chaves, INEPROTEC) e leads sem responsável atribuído. Ficam fora do ranking consolidado e do relatório por vendedor para não distorcer médias, mas o volume permanece visível aqui.</div>
        </Panel>
      )}

      <Panel title="Tempo médio de primeira resposta por vendedor">
        <Placeholder label="Métrica em construção" detail="Ativada junto com o histórico de interações — mesma dependência da aba Funil & Perdas." />
      </Panel>
      <div style={{ fontSize: 11.5, color: T.muted }}>Matrícula = lead na etapa MATRÍCULA REALIZADA dos funis de venda, no período pesquisado (ALUNO FORMADO não conta). Com mais de um atendente no "Registro de Atendimento", a matrícula é rateada igualmente entre eles (por isso podem aparecer valores como 2,5). "Fechamento (dias)" = tempo médio entre a criação do lead e a matrícula.</div>

      <RelatorioNominalMatriculas mat={mat} agruparPor="vendedor" />
    </div>
  );
}

// ── Aba 4: Origem, Canal e Região ──
// Rotulo de painel com leitura estrategica no hover. Usado no lugar de <Info>,
// que abre por clique, quando a intencao e que o texto apareca ao passar o mouse.
function TituloComLeitura({ children, texto }) {
  if (!texto) return <>{children}</>;
  return (
    <span title={texto} style={{ borderBottom: `1px dotted ${T.muted}`, cursor: "help" }}>
      {children}
    </span>
  );
}

function AbaOrigem({ data, extra, reg, schools, insg, crs }) {
  const cursos = ((crs && crs.cursos) || []).filter((c) => schools.includes(c.escola));
  const estados = ((crs && crs.estados) || [])
    .filter((e) => schools.includes(e.escola))
    .map((e) => ({ ...e, ticket: e.matriculas > 0 ? e.faturamento / e.matriculas : 0 }));
  const semCurso = schools
    .map((e) => {
      const x = ((crs && crs.sem_curso) || {})[e];
      return x ? { label: (SCHOOLS[e] || {}).label || e, leads: x.leads, pct: x.pct } : null;
    })
    .filter(Boolean);

  const leitura = (bloco, chave) => {
    const b = (insg && insg[bloco]) || {};
    if (chave) return b[chave] || null;
    const pe = b.por_escola || {};
    return schools.map((e) => (pe[e] ? `${(SCHOOLS[e] || {}).label || e}: ${pe[e]}` : null))
      .filter(Boolean).join("\n\n") || null;
  };

  const [ufSel, setUfSel] = useState(null);
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
      <Panel title={<TituloComLeitura texto={leitura("regiao","dispersao")}>Leads por grupo de origem (normalizado)</TituloComLeitura>}>
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
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={30}>
                    <LabelList dataKey={s} position="top" fill={T.text} fontSize={10} formatter={(v) => (v > 0 ? v : "")} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Sem dados de região" detail="A extração de DDD depende da sincronização de contatos, que está em andamento — a cobertura cresce a cada hora." />}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Cobertura parcial: contatos ainda em sincronização — os números crescem conforme a base completa.</div>
      </Panel>

      <Panel title="Ranking de estados — quem mais entra e quem mais fecha">
        {reg && reg.estados.filter((e) => schools.includes(e.school)).length ? (() => {
          const base = reg.estados.filter((e) => schools.includes(e.school));
          const ufs = [...new Set(base.map((e) => e.estado_uf))].map((uf) => {
            const rs = base.filter((e) => e.estado_uf === uf);
            const leads = sum(rs, "leads"), matr = sum(rs, "matriculas"), rec = sum(rs, "receita");
            return { uf, leads, matriculas: matr, receita: rec, conversao: leads > 0 ? matr / leads : 0 };
          }).sort((a, b) => b.matriculas - a.matriculas || b.leads - a.leads);
          return (
            <>
              <DataTable
                columns={[
                  { key: "uf", label: "Estado", style: { fontWeight: 600 } },
                  { key: "leads", label: "Leads que entraram", render: (r) => num(r.leads) },
                  { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
                  { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
                  { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
                ]}
                rows={ufs}
                initialSort={{ key: "matriculas", dir: "desc" }}
                pageSize={12}
              />
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Coorte do período: leads que entraram na janela filtrada e quantos deles já viraram matrícula. Estado identificado pelo DDD do telefone do contato.</div>
            </>
          );
        })() : <Placeholder label="Sem leads com estado identificado no período" detail="Depende do telefone do contato sincronizado — a cobertura cresce a cada hora." />}
      </Panel>

      <Panel title="Cursos por estado — selecione o estado">
        {reg && reg.cursos_por_uf.filter((c) => schools.includes(c.school)).length ? (() => {
          const base = reg.cursos_por_uf.filter((c) => schools.includes(c.school));
          const ufs = [...new Set(base.map((c) => c.estado_uf))]
            .map((uf) => ({ uf, leads: sum(base.filter((c) => c.estado_uf === uf), "leads") }))
            .sort((a, b) => b.leads - a.leads);
          const uf = ufSel && ufs.some((u) => u.uf === ufSel) ? ufSel : ufs[0].uf;
          const doUf = base.filter((c) => c.estado_uf === uf);
          const nomes = [...new Set(doUf.map((c) => c.curso))];
          const linhas = nomes.map((nome) => {
            const rs = doUf.filter((c) => c.curso === nome);
            const leads = sum(rs, "leads"), matr = sum(rs, "matriculas"), rec = sum(rs, "receita");
            return { curso: nome, school: rs[0].school, leads, matriculas: matr, receita: rec, conversao: leads > 0 ? matr / leads : 0 };
          }).sort((a, b) => b.leads - a.leads);
          const totLeads = sum(linhas, "leads"), totMatr = sum(linhas, "matriculas"), totRec = sum(linhas, "receita");
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 11.5, color: T.muted }}>Estado</span>
                <select value={uf} onChange={(e) => setUfSel(e.target.value)}
                  style={{ background: T.panel, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12.5, fontFamily: font, cursor: "pointer" }}>
                  {ufs.map((u) => <option key={u.uf} value={u.uf}>{u.uf} ({u.leads} leads)</option>)}
                </select>
                <span style={{ fontSize: 11.5, color: T.muted }}>
                  {num(totLeads)} leads · {num(totMatr)} matrículas · {pct(totLeads > 0 ? totMatr / totLeads : null)} · {brl(totRec)}
                </span>
              </div>
              <DataTable
                columns={[
                  { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                  { key: "curso", label: "Curso", style: { whiteSpace: "normal", minWidth: 190 } },
                  { key: "leads", label: "Leads", render: (r) => num(r.leads) },
                  { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
                  { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
                  { key: "receita", label: "Faturamento", render: (r) => brl(r.receita) },
                ]}
                rows={linhas}
                initialSort={{ key: "leads", dir: "desc" }}
                pageSize={10}
              />
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8 }}>Interesse declarado no cartão do lead (até 3 cursos por lead; a receita é rateada entre eles). Mostra onde vale abrir turma ou concentrar mídia por região.</div>
            </>
          );
        })() : <Placeholder label="Sem cursos com estado identificado no período" />}
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
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[4, 4, 0, 0]} maxBarSize={30}>
                    <LabelList dataKey={s} position="top" fill={T.text} fontSize={10} formatter={(v) => (v > 0 ? v : "")} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>;
        })()}
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
      </div>

      {/* ── Ranking de cursos: procura x venda lado a lado ── */}
      <Panel title={<TituloComLeitura texto={
        (() => {
          const top = [...cursos].sort((a, b) => b.procurado - a.procurado)[0];
          const pior = cursos.filter((c) => c.procurado >= 30)
            .sort((a, b) => (a.conversao || 0) - (b.conversao || 0))[0];
          const melhor = cursos.filter((c) => c.procurado >= 20)
            .sort((a, b) => (b.conversao || 0) - (a.conversao || 0))[0];
          if (!top) return null;
          const p = [];
          p.push(`Curso mais procurado: ${top.curso} (${num(top.procurado)} leads, ${dec1(top.conversao)}% de conversão).`);
          if (pior && melhor && pior.curso !== melhor.curso) {
            p.push(`A maior lacuna está em ${pior.curso}: ${num(pior.procurado)} pessoas procuraram e ${dec1(pior.conversao)}% fecharam. No outro extremo, ${melhor.curso} converte ${dec1(melhor.conversao)}%.`);
            p.push("Curso muito procurado e pouco vendido é demanda já paga saindo pela porta: costuma render mais atacar essa conversão do que ampliar verba de mídia.");
          }
          return p.join(" ");
        })()
      }>Cursos mais procurados x mais vendidos</TituloComLeitura>}>
        <DataTable
          columns={[
            { key: "escola", label: "Escola", render: (r) => <SchoolTag school={r.escola} /> },
            { key: "curso", label: "Curso", style: { whiteSpace: "normal", minWidth: 190 } },
            { key: "procurado", label: "Procurado", style: { textAlign: "right" },
              render: (r) => num(r.procurado) },
            { key: "vendido", label: "Vendido", style: { textAlign: "right" },
              render: (r) => <b>{dec1(r.vendido)}</b> },
            {
              key: "conversao", label: "Conversão", style: { textAlign: "right" },
              render: (r) => {
                if (r.procurado === 0) return <span style={{ color: T.muted }}>—</span>;
                const v = Number(r.conversao || 0);
                // vermelho so quando ha procura suficiente para o numero significar algo
                const cor = r.procurado < 15 ? T.muted : v >= 20 ? T.green : v < 6 ? T.red : T.text;
                return <span style={{ color: cor, fontWeight: v >= 20 || v < 6 ? 600 : 400 }}>{dec1(v)}%</span>;
              },
            },
            { key: "faturamento", label: "Faturamento", style: { textAlign: "right" },
              render: (r) => brl(r.faturamento) },
          ]}
          rows={cursos}
          initialSort={{ key: "procurado", dir: "desc" }}
          pageSize={15}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          <b>Procurado</b> = leads que declararam interesse no curso (contando os campos de curso 1, 2 e 3).
          {" "}<b>Vendido</b> = matrículas efetivadas no período. Conversão em vermelho abaixo de 6% e em verde
          acima de 20%, só quando há pelo menos 15 procuras — abaixo disso o percentual oscila demais.
        </div>
        {semCurso.length > 0 && (
          <div style={{
            marginTop: 10, padding: "9px 12px", borderRadius: 8,
            background: T.amber + T.tint, border: `1px solid ${T.amber}${T.tintForte}`,
            fontSize: 11.5, lineHeight: 1.6,
          }}>
            <b>Leads sem curso declarado:</b> {semCurso.map((x) => `${x.label} ${num(x.leads)} (${dec1(x.pct)}%)`).join(" · ")}.
            Esses leads não aparecem no ranking — sem o curso preenchido, não há como saber que demanda eles representam.
          </div>
        )}
      </Panel>

      {/* ── Estados que mais vendem ── */}
      <Panel title={<TituloComLeitura texto={leitura("regiao", "dispersao")}>
        Estados que mais vendem
      </TituloComLeitura>}>
        <DataTable
          columns={[
            { key: "uf", label: "UF" },
            { key: "escola", label: "Escola", render: (r) => <SchoolTag school={r.escola} /> },
            { key: "matriculas", label: "Matrículas", style: { textAlign: "right" },
              render: (r) => <b>{dec1(r.matriculas)}</b> },
            { key: "faturamento", label: "Faturamento", style: { textAlign: "right" },
              render: (r) => brl(r.faturamento) },
            { key: "ticket", label: "Ticket médio", style: { textAlign: "right" },
              render: (r) => brl(r.ticket) },
          ]}
          rows={estados}
          initialSort={{ key: "matriculas", dir: "desc" }}
          pageSize={12}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>
          Estado obtido pelo DDD do telefone do contato. Matrículas sem telefone cadastrado
          aparecem como <b>(sem UF)</b>.
        </div>
      </Panel>
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
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : "R$ " + v} />
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

      <Panel title={<span>Ranking de cursos (matrículas, faturamento e ticket)<Info texto="Matrícula = lead na etapa MATRÍCULA REALIZADA com data de fechamento dentro do período. Um lead com mais de um curso conta em cada curso e a receita é rateada entre eles, por isso a soma dos cursos pode diferir do faturamento total. Ticket = faturamento ÷ matrículas do curso." /></span>}>
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "curso", label: "Curso", style: { whiteSpace: "normal", minWidth: 200 } },
            { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
            { key: "faturamento", label: "Faturamento", render: (r) => brl(r.faturamento) },
            { key: "ticket_medio", label: "Ticket médio", render: (r) => brl(r.ticket_medio) },
          ]}
          rows={cursosRows}
          initialSort={{ key: "faturamento", dir: "desc" }}
        />
      </Panel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
        <Panel title={<>Faturamento por forma de pagamento <Info texto="Este bloco usa a base histórica desta aba (fechamento do card + etapa atual), que inclui cadastros sem data de pagamento. Para o número conferido contra a planilha, use o bloco de mesmo nome na aba Matrículas & Auditoria — lá a contagem segue o critério canônico e os totais podem diferir." /></>}>
          {pagChart.length ? (
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer>
                <BarChart data={pagChart} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barGap={3}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="forma" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} interval={0} />
                  <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : "R$ " + v} />
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

  const [confirmar, setConfirmar] = useState(false);
  const [autor, setAutor] = useState("");
  const original = (data.faixas || []);
  const mudancas = faixas.map((f, i) => {
    const o = original[i] || {};
    const difs = ["nome", "min", "boleto", "cartao", "pix"].filter((k) => String(o[k] ?? "") !== String(f[k] ?? ""));
    return difs.length ? { i, nome: f.nome, difs, antes: o, depois: f } : null;
  }).filter(Boolean);
  const removidas = original.length > faixas.length ? original.slice(faixas.length) : [];

  const salvar = () => {
    setSalvando(true); setMsg(null);
    const payload = faixas.map((f) => ({ nome: f.nome, min: Number(f.min) || 0, boleto: Number(f.boleto) || 0, cartao: Number(f.cartao) || 0, pix: Number(f.pix) || 0 }));
    fetch(`${SUPABASE_URL}/rest/v1/rpc/metas_set`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: window.EDILVO_ANON_KEY, Authorization: `Bearer ${window.EDILVO_ANON_KEY}` },
      body: JSON.stringify({ p_token: RPC_TOKEN, p_month: String(periodoFrom || "").slice(0, 8) + "01",
        p_faixas: payload.map((f) => ({ ...f, _autor: autor || "não identificado", _em: new Date().toISOString() })) }),
    })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(() => { setSalvando(false); setConfirmar(false); setMsg("Metas salvas — relatórios recalculados."); if (onSaved) onSaved(); })
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
        right={<button onClick={() => setConfirmar(true)} disabled={salvando || mudancas.length + removidas.length === 0} style={{ background: T.ink, color: T.onInk, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: font, opacity: salvando ? 0.5 : 1 }}>{salvando ? "Salvando…" : mudancas.length + removidas.length === 0 ? "Sem alterações" : `Revisar e salvar (${mudancas.length + removidas.length})`}</button>}>
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
        {confirmar && (
          <div style={{ border: `1px solid ${T.amber}`, background: T.amber + "0d", borderRadius: 8, padding: "14px 16px", marginTop: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Confirmar alteração das metas de {mesRef ? mesRef.split("-").reverse().join("/") : "—"}</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 10 }}>
              {mudancas.map((m) => (
                <div key={m.i}>
                  <b>{m.nome}</b>: {m.difs.map((k) => `${k} ${m.antes[k] ?? "—"} → ${m.depois[k]}`).join(" · ")}
                </div>
              ))}
              {removidas.map((r, i) => <div key={"r" + i} style={{ color: T.red }}><b>{r.nome}</b>: faixa removida</div>)}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input value={autor} onChange={(e) => setAutor(e.target.value)} placeholder="Seu nome (fica registrado)"
                style={{ ...inp, width: 220 }} />
              <button onClick={salvar} disabled={salvando || !autor.trim()}
                style={{ background: T.ink, color: T.onInk, border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: font, opacity: autor.trim() ? 1 : 0.4 }}>
                {salvando ? "Salvando…" : "Confirmar"}
              </button>
              <button onClick={() => setConfirmar(false)}
                style={{ background: "transparent", color: T.ink, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 12.5, cursor: "pointer", fontFamily: font }}>Cancelar</button>
            </div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>A alteração vale para o mês do período selecionado e recalcula as comissões. Meses anteriores mantêm a tabela vigente na época.</div>
          </div>
        )}

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
            { key: "falta_proxima", label: "Falta p/ Meta", render: (p) => (p.falta_proxima == null ? "—" : d1(p.falta_proxima)) },
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
  const st = fresh.status || {};
  const itens = [
    { lab: "Kommo", d: diasDe(fresh.kommo), lim: 1, chave: null },
    { lab: "Google", d: diasDe(fresh.google), lim: 2, chave: "google" },
    { lab: "Meta", d: diasDe(fresh.meta), lim: 2, chave: "meta" },
    { lab: "Redes", d: diasDe(fresh.social), lim: 2, chave: null },
  ].filter((i) => i.d != null);

  // Tres estados, nao dois. "Meta 4d" em vermelho mandava o gestor cacar
  // problema tecnico inexistente: as campanhas estavam pausadas. Quando a
  // plataforma responde mas nao ha veiculacao, o chip diz "pausado" em ambar
  // e explica no tooltip; o vermelho fica reservado a integracao parada.
  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center", marginRight: 6, fontSize: 11, color: T.muted }}>
      {itens.map((i) => {
        const estado = i.chave ? (st[i.chave] || {}).status : null;
        const pausado = estado === "pausado";
        const atrasado = !pausado && i.d != null && i.d > i.lim;
        const cor = pausado ? T.amber
          : i.d == null ? T.muted
          : i.d <= i.lim ? T.green
          : i.d <= i.lim + 3 ? T.amber : T.red;
        const ug = i.chave ? (st[i.chave] || {}).ultimo_gasto : null;
        const titulo = pausado
          ? `${i.lab} — a integração está funcionando; o que parou foi a veiculação. Último dia com investimento: ${ug ? new Date(ug + "T12:00:00").toLocaleDateString("pt-BR") : "—"}. Campanha pausada não gera dado novo: isso não é falha do painel.`
          : `${i.lab} — última atualização: ${i.d == null ? "sem dados" : i.d === 0 ? "hoje" : i.d + " dia(s) atrás"}${atrasado ? ". A integração pode estar parada; os números deste período ficam incompletos." : ""}`;
        const destacar = pausado || atrasado;
        return (
          <span key={i.lab} title={titulo}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              ...(destacar ? {
                color: cor, fontWeight: 600, background: cor + T.tint,
                border: `1px solid ${cor}${T.tintForte}`, borderRadius: 20, padding: "1px 7px",
              } : null),
            }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: cor }} />
            {i.lab}{pausado ? " pausado" : atrasado ? ` ${i.d}d` : ""}
          </span>
        );
      })}
    </span>
  );
}

// ── Aba 7: Agente SDR ──
function AbaSDR({ sdr, schools, insg }) {
  const leitura = (bloco, chave) => {
    const b = (insg && insg[bloco]) || {};
    if (chave) return b[chave] || null;
    const pe = b.por_escola || {};
    return schools.map((e) => (pe[e] ? `${(SCHOOLS[e] || {}).label || e}: ${pe[e]}` : null))
      .filter(Boolean).join("\n\n") || null;
  };

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
          <Kpi accent={c} label="Leads recebidos" value={num(r.leads_recebidos)}
            title={leitura("sdr","cobertura") || undefined} />
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
function AbaJornada({ jor, schools, insg }) {
  const leitura = (bloco, chave) => {
    const b = (insg && insg[bloco]) || {};
    if (chave) return b[chave] || null;
    const pe = b.por_escola || {};
    return schools.map((e) => (pe[e] ? `${(SCHOOLS[e] || {}).label || e}: ${pe[e]}` : null))
      .filter(Boolean).join("\n\n") || null;
  };

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

      <Panel title={<TituloComLeitura texto={leitura("jornada")}>Leads por canal de origem</TituloComLeitura>}>
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


// ── Aba: Pipeline & Contato ──
function AbaPipeline({ pipe, schools, insg }) {
  const leitura = (bloco, chave) => {
    const b = (insg && insg[bloco]) || {};
    if (chave) return b[chave] || null;
    const pe = b.por_escola || {};
    return schools.map((e) => (pe[e] ? `${(SCHOOLS[e] || {}).label || e}: ${pe[e]}` : null))
      .filter(Boolean).join("\n\n") || null;
  };

  if (!pipe) return <div style={{ color: T.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Carregando pipeline…</div>;
  const resumo = (pipe.resumo || []).filter((r) => schools.includes(r.school));
  const grupos = (pipe.grupos || []).filter((g) => schools.includes(g.school));
  const aging = (pipe.aging || []).filter((a) => schools.includes(a.school));
  const contato = (pipe.contactabilidade || []).filter((c) => schools.includes(c.school));
  if (!resumo.length) return <Placeholder label="Sem leads em aberto" />;

  const gruposNomes = [...new Set(grupos.map((g) => g.grupo))].sort();
  const chart = gruposNomes.filter((n) => !n.startsWith("1.")).map((nome) => {
    const row = { grupo: nome.replace(/^\d+\.\s*/, "") };
    schools.forEach((s) => { row[s] = sum(grupos.filter((g) => g.grupo === nome && g.school === s), "leads"); });
    return row;
  });

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Panel title={<span><TituloComLeitura texto={leitura("pipeline")}>Pipeline qualificado</TituloComLeitura><Info texto="Pipeline qualificado exclui os leads em LEAD SEM RESPOSTA — contato nunca estabelecido não é oportunidade. O forecast ponderado multiplica o valor de cada lead pela probabilidade histórica da etapa: pré-matriculado 70%, negociação 40%, aguardando decisão 30%, follow-up 15%, triagem e potenciais 5%. É estimativa de fechamento, não promessa." /></span>}>
        {resumo.map((r) => {
          const c = SCHOOLS[r.school].color;
          const pctQual = r.total_aberto > 0 ? r.qualificado / r.total_aberto : 0;
          return (
            <div key={r.school} style={{ marginBottom: 14 }}>
              <div style={{ marginBottom: 8 }}><SchoolTag school={r.school} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                <Kpi accent={c} label="Pipeline qualificado" value={num(r.qualificado)} title="Leads em aberto com contato já estabelecido: do follow-up ao pré-matriculado." />
                <Kpi accent={c} label="Valor em jogo" value={brl(r.valor_qualificado)} title="Soma do valor dos leads qualificados, sem ponderação." />
                <Kpi accent={c} label="Forecast ponderado" value={brl(r.forecast_ponderado)} title="Valor esperado considerando a probabilidade de cada etapa." />
                <Kpi label="Sem contato (fila)" value={num(r.sem_contato)} title="Leads em LEAD SEM RESPOSTA. Não entram no pipeline nem no forecast." />
                <Kpi label="% qualificado do aberto" value={pct(pctQual)} title="Fatia do estoque aberto que é oportunidade real. Valores muito baixos indicam que o volume de leads não está sendo trabalhado." />
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel title={<span>Contactabilidade da coorte<Info texto="Dos leads criados no período, quantos saíram da etapa LEAD SEM RESPOSTA — ou seja, com quantos a operação conseguiu estabelecer contato. É o primeiro gargalo do funil: sem contato, nenhuma técnica de venda opera." /></span>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
          {contato.map((c) => (
            <Kpi key={c.school} accent={SCHOOLS[c.school].color} label={`Contactabilidade · ${SCHOOLS[c.school].label}`}
              value={pct(c.total > 0 ? c.contatados / c.total : null)}
              title={`${num(c.contatados)} de ${num(c.total)} leads criados no período tiveram contato estabelecido.`} />
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          Tempo até a primeira resposta e percentual dentro do SLA dependem do histórico de mensagens do Kommo (Chats API), que ainda não está acessível ao painel — quando estiver, entram aqui sem mudança de estrutura.
        </div>
      </Panel>

      <Panel title="Onde está o pipeline qualificado (por etapa)">
        {chart.length ? (
          <div style={{ width: "100%", height: Math.max(170, chart.length * 40 + 30) }}>
            <ResponsiveContainer>
              <BarChart data={chart} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barGap={2}>
                <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="grupo" stroke={T.muted} fontSize={11} width={175} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                {schools.map((s) => (
                  <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={16}>
                    <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} formatter={(v) => (v > 0 ? v : "")} />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Placeholder label="Nenhum lead qualificado em aberto" />}
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "grupo", label: "Situação", style: { whiteSpace: "normal", minWidth: 175 } },
            { key: "leads", label: "Leads", render: (r) => num(r.leads) },
            { key: "valor", label: "Valor", render: (r) => brl(r.valor) },
            { key: "valor_ponderado", label: "Forecast", render: (r) => brl(r.valor_ponderado) },
            { key: "dias_medio", label: "Dias parados (média)", render: (r) => num(r.dias_medio) },
          ]}
          rows={grupos}
          initialSort={{ key: "grupo", dir: "asc" }}
          pageSize={10}
        />
      </Panel>

      <Panel title={<span>Aging — há quanto tempo cada oportunidade está parada<Info texto="Dias desde a última atualização do lead no Kommo. Oportunidades paradas há mais de 14 dias raramente convertem: são candidatas a retomada ativa ou descarte, para o forecast não ficar inflado." /></span>}>
        <DataTable
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "grupo", label: "Situação", style: { whiteSpace: "normal", minWidth: 175 } },
            { key: "d0_3", label: "0–3 dias", render: (r) => num(r.d0_3) },
            { key: "d4_7", label: "4–7 dias", render: (r) => num(r.d4_7) },
            { key: "d8_14", label: "8–14 dias", render: (r) => num(r.d8_14) },
            { key: "d15_mais", label: "15+ dias", render: (r) => <span style={{ color: r.d15_mais > 0 ? T.red : T.muted, fontWeight: r.d15_mais > 0 ? 600 : 400 }}>{num(r.d15_mais)}</span> },
          ]}
          rows={aging}
          initialSort={{ key: "d15_mais", dir: "desc" }}
          pageSize={10}
        />
      </Panel>
    </div>
  );
}

// ═══════════════ MENU 2: MARKETING ═══════════════
// ─────────────────────────────────────────────────────────────
// Resumo de marketing em linguagem de dono. Existe porque o menu
// Marketing foi desenhado para quem trabalha com mídia: CPL, ROAS,
// pacing, atribuição. Quem manda na empresa quer responder três
// perguntas — quanto gastei, o que isso virou, e bateu a meta.
// Este bloco responde as três antes de qualquer jargão aparecer.
// ─────────────────────────────────────────────────────────────
// Separador de seção: o menu Marketing serve três leitores diferentes e
// misturava tudo numa lista de 13 painéis. Cada seção declara para quem é.
function SecaoPara({ titulo, para }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ height: 1, flex: "0 0 18px", background: T.border }} />
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em",
                      textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap" }}>{titulo}</div>
        <div style={{ height: 1, flex: 1, background: T.border }} />
      </div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 5, lineHeight: 1.6 }}>{para}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Orgânico: o que a marca constrói sem pagar mídia.
// Nem toda métrica existe nas duas redes — o Meta removeu alcance e
// cliques no site do lado do Facebook. Onde a plataforma não entrega,
// mostramos "não fornecido" em vez de zero, que seria mentira.
// ─────────────────────────────────────────────────────────────
function BlocoOrganico({ social, schools, insg }) {
  const [rede, setRede] = useState("instagram");
  const dataBR = (v) => (v ? new Date(v).toLocaleDateString("pt-BR") : "—");
  const insConta = ((insg && insg.social) || {}).por_conta || {};
  const resumo = ((social && social.resumo) || [])
    .filter((r) => schools.includes(r.school) && r.network === rede);
  const posts = ((social && social.posts) || [])
    .filter((p) => schools.includes(p.school) && p.network === rede);
  const cad = ((social && social.cadencia) || [])
    .filter((c) => schools.includes(c.school) && c.network === rede);

  if (!social) return null;

  const REDES = [["instagram", "Instagram"], ["facebook", "Facebook"]];
  const naoFornecido = (
    <span style={{ color: T.muted, fontSize: 11, fontStyle: "italic" }}>não fornecido</span>
  );

  return (
    <Panel title={<>Alcance orgânico — o que construímos sem pagar <Info texto="Dados das contas do Instagram e das páginas do Facebook, sem relação com anúncios. É o resultado do conteúdo publicado: quantas pessoas foram alcançadas, quantas passaram a seguir e o que cada post gerou. Serve para responder se o esforço de conteúdo está construindo audiência ou só ocupando agenda." /></>}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {REDES.map(([id, rot]) => (
          <button key={id} onClick={() => setRede(id)}
            style={{
              fontFamily: font, fontSize: 11.5, padding: "6px 14px", borderRadius: 999, cursor: "pointer",
              border: `1px solid ${rede === id ? T.text : T.border}`,
              background: rede === id ? T.text : T.panel,
              color: rede === id ? T.panel : T.muted,
              fontWeight: rede === id ? 600 : 400,
            }}>{rot}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        {resumo.map((r) => {
          const esc = SCHOOLS[r.school] || {};
          const c = cad.find((x) => x.school === r.school);
          const deltaAlc = r.alcance != null && r.alcance_ant
            ? (r.alcance - r.alcance_ant) / r.alcance_ant : null;
          return (
            <div key={r.school} style={{
              border: `1px solid ${T.border}`, borderTop: `3px solid ${esc.color}`,
              borderRadius: 10, padding: "14px 16px", background: T.panel,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <TituloComLeitura texto={insConta[`${r.school}|${rede}`]}><SchoolTag school={r.school} /></TituloComLeitura>
                {r.handle && <span style={{ fontSize: 11.5, color: T.muted }}>
                  {rede === "instagram" ? "@" : ""}{r.handle}
                </span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: T.muted }}>Seguidores hoje</div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: esc.color }}>{num(r.seguidores)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: T.muted }}>Ganhos no período</div>
                  <div style={{ fontSize: 19, fontWeight: 700 }}>
                    {r.novos != null ? `+${num(r.novos)}` : naoFornecido}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                {[
                  ["Pessoas alcançadas", r.alcance, deltaAlc],
                  ["Interações no conteúdo", r.engajamento, null],
                  ["Visitas ao perfil", r.visitas, null],
                  ["Cliques no link", r.cliques, null],
                  ["Publicações no período", c ? c.publicados : null, null],
                ].map(([rot, val, delta]) => (
                  <div key={rot} style={{ display: "flex", justifyContent: "space-between",
                                          alignItems: "baseline", padding: "4px 0", fontSize: 12 }}>
                    <span style={{ color: T.muted }}>{rot}</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {val == null ? naoFornecido : num(val)}
                      {delta != null && <span style={{ marginLeft: 6 }}><Delta value={delta} /></span>}
                    </span>
                  </div>
                ))}
                {c && (
                  <div style={{ fontSize: 10.5, color: T.muted, marginTop: 6 }}>
                    Ritmo de {String(c.por_semana).replace(".", ",")} publicações por semana.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {posts.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Publicações que mais engajaram
          </div>
          <DataTable
            rows={posts.slice(0, 12)}
            initialSort={{ key: "interacoes", dir: "desc" }}
            pageSize={8}
            columns={[
              { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
              { key: "posted_at", label: "Data", render: (r) => dataBR(r.posted_at) },
              { key: "tipo", label: "Tipo", render: (r) => (
                  <span style={{ fontSize: 10.5, color: T.muted }}>
                    {({ IMAGE: "Imagem", VIDEO: "Vídeo", CAROUSEL_ALBUM: "Carrossel", POST: "Post" })[r.tipo] || r.tipo}
                  </span>
                ) },
              { key: "legenda", label: "Publicação", style: { whiteSpace: "normal", minWidth: 260 },
                render: (r) => (
                  r.permalink
                    ? <a href={r.permalink} target="_blank" rel="noreferrer"
                        style={{ color: T.text, textDecoration: "none", borderBottom: `1px dotted ${T.muted}` }}>
                        {r.legenda || "(sem legenda)"}
                      </a>
                    : (r.legenda || "(sem legenda)")
                ) },
              { key: "curtidas", label: "Curtidas", style: { textAlign: "right" }, render: (r) => num(r.curtidas) },
              { key: "comentarios", label: "Comentários", style: { textAlign: "right" }, render: (r) => num(r.comentarios) },
              { key: "interacoes", label: "Total", style: { textAlign: "right" },
                render: (r) => <b>{num(r.interacoes)}</b> },
            ]}
          />
          <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
            Clique na legenda para abrir a publicação. Compare o que engajou com o que foi
            publicado por obrigação de calendário — o padrão costuma aparecer rápido.
          </div>
        </div>
      )}
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════
// Abas por plataforma. Existem porque Google e Meta NAO entregam as
// mesmas metricas, e junta-las numa tabela so obriga coluna vazia:
//
//   Google -> impressoes, cliques, conversoes e custo por conversao.
//             NAO fornece alcance nem frequencia.
//   Meta   -> impressoes, alcance, frequencia, cliques no link.
//             Em jul/2026 entregou ZERO conversoes (pixel a revisar).
//
// Cada aba mostra so o que sua plataforma realmente fornece.
// ═══════════════════════════════════════════════════════════════
function AbaCanal({ dados, schools, canal, insg }) {
  const nome = canal === "google" ? "Google Ads" : "Meta Ads";
  const leitura = ((insg && insg["canal_" + canal]) || {}).leitura || null;
  if (!dados) return <Placeholder label={`Carregando ${nome}…`} />;

  const porEscola = (dados.por_escola || []).filter((r) => schools.includes(r.school));
  const camps = (dados.campanhas || []).filter((c) => schools.includes(c.school));
  const serie = (dados.serie || []).filter((s) => schools.includes(s.school));

  if (!porEscola.length) {
    return (
      <Panel title={nome}>
        <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7 }}>
          Nenhum dado de {nome} no período selecionado. Pode ser que as campanhas estivessem
          pausadas, ou que a integração não tenha recebido carga — confira o indicador de
          atualização no topo da página.
        </div>
      </Panel>
    );
  }

  const totalGasto = porEscola.reduce((a, x) => a + Number(x.gasto || 0), 0);
  const totalConv = porEscola.reduce((a, x) => a + Number(x.conversoes || 0), 0);

  const porDia = {};
  serie.forEach((d) => {
    porDia[d.date] = porDia[d.date] || { date: d.date };
    porDia[d.date][d.school] = Number(d.gasto || 0);
  });
  const linhaDias = Object.values(porDia).sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {canal === "meta" && totalGasto > 0 && totalConv === 0 && (
        <div style={{
          padding: "11px 14px", borderRadius: 10,
          background: T.amber + T.tint, border: `1px solid ${T.amber}${T.tintForte}`,
          borderLeft: `3px solid ${T.amber}`, fontSize: 12, lineHeight: 1.65,
        }}>
          <b>O Meta não registrou nenhuma conversão no período</b>, apesar de {brl(totalGasto)} investidos.
          Sem esse retorno o algoritmo otimiza sem saber o que deu certo, e não há como avaliar o canal
          isoladamente. Costuma ser configuração de pixel ou de evento — vale revisar antes de julgar o
          desempenho pelos números abaixo.
        </div>
      )}

      {porEscola.map((x) => {
        const esc = SCHOOLS[x.school] || {};
        return (
          <Panel key={x.school} title={<TituloComLeitura texto={leitura}><SchoolTag school={x.school} /></TituloComLeitura>}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12 }}>
              <Kpi accent={esc.color} label="Investimento" value={brl(x.gasto)}
                sub={`${num(x.campanhas)} campanha(s) ativas`} />
              <Kpi accent={esc.color} label="Impressões" value={num(x.impressoes)}
                title="Quantas vezes o anúncio apareceu, contando repetições para a mesma pessoa." />
              {canal === "meta" && (
                <Kpi accent={esc.color} label="Pessoas alcançadas" value={num(x.alcance)}
                  sub={x.frequencia ? `viram ${dec1(x.frequencia)}x em média` : null}
                  title="Pessoas distintas que viram o anúncio. O Google Ads não fornece esta métrica." />
              )}
              <Kpi accent={esc.color} label="Cliques" value={num(x.cliques)}
                sub={x.ctr != null ? `${dec1(x.ctr)}% de quem viu` : null}
                title="Quantos clicaram. A porcentagem é o CTR: relação entre cliques e impressões." />
              <Kpi accent={esc.color} label="Custo por clique" value={x.cpc != null ? brl2(x.cpc) : "—"} />
              <Kpi accent={esc.color} label="Custo por mil impressões" value={x.cpm != null ? brl2(x.cpm) : "—"} />
              {canal === "google" && (
                <>
                  <Kpi accent={esc.color} label="Conversões" value={num(x.conversoes)}
                    title="Conversões registradas pelo próprio Google Ads. Não equivalem a matrículas." />
                  <Kpi accent={esc.color} label="Custo por conversão"
                    value={x.custo_conversao != null ? brl2(x.custo_conversao) : "—"} />
                </>
              )}
            </div>
          </Panel>
        );
      })}

      {linhaDias.length > 1 && (
        <Panel title={`Investimento dia a dia — ${nome}`}>
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={linhaDias} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v) => String(v).slice(8, 10) + "/" + String(v).slice(5, 7)} />
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#00000006" }}
                  formatter={(v, n) => [brl(v), (SCHOOLS[n] || {}).label || n]}
                  labelFormatter={(v) => new Date(String(v) + "T12:00:00").toLocaleDateString("pt-BR")}
                  contentStyle={{ background: T.panelSoft, border: `1px solid ${T.border}`,
                                  borderRadius: 8, fontSize: 12, fontFamily: font }} />
                <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingBottom: 6 }}
                  formatter={(v) => (SCHOOLS[v] || {}).label || v} />
                {schools.map((e) => (
                  <Bar key={e} dataKey={e} stackId="g" name={e} fill={SCHOOLS[e].color} maxBarSize={20} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      <Panel title={`Campanhas — ${nome}`}>
        <DataTable
          rows={camps}
          initialSort={{ key: "gasto", dir: "desc" }}
          pageSize={12}
          columns={[
            { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
            { key: "campaign_name", label: "Campanha", style: { whiteSpace: "normal", minWidth: 220 } },
            { key: "gasto", label: "Investimento", style: { textAlign: "right" }, render: (r) => <b>{brl(r.gasto)}</b> },
            { key: "impressoes", label: "Impressões", style: { textAlign: "right" }, render: (r) => num(r.impressoes) },
            ...(canal === "meta"
              ? [{ key: "alcance", label: "Alcance", style: { textAlign: "right" }, render: (r) => num(r.alcance) }]
              : []),
            { key: "cliques", label: "Cliques", style: { textAlign: "right" }, render: (r) => num(r.cliques) },
            { key: "ctr", label: "CTR", style: { textAlign: "right" },
              render: (r) => (r.ctr != null ? dec1(r.ctr) + "%" : "—") },
            { key: "cpc", label: "Custo/clique", style: { textAlign: "right" },
              render: (r) => (r.cpc != null ? brl2(r.cpc) : "—") },
            ...(canal === "google"
              ? [
                  { key: "conversoes", label: "Conversões", style: { textAlign: "right" }, render: (r) => num(r.conversoes) },
                  { key: "custo_conversao", label: "Custo/conv.", style: { textAlign: "right" },
                    render: (r) => (r.custo_conversao != null ? brl2(r.custo_conversao) : "—") },
                ]
              : []),
          ]}
        />
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
          {canal === "google"
            ? "Conversões são as que o próprio Google Ads registra — não equivalem a matrículas. Para o número conferido, veja “O essencial do período” na Visão Geral."
            : "O Meta fornece alcance e frequência, que o Google não tem; em compensação não está registrando conversões. Compare os canais pelo custo por matrícula da Visão Geral, não pelas conversões de plataforma."}
        </div>
      </Panel>
    </div>
  );
}

function ResumoMarketing({ resumo, schools }) {
  const linhas = ((resumo && resumo.por_escola) || []).filter((r) => schools.includes(r.school));
  if (!linhas.length) return null;

  const Selo = ({ ok, children }) => (
    <span style={{
      display: "inline-block", padding: "1px 8px", borderRadius: 999, fontSize: 10.5,
      fontWeight: 600, whiteSpace: "nowrap",
      background: (ok ? T.green : T.amber) + T.tint,
      color: ok ? T.green : T.amber,
      border: `1px solid ${(ok ? T.green : T.amber)}${T.tintForte}`,
    }}>{children}</span>
  );

  const Linha = ({ rotulo, valor, apoio, selo }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 12, color: T.muted, flexShrink: 0 }}>{rotulo}</div>
      <div style={{ textAlign: "right", minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {valor} {selo}
        </div>
        {apoio && <div style={{ fontSize: 10.5, color: T.muted, marginTop: 1 }}>{apoio}</div>}
      </div>
    </div>
  );

  return (
    <Panel title={<>O essencial do período <Info texto="Escrito para leitura rápida da direção: quanto foi investido, o que isso virou em matrícula e receita, e como ficou contra a meta do mês. Os blocos seguintes abrem o detalhe para quem cuida de comercial e de mídia." /></>}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 16 }}>
        {linhas.map((r) => {
          const esc = SCHOOLS[r.school] || {};
          const inv = Number(r.investimento || 0);
          const orc = r.orcamento == null ? null : Number(r.orcamento);
          const mat = Number(r.matriculas || 0);
          const metaMat = r.meta_matriculas == null ? null : Number(r.meta_matriculas);
          const rec = Number(r.receita || 0);
          const metaRec = r.meta_receita == null ? null : Number(r.meta_receita);
          const pctOrc = orc > 0 ? (100 * inv) / orc : null;
          const pctMat = metaMat > 0 ? (100 * mat) / metaMat : null;
          const pctRec = metaRec > 0 ? (100 * rec) / metaRec : null;

          // a frase de fechamento troca conforme o cruzamento meta x gasto
          const bateuMeta = pctMat != null && pctMat >= 100;
          const estourou = pctOrc != null && pctOrc > 105;
          const veredito = pctMat == null || pctOrc == null ? null
            : bateuMeta && !estourou
              ? "Bateu a meta dentro do orçamento."
              : bateuMeta && estourou
                ? "Bateu a meta, mas gastando acima do previsto — o resultado veio, o planejamento de verba é que ficou defasado."
                : !bateuMeta && estourou
                  ? "Gastou acima do previsto e ficou abaixo da meta. É a combinação que pede revisão antes de liberar mais verba."
                  : "Ficou abaixo da meta, mas também gastou menos que o previsto.";

          return (
            <div key={r.school} style={{
              border: `1px solid ${T.border}`, borderTop: `3px solid ${esc.color}`,
              borderRadius: 10, padding: "14px 16px", background: T.panel,
            }}>
              <div style={{ marginBottom: 8 }}><SchoolTag school={r.school} /></div>

              <Linha rotulo="Investimos" valor={brl(inv)}
                apoio={orc != null ? `orçamento do mês ${brl(orc)}` : "sem orçamento definido"}
                selo={pctOrc == null ? null : <Selo ok={pctOrc <= 105}>{pctOrc > 105 ? `${Math.round(pctOrc - 100)}% acima` : `${Math.round(pctOrc)}% do previsto`}</Selo>} />

              <Linha rotulo="Chegaram" valor={`${num(r.leads)} interessados`}
                apoio={r.meta_leads ? `meta do mês ${num(r.meta_leads)}` : null} />

              <Linha rotulo="Viraram" valor={`${dec1(mat)} matrículas`}
                apoio={metaMat != null ? `meta do mês ${num(metaMat)}` : null}
                selo={pctMat == null ? null : <Selo ok={pctMat >= 100}>{`${Math.round(pctMat)}% da meta`}</Selo>} />

              <Linha rotulo="Receita contratada" valor={brl(rec)}
                apoio={metaRec != null ? `meta do mês ${brl(metaRec)}` : null}
                selo={pctRec == null ? null : <Selo ok={pctRec >= 100}>{`${Math.round(pctRec)}% da meta`}</Selo>} />

              <Linha rotulo="Cada matrícula custou"
                valor={r.custo_por_matricula != null ? brl(r.custo_por_matricula) : "—"}
                apoio="investimento em anúncios ÷ matrículas do período" />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
                            gap: 10, padding: "7px 0" }}>
                <div style={{ fontSize: 12, color: T.muted }}>Cada R$ 1 investido virou</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: esc.color, fontVariantNumeric: "tabular-nums" }}>
                  {r.retorno_por_real != null ? brl(r.retorno_por_real) : "—"}
                </div>
              </div>

              {veredito && (
                <div style={{
                  marginTop: 8, padding: "8px 11px", borderRadius: 8, fontSize: 11.5, lineHeight: 1.6,
                  background: (bateuMeta ? T.green : T.amber) + T.tint,
                  border: `1px solid ${(bateuMeta ? T.green : T.amber)}${T.tintForte}`,
                }}>{veredito}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: T.muted, marginTop: 12, lineHeight: 1.6 }}>
        <b>Matrículas</b> pelo critério conferido com a planilha (etapa + data de pagamento), o mesmo
        da aba Matrículas & Auditoria. <b>Investimento</b> pelas contas de anúncio, não pela origem do
        lead. Nem toda matrícula vem de anúncio — o custo por matrícula é do mês inteiro dividido pelo
        investimento do mês, que é como se acompanha eficiência de verba, não atribuição individual.
      </div>
    </Panel>
  );
}

function MenuMarketing({ mkt, qual, orig, schools, insg, mres }) {
  const [canalSel, setCanalSel] = useState(null);
  const ins = (insg && insg.marketing) || {};
  const insEsc = ins.por_escola || {};
  const juntar = (base, extra) => (extra ? base + "\n\n" + extra : base);
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
      <ResumoMarketing resumo={mres} schools={schools} />

        <div style={{ marginBottom: 8 }}><SchoolTag school={school} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(148px, 1fr))", gap: 10 }}>
          <Kpi accent={c} label="Investimento" title={juntar("Soma do gasto em Meta Ads e Google Ads no período, pelas APIs das plataformas.", insEsc[school])} value={brl(spend)} delta={deltaPct(spend, spendAnt)} invert />
          <Kpi accent={c} label="Leads reportados pela plataforma" title={juntar("Leads que as próprias plataformas reportam como conversão. O Meta costuma reportar zero em campanhas de mensagem: nesses casos, use a contagem pela Origem do Kommo.", ins.rastreio)} value={num(leads)} delta={deltaPct(leads, leadsAnt)} />
          <Kpi accent={c} label="Custo por lead" title={juntar("Custo por lead: investimento do período dividido pelos leads reportados pelas plataformas de anúncio.", juntar(ins.comparativo || "", ins.atribuicao) || undefined)} value={cpl != null ? brl(cpl) : "—"} delta={cpl != null && cplAnt != null ? (cpl - cplAnt) / cplAnt : null} invert />
          <Kpi accent={c} label="Cliques" title="Cliques nos anúncios no período, somando Meta e Google." value={num(clicks)} />
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

      <SecaoPara titulo="Detalhe da mídia paga"
        para="Para quem cuida das campanhas: onde a verba está indo, quanto custa cada lead e quais campanhas fogem da média." />

      <Panel title="Distribuição de investimento — Meta × Google">
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={distData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barGap={3}>
              <CartesianGrid stroke={T.border} vertical={false} />
              <XAxis dataKey="escola" stroke={T.muted} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : "R$ " + v} />
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
                <YAxis stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => "R$ " + Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} />
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

      <SecaoPara titulo="De onde vem o resultado"
        para="Para quem cuida do comercial: por onde os leads entram, quais origens realmente viram matrícula e onde o funil perde gente entre a mídia e a venda." />

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
          Quase todos os leads aparecem como "organico" porque as UTMs não estão sendo gravadas na captação (só 0,1% têm utm preenchida, e o macro do Meta está literal). Corrigindo os parâmetros de URL nos anúncios e a gravação no Kwid, este funil passa a ligar cada lead pago à campanha que o trouxe — hoje isso só é possível no nível do canal, não da campanha.
        </div>
      </Panel>

      <Panel title={<span>Origem dos leads — visão macro<Info texto="Agrupa toda a entrada de leads por natureza da origem: Mídia paga (Meta e Google Ads), Digital próprio (site e formulários), Orgânico (indicação), Contato direto (WhatsApp) e Não rastreado (sem o campo Origem preenchido no Kommo). Responde: de onde vem o volume e de onde vem a matrícula." /></span>}>
        {orig && orig.por_macro.filter((m) => schools.includes(m.school)).length ? (() => {
          const base = orig.por_macro.filter((m) => schools.includes(m.school));
          const macros = [...new Set(base.map((m) => m.macro))].map((nome) => {
            const rs = base.filter((m) => m.macro === nome);
            const leads = sum(rs, "leads"), matr = sum(rs, "matriculas"), rec = sum(rs, "receita");
            const row = { macro: nome, leads, matriculas: matr, receita: rec, conversao: leads > 0 ? matr / leads : 0 };
            schools.forEach((s) => { row[s] = sum(rs.filter((m) => m.school === s), "leads"); });
            return row;
          }).sort((a, b) => b.leads - a.leads);
          const totalLeads = sum(macros, "leads");
          return (
            <>
              <div style={{ width: "100%", height: Math.max(160, macros.length * 40 + 30) }}>
                <ResponsiveContainer>
                  <BarChart data={macros} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }} barGap={2}>
                    <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="macro" stroke={T.muted} fontSize={11} width={155} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} cursor={{ fill: "#00000006" }} />
                    {schools.map((s) => (
                      <Bar key={s} dataKey={s} name={SCHOOLS[s].label} fill={SCHOOLS[s].color} radius={[0, 4, 4, 0]} maxBarSize={16}>
                        <LabelList dataKey={s} position="right" fill={T.muted} fontSize={10} formatter={(v) => (v > 0 ? v : "")} />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <DataTable
                columns={[
                  { key: "macro", label: "Natureza da origem", style: { fontWeight: 500 } },
                  { key: "leads", label: "Leads", render: (r) => `${num(r.leads)} · ${pct(totalLeads > 0 ? r.leads / totalLeads : null)}` },
                  { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
                  { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
                  { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
                ]}
                rows={macros}
                initialSort={{ key: "leads", dir: "desc" }}
              />
            </>
          );
        })() : <Placeholder label="Sem leads no período" />}
      </Panel>

      <Panel title={<span>De onde vêm as matrículas<Info texto="Ranking de todas as origens que geraram matrícula no período, pagas e orgânicas. Inclui Indicação e WhatsApp direto, que não têm custo de mídia e costumam converter acima da média — acompanhá-los evita decidir orçamento olhando só para o que é pago." /></span>}>
        {orig && orig.por_detalhe.filter((d) => schools.includes(d.school) && d.matriculas > 0).length ? (() => {
          const base = orig.por_detalhe.filter((d) => schools.includes(d.school) && d.matriculas > 0);
          const totMatr = sum(base, "matriculas"), totRec = sum(base, "receita");
          const linhas = base.map((d) => ({
            ...d,
            rotulo: d.canal + (d.detalhe && d.detalhe !== "(sem detalhe)" && !d.canal.toUpperCase().includes(String(d.detalhe).slice(0, 6).toUpperCase()) ? " · " + d.detalhe : ""),
            conversao: d.leads > 0 ? d.matriculas / d.leads : 0,
            share: totMatr > 0 ? d.matriculas / totMatr : 0,
          })).sort((a, b) => b.matriculas - a.matriculas);
          return (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
                <Kpi accent={T.ink} label="Matrículas rastreadas" value={num(totMatr)} title="Matrículas do período cujo lead tinha o campo Origem preenchido no Kommo." />
                <Kpi accent={T.ink} label="Receita rastreada" value={brl(totRec)} />
                <Kpi accent={T.ink} label="Origens que converteram" value={num(linhas.length)} />
              </div>
              <DataTable
                columns={[
                  { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                  { key: "rotulo", label: "Origem", style: { whiteSpace: "normal", minWidth: 190, fontWeight: 500 } },
                  { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
                  { key: "share", label: "% do total", render: (r) => pct(r.share) },
                  { key: "leads", label: "Leads", render: (r) => num(r.leads) },
                  { key: "conversao", label: "Conversão", render: (r) => <span style={{ color: r.conversao >= 0.1 ? T.green : r.conversao > 0 ? T.text : T.muted, fontWeight: r.conversao >= 0.1 ? 600 : 400 }}>{pct(r.conversao)}</span> },
                  { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
                ]}
                rows={linhas}
                initialSort={{ key: "matriculas", dir: "desc" }}
                pageSize={12}
              />
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
                Conversão em verde marca origens acima de 10%. Indicação e WhatsApp direto entram aqui em pé de igualdade com mídia paga: sem custo de anúncio, costumam ter a melhor conversão da base e merecem processo próprio (programa de indicação, tempo de resposta no WhatsApp).
              </div>
            </>
          );
        })() : <Placeholder label="Nenhuma matrícula com origem rastreada no período" />}
      </Panel>

      <Panel title={<span>Detalhamento por canal e criativo<Info texto="Abre cada canal no nível registrado no campo Origem do Kommo (padrão ESCOLA-CANAL-DETALHE). No Meta, o detalhe é o criativo ou a campanha (Instagram, Facebook, Técnico em Segurança do Trabalho...); no Google, o tipo de campanha (Pesquisa); no Site, a página ou formulário. Clique num canal para ver o detalhamento." /></span>}>
        {orig && orig.por_canal.filter((c) => schools.includes(c.school)).length ? (() => {
          const canais = orig.por_canal.filter((c) => schools.includes(c.school));
          const nomesCanal = [...new Set(canais.map((c) => c.canal))].map((nome) => {
            const rs = canais.filter((c) => c.canal === nome);
            const leads = sum(rs, "leads"), matr = sum(rs, "matriculas");
            return { canal: nome, leads, matriculas: matr };
          }).sort((a, b) => b.leads - a.leads);
          const canal = canalSel && nomesCanal.some((c) => c.canal === canalSel) ? canalSel : nomesCanal[0].canal;
          const det = orig.por_detalhe.filter((d) => schools.includes(d.school) && d.canal === canal)
            .map((d) => ({ ...d, conversao: d.leads > 0 ? d.matriculas / d.leads : 0 }));
          const gastoCanal = (orig.gasto_canal || []).filter((g) => schools.includes(g.school) && g.canal === canal);
          const spend = sum(gastoCanal, "spend");
          const leadsCanal = sum(det, "leads"), matrCanal = sum(det, "matriculas");
          return (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {nomesCanal.map((c) => {
                  const ativo = c.canal === canal;
                  return (
                    <button key={c.canal} onClick={() => setCanalSel(c.canal)}
                      style={{ background: ativo ? T.ink : "transparent", color: ativo ? T.onInk : T.ink,
                        border: `1px solid ${ativo ? T.ink : T.border}`, borderRadius: 8, padding: "6px 12px",
                        fontSize: 12, fontWeight: ativo ? 600 : 400, cursor: "pointer", fontFamily: font }}>
                      {c.canal} · {num(c.leads)}
                    </button>
                  );
                })}
              </div>
              {spend > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 12 }}>
                  <Kpi accent={T.ink} label="Investimento no canal" value={brl(spend)} />
                  <Kpi accent={T.ink} label="CPL real" value={leadsCanal > 0 ? brl(spend / leadsCanal) : "—"} />
                  <Kpi accent={T.ink} label="CAC real" value={matrCanal > 0 ? brl(spend / matrCanal) : "—"} />
                  <Kpi accent={T.ink} label="Conversão do canal" value={pct(leadsCanal > 0 ? matrCanal / leadsCanal : null)} />
                </div>
              )}
              <DataTable
                columns={[
                  { key: "school", label: "Escola", render: (r) => <SchoolTag school={r.school} /> },
                  { key: "detalhe", label: "Detalhe (criativo / campanha)", style: { whiteSpace: "normal", minWidth: 190 } },
                  { key: "leads", label: "Leads", render: (r) => num(r.leads) },
                  { key: "matriculas", label: "Matrículas", render: (r) => num(r.matriculas) },
                  { key: "conversao", label: "Conversão", render: (r) => pct(r.conversao) },
                  { key: "receita", label: "Receita", render: (r) => brl(r.receita) },
                  { key: "origem", label: "Valor no Kommo", style: { color: T.muted, fontSize: 11 } },
                ]}
                rows={det}
                initialSort={{ key: "leads", dir: "desc" }}
                pageSize={10}
              />
              <div style={{ fontSize: 11.5, color: T.muted, marginTop: 8, lineHeight: 1.6 }}>
                {spend > 0
                  ? "CPL e CAC reais usam o investimento do canal dividido pelos leads e matrículas efetivamente rastreados pela Origem — mais confiável que a conversão reportada pela plataforma."
                  : "Canal sem investimento de mídia no período: os números aqui são de entrada orgânica ou direta."}
              </div>
            </>
          );
        })() : <Placeholder label="Sem leads com origem no período" />}
      </Panel>

      <Panel title={<span>Atribuição de mídia — plataforma × Origem<Info texto="Compara duas contagens do mesmo investimento: o que a plataforma de anúncio reporta como conversão e o que o Kommo registrou no campo Origem. Divergência grande significa rastreio incompleto de um dos lados — veja a explicação em destaque abaixo da tabela." /></span>}>
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
  // datas no fuso local (America/Sao_Paulo no navegador do usuário), nunca em UTC
  const now = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const maisDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  // "to" é exclusivo: amanhã inclui o dia de hoje inteiro
  const amanha = maisDias(hoje, 1);
  if (id === "7d") return { from: iso(maisDias(hoje, -6)), to: iso(amanha) };   // 7 dias contando hoje
  if (id === "14d") return { from: iso(maisDias(hoje, -13)), to: iso(amanha) };
  if (id === "30d") return { from: iso(maisDias(hoje, -29)), to: iso(amanha) };
  if (id === "mes_anterior") {
    return { from: iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: iso(new Date(now.getFullYear(), now.getMonth(), 1)) };
  }
  return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(amanha) };
}


// ── Relatório nominal de matrículas ──
// Usado em duas telas: na aba Matrículas & Auditoria (agrupado pelo nome cru do
// Registro de Atendimento, que é como se confere no Kommo) e no fim da aba
// Vendedores (agrupado pelo nome normalizado do vendedor, para casar com o
// ranking que aparece acima dele na mesma página).
function RelatorioNominalMatriculas({ mat, agruparPor = "atendente" }) {
  const [filtro, setFiltro] = useState("todos");

  const porVendedor = agruparPor === "vendedor";
  const rotuloPessoa = porVendedor ? "Vendedor" : "Atendente";
  const titulo = porVendedor ? "Matrículas por vendedor · detalhe" : "Relatório nominal · auditoria";

  if (!mat) {
    return <Panel title={titulo}><Placeholder label="Carregando matrículas…" /></Panel>;
  }

  const lista = mat.lista || [];
  const pessoas = (porVendedor ? mat.por_vendedor : mat.por_atendente) || [];
  const campo = porVendedor ? "vendedor" : "atendente";

  const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const dec = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const dataBR = (s) => (s ? new Date(s).toLocaleDateString("pt-BR") : "—");

  const filtrada = filtro === "todos" ? lista : lista.filter((r) => r[campo] === filtro);

  const baixarCSV = () => {
    const cab = ["Lead ID", "Aluno", "Escola", "Curso", "Cursos no lead", "Vendedor",
      "Registro de Atendimento", "Atendentes no lead", "Crédito",
      "Valor do lead", "Valor rateado", "Data do pagamento"];
    const linhas = filtrada.map((r) => [
      r.lead_id, r.aluno, (SCHOOLS[r.escola] || {}).label || r.escola,
      r.curso || "(sem curso)", r.cursos_no_lead,
      r.vendedor, r.atendente, r.atendentes_no_lead,
      dec(r.credito), dec(r.valor), dec(r.valor_credito),
      dataBR(r.data_matricula),
    ]);
    const csv = [cab, ...linhas]
      .map((l) => l.map((c) => `"${String(c == null ? "" : c).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const per = (mat.periodo || {}).from ? String(mat.periodo.from).slice(0, 10) : "periodo";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `matriculas_${per}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const chip = (ativo) => ({
    background: ativo ? T.ink : "transparent", color: ativo ? T.onInk : T.ink,
    border: `1px solid ${ativo ? T.ink : T.border}`, borderRadius: 20, padding: "4px 11px",
    fontSize: 11.5, fontWeight: 500, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap",
  });

  const semDono = "(sem registro de atendimento)";

  return (
    <Panel
      title={<>{titulo} <Info texto={`Todas as matrículas contadas no período, uma linha por aluno, com o ${rotuloPessoa.toLowerCase()} que recebeu o crédito e a base de data usada. É este relatório que permite conferir os números linha a linha contra o Kommo.`} /></>}
      right={
        <button onClick={baixarCSV} style={{
          background: T.ink, color: T.onInk, border: "none", borderRadius: 8,
          padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font,
        }}>Baixar CSV ({num(filtrada.length)})</button>
      }
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => setFiltro("todos")} style={chip(filtro === "todos")}>
          Todos ({num(lista.length)})
        </button>
        {pessoas.map((p) => (
          <button key={p[campo]} onClick={() => setFiltro(p[campo])} style={chip(filtro === p[campo])}>
            {p[campo]} ({num(p.leads)})
          </button>
        ))}
      </div>

      <DataTable
        rows={filtrada}
        initialSort={{ key: "data_matricula", dir: "desc" }}
        pageSize={15}
        columns={[
          { key: "aluno", label: "Aluno", render: (r) => <b style={{ fontWeight: 500 }}>{r.aluno}</b> },
          { key: "escola", label: "Escola", render: (r) => <SchoolTag school={r.escola} /> },
          {
            key: campo, label: rotuloPessoa,
            render: (r) => (r[campo] === semDono
              ? <span style={{ color: T.red }}>{r[campo]}</span>
              : <span title={porVendedor ? `Registro de Atendimento: ${r.atendente}` : undefined}>{r[campo]}</span>),
          },
          {
            key: "credito", label: "Crédito", style: { textAlign: "right" },
            render: (r) => (Number(r.atendentes_no_lead) > 1
              ? <span style={{ color: T.amber, fontWeight: 600 }} title={`Dividida entre ${r.atendentes_no_lead} atendentes`}>{dec(r.credito)}</span>
              : dec(r.credito)),
          },
          { key: "valor", label: "Valor", render: (r) => moeda(r.valor), style: { textAlign: "right" } },
          {
            key: "curso", label: "Curso",
            render: (r) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {r.curso || <span style={{ color: T.muted }}>(sem curso)</span>}
                {Number(r.cursos_no_lead) > 1 && (
                  <span
                    title={`Este aluno fez ${r.cursos_no_lead} matrículas: uma para cada curso do lead.`}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 20,
                      background: T.ink + T.tint, border: `1px solid ${T.ink}${T.tintForte}`,
                      color: T.ink, whiteSpace: "nowrap",
                    }}
                  >{r.cursos_no_lead} cursos</span>
                )}
              </span>
            ),
          },
          { key: "data_matricula", label: "Pagamento", render: (r) => dataBR(r.data_matricula), style: { whiteSpace: "nowrap" } },
          { key: "lead_id", label: "Lead", render: (r) => <span style={{ color: T.muted, fontSize: 11 }}>{r.lead_id}</span> },
        ]}
      />
    </Panel>
  );
}

// ── Aba: Matrículas & Auditoria ──
// Critério canônico de matrícula (definido com a operação em jul/2026):
//   1. Data: campo DATA PAGAMENTO MATRICULA (cartão do contato) dentro do período.
//   2. Atribuição: exclusivamente pelo campo REGISTRO DE ATENDIMENTO.
//      Com mais de um atendente registrado, a matrícula é dividida em partes iguais.
//   3. Escola: sempre a do lead (funil). Os atendentes atuam nas duas escolas, então
//      o prefixo INE-/MAT- no nome do usuário é só parte do nome e não classifica nada —
//      por isso o total de cada usuário vem aberto por escola.
function AbaMatriculas({ mat, schools, insg }) {
  const [metricaCurso, setMetricaCurso] = useState("matriculas");
  const lerIns = (k) => ((insg && insg[k]) || {}).leitura || null;
  if (!mat) return <Placeholder label="Carregando matrículas…" />;

  const diag = mat.diagnostico || {};
  const porEscola = mat.por_escola || [];
  // Insights vem calculados do banco: cada frase carrega o numero que a sustenta,
  // entao nunca ficam desatualizados nem viram texto generico.
  const ins = mat.insights || {};
  const insEscola = ins.por_escola || {};
  const insAtendente = ins.por_atendente || {};
  const comInsight = (base, extra) => (extra ? base + "\n\n" + extra : base);

  const totalLeads = Number(diag.total_leads || 0);
  const canonico = totalLeads > 0 && Number(diag.por_data_pagamento || 0) === totalLeads;

  const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const dec = (v) => Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const totalMat = Number(diag.total_matriculas || 0);
  const totalFat = (mat.por_escola || []).reduce((a, e) => a + Number(e.faturamento || 0), 0);

  const porCurso = (mat.por_curso || [])
    .filter((c) => schools.includes(c.escola))
    .map((c) => ({ ...c, part: totalMat > 0 ? (100 * Number(c.matriculas || 0)) / totalMat : 0 }));

  const porForma = (mat.por_forma || []).filter((f) => schools.includes(f.escola));

  // Grafico de cursos: barras horizontais porque nome de curso e longo demais
  // para caber no eixo X. Empilhado por escola, ja que 6 dos 12 cursos do topo
  // sao vendidos pelas duas. O alternador existe porque a ordem muda: Seguranca
  // do Trabalho e 6o em volume e 9o em faturamento (ticket baixo).
  const TOPO_CURSOS = 10;
  const cursoChart = (() => {
    const porNome = {};
    porCurso.forEach((c) => {
      const k = c.curso;
      porNome[k] = porNome[k] || { curso: k, _m: 0, _f: 0 };
      porNome[k][c.escola] = Number(c[metricaCurso === "faturamento" ? "faturamento" : "matriculas"] || 0);
      porNome[k]._m += Number(c.matriculas || 0);
      porNome[k]._f += Number(c.faturamento || 0);
    });
    const linhas = Object.values(porNome)
      .sort((a, b) => (metricaCurso === "faturamento" ? b._f - a._f : b._m - a._m));
    const topo = linhas.slice(0, TOPO_CURSOS);
    const resto = linhas.slice(TOPO_CURSOS);
    if (resto.length) {
      const agr = { curso: `+ ${resto.length} outros cursos`, _m: 0, _f: 0, _agregado: true };
      resto.forEach((r) => {
        schools.forEach((e) => { agr[e] = (agr[e] || 0) + Number(r[e] || 0); });
        agr._m += r._m; agr._f += r._f;
      });
      topo.push(agr);
    }
    // rotulo curto: o eixo tem largura fixa e nome longo vira reticencias
    return topo.map((l) => ({
      ...l,
      label: l.curso.length > 30 ? l.curso.slice(0, 29) + "…" : l.curso,
    }));
  })();

  // consolida as escolas para os cartoes do topo do bloco
  const formasResumo = Object.values(
    porForma.reduce((acc, f) => {
      const k = f.forma;
      acc[k] = acc[k] || { forma: k, matriculas: 0, faturamento: 0 };
      acc[k].matriculas += Number(f.matriculas || 0);
      acc[k].faturamento += Number(f.faturamento || 0);
      return acc;
    }, {})
  )
    .map((f) => ({
      ...f,
      ticket_medio: f.matriculas > 0 ? f.faturamento / f.matriculas : 0,
      part: totalFat > 0 ? (100 * f.faturamento) / totalFat : 0,
    }))
    .sort((a, b) => b.faturamento - a.faturamento);

  // A quebra por escola vem aninhada em `escolas`; achatamos para a tabela poder ordenar.
  const porAtendente = (mat.por_atendente || []).map((r) => {
    const linha = { ...r };
    schools.forEach((s) => {
      const e = (r.escolas || {})[s] || {};
      linha[`m_${s}`] = Number(e.matriculas || 0);
      linha[`f_${s}`] = Number(e.faturamento || 0);
    });
    return linha;
  });

  const colunasAtendente = [
    { key: "atendente", label: "Atendente" },
    ...schools.map((s) => ({
      key: `m_${s}`,
      label: (SCHOOLS[s] || {}).label || s,
      style: { textAlign: "right" },
      render: (r) => (r[`m_${s}`] > 0
        ? <span style={{ color: SCHOOLS[s].color, fontWeight: 600 }} title={moeda(r[`f_${s}`])}>{dec(r[`m_${s}`])}</span>
        : <span style={{ color: T.muted }}>—</span>),
    })),
    {
      key: "matriculas", label: "Total", style: { textAlign: "right" },
      render: (r) => {
        const nome = String(r.atendente || "").replace(/^(MAT|INE) - /, "");
        const t = insAtendente[nome];
        return (
          <b
            title={t || undefined}
            style={t ? { borderBottom: `1px dotted ${T.muted}`, cursor: "help" } : undefined}
          >{dec(r.matriculas)}</b>
        );
      },
    },
    { key: "faturamento", label: "Faturamento", style: { textAlign: "right" }, render: (r) => moeda(r.faturamento) },
    {
      key: "compartilhadas", label: "Divididas", style: { textAlign: "right" },
      render: (r) => (Number(r.compartilhadas) > 0
        ? <span style={{ color: T.amber, fontWeight: 600 }}>{num(r.compartilhadas)}</span>
        : <span style={{ color: T.muted }}>0</span>),
    },
  ];

  return (
    <div style={{ display: "grid", gap: 14 }}>

      {/* ── Critério de contagem em vigor ── */}
      <div style={{
        background: T.green + T.tint,
        border: `1px solid ${T.green}${T.tintForte}`,
        borderLeft: `3px solid ${T.green}`,
        borderRadius: 10, padding: "13px 16px",
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
          Critério conferido contra a planilha de julho/2026
        </div>
        <div style={{ fontSize: 11.5, lineHeight: 1.65, color: T.text, opacity: 0.9 }}>
          Conta como matrícula o lead na etapa <b>MATRÍCULA REALIZADA</b> — ou já movido ao funil
          <b> SUCESSO DO ALUNO</b> (Boas-vindas, Jornada, Formado), pois só chega lá quem matriculou —
          com <b>DATA PAGAMENTO MATRICULA</b> dentro do período. A unidade contada é o <b>curso</b>, não o
          lead: aluno com mais de um curso listado fez mais de uma matrícula. O crédito vai para quem está
          no <b>REGISTRO DE ATENDIMENTO</b>, rateado quando há mais de um nome. Leads repetidos (mesmo
          aluno, curso e data) contam uma vez. Aluno cancelado sai da contagem do mês em que pagou.
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 9, fontSize: 11, color: T.muted }}>
          <span>Matrículas: <b style={{ color: T.text }}>{dec(diag.total_matriculas)}</b></span>
          <span>Leads: <b style={{ color: T.text }}>{num(diag.total_leads)}</b></span>
          <span>Alunos com mais de um curso: <b style={{ color: T.text }}>{num(diag.alunos_multi_curso)}</b></span>
        </div>
      </div>

      {/* ── Total por escola ── */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${schools.length}, minmax(0,1fr))`, gap: 14 }}>
        {schools.map((s) => {
          const e = porEscola.find((x) => x.escola === s) || {};
          return (
            <Panel key={s} title={<SchoolTag school={s} />}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(115px,1fr))", gap: 10 }}>
                <Kpi label="Matrículas" value={dec(e.matriculas)} accent={SCHOOLS[s].color}
                  title={comInsight(
                    "Total da escola no período, pelo funil do lead.",
                    insEscola[s]
                  )} />
                <Kpi label="Faturamento" value={moeda(e.faturamento)} />
                <Kpi label="Ticket médio" value={moeda(e.ticket_medio)} />
              </div>
            </Panel>
          );
        })}
      </div>

      {/* ── Matrículas por usuário, abertas por escola ── */}
      <Panel title={<>Matrículas por usuário <Info texto="A atribuição usa exclusivamente o campo REGISTRO DE ATENDIMENTO do lead — não o responsável do card. Como os usuários atendem as duas escolas, cada linha mostra quantas matrículas ele fez em cada uma. Quando há mais de um atendente no mesmo lead, a matrícula é dividida igualmente entre eles, por isso os valores podem ser fracionados." /></>}>
        <DataTable
          rows={porAtendente}
          initialSort={{ key: "matriculas", dir: "desc" }}
          pageSize={12}
          columns={colunasAtendente}
        />
        <div style={{ marginTop: 10, fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
          A escola de cada matrícula é a do funil do lead. O prefixo no nome do usuário não classifica a matrícula.
          Passe o cursor sobre o número de cada escola para ver o faturamento correspondente.
        </div>
      </Panel>

      {/* ── Ranking de matrículas por curso ── */}
      <Panel title={<TituloComLeitura texto={lerIns("cursos_vendidos")}>Matrículas por curso <Info texto="Ranking do que foi efetivamente vendido no período. Aluno com mais de um curso gera uma linha por curso, por isso a soma bate com o total de matrículas. Para comparar com o que foi PROCURADO (demanda que não virou venda), veja a aba Origem, Canal & Região." /></TituloComLeitura>}>
        {/* alternador: a ordem por volume e por faturamento nao e a mesma */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[["matriculas", "Por matrículas"], ["faturamento", "Por faturamento"]].map(([id, rot]) => (
            <button key={id} onClick={() => setMetricaCurso(id)}
              style={{
                fontFamily: font, fontSize: 11.5, padding: "6px 13px", borderRadius: 999,
                cursor: "pointer",
                border: `1px solid ${metricaCurso === id ? T.text : T.border}`,
                background: metricaCurso === id ? T.text : T.panel,
                color: metricaCurso === id ? T.panel : T.muted,
                fontWeight: metricaCurso === id ? 600 : 400,
              }}>{rot}</button>
          ))}
        </div>

        <div style={{ width: "100%", height: Math.max(200, cursoChart.length * 34 + 34) }}>
          <ResponsiveContainer>
            <BarChart data={cursoChart} layout="vertical"
              margin={{ top: 0, right: 52, left: 10, bottom: 0 }} barGap={2}>
              <XAxis type="number" stroke={T.muted} fontSize={10} tickLine={false} axisLine={false}
                allowDecimals={metricaCurso !== "matriculas"}
                tickFormatter={(v) => metricaCurso === "faturamento"
                  ? (v >= 1000 ? "R$ " + (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil" : "R$ " + v)
                  : v} />
              <YAxis type="category" dataKey="label" stroke={T.muted} fontSize={10.5}
                width={210} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#00000006" }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: T.panelSoft, border: `1px solid ${T.border}`, borderRadius: 8,
                                padding: "9px 12px", fontSize: 12, fontFamily: font, maxWidth: 300 }}>
                    <div style={{ marginBottom: 5, fontWeight: 600 }}>{d.curso}</div>
                    {payload.filter((p) => p.value > 0).map((p, i) => (
                      <div key={i} style={{ color: p.color }}>
                        {p.name}: <b>{metricaCurso === "faturamento" ? moeda(p.value) : dec(p.value)}</b>
                      </div>
                    ))}
                    {!d._agregado && (
                      <div style={{ color: T.muted, marginTop: 5, fontSize: 11 }}>
                        {dec(d._m)} matrícula(s) · {moeda(d._f)} · ticket {moeda(d._m > 0 ? d._f / d._m : 0)}
                      </div>
                    )}
                  </div>
                );
              }} />
              <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
              {schools.map((e, i) => (
                <Bar key={e} dataKey={e} stackId="c" name={SCHOOLS[e].label}
                  fill={SCHOOLS[e].color} maxBarSize={17}
                  radius={i === schools.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}>
                  {i === schools.length - 1 && (
                    <LabelList position="right" fill={T.muted} fontSize={10}
                      valueAccessor={(entry) => {
                        const d = entry.payload || entry;
                        const t = metricaCurso === "faturamento" ? d._f : d._m;
                        return t > 0 ? (metricaCurso === "faturamento" ? moeda(t) : dec(t)) : "";
                      }} />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: 11, color: T.muted, margin: "6px 0 14px", lineHeight: 1.6 }}>
          Top {TOPO_CURSOS} cursos; os demais somados na última barra. Barras empilhadas por escola —
          vários cursos são vendidos pelas duas. Passe o cursor para ver volume, faturamento e ticket juntos.
        </div>

        <DataTable
          rows={porCurso}
          initialSort={{ key: "matriculas", dir: "desc" }}
          pageSize={12}
          columns={[
            { key: "escola", label: "Escola", render: (r) => <SchoolTag school={r.escola} /> },
            { key: "curso", label: "Curso", style: { whiteSpace: "normal", minWidth: 200 } },
            { key: "matriculas", label: "Matrículas", style: { textAlign: "right" },
              render: (r) => <b>{dec(r.matriculas)}</b> },
            { key: "part", label: "% do total", style: { textAlign: "right" },
              render: (r) => <span style={{ color: T.muted }}>{dec1(r.part)}%</span> },
            { key: "faturamento", label: "Faturamento", style: { textAlign: "right" },
              render: (r) => moeda(r.faturamento) },
            { key: "ticket_medio", label: "Ticket médio", style: { textAlign: "right" },
              render: (r) => moeda(r.ticket_medio) },
          ]}
        />
        <div style={{ marginTop: 10, fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
          Ordenado por volume. Clique em <b>Faturamento</b> para ver quais cursos sustentam a receita —
          nem sempre são os mesmos que lideram em quantidade.
        </div>
      </Panel>

      {/* ── Faturamento por forma de pagamento ── */}
      <Panel title={<TituloComLeitura texto={lerIns("pagamento")}>Faturamento por forma de pagamento <Info texto="Como o aluno pagou, pelo campo Forma de Pagamento do lead. O ticket médio por forma costuma revelar o efeito do parcelamento: formas parceladas sustentam tickets mais altos, à vista tendem a ticket menor com recebimento imediato." /></TituloComLeitura>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 14 }}>
          {formasResumo.map((f) => (
            <Kpi key={f.forma} label={f.forma} value={moeda(f.faturamento)}
              accent={f.forma === "(sem forma)" ? T.amber : undefined}
              sub={`${dec(f.matriculas)} matrícula(s) · ${dec1(f.part)}% da receita`}
              title={f.forma === "(sem forma)"
                ? "Matrículas contadas normalmente, mas sem a forma de pagamento preenchida no Kommo. Aparecem nomeadas nos alertas no fim da página."
                : `Ticket médio de ${moeda(f.ticket_medio)} nesta forma.`} />
          ))}
        </div>
        <DataTable
          rows={porForma}
          initialSort={{ key: "faturamento", dir: "desc" }}
          pageSize={10}
          columns={[
            { key: "escola", label: "Escola", render: (r) => <SchoolTag school={r.escola} /> },
            { key: "forma", label: "Forma de pagamento",
              render: (r) => (
                <span style={{ color: r.forma === "(sem forma)" ? T.amber : undefined,
                               fontWeight: r.forma === "(sem forma)" ? 600 : 400 }}>
                  {r.forma}
                </span>
              ) },
            { key: "matriculas", label: "Matrículas", style: { textAlign: "right" },
              render: (r) => dec(r.matriculas) },
            { key: "faturamento", label: "Faturamento", style: { textAlign: "right" },
              render: (r) => <b>{moeda(r.faturamento)}</b> },
            { key: "ticket_medio", label: "Ticket médio", style: { textAlign: "right" },
              render: (r) => moeda(r.ticket_medio) },
          ]}
        />
      </Panel>

      {/* ── daqui para baixo é conferência, não análise: separado de propósito ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginTop: 6,
        paddingTop: 4,
      }}>
        <div style={{ height: 1, flex: "0 0 18px", background: T.border }} />
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".09em",
          textTransform: "uppercase", color: T.muted, whiteSpace: "nowrap",
        }}>
          Auditoria e conferência
        </div>
        <div style={{ height: 1, flex: 1, background: T.border }} />
      </div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: -6, lineHeight: 1.6 }}>
        Os blocos acima mostram <b>o resultado</b> do período. Os de baixo servem para
        <b> conferir a base</b> antes de fechar o mês: relatório nome a nome e os cadastros
        que precisam de correção no Kommo.
      </div>

      <RelatorioNominalMatriculas mat={mat} agruparPor="atendente" />

      {/* ── Pontos de atenção da base ── */}
      <Panel title={<>Consistência do período <Info texto="Casos que merecem conferência manual no Kommo. Os dois primeiros já estão contados; os dois últimos ficam de fora da contagem até serem corrigidos na origem." /></>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <Kpi label="Matrículas no período" value={dec(diag.total_matriculas)}
            title={comInsight("Soma de todas as escolas, contando uma matrícula por curso.", ins.concentracao)} />
          <Kpi label="Alunos com mais de um curso" value={num(diag.alunos_multi_curso)}
            title={comInsight("Cada curso listado no lead vira uma matrícula.", ins.cross_sell)} />
          <Kpi label="Sem Registro de Atendimento" value={num(diag.sem_atendente)}
            accent={Number(diag.sem_atendente) > 0 ? T.red : undefined}
            title="Contam para a escola, mas não são creditadas a nenhum vendedor. Preencher o campo no Kommo." />
          <Kpi label="Na etapa sem data de pagamento" value={num(diag.sem_data_pagamento)}
            accent={Number(diag.sem_data_pagamento) > 0 ? T.red : undefined}
            title="Leads em MATRÍCULA REALIZADA cujo campo DATA PAGAMENTO MATRICULA está vazio. Ficam FORA da contagem até serem preenchidos no Kommo." />
          <Kpi label="Data de pagamento inválida" value={num(diag.data_invalida)}
            accent={Number(diag.data_invalida) > 0 ? T.red : undefined}
            title="Campo preenchido com valor que não converte em data (ano errado, data sem ano). A matrícula fica FORA da contagem até a correção no Kommo." />
          <Kpi label="Sem forma de pagamento" value={num(diag.sem_forma_pagamento)}
            accent={Number(diag.sem_forma_pagamento) > 0 ? T.amber : undefined}
            title="Matrículas contadas normalmente, mas com o campo Forma de Pagamento vazio no Kommo. Não afetam o total nem o faturamento — afetam a leitura de como a receita entra. Aparecem nomeadas abaixo." />
          <Kpi label="No funil do aluno sem data" value={num(diag.sucesso_sem_data)}
            accent={Number(diag.sucesso_sem_data) > 0 ? T.amber : undefined}
            title="Cards fechados no período que estão no funil SUCESSO DO ALUNO sem data de pagamento. Ficam fora da contagem. A conferência com a planilha de julho indica que são atendimentos de alunos antigos, não matrículas perdidas — mas vale checar antes de fechar o mês: se algum for matrícula real, basta preencher a data no Kommo que ele entra." />
        </div>

        {Number(diag.sem_data_pagamento) > 0 && (
          <div style={{
            marginTop: 12, padding: "10px 13px", borderRadius: 8,
            background: T.red + T.tint, border: `1px solid ${T.red}${T.tintForte}`,
            fontSize: 11.5, lineHeight: 1.6,
          }}>
            <b>{num(diag.sem_data_pagamento)} matrícula(s) não estão sendo contadas</b> porque o campo
            DATA PAGAMENTO MATRICULA está vazio no cartão do contato. Preencher no Kommo faz elas
            entrarem automaticamente na próxima sincronização.
            {(mat.pendencias || []).length > 0 && (
              <div style={{ marginTop: 7, color: T.muted }}>
                {(mat.pendencias || []).slice(0, 8).map((p) => p.name).join(" · ")}
                {(mat.pendencias || []).length > 8 ? ` … e mais ${(mat.pendencias || []).length - 8}` : ""}
              </div>
            )}
          </div>
        )}

        {(mat.pendencias_data || []).length > 0 && (
          <div style={{
            marginTop: 12, padding: "10px 13px", borderRadius: 8,
            background: T.red + T.tint, border: `1px solid ${T.red}${T.tintForte}`,
            fontSize: 11.5, lineHeight: 1.7,
          }}>
            <b>Data de pagamento que não converte</b> — corrigir o valor no cartão do contato no Kommo:
            <div style={{ marginTop: 5 }}>
              {(mat.pendencias_data || []).map((p) => (
                <div key={p.id}>
                  {p.name} <span style={{ color: T.muted }}>({(SCHOOLS[p.school] || {}).label || p.school})</span>
                  {" — digitado: "}<b>"{p.valor}"</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {(mat.pendencias_forma || []).length > 0 && (
          <div style={{
            marginTop: 12, padding: "10px 13px", borderRadius: 8,
            background: T.amber + T.tint, border: `1px solid ${T.amber}${T.tintForte}`,
            fontSize: 11.5, lineHeight: 1.7,
          }}>
            <b>Sem forma de pagamento preenchida</b> — estas matrículas contam no total e no
            faturamento, mas ficam fora da leitura de como a receita entrou. Preencher o campo
            no lead resolve:
            <div style={{ marginTop: 5 }}>
              {(mat.pendencias_forma || []).map((p) => (
                <div key={p.id}>
                  {p.name} <span style={{ color: T.muted }}>({(SCHOOLS[p.school] || {}).label || p.school}</span>
                  <span style={{ color: T.muted }}>{p.curso ? " · " + p.curso : ""} · {p.atendente})</span>
                  {" — "}<b>{moeda(p.valor)}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {(mat.pendencias_registro || []).length > 0 && (
          <div style={{
            marginTop: 12, padding: "10px 13px", borderRadius: 8,
            background: T.amber + T.tint, border: `1px solid ${T.amber}${T.tintForte}`,
            fontSize: 11.5, lineHeight: 1.7,
          }}>
            <b>Sem Registro de Atendimento</b> — contam para a escola, mas não são creditadas
            a nenhum vendedor. Selecionar o atendente no campo do lead resolve:
            <div style={{ marginTop: 5 }}>
              {(mat.pendencias_registro || []).map((p) => (
                <div key={p.id}>
                  {p.name} <span style={{ color: T.muted }}>({(SCHOOLS[p.school] || {}).label || p.school}{p.curso ? " · " + p.curso : ""})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

// Marketing dividido por plataforma: Google e Meta entregam metricas
// diferentes, e a visao geral e onde os dois se encontram com o resultado.
const ABAS_MKT = [
  { id: "geral", label: "Visão Geral" },
  { id: "google", label: "Google Ads" },
  { id: "meta", label: "Meta Ads" },
  { id: "organico", label: "Redes Orgânicas" },
];

const ABAS = [
  { id: "visao", label: "Visão Geral" },
  { id: "pipeline", label: "Pipeline & Contato" },
  { id: "origem", label: "Origem, Canal & Região" },
  { id: "jornada", label: "Jornada & Origem" },
  { id: "metas", label: "Metas & Comissões" },
  { id: "vendedores", label: "Vendedores" },
  { id: "matriculas", label: "Matrículas & Auditoria" },
  { id: "funil", label: "Funil & Perdas" },
  { id: "sdr", label: "Agente SDR" },
  { id: "financeiro", label: "Financeiro & Produto" },
];

export default function DashboardEdilvo() {
  const [tema, setTema] = useState(() => {
    try { return window.localStorage.getItem("edilvo_tema") || "claro"; } catch (e) { return "claro"; }
  });
  Object.assign(T, THEMES[tema] || THEMES.claro);
  SCHOOLS.matricula_ead.color = T.gold;
  SCHOOLS.ineprotec.color = T.steel;
  useEffect(() => {
    try { window.localStorage.setItem("edilvo_tema", tema); } catch (e) {}
    document.body.style.background = T.bg;
    document.documentElement.style.colorScheme = tema === "escuro" ? "dark" : "light";
  }, [tema]);
  const [menu, setMenu] = useState("home");
  const [periodo, setPeriodo] = useState("mes_atual");
  const [escola, setEscola] = useState("todas");
  const [aba, setAba] = useState("visao");
  const [abaMkt, setAbaMkt] = useState("geral");
  const [mat, setMat] = useState(null);
  const [insg, setInsg] = useState(null);
  const [crs, setCrs] = useState(null);
  const [mres, setMres] = useState(null);
  const [social, setSocial] = useState(null);
  const [canalGoogle, setCanalGoogle] = useState(null);
  const [canalMeta, setCanalMeta] = useState(null);
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
  const [reg, setReg] = useState(null);
  const [orig, setOrig] = useState(null);
  const [pipe, setPipe] = useState(null);
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
    try {
      const dFrom = new Date(from + "T00:00:00"), dTo = new Date(to + "T00:00:00");
      let pFrom, pTo;
      if (dFrom.getDate() === 1) { // mês: compara com o mesmo intervalo de dias do mês anterior
        pFrom = new Date(dFrom.getFullYear(), dFrom.getMonth() - 1, 1);
        const fim = new Date(dTo.getFullYear(), dTo.getMonth() - 1, dTo.getDate());
        pTo = new Date(Math.min(fim, dFrom) - 86400000);
      } else {
        const dur = dTo - dFrom;
        pFrom = new Date(dFrom - dur); pTo = new Date(dFrom - 86400000);
      }
      const fmt = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      PREV_LABEL = `${fmt(pFrom)} a ${fmt(pTo)}`;
    } catch (e) { PREV_LABEL = ""; }
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
      rpc("dashboard_regiao_curso", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_origem_detalhe", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_pipeline", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_matriculas", { p_token: RPC_TOKEN, p_from: from, p_to: to, p_school: null }),
      rpc("dashboard_insights", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_cursos", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_marketing_resumo", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_social", { p_token: RPC_TOKEN, p_from: from, p_to: to }),
      rpc("dashboard_canal", { p_token: RPC_TOKEN, p_from: from, p_to: to, p_channel: "google" }),
      rpc("dashboard_canal", { p_token: RPC_TOKEN, p_from: from, p_to: to, p_channel: "meta" }),
    ])
      .then(([j, m, x, w, s, jo, q, fl, rg, od, pp, mt, isg, cr, mr, so, cg, cm]) => {
        setQual(q); setFila(fl); setReg(rg); setOrig(od); setPipe(pp); setMat(mt); setInsg(isg); setCrs(cr); setMres(mr); setSocial(so); setCanalGoogle(cg); setCanalMeta(cm);
        if (w) { j = { ...j, vendedores: w.vendedores, cursos: w.cursos, faixas: w.faixas, vendedores_coorte: w.vendedores_coorte }; }
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
        .content{flex:1;min-width:0;overflow-x:hidden}
        @media(max-width:760px){
          .layout{overflow-x:hidden}
          h2{font-size:12.5px}
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
            <img src="https://ineprotec.com.br/img/logo-ineprotec.webp" alt="Ineprotec" style={{ height: 34, alignSelf: "flex-start" }} onError={(e) => { e.target.style.display = "none"; }} />
            <img src="https://matriculaead-landing.vercel.app/images/logo.png" alt="Matrícula EAD" style={{ height: 34, alignSelf: "flex-start" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <nav>
            {MENUS.map((m) => (
              <button key={m.id} onClick={() => setMenu(m.id)} aria-current={menu === m.id ? "page" : undefined} style={navItem(menu === m.id)}>{m.label}</button>
            ))}
          </nav>
          {menu === "marketing" && (
            <div className="subnav" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
              {ABAS_MKT.map((a) => (
                <button key={a.id} onClick={() => setAbaMkt(a.id)} aria-current={abaMkt === a.id ? "page" : undefined}
                  style={{ ...navItem(abaMkt === a.id), fontSize: 12, padding: "8px 12px", background: abaMkt === a.id ? T.panelSoft : "transparent", color: T.ink, borderLeft: abaMkt === a.id ? `3px solid ${T.ink}` : "3px solid transparent", borderRadius: 6 }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
          {menu === "comercial" && (
            <div className="subnav" style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
              {ABAS.map((a) => (
                <button key={a.id} onClick={() => setAba(a.id)} aria-current={aba === a.id ? "page" : undefined}
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
              <span style={{ width: 1, height: 22, background: T.border, margin: "0 4px" }} />
              <span style={{ fontSize: 11, color: T.muted, marginRight: 2 }}>Escola</span>
              <button onClick={() => setEscola("todas")} style={btn(escola === "todas")}>Todas</button>
              <button onClick={() => setEscola("matricula_ead")} style={{ ...btn(escola === "matricula_ead"), ...(escola === "matricula_ead" ? { background: T.gold, borderColor: T.gold, color: "#FFFFFF" } : {}) }}>Matrícula EAD</button>
              <button onClick={() => setEscola("ineprotec")} style={{ ...btn(escola === "ineprotec"), ...(escola === "ineprotec" ? { background: T.steel, borderColor: T.steel, color: "#FFFFFF" } : {}) }}>Ineprotec</button>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {fresh && <FreshChip fresh={fresh} />}
            </div>
          </div>

          <main className="pad" style={{ padding: "16px 18px 40px", maxWidth: 1240 }}>
            <h1 style={{ position: "absolute", left: -9999, fontSize: 1 }}>Painel Edilvo — Matrícula EAD e Ineprotec</h1>
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
                    {aba === "pipeline" && <AbaPipeline pipe={pipe} schools={schools} insg={insg} />}
                    {aba === "funil" && <AbaFunilPerdas data={data} schools={schools} insg={insg} />}
                    {aba === "vendedores" && <AbaVendedores data={data} schools={schools} mat={mat} />}
                    {aba === "matriculas" && <AbaMatriculas mat={mat} schools={schools} insg={insg} />}
                    {aba === "origem" && <AbaOrigem data={data} extra={extra} reg={reg} schools={schools} insg={insg} crs={crs} />}
                    {aba === "financeiro" && <AbaFinanceiro data={data} schools={schools} />}
                    {aba === "metas" && <AbaMetas data={data} periodoFrom={periodoAtualFrom} onSaved={() => setReload((r) => r + 1)} />}
                    {aba === "sdr" && <AbaSDR sdr={sdr} schools={schools} insg={insg} />}
                    {aba === "jornada" && <AbaJornada jor={jor} schools={schools} insg={insg} />}
                  </>
                )}
                {menu === "marketing" && <>
                    {abaMkt === "geral" && <MenuMarketing mkt={mkt} qual={qual} orig={orig} schools={schools} insg={insg} mres={mres} />}
                    {abaMkt === "google" && <AbaCanal dados={canalGoogle} schools={schools} canal="google" insg={insg} />}
                    {abaMkt === "meta" && <AbaCanal dados={canalMeta} schools={schools} canal="meta" insg={insg} />}
                    {abaMkt === "organico" && <BlocoOrganico social={social} schools={schools} insg={insg} />}
                  </>}
                {menu === "home" && <MenuHome data={data} mkt={mkt} extra={extra} qual={qual} schools={schools} goTo={setMenu} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
