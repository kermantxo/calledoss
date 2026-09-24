"""RFEA — atletismorfea.es

* Calendario: el listado mensual que usa la propia web (/ajax/calendario/...) y,
  como comprobación, el Excel oficial (/ajax/calendario/excel/<año>/Deportivo).
* Ficha de cada competición: enlaces a RFEA Live, inscritos (PDF), resultados (PDF),
  streaming, información técnica.
* Índice de resultados: /atletismo-plus/categoria/resultados (enlaces a PDFs).
"""
import datetime as dt
import io
import json
import re
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup

from ..common import MESES, clean, norm, parse_dmy, slugify, title_place, today

BASE = "https://atletismorfea.es"

DISCIPLINES = {
    "pista aire libre": "Pista Aire libre",
    "short track": "Short Track",
    "pista cubierta": "Short Track",
    "cross": "Cross",
    "ruta": "Ruta",
    "marcha": "Marcha",
    "trail running": "Trail",
    "internacional": "Internacional",
}


def _discipline(text):
    return DISCIPLINES.get(norm(text), clean(text) or "Otras")


def season_ids(http):
    r = http.get(BASE + "/calendario")
    soup = BeautifulSoup(r.text, "lxml")
    sel = soup.find("select", {"name": "season"})
    out = {}
    for o in sel.find_all("option"):
        if o.get("value") and re.fullmatch(r"\d{4}", o.get_text(strip=True)):
            out[int(o.get_text(strip=True))] = o["value"]
    if not out:
        raise RuntimeError("No encuentro el selector de temporadas en /calendario")
    return out


def _month_listing(http, year, month, season_id):
    ts = int(dt.datetime(year, month, 15, 12).timestamp())
    url = "%s/ajax/calendario/%d/Deportivo/0/0/0/0/%s/0/0/0" % (BASE, ts, season_id)
    r = http.get(url)
    cmds = r.json()
    html = "".join(c.get("data") or "" for c in cmds if c.get("command") == "insert")
    soup = BeautifulSoup(html, "lxml")
    header = soup.select_one(".calendar_pager span")
    if header:
        m = re.match(r"(\w+)\s+(\d{4})", strip_month(header.get_text(strip=True)))
        if m and m.group(1) in MESES:
            month = MESES.index(m.group(1)) + 1
            year = int(m.group(2))
    rows = []
    for day in soup.select(".calendar-day"):
        md = day.select_one(".monthday")
        if not md:
            continue
        try:
            date = dt.date(year, month, int(md.get_text(strip=True)))
        except ValueError:
            continue
        for item in day.select(".calendar-item a[href]"):
            href = item["href"]
            if "/calendario/campeonato/" not in href:
                continue
            title = item.select_one(".event__title")
            disc = item.select_one(".event__discipline")
            loc = item.select_one(".event__location")
            rows.append({
                "slug": href.rstrip("/").split("/")[-1],
                "url": urljoin(BASE, href),
                "name": clean(title.get_text()) if title else "",
                "type": _discipline(disc.get_text()) if disc else "Otras",
                "place": title_place(loc.get_text()) if loc else "",
                "date": date,
            })
    return rows


def strip_month(s):
    from ..common import strip_accents
    return strip_accents(s).lower()


def excel_rows(http, year):
    """Excel oficial: fecha(s), disciplina, competición, área, ciudad."""
    import openpyxl
    r = http.get("%s/ajax/calendario/excel/%d/Deportivo" % (BASE, year), timeout=90)
    if b"PK" not in r.content[:4]:
        raise RuntimeError("El Excel del calendario no es un .xlsx válido")
    wb = openpyxl.load_workbook(io.BytesIO(r.content), read_only=True)
    ws = wb.worksheets[0]
    out = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0 or not row or not row[0]:
            continue
        fecha, disc, comp, area, city = (list(row) + [None] * 5)[:5]
        fecha = str(fecha)
        m = re.match(r"(\d{1,2})(?:-(\d{1,2}))?/(\d{1,2})/(\d{4})", fecha)
        m2 = re.match(r"(\d{1,2})/(\d{1,2})-(\d{1,2})/(\d{1,2})/(\d{4})", fecha)
        try:
            if m2:
                d1, mo1, d2, mo2, y = (int(x) for x in m2.groups())
                start, end = dt.date(y, mo1, d1), dt.date(y, mo2, d2)
            elif m:
                d1, d2, mo, y = m.groups()
                start = dt.date(int(y), int(mo), int(d1))
                end = dt.date(int(y), int(mo), int(d2)) if d2 else None
            else:
                continue
        except ValueError:
            continue
        out.append({"date": start, "end": end, "type": _discipline(disc or ""), "name": clean(comp),
                    "area": clean(area or ""), "place": title_place(city or "")})
    return out


def calendar(http, years=None):
    """Devuelve la lista de competiciones del calendario RFEA (sin enlaces de detalle)."""
    t = today()
    ids = season_ids(http)
    if years is None:
        years = [t.year] + ([t.year + 1] if t.month >= 10 else [])
    by_slug = {}
    for y in years:
        sid = ids.get(y)
        if not sid:
            continue
        for mo in range(1, 13):
            for row in _month_listing(http, y, mo, sid):
                key = (row["slug"], row["date"].year)
                cur = by_slug.get(key)
                if not cur:
                    row["end"] = row["date"]
                    by_slug[key] = row
                else:  # la misma cita aparece en cada día que dura
                    cur["date"] = min(cur["date"], row["date"])
                    cur["end"] = max(cur["end"], row["date"])
    items = list(by_slug.values())

    # Cruce con el Excel para sacar el área (RFEA / WA / EA) y rangos de fechas
    area = {}
    for y in years:
        try:
            for x in excel_rows(http, y):
                area[(norm(x["name"]), x["date"])] = x
        except Exception:
            pass  # el Excel es solo un complemento
    for it in items:
        x = area.get((norm(it["name"]), it["date"]))
        it["area"] = x["area"] if x else ""
        if x and x.get("end") and x["end"] > it["end"]:
            it["end"] = x["end"]

    out = []
    for it in items:
        intl = it["type"] == "Internacional" or bool(re.search(r"\([A-Z]{3}\)", it["place"]))
        out.append({
            "id": "rfea-%s-%s" % (it["date"].isoformat(), it["slug"][:60]),
            "name": it["name"],
            "date": it["date"].isoformat(),
            "end_date": it["end"].isoformat() if it["end"] != it["date"] else None,
            "place": it["place"],
            "type": it["type"],
            "cat": it.get("area") or "RFEA",
            "intl": intl,
            "source": "RFEA",
            "links": {"info": it["url"]},
            "_slug": it["slug"],
        })
    return out


# ------------------------------------------------------------------ ficha

LINK_RULES = [
    ("directo", lambda t, h: "rfealive.info" in h),
    ("resultados", lambda t, h: ("resultado" in t and "directo" not in t) or "/resultados/" in h),
    ("inscritos", lambda t, h: "inscrip" in t or "inscritos" in t or "inscritos" in h.lower()),
    ("streaming", lambda t, h: "streaming" in t or "youtube.com" in h or "youtu.be" in h),
    ("horario", lambda t, h: "informacion tecnica" in t or "horario" in t or "/IT_" in h),
    ("web", lambda t, h: "sitio oficial" in t),
]


def detail(http, url):
    """Lee la ficha de una competición y devuelve sus enlaces útiles."""
    r = http.get(url)
    soup = BeautifulSoup(r.text, "lxml")
    main = soup.find("main") or soup
    for t in main(["nav", "footer", "script", "style"]):
        t.decompose()
    links = {}
    for a in main.find_all("a", href=True):
        href = urljoin(BASE, a["href"].strip())
        text = norm(a.get_text(" "))
        if href.startswith("mailto:") or "#" in href:
            continue  # anclas de la propia página (pestañas), no documentos
        for key, rule in LINK_RULES:
            if key not in links and rule(text, href):
                links[key] = href
                break
    out = {"links": links}
    if "directo" in links:
        chid = parse_qs(urlparse(links["directo"]).query).get("chid")
        if chid:
            out["rfealive_chid"] = chid[0]
    # fecha escrita en la ficha: '4 de Octubre' o 'Del 26 al 27 de Julio'
    txt = clean(main.get_text(" "))
    m = re.search(r"(?:Del\s+(\d{1,2})\s+al\s+)?(\d{1,2})\s+de\s+([A-Za-zé]+)", txt)
    if m:
        out["date_text"] = m.group(0)
    return out


# ------------------------------------------------------------------ índice de resultados

RESULTS_INDEX = BASE + "/atletismo-plus/categoria/resultados"


def results_index(http, pages=2):
    """Enlaces a PDFs de resultados publicados por RFEA (lo más reciente primero)."""
    seen, out = set(), []
    for p in range(pages):
        url = RESULTS_INDEX + ("?page=%d" % p if p else "")
        soup = BeautifulSoup(http.get(url).text, "lxml")
        main = soup.find("main") or soup
        for a in main.find_all("a", href=True):
            h = urljoin(BASE, a["href"].strip())
            if not h.lower().endswith(".pdf") or h in seen:
                continue
            if "/resultados/" not in h and "resultado" not in h.lower():
                continue
            seen.add(h)
            # busca un título cercano (la tarjeta de la noticia)
            card = a.find_parent(["article", "div"])
            title = ""
            if card:
                ttl = card.find(["h2", "h3", "h4"])
                title = clean(ttl.get_text(" ")) if ttl else ""
            out.append({"url": h, "title": title or clean(a.get_text(" "))})
    return out
