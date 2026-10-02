"""RANKING ESPAÑOL del año con los datos oficiales de la RFEA (atletismorfea.es/ranking).

Se descarga cada día, prueba a prueba, categoría absoluta, hombres y mujeres, la mejor marca de
cada atleta (solo marcas válidas: viento legal y cronometraje eléctrico). Se separa en:

* Aire libre: pruebas de aire libre, sin las marcas hechas en pista cubierta.
* Pista cubierta: pruebas de pista corta (las "ST" de la RFEA, 60 m, 60 m vallas, pentatlón/heptatlón
  de pista cubierta) y, en los concursos que se hacen en las dos temporadas (altura, pértiga, longitud,
  triple, peso), las marcas que la RFEA marca como pista cubierta: "(i)" junto a la ciudad.

Todo es código normal (HTML de la RFEA). Sin IA. Resultado en ranking.json.
"""
import re

from bs4 import BeautifulSoup

from .common import clean, iso_now, load_json, save_json, today

BASE = "https://atletismorfea.es"
CAT = {"F": 145, "M": 146}          # categoría absoluta (la RFEA usa un código por sexo)
GENDER = {"F": 2, "M": 1}
TOP = 10
BOTH = re.compile(r"^(altura|p[eé]rtiga|longitud|triple|peso)\b", re.I)          # concursos de las dos temporadas
INDOOR_ONLY = re.compile(r"^(60\s?m|60 m v|pentatl[oó]n|heptatl[oó]n st)", re.I)  # solo en pista cubierta
SKIP = re.compile(r"^(50 m v|150m|2 millas|300m$|500m$|600m$|1\.000m$|2\.000m$|milla$|1 hora)", re.I)


def event_options(http, season, sex, kind="AL"):
    """Pruebas del ranking. kind: AL (pista), RT (ruta), MA (marcha en ruta)."""
    r = http.get("%s/options/ranking/%s/%s/%d/0/%d/" % (BASE, season, kind, CAT[sex], GENDER[sex]))
    return [(e["key"], clean(e["value"])) for e in r.json().get("event", []) if "::" in (e.get("key") or "")]


def nice_event(name):
    n = re.sub(r"\s+(MASC|FEM)\.?(\s+(AL|ST))?$|\s+(Mas|Fem|M)$", "", name.strip())
    n = re.sub(r"\s+ST$", "", n)
    n = re.sub(r"\s+(masc|fem)\.?$", "", n, flags=re.I)
    n = re.sub(r"\s+Ruta(\s+(Mujeres|Hombres))?$|\s+(Mujeres|Hombres)$", "", n, flags=re.I)
    n = re.sub(r"\s+(masc|fem)\.?$", "", n, flags=re.I)
    n = re.sub(r"^(\d+)km\b", r"\1 km", n)
    n = re.sub(r"\s+AL$", "", n)
    n = n.replace(" m v.", " m vallas").replace("Obst.", "obstáculos")
    return n


def fetch(http, season, sex, key, count=TOP):
    ev, short = key.split("::")
    url = "%s/ranking/%s/%d/0/1/2/0/%s/0/0/%d/1/%s/1/1?_wrapper_format=drupal_ajax" % (BASE, season, CAT[sex], ev, count, short)
    data = http.get(url).json()
    html = next((c.get("data") for c in data if isinstance(c.get("data"), str) and "ranking_container" in c["data"]), "")
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table", class_="tabla_ranking")
    if not table:
        return []
    heads = [clean(th.get_text()).upper() for th in table.find_all("th")]
    rows = []
    for tr in table.find_all("tr")[1:]:
        tds = [clean(td.get_text(" ")) for td in tr.find_all("td")]
        if len(tds) < len(heads) - 1:
            continue
        c = dict(zip(heads, tds))
        name = c.get("ATLETA", "")
        rows.append({
            "mark": c.get("MARCA", ""), "wind": c.get("VIENTO", "") if c.get("VIENTO", "-") != "-" else "",
            "name": " ".join(w.capitalize() if len(w) > 2 or i == 0 else w.lower() for i, w in enumerate(name.split())),
            "club": c.get("CLUB", ""), "born": c.get("F.N.", "")[-4:], "fed": c.get("FED.", ""),
            "city": re.sub(r"\s*\(i\)\s*$", "", c.get("CIUDAD", "")), "date": c.get("FECHA", ""),
            "indoor": "(i)" in c.get("CIUDAD", ""),
        })
    return rows


def _rank(rows):
    out, last = [], None
    for i, r in enumerate(rows[:TOP]):
        r = dict(r)
        r["rank"] = str(i + 1) if r["mark"] != last else "="
        last = r["mark"]
        r.pop("indoor", None)
        out.append(r)
    return out


def run(http, health):
    season = str(today().year)
    out = {"generated": iso_now(), "season": season, "source": BASE + "/ranking",
           "seasons": {"AL": {"F": [], "M": []}, "PC": {"F": [], "M": []}, "RU": {"F": [], "M": []}}}
    prev = load_json("ranking.json", {}) or {}
    n = 0
    for sex in ("F", "M"):
        for key, label in event_options(http, season, sex):
            name = nice_event(label)
            if SKIP.search(name) or "mixto" in label.lower():
                continue
            short = key.endswith("::1")
            try:
                if short or INDOOR_ONLY.search(label):
                    rows = fetch(http, season, sex, key)
                    groups = {"PC": rows}
                elif BOTH.search(label):
                    rows = fetch(http, season, sex, key, count=100)
                    groups = {"AL": [r for r in rows if not r["indoor"]], "PC": [r for r in rows if r["indoor"]]}
                else:
                    rows = fetch(http, season, sex, key, count=50)
                    groups = {"AL": [r for r in rows if not r["indoor"]]}
            except Exception as e:
                health.note("ranking", "warning", "Ranking RFEA %s (%s): %s" % (name, sex, str(e)[:80]))
                continue
            for style, rows in groups.items():
                # pruebas que no son de esa temporada/sexo (heptatlón masculino al aire libre, decatlón femenino)
                if style == "AL" and ((sex == "M" and name.lower().startswith("heptatl")) or (sex == "F" and name.lower().startswith("decatl"))):
                    continue
                if any(e["event"] == name for e in out["seasons"][style][sex]):
                    continue  # la RFEA repite algunas pruebas en la lista (p. ej. "Pentatlón" y "Pentatlón ST")
                if rows:
                    out["seasons"][style][sex].append({"event": name, "rows": _rank(rows)})
                    n += 1
    # ruta: carreras (RT) y marcha en ruta (MA), con su propio ranking de la RFEA
    for sex in ("F", "M"):
        for kind in ("RT", "MA"):
            try:
                opts = event_options(http, season, sex, kind)
            except Exception as e:
                health.note("ranking", "warning", "Ranking RFEA de ruta (%s %s): %s" % (kind, sex, str(e)[:80]))
                continue
            for key, label in opts:
                name = nice_event(label)
                if kind == "MA" and "marcha" not in name.lower():
                    name += " marcha"
                if any(e["event"] == name for e in out["seasons"]["RU"][sex]):
                    continue
                try:
                    rows = fetch(http, season, sex, key)
                except Exception as e:
                    health.note("ranking", "warning", "Ranking RFEA %s (%s): %s" % (name, sex, str(e)[:80]))
                    continue
                if rows:
                    out["seasons"]["RU"][sex].append({"event": name, "rows": _rank(rows)})
                    n += 1
    if n == 0 and prev.get("seasons"):
        return 0  # la RFEA no ha respondido: se conserva el ranking anterior
    save_json("ranking.json", out)
    return n
