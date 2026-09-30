"""Lector de clasificaciones de carreras de RUTA en PDF (una fila por corredor, en orden de llegada).

Muchos cronometradores publican tablas con columnas de pasos intermedios, ritmo, categoría...
Este lector se guía por la CABECERA de la tabla:
  * el nombre es lo que queda bajo la cabecera "Nombre / Apellidos / Izena..." hasta la
    siguiente columna (club, sexo, categoría, tiempo...);
  * el tiempo oficial es el PRIMER tiempo de la fila después del nombre (los pasos intermedios
    y el ritmo van siempre detrás);
  * el sexo sale de la propia fila (sexo o categoría) o, si no hay dato, del nombre de pila.
El podio de cada sexo son los tres primeros de ese sexo en el orden de llegada.
Sin IA: solo posiciones de palabras (pdfplumber) y reglas fijas.
"""
import io
import re

import pdfplumber

from ..names import MALE, FEMALE, _strip, clean_name
from ..quality import row_sex

TIME = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}(?:[.,]\d{1,3})?$")
NAME_HDR = re.compile(r"^(nombre|apellidos|apellido|abizenak|izena|izen-abizenak|atleta|nom|cognoms|name|corredor|corredora|"
                      r"participante|deportista|izena-abizena)\b", re.I)
PUNCT = re.compile(r"^[/,;:\-–|]+$")
TIME_HDR = re.compile(r"^(tiempo|t\.?\s?oficial|oficial|ofiziala|denbora|marca|real|neto|chip|time|temps|final|meta)", re.I)
DISTANCE = re.compile(r"\b(\d+([.,]\d+)?\s?(k|km|kms)\b|\d+\s?k\b|media\s+marat|medio\s+marat|maratoi\s+erdia|\bmm\b|marat[oó]n|maratoi|"
                      r"milla|\d{3,5}\s?m\b|ultra)", re.I)


CAT_WORD = re.compile(r"^(s\.?[mf]\.?|popular|sub-?\d*|velocidad|senior|s[eé]nior|m[aá]ster|vet\w*|[mf]\d{2}|abs|absoluta?|"
                      r"federad[oa]|promesa|junior|juvenil|cadete|infantil|alev[ií]n|benjam[ií]n)$", re.I)
PARTIAL = re.compile(r"\b(parcial|paso|split|intermedi)", re.I)


def _title(text):
    t = re.sub(r"\b\d{1,2}([/-]\d{1,2})?/\d{1,2}/\d{2,4}\b", " ", text)
    t = re.sub(r"(?i)\b(clasificaci[oó]n( final| general)?|resultados?( oficiales)?|results?)\b", " ", t)
    t = re.sub(r"[-_]{3,}.*$", " ", t)
    return re.sub(r"\s+", " ", t).strip(" ,.-:")


def _lines(page):
    words = page.extract_words(keep_blank_chars=False, use_text_flow=False, x_tolerance=1.5)
    rows = []
    for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
        if rows and abs(rows[-1][0] - w["top"]) <= 2.5:
            rows[-1][1].append(w)
        else:
            rows.append([w["top"], [w]])
    out = []
    for _, ws in rows:
        # "4'36''" (minutos y segundos con comillas) -> "4:36"
        ws = [dict(w, text=re.sub(r"^(\d{1,2})['’](\d{2})(?:''|\"|’’|”)?$", r"\1:\2", w["text"])) for w in ws]
        ws = sorted(ws, key=lambda w: w["x0"])
        joined = []
        for w in ws:  # '1 :03:17' -> '1:03:17'
            if joined and re.fullmatch(r"\d{1,2}", joined[-1]["text"]) and re.match(r"^:\d{2}:\d{2}", w["text"]) \
                    and w["x0"] - joined[-1]["x1"] < 12:
                joined[-1] = dict(joined[-1], text=joined[-1]["text"] + w["text"], x1=w["x1"])
            else:
                joined.append(w)
        out.append(joined)
    return out


def _header(ws):
    """(x inicio del nombre, x fin del nombre, x del club o None) si la línea es la cabecera de la tabla."""
    idx = [i for i, w in enumerate(ws) if NAME_HDR.match(w["text"])]
    if not idx:
        return None
    first, last = idx[0], idx[-1]
    # palabras de la cabecera del nombre seguidas ("Apellidos, nombre", "Abizenak / Izena")
    while last + 1 < len(ws) and (PUNCT.match(ws[last + 1]["text"]) or NAME_HDR.match(ws[last + 1]["text"])):
        last += 1
    after = [w for w in ws[last + 1:] if not PUNCT.match(w["text"])]
    if not after:
        return None
    if not any(TIME_HDR.match(w["text"]) for w in ws) and len(after) < 2:
        return None
    club = next((w["x0"] for w in after if re.match(r"^(club|kluba|equipo|team|entidad)", w["text"], re.I)), None)
    surname_first = bool(re.match(r"^(apellido|abizen|cognom)", ws[first]["text"], re.I))
    return ws[first]["x0"], after[0]["x0"], club, surname_first


# códigos de categoría con el sexo: SENM, SNM-22, V45F, M45M-27, SUB23F, M-154, F-3, F40, M, F
CAT_SEX = re.compile(r"^(?:SEN|SN|SR|SNR|SENIOR|VET|VT|V\d{2}|M\d{2}|F\d{2}|MAS|MST|MASTER|SUB\d{2}|S\d{2}|U\d{2}|JUN|JR|JUV|"
                     r"PROM|PRO|CAD|INF|ABS|ELI|ELITE|GEN)?[-_]?([MF])(?:[-_]?\d{1,3})?$|^([MF])\d{2}$")
WORD_SEX = re.compile(r"\b(masculin[oa]|femenin[oa]|hombres?|mujer(es)?|gizon|emakume)", re.I)


def _sex(r):
    """Sexo de la fila: palabra (MASCULINO/FEMENINO), código de categoría (SENM, V45F, M-1, F40, SNF-2...),
    columna de sexo (M/F/H/D) o, si no hay nada, el nombre de pila."""
    cat = r.get("cat", "")
    m = WORD_SEX.search(cat)
    if m:
        return "F" if re.match(r"(?i)fem|mujer|emakume", m.group(1)) else "M"
    found = set()
    for t in cat.split():
        t = t.upper().strip("()")
        if t in ("H", "D"):
            found.add("M" if t == "H" else "F")
            continue
        c = CAT_SEX.match(t)
        if c and re.search(r"[A-Z]", t):
            found.add(c.group(1) or c.group(2))
    if len(found) == 1:
        return found.pop()
    s = row_sex({"name": r.get("name", "")})[0]
    if s:
        return s
    # 'Fernandez Nicolas' (nombre y apellido cambiados en el propio PDF): si solo una palabra es un
    # nombre de pila conocido, vale esa
    sx = {("M" if _strip(t) in MALE else "F") for t in r.get("name", "").split()[1:]
          if (_strip(t) in MALE) != (_strip(t) in FEMALE)}
    return sx.pop() if len(sx) == 1 else ""


def _secs(t):
    p = [float(x) for x in t.replace(",", ".").split(":")]
    return p[0] * 3600 + p[1] * 60 + p[2] if len(p) == 3 else p[0] * 60 + p[1]


def _given_last(toks):
    """'CABANILLES AÑÓ XAVI' -> 'XAVI CABANILLES AÑÓ' (apellidos delante y sin coma).
    'MANGUSHO . NICKSON KIPLANGAT': el punto ocupa el segundo apellido que no tiene."""
    known = MALE | FEMALE
    if "." in toks:
        k = toks.index(".")
        return toks[k + 1:] + toks[:k] if 0 < k < len(toks) - 1 else None
    if len(toks) >= 3 and _strip(toks[2]) in known:
        return toks[2:] + toks[:2]  # dos apellidos y el nombre (o nombres) detrás
    i = len(toks)
    while i - 1 >= 1 and _strip(toks[i - 1]) in known:
        i -= 1
    if i == len(toks):
        return None  # no se sabe dónde empieza el nombre de pila
    return toks[i:] + toks[:i]


def _row(ws, hdr):
    x_name, x_stop, x_club, surname_first = hdr
    if not ws or not re.fullmatch(r"\d{1,5}", ws[0]["text"]):
        return None
    pos = int(ws[0]["text"])
    name, rest, club, times = [], [], [], []
    for w in ws[1:]:
        t = w["text"]
        if w["x0"] < x_stop - 1 and not name and re.fullmatch(r"\d+", t):
            continue  # dorsal / otra posición delante del nombre
        if w["x0"] < x_stop - 1 and not times and not TIME.match(t):
            name.append(t)
            continue
        m = re.search(r"(\d{1,2}:\d{2}:\d{2}(?:[.,]\d{1,3})?)$", t)   # 'VALLADOLID01:11:01'
        if TIME.match(t) or (m and not TIME.match(t)):
            times.append(t if TIME.match(t) else m.group(1))
            continue
        if x_club is not None and w["x0"] >= x_club - 2 and not times and not re.search(r"\d", t):
            club.append(t)
        rest.append(t)
    toks = [x for x in " ".join(name).replace(",", " , ").split()]
    # palabras de la columna de categoría pegadas al nombre ('S.M.', 'Popular', 'Sub', 'Velocidad')
    while toks and CAT_WORD.match(toks[-1]):
        toks.pop()
    while toks and CAT_WORD.match(toks[0]):
        toks.pop(0)
    if not surname_first or "," in toks:
        toks = [x for x in toks if x != "."]
    if not times or not re.search(r"[A-Za-zÀ-ÿ]{2,}", " ".join(toks)):
        return None
    if surname_first and "," not in toks:
        re_ordered = _given_last([x for x in toks if x != ","])
        if not re_ordered:
            return {"pos": pos, "name": "", "times": times, "club": "", "cat": " ".join(rest), "unknown": True}
        toks = re_ordered
    nm, _ = clean_name(" ".join(toks).replace(" , ", ", "))
    if len(nm.split()) < 2:
        return None
    return {"pos": pos, "name": nm, "club": " ".join(club).title(), "times": times, "cat": " ".join(rest)}


def _sex_from_split_ranks(rows):
    """Muchos cronometradores ponen, junto a cada paso, el puesto del atleta DENTRO DE SU SEXO: '(2) (2) (1)'.
    Si en esta clasificación eso se cumple para todos los de sexo conocido, sirve para saber el sexo de
    los que no lo tienen (nombres que no conocemos). Si no se cumple siempre, no se usa."""
    def last_rank(r):
        m = re.findall(r"\((\d+)\)", r.get("cat", ""))
        return int(m[-1]) if m else None
    seen = {"M": 0, "F": 0}
    checks, fits, guess = 0, 0, {}
    for i, r in enumerate(rows):
        sx = "" if r.get("unknown") else _sex(r)
        rk = last_rank(r)
        exp = {k: v + 1 for k, v in seen.items()}
        if sx in ("M", "F"):
            other = exp["F" if sx == "M" else "M"]
            if rk is not None and abs(exp[sx] - other) > 8:  # si lo esperado para uno y otro sexo casi coincide, no se puede comprobar
                checks += 1
                fits += abs(rk - exp[sx]) < abs(rk - other)
            seen[sx] += 1
        elif rk is not None:
            dm, df = abs(rk - exp["M"]), abs(rk - exp["F"])
            if abs(dm - df) > 6 and max(dm, df) > 2 * min(dm, df) + 3:
                guess[i] = "M" if dm < df else "F"
                seen[guess[i]] += 1
    if checks >= 10 and fits >= 0.98 * checks:
        for i, sx in guess.items():
            rows[i]["split_sex"] = sx


def parse(content):
    """Pruebas con el podio femenino y masculino: [{"name", "rounds": [...]}]."""
    sections = []          # [título, [filas]]
    hdr, title, pending_title, last_pos = None, "", "", 0
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            for ws in _lines(page):
                text = " ".join(w["text"] for w in ws)
                h = _header(ws)
                if h:
                    hdr = h
                    if pending_title:
                        title, pending_title = pending_title, ""
                    continue
                r = _row(ws, hdr) if hdr else None
                if r:
                    if not sections or sections[-1][0] != title or r["pos"] < last_pos and r["pos"] == 1:
                        sections.append([title, []])
                    sections[-1][1].append(r)
                    last_pos = r["pos"]
                    continue
                if DISTANCE.search(text) and len(text) < 90 and not TIME.match(ws[-1]["text"]) \
                        and not any(NAME_HDR.match(w["text"]) for w in ws) \
                        and sum(1 for w in ws if TIME_HDR.match(w["text"])) < 2 \
                        and not re.search(r"(?i)\b(dif\.?|ritmo|m/km|min/km)(\s|$)", text):
                    pending_title = _title(text)
                    if not title:
                        title = pending_title
    events = []
    for title, rows in sections:
        if PARTIAL.search(title):
            continue  # pasos intermedios (maratón dentro de un 100 km...), no son una prueba
        rows.sort(key=lambda r: r["pos"])
        # tiempo oficial: el primero de la fila que no sea menor que el del anterior (así no se toma
        # la diferencia con el primero ni el ritmo)
        prev = 0
        for r in rows:
            ok = [t for t in r["times"] if _secs(t) >= prev - 1]
            r["mark"] = ok[0] if ok else ""
            if r["mark"]:
                prev = _secs(r["mark"])
        rows = [r for r in rows if r["mark"]]
        _sex_from_split_ranks(rows)
        n_before = len(events)
        for sex, label in (("M", "Hombres"), ("F", "Mujeres")):
            pod, sure = [], True
            for r in rows:
                sx = "" if r.get("unknown") else (_sex(r) or r.get("split_sex", ""))
                if not sx:
                    sure = False  # no se sabe si es hombre o mujer: el podio de este sexo no sería seguro
                    break
                if sx == sex:
                    pod.append(r)
                    if len(pod) == 3:
                        break
            # menos de tres solo si se ha leído la clasificación entera (hubo menos de tres llegadas)
            if len(pod) < 3 and not (sure and pod):
                continue
            events.append({"name": ("%s %s" % (title, label)).strip(), "rounds": [{
                "round": "General", "final": True,
                "rows": [{"pos": str(i + 1), "name": r["name"], "club": r["club"], "mark": r["mark"]} for i, r in enumerate(pod)]}]})
        # clasificación absoluta en la que no se puede separar por sexo con seguridad: el podio absoluto, tal cual
        top = [r for r in rows if not r.get("unknown")][:3]
        if len(events) == n_before and len(top) == 3 and all(int(r["pos"]) == i + 1 for i, r in enumerate(top)):
            events.append({"name": ("%s General" % title).strip(), "rounds": [{
                "round": "General", "final": True,
                "rows": [{"pos": str(i + 1), "name": r["name"], "club": r["club"], "mark": r["mark"]} for i, r in enumerate(top)]}]})
    return events
