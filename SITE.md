# CALLEDOSS · Atletismo

> Todo lo que necesitas saber para estar al día en el atletismo español.

## Brand Identity
- Personality: deportiva, directa, informativa, con estética de pista de atletismo (líneas de calle, marcas, cronómetro)
- Colors: terracota de pista del logo `#D9603F` (acento principal, más oscuro `#B5482A`), turquesa complementario `#1E7A80` (lo que viene), dorado/plata/bronce para medallas, fondo claro `#F7F4F0`, tarjetas blancas y cabecera casi negra `#1B1A19` para que el logo destaque
- Fonts: Bebas Neue (títulos), Barlow Condensed (texto), Roboto Mono (datos y cifras)
- Language: español (principal) e inglés (copia completa en calledoss.com/en/)

## Pages
- **Siete páginas con el mismo menú** (cada una con su dirección): Inicio `index.html` (calledoss.com), `calendario.html` (/calendario), `resultados.html` (/resultados), `directo.html` (/directo), `proximas.html` (/proximas), `ranking.html` (/ranking) y `contacto.html` (/contacto). Las seis últimas se generan desde index.html con `python3 paginas.py`:
  - **Inicio** - Titular "El atletismo español al día" y tres bloques grandes: **Lo que puedes ver hoy** (terracota, con "VIVO" si hay directo), **¿Qué hay próximamente?** y **Últimos resultados**; debajo, **Todas las secciones** con icono y, al final, **El pódcast**: el último programa de Calledoss con su portada, título, fecha y duración; al pulsar «Escuchar aquí» se carga el reproductor de Spotify de ese episodio y se escucha entero sin salir de la web. También hay un enlace «Abrir en Spotify». Arriba, la barra EN DIRECTO solo cuando hay competición. Bajo el titular, la franja de avisos (borde rojo, como la de «Última hora»): ahora mismo, «¡Vuelve el cross!» (sin «Última hora», solo ese título) (Zornotza y Aceite, domingo 18 de octubre), que lleva a Próximas y desaparece sola a partir del 19 de octubre.
  - **Calendario** - Lista de tarjetas por mes (fecha, lugar, hora, emisión, inscritos) con filtros de mes, localidad (las que no tienen localidad van en "Otros"), y calendario (RFEA, World Athletics, Diamond League o ADOC). Sin modalidades a la vista. Las pruebas del circuito ADOC llevan su etiqueta.
  - **Resultados** - Competiciones ya disputadas este año. Cada una muestra **todas sus pruebas**, separadas en **Femenino** y **Masculino** (podio y, si se quiere, la clasificación completa). Si una fuente solo trae un sexo, se busca el otro en las demás fuentes; mientras no aparece se indica "Sin resultados femeninos/masculinos localizados todavía". Las competiciones de un solo sexo (Liga Iberdrola, Liga Joma, carreras de la mujer) muestran solo ese.
  - **En directo** - Las competiciones de hoy. Mientras hay pruebas en marcha se actualiza sola cada pocos minutos. Si una fuente no publica parciales, se muestra "Sin datos en directo" con el horario previsto.
  - **Próximas** - Rango de 7 días: desde hoy hasta dentro de seis días (si hoy es martes, hasta el lunes), agrupado por día. Cada cita muestra sus **inscritos españoles destacados** de cada prueba (mujeres y hombres) en cuanto se publica la lista; si no, "Inscritos no publicados aún". Aquí no se muestran resultados (están en su pestaña).
  - **Ranking** - Con los datos oficiales de la RFEA, top 10 de cada prueba, categoría absoluta, separado en **Aire libre**, **Pista cubierta** y **Ruta**, mujeres y hombres. Dos botones arriba: **Este año** (ranking del año) e **Histórico** (las 10 mejores marcas españolas de todos los tiempos, del ranking histórico de la RFEA, atletismorfea.es/ranking/historico). Se actualiza solo cada día.
  - **Contacto** - Formulario (nombre y apellido, email y mensaje) cuyos mensajes llegan a calledosspodcast@gmail.com a través de **FormSubmit** (gratis y sin cuenta). Se activa una sola vez con el enlace "Activate Form" que FormSubmit envía a ese email. Si un envío falla, el formulario pide escribir directamente a ese email. Al lado, botones a Instagram (@Caalledoss), X, TikTok y el pódcast en Spotify, que se abren en pestaña nueva. También hay un enlace a Contacto en el pie de página.
  - **Inscritos** - Lista de salida completa de una competición
- **Política de cookies** (`cookies.html`) - Qué se guarda (solo lo necesario), terceros, cómo cambiar la elección. Faltan los datos del titular: [NOMBRE DEL TITULAR], [NIF], [DIRECCIÓN], [EMAIL DE CONTACTO].
- **Panel privado** (`panel.html`, no aparece en el menú) - Con clave. Sirve para añadir a mano una competición que el calendario automático no haya encontrado (nombre, fecha, lugar, horario y enlace opcional), siempre antes del día de la prueba. También muestra avisos si alguna fuente falla y el plan de directo de hoy.

## Versión en inglés (calledoss.com/en/)
- **Copia completa de la web en inglés**; la española no cambia. Direcciones: `/en/` (Inicio), `/en/calendar`, `/en/results`, `/en/live`, `/en/upcoming`, `/en/rankings`, `/en/contact`, `/en/cookies` y una página por competición en `/en/results/<nombre>-<fecha>`.
- **Botón ES / EN** en el menú de arriba de todas las páginas: lleva a la misma página en el otro idioma.
- **Para Google**: cada página dice cuál es su versión en el otro idioma (etiquetas hreflang), tiene su título, descripción y vista previa al compartir en inglés, y todas las direcciones en inglés están en el sitemap.
- **Todas las traducciones están en `en.js`**: los textos de la web (`ui`), textos fijos de los datos (`text`) y reglas para traducir los nombres de las pruebas, rondas y motivos de los destacados (`rules`, `reasons`). Los nombres de competiciones y atletas no se traducen.
- **Los datos se actualizan solos en los dos idiomas** (mismos datos; solo cambian los textos de alrededor). Las páginas de resultados en inglés se rehacen cada día junto con las españolas.
- **Al cambiar un texto de la portada (index.html)**: añadir su traducción en `en.js` y ejecutar `python3 paginas.py` (si falta alguna traducción, avisa y no escribe nada).

## Cómo se actualizan los datos (sin tocar nada)
- Todo lo hacen tareas programadas con código normal (sin inteligencia artificial), en **GitHub Actions** (gratis):
  - **Cada día a primera hora**: calendario completo, fichas de competición, atletas destacados, resultados y plan de directo del día.
  - **Varias veces al día** (10, 13, 16, 19 y 22 h UTC): nueva búsqueda de resultados.
  - **En directo**: solo los días con competición, cada 3-5 minutos desde 1 h antes de la primera prueba hasta 2 h después de la última. Cada comprobación es independiente y dura segundos. Lo que quede sin resultados se reintenta en los chequeos siguientes (hasta 10 días).
- Los datos se guardan en la rama **"datos"** del repositorio de GitHub; la web los lee de ahí, así que no hace falta volver a publicarla.
- **Atletas destacados**: se marcan solos a partir de las listas de salida: líder español del año, plusmarquistas, mejor marca entre los inscritos y la lista de seguimiento (líderes del ranking y selección española, que crece sola con los españoles que compiten en internacionales).
- **Si una fuente falla** o cambia su página, se apunta en el panel, se conservan sus datos anteriores y las demás siguen funcionando.
- **Carga histórica 2026** (proceso único, tarea "Carga histórica" en GitHub): recorre todas las competiciones del año ya disputadas y guarda el **podio (top 3 con marca) de cada prueba**. Busca en RFEA Live y rfealive.me (federaciones autonómicas), PDFs oficiales de RFEA, World Athletics, Cronomancha, Runvasport (inscripciones.runvasport.es) y los PDFs de la web de cada competición. Los PDFs se leen con un lector por columnas que entiende los formatos de los cronometradores. Antes de aceptar un PDF se comprueba que su nombre y fecha coinciden con la competición. Trabaja en tandas de 45 minutos y se relanza sola hasta terminar. Lo que no se encuentra queda como **"Sin resultados localizados"**: aparece así en Resultados y en el panel, con los enlaces que se probaron. A partir de ahí, el chequeo diario usa la misma búsqueda para las competiciones nuevas.

## Files
- `index.html` - estructura y textos de la página
- `styles.css` - colores, tipografías y diseño (incluye el panel)
- `script.js` - funcionamiento de pestañas y filtros, fichas hechas a mano (selección, ranking) y la lectura de los datos automáticos (al final del archivo)
- `panel.html` + `panel.js` - panel privado
- `images/logo.png` - logo de Calledoss
- `fonts/` - tipografías servidas desde la propia web (sin Google Fonts)
- `cookies.html` - política de cookies
- `data/` - copia de respaldo de los datos automáticos
- `pipeline/` - los programas que recogen los datos (scrapers en Python)
- `.github/workflows/` - las tareas programadas
- `worker/` - el pequeño servidor de Cloudflare que protege el panel con clave y lanza el modo directo a tiempo

## Recent Changes
- 2026-10-27: Ranking histórico español: nuevo botón «Histórico» en Ranking con el top 10 de todos los tiempos de cada prueba (86 listas: aire libre, pista cubierta y ruta/marcha, mujeres y hombres), sacado del ranking histórico oficial de la RFEA. Se descarga en la tarea diaria del ranking; si la RFEA falla, se mantiene el anterior. En altura, pértiga, longitud, triple y peso entran también las marcas en pista cubierta (i), como en la lista de la RFEA. Las letras junto a algunas marcas son de la RFEA (A = altitud, i = pista cubierta, + = paso intermedio).
- 2026-10-25: Costa de Ajo: resultados oficiales leídos del PDF de la Federación Cántabra (fcatle.com; la marca de Mariano García se corrigió a mano a 18:05.05, el PDF redondea a 18:06; el lector automático no reconoce ese formato y el nombre «Ajo» es demasiado corto para su comprobación). Derbi de las Aficiones (Madrid, 9:00) añadido al calendario a mano, con su clasificación oficial: vikingos e indios juntos en una general; se ha quitado un 26:18 femenino imposible. Quintanar: aún sin resultados oficiales localizados.
- 2026-10-25: 10K Zaragoza: resultados de Sportmaniacs (10K, 5K y handbike). Sportmaniacs ordena ahora élite, popular, distancias de mayor a menor, categorías por edad y adaptadas al final. El control de «tiempos imposibles» ya no descarta pruebas llamadas «5K · 5km» (antes tomaba la distancia de la carrera, 10K, y daba por imposible el 15:30 del 5K).
- 2026-10-25: Medio Maratón de Valencia: podios general y español (hombres y mujeres) cargados a mano desde la crónica oficial de la organización (valenciaciudaddelrunning.com), como resultado provisional. Cuando World Athletics publique la clasificación, la revisión automática la sustituye sola.
- 2026-10-24: Resultados de Sportmaniacs (Cross de Aranda): la élite y la absoluta salen primero, después la popular y luego las categorías, porque la lista solo enseña las 6 primeras pruebas. Las pruebas de un solo sexo («SUB12 FEM», «ÉLITE MASC») ya no generan un podio falso del otro sexo cuando alguien está mal inscrito.
- 3 oct 2026: En directo muestra el horario completo prueba a prueba. Cada prueba lleva su estado (Pendiente, En marcha, Provisional, Oficial) y, en cuanto sale la clasificación, se puede desplegar pinchando en ella para verla debajo de la hora.
- 2026-10-18: Cross de Zornotza: además de World Athletics, el directo lee los PDF de clasificación que la organización sube a cdzornotza.eus/sailkapenak al terminar cada carrera (nueva fuente «pdfweb» que se suma a la principal con «junto»). Horario oficial de las 10 carreras (09:40–13:00) en `pipeline/extra_links.json`.
- 2026-10-17: 10K de Ontinyent: podio de la élite (hombres y mujeres) metido a mano en `pipeline/extra_links.json` («a_mano»), sale en En directo como provisional y en Resultados hasta que haya clasificación oficial.
- 2026-09-23: Importada la web "CALLEDOSS · Atletismo" desde Descargas como página principal. Se separó en archivos de estructura, estilos y datos, y el logo pasó a la carpeta de imágenes. Se eliminó la página "About" de ejemplo.
- 2026-09-23: Quitada la nota de "Fuentes" que aparecía encima del listado en la sección Calendario.
- 2026-09-23: En directo: quitado el texto sobre el Mundial Sub-20, el Europeo de Birmingham y los Juegos Mediterráneos, y la nota de que no existe un feed público de resultados. Si no hay competiciones en curso solo se muestra "Sin competiciones en curso".
- 2026-09-24: Carga histórica de resultados 2026 (podio de cada prueba de cada competición) y lista "Sin resultados localizados" en el panel.
- 2026-09-24: Datos automáticos: calendario, resultados, en directo y destacados se actualizan solos (scrapers + tareas programadas, sin IA). Nuevo panel privado con clave. Próximas pasa a mostrar un rango fijo de 7 días.

- 2026-09-28: Próximas actualizado (28 sep – 4 oct). Los nombres de las carreras de Runvasport ya salen bien escritos (p. ej. "III Legua de la Guardia Civil de Valladolid" en vez de todo en mayúsculas). Nueva sección Previas y revisión automática de resultados (sexo, nombres, marcas imposibles).

- 2026-09-28: Previas y Próximas unidas en un solo menú (Próximas). Ya no hay pestaña Previas aparte.

- 2026-09-28: Resultados con todas las pruebas y siempre separados en femenino y masculino (se completa el sexo que falte desde otras fuentes y se revisan de nuevo todas las competiciones del año). Próximas muestra solo los inscritos españoles destacados. Nuevo Ranking automático con los datos oficiales de la RFEA (aire libre y pista cubierta).

- 2026-09-28: Horarios en el calendario: se buscan 3 veces al día en RFEA Live (también las competiciones cuya ficha RFEA no lo enlaza) y aparecen solos en cuanto se publican. Runvasport da la hora siempre; World Athletics y Cronomancha no la publican para estas pruebas.

- 2026-09-28: Inscritos y hora de inicio también desde las plataformas de inscripción tipo AvaiBook (Kirolprobak, AvaiBook Sports) enlazadas en la web oficial. Ej.: Milla de Berango (16:00, lista de participantes).

- 2026-09-28: Calendario sin resultados (ni la etiqueta, ni el botón, ni en la ficha de la competición): los resultados están solo en su pestaña.

- 2026-09-28: Nuevo título de la portada: "El atletismo español al día".

- 2026-09-28: Menú en el móvil: botón ☰ arriba a la derecha que despliega las secciones en una lista grande y legible (en ordenador el menú no cambia).

- 2026-09-29: Nuevo diseño Calle Doss (colores del logo, fondo claro, tarjetas, marcador en directo con medallas). Portada con dos bloques (hoy y esta semana). Calendario por secciones de modalidad, con apartado ADOC. "Por determinar" pasa a "Otros". En la web ya no aparecen los cronometradores (Cronomancha, AvaiBook...) como fuente: se muestran como RFEA, World Athletics, Diamond League o ADOC.

- 2026-09-29: Calendario vuelve a la lista de tarjetas, sin modalidades (ni botones ni secciones). (En Inicio se probaron las opciones del menú a la vista y se quitaron.)

- 2026-09-29: Inicio vuelve a la primera versión del diseño Calle Doss (Hoy / Esta semana / Últimos resultados y Todas las secciones).

- 2026-09-29: Calendario ADOC 2026/2027 añadido (14 pruebas, copiado de la imagen de adocasociacion.es/calendario en `pipeline/adoc_calendar.json`). Las que ya estaban en el calendario se marcan como ADOC con su categoría; Valladolid (10/01/2027) y Ulía (14/02/2027) se añaden. Si ADOC cambia la imagen, sale un aviso en el panel para actualizar el archivo.

- 2026-09-29: Quitados el buscador de Resultados y la opción "Competiciones pasadas" del Calendario (el calendario muestra solo lo que está por venir; lo pasado está en Resultados).

- 2026-09-29: Resultados de la IV Milla de la Cerámica (clasificación en Google Drive enlazada a mano en `pipeline/extra_links.json`). El lector de PDF entiende ahora columnas de licencia y de apellidos/nombre por separado, y el sexo en el título de cada carrera ("CONTROL A FEMENINO").

- 2026-09-29: Próximas muestra el horario de cada competición: prueba a prueba cuando RFEA Live lo publica y, si la competición está en directo, las próximas pruebas de hoy y las ya disputadas (antes solo se veía en En directo).

- 2026-09-29: En Próximas, las competiciones internacionales sin españoles destacados (p. ej. Juegos Asiáticos) muestran el programa prueba a prueba de World Athletics (día, prueba y ronda; disputadas marcadas) en lugar de los inscritos.

- 2026-09-29: Aviso de cookies en la primera visita (Aceptar / Rechazar / Configurar, con Estadísticas y Publicidad desactivadas porque no se usan), enlace "Configurar cookies" y página de Política de cookies en el pie. Tipografías servidas desde la propia web.

- 2026-09-29: Una competición terminada (el directo la da por finalizada o todas sus pruebas tienen resultado) deja de salir en Inicio, Próximas, En directo, la barra superior y el Calendario: solo queda en Resultados.

- 2026-09-29: Previas con élite anunciada por la organización/prensa cuando no hay lista oficial legible (`pipeline/extra_entries.json`). Milla de Berango: Mariano García, Isaac Nader y el relevo 4x400 mixto.

- 2026-09-30: Milla de Berango: la previa muestra solo las hojas oficiales de la organización (19 hombres y 18 mujeres de élite, con dorsal y club, en orden de dorsal). Quitados el relevo 4x400 y las notas que venían de la prensa.

- 2026-09-30: Corregidos los clubes de Alice Finot (R.C. Celta-Nike), Marta Mitjans (Nike Running) y Lorena Martín (New Balance). Los méritos de 1.500 m, 3.000 m, 5.000 m y 10.000 m vuelven a salir en las previas de fondo (antes se leía "1.500 m" como "500 m").

- 2026-09-30: Orden cronológico (de la fecha más antigua a la más reciente) en Resultados (con un título por mes), internacionales de la selección, el recuadro de últimos resultados de la página principal y el panel.

- 2026-09-30: En Próximas y en las fichas, "Web oficial", "Streaming", "Inscritos", etc. se ven como enlaces (subrayados, con ↗) y se abren en otra pestaña sin cerrar la web.

- 2026-09-30: Las altas y bajas de una previa solo cuentan la lista real de inscritos (quitar a alguien de la élite añadida a mano ya no sale como "baja").

- 2026-09-30: Repaso de resultados desde el 1 de enero: nuevas fuentes (LiveTrail para trail, Cruzando la Meta), lector de PDFs de carreras de ruta (tiempo oficial, sexo por categoría) y lector de reuniones de pista (Vigo, Fuenlabrada, Milla Máster...). Las competiciones sin resultados salen como "Resultados pendientes" en la web y en el panel, y se siguen buscando solas.

- 2026-09-30: Resultados: quitada la fila de botones de modalidad (Cross, Diamond League, Internacional, Marcha, Pista, Ruta, Short Track, Trail). Se ven siempre todas.

- 2026-09-30: Medio Maratón de San Sebastián: Elena Silvestre fuera de la previa (no corre). Nueva opción 'excluir' en `pipeline/extra_entries.json` para quitar a inscritos que no van a correr.

- 2026-09-30: Carga histórica terminada: 391 de 431 competiciones con resultados; 41 pendientes (en el panel). Retirados por estar mal: Europeo Off-Road (tiempos mal leídos) y Campeonato de Galicia de combinadas (tenía el PDF de otro campeonato).

- 2026-09-30: Maratón de Berlín: añadido Iban García Azpiazu (3:04:32, puesto 4441) entre los españoles, comprobado en la clasificación oficial (World Athletics solo publica a los primeros). Nuevo archivo `pipeline/extra_results.json` para completar resultados a mano.

- 2026-09-30: Junto al logo pone "CALLEDOSS" en lugar de "ATLETISMO" (página principal y cookies).

- 2026-09-30: Retirados 11 resultados de 2026 que usaban documentos de 2024 (Campeonatos de Madrid Sub18/Sub20/Sub23 con la final de clubes sub20 de 2024, España Máster, Europeo ST Máster, Trofeo Ibercaja, Euskadi ST Sub18-20, Cross Máster, Domusa Teknik 40 MLK). Nueva regla: un documento con otro año en el enlace no se usa nunca. Vuelven a estar pendientes.

- 2026-09-30: Mundial en Pista Cubierta de Toruń: ficha rehecha con los resultados oficiales de World Athletics, solo españoles (6 medallas: 1 oro, 2 platas, 3 bronces). Sale una sola vez (el "Campeonato del Mundo Short Track" del calendario RFEA se junta con ella). En `pipeline/extra_links.json` se puede enlazar una competición a World Athletics con 'solo_espanoles'.

- 2026-10-01: 10K de Ulia con categoría femenina (Isabel Barreiro, María Forero, Marta Serrano). El lector de carreras de ruta usa los puestos por sexo de los pasos intermedios cuando el PDF no dice el sexo. Domusa Teknik 40 MLK: podio absoluto con nombres completos.

- 2026-10-01: Campeonato de Madrid Sub20 (3-4 julio, Vallehermoso): resultados oficiales de la Federación Madrileña (la ficha de la RFEA apuntaba a una página antigua que ya no existe).

- 2026-10-01: SEO básico: título y descripción para Google, vista previa al compartir (images/compartir.png), iconos de pestaña, datos estructurados, robots.txt y sitemap.xml. Dirección pública: https://calledoss.com

- 2026-10-01: Cada sección es una página propia: Inicio (calledoss.com), /calendario, /resultados, /directo, /proximas y /ranking, cada una con su título y descripción para Google. El menú son enlaces; las direcciones antiguas (#resultados) llevan a la página nueva. Las 5 páginas se crean desde index.html con `python3 paginas.py`.

- 2026-10-01: Una página propia por cada competición con resultados (calledoss.com/resultados/<nombre>-<fecha>), con podios femeninos y masculinos y los españoles escritos en la página para que Google los lea. Se regeneran solas cada día (proceso diario de GitHub) junto con sitemap.xml, y desde la lista de Resultados hay un enlace a cada una.

## How to Customize
- Para poner o quitar una alerta (prueba cancelada o aplazada): editar la lista `ALERTAS` al principio del calendario en `script.js` (fecha de la prueba, una palabra de su nombre o lugar, estado y texto). La alerta desaparece sola de Inicio pasado el día de la prueba. Para quitarla solo de Inicio y que la prueba siga como «Cancelada» en el calendario, añadir `portada:false` (así está la de Alcobendas). Añadir la traducción del texto en `en.js` (ui)
- Las páginas de cada competición (`public/resultados/`) y `sitemap.xml` las crea `pipeline/static_pages.py` cada día; no se editan a mano. Para rehacerlas en el momento: GitHub → Actions → Datos → Run workflow → `paginas`
- IMPORTANTE: el contenido de las páginas de sección (calendario.html, resultados.html, directo.html, proximas.html, ranking.html) sale de index.html. Después de cambiar index.html (o robots.txt / sitemap.xml) hay que ejecutar `python3 paginas.py` para que las demás páginas lo tengan también (sus títulos y descripciones están en ese archivo). Ese comando deja además una copia en `public/`, que es la carpeta que publica Cloudflare
- Si se añade una página nueva: añadirla a `sitemap.xml` y ponerle título, descripción y `canonical` en su `<head>`
- Para añadir la élite anunciada de una prueba: editar `pipeline/extra_entries.json` (id de la competición, fuente y atletas)
- Si a un resultado le falta un atleta (comprobado en la clasificación oficial): añadirlo en `pipeline/extra_results.json` con el id del resultado
- Si un resultado está mal (PDF mal leído o de otra competición): añadir el id y el enlace en `pipeline/bad_results.json`; se retira y vuelve a quedar pendiente
- Para quitar de una previa a alguien que no corre: en `pipeline/extra_entries.json`, añadir su nombre en "excluir" dentro del id de la competición
- Si se añaden estadísticas o publicidad: cargarlas solo si `hasCookieConsent('estadisticas')` / `hasCookieConsent('publicidad')` (script.js) y actualizar `cookies.html`
- Para añadir una clasificación que el sistema no encuentra (p. ej. un PDF en Google Drive): añadir el enlace en `pipeline/extra_links.json` con el id de la competición
- Para actualizar el calendario ADOC (cuando el panel avise de que ha cambiado): editar `pipeline/adoc_calendar.json` con las pruebas y fechas de la imagen nueva
- To change colors: edit the variables at the top of `styles.css` (e.g. `--red`)
- To add a competition the automatic calendar missed: use the private panel (`/panel`)
- To change texts on the page: edit `index.html`
- The national-team profiles are still written by hand in `script.js`; the ranking is automatic (RFEA)

- 2026-10-01: Nueva sección **Contacto** en el menú (formulario que envía a calledosspodcast@gmail.com con FormSubmit, gratis, y botones a Instagram, X, TikTok y Spotify). Añadida al pie de página, a la política de cookies, a las páginas de resultados y al sitemap.
- 2026-10-01: Arreglado que algunos navegadores siguieran usando el diseño antiguo (iconos de Contacto enormes). Los archivos de diseño llevan ahora un número de versión (`styles.css?v=20261001t`) y el navegador comprueba siempre si hay uno nuevo. **Al cambiar styles.css o script.js, sube ese número** en index.html, cookies.html, en/cookies.html y panel.html y ejecuta `python3 paginas.py` (las páginas de resultados lo copian solas de index.html).
- 2026-10-01: En Contacto, "el pódcast de Calle 2" pasa a "el pódcast de Calledoss".
- 2026-10-01: En el formulario de Contacto, el campo "Nombre" pasa a "Nombre y apellido".
- 2026-10-01: **Versión en inglés** completa en calledoss.com/en/ (todas las secciones, cookies y las 390 páginas de resultados), con botón ES/EN, etiquetas hreflang para Google y sitemap con las direcciones en inglés.
- 2026-10-02: Previas: se leen las listas de Runvasport y de RFEA Live de las federaciones (rfealive.me), y el PDF de inscritos por categoría de la RFEA (Cross Máster). Ya no se usan listas de años anteriores. En carreras populares se completan hasta 3 favoritos por sexo con victorias y podios en otras carreras. Se pueden añadir favoritos a mano con fuente oficial (p. ej. podio de la edición anterior, Trail El Calero) y quitar pruebas concretas (Legua de la Guardia Civil sin la de 5,5 km sin camiseta).
- 2026-10-02: Carreras de un solo sexo (Carrera de la Mujer, Liga Iberdrola…): la previa muestra solo esa columna. En la portada, si hoy no hay competiciones pone solo «Hoy no hay competiciones».
- 2026-10-02: Resultados en PDF de Conersys: se leen también sin dorsal, con invitados «(I)» y con los intentos de los concursos. En campeonatos de varias categorías (p. ej. Navarro Sub20-Sub23) hay un podio por categoría según el año de nacimiento y sin los invitados.
- 2026-10-02: Previas con más favoritos, siempre con fuente oficial: medallistas de la edición anterior (Cto. de España Máster de Cross 2025 desde RFEA Live; Milla Urbana de Valladolid 2025 desde la clasificación oficial de Runvasport), élite anunciada por la organización (Coruña 10: Adrián Ben y Águeda Marqués, noticias del Concello). El Cross Máster muestra los favoritos de cada categoría (M35, F40…), sin los inscritos solo por equipos. Si no hay lista pública de inscritos, no se muestra «0 inscritos».
- 2026-10-02: Albacete (Kipruto, Kedir, Cherono, Jepkosgei) y Logroño (Verdeliss, Esther Rodríguez): la organización no ha publicado nombres, así que se usan los de prensa, indicándolo en el motivo («anunciada en prensa (medio)»). La élite anunciada se ve en Próximas aunque no sea española (con su país al lado).
- 2026-10-02: Directo de SmartTrack RFEA (smarttrackrfea.es, el directo nuevo de la RFEA): se sigue igual que RFEA Live, cada pocos minutos, con el nombre completo de cada atleta sacado del PDF oficial de cada prueba. Primera competición: Cto. de España de Cross Máster (domingo 4). Campeonatos conjuntos de dos federaciones (Guipúzcoa-Navarra): podios Sub20/Sub23 solo con los atletas de la federación del campeonato.
- 2026-10-02: Previas: los nombres salen bajo «Atletas a destacar» (no «inscritos españoles destacados») y se indica que no son los únicos inscritos.
- 2026-10-02: En la portada, «¿Qué hay esta semana?» pasa a «¿Qué hay próximamente?».
- 2026-10-02: Directo y resultados al momento de las carreras populares: lectores de irteerak (Medio Maratón de San Sebastián, en vivo con llegadas), UNO crono / resultados.uno.es (Maratón de Logroño), ChampionChip Norte (Coruña 10), Kirolprobak/Runvasport (Berango y populares de Castilla y León) y Chip Levante (Albacete), con World Athletics de reserva. Durante la competición se comprueban cada 3–5 minutos; en cuanto la clasificación es oficial pasa a Resultados. Las fuentes de cada carrera se añaden en pipeline/extra_links.json («live»).
- 2026-10-02: Datos casi al momento: la web lee los datos a través del Worker de Cloudflare (calledoss-panel.kermantxo.workers.dev/data/…), que los coge de la rama «datos» por la API de GitHub y guarda copia solo 20 segundos (antes, raw.githubusercontent.com podía ir hasta 5 minutos por detrás). GitHub y la copia de la web quedan de reserva. El directo se refresca solo cada minuto.
- 2026-10-02: «DIRECTO» en verde (con punto parpadeante) mientras se celebra cada prueba: desde la hora de salida hasta 2 h después de la última (5 h si solo se sabe la salida), aunque el cronometrador aún no haya publicado resultados. También la barra superior de directo y las etiquetas de Próximas e Inicio pasan a verde.
- 2026-10-02: En directo solo muestra lo que se está celebrando: cada competición entra justo a su hora de salida (la página mira el reloj cada 15 s) y sale al terminar; hasta entonces está en Próximas.
- 2026-10-03: Ranking: nueva pestaña **Ruta** con el ranking oficial de la RFEA de carreras en ruta (milla, 5 km, 10 km, 15 km, media, maratón, 50 km, 100 km, 24 horas) y de marcha en ruta (5 km a maratón).
- 2026-10-03: Resultados se abre con el mes actual seleccionado (el desplegable permite ver otros meses o todos).
- 2026-10-03: Resultados solo muestra lo ya disputado o en marcha: lo de hoy entra a su hora de salida y, mientras se celebra, aparece como «En curso» (verde) en vez de «Disputada».
- 2026-10-03: Una competición que ya tiene resultados y cuya última salida ya ha pasado se da por terminada: sale de Próximas y de En directo y queda solo en Resultados.
- 2026-10-03: En directo muestra las competiciones de hoy desde su hora de salida hasta las 00:00: en marcha con «DIRECTO» en verde y, al terminar, con «FINALIZADO» y sus resultados. En Próximas ya no salen las terminadas.
- 2026-10-03: Resultados: quitado el bloque aparte «Internacionales de la selección»; esas competiciones salen en la lista normal, por meses, como las demás.
- 2026-10-03: Los resultados del directo pasan a Resultados en el mismo momento (prueba a prueba en RFEA Live y SmartTrack, categoría a categoría en los cronometradores), sin esperar a que termine la competición; mientras tanto la competición sale como «En curso» en Resultados. En directo salen todas las pruebas del día, la más reciente arriba.
- 2026-10-03: Milla de Berango: vuelve la exhibición de relevo 4x400 mixto (18:45) con sus 8 atletas (Markel Fernández, Ángel González, Juan José de la Rosa, Manuel Bea, Blanca Hervás, Eva Santidrián, Herminia Parra y Daniela Fra), anunciados en prensa (Deia) y puestos con permiso expreso.
- 2026-10-03: En directo, las clasificaciones que el cronometrador publica abreviadas («Sub 12 Fem», «Senior / Vet Masc»...) se colocan bajo su hora del horario oficial. Antes en Berango solo aparecía la Sub-20.
- 2026-10-03: Directo: se puede poner un podio a mano («a_mano» en pipeline/extra_links.json) mientras el cronometrador no publica; sale como provisional y la clasificación oficial lo sustituye sola. Usado en la élite femenina de Berango. Además, «Paralimpico» del cronometrador ya se coloca en «Paralímpicos».
- 2026-10-03: Resultados: en las carreras pequeñas (hasta 1.500 llegados por prueba y sexo, como Berango o la Higuero) se guarda la clasificación completa de cada categoría, no solo los 10 primeros; en las multitudinarias (Behobia, maratones) siguen los 10 primeros. En la página de resultados sale el podio y «Ver clasificación completa».
- 2026-10-03: Los PDF de AvaiBook que solo sirve Runvasport o Kirolprobak se leen igual (Higuero Running Festival); la Higuero entra en el directo y guarda la clasificación completa.
- 2026-10-03: RFEA Live: se leen todas las sesiones del horario (mañana, tarde, día siguiente). Antes, al aparecer la sesión del día siguiente, se perdían las pruebas de la tarde (Reunión Máster de La Laguna pasó de 41 pruebas a 1). Además, si una fuente devuelve de golpe menos pruebas, las ya guardadas se conservan.
- 2026-10-03: Directo: una prueba sin clasificación ya no sale «En marcha» para siempre. Pasada una hora de su salida, o con la competición terminada, sale «Sin resultados publicados». Las carreras que el cronometrador llama distinto que el horario (Medina: «X Carrera de la Mujer…» frente a «Carrera») se colocan en la única carrera empezada.
- 2026-10-03: Directo: cuando ya no queda ninguna prueba por empezar, se mantiene el horario de la RFEA con sus resultados (antes se cambiaba por uno sin resultados y todo salía «En marcha»). Pruebas con todos los inscritos DNS: «No disputada».
- 2026-10-03: Coruña 10: Isabel Barreiro en la élite de la previa (dato confirmado por Kerman, sin enlace).
- 2026-10-04: Próximas: dentro de cada día, las competiciones van por su hora de salida de ESE día (una de varios días, como la Reunión de La Laguna, ya no sale primera el domingo con la hora del sábado). La hora que se ve en cada competición también es la de ese día.
- 2026-10-04: Directo y resultados de hoy: Coruña 10 desde Carreiras Galegas (web de la Federación Galega, lector nuevo); Albacete desde el PDF oficial de Chip Levante; Logroño con el nuevo diseño de UNO crono; Donostia recupera su cronometrador (irteerak). El directo aplica siempre los enlaces puestos a mano.
- 2026-10-04: Directo: la marcha popular, las carreras infantiles, las exhibiciones y las pruebas testimoniales sin clasificación salen como «No competitiva» (no «Sin resultados publicados»).
- 2026-10-04: Directo y Próximas: se enseña el horario entero de las pruebas que faltan (antes solo las 10 siguientes; en la Milla de Valladolid se cortaba en las 18:25).
- 2026-10-04: Cto. de España de Cross Máster: los PDF de SmartTrack de campo a través (tres líneas por atleta) se leen bien: nombre completo, club y marca.
- 2026-10-08: Última hora: franja roja de aviso en Inicio (encima de los tres recuadros). Primera alerta: el Cross de la Constitución de Alcobendas (29/11/2026) se suspende por las elecciones generales; en el calendario y en su ficha sale como «Cancelada» y deja de contar en Próximas y en Inicio.
- 2026-10-09: Ranking: en el heptatlón las columnas van en el orden Atleta – Marca – Club (en las demás pruebas sigue Marca – Atleta – Club).
- 2026-10-10: Previas: se leen solos los inscritos de la pestaña INSCRITOS de las fichas de la RFEA (PDF «Listado de inscritos», p. ej. Cto. de España sub-16 por Clubes) y las listas de participantes de 321go (Media Maratón de Gijón, enlazada a mano en `pipeline/extra_links.json`). En 321go el atleta tiene que coincidir con nombre y apellidos en el mismo orden, para no confundir a personas con el mismo nombre.
- 2026-10-10: Maratón de Chicago: previa con los 48 españoles inscritos que han bajado de 3:10, cada uno con «Marca personal (tiempo, maratón)». La lista sale del buscador oficial de Chicago (nacionalidad ESP) cruzado con las clasificaciones oficiales de Sevilla 2026, Barcelona 2025 y 2026, Málaga 2025, Zaragoza 2026 y Chicago 2025 (en `pipeline/extra_entries.json`; `max_por_sexo` permite enseñar más de 25 por sexo).
- 2026-10-12: Milla Internacional de Otoño Manuel Pancorbo (Jaén): previa con la élite del cartel oficial (23 hombres y 16 mujeres, con su dorsal), en `pipeline/extra_entries.json`.
- 2026-10-12: Resultados de la Milla Manuel Pancorbo cargados a mano desde el PDF oficial del Patronato de Deportes de Jaén (cronometraje Cruzando la Meta): 23 hombres y 12 mujeres llegados. Ganan Mohamed Attaoui (4:21) y Marta Mitjans (4:44, récord de la prueba).
- 2026-10-12: En directo: las competiciones de hoy ya terminadas muestran solo el podio femenino y el masculino (sin «Destacados»), con un enlace a la clasificación oficial completa. Una carrera de hoy sin hora publicada pero con resultados ya cuenta como terminada y aparece en En directo como «Finalizado».
- 2026-10-13: Nueva sección **El pódcast** al final de Inicio con el último programa de Spotify. No hay que tocar nada al publicar un episodio: sale solo. Por privacidad, el reproductor de Spotify no se carga hasta que el visitante pulsa «Escuchar aquí» (añadido a la política de cookies).
- 2026-10-15: **El pódcast** de Inicio enseña ya el último episodio: portada, título, fecha y duración, y se escucha entero en la propia página. Los datos los recoge solo el proceso automático cada hora (archivo `podcast.json`), así que al publicar un episodio nuevo aparece en menos de una hora sin tocar nada. Si algún día Spotify falla, se ve el reproductor del programa como antes.
- 2026-10-15: Aviso **«¡Vuelve el cross!»** en la barra **Última hora** de Inicio (mismo formato que el de la cancelación de Alcobendas): anuncia el Cross de Zornotza y el Cross del Aceite (domingo 18 de octubre) y lleva a Próximas. Se oculta solo pasado el 18. Está en la lista `ALERTAS` de `script.js` como `aviso:true` (una noticia, no cancela ninguna prueba); su traducción está en `en.js`.
- 2026-10-15: En el aviso del cross se quita «Última hora»: la franja pone solo **¡VUELVE EL CROSS!** y el texto.
- 2026-10-13: Quitado el aviso de «Última hora» de Inicio sobre el Cross de Alcobendas. En el calendario sigue como «Cancelada».
- 2026-10-14: Previas del 72º Cross Internacional Zornotza (Amorebieta) y del XLI Cross del Aceite (Torredonjimeno), los dos el 18/10: favoritos y favoritas tal cual los publica ADOC (la asociación de organizadores del circuito), en `pipeline/extra_entries.json`.
- 2026-10-16: Previa de la XVIII Bilbao Night (17/10): favoritos y favoritas de la media maratón (11) y del 10K (9) con su mejor marca, tal cual los publica Atletismo24h en X; en la web pone «anunciado en prensa». En `pipeline/extra_entries.json`.
- 2026-10-16: Previa de la I Milla Internacional del Cantábrico (Viveiro, 17/10): la élite oficial de la organización (17 hombres y 9 mujeres, cartel compartido por Adrián Ben), con los méritos de cada atleta tal cual los presenta la organización en su Instagram. En `pipeline/extra_entries.json`.
- 2026-10-17: Horarios oficiales de las pruebas de hoy para que salgan en orden (Palafrugell 08:45–20:30, Honrubia 16:00, Viveiro 17:00 con la Milla élite a las 19:00, Ontinyent 17:30 con la élite a las 19:00, Bilbao Night 19:00), copiados de sus webs en `pipeline/extra_links.json`. El Ecocamiño 50K no publica hora de salida.
- 2026-10-17: **En directo**: en las competiciones con horario prueba a prueba (RFEA), las pruebas que van terminando salen arriba, la última primero y abierta con su podio, y debajo el resto del horario. Arreglado que en combinadas dos pruebas con el mismo nombre a distinta hora (p. ej. Peso F45 del pentatlón y del heptatlón) compartieran resultados.
- 2026-10-21: Previas del 25/10: XLII Cross de Quintanar de la Orden (favoritos y favoritas tal cual los publica ADOC, 7 hombres y 4 mujeres) y XXXI Carrera Popular Costa de Ajo (los 16 atletas presentados por la organización en su Instagram, con club y méritos). En `pipeline/extra_entries.json`.
- 2026-10-21: Previa del Medio Maratón de Valencia (25/10) con la lista oficial de élite de la organización: solo los españoles (37 hombres y 19 mujeres), con dorsal y marca personal. En `pipeline/extra_entries.json`.
- 2026-10-21: Añadida a mano al calendario la XIX CaixaBank 10K Zaragoza (25/10, 9:30), con enlace a su web oficial.
- 2026-10-21: Previa del 10K Zaragoza: Abderrahmane Aferdi y Eduardo Menacho, los dos atletas de élite que anuncia la organización en su web e Instagram. En `pipeline/extra_entries.json`.
- 2026-10-21: 10K Zaragoza: Raquel de Francisco e Isabel Linares en la élite de la previa, confirmadas por la organización a Kerman (sin enlace público).
- 2026-10-21: Carreras de Runvasport con varias distancias el mismo día (p. ej. Burgos Tras las Huellas del Cid: 5K, 10K y 21K) salen como una sola cita con todas sus distancias en el nombre y la hora de la primera salida, y los resultados se leen de todas las distancias (cada clasificación con su distancia delante).
- 2026-10-22: Aviso de «Última hora» en la portada: «Helsinki, sede del Europeo al Aire Libre en 2030» (sale hasta el 29/10; se cambia en la lista ALERTAS de script.js). El texto se mueve de derecha a izquierda como un rótulo (opción mover:true) y se para al pasar el ratón por encima.
- Para cambiar el pódcast de la portada: el código del programa está en `SHOW` de `pipeline/podcast.py`, en `PODCAST_SHOW` al final de `script.js` y en el enlace «Abrir en Spotify» de la página principal.
