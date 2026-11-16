/* Impôt sur le revenu 2026 (revenus 2025) : impôt net, TMI, taux moyen, option barème des dividendes */
(function () {
  "use strict";
  var F = SO.FISC;
  function parts(v) {
    var couple = v.sit === "couple", p = couple ? 2 : 1, e = Math.max(0, Math.round(v.enfants));
    p += Math.min(e, 2) * 0.5 + Math.max(0, e - 2);
    if (!couple && e > 0 && v.isole) p += 0.5;
    return p;
  }
  SO.form("#f", function (v) {
    var couple = v.sit === "couple", P = parts(v), R = Math.max(0, v.rev), r = SO.impot(R, P, couple);
    SO.txt("rImp", SO.eur(r.net));
    SO.set("rRow", '<div><b>' + SO.n(r.tmi * 100, 0) + ' %</b><span>tranche marginale (TMI)</span></div><div><b>' + SO.pct(r.moyen, 1) + '</b><span>taux moyen</span></div><div><b>' + SO.n(P, 1) + '</b><span>parts fiscales</span></div>' + (r.decote ? '<div><b>' + SO.eur(r.decote) + '</b><span>décote</span></div>' : '') + (r.avantQF ? '<div><b>' + SO.eur(r.avantQF) + '</b><span>gain des parts' + (r.plafonne ? ' (plafonné)' : '') + '</span></div>' : ''));
    // impôt par tranche (sur le quotient, multiplié par les parts, avant décote et plafonnement)
    var q = R / P, prev = 0, lab = [], dat = [];
    F.bareme.forEach(function (t) { var h = Math.min(q, t[0]), base = Math.max(0, h - prev); lab.push(SO.n(t[1] * 100, 0) + " %"); dat.push(base * P); prev = t[0]; });
    SO.bars("chart", { labels: lab, title: "Revenu imposé dans chaque tranche", series: [{ name: "Revenu dans la tranche", data: dat, color: function (_, i) { return SO.COL[[5, 0, 1, 2, 4][i]]; } }],
      tipFmt: function (x, i) { return SO.eur(x) + " → " + SO.eur(x * F.bareme[i][1]) + " d'impôt"; } });
    var plus = SO.impot(R + 1000, P, couple).net - r.net;
    SO.set("insights", '<li>Avec 1 000 € de revenu imposable en plus, votre impôt augmenterait de <b>' + SO.eur(plus) + '</b>.</li><li>Chaque euro versé sur un PER (dans la limite du plafond) vous ferait économiser environ <b>' + SO.n(r.tmi * 100, 0) + ' centimes</b>.</li>');
    // dividendes : prélèvement forfaitaire ou barème
    var D = Math.max(0, v.div);
    if (D > 0) {
      var pfu = D * F.ir, bar = SO.impot(R + D * 0.6, P, couple).net - r.net, csgDed = 0.068 * D * r.tmi; // CSG déductible l'année suivante, si option barème
      var barNet = bar - csgDed, better = barNet < pfu;
      SO.set("divOut", '<div class="out-grid"><div><b>' + SO.eur(pfu) + '</b><span>impôt au prélèvement forfaitaire (12,8 %)</span></div><div><b>' + SO.eur(barNet) + '</b><span>impôt au barème (abattement 40 %, CSG déductible)</span></div><div><b>' + SO.eur(D * F.ps) + '</b><span>prélèvements sociaux, identiques dans les deux cas</span></div></div><p class="verdict ' + (better ? "ok" : "") + '">' + (better ? "Le barème est plus avantageux ici, de " + SO.eur(pfu - barNet) + ". L'option se coche case 2OP et vaut pour tous vos revenus de placement de l'année." : "Le prélèvement forfaitaire est plus avantageux ici (ou équivalent) : rien à cocher.") + "</p>");
    } else SO.set("divOut", '<p class="hint">Indiquez un montant de dividendes pour comparer les deux options.</p>');
  }, { tool: "impot" });
})();
