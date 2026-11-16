/* Socle Finance : comportements des pages de guides.
   - article : barre de lecture, sommaire actif, sommaire replié sur mobile, quiz, progression (Socle.progress.guide) ;
   - sommaire des guides : filtres par thème, niveau et mot-clé, badges « Lu ». */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var S = function () { return window.Socle || null; };
  var KEY = "socle-guides-lus";
  function readSet() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function markRead(slug) {
    var l = readSet(); if (l.indexOf(slug) > -1) return false;
    l.push(slug); try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {}
    return true;
  }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

  function article(main) {
    var slug = main.getAttribute("data-guide");
    /* Barre de lecture */
    var bar = $(".g-progress > i");
    var art = $(".g-main");
    function onScroll() {
      if (!bar || !art) return;
      var r = art.getBoundingClientRect(), h = art.offsetHeight - innerHeight * 0.6;
      bar.style.width = Math.max(0, Math.min(100, (-r.top / Math.max(1, h)) * 100)) + "%";
    }
    addEventListener("scroll", onScroll, { passive: true }); onScroll();

    /* Sommaire : repli sur mobile, section active */
    var toc = $(".g-toc");
    if (toc && matchMedia("(max-width:960px)").matches) toc.open = false;
    var links = $$(".g-toc a");
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function () {
        var cur = -1;
        targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < 140) cur = i; });
        links.forEach(function (a, i) { if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      }, { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
    links.forEach(function (a) { a.addEventListener("click", function () { if (toc && matchMedia("(max-width:960px)").matches) toc.open = false; }); });

    /* Quiz */
    var quiz = $(".g-quiz");
    if (quiz) {
      var qs = $$(".q", quiz), good = 0, done = 0, score = $(".score", quiz);
      qs.forEach(function (q) {
        var a = +q.getAttribute("data-a");
        /* Ordre des réponses mélangé à chaque visite */
        var box = $(".opts", q), os = $$(".opt", q);
        for (var k = os.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var tmp = os[k]; os[k] = os[j]; os[j] = tmp; }
        os.forEach(function (o) { box.appendChild(o); });
        $$(".opt", q).forEach(function (b) {
          b.addEventListener("click", function () {
            var i = +b.getAttribute("data-i");
            $$(".opt", q).forEach(function (o) { o.disabled = true; if (+o.getAttribute("data-i") === a) o.classList.add("ok"); });
            if (i !== a) b.classList.add("ko"); else good++;
            done++;
            $(".why", q).hidden = false;
            if (done === qs.length) {
              score.textContent = good === qs.length ? "Sans faute : " + good + " sur " + qs.length + ". Bravo, c'est acquis." :
                "Résultat : " + good + " sur " + qs.length + ". Relisez les explications ci-dessus, puis passez au guide suivant.";
              var s = S(); if (s && good === qs.length && s.toast) s.toast("Quiz réussi sans faute !");
            }
          });
        });
      });
    }

    /* Fin de lecture : progression */
    var end = $("[data-end]");
    function finish() {
      var fresh = markRead(slug);
      var s = S();
      if (s && s.progress && s.progress.guide) { try { s.progress.guide(slug); } catch (e) {} }
      if (fresh && s && s.toast) s.toast("Guide lu jusqu'au bout. Il est ajouté à votre progression.");
    }
    if (end && "IntersectionObserver" in window) {
      var eo = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { finish(); eo.disconnect(); } }); });
      eo.observe(end);
    }
  }

  function index() {
    var cards = $$(".g-grid .g-card");
    var st = { theme: "", level: "", q: "" };
    var hm = decodeURIComponent(location.hash || "").match(/theme=([^&]+)/);
    if (hm) st.theme = hm[1];
    var input = $("#gFilterQ"), count = $("#gCount"), empty = $("#gEmpty");
    function paint() {
      $$("[data-f-theme]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-f-theme") === st.theme)); });
      $$("[data-f-level]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-f-level") === st.level)); });
      var words = norm(st.q).split(/\s+/).filter(Boolean), n = 0;
      cards.forEach(function (c) {
        var ok = (!st.theme || c.getAttribute("data-theme") === st.theme) && (!st.level || c.getAttribute("data-level") === st.level) &&
          words.every(function (w) { return norm(c.getAttribute("data-text")).indexOf(w) > -1; });
        c.hidden = !ok; if (ok) n++;
      });
      count.textContent = n + (n > 1 ? " guides" : " guide") + (st.theme || st.level || st.q ? (n > 1 ? " correspondent" : " correspond") : "");
      empty.hidden = n > 0;
    }
    $$("[data-f-theme]").forEach(function (b) { b.addEventListener("click", function () { st.theme = b.getAttribute("data-f-theme"); try { history.replaceState(null, "", st.theme ? "#theme=" + encodeURIComponent(st.theme) : location.pathname); } catch (e) {} paint(); }); });
    $$("[data-f-level]").forEach(function (b) { b.addEventListener("click", function () { st.level = b.getAttribute("data-f-level"); paint(); }); });
    if (input) input.addEventListener("input", function () { st.q = input.value; paint(); });
    $$(".g-reset").forEach(function (b) { b.addEventListener("click", function () { st = { theme: "", level: "", q: "" }; if (input) input.value = ""; paint(); }); });
    addEventListener("hashchange", function () { var m = decodeURIComponent(location.hash).match(/theme=([^&]+)/); st.theme = m ? m[1] : ""; paint(); });
    paint();
    if (hm) { var t = $("#tous"); if (t) t.scrollIntoView(); }
  }

  function readBadges() {
    var lus = readSet();
    $$("[data-read-badge]").forEach(function (b) { b.hidden = lus.indexOf(b.getAttribute("data-read-badge")) < 0; });
    $$(".g-path a").forEach(function (a) { if (lus.indexOf(a.getAttribute("href").replace(/\.html$/, "")) > -1) a.classList.add("done"); });
    var c = $("#gReadCount"); if (c) c.textContent = String(lus.length);
  }

  function init() {
    var main = $("main[data-guide]");
    if (main) article(main);
    if ($(".g-index")) index();
    readBadges();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
