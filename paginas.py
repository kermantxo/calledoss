"""Crea las páginas de cada sección (calendario.html, resultados.html, directo.html, proximas.html,
ranking.html) a partir de index.html, que es la de Inicio.

Todas comparten el mismo contenido y el mismo script.js; cada una cambia solo su título, su
descripción para Google, su dirección (canonical) y la sección que se ve al abrirla.

Uso (después de cambiar index.html):   python3 paginas.py

También deja una copia de estas páginas, de robots.txt y de sitemap.xml en public/, la carpeta que
publica Cloudflare (su comando de publicación copia ahí el resto de archivos de la web).
"""
import re

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
}


def attr(text):
    return text.replace("&", "&amp;").replace('"', "&quot;")


def build(src, view, title, desc):
    s = src
    url = "%s/%s" % (BASE, view)
    s = re.sub(r"<title>.*?</title>", "<title>%s</title>" % title, s, count=1)
    s = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + attr(desc), s, count=1)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*', r"\g<1>" + url, s, count=1)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*', r"\g<1>" + url, s, count=1)
    s = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + attr(title), s, count=1)
    s = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>" + attr(desc), s, count=1)
    s = re.sub(r'(<meta name="twitter:title" content=")[^"]*', r"\g<1>" + attr(title), s, count=1)
    s = re.sub(r'(<meta name="twitter:description" content=")[^"]*', r"\g<1>" + attr(desc), s, count=1)
    s = s.replace('<body data-view="home">', '<body data-view="%s">' % view, 1)
    # sección visible al abrir la página
    s = s.replace('<section class="view active" id="view-home">', '<section class="view" id="view-home">', 1)
    s = s.replace('<section class="view" id="view-%s">' % view, '<section class="view active" id="view-%s">' % view, 1)
    # botón marcado en el menú
    s = s.replace('data-view="home" class="active">', 'data-view="home">', 1)
    s = s.replace('href="/%s" data-view="%s">' % (view, view), 'href="/%s" data-view="%s" class="active">' % (view, view), 1)
    return s


def main():
    import os
    import shutil
    with open("index.html", encoding="utf-8") as f:
        src = f.read()
    # public/ es la carpeta que publica Cloudflare: su comando de publicación copia ahí el resto de la web
    os.makedirs("public", exist_ok=True)
    for view, (title, desc) in PAGES.items():
        out = build(src, view, title, desc)
        assert 'data-view="%s"' % view in out and 'id="view-%s"' % view in out
        for folder in (".", "public"):
            with open(os.path.join(folder, "%s.html" % view), "w", encoding="utf-8") as f:
                f.write(out)
        print("%s.html" % view)
    for name in ("robots.txt", "sitemap.xml"):
        shutil.copy(name, os.path.join("public", name))


if __name__ == "__main__":
    main()
