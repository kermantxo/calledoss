"""Construye calendar.json juntando todas las fuentes, sin duplicados."""
import datetime as dt
import json
import re

from bs4 import BeautifulSoup

from .common import clean, load_json, norm, save_json, today, iso_now, slugify, short_hash
from .sources import adoc, rfea, rfealive, worldathletics, timers

STOP = set("de del la las los el y i en a al por the of and campeonato cto trofeo meeting memorial edicion "
           "carrera popular internacional ciudad 2025 2026 2027".split())
ROMAN = re.compile(r"^(?=[mdclxvi])m*(c[md]|d?c{0,3})(x[cl]|l?x{0,3})(i[xv]|v?i{0,3})$")


def _tokens(name):
    toks = [t for t in norm(name).split() if t not in STOP and not ROMAN.match(t) and not re.fullmatch(r"\d+(o|a|er)?", t)]
    return set(toks)


_SEX_F = re.compile(r"\b(mujeres|femenin[oa]s?|iberdrola|women)\b", re.I)
_SEX_M = re.compile(r"\b(hombres|masculin[oa]s?|joma|men)\b", re.I)


def _sex_conflict(a, b):
    """'Liga Iberdrola' (mujeres) no es la misma competición que 'Liga Joma' (hombres)."""
    fa, ma, fb, mb = (bool(x.search(y or "")) for x, y in ((_SEX_F, a), (_SEX_M, a), (_SEX_F, b), (_SEX_M, b)))
    return (fa and not ma and mb and not fb) or (ma and not fa and fb and not mb)


def similar(a, b):
    if _sex_conflict(a, b):
        return False
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
            # enlace del panel: RFEA Live = directo; PDF = resultados; cualquier otra página = web oficial
            links["directo" if "rfealive" in u else "resultados" if u.lower().split("?")[0].endswith(".pdf") else "web"] = u
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
    live_from_links(it)
    res = links.get("resultados", "")
    if res.lower().endswith(".pdf"):
        lv = {"kind": "pdf", "url": res}
        if lv not in it.setdefault("live", []):
            it["live"].append(lv)


def add_times(http, items, health, days_fwd=8):
    """Horario (primera y última prueba de cada día) a partir de RFEA Live.

    Si la ficha RFEA no enlaza su RFEA Live, se busca en los índices de rfealive.info y rfealive.me
    por nombre parecido, y solo se usa si las fechas del horario coinciden con las de la competición."""
    cache = load_json("state/rfealive_sched.json", {}) or {}
    t = today()
    indexes = None
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        soon = t - dt.timedelta(days=1) <= end and d <= t + dt.timedelta(days=days_fwd)
        chids = [(x["chid"], x.get("base") or rfealive.BASE) for x in it.get("live") or [] if x.get("kind") == "rfealive"]
        guessed = False
        if not chids and soon and it.get("source") in ("RFEA", "Manual") and not it.get("intl"):
            if indexes is None:
                indexes = []
                for base in (rfealive.BASE, "https://rfealive.me"):
                    try:
                        indexes += rfealive.index(http, base)
                    except Exception as e:
                        health.note("rfealive", "warning", "Índice de %s no disponible: %s" % (base, e))
            yr = it["date"][:4]
            chids = [(c["chid"], c["base"]) for c in indexes if yr in c["chid"][:6] and similar(c["name"], it["name"])][:3]
            guessed = True
        for chid, base in chids:
            if soon:
                try:
                    sc = rfealive.schedule(http, chid, base=base)
                    days = _day_ranges(sc["events"])
                    # un horario encontrado por nombre solo vale si es de estas fechas (no de la edición anterior)
                    if guessed and not any(it["date"] <= x <= (it.get("end_date") or it["date"]) for x in days):
                        continue
                    cache[chid] = {"at": iso_now(), "days": days, "schedule": _schedule(sc["events"])}
                except Exception as e:
                    health.note("rfealive", "warning", "Horario de %s no disponible: %s" % (chid, e))
                    continue
            c = cache.get(chid)
            if c and c.get("days"):
                it["times"] = c["days"]
                if c.get("schedule"):
                    it["schedule"] = c["schedule"]   # horario prueba a prueba (Próximas y En directo)
                first = sorted(c["days"])[0]
                it["time"] = c["days"][first][0]
                it["time_end"] = c["days"][first][1]
                if guessed:
                    it.setdefault("live", []).append({"kind": "rfealive", "chid": chid, "base": base})
                    it.setdefault("links", {}).setdefault("directo", base + "/Results/Schedule?chid=" + chid)
                break
    save_json("state/rfealive_sched.json", cache, compact=True)
    # competiciones de World Athletics en curso o de esta semana: programa prueba a prueba
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        wa_ids = [x["id"] for x in it.get("live") or [] if x.get("kind") == "wa"]
        if not wa_ids or it.get("schedule") or not (t - dt.timedelta(days=1) <= end and d <= t + dt.timedelta(days=days_fwd)):
            continue
        try:
            prog = worldathletics.program(http, wa_ids[0])
            if prog:
                it["schedule"] = prog
        except Exception as e:
            health.note("wa_calendar", "warning", "Programa de %s no disponible: %s" % (it["name"], str(e)[:60]))
    # sin horario de RFEA Live: la hora de inicio que publica su plataforma de inscripción
    # (Kirolprobak, AvaiBook...), enlazada en la ficha o en la web oficial de la competición
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        if it.get("time") or not (t <= d <= t + dt.timedelta(days=21)) or it.get("intl"):
            continue
        links = it.get("links") or {}
        insc = next((timers.inscripcion_url(v) for v in links.values() if timers.inscripcion_url(v)), None)
        web_html = ""
        if not insc and links.get("web") and not links["web"].lower().endswith(".pdf"):
            try:
                web_html = http.get(links["web"], timeout=30).text
                insc = timers.inscripcion_url(web_html)
            except Exception:
                insc = None
        if not insc:
            # la web oficial dice la hora de salida ("La salida se dará el domingo 4 de octubre a las 9:30 horas")
            txt = clean(BeautifulSoup(web_html, "lxml").get_text(" ")) if web_html else ""
            m = re.search(r"\bsalida\b[^.]{0,90}?\ba las (\d{1,2})[:.](\d{2})", txt, re.I)
            if m:
                it["time"] = "%02d:%s" % (int(m.group(1)), m.group(2))
            continue
        try:
            hhmm = timers.inscripcion_start(http, insc)
        except Exception as e:
            health.note("rfealive", "warning", "Hora de inicio de %s no disponible: %s" % (it["name"], str(e)[:60]))
            continue
        if hhmm:
            it["time"] = hhmm
            links.setdefault("inscritos", insc + "participantes/")
            it["links"] = links


def refresh_times(http, health):
    """Solo horarios (varias veces al día): los de RFEA Live se publican pocos días antes."""
    items = (load_json("calendar.json", {}) or {}).get("items", [])
    if not items:
        return 0
    # lo añadido en el panel (enlace a la web oficial, hora...) se junta ya, sin esperar al chequeo diario
    items = merge([[x for x in items if x.get("sources") != ["Manual"]], manual_items()])  # mismo orden que el diario
    add_adoc_calendar(http, items, health)
    add_extra_links(items)
    add_times(http, items, health)
    save(items)
    return sum(1 for x in items if x.get("time"))


def _schedule(events, limit=250):
    """Horario completo: [{d: fecha, t: hora, e: prueba, r: ronda}] ordenado por fecha y hora."""
    out = []
    for e in events:
        if not e.get("date") or not re.match(r"\d{1,2}:\d{2}", e.get("time") or ""):
            continue
        out.append({"d": e["date"], "t": e["time"].zfill(5), "e": e.get("event", ""), "r": e.get("round", "")})
    out.sort(key=lambda x: (x["d"], x["t"], x["e"]))
    return out[:limit]


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
    lists.append(health.run("avaibook_upcoming", "Runvasport · próximas", timers.avaibook_upcoming, http, expect_min=0) or [])
    items = merge(lists)
    health.run("rfea_detail", "RFEA · fichas de competición", enrich_rfea, http, items, health, expect_min=0)
    health.run("rfealive", "RFEA Live · horarios", add_times, http, items, health, expect_min=0)
    health.run("adoc", "ADOC · pruebas asociadas", tag_adoc, http, items, expect_min=5)
    health.run("adoc_calendar", "ADOC · calendario del circuito", add_adoc_calendar, http, items, health, expect_min=1)
    add_extra_links(items)
    for it in items:
        for k in [k for k in it if k.startswith("_")]:
            it.pop(k)
    return items


def tag_adoc(http, items):
    """Marca las competiciones que son del circuito ADOC (cross y ruta). Si la web de ADOC no
    responde, se usa la última lista buena (state/adoc.json)."""
    try:
        members = adoc.members(http)
        if members:
            save_json("state/adoc.json", {"at": iso_now(), "members": members}, compact=True)
    except Exception:
        members = []
    members = members or (load_json("state/adoc.json", {}) or {}).get("members", [])
    n = 0
    for it in items:
        m = adoc.match(it, members)
        if m:
            it["adoc"] = True
            it.setdefault("links", {}).setdefault("adoc", m["url"])
            n += 1
        else:
            it.pop("adoc", None)
    return n


def live_from_links(it):
    """Directo de SmartTrack RFEA (smarttrackrfea.es/sch/<código>) a partir del enlace «directo»."""
    m = re.search(r"smarttrackrfea\.es/sch/(\w+)", (it.get("links") or {}).get("directo", ""))
    if m:
        lv = {"kind": "smarttrack", "chid": m.group(1)}
        if lv not in it.setdefault("live", []):
            it["live"].append(lv)


def add_extra_links(items):
    """Enlaces añadidos a mano en pipeline/extra_links.json (clasificaciones en Drive, etc.)."""
    import os
    src = os.path.join(os.path.dirname(__file__), "extra_links.json")
    with open(src, encoding="utf-8") as f:
        extra = {k: v for k, v in json.load(f).items() if not k.startswith("_")}
    n = 0
    for it in items:
        for k, v in (extra.get(it["id"]) or {}).items():
            if k.startswith("_"):
                continue
            if k in ("schedule", "time", "time_end"):  # horario oficial copiado a mano
                it[k] = v
            else:
                it.setdefault("links", {})[k] = v
            n += 1
        live_from_links(it)
    return n


def add_adoc_calendar(http, items, health):
    """Pruebas del calendario ADOC (pipeline/adoc_calendar.json, copiado de su imagen). Si la
    competición ya está en el calendario (misma fecha y la misma prueba), se marca como ADOC; si
    no, se añade. Además se comprueba si ADOC ha cambiado la imagen del calendario."""
    import hashlib
    import os
    src = os.path.join(os.path.dirname(__file__), "adoc_calendar.json")
    with open(src, encoding="utf-8") as f:
        cal = json.load(f)
    try:
        img = http.get(cal["imagen"], timeout=40).content
        if hashlib.sha256(img).hexdigest() != cal.get("imagen_sha256"):
            health.note("adoc_calendar", "warning",
                        "ADOC ha cambiado la imagen de su calendario (%s): hay que revisar pipeline/adoc_calendar.json." % cal["fuente"])
    except Exception as e:
        health.note("adoc_calendar", "warning", "No se pudo comprobar el calendario de ADOC: %s" % str(e)[:80])
    n = 0
    for a in cal["items"]:
        a_end = a.get("end_date") or a["date"]
        member = [{"name": a["name"], "city": a["place"]}]
        twin = next((it for it in items if it["date"] <= a_end and a["date"] <= (it.get("end_date") or it["date"])
                     and (adoc.match(it, member) or similar(it["name"], a["name"]))), None)
        if twin:
            twin["adoc"] = True
            twin["adoc_cat"] = a["cat"]
            if "ADOC" not in twin.setdefault("sources", []):
                twin["sources"].append("ADOC")
            twin.setdefault("links", {}).setdefault("adoc", cal["fuente"])
        else:
            items.append({
                "id": "adoc-%s-%s" % (a["date"], slugify(a["name"], 40)), "name": a["name"], "date": a["date"],
                "end_date": a.get("end_date"), "place": a["place"], "type": a["type"], "cat": "ADOC",
                "adoc_cat": a["cat"], "intl": False, "source": "ADOC", "sources": ["ADOC"], "adoc": True,
                "links": {"info": cal["fuente"]},
            })
        n += 1
    items.sort(key=lambda x: (x["date"], x["name"]))
    return n


def _previous(source):
    """Si una fuente falla, se conservan sus datos del último día bueno."""
    old = load_json("calendar.json", {}) or {}
    return [x for x in old.get("items", []) if x.get("source") == source]


def save(items):
    save_json("calendar.json", {"generated": iso_now(), "count": len(items), "items": items}, compact=True)
