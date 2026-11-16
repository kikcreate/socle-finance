/* Comparer PEA, compte-titres, assurance-vie, PER et Livret A après frais et fiscalité de sortie */
(function () {
  "use strict";
  var F = SO.FISC;
  function irr(flows) { // flux mensuels, renvoie un taux annuel
    var lo = -0.99, hi = 1, k;
    function npv(r) { var m = Math.pow(1 + r, 1 / 12) - 1, s = 0; for (var i = 0; i < flows.length; i++) s += flows[i] / Math.pow(1 + m, i); return s; }
    for (k = 0; k < 120; k++) { var mid = (lo + hi) / 2; if (npv(mid) > 0) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  // simulation mois par mois ; opts : frais annuels, part distribuée imposée chaque année (CTO), taux fixe (livret)
  function grow(v, opts) {
    var n = Math.round(v.ans * 12), rb = opts.taux != null ? opts.taux : v.rdt / 100;
    var rNet = SO.tm(rb - (opts.frais || 0)), V = v.init, base = v.init, verse = v.init, impAn = 0, k;
    var dy = opts.dist ? v.dist / 100 : 0;
    for (k = 1; k <= n; k++) {
      V *= 1 + rNet;
      if (dy && k % 12 === 0) { var d = V * dy, t = d * F.pfu; V -= t; impAn += t; base += d - t; }
      V += v.mens; base += v.mens; verse += v.mens;
    }
    return { V: V, base: base, verse: verse, impAn: impAn, n: n };
  }
  SO.form("#f", function (v) {
    var res = [], n = Math.round(v.ans * 12), couple = v.sit === "couple";
    // CTO
    var c = grow(v, { dist: true, frais: v.fCto / 100 }), pv = Math.max(0, c.V - c.base), tC = pv * F.pfu;
    res.push({ k: "Compte-titres", brut: c.V, imp: tC + c.impAn, net: c.V - tC, verse: c.verse, note: "dividendes imposés chaque année (" + SO.eur(c.impAn) + "), plus-value à " + SO.pct(F.pfu, 1) });
    // PEA
    var p = grow(v, { frais: v.fPea / 100 }), gP = Math.max(0, p.V - p.verse), tP = gP * (v.ans >= 5 ? F.ps : F.pfu);
    res.push({ k: "PEA", brut: p.V, imp: tP, net: p.V - tP, verse: p.verse, note: v.ans >= 5 ? "après 5 ans : " + SO.pct(F.ps, 1) + " de prélèvements sociaux seulement" : "retrait avant 5 ans : " + SO.pct(F.pfu, 1) + " et clôture du plan", warn: p.verse > F.pea.plafond ? "versements au-delà du plafond de " + SO.eur(F.pea.plafond) : "" });
    // Assurance-vie
    var a = grow(v, { frais: v.fAv / 100 }), gA = Math.max(0, a.V - a.verse), tA;
    if (v.ans < 8) tA = gA * F.pfuAV;
    else {
      var over = Math.max(0, a.verse - F.avSeuil) / a.verse, abat = couple ? F.avAbat.couple : F.avAbat.seul;
      tA = gA * F.psAV + Math.max(0, gA - abat) * (over * F.ir + (1 - over) * F.av8);
    }
    res.push({ k: "Assurance-vie", brut: a.V, imp: tA, net: a.V - tA, verse: a.verse, note: v.ans >= 8 ? "après 8 ans : abattement de " + SO.eur(couple ? F.avAbat.couple : F.avAbat.seul) + " puis 7,5 %, et " + SO.pct(F.psAV, 1) + " de prélèvements sociaux" : "avant 8 ans : " + SO.pct(F.pfuAV, 0) + " sur les gains" });
    // PER
    var r = grow(v, { frais: v.fPer / 100 }), gR = Math.max(0, r.V - r.verse), tR = r.verse * v.tmiR / 100 + gR * F.pfu, eco = r.verse * v.tmi / 100;
    res.push({ k: "PER (sortie en capital)", brut: r.V, imp: tR, net: r.V - tR, extra: eco, verse: r.verse, note: "versements déduits à " + v.tmi + " % puis imposés à " + v.tmiR + " % à la sortie, gains à " + SO.pct(F.pfu, 1) + " ; bloqué jusqu'à la retraite sauf cas prévus" });
    // Livret A
    var l = grow(v, { taux: F.livretA.taux });
    res.push({ k: "Livret A", brut: l.V, imp: 0, net: l.V, verse: l.verse, note: "taux actuel " + SO.pct(F.livretA.taux, 1) + " supposé constant, sans impôt", warn: l.verse > F.livretA.plafond ? "dépasse le plafond de " + SO.eur(F.livretA.plafond) : "" });
    res.forEach(function (x) {
      var fl = [-v.init]; for (var i = 1; i < n; i++) fl.push(-v.mens); fl.push(-v.mens + x.net + (x.extra || 0));
      if (n === 0) fl = [-v.init, x.net]; x.irr = irr(fl);
    });
    var best = res.slice().sort(function (x, y) { return (y.net + (y.extra || 0)) - (x.net + (x.extra || 0)); })[0];
    SO.txt("rBest", best.k);
    SO.set("rRow", '<div><b>' + SO.eur(best.net + (best.extra || 0)) + '</b><span>net en poche' + (best.extra ? ", économies d'impôt comprises" : "") + '</span></div><div><b>' + SO.pct(best.irr, 2) + '</b><span>rendement net annuel</span></div><div><b>' + SO.eur(res[0].verse) + '</b><span>versé au total</span></div>');
    SO.table("tab", ["Enveloppe", "Valeur avant impôt", "Impôts et prélèvements", "Net en poche", "Rendement net / an"], res.map(function (x) {
      return ["<b>" + x.k + "</b><br><span class=\"hint\">" + x.note + (x.warn ? ' · <span class="down">' + x.warn + "</span>" : "") + "</span>", SO.eur(x.brut), SO.eur(x.imp), "<b>" + SO.eur(x.net) + "</b>" + (x.extra ? '<br><span class="hint">+ ' + SO.eur(x.extra) + " d'impôt économisé</span>" : ""), SO.pct(x.irr, 2)];
    }));
    SO.bars("chart", { labels: res.map(function (x) { return x.k.replace(" (sortie en capital)", ""); }), stacked: true, title: "Net en poche par enveloppe",
      series: [{ name: "Versé", data: res.map(function (x) { return x.verse; }), color: "var(--s2)" },
               { name: "Gain net", data: res.map(function (x) { return x.net - x.verse; }), color: "var(--s1)" },
               { name: "Économie d'impôt (PER)", data: res.map(function (x) { return x.extra || 0; }), color: "var(--s3)" },
               { name: "Impôts et prélèvements", data: res.map(function (x) { return x.imp; }), color: "var(--s4)" }] });
  }, { tool: "enveloppes" });
})();
