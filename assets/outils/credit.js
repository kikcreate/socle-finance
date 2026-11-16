/* Crédit immobilier : mensualité, coût, tableau d'amortissement, capacité d'emprunt, TAEG approché */
(function () {
  "use strict";
  var mensuel = false;
  function taeg(net, flux) { // taux actuariel annuel à partir des flux mensuels
    var lo = 0, hi = 1, k, j;
    for (k = 0; k < 100; k++) {
      var mid = (lo + hi) / 2, r = Math.pow(1 + mid, 1 / 12) - 1, pv = 0;
      for (j = 0; j < flux.length; j++) pv += flux[j] / Math.pow(1 + r, j + 1);
      if (pv > net) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  var F = SO.form("#f", function (v) {
    var cap = v.mode === "capa";
    SO.$$("[data-m]").forEach(function (e) { e.hidden = e.dataset.m !== v.mode; });
    var n = Math.round(v.ans * 12), t = v.taux / 100, ta = v.assu / 100, montant, m;
    if (cap) {
      var maxM = Math.max(0, v.revenus * SO.FISC.endettement - v.charges);
      var mAss = function (c) { return c * ta / 12; };
      var unit = SO.mensualite(1, t, n) + ta / 12;
      montant = maxM / unit;
      SO.txt("rBig", SO.eur(Math.floor(montant / 100) * 100));
      SO.txt("rLbl", "Vous pouvez emprunter environ");
      m = SO.mensualite(montant, t, n);
    } else {
      montant = Math.max(0, v.montant);
      m = SO.mensualite(montant, t, n);
      SO.txt("rBig", SO.eur(m + montant * ta / 12, 2));
      SO.txt("rLbl", "Mensualité, assurance comprise");
    }
    var ass = montant * ta / 12, tot = m + ass;
    // tableau d'amortissement
    var crd = montant, rows = [], ann = [], ya = { cap: 0, int: 0, ass: 0 }, i, tInt = 0;
    for (i = 1; i <= n; i++) {
      var it = crd * t / 12, pc = m - it; crd = Math.max(0, crd - pc); tInt += it;
      ya.cap += pc; ya.int += it; ya.ass += ass;
      rows.push([i, SO.eur(m, 2), SO.eur(pc, 2), SO.eur(it, 2), SO.eur(ass, 2), SO.eur(crd, 0)]);
      if (i % 12 === 0 || i === n) { ann.push({ an: Math.ceil(i / 12), cap: ya.cap, int: ya.int, ass: ya.ass, crd: crd }); ya = { cap: 0, int: 0, ass: 0 }; }
    }
    var frais = v.fraisDossier + v.garantie, flux = [];
    for (i = 0; i < n; i++) flux.push(tot);
    var tg = montant > 0 ? taeg(montant - frais, flux) : 0;
    SO.set("rRow", (cap ? '<div><b>' + SO.eur(tot, 0) + '</b><span>mensualité maximale</span></div>' : '') +
      '<div><b>' + SO.eur(tInt) + '</b><span>coût des intérêts</span></div><div><b>' + SO.eur(ass * n) + '</b><span>coût de l\'assurance</span></div>' +
      '<div><b>' + SO.eur(montant + tInt + ass * n + frais) + '</b><span>remboursé au total, frais inclus</span></div>' +
      (cap ? '' : '<div><b>' + SO.eur(tot / SO.FISC.endettement) + '</b><span>revenu net conseillé (35 %)</span></div>') +
      '<div><b>' + SO.pct(tg, 2) + '</b><span>TAEG approché</span></div>');
    SO.bars("chart", { labels: ann.map(function (a) { return "an " + a.an; }), stacked: true, title: "Répartition des remboursements par année",
      series: [{ name: "Capital remboursé", data: ann.map(function (a) { return a.cap; }), color: "var(--s2)" }, { name: "Intérêts", data: ann.map(function (a) { return a.int; }), color: "var(--s4)" }, { name: "Assurance", data: ann.map(function (a) { return a.ass; }), color: "var(--s3)" }] });
    var yr = ann.map(function (a) { return [a.an, SO.eur(a.cap + a.int + a.ass), SO.eur(a.cap), SO.eur(a.int), SO.eur(a.ass), SO.eur(a.crd)]; });
    SO.table("tab", [mensuel ? "Mois" : "Année", mensuel ? "Mensualité" : "Payé", "Capital", "Intérêts", "Assurance", "Reste dû"], mensuel ? rows : yr);
    var half = 0; for (i = 0; i < ann.length; i++) { half += ann[i].cap; if (half >= montant / 2) break; }
    SO.set("insights", '<li>La première année, <b>' + SO.pct(ann[0] ? ann[0].int / (ann[0].cap + ann[0].int) : 0, 0) + '</b> de vos remboursements (hors assurance) paient des intérêts.</li><li>Vous aurez remboursé la moitié du capital au bout de <b>' + SO.ans(i + 1) + '</b> sur ' + SO.ans(v.ans) + '.</li><li>Sur 5 ans de plus, la mensualité baisserait de ' + SO.eur(m - SO.mensualite(montant, t, n + 60)) + ' mais les intérêts augmenteraient de ' + SO.eur(SO.mensualite(montant, t, n + 60) * (n + 60) - montant - tInt) + '.</li>');
  }, { tool: "credit" });
  document.getElementById("gran").addEventListener("click", function () { mensuel = !mensuel; this.textContent = mensuel ? "Voir par année" : "Voir mois par mois"; F.run(); });
})();
