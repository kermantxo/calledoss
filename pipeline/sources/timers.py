"""Cronometradores y portales de inscripción.

* Cronomancha (cronomancha.com → timingsys.com): API pública JSON de su app de resultados
  (resultados-api.cronomancha.com/api/v1/public). Índice de eventos con estado
  ('Finalizada', 'En curso'...) y resultados completos por carrera.
* AvaiBook Sports (donde publica sus clasificaciones Runvasport; inscripciones.runvasport.es
  tiene también el listado público de participantes de cada carrera, en /participantes/).
  Índice público de eventos con enlace a sus clasificaciones.
"""
import datetime as dt
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup

from ..common import clean, title_place

# Modalidades de Cronomancha que son atletismo (se descartan BTT, triatlón, etc.)
ATHLETICS_MODALITIES = {"A PIE", "ATLETISMO", "CROSS", "TRAIL", "CARRERA X MONTAÑA", "ESCUELAS", "MARCHA NORDICA"}
CM_API = "https://resultados-api.cronomancha.com/api/v1/public"
CM_APP = "https://resultados-app.cronomancha.com/results/"


def nice_title(name):
    """'XXXVII MEDIA MARATÓN CIUDAD DE VALLADOLID' -> 'XXXVII Media Maratón Ciudad de Valladolid'."""
    letters = [c for c in name if c.isalpha() and c not in "ªº"]
    mostly_upper = letters and sum(1 for c in letters if c.isupper()) >= 0.8 * len(letters)
    if not (mostly_upper or name.istitle()):
        return name
    out = []
    for i, w in enumerate(name.split()):
        if re.fullmatch(r"M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})", w.upper()) and w and (i == 0 or w.isupper()):
            out.append(w.upper())                       # números romanos
        elif re.fullmatch(r"\d+[ºª]?", w):
            out.append(w)
        elif i and w.lower() in ("de", "del", "la", "las", "los", "y", "en", "a", "al", "por"):
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    return " ".join(out)


def _cm_type(modality):
    m = (modality or "").upper()
    if "CROSS" in m:
        return "Cross"
    if "TRAIL" in m or "MONTA" in m:
        return "Trail"
    return "Ruta"


def cronomancha_events(http):
    r = http.get(CM_API + "/events")
    data = r.json()
    if not isinstance(data, list):
        raise RuntimeError("La API de Cronomancha ya no devuelve una lista de eventos")
    out = []
    for ev in data:
        races = [x for x in ev.get("races") or [] if (x.get("modality") or "").upper() in ATHLETICS_MODALITIES]
        if not races:
            continue
        date = (ev.get("date_start") or "")[:10]
        end = (ev.get("date_end") or "")[:10]
        out.append({
            "id": "cronomancha-%s" % ev.get("slug"),
            "name": clean(ev.get("name")),
            "date": date,
            "end_date": end if end and end != date else None,
            "place": title_place(ev.get("location") or ""),
            "type": _cm_type(races[0].get("modality")),
            "cat": "Cronomancha",
            "intl": False,
            "source": "Cronomancha",
            "status": ev.get("status"),
            "links": {"resultados": CM_APP + (ev.get("slug") or "")},
            "live": [{"kind": "cronomancha", "race": x["race_slug"], "name": clean(x.get("display_name"))} for x in races],
            "_updated": max([x.get("updated_at") or 0 for x in races] or [0]),
        })
    return out


def cronomancha_results(http, race_slug, top=15):
    """Clasificación de una carrera: top general, top por sexo y ganadores de categoría."""
    r = http.get("%s/races/%s/results?limit=0" % (CM_API, race_slug))
    j = r.json()
    race = j.get("race") or {}
    rows = j.get("data") or []

    def fmt(ms):
        if not ms:
            return ""
        s = int(ms) // 1000
        h, rem = divmod(s, 3600)
        m, s = divmod(rem, 60)
        return ("%d:%02d:%02d" % (h, m, s)) if h else ("%d:%02d" % (m, s))

    done = [x for x in rows if (x.get("status") or "").upper() == "FINISHED" and x.get("position")]
    done.sort(key=lambda x: x["position"])

    def row(x):
        return {"pos": str(x.get("position")), "name": clean(x.get("full_name")), "club": clean(x.get("team")),
                "cat": clean(x.get("category")), "mark": fmt(x.get("total_time")), "sex": x.get("gender")}
    out = {"race": clean(race.get("race_name")), "status": race.get("status"), "total": len(rows),
           "finished": len(done), "rows": [row(x) for x in done[:top]]}
    for sex, label in (("M", "Hombres"), ("F", "Mujeres")):
        out["top_" + sex] = [row(x) for x in done if x.get("gender") == sex][:5]
    return out


# ------------------------------------------------------------------ AvaiBook Sports

AVAI = "https://www.avaibooksports.com"
AVAI_ENTITIES = ["runvasport"]  # entidades cuyas clasificaciones se vigilan
MONTHS = {m: i + 1 for i, m in enumerate(["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
                                          "septiembre", "octubre", "noviembre", "diciembre"])}
NON_ATHLETICS = re.compile(r"\b(btt|mtb|cicloturista|gravel|bici|ciclismo|senderismo|natacion|nataci[oó]n|triatl|duatl|padel|pádel|marcha cicloturista)\b", re.I)


def avaibook_events(http, pages=2):
    out = []
    for entity in AVAI_ENTITIES:
        for p in range(1, pages + 1):
            url = "%s/sport-entity/%s/events/rankings%s" % (AVAI, entity, "" if p == 1 else "/%d" % p)
            soup = BeautifulSoup(http.get(url).text, "lxml")
            links = soup.find_all("a", href=re.compile(r"/inscripcion/[^/]+/clasificaciones/?$"))
            for a in links:
                card = a
                for _ in range(6):
                    card = card.parent
                    if card is None:
                        break
                    txt = clean(card.get_text(" "))
                    if re.search(r"\d{1,2} de \w+ de \d{4}", txt):
                        break
                if card is None:
                    continue
                m = re.search(r"(\d{1,2}) de (\w+) de (\d{4}),?\s*(\d{1,2}:\d{2})?", txt)
                if not m or m.group(2).lower() not in MONTHS:
                    continue
                date = dt.date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1)))
                title = card.find(["h2", "h3", "h4", "h5"])
                name = clean(title.get_text(" ")) if title else ""
                if not name:
                    name = clean(re.sub(r".*?\d{4},?\s*[\d:]*\s*[A-Z]{3,4}T?", "", txt).split("Inscripciones")[0])
                if NON_ATHLETICS.search(name):
                    continue
                slug = a["href"].rstrip("/").split("/")[-2]
                out.append({
                    "id": "avaibook-%s" % slug,
                    "name": nice_title(name),
                    "date": date.isoformat(),
                    "end_date": None,
                    "time": m.group(4),
                    "place": "",
                    "type": "Trail" if re.search(r"trail|monta", name, re.I) else "Ruta",
                    "cat": "Runvasport",
                    "intl": False,
                    "source": "AvaiBook (Runvasport)",
                    "links": {"resultados": urljoin(AVAI, a["href"]),
                              "inscritos": urljoin(AVAI, a["href"].replace("/clasificaciones", "/participantes"))},
                })
    # quita duplicados (la misma tarjeta tiene varios enlaces)
    seen, uniq = set(), []
    for x in out:
        if x["id"] not in seen:
            seen.add(x["id"])
            uniq.append(x)
    return uniq


# ------------------------------------------------------------------ Cronomancha: próximas carreras

TS = "https://timingsys.com"
MON_ABBR = {"ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6, "jul": 7, "ago": 8, "sep": 9,
            "sept": 9, "oct": 10, "nov": 11, "dic": 12}


def cronomancha_upcoming(http):
    """Tarjetas de la portada de Cronomancha/Timingsys (carreras con inscripción)."""
    soup = BeautifulSoup(http.get(TS + "/").text, "lxml")
    out, seen = [], set()
    for a in soup.find_all("a", href=re.compile(r"timingsys\.com/event/\d+$")):
        eid = a["href"].rstrip("/").split("/")[-1]
        if eid in seen:
            continue
        card = a
        for _ in range(6):
            card = card.parent
            if card is None or "Fecha del Evento" in card.get_text(" "):
                break
        if card is None:
            continue
        parts = [clean(x) for x in card.get_text("|").split("|") if clean(x)]
        try:
            i = parts.index("Fecha del Evento")
        except ValueError:
            continue
        m = re.match(r"(\d{1,2}) (\w+)\.? (\d{4})", parts[i + 1] if i + 1 < len(parts) else "")
        if not m or m.group(2).lower() not in MON_ABBR:
            continue
        seen.add(eid)
        name, modality = parts[max(0, i - 2)], parts[i - 1] if i >= 1 else ""
        if modality.upper() not in ATHLETICS_MODALITIES:
            continue
        date = dt.date(int(m.group(3)), MON_ABBR[m.group(2).lower()], int(m.group(1)))
        dist = ""
        if "Distancia:" in parts:
            j = parts.index("Distancia:")
            dist = parts[j + 1] if j + 1 < len(parts) and not parts[j + 1].endswith(":") else ""
        out.append({
            "id": "cronomancha-ev%s" % eid,
            "name": re.sub(r"\s*-\s*\d{4}$", "", name),
            "date": date.isoformat(),
            "end_date": None,
            "place": "",
            "type": _cm_type(modality),
            "cat": "Cronomancha" + (" · %s" % dist if dist else ""),
            "intl": False,
            "source": "Cronomancha",
            "links": {"info": "%s/event/%s" % (TS, eid), "inscritos": "%s/event/%s/participants" % (TS, eid),
                      "resultados": "%s/resultdata/%s" % (TS, eid)},
            "live": [{"kind": "timingsys", "event": eid}],
        })
    return out


def avaibook_upcoming(http, pages=3):
    """Próximas carreras de las entidades de AvaiBook (Runvasport), con su página de inscripción,
    donde se publica el 'Listado de inscritos'."""
    out, seen = [], set()
    for entity in AVAI_ENTITIES:
        for p in range(1, pages + 1):
            url = "%s/sport-entity/%s/events%s" % (AVAI, entity, "" if p == 1 else "/%d" % p)
            soup = BeautifulSoup(http.get(url).text, "lxml")
            for a in soup.find_all("a", href=re.compile(r"/inscripcion/[^/]+/?$")):
                href = urljoin(AVAI, a["href"])
                slug = href.rstrip("/").split("/")[-1]
                if slug in seen:
                    continue
                card = a
                for _ in range(6):
                    card = card.parent
                    if card is None or re.search(r"\d{1,2} de \w+ de \d{4}", card.get_text(" ")):
                        break
                if card is None:
                    continue
                txt = clean(card.get_text(" | "))
                m = re.search(r"(\d{1,2}) de (\w+) de (\d{4}),?\s*(\d{1,2}:\d{2})?", txt)
                if not m or m.group(2).lower() not in MONTHS:
                    continue
                parts = [x.strip() for x in txt.split("|") if x.strip()]
                name = next((x for x in parts[1:] if not re.search(r"\d{4}|Inscripci|Más información", x)), "")
                if not name or NON_ATHLETICS.search(name):
                    continue
                seen.add(slug)
                out.append({
                    "id": "avaibook-%s" % slug,
                    "name": nice_title(name),
                    "date": dt.date(int(m.group(3)), MONTHS[m.group(2).lower()], int(m.group(1))).isoformat(),
                    "end_date": None, "time": m.group(4), "place": "",
                    "type": "Trail" if re.search(r"trail|monta", name, re.I) else "Ruta",
                    "cat": "Runvasport", "intl": False, "source": "AvaiBook (Runvasport)",
                    "links": {"inscritos": href, "resultados": urljoin(AVAI, "/inscripcion/%s/clasificaciones/" % slug)},
                })
    return out


# ------------------------------------------------------------------ plataformas de inscripción tipo AvaiBook
# (Kirolprobak, AvaiBook Sports, Runvasport...): misma web con /inscripcion/<evento>/ y /participantes/

INSCRIPCION = re.compile(r"https?://[^/\s\"']*(kirolprobak\.com|avaibooksports\.com|runvasport\.es)/inscripcion/([a-z0-9-]+)", re.I)


def inscripcion_url(text):
    """Primer enlace a una página de inscripción tipo AvaiBook dentro de un texto/HTML."""
    m = INSCRIPCION.search(text or "")
    return m.group(0).rstrip("/") + "/" if m else None


def inscripcion_start(http, url):
    """Hora de inicio del evento ("INICIO DEL EVENTO: sábado, 3 de octubre de 2026, 16:00")."""
    t = clean(BeautifulSoup(http.get(url).text, "lxml").get_text(" "))
    m = re.search(r"inicio del evento:?\s*[^0-9]{0,20}\d{1,2}\s+de\s+\w+\s+de\s+\d{4},?\s*(\d{1,2}:\d{2})", t, re.I) \
        or re.search(r"fecha del evento\s*\d{1,2}\s+\w+\.?\s+\d{4}\s+a las\s+(\d{1,2}:\d{2})", t, re.I)
    if not m or m.group(1) in ("00:00", "0:00"):
        return None
    h, mi = m.group(1).split(":")
    return "%02d:%s" % (int(h), mi)


def inscripcion_participants(http, url, max_pages=40):
    """Listado público de participantes: SOLO nombre y cuota/categoría (lo que la web muestra)."""
    base = url.rstrip("/") + "/participantes/"
    out = []
    for page in range(1, max_pages + 1):
        soup = BeautifulSoup(http.get(base + ("?pagina=%d" % page if page > 1 else "")).text, "lxml")
        rows = soup.select("table#table_participantes tr.inscrito")
        if not rows:
            break
        for tr in rows:
            name = clean((tr.find("td", class_="participante") or tr).get_text(" "))
            cat = clean((tr.find("td", class_="cuota") or tr).get_text(" "))
            if "," in name:  # "ABAD LOPEZ, MAIALEN" -> "MAIALEN ABAD LOPEZ"
                last, first = [x.strip() for x in name.split(",", 1)]
                name = clean(first + " " + last)
            sex = "F" if re.search(r"femen|mujer|fem\b|chicas|damas", cat, re.I) else \
                  "M" if re.search(r"mascul|hombre|masc\b|chicos|varones", cat, re.I) else ""
            out.append({"name": name, "cat": cat, "sex": sex})
        if not soup.find("a", href=re.compile(r"pagina=%d\b" % (page + 1))):
            break
    return out


# ------------------------------------------------------------------ Rockthesport (y webs de inscripción con su programa)
# "Listado de participantes": nombre, primer apellido y dorsal. Se ordena por dorsal para leer los
# primeros (los dorsales bajos son los de la élite). Solo se usan nombre y dorsal.

RTS = re.compile(r"https?://[^\s\"'<>]+/(?:es|eu|en|fr)/evento/([a-z0-9-]+)(?:/listado-participantes)?", re.I)


def rockthesport_url(text):
    for m in RTS.finditer(text or ""):
        u = m.group(0)
        if "/inscripcion" in u or "/my-registration" in u:
            continue
        base = u.split("/listado-participantes")[0].rstrip("/")
        return base + "/listado-participantes"
    return None


def rockthesport_participants(http, url, pages=3):
    """Participantes con los dorsales más bajos (élite primero): [{name, bib}]."""
    import requests
    s = requests.Session()
    s.headers["User-Agent"] = http.s.headers.get("User-Agent", "Mozilla/5.0") if hasattr(http, "s") else "Mozilla/5.0"

    def rows(soup):
        t = soup.find("table", class_="table-listados")
        out = []
        for tr in (t.find_all("tr") if t else []):
            tds = [clean(td.get_text(" ")) for td in tr.find_all("td")]
            if len(tds) >= 3 and re.match(r"^\d+$", tds[2]):
                out.append({"name": clean(tds[0] + " " + tds[1]), "bib": int(tds[2])})
        return out

    def form_of(soup):
        return {i["name"]: i.get("value", "") for i in soup.select("form#form1 input[name]")
                if i.get("type") not in ("submit", "checkbox", "button", "image")}

    soup = BeautifulSoup(s.get(url, timeout=40).text, "lxml")
    sort_link = next((a for a in soup.select("table.table-listados th a[href]") if "DORSAL" in a.get_text().upper()), None)
    if sort_link:
        m = re.search(r"__doPostBack\('([^']+)'", sort_link["href"].replace("&#39;", "'"))
        if m:
            f = form_of(soup)
            f.update({"__EVENTTARGET": m.group(1), "__EVENTARGUMENT": ""})
            soup = BeautifulSoup(s.post(url, data=f, timeout=40).text, "lxml")
    out = rows(soup)
    btn = soup.find(id="cphCuerpo_btFinScroll")
    for page in range(2, pages + 1):
        if not btn:
            break
        f = form_of(soup)
        for k in list(f):
            if k.endswith("inputPage") or k.endswith("inputPageSelXL") or k.endswith("inputPageSelXS"):
                f[k] = str(page)
        f[btn.get("name")] = btn.get("value", "")
        soup = BeautifulSoup(s.post(url, data=f, timeout=40).text, "lxml")
        more = [r for r in rows(soup) if r not in out]
        if not more:
            break
        out += more
        btn = soup.find(id="cphCuerpo_btFinScroll")
    return sorted(out, key=lambda r: r["bib"])
