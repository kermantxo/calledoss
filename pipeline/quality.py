"""Revisión automática de resultados antes de publicarlos (sin IA, reglas fijas).

* Nombres: siempre "Nombre Apellidos" (ver names.clean_name).
* Sexo: en un podio de mujeres no puede haber un hombre y al revés. Se comprueba con lo que diga
  la propia fila (categoría o sexo: "Masculino", "Femenino", "M-SENIOR"...) y, si no hay dato,
  con el nombre de pila. Un podio que no cuadra NO se publica y queda anotado en
  results/revision.json para revisarlo desde el panel.
"""
import re

from .common import load_json, save_json, iso_now
from .names import clean_name, is_abbreviated, is_incomplete, sex_from_first_name

LABEL_F = re.compile(r"\b(mujeres|femenin[oa]s?|fem|women|dones|female|fémina)\b|women's", re.I)
LABEL_M = re.compile(r"\b(hombres|masculin[oa]s?|masc|men|homes|male)\b|men's", re.I)
MIXED = re.compile(r"\b(mixt[oa]|mixed|general|todos|absoluta?)\b", re.I)
ROW_F = re.compile(r"\b(femenin[oa]|mujer|fem|women)\b|(?<![A-Za-z])F(?![A-Za-z])|^F-|-F\b|SenF|VetF", re.I)
ROW_M = re.compile(r"\b(masculin[oa]|hombre|masc|men)\b|(?<![A-Za-z])M(?![A-Za-z])|^M-|-M\b|SenM|VetM")


def label_sex(label):
    f, m = bool(LABEL_F.search(label)), bool(LABEL_M.search(label))
    if f == m:
        return ""
    return "F" if f else "M"


def row_sex(r):
    """Sexo que dice la propia fila (sexo o categoría); si no, por el nombre de pila."""
    for key in ("sex", "cat"):
        v = str(r.get(key) or "")
        if not v:
            continue
        fw = bool(re.search(r"\b(femenin[oa]|mujer)\b", v, re.I))
        mw = bool(re.search(r"\b(masculin[oa]|hombre)\b", v, re.I))
        if fw != mw:
            return "F" if fw else "M", "categoría"
        if ROW_F.search(v) and not ROW_M.search(v):
            return "F", "categoría"
        if ROW_M.search(v) and not ROW_F.search(v):
            return "M", "categoría"
    s = sex_from_first_name(r.get("name", ""))
    return s, "nombre" if s else ""


def review(res, comp_name=""):
    """Limpia nombres y quita los podios con sexos mezclados. Devuelve (res, avisos)."""
    issues = []
    team = re.compile(r"relevo|4x|equipo|clubes|puntuaci", re.I)
    for ev in res.get("events", []):
        rounds = ev.get("rounds") or [ev]
        keep = []
        for rnd in rounds:
            label = "%s %s" % (ev.get("name", ""), rnd.get("round", ""))
            is_team = bool(team.search(label))
            for r in rnd.get("rows", []):
                if not is_team:
                    r["name"], nat = clean_name(r.get("name", ""), r.get("nat", ""))
                    if nat and not r.get("nat"):
                        r["nat"] = nat
            want = "" if MIXED.search(ev.get("name", "")) and not label_sex(ev.get("name", "")) else label_sex(label)
            wrong = []
            if want and not is_team:
                for r in rnd.get("rows", [])[:3]:
                    s, why = row_sex(r)
                    if s and s != want:
                        wrong.append("%s (%s por %s)" % (r.get("name"), "hombre" if s == "M" else "mujer", why))
            if wrong:
                issues.append({"kind": "sexo", "competition": comp_name, "event": label.strip(),
                               "detail": "Podio de %s con: %s" % ("mujeres" if want == "F" else "hombres", ", ".join(wrong))})
                continue  # este podio no se publica
            for r in rnd.get("rows", [])[:3]:
                if not is_team and (is_abbreviated(r.get("name")) or is_incomplete(r.get("name"))):
                    issues.append({"kind": "nombre", "competition": comp_name, "event": label.strip(),
                                   "detail": "Nombre incompleto: '%s'" % r.get("name")})
            keep.append(rnd)
        if ev.get("rounds") is not None:
            ev["rounds"] = keep
        elif not keep:
            ev["rows"] = []
    res["events"] = [e for e in res.get("events", []) if (e.get("rounds") if e.get("rounds") is not None else e.get("rows"))]
    return res, issues


def record(rid, issues):
    """Guarda los avisos de una competición en results/revision.json (lo muestra el panel)."""
    data = load_json("results/revision.json", {"items": {}}) or {"items": {}}
    items = data.setdefault("items", {})
    if issues:
        items[rid] = {"at": iso_now(), "issues": issues[:40]}
    else:
        items.pop(rid, None)
    data["generated"] = iso_now()
    data["count"] = sum(len(v["issues"]) for v in items.values())
    save_json("results/revision.json", data, compact=True)
