"""ADOC (Asociación de Organizadores de Carreras de campo a través y de ruta, adocasociacion.es).

Su calendario se publica como imagen, así que no se lee. Lo que sí está en texto es la lista de
pruebas asociadas (una página por organización, con el nombre de la prueba). Esas pruebas ya están
en el calendario (RFEA / World Athletics) con su fecha: aquí solo se identifican para marcarlas como
ADOC. Todo con código normal (HTML); sin IA.
"""
import re

from bs4 import BeautifulSoup

from ..common import clean

BASE = "https://www.adocasociacion.es"


def members(http):
    """[{name, city, url}] de las pruebas asociadas a ADOC."""
    soup = BeautifulSoup(http.get(BASE + "/", timeout=40).text, "lxml")
    out, seen = [], set()
    for a in soup.find_all("a", href=re.compile(r"^/Organizacion/\d+/")):
        url = BASE + a["href"]
        if url in seen:
            continue
        seen.add(url)
        city = clean(a["href"].rsplit("/", 1)[-1].replace("-", " "))
        name = ""
        try:
            page = BeautifulSoup(http.get(url, timeout=40).text, "lxml")
            h1 = page.find("h1", class_="titulo")
            if h1:
                t = clean(h1.get_text(" "))
                city, _, name = t.partition("|") if "|" in t else (city, "", t)
                city, name = clean(city), clean(name)
        except Exception:
            pass
        out.append({"name": name or city, "city": city, "url": url})
    return out


# ------------------------------------------------------------------ identificar las pruebas ADOC en el calendario

GENERIC = set("cross internacional nacional carrera campo traves ciudad desde memorial trofeo".split())
# palabras de provincia/río/ciudad grande: por sí solas no identifican una prueba ("Cross Tudela de Duero" no es Aranda)
WEAK = set("duero madrid sevilla segovia palencia toledo alava bilbao donostia henares".split())


def _key_tokens(text):
    from ..common import norm
    return {t for t in re.findall(r"[a-z]+", norm(text)) if len(t) > 3 and t not in GENERIC}


def match(item, members):
    """La prueba ADOC a la que corresponde una competición del calendario, o None."""
    from ..common import norm
    n = norm(item.get("name", ""))
    toks = set(re.findall(r"[a-z]+", n))
    for m in members:
        hit = (_key_tokens(m["name"]) | _key_tokens(m["city"])) & toks
        strong = hit - WEAK
        if not strong:
            continue
        cross_m = "cross" in norm(m["name"]) or "campo a traves" in norm(m["name"])
        cross_i = "cross" in n or "krosa" in n or "campo a traves" in n or item.get("type") == "Cross"
        if cross_m and cross_i:
            return m
        if not cross_m and len(hit) >= 2:  # ruta: Santurce-Bilbao, 10K Ulía-Donostia
            return m
    return None
