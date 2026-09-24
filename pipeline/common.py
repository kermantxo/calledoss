"""Utilidades compartidas por todos los scrapers.

Nada de IA: solo peticiones HTTP, HTML, JSON y PDFs leídos con librerías.
"""
import datetime as dt
import hashlib
import json
import os
import re
import time
import traceback
import unicodedata
from zoneinfo import ZoneInfo

import requests

MADRID = ZoneInfo("Europe/Madrid")
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
USER_AGENT = (
    "Mozilla/5.0 (compatible; CalledossBot/1.0; +https://github.com/kermantxo/calledoss) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"
)

# ------------------------------------------------------------------ fechas

def now():
    return dt.datetime.now(MADRID)


def today():
    override = os.environ.get("CALLEDOSS_TODAY")  # para pruebas: YYYY-MM-DD
    if override:
        return dt.date.fromisoformat(override)
    return now().date()


def iso_now():
    return now().isoformat(timespec="seconds")


def parse_dmy(text):
    """'04/10/2026' -> date. Devuelve None si no encaja."""
    m = re.search(r"(\d{1,2})/(\d{1,2})/(\d{4})", text or "")
    if not m:
        return None
    d, mo, y = (int(x) for x in m.groups())
    try:
        return dt.date(y, mo, d)
    except ValueError:
        return None


MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]


# ------------------------------------------------------------------ texto

def strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFD", s or "") if unicodedata.category(c) != "Mn")


def norm(s):
    """Minúsculas, sin tildes, solo letras/números separados por espacios."""
    s = strip_accents(s).lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def slugify(s, maxlen=70):
    return norm(s).replace(" ", "-")[:maxlen].strip("-")


def clean(s):
    return re.sub(r"\s+", " ", (s or "")).strip()


def title_place(s):
    """'LoGroÑo' / 'BARCELONA' -> 'Logroño' / 'Barcelona' (respeta '(i)' y '(USA)')."""
    s = clean(s)
    if not s:
        return s
    out = []
    for w in s.split(" "):
        if re.fullmatch(r"\(?[A-Z]{3}\)?", w) and w.startswith("("):
            out.append(w)
        elif w.lower() in ("(i)",):
            out.append("(i)")
        elif w.lower() in ("de", "del", "la", "las", "los", "el", "y", "i", "d'", "l'", "a"):
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    res = " ".join(out)
    return res[:1].upper() + res[1:]


def short_hash(*parts):
    return hashlib.sha1("|".join(str(p) for p in parts).encode()).hexdigest()[:8]


# ------------------------------------------------------------------ HTTP

# Pausa mínima entre peticiones a un mismo dominio (segundos). RFEA limita si se va rápido.
HOST_DELAY = {"atletismorfea.es": 1.5, "www.rfeacontent.es": 1.0, "rfealive.info": 0.8}


class Http:
    """Sesión HTTP educada: reintentos, timeout y una pausa mínima por dominio."""

    def __init__(self, min_delay=0.6):
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": USER_AGENT, "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"})
        self.min_delay = min_delay
        self._last = {}

    def _wait(self, url):
        host = re.sub(r"^https?://([^/]+).*", r"\1", url)
        delay = max(self.min_delay, HOST_DELAY.get(host, 0))
        last = self._last.get(host, 0)
        gap = time.time() - last
        if gap < delay:
            time.sleep(delay - gap)
        self._last[host] = time.time()

    def request(self, method, url, retries=2, timeout=40, **kw):
        err = None
        for attempt in range(retries + 1):
            self._wait(url)
            try:
                r = self.s.request(method, url, timeout=timeout, **kw)
                if r.status_code == 429:  # "vas demasiado rápido": esperamos lo que pida el servidor
                    err = RuntimeError("HTTP 429 en %s" % url)
                    wait = r.headers.get("Retry-After", "")
                    time.sleep(min(int(wait), 60) if wait.isdigit() else 15 * (attempt + 1))
                    continue
                if r.status_code >= 500:
                    err = RuntimeError("HTTP %s en %s" % (r.status_code, url))
                else:
                    r.raise_for_status()
                    return r
            except requests.RequestException as e:
                err = e
            time.sleep(1.5 * (attempt + 1))
        raise err

    def get(self, url, **kw):
        return self.request("GET", url, **kw)

    def post(self, url, **kw):
        return self.request("POST", url, **kw)


# ------------------------------------------------------------------ ficheros

def path(*parts):
    p = os.path.join(DATA_DIR, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p


def load_json(name, default=None):
    p = path(name)
    if not os.path.exists(p):
        return default
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return default


def save_json(name, data, compact=False):
    """Escribe solo si cambia el contenido (así no hay commits vacíos)."""
    p = path(name)
    if compact:
        text = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
    else:
        text = json.dumps(data, ensure_ascii=False, indent=1, sort_keys=False)
    old = None
    if os.path.exists(p):
        with open(p, encoding="utf-8") as f:
            old = f.read()
    if old == text:
        return False
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(text)
    os.replace(tmp, p)
    return True


# ------------------------------------------------------------------ estado de fuentes

class Health:
    """Registra qué fuentes han funcionado y cuáles han fallado o cambiado de estructura.

    Se guarda en status.json y lo muestra el panel privado.
    """

    def __init__(self):
        self.data = load_json("status.json", {}) or {}
        self.data.setdefault("sources", {})
        self.data.setdefault("log", [])

    def run(self, key, label, fn, *args, expect_min=1, **kwargs):
        """Ejecuta fn; si falla o devuelve menos de expect_min elementos, lo apunta y sigue."""
        src = self.data["sources"].setdefault(key, {"label": label})
        src["label"] = label
        src["last_run"] = iso_now()
        prev = src.get("last_count") or 0
        try:
            result = fn(*args, **kwargs)
        except Exception as e:  # una fuente rota no puede tumbar a las demás
            src["ok"] = False
            src["last_error"] = "%s: %s" % (type(e).__name__, str(e)[:300])
            src["last_error_at"] = iso_now()
            src["fails_in_a_row"] = src.get("fails_in_a_row", 0) + 1
            self._log("error", key, src["last_error"], traceback.format_exc(limit=3))
            return None
        if isinstance(result, bool) or result is None:
            count = 1 if result else 0
        elif isinstance(result, int):
            count = result
        else:
            count = len(result) if hasattr(result, "__len__") else 1
        if count < expect_min:
            src["ok"] = False
            msg = "Devolvió %d elementos (esperados >= %d). Puede que la web haya cambiado de estructura." % (count, expect_min)
            if prev:
                msg += " La vez anterior devolvió %d." % prev
            src["last_error"] = msg
            src["last_error_at"] = iso_now()
            src["fails_in_a_row"] = src.get("fails_in_a_row", 0) + 1
            self._log("warning", key, msg)
        else:
            src["ok"] = True
            src["last_ok"] = iso_now()
            src["fails_in_a_row"] = 0
            src["last_count"] = count
        return result

    def note(self, key, level, msg):
        self._log(level, key, msg)

    def _log(self, level, key, msg, detail=None):
        entry = {"at": iso_now(), "level": level, "source": key, "msg": msg[:500]}
        if detail:
            entry["detail"] = detail[-1200:]
        self.data["log"].insert(0, entry)
        del self.data["log"][80:]

    def save(self):
        self.data["updated"] = iso_now()
        save_json("status.json", self.data)
