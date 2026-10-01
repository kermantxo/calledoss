"""Crea las páginas de cada sección (calendario.html, resultados.html, directo.html, proximas.html,
ranking.html, contacto.html) a partir de index.html, que es la de Inicio, y la versión en inglés
de todas ellas en en/ (calledoss.com/en/, /en/calendar, /en/results...).

Todas comparten el mismo contenido y el mismo script.js; cada una cambia solo su título, su
descripción para Google, su dirección (canonical) y la sección que se ve al abrirla.
Las páginas en inglés se traducen con en.js (el mismo diccionario que usa la web al cargar los datos):
si algún texto de index.html no tiene traducción, el programa lo dice y no escribe nada.

Uso (después de cambiar index.html o en.js):   python3 paginas.py

También deja una copia de estas páginas, de en.js, de robots.txt y de sitemap.xml en public/, la carpeta
que publica Cloudflare (su comando de publicación copia ahí el resto de archivos de la web).
"""
import html
import json
import os
import re
import shutil
import sys

BASE = "https://calledoss.com"
PAGES = {
    "calendario": ("Calendario de atletismo 2026 · Calledoss",
                   "Todas las competiciones de atletismo de 2026 en España y las internacionales con españoles: pista, ruta, cross, trail y marcha."),
    "resultados": ("Resultados de atletismo 2026 · Calledoss",
                   "Resultados de cada competición de atletismo desde el 1 de enero: podios femenino y masculino y los españoles destacados."),
    "directo": ("Atletismo en directo · Calledoss",
                "Marcador en directo de las competiciones de atletismo de hoy, con horarios y dónde verlas."),
    "proximas": ("Próximas competiciones de atletismo · Calledoss",
                 "Las competiciones de los próximos 7 días con los inscritos españoles destacados de cada prueba."),
    "ranking": ("Ranking español de atletismo 2026 · Calledoss",
                "El top 10 español de cada prueba en 2026, aire libre y pista cubierta, con datos oficiales de la RFEA."),
    "contacto": ("Contacto · Calledoss",
                 "Escribe a Calledoss: avisos de competiciones o resultados, propuestas para el pódcast de Calledoss y nuestras redes."),
}
# Dirección de cada sección en inglés (calledoss.com/en/<...>)
SLUG_EN = {"home": "", "calendario": "calendar", "resultados": "results", "directo": "live",
           "proximas": "upcoming", "ranking": "rankings", "contacto": "contact"}
# Textos sin traducir que son iguales en los dos idiomas (marcas, siglas, nombres propios)
SIN_TRADUCIR = {"Calledoss", "CALLEDOSS", "ES", "Versión en español", "PB", "SB", "Instagram", "X (Twitter)", "TikTok", "Spotify",
                "@caalledoss", "@calledoss", "Email", "Club", "Top"}


def attr(text):
    return text.replace("&", "&amp;").replace('"', "&quot;")


def url_es(view):
    return BASE + ("/" if view == "home" else "/" + view)


def url_en(view):
    return BASE + "/en/" + SLUG_EN[view]


def load_en():
    """Diccionario de en.js (window.CALLEDOSS_EN = {...};)."""
    with open("en.js", encoding="utf-8") as f:
        src = f.read()
    return json.loads(src[src.index("{"):src.rindex("}") + 1])


def set_meta(s, title, desc, url):
    s = re.sub(r"<title>.*?</title>", "<title>%s</title>" % html.escape(title, quote=False), s, count=1)
    s = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + attr(desc), s, count=1)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*', lambda m: m.group(1) + url, s, count=1)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*', lambda m: m.group(1) + url, s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + attr(title), s, count=1)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + attr(desc), s, count=1)
    s = re.sub(r'(<meta name="twitter:title" content=")[^"]*', lambda m: m.group(1) + attr(title), s, count=1)
    s = re.sub(r'(<meta name="twitter:description" content=")[^"]*', lambda m: m.group(1) + attr(desc), s, count=1)
    return s


def set_alternates(s, view):
    """Etiquetas hreflang (versión en español y en inglés de la misma página) y botón de idioma."""
    es, en = url_es(view), url_en(view)
    s = re.sub(r'(<link rel="alternate" hreflang="es" href=")[^"]*', lambda m: m.group(1) + es, s, count=1)
    s = re.sub(r'(<link rel="alternate" hreflang="en" href=")[^"]*', lambda m: m.group(1) + en, s, count=1)
    s = re.sub(r'(<link rel="alternate" hreflang="x-default" href=")[^"]*', lambda m: m.group(1) + es, s, count=1)
    return s


def show_view(s, view):
    s = s.replace('<body data-view="home">', '<body data-view="%s">' % view, 1)
    # sección visible al abrir la página
    s = s.replace('<section class="view active" id="view-home">', '<section class="view" id="view-home">', 1)
    s = s.replace('<section class="view" id="view-%s">' % view, '<section class="view active" id="view-%s">' % view, 1)
    # botón marcado en el menú
    s = s.replace('data-view="home" class="active">', 'data-view="home">', 1)
    href = "/" if view == "home" else "/" + view
    s = s.replace('href="%s" data-view="%s">' % (href, view), 'href="%s" data-view="%s" class="active">' % (href, view), 1)
    return s


def build(src, view, title, desc):
    s = set_meta(src, title, desc, url_es(view))
    s = set_alternates(s, view)
    s = re.sub(r'(<a class="lang-switch" href=")[^"]*', lambda m: m.group(1) + url_en(view)[len(BASE):], s, count=1)
    return show_view(s, view)


# ------------------------------------------------------------------ inglés

def translate_html(s, ui, missing):
    """Traduce los textos visibles y los atributos de texto (alt, aria-label, placeholder, title, content)."""
    def tr(text):
        key = html.unescape(" ".join(text.split()))
        if not key or not re.search(r"[A-Za-zÁÉÍÓÚáéíóúÑñ]", key) or key in SIN_TRADUCIR:
            return None
        if key in ui:
            return ui[key]
        missing.add(key)
        return None

    def attr_sub(m):
        new = tr(m.group(3))
        return m.group(0) if new is None else '%s=%s%s%s' % (m.group(1), m.group(2), attr(new), m.group(2))

    head, body = s.split("<body", 1)
    # en la cabecera solo se traducen los atributos content de las meta (las de cada página ya vienen en inglés)
    out = []
    # se separan los bloques <script>/<style>, que no se tocan
    for part in re.split(r"(<script\b.*?</script>|<style\b.*?</style>)", "<body" + body, flags=re.S):
        if part.startswith("<script") or part.startswith("<style"):
            out.append(part)
            continue
        part = re.sub(r'\b(alt|aria-label|placeholder|title)=(")([^"]*)"', attr_sub, part)

        def text_sub(m):
            raw = m.group(1)
            new = tr(raw)
            if new is None:
                return m.group(0)
            lead = raw[:len(raw) - len(raw.lstrip())]
            trail = raw[len(raw.rstrip()):]
            return ">" + lead + new + trail + "<"
        out.append(re.sub(r">([^<>]+)<", text_sub, part))
    return head + "".join(out)


def build_en(src, view, ui, page_meta, v, missing):
    title, desc = page_meta
    s = set_meta(src, title, desc, url_en(view))
    s = set_alternates(s, view)
    s = show_view(s, view)
    s = s.replace('<html lang="es">', '<html lang="en">', 1)
    s = s.replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_GB">', 1)
    s = s.replace('<meta property="og:locale:alternate" content="en_GB">', '<meta property="og:locale:alternate" content="es_ES">', 1)
    s = s.replace('"inLanguage":"es-ES"', '"inLanguage":"en-GB"')
    s = s.replace('"description":"Resultados, calendario, previas, directo y ranking del atletismo español."',
                  '"description":"%s"' % ui["Resultados, calendario, previas, directo y ranking del atletismo español."])
    # vista previa al compartir: título y descripción de la portada en inglés
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + attr(title), s, count=1)
    # archivos de la web: siempre desde la raíz (la página está en /en/)
    s = re.sub(r'(href|src)="(fonts/|styles\.css|images/|script\.js)', r'\1="/\2', s)
    s = s.replace('<script src="/script.js', '<script src="/en.js?v=%s"></script>\n<script src="/script.js' % v, 1)
    # enlaces del menú, del pie y de la portada a su versión en inglés
    for k, slug in SLUG_EN.items():
        es_href = "/" if k == "home" else "/" + k
        s = s.replace('href="%s" data-view="%s"' % (es_href, k), 'href="/en/%s" data-view="%s"' % (slug, k))
    s = s.replace('<a href="/contacto">', '<a href="/en/contact">')
    s = s.replace('href="cookies.html"', 'href="/en/cookies"')
    # botón de idioma: en la versión inglesa lleva a la española
    s = re.sub(r'<a class="lang-switch" href="[^"]*" hreflang="en" lang="en" aria-label="[^"]*">EN</a>',
               '<a class="lang-switch" href="%s" hreflang="es" lang="es" aria-label="Versión en español">ES</a>' % url_es(view)[len(BASE):], s)
    return translate_html(s, ui, missing)


def main():
    with open("index.html", encoding="utf-8") as f:
        src = f.read()
    v = re.search(r'styles\.css\?v=([\w]+)', src).group(1)
    en = load_en()
    ui = en["ui"]
    # public/ es la carpeta que publica Cloudflare: su comando de publicación copia ahí el resto de la web
    os.makedirs("public", exist_ok=True)
    pages = {}
    for view, (title, desc) in PAGES.items():
        out = build(src, view, title, desc)
        assert 'data-view="%s"' % view in out and 'id="view-%s"' % view in out
        pages["%s.html" % view] = out
    # versión en inglés: en/index.html (calledoss.com/en/) y en/<sección>.html
    missing = set()
    home_meta = (ui["Calledoss · Resultados, calendario y ranking del atletismo español"],
                 ui["Resultados de cada competición de atletismo en España, con los españoles destacados, calendario de pista, ruta, cross y trail, previas con los inscritos, directo y ranking del año."])
    pages["en/index.html"] = build_en(src, "home", ui, home_meta, v, missing)
    for view, (title, desc) in PAGES.items():
        pages["en/%s.html" % SLUG_EN[view]] = build_en(src, view, ui, (ui[title], ui[desc]), v, missing)
    if missing:
        print("Faltan estas traducciones en en.js (ui):")
        for m in sorted(missing):
            print("  " + json.dumps(m, ensure_ascii=False))
        sys.exit(1)
    for name, out in pages.items():
        for folder in (".", "public"):
            path = os.path.join(folder, name)
            os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(out)
        print(name)
    os.makedirs(os.path.join("public", "en"), exist_ok=True)
    for name in ("robots.txt", "sitemap.xml", "en.js", os.path.join("en", "cookies.html")):
        shutil.copy(name, os.path.join("public", name))


if __name__ == "__main__":
    main()
