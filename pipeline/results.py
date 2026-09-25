"""Resultados: vigila los índices de cada fuente y guarda results/<id>.json + results/index.json.

Cada competición se procesa una sola vez cuando sus resultados están completos. Lo que aún
no tenga resultados queda 'pendiente' y se reintenta en los siguientes chequeos (hasta 10 días).
"""
import datetime as dt
import re

from .calendar_build import similar
from .common import load_json, norm, save_json, today, iso_now, slugify, short_hash
from .highlights import learn_from_results, _match, _wl_keys
from .parsers import pdf_results
from .sources import rfea, rfealive, worldathletics, timers

MAX_PDFS_PER_RUN = 6
LOOKBACK_DAYS = 10


def _index():
    return load_json("results/index.json", {"items": []}) or {"items": []}


def _done():
    return load_json("state/results_done.json", {}) or {}


def summarize(res, is_intl):
    """Resumen para la lista: podio de las finales + españoles destacados."""
    wl = _wl_keys()
    podios, espanoles, destacados = [], [], []
    for ev in res.get("events", []):
        rounds = ev.get("rounds") or [ev]
        for rnd in rounds:
            name = rnd.get("round") or ""
            is_final = rnd.get("final", bool(re.search(r"^final\b|^final$", name, re.I)) or name == "")
            rows = rnd.get("rows", [])
            if is_final and rows:
                podios.append({"event": ev["name"], "round": name, "rows": rows[:3]})
            for r in rows:
                if r.get("nat") == "ESP":
                    espanoles.append({"event": ev["name"], "round": name, **r})
                elif _match(r.get("name", ""), wl, international=is_intl):
                    destacados.append({"event": ev["name"], "round": name, **r})
    return podios, espanoles[:80], destacados[:40]


def store(item, res, source, url=None):
    """Guarda el detalle y actualiza el índice."""
    rid = item["id"] if item else "res-%s" % short_hash(url or source)
    res = dict(res)
    res.update({"id": rid, "name": item["name"] if item else res.get("name", ""), "date": item["date"] if item else res.get("date", ""),
                "place": item.get("place", "") if item else "", "source": source, "url": url, "fetched": iso_now()})
    save_json("results/%s.json" % rid, res, compact=True)
    podios, esp, dest = summarize(res, bool(item and item.get("intl")))
    idx = _index()
    idx["items"] = [x for x in idx["items"] if x["id"] != rid]
    idx["items"].append({
        "id": rid, "cal_id": item["id"] if item else None, "name": res["name"], "date": res["date"],
        "place": res["place"], "source": source, "url": url, "events": len(res.get("events", [])),
        # el índice lleva solo un resumen (la ficha completa está en results/<id>.json)
        "podios": podios[:6], "n_podios": len(podios), "espanoles": esp[:20], "destacados": dest[:12],
        "fetched": res["fetched"],
        "link_only": bool(res.get("link_only")),
    })
    idx["items"].sort(key=lambda x: x["date"] or "", reverse=True)
    idx["generated"] = iso_now()
    save_json("results/index.json", idx, compact=True)
    if item and item.get("intl"):
        learn_from_results(res)
    return rid


def unstore(rid):
    """Quita una competición de los resultados (p. ej. si se leyó mal y no se ha podido rehacer)."""
    import os
    from .common import path
    idx = _index()
    idx["items"] = [x for x in idx["items"] if x["id"] != rid]
    save_json("results/index.json", idx, compact=True)
    p = path("results/%s.json" % rid)
    if os.path.exists(p):
        os.remove(p)


def _find_item(items, title, date=None):
    for it in items:
        if date and not (it["date"] <= date <= (it.get("end_date") or it["date"])):
            continue
        if similar(it["name"], title):
            return it
    return None


# ------------------------------------------------------------------ por fuente

def rfea_pdf_index(http, items, health):
    done = _done()
    n = 0
    for link in rfea.results_index(http):
        u = link["url"]
        if u in done or n >= MAX_PDFS_PER_RUN:
            continue
        content = http.get(u, timeout=180).content
        res = pdf_results.parse(content)
        n += 1
        meta = res.get("meta") or {}
        date = None
        if meta.get("dates"):
            d, m, y = meta["dates"][0].split("/")
            date = "%s-%s-%s" % (y, m, d)
        item = _find_item(items, meta.get("championship") or link["title"], date) or _find_item(items, link["title"])
        res["name"] = link["title"] or meta.get("championship", "")
        res["date"] = date or ""
        done[u] = {"at": iso_now(), "events": len(res["events"]), "format": res.get("format")}
        if res["events"]:
            store(item, res, "RFEA (PDF)", u)
        else:
            health.note("rfea_results", "warning", "PDF sin tablas reconocibles: %s" % u)
    save_json("state/results_done.json", done, compact=True)
    return n


def rfealive_champ(http, chid, only_official=True):
    sc = rfealive.schedule(http, chid)
    evs = sc["events"]
    if not evs:
        return None, False
    complete = all((e.get("status") or "").lower().startswith("oficial") for e in evs)
    out = {}
    for e in evs:
        if only_official and not (e.get("status") or "").lower().startswith("oficial"):
            continue
        r = rfealive.results(http, e["results_url"])
        if not r["rows"]:
            continue
        final = bool(re.match(r"final", e["round"], re.I))
        ev = out.setdefault(e["event"], {"name": e["event"], "rounds": []})
        ev["rounds"].append({"round": e["round"], "final": final, "time": e["time"], "date": e["date"],
                             "rows": r["rows"] if final else r["rows"][:8]})
    return {"events": list(out.values()), "championship": sc["name"]}, complete


def by_item(http, it, health, final=False):
    """Intenta sacar resultados de una cita concreta con todas sus fuentes conocidas."""
    done = _done()
    rid = None
    for lv in it.get("live") or []:
        kind = lv.get("kind")
        try:
            if kind == "rfealive":
                res, complete = rfealive_champ(http, lv["chid"])
                if res and res["events"] and (complete or final):
                    return store(it, res, "RFEA Live", "https://rfealive.info/Results/Schedule?chid=" + lv["chid"])
            elif kind == "wa":
                res = worldathletics.results(http, lv["id"])
                if res and res["events"]:
                    return store(it, res, "World Athletics", it["links"].get("info"))
            elif kind == "cronomancha":
                r = timers.cronomancha_results(http, lv["race"])
                if r["rows"]:
                    res = {"events": [{"name": lv.get("name") or r["race"], "rounds": [
                        {"round": "General", "final": True, "rows": r["rows"]},
                        {"round": "Hombres", "final": False, "rows": r["top_M"]},
                        {"round": "Mujeres", "final": False, "rows": r["top_F"]}]}],
                        "note": "%d clasificados de %d inscritos" % (r["finished"], r["total"])}
                    prev = load_json("results/%s.json" % it["id"], {}) or {}
                    for ev in prev.get("events", []):  # varias carreras en el mismo evento
                        if ev["name"] != res["events"][0]["name"]:
                            res["events"].append(ev)
                    rid = store(it, res, "Cronomancha", it["links"].get("resultados"))
            elif kind == "pdf":
                u = lv["url"]
                if u in done:
                    continue
                resp = http.get(u, timeout=180)
                if b"%PDF" not in resp.content[:1024]:
                    continue
                res = pdf_results.parse(resp.content)
                done[u] = {"at": iso_now(), "events": len(res["events"])}
                save_json("state/results_done.json", done, compact=True)
                if res["events"]:
                    return store(it, res, "PDF de resultados", u)
        except Exception as e:
            health.note("results", "warning", "Resultados de '%s' (%s): %s" % (it["name"], kind, e))
    if rid:
        return rid
    return None  # el chequeo diario prueba después la búsqueda completa (backfill.Finder)


def sweep(http, items, health):
    """Chequeo de resultados: índices + competiciones recientes + pendientes."""
    t = today()
    idx_ids = {x["id"] for x in _index()["items"]}
    pending = load_json("state/pending.json", {}) or {}
    health.run("rfea_results", "RFEA · índice de resultados (PDF)", rfea_pdf_index, http, items, health, expect_min=0)
    got = 0
    for it in items:
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        if not (t - dt.timedelta(days=LOOKBACK_DAYS) <= end < t) and it["id"] not in pending:
            continue
        if it["id"] in idx_ids and it["id"] not in pending:
            continue
        if not it.get("live") and not it.get("source", "").startswith("AvaiBook"):
            continue
        rid = by_item(http, it, health, final=(t - end).days >= 2)
        if not rid and (t - end).days >= 1:
            # misma búsqueda que la carga histórica: garantiza el podio de cada prueba
            from .backfill import Finder
            try:
                pods, source, url, _ = Finder(http, health).resolve(it)
                if pods:
                    rid = store(it, {"events": pods}, source, url)
            except Exception as e:
                health.note("results", "warning", "Búsqueda de podios de '%s': %s" % (it["name"], e))
        if rid:
            got += 1
            pending.pop(it["id"], None)
        else:
            p = pending.setdefault(it["id"], {"since": t.isoformat(), "tries": 0})
            p["tries"] += 1
            if (t - end).days > LOOKBACK_DAYS:
                pending.pop(it["id"], None)
    save_json("state/pending.json", pending)
    return got
