/* Analyse d'entreprise : dix ans de chiffres, ratios clés, phrase d'explication sous chaque graphique, valorisation par les flux de trésorerie.
   Les trois sociétés proposées sont fictives. Vous pouvez saisir les chiffres d'une vraie entreprise (rapport annuel). */
(function () {
  "use strict";
  var ANS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  var ROWS = [["ca", "Chiffre d'affaires"], ["ebit", "Résultat opérationnel"], ["rn", "Résultat net"], ["fcf", "Flux de trésorerie disponible"], ["dn", "Dette nette"], ["cp", "Capitaux propres"], ["dpa", "Dividende par action (€)"]];
  var PRESETS = {
    ventor: { nom: "Ventor Énergie (fictive)", secteur: "Énergies renouvelables", actions: 180, cours: 42.1,
      ca: [3000, 3200, 3400, 3600, 3500, 4100, 4600, 4900, 5300, 5600], ebit: [420, 460, 500, 540, 450, 620, 720, 760, 850, 910], rn: [250, 275, 300, 330, 240, 380, 450, 470, 520, 560],
      fcf: [150, 180, 190, 220, 160, 240, 280, 300, 350, 380], dn: [2600, 2700, 2800, 2900, 3200, 3300, 3400, 3500, 3600, 3650], cp: [3000, 3150, 3300, 3450, 3500, 3750, 4000, 4250, 4500, 4800], dpa: [0.8, 0.85, 0.9, 0.95, 0.95, 1.05, 1.2, 1.3, 1.45, 1.6] },
    halde: { nom: "Halde Industrie (fictive)", secteur: "Équipements industriels", actions: 60, cours: 24.6,
      ca: [2400, 2550, 2700, 2500, 2100, 2350, 2600, 2550, 2450, 2300], ebit: [260, 290, 310, 220, 90, 200, 250, 210, 170, 130], rn: [160, 180, 195, 120, -30, 110, 150, 115, 80, 45],
      fcf: [140, 150, 170, 110, 20, 90, 120, 70, 40, 10], dn: [600, 580, 560, 700, 950, 900, 880, 980, 1100, 1250], cp: [1500, 1620, 1750, 1800, 1720, 1790, 1880, 1930, 1950, 1940], dpa: [1.1, 1.2, 1.3, 1.3, 0.5, 0.9, 1.1, 1.1, 1.1, 1.1] },
    lumen: { nom: "Café Lumen (fictive)", secteur: "Restauration", actions: 95, cours: 24.8,
      ca: [820, 860, 905, 950, 700, 880, 1010, 1080, 1140, 1190], ebit: [98, 105, 112, 120, 30, 100, 128, 140, 150, 158], rn: [70, 75, 80, 86, 12, 68, 92, 101, 108, 113],
      fcf: [75, 80, 84, 90, 25, 70, 95, 104, 112, 118], dn: [150, 140, 130, 120, 210, 180, 150, 120, 100, 80], cp: [420, 450, 480, 510, 480, 510, 545, 580, 615, 650], dpa: [0.55, 0.6, 0.64, 0.68, 0.3, 0.55, 0.7, 0.76, 0.82, 0.87] }
  };
  var MINE_KEY = "socle-analyse-mine";
  var mine = SO.store.get(MINE_KEY, null);
  if (!mine || !Array.isArray(mine.ca)) { mine = JSON.parse(JSON.stringify(PRESETS.lumen)); mine.nom = "Mon entreprise"; mine.secteur = "À compléter"; }
  PRESETS.mine = mine;
  var key = "ventor", C = JSON.parse(JSON.stringify(PRESETS.ventor));
  var last = ANS.length - 1;
  function cagr(a, b, n) { return a > 0 && b > 0 ? Math.pow(b / a, 1 / n) - 1 : NaN; }
  function renderTable() {
    var h = "<thead><tr><th>En millions d'euros</th>" + ANS.map(function (a) { return '<th class="r">' + a + "</th>"; }).join("") + "</tr></thead><tbody>";
    ROWS.forEach(function (r) { h += "<tr><td>" + r[1] + "</td>" + C[r[0]].map(function (v, i) { return '<td><input class="n" data-r="' + r[0] + '" data-i="' + i + '" inputmode="decimal" aria-label="' + r[1] + " " + ANS[i] + '" value="' + v + '"></td>'; }).join("") + "</tr>"; });
    SO.set("data", '<div class="tbl"><table class="edit-tbl" style="min-width:980px">' + h + "</tbody></table></div>");
    document.getElementById("cours").value = C.cours; document.getElementById("actions").value = C.actions;
    document.getElementById("nomE").value = C.nom;
  }
  function flag(ok, warn) { return ok ? '<span class="pill-st ok">solide</span>' : warn ? '<span class="pill-st on">à surveiller</span>' : '<span class="pill-st off">faible</span>'; }
  function compute() {
    var ca = C.ca, eb = C.ebit, rn = C.rn, fcf = C.fcf, dn = C.dn, cp = C.cp, dpa = C.dpa, sh = C.actions, px = C.cours;
    var mOp = ANS.map(function (_, i) { return ca[i] ? eb[i] / ca[i] : 0; }), mN = ANS.map(function (_, i) { return ca[i] ? rn[i] / ca[i] : 0; });
    var g5 = cagr(ca[last - 5], ca[last], 5), g9 = cagr(ca[0], ca[last], 9), bpa = sh ? rn[last] / sh : 0, cap = px * sh;
    var per = bpa > 0 ? px / bpa : NaN, rdt = px ? dpa[last] / px : 0, payout = rn[last] > 0 ? dpa[last] * sh / rn[last] : Infinity;
    var lev = eb[last] > 0 ? dn[last] / eb[last] : Infinity, roe = cp[last] ? rn[last] / cp[last] : 0, fy = cap ? fcf[last] / cap : 0, ve = eb[last] > 0 ? (cap + dn[last]) / eb[last] : NaN;
    var avgM = mOp.slice(-5).reduce(function (a, b) { return a + b; }, 0) / 5;
    SO.txt("rNom", C.nom); SO.txt("rSect", C.secteur + " · capitalisation " + SO.short(cap) + " M€");
    SO.table("ratios", ["Indicateur", "Valeur", "Lecture", "Repère"], [
      ["Croissance du chiffre d'affaires (5 ans, par an)", SO.pct(g5, 1), flag(g5 > 0.05, g5 > 0), "plus de 5 % par an : croissance soutenue"],
      ["Marge opérationnelle " + ANS[last], SO.pct(mOp[last], 1), flag(mOp[last] > 0.15, mOp[last] > 0.07), "dépend du secteur ; compare-la à sa propre histoire"],
      ["Rentabilité des capitaux propres (ROE)", SO.pct(roe, 1), flag(roe > 0.12, roe > 0.06), "au-dessus de 12 % : l'entreprise fait bien travailler l'argent des actionnaires"],
      ["Dette nette / résultat opérationnel", isFinite(lev) ? SO.n(lev, 1) + " ans" : "non calculable", flag(lev < 2, lev < 4), "sous 2 ans : endettement léger ; au-delà de 4 : prudence"],
      ["Taux de distribution du dividende", isFinite(payout) ? SO.pct(payout, 0) : "bénéfice nul ou négatif", flag(payout < 0.6, payout < 0.9), "au-delà de 100 %, le dividende n'est pas couvert par le bénéfice"],
      ["Conversion en trésorerie (FCF / résultat net)", rn[last] > 0 ? SO.pct(fcf[last] / rn[last], 0) : "—", flag(fcf[last] / rn[last] > 0.8, fcf[last] / rn[last] > 0.5), "proche de 100 % : les bénéfices se transforment en argent réel"],
      ["PER (cours / bénéfice par action)", isFinite(per) ? SO.n(per, 1) : "non significatif", isFinite(per) ? (per < 15 ? "bon marché en apparence" : per < 25 ? "dans la moyenne" : "cher, ou bénéfice déprimé") : "—", "à comparer au secteur et à la croissance"],
      ["Rendement du dividende", SO.pct(rdt, 1), rdt > 0.07 ? '<span class="pill-st on">à vérifier</span>' : "—", "un rendement très élevé peut annoncer une baisse du dividende"],
      ["Rendement du flux de trésorerie (FCF / capitalisation)", SO.pct(fy, 1), flag(fy > 0.06, fy > 0.03), "le « vrai » rendement de l'entreprise pour son propriétaire"],
      ["Valeur d'entreprise / résultat opérationnel", isFinite(ve) ? SO.n(ve, 1) : "—", "—", "intègre la dette, utile pour comparer des sociétés plus ou moins endettées"]
    ], { right: false });
    var lab = ANS.map(String);
    SO.bars("cCa", { labels: lab, title: "Chiffre d'affaires et résultat opérationnel", series: [{ name: "Chiffre d'affaires", data: ca, color: "var(--s2)" }, { name: "Résultat opérationnel", data: eb, color: "var(--s1)" }], tipFmt: function (v) { return SO.n(v, 0) + " M€"; } });
    SO.txt("sCa", "Le chiffre d'affaires a " + (g9 >= 0 ? "progressé" : "reculé") + " de " + SO.pct(Math.abs(g9), 1) + " par an en moyenne depuis " + ANS[0] + (ca[last] < Math.max.apply(null, ca) ? ", mais il reste sous son record de " + ANS[ca.indexOf(Math.max.apply(null, ca))] : "") + ".");
    SO.chart("cMarg", { labels: lab, title: "Marges", yFmt: function (x) { return SO.n(x * 100, 0) + " %"; }, tipFmt: function (x) { return SO.pct(x, 1); }, series: [{ name: "Marge opérationnelle", data: mOp, color: "var(--s1)" }, { name: "Marge nette", data: mN, color: "var(--s3)" }] });
    SO.txt("sMarg", "La marge opérationnelle est de " + SO.pct(mOp[last], 1) + " en " + ANS[last] + ", " + (mOp[last] > avgM * 1.05 ? "au-dessus" : mOp[last] < avgM * 0.95 ? "en dessous" : "proche") + " de sa moyenne sur cinq ans (" + SO.pct(avgM, 1) + ")" + (mOp[last] < mOp[last - 3] * 0.8 ? " : elle se dégrade nettement depuis trois ans." : "."));
    SO.bars("cDette", { labels: lab, title: "Dette nette", series: [{ name: "Dette nette", data: dn, color: function (v, i) { return eb[i] > 0 && v / eb[i] > 4 ? "var(--down)" : "var(--s4)"; } }], tipFmt: function (v, i) { return SO.n(v, 0) + " M€ · " + (eb[i] > 0 ? SO.n(v / eb[i], 1) + " ans de résultat" : "résultat nul"); } });
    SO.txt("sDette", isFinite(lev) ? "Il faudrait " + SO.n(lev, 1) + " années de résultat opérationnel pour rembourser la dette nette" + (dn[last] > dn[last - 5] * 1.2 ? ", qui a augmenté de " + SO.pct(dn[last] / dn[last - 5] - 1, 0) + " en cinq ans." : ".") : "Le résultat opérationnel est nul ou négatif : la dette ne peut pas être remboursée par l'activité actuelle.");
    SO.bars("cDiv", { labels: lab, title: "Dividende par action", series: [{ name: "Dividende par action", data: dpa, color: function (v, i) { return rn[i] > 0 && v * sh / rn[i] > 1 ? "var(--down)" : "var(--s1)"; } }], tipFmt: function (v, i) { return SO.n(v, 2) + " € · distribution " + (rn[i] > 0 ? SO.pct(v * sh / rn[i], 0) : "non couverte"); } });
    var cuts = dpa.filter(function (v, i) { return i && v < dpa[i - 1]; }).length;
    SO.txt("sDiv", "Le dividende " + (dpa[last] > dpa[0] ? "a été multiplié par " + SO.n(dpa[last] / dpa[0], 1) : "n'a pas progressé") + " en dix ans" + (cuts ? ", avec " + cuts + " baisse" + (cuts > 1 ? "s" : "") : ", sans jamais baisser") + (isFinite(payout) && payout > 1 ? ". Attention : il dépasse le bénéfice de " + ANS[last] + "." : "."));
    // valorisation par actualisation des flux de trésorerie
    var g = SO.num(document.getElementById("g").value) / 100, r = SO.num(document.getElementById("r").value) / 100, gt = SO.num(document.getElementById("gt").value) / 100;
    var base = (fcf[last] + fcf[last - 1] + fcf[last - 2]) / 3, v = 0, f = base;
    for (var t = 1; t <= 10; t++) { f *= 1 + g; v += f / Math.pow(1 + r, t); }
    var tv = r > gt ? f * (1 + gt) / (r - gt) / Math.pow(1 + r, 10) : NaN, ev = v + tv, eq = ev - dn[last], vps = sh ? eq / sh : 0;
    SO.txt("vBig", !isFinite(vps) ? "non calculable" : vps > 0 ? SO.eur(vps, 2) : "0 € (dette > valeur)");
    SO.set("vRow", '<div><b>' + SO.eur(px, 2) + '</b><span>cours actuel</span></div><div><b class="' + (vps > px ? "up" : "down") + '">' + (vps > 0 ? SO.sgn(vps / px - 1, function (x) { return SO.pct(x, 0); }) : "—") + '</b><span>écart avec le cours</span></div><div><b>' + SO.pct(isFinite(tv) ? tv / ev : 0, 0) + '</b><span>de la valeur vient d\'après 10 ans</span></div>');
  }
  function load(k) { key = k; C = JSON.parse(JSON.stringify(PRESETS[k])); renderTable(); compute(); SO.$$("#presets [data-p]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.p === k); }); }
  document.getElementById("presets").addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (b) load(b.dataset.p); });
  document.getElementById("data").addEventListener("input", function (e) {
    var el = e.target; if (!el.dataset.r) return;
    C[el.dataset.r][+el.dataset.i] = SO.num(el.value);
    if (key === "mine") { PRESETS.mine = C; SO.store.set(MINE_KEY, C); }
    compute(); SO.used("analyse-entreprise");
  });
  ["cours", "actions", "nomE"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function (e) {
      if (id === "nomE") C.nom = e.target.value; else C[id] = SO.num(e.target.value);
      if (key === "mine") { PRESETS.mine = C; SO.store.set(MINE_KEY, C); }
      compute();
    });
  });
  ["g", "r", "gt"].forEach(function (id) { document.getElementById(id).addEventListener("input", compute); });
  load("ventor");
})();
