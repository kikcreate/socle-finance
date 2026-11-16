/* Calendrier des dividendes : revenus attendus mois par mois, bruts et nets selon l'enveloppe */
(function () {
  "use strict";
  var KEY = "socle-calendrier-dividendes";
  var MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  var FREQ = { 1: "Annuel", 2: "Semestriel", 4: "Trimestriel", 12: "Mensuel" };
  var EX = [
    { nom: "Café Lumen (fictive)", qte: 120, dpa: 0.87, freq: 1, m: 5, env: "PEA" },
    { nom: "Ventor Énergie (fictive)", qte: 25, dpa: 1.6, freq: 2, m: 6, env: "PEA" },
    { nom: "ETF distribuant Europe (exemple)", qte: 60, dpa: 2.1, freq: 4, m: 3, env: "Compte-titres" },
    { nom: "Foncière fictive", qte: 40, dpa: 3.0, freq: 1, m: 4, env: "Compte-titres" },
    { nom: "ETF dividendes monde (exemple)", qte: 80, dpa: 1.2, freq: 12, m: 1, env: "Compte-titres" }
  ];
  var L = SO.store.get(KEY, null); if (!Array.isArray(L)) L = [];
  function save() { SO.store.set(KEY, L); }
  function rate(env) { return env === "Compte-titres" ? SO.FISC.pfu : 0; }
  function months(x) { var out = [], step = 12 / x.freq; for (var k = 0; k < x.freq; k++) out.push((x.m - 1 + Math.round(k * step)) % 12); return out; }
  function sel(o, v) { return Object.keys(o).map(function (k) { return '<option value="' + k + '"' + (String(v) === k ? " selected" : "") + ">" + o[k] + "</option>"; }).join(""); }
  function render() {
    SO.set("rows", L.length ? L.map(function (x, i) {
      return '<tr data-i="' + i + '"><td><input data-k="nom" aria-label="Valeur" value="' + SO.esc(x.nom) + '"></td><td><input class="n" data-k="qte" aria-label="Nombre de titres" inputmode="decimal" value="' + x.qte + '"></td><td><input class="n" data-k="dpa" aria-label="Dividende annuel par titre en euros" inputmode="decimal" value="' + x.dpa + '"></td><td><select data-k="freq" aria-label="Fréquence">' + sel(FREQ, x.freq) + '</select></td><td><select data-k="m" aria-label="Mois du premier versement">' + MOIS.map(function (n, j) { return '<option value="' + (j + 1) + '"' + (x.m === j + 1 ? " selected" : "") + ">" + n + "</option>"; }).join("") + '</select></td><td><select data-k="env" aria-label="Enveloppe">' + ["PEA", "Compte-titres", "Assurance-vie"].map(function (e) { return "<option" + (e === x.env ? " selected" : "") + ">" + e + "</option>"; }).join("") + '</select></td><td><button class="icon-btn" type="button" data-del aria-label="Supprimer">×</button></td></tr>';
    }).join("") : '<tr><td colspan="7"><div class="empty">Aucune ligne. Ajoutez une valeur ou chargez l\'exemple.</div></td></tr>');
    calc();
  }
  function calc() {
    var brut = new Array(12).fill(0), net = new Array(12).fill(0), det = MOIS.map(function () { return []; });
    L.forEach(function (x) {
      var per = x.qte * x.dpa / x.freq;
      months(x).forEach(function (m) { brut[m] += per; net[m] += per * (1 - rate(x.env)); det[m].push([x.nom, per]); });
    });
    var tb = brut.reduce(function (a, b) { return a + b; }, 0), tn = net.reduce(function (a, b) { return a + b; }, 0);
    var vides = brut.filter(function (x) { return x === 0; }).length;
    SO.set("kpis", '<div class="kpi card"><b>' + SO.eur(tn) + '</b><span>dividendes nets sur un an</span></div><div class="kpi card"><b>' + SO.eur(tn / 12) + '</b><span>par mois en moyenne</span></div><div class="kpi card"><b>' + SO.eur(tb - tn) + '</b><span>prélevés (compte-titres, ' + SO.pct(SO.FISC.pfu, 1) + ')</span></div><div class="kpi card"><b>' + (12 - vides) + ' / 12</b><span>mois avec un versement</span></div>');
    SO.set("cal", MOIS.map(function (n, m) {
      return "<div><h3>" + n + "<span>" + (net[m] ? SO.eur(net[m]) : "") + "</span></h3><ul>" + det[m].map(function (d) { return "<li><span>" + SO.esc(d[0]) + '</span><span class="num">' + SO.eur(d[1], 2) + "</span></li>"; }).join("") + "</ul></div>";
    }).join(""));
    SO.bars("chart", { labels: MOIS.map(function (n) { return n.slice(0, 3) + "."; }), title: "Dividendes par mois", stacked: true,
      series: [{ name: "Net", data: net, color: "var(--s1)" }, { name: "Prélèvements", data: brut.map(function (b, i) { return b - net[i]; }), color: "var(--s4)" }] });
  }
  var tb = document.getElementById("rows");
  function upd(e) {
    var tr = e.target.closest("tr"), k = e.target.dataset.k; if (!tr || !k) return;
    var x = L[+tr.dataset.i];
    x[k] = k === "nom" || k === "env" ? e.target.value : SO.num(e.target.value);
    save(); calc(); SO.used("calendrier-dividendes");
  }
  tb.addEventListener("input", upd); tb.addEventListener("change", upd);
  tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b) { L.splice(+b.closest("tr").dataset.i, 1); save(); render(); } });
  document.getElementById("add").addEventListener("click", function () { L.push({ nom: "Nouvelle valeur", qte: 10, dpa: 1, freq: 1, m: 6, env: "PEA" }); save(); render(); });
  document.getElementById("demo").addEventListener("click", function () { if (L.length && !confirm("Remplacer vos lignes par l'exemple ?")) return; L = JSON.parse(JSON.stringify(EX)); save(); render(); });
  document.getElementById("fromPf").addEventListener("click", function () {
    var pf = SO.store.get("socle-portefeuille", []);
    var act = (Array.isArray(pf) ? pf : []).filter(function (x) { return x.type === "Actions" || x.type === "ETF actions"; });
    if (!act.length) { SO.toast("Aucune action ni ETF dans votre suivi de portefeuille."); return; }
    act.forEach(function (x) { L.push({ nom: x.nom, qte: x.qte, dpa: 0, freq: 1, m: 6, env: x.compte === "Compte-titres" ? "Compte-titres" : x.compte === "Assurance-vie" ? "Assurance-vie" : "PEA" }); });
    save(); render(); SO.toast(act.length + " ligne(s) reprise(s) : indiquez le dividende par titre.");
  });
  render();
})();
