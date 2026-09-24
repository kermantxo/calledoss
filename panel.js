/* ============================================================
   PANEL PRIVADO
   Habla con el Worker de Cloudflare, que comprueba la clave y
   guarda los cambios en la rama "datos" del repositorio.
   ============================================================ */

// Dirección del Worker (se rellena al publicarlo con `npx wrangler deploy`)
const PANEL_API = 'https://calledoss-panel.REEMPLAZAR.workers.dev';

const $ = id => document.getElementById(id);
let KEY = null;

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function hoyISO(){
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Madrid'}).format(new Date());
}
function cuando(iso){
  if(!iso) return '—';
  try { return new Date(iso).toLocaleString('es-ES', {timeZone:'Europe/Madrid', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}); }
  catch(e){ return iso; }
}

async function api(path, opts = {}){
  const r = await fetch(PANEL_API + path, {
    ...opts,
    headers: {'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', ...(opts.headers || {})},
  });
  const data = await r.json().catch(() => ({ok:false, error:'Respuesta no válida del servidor'}));
  if(r.status === 401){ logout(); throw new Error('Clave incorrecta'); }
  if(!data.ok) throw new Error(data.error || 'Error');
  return data;
}

// ---------------------------------------------------------- acceso
function saveKey(k){ try { sessionStorage.setItem('calledossKey', k); } catch(e){} }
function readKey(){ try { return sessionStorage.getItem('calledossKey'); } catch(e){ return null; } }
function logout(){
  KEY = null;
  try { sessionStorage.removeItem('calledossKey'); } catch(e){}
  $('appView').style.display = 'none';
  $('logoutBtn').style.display = 'none';
  $('loginView').style.display = '';
}

$('loginForm').addEventListener('submit', async e=>{
  e.preventDefault();
  KEY = $('pwd').value;
  $('loginMsg').textContent = 'Comprobando…';
  try {
    await api('/api/login', {method:'POST'});
    saveKey(KEY);
    $('pwd').value = '';
    $('loginMsg').textContent = '';
    showApp();
  } catch(err){
    $('loginMsg').textContent = err.message;
  }
});
$('logoutBtn').addEventListener('click', logout);

async function showApp(){
  $('loginView').style.display = 'none';
  $('appView').style.display = '';
  $('logoutBtn').style.display = '';
  $('fDate').min = hoyISO();
  await loadState();
}

// ---------------------------------------------------------- datos
async function loadState(){
  try {
    const st = await api('/api/state');
    renderManual(st.manual.items || []);
    renderPlan(st.plan || {});
    renderSources(st.status || {});
    MISSING = (st.missing && st.missing.items) || [];
    renderMissing();
  } catch(err){
    $('alerts').innerHTML = `<div class="panel-alert bad">No se pudo cargar el estado: ${esc(err.message)}</div>`;
  }
}

let pendingDelete = null;
function renderManual(items){
  const upcoming = items.filter(x => x.date >= hoyISO());
  if(!items.length){ $('manualList').innerHTML = '<p class="panel-help">Todavía no has añadido ninguna.</p>'; return; }
  $('manualList').innerHTML = items.map(x=>`
    <div class="panel-row ${x.date < hoyISO() ? 'past' : ''}">
      <div><b>${esc(x.name)}</b><br><small>${esc(x.date)}${x.time ? ' · '+esc(x.time) : ''}${x.time_end ? '–'+esc(x.time_end) : ''} · ${esc(x.place)}${x.url ? ` · <a href="${esc(x.url)}" target="_blank" rel="noopener">enlace</a>` : ''}</small></div>
      <button class="comp-pill" data-del="${esc(x.id)}">${pendingDelete === x.id ? '¿Seguro? Pulsa otra vez' : 'Quitar'}</button>
    </div>`).join('') + (upcoming.length !== items.length ? '<p class="panel-help">Las ya pasadas se muestran atenuadas.</p>' : '');
  $('manualList').querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async ()=>{
    const id = b.dataset.del;
    if(pendingDelete !== id){ pendingDelete = id; renderManual(items); return; }
    pendingDelete = null;
    b.textContent = 'Quitando…';
    try { await api('/api/manual?id=' + encodeURIComponent(id), {method:'DELETE'}); }
    catch(err){ alertBox('bad', err.message); }
    await loadState();
  }));
}

function renderPlan(plan){
  const w = (plan.date === hoyISO() ? plan.windows : []) || [];
  if(!w.length){ $('planList').innerHTML = '<p class="panel-help">Hoy no hay competiciones en el calendario.</p>'; return; }
  $('planList').innerHTML = w.map(x=>`
    <div class="panel-row">
      <div><b>${esc(x.name)}</b><br><small>${esc(x.place || '')} · ventana ${cuando(x.start).split(', ').pop()}–${cuando(x.end).split(', ').pop()}${x.schedule_known ? '' : ' (horario sin publicar, ventana por defecto)'}</small></div>
      <span class="tag ${x.poll ? 'intl' : 'nac'}">${x.poll ? 'Se consulta en directo' : 'Sin fuente en directo'}</span>
    </div>`).join('');
}

function renderSources(status){
  const src = status.sources || {};
  const keys = Object.keys(src);
  const bad = keys.filter(k => src[k].ok === false);
  $('alerts').innerHTML = bad.length
    ? bad.map(k => `<div class="panel-alert bad">⚠️ <b>${esc(src[k].label || k)}</b>: ${esc(src[k].last_error || 'error')} <small>(${cuando(src[k].last_error_at)}${src[k].fails_in_a_row > 1 ? ', ' + src[k].fails_in_a_row + ' veces seguidas' : ''})</small></div>`).join('')
    : `<div class="panel-alert good">✅ Todas las fuentes funcionan. Última actualización: ${cuando(status.updated)}.</div>`;
  $('sourcesList').innerHTML = keys.map(k=>`
    <div class="panel-row">
      <div><b>${esc(src[k].label || k)}</b><br><small>Última vez bien: ${cuando(src[k].last_ok)} · elementos: ${src[k].last_count ?? '—'}</small></div>
      <span class="tag ${src[k].ok ? 'intl' : 'nac'}">${src[k].ok ? 'OK' : 'FALLO'}</span>
    </div>`).join('') || '<p class="panel-help">Aún no se ha ejecutado ninguna actualización.</p>';
  const log = (status.log || []).slice(0, 15);
  $('logList').innerHTML = log.length
    ? log.map(l => `<div class="panel-log ${l.level}"><span class="mono">${cuando(l.at)}</span> · <b>${esc(l.source)}</b> · ${esc(l.msg)}</div>`).join('')
    : '<p class="panel-help">Sin avisos.</p>';
}

let MISSING = [];
function renderMissing(){
  const q = ($('missingSearch').value || '').toLowerCase();
  const list = MISSING.filter(x => !q || (x.name + ' ' + (x.place||'')).toLowerCase().includes(q));
  if(!MISSING.length){ $('missingList').innerHTML = '<p class="panel-help">✅ Ninguna: todas las competiciones pasadas tienen resultados.</p>'; return; }
  $('missingList').innerHTML = `<p class="panel-help"><b>${MISSING.length}</b> competiciones${q ? ` · ${list.length} coinciden con la búsqueda` : ''}.</p>` +
    list.map(x=>`
      <details class="panel-row" style="display:block;">
        <summary style="cursor:pointer;"><b>${esc(x.name)}</b> <small>· ${esc(x.date)}${x.place ? ' · ' + esc(x.place) : ''} · ${esc(x.type || '')} · ${esc(x.source || '')}</small></summary>
        <div style="margin-top:8px;">
          ${Object.entries(x.links || {}).map(([k,v]) => `<a class="comp-pill" style="display:inline-block;margin:0 6px 6px 0;text-decoration:none;" href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join('')}
          ${(x.tried || []).length ? `<ul style="margin:6px 0 0 18px;color:var(--gray);font-size:14px;">${x.tried.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="panel-help">No había ningún enlace de resultados que probar.</p>'}
        </div>
      </details>`).join('');
}
$('missingSearch').addEventListener('input', renderMissing);

function alertBox(kind, msg){
  $('addMsg').className = 'panel-msg ' + kind;
  $('addMsg').textContent = msg;
}

// ---------------------------------------------------------- añadir
$('addForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const body = {
    name: $('fName').value, date: $('fDate').value, place: $('fPlace').value,
    time: $('fTime').value, time_end: $('fTimeEnd').value, type: $('fType').value, url: $('fUrl').value,
  };
  if(body.date < hoyISO()){ alertBox('bad', 'La fecha ya ha pasado.'); return; }
  alertBox('', 'Guardando…');
  try {
    await api('/api/manual', {method:'POST', body: JSON.stringify(body)});
    alertBox('good', '✅ Añadida. Aparecerá en el calendario de la web en 1–3 minutos.');
    $('addForm').reset();
    await loadState();
  } catch(err){
    alertBox('bad', err.message);
  }
});

// ---------------------------------------------------------- inicio
KEY = readKey();
if(KEY) showApp();
