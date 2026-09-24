"""World Athletics — worldathletics.org

La web es Next.js: cada página lleva sus datos en <script id="__NEXT_DATA__">.
* Calendario: /competition/calendar-results?startDate=..&endDate=..&offset=N (100 por página).
* Resultados: /competition/calendar-results/results/<id>?day=N
Si la página dejara de traer datos, se usa como respaldo la API GraphQL que usa la
propia web (su clave se busca automáticamente en los scripts públicos de la página).
"""
import json
import re

from ..common import clean, today

BASE = "https://worldathletics.org"
CAL = BASE + "/competition/calendar-results"

# Categorías de World Athletics que siempre nos interesan (OW = JJOO/Mundiales,
# DF = final Diamond League, GW/GL = Diamond League y Continental Tour Gold, A = área).
TOP_CATEGORIES = {"OW", "DF", "GW", "GL", "A"}
TOP_GROUPS = ("diamond league", "world athletics championships", "world athletics indoor",
              "european athletics", "olympic games", "continental tour gold", "world athletics relays",
              "world athletics road running", "world athletics cross country", "world athletics race walking",
              "mediterranean games", "ibero-american", "iberoamerican", "european cup", "european team",
              "world athletics u20", "european athletics u2", "european athletics u18", "world university")

DISCIPLINE_ES = {
    "Outdoor": "Pista Aire libre", "Indoor": "Short Track", "Road Running": "Ruta",
    "Cross Country": "Cross", "Race Walking": "Marcha", "Mountain Running": "Trail",
    "Trail Running": "Trail", "Combined Events": "Pista Aire libre",
}


def _next_data(html):
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        raise RuntimeError("La página de World Athletics ya no trae __NEXT_DATA__")
    return json.loads(m.group(1))["props"]["pageProps"]


def _relevant(ev):
    if (ev.get("venue") or "").endswith("(ESP)"):
        return True
    if (ev.get("rankingCategory") or "") in TOP_CATEGORIES:
        return True
    grp = (ev.get("competitionGroup") or "").lower() + " " + (ev.get("name") or "").lower()
    return any(g in grp for g in TOP_GROUPS)


def _to_item(ev):
    disc = (ev.get("disciplines") or "").split(",")[0].strip()
    venue = clean(ev.get("venue"))
    spain = venue.endswith("(ESP)")
    place = venue
    if spain:
        place = re.sub(r"\s*\(ESP\)$", "", venue)
    return {
        "id": "wa-%s" % ev["id"],
        "name": clean(ev.get("name")),
        "date": ev.get("startDate"),
        "end_date": ev.get("endDate") if ev.get("endDate") != ev.get("startDate") else None,
        "place": place,
        "type": DISCIPLINE_ES.get(disc, disc or "Internacional") if spain else "Internacional",
        "cat": "WA · %s" % (ev.get("rankingCategory") or "—"),
        "intl": not spain,
        "source": "World Athletics",
        "links": {"info": "%s/results/%s" % (CAL, ev["id"])},
        "live": [{"kind": "wa", "id": ev["id"]}],
        "_wa": {"hasResults": ev.get("hasResults"), "hasStartlist": ev.get("hasStartlist"),
                "group": ev.get("competitionGroup")},
    }


def calendar(http, start=None, end=None, max_pages=15):
    t = today()
    start = start or t.replace(month=1, day=1).isoformat()
    end = end or t.replace(year=t.year + (1 if t.month >= 10 else 0), month=12, day=31).isoformat()
    out, offset = [], 0
    for _ in range(max_pages):
        url = "%s?startDate=%s&endDate=%s&offset=%d&isSearchReset=true" % (CAL, start, end, offset)
        pp = _next_data(http.get(url).text)
        block = pp.get("initialEvents") or {}
        res = block.get("results") or []
        out.extend(res)
        hits = block.get("hits") or 0
        offset += 100
        if not res or offset >= hits:
            break
    if not out:
        out = _graphql_calendar(http, start, end)
    return [_to_item(e) for e in out if _relevant(e)]


# ------------------------------------------------------------------ resultados

def results(http, comp_id, only_day=None):
    """Todos los días de resultados de una competición.

    Devuelve las pruebas con: podio de cada final + todos los españoles (ESP) de cualquier ronda.
    """
    first = _next_data(http.get("%s/results/%s" % (CAL, comp_id)).text).get("calendarEventsResults")
    if not first:
        return None
    days = [d["day"] for d in ((first.get("options") or {}).get("days") or [])] or [None]
    if only_day is not None and only_day in days:
        days = [only_day]  # modo directo: solo el día en curso
    comp = first.get("competition") or {}
    events = {}
    for day in days:
        data = first if day in (None, 1) else (  # la página sin ?day es el día 1
            _next_data(http.get("%s/results/%s?day=%s" % (CAL, comp_id, day)).text).get("calendarEventsResults") or {})
        for block in data.get("eventTitles") or []:
            for ev in block.get("events") or []:
                name = _event_es(ev.get("event") or "")
                e = events.setdefault(name, {"name": name, "rounds": []})
                for race in ev.get("races") or []:
                    rows = []
                    for r in race.get("results") or []:
                        comp_ = r.get("competitor") or {}
                        rows.append({
                            "pos": (r.get("place") or "").rstrip("."),
                            "name": _nice_name(comp_.get("name") or ""),
                            "nat": r.get("nationality") or "",
                            "mark": r.get("mark") or "",
                            "wind": r.get("wind") or "",
                            "note": " ".join(x for x in [r.get("records") or "", "Q" if r.get("qualified") else ""] if x),
                        })
                    rname = race.get("race") or ""
                    is_final = bool(re.search(r"\bfinal\b", rname, re.I)) and not re.search(r"semi|qualification", rname, re.I)
                    keep = [x for x in rows if x["nat"] == "ESP"]
                    if is_final:
                        top = rows[:3]
                        keep = top + [x for x in keep if x not in top]
                    if keep:
                        e["rounds"].append({"round": _round_es(rname), "final": is_final, "rows": keep})
    evs = [e for e in events.values() if e["rounds"]]
    return {"competition": {"name": comp.get("name"), "venue": comp.get("venue"),
                            "start": comp.get("startDate"), "end": comp.get("endDate")},
            "events": evs}


def _nice_name(n):
    # 'Gift LEOTLELA' -> 'Gift Leotlela'
    return " ".join(w if not w.isupper() or len(w) <= 2 else w.capitalize() for w in n.split())


EVENT_WORDS = [
    (r"^Men's ", "", " Hombres"), (r"^Women's ", "", " Mujeres"), (r"^Mixed ", "", " Mixto"),
]
EVENT_ES = {
    "Metres Hurdles": "m vallas", "Metres Steeplechase": "m obstáculos", "Metres Race Walk": "m marcha",
    "Kilometres Race Walk": "km marcha", "Metres": "m", "Kilometres": "km", "Half Marathon": "Media maratón",
    "Marathon": "Maratón", "High Jump": "Altura", "Pole Vault": "Pértiga", "Long Jump": "Longitud",
    "Triple Jump": "Triple salto", "Shot Put": "Peso", "Discus Throw": "Disco", "Hammer Throw": "Martillo",
    "Javelin Throw": "Jabalina", "Decathlon": "Decatlón", "Heptathlon": "Heptatlón", "Pentathlon": "Pentatlón",
    "Relay": "relevos", "Road Mile": "Milla en ruta", "Mile": "Milla", "Road": "ruta", "Cross Country": "Cross",
    "Race Walk": "marcha", "Heats": "Series", "Half Marathon Race Walk": "Media maratón marcha",
}


def _event_es(name):
    suffix = ""
    for pat, rep, suf in EVENT_WORDS:
        if re.match(pat, name):
            name = re.sub(pat, rep, name)
            suffix = suf
            break
    for en, es in sorted(EVENT_ES.items(), key=lambda kv: -len(kv[0])):
        name = name.replace(en, es)
    name = re.sub(r"(\d),(\d{3})", r"\1.\2", name)
    name = re.sub(r"(\d) m\b", r"\1m", name)
    return clean(name + suffix)


ROUND_ES = [("Final", "Final"), ("Semi-Final", "Semifinal"), ("Round 1", "Ronda 1"), ("Heat", "serie"),
            ("Qualification", "Clasificación"), ("Preliminary Round", "Ronda preliminar"), ("Group", "Grupo")]


def _round_es(r):
    for en, es in ROUND_ES:
        r = r.replace(en, es)
    return r


# ------------------------------------------------------------------ respaldo GraphQL

def _graphql_endpoint_and_keys(http):
    html = http.get(CAL).text
    endpoint, keys = None, []
    for js in sorted(set(re.findall(r'/_next/static/[^"]+\.js', html))):
        try:
            code = http.get(BASE + js, timeout=30).text
        except Exception:
            continue
        endpoint = endpoint or (re.findall(r"https://graphql[^\"'` ]+/graphql", code) or [None])[0]
        keys += [k for k in re.findall(r"da2-[a-z0-9]{26}", code) if k not in keys]
    return endpoint, keys


def _graphql_calendar(http, start, end):
    endpoint, keys = _graphql_endpoint_and_keys(http)
    if not endpoint or not keys:
        raise RuntimeError("No encuentro la API de World Athletics (ni página ni clave)")
    q = ("query getCalendarEvents($startDate: String, $endDate: String, $limit: Int, $offset: Int) {"
         " getCalendarEvents(startDate: $startDate, endDate: $endDate, regionType: \"world\", limit: $limit,"
         " offset: $offset, hideCompetitionsWithNoResults: false, showOptionsWithNoHits: false) {"
         " hits results { id name venue area rankingCategory disciplines competitionGroup startDate endDate"
         " hasResults hasStartlist } } }")
    for key in keys:
        out, offset = [], 0
        try:
            while True:
                r = http.post(endpoint, json={"query": q, "variables": {"startDate": start, "endDate": end,
                                                                          "limit": 200, "offset": offset}},
                              headers={"x-api-key": key, "origin": BASE}, retries=0)
                block = r.json()["data"]["getCalendarEvents"]
                out += block["results"]
                offset += 200
                if offset >= block["hits"] or not block["results"]:
                    return out
        except Exception:
            continue
    raise RuntimeError("Ninguna clave de la API de World Athletics funciona")
