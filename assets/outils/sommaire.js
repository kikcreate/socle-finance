/* Sommaire des outils : filtre par catégorie et recherche */
(function () {
  "use strict";
  var q = document.getElementById("q"), cat = "", btns = Array.prototype.slice.call(document.querySelectorAll("[data-f]"));
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function apply() {
    var t = norm(q.value.trim()), any = false;
    document.querySelectorAll(".tcard").forEach(function (c) { var ok = (!cat || c.dataset.cat === cat) && (!t || norm(c.dataset.q).indexOf(t) >= 0); c.hidden = !ok; if (ok) any = true; });
    document.querySelectorAll(".tool-grid").forEach(function (g) { var vis = g.querySelectorAll(".tcard:not([hidden])").length > 0; g.hidden = !vis; var h = g.previousElementSibling; if (h) h.hidden = !vis; });
    document.getElementById("none").hidden = any;
  }
  btns.forEach(function (b) { b.addEventListener("click", function () { cat = b.dataset.f; btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); apply(); }); });
  q.addEventListener("input", apply);
  var m = location.hash.match(/q=([^&]+)/); if (m) { q.value = decodeURIComponent(m[1]); apply(); }
})();
