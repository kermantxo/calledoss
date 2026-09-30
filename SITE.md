# CALLEDOSS · Atletismo

> Todo lo que necesitas saber para estar al día en el atletismo español.

## Brand Identity
- Personality: deportiva, directa, informativa, con estética de pista de atletismo (líneas de calle, marcas, cronómetro)
- Colors: terracota de pista del logo `#D9603F` (acento principal, más oscuro `#B5482A`), turquesa complementario `#1E7A80` (lo que viene), dorado/plata/bronce para medallas, fondo claro `#F7F4F0`, tarjetas blancas y cabecera casi negra `#1B1A19` para que el logo destaque
- Fonts: Bebas Neue (títulos), Barlow Condensed (texto), Roboto Mono (datos y cifras)
- Language: español

## Pages
- **Página principal** (`index.html`) - Una sola página con pestañas en el menú superior:
  - **Inicio** - Titular "El atletismo español al día" y tres bloques grandes: **Lo que puedes ver hoy** (terracota, con "VIVO" si hay directo), **¿Qué hay esta semana?** y **Últimos resultados**; debajo, **Todas las secciones** con icono. Arriba, la barra EN DIRECTO solo cuando hay competición.
  - **Calendario** - Lista de tarjetas por mes (fecha, lugar, hora, emisión, inscritos) con filtros de mes, localidad (las que no tienen localidad van en "Otros"), y calendario (RFEA, World Athletics, Diamond League o ADOC). Sin modalidades a la vista. Las pruebas del circuito ADOC llevan su etiqueta.
  - **Resultados** - Competiciones ya disputadas este año. Cada una muestra **todas sus pruebas**, separadas en **Femenino** y **Masculino** (podio y, si se quiere, la clasificación completa). Si una fuente solo trae un sexo, se busca el otro en las demás fuentes; mientras no aparece se indica "Sin resultados femeninos/masculinos localizados todavía". Las competiciones de un solo sexo (Liga Iberdrola, Liga Joma, carreras de la mujer) muestran solo ese.
  - **En directo** - Las competiciones de hoy. Mientras hay pruebas en marcha se actualiza sola cada pocos minutos. Si una fuente no publica parciales, se muestra "Sin datos en directo" con el horario previsto.
  - **Próximas** - Rango de 7 días: desde hoy hasta dentro de seis días (si hoy es martes, hasta el lunes), agrupado por día. Cada cita muestra sus **inscritos españoles destacados** de cada prueba (mujeres y hombres) en cuanto se publica la lista; si no, "Inscritos no publicados aún". Aquí no se muestran resultados (están en su pestaña).
  - **Ranking** - Ranking español del año con los datos oficiales de la RFEA: top 10 de cada prueba, categoría absoluta, separado en **Aire libre** y **Pista cubierta**, mujeres y hombres. Se actualiza solo cada día.
  - **Inscritos** - Lista de salida completa de una competición
- **Política de cookies** (`cookies.html`) - Qué se guarda (solo lo necesario), terceros, cómo cambiar la elección. Faltan los datos del titular: [NOMBRE DEL TITULAR], [NIF], [DIRECCIÓN], [EMAIL DE CONTACTO].
- **Panel privado** (`panel.html`, no aparece en el menú) - Con clave. Sirve para añadir a mano una competición que el calendario automático no haya encontrado (nombre, fecha, lugar, horario y enlace opcional), siempre antes del día de la prueba. También muestra avisos si alguna fuente falla y el plan de directo de hoy.

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

## How to Customize
- Para añadir la élite anunciada de una prueba: editar `pipeline/extra_entries.json` (id de la competición, fuente y atletas)
- Si se añaden estadísticas o publicidad: cargarlas solo si `hasCookieConsent('estadisticas')` / `hasCookieConsent('publicidad')` (script.js) y actualizar `cookies.html`
- Para añadir una clasificación que el sistema no encuentra (p. ej. un PDF en Google Drive): añadir el enlace en `pipeline/extra_links.json` con el id de la competición
- Para actualizar el calendario ADOC (cuando el panel avise de que ha cambiado): editar `pipeline/adoc_calendar.json` con las pruebas y fechas de la imagen nueva
- To change colors: edit the variables at the top of `styles.css` (e.g. `--red`)
- To add a competition the automatic calendar missed: use the private panel (`/panel`)
- To change texts on the page: edit `index.html`
- The national-team profiles are still written by hand in `script.js`; the ranking is automatic (RFEA)
