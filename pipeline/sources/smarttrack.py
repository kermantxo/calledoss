"""SmartTrack RFEA (smarttrackrfea.es) — el directo nuevo de la RFEA (p. ej. campeonatos de cross).

La web es una aplicación que lee archivos públicos de Conersys:
* SCH<código>: horario completo con el estado de cada prueba ("Lista de Salida" → "Oficial"), el podio
  (nombres abreviados) y los PDF de cada prueba (lista de salida y resultados oficiales).
* CH<código>: datos del campeonato.
Los archivos vienen comprimidos (gzip). Los resultados completos, con el nombre entero, están en el PDF
de resultados de cada prueba, en formato Conersys (lo lee parsers/pdf_results.py).
"""
import gzip
import json
import re

BASE = "https://conersys-live-d.s3.dualstack.eu-west-3.amazonaws.com/"
WEB = "https://smarttrackrfea.es/sch/"


def _get_json(http, name):
    raw = http.get(BASE + name, timeout=60).content
    if raw[:2] == b"\x1f\x8b":
        raw = gzip.decompress(raw)
    return json.loads(raw.decode("utf-8"))


def _msg(lst, lang="ESP"):
    for x in lst or []:
        if x.get("Lang") == lang:
            return x.get("Msg") or ""
    return (lst or [{}])[0].get("Msg") or ""


def schedule(http, chid):
    """Pruebas del campeonato: [{date, time, event, round, status, done, sex, kind, podium, results_pdf}]."""
    out = []
    for e in _get_json(http, "SCH" + chid):
        reports = {r.get("TypePdf"): r.get("File") for r in e.get("Reports") or []}
        status = _msg(e.get("StsDescription"))
        out.append({
            "date": (e.get("StartDate") or "")[:10],
            "time": e.get("StartTime") or "",
            "event": _msg(e.get("Description")),
            "round": _msg(e.get("PhaseDescription")),
            "status": status,
            "done": (e.get("Status") or 0) >= 100 or status.lower().startswith("oficial"),
            "sex": {"M": "M", "W": "F"}.get(e.get("Gender"), ""),
            "kind": e.get("TypeEvent") or "",
            "podium": [{"pos": r.get("Rank") or "", "name": (r.get("Name") or "").strip(),
                        "club": r.get("GroupLongDes") or "", "mark": r.get("Result") or "", "note": r.get("Record") or ""}
                       for r in e.get("Results") or []],
            "results_pdf": reports.get("Resultados") or "",
            "key": e.get("Key") or "",
            "started": 50 <= (e.get("Status") or 0) < 100,  # 30 horario, 40 lista de salida, 50 empezada, 100 finalizada
        })
    return out


def is_team(ev):
    """Clasificación por equipos (no es una prueba individual)."""
    return "equipos" in (ev.get("event") or "").lower()


def live_rows(http, key, n=8):
    """Clasificación del momento de una prueba en marcha (concursos ronda a ronda, carreras al llegar)."""
    d = _get_json(http, "RES" + key)
    out = []
    for r in d.get("Results") or []:
        if not r.get("Result") or not str(r.get("RankPO") or "").isdigit() or int(r["RankPO"]) >= 9999:
            continue
        a = r.get("Ath") or {}
        club = _msg(a.get("CurrentGroupLong")) if a.get("CurrentGroupLong") else ""
        g, f = (a.get("GivenName") or "").strip().title(), (a.get("FamilyName") or "").strip().title()
        f = re.sub(r"\b(De|Del|La|Las|Los|Y)\b", lambda m: m.group(1).lower(), f)
        name = ("%s %s" % (g, f)).strip() or (a.get("TvName") or a.get("FullName") or "").strip()
        out.append({"pos": str(r["RankPO"]), "name": name, "club": club, "mark": r["Result"], "note": ""})
    out.sort(key=lambda x: int(x["pos"]))
    return out[:n]
