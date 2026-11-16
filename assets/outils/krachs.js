/* Historique des krachs : ampleur, durée de baisse, temps de retour au sommet, et effet de continuer à investir.
   Données arrondies au mois, indices de prix (hors dividendes réinvestis), trajectoires simplifiées entre les points clés. */
(function () {
  "use strict";
  var K = [
    { id: "1929", nom: "Krach de 1929", ind: "Dow Jones", pic: "1929-09", creux: "1932-07", baisse: 0.89, retour: "1954-11", txt: "Bulle spéculative financée à crédit, puis faillites bancaires en chaîne et Grande Dépression. Le pire épisode de l'histoire boursière américaine." },
    { id: "1973", nom: "Choc pétrolier 1973-1974", ind: "S&P 500", pic: "1973-01", creux: "1974-10", baisse: 0.48, retour: "1980-07", txt: "Quadruplement du prix du pétrole, inflation à deux chiffres et récession. En tenant compte de l'inflation, la perte réelle a duré bien plus longtemps." },
    { id: "1987", nom: "Lundi noir 1987", ind: "S&P 500", pic: "1987-08", creux: "1987-12", baisse: 0.34, retour: "1989-07", txt: "Le 19 octobre 1987, l'indice perd environ 20 % en une seule séance, amplifié par des programmes de vente automatiques. L'économie, elle, ne plonge pas." },
    { id: "1990", nom: "Bulle japonaise", ind: "Nikkei 225", pic: "1989-12", creux: "2009-03", baisse: 0.82, retour: "2024-02", txt: "Bulle boursière et immobilière géante. Il a fallu 34 ans pour revoir le sommet de 1989 : la preuve qu'un seul pays, même riche, peut décevoir très longtemps." },
    { id: "2000us", nom: "Bulle internet", ind: "S&P 500", pic: "2000-03", creux: "2002-10", baisse: 0.49, retour: "2007-05", txt: "Les valeurs technologiques valaient des dizaines de fois leurs bénéfices, voire sans bénéfices. La baisse a duré deux ans et demi, sans un seul jour spectaculaire." },
    { id: "2000fr", nom: "Bulle internet", ind: "CAC 40", pic: "2000-09", creux: "2003-03", baisse: 0.65, retour: "2021-11", txt: "Le CAC 40, très exposé aux télécoms et à la technologie à l'époque, a mis plus de vingt ans à retrouver son sommet hors dividendes. Avec les dividendes réinvestis, le retour a été bien plus rapide." },
    { id: "2008us", nom: "Crise financière", ind: "S&P 500", pic: "2007-10", creux: "2009-03", baisse: 0.57, retour: "2013-03", txt: "Crise des crédits immobiliers à risque, faillite de Lehman Brothers en septembre 2008 et sauvetage des banques par les États." },
    { id: "2008fr", nom: "Crise financière", ind: "CAC 40", pic: "2007-06", creux: "2009-03", baisse: 0.59, retour: "2021-04", txt: "Enchaînée avec la crise des dettes européennes en 2011, la baisse a pesé longtemps sur les indices européens." },
    { id: "2020", nom: "Pandémie de Covid-19", ind: "S&P 500", pic: "2020-02", creux: "2020-03", baisse: 0.34, retour: "2020-08", txt: "La baisse la plus rapide de l'histoire : un tiers en cinq semaines, puis un rebond tout aussi rapide grâce aux soutiens massifs des banques centrales et des États." },
    { id: "2020fr", nom: "Pandémie de Covid-19", ind: "CAC 40", pic: "2020-02", creux: "2020-03", baisse: 0.39, retour: "2021-04", txt: "Plus touché que l'indice américain, le CAC 40 a mis un peu plus d'un an à revenir à son niveau de février 2020." },
    { id: "2022", nom: "Retour de l'inflation", ind: "S&P 500", pic: "2022-01", creux: "2022-10", baisse: 0.25, retour: "2024-01", txt: "Inflation au plus haut depuis 40 ans et remontée rapide des taux d'intérêt : actions et obligations ont baissé ensemble." }
  ];
  function mois(a, b) { var x = a.split("-"), y = b.split("-"); return (y[0] - x[0]) * 12 + (y[1] - x[1]); }
  function lbl(s) { var p = s.split("-"); return ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][p[1] - 1] + " " + p[0]; }
  K.forEach(function (k) { k.d = mois(k.pic, k.creux); k.r = mois(k.creux, k.retour); });
  var cur = K[8];
  function path(k) {
    var p = [], i, low = 1 - k.baisse, after = 24;
    for (i = 0; i <= k.d; i++) p.push(100 * Math.pow(low, i / k.d));
    for (i = 1; i <= k.r; i++) p.push(100 * low * Math.pow(1 / low, i / k.r));
    for (i = 1; i <= after; i++) p.push(100 * Math.pow(1.07, i / 12));
    return p;
  }
  function list() {
    SO.set("list", K.map(function (k) {
      return '<button type="button" class="crash" aria-pressed="' + (k === cur) + '" data-k="' + k.id + '"><span><b>' + k.nom + "</b><small>" + k.ind + " · " + lbl(k.pic) + " → " + lbl(k.creux) + '</small></span><b class="num">−' + Math.round(k.baisse * 100) + " %</b></button>";
    }).join(""));
  }
  var F = SO.form("#f", function (v) {
    var k = cur, p = path(k), n = p.length, inv = [], lump = [], dca = [], parts = 0, put = 0, back = -1;
    for (var i = 0; i < n; i++) {
      parts += v.mens / p[i]; put += v.mens;
      lump.push(v.somme * p[i] / 100);
      dca.push(parts * p[i]); inv.push(put);
      if (back < 0 && i > k.d && v.mens > 0 && parts * p[i] >= put) back = i;
    }
    SO.txt("rNom", k.nom + " (" + k.ind + ")");
    SO.set("rRow", '<div><b class="down">−' + Math.round(k.baisse * 100) + ' %</b><span>du sommet au creux</span></div><div><b>' + SO.duree(k.d) + '</b><span>de baisse</span></div><div><b>' + SO.duree(k.d + k.r) + '</b><span>pour revoir le sommet (' + lbl(k.retour) + ')</span></div>');
    SO.set("story", k.txt);
    SO.set("insights", '<li>Investis au pire moment, ' + SO.eur(v.somme) + ' tombent à <b>' + SO.eur(v.somme * (1 - k.baisse)) + '</b> au creux. Il faut ensuite <b>+' + Math.round((1 / (1 - k.baisse) - 1) * 100) + ' %</b> pour revenir au point de départ.</li>' +
      (v.mens > 0 ? '<li>En continuant à investir ' + SO.eur(v.mens) + ' chaque mois dès le sommet, votre portefeuille repasse au-dessus de vos versements après <b>' + (back >= 0 ? SO.duree(back) : "plus longtemps que la période affichée") + '</b>, contre ' + SO.duree(k.d + k.r) + ' pour l\'indice.</li>' : ""));
    var start = k.pic.split("-"), y0 = +start[0], m0 = +start[1] - 1;
    function date(i) { var m = m0 + i; return ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m % 12] + " " + (y0 + Math.floor(m / 12)); }
    SO.chart("chart", { labels: p.map(function (_, i) { return i; }), title: "Trajectoire simplifiée",
      series: [{ name: "Somme investie au sommet", data: lump, color: "var(--down)" }].concat(v.mens > 0 ? [{ name: "Versements mensuels cumulés", data: inv, color: "var(--muted)", dash: true }, { name: "Valeur avec versements mensuels", data: dca, color: "var(--s1)" }] : []),
      marks: [{ x: k.d, label: "creux" }, { x: k.d + k.r, label: "retour" }],
      xFmt: function (i) { return n > 40 ? String(y0 + Math.floor((m0 + i) / 12)) : date(i); }, tipTitle: function (i) { return date(i); } });
  }, { tool: "krachs" });
  document.getElementById("list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]"); if (!b) return;
    cur = K.filter(function (k) { return k.id === b.dataset.k; })[0]; list(); F.run();
  });
  SO.table("tab", ["Épisode", "Indice", "Baisse", "Durée de la baisse", "Retour au sommet"], K.map(function (k) { return [k.nom, k.ind, "−" + Math.round(k.baisse * 100) + " %", SO.duree(k.d), SO.duree(k.d + k.r) + " (" + lbl(k.retour) + ")"]; }));
  list(); F.run();
})();
