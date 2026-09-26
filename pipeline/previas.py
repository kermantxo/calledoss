"""PREVIAS: en cuanto se publica la lista de inscritos de una competición del calendario,
se eligen sus atletas destacados por prueba y sexo, con criterios objetivos (sin IA):

  60  plusmarquista (récord de España / del campeonato que aparece en la propia lista)
  50  campeón/a de España 2026         (de nuestros resultados)
  45  líder español del año            (RFEA Live 'LE' o ranking)
  40  internacional con España 2026    (de nuestros resultados)
  30  medalla en un Campeonato de España 2026
  25/18/12  1ª/2ª/3ª mejor marca del año entre los inscritos de esa prueba
  15/10/6   1ª/2ª/3ª mejor marca personal entre los inscritos
  20  sale en el cajón / grupo de élite
   8/5 ganador / podio en otra competición de 2026
 +10  español (en listas internacionales)

Se revisan cada día las competiciones de los próximos 45 días. Si la lista cambia se apuntan
las altas y bajas. Si no hay lista: "inscritos no publicados aún" y se sigue revisando.
Salida: previas.json
"""
import datetime as dt
import re
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup

from . import athletes as A
from .common import load_json, norm, save_json, today, iso_now, clean
from .highlights import FIELD, _mark_value
from .names import clean_name, sex_from_first_name
from .parsers import pdf_columns, pdf_results
from .sources import rfealive

DAYS_AHEAD = 45
PER_SEX = 6
MIN_SCORE = 20
LIST_WORDS = re.compile(r"inscrit|participant|listado|start ?list|lista de salida|entry ?list|dorsales|admitid", re.I)
ELITE = re.compile(r"\b(é|e)lite\b|caj[oó]n a\b|cajon a\b|grupo 1\b", re.I)


# ------------------------------------------------------------------ fuentes de inscritos

def from_rfealive(http, chid, base=rfealive.BASE):
    sc = rfealive.schedule(http, chid, base=base)
    out = []
    for ev in sc["events"]:
        url = ev.get("startlist_url") or ev["results_url"].replace("ResultsEvent", "StartList")
        try:
            sl = rfealive.startlist(http, url)
        except Exception:
            continue
        if not sl["rows"]:
            continue
        le = [r["name"] for r in sl["records"] if r["code"] == "LE"]
        rec = [r["name"] for r in sl["records"] if r["code"] in ("RE", "RC")]
        for r in sl["rows"]:
            out.append({"event": ev["event"], "round": ev["round"], "time": ev.get("time"), "date": ev.get("date"),
                        "name": r["name"], "club": r.get("club", ""), "pb": r.get("pb", ""), "sb": r.get("sb", ""),
                        "le": any(A.key(x) <= A.key(r["name"]) or A.key(r["name"]) <= A.key(x) for x in le if x),
                        "record": any(A.key(x) <= A.key(r["name"]) for x in rec if x)})
    return out


def from_rfea_pdf(http, url):
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    return [{"event": r["event"], "name": r["name"], "club": r.get("club", ""), "sb": r.get("mark", ""),
             "nat": r.get("nat", "")} for r in pdf_results.parse_startlist(c)]


def from_timingsys(http, event_id):
    """Cronomancha/Timingsys: se leen SOLO los datos que la web muestra (nombre, sexo, categoría, club).
    La respuesta trae además datos personales (teléfono, email, DNI...) que NO se guardan ni se usan."""
    r = http.get("https://timingsys.com/event/%s/participants?draw=1&start=0&length=5000" % event_id,
                 headers={"X-Requested-With": "XMLHttpRequest", "Accept": "application/json"})
    out = []
    for p in (r.json() or {}).get("data", []):
        name = clean("%s %s" % (p.get("firstname") or "", p.get("lastname") or ""))
        sex = {"male": "M", "female": "F"}.get((p.get("sex") or "").lower(), "")
        out.append({"event": clean(p.get("modality") or "Carrera"), "name": name, "sex": sex,
                    "club": clean(p.get("club") or ""), "cat": clean(p.get("category") or ""), "popular": True, "text": name})
    return out


def from_pdf_entries(http, url):
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    rows = pdf_columns.parse_entries(c)
    return [{"event": r["section"] or "Carrera", "name": r["name"], "sex": r["sex"], "club": r["club"],
             "cat": r["cat"], "sb": r["mark"], "elite": bool(ELITE.search(r["text"])), "popular": not r["mark"],
             "text": r["text"]} for r in rows]


def list_links(http, page, depth=1):
    """PDFs de inscritos enlazados desde una página (y desde su sección 'Listado de inscritos')."""
    try:
        r = http.get(page, timeout=30)
    except Exception:
        return []
    if "html" not in (r.headers.get("content-type") or ""):
        return []
    soup = BeautifulSoup(r.text, "lxml")
    pdfs, pages = [], []
    for a in soup.find_all("a", href=True):
        h = urljoin(r.url, a["href"].strip())
        txt = clean(a.get_text(" ")) + " " + (a.get("title") or "")
        if not LIST_WORDS.search(txt + " " + h):
            continue
        if h.lower().split("?")[0].endswith(".pdf"):
            pdfs.append(h)
        elif depth > 0 and urlparse(h).netloc == urlparse(r.url).netloc and h != r.url:
            pages.append(h)
    for p in pages[:3]:
        pdfs += list_links(http, p, depth - 1)
    return list(dict.fromkeys(pdfs))[:6]


def find_entries(http, it):
    """Devuelve (filas, fuentes) de la lista de inscritos de una cita, o ([], []) si no hay."""
    links = it.get("links") or {}
    tried = []
    for lv in it.get("live") or []:
        if lv.get("kind") == "rfealive":
            try:
                rows = from_rfealive(http, lv["chid"])
                if rows:
                    return rows, ["https://rfealive.info/Results/Schedule?chid=" + lv["chid"]]
            except Exception:
                pass
        if lv.get("kind") == "timingsys":
            try:
                rows = from_timingsys(http, lv["event"])
                if rows:
                    return rows, ["https://timingsys.com/event/%s/participants" % lv["event"]]
            except Exception:
                pass
    ins = links.get("inscritos", "")
    if ins.lower().split("?")[0].endswith(".pdf"):
        try:
            rows = from_rfea_pdf(http, ins) or from_pdf_entries(http, ins)
            if rows:
                return rows, [ins]
        except Exception:
            pass
    pages = [p for p in (ins, links.get("web"), links.get("info"), links.get("resultados"), links.get("directo")) if p and not p.lower().endswith(".pdf")]
    for p in pages:
        if "rfealive" in p:
            continue
        for u in list_links(http, p):
            try:
                rows = from_pdf_entries(http, u)
                if len(rows) >= 3:
                    return rows, [u]
            except Exception:
                continue
    return [], []


# ------------------------------------------------------------------ criterios

def _sex_of(row, ath):
    if row.get("sex"):
        return row["sex"]
    ev = row.get("event", "")
    if re.search(r"\b(mujeres|femenin|women|fem)\b", ev, re.I):
        return "F"
    if re.search(r"\b(hombres|masculin|men|masc)\b", ev, re.I):
        return "M"
    if ath and ath.get("sex"):
        return ath["sex"]
    return sex_from_first_name(row.get("name", ""))


def _event_label(ev):
    return clean(re.sub(r"\s+(Hombres|Mujeres|Masculino|Femenino|Men|Women)\b", "", ev or "", flags=re.I)) or "Carrera"


def _facts_ok(a, ev_label, row, comp_type):
    """Méritos del atleta que tienen sentido en ESTA lista: misma familia de pruebas (resistencia /
    velocidad-saltos-lanzamientos) y categoría compatible (menores / absoluta / máster)."""
    fam = A.family(ev_label) if A.family(ev_label) != "otras" or re.search(r"\d\s?m\b|salto|altura|longitud|triple|p[eé]rtiga|peso|disco|jabalina|martillo|vallas|decatl|heptatl", ev_label, re.I) else ""
    if comp_type in ("Ruta", "Cross", "Trail", "Marcha"):
        fam = "resistencia"
    age = A.age_group(" ".join([ev_label, row.get("cat", ""), row.get("section", "")]))
    ok = []
    for f in a.get("facts", []):
        if fam and f.get("family") and f["family"] != fam:
            continue
        if age == "menores" and f.get("cat") != "menores":
            continue
        if age != "menores" and f.get("cat") == "menores":
            continue
        ok.append(f)
    return ok


_BY_TOKEN = {}


def _index(ath):
    """Índice por palabra para buscar rápido nombres completos dentro de una fila."""
    if _BY_TOKEN.get("id") is ath:
        return _BY_TOKEN["idx"]
    idx = {}
    for wk, a in ath.items():
        if len(wk) >= 3:
            for t in wk:
                idx.setdefault(t, []).append((wk, a))
    _BY_TOKEN.update({"id": ath, "idx": idx})
    return idx


def match_full(ath, text):
    """Listas populares (columnas a veces descolocadas): el atleta cuenta si su nombre de pila y sus
    dos apellidos (3 palabras o más) aparecen en la fila. Nunca con nombres cortos de dos palabras."""
    from .names import MALE, FEMALE
    toks = set(A.tokens(text))
    best = None
    for t in toks:
        for wk, a in _index(ath).get(t, []):
            if wk <= toks:
                at = A.tokens(a["name"])
                first = at[:1]
                given = 0  # nombre de pila (simple o compuesto: "Miguel Ángel")
                for x in at:
                    if x in MALE or x in FEMALE:
                        given += 1
                    else:
                        break
                surnames = len(at) - max(given, 1)
                if first and first[0] in toks and surnames >= 2 and (given or len(wk) >= 4):
                    if not best or a["score"] > best["score"]:
                        best = a
    return best


def select(rows, ath, comp_type=""):
    """Destacados por prueba y sexo."""
    groups = {}
    for r in rows:
        r = dict(r)
        r["name"], nat = clean_name(r.get("name", ""), r.get("nat", ""))
        r["nat"] = nat
        a = match_full(ath, r.get("text") or r["name"]) if r.get("popular") else A.lookup(ath, r["name"])
        if a and r.get("popular"):
            r["name"] = a["name"]  # nombre completo y bien ordenado (todas sus palabras están en la fila)
        sex = _sex_of(r, a)
        groups.setdefault((_event_label(r.get("event")), sex), []).append((r, a))
    events = {}
    for (ev, sex), lst in groups.items():
        field = bool(FIELD.search(norm(ev)))

        def rank_by(key):
            vals = [(_mark_value(r.get(key)), i) for i, (r, _) in enumerate(lst) if _mark_value(r.get(key)) is not None]
            vals.sort(key=lambda x: -x[0] if field else x[0])
            return {i: pos for pos, (_, i) in enumerate(vals[:3])}
        sb_rank, pb_rank = rank_by("sb"), rank_by("pb")
        intl_list = any(r.get("nat") and r.get("nat") != "ESP" for r, _ in lst)
        scored = []
        seen = set()
        for i, (r, a) in enumerate(lst):
            k = A.key(r["name"])
            if k in seen:
                continue
            seen.add(k)
            score, reasons = 0, []
            if r.get("record"):
                score += 60; reasons.append("Plusmarquista")
            if r.get("le"):
                score += 45; reasons.append("Líder español del año")
            if a:
                facts = sorted(_facts_ok(a, ev, r, comp_type), key=lambda f: -f["score"])
                if facts:
                    score += min(sum(f["score"] for f in facts), 120)
                    reasons += [f["text"] for f in facts[:3]]
            if i in sb_rank:
                score += (25, 18, 12)[sb_rank[i]]
                reasons.append("%sª mejor marca del año de la lista (%s)" % (sb_rank[i] + 1, r.get("sb")))
            if i in pb_rank:
                score += (15, 10, 6)[pb_rank[i]]
                reasons.append("%sª mejor marca personal de la lista (%s)" % (pb_rank[i] + 1, r.get("pb")))
            if r.get("elite") and score:
                score += 15; reasons.append("Sale con la élite")  # solo suma si ya tiene otros méritos
            if intl_list and (r.get("nat") == "ESP" or (a and a.get("nat") == "ESP")):
                score += 10; reasons.append("Español")
            if score >= MIN_SCORE:
                scored.append({"name": r["name"],
                               # en listas populares las columnas a veces vienen descolocadas: el club no es fiable
                               "club": "" if r.get("popular") else r.get("club", ""), "nat": r.get("nat", ""), "pb": r.get("pb", ""), "sb": r.get("sb", ""),
                               "score": score, "reasons": list(dict.fromkeys(reasons))[:4],
                               "time": r.get("time"), "date": r.get("date")})
        scored.sort(key=lambda x: -x["score"])
        e = events.setdefault(ev, {"name": ev, "n": 0, "M": [], "F": [], "otros": []})
        e["n"] += len(seen)
        e[sex if sex in ("M", "F") else "otros"] = scored[:PER_SEX]
    out = [e for e in events.values()]
    out.sort(key=lambda e: -(len(e["M"]) + len(e["F"])))
    return out


# ------------------------------------------------------------------ proceso diario

def run(http, health, items):
    t = today()
    ath = A.build()
    prev = load_json("previas.json", {}) or {}
    prev_by = {x["id"]: x for x in prev.get("items", [])}
    names_prev = load_json("state/previas_names.json", {}) or {}
    out, names_now = [], {}
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        if not (t <= d <= t + dt.timedelta(days=DAYS_AHEAD)):
            continue
        try:
            rows, srcs = find_entries(http, it)
        except Exception as e:
            health.note("previas", "warning", "Inscritos de '%s': %s" % (it["name"], e))
            rows, srcs = [], []
        entry = {"id": it["id"], "name": it["name"], "date": it["date"], "end_date": it.get("end_date"),
                 "place": it.get("place", ""), "type": it.get("type"), "links": it.get("links", {}),
                 "checked": iso_now(), "race_day": it["date"] <= t.isoformat() <= (it.get("end_date") or it["date"])}
        if not rows:
            old = prev_by.get(it["id"])
            if old and old.get("status") == "publicados":
                entry.update({k: old[k] for k in ("status", "events", "n_inscritos", "sources", "changes", "updated") if k in old})
                entry["stale"] = True  # la fuente no respondió hoy: se mantiene lo último que se vio
            else:
                entry["status"] = "no_publicados"
            out.append(entry)
            continue
        events = select(rows, ath, it.get("type", ""))
        now_names = sorted({clean_name(r["name"])[0] for r in rows})
        before = set(names_prev.get(it["id"], []))
        dest_now = {x["name"] for e in events for s in ("M", "F", "otros") for x in e[s]}
        changes = {}
        if before:
            added = sorted(set(now_names) - before)
            removed = sorted(before - set(now_names))
            changes = {"altas": len(added), "bajas": len(removed),
                       "altas_destacadas": [n for n in added if n in dest_now][:10],
                       "bajas_destacadas": [n for n in removed if A.lookup(ath, n)][:10]}
        old = prev_by.get(it["id"]) or {}
        entry.update({"status": "publicados", "sources": srcs, "n_inscritos": len(now_names), "events": events,
                      "changes": changes or old.get("changes", {}),
                      "updated": iso_now() if set(now_names) != before else old.get("updated", iso_now())})
        names_now[it["id"]] = now_names
        out.append(entry)
    out.sort(key=lambda x: (x["date"], x["name"]))
    save_json("previas.json", {"generated": iso_now(), "days_ahead": DAYS_AHEAD, "items": out}, compact=True)
    names_prev.update(names_now)
    ids = {x["id"] for x in out}
    save_json("state/previas_names.json", {k: v for k, v in names_prev.items() if k in ids}, compact=True)
    return sum(1 for x in out if x.get("status") == "publicados")
