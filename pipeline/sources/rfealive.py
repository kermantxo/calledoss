"""RFEA Live — rfealive.info (resultados en directo de los campeonatos RFEA).

* Índice de campeonatos: la portada lista cada campeonato con su código `chid`.
* Horario de un campeonato: /Results/Schedule?chid=... (hora, prueba, ronda, estado).
* Resultados de una prueba: /Results/ResultsEvent?key=...
* Lista de salida: /Results/StartList?key=... (incluye MMP/MMT y el líder español 'LE').
"""
import re
from urllib.parse import urljoin, urlparse, parse_qs, quote

from bs4 import BeautifulSoup

from ..common import clean, parse_dmy

BASE = "https://rfealive.info"


def index(http, base=BASE):
    soup = BeautifulSoup(http.get(base + "/", timeout=90).text, "lxml")
    out, seen = [], set()
    for a in soup.find_all("a", href=True):
        q = parse_qs(urlparse(a["href"]).query)
        chid = (q.get("chid") or [None])[0]
        if not chid or chid in seen:
            continue
        seen.add(chid)
        box = a.find_parent(class_="tb-opponanet-contant") or a.parent
        city = ""
        nxt = box.find_next(string=True) if box else None
        # la ciudad va en el siguiente bloque de texto tras el nombre
        row = box.find_parent("tr") if box else None
        if row:
            cells = [clean(td.get_text(" ")) for td in row.find_all("td")]
            cells = [c for c in cells if c and c != clean(a.get_text(" "))]
            city = cells[-1] if cells else ""
        out.append({"chid": chid, "name": clean(a.get_text(" ")), "city": city, "base": base,
                    "url": base + "/Results/Schedule?chid=" + chid})
    return out


def _key(href):
    return (parse_qs(urlparse(href).query).get("key") or [None])[0]


def schedule(http, chid, base=BASE):
    """Horario completo del campeonato: lista de pruebas con fecha, hora, ronda y estado."""
    url = base + "/Results/Schedule?chid=" + chid
    soup = BeautifulSoup(http.get(url).text, "lxml")
    title = soup.find("h4", class_="section-title")
    wrap = soup.select_one(".rfep-hidden-desktop table#myTable") or soup.find("table", id="myTable")
    events = {}
    if wrap:
        for tr in wrap.find_all("tr"):
            tds = tr.find_all("td")
            if not tds:
                continue
            first = tds[0]
            tid = first.get("id") or ""
            if tid.startswith("X"):
                # fila de resumen: estado del podio (Oficial / ...)
                base_id = tid[2:]
                ev = events.get(base_id)
                if ev is not None:
                    side = tr.select_one(".side-btn span")
                    if side:
                        ev["status"] = clean(side.get_text())
                    links = {clean(a.get_text()).upper(): urljoin(base, a["href"]) for a in tr.find_all("a", href=True) if a["href"] != "#"}
                    if "L. SALIDA" in links:
                        ev["startlist_url"] = links["L. SALIDA"]
                continue
            time_el = first.select_one(".rfep-date")
            date_el = first.select_one("#eventDate") or first.find("small")
            link = tr.find("a", href=re.compile("ResultsEvent"))
            if not (time_el and link):
                continue
            rnd = tr.select_one(".rfep-champ-city")
            d = parse_dmy(date_el.get_text() if date_el else "")
            events[tid] = {
                "key": _key(link["href"]),
                "time": clean(time_el.get_text()),
                "date": d.isoformat() if d else None,
                "event": clean(link.get_text()),
                "round": clean(rnd.get_text()) if rnd else "",
                "status": "",
                "results_url": urljoin(base, link["href"].split("&")[0]),
            }
    evs = sorted(events.values(), key=lambda e: ((e["date"] or ""), e["time"]))
    return {"chid": chid, "name": clean(title.get_text()) if title else "", "url": url, "events": evs}


def _cell(td):
    a = td.find("a")
    main = clean(a.get_text(" ")) if a else clean(td.get_text(" "))
    return main


def _tables_with_names(soup):
    for t in soup.select(".rfep-hidden-mobile table") or soup.find_all("table"):
        heads = [clean(th.get_text(" ")).upper() for th in t.find_all("th")]
        if "NOMBRE" in heads:
            yield heads, t


def _records(soup):
    """Tabla RE / RC / LE (récord de España, del campeonato y líder español del año)."""
    out = []
    t = soup.find("table")
    if not t:
        return out
    for tr in t.find_all("tr"):
        cells = [clean(td.get_text(" ")) for td in tr.find_all("td")]
        if len(cells) >= 5 and cells[0] in ("RE", "RC", "LE", "MPE", "RM"):
            out.append({"code": cells[0], "name": cells[1], "date": cells[2], "place": cells[3], "mark": cells[4]})
    return out


def results(http, url):
    """Resultados de una prueba (todas las series de esa ronda en una página)."""
    soup = BeautifulSoup(http.get(url).text, "lxml")
    head = soup.find(string=re.compile("Hora Oficial"))
    status = "Oficial" if soup.find(string=re.compile(r"\bOficial\b")) else ""
    rows = []
    for heads, t in _tables_with_names(soup):
        for tr in t.find_all("tr"):
            tds = tr.find_all("td")
            if len(tds) < 6:
                continue
            c = [_cell(td) for td in tds]
            lic = tds[2].find("p")
            rows.append({
                "pos": c[0],
                "bib": c[1],
                "name": c[2].split(" | ")[0],
                "license": clean(lic.get_text()) if lic else "",
                "cat": c[3],
                "club": c[5],
                "mark": c[7] if len(c) > 7 else "",
                "note": c[8] if len(c) > 8 else "",
            })
        break  # la primera tabla con nombres es la de resultados
    return {"rows": rows, "status": status, "records": _records(soup)}


def startlist(http, url):
    soup = BeautifulSoup(http.get(url).text, "lxml")
    rows = []
    for heads, t in _tables_with_names(soup):
        idx = {h: i for i, h in enumerate(heads)}
        for tr in t.find_all("tr"):
            tds = tr.find_all("td")
            if len(tds) < 4:
                continue
            c = [_cell(td) for td in tds]

            def col(name, default=""):
                i = idx.get(name)
                return c[i] if i is not None and i < len(c) else default
            rows.append({"bib": col("DORSAL"), "name": col("NOMBRE"), "club": col("CLUB"),
                         "pb": col("MMP"), "sb": col("MMT")})
        break
    return {"rows": rows, "records": _records(soup)}


def schedule_podiums(http, chid, base=BASE):
    """Podio (top 3) de cada prueba/ronda leído directamente de la página de horario.

    Una sola petición por campeonato: cada prueba terminada muestra sus tres primeros.
    """
    url = base + "/Results/Schedule?chid=" + chid
    soup = BeautifulSoup(http.get(url).text, "lxml")
    title = soup.find("h4", class_="section-title")
    wrap = soup.select_one(".rfep-hidden-desktop table#myTable") or soup.find("table", id="myTable")
    events, order = {}, []
    if wrap:
        for tr in wrap.find_all("tr"):
            tds = tr.find_all("td")
            if not tds:
                continue
            tid = tds[0].get("id") or ""
            if tid and not tid.startswith("X"):
                link = tr.find("a", href=re.compile("ResultsEvent"))
                date_el = tds[0].select_one("#eventDate")
                rnd = tr.select_one(".rfep-champ-city")
                if link:
                    d = parse_dmy(date_el.get_text() if date_el else "")
                    events[tid] = {"event": clean(link.get_text()), "round": clean(rnd.get_text()) if rnd else "",
                                   "date": d.isoformat() if d else None, "rows": [], "status": ""}
                    order.append(tid)
            elif tid.startswith("X2"):
                ev = events.get(tid[2:])
                if ev is None:
                    continue
                for team in tr.select(".rgb-team-1"):
                    pos_el = team.select_one(".pull-left h6 a")
                    name_el = team.select_one(".text-overflow h6 a")
                    spans = team.select(".text-overflow h6 span")
                    if not (pos_el and name_el):
                        continue
                    mark = clean(spans[0].get_text()) if spans else ""
                    note = clean(spans[1].get_text()) if len(spans) > 1 else ""
                    side = team.select_one(".side-btn span")
                    if side:
                        ev["status"] = clean(side.get_text())
                    pos = clean(pos_el.get_text())
                    if pos and clean(name_el.get_text()):
                        ev["rows"].append({"pos": pos, "name": clean(name_el.get_text()).title(), "mark": mark, "note": note})
    return {"chid": chid, "name": clean(title.get_text()) if title else "", "url": url,
            "events": [events[k] for k in order]}
