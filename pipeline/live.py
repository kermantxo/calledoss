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
import re

from .common import MADRID, load_json, now, save_json, today, iso_now
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
    cal = {x["id"]: x for x in (load_json("calendar.json", {}) or {}).get("items", [])}
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
        if not w["poll"]:
            st["status"] = "finalizado" if ended else ("sin datos en directo" if active or at >= dt.datetime.fromisoformat(w["start"]) else "pendiente")
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
        if data and data.get("store") and not st.get("results_id"):
            try:
                from .results import store
                st["results_id"] = store(it, {"events": data["store"]["events"]}, data["store"]["source"], data["store"]["url"])
            except Exception as e:
                health.note("live", "warning", "Resultados de '%s': %s" % (w["name"], e))
        if data:
            data.pop("store", None)
        if data and data.get("events"):
            st["data"] = data
            st["status"] = "en directo"
            st["updated"] = iso_now()
        elif st["status"] != "en directo":
            st["status"] = "sin datos en directo"
    live["generated"] = iso_now()
    live["any_active"] = any(_in_window(w, at) for w in p.get("windows", []))
    save_json("live.json", live, compact=True)
    return polled


def _poll(http, it, at):
    """Consulta una vez las fuentes en directo de una cita. Devuelve {events:[...]} o None.
    Si una fuente falla (p. ej. World Athletics antes de publicar), se prueba la siguiente."""
    for lv in it.get("live") or []:
        try:
            got = _poll_one(http, it, at, lv)
        except Exception:
            continue
        if got:
            return got
    return None


def _poll_one(http, it, at, lv):
    for lv in [lv]:
        kind = lv.get("kind")
        if kind == "rfealive":
            sc = rfealive.schedule(http, lv["chid"], base=lv.get("base") or rfealive.BASE)
            today_evs = [e for e in sc["events"] if e.get("date") == at.date().isoformat()] or sc["events"]
            done = [e for e in today_evs if (e.get("status") or "").lower().startswith("oficial")]
            events = []
            for e in done[-6:]:  # las últimas pruebas terminadas
                r = rfealive.results(http, e["results_url"])
                if r["rows"]:
                    events.append({"name": e["event"], "round": e["round"], "time": e["time"], "rows": r["rows"][:8]})
            nxt = [e for e in today_evs if e not in done][:8]
            return {"events": events[::-1], "schedule": [{"time": e["time"], "event": e["event"], "round": e["round"],
                                                          "status": e.get("status") or "Por disputar"} for e in nxt],
                    "done": len(done), "total": len(today_evs)}
        if kind in timing.KINDS:
            got = timing.poll(http, lv, it)
            if got:
                evs, final, source, url = got
                return {"events": [{"name": timing.label(e),
                                    "round": "Clasificación" if final else "Provisional · %d llegados" % e.get("finished", len(e["rows"])),
                                    "rows": e["rows"][:8]} for e in evs],
                        "store": {"events": timing.to_store(evs), "source": source, "url": url} if final else None}
            continue
        if kind == "smarttrack":
            sc = [e for e in smarttrack.schedule(http, lv["chid"]) if not smarttrack.is_team(e)]
            today_evs = [e for e in sc if e["date"] == at.date().isoformat()] or sc
            done = [e for e in today_evs if e["done"]]
            events = []
            for e in done[-6:]:  # las últimas pruebas terminadas, con el nombre completo del PDF oficial
                rows = smarttrack_rows(http, e)[:8]
                if rows:
                    events.append({"name": e["event"], "round": e["round"], "time": e["time"], "rows": rows})
            nxt = [e for e in today_evs if not e["done"]][:8]
            return {"events": events[::-1], "schedule": [{"time": e["time"], "event": e["event"], "round": e["round"],
                                                          "status": e["status"] or "Por disputar"} for e in nxt],
                    "done": len(done), "total": len(today_evs)}
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
