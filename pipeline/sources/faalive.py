"""faalive.com — web de la Federación Andaluza de Atletismo.

Es una aplicación Blazor que solo muestra su contenido dentro de un navegador, así que se abre
con Playwright (navegador Chromium sin ventana, controlado por código; sin IA) y se leen los
enlaces ya dibujados: PDFs de resultados, actas y el código de RFEA Live (rfealive.me) del campeonato.
Si Playwright no está instalado, esta fuente simplemente se omite.
"""
import re


def links(url, timeout_ms=30000):
    """[(texto, url)] de todos los enlaces de una página de faalive, ya renderizada."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.goto(url, timeout=timeout_ms)
            try:
                page.wait_for_selector("a[href*='faa-media'], a[href*='rfealive']", timeout=timeout_ms)
            except Exception:
                page.wait_for_timeout(4000)
            out = page.eval_on_selector_all("a[href]", "els => els.map(a => [a.innerText.trim(), a.href])")
        finally:
            browser.close()
    return [(t or "", h) for t, h in out if h.startswith("http")]


RESULT_TEXT = re.compile(r"resultad|acta|clasific", re.I)


def result_sources(url):
    """Devuelve (chids_rfealive, pdfs_de_resultados) encontrados en la página."""
    ls = links(url)
    if ls is None:
        return None, None
    chids, pdfs = [], []
    for text, h in ls:
        m = re.search(r"rfealive\.\w+/Results/Schedule\?chid=([A-Za-z0-9]+)", h)
        if m:
            chids.append((m.group(1), "https://" + h.split("/")[2]))
        elif h.lower().split("?")[0].endswith(".pdf") and RESULT_TEXT.search(text or h):
            pdfs.append(h)
    return list(dict.fromkeys(chids)), list(dict.fromkeys(pdfs))
