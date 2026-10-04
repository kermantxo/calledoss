"""Modo En Directo.

* plan(): una vez al día (y tras cada cambio en el panel) mira el calendario y calcula las
  ventanas de directo de hoy: desde ~1 h antes de la primera prueba hasta ~2 h después de la
  última. Se guarda en live_plan.json (lo lee también el Worker de Cloudflare para saber
  cuándo lanzar los refrescos).
* tick(): UNA comprobación rápida e independiente (nunca un bucle esperando). Si ahora no hay
  ninguna ventana activa, termina en un segundo. Si la hay, consulta las fuentes de las citas
  activas y escribe live.json. Al cerrar la ventana, pasa los resultados a la sección
  Resultados; lo que quede pendiente se reintenta en el chequeo diario siguiente.
"""
import datetime as dt
import json
import os
import re
import time

from .common import MADRID, load_json, norm, now, save_json, today, iso_now
from .results import by_item, _index
from .sources import rfealive, smarttrack, timing, worldathletics, timers

BEFORE = dt.timedelta(hours=1)
AFTER = dt.timedelta(hours=2)
DEFAULT_START, DEFAULT_END = "08:00", "21:00"  # si no se conoce el horario


def _pollable(it):
    kinds = {x.get("kind") for x in it.get("live") or []}
    return bool(kinds & ({"rfealive", "smarttrack", "wa", "cronomancha", "pdf", "timingsys", "page"} | timing.KINDS))


def plan(items):
    t = today()
    tstr = t.isoformat()
    windows = []
    for it in items:
        if not (it["date"] <= tstr <= (it.get("end_date") or it["date"])):
            continue
        times = (it.get("times") or {}).get(tstr)
        first = times[0] if times else (it.get("time") if it["date"] == tstr else None)
        last = times[1] if times else (it.get("time_end") if it["date"] == tstr else None)
        known = bool(first)
        start_t = first or DEFAULT_START
        end_t = last or (None if not first else None)
        s = dt.datetime.combine(t, dt.time.fromisoformat(start_t.zfill(5)), MADRID) - BEFORE
        if end_t:
            e = dt.datetime.combine(t, dt.time.fromisoformat(end_t.zfill(5)), MADRID) + AFTER
        elif known:
            e = s + BEFORE + dt.timedelta(hours=4) + AFTER  # solo sabemos la hora de salida
        else:
            e = dt.datetime.combine(t, dt.time.fromisoformat(DEFAULT_END), MADRID) + AFTER
        if it.get("type") in ("Trail", "Trail Running"):
            e += dt.timedelta(hours=3)  # carreras largas: el cronometrador publica cuando llega el último
        windows.append({
            "id": it["id"], "name": it["name"], "place": it.get("place", ""), "source": it.get("source"),
            "start": s.isoformat(), "end": e.isoformat(), "first": first, "last": last,
            "schedule_known": known, "poll": _pollable(it), "intl": it.get("intl", False),
            "links": it.get("links", {}),
        })
    windows.sort(key=lambda w: (not w["poll"], w["start"]))
    data = {"date": tstr, "generated": iso_now(), "active_day": any(w["poll"] for w in windows), "windows": windows}
    save_json("live_plan.json", data)
    return data


def _in_window(w, at):
    return dt.datetime.fromisoformat(w["start"]) <= at <= dt.datetime.fromisoformat(w["end"])


def tick(http, health, force=False):
    """Una comprobación de directo. Devuelve cuántas citas se han consultado."""
    at = now()
    p = load_json("live_plan.json", {}) or {}
    if p.get("date") != at.date().isoformat():
        return 0  # el plan de hoy aún no existe (lo crea el chequeo diario)
    cal_items = (load_json("calendar.json", {}) or {}).get("items", [])
    try:  # fuentes de directo puestas a mano (extra_links.json): siempre las del código, aunque el calendario sea viejo
        from .calendar_build import add_extra_links
        add_extra_links(cal_items)
    except Exception as e:
        health.note("live", "warning", "Enlaces a mano: %s" % e)
    cal = {x["id"]: x for x in cal_items}
    live = load_json("live.json", {}) or {}
    if live.get("date") != p["date"]:
        live = {"date": p["date"], "items": {}}
    items = live.setdefault("items", {})
    polled = 0
    for w in p.get("windows", []):
        st = items.setdefault(w["id"], {"id": w["id"], "name": w["name"], "place": w["place"],
                                         "first": w["first"], "last": w["last"], "schedule_known": w["schedule_known"],
                                         "links": w.get("links", {}), "status": "pendiente", "data": None})
        active = _in_window(w, at)
        ended = at > dt.datetime.fromisoformat(w["end"])
        # ya ha empezado la prueba (hora de salida conocida) y aún no ha acabado: está «en directo»
        started = w.get("schedule_known") and at >= dt.datetime.fromisoformat(w["start"]) + BEFORE and not ended
        if ended:
            _sin_resultados(st.get("data"), at, terminada=True)  # terminada: lo que no tiene clasificación ya no está «en marcha»
        if not w["poll"]:
            st["status"] = "finalizado" if ended else ("en directo" if started else
                                                       "sin datos en directo" if active or at >= dt.datetime.fromisoformat(w["start"]) else "pendiente")
            continue
        if ended and st["status"] != "finalizado":
            # cierre: último intento de pasar a Resultados
            it = cal.get(w["id"])
            if it:
                rid = by_item(http, it, health, final=True)
                if not rid:
                    from .backfill import Finder
                    from .results import store
                    try:
                        pods, source, url, _ = Finder(http, health).resolve(it)
                        if pods:
                            rid = store(it, {"events": pods}, source, url)
                    except Exception as e:
                        health.note("live", "warning", "Cierre de '%s': %s" % (w["name"], e))
                st["results_id"] = rid
                if not rid:
                    pend = load_json("state/pending.json", {}) or {}
                    pend.setdefault(w["id"], {"since": p["date"], "tries": 0})
                    save_json("state/pending.json", pend)
            st["status"] = "finalizado"
            continue
        if not (active or force):
            continue
        it = cal.get(w["id"])
        if not it:
            continue
        polled += 1
        try:
            data = _poll(http, it, at)
        except Exception as e:
            health.note("live", "warning", "Directo de '%s': %s" % (w["name"], e))
            data = None
        st["checked"] = iso_now()
        if data and data.get("store"):
            try:
                from .results import store
                st["results_id"] = store(it, {"events": data["store"]["events"]}, data["store"]["source"], data["store"]["url"])
            except Exception as e:
                health.note("live", "warning", "Resultados de '%s': %s" % (w["name"], e))
        if data:
            data.pop("store", None)
        prev = (st.get("data") or {}).get("events")
        if prev and not (data or {}).get("events"):
            # la fuente no ha contestado esta vez (o bloquea a GitHub y se cargó en local): se mantiene lo que ya había
            data = _sin_resultados(_with_schedule(it, at, {"events": prev}), at)
        if data and (data.get("events") or data.get("schedule")):
            # aunque aún no haya pruebas terminadas, se enseña el horario de las próximas y el contador
            st["data"] = data
            st["status"] = "en directo" if (data.get("events") or started) else st["status"]
            st["updated"] = iso_now()
        elif started:
            st["status"] = "en directo"  # en marcha, aunque el cronometrador aún no haya publicado nada
        elif st["status"] != "en directo":
            st["status"] = "sin datos en directo"
    live["generated"] = iso_now()
    live["any_active"] = any(_in_window(w, at) for w in p.get("windows", []))
    save_json("live.json", live, compact=True)
    return polled


def _sin_resultados(data, at, terminada=False):
    """Una prueba sin clasificación no está «en marcha» para siempre: pasada una hora de su salida (o con
    la competición ya terminada) se dice la verdad, que no hay resultados publicados."""
    limite = (at - dt.timedelta(minutes=60)).strftime("%H:%M")
    for t in (data or {}).get("timeline") or []:
        if (terminada and t.get("state") in ("en marcha", "pendiente")) or \
                (t.get("state") == "en marcha" and (t.get("time") or "99:99").zfill(5) <= limite):
            t["state"] = "sin resultados"
    return data


def _poll(http, it, at):
    """Consulta una vez las fuentes en directo de una cita. Devuelve {events:[...]} o None.
    Si una fuente falla (p. ej. World Athletics antes de publicar), se prueba la siguiente."""
    got = None
    for lv in it.get("live") or []:
        try:
            got = _poll_one(http, it, at, lv)
        except Exception:
            continue
        if got:
            break
    return _sin_resultados(_with_schedule(it, at, _a_mano(it, got)), at)


def _a_mano(it, got):
    """Podios dados a mano (pipeline/extra_links.json, «a_mano») mientras el cronometrador no publica esa
    prueba: en cuanto la fuente trae una prueba con el mismo nombre, manda la oficial."""
    try:
        with open(os.path.join(os.path.dirname(__file__), "extra_links.json"), encoding="utf-8") as f:
            mano = (json.load(f).get(it["id"]) or {}).get("a_mano") or []
    except Exception:
        return got
    if not mano:
        return got
    got = dict(got or {"events": []})
    hay = {norm(e["name"]) for e in got.get("events") or []}
    got["events"] = list(got.get("events") or []) + [dict(e, a_mano=True, round=e.get("round") or "Provisional (a falta de la clasificación oficial)")
                                                     for e in mano if norm(e["name"]) not in hay]
    return got


def _with_schedule(it, at, data):
    """Si la cita tiene horario oficial por pruebas (calendario) y la fuente no da el suyo: se enseñan las
    salidas que faltan y cuántas se han disputado, aunque el cronometrador aún no haya publicado nada."""
    if data and (data.get("schedule") or data.get("timeline")):
        return data  # la fuente ya trae su horario (RFEA Live, SmartTrack), aunque ya no quede nada por disputar
    hoy, ahora = at.date().isoformat(), at.strftime("%H:%M")
    sch = [x for x in it.get("schedule") or [] if x.get("d") in (None, hoy)]
    if not sch:
        return data
    pend = [x for x in sch if not x.get("t") or x["t"].zfill(5) > ahora]
    data = dict(data or {"events": []})
    # el cronometrador abrevia («Sub 12 Fem», «Senior / Vet Masc») y el horario no («Sub-12 Femenino»)
    sexo = {"fem": "F", "femenino": "F", "femenina": "F", "mujeres": "F", "f": "F", "federadas": "F",
            "masc": "M", "masculino": "M", "masculina": "M", "hombres": "M", "m": "M", "federados": "M"}
    alias = {"vet": "master", "veteranos": "master", "veteranas": "master", "paralimpicos": "paralimpico"}
    vacias = {"y", "de", "la", "el", "general", "clasificacion"}

    def toks(s):
        ws = [alias.get(w, w) for w in re.findall(r"[a-z]+|\d+", norm(s)) if w not in vacias]
        return {w for w in ws if w not in sexo}, {sexo[w] for w in ws if w in sexo}

    def encaja(ev, x):
        (pe, se), (px, sx) = toks(ev), toks(x)
        return bool(pe) and pe <= px and (not sx or not se or se <= sx)
    usados, timeline = set(), []
    for x in sch:
        mios = [i for i, ev in enumerate(data.get("events") or []) if i not in usados and encaja(ev["name"], x.get("e", ""))]
        usados |= set(mios)
        rows_x = [dict(r) for i in mios for r in data["events"][i]["rows"]]
        sub = [{"name": data["events"][i]["name"], "rows": data["events"][i]["rows"]} for i in mios]
        timeline.append({"time": x.get("t") or "", "event": x.get("e") or "", "round": x.get("r") or "",
                         "state": ("provisional" if all(data["events"][i].get("a_mano") for i in mios) else "oficial") if rows_x else ("pendiente" if x in pend else "en marcha"), "rows": [], "groups": sub})
    # lo que el cronometrador llama distinto («X Carrera de la Mujer...» frente a «Carrera»): si solo hay
    # una carrera ya empezada sin clasificación, es la suya
    sueltas = [i for i in range(len(data.get("events") or [])) if i not in usados and (data["events"][i].get("rows"))]
    vacias_tl = [t for t, x in zip(timeline, sch) if t["state"] in ("en marcha", "sin resultados")]
    if len(vacias_tl) > 1:  # la marcha no competitiva y las infantiles no tienen la clasificación de la carrera
        vacias_tl = [t for t in vacias_tl if not re.search(r"(?i)no competitiva|marcha|infantil|peques|chupetin", t["event"])]
    if sueltas and len(vacias_tl) == 1:
        t = vacias_tl[0]
        t["groups"] = [{"name": data["events"][i]["name"], "rows": data["events"][i]["rows"]} for i in sueltas]
        t["state"] = "provisional" if all(data["events"][i].get("a_mano") for i in sueltas) else "oficial"
    data["timeline"] = timeline
    data["schedule"] = [{"time": x.get("t") or "", "event": x.get("e") or "", "round": x.get("r") or ""} for x in pend[:10]]
    data["done"], data["total"] = len(sch) - len(pend), len(sch)
    return data


def _poll_one(http, it, at, lv):
    for lv in [lv]:
        kind = lv.get("kind")
        if kind == "rfealive":
            sc = rfealive.schedule(http, lv["chid"], base=lv.get("base") or rfealive.BASE)
            today_evs = [e for e in sc["events"] if e.get("date") == at.date().isoformat()] or sc["events"]
            done = [e for e in today_evs if (e.get("status") or "").lower().startswith("oficial")]
            ahora = at.strftime("%H:%M")
            # pruebas ya empezadas que aún no son oficiales: si la RFEA ya enseña clasificación, sale como provisional
            en_marcha = [e for e in today_evs if e not in done and e.get("time") and e["time"] <= ahora]
            events, guardar, filas, nodisp = [], {}, {}, set()
            for e in done + en_marcha:  # TODAS las del día, cada una en cuanto tiene clasificación
                try:
                    r = rfealive.results(http, e["results_url"])
                except Exception:
                    try:  # muchas pruebas seguidas: la RFEA corta alguna petición; se reintenta una vez
                        time.sleep(2)
                        r = rfealive.results(http, e["results_url"])
                    except Exception:
                        continue
                oficial = e in done
                if oficial and r["rows"]:  # a Resultados en cuanto es oficial (clasificación completa)
                    guardar.setdefault(e["event"], {"name": e["event"], "rounds": []})["rounds"].append(
                        {"round": e["round"], "final": bool(re.match(r"final", e["round"] or "", re.I)),
                         "time": e["time"], "date": e.get("date"), "rows": r["rows"]})
                # sin marcas todavía (solo la lista de participantes): aún no hay nada que enseñar
                # (una marca de verdad: con cifras; «DNS», «DNF», «NM»... no cuentan)
                if r["rows"] and all(re.match(r"(?i)dns\b", (x.get("mark") or "").strip()) for x in r["rows"]):
                    nodisp.add(e["results_url"])  # todos los inscritos «DNS»: no se llegó a disputar
                    continue
                if r["rows"] and (oficial or any(re.search(r"\d", x.get("mark") or "") for x in r["rows"])):
                    filas[e["results_url"]] = (oficial, r["rows"][:8])
                    events.append({"name": e["event"], "round": e["round"] if oficial else "%s · provisional" % e["round"],
                                   "time": e["time"], "rows": r["rows"][:8]})
            events.sort(key=lambda x: (x["time"] or "").strip().zfill(5), reverse=True)  # la más reciente, arriba
            nxt = [e for e in today_evs if e not in done and e not in en_marcha][:8]
            # horario prueba a prueba: hora, prueba, ronda, estado y su clasificación en cuanto la hay
            timeline = [{"time": e["time"], "event": e["event"], "round": e["round"],
                         "state": "no disputada" if e["results_url"] in nodisp else
                         ("oficial" if filas[e["results_url"]][0] else "provisional") if e["results_url"] in filas
                         else ("en marcha" if e in en_marcha else "pendiente"),
                         "rows": filas.get(e["results_url"], (0, []))[1]} for e in today_evs]
            return {"events": events, "timeline": timeline, "schedule": [{"time": e["time"], "event": e["event"], "round": e["round"],
                                                    "status": e.get("status") or "Por disputar"} for e in nxt],
                    "done": len(done), "total": len(today_evs),
                    "store": {"events": list(guardar.values()), "source": "RFEA Live",
                              "url": (lv.get("base") or rfealive.BASE) + "/Results/Schedule?chid=" + lv["chid"]} if guardar else None}
        if kind in timing.KINDS:
            got = timing.poll(http, lv, it)
            if got:
                evs, final, source, url = got
                return {"events": [{"name": timing.label(e),
                                    "round": "Clasificación" if final else "Provisional · %d llegados" % e.get("finished", len(e["rows"])),
                                    "rows": e["rows"][:8]} for e in evs],
                        "store": {"events": timing.to_store(evs), "source": source, "url": url}}
            continue
        if kind == "smarttrack":
            sc = [e for e in smarttrack.schedule(http, lv["chid"]) if not smarttrack.is_team(e)]
            today_evs = [e for e in sc if e["date"] == at.date().isoformat()] or sc
            done = [e for e in today_evs if e["done"]]
            events, guardar = [], []
            for e in done:  # todas las pruebas terminadas, con el nombre completo del PDF oficial
                rows = smarttrack_rows(http, e)
                if rows:
                    events.append({"name": e["event"], "round": e["round"], "time": e["time"], "rows": rows[:8]})
                    guardar.append({"name": e["event"], "sex": e["sex"], "rounds": [
                        {"round": e["round"] or "Final", "final": True, "time": e["time"], "date": e["date"], "rows": rows}]})
            events.sort(key=lambda x: (x["time"] or "").zfill(5), reverse=True)  # la más reciente, arriba
            nxt = [e for e in today_evs if not e["done"]][:8]
            por_prueba = {(x["name"], x["round"]): x["rows"] for x in events}
            timeline = [{"time": e["time"], "event": e["event"], "round": e["round"],
                         "state": "oficial" if (e["event"], e["round"]) in por_prueba else
                         ("en marcha" if e["time"] and e["time"].zfill(5) <= at.strftime("%H:%M") else "pendiente"),
                         "rows": por_prueba.get((e["event"], e["round"]), [])} for e in today_evs]
            return {"events": events, "timeline": timeline, "schedule": [{"time": e["time"], "event": e["event"], "round": e["round"],
                                                    "status": e["status"] or "Por disputar"} for e in nxt],
                    "done": len(done), "total": len(today_evs),
                    "store": {"events": guardar, "source": "RFEA (SmartTrack)", "url": smarttrack.WEB + lv["chid"]} if guardar else None}
        if kind == "wa":
            start = dt.date.fromisoformat(it["date"])
            day = (at.date() - start).days + 1
            res = worldathletics.results(http, lv["id"], only_day=day)
            if res and res["events"]:
                evs = []
                for ev in res["events"]:
                    for rnd in ev["rounds"]:
                        evs.append({"name": ev["name"], "round": rnd["round"], "rows": rnd["rows"][:8]})
                return {"events": evs[-12:]}
        if kind == "cronomancha":
            r = timers.cronomancha_results(http, lv["race"])
            if r["rows"]:
                return {"events": [{"name": lv.get("name") or r["race"], "round": "Clasificación provisional" if r["status"] != "Finalizada" else "Final",
                                    "rows": r["rows"][:10]}], "note": "%d llegados" % r["finished"]}
        if kind == "timingsys":
            # la carrera aparece en la API de Cronomancha cuando empiezan a entrar tiempos
            for ev in timers.cronomancha_events(http):
                if ev["date"] == it["date"] and _similar(ev["name"], it["name"]):
                    lv2 = ev["live"][0]
                    r = timers.cronomancha_results(http, lv2["race"])
                    if r["rows"]:
                        return {"events": [{"name": lv2["name"], "round": "Clasificación", "rows": r["rows"][:10]}]}
        if kind == "pdf":
            try:  # todavía no subido = 404, es lo normal durante la competición
                resp = http.request("HEAD", lv["url"], retries=0, allow_redirects=True)
            except Exception:
                continue
            if resp.status_code == 200 and "pdf" in (resp.headers.get("content-type") or "").lower():
                return {"events": [{"name": "Resultados publicados (PDF)", "round": "", "rows": []}], "pdf": lv["url"]}
    return None


def smarttrack_rows(http, e):
    """Clasificación de una prueba de SmartTrack: del PDF oficial (nombres completos) o, si aún no está,
    el podio que publica la propia web."""
    from .parsers import pdf_results
    if e.get("results_pdf"):
        try:
            resp = http.get(e["results_pdf"], timeout=90)
            if b"%PDF" in resp.content[:1024]:
                res = pdf_results.parse(resp.content)
                rows = [r for ev in res["events"] for r in ev["rows"]]
                if rows:
                    return [{k: r.get(k, "") for k in ("pos", "name", "club", "mark", "wind", "note")} for r in rows]
        except Exception:
            pass
    return e.get("podium") or []


def _similar(a, b):
    from .calendar_build import similar
    return similar(a, b)
