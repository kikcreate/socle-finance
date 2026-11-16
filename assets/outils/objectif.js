/* Objectif financier : effort d'épargne mensuel pour atteindre un montant */
(function () {
  "use strict";
  SO.form("#f", function (v) {
    var ans = Math.max(0.5, v.ans), n = Math.round(ans * 12), ta = v.taux / 100;
    var cible = v.reel ? v.cible * Math.pow(1 + v.inflation / 100, ans) : v.cible;
    var p = Math.max(0, SO.pmtFor(cible, v.deja, ta, n)), p0 = Math.max(0, (cible - v.deja) / n);
    var verse = v.deja + p * n, gain = cible - verse;
    SO.txt("rP", SO.eur(p));
    SO.set("rRow", '<div><b>' + SO.eur(p0) + '</b><span>sans aucun rendement</span></div><div><b class="up">' + SO.eur(Math.max(0, gain)) + '</b><span>apportés par les intérêts</span></div>' + (v.reel ? '<div><b>' + SO.eur(cible) + '</b><span>montant à viser, inflation incluse</span></div>' : ''));
    var vd = document.getElementById("verdict");
    if (v.deja >= cible || p === 0) { vd.textContent = "Votre capital actuel suffit déjà à atteindre l'objectif avec ce rendement."; vd.className = "verdict ok"; }
    else if (ans < 3 && ta > 0.03) { vd.textContent = "Sous 3 ans, viser " + SO.n(v.taux, 1) + " % suppose de prendre un risque de perte. Pour un projet aussi proche, comptez plutôt sur un livret (" + SO.n(SO.FISC.livretA.taux * 100, 1) + " % aujourd'hui) et l'effort de " + SO.eur(SO.pmtFor(cible, v.deja, SO.FISC.livretA.taux, n)) + " par mois."; vd.className = "verdict warn"; }
    else { vd.textContent = "Avec " + SO.eur(p) + " par mois pendant " + SO.ans(ans) + ", le rendement fait " + SO.pct(cible ? Math.max(0, gain) / cible : 0, 0) + " du chemin."; vd.className = "verdict ok"; }
    var labels = [], a = [], b = [], c = [], r = SO.tm(ta), x = v.deja, y = v.deja;
    for (var m = 0; m <= n; m++) {
      if (m % 12 === 0 || m === n) { labels.push(m); a.push(x); b.push(y); c.push(cible); }
      x = x * (1 + r) + p; y += p;
    }
    SO.chart("chart", { labels: labels, title: "Trajectoire vers l'objectif",
      series: [{ name: "Avec rendement", data: a, color: "var(--s1)", area: true }, { name: "Versements seuls", data: b, color: "var(--s2)" }, { name: "Objectif", data: c, color: "var(--s4)", dash: true }],
      xFmt: function (m) { return m ? Math.round(m / 12 * 10) / 10 + " an" + (m >= 24 ? "s" : "") : "0"; }, tipTitle: function (m) { return "Après " + SO.duree(m); } });
    var rows = [["Livret A", SO.FISC.livretA.taux], ["Fonds euros (≈ 2,5 %)", 0.025], ["Profil équilibré (≈ 4 %)", 0.04], ["Actions monde (≈ 7 %)", 0.07]].map(function (o) {
      return [o[0], SO.eur(Math.max(0, SO.pmtFor(cible, v.deja, o[1], n))), ans < 5 && o[1] > 0.03 ? '<span class="pill-st on">risqué à cet horizon</span>' : '<span class="pill-st ok">adapté</span>'];
    });
    SO.table("tab", ["Support (rendement supposé)", "Effort mensuel", "À " + SO.ans(ans)], rows);
  }, { tool: "objectif" });
})();
