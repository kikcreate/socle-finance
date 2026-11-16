/* Socle : espace Apprendre (sommaire automatique, quiz, suivi des chapitres et leçons). Nécessite site.js. */
(function () {
  "use strict";
  var esc = function (s) { return window.Socle ? Socle.esc(s) : s; };

  /* Quiz réutilisable.
     questions : [{q:"question", o:["choix",...], a:indexBonneRéponse, e:"explication"}]
     opts.onPass(firstTry) appelé quand toutes les réponses sont justes. */
  function renderQuiz(el, questions, opts) {
    opts = opts || {};
    var attempt = 0;
    function draw() {
      attempt++;
      var answered = 0, good = 0;
      el.innerHTML = (opts.title ? "<h3>" + esc(opts.title) + "</h3>" : "") +
        (opts.intro ? '<p class="muted small" style="margin-top:4px">' + esc(opts.intro) + "</p>" : "") +
        questions.map(function (q, i) {
          return '<div class="q" data-i="' + i + '"><p>' + (i + 1) + ". " + esc(q.q) + '</p><div class="opts">' +
            q.o.map(function (o, j) { return '<button type="button" class="opt" data-j="' + j + '"><span class="num" aria-hidden="true">' + "ABCD".charAt(j) + "</span><span>" + esc(o) + "</span></button>"; }).join("") +
            '</div><p class="why" hidden></p></div>';
        }).join("") + '<p class="score" role="status" aria-live="polite"></p>';
      [].forEach.call(el.querySelectorAll(".q"), function (qd) {
        var q = questions[+qd.dataset.i];
        [].forEach.call(qd.querySelectorAll(".opt"), function (b) {
          b.addEventListener("click", function () {
            var j = +b.dataset.j, ok = j === q.a;
            [].forEach.call(qd.querySelectorAll(".opt"), function (x) { x.disabled = true; if (+x.dataset.j === q.a) x.classList.add("ok"); });
            if (!ok) b.classList.add("ko");
            var w = qd.querySelector(".why"); w.hidden = false; w.innerHTML = "<b>" + (ok ? "Bonne réponse. " : "Pas tout à fait. ") + "</b>" + esc(q.e || "");
            answered++; if (ok) good++;
            if (answered === questions.length) finish();
          });
        });
      });
      function finish() {
        var sc = el.querySelector(".score");
        if (good === questions.length) {
          sc.innerHTML = "✓ " + good + "/" + questions.length + " : " + esc(opts.passText || "réussi !");
          if (opts.onPass) opts.onPass(attempt === 1);
        } else {
          sc.innerHTML = good + "/" + questions.length + " bonne(s) réponse(s). Relisez le passage concerné puis réessayez. ";
          var r = document.createElement("button"); r.type = "button"; r.className = "btn ghost"; r.textContent = "Recommencer le quiz"; r.style.marginLeft = "6px";
          r.addEventListener("click", draw); sc.appendChild(r);
        }
      }
    }
    draw();
  }

  /* Sommaire automatique à partir des h2 de .prose */
  function buildToc() {
    var toc = document.querySelector("[data-toc]"), prose = document.querySelector(".prose");
    if (!toc || !prose) return;
    var hs = [].slice.call(prose.querySelectorAll("h2"));
    toc.innerHTML = '<h2>Dans ce chapitre</h2>' + hs.map(function (h) {
      if (!h.id) h.id = Socle.slug(h.textContent);
      return '<a href="#' + h.id + '">' + esc(h.textContent) + "</a>";
    }).join("");
    if ("IntersectionObserver" in window) {
      var links = [].slice.call(toc.querySelectorAll("a"));
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + e.target.id)); }); });
      }, { rootMargin: "-20% 0px -70% 0px" });
      hs.forEach(function (h) { io.observe(h); });
    }
  }

  /* Page de chapitre : <div id="quiz" data-chapter="3"></div> + window.CHAPTER_QUIZ */
  function chapterPage() {
    var qz = document.getElementById("quiz");
    if (!qz || !window.CHAPTER_QUIZ) return;
    var n = +qz.dataset.chapter;
    var st = document.getElementById("chapState");
    function refresh() { if (st) { var done = Socle.progress.get().chapters.indexOf(n) > -1; st.innerHTML = done ? '<span class="tag free">✓ Chapitre terminé</span>' : '<span class="tag">À terminer : réussissez le quiz</span>'; } }
    renderQuiz(qz, window.CHAPTER_QUIZ, {
      title: "Vérifiez que c'est acquis", intro: "Trois questions. Répondez juste à toutes pour valider le chapitre (+40 XP).",
      passText: "chapitre validé. Passez au suivant quand vous voulez.",
      onPass: function (first) { Socle.progress.chapter(n); if (first) Socle.progress.unlock("perfect"); refresh(); }
    });
    refresh();
  }

  window.SocleLearn = { quiz: renderQuiz };
  document.addEventListener("socle:ready", function () { buildToc(); chapterPage(); });
})();
