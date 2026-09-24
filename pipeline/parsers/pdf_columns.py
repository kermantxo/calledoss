"""Lector por columnas para PDFs de clasificaciones de cronometradores (ruta, cross, marcha, trail).

Cada empresa usa su propio formato, así que no se lee "por líneas" sino por COLUMNAS:
1. Se localiza la fila de cabecera (Pos, Dorsal, Nombre, Apellidos, Club, Sexo, Categoría, Tiempo...).
2. La posición horizontal de cada palabra (pdfplumber) dice a qué columna pertenece.
3. Con el nombre, el tiempo y el sexo (columna Sexo/Género, la categoría o el título de la sección)
   se saca el podio de cada distancia y sexo, ordenando por tiempo.
"""
import io
import re

import pdfplumber

from ..common import clean, norm

FIELDS = [
    ("pos", r"^(pos|puesto|clas|clasif|clasificacion|p\.?gen|pgen|meta|rk|rank|lloc|posicion|plaza|pto|puest)\.?$"),
    ("possex", r"^(p\.?sex|psex|pos\.?sex|p\.?gen\.?sex)$"),
    ("poscat", r"^(p\.?cat|pcat|pos\.?cat)$"),
    ("bib", r"^(dorsal|dors|dor|bib|n[ºo°]?\.?)$"),
    ("name", r"^(nombre|apellidos|nom|cognoms|atleta|corredor|corredora|participante|name|surname|nombre/apellidos)$"),
    ("club", r"^(club|equipo|entidad|team|equip)$"),
    ("time", r"^(tiempo|t\.?oficial|oficial|marca|time|temps|resultado|neto|t\.?neto|tiempo\.?oficial|tiempos|t\.?chip|chip|final)$"),
    ("real", r"^(t\.?real|real|bruto|t\.?bruto)$"),
    ("sex", r"^(sexo|genero|género|sex|gen|gender|g)$"),
    ("cat", r"^(categoria|categoría|cat|cat\.|categ|category)$"),
    ("nat", r"^(pais|país|nac\.?|nat|nacionalidad|country)$"),
]
TIME = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?$")
FEM = re.compile(r"\b(fem|femenin[oa]s?|mujer(es)?|women|dones|female|absolutaf|f)\b", re.I)
MASC = re.compile(r"\b(masc|masculin[oa]s?|hombres?|men|homes|male|absolutam|m)\b", re.I)
HEADER_JUNK = re.compile(r"^(diferencia|dif\.?|licencia|licència|lic\.?|f\.?nac\.?|fecha|nac\.?|pais|país|t\.?r\.?|ritmo|media|km/h|min/km|vel\.?|"
                         r"vuelta|paso|parcial|k\d+|\d+k|pos\.?|gap|diff|retraso|localidad|poblaci[oó]n|provincia)$", re.I)
TITLE_WORDS = re.compile(r"\b(\d+\s?(km|kms|k|m|mts|metros|millas?)|km|kms|sub\s?\d+|u\d{2}|absolut[oa]?|femenin[oa]|masculin[oa]|mujer(es)?|hombres?|"
                         r"master|m[aá]ster|veteran[oa]s?|senior|j[uú]nior|juvenil|cadete|infantil|alev[ií]n|benjam[ií]n|prebenjam[ií]n|promesa|"
                         r"general|carrera|marcha|cross|milla|relevos?|maraton|marat[oó]n|mitja|media|trail|popular|chupetines|escolar|"
                         r"categor[ií]a|prueba|distancia|fem|masc)\b", re.I)
# en mitad de una tabla solo cuenta como título una línea con distancia, categoría o sexo
STRONG_TITLE = re.compile(r"(\b\d+([.,]\d+)?\s?(km|kms|k|m|mts|metros|millas?)\b|\bsub\s?\d+\b|\bu\d{2}\b|\b(absolut[oa]|femenin[oa]|masculin[oa]|"
                          r"mujeres|hombres|m[aá]ster|veteran[oa]s?|senior|s[eé]nior|j[uú]nior|juvenil|cadete|infantil|alev[ií]n|benjam[ií]n|"
                          r"prebenjam[ií]n|promesa|categor[ií]a)\b)", re.I)
BOILER = re.compile(r"^(clasificaci[oó]n( general)?|classificaci[oó] general|resultados?|results?|p[aá]gina \d+|page \d+|\d+ de \d+)$", re.I)


def _field(word):
    w = norm(word.replace(".", "")) if len(word) > 1 else word.lower()
    raw = word.lower()
    for f, rx in FIELDS:
        if re.match(rx, raw) or re.match(rx, w):
            return f
    return None


def _lines(page):
    words = page.extract_words(keep_blank_chars=False, use_text_flow=False, x_tolerance=1.5)
    rows = []
    for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
        if rows and abs(rows[-1][0] - w["top"]) <= 2.5:
            rows[-1][1].append(w)
        else:
            rows.append([w["top"], [w]])
    return [sorted(ws, key=lambda w: w["x0"]) for _, ws in rows]


def _header(ws):
    fields = [(_field(w["text"]), w) for w in ws]
    kinds = {f for f, _ in fields if f}
    if not ({"time", "real"} & kinds):
        # "Meta" es la posición si hay otra columna de tiempo; si no, es el tiempo de llegada
        fields = [("time" if (f == "pos" and norm(w["text"]) == "meta") else f, w) for f, w in fields]
        kinds = {f for f, _ in fields if f}
    if len(kinds) >= 3 and ("time" in kinds or "real" in kinds) and ({"name", "bib", "pos"} & kinds):
        cols = []
        for f, w in fields:
            f = f or ("name" if cols and cols[-1][0] in ("bib", "pos") else None)
            if f is None:
                continue
            if cols and cols[-1][0] == f:
                cols[-1][2] = w["x1"]
            else:
                cols.append([f, w["x0"], w["x1"]])
        leftovers = " ".join(w["text"] for f, w in fields if not f and not HEADER_JUNK.match(w["text"]))
        return cols, leftovers
    return None, None


def _assign(ws, cols):
    """Palabra → columna: la última cabecera cuyo inicio queda a su izquierda (texto alineado a la izquierda);
    los números se asignan a la cabecera más cercana (suelen ir alineados a la derecha)."""
    out = {}
    starts = [c[1] for c in cols]
    for w in ws:
        cx = (w["x0"] + w["x1"]) / 2
        if re.match(r"^[\d:.,+\-]+$", w["text"]):
            i = min(range(len(cols)), key=lambda k: abs((cols[k][1] + cols[k][2]) / 2 - cx))
        else:
            i = 0
            for k, s in enumerate(starts):
                if w["x0"] + 3 >= s:
                    i = k
        out.setdefault(cols[i][0], []).append(w["text"])
    return {k: " ".join(v) for k, v in out.items()}


def _secs(t):
    t = t.replace(",", ".")
    parts = t.split(":")
    try:
        v = 0.0
        for p in parts:
            v = v * 60 + float(p)
        return v
    except ValueError:
        return None


def _sex(row, section):
    for key in ("sex", "cat"):
        v = (row.get(key) or "").strip()
        if not v:
            continue
        if key == "sex" and v.upper() in ("F", "W", "D", "MUJER", "FEMENINO"):
            return "F"
        if key == "sex" and v.upper() in ("M", "H", "V", "HOMBRE", "MASCULINO"):
            return "M"
        if FEM.search(v) or re.search(r"(^|[^a-z])F($|[^a-z])|F-\d|\dF\b|SenF|VetF|Vt\dF", v):
            return "F"
        if MASC.search(v) or re.search(r"(^|[^a-z])M($|[^a-z])|M-\d|\dM\b|SenM|VetM|Vt\dM", v):
            return "M"
    if FEM.search(section or ""):
        return "F"
    if MASC.search(section or ""):
        return "M"
    return ""


def _nice(name):
    name = re.sub(r"\s+", " ", name).strip(" -")
    if name.isupper() or name.islower():
        name = " ".join(w.capitalize() for w in name.split())
    return name


def parse(content=None, pdf=None, max_pages=80):
    """Devuelve [{name, rounds:[{round, final, rows}]}] con el podio por sección y sexo."""
    groups = {}
    order = []
    doc = pdf or pdfplumber.open(io.BytesIO(content))
    try:
        section, cols, last_title = "", None, None
        prev_text = []
        for page in doc.pages[:max_pages]:
            for ws in _lines(page):
                text = clean(" ".join(w["text"] for w in ws))
                hcols, leftover = _header(ws)
                if hcols:
                    cols = hcols
                    cand = [t for t in prev_text[-4:] if t and not BOILER.match(t) and len(t) < 90
                            and not re.search(r"\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}", t)]
                    titled = [t for t in cand if TITLE_WORDS.search(t)]
                    if leftover and len(leftover) > 3 and TITLE_WORDS.search(leftover):
                        section = leftover
                    elif titled:
                        # títulos en dos líneas ("Sub8" + "Clasificación Masculina")
                        section = " ".join(titled[-2:]) if len(cand) >= 2 and cand[-2:] == titled[-2:] else titled[-1]
                    elif last_title:
                        section = last_title
                    elif cand and not section:
                        section = cand[-1]
                    prev_text = []
                    last_title = None
                    continue
                if not cols:
                    prev_text.append(text)
                    continue
                row = _assign(ws, cols)
                tval = None
                for key in ("time", "real"):
                    toks = [t for t in (row.get(key) or "").split() if TIME.match(t)]
                    if toks:
                        tval = toks[0]
                        break
                if not tval:
                    # ¿línea de título de una nueva sección o continuación del nombre?
                    is_title = bool(STRONG_TITLE.search(text)) and len(text) < 60
                    if not is_title and row.get("name") and len(ws) <= 3 and groups and order:
                        continue
                    prev_text.append(text)
                    if len(prev_text) > 6:
                        prev_text = prev_text[-6:]
                    # un título nuevo cambia de sección (la cabecera puede no repetirse)
                    if text and not BOILER.match(text) and len(text) < 60 and STRONG_TITLE.search(text) \
                            and not re.search(r"\d{5,}", text):
                        last_title = (last_title + " " + text) if last_title else text
                        section = last_title
                    continue
                last_title = None
                name = _nice(row.get("name") or "")
                if len(name) < 3 or re.match(r"^[\d\W]+$", name):
                    continue
                sex = _sex(row, section)
                key = (section, sex)
                if key not in groups:
                    groups[key] = []
                    order.append(key)
                groups[key].append({"name": name, "club": clean(row.get("club") or ""), "mark": tval,
                                    "cat": clean(row.get("cat") or ""), "_s": _secs(tval)})
    finally:
        if pdf is None:
            doc.close()
    out = []
    for key in order:
        seen, rows = set(), []
        for r in groups[key]:
            k = norm(r["name"])
            if r["_s"] and k not in seen:  # el mismo atleta puede salir en la general y en su categoría
                seen.add(k)
                rows.append(r)
        if len(rows) < 2:
            continue
        rows.sort(key=lambda r: r["_s"])
        top = [{"pos": str(i + 1), "name": r["name"], "club": r["club"], "mark": r["mark"], "cat": r["cat"]} for i, r in enumerate(rows[:3])]
        section, sex = key
        label = clean(re.sub(r"(?i)clasificaci[oó]n( general)?( categor[ií]a)?|classificaci[oó]( general)?", "", section)) or "Clasificación"
        if sex and not (FEM.search(label) or MASC.search(label)):
            label += " " + ("Mujeres" if sex == "F" else "Hombres")
        out.append({"name": label[:80], "rounds": [{"round": "General", "final": True, "rows": top}], "_n": len(rows)})
    return out
