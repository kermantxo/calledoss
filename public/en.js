/* Calledoss en inglés (calledoss.com/en/): todas las traducciones de la web.
   - ui: textos de la web (botones, títulos, avisos). La clave es el texto en español tal cual.
   - text: textos exactos que vienen de los datos o de las fichas hechas a mano.
   - rules: reglas para traducir nombres de pruebas, rondas y categorías (en orden).
   - reasons: reglas para los motivos de los atletas destacados.
   Lo usan script.js (al mostrar los datos), paginas.py (páginas en inglés) y
   pipeline/static_pages.py (páginas de resultados en inglés). Debe ser JSON válido. */
window.CALLEDOSS_EN = {
 "title_re": "^(?:[IVXLCDM]+|\\d+[ªº])\\s|«(?:CP|Ciudad|Villa|Memorial|Trofeo|Gran Premi[o]?|Urbana|Popular|Solidaria|San|Santa|Virgen|Cross|Trail|Legua|Subida)»|[\"“”']",
 "ui": {
  "En directo": "Live",
  "Hoy": "Today",
  "Sin competiciones": "No competitions",
  "No hay eventos que coincidan con estos filtros.": "No events match these filters.",
  "hasta el {fecha}": "until {fecha}",
  "Inscritos": "Entries",
  "Visibles": "Shown",
  "Ocultas": "Hidden",
  "1 confirmado": "1 confirmed",
  "{n} confirmados": "{n} confirmed",
  "Sin referencia adicional": "No further details",
  "Marca:": "Mark:",
  "Sin marca registrada": "No mark recorded",
  "Cuándo compite:": "When:",
  "Resultado:": "Result:",
  "Pendiente": "Pending",
  "Lista de atletas": "Athlete list",
  "Todavía no se ha publicado la lista de inscritos ni los resultados de esta cita. Esta ficha se completa sola en cuanto la organización los publica.": "The entry list and results for this competition have not been published yet. This page fills in automatically as soon as the organisers publish them.",
  "Lista de salida completa (todos los países)": "Full start list (all countries)",
  "disponible dentro de esta misma web.": "available right here on this site.",
  "Ir a la página Inscritos →": "Go to the Entries page →",
  "Dónde ver:": "Where to watch:",
  "Lista de salida completa del Europeo": "Full start list for the European Championships",
  "1.645 atletas · 49 países · fuente: European Athletics (31/07/2026)": "1,645 athletes · 49 countries · source: European Athletics (31/07/2026)",
  "Ver todos los españoles inscritos (todas las pruebas)": "See every Spanish entrant (all events)",
  "España — todas las pruebas ({n} inscripciones)": "Spain — all events ({n} entries)",
  "Prueba": "Event",
  "Categoría": "Category",
  "Atleta": "Athlete",
  "Resultado": "Result",
  "Elige una prueba de {cat} para ver el listado completo de inscritos.": "Choose a {cat} event to see the full entry list.",
  "Solo España": "Spain only",
  "{n} inscritos de {p} países. Resultado: se actualizará cuando se dispute la prueba.": "{n} entrants from {p} countries. Result: will be updated once the event has taken place.",
  "País": "Country",
  "Hombres": "Men",
  "Mujeres": "Women",
  "Mixto": "Mixed",
  "EN DIRECTO": "LIVE",
  "SIN DATOS EN DIRECTO": "NO LIVE DATA",
  "HOY": "TODAY",
  "FINALIZADO": "FINISHED",
  "Horario previsto:": "Scheduled:",
  "Horario previsto: sin publicar": "Schedule: not published yet",
  "Sin competiciones en curso": "No competitions in progress",
  "Cuando haya pruebas hoy, aquí verás el marcador en vivo.": "When there are events today, you'll see the live scoreboard here.",
  "Actualizado a las <b>{hora}</b> · se actualiza solo, sin recargar": "Updated at <b>{hora}</b> · refreshes by itself, no need to reload",
  "RESULTADOS": "RESULTS",
  "Resultados en PDF": "Results (PDF)",
  "Competición terminada. Los resultados aparecerán en la sección Resultados en cuanto se publiquen.": "Competition over. The results will appear in the Results section as soon as they are published.",
  "Sin datos en directo.": "No live data.",
  "Próximas pruebas": "Next events",
  "{done}/{total} pruebas terminadas": "{done}/{total} events finished",
  "Hoy · próximas pruebas": "Today · next events",
  "Ya disputadas hoy": "Already held today",
  "disputada": "held",
  "Hora de inicio": "Start time",
  "fin previsto": "expected finish",
  "Horario sin publicar todavía. Se añadirá solo en cuanto la organización lo publique.": "Timetable not published yet. It will be added automatically as soon as the organisers publish it.",
  "Programa prueba a prueba": "Event-by-event programme",
  "Horario": "Timetable",
  "La organización no publica la hora de cada prueba; se indica el día y la ronda.": "The organisers don't publish a time for each event; the day and round are shown instead.",
  "Del <b>{ini}</b> al <b>{fin}</b>.": "From <b>{ini}</b> to <b>{fin}</b>.",
  "No hay citas en el calendario para los próximos 7 días.": "There are no competitions in the calendar for the next 7 days.",
  "programa prueba a prueba": "event-by-event programme",
  "{n} españoles destacados": "{n} Spaniards to watch",
  "{n} inscritos": "{n} entrants",
  "inscritos no publicados aún": "entries not published yet",
  "Lugar por confirmar": "Venue to be confirmed",
  "Es hoy.": "It's today.",
  "Ver en directo →": "Watch live →",
  "Ver ficha completa →": "Full details →",
  "Sin desglose todavía": "No breakdown yet",
  "Esta competición ya ha finalizado pero aún no tengo medallistas confirmados con nombre y apellido.": "This competition has finished, but there are no medallists confirmed by full name yet.",
  "Sin resultados": "No results",
  "Ninguna competición disputada coincide con estos filtros.": "No completed competition matches these filters.",
  "<b>{n}</b> competiciones disputadas este año con los filtros activos · <b>{r}</b> con resultados.": "<b>{n}</b> competitions held this year with the current filters · <b>{r}</b> with results.",
  "Resultados": "Results",
  "Todavía no se han encontrado resultados oficiales en ninguna fuente; se siguen buscando": "No official results have been found in any source yet; the search continues",
  "Resultados pendientes": "Results pending",
  "Disputada": "Held",
  "Página de resultados de esta competición": "Results page for this competition",
  "(para compartir o guardar)": "(to share or save)",
  "Resultados aún no publicados": "Results not published yet",
  "Todavía no se han encontrado los resultados oficiales de esta competición en ninguna fuente. Se siguen buscando automáticamente.": "The official results of this competition have not been found in any source yet. The search continues automatically.",
  "Esta competición ya se ha celebrado, pero la organización todavía no ha publicado los resultados. Se añadirán solos en cuanto aparezcan.": "This competition has taken place, but the organisers have not published the results yet. They will be added automatically as soon as they appear.",
  "Aire libre": "Outdoor",
  "Pista cubierta": "Indoor",
  "Todas las pruebas": "All events",
  "Cargando ranking…": "Loading rankings…",
  "Datos oficiales de la RFEA.": "Official data from the Spanish Athletics Federation (RFEA).",
  "<b>Ranking {temporada} {anio}</b> · categoría absoluta · mejor marca de cada atleta (solo marcas válidas).": "<b>{temporada} rankings {anio}</b> · senior category · each athlete's best mark (legal marks only).",
  "Fuente:": "Source:",
  "ranking oficial RFEA": "official RFEA rankings",
  "actualizado": "updated",
  "Sin marcas": "No marks",
  "La RFEA todavía no tiene marcas en esta prueba y temporada.": "The RFEA has no marks yet for this event and season.",
  "Marca": "Mark",
  "Lugar · fecha": "Venue · date",
  "Directo": "Live",
  "Web oficial": "Official website",
  "Ficha oficial": "Official page",
  "Abrir": "Open",
  "inscritos": "entries",
  "{n} destacados": "{n} to watch",
  "Inscritos españoles destacados": "Spanish entrants to watch",
  "Por qué:": "Why:",
  "Mejor marca del año:": "Season's best:",
  "<b>Previa disponible</b> ({n} inscritos) en Próximas.": "<b>Preview available</b> ({n} entrants) in Upcoming.",
  "Inscritos no publicados aún.": "Entries not published yet.",
  "Datos:": "Data:",
  "Clasificación general": "Overall standings",
  "Ver clasificación completa ({n})": "See full standings ({n})",
  "Femenino": "Women",
  "Masculino": "Men",
  "1 prueba": "1 event",
  "{n} pruebas": "{n} events",
  "Sin resultados femeninos localizados todavía. Se siguen buscando en todas las fuentes.": "No women's results found yet. All sources are still being searched.",
  "Sin resultados masculinos localizados todavía. Se siguen buscando en todas las fuentes.": "No men's results found yet. All sources are still being searched.",
  "Mixtas / sin sexo indicado": "Mixed / sex not stated",
  "Clasificaciones publicadas por el cronometrador.": "Standings published by the timing company.",
  "Ver clasificaciones →": "See standings →",
  "Españoles": "Spaniards",
  "Destacados": "Highlights",
  "Resultados · {n} pruebas · fuente:": "Results · {n} events · source:",
  "original": "original",
  "Clasificación incompleta.": "Incomplete standings.",
  "Ver la clasificación completa en el documento oficial →": "See the full standings in the official document →",
  "Cargando todas las pruebas…": "Loading all events…",
  "Sin destacados según los criterios.": "No standout athletes under our criteria.",
  "MMT": "SB",
  "MMP": "PB",
  "Inscritos no publicados aún": "Entries not published yet",
  "Se revisa cada día. En cuanto la organización publique la lista, aquí aparecerán los inscritos españoles destacados.": "Checked every day. As soon as the organisers publish the list, the Spanish entrants to watch will appear here.",
  "{n} inscritos en total": "{n} entrants in total",
  "Incluye a los favoritos con <b>dorsal de élite</b> asignado por la organización (la lista no indica la nacionalidad).": "Includes the favourites given an <b>elite bib</b> by the organisers (the list does not show nationality).",
  "Cambios desde la última revisión: <b>+{altas}</b> altas, <b>−{bajas}</b> bajas": "Changes since the last check: <b>+{altas}</b> added, <b>−{bajas}</b> withdrawn",
  "Nuevos destacados:": "New names to watch:",
  "Bajas destacadas:": "Notable withdrawals:",
  "Ver la lista de inscritos original": "See the original entry list",
  "Sin sexo indicado en la lista": "Sex not stated on the list",
  "Falta por confirmar la lista de inscritos": "The entry list is still to be confirmed",
  "Cerrar el menú": "Close menu",
  "Abrir el menú": "Open menu",
  "DIRECTO": "LIVE",
  "y {n} más": "and {n} more",
  "Hoy no hay competiciones.": "No competitions today.",
  "La próxima: {nombre} ({fecha}).": "Next up: {nombre} ({fecha}).",
  "No hay citas en los próximos 7 días.": "No competitions in the next 7 days.",
  "Todavía no hay resultados.": "No results yet.",
  "Todas las modalidades": "All disciplines",
  "Todas": "All",
  "Todos los meses": "All months",
  "Todos los tipos": "All types",
  "Todas las localidades": "All regions",
  "Todos los calendarios": "All calendars",
  "No se ha podido enviar. Prueba otra vez en un rato o escríbenos a {email}.": "Your message couldn't be sent. Please try again in a while or email us at {email}.",
  "Rellena tu nombre y apellido, tu email y el mensaje.": "Please fill in your full name, your email and your message.",
  "Revisa el email: parece que le falta algo.": "Please check your email address: something seems to be missing.",
  "Enviando…": "Sending…",
  "¡Mensaje enviado! Te contestaremos a tu email lo antes posible.": "Message sent! We'll reply to your email as soon as possible.",
  "Andalucía": "Andalusia",
  "Aragón": "Aragon",
  "Asturias": "Asturias",
  "Islas Baleares": "Balearic Islands",
  "Canarias": "Canary Islands",
  "Cantabria": "Cantabria",
  "Castilla y León": "Castile and León",
  "Castilla-La Mancha": "Castilla-La Mancha",
  "Cataluña": "Catalonia",
  "Comunidad Valenciana": "Valencian Community",
  "Extremadura": "Extremadura",
  "Galicia": "Galicia",
  "Madrid": "Madrid",
  "Murcia": "Murcia",
  "Navarra": "Navarre",
  "País Vasco": "Basque Country",
  "La Rioja": "La Rioja",
  "Internacional": "International",
  "Otros": "Other",
  "Calledoss · Resultados, calendario y ranking del atletismo español": "Calledoss · Spanish athletics results, calendar and rankings",
  "Resultados de cada competición de atletismo en España, con los españoles destacados, calendario de pista, ruta, cross y trail, previas con los inscritos, directo y ranking del año.": "Results from every athletics competition in Spain with the standout Spanish athletes, plus the track, road, cross country and trail calendar, entry previews, live scores and this year's rankings.",
  "Resultados, calendario, previas, directo y ranking del atletismo español.": "Results, calendar, previews, live scores and rankings for Spanish athletics.",
  "Calendario de atletismo 2026 · Calledoss": "2026 athletics calendar · Calledoss",
  "Todas las competiciones de atletismo de 2026 en España y las internacionales con españoles: pista, ruta, cross, trail y marcha.": "Every 2026 athletics competition in Spain, plus international meets with Spanish athletes: track, road, cross country, trail and race walking.",
  "Resultados de atletismo 2026 · Calledoss": "2026 athletics results · Calledoss",
  "Resultados de cada competición de atletismo desde el 1 de enero: podios femenino y masculino y los españoles destacados.": "Results from every athletics competition since 1 January: women's and men's podiums and the standout Spanish athletes.",
  "Atletismo en directo · Calledoss": "Live athletics · Calledoss",
  "Marcador en directo de las competiciones de atletismo de hoy, con horarios y dónde verlas.": "Live scoreboard for today's athletics competitions, with timetables and where to watch them.",
  "Próximas competiciones de atletismo · Calledoss": "Upcoming athletics competitions · Calledoss",
  "Las competiciones de los próximos 7 días con los inscritos españoles destacados de cada prueba.": "Competitions over the next 7 days with the Spanish entrants to watch in each event.",
  "Ranking español de atletismo 2026 · Calledoss": "2026 Spanish athletics rankings · Calledoss",
  "El top 10 español de cada prueba en 2026, aire libre y pista cubierta, con datos oficiales de la RFEA.": "The Spanish top 10 in every event in 2026, outdoor and indoor, with official data from the Spanish Athletics Federation (RFEA).",
  "Contacto · Calledoss": "Contact · Calledoss",
  "Escribe a Calledoss: avisos de competiciones o resultados, propuestas para el pódcast de Calledoss y nuestras redes.": "Get in touch with Calledoss: tip-offs about competitions or results, ideas for the Calledoss podcast, and our social media.",
  "Aceptar": "Accept",
  "Buscar": "Search",
  "CALLEDOSS © 2026 — Atletismo español": "CALLEDOSS © 2026 — Spanish athletics",
  "Calendario": "Calendar",
  "Calledoss en Instagram (se abre en una pestaña nueva)": "Calledoss on Instagram (opens in a new tab)",
  "Calledoss en Spotify (se abre en una pestaña nueva)": "Calledoss on Spotify (opens in a new tab)",
  "Calledoss en TikTok (se abre en una pestaña nueva)": "Calledoss on TikTok (opens in a new tab)",
  "Calledoss en X (Twitter) (se abre en una pestaña nueva)": "Calledoss on X (Twitter) (opens in a new tab)",
  "Calledoss solo usa lo imprescindible para que la web funcione. Si algún día añadimos estadísticas de visitas o publicidad, solo se activarán si tú lo aceptas. Puedes cambiar tu elección cuando quieras.": "Calledoss only uses what is strictly necessary for the website to work. If we ever add visitor analytics or advertising, they will only be switched on if you accept them. You can change your choice at any time.",
  "Cargando…": "Loading…",
  "Competiciones en curso": "Competitions in progress",
  "Competiciones pasadas": "Past competitions",
  "Competición o sede": "Competition or venue",
  "Con desglose completo": "With full breakdown",
  "Configurar": "Settings",
  "Configurar cookies": "Cookie settings",
  "Contacto": "Contact",
  "El atletismo español al día": "Spanish athletics, up to date",
  "El pódcast": "The podcast",
  "El top 10 español de cada prueba con los datos oficiales de la Real Federación Española de Atletismo, separado en temporada de aire libre y de pista cubierta. Se actualiza solo cada día.": "The Spanish top 10 in every event, with official data from the Royal Spanish Athletics Federation (RFEA), split into the outdoor and indoor seasons. Updated automatically every day.",
  "Entérate de los resultados, competiciones y rankings de cada modalidad en Calledoss.": "Results, competitions and rankings for every discipline of Spanish athletics, all in one place.",
  "Enviar mensaje": "Send message",
  "Escríbenos": "Write to us",
  "Estadísticas": "Analytics",
  "Fuentes: RFEA · World Athletics · Ranking Nacional": "Sources: RFEA · World Athletics · Spanish rankings",
  "Guardar mi elección": "Save my choice",
  "Imprescindibles para que la web funcione (por ejemplo, recordar esta elección). Siempre activas.": "Essential for the website to work (for example, to remember this choice). Always on.",
  "Inicio": "Home",
  "Internacionales de la selección": "Spanish national team internationals",
  "Ir a la página principal de Calledoss": "Go to the Calledoss home page",
  "Las competiciones de hoy. Mientras hay pruebas en marcha, los resultados se actualizan solos cada pocos minutos.": "Today's competitions. While events are under way, results update by themselves every few minutes.",
  "Lista de salida oficial completa de una competición: todos los atletas de todos los países, prueba por prueba. Por defecto se muestran todos; puedes filtrar solo España si quieres.": "A competition's full official start list: every athlete from every country, event by event. Everyone is shown by default; you can filter to Spain only if you like.",
  "Lo que puedes ver hoy": "What's on today",
  "Localidad": "Region",
  "Los próximos 7 días y los españoles a seguir.": "The next 7 days and the Spaniards to watch.",
  "Marcador en vivo": "Live scoreboard",
  "Marcador en vivo de las competiciones de hoy.": "Live scoreboard for today's competitions.",
  "Mejores marcas del año": "Best marks of the year",
  "Mensaje": "Message",
  "Mes": "Month",
  "Modalidad": "Discipline",
  "Necesarias": "Necessary",
  "Nombre y apellido": "Full name",
  "Para mostrar anuncios. Ahora mismo no se usan.": "To show ads. Not used at the moment.",
  "Para saber cuántas personas visitan la web y qué secciones se usan. Ahora mismo no se usan.": "To find out how many people visit the website and which sections they use. Not used at the moment.",
  "Podios de cada prueba, femenino y masculino.": "Podiums for every event, women and men.",
  "Política de cookies": "Cookie policy",
  "Próximas": "Upcoming",
  "Próximas competiciones": "Upcoming competitions",
  "Próximos 7 días": "Next 7 days",
  "Publicidad": "Advertising",
  "Ranking": "Rankings",
  "Ranking español": "Spanish rankings",
  "Rechazar": "Reject",
  "Resultados, previas y el pódcast de Calledoss, también en redes.": "Results, previews and the Calledoss podcast, on social media too.",
  "Sexo": "Sex",
  "Síguenos": "Follow us",
  "Temporada": "Season",
  "Temporada 2026": "2026 season",
  "Tipo": "Type",
  "Todas las citas del atletismo español: campeonatos RFEA, ligas de clubes, meetings y pruebas internacionales con presencia española.": "Every date in Spanish athletics: RFEA championships, club leagues, meetings and international events with Spanish athletes.",
  "Todas las citas desde hoy hasta dentro de seis días, con los inscritos españoles destacados de cada prueba en cuanto se publica la lista. Los resultados están en su propia pestaña.": "Every competition from today to six days from now, with the Spanish entrants to watch in each event as soon as the entry list is out. Results have their own tab.",
  "Todas las competiciones del año.": "Every competition this year.",
  "Todas las competiciones ya disputadas esta temporada, desde el 1 de enero hasta hoy. Los resultados se añaden solos en cuanto se publican. Filtra por mes, modalidad y categoría.": "Every competition held this season, from 1 January to today. Results are added automatically as soon as they are published. Filter by month, discipline and category.",
  "Todas las secciones": "All sections",
  "Todos los países": "All countries",
  "Top 10 español, aire libre y pista cubierta.": "Spanish top 10, outdoor and indoor.",
  "Tu privacidad": "Your privacy",
  "Ver próximas →": "See upcoming →",
  "Ver resultados →": "See results →",
  "← Volver al calendario": "← Back to the calendar",
  "¿Falta una competición, ves un resultado mal o quieres proponernos algo para el pódcast? Cuéntanoslo y te contestamos por email.": "Is a competition missing, is a result wrong, or do you have an idea for the podcast? Tell us and we'll reply by email.",
  "¿Qué hay esta semana?": "What's on this week?",
  "Últimos resultados": "Latest results",
  "🇪🇸 Los inscritos españoles destacados se eligen con criterios objetivos: plusmarquistas, campeones de España, líderes del año, internacionales, medallistas y las mejores marcas (del año y personales) de la propia lista.": "🇪🇸 The Spanish entrants to watch are picked using objective criteria: national record holders, Spanish champions, leaders of the year, internationals, medallists and the best marks (season's and personal bests) on the entry list itself.",
  "📡 Resultados automáticos de la Real Federación Española de Atletismo, World Athletics, Diamond League y ADOC, revisados varias veces al día.": "📡 Automatic results from the Royal Spanish Athletics Federation (RFEA), World Athletics, the Diamond League and ADOC, checked several times a day."
 },
 "text": {
  "Pista Aire libre": "Outdoor track",
  "Short Track": "Short track (indoor)",
  "Ruta": "Road",
  "Cross": "Cross country",
  "Trail": "Trail",
  "Marcha": "Race walking",
  "Internacional": "International",
  "Otras": "Other",
  "Pista Cubierta": "Indoor",
  "Trail Running": "Trail running",
  "Track and Field": "Track and field",
  "Absoluto": "Senior",
  "Absoluto/Sub-20": "Senior/U20",
  "Universitario": "University",
  "Combinadas": "Combined events",
  "Añadida a mano": "Added manually",
  "Nivel I": "Level I",
  "Nivel II": "Level II",
  "Nivel III": "Level III",
  "Solo se ha podido leer la clasificación masculina.": "Only the men's standings could be read.",
  "Solo se ha podido leer la clasificación femenina.": "Only the women's standings could be read.",
  "Plusmarquista": "National record holder",
  "Líder español del año": "Spanish leader of the year",
  "Sale con la élite": "Starts in the elite field",
  "Español": "Spanish",
  "Atleta de seguimiento": "On our watch list",
  "Mejor marca del año entre los inscritos": "Best season's mark among the entrants",
  "En la élite (lista oficial de la organización)": "In the elite field (organisers' official list)",
  "En la élite (anunciado por la organización)": "In the elite field (announced by the organisers)",
  "Internacional con España": "Spain international",
  "MMP": "PB",
  "MMT": "SB",
  "Por confirmar": "To be confirmed",
  "Final": "Final",
  "General": "Overall",
  "Rieti (ITA) · Stadio Raul Guidobaldi": "Rieti (ITA) · Stadio Raul Guidobaldi",
  "16–19 julio 2026 · FINALIZADO": "16–19 July 2026 · FINISHED",
  "El mejor Europeo Sub-18 de la historia de España Atletismo: 15 medallas (4 oros) y 24 finalistas, mejorando en una medalla su mejor registro histórico. Primer doblete español de la historia en una misma prueba de este campeonato (400m vallas).": "Spain's best ever European U18 Championships: 15 medals (4 gold) and 24 finalists, one medal more than its previous best. First Spanish one-two in the history of the championships in a single event (400 m hurdles).",
  "🥇 ORO — 50.62": "🥇 GOLD — 50.62",
  "🥈 PLATA — 50.65 (MP)": "🥈 SILVER — 50.65 (PB)",
  "🥈 PLATA — 1:51.81 (récord de España)": "🥈 SILVER — 1:51.81 (Spanish record)",
  "🥉 BRONCE — récord de España Sub-18": "🥉 BRONZE — Spanish U18 record",
  "🥉 BRONCE": "🥉 BRONZE",
  "Lima (PER) · Estadio Atlético de la Videna": "Lima (PER) · Estadio Atlético de la Videna",
  "29–31 mayo 2026 · FINALIZADO": "29–31 May 2026 · FINISHED",
  "España ganó 12 medallas (4 oros, 4 platas, 4 bronces) con 16 atletas — el 75% de la expedición subió al podio y todos acabaron entre los ocho primeros de su prueba.": "Spain won 12 medals (4 gold, 4 silver, 4 bronze) with 16 athletes — 75% of the team reached the podium and all of them finished in the top eight of their event.",
  "Sub-23, 6ª en el Mundial Sub-20 de 2024": "U23, 6th at the 2024 World U20 Championships",
  "🥇 ORO — 4.20 m": "🥇 GOLD — 4.20 m",
  "🥇 ORO — 1:46.30": "🥇 GOLD — 1:46.30",
  "🥇 ORO — 33:45.53": "🥇 GOLD — 33:45.53",
  "🥇 ORO — 5.40 m": "🥇 GOLD — 5.40 m",
  "🥈 PLATA — 5.30 m": "🥈 SILVER — 5.30 m",
  "🥈 PLATA — 1.90 m": "🥈 SILVER — 1.90 m",
  "Primera medalla internacional de su carrera": "First international medal of their career",
  "🥈 PLATA — 7.91 m (2ª mejor marca de su vida)": "🥈 SILVER — 7.91 m (2nd best lifetime mark)",
  "🥉 BRONCE — 45:16.52": "🥉 BRONZE — 45:16.52",
  "🥉 BRONCE — 2.13 m": "🥉 BRONZE — 2.13 m",
  "Primera internacionalidad": "First international call-up",
  "Medalla — 50.61 (color exacto sin confirmar en la fuente)": "Medal — 50.61 (exact colour not confirmed by the source)",
  "Medalla — 17.57 m (color exacto sin confirmar en la fuente)": "Medal — 17.57 m (exact colour not confirmed by the source)",
  "Toruń (POL) · Kujawsko-Pomorska Arena": "Toruń (POL) · Kujawsko-Pomorska Arena",
  "20–22 marzo 2026 · FINALIZADO": "20–22 March 2026 · FINISHED",
  "Resultados oficiales de World Athletics, solo atletas españoles. España ganó 6 medallas: 1 oro, 2 platas y 3 bronces.": "Official World Athletics results, Spanish athletes only. Spain won 6 medals: 1 gold, 2 silver and 3 bronze.",
  "Ronda 1: 6.61 (4º de su serie) · Semifinal: 6.57 (5º de su serie)": "Round 1: 6.61 (4th in heat) · Semi-final: 6.57 (5th in heat)",
  "Eliminado en la semifinal (5º de su serie)": "Eliminated in the semi-final (5th in heat)",
  "Ronda 1: 46.91 (2º de su serie) · Semifinal: 46.65 (4º de su serie)": "Round 1: 46.91 (2nd in heat) · Semi-final: 46.65 (4th in heat)",
  "Eliminado en la semifinal (4º de su serie)": "Eliminated in the semi-final (4th in heat)",
  "Ronda 1: 46.68 (4º de su serie) · Semifinal: 46.72 (4º de su serie)": "Round 1: 46.68 (4th in heat) · Semi-final: 46.72 (4th in heat)",
  "Ronda 1: 1:45.75 (2º de su serie) · Semifinal: 1:44.48 (2º de su serie)": "Round 1: 1:45.75 (2nd in heat) · Semi-final: 1:44.48 (2nd in heat)",
  "Ronda 1: 1:47.30 (5º de su serie)": "Round 1: 1:47.30 (5th in heat)",
  "Eliminado en la ronda 1 (5º de su serie)": "Eliminated in round 1 (5th in heat)",
  "Ronda 1: 3:43.75 (3º de su serie)": "Round 1: 3:43.75 (3rd in heat)",
  "8º en la final": "8th in the final",
  "Ronda 1: 3:38.19 (1º de su serie)": "Round 1: 3:38.19 (1st in heat)",
  "🥇 ORO": "🥇 GOLD",
  "Ronda 1: 52.15 (1ª de su serie) · Semifinal: 51.58 (2ª de su serie)": "Round 1: 52.15 (1st in heat) · Semi-final: 51.58 (2nd in heat)",
  "Ronda 1: 51.86 (2ª de su serie) · Semifinal: 52.19 (3ª de su serie)": "Round 1: 51.86 (2nd in heat) · Semi-final: 52.19 (3rd in heat)",
  "Eliminada en la semifinal (3ª de su serie)": "Eliminated in the semi-final (3rd in heat)",
  "Ronda 1: 2:01.35 (3ª de su serie) · Semifinal: 2:01.14 (5ª de su serie)": "Round 1: 2:01.35 (3rd in heat) · Semi-final: 2:01.14 (5th in heat)",
  "Eliminada en la semifinal (5ª de su serie)": "Eliminated in the semi-final (5th in heat)",
  "Ronda 1: 2:01.35 (4ª de su serie) · Semifinal: 2:00.74 (5ª de su serie)": "Round 1: 2:01.35 (4th in heat) · Semi-final: 2:00.74 (5th in heat)",
  "10º en la final": "10th in the final",
  "Ronda 1: 7.55 (2º de su serie) · Semifinal: 7.46 (2º de su serie)": "Round 1: 7.55 (2nd in heat) · Semi-final: 7.46 (2nd in heat)",
  "🥈 PLATA": "🥈 SILVER",
  "Ronda 1: 7.65 (4º de su serie) · Semifinal: 7.62 (5º de su serie)": "Round 1: 7.65 (4th in heat) · Semi-final: 7.62 (5th in heat)",
  "Ronda 1: 7.18 (2ª de su serie) · Semifinal: 7.27 (8ª de su serie)": "Round 1: 7.18 (2nd in heat) · Semi-final: 7.27 (8th in heat)",
  "Eliminada en la semifinal (8ª de su serie)": "Eliminated in the semi-final (8th in heat)",
  "DQ": "DQ",
  "Descalificada en la final": "Disqualified in the final",
  "Relevo de España": "Spanish relay team",
  "12ª en la final": "12th in the final",
  "Relevo de España · Ronda 1: 3:29.98 (3ª de su serie)": "Spanish relay team · Round 1: 3:29.98 (3rd in heat)",
  "Lausana (SUI) · Stade Olympique de la Pontaise": "Lausanne (SUI) · Stade Olympique de la Pontaise",
  "21 agosto 2026 · PRÓXIMAMENTE": "21 August 2026 · COMING UP",
  "Duodécima cita de la Diamond League 2026. Entry list oficial completa confirmada en lausanne.diamondleague.com: 3 españoles — David Barroso (800 m), Jesús David Delgado (400 m vallas) y Berta Segura (800 m, carrera B). Mohamed Attaoui, mencionado en previas como posible participante, no figura finalmente en la entry list oficial de 800 m. Cartel del 800 m masculino: Marco Arop (Canadá, PB 1:41.20), Emmanuel Wanyonyi (Kenia, PB 1:41.11), Djamel Sedjati (Argelia, PB 1:41.46) y Gabriel Tual (Francia, PB 1:41.61).": "Twelfth meeting of the 2026 Diamond League. Full official entry list confirmed on lausanne.diamondleague.com: 3 Spaniards — David Barroso (800 m), Jesús David Delgado (400 m hurdles) and Berta Segura (800 m, B race). Mohamed Attaoui, mentioned in previews as a possible entrant, is not on the official 800 m entry list in the end. Men's 800 m line-up: Marco Arop (Canada, PB 1:41.20), Emmanuel Wanyonyi (Kenya, PB 1:41.11), Djamel Sedjati (Algeria, PB 1:41.46) and Gabriel Tual (France, PB 1:41.61).",
  "26º del ranking mundial — SB 1:43.60": "26th in the world rankings — SB 1:43.60",
  "20º del ranking mundial — SB 48.11": "20th in the world rankings — SB 48.11",
  "Carrera B — sin marca de temporada registrada en la entry list": "B race — no season's best listed on the entry list",
  "Chorzów (POL) · Stadion Śląski": "Chorzów (POL) · Stadion Śląski",
  "23 agosto 2026 · PRÓXIMAMENTE": "23 August 2026 · COMING UP",
  "Decimotercera cita de la Diamond League 2026, penúltima antes de la final de Bruselas. Entry list oficial confirmada en silesia.diamondleague.com: 3 españoles — Daniel Arce (3.000 m obstáculos), Marta García (5.000 m) y Lorea Ibarzabal (1.500 m).": "Thirteenth meeting of the 2026 Diamond League, the last but one before the Brussels final. Official entry list confirmed on silesia.diamondleague.com: 3 Spaniards — Daniel Arce (3000 m steeplechase), Marta García (5000 m) and Lorea Ibarzabal (1500 m).",
  "10º del ranking mundial — SB 8:11.42, PB 8:08.45": "10th in the world rankings — SB 8:11.42, PB 8:08.45",
  "10ª del ranking mundial — SB 15:39.98, PB 14:33.40": "10th in the world rankings — SB 15:39.98, PB 14:33.40",
  "SB y PB de la temporada: 4:07.28": "Season's best and PB: 4:07.28",
  "Copenhague (DEN)": "Copenhagen (DEN)",
  "19–20 septiembre 2026 · PRÓXIMAMENTE": "19–20 September 2026 · COMING UP",
  "Segunda edición del World Athletics Road Running Championships (la primera fue Riga 2023). El sábado 19 se disputan la milla y los 5.000 m; el domingo 20, la media maratón. Cuatro nombres destacados de la delegación española: Marta García debuta en ruta en los 5.000 m tras su plata en el Europeo de Birmingham; Martín Segurola, campeón de España de 3.000 m en pista cubierta, añade la milla a su repertorio; y Said Mechaal y Marta Galimany encabezan la preselección de media maratón.": "Second edition of the World Athletics Road Running Championships (the first was Riga 2023). The mile and the 5 km are on Saturday 19th; the half marathon on Sunday 20th. Four standout names in the Spanish team: Marta García makes her road debut over 5 km after her silver at the European Championships in Birmingham; Martín Segurola, Spanish indoor 3000 m champion, adds the mile to the repertoire; and Said Mechaal and Marta Galimany lead the half marathon shortlist.",
  "Subcampeona de Europa de 5.000 m en Birmingham 2026 — debut en una prueba de ruta": "European 5000 m silver medallist in Birmingham 2026 — debut in a road race",
  "Campeón de España de 3.000 m en pista cubierta, bronce por equipos en el Europeo de Campo a Través": "Spanish indoor 3000 m champion, team bronze at the European Cross Country Championships",
  "Preseleccionada el 16 de junio junto a Carla Gallardo": "Shortlisted on 16 June along with Carla Gallardo",
  "Preseleccionado el 16 de junio para la media maratón": "Shortlisted on 16 June for the half marathon",
  "Tarento (ITA)": "Taranto (ITA)",
  "30 agosto–3 septiembre 2026 · PRÓXIMAMENTE": "30 August–3 September 2026 · COMING UP",
  "Convocatoria oficial completa de atletismo publicada por España Atletismo (gráfico oficial), dentro de la delegación total española de 247 deportistas (132 hombres, 115 mujeres) en 29 deportes confirmada por el Comité Olímpico Español.": "Full official athletics squad published by the Spanish Athletics Federation (official graphic), part of the total Spanish delegation of 247 athletes (132 men, 115 women) in 29 sports confirmed by the Spanish Olympic Committee.",
  "Líder español del año, plusmarquista de 4x100m mixto": "Spanish leader of the year, mixed 4x100 m national record holder",
  "Rebajó su marca personal en más de dos segundos esta temporada": "Personal best improved by more than two seconds this season",
  "Campeón de España, campeón mundial universitario": "Spanish champion, world university champion",
  "Recientemente preseleccionado tras el Nacional de Málaga": "Recently shortlisted after the national championships in Málaga",
  "Semifinalista Europeo Sub-23 Bergen 2025": "European U23 semi-finalist, Bergen 2025",
  "Plusmarquista nacional, 3ª marca europea del año": "National record holder, 3rd best European mark of the year",
  "4º marquista histórico español": "4th best Spanish performer of all time",
  "Campeón de España, líder del año": "Spanish champion, leader of the year",
  "Campeona de España en Short Track, 4ª en el Iberoamericano de Lima": "Spanish short track champion, 4th at the Ibero-American Championships in Lima",
  "2ª mejor Sub-23 de la historia, récord de España de relevos 4x400m": "2nd best U23 in history, Spanish 4x400 m relay record",
  "Olímpica, 6 veces campeona de España": "Olympian, 6-time Spanish champion",
  "5 veces campeona de España, plata en el Europeo de Birmingham": "5-time Spanish champion, silver at the European Championships in Birmingham",
  "Finalista mundial Sub-20 en 2022, bronce nacional 2025": "World U20 finalist in 2022, national bronze 2025",
  "Subcampeona de España 2025, líder española del año — récord de España Sub-20": "Spanish runner-up 2025, Spanish leader of the year — Spanish U20 record",
  "3ª marca española histórica": "3rd best Spanish mark of all time",
  "Bronce en Málaga — debut absoluto": "Bronze in Málaga — senior debut",
  "Plusmarquista nacional": "National record holder",
  "19 años — campeona de España, récord Sub-23": "19 years old — Spanish champion, U23 record",
  "Campeona de España, finalista olímpica en París": "Spanish champion, Olympic finalist in Paris",
  "Eugene (USA) · Hayward Field": "Eugene (USA) · Hayward Field",
  "5–9 agosto 2026 · FINALIZADO": "5–9 August 2026 · FINISHED",
  "España cerró el Mundial Sub-20 con 4 medallas (1 oro, 3 bronces) y 11 finalistas — iguala el récord histórico de medallas en un Mundial Sub-20 (Sudbury 1988) y logra la 13ª posición en el medallero global, la mejor desde 1996. Convocatoria oficial completa: 47 atletas (27 hombres, 20 mujeres) — segunda expedición más numerosa en las 20 ediciones del campeonato, solo por detrás de Barcelona 2012 (54). Publicada por RFEA el 04/08/2026.": "Spain finished the World U20 Championships with 4 medals (1 gold, 3 bronze) and 11 finalists — equalling its record medal haul at a World U20 Championships (Sudbury 1988) and placing 13th in the overall medal table, its best since 1996. Full official squad: 47 athletes (27 men, 20 women) — the second largest team in the 20 editions of the championships, behind only Barcelona 2012 (54). Published by the RFEA on 04/08/2026.",
  "Campeona de España — 6ª de todos los tiempos": "Spanish champion — 6th of all time",
  "Eliminada en Ronda 1 — 11.68 (no pasa a semifinales)": "Eliminated in round 1 — 11.68 (did not reach the semi-finals)",
  "Récord de España Sub-20 (18/06/2026)": "Spanish U20 record (18/06/2026)",
  "Eliminada en Ronda 1 — 11.72 (no pasa a semifinales)": "Eliminated in round 1 — 11.72 (did not reach the semi-finals)",
  "3ª española de todos los tiempos": "3rd Spanish athlete of all time",
  "Campeona de España — 3ª de todos los tiempos": "Spanish champion — 3rd of all time",
  "Doblete — plusmarca nacional Short Track": "Double — national short track record",
  "19ª — 16:31.98 (final disputada 5 ago)": "19th — 16:31.98 (final held on 5 Aug)",
  "Campeona de España — debut con España Atletismo": "Spanish champion — debut for the Spanish team",
  "🥉 BRONCE — 1.90 m (iguala el récord de España Sub-20)": "🥉 BRONZE — 1.90 m (equals the Spanish U20 record)",
  "Campeona de España — líder ránking absoluto": "Spanish champion — senior ranking leader",
  "5ª — 13.34 m (nueva plusmarca personal)": "5th — 13.34 m (new personal best)",
  "San Juan Aznalfarache — 4ª de todos los tiempos": "San Juan Aznalfarache — 4th of all time",
  "🥉 BRONCE — 13.58 m (mejor marca de la temporada)": "🥉 BRONZE — 13.58 m (season's best)",
  "Campeona de Europa Sub-20 vigente": "Reigning European U20 champion",
  "Campeona de España": "Spanish champion",
  "Subcampeona de España": "Spanish runner-up",
  "Récord nacional Sub-20 (Villafranca)": "National U20 record (Villafranca)",
  "Subcampeona de España 200 m": "Spanish 200 m runner-up",
  "Campeona de España 400 m — 6ª de todos los tiempos": "Spanish 400 m champion — 6th of all time",
  "10ª de todos los tiempos": "10th of all time",
  "Campeón de España — 7º de todos los tiempos": "Spanish champion — 7th of all time",
  "🥉 BRONCE — 1:46.25 en la final (primer podio español Sub-20 en 800 m en 24 años)": "🥉 BRONZE — 1:46.25 in the final (first Spanish U20 podium in the 800 m in 24 years)",
  "Subcampeón de España": "Spanish runner-up",
  "Clasificado a la FINAL — 3º en semifinal, 1:49.08": "Qualified for the FINAL — 3rd in the semi-final, 1:49.08",
  "Campeón de España — récord de España 1000m ST y Milla ST": "Spanish champion — Spanish short track 1000 m and mile record",
  "6º de todos los tiempos — 14º en Europeo Sub-20 Tampere": "6th of all time — 14th at the European U20 Championships in Tampere",
  "Final disputada — 7:58.95 (baja de 8:00 por primera vez, 6ª marca española histórica)": "Final completed — 7:58.95 (under 8:00 for the first time, 6th best Spanish mark ever)",
  "Campeón de España — top-10 histórico": "Spanish champion — all-time top 10",
  "Campeón de España — 2º de todos los tiempos": "Spanish champion — 2nd of all time",
  "Semifinalista — ganó su serie de 1ª ronda con 50.77 y fue 6º de su semifinal con 50.95 (sin final)": "Semi-finalist — won a first-round heat in 50.77 and was 6th in the semi-final in 50.95 (no final)",
  "Subcampeón — 6º de todos los tiempos": "Runner-up — 6th of all time",
  "Clasificado a semifinales desde la 1ª ronda (doblete español en semis)": "Qualified for the semi-finals from round 1 (two Spaniards in the semis)",
  "Récord de España y de Europa Sub-20": "Spanish and European U20 record",
  "🥇 ORO — 8:28.35 (nuevo récord de Europa Sub-20)": "🥇 GOLD — 8:28.35 (new European U20 record)",
  "Campeón de Europa Sub-20 vigente — 3º de todos los tiempos": "Reigning European U20 champion — 3rd of all time",
  "Campeón de España": "Spanish champion",
  "2.16 m (MP, Albacete 19/07)": "2.16 m (PB, Albacete 19/07)",
  "Sin resultado oficial confirmado en Eugene — oro para Younes Ayachi (ALG, 2.21 m)": "No official result confirmed in Eugene — gold for Younes Ayachi (ALG, 2.21 m)",
  "Subcampeón — oro Iberoamericano Sub-20 Lima": "Runner-up — Ibero-American U20 gold in Lima",
  "Sin resultado oficial confirmado en la altura de Eugene": "No official result confirmed in the Eugene high jump",
  "Campeón de España — 9º de todos los tiempos": "Spanish champion — 9th of all time",
  "Campeón de España — 8º de todos los tiempos": "Spanish champion — 8th of all time",
  "10º de todos los tiempos": "10th of all time",
  "Subcampeón de España — bronce FOJE 2025": "Spanish runner-up — EYOF 2025 bronze",
  "Campeón de España 400 m — 9º de todos los tiempos": "Spanish 400 m champion — 9th of all time",
  "2º del ránking nacional": "2nd in the national rankings",
  "Subcampeón de España 400 m": "Spanish 400 m runner-up",
  "3º en Albacete": "3rd in Albacete",
  "4º en Albacete": "4th in Albacete",
  "Subcampeón de España 100 m": "Spanish 100 m runner-up",
  "Campeón de España 200 m": "Spanish 200 m champion",
  "Clasificados a la final (3ª de su serie, 3:21.90)": "Qualified for the final (3rd in heat, 3:21.90)",
  "Birmingham (GBR) · Alexander Stadium": "Birmingham (GBR) · Alexander Stadium",
  "10–16 agosto 2026 · FINALIZADO": "10–16 August 2026 · FINISHED",
  "España cerró el campeonato con 8 medallas (2 oros, 2 platas, 4 bronces) — su mejor cosecha reciente. Convocatoria: 94 atletas (48 mujeres, 46 hombres), la mayor expedición de la historia, por delante de Berlín 2018 (92). Capitanes: Miguel Ángel López y Maribel Pérez.": "Spain finished the championships with 8 medals (2 gold, 2 silver, 4 bronze) — its best haul in recent years. Squad: 94 athletes (48 women, 46 men), the largest team in its history, ahead of Berlin 2018 (92). Captains: Miguel Ángel López and Maribel Pérez.",
  "Campeona de España — capitana del equipo": "Spanish champion — team captain",
  "Plusmarquista nacional, 7 veces campeona de España": "National record holder, 7-time Spanish champion",
  "7ª en la final — 22.69": "7th in the final — 22.69",
  "Bronce en Málaga": "Bronze in Málaga",
  "Campeona de España, 2ª marquista histórica": "Spanish champion, 2nd best Spanish performer of all time",
  "Bronce Europeo indoor 2025": "European indoor bronze 2025",
  "2ª mejor Sub-23 de la historia": "2nd best U23 in history",
  "Campeona de España Sub-23": "Spanish U23 champion",
  "5 veces campeona de España, bronce europeo": "5-time Spanish champion, European bronze",
  "🥈 PLATA — 1ª medalla española del campeonato": "🥈 SILVER — Spain's 1st medal of the championships",
  "Subcampeona de España en Málaga": "Spanish runner-up in Málaga",
  "Campeona de Europa Sub-23 de cross": "European U23 cross country champion",
  "Récord de España de 10 km en ruta": "Spanish 10 km road record",
  "Doble prueba": "Double event",
  "4ª en la final — 31:59.84 (récord personal)": "4th in the final — 31:59.84 (personal best)",
  "Campeona de Europa de maratón vigente": "Reigning European marathon champion",
  "8ª (debut internacional) — 2h28:07": "8th (international debut) — 2h28:07",
  "Campeona de España — debut absoluto": "Spanish champion — senior debut",
  "Plusmarquista nacional, 6 veces campeona de España": "National record holder, 6-time Spanish champion",
  "3 veces campeona de España": "3-time Spanish champion",
  "Campeona de España, finalista en Roma 2024": "Spanish champion, finalist in Rome 2024",
  "6ª en la final — 6.80 m (mejor resultado de su carrera al aire libre)": "6th in the final — 6.80 m (best outdoor result of her career)",
  "Líder española del año": "Spanish leader of the year",
  "7 veces campeona de España, récord nacional": "7-time Spanish champion, national record",
  "2ª mejor marca española histórica": "2nd best Spanish mark of all time",
  "9ª en la final — 57.06 m (59.85 m en clasificación)": "9th in the final — 57.06 m (59.85 m in qualifying)",
  "Campeona de España, olímpica, récord de España": "Spanish champion, Olympian, Spanish record",
  "6304 pts": "6304 pts",
  "8ª — 6372 pts, NUEVO RÉCORD DE ESPAÑA (superó su propia plusmarca en 68 puntos)": "8th — 6372 pts, NEW SPANISH RECORD (beat her own record by 68 points)",
  "Líder española del año, campeona NCAA": "Spanish leader of the year, NCAA champion",
  "6182 pts": "6182 pts",
  "15ª — 5999 pts": "15th — 5999 pts",
  "4ª en la final — 3:24.39 (mejor marca histórica de España en la prueba)": "4th in the final — 3:24.39 (best ever Spanish mark in the event)",
  "Récord de España de relevos (3:21.25)": "Spanish relay record (3:21.25)",
  "Campeona olímpica y doble campeona del mundo": "Olympic champion and two-time world champion",
  "Líder español del año, 2ª marca histórica": "Spanish leader of the year, 2nd best mark of all time",
  "Campeón de España en Málaga": "Spanish champion in Málaga",
  "Subcampeón nacional — debut individual": "National runner-up — individual debut",
  "Sensación de la temporada": "Breakthrough of the season",
  "Plusmarquista español, subcampeón europeo Roma": "Spanish record holder, European silver medallist in Rome",
  "🥉 BRONCE — 1:45.71": "🥉 BRONZE — 1:45.71",
  "4º en la final — 1:45.75 (a 4 centésimas del podio)": "4th in the final — 1:45.75 (4 hundredths off the podium)",
  "Olímpico en Tokio": "Olympian in Tokyo",
  "Campeón de España, campeón de Europa indoor 2023": "Spanish champion, European indoor champion 2023",
  "Medallista europeo 800m 2022, mundial short track 2026": "European 800 m medallist 2022, world short track 2026",
  "5º de Europa de 10km en ruta 2025": "5th at the 2025 European 10 km road championships",
  "Olímpico": "Olympian",
  "Subcampeón de Europa vigente, subcampeón del mundo indoor": "Reigning European silver medallist, world indoor silver medallist",
  "Líder del año, campeón de Europa 2022": "Leader of the year, European champion 2022",
  "3ª marca europea del año": "3rd best European mark of the year",
  "6º en la final": "6th in the final",
  "Subcampeón iberoamericano": "Ibero-American silver medallist",
  "Líder español, 4 veces campeón de España, bronce europeo": "Spanish leader, 4-time Spanish champion, European bronze",
  "4º en la final — se le escapó el podio en el último paso por la ría": "4th in the final — missed the podium on the last water jump",
  "Campeón del mundo universitario 2025": "World university champion 2025",
  "6º en la final — 8:29.15": "6th in the final — 8:29.15",
  "Campeón de España absoluto": "Spanish senior champion",
  "Líder español, bronce europeo Apeldoorn 2025": "Spanish leader, European bronze Apeldoorn 2025",
  "Iguala récord de presencias en Europeos (7)": "Equals the record for appearances at European Championships (7)",
  "🥉 BRONCE (4x100 mixto) — 40.42, primera medalla histórica de España en un relevo": "🥉 BRONZE (mixed 4x100) — 40.42, Spain's first ever relay medal",
  "Récord de España de relevos (3:00.26)": "Spanish relay record (3:00.26)",
  "Subcampeón de Europa vigente en 20km marcha": "Reigning European 20 km race walk silver medallist",
  "Campeón mundial, doble campeón de Europa — capitán": "World champion, two-time European champion — captain",
  "Ronda 1: mié 5 ago (DISPUTADA) — ambas eliminadas, no hay semifinal ni final para España en esta prueba": "Round 1: Wed 5 Aug (COMPLETED) — both eliminated, no semi-final or final for Spain in this event",
  "Ronda 1: vie 7 ago, 21:25 → Semifinal: sáb 8 ago, 03:55 (madrugada) → Final: dom 9 ago, 05:50 (madrugada)": "Round 1: Fri 7 Aug, 21:25 → Semi-final: Sat 8 Aug, 03:55 (early hours) → Final: Sun 9 Aug, 05:50 (early hours)",
  "Ronda 1: vie 7 ago, 04:05 (madrugada) → Final: dom 9 ago, 22:52": "Round 1: Fri 7 Aug, 04:05 (early hours) → Final: Sun 9 Aug, 22:52",
  "Final directa: dom 9 ago, 04:53 (madrugada)": "Straight final: Sun 9 Aug, 04:53 (early hours)",
  "Final directa: mié 5 ago, 04:53 (madrugada) — DISPUTADA": "Straight final: Wed 5 Aug, 04:53 (early hours) — COMPLETED",
  "Ronda 1: vie 7 ago, 19:30 → Semifinal: sáb 8 ago, 02:15 (madrugada) → Final: dom 9 ago, 04:33 (madrugada)": "Round 1: Fri 7 Aug, 19:30 → Semi-final: Sat 8 Aug, 02:15 (early hours) → Final: Sun 9 Aug, 04:33 (early hours)",
  "Clasificación: vie 7 ago, 20:05 → Final: dom 9 ago, 21:30": "Qualifying: Fri 7 Aug, 20:05 → Final: Sun 9 Aug, 21:30",
  "Clasificación: sáb 8 ago, 18:35 → Final: dom 9 ago, 22:14": "Qualifying: Sat 8 Aug, 18:35 → Final: Sun 9 Aug, 22:14",
  "Clasificación: jue 6 ago, 19:00 (esta noche) → Final: jue 6 ago→vie 7, 04:40 (madrugada)": "Qualifying: Thu 6 Aug, 19:00 (tonight) → Final: Thu 6 Aug→Fri 7, 04:40 (early hours)",
  "Clasificación: mié 5 ago, 21:00 (disputada) → Final: jue 6 ago→vie 7, 03:00 (madrugada)": "Qualifying: Wed 5 Aug, 21:00 (completed) → Final: Thu 6 Aug→Fri 7, 03:00 (early hours)",
  "Final directa: sáb 8 ago, 18:30": "Straight final: Sat 8 Aug, 18:30",
  "Ronda 1: sáb 8 ago, 20:55 → Final: dom 9 ago, 22:05": "Round 1: Sat 8 Aug, 20:55 → Final: Sun 9 Aug, 22:05",
  "Ronda 1: sáb 8 ago, 19:45 → Final: dom 9 ago, 23:42": "Round 1: Sat 8 Aug, 19:45 → Final: Sun 9 Aug, 23:42",
  "Ronda 1: mié 5 ago, 21:43 (DISPUTADA) → Semifinal: vie 7 ago, 03:30 (madrugada) → Final: sáb 8 ago→dom 9, 04:08 (madrugada)": "Round 1: Wed 5 Aug, 21:43 (COMPLETED) → Semi-final: Fri 7 Aug, 03:30 (early hours) → Final: Sat 8 Aug→Sun 9, 04:08 (early hours)",
  "Ronda 1: vie 7 ago, 03:32 (madrugada, esta noche) → Final: dom 9 ago, 23:25": "Round 1: Fri 7 Aug, 03:32 (early hours, tonight) → Final: Sun 9 Aug, 23:25",
  "Final directa: sáb 8 ago, 05:25 (madrugada)": "Straight final: Sat 8 Aug, 05:25 (early hours)",
  "Ronda 1: vie 7 ago, 20:30 → Semifinal: sáb 8 ago, 02:40 (madrugada) → Final: dom 9 ago, 04:43 (madrugada)": "Round 1: Fri 7 Aug, 20:30 → Semi-final: Sat 8 Aug, 02:40 (early hours) → Final: Sun 9 Aug, 04:43 (early hours)",
  "Ronda 1: jue 6 ago, 20:27 (esta noche) → Semifinal: dom 9 ago, 03:41 (madrugada) → Final: dom 9 ago, 22:40": "Round 1: Thu 6 Aug, 20:27 (tonight) → Semi-final: Sun 9 Aug, 03:41 (early hours) → Final: Sun 9 Aug, 22:40",
  "Ronda 1: jue 6 ago, 19:05 (esta noche) → Final: vie 7 ago→sáb 8, 04:42 (madrugada)": "Round 1: Thu 6 Aug, 19:05 (tonight) → Final: Fri 7 Aug→Sat 8, 04:42 (early hours)",
  "Clasificación: jue 6 ago, 20:05 (esta noche) → Final: sáb 8 ago→dom 9, 03:10 (madrugada)": "Qualifying: Thu 6 Aug, 20:05 (tonight) → Final: Sat 8 Aug→Sun 9, 03:10 (early hours)",
  "Clasificación: jue 6 ago, 21:05 (esta noche) → Final: dom 9 ago, 21:15": "Qualifying: Thu 6 Aug, 21:05 (tonight) → Final: Sun 9 Aug, 21:15",
  "Clasificación: vie 7 ago, 21:43 → Final: sáb 8 ago→dom 9, 04:25 (madrugada)": "Qualifying: Fri 7 Aug, 21:43 → Final: Sat 8 Aug→Sun 9, 04:25 (early hours)",
  "Clasificación: jue 6 ago, 21:00 (esta noche) → Final: vie 7 ago→sáb 8, 03:25 (madrugada)": "Qualifying: Thu 6 Aug, 21:00 (tonight) → Final: Fri 7 Aug→Sat 8, 03:25 (early hours)",
  "Clasificación: mié 5 ago, 19:45 (disputada) → Final: vie 7 ago→sáb 8, 02:05 (madrugada)": "Qualifying: Wed 5 Aug, 19:45 (completed) → Final: Fri 7 Aug→Sat 8, 02:05 (early hours)",
  "Final directa: sáb 8 ago, 19:10": "Straight final: Sat 8 Aug, 19:10",
  "Ronda 1: sáb 8 ago, 20:20 → Final: dom 9 ago, 23:55": "Round 1: Sat 8 Aug, 20:20 → Final: Sun 9 Aug, 23:55",
  "Ronda 1: jue 6 ago, 21:27 (esta noche) → Final: sáb 8 ago→dom 9, 03:05 (madrugada)": "Round 1: Thu 6 Aug, 21:27 (tonight) → Final: Sat 8 Aug→Sun 9, 03:05 (early hours)",
  "Ronda 1: mié 5 ago, 19:22 (DISPUTADA) → Final: mié 5→jue 6, 05:50 (madrugada) — DISPUTADA": "Round 1: Wed 5 Aug, 19:22 (COMPLETED) → Final: Wed 5→Thu 6, 05:50 (early hours) — COMPLETED",
  "Final: lun 10 ago, 22:50": "Final: Mon 10 Aug, 22:50",
  "Final: jue 13 ago, 22:50": "Final: Thu 13 Aug, 22:50",
  "Final: sáb 15 ago, 21:10": "Final: Sat 15 Aug, 21:10",
  "Final: vie 14 ago, 22:46": "Final: Fri 14 Aug, 22:46",
  "Final: mar 11 ago, 20:25": "Final: Tue 11 Aug, 20:25",
  "Final: vie 14 ago, 20:45": "Final: Fri 14 Aug, 20:45",
  "dom 16 ago, 08:30": "Sun 16 Aug, 08:30",
  "Final: mar 11 ago, 22:30": "Final: Tue 11 Aug, 22:30",
  "Final: mié 12 ago, 22:08": "Final: Wed 12 Aug, 22:08",
  "Final: jue 13 ago, 21:29": "Final: Thu 13 Aug, 21:29",
  "Final: sáb 15 ago, 21:07": "Final: Sat 15 Aug, 21:07",
  "Final: jue 13 ago, 20:50": "Final: Thu 13 Aug, 20:50",
  "Final: dom 16 ago, 21:05": "Final: Sun 16 Aug, 21:05",
  "Final: lun 10 ago, 20:03": "Final: Mon 10 Aug, 20:03",
  "Final: vie 14 ago, 21:30": "Final: Fri 14 Aug, 21:30",
  "Final: mié 12 ago, 20:45": "Final: Wed 12 Aug, 20:45",
  "Final: dom 16 ago, 20:30": "Final: Sun 16 Aug, 20:30",
  "Final (800m): sáb 15 ago, 20:45": "Final (800 m): Sat 15 Aug, 20:45",
  "Final: sáb 15 ago, 22:48": "Final: Sat 15 Aug, 22:48",
  "Final: dom 16 ago, 22:33": "Final: Sun 16 Aug, 22:33",
  "sáb 15 ago, 08:35": "Sat 15 Aug, 08:35",
  "sáb 15 ago, 08:50": "Sat 15 Aug, 08:50",
  "Final: mar 11 ago, 22:47": "Final: Tue 11 Aug, 22:47",
  "Final: vie 14 ago, 22:25": "Final: Fri 14 Aug, 22:25",
  "Final: mié 12 ago, 21:50": "Final: Wed 12 Aug, 21:50",
  "Final: jue 13 ago, 22:28": "Final: Thu 13 Aug, 22:28",
  "Final: sáb 15 ago, 22:07": "Final: Sat 15 Aug, 22:07",
  "Final: sáb 15 ago, 21:25": "Final: Sat 15 Aug, 21:25",
  "dom 16 ago, 09:10": "Sun 16 Aug, 09:10",
  "Final: mié 12 ago, 22:47": "Final: Wed 12 Aug, 22:47",
  "Final: vie 14 ago, 21:40": "Final: Fri 14 Aug, 21:40",
  "Final: dom 16 ago, 21:50": "Final: Sun 16 Aug, 21:50",
  "Final: mar 11 ago, 21:16": "Final: Tue 11 Aug, 21:16",
  "Final: jue 13 ago, 21:45": "Final: Thu 13 Aug, 21:45",
  "Final: sáb 15 ago, 21:01": "Final: Sat 15 Aug, 21:01",
  "Final: sáb 15 ago, 22:33": "Final: Sat 15 Aug, 22:33",
  "Final: dom 16 ago, 22:48": "Final: Sun 16 Aug, 22:48",
  "sáb 15 ago, 08:30": "Sat 15 Aug, 08:30",
  "sáb 15 ago, 08:45": "Sat 15 Aug, 08:45",
  "World Athletics+ (streaming gratuito internacional)": "World Athletics+ (free international streaming)",
  "Retransmisión oficial por los canales de World Athletics. RFEA publica resultados y noticias en directo en atletismorfea.es/atletismo-plus.": "Official coverage on World Athletics' channels. The RFEA publishes live results and news at atletismorfea.es/atletismo-plus.",
  "RTVE: Teledeporte y RTVE Play (España)": "RTVE: Teledeporte and RTVE Play (Spain)",
  "Retransmisión en abierto confirmada por RTVE. A nivel internacional, streaming oficial de European Athletics.": "Free-to-air coverage confirmed by RTVE. Internationally, official streaming from European Athletics.",
  "Movistar Plus+: Vamos y Vamos 2 (España)": "Movistar Plus+: Vamos and Vamos 2 (Spain)",
  "Confirmado en diamondleague.com. A nivel internacional también en el canal de YouTube y Facebook de Wanda Diamond League.": "Confirmed on diamondleague.com. Internationally, also on the Wanda Diamond League YouTube channel and Facebook page.",
  "No hay streaming": "No streaming"
 },
 "rules": [
  [
   "(\\d),(\\d)",
   "$1.$2"
  ],
  [
   "(?<![\\d.])(\\d)\\.(\\d{3})(?=\\s?(?:m|metros|mts)»)",
   "$1$2"
  ],
  [
   "(?<![\\d.])(\\d{2,3})\\.(\\d{3})(?=\\s?(?:m|metros|mts)»)",
   "$1,$2"
  ],
  [
   "«Clasificación por marcas \\(series\\)",
   "Ranking across heats"
  ],
  [
   "«Clasificación general»",
   "Overall standings"
  ],
  [
   "«Clasificación»",
   "Standings"
  ],
  [
   "«General»",
   "Overall"
  ],
  [
   "«Final directa»",
   "Straight final"
  ],
  [
   "«Semifinal(?:es)?»",
   "Semi-final"
  ],
  [
   "«Ronda»",
   "Round"
  ],
  [
   "«series»",
   "heats"
  ],
  [
   "«serie»",
   "heat"
  ],
  [
   "«Salto con pértiga»",
   "Pole Vault",
   1
  ],
  [
   "«Salto de altura»",
   "High Jump",
   1
  ],
  [
   "«Salto de longitud»",
   "Long Jump",
   1
  ],
  [
   "«Triple salto»",
   "Triple Jump",
   1
  ],
  [
   "«Lanzamiento de peso»",
   "Shot Put",
   1
  ],
  [
   "«Lanzamiento de disco»",
   "Discus Throw",
   1
  ],
  [
   "«Lanzamiento de martillo»",
   "Hammer Throw",
   1
  ],
  [
   "«Lanzamiento de jabalina»",
   "Javelin Throw",
   1
  ],
  [
   "«Martillo pesado»",
   "Weight Throw",
   1
  ],
  [
   "«Pértiga»",
   "Pole Vault",
   1
  ],
  [
   "«Perxa»",
   "Pole Vault",
   1
  ],
  [
   "«Altura»",
   "High Jump",
   1
  ],
  [
   "«Alçada»",
   "High Jump",
   1
  ],
  [
   "«Longitud»",
   "Long Jump",
   1
  ],
  [
   "«Llargada»",
   "Long Jump",
   1
  ],
  [
   "«Triple»(?! Jump)",
   "Triple Jump",
   1
  ],
  [
   "«Peso»",
   "Shot Put",
   1
  ],
  [
   "«Pes»",
   "Shot Put",
   1
  ],
  [
   "«Disco»",
   "Discus",
   1
  ],
  [
   "«Disc»",
   "Discus",
   1
  ],
  [
   "«Martillo»",
   "Hammer",
   1
  ],
  [
   "«Martell»",
   "Hammer",
   1
  ],
  [
   "«Jabalina»",
   "Javelin",
   1
  ],
  [
   "«Javelina»",
   "Javelin",
   1
  ],
  [
   "«Media maratón»",
   "Half Marathon",
   1
  ],
  [
   "«Medio maratón»",
   "Half Marathon",
   1
  ],
  [
   "«Mitja marató»",
   "Half Marathon",
   1
  ],
  [
   "«Maratón»",
   "Marathon",
   1
  ],
  [
   "«Marató»",
   "Marathon",
   1
  ],
  [
   "«vallas»",
   "hurdles"
  ],
  [
   "«tanques»",
   "hurdles"
  ],
  [
   "«obstáculos»",
   "steeplechase"
  ],
  [
   "«Obst\\.",
   "steeplechase"
  ],
  [
   "«Marcha»",
   "Race Walk",
   1
  ],
  [
   "«Marxa»",
   "Race Walk",
   1
  ],
  [
   "«Pista Aire libre»",
   "Outdoor track"
  ],
  [
   "«Aire libre»",
   "outdoor"
  ],
  [
   "«Pista cubierta»",
   "indoor"
  ],
  [
   "«pista»",
   "track",
   1
  ],
  [
   "«en ruta»",
   "road",
   1
  ],
  [
   "«ruta»",
   "road",
   1
  ],
  [
   "«Relevos»",
   "Relay",
   1
  ],
  [
   "«Relevo»",
   "Relay",
   1
  ],
  [
   "«Relleus»",
   "Relay",
   1
  ],
  [
   "«Decatlón»",
   "Decathlon"
  ],
  [
   "«Decathlón»",
   "Decathlon"
  ],
  [
   "«Heptatlón»",
   "Heptathlon"
  ],
  [
   "«Heptathlón»",
   "Heptathlon"
  ],
  [
   "«Pentatlón»",
   "Pentathlon"
  ],
  [
   "«Pruebas combinadas»",
   "Combined Events"
  ],
  [
   "«Combinadas»",
   "Combined Events"
  ],
  [
   "«Proves combinades»",
   "Combined Events"
  ],
  [
   "«Carrera»",
   "Race",
   1
  ],
  [
   "«Cursa»",
   "Race",
   1
  ],
  [
   "«Milla»",
   "Mile",
   1
  ],
  [
   "«Absolut[oa]s?»",
   "Senior"
  ],
  [
   "«Absolut»",
   "Senior"
  ],
  [
   "«Adaptad[oa]»",
   "Para"
  ],
  [
   "«Promoción»",
   "Development",
   1
  ],
  [
   "«Veteran[oa]s»",
   "Masters"
  ],
  [
   "«Master»",
   "Masters"
  ],
  [
   "«Sub[\\s-]?(\\d{1,2})»",
   "U$1"
  ],
  [
   "«PC»",
   "Indoor"
  ],
  [
   "«Inscripción»",
   "Entry",
   1
  ],
  [
   "«élite»",
   "Elite"
  ],
  [
   "«Fem»",
   "Women"
  ],
  [
   "«Masc»",
   "Men"
  ],
  [
   "«metros planos»",
   "m"
  ],
  [
   "«metros»",
   "m"
  ],
  [
   "«Prueba»",
   "Event"
  ],
  [
   "«Triplo salto»",
   "Triple Jump"
  ],
  [
   "«Mulleres»",
   "Women"
  ],
  [
   "«Homes»",
   "Men"
  ],
  [
   "«Feminina»",
   "Women"
  ],
  [
   "«Hombres»",
   "Men"
  ],
  [
   "«Hombre»",
   "Men"
  ],
  [
   "«Mujeres»",
   "Women"
  ],
  [
   "«Mujer»",
   "Women"
  ],
  [
   "«Masculin[oa]s?»",
   "Men"
  ],
  [
   "«Femenin[oa]s?»",
   "Women"
  ],
  [
   "«Masculí»",
   "Men"
  ],
  [
   "«Femení»",
   "Women"
  ],
  [
   "«Varones»",
   "Men"
  ],
  [
   "«Damas»",
   "Women"
  ],
  [
   "«Mixt[oa]s?»",
   "Mixed"
  ],
  [
   "«Internacional»",
   "International"
  ],
  [
   "«y»",
   "and",
   1
  ]
 ],
 "reasons": [
  [
   "^Dorsal de élite nº (.+)$",
   "Elite bib no. $1"
  ],
  [
   "^1ª mejor marca del año de la lista \\((.+)\\)$",
   "Best season's mark on the entry list ($1)"
  ],
  [
   "^2ª mejor marca del año de la lista \\((.+)\\)$",
   "2nd best season's mark on the entry list ($1)"
  ],
  [
   "^3ª mejor marca del año de la lista \\((.+)\\)$",
   "3rd best season's mark on the entry list ($1)"
  ],
  [
   "^1ª mejor marca personal de la lista \\((.+)\\)$",
   "Best personal best on the entry list ($1)"
  ],
  [
   "^2ª mejor marca personal de la lista \\((.+)\\)$",
   "2nd best personal best on the entry list ($1)"
  ],
  [
   "^3ª mejor marca personal de la lista \\((.+)\\)$",
   "3rd best personal best on the entry list ($1)"
  ],
  [
   "^Campe(?:ón|ona) de España (\\d{4}) de (.+)$",
   "Spanish champion $1, ⟦$2⟧"
  ],
  [
   "^Campe(?:ón|ona) de España (.+?) (\\d{4}) de (.+)$",
   "Spanish ⟦$1⟧ champion $2, ⟦$3⟧"
  ],
  [
   "^Campe(?:ón|ona) de España de (.+)$",
   "Spanish champion, ⟦$1⟧"
  ],
  [
   "^Campe(?:ón|ona) de España (.+?) de (.+)$",
   "Spanish ⟦$1⟧ champion, ⟦$2⟧"
  ],
  [
   "^Medalla en el Campeonato de España (\\d{4}) \\((.+)\\)$",
   "Medal at the $1 Spanish Championships (⟦$2⟧)"
  ],
  [
   "^Internacional con España (\\d{4}) \\((.+)\\)$",
   "Spain international $1 ($2)"
  ],
  [
   "^Ganador(?:a)? de (.+)$",
   "Winner of $1"
  ],
  [
   "^Podio en (.+)$",
   "Podium at $1"
  ],
  [
   "^Líder del ranking español(.*)$",
   "Spanish ranking leader$1"
  ],
  [
   "^Selección española(.*)$",
   "Spanish national team$1"
  ]
 ]
};
