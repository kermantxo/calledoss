"""Punto de entrada de las tareas programadas.

    python -m pipeline.run daily     # calendario + destacados + resultados + plan de directo (1 vez al día)
    python -m pipeline.run results   # solo chequeo de resultados (varias veces al día)
    python -m pipeline.run plan      # recalcula el plan de hoy (tras añadir algo en el panel)
    python -m pipeline.run live      # una comprobación de directo (cada 2-5 min; sale en 1 s si no toca)
"""
import sys
import time

from . import calendar_build, highlights, live, results
from .common import Health, Http, load_json, save_json, iso_now


def _items():
    return (load_json("calendar.json", {}) or {}).get("items", [])


def daily():
    h, health = Http(), Health()
    items = calendar_build.build(h, health)
    health.run("destacados", "Atletas destacados (listas de salida)", highlights.compute, h, items, health, expect_min=0)
    calendar_build.save(items)
    health.run("results", "Resultados (todas las fuentes)", results.sweep, h, items, health, expect_min=0)
    live.plan(items)
    health.save()


def results_only():
    h, health = Http(), Health()
    items = _items()
    health.run("results", "Resultados (todas las fuentes)", results.sweep, h, items, health, expect_min=0)
    health.save()


def plan_only():
    """Mezcla lo añadido a mano con el calendario ya descargado y rehace el plan (sin scrapear)."""
    health = Health()
    items = [x for x in _items() if not x.get("manual")]
    items = calendar_build.merge([calendar_build.manual_items(), items])
    calendar_build.save(items)
    live.plan(items)
    health.save()


def live_tick():
    h, health = Http(min_delay=0.3), Health()
    n = live.tick(h, health)
    if n:
        health.save()
    print("directo: %d citas consultadas" % n)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "daily"
    t = time.time()
    {"daily": daily, "results": results_only, "plan": plan_only, "live": live_tick}[mode]()
    print("%s terminado en %.0f s" % (mode, time.time() - t))
