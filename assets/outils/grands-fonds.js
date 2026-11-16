/* Positions des grands fonds : lire une déclaration trimestrielle, repérer les entrées, sorties, renforcements et allègements.
   Les trois fonds proposés et leurs lignes sont fictifs. Le mode « Comparer deux listes » fonctionne avec de vraies données collées. */
(function () {
  "use strict";
  // [nom, secteur, valeur T2 (M$), valeur T3 (M$), variation du nombre de titres en %] ; null = absente du trimestre
  var FONDS = {
    patient: { nom: "Fonds Patience (fictif)", style: "Gestion concentrée, horizon long", lignes: [
      ["Orbis Logiciels", "Technologie", 4200, 4650, 0], ["Valmont Paiements", "Finance", 2900, 3120, 5], ["Norren Assurances", "Finance", 2300, 2250, 0], ["Kessel Boissons", "Consommation", 1800, 1710, -12],
      ["Altamar Santé", "Santé", 1500, 1880, 18], ["Brévine Chemins de fer", "Industrie", 1200, 1240, 0], ["Ostra Médias", "Communication", 950, null, -100], ["Lumio Semi-conducteurs", "Technologie", null, 820, null],
      ["Pallas Énergie", "Énergie", 640, 600, -5], ["Corvin Distribution", "Consommation", 520, 540, 0] ] },
    quant: { nom: "Fonds Équilibre Mondial (fictif)", style: "Très diversifié, proche des indices", lignes: [
      ["Orbis Logiciels", "Technologie", 3100, 3350, 1], ["Lumio Semi-conducteurs", "Technologie", 2600, 2950, 2], ["Valmont Paiements", "Finance", 1300, 1340, 0], ["Altamar Santé", "Santé", 1250, 1300, 0],
      ["Héliade Énergie", "Énergie", 900, 820, -4], ["Kessel Boissons", "Consommation", 880, 860, 0], ["Ventor Énergie", "Énergie", 700, 760, 3], ["Norren Assurances", "Finance", 680, 690, 0],
      ["Brévine Chemins de fer", "Industrie", 610, 600, -2], ["Corvin Distribution", "Consommation", 560, 590, 1], ["Ostra Médias", "Communication", 520, 470, -6], ["Atelier Nord", "Consommation", 480, 530, 4] ] },
    contrarien: { nom: "Fonds Contre-courant (fictif)", style: "Achète ce que le marché délaisse", lignes: [
      ["Halde Industrie", "Industrie", 780, 1150, 52], ["Pallas Énergie", "Énergie", 900, 940, 8], ["Ostra Médias", "Communication", 620, 700, 20], ["Kessel Boissons", "Consommation", 540, null, -100],
      ["Héliade Énergie", "Énergie", null, 480, null], ["Norren Assurances", "Finance", 450, 430, -10], ["Volta Mobilité", "Industrie", 400, 310, -15], ["Café Lumen", "Consommation", 380, 395, 0] ] }
  };
  var cur = "patient";
  function action(l) {
    if (l[2] == null) return ["nouvelle", "on"];
    if (l[3] == null) return ["sortie", "off"];
    if (l[4] > 2) return ["renforcée +" + l[4] + " %", "ok"];
    if (l[4] < -2) return ["allégée " + l[4] + " %", "on"];
    return ["inchangée", "off"];
  }
  function renderFund() {
    var F = FONDS[cur], L = F.lignes, t2 = 0, t3 = 0;
    L.forEach(function (l) { t2 += l[2] || 0; t3 += l[3] || 0; });
    var sorted = L.slice().sort(function (a, b) { return (b[3] || 0) - (a[3] || 0); });
    var top5 = sorted.slice(0, 5).reduce(function (s, l) { return s + (l[3] || 0); }, 0);
    SO.txt("fNom", F.nom); SO.txt("fStyle", F.style);
    SO.set("kpis", '<div class="kpi card"><b>' + SO.n(t3 / 1000, 1) + ' Md$</b><span>actions déclarées au T3</span></div><div class="kpi card"><b>' + L.filter(function (l) { return l[3] != null; }).length + '</b><span>lignes</span></div><div class="kpi card"><b>' + SO.pct(top5 / t3, 0) + '</b><span>dans les 5 premières lignes</span></div><div class="kpi card"><b>' + L.filter(function (l) { return l[2] == null; }).length + " / " + L.filter(function (l) { return l[3] == null; }).length + '</b><span>entrées / sorties</span></div>');
    SO.table("pos", ["Société", "Secteur", "Poids T3", "Valeur T3", "Mouvement"], sorted.map(function (l) {
      var a = action(l); return ["<b>" + l[0] + "</b>", l[1], l[3] ? SO.pct(l[3] / t3, 1) : "—", l[3] ? SO.n(l[3], 0) + " M$" : "—", '<span class="pill-st ' + a[1] + '">' + a[0] + "</span>"];
    }), { right: false });
    var sec = {}; L.forEach(function (l) { if (l[3]) sec[l[1]] = (sec[l[1]] || 0) + l[3]; });
    SO.set("sect", Object.keys(sec).sort(function (a, b) { return sec[b] - sec[a]; }).map(function (k) { return '<div class="fund"><span>' + k + '</span><span class="bar" style="width:' + (sec[k] / t3 * 100 * 2.2) + '%;max-width:100%"></span><span class="num">' + SO.pct(sec[k] / t3, 0) + "</span></div>"; }).join(""));
    var nouv = L.filter(function (l) { return l[2] == null; }).map(function (l) { return l[0]; }), sort = L.filter(function (l) { return l[3] == null; }).map(function (l) { return l[0]; });
    var plus = L.filter(function (l) { return l[2] != null && l[3] != null && l[4] > 2; }).sort(function (a, b) { return b[4] - a[4]; })[0];
    SO.txt("fRead", "Ce trimestre, le fonds " + (nouv.length ? "est entré sur " + nouv.join(", ") : "n'a ouvert aucune ligne") + (sort.length ? " et a vendu entièrement " + sort.join(", ") : "") + (plus ? ". Son plus gros renforcement porte sur " + plus[0] + " (+" + plus[4] + " % de titres)" : "") + ". Une hausse de la valeur d'une ligne ne veut pas dire que le fonds a acheté : le cours a pu monter seul. C'est la variation du nombre de titres qui compte.");
    SO.set("fTabs", Object.keys(FONDS).map(function (k) { return '<button type="button" role="tab" aria-selected="' + (k === cur) + '" data-f="' + k + '">' + FONDS[k].nom.replace(" (fictif)", "") + "</button>"; }).join(""));
    // qui détient quoi : lignes présentes dans plusieurs fonds
    var cnt = {}; Object.keys(FONDS).forEach(function (k) { FONDS[k].lignes.forEach(function (l) { if (l[3] != null) cnt[l[0]] = (cnt[l[0]] || 0) + 1; }); });
    SO.set("common", Object.keys(cnt).filter(function (k) { return cnt[k] > 1; }).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) { return "<li><b>" + k + "</b> : détenue par " + cnt[k] + " fonds sur 3</li>"; }).join(""));
  }
  document.getElementById("fTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (b) { cur = b.dataset.f; renderFund(); SO.used("grands-fonds"); } });
  // comparaison de deux listes collées : "nom;valeur" ou "nom<TAB>valeur" par ligne
  function parse(txt) {
    var m = {};
    txt.split(/\r?\n/).forEach(function (line) {
      var p = line.split(/;|\t|,(?=[^,]*$)/); if (p.length < 2) return;
      var n = p[0].trim(), v = SO.num(p[p.length - 1]); if (n && v) m[n] = (m[n] || 0) + v;
    });
    return m;
  }
  function compare() {
    var a = parse(document.getElementById("qa").value), b = parse(document.getElementById("qb").value), names = {};
    Object.keys(a).concat(Object.keys(b)).forEach(function (n) { names[n] = 1; });
    var ta = 0, tb = 0; Object.keys(a).forEach(function (n) { ta += a[n]; }); Object.keys(b).forEach(function (n) { tb += b[n]; });
    var rows = Object.keys(names).map(function (n) {
      var x = a[n] || 0, y = b[n] || 0, wa = ta ? x / ta : 0, wb = tb ? y / tb : 0, st = !x ? ["nouvelle", "on"] : !y ? ["sortie", "off"] : wb - wa > 0.005 ? ["poids en hausse", "ok"] : wa - wb > 0.005 ? ["poids en baisse", "on"] : ["stable", "off"];
      return { n: n, wa: wa, wb: wb, st: st };
    }).sort(function (p, q) { return q.wb - p.wb; });
    if (!rows.length) { SO.set("cmpOut", '<p class="hint">Collez deux listes pour voir les mouvements.</p>'); return; }
    SO.table("cmpOut", ["Ligne", "Poids avant", "Poids après", "Écart", "Lecture"], rows.map(function (r) {
      return [SO.esc(r.n), SO.pct(r.wa, 1), SO.pct(r.wb, 1), SO.sgn((r.wb - r.wa) * 100, function (x) { return SO.n(x, 1) + " pt"; }), '<span class="pill-st ' + r.st[1] + '">' + r.st[0] + "</span>"];
    }));
  }
  ["qa", "qb"].forEach(function (id) { document.getElementById(id).addEventListener("input", compare); });
  renderFund(); compare();
})();
