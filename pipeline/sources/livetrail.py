"""LiveTrail (v3.livetrail.net) — cronometraje de muchas carreras de trail (Transvulcania, Penyagolosa...).

La web de cada carrera es https://<carrera>.v3.livetrail.net/<idioma>/<año>. Detrás hay una API pública:
* Carreras de la prueba:  https://api.v3.livetrail.net/api/events/races/summaries
* Clasificación final:    https://api.v3.livetrail.net/api/events/ranking/final/<raceId>?sex=MALE|FEMALE&limit=3
Todas las llamadas llevan la cabecera X-Tenant: <carrera>_<año>.
"""
import re

API = "https://api.v3.livetrail.net/api"
URL = re.compile(r"https?://([a-z0-9-]+)\.v3\.livetrail\.net/[a-z]{2}/(20\d\d)", re.I)


def tenant(url):
    m = URL.search(url or "")
    return ("%s_%s" % (m.group(1).lower(), m.group(2))) if m else None


def _hms(secs):
    secs = int(secs or 0)
    return "%d:%02d:%02d" % (secs // 3600, secs % 3600 // 60, secs % 60)


def _name(first, last):
    last = " ".join(w.capitalize() if w.isupper() else w for w in (last or "").split())
    return " ".join(x for x in ((first or "").strip(), last) if x)


def results(http, url):
    """Podio masculino y femenino de cada carrera terminada: [{"name", "rounds": [...]}]."""
    t = tenant(url)
    if not t:
        return []
    h = {"X-Tenant": t}
    races = http.get(API + "/events/races/summaries", headers=h, timeout=30).json() or []
    out = []
    for race in races:
        if race.get("status") != "FINISHED":
            continue
        km = round((race.get("distance") or 0) / 1000)
        label = race.get("fullname") or race.get("shortname") or race.get("raceId")
        label = "%s (%d km)" % (label, km) if km and not re.search(r"\d\s?k", label, re.I) else label
        for sex, word in (("MALE", "Hombres"), ("FEMALE", "Mujeres")):
            data = http.get("%s/events/ranking/final/%s" % (API, race["raceId"]), headers=h, timeout=30,
                            params={"page": 0, "limit": 3, "sex": sex}).json() or {}
            rows = [r for r in data.get("runners", []) if r.get("status") == "FINISHER" and r.get("raceTime")]
            if not rows or [r["raceTime"] for r in rows[:3]] != sorted(r["raceTime"] for r in rows[:3]):
                continue  # sin llegadas, o clasificación que no va por tiempo (carreras adaptadas)
            out.append({"name": "%s %s" % (label, word), "rounds": [{"round": "General", "final": True, "rows": [
                {"pos": str(i + 1), "name": _name(r.get("firstName"), r.get("lastName")), "club": r.get("club") or "",
                 "mark": _hms(r["raceTime"]), "nat": "ESP" if r.get("countryCode") == "ES" else ""} for i, r in enumerate(rows[:3])]}]})
    return out
