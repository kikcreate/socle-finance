# Génère les pages outils/*.html du site Socle (main seulement, en-tête et pied injectés par site.js)
import html, os
OUT = "/mnt/project-files/site-socle-complet/outils/"
E = html.escape

def num(name, label, val, mn=None, mx=None, step="any", hint="", fmt=None, rng=False, suf=""):
    a = f' min="{mn}"' if mn is not None else ""
    a += f' max="{mx}"' if mx is not None else ""
    out = f'<output for="{name}" data-fmt="{fmt}"></output>' if (rng and fmt) else (f'<output for="{name}" data-suf="{suf}"></output>' if rng else "")
    t = "range" if rng else "number"
    h = f'<span class="hint">{hint}</span>' if hint else ""
    return f'<div class="field"><label for="{name}">{label}{out}</label><input type="{t}" id="{name}" name="{name}" value="{val}"{a} step="{step}" inputmode="decimal">{h}</div>'

def sel(name, label, opts, val=None, hint=""):
    o = "".join(f'<option value="{k}"{" selected" if k == val else ""}>{E(v)}</option>' for k, v in opts)
    h = f'<span class="hint">{hint}</span>' if hint else ""
    return f'<div class="field"><label for="{name}">{label}</label><select id="{name}" name="{name}">{o}</select>{h}</div>'

def seg(name, legend, opts, val):
    o = "".join(f'<label><input type="radio" name="{name}" value="{k}"{" checked" if k == val else ""}><span>{E(v)}</span></label>' for k, v in opts)
    return f'<fieldset class="fieldset"><legend>{legend}</legend><div class="seg">{o}</div></fieldset>'

def chk(name, label, on=False):
    return f'<label class="chk"><input type="checkbox" name="{name}"{" checked" if on else ""}><span>{label}</span></label>'

def row(*f):
    return '<div class="field-row">' + "".join(f) + "</div>"

ACTIONS = '<div class="sim-actions"><button type="button" data-share>Copier le lien de cette simulation</button><button type="button" data-print>Imprimer</button><button type="button" data-reset>Réinitialiser</button></div>'

def sim(fields, results):
    return f'<div class="card sim"><div class="sim-body"><form id="f" novalidate>{fields}{ACTIONS}</form><div class="sim-out" aria-live="polite">{results}</div></div></div>'

def explain(hyp, formule):
    return f'<div class="explain"><div class="card"><h2>Hypothèses</h2>{hyp}</div><div class="card"><h2>La formule</h2>{formule}</div></div>'

ALL = {}  # slug -> (titre court, description, catégorie)

def related(guides, tools):
    g = f'<div class="card related" data-guides="{guides}" hidden><h2>Guides liés</h2><div class="more"></div></div>' if guides else ""
    t = "".join(f'<a href="{s}.html">{E(ALL[s][0])}</a>' for s in tools if s in ALL)
    return g + f'<div class="card related"><h2>Autres outils</h2><div class="more">{t}<a href="index.html">Tous les outils →</a></div></div>'

def page(slug, title, desc, eyebrow, h1, lead, body, scripts=None, free=True):
    scripts = scripts or [slug]
    js = "".join(f'\n<script src="../assets/outils/{s}.js" defer></script>' for s in scripts)
    tag = '<span class="tag free">Gratuit</span>' if free else '<span class="tag sub">Outil de l\'investisseur</span>'
    doc = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(title)} · Socle</title>
<meta name="description" content="{E(desc)}">
<link rel="stylesheet" href="../assets/site.css">
<link rel="stylesheet" href="../assets/outils.css">
<script src="../assets/site.js"></script>
<script src="../assets/guides-data.js"></script>
<script src="../assets/outils/outils.js" defer></script>{js}
</head>
<body>
<main id="main" data-outil="{slug}">
<section class="page-hero" style="--c:var(--s3)">
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="../index.html">Accueil</a><span aria-hidden="true">›</span><a href="index.html">Outils</a><span aria-hidden="true">›</span><span>{E(ALL[slug][0])}</span></nav>
    <p class="eyebrow">{eyebrow}</p>
    <h1>{h1}</h1>
    <p class="lead">{lead}</p>
    <p class="mt-s">{tag}</p>
  </div>
</section>
<section class="tight">
  <div class="wrap">
{body}
    <p class="disc">Outil pédagogique : les résultats dépendent des hypothèses saisies et ne constituent pas un conseil en investissement. Paramètres fiscaux en vigueur en novembre 2026, simplifiés. Tout placement en bourse comporte un risque de perte en capital.</p>
  </div>
</section>
</main>
</body>
</html>
'''
    open(OUT + slug + ".html", "w").write(doc)

def reg(slug, short, desc, cat, icon):
    ALL[slug] = (short, desc, cat, icon)

# ---------- catalogue (ordre du sommaire) ----------
reg("budget", "Budget 50/30/20", "Répartir son salaire entre besoins, envies et épargne, et calculer son épargne de précaution.", "Bien démarrer", "wallet")
reg("epargne", "Épargne et intérêts composés", "Ce que deviennent un capital et des versements réguliers, année après année.", "Bien démarrer", "grow")
reg("objectif", "Objectif financier", "Combien mettre de côté chaque mois pour atteindre un montant à une date donnée.", "Bien démarrer", "target")
reg("inflation", "Inflation et pouvoir d'achat", "Ce que vaudra votre argent demain, et le rendement réel de vos placements.", "Bien démarrer", "down")
reg("credit", "Crédit immobilier", "Mensualité, coût total, tableau d'amortissement et capacité d'emprunt.", "Bien démarrer", "home")
reg("enveloppes", "Comparer les enveloppes", "PEA, compte-titres, assurance-vie, PER et Livret A : le net en poche après frais et impôts.", "Impôts et enveloppes", "layers")
reg("impot", "Impôt sur le revenu et TMI", "Votre impôt, votre tranche marginale, et le choix entre flat tax et barème pour les dividendes.", "Impôts et enveloppes", "percent")
reg("per", "Simulateur PER", "Économie d'impôt à l'entrée, plafond de déduction et fiscalité à la sortie.", "Impôts et enveloppes", "shield")
reg("declaration", "Aide à la déclaration", "Ce qu'il faut vérifier au printemps selon les placements que vous possédez.", "Impôts et enveloppes", "doc")
reg("dca", "Investissement programmé", "Investir d'un coup ou étaler ses achats : l'effet selon le scénario de marché.", "Investir en bourse", "steps")
reg("frais", "Impact des frais", "Ce que coûtent vraiment 0,5 % ou 2 % de frais par an sur 20 ou 30 ans.", "Investir en bourse", "coins")
reg("dividendes", "Rendement des dividendes", "Rendement, revenu net selon l'enveloppe et effet du réinvestissement.", "Investir en bourse", "coins")
reg("independance", "Indépendance financière", "Le capital qui couvrirait vos dépenses, et le temps pour l'atteindre.", "Investir en bourse", "flag")
reg("portefeuille-virtuel", "Portefeuille virtuel", "S'entraîner avec de l'argent fictif sur un marché simulé, avec badges.", "S'entraîner", "play")
reg("krachs", "Historique des krachs", "Dix grands krachs, le temps qu'il a fallu pour s'en remettre, et l'effet de continuer à investir.", "S'entraîner", "down")
reg("portefeuille", "Suivi de portefeuille", "Regrouper PEA, assurance-vie et compte-titres et voir la répartition réelle.", "Outils de l'investisseur", "pie")
reg("analyse-entreprise", "Analyse d'entreprise", "Dix ans de chiffres, les ratios qui comptent et une phrase sous chaque graphique.", "Outils de l'investisseur", "chart")
reg("alertes", "Listes et alertes", "Suivre des valeurs, fixer des seuils et garder la trace des cours relevés.", "Outils de l'investisseur", "bell")
reg("grands-fonds", "Positions des grands fonds", "Lire une déclaration trimestrielle : entrées, sorties, renforcements.", "Outils de l'investisseur", "building")
reg("calendrier-dividendes", "Calendrier des dividendes", "Vos revenus de dividendes attendus, mois par mois.", "Outils de l'investisseur", "calendar")
reg("comparateur-etf", "Comparateur d'ETF", "L'effet des frais courants et de l'écart de suivi entre plusieurs fonds.", "Outils de l'investisseur", "scale")
reg("frais-courtage", "Frais de courtage", "Le coût annuel de plusieurs grilles tarifaires selon votre façon d'investir.", "Outils de l'investisseur", "receipt")

FISC_NOTE = "Paramètres 2026 : prélèvements sociaux 18,6 % (17,2 % en assurance-vie), prélèvement forfaitaire unique 31,4 %."

# ================= Budget =================
page("budget", "Budget 50/30/20 et épargne de précaution", "Répartissez votre revenu entre besoins, envies et épargne, et calculez le montant de votre épargne de précaution.",
 "Simulateur · Bien démarrer", "Budget 50/30/20", "50 % pour les besoins, 30 % pour les envies, 20 % pour l'épargne. Un point de départ, à ajuster à votre situation, puis le coussin de sécurité à constituer avant d'investir.",
 sim(num("rev", "Revenu net mensuel", 2200, 0, step=50, hint="Après impôt à la source, primes lissées sur 12 mois.") +
     num("loyer", "Loyer ou crédit immobilier", 750, 0, step=10) +
     num("fixes", "Autres dépenses essentielles", 450, 0, step=10, hint="Courses, énergie, transport, assurances, téléphone.") +
     num("envies", "Dépenses d'envies", 500, 0, step=10, hint="Sorties, vacances, abonnements, shopping.") +
     '<h3 style="margin:22px 0 12px">Épargne de précaution</h3>' +
     num("mois", "Mois de dépenses à couvrir", 4, 1, 12, 1, rng=True, suf=" mois") +
     num("dejaP", "Déjà de côté sur un livret", 1500, 0, step=100) + chk("inclEnvies", "Inclure les envies dans le calcul"),
     '<p class="res-lbl">Objectif d\'épargne (20 %)</p><p class="res-big" id="rS">—</p><div class="res-row" id="rRow"></div><div class="split" id="split" aria-hidden="true"></div><p class="verdict" id="verdict"></p><div class="chart" id="chart"></div>'
     '<div class="out-card mt-m"><p class="res-lbl">Épargne de précaution à viser</p><p class="res-big" id="pCible" style="font-size:1.8rem">—</p><div class="res-row" id="pRow"></div></div>') +
 explain("<ul><li>Les besoins regroupent ce que vous ne pouvez pas supprimer d'un mois sur l'autre.</li><li>Quand le loyer dépasse le tiers du revenu, une répartition 60/20/20 ou 70/10/20 est plus réaliste : l'important est de garder un effort d'épargne régulier.</li><li>L'épargne de précaution se place sans risque et reste disponible : Livret A (" + "1,7 %, plafond 22 950 €" + "), LDDS (plafond 12 000 €), LEP si vous y avez droit (2,5 %).</li></ul>",
         '<p class="formula">Besoins cible = revenu × 50 %<br>Envies cible = revenu × 30 %<br>Épargne possible = revenu − besoins − envies</p><p>Épargne de précaution = dépenses mensuelles × nombre de mois. Trois mois pour un salarié en CDI, six mois ou plus pour un indépendant ou un foyer à un seul revenu.</p>') +
 related("epargne-de-precaution,budget,livret,demarrer", ["epargne", "objectif", "inflation", "credit"]))

# ================= Épargne =================
page("epargne", "Simulateur d'épargne et intérêts composés", "Calculez ce que deviennent un capital de départ et des versements mensuels avec les intérêts composés, en euros courants et en euros d'aujourd'hui.",
 "Simulateur · Bien démarrer", "Épargne et intérêts composés", "Un capital, des versements réguliers et du temps : l'effet boule de neige, année après année, avec la part qui vient de vous et celle qui vient des intérêts.",
 sim(num("depart", "Versement de départ", 1000, 0, step=100) + num("mensuel", "Versement mensuel", 150, 0, step=10) +
     num("taux", "Rendement annuel supposé", 5, -5, 15, 0.1, rng=True, fmt="pct") + num("ans", "Durée", 20, 1, 50, 1, rng=True, fmt="ans") +
     num("index", "Hausse annuelle des versements", 0, 0, 10, 0.5, rng=True, fmt="pct", hint="Par exemple pour suivre vos augmentations de salaire.") +
     num("inflation", "Inflation supposée", 2, 0, 8, 0.1, rng=True, fmt="pct"),
     '<p class="res-lbl">Capital estimé au bout de la période</p><p class="res-big" id="rFin">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><ul class="mt-m" id="insights" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul>') +
 '<details class="card mt-m" style="padding:18px"><summary style="cursor:pointer;font-weight:700">Voir le détail année par année</summary><div id="tab" class="mt-s"></div></details>' +
 explain("<ul><li>Rendement constant chaque année, capitalisé chaque mois (taux mensuel équivalent).</li><li>Versements en fin de mois, avant impôts et frais : comparez les enveloppes et l'impact des frais avec les simulateurs dédiés.</li><li>Les marchés varient chaque année et peuvent baisser : 5 % par an est une moyenne de long terme pour un portefeuille diversifié, pas une promesse.</li></ul>",
         '<p class="formula">Capital = C₀ × (1 + r)ⁿ + V × ((1 + r)ⁿ − 1) / r</p><p>C₀ est le versement de départ, V le versement mensuel, r le taux mensuel équivalent, soit (1 + taux annuel)^(1/12) − 1, et n le nombre de mois. La règle de 72 donne le temps de doublement : 72 divisé par le taux en pourcentage.</p>') +
 related("interets-composes,etf,assurance-vie,pea", ["objectif", "frais", "dca", "inflation"]))

# ================= DCA =================
page("dca", "Investissement programmé (DCA)", "Comparez investir une somme d'un coup ou l'étaler sur plusieurs mois, selon différents scénarios de marché.",
 "Simulateur · Investir en bourse", "Investissement programmé", "Faut-il tout investir d'un coup ou étaler ses achats ? Testez les deux sur plusieurs scénarios de marché et voyez l'effet sur votre prix moyen d'achat.",
 sim(num("somme", "Somme à investir", 12000, 0, step=500) + num("etale", "Étaler sur", 12, 1, 36, 1, rng=True, suf=" mois") +
     num("ans", "Durée observée", 5, 1, 15, 1, rng=True, fmt="ans") + num("frais", "Frais par achat", 0.1, 0, 2, 0.05, hint="En % du montant de chaque ordre.") +
     seg("sc", "Scénario de marché", [("hausse", "Hausse régulière"), ("reprise", "Baisse puis reprise"), ("krach", "Krach soudain"), ("longue", "Baisse longue"), ("plat", "Marché en dents de scie"), ("alea", "Tirage aléatoire")], "reprise") +
     '<button type="button" class="btn ghost small" id="tirage" hidden>Nouveau tirage</button>',
     '<p class="res-lbl">Dans ce scénario, mieux valait investir</p><p class="res-big t" id="rBest">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><ul class="mt-m" id="insights" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul>') +
 explain("<ul><li>Les scénarios sont des trajectoires stylisées, pas des prévisions. Le tirage aléatoire suppose 7 % de rendement moyen et 15 % de volatilité par an.</li><li>Pendant l'étalement, la somme pas encore investie reste en liquidités, sans rémunération.</li><li>Les études sur longue période montrent que l'investissement d'un coup gagne environ deux fois sur trois, parce que les marchés montent plus souvent qu'ils ne baissent. L'étalement limite surtout le regret d'avoir tout acheté juste avant une baisse.</li></ul>",
         '<p class="formula">Parts achetées chaque mois = (S / k) × (1 − frais) / cours<br>Prix moyen = montant investi / parts</p><p>En investissant un montant fixe, vous achetez plus de parts quand le cours est bas : votre prix moyen d\'achat est la moyenne harmonique des cours, toujours inférieure ou égale à leur moyenne simple.</p>') +
 related("dca,etf,cycles,actions", ["krachs", "epargne", "portefeuille-virtuel", "frais"]))

# ================= Crédit =================
page("credit", "Simulateur de crédit immobilier", "Calculez la mensualité, le coût total, le TAEG approché et le tableau d'amortissement d'un prêt à taux fixe, ou votre capacité d'emprunt.",
 "Simulateur · Bien démarrer", "Crédit immobilier", "Mensualité, coût des intérêts et de l'assurance, tableau d'amortissement complet, ou à l'inverse le montant que vous pouvez emprunter avec vos revenus.",
 sim(seg("mode", "Je veux calculer", [("mens", "Ma mensualité"), ("capa", "Ma capacité d'emprunt")], "mens") +
     '<div data-m="mens">' + num("montant", "Montant emprunté", 200000, 0, step=1000) + '</div>' +
     '<div data-m="capa" hidden>' + num("revenus", "Revenus nets mensuels du foyer", 4000, 0, step=100) + num("charges", "Autres crédits en cours (mensualités)", 0, 0, step=10) + '</div>' +
     num("taux", "Taux nominal annuel", 3.3, 0, 10, 0.05, rng=True, fmt="pct") + num("ans", "Durée", 25, 5, 30, 1, rng=True, fmt="ans") +
     num("assu", "Taux d'assurance emprunteur", 0.30, 0, 1, 0.01, hint="En % du capital initial par an. 0,10 à 0,40 % selon l'âge et la santé.") +
     row(num("fraisDossier", "Frais de dossier", 1000, 0, step=50), num("garantie", "Garantie (caution)", 2500, 0, step=100)),
     '<p class="res-lbl" id="rLbl">Mensualité</p><p class="res-big" id="rBig">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><ul class="mt-m" id="insights" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul>') +
 '<div class="card mt-m" style="padding:18px"><div class="toolbar"><h2 style="font-size:1.1rem">Tableau d\'amortissement</h2><span class="sp"></span><button type="button" class="btn ghost small" id="gran">Voir mois par mois</button></div><div id="tab"></div></div>' +
 explain("<ul><li>Prêt amortissable à taux fixe et mensualités constantes, convention bancaire française (taux mensuel = taux annuel / 12).</li><li>Assurance calculée sur le capital initial, comme dans la plupart des contrats groupe.</li><li>Le taux d'endettement maximal de 35 %, assurance comprise, est la règle du Haut Conseil de stabilité financière appliquée par les banques, avec des dérogations limitées. La durée est plafonnée à 25 ans (27 dans certains cas de construction).</li><li>Le TAEG affiché est une approximation : il intègre intérêts, assurance, frais de dossier et de garantie, mais pas les frais de courtier ni d'évaluation.</li></ul>",
         '<p class="formula">Mensualité = C × t / (1 − (1 + t)^−n)</p><p>C est le capital emprunté, t le taux mensuel (taux annuel / 12) et n le nombre de mois. Chaque mois, les intérêts se calculent sur le capital restant dû : au début, la mensualité paie surtout des intérêts, à la fin surtout du capital.</p>') +
 related("emprunter,immobilier,budget", ["budget", "objectif", "inflation", "epargne"]))

# ================= Objectif =================
page("objectif", "Objectif financier", "Calculez l'effort d'épargne mensuel nécessaire pour atteindre un montant à une date donnée, selon le rendement et l'inflation.",
 "Simulateur · Bien démarrer", "Atteindre un montant", "Un apport, des études, un projet : combien mettre de côté chaque mois, et quel support choisir selon l'horizon.",
 sim(num("cible", "Montant visé", 30000, 0, step=500) + num("ans", "Dans combien d'années", 5, 0.5, 40, 0.5, rng=True, fmt="ans") +
     num("deja", "Déjà de côté", 2000, 0, step=100) + num("taux", "Rendement annuel supposé", 3, 0, 12, 0.1, rng=True, fmt="pct") +
     chk("reel", "Le montant est en euros d'aujourd'hui (tenir compte de l'inflation)") + num("inflation", "Inflation supposée", 2, 0, 8, 0.1),
     '<p class="res-lbl">Effort d\'épargne mensuel</p><p class="res-big" id="rP">—</p><div class="res-row" id="rRow"></div><p class="verdict" id="verdict"></p><div class="chart" id="chart"></div><div id="tab" class="mt-m"></div>') +
 explain("<ul><li>Versements constants en fin de mois, rendement constant capitalisé chaque mois.</li><li>Sous 3 ans, préférez des placements sans risque de perte : un projet à court terme ne laisse pas le temps de se remettre d'une baisse.</li><li>Les rendements du tableau sont des ordres de grandeur, pas des promesses : seul le Livret A a un taux connu à l'avance (révisé deux fois par an).</li></ul>",
         '<p class="formula">V = (Cible − C₀ × (1 + r)ⁿ) × r / ((1 + r)ⁿ − 1)</p><p>C₀ est ce que vous avez déjà, r le taux mensuel équivalent et n le nombre de mois. Avec l\'option inflation, la cible devient Cible × (1 + inflation)^années.</p>') +
 related("epargne-de-precaution,assurance-vie,livret", ["epargne", "budget", "inflation", "enveloppes"]))

# ================= Enveloppes =================
TABLE_ENV = '''<div class="card mt-m" style="padding:18px"><h2 style="font-size:1.1rem;margin-bottom:6px">Où ranger son argent ? Le tableau des enveloppes</h2><p class="muted small">L'enveloppe décide de la fiscalité et de la disponibilité. Ce qu'on met dedans décide du risque.</p><div class="tbl mt-s"><table><thead><tr><th>Enveloppe</th><th>Ce qu'on y place</th><th>Plafond de versements</th><th>Disponibilité</th><th>Fiscalité 2026, en bref</th></tr></thead><tbody>
<tr><td>Livret A, LDDS</td><td>Épargne sans risque, 1,7 %</td><td>22 950 € et 12 000 €</td><td>Immédiate</td><td>Intérêts exonérés d'impôt et de prélèvements sociaux</td></tr>
<tr><td>LEP</td><td>Épargne sans risque, 2,5 %</td><td>10 000 €</td><td>Immédiate</td><td>Exonéré ; réservé aux revenus modestes</td></tr>
<tr><td>PEA</td><td>Actions et ETF européens</td><td>150 000 €</td><td>Retrait possible après 5 ans sans clôture</td><td>Après 5 ans : gains exonérés d'impôt, prélèvements sociaux de 18,6 %</td></tr>
<tr><td>Assurance-vie</td><td>Fonds euros, unités de compte</td><td>Aucun</td><td>À tout moment</td><td>Après 8 ans : abattement annuel de 4 600 € (9 200 € en couple), puis 7,5 % ; prélèvements sociaux 17,2 %</td></tr>
<tr><td>Compte-titres</td><td>Tout titre coté</td><td>Aucun</td><td>À tout moment</td><td>Dividendes et plus-values au prélèvement forfaitaire de 31,4 % (ou barème sur option)</td></tr>
<tr><td>PER</td><td>Fonds, ETF, fonds euros</td><td>Aucun ; déduction plafonnée</td><td>À la retraite, sauf achat de la résidence principale et accidents de la vie</td><td>Versements déductibles du revenu imposable ; imposés à la sortie</td></tr>
</tbody></table></div><p class="hint mt-s">Règles en vigueur en novembre 2026, simplifiées. Vérifiez les détails sur service-public.fr avant toute décision.</p></div>'''
page("enveloppes", "Comparer PEA, compte-titres, assurance-vie et PER", "Comparez le montant net en poche après frais et fiscalité 2026 entre PEA, compte-titres, assurance-vie, PER et Livret A.",
 "Simulateur · Impôts et enveloppes", "Comparer les enveloppes", "Le même placement ne rapporte pas la même chose selon l'enveloppe. Comparez le net en poche, après frais et impôts de sortie, avec les règles fiscales de 2026.",
 sim(num("init", "Versement de départ", 5000, 0, step=500) + num("mens", "Versement mensuel", 200, 0, step=10) +
     num("ans", "Durée avant retrait", 15, 1, 40, 1, rng=True, fmt="ans") + num("rdt", "Rendement brut annuel", 6, 0, 12, 0.1, rng=True, fmt="pct", hint="Le même pour toutes les enveloppes (sauf le livret).") +
     num("dist", "Dont dividendes versés chaque année", 2, 0, 6, 0.1, hint="En % de la valeur. Imposés chaque année sur le compte-titres.") +
     seg("sit", "Situation", [("seul", "Seul"), ("couple", "En couple")], "seul") +
     row(sel("tmi", "TMI aujourd'hui", [("0", "0 %"), ("11", "11 %"), ("30", "30 %"), ("41", "41 %"), ("45", "45 %")], "30"), sel("tmiR", "TMI à la retraite", [("0", "0 %"), ("11", "11 %"), ("30", "30 %"), ("41", "41 %"), ("45", "45 %")], "11")) +
     '<details><summary style="cursor:pointer;font-weight:700;margin-bottom:12px">Frais annuels par enveloppe</summary>' +
     row(num("fPea", "PEA", 0.2, 0, 3, 0.05), num("fCto", "Compte-titres", 0.2, 0, 3, 0.05)) + row(num("fAv", "Assurance-vie", 0.8, 0, 3, 0.05), num("fPer", "PER", 0.9, 0, 3, 0.05)) +
     '<p class="hint">Frais de gestion du contrat et frais courants des fonds, en % par an.</p></details>',
     '<p class="res-lbl">Le plus avantageux ici</p><p class="res-big t" id="rBest">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div>') +
 '<div class="card mt-m" style="padding:18px"><h2 style="font-size:1.1rem">Le détail par enveloppe</h2><div id="tab" class="mt-s"></div></div>' + TABLE_ENV +
 explain("<ul><li>" + FISC_NOTE + "</li><li>PEA : gains acquis avant 2026 en réalité taxés au taux de leur période (17,2 %) ; ici tout est compté à 18,6 %, ce qui est prudent.</li><li>Assurance-vie : rachat total en une fois ; au-delà de 150 000 € de versements, la part correspondante des gains est taxée à 12,8 % au lieu de 7,5 %. En pratique, des rachats partiels étalés sur plusieurs années profitent de l'abattement chaque année.</li><li>PER : sortie en capital en une fois ; l'économie d'impôt n'est pas réinvestie. Le plafond de déduction n'est pas vérifié ici (voir le simulateur PER).</li><li>Compte-titres : prélèvement forfaitaire, sans option pour le barème.</li></ul>",
         '<p class="formula">Net = valeur finale − impôts de sortie<br>CTO : dividendes × 31,4 % chaque année, puis plus-value × 31,4 %<br>PEA (≥ 5 ans) : gains × 18,6 %<br>AV (≥ 8 ans) : gains × 17,2 % + (gains − abattement) × 7,5 %<br>PER : versements × TMI retraite + gains × 31,4 %</p><p>Le rendement net annuel est le taux qui égalise vos versements et le montant net récupéré (taux de rendement interne).</p>') +
 related("pea,assurance-vie,compte-titres,preparer-sa-retraite,declarer", ["per", "impot", "frais", "declaration"]))

# ================= Impôt =================
page("impot", "Impôt sur le revenu et TMI 2026", "Calculez votre impôt sur le revenu 2026, votre tranche marginale d'imposition, et comparez prélèvement forfaitaire et barème pour vos dividendes.",
 "Simulateur · Impôts et enveloppes", "Impôt sur le revenu et TMI", "Votre impôt avec le barème 2026, votre tranche marginale (celle qui compte pour un PER ou des revenus en plus) et le bon choix pour vos dividendes.",
 sim(num("rev", "Revenu net imposable du foyer", 38000, 0, step=500, hint="Après l'abattement de 10 % sur les salaires : c'est la ligne « revenu net imposable » de votre avis d'impôt.") +
     seg("sit", "Situation", [("seul", "Célibataire, divorcé ou veuf"), ("couple", "Marié ou pacsé")], "seul") +
     num("enfants", "Enfants à charge", 0, 0, 8, 1, rng=True, suf="") + chk("isole", "Parent isolé (case T)") +
     num("div", "Dividendes et intérêts perçus (pour comparer flat tax et barème)", 0, 0, step=100),
     '<p class="res-lbl">Impôt sur le revenu estimé</p><p class="res-big" id="rImp">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><ul class="mt-m" id="insights" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul>'
     '<div class="out-card mt-m"><p class="res-lbl">Dividendes : prélèvement forfaitaire ou barème ?</p><div id="divOut"></div></div>') +
 '<div class="card mt-m" style="padding:18px"><h2 style="font-size:1.1rem">Barème 2026 (revenus 2025), par part</h2><div class="tbl mt-s"><table><thead><tr><th>Quotient familial</th><th>Taux</th></tr></thead><tbody><tr><td>Jusqu\'à 11 600 €</td><td>0 %</td></tr><tr><td>De 11 601 € à 29 579 €</td><td>11 %</td></tr><tr><td>De 29 580 € à 84 577 €</td><td>30 %</td></tr><tr><td>De 84 578 € à 181 917 €</td><td>41 %</td></tr><tr><td>Au-delà de 181 917 €</td><td>45 %</td></tr></tbody></table></div></div>' +
 explain("<ul><li>Barème 2026 sur les revenus 2025, revalorisé de 0,9 %. Plafonnement du quotient familial à 1 807 € par demi-part, décote de 1 982 € (3 277 € pour un couple) moins 45,25 % de l'impôt.</li><li>Parts : 1 par adulte, 0,5 pour chacun des deux premiers enfants, 1 à partir du troisième, 0,5 de plus pour un parent isolé.</li><li>Non pris en compte : réductions et crédits d'impôt (dons, emploi à domicile…), contribution sur les hauts revenus, cas particuliers (invalidité, garde alternée).</li><li>Dividendes au barème : abattement de 40 % et CSG déductible de 6,8 % ; l'option est globale pour tous les revenus de placement de l'année.</li></ul>",
         '<p class="formula">Impôt = parts × Σ (part du quotient dans chaque tranche × taux)<br>Quotient = revenu imposable / parts</p><p>La tranche marginale (TMI) est le taux appliqué au dernier euro gagné. Le taux moyen, impôt divisé par revenu, est toujours plus bas : passer dans une tranche supérieure n\'augmente l\'impôt que sur la part de revenu qui la dépasse.</p>') +
 related("declarer,preparer-sa-retraite,compte-titres,dividendes", ["per", "enveloppes", "declaration", "dividendes"]))

# ================= PER =================
page("per", "Simulateur PER", "Estimez l'économie d'impôt d'un versement sur un plan d'épargne retraite, votre plafond de déduction et la fiscalité à la sortie en capital.",
 "Simulateur · Impôts et enveloppes", "Simulateur PER", "Combien un versement sur un PER vous fait économiser d'impôt cette année, combien il vous coûte vraiment, et ce qu'il restera après impôts à la retraite.",
 sim(num("rev", "Revenu net imposable du foyer", 52000, 0, step=500) + row(num("parts", "Parts fiscales", 1, 1, 10, 0.5), seg("sit", "Situation", [("seul", "Seul"), ("couple", "Couple")], "seul")) +
     num("versement", "Versement sur le PER cette année", 4000, 0, step=100) +
     num("pro", "Revenus d'activité 2025 du titulaire", 52000, 0, step=500, hint="Sert au calcul du plafond : 10 % de ces revenus, au moins 4 710 € et au plus 37 680 €.") +
     num("report", "Plafond non utilisé des 3 années précédentes", 0, 0, step=100, hint="Indiqué sur votre avis d'impôt, rubrique « plafond épargne retraite ».") +
     '<h3 style="margin:22px 0 12px">Jusqu\'à la retraite</h3>' + num("ans", "Années avant la retraite", 20, 1, 45, 1, rng=True, fmt="ans") +
     num("rdt", "Rendement annuel supposé", 5, 0, 10, 0.1, rng=True, fmt="pct") + sel("tmiR", "TMI à la retraite", [("0", "0 %"), ("11", "11 %"), ("30", "30 %"), ("41", "41 %")], "11"),
     '<p class="res-lbl">Impôt économisé cette année</p><p class="res-big up" id="rEco">—</p><div class="res-row" id="rRow"></div><p class="verdict" id="verdict"></p><div class="chart" id="chart"></div><div class="out-card mt-m"><p class="res-lbl">À la sortie, en capital</p><div id="sortie"></div></div>') +
 explain("<ul><li>Économie calculée en comparant votre impôt avec et sans la déduction, barème 2026.</li><li>Plafond salarié : 10 % des revenus d'activité de l'année précédente, minimum 10 % du plafond de la Sécurité sociale 2025 (4 710 €), maximum 10 % de 8 fois ce plafond (37 680 €), plus les plafonds non utilisés des trois années précédentes. Les indépendants ont un plafond spécifique, plus élevé.</li><li>Sortie en capital en une fois, revenus constants, versement identique chaque année. La part versements est imposée au barème (approchée par la TMI à la retraite), la part gains au prélèvement forfaitaire de 31,4 %.</li></ul>",
         '<p class="formula">Économie = impôt(revenu) − impôt(revenu − versement déductible)<br>Effort réel = versement − économie</p><p>Le PER est intéressant quand votre TMI aujourd\'hui est plus élevée que celle attendue à la retraite : vous déduisez à 30 ou 41 % et vous êtes imposé plus tard à 11 ou 0 %.</p>') +
 related("preparer-sa-retraite,per,declarer", ["impot", "enveloppes", "independance", "epargne"]))

# ================= Déclaration =================
page("declaration", "Aide à la déclaration de ses placements", "Cochez ce que vous possédez pour savoir quels formulaires et quelles cases vérifier lors de la déclaration de revenus.",
 "Aide · Impôts et enveloppes", "Préparer sa déclaration", "Cochez ce que vous possédez : la liste des formulaires, des cases et des pièges à vérifier au printemps s'affiche.",
 sim(chk("cto", "Un compte-titres chez un courtier français", True) + chk("etranger", "Un compte chez un courtier ou une banque à l'étranger") + chk("pea", "Un PEA") + chk("av", "Une assurance-vie") +
     chk("per", "Un PER") + chk("crypto", "Des cryptomonnaies") + chk("scpi", "Des parts de SCPI en direct") + chk("livret", "Des livrets (Livret A, LDDS, LEP)"),
     '<p class="res-lbl">Votre liste</p><p class="res-big t" id="rN">—</p><p class="res-sub" id="rForms"></p><div id="out"></div>') +
 explain("<ul><li>Aide pédagogique, pas un conseil fiscal. En cas de doute, la documentation officielle sur impots.gouv.fr fait foi.</li><li>Les numéros de cases sont ceux de la déclaration 2042 et de ses annexes ; ils changent rarement, mais vérifiez-les sur le formulaire de l'année.</li><li>Les comptes à l'étranger incluent les néobanques et les courtiers en ligne dont le siège est hors de France, même si l'application est en français.</li></ul>",
         "<p>Pas de formule ici, mais une règle : l'IFU (imprimé fiscal unique) envoyé par chaque établissement français est votre source principale. Comparez-le aux montants préremplis, et ajoutez vous-même tout ce qui vient de l'étranger.</p>") +
 related("declarer,compte-titres,pea,assurance-vie,crypto", ["impot", "enveloppes", "per", "portefeuille"]))

# ================= Frais =================
page("frais", "Impact des frais sur votre épargne", "Mesurez ce que coûtent des frais annuels de 0,2 % à 3 % sur un placement à long terme.",
 "Simulateur · Investir en bourse", "Impact des frais", "Un écart de frais qui paraît minuscule chaque année devient énorme sur 20 ou 30 ans. Comparez deux placements identiques qui ne diffèrent que par leurs frais.",
 sim(num("init", "Versement de départ", 10000, 0, step=500) + num("mens", "Versement mensuel", 200, 0, step=10) +
     num("ans", "Durée", 25, 1, 40, 1, rng=True, fmt="ans") + num("rdt", "Rendement brut annuel", 6, 0, 12, 0.1, rng=True, fmt="pct") +
     row(num("fA", "Frais annuels A", 1.8, 0, 4, 0.05), num("fB", "Frais annuels B", 0.25, 0, 4, 0.05)) +
     num("entree", "Frais d'entrée sur A", 0, 0, 5, 0.5, hint="En % de chaque versement."),
     '<p class="res-lbl">Ce que les frais de A vous coûtent en plus</p><p class="res-big down" id="rDiff">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><div id="tab" class="mt-m"></div>') +
 explain("<ul><li>Les frais annuels sont retirés du rendement chaque année (frais de gestion du contrat, frais courants des fonds).</li><li>Exemples d'ordres de grandeur : un ETF indiciel coûte souvent 0,1 à 0,4 % par an ; un fonds actif 1,5 à 2,2 % ; une assurance-vie en ligne prend 0,5 à 0,85 % sur les unités de compte, en plus des frais des fonds.</li><li>Rendement brut constant : en réalité, un fonds plus cher ne rapporte pas plus en moyenne.</li></ul>",
         '<p class="formula">Capital = C₀ × (1 + r − f)ⁿ + versements capitalisés au même taux</p><p>Le coût total des frais est la différence entre le capital sans frais et le capital avec frais. Il grossit avec le temps parce que les frais prélevés ne produisent plus d\'intérêts.</p>') +
 related("etf,assurance-vie,compte-titres", ["comparateur-etf", "frais-courtage", "enveloppes", "epargne"]))

# ================= Dividendes =================
page("dividendes", "Rendement des dividendes", "Calculez le rendement d'un dividende, votre revenu net selon l'enveloppe et l'effet du réinvestissement sur 10 à 30 ans.",
 "Simulateur · Investir en bourse", "Rendement des dividendes", "Ce que rapporte vraiment un dividende une fois les prélèvements payés, et ce que change le fait de le réinvestir année après année.",
 sim(row(num("cours", "Cours de l'action", 40, 0.01, step=0.1), num("dpa", "Dividende annuel par action", 1.6, 0, step=0.01)) +
     num("capital", "Montant investi", 10000, 0, step=500) + seg("env", "Enveloppe", [("pea", "PEA"), ("cto", "Compte-titres"), ("brut", "Avant impôt")], "pea") +
     num("crois", "Hausse annuelle du dividende", 4, -5, 12, 0.5, rng=True, fmt="pct") + num("hausse", "Hausse annuelle du cours", 3, -5, 12, 0.5, rng=True, fmt="pct") +
     num("ans", "Durée", 20, 1, 40, 1, rng=True, fmt="ans") + chk("reinv", "Réinvestir les dividendes", True),
     '<p class="res-lbl">Rendement du dividende</p><p class="res-big" id="rRd">—</p><div class="res-row" id="rRow"></div><p class="verdict" id="verdict"></p><div class="chart" id="chart"></div><div class="chart" id="chart2"></div>') +
 explain("<ul><li>Sur un compte-titres, le prélèvement forfaitaire de 31,4 % (12,8 % d'impôt et 18,6 % de prélèvements sociaux en 2026) est retenu à chaque versement. Dans un PEA, rien n'est prélevé tant que vous ne retirez pas.</li><li>Les actions étrangères subissent souvent une retenue à la source dans leur pays, pas toujours récupérable : non prise en compte ici.</li><li>Un dividende peut baisser ou être supprimé : la croissance supposée n'est pas garantie.</li></ul>",
         '<p class="formula">Rendement = dividende annuel par action / cours<br>Rendement sur prix d\'achat (année n) = dividende de l\'année n / prix payé</p><p>Le jour du détachement, le cours baisse d\'environ le montant du dividende : un dividende n\'est pas de l\'argent gratuit, c\'est une partie de la valeur de l\'entreprise qui vous est versée.</p>') +
 related("dividendes,actions,compte-titres,pea", ["calendrier-dividendes", "analyse-entreprise", "independance", "enveloppes"]))

# ================= Inflation =================
page("inflation", "Inflation et pouvoir d'achat", "Calculez la perte de pouvoir d'achat due à l'inflation et le rendement réel d'un placement.",
 "Simulateur · Bien démarrer", "Inflation et pouvoir d'achat", "Ce que vaudra votre argent dans 10 ou 20 ans s'il dort, et ce qu'il faut gagner pour au moins garder son pouvoir d'achat.",
 sim(num("somme", "Somme", 10000, 0, step=500) + num("inf", "Inflation annuelle", 2, 0, 10, 0.1, rng=True, fmt="pct", hint="La Banque centrale européenne vise 2 % à moyen terme.") +
     num("rdt", "Rendement d'un placement", 1.7, 0, 12, 0.1, rng=True, fmt="pct", hint="1,7 % : le Livret A en novembre 2026.") + num("ans", "Durée", 20, 1, 50, 1, rng=True, fmt="ans"),
     '<p class="res-lbl">Pouvoir d\'achat de la somme qui dort</p><p class="res-big down" id="rPa">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div>') +
 explain("<ul><li>Inflation et rendement constants chaque année.</li><li>Repères : l'inflation française a été de 5,2 % en 2022 et 4,9 % en 2023, après une décennie souvent sous 2 %.</li><li>Le rendement réel est ce qui compte vraiment : un placement à 1,7 % avec 2 % d'inflation fait perdre un peu de pouvoir d'achat.</li></ul>",
         '<p class="formula">Pouvoir d\'achat = somme / (1 + i)ⁿ<br>Rendement réel = (1 + r) / (1 + i) − 1</p><p>i est l\'inflation, r le rendement nominal, n le nombre d\'années. On approche souvent le rendement réel par r − i, ce qui est juste quand les taux sont faibles.</p>') +
 related("inflation,obligations,epargne-de-precaution", ["epargne", "objectif", "independance", "enveloppes"]))

# ================= Indépendance =================
page("independance", "Indépendance financière", "Calculez le capital qui couvrirait vos dépenses (règle des 4 %) et le temps nécessaire pour l'atteindre selon votre taux d'épargne.",
 "Simulateur · Investir en bourse", "Indépendance financière", "Le capital qui pourrait couvrir vos dépenses, combien de temps il faut pour le réunir, et pourquoi le taux d'épargne compte plus que le rendement.",
 sim(num("rev", "Revenu net mensuel du foyer", 3500, 0, step=100) + num("dep", "Dépenses mensuelles", 2400, 0, step=50) +
     num("autres", "Revenus qui continueront (retraite, loyers…)", 0, 0, step=50, hint="Par mois, en euros d'aujourd'hui.") +
     num("capital", "Patrimoine financier actuel", 20000, 0, step=1000) + num("age", "Votre âge", 30, 16, 80, 1) +
     num("rdt", "Rendement réel annuel (après inflation)", 4, 0, 8, 0.1, rng=True, fmt="pct") + num("retrait", "Taux de retrait annuel", 4, 2.5, 6, 0.1, rng=True, fmt="pct"),
     '<p class="res-lbl">Capital cible</p><p class="res-big" id="rCible">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><div id="tab" class="mt-m"></div>') +
 explain("<ul><li>Tout est exprimé en euros d'aujourd'hui : le rendement saisi est un rendement après inflation.</li><li>La règle des 4 % vient d'études américaines sur 30 ans de retraite avec un portefeuille actions et obligations. Pour une période plus longue ou des marchés moins favorables, 3 à 3,5 % est plus prudent.</li><li>Impôts sur les retraits et frais non pris en compte : le capital cible réel est plus élevé.</li></ul>",
         '<p class="formula">Capital cible = dépenses annuelles non couvertes / taux de retrait</p><p>À 4 %, le capital cible vaut 25 fois les dépenses annuelles. Épargner davantage joue deux fois : le capital grossit plus vite, et le besoin à couvrir diminue.</p>') +
 related("preparer-sa-retraite,etf,dividendes", ["epargne", "per", "dividendes", "inflation"]))

# ================= Portefeuille virtuel =================
page("portefeuille-virtuel", "Portefeuille virtuel", "Investissez de l'argent fictif sur un marché simulé : actions, ETF, obligations et or fictifs, dividendes, actualités expliquées et badges.",
 "S'entraîner sans risque", "Portefeuille virtuel", "Investissez de l'argent fictif sur un marché simulé, faites avancer le temps et voyez comment réagit votre portefeuille aux actualités, aux dividendes et aux frais. Tout est sauvegardé dans votre navigateur.",
 '''<form class="card" id="start" style="padding:22px"><h2 style="font-size:1.15rem">Démarrer ou recommencer</h2><div class="grid3 mt-s">
<div class="field"><label for="capInit">Capital fictif de départ</label><select id="capInit"><option value="1000">1 000 €</option><option value="10000" selected>10 000 €</option><option value="50000">50 000 €</option><option value="100000">100 000 €</option></select></div>
<div class="field"><label for="feesInit">Frais de courtage par ordre</label><select id="feesInit"><option value="0">Aucun</option><option value="0.1" selected>0,1 %</option><option value="0.5">0,5 %</option></select></div>
<fieldset class="fieldset"><legend>Répartition de départ</legend><div class="seg"><label><input type="radio" name="profil" value="" checked><span>Je choisis</span></label><label><input type="radio" name="profil" value="prudent"><span>Prudent</span></label><label><input type="radio" name="profil" value="equilibre"><span>Équilibré</span></label><label><input type="radio" name="profil" value="dynamique"><span>Dynamique</span></label></div></fieldset>
</div><button class="btn" type="submit">Lancer la simulation</button> <span class="hint">Les entreprises, cours et actualités sont fictifs.</span></form>
<div class="card mt-m" style="padding:22px">
 <div class="vp-top"><div><p class="res-lbl">Valeur du portefeuille · <span id="simDate"></span></p><p class="res-big" id="total">—</p><p id="perf" class="num"></p></div>
 <div><p class="res-lbl">Faire avancer le temps</p><div class="vp-speed"><button type="button" data-speed="0" aria-pressed="true">Pause</button><button type="button" data-speed="1">1 jour / 1,5 s</button><button type="button" data-speed="5">1 semaine / 1,5 s</button><button type="button" data-jump="21">+1 mois</button><button type="button" data-jump="252">+1 an</button></div></div></div>
 <div class="res-row" id="kRow"></div>
</div>
<div class="tabs mt-m" role="tablist" id="vpTabs" aria-label="Portefeuille virtuel">
<button role="tab" aria-selected="true" aria-controls="p-pf" data-tab="pf">Portefeuille</button><button role="tab" aria-selected="false" aria-controls="p-mk" data-tab="mk">Marché</button><button role="tab" aria-selected="false" aria-controls="p-nw" data-tab="nw">Actualités <span class="tag" id="newsCount" hidden></span></button><button role="tab" aria-selected="false" aria-controls="p-hx" data-tab="hx">Historique</button><button role="tab" aria-selected="false" aria-controls="p-bd" data-tab="bd">Badges <span class="tag" id="nBadges"></span></button></div>
<div class="card mt-s" style="padding:22px">
 <div id="p-pf" role="tabpanel"><div class="toolbar"><span class="res-lbl">Période</span><div class="vp-speed"><button type="button" data-range="21" aria-pressed="false">1 mois</button><button type="button" data-range="126" aria-pressed="false">6 mois</button><button type="button" data-range="252" aria-pressed="false">1 an</button><button type="button" data-range="9999" aria-pressed="true">Tout</button></div></div><div class="chart" id="pfChart"></div><div class="grid2 mt-m"><div><h3>Répartition</h3><div class="mt-s" id="donut"></div></div><div><h3>Vos lignes</h3><div class="mt-s" id="positions"></div></div></div></div>
 <div id="p-mk" role="tabpanel" hidden><div class="toolbar"><label for="mkFilter" class="res-lbl">Afficher</label><select id="mkFilter" style="padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--bg)"><option value="all">Tout</option><option value="action">Actions</option><option value="etf">ETF</option><option value="bond">Obligations</option><option value="gold">Or</option></select></div><div class="mk-list" id="market"></div></div>
 <div id="p-nw" role="tabpanel" hidden><div id="news"></div></div>
 <div id="p-hx" role="tabpanel" hidden><div id="history"></div></div>
 <div id="p-bd" role="tabpanel" hidden><p class="muted">Les badges Premier pas, Diversification, Rentier, Sang-froid et Investisseur patient comptent aussi dans <a href="../apprendre/progression.html">votre progression</a>.</p><div class="badges mt-m" id="badges"></div></div>
</div>
<div id="sheetRoot"></div>''' +
 explain("<ul><li>Les cours évoluent au hasard autour d'une tendance propre à chaque actif, avec une volatilité plus forte pour les jeunes entreprises que pour les ETF et les obligations.</li><li>Dividendes versés chaque trimestre (63 jours de bourse), coupons chaque mois (21 jours).</li><li>Une actualité tombe en moyenne toutes les 18 séances et fait bouger un actif ou tout le marché ; chacune est expliquée.</li><li>Aucun impôt n'est simulé : dans la réalité, ils dépendraient de l'enveloppe.</li></ul>",
         "<p>Le cours de chaque jour = cours de la veille × (1 + tendance + hasard × volatilité). Le hasard suit une loi en cloche : la plupart des jours bougent peu, quelques-uns beaucoup. C'est ce qui rend le temps long si précieux : sur une journée, le hasard domine ; sur des années, la tendance finit par l'emporter.</p>") +
 related("actions,etf,obligations,dividendes", ["krachs", "dca", "analyse-entreprise", "portefeuille"]))

# ================= Krachs =================
page("krachs", "Historique des krachs boursiers", "Dix grands krachs depuis 1929 : ampleur de la baisse, durée, temps de retour au sommet et effet de continuer à investir.",
 "Comprendre · S'entraîner", "Historique des krachs", "De 1929 à 2022, chaque krach a semblé être la fin du monde. Voyez combien il a fallu de temps pour s'en remettre, et ce qu'aurait donné le fait de continuer à investir chaque mois.",
 '<div class="card sim"><div class="sim-body"><div><p class="res-lbl">Choisissez un épisode</p><div class="crash-list mt-s" id="list"></div><form id="f" class="mt-m" novalidate>' + num("somme", "Somme investie au sommet", 10000, 0, step=500) + num("mens", "Et chaque mois ensuite", 200, 0, step=50) + ACTIONS + '</form></div>'
 '<div class="sim-out" aria-live="polite"><p class="res-lbl">Épisode</p><p class="res-big t" id="rNom">—</p><div class="res-row" id="rRow"></div><p class="muted mt-m" id="story"></p><div class="chart" id="chart"></div><ul class="mt-m" id="insights" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul></div></div></div>' +
 '<div class="card mt-m" style="padding:18px"><h2 style="font-size:1.1rem">Tous les épisodes</h2><div id="tab" class="mt-s"></div></div>' +
 explain("<ul><li>Dates arrondies au mois, à partir des clôtures mensuelles des indices. Indices de prix, hors dividendes : avec les dividendes réinvestis, le retour au sommet a toujours été plus rapide (de plusieurs années pour le CAC 40).</li><li>Les trajectoires du graphique sont simplifiées : baisse régulière jusqu'au creux, remontée régulière jusqu'au retour, puis 7 % par an. Dans la réalité, il y a eu des rebonds et des rechutes.</li><li>Les montants sont nominaux, sans tenir compte de l'inflation.</li></ul>",
         '<p class="formula">Hausse nécessaire pour revenir = 1 / (1 − baisse) − 1</p><p>Une baisse de 50 % demande une hausse de 100 % pour revenir au point de départ ; une baisse de 89 %, comme en 1929, une hausse de plus de 800 %. C\'est pour cela que la diversification et l\'horizon long comptent autant.</p>') +
 related("cycles,actions,etf", ["dca", "portefeuille-virtuel", "epargne", "frais"]))

# ================= Suivi de portefeuille =================
page("portefeuille", "Suivi de portefeuille", "Regroupez PEA, assurance-vie, compte-titres et livrets, et voyez la répartition réelle par compte, type d'actif, zone et secteur, ainsi que vos frais moyens.",
 "Outil de l'investisseur", "Suivi de portefeuille", "Regroupez tous vos comptes et voyez enfin la répartition réelle de votre patrimoine par compte, type d'actif, zone géographique et secteur, avec vos frais moyens.",
 '<p class="demo-note">Vos données restent dans ce navigateur : rien n\'est envoyé. Exportez-les pour les garder ou les changer d\'appareil.</p>' +
 '<div class="card mt-s" style="padding:18px"><div class="toolbar"><button class="btn small" type="button" id="add">Ajouter une ligne</button><button class="btn ghost small" type="button" id="demo">Charger l\'exemple</button><span class="sp"></span><button class="btn ghost small" type="button" id="csv">Exporter en CSV</button><button class="btn ghost small" type="button" id="json">Sauvegarder (JSON)</button><label class="btn ghost small" style="cursor:pointer">Importer<input type="file" id="imp" accept="application/json,.json" hidden></label><button class="btn ghost small" type="button" id="clear">Tout effacer</button></div>'
 '<div class="tbl"><table class="edit-tbl" style="min-width:1050px"><thead><tr><th>Ligne</th><th>Compte</th><th>Type</th><th>Zone</th><th>Secteur</th><th class="r">Quantité</th><th class="r">Prix de revient</th><th class="r">Cours</th><th class="r">Frais / an %</th><th></th></tr></thead><tbody id="rows"></tbody></table></div></div>' +
 '<div class="kpis mt-m" id="kpis"></div>' +
 '<div class="grid3 mt-m"><div class="card" style="padding:18px"><h3>Par compte</h3><div class="mt-s" id="dCompte"></div></div><div class="card" style="padding:18px"><h3>Par type d\'actif</h3><div class="mt-s" id="dType"></div></div><div class="card" style="padding:18px"><h3>Par zone</h3><div class="mt-s" id="dZone"></div></div></div>' +
 '<div class="grid2 mt-m"><div class="card" style="padding:18px"><h3>Par secteur</h3><div class="mt-s" id="dSect"></div></div><div class="card" style="padding:18px"><h3>Points d\'attention</h3><ul class="mt-s" id="alerts" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul></div></div>' +
 '<div class="card mt-m" style="padding:18px"><h3>Détail par ligne</h3><div class="mt-s" id="detail"></div></div>' +
 explain("<ul><li>Saisissez le cours manuellement : l'outil ne se connecte à aucun courtier ni flux de cotation.</li><li>Pour un fonds euros, un livret ou une SCPI, mettez une quantité de 1 et la valeur totale comme cours.</li><li>Un ETF Monde est classé « Monde » ; en réalité, il est investi à environ 70 % aux États-Unis. Pensez-y en lisant la répartition par zone.</li></ul>",
         '<p class="formula">Valeur = quantité × cours<br>Plus-value latente = valeur − quantité × prix de revient<br>Frais moyens = Σ (valeur × frais) / valeur totale</p><p>Le prix de revient unitaire (PRU) est le prix moyen auquel vous avez acheté, frais d\'achat compris.</p>') +
 related("etf,pea,assurance-vie,compte-titres", ["calendrier-dividendes", "frais", "alertes", "analyse-entreprise"]), free=False)

# ================= Analyse d'entreprise =================
page("analyse-entreprise", "Analyse d'entreprise", "Analysez dix ans de chiffres d'une entreprise : croissance, marges, dette, dividende, ratios de valorisation et estimation par les flux de trésorerie.",
 "Outil de l'investisseur", "Analyse d'entreprise", "Chiffre d'affaires, marges, dette et dividendes sur dix ans, expliqués en une phrase sous chaque graphique, puis les ratios qui comptent et une estimation de valeur.",
 '<div class="toolbar" id="presets" role="group" aria-label="Entreprise"><span class="res-lbl">Exemples fictifs</span><div class="vp-speed"><button type="button" data-p="ventor" aria-pressed="true">Ventor Énergie</button><button type="button" data-p="halde" aria-pressed="false">Halde Industrie</button><button type="button" data-p="lumen" aria-pressed="false">Café Lumen</button><button type="button" data-p="mine" aria-pressed="false">Mes chiffres</button></div></div>' +
 '<div class="card" style="padding:22px"><p class="res-lbl">Entreprise analysée</p><p class="res-big t" id="rNom">—</p><p class="res-sub" id="rSect"></p>'
 '<div class="grid3 mt-m"><div class="field"><label for="nomE">Nom</label><input type="text" id="nomE"></div><div class="field"><label for="cours">Cours de l\'action (€)</label><input type="number" id="cours" step="any" inputmode="decimal"></div><div class="field"><label for="actions">Nombre d\'actions (millions)</label><input type="number" id="actions" step="any" inputmode="decimal"></div></div></div>' +
 '<div class="grid2 mt-m"><div class="card" style="padding:18px"><h3>Croissance</h3><div class="chart" id="cCa"></div><p class="muted small mt-s" id="sCa"></p></div><div class="card" style="padding:18px"><h3>Rentabilité</h3><div class="chart" id="cMarg"></div><p class="muted small mt-s" id="sMarg"></p></div>'
 '<div class="card" style="padding:18px"><h3>Endettement</h3><div class="chart" id="cDette"></div><p class="muted small mt-s" id="sDette"></p></div><div class="card" style="padding:18px"><h3>Dividende</h3><div class="chart" id="cDiv"></div><p class="muted small mt-s" id="sDiv"></p></div></div>' +
 '<div class="card mt-m" style="padding:18px"><h2 style="font-size:1.1rem">Les ratios clés</h2><div id="ratios" class="mt-s"></div></div>' +
 '<div class="card mt-m" style="padding:22px"><h2 style="font-size:1.1rem">Estimation de valeur par les flux de trésorerie</h2><p class="muted small">On projette le flux de trésorerie disponible (moyenne des 3 dernières années) sur 10 ans, puis on actualise. Très sensible aux hypothèses : changez-les pour voir.</p>'
 '<div class="grid3 mt-m"><div class="field"><label for="g">Croissance des flux sur 10 ans (%/an)</label><input type="number" id="g" value="4" step="0.5" inputmode="decimal"></div><div class="field"><label for="r">Rendement exigé (%/an)</label><input type="number" id="r" value="8" step="0.5" inputmode="decimal"></div><div class="field"><label for="gt">Croissance à l\'infini (%/an)</label><input type="number" id="gt" value="2" step="0.5" inputmode="decimal"></div></div>'
 '<p class="res-lbl">Valeur estimée par action</p><p class="res-big" id="vBig">—</p><div class="res-row" id="vRow"></div></div>' +
 '<details class="card mt-m" style="padding:18px"><summary style="cursor:pointer;font-weight:700">Voir et modifier les chiffres (en millions d\'euros)</summary><p class="hint mt-s">Les chiffres de « Mes chiffres » sont gardés dans ce navigateur. Vous les trouverez dans le rapport annuel de l\'entreprise (document d\'enregistrement universel), rubriques compte de résultat, bilan et tableau des flux.</p><div id="data" class="mt-s"></div></details>' +
 explain("<ul><li>Les trois sociétés proposées sont fictives, leurs chiffres inventés pour illustrer trois profils : croissance endettée, industriel en difficulté, valeur stable.</li><li>Le levier est mesuré par la dette nette divisée par le résultat opérationnel, faute d'EBITDA dans le tableau : c'est plus sévère que le ratio habituel.</li><li>Les repères sont des ordres de grandeur généraux. Une banque, une foncière ou une société de logiciels se lisent avec d'autres repères.</li></ul>",
         '<p class="formula">Valeur = Σ FCF × (1 + g)ᵗ / (1 + r)ᵗ + valeur terminale − dette nette<br>Valeur terminale = FCF₁₀ × (1 + g∞) / (r − g∞), actualisée</p><p>PER = cours / bénéfice par action. Taux de distribution = dividendes versés / résultat net. ROE = résultat net / capitaux propres.</p>') +
 related("lire-un-bilan,actions,dividendes", ["dividendes", "alertes", "grands-fonds", "portefeuille-virtuel"]), free=False)

# ================= Alertes =================
page("alertes", "Listes et alertes", "Suivez des valeurs dans des listes, fixez des seuils haut et bas, notez les cours relevés et voyez les alertes déclenchées.",
 "Outil de l'investisseur", "Listes et alertes", "Rangez les valeurs qui vous intéressent dans des listes, fixez vos seuils, notez pourquoi, et voyez d'un coup d'œil celles qui les ont franchis.",
 '<p class="demo-note">Socle n\'est relié à aucun flux de cotation : saisissez le cours quand vous le consultez, l\'outil garde l\'historique et vérifie vos seuils. Données gardées dans ce navigateur.</p>' +
 '<div class="card mt-s" style="padding:18px"><div class="toolbar"><div class="tabs" role="tablist" id="lists" aria-label="Mes listes"></div><span class="sp"></span><button class="btn ghost small" type="button" id="newList">Nouvelle liste</button><button class="btn ghost small" type="button" id="delList">Supprimer la liste</button><button class="btn ghost small" type="button" id="demo">Charger l\'exemple</button><button class="btn ghost small" type="button" id="csv">Exporter</button></div>'
 '<p class="res-lbl mt-s" id="nOn"></p><ul id="hits" style="list-style:disc;padding-left:1.2em;margin-top:6px"></ul>'
 '<div class="tbl mt-s"><table class="edit-tbl" style="min-width:860px"><thead><tr><th>Valeur</th><th>Tendance</th><th class="r">Nouveau cours</th><th class="r">Seuil haut</th><th class="r">Seuil bas</th><th>État</th><th></th></tr></thead><tbody id="rows"></tbody></table></div></div>' +
 '<form class="card mt-m form" id="f" style="padding:18px"><h2 style="font-size:1.1rem">Ajouter une valeur</h2><div class="row"><label>Nom<input name="nom" required placeholder="Ex. ETF Monde"></label><label>Cours actuel (€)<input name="cours" inputmode="decimal" placeholder="Ex. 44,60"></label></div><div class="row"><label>Seuil haut (€)<input name="haut" inputmode="decimal" placeholder="facultatif"></label><label>Seuil bas (€)<input name="bas" inputmode="decimal" placeholder="facultatif"></label></div><label>Pourquoi je la suis<input name="note" maxlength="120" placeholder="Ex. Renforcer sous 40 €"></label><div><button class="btn" type="submit">Ajouter</button></div></form>' +
 explain("<ul><li>Une alerte est déclenchée quand le dernier cours saisi est au-dessus du seuil haut ou au-dessous du seuil bas.</li><li>Écrire pourquoi vous suivez une valeur, avant que le cours bouge, aide à décider calmement quand le seuil est franchi.</li><li>Pour recevoir de vraies alertes automatiques, votre courtier propose souvent des ordres à seuil de déclenchement ou des notifications.</li></ul>",
         '<p class="formula">Distance au seuil = seuil / cours − 1</p><p>Une distance de +10 % signifie que le cours doit monter de 10 % pour atteindre le seuil haut.</p>') +
 related("actions,ordres,etf", ["analyse-entreprise", "portefeuille", "grands-fonds", "frais-courtage"]), free=False)

# ================= Grands fonds =================
page("grands-fonds", "Positions des grands fonds", "Apprenez à lire les positions trimestrielles déclarées par les grands gérants : poids, entrées, sorties, renforcements, concentration.",
 "Outil de l'investisseur", "Positions des grands fonds", "Ce que détiennent les grands gérants d'après leurs déclarations trimestrielles, avec les entrées et les sorties. Explorez trois fonds fictifs, puis comparez deux listes réelles que vous collez.",
 '<div class="tabs" role="tablist" id="fTabs" aria-label="Fonds"></div>' +
 '<div class="card mt-s" style="padding:22px"><p class="res-lbl">Fonds</p><p class="res-big t" id="fNom">—</p><p class="res-sub" id="fStyle"></p><div class="kpis mt-m" id="kpis"></div><p class="verdict" id="fRead"></p>'
 '<div class="grid2 mt-m"><div><h3>Lignes au 3e trimestre 2026</h3><div class="mt-s" id="pos"></div></div><div><h3>Par secteur</h3><div class="mt-s" id="sect"></div><h3 class="mt-l">Valeurs détenues par plusieurs fonds</h3><ul class="mt-s" id="common" style="list-style:disc;padding-left:1.2em;color:var(--muted)"></ul></div></div></div>' +
 '<div class="card mt-m" style="padding:22px"><h2 style="font-size:1.1rem">Comparer deux listes</h2><p class="muted small">Collez une ligne par position, sous la forme « nom ; valeur » (copiée d\'un tableur, d\'une déclaration ou de votre propre portefeuille à deux dates).</p><div class="grid2 mt-s"><div class="field"><label for="qa">Trimestre précédent</label><textarea id="qa" rows="7" style="padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg)">Orbis Logiciels;4200\nValmont Paiements;2900\nOstra Médias;950</textarea></div><div class="field"><label for="qb">Dernier trimestre</label><textarea id="qb" rows="7" style="padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--bg)">Orbis Logiciels;4650\nValmont Paiements;3120\nLumio Semi-conducteurs;820</textarea></div></div><div id="cmpOut"></div></div>' +
 explain("<ul><li>Les fonds et sociétés présentés sont fictifs.</li><li>Aux États-Unis, les gérants de plus de 100 millions de dollars en actions américaines publient leurs positions chaque trimestre (formulaire 13F de la SEC), jusqu'à 45 jours après la fin du trimestre. En France, l'AMF publie les déclarations de franchissement de seuil (5 %, 10 %…).</li><li>Ces déclarations arrivent avec plusieurs semaines de retard, ne montrent ni les ventes à découvert ni les autres classes d'actifs : copier un fonds, c'est acheter après lui sans connaître ses raisons.</li></ul>",
         '<p class="formula">Poids = valeur de la ligne / valeur totale déclarée<br>Concentration = poids cumulé des 5 premières lignes</p><p>Pour savoir si un gérant a acheté, regardez la variation du nombre de titres, pas celle de la valeur : une ligne peut grossir simplement parce que son cours a monté.</p>') +
 related("actions,etf,lire-un-bilan", ["analyse-entreprise", "alertes", "portefeuille", "comparateur-etf"]), free=False)

# ================= Calendrier des dividendes =================
page("calendrier-dividendes", "Calendrier des dividendes", "Visualisez mois par mois les dividendes attendus de vos actions et ETF, bruts et nets selon l'enveloppe.",
 "Outil de l'investisseur", "Calendrier des dividendes", "Indiquez vos lignes, le dividende par titre et le rythme de versement : voyez vos revenus mois par mois, nets des prélèvements selon l'enveloppe.",
 '<p class="demo-note">Données gardées dans ce navigateur. Les dates sont celles que vous saisissez : vérifiez-les dans l\'agenda financier de chaque société.</p>' +
 '<div class="card mt-s" style="padding:18px"><div class="toolbar"><button class="btn small" type="button" id="add">Ajouter une ligne</button><button class="btn ghost small" type="button" id="demo">Charger l\'exemple</button><button class="btn ghost small" type="button" id="fromPf">Reprendre mon suivi de portefeuille</button></div>'
 '<div class="tbl"><table class="edit-tbl" style="min-width:880px"><thead><tr><th>Valeur</th><th class="r">Titres</th><th class="r">Dividende annuel / titre (€)</th><th>Rythme</th><th>Premier mois</th><th>Enveloppe</th><th></th></tr></thead><tbody id="rows"></tbody></table></div></div>' +
 '<div class="kpis mt-m" id="kpis"></div><div class="card mt-m" style="padding:18px"><h3>Mois par mois</h3><div class="chart" id="chart"></div><div class="cal mt-m" id="cal"></div></div>' +
 explain("<ul><li>Montant de chaque versement = dividende annuel par titre × nombre de titres / nombre de versements par an.</li><li>Compte-titres : prélèvement forfaitaire de 31,4 % retenu à la source (2026). PEA et assurance-vie : rien n'est prélevé au versement.</li><li>Les retenues à la source étrangères ne sont pas prises en compte.</li></ul>",
         "<p>Le mois de versement est le mois de paiement, pas celui du détachement. Pour toucher un dividende, il faut détenir le titre la veille de la date de détachement.</p>") +
 related("dividendes,actions,compte-titres", ["dividendes", "portefeuille", "independance", "analyse-entreprise"]), free=False)

# ================= Comparateur ETF =================
page("comparateur-etf", "Comparateur d'ETF", "Comparez plusieurs ETF ou fonds sur un même indice : frais courants, écart de suivi, éligibilité au PEA, distribution des dividendes.",
 "Outil de l'investisseur", "Comparateur d'ETF", "Deux fonds qui suivent le même indice ne rapportent pas la même chose. Comparez l'effet des frais courants, de l'écart de suivi et de la distribution des dividendes selon l'enveloppe.",
 '<div class="card" style="padding:18px"><div class="toolbar"><h2 style="font-size:1.1rem">Fonds comparés</h2><span class="sp"></span><button class="btn ghost small" type="button" id="add">Ajouter un fonds</button><button class="btn ghost small" type="button" id="reset">Revenir à l\'exemple</button></div>'
 '<div class="tbl"><table class="edit-tbl" style="min-width:760px"><thead><tr><th>Fonds</th><th class="r">Frais courants %</th><th class="r">Écart de suivi %/an</th><th>Éligible PEA</th><th>Dividendes</th><th></th></tr></thead><tbody id="rows"></tbody></table></div><p class="hint">Les fonds proposés sont des exemples. Les frais courants figurent dans le document d\'informations clés (DIC) de chaque fonds.</p></div>' +
 '<div class="mt-m">' + sim(num("init", "Versement de départ", 10000, 0, step=500) + num("mens", "Versement mensuel", 300, 0, step=10) + num("ans", "Durée", 20, 1, 40, 1, rng=True, fmt="ans") +
     num("rdt", "Rendement annuel de l'indice", 7, 0, 12, 0.1, rng=True, fmt="pct") + num("dy", "Dont dividendes", 1.8, 0, 5, 0.1) + seg("env", "Enveloppe", [("pea", "PEA"), ("cto", "Compte-titres"), ("av", "Assurance-vie")], "pea"),
     '<p class="res-lbl">Le moins coûteux sur la durée</p><p class="res-big t" id="rBest">—</p><div class="chart" id="chart"></div><div id="tab" class="mt-m"></div>') + '</div>' +
 explain("<ul><li>Frais courants et écart de suivi sont retirés du rendement chaque année. L'écart de suivi réel peut être positif ou négatif ; il est compté ici comme un coût, par prudence.</li><li>Sur un compte-titres, un fonds distribuant voit ses dividendes imposés à 31,4 % chaque année ; un fonds capitalisant les réinvestit sans impôt immédiat.</li><li>Pour un PEA, seuls les fonds éligibles (investis au moins à 75 % en actions européennes, ou synthétiques) sont possibles.</li></ul>",
         '<p class="formula">Rendement net du fonds = rendement de l\'indice − frais courants − écart de suivi (− impôt annuel si distribuant sur CTO)</p><p>L\'écart de suivi (tracking difference) est la différence annuelle entre la performance du fonds et celle de son indice. C\'est le vrai coût, plus parlant que les frais affichés.</p>') +
 related("etf,pea,compte-titres", ["frais", "frais-courtage", "enveloppes", "portefeuille"]), free=False)

# ================= Frais de courtage =================
page("frais-courtage", "Frais de courtage", "Comparez le coût annuel de plusieurs grilles de frais de courtage selon le montant et le nombre de vos ordres, les titres étrangers et les droits de garde.",
 "Outil de l'investisseur", "Frais de courtage", "Ce que vous coûtent vraiment vos ordres de bourse sur un an, selon trois grilles types que vous pouvez modifier pour y mettre celle de votre courtier.",
 '<div class="card" style="padding:18px"><div class="toolbar"><h2 style="font-size:1.1rem">Grilles comparées</h2><span class="sp"></span><button class="btn ghost small" type="button" id="add">Ajouter ma grille</button><button class="btn ghost small" type="button" id="reset">Revenir aux grilles types</button></div>'
 '<div class="tbl"><table class="edit-tbl" style="min-width:820px"><thead><tr><th>Grille</th><th class="r">Commission %</th><th class="r">Minimum €</th><th class="r">Fixe € / ordre</th><th class="r">Change %</th><th class="r">Garde %/an</th><th></th></tr></thead><tbody id="rows"></tbody></table></div><p class="hint">Les grilles types ne correspondent à aucun établissement réel. Copiez la brochure tarifaire de votre courtier pour une comparaison exacte.</p></div>' +
 '<div class="mt-m">' + sim(num("montant", "Montant d'un ordre", 500, 0, step=50) + num("ordres", "Ordres par an", 12, 0, 120, 1, rng=True, suf=" ordres") +
     num("etr", "Part des ordres en devise étrangère", 0, 0, 100, 5, rng=True, suf=" %") + num("pf", "Valeur du portefeuille (pour les droits de garde)", 20000, 0, step=1000) + chk("pea", "Il s'agit d'un PEA (vérifier le plafond légal)", True),
     '<p class="res-lbl">La grille la moins chère pour vous</p><p class="res-big t" id="rBest">—</p><div class="res-row" id="rRow"></div><div class="chart" id="chart"></div><div id="tab" class="mt-m"></div>') + '</div>' +
 '<div class="card mt-m" style="padding:18px"><h3>Coût d\'un ordre selon son montant</h3><div class="chart" id="chart2"></div><p class="muted small mt-s">Avec un minimum par ordre, les petits ordres coûtent très cher en pourcentage : mieux vaut parfois regrouper ses achats.</p></div>' +
 explain("<ul><li>Coût d'un ordre = le plus grand entre le minimum et (part fixe + commission × montant).</li><li>Les frais de change s'appliquent aux titres cotés dans une autre devise que l'euro.</li><li>Dans un PEA, la loi plafonne les frais : 0,5 % du montant par ordre passé en ligne (1,2 % autrement), 0,4 % par an de droits de garde, 10 € à l'ouverture et 150 € pour un transfert.</li></ul>",
         '<p class="formula">Coût annuel = ordres × max(minimum, fixe + % × montant) + change + droits de garde</p><p>Rapporté aux sommes investies, ce coût se compare directement aux frais annuels d\'un fonds.</p>') +
 related("compte-titres,pea,actions,ordres", ["frais", "comparateur-etf", "dca", "portefeuille"]), free=False)

# ================= Sommaire =================
ICONS = {
 "wallet": '<path d="M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/><path d="M3 7l12-4v4"/><circle cx="16" cy="14" r="1.5"/>',
 "grow": '<path d="M3 20h18"/><path d="M6 16v-3M10 16V9M14 16v-5M18 16V5"/>',
 "target": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
 "down": '<path d="M3 6l6 6 4-4 8 8"/><path d="M15 16h6v-6"/>',
 "home": '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 "layers": '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 "percent": '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
 "shield": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 "doc": '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
 "steps": '<path d="M4 20h4v-4h4v-4h4V8h4"/>',
 "coins": '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"/><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3"/>',
 "flag": '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
 "play": '<circle cx="12" cy="12" r="9"/><path d="M10 8l6 4-6 4z"/>',
 "pie": '<path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
 "chart": '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
 "bell": '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 "building": '<path d="M4 21V5l8-3 8 3v16"/><path d="M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4"/>',
 "calendar": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 "scale": '<path d="M12 3v18M5 21h14"/><path d="M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
 "receipt": '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
}
CATS = [("Bien démarrer", "Budget, épargne, projets et crédit : les bases avant d'investir."), ("Impôts et enveloppes", "Choisir où placer et comprendre ce que l'État prélève, avec les règles de 2026."),
        ("Investir en bourse", "Ce qui fait vraiment la différence sur le long terme : le temps, les frais, la régularité."), ("S'entraîner", "Se tromper sans rien perdre, et regarder l'histoire en face."),
        ("Outils de l'investisseur", "Pour ceux qui investissent déjà : suivre, analyser, comparer.")]
cards = ""
for cat, sub in CATS:
    items = [s for s in ALL if ALL[s][2] == cat]
    cards += f'<div class="cat-h" data-cat="{E(cat)}"><h2>{E(cat)}</h2><p class="muted">{E(sub)}</p></div><div class="tool-grid" data-cat="{E(cat)}">'
    for s in items:
        short, desc, _, ic = ALL[s]
        cards += f'<a class="card tcard" href="{s}.html" data-cat="{E(cat)}" data-q="{E((short + " " + desc).lower())}"><span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICONS[ic]}</svg></span><h3>{E(short)}</h3><p>{E(desc)}</p><span class="foot"><span>{"Gratuit" if cat != "Outils de l\'investisseur" else "Outil de l\'investisseur"}</span><b>Ouvrir →</b></span></a>'
    cards += "</div>"
filt = '<div class="tool-filter" role="group" aria-label="Filtrer les outils"><button type="button" aria-pressed="true" data-f="">Tous ({n})</button>'.format(n=len(ALL)) + "".join(f'<button type="button" aria-pressed="false" data-f="{E(c)}">{E(c)}</button>' for c, _ in CATS) + "</div>"
idx_doc = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Outils et simulateurs · Socle</title>
<meta name="description" content="{len(ALL)} simulateurs et outils gratuits pour le budget, l'épargne, le crédit, la fiscalité 2026, la bourse et le suivi de portefeuille. Sans inscription, rien n'est envoyé.">
<link rel="stylesheet" href="../assets/site.css">
<link rel="stylesheet" href="../assets/outils.css">
<script src="../assets/site.js"></script>
<script src="../assets/outils/sommaire.js" defer></script>
</head>
<body>
<main id="main" data-outil="index">
<section class="page-hero" style="--c:var(--s3)">
  <div class="wrap">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="../index.html">Accueil</a><span aria-hidden="true">›</span><span>Outils</span></nav>
    <div class="sec-head"><div class="sec-num" style="background:var(--s3)">3</div><div>
    <p class="eyebrow">Outils et simulateurs</p>
    <h1>Les vrais chiffres, avant de décider</h1>
    <p class="lead">{len(ALL)} simulateurs et outils pour faire son budget, comparer les enveloppes avec la fiscalité 2026, mesurer l'effet des frais, s'entraîner sans risque et suivre ce que vous possédez. Tout fonctionne dans votre navigateur : rien n'est envoyé, rien n'est vendu.</p>
    </div></div>
  </div>
</section>
<section class="tight">
  <div class="wrap">
    <div class="tsearch card"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" type="search" placeholder="Chercher un outil : PEA, crédit, dividendes…" aria-label="Chercher un outil"></div>
    {filt}
    <div id="cards">{cards}</div>
    <p class="empty" id="none" hidden>Aucun outil ne correspond. Essayez « impôt », « ETF » ou « retraite ».</p>
    <div class="callout info mt-l"><b>Comment lire nos simulateurs</b>Chaque outil affiche ses hypothèses et sa formule sous le résultat. Les paramètres fiscaux sont ceux en vigueur en novembre 2026 (prélèvements sociaux 18,6 %, flat tax 31,4 %, barème de l'impôt 2026, Livret A à 1,7 %). Le lien « Copier le lien de cette simulation » garde vos hypothèses pour y revenir ou les partager.</div>
    <p class="disc">Outils pédagogiques : ils ne constituent pas un conseil en investissement. Tout placement en bourse comporte un risque de perte en capital.</p>
  </div>
</section>
</main>
</body>
</html>
'''
open(OUT + "index.html", "w").write(idx_doc)
print(len(ALL), "outils")
