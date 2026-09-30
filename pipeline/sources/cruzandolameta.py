"""Cruzando la Meta (cruzandolameta.es) — cronometrador de carreras de Andalucía (medias de Almería, Granada...).

Clasificación de una carrera: https://www.cruzandolameta.es/clasificaciones/v2/resultados/<carrera>/<id>/
es una tabla HTML (Pos, Pos Sexo, Nombre y Apellidos, Sexo, Club, Tiempo Oficial...). Con ?genero=1
(hombres) o ?genero=2 (mujeres) se filtra por sexo. La página /clasificaciones/v2/<carrera>/ enlaza
todas las distancias de la prueba.
"""
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from ..common import clean

BASE = "https://www.cruzandolameta.es"
RES = re.compile(r"/clasificaciones/v2/resultados/([^/]+)/(\d+)/?$")


def _table(html):
    soup = BeautifulSoup(html, "lxml")
    t = soup.find("table")
    if not t:
        return soup, [], []
    heads = [norm_h(th.get_text(" ", strip=True)) for th in t.find_all("th")]
    rows = [[td.get_text(" ", strip=True) for td in tr.find_all("td")] for tr in t.find_all("tr")]
    return soup, heads, [r for r in rows if len(r) == len(heads)]


def norm_h(h):
    return re.sub(r"\s+", " ", h.lower())


def _col(heads, *names):
    return next((heads.index(n) for n in names if n in heads), None)


def races(http, url):
    """[(url, título)] de todas las distancias de la prueba (o solo la del enlace)."""
    m = RES.search(url.split("?")[0])
    if not m:
        return []
    out = [(urljoin(BASE, m.group(0)), "")]
    try:
        html = http.get("%s/clasificaciones/v2/%s/" % (BASE, m.group(1)), timeout=40).text
        soup = BeautifulSoup(html, "lxml")
        for a in soup.find_all("a", href=RES):
            u = urljoin(BASE, a["href"])
            # el nombre está en la caja del botón "VER": 'MEDIO MARATÓN 12/04/2026 00:00 21,097 km VER'
            label = ""
            for p in a.parents:
                t = clean(p.get_text(" "))
                if len(t) > len(clean(a.get_text(" "))) + 5:
                    label = re.sub(r"\s*\d{2}/\d{2}/\d{4}.*?(?=\d+[.,]?\d*\s?km|$)", " · ", t)
                    label = clean(re.sub(r"(?i)\s*\bver\b\s*$", "", label)).strip(" ·")
                    break
            out = [x for x in out if x[0] != u] + [(u, label)]
    except Exception:
        pass
    return out[:12]


def results(http, url):
    out = []
    for u, label in races(http, url):
        for g, word in (("1", "Hombres"), ("2", "Mujeres")):
            soup, heads, rows = _table(http.get(u, params={"genero": g}, timeout=40).text)
            if not label or re.fullmatch(r"(?i)ver", label):
                h = soup.find(["h1", "h2", "h3"], string=re.compile("Resultados", re.I)) or soup.find(["h1", "h2"])
                label = re.sub(r"(?i)^resultados:\s*", "", clean(h.get_text(" "))) if h else "Carrera"
            i_name = _col(heads, "nombre y apellidos", "nombre", "atleta")
            i_time = _col(heads, "tiempo oficial", "tiempo", "tiempo real")
            i_sex = _col(heads, "sexo")
            i_psex = _col(heads, "pos sexo")
            i_club = _col(heads, "club")
            if i_name is None or i_time is None:
                continue
            want = "M" if g == "1" else "F"
            rows = [r for r in rows if re.match(r"^\d{1,2}:\d{2}(:\d{2})?", r[i_time]) and (i_sex is None or r[i_sex] == want)]
            if i_psex is not None:
                rows = sorted((r for r in rows if r[i_psex].isdigit()), key=lambda r: int(r[i_psex]))
            if not rows:
                continue
            out.append({"name": "%s %s" % (label, word), "rounds": [{"round": "General", "final": True, "rows": [
                {"pos": str(k + 1), "name": r[i_name], "club": "" if i_club is None or r[i_club] == "--" else r[i_club],
                 "mark": r[i_time]} for k, r in enumerate(rows[:3])]}]})
    return out
