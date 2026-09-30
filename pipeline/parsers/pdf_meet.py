"""Lector de resultados de REUNIONES DE PISTA en PDF con una ficha por atleta en 2-3 líneas.

Formato A (el de muchas federaciones: 'PuestoDorsal Club ... Resultado'), una página por prueba y ronda:
    100 m masculina / 21:00 / Semifinal 1/3 / ... RESULTADOS
    ELOY VAZQUEZ VAZQUEZ 25/10/2008          <- nombre y fecha de nacimiento
    1 50 BARC 2 10.81(.810) q MMP            <- puesto, dorsal, club abreviado, calle, marca
    Atletica Barbanza GA948                  <- club y licencia
Formato B ('Pto. Dorsal Atleta Resultado'):
    29/05/2026 1.500m Femenino Serie 1
    1 56 Paula Isabel Martin Gomez M7230 4:29.16
    A.D. Marathon 31/05/2004
Devuelve pruebas con rondas (la selección del podio la hace backfill.podiums). Sin IA: reglas fijas.
"""
import re

from ..names import clean_name

DATE = re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")
HHMM = re.compile(r"^\d{1,2}:\d{2}$")
MARK = re.compile(r"^(?:\d{1,2}:)?\d{1,2}[.:,]\d{2}(?:[.,]\d{1,3})?$")
NAME_DOB = re.compile(r"^(.+?)\s+\d{1,2}/\d{1,2}/\d{4}$")
ROW_A = re.compile(r"^(\d{1,3})\s+(\d{1,5})\s+(.+)$")
TITLE_B = re.compile(r"^\d{2}/\d{2}/\d{4}\s+(.+?)(?:\s+((?:Serie|Final|Semifinal|Eliminatoria|Ronda|Heat)\b.*))?$", re.I)
ROW_B = re.compile(r"^(\d{1,3})\s+(\d{1,5})\s+(.+?)\s+((?:\d{1,2}:)?\d{1,2}[.:,]\d{2}(?:[.,]\d{1,3})?)(?:\s+\S+)*$")
FIELD = re.compile(r"altura|p[eé]rtiga|longitud|lonxitude|triple|peso|disco|martillo|mart[eé]lo|jabalina|xavelina|salto", re.I)
COMBINED = re.compile(r"decat|heptat|pentat|hexat|octat|combinad", re.I)


def _clean_mark(tok):
    return re.sub(r"\(.*$", "", tok).replace(",", ".")


def _page_a(lines):
    i_res = next((i for i, l in enumerate(lines) if "RESULTADOS" in l.upper()), None)
    if i_res is None:
        return None
    dates = [i for i in range(i_res) if DATE.match(lines[i])]
    if not dates:
        return None
    rest = [l for l in lines[dates[-1] + 1:i_res + 1] if not HHMM.match(l)]
    if not rest:
        return None
    event = rest[0]
    rnd = rest[1] if len(rest) > 1 and not rest[1].upper().startswith(("HORA", "RESULTADOS")) else "Final"
    field = bool(FIELD.search(event))
    rows = []
    for k in range(i_res + 1, len(lines) - 1):
        m1, m2 = NAME_DOB.match(lines[k]), ROW_A.match(lines[k + 1])
        if not (m1 and m2):
            continue
        marks = [_clean_mark(t) for t in m2.group(3).split() if MARK.match(_clean_mark(t))]
        if not marks:
            continue
        club = lines[k + 2].rsplit(" ", 1)[0] if k + 2 < len(lines) and not ROW_A.match(lines[k + 2]) else ""
        rows.append({"pos": m2.group(1), "name": clean_name(m1.group(1))[0], "club": club,
                     "mark": marks[-1] if field else marks[0]})
    return event, rnd, rows


def _page_b(lines):
    out, cur = [], None
    for k, l in enumerate(lines):
        t = TITLE_B.match(l)
        if t and not ROW_B.match(l):
            cur = [t.group(1), t.group(2) or "Final", []]
            out.append(cur)
            continue
        r = ROW_B.match(l)
        if cur and r and not re.search(r"\bSerie \d", r.group(3)):  # las tablas-resumen ("... Serie 1 ... puntos") no
            club = re.sub(r"\s+\d{1,2}/\d{1,2}s?/\d{4}$", "", lines[k + 1]) if k + 1 < len(lines) else ""
            toks = r.group(3).split()
            cut = next((i for i, t in enumerate(toks) if i >= 2 and re.search(r"\d", t)), len(toks))  # licencia 'MA9944'
            cur[2].append({"pos": r.group(1), "name": clean_name(" ".join(toks[:cut]))[0], "club": club, "mark": r.group(4)})
    return out


def parse(pages):
    """pages: texto de cada página. -> [{"name", "rounds": [{"round", "final", "rows"}]}]"""
    events = {}
    order = []
    for text in pages:
        if "(cid:" in text:
            continue  # fuente sin tabla de caracteres: los nombres saldrían pegados y sin tildes, no se publica
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        found = []
        if any(re.match(r"(?i)^puesto\s?dorsal", l) for l in lines):
            a = _page_a(lines)
            if a:
                found.append(a)
        elif any(re.match(r"(?i)^pto\.?\s?dorsal", l) for l in lines):
            found += [tuple(x) for x in _page_b(lines)]
        for event, rnd, rows in found:
            if not rows or COMBINED.search(event):
                continue
            if event not in events:
                events[event] = {}
                order.append(event)
            events[event].setdefault(rnd, []).extend(rows)
    out = []
    for ev in order:
        # 'Final 1/2', 'Final 2/2': finales por tiempos -> se juntan y se ordena por marca (como las series)
        rounds = []
        for r, rows in events[ev].items():
            by_time = re.match(r"(?i)final\s*(\d+\s*/\s*\d+)", r)
            rounds.append({"round": "Carrera %s de la final" % by_time.group(1) if by_time else r,
                           "final": bool(re.match(r"(?i)final", r)) and not by_time and not re.match(r"(?i)final\s*b", r),
                           "rows": rows})
        out.append({"name": ev, "rounds": rounds})
    return out
