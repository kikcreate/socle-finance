/* Socle : bibliothèque commune des simulateurs (formats, formulaires, graphiques, fiscalité).
   Aucun service externe : tout tourne dans le navigateur, en fichiers statiques. */
(function () {
  "use strict";
  var SO = window.SO = {};

  /* ---------- Paramètres fiscaux et réglementaires (France, novembre 2026) ----------
     Sources vérifiées le 16/11/2026 : LFSS 2026 (loi n° 2025-1403 du 30/12/2025, art. 12, CSG capital 10,6 %),
     barème IR 2026 sur revenus 2025 (indexation +0,9 %), taux des livrets en vigueur du 01/08/2026 au 31/01/2027. */
  SO.FISC = {
    maj: "novembre 2026",
    ps: 0.186,          // prélèvements sociaux 2026 : CSG 10,6 + CRDS 0,5 + solidarité 7,5 (CTO, PEA, PER, livrets fiscalisés)
    psAV: 0.172,        // assurance-vie : inchangé à 17,2 %
    ir: 0.128,          // part impôt du prélèvement forfaitaire unique
    pfu: 0.314,         // PFU global 2026 sur CTO : 12,8 + 18,6
    pfuAV: 0.30,        // rachat d'assurance-vie avant 8 ans : 12,8 + 17,2
    av8: 0.075,         // après 8 ans, pour les versements jusqu'à 150 000 €
    avAbat: { seul: 4600, couple: 9200 },
    avSeuil: 150000,
    pea: { plafond: 150000, plafondPME: 225000 },
    livretA: { taux: 0.017, plafond: 22950 },
    ldds: { taux: 0.017, plafond: 12000 },
    lep: { taux: 0.025, plafond: 10000 },
    pel: 0.02,
    pass2025: 47100,    // le plafond PER 2026 se calcule sur les revenus 2025 et le PASS 2025
    pass2026: 48060,
    bareme: [[11600, 0], [29579, 0.11], [84577, 0.30], [181917, 0.41], [Infinity, 0.45]],
    decote: { seul: 897, couple: 1483, taux: 0.4525 }, // décote = forfait − 45,25 % de l'impôt brut (s'annule à 1 982 € et 3 277 €)
    qfDemiPart: 1807,
    endettement: 0.35
  };

  /* ---------- Formats ---------- */
  var nf = {};
  function fmt(d) { if (!nf[d]) nf[d] = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }); return nf[d]; }
  SO.n = function (v, d) { if (!isFinite(v)) return "∞"; return fmt(d || 0).format(v).replace(/ /g, " "); };
  SO.eur = function (v, d) { if (!isFinite(v)) return "—"; if (d == null) d = Math.abs(v) < 100 && v % 1 ? 2 : 0; return SO.n(v, d) + " €"; };
  SO.pct = function (v, d) { if (!isFinite(v)) return "—"; return SO.n(v * 100, d == null ? 1 : d) + " %"; };
  SO.sgn = function (v, f) { return (v >= 0 ? "+" : "−") + f(Math.abs(v)); };
  SO.short = function (v) {
    var a = Math.abs(v);
    if (a >= 1e9) return SO.n(v / 1e9, a >= 1e10 ? 0 : 1) + " Md";
    if (a >= 1e6) return SO.n(v / 1e6, a >= 1e7 ? 0 : 1) + " M";
    if (a >= 1e4) return SO.n(v / 1e3, 0) + " k";
    return SO.n(v, a < 10 && v % 1 ? 1 : 0);
  };
  SO.ans = function (n) { n = Math.round(n * 10) / 10; return SO.n(n, n % 1 ? 1 : 0) + (n >= 2 ? " ans" : " an"); };
  SO.duree = function (mois) {
    if (!isFinite(mois)) return "jamais";
    mois = Math.round(mois); var a = Math.floor(mois / 12), m = mois % 12, out = [];
    if (a) out.push(a + (a > 1 ? " ans" : " an")); if (m) out.push(m + " mois");
    return out.join(" et ") || "0 mois";
  };
  SO.esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  SO.$ = function (s, r) { return (r || document).querySelector(s); };
  SO.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  SO.set = function (id, html) { var e = document.getElementById(id); if (e) e.innerHTML = html; };
  SO.txt = function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };
  SO.num = function (v) { if (typeof v === "number") return v; v = String(v).replace(/\s| | |€|%/g, "").replace(",", "."); var x = parseFloat(v); return isFinite(x) ? x : 0; };

  /* ---------- Stockage local (tolérant aux navigateurs qui le bloquent) ---------- */
  SO.store = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { } }
  };

  /* ---------- Toast ---------- */
  var tq = [], tbusy = false;
  SO.toast = function (msg) {
    if (tq.length > 3) tq.shift(); tq.push(msg);
    if (tbusy) return;
    (function next() {
      if (!tq.length) { tbusy = false; return; } tbusy = true;
      var m = tq.shift();
      if (window.Socle && typeof Socle.toast === "function") Socle.toast(m);
      else {
        var t = document.getElementById("so-toast");
        if (!t) { t = document.createElement("div"); t.id = "so-toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
        t.textContent = m; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(function () { t.hidden = true; }, 2600);
      }
      setTimeout(next, 1800);
    })();
  };


  /* ---------- Formulaires : lecture, sorties des curseurs, lien partageable ----------
     SO.form("#f", function (v) { ... }) appelle la fonction à chaque saisie avec un objet {nom: valeur}.
     Les valeurs sont reprises de l'adresse (?nom=valeur) pour pouvoir partager une simulation. */
  SO.form = function (sel, compute, opts) {
    opts = opts || {};
    var f = typeof sel === "string" ? SO.$(sel) : sel; if (!f) return;
    var q = new URLSearchParams(location.search);
    SO.$$("input,select", f).forEach(function (el) {
      if (!el.name || !q.has(el.name)) return;
      var v = q.get(el.name);
      if (el.type === "checkbox") el.checked = v === "1";
      else if (el.type === "radio") el.checked = el.value === v;
      else el.value = v;
    });
    function read() {
      var v = {};
      SO.$$("input,select", f).forEach(function (el) {
        if (!el.name) return;
        if (el.type === "checkbox") v[el.name] = el.checked;
        else if (el.type === "radio") { if (el.checked) v[el.name] = el.value; }
        else if (el.type === "number" || el.type === "range") v[el.name] = SO.num(el.value);
        else v[el.name] = el.value;
      });
      return v;
    }
    function outputs() {
      SO.$$("output[for]", f).forEach(function (o) {
        var el = document.getElementById(o.htmlFor.value || o.getAttribute("for")); if (!el) return;
        var x = SO.num(el.value), k = o.dataset.fmt || "n";
        o.textContent = k === "eur" ? SO.eur(x) : k === "pct" ? SO.n(x, x % 1 ? (x * 10 % 1 ? 2 : 1) : 0) + " %" : k === "ans" ? SO.ans(x) : SO.n(x, x % 1 ? 1 : 0) + (o.dataset.suf || "");
      });
    }
    function link() {
      var p = new URLSearchParams();
      SO.$$("input,select", f).forEach(function (el) {
        if (!el.name || el.dataset.noshare != null) return;
        if (el.type === "checkbox") p.set(el.name, el.checked ? "1" : "0");
        else if (el.type === "radio") { if (el.checked) p.set(el.name, el.value); }
        else p.set(el.name, el.value);
      });
      return p.toString();
    }
    var tm;
    function run() {
      outputs();
      try { compute(read()); } catch (e) { if (window.console) console.error(e); }
      clearTimeout(tm);
      tm = setTimeout(function () { try { history.replaceState(null, "", "?" + link() + location.hash); } catch (e) { } }, 300);
    }
    var touched = false;
    function first() { if (touched) return; touched = true; if (opts.tool) SO.used(opts.tool); if (opts.onFirst) opts.onFirst(); }
    f.addEventListener("input", function () { first(); run(); }); f.addEventListener("change", run);
    f.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    SO.$$("[data-share]").forEach(function (b) {
      b.addEventListener("click", function () {
        var url = location.href.split("?")[0].split("#")[0] + "?" + link();
        var done = function () { SO.toast("Lien copié : il garde vos hypothèses."); };
        if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt("Copiez ce lien :", url); });
        else prompt("Copiez ce lien :", url);
      });
    });
    SO.$$("[data-print]").forEach(function (b) { b.addEventListener("click", function () { window.print(); }); });
    SO.$$("[data-reset]").forEach(function (b) {
      b.addEventListener("click", function () { f.reset(); try { history.replaceState(null, "", location.pathname); } catch (e) { } run(); });
    });
    run();
    return { run: run, read: read };
  };

  /* ---------- Onglets accessibles : <div class="tabs" role="tablist"> + [data-panel] ---------- */
  SO.tabs = function (root, onChange) {
    root = typeof root === "string" ? SO.$(root) : root; if (!root) return;
    var btns = SO.$$("[role=tab]", root);
    function sel(b, focus) {
      btns.forEach(function (x) {
        var on = x === b; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !on;
      });
      if (focus) b.focus(); if (onChange) onChange(b.dataset.tab || b.getAttribute("aria-controls"));
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { sel(b); });
      b.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
        e.preventDefault(); sel(btns[(i + d + btns.length) % btns.length], true);
      });
    });
    var start = btns.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || btns[0];
    if (start) sel(start);
    return { select: function (k) { var b = btns.filter(function (x) { return x.dataset.tab === k; })[0]; if (b) sel(b); } };
  };

  /* ---------- Calculs financiers ---------- */
  // taux mensuel équivalent à un taux annuel (capitalisation annuelle effective)
  SO.tm = function (ta) { return Math.pow(1 + ta, 1 / 12) - 1; };
  // valeur future d'un capital et de versements mensuels en fin de mois
  SO.fv = function (pv, pmt, ta, mois) {
    var r = SO.tm(ta);
    if (Math.abs(r) < 1e-12) return pv + pmt * mois;
    var g = Math.pow(1 + r, mois);
    return pv * g + pmt * (g - 1) / r;
  };
  // versement mensuel pour atteindre une cible
  SO.pmtFor = function (cible, pv, ta, mois) {
    var r = SO.tm(ta);
    if (mois <= 0) return Infinity;
    if (Math.abs(r) < 1e-12) return (cible - pv) / mois;
    var g = Math.pow(1 + r, mois);
    return (cible - pv * g) * r / (g - 1);
  };
  // mensualité d'un prêt (taux nominal annuel / 12, convention bancaire française)
  SO.mensualite = function (capital, tauxAnnuel, mois) {
    var r = tauxAnnuel / 12; if (!r) return capital / mois;
    return capital * r / (1 - Math.pow(1 + r, -mois));
  };
  // série annuelle d'une épargne : retourne [{an, verse, valeur}]
  SO.serie = function (pv, pmt, ta, ans, opts) {
    opts = opts || {};
    var r = SO.tm(ta), v = pv, verse = pv, out = [{ an: 0, verse: verse, valeur: v }], m, a, p = pmt;
    for (a = 1; a <= ans; a++) {
      for (m = 0; m < 12; m++) { v = v * (1 + r) + p; verse += p; }
      if (opts.indexation) p *= 1 + opts.indexation;
      out.push({ an: a, verse: verse, valeur: v });
    }
    return out;
  };

  /* Impôt sur le revenu (barème 2026 sur revenus 2025), quotient familial plafonné et décote. */
  function brut(rev, parts) {
    var q = rev / parts, imp = 0, prev = 0;
    SO.FISC.bareme.forEach(function (t) { var h = Math.min(q, t[0]); if (h > prev) imp += (h - prev) * t[1]; prev = t[0]; });
    return imp * parts;
  }
  SO.impot = function (rev, parts, couple) {
    rev = Math.max(0, rev); parts = Math.max(1, parts);
    var base = couple ? 2 : 1, iBase = brut(rev, base), iParts = brut(rev, parts);
    var plafond = (parts - base) * 2 * SO.FISC.qfDemiPart;
    var avantQF = parts > base ? Math.min(iBase - iParts, plafond) : 0;
    var plafonne = parts > base && iBase - iParts > plafond;
    var b = parts > base ? iBase - avantQF : iBase;
    var dc = couple ? SO.FISC.decote.couple : SO.FISC.decote.seul;
    var decote = Math.max(0, Math.min(b, dc - SO.FISC.decote.taux * b));
    var net = b - decote; if (net < 61) net = 0; // impôt non mis en recouvrement sous 61 €
    // taux marginal : tranche atteinte par le quotient de référence
    var qRef = plafonne ? rev / base : rev / parts, tmi = 0;
    SO.FISC.bareme.forEach(function (t, i) { var lo = i ? SO.FISC.bareme[i - 1][0] : 0; if (qRef > lo) tmi = t[1]; });
    return { brut: b, decote: decote, net: Math.round(net), tmi: tmi, avantQF: avantQF, plafonne: plafonne, moyen: rev ? net / rev : 0 };
  };

  /* ---------- Graphiques SVG légers ---------- */
  var COL = ["var(--s1)", "var(--s2)", "var(--s4)", "var(--s3)", "var(--down)", "var(--muted)"];
  SO.COL = COL;
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  }
  function svgEl(w, h, label) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + SO.esc(label || "Graphique") + '" preserveAspectRatio="xMidYMid meet">';
  }
  function legend(series) {
    return '<div class="ch-legend">' + series.filter(function (s) { return !s.noLegend; }).map(function (s, i) {
      return '<span><i style="background:' + (s.color || COL[i]) + (s.dash ? ';background:repeating-linear-gradient(90deg,' + (s.color || COL[i]) + ' 0 4px,transparent 4px 7px)' : '') + '"></i>' + SO.esc(s.name) + "</span>";
    }).join("") + "</div>";
  }

  /* Courbes ou aires empilées.
     opt = {labels:[...], series:[{name,data,color,area,dash}], stacked, yFmt, xFmt, tipFmt, title, yMin, marks:[{x,label}]} */
  SO.chart = function (el, opt) {
    el = typeof el === "string" ? document.getElementById(el) : el; if (!el) return;
    var W = 680, H = 300, L = 62, R = 14, T = 14, B = 32;
    var n = opt.labels.length, series = opt.series, yFmt = opt.yFmt || SO.short, xFmt = opt.xFmt || function (x) { return x; };
    var stackTop = [], tops = series.map(function (s) { return s.data.slice(); });
    if (opt.stacked) { for (var si = 1; si < series.length; si++) for (var k = 0; k < n; k++) tops[si][k] += tops[si - 1][k]; }
    var all = [].concat.apply([], tops).filter(isFinite);
    var lo = opt.yMin != null ? opt.yMin : Math.min(0, Math.min.apply(null, all)), hi = Math.max.apply(null, all);
    if (hi <= lo) hi = lo + 1;
    var step = niceStep(hi - lo, 5); lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    var X = function (i) { return L + (n < 2 ? 0 : i / (n - 1)) * (W - L - R); }, Y = function (v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); };
    var s = svgEl(W, H, opt.title);
    for (var g = lo; g <= hi + step / 2; g += step) {
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g).toFixed(1) + '" y2="' + Y(g).toFixed(1) + '" class="ch-grid' + (Math.abs(g) < step / 1e6 ? " ch-zero" : "") + '"/>';
      s += '<text x="' + (L - 8) + '" y="' + (Y(g) + 4).toFixed(1) + '" text-anchor="end" class="ch-ax">' + yFmt(g) + "</text>";
    }
    var every = Math.max(1, Math.ceil(n / 8));
    for (var i = 0; i < n; i++) if (i % every === 0 || i === n - 1) {
      if (i === n - 1 && i % every !== 0 && i % every < every / 2) continue;
      s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle" class="ch-ax">' + SO.esc(xFmt(opt.labels[i], i)) + "</text>";
    }
    (opt.marks || []).forEach(function (m) {
      s += '<line x1="' + X(m.x) + '" x2="' + X(m.x) + '" y1="' + T + '" y2="' + (H - B) + '" class="ch-mark"/><text x="' + (X(m.x) + 4) + '" y="' + (T + 12) + '" class="ch-ax">' + SO.esc(m.label) + "</text>";
    });
    series.forEach(function (se, si) {
      var c = se.color || COL[si], top = tops[si], pts = top.map(function (v, k) { return X(k).toFixed(1) + "," + Y(v).toFixed(1); });
      if (se.area || opt.stacked) {
        var base = opt.stacked && si ? tops[si - 1] : null, back = [];
        for (var k = n - 1; k >= 0; k--) back.push(X(k).toFixed(1) + "," + Y(base ? base[k] : Math.max(lo, 0)).toFixed(1));
        s += '<polygon points="' + pts.join(" ") + " " + back.join(" ") + '" fill="' + c + '" opacity="' + (opt.stacked ? 0.85 : 0.14) + '"/>';
      }
      if (!opt.stacked || se.line) s += '<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + c + '" stroke-width="2.5" stroke-linejoin="round"' + (se.dash ? ' stroke-dasharray="6 5"' : "") + "/>";
    });
    s += '<line class="ch-hair" x1="0" x2="0" y1="' + T + '" y2="' + (H - B) + '" visibility="hidden"/>';
    s += '<rect class="ch-hit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '" fill="transparent"/></svg>';
    el.innerHTML = legend(series) + '<div class="ch-box">' + s + '<div class="ch-tip" hidden></div></div>';
    var svg = el.querySelector("svg"), tip = el.querySelector(".ch-tip"), hair = el.querySelector(".ch-hair");
    function show(e) {
      var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W;
      var i = Math.round((x - L) / (W - L - R) * (n - 1)); if (i < 0 || i >= n) return;
      hair.setAttribute("x1", X(i)); hair.setAttribute("x2", X(i)); hair.setAttribute("visibility", "visible");
      var tf = opt.tipFmt || function (v) { return SO.eur(v); };
      tip.innerHTML = "<b>" + SO.esc(opt.tipTitle ? opt.tipTitle(opt.labels[i], i) : xFmt(opt.labels[i], i)) + "</b>" + series.map(function (se, si) {
        return '<span><i style="background:' + (se.color || COL[si]) + '"></i>' + SO.esc(se.name) + " <em>" + tf(se.data[i], i, si) + "</em></span>";
      }).join("") + (opt.tipExtra ? opt.tipExtra(i) : "");
      tip.hidden = false;
      var px = X(i) / W * r.width; tip.style.left = Math.min(Math.max(px, 70), r.width - 70) + "px";
    }
    svg.addEventListener("pointermove", show);
    svg.addEventListener("pointerdown", show);
    svg.addEventListener("pointerleave", function () { tip.hidden = true; hair.setAttribute("visibility", "hidden"); });
  };

  /* Barres verticales groupées ou empilées. opt = {labels, series:[{name,data,color}], stacked, yFmt, tipFmt} */
  SO.bars = function (el, opt) {
    el = typeof el === "string" ? document.getElementById(el) : el; if (!el) return;
    var W = 680, H = 280, L = 62, R = 10, T = 14, B = 34, n = opt.labels.length, series = opt.series, yFmt = opt.yFmt || SO.short;
    var vals = [];
    for (var i = 0; i < n; i++) {
      if (opt.stacked) { var p = 0, m = 0; series.forEach(function (s) { var v = s.data[i] || 0; if (v > 0) p += v; else m += v; }); vals.push(p, m); }
      else series.forEach(function (s) { vals.push(s.data[i] || 0); });
    }
    var lo = Math.min(0, Math.min.apply(null, vals)), hi = Math.max(0, Math.max.apply(null, vals)); if (hi === lo) hi = lo + 1;
    var step = niceStep(hi - lo, 5); lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    var Y = function (v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); }, slot = (W - L - R) / n;
    var s = svgEl(W, H, opt.title);
    for (var g = lo; g <= hi + step / 2; g += step) {
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g).toFixed(1) + '" y2="' + Y(g).toFixed(1) + '" class="ch-grid' + (Math.abs(g) < step / 1e6 ? " ch-zero" : "") + '"/><text x="' + (L - 8) + '" y="' + (Y(g) + 4).toFixed(1) + '" text-anchor="end" class="ch-ax">' + yFmt(g) + "</text>";
    }
    var every = Math.max(1, Math.ceil(n / 12));
    for (i = 0; i < n; i++) {
      var x0 = L + i * slot, gw = slot * 0.72, ox = x0 + slot * 0.14;
      if (opt.stacked) {
        var pos = 0, neg = 0;
        series.forEach(function (se, si) {
          var v = se.data[i] || 0, a = v >= 0 ? pos : neg, b = a + v; if (v >= 0) pos = b; else neg = b;
          s += '<rect data-i="' + i + '" x="' + ox.toFixed(1) + '" width="' + gw.toFixed(1) + '" y="' + Y(Math.max(a, b)).toFixed(1) + '" height="' + Math.abs(Y(a) - Y(b)).toFixed(1) + '" fill="' + (se.color || COL[si]) + '" rx="2"/>';
        });
      } else {
        var bw = gw / series.length;
        series.forEach(function (se, si) {
          var v = se.data[i] || 0, c = typeof se.color === "function" ? se.color(v, i) : (se.color || COL[si]);
          s += '<rect data-i="' + i + '" x="' + (ox + si * bw).toFixed(1) + '" width="' + Math.max(1, bw - 2).toFixed(1) + '" y="' + Y(Math.max(0, v)).toFixed(1) + '" height="' + Math.abs(Y(0) - Y(v)).toFixed(1) + '" fill="' + c + '" rx="2"/>';
        });
      }
      if (i % every === 0) s += '<text x="' + (x0 + slot / 2).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" class="ch-ax">' + SO.esc(opt.xFmt ? opt.xFmt(opt.labels[i], i) : opt.labels[i]) + "</text>";
    }
    s += "</svg>";
    el.innerHTML = (series.length > 1 || opt.legend ? legend(series) : "") + '<div class="ch-box">' + s + '<div class="ch-tip" hidden></div></div>';
    var tip = el.querySelector(".ch-tip"), svg = el.querySelector("svg");
    function show(e) {
      var r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * W, i = Math.floor((x - L) / slot);
      if (i < 0 || i >= n) { tip.hidden = true; return; }
      var tf = opt.tipFmt || function (v) { return SO.eur(v); };
      tip.innerHTML = "<b>" + SO.esc(opt.labels[i]) + "</b>" + series.map(function (se, si) {
        return '<span><i style="background:' + (typeof se.color === "string" ? se.color : COL[si]) + '"></i>' + SO.esc(se.name) + " <em>" + tf(se.data[i] || 0, i, si) + "</em></span>";
      }).join("");
      tip.hidden = false; tip.style.left = Math.min(Math.max((L + (i + 0.5) * slot) / W * r.width, 70), r.width - 70) + "px";
    }
    svg.addEventListener("pointermove", show); svg.addEventListener("pointerdown", show);
    svg.addEventListener("pointerleave", function () { tip.hidden = true; });
  };

  /* Anneau de répartition. parts = [{label, value, color}] */
  SO.donut = function (el, parts, center) {
    el = typeof el === "string" ? document.getElementById(el) : el; if (!el) return;
    var tot = parts.reduce(function (a, p) { return a + Math.max(0, p.value); }, 0);
    var s = '<svg viewBox="0 0 42 42" class="donut" role="img" aria-label="Répartition"><circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--soft)" stroke-width="6"/>', off = 25;
    parts.forEach(function (p, i) {
      if (!tot || p.value <= 0) return; var x = p.value / tot * 100;
      s += '<circle cx="21" cy="21" r="15.9" fill="none" stroke="' + (p.color || COL[i % COL.length]) + '" stroke-width="6" stroke-dasharray="' + x.toFixed(3) + " " + (100 - x).toFixed(3) + '" stroke-dashoffset="' + off.toFixed(3) + '"><title>' + SO.esc(p.label) + " " + SO.pct(p.value / tot, 0) + "</title></circle>";
      off -= x;
    });
    if (center) s += '<text x="21" y="20.5" text-anchor="middle" class="dn-c">' + SO.esc(center[0]) + '</text><text x="21" y="26" text-anchor="middle" class="dn-s">' + SO.esc(center[1] || "") + "</text>";
    s += "</svg>";
    var lg = '<div class="legend">' + parts.filter(function (p) { return p.value > 0; }).map(function (p, i) {
      return '<div><i style="background:' + (p.color || COL[parts.indexOf(p) % COL.length]) + '"></i><span>' + SO.esc(p.label) + '</span><span class="num">' + (tot ? SO.pct(p.value / tot, 0) : "—") + "</span></div>";
    }).join("") + "</div>";
    el.innerHTML = '<div class="dn-wrap">' + s + lg + "</div>";
  };

  /* Tableau simple. rows = tableaux de cellules (HTML autorisé) */
  SO.table = function (el, head, rows, opt) {
    el = typeof el === "string" ? document.getElementById(el) : el; if (!el) return;
    opt = opt || {};
    el.innerHTML = '<div class="tbl"><table' + (opt.cls ? ' class="' + opt.cls + '"' : "") + "><thead><tr>" + head.map(function (h, i) { return "<th" + (i && opt.right !== false ? ' class="r"' : "") + ">" + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i && opt.right !== false ? ' class="r num"' : "") + ">" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  };

  /* Petite courbe pour les listes */
  SO.spark = function (data, w, h) {
    w = w || 90; h = h || 30; if (!data || data.length < 2) return "";
    var mn = Math.min.apply(null, data), mx = Math.max.apply(null, data), r = mx - mn || 1;
    var pts = data.map(function (v, i) { return (i / (data.length - 1) * (w - 2) + 1).toFixed(1) + "," + (h - 2 - (v - mn) / r * (h - 4)).toFixed(1); }).join(" ");
    return '<svg class="spark" viewBox="0 0 ' + w + " " + h + '" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="' + (data[data.length - 1] >= data[0] ? "var(--up)" : "var(--down)") + '" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  };

  /* Téléchargement d'un fichier généré (CSV, JSON) */
  SO.download = function (name, content, type) {
    var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  SO.csv = function (rows) {
    return "﻿" + rows.map(function (r) { return r.map(function (c) { c = String(c == null ? "" : c); return /[;"\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(";"); }).join("\n");
  };

  /* Progression partagée avec l'espace Apprendre (API de site.js, clé socle-progress) */
  SO.used = function (tool) { try { if (window.Socle && Socle.progress) Socle.progress.tool(tool); } catch (e) { } };
  SO.unlock = function (id) { try { if (window.Socle && Socle.progress) Socle.progress.unlock(id); } catch (e) { } };
  SO.xp = function (n) { try { if (window.Socle && Socle.progress) Socle.progress.addXp(n); } catch (e) { } };
})();

/* Guides liés : n'affiche que les guides réellement publiés (liste window.SOCLE_GUIDES), donc jamais de lien mort */
(function () {
  "use strict";
  function go() {
    var box = document.querySelector("[data-guides]"); if (!box) return;
    var list = window.SOCLE_GUIDES || [], want = box.getAttribute("data-guides").split(","), out = [], seen = {};
    want.forEach(function (w) {
      w = w.trim();
      list.forEach(function (g) { if (!seen[g.slug] && (g.slug === w || g.slug.indexOf(w) === 0)) { seen[g.slug] = 1; out.push(g); } });
    });
    var ul = box.querySelector(".more");
    if (!out.length) { box.hidden = true; return; }
    ul.innerHTML = out.slice(0, 5).map(function (g) { return '<a class="g" href="../' + g.href + '">' + SO.esc(g.title) + " →</a>"; }).join("");
    box.hidden = false;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
