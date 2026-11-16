/* Impact des frais sur le long terme */
(function () {
  "use strict";
  SO.form("#f", function (v) {
    var ans = Math.round(v.ans), r = v.rdt / 100, fA = v.fA / 100, fB = v.fB / 100, entree = v.entree / 100;
    var A = SO.serie(v.init * (1 - entree), v.mens * (1 - entree), r - fA, ans), B = SO.serie(v.init, v.mens, r - fB, ans), Z = SO.serie(v.init, v.mens, r, ans);
    var a = A[ans].valeur, b = B[ans].valeur, z = Z[ans].valeur;
    SO.txt("rDiff", SO.eur(b - a));
    SO.set("rRow", '<div><b>' + SO.eur(a) + '</b><span>placement A (' + SO.n(v.fA, 2) + ' %/an' + (v.entree ? ' + ' + SO.n(v.entree, 1) + ' % à l\'entrée' : '') + ')</span></div><div><b>' + SO.eur(b) + '</b><span>placement B (' + SO.n(v.fB, 2) + ' %/an)</span></div><div><b>' + SO.pct(z ? (z - a) / (z - Z[ans].verse || 1) : 0, 0) + '</b><span>des gains sans frais absorbés par les frais de A</span></div>');
    SO.chart("chart", { labels: A.map(function (x) { return x.an; }), title: "Capital selon les frais", series: [
      { name: "Sans aucun frais", data: Z.map(function (x) { return x.valeur; }), color: "var(--muted)", dash: true },
      { name: "Placement B", data: B.map(function (x) { return x.valeur; }), color: "var(--s1)" },
      { name: "Placement A", data: A.map(function (x) { return x.valeur; }), color: "var(--s4)" }],
      xFmt: function (x) { return x ? "an " + x : "0"; }, tipTitle: function (x) { return "Année " + x; } });
    var lev = [0.1, 0.25, 0.5, 1, 1.5, 2, 2.5, 3].map(function (f) { var s = SO.serie(v.init, v.mens, r - f / 100, ans)[ans].valeur; return [SO.n(f, 2) + " %", SO.eur(s), SO.eur(z - s), SO.pct(z ? (z - s) / z : 0, 0)]; });
    SO.table("tab", ["Frais annuels", "Capital final", "Coût total des frais", "Perte par rapport à zéro frais"], lev);
  }, { tool: "frais" });
})();
