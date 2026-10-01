"""PÁGINAS DE RESULTADOS PARA GOOGLE: una página HTML por competición con resultados.

calledoss.com/resultados/<competición>-<fecha>  (archivo public/resultados/<...>.html)
calledoss.com/en/results/<competición>-<fecha>  (la misma en inglés, public/en/results/<...>.html)

Cada página lleva su título, su descripción, la fecha, el lugar, la fuente oficial, los podios
femeninos y masculinos y los españoles, todo escrito en el propio HTML (Google lo lee sin
esperar a que cargue nada). También se rehace sitemap.xml con todas las páginas.

Se ejecuta una vez al día (GitHub Actions) y el resultado se guarda en la rama main, que es la
que publica Cloudflare.   Uso:  python -m pipeline.run paginas
"""
import html
import json
import os
import re

from .common import load_json, slugify

BASE = "https://calledoss.com"
ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "public", "resultados")
OUT_EN = os.path.join(ROOT, "public", "en", "results")
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
         "octubre", "noviembre", "diciembre"]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
          "October", "November", "December"]
SECTIONS = [("", "1.0", "hourly"), ("calendario", "0.9", "daily"), ("resultados", "0.9", "hourly"),
            ("directo", "0.7", "hourly"), ("proximas", "0.8", "daily"), ("ranking", "0.8", "daily"),
            ("contacto", "0.3", "monthly"), ("cookies", "0.2", "yearly"),
            ("en/", "0.9", "hourly"), ("en/calendar", "0.8", "daily"), ("en/results", "0.8", "hourly"),
            ("en/live", "0.6", "hourly"), ("en/upcoming", "0.7", "daily"), ("en/rankings", "0.7", "daily"),
            ("en/contact", "0.3", "monthly"), ("en/cookies", "0.2", "yearly")]
NAV = {
    "es": [("/", "Inicio"), ("/calendario", "Calendario"), ("/resultados", "Resultados"), ("/directo", "En directo"),
           ("/proximas", "Próximas"), ("/ranking", "Ranking"), ("/contacto", "Contacto")],
    "en": [("/en/", "Home"), ("/en/calendar", "Calendar"), ("/en/results", "Results"), ("/en/live", "Live"),
           ("/en/upcoming", "Upcoming"), ("/en/rankings", "Rankings"), ("/en/contact", "Contact")],
}
# Textos fijos de la página en cada idioma
TXT = {
    "es": {"results": "Resultados", "title": "%s%s: resultados · Calledoss", "source": "Fuente", "women": "Femenino",
           "men": "Masculino", "events": "Pruebas", "spaniards": "Españoles", "all": "← Todos los resultados de la temporada",
           "home": "Ir a la página principal de Calledoss", "sections": "Secciones", "sport": "Atletismo",
           "switch": ("EN", "en", "English version")},
    "en": {"results": "Results", "title": "%s%s: results · Calledoss", "source": "Source", "women": "Women",
           "men": "Men", "events": "Events", "spaniards": "Spaniards", "all": "← All results this season",
           "home": "Go to the Calledoss home page", "sections": "Sections", "sport": "Athletics",
           "switch": ("ES", "es", "Versión en español")},
}


def e(s):
    return html.escape(str(s or ""), quote=True)


# ------------------------------------------------------------------ inglés (mismo diccionario que la web: en.js)
_EN = None


def _en():
    """Diccionario y reglas de en.js, con las expresiones pasadas a Python."""
    global _EN
    if _EN is None:
        with open(os.path.join(ROOT, "en.js"), encoding="utf-8") as f:
            src = f.read()
        d = json.loads(src[src.index("{"):src.rindex("}") + 1])

        def rx(p, flags=re.I):
            return re.compile(p.replace("«", r"(?<![^\W\d_])").replace("»", r"(?![^\W\d_])"), flags)

        def rep(r):
            return re.sub(r"\$(\d)", r"\\g<\1>", r)
        d["_rules"] = [(rx(r[0]), rep(r[1]), len(r) > 2 and bool(r[2])) for r in d["rules"]]
        d["_reasons"] = [(re.compile(p), rep(r)) for p, r in d["reasons"]]
        d["_title"] = rx(d["title_re"])
        _EN = d
    return _EN


def td(s, lang="en"):
    """Traduce un texto de los datos (prueba, ronda, aviso) igual que td() de script.js."""
    if lang != "en" or not s:
        return s
    d = _en()
    s = str(s)
    if s in d["text"]:
        return d["text"][s]
    titulo = bool(d["_title"].search(s))
    for regex, r, solo_generico in d["_rules"]:
        if not (solo_generico and titulo):
            s = regex.sub(r, s)
    return s


def fecha(iso, lang="es"):
    y, m, d = iso.split("-")
    if lang == "en":
        return "%d %s %s" % (int(d), MONTHS[int(m) - 1], y)
    return "%d de %s de %s" % (int(d), MESES[int(m) - 1], y)


def page_slug(item):
    return "%s-%s" % (slugify(item["name"], 60), item["date"])


def page_url(item, lang="es"):
    return "%s/%s/%s" % (BASE, "en/results" if lang == "en" else "resultados", page_slug(item))


def _medal(r):
    return " m%s" % r["pos"] if str(r.get("pos")) in ("1", "2", "3") else ""


def _rows(rows):
    out = []
    for r in rows:
        esp = " 🇪🇸" if r.get("nat") == "ESP" else ""
        club = '<small>%s</small>' % e(r.get("club")) if r.get("club") and r.get("club") != "—" else ""
        out.append('<tr><td class="rk%s">%s</td><td><b>%s</b>%s%s</td><td class="mark">%s</td></tr>'
                   % (_medal(r), e(r.get("pos")), e(r.get("name")), esp, club, e(r.get("mark"))))
    return "".join(out)


def _events(events, lang="es"):
    T = TXT[lang]
    blocks = {"F": [], "M": [], "X": []}
    for ev in events:
        rounds = ev.get("rounds") if ev.get("rounds") is not None else [ev]
        body = ""
        for rnd in rounds:
            rows = rnd.get("rows") or []
            if not rows:
                continue
            body += '<h4>%s</h4><table class="rank"><tbody>%s</tbody></table>' % (e(td(rnd.get("round") or "Final", lang)), _rows(rows))
        if body:
            blocks[ev.get("sex") if ev.get("sex") in ("F", "M") else "X"].append(
                '<div class="event-block"><h3>%s</h3>%s</div>' % (e(td(ev.get("name"), lang)), body))
    out = ""
    for sex, label in (("F", T["women"]), ("M", T["men"]), ("X", T["events"])):
        if blocks[sex]:
            out += '<h2>%s</h2><div class="roster-grid">%s</div>' % (label, "".join(blocks[sex]))
    return out


def _desc(item, lang):
    name, date = item["name"], item["date"]
    esp = item.get("espanoles") or []
    sexes = item.get("n_sexo") or {}
    place = ", " + item["place"] if item.get("place") else ""
    if lang == "en":
        which = " and ".join(x for x, k in (("women's", "F"), ("men's", "M")) if sexes.get(k))
        return "Results from %s (%s%s): %spodiums%s." % (
            name, fecha(date, "en"), place, which + " " if which else "", " and the %d Spaniards" % len(esp) if esp else "")
    which = " y ".join(x for x, k in (("femenino", "F"), ("masculino", "M")) if sexes.get(k))
    return "Resultados de %s (%s%s): podios%s%s." % (
        name, fecha(date), place, " " + which if which else "", " y los %d españoles" % len(esp) if esp else "")


def render(item, res, lang="es"):
    T = TXT[lang]
    name, date = item["name"], item["date"]
    year = date[:4]
    title = T["title"] % (name, "" if year in name else " " + year)
    esp = item.get("espanoles") or []
    desc = _desc(item, lang)
    url, url_es, url_en = page_url(item, lang), page_url(item, "es"), page_url(item, "en")
    ld = {"@context": "https://schema.org", "@type": "SportsEvent", "name": name, "startDate": date,
          "sport": T["sport"], "url": url, "eventStatus": "https://schema.org/EventScheduled", "inLanguage": "en-GB" if lang == "en" else "es-ES",
          "location": {"@type": "Place", "name": item.get("place") or name}}
    source = ('%s: <a href="%s" target="_blank" rel="noopener">%s</a>' % (T["source"], e(item.get("url")), e(item.get("source")))
              if item.get("url") else "%s: %s" % (T["source"], e(item.get("source"))))
    note = '<p class="data-note">%s</p>' % e(td(res.get("incomplete"), lang)) if res.get("incomplete") else ""
    esp_block = ""
    if esp:
        esp_block = '<h2>🇪🇸 %s</h2><table class="rank"><tbody>%s</tbody></table>' % (T["spaniards"], "".join(
            '<tr><td class="rk%s">%s</td><td><b>%s</b><small>%s</small></td><td class="mark">%s</td></tr>'
            % (_medal(r), e(r.get("pos")), e(r.get("name")), e("%s · %s" % (td(r.get("event", ""), lang), td(r.get("round", ""), lang))), e(r.get("mark")))
            for r in esp))
    home = NAV[lang][0][0]
    results = NAV[lang][2][0]
    nav = "".join('<a href="%s">%s</a>' % (h, t) for h, t in NAV[lang])
    sw_text, sw_lang, sw_label = T["switch"]
    nav += '<a class="lang-switch" href="%s" hreflang="%s" lang="%s" aria-label="%s">%s</a>' % (
        (url_en if lang == "es" else url_es)[len(BASE):], sw_lang, sw_lang, sw_label, sw_text)
    return """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="es" href="{url_es}">
<link rel="alternate" hreflang="en" href="{url_en}">
<link rel="alternate" hreflang="x-default" href="{url_es}">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Calledoss">
<meta property="og:locale" content="{locale}">
<meta property="og:locale:alternate" content="{locale_alt}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{base}/images/compartir.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/styles.css?v={v}">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header>
  <div class="nav-wrap">
    <a class="logo" href="{home}" aria-label="{home_label}"><img src="/images/logo.png" alt="Calledoss"><small>CALLEDOSS</small></a>
    <nav class="tabs tabs-static" aria-label="{sections}">
      {nav}
    </nav>
  </div>
</header>
<main class="static-results">
  <section class="view active">
    <div class="hero">
      <div class="eyebrow"><a href="{results}">{results_label}</a> · {fecha}</div>
      <h1>{h1}</h1>
      <p>{place}{source}</p>
    </div>
    {note}
    {esp_block}
    {events}
    <p class="data-note"><a href="{results}">{all}</a></p>
  </section>
</main>
</body>
</html>
""".format(lang=lang, title=e(title), desc=e(desc), url=e(url), url_es=e(url_es), url_en=e(url_en),
           locale="en_GB" if lang == "en" else "es_ES", locale_alt="es_ES" if lang == "en" else "en_GB",
           base=BASE, v=STYLE_VERSION, ld=json.dumps(ld, ensure_ascii=False), home=home, home_label=T["home"],
           sections=T["sections"], nav=nav, results=results, results_label=T["results"], all=T["all"],
           fecha=e(fecha(date, lang)), h1=e(name), place=e(item["place"]) + " · " if item.get("place") else "",
           source=source, note=note, esp_block=esp_block, events=_events(res.get("events", []), lang))


def _style_version():
    """Versión de styles.css que usa la web (index.html), para que el navegador cargue siempre la buena."""
    try:
        with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
            return re.search(r"styles\.css\?v=(\w+)", f.read()).group(1)
    except (OSError, AttributeError):
        return "1"


STYLE_VERSION = _style_version()


def sitemap(pages):
    urls = ['  <url><loc>%s/%s</loc><changefreq>%s</changefreq><priority>%s</priority></url>' % (BASE, p, f, pr)
            for p, pr, f in SECTIONS]
    urls += ['  <url><loc>%s</loc><lastmod>%s</lastmod><priority>0.6</priority></url>' % (u, d) for u, d in pages]
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % "\n".join(urls)
    for path in (os.path.join(ROOT, "sitemap.xml"), os.path.join(ROOT, "public", "sitemap.xml")):
        with open(path, "w", encoding="utf-8") as f:
            f.write(xml)


def run():
    idx = (load_json("results/index.json", {}) or {}).get("items", [])
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(OUT_EN, exist_ok=True)
    keep, pages = set(), []
    for item in sorted(idx, key=lambda x: (x.get("date") or "", x["name"])):
        if not item.get("date") or item.get("link_only") or not item.get("n_podios"):
            continue
        res = load_json("results/%s.json" % item["id"], {}) or {}
        if not res.get("events"):
            continue
        fname = page_slug(item) + ".html"
        if fname in keep:
            continue  # misma competición dos veces en el índice
        keep.add(fname)
        lastmod = (item.get("fetched") or item["date"])[:10]
        for lang, folder in (("es", OUT), ("en", OUT_EN)):
            with open(os.path.join(folder, fname), "w", encoding="utf-8") as f:
                f.write(render(item, res, lang))
            pages.append((page_url(item, lang), lastmod))
    for folder in (OUT, OUT_EN):  # competiciones que ya no tienen resultados (retiradas por estar mal)
        for f in os.listdir(folder):
            if f.endswith(".html") and f not in keep:
                os.remove(os.path.join(folder, f))
    sitemap(pages)
    return len(keep)
