"""Limpieza de nombres de atletas: siempre "Nombre Apellidos", sin país, fecha ni números pegados.

Se aplica a todas las filas antes de guardarlas (results.store) y en la revisión completa
(python -m pipeline.run revisar). Todo son reglas fijas; sin IA.
"""
import re
import unicodedata

# Códigos de país (COI / World Athletics) que a veces aparecen pegados al nombre
COUNTRIES = set("""
AFG ALB ALG AND ANG ANT ARG ARM ARU ASA AUS AUT AZE BAH BAN BAR BDI BEL BEN BER BHU BIH BIZ BLR BOL BOT BRA BRN BRU
BUL BUR CAF CAM CAN CAY CGO CHA CHI CHN CIV CMR COD COK COL COM CPV CRC CRO CUB CYP CZE DEN DJI DMA DOM ECU EGY ERI
ESA ESP EST ETH FIJ FIN FRA FSM GAB GAM GBR GBS GEO GEQ GER GHA GIB GRE GRN GUA GUI GUM GUY HAI HKG HON HUN INA IND
IRI IRL IRQ ISL ISR ISV ITA IVB JAM JOR JPN KAZ KEN KGZ KIR KOR KOS KSA KUW LAO LAT LBA LBN LBR LCA LES LIE LTU LUX
MAD MAR MAS MAW MDA MDV MEX MGL MHL MKD MLI MLT MNE MON MOZ MRI MTN MYA NAM NCA NED NEP NGR NIG NOR NRU NZL OMA PAK
PAN PAR PER PHI PLE PLW PNG POL POR PRK PUR QAT ROU RSA RUS RWA SAM SEN SEY SGP SKN SLE SLO SMR SOL SOM SRB SRI SSD
STP SUD SUI SUR SVK SWE SWZ SYR TAN TGA THA TJK TKM TLS TOG TPE TTO TUN TUR TUV UAE UGA UKR URU USA UZB VAN VEN VIE
VIN YEM ZAM ZIM
""".split())
COUNTRY_NAMES = re.compile(r"\b(España|Marruecos|Francia|Portugal|Italia|Kenia|Kenya|Etiop[ií]a|Ethiopia|Spain|Morocco|"
                           r"France|Italy|Argelia|Algeria|Reino Unido|Alemania|Germany|Pa[ií]ses Bajos|B[eé]lgica|Suiza|"
                           r"Noruega|Suecia|Eritrea|Uganda|Colombia|Venezuela|Argentina|M[eé]xico|Brasil|Grecia|Turqu[ií]a|"
                           r"Polonia|Rumania|Ruman[ií]a|Irlanda|Ireland|Ucrania|Túnez|Tunisia)\s*$", re.I)
CATEGORY_TAIL = re.compile(r"\s+(s[eé]nior|senior|m[aá]ster(\s*\w)?|master\s*\d*|veteran[oa]\s*\w?|sub\s?\d+|u\d{2}|j[uú]nior|"
                           r"juvenil|cadete|infantil|promesa|absolut[oa]|masculin[oa]|femenin[oa]|mas|fem|\w?\d{2,})$", re.I)
PARTICLES = {"de", "del", "la", "las", "los", "y", "i", "da", "do", "dos", "das", "van", "von", "der", "di"}


def _strip(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn").lower()


def _cap(w):
    if _strip(w) in PARTICLES:
        return w.lower()
    if w.isupper() or w.islower():
        return "-".join(p[:1].upper() + p[1:].lower() for p in w.split("-"))
    return w


def clean_name(raw, nat=""):
    """Devuelve (nombre, nacionalidad)."""
    s = re.sub(r"\s+", " ", (raw or "")).strip(" ,;-")
    if not s:
        return s, nat
    s = re.sub(r"\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b", " ", s)          # fechas de nacimiento
    s = re.sub(r"(?<=[A-Za-zÀ-ÿ])\d+\b", "", s)                          # "Ouhaddou1" -> "Ouhaddou"
    s = re.sub(r"\s\d+\b", " ", s)                                       # números sueltos
    s = re.sub(r"^\d+\s+", "", s)                                        # "431 Oier Erro" -> "Oier Erro"
    s = re.sub(r"\s+(No|Si|Sí|Yes)$", "", s)                              # columnas "Federado: No/Sí" pegadas
    s = COUNTRY_NAMES.sub("", s).strip()
    toks = s.split()
    codes = []
    while toks and toks[-1].upper() in COUNTRIES and toks[-1].isupper() and len(toks) > 1:
        codes.insert(0, toks.pop().upper())
    if codes and not nat:
        nat = codes[0]  # "ENGLISH Mark IRL MAR": la nacionalidad es el primer código
    s = " ".join(toks)
    for _ in range(3):                                                   # "... SENIOR", "... MÁSTER B"
        s2 = CATEGORY_TAIL.sub("", s).strip()
        if s2 == s or len(s2.split()) < 2:
            break
        s = s2
    s = s.strip(" ,;-")
    if s.count(",") == 1:                                                # "GARCÍA LÓPEZ, Juan"
        last, first = [x.strip() for x in s.split(",")]
        s = (first + " " + last).strip() if first and last else (first or last)
    s = s.replace(",", " ")
    toks = s.split()
    # "ENGLISH Mark" / "MARTÍN GARCÍA Vanesa": apellidos en mayúsculas delante del nombre
    if len(toks) >= 2:
        upper_lead = 0
        for t in toks:
            if t.isupper() and len(t) > 1:
                upper_lead += 1
            else:
                break
        rest = toks[upper_lead:]
        if 0 < upper_lead < len(toks) and rest and all(t[:1].isupper() and not t.isupper() for t in rest):
            toks = rest + toks[:upper_lead]
    s = " ".join(_cap(t) for t in toks)
    return s[:1].upper() + s[1:], nat


def is_abbreviated(name):
    """'H Santos Llorente' / 'J. Pérez': nombre de pila reducido a una inicial."""
    return bool(re.match(r"^[A-ZÁÉÍÓÚÑ]\.?\s+\S", name or ""))


def is_incomplete(name):
    return len((name or "").split()) < 2


# ------------------------------------------------------------------ sexo por nombre de pila (para revisar)

MALE = set("""
aaron abdel abderrahim abderrahmane abdelaziz abel abraham adam adolfo adria adrian agustin ahmed aimar aitor alain
alan albert alberto alejandro alex alexander alexandre alfonso alfredo ali alvaro amadeo amador anastasio andres
andreu angel anibal anselmo antoni antonio aritz arnau arturo asier ayoub baltasar bautista benito benjamin bernardo
biel borja bruno camilo carles carlos cayetano cesar christian cristian cristobal cristofer damian dani daniel dario
david diego dionisio domingo eduard eduardo efren elias eloy emilio eneko enric enrique eric ernesto esteban eugenio
ezequiel fabian facundo faustino federico felipe felix fermin fernando fidel francesc francisco gabriel gaizka
gaspar genis gerard german gerardo gil gonzalo gorka gregorio guillem guillermo gustavo hamza hector hugo iago ibai
ignacio igor iker imanol inaki isaac isidro ismael ivan izan jacinto jacob jaime jaume javier jesus joan joaquin joel
jon jonathan jordi jorge jose josep joseba josu juan julen julian julio justo kevin lazaro leandro leo leon leonardo
lorenzo lucas luis luka manel manuel marc marcelino marcelo marco marcos mariano mario marti martin mateo matias
mauricio mauro max maximo miguel mikel mohamed mohammed nacho nahuel nestor nicolas noel norberto octavio oier
omar oriol oscar osvaldo pablo pascual patricio pau pedro pelayo pere pol quim rafael raimundo ramiro ramon raul
reinaldo ricard ricardo roberto rodrigo roger rogelio roman ruben said salvador samuel santiago saul sebastian
sergi sergio silvestre simon teodoro tomas txema ulises unai urko valentin vicente victor xabier xavi xavier xoan
yago yeray yassine youssef zakaria
""".split())
FEMALE = set("""
adela adriana agata agueda aida ainara ainhoa aitana alba alejandra alexandra alicia alma almudena amaia amalia amanda
amparo ana andrea angela angeles anna antonia araceli arantxa ariadna aroa ascension asuncion aurora azucena barbara
beatriz begona belen berta blanca candela carla carlota carmen carolina catalina cecilia celia chloe clara claudia
concepcion consuelo cristina daniela debora diana dolores dulce edurne elena elisa elsa elvira emilia emma encarnacion
esperanza estefania ester esther eugenia eva fatima fernanda flor francisca gabriela gemma gisela gloria graciela
helena ines inmaculada irene iria isabel itziar ivana jana jennifer jessica jimena josefa juana judit judith julia
julieta karen laia lara laura leire leticia lidia lilian lola lorena lourdes lucia luisa luz macarena magdalena maialen
maider maite manuela mar mara marcela margarita maria mariana marina marisa marisol marta matilde mercedes miren
miriam monica montserrat nadia naia nahia natalia nerea nieves noa noelia nora nuria olga paloma paola patricia paula
pilar raquel rebeca regina rocio rosa rosalia rosario ruth sabrina salma samanta sandra sara sheila silvia sofia soledad
sonia susana tamara tania teresa uxue valeria vanesa vega veronica victoria virginia viviana yaiza yasmina yolanda zoe
zuriñe
""".split())


def sex_from_first_name(name):
    """'M', 'F' o '' si no se sabe (nombres extranjeros, ambiguos...)."""
    toks = _strip(name or "").split()
    if not toks:
        return ""
    t = toks[0]
    if t in MALE and t not in FEMALE:
        return "M"
    if t in FEMALE and t not in MALE:
        return "F"
    return ""
