"""Lectura de PDFs de resultados e inscritos con pdfplumber (sin IA).

Formato principal: el que genera Conersys para RFEA (y muchas federaciones autonómicas):

    100 m Hombres
    Ronda 1
    ...
    CARLOS DORADO LOPEZ 11/3/2006
    1 151 CAICS 1 7 1 10.50 +0.0Q
    Facsa - Playas de Castellón SE8724

Cabecera de cada página: nombre del campeonato, sede, ciudad, fechas, fecha del día,
prueba y ronda. Si el PDF no sigue este formato se usa un lector genérico que busca
líneas "puesto  nombre  ...  marca".
"""
import io
import re

import pdfplumber

from ..common import clean

MARK = r"(?:\d{1,2}:\d{2}:\d{2}(?:\.\d{1,2})?|\d{1,2}:\d{2}(?:\.\d{1,2})?|\d{1,3}\.\d{2}(?:\(\.\d{3}\))?|\d{3,5}|DNF|DNS|DQ|NM|NP|NT|DSQ|RET|ABD|DESC)"
EVENT_RE = re.compile(
    r"^(\d[\d.,]*\s?(?:m|km|Km|K)\b.*|Altura.*|Pértiga.*|Longitud.*|Triple.*|Peso.*|Disco.*|Martillo.*|Jabalina.*|"
    r"Decatl[oó]n.*|Heptatl[oó]n.*|Pentatl[oó]n.*|Hexatl[oó]n.*|Octatl[oó]n.*|Marat[oó]n.*|Media Marat[oó]n.*|"
    r"Milla.*|Relevo.*|4x\d+.*|Cross.*|Marcha.*)\s+(Hombres|Mujeres|Mixto|Masculino|Femenino)\b.*$",
    re.I)
ROUND_RE = re.compile(r"^(Final|Ronda \d|Semifinal|Eliminatoria|Serie|Series|Clasificaci[oó]n|Calificaci[oó]n|Combinadas|Final [A-Z]|Carrera)\b.*", re.I)
# «NOMBRE APELLIDOS 11/3/2006»; en concursos detrás van los intentos («15.22 X 15.35», «- - O XO»)
# y los invitados de otra federación llevan «(I)» detrás del nombre
ATTEMPT = r"(?:[XOxo\-r]+|\d{1,2}\.\d{2}|NM|P)"
NAME_DOB = re.compile(r"^([A-Za-zÀ-ÿ'`´\-\. …]+?)(\s*\(I\)\s*|\s+)(\d{1,2}/\d{1,2}/\d{4})(?:\s+" + ATTEMPT + r")*\s*$")
TRAILING_ATTEMPTS = re.compile(r"(?:\s+" + ATTEMPT + r")+\s*$")
# línea de resultado: puesto dorsal CLUBCODE ... marca [viento] [Q/q/...]
# (en algunos campeonatos autonómicos la columna del dorsal va vacía: «1 PAMNA 3 6.87 MMP 8»)
RESULT_LINE = re.compile(r"^(\d{1,3}|DNF|DNS|DQ|-)\s+(?:(\d{1,5})\s+)?([A-Z][A-Z0-9]{1,7}|[0-9][A-Z0-9]{1,7})\s+(.*)$")


def extract_pages(content):
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        # '1 :03:17' -> '1:03:17' (hay cronometradores que separan la hora del resto)
        return [re.sub(r"(?<![\d:])(\d) :(\d{2}:\d{2})", r"\1:\2", p.extract_text() or "") for p in pdf.pages]


def _header(lines):
    """Primeras líneas de la página: campeonato, sede, ciudad, fechas."""
    head = {}
    if len(lines) >= 4:
        head["championship"] = clean(lines[0])
        head["venue"] = clean(lines[1])
        head["city"] = clean(lines[2])
        m = re.search(r"(\d{2}/\d{2}/\d{4})(?:\s*-\s*(\d{2}/\d{2}/\d{4}))?", lines[3])
        if m:
            head["dates"] = [m.group(1), m.group(2) or m.group(1)]
    return head


def _last_mark(rest):
    """Saca la marca (y viento y calificación) del final de la línea."""
    toks = rest.replace("Q", " Q ").replace(" q", " q ").split()
    mark, wind, note = "", "", []
    for t in reversed(toks):
        if t in ("Q", "q", "MMP", "MMT", "RE", "RC", "MPN", "PB", "SB", "LE", "RN", "NR"):
            note.insert(0, t)
            continue
        if re.fullmatch(r"[+-]\d\.\d", t) and not wind and not mark:
            wind = t
            continue
        if re.fullmatch(MARK, t):
            mark = t
            break
    return mark, wind, " ".join(note)


def parse_conersys(pages):
    """Devuelve {"meta":..., "events":[{name, round, date, rows:[{pos,name,club,mark,wind,note}]}]}"""
    events, meta = [], {}
    cur = None
    for text in pages:
        lines = [l for l in (x.strip() for x in text.splitlines()) if l]
        # «60m vallasHombres»: falta el espacio antes del sexo
        lines = [re.sub(r"(?<=[a-zé)])(Hombres|Mujeres|Mixto)\b", r" \1", l) for l in lines]
        if not lines:
            continue
        if not meta:
            meta = _header(lines)
        ev_name, rnd, day = None, None, None
        for l in lines[4:12]:
            if not ev_name and EVENT_RE.match(l):
                ev_name = clean(l)
            elif not ev_name and re.match(r"^(Men's|Women's|Mixed) \S", l) and len(l) < 60:
                from ..sources.worldathletics import _event_es
                ev_name = _event_es(clean(l))
            elif ev_name and not rnd and ROUND_RE.match(l):
                rnd = clean(l)
            m = re.fullmatch(r"(\d{2}/\d{2}/\d{4})", l)
            if m and not day:
                day = m.group(1)
        if not ev_name:
            continue  # portada, horario, leyendas...
        key = (ev_name, rnd or "", day or "")
        if not cur or (cur["name"], cur["round"], cur["date"]) != key:
            cur = {"name": ev_name, "round": rnd or "", "date": day or "", "rows": []}
            events.append(cur)
        pending_name = None
        for l in lines:
            m = NAME_DOB.match(l)
            if m:
                pending_name = m.group(1).rstrip(" …").strip()
                pending_extra = {"born": m.group(3).rsplit("/", 1)[1], "invited": "(I)" in m.group(2)}
                continue
            r = RESULT_LINE.match(l)
            if r and pending_name:
                mark, wind, note = _last_mark(r.group(4))
                cur["rows"].append({"pos": r.group(1), "bib": r.group(2) or "", "name": _nice(pending_name),
                                    "club_code": r.group(3), "mark": mark, "wind": wind, "note": note, "club": "",
                                    **pending_extra})
                pending_name = None
                continue
            if cur["rows"] and not cur["rows"][-1]["club"] and not RESULT_LINE.match(l) and not NAME_DOB.match(l):
                # la línea siguiente al resultado es "Club  Licencia"
                c = re.sub(r"\s+\S*\d\S*…?$", "", TRAILING_ATTEMPTS.sub("", l)).strip()
                if c and len(c) < 60 and not re.match(r"^(Calificaci|Pasos|Leyend|Rank|Nombre|Club|Puesto)", c):
                    cur["rows"][-1]["club"] = c
    events = [e for e in events if e["rows"]]
    return {"meta": meta, "events": _merge_same(events)}


ACTA_EVENT = re.compile(r"^(.{2,50}?)\s+(Abs|Absoluto|Sub\s?\d+|Master|M\d{2}|Todas)?\.?\s*(Masc|Fem|Masculino|Femenino|Hombres|Mujeres|Mixto)\b\.?$", re.I)
ACTA_ROW = re.compile(r"^(\d{1,3})\s+(\d{1,5})\s+(.+?)\s+(\d{1,2}/\d{1,2}/\d{4})\s+(\S+)\s+(.*)$")


def parse_acta(pages):
    """Actas de campeonato con la fila completa en una línea:
    'Heptatlón Abs Masc' / '1 193 Adrian Sanchez Moreno 14/01/2006 PM 2 2:50.70 758'."""
    events, cur = [], None
    for text in pages:
        for raw in text.splitlines():
            l = raw.strip()
            m = ACTA_EVENT.match(l)
            if m and not re.search(r"\d{1,2}/\d{1,2}/\d{4}", l) and (EVENT_RE.match(l) or re.match(r"^(\d|[A-ZÁÉÍÓÚ][a-záéíóúñ]+)", l)):
                name = clean(l)
                name = re.sub(r"\bMasc\b\.?", "Hombres", name)
                name = re.sub(r"\bFem\b\.?", "Mujeres", name)
                if not cur or cur["name"] != name:
                    cur = {"name": name, "round": "Final", "date": "", "rows": []}
                    events.append(cur)
                continue
            r = ACTA_ROW.match(l)
            if r and cur is not None:
                toks = r.group(6).split()
                mark = next((t for t in toks if re.fullmatch(MARK, t) and not re.fullmatch(r"\d{1,2}", t)), "")
                cur["rows"].append({"pos": r.group(1), "bib": r.group(2), "name": _nice(clean(r.group(3))) if r.group(3).isupper() else clean(r.group(3)),
                                    "mark": mark, "club": "", "note": ""})
    # la tabla de combinadas repite la prueba con los puntos totales: nos quedamos con la última aparición
    out = {}
    for e in events:
        if e["rows"]:
            out[e["name"]] = e
    return list(out.values())


def _merge_same(events):
    """Une las páginas de una misma prueba/ronda (una prueba larga ocupa varias páginas)."""
    out = {}
    for e in events:
        k = (e["name"], e["round"], e["date"])
        if k in out:
            seen = {(r["pos"], r["bib"]) for r in out[k]["rows"]}
            out[k]["rows"] += [r for r in e["rows"] if (r["pos"], r["bib"]) not in seen]
        else:
            out[k] = e
    return list(out.values())


def _nice(name):
    return " ".join(w.capitalize() if len(w) > 2 else w.lower() if w in ("DE", "DEL", "LA", "Y") else w.capitalize()
                    for w in name.split())


GENERIC_ROW = re.compile(r"^(\d{1,4})[.º]?\s+(?:\d{1,5}\s+)?([A-ZÁÉÍÓÚÑa-záéíóúñü'´\-\. ,]{5,60}?)\s{1,}(.*?)\s+(" + MARK + r")\b")


def parse_generic(pages, limit=40):
    """Lector de respaldo para PDFs de otros cronometradores: 'puesto nombre ... tiempo'."""
    rows = []
    for text in pages:
        for l in text.splitlines():
            m = GENERIC_ROW.match(l.strip())
            if m:
                rows.append({"pos": m.group(1), "name": clean(m.group(2)).title(), "club": clean(m.group(3))[:50],
                             "mark": m.group(4)})
                if len(rows) >= limit:
                    return rows
    return rows


# ------------------------------------------------------------------ formato internacional (WA / EA / Microplus / Seiko)

INTL_ROW = re.compile(r"^(\d{1,3}|DNF|DNS|DQ)\s+(\d{1,5})\s+(.+?)\s+([A-Z]{3})\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{2,4}|\d{4})\b(.*)$")
INTL_EVENT = re.compile(r"^(?:(Men's|Women's|Mixed)\s+(.+?)(?:\s+-\s+(.+))?|(.+?)\s+(Men|Women|Mixed))$")
INTL_ROUND = re.compile(r"^(Final|Heat \d+ of \d+|Semi-?Final \d* ?(?:of \d+)?|Qualification.*|Group [AB]|Round \d.*)$", re.I)


def parse_international(pages, keep_nat="ESP"):
    events = {}
    for text in pages:
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        name, rnd = None, ""
        for l in lines[:8]:
            m = INTL_EVENT.match(l)
            if m and not name and not re.search(r"\d{4}|RESULTS|RECORD", l):
                from ..sources.worldathletics import _event_es, _round_es
                if m.group(1):
                    name = _event_es("%s %s" % (m.group(1), m.group(2)))
                    rnd = _round_es(m.group(3)) if m.group(3) else rnd
                else:
                    name = _event_es("%s's %s" % (m.group(5), m.group(4)) if m.group(5) != "Mixed" else "Mixed " + m.group(4))
            elif INTL_ROUND.match(l) and not rnd:
                rnd = l
        if not name:
            continue
        final = bool(re.search(r"final", rnd or "Final", re.I)) and not re.search(r"semi|heat|qualif", rnd or "", re.I)
        key = (name, rnd)
        ev = events.setdefault(key, {"name": name, "round": rnd, "date": "", "final": final, "rows": [], "_n": 0})
        for l in lines:
            m = INTL_ROW.match(l)
            if not m:
                continue
            ev["_n"] += 1
            tail = m.group(6).split()
            # primera marca con formato de tiempo/distancia tras la fecha de nacimiento
            # (al final de la línea puede haber parciales en las pruebas de ruta)
            timed = [t for t in tail if re.fullmatch(MARK, t) and (":" in t or "." in t or t.isalpha())]
            mark = timed[0] if timed else next((t for t in reversed(tail) if re.fullmatch(MARK, t)), "")
            notes = " ".join(t for t in tail if t in ("WL", "SB", "PB", "NR", "AR", "CR", "WR", "Q", "q", "NU20R", "WU20R"))
            from ..names import clean_name
            row = {"pos": m.group(1), "bib": m.group(2), "name": clean_name(clean(m.group(3)))[0], "nat": m.group(4),
                   "mark": mark, "note": notes, "club": ""}
            if (final and ev["_n"] <= 3) or m.group(4) == keep_nat:
                ev["rows"].append(row)
    out = []
    for ev in events.values():
        ev.pop("_n", None)
        if ev["rows"]:
            out.append(ev)
    return out


# Edad de cada categoría en la temporada (años cumplidos el 31 de diciembre)
CATEGORY_AGES = {"Sub14": (12, 13), "Sub16": (14, 15), "Sub18": (16, 17), "Sub20": (18, 19), "Sub23": (20, 22)}


def _categories(championship):
    """'Campeonato Navarro Sub 23-Sub 20 ST' -> ['Sub20', 'Sub23']"""
    found = {"Sub%s" % n for n in re.findall(r"\bsub[\s-]?(\d{2})\b", championship or "", re.I)}
    return sorted(c for c in found if c in CATEGORY_AGES)


def split_categories(res):
    """Campeonatos de varias categorías juntas (p. ej. Sub20 y Sub23): en el PDF salen todos los que
    compitieron, también los invitados «(I)» y atletas de otras edades. Se saca la clasificación de cada
    categoría por separado: la final filtrada por año de nacimiento y, si no llega a 3, completada con
    la clasificación de las series. Sin los invitados."""
    meta = res.get("meta") or {}
    cats = _categories(meta.get("championship"))
    year = int((meta.get("dates") or ["//2000"])[0].rsplit("/", 1)[1])
    if len(cats) < 2 or year < 2000:
        return res
    by_name = {}
    for e in res["events"]:
        by_name.setdefault(e["name"], []).append(e)
    out = []
    for name, evs in by_name.items():
        finals = [e for e in evs if re.match(r"^final\b", e["round"] or "", re.I) and not re.match(r"^final b", e["round"] or "", re.I)]
        finals = finals or [e for e in evs if not e["round"]]
        summary = [e for e in evs if re.match(r"^(calificaci[oó]n|clasificaci[oó]n|series)$", e["round"] or "", re.I)]
        for cat in cats:
            lo, hi = CATEGORY_AGES[cat]
            ok = lambda r: r.get("born") and not r.get("invited") and lo <= year - int(r["born"]) <= hi
            rows, seen = [], set()
            for src in finals[:1] + summary[:1]:
                for r in src["rows"]:
                    if ok(r) and r["name"] not in seen and re.match(r"^\d+$", str(r.get("pos", ""))):
                        seen.add(r["name"])
                        rows.append(dict(r))
            for i, r in enumerate(rows):
                r["pos"] = str(i + 1)
            if rows:
                out.append({"name": "%s %s" % (name, cat), "round": "Final", "date": evs[0]["date"], "rows": rows})
    res["events"] = out
    res["categories"] = cats
    return res


def parse(content, pages=None):
    pages = pages if pages is not None else extract_pages(content)
    res = parse_conersys(pages)
    if res["events"]:
        res["format"] = "conersys"
        return split_categories(res)
    intl = parse_international(pages)
    if intl:
        return {"meta": {}, "format": "internacional", "events": intl}
    acta = parse_acta(pages)
    if acta:
        return {"meta": {}, "format": "acta", "events": acta}
    rows = parse_generic(pages)
    return {"meta": {}, "format": "generic", "events": [{"name": "Clasificación", "round": "", "date": "", "rows": rows}] if rows else []}


# ------------------------------------------------------------------ inscritos

RFEA_ENTRY = re.compile(
    r"^(" + MARK + r"|-|NM|SM)?\s*(\S+)\s+([A-ZÁÉÍÓÚÜÑÇ'´\-\. ]+?)\s+([A-Z]{3})\s+(\d{1,2}/\d{1,2}/\d{4})\s+(.+?)"
    r"(?:\s+\d{1,2}/\d{1,2}/\d{4}\s+.*)?$")
EVENT_HEAD = re.compile(r"^(.+?\s(?:Hombres|Mujeres|Mixto))\b")


def parse_startlist(content):
    """PDF de inscritos RFEA ('Marca Lic. Nombre Nac. Fecha Club ... MMT MMP').
    Devuelve [{event, name, club, mark, nat}]."""
    pages = extract_pages(content)
    out, event = [], None
    for text in pages:
        for raw in text.splitlines():
            l = raw.strip()
            m = EVENT_HEAD.match(l)
            if m and EVENT_RE.match(m.group(1)):
                event = clean(m.group(1))
                continue
            if not event:
                continue
            r = RFEA_ENTRY.match(l)
            if r and len(r.group(3).split()) >= 2:
                out.append({"event": event, "name": _nice(clean(r.group(3))), "club": clean(r.group(6))[:60],
                            "mark": r.group(1) or "", "nat": r.group(4)})
    return out
