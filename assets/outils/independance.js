/* Indépendance financière : capital cible (règle des 4 %) et date d'atteinte */
(function () {
  "use strict";
  SO.form("#f", function (v) {
    var dep = v.dep * 12 - v.autres * 12, tr = v.retrait / 100, cible = Math.max(0, dep) / tr, r = v.rdt / 100;
    var ep = Math.max(0, v.rev - v.dep), taux = v.rev > 0 ? ep / v.rev : 0;
    // mois nécessaires (rendement réel, versements constants en euros d'aujourd'hui)
    var m = 0, V = v.capital, rm = SO.tm(r), lab = [0], ser = [V], cib = [cible];
    while (V < cible && m < 12 * 80) { V = V * (1 + rm) + ep; m++; if (m % 12 === 0) { lab.push(m / 12); ser.push(V); cib.push(cible); } }
    if (m % 12) { lab.push(Math.ceil(m / 12)); ser.push(V); cib.push(cible); }
    var ok = V >= cible;
    SO.txt("rCible", SO.eur(cible));
    SO.set("rRow", '<div><b>' + (ok ? SO.duree(m) : "plus de 80 ans") + '</b><span>pour y arriver</span></div><div><b>' + (ok && v.age ? Math.floor(v.age + m / 12) + " ans" : "—") + '</b><span>âge à l\'atteinte</span></div><div><b>' + SO.pct(taux, 0) + '</b><span>taux d\'épargne (' + SO.eur(ep) + '/mois)</span></div>');
    SO.chart("chart", { labels: lab, title: "Capital vers l'indépendance", series: [{ name: "Capital, en euros d'aujourd'hui", data: ser, color: "var(--s1)", area: true }, { name: "Capital cible", data: cib, color: "var(--s4)", dash: true }],
      xFmt: function (x) { return x ? x + " an" + (x > 1 ? "s" : "") : "0"; }, tipTitle: function (x) { return "Dans " + x + " an" + (x > 1 ? "s" : ""); } });
    // tableau taux d'épargne -> années
    var rows = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7].map(function (t) {
      var e = v.rev * t, d = v.rev * (1 - t) * 12 - v.autres * 12, c = Math.max(0, d) / tr, X = v.capital, k = 0;
      while (X < c && k < 960) { X = X * (1 + rm) + e; k++; }
      return [SO.pct(t, 0), SO.eur(e), SO.eur(c), k >= 960 ? "plus de 80 ans" : SO.duree(k)];
    });
    SO.table("tab", ["Taux d'épargne", "Épargne / mois", "Capital cible", "Durée"], rows);
  }, { tool: "independance" });
})();
