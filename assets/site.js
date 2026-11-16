/* Socle Finance : socle JavaScript commun à toutes les pages.
   - applique le thème (clair/sombre) avant l'affichage ;
   - injecte le bandeau de cours, l'en-tête de navigation, le menu mobile, l'avertissement sur les risques et le pied de page ;
   - marque le lien actif ;
   - expose window.Socle : formats, toast, stockage, progression (XP, niveaux, badges), compte de démonstration, recherche.
   Usage dans une page : <link rel="stylesheet" href="../assets/site.css"> et <script src="../assets/site.js"></script> dans le <head>,
   puis un seul <main id="main"> dans le <body>. Les chemins sont calculés à partir de l'emplacement de ce fichier. */
(function () {
  "use strict";

  /* ---------- Racine du site (fonctionne en file:// comme en http) ---------- */
  var me = document.currentScript || (function () { var s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  var ROOT_URL = me.src.replace(/assets\/site\.js(\?.*)?$/, "");
  var here = location.href.split("#")[0].split("?")[0];
  var rel = here.indexOf(ROOT_URL) === 0 ? here.slice(ROOT_URL.length) : "";
  if (rel === "" || /\/$/.test(rel)) rel += "index.html";
  var depth = rel.split("/").length - 1;
  var R = depth ? new Array(depth + 1).join("../") : "";
  var SECTION = rel.indexOf("/") > -1 ? rel.split("/")[0] : (rel === "index.html" ? "accueil" : rel.replace(/\.html$/, ""));

  /* ---------- Thème, appliqué tout de suite ---------- */
  var root = document.documentElement;
  try { var t = localStorage.getItem("socle-theme"); if (t) root.dataset.theme = t; } catch (e) {}
  if (!root.lang) root.lang = "fr";

  /* ---------- Utilitaires ---------- */
  var store = {
    get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var eur = function (v, d) { d = d == null ? 0 : d; return Number(v).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: d, minimumFractionDigits: d }); };
  var pct = function (v, d) { return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: d == null ? 2 : d }) + " %"; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var norm = function (s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var slug = function (s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var url = function (p) { return R + p; };

  /* ---------- Plan du site (source unique de la navigation) ---------- */
  var NAV = [
    { id: "apprendre", label: "Apprendre", href: "apprendre/index.html", groups: [
      { h: "Gratuit, sans inscription", links: [
        ["Le guide de démarrage", "apprendre/index.html"],
        ["Les 8 leçons express", "apprendre/lecons.html"],
        ["Ma progression et mes badges", "apprendre/progression.html"],
        ["Glossaire", "glossaire/index.html"]
      ] }
    ] },
    { id: "guides", label: "Guides", href: "guides/index.html", groups: [
      { h: "Bourse", links: [["Les ETF, pas à pas", "guides/etf.html"], ["Les actions, comment ça marche", "guides/actions.html"], ["Lire un bilan d'entreprise", "guides/lire-un-bilan.html"], ["Vivre des dividendes ?", "guides/dividendes.html"], ["Les obligations", "guides/obligations.html"]] },
      { h: "Enveloppes, retraite et fiscalité", links: [["Le PEA de A à Z", "guides/pea.html"], ["Assurance-vie : le mode d'emploi", "guides/assurance-vie.html"], ["Préparer sa retraite (PER)", "guides/preparer-sa-retraite.html"], ["Déclarer ses placements", "guides/declarer-ses-placements.html"]] }
    ] },
    { id: "outils", label: "Outils", href: "outils/index.html", groups: [
      { h: "Simulateurs gratuits", links: [
        ["Budget 50/30/20", "outils/budget.html"], ["Épargne et intérêts composés", "outils/epargne.html"],
        ["Investissement programmé", "outils/dca.html"], ["Crédit immobilier", "outils/credit.html"],
        ["Objectif financier", "outils/objectif.html"], ["Comparer les enveloppes", "outils/enveloppes.html"],
        ["Impôt et TMI", "outils/impot.html"], ["Portefeuille virtuel", "outils/portefeuille-virtuel.html"]
      ] },
      { h: "Outils de l'investisseur", links: [
        ["Suivi de portefeuille", "outils/portefeuille.html"], ["Analyse d'entreprise", "outils/analyse-entreprise.html"],
        ["Listes et alertes", "outils/alertes.html"], ["Positions des grands fonds", "outils/grands-fonds.html"]
      ] }
    ] },
    { id: "glossaire", label: "Glossaire", href: "glossaire/index.html", hideDesktop: true },
    { id: "formules", label: "Tarifs", href: "formules/index.html" },
    { id: "equipe", label: "À propos", href: "equipe/index.html", groups: [
      { h: "Socle", links: [
        ["Notre équipe et notre méthode", "equipe/index.html"],
        ["Questions fréquentes", "faq/index.html"],
        ["Nous écrire", "contact/index.html"],
        ["Plan du site", "plan-du-site/index.html"]
      ] }
    ] }
  ];
  /* Les listes Guides et Outils sont complétées par site-map.js s'il existe (généré à partir des pages réelles). */
  var EXTRA = window.SOCLE_MAP || null;

  var FOOT = [
    { h: "Espaces", links: [["1 · Apprendre", "apprendre/index.html"], ["2 · Guides", "guides/index.html"], ["3 · Outils", "outils/index.html"], ["4 · Formules", "formules/index.html"], ["Glossaire", "glossaire/index.html"]] },
    { h: "Informations", links: [["À propos et méthode", "equipe/index.html"], ["Questions fréquentes", "faq/index.html"], ["Contact", "contact/index.html"], ["La lettre du mois", "formules/lettre.html"], ["Plan du site", "plan-du-site/index.html"]] },
    { h: "Légal", links: [["Avertissement sur les risques", "legal/risques.html"], ["Conditions de vente", "legal/cgv.html"], ["Résiliation et remboursement", "legal/resiliation.html"], ["Confidentialité", "legal/confidentialite.html"], ["Mentions légales", "legal/mentions-legales.html"]] }
  ];

  var LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="2" y="22" width="28" height="7" rx="2" fill="var(--s1)"/><rect x="2" y="13.5" width="20" height="7" rx="2" fill="var(--s2)"/><rect x="2" y="5" width="12" height="7" rx="2" fill="var(--s4)"/></svg>';
  var TICK = [["CAC 40", "7 612", "+0,42"], ["Euro Stoxx 50", "5 018", "+0,31"], ["S&P 500", "5 940", "−0,18"], ["Nasdaq 100", "21 304", "−0,36"], ["DAX", "19 870", "+0,57"], ["Or (once)", "2 645 $", "+0,12"], ["EUR/USD", "1,084", "−0,05"], ["OAT 10 ans", "3,12 %", "+0,02"]];

  function isCurrent(p) { return p === rel; }
  function aCur(p) { return isCurrent(p) ? ' aria-current="page"' : ""; }

  function groupsFor(item) {
    var g = (item.groups || []).slice();
    if (EXTRA && EXTRA[item.id]) g = EXTRA[item.id];
    return g;
  }

  function headerHTML() {
    var menu = NAV.filter(function (n) { return !n.hideDesktop; }).map(function (n) {
      var g = groupsFor(n), cur = SECTION === n.id || (n.id === "equipe" && /^(faq|contact|plan-du-site|legal)$/.test(SECTION)) || (n.id === "apprendre" && SECTION === "glossaire");
      if (!g.length) return '<li' + (cur ? ' class="current"' : "") + '><a href="' + url(n.href) + '"' + (cur ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
      var dd = g.map(function (gr) {
        return '<div class="dd-h">' + esc(gr.h) + "</div>" + gr.links.map(function (l) { return '<a href="' + url(l[1]) + '"' + aCur(l[1]) + ">" + esc(l[0]) + "</a>"; }).join("");
      }).join("") + '<a class="dd-all" href="' + url(n.href) + '">' + (n.id === "guides" ? "Tous les guides →" : n.id === "outils" ? "Tous les outils →" : "Ouvrir l'espace " + n.label + " →") + "</a>";
      return '<li' + (cur ? ' class="current"' : "") + '><button type="button" aria-expanded="false" data-dd>' + n.label + '<span class="car">▾</span></button><div class="dd card">' + dd + "</div></li>";
    }).join("");
    var acc = store.get("socle-account", null);
    return '<a class="skip" href="#main">Aller au contenu</a>' +
      '<div class="ticker" role="region" aria-label="Indices (valeurs d\'exemple)"><div class="wrap"><span class="lbl">Marchés</span><div class="tk-viewport"><div class="tk-track">' + tickHTML() + tickHTML() + '</div></div><span class="note">Valeurs d\'exemple, pas en temps réel</span></div></div>' +
      '<header class="nav"><div class="wrap">' +
      '<a class="logo" href="' + url("index.html") + '" aria-label="Socle, accueil">' + LOGO + "Socle</a>" +
      '<ul class="menu" id="menu">' + menu + "</ul>" +
      '<div class="nav-util">' +
      '<button class="theme-t" type="button" id="searchT" aria-label="Rechercher sur le site"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>' +
      '<button class="theme-t" type="button" id="themeT" aria-label="Changer de thème"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor"/></svg></button>' +
      '<a class="btn ghost login" href="' + url("formules/compte.html") + '">' + (acc ? "Mon compte" : "Connexion") + "</a>" +
      '<a class="btn" href="' + url("apprendre/index.html") + '">Guide offert</a>' +
      '<button class="burger" type="button" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>' +
      "</div></div></header>" +
      '<div class="drawer" id="drawer" aria-hidden="true"><nav class="drawer-panel" aria-label="Menu mobile"><button class="close" type="button" id="drawerClose" aria-label="Fermer le menu">✕</button>' + drawerHTML() + "</nav></div>";
  }
  function tickHTML() {
    return TICK.map(function (x) { return '<span class="tk-item"><b>' + x[0] + '</b><span class="num">' + x[1] + '</span><span class="num ' + (x[2].charAt(0) === "−" ? "down" : "up") + '">' + x[2] + " %</span></span>"; }).join("");
  }
  function drawerHTML() {
    var h = '<a href="' + url("index.html") + '"' + aCur("index.html") + ">Accueil</a>";
    var n = 0;
    NAV.forEach(function (it) {
      var num = { apprendre: "1 · ", guides: "2 · ", outils: "3 · ", formules: "4 · " }[it.id] || "";
      h += '<a href="' + url(it.href) + '"' + aCur(it.href) + ">" + num + (it.id === "formules" ? "Formules et tarifs" : it.label) + "</a>";
      if (it.id === "apprendre") groupsFor(it).forEach(function (g) { g.links.forEach(function (l) { if (l[1] !== it.href && l[1] !== "glossaire/index.html") h += '<a class="dr-sub" href="' + url(l[1]) + '"' + aCur(l[1]) + ">" + esc(l[0]) + "</a>"; }); });
    });
    h += '<div class="dr-h">Aide</div><a href="' + url("faq/index.html") + '"' + aCur("faq/index.html") + '>Questions fréquentes</a><a href="' + url("contact/index.html") + '"' + aCur("contact/index.html") + ">Contact</a>";
    h += '<a href="' + url("formules/compte.html") + '"' + aCur("formules/compte.html") + ">Mon compte</a>";
    return h;
  }
  function footerHTML() {
    return '<div class="risk"><div class="wrap"><strong>Contenu pédagogique.</strong> Socle ne fournit pas de conseil en investissement. Tout placement en bourse comporte un risque de perte en capital. Les performances passées ne préjugent pas des performances futures. <a href="' + url("legal/risques.html") + '">Lire l\'avertissement complet</a>.</div></div>' +
      '<footer><div class="wrap"><div class="fgrid"><div>' +
      '<a class="logo" href="' + url("index.html") + '">' + LOGO + "Socle</a>" +
      '<p class="muted small" style="margin-top:10px;max-width:34ch">La finance personnelle expliquée simplement, pour bâtir son épargne sur de bonnes bases.</p>' +
      '<div class="pay" aria-label="Moyens de paiement présentés (démonstration)"><span>CB</span><span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span></div></div>' +
      FOOT.map(function (c) { return "<div><h4>" + c.h + "</h4><ul>" + c.links.map(function (l) { return '<li><a href="' + url(l[1]) + '"' + aCur(l[1]) + ">" + l[0] + "</a></li>"; }).join("") + "</ul></div>"; }).join("") +
      '</div><div class="fbottom"><span>© 2026 Socle · site de démonstration</span><span>Données de marché et entreprises présentées à titre d\'exemple</span></div></div></footer>' +
      '<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>' +
      '<div class="modal" id="searchModal" hidden><div class="box card" role="dialog" aria-modal="true" aria-label="Rechercher sur le site" style="width:min(620px,100%)"><button class="x" type="button" data-close-search aria-label="Fermer">✕</button><h3 style="font-size:1.2rem">Rechercher sur Socle</h3><div class="sbox" style="margin-top:16px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="gq" type="search" placeholder="Ex. : ouvrir un PEA, intérêts composés, ETF…" autocomplete="off" aria-label="Rechercher" style="border:1px solid var(--line)"></div><div id="gres" style="margin-top:12px;max-height:50vh;overflow:auto"></div></div></div>';
  }

  /* ---------- Toast ---------- */
  var tt;
  function toast(msg) {
    var el = document.getElementById("toast"); if (!el) return;
    el.textContent = msg; el.hidden = false; clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 3600);
  }

  /* ---------- Progression : XP, niveaux, badges (stockés dans le navigateur) ---------- */
  var LEVELS = [{ n: "Première pierre", x: 0 }, { n: "Fondations", x: 150 }, { n: "Murs porteurs", x: 400 }, { n: "Charpente", x: 750 }, { n: "Édifice", x: 1200 }];
  var BADGES = [
    { id: "chap1", t: "Premier chapitre", d: "Terminer un chapitre du guide de démarrage", g: "Apprendre" },
    { id: "guide", t: "Diplômé du démarrage", d: "Terminer les 8 chapitres du guide", g: "Apprendre" },
    { id: "lesson", t: "Bon élève", d: "Réussir une leçon express", g: "Apprendre" },
    { id: "school", t: "Toutes les leçons", d: "Réussir les 8 leçons express", g: "Apprendre" },
    { id: "perfect", t: "Sans faute", d: "Réussir un quiz du premier coup", g: "Apprendre" },
    { id: "gloss", t: "Curieux", d: "Ouvrir le glossaire et chercher un mot", g: "Apprendre" },
    { id: "reader", t: "Lecteur", d: "Lire un guide jusqu'au bout", g: "Guides" },
    { id: "reader3", t: "Bibliothèque", d: "Lire trois guides", g: "Guides" },
    { id: "budget", t: "Budget posé", d: "Utiliser le simulateur de budget", g: "Outils" },
    { id: "calc", t: "Effet boule de neige", d: "Utiliser un calculateur d'intérêts composés", g: "Outils" },
    { id: "tools3", t: "Boîte à outils", d: "Essayer trois simulateurs différents", g: "Outils" },
    { id: "first", t: "Premier ordre", d: "Passer un premier achat dans le portefeuille virtuel", g: "Portefeuille virtuel" },
    { id: "diversif", t: "Diversification", d: "Détenir 3 lignes dans le portefeuille virtuel", g: "Portefeuille virtuel" },
    { id: "dividend", t: "Rentier", d: "Recevoir un dividende virtuel", g: "Portefeuille virtuel" },
    { id: "calm", t: "Sang-froid", d: "Garder une ligne en baisse sans vendre", g: "Portefeuille virtuel" },
    { id: "year", t: "Investisseur patient", d: "Laisser passer un an simulé", g: "Portefeuille virtuel" },
    { id: "account", t: "Bienvenue", d: "Créer son compte de démonstration", g: "Compte" },
    { id: "letter", t: "Abonné à la lettre", d: "S'inscrire à la lettre du mois", g: "Compte" }
  ];
  var PKEY = "socle-progress";
  function P() { var p = store.get(PKEY, null) || {}; p.xp = p.xp || 0; p.badges = p.badges || []; p.chapters = p.chapters || []; p.lessons = p.lessons || []; p.guides = p.guides || []; p.tools = p.tools || []; return p; }
  function save(p) { store.set(PKEY, p); }
  function level(xp) { var l = LEVELS[0], nx = null; for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i].x) { l = LEVELS[i]; nx = LEVELS[i + 1] || null; } } return { name: l.n, min: l.x, next: nx, idx: LEVELS.indexOf(l) }; }
  function addXp(n, why) {
    var p = P(), before = level(p.xp).idx; p.xp += n; save(p);
    var after = level(p.xp);
    if (after.idx > before) setTimeout(function () { toast("Nouveau niveau : " + after.name + " !"); }, 1200);
    document.dispatchEvent(new CustomEvent("socle:progress"));
  }
  function unlock(id) {
    var p = P(); if (p.badges.indexOf(id) > -1) return false;
    var b = BADGES.filter(function (x) { return x.id === id; })[0]; if (!b) return false;
    p.badges.push(id); save(p); toast("Badge débloqué : « " + b.t + " »  +50 XP"); addXp(50);
    return true;
  }
  function markIn(list, key, xp) { var p = P(); if (p[list].indexOf(key) > -1) return false; p[list].push(key); save(p); if (xp) addXp(xp); return true; }
  var progress = {
    get: P, level: level, LEVELS: LEVELS, BADGES: BADGES, addXp: addXp, unlock: unlock,
    reset: function () { store.del(PKEY); document.dispatchEvent(new CustomEvent("socle:progress")); },
    chapter: function (n) { if (markIn("chapters", n, 40)) { unlock("chap1"); if (P().chapters.length >= 8) unlock("guide"); } },
    lesson: function (n) { if (markIn("lessons", n, 30)) { unlock("lesson"); if (P().lessons.length >= 8) unlock("school"); } },
    /* À appeler par les pages de guides quand le lecteur arrive en bas : Socle.progress.guide("nom-du-guide") */
    guide: function (id) { if (markIn("guides", id, 20)) { unlock("reader"); if (P().guides.length >= 3) unlock("reader3"); } },
    /* À appeler par les simulateurs à la première utilisation : Socle.progress.tool("epargne") */
    tool: function (id) { if (markIn("tools", id, 10)) { if (P().tools.length >= 3) unlock("tools3"); } }
  };

  /* ---------- Compte de démonstration ---------- */
  var account = {
    get: function () { return store.get("socle-account", null); },
    set: function (a) { store.set("socle-account", a); },
    clear: function () { store.del("socle-account"); }
  };

  /* ---------- Recherche globale ---------- */
  var IDX = [
    ["Accueil", "Socle", "index.html"],
    ["Le guide de démarrage : vos premiers 1 000 € placés", "Apprendre", "apprendre/index.html"],
    ["Chapitre 1 · Faire son budget", "Apprendre", "apprendre/chapitre-1.html"],
    ["Chapitre 2 · L'épargne de précaution, livret A", "Apprendre", "apprendre/chapitre-2.html"],
    ["Chapitre 3 · Risque, rendement et durée de placement", "Apprendre", "apprendre/chapitre-3.html"],
    ["Chapitre 4 · Intérêts composés et inflation", "Apprendre", "apprendre/chapitre-4.html"],
    ["Chapitre 5 · Actions, obligations, immobilier : les classes d'actifs", "Apprendre", "apprendre/chapitre-5.html"],
    ["Chapitre 6 · Livret, assurance-vie, PEA, compte-titres, PER : les enveloppes", "Apprendre", "apprendre/chapitre-6.html"],
    ["Chapitre 7 · ETF, indices et diversification", "Apprendre", "apprendre/chapitre-7.html"],
    ["Chapitre 8 · Passer son premier ordre en bourse", "Apprendre", "apprendre/chapitre-8.html"],
    ["Les 8 leçons express avec quiz", "Apprendre", "apprendre/lecons.html"],
    ["Ma progression, niveaux et badges", "Apprendre", "apprendre/progression.html"],
    ["Glossaire de la bourse et de l'épargne", "Glossaire", "glossaire/index.html"],
    ["Tous les guides", "Guides", "guides/index.html"],
    ["Les ETF, pas à pas", "Guide", "guides/etf.html"],
    ["Lire un bilan d'entreprise", "Guide", "guides/lire-un-bilan.html"],
    ["Vivre des dividendes ?", "Guide", "guides/dividendes.html"],
    ["Les obligations", "Guide", "guides/obligations.html"],
    ["Comprendre les cycles de marché", "Guide", "guides/cycles-de-marche.html"],
    ["Les actions, comment ça marche", "Guide", "guides/actions.html"],
    ["Diversifier et investir régulièrement (DCA)", "Guide", "guides/diversifier-investir-regulierement.html"],
    ["Les frais qui grignotent le rendement", "Guide", "guides/frais.html"],
    ["Les erreurs du débutant", "Guide", "guides/erreurs-debutant.html"],
    ["Le PEA de A à Z, ouvrir un PEA", "Guide", "guides/pea.html"],
    ["Assurance-vie : le mode d'emploi", "Guide", "guides/assurance-vie.html"],
    ["Compte-titres et courtiers", "Guide", "guides/compte-titres-courtiers.html"],
    ["Préparer sa retraite avec un PER", "Guide", "guides/preparer-sa-retraite.html"],
    ["L'immobilier papier (SCPI)", "Guide", "guides/scpi.html"],
    ["Placer pour ses enfants", "Guide", "guides/placer-pour-ses-enfants.html"],
    ["Emprunter pour sa résidence principale", "Guide", "guides/emprunter-residence.html"],
    ["Les cryptomonnaies, sans fantasme", "Guide", "guides/cryptomonnaies.html"],
    ["Déclarer ses placements, impôts", "Guide", "guides/declarer-ses-placements.html"],
    ["Transmettre et donner, succession, donation", "Guide", "guides/transmettre-et-donner.html"],
    ["La fiscalité des placements en un coup d'œil", "Guide", "guides/fiscalite-des-placements.html"],
    ["Tous les outils et simulateurs", "Outils", "outils/index.html"],
    ["Budget 50/30/20, répartir son salaire", "Simulateur", "outils/budget.html"],
    ["Épargne et intérêts composés, calculateur", "Simulateur", "outils/epargne.html"],
    ["Investissement programmé (DCA), versements réguliers", "Simulateur", "outils/dca.html"],
    ["Crédit immobilier, mensualité, taux d'endettement", "Simulateur", "outils/credit.html"],
    ["Objectif financier, épargne mensuelle", "Simulateur", "outils/objectif.html"],
    ["Comparer les enveloppes : PEA, assurance-vie, compte-titres, PER, livret A", "Simulateur", "outils/enveloppes.html"],
    ["PER, économie d'impôt retraite", "Simulateur", "outils/per.html"],
    ["Impôt sur le revenu, tranche marginale (TMI)", "Simulateur", "outils/impot.html"],
    ["Déclarer ses placements, IFU, formulaire 3916, 2086", "Simulateur", "outils/declaration.html"],
    ["Frais de gestion, impact des frais", "Simulateur", "outils/frais.html"],
    ["Dividendes, revenus passifs", "Simulateur", "outils/dividendes.html"],
    ["Inflation, pouvoir d'achat", "Simulateur", "outils/inflation.html"],
    ["Indépendance financière, règle des 4 %", "Simulateur", "outils/independance.html"],
    ["Suivi de portefeuille, répartition", "Outil", "outils/portefeuille.html"],
    ["Portefeuille virtuel, s'entraîner en bourse sans risque", "Outil", "outils/portefeuille-virtuel.html"],
    ["Analyse d'entreprise, bilan, marges", "Outil", "outils/analyse-entreprise.html"],
    ["Listes et alertes de cours", "Outil", "outils/alertes.html"],
    ["Positions des grands fonds", "Outil", "outils/grands-fonds.html"],
    ["Calendrier des dividendes", "Outil", "outils/calendrier-dividendes.html"],
    ["Comparateur d'ETF", "Outil", "outils/comparateur-etf.html"],
    ["Frais de courtage, comparer les courtiers", "Outil", "outils/frais-courtage.html"],
    ["Historique des krachs boursiers", "Outil", "outils/krachs.html"],
    ["Formules, tarifs, abonnement, essai 14 jours", "Formules", "formules/index.html"],
    ["Mon compte, connexion, gérer mon abonnement", "Compte", "formules/compte.html"],
    ["La lettre du mois", "Compte", "formules/lettre.html"],
    ["Notre équipe et notre méthode, à propos", "Socle", "equipe/index.html"],
    ["Questions fréquentes, FAQ", "Aide", "faq/index.html"],
    ["Contact, nous écrire", "Aide", "contact/index.html"],
    ["Plan du site", "Aide", "plan-du-site/index.html"],
    ["Avertissement sur les risques", "Légal", "legal/risques.html"],
    ["Conditions générales de vente", "Légal", "legal/cgv.html"],
    ["Résiliation et remboursement", "Légal", "legal/resiliation.html"],
    ["Confidentialité et données personnelles", "Légal", "legal/confidentialite.html"],
    ["Mentions légales", "Légal", "legal/mentions-legales.html"]
  ];
  if (window.SOCLE_SEARCH) IDX = IDX.concat(window.SOCLE_SEARCH);
  function searchIn(q, max) {
    var t = norm(q.trim()); if (!t) return [];
    var w = t.split(/\s+/);
    return IDX.filter(function (r) { var s = norm(r[0] + " " + r[1]); return w.every(function (x) { return s.indexOf(x) > -1; }); }).slice(0, max || 8);
  }
  function resultsHTML(hits) {
    return hits.length ? hits.map(function (r) { return '<a href="' + url(r[2]) + '"><span>' + esc(r[0]) + "</span><span>" + esc(r[1]) + "</span></a>"; }).join("") : '<p class="small muted" style="padding:10px">Aucun résultat. Essayez « ETF », « PEA » ou « budget ».</p>';
  }

  /* ---------- Montage ---------- */
  function mount() {
    var body = document.body;
    var main = document.querySelector("main");
    if (main && !main.id) main.id = "main";
    if (!document.querySelector("header.nav")) {
      var top = document.createElement("div"); top.innerHTML = headerHTML();
      while (top.lastChild) body.insertBefore(top.lastChild, body.firstChild);
      var bot = document.createElement("div"); bot.innerHTML = footerHTML();
      while (bot.firstChild) body.appendChild(bot.firstChild);
    }
    var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };

    $("#themeT").addEventListener("click", function () {
      var cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var nx = cur === "dark" ? "light" : "dark"; root.dataset.theme = nx; try { localStorage.setItem("socle-theme", nx); } catch (e) {}
    });

    function closeDD() { $$(".menu > li").forEach(function (x) { x.classList.remove("open"); var b = x.querySelector("[data-dd]"); if (b) b.setAttribute("aria-expanded", "false"); }); }
    $$("[data-dd]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); var li = b.parentElement, open = !li.classList.contains("open"); closeDD(); if (open) { li.classList.add("open"); b.setAttribute("aria-expanded", "true"); } });
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".menu")) closeDD(); });

    var drawer = $("#drawer"), burger = $("#burger");
    function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); burger.setAttribute("aria-expanded", "false"); }
    burger.addEventListener("click", function () { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); burger.setAttribute("aria-expanded", "true"); $("#drawerClose").focus(); });
    $("#drawerClose").addEventListener("click", closeDrawer);
    drawer.addEventListener("click", function (e) { if (e.target === drawer || e.target.tagName === "A") closeDrawer(); });

    var glossLoaded = false, sm = $("#searchModal"), gq = $("#gq"), gres = $("#gres");
    function loadGloss() {
      if (glossLoaded) return; glossLoaded = true;
      var add = function () { (window.SOCLE_GLOSS || []).forEach(function (g) { IDX.push([g[1] + " : définition", "Glossaire", "glossaire/index.html#" + g[0]]); }); };
      if (window.SOCLE_GLOSS) return add();
      var sc = document.createElement("script"); sc.src = url("assets/glossaire-data.js"); sc.onload = add; document.head.appendChild(sc);
    }
    function openSearch() { loadGloss(); sm.hidden = false; gres.innerHTML = '<p class="small muted" style="padding:10px">Tapez un mot : PEA, ETF, budget, dividende…</p>'; setTimeout(function () { gq.focus(); }, 30); }
    function closeSearch() { sm.hidden = true; }
    $("#searchT").addEventListener("click", openSearch);
    $$("[data-close-search]").forEach(function (b) { b.addEventListener("click", closeSearch); });
    sm.addEventListener("click", function (e) { if (e.target === sm) closeSearch(); });
    gq.addEventListener("input", function () { gres.innerHTML = gq.value.trim() ? '<div class="sresults" style="position:static;box-shadow:none;padding:0">' + resultsHTML(searchIn(gq.value, 12)) + "</div>" : ""; });
    gq.addEventListener("keydown", function (e) { if (e.key === "Enter") { var a = gres.querySelector("a"); if (a) location.href = a.href; } });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDD(); closeDrawer(); closeSearch(); }
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName)) { e.preventDefault(); openSearch(); }
    });

    $$("[data-toast]").forEach(function (el) { el.addEventListener("click", function (e) { e.preventDefault(); toast(el.dataset.toast); }); });
    $$("[data-open-search]").forEach(function (el) { el.addEventListener("click", function (e) { e.preventDefault(); openSearch(); }); });
    document.dispatchEvent(new CustomEvent("socle:ready"));
  }

  window.Socle = {
    ROOT: R, SECTION: SECTION, PATH: rel, url: url,
    eur: eur, pct: pct, esc: esc, norm: norm, slug: slug, store: store, toast: toast,
    progress: progress, account: account,
    search: searchIn, searchResultsHTML: resultsHTML,
    NAV: NAV
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
