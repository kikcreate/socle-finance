/* Budget 50/30/20 et épargne de précaution */
(function () {
  "use strict";
  SO.form("#f", function (v) {
    var rev = Math.max(0, v.rev), besoins = v.loyer + v.fixes, envies = v.envies;
    var cible = { b: rev * 0.5, e: rev * 0.3, s: rev * 0.2 };
    var reste = rev - besoins - envies;
    SO.txt("rS", SO.eur(cible.s));
    SO.set("rRow", '<div><b>' + SO.eur(cible.b) + '</b><span>besoins (50 %)</span></div><div><b>' + SO.eur(cible.e) + '</b><span>envies (30 %)</span></div><div><b>' + SO.eur(cible.s) + '</b><span>épargne (20 %)</span></div>');
    var tot = Math.max(rev, besoins + envies + Math.max(0, reste)) || 1;
    function seg(x, c, l) { var w = Math.max(0, x) / tot * 100; return w > 0 ? '<div style="width:' + w + '%;background:' + c + '" title="' + l + '">' + (w > 12 ? l + " " + Math.round(w) + " %" : "") + "</div>" : ""; }
    SO.set("split", seg(besoins, "var(--s2)", "Besoins") + seg(envies, "var(--s4)", "Envies") + seg(reste, "var(--s1)", "Épargne"));
    var msg, cls;
    if (!rev) { msg = "Indiquez votre revenu net mensuel."; cls = ""; }
    else if (reste < 0) { msg = "Vos dépenses dépassent vos revenus de " + SO.eur(-reste) + " par mois. Commencez par lister les dépenses d'envies que vous pouvez réduire."; cls = "ko"; }
    else if (besoins > cible.b * 1.1) { msg = "Vos besoins pèsent " + SO.pct(besoins / rev, 0) + " de votre revenu. C'est fréquent quand le loyer est élevé : la règle s'adapte alors en 60/20/20 ou 70/10/20. Vous pouvez épargner " + SO.eur(reste) + " par mois."; cls = "warn"; }
    else if (reste >= cible.s) { msg = "Vous pouvez épargner " + SO.eur(reste) + " par mois, soit " + SO.pct(reste / rev, 0) + " de votre revenu. C'est au moins l'objectif de 20 %."; cls = "ok"; }
    else { msg = "Vous épargnez " + SO.eur(reste) + " par mois, soit " + SO.pct(reste / rev, 0) + ". Il manque " + SO.eur(cible.s - reste) + " pour atteindre 20 %."; cls = "warn"; }
    var vd = document.getElementById("verdict"); vd.textContent = msg; vd.className = "verdict " + cls;
    SO.bars("chart", { labels: ["Besoins", "Envies", "Épargne"], series: [
      { name: "Repère 50/30/20", data: [cible.b, cible.e, cible.s], color: "var(--line)" },
      { name: "Votre situation", data: [besoins, envies, Math.max(0, reste)], color: "var(--s3)" }], legend: true });
    // épargne de précaution
    var mois = v.mois, cibleP = (besoins + (v.inclEnvies ? envies : 0)) * mois, manque = Math.max(0, cibleP - v.dejaP);
    var eff = Math.max(0, reste), dur = manque <= 0 ? 0 : eff > 0 ? Math.ceil(manque / eff) : Infinity;
    SO.txt("pCible", SO.eur(cibleP));
    SO.set("pRow", '<div><b>' + SO.eur(manque) + '</b><span>reste à constituer</span></div><div><b>' + (dur === 0 ? "déjà atteinte" : SO.duree(dur)) + '</b><span>en y mettant toute votre épargne</span></div><div><b>' + (manque > SO.FISC.livretA.plafond ? "Livret A + LDDS" : "Livret A") + '</b><span>support conseillé, sans risque</span></div>');
    SO.unlock("budget");
  }, { tool: "budget" });
})();
