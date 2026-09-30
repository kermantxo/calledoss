"""CARGA HISTÓRICA de resultados de 2026 (proceso único, reanudable).

Recorre el calendario competición a competición (del 1 de enero hasta ayer), localiza sus
resultados oficiales y guarda el PODIO (top 3 con marca) de cada prueba en la misma base de
datos de la sección Resultados (results/<id>.json + results/index.json).

Todo es código normal con librerías (HTML, JSON y PDFs con pdfplumber). Sin IA.

Orden de búsqueda para cada competición:
  1. Resultados ya guardados por el pipeline diario.
  2. RFEA Live (rfealive.info / rfealive.me): enlace de la ficha RFEA o búsqueda por nombre y fecha.
  3. PDF de resultados enlazado en la ficha RFEA (se comprueba que fecha/nombre coinciden).
  4. PDFs del índice de resultados de RFEA (atletismo-plus/categoria/resultados).
  5. World Athletics (resultados por días).
  6. Cronomancha (API de resultados).
  7. Web oficial / página de resultados: se buscan PDFs de clasificaciones enlazados.
Si ninguna funciona: queda en results/sin_resultados.json ("sin resultados localizados"),
con los enlaces probados, para revisarlo desde el panel.

Uso:  python -m pipeline.run backfill            (se puede relanzar: continúa donde lo dejó)
      BACKFILL_MAX_MINUTES=300 limita la duración de cada tanda.
"""
import datetime as dt
import os
import re
import time
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup

from .calendar_build import similar
from .common import load_json, norm, save_json, today, iso_now, clean, parse_dmy
from .highlights import FIELD, _mark_value
from .parsers import pdf_columns, pdf_meet, pdf_results, pdf_road
from .results import store, unstore, _index, drop_bad
from .sources import rfea, rfealive, worldathletics, timers, sportmaniacs, faalive, livetrail, cruzandolameta

STATE = "state/backfill.json"
# Súbelo cuando se añadan fuentes o lectores nuevos: todo lo "sin resultados" se vuelve a intentar.
VERSION = 19
MISSING = "results/sin_resultados.json"
START = "2026-01-01"
COMBINED = re.compile(r"decatlon|heptatlon|pentatlon|hexatlon|octatlon|triatlon|tetratlon")
RESULT_WORDS = re.compile(r"clasifica|resultad|results|classific", re.I)


# ------------------------------------------------------------------ podios

def _is_final(rnd):
    r = norm(rnd)
    if not r or r in ("final", "final a", "carrera", "general", "clasificacion", "series"):
        return True
    return r.startswith("final") and not r.startswith("final b") and "semi" not in r


def _sort_rows(rows, event):
    field = bool(FIELD.search(norm(event)))
    valued = [(r, _mark_value(r.get("mark"))) for r in rows]
    ok = [x for x in valued if x[1] is not None]
    ok.sort(key=lambda x: -x[1] if field else x[1])
    return [x[0] for x in ok]


def podiums(events):
    """De una lista de pruebas/rondas con filas, devuelve el podio de cada prueba.

    * Si hay final (o una única ronda), su top 3.
    * Si solo hay series (p. ej. meetings con series por tiempos), se juntan y se ordenan por marca.
    * Se ignoran las pruebas parciales de combinadas ('Combinadas 1/2').
    """
    by_event = {}
    for e in events:
        rounds = e.get("rounds") or [e]
        for r in rounds:
            rn = r.get("round") or ""
            ename = e.get("name") or e.get("event") or ""
            if re.match(r"combinadas", norm(rn)) and COMBINED.search(norm(ename)):
                continue  # parcial de un decatlón/heptatlón: cuenta la prueba combinada completa
            by_event.setdefault(e.get("name") or e.get("event"), []).append(r)
    out = []
    for name, rounds in by_event.items():
        finals = [r for r in rounds if r.get("final") or _is_final(r.get("round") or "")]
        if finals:
            chosen = finals[0]
            rows = sorted([x for x in chosen.get("rows", []) if re.match(r"^\d+$", str(x.get("pos", "")))],
                          key=lambda x: int(x["pos"]))[:3]
            label = chosen.get("round") or "Final"
        else:
            allrows = [x for r in rounds for x in r.get("rows", [])]
            rows = _sort_rows(allrows, name)[:3]
            for i, x in enumerate(rows):
                x = dict(x)
                x["pos"] = str(i + 1)
                rows[i] = x
            label = "Clasificación por marcas (series)"
        if rows:
            out.append({"name": name, "rounds": [{"round": label, "final": True, "rows": rows}]})
    return out


# ------------------------------------------------------------------ validación de PDFs

def _dates_in(text):
    out = set()
    for m in re.finditer(r"\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})\b", text):
        try:
            out.add(dt.date(int(m.group(3)), int(m.group(2)), int(m.group(1))))
        except ValueError:
            pass
    for m in re.finditer(r"\b(\d{1,2})(?:\s*-\s*\d{1,2})?\s+(?:de\s+)?([A-Za-zé]+)\.?\s+(?:de\s+)?(\d{4})\b", text):
        mon = _month(m.group(2))
        if mon:
            try:
                out.add(dt.date(int(m.group(3)), mon, int(m.group(1))))
            except ValueError:
                pass
    return out


_MON = {"ene": 1, "jan": 1, "feb": 2, "mar": 3, "abr": 4, "apr": 4, "may": 5, "jun": 6, "jul": 7, "ago": 8, "aug": 8,
        "sep": 9, "set": 9, "oct": 10, "nov": 11, "dic": 12, "dec": 12}


def _month(w):
    w = norm(w)[:3]
    return _MON.get(w)


def _pdf_fingerprint(pages, meta):
    head = "\n".join(pages[:6])[:12000]
    dates = _dates_in(head)
    if meta.get("dates"):
        dates |= {parse_dmy(x) for x in meta["dates"] if parse_dmy(x)}
    title = meta.get("championship") or " ".join(head.splitlines()[:3])
    return sorted(d.isoformat() for d in dates), title[:200]


def _share_word(item, title):
    """Al menos una palabra significativa en común entre la competición (nombre o lugar) y el PDF.
    También vale si aparece pegada ('santapola', 'CtoMadrid')."""
    from .calendar_build import _tokens
    a = _tokens(item["name"]) | _tokens(item.get("place") or "")
    a = {t for t in a if len(t) > 3}
    if a & _tokens(title):
        return True
    glued = norm(title).replace(" ", "")
    place = norm(item.get("place") or "").replace(" ", "")
    return any(t in glued for t in a) or (len(place) > 4 and place in glued)


def pdf_matches(item, dates, title, url="", trust="index"):
    """¿Este PDF es de esta competición?

    * Su nombre (título del PDF o nombre del fichero) tiene que parecerse al de la competición, y
    * sus fechas tienen que coincidir (±1 día). Un PDF sin ninguna fecha se acepta solo por el nombre.
    Un PDF con fechas que no coinciden se rechaza siempre, y también uno cuyo enlace es de otro año
    ('/resultados/2024/...' para una competición de 2026).
    """
    from .results import other_year
    if other_year(item, url):
        return False
    d1 = dt.date.fromisoformat(item["date"]) - dt.timedelta(days=1)
    d2 = dt.date.fromisoformat(item.get("end_date") or item["date"]) + dt.timedelta(days=1)
    ds = [dt.date.fromisoformat(x) for x in dates if x[:4] in (str(d1.year), str(d1.year - 1))]
    fname = re.sub(r"[_.\-]+", " ", urlparse(url).path.rsplit("/", 1)[-1].rsplit(".", 1)[0]) if url else ""
    fname = re.sub(r"([a-z])([A-Z])", r"\1 \2", fname)
    named = similar(item["name"], title) or _share_word(item, title) or _share_word(item, fname)
    dated = any(d1 <= d <= d2 for d in ds)
    if trust == "index":
        # PDF de un índice general: compartir solo la ciudad no basta ("Barcelona" en dos competiciones distintas)
        from .calendar_build import _tokens
        place = _tokens(item.get("place") or "")
        common = (_tokens(item["name"]) - place) & (_tokens(title) | _tokens(fname))
        named = similar(item["name"], title) or len({t for t in common if len(t) > 3}) >= 2
    if trust == "ficha":   # PDF enlazado desde la propia ficha RFEA de la competición: basta el nombre
        return named or dated
    if trust == "web":     # PDF de la web oficial de la competición: basta la fecha (o el nombre si no hay fechas)
        return dated or (named and not ds)
    if not named:          # PDF encontrado en un índice general: nombre Y fecha
        return False
    return dated or not ds


# ------------------------------------------------------------------ fuentes

def _overlap(a, b):
    from .calendar_build import _tokens
    ta, tb = _tokens(a), _tokens(b)
    return len(ta & tb) / (len(ta | tb) or 1)


def _cap(name):
    """'Santiago ESTEVE JUAN' -> 'Santiago Esteve Juan'."""
    return " ".join(w.capitalize() if w.isupper() and len(w) > 1 else w for w in (name or "").split())


def from_rfealive(http, chid, base):
    sc = rfealive.schedule_podiums(http, chid, base=base)
    evs = [{"name": e["event"], "round": e["round"], "rows": e["rows"]} for e in sc["events"] if e["rows"]]
    pods = podiums(evs)
    dates = {e["date"] for e in sc["events"] if e.get("date")}
    # nombres completos de los podios (la página de horario abrevia el nombre de pila)
    full = {}
    try:
        sched = rfealive.schedule(http, chid, base=base)
    except Exception:
        sched = None
    if sched:
        for e in sched["events"]:
            full.setdefault(e["event"], []).append(e)
        from .names import is_abbreviated
        for p in pods:
            if not any(is_abbreviated(r.get("name")) for r in p["rounds"][0]["rows"]):
                continue
            same = full.get(p["name"], [])
            want = p["rounds"][0].get("round", "")
            # la misma ronda del podio; si no, la final; si solo hay una, esa
            cand = [e for e in same if e["round"] == want] or [e for e in same if _is_final(e["round"])] or (same if len(same) == 1 else [])
            if not cand:
                continue
            try:
                res = rfealive.results(http, cand[0]["results_url"])
            except Exception:
                continue
            rows = [r for r in res["rows"] if re.match(r"^\d+$", r["pos"])][:3]
            if len(rows) >= len(p["rounds"][0]["rows"]):
                p["rounds"][0]["rows"] = [{"pos": r["pos"], "name": _cap(r["name"]), "club": r["club"], "mark": r["mark"], "note": r["note"]} for r in rows]
    return pods, sc["url"], dates


def from_pdf(http, item, url, cache, trust="index"):
    """Podios de un PDF. El contenido se guarda por URL; la comprobación de fecha/nombre, por competición."""
    c = cache.get(url)
    if c is not None and c.get("pdf") and not c.get("events") and c.get("v", 0) < 2:
        c = None  # PDF que no se pudo leer antes de existir los lectores nuevos: se vuelve a leer
    if c is None:
        resp = http.get(url, timeout=180)
        if b"%PDF" not in resp.content[:1024]:
            cache[url] = c = {"pdf": False}
        else:
            pages = pdf_results.extract_pages(resp.content)
            res = pdf_results.parse(resp.content, pages=pages)
            dates, title = _pdf_fingerprint(pages, res.get("meta") or {})
            good = podiums(res["events"]) if res.get("format") != "generic" else []
            # formatos de cronometradores: lector por columnas. Se queda el lector que saque más
            # (primero: que tenga los dos sexos; después: más pruebas)
            from .quality import sexes_in
            try:
                cols = [{k: v for k, v in p.items() if k != "_n"} for p in pdf_columns.parse(resp.content)]
            except Exception:
                cols = []
            if cols and (len(sexes_in(cols)), len(cols)) > (len(sexes_in(good)), len(good)):
                good = cols
                res["format"] = "columnas"
            try:  # reuniones de pista con ficha de 2-3 líneas por atleta (Vigo, Fuenlabrada, Milla Máster...)
                meet = podiums(pdf_meet.parse(pages))
            except Exception:
                meet = []
            if meet and _useful(meet) > _useful(good):
                good = meet
                res["format"] = "reunión"
            if not good and res.get("format") == "generic":  # último recurso: podios completos y ordenados
                good = [p for p in podiums(res["events"]) if [r["pos"] for r in p["rounds"][0]["rows"]] == ["1", "2", "3"]]
            title = title if len(title) > 8 else " ".join(pages[0].splitlines()[:4])[:200] if pages else title
            cache[url] = c = {"pdf": True, "dates": dates, "title": title, "format": res.get("format"), "events": good, "v": 2}
            if item.get("type") in ROAD_TYPES:
                c["road"] = _road_events(resp.content)
    if not c.get("pdf"):
        return None, url, "no es un PDF"
    if item.get("type") in ROAD_TYPES:
        if "road" not in c:  # PDF guardado antes de existir el lector de ruta
            c["road"] = _road_events(http.get(url, timeout=180).content)
        if _useful(c["road"]) > _useful(c["events"]):
            return (c["road"] if pdf_matches(item, c["dates"], c["title"], url, trust) else None), url, \
                "" if pdf_matches(item, c["dates"], c["title"], url, trust) else "el PDF es de otra competición (fecha/nombre no coinciden)"
    if not pdf_matches(item, c["dates"], c["title"], url, trust):
        return None, url, "el PDF es de otra competición (fecha/nombre no coinciden)"
    if not c["events"]:
        return None, url, "PDF sin tablas de resultados reconocibles"
    return c["events"], url, ""


ROAD_TYPES = ("Ruta", "Trail", "Marcha", "Cross")


def _road_events(content):
    try:
        return pdf_road.parse(content)
    except Exception:
        return []


def _useful(events):
    """Cuánto sirve una lectura: pruebas que pasan la revisión automática (primero, que tenga los dos sexos)."""
    from .quality import review, sexes_in
    import copy
    kept = (review({"events": copy.deepcopy(list(events or []))}, "")[0] or {}).get("events", [])  # review modifica lo que recibe
    return (len(sexes_in(kept)), len(kept))


def drive_direct(url):
    """Enlace de Google Drive ('.../file/d/<id>/view') -> descarga directa del archivo."""
    m = re.search(r"drive\.google\.com/(?:file/d/|open\?id=|uc\?(?:export=download&)?id=)([\w-]{20,})", url or "")
    return "https://drive.google.com/uc?export=download&id=%s" % m.group(1) if m else url


def pdf_links_in_page(http, url):
    """PDFs de clasificaciones enlazados desde una página (web oficial o página de resultados)."""
    try:
        r = http.get(url, timeout=30)
    except Exception:
        return []
    if "html" not in (r.headers.get("content-type") or ""):
        return []
    soup = BeautifulSoup(r.text, "lxml")
    out = []
    for a in soup.find_all("a", href=True):
        h = urljoin(r.url, a["href"].strip())
        txt = clean(a.get_text(" "))
        if h.lower().split("?")[0].endswith(".pdf") and (RESULT_WORDS.search(txt) or RESULT_WORDS.search(h)):
            out.append(h)
    return list(dict.fromkeys(out))[:6]


ES_EN = [(r"campeonatos? del? mundo", "world championships"), (r"campeonatos? de europa", "european championships"),
         (r"\bsub\s?-?(\d{2})\b", r"u\1"), (r"pista cubierta", "indoor"), (r"campo a trav[eé]s", "cross country"),
         (r"\bruta\b", "road"), (r"marcha", "race walking"), (r"juegos mediterr[aá]neos", "mediterranean games"),
         (r"juegos ol[ií]mpicos", "olympic games"), (r"relevos", "relays"), (r"por equipos", "team"),
         (r"monta[ñn]a", "mountain"), (r"universitari[oa]s?", "university")]


def _to_en(name):
    """Traducción mínima de nombres de campeonatos para buscarlos en World Athletics."""
    n = norm(name)
    for es, en in ES_EN:
        n = re.sub(es, en, n)
    return n + " world athletics"


def _chids(links):
    out = []
    for v in (links or {}).values():
        if "rfealive" in v and "chid=" in v:
            host = "https://" + urlparse(v).netloc
            chid = (parse_qs(urlparse(v).query).get("chid") or [None])[0]
            if chid:
                out.append((chid, host))
    return out


# ------------------------------------------------------------------ recorrido

class Finder:
    def __init__(self, http, health):
        self.http = http
        self.health = health
        self.state = load_json(STATE, {"done": {}, "pdf_cache": {}, "details": {}}) or {}
        for k in ("done", "pdf_cache", "details"):
            self.state.setdefault(k, {})
        if self.state.get("version") != VERSION:
            # lectores nuevos: se reintenta lo que no se encontró y se rehace lo leído por columnas
            col_urls = {k for k, v in self.state["pdf_cache"].items() if v.get("format") in ("columnas", "generic", "internacional")}
            by_url = {x.get("url"): x for x in _index()["items"]}
            redo_sources = {"Runvasport (PDF)", "Web de la competición (PDF)", "Federación Andaluza (PDF)", "RFEA (PDF)"}
            # nombres abreviados de RFEA Live ('H Santos Llorente'): se vuelven a pedir completos
            from .names import is_abbreviated
            abbrev = set()
            for x in _index()["items"]:
                if x.get("source", "").startswith("RFEA Live") and any(
                        is_abbreviated(r.get("name")) for pd in x.get("podios", []) for r in pd.get("rows", [])):
                    abbrev.add(x.get("cal_id") or x["id"])
            # competiciones con un solo sexo (PDF cortado en la página 80, "W35", club "FEM..."): se rehacen
            import glob as _g, os as _o
            from .common import DATA_DIR as _D
            from .quality import missing_sexes
            one_sex = set()
            for f in _g.glob(_o.path.join(_D, "results", "*.json")):
                rd = load_json("results/" + _o.path.basename(f), {}) or {}
                evs = rd.get("events", [])
                # un solo sexo (o el sexo contrario al del nombre: 'Liga Iberdrola' con pruebas de hombres),
                # o lecturas del lector antiguo ('generic': una sola tabla 'Clasificación' sin pruebas)
                if missing_sexes(evs, rd.get("name", "")) or rd.get("format") == "generic" \
                        or rd.get("source") == "RFEA (PDF)":
                    one_sex.add(rd.get("id"))
            abbrev |= one_sex
            # podios retirados por ilegibles / tiempos imposibles, o clasificaciones incompletas: se releen
            rev = (load_json("results/revision.json", {}) or {}).get("items", {})
            abbrev |= {rid for rid, v in rev.items() if any(i.get("kind") in ("ilegible", "incompleta") for i in v.get("issues", []))}
            for cid, d in self.state["done"].items():
                if cid in abbrev and d.get("status") == "ok":
                    d["status"] = "redo"
                    continue
                if d.get("status") == "missing":
                    d["tries"] = 0
                elif d.get("status") == "ok" and (d.get("source") in redo_sources or
                                                  any(x.get("cal_id") == cid and x.get("url") in col_urls for x in by_url.values())):
                    d["status"] = "redo"
            for cid in one_sex:
                if cid and cid not in self.state["done"]:
                    self.state["done"][cid] = {"status": "redo"}
            # resultados sueltos que no son de ninguna competición del calendario (lector antiguo): fuera
            for x in _index()["items"]:
                if not x.get("cal_id"):
                    unstore(x["id"])
            self.state["pdf_cache"] = {k: v for k, v in self.state["pdf_cache"].items()
                                       if v.get("events") and v.get("format") not in ("columnas", "generic", "internacional")}
            self.state["version"] = VERSION
        self._rl_index = None
        self._rfea_pdfs = None
        self._cm = None

    def save(self):
        self.state["updated"] = iso_now()
        save_json(STATE, self.state, compact=True)

    # índices (se cargan una vez)
    def rfealive_index(self):
        if self._rl_index is None:
            try:
                self._rl_index = rfealive.index(self.http)
            except Exception:
                self._rl_index = []
        return self._rl_index

    def rfealive_me_index(self):
        if getattr(self, "_rl_me", None) is None:
            try:
                self._rl_me = rfealive.index(self.http, base="https://rfealive.me")
            except Exception:
                self._rl_me = []
        return self._rl_me

    def wa_year(self):
        if getattr(self, "_wa", None) is None:
            try:
                self._wa = worldathletics.calendar(self.http, start=START, end=today().isoformat())
            except Exception:
                self._wa = []
        return self._wa

    def rfea_pdfs(self):
        if self._rfea_pdfs is None:
            try:
                self._rfea_pdfs = rfea.results_index(self.http, pages=8)
            except Exception:
                self._rfea_pdfs = []
        return self._rfea_pdfs

    def cronomancha(self):
        if self._cm is None:
            try:
                self._cm = timers.cronomancha_events(self.http)
            except Exception:
                self._cm = []
        return self._cm

    def detail(self, it):
        url = (it.get("links") or {}).get("info", "")
        if "atletismorfea.es/calendario/campeonato/" not in url:
            return {}
        c = self.state["details"].get(url)
        # competiciones de los últimos 3 días: la ficha se relee cada 2 horas (el PDF de resultados llega tarde)
        recent = it.get("end_date") or it["date"]
        fresh = c and (recent < (today() - dt.timedelta(days=3)).isoformat() or
                       (c.get("_at") or "") >= (dt.datetime.now() - dt.timedelta(hours=2)).isoformat())
        if not fresh:
            try:
                c = rfea.detail(self.http, url)
                c["_at"] = dt.datetime.now().isoformat()
                self.state["details"][url] = c
            except Exception as e:
                return c or {"error": str(e)}
        return c

    def resolve(self, it, have=None):
        """Intenta todas las fuentes. Devuelve (eventos_con_podio, fuente, url, probados).

        Si la primera fuente trae un solo sexo (p. ej. RFEA Live solo tiene la clasificación masculina),
        se siguen mirando las demás y se añaden las pruebas del sexo que falta.
        have=(podios, fuente, url): resultados ya conseguidos por otra vía, que solo hay que completar."""
        from .quality import missing_sexes, event_sex, sexes_in
        tried = []
        best = list(have) if have else None
        need = missing_sexes(best[0], it["name"]) if best else None
        # en pista, un campeonato con 1-2 pruebas está incompleto: se sigue buscando una fuente mejor
        # (en ruta, cross o trail lo normal es una carrera, femenina y masculina)
        track = not re.search(r"ruta|cross|trail|monta|marcha|popular|carrera|milla|marat|legua|san silvestre|km\b",
                              (it.get("type") or "") + " " + it["name"], re.I)
        few = lambda pods: track and len(pods) < 3
        if best and not need and not few(best[0]):
            return best[0], best[1], best[2], tried
        for pods, source, url, _ in self._candidates(it, tried):
            if best is None:
                best, need = [list(pods), source, url], missing_sexes(pods, it["name"])
            elif len(sexes_in(pods)) >= len(sexes_in(best[0])) and len(pods) >= max(3, 2 * len(best[0])):
                # una fuente mucho más completa (RFEA Live a veces solo tiene 1 prueba de todo el campeonato)
                best, need = [list(pods), source, url], missing_sexes(pods, it["name"])
            else:
                extra = [e for e in pods if event_sex(e) in need or (event_sex(e) == "X" and need)]
                have_names = {norm(e["name"]) for e in best[0]}
                extra = [e for e in extra if norm(e["name"]) not in have_names]
                if not extra:
                    continue
                best[0] += extra
                if source not in best[1]:
                    best[1] += " + " + source
                need = missing_sexes(best[0], it["name"])
            if not need and not few(best[0]):
                break
        if best:
            return best[0], best[1], best[2], tried
        return None, None, None, tried

    def _candidates(self, it, tried):
        """Todas las fuentes posibles, en orden de fiabilidad (generador: cada una se prueba solo si hace falta)."""
        links = dict(it.get("links") or {})
        det = self.detail(it)
        for k, v in (det.get("links") or {}).items():
            links.setdefault(k, v)

        # 2. RFEA Live
        chids = _chids(links) + [(x["chid"], rfealive.BASE) for x in it.get("live") or [] if x.get("kind") == "rfealive"]
        if not chids:
            yr = it["date"][:4]
            cands = [c for c in self.rfealive_index() + self.rfealive_me_index()
                     if (c["base"] == rfealive.BASE or yr in c["chid"][:6]) and similar(c["name"], it["name"])]
            cands.sort(key=lambda c: -_overlap(c["name"], it["name"]))
            chids = [(c["chid"], c["base"]) for c in cands[:8]]
        d1 = (dt.date.fromisoformat(it["date"]) - dt.timedelta(days=1)).isoformat()
        d2 = (dt.date.fromisoformat(it.get("end_date") or it["date"]) + dt.timedelta(days=1)).isoformat()
        for chid, base in dict.fromkeys(chids):
            tried.append("RFEA Live %s" % chid)
            try:
                pods, url, dates = from_rfealive(self.http, chid, base)
                if pods and (not dates or any(d1 <= d <= d2 for d in dates)):
                    yield pods, "RFEA Live", url, tried
                    continue
                if pods:
                    tried[-1] += " (otra edición: fechas no coinciden)"
            except Exception as e:
                tried[-1] += " (error: %s)" % str(e)[:60]

        # Competición internacional: World Athletics primero (completo y con nacionalidades)
        if it.get("intl") or re.search(r"mundial|mundo|europa|europeo|world|european", it["name"], re.I):
            for w in self.wa_year():
                if w["date"] <= (it.get("end_date") or it["date"]) and it["date"] <= (w.get("end_date") or w["date"]) \
                        and (similar(w["name"], it["name"]) or similar(_to_en(it["name"]), w["name"])):
                    try:
                        res = worldathletics.results(self.http, w["live"][0]["id"])
                        if res and res["events"]:
                            pods = podiums([{"name": e["name"], "rounds": [r for r in e["rounds"] if r["final"]]} for e in res["events"]])
                            if pods:
                                yield pods, "World Athletics", w["links"].get("info"), tried + ["World Athletics %s" % w["id"]]
                    except Exception:
                        pass
                    break

        # 3. PDF de la ficha RFEA (de confianza) · 4. PDFs del índice RFEA con nombre parecido
        pdfs = [(drive_direct(links[k]), "ficha") for k in ("resultados",)
                if links.get(k, "").lower().split("?")[0].endswith(".pdf") or "drive.google.com" in links.get(k, "")]
        pdfs += [(p["url"], "index") for p in self.rfea_pdfs() if similar(p["title"], it["name"])]
        for u, trust in dict.fromkeys(pdfs):
            tried.append(u)
            try:
                pods, url, why = from_pdf(self.http, it, u, self.state["pdf_cache"], trust)
                if pods:
                    yield pods, "PDF oficial", url, tried
                    continue
                tried[-1] += " (%s)" % why
            except Exception as e:
                tried[-1] += " (error: %s)" % str(e)[:60]

        # 5. World Athletics (enlace directo o búsqueda por nombre y fechas)
        wa_ids = [lv for lv in it.get("live") or [] if lv.get("kind") == "wa"]
        if not wa_ids:
            for w in self.wa_year():
                if w["date"] <= (it.get("end_date") or it["date"]) and it["date"] <= (w.get("end_date") or w["date"]) \
                        and (similar(w["name"], it["name"]) or similar(_to_en(it["name"]), w["name"])):
                    wa_ids = w["live"]
                    break
        for lv in wa_ids:
            if lv.get("kind") == "wa":
                tried.append("World Athletics %s" % lv["id"])
                try:
                    res = worldathletics.results(self.http, lv["id"])
                    if res and res["events"]:
                        pods = podiums([{"name": e["name"], "rounds": [r for r in e["rounds"] if r["final"]]} for e in res["events"]])
                        if pods:
                            yield pods, "World Athletics", it["links"].get("info"), tried
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]

        # 6. Cronomancha
        races = [x for x in it.get("live") or [] if x.get("kind") == "cronomancha"]
        if not races:
            for ev in self.cronomancha():
                if ev["date"] == it["date"] and similar(ev["name"], it["name"]):
                    races = ev["live"]
                    break
        if races:
            pods = []
            for lv in races:
                tried.append("Cronomancha %s" % lv["race"])
                try:
                    r = timers.cronomancha_results(self.http, lv["race"], top=3)
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]
                    continue
                name = lv.get("name") or r["race"]
                for label, rows in (("Hombres", r["top_M"][:3]), ("Mujeres", r["top_F"][:3])):
                    if rows:
                        pods.append({"name": "%s %s" % (name, label), "rounds": [{"round": "Final", "final": True,
                                     "rows": [dict(x, pos=str(i + 1)) for i, x in enumerate(rows)]}]})
                if not r["top_M"] and not r["top_F"] and r["rows"]:
                    pods.append({"name": name, "rounds": [{"round": "General", "final": True, "rows": r["rows"][:3]}]})
            if pods:
                yield pods, "Cronomancha", it["links"].get("resultados"), tried

        # 6b. Sportmaniacs (carreras populares): enlace directo o búsqueda por nombre y fecha
        if it.get("type") in ("Ruta", "Cross", "Trail", "Marcha", "Otras", "Internacional") or not it.get("type"):
            slug = None
            for v in links.values():
                m = re.search(r"sportmaniacs\.com/\w+/races/([a-z0-9-]+)", v or "")
                if m:
                    slug = m.group(1)
                    break
            if not slug:
                from .calendar_build import _tokens
                words = sorted(_tokens(it["name"]), key=len, reverse=True)[:3]
                ordered = [w for w in norm(it["name"]).split() if w in words]
                # varias búsquedas cortas (Sportmaniacs no encuentra si una palabra lleva tilde distinta)
                queries = list(dict.fromkeys([" ".join(ordered[:2]), " ".join(words[:2]), " ".join(words[1:3]), words[0] if words else ""]))
                for q in [q for q in queries if q]:
                    try:
                        for r in sportmaniacs.search(self.http, q):
                            if r.get("date") == it["date"] and similar(r.get("name", ""), it["name"]):
                                slug = r["slug"]
                                break
                    except Exception:
                        pass
                    if slug:
                        break
            if slug:
                tried.append("Sportmaniacs %s" % slug)
                try:
                    pods = sportmaniacs.results(self.http, slug)
                    if pods:
                        yield pods, "Sportmaniacs", "https://sportmaniacs.com/es/races/" + slug, tried
                    else:
                        tried[-1] += " (sin clasificaciones)"
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]

        # 6c. LiveTrail (trail): enlace directo o enlazado desde la web oficial
        lt = next((v for v in links.values() if livetrail.tenant(v)), None)
        if not lt and links.get("web") and it.get("type") in ("Trail", "Ruta", "Otras", None, ""):
            try:
                html = self.http.get(links["web"], timeout=30).text
                m = livetrail.URL.search(html)
                lt = m.group(0) if m and m.group(2) == it["date"][:4] else None
            except Exception:
                pass
        if lt:
            tried.append("LiveTrail %s" % livetrail.tenant(lt))
            try:
                pods = livetrail.results(self.http, lt)
                if pods:
                    yield pods, "LiveTrail", lt, tried
                else:
                    tried[-1] += " (sin clasificaciones)"
            except Exception as e:
                tried[-1] += " (error: %s)" % str(e)[:60]

        # 7. Web oficial / página de resultados → PDFs de clasificaciones
        pages = [links.get("resultados"), links.get("web")]
        for page in [p for p in pages if p and not p.lower().split("?")[0].endswith(".pdf")]:
            if cruzandolameta.RES.search(page.split("?")[0]):
                # Cruzando la Meta: clasificaciones en tablas HTML, filtrables por sexo
                tried.append(page)
                try:
                    pods = cruzandolameta.results(self.http, page)
                    if pods:
                        yield pods, "Cruzando la Meta", page, tried
                        continue
                    tried[-1] += " (sin clasificaciones)"
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]
                continue
            if "faalive" in page:
                # Federación Andaluza: página que solo se ve en navegador → Playwright
                tried.append(page)
                try:
                    fchids, fpdfs = faalive.result_sources(page)
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]
                    continue
                if fchids is None:
                    tried[-1] += " (Playwright no instalado)"
                    continue
                for chid, base in fchids:
                    try:
                        pods, url, _ = from_rfealive(self.http, chid, base)
                        if pods:
                            yield pods, "RFEA Live (vía FAA)", url, tried
                    except Exception:
                        pass
                all_pods = []
                for u in fpdfs:
                    try:
                        pods, url, why = from_pdf(self.http, it, u, self.state["pdf_cache"], "ficha")
                        if pods:
                            all_pods += pods
                    except Exception:
                        pass
                if all_pods:
                    yield all_pods, "Federación Andaluza (PDF)", page, tried
                    continue
                tried[-1] += " (sin resultados en la página)"
                continue
            if "rfealive" in page:
                tried.append(page)
                continue
            for u in pdf_links_in_page(self.http, page):
                tried.append(u)
                try:
                    pods, url, why = from_pdf(self.http, it, u, self.state["pdf_cache"], "web")
                    if pods:
                        yield pods, "Web de la competición (PDF)", url, tried
                        continue
                    tried[-1] += " (%s)" % why
                except Exception as e:
                    tried[-1] += " (error: %s)" % str(e)[:60]
            if not tried or tried[-1] != page:
                tried.append(page + " (sin PDFs de clasificación)")

        rv = next((v for v in links.values() if v and ("avaibooksports.com/inscripcion" in v or "runvasport.es/inscripcion" in v)), None)
        if rv:
            slug = re.search(r"/inscripcion/([^/]+)", rv).group(1)
            pods = self.runvasport(it, "https://www.avaibooksports.com/inscripcion/%s/clasificaciones/" % slug, tried)
            if pods:
                yield pods, "Runvasport (PDF)", links["resultados"], tried
        return

    def runvasport(self, it, page, tried):
        """Clasificaciones de AvaiBook/Runvasport: los PDF 'general' de cada distancia se sirven desde
        inscripciones.runvasport.es (el enlace de AvaiBook da error)."""
        try:
            soup = BeautifulSoup(self.http.get(page).text, "lxml")
        except Exception as e:
            tried.append(page + " (error: %s)" % str(e)[:60])
            return None
        files = []
        for a in soup.find_all("a", href=re.compile(r"/resultados/")):
            h = a["href"]
            if "general" in h.lower() and h not in files:
                files.append(h)
        if not files:  # sin clasificación general: todas las que haya
            files = list(dict.fromkeys(a["href"] for a in soup.find_all("a", href=re.compile(r"/resultados/"))))
        pods = []
        for h in files[:30]:  # una carrera popular puede tener un documento por categoría
            u = urljoin("https://inscripciones.runvasport.es", h)
            tried.append(u)
            try:
                r = self.http.get(u, timeout=90)
                if b"%PDF" not in r.content[:1024]:
                    tried[-1] += " (no es un PDF)"
                    continue
                got = [{k: v for k, v in p.items() if k != "_n"} for p in pdf_columns.parse(r.content)]
                if not got:
                    tried[-1] += " (PDF sin tablas reconocibles)"
                pods += got
            except Exception as e:
                tried[-1] += " (error: %s)" % str(e)[:60]
        return pods or None


def run(http, health, items, max_minutes=None, only_ids=None):
    """Recorre todas las competiciones pasadas de 2026. Reanudable."""
    max_minutes = max_minutes or float(os.environ.get("BACKFILL_MAX_MINUTES", "330"))
    t0 = time.time()
    f = Finder(http, health)
    for cid in drop_bad():  # resultados con un documento descartado a mano: se vuelven a buscar
        f.state["done"].pop(cid, None)
    yesterday = (today() - dt.timedelta(days=1)).isoformat()
    existing = {x["cal_id"] or x["id"]: x for x in _index()["items"]}
    todo = [it for it in items if START <= (it.get("end_date") or it["date"]) <= yesterday]
    if only_ids:
        todo = [it for it in todo if it["id"] in only_ids]
    todo.sort(key=lambda x: x["date"])
    stats = {"total": len(todo), "found": 0, "missing": 0, "skipped": 0}
    stats["remaining"] = 0
    for n, it in enumerate(todo):
        if (time.time() - t0) / 60 > max_minutes:
            stats["remaining"] = len(todo) - n
            health.note("backfill", "info", "Tanda terminada por tiempo; quedan %d competiciones para la siguiente." % stats["remaining"])
            break
        prev = f.state["done"].get(it["id"])
        ex = existing.get(it["id"])
        if prev and prev.get("status") == "redo":
            pass  # se rehace aunque ya tenga resultados (lector mejorado)
        elif ex and ex.get("podios") and not ex.get("link_only"):
            f.state["done"][it["id"]] = {"status": "ok", "source": ex["source"], "at": iso_now()}
            stats["skipped"] += 1
            continue
        if prev and prev.get("status") == "ok" and it["id"] in existing:
            stats["skipped"] += 1
            continue  # (si ya no está en los resultados —retirado por estar mal— se vuelve a buscar)
        if prev and prev.get("status") == "missing" and prev.get("tries", 0) >= 2:
            stats["missing"] += 1
            continue
        try:
            pods, source, url, tried = f.resolve(it)
        except Exception as e:
            pods, source, url, tried = None, None, None, ["error inesperado: %s" % e]
        rid = store(it, {"events": pods, "backfill": True}, source, url) if pods else None
        if rid:
            f.state["done"][it["id"]] = {"status": "ok", "source": source, "events": len(pods), "at": iso_now()}
            stats["found"] += 1
        else:
            if pods:
                tried = tried + ["%s: la revisión automática retiró todos los podios (%s)" % (source, url)]
            if prev and prev.get("status") == "redo":
                # su resultado anterior era de un lector con errores: mejor nada que datos mal.
                # Si solo le faltaba un sexo (lo que tenía está bien), se conserva.
                old = load_json("results/%s.json" % it["id"], {}) or {}
                if not old.get("events") or old.get("format") == "generic" or old.get("source") == "RFEA (PDF)":
                    unstore(it["id"])
            f.state["done"][it["id"]] = {"status": "missing", "tried": tried[-8:], "at": iso_now(),
                                         "tries": (prev or {}).get("tries", 0) + 1}
            stats["missing"] += 1
        if n % 10 == 0:
            f.save()
            write_missing(items, f.state)
    f.save()
    write_missing(items, f.state)
    stats["minutes"] = round((time.time() - t0) / 60, 1)
    health.note("backfill", "info", "Carga histórica: %(found)d con podios nuevos, %(skipped)d ya estaban, %(missing)d sin resultados localizados (%(minutes)s min)." % stats)
    return stats


def write_missing(items, state):
    by_id = {x["id"]: x for x in items}
    miss = []
    for cid, d in state["done"].items():
        if d.get("status") != "missing" or cid not in by_id:
            continue
        it = by_id[cid]
        miss.append({"id": cid, "name": it["name"], "date": it["date"], "place": it.get("place", ""),
                     "source": it.get("source"), "type": it.get("type"), "links": it.get("links", {}),
                     "tried": d.get("tried", []), "checked": d.get("at")})
    miss.sort(key=lambda x: x["date"])
    save_json(MISSING, {"generated": iso_now(), "count": len(miss), "items": miss}, compact=True)
    return len(miss)
