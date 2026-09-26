"""Ficha de cada atleta a partir de NUESTROS PROPIOS DATOS (sin IA): títulos, medallas,
internacionalidades y liderazgos de 2026. Sirve para elegir, con criterios objetivos, a los
destacados de cada lista de inscritos (previas).

Se reconstruye cada día desde results/*.json, el ranking y la lista de seguimiento.
"""
import glob
import os
import re

from .common import DATA_DIR, load_json, norm, save_json, iso_now
from .quality import label_sex

CHAMP = re.compile(r"campeonato de espa[nñ]a|cto\.? (de )?espa[nñ]a", re.I)
NOT_ABS = re.compile(r"sub[\s-]?\d+|master|m[aá]ster|veteran|universitari|escolar|clubes|federaciones", re.I)
BIG_INTL = re.compile(r"mundial|mundo|world|europe|europeo|europa|juegos (ol|medit)|olympic|diamond league|mediterr|iberoameric|"
                      r"wanda|golden gala|weltklasse|memorial van damme|bislett|prefontaine", re.I)


PARTICLES = {"de", "del", "la", "las", "los", "y", "i", "da", "do", "dos", "das", "van", "von", "der", "di", "el", "al", "ben", "san"}


def tokens(name):
    return [t for t in norm(name).split() if len(t) > 1 and t not in PARTICLES]


def key(name):
    return frozenset(tokens(name))


def family(event):
    """'resistencia' (≥800 m, milla, ruta, cross, marcha, trail, obstáculos) u 'otras' (velocidad, saltos, lanzamientos)."""
    e = norm(event or "")
    if not e:
        return ""
    if re.search(r"km|milla|marat|mitja|media|cross|campo a traves|ruta|marcha|trail|montana|obstac|10k|5k|legua|ultra|carrera", e):
        return "resistencia"
    m = re.search(r"(\d[\d.]*)\s?m\b", e)
    if m:
        try:
            return "resistencia" if float(m.group(1).replace(".", "")) >= 800 else "otras"
        except ValueError:
            pass
    return "otras"


def age_group(text):
    t = norm(text or "")
    if re.search(r"sub\s?(8|10|12|14|16|18)\b|infantil|alevin|benjamin|cadete|juvenil|u18|u16|escolar|20(0[5-9]|1\d)\b", t):
        return "menores"
    if re.search(r"master|veteran|vet\s?\d|\b[mf]\s?\d{2}\b|\bm\d{2}\b|\bf\d{2}\b", t):
        return "master"
    return "absoluta"


def build(extra_watch=None):
    """Devuelve {clave: ficha} y la guarda en state/athletes.json."""
    ath = {}

    def add(name, sex, score, reason, nat="", event="", cat=""):
        k = key(name)
        if len(k) < 2:
            return
        a = ath.setdefault(k, {"name": name, "sex": "", "nat": nat, "score": 0, "reasons": [], "facts": []})
        if sex and not a["sex"]:
            a["sex"] = sex
        if nat and not a["nat"]:
            a["nat"] = nat
        if reason not in a["reasons"]:
            a["reasons"].append(reason)
            a["score"] += score
            a["facts"].append({"text": reason, "score": score, "family": family(event), "cat": age_group(cat or event)})
        # el nombre mejor escrito gana: primero el que empieza por un nombre de pila; luego el más completo
        from .names import sex_from_first_name
        good_new, good_old = bool(sex_from_first_name(name)), bool(sex_from_first_name(a["name"]))
        if (good_new and not good_old) or (good_new == good_old and len(name.split()) > len(a["name"].split())):
            a["name"] = name
        if not a["sex"]:
            a["sex"] = sex_from_first_name(a["name"])

    for f in glob.glob(os.path.join(DATA_DIR, "results", "*.json")):
        base = os.path.basename(f)
        if base in ("index.json", "sin_resultados.json", "revision.json"):
            continue
        d = load_json("results/" + base, {}) or {}
        comp = d.get("name", "")
        champ = bool(CHAMP.search(comp)) and not re.search(r"clubes|liga|por equipos|federaciones", comp, re.I)
        if re.search(r"clubes|liga (joma|iberdrola)|por equipos", comp, re.I):
            continue  # ligas de clubes: puntúan equipos, no dan títulos individuales
        intl = bool(BIG_INTL.search(comp))
        cat = ""
        m = NOT_ABS.search(comp)
        if m:
            cat = " " + m.group(0).title()
        for ev in d.get("events", []):
            for rnd in ev.get("rounds") or [ev]:
                label = "%s %s" % (ev.get("name", ""), rnd.get("round", ""))
                if re.search(r"relevo|4x|equipo|clubes|puntuaci", label, re.I):
                    continue
                # parciales de una prueba combinada ("100 m Decatlón"): no son títulos por sí mismos
                if re.search(r"\b(decatl|heptatl|pentatl|hexatl|octatl)", ev.get("name", ""), re.I) and \
                        re.match(r"^\s*\d|^(longitud|altura|peso|disco|jabalina|p[eé]rtiga|martillo|triple)", ev.get("name", ""), re.I):
                    continue
                sex = label_sex(label)
                if re.search(r"vuelta \d|\bmeta\b|parcial|split|intermediate|km \d+ \d", label, re.I):
                    continue
                evname = re.sub(r"\s+(Hombres|Mujeres|Masculino|Femenino)\b.*", "", ev.get("name", ""), flags=re.I).strip()
                final = rnd.get("final", True)
                for r in rnd.get("rows", [])[:3 if final else 0]:
                    try:
                        pos = int(str(r.get("pos", "")).strip() or 0)
                    except ValueError:
                        continue
                    name, nat = r.get("name", ""), r.get("nat", "")
                    from .names import sex_from_first_name
                    sex = label_sex(label) or sex_from_first_name(name)
                    if intl and nat and nat != "ESP":
                        continue  # en competiciones internacionales solo nos interesan los españoles
                    real_event = bool(re.search(r"\d\s?(m|km)\b|milla|marat|salto|altura|longitud|triple|p[eé]rtiga|peso|disco|"
                                                r"jabalina|martillo|vallas|obst|decatl|heptatl|pentatl|marcha|cross|campo a trav", evname, re.I)) \
                        and not re.search(r"menores|popular|infantil|chupet|benjam|alev|general|m-\d|f-\d|y m-", evname, re.I)
                    if champ and not real_event:
                        champ_here = False
                    else:
                        champ_here = champ
                    if champ_here and not cat:
                        if pos == 1:
                            add(name, sex, 50, "%s de España 2026 de %s" % ("Campeona" if sex == "F" else "Campeón", evname), nat, evname, comp)
                        elif pos in (2, 3):
                            add(name, sex, 30, "Medalla en el Campeonato de España 2026 (%s)" % evname, nat, evname, comp)
                    elif champ_here and cat and pos == 1:
                        add(name, sex, 25, "%s de España%s 2026 de %s" % ("Campeona" if sex == "F" else "Campeón", cat, evname), nat, evname, comp + " " + evname)
                    elif intl and nat == "ESP":
                        add(name, sex, 40, "Internacional con España 2026 (%s)" % comp, nat, evname, comp)
                    elif pos == 1:
                        add(name, sex, 8, "Ganador%s de %s" % ("a" if sex == "F" else "", re.sub(r"\s*-?\s*2026\s*$", "", comp) + " 2026"), nat, evname, comp + " " + evname)
                    elif pos in (2, 3):
                        add(name, sex, 5, "Podio en %s" % (re.sub(r"\s*-?\s*2026\s*$", "", comp) + " 2026"), nat, evname, comp + " " + evname)
            # españoles en competiciones internacionales (aunque no sean podio)
            if intl:
                for rnd in ev.get("rounds") or [ev]:
                    for r in rnd.get("rows", []):
                        if r.get("nat") == "ESP":
                            add(r["name"], label_sex("%s %s" % (ev.get("name", ""), rnd.get("round", ""))), 40,
                                "Internacional con España 2026 (%s)" % comp, "ESP", ev.get("name", ""), comp)
    # líderes del ranking y lista de seguimiento
    for a in (load_json("destacados_base.json", {}) or {}).get("athletes", []):
        why = a.get("why") or "Atleta de seguimiento"
        add(a["name"], a.get("sex", ""), 45 if "ranking" in why.lower() else 35, why)
    save_json("state/athletes.json", {"generated": iso_now(), "count": len(ath),
                                       "athletes": [dict(v, key=sorted(k)) for k, v in ath.items()]}, compact=True)
    return ath


def lookup(ath, name):
    """El mismo atleta: coincide el NOMBRE DE PILA y al menos el primer apellido (sin 'de/la/del'),
    en cualquier orden. Nunca por un nombre y un apellido cualquiera."""
    from .names import MALE, FEMALE
    tk = tokens(name)
    k = frozenset(tk)
    if len(k) < 2:
        return None
    if k in ath:
        return ath[k]
    best = None
    for wk, a in ath.items():
        short, long_ = (k, wk) if len(k) <= len(wk) else (wk, k)
        if len(short) < 2 or not short <= long_:
            continue
        first = tokens(a["name"])[:1]
        if not first or first[0] not in k:
            continue  # el nombre de pila tiene que estar en los dos
        if first[0] not in MALE and first[0] not in FEMALE and len(short) < 3:
            continue  # nombre de pila desconocido (extranjero): exigimos 3 palabras en común
        if not best or a["score"] > best["score"]:
            best = a
    return best
