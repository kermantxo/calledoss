"""Sin dependencias: dice si ahora mismo hay una ventana de directo activa (o una que acaba de cerrar)."""
import datetime as dt
import json
import sys

try:
    plan = json.load(open(sys.argv[1], encoding="utf-8"))
except Exception:
    print("active=false")
    sys.exit(0)
now = dt.datetime.now(dt.timezone.utc)
active = False
for w in plan.get("windows", []):
    if not w.get("poll"):
        continue
    s = dt.datetime.fromisoformat(w["start"])
    e = dt.datetime.fromisoformat(w["end"])
    # +20 min tras el cierre para que la última ejecución pase los resultados a "Resultados"
    if s <= now <= e + dt.timedelta(minutes=20):
        active = True
        break
print("active=%s" % ("true" if active else "false"))
