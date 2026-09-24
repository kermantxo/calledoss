"""Atletas españoles destacados, calculados a partir de las listas de salida (sin IA).

Reglas (en este orden):
1. 'LE' — el líder español del año en esa prueba (lo publica RFEA Live en cada lista de salida).
2. 'Récord' — poseedor del récord de España o del campeonato que está inscrito.
3. 'Seguimiento' — aparece en la lista de seguimiento (data/destacados_base.json): líderes del
   ranking RFEA y atletas de la selección. La lista crece sola: cada español que aparece en los
   resultados de una competición internacional de World Athletics se añade automáticamente.
4. 'Mejor marca' — mejor marca de la temporada (MMT) entre los inscritos de esa prueba.
5. En competiciones internacionales, todo atleta con nacionalidad ESP.
"""
import datetime as dt
import re

from .common import load_json, norm, save_json, today, iso_now
from .parsers import pdf_results
from .sources import rfealive


def _key(name):
    return frozenset(t for t in norm(name).split() if len(t) > 1)


def watchlist():
    base = load_json("destacados_base.json", {"athletes": []}) or {"athletes": []}
    return base


def _match(name, wl_keys, international=False):
    """Coincidencia estricta de nombres para no marcar a quien solo comparte nombre y un apellido.

    * mismo conjunto de palabras, o
    * al menos 3 palabras en común, o
    * en citas internacionales (nombre + un apellido, estilo World Athletics), que las 2
      palabras del nombre corto estén en el nombre completo de la lista de seguimiento.
    """
    k = _key(name)
    if len(k) < 2:
        return None
    for wk, info in wl_keys:
        inter = wk & k
        if k == wk or len(inter) >= 3 or (international and len(k) == 2 and k <= wk):
            return info
    return None


def _wl_keys():
    return [(_key(a["name"]), a) for a in watchlist().get("athletes", [])]


def _mark_value(m):
    """Convierte una marca en número comparable (tiempos: menor es mejor; concursos: mayor)."""
    m = (m or "").split("(")[0].strip()
    if not m or not re.match(r"^\d", m):
        return None
    if ":" in m:
        parts = [float(x) for x in m.split(":")]
        v = 0.0
        for p in parts:
            v = v * 60 + p
        return v
    try:
        return float(m)
    except ValueError:
        return None


FIELD = re.compile(r"altura|pertiga|longitud|triple|peso|disco|martillo|jabalina|decatlon|heptatlon|pentatlon", re.I)


def from_rfealive(http, chid, max_events=80):
    sc = rfealive.schedule(http, chid)
    wl = _wl_keys()
    out = []
    seen = set()
    for ev in sc["events"][:max_events]:
        url = ev.get("startlist_url") or ev["results_url"].replace("ResultsEvent", "StartList")
        try:
            sl = rfealive.startlist(http, url)
        except Exception:
            continue
        rows = sl["rows"]
        if not rows:
            continue
        le = {norm(r["name"]) for r in sl["records"] if r["code"] == "LE"}
        rec = {norm(r["name"]): r["code"] for r in sl["records"] if r["code"] in ("RE", "RC")}
        field = bool(FIELD.search(norm(ev["event"])))
        best = None
        for r in rows:
            v = _mark_value(r.get("sb"))
            if v is not None and (best is None or (v > best[0] if field else v < best[0])):
                best = (v, r)
        for r in rows:
            n = norm(r["name"])
            why = None
            if any(_key(x) <= _key(r["name"]) or _key(r["name"]) <= _key(x) for x in le if x):
                why = "Líder español del año"
            elif any(_key(x) <= _key(r["name"]) for x in rec):
                why = "Plusmarquista"
            else:
                info = _match(r["name"], wl)
                if info:
                    why = info.get("why") or "Atleta de seguimiento"
                elif best and best[1] is r:
                    why = "Mejor marca del año entre los inscritos"
            if why and (n, ev["event"]) not in seen:
                seen.add((n, ev["event"]))
                out.append({"name": r["name"], "club": r.get("club", ""), "event": ev["event"],
                            "round": ev["round"], "time": ev["time"], "date": ev["date"], "sb": r.get("sb", ""),
                            "pb": r.get("pb", ""), "why": why})
    return out


def from_pdf(http, url):
    content = http.get(url, timeout=120).content
    rows = pdf_results.parse_startlist(content)
    wl = _wl_keys()
    out, seen = [], set()
    for r in rows:
        info = _match(r["name"], wl)
        if info and (norm(r["name"]), r["event"]) not in seen:
            seen.add((norm(r["name"]), r["event"]))
            out.append({"name": r["name"], "club": r.get("club", ""), "event": r["event"], "why": info.get("why") or "Atleta de seguimiento",
                        "sb": r.get("mark", "")})
    return out


def compute(http, items, health, days_fwd=7):
    """Calcula destacados para las citas de los próximos días (se guarda en cada ítem)."""
    t = today()
    cache = load_json("state/destacados.json", {}) or {}
    n = 0
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        in_window = end >= t and d <= t + dt.timedelta(days=days_fwd)
        key = it["id"]
        if in_window:
            try:
                chids = [x["chid"] for x in it.get("live") or [] if x.get("kind") == "rfealive"]
                ins = (it.get("links") or {}).get("inscritos", "")
                res = None
                if chids:
                    res = from_rfealive(http, chids[0])
                elif ins.lower().endswith(".pdf"):
                    res = from_pdf(http, ins)
                if res is not None:
                    cache[key] = {"at": iso_now(), "list": res}
                    n += 1
            except Exception as e:
                health.note("destacados", "warning", "Destacados de '%s': %s" % (it["name"], e))
        if key in cache and cache[key]["list"]:
            it["destacados"] = cache[key]["list"][:40]
    # limpia entradas antiguas
    ids = {x["id"] for x in items}
    cache = {k: v for k, v in cache.items() if k in ids}
    save_json("state/destacados.json", cache, compact=True)
    return n


def learn_from_results(result):
    """Añade a la lista de seguimiento a los españoles de competiciones internacionales."""
    base = watchlist()
    known = {_key(a["name"]) for a in base.get("athletes", [])}
    added = 0
    for ev in result.get("events", []):
        for rnd in ev.get("rounds", [ev]):
            for r in rnd.get("rows", []):
                if r.get("nat") == "ESP" and _key(r["name"]) not in known and len(_key(r["name"])) >= 2:
                    base.setdefault("athletes", []).append({"name": r["name"], "why": "Internacional con España",
                                                            "added": today().isoformat()})
                    known.add(_key(r["name"]))
                    added += 1
    if added:
        save_json("destacados_base.json", base)
    return added
