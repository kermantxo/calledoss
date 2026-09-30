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


from .quality import missing_sexes


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


def _dedupe(events):
    """Quita las pruebas repetidas: mismo podio (mismos atletas y marcas) con otro nombre, p. ej.
    "Clasificación Hombres" y "SUB14 MASCULINO" leídas de dos documentos de la misma carrera.
    Se queda el nombre más descriptivo (el que no es un genérico "Clasificación ...")."""
    def sig(ev):
        rows = [r for rd in (ev.get("rounds") or [ev]) for r in rd.get("rows", [])[:3]]
        return tuple((norm(r.get("name", "")), str(r.get("mark", ""))) for r in rows)
    generic = re.compile(r"^(clasificaci[oó]n|general|carrera)\b", re.I)
    keep = {}
    for ev in events:
        k = sig(ev)
        if not k:
            keep[id(ev)] = ev
            continue
        cur = keep.get(k)
        if cur is None or (generic.search(cur.get("name", "")) and not generic.search(ev.get("name", ""))):
            keep[k] = ev
    out = [ev for ev in events if keep.get(sig(ev)) is ev or keep.get(id(ev)) is ev]
    return out


def _bad_results():
    import json, os
    try:
        with open(os.path.join(os.path.dirname(__file__), "bad_results.json"), encoding="utf-8") as f:
            return {k: v for k, v in json.load(f).items() if not k.startswith("_")}
    except Exception:
        return {}


BAD_RESULTS = _bad_results()


def is_bad(cid, url):
    """¿Este documento está descartado para esta competición? (pipeline/bad_results.json)"""
    return any(u and u in (url or "") for u in (BAD_RESULTS.get(cid) or {}).get("urls", []))


def drop_bad():
    """Quita de los resultados los que usan un documento descartado. Devuelve los ids quitados."""
    out = []
    for x in list(_index()["items"]):
        cid = x.get("cal_id") or x["id"]
        if is_bad(cid, x.get("url")):
            unstore(x["id"])
            out.append(cid)
    return out


def _add_extra_rows(rid, res):
    """Filas comprobadas a mano en la clasificación oficial (pipeline/extra_results.json)."""
    import json, os
    try:
        with open(os.path.join(os.path.dirname(__file__), "extra_results.json"), encoding="utf-8") as f:
            extra = json.load(f).get(rid) or {}
    except Exception:
        return
    for row in extra.get("filas", []):
        ev = next((e for e in res.get("events", []) if e.get("name") == row.get("event")), None)
        if not ev:
            continue
        rounds = ev.get("rounds") if ev.get("rounds") is not None else [ev]
        rnd = next((r for r in rounds if (r.get("round") or "") == row.get("round", "")), rounds[0] if rounds else None)
        if rnd is None or any(sorted(norm(x.get("name", "")).split()) == sorted(norm(row["name"]).split()) for x in rnd.get("rows", [])):
            continue
        rnd.setdefault("rows", []).append({k: v for k, v in row.items() if k not in ("event", "round")})
        # en su sitio según el puesto (el podio sigue siendo el mismo)
        rnd["rows"].sort(key=lambda x: int(x["pos"]) if str(x.get("pos", "")).isdigit() else 10 ** 6)


def store(item, res, source, url=None):
    """Guarda el detalle y actualiza el índice."""
    rid = item["id"] if item else "res-%s" % short_hash(url or source)
    if item and is_bad(item["id"], url):
        return None  # documento descartado a mano para esta competición
    res = dict(res)
    # revisión automática: nombres "Nombre Apellidos" y nada de hombres en podios de mujeres (ni al revés)
    from .quality import review, record
    res, issues = review(res, item["name"] if item else res.get("name", ""))
    record(rid, issues)
    if not res.get("events") and not res.get("link_only"):
        return None
    from .quality import event_sex
    res["events"] = _dedupe(res.get("events", []))
    _add_extra_rows(rid, res)
    for ev in res.get("events", []):
        ev["sex"] = event_sex(ev)  # la web separa femenino / masculino con este dato
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
        "podios": podios[:6], "n_podios": len(podios),
        "n_sexo": {x: sum(1 for e in res.get("events", []) if e.get("sex") == x) for x in ("F", "M", "X")}, "espanoles": esp[:20], "destacados": dest[:12],
        "fetched": res["fetched"],
        "link_only": bool(res.get("link_only")), "incomplete": res.get("incomplete"),
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
    """PDFs nuevos del índice de resultados de RFEA. Cada PDF solo se asigna a una competición del
    calendario si su nombre y su fecha coinciden (misma comprobación que la carga histórica), y solo
    sustituye a lo que ya hubiera si trae más pruebas o más sexos. Un PDF que no es de ninguna
    competición del calendario no se publica."""
    from .backfill import from_pdf
    from .quality import sexes_in
    done = _done()
    retry = done.pop("_retry", {})
    f = _finder(http, health)
    t = today().isoformat()
    n = 0
    for link in rfea.results_index(http):
        u = link["url"]
        if retry.get(u, 0) >= 5 or u in done or n >= MAX_PDFS_PER_RUN:
            continue
        cands = [it for it in items if it["date"] <= t and similar(it["name"], link["title"])]
        n += 1
        matched, failed = [], None
        for it in cands:
            try:
                pods, _, why = from_pdf(http, it, u, f.state["pdf_cache"], "index")
            except Exception as e:
                failed = e
                break
            if not pods:
                continue
            cur = (load_json("results/%s.json" % it["id"], {}) or {}).get("events") or []
            if len(sexes_in(pods)) > len(sexes_in(cur)) or (len(sexes_in(pods)) == len(sexes_in(cur)) and len(pods) > len(cur)):
                if store(it, {"events": pods}, "PDF oficial", u):
                    matched.append(it["id"])
            else:
                matched.append(it["id"] + " (ya tenía resultados igual de completos)")
        if failed is not None:
            # un enlace roto en el índice de RFEA no puede bloquear el resto: se apunta y se sigue
            health.note("rfea_results", "warning", "PDF de RFEA no disponible (%s): %s" % (str(failed)[:80], u))
            retry[u] = retry.get(u, 0) + 1
            continue
        done[u] = {"at": iso_now(), "matched": matched}
    f.save()
    if retry:
        done["_retry"] = retry
    save_json("state/results_done.json", done, compact=True)
    return n


def rfealive_champ(http, chid, only_official=True, base=None):
    sc = rfealive.schedule(http, chid, base=base or rfealive.BASE)
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
                base = lv.get("base") or rfealive.BASE
                res, complete = rfealive_champ(http, lv["chid"], base=base)
                if res and res["events"] and (complete or final):
                    return store(it, res, "RFEA Live", base + "/Results/Schedule?chid=" + lv["chid"])
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


_FINDER = {}


def _finder(http, health):
    """Un único buscador por ejecución (reutiliza los índices ya descargados)."""
    if "f" not in _FINDER:
        from .backfill import Finder
        _FINDER["f"] = Finder(http, health)
    return _FINDER["f"]


def sweep(http, items, health, deep=False):
    """Chequeo de resultados: índices + competiciones recientes (incluidas las de HOY) + pendientes.
    deep=True (chequeo diario): también reintenta lo pendiente de días anteriores con la búsqueda completa."""
    t = today()
    drop_bad()
    idx_ids = {x["id"] for x in _index()["items"]}
    pending = load_json("state/pending.json", {}) or {}
    health.run("rfea_results", "RFEA · índice de resultados (PDF)", rfea_pdf_index, http, items, health, expect_min=0)
    got = 0
    for it in items:
        end = dt.date.fromisoformat(it.get("end_date") or it["date"])
        start = dt.date.fromisoformat(it["date"])
        if not (t - dt.timedelta(days=LOOKBACK_DAYS) <= end and start <= t) and it["id"] not in pending:
            continue
        recent = (t - end).days <= 1
        if not recent and not deep and it["id"] in pending and pending[it["id"]].get("last") == t.isoformat():
            continue  # lo de días anteriores se reintenta una vez al día; lo de hoy y ayer, en cada chequeo
        recent_done = it["id"] in idx_ids and (t - end).days <= 1
        if it["id"] in idx_ids and it["id"] not in pending and not recent_done:
            continue  # las de hoy y ayer se vuelven a mirar aunque ya tengan resultados (llegan categorías tarde)
        rid = by_item(http, it, health, final=(t - end).days >= 2) if it.get("live") else None
        if not rid:
            # misma búsqueda que la carga histórica: garantiza el podio de cada prueba
            try:
                pods, source, url, _ = _finder(http, health).resolve(it)
                if pods:
                    rid = store(it, {"events": pods}, source, url)
            except Exception as e:
                health.note("results", "warning", "Búsqueda de podios de '%s': %s" % (it["name"], e))
        elif missing_sexes((load_json("results/%s.json" % rid, {}) or {}).get("events"), it["name"]):
            # la fuente en directo solo trae un sexo: se busca el otro en las demás fuentes
            cur = load_json("results/%s.json" % rid, {}) or {}
            try:
                pods, source, url, _ = _finder(http, health).resolve(it, have=(cur["events"], cur.get("source"), cur.get("url")))
                if pods and len(pods) > len(cur["events"]):
                    store(it, {"events": pods}, source, url)
            except Exception as e:
                health.note("results", "warning", "Completar resultados de '%s': %s" % (it["name"], e))
        if rid:
            got += 1
            pending.pop(it["id"], None)
        else:
            p = pending.setdefault(it["id"], {"since": t.isoformat(), "tries": 0})
            p["tries"] += 1
            p["last"] = t.isoformat()
            if (t - end).days > LOOKBACK_DAYS:
                pending.pop(it["id"], None)
    save_json("state/pending.json", pending)
    return got
