"""Construye calendar.json juntando todas las fuentes, sin duplicados."""
import datetime as dt
import re

from .common import load_json, norm, save_json, today, iso_now, slugify, short_hash
from .sources import rfea, rfealive, worldathletics, timers

STOP = set("de del la las los el y i en a al por the of and campeonato cto trofeo meeting memorial edicion "
           "carrera popular internacional ciudad 2025 2026 2027".split())
ROMAN = re.compile(r"^(?=[mdclxvi])m*(c[md]|d?c{0,3})(x[cl]|l?x{0,3})(i[xv]|v?i{0,3})$")


def _tokens(name):
    toks = [t for t in norm(name).split() if t not in STOP and not ROMAN.match(t) and not re.fullmatch(r"\d+(o|a|er)?", t)]
    return set(toks)


def similar(a, b):
    ta, tb = _tokens(a), _tokens(b)
    if not ta or not tb:
        return False
    inter = len(ta & tb)
    return inter / min(len(ta), len(tb)) >= 0.7 and inter >= 1


def _overlaps(a, b):
    a1, a2 = a["date"], a.get("end_date") or a["date"]
    b1, b2 = b["date"], b.get("end_date") or b["date"]
    return a1 <= b2 and b1 <= a2


PRIORITY = ["Manual", "RFEA", "World Athletics", "Cronomancha", "AvaiBook (Runvasport)"]


def merge(lists):
    """Une listas de competiciones de varias fuentes. Si dos entradas son la misma cita
    (fechas que se solapan + nombre parecido) se fusionan sus enlaces y fuentes."""
    items = []
    for lst in lists:
        for it in lst or []:
            if not it.get("date"):
                continue
            match = None
            for cur in items:
                if _overlaps(cur, it) and similar(cur["name"], it["name"]):
                    match = cur
                    break
            if not match:
                it = dict(it)
                it["sources"] = [it["source"]]
                items.append(it)
                continue
            # fusiona
            if it["source"] not in match["sources"]:
                match["sources"].append(it["source"])
            for k, v in (it.get("links") or {}).items():
                match.setdefault("links", {}).setdefault(k, v)
            for lv in it.get("live") or []:
                if lv not in match.setdefault("live", []):
                    match["live"].append(lv)
            for k in ("time", "time_end", "place"):
                if not match.get(k) and it.get(k):
                    match[k] = it[k]
            if PRIORITY.index(it["source"]) < PRIORITY.index(match["source"]) if it["source"] in PRIORITY and match["source"] in PRIORITY else False:
                for k in ("name", "source", "cat", "type"):
                    match[k] = it[k]
    items.sort(key=lambda x: (x["date"], x["name"]))
    return items


def manual_items():
    data = load_json("manual.json", {"items": []}) or {"items": []}
    out = []
    for m in data.get("items", []):
        if not m.get("name") or not m.get("date"):
            continue
        links = {}
        if m.get("url"):
            u = m["url"]
            links["directo" if "rfealive" in u else "resultados"] = u
        live = []
        if m.get("url") and "rfealive.info" in m["url"] and "chid=" in m["url"]:
            live.append({"kind": "rfealive", "chid": m["url"].split("chid=")[1].split("&")[0]})
        elif m.get("url") and m["url"].lower().endswith(".pdf"):
            live.append({"kind": "pdf", "url": m["url"]})
        elif m.get("url"):
            live.append({"kind": "page", "url": m["url"]})
        out.append({
            "id": m.get("id") or "manual-%s-%s" % (m["date"], slugify(m["name"], 40)),
            "name": m["name"], "date": m["date"], "end_date": m.get("end_date") or None,
            "place": m.get("place") or "", "type": m.get("type") or "Otras", "cat": "Añadida a mano",
            "intl": bool(re.search(r"\([A-Z]{3}\)", m.get("place") or "")), "source": "Manual",
            "time": m.get("time") or None, "time_end": m.get("time_end") or None,
            "links": links, "live": live, "manual": True,
        })
    return out


def enrich_rfea(http, items, health, window_back=12, window_fwd=45):
    """Lee la ficha RFEA de las citas cercanas (enlaces a directo, inscritos, resultados)."""
    cache = load_json("state/rfea_details.json", {}) or {}
    t = today()
    fetched = 0
    for it in items:
        if it["source"] != "RFEA" and "RFEA" not in it.get("sources", []):
            continue
        url = (it.get("links") or {}).get("info", "")
        if "atletismorfea.es/calendario/campeonato/" not in url:
            continue
        d = dt.date.fromisoformat(it["date"])
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        if not (t - dt.timedelta(days=window_back) <= end and d <= t + dt.timedelta(days=window_fwd)):
            if url in cache:
                _apply_detail(it, cache[url]["d"])
            continue
        c = cache.get(url)
        near = t - dt.timedelta(days=3) <= end and d <= t + dt.timedelta(days=7)
        stale = not c or (near and c.get("at") != t.isoformat()) or (not near and c.get("at", "") < (t - dt.timedelta(days=5)).isoformat())
        if stale and fetched < 70:  # tope diario; el resto se completa en días siguientes
            try:
                det = rfea.detail(http, url)
                cache[url] = {"at": t.isoformat(), "d": det}
                fetched += 1
            except Exception as e:
                health.note("rfea_detail", "warning", "No pude leer la ficha %s: %s" % (url, e))
        if url in cache:
            _apply_detail(it, cache[url]["d"])
    save_json("state/rfea_details.json", cache, compact=True)
    return fetched


def _apply_detail(it, det):
    links = it.setdefault("links", {})
    for k, v in (det.get("links") or {}).items():
        links.setdefault(k, v)
    if det.get("rfealive_chid"):
        lv = {"kind": "rfealive", "chid": det["rfealive_chid"]}
        if lv not in it.setdefault("live", []):
            it["live"].append(lv)
    res = links.get("resultados", "")
    if res.lower().endswith(".pdf"):
        lv = {"kind": "pdf", "url": res}
        if lv not in it.setdefault("live", []):
            it["live"].append(lv)


def add_times(http, items, health, days_fwd=8):
    """Horario (primera y última prueba de cada día) a partir de RFEA Live."""
    cache = load_json("state/rfealive_sched.json", {}) or {}
    t = today()
    for it in items:
        chids = [x["chid"] for x in it.get("live") or [] if x.get("kind") == "rfealive"]
        if not chids:
            continue
        d = dt.date.fromisoformat(it["date"])
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        chid = chids[0]
        if t - dt.timedelta(days=1) <= end and d <= t + dt.timedelta(days=days_fwd):
            try:
                sc = rfealive.schedule(http, chid)
                cache[chid] = {"at": iso_now(), "days": _day_ranges(sc["events"])}
            except Exception as e:
                health.note("rfealive", "warning", "Horario de %s no disponible: %s" % (chid, e))
        c = cache.get(chid)
        if c and c.get("days"):
            it["times"] = c["days"]
            first = sorted(c["days"])[0]
            it["time"] = c["days"][first][0]
            it["time_end"] = c["days"][first][1]
    save_json("state/rfealive_sched.json", cache, compact=True)


def _day_ranges(events):
    days = {}
    for e in events:
        if not e.get("date") or not re.match(r"\d{1,2}:\d{2}", e.get("time") or ""):
            continue
        tm = e["time"].zfill(5)
        lo, hi = days.get(e["date"], (tm, tm))
        days[e["date"]] = (min(lo, tm), max(hi, tm))
    return {k: list(v) for k, v in days.items()}


def build(http, health):
    lists = []
    lists.append(manual_items())
    lists.append(health.run("rfea_calendar", "RFEA · calendario", rfea.calendar, http, expect_min=50) or
                 _previous("RFEA"))
    lists.append(health.run("wa_calendar", "World Athletics · calendario", worldathletics.calendar, http, expect_min=10) or
                 _previous("World Athletics"))
    lists.append(health.run("cronomancha_upcoming", "Cronomancha · próximas", timers.cronomancha_upcoming, http, expect_min=0) or [])
    lists.append(health.run("cronomancha_events", "Cronomancha · resultados", timers.cronomancha_events, http, expect_min=1) or
                 _previous("Cronomancha"))
    lists.append(health.run("avaibook", "AvaiBook (Runvasport)", timers.avaibook_events, http, expect_min=1) or
                 _previous("AvaiBook (Runvasport)"))
    items = merge(lists)
    health.run("rfea_detail", "RFEA · fichas de competición", enrich_rfea, http, items, health, expect_min=0)
    health.run("rfealive", "RFEA Live · horarios", add_times, http, items, health, expect_min=0)
    for it in items:
        for k in [k for k in it if k.startswith("_")]:
            it.pop(k)
    return items


def _previous(source):
    """Si una fuente falla, se conservan sus datos del último día bueno."""
    old = load_json("calendar.json", {}) or {}
    return [x for x in old.get("items", []) if x.get("source") == source]


def save(items):
    save_json("calendar.json", {"generated": iso_now(), "count": len(items), "items": items}, compact=True)
