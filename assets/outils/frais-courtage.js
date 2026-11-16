/* Frais de courtage : coût annuel de trois grilles tarifaires types (modifiables) selon votre façon d'investir */
(function () {
  "use strict";
  var KEY = "socle-courtage";
  var DEF = [
    { nom: "Banque de réseau (type)", pct: 0.50, min: 8, fixe: 0, change: 0.50, garde: 0.20 },
    { nom: "Courtier en ligne (type)", pct: 0.10, min: 1.5, fixe: 0, change: 0.10, garde: 0 },
    { nom: "Application à petits ordres (type)", pct: 0, min: 0, fixe: 1, change: 0.25, garde: 0 }
  ];
  var G = SO.store.get(KEY, null); if (!Array.isArray(G) || !G.length) G = JSON.parse(JSON.stringify(DEF));
  function save() { SO.store.set(KEY, G); }
  function ordre(g, m) { return Math.max(g.min, g.fixe + m * g.pct / 100); }
  function renderRows() {
    SO.set("rows", G.map(function (g, i) {
      function inp(k, l) { return '<td><input class="n" data-k="' + k + '" aria-label="' + l + '" inputmode="decimal" value="' + g[k] + '"></td>'; }
      return '<tr data-i="' + i + '"><td><input data-k="nom" aria-label="Nom" value="' + SO.esc(g.nom) + '"></td>' + inp("pct", "Commission en %") + inp("min", "Minimum par ordre en €") + inp("fixe", "Part fixe par ordre en €") + inp("change", "Frais de change en %") + inp("garde", "Droits de garde annuels en %") + '<td><button class="icon-btn" type="button" data-del aria-label="Retirer">×</button></td></tr>';
    }).join(""));
  }
  var F = SO.form("#f", function (v) {
    var n = Math.max(0, Math.round(v.ordres)), m = Math.max(0, v.montant), etr = v.etr / 100, inv = n * m;
    var res = G.map(function (g) {
      var c = ordre(g, m) * n, ch = inv * etr * g.change / 100, ga = v.pf * g.garde / 100;
      return { g: g, c: c, ch: ch, ga: ga, t: c + ch + ga, unit: ordre(g, m) };
    }).sort(function (a, b) { return a.t - b.t; });
    var best = res[0];
    SO.txt("rBest", best.g.nom);
    SO.set("rRow", '<div><b>' + SO.eur(best.t) + '</b><span>par an avec ce profil</span></div><div><b>' + (inv ? SO.pct(best.t / inv, 2) : "—") + '</b><span>des sommes investies dans l\'année</span></div><div><b>' + SO.eur(res[res.length - 1].t - best.t) + '</b><span>d\'écart avec la grille la plus chère</span></div>');
    var plafond = m * 0.005;
    SO.table("tab", ["Grille", "Coût d'un ordre", "Courtage / an", "Change / an", "Garde / an", "Total / an"], res.map(function (o) {
      return ["<b>" + SO.esc(o.g.nom) + "</b>" + (v.pea && o.unit > plafond + 1e-9 ? '<br><span class="hint down">au-dessus du plafond légal PEA (0,5 % par ordre en ligne)</span>' : ""), SO.eur(o.unit, 2) + '<br><span class="hint">' + (m ? SO.pct(o.unit / m, 2) : "") + "</span>", SO.eur(o.c), SO.eur(o.ch), SO.eur(o.ga), "<b>" + SO.eur(o.t) + "</b>"];
    }));
    SO.bars("chart", { labels: res.map(function (o) { return o.g.nom.replace(/ \(type\)/, ""); }), stacked: true, title: "Coût annuel par grille",
      series: [{ name: "Courtage", data: res.map(function (o) { return o.c; }), color: "var(--s3)" }, { name: "Change", data: res.map(function (o) { return o.ch; }), color: "var(--s4)" }, { name: "Droits de garde", data: res.map(function (o) { return o.ga; }), color: "var(--s2)" }] });
    // coût d'un ordre selon son montant
    var lab = [], ser = G.map(function () { return []; });
    [50, 100, 250, 500, 1000, 2000, 5000, 10000].forEach(function (x) { lab.push(SO.short(x) + " €"); G.forEach(function (g, i) { ser[i].push(ordre(g, x) / x * 100); }); });
    SO.chart("chart2", { labels: lab, title: "Coût d'un ordre en % du montant", yFmt: function (x) { return SO.n(x, x < 1 ? 1 : 0) + " %"; }, tipFmt: function (x) { return SO.n(x, 2) + " %"; },
      series: G.map(function (g, i) { return { name: g.nom, data: ser[i], color: SO.COL[i] }; }) });
  }, { tool: "frais-courtage" });
  var tb = document.getElementById("rows");
  tb.addEventListener("input", function (e) { var tr = e.target.closest("tr"), k = e.target.dataset.k; if (!tr || !k) return; G[+tr.dataset.i][k] = k === "nom" ? e.target.value : SO.num(e.target.value); save(); F.run(); });
  tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b && G.length > 1) { G.splice(+b.closest("tr").dataset.i, 1); save(); renderRows(); F.run(); } });
  document.getElementById("add").addEventListener("click", function () { if (G.length >= 5) return; G.push({ nom: "Ma grille", pct: 0.2, min: 2, fixe: 0, change: 0.2, garde: 0 }); save(); renderRows(); F.run(); });
  document.getElementById("reset").addEventListener("click", function () { G = JSON.parse(JSON.stringify(DEF)); save(); renderRows(); F.run(); });
  renderRows(); F.run();
})();
