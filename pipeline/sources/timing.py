"""Plataformas de cronometraje de carreras populares, para el directo y los resultados.

Cada lector devuelve una lista de pruebas en el mismo formato:
    [{"name": "Media maratón", "sex": "F"|"M"|"", "rows": [{pos, name, club, mark}], "finished": n}]
con el podio (o las primeras posiciones) de cada prueba y sexo.

* irteerak (live.irteerak.com): API JSON en directo, con los pasos intermedios y la llegada.
* uno.es (resultados.uno.es, RaceTec): tabla HTML paginada; la carrera se busca en la lista del cronometrador.
* ChampionChip Norte (ccnorte.com): tablas HTML con el puesto por sexo ("F-1").
* AvaiBook / Runvasport / Kirolprobak: un PDF de clasificación por categoría en /resultados/.
* Chip Levante (chiplevante.com): tabla que se carga por partes (DataTables) y PDFs al terminar.
"""
import html
import re
from urllib.parse import urljoin

from ..common import clean, norm

TOP = 10  # filas por prueba y sexo que se guardan en las carreras multitudinarias (Behobia, maratones...)
COMPLETA = 500  # hasta tantos llegados por prueba y sexo se guarda la clasificación entera (Berango, Higuero)


def _cut(rows):
    """Clasificación entera si la prueba es pequeña; solo los primeros si es multitudinaria."""
    return rows if len(rows) <= COMPLETA else rows[:TOP]


def _cells(tr):
    return [html.unescape(re.sub(r"<[^>]+>|\s+", " ", c)).strip() for c in re.findall(r"<t[hd][^>]*>(.*?)</t[hd]>", tr, re.S)]


def _nice(name):
    """'KOSGEY, MARK' / 'Arrospide, Iraitz' -> 'Mark Kosgey' / 'Iraitz Arrospide'."""
    name = clean(name)
    if "," in name:
        last, first = [x.strip() for x in name.split(",", 1)]
        name = "%s %s" % (first, last)
    return " ".join(w.capitalize() if w.isupper() or w.islower() else w for w in name.split())


def _split_sex(rows, name):
    out = []
    for sx in ("M", "F"):
        lst = [r for r in rows if r.get("sex") == sx]
        if lst:
            out.append({"name": name, "sex": sx, "rows": [dict(r, pos=str(i + 1)) for i, r in enumerate(_cut(lst))],
                        "finished": len(lst)})
    return out


# ------------------------------------------------------------------ irteerak

IRT = "https://live.irteerak.com"


def irteerak(http, slug, name="Carrera"):
    """Clasificación en directo: los que ya han llegado, ordenados por tiempo, por sexo."""
    return irteerak_state(http, slug, name)[0]


def irteerak_state(http, slug, name="Carrera"):
    """(pruebas, en_carrera): en_carrera = corredores con estado «en carrera» (1)."""
    d = http.get("%s/api/results/%s" % (IRT, slug), timeout=30).json()
    types, names = d.get("colTypes") or [], d.get("colNames") or []
    idx = {t: i for i, t in enumerate(types) if t not in ("checkpoint",)}
    finish = next((i for i, n in enumerate(names) if norm(n) in ("llegada", "meta", "finish", "arrivee")), None)
    rows, running = [], 0
    for r in d.get("aaData") or []:
        status = str(r[idx["status"]]) if "status" in idx else ""
        running += status == "1"
        t = r[finish] if finish is not None and finish < len(r) else ""
        if status != "0" or not t:
            continue  # aún en carrera, retirado o sin tiempo de llegada
        rows.append({"name": _nice(r[idx.get("name", 1)]), "sex": (r[idx["sex"]] or "").upper()[:1] if "sex" in idx else "",
                     "club": r[idx["location"]] if "location" in idx else "", "mark": t, "bib": r[idx.get("bib", 0)]})
    rows.sort(key=lambda x: _secs(x["mark"]))
    return _split_sex(rows, name), running


def _secs(t):
    try:
        parts = [float(p) for p in str(t).replace(",", ".").split(":")]
    except ValueError:
        return 1e9
    s = 0
    for p in parts:
        s = s * 60 + p
    return s


# ------------------------------------------------------------------ uno.es (RaceTec)

UNO = "https://resultados.uno.es/"


def uno_find(http, cid, name, date=""):
    """RId de la carrera en la lista del cronometrador (la más parecida por nombre y año)."""
    s = http.get("%sResults.aspx?CId=%s" % (UNO, cid), timeout=30).text
    want = set(norm(name).split()) - {"de", "la", "el", "ciudad", "internacional"}
    year = (date or "")[:4]
    best, score = None, 0
    for m in re.finditer(r'href="[^"]*RId=(\d+)[^"]*"[^>]*>(.*?)</a>', s, re.S):
        text = norm(re.sub(r"<[^>]+>", " ", m.group(2)))
        if year and re.search(r"\b20\d\d\b", text) and year not in text:
            continue
        sc = len(want & set(text.split()))
        if sc > score:
            best, score = m.group(1), sc
    return best if score >= 2 else None


def uno(http, cid, rid, max_pages=4):
    """Todas las pruebas de la carrera (pestañas EId): podio por sexo con el puesto por sexo de la web."""
    first = http.get("%sresults.aspx?CId=%s&RId=%s" % (UNO, cid, rid), timeout=30).text
    eids = sorted(set(int(x) for x in re.findall(r"RId=%s&(?:amp;)?EId=(\d+)" % rid, first))) or [1]
    tabs = dict(re.findall(r'EId=(\d+)"[^>]*>\s*([^<]{2,40}?)\s*<', first))
    out = []
    for eid in eids:
        label = clean(tabs.get(str(eid), "")) or "Prueba %d" % eid
        rows = []
        for page in range(1, max_pages + 1):
            s = http.get("%sresults.aspx?CId=%s&RId=%s&EId=%d&dt=0&PageNo=%d" % (UNO, cid, rid, eid, page), timeout=30).text
            tables = re.findall(r"<table.*?</table>", s, re.S)
            if not tables:
                break
            got = 0
            for tr in re.findall(r"<tr.*?</tr>", max(tables, key=len), re.S):
                c = _cells(tr)
                if len(c) < 10 or not re.match(r"^\d+$", c[1] or ""):
                    continue
                g = re.match(r"^([MF])\b", c[9] or "")
                rows.append({"name": _nice(re.sub(r"\s*#\d+.*$", "", c[3])), "sex": g.group(1) if g else "",
                             "club": c[10] if len(c) > 10 else "", "mark": c[5]})
                got += 1
            if not got or (sum(1 for r in rows if r["sex"] == "F") >= 3 and sum(1 for r in rows if r["sex"] == "M") >= 3):
                break
        if rows:
            out += _split_sex(rows, label)
    return out


# ------------------------------------------------------------------ ChampionChip Norte

CCN = "https://ccnorte.com"


def ccnorte_find(http, words):
    """Carreras (pruebas) de un evento de la lista de resultados: [(nombre, url)]."""
    s = http.get(CCN + "/resultados", timeout=30).text
    want = [norm(w) for w in words]
    races = {}
    for m in re.finditer(r'href="(/resultados/([a-z0-9-]+)/([a-z0-9-]+)/1)"', s):
        if all(w in m.group(2) for w in want):
            races[m.group(3)] = CCN + m.group(1)
    return list(races.items())


def ccnorte(http, races, max_pages=5):
    out = []
    for slug, url in races:
        rows = []
        for page in range(1, max_pages + 1):
            s = http.get(re.sub(r"/1$", "/%d" % page, url), timeout=30).text
            t = re.search(r"<table.*?</table>", s, re.S)
            if not t:
                break
            got = 0
            for tr in re.findall(r"<tr.*?</tr>", t.group(0), re.S):
                c = _cells(tr)
                if len(c) < 7 or not re.match(r"^\d+$", c[0]):
                    continue
                sx = re.match(r"^([MF])-\d+", c[4])
                rows.append({"name": _nice("%s %s" % (c[2], c[3])), "sex": sx.group(1) if sx else "", "club": "", "mark": c[-1]})
                got += 1
            if not got or (sum(1 for r in rows if r["sex"] == "F") >= 3 and sum(1 for r in rows if r["sex"] == "M") >= 3):
                break
        out += _split_sex(rows, slug.replace("-", " ").capitalize())
    return out


# ------------------------------------------------------------------ AvaiBook / Runvasport / Kirolprobak

def avai(http, page):
    """PDFs de clasificación publicados en /resultados/ (uno por categoría o distancia)."""
    from ..parsers import pdf_columns
    s = http.get(page, timeout=30).text
    links = list(dict.fromkeys(urljoin(page, h) for h in re.findall(r'href="([^"]*/resultados/[^"]+)"', s)))
    general = [u for u in links if "general" in u.lower()] or links
    out = []
    for u in general[:30]:
        try:
            r = None
            # AvaiBook enlaza los PDF en su dominio, pero a veces solo los sirve Runvasport o Kirolprobak
            for host in (None, "inscripciones.runvasport.es", "inscripcion.kirolprobak.com", "www.avaibooksports.com"):
                try:
                    r = http.get(re.sub(r"^https?://[^/]+", "https://" + host, u) if host else u, timeout=90, retries=0)
                except Exception:
                    r = None
                if r is not None and b"%PDF" in r.content[:1024]:
                    break
            if r is None or b"%PDF" not in r.content[:1024]:
                continue
            for ev in pdf_columns.parse(r.content, full=True):
                label = ev.get("name") or u.rsplit("/", 1)[-1].replace("-", " ")
                for rnd in ev.get("rounds") or []:
                    sx = "F" if re.search(r"femen|mujer", (label + " " + (rnd.get("round") or "")), re.I) else \
                        "M" if re.search(r"mascul|hombre", (label + " " + (rnd.get("round") or "")), re.I) else ""
                    rows = [{k: x.get(k, "") for k in ("pos", "name", "club", "mark")} for x in rnd.get("rows") or []]
                    for x in rows:  # licencia pegada al apellido («Zurutuza Renom Ss-3719028-a-n-s»)
                        x["name"] = re.sub(r"\s+[A-Za-z]{1,3}-?\d{3,}[\w-]*$", "", x["name"])
                    if rows:
                        out.append({"name": label, "sex": sx, "rows": _cut(rows), "finished": len(rnd.get("rows") or [])})
        except Exception:
            continue
    return out


# ------------------------------------------------------------------ Chip Levante

CHL = "https://www.chiplevante.com"


def chiplevante(http, page):
    """Clasificación por sexo de cada carrera de la página de la prueba (tabla DataTables)."""
    s = http.get(page, timeout=30).text
    out = []
    for n, (dt, url) in enumerate(re.findall(r'(dt_clasificaciones\d+)"\)\.DataTable\(\{.*?url:\s*"([^"]+)"', s, re.S)):
        title = re.search(r'id="%s".*?' % dt, s)
        for sx, flag in (("M", "hombres"), ("F", "mujeres")):
            data = {"draw": "1", "start": "0", "length": str(TOP), "search[value]": "", "search[regex]": "false",
                    "order[0][column]": "1", "order[0][dir]": "asc", "hombres": "1" if flag == "hombres" else "0",
                    "mujeres": "1" if flag == "mujeres" else "0", "locales": "0", "discapacitados": "0", "categorias": "", "clubes": ""}
            for i, col in enumerate(("", "pos", "dorsal", "nombre", "tiempo", "btn")):
                data["columns[%d][data]" % i] = col
            try:
                j = http.request("POST", urljoin(CHL, url), data=data, headers={"X-Requested-With": "XMLHttpRequest", "Referer": page}).json()
            except Exception:
                continue
            rows = [{"pos": str(i + 1), "name": _nice(re.sub(r"<[^>]+>", " ", r.get("nombre") or "")),
                     "club": "", "mark": re.sub(r"<[^>]+>", "", r.get("tiempo") or "")} for i, r in enumerate(j.get("data") or [])]
            if rows:
                out.append({"name": "Carrera %d" % (n + 1), "sex": sx, "rows": rows, "finished": j.get("recordsFiltered") or len(rows)})
    return out


# ------------------------------------------------------------------ común

SEX_WORD = re.compile(r"mascul|femen|hombre|mujer|\bmen\b|women", re.I)


def label(e):
    """Nombre de la prueba con el sexo, si no lo lleva ya («Élite Masculino» se queda igual)."""
    sex = {"M": "Hombres", "F": "Mujeres"}.get(e.get("sex"), "")
    return e["name"] if not sex or SEX_WORD.search(e["name"]) else "%s %s" % (e["name"], sex)


def to_store(events, round_name="Final"):
    """Formato de results.store: una prueba por nombre y sexo, con su clasificación como ronda final."""
    out = []
    for e in events:
        out.append({"name": label(e), "sex": e.get("sex", ""),
                    "rounds": [{"round": round_name, "final": True, "rows": e["rows"]}]})
    return out


def poll(http, lv, it):
    """Consulta una fuente de cronometraje (entrada «live» del calendario).
    Devuelve (pruebas, definitivo, nombre_fuente, url) o None si la fuente no tiene nada todavía."""
    kind = lv.get("kind")
    name = lv.get("name") or "Carrera"
    if kind == "irteerak":
        evs, running = irteerak_state(http, lv["slug"], name)
        return (evs, bool(evs) and running == 0, "irteerak (cronometraje oficial)",
                "%s/results.html?id=%s" % (IRT, lv["slug"])) if evs else None
    if kind == "uno":
        rid = lv.get("rid") or uno_find(http, lv["cid"], lv.get("search") or it["name"], it["date"])
        if not rid:
            return None
        evs = uno(http, lv["cid"], rid)
        return (evs, True, "UNO crono (cronometraje oficial)", "%sResults.aspx?CId=%s&RId=%s" % (UNO, lv["cid"], rid)) if evs else None
    if kind == "ccnorte":
        races = ccnorte_find(http, lv["words"])
        evs = ccnorte(http, [r for r in races if not lv.get("races") or r[0] in lv["races"]]) if races else []
        return (evs, True, "ChampionChip Norte (cronometraje oficial)", races[0][1]) if evs else None
    if kind == "avai":
        evs = avai(http, lv["url"])
        return (evs, True, "Clasificaciones oficiales (PDF)", lv["url"]) if evs else None
    if kind == "chiplevante":
        evs = chiplevante(http, lv["url"])
        return (evs, False, "Chip Levante (cronometraje oficial)", lv["url"]) if evs else None
    return None


KINDS = {"irteerak", "uno", "ccnorte", "avai", "chiplevante"}
