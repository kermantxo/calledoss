"""Sportmaniacs (sportmaniacs.com) — cronometrador de muchas carreras populares.

* Búsqueda de carreras:   https://api-aws.sportmaniacs.com/api/races?name=<texto>
* Pruebas de una carrera: enlaces '/races/<slug>/<id>/results' en la página de la carrera.
* Podio de una prueba:    https://api-aws.sportmaniacs.com/api/rankings?event=<id>&gender=0|1
  (gender=0 hombres, gender=1 mujeres).
"""
import re
from urllib.parse import quote

from bs4 import BeautifulSoup

from ..common import clean, norm

API = "https://api-aws.sportmaniacs.com/api"
WEB = "https://sportmaniacs.com/es/races/"


def search(http, text):
    r = http.get("%s/races?name=%s&lang=es" % (API, quote(text)), timeout=30)
    return (r.json() or {}).get("data") or []


def events(http, slug):
    """Pruebas (distancias) de una carrera: [(id, nombre)]."""
    r = http.get(WEB + slug, timeout=30)
    soup = BeautifulSoup(r.text, "lxml")
    out = []
    for a in soup.find_all("a", href=re.compile(r"/races/%s/[0-9a-f-]{36}/(results|rankings)" % re.escape(slug))):
        eid = re.search(r"/([0-9a-f-]{36})/(results|rankings)", a["href"]).group(1)
        box = a.find_parent(["li", "div", "article"])
        label = clean(box.get_text(" ")) if box else ""
        label = re.sub(r"\s*\d{2}/\d{2}/\d{4}.*", "", label).replace("Ver clasificaciones", "").strip()
        if eid not in [x[0] for x in out]:
            out.append((eid, label))
    named = []
    for eid, label in out:
        try:
            d = (http.get("%s/events/%s/rankings" % (API, eid), timeout=30).json() or {}).get("data") or {}
            label = " · ".join(x for x in [clean(d.get("name")), clean(d.get("distance"))] if x) or label
        except Exception:
            pass
        named.append((eid, label))
    return named


def _name(n):
    n = clean(n)
    return " ".join(w.capitalize() for w in n.split()) if n.isupper() else n


def podium(http, event_id, gender):
    r = http.get("%s/rankings?event=%s&gender=%d" % (API, event_id, gender), timeout=30)
    rows = (r.json() or {}).get("data") or []
    rows = [x for x in rows if re.match(r"^\d+$", str(x.get("pos") or ""))]
    rows.sort(key=lambda x: int(x["pos"]))
    return [{"pos": str(i + 1), "name": _name(x.get("name")), "club": clean(x.get("club")),
             "mark": x.get("officialTime") or ""} for i, x in enumerate(rows[:3])]


def _sexos(label):
    """Una prueba de un solo sexo ('SUB12 FEM', 'Élite masculina') solo lleva ese podio: si no, un
    inscrito con el sexo mal puesto sale como podio falso del otro sexo."""
    n = norm(label)
    fem = re.search(r"fem|mujer", n)
    masc = re.search(r"masc|hombre|varon", n)
    if fem and not masc:
        return ((1, "Mujeres"),)
    if masc and not fem:
        return ((0, "Hombres"),)
    return ((0, "Hombres"), (1, "Mujeres"))


def _orden(ev):
    """Primero la élite/absoluta, luego la popular, después las demás distancias (la más larga antes), las
    categorías por edad y al final las adaptadas (la lista muestra las 6 primeras)."""
    n = norm(ev["name"])
    km = re.search(r"(\d+(?: \d+)?) ?km\b|\b(\d+) ?k\b", n)
    km = float((km.group(1) or km.group(2)).replace(" ", ".")) if km else 0
    if re.search(r"elite|absolut|senior|internacional", n):
        grupo = 0
    elif re.search(r"popular", n):
        grupo = 1
    elif re.search(r"handbike|silla|adaptad", n):
        grupo = 4
    elif re.search(r"\bsub ?\d|master|veteran|chupet|benjam|alevin|infantil|cadete|juvenil|junior|prebenj", n):
        grupo = 3
    else:
        grupo = 2
    return (grupo, -km)


def results(http, slug):
    """Podio masculino y femenino de cada prueba de la carrera."""
    out = []
    for eid, label in events(http, slug):
        for g, sex in _sexos(label):
            rows = podium(http, eid, g)
            if rows:
                out.append({"name": "%s %s" % (label or "Carrera", sex),
                            "rounds": [{"round": "General", "final": True, "rows": rows}]})
    return sorted(out, key=_orden)
