/* Inflation : pouvoir d'achat et rendement réel */
(function () {
  "use strict";
  SO.form("#f", function (v) {
    var i = v.inf / 100, r = v.rdt / 100, ans = Math.round(v.ans);
    var pa = v.somme / Math.pow(1 + i, ans), reel = (1 + r) / (1 + i) - 1, fut = v.somme * Math.pow(1 + r, ans), futR = fut / Math.pow(1 + i, ans);
    SO.txt("rPa", SO.eur(pa));
    SO.set("rRow", '<div><b>' + SO.pct(1 - pa / v.somme || 0, 0) + '</b><span>de pouvoir d\'achat perdu sans placement</span></div><div><b class="' + (reel >= 0 ? "up" : "down") + '">' + SO.pct(reel, 2) + '</b><span>rendement réel de votre placement</span></div><div><b>' + SO.eur(futR) + '</b><span>placé à ' + SO.n(v.rdt, 1) + ' %, en euros d\'aujourd\'hui</span></div><div><b>' + SO.eur(v.somme * Math.pow(1 + i, ans)) + '</b><span>prix futur de ce qui coûte ' + SO.eur(v.somme) + ' aujourd\'hui</span></div>');
    var lab = [], a = [], b = [], c = [];
    for (var k = 0; k <= ans; k++) { lab.push(k); a.push(v.somme / Math.pow(1 + i, k)); b.push(v.somme * Math.pow(1 + r, k) / Math.pow(1 + i, k)); c.push(v.somme); }
    SO.chart("chart", { labels: lab, title: "Pouvoir d'achat", series: [
      { name: "Montant affiché", data: c, color: "var(--muted)", dash: true },
      { name: "Argent qui dort, en euros d'aujourd'hui", data: a, color: "var(--down)" },
      { name: "Placé à " + SO.n(v.rdt, 1) + " %, en euros d'aujourd'hui", data: b, color: "var(--s1)" }],
      xFmt: function (x) { return x ? "an " + x : "0"; }, tipTitle: function (x) { return "Année " + x; } });
  }, { tool: "inflation" });
})();
