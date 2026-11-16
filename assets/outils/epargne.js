/* Épargne et intérêts composés (fusion du simulateur d'épargne et du calculateur de Pousse) */
(function () {
  "use strict";
  var detail = false;
  SO.form("#f", function (v) {
    var ans = Math.round(v.ans), ta = v.taux / 100, inf = v.inflation / 100, idx = v.index / 100;
    var s = SO.serie(v.depart, v.mensuel, ta, ans, { indexation: idx });
    var fin = s[ans], interets = fin.valeur - fin.verse, reel = fin.valeur / Math.pow(1 + inf, ans);
    SO.txt("rFin", SO.eur(fin.valeur));
    SO.set("rRow", '<div><b>' + SO.eur(fin.verse) + '</b><span>vous avez versé</span></div><div><b class="up">' + SO.eur(interets) + '</b><span>gagné en intérêts</span></div><div><b>' + SO.eur(reel) + '</b><span>en euros d\'aujourd\'hui (inflation ' + SO.n(v.inflation, 1) + ' %)</span></div>');
    var tard = SO.serie(v.depart, v.mensuel, ta, Math.max(0, ans - 10), { indexation: idx });
    var t = tard[tard.length - 1];
    var dbl = ta > 0 ? Math.log(2) / Math.log(1 + ta) : Infinity;
    SO.set("insights", '<li>Les intérêts représentent <b>' + SO.pct(fin.valeur ? interets / fin.valeur : 0, 0) + '</b> du capital final.</li>' +
      (ans > 10 ? '<li>En commençant <b>10 ans plus tard</b> avec les mêmes versements, vous auriez ' + SO.eur(t.valeur) + ', soit ' + SO.eur(fin.valeur - t.valeur) + ' de moins.</li>' : '') +
      '<li>À ' + SO.n(v.taux, 1) + ' % par an, une somme double en <b>' + (isFinite(dbl) ? SO.ans(dbl) : "jamais") + '</b> (règle de 72 : 72 ÷ ' + SO.n(v.taux, 1) + ' ≈ ' + (v.taux > 0 ? SO.n(72 / v.taux, 1) : "∞") + ' ans).</li>' +
      '<li>La dernière année, les intérêts rapportent ' + SO.eur(ans ? fin.valeur - s[ans - 1].valeur - (fin.verse - s[ans - 1].verse) : 0) + ', à comparer avec vos versements de ' + SO.eur(ans ? fin.verse - s[ans - 1].verse : 0) + '.</li>');
    SO.chart("chart", { labels: s.map(function (x) { return x.an; }), stacked: true, title: "Évolution du capital",
      series: [{ name: "Versements cumulés", data: s.map(function (x) { return x.verse; }), color: "var(--s2)" },
               { name: "Intérêts cumulés", data: s.map(function (x) { return x.valeur - x.verse; }), color: "var(--s1)" }],
      xFmt: function (a) { return a ? "an " + a : "0"; }, tipTitle: function (a) { return "Année " + a; },
      tipExtra: function (i) { return '<span>Total <em>' + SO.eur(s[i].valeur) + "</em></span>"; } });
    SO.table("tab", ["Année", "Versé cumulé", "Intérêts de l'année", "Intérêts cumulés", "Capital"], s.slice(1).map(function (x, i) {
      return [x.an, SO.eur(x.verse), SO.eur(x.valeur - s[i].valeur - (x.verse - s[i].verse)), SO.eur(x.valeur - x.verse), "<b>" + SO.eur(x.valeur) + "</b>"];
    }));
    SO.unlock("calc");
  }, { tool: "epargne" });
})();
