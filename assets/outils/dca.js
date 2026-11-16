/* Investissement programmé : d'un coup ou étalé, selon le scénario de marché */
(function () {
  "use strict";
  var seed = 7;
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  // trajectoires mensuelles de prix (base 100)
  function path(sc, n) {
    var p = [100], i, r = rng(seed), g = Math.pow(1.07, 1 / 12);
    for (i = 1; i <= n; i++) {
      var prev = p[i - 1], x;
      if (sc === "hausse") x = prev * g * (1 + 0.012 * Math.sin(i * 1.7));
      else if (sc === "reprise") x = i <= 12 ? 100 * Math.pow(0.70, i / 12) : prev * Math.pow(1.12, 1 / 12);
      else if (sc === "krach") x = i === 4 ? prev * 0.78 : i === 5 ? prev * 0.85 : prev * g;
      else if (sc === "longue") x = i <= 30 ? 100 * Math.pow(0.55, i / 30) : prev * Math.pow(1.10, 1 / 12);
      else if (sc === "plat") x = 100 * (1 + 0.18 * Math.sin(i / 5)) * (1 + 0.02 * Math.sin(i * 2.3));
      else { var z = Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r()); x = prev * Math.exp(0.07 / 12 - 0.5 * 0.0225 / 12 + 0.15 / Math.sqrt(12) * z); }
      p.push(x);
    }
    return p;
  }
  var form = SO.form("#f", function (v) {
    var n = Math.round(v.ans * 12), k = Math.max(1, Math.min(Math.round(v.etale), n)), S = v.somme, fr = v.frais / 100;
    document.getElementById("tirage").hidden = v.sc !== "alea";
    var p = path(v.sc, n);
    var partsL = S * (1 - fr) / p[0], partsD = 0, inv = 0, lump = [], dca = [], cash = [], i;
    for (i = 0; i <= n; i++) {
      if (i < k) { var a = S / k; partsD += a * (1 - fr) / p[i]; inv += a; }
      lump.push(partsL * p[i]); dca.push(partsD * p[i] + (S - inv)); cash.push(S);
    }
    var pru = inv / partsD * (1 - fr), avg = p.slice(0, k).reduce(function (s, x) { return s + x; }, 0) / k;
    var L = lump[n], D = dca[n], best = L >= D ? "d'un coup" : "en " + k + " fois";
    SO.txt("rBest", best);
    SO.set("rRow", '<div><b>' + SO.eur(L) + '</b><span>investi d\'un coup</span></div><div><b>' + SO.eur(D) + '</b><span>investi en ' + k + ' mois</span></div><div><b class="' + (D - L >= 0 ? "up" : "down") + '">' + SO.sgn(D - L, SO.eur) + '</b><span>écart de l\'étalement</span></div>');
    SO.set("insights", '<li>Prix moyen d\'achat de l\'étalement : <b>' + SO.n(pru, 1) + '</b>, contre un cours moyen de ' + SO.n(avg, 1) + ' sur la période (base 100 au départ). Acheter un montant fixe fait acheter plus de parts quand c\'est bas : votre prix moyen est toujours inférieur ou égal au cours moyen.</li>' +
      '<li>Plus bas de l\'investissement d\'un coup : ' + SO.eur(Math.min.apply(null, lump)) + ' (' + SO.pct(Math.min.apply(null, lump) / S - 1, 0) + '), de l\'étalement : ' + SO.eur(Math.min.apply(null, dca)) + ' (' + SO.pct(Math.min.apply(null, dca) / S - 1, 0) + ').</li>');
    SO.chart("chart", { labels: p.map(function (_, i) { return i; }), title: "Valeur du placement",
      series: [{ name: "D'un coup", data: lump, color: "var(--s2)" }, { name: "Étalé sur " + k + " mois", data: dca, color: "var(--s1)" }, { name: "Somme de départ", data: cash, color: "var(--muted)", dash: true }],
      xFmt: function (m) { return m % 12 ? "" : (m / 12) + " an" + (m >= 24 ? "s" : ""); }, tipTitle: function (m) { return "Mois " + m + " · cours " + SO.n(p[m], 1); } });
  }, { tool: "dca" });
  document.getElementById("tirage").addEventListener("click", function () { seed = Math.floor(Math.random() * 1e9); form.run(); });
})();
