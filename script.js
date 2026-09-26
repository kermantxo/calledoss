/* ============================================================
   DATOS REALES — temporada 2026
   Fuentes: atletismorfea.es (Calendario España Atletismo,
   Ranking oficial RFEA) y noticias RFEA/prensa federativa,
   consultadas el 05/08/2026.
   ============================================================ */

// Datos automáticos (se rellenan al cargar la página, ver «DATOS AUTOMÁTICOS» al final)
var RESULTS_INDEX = [];
var LIVE_DATA = null;
var MISSING_IDS = new Set();
var PREVIAS = [];

const CALENDAR = [
  {id:"mundo-campo-a-traves", date:"2026-01-10", name:"Campeonato del Mundo de Campo a Través", place:"Tallahassee (USA)", type:"Cross", cat:"Absoluto"},
  {id:"mundial-indoor-torun", date:"2026-03-20", name:"Campeonato del Mundo en Pista Cubierta", place:"Toruń (POL)", type:"Pista Cubierta", cat:"Absoluto"},
  {id:"mundo-short-track", date:"2026-01-20", name:"Campeonato del Mundo Short Track", place:"Toruń (POL)", type:"Short Track", cat:"Absoluto"},
  {id:"esp-por-short-track", date:"2026-01-28", name:"ESP-POR Short Track Pruebas Combinadas", place:"Zaragoza", type:"Short Track", cat:"Combinadas"},
  {id:"copa-europa-lanzamientos", date:"2026-03-14", name:"Copa de Europa de Lanzamientos", place:"Nicosia (CYP)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"mundo-universitario-cross", date:"2026-03-14", name:"Campeonato del Mundo Universitario de Campo a Través", place:"Cassino (ITA)", type:"Cross", cat:"Universitario"},
  {id:"mundo-marcha-equipos", date:"2026-04-12", name:"Campeonato del Mundo de Marcha por Equipos", place:"Brasilia (BRA)", type:"Marcha", cat:"Absoluto"},
  {id:"world-athletics-relays", date:"2026-05-02", name:"World Athletics Relays", place:"Gaborone (BOT)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"encuentro-marcha-internacional", date:"2026-05-08", name:"Encuentro Internacional de Marcha (CZE-ESP-FIN-FRA-ITA-SVK)", place:"Poděbrady (CZE)", type:"Marcha", cat:"Absoluto"},
  {id:"relevos-esp-por-villafranca", date:"2026-05-20", name:"Encuentro Internacional de Relevos ESP-POR y GP Villafranca", place:"Villafranca de los Barros", type:"Pista Aire libre", cat:"Absoluto/Sub-20"},
  {id:"copa-europa-10000m", date:"2026-05-23", name:"Copa de Europa de 10.000 m", place:"La Spezia (ITA)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"iberoamericano", date:"2026-05-29", name:"Campeonato Iberoamericano de Atletismo", place:"Lima (PER)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"europa-offroad", date:"2026-06-05", name:"Campeonato de Europa Off-Road", place:"Ljubljana (SLO)", type:"Trail Running", cat:"Absoluto"},
  {id:"trail-sub18-copa", date:"2026-06-21", name:"Copa Internacional de Trail y Carreras de Montaña Sub-18", place:"Gagliano del Capo (ITA)", type:"Trail Running", cat:"Sub-18"},
  {id:"iberico-combinadas", date:"2026-06-22", name:"Trofeo Ibérico de Pruebas Combinadas POR-ESP", place:"Lisboa (POR)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"europeo-sub18", date:"2026-07-16", name:"Campeonato de Europa Sub-18", place:"Rieti (ITA)", type:"Internacional", cat:"Sub-18"},
  {id:"mundial-sub20", date:"2026-08-05", name:"Campeonato del Mundo Sub-20", place:"Eugene (USA)", type:"Internacional", cat:"Sub-20"},
  {id:"europeo-birmingham", date:"2026-08-10", name:"Campeonato de Europa", place:"Birmingham (GBR)", type:"Internacional", cat:"Absoluto"},
  {id:"juegos-mediterraneos", date:"2026-08-30", name:"Juegos Mediterráneos", place:"Tarento (ITA)", type:"Pista Aire libre", cat:"Absoluto"},
  {id:"mundial-ruta", date:"2026-09-19", name:"Campeonato del Mundo de Ruta", place:"Copenhague (DEN)", type:"Ruta", cat:"Absoluto"},
  {id:"mundial-100km-iau", date:"2026-09-20", name:"Campeonato del Mundo de 100 km IAU", place:"Ames (A Coruña, ESP)", type:"Ruta", cat:"Absoluto"},
  {id:"juegos-olimpicos-juventud", date:"2026-10-30", name:"Juegos Olímpicos de la Juventud", place:"Dakar (SEN)", type:"Pista Aire libre", cat:"Sub-18"},
  {id:"europeo-cross", date:"2026-12-13", name:"Campeonato de Europa de Campo a Través", place:"Belgrado (SRB)", type:"Cross", cat:"Absoluto"},

  // Wanda Diamond League 2026 — calendario real de reuniones (diamondleague.com)
  {id:"dl-shanghai", date:"2026-05-16", name:"Diamond League — Shanghai/Keqiao", place:"Shanghai/Keqiao (CHN)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-xiamen", date:"2026-05-23", name:"Diamond League — Xiamen", place:"Xiamen (CHN)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-rabat", date:"2026-05-31", name:"Diamond League — Rabat", place:"Rabat (MAR)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-rome", date:"2026-06-04", name:"Diamond League — Roma", place:"Roma (ITA)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-stockholm", date:"2026-06-07", name:"Diamond League — Estocolmo", place:"Estocolmo (SWE)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-oslo", date:"2026-06-10", name:"Diamond League — Oslo", place:"Oslo (NOR)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-doha", date:"2026-06-19", name:"Diamond League — Doha", place:"Doha (QAT)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-paris", date:"2026-06-28", name:"Diamond League — París", place:"París (FRA)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-eugene", date:"2026-07-04", name:"Diamond League — Eugene", place:"Eugene (USA)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-monaco", date:"2026-07-10", name:"Diamond League — Mónaco", place:"Mónaco (MON)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-london", date:"2026-07-18", name:"Diamond League — Londres", place:"Londres (GBR)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-lausanne", date:"2026-08-21", name:"Diamond League — Lausana", place:"Lausana (SUI)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-silesia", date:"2026-08-23", name:"Diamond League — Silesia", place:"Silesia (POL)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-zurich", date:"2026-08-27", name:"Diamond League — Zúrich", place:"Zúrich (SUI)", type:"Diamond League", cat:"Absoluto"},
  {id:"dl-brussels", date:"2026-09-04", name:"Diamond League — Bruselas (Final)", place:"Bruselas (BEL)", type:"Diamond League", cat:"Absoluto"},

  // Calendario de cross y ruta (ADOC / RFEA) — datos reales aportados por el usuario
  {id:"cross-constitucion", date:"2025-10-18", name:"XXXIX Cross Nacional de la Constitución", place:"Aranda de Duero", type:"Cross", cat:"R.F.E Atletismo"},
  {id:"cross-zornotza", date:"2025-10-19", name:"LXXI Cross Internacional Zornotza", place:"Amorebieta-Etxano", type:"Cross", cat:"World Athletics Gold"},
  {id:"cross-castellano-manchego", date:"2025-10-26", name:"XLII Cross Castellano Manchego", place:"Quintanar de la Orden", type:"Cross", cat:"R.F.E Atletismo"},
  {id:"cross-italica", date:"2025-11-09", name:"XLIII Cross Internacional de Itálica", place:"Santiponce", type:"Cross", cat:"World Athletics Gold"},
  {id:"cross-soria", date:"2025-11-16", name:"XXXI Campo a Través Internacional de Soria", place:"Soria", type:"Cross", cat:"World Athletics Gold"},
  {id:"cross-alcobendas", date:"2025-11-30", name:"XLIII C.I.C. Alcobendas (Ciudad Europea del Deporte)", place:"Alcobendas, Madrid", type:"Cross", cat:"World Athletics Gold"},
  {id:"cross-santurce-bilbao", date:"2025-11-30", name:"XXXVIII Santurce a Bilbao", place:"Santurtzi–Bilbao", type:"Cross", cat:"R.F.E Atletismo"},
  {id:"cross-cantimpalos", date:"2025-12-08", name:"LIII Cross Nacional Ayuntamiento de Cantimpalos", place:"Cantimpalos", type:"Cross", cat:"R.F.E Atletismo"},
  {id:"cross-alcala-henares", date:"2025-12-14", name:"VII Cross Aniversario Patrimonio Mundial", place:"Alcalá de Henares", type:"Cross", cat:"R.F.E Atletismo"},
  {id:"cross-venta-banos", date:"2025-12-21", name:"XLV Cross Internacional de Venta de Baños", place:"Venta de Baños", type:"Cross", cat:"World Athletics Gold"},
  {id:"cross-amurrio", date:"2025-12-28", name:"VII Cross Internacional de Amurrio", place:"Amurrio", type:"Cross", cat:"World Athletics Silver"},
  {id:"cross-valladolid", date:"2026-01-11", name:"XXXVIII Cross Internacional Ciudad de Valladolid", place:"Valladolid", type:"Cross", cat:"World Athletics Silver"},
  {id:"cross-caceres", date:"2026-02-01", name:"LV Gran Premio de Cáceres de Campo a Través", place:"Cáceres", type:"Cross", cat:"World Athletics Silver"},
  {id:"cross-ulia-10k", date:"2026-02-08", name:"XCV 10 K Gimnástica de Ulía", place:"Donostia/San Sebastián", type:"Ruta", cat:"World Athletics Label Road"},

  // Calendario nacional RFEA (atletismorfea.es/calendario) — enero 2026, extraído en directo de la web oficial
  {id:"rfea-navarro-st-10", date:"2026-01-10", name:"Campeonato Navarro Sub-23 y Sub-20 (Short Track)", place:"San Sebastián (pista cubierta)", type:"Short Track", cat:"Sub-20/Sub-23"},
  {id:"rfea-catalunya-comb-st-10", date:"2026-01-10", name:"Campionat de Catalunya de Proves Combinades Absolut i Sub-23 (Short Track)", place:"Sabadell (pista cubierta)", type:"Short Track", cat:"Absoluto/Sub-23"},
  {id:"rfea-gp-st-sabadell", date:"2026-01-10", name:"1r Gran Premi Short Track", place:"Sabadell (pista cubierta)", type:"Short Track", cat:"Absoluto"},
  {id:"rfea-10k-valencia", date:"2026-01-11", name:"10K Valencia Ibercaja by Kiprun", place:"Valencia", type:"Ruta", cat:"Absoluto"},
  {id:"rfea-catalunya-comb-st-11", date:"2026-01-11", name:"Campionat de Catalunya de Proves Combinades Absolut i Sub-23 (Short Track) — jornada 2", place:"Sabadell (pista cubierta)", type:"Short Track", cat:"Absoluto/Sub-23"},
  {id:"rfea-valenciana-comb-st", date:"2026-01-16", name:"Campeonato Autonómico de Pruebas Combinadas Absoluto/Sub-23 (Short Track)", place:"Valencia (pista cubierta)", type:"Short Track", cat:"Comunidad Valenciana"},
  {id:"rfea-muguerza-2026", date:"2026-01-17", name:"LXXXII Cross Internacional Juan Muguerza de Elgoibar", place:"Elgoibar", type:"Cross", cat:"Absoluto"},
  {id:"rfea-castillayleon-st", date:"2026-01-17", name:"Campeonato Autonómico Sub-23 (Short Track)", place:"Salamanca (pista cubierta)", type:"Short Track", cat:"Castilla y León"},
  {id:"rfea-castillayleon-comb-st", date:"2026-01-17", name:"Campeonato Autonómico de Pruebas Combinadas Absoluto/Sub-23/Sub-20/Sub-18 (Short Track)", place:"Salamanca (pista cubierta)", type:"Short Track", cat:"Castilla y León"},
  {id:"rfea-andalucia-st-1500-3000", date:"2026-01-17", name:"Campeonato de Andalucía Sub-23 Short Track (1.500 y 3.000 m)", place:"Antequera (pista cubierta)", type:"Short Track", cat:"Andalucía"},
  {id:"rfea-madrid-comb-st", date:"2026-01-17", name:"Campeonato de Madrid de Pruebas Combinadas Absoluto/Sub-23/Sub-20 (Short Track)", place:"Madrid (pista cubierta)", type:"Short Track", cat:"Madrid"},
  {id:"rfea-navarro-st-23", date:"2026-01-23", name:"Campeonato Navarro Sub-20/Sub-23 (Short Track)", place:"Zizur Mayor (pista cubierta)", type:"Short Track", cat:"Navarra"},
  {id:"rfea-catalunya-meeting-st", date:"2026-01-23", name:"Meeting Internacional de Catalunya (Short Track)", place:"Sabadell (pista cubierta)", type:"Short Track", cat:"Absoluto"},
  {id:"rfea-esp-cross-s18-s16", date:"2026-01-24", name:"Campeonato de España de Campo a Través Sub-18/Sub-16 e Inclusivo por Selecciones Autonómicas", place:"Almodóvar del Río", type:"Cross", cat:"Sub-18/Sub-16"},
  {id:"rfea-salamanca-trofeo-st", date:"2026-01-24", name:"II Trofeo de Atletismo Ciudad de Salamanca (Short Track)", place:"Salamanca (pista cubierta)", type:"Short Track", cat:"Absoluto"},
  {id:"rfea-madrid-sub23-st", date:"2026-01-24", name:"Campeonato de Madrid Sub-23 (Short Track)", place:"Madrid (pista cubierta)", type:"Short Track", cat:"Sub-23"},
  {id:"rfea-galicia-comb-st", date:"2026-01-24", name:"Campionato Xunta de Galicia Sub-23 de Probas Combinadas (Short Track)", place:"Ourense (pista cubierta)", type:"Short Track", cat:"Galicia"},
  {id:"rfea-andalucia-st-resto", date:"2026-01-24", name:"Campeonato de Andalucía Sub-23 Short Track (excepto 1.500 y 3.000 m)", place:"Antequera (pista cubierta)", type:"Short Track", cat:"Andalucía"},

  // Calendario nacional RFEA (atletismorfea.es/calendario) — febrero a diciembre 2026, extraído en directo de la web oficial
  {id:"rfea-y-totalenergies-maraton-media-maraton-y-10k-mur-0201", date:"2026-02-01", name:"TotalEnergies Maratón Media Maratón y 10k Murcia Costa Cálida", place:"MURCIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-mitja-marato-international-de-terrassa-0201", date:"2026-02-01", name:"Mitja Marató International de Terrassa", place:"TERRASA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-lv-gran-premio-caceres-0201", date:"2026-02-01", name:"LV Gran Premio Cáceres", place:"ACEITUNA", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub23-short-track-comun-0201", date:"2026-02-01", name:"Campeonato Autonomico Sub23 Short Track Comunidad Valenciana", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-2o-gran-premi-short-track-0201", date:"2026-02-01", name:"2º Gran Premi Short Track", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-world-indoor-tour-gold-madrid-2026-0206", date:"2026-02-06", name:"World Indoor Tour Gold Madrid 2026", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-cto-autonomico-p-combinadas-sub18-sub20-st-co-0206", date:"2026-02-06", name:"Cto Autonomico P. Combinadas Sub18-Sub20 ST Comunidad Valenciana (6 feb–7 feb)", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-sub-23-0207", date:"2026-02-07", name:"Campeonato de España de Short Track sub-23", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-absoluto-short-track-co-0207", date:"2026-02-07", name:"Campeonato Autonomico Absoluto Short Track Comunidad Valenciana 2026", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-absoluto-castilla-y-leo-0207", date:"2026-02-07", name:"Campeonato Autonómico Absoluto Castilla y León ST", place:"SALAMANCA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-lanzamientos-invierno-0207", date:"2026-02-07", name:"Campeonato de Andalucía Lanzamientos Invierno Absoluto -APLAZADO-", place:"MÁLAGA-CAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-pruebas-combinadas-sh-0207", date:"2026-02-07", name:"Campeonato de Andalucia Pruebas Combinadas Short Track", place:"ANTEQUERA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-de-lanzamientos-largo-0207", date:"2026-02-07", name:"Campeonato de Andalucía de Lanzamientos Largos Sub18 y Sub20", place:"JAÉN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-canarias-de-lanzamientos-largos-0207", date:"2026-02-07", name:"Campeonato de Canarias de Lanzamientos Largos", place:"SANTA CRUZ DE TENERIFE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-oxox-vertical-chinte-trail-0207", date:"2026-02-07", name:"Oxox Vertical - Chinte Trail", place:"CIEZA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-por-clube-0214", date:"2026-02-14", name:"Campeonato de España de Short Track por Clubes - Copa Joma", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-por-clube-0214-2", date:"2026-02-14", name:"Campeonato de España de Short Track por Clubes - Copa Iberdrola", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-5-k-breakfast-run-zurich-maraton-sevilla-2026-0214", date:"2026-02-14", name:"5 K Breakfast Run - Zurich Maratón Sevilla 2026", place:"SEVILLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-trofeo-ibercaja-ciudad-de-zaragoza-short-trac-0214", date:"2026-02-14", name:"Trofeo Ibercaja Ciudad de Zaragoza Short Track 2026", place:"ZARAGOZA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-navarro-absoluto-short-track-0214", date:"2026-02-14", name:"Campeonato Navarro Absoluto Short Track", place:"SAN SEBASTIÁN (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xli-campionato-xunta-de-galicia-absoluto-en-p-0214", date:"2026-02-14", name:"XLI Campionato Xunta de Galicia Absoluto en PC", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-canarias-de-pista-de-invierno-0214", date:"2026-02-14", name:"Campeonato de Canarias de Pista de Invierno", place:"ARRECIFE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-euskadi-lanzamientos-largos-de--0214", date:"2026-02-14", name:"Campeonato de Euskadi Lanzamientos Largos de Invierno - SUSPENDIDO", place:"SAN SEBASTIÁN (I)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-absoluto-0214", date:"2026-02-14", name:"Campeonato de Madrid Absoluto (14 feb–15 feb)", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xli-campionato-de-galicia-absoluto-en-pc-prob-0214", date:"2026-02-14", name:"XLI Campionato de Galicia Absoluto en PC - Probas Combinadas (14 feb–15 feb)", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-marcha-maraton-10-km--0215", date:"2026-02-15", name:"Campeonato de España de Marcha Maratón, 10 km sub-20/sub-18 y 5 km sub-16", place:"CIEZA", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-10-km-absoluto-y-mast-0215", date:"2026-02-15", name:"Campeonato de España de 10 km Absoluto y Master", place:"IBIZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-marcha-sub-20-y-sub-1-0215", date:"2026-02-15", name:"Campeonato de España de Marcha sub-20 y sub-16 por Federaciones Autonómicas", place:"CIEZA", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-hyundai-mitja-marato-barcelona-by-brooks-0215", date:"2026-02-15", name:"Hyundai Mitja Marató Barcelona by Brooks", place:"BARCELONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-zurich-maraton-de-sevilla-2026-0215", date:"2026-02-15", name:"Zurich Maratón de Sevilla 2026", place:"SEVILLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-10k-ibiza-platja-d-en-bossa-0215", date:"2026-02-15", name:"10K Ibiza-Platja D'En Bossa", place:"IBIZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-50e-campionat-de-catalunya-absolut-st-0215", date:"2026-02-15", name:"50è Campionat de Catalunya Absolut ST", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-lanzamientos-largos-d-0220", date:"2026-02-20", name:"Campeonato de España de Lanzamientos Largos de invierno (20 feb–22 feb)", place:"CASTELLÓN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub18-short-track-comun-0221", date:"2026-02-21", name:"Campeonato Autonomico Sub18 Short Track Comunidad Valenciana", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-meeting-internacional-de-atletismo-ourense-0221", date:"2026-02-21", name:"Meeting Internacional de atletismo Ourense", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-de-proves-combinades-s-0221", date:"2026-02-21", name:"Campionat de Catalunya de proves combinades S18-20 ST", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-sub18-short-track-0221", date:"2026-02-21", name:"Campeonato de Andalucía Sub18 Short Track", place:"ANTEQUERA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-euskadi-sub-18-y-sub-20-short-t-0221", date:"2026-02-21", name:"Campeonato de Euskadi Sub 18 y Sub 20 Short Track", place:"SAN SEBASTIÁN (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-30a-meridiano-media-maraton-internacional-y-1-0222", date:"2026-02-22", name:"30ª Meridiano Media Maratón Internacional y 10K Aguas de Alicante", place:"ALICANTE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-maraton-bp-castellon-0222", date:"2026-02-22", name:"Maratón BP Castellón", place:"CASTELLÓN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-10k-facsa-castellon-0222", date:"2026-02-22", name:"10k Facsa Castellón", place:"CASTELLÓN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub-20-castilla-y-leon--0227", date:"2026-02-27", name:"Campeonato Autonómico Sub-20 Castilla y León ST", place:"SALAMANCA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub-18-castilla-y-leon--0227", date:"2026-02-27", name:"Campeonato Autonómico Sub-18 Castilla y León ST", place:"SALAMANCA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xxxi-campionato-xunta-de-galicia-sub-18-pc-0227", date:"2026-02-27", name:"XXXI Campionato Xunta de Galicia Sub 18 PC", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-sub20-short-track-0227", date:"2026-02-27", name:"Campeonato de Andalucía Sub20 Short Track", place:"ANTEQUERA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-sub-18-0227", date:"2026-02-27", name:"Campeonato de Madrid Sub 18", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campionato-xunta-de-galicia-sub-18-e-sub-20-d-0227", date:"2026-02-27", name:"Campionato Xunta de Galicia Sub 18 e Sub 20 de Probas Combinadas PC", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-sub-18-0301", date:"2026-03-01", name:"Campeonato de Madrid Sub 18", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campionato-xunta-de-galicia-sub-18-e-sub-20-d-0301", date:"2026-03-01", name:"Campionato Xunta de Galicia Sub 18 e Sub 20 de Probas Combinadas PC", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-0301", date:"2026-03-01", name:"Campeonato de España de Short Track", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-lanzamientos-largos-d-0301", date:"2026-03-01", name:"Campeonato de España de Lanzamientos Largos de invierno Master", place:"DURANGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xi-10k-y-5k-barakaldo-0301", date:"2026-03-01", name:"XI 10K y 5K Barakaldo", place:"BARAKALDO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xviii-medio-maraton-coruna-21-0301", date:"2026-03-01", name:"XVIII Medio Maratón Coruña 21", place:"LA CORUÑA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-41e-campionat-de-catalunya-sub18-st-0301", date:"2026-03-01", name:"41è Campionat de Catalunya Sub18 ST", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xxx-campionato-xunta-de-galicia-sub-20-pc-0301", date:"2026-03-01", name:"XXX Campionato Xunta de Galicia Sub 20 PC", place:"OURENSE (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-master-0306", date:"2026-03-06", name:"Campeonato de España de Short Track Master (6 mar–7 mar)", place:"ANTEQUERA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-campo-a-traves-univer-0306", date:"2026-03-06", name:"Campeonato de España de campo a través Universitario (6 mar–7 mar)", place:"JAÉN", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-sub-16-0307", date:"2026-03-07", name:"Campeonato de España de Short Track sub-16", place:"SALAMANCA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub20-short-track-comun-0307", date:"2026-03-07", name:"Campeonato Autonomico Sub20 Short Track Comunidad Valenciana", place:"VALENCIA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-sub20-st-0307", date:"2026-03-07", name:"Campionat de Catalunya Sub20 ST", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-ii-10k-internacional-bilbao-0307", date:"2026-03-07", name:"II 10K Internacional Bilbao", place:"BILBAO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-encontre-internacional-de-relleus-control-abs-0307", date:"2026-03-07", name:"Encontre Internacional de Relleus + control absolut", place:"SANT CUGAT", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-15-km-absoluto-y-master-0313", date:"2026-03-13", name:"Campeonato de España 15 km Absoluto y Master", place:"CIEZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-15k-metlife-madrid-activa-2026-0313", date:"2026-03-13", name:"15K Metlife Madrid Activa 2026", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-sub-20-0313", date:"2026-03-13", name:"Campeonato de Madrid Sub 20", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-gran-premio-nacional-de-marcha-floracion-de-c-0313", date:"2026-03-13", name:"Gran Premio Nacional de Marcha Floración de Cieza", place:"CIEZA", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-allianz-nacionales-sub-18-short-track-0314", date:"2026-03-14", name:"Allianz Nacionales sub-18 Short Track (14 mar–15 mar)", place:"ANTEQUERA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-universitario-campo-a-tr-0314", date:"2026-03-14", name:"Campeonato del Mundo Universitario Campo a Través (14 mar–15 mar)", place:"CASSINO - (ITA)", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-iau-campeonato-del-mundo-de-50-km-master-0314", date:"2026-03-14", name:"IAU Campeonato del Mundo de 50 km Master", place:"NUEVA DELHI", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-copa-de-europa-de-lanzamientos-0314", date:"2026-03-14", name:"Copa de Europa de Lanzamientos (14 mar–15 mar)", place:"NICOSIA - (CYP)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-trail-running-absolut-0315", date:"2026-03-15", name:"Campeonato de España de Trail Running absoluto, sub-23 y Master", place:"CALDAS DA REIS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-maraton-absoluto-y-ma-0315", date:"2026-03-15", name:"Campeonato de España de Maratón Absoluto y Master", place:"BARCELONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-zurich-marato-barcelona-0315", date:"2026-03-15", name:"Zurich Marató Barcelona", place:"BARCELONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-10k-camargo-pedro-velarde-0315", date:"2026-03-15", name:"10K Camargo Pedro Velarde", place:"CAMARGO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-totalenergies-medio-maraton-de-malaga-2026-0315", date:"2026-03-15", name:"TotalEnergies Medio Maratón de Málaga 2026", place:"MÁLAGA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xvi-10km-ciudad-de-la-ceramica-0315", date:"2026-03-15", name:"XVI 10KM Ciudad de la Cerámica", place:"TALAVERA DE LA REINA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-iii-trail-laxe-dos-bolos-0315", date:"2026-03-15", name:"III Trail Laxe dos Bolos", place:"CALDAS DE REIS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-short-track-0320", date:"2026-03-20", name:"Campeonato del Mundo Short Track", place:"TORUŃ - (POL) (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-short-track-0322", date:"2026-03-22", name:"Campeonato del Mundo Short Track", place:"TORUŃ - (POL) (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-sub-20-0322", date:"2026-03-22", name:"Campeonato de España de Short Track sub-20", place:"SABADELL (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xliii-carrera-de-san-jose-gp-diputacion-de-bu-0322", date:"2026-03-22", name:"XLIII Carrera de San José - GP Diputación de Burgos", place:"BURGOS", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxv-movistar-madrid-medio-maraton-0322", date:"2026-03-22", name:"XXV Movistar Madrid Medio Maratón", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-53a-media-maraton-internacional-y-10k-ciudad--0322", date:"2026-03-22", name:"53ª Media Maratón Internacional y 10K Ciudad de Elche", place:"ELCHE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-iv-os-10000-peregrinos-deputacion-da-coruna-0322", date:"2026-03-22", name:"IV Os 10000 Peregrinos Deputación da Coruña", place:"SANTIAGO DE COMPOSTELA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xvi-media-maraton-ciudad-de-leon-bernesga-mot-0322", date:"2026-03-22", name:"XVI Media Maratón Ciudad de León Bernesga Motor 2026", place:"LEÓN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-5k-sme-vila-real-0322", date:"2026-03-22", name:"5K SME Vila-Real", place:"VILA-REAL", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-festival-de-ultrafondo-g-p-ciudad-de-burjasso-0327", date:"2026-03-27", name:"Festival de Ultrafondo G.P Ciudad de Burjassot (27 mar–29 mar)", place:"BURJASSOT", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-europa-de-short-track-master-0327", date:"2026-03-27", name:"Campeonato de Europa de Short Track Master (27 mar–2 abr)", place:"TORUŃ - (POL) (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-reventon-trail-el-paso-0328", date:"2026-03-28", name:"Reventón Trail El Paso", place:"EL PASO", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-xviii-media-maraton-cajaviva-segovia-0328", date:"2026-03-28", name:"XVIII Media Maratón Cajaviva Segovia", place:"SEGOVIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-esp-por-short-track-pruebas-combinadas-0328", date:"2026-03-28", name:"ESP-POR Short Track Pruebas Combinadas (28 mar–29 mar)", place:"ZARAGOZA (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-media-maraton-y-10k-de-getxo-0329", date:"2026-03-29", name:"Media Maratón y 10k de Getxo", place:"GETXO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-cursa-patrimoni-ibiza-0329", date:"2026-03-29", name:"Cursa Patrimoni Ibiza", place:"IBIZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-ruta-medio-maraton-abs-y-0411", date:"2026-04-11", name:"Campeonato de España Ruta (Medio Maratón Abs y Master 5 km y Milla Absoluto) (11 abr–12 abr)", place:"MÉRIDA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-media-maraton-merida-patrimonio-de-la-humanid-0411", date:"2026-04-11", name:"Media Maratón Mérida Patrimonio de la Humanidad", place:"MÉRIDA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xi-milla-urbana-de-santander-0411", date:"2026-04-11", name:"XI Milla Urbana de Santander", place:"SANTANDER", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-illes-balears-absoluto-pruebas-com-0411", date:"2026-04-11", name:"Campeonato Illes Balears Absoluto Pruebas Combinadas Pista Verano 2026 (11 abr–12 abr)", place:"PALMA DE MALLORCA-PRI", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-trail-running-por-fed-0412", date:"2026-04-12", name:"Campeonato de España de Trail Running por Federaciones Autonómicas", place:"OVIEDO", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-de-marcha-por-equipos-0412", date:"2026-04-12", name:"Campeonato del Mundo de Marcha por equipos", place:"BRASILIA - (BRA)", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-mann-filter-maraton-de-zaragoza-0412", date:"2026-04-12", name:"Mann-Filter Maratón de Zaragoza", place:"ZARAGOZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxvii-medio-maraton-almeria-2026-0412", date:"2026-04-12", name:"XXVII Medio Maratón Almería 2026", place:"ALMERIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxix-medio-maraton-las-galletas-2026-0412", date:"2026-04-12", name:"XXIX Medio Maratón Las Galletas 2026", place:"ARONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-trail-del-prerromanico-0412", date:"2026-04-12", name:"Trail del Prerromanico", place:"OVIEDO", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-xiv-carrera-bomberos-de-madrid-decimas-0412", date:"2026-04-12", name:"XIV Carrera Bomberos de Madrid - Decimas", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-10k-reunion-0418", date:"2026-04-18", name:"10K Reunion", place:"Sede por confirmar", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub18-sub20-sub23-abs-y-0418", date:"2026-04-18", name:"Campeonato Autonómico Sub18 Sub20 Sub23 Abs y Master de Combinadas Com. Valen.", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-viamed-media-maraton-ciudad-de-chiclana-0419", date:"2026-04-19", name:"Viamed Media Maratón Ciudad de Chiclana", place:"CHICLANA DE LA FRONTERA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub18-sub20-sub23-abs-y-0419", date:"2026-04-19", name:"Campeonato Autonomico Sub18 Sub20 Sub23 Abs y Master de Combinadas Com. Valen.", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j1-a-p-0425", date:"2026-04-25", name:"Cto España Clubes DH Hombres Liga Joma J1 (A) PLAYAS-TFCC-HOSP-AAC", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j1-b-f-0425", date:"2026-04-25", name:"Cto España Clubes DH Hombres Liga Joma J1 (B) FENT-NERJ-CAPEX-CORNLL", place:"VALENCIA-JAD", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j1-b-a-0425", date:"2026-04-25", name:"Cto España Clubes 1D Hombres Liga Joma J1 (B) ABAEX-DELSUR-SAFOR-ATPORT", place:"BADAJOZ", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j1-c-m-0425", date:"2026-04-25", name:"Cto España Clubes 1D Hombres Liga Joma J1 (C) MENOR-MANR-BAT-HIRU", place:"MANRESA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j1-d-u-0425", date:"2026-04-25", name:"Cto España Clubes 1D Hombres Liga Joma J1 (D) UNIOV-ALCOR-CELT-NARON", place:"AVILÉS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j1-c-r-0425", date:"2026-04-25", name:"Cto España Clubes DH Hombres Liga Joma J1 (C) RSOC-PAMP-SCORP-ZOITI", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j1-d-a-0425", date:"2026-04-25", name:"Cto España Clubes DH Hombres Liga Joma J1 (D) ALBAC-JAEN-SGP-ATSAL", place:"SALAMANCA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-mujeres-liga-iberdrola-j-0425", date:"2026-04-25", name:"Cto España Clubes DH Mujeres Liga Iberdrola J1 (A) VALEN-AAC-BAT-TFCC", place:"BARCELONA-SE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-mujeres-liga-iberdrola-j-0425-2", date:"2026-04-25", name:"Cto España Clubes DH Mujeres Liga Iberdrola J1 (B) PLAYAS-HOSPI-PAMP-MANR", place:"L'HOSPITALET DE LLOBREGAT", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0425", date:"2026-04-25", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J1 (C) OURAT-FEMCEL-SGP-BARRUT", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0425-2", date:"2026-04-25", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J1 (D) SPRI-OVAT-BIDEZ-HIRU", place:"DURANGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-42-media-maraton-ciudad-de-granada-0425", date:"2026-04-25", name:"42 Media Maratón Ciudad de Granada", place:"GRANADA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j1-a-a-0426", date:"2026-04-26", name:"Cto España Clubes 1D Hombres Liga Joma J1 (A) ADM-CORD-UCAM-DURANG", place:"CÓRDOBA-FON", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0426", date:"2026-04-26", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J1 (A) LLEID-SAFOR-CORNLL-ZOITI", place:"CORNELLÀ DE LLOBREGAT", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-zurich-n-roll-running-series-madrid-2026-0426", date:"2026-04-26", name:"Zurich'n'roll Running Series Madrid 2026", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-15k-valencia-abierta-al-mar-0426", date:"2026-04-26", name:"15K Valencia Abierta al Mar", place:"VALENCIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-iv-5k-kilometro-42-ontiyent-0426", date:"2026-04-26", name:"IV 5K Kilómetro 42 Ontiyent", place:"ONTINYENTE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-vi-munalba-trail-0426", date:"2026-04-26", name:"VI Muñalba Trail", place:"REGUMIEL DE LA SIERRA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-europa-master-ruta-0430", date:"2026-04-30", name:"Campeonato de Europa Master Ruta (30 abr–3 may)", place:"CATANIA - (ITA)", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-ii-5-y-21-km-de-oliva-a-oliva-nova-0501", date:"2026-05-01", name:"II 5 y 21 Km de Oliva a Oliva Nova", place:"OLIVA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-subida-vertical-0502", date:"2026-05-02", name:"Campeonato de España de Subida Vertical", place:"BARRUELO DE SANTULLÁN - BRAÑOSERA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-pruebas-combinadas-po-0502", date:"2026-05-02", name:"Campeonato de España de Pruebas Combinadas por Federaciones Autonómicas (2 may–3 may)", place:"VALENCIA-JAD", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-world-athletics-relays-0502", date:"2026-05-02", name:"World Athletics Relays (2 may–3 may)", place:"GABORONE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-absoluto-cyl-sub-18-20--0502", date:"2026-05-02", name:"Campeonato Autonómico Absoluto CYL Sub-18-20-23 (Martillo)", place:"SEGOVIA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-carreras-de-montana-c-0503", date:"2026-05-03", name:"Campeonato de España de Carreras de Montaña Classic", place:"AGUILAR DE CAMPOO", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-transvulcania-adidas-terrex-isla-de-la-palma-0507", date:"2026-05-07", name:"Transvulcania Adidas Terrex Isla de La Palma (7 may–9 may)", place:"LA PALMA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-encuentro-internacional-de-marcha-2026-cze-es-0508", date:"2026-05-08", name:"Encuentro Internacional de Marcha 2026 CZE ESP FIN FRA ITA SVK", place:"PODĚBRADY - (CZE)", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-10-000-m-absoluto-y-sub--0509", date:"2026-05-09", name:"Campeonato de España 10.000 m (Absoluto y Sub-23) y 5000m (Sub-20 y Sub-18)", place:"MAHÓN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-pruebas-combinadas-su-0509", date:"2026-05-09", name:"Campeonato de Andalucía Pruebas Combinadas Sub16 a Senior (9 may–10 may)", place:"MÁLAGA-CAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-universitario-0509", date:"2026-05-09", name:"Campeonato de España Universitario (9 may–10 may)", place:"JAÉN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-atletismo-sub-16-e-in-0510", date:"2026-05-10", name:"Campeonato de España de Atletismo sub-16 e inclusivo por selecciones autonómicas", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-iii-carrera-de-las-familias-0510", date:"2026-05-10", name:"III Carrera de las Familias", place:"VALLADOLID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j2-i-p-0516", date:"2026-05-16", name:"Cto España Clubes DH Hombres Liga Joma J2 (I) PLAYAS-ALBAC-SCORP-CORN", place:"CORNELLÀ DE LLOBREGAT", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j2-ii--0516", date:"2026-05-16", name:"Cto España Clubes DH Hombres Liga Joma J2 (II) FENT-PAMP-SGP-AAC", place:"BARCELONA-SE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j2-iii-0516", date:"2026-05-16", name:"Cto España Clubes DH Hombres Liga Joma J2 (III) RSOC-NERJ-TFCC-ATSAL", place:"SALAMANCA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-hombres-liga-joma-j2-iv--0516", date:"2026-05-16", name:"Cto España Clubes DH Hombres Liga Joma J2 (IV) JAEN-HOSP-CAPEX-ZOITI", place:"JAÉN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-mujeres-liga-iberdrola-j-0516", date:"2026-05-16", name:"Cto España Clubes DH Mujeres Liga Iberdrola J2 (I) VALEN-ATSS-PIEL-MANR", place:"VALENCIA-JAD", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-dh-mujeres-liga-iberdrola-j-0516-2", date:"2026-05-16", name:"Cto España Clubes DH Mujeres Liga Iberdrola J2 (II) PLAYAS-JAEN-SCORP-TFCC", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j2-iii-0516", date:"2026-05-16", name:"Cto España Clubes 1D Hombres Liga Joma J2 (III) MENOR-DELSUR-CORD-CELT", place:"CÓRDOBA-FON", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0516", date:"2026-05-16", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J2 (II) ALCOR-SGP-HIRU-ZOITI", place:"HUESCA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-42-milla-urbana-de-aranda-de-duero-0516", date:"2026-05-16", name:"42 Milla Urbana de Aranda de Duero", place:"ARANDA DE DUERO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-meeting-atletismo-toni-bonet-ibiza-0516", date:"2026-05-16", name:"Meeting Atletismo Toni Bonet Ibiza", place:"IBIZA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-dinamyc-new-athletics-track-atlon-0516", date:"2026-05-16", name:"Dinamyc New Athletics + Track'atlon (16 may–17 may)", place:"MADRID (I)", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-hombres-liga-joma-j2-iv--0517", date:"2026-05-17", name:"Cto España Clubes 1D Hombres Liga Joma J2 (IV) UNIOV-ADM-ABAEX-HIRU", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0517", date:"2026-05-17", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J2 (I) LLEID-SPRI-FEMCEL-UCAM", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0517-2", date:"2026-05-17", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J2 (III) OURAT-DELSUR-CORN-BIDEZ", place:"DURANGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-1d-mujeres-liga-iberdrola-j-0517-3", date:"2026-05-17", name:"Cto España Clubes 1D Mujeres Liga Iberdrola J2 (IV) OVIAT-SAFOR-CAPEX-BARRUT", place:"VILLAFRANCA DE LOS BARROS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-lloret-de-mar-0517", date:"2026-05-17", name:"Meeting Lloret de Mar", place:"LLORET DE MAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxxviii-trofeo-feria-chica-0517", date:"2026-05-17", name:"XXXVIII Trofeo Feria Chica", place:"PALENCIA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-desafio-nerja-2026-0520", date:"2026-05-20", name:"Desafío Nerja 2026", place:"NERJA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-encuentro-internacional-relevos-esp-por-y-gp--0520", date:"2026-05-20", name:"Encuentro Internacional Relevos ESP-POR y GP Villafranca Ciudad del Deporte", place:"VILLAFRANCA DE LOS BARROS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-gran-premio-villafranca-ciudad-del-deporte-0520", date:"2026-05-20", name:"Gran Premio Villafranca Ciudad del Deporte", place:"VILLAFRANCA DE LOS BARROS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxii-milla-urbana-real-valle-de-cayon-0523", date:"2026-05-23", name:"XXII Milla Urbana Real Valle de Cayón", place:"SARÓN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-vii-gran-premio-excma-diputacion-de-ciudad-re-0523", date:"2026-05-23", name:"VII Gran Premio Excma Diputación de Ciudad Real", place:"CAMPO DE CRIPTANA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-v-10k-nocturna-internacional-ciudad-de-albace-0523", date:"2026-05-23", name:"V 10k Nocturna Internacional Ciudad de Albacete 2026", place:"ALBACETE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-islas-baleares-sub16-sub18-pista-v-0523", date:"2026-05-23", name:"Campeonato Islas Baleares Sub16-Sub18 Pista Verano", place:"PALMA DE MALLORCA-PRI", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xiii-trofeo-josefina-romero-de-marcha-en-ruta-0523", date:"2026-05-23", name:"XIII Trofeo Josefina Romero de Marcha en ruta", place:"A CORUÑA", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-de-proves-combinades-s-0523", date:"2026-05-23", name:"Campionat de Catalunya de proves combinades S18-S20-S23 i Absolut AL (23 may–24 may)", place:"CORNELLÀ DE LLOBREGAT", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-copa-de-europa-de-clubes-0523", date:"2026-05-23", name:"Copa de Europa de Clubes (23 may–24 may)", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-ii-iberoamericano-master-0523", date:"2026-05-23", name:"II Iberoamericano Master (23 may–27 may)", place:"LIMA - (PER)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-canarias-athletics-invitational-0527", date:"2026-05-27", name:"Meeting Canarias Athletics Invitational", place:"SANTA CRUZ DE TENERIFE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxvi-trofeo-de-atletismo-ciudad-de-fuenlabrad-0529", date:"2026-05-29", name:"XXVI Trofeo de Atletismo Ciudad de Fuenlabrada", place:"FUENLABRADA-MUN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-iberoamericano-atletismo-0529", date:"2026-05-29", name:"Campeonato Iberoamericano Atletismo (29 may–31 may)", place:"LIMA - (PER)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-final-b3-h-y-fi-0530", date:"2026-05-30", name:"Cto España Clubes 2ª División - Final B3 (H) y Final B2 (M)", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-trofeo-corpus-meeting-promesas-del-atletismo-0530", date:"2026-05-30", name:"Trofeo Corpus - Meeting Promesas del Atletismo", place:"TOLEDO-ECEF", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-internacional-isla-de-fuerteventura-0530", date:"2026-05-30", name:"Meeting Internacional Isla de Fuerteventura (30 may–31 may)", place:"CORRALEJO", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-por-clubes-segunda-divis-0531", date:"2026-05-31", name:"Campeonato de España por Clubes Segunda División - Fase Final", place:"A DESIGNAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-14-individual-0531", date:"2026-05-31", name:"Campeonato de España sub-14 Individual", place:"LA NUCÍA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-hombres-final-a-0531", date:"2026-05-31", name:"Cto España Clubes 2ª División Hombres - Final A", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-mujeres-final-a-0531", date:"2026-05-31", name:"Cto España Clubes 2ª División Mujeres - Final A", place:"BURGOS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-hombres-final-b-0531", date:"2026-05-31", name:"Cto España Clubes 2ª División Hombres - Final B1", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-hombres-final-b-0531-2", date:"2026-05-31", name:"Cto España Clubes 2ª División Hombres - Final B4", place:"ALHAMA DE MURCIA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-espana-clubes-2a-division-mujeres-final-b-0531", date:"2026-05-31", name:"Cto España Clubes 2ª División Mujeres - Final B4", place:"BADAJOZ", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-madrid-vintage-run-by-total-energies-0531", date:"2026-05-31", name:"Madrid Vintage Run by Total Energies", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-v-grand-prix-international-madrid-race-walkin-0531", date:"2026-05-31", name:"V Grand Prix International Madrid Race Walking", place:"MADRID", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-gran-premio-de-valladolid-ciudad-europea-del--0603", date:"2026-06-03", name:"Gran Premio de Valladolid Ciudad Europea del Deporte", place:"VALLADOLID-REN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-mitin-internacional-andalucia-challenger-0603", date:"2026-06-03", name:"Mitin Internacional Andalucía Challenger", place:"GRANADA-JUV", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-europa-off-road-0605", date:"2026-06-05", name:"Campeonato de Europa Off-Road (5 jun–7 jun)", place:"LJUBLJANA - (SLO)", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-16-0606", date:"2026-06-06", name:"Campeonato de España sub-16 (6 jun–7 jun)", place:"LA NUCÍA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxviii-trofeo-de-atletismo-ciudad-de-salamanc-0606", date:"2026-06-06", name:"XXVIII Trofeo de Atletismo Ciudad de Salamanca - Memorial Carlos Gil", place:"SALAMANCA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-ii-nocturna-de-atletismo-memorial-antonio-mor-0606", date:"2026-06-06", name:"II Nocturna de Atletismo Memorial Antonio Moreno de Frutos", place:"LOGROÑO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-aut-sub-18-castilla-y-leon-excepto-marcha-0606", date:"2026-06-06", name:"Cto Aut Sub-18 Castilla y León (excepto marcha, obstáculos, martillo)", place:"VALLADOLID-ESG", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-viii-edicion-10k-huelva-puerta-del-descubrimi-0606", date:"2026-06-06", name:"VIII Edición 10K Huelva Puerta del Descubrimiento", place:"HUELVA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-10k-internacional-santa-pola-summer-race-0606", date:"2026-06-06", name:"10K Internacional Santa Pola Summer Race", place:"SANTA POLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-gran-premi-d-aire-lliure-0606", date:"2026-06-06", name:"Gran Premi d'Aire Lliure", place:"SANTA COLOMA DE GRAMENET", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-fer-futur-u20-u18-2026-0606", date:"2026-06-06", name:"Meeting Fer Futur U20-U18 2026", place:"VALENCIA-JAD", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xv-meeting-arona-pruebas-combinadas-2026-0606", date:"2026-06-06", name:"XV Meeting Arona Pruebas Combinadas 2026 (6 jun–7 jun)", place:"ARONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxx-campionato-xunta-de-galicia-sub18-0606", date:"2026-06-06", name:"XXX Campionato Xunta de Galicia Sub18 (6 jun–7 jun)", place:"LUGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-de-pruebas-combinadas-0606", date:"2026-06-06", name:"Campeonato de Madrid de Pruebas Combinadas (6 jun–7 jun)", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-sub-18-y-sub-23-0606", date:"2026-06-06", name:"Campeonato de Madrid Sub 18 y Sub 23 (6 jun–7 jun)", place:"ARGANDA DEL REY", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-euskadi-absoluto-de-aire-libre-0606", date:"2026-06-06", name:"Campeonato de Euskadi Absoluto de Aire Libre (6 jun–7 jun)", place:"DURANGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-navarro-sub-20-sub-23-aire-libre-0607", date:"2026-06-07", name:"Campeonato Navarro Sub 20 - Sub 23 Aire Libre", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-sub18-sub20-y-sub23-de-la-region-de-murci-0607", date:"2026-06-07", name:"Cto Sub18 Sub20 y Sub23 de la Región de Murcia y Cto Abs de pruebas combinadas", place:"ALHAMA DE MURCIA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-asturias-sub-18-y-sub-20-0607", date:"2026-06-07", name:"Campeonato de Asturias Sub-18 y Sub-20", place:"AVILÉS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxv-reunion-internacional-ciudad-de-guadalaja-0609", date:"2026-06-09", name:"XXV Reunión Internacional Ciudad de Guadalajara", place:"GUADALAJARA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-por-clubes-division-de-h-0613", date:"2026-06-13", name:"Campeonato de España por Clubes División de Honor Liga Iberdrola - Título Mujeres", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-clubes-primera-division--0613", date:"2026-06-13", name:"Campeonato de España Clubes Primera División Liga Iberdrola - Final Título Mujer", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-clubes-division-de-honor-0613", date:"2026-06-13", name:"Campeonato de España Clubes División de Honor Liga Iberdrola - Final Permanencia", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-clubes-primera-division--0613-2", date:"2026-06-13", name:"Campeonato de España Clubes Primera División Liga Iberdrola - Final Permanencia", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-clubes-division-de-honor-0614", date:"2026-06-14", name:"Campeonato de España Clubes División de Honor Liga Joma - Final Título Hombres", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-clubes-primera-division--0614", date:"2026-06-14", name:"Campeonato de España Clubes Primera División Liga Joma - Final Título Hombres", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-pruebas-combinadas-cyl--0614", date:"2026-06-14", name:"Campeonato Autonómico Pruebas Combinadas CYL Absoluto Sub-23-20-18 AL", place:"LEÓN-ULE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-cantabria-sub-23-1a-jornada-0617", date:"2026-06-17", name:"Campeonato de Cantabria Sub-23 - 1ª Jornada", place:"SANTANDER", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-1er-meeting-42k-0617", date:"2026-06-17", name:"1er Meeting 42K", place:"VALENCIA-JAD", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-asturias-sub-23-y-absoluto-0617", date:"2026-06-17", name:"Campeonato de Asturias Sub-23 y Absoluto (17 jun–21 jun)", place:"AVILÉS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-internacional-ciudad-de-malaga-0618", date:"2026-06-18", name:"Meeting Internacional Ciudad de Málaga", place:"MÁLAGA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-iberoamericano-sub-20-0619", date:"2026-06-19", name:"Campeonato Iberoamericano Sub-20 (19 jun–21 jun)", place:"LIMA - (PER)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-aut-abs-sub-23-al-excepto-marcha-obstacul-0620", date:"2026-06-20", name:"Cto Aut Abs Sub-23 AL (Excepto marcha, obstáculos y martillo) G.P. Ciudad de León", place:"LEÓN-ULE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-sub23-individual-y-re-0620", date:"2026-06-20", name:"Campeonato de Andalucía Sub23 Individual y Relevo 4x100", place:"MOTRIL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxxix-campeonato-de-castilla-la-mancha-pal-tr-0620", date:"2026-06-20", name:"XXXIX Campeonato de Castilla-La Mancha PAL - Trofeo Ayto de Ciudad Real", place:"CIUDAD REAL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-islas-baleares-absoluto-pista-vera-0620", date:"2026-06-20", name:"Campeonato Islas Baleares Absoluto Pista Verano", place:"PALMA DE MALLORCA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionato-xunta-de-galicia-absoluto-aire-lib-0620", date:"2026-06-20", name:"Campionato Xunta de Galicia Absoluto aire libre (e marcha sub20 y sub23) (20 jun–21 jun)", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-absoluto-0620", date:"2026-06-20", name:"Campeonato de Madrid Absoluto (20 jun–21 jun)", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-navarro-absoluto-aire-libre-0620", date:"2026-06-20", name:"Campeonato Navarro Absoluto Aire Libre (20 jun–21 jun)", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-copa-internacional-de-trail-y-carreras-de-mon-0621", date:"2026-06-21", name:"Copa Internacional de Trail y Carreras de Montaña Sub-18", place:"GAGLIANO DEL CAPO", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-sub23-al-aire-lliure-0621", date:"2026-06-21", name:"Campionat de Catalunya Sub23 al aire lliure", place:"GIRONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionato-de-galicia-absoluto-de-probas-comb-0621", date:"2026-06-21", name:"Campionato de Galicia Absoluto de probas combinadas", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-sub18-y-5000-marcha-s-0621", date:"2026-06-21", name:"Campeonato de Andalucía Sub18 y 5000 marcha Sub20", place:"NERJA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-sub18-al-aire-lliure-0621", date:"2026-06-21", name:"Campionat de Catalunya Sub18 al aire lliure", place:"GIRONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-extremadura-absoluto-de-pista-a-0621", date:"2026-06-21", name:"Campeonato de Extremadura Absoluto de Pista Aire Libre", place:"VILLAFRANCA DE LOS BARROS", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-trofeo-iberico-pruebas-combinadas-por-esp-0622", date:"2026-06-22", name:"Trofeo Ibérico Pruebas Combinadas POR-ESP (22 jun–23 jun)", place:"LISBOA - (POR)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-v-meeting-de-atletismo-coria-del-rio-premio-r-0624", date:"2026-06-24", name:"V Meeting de Atletismo Coria del Río Premio Rogelio Sales", place:"CORIA DEL RÍO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-v-meeting-internacional-lleida-ua-0625", date:"2026-06-25", name:"V Meeting Internacional Lleida UA", place:"LLEIDA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-master-0626", date:"2026-06-26", name:"Campeonato de España Master (26 jun–28 jun)", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-master-off-road-0626", date:"2026-06-26", name:"Campeonato del Mundo Master Off-Road (26 jun–28 jun)", place:"JANSKÉ LÁZNĚ", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-18-por-federaciones--0627", date:"2026-06-27", name:"Campeonato de España sub-18 por Federaciones Autonómicas (27 jun–28 jun)", place:"LOGROÑO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxxvi-campionato-xunta-de-galicia-de-atletism-0627", date:"2026-06-27", name:"XXXVI Campionato Xunta de Galicia de Atletismo Sub23 - XXXVIII Sub20 (27 jun–28 jun)", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionato-de-galicia-sub20-y-sub23-de-probas-0627", date:"2026-06-27", name:"Campionato de Galicia Sub20 y Sub23 de probas combinadas (27 jun–28 jun)", place:"PEREIRO DE AGUIAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-sub20-al-aire-lliure-0628", date:"2026-06-28", name:"Campionat de Catalunya Sub20 al aire lliure", place:"VIC", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-gp-diputacion-castellon-memorial-jose-antonio-0701", date:"2026-07-01", name:"GP Diputación Castellón - Memorial José Antonio Cansino", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-cantabria-absoluto-1a-jornada-0701", date:"2026-07-01", name:"Campeonato de Cantabria Absoluto - 1ª Jornada", place:"CASTRO URDIALES", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-control-jose-antonio-cansino-0701", date:"2026-07-01", name:"Control José Antonio Cansino", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-ii-meeting-bernat-peso-0701", date:"2026-07-01", name:"II Meeting Bernat Peso", place:"GAVÀ", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-meeting-jose-luis-hernandez-0702", date:"2026-07-02", name:"Meeting José Luis Hernández", place:"PAMPLONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-madrid-sub-20-0703", date:"2026-07-03", name:"Campeonato de Madrid Sub 20 (3 jul–4 jul)", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campionat-de-catalunya-absolut-al-aire-lliure-0704", date:"2026-07-04", name:"Campionat de Catalunya Absolut al aire lliure", place:"GIRONA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-cto-autonomico-sub-20-al-excepto-marcha-obsta-0704", date:"2026-07-04", name:"Cto Autonómico Sub-20 AL (Excepto marcha obstáculos y martillo)", place:"ARANDA DE DUERO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-x-ordizia-meeting-jose-antonio-pena-nazioarte-0704", date:"2026-07-04", name:"X Ordizia Meeting - José Antonio Peña Nazioarteko Mitina", place:"ORDIZIA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-andalucia-absoluto-0704", date:"2026-07-04", name:"Campeonato de Andalucía Absoluto", place:"NERJA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-islas-baleares-sub23-sub20-pista-v-0704", date:"2026-07-04", name:"Campeonato Islas Baleares Sub23-Sub20 Pista Verano", place:"PALMA DE MALLORCA-PRI", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxiv-gran-premio-los-corrales-de-buelna-0704", date:"2026-07-04", name:"XXIV Gran Premio Los Corrales de Buelna", place:"LOS CORRALES DE BUELNA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-sub20-aire-libre-com-va-0704", date:"2026-07-04", name:"Campeonato Autonómico Sub20 Aire Libre Com. Valenciana 2026", place:"SAGUNTO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xlii-gran-premio-cidade-de-vigo-0704", date:"2026-07-04", name:"XLII Gran Premio Cidade de Vigo", place:"VIGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-allianz-nacionales-sub-18-0704", date:"2026-07-04", name:"Allianz Nacionales sub-18 (4 jul–5 jul)", place:"CASTELLÓN-MGH", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-master-por-clubes-primer-0705", date:"2026-07-05", name:"Campeonato de España Master por Clubes Primera División", place:"A CORUÑA-UN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-autonomico-aire-libre-com-valencia-0705", date:"2026-07-05", name:"Campeonato Autonómico Aire Libre Com. Valenciana 2026", place:"ALICANTE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-cantabria-absoluto-3a-jornada-0705", date:"2026-07-05", name:"Campeonato de Cantabria Absoluto - 3ª Jornada", place:"SANTANDER", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-23-0712", date:"2026-07-12", name:"Campeonato de España sub-23", place:"CÁCERES-CIU", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-master-por-clubes-segund-0712", date:"2026-07-12", name:"Campeonato de España Master por Clubes Segunda División", place:"A CORUÑA-UN", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-europa-sub-18-0716", date:"2026-07-16", name:"Campeonato de Europa Sub-18 (16 jul–19 jul)", place:"RIETI - (ITA)", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-meeting-madrid-2026-0716", date:"2026-07-16", name:"Meeting Madrid 2026", place:"MADRID-VLL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-20-0718", date:"2026-07-18", name:"Campeonato de España sub-20 (18 jul–19 jul)", place:"ALBACETE", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-0724", date:"2026-07-24", name:"Campeonato de España (24 jul–26 jul)", place:"MÁLAGA-CIU", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-10km-ribamontan-al-mar-0822", date:"2026-08-22", name:"10Km Ribamontán Al Mar", place:"GALIZANO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-master-0822", date:"2026-08-22", name:"Campeonato del Mundo Master (22 ago–3 sep)", place:"DAEGU - (KOR)", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-trail-el-guerrero-gredos-0829", date:"2026-08-29", name:"Trail El Guerrero - Gredos", place:"CANDELEDA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-xlii-carrera-nocturna-alcalde-de-aguilas-0829", date:"2026-08-29", name:"XLII Carrera Nocturna Alcalde de Aguilas", place:"AGUILAS", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xli-milla-urbana-delicias-0905", date:"2026-09-05", name:"XLI Milla Urbana Delicias", place:"ZARAGOZA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xlvi-100-50km-y-v-24-horas-ruta-de-cantabria--0905", date:"2026-09-05", name:"XLVI 100/50km y V 24 horas ruta de Cantabria-Ciudad de Santander (5 sep–6 sep)", place:"SANTANDER", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-europa-master-off-road-0910", date:"2026-09-10", name:"Campeonato de Europa Master Off-Road (10 sep–13 sep)", place:"RÂȘNOV", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-xxvi-milla-urbana-ciudad-de-guadalajara-0911", date:"2026-09-11", name:"XXVI Milla Urbana Ciudad de Guadalajara", place:"GUADALAJARA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-ultimate-championships-0911", date:"2026-09-11", name:"Ultimate Championships (11 sep–13 sep)", place:"BUDAPEST", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-canfranc-canfranc-0911", date:"2026-09-11", name:"Canfranc Canfranc (11 sep–13 sep)", place:"CANFRANC", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-39-medio-maraton-bajo-pas-ayto-de-pielagos-0912", date:"2026-09-12", name:"39 Medio Maratón Bajo Pas - Ayto de Piélagos", place:"ORUÑA DE PIELAGOS", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-ultra-montana-palentina-0912", date:"2026-09-12", name:"Ultra Montaña Palentina", place:"CAMPORREDONDO DE ALBA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-cristo-o-barco-2026-0918", date:"2026-09-18", name:"Cristo O Barco 2026", place:"O BARCO DE VALDEORRAS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-ultra-de-gredos-0919", date:"2026-09-19", name:"Ultra de Gredos", place:"NAVARREDONDA DE GREDOS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-10-kilometros-villa-de-ribadesella-0919", date:"2026-09-19", name:"10 Kilómetros Villa de Ribadesella", place:"RIBADESELLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-15k-nocturna-valencia-gana-energia-0926", date:"2026-09-26", name:"15K Nocturna Valencia Gana Energía", place:"VALENCIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-pollenca-running-fest-0926", date:"2026-09-26", name:"Pollença Running Fest", place:"POLLENÇA", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-millaza-toro-0926", date:"2026-09-26", name:"Millaza Toro", place:"TORO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxxviii-milla-internacional-de-berango-1003", date:"2026-10-03", name:"XXXVIII Milla Internacional de Berango", place:"BERANGO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xx-milla-urbana-de-valladolid-premio-caja-rur-1003", date:"2026-10-03", name:"XX Milla Urbana de Valladolid Premio Caja Rural de Zamora", place:"VALLADOLID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-iv-milla-de-la-ceramica-1003", date:"2026-10-03", name:"IV Milla de la Cerámica", place:"VILLAREAL", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xix-reunion-nacional-master-ciudad-de-la-lagu-1003", date:"2026-10-03", name:"XIX Reunión Nacional Master Ciudad de La Laguna (3 oct–4 oct)", place:"LA LAGUNA", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-campo-a-traves-master-1004", date:"2026-10-04", name:"Campeonato de España de Campo a Través Master individual y por clubes", place:"HORNACHUELOS", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-5o-medio-maraton-de-san-sebastian-rural-kutxa-1004", date:"2026-10-04", name:"5º Medio Maratón de San Sebastián Rural Kutxa", place:"SAN SEBASTIAN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-29o-medio-maraton-internacional-ciudad-de-alb-1004", date:"2026-10-04", name:"29º Medio Maratón Internacional Ciudad de Albacete 2026", place:"ALBACETE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xii-maraton-internacional-ciudad-de-logrono-1004", date:"2026-10-04", name:"XII Maratón Internacional Ciudad de Logroño", place:"LOGROÑO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xx-carreira-popular-coruna-10-1004", date:"2026-10-04", name:"XX Carreira Popular Coruña 10", place:"A CORUÑA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-15-mba-media-maraton-gijon-1010", date:"2026-10-10", name:"15 MBA Media Maratón Gijón", place:"GIJON", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-16-por-clubes-1010", date:"2026-10-10", name:"Campeonato de España sub-16 por Clubes (10 oct–11 oct)", place:"VARIAS SEDES", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-xxix-media-maraton-y-10km-villa-del-tratado-d-1011", date:"2026-10-11", name:"XXIX Media Maratón y 10km Villa del Tratado de Tordesillas", place:"TORDESILLAS", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-del-mundo-master-de-maraton-1011", date:"2026-10-11", name:"Campeonato del Mundo Master de Maratón", place:"ZAGREB", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-maraton-de-estepona-jardin-de-la-costa-del-so-1011", date:"2026-10-11", name:"Maratón de Estepona - Jardín de la Costa del Sol", place:"ESTEPONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-milla-internacional-de-otono-y-10k-1012", date:"2026-10-12", name:"Milla Internacional de Otoño y 10K", place:"BILBAO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-vi-desafio-internacional-ecocamino-50k-1012", date:"2026-10-12", name:"VI Desafío Internacional Ecocamiño 50K", place:"LA CORUÑA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-14-por-equipos-1018", date:"2026-10-18", name:"Campeonato de España sub-14 por Equipos", place:"VIGO", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-pruebas-combinadas-maste-1018", date:"2026-10-18", name:"Campeonato de España Pruebas Combinadas Master", place:"PALAFRUGELL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-pentatlon-lanzamientos-m-1018", date:"2026-10-18", name:"Campeonato de España Pentatlón Lanzamientos Master", place:"PALAFRUGELL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-10-000-m-y-milla-master-1018", date:"2026-10-18", name:"Campeonato de España 10.000 m y Milla Master", place:"PALAFRUGELL", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-72o-cross-internacional-zornotza-1018", date:"2026-10-18", name:"72º Cross Internacional Zornotza", place:"AMOREBIETA-ETXANO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-xxx-quijote-maraton-maraton-popular-adad-1018", date:"2026-10-18", name:"XXX Quijote Maratón Maratón Popular ADAD", place:"CIUDAD REAL", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xli-cross-del-aceite-1018", date:"2026-10-18", name:"XLI Cross del Aceite", place:"TORREDONJIMENO (JAÉN)", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-40-cross-de-la-constitucion-de-aranda-de-duer-1024", date:"2026-10-24", name:"40 Cross de la Constitución de Aranda de Duero", place:"ARANDA DE DUERO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-sub-20-por-clubes-1024", date:"2026-10-24", name:"Campeonato de España sub-20 por Clubes (24 oct–25 oct)", place:"A DESIGNAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-master-por-clubes-mixto-1025", date:"2026-10-25", name:"Campeonato de España Master por clubes mixto", place:"A DESIGNAR", type:"Pista Aire Libre", cat:"Nivel II"},
  {id:"rfea-y-medio-maraton-valencia-trinidad-alfonso-zuric-1025", date:"2026-10-25", name:"Medio Maratón Valencia Trinidad Alfonso Zurich", place:"VALENCIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxxi-carrera-popular-costa-de-ajo-1025", date:"2026-10-25", name:"XXXI Carrera Popular Costa de Ajo", place:"AJO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xlii-cross-nacional-castellano-manchego-villa-1025", date:"2026-10-25", name:"XLII Cross Nacional Castellano Manchego Villa de Quintanar", place:"QUINTANAR DE LA ORDEN", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-iv-edicion-21k-ciudad-de-huelva-1101", date:"2026-11-01", name:"IV Edición 21K Ciudad de Huelva", place:"HUELVA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-ix-cross-ponte-romana-2026-1101", date:"2026-11-01", name:"IX Cross Ponte Romana 2026", place:"LUGO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-70o-cross-internacional-de-san-sebastian-1101", date:"2026-11-01", name:"70º Cross Internacional de San Sebastián", place:"SAN SEBASTIÁN", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-38-marcha-atletica-en-ruta-espada-toledana-1107", date:"2026-11-07", name:"38 Marcha Atlética en ruta Espada Toledana", place:"TOLEDO", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-xliv-cross-internacional-de-italica-1108", date:"2026-11-08", name:"XLIV Cross Internacional de Itálica", place:"SEVILLA", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-vii-gran-carrera-del-mediterraneo-21k-alicant-1108", date:"2026-11-08", name:"VII Gran Carrera del Mediterráneo 21K Alicante-Santa Pola", place:"ALICANTE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xii-media-maraton-avila-monumental-y-iv-carre-1108", date:"2026-11-08", name:"XII Media Maratón Ávila Monumental y IV Carrera Ágora Brokers", place:"AVILA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-47-cross-nacional-espada-toledana-1108", date:"2026-11-08", name:"47 Cross Nacional Espada Toledana", place:"TOLEDO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-generali-maraton-malaga-1108", date:"2026-11-08", name:"Generali Maratón Málaga", place:"MALAGA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-ii-carrera-superfast-innoporc-5k-1108", date:"2026-11-08", name:"II Carrera SuperFast Innoporc 5k", place:"SEGOVIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxxviii-media-maraton-ciudad-de-talavera-1108", date:"2026-11-08", name:"XXXVIII Media Maratón Ciudad de Talavera", place:"TALAVERA DE LA REINA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-5-km-master-1115", date:"2026-11-15", name:"Campeonato de España 5 km Master", place:"NEGREIRA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxxii-cross-internacional-de-soria-1115", date:"2026-11-15", name:"XXXII Cross Internacional de Soria", place:"SORIA", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-xlv-carreira-internacional-a-clasica-negreira-1115", date:"2026-11-15", name:"XLV Carreira Internacional A Clásica Negreira", place:"NEGREIRA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xii-media-maraton-de-tenerife-1115", date:"2026-11-15", name:"XII Media Maratón de Tenerife", place:"TENERIFE", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-media-maraton-ciudad-de-jaen-y-10k-en-memoria-1115", date:"2026-11-15", name:"Media Maratón Ciudad de Jaén y 10K en memoria de Paco Manzaneda", place:"JAÉN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xli-edicion-cross-nacional-llodio-1115", date:"2026-11-15", name:"XLI Edición Cross Nacional Llodio", place:"LAUDIO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-cristo-o-barco-2026-1118", date:"2026-11-18", name:"Cristo O Barco 2026", place:"O BARCO DE VALDEORRAS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-ultra-de-gredos-1119", date:"2026-11-19", name:"Ultra de Gredos", place:"NAVARREDONDA DE GREDOS", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-10-kilometros-villa-de-ribadesella-1119", date:"2026-11-19", name:"10 Kilómetros Villa de Ribadesella", place:"RIBADESELLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-vi-reunion-nacional-de-marcha-atletica-villa--1121", date:"2026-11-21", name:"VI Reunión Nacional de Marcha Atlética Villa de Valverde - Isla de El Hierro", place:"EL HIERRO", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-benidorm-half-1121", date:"2026-11-21", name:"Benidorm Half", place:"BENIDORM", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xviii-media-maraton-gran-canaria-memorial-alc-1121", date:"2026-11-21", name:"XVIII Media Maratón Gran Canaria Memorial Alcalde Camilo Sánchez 2026", place:"VECINDARIO", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-xxii-cross-internacional-de-atapuerca-1121", date:"2026-11-21", name:"XXII Cross Internacional de Atapuerca (21 nov–22 nov)", place:"BURGOS", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-47o-zurich-maraton-de-san-sebastian-1122", date:"2026-11-22", name:"47º Zurich Maratón de San Sebastián", place:"SAN SEBASTIAN", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-campo-a-traves-por-cl-1122", date:"2026-11-22", name:"Campeonato de España de Campo a Través por Clubes", place:"ATAPUERCA", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-sub-16-po-1128", date:"2026-11-28", name:"Campeonato de España de Short Track sub-16 por Clubes (28 nov–29 nov)", place:"A DESIGNAR", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-3-dias-trail-ibiza-ultra-ibiza-1128", date:"2026-11-28", name:"3 días Trail Ibiza - Ultra Ibiza", place:"IBIZA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-cic-alcobendas-comunidad-de-madrid-memorial-a-1129", date:"2026-11-29", name:"CIC Alcobendas-Comunidad de Madrid - Memorial Antonio Rodríguez Benavente", place:"ALCOBENDAS", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-2a-maraton-internacional-cross-jean-bouin-1129", date:"2026-11-29", name:"2ª Maratón Internacional Cross Jean Bouin", place:"BARCELONA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-3-dias-trail-ibiza-ultra-ibiza-1130", date:"2026-11-30", name:"3 días Trail Ibiza - Ultra Ibiza", place:"IBIZA", type:"Trail", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-master-po-1205", date:"2026-12-05", name:"Campeonato de España de Short Track Master por clubes (5 dic–6 dic)", place:"A DESIGNAR", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xlvii-memorial-belarmino-alonso-comesana-de-c-1206", date:"2026-12-06", name:"XLVII Memorial Belarmino Alonso Comesaña de Campo a Través", place:"VIGO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-maraton-valencia-trinidad-alfonso-zurich-1206", date:"2026-12-06", name:"Maratón Valencia Trinidad Alfonso Zurich", place:"VALENCIA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-liv-cross-nacional-ayuntamiento-de-cantimpalo-1208", date:"2026-12-08", name:"LIV Cross Nacional Ayuntamiento de Cantimpalos", place:"CANTIMPALOS", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-47-edicion-media-maraton-sevilla-los-palacios-1213", date:"2026-12-13", name:"47 Edición Media Maratón Sevilla Los Palacios", place:"SEVILLA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-marcha-de-invierno-de-1213", date:"2026-12-13", name:"Campeonato de España de Marcha de Invierno de Promoción", place:"CASTRO URDIALES", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-10-km-marcha-master-1213", date:"2026-12-13", name:"Campeonato de España 10 km marcha Master", place:"CASTRO URDIALES", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-viii-cross-nacional-aniversario-alcala-patrim-1213", date:"2026-12-13", name:"VIII Cross Nacional Aniversario Alcalá Patrimonio Mundial", place:"ALCALÁ DE HENARES", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-x-gran-premio-de-marcha-ciudad-de-castro-urdi-1213", date:"2026-12-13", name:"X Gran Premio de Marcha Ciudad de Castro-Urdiales", place:"CASTRO URDIALES", type:"Marcha", cat:"Nivel II"},
  {id:"rfea-y-campeonato-de-espana-de-short-track-sub-20-po-1219", date:"2026-12-19", name:"Campeonato de España de Short Track sub-20 por Clubes - Trofeo Antonio Ferrer", place:"A DESIGNAR", type:"Short Track", cat:"Nivel II"},
  {id:"rfea-y-xlvi-cross-internacional-de-venta-de-banos-1220", date:"2026-12-20", name:"XLVI Cross Internacional de Venta de Baños", place:"VENTA DE BAÑOS", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-lxii-urbana-internacional-iurreta-10k-1220", date:"2026-12-20", name:"LXII Urbana Internacional Iurreta 10K", place:"IURRETA", type:"Internacional", cat:"Nivel II"},
  {id:"rfea-y-amurrioko-viii-nazioarteko-krosa-memorial-ram-1227", date:"2026-12-27", name:"Amurrioko VIII Nazioarteko Krosa - Memorial Ramón Gil", place:"GALDAKAO", type:"Cross", cat:"Nivel II"},
  {id:"rfea-y-lxii-nationale-nederlanden-san-silvestre-vall-1227", date:"2026-12-27", name:"LXII Nationale-Nederlanden San Silvestre Vallecana", place:"MADRID", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-san-silvestre-eldense-1227", date:"2026-12-27", name:"San Silvestre Eldense", place:"ELDA", type:"Ruta", cat:"Nivel II"},
  {id:"rfea-y-b100-cursa-dels-nassos-1227", date:"2026-12-27", name:"B100 Cursa dels Nassos", place:"BARCELONA", type:"Ruta", cat:"Nivel II"},
];

// "En directo" reformulado: sin feed de marcas en vivo (no existe API pública),
// se muestran hechos reales y verificados sobre las citas en curso o inminentes.
const LIVE = [
];

// Dónde ver cada competición — información real confirmada donde existe;
// para el resto, indicación honesta de los canales oficiales habituales de RFEA/WA/EA.
// Cuándo compite cada prueba — horario oficial de la final (hora española CEST),
// convertido de los timetables oficiales (World Athletics / European Athletics).
// Los resultados se marcan "Pendiente" porque las pruebas aún no se han disputado
// en el momento de generar esta página; RFEA y World Athletics/European Athletics
// publican los resultados oficiales una vez concluye cada final.
const SCHEDULE = {
  "mundial-sub20|100m Mujeres": "Ronda 1: mié 5 ago (DISPUTADA) — ambas eliminadas, no hay semifinal ni final para España en esta prueba",
  "mundial-sub20|200m Mujeres": "Ronda 1: vie 7 ago, 21:25 → Semifinal: sáb 8 ago, 03:55 (madrugada) → Final: dom 9 ago, 05:50 (madrugada)",
  "mundial-sub20|1.500m Mujeres": "Ronda 1: vie 7 ago, 04:05 (madrugada) → Final: dom 9 ago, 22:52",
  "mundial-sub20|3.000m Mujeres": "Final directa: dom 9 ago, 04:53 (madrugada)",
  "mundial-sub20|5.000m Mujeres": "Final directa: mié 5 ago, 04:53 (madrugada) — DISPUTADA",
  "mundial-sub20|100m Vallas Mujeres": "Ronda 1: vie 7 ago, 19:30 → Semifinal: sáb 8 ago, 02:15 (madrugada) → Final: dom 9 ago, 04:33 (madrugada)",
  "mundial-sub20|Altura Mujeres": "Clasificación: vie 7 ago, 20:05 → Final: dom 9 ago, 21:30",
  "mundial-sub20|Triple Salto Mujeres": "Clasificación: sáb 8 ago, 18:35 → Final: dom 9 ago, 22:14",
  "mundial-sub20|Peso Mujeres": "Clasificación: jue 6 ago, 19:00 (esta noche) → Final: jue 6 ago→vie 7, 04:40 (madrugada)",
  "mundial-sub20|Disco Mujeres": "Clasificación: mié 5 ago, 21:00 (disputada) → Final: jue 6 ago→vie 7, 03:00 (madrugada)",
  "mundial-sub20|5.000m Marcha Mujeres": "Final directa: sáb 8 ago, 18:30",
  "mundial-sub20|4x100m Mujeres": "Ronda 1: sáb 8 ago, 20:55 → Final: dom 9 ago, 22:05",
  "mundial-sub20|4x400m Mujeres": "Ronda 1: sáb 8 ago, 19:45 → Final: dom 9 ago, 23:42",
  "mundial-sub20|800m Hombres": "Ronda 1: mié 5 ago, 21:43 (DISPUTADA) → Semifinal: vie 7 ago, 03:30 (madrugada) → Final: sáb 8 ago→dom 9, 04:08 (madrugada)",
  "mundial-sub20|1.500m Hombres": "Ronda 1: vie 7 ago, 03:32 (madrugada, esta noche) → Final: dom 9 ago, 23:25",
  "mundial-sub20|3.000m Hombres": "Final directa: sáb 8 ago, 05:25 (madrugada)",
  "mundial-sub20|110m Vallas Hombres": "Ronda 1: vie 7 ago, 20:30 → Semifinal: sáb 8 ago, 02:40 (madrugada) → Final: dom 9 ago, 04:43 (madrugada)",
  "mundial-sub20|400m Vallas Hombres": "Ronda 1: jue 6 ago, 20:27 (esta noche) → Semifinal: dom 9 ago, 03:41 (madrugada) → Final: dom 9 ago, 22:40",
  "mundial-sub20|3.000m Obstáculos Hombres": "Ronda 1: jue 6 ago, 19:05 (esta noche) → Final: vie 7 ago→sáb 8, 04:42 (madrugada)",
  "mundial-sub20|Altura Hombres": "Clasificación: jue 6 ago, 20:05 (esta noche) → Final: sáb 8 ago→dom 9, 03:10 (madrugada)",
  "mundial-sub20|Pértiga Hombres": "Clasificación: jue 6 ago, 21:05 (esta noche) → Final: dom 9 ago, 21:15",
  "mundial-sub20|Longitud Hombres": "Clasificación: vie 7 ago, 21:43 → Final: sáb 8 ago→dom 9, 04:25 (madrugada)",
  "mundial-sub20|Triple Salto Hombres": "Clasificación: jue 6 ago, 21:00 (esta noche) → Final: vie 7 ago→sáb 8, 03:25 (madrugada)",
  "mundial-sub20|Martillo Hombres": "Clasificación: mié 5 ago, 19:45 (disputada) → Final: vie 7 ago→sáb 8, 02:05 (madrugada)",
  "mundial-sub20|5.000m Marcha Hombres": "Final directa: sáb 8 ago, 19:10",
  "mundial-sub20|4x400m Hombres": "Ronda 1: sáb 8 ago, 20:20 → Final: dom 9 ago, 23:55",
  "mundial-sub20|4x100m Mixto": "Ronda 1: jue 6 ago, 21:27 (esta noche) → Final: sáb 8 ago→dom 9, 03:05 (madrugada)",
  "mundial-sub20|4x400m Mixto": "Ronda 1: mié 5 ago, 19:22 (DISPUTADA) → Final: mié 5→jue 6, 05:50 (madrugada) — DISPUTADA",

  "europeo-birmingham|100m Mujeres": "Final: lun 10 ago, 22:50",
  "europeo-birmingham|200m Mujeres": "Final: jue 13 ago, 22:50",
  "europeo-birmingham|400m Mujeres": "Final: sáb 15 ago, 21:10",
  "europeo-birmingham|800m Mujeres": "Final: vie 14 ago, 22:46",
  "europeo-birmingham|5.000m Mujeres": "Final: mar 11 ago, 20:25",
  "europeo-birmingham|10.000m Mujeres": "Final: vie 14 ago, 20:45",
  "europeo-birmingham|Maratón Mujeres": "dom 16 ago, 08:30",
  "europeo-birmingham|100m Vallas Mujeres": "Final: mar 11 ago, 22:30",
  "europeo-birmingham|400m Vallas Mujeres": "Final: mié 12 ago, 22:08",
  "europeo-birmingham|3.000m Obstáculos Mujeres": "Final: jue 13 ago, 21:29",
  "europeo-birmingham|Altura Mujeres": "Final: sáb 15 ago, 21:07",
  "europeo-birmingham|Pértiga Mujeres": "Final: jue 13 ago, 20:50",
  "europeo-birmingham|Longitud Mujeres": "Final: dom 16 ago, 21:05",
  "europeo-birmingham|Peso Mujeres": "Final: lun 10 ago, 20:03",
  "europeo-birmingham|Disco Mujeres": "Final: vie 14 ago, 21:30",
  "europeo-birmingham|Martillo Mujeres": "Final: mié 12 ago, 20:45",
  "europeo-birmingham|Jabalina Mujeres": "Final: dom 16 ago, 20:30",
  "europeo-birmingham|Heptatlón Mujeres": "Final (800m): sáb 15 ago, 20:45",
  "europeo-birmingham|4x100m y 4x100m mixto Mujeres": "Final: sáb 15 ago, 22:48",
  "europeo-birmingham|4x400m y 4x400m mixto Mujeres": "Final: dom 16 ago, 22:33",
  "europeo-birmingham|Media Maratón Marcha Mujeres": "sáb 15 ago, 08:35",
  "europeo-birmingham|Maratón Marcha Mujeres": "sáb 15 ago, 08:50",
  "europeo-birmingham|100m Hombres": "Final: mar 11 ago, 22:47",
  "europeo-birmingham|200m Hombres": "Final: vie 14 ago, 22:25",
  "europeo-birmingham|400m Hombres": "Final: mié 12 ago, 21:50",
  "europeo-birmingham|800m Hombres": "Final: jue 13 ago, 22:28",
  "europeo-birmingham|1.500m Hombres": "Final: sáb 15 ago, 22:07",
  "europeo-birmingham|10.000m Hombres": "Final: sáb 15 ago, 21:25",
  "europeo-birmingham|Maratón Hombres": "dom 16 ago, 09:10",
  "europeo-birmingham|110m Vallas Hombres": "Final: mié 12 ago, 22:47",
  "europeo-birmingham|400m Vallas Hombres": "Final: vie 14 ago, 21:40",
  "europeo-birmingham|3.000m Obstáculos Hombres": "Final: dom 16 ago, 21:50",
  "europeo-birmingham|Longitud Hombres": "Final: mar 11 ago, 21:16",
  "europeo-birmingham|Disco Hombres": "Final: jue 13 ago, 21:45",
  "europeo-birmingham|Jabalina Hombres": "Final: sáb 15 ago, 21:01",
  "europeo-birmingham|4x100m y 4x100m mixto Hombres": "Final: sáb 15 ago, 22:33",
  "europeo-birmingham|4x400m y 4x400m mixto Hombres": "Final: dom 16 ago, 22:48",
  "europeo-birmingham|Media Maratón Marcha Hombres": "sáb 15 ago, 08:30",
  "europeo-birmingham|Maratón Marcha Hombres": "sáb 15 ago, 08:45",
};

function getSchedule(compId, eventName){
  return SCHEDULE[compId + "|" + eventName] || "Por confirmar";
}

const WATCH = {
  "mundial-sub20": {
    channel:"World Athletics+ (streaming gratuito internacional)",
    note:"Retransmisión oficial por los canales de World Athletics. RFEA publica resultados y noticias en directo en atletismorfea.es/atletismo-plus."
  },
  "europeo-birmingham": {
    channel:"RTVE: Teledeporte y RTVE Play (España)",
    note:"Retransmisión en abierto confirmada por RTVE. A nivel internacional, streaming oficial de European Athletics."
  },
};

function getWatchInfo(calId){
  if(calId.startsWith("dl-")){
    return {
      channel:"Movistar Plus+: Vamos y Vamos 2 (España)",
      note:"Confirmado en diamondleague.com. A nivel internacional también en el canal de YouTube y Facebook de Wanda Diamond League."
    };
  }
  const auto = CALENDAR.find(c=>c.id===calId);
  if(!WATCH[calId] && auto && auto.links && auto.links.streaming){
    return {channel:`<a href="${esc(auto.links.streaming)}" target="_blank" rel="noopener">Streaming oficial</a>`, note:""};
  }
  return WATCH[calId] || {
    channel:"No hay streaming",
    note:""
  };
}

// ===================== LISTA DE SALIDA COMPLETA DEL EUROPEO DE BIRMINGHAM =====================
// Fuente: European Athletics — "Final Entries - Athletes List by event" (PDF oficial, 31/07/2026).
// 1.645 atletas de 49 países, las 49 pruebas. Aportado directamente por el usuario.
const EURO_EVENT_META = {
  "100 Metres Men": {group:"Hombres", label:"100 m"},
  "200 Metres Men": {group:"Hombres", label:"200 m"},
  "400 Metres Men": {group:"Hombres", label:"400 m"},
  "800 Metres Men": {group:"Hombres", label:"800 m"},
  "1500 Metres Men": {group:"Hombres", label:"1.500 m"},
  "5000 Metres Men": {group:"Hombres", label:"5.000 m"},
  "10,000 Metres Men": {group:"Hombres", label:"10.000 m"},
  "Marathon Men": {group:"Hombres", label:"Maratón"},
  "3000 Metres Steeplechase Men": {group:"Hombres", label:"3.000 m Obstáculos"},
  "110 Metres Hurdles Men": {group:"Hombres", label:"110 m Vallas"},
  "400 Metres Hurdles Men": {group:"Hombres", label:"400 m Vallas"},
  "High Jump Men": {group:"Hombres", label:"Altura"},
  "Pole Vault Men": {group:"Hombres", label:"Pértiga"},
  "Long Jump Men": {group:"Hombres", label:"Longitud"},
  "Triple Jump Men": {group:"Hombres", label:"Triple Salto"},
  "Shot Put Men": {group:"Hombres", label:"Peso"},
  "Discus Throw Men": {group:"Hombres", label:"Disco"},
  "Hammer Throw Men": {group:"Hombres", label:"Martillo"},
  "Javelin Throw Men": {group:"Hombres", label:"Jabalina"},
  "Decathlon Men": {group:"Hombres", label:"Decatlón"},
  "Half Marathon Race Walk Men": {group:"Hombres", label:"Media Maratón Marcha"},
  "4x100 Metres Relay Men": {group:"Hombres", label:"4x100 m Relevos"},
  "Marathon Race Walk Men": {group:"Hombres", label:"Maratón Marcha"},
  "4x400 Metres Relay Men": {group:"Hombres", label:"4x400 m Relevos"},
  "100 Metres Women": {group:"Mujeres", label:"100 m"},
  "200 Metres Women": {group:"Mujeres", label:"200 m"},
  "400 Metres Women": {group:"Mujeres", label:"400 m"},
  "800 Metres Women": {group:"Mujeres", label:"800 m"},
  "1500 Metres Women": {group:"Mujeres", label:"1.500 m"},
  "5000 Metres Women": {group:"Mujeres", label:"5.000 m"},
  "10,000 Metres Women": {group:"Mujeres", label:"10.000 m"},
  "Marathon Women": {group:"Mujeres", label:"Maratón"},
  "3000 Metres Steeplechase Women": {group:"Mujeres", label:"3.000 m Obstáculos"},
  "100 Metres Hurdles Women": {group:"Mujeres", label:"100 m Vallas"},
  "400 Metres Hurdles Women": {group:"Mujeres", label:"400 m Vallas"},
  "High Jump Women": {group:"Mujeres", label:"Altura"},
  "Pole Vault Women": {group:"Mujeres", label:"Pértiga"},
  "Long Jump Women": {group:"Mujeres", label:"Longitud"},
  "Triple Jump Women": {group:"Mujeres", label:"Triple Salto"},
  "Shot Put Women": {group:"Mujeres", label:"Peso"},
  "Discus Throw Women": {group:"Mujeres", label:"Disco"},
  "Hammer Throw Women": {group:"Mujeres", label:"Martillo"},
  "Javelin Throw Women": {group:"Mujeres", label:"Jabalina"},
  "Heptathlon Women": {group:"Mujeres", label:"Heptatlón"},
  "Half Marathon Race Walk Women": {group:"Mujeres", label:"Media Maratón Marcha"},
  "Marathon Race Walk Women": {group:"Mujeres", label:"Maratón Marcha"},
  "4x100 Metres Relay Women": {group:"Mujeres", label:"4x100 m Relevos"},
  "4x400 Metres Relay Women": {group:"Mujeres", label:"4x400 m Relevos"},
  "4x100 Metres Relay Mixed Mixed": {group:"Mixto", label:"4x100 m Relevos"},
  "4x400 Metres Relay Mixed Mixed": {group:"Mixto", label:"4x400 m Relevos"},
};

const EURO_STARTLISTS = {
  "100 Metres Men": [
    ["AUT","FUCHS Markus","10.08","10.32"],
    ["BEL","BOTTERMAN Emiel","10.25","10.25"],
    ["BEL","SNYDERS Antoine","10.20","10.20"],
    ["BEL","VERHERSTRAETEN Simon","10.06",""],
    ["BUL","ILIEV Hristo","10.22","10.22"],
    ["DEN","HANSEN Simon","10.11","10.19"],
    ["ESP","CRESPI Guillem","10.18","10.19"],
    ["ESP","HERNÁNDEZ Jorge","10.22","10.22"],
    ["ESP","JORDAN Abel","10.10","10.10"],
    ["EST","SAI Henri","10.32","10.32"],
    ["FIN","ILLUKKA Riku","10.21","10.21"],
    ["GBR","AZU Jeremiah","9.97","10.00"],
    ["GBR","GLAVE Romell","9.97","9.97"],
    ["GBR","HINCHLIFFE Louie","9.95","10.01"],
    ["GBR","JONES Elliot","10.04","10.09"],
    ["GBR","WALSH Nicholas","10.06","10.09"],
    ["GER","ANSAH Owen","9.98","9.98"],
    ["GER","ANSAH-PEPRAH Lucas","10.00","10.15"],
    ["GER","GUSSMANN Heiko","10.06","10.06"],
    ["GER","WOLF Yannick","10.05","10.13"],
    ["HUN","ILLOVSZKY Dominik","10.25","10.33"],
    ["IRL","AKINOLA Toluwabori","10.19","10.19"],
    ["IRL","OLATUNDE Israel","10.08","10.41"],
    ["ITA","ALI Chituru","9.96","10.09"],
    ["ITA","CECCARELLI Samuele","10.13","10.20"],
    ["ITA","JACOBS Lamont Marcell","9.80","9.96"],
    ["ITA","RANDAZZO Filippo","10.23","10.30"],
    ["LTU","DAMBRAUSKAS Adas","10.26","10.26"],
    ["NED","AFRIFA Elvis","10.06","10.06"],
    ["NED","BURNET Taymir","10.08","10.08"],
    ["NOR","FREMSTAD-WALDRON Per Tinius","10.32","10.33"],
    ["POL","KOPEĆ Dominik","10.05","10.08"],
    ["POR","SANTOS Delvis","10.07","10.24"],
    ["SLO","ČURIN PRAPOTNIK Anej","10.09","10.09"],
    ["SMR","SANSOVINI Francesco","10.41","10.62"],
    ["SUI","MUMENTHALER Timothé","10.13","10.19"],
    ["SVK","VOLKO Ján","10.13","10.24"],
    ["SWE","LARSSON Henrik","10.08","10.26"],
    ["TUR","ÖZER Kayhan","10.17","10.28"],
    ["TUR","ÖZKAN Ertan","10.27","10.29"],
  ],
  "200 Metres Men": [
    ["BEL","SNYDERS Antoine","20.24","20.24"],
    ["CRO","MARCIUŠ Karlo","20.57","21.07 sh"],
    ["CZE","MACÍK Ondřej","20.39","20.65"],
    ["ESP","SANCHEZ Oriol","20.68","20.68"],
    ["EST","SAI Henri","20.69","20.69"],
    ["FIN","ILLUKKA Riku","20.43","20.43"],
    ["GBR","HUGHES Zharnel","19.73","20.04"],
    ["GBR","MITCHELL-BLAKE Nethaneel","19.95","20.35"],
    ["GBR","NWOKEJI Ebuka","20.55","20.55"],
    ["GER","ANSAH Owen","20.13","20.13"],
    ["GER","ANSAH-PEPRAH Lucas","20.43","20.50"],
    ["GER","HARTMANN Joshua","20.02","20.43"],
    ["GER","HORTON Kameron","20.29","20.29"],
    ["GRE","GKARAGKANIS Sotirios","20.66","20.69"],
    ["GRE","MYRIANTHOPOULOS Vasileios","20.62","20.62"],
    ["IRL","AIGBOBOH Sean","20.27","20.27"],
    ["IRL","LAWLER Marcus","20.40","20.79"],
    ["ISR","ARAD Gal","20.63","20.63"],
    ["ITA","DESALU Eseosa Fostine","20.08","20.11"],
    ["ITA","DEZZA Filippo","20.48","20.48"],
    ["ITA","LONGOBARDI Eduardo","20.53","20.61"],
    ["LAT","GRAVA Oskars","20.49","20.49"],
    ["LTU","TRUSKAUSKAS Gediminas","20.48","20.59"],
    ["NOR","KULSENG Andreas Ofstad","20.53","20.53"],
    ["NOR","TIJANI-AJAYI Kenny Emi","20.71","20.71"],
    ["POR","SANTOS Delvis","20.45","20.45"],
    ["SRB","BAŠIĆ PALKOVIĆ Darijo","20.75","20.75"],
    ["SUI","MUMENTHALER Timothé","20.27","20.31"],
    ["SUI","REAIS William","20.24","20.37"],
    ["SUI","SVENSSON Felix","20.30","20.78"],
    ["SVK","VOLKO Ján","20.24","20.81"],
    ["SWE","ERIKSSON Zion","20.68 sh","20.68 sh"],
    ["SWE","ERLANDSSON Erik","20.43 sh","20.67"],
    ["SWE","LARSSON Henrik","20.32","20.44"],
    ["SWE","PIHL Linus","20.69","20.69"],
    ["TUR","ENÇÜ Kubilay","20.79","20.79"],
    ["TUR","KARTAL Deniz Kaan","20.67","20.67"],
    ["TUR","UYAR Oğuz","20.33","20.33"],
  ],
  "400 Metres Men": [
    ["ALB","BURRAJ Franko","45.85","45.85"],
    ["BEL","BORLÉE Dylan","44.94","45.49"],
    ["BEL","SACOOR Jonathan","44.98","45.03"],
    ["BEL","SEGERS Daniel","44.63","44.81"],
    ["DEN","NIELSEN Gustav Lundholm","45.41","45.57"],
    ["ESP","GONZÁLEZ Ángel","45.53","45.53"],
    ["FRA","KOUNTA Muhammad Abdallah","44.55","44.55"],
    ["FRA","SPILLMANN Yann","44.92","44.92"],
    ["FRA","VESSAT Samuel","44.24","44.24"],
    ["GBR","DOBSON Charles","44.14","44.69"],
    ["GBR","HUDSON-SMITH Matthew","43.44","44.09"],
    ["GBR","JEFFERIES Ben","44.66","44.66"],
    ["GBR","LUNT Sam","45.16","45.16"],
    ["GBR","YOUNG Brodie","45.24","45.24"],
    ["GER","BREDAU Jean Paul","44.72","44.72"],
    ["GER","FINKE Thorben","45.08","45.08"],
    ["GRE","FRANKS George John","44.88","44.88"],
    ["HUN","ENYINGI Patrik Simon","44.84","45.27"],
    ["HUN","MOLNÁR Attila","44.47","44.47"],
    ["IRL","RAFTERY Jack","44.98","45.88"],
    ["ITA","BENATI Lorenzo","45.21","45.21"],
    ["ITA","SCOTTI Edoardo","44.45","44.96"],
    ["ITA","SITO Luca","44.75","45.39"],
    ["ITA","SOUDASSI Mohamed","45.10","45.10"],
    ["NED","OMALLA Eugene","45.03","45.03"],
    ["NED","PHIJFFERS Jonas","44.71","44.72"],
    ["NOR","INGVALDSEN Håvard Bentdal","44.39","45.86"],
    ["POL","SZWED Maksymilian","44.94","44.94"],
    ["POR","COELHO João","44.79","45.64"],
    ["POR","ELKHATIB Omar","45.42","45.45"],
    ["POR","TAVARES Ericsson","45.63","45.63"],
    ["ROU","DRINGO Mihai Sorin","44.74","45.57"],
    ["SLO","FERLAN Rok","44.70","45.78"],
    ["SLO","MESEC KOŠIR Lovro","45.78","45.78"],
    ["SUI","BROTSCHI Haydn","45.20","45.20"],
    ["SUI","PETRUCCIANI Ricky","45.02","45.65"],
    ["SUI","SPITZ Lionel","45.01","45.34"],
    ["TUR","ENÇÜ Kubilay","45.27","45.27"],
    ["UKR","POHORILKO Oleksandr","44.81","45.76"],
  ],
  "800 Metres Men": [
    ["BEL","CRESTAN Eliott","1:42.43","1:43.83 sh"],
    ["CRO","BLOUDEK Marino","1:44.01","1:44.63"],
    ["CZE","DUDYCHA Jakub","1:44.48","1:44.79"],
    ["ESP","ATTAOUI Mohamed","1:42.04","1:44.28"],
    ["ESP","BARROSO David","1:43.60","1:43.60"],
    ["ESP","SÁNCHEZ-VALLADARES Pablo","1:44.46","1:45.13"],
    ["FRA","LE CLEZIO Corentin","1:44.25","1:44.67"],
    ["FRA","MEZIANE Yanis","1:43.71","1:43.96"],
    ["FRA","OUERRAT Louey","1:43.80","1:43.80"],
    ["FRA","TERRASSE Jordan","1:44.39","1:44.39"],
    ["FRA","TUAL Gabriel","1:41.61","1:43.66"],
    ["GBR","BOTTERILL Alex","1:44.16","1:44.16"],
    ["GBR","BURGIN Max","1:42.29","1:42.98"],
    ["GBR","HIGGINS Jack","1:44.81","1:44.81"],
    ["GBR","PATTISON Ben","1:42.27","1:43.34"],
    ["GER","STEPANOV Alexander","1:44.17","1:45.13"],
    ["IRL","ENGLISH Mark","1:42.97","1:42.97"],
    ["IRL","MCPHILLIPS Cian","1:42.15","1:43.97"],
    ["ITA","LAZZARO Giovanni","1:44.59","1:44.59"],
    ["ITA","PERNICI Francesco","1:43.60","1:43.60"],
    ["ITA","TECUCEANU Catalin","1:43.75","1:45.59"],
    ["KOS","THAQI Leon","1:49.64","1:49.64"],
    ["MLT","MICALLEF Jared","1:46.08","1:46.93"],
    ["NED","CLARKE Ryan","1:44.70","1:44.72 sh"],
    ["NED","VAN DIEPEN Tony","1:44.14","1:45.36"],
    ["NOR","GRØNSTAD Tobias","1:43.61","1:43.61"],
    ["POL","KITLIŃSKI Bartosz","1:44.56","1:44.56"],
    ["POL","OSTROWSKI Filip","1:44.25","1:44.68 sh"],
    ["POL","WYDERKA Maciej","1:43.97","1:43.97"],
    ["SLO","VUKOVIČ Jan","1:45.85","1:46.11"],
    ["SUI","PELIZZA Ivan","1:44.53","1:45.91"],
    ["SUI","WIPFLI Ramon","1:44.71","1:44.71"],
    ["SWE","KRAMER Andreas","1:43.13","1:48.14"],
    ["TUR","BOZDAĞ Ömer Faruk","1:45.14","1:45.14"],
  ],
  "1500 Metres Men": [
    ["ARM","MKRTCHYAN Yervand","3:37.80","3:37.80"],
    ["AUT","PALLITSCH Raphael","3:32.96","3:33.41"],
    ["BEL","SISK Pieter","3:31.85","3:33.32 sh"],
    ["BEL","VERHEYDEN Ruben","3:30.99","3:32.38"],
    ["BEL","VERMEULEN Jochem","3:31.74","3:33.71 sh"],
    ["ESP","BEN Adrián","3:31.70","3:32.66"],
    ["ESP","FONTES Ignacio","3:32.55","3:33.42"],
    ["ESP","GARCÍA Mariano","3:35.53 sh","3:35.53 sh"],
    ["ESP","SAEZ Carlos","3:32.28","3:33.63"],
    ["ESP","SEGUROLA Martín","3:33.81","3:33.81"],
    ["FRA","ANSELMINI Paul","3:31.36","3:31.36"],
    ["FRA","HABZ Azeddine","3:27.49","3:29.80"],
    ["FRA","LE GRIX Titouan","3:31.46","3:31.46"],
    ["FRA","MORNET Romain","3:31.62","3:32.08"],
    ["GBR","HEYWARD Jake","3:31.08","3:31.81"],
    ["GBR","KEEN Thomas","3:32.94","3:32.94"],
    ["GBR","LUDEWICK Arlo","3:32.92","3:32.92"],
    ["GBR","WIGHTMAN Jake","3:29.23","3:29.95"],
    ["GER","FARKEN Robert","3:30.09","3:30.09"],
    ["GER","TORTELL Marc","3:33.69","3:33.76"],
    ["IRL","COSCORAN Andrew","3:30.42","3:31.65"],
    ["IRL","DOYLE Cathal","3:32.15","3:33.52"],
    ["ISR","IVRI Matan","3:34.51","3:34.51"],
    ["ITA","ARESE Pietro","3:30.74","3:31.87"],
    ["ITA","BUSSOTTI NEVES Joao","3:33.08","3:34.98"],
    ["NED","CHAPPLE Samuel","3:31.65","3:32.68 sh"],
    ["NED","NILLESSEN Stefan","3:29.23","3:32.45"],
    ["NOR","FJELD HALVORSEN Andreas","3:34.33","3:35.08"],
    ["NOR","NORDÅS Narve Gilje","3:29.47","3:31.74"],
    ["POL","OSTROWSKI Filip","3:35.47","3:35.47"],
    ["POR","NADER Isaac","3:29.37","3:30.43"],
    ["POR","PEREIRA Nuno","3:32.16","3:35.31"],
    ["POR","PINTO José Carlos","3:31.47","3:31.47"],
    ["SWE","PIHLSTRÖM Samuel","3:30.87","3:33.47 sh"],
    ["TUR","TEKSÖZ Salih","3:34.49","3:34.49"],
  ],
  "5000 Metres Men": [
    ["BEL","KIMELI Isaac","12:56.53","13:13.17"],
    ["DEN","LILLESØ Joel Ibler","13:14.98","13:22.77"],
    ["FIN","HEIKKILÄ Tuomas","13:25.85","13:25.85"],
    ["FRA","DAGUINOS Etienne","12:55.76","13:01.92"],
    ["FRA","GRESSIER Jimmy","12:51.59","12:57.79"],
    ["GBR","WEST James","13:09.07","13:23.49"],
    ["GER","ABDILAAHI Mohamed","12:53.63","12:57.90"],
    ["GER","BREMM Florian","12:56.80","12:56.80"],
    ["IRL","FAY Brian","13:01.40","13:13.30"],
    ["IRL","GRIGGS Nicholas","13:05.75","13:16.19"],
    ["IRL","MCELHINNEY Darragh","13:02.06","13:15.90"],
    ["ITA","GUERRA Francesco","13:24.65","13:24.65"],
    ["ITA","MAGGI Konjoneh","13:24.05","13:24.05"],
    ["ITA","PAROLINI Sebastiano","13:25.71","13:34.63"],
    ["LTU","BERTAŠIUS Simas","13:25.92","13:25.92"],
    ["NED","ABDI ALI Mahadi","13:04.05","13:22.34"],
    ["NED","FOPPEN Mike","13:02.43","13:19.47"],
    ["NED","VERBAANDERT Tim","13:06.14","13:13.34"],
    ["NOR","FJELD HALVORSEN Andreas","13:18.44","13:18.44"],
    ["NOR","INGEBRIGTSEN Filip","13:11.75","13:22.06"],
    ["NOR","INGEBRIGTSEN Jakob","12:48.45",""],
    ["NOR","MYHRE Magnus Tuv","13:06.98","13:32.08"],
    ["POR","PINTO José Carlos","12:59.75","12:59.75"],
    ["SUI","LOBALU Dominic Lokinyomo","12:50.87","12:52.54"],
  ],
  "10,000 Metres Men": [
    ["BEL","DEBOGNIES Simon","27:48.40","27:54.06"],
    ["BEL","KIMELI Isaac","27:07.97",""],
    ["ESP","OUKHELFEN Abdessamad","27:36.23",""],
    ["ESP","RAMOS Jesús","27:49.73","28:11.26"],
    ["FIN","MUUSE Mustafe","29:51.13",""],
    ["FRA","BEDARD Simon","27:42.72","27:44.72"],
    ["FRA","GRESSIER Jimmy","26:58.67",""],
    ["FRA","GUYON Baptiste","27:54.53","27:54.53"],
    ["GBR","BEATTIE Scott","27:23.20","27:23.20"],
    ["GBR","BUTCHART Andrew","27:36.77","28:16.75"],
    ["GBR","MULLARKEY David","27:26.58","27:26.58"],
    ["GBR","WIGFIELD Joseph","28:56.39","28:56.39"],
    ["GER","ABDILAAHI Mohamed","26:56.58","26:56.58"],
    ["IRL","O'LEARY Jack","28:23.64",""],
    ["ISL","MAGNUSSON Baldvin","28:57.17",""],
    ["ISR","CHEKOLE Dereje","28:11.38",""],
    ["ISR","MUCHIE Zemenu","28:52.43",""],
    ["ITA","CRIPPA Yemaneberhan","27:10.76","27:43.23"],
    ["ITA","GUERRA Francesco","28:22.07","29:25.86"],
    ["ITA","SELVAROLO Pasquale","28:00.03","28:00.03"],
    ["NED","ABDI ALI Mahadi","27:40.96","27:40.96"],
    ["NED","FOPPEN Mike","27:20.52","27:20.52"],
    ["NED","VERBAANDERT Tim","",""],
    ["NOR","MYHRE Magnus Tuv","28:02.18",""],
    ["SUI","LE GUEN Morgan","28:58.08",""],
    ["SUI","LOBALU Dominic Lokinyomo","27:36.29",""],
    ["SUI","RAESS Jonas","27:26.40",""],
    ["SWE","ALMGREN Andreas","26:52.87","28:49.73"],
  ],
  "Marathon Men": [
    ["AUT","VOJTA Andreas","2:13:43","2:15:07"],
    ["BEL","BIERINCKX Vincent","2:13:27",""],
    ["BEL","SEVENOIS Nathan","2:15:47",""],
    ["BEL","ZARADZKI Yohan","2:12:28","2:12:28"],
    ["DEN","DAHL Jacob","2:18:43","2:18:50"],
    ["DEN","OLESEN Martin Egebjerg","2:13:17","2:19:48"],
    ["ESP","BLANCO Jorge","2:09:27",""],
    ["ESP","CARRO Fernando","2:09:07",""],
    ["ESP","CHAKIR Ibrahim","2:07:21",""],
    ["ESP","FIFA Ilias","2:08:36","2:08:36"],
    ["ESP","GONZÁLEZ RIVERA Jorge","2:08:34",""],
    ["ESP","MAYO Carlos","2:08:53",""],
    ["EST","HUSSAR Karel","2:16:58","2:16:58"],
    ["EST","NURME Tiidrek","2:10:02",""],
    ["FRA","BOUR Felix","2:06:41",""],
    ["FRA","CHAHDI Hassan","2:07:30",""],
    ["FRA","GONDOUIN Valentin","2:07:54",""],
    ["FRA","ROUDOLFF Emmanuel","2:05:58","2:05:58"],
    ["GBR","CROSS Ellis","2:10:09","2:10:09"],
    ["GBR","GHEBRESILASIE Weynay","2:06:59","2:06:59"],
    ["GBR","MAHAMED Mahamed","2:06:14","2:06:14"],
    ["GBR","MELLOR Jonathan","2:08:45",""],
    ["GBR","MENGES Tewelde","2:10:00","2:10:48"],
    ["GER","BOCH Simon","2:08:55",""],
    ["GER","FITWI SIBHATU Samuel","2:04:45","2:04:45"],
    ["GER","HILLE Erik","2:12:09","2:12:22"],
    ["GER","PETROS Amanal","2:04:03","2:08:31"],
    ["GER","RINGER Richard","2:05:46",""],
    ["GER","THURLEY Tom","2:11:02","2:11:02"],
    ["GRE","STAMOULIS Georgios","2:16:06","2:22:07"],
    ["HUN","LOMB Ádám","2:12:48","2:12:48"],
    ["HUN","SZEMEREI Levente","2:10:43","2:12:34"],
    ["HUN","TARNAI László","2:23:52","2:30:58"],
    ["IRL","CREECH Ryan","2:09:39","2:09:39"],
    ["IRL","MCGLYNN David","2:11:01",""],
    ["IRL","O'DONNELL Paul","2:09:19","2:09:19"],
    ["ISL","ANDRÉSSON Hlynur","2:13:37","2:15:30"],
    ["ISR","ABUHAY Yitayew","2:07:26","2:09:35"],
    ["ISR","ALAME Haimro","2:06:04","2:12:57"],
    ["ISR","AYALE Gashau","2:04:53","2:06:52"],
    ["ISR","GETAHON Tadesse","2:07:15",""],
    ["ISR","MALEDE Bukayawe","2:07:38","2:07:38"],
    ["ISR","TEFERI Maru","2:04:44","2:06:46"],
    ["ITA","CHEVRIER Xavier","2:11:50","2:11:50"],
    ["ITA","JAAFARI Badr","2:09:58",""],
    ["ITA","MEUCCI Daniele","2:07:49",""],
    ["ITA","OUHDA Ahmed","2:08:37","2:08:37"],
    ["ITA","RIVA Pietro","2:06:46","2:06:46"],
    ["MKD","IVANOVSKI Dario","2:08:26","2:09:35"],
    ["NOR","LOMÅS Erik","2:13:57","2:22:12"],
    ["NOR","ØYGARD Eivind","2:16:36",""],
    ["NOR","PRESTSÆTER Sjur","2:13:45","2:13:45"],
    ["POR","COSTA Carlos","2:15:33","2:15:33"],
    ["ROU","SOARE Nicolae Alexandru","2:11:58",""],
    ["SUI","KYBURZ Matthias","2:06:48","2:08:37"],
    ["SUI","WÄGELI Patrik","2:12:01","2:12:01"],
    ["SWE","CASTEEL Archie","2:10:06","2:10:56"],
    ["SWE","CHALA Ebba Tulu","2:07:38","2:08:48"],
    ["SWE","HASSAN Suldan","2:05:57","2:07:22"],
    ["SWE","TESFAMARIAM Samuel Tsegay","2:06:51","2:06:51"],
    ["TUR","ÖZBILEN Kaan Kigen","2:04:16","2:05:59"],
  ],
  "3000 Metres Steeplechase Men": [
    ["AND","CARABAÑA Nahuel","8:12.80",""],
    ["AUT","RATTINGER Tobias","8:26.17","8:28.25"],
    ["BEL","SCHYNS Rémi","8:17.46","8:17.46"],
    ["BEL","VAN DE VELDE Tim","8:14.40","8:48.04"],
    ["CRO","BELČIĆ Bruno","8:39.25","8:40.05"],
    ["ESP","ARCE Daniel","8:08.45","8:11.42"],
    ["ESP","QUIJADA Alejandro","8:13.40","8:17.34"],
    ["FRA","BOUDY Pierre","8:18.65","8:18.65"],
    ["FRA","DARU Nicolas-Marie","8:10.69","8:11.81"],
    ["FRA","FOURMONT Baptiste","8:12.10","8:13.80"],
    ["FRA","MIELLET Alexis","8:12.89","8:21.91"],
    ["FRA","THEBAUD Oscar","8:17.40","8:17.40"],
    ["GBR","BATTERSHILL William","8:21.83","8:22.97"],
    ["GBR","IMROTH Kristian","8:18.97","8:18.97"],
    ["GBR","SEDDON Zak","8:15.66","8:23.99"],
    ["GER","BEBENDORF Karl","8:05.55","8:05.55"],
    ["GER","BUCHHOLZ Niklas","8:14.05","8:15.27"],
    ["GER","RUPPERT Frederik","7:57.80","7:57.80"],
    ["HUN","PALKOVITS István","8:18.74","8:32.21"],
    ["ITA","BOUIH Yassin","8:18.37","8:23.03"],
    ["ITA","ZOGHLAMI Ala","8:14.06","8:23.21"],
    ["ITA","ZOGHLAMI Osama","8:11.00","8:13.10"],
    ["LUX","QUERINJEAN Ruben","8:09.47","8:14.22"],
    ["NOR","BOUTERA Jacob","8:15.69",""],
    ["POL","BAJORSKI Adam","8:28.21","8:28.21"],
    ["POL","MEGIER Maciej","8:20.17","8:24.11"],
    ["POR","MONTEIRO Leandro","8:29.06","8:29.06"],
    ["POR","RODRIGUES Lourenço","8:21.99","8:21.99"],
    ["SUI","IRARRAGORRI Camilo","8:40.26","8:40.26"],
    ["SUI","LIEBL Aarno","8:23.61","8:23.61"],
    ["SWE","JOHANSSON Vidar","8:15.00","8:21.41"],
    ["SWE","MAGNUSSON Leo","8:13.08","8:23.54"],
    ["SWE","SUNDSTRÖM Simon","8:17.01","8:24.89"],
    ["TUR","ÖZCAN Cuma","8:27.65","8:27.65"],
    ["TUR","TUĞLUK Abdullah","8:26.88","8:32.07"],
  ],
  "110 Metres Hurdles Men": [
    ["AUT","DIESSL Enzo","13.17","13.25"],
    ["BEL","BACARI Elie","13.25","13.25"],
    ["BEL","VAN NEYGEN Zeno","13.43",""],
    ["CYP","TRAJKOVIC Milan","13.25","13.32"],
    ["CZE","KOLOMAZNÍK Jonáš","13.55","13.55"],
    ["CZE","ŠTEFKO Štěpán","13.55","13.55"],
    ["ESP","LLOPIS Enrique","13.09","13.31"],
    ["ESP","MARTÍNEZ Asier","13.14","13.27"],
    ["FIN","KUUSINIEMI Santeri","13.58","13.64"],
    ["FIN","LAKKA Elmo","13.31","13.69"],
    ["FIN","MANNINEN Ilari","13.69","13.69"],
    ["FRA","CINNA Erwann","13.27","13.29"],
    ["FRA","KWAOU-MATHEY Just","12.99","13.20"],
    ["FRA","PEDRE Theo","13.25","13.25"],
    ["FRA","WILKES Thomas","13.27","13.27"],
    ["GBR","BENNETT Samuel","13.30","13.30"],
    ["GBR","OJORA Tade","13.26","13.36"],
    ["GER","MINOUE Gregory","13.46","13.51"],
    ["GRE","ROUMTSIOS Christos-Panagiotis","13.75","13.75"],
    ["HUN","ESZES Dániel","13.56","13.86"],
    ["ISR","LAMDIEL Sagi","13.77","13.77"],
    ["ITA","MULAS Oliver","13.60","13.65"],
    ["NED","SOPHIA Matthew","13.28","13.28"],
    ["NED","VAN DER SCHAAF Liam","13.53","13.53"],
    ["NED","VAN HELLEMONDT Joas","13.39","13.39"],
    ["POL","CZYKIER Damian","13.25","13.44"],
    ["POL","SZYMAŃSKI Jakub","13.25","13.29"],
    ["POR","GOMES Edson","13.66","13.77"],
    ["ROU","ANTON Alin Ionuț","13.56","13.63"],
    ["SLO","DEMŠAR Filip Jakob","13.47","13.71"],
    ["SUI","JOSEPH Jason","13.07","13.24"],
    ["SUI","KÜCHLER Fabio","13.63","13.63"],
    ["SVK","DÁVID Peter","13.79","13.79"],
    ["TUR","SEVLER Mikdat","13.36","13.64"],
    ["UKR","BAHINSKYI Dmytro","13.62","13.62"],
    ["UKR","KUKOTA Oleh","13.80","13.80"],
  ],
  "400 Metres Hurdles Men": [
    ["AUT","KÖHLDORFER Leo","50.52","50.69"],
    ["AUT","STROHMAYER-DANGL Niklas","49.18","49.18"],
    ["BEL","WATRIN Julien","48.66","49.18"],
    ["DEN","MONNERET Sebastian","49.40","49.40"],
    ["ESP","DELGADO Jesús David","48.11","48.11"],
    ["ESP","LORENTE Javier","49.19","49.19"],
    ["FIN","HAAPALAINEN Jere","50.02","50.53"],
    ["FIN","LEHTONEN Tuomas","50.20","50.59"],
    ["FIN","SAINIO Antti","48.61","49.71"],
    ["FRA","DUCOS Clement","47.42","48.49"],
    ["GBR","CHALMERS Alastair","48.30","48.53"],
    ["GBR","DERBYSHIRE Seamus","48.42","48.71"],
    ["GBR","FAULDS Joshua","48.59","48.78"],
    ["GBR","MINSHULL Jake","48.53","48.53"],
    ["GER","AGYEKUM Emil","47.45","47.45"],
    ["GER","FISCHER-BREIHOLZ Owe","48.01","48.08"],
    ["GRE","LEVANTINOS Dimitris","50.26","50.26"],
    ["HUN","BÁNÓCZY Árpád","49.88","50.69"],
    ["HUN","MOLNÁR Csaba","49.89","50.10"],
    ["ISR","SHIFF Omri","49.82","50.69"],
    ["ITA","BERTONCELLI Giacomo","49.35","49.45"],
    ["ITA","SIBILIO Alessandro","47.50","48.49"],
    ["ITA","SOMMACAL Alessio","49.33","49.33"],
    ["NOR","WARHOLM Karsten","45.94","46.61"],
    ["POR","BARRIGANA Diogo","49.34","49.34"],
    ["POR","DE JESÚS Mikael Antonio","49.20","50.77"],
    ["SLO","GUČEK Matic Ian","48.16","48.16"],
    ["SLO","ZUBIN Mitja","49.85","49.85"],
    ["SRB","KATANIĆ Mihajlo","49.66","49.66"],
    ["SUI","BONVIN Julien","48.59","48.93"],
    ["SUI","BRAND Dany","48.96","49.44"],
    ["SVK","BALUCH Matej","49.34","49.34"],
    ["SVK","DÖMÖTÖR Patrik","48.94","49.41"],
    ["SWE","BENGTSTRÖM Carl","47.94","48.11"],
    ["SWE","EDLUND Oskar","48.26","48.26"],
    ["TUR","AKÇAM Berke","48.14","49.43"],
    ["TUR","NEZIR İsmail","48.25","48.25"],
  ],
  "High Jump Men": [
    ["BEL","CARMOY Thomas","2.29 i","2.15"],
    ["BEL","VERMEIREN Jef","2.27 i","2.24 i"],
    ["CYP","CHRYSOSTOMOU Loizos","2.19","2.19"],
    ["CZE","BAHNÍK Marek","2.26","2.24"],
    ["CZE","ČUDLÝ Matyáš","2.26","2.18"],
    ["CZE","ŠTEFELA Jan","2.33","2.32 i"],
    ["CZE","TOMÁŠEK Adam","2.20 i","2.20 i"],
    ["FIN","KOSONEN Daniel","2.24","2.18 i"],
    ["GBR","CLARKE-KHAN Joel","2.27","2.27"],
    ["GBR","JACK Kimani","2.31","2.31"],
    ["GER","POTYE Tobias","2.34","2.30"],
    ["GER","WENDRICH Falk","2.29","2.23"],
    ["GRE","MERLOS Antonios","2.27 i","2.27 i"],
    ["GRE","MITA Antrea","2.26 i","2.26"],
    ["ISR","KAPITOLNIK Jonathan","2.31","2.23"],
    ["ITA","FALOCCHI Christian","2.30 i","2.30 i"],
    ["ITA","LANDO Manuel","2.26 i","2.24"],
    ["ITA","SIOLI Matteo","2.30","2.30"],
    ["ITA","STRONATI Edoardo","2.27","2.27"],
    ["ITA","TAMBERI Gianmarco","2.39","2.23"],
    ["LTU","BAIKŠTYS Juozas","2.27","2.20 i"],
    ["NOR","BOLSTAD RAA Erlend","2.21 i","2.16 i"],
    ["POL","KOŁODZIEJSKI Mateusz","2.30 i","2.30 i"],
    ["POL","SZCZĘSNY Mikołaj","2.26","2.21 i"],
    ["ROU","ANDRONE Valentin Alexandru","2.20","2.17"],
    ["SWE","LYCKE HOLM Melwin","2.24","2.22 i"],
    ["UKR","DOROSHCHUK Oleh","2.34 i","2.33"],
    ["UKR","NIKITIN Dmytro","2.28","2.24"],
    ["UKR","PETRUK Roman","2.30","2.30"],
  ],
  "Pole Vault Men": [
    ["BEL","BROEDERS Ben","5.85","5.75"],
    ["BEL","PHILTJENS Ylio","5.70","5.70"],
    ["CRO","ŠERIĆ Ivan Geronimo","5.62","5.61 i"],
    ["CZE","BÁRTA Dan","5.60","5.60"],
    ["CZE","HOLÝ David","5.76 i","5.76 i"],
    ["EST","APRI Henri","5.66","5.66"],
    ["EST","KOMPUS Robert","5.65 i","5.65 i"],
    ["FIN","ALASAARI Juho","5.71","5.67"],
    ["FRA","COLLET Mathieu","5.82","5.82"],
    ["FRA","COLLET Thibaut","5.95","5.91"],
    ["FRA","EMIG Robin","5.92","5.83"],
    ["FRA","THIERY Baptiste","5.93","5.93"],
    ["GBR","HEARD Owen","5.71 i","5.71 i"],
    ["GER","LADWIG Gillian","5.72","5.62"],
    ["GER","LITA BAEHRE Bo Kanda","5.90","5.90"],
    ["GRE","KARALIS Emmanouil","6.17 i","6.17 i"],
    ["GRE","RIZOS Ioannis","5.73","5.70"],
    ["ITA","OLIVERI Matteo","5.71","5.66"],
    ["LAT","KREIŠS Valters","5.82 i","5.80"],
    ["NED","VLOON Menno","5.96 i","5.85 i"],
    ["NOR","GUTTORMSEN Sondre","6.06 i","6.06 i"],
    ["POL","LISEK Piotr","6.02","5.75"],
    ["POR","BUARÓ Pedro","5.85","5.85"],
    ["SUI","FOURNIER Justin","5.47","5.47"],
    ["SWE","ASKER William","5.70","5.70"],
    ["SWE","DUPLANTIS Armand","6.31 i","6.31 i"],
    ["SWE","SANDBERG Oliver","5.62","5.62"],
    ["TUR","ŞAŞMA Ersu","5.92","5.81"],
    ["UKR","MALYKHIN Vladislav","5.70","5.56"],
    ["UKR","ONUFRIYEV Oleksandr","5.70","5.70 i"],
  ],
  "Long Jump Men": [
    ["BEL","SAMPSON Yanni","8.02","8.02"],
    ["BUL","SARÂBOYUKOV Bozhidar","8.49","8.49"],
    ["CRO","ČEKO Marko","8.04","7.77"],
    ["CRO","PRAVDICA Filip","8.35","8.09"],
    ["CZE","MEINDLSCHMID Petr","8.03","7.72 i"],
    ["ESP","BELTRÁN Carlos","8.03","8.03"],
    ["ESP","CÁCERES Eusebio","8.37","8.19 i"],
    ["ESP","GUERRA Jaime","8.17","8.15"],
    ["ESP","LESCAY Lester","8.35","8.22"],
    ["ESP","SANTOS Héctor","8.19","8.06"],
    ["FIN","PULLI Kristian","8.27","8.08 i"],
    ["FIN","SALMINEN Kalle","7.95","7.85"],
    ["FIN","VEHMAA Kasperi","8.03","8.03"],
    ["FRA","KONATE Erwan","8.25","8.09"],
    ["GBR","MACKENZIE Stephen","8.15","8.15"],
    ["GBR","YEO Archie","8.06","8.06"],
    ["GER","BATZ Simon","8.29","8.29"],
    ["GER","BRUCHA Kevin","8.04","8.04"],
    ["GER","ENTHOLZNER Maximilian","8.12","8.04"],
    ["GER","PLITZKO Simon","8.00","7.92"],
    ["GRE","STAMATONIKOLOS Nikolaos","8.14","7.93 i"],
    ["GRE","TENTOGLOU Miltiadis","8.66","8.66"],
    ["HUN","PAP Kristóf","8.11","8.11"],
    ["ITA","FURLANI Mattia","8.43","8.43"],
    ["ITA","INZOLI Francesco Ettore","8.27","8.27"],
    ["NOR","FLÅTNES Henrik","8.10","8.10"],
    ["POL","TARKOWSKI Piotr","8.04","7.97"],
    ["POR","BALDÉ Gerson","8.46 i","8.46 i"],
    ["ROU","BITAN Gabriel","8.14 i","7.96 i"],
    ["SRB","BOŠKOVIĆ Luka","8.23","8.23"],
    ["SUI","EHAMMER Simon","8.51","8.51"],
    ["SWE","MONTLER Thobias","8.38 i","8.08"],
    ["SWE","WALL Niklas","7.85","7.85"],
  ],
  "Triple Jump Men": [
    ["ARM","GHAZARYAN Razmik","16.21 i","16.21 i"],
    ["AUT","KINGLEY Endiorass","16.85","16.46"],
    ["AZE","MAMMADOV Rustam","16.54 i","16.11"],
    ["CYP","ASHDJIAN Antranik Sarkis","16.06 i","16.06 i"],
    ["CYP","NIKOLAOU Grigoris","16.36","16.36"],
    ["EST","MOROZOV Viktor","16.45","16.38 i"],
    ["FIN","DAVIDILA Aaro","16.83","16.12"],
    ["FRA","GOGOIS Thomas","17.38","17.02"],
    ["FRA","SEREMES Jonathan","17.25 i","17.25 i"],
    ["GEO","GULELAURI Lasha","17.16 i","16.25"],
    ["GRE","ANDRIKOPOULOS Nikolaos","16.73","16.56"],
    ["GRE","PANTAZIS Andreas","16.91","16.71 i"],
    ["GRE","TSIAMIS Dimitrios","17.55","16.59"],
    ["HUN","SZENDERFFY Dániel","16.23 i","16.23 i"],
    ["ITA","BIASUTTI Simone","17.32","17.32"],
    ["ITA","BRUNO Federico Lorenzo","16.66","16.66"],
    ["ITA","DALLAVALLE Andrea","17.64","17.42"],
    ["ITA","DÍAZ HERNÁNDEZ Andy","17.87","17.87"],
    ["POR","PEREIRA Tiago Luis","17.11","15.64"],
    ["POR","PICHARDO Pedro","18.08","17.71"],
    ["SWE","WALLMARK Gabriel","16.43","16.34 i"],
    ["TUR","BÜLBÜL Mesut","16.16","16.16"],
    ["TUR","ER Necati","17.37","16.66 i"],
    ["TUR","ÖZÜPEK Can","16.77","16.58"],
  ],
  "Shot Put Men": [
    ["BIH","PEZER Mesud","21.48","20.61"],
    ["CYP","MICHAELIDES Petros","19.49 i","19.49 i"],
    ["CZE","STANĚK Tomáš","22.17 i","21.00"],
    ["FRA","MAILAGI Stephen","20.51","20.51"],
    ["GBR","LINCOLN Scott","21.31","21.16"],
    ["GEO","MUJARIDZE Giorgi","21.21 i","20.20 i"],
    ["GER","HARPF Georg","20.46 i","20.46 i"],
    ["GER","MAIHÖFER Eric","20.63","20.63"],
    ["GRE","GENNIKIS Konstantinos","19.55","19.55"],
    ["GRE","MACHAIRAS Iason","19.50 i","19.50 i"],
    ["GRE","MOUZENIDIS Odysseas","19.98","19.14"],
    ["IRL","FAVORS Eric","20.93","20.40"],
    ["ITA","FABBRI Leonardo","22.98","22.74"],
    ["ITA","FERRARA Riccardo","20.98","20.62"],
    ["ITA","PONZIO Nick","21.83","21.23"],
    ["ITA","WEIR Zane","22.44","21.42"],
    ["MDA","MAZUR Alexandr","20.17 i","20.17 i"],
    ["MNE","ĐUROVIĆ Tomaš","20.60","19.60"],
    ["NED","ROLVINK Yannick","19.70 i","19.70 i"],
    ["NED","VAN DAALEN Jarno","20.14 i","20.14 i"],
    ["POL","BUKOWIECKI Konrad","22.25","21.34"],
    ["POL","MAZUR Szymon","20.18","19.90"],
    ["POR","ARNAUDOV Tsanko","21.56","19.40"],
    ["ROU","TOADER Andrei Rares","21.29","21.08 i"],
    ["SRB","SINANČEVIĆ Armin","21.88","20.59 i"],
    ["SUI","VOGEL Jephté","19.15","19.03"],
    ["SUI","WIELAND Stefan","19.56 i","19.56 i"],
    ["SWE","PETERSSON Wictor","21.49 i","21.38 i"],
    ["SWE","ZIKOVIC Leo","19.75","19.75"],
    ["TUR","PEKER Ali","19.56","19.34"],
  ],
  "Discus Throw Men": [
    ["AUT","DIBO Will","63.50","63.50"],
    ["AUT","WEIßHAIDINGER Lukas","70.68","67.00"],
    ["CZE","BÁRTA Marek","67.00","64.50"],
    ["ESP","CASAS Diego","65.95","65.95"],
    ["FIN","LAMPINEN Mico","61.89","61.89"],
    ["FRA","DJOUHAN Lolassonn","70.25","67.52"],
    ["GBR","OKOYE Lawrence","71.88","71.88"],
    ["GER","JANSSEN Henrik","69.94","68.54"],
    ["GER","KARGES Marius","69.47","69.47"],
    ["GER","RICHTER Steven","74.00","74.00"],
    ["GER","SOSNA Mika","70.05","65.14"],
    ["GRE","PAVLIDIS Dimitrios","65.11","64.31"],
    ["HUN","HUSZÁK János","65.54","58.82"],
    ["HUN","SZIKSZAI Róbert","66.93","61.55"],
    ["ISL","GUÐNASON Guðni Valur","69.35","63.04"],
    ["ITA","MANNUCCI Alessio","65.60","63.85"],
    ["ITA","MUSCI Carmelo Alessandro","61.64","61.64"],
    ["ITA","SACCOMANO Enrico","63.31","63.07"],
    ["LTU","ALEKNA Martynas","67.23","64.59"],
    ["LTU","ALEKNA Mykolas","75.56","72.65"],
    ["LTU","GUDŽIUS Andrius","69.59","67.73"],
    ["NED","EMANUELSON Shaquille","69.65","68.14"],
    ["NED","ROLVINK Ruben","71.22","71.22"],
    ["NOR","STUNES ISENE Ola","67.78","66.29"],
    ["POL","RODZIAK Damian","64.24","64.24"],
    ["POR","SOUSA Emanuel","67.51","65.44"],
    ["ROU","FIRFIRICĂ Alin Alexandru","67.32","65.95"],
    ["SLO","ČEH Kristjan","72.61","72.61"],
    ["SWE","AHLIN Jesper","62.00","62.00"],
    ["SWE","STÅHL Daniel","71.86","69.85"],
    ["TUR","ŞAHİN Ömer","62.77","62.77"],
  ],
  "Hammer Throw Men": [
    ["ALB","MEMA Markelo","76.57","76.57"],
    ["CRO","GREGURIĆ Matija","76.68","76.50"],
    ["CYP","KESIDIS Iosif","78.61","78.61"],
    ["CZE","HÁJEK Patrik","78.20","75.66"],
    ["CZE","MYSLYVČUK Volodymyr","80.69","80.69"],
    ["EST","KELLY Adam","75.81","74.85"],
    ["FIN","LIIPOLA Henri","75.88","75.88"],
    ["FRA","CHAUSSINAND Yann","82.44","82.44"],
    ["GBR","NORRIS Jake","77.76","77.76"],
    ["GER","HUMMEL Merlin","82.77","81.74"],
    ["GER","KLOSE Sören","78.18","78.18"],
    ["GRE","ANASTASAKIS Michail","77.72","76.36"],
    ["GRE","FRANTZESKAKIS Christos","79.09","79.09"],
    ["GRE","MANTZOURANIS Angelos","78.61","75.98"],
    ["GRE","PAPANASTASIOU Georgios","77.71","77.71"],
    ["HUN","CZELLER Gábor","74.48","74.48"],
    ["HUN","HALÁSZ Bence","83.18","81.87"],
    ["HUN","RÁBA Dániel","76.83","74.06"],
    ["HUN","SZABADOS Ármin","80.95","80.95"],
    ["ISL","JÓNSSON Hilmar Örn","78.03","78.03"],
    ["ITA","OLIVIERI Giorgio","74.39","74.27"],
    ["NED","COMENENTIA Denzel","79.09","75.87"],
    ["NOR","HENRIKSEN Eivind","81.58","75.37"],
    ["NOR","MARDAL Thomas","78.66","78.66"],
    ["POL","FAJDEK Paweł","83.93","82.09"],
    ["POL","NOWICKI Wojciech","82.52","75.27"],
    ["POL","PIŁAT Dawid","75.40","75.40"],
    ["POL","WROTYŃSKI Marcin","77.01","76.72"],
    ["SWE","CARLSSON Ragnar","77.57","73.90"],
    ["TUR","BALTACI Özkan","77.50","73.87"],
    ["TUR","YILMAZER Halil","75.01","74.66"],
    ["UKR","KOKHAN Mykhaylo","82.38","82.38"],
  ],
  "Javelin Throw Men": [
    ["BEL","HERMAN Timothy","87.35","76.87"],
    ["CZE","KONEČNÝ Martin","81.12","81.12"],
    ["CZE","VADLEJCH Jakub","90.88","85.24"],
    ["CZE","VÝŠKA Jan","79.71","79.71"],
    ["DEN","PETERSEN Arthur W.","79.90","76.95"],
    ["ESP","QUIJERA Manu","83.28","81.27"],
    ["FIN","HELANDER Oliver","89.83","82.71"],
    ["FIN","LAINE Topias","81.67","79.89"],
    ["FIN","PARVIAINEN Topi","81.91","81.91"],
    ["FIN","PORVARI Eemil","82.69","81.98"],
    ["FRA","VAHAI SOSAIA Felise","82.11","82.11"],
    ["GBR","EAST Ben","80.49","80.49"],
    ["GER","RÖHLER Thomas","93.90","83.33"],
    ["GER","THUMM Nick","82.03","82.03"],
    ["GER","WEBER Julian","91.51","87.04"],
    ["GRE","TSITSOS Dimitrios","80.56","80.56"],
    ["ISL","GUÐMUNDSSON Sindri Hrafn","82.55","81.90"],
    ["ITA","FINA Michele","79.95","79.95"],
    ["ITA","FRATTINI Giovanni","83.61","80.36"],
    ["LAT","GAILUMS Patriks","84.05","83.09"],
    ["LAT","SUNTAŽS Krišjānis","79.23","78.64"],
    ["LTU","MATUSEVIČIUS Edis","89.17","83.65"],
    ["MDA","MARDARE Andrian","86.66","82.15"],
    ["NED","JANSEN Ryan","79.55","79.55"],
    ["POL","KRUKOWSKI Marcin","89.55","83.73"],
    ["POL","WEGNER Dawid","85.67","82.17"],
    ["SUI","DI SANZA Franck","78.59","78.59"],
    ["SUI","WIELAND Simon","82.26","80.76"],
    ["SVK","KUBÍNEC Jakub","83.49","83.49"],
    ["SVK","MICHALEC Patrik","78.57","77.09"],
    ["UKR","FELFNER Artur","84.32","83.62"],
  ],
  "Decathlon Men": [
    ["BEL","KEÏTA Dai","8011","8011"],
    ["CZE","JÄRVINEN Tomas","8400","8400"],
    ["CZE","KOPECKÝ Ondřej","8310","8079"],
    ["CZE","STRÁSKÝ Vilém","8136","8056"],
    ["EST","ERM Johannes","8764",""],
    ["EST","LILLEMETS Risto","8156","8063"],
    ["EST","ROOSLEHT Rasmus","8336","8336"],
    ["EST","TILGA Karel","8681","8413"],
    ["FRA","FERRANTI Antoine","8240","8240"],
    ["FRA","GLETTY Makenson","8606","8458"],
    ["GER","GRÄBER Amadeus","8345","8345"],
    ["GER","KAUL Niklas","8691","8528"],
    ["GER","MEYER Marcel","8261","8261"],
    ["GER","NEUGEBAUER Leo","8961","8730"],
    ["HUN","GÁLPÁL Zsombor","8006","8006"],
    ["ITA","DESTER Dario","8318","8318"],
    ["ITA","NONINO Alberto","7988","7988"],
    ["LTU","BENKUNSKAS Edgaras","8098","8080"],
    ["NED","DE GREEF Jip","8039","8039"],
    ["NED","JANSONS Sven","8006","8006"],
    ["NED","PELKMANS Luuk","8079","8079"],
    ["NED","ROOSEN Sven","8607","8428"],
    ["NED","TESSELAAR Jeff","8249","8239"],
    ["NOR","SKOTHEIM Sander","8909",""],
    ["SUI","HUBER Andrin","8188","8069"],
    ["SUI","KRUMMENACHER Leon","7988","7988"],
    ["SUI","PORTMANN Nino","7982","7982"],
    ["SWE","UHLIN Emil","7976","7976"],
  ],
  "Half Marathon Race Walk Men": [
    ["CZE","KUKLA Albert","1:27:50","1:27:50"],
    ["ESP","GARCÍA CARRERA Diego","1:26:07","1:26:07"],
    ["ESP","LÓPEZ Álvaro","1:26:21","1:26:21"],
    ["ESP","MCGRATH Paul","1:25:20","1:25:20"],
    ["FIN","HAVA Joni","1:33:35","1:33:35"],
    ["FIN","JOKINEN Jerry","1:28:13","1:28:13"],
    ["FIN","PARTANEN Veli-Matti","1:26:27","1:26:27"],
    ["FRA","LEBRETON Kilian","1:26:10","1:26:10"],
    ["GER","KÖPP Leo","1:24:27","1:24:27"],
    ["GER","LINKE Christopher","1:23:46","1:23:46"],
    ["GER","WEIGEL Frederick","1:27:30","1:27:30"],
    ["GRE","KRITOULIS Georgios","1:29:51","1:29:51"],
    ["GRE","NTENTOPOULOS Konstantinos-Alexandros","1:36:36","1:37:42"],
    ["GRE","PAPASTERGIOU Andreas","1:34:01","1:36:21"],
    ["IRL","KENNY David","",""],
    ["IRL","LANE Oisin","1:30:26",""],
    ["ITA","COSI Andrea","1:23:59","1:23:59"],
    ["ITA","FORTUNATO Francesco","1:23:00","1:23:00"],
    ["ITA","PICCHIOTTINO Gianluca","1:25:27","1:25:27"],
    ["POL","BEN HLIMA Maher","1:26:36","1:26:36"],
    ["POR","CAMARATE Eduardo","1:30:41","1:31:40"],
    ["POR","RAMOS Tiago","1:34:50","1:34:50"],
    ["POR","VIEIRA João","1:29:54","1:29:54"],
    ["TUR","DEMIR Mazlum","1:30:39","1:30:39"],
    ["TUR","KORKMAZ Salih","1:27:19","1:27:19"],
    ["TUR","YILDIZ Hayrettin","",""],
    ["UKR","HORBACHOV Roman","1:33:10","1:33:10"],
    ["UKR","RUSHCHAK Mukola","1:25:50","1:25:50"],
  ],
  "4x100 Metres Relay Men": [
    ["BEL","BOTTERMAN Emiel","",""],
    ["BEL","CAMARA Ibrahim","",""],
    ["BEL","KASMI Amine","",""],
    ["BEL","SNYDERS Antoine","",""],
    ["BEL","VANDERBEMDEN Robin","",""],
    ["BEL","VERHERSTRAETEN Simon","",""],
    ["BEL","VERSCHUEREN Cédric","",""],
    ["ESP","CALBANO Andoni","",""],
    ["ESP","CALERO Alberto","",""],
    ["ESP","CRESPI Guillem","",""],
    ["ESP","ESCANDELL Marc","",""],
    ["ESP","HERNÁNDEZ Jorge","",""],
    ["ESP","JORDAN Abel","",""],
    ["ESP","RODRÍGUEZ Daniel","",""],
    ["ESP","SANCHEZ Oriol","",""],
    ["FIN","AALTO Eljas","",""],
    ["FIN","HUTTUNEN Topi","",""],
    ["FIN","ILLUKKA Riku","",""],
    ["FIN","KULJU Aku","",""],
    ["FIN","LEHTONEN Oskari","",""],
    ["FIN","LOUKO Valtteri","",""],
    ["FIN","ÖRN Santeri","",""],
    ["FIN","PUROLA Samuel","",""],
    ["GBR","AZU Jeremiah","",""],
    ["GBR","GLAVE Romell","",""],
    ["GBR","HINCHLIFFE Louie","",""],
    ["GBR","HUGHES Zharnel","",""],
    ["GBR","JONES Elliot","",""],
    ["GBR","MITCHELL-BLAKE Nethaneel","",""],
    ["GBR","NWOKEJI Ebuka","",""],
    ["GBR","WALSH Nicholas","",""],
    ["GER","ANSAH Owen","",""],
    ["GER","ANSAH-PEPRAH Lucas","",""],
    ["GER","FREHE Jan Eric","",""],
    ["GER","GANTER Robin","",""],
    ["GER","GUSSMANN Heiko","",""],
    ["GER","KRANZ Kevin","",""],
    ["GER","SCHULTE Marvin","",""],
    ["GER","WOLF Yannick","",""],
    ["GRE","GKARAGKANIS Sotirios","",""],
    ["GRE","MYRIANTHOPOULOS Vasileios","",""],
    ["GRE","NYFANTOPOULOS Ioannis","",""],
    ["GRE","PANAGIOTOPOULOS Nikolaos","",""],
    ["GRE","VOSKOPOULOS Ioannis","",""],
    ["GRE","VRONTINOS Theodoros","",""],
    ["IRL","AIGBOBOH Sean","",""],
    ["IRL","AKINOLA Toluwabori","",""],
    ["IRL","AMAH Dubem","",""],
    ["IRL","FADDEN Lucas","",""],
    ["IRL","LAWLER Marcus","",""],
    ["IRL","MULHOLLAND Ryan","",""],
    ["IRL","OLATUNDE Israel","",""],
    ["IRL","SMYTH Mark","",""],
    ["ITA","ALI Chituru","",""],
    ["ITA","CECCARELLI Samuele","",""],
    ["ITA","JACOBS Lamont Marcell","",""],
    ["ITA","PATTA Lorenzo","",""],
    ["ITA","RANDAZZO Filippo","",""],
    ["ITA","TORTU Filippo","",""],
    ["NED","AFRIFA Elvis","",""],
    ["NED","BURNET Taymir","",""],
    ["NED","MO-AJOK Xavi","",""],
    ["NED","OMALLA Jaimie","",""],
    ["NED","REVIERRE Jozuah","",""],
    ["NED","VRIENDWIJK Daniljo","",""],
    ["NOR","FREMSTAD-WALDRON Per Tinius","",""],
    ["NOR","HOMSTAD Jørgen","",""],
    ["NOR","JOHANSEN Mathias Hove","",""],
    ["NOR","KASHAFALI Salum Ageze","",""],
    ["NOR","KULSENG Andreas Ofstad","",""],
    ["NOR","VAULA Jacob","",""],
    ["POL","GRZĄKA Dawid","",""],
    ["POL","KOPEĆ Dominik","",""],
    ["POL","KRUPA Patryk","",""],
    ["POL","LEMPACH Jakub","",""],
    ["POL","LIBURA Sebastian","",""],
    ["POL","REMBISZ Rafał","",""],
    ["POL","ŻAK Łukasz","",""],
    ["POR","BALDÉ Gerson","",""],
    ["POR","LANDIM David","",""],
    ["POR","MAIA Gabriel","",""],
    ["POR","PEREIRA Paulo","",""],
    ["POR","PRAZERES André","",""],
    ["POR","SANTOS Delvis","",""],
    ["SLO","ČURIN PRAPOTNIK Anej","",""],
    ["SLO","CVELBAR Timotej","",""],
    ["SLO","LORBAR Staš Tin","",""],
    ["SLO","OICLJ Filip","",""],
    ["SLO","SKOČIR Andrej","",""],
    ["SUI","BACHMANN Daryl","",""],
    ["SUI","BRUNO Dominik James","",""],
    ["SUI","CHÈVRE Mathieu","",""],
    ["SUI","GOU GOMEZ Jonathan","",""],
    ["SUI","KERN Lucien","",""],
    ["SUI","MUMENTHALER Timothé","",""],
    ["SUI","REAIS William","",""],
    ["SUI","SVENSSON Felix","",""],
    ["SWE","ERIKSSON Zion","",""],
    ["SWE","ERLANDSSON Erik","",""],
    ["SWE","OLSSON Filip","",""],
    ["SWE","PIHL Linus","",""],
    ["SWE","SJÖLANDER Johan","",""],
    ["SWE","ZIRIGNON Jean-Christian","",""],
    ["TUR","ALTINTAŞ Batuhan","",""],
    ["TUR","ERGÜN Emre","",""],
    ["TUR","KARTAL Deniz Kaan","",""],
    ["TUR","ÖZER Kayhan","",""],
    ["TUR","ÖZKAN Ertan","",""],
    ["TUR","SEVLER Mikdat","",""],
    ["TUR","UYAR Oğuz","",""],
  ],
  "Marathon Race Walk Men": [
    ["CZE","MORÁVEK Jaromír","3:08:10",""],
    ["ESP","BERMÚDEZ Manuel","3:13:10","3:13:10"],
    ["ESP","CHAMOSA Daniel","3:13:10","3:13:10"],
    ["ESP","LÓPEZ Miguel Ángel","",""],
    ["ESP","MARTINEZ Oscar","3:09:08","3:09:08"],
    ["ESP","PÉREZ José Manuel","3:09:52","3:09:52"],
    ["FRA","MADELINE-DEGY Martin","3:05:34","3:10:31"],
    ["FRA","QUINION Aurélien","3:07:53","3:07:53"],
    ["GBR","CORBISHLEY Cameron","3:13:48","3:21:38"],
    ["GER","DOHMANN Carl","3:09:55",""],
    ["GER","FRENZL Johannes","3:10:09","3:10:09"],
    ["GER","JUNGHANNß Karl","3:04:33","3:04:33"],
    ["GER","LINKE Christopher","3:05:44","3:05:44"],
    ["GRE","KARAGIANNIS Andreas","3:52:33","3:52:33"],
    ["GRE","KELEPOURIS Georgios","3:29:23","3:30:15"],
    ["GRE","PAPAMICHAIL Alexandros","3:24:07","3:24:07"],
    ["HUN","HELEBRANDT Máté","3:07:26",""],
    ["HUN","TÓTH Norbert","3:10:25","3:10:25"],
    ["HUN","VENYERCSÁN Bence","3:03:45","3:03:45"],
    ["IRL","LANE Oisin","",""],
    ["ITA","AGRUSTI Andrea","3:03:55","3:08:26"],
    ["ITA","ORSONI Riccardo","3:08:09","3:08:09"],
    ["ITA","STANO Massimo","3:07:38","3:07:38"],
    ["LAT","SAULGRIEZIS Raivo","3:09:31","3:09:33"],
    ["SVK","ČERNÝ Dominik","3:13:24","3:13:24"],
    ["SVK","DUDA Michal","3:27:14","3:27:14"],
    ["SVK","MORVAY Michal","",""],
    ["SWE","KARLSTRÖM Perseus","3:04:50","3:04:50"],
    ["TUR","BAYRAM Ozan","3:15:35","3:15:35"],
    ["TUR","BILIR Harun","3:11:27","3:11:27"],
    ["TUR","KORKMAZ Salih","3:22:07","3:22:07"],
    ["UKR","BANZERUK Ivan","3:09:50",""],
    ["UKR","SVITLYCHNYI Serhii","3:04:49",""],
    ["UKR","ZAKALNYTSKYY Maryan","3:05:14",""],
  ],
  "4x400 Metres Relay Men": [
    ["BEL","BORLÉE Dylan","",""],
    ["BEL","CRESTAN Eliott","",""],
    ["BEL","MABILLE Florent","",""],
    ["BEL","QUARTIER Adrien","",""],
    ["BEL","SACOOR Jonathan","",""],
    ["BEL","SEGERS Daniel","",""],
    ["BEL","VANDERBEMDEN Robin","",""],
    ["BEL","WATRIN Julien","",""],
    ["CZE","HORÁČEK Ondřej","",""],
    ["CZE","KRSEK Matěj","",""],
    ["CZE","LOUPAL Ondřej","",""],
    ["CZE","MÜLLER Vít","",""],
    ["CZE","ŠČIBRÁNI Milan","",""],
    ["CZE","ŠORM Patrik","",""],
    ["DEN","FALCK Neloo","",""],
    ["DEN","HVORUP Jacob","",""],
    ["DEN","MONNERET Sebastian","",""],
    ["DEN","NIELSEN Gustav Lundholm","",""],
    ["DEN","TØRRING Simon Winther","",""],
    ["DEN","VØLUND Sofus Olivarius","",""],
    ["ESP","BEA Manuel","",""],
    ["ESP","DE LA ROSA Juan Jose","",""],
    ["ESP","ERTA Bernat","",""],
    ["ESP","GARCÍA David","",""],
    ["ESP","GARCÍA Samuel","",""],
    ["ESP","GONZÁLEZ Ángel","",""],
    ["ESP","PINES Asabu","",""],
    ["FRA","KOUNTA Muhammad Abdallah","",""],
    ["FRA","MANOUNOU Predea","",""],
    ["FRA","MILEAU Dylan","",""],
    ["FRA","MOUDIO PRISO Benoît","",""],
    ["FRA","SOUDRIL Jimy","",""],
    ["FRA","SPILLMANN Yann","",""],
    ["FRA","VESSAT Samuel","",""],
    ["GBR","DOBSON Charles","",""],
    ["GBR","HARRIES Toby","",""],
    ["GBR","HUDSON-SMITH Matthew","",""],
    ["GBR","JEFFERIES Ben","",""],
    ["GBR","LUNT Sam","",""],
    ["GBR","REARDON Samuel","",""],
    ["GBR","SMITH-BAND Malique","",""],
    ["GBR","YOUNG Brodie","",""],
    ["GER","BREDAU Jean Paul","",""],
    ["GER","DAMMERMANN Fabian","",""],
    ["GER","FINKE Thorben","",""],
    ["GER","KROLL Florian","",""],
    ["GER","SANDERS Manuel","",""],
    ["GER","TRAUE Thilo","",""],
    ["HUN","CSAHÓCZI Csanád","",""],
    ["HUN","ENYINGI Patrik Simon","",""],
    ["HUN","KOVÁCS Árpád","",""],
    ["HUN","MOLNÁR Attila","",""],
    ["HUN","PLISZ Balázs","",""],
    ["HUN","SZILVESZTER Marcell","",""],
    ["HUN","WAHL Zoltán","",""],
    ["IRL","CARTHY Ciaran","",""],
    ["IRL","CULLEN Alex","",""],
    ["IRL","DEWHIRST Fintan","",""],
    ["IRL","DOGGETT Sean","",""],
    ["IRL","DOODY Joe","",""],
    ["IRL","EGAN Andrew","",""],
    ["IRL","MURPHY Darragh","",""],
    ["IRL","RAFTERY Jack","",""],
    ["ITA","ACETI Vladimir","",""],
    ["ITA","AKWANNOR Vanni Picco","",""],
    ["ITA","BENATI Lorenzo","",""],
    ["ITA","FALSETTI Federico","",""],
    ["ITA","MELI Riccardo","",""],
    ["ITA","RAIMONDI Matteo","",""],
    ["ITA","SCOTTI Edoardo","",""],
    ["ITA","SITO Luca","",""],
    ["NED","AGARD Terrence","",""],
    ["NED","BLAKE Keenan","",""],
    ["NED","BONEVACIA Liemarvin","",""],
    ["NED","KNEPPERS Daan","",""],
    ["NED","OMALLA Eugene","",""],
    ["NED","PHIJFFERS Jonas","",""],
    ["NED","VAN DIEPEN Tony","",""],
    ["POL","DUSZYŃSKI Kajetan","",""],
    ["POL","KAROLEWSKI Marcin","",""],
    ["POL","RZEŹNICZAK Mateusz","",""],
    ["POL","SZWED Maksymilian","",""],
    ["POL","WRÓBEL Wiktor","",""],
    ["POL","ZAZULA Remigiusz","",""],
    ["POR","AFONSO Pedro","",""],
    ["POR","COELHO João","",""],
    ["POR","DOS SANTOS Ricardo","",""],
    ["POR","ELKHATIB Omar","",""],
    ["POR","FRANCO André","",""],
    ["POR","TAVARES Ericsson","",""],
    ["SLO","CVELBAR Timotej","",""],
    ["SLO","FERLAN Rok","",""],
    ["SLO","GUČEK Matic Ian","",""],
    ["SLO","JANŽA Maj","",""],
    ["SLO","MESEC KOŠIR Lovro","",""],
    ["SLO","VUKOVIČ Jan","",""],
    ["SLO","ZUBIN Mitja","",""],
    ["SUI","BONVIN Julien","",""],
    ["SUI","BRAND Dany","",""],
    ["SUI","BROTSCHI Haydn","",""],
    ["SUI","GERBER Manuel","",""],
    ["SUI","PETRUCCIANI Ricky","",""],
    ["SUI","SPITZ Lionel","",""],
    ["TUR","AKÇAM Berke","",""],
    ["TUR","CANLI Yagiz","",""],
    ["TUR","ENÇÜ Kubilay","",""],
    ["TUR","KARTAL Deniz Kaan","",""],
    ["TUR","KAYA Oğuzhan","",""],
    ["TUR","NEZIR İsmail","",""],
    ["TUR","SELÇUK Ihsan","",""],
  ],
  "100 Metres Women": [
    ["AUT","LINDNER Magdalena","11.26","11.26"],
    ["AUT","POSCH Isabel","11.10","11.10"],
    ["AUT","WILLIAMS Christania","10.96","11.06"],
    ["BEL","NKANSA Delphine","11.13","11.13"],
    ["BEL","ROSIUS Rani","11.10","11.18"],
    ["CZE","MAŇASOVÁ Karolína","11.01","11.01"],
    ["ESP","PÉREZ Maria Isabel","11.07","11.15"],
    ["EST","KIVIKAS Ann Marii","11.35","11.38"],
    ["FIN","KEMPPINEN Lotta","11.19","11.43"],
    ["GBR","AKANDE Mabel","11.18","11.18"],
    ["GBR","ASHER-SMITH Dina","10.83","11.13"],
    ["GBR","HUNT Amy","10.97","10.97"],
    ["GBR","LANSIQUOT Imani","10.99","11.02"],
    ["GBR","NEITA Daryll","10.90","11.18"],
    ["GER","HAASE Rebekka","11.04","11.04"],
    ["GER","KADIRI Chelsea","11.17","11.17"],
    ["GER","LÜCKENKEMPER Gina","10.93","11.21"],
    ["GER","SCHWARTZ Philina Marianne","11.23","11.23"],
    ["GIB","PEAT Charlotte","",""],
    ["GRE","EMMANOUILIDOU Polyniki","11.21","11.28"],
    ["GRE","SPANOUDAKI-CHATZIRIGA Rafailia","11.26","11.37"],
    ["HUN","TAKÁCS Boglárka","11.06","11.16"],
    ["IRL","NEVILLE Ciara","11.31","11.31"],
    ["IRL","ROY Lauren","11.23","11.23"],
    ["ITA","DOSSO Zaynab","11.01","11.07"],
    ["ITA","HOOPER Gloria","11.24","11.25"],
    ["LUX","VAN DER WEKEN Patrizia","11.00","11.05"],
    ["MLT","AZZOPARDI Claire","11.66","11.68"],
    ["POL","SWOBODA Ewa","10.94","10.98"],
    ["POL","TSIMANOUSKAYA Krystsina","11.04","11.16"],
    ["POR","GANDULLA Arialis","11.17","11.25"],
    ["POR","PINTO Tatjana","11.00","11.02"],
    ["SLO","ISTENIČ Zala","11.25","11.25"],
    ["SMR","GASPARELLI Alessandra","11.42","11.42"],
    ["SUI","DEL PONTE Ajla","10.90","11.11"],
    ["SUI","DI TIZIO-FREY Géraldine","10.96","10.96"],
    ["SUI","KORA Salomé","10.95","11.09"],
    ["SUI","KOUNI Nathacha","11.12","11.12"],
    ["SVK","FORSTER Viktória","11.19","11.34"],
  ],
  "200 Metres Women": [
    ["BEL","NKANSA Delphine","22.88","23.26"],
    ["BUL","RADUKANOVA Kristen","23.55","23.55"],
    ["CYP","FOTOPOULOU Olivia","22.65","23.07 sh"],
    ["ESP","BESTUÉ Jaël","22.19","22.57"],
    ["ESP","BORRERO Alba","22.97","22.97"],
    ["ESP","CLADERA Esperança","22.79","22.93"],
    ["EST","KIVIKAS Ann Marii","23.04","23.22"],
    ["FRA","JOSEPH Gémima","22.57","22.60"],
    ["GBR","AMA-AWUAH Kristal","22.57","22.57"],
    ["GBR","ASHER-SMITH Dina","21.88","22.28"],
    ["GBR","EDUAN Success","22.43","22.43"],
    ["GBR","HUNT Amy","22.08","22.30"],
    ["GER","JUNK Sophia","22.53","22.76"],
    ["GER","MOKOBE Judith Bilepo","22.78","22.78"],
    ["GER","PREPENS Talea","22.83","22.86"],
    ["GER","WESSOLLY Jessica-Bianca","22.50","22.92"],
    ["GRE","EMMANOUILIDOU Polyniki","22.84","23.22"],
    ["GRE","SPANOUDAKI-CHATZIRIGA Rafailia","23.04","23.38"],
    ["GRE","TSOUKALA Dimitra","22.97","23.56 sh"],
    ["HUN","TAKÁCS Boglárka","22.65","23.02"],
    ["IRL","ADELEKE Rhasidat","22.34","22.80"],
    ["IRL","ROY Lauren","22.83","22.83"],
    ["ITA","CAMBIOLO Elena","23.05","23.05"],
    ["ITA","FONTANA Vittoria","22.79","23.03"],
    ["ITA","HOOPER Gloria","22.89","23.10"],
    ["ITA","KADDARI Dalia","22.64","23.19"],
    ["LTU","SABAITYTĖ Lukrecija","23.11","23.44"],
    ["NOR","AMUNDSEN Maren Bakke","23.45","23.45"],
    ["POL","GAJOSZ Wiktoria","22.91","22.91"],
    ["SLO","HRIBAR Lina","23.29","23.29"],
    ["SLO","ISTENIČ Zala","22.97","22.97"],
    ["SUI","CALIGIURI Iris","23.02","23.25 sh"],
    ["SUI","HOENKE Fabienne","22.50","22.50"],
    ["SUI","KAMBUNDJI Mujinga","22.05","23.37"],
    ["SUI","POINTET Léonie","22.69","22.69"],
    ["SVK","KORBOVÁ Viktória","23.25","23.25"],
    ["SWE","SVENSON Wilma","23.30","23.30"],
    ["TUR","KOLOĞLU Sila","23.09","23.09"],
    ["TUR","POLAT Elif","23.16","23.19"],
  ],
  "400 Metres Women": [
    ["AUT","GOGL-WALLI Susanne","50.60","51.77 sh"],
    ["BEL","PONETTE Helena","50.80","50.80"],
    ["CRO","DRLJAČIĆ Veronika","51.22","51.90"],
    ["CYP","KOUNTOURI Kalliopi","52.58","53.54"],
    ["CZE","MALÍKOVÁ Barbora","51.23","51.59"],
    ["CZE","MANUEL Lurdes Gloria","49.37","49.37"],
    ["ESP","HERVÁS Blanca","50.46","50.46"],
    ["ESP","PRIETO Ana","51.62","51.62"],
    ["ESP","SEVILLA Paula","50.68","50.68"],
    ["FIN","BAAS Mette","51.42 sh","51.42 sh"],
    ["FRA","BLACK Isabelle","50.47","50.47"],
    ["GBR","ANNING Amber","49.29","50.16"],
    ["GBR","HENRICH Charlotte","50.45","50.45"],
    ["GBR","JOHN Yemi Mary","49.85","49.85"],
    ["GBR","NIELSEN Laviai","49.87","51.02"],
    ["GBR","YEARGIN Nicole","50.96","50.98"],
    ["GER","MARTIN Johanna","50.57","50.57"],
    ["IRL","BECKER Sophie","51.13","52.36"],
    ["IRL","MAWDSLEY Sharlene","50.06","50.06"],
    ["ITA","BONORA Alessandra","51.70","51.70"],
    ["ITA","MANGIONE Alice","51.07","51.49"],
    ["ITA","POLINARI Anna","50.36","50.36"],
    ["LTU","MORAUSKAITĖ Modesta Justė","50.49","52.66"],
    ["NED","KLAVER Lieke","49.58","49.58"],
    ["NED","SAALBERG Eveline","50.95","51.52"],
    ["NED","VAN DER SCHOOT Myrte","51.05","51.05"],
    ["NOR","AKS Josefine Tomine Eriksen","51.43","51.43"],
    ["NOR","ERTZGAARD Astri","51.92","52.37"],
    ["NOR","ERTZGAARD Kaitesi","52.30","52.30"],
    ["NOR","JÆGER Henriette","49.15","49.15"],
    ["POL","BUKOWIECKA Natalia","48.90","50.02"],
    ["POR","VANESSA Carina","52.62","53.42"],
    ["ROU","EȘANU-MIKLÓS Andrea","50.54","51.79"],
    ["SRB","PEŠIĆ Aleksandra","52.69","52.69"],
    ["SUI","ROLAND Melanie","52.15","52.15"],
    ["SWE","WESTER Elna","52.32","53.14"],
    ["TUR","KOLOĞLU Sila","52.41","52.41"],
    ["TUR","POLAT Elif","53.03","53.03"],
  ],
  "800 Metres Women": [
    ["AUT","BREDLINGER Caroline","1:58.95","1:59.36"],
    ["BEL","LAUS Camille","1:59.50","2:01.17"],
    ["BEL","PAREWYCK Mariska","2:00.40","2:00.47"],
    ["CRO","VUKOVIĆ Nina","2:00.06","2:00.06"],
    ["CZE","ŠTOUDKOVÁ Pavla","1:59.72","1:59.72"],
    ["ESP","ARROYO Rocio","1:59.17","1:59.97 sh"],
    ["ESP","IBARZABAL Lorea","1:59.60","1:59.84"],
    ["ESP","MITJANS Marta","1:59.28","1:59.28"],
    ["FIN","MÄÄTTÄNEN Eveliina","1:59.59","1:59.98"],
    ["FRA","BOURGOIN Anaïs","1:55.65","1:55.65"],
    ["FRA","DUMAS Charlotte","1:59.09","1:59.09"],
    ["FRA","LAMOTE Rénelle","1:56.93","1:56.93"],
    ["FRA","LIBERMAN Clara","1:58.34","1:58.34"],
    ["GBR","BOFFEY Isabelle","1:57.43 sh","1:57.43 sh"],
    ["GBR","HODGKINSON Keely","1:54.33","1:54.33"],
    ["GBR","REEKIE Jemma","1:55.61","1:58.41"],
    ["GBR","WALLACE Erin","1:59.19","2:00.01"],
    ["GER","BECKER Jana Marie","1:59.59","2:00.20"],
    ["GER","KOLBE Smilla","1:58.99","1:58.99"],
    ["GER","KOLBERG Majtie","1:58.52","1:58.67"],
    ["GRE","DESPOLLARI Georgia-Maria","2:00.32","2:00.32"],
    ["ITA","COIRO Eloisa","1:58.42","1:58.42"],
    ["LTU","GALVYDYTĖ Gabija","1:57.96","1:58.28"],
    ["NED","BROEDERS-BOL Femke","1:55.60","1:55.60"],
    ["NOR","ANTONSEN Pernille Karlsen","1:58.82","1:58.82"],
    ["NOR","FRØYNES Amanda Marie","2:00.35","2:00.35"],
    ["POL","FORMELLA Aleksandra","2:00.52","2:00.52"],
    ["POL","WIELGOSZ Anna","1:57.92","1:57.92"],
    ["SLO","HORVAT Anita","1:58.73","2:00.97"],
    ["SUI","HOFFMANN Lore","1:58.29","1:59.91 sh"],
    ["SUI","ROSAMILIA Valentina","1:58.69","1:58.74"],
    ["SUI","VANCARDO Veronica","1:59.10","1:59.11"],
    ["SUI","WERRO Audrey","1:53.80","1:53.80"],
    ["SVK","GAJANOVÁ Gabriela","1:58.22","1:59.05"],
  ],
  "1500 Metres Women": [
    ["CZE","SASÍNEK MÄKI Kristiina","4:01.23","4:04.22"],
    ["DEN","NISSEN Annemarie","4:08.51","4:08.51"],
    ["FRA","GAY Adèle","4:01.21","4:01.21"],
    ["FRA","GUILLEMOT Agathe","3:56.24","3:56.24"],
    ["FRA","HAQUET Augustine","4:03.56","4:03.56"],
    ["GBR","HUNTER BELL Georgia","3:52.61","3:55.63"],
    ["GBR","MUIR Laura","3:53.37","4:00.77"],
    ["GBR","SNOWDEN Katie","3:56.72","4:00.91"],
    ["GBR","WALCOTT-NOLAN Revee","3:58.08","4:00.78"],
    ["IRL","HEALY Sarah","3:57.15","4:01.50"],
    ["IRL","MAHER Eimear","4:06.54","4:06.54"],
    ["IRL","MCCANN Jodie","4:06.81","4:06.81"],
    ["IRL","O'SULLIVAN Sophie","4:00.23","4:05.62"],
    ["ITA","CAVALLI Ludovica","4:01.64","4:01.64"],
    ["ITA","SABBATINI Gaia","3:59.49","4:05.55"],
    ["ITA","ZENONI Marta","3:59.16","4:03.77 sh"],
    ["LTU","GALVYDYTĖ Gabija","3:59.74","3:59.74"],
    ["LUX","BERTEMES-HOFFMANN Vera","4:05.58","4:08.70"],
    ["NOR","HOVLAND Marte","4:08.04","4:08.04"],
    ["NOR","LØVNES Anne Gine","4:06.30","4:06.30"],
    ["NOR","ØSTGÅRD Ingeborg","4:08.84","4:08.91"],
    ["POL","KAZIMIERSKA Klaudia","3:57.95","3:59.24"],
    ["POL","LIZAKOWSKA Weronika","3:57.31","4:03.69"],
    ["POR","AFONSO Salomé","3:59.32","4:01.84"],
    ["POR","SILVA Patricia","3:58.74","3:58.74"],
    ["SUI","NÄGELI Lilly","4:10.22","4:11.75"],
    ["SUI","SCLABAS Delia","4:06.98","4:06.98"],
    ["SUI","WIND Joceline","4:01.41","4:01.41"],
    ["SWE","BARNETT Mia","4:05.39","4:06.00"],
    ["SWE","CERNJUL Carmen","4:07.08","4:07.08"],
    ["SWE","NGARAMBE Yolanda","4:03.43","4:10.81 sh"],
    ["SWE","NIELSEN Wilma","4:01.60 sh","4:01.60 sh"],
    ["SWE","SJÖBERG Vera","4:05.09","4:08.29"],
    ["TUR","AYYILDIZ Şilan","4:05.29","4:05.29"],
  ],
  "5000 Metres Women": [
    ["AUT","REDLINGER Lisa","15:12.03","15:12.03"],
    ["BEL","VANDERELST Elise","14:40.70",""],
    ["ESP","FORERO Maria","15:03.88","15:07.50"],
    ["ESP","GARCÍA Marta","14:33.40","16:08.02"],
    ["ESP","PRIETO Idaira","14:55.15","15:07.90"],
    ["FIN","BLOMQVIST Nathalie","14:44.72","15:15.06"],
    ["FIN","SUNI Aino","15:30.34","15:30.34"],
    ["GBR","FITZGERALD Innes","14:39.56","15:02.80"],
    ["GBR","NUTTALL Hannah","14:39.48","14:51.34"],
    ["GBR","WALKER Eloise","15:13.15","15:13.15"],
    ["GBR","WEIR India","15:01.92","15:26.72"],
    ["GER","MIKITENKO Vanessa","15:18.77","15:18.77"],
    ["IRL","HEALY Sarah","14:48.88","14:48.88"],
    ["ITA","BATTOCLETTI Nadia","14:23.15","14:40.05"],
    ["ITA","DEL BUONO Federica","15:00.05","15:08.56"],
    ["ITA","MAJORI Micol","15:04.32","15:14.03"],
    ["ITA","PALMERO Elisa","14:57.87","15:10.40"],
    ["KOS","BAKRAÇI Gresa","16:26.85","16:26.85"],
    ["LUX","BERTEMES-HOFFMANN Vera","15:29.06","15:57.54"],
    ["NED","GULIKERS Jennifer","15:05.68","15:09.52"],
    ["NED","KOSTER Maureen","14:33.56","14:33.56"],
    ["NED","MAATOUG Amina","15:07.49","15:07.49"],
    ["NOR","SÆTEN Amalie","15:07.33","15:22.16"],
    ["NOR","SIREVÅG Anna Marie Nordengen","15:19.19","15:19.19"],
    ["NOR","WANVIK HOLUM Madelène","15:35.70","15:35.70"],
    ["SWE","SJÖBERG Vera","15:24.87","15:24.87"],
  ],
  "10,000 Metres Women": [
    ["BEL","HERBIET Chloé","31:54.06",""],
    ["BEL","ROOMS Lisa","33:20.50",""],
    ["BEL","VAN LENT Jana","30:51.18","30:51.18"],
    ["ESP","GALLARDO Carla","32:08.17","32:08.17"],
    ["ESP","PRIETO Idaira","32:06.00","32:06.00"],
    ["FIN","CHYDENIUS Nina","32:16.85","33:28.19"],
    ["FIN","MONONEN Ilona","",""],
    ["FRA","ZARBO Alessia","31:50.62","31:56.18"],
    ["GBR","FRY Izzy","31:47.60","32:12.90"],
    ["GBR","KEITH Megan","30:36.84","32:22.11"],
    ["GBR","TANK Poppy","32:04.36","32:04.36"],
    ["GER","DIETERICH Eva","31:45.18","32:23.61"],
    ["GER","MERKEL Lisa","31:32.25","31:32.25"],
    ["IRL","ALLEN Niamh","32:15.79","32:15.79"],
    ["IRL","EVERARD Fiona","32:41.28","32:41.28"],
    ["ITA","BATTOCLETTI Nadia","30:38.23",""],
    ["ITA","DEL BUONO Federica","31:25.41","31:46.35"],
    ["ITA","PALMERO Elisa","31:18.03","31:59.49"],
    ["NED","GULIKERS Jennifer","32:01.57","32:01.57"],
    ["NED","KOSTER Maureen","30:50.31","30:50.31"],
    ["NED","VAN ES Diane","30:57.24","31:39.28"],
    ["NOR","MARIDAL Hanne Mjøen","32:23.20","32:23.20"],
    ["NOR","SIREVÅG Anna Marie Nordengen","31:52.53","31:52.53"],
    ["POL","GLINKA Elżbieta","31:45.36","31:45.36"],
    ["POR","MACHADO Mariana","32:11.96","32:11.96"],
    ["SLO","LUKAN Klara","31:13.18",""],
    ["SLO","MIŠMAŠ ZRIMŠEK Maruša","31:57.85","31:57.85"],
  ],
  "Marathon Women": [
    ["AUT","MAYER Julia","2:26:08","2:29:48"],
    ["AUT","WUTTI Eva","2:30:43","2:36:22"],
    ["BEL","MATHIJS Malejeva","2:40:55","2:42:15"],
    ["BEL","MATHY Valentine","2:34:58",""],
    ["BEL","WARPY Victoria","2:31:50","2:31:50"],
    ["BUL","NINEVA Marinela","2:37:31","2:42:10"],
    ["CZE","HROCHOVÁ Tereza","2:25:58","2:25:58"],
    ["DEN","HØJGAARD Kathrine","2:38:15","2:38:15"],
    ["DEN","PALTORP Luna","2:36:56","2:36:56"],
    ["ESP","LUENGO Laura","2:22:31",""],
    ["ESP","NAVARRETE Ester","2:24:31",""],
    ["ESP","OUHADDOU NAFIE Fatima Azzahraa","2:24:05","2:24:16"],
    ["ESP","ROBLES Carolina","2:24:56","2:24:56"],
    ["ESP","SOLER Meritxell","2:23:49",""],
    ["EST","HUSSAR Liis-Grete","2:38:49","2:38:49"],
    ["FIN","SAAPUNKI Susanna","2:31:32","2:31:32"],
    ["FIN","VAINIO Alisa","2:20:39","2:20:39"],
    ["GBR","DONNELLY Abbie","2:24:11",""],
    ["GBR","EVANS-GRAHAM Clara","2:25:04","2:27:03"],
    ["GBR","HARVEY Rose","2:23:21","2:26:14"],
    ["GBR","PARTRIDGE Lily","2:25:12",""],
    ["GBR","SMALL Louise","2:27:51","2:28:29"],
    ["GBR","WILSON Natasha","2:24:21",""],
    ["GER","HOTTENROTT Laura","2:24:32",""],
    ["GER","KÖNIGSTEIN Fabienne","2:22:17","2:24:31"],
    ["GER","REUTER Nina","2:29:30","2:29:30"],
    ["GER","SAATHOFF Katharina","2:30:52","2:30:52"],
    ["GER","THEMANN Tabea","2:31:33","2:31:53"],
    ["GRE","NOULA Stamatia","2:38:53","2:41:45"],
    ["HUN","KÖRMENDI Réka","2:59:11","2:59:11"],
    ["HUN","SZABÓ Nóra","2:25:52",""],
    ["HUN","TOMASCHOF Kata","2:43:13","2:47:37"],
    ["HUN","VINDICS-TÓTH Lili Anna","2:27:28","2:27:28"],
    ["IRL","MCCORMACK Fionnuala","2:23:46",""],
    ["ISR","BIKAYIA Mentamir","2:45:40",""],
    ["ISR","TEFERI Selamawit","2:26:58","2:26:58"],
    ["ISR","TIYOURI Maor","2:26:39","2:29:30"],
    ["ITA","EPIS Giovanna","2:23:46","2:55:42"],
    ["ITA","LONEDO Rebecca","2:24:28","2:24:28"],
    ["ITA","TUCCITTO Alessia","2:36:16","2:36:16"],
    ["ITA","YAREMCHUK Sofiia","2:23:14",""],
    ["LTU","ŽŪSINAITĖ-NEKRIOŠIENĖ Vaida","2:32:50","2:35:29"],
    ["POL","LISOWSKA Aleksandra","2:24:59",""],
    ["POR","CARVALHO Joana Vanessa","2:32:23","2:32:43"],
    ["POR","DUARTE Sara","2:36:51","2:36:51"],
    ["POR","SILVA Mónica","2:39:11","2:39:11"],
    ["SLO","ŠAJN Liza","2:29:33",""],
    ["SUI","MEIER Andrea","2:36:34","2:36:34"],
    ["SUI","SCHLUMPF Fabienne","2:24:30","2:31:15"],
    ["SUI","SCHNÜRIGER Samira","2:35:59",""],
    ["SUI","VONLANTHEN Fabienne","2:35:29",""],
    ["SVK","PÁLENÍKOVÁ Veronika","2:38:09","2:38:09"],
    ["SWE","JOHNSON Carolina","2:28:01",""],
    ["SWE","LINDHOLM Hanna","2:28:59","2:39:09"],
    ["SWE","MENGSTEAB Samrawit","2:26:33","2:26:33"],
  ],
  "3000 Metres Steeplechase Women": [
    ["BEL","DALEMANS Eline","9:25.80","10:01.74"],
    ["DEN","HELWIGH Anna Mark","9:48.58","9:48.58"],
    ["DEN","HVID Juliane","9:23.12","9:23.12"],
    ["ESP","SERRANO Marta","9:21.00","9:29.44"],
    ["EST","MAASIK Laura","9:44.20","9:56.84"],
    ["FIN","MONONEN Ilona","9:15.18","9:15.18"],
    ["FIN","VIRTANEN Alisa","9:54.83","9:54.83"],
    ["FRA","ENTRESANGLE Clara","9:17.88","9:17.88"],
    ["FRA","FINOT Alice","8:58.67","9:26.74"],
    ["FRA","RENOUARD Flavie","9:14.69","9:21.79"],
    ["GBR","LAWRENCE-WRIST Stevie","9:32.03","9:32.03"],
    ["GBR","TAIT Sarah","9:18.66","9:40.92"],
    ["GBR","THORNER Elise","9:05.45","9:05.45"],
    ["GER","BUDDE Adia","9:26.53","9:26.53"],
    ["GER","GÜRTH Olivia","9:15.17","9:21.73"],
    ["GER","KRAUSE Gesa Felicitas","9:03.30","9:07.50"],
    ["GER","MEYER Lea","9:09.13","9:09.13"],
    ["HUN","URBÁN Zita","9:35.88","9:35.88"],
    ["IRL","SHERIDAN Abbie","9:43.69","9:43.69"],
    ["ISR","COHEN Adva","9:19.90","9:28.81"],
    ["ITA","COLLI Gaia","9:54.06","10:02.03"],
    ["MDA","STAVILA-GROSU Andreea","9:37.17","9:37.17"],
    ["NOR","HENRIKSEN Vilde Våge","9:40.58","9:40.58"],
    ["NOR","NYGÅRD VIE Andrea","9:33.19","9:33.19"],
    ["POL","CHORZĘPA Agnieszka","9:33.03","9:33.03"],
    ["POL","KONIECZEK Alicja","9:16.51","9:47.42"],
    ["POL","KRÓLIK Kinga","9:22.14","9:31.51"],
    ["POR","TABORDA Laura","9:35.67","9:43.82"],
    ["ROU","BLAGA Maria Mihaela","9:44.16","9:44.16"],
    ["SUI","LANG Shirley","9:45.34","9:45.34"],
    ["SWE","LILLEMO Emilia","9:28.99","9:46.23"],
    ["SWE","SAMUELSSON Julia","9:44.36","9:51.75"],
    ["TUR","EROL Sümeyye","9:32.93","9:40.63"],
    ["TUR","KUNUR Derya","9:34.16","9:34.16"],
    ["TUR","YENIGÜN Tuğba","9:23.41","9:33.26"],
  ],
  "100 Metres Hurdles Women": [
    ["AUT","STRAMETZ Karin","12.81","12.97"],
    ["BEL","NDJIP-NYEMECK Yanla","12.71","12.81"],
    ["CZE","BENDOVÁ Ester","12.89","12.89"],
    ["CZE","ŠÍNOVÁ Tereza Elena","12.92","12.92"],
    ["DEN","BEITER BOMME Ida","12.79","12.79"],
    ["DEN","HALDBO Annika Baun","12.96","12.96"],
    ["DEN","LAUGESEN KAMMER Mette","12.83","12.96"],
    ["ESP","PAGES Lerato","13.06","13.06"],
    ["FIN","HARALA Lotta","12.65","12.78"],
    ["FIN","KESKITALO Saara","12.64","12.64"],
    ["FRA","ALESSANDRINI Sacha","12.53","12.53"],
    ["FRA","BAPTÉ Laeticia","12.60","12.60"],
    ["GBR","NWOFOR Emma","12.86","12.86"],
    ["GBR","SEY Marcia","12.65","12.65"],
    ["GER","FLOTOW Lia","12.83","12.83"],
    ["GER","MEIER Marlene","12.84","12.84"],
    ["GER","SCHNEIDER Rosina","12.77","12.77"],
    ["GER","SCHUSTER Franziska","12.69","12.69"],
    ["HUN","KOZÁK Luca","12.59","12.59"],
    ["HUN","TÓTH Anna","12.77","12.79"],
    ["IRL","LAVIN Sarah","12.62","13.31"],
    ["ITA","CARMASSI Giada","12.69","12.90"],
    ["ITA","CARRARO Elena","12.79","12.85"],
    ["ITA","POLZONETTI Celeste","12.74","12.74"],
    ["NED","GROOT-ROMIJN Mira","12.91","12.98"],
    ["NED","TJIN-A-LIM Maayke","12.66","12.86"],
    ["NED","VISSER Nadine","12.28","12.41"],
    ["NOR","ANDRESEN Lovise Skarbøvik","12.89","12.95"],
    ["NOR","BOCK Elea Jørstad","12.87","12.87"],
    ["NOR","KOLBEINSHAVN HJØRNEVIK Martine","12.74","12.74"],
    ["POL","SKRZYSZOWSKA Pia","12.37","12.44"],
    ["POL","WOJTUNIK Klaudia","12.84","12.84"],
    ["SRB","EMINI Milica","12.99","13.16"],
    ["SUI","BERTÉNYI Larissa","12.84","12.84"],
    ["SUI","KAMBUNDJI Ditaji","12.24","12.62"],
    ["SUI","VON JACKOWSKI Selina","12.94","12.98"],
    ["SVK","FORSTER Viktória","12.63","13.12"],
  ],
  "400 Metres Hurdles Women": [
    ["AUT","DLAUHY Anja","54.52","54.52"],
    ["AUT","PRESSLER Lena","54.55","54.55"],
    ["BEL","COUCKUYT Paulien","53.98","53.98"],
    ["CRO","ŠVENDA Natalija","56.01","56.22"],
    ["DEN","RASMUSSEN Martha","56.49","56.49"],
    ["ESP","GALLEGO Sara","54.34","54.36"],
    ["EST","HAMBIDGE Viola","56.00","56.00"],
    ["FIN","SALMINEN Heidi","55.27","55.27"],
    ["FIN","UUSIMÄKI Hilla","54.28","54.28"],
    ["FRA","MARAVAL Louise","53.71","54.05"],
    ["FRA","TUMBA Méta","55.22","55.22"],
    ["GBR","NEWNHAM Emily","53.92","53.92"],
    ["GBR","NIELSEN Lina","54.43","54.69"],
    ["GER","BALDÉ Vanessa","55.36","55.39"],
    ["GER","DEMES Eileen","54.29","54.91"],
    ["HUN","MÁTÓ Sára","55.08","55.08"],
    ["ITA","FOLORUNSO Ayomide","53.89","54.41"],
    ["ITA","MURARO Alice","54.36","54.90"],
    ["ITA","OLIVIERI Linda","54.99","55.53"],
    ["ITA","SARTORI Rebecca","54.82","55.66"],
    ["MON","GASTAUD Marie-Charlotte","58.63","58.63"],
    ["NOR","IUEL Amalie","54.05","54.05"],
    ["NOR","ROOTH Andrea","55.65","55.65"],
    ["NOR","SLETTUM Elisabeth","55.77","56.06"],
    ["POL","GRYC Anna","54.97","54.97"],
    ["POL","SMOLIŃSKA Izabela","55.48","55.48"],
    ["POR","DIALLO Fatoumata Binta","54.31","54.31"],
    ["POR","LAVRESHINA Sofia","54.31","54.31"],
    ["SUI","FAHR Annina","55.50","56.53"],
    ["SUI","GIGER Yasmin","54.77","55.90"],
    ["SUI","WERNLI Lena","55.02","55.40"],
    ["SVK","LEDECKÁ Daniela","54.69","55.26"],
    ["SVK","ZAPLETALOVÁ Emma","52.30","52.30"],
    ["SWE","BJERAGER Tilde","55.82","55.82"],
    ["SWE","GRANAT Moa","55.28","56.43"],
    ["UKR","KYSHKINA Alina","56.09","56.09"],
    ["UKR","TKACHUK Viktoriya","53.76","55.42"],
  ],
  "High Jump Women": [
    ["BEL","MAES Merel","1.97","1.78"],
    ["CYP","IOANNIDOU Styliana","1.91","1.86"],
    ["CYP","KULICHENKO Elena","1.97","1.91 i"],
    ["CZE","HRUBÁ Michaela","1.95 i","1.90 i"],
    ["ESP","STANCEV Una","1.91","1.90"],
    ["EST","BRUUS Karmen","1.96","1.85 i"],
    ["FIN","JUNNILA Ella","1.97","1.91"],
    ["FRA","GICQUEL Solène","1.92 i","1.92 i"],
    ["GBR","LAKE Morgan","2.00","1.88"],
    ["GER","EHLERS Anna-Elisabeth","1.90","1.90"],
    ["GER","GANTERT Dorothea","1.89","1.89"],
    ["GER","HONSEL Christina","2.00","1.94"],
    ["GRE","DOSI Panagiota","1.91","1.86"],
    ["HUN","BÁTORI Lilianna","1.93 i","1.92 i"],
    ["ITA","MORARA Marta","1.90","1.90"],
    ["ITA","PIERONI Idea","1.93","1.90"],
    ["ITA","TAVERNINI Asia","1.92","1.87"],
    ["MNE","VUKOVIĆ Marija","1.98","1.98"],
    ["POL","MIĄSO Wiktoria","1.90","1.88 i"],
    ["POL","SŁODZIŃSKA Maja","1.88","1.88"],
    ["POL","ŻODZIK Maria","2.00","1.98 i"],
    ["SLO","APOSTOLOVSKI Lia","1.95","1.91"],
    ["SLO","VELEPEC Ela","1.90","1.90"],
    ["SRB","TOPIĆ Angelina","2.00 i","2.00 i"],
    ["SWE","EKHOLM Ellen","1.91 i","1.86 i"],
    ["SWE","EKMAN Louise","1.96 i","1.96 i"],
    ["SWE","NILSSON Engla","1.94","1.87"],
    ["TUR","AYGÜN Berra","1.85","1.85"],
    ["UKR","GERASHCHENKO Iryna","2.00","1.97"],
    ["UKR","MAHUCHIKH Yaroslava","2.10","2.03 i"],
  ],
  "Pole Vault Women": [
    ["BEL","VEKEMANS Elien","4.73","4.53"],
    ["CZE","ŠVÁBÍKOVÁ Apolena","4.51","4.51"],
    ["ESP","CLEMENTE Monica","4.46 i","4.46 i"],
    ["EST","MOSER Allika Inkeri","4.52","4.40 i"],
    ["EST","MÜLLA Marleen","4.63 i","4.63 i"],
    ["FIN","ANDERSSON Saga","4.57","4.57"],
    ["FIN","HELTELÄ Wilma","4.85","4.81"],
    ["FIN","LAMPELA Elina","4.70 i","4.50"],
    ["FRA","BONNIN Marie-Julie","4.76 i","4.76 i"],
    ["FRA","CHEVRIER Margot","4.71","4.55"],
    ["FRA","PETIT Berenice","4.60","4.60"],
    ["GBR","TUTTON Gemma","4.52 i","4.52 i"],
    ["GER","KNÄSCHE Anjuli","4.60","4.60"],
    ["GRE","ADAMOPOULOU Ariadni","4.52 i","4.52 i"],
    ["GRE","STEFANIDI Aikaterini","4.91","4.48"],
    ["HUN","KLEKNER Hanga","4.60","4.52 i"],
    ["ITA","MALAVISI Sonia","4.52","4.50"],
    ["ITA","MOLINAROLO Elisa","4.70","4.52"],
    ["ITA","SCARDANZAN Virginia","4.45","4.45"],
    ["LTU","MIKLYČIŪTĖ Rugilė","4.57","4.57"],
    ["NED","DE JONG Elise","4.50","4.47 i"],
    ["NED","KIEFT Marijn","4.60 i","4.60 i"],
    ["NOR","FAYE Kitty Friele","4.70","4.70"],
    ["NOR","RETZIUS Lene Onsrud","4.73","4.61"],
    ["POL","GABORSKA Zofia","4.45 i","4.45 i"],
    ["SLO","ŠUTEJ Tina","4.82 i","4.80 i"],
    ["SUI","BACHMANN Lea","4.58",""],
    ["SUI","MOSER Angelica","4.88","4.80"],
    ["SWE","ROTH Kajsa","4.46","4.46"],
    ["UKR","KYLYPKO Maryna","4.70","4.40 i"],
  ],
  "Long Jump Women": [
    ["CYP","FOTOPOULOU Filippa","6.79","6.78"],
    ["DEN","BEITER BOMME Ida","6.58 i","6.58 i"],
    ["ESP","DIAME Fátima","6.85","6.85"],
    ["ESP","EBOSELE Tessy","6.86","6.86"],
    ["ESP","MITXELENA Irati","6.77","6.77"],
    ["ESP","ROSALES Carmen","6.71","6.71"],
    ["EST","LUSTI Liisa-Maria","6.63 i","6.63 i"],
    ["FRA","BISSEMO Rogilia-chriss","6.80","6.80"],
    ["FRA","DAVID Yanis","6.86","6.86"],
    ["FRA","KPATCHA Hilary","7.02","6.98"],
    ["GBR","HADAWAY Lucy","6.75","6.75"],
    ["GBR","PALMER Molly","6.68 i","6.68 i"],
    ["GBR","SAWYERS Jazmin","7.00 i","6.80"],
    ["GER","ASSANI Mikaelle","6.91","6.67"],
    ["GER","DAALMANN Imke","6.69","6.69"],
    ["GER","MIHAMBO Malaika","7.30","7.05"],
    ["GRE","BESI Natalia","6.62","6.51"],
    ["GRE","GKOGKA Antriana","6.67","6.67"],
    ["HUN","BÁNHIDI-FARKAS Petra","6.78","6.78"],
    ["ITA","IAPICHINO Larissa","7.12","7.12"],
    ["NED","HONDEMA Pauline","6.91","6.66"],
    ["POR","DE SOUSA Agate","7.03","6.97 i"],
    ["ROU","ROTARU-KOTTMANN Alina","6.96","6.71"],
    ["ROU","VERMAN Ramona Elena","6.78","6.78"],
    ["SRB","GARDAŠEVIĆ Milica","6.91","6.66 i"],
    ["SWE","ÅSKAG Maja","6.89","6.89"],
    ["SWE","HALLBERG HOSSAIN Ayla","6.67","6.67"],
    ["SWE","JOHANSSON Tilde","6.73","6.55 i"],
    ["TUR","BÖREKÇI Yasemin Zehra","6.48 i","6.48 i"],
    ["UKR","BUDZYNSKA Iryna","6.82","6.82"],
  ],
  "Triple Jump Women": [
    ["AZE","SARIYEVA Yekaterina","13.89","13.55"],
    ["BEL","GUISSE Saliyya","13.97","13.97"],
    ["BEL","MASSON Ilona","14.52","14.52"],
    ["BUL","NACHEVA Aleksandra","14.35","14.35"],
    ["BUL","PETROVA Gabriela","14.66","14.37"],
    ["CRO","BOROVIĆ Paola","13.66","13.66"],
    ["CRO","PERIĆ Magdalena","13.70","13.70"],
    ["CZE","SUCHÁ Linda","14.03","13.90"],
    ["DEN","NIELSEN Janne","14.13","13.70"],
    ["FIN","SALMINEN Senni","14.63","13.78"],
    ["FRA","GUILLAUME Ilionis","14.59","14.14"],
    ["GER","HILDEBRAND Ruth","13.92","13.92"],
    ["GER","JOYEUX Caroline","14.45","14.22"],
    ["GER","WITTMANN Kira","14.14","14.14"],
    ["GRE","KARYDI Spyridoula","14.19","14.09"],
    ["GRE","KORENEVA Oxana","14.03","14.00"],
    ["ITA","DERKACH Dariya","14.52","14.51"],
    ["ITA","SARACENI Erika Giorgia Anoeta","14.41","14.41"],
    ["LTU","KILTY Dovilė","14.28","13.85"],
    ["LTU","ZAGAINOVA Diana","14.43","13.90"],
    ["MDA","DABIJA Iuliana","13.75","13.75"],
    ["ROU","ION Diana Ana Maria","14.56","14.56"],
    ["ROU","TALOȘ Elena Andreea","14.47","14.33"],
    ["SLO","FILIPIČ Neja","14.50","14.50"],
    ["SRB","MITROVIĆ Aleksandrija","13.92","13.92"],
    ["SRB","ŠPANOVIĆ Ivana","14.41 i","14.41 i"],
    ["SWE","ÅSKAG Maja","14.27","14.24"],
    ["SWE","SJÖSTRAND Emilia","14.09 i","13.63 i"],
    ["TUR","DANIŞMAZ Tuğba","14.57","14.03"],
    ["TUR","DURMUŞ Kadriye Dilek","13.59","13.59"],
  ],
  "Shot Put Women": [
    ["CZE","BRZYSZKOWSKÁ Katrin","17.76","17.76"],
    ["CZE","MAZUROVÁ Martina","16.60","16.34"],
    ["ESP","TOIMIL María Belén","18.80","17.80 i"],
    ["FIN","KANGAS Emilia","18.42","18.29"],
    ["FIN","LAURILA Minttu","16.52","16.52"],
    ["FIN","MÄKITÖRMÄ Senja","17.76","17.52"],
    ["GBR","VINCENT Serena","17.78","17.51"],
    ["GER","KORECKI Alina","18.91","18.56"],
    ["GER","MABRY Yemisi","20.37 i","20.37 i"],
    ["GER","MAISCH Katharina","19.25","19.04"],
    ["GER","NDUBUISI Nina Chioma","18.91","18.62"],
    ["GRE","MAGKOULIA Maria","17.00","17.00"],
    ["GRE","RAFAILIDOU Maria","16.80","16.80"],
    ["HUN","BEREGSZÁSZI Renáta","17.10 i","17.10 i"],
    ["ISL","GUNNARSDÓTTIR Erna Sóley","17.92 i","17.09 i"],
    ["ITA","MUSCI Anna","16.47","16.47"],
    ["ITA","VERTERAMO Sara","16.94","16.94"],
    ["NED","SCHILDER Jessica","21.09","21.09"],
    ["NED","VAN DAALEN Alida","18.66 i","18.13 i"],
    ["NED","VAN KLINKEN Jorinde","19.57 i","19.34"],
    ["POL","MAŚLANA Zuzanna","17.40 i","17.23"],
    ["POR","BANDEIRA Eliana","18.95","18.95"],
    ["POR","DONGMO Auriol","20.43 i","19.17 i"],
    ["POR","INCHUDE Jessica","19.62","19.62"],
    ["SUI","MAZENAUER Miryam","17.55","17.32"],
    ["SWE","JOHANSSON Axelina","19.97","19.97"],
    ["SWE","LUNDGREN Jonna","16.22","16.22"],
    ["SWE","MALMEHED Emilia","16.31","16.31"],
    ["SWE","ROOS Fanny","19.70","19.70"],
    ["SWE","WICKMAN Victoria","16.35","16.35"],
  ],
  "Discus Throw Women": [
    ["CRO","TOLJ Marija","64.71","63.55"],
    ["DEN","JUUL JENSEN Anne","57.95","57.95"],
    ["DEN","NIELSEN Annesofie Hartmann","60.14","60.14"],
    ["DEN","PEDERSEN Lisa Brix","62.22","60.34"],
    ["ESP","LOPEZ Ines","60.57","60.57"],
    ["FIN","LEVEELAHTI Helena","57.09","56.13"],
    ["FRA","ROBERT-MICHON Melina","66.73","65.96"],
    ["GBR","OBAMAKINWA Zara","61.87","61.87"],
    ["GER","BRAUNAGEL Leia","64.96","64.96"],
    ["GER","CRAFT Shanice","68.10","66.18"],
    ["GER","PUDENZ Kristin","67.87","64.28"],
    ["GER","STEINACKER Marike","67.31","66.55"],
    ["GRE","ANAGNOSTOPOULOU Chrysoula","62.40","57.70"],
    ["HUN","KEREKES Dóra","59.00","56.02"],
    ["ISR","VALEANU Estel","59.23","57.37"],
    ["ITA","BENEDETTI Benedetta","58.17","58.17"],
    ["ITA","CONTE Emily","57.11","56.17"],
    ["ITA","OSAKUE Daisy","64.68","64.68"],
    ["LIE","INSINNA Jule","53.85","53.85"],
    ["LTU","GUMBS Ieva","64.98","62.42"],
    ["MDA","EMILIANOV Alexandra","64.42","61.30"],
    ["NED","VAN DAALEN Alida","69.31","69.31"],
    ["NED","VAN KLINKEN Jorinde","70.99","70.99"],
    ["POL","MUSZYŃSKA Weronika","58.12","58.07"],
    ["POL","ZABAWSKA Daria","62.36","62.27"],
    ["POR","CÁ Liliana","66.40","64.08"],
    ["POR","RODRIGUES Irina","66.60","58.89"],
    ["SWE","ERIKSSON Mathilda","58.56","58.56"],
    ["SWE","KAMGA Vanessa","66.61","65.30"],
    ["SWE","LINDFORS Caisa-Marie","62.57","62.46"],
    ["SWE","SALOMONSSON LIND Ebba","59.29","59.29"],
    ["TUR","BECEREK Özlem","61.96","60.33"],
  ],
  "Hammer Throw Women": [
    ["ALB","MORENO Yipsi","76.62","67.85"],
    ["CYP","SAVVA Valentina","70.22","69.68"],
    ["CZE","HOLCOVÁ Tereza","69.43","69.43"],
    ["DEN","JACOBSEN Katrine Koch","75.52","75.52"],
    ["ESP","REDONDO Laura","72.00","70.89"],
    ["ESP","SALES Andrea","70.58","70.58"],
    ["FIN","KOSONEN Silja","77.07","76.41"],
    ["FIN","TERVO Krista","77.35","77.35"],
    ["FRA","LOGA Rose","75.19","75.19"],
    ["GBR","PAYNE Charlotte","72.51","72.18"],
    ["GER","BORUTTA Samantha","72.14","70.28"],
    ["GER","JULIEN Jada","70.48","70.48"],
    ["GER","KUHN Aileen","72.53","72.11"],
    ["GRE","SCARVELIS Stamatia Alexandra","71.95","69.11"],
    ["HUN","CSATÁRI Jázmin","69.01","69.01"],
    ["HUN","NÉMETH Zsanett","70.66","70.46"],
    ["IRL","TUTHILL Nicola","72.73","72.73"],
    ["ISL","HALLGRÍMSDÓTTIR Guðrún Karítas","73.88","73.88"],
    ["ISL","RÚNARSDÓTTIR Elísabet Rut","73.19","73.19"],
    ["ITA","FANTINI Sara","75.77","75.62"],
    ["ITA","MORI Rachele","69.04","68.79"],
    ["NOR","LLANO Beatrice Nedberge","73.21","73.21"],
    ["POL","RÓŻAŃSKA Ewa","72.12","71.04"],
    ["POL","ŚMIECH Aleksandra","71.14","70.84"],
    ["POL","WŁODARCZYK Anita","82.98","75.01"],
    ["SVK","KAŇUCHOVÁ Veronika","69.98","68.58"],
    ["SWE","AHLBERG Grete","70.87","70.61"],
    ["SWE","GARBELL Malin","71.49","71.49"],
    ["SWE","HALLERTH Rebecka","72.62","70.29"],
    ["SWE","KAMGA Patricia","72.17","72.17"],
    ["UKR","KLYMETS Iryna","73.56","70.66"],
  ],
  "Javelin Throw Women": [
    ["CRO","BARBIĆ Vita","60.71","60.71"],
    ["CRO","KOLAK Sara","68.43","62.61"],
    ["CZE","OGRODNÍKOVÁ Nikola","67.40","59.87"],
    ["CZE","SIČAKOVÁ Petra","60.98","60.98"],
    ["CZE","TABAČKOVÁ Nikol","61.44","61.44"],
    ["ESP","AGUILAR Yulenmis","64.17","61.83"],
    ["EST","TUGI Gedly","60.90","60.90"],
    ["FIN","JÄÄSKELÄINEN Jatta-Mari","58.66","56.84"],
    ["FIN","KARELL Emilia","58.59","58.59"],
    ["FIN","NELIMARKKA Rebecca","58.33","58.33"],
    ["FRA","MINARD Alizée","61.69","61.69"],
    ["GBR","JONES Freya","58.12","58.12"],
    ["GER","TREMEL Luisa","58.78","58.78"],
    ["GER","ULBRICHT Julia","61.58","61.58"],
    ["GRE","TZENGKO Elina","65.81","58.37"],
    ["HUN","BOGDÁN Annabella","61.09","58.53"],
    ["ITA","PADOVAN Paola","58.69","58.69"],
    ["LAT","SIETIŅA Anete","64.64","60.05"],
    ["NOR","BORGE Sigrid","66.50","65.00"],
    ["NOR","OBST Marie-Therese","63.50","58.68"],
    ["NOR","PETTERSEN Kaja Mørch","58.47","58.47"],
    ["POL","ANDREJCZYK Maria","71.40","62.78"],
    ["POL","MAŚLAK-GLUGLA Małgorzata","61.79","58.71"],
    ["SRB","VILAGOŠ Adriana","67.22","63.83"],
    ["SRB","VUČENOVIĆ Marija","62.25","60.31"],
    ["SUI","BOSS Sabrina","60.88","60.88"],
    ["SUI","HÜGLI Leonie","62.18","62.18"],
    ["SWE","LANTZ Beatrice","56.03","56.03"],
    ["TUR","TUĞSUZ Eda","67.21","58.47"],
    ["TUR","TÜRKMEN Esra","61.10","61.10"],
  ],
  "Heptathlon Women": [
    ["AUT","MAYR Verena","6591",""],
    ["BEL","VIDTS Noor","6707","6310"],
    ["CRO","KOŠČAK Jana","6293",""],
    ["CZE","TKÁČOVÁ Adéla","6227","6227"],
    ["ESP","COSCULLUELA Sofia","6182","6182"],
    ["ESP","VICENTE María","6304","6174"],
    ["GBR","JOHNSON-THOMPSON Katarina","6981",""],
    ["GBR","O'DOWDA Jade","6391","6350"],
    ["GER","EHLERS Anna-Elisabeth","6216","6216"],
    ["GER","GRIMM Vanessa","6381","6381"],
    ["GER","SPRENGEL Sandrina","6434","6328"],
    ["GER","WEIßENBERG Sophie","6449","6449"],
    ["GRE","NTRAGKOMIROVA Anastasia","6163","5971"],
    ["HUN","KRISZT Sarolta","6251","6224"],
    ["HUN","SZŰCS Szabina","6340","6340"],
    ["IRL","O'CONNOR Kate","6714",""],
    ["ITA","GEREVINI Sveva","6413","6413"],
    ["LTU","JUŠKEVIČIŪTĖ Beatričė","6323","6323"],
    ["NED","DOKTER Sofie","6627","6627"],
    ["NED","OOSTERWEGEL Emma","6705","6705"],
    ["POL","SUŁEK-SCHUBERT Adrianna","6672","6433"],
    ["POR","BARREIRA Jéssica","6311","6311"],
    ["SUI","KÄLIN Annik","6819","6819"],
    ["SWE","KARLSSON Lovisa","6218","6218"],
    ["SWE","WÄRFF Erika","6271","6271"],
  ],
  "Half Marathon Race Walk Women": [
    ["AUT","MOHR Theresia Emma","1:37:51","1:37:51"],
    ["CZE","FRANKLOVÁ Alžběta","1:41:56","1:47:45"],
    ["CZE","KLIMENTOVÁ Ema","1:36:59","1:36:59"],
    ["CZE","MARTÍNKOVÁ Eliška","",""],
    ["ESP","CHAMOSA Antia","1:33:45","1:33:45"],
    ["ESP","MEILÁN Aldara","1:34:44","1:34:44"],
    ["ESP","PÉREZ María","1:32:51","1:32:51"],
    ["FIN","KIVIMÄKI Anniina","1:46:32","1:46:32"],
    ["FIN","NURMI Enni","1:48:49","1:48:49"],
    ["FIN","VEIKKOLA Heta","1:42:54","1:42:54"],
    ["FRA","BERETTA Clémence","1:37:43","1:37:43"],
    ["FRA","DELAHAIE Ana","1:36:42","1:36:42"],
    ["FRA","STEY Pauline","1:33:54","1:33:54"],
    ["GRE","ANTONOPOULOU Anastasia","1:45:33","1:45:33"],
    ["GRE","PAPADOPOULOU Christina","1:37:34","1:37:34"],
    ["HUN","KOVÁCS Alexandra","1:45:55","1:45:55"],
    ["HUN","SPILLER Tiziana","1:40:50","1:40:50"],
    ["ITA","CANTÒ Michelle","1:37:28","1:37:28"],
    ["ITA","COLOMBI Nicole","1:35:44","1:38:00"],
    ["ITA","MIHAI Alexandrina","1:33:51","1:33:51"],
    ["ITA","PALMISANO Antonella","1:32:21","1:32:21"],
    ["LAT","LIEPIŅA Modra","1:53:29","1:53:29"],
    ["LTU","KAVALIAUSKAITĖ Austėja","1:40:14","1:40:14"],
    ["POL","ŻELAZNA Magdalena","1:40:39","1:40:43"],
    ["POR","OLIVEIRA Vitória","1:40:40","1:40:40"],
    ["SRB","STANKOVIĆ Mina","1:37:18","1:37:18"],
    ["SVK","ČERNÁ Hana","1:38:50","1:38:50"],
    ["TUR","BEKMEZ Meryem","1:41:30","1:41:30"],
    ["TUR","CEYLAN Emine","1:44:46","1:44:46"],
    ["TUR","DOST Kader","1:42:34","1:42:34"],
    ["UKR","OLYANOVSKA Lyudmila","1:34:18","1:34:18"],
    ["UKR","SAKHARUK Mariia","1:36:39","1:36:39"],
  ],
  "Marathon Race Walk Women": [
    ["ESP","GONZÁLEZ Raquel","",""],
    ["ESP","MARTINEZ Laura Monje","3:39:11","3:39:11"],
    ["ESP","REDONDO Lucia","",""],
    ["FRA","MOUTARD Camille","3:33:38",""],
    ["GER","DITTRICH Bianca Maria","3:43:54","3:43:54"],
    ["GER","JUNGHANNß Ada","3:43:26",""],
    ["GRE","FIASKA Olga","3:57:57","3:57:57"],
    ["GRE","KOURKOUTSAKI Efstathia","4:13:13","4:13:13"],
    ["GRE","NTRISMPIOTI Antigoni","",""],
    ["GRE","TSINOPOULOU Panagiota","3:38:13","3:38:13"],
    ["ITA","CURIAZZI Federica","3:32:21","3:32:21"],
    ["ITA","FIORINI Sofia","3:25:42","3:25:42"],
    ["ITA","GIORGI Eleonora Anna","3:35:46","3:35:46"],
    ["POL","WALERIAŃCZYK Kinga","3:49:15","3:49:15"],
    ["POL","ZDZIEBŁO Anna","3:46:39","3:46:39"],
    ["POL","ZDZIEBŁO Katarzyna","3:24:19",""],
    ["POR","PONTES Joana","3:51:23","3:51:23"],
    ["TUR","ASLAN Ayşe","3:48:48","3:48:48"],
    ["TUR","GÜVENÇ Kader","3:53:16","3:53:16"],
    ["TUR","ÖZTEKİN Esma","4:08:47","4:08:47"],
    ["UKR","SHEVCHUK Hanna","",""],
  ],
  "4x100 Metres Relay Women": [
    ["AUT","KRIFKA Christiane","",""],
    ["AUT","LINDNER Magdalena","",""],
    ["AUT","POSCH Isabel","",""],
    ["AUT","STRAMETZ Karin","",""],
    ["AUT","WILLIAMS Christania","",""],
    ["BEL","DE NAEYER Janie","",""],
    ["BEL","LAMBERT Kylie","",""],
    ["BEL","NKANSA Delphine","",""],
    ["BEL","ROSIUS Rani","",""],
    ["BEL","SONNEVILLE Camille","",""],
    ["BEL","VAN LENT Lotte","",""],
    ["BEL","VINCKE Rani","",""],
    ["DEN","BEITER BOMME Ida","",""],
    ["DEN","CHRISTOPHERSEN Ronja","",""],
    ["DEN","HALDBO Annika Baun","",""],
    ["DEN","KRUSE JØRGENSEN Amaya","",""],
    ["DEN","LAUGESEN KAMMER Mette","",""],
    ["DEN","VOSS VESTERGAARD Frederikke","",""],
    ["ESP","BESTUÉ Jaël","",""],
    ["ESP","CARRILLO Lucia","",""],
    ["ESP","CLADERA Esperança","",""],
    ["ESP","GUIU Elena","",""],
    ["ESP","MASERAS Ericka Badeau","",""],
    ["ESP","NAVERO Esther","",""],
    ["ESP","PÉREZ Maria Isabel","",""],
    ["ESP","RODRIGO Aitana","",""],
    ["FIN","BOATENG Priscilla","",""],
    ["FIN","ITÄLINNA Vilma","",""],
    ["FIN","KEMPPINEN Lotta","",""],
    ["FIN","KESKITALO Saara","",""],
    ["FIN","MOISIO Tessa","",""],
    ["FIN","NEZIRI Nooralotta","",""],
    ["FIN","PULKKINEN Aino","",""],
    ["FIN","TAINIO Emma","",""],
    ["GBR","AKANDE Mabel","",""],
    ["GBR","AMA-AWUAH Kristal","",""],
    ["GBR","ASHER-SMITH Dina","",""],
    ["GBR","EDUAN Success","",""],
    ["GBR","EZE Joy","",""],
    ["GBR","LANSIQUOT Imani","",""],
    ["GBR","NEITA Daryll","",""],
    ["GBR","SIBBONS Aleeya","",""],
    ["GER","ERNST Jolina","",""],
    ["GER","HAASE Rebekka","",""],
    ["GER","JUNK Sophia","",""],
    ["GER","KADIRI Chelsea","",""],
    ["GER","KAMMERSCHMITT Sina","",""],
    ["GER","LÜCKENKEMPER Gina","",""],
    ["GER","MOKOBE Judith Bilepo","",""],
    ["GRE","ANTONATOU Apostolia","",""],
    ["GRE","EMMANOUILIDOU Polyniki","",""],
    ["GRE","KAMPERIDOU Sofia","",""],
    ["GRE","PAPADERAKI Argyro","",""],
    ["GRE","SPANOUDAKI-CHATZIRIGA Rafailia","",""],
    ["GRE","TSOUKALA Dimitra","",""],
    ["HUN","BRUCKER Lili Hanna","",""],
    ["HUN","CSÓTI Jusztina","",""],
    ["HUN","KOZÁK Luca","",""],
    ["HUN","SULYÁN Alexa","",""],
    ["HUN","SZENTGYÖRGYI Zita","",""],
    ["HUN","TAKÁCS Boglárka","",""],
    ["HUN","TÓTH Anna","",""],
    ["IRL","BERGIN Katie","",""],
    ["IRL","LEAHY Sarah","",""],
    ["IRL","NEVILLE Ciara","",""],
    ["IRL","O'REILLY Mollie","",""],
    ["IRL","ROY Lauren","",""],
    ["IRL","SCOTT Molly","",""],
    ["IRL","SLEEMAN Lucy-may","",""],
    ["ITA","DOSSO Zaynab","",""],
    ["ITA","FONTANA Vittoria","",""],
    ["ITA","HOOPER Gloria","",""],
    ["ITA","KADDARI Dalia","",""],
    ["ITA","PAGLIARINI Alice","",""],
    ["ITA","PAVESE Alessia","",""],
    ["NED","ACHTERBERG Fenna","",""],
    ["NED","DE BLAAUW Britt","",""],
    ["NED","GROOT-ROMIJN Mira","",""],
    ["NED","ROELOFS Anna","",""],
    ["NED","SEEDO N'Ketia","",""],
    ["NED","VAN DEN BERG Isabel","",""],
    ["NED","VAN DE WIEL Anne","",""],
    ["POL","GAJOSZ Wiktoria","",""],
    ["POL","MIERZYŃSKA Jagoda","",""],
    ["POL","POJĘTA Małgorzata","",""],
    ["POL","SKRZYSZOWSKA Pia","",""],
    ["POL","STEFANOWICZ Magdalena","",""],
    ["POL","SWOBODA Ewa","",""],
    ["POL","TSIMANOUSKAYA Krystsina","",""],
    ["POR","BAZOLO Lorène Dorcas","",""],
    ["POR","CASTELHANO Beatriz","",""],
    ["POR","GANDULLA Arialis","",""],
    ["POR","LOURENÇO Catarina","",""],
    ["POR","PINTO Tatjana","",""],
    ["POR","SANTOS Rosalina","",""],
    ["SUI","BECERRA Soraya","",""],
    ["SUI","DEL PONTE Ajla","",""],
    ["SUI","DI TIZIO-FREY Géraldine","",""],
    ["SUI","HOENKE Fabienne","",""],
    ["SUI","KORA Salomé","",""],
    ["SUI","KOUNI Nathacha","",""],
    ["SUI","POINTET Léonie","",""],
    ["SUI","REINLE Cynthia","",""],
    ["SVK","BENDOVÁ Ema","",""],
    ["SVK","FARAJPOUR Delia","",""],
    ["SVK","FORSTER Viktória","",""],
    ["SVK","KORBOVÁ Viktória","",""],
    ["SVK","KOVAČOVICOVÁ Lenka","",""],
    ["SVK","WEIGERTOVÁ Monika","",""],
  ],
  "4x400 Metres Relay Women": [
    ["BEL","COUCKUYT Paulien","",""],
    ["BEL","HANSSENS Ilana","",""],
    ["BEL","LAMBERT Kylie","",""],
    ["BEL","LAUS Camille","",""],
    ["BEL","PONETTE Helena","",""],
    ["BEL","VANDAEL Isalie","",""],
    ["BEL","VAN DEN BROECK Naomi","",""],
    ["CZE","BISOVÁ Nikola","",""],
    ["CZE","HOLUBÁŘOVÁ Věra","",""],
    ["CZE","MALÍKOVÁ Barbora","",""],
    ["CZE","MANUEL Lurdes Gloria","",""],
    ["CZE","PETRŽILKOVÁ Tereza","",""],
    ["CZE","TKÁČOVÁ Adéla","",""],
    ["CZE","VONDROVÁ Lada","",""],
    ["ESP","ARROYO Rocio","",""],
    ["ESP","AVILÉS Carmen","",""],
    ["ESP","GALLEGO Sara","",""],
    ["ESP","HERVÁS Blanca","",""],
    ["ESP","PARRA Herminia","",""],
    ["ESP","PRIETO Ana","",""],
    ["ESP","SANTIDRIÁN Eva","",""],
    ["ESP","SEVILLA Paula","",""],
    ["FIN","BAAS Mette","",""],
    ["FIN","MATTILA Veera","",""],
    ["FIN","NYGÅRD Jeanine","",""],
    ["FIN","PULKKINEN Aino","",""],
    ["FIN","RÄSÄNEN Ella","",""],
    ["FIN","SALMINEN Heidi","",""],
    ["FIN","THURESON Milja","",""],
    ["FIN","UUSIMÄKI Hilla","",""],
    ["FRA","BLACK Isabelle","",""],
    ["FRA","BROSSIER Amandine","",""],
    ["FRA","CHÉRY Orianne","",""],
    ["FRA","KOUAKOU Benedetta","",""],
    ["FRA","LASSERRE Marina","",""],
    ["FRA","MARAVAL Louise","",""],
    ["GBR","ANNING Amber","",""],
    ["GBR","GRIEVE Rebecca","",""],
    ["GBR","HENRICH Charlotte","",""],
    ["GBR","JOHN Yemi Mary","",""],
    ["GBR","NIELSEN Laviai","",""],
    ["GBR","NIELSEN Lina","",""],
    ["GBR","STONEY Louisa","",""],
    ["GBR","YEARGIN Nicole","",""],
    ["GER","BREDAU Luna","",""],
    ["GER","GORR Irina","",""],
    ["GER","HOVEN Annkathrin","",""],
    ["GER","LAKNER Jana","",""],
    ["GER","MARTIN Johanna","",""],
    ["GER","MAYER Mona","",""],
    ["GER","SCHIER Skadi","",""],
    ["IRL","ADELEKE Rhasidat","",""],
    ["IRL","BECKER Sophie","",""],
    ["IRL","BREEN Jenna","",""],
    ["IRL","CROSSAN Arlene","",""],
    ["IRL","DUGGAN Michelle","",""],
    ["IRL","MANNING Cliodhna","",""],
    ["IRL","MAWDSLEY Sharlene","",""],
    ["ITA","BONORA Alessandra","",""],
    ["ITA","BORGA Rebecca","",""],
    ["ITA","CIRILLO Sara","",""],
    ["ITA","MANGIONE Alice","",""],
    ["ITA","POLINARI Anna","",""],
    ["ITA","RICCI Ginevra","",""],
    ["ITA","TROIANI Virginia","",""],
    ["ITA","VIANELLI Clarissa","",""],
    ["NED","BOUMA Andrea","",""],
    ["NED","BROEDERS-BOL Femke","",""],
    ["NED","FRANKE Nina","",""],
    ["NED","KLAVER Lieke","",""],
    ["NED","MERCERA Vanessa","",""],
    ["NED","SAALBERG Eveline","",""],
    ["NED","VAN DER SCHOOT Myrte","",""],
    ["NOR","AKS Josefine Tomine Eriksen","",""],
    ["NOR","ERTZGAARD Astri","",""],
    ["NOR","ERTZGAARD Kaitesi","",""],
    ["NOR","IUEL Amalie","",""],
    ["NOR","JÆGER Henriette","",""],
    ["NOR","VAN DER VEEN Laura Tietje Johanna","",""],
    ["POL","BUKOWIECKA Natalia","",""],
    ["POL","GACKA Kinga","",""],
    ["POL","GRYC Anna","",""],
    ["POL","KORCZUK Natalia","",""],
    ["POL","KUŚ Anastazja","",""],
    ["POL","SMOLIŃSKA Izabela","",""],
    ["POL","WRONA-KUTRZEPA Alicja","",""],
    ["POR","DIALLO Fatoumata Binta","",""],
    ["POR","LAVRESHINA Sofia","",""],
    ["POR","MARTINHA Clara","",""],
    ["POR","VANESSA Carina","",""],
    ["SLO","HORVAT Anita","",""],
    ["SLO","KAUČIČ Ajda","",""],
    ["SLO","MEDJIMUREC Maša","",""],
    ["SLO","POGOREVC Maja","",""],
    ["SLO","ZBIČAJNIK Karolina","",""],
    ["SUI","CALIGIURI Iris","",""],
    ["SUI","FAHR Annina","",""],
    ["SUI","GIGER Yasmin","",""],
    ["SUI","ROLAND Melanie","",""],
    ["SUI","ROSAMILIA Valentina","",""],
    ["SUI","VANCARDO Veronica","",""],
    ["SUI","WERNLI Lena","",""],
    ["SUI","WERRO Audrey","",""],
    ["SVK","GAJANOVÁ Gabriela","",""],
    ["SVK","KORBOVÁ Viktória","",""],
    ["SVK","LEDECKÁ Daniela","",""],
    ["SVK","SEGEČOVÁ Martina","",""],
    ["SVK","SLEZÁKOVÁ Rebecca","",""],
    ["SVK","ZAPLETALOVÁ Emma","",""],
    ["SWE","BJERAGER Tilde","",""],
    ["SWE","CLAESSON Jonna","",""],
    ["SWE","GRANAT Moa","",""],
    ["SWE","THOOR DUNDER Josephine","",""],
    ["SWE","WESTER Elna","",""],
  ],
  "4x100 Metres Relay Mixed Mixed": [
    ["BEL","DE NAEYER Janie","",""],
    ["BEL","SNYDERS Antoine","",""],
    ["BEL","VERSCHUEREN Cédric","",""],
    ["BEL","VINCKE Rani","",""],
    ["ESP","ALFONSO Adria","",""],
    ["ESP","BESTUÉ Jaël","",""],
    ["ESP","CALBANO Andoni","",""],
    ["ESP","CARRILLO Lucia","",""],
    ["ESP","CRESPI Guillem","",""],
    ["ESP","HERNÁNDEZ Jorge","",""],
    ["ESP","MARCO Carmen","",""],
    ["ESP","PÉREZ Maria Isabel","",""],
    ["GBR","ASHER-SMITH Dina","",""],
    ["GBR","AZU Jeremiah","",""],
    ["GBR","EDUAN Success","",""],
    ["GBR","HUGHES Zharnel","",""],
    ["GBR","HUNT Amy","",""],
    ["GBR","JONES Elliot","",""],
    ["GBR","LANSIQUOT Imani","",""],
    ["GBR","MITCHELL-BLAKE Nethaneel","",""],
    ["GER","ANSAH Owen","",""],
    ["GER","ANSAH-PEPRAH Lucas","",""],
    ["GER","GUSSMANN Heiko","",""],
    ["GER","HAASE Rebekka","",""],
    ["GER","KAMMERSCHMITT Sina","",""],
    ["GER","LÜCKENKEMPER Gina","",""],
    ["ITA","BERTON Aurora","",""],
    ["ITA","CAMBIOLO Elena","",""],
    ["ITA","DESALU Eseosa Fostine","",""],
    ["ITA","DEZZA Filippo","",""],
    ["ITA","LONGOBARDI Eduardo","",""],
    ["ITA","MAREK Eric","",""],
    ["ITA","RIGALI Roberto","",""],
    ["ITA","TORCHIO Rachele","",""],
    ["NED","OMALLA Jaimie","",""],
    ["NED","VAN DEN BERG Isabel","",""],
    ["POR","BAZOLO Lorène Dorcas","",""],
    ["POR","CASTELHANO Beatriz","",""],
    ["POR","GANDULLA Arialis","",""],
    ["POR","LANDIM David","",""],
    ["POR","MAIA Gabriel","",""],
    ["POR","PINTO Tatjana","",""],
    ["POR","PRAZERES André","",""],
    ["POR","SANTOS Delvis","",""],
    ["SUI","KORA Salomé","",""],
    ["SUI","SVENSSON Felix","",""],
  ],
  "4x400 Metres Relay Mixed Mixed": [
    ["BEL","BORLÉE Dylan","",""],
    ["BEL","HANSSENS Ilana","",""],
    ["BEL","PONETTE Helena","",""],
    ["BEL","SACOOR Jonathan","",""],
    ["ESP","ERTA Bernat","",""],
    ["ESP","GARCÍA David","",""],
    ["ESP","GARCÍA Samuel","",""],
    ["ESP","HERVÁS Blanca","",""],
    ["ESP","PRIETO Ana","",""],
    ["ESP","SANTIDRIÁN Eva","",""],
    ["ESP","SEVILLA Paula","",""],
    ["FRA","BLACK Isabelle","",""],
    ["FRA","BROSSIER Amandine","",""],
    ["FRA","KOUAKOU Benedetta","",""],
    ["FRA","KOUNTA Muhammad Abdallah","",""],
    ["FRA","MARAVAL Louise","",""],
    ["FRA","MOUDIO PRISO Benoît","",""],
    ["FRA","SPILLMANN Yann","",""],
    ["FRA","VESSAT Samuel","",""],
    ["GBR","ANNING Amber","",""],
    ["GBR","DOBSON Charles","",""],
    ["GBR","HARRIES Toby","",""],
    ["GBR","HENRICH Charlotte","",""],
    ["GBR","HUDSON-SMITH Matthew","",""],
    ["GBR","JEFFERIES Ben","",""],
    ["GBR","JOHN Yemi Mary","",""],
    ["GBR","YEARGIN Nicole","",""],
    ["ITA","ACCAME Ilaria Elvira","",""],
    ["ITA","AKWANNOR Vanni Picco","",""],
    ["ITA","CIRILLO Sara","",""],
    ["ITA","MELI Riccardo","",""],
    ["ITA","SOUDASSI Mohamed","",""],
    ["NED","KLAVER Lieke","",""],
    ["NED","PHIJFFERS Jonas","",""],
    ["NOR","AKS Josefine Tomine Eriksen","",""],
    ["NOR","GRIMERUD Andreas","",""],
    ["NOR","INGVALDSEN Håvard Bentdal","",""],
    ["NOR","IUEL Amalie","",""],
    ["NOR","JÆGER Henriette","",""],
    ["NOR","KULSENG Andreas Ofstad","",""],
    ["NOR","WARHOLM Karsten","",""],
    ["POL","BUKOWIECKA Natalia","",""],
    ["POL","DUSZYŃSKI Kajetan","",""],
    ["POL","GRYC Anna","",""],
    ["POL","KAROLEWSKI Marcin","",""],
    ["POL","KUŚ Anastazja","",""],
    ["POL","SZWED Maksymilian","",""],
    ["POL","WRONA-KUTRZEPA Alicja","",""],
    ["POL","ZAZULA Remigiusz","",""],
  ],
};

const COMPETITIONS = [
  {
    id:"europeo-sub18",
    name:"Campeonato de Europa Sub-18",
    place:"Rieti (ITA) · Stadio Raul Guidobaldi",
    dates:"16–19 julio 2026 · FINALIZADO",
    note:"El mejor Europeo Sub-18 de la historia de España Atletismo: 15 medallas (4 oros) y 24 finalistas, mejorando en una medalla su mejor registro histórico. Primer doblete español de la historia en una misma prueba de este campeonato (400m vallas).",
    events:[
      {name:"400m Vallas Hombres", athletes:[
        {name:"Mauro Seguín", club:"—", mark:"—", result:"🥇 ORO — 50.62"},
        {name:"Tristán Luño", club:"—", mark:"—", result:"🥈 PLATA — 50.65 (MP)"},
      ]},
      {name:"4x400m Hombres (relevo 1.000m)", athletes:[
        {name:"Kiko de las Heras", club:"—", mark:"—", result:"🥈 PLATA — 1:51.81 (récord de España)"},
        {name:"Iker Piñeira", club:"—", mark:"—", result:"🥈 PLATA — 1:51.81 (récord de España)"},
        {name:"Álex Sola", club:"—", mark:"—", result:"🥈 PLATA — 1:51.81 (récord de España)"},
        {name:"Tristán Luño", club:"—", mark:"—", result:"🥈 PLATA — 1:51.81 (récord de España)"},
      ]},
      {name:"Pértiga Mujeres", athletes:[
        {name:"Alba Benito", club:"—", mark:"—", result:"🥉 BRONCE — récord de España Sub-18"},
      ]},
      {name:"1.500m Hombres", athletes:[
        {name:"Álex Sangil", club:"—", mark:"—", result:"🥉 BRONCE"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Nicolás Ceballos", club:"—", mark:"—", result:"🥉 BRONCE — récord de España Sub-18"},
      ]},
      {name:"Triple Salto Hombres", athletes:[
        {name:"Gift Okunrobo", club:"—", mark:"—", result:"🥉 BRONCE"},
      ]},
    ]
  },
  {
    id:"iberoamericano",
    name:"Campeonato Iberoamericano de Atletismo",
    place:"Lima (PER) · Estadio Atlético de la Videna",
    dates:"29–31 mayo 2026 · FINALIZADO",
    note:"España ganó 12 medallas (4 oros, 4 platas, 4 bronces) con 16 atletas — el 75% de la expedición subió al podio y todos acabaron entre los ocho primeros de su prueba.",
    events:[
      {name:"Pértiga Mujeres", athletes:[
        {name:"Naiara Pérez", club:"Sub-23, 6ª en el Mundial Sub-20 de 2024", mark:"—", result:"🥇 ORO — 4.20 m"},
      ]},
      {name:"800m Hombres", athletes:[
        {name:"David Barroso", club:"—", mark:"—", result:"🥇 ORO — 1:46.30"},
      ]},
      {name:"10.000m Mujeres", athletes:[
        {name:"Beatriz Álvarez", club:"—", mark:"—", result:"🥇 ORO — 33:45.53"},
      ]},
      {name:"Pértiga Hombres", athletes:[
        {name:"Isidro Leyva", club:"—", mark:"—", result:"🥇 ORO — 5.40 m"},
        {name:"Alex Gracia", club:"—", mark:"—", result:"🥈 PLATA — 5.30 m"},
      ]},
      {name:"Altura Mujeres", athletes:[
        {name:"Una Stancev", club:"—", mark:"—", result:"🥈 PLATA — 1.90 m"},
      ]},
      {name:"Longitud Hombres", athletes:[
        {name:"Carlos Beltrán", club:"Primera medalla internacional de su carrera", mark:"—", result:"🥈 PLATA — 7.91 m (2ª mejor marca de su vida)"},
      ]},
      {name:"10.000m Marcha Mujeres", athletes:[
        {name:"Lidia Sánchez-Puebla", club:"—", mark:"—", result:"🥉 BRONCE — 45:16.52"},
        {name:"Lucía Redondo", club:"—", mark:"—", result:"4ª — 45:45.43"},
      ]},
      {name:"Altura Hombres", athletes:[
        {name:"Pablo Martínez", club:"—", mark:"—", result:"🥉 BRONCE — 2.13 m"},
      ]},
      {name:"400m Vallas Hombres", athletes:[
        {name:"Javier Lorente", club:"Primera internacionalidad", mark:"—", result:"Medalla — 50.61 (color exacto sin confirmar en la fuente)"},
      ]},
      {name:"Peso Mujeres", athletes:[
        {name:"Belén Toimil", club:"—", mark:"—", result:"Medalla — 17.57 m (color exacto sin confirmar en la fuente)"},
      ]},
      {name:"Jabalina Hombres", athletes:[
        {name:"Manu Quijera", club:"—", mark:"—", result:"🥉 BRONCE"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Ángel Díaz", club:"—", mark:"—", result:"5º — 13.85"},
        {name:"Daniel Cisneros", club:"—", mark:"—", result:"7º — 14.52"},
      ]},
    ]
  },
  {
    id:"mundial-indoor-torun",
    name:"Campeonato del Mundo en Pista Cubierta",
    place:"Toruń (POL) · Kujawsko-Pomorska Arena",
    dates:"20–22 marzo 2026 · FINALIZADO",
    note:"España firmó su segunda mejor actuación histórica en un Mundial Indoor: 5 medallas (1 oro, 2 platas, 2 bronces) y 3 finalistas más, con 22 atletas convocados (12 hombres, 10 mujeres). Mariano García se convirtió en el primer atleta en ganar los títulos mundiales bajo techo de 800 m y 1.500 m. Se pudo seguir en España por Teledeporte.",
    events:[
      {name:"1.500m Hombres", athletes:[
        {name:"Mariano García", club:"Campeón de Europa 800m 2022 — doblete histórico tras su oro en 800m", mark:"—", result:"🥇 ORO — primer atleta en la historia en ganar los mundiales indoor de 800m y 1.500m"},
      ]},
      {name:"800m Hombres", athletes:[
        {name:"Mohamed Attaoui", club:"Plusmarquista español", mark:"1:42.04", result:"🥉 BRONCE"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Quique Llopis", club:"—", mark:"13.09", result:"🥈 PLATA — récord de España"},
      ]},
      {name:"4x400m Mixto", athletes:[
        {name:"Blanca Hervás", club:"Clave también en el 4x400 femenino", mark:"50.46", result:"🥈 PLATA"},
        {name:"Paula Sevilla", club:"—", mark:"50.68", result:"🥈 PLATA"},
      ]},
      {name:"4x400m Mujeres", athletes:[
        {name:"Blanca Hervás", club:"—", mark:"50.46", result:"🥉 BRONCE"},
        {name:"Paula Sevilla", club:"6ª en 400m individual — gran temporada de progresión", mark:"50.68", result:"🥉 BRONCE"},
      ]},
    ]
  },
  {
    id:"dl-lausanne",
    name:"Diamond League — Lausana (Athletissima)",
    place:"Lausana (SUI) · Stade Olympique de la Pontaise",
    dates:"21 agosto 2026 · PRÓXIMAMENTE",
    note:"Duodécima cita de la Diamond League 2026. Entry list oficial completa confirmada en lausanne.diamondleague.com: 3 españoles — David Barroso (800 m), Jesús David Delgado (400 m vallas) y Berta Segura (800 m, carrera B). Mohamed Attaoui, mencionado en previas como posible participante, no figura finalmente en la entry list oficial de 800 m. Cartel del 800 m masculino: Marco Arop (Canadá, PB 1:41.20), Emmanuel Wanyonyi (Kenia, PB 1:41.11), Djamel Sedjati (Argelia, PB 1:41.46) y Gabriel Tual (Francia, PB 1:41.61).",
    events:[
      {name:"800m Hombres", athletes:[
        {name:"David Barroso", club:"26º del ranking mundial — SB 1:43.60", mark:"1:43.60"},
      ]},
      {name:"400m Vallas Hombres", athletes:[
        {name:"Jesús David Delgado", club:"20º del ranking mundial — SB 48.11", mark:"48.11"},
      ]},
      {name:"800m Mujeres (carrera B)", athletes:[
        {name:"Berta Segura", club:"Carrera B — sin marca de temporada registrada en la entry list", mark:"—"},
      ]},
    ]
  },
  {
    id:"dl-silesia",
    name:"Diamond League — Silesia (Kamila Skolimowska Memorial)",
    place:"Chorzów (POL) · Stadion Śląski",
    dates:"23 agosto 2026 · PRÓXIMAMENTE",
    note:"Decimotercera cita de la Diamond League 2026, penúltima antes de la final de Bruselas. Entry list oficial confirmada en silesia.diamondleague.com: 3 españoles — Daniel Arce (3.000 m obstáculos), Marta García (5.000 m) y Lorea Ibarzabal (1.500 m).",
    events:[
      {name:"3.000m Obstáculos Hombres", athletes:[
        {name:"Daniel Arce", club:"10º del ranking mundial — SB 8:11.42, PB 8:08.45", mark:"8:08.45"},
      ]},
      {name:"5.000m Mujeres", athletes:[
        {name:"Marta García", club:"10ª del ranking mundial — SB 15:39.98, PB 14:33.40", mark:"14:33.40"},
      ]},
      {name:"1.500m Mujeres", athletes:[
        {name:"Lorea Ibarzabal", club:"SB y PB de la temporada: 4:07.28", mark:"4:07.28"},
      ]},
    ]
  },
  {
    id:"mundial-ruta",
    name:"Campeonato del Mundo de Ruta",
    place:"Copenhague (DEN)",
    dates:"19–20 septiembre 2026 · PRÓXIMAMENTE",
    note:"Segunda edición del World Athletics Road Running Championships (la primera fue Riga 2023). El sábado 19 se disputan la milla y los 5.000 m; el domingo 20, la media maratón. Cuatro nombres destacados de la delegación española: Marta García debuta en ruta en los 5.000 m tras su plata en el Europeo de Birmingham; Martín Segurola, campeón de España de 3.000 m en pista cubierta, añade la milla a su repertorio; y Said Mechaal y Marta Galimany encabezan la preselección de media maratón.",
    events:[
      {name:"5.000m Mujeres", athletes:[
        {name:"Marta García", club:"Subcampeona de Europa de 5.000 m en Birmingham 2026 — debut en una prueba de ruta", mark:"—"},
      ]},
      {name:"Milla Hombres", athletes:[
        {name:"Martín Segurola", club:"Campeón de España de 3.000 m en pista cubierta, bronce por equipos en el Europeo de Campo a Través", mark:"—"},
      ]},
      {name:"Media Maratón Mujeres", athletes:[
        {name:"Marta Galimany", club:"Preseleccionada el 16 de junio junto a Carla Gallardo", mark:"—"},
      ]},
      {name:"Media Maratón Hombres", athletes:[
        {name:"Said Mechaal", club:"Preseleccionado el 16 de junio para la media maratón", mark:"—"},
      ]},
    ]
  },
  {
    id:"juegos-mediterraneos",
    name:"Juegos Mediterráneos",
    place:"Tarento (ITA)",
    dates:"30 agosto–3 septiembre 2026 · PRÓXIMAMENTE",
    note:"Convocatoria oficial completa de atletismo publicada por España Atletismo (gráfico oficial), dentro de la delegación total española de 247 deportistas (132 hombres, 115 mujeres) en 29 deportes confirmada por el Comité Olímpico Español.",
    events:[
      {name:"200m Hombres", athletes:[
        {name:"Andoni Calbano", club:"Líder español del año, plusmarquista de 4x100m mixto", mark:"20.63"},
      ]},
      {name:"400m Hombres", athletes:[
        {name:"Jorge García", club:"Rebajó su marca personal en más de dos segundos esta temporada", mark:"45.63"},
      ]},
      {name:"800m Hombres", athletes:[
        {name:"David Barroso", club:"Campeón de España, campeón mundial universitario", mark:"1:43.60"},
      ]},
      {name:"10.000m Hombres", athletes:[
        {name:"Pablo Alba", club:"—", mark:"—"},
        {name:"Miguel Baidal", club:"—", mark:"—"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Hugo Chapado", club:"Recientemente preseleccionado tras el Nacional de Málaga", mark:"13.58"},
        {name:"Gonzalo Sabin Lamborena", club:"Semifinalista Europeo Sub-23 Bergen 2025", mark:"13.56"},
      ]},
      {name:"400m Vallas Hombres", athletes:[
        {name:"Jesús David Delgado", club:"Plusmarquista nacional, 3ª marca europea del año", mark:"48.11"},
      ]},
      {name:"Pértiga Hombres", athletes:[
        {name:"Artur Coll", club:"—", mark:"—"},
      ]},
      {name:"Longitud Hombres", athletes:[
        {name:"Carlos Beltrán", club:"—", mark:"—"},
      ]},
      {name:"Disco Hombres", athletes:[
        {name:"Diego Casas", club:"4º marquista histórico español", mark:"65.95 m"},
      ]},
      {name:"Jabalina Hombres", athletes:[
        {name:"Manu Quijera", club:"Campeón de España, líder del año", mark:"83.28 m"},
      ]},
      {name:"200m Mujeres", athletes:[
        {name:"Alba Borrero", club:"Campeona de España en Short Track, 4ª en el Iberoamericano de Lima", mark:"23.11"},
      ]},
      {name:"400m Mujeres", athletes:[
        {name:"Ana Prieto", club:"2ª mejor Sub-23 de la historia, récord de España de relevos 4x400m", mark:"51.62"},
      ]},
      {name:"800m Mujeres", athletes:[
        {name:"Lorea Ibarzabal", club:"Olímpica, 6 veces campeona de España", mark:"1:59.60"},
      ]},
      {name:"1.500m Mujeres", athletes:[
        {name:"Marta García", club:"5 veces campeona de España, plata en el Europeo de Birmingham", mark:"—"},
      ]},
      {name:"100m Vallas Mujeres", athletes:[
        {name:"Paula Blanquer", club:"Finalista mundial Sub-20 en 2022, bronce nacional 2025", mark:"13.07"},
        {name:"Lerato Pagès", club:"Subcampeona de España 2025, líder española del año — récord de España Sub-20", mark:"13.06"},
      ]},
      {name:"Altura Mujeres", athletes:[
        {name:"Una Stancev", club:"3ª marca española histórica", mark:"1.91 m"},
      ]},
      {name:"Pértiga Mujeres", athletes:[
        {name:"Mónica Clemente", club:"—", mark:"4.46 m"},
      ]},
      {name:"Longitud Mujeres", athletes:[
        {name:"Carmen Rosales", club:"Bronce en Málaga — debut absoluto", mark:"6.71 m"},
      ]},
      {name:"Martillo Mujeres", athletes:[
        {name:"Laura Redondo", club:"Plusmarquista nacional", mark:"72.00 m"},
        {name:"Andrea Sales", club:"19 años — campeona de España, récord Sub-23", mark:"70.58 m"},
      ]},
      {name:"Jabalina Mujeres", athletes:[
        {name:"Yulenmis Aguilar", club:"Campeona de España, finalista olímpica en París", mark:"64.17 m"},
      ]},
    ]
  },
  {
    id:"mundial-sub20",
    name:"Campeonato del Mundo Sub-20",
    place:"Eugene (USA) · Hayward Field",
    dates:"5–9 agosto 2026 · FINALIZADO",
    note:"España cerró el Mundial Sub-20 con 4 medallas (1 oro, 3 bronces) y 11 finalistas — iguala el récord histórico de medallas en un Mundial Sub-20 (Sudbury 1988) y logra la 13ª posición en el medallero global, la mejor desde 1996. Convocatoria oficial completa: 47 atletas (27 hombres, 20 mujeres) — segunda expedición más numerosa en las 20 ediciones del campeonato, solo por detrás de Barcelona 2012 (54). Publicada por RFEA el 04/08/2026.",
    events:[
      {name:"100m Mujeres", athletes:[
        {name:"Celia Cortés", club:"Campeona de España — 6ª de todos los tiempos", mark:"11.49", result:"Eliminada en Ronda 1 — 11.68 (no pasa a semifinales)"},
        {name:"María Portela", club:"Récord de España Sub-20 (18/06/2026)", mark:"11.39", result:"Eliminada en Ronda 1 — 11.72 (no pasa a semifinales)"},
      ]},
      {name:"200m Mujeres", athletes:[
        {name:"María Portela", club:"3ª española de todos los tiempos", mark:"23.40"},
      ]},
      {name:"1.500m Mujeres", athletes:[
        {name:"Claudia Gutiérrez", club:"Campeona de España — 3ª de todos los tiempos", mark:"4:12.59"},
      ]},
      {name:"3.000m Mujeres", athletes:[
        {name:"Claudia Gutiérrez", club:"Doblete — plusmarca nacional Short Track", mark:"9:14.65"},
      ]},
      {name:"5.000m Mujeres", athletes:[
        {name:"Fátima Hernández", club:"Campeona de España — 3ª de todos los tiempos", mark:"16:06.55", result:"19ª — 16:31.98 (final disputada 5 ago)"},
      ]},
      {name:"100m Vallas Mujeres", athletes:[
        {name:"Fiona Cavilli", club:"Campeona de España — debut con España Atletismo", mark:"13.46"},
      ]},
      {name:"Altura Mujeres", athletes:[
        {name:"Aitana Alonso", club:"Campeona de España — 3ª de todos los tiempos", mark:"1.87 m", result:"🥉 BRONCE — 1.90 m (iguala el récord de España Sub-20)"},
      ]},
      {name:"Triple Salto Mujeres", athletes:[
        {name:"Naida Calonge", club:"Campeona de España — líder ránking absoluto", mark:"13.53 m", result:"5ª — 13.34 m (nueva plusmarca personal)"},
        {name:"Ana Estrella de León", club:"San Juan Aznalfarache — 4ª de todos los tiempos", mark:"13.70 m", result:"🥉 BRONCE — 13.58 m (mejor marca de la temporada)"},
      ]},
      {name:"Peso Mujeres", athletes:[
        {name:"Andrea Njimi Tankeu", club:"Campeona de Europa Sub-20 vigente", mark:"—"},
      ]},
      {name:"Disco Mujeres", athletes:[
        {name:"Andrea Njimi Tankeu", club:"Plusmarquista nacional", mark:"55.85 m"},
      ]},
      {name:"5.000m Marcha Mujeres", athletes:[
        {name:"Gina Torres", club:"Campeona de España", mark:"22:38.87"},
        {name:"Irene Vega", club:"Subcampeona de España", mark:"23:39.09"},
      ]},
      {name:"4x100m Mujeres", athletes:[
        {name:"Carla Aguirre", club:"Récord nacional Sub-20 (Villafranca)", mark:"—"},
        {name:"Celia Cortés", club:"—", mark:"—"},
        {name:"Marina Delgado", club:"—", mark:"11.71"},
        {name:"María Portela", club:"—", mark:"—"},
        {name:"María Carla Retana", club:"Subcampeona de España 200 m", mark:"11.71"},
      ]},
      {name:"4x400m Mujeres", athletes:[
        {name:"Ana Alba Ruiz", club:"Campeona de España 400 m — 6ª de todos los tiempos", mark:"53.55"},
        {name:"Rocío Navarro", club:"10ª de todos los tiempos", mark:"53.71"},
        {name:"Alaine Aguerralde", club:"—", mark:"54.33"},
        {name:"Carla Rodríguez", club:"—", mark:"54.48"},
        {name:"Lilian Cazorla", club:"—", mark:"54.68"},
      ]},
      {name:"800m Hombres", athletes:[
        {name:"Alejandro Ríos", club:"Campeón de España — 7º de todos los tiempos", mark:"1:47.38", result:"🥉 BRONCE — 1:46.25 en la final (primer podio español Sub-20 en 800 m en 24 años)"},
        {name:"Alejandro Muñoz", club:"Subcampeón de España", mark:"1:47.64", result:"Clasificado a la FINAL — 3º en semifinal, 1:49.08"},
      ]},
      {name:"1.500m Hombres", athletes:[
        {name:"Pol Molins", club:"Campeón de España — récord de España 1000m ST y Milla ST", mark:"3:39.26"},
        {name:"Karim Fartaz", club:"Subcampeón de España", mark:"3:43.00"},
      ]},
      {name:"3.000m Hombres", athletes:[
        {name:"Alejandro Ibáñez", club:"6º de todos los tiempos — 14º en Europeo Sub-20 Tampere", mark:"8:00.73", result:"Final disputada — 7:58.95 (baja de 8:00 por primera vez, 6ª marca española histórica)"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Gregorio Luis Crespo", club:"Campeón de España — top-10 histórico", mark:"13.70"},
      ]},
      {name:"400m Vallas Hombres", athletes:[
        {name:"Alejandro Ibáñez", club:"Campeón de España — 2º de todos los tiempos", mark:"50.10", result:"Semifinalista — ganó su serie de 1ª ronda con 50.77 y fue 6º de su semifinal con 50.95 (sin final)"},
        {name:"Diego Espeso", club:"Subcampeón — 6º de todos los tiempos", mark:"50.59", result:"Clasificado a semifinales desde la 1ª ronda (doblete español en semis)"},
      ]},
      {name:"3.000m Obstáculos Hombres", athletes:[
        {name:"Bakr El Asri", club:"Récord de España y de Europa Sub-20", mark:"8:24.40", result:"🥇 ORO — 8:28.35 (nuevo récord de Europa Sub-20)"},
        {name:"Martí Torregrosa", club:"Campeón de Europa Sub-20 vigente — 3º de todos los tiempos", mark:"8:35.43"},
      ]},
      {name:"Altura Hombres", athletes:[
        {name:"Nicolás Clemente", club:"Campeón de España", mark:"2.16 m (MP, Albacete 19/07)", result:"Sin resultado oficial confirmado en Eugene — oro para Younes Ayachi (ALG, 2.21 m)"},
        {name:"Alejandro Muñoz", club:"Subcampeón — oro Iberoamericano Sub-20 Lima", mark:"2.14 m", result:"Sin resultado oficial confirmado en la altura de Eugene"},
      ]},
      {name:"Pértiga Hombres", athletes:[
        {name:"Marco Rodríguez", club:"Campeón de España — 9º de todos los tiempos", mark:"5.32 m"},
        {name:"Enzo Martínez", club:"Subcampeón de España", mark:"5.12 m"},
      ]},
      {name:"Longitud Hombres", athletes:[
        {name:"Anthony Yunier Pérez", club:"Campeón de España — 8º de todos los tiempos", mark:"7.78 m"},
        {name:"Aritz Goñi", club:"10º de todos los tiempos", mark:"7.72 m"},
      ]},
      {name:"Triple Salto Hombres", athletes:[
        {name:"Yoel Pérez", club:"Subcampeón de España — bronce FOJE 2025", mark:"15.65 m"},
      ]},
      {name:"Martillo Hombres", athletes:[
        {name:"Magno Llopis", club:"Campeón de España — 7º de todos los tiempos", mark:"71.50 m"},
      ]},
      {name:"5.000m Marcha Hombres", athletes:[
        {name:"César Hidalgo", club:"—", mark:"20:10.86"},
        {name:"Pablo Zárate", club:"—", mark:"20:25.92"},
      ]},
      {name:"4x400m Hombres", athletes:[
        {name:"Pablo Rojo", club:"Campeón de España 400 m — 9º de todos los tiempos", mark:"46.82"},
        {name:"Aarón Gastón", club:"2º del ránking nacional", mark:"47.04"},
        {name:"Alejandro Núñez", club:"Subcampeón de España 400 m", mark:"47.11"},
        {name:"Óscar Crespo", club:"3º en Albacete", mark:"47.14"},
        {name:"Lucas Vázquez", club:"4º en Albacete", mark:"47.82"},
      ]},
      {name:"4x100m Mixto", athletes:[
        {name:"Carla Aguirre", club:"—", mark:"—"},
        {name:"Celia Cortés", club:"—", mark:"—"},
        {name:"Marina Delgado", club:"—", mark:"—"},
        {name:"María Portela", club:"—", mark:"—"},
        {name:"María Carla Retana", club:"—", mark:"—"},
        {name:"Hugo Pérez", club:"Subcampeón de España 100 m", mark:"10.47"},
        {name:"Anthony Yunier Pérez", club:"—", mark:"10.78"},
        {name:"Javier Viota", club:"Campeón de España 200 m", mark:"10.71"},
      ]},
      {name:"4x400m Mixto", athletes:[
        {name:"Alaine Aguerralde", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Lilian Cazorla", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Rocío Navarro", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Carla Rodríguez", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Ana Alba Ruiz", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Óscar Crespo", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Aarón Gastón", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Alejandro Núñez", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Pablo Rojo", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
        {name:"Lucas Vázquez", club:"—", mark:"—", result:"Clasificados a la final (3ª de su serie, 3:21.90)"},
      ]},
    ]
  },
  {
    id:"europeo-birmingham",
    name:"Campeonato de Europa",
    place:"Birmingham (GBR) · Alexander Stadium",
    dates:"10–16 agosto 2026 · FINALIZADO",
    note:"España cerró el campeonato con 8 medallas (2 oros, 2 platas, 4 bronces) — su mejor cosecha reciente. Convocatoria: 94 atletas (48 mujeres, 46 hombres), la mayor expedición de la historia, por delante de Berlín 2018 (92). Capitanes: Miguel Ángel López y Maribel Pérez.",
    events:[
      {name:"100m Mujeres", athletes:[
        {name:"Maribel Pérez", club:"Campeona de España — capitana del equipo", mark:"11.07"},
      ]},
      {name:"200m Mujeres", athletes:[
        {name:"Jaël-Sakura Bestué", club:"Plusmarquista nacional, 7 veces campeona de España", mark:"22.19", result:"7ª en la final — 22.69"},
        {name:"Esperança Cladera", club:"Bronce en Málaga", mark:"22.79"},
        {name:"Alba Borrero", club:"Subcampeona de España", mark:"22.97"},
      ]},
      {name:"400m Mujeres", athletes:[
        {name:"Blanca Hervás", club:"Campeona de España, 2ª marquista histórica", mark:"50.46"},
        {name:"Paula Sevilla", club:"Bronce Europeo indoor 2025", mark:"50.68"},
        {name:"Ana Prieto", club:"2ª mejor Sub-23 de la historia", mark:"51.62"},
      ]},
      {name:"800m Mujeres", athletes:[
        {name:"Rocío Arroyo", club:"Campeona de España", mark:"1:59.17"},
        {name:"Marta Mitjans", club:"Campeona de España Sub-23", mark:"1:59.28"},
        {name:"Lorea Ibarzabal", club:"Olímpica, 6 veces campeona de España", mark:"1:59.60"},
      ]},
      {name:"5.000m Mujeres", athletes:[
        {name:"Marta García", club:"5 veces campeona de España, bronce europeo", mark:"14:33.40", result:"🥈 PLATA — 1ª medalla española del campeonato"},
        {name:"Idaira Prieto", club:"Subcampeona de España en Málaga", mark:"14:55.15"},
        {name:"María Forero", club:"Campeona de Europa Sub-23 de cross", mark:"15:03.88"},
      ]},
      {name:"10.000m Mujeres", athletes:[
        {name:"Carla Gallardo", club:"Récord de España de 10 km en ruta", mark:"32:08.17"},
        {name:"Idaira Prieto", club:"Doble prueba", mark:"32:06.00", result:"4ª en la final — 31:59.84 (récord personal)"},
      ]},
      {name:"Maratón Mujeres", athletes:[
        {name:"Fátima Azzaharaa Ouhaddou", club:"Campeona de Europa de maratón vigente", mark:"—", result:"15ª — 2h30:37"},
        {name:"Laura Luengo", club:"—", mark:"—"},
        {name:"Ester Navarrete", club:"—", mark:"—", result:"18ª — 2h31:57"},
        {name:"Carolina Robles", club:"—", mark:"—", result:"8ª (debut internacional) — 2h28:07"},
        {name:"Meritxell Soler", club:"—", mark:"—", result:"20ª — 2h32:21"},
      ]},
      {name:"100m Vallas Mujeres", athletes:[
        {name:"Lerato Pagès", club:"Campeona de España — debut absoluto", mark:"13.06"},
      ]},
      {name:"400m Vallas Mujeres", athletes:[
        {name:"Sara Gallego", club:"Plusmarquista nacional, 6 veces campeona de España", mark:"54.34"},
      ]},
      {name:"3.000m Obstáculos Mujeres", athletes:[
        {name:"Marta Serrano", club:"3 veces campeona de España", mark:"9:21.00"},
      ]},
      {name:"Altura Mujeres", athletes:[
        {name:"Una Stancev", club:"3ª marca española histórica", mark:"1.91 m"},
      ]},
      {name:"Pértiga Mujeres", athletes:[
        {name:"Mónica Clemente", club:"—", mark:"4.46 m"},
      ]},
      {name:"Longitud Mujeres", athletes:[
        {name:"Fátima Diame", club:"Campeona de España, finalista en Roma 2024", mark:"6.85 m", result:"6ª en la final — 6.80 m (mejor resultado de su carrera al aire libre)"},
        {name:"Tessy Ebosele", club:"Líder española del año", mark:"6.86 m"},
        {name:"Carmen Rosales", club:"Bronce en Málaga — debut absoluto", mark:"6.71 m"},
      ]},
      {name:"Peso Mujeres", athletes:[
        {name:"Belén Toimil", club:"7 veces campeona de España, récord nacional", mark:"18.80 m"},
      ]},
      {name:"Disco Mujeres", athletes:[
        {name:"Inés López", club:"2ª mejor marca española histórica", mark:"60.57 m", result:"12ª — 59.85 m"},
      ]},
      {name:"Martillo Mujeres", athletes:[
        {name:"Laura Redondo", club:"Plusmarquista nacional", mark:"72.00 m"},
        {name:"Andrea Sales", club:"19 años — campeona de España, récord Sub-23", mark:"70.58 m"},
      ]},
      {name:"Jabalina Mujeres", athletes:[
        {name:"Yulenmis Aguilar", club:"Campeona de España, finalista olímpica en París", mark:"64.17 m", result:"9ª en la final — 57.06 m (59.85 m en clasificación)"},
      ]},
      {name:"Heptatlón Mujeres", athletes:[
        {name:"María Vicente", club:"Campeona de España, olímpica, récord de España", mark:"6304 pts", result:"8ª — 6372 pts, NUEVO RÉCORD DE ESPAÑA (superó su propia plusmarca en 68 puntos)"},
        {name:"Sofía Cosculluela", club:"Líder española del año, campeona NCAA", mark:"6182 pts", result:"15ª — 5999 pts"},
      ]},
      {name:"4x100m y 4x100m mixto Mujeres", athletes:[
        {name:"Jaël-Sakura Bestué", club:"—", mark:"—"},
        {name:"Esperança Cladera", club:"—", mark:"—"},
        {name:"María Isabel Pérez", club:"—", mark:"—"},
        {name:"Lucía Carrillo", club:"—", mark:"—"},
        {name:"Elena Guiu", club:"—", mark:"—"},
        {name:"Ericka Badeau Maseras", club:"—", mark:"—"},
        {name:"Ester Navero", club:"—", mark:"—"},
        {name:"Aitana Rodrigo", club:"—", mark:"—"},
      ]},
      {name:"4x400m y 4x400m mixto Mujeres", athletes:[
        {name:"Blanca Hervás", club:"—", mark:"—", result:"4ª en la final — 3:24.39 (mejor marca histórica de España en la prueba)"},
        {name:"Paula Sevilla", club:"—", mark:"—", result:"4ª en la final — 3:24.39 (mejor marca histórica de España en la prueba)"},
        {name:"Sara Gallego", club:"—", mark:"—"},
        {name:"Rocío Arroyo", club:"Récord de España de relevos (3:21.25)", mark:"—", result:"4ª en la final — 3:24.39 (mejor marca histórica de España en la prueba)"},
        {name:"Ana Prieto", club:"—", mark:"—", result:"4ª en la final — 3:24.39 (mejor marca histórica de España en la prueba)"},
        {name:"Eva Santidrián", club:"—", mark:"—"},
        {name:"Herminia Parra", club:"—", mark:"—"},
        {name:"Carmen Avilés", club:"—", mark:"—"},
      ]},
      {name:"Media Maratón Marcha Mujeres", athletes:[
        {name:"María Pérez", club:"Campeona olímpica y doble campeona del mundo", mark:"—", result:"🥇 ORO"},
        {name:"Antía Chamosa", club:"—", mark:"—", result:"9ª"},
        {name:"Aldara Meilán", club:"—", mark:"—", result:"12ª"},
      ]},
      {name:"Maratón Marcha Mujeres", athletes:[
        {name:"Raquel González", club:"—", mark:"—", result:"🥉 BRONCE"},
        {name:"Laura Monje", club:"—", mark:"—"},
        {name:"Lucía Redondo", club:"—", mark:"—"},
      ]},
      {name:"100m Hombres", athletes:[
        {name:"Abel Alejandro Jordán", club:"Líder español del año, 2ª marca histórica", mark:"10.10"},
        {name:"Guillem Crespí", club:"Campeón de España en Málaga", mark:"10.18"},
        {name:"Jorge Hernández", club:"Subcampeón nacional — debut individual", mark:"10.22"},
      ]},
      {name:"200m Hombres", athletes:[
        {name:"Oriol Sánchez", club:"Campeón de España en Málaga", mark:"20.68"},
      ]},
      {name:"400m Hombres", athletes:[
        {name:"Ángel González", club:"Sensación de la temporada", mark:"45.53"},
      ]},
      {name:"800m Hombres", athletes:[
        {name:"Mohamed Attaoui", club:"Plusmarquista español, subcampeón europeo Roma", mark:"1:42.04", result:"🥉 BRONCE — 1:45.71"},
        {name:"David Barroso", club:"Campeón de España, campeón mundial universitario", mark:"1:43.60", result:"4º en la final — 1:45.75 (a 4 centésimas del podio)"},
        {name:"Pablo Sánchez-Valladares", club:"Olímpico en Tokio", mark:"1:44.46"},
      ]},
      {name:"1.500m Hombres", athletes:[
        {name:"Adrián Ben", club:"Campeón de España, campeón de Europa indoor 2023", mark:"3:32.70"},
        {name:"Mariano García", club:"Medallista europeo 800m 2022, mundial short track 2026", mark:"3:35.53"},
        {name:"Carlos Sáez", club:"—", mark:"3:32.28"},
      ]},
      {name:"10.000m Hombres", athletes:[
        {name:"Jesús Ramos", club:"5º de Europa de 10km en ruta 2025", mark:"27:49.73"},
        {name:"Abdessamad Oukhelfen", club:"Olímpico", mark:"27:36.23"},
      ]},
      {name:"Maratón Hombres", athletes:[
        {name:"Jorge Blanco", club:"—", mark:"—"},
        {name:"Fernando Carro", club:"—", mark:"—"},
        {name:"Ibrahim Chakir", club:"—", mark:"—"},
        {name:"Ilias Fifa", club:"—", mark:"2:08:36"},
        {name:"Jorge González", club:"—", mark:"—"},
        {name:"Carlos Mayo", club:"—", mark:"—"},
      ]},
      {name:"110m Vallas Hombres", athletes:[
        {name:"Quique Llopis", club:"Subcampeón de Europa vigente, subcampeón del mundo indoor", mark:"13.09"},
        {name:"Asier Martínez", club:"Líder del año, campeón de Europa 2022", mark:"13.14"},
      ]},
      {name:"400m Vallas Hombres", athletes:[
        {name:"Jesús David Delgado", club:"3ª marca europea del año", mark:"48.11", result:"6º en la final"},
        {name:"Javier Lorente", club:"Subcampeón iberoamericano", mark:"49.19"},
      ]},
      {name:"3.000m Obstáculos Hombres", athletes:[
        {name:"Dani Arce", club:"Líder español, 4 veces campeón de España, bronce europeo", mark:"8:05.45", result:"4º en la final — se le escapó el podio en el último paso por la ría"},
        {name:"Alejandro Quijada", club:"Campeón del mundo universitario 2025", mark:"8:13.40", result:"6º en la final — 8:29.15"},
      ]},
      {name:"Longitud Hombres", athletes:[
        {name:"Jaime Guerra", club:"Campeón de España absoluto", mark:"8.17 m"},
        {name:"Lester Lescay", club:"Líder español, bronce europeo Apeldoorn 2025", mark:"8.22 m"},
        {name:"Eusebio Cáceres", club:"Iguala récord de presencias en Europeos (7)", mark:"8.37 m"},
      ]},
      {name:"Disco Hombres", athletes:[
        {name:"Diego Casas", club:"4º marquista histórico español", mark:"65.95 m", result:"6º en la final"},
      ]},
      {name:"Jabalina Hombres", athletes:[
        {name:"Manu Quijera", club:"Campeón de España, líder del año", mark:"83.28 m"},
      ]},
      {name:"4x100m y 4x100m mixto Hombres", athletes:[
        {name:"Abel Alejandro Jordán", club:"—", mark:"—"},
        {name:"Guillem Crespí", club:"—", mark:"—", result:"🥉 BRONCE (4x100 mixto) — 40.42, primera medalla histórica de España en un relevo"},
        {name:"Jorge Hernández", club:"—", mark:"—"},
        {name:"Oriol Sánchez", club:"—", mark:"—"},
        {name:"Marc Escandell", club:"—", mark:"—"},
        {name:"Alberto Calero", club:"—", mark:"—"},
        {name:"Andoni Calbano", club:"—", mark:"—", result:"🥉 BRONCE (4x100 mixto) — 40.42, primera medalla histórica de España en un relevo"},
        {name:"Daniel Rodríguez", club:"—", mark:"—"},
      ]},
      {name:"4x400m y 4x400m mixto Hombres", athletes:[
        {name:"Ángel González", club:"—", mark:"—"},
        {name:"Bernat Erta", club:"—", mark:"—"},
        {name:"Asabu Pines", club:"—", mark:"—"},
        {name:"David García", club:"—", mark:"—"},
        {name:"Manuel Bea", club:"—", mark:"—"},
        {name:"Juan José de la Rosa", club:"Récord de España de relevos (3:00.26)", mark:"—"},
      ]},
      {name:"Media Maratón Marcha Hombres", athletes:[
        {name:"Paul McGrath", club:"Subcampeón de Europa vigente en 20km marcha", mark:"—", result:"🥇 ORO"},
        {name:"Diego García", club:"—", mark:"—"},
        {name:"Álvaro López", club:"—", mark:"—", result:"7º"},
      ]},
      {name:"Maratón Marcha Hombres", athletes:[
        {name:"Miguel Ángel López", club:"Campeón mundial, doble campeón de Europa — capitán", mark:"—", result:"🥈 PLATA"},
        {name:"Manuel Bermúdez", club:"—", mark:"—"},
        {name:"Daniel Chamosa", club:"—", mark:"—"},
        {name:"José Manuel Pérez", club:"—", mark:"—"},
      ]},
    ]
  },
];

// Ranking: líder nacional 2026 por prueba (mejor marca de la temporada),
// tal y como lo publica atletismorfea.es/ranking (sección "Mejores marcas 2026").
const RANKING = {
  "Mujeres": {
    "100m": {name:"Jaël Sakura Bestué Ferrera", club:"C.A. Adidas", mark:"11.15 (-0.9)", when:"Meeting Madrid 2026 · Madrid · 16/07/2026"},
    "200m": {name:"Jaël Sakura Bestué Ferrera", club:"C.A. Adidas", mark:"22.57 (0.4)", when:"Campeonato de España · Málaga · 26/07/2026"},
    "400m": {name:"Blanca Hervás Rodríguez", club:"New Balance Team", mark:"50.46", when:"Meeting Madrid 2026 · Madrid · 16/07/2026"},
    "800m": {name:"Marta Mitjans Muñoz", club:"Nike Running Club", mark:"1:59.28", when:"X Ordizia Meeting · Ordizia · 04/07/2026"},
    "1.500m": {name:"Agueda Marqués Muñoz", club:"C.A. Adidas", mark:"4:03.62", when:"Golden Gala Pietro Mennea · Roma (ITA) · 04/06/2026"},
    "5.000m": {name:"María Forero Pérez", club:"Independiente", mark:"15:07.50", when:"IFAM Outdoor · Bruselas (BEL) · 23/05/2026"},
    "10.000m": {name:"Idaira Prieto Suárez", club:"Bilbao Atletismo", mark:"32:06.00", when:"Campeonato de España 10.000 m · Mahón · 09/05/2026"},
    "5km Ruta": {name:"María Forero Pérez", club:"Independiente", mark:"15:27", when:"10 Km en Ruta Villa de Laredo · Laredo · 18/04/2026"},
    "10km Ruta": {name:"Marta García Alonso", club:"Independiente", mark:"31:17", when:"10K Valencia Ibercaja by Kiprun · Valencia · 11/01/2026"},
    "Medio Maratón": {name:"Carla Gallardo Puertas", club:"Independiente", mark:"1:08:30", when:"Generali Berliner Halbmarathon · Berlín (GER) · 29/03/2026"},
    "Maratón": {name:"Fátima Azzaharaa Ouhaddou Nafie", club:"Asics Running", mark:"2:24:16", when:"Zurich Maratón de Sevilla · Sevilla · 15/02/2026"},
    "50km Ruta": {name:"María Lázaro García", club:"C.A. Carnicas Serrano", mark:"3:15:12", when:"Campeonato de España 50 km y 100 km · Málaga · 21/03/2026"},
    "100km Ruta": {name:"Gemma Arenas Alcázar", club:"Independiente", mark:"7:20:57", when:"Campeonato de España 50 km y 100 km · Málaga · 21/03/2026"},
    "60m Vallas": {name:"Paula Blanquer Iglesias", club:"Diputación Valencia C.A.", mark:"8.10", when:"Camp. de España Short Track por Clubes · Valencia · 14/02/2026"},
    "100m Vallas": {name:"Lerato Pages Maboka", club:"Facsa - Playas de Castellón", mark:"13.06 (1.3)", when:"Meeting Internacional Ciudad de Málaga · Málaga · 18/06/2026"},
    "400m Vallas": {name:"Sara Gallego Sotelo", club:"Nike Running Club", mark:"54.36", when:"Meeting Madrid 2026 · Madrid · 16/07/2026"},
    "3.000m Obst.": {name:"Marta Serrano Azpiazu", club:"New Balance Team", mark:"9:29.44", when:"Copenhagen Athletics Games · Copenhague (DEN) · 22/06/2026"},
    "Altura": {name:"Una Stancev Stevanovic", club:"Trops-Cueva de Nerja", mark:"1.90 m", when:"Campeonato Iberoamericano · Lima (PER) · 31/05/2026"},
    "Pértiga": {name:"Mónica Clemente Martí", club:"Diputación Valencia C.A.", mark:"4.46 m", when:"Camp. de España Short Track por Clubes · Valencia · 14/02/2026"},
    "Longitud": {name:"Tessy Ebosele Ebosele", club:"C.A. Adidas", mark:"6.86 m (1.0)", when:"GP Diputación Castellón · Castellón · 01/07/2026"},
    "Triple Salto": {name:"Naida Calonge Marí", club:"Facsa - Playas de Castellón", mark:"13.53 m (-1.1)", when:"Campeonato de España Sub-20 · Albacete · 19/07/2026"},
    "Peso": {name:"Belén Toimil Fernández", club:"Facsa - Playas de Castellón", mark:"17.80 m", when:"Hvězdy v Nehvizdech · Nehvizdy (CZE) · 25/02/2026"},
    "Disco": {name:"Inés López Arias", club:"Independiente", mark:"60.57 m", when:"NCAA Division I West First Rounds · Fayetteville (USA) · 30/05/2026"},
    "Martillo": {name:"Laura Redondo Mora", club:"Diputación Valencia C.A.", mark:"70.89 m", when:"Meeting Madrid 2026 · Madrid · 16/07/2026"},
    "Jabalina": {name:"Yulenmis Aguilar Martínez", club:"Diputación Valencia C.A.", mark:"61.83 m", when:"Camp. de España por Clubes · Pamplona · 13/06/2026"},
    "Heptatlón": {name:"Sofía Cosculluela Ördögh", club:"Diputación Valencia C.A.", mark:"6182 pts", when:"NCAA Division I Outdoor Championships · Eugene (USA) · 13/06/2026"},
    "10.000m Marcha (pista)": {name:"María Pérez García", club:"Independiente", mark:"42:12.93", when:"Campeonato de España · Málaga · 25/07/2026"},
    "Medio Maratón Marcha": {name:"María Pérez García", club:"Independiente", mark:"1:32:51", when:"XXXIX Gran Premio Cantones de A Coruña · A Coruña · 23/05/2026"},
    "Maratón Marcha": {name:"Laura Monje Martínez", club:"CA Granollers", mark:"3:39:11", when:"45th Dudinska 50 · Dudince (SVK) · 07/03/2026"},
  },
  "Hombres": {
    "100m": {name:"Abel Alejandro Jordán Jul", club:"C.A. Adidas", mark:"10.10 (0.8)", when:"NCAA Division I West First Rounds · Fayetteville (USA) · 29/05/2026"},
    "200m": {name:"Andoni Calbano Osinaga", club:"Real Sociedad", mark:"20.63 (1.1)", when:"PLP 1 Julio Donosti · San Sebastián · 01/07/2026"},
    "400m": {name:"Ángel González Muñoz", club:"Unicaja Jaén Paraíso Interior", mark:"45.53", when:"Meeting Madrid 2026 · Madrid · 16/07/2026"},
    "800m": {name:"David Barroso Bravo", club:"CAPEX", mark:"1:43.60", when:"Gyulai István Memorial · Budapest (HUN) · 14/07/2026"},
    "1.500m": {name:"Mohamed Attaoui Tijani", club:"Independiente", mark:"3:31.82", when:"Paavo Nurmi Games · Turku (FIN) · 03/06/2026"},
    "5.000m": {name:"Santiago Catrofe Cacharrón", club:"ADA Calvià - Vistasol", mark:"13:02.57", when:"Meeting de París · París (FRA) · 28/06/2026"},
    "10.000m": {name:"Eduardo Menacho Miralles", club:"Asics Running", mark:"28:07.36", when:"Campeonato de España 10.000 m · Mahón · 09/05/2026"},
    "110m Vallas": {name:"Asier Martínez Echarte", club:"Nike Running Club", mark:"13.27 (1.4)", when:"Doha Meeting · Doha (QAT) · 19/06/2026"},
    "400m Vallas": {name:"Jesús David Delgado Pérez", club:"TenerifeCajaCanarias", mark:"48.11", when:"Zlatá tretra Ostrava · Ostrava (CZE) · 16/06/2026"},
    "3.000m Obst.": {name:"Daniel Arce Ibáñez", club:"New Balance Team", mark:"8:11.42", when:"Meeting Int. Mohammed VI · Rabat (MAR) · 31/05/2026"},
    "Altura": {name:"Pablo Martínez Torre", club:"TenerifeCajaCanarias", mark:"2.22 m", when:"Campeonato de España Short Track Sub-23 · Sabadell · 07/02/2026"},
    "Pértiga": {name:"Artur Coll Sicluna", club:"CA Fent Camí Mislata", mark:"5.63 m", when:"Perche en Or · Roubaix (FRA) · 07/02/2026"},
    "Longitud": {name:"Lester Alcides Lescay Gay", club:"Facsa - Playas de Castellón", mark:"8.22 m (0.4)", when:"GP Diputación Castellón · Castellón · 01/07/2026"},
    "Triple Salto": {name:"Ramón Adalia Agustí", club:"Cornellà Atlètic", mark:"16.33 m", when:"50è Campionat de Catalunya · Sabadell · 15/02/2026"},
    "Peso": {name:"Miguel Gómez Díaz", club:"Facsa - Playas de Castellón", mark:"19.07 m", when:"Campeonato de España Short Track · Valencia · 01/03/2026"},
    "Disco": {name:"Diego Casas Garrido", club:"Facsa - Playas de Castellón", mark:"65.95 m", when:"GP Diputación Castellón · Castellón · 01/07/2026"},
    "Martillo": {name:"Kevin Arreaga Almeida", club:"Facsa - Playas de Castellón", mark:"71.22 m", when:"Campeonato de España Lanzamientos Largos · Castellón · 20/02/2026"},
    "Jabalina": {name:"Manu Quijera Poza", club:"Grupompleo Pamplona At.", mark:"81.27 m", when:"Final Liga Joma · Pamplona · 14/06/2026"},
    "Maratón": {name:"Ilias Fifa Temsamani", club:"PCteam", mark:"2:08:36", when:"Zurich Maratón de Sevilla · Sevilla · 15/02/2026"},
    "Medio Maratón": {name:"Santiago Catrofe Cacharrón", club:"ADA Calvià - Vistasol", mark:"1:00:21", when:"Kagawa Marugame Half Marathon · Marugame (JPN) · 01/02/2026"},
    "50km Ruta": {name:"Guillermo Sainz de Baranda Fernández", club:"Club Gladioveja", mark:"6:44.24", when:"Festival de Ultrafondo GP Ciudad de Burjassot · Burjassot · 27/03/2026"},
    "100km Ruta": {name:"Marco Álvarez Hernández", club:"Atlética Turolense", mark:"6:41:40", when:"Campeonato de España 50 km y 100 km · Málaga · 21/03/2026"},
    "60m Vallas": {name:"Enrique Llopis Domenech", club:"C.A. Adidas", mark:"7.42", when:"Campeonato del Mundo Short Track · Toruń (POL) · 21/03/2026"},
    "110m Vallas": {name:"Asier Martínez Echarte", club:"Nike Running Club", mark:"13.27 (1.4)", when:"Doha Meeting · Doha (QAT) · 19/06/2026"},
    "400m Vallas": {name:"Jesús David Delgado Pérez", club:"TenerifeCajaCanarias", mark:"48.11", when:"Zlatá tretra Ostrava · Ostrava (CZE) · 16/06/2026"},
    "Heptatlón": {name:"Pol Ferrer Moncusí", club:"Cornellà Atlètic", mark:"6067 pts", when:"Campeonato de España Short Track · Valencia · 27/02/2026"},
    "Decatlón": {name:"Pol Ferrer Moncusí", club:"Cornellà Atlètic", mark:"7774 pts", when:"Campeonato de España · Málaga · 25/07/2026"},
    "10.000m Marcha (pista)": {name:"Paul McGrath Benito", club:"Independiente", mark:"38:23.52", when:"Campeonato de España · Málaga · 24/07/2026"},
    "Medio Maratón Marcha": {name:"Iván López Pérez", club:"CAPEX", mark:"1:25:05", when:"Encuentro Internacional de Marcha · Poděbrady (CZE) · 08/05/2026"},
    "Maratón Marcha": {name:"Óscar Martínez Rodríguez", club:"L'Hospitalet At.", mark:"3:09:08", when:"45th Dudinska 50 · Dudince (SVK) · 07/03/2026"},
  },
};

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
const tabs = document.querySelectorAll('#tabs button');

function goToView(viewName){
  tabs.forEach(b=>b.classList.toggle('active', b.dataset.view===viewName));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+viewName).classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

function goHome(){
  goToView('home');
}

// "En directo" no muestra una lista genérica: lleva directamente a la ficha
// de la competición que esté EN CURSO ahora mismo (si hay alguna).
function handleNavClick(viewName){
  if(viewName === 'directo'){
    const live = LIVE.find(l => l.status === 'EN CURSO' && l.calId);
    if(live){
      showCompetitionDetail(live.calId);
      return;
    }
  }
  if(viewName === 'inscritos'){
    initInscritosTab();
  }
  goToView(viewName);
}

tabs.forEach(btn=>{
  btn.addEventListener('click', ()=> handleNavClick(btn.dataset.view));
});

document.querySelectorAll('.home-card').forEach(card=>{
  card.addEventListener('click', ()=> handleNavClick(card.dataset.view));
});

/* ============================================================
   TICKER
   ============================================================ */
function refreshTicker(){
  const hoy = hoyISO();
  const vivos = LIVE_DATA && LIVE_DATA.date === hoy ? Object.values(LIVE_DATA.items||{}).filter(l=>l.status==='en directo') : [];
  let items = vivos.map(l => `EN DIRECTO — ${l.name}${l.place?' ('+l.place+')':''}`);
  if(!items.length){
    const [ini, fin] = proximasRango();
    items = CALENDAR.filter(c => c.date >= ini && c.date <= fin).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,8)
      .map(c => `${fechaCorta(c.date)} — ${c.name}${c.place?' · '+c.place:''}`);
  }
  const html = items.map(t=>`<span>● ${esc(t)}</span>`).join('');
  document.getElementById('tickerTrack').innerHTML = html + html;
}

/* ============================================================
   CALENDARIO
   ============================================================ */
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];


/* ---- Localidad → Comunidad Autónoma y Calendario (fuente) ---- */
const CCAA_POR_LOCALIDAD = {
  "A CORUNA":"Galicia",
  "A CORUNA-UN":"Galicia",
  "A DESIGNAR":"Por determinar",
  "ACEITUNA":"Extremadura",
  "AGUILAR DE CAMPOO":"Castilla y León",
  "AGUILAS":"Murcia",
  "AJO":"Cantabria",
  "ALBACETE":"Castilla-La Mancha",
  "ALCALA DE HENARES":"Madrid",
  "ALCOBENDAS":"Madrid",
  "ALCOBENDAS, MADRID":"Madrid",
  "ALHAMA DE MURCIA":"Murcia",
  "ALICANTE":"Comunidad Valenciana",
  "ALMERIA":"Andalucía",
  "ALMODOVAR DEL RIO":"Andalucía",
  "AMES (A CORUNA, ESP)":"Galicia",
  "AMOREBIETA-ETXANO":"País Vasco",
  "AMURRIO":"País Vasco",
  "ANTEQUERA (I)":"Andalucía",
  "ANTEQUERA (PISTA CUBIERTA)":"Andalucía",
  "ARANDA DE DUERO":"Castilla y León",
  "ARGANDA DEL REY":"Madrid",
  "ARONA":"Canarias",
  "ARRECIFE":"Canarias",
  "ATAPUERCA":"Castilla y León",
  "AVILA":"Castilla y León",
  "AVILES":"Asturias",
  "BADAJOZ":"Extremadura",
  "BARAKALDO":"País Vasco",
  "BARCELONA":"Cataluña",
  "BARCELONA-SE":"Cataluña",
  "BARRUELO DE SANTULLAN - BRANOSERA":"Castilla y León",
  "BELGRADO (SRB)":"Internacional",
  "BENIDORM":"Comunidad Valenciana",
  "BERANGO":"País Vasco",
  "BILBAO":"País Vasco",
  "BIRMINGHAM (GBR)":"Internacional",
  "BRASILIA (BRA)":"Internacional",
  "BRASILIA - (BRA)":"Internacional",
  "BRUSELAS (BEL)":"Internacional",
  "BUDAPEST":"Internacional",
  "BURGOS":"Castilla y León",
  "BURJASSOT":"Comunidad Valenciana",
  "CACERES":"Extremadura",
  "CACERES-CIU":"Extremadura",
  "CALDAS DA REIS":"Galicia",
  "CALDAS DE REIS":"Galicia",
  "CAMARGO":"Cantabria",
  "CAMPO DE CRIPTANA":"Castilla-La Mancha",
  "CAMPORREDONDO DE ALBA":"Castilla y León",
  "CANDELEDA":"Castilla y León",
  "CANFRANC":"Aragón",
  "CANTIMPALOS":"Castilla y León",
  "CASSINO (ITA)":"Internacional",
  "CASSINO - (ITA)":"Internacional",
  "CASTELLON":"Comunidad Valenciana",
  "CASTELLON-MGH":"Comunidad Valenciana",
  "CASTRO URDIALES":"Cantabria",
  "CATANIA - (ITA)":"Internacional",
  "CHICLANA DE LA FRONTERA":"Andalucía",
  "CIEZA":"Murcia",
  "CIUDAD REAL":"Castilla-La Mancha",
  "COPENHAGUE (DEN)":"Internacional",
  "CORDOBA-FON":"Andalucía",
  "CORIA DEL RIO":"Andalucía",
  "CORNELLA DE LLOBREGAT":"Cataluña",
  "CORRALEJO":"Canarias",
  "DAEGU - (KOR)":"Internacional",
  "DAKAR (SEN)":"Internacional",
  "DOHA (QAT)":"Internacional",
  "DONOSTIA/SAN SEBASTIAN":"País Vasco",
  "DURANGO":"País Vasco",
  "EL HIERRO":"Canarias",
  "EL PASO":"Canarias",
  "ELCHE":"Comunidad Valenciana",
  "ELDA":"Comunidad Valenciana",
  "ELGOIBAR":"País Vasco",
  "ESTEPONA":"Andalucía",
  "ESTOCOLMO (SWE)":"Internacional",
  "EUGENE (USA)":"Internacional",
  "FUENLABRADA-MUN":"Madrid",
  "GABORONE":"Internacional",
  "GABORONE (BOT)":"Internacional",
  "GAGLIANO DEL CAPO":"Internacional",
  "GAGLIANO DEL CAPO (ITA)":"Internacional",
  "GALDAKAO":"País Vasco",
  "GALIZANO":"Cantabria",
  "GAVA":"Cataluña",
  "GETXO":"País Vasco",
  "GIJON":"Asturias",
  "GIRONA":"Cataluña",
  "GRANADA":"Andalucía",
  "GRANADA-JUV":"Andalucía",
  "GUADALAJARA":"Castilla-La Mancha",
  "HORNACHUELOS":"Andalucía",
  "HUELVA":"Andalucía",
  "HUESCA":"Aragón",
  "IBIZA":"Islas Baleares",
  "IURRETA":"País Vasco",
  "JAEN":"Andalucía",
  "JANSKE LAZNE":"Internacional",
  "L'HOSPITALET DE LLOBREGAT":"Cataluña",
  "LA CORUNA":"Galicia",
  "LA LAGUNA":"Canarias",
  "LA NUCIA":"Comunidad Valenciana",
  "LA PALMA":"Canarias",
  "LA SPEZIA (ITA)":"Internacional",
  "LAUDIO":"País Vasco",
  "LAUSANA (SUI)":"Internacional",
  "LEON":"Castilla y León",
  "LEON-ULE":"Castilla y León",
  "LIMA (PER)":"Internacional",
  "LIMA - (PER)":"Internacional",
  "LISBOA (POR)":"Internacional",
  "LISBOA - (POR)":"Internacional",
  "LJUBLJANA (SLO)":"Internacional",
  "LJUBLJANA - (SLO)":"Internacional",
  "LLEIDA":"Cataluña",
  "LLORET DE MAR":"Cataluña",
  "LOGRONO":"La Rioja",
  "LONDRES (GBR)":"Internacional",
  "LOS CORRALES DE BUELNA":"Cantabria",
  "LUGO":"Galicia",
  "MADRID":"Madrid",
  "MADRID (I)":"Madrid",
  "MADRID (PISTA CUBIERTA)":"Madrid",
  "MADRID-VLL":"Madrid",
  "MAHON":"Islas Baleares",
  "MALAGA":"Andalucía",
  "MALAGA-CAR":"Andalucía",
  "MALAGA-CIU":"Andalucía",
  "MANRESA":"Cataluña",
  "MERIDA":"Extremadura",
  "MONACO (MON)":"Internacional",
  "MOTRIL":"Andalucía",
  "MURCIA":"Murcia",
  "NAVARREDONDA DE GREDOS":"Castilla y León",
  "NEGREIRA":"Galicia",
  "NERJA":"Andalucía",
  "NICOSIA (CYP)":"Internacional",
  "NICOSIA - (CYP)":"Internacional",
  "NUEVA DELHI":"Internacional",
  "O BARCO DE VALDEORRAS":"Galicia",
  "OLIVA":"Comunidad Valenciana",
  "ONTINYENTE":"Comunidad Valenciana",
  "ORDIZIA":"País Vasco",
  "ORUNA DE PIELAGOS":"Cantabria",
  "OSLO (NOR)":"Internacional",
  "OURENSE (I)":"Galicia",
  "OURENSE (PISTA CUBIERTA)":"Galicia",
  "OVIEDO":"Asturias",
  "PALAFRUGELL":"Cataluña",
  "PALENCIA":"Castilla y León",
  "PALMA DE MALLORCA":"Islas Baleares",
  "PALMA DE MALLORCA-PRI":"Islas Baleares",
  "PAMPLONA":"Navarra",
  "PARIS (FRA)":"Internacional",
  "PEREIRO DE AGUIAR":"Galicia",
  "PODEBRADY (CZE)":"Internacional",
  "PODEBRADY - (CZE)":"Internacional",
  "POLLENCA":"Islas Baleares",
  "QUINTANAR DE LA ORDEN":"Castilla-La Mancha",
  "RABAT (MAR)":"Internacional",
  "RASNOV":"Internacional",
  "REGUMIEL DE LA SIERRA":"Castilla y León",
  "RIBADESELLA":"Asturias",
  "RIETI (ITA)":"Internacional",
  "RIETI - (ITA)":"Internacional",
  "ROMA (ITA)":"Internacional",
  "SABADELL (I)":"Cataluña",
  "SABADELL (PISTA CUBIERTA)":"Cataluña",
  "SAGUNTO":"Comunidad Valenciana",
  "SALAMANCA":"Castilla y León",
  "SALAMANCA (I)":"Castilla y León",
  "SALAMANCA (PISTA CUBIERTA)":"Castilla y León",
  "SAN SEBASTIAN":"País Vasco",
  "SAN SEBASTIAN (I)":"País Vasco",
  "SAN SEBASTIAN (PISTA CUBIERTA)":"País Vasco",
  "SANT CUGAT":"Cataluña",
  "SANTA COLOMA DE GRAMENET":"Cataluña",
  "SANTA CRUZ DE TENERIFE":"Canarias",
  "SANTA POLA":"Comunidad Valenciana",
  "SANTANDER":"Cantabria",
  "SANTIAGO DE COMPOSTELA":"Galicia",
  "SANTIPONCE":"Andalucía",
  "SANTURTZI–BILBAO":"País Vasco",
  "SARON":"Cantabria",
  "SEDE POR CONFIRMAR":"Por determinar",
  "SEGOVIA":"Castilla y León",
  "SEVILLA":"Andalucía",
  "SHANGHAI/KEQIAO (CHN)":"Internacional",
  "SILESIA (POL)":"Internacional",
  "SORIA":"Castilla y León",
  "TALAVERA DE LA REINA":"Castilla-La Mancha",
  "TALLAHASSEE (USA)":"Internacional",
  "TARENTO (ITA)":"Internacional",
  "TENERIFE":"Canarias",
  "TERRASA":"Cataluña",
  "TOLEDO":"Castilla-La Mancha",
  "TOLEDO-ECEF":"Castilla-La Mancha",
  "TORDESILLAS":"Castilla y León",
  "TORO":"Castilla y León",
  "TORREDONJIMENO (JAEN)":"Andalucía",
  "TORUN (POL)":"Internacional",
  "TORUN - (POL) (I)":"Internacional",
  "VALENCIA":"Comunidad Valenciana",
  "VALENCIA (I)":"Comunidad Valenciana",
  "VALENCIA (PISTA CUBIERTA)":"Comunidad Valenciana",
  "VALENCIA-JAD":"Comunidad Valenciana",
  "VALLADOLID":"Castilla y León",
  "VALLADOLID-ESG":"Castilla y León",
  "VALLADOLID-REN":"Castilla y León",
  "VARIAS SEDES":"Por determinar",
  "VECINDARIO":"Canarias",
  "VENTA DE BANOS":"Castilla y León",
  "VIC":"Cataluña",
  "VIGO":"Galicia",
  "VILA-REAL":"Comunidad Valenciana",
  "VILLAFRANCA DE LOS BARROS":"Extremadura",
  "VILLAREAL":"Comunidad Valenciana",
  "XIAMEN (CHN)":"Internacional",
  "ZAGREB":"Internacional",
  "ZARAGOZA":"Aragón",
  "ZARAGOZA (I)":"Aragón",
  "ZIZUR MAYOR (PISTA CUBIERTA)":"Navarra",
  "ZURICH (SUI)":"Internacional"
};

function normalizarLocalidad(place){
  return (place || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
}
function getCCAA(place){
  const n = normalizarLocalidad(place);
  const sinCubierta = n.replace(/\s*\((I|PISTA CUBIERTA)\)$/, '').trim();
  const found = CCAA_POR_LOCALIDAD[n] || CCAA_POR_LOCALIDAD[sinCubierta] || CCAA_POR_LOCALIDAD[sinCubierta + ' (I)'];
  if(found) return found;
  const pais = n.match(/\(([A-Z]{3})\)\s*$/);
  if(pais && pais[1] !== 'ESP') return 'Internacional';
  return 'Otros';
}
const ORDEN_CCAA = ['Andalucía','Aragón','Asturias','Islas Baleares','Canarias','Cantabria','Castilla y León','Castilla-La Mancha','Cataluña','Comunidad Valenciana','Extremadura','Galicia','Madrid','Murcia','Navarra','País Vasco','La Rioja','Internacional','Por determinar','Otros'];
function ordenarCCAA(valores){
  return [...valores].sort((a,b)=> ORDEN_CCAA.indexOf(a) - ORDEN_CCAA.indexOf(b));
}
function getFuenteCalendario(id){
  const auto = CALENDAR.find(c=>c.id===id);
  if(auto && auto.source) return auto.source === 'Manual' ? 'Añadida a mano' : auto.source;
  if(id.startsWith('dl-')) return 'Diamond League';
  if(id.startsWith('cross-')) return 'ADOC';
  if(id.startsWith('rfea-')) return 'RFEA';
  return 'World Athletics';
}
const ORDEN_FUENTES = ['RFEA','World Athletics','Cronomancha','AvaiBook (Runvasport)','ADOC','Diamond League','Añadida a mano'];
function ordenarFuentes(valores){
  return [...valores].sort((a,b)=> ORDEN_FUENTES.indexOf(a) - ORDEN_FUENTES.indexOf(b));
}

function populateSelect(id, values, allLabel){
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${allLabel}</option>` + values.map(v=>`<option value="${v}">${v}</option>`).join('');
}

function renderCalendar(){
  const month = document.getElementById('calMonth').value;
  const type = document.getElementById('calType').value;
  const localidad = document.getElementById('calCat').value;
  const fuente = document.getElementById('calFuente').value;
  const showPast = document.getElementById('calShowPast').checked;

  const todayStr = new Date().toISOString().slice(0,10); // fecha actual real del sistema

  const filtered = CALENDAR.filter(ev=>{
    const evMonth = MESES[parseInt(ev.date.split('-')[1],10)-1];
    if(month && evMonth !== month) return false;
    if(type && ev.type !== type) return false;
    if(localidad && getCCAA(ev.place) !== localidad) return false;
    if(fuente && getFuenteCalendario(ev.id) !== fuente) return false;
    if(!showPast && ev.date < todayStr) return false;
    return true;
  }).sort((a,b)=> a.date.localeCompare(b.date));

  const list = document.getElementById('calList');
  if(filtered.length === 0){
    list.innerHTML = `<div class="empty-state"><h3>Sin competiciones</h3>No hay eventos que coincidan con estos filtros.</div>`;
    return;
  }

  list.innerHTML = filtered.map(ev=>{
    const [y,m,d] = ev.date.split('-');
    const isIntl = ev.type === "Internacional";
    const isPast = ev.date < todayStr;
    return `
    <div class="cal-row" style="cursor:pointer;${isPast?'opacity:0.55':''}" onclick="showCompetitionDetail('${ev.id}')">
      <div class="cal-date"><span class="day">${d}</span>${MESES[parseInt(m,10)-1].slice(0,3).toUpperCase()} ${y}</div>
      <div>
        <div class="cal-name">${esc(ev.name)}</div>
        <div class="cal-place">${esc(ev.place)}${calMeta(ev)}</div>
      </div>
      <div class="cal-place">${ev.place}</div>
      <div class="tag ${isIntl?'intl':'nac'}">${ev.type}</div>
      <div class="cal-arrow">→</div>
    </div>`;
  }).join('');
}

populateSelect('calMonth', [...new Set(CALENDAR.map(e=>MESES[parseInt(e.date.split('-')[1],10)-1]))], 'Todos los meses');
populateSelect('calType', [...new Set(CALENDAR.map(e=>e.type))], 'Todos los tipos');
populateSelect('calCat', ordenarCCAA([...new Set(CALENDAR.map(e=>getCCAA(e.place)))]), 'Todas las localidades');
populateSelect('calFuente', ordenarFuentes([...new Set(CALENDAR.map(e=>getFuenteCalendario(e.id)))]), 'Todos los calendarios');
['calMonth','calType','calCat','calFuente'].forEach(id=>document.getElementById(id).addEventListener('change', renderCalendar));
document.getElementById('calShowPast').addEventListener('change', ()=>{
  document.getElementById('calToggleText').textContent = document.getElementById('calShowPast').checked ? 'Visibles' : 'Ocultas';
  renderCalendar();
});
renderCalendar();

/* ============================================================
   FICHA DE COMPETICIÓN (página de detalle)
   ============================================================ */
function renderEventBlocks(compId, events){
  return events.map(ev=>`
    <div class="event-block">
      <div class="event-block-head">
        <h3>${ev.name}</h3>
        <span>${ev.athletes.length} confirmado${ev.athletes.length===1?'':'s'}</span>
      </div>
      <div class="athlete-list">
        ${ev.athletes.map(a=>`
          <div class="athlete-row">
            <div class="athlete-row-name">${a.name}</div>
            <div class="athlete-row-ref">${a.club && a.club!=='—' ? a.club : 'Sin referencia adicional'}</div>
            <div class="athlete-row-meta">
              <span><b>Marca:</b> ${a.mark && a.mark!=='—' ? a.mark : 'Sin marca registrada'}</span>
              <span><b>Cuándo compite:</b> ${getSchedule(compId, ev.name)}</span>
              <span><b>Resultado:</b> ${a.result || 'Pendiente'}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function showCompetitionDetail(calId){
  const ev = CALENDAR.find(c=>c.id===calId);
  if(!ev) return;

  const fecha = fechaLarga(ev.date, ev.end_date);
  const comp = COMPETITIONS.find(c=>c.id===calId);
  const watch = getWatchInfo(calId);

  let body;
  const autoInfo = renderAutoInfo(ev);
  if(comp && comp.events.length > 0){
    body = `
      <div class="data-note">📍 <b>${comp.place}</b> — ${comp.dates}<br>${comp.note}</div>
      <div class="roster-grid">${renderEventBlocks(calId, comp.events)}</div>
    `;
  } else if(!autoInfo){
    body = `
      <div class="empty-state">
        <h3>Lista de atletas</h3>
        Todavía no se ha publicado la lista de inscritos ni los resultados de esta cita.
        Esta ficha se completa sola en cuanto la organización los publica.
      </div>
    `;
  } else {
    body = '';
  }

  const euroBrowser = (calId === 'europeo-birmingham')
    ? `<div class="data-note">📋 <b>Lista de salida completa (todos los países)</b> — disponible dentro de esta misma web.<br><button class="comp-pill active" style="margin-top:8px;" onclick="handleNavClick('inscritos')">Ir a la página Inscritos →</button></div>`
    : '';

  document.getElementById('detailContent').innerHTML = `
    <div class="eyebrow">${esc(ev.cat || '')}</div>
    <h1 style="font-family:'Bebas Neue',sans-serif;font-size:clamp(34px,5.5vw,58px);line-height:0.98;max-width:900px;">${esc(ev.name)}</h1>
    <div class="detail-meta">
      <span class="meta-item">📅 <b>${fecha}</b></span>
      ${ev.place ? `<span class="meta-item">📍 <b>${esc(ev.place)}</b></span>` : ''}
      ${ev.time ? `<span class="meta-item">🕒 <b>${ev.time}${ev.time_end && ev.time_end!==ev.time ? '–'+ev.time_end : ''}</b></span>` : ''}
      <span class="tag ${ev.type==='Internacional'?'intl':'nac'}">${ev.type}</span>
      ${ev.cat ? `<span class="tag">${esc(ev.cat)}</span>` : ''}
    </div>
    <div class="data-note">📺 <b>Dónde ver: ${watch.channel}</b>${watch.note ? "<br>" + watch.note : ""}</div>
    ${euroBrowser}
    ${autoInfo}
    <div id="detailResults"></div>
    ${body}
  `;
  loadResultsInto(calId, 'detailResults');

  tabs.forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-detail').classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

/* ============================================================
   EXPLORADOR DE INSCRITOS — Europeo de Birmingham (todos los países)
   Datos reales: European Athletics, "Final Entries - Athletes List
   by event", PDF oficial del 31/07/2026. 1.645 atletas, 49 países.
   ============================================================ */
let euroCategory = 'Hombres';
let euroEvent = null;
let euroSpainOnly = false;

function initInscritosTab(){
  euroCategory = 'Hombres';
  euroEvent = null;
  euroSpainOnly = false;
  document.getElementById('inscritosContent').innerHTML = renderEuroBrowserShell();
  selectEuroCategory('Hombres');
}

function renderEuroBrowserShell(){
  return `
    <div class="euro-browser">
      <div class="euro-browser-head">
        <h3>📋 Lista de salida completa del Europeo</h3>
        <span class="data-note" style="margin:0;">1.645 atletas · 49 países · fuente: European Athletics (31/07/2026)</span>
      </div>
      <div class="euro-cat-bar" id="euroCatBar"></div>
      <div class="euro-event-grid" id="euroEventGrid"></div>
      <button class="euro-event-btn" style="border-color:var(--gold);color:var(--gold);margin-bottom:14px;" onclick="showAllSpainEuro()">🇪🇸 Ver todos los españoles inscritos (todas las pruebas)</button>
      <div id="euroTableWrap"></div>
    </div>
  `;
}

function showAllSpainEuro(){
  euroEvent = '__ESP_ALL__';
  document.querySelectorAll('.euro-event-btn.active').forEach(b=>b.classList.remove('active'));
  const wrap = document.getElementById('euroTableWrap');
  const allRows = [];
  Object.keys(EURO_STARTLISTS).forEach(k=>{
    EURO_STARTLISTS[k].filter(r=>r[0]==='ESP').forEach(r=>allRows.push([EURO_EVENT_META[k].label, EURO_EVENT_META[k].group, r[1], r[2], r[3]]));
  });
  wrap.innerHTML = `
    <div class="euro-table-toolbar"><h4>🇪🇸 España — todas las pruebas (${allRows.length} inscripciones)</h4></div>
    <div class="euro-table-scroll">
      <table class="euro-table">
        <thead><tr><th>Prueba</th><th>Categoría</th><th>Atleta</th><th>PB</th><th>SB</th><th>Resultado</th></tr></thead>
        <tbody>
          ${allRows.map(r=>`
            <tr class="esp-row">
              <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
              <td class="mono">${r[3]||'—'}</td><td class="mono">${r[4]||'—'}</td>
              <td class="mono">Pendiente</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function selectEuroCategory(cat){
  euroCategory = cat;
  euroEvent = null;
  document.getElementById('euroCatBar').innerHTML = ['Hombres','Mujeres','Mixto'].map(c=>
    `<button class="euro-cat-btn ${c===euroCategory?'active':''}" onclick="selectEuroCategory('${c}')">${c}</button>`
  ).join('');
  const eventsInCat = Object.keys(EURO_EVENT_META).filter(k=>EURO_EVENT_META[k].group===cat);
  document.getElementById('euroEventGrid').innerHTML = eventsInCat.map(k=>
    `<button class="euro-event-btn ${k===euroEvent?'active':''}" onclick="selectEuroEvent('${k.replace(/'/g,"\\'")}')">${EURO_EVENT_META[k].label}</button>`
  ).join('');
  document.getElementById('euroTableWrap').innerHTML = `<div class="empty-state">Elige una prueba de ${cat.toLowerCase()} para ver el listado completo de inscritos.</div>`;
}

function selectEuroEvent(key){
  euroEvent = key;
  document.querySelectorAll('.euro-event-btn').forEach(b=>{
    b.classList.toggle('active', b.textContent === EURO_EVENT_META[key].label);
  });
  renderEuroTable();
}

function toggleEuroSpainOnly(){
  euroSpainOnly = !euroSpainOnly;
  renderEuroTable();
}

function renderEuroTable(){
  const wrap = document.getElementById('euroTableWrap');
  if(!euroEvent){ return; }
  let rows = EURO_STARTLISTS[euroEvent];
  const total = rows.length;
  if(euroSpainOnly) rows = rows.filter(r=>r[0]==='ESP');

  wrap.innerHTML = `
    <div class="euro-table-toolbar">
      <h4>${EURO_EVENT_META[euroEvent].label} — ${euroCategory}</h4>
      <label class="toggle-switch" style="cursor:pointer;">
        <input type="checkbox" ${euroSpainOnly?'checked':''} onchange="toggleEuroSpainOnly()">
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-text">Solo España</span>
      </label>
    </div>
    <div class="data-note" style="margin-bottom:10px;">${total} inscritos de ${new Set(EURO_STARTLISTS[euroEvent].map(r=>r[0])).size} países. Resultado: se actualizará cuando se dispute la prueba.</div>
    <div class="euro-table-scroll">
      <table class="euro-table">
        <thead><tr><th>País</th><th>Atleta</th><th>PB</th><th>SB</th><th>Resultado</th></tr></thead>
        <tbody>
          ${rows.map(r=>`
            <tr class="${r[0]==='ESP'?'esp-row':''}">
              <td>${r[0]}</td>
              <td>${r[1]}</td>
              <td class="mono">${r[2]||'—'}</td>
              <td class="mono">${r[3]||'—'}</td>
              <td class="mono">Pendiente</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function backToCalendar(){
  goToView('calendario');
}

/* ============================================================
   EN DIRECTO — datos automáticos (live.json)
   Una tarea programada comprueba las fuentes cada pocos minutos
   solo mientras hay competición; aquí se muestra lo último.
   ============================================================ */
let openLiveComp = null;

const LIVE_BADGE = {
  'en directo':           {txt:'EN DIRECTO', live:true},
  'sin datos en directo': {txt:'SIN DATOS EN DIRECTO', live:false},
  'pendiente':            {txt:'HOY', live:false},
  'finalizado':           {txt:'FINALIZADO', live:false},
};

function liveRows(rows){
  if(!rows || !rows.length) return '';
  return rows.map(r=>`
    <div class="mark-row">
      <span class="rk">${esc(r.pos||'')}</span>
      <span>${esc(r.name||'')}${(r.nat||r.club)?`<br><small style="color:var(--gray)">${esc([r.nat, r.club].filter(Boolean).join(' · '))}</small>`:''}</span>
      <span class="mono">${esc(r.mark||'')}${r.note?` <small>${esc(r.note)}</small>`:''}</span>
    </div>`).join('');
}

function horarioPrevisto(l){
  if(l.first) return `Horario previsto: ${l.first}${l.last && l.last!==l.first ? '–'+l.last : ''}`;
  return 'Horario previsto: sin publicar';
}

function renderLive(){
  const grid = document.getElementById('liveGrid');
  const upd = document.getElementById('liveUpdated');
  const items = LIVE_DATA && LIVE_DATA.date === hoyISO() ? Object.values(LIVE_DATA.items || {}) : [];
  // Citas de hoy según el calendario aunque la tarea de directo aún no haya pasado
  const hoy = hoyISO();
  CALENDAR.filter(c => c.date <= hoy && (c.end_date || c.date) >= hoy).forEach(c=>{
    if(!items.some(i=>i.id===c.id)) items.push({id:c.id, name:c.name, place:c.place, first:c.time, last:c.time_end, links:c.links||{}, status:'pendiente'});
  });
  if(items.length === 0){
    upd.style.display = 'none';
    grid.innerHTML = `<div class="empty-state"><h3>Sin competiciones en curso</h3></div>`;
    return;
  }
  const order = {'en directo':0,'sin datos en directo':1,'pendiente':2,'finalizado':3};
  items.sort((a,b)=> (order[a.status]??9)-(order[b.status]??9) || (a.first||'99').localeCompare(b.first||'99'));
  if(LIVE_DATA && LIVE_DATA.generated){
    upd.style.display = '';
    upd.innerHTML = `🔄 Última comprobación: <b>${horaDe(LIVE_DATA.generated)}</b>. La página se actualiza sola.`;
  } else upd.style.display = 'none';

  grid.innerHTML = items.map(l=>{
    const b = LIVE_BADGE[l.status] || LIVE_BADGE['pendiente'];
    const d = l.data || {};
    const isOpen = b.live || openLiveComp === l.id;
    const links = linkButtons(l.links||{});
    let body = '';
    if(isOpen){
      if(d.events && d.events.length){
        body += d.events.map(e=>`
          <div class="mark-row" style="grid-template-columns:1fr"><span><b>${esc(e.name)}</b>${e.round?` · ${esc(e.round)}`:''}${e.time?` · ${esc(e.time)}`:''}</span></div>
          ${liveRows(e.rows)}`).join('');
        if(d.pdf) body += `<div class="mark-row" style="grid-template-columns:1fr"><span>📄 <a href="${d.pdf}" target="_blank" rel="noopener">Resultados en PDF</a></span></div>`;
      } else {
        body += `<div class="mark-row" style="grid-template-columns:1fr"><span>${l.status==='finalizado' ? 'Competición terminada. Los resultados aparecerán en la sección Resultados en cuanto se publiquen.' : 'Sin datos en directo. ' + horarioPrevisto(l) + '.'}</span></div>`;
      }
      if(d.schedule && d.schedule.length){
        body += `<div class="mark-row" style="grid-template-columns:1fr"><span><b>Próximas pruebas</b></span></div>` +
          d.schedule.map(x=>`<div class="mark-row" style="grid-template-columns:60px 1fr"><span class="mono">${esc(x.time)}</span><span>${esc(x.event)} · ${esc(x.round||'')}</span></div>`).join('');
      }
      if(links) body += `<div class="mark-row" style="grid-template-columns:1fr"><span>${links}</span></div>`;
    }
    return `
    <div class="live-card">
      <div class="live-card-head" style="cursor:pointer" data-toggle="${l.id}">
        <div>
          <h3>${esc(l.name)}</h3>
          <div class="meet">${esc(l.place||'')}${l.place?' · ':''}${horarioPrevisto(l)}${d.done!=null?` · ${d.done}/${d.total} pruebas terminadas`:''}</div>
        </div>
        <div class="badge-live" style="${b.live?'':'background:var(--gray-dim)'}">${b.live?"<span class='live-dot'></span>":''}${b.txt}</div>
      </div>
      ${body}
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-toggle]').forEach(head=>{
    head.addEventListener('click', ()=>{
      const id = head.dataset.toggle;
      openLiveComp = (openLiveComp === id) ? null : id;
      renderLive();
    });
  });
}

/* ============================================================
   PRÓXIMAS COMPETICIONES — rango de 7 días
   Desde hoy hasta dentro de 6 días (si hoy es martes, hasta el lunes).
   ============================================================ */
let openComp = null;

function proximasRango(){
  const ini = new Date(hoyISO() + 'T12:00:00');
  const fin = new Date(ini); fin.setDate(fin.getDate() + 6);
  return [hoyISO(), isoDe(fin)];
}

function renderCompAccordion(){
  const wrap = document.getElementById('compSelectBar');
  const [ini, fin] = proximasRango();
  document.getElementById('proxRange').innerHTML =
    `📅 Del <b>${fechaCorta(ini)}</b> al <b>${fechaCorta(fin)}</b>.`;
  const lista = CALENDAR
    .filter(c => (c.end_date || c.date) >= ini && c.date <= fin)
    .sort((a,b)=> a.date.localeCompare(b.date) || (a.time||'99').localeCompare(b.time||'99') || a.name.localeCompare(b.name));
  if(lista.length === 0){
    wrap.innerHTML = `<div class="empty-state"><h3>Sin competiciones</h3>No hay citas en el calendario para los próximos 7 días.</div>`;
    return;
  }
  let lastDay = null;
  wrap.innerHTML = lista.map(ev=>{
    const day = ev.date < ini ? ini : ev.date;
    const head = day !== lastDay ? `<div class="eyebrow" style="margin:18px 0 6px;">${fechaDia(day)}</div>` : '';
    lastDay = day;
    const isOpen = ev.id === openComp;
    const comp = COMPETITIONS.find(c=>c.id===ev.id);
    const nDest = (ev.destacados||[]).length;
    let body = '';
    if(isOpen){
      body = `<div class="comp-accordion-body">
        ${renderAutoInfo(ev) || `<div class="data-note">📍 <b>${esc(ev.place||'Lugar por confirmar')}</b> — ${fechaLarga(ev.date, ev.end_date)}</div>`}
        ${comp && comp.events.length ? `<div class="roster-grid">${renderEventBlocks(comp.id, comp.events)}</div>` : ''}
        <button class="comp-pill" style="margin-top:10px;" onclick="showCompetitionDetail('${ev.id}')">Ver ficha completa →</button>
      </div>`;
    }
    return `${head}
      <div class="comp-accordion-item">
        <button class="comp-pill ${isOpen?'active':''}" data-id="${ev.id}">${esc(ev.name)}
          <span style="color:var(--gray);font-size:12px;">${[ev.place, ev.time, nDest ? '⭐ '+nDest+' destacados' : ''].filter(Boolean).map(x=>'· '+esc(x)).join(' ')}</span></button>
        ${body}
      </div>`;
  }).join('');
  wrap.querySelectorAll('.comp-pill[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openComp = (openComp === btn.dataset.id) ? null : btn.dataset.id;
      renderCompAccordion();
    });
  });
}

/* ============================================================
   RESULTADOS — competiciones internacionales ya finalizadas
   ============================================================ */
// Se calculan automáticamente: cualquier competición de COMPETITIONS marcada
// como FINALIZADO aparece aquí, sin tener que mantener una lista aparte.
let openResultComp = null;

function renderResultsAccordion(){
  const wrap = document.getElementById('resultsSelectBar');
  if(!wrap) return;
  const finished = COMPETITIONS.filter(c=>c.dates.includes('FINALIZADO'));
  wrap.innerHTML = finished.map(comp=>{
    const isOpen = comp.id === openResultComp;
    const watch = getWatchInfo(comp.id);
    const body = comp.events.length === 0
      ? `<div class="empty-state"><h3>Sin desglose todavía</h3>Esta competición ya ha finalizado pero aún no tengo medallistas confirmados con nombre y apellido.</div>`
      : renderEventBlocks(comp.id, comp.events);
    return `
      <div class="comp-accordion-item">
        <button class="comp-pill ${isOpen?'active':''}" data-id="${comp.id}">${comp.name} <span style="color:var(--gray);font-size:12px;">· ${comp.place.split('·')[0].trim()}</span></button>
        ${isOpen ? `
          <div class="comp-accordion-body">
            <div class="data-note">📍 <b>${comp.place}</b> — ${comp.dates}<br>${comp.note}</div>
            <div class="data-note">📺 <b>Dónde ver: ${watch.channel}</b>${watch.note ? "<br>" + watch.note : ""}</div>
            <div class="roster-grid">${body}</div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  wrap.querySelectorAll('.comp-pill').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      openResultComp = (openResultComp === btn.dataset.id) ? null : btn.dataset.id;
      renderResultsAccordion();
    });
  });
}

renderResultsAccordion();

/* ============================================================
   RESULTADOS — temporada completa (1 de enero → hoy)
   ============================================================ */
function resToday(){ return new Date().toISOString().slice(0,10); }

function resPastEvents(){
  const hoy = resToday();
  const inicio = hoy.slice(0,4) + '-01-01';
  const past = CALENDAR.filter(ev => ev.date >= inicio && ev.date <= hoy);
  // resultados publicados que no están en el calendario (p. ej. PDFs de RFEA de citas internacionales)
  RESULTS_INDEX.filter(r => !r.cal_id && r.date && r.date >= inicio && !past.some(p=>p.id===r.id)).forEach(r=>{
    past.push({id:r.id, date:r.date, name:r.name, place:r.place||'', type:'Internacional', cat:r.source, source:r.source, _resultOnly:true});
  });
  return past.sort((a,b)=> b.date.localeCompare(a.date));
}

let openResultRow = null;

function renderResultsSeason(){
  const month = document.getElementById('resMonth').value;
  const type = document.getElementById('resType').value;
  const localidad = document.getElementById('resCat').value;
  const fuente = document.getElementById('resFuente').value;
  const q = (document.getElementById('resSearch').value || '').trim().toLowerCase();

  const filtered = resPastEvents().filter(ev=>{
    const evMonth = MESES[parseInt(ev.date.split('-')[1],10)-1];
    if(month && evMonth !== month) return false;
    if(type && ev.type !== type) return false;
    if(localidad && getCCAA(ev.place) !== localidad) return false;
    if(fuente && getFuenteCalendario(ev.id) !== fuente) return false;
    if(q && !(ev.name.toLowerCase().includes(q) || ev.place.toLowerCase().includes(q))) return false;
    return true;
  });

  const count = document.getElementById('resCount');
  const list = document.getElementById('resList');

  if(filtered.length === 0){
    count.style.display = 'none';
    list.innerHTML = `<div class="empty-state"><h3>Sin resultados</h3>Ninguna competición disputada coincide con estos filtros.</div>`;
    return;
  }

  count.style.display = '';
  const conRes = filtered.filter(ev => resultFor(ev.id) || COMPETITIONS.some(c=>c.id===ev.id && c.events.length)).length;
  count.innerHTML = `🏁 <b>${filtered.length}</b> competiciones disputadas este año con los filtros activos · <b>${conRes}</b> con resultados.`;

  list.innerHTML = filtered.map(ev=>{
    const [y,m,d] = ev.date.split('-');
    const isIntl = ev.type === "Internacional";
    const comp = COMPETITIONS.find(c=>c.id===ev.id);
    const auto = resultFor(ev.id);
    const hasDetail = !!(comp && comp.events && comp.events.length) || !!auto;
    const isOpen = openResultRow === ev.id;
    const missing = !hasDetail && MISSING_IDS.has(ev.id);
    const badge = hasDetail
      ? `<div class="tag intl">Resultados</div>`
      : missing ? `<div class="tag nac" title="No se han encontrado resultados en ninguna fuente">Sin resultados localizados</div>`
      : `<div class="tag nac">Disputada</div>`;
    const body = !isOpen ? '' : `
      <div class="comp-accordion-body">
        <div class="data-note">📍 <b>${esc(comp ? comp.place : (ev.place || '—'))}</b> — ${comp ? comp.dates : fechaLarga(ev.date, ev.end_date)}${comp && comp.note ? '<br>'+comp.note : ''}</div>
        ${comp && comp.events && comp.events.length ? `<div class="roster-grid">${renderEventBlocks(ev.id, comp.events)}</div>` : ''}
        ${auto ? renderResultSummary(auto) : ''}
        ${!hasDetail ? `<div class="empty-state"><h3>${missing ? 'Sin resultados localizados' : 'Resultados aún no publicados'}</h3>${missing ? 'No se han encontrado los resultados de esta competición en ninguna fuente. Se sigue buscando automáticamente.' : 'Esta competición ya se ha celebrado, pero la organización todavía no ha publicado los resultados. Se añadirán solos en cuanto aparezcan.'}${linkButtons(ev.links||{}) ? '<br><br>'+linkButtons(ev.links||{}) : ''}</div>` : ''}
      </div>`;
    return `
    <div class="comp-accordion-item">
      <div class="cal-row" style="cursor:pointer;" data-res-id="${ev.id}">
        <div class="cal-date"><span class="day">${d}</span>${MESES[parseInt(m,10)-1].slice(0,3).toUpperCase()} ${y}</div>
        <div>
          <div class="cal-name">${esc(ev.name)}</div>
          <div class="cal-place">${esc(ev.place)}${ev.place && ev.cat ? ' · ' : ''}${esc(ev.cat||'')}</div>
        </div>
        <div class="cal-place">${ev.type}</div>
        ${badge}
        <div class="cal-arrow">${isOpen?'↑':'→'}</div>
      </div>
      ${body}
    </div>`;
  }).join('');

  list.querySelectorAll('[data-res-id]').forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.dataset.resId;
      openResultRow = (openResultRow === id) ? null : id;
      renderResultsSeason();
    });
  });
}

(function initResultsFilters(){
  const past = resPastEvents();
  const monthOrder = MESES.filter(m => past.some(e => MESES[parseInt(e.date.split('-')[1],10)-1] === m));
  populateSelect('resMonth', monthOrder, 'Todos los meses');
  populateSelect('resType', [...new Set(past.map(e=>e.type))].sort(), 'Todas las modalidades');
  populateSelect('resCat', ordenarCCAA([...new Set(past.map(e=>getCCAA(e.place)))]), 'Todas las localidades');
  populateSelect('resFuente', ordenarFuentes([...new Set(past.map(e=>getFuenteCalendario(e.id)))]), 'Todos los calendarios');
  ['resMonth','resType','resCat','resFuente'].forEach(id=>document.getElementById(id).addEventListener('change', renderResultsSeason));
  document.getElementById('resSearch').addEventListener('input', renderResultsSeason);
  renderResultsSeason();
})();

/* ============================================================
   RANKING
   ============================================================ */
populateSelect('rankSex', ["Mujeres","Hombres"], '');
document.getElementById('rankSex').removeChild(document.getElementById('rankSex').firstChild);
document.getElementById('rankSex').value = "Mujeres";

function refreshRankEventOptions(){
  const sex = document.getElementById('rankSex').value || "Mujeres";
  populateSelect('rankEvent', Object.keys(RANKING[sex]), 'Todas las pruebas');
}

function renderRanking(){
  const sex = document.getElementById('rankSex').value || "Mujeres";
  const event = document.getElementById('rankEvent').value;
  const body = document.getElementById('rankBody');
  const data = RANKING[sex];

  const events = event ? [event] : Object.keys(data);

  body.innerHTML = events.map(ev=>{
    const r = data[ev];
    if(!r) return '';
    return `
    <tr>
      <td class="rk" style="font-size:15px;color:var(--ivory);font-family:'Barlow Condensed',sans-serif;font-weight:700;">${ev}</td>
      <td class="mark">${r.mark}</td>
      <td>${r.name}</td>
      <td class="club">${r.club}</td>
      <td class="club">${r.when}</td>
    </tr>`;
  }).join('');
}

document.getElementById('rankSex').addEventListener('change', ()=>{ refreshRankEventOptions(); renderRanking(); });
document.getElementById('rankEvent').addEventListener('change', renderRanking);
refreshRankEventOptions();
renderRanking();

/* ============================================================
   DATOS AUTOMÁTICOS
   Los scrapers (GitHub Actions) guardan los datos en la rama
   "datos" del repositorio. Si no se pueden leer, se usa la copia
   de la carpeta data/ y, en último caso, los datos de este archivo.
   ============================================================ */
const DATA_URLS = [
  'https://raw.githubusercontent.com/kermantxo/calledoss/datos/',
  'data/'
];
const LIVE_REFRESH_MS = 2 * 60 * 1000;
const CALENDAR_CURATED = CALENDAR.slice();

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function isoDe(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function hoyISO(){
  // fecha de hoy en España, se mire desde donde se mire
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Madrid'}).format(new Date());
}
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function fechaCorta(iso){
  const [y,m,d] = iso.split('-');
  return `${parseInt(d,10)} ${MESES[parseInt(m,10)-1].slice(0,3)}`;
}
function fechaDia(iso){
  const dt = new Date(iso + 'T12:00:00');
  const txt = `${DIAS[dt.getDay()]} ${dt.getDate()} de ${MESES[dt.getMonth()]}`;
  return iso === hoyISO() ? `Hoy · ${txt}` : txt.charAt(0).toUpperCase() + txt.slice(1);
}
function fechaLarga(ini, fin){
  const [y,m,d] = ini.split('-');
  if(fin && fin !== ini){
    const [y2,m2,d2] = fin.split('-');
    if(m2 === m) return `${parseInt(d,10)}–${parseInt(d2,10)} de ${MESES[parseInt(m,10)-1]} de ${y}`;
    return `${parseInt(d,10)} de ${MESES[parseInt(m,10)-1]} – ${parseInt(d2,10)} de ${MESES[parseInt(m2,10)-1]} de ${y2}`;
  }
  return `${parseInt(d,10)} de ${MESES[parseInt(m,10)-1]} de ${y}`;
}
function horaDe(isoDateTime){
  try { return new Date(isoDateTime).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit', timeZone:'Europe/Madrid'}); }
  catch(e){ return ''; }
}

const LINK_LABELS = {inscritos:'📋 Inscritos', resultados:'🏁 Resultados', directo:'🔴 Directo', streaming:'📺 Streaming', horario:'🕒 Horario', web:'🌐 Web oficial', info:'ℹ️ Ficha oficial'};
function linkButtons(links){
  return Object.keys(LINK_LABELS).filter(k => links && links[k]).map(k =>
    `<a class="comp-pill" style="display:inline-block;margin:4px 6px 0 0;text-decoration:none;" href="${esc(links[k])}" target="_blank" rel="noopener">${LINK_LABELS[k]}</a>`
  ).join('');
}

function calMeta(ev){
  const bits = [];
  if(ev.end_date && ev.end_date !== ev.date) bits.push(`hasta el ${fechaCorta(ev.end_date)}`);
  if(ev.time) bits.push(`🕒 ${ev.time}`);
  if(ev.links && ev.links.inscritos) bits.push('📋 inscritos');
  if(resultFor(ev.id)) bits.push('🏁 resultados');
  if(ev.destacados && ev.destacados.length) bits.push(`⭐ ${ev.destacados.length} destacados`);
  return bits.length ? `${ev.place ? ' · ' : ''}<span style="color:var(--gray)">${bits.join(' · ')}</span>` : '';
}

function renderDestacados(list){
  if(!list || !list.length) return '';
  return `<div class="event-block">
    <div class="event-block-head"><h3>⭐ Españoles a seguir</h3><span>${list.length}</span></div>
    <div class="athlete-list">${list.map(a=>`
      <div class="athlete-row">
        <div class="athlete-row-name">${esc(a.name)}</div>
        <div class="athlete-row-ref">${esc(a.event)}${a.round?' · '+esc(a.round):''}${a.club?' · '+esc(a.club):''}</div>
        <div class="athlete-row-meta">
          <span><b>Por qué:</b> ${esc(a.why)}</span>
          ${a.sb ? `<span><b>Mejor marca del año:</b> ${esc(a.sb)}</span>` : ''}
          ${a.time ? `<span><b>Cuándo compite:</b> ${a.date ? fechaCorta(a.date)+', ' : ''}${esc(a.time)}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

// Bloque con la información automática de una cita (horario, enlaces, destacados)
function renderAutoInfo(ev){
  if(!ev || (!ev.links && !ev.time && !ev.destacados && !ev.sources)) return '';
  const parts = [];
  if(ev.times && Object.keys(ev.times).length){
    parts.push(`<div class="data-note">🕒 <b>Horario</b><br>${Object.keys(ev.times).sort().map(d=>`${fechaDia(d)}: ${ev.times[d][0]}–${ev.times[d][1]}`).join('<br>')}</div>`);
  } else if(ev.time){
    parts.push(`<div class="data-note">🕒 <b>Hora de inicio:</b> ${ev.time}${ev.time_end && ev.time_end!==ev.time ? ' · fin previsto ' + ev.time_end : ''}</div>`);
  }
  const links = linkButtons(ev.links || {});
  if(links) parts.push(`<div class="data-note">${links}</div>`);
  if(ev.destacados && ev.destacados.length) parts.push(`<div class="roster-grid">${renderDestacados(ev.destacados)}</div>`);
  const pv = PREVIAS.find(p => p.id === ev.id);
  if(pv) parts.push(`<div class="data-note">${pv.status === 'publicados'
    ? `⭐ <b>Previa disponible</b> (${pv.n_inscritos} inscritos). <button class="comp-pill" onclick="event.stopPropagation();openPrevia='${ev.id}';handleNavClick('previas');renderPrevias();">Ver previa →</button>`
    : '📋 Inscritos no publicados aún.'}</div>`);
  if(ev.sources && ev.sources.length) parts.push(`<div class="data-note" style="font-size:13px;color:var(--gray)">Datos: ${ev.sources.map(esc).join(', ')}</div>`);
  return parts.join('');
}

function resultFor(calId){
  return RESULTS_INDEX.find(r => r.cal_id === calId || r.id === calId) || null;
}

function resultTable(rows, showNat){
  return `<div class="athlete-list">${rows.map(r=>`
    <div class="athlete-row">
      <div class="athlete-row-name">${esc(r.pos ? r.pos + '. ' : '')}${esc(r.name)}</div>
      <div class="athlete-row-ref">${esc([showNat && r.nat ? r.nat : '', r.club || r.cat || ''].filter(Boolean).join(' · '))}</div>
      <div class="athlete-row-meta"><span><b>Marca:</b> ${esc(r.mark || '—')}${r.wind ? ' ('+esc(r.wind)+')' : ''}${r.note ? ' · '+esc(r.note) : ''}</span></div>
    </div>`).join('')}</div>`;
}

function renderResultSummary(r){
  if(r.link_only){
    return `<div class="data-note">🏁 Clasificaciones publicadas por el cronometrador.<br><a class="comp-pill" style="display:inline-block;margin-top:6px;text-decoration:none;" href="${esc(r.url)}" target="_blank" rel="noopener">Ver clasificaciones →</a></div>`;
  }
  const blocks = [];
  if(r.espanoles && r.espanoles.length){
    blocks.push(`<div class="event-block"><div class="event-block-head"><h3>🇪🇸 Españoles</h3><span>${r.espanoles.length}</span></div>
      ${resultTable(r.espanoles.map(x=>({...x, club: x.event + (x.round ? ' · ' + x.round : '')})), false)}</div>`);
  }
  if(r.destacados && r.destacados.length){
    blocks.push(`<div class="event-block"><div class="event-block-head"><h3>⭐ Destacados</h3><span>${r.destacados.length}</span></div>
      ${resultTable(r.destacados.map(x=>({...x, club: x.event + (x.round ? ' · ' + x.round : '')})), false)}</div>`);
  }
  (r.podios || []).forEach(p=>{
    blocks.push(`<div class="event-block"><div class="event-block-head"><h3>${esc(p.event)}</h3><span>${esc(p.round || 'Podio')}</span></div>${resultTable(p.rows, true)}</div>`);
  });
  return `<div class="data-note">🏁 Resultados · fuente: <b>${esc(r.source)}</b>${r.url ? ` · <a href="${esc(r.url)}" target="_blank" rel="noopener">original</a>` : ''}</div>
    <div class="roster-grid">${blocks.join('') || '<div class="empty-state">Resultados disponibles en el enlace original.</div>'}</div>
    <button class="comp-pill" style="margin-top:10px;" onclick="event.stopPropagation();loadResultsInto('${r.id}', 'full-${r.id}', true)">Ver todas las pruebas →</button>
    <div id="full-${r.id}"></div>`;
}

// Ficha completa de resultados (se descarga solo al pedirla)
async function loadResultsInto(calId, targetId, full){
  const r = resultFor(calId);
  const el = document.getElementById(targetId);
  if(!r || !el) return;
  if(!full){ el.innerHTML = renderResultSummary(r); return; }
  el.innerHTML = '<div class="data-note">Cargando resultados…</div>';
  const data = await loadData(`results/${r.id}.json`);
  if(!data || !data.events){ el.innerHTML = '<div class="data-note">No se han podido cargar los resultados.</div>'; return; }
  el.innerHTML = `<div class="roster-grid">${data.events.map(ev=>{
    const rounds = ev.rounds || [ev];
    return rounds.map(rd=>`<div class="event-block"><div class="event-block-head"><h3>${esc(ev.name)}</h3><span>${esc(rd.round || '')}</span></div>${resultTable(rd.rows || [], true)}</div>`).join('');
  }).join('')}</div>`;
}

async function loadData(name){
  for(const base of DATA_URLS){
    try{
      const bust = base.startsWith('http') ? `?t=${Math.floor(Date.now()/60000)}` : '';
      const r = await fetch(base + name + bust, {cache:'no-store'});
      if(r.ok) return await r.json();
    }catch(e){ /* probamos la siguiente fuente */ }
  }
  return null;
}

function nombreParecido(a, b){
  const stop = new Set('de del la las los el y i en a al por campeonato cto trofeo meeting memorial carrera popular internacional ciudad'.split(' '));
  const tok = s => new Set(normalizarLocalidad(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(t => t && !stop.has(t) && !/^\d+$/.test(t)));
  const A = tok(a), B = tok(b);
  if(!A.size || !B.size) return false;
  let inter = 0; A.forEach(t => { if(B.has(t)) inter++; });
  return inter / Math.min(A.size, B.size) >= 0.7;
}
function seSolapan(a, b){
  return a.date <= (b.end_date || b.date) && b.date <= (a.end_date || a.date);
}

// Junta el calendario automático con las fichas elaboradas a mano (COMPETITIONS)
function applyAutoCalendar(auto){
  const curated = CALENDAR_CURATED.filter(c => COMPETITIONS.some(k => k.id === c.id));
  const out = curated.map(c => ({...c}));
  auto.items.forEach(a=>{
    const twin = out.find(c => !c.source && seSolapan(c, a) && nombreParecido(c.name, a.name));
    if(twin){
      twin.links = {...(a.links||{}), ...(twin.links||{})};
      ['time','time_end','times','destacados','sources','end_date'].forEach(k => { if(a[k] && !twin[k]) twin[k] = a[k]; });
      if(!twin.alias) twin.alias = [];
      twin.alias.push(a.id);
    } else {
      out.push(a);
    }
  });
  CALENDAR.length = 0;
  out.forEach(x => CALENDAR.push(x));
  // los resultados apuntan al id automático: se enlazan también a la ficha elaborada
  CALENDAR.forEach(c => (c.alias||[]).forEach(id => RESULTS_INDEX.forEach(r => { if(r.cal_id === id) r.cal_id = c.id; })));
}

// Completa el «Resultado: Pendiente» de las fichas hechas a mano con los resultados automáticos
function fillCuratedResults(){
  const tok = s => normalizarLocalidad(s).toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(t => t.length > 1);
  COMPETITIONS.forEach(comp=>{
    const r = resultFor(comp.id);
    if(!r || !r.espanoles) return;
    comp.events.forEach(ev => ev.athletes.forEach(a=>{
      if(a.result && a.result !== 'Pendiente') return;
      const ta = tok(a.name);
      const hits = r.espanoles.filter(x => { const tx = tok(x.name); return tx.length >= 2 && tx.every(t => ta.includes(t)); });
      if(!hits.length) return;
      const best = hits.find(x => /final/i.test(x.round || '')) || hits[0];
      const pos = parseInt(best.pos, 10);
      const medal = pos === 1 ? '🥇 ORO — ' : pos === 2 ? '🥈 PLATA — ' : pos === 3 ? '🥉 BRONCE — ' : (pos ? pos + 'º — ' : '');
      a.result = `${medal}${best.mark || ''}${best.round && !/^final$/i.test(best.round) ? ' ('+best.round+')' : ''}`;
    }));
  });
}

function keepValue(id, fn){
  const el = document.getElementById(id);
  const v = el.value;
  fn();
  if([...el.options].some(o => o.value === v)) el.value = v;
}
function refreshFilters(){
  keepValue('calMonth', ()=>populateSelect('calMonth', MESES.filter(m => CALENDAR.some(e => MESES[parseInt(e.date.split('-')[1],10)-1] === m)), 'Todos los meses'));
  keepValue('calType', ()=>populateSelect('calType', [...new Set(CALENDAR.map(e=>e.type))].sort(), 'Todos los tipos'));
  keepValue('calCat', ()=>populateSelect('calCat', ordenarCCAA([...new Set(CALENDAR.map(e=>getCCAA(e.place)))]), 'Todas las localidades'));
  keepValue('calFuente', ()=>populateSelect('calFuente', ordenarFuentes([...new Set(CALENDAR.map(e=>getFuenteCalendario(e.id)))]), 'Todos los calendarios'));
  const past = resPastEvents();
  keepValue('resMonth', ()=>populateSelect('resMonth', MESES.filter(m => past.some(e => MESES[parseInt(e.date.split('-')[1],10)-1] === m)), 'Todos los meses'));
  keepValue('resType', ()=>populateSelect('resType', [...new Set(past.map(e=>e.type))].sort(), 'Todas las modalidades'));
  keepValue('resCat', ()=>populateSelect('resCat', ordenarCCAA([...new Set(past.map(e=>getCCAA(e.place)))]), 'Todas las localidades'));
  keepValue('resFuente', ()=>populateSelect('resFuente', ordenarFuentes([...new Set(past.map(e=>getFuenteCalendario(e.id)))]), 'Todos los calendarios'));
}

/* ============================================================
   PREVIAS — destacados de cada lista de inscritos
   ============================================================ */
let openPrevia = null;

function previaCol(title, list){
  if(!list || !list.length) return `<div class="previa-col"><h4>${title}</h4><span style="color:var(--gray)">Sin destacados según los criterios.</span></div>`;
  return `<div class="previa-col"><h4>${title}</h4>${list.map(a=>`
    <div class="previa-ath"><b>${esc(a.name)}</b>${a.nat && a.nat!=='ESP' ? ` <small style="color:var(--gray)">${esc(a.nat)}</small>` : ''}
      ${a.pb || a.sb ? `<span class="marks"> · ${a.sb ? 'MMT ' + esc(a.sb) : ''}${a.sb && a.pb ? ' · ' : ''}${a.pb ? 'MMP ' + esc(a.pb) : ''}</span>` : ''}
      <span class="why">${a.reasons.map(esc).join(' · ')}</span>
      ${a.club ? `<span class="why">${esc(a.club)}</span>` : ''}
    </div>`).join('')}</div>`;
}

function renderPrevias(){
  const wrap = document.getElementById('previasList');
  if(!wrap) return;
  const q = (document.getElementById('prevSearch').value || '').toLowerCase();
  const only = document.getElementById('prevOnly').value;
  let list = PREVIAS.filter(p => (only === 'todas' || p.status === 'publicados'));
  if(q) list = list.filter(p => (p.name + ' ' + (p.place||'') + ' ' + JSON.stringify(p.events||[])).toLowerCase().includes(q));
  if(!list.length){
    wrap.innerHTML = `<div class="empty-state"><h3>${only==='todas' ? 'Sin competiciones' : 'Todavía no hay listas de inscritos publicadas'}</h3>Se revisan cada día las competiciones de los próximos 45 días.</div>`;
    return;
  }
  wrap.innerHTML = list.map(p=>{
    const isOpen = openPrevia === p.id;
    const nDest = (p.events||[]).reduce((n,e)=> n + e.M.length + e.F.length + (e.otros||[]).length, 0);
    const status = p.status === 'publicados'
      ? `<span class="previa-status ok">${p.n_inscritos} inscritos · ⭐ ${nDest}</span>`
      : `<span class="previa-status wait">Inscritos no publicados aún</span>`;
    let body = '';
    if(isOpen){
      const ch = p.changes || {};
      body = `<div class="comp-accordion-body">
        ${p.race_day ? `<div class="data-note">🔴 <b>Es hoy.</b> <button class="comp-pill active" onclick="handleNavClick('directo')">Ver en directo →</button></div>` : ''}
        ${p.status !== 'publicados' ? `<div class="empty-state"><h3>Inscritos no publicados aún</h3>Se revisa cada día. En cuanto la organización publique la lista, aquí aparecerán los atletas a seguir.</div>` : `
          <div class="data-note">📋 ${p.n_inscritos} inscritos · actualizado ${p.updated ? fechaCorta(p.updated.slice(0,10)) + ' ' + horaDe(p.updated) : ''}
            ${ch.altas || ch.bajas ? `<br>Cambios desde la última revisión: <b>+${ch.altas||0}</b> altas, <b>−${ch.bajas||0}</b> bajas` : ''}
            ${(ch.altas_destacadas||[]).length ? `<br>⭐ Nuevos destacados: ${ch.altas_destacadas.map(esc).join(', ')}` : ''}
            ${(ch.bajas_destacadas||[]).length ? `<br>✖ Bajas destacadas: ${ch.bajas_destacadas.map(esc).join(', ')}` : ''}
            ${(p.sources||[]).length ? `<br><a href="${esc(p.sources[0])}" target="_blank" rel="noopener">Ver la lista de inscritos original</a>` : ''}</div>
          ${(p.events||[]).filter(e => e.M.length || e.F.length || (e.otros||[]).length).map(e=>`
            <div class="previa-event"><h3>${esc(e.name)} <small style="color:var(--gray);font-size:14px;">· ${e.n} inscritos</small></h3>
              <div class="previa-grid">${previaCol('Masculino', e.M)}${previaCol('Femenino', e.F)}</div>
              ${(e.otros||[]).length ? previaCol('Sin sexo indicado en la lista', e.otros) : ''}
            </div>`).join('') || '<div class="empty-state">La lista está publicada, pero ningún inscrito cumple todavía los criterios de destacado.</div>'}`}
        ${linkButtons(p.links||{})}
      </div>`;
    }
    return `<div class="comp-accordion-item">
      <div class="cal-row" style="cursor:pointer;" data-prev-id="${p.id}">
        <div class="cal-date"><span class="day">${p.date.slice(8,10)}</span>${MESES[parseInt(p.date.slice(5,7),10)-1].slice(0,3).toUpperCase()} ${p.date.slice(0,4)}</div>
        <div><div class="cal-name">${esc(p.name)}</div><div class="cal-place">${esc(p.place||'')}</div></div>
        <div class="cal-place">${esc(p.type||'')}</div>
        ${status}
        <div class="cal-arrow">${isOpen?'↑':'→'}</div>
      </div>${body}</div>`;
  }).join('');
  wrap.querySelectorAll('[data-prev-id]').forEach(row=> row.addEventListener('click', ()=>{
    openPrevia = openPrevia === row.dataset.prevId ? null : row.dataset.prevId;
    renderPrevias();
  }));
}
document.getElementById('prevSearch').addEventListener('input', renderPrevias);
document.getElementById('prevOnly').addEventListener('change', renderPrevias);

function renderAll(){
  refreshFilters();
  renderCalendar();
  renderResultsSeason();
  renderCompAccordion();
  renderLive();
  renderPrevias();
  refreshTicker();
}

async function refreshLive(){
  const live = await loadData('live.json');
  if(live){ LIVE_DATA = live; renderLive(); refreshTicker(); }
}

(async function bootAutoData(){
  renderAll(); // primero con lo que ya hay en la página
  const [cal, res, live, miss, prev] = await Promise.all([loadData('calendar.json'), loadData('results/index.json'), loadData('live.json'), loadData('results/sin_resultados.json'), loadData('previas.json')]);
  if(prev && prev.items) PREVIAS = prev.items;
  if(res && res.items) RESULTS_INDEX = res.items;
  if(miss && miss.items) MISSING_IDS = new Set(miss.items.map(x => x.id));
  if(cal && cal.items && cal.items.length) applyAutoCalendar(cal);
  fillCuratedResults();
  if(live) LIVE_DATA = live;
  renderAll();
  setInterval(()=>{ if(!document.hidden) refreshLive(); }, LIVE_REFRESH_MS);
})();
