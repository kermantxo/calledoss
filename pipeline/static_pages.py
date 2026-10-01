"""PÁGINAS DE RESULTADOS PARA GOOGLE: una página HTML por competición con resultados.

calledoss.com/resultados/<competición>-<fecha>  (archivo public/resultados/<...>.html)

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
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
         "octubre", "noviembre", "diciembre"]
SECTIONS = [("", "1.0", "hourly"), ("calendario", "0.9", "daily"), ("resultados", "0.9", "hourly"),
            ("directo", "0.7", "hourly"), ("proximas", "0.8", "daily"), ("ranking", "0.8", "daily"),
            ("cookies", "0.2", "yearly")]


def e(s):
    return html.escape(str(s or ""), quote=True)


def fecha(iso):
    y, m, d = iso.split("-")
    return "%d de %s de %s" % (int(d), MESES[int(m) - 1], y)


def page_slug(item):
    return "%s-%s" % (slugify(item["name"], 60), item["date"])


def page_url(item):
    return "%s/resultados/%s" % (BASE, page_slug(item))


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


def _events(events):
    blocks = {"F": [], "M": [], "X": []}
    for ev in events:
        rounds = ev.get("rounds") if ev.get("rounds") is not None else [ev]
        body = ""
        for rnd in rounds:
            rows = rnd.get("rows") or []
            if not rows:
                continue
            body += '<h4>%s</h4><table class="rank"><tbody>%s</tbody></table>' % (e(rnd.get("round") or "Final"), _rows(rows))
        if body:
            blocks[ev.get("sex") if ev.get("sex") in ("F", "M") else "X"].append(
                '<div class="event-block"><h3>%s</h3>%s</div>' % (e(ev.get("name")), body))
    out = ""
    for sex, label in (("F", "Femenino"), ("M", "Masculino"), ("X", "Pruebas")):
        if blocks[sex]:
            out += '<h2>%s</h2><div class="roster-grid">%s</div>' % (label, "".join(blocks[sex]))
    return out


def render(item, res):
    name, date = item["name"], item["date"]
    year = date[:4]
    title = "%s%s: resultados · Calledoss" % (name, "" if year in name else " " + year)
    esp = item.get("espanoles") or []
    sexes = item.get("n_sexo") or {}
    which = " y ".join(x for x, k in (("femenino", "F"), ("masculino", "M")) if sexes.get(k))
    desc = "Resultados de %s (%s%s): podios%s%s." % (
        name, fecha(date), ", " + item["place"] if item.get("place") else "",
        " " + which if which else "", " y los %d españoles" % len(esp) if esp else "")
    url = page_url(item)
    ld = {"@context": "https://schema.org", "@type": "SportsEvent", "name": name, "startDate": date,
          "sport": "Atletismo", "url": url, "eventStatus": "https://schema.org/EventScheduled",
          "location": {"@type": "Place", "name": item.get("place") or name}}
    source = ('Fuente: <a href="%s" target="_blank" rel="noopener">%s</a>' % (e(item.get("url")), e(item.get("source")))
              if item.get("url") else "Fuente: %s" % e(item.get("source")))
    note = '<p class="data-note">%s</p>' % e(res.get("incomplete")) if res.get("incomplete") else ""
    esp_block = ""
    if esp:
        esp_block = '<h2>🇪🇸 Españoles</h2><table class="rank"><tbody>%s</tbody></table>' % "".join(
            '<tr><td class="rk%s">%s</td><td><b>%s</b><small>%s</small></td><td class="mark">%s</td></tr>'
            % (_medal(r), e(r.get("pos")), e(r.get("name")), e("%s · %s" % (r.get("event", ""), r.get("round", ""))), e(r.get("mark")))
            for r in esp)
    return """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32.png">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Calledoss">
<meta property="og:locale" content="es_ES">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{base}/images/compartir.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header>
  <div class="nav-wrap">
    <a class="logo" href="/" aria-label="Ir a la página principal de Calledoss"><img src="/images/logo.png" alt="Calledoss"><small>CALLEDOSS</small></a>
    <nav class="tabs tabs-static" aria-label="Secciones">
      <a href="/">Inicio</a><a href="/calendario">Calendario</a><a href="/resultados">Resultados</a><a href="/directo">En directo</a><a href="/proximas">Próximas</a><a href="/ranking">Ranking</a>
    </nav>
  </div>
</header>
<main class="static-results">
  <section class="view active">
    <div class="hero">
      <div class="eyebrow"><a href="/resultados">Resultados</a> · {fecha}</div>
      <h1>{h1}</h1>
      <p>{place}{source}</p>
    </div>
    {note}
    {esp_block}
    {events}
    <p class="data-note"><a href="/resultados">← Todos los resultados de la temporada</a></p>
  </section>
</main>
</body>
</html>
""".format(title=e(title), desc=e(desc), url=e(url), base=BASE, ld=json.dumps(ld, ensure_ascii=False),
           fecha=e(fecha(date)), h1=e(name), place=e(item["place"]) + " · " if item.get("place") else "",
           source=source, note=note, esp_block=esp_block, events=_events(res.get("events", [])))


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
        with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
            f.write(render(item, res))
        pages.append((page_url(item), (item.get("fetched") or item["date"])[:10]))
    for f in os.listdir(OUT):  # competiciones que ya no tienen resultados (retiradas por estar mal)
        if f.endswith(".html") and f not in keep:
            os.remove(os.path.join(OUT, f))
    sitemap(pages)
    return len(pages)
