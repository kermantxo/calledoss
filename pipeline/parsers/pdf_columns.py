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
    ("poscat", r"^(p\.?cat|pcat|pos[.-]?cat)$"),
    ("bib", r"^(dorsal|dors|dor|bib|n[º°]\.?|n\.|no\.|núm\.?|num\.?)$"),
    ("lic", r"^(licencia|licència|lic\.?|llicència)$"),
    ("surname", r"^(apellidos|cognoms|apelidos|abizenak)$"),
    ("given", r"^(nombre|nom|nome|izena)$"),
    ("name", r"^(nombre|apellidos|nom|cognoms|atleta|corredor|corredora|participante|name|surname|nombre/apellidos|nome|apelidos|izena|abizenak)$"),
    ("club", r"^(club|equipo|entidad|team|equip|clube|taldea|club/ciutat|club/ciudad|club/localidad)$"),
    ("time", r"^(tiempo|t[._]?oficial|oficial|marca|time|temps|resultado|neto|t[._]?neto|tiempo\.?oficial|tiempos|t[._]?chip|chip|final|t[._]?final|tempo|denbora)$"),
    ("real", r"^(t[._]?real|real|bruto|t[._]?bruto)$"),
    ("sex", r"^(sexo|genero|género|sex|gen|gender|g|sx)$"),
    ("cat", r"^(categoria|categoría|cat|cat\.|categ|category)$"),
    ("nat", r"^(pais|país|nac\.?|nat|nacionalidad|country)$"),
]
TIME = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?$")
FEM = re.compile(r"\b(fem|femenin[oa]s?|mujer(es)?|women|dones|female|absolutaf|f)\b", re.I)
MASC = re.compile(r"\b(masc|masculin[oa]s?|hombres?|men|homes|male|absolutam|m)\b", re.I)
HEADER_JUNK = re.compile(r"^(diferencia|dif\.?|f\.?nac\.?|fecha|nac\.?|pais|país|t\.?r\.?|ritmo|media|km/h|min/km|vel\.?|"
                         r"vel\.?med\.?|km\.?\d+|possexo|poscat|pos\.?sexo|--|t\.|prom\.?|"
                         r"vuelta|paso|parcial|k\d+|\d+k|pos\.?|gap|diff|retraso|localidad|poblaci[oó]n|provincia|any|nax|control|controlparcial|ultimo|1er|2º|3er|m/km)$", re.I)
TITLE_WORDS = re.compile(r"\b(\d+\s?(km|kms|k|m|mts|metros|millas?)|km|kms|sub\s?\d+|u\d{2}|absolut[oa]?|femenin[oa]|masculin[oa]|mujer(es)?|hombres?|"
                         r"master|m[aá]ster|veteran[oa]s?|senior|j[uú]nior|juvenil|cadete|infantil|alev[ií]n|benjam[ií]n|prebenjam[ií]n|promesa|"
                         r"general|carrera|marcha|cross|milla|relevos?|maraton|marat[oó]n|mitja|media|trail|popular|chupetines|escolar|"
                         r"categor[ií]a|prueba|distancia|fem|masc)\b", re.I)
# en mitad de una tabla solo cuenta como título una línea con distancia, categoría o sexo
STRONG_TITLE = re.compile(r"(\b\d+([.,]\d+)?\s?(km|kms|k|m|mts|metros|millas?)\b|\bsub\s?\d+\b|\bu\d{2}\b|\b(absolut[oa]|femenin[oa]|masculin[oa]|"
                          r"mujeres|hombres|m[aá]ster|veteran[oa]s?|senior|s[eé]nior|j[uú]nior|juvenil|cadete|infantil|alev[ií]n|benjam[ií]n|"
                          r"prebenjam[ií]n|promesa|categor[ií]a|marat[oó]n|milla|marcha|cross|fem|masc)\b)", re.I)
# fila de un corredor sin tiempo (retirado): empieza por su licencia ("CS9083 TORRENT...") o lleva "::"
ROW_LIKE = re.compile(r"^[A-Z]{1,3}[-\s]?\d{3,}\b|::|\b\d+\s+\d+\s+(ABS|Sub\d+|M[aá]ste)", re.I)
SEX_TITLE = re.compile(r"\b(hombres|mujeres|masculin[oa]s?|femenin[oa]s?|men|women)\b", re.I)
BOILER = re.compile(r"^(clasificaci[oó]n( general)?|classificaci[oó] general|resultados?|results?|p[aá]gina \d+( de \d+)?|page \d+( of \d+)?|\d+ de \d+)$", re.I)


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
    kinds0 = {f for f, _ in fields}
    if not ({"surname", "given"} <= kinds0):
        fields = [("name" if f in ("surname", "given") else f, w) for f, w in fields]
    kinds = {f for f, _ in fields if f}
    if not ({"time", "real"} & kinds):
        # "Meta" es la posición si hay otra columna de tiempo; si no, es el tiempo de llegada
        fields = [("time" if (f == "pos" and norm(w["text"]) == "meta") else f, w) for f, w in fields]
        kinds = {f for f, _ in fields if f}
    if len(kinds) >= 3 and ("time" in kinds or "real" in kinds) and ({"name", "surname", "bib", "pos"} & kinds):
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
                # alineado a la izquierda (con 3 pt de margen) o centrado bajo la cabecera ("JUVGR" bajo "Club")
                if w["x0"] + 3 >= s or (cx >= s + 2 and w["x1"] - w["x0"] < 45 and k == len(starts) - 1 or
                                        cx >= s + 2 and w["x1"] - w["x0"] < 45 and k + 1 < len(starts) and w["x1"] <= starts[k + 1]):
                    i = k
        f = cols[i][0]
        # una palabra con letras bajo "Dorsal" o "Pos." es en realidad el principio del nombre
        name_col = next((c for c in cols if c[0] == "name"), None)
        if f in ("bib", "pos") and name_col and re.search(r"[A-Za-zÀ-ÿ]{2,}", w["text"]) \
                and not re.fullmatch(r"(DNF|DNS|DSQ|DQ|NP|RET|ABD)", w["text"]):
            f = "name"
        out.setdefault(f, []).append(w["text"])
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


FEM_WORD = re.compile(r"\b(femenin[oa]s?|mujer(es)?|women|dones|female|fem|mulleres|emakumeak)\b", re.I)
MASC_WORD = re.compile(r"\b(masculin[oa]s?|hombres?|men|homes|male|masc|gizonak)\b", re.I)


def _sex(row, section):
    # 1) palabras completas en la fila (mandan sobre las letras: "MÁSTER F Masculino" es un hombre).
    #    El club NO cuenta: hay clubes que se llaman "FEM el que podem!"
    if not row.get("cat") and row.get("poscat"):
        row = dict(row, cat=re.sub(r"^\d+\s*-?\s*", "", row["poscat"]))  # "1-SrM" -> "SrM"
    for key in ("sex", "cat"):
        v = (row.get(key) or "")
        f, m = bool(FEM_WORD.search(v)), bool(MASC_WORD.search(v))
        if f != m:
            return "F" if f else "M"
    for key in ("sex", "cat"):
        v = (row.get(key) or "").strip()
        if not v:
            continue
        if key == "sex" and v.upper() in ("F", "W", "D", "MUJER", "FEMENINO"):
            return "F"
        if key == "sex" and v.upper() in ("M", "H", "V", "HOMBRE", "MASCULINO"):
            return "M"
        # letra suelta "F"/"M" (ni la F de "FOODS" ni la M de "MARATON") o códigos tipo "F-SENIOR", "SenF", "M35"
        if FEM.search(v) or re.search(r"(?<![A-Za-zÀ-ÿ])[FW](?![A-Za-zÀ-ÿ])|\bFEM\b|\b[FW]\d{2}\b|\dF\b|SenF|VetF|Vt\dF|(?<=[a-z])F\b", v):
            return "F"  # W35, SENIOR W: "women"
        if MASC.search(v) or re.search(r"(?<![A-Za-zÀ-ÿ])M(?![A-Za-zÀ-ÿ])|\bMAS\b|\bMASC\b|\dM\b|SenM|VetM|Vt\dM|(?<=[a-z])M\b", v):
            return "M"
    if FEM.search(section or ""):
        return "F"
    if MASC.search(section or ""):
        return "M"
    return ""


def _nice(name):
    name = re.sub(r"\s+", " ", name).strip(" -")
    if name.count(",") == 1:  # "LATORRE DESCANE, BENJAMIN" -> "BENJAMIN LATORRE DESCANE"
        last, first = [x.strip() for x in name.split(",")]
        if first and last:
            name = first + " " + last
    if name.isupper() or name.islower():
        name = " ".join(w.capitalize() for w in name.split())
    return name


DISTINCT = re.compile(r"^(\d+([.,]\d+)?(km|kms|k|m|mts)?|km|kms|sub\d*|u\d{2}|absolut[oa]?|femenin[oa]s?|masculin[oa]s?|mujeres|hombres|"
                      r"fem|masc|master|veteran[oa]s?|senior|junior|juvenil|cadete|infantil|alevin|benjamin|prebenjamin|"
                      r"promesa|medio|media|maraton|mitja|milla|marcha|cross|relevos|[a-e])$")


def _new_info(new, current):
    """¿Trae el título nuevo una distancia, categoría o sexo que la sección actual no tenía?
    (Un título que solo repite el de la página anterior no abre sección.)"""
    if not current:
        return True
    extra = set(norm(new).split()) - set(norm(current).split())
    return any(DISTINCT.match(t) for t in extra)


def _is_wrapped_cell(ws, cols):
    """¿Es esta línea el trozo de una celda partida (p. ej. 'VETERANO C' / 'Masculino' en la columna
    Categoría), y no un título? Lo es si no empieza en el margen izquierdo y todas sus palabras caen
    en columnas que no son nombre, posición ni dorsal."""
    if len(cols) < 2:
        return False
    # Solo una línea que empieza en la primera columna puede ser un título de sección;
    # cualquier otra es un trozo de celda (apellido, club o categoría que no cabían).
    return min(w["x0"] for w in ws) + 3 >= cols[1][1]


def parse(content=None, pdf=None, max_pages=3000):
    """Devuelve [{name, rounds:[{round, final, rows}]}]: podio general y, si se sabe el sexo,
    podio masculino y femenino de cada sección (distancia/categoría)."""
    rows_all = []      # filas con tiempo: dict(section, row, top, page)
    doc = pdf or pdfplumber.open(io.BytesIO(content))
    try:
        section, cols, last_title, pending, last_secs = "", None, None, None, None
        pending_strong = False
        sex_title = None
        prev_ws_by_text = {}
        prev_text = []
        has_sex_col = False
        for pno, page in enumerate(doc.pages[:max_pages]):
            prev_ws = None
            wrapped = []   # (top, texto) de celdas partidas en esta página
            page_rows = []
            for ws in _lines(page):
                text = clean(" ".join(w["text"] for w in ws))
                top = ws[0]["top"]
                # título de prueba con sexo ("10 km Marcha Absoluto Hombres"): aunque quede lejos de la
                # cabecera de la tabla (horas, ronda, "Análisis de carrera"...), es el título de esa tabla
                if len(text) < 70 and SEX_TITLE.search(text) and STRONG_TITLE.search(text) \
                        and not any(TIME.match(t) for t in text.split()) \
                        and not re.match(r"^\d+\s+\d+\s", text) and sum(1 for t in text.split() if _field(t)) < 2:
                    sex_title = text
                hcols, leftover = _header(ws)
                if not hcols and prev_ws is not None and not any(TIME.match(w["text"]) for w in prev_ws + ws):
                    # cabecera partida en dos líneas ("Orden ... Tiempo" / "Pos. Dorsal Nombre Club")
                    nf_prev = sum(1 for w in prev_ws if _field(w["text"]))
                    nf_cur = sum(1 for w in ws if _field(w["text"]))
                    if nf_prev >= 2 and nf_cur >= 2:
                        hcols, leftover = _header(sorted(prev_ws + ws, key=lambda w: w["x0"]))
                        if hcols and prev_text:
                            prev_text = prev_text[:-1]  # esa línea era media cabecera, no un título
                prev_ws = ws
                if hcols:
                    # las líneas sueltas justo antes de una cabecera eran títulos, no trozos de celda
                    last_top = page_rows[-1]["top"] if page_rows else -1e9
                    wrapped = [w for w in wrapped if w[0] <= last_top + 14]
                    cols = hcols
                    has_sex_col = any(c[0] in ("sex", "cat", "poscat") for c in cols)
                    def _fragment(t):
                        ws_t = prev_ws_by_text.get(t)
                        if not ws_t:
                            return False
                        f = set(_assign(ws_t, hcols).keys())
                        return len(f & {"club", "cat", "sex", "nat"}) >= 2 and "name" not in f
                    cand = [t for t in prev_text[-4:] if t and not BOILER.match(t) and len(t) < 90
                            # una fila sin tiempo (retirado, descalificado...) no es un título: "4881 6429 Sergio ..."
                            and not re.match(r"^\d+\s+(\d{1,2}:\d{2}(:\d{2})?\s+)?\d+\s+\S", t)
                            and not ROW_LIKE.search(t)
                            and not re.search(r"\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}", t)
                            and sum(1 for x in t.split() if _field(x)) < 2  # trozo de cabecera, no título
                            and not _fragment(t)]                          # trozo de una fila partida
                    titled = [t for t in cand if TITLE_WORDS.search(t)]
                    new = None
                    if leftover and len(leftover) > 3 and STRONG_TITLE.search(leftover):
                        new = leftover
                    elif last_title:
                        # título en dos líneas justo antes de la tabla ("Sub8" + "Clasificación Masculina")
                        new = last_title + (" " + titled[-1] if titled and titled[-1] not in last_title else "")
                    elif titled:
                        new = " ".join(titled[-2:]) if len(cand) >= 2 and cand[-2:] == titled[-2:] else titled[-1]
                    elif last_title:
                        new = last_title
                    elif cand and not section:
                        new = cand[-1]
                    if sex_title and not (new and SEX_TITLE.search(new)) \
                            and not (leftover and len(leftover) > 3 and STRONG_TITLE.search(leftover) and SEX_TITLE.search(leftover)):
                        new = sex_title
                    # no se cambia aún: se confirma con la primera fila (ver "pending" más abajo)
                    if new:
                        pending = new
                        pending_strong = _new_info(new, section)
                    prev_text = []
                    last_title = None
                    continue
                if not cols:
                    prev_text.append(text)
                    prev_ws_by_text[text] = ws
                    continue
                row = _assign(ws, cols)
                tval = None
                for key in ("time", "real"):
                    toks = [t for t in (row.get(key) or "").split() if TIME.match(t)]
                    if toks:
                        tval = toks[0]
                        break
                if tval:
                    # el tiempo final es el MAYOR de la fila (parciales, diferencias y ritmo son menores)
                    alltimes = [t for t in text.split() if TIME.match(t) and ":" in t]
                    if alltimes:
                        tval = max(alltimes, key=lambda t: _secs(t) or 0)
                if not tval:
                    near_row = bool(page_rows) and top - page_rows[-1]["top"] <= 14
                    if near_row or _is_wrapped_cell(ws, cols):
                        # trozo de celda del corredor de encima ("Masculino", un apellido, el club...)
                        wrapped.append((top, row))
                        if not near_row:
                            prev_text.append(text)  # lejos de una fila: puede ser el título de la tabla siguiente
                            prev_ws_by_text[text] = ws
                            prev_text = prev_text[-6:]
                        continue
                    # un título tiene que decir distancia o categoría; solo "Masculino"/"Femenino" no basta
                    no_sex = re.sub(r"(?i)\b(masculin[oa]s?|femenin[oa]s?|hombres|mujeres|masc|fem|clasificaci[oó]n)\b", " ", text)
                    is_title = bool(STRONG_TITLE.search(no_sex)) and len(text) < 60 \
                        and not re.match(r"^(DNS|DNF|DSQ|DQ|NP|\d)", text) \
                        and not ROW_LIKE.search(text) \
                        and sum(1 for t in text.split() if _field(t)) < 2  # "Orden Categoría P.Cat ..." es cabecera
                    if not is_title:
                        prev_text.append(text)
                        prev_ws_by_text[text] = ws
                        prev_text = prev_text[-6:]
                        continue
                    last_title = (last_title + " " + text) if last_title else text
                    continue
                cand_title = last_title or pending
                if pending and last_title and SEX_TITLE.search(pending) and not SEX_TITLE.search(last_title):
                    cand_title = pending  # "META (10.000 m)" bajo la cabecera no sustituye a "10 km Marcha Absoluto Hombres"
                if cand_title and cand_title != section:
                    # Solo empieza una clasificación nueva si la primera fila tiene el puesto 1 o un tiempo
                    # menor que el último de la sección actual. Si la tabla simplemente continúa en otra
                    # página (título repetido, nombre de club partido...), se sigue en la misma sección.
                    pos = re.match(r"\d+", (row.get("pos") or "").strip())
                    secs = _secs(tval) or 0
                    strong = pending_strong and cand_title == pending and not last_title
                    if not section or strong or (pos and pos.group(0) == "1") or (last_secs is not None and secs < last_secs):
                        section = cand_title
                last_title = None
                pending = None
                pending_strong = False
                last_secs = _secs(tval)
                if row.get("given") or row.get("surname"):
                    row["name"] = clean("%s %s" % (row.get("given", ""), row.get("surname", "")))
                name = _nice(row.get("name") or "")
                if len(name) < 3 or re.match(r"^[\d\W]+$", name):
                    continue
                page_rows.append({"section": section, "row": row, "top": top, "name": name, "mark": tval})
                sex_title = None  # ya empezó la tabla: el próximo título con sexo será de otra prueba
            # las celdas partidas se unen a la fila más cercana en vertical
            for wtop, wrow in wrapped[:]:
                if not page_rows:
                    break
                near = min(page_rows, key=lambda r: abs(r["top"] - wtop))
                if abs(near["top"] - wtop) < 25:
                    for k, v in wrow.items():
                        near["row"][k] = (near["row"].get(k, "") + " " + v).strip()
            rows_all += page_rows
    finally:
        if pdf is None:
            doc.close()

    groups, order = {}, []
    # secciones cuyo título dice el sexo ("CONTROL A FEMENINO") y cuyas filas casi nunca lo dicen
    # (la columna de categoría es "Sub18", "ABS"...): manda el título
    by_sec = {}
    for r in rows_all:
        by_sec.setdefault(r["section"], []).append(bool(_sex(r["row"], "")))
    title_sex = {sec: ("F" if FEM.search(sec) else "M") for sec, flags in by_sec.items()
                 if (FEM.search(sec or "") or MASC.search(sec or "")) and not (FEM.search(sec) and MASC.search(sec))
                 and sum(flags) < 0.5 * len(flags)}
    for r in rows_all:
        if re.search(r"hand\s?bike|silla|wheelchair|adaptad", r["row"].get("cat") or "", re.I):
            continue  # handbike / silla de ruedas: clasificación aparte, no cuenta para el podio de la carrera
        sex = title_sex.get(r["section"]) or _sex(r["row"], "" if has_sex_col else r["section"])
        for key in ((r["section"], ""), (r["section"], sex)) if sex else ((r["section"], ""),):
            if key not in groups:
                groups[key] = []
                order.append(key)
            club = clean(re.sub(r"\b\d{1,2}:\d{2}\S*|^\d{4}$|\b(19|20)\d{2}\b", " ", r["row"].get("club") or ""))  # sin parciales ni año
            groups[key].append({"name": r["name"], "club": club, "mark": r["mark"],
                                "cat": clean(r["row"].get("cat") or ""), "_s": _secs(r["mark"])})
    # Clasificación general sin columna de sexo: podio femenino y masculino por el nombre de pila.
    # Solo si NINGÚN corredor de sexo desconocido (nombre extranjero, ambiguo) queda por delante del
    # tercer clasificado de ese sexo; si no, no se puede saber el podio y no se inventa.
    from ..names import sex_from_first_name
    for key in list(order):
        section, sx0 = key
        if sx0 or any(k[0] == section and k[1] for k in order) or FEM.search(section or "") or MASC.search(section or ""):
            continue
        seen, rows = set(), []
        for r in sorted((r for r in groups[key] if r["_s"]), key=lambda r: r["_s"]):
            if norm(r["name"]) not in seen:
                seen.add(norm(r["name"]))
                rows.append(r)
        for want in ("F", "M"):
            got = []
            for r in rows:
                s = sex_from_first_name(r["name"])
                if not s:
                    break
                if s == want:
                    got.append(r)
                    if len(got) == 3:
                        break
            if len(got) == 3:
                groups[(section, want)] = got
                order.append((section, want))
    # PDF solo por categorías de edad (Sub20 Femeninas, Senior Masculinos, Master 35...): la clasificación
    # general de cada sexo es la unión de todas sus categorías ordenada por tiempo
    sections = {k[0] for k in order}
    if sections and all(AGE_CAT.search(sec or "") for sec in sections):
        for want in ("F", "M"):
            if sum(1 for k in order if k[1] == want) < 2:
                continue  # una sola categoría de ese sexo: su clasificación ya es la general (no se duplica)
            allrows = [r for k in order if k[1] == want for r in groups[k]]
            best = [min((r["_s"] for r in groups[k] if r["_s"]), default=None) for k in order if k[1] == want]
            best = [b for b in best if b]
            # categorías en carreras distintas (cross: sub-8 corre 500 m): no se juntan
            if best and min(best) < 0.6 * max(best):
                continue
            if len(allrows) >= 3 and ("", want) not in groups:
                groups[("Clasificación general", want)] = allrows
                order.insert(0, ("Clasificación general", want))
    out = []
    sexed = {k[0] for k in order if k[1]}
    both_sexes = {k[0] for k in order if k[1] == "F"} & {k[0] for k in order if k[1] == "M"}
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
        label = clean(re.sub(r"(?i)clasificaci[oó]n( general)?( categor[ií]a)?( por categor[ií]as)?|classificaci[oó]( general)?", "", section)) or "Clasificación"
        label = re.split(r",\s*total|\s+total\.{2,}", label, flags=re.I)[0]
        label = re.sub(r"(?i)\borganiza(do|da)?(\s+por)?\s*:.*$", "", label).strip() or label
        # cabeceras de parciales y palabras de columna pegadas al título ("completo PSx Estado 5KM 10KM 15KM")
        label = re.sub(r"(\b\d+([.,]\d+)?\s?km\b[\s,]*){2,}", " ", label, flags=re.I)
        label = clean(re.sub(r"(?i)\b(completo|psx|estado|distancia:?|pos\.?)(?=\s|$)", " ", label))
        label = " ".join(t for t in label.split() if (norm(t) == "control" or (not _field(t) and not HEADER_JUNK.match(t)))
                         and not re.fullmatch(r"\d+[.,:]\d+[.,:]?\d*|t\.|dif\.|prom\.|km\d+[,.]?\d*", t, re.I)) or label
        seen_w, words = set(), []
        for w in label.split():  # "Absoluta Femenina Absoluta Femenina" -> "Absoluta Femenina"
            k = norm(w)
            if k and k in seen_w:
                continue
            seen_w.add(k)
            words.append(w)
        label = " ".join(words).strip(" -,") or "Clasificación"
        labelled_sex = FEM.search(label) or MASC.search(label)
        if sex:
            if labelled_sex:
                # la sección ya dice el sexo: solo vale si coincide con el de los corredores
                if (sex == "F") != bool(FEM.search(label)):
                    continue
            else:
                label += " " + ("Mujeres" if sex == "F" else "Hombres")
        else:
            if labelled_sex and has_sex_col:
                # el PDF trae el sexo de cada corredor: un podio "femenino/masculino" solo puede salir
                # de ese dato, nunca del título de la sección (evita mezclar hombres y mujeres)
                continue
            if section in both_sexes:
                continue  # ya están el podio femenino y el masculino: la general mixta repite el masculino
            if section in sexed and not labelled_sex:
                label += " · General"
            elif section in sexed and labelled_sex:
                continue  # ya está el podio de ese sexo
        out.append({"name": label[:80], "rounds": [{"round": "General", "final": True, "rows": top}], "_n": len(rows),
                    "_names": [norm(r["name"]) for r in rows]})
    # carreras con clasificación general femenina y masculina: los podios por categoría de edad
    # (veteranos, sub-18...) se quitan; son subclasificaciones y a menudo salen repetidas o cortadas
    general = [o for o in out if re.search(r"(Hombres|Mujeres)$", o["name"]) and not AGE_CAT.search(o["name"])]
    if {o["name"].rsplit(" ", 1)[-1] for o in general} == {"Hombres", "Mujeres"}:
        # subclasificación de la misma carrera: sus corredores están todos en la general de su sexo
        gen_names = {}
        for o in general:
            gen_names.setdefault(o["name"].rsplit(" ", 1)[-1], set()).update(o.get("_names", []))
        def _subset(o):
            if not AGE_CAT.search(o["name"]) or o in general:
                return False
            names = set(o.get("_names", []))
            pool = gen_names.get("Mujeres", set()) | gen_names.get("Hombres", set())
            return bool(names) and len(names & pool) >= 0.8 * len(names)
        out = [o for o in out if not _subset(o)]
    for o in out:
        o.pop("_names", None)
        o.pop("_key", None)
    return out


AGE_CAT = re.compile(r"veteran|s[eé]nior|m[aá]ster|\bsub[\s-]?\d|j[uú]nior|juvenil|cadete|infantil|alev[ií]n|benjam|promesa|"
                     r"\b[MFHWV]\d{2}\b|categor|\bvet\b|\bVET\s?[A-F]\b", re.I)


# ------------------------------------------------------------------ listas de inscritos (sin tiempos)

ENTRY_MARK = re.compile(r"^(mmp|mmt|pb|sb|marca|mejor\s*marca|best|ranking|acreditada)$", re.I)


def parse_entries(content=None, pdf=None, max_pages=3000):
    """Lista de inscritos de un PDF: [{name, sex, club, cat, mark, section, text}].

    Igual que el lector de clasificaciones (por columnas), pero sin exigir un tiempo en cada fila.
    """
    out = []
    doc = pdf or pdfplumber.open(io.BytesIO(content))
    try:
        cols, section, prev_text, surname_first = None, "", [], False
        for page in doc.pages[:max_pages]:
            for ws in _lines(page):
                text = clean(" ".join(w["text"] for w in ws))
                fields = [(_field(w["text"]) or ("mark" if ENTRY_MARK.match(w["text"]) else None), w) for w in ws]
                kinds = {f for f, _ in fields if f}
                if "name" in kinds and len(kinds) >= 2 and len([f for f, _ in fields if f]) >= len(ws) * 0.5:
                    heads = [norm(w["text"]) for w in ws]
                    surname_first = False
                    # "APELLIDOS" y "NOMBRE" como columnas distintas: se leen por separado
                    fields = [("surname" if norm(w["text"]) in ("apellidos", "apellido", "cognoms", "surname", "last") else
                               "given" if norm(w["text"]) in ("nombre", "nom", "name", "first") and
                               any(norm(x["text"]) in ("apellidos", "apellido", "cognoms", "surname") for x in ws) else f, w)
                              for f, w in fields]
                    cols = []
                    for f, w in fields:
                        f = f or ("name" if cols and cols[-1][0] in ("bib", "pos") else None)
                        if f is None:
                            continue
                        if cols and cols[-1][0] == f:
                            cols[-1][2] = w["x1"]
                        else:
                            cols.append([f, w["x0"], w["x1"]])
                    titled = [t for t in prev_text[-3:] if STRONG_TITLE.search(t) and len(t) < 80]
                    if titled:
                        section = titled[-1]
                    prev_text = []
                    continue
                if not cols:
                    prev_text.append(text)
                    continue
                row = _assign(ws, cols)
                if row.get("given") or row.get("surname"):
                    row["name"] = clean("%s %s" % (row.get("given", ""), row.get("surname", "")))
                name = _nice(row.get("name") or "")
                if len(name.split()) < 2 or re.search(r"\d{3,}", name):
                    prev_text.append(text)
                    if STRONG_TITLE.search(text) and len(text) < 60 and not row.get("name"):
                        section = text
                    continue
                mark = ""
                for t in (row.get("mark") or row.get("time") or "").split():
                    if re.match(r"^\d{1,2}([:.,]\d{2}){1,2}$", t):
                        mark = t
                        break
                if surname_first:
                    from ..names import MALE, FEMALE, _strip
                    toks = name.split()
                    i = next((k for k in range(1, len(toks)) if _strip(toks[k]) in MALE or _strip(toks[k]) in FEMALE), None)
                    if i is None and len(toks) >= 3:
                        i = 2  # dos apellidos y luego el nombre
                    if i:
                        name = " ".join(toks[i:] + toks[:i])
                out.append({"name": name, "sex": _sex(row, section), "club": clean(row.get("club") or ""),
                            "cat": clean(row.get("cat") or ""), "mark": mark, "section": section, "text": text})
    finally:
        if pdf is None:
            doc.close()
    return out
