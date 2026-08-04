// ═══════════════════════════════════════════════════════════════
// social-sync — ingestão dos dados ORGÂNICOS de Instagram e Facebook
//
// Particularidades da API do Meta descobertas na implantação:
//   • Métricas de PÁGINA exigem um Page Access Token, que não é o token
//     do usuário de sistema. Ele é derivado em execução via
//     GET /{page_id}?fields=access_token — por isso não guardamos um
//     segredo a mais.
//   • follower_count do Instagram só responde os últimos 30 dias.
//   • profile_views, website_clicks, accounts_engaged e total_interactions
//     exigem metric_type=total_value e devolvem só o agregado do período,
//     não série diária. Gravamos o agregado no ÚLTIMO dia da janela.
//   • page_impressions, page_fans e impressions do IG foram REMOVIDAS.
//
// Idempotente: reprocessar a mesma janela sobrescreve, nunca duplica.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "npm:@supabase/supabase-js@2";

const API = "https://graph.facebook.com/v22.0";
const TOKEN_ESPERADO = "ba37d3f35fb8c1dbef36184f0c0c1afc157dde7b";

type Fonte = {
  school: string;
  page_id: string;
  page_name?: string;
  ig_id: string;
  token: string;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

async function pegar(url: string) {
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) {
    throw new Error(`${r.status} ${j?.error?.message ?? "erro"}`);
  }
  return j;
}

// O Instagram recusa janelas maiores que 30 dias ("There cannot be more than
// 30 days between since and until"). Fatiamos em blocos de 28 para ter folga.
function fatias(desde: Date, ate: Date, dias = 28): Array<[Date, Date]> {
  const out: Array<[Date, Date]> = [];
  let ini = new Date(desde);
  while (ini < ate) {
    const fim = new Date(Math.min(ini.getTime() + dias * 86400000, ate.getTime()));
    out.push([new Date(ini), fim]);
    ini = new Date(fim.getTime() + 86400000);
  }
  return out.length ? out : [[desde, ate]];
}

// tolera métrica removida sem derrubar a sincronização inteira
async function pegarTolerante(url: string, avisos: string[], rotulo: string) {
  try {
    return await pegar(url);
  } catch (e) {
    avisos.push(`${rotulo}: ${String(e).slice(0, 120)}`);
    return null;
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("token") !== TOKEN_ESPERADO) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const dias = Math.min(Number(url.searchParams.get("days") ?? 30), 90);
  const ate = new Date();
  const desde = new Date(ate.getTime() - dias * 86400000);

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // mesma convenção das demais functions: segredo pelo RPC get_secret
  const { data: seg, error: errSeg } = await sb.rpc("get_secret", { secret_name: "META_ORGANIC_SOURCES" });
  if (errSeg) return new Response(JSON.stringify({ error: errSeg.message }), { status: 500 });
  if (!seg) return new Response(JSON.stringify({ error: "META_ORGANIC_SOURCES ausente no Vault" }), { status: 400 });
  const fontes: Fonte[] = JSON.parse(seg);

  const avisos: string[] = [];
  let linhasDia = 0, linhasPost = 0, perfis = 0;

  for (const f of fontes) {
    // ─────────────── Instagram ───────────────
    try {
      const perfil = await pegar(
        `${API}/${f.ig_id}?fields=username,followers_count,media_count&access_token=${f.token}`,
      );
      await sb.from("social_profile").upsert({
        school: f.school, network: "instagram",
        handle: perfil.username, seguidores: perfil.followers_count,
        publicacoes: perfil.media_count, captured_at: new Date().toISOString(),
      }, { onConflict: "school,network" });
      perfis++;
    } catch (e) {
      avisos.push(`IG perfil ${f.school}: ${String(e).slice(0, 120)}`);
    }

    // série diária: reach sempre; follower_count só nos últimos 30 dias
    const porDia: Record<string, Record<string, number>> = {};
    for (const [de, ateF] of fatias(desde, ate)) {
      const alcance = await pegarTolerante(
        `${API}/${f.ig_id}/insights?metric=reach&period=day&since=${iso(de)}&until=${iso(ateF)}&access_token=${f.token}`,
        avisos, `IG reach ${f.school} ${iso(de)}`,
      );
      for (const v of alcance?.data?.[0]?.values ?? []) {
        const d = String(v.end_time).slice(0, 10);
        (porDia[d] ??= {}).reach = Number(v.value ?? 0);
      }
    }

    const limite30 = new Date(Date.now() - 29 * 86400000);
    const desdeSeg = desde > limite30 ? desde : limite30;
    const segNovos = await pegarTolerante(
      `${API}/${f.ig_id}/insights?metric=follower_count&period=day&since=${iso(desdeSeg)}&until=${iso(ate)}&access_token=${f.token}`,
      avisos, `IG follower_count ${f.school}`,
    );
    for (const v of segNovos?.data?.[0]?.values ?? []) {
      const d = String(v.end_time).slice(0, 10);
      (porDia[d] ??= {}).seguidores_novos = Number(v.value ?? 0);
    }

    // agregados do período: gravados no último dia da janela
    // agregados sao do periodo consultado, nao serie: usamos a ultima fatia de 28d
    const [aggDe] = [new Date(Math.max(desde.getTime(), ate.getTime() - 28 * 86400000))];
    const agg = await pegarTolerante(
      `${API}/${f.ig_id}/insights?metric=profile_views,website_clicks,accounts_engaged,total_interactions` +
        `&metric_type=total_value&period=day&since=${iso(aggDe)}&until=${iso(ate)}&access_token=${f.token}`,
      avisos, `IG agregados ${f.school}`,
    );
    const mapaAgg: Record<string, string> = {
      profile_views: "visitas_perfil",
      website_clicks: "cliques_site",
      total_interactions: "engajamento",
      accounts_engaged: "acoes",
    };
    const ultimoDia = iso(ate);
    for (const m of agg?.data ?? []) {
      const col = mapaAgg[m.name];
      if (col) (porDia[ultimoDia] ??= {})[col] = Number(m.total_value?.value ?? 0);
    }

    const linhasIG = Object.entries(porDia).map(([date, v]) => ({
      school: f.school, network: "instagram", date, ...v, updated_at: new Date().toISOString(),
    }));
    if (linhasIG.length) {
      const { error } = await sb.from("social_daily").upsert(linhasIG, { onConflict: "school,network,date" });
      if (error) avisos.push(`IG upsert ${f.school}: ${error.message}`);
      else linhasDia += linhasIG.length;
    }

    // posts do Instagram
    const midia = await pegarTolerante(
      `${API}/${f.ig_id}/media?fields=id,caption,media_type,timestamp,permalink,like_count,comments_count` +
        `&limit=50&since=${iso(desde)}&access_token=${f.token}`,
      avisos, `IG media ${f.school}`,
    );
    const posts = (midia?.data ?? []).map((p: Record<string, unknown>) => ({
      id: `ig_${p.id}`, school: f.school, network: "instagram",
      posted_at: p.timestamp, tipo: p.media_type,
      legenda: String(p.caption ?? "").slice(0, 500), permalink: p.permalink,
      curtidas: Number(p.like_count ?? 0), comentarios: Number(p.comments_count ?? 0),
      updated_at: new Date().toISOString(),
    }));
    if (posts.length) {
      const { error } = await sb.from("social_posts").upsert(posts, { onConflict: "id" });
      if (error) avisos.push(`IG posts ${f.school}: ${error.message}`);
      else linhasPost += posts.length;
    }

    // ─────────────── Facebook ───────────────
    // métricas de página exigem token DE PÁGINA, derivado agora
    let tokenPagina: string | null = null;
    try {
      const r = await pegar(`${API}/${f.page_id}?fields=access_token,name,fan_count&access_token=${f.token}`);
      tokenPagina = r.access_token ?? null;
      await sb.from("social_profile").upsert({
        school: f.school, network: "facebook",
        handle: r.name, seguidores: r.fan_count, captured_at: new Date().toISOString(),
      }, { onConflict: "school,network" });
      perfis++;
    } catch (e) {
      avisos.push(`FB página ${f.school}: ${String(e).slice(0, 120)}`);
    }

    if (tokenPagina) {
      const porDiaFB: Record<string, Record<string, number>> = {};
      const mapaFB: Record<string, string> = {
        page_post_engagements: "engajamento",
        page_daily_follows_unique: "seguidores_novos",
        page_views_total: "visitas_perfil",
        page_total_actions: "acoes",
      };
      const ins = await pegarTolerante(
        `${API}/${f.page_id}/insights?metric=${Object.keys(mapaFB).join(",")}` +
          `&period=day&since=${iso(desde)}&until=${iso(ate)}&access_token=${tokenPagina}`,
        avisos, `FB insights ${f.school}`,
      );
      for (const m of ins?.data ?? []) {
        const col = mapaFB[m.name];
        if (!col) continue;
        for (const v of m.values ?? []) {
          const d = String(v.end_time).slice(0, 10);
          (porDiaFB[d] ??= {})[col] = Number(v.value ?? 0);
        }
      }
      const linhasFB = Object.entries(porDiaFB).map(([date, v]) => ({
        school: f.school, network: "facebook", date, ...v, updated_at: new Date().toISOString(),
      }));
      if (linhasFB.length) {
        const { error } = await sb.from("social_daily").upsert(linhasFB, { onConflict: "school,network,date" });
        if (error) avisos.push(`FB upsert ${f.school}: ${error.message}`);
        else linhasDia += linhasFB.length;
      }

      const fbPosts = await pegarTolerante(
        `${API}/${f.page_id}/posts?fields=id,message,created_time,permalink_url,shares,` +
          `likes.summary(true),comments.summary(true)&limit=50&since=${iso(desde)}&access_token=${tokenPagina}`,
        avisos, `FB posts ${f.school}`,
      );
      const pf = (fbPosts?.data ?? []).map((p: Record<string, any>) => ({
        id: `fb_${p.id}`, school: f.school, network: "facebook",
        posted_at: p.created_time, tipo: "POST",
        legenda: String(p.message ?? "").slice(0, 500), permalink: p.permalink_url,
        curtidas: Number(p.likes?.summary?.total_count ?? 0),
        comentarios: Number(p.comments?.summary?.total_count ?? 0),
        compart: Number(p.shares?.count ?? 0),
        updated_at: new Date().toISOString(),
      }));
      if (pf.length) {
        const { error } = await sb.from("social_posts").upsert(pf, { onConflict: "id" });
        if (error) avisos.push(`FB posts upsert ${f.school}: ${error.message}`);
        else linhasPost += pf.length;
      }
    }
  }

  await sb.from("sync_state").upsert({
    source: "social_organico", last_run: new Date().toISOString(),
  }, { onConflict: "source" });

  return new Response(JSON.stringify({
    ok: true, perfis, linhasDia, linhasPost,
    janela: { de: iso(desde), ate: iso(ate) },
    avisos,
  }), { headers: { "Content-Type": "application/json" } });
});
