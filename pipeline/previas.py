"""PREVIAS: en cuanto se publica la lista de inscritos de una competición del calendario,
se eligen sus atletas destacados por prueba y sexo, con criterios objetivos (sin IA):

  60  plusmarquista (récord de España / del campeonato que aparece en la propia lista)
  50  campeón/a de España 2026         (de nuestros resultados)
  45  líder español del año            (RFEA Live 'LE' o ranking)
  40  internacional con España 2026    (de nuestros resultados)
  30  medalla en un Campeonato de España 2026
  25/18/12  1ª/2ª/3ª mejor marca del año entre los inscritos de esa prueba
  15/10/6   1ª/2ª/3ª mejor marca personal entre los inscritos
  20  sale en el cajón / grupo de élite
   8/5 ganador / podio en otra competición de 2026
 +10  español (en listas internacionales)

Se revisan cada día las competiciones de los próximos 45 días. Si la lista cambia se apuntan
las altas y bajas. Si no hay lista: "inscritos no publicados aún" y se sigue revisando.
Salida: previas.json
"""
import datetime as dt
import re
from urllib.parse import urljoin, urlparse, parse_qs, unquote

from bs4 import BeautifulSoup

from . import athletes as A
from .common import load_json, norm, save_json, today, iso_now, clean
from .highlights import FIELD, _mark_value
from .names import clean_name, sex_from_first_name
from .parsers import pdf_columns, pdf_results
from .sources import rfealive, timers

DAYS_AHEAD = 45
PER_SEX = 6
MIN_SCORE = 20
# Carreras populares: si menos de 3 atletas de un sexo llegan a MIN_SCORE, se completa hasta 3 con los que
# tengan al menos MIN_SCORE_LOCAL por méritos reales (una victoria y un podio, o dos podios en otras carreras)
MIN_SCORE_LOCAL = 10
LOCAL_FILL = 3
LIST_WORDS = re.compile(r"inscrit|participant|listado|start ?list|lista de salida|entry ?list|dorsales|admitid", re.I)
ELITE = re.compile(r"\b(é|e)lite\b|caj[oó]n a\b|cajon a\b|grupo 1\b", re.I)


# ------------------------------------------------------------------ fuentes de inscritos

def from_rfealive(http, chid, base=rfealive.BASE):
    sc = rfealive.schedule(http, chid, base=base)
    out = []
    for ev in sc["events"]:
        url = ev.get("startlist_url") or ev["results_url"].replace("ResultsEvent", "StartList")
        try:
            sl = rfealive.startlist(http, url)
        except Exception:
            continue
        if not sl["rows"]:
            continue
        le = [r["name"] for r in sl["records"] if r["code"] == "LE"]
        rec = [r["name"] for r in sl["records"] if r["code"] in ("RE", "RC")]
        for r in sl["rows"]:
            out.append({"event": ev["event"], "round": ev["round"], "time": ev.get("time"), "date": ev.get("date"),
                        "name": r["name"], "club": r.get("club", ""), "pb": r.get("pb", ""), "sb": r.get("sb", ""),
                        "le": any(A.key(x) <= A.key(r["name"]) or A.key(r["name"]) <= A.key(x) for x in le if x),
                        "record": any(A.key(x) <= A.key(r["name"]) for x in rec if x)})
    return out


def from_rfea_pdf(http, url):
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    return [{"event": r["event"], "name": r["name"], "club": r.get("club", ""), "sb": r.get("mark", ""),
             "nat": r.get("nat", "")} for r in pdf_results.parse_startlist(c)]


def from_timingsys(http, event_id):
    """Cronomancha/Timingsys: se leen SOLO los datos que la web muestra (nombre, sexo, categoría, club).
    La respuesta trae además datos personales (teléfono, email, DNI...) que NO se guardan ni se usan."""
    r = http.get("https://timingsys.com/event/%s/participants?draw=1&start=0&length=5000" % event_id,
                 headers={"X-Requested-With": "XMLHttpRequest", "Accept": "application/json"})
    out = []
    for p in (r.json() or {}).get("data", []):
        name = clean("%s %s" % (p.get("firstname") or "", p.get("lastname") or ""))
        sex = {"male": "M", "female": "F"}.get((p.get("sex") or "").lower(), "")
        out.append({"event": clean(p.get("modality") or "Carrera"), "name": name, "sex": sex,
                    "club": clean(p.get("club") or ""), "cat": clean(p.get("category") or ""), "popular": True, "text": name})
    return out



def from_321go(http, race_slug):
    """321go (live.321go.es/participantes.html?raceID=...): listado público de participantes.
    Solo trae nombre, apellidos, dorsal y club; se usa la carrera principal (la primera modalidad)."""
    base = "https://live.321go.es/api/"
    cat = http.get(base + "eventos.php", timeout=60).json()
    race = next((x for x in cat.get("items", []) if x.get("SlugCarreraCopernico") == race_slug), None)
    if not race:
        return []
    evs = [e for e in race.get("Eventos") or [] if (e.get("VisualizarParticipantes") or "").lower().startswith("s")]
    if not evs:
        return []
    ev = evs[0]["Nombre del evento"]
    if (race.get("CopernicoLiveActivo") or "").lower().startswith("s"):
        r = http.get(base + "copernico_live.php", params={"raceID": race_slug, "eventName": ev, "action": "participants"}, timeout=90)
    else:
        r = http.get(base + "participants_proxy.php", params={"raceID": race_slug, "eventName": ev}, timeout=90)
    out = []
    for p in (r.json() or {}).get("rows", []):
        name = clean_name(clean("%s %s" % (p.get("name") or "", p.get("surname") or "")))[0]
        if not name:
            continue
        # sin dorsal: con «bib» bastaría nombre y un apellido para dar por bueno al atleta, y aquí están completos
        # «exacto»: nombre y apellidos vienen separados y en orden, así que el atleta tiene que coincidir palabra
        # por palabra y en el mismo orden (Óscar Rodríguez Martínez no es Óscar Martínez Rodríguez)
        out.append({"event": _event_label(ev), "name": name, "sex": "", "club": clean(p.get("club") or ""), "cat": "",
                    "popular": True, "exacto": True, "text": name})
    return out


RFEA_LIC = re.compile(r"^[A-Z]{1,3}-?\d{2,7}(?:-[A-Za-z](?:-[A-Za-z]){2,3})?$")


def rfea_inscritos_pdf_url(http, info_url):
    """Ficha de la RFEA (atletismorfea.es/calendario/campeonato/...): enlace al PDF «Listado de inscritos»
    que la propia ficha carga en su pestaña INSCRITOS. None si aún no hay inscritos."""
    if "atletismorfea.es/calendario/campeonato/" not in (info_url or ""):
        return None
    m = re.search(r'href="#c_e_accordion_enrolled"[^>]*data-sfid="(\w+)"', http.get(info_url, timeout=30).text)
    if not m:
        return None
    r = http.get("https://atletismorfea.es/championship-inscritos/%s/0/1?_wrapper_format=drupal_ajax" % m.group(1),
                 headers={"X-Requested-With": "XMLHttpRequest"}, timeout=30)
    html = " ".join(c.get("data") or "" for c in r.json() if isinstance(c.get("data"), str))
    if "No hay resultados" in html:
        return None
    pdf = re.search(r'href="(/calendario/competicion/pdf/\d+)"', html)
    return "https://atletismorfea.es" + pdf.group(1) if pdf else None


def from_rfea_inscritos_pdf(http, url):
    """PDF «Listado de inscritos» de la RFEA: una tabla por prueba (Marca, Licencia, Atleta, País, Fecha de
    nacimiento, Club, Fecha, Lugar, MMP, MMT). Nombre y club pueden ocupar dos líneas, así que se lee por
    la posición de cada palabra. Primero van las pruebas masculinas y luego las femeninas: cuando se repite
    el nombre de una prueba, empiezan las mujeres. Los relevos no se usan."""
    import io
    import pdfplumber
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    out, event, sex, seen, cols = [], None, "M", set(), None
    with pdfplumber.open(io.BytesIO(c)) as pdf:
        for page in pdf.pages:
            ws = page.extract_words(extra_attrs=["size", "fontname"])
            # título de prueba: letra algo más grande que la tabla (12,9 frente a 11) y en negrita
            for w in ws:
                if 12 < w["size"] < 14 and "Bold" in w["fontname"]:
                    w["title"] = True
            lines = {}
            for w in ws:
                lines.setdefault(round(w["top"]), []).append(w)
            anchors = []
            for top in sorted(lines):
                lw = sorted(lines[top], key=lambda w: w["x0"])
                if all(w.get("title") for w in lw):
                    t = clean(" ".join(w["text"] for w in lw))
                    if t in seen and sex == "M":
                        sex = "F"
                    seen.add(t)
                    event = t
                    continue
                txt = [w["text"] for w in lw]
                if "Licencia" in txt and "Atleta" in txt:
                    hx = {w["text"]: w for w in lw}
                    club_end = next((w["x0"] for w in lw if w["text"] == "Fecha" and w["x0"] > hx["Club"]["x0"]), 1e9)
                    cols = {"lic": hx["Licencia"]["x0"] - 40, "name": hx["Atleta"]["x0"] - 60,
                            "nat": hx["País"]["x0"] - 5, "club": hx["País"]["x1"] + 100, "club_end": club_end - 5}
                    continue
                if not cols or not event:
                    continue
                lic = next((w for w in lw if cols["lic"] <= w["x0"] < cols["name"] and RFEA_LIC.match(w["text"])), None)
                if lic:
                    anchors.append({"top": lic["top"], "lic": lic, "event": event, "sex": sex, "words": []})
            if not cols:
                continue
            # cada palabra de nombre o club va con la fila (licencia) más cercana en vertical
            for w in ws:
                if w.get("title") or not anchors:
                    continue
                a = min(anchors, key=lambda a: abs(a["top"] - w["top"]))
                if abs(a["top"] - w["top"]) <= 12:
                    a["words"].append(w)
            for a in anchors:
                if a["event"].lower().startswith("4x"):
                    continue
                aw = sorted(a["words"], key=lambda w: (round(w["top"]), w["x0"]))
                name = " ".join(w["text"] for w in aw if cols["name"] <= w["x0"] < cols["nat"] and w is not a["lic"]
                                and not RFEA_LIC.match(w["text"]))
                club = " ".join(w["text"] for w in aw if cols["club"] <= w["x0"] < cols["club_end"]
                                and not re.match(r"^\d{1,2}/\d{1,2}/\d{4}$", w["text"]))
                nat = next((w["text"] for w in aw if cols["nat"] <= w["x0"] < cols["nat"] + 30 and re.match(r"^[A-Z]{3}$", w["text"])), "")
                mark = next((w["text"] for w in aw if w["x0"] < cols["lic"] and re.match(r"^[\d:.,]+$", w["text"])
                             and abs(w["top"] - a["top"]) < 3), "")
                # «APELLIDOS NOMBRE»: si ocupa dos líneas, la de arriba son los apellidos y la de abajo el nombre
                above = [w["text"] for w in aw if cols["name"] <= w["x0"] < cols["nat"] and w["top"] < a["top"] - 3]
                below = [w["text"] for w in aw if cols["name"] <= w["x0"] < cols["nat"] and w["top"] > a["top"] + 3]
                if above and below:
                    name = " ".join(below + above)
                elif len(name.split()) >= 2:  # en una línea: dos apellidos (uno si solo hay dos palabras) y el nombre
                    t = name.split()
                    k = 2 if len(t) >= 3 else 1
                    name = " ".join(t[k:] + t[:k])
                name = clean_name(name.title(), nat)[0]
                if name:
                    # sin «nat»: son listas de competiciones en España y un extranjero no la convierte en internacional
                    out.append({"event": a["event"], "name": name, "sex": a["sex"], "club": clean(club),
                                "sb": mark, "popular": False, "text": name})
    return out

# Lista de inscritos de la RFEA ordenada por categoría (p. ej. Campeonato de España Máster de Campo a Través):
#   «Carrera M35 (5500 m) - 13:40» y debajo «M35 NO 38,22 TO-3951035 Jonathan Paz Madroño ESP 18/11/1987 26millas MATICAL»
RFEA_CAT_HEAD = re.compile(r"^(?:Carrera\s+)?(.+?\(\d+\s?m\))\s+-\s+(\d{1,2}:\d{2})\s*$")
RFEA_CAT_ROW = re.compile(r"^(\S+)\s+(\S+)\s+(\d+),\d+\s+(\S+)\s+(.+?)\s+([A-Z]{3})\s+\d{1,2}/\d{1,2}/\d{4}\s*(.*)$")


def from_rfea_category_pdf(http, url):
    import io
    import pdfplumber
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    out, event, time = [], None, None
    with pdfplumber.open(io.BytesIO(c)) as pdf:
        for page in pdf.pages:
            for line in (page.extract_text() or "").split("\n"):
                line = clean(line)
                h = RFEA_CAT_HEAD.match(line)
                if h:
                    event, time = h.group(1), h.group(2)
                    continue
                m = RFEA_CAT_ROW.match(line)
                if m and event:
                    cat, age = m.group(1), int(m.group(3))
                    # en los relevos la 2.ª columna es el sexo (M/F); en el resto, la categoría lo dice (M35, F40...)
                    sex = m.group(2) if m.group(2) in ("M", "F") else \
                        next((x[0] for x in (cat, m.group(2), event) if re.match(r"^[MF]\d", x)), "")
                    solo_equipo = cat == "NO"  # inscrito solo para puntuar por equipos: no opta a medalla individual
                    if not re.match(r"^[MF]\d{2}$", cat) and sex and not event.startswith("Relevo"):
                        cat = "%s%d" % (sex, max(35, age // 5 * 5))  # su categoría por edad
                    out.append({"event": event, "name": m.group(5), "sex": sex, "club": m.group(7), "cat": cat,
                                "nat": m.group(6), "time": time, "popular": False, "text": m.group(5),
                                "solo_equipo": solo_equipo})
    return out


def _prev_pdf_podiums(http, url):
    """Clasificación de la edición anterior en PDF (formato Runvasport): «SUB 16 (2010-2011) CLASIFICACIÓN»,
    secciones MASCULINO / FEMENINO y filas «1 103 5,05 APELLIDOS NOMBRE CLUB POBLACIÓN».
    Devuelve [(texto_de_la_fila, puesto, categoría, sexo)] con el podio de cada categoría y sexo."""
    import io
    import pdfplumber
    c = http.get(url, timeout=120).content
    out, cat, sex = [], None, None
    with pdfplumber.open(io.BytesIO(c)) as pdf:
        for page in pdf.pages:
            for line in (page.extract_text() or "").split("\n"):
                line = clean(line)
                m = re.match(r"^(.+?)\s+CLASIFICACI", line)
                if m:
                    cat, sex = re.sub(r"\s*\(.*?\)", "", m.group(1)).strip(), ""
                    continue
                if line.upper() in ("MASCULINO", "FEMENINO"):
                    sex = line[0].upper()
                    continue
                r = re.match(r"^\d+\s+\d+\s+\d+[,:.]\d+\s+(.+)$", line)
                if r and cat:
                    # sin sección de sexo: el nombre lo dice; si no se reconoce, cuenta como hombre (las listas
                    # populares mixtas son mayoritariamente masculinas y así no se adelanta a nadie en el podio femenino)
                    out.append([r.group(1), None, cat, sex or _sex_of_line(r.group(1)) or "M"])
    return out


def _sex_of_line(text):
    """Sexo de una fila «APELLIDOS NOMBRE CLUB» sin sección de sexo: el primer nombre de pila reconocible."""
    for w in text.split()[:5]:
        s = sex_from_first_name(w)
        if s:
            return s
    return ""


def _name_in_row(name, text):
    """¿La fila «APELLIDOS NOMBRE CLUB...» es de este inscrito «NOMBRE APELLIDOS»?"""
    w = norm(name).split()
    t = norm(text).split()
    for k in (1, 2, 3):
        if len(w) > k and t[:len(w)] == w[k:] + w[:k]:
            return True
    return False


def mark_previous_podium(http, rows, prev):
    """Marca a los inscritos que fueron medallistas en la edición anterior (resultados oficiales).
    prev = {"rfealive": "2025AND60991", "base": "https://rfealive.info", "nombre": "Cto. de España Máster de Cross 2025"}
    o {"pdf": url, "nombre": "Milla Urbana de Valladolid 2025"} (clasificación en PDF de Runvasport)."""
    ords = {1: ("Campeón del", "Campeona del"), 2: ("Subcampeón del", "Subcampeona del"), 3: ("Bronce en el", "Bronce en el")}
    if prev.get("pdf"):
        lines = _prev_pdf_podiums(http, prev["pdf"])
        # puesto de cada fila dentro de su categoría y sexo (las secciones sin sexo se reparten por el nombre)
        hits = {}
        for r in rows:
            for txt, _, cat, sex in lines:
                if _name_in_row(r.get("name", ""), txt):
                    hits[id(r)] = (txt, cat, sex)
                    break
        order = {}
        for txt, _, cat, sex in lines:
            order.setdefault((cat, sex), []).append(txt)
        out = []
        for r in rows:
            h = hits.get(id(r))
            if h:
                txt, cat, sex = h
                pool = order.get((cat, sex)) or []
                pos = pool.index(txt) + 1 if txt in pool else 99
                if pos <= 3:
                    who = "Ganadora" if sex == "F" else "Ganador"
                    title = "%s de" % who if pos == 1 else "%d%s en" % (pos, "ª" if sex == "F" else "º")
                    r = dict(r, prev_reason="%s %s (%s)" % (title, prev["nombre"], cat.title()), prev_score=(40, 30, 25)[pos - 1],
                             sex=r.get("sex") or sex)
            out.append(r)
        return out
    sc = rfealive.schedule(http, prev["rfealive"], base=prev.get("base") or rfealive.BASE)
    medals = {}
    for ev in sc["events"]:
        if prev.get("solo", "Individual") not in ev["event"]:
            continue
        cat = ev["event"].split()[0]
        for r in rfealive.results(http, ev["results_url"])["rows"][:3]:
            if r.get("pos") in ("1", "2", "3"):
                medals.setdefault(A.key(clean_name(r["name"])[0]), (int(r["pos"]), cat))
    out = []
    for r in rows:
        k = A.key(clean_name(r.get("name", ""))[0])
        hit = medals.get(k) or next((v for kk, v in medals.items() if kk <= k or k <= kk), None)
        if hit and not r.get("event", "").startswith("Relevo"):
            pos, cat = hit
            title = ords[pos][1 if r.get("sex") == "F" else 0]
            r = dict(r, prev_reason="%s %s (%s)" % (title, prev["nombre"], cat), prev_score=(40, 30, 25)[pos - 1])
        out.append(r)
    return out


def from_pdf_entries(http, url):
    c = http.get(url, timeout=120).content
    if b"%PDF" not in c[:1024]:
        return []
    rows = pdf_columns.parse_entries(c)
    return [{"event": r["section"] or "Carrera", "name": r["name"], "sex": r["sex"], "club": r["club"],
             "cat": r["cat"], "sb": r["mark"], "elite": bool(ELITE.search(r["text"])), "popular": not r["mark"],
             "text": r["text"]} for r in rows]


def list_links(http, page, depth=1):
    """PDFs de inscritos enlazados desde una página (y desde su sección 'Listado de inscritos')."""
    try:
        r = http.get(page, timeout=30)
    except Exception:
        return []
    if "html" not in (r.headers.get("content-type") or ""):
        return []
    soup = BeautifulSoup(r.text, "lxml")
    pdfs, pages = [], []
    for a in soup.find_all("a", href=True):
        h = urljoin(r.url, a["href"].strip())
        txt = clean(a.get_text(" ")) + " " + (a.get("title") or "")
        if not LIST_WORDS.search(txt + " " + h):
            continue
        if h.lower().split("?")[0].endswith(".pdf"):
            pdfs.append(h)
        elif depth > 0 and urlparse(h).netloc == urlparse(r.url).netloc and h != r.url:
            pages.append(h)
    for p in pages[:3]:
        pdfs += list_links(http, p, depth - 1)
    return list(dict.fromkeys(pdfs))[:6]


def _load_extra_entries():
    import json, os
    try:
        with open(os.path.join(os.path.dirname(__file__), "extra_entries.json"), encoding="utf-8") as f:
            return {k: v for k, v in json.load(f).items() if not k.startswith("_")}
    except Exception:
        return {}


EXTRA_ENTRIES = _load_extra_entries()


def _race_of(cuota):
    """'Sub14 Femenino (2012 - 2013)' -> 'Sub14'; 'Popular - Senior Federadas Masc' -> 'Popular - Senior Federadas'."""
    c = re.sub(r"\(.*?\)", "", cuota or "")
    c = re.sub(r"(?i)\b(femenin[oa]s?|masculin[oa]s?|masc|fem|mujeres|hombres|chicas|chicos)\b\.?", "", c)
    return clean(c).strip(" -") or "Carrera"


ONLY_F = re.compile(r"\b(mujer(es)?|femenin[oa]s?|iberdrola|women|feminina|dones)\b", re.I)
ONLY_M = re.compile(r"\b(hombres|masculin[oa]s?|joma|men)\b", re.I)


def only_sex(name):
    """'F' o 'M' si la competición es de un solo sexo por su nombre (igual que expectedSexes() de la web)."""
    f, m = bool(ONLY_F.search(name or "")), bool(ONLY_M.search(name or ""))
    return "F" if f and not m else "M" if m and not f else ""


def _old_year(url, date):
    """¿El documento lleva en el nombre solo años anteriores al de la competición?"""
    years = [int(y) for y in re.findall(r"(?<!\d)(20\d\d)(?!\d)", unquote(url))]
    return bool(years) and max(years) < int(date[:4])


def find_entries(http, it):
    """Devuelve (filas, fuentes) de la lista de inscritos de una cita, o ([], []) si no hay."""
    links = it.get("links") or {}
    tried = []
    for lv in it.get("live") or []:
        if lv.get("kind") == "rfealive":
            base = lv.get("base") or rfealive.BASE  # rfealive.info o rfealive.me (federaciones autonómicas)
            try:
                rows = from_rfealive(http, lv["chid"], base=base)
                if rows:
                    return rows, [base + "/Results/Schedule?chid=" + lv["chid"]]
            except Exception:
                pass
        if lv.get("kind") == "timingsys":
            try:
                rows = from_timingsys(http, lv["event"])
                if rows:
                    return rows, ["https://timingsys.com/event/%s/participants" % lv["event"]]
            except Exception:
                pass
    # 321go: listado público de participantes (live.321go.es/participantes.html?raceID=...)
    for v in links.values():
        m = re.search(r"321go\.es/participantes\.html\?raceID=([\w-]+)", v or "")
        if m:
            try:
                rows = from_321go(http, m.group(1))
                if rows:
                    return rows, [v]
            except Exception:
                pass
    # ficha de la RFEA: su pestaña INSCRITOS tiene el PDF oficial
    try:
        pdf = rfea_inscritos_pdf_url(http, links.get("info"))
        rows = from_rfea_inscritos_pdf(http, pdf) if pdf else []
        if rows:
            return rows, [pdf]
    except Exception:
        pass
    # plataforma de inscripción tipo AvaiBook (Kirolprobak...): enlazada en la ficha o en la web oficial
    insc = next((timers.inscripcion_url(v) for v in links.values() if timers.inscripcion_url(v)), None)
    if not insc:
        for p in (links.get("web"), links.get("info")):
            if p and not p.lower().endswith(".pdf"):
                try:
                    insc = timers.inscripcion_url(http.get(p, timeout=30).text)
                except Exception:
                    insc = None
                if insc:
                    break
    # Rockthesport: nombre + primer apellido + dorsal; los dorsales bajos son la élite
    rts, page_html = None, {}
    for k, v in links.items():
        rts = rts or timers.rockthesport_url(v)
    if not rts and not insc:
        for p in (links.get("web"),):
            if p and not p.lower().endswith(".pdf"):
                try:
                    page_html[p] = http.get(p, timeout=30).text
                    rts = timers.rockthesport_url(page_html[p])
                except Exception:
                    pass
    if rts:
        try:
            rows = timers.rockthesport_participants(http, rts)
            if rows:
                return [{"event": "Carrera", "name": r["name"], "sex": "", "club": "", "cat": "", "bib": r["bib"],
                         "elite": r["bib"] <= 50, "popular": False, "text": r["name"]} for r in rows], [rts]
        except Exception:
            pass
    if insc:  # Kirolprobak, AvaiBook, Runvasport...: listado público de participantes
        try:
            rows = timers.inscripcion_participants(http, insc)
            if rows:
                return [{"event": _race_of(r["cat"]), "name": r["name"], "sex": r["sex"], "club": "", "cat": r["cat"],
                         "popular": True, "text": r["name"]} for r in rows], [insc + "participantes/"]
        except Exception:
            pass
    ins = links.get("inscritos", "")
    if ins.lower().split("?")[0].endswith(".pdf"):
        try:
            rows = from_rfea_pdf(http, ins) or from_rfea_category_pdf(http, ins) or from_pdf_entries(http, ins)
            if rows:
                return rows, [ins]
        except Exception:
            pass
    pages = [p for p in (ins, links.get("web"), links.get("info"), links.get("resultados"), links.get("directo")) if p and not p.lower().endswith(".pdf")]
    for p in pages:
        if "rfealive" in p:
            continue
        for u in list_links(http, p):
            if _old_year(u, it["date"]):
                continue  # p. ej. «LISTADO INSCRITOS 2025.pdf» para la edición de 2026: es la lista del año pasado
            try:
                rows = from_pdf_entries(http, u)
                if len(rows) >= 3:
                    return rows, [u]
            except Exception:
                continue
    return [], []


# ------------------------------------------------------------------ criterios

def _sex_of(row, ath):
    if row.get("sex"):
        return row["sex"]
    ev = row.get("event", "")
    if re.search(r"\b(mujeres|femenin|women|fem)\b", ev, re.I):
        return "F"
    if re.search(r"\b(hombres|masculin|men|masc)\b", ev, re.I):
        return "M"
    if ath and ath.get("sex"):
        return ath["sex"]
    return sex_from_first_name(row.get("name", ""))


def _event_label(ev):
    return clean(re.sub(r"\s+(Hombres|Mujeres|Masculino|Femenino|Men|Women)\b", "", ev or "", flags=re.I)) or "Carrera"


def _facts_ok(a, ev_label, row, comp_type):
    """Méritos del atleta que tienen sentido en ESTA lista: misma familia de pruebas (resistencia /
    velocidad-saltos-lanzamientos) y categoría compatible (menores / absoluta / máster)."""
    fam = A.family(ev_label) if A.family(ev_label) != "otras" or re.search(r"\d\s?m\b|salto|altura|longitud|triple|p[eé]rtiga|peso|disco|jabalina|martillo|vallas|decatl|heptatl", ev_label, re.I) else ""
    if comp_type in ("Ruta", "Cross", "Trail", "Marcha"):
        fam = "resistencia"
    age = A.age_group(" ".join([ev_label, row.get("cat", ""), row.get("section", "")]))
    ok = []
    for f in a.get("facts", []):
        if fam and f.get("family") and f["family"] != fam:
            continue
        if age == "menores" and f.get("cat") != "menores":
            continue
        if age != "menores" and f.get("cat") == "menores":
            continue
        ok.append(f)
    return ok


_BY_TOKEN = {}


def _index(ath):
    """Índice por palabra para buscar rápido nombres completos dentro de una fila."""
    if _BY_TOKEN.get("id") is ath:
        return _BY_TOKEN["idx"]
    idx = {}
    for wk, a in ath.items():
        if len(wk) >= 3:
            for t in wk:
                idx.setdefault(t, []).append((wk, a))
    _BY_TOKEN.update({"id": ath, "idx": idx})
    return idx


def match_full(ath, text):
    """Listas populares (columnas a veces descolocadas): el atleta cuenta si su nombre de pila y sus
    dos apellidos (3 palabras o más) aparecen en la fila. Nunca con nombres cortos de dos palabras."""
    from .names import MALE, FEMALE
    toks = set(A.tokens(text))
    best = None
    for t in toks:
        for wk, a in _index(ath).get(t, []):
            if wk <= toks:
                at = A.tokens(a["name"])
                first = at[:1]
                given = 0  # nombre de pila (simple o compuesto: "Miguel Ángel")
                for x in at:
                    if x in MALE or x in FEMALE:
                        given += 1
                    else:
                        break
                surnames = len(at) - max(given, 1)
                if first and first[0] in toks and surnames >= 2 and (given or len(wk) >= 4):
                    if not best or a["score"] > best["score"]:
                        best = a
    return best


def select(rows, ath, comp_type=""):
    """Destacados por prueba y sexo."""
    groups = {}
    for r in rows:
        r = dict(r)
        r["name"], nat = clean_name(r.get("name", ""), r.get("nat", ""))
        r["nat"] = nat
        if r.get("bib"):
            a = A.lookup_unique(ath, r["name"])  # solo nombre y un apellido: tiene que ser inequívoco
        else:
            a = match_full(ath, r.get("text") or r["name"]) if r.get("popular") else A.lookup(ath, r["name"])
        if a and r.get("exacto") and A.tokens(a["name"]) != A.tokens(r["name"]):
            a = None
        if a and r.get("popular"):
            r["name"] = a["name"]  # nombre completo y bien ordenado (todas sus palabras están en la fila)
        sex = _sex_of(r, a)
        groups.setdefault((_event_label(r.get("event")), sex), []).append((r, a))
    events = {}
    for (ev, sex), lst in groups.items():
        field = bool(FIELD.search(norm(ev)))

        def rank_by(key):
            vals = [(_mark_value(r.get(key)), i) for i, (r, _) in enumerate(lst) if _mark_value(r.get(key)) is not None]
            vals.sort(key=lambda x: -x[0] if field else x[0])
            return {i: pos for pos, (_, i) in enumerate(vals[:3])}
        sb_rank, pb_rank = rank_by("sb"), rank_by("pb")
        intl_list = any(r.get("nat") and r.get("nat") != "ESP" for r, _ in lst)
        scored = []
        seen = set()
        for i, (r, a) in enumerate(lst):
            k = A.key(r["name"])
            if k in seen:
                continue
            seen.add(k)
            score, reasons = 0, []
            if r.get("prev_reason"):  # medalla en la edición anterior del mismo campeonato
                score += r.get("prev_score", 25)
                reasons.append(r["prev_reason"])
            if r.get("record"):
                score += 60; reasons.append("Plusmarquista")
            if r.get("le"):
                score += 45; reasons.append("Líder español del año")
            if a:
                facts = sorted(_facts_ok(a, ev, r, comp_type), key=lambda f: -f["score"])
                if facts:
                    score += min(sum(f["score"] for f in facts), 120)
                    reasons += [f["text"] for f in facts[:3]]
            if i in sb_rank:
                score += (25, 18, 12)[sb_rank[i]]
                reasons.append("%sª mejor marca del año de la lista (%s)" % (sb_rank[i] + 1, r.get("sb")))
            if i in pb_rank:
                score += (15, 10, 6)[pb_rank[i]]
                reasons.append("%sª mejor marca personal de la lista (%s)" % (pb_rank[i] + 1, r.get("pb")))
            if r.get("elite") and score:
                score += 15; reasons.append("Sale con la élite")  # solo suma si ya tiene otros méritos
            if r.get("anunciado"):
                reasons.insert(0, r["anunciado"])
                score = max(score, MIN_SCORE)
            if r.get("bib") and r.get("elite"):
                # dorsal de élite asignado por la organización (Rockthesport): favorito aunque no lo conozcamos
                reasons.append("Dorsal de élite nº %s" % r["bib"])
                score = max(score, MIN_SCORE)
            if intl_list and (r.get("nat") == "ESP" or (a and a.get("nat") == "ESP")):
                score += 10; reasons.append("Español")
            merit = [x for x in reasons if x != "Español"]  # ser español no es un mérito por sí solo
            if score >= MIN_SCORE or (score >= MIN_SCORE_LOCAL and merit):
                scored.append({"name": r["name"],
                               # en listas populares las columnas a veces vienen descolocadas: el club no es fiable
                               "club": "" if r.get("popular") else r.get("club", ""), "nat": r.get("nat", ""), "pb": r.get("pb", ""), "sb": r.get("sb", ""),
                               "score": score, "reasons": list(dict.fromkeys(reasons))[:4],
                               "time": r.get("time"), "date": r.get("date"),
                               "_elite": bool(r.get("anunciado") or (r.get("bib") and r.get("elite"))),
                               "elite_anunciada": bool(r.get("anunciado")),
                               "_orden": r["bib"] if r.get("anunciado") and r.get("bib") else None})
        # lista oficial de la organización: en el orden de sus dorsales, y por delante del resto
        scored.sort(key=lambda x: (0, x["_orden"]) if x["_orden"] is not None else (1, -x["score"]))
        fuertes = [x for x in scored if x["score"] >= MIN_SCORE or x["_orden"] is not None or x["_elite"]]
        flojos = [x for x in scored if x not in fuertes]
        scored = fuertes + flojos[:max(0, LOCAL_FILL - len(fuertes))]
        for x in scored:
            x.pop("_orden")
        e = events.setdefault(ev, {"name": ev, "n": 0, "M": [], "F": [], "otros": []})
        e["n"] += len(seen)
        n_elite = sum(1 for x in scored if x.pop("_elite"))
        e[sex if sex in ("M", "F") else "otros"] = scored[:max(PER_SEX, min(n_elite, 25))]
    out = [e for e in events.values()]
    out.sort(key=lambda e: -(len(e["M"]) + len(e["F"])))
    return out


# ------------------------------------------------------------------ proceso diario

def run(http, health, items):
    t = today()
    ath = A.build()
    prev = load_json("previas.json", {}) or {}
    prev_by = {x["id"]: x for x in prev.get("items", [])}
    names_prev = load_json("state/previas_names.json", {}) or {}
    out, names_now = [], {}
    for it in items:
        d = dt.date.fromisoformat(it["date"])
        if not (t <= d <= t + dt.timedelta(days=DAYS_AHEAD)):
            continue
        try:
            rows, srcs = find_entries(http, it)
        except Exception as e:
            health.note("previas", "warning", "Inscritos de '%s': %s" % (it["name"], e))
            rows, srcs = [], []
        # élite anunciada por la organización / prensa (pipeline/extra_entries.json)
        extra = EXTRA_ENTRIES.get(it["id"])
        if extra:
            # si el atleta añadido a mano ya está en la lista, cuenta la ficha añadida (con su motivo)
            puestos = {A.key(clean_name(a["name"])[0]) for a in extra.get("atletas", [])}
            rows = [r for r in rows if A.key(clean_name(r.get("name", ""))[0]) not in puestos]
            rows = list(rows) + [{"event": a.get("event") or "Élite", "name": a["name"], "sex": a.get("sex", ""),
                                  "nat": a.get("nat", ""), "club": a.get("club", ""), "cat": "", "bib": a.get("bib"), "elite": a.get("elite", True), "popular": False,
                                  "anunciado": a.get("note") or "En la élite (anunciado por la organización)", "text": a["name"]}
                                 for a in extra.get("atletas", [])]
            fuente = extra.get("fuente")
            srcs = list(srcs) + (fuente if isinstance(fuente, list) else [fuente] if fuente else [])
            # atletas que siguen en la inscripción pero que no corren (confirmado a mano): fuera de la previa
            fuera = {A.key(clean_name(n)[0]) for n in extra.get("excluir", [])}
            if fuera:
                rows = [r for r in rows if A.key(clean_name(r.get("name", ""))[0]) not in fuera]
            # corren, pero no son favoritos aunque tengan dorsal bajo (p. ej. una autoridad que corre): no se destacan
            nodest = {A.key(clean_name(n)[0]) for n in extra.get("no_destacar", [])}
            if nodest:
                rows = [dict(r, elite=False, bib=None) if A.key(clean_name(r.get("name", ""))[0]) in nodest else r for r in rows]
            # pruebas que no se quieren en la previa (p. ej. la carrera corta «sin camiseta»)
            sin = {norm(p) for p in extra.get("excluir_pruebas", [])}
            if sin:
                rows = [r for r in rows if norm(_event_label(r.get("event"))) not in sin]
        # las clasificaciones «por Equipos» repiten a los atletas de la prueba individual: fuera de la previa
        rows = [r for r in rows if not re.search(r"\bequipos\b", r.get("event") or "", re.I)]
        if extra and extra.get("por_categoria"):
            # favoritos de cada categoría (M35, M40...) en vez de cada carrera, que junta varias
            rows = [dict(r, event="%s (%s)" % (r["cat"], r["event"].split("(")[-1].rstrip(")")) if "(" in r["event"] else r["cat"])
                    if r.get("cat") and re.match(r"^[MF]\d{2}$", r["cat"]) else r for r in rows if not r.get("solo_equipo")]
        if extra and extra.get("edicion_anterior") and rows:
            try:
                rows = mark_previous_podium(http, rows, extra["edicion_anterior"])
            except Exception as e:
                health.note("previas", "warning", "Edición anterior de '%s': %s" % (it["name"], e))
        entry = {"id": it["id"], "name": it["name"], "date": it["date"], "end_date": it.get("end_date"),
                 "place": it.get("place", ""), "type": it.get("type"), "links": it.get("links", {}),
                 "checked": iso_now(), "race_day": it["date"] <= t.isoformat() <= (it.get("end_date") or it["date"])}
        if not rows:
            old = prev_by.get(it["id"])
            if old and old.get("status") == "publicados":
                entry.update({k: old[k] for k in ("status", "events", "n_inscritos", "sources", "changes", "updated") if k in old})
                entry["stale"] = True  # la fuente no respondió hoy: se mantiene lo último que se vio
            else:
                entry["status"] = "no_publicados"
            out.append(entry)
            continue
        events = select(rows, ath, it.get("type", ""))
        # carreras de un solo sexo (Carrera de la Mujer, Liga Iberdrola...): fuera los destacados del otro
        solo = only_sex(it["name"])
        if solo:
            for e in events:
                e["M" if solo == "F" else "F"] = []
        # altas y bajas: solo de la lista real de inscritos (la élite de extra_entries.json no cuenta:
        # quitar a alguien de ahí no es que se haya dado de baja)
        now_names = sorted({clean_name(r["name"])[0] for r in rows if not r.get("anunciado")})
        before = set(names_prev.get(it["id"], []))
        reset = bool(extra and extra.get("atletas") and not names_prev.get(it["id"] + "|sin_anunciados"))
        if reset:
            before = set()  # lista guardada con la élite mezclada: se empieza de cero
        names_now[it["id"] + "|sin_anunciados"] = [1]
        dest_now = {x["name"] for e in events for s in ("M", "F", "otros") for x in e[s]}
        changes = {}
        if before:
            added = sorted(set(now_names) - before)
            removed = sorted(before - set(now_names))
            changes = {"altas": len(added), "bajas": len(removed),
                       "altas_destacadas": [n for n in added if n in dest_now][:10],
                       "bajas_destacadas": [n for n in removed if A.lookup(ath, n)][:10]}
        old = prev_by.get(it["id"]) or {}
        entry.update({"status": "publicados", "sources": srcs, "n_inscritos": len(now_names), "events": events,
                      "changes": changes or ({} if reset else old.get("changes", {})),
                      "updated": iso_now() if set(now_names) != before else old.get("updated", iso_now())})
        names_now[it["id"]] = now_names
        out.append(entry)
    out.sort(key=lambda x: (x["date"], x["name"]))
    save_json("previas.json", {"generated": iso_now(), "days_ahead": DAYS_AHEAD, "items": out}, compact=True)
    names_prev.update(names_now)
    ids = {x["id"] for x in out}
    save_json("state/previas_names.json", {k: v for k, v in names_prev.items() if k.split("|")[0] in ids}, compact=True)
    return sum(1 for x in out if x.get("status") == "publicados")
