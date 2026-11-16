/* Comparateur d'ETF : effet des frais courants et de l'écart de suivi sur un même indice */
(function () {
  "use strict";
  var KEY = "socle-etf";
  var DEF = [
    { nom: "ETF Monde A (exemple)", ter: 0.20, te: 0.05, pea: true, dist: "Capitalisant" },
    { nom: "ETF Monde B (exemple)", ter: 0.38, te: 0.10, pea: false, dist: "Distribuant" },
    { nom: "Fonds actif Monde (exemple)", ter: 1.80, te: 0.30, pea: false, dist: "Capitalisant" }
  ];
  var E = SO.store.get(KEY, null); if (!Array.isArray(E) || !E.length) E = JSON.parse(JSON.stringify(DEF));
  function save() { SO.store.set(KEY, E); }
  function renderRows() {
    SO.set("rows", E.map(function (x, i) {
      return '<tr data-i="' + i + '"><td><input data-k="nom" aria-label="Nom" value="' + SO.esc(x.nom) + '"></td><td><input class="n" data-k="ter" aria-label="Frais courants en %" inputmode="decimal" value="' + x.ter + '"></td><td><input class="n" data-k="te" aria-label="Écart de suivi annuel en %" inputmode="decimal" value="' + x.te + '"></td><td><select data-k="pea" aria-label="Éligible PEA"><option value="1"' + (x.pea ? " selected" : "") + '>Oui</option><option value="0"' + (!x.pea ? " selected" : "") + '>Non</option></select></td><td><select data-k="dist" aria-label="Distribution"><option' + (x.dist === "Capitalisant" ? " selected" : "") + ">Capitalisant</option><option" + (x.dist === "Distribuant" ? " selected" : "") + '>Distribuant</option></select></td><td><button class="icon-btn" type="button" data-del aria-label="Retirer">×</button></td></tr>';
    }).join(""));
  }
  var F = SO.form("#f", function (v) {
    var ans = Math.round(v.ans), r = v.rdt / 100, dy = v.dy / 100, res = E.map(function (x) {
      // l'écart de suivi est traité ici comme un coût supplémentaire constant (hypothèse prudente)
      var net = r - x.ter / 100 - x.te / 100, tax = 0;
      if (x.dist === "Distribuant" && v.env === "cto") tax = dy * SO.FISC.pfu; // dividendes imposés chaque année sur un compte-titres
      return { x: x, s: SO.serie(v.init, v.mens, net - tax, ans) };
    });
    var idx = SO.serie(v.init, v.mens, r, ans);
    res.sort(function (a, b) { return b.s[ans].valeur - a.s[ans].valeur; });
    var best = res[0];
    SO.txt("rBest", best ? best.x.nom : "—");
    SO.table("tab", ["Fonds", "Capital final", "Coût total par rapport à l'indice", "Éligible PEA", "Remarque"], res.map(function (o) {
      var c = idx[ans].valeur - o.s[ans].valeur, rem = [];
      if (v.env === "pea" && !o.x.pea) rem.push('<span class="down">non logeable dans un PEA</span>');
      if (o.x.dist === "Distribuant" && v.env === "cto") rem.push("dividendes imposés chaque année");
      if (o.x.ter > 1) rem.push("frais élevés pour une gestion indicielle");
      return ["<b>" + SO.esc(o.x.nom) + "</b>", SO.eur(o.s[ans].valeur), SO.eur(c), o.x.pea ? "Oui" : "Non", rem.join(", ") || "—"];
    }));
    SO.chart("chart", { labels: idx.map(function (x) { return x.an; }), title: "Capital selon le fonds",
      series: [{ name: "Indice sans frais", data: idx.map(function (x) { return x.valeur; }), color: "var(--muted)", dash: true }].concat(res.map(function (o, i) { return { name: o.x.nom, data: o.s.map(function (x) { return x.valeur; }), color: SO.COL[i] }; })),
      xFmt: function (a) { return a ? "an " + a : "0"; }, tipTitle: function (a) { return "Année " + a; } });
  }, { tool: "comparateur-etf" });
  var tb = document.getElementById("rows");
  function upd(e) {
    var tr = e.target.closest("tr"), k = e.target.dataset.k; if (!tr || !k) return;
    var x = E[+tr.dataset.i];
    x[k] = k === "pea" ? e.target.value === "1" : k === "nom" || k === "dist" ? e.target.value : SO.num(e.target.value);
    save(); F.run();
  }
  tb.addEventListener("input", upd); tb.addEventListener("change", upd);
  tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b && E.length > 1) { E.splice(+b.closest("tr").dataset.i, 1); save(); renderRows(); F.run(); } });
  document.getElementById("add").addEventListener("click", function () { if (E.length >= 5) { SO.toast("Cinq fonds au maximum."); return; } E.push({ nom: "Fonds " + (E.length + 1), ter: 0.3, te: 0.1, pea: true, dist: "Capitalisant" }); save(); renderRows(); F.run(); });
  document.getElementById("reset").addEventListener("click", function () { E = JSON.parse(JSON.stringify(DEF)); save(); renderRows(); F.run(); });
  renderRows(); F.run();
})();
