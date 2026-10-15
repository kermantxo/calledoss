"""EL PÓDCAST: último programa de Calledoss en Spotify (título, fecha, duración y portada).

Se lee del reproductor público del programa (open.spotify.com/embed/show/...), que trae el
episodio más reciente el primero. Sin cuenta ni claves. Resultado en podcast.json; la portada
de la web lo enseña y, al pulsar «Escuchar aquí», carga el reproductor de ese episodio.
"""
import json
import re

from .common import save_json

SHOW = "6N0J6OLKb3HlVwz7RRvz9L"
EMBED = "https://open.spotify.com/embed/show/%s" % SHOW


def _image(images, size=640):
    """La imagen más cercana a `size` píxeles (Spotify da 64, 300 y 640)."""
    images = [i for i in (images or []) if i.get("url")]
    if not images:
        return ""
    return min(images, key=lambda i: abs((i.get("maxWidth") or 0) - size))["url"]


def run(http, health=None):
    r = http.get(EMBED)
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', r.text, re.S)
    if not m:
        raise RuntimeError("El reproductor de Spotify ha cambiado: no trae __NEXT_DATA__")
    ep = json.loads(m.group(1))["props"]["pageProps"]["state"]["data"]["entity"]
    if ep.get("type") != "episode" or not ep.get("id"):
        raise RuntimeError("Spotify no devolvió un episodio (tipo %r)" % ep.get("type"))
    # portada del episodio; si no tiene, la del programa
    cover = _image((ep.get("visualIdentity") or {}).get("image")) or _image(ep.get("relatedEntityCoverArt"))
    data = {
        "id": ep["id"],
        "title": ep.get("title") or ep.get("name") or "",
        "date": ((ep.get("releaseDate") or {}).get("isoString") or "")[:10],
        "duration_ms": ep.get("duration") or 0,
        "cover": cover,
        "url": "https://open.spotify.com/episode/%s" % ep["id"],
        "show_url": "https://open.spotify.com/show/%s" % SHOW,
    }
    save_json("podcast.json", data)
    return 1
