"""Plataformas de cronometraje de carreras populares, para el directo y los resultados.

Cada lector devuelve una lista de pruebas en el mismo formato:
    [{"name": "Media maratón", "sex": "F"|"M"|"", "rows": [{pos, name, club, mark}], "finished": n}]
con el podio (o las primeras posiciones) de cada prueba y sexo.

* irteerak (live.irteerak.com): API JSON en directo, con los pasos intermedios y la llegada.
* uno.es (resultados.uno.es, RaceTec): tabla HTML paginada; la carrera se busca en la lista del cronometrador.
* ChampionChip Norte (ccnorte.com): tablas HTML con el puesto por sexo ("F-1").
* AvaiBook / Runvasport / Kirolprobak: un PDF de clasificación por categoría en /resultados/.
* Chip Levante (chiplevante.com): tabla que se carga por partes (DataTables) y PDFs al terminar.
* PDFs en la web de la organización (pdfweb): uno por carrera, subido al terminarla (Cross de Zornotza).
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
            trs = re.findall(r"<tr.*?</tr>", max(tables, key=len), re.S)
            # columnas por la cabecera (UNO cambió el diseño en 2026: Pto. · Nombre · Tiempo · Categoría · Género)
            head = next((_cells(tr) for tr in trs if "Tiempo" in _cells(tr)), None)
            if head:
                i_t, i_g = head.index("Tiempo"), next((i for i, h in enumerate(head) if h in ("Género", "Sexo")), None)
                i_c = next((i for i, h in enumerate(head) if h == "Club"), None)
            for tr in trs:
                c = _cells(tr)
                if head:
                    if len(c) <= i_t or not re.match(r"^\d+$", c[1] or ""):
                        continue
                    g = re.match(r"^([MF])\b", c[i_g] or "") if i_g is not None else None
                    rows.append({"name": _nice(re.sub(r"\s*#\d+.*$", "", c[2])), "sex": g.group(1) if g else "",
                                 "club": c[i_c] if i_c is not None else "", "mark": c[i_t]})
                    got += 1
                    continue
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


# ------------------------------------------------------------------ webs de evento de CCNorte (p. ej. mic.gal)

def ccweb(http, event_url):
    """Resultados en la web propia de un evento hecha por CCNorte (mic.gal/es/web/resultado/evento-N):
    una tabla por carrera («ADULTOS FEM», «ELITE MASC»...) con puesto, nombre, apellidos, sexo y tiempo."""
    s = http.get(event_url, timeout=30).text
    comps = list(dict.fromkeys(re.findall(r'href="(/[a-z]{2}/web/resultado/competicion-\d+)"[^>]*>\s*([^<]+?)\s*<', s)))
    out = []
    for path, cname in comps:
        page = http.get(urljoin(event_url, path), timeout=30).text
        t = re.search(r"<table.*?</table>", page, re.S)
        rows = []
        for tr in re.findall(r"<tr.*?</tr>", t.group(0), re.S) if t else []:
            c = _cells(tr)
            if len(c) < 8 or not re.match(r"^\d+$", c[1]):
                continue
            sx = re.match(r"^([MF])-", c[5])
            mark = re.sub(r"^00:", "", c[7]).lstrip("0") or c[7]   # «00:05:05» -> «5:05»
            rows.append({"name": _nice("%s %s" % (c[3], c[4])), "sex": sx.group(1) if sx else "", "club": "", "mark": mark})
        nombre = clean(re.sub(r"(?i)\b(fem|masc|femenin[oa]s?|masculin[oa]s?)\b", "", html.unescape(cname))).capitalize()
        nombre = re.sub(r"^Elite\b", "Élite", nombre)
        out += _split_sex(rows, nombre or "Carrera")
    return out


# ------------------------------------------------------------------ Kronoak (kronoak.com/live)

def kronoak(http, url, name):
    """Clasificación en directo de Kronoak: JSON «aaData» (lo que pinta su tabla). Cada fila:
    dorsal, «APELLIDOS, NOMBRE», sexo, población, «(puesto) tiempo» en cada control y en meta, ...
    La lista «controles» trae la meta («HELMUGA») y los puntos intermedios: la meta va detrás de ellos.
    Devuelve (pruebas, fase) con los ya llegados a meta, ordenados por tiempo."""
    import json
    d = json.loads(http.get(url, timeout=60).content.decode("utf-8-sig"))
    inter = max(0, len(d.get("controles") or []) - 1)
    col = 4 + inter
    rows = []
    for r in d.get("aaData") or []:
        if len(r) <= col:
            continue
        m = re.match(r"^\(\d*\)\s*(\d+:\d{2}:\d{2})", r[col] or "")
        if not m:
            continue
        t = m.group(1)
        mark = re.sub(r"^0:", "", t).lstrip("0") if t.startswith("0:") else t   # «0:28:33» -> «28:33»
        rows.append({"name": _nice(r[1]), "sex": (r[2] or "").strip().upper()[:1], "club": "", "mark": mark, "_t": t})
    rows.sort(key=lambda x: [int(p) for p in x["_t"].split(":")])
    for x in rows:
        x.pop("_t")
    return _split_sex([x for x in rows if x["sex"] in ("M", "F")], name), (d.get("fase") or "").lower()


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


# ------------------------------------------------------------------ PDFs en la web de la organización

def pdfweb(http, page, pattern=""):
    """Clasificaciones en PDF que la organización sube a su web al terminar cada carrera (p. ej. cdzornotza.eus/sailkapenak):
    una tabla «puesto [orden] dorsal APELLIDOS, Nombre año club [licencia] tiempo» por carrera."""
    s = http.get(page, timeout=30).text
    links = list(dict.fromkeys(urljoin(page, h) for h in re.findall(r'href="([^"]+\.pdf)"', s, re.I) if re.search(pattern, h)))
    stem = {u: re.sub(r"\.pdf$", "", u.rsplit("/", 1)[-1].lower()) for u in links}
    toks = {u: set(stem[u].split("-")) for u in links}
    # las clasificaciones por categoría (sub18-masculina) ya van dentro de la de su carrera (sub18-sub20-masculina)
    carreras = [u for u in links if not any(v != u and toks[u] < toks[v] for v in links)]
    # lo ya leído se guarda: la web corta (HTTP 429) si se le piden todos los PDF en cada vuelta del directo
    from ..common import load_json, save_json
    cache = load_json("state/pdfweb.json", {}) or {}
    out = []
    for u in carreras:
        try:
            h = http.request("HEAD", u, retries=0, allow_redirects=False)
        except Exception:
            continue
        if h.status_code != 200:
            continue  # todavía no subido (la web redirige a su página de error)
        firma = "%s|%s" % (h.headers.get("last-modified", ""), h.headers.get("content-length", ""))
        if (cache.get(u) or {}).get("firma") == firma and firma != "|":
            rows = cache[u]["rows"]
        else:
            try:
                r = http.get(u, timeout=60, retries=0)
                if b"%PDF" not in r.content[:1024]:
                    continue
                rows = _pdfweb_rows(r.content, stem[u])
            except Exception:
                continue
            if rows:
                cache[u] = {"firma": firma, "rows": rows}
                save_json("state/pdfweb.json", cache, compact=True)
        if not rows:
            continue
        name = re.sub(r"\bsub(\d+)", r"Sub\1", stem[u].replace("-", " ")).capitalize().replace("sub", "Sub").replace("Paralimpica", "Paralímpica")
        sx = "F" if re.search(r"femen", stem[u]) else "M" if re.search(r"mascul", stem[u]) else ""
        out.append({"name": name, "sex": sx, "rows": _cut(rows), "finished": len(rows)})
    return out


def _pdfweb_rows(content, stem=""):
    """Filas de la clasificación. Las hojas de la organización a veces traen dos tablas en la misma página o
    páginas de otra carrera (2025: el final de la absoluta femenina dentro de la popular): cada tabla empieza en su
    cabecera «Pos.» y una página cuyo título no es de esta carrera (o de otro sexo) se salta."""
    import io
    import pdfplumber
    clave = next((t for t in stem.split("-") if re.match(r"absolut|popular|paral|sub\d", t)), "")
    sx = "femen" if "femen" in stem else "mascul" if "mascul" in stem else ""
    otro = {"femen": "mascul", "mascul": "femen"}.get(sx)
    rows, vistos = [], set()
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            ws = page.extract_words()
            cabs = {}  # la cabecera tiene dos «Pos.» (euskera e inglés): vale la de arriba
            for w in sorted((w for w in ws if w["text"] == "Pos."), key=lambda w: -w["top"]):
                cabs[round(w["x0"])] = w
            cabs = sorted(cabs.values(), key=lambda w: w["x0"])
            bordes = [w["x0"] - 25 for w in cabs] + [float("inf")]
            for i, cab in enumerate(cabs):
                mios = [w for w in ws if bordes[i] <= w["x0"] < bordes[i + 1]]
                titulo = norm(" ".join(w["text"] for w in mios if cab["top"] - 45 < w["top"] < cab["top"] - 5)).replace(" ", "")
                if titulo and ((clave and clave[:6] not in titulo) or (otro and otro in titulo and sx not in titulo)):
                    continue  # tabla de otra carrera o del otro sexo
                lines = {}
                for w in mios:
                    if w["top"] > cab["top"]:
                        lines.setdefault(round(w["top"]), []).append(w)
                for top in sorted(lines):
                    txt = clean(" ".join(w["text"] for w in sorted(lines[top], key=lambda w: w["x0"])))
                    m = re.match(r"^(\d+)\s+(?:\d+\s+)?\d+\s+([^\d,]+,[^\d]+?)\s+(?:19|20)\d\d\s+(.*?)\s*(\d{1,2}:\d\d(?::\d\d)?)(?:\s|$)", txt)
                    if not m or (m.group(1), m.group(2)) in vistos:
                        continue
                    vistos.add((m.group(1), m.group(2)))
                    club = re.sub(r"\s+(?:[A-Z]{1,4}-?\d+|\d{5,})$", "", m.group(3)).strip()
                    rows.append({"pos": m.group(1), "name": _nice(m.group(2)), "club": club, "mark": m.group(4)})
    rows.sort(key=lambda r: int(r["pos"]))
    return rows


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
    if not out:
        out = chiplevante_pdf(http, page, s)
    return out


def chiplevante_pdf(http, page, s=None, name=None):
    """Clasificación ya publicada en PDF (la página deja de tener la tabla en directo): la general
    trae hombres y mujeres. Se marca «pdf» para saber que es la oficial."""
    from ..parsers import pdf_columns
    s = s or http.get(page, timeout=30).text
    links = [(urljoin(page, h), clean(re.sub(r"<[^>]+>", " ", html.unescape(t))))
             for h, t in re.findall(r'<a[^>]+href="([^"]*/clasificaciones/pdfs/[^"]+)"[^>]*>(.*?)</a>', s, re.S)]
    gen = [u for u, t in links if re.search(r"(?i)general", t) and not re.search(r"(?i)local|equipo|silla|discap", t)]
    out = []
    for u in gen[:1]:
        r = http.get(u, timeout=90)
        for ev in pdf_columns.parse(r.content, full=True):
            label = ev.get("name") or ""
            sx = "F" if re.search(r"(?i)mujer|femen", label) else "M" if re.search(r"(?i)hombre|mascul", label) else ""
            for rnd in ev.get("rounds") or []:
                rows = [{k: x.get(k, "") for k in ("pos", "name", "club", "mark")} for x in rnd.get("rows") or []]
                if rows:
                    out.append({"name": name or "Carrera", "sex": sx, "rows": _cut(rows), "finished": len(rows), "pdf": True})
    return out


# ------------------------------------------------------------------ Carreiras Galegas (Federación Galega)

CGAL = "https://api.web.carreirasgalegas.com"


def cgal(http, comp):
    """Clasificación de cada carrera con resultados, por sexo (API pública de carreirasgalegas.com)."""
    hdr = {"Origin": "https://www.carreirasgalegas.com", "Referer": "https://www.carreirasgalegas.com/"}
    info = http.get("%s/competitions/%s" % (CGAL, comp), timeout=30, headers=hdr).json()
    out = []
    for race in sorted(info.get("races") or [], key=lambda r: (r.get("time") or "")):
        if not race.get("hasResults"):
            continue
        for sx, g in (("M", "male"), ("F", "female")):
            d = http.get("%s/competitions/%s/results" % (CGAL, comp), timeout=30, headers=hdr,
                         params={"raceId": race["id"], "gender": g, "first": 0, "rows": 100}).json()
            items = [x for x in d.get("items") or [] if x.get("raceId") == race["id"] and x.get("gender") == g
                     and (x.get("status") or "ok") == "ok" and x.get("time")]
            items.sort(key=lambda x: x.get("genderPosition") or 9999)
            rows = [{"pos": str(x.get("genderPosition") or i + 1),
                     "name": _nice("%s %s" % (x.get("name") or "", x.get("surname") or "")),
                     "club": clean(x.get("club") or ""), "mark": re.sub(r"^00:", "", x.get("time") or "")}
                    for i, x in enumerate(items)]
            if rows:
                n = d.get("count") or len(rows)
                out.append({"name": "10 km" if race.get("distance") == 10000 else _nice(race.get("name") or ""),
                            "sex": sx, "rows": rows if n <= COMPLETA else rows[:TOP], "finished": n})
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
    if kind == "ccweb":
        evs = ccweb(http, lv["url"])
        # definitivo cuando ya están las carreras de élite (lo último del día)
        return (evs, any("élite" in e["name"].lower() for e in evs), "ChampionChip Norte (cronometraje oficial)", lv["url"]) if evs else None
    if kind == "kronoak":
        evs, fases = [], []
        for c in lv["carreras"]:
            e, fase = kronoak(http, c["url"], c["name"])
            evs += e
            fases.append(fase)
        return (evs, bool(fases) and all(f == "final" for f in fases), "Kronoak (cronometraje oficial)", lv["web"]) if evs else None
    if kind == "avai":
        evs = avai(http, lv["url"])
        return (evs, True, "Clasificaciones oficiales (PDF)", lv["url"]) if evs else None
    if kind == "pdfweb":
        evs = pdfweb(http, lv["url"], lv.get("pattern") or "")
        return (evs, True, "Clasificaciones oficiales de la organización (PDF)", lv["url"]) if evs else None
    if kind == "cgal":
        evs = cgal(http, lv["comp"])
        return (evs, False, "Carreiras Galegas (Federación Galega de Atletismo)",
                "https://www.carreirasgalegas.com/events/%s" % lv["comp"]) if evs else None
    if kind == "chiplevante":
        evs = chiplevante(http, lv["url"])
        for e in evs:
            if e.get("pdf") and lv.get("name"):
                e["name"] = lv["name"]
        return (evs, all(e.get("pdf") for e in evs), "Chip Levante (cronometraje oficial)", lv["url"]) if evs else None
    return None


KINDS = {"irteerak", "uno", "ccnorte", "ccweb", "kronoak", "avai", "chiplevante", "cgal", "pdfweb"}
