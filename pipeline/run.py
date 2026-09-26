"""Punto de entrada de las tareas programadas.

    python -m pipeline.run daily     # calendario + destacados + resultados + plan de directo (1 vez al día)
    python -m pipeline.run results   # solo chequeo de resultados (varias veces al día)
    python -m pipeline.run plan      # recalcula el plan de hoy (tras añadir algo en el panel)
    python -m pipeline.run live      # una comprobación de directo (cada 2-5 min; sale en 1 s si no toca)
    python -m pipeline.run backfill  # carga histórica de podios de 2026 (reanudable)
    python -m pipeline.run revisar   # revisa nombres y sexo de todos los podios guardados
"""
import os
import sys
import time

from . import backfill, calendar_build, highlights, live, previas, results
from .common import Health, Http, load_json, save_json, iso_now


def _items():
    return (load_json("calendar.json", {}) or {}).get("items", [])


def daily():
    h, health = Http(), Health()
    items = calendar_build.build(h, health)
    health.run("destacados", "Atletas destacados (listas de salida)", highlights.compute, h, items, health, expect_min=0)
    calendar_build.save(items)
    health.run("results", "Resultados (todas las fuentes)", results.sweep, h, items, health, deep=True, expect_min=0)
    health.run("previas", "Previas (listas de inscritos)", previas.run, h, health, items, expect_min=0)
    live.plan(items)
    health.save()


def results_only():
    h, health = Http(), Health()
    items = _items()
    health.run("results", "Resultados (todas las fuentes)", results.sweep, h, items, health, expect_min=0)
    health.save()


def previas_only():
    h, health = Http(), Health()
    health.run("previas", "Previas (listas de inscritos)", previas.run, h, health, _items(), expect_min=0)
    health.save()


def plan_only():
    """Mezcla lo añadido a mano con el calendario ya descargado y rehace el plan (sin scrapear)."""
    health = Health()
    items = [x for x in _items() if not x.get("manual")]
    items = calendar_build.merge([calendar_build.manual_items(), items])
    calendar_build.save(items)
    live.plan(items)
    health.save()


def backfill_run():
    h, health = Http(), Health()
    stats = health.run("backfill", "Carga histórica de resultados 2026", backfill.run, h, health, _items(), expect_min=0)
    health.save()
    print("carga histórica:", stats)
    with open(os.path.join(os.environ.get("DATA_DIR", "data"), "..", "backfill_remaining.txt"), "w") as f:
        f.write(str((stats or {}).get("remaining", 0)))


def revisar():
    """Pasa la revisión automática (nombres + sexo de cada podio) por TODOS los resultados guardados."""
    import glob, os
    from .common import DATA_DIR
    from . import results as R
    cal = {x["id"]: x for x in _items()}
    idx = {x["id"]: x for x in R._index()["items"]}
    n = dropped = 0
    for f in sorted(glob.glob(os.path.join(DATA_DIR, "results", "*.json"))):
        base = os.path.basename(f)[:-5]
        if base in ("index", "sin_resultados", "revision"):
            continue
        res = load_json("results/%s.json" % base, {}) or {}
        meta = idx.get(base, {})
        item = cal.get(meta.get("cal_id") or base) or {"id": base, "name": res.get("name", ""), "date": res.get("date", ""),
                                                          "place": res.get("place", ""), "intl": False}
        if item["id"] != base:
            item = dict(item, id=base)
        before = sum(len(e.get("rounds") or [e]) for e in res.get("events", []))
        rid = R.store(item, res, res.get("source") or meta.get("source", ""), res.get("url") or meta.get("url"))
        if rid is None:
            R.unstore(base)
        after = sum(len(e.get("rounds") or [e]) for e in (load_json("results/%s.json" % base, {}) or {}).get("events", []))
        dropped += max(0, before - after)
        n += 1
    print("revisadas %d competiciones; %d podios retirados por no cuadrar" % (n, dropped))


def live_tick():
    h, health = Http(min_delay=0.3), Health()
    n = live.tick(h, health)
    if n:
        health.save()
    print("directo: %d citas consultadas" % n)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "daily"
    t = time.time()
    {"daily": daily, "results": results_only, "plan": plan_only, "live": live_tick, "backfill": backfill_run,
     "revisar": revisar, "previas": previas_only}[mode]()
    print("%s terminado en %.0f s" % (mode, time.time() - t))
