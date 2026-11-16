/* Rendement des dividendes, réinvestissement et revenu net */
(function () {
  "use strict";
  var F = SO.FISC;
  SO.form("#f", function (v) {
    var rd = v.cours > 0 ? v.dpa / v.cours : 0;
    SO.txt("rRd", SO.pct(rd, 2));
    var tax = v.env === "pea" ? 0 : v.env === "cto" ? F.pfu : 0, ans = Math.round(v.ans), g = v.crois / 100, cr = v.hausse / 100;
    // simulation annuelle : nombre de titres, dividende par action croissant, cours croissant
    var titres = v.cours > 0 ? v.capital / v.cours : 0, cours = v.cours, dpa = v.dpa, lab = [0], val = [v.capital], rev = [0], cum = 0, sansR = [v.capital], titres0 = titres, cumSans = 0;
    for (var a = 1; a <= ans; a++) {
      cours *= 1 + cr; dpa *= 1 + g;
      var brut = titres * dpa, net = brut * (1 - tax); cum += net;
      if (v.reinv) titres += net / cours;
      cumSans += titres0 * dpa * (1 - tax);
      lab.push(a); val.push(titres * cours); rev.push(net); sansR.push(titres0 * cours + cumSans);
    }
    var net1 = (v.capital > 0 ? v.capital * rd : 0) * (1 - tax);
    SO.set("rRow", '<div><b>' + SO.eur(net1) + '</b><span>dividendes nets la 1re année</span></div><div><b>' + SO.eur(net1 / 12) + '</b><span>par mois en moyenne</span></div><div><b>' + SO.eur(rev[ans]) + '</b><span>dividendes nets l\'année ' + ans + '</span></div><div><b>' + SO.pct(v.capital > 0 ? rev[ans] / v.capital : 0, 1) + '</b><span>rendement sur votre prix d\'achat en année ' + ans + '</span></div>');
    var vd = document.getElementById("verdict");
    if (rd > 0.08) { vd.textContent = "Un rendement au-dessus de 8 % est souvent un signal d'alerte : le marché doute que ce dividende soit maintenu. Vérifiez le taux de distribution avec l'outil d'analyse d'entreprise."; vd.className = "verdict warn"; }
    else { vd.textContent = v.env === "pea" ? "Dans un PEA, les dividendes sont réinvestis sans impôt tant que vous ne retirez rien." : v.env === "cto" ? "Sur un compte-titres, " + SO.pct(F.pfu, 1) + " sont prélevés sur chaque dividende (prélèvement forfaitaire 2026)." : "Montants avant impôt."; vd.className = "verdict"; }
    SO.chart("chart", { labels: lab, title: "Valeur de la ligne", series: [
      { name: v.reinv ? "Avec réinvestissement" : "Ligne + dividendes encaissés", data: v.reinv ? val : sansR, color: "var(--s1)", area: true },
      { name: "Sans réinvestir (ligne + dividendes cumulés)", data: sansR, color: "var(--s2)", dash: true }],
      xFmt: function (x) { return x ? "an " + x : "0"; }, tipTitle: function (x) { return "Année " + x; } });
    SO.bars("chart2", { labels: lab.slice(1).map(function (x) { return "an " + x; }), title: "Dividendes nets par an", series: [{ name: "Dividendes nets", data: rev.slice(1), color: "var(--s1)" }] });
  }, { tool: "dividendes" });
})();
