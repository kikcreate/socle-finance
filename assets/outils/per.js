/* PER : économie d'impôt à l'entrée, plafond de déduction, capital et fiscalité à la sortie */
(function () {
  "use strict";
  var F = SO.FISC;
  SO.form("#f", function (v) {
    var couple = v.sit === "couple", P = Math.max(1, v.parts), R = Math.max(0, v.rev);
    var plafond = Math.min(Math.max(v.pro * 0.10, F.pass2025 * 0.10), F.pass2025 * 8 * 0.10) + Math.max(0, v.report);
    var ded = Math.min(v.versement, plafond), sans = SO.impot(R, P, couple), avec = SO.impot(Math.max(0, R - ded), P, couple);
    var eco = sans.net - avec.net, effort = v.versement - eco;
    SO.txt("rEco", SO.eur(eco));
    SO.set("rRow", '<div><b>' + SO.eur(effort) + '</b><span>effort réel pour ' + SO.eur(v.versement) + ' versés</span></div><div><b>' + SO.eur(plafond) + '</b><span>plafond de déduction estimé</span></div><div><b>' + SO.n(sans.tmi * 100, 0) + ' %</b><span>votre TMI actuelle</span></div>');
    var vd = document.getElementById("verdict");
    if (v.versement > plafond) { vd.textContent = "Attention : " + SO.eur(v.versement - plafond) + " dépassent votre plafond et ne seront pas déduits (mais ils seront tout de même imposés à la sortie, sauf option de non-déduction)."; vd.className = "verdict warn"; }
    else if (sans.tmi <= 0.11) { vd.textContent = "Avec une TMI de " + SO.n(sans.tmi * 100, 0) + " %, l'économie d'impôt est faible alors que les sommes seront imposées à la sortie. Un PEA ou une assurance-vie est souvent plus souple à ce niveau de revenu."; vd.className = "verdict warn"; }
    else { vd.textContent = "Chaque euro versé ne vous coûte que " + SO.n(effort / Math.max(1, v.versement), 2) + " €. L'intérêt dépend surtout de votre taux d'imposition à la retraite."; vd.className = "verdict ok"; }
    // projection
    var ans = Math.max(1, Math.round(v.ans)), s = SO.serie(0, v.versement / 12, v.rdt / 100, ans), fin = s[ans];
    var gain = fin.valeur - fin.verse, taxe = fin.verse * v.tmiR / 100 + gain * F.pfu, ecoTot = eco * ans;
    SO.set("sortie", '<div class="out-grid"><div><b>' + SO.eur(fin.valeur) + '</b><span>capital au départ en retraite</span></div><div><b>' + SO.eur(taxe) + '</b><span>impôts à la sortie en capital</span></div><div><b>' + SO.eur(fin.valeur - taxe) + '</b><span>net en poche</span></div><div><b class="up">' + SO.eur(ecoTot) + '</b><span>impôt économisé pendant ' + SO.ans(ans) + ' (revenus constants)</span></div></div>');
    SO.chart("chart", { labels: s.map(function (x) { return x.an; }), title: "Capital du PER", series: [
      { name: "Versements cumulés", data: s.map(function (x) { return x.verse; }), color: "var(--s2)" },
      { name: "Capital", data: s.map(function (x) { return x.valeur; }), color: "var(--s3)", area: true },
      { name: "Effort réel cumulé", data: s.map(function (x) { return x.verse - eco * x.an; }), color: "var(--s1)", dash: true }],
      xFmt: function (a) { return a ? "an " + a : "0"; }, tipTitle: function (a) { return "Année " + a; } });
  }, { tool: "per" });
})();
