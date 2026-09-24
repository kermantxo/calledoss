// Calledoss · Worker de Cloudflare (capa gratuita)
//
// 1. API del panel privado (con clave):
//    POST   /api/login           comprueba la clave
//    GET    /api/state           competiciones añadidas a mano + estado de las fuentes + plan de hoy
//    POST   /api/manual          añade una competición al calendario
//    DELETE /api/manual?id=...   la quita
//    Los cambios se guardan en data/manual.json de la rama "datos" del repositorio y se lanza
//    la tarea "plan" para que aparezcan en el calendario (y en el directo si es hoy).
// 2. Disparador de directo (cron cada 3 min): si live_plan.json dice que hay una ventana de
//    directo activa, lanza el workflow "Directo" de GitHub. Si no, no hace nada.
//
// Secretos (wrangler secret put ...): PANEL_PASSWORD, GITHUB_TOKEN
// Variables (wrangler.toml): REPO, DATA_BRANCH, ALLOWED_ORIGINS

const GH = "https://api.github.com";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    try {
      if (!url.pathname.startsWith("/api/")) {
        return json({ ok: true, service: "calledoss-panel" }, 200, cors);
      }
      if (!(await authorized(request, env))) {
        await sleep(800); // frena intentos de adivinar la clave
        return json({ ok: false, error: "Clave incorrecta" }, 401, cors);
      }
      if (url.pathname === "/api/login" && request.method === "POST") {
        return json({ ok: true }, 200, cors);
      }
      if (url.pathname === "/api/state" && request.method === "GET") {
        const [manual, status, plan, missing] = await Promise.all([
          readFile(env, "manual.json"),
          readFile(env, "status.json"),
          readFile(env, "live_plan.json"),
          readFile(env, "results/sin_resultados.json").catch(() => ({ data: null })),
        ]);
        return json({ ok: true, manual: manual.data || { items: [] }, status: status.data || {}, plan: plan.data || {},
                      missing: missing.data || { items: [] } }, 200, cors);
      }
      if (url.pathname === "/api/manual" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const item = validate(body);
        if (item.error) return json({ ok: false, error: item.error }, 400, cors);
        const file = await readFile(env, "manual.json");
        const data = file.data || { items: [] };
        data.items = (data.items || []).filter((x) => x.id !== item.id);
        data.items.push(item);
        data.items.sort((a, b) => (a.date + a.name).localeCompare(b.date + b.name));
        await writeFile(env, "manual.json", data, file.sha, `panel: añadir ${item.name}`);
        await dispatch(env, "datos.yml", { mode: "plan" });
        return json({ ok: true, item }, 200, cors);
      }
      if (url.pathname === "/api/manual" && request.method === "DELETE") {
        const id = url.searchParams.get("id");
        const file = await readFile(env, "manual.json");
        const data = file.data || { items: [] };
        const before = (data.items || []).length;
        data.items = (data.items || []).filter((x) => x.id !== id);
        if (data.items.length === before) return json({ ok: false, error: "No existe" }, 404, cors);
        await writeFile(env, "manual.json", data, file.sha, `panel: quitar ${id}`);
        await dispatch(env, "datos.yml", { mode: "plan" });
        return json({ ok: true }, 200, cors);
      }
      return json({ ok: false, error: "Ruta no encontrada" }, 404, cors);
    } catch (e) {
      return json({ ok: false, error: String(e.message || e) }, 500, cors);
    }
  },

  // Cron: disparador del modo En Directo
  async scheduled(event, env, ctx) {
    const plan = (await readFile(env, "live_plan.json")).data;
    if (!plan || !plan.windows) return;
    const now = Date.now();
    const active = plan.windows.some(
      (w) => w.poll && Date.parse(w.start) <= now && now <= Date.parse(w.end) + 20 * 60 * 1000
    );
    if (active) await dispatch(env, "directo.yml");
  },
};

// ------------------------------------------------------------------ validación

function madridToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

function validate(b) {
  const clean = (s, n = 160) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
  const name = clean(b.name);
  const date = clean(b.date, 10);
  const place = clean(b.place, 100);
  const time = clean(b.time, 5);
  const timeEnd = clean(b.time_end, 5);
  const url = clean(b.url, 500);
  const type = clean(b.type, 40);
  if (!name) return { error: "Falta el nombre" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Fecha no válida" };
  if (date < madridToday()) return { error: "La fecha ya ha pasado: solo se pueden añadir competiciones de hoy en adelante" };
  if (!place) return { error: "Falta el lugar" };
  if (time && !/^\d{2}:\d{2}$/.test(time)) return { error: "Hora de inicio no válida (usa HH:MM)" };
  if (timeEnd && !/^\d{2}:\d{2}$/.test(timeEnd)) return { error: "Hora de fin no válida (usa HH:MM)" };
  if (url && !/^https?:\/\//i.test(url)) return { error: "El enlace debe empezar por http:// o https://" };
  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return {
    id: `manual-${date}-${slug}`,
    name, date, place, time: time || null, time_end: timeEnd || null, url: url || null,
    type: type || "Otras", added: new Date().toISOString(),
  };
}

// ------------------------------------------------------------------ GitHub

function ghHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "calledoss-panel",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readFile(env, path) {
  const r = await fetch(`${GH}/repos/${env.REPO}/contents/${path}?ref=${env.DATA_BRANCH}`, { headers: ghHeaders(env) });
  if (r.status === 404) return { data: null, sha: null };
  if (!r.ok) throw new Error(`GitHub ${r.status} leyendo ${path}`);
  const j = await r.json();
  let text;
  if (j.content) {
    text = new TextDecoder().decode(Uint8Array.from(atob(j.content.replace(/\n/g, "")), (c) => c.charCodeAt(0)));
  } else {
    // ficheros de más de 1 MB: descarga directa
    const raw = await fetch(j.download_url, { headers: ghHeaders(env) });
    text = await raw.text();
  }
  return { data: JSON.parse(text), sha: j.sha };
}

async function writeFile(env, path, data, sha, message) {
  const text = JSON.stringify(data, null, 1);
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  const r = await fetch(`${GH}/repos/${env.REPO}/contents/${path}`, {
    method: "PUT",
    headers: { ...ghHeaders(env), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: btoa(bin), branch: env.DATA_BRANCH, ...(sha ? { sha } : {}) }),
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} guardando ${path}: ${await r.text()}`);
}

async function dispatch(env, workflow, inputs) {
  const r = await fetch(`${GH}/repos/${env.REPO}/actions/workflows/${workflow}/dispatches`, {
    method: "POST",
    headers: { ...ghHeaders(env), "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main", ...(inputs ? { inputs } : {}) }),
  });
  if (!r.ok && r.status !== 204) throw new Error(`GitHub ${r.status} lanzando ${workflow}`);
}

// ------------------------------------------------------------------ utilidades

async function authorized(request, env) {
  const h = request.headers.get("Authorization") || "";
  const given = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!given || !env.PANEL_PASSWORD) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(env.PANEL_PASSWORD)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes("*") || allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] || "",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
