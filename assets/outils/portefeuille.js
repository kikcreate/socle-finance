/* Suivi de portefeuille : saisie des lignes, répartition par compte, type, zone et secteur, frais moyens.
   Les données restent dans ce navigateur (localStorage), exportables en CSV ou JSON. */
(function () {
  "use strict";
  var KEY = "socle-portefeuille";
  var COMPTES = ["PEA", "Assurance-vie", "Compte-titres", "PER", "Livret", "Autre"];
  var TYPES = ["Actions", "ETF actions", "Obligations", "Fonds euros", "Immobilier", "Liquidités", "Or", "Crypto"];
  var ZONES = ["Monde", "France", "Europe", "États-Unis", "Émergents", "Asie", "Autre"];
  var EX = [
    { nom: "ETF Monde (exemple)", compte: "PEA", type: "ETF actions", zone: "Monde", secteur: "Diversifié", qte: 320, pru: 38.2, cours: 44.6, frais: 0.25 },
    { nom: "ETF Europe (exemple)", compte: "PEA", type: "ETF actions", zone: "Europe", secteur: "Diversifié", qte: 60, pru: 72, cours: 78.4, frais: 0.15 },
    { nom: "Ventor Énergie (fictive)", compte: "PEA", type: "Actions", zone: "France", secteur: "Énergie", qte: 25, pru: 39.5, cours: 42.1, frais: 0 },
    { nom: "Fonds euros", compte: "Assurance-vie", type: "Fonds euros", zone: "Europe", secteur: "Obligations", qte: 1, pru: 9000, cours: 9420, frais: 0.6 },
    { nom: "SCPI (exemple)", compte: "Assurance-vie", type: "Immobilier", zone: "Europe", secteur: "Immobilier", qte: 10, pru: 200, cours: 186, frais: 1.0 },
    { nom: "ETF États-Unis (exemple)", compte: "Compte-titres", type: "ETF actions", zone: "États-Unis", secteur: "Diversifié", qte: 9, pru: 410, cours: 498, frais: 0.07 },
    { nom: "Livret A", compte: "Livret", type: "Liquidités", zone: "France", secteur: "Liquidités", qte: 1, pru: 6000, cours: 6000, frais: 0 }
  ];
  var L = SO.store.get(KEY, null);
  if (!Array.isArray(L)) L = [];
  function save() { SO.store.set(KEY, L); }
  function opts(list, v) { return list.map(function (x) { return "<option" + (x === v ? " selected" : "") + ">" + x + "</option>"; }).join(""); }
  function renderRows() {
    var tb = document.getElementById("rows");
    if (!L.length) { tb.innerHTML = '<tr><td colspan="10"><div class="empty">Aucune ligne. Ajoutez vos placements ou chargez l\'exemple.</div></td></tr>'; return; }
    tb.innerHTML = L.map(function (x, i) {
      return '<tr data-i="' + i + '"><td><input aria-label="Nom" data-k="nom" value="' + SO.esc(x.nom) + '"></td>' +
        '<td><select aria-label="Compte" data-k="compte">' + opts(COMPTES, x.compte) + "</select></td>" +
        '<td><select aria-label="Type" data-k="type">' + opts(TYPES, x.type) + "</select></td>" +
        '<td><select aria-label="Zone" data-k="zone">' + opts(ZONES, x.zone) + "</select></td>" +
        '<td><input aria-label="Secteur" data-k="secteur" value="' + SO.esc(x.secteur || "") + '"></td>' +
        '<td><input class="n" aria-label="Quantité" data-k="qte" inputmode="decimal" value="' + x.qte + '"></td>' +
        '<td><input class="n" aria-label="Prix de revient unitaire" data-k="pru" inputmode="decimal" value="' + x.pru + '"></td>' +
        '<td><input class="n" aria-label="Cours actuel" data-k="cours" inputmode="decimal" value="' + x.cours + '"></td>' +
        '<td><input class="n" aria-label="Frais annuels en %" data-k="frais" inputmode="decimal" value="' + x.frais + '"></td>' +
        '<td><button class="icon-btn" type="button" data-del aria-label="Supprimer la ligne">×</button></td></tr>';
    }).join("");
  }
  function group(k) {
    var g = {};
    L.forEach(function (x) { var n = x[k] || "Non renseigné"; g[n] = (g[n] || 0) + x.qte * x.cours; });
    return Object.keys(g).sort(function (a, b) { return g[b] - g[a]; }).map(function (n, i) { return { label: n, value: g[n], color: SO.COL[i % SO.COL.length] }; });
  }
  function calc() {
    var tot = 0, cost = 0, fr = 0;
    L.forEach(function (x) { var v = x.qte * x.cours; tot += v; cost += x.qte * x.pru; fr += v * x.frais / 100; });
    var pv = tot - cost;
    SO.set("kpis", '<div class="kpi card"><b>' + SO.eur(tot) + '</b><span>valeur totale</span></div><div class="kpi card"><b class="' + (pv >= 0 ? "up" : "down") + '">' + SO.sgn(pv, SO.eur) + "</b><span>plus ou moins-value latente (" + (cost ? SO.sgn(pv / cost, SO.pct) : "—") + ')</span></div><div class="kpi card"><b>' + (tot ? SO.pct(fr / tot, 2) : "—") + "</b><span>frais annuels moyens, soit " + SO.eur(fr) + ' par an</span></div><div class="kpi card"><b>' + L.length + "</b><span>lignes</span></div>");
    SO.donut("dCompte", group("compte"), [SO.short(tot) + " €", "total"]);
    SO.donut("dType", group("type"));
    SO.donut("dZone", group("zone"));
    var sec = group("secteur");
    SO.set("dSect", sec.map(function (s) { return '<div class="hbar"><span>' + SO.esc(s.label) + '</span><span class="b"><i style="width:' + (tot ? s.value / tot * 100 : 0) + '%"></i></span><span class="num">' + (tot ? SO.pct(s.value / tot, 0) : "") + "</span></div>"; }).join(""));
    var w = [], lines = L.map(function (x) { return { n: x.nom, v: x.qte * x.cours, t: x.type }; }).sort(function (a, b) { return b.v - a.v; });
    var actions = lines.filter(function (x) { return x.t === "Actions"; });
    if (actions.length && tot && actions[0].v / tot > 0.1) w.push("La ligne « " + actions[0].n + " » pèse " + SO.pct(actions[0].v / tot, 0) + " du total : c'est beaucoup pour une seule entreprise.");
    var zones = group("zone"), z0 = zones[0];
    if (z0 && tot && z0.value / tot > 0.6 && z0.label !== "Monde") w.push("Plus de 60 % de votre patrimoine est exposé à une seule zone (" + z0.label + ").");
    if (tot && fr / tot > 0.01) w.push("Vos frais moyens dépassent 1 % par an : sur 20 ans, c'est près d'un cinquième des gains. Voyez le simulateur d'impact des frais.");
    var liq = group("type").filter(function (x) { return x.label === "Liquidités"; })[0];
    if (tot && (!liq || liq.value / tot < 0.05)) w.push("Peu ou pas de liquidités : gardez une épargne de précaution disponible à côté de vos placements.");
    var pea = L.filter(function (x) { return x.compte === "PEA"; }).reduce(function (s, x) { return s + x.qte * x.pru; }, 0);
    if (pea > SO.FISC.pea.plafond) w.push("Le prix de revient de votre PEA dépasse le plafond de versements de 150 000 € : vérifiez (les gains réinvestis ne comptent pas dans le plafond).");
    SO.set("alerts", L.length ? (w.length ? w.map(function (x) { return "<li>" + SO.esc(x) + "</li>"; }).join("") : "<li>Rien de particulier à signaler sur la répartition.</li>") : "<li>Ajoutez des lignes pour voir l'analyse.</li>");
    SO.table("detail", ["Ligne", "Valeur", "Poids", "+/− value", "Frais / an"], L.slice().sort(function (a, b) { return b.qte * b.cours - a.qte * a.cours; }).map(function (x) {
      var v = x.qte * x.cours, g = v - x.qte * x.pru;
      return [SO.esc(x.nom) + '<br><span class="hint">' + SO.esc(x.compte) + " · " + SO.esc(x.type) + "</span>", SO.eur(v), tot ? SO.pct(v / tot, 1) : "", '<span class="' + (g >= 0 ? "up" : "down") + '">' + SO.sgn(g, SO.eur) + "</span>", SO.eur(v * x.frais / 100)];
    }));
  }
  function all() { renderRows(); calc(); }
  var tb = document.getElementById("rows");
  tb.addEventListener("input", function (e) {
    var tr = e.target.closest("tr"), k = e.target.dataset.k; if (!tr || !k) return;
    var x = L[+tr.dataset.i]; x[k] = ["qte", "pru", "cours", "frais"].indexOf(k) >= 0 ? SO.num(e.target.value) : e.target.value;
    save(); calc(); SO.used("portefeuille");
  });
  tb.addEventListener("change", function (e) { if (e.target.tagName === "SELECT") { var tr = e.target.closest("tr"); L[+tr.dataset.i][e.target.dataset.k] = e.target.value; save(); calc(); } });
  tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b) { L.splice(+b.closest("tr").dataset.i, 1); save(); all(); } });
  document.getElementById("add").addEventListener("click", function () {
    L.push({ nom: "Nouvelle ligne", compte: "PEA", type: "ETF actions", zone: "Monde", secteur: "Diversifié", qte: 1, pru: 100, cours: 100, frais: 0.2 });
    save(); all(); SO.used("portefeuille");
    var ins = SO.$$("#rows tr:last-child input"); if (ins[0]) { ins[0].focus(); ins[0].select(); }
  });
  document.getElementById("demo").addEventListener("click", function () { if (L.length && !confirm("Remplacer vos lignes par l'exemple ?")) return; L = JSON.parse(JSON.stringify(EX)); save(); all(); });
  document.getElementById("clear").addEventListener("click", function () { if (!L.length || confirm("Effacer toutes les lignes de ce navigateur ?")) { L = []; save(); all(); } });
  document.getElementById("csv").addEventListener("click", function () {
    SO.download("portefeuille-socle.csv", SO.csv([["Nom", "Compte", "Type", "Zone", "Secteur", "Quantité", "PRU", "Cours", "Frais annuels %", "Valeur"]].concat(L.map(function (x) {
      return [x.nom, x.compte, x.type, x.zone, x.secteur, SO.n(x.qte, 4), SO.n(x.pru, 2), SO.n(x.cours, 2), SO.n(x.frais, 2), SO.n(x.qte * x.cours, 2)];
    }))), "text/csv;charset=utf-8");
  });
  document.getElementById("json").addEventListener("click", function () { SO.download("portefeuille-socle.json", JSON.stringify(L, null, 2), "application/json"); });
  document.getElementById("imp").addEventListener("change", function (e) {
    var file = e.target.files[0]; if (!file) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var d = JSON.parse(rd.result); if (!Array.isArray(d)) throw new Error("format");
        L = d.map(function (x) { return { nom: String(x.nom || "Ligne"), compte: x.compte || "Autre", type: x.type || "Actions", zone: x.zone || "Autre", secteur: x.secteur || "", qte: SO.num(x.qte), pru: SO.num(x.pru), cours: SO.num(x.cours), frais: SO.num(x.frais) }; });
        save(); all(); SO.toast("Portefeuille importé.");
      } catch (er) { SO.toast("Fichier non reconnu : utilisez un export JSON de cet outil."); }
    };
    rd.readAsText(file); e.target.value = "";
  });
  all();
})();
