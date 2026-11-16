/* Listes et alertes : suivre des valeurs, fixer des seuils, noter les cours relevés.
   Aucun flux de cotation : vous saisissez les cours, l'outil garde l'historique et signale les seuils franchis. */
(function () {
  "use strict";
  var KEY = "socle-alertes";
  var EX = { listes: [{ nom: "Ma liste", items: [
    { nom: "Ventor Énergie (fictive)", haut: 46, bas: 38, note: "Attendre les résultats annuels", h: [[d(-60), 39.2], [d(-45), 40.1], [d(-30), 41.6], [d(-15), 41.5], [d(0), 42.1]] },
    { nom: "Halde Industrie (fictive)", haut: 0, bas: 25, note: "Dette en hausse à surveiller", h: [[d(-60), 29.8], [d(-30), 27.4], [d(0), 24.6]] },
    { nom: "ETF Monde (exemple)", haut: 0, bas: 40, note: "Renforcer sous 40 €", h: [[d(-60), 43.1], [d(-30), 44.0], [d(0), 44.6]] }
  ] }], active: 0 };
  function d(off) { var x = new Date(); x.setDate(x.getDate() + off); return x.toISOString().slice(0, 10); }
  var S = SO.store.get(KEY, null);
  if (!S || !Array.isArray(S.listes) || !S.listes.length) S = { listes: [{ nom: "Ma liste", items: [] }], active: 0 };
  function save() { SO.store.set(KEY, S); }
  function cur() { return S.listes[S.active] || S.listes[0]; }
  function last(it) { return it.h.length ? it.h[it.h.length - 1][1] : 0; }
  function status(it) {
    var c = last(it);
    if (!it.h.length) return ["off", "pas de cours"];
    if (it.haut && c >= it.haut) return ["on", "seuil haut franchi"];
    if (it.bas && c <= it.bas) return ["on", "seuil bas franchi"];
    return ["ok", "sous surveillance"];
  }
  function dist(c, s) { return s && c ? SO.sgn(s / c - 1, function (x) { return SO.pct(x, 1); }) : "—"; }
  function render() {
    SO.set("lists", S.listes.map(function (l, i) { return '<button type="button" role="tab" aria-selected="' + (i === S.active) + '" data-l="' + i + '">' + SO.esc(l.nom) + " (" + l.items.length + ")</button>"; }).join(""));
    var L = cur(), on = 0;
    SO.set("rows", L.items.length ? L.items.map(function (it, i) {
      var c = last(it), st = status(it), p = it.h.length > 1 ? c / it.h[0][1] - 1 : 0; if (st[0] === "on") on++;
      return '<tr data-i="' + i + '"><td><input data-k="nom" aria-label="Nom" value="' + SO.esc(it.nom) + '"><span class="hint">' + SO.esc(it.note || "") + "</span></td>" +
        "<td>" + SO.spark(it.h.map(function (x) { return x[1]; })) + "</td>" +
        '<td><input class="n" data-k="cours" aria-label="Nouveau cours relevé" inputmode="decimal" placeholder="' + (c ? SO.n(c, 2) : "cours") + '"><span class="hint">' + (it.h.length ? "le " + new Date(it.h[it.h.length - 1][0]).toLocaleDateString("fr-FR") + (it.h.length > 1 ? " · " + SO.sgn(p, function (x) { return SO.pct(x, 1); }) : "") : "") + "</span></td>" +
        '<td><input class="n" data-k="haut" aria-label="Seuil haut" inputmode="decimal" value="' + (it.haut || "") + '"><span class="hint">' + dist(c, it.haut) + "</span></td>" +
        '<td><input class="n" data-k="bas" aria-label="Seuil bas" inputmode="decimal" value="' + (it.bas || "") + '"><span class="hint">' + dist(c, it.bas) + "</span></td>" +
        '<td><span class="pill-st ' + st[0] + '">' + st[1] + "</span></td>" +
        '<td><button class="icon-btn" type="button" data-del aria-label="Retirer">×</button></td></tr>';
    }).join("") : '<tr><td colspan="7"><div class="empty">Liste vide. Ajoutez une valeur ou chargez l\'exemple.</div></td></tr>');
    SO.txt("nOn", on ? on + " alerte" + (on > 1 ? "s" : "") + " déclenchée" + (on > 1 ? "s" : "") : "Aucune alerte déclenchée");
    var hit = L.items.filter(function (it) { return status(it)[0] === "on"; });
    SO.set("hits", hit.map(function (it) { var c = last(it); return "<li><b>" + SO.esc(it.nom) + "</b> cote " + SO.n(c, 2) + " €, " + (it.haut && c >= it.haut ? "au-dessus de votre seuil de " + SO.n(it.haut, 2) + " €" : "sous votre seuil de " + SO.n(it.bas, 2) + " €") + (it.note ? ". Votre note : « " + SO.esc(it.note) + " »" : "") + ".</li>"; }).join(""));
  }
  var tb = document.getElementById("rows");
  tb.addEventListener("change", function (e) {
    var tr = e.target.closest("tr"), k = e.target.dataset.k; if (!tr || !k) return;
    var it = cur().items[+tr.dataset.i];
    if (k === "cours") { var v = SO.num(e.target.value); if (v > 0) { it.h.push([new Date().toISOString().slice(0, 10), v]); if (it.h.length > 60) it.h.shift(); var st = status(it); if (st[0] === "on") SO.toast(it.nom + " : " + st[1]); } }
    else if (k === "nom") it.nom = e.target.value;
    else it[k] = SO.num(e.target.value);
    save(); render(); SO.used("alertes");
  });
  tb.addEventListener("click", function (e) { var b = e.target.closest("[data-del]"); if (b) { cur().items.splice(+b.closest("tr").dataset.i, 1); save(); render(); } });
  document.getElementById("lists").addEventListener("click", function (e) { var b = e.target.closest("[data-l]"); if (b) { S.active = +b.dataset.l; save(); render(); } });
  document.getElementById("f").addEventListener("submit", function (e) {
    e.preventDefault(); var f = e.target, nom = f.nom.value.trim(); if (!nom) return;
    var c = SO.num(f.cours.value);
    cur().items.push({ nom: nom, haut: SO.num(f.haut.value), bas: SO.num(f.bas.value), note: f.note.value.trim(), h: c > 0 ? [[new Date().toISOString().slice(0, 10), c]] : [] });
    f.reset(); save(); render(); SO.used("alertes"); f.nom.focus();
  });
  document.getElementById("newList").addEventListener("click", function () { var n = prompt("Nom de la nouvelle liste :", "Liste " + (S.listes.length + 1)); if (n) { S.listes.push({ nom: n.slice(0, 40), items: [] }); S.active = S.listes.length - 1; save(); render(); } });
  document.getElementById("delList").addEventListener("click", function () { if (S.listes.length < 2) { SO.toast("Gardez au moins une liste."); return; } if (confirm("Supprimer la liste « " + cur().nom + " » ?")) { S.listes.splice(S.active, 1); S.active = 0; save(); render(); } });
  document.getElementById("demo").addEventListener("click", function () { if (cur().items.length && !confirm("Remplacer le contenu de cette liste par l'exemple ?")) return; cur().items = JSON.parse(JSON.stringify(EX.listes[0].items)); save(); render(); });
  document.getElementById("csv").addEventListener("click", function () {
    var rows = [["Liste", "Valeur", "Date", "Cours", "Seuil haut", "Seuil bas", "Note"]];
    S.listes.forEach(function (l) { l.items.forEach(function (it) { (it.h.length ? it.h : [["", ""]]).forEach(function (h) { rows.push([l.nom, it.nom, h[0], h[1] === "" ? "" : SO.n(h[1], 2), it.haut ? SO.n(it.haut, 2) : "", it.bas ? SO.n(it.bas, 2) : "", it.note]); }); }); });
    SO.download("alertes-socle.csv", SO.csv(rows), "text/csv;charset=utf-8");
  });
  render();
})();
