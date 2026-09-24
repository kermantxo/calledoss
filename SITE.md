# CALLEDOSS · Atletismo

> Todo lo que necesitas saber para estar al día en el atletismo español.

## Brand Identity
- Personality: deportiva, directa, informativa, con estética de pista de atletismo (líneas de calle, marcas, cronómetro)
- Colors: fondo casi negro `#0a0a0a`, rojo pista `#c0170a` (acento), marfil `#f5f1e8` (texto), gris `#8f8c84`, dorado `#d4a017` (detalles)
- Fonts: Bebas Neue (títulos), Barlow Condensed (texto), Roboto Mono (datos y cifras)
- Language: español

## Pages
- **Página principal** (`index.html`) - Una sola página con pestañas en el menú superior:
  - **Inicio** - "¿Qué encontrará en Calledoss?" con accesos a cada sección
  - **Calendario** - Todas las competiciones del año, **actualizado solo cada día**: RFEA, World Athletics (las internacionales relevantes), Cronomancha y AvaiBook/Runvasport, más las que se añadan a mano. Muestra fecha, prueba, lugar, horario (cuando se conoce) y enlaces a inscritos/resultados/directo.
  - **Resultados** - Competiciones ya disputadas este año. Los resultados se añaden solos en cuanto se publican (PDF oficiales de RFEA, RFEA Live, World Athletics, Cronomancha, AvaiBook). Cada una muestra podios, españoles y destacados, y un botón "Ver todas las pruebas".
  - **En directo** - Las competiciones de hoy. Mientras hay pruebas en marcha se actualiza sola cada pocos minutos. Si una fuente no publica parciales, se muestra "Sin datos en directo" con el horario previsto.
  - **Próximas** - Rango de 7 días: desde hoy hasta dentro de seis días (si hoy es martes, hasta el lunes), agrupado por día, con los españoles a seguir de cada cita.
  - **Ranking** - Líder nacional 2026 por prueba, filtrable por sexo (sigue siendo manual)
  - **Inscritos** - Lista de salida completa de una competición
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

## How to Customize
- To change colors: edit the variables at the top of `styles.css` (e.g. `--red`)
- To add a competition the automatic calendar missed: use the private panel (`/panel`)
- To change texts on the page: edit `index.html`
- The national-team profiles and the ranking are still written by hand in `script.js`
