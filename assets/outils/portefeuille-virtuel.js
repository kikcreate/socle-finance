/* Portefeuille virtuel : investir de l'argent fictif sur un marché simulé (actifs fictifs), avec dividendes, coupons,
   actualités expliquées, frais de courtage et badges. Sauvegarde locale dans le navigateur. Repris et enrichi de la maquette Pousse. */
(function () {
  "use strict";
  var KEY = "socle-portefeuille-virtuel";
  var TYPES = { action: { l: "Action", c: "var(--s2)" }, etf: { l: "ETF", c: "var(--s1)" }, bond: { l: "Obligation", c: "var(--s3)" }, gold: { l: "Or", c: "var(--s4)" } };
  var ASSETS = [
    { id: "lumen", name: "Café Lumen", type: "action", sector: "Restauration", p: 24.8, vol: .014, drift: .0004, div: .035, risk: 2, about: "Chaîne de cafés-boulangeries présente dans 40 villes. Activité stable, elle reverse une bonne partie de ses bénéfices en dividendes." },
    { id: "volta", name: "Volta Mobilité", type: "action", sector: "Vélos électriques", p: 61.2, vol: .028, drift: .0008, div: 0, risk: 3, about: "Jeune entreprise en forte croissance. Pas de dividende : elle réinvestit tout pour grandir. Son cours peut bondir ou chuter fortement." },
    { id: "nord", name: "Atelier Nord", type: "action", sector: "Luxe", p: 312.5, vol: .013, drift: .0005, div: .015, risk: 2, about: "Maroquinerie haut de gamme vendue dans le monde entier. Une action coûte cher, mais vous pouvez en acheter une fraction." },
    { id: "ventor", name: "Ventor Énergie", type: "action", sector: "Énergies renouvelables", p: 42.1, vol: .016, drift: .0004, div: .038, risk: 2, about: "Producteur d'électricité éolienne et solaire, très endetté mais aux revenus réguliers. Sensible aux taux d'intérêt." },
    { id: "halde", name: "Halde Industrie", type: "action", sector: "Équipements industriels", p: 24.6, vol: .022, drift: .0001, div: .045, risk: 3, about: "Industriel dont les marges baissent depuis trois ans. Son rendement élevé attire, mais le dividende dépasse le bénéfice." },
    { id: "pixel", name: "Pixelia", type: "action", sector: "Jeux vidéo", p: 47.9, vol: .024, drift: .0005, div: 0, risk: 3, about: "Studio de jeux vidéo. Le cours dépend beaucoup du succès de chaque nouveau jeu." },
    { id: "monde", name: "ETF Monde", type: "etf", sector: "1 500 entreprises, 23 pays", p: 98.4, vol: .007, drift: .0003, div: .015, risk: 2, about: "Un panier de 1 500 grandes entreprises du monde entier en une seule ligne. Une mauvaise nouvelle sur l'une d'elles pèse très peu." },
    { id: "europe", name: "ETF Europe", type: "etf", sector: "600 entreprises européennes", p: 54.2, vol: .008, drift: .00025, div: .025, risk: 2, about: "Les 600 plus grandes entreprises européennes. Plus concentré que l'ETF Monde, mais toujours très diversifié." },
    { id: "oat", name: "Obligation d'État 10 ans", type: "bond", sector: "Coupon 3 % par an", p: 100, vol: .0015, drift: 0, coupon: .03, risk: 1, about: "Un prêt à l'État pour 10 ans. Il verse 3 % d'intérêts par an, chaque mois dans le simulateur. Son prix bouge peu, sauf quand les taux changent." },
    { id: "corp", name: "Obligation Lumen 5 ans", type: "bond", sector: "Coupon 4,5 % par an", p: 100, vol: .003, drift: 0, coupon: .045, risk: 1, about: "Un prêt à Café Lumen. Le coupon est plus élevé que celui de l'État car le risque de non-remboursement est un peu plus grand." },
    { id: "or", name: "Or", type: "gold", sector: "Prix du gramme", p: 76.3, vol: .007, drift: .0002, div: 0, risk: 2, about: "L'or ne verse ni dividende ni intérêt. On en détient pour sa tendance à résister quand les actions chutent." }
  ];
  var A = {}; ASSETS.forEach(function (a) { A[a.id] = a; });
  var RISK = ["", "faible", "modéré", "élevé"];
  var NEWS = [
    { a: "volta", m: .09, t: "Volta Mobilité signe un contrat avec 12 villes", w: "Un gros contrat promet plus de ventes futures : les investisseurs paient plus cher une part des bénéfices à venir." },
    { a: "volta", m: -.11, t: "Volta Mobilité rappelle 8 000 vélos défectueux", w: "Un rappel coûte cher et abîme la réputation. Les actions de croissance réagissent fort aux mauvaises surprises." },
    { a: "lumen", m: .04, t: "Café Lumen augmente son dividende de 10 %", w: "Un dividende en hausse montre que l'entreprise est confiante. Le cours monte, mais calmement : c'est une valeur stable." },
    { a: "lumen", m: -.05, t: "Hausse du prix du café : les marges de Lumen sous pression", w: "Quand les matières premières coûtent plus cher, le bénéfice baisse si l'entreprise ne peut pas monter ses prix." },
    { a: "nord", m: .06, t: "Atelier Nord : ventes records en Asie", w: "Les résultats dépassent ce que le marché attendait. C'est l'écart avec les attentes qui fait bouger le cours, pas le résultat seul." },
    { a: "ventor", m: -.06, t: "Les taux montent : Ventor Énergie recule", w: "Une entreprise très endettée paie plus cher ses nouveaux emprunts quand les taux montent : ses bénéfices futurs baissent." },
    { a: "ventor", m: .07, t: "Ventor Énergie remporte un appel d'offres éolien en mer", w: "Des revenus garantis sur vingt ans rassurent les investisseurs." },
    { a: "halde", m: -.12, t: "Halde Industrie réduit son dividende de moitié", w: "Un dividende supérieur au bénéfice ne peut pas durer. Le marché vend dès l'annonce, même si beaucoup s'en doutaient." },
    { a: "halde", m: .08, t: "Halde Industrie annonce un plan d'économies", w: "Le marché parie sur une remontée des marges. Reste à voir si le plan sera tenu." },
    { a: "pixel", m: .12, t: "Le nouveau jeu de Pixelia dépasse 2 millions de ventes", w: "Pour un studio, un succès peut faire bondir le cours. L'inverse est aussi vrai : c'est un actif très volatil." },
    { a: "pixel", m: -.13, t: "Pixelia repousse la sortie de son jeu phare", w: "Un retard repousse les revenus attendus. Le marché déteste l'incertitude et vend tout de suite." },
    { all: true, m: -.05, t: "Journée noire sur les marchés mondiaux", w: "Quand tout baisse en même temps, la diversification entre entreprises aide moins. C'est là que l'or et les obligations jouent leur rôle d'amortisseur.", gold: .025, bond: .004 },
    { all: true, m: .035, t: "Les marchés saluent une baisse de l'inflation", w: "Moins d'inflation laisse espérer des taux plus bas, ce qui rend les actions plus attractives.", bond: .006 },
    { rates: true, m: -.02, t: "La banque centrale relève ses taux", w: "Quand les nouveaux prêts rapportent plus, les anciennes obligations à coupon plus faible valent moins. Leur prix baisse un peu." }
  ];
  // badges : les identifiants partagés sont transmis à la progression du site, les autres restent propres à l'outil
  var BADGES = [
    { id: "first", t: "Premier pas", d: "Faire un premier achat", g: true }, { id: "fraction", t: "Fraction", d: "Acheter moins d'une part" },
    { id: "diversif", t: "Diversification", d: "Détenir 3 lignes", g: true }, { id: "alltypes", t: "Panier complet", d: "Détenir les 4 types d'actifs" },
    { id: "etf", t: "Panier malin", d: "Acheter un ETF" }, { id: "bond", t: "Prêteur", d: "Acheter une obligation" }, { id: "gold", t: "Valeur refuge", d: "Acheter de l'or" },
    { id: "dividend", t: "Rentier", d: "Recevoir un dividende", g: true }, { id: "coupon", t: "Coupon", d: "Recevoir des intérêts" },
    { id: "profit", t: "Plus-value", d: "Vendre avec un gain" }, { id: "calm", t: "Sang-froid", d: "Garder 20 jours une ligne à −5 %", g: true },
    { id: "news", t: "Bien informé", d: "Lire les actualités" }, { id: "year", t: "Investisseur patient", d: "Laisser passer un an simulé", g: true }
  ];
  var PROFILS = {
    prudent: { l: "Prudent", mix: { monde: .3, oat: .35, corp: .15, or: .1, lumen: .1 } },
    equilibre: { l: "Équilibré", mix: { monde: .4, europe: .15, oat: .2, or: .1, lumen: .1, nord: .05 } },
    dynamique: { l: "Dynamique", mix: { monde: .45, europe: .1, volta: .1, pixel: .1, ventor: .1, or: .05, oat: .1 } }
  };
  var $ = function (id) { return document.getElementById(id); };
  var rnd = function () { return (Math.random() + Math.random() + Math.random() - 1.5) * 1.4; };
  var START = new Date(); START.setHours(0, 0, 0, 0);
  function dateOf(day) { var d = new Date(START), n = 0; while (n < day) { d.setDate(d.getDate() + 1); if (d.getDay() % 6) n++; } return d; }
  function dfmt(day) { return dateOf(day).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); }
  function qf(q) { return SO.n(q, q < 1 ? 4 : q < 100 ? 3 : 1); }
  function freshMarket() {
    var px = {}, hist = {};
    ASSETS.forEach(function (a) {
      var p = a.p, h = [p];
      for (var i = 0; i < 120; i++) { p = p / (1 + a.drift + rnd() * a.vol); if (a.type === "bond") p += (100 - p) * .03; h.unshift(p); }
      h = h.slice(-120); h[h.length - 1] = a.p; hist[a.id] = h.map(function (v) { return +v.toFixed(4); }); px[a.id] = a.p;
    });
    return { px: px, hist: hist };
  }
  var S = SO.store.get(KEY, null);
  function fresh(cap, fees) { return { day: 0, market: freshMarket(), pf: { capital: cap, cash: cap, pos: {}, tx: [], vhist: [cap], income: 0, fees: 0, startDay: 0 }, news: [], unread: 0, badges: [], fees: fees, started: false, speed: 0 }; }
  if (!S || !S.market || !S.pf) S = fresh(10000, 0.1);
  function save() { SO.store.set(KEY, S); }
  function unlock(id) {
    if (S.badges.indexOf(id) >= 0) return; S.badges.push(id);
    var b = BADGES.filter(function (x) { return x.id === id; })[0];
    if (b.g) SO.unlock(id); else { SO.xp(20); SO.toast("Badge du portefeuille virtuel : « " + b.t + " »"); }
    renderBadges(); save();
  }
  function px(id) { return S.market.px[id]; }
  function value() { var v = S.pf.cash; Object.keys(S.pf.pos).forEach(function (id) { v += S.pf.pos[id].qty * px(id); }); return v; }
  function fee(amt) { return amt * S.fees / 100; }
  function buy(id, amt) {
    amt = Math.min(amt, S.pf.cash); if (amt < 0.01) return false;
    var f = fee(amt), net = amt - f, q = net / px(id), p = S.pf.pos[id] || { qty: 0, cost: 0 };
    p.qty += q; p.cost += amt; S.pf.pos[id] = p; S.pf.cash -= amt; S.pf.fees += f;
    S.pf.tx.unshift({ d: S.day, k: "Achat", id: id, amt: amt, q: q, f: f });
    unlock("first"); if (q < 1) unlock("fraction");
    var t = A[id].type; if (t === "etf") unlock("etf"); if (t === "bond") unlock("bond"); if (t === "gold") unlock("gold");
    if (Object.keys(S.pf.pos).length >= 3) unlock("diversif");
    var types = {}; Object.keys(S.pf.pos).forEach(function (k) { types[A[k].type] = 1; }); if (Object.keys(types).length === 4) unlock("alltypes");
    SO.used("portefeuille-virtuel"); save(); renderAll(); return true;
  }
  function sell(id, amt) {
    var p = S.pf.pos[id]; if (!p) return false;
    var val = p.qty * px(id); amt = Math.min(amt, val); if (amt < 0.01) return false;
    var frac = amt / val, costPart = p.cost * frac, f = fee(amt), gain = amt - f - costPart;
    if (gain > 0.01) unlock("profit");
    S.pf.cash += amt - f; S.pf.fees += f; S.pf.tx.unshift({ d: S.day, k: "Vente", id: id, amt: amt - f, q: p.qty * frac, g: gain, f: f });
    if (frac > 0.9999) delete S.pf.pos[id]; else { p.qty *= 1 - frac; p.cost -= costPart; }
    save(); renderAll(); return true;
  }
  function step() {
    S.day++;
    ASSETS.forEach(function (a) {
      var p = px(a.id) * (1 + a.drift + rnd() * a.vol); if (a.type === "bond") p += (100 - p) * .02;
      S.market.px[a.id] = Math.max(1, p);
      var h = S.market.hist[a.id]; h.push(+S.market.px[a.id].toFixed(4)); if (h.length > 400) h.shift();
    });
    Object.keys(S.pf.pos).forEach(function (id) {
      var a = A[id], p = S.pf.pos[id], amt;
      if (a.div && S.day % 63 === 0) { amt = p.qty * px(id) * a.div / 4; S.pf.cash += amt; S.pf.income += amt; S.pf.tx.unshift({ d: S.day, k: "Dividende", id: id, amt: amt }); unlock("dividend"); }
      if (a.coupon && S.day % 21 === 0) { amt = p.qty * 100 * a.coupon / 12; S.pf.cash += amt; S.pf.income += amt; S.pf.tx.unshift({ d: S.day, k: "Coupon", id: id, amt: amt }); unlock("coupon"); }
      if (p.qty * px(id) < p.cost * .95) { p.down = (p.down || 0) + 1; if (p.down >= 20) unlock("calm"); } else p.down = 0;
    });
    if (S.day > 3 && Math.random() < 1 / 18) newsEvent();
    S.pf.vhist.push(+value().toFixed(2)); if (S.pf.vhist.length > 800) S.pf.vhist.shift();
    if (S.day - S.pf.startDay >= 252) unlock("year");
    if (S.pf.tx.length > 200) S.pf.tx.length = 200;
  }
  function newsEvent() {
    var n = NEWS[Math.floor(Math.random() * NEWS.length)];
    function hit(id) { S.market.px[id] *= 1 + n.m * (.7 + Math.random() * .6); }
    if (n.a) hit(n.a);
    if (n.all) ASSETS.forEach(function (a) { if (a.type === "action") hit(a.id); else if (a.type === "etf") S.market.px[a.id] *= 1 + n.m * .8; else if (a.type === "gold") S.market.px[a.id] *= 1 + (n.gold || 0); else S.market.px[a.id] *= 1 + (n.bond || 0); });
    if (n.rates) ASSETS.forEach(function (a) { if (a.type === "bond") S.market.px[a.id] *= 1 + n.m * (a.id === "oat" ? 1 : .6); });
    S.news.unshift({ d: S.day, t: n.t, w: n.w, a: n.a || null, m: n.m }); if (S.news.length > 30) S.news.length = 30;
    S.unread++;
    if (n.a ? S.pf.pos[n.a] : Object.keys(S.pf.pos).length) SO.toast("Actualité : " + n.t);
  }
  var timer = null;
  function setSpeed(s) {
    S.speed = s; clearInterval(timer);
    if (s > 0) timer = setInterval(function () { for (var i = 0; i < s; i++) step(); save(); renderTick(); }, 1500);
    SO.$$("[data-speed]").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.speed === s)); });
  }
  function jump(days) { for (var i = 0; i < days; i++) step(); save(); renderAll(); }
  var tab = "pf", openId = null, range = 9999;
  function renderTop() {
    var v = value(), g = v - S.pf.capital;
    $("total").textContent = SO.eur(v, 2);
    var p = $("perf"); p.textContent = SO.sgn(g, function (x) { return SO.eur(x, 2); }) + " (" + SO.sgn(g / S.pf.capital, function (x) { return SO.pct(x, 2); }) + ")"; p.className = "num " + (g >= 0 ? "up" : "down");
    SO.set("kRow", '<div><b>' + SO.eur(S.pf.cash, 2) + '</b><span>liquidités</span></div><div><b>' + SO.eur(v - S.pf.cash, 2) + '</b><span>investi</span></div><div><b class="up">' + SO.eur(S.pf.income, 2) + '</b><span>dividendes et coupons</span></div><div><b>' + SO.eur(S.pf.fees, 2) + '</b><span>frais de courtage payés</span></div>');
    $("simDate").textContent = dfmt(S.day);
    var nc = $("newsCount"); nc.hidden = !S.unread; nc.textContent = S.unread;
  }
  function renderPortfolio() {
    var h = S.pf.vhist.slice(-range), off = S.pf.vhist.length - h.length;
    SO.chart("pfChart", { labels: h.map(function (_, i) { return off + i; }), title: "Valeur du portefeuille", yMin: Math.min.apply(null, h.concat([S.pf.capital])) * 0.98,
      series: [{ name: "Valeur", data: h, color: h[h.length - 1] >= S.pf.capital ? "var(--up)" : "var(--down)", area: true }, { name: "Capital de départ", data: h.map(function () { return S.pf.capital; }), color: "var(--muted)", dash: true }],
      xFmt: function () { return ""; }, tipTitle: function (d) { return "Jour " + d; } });
    var v = value(), t = { action: 0, etf: 0, bond: 0, gold: 0 };
    Object.keys(S.pf.pos).forEach(function (id) { t[A[id].type] += S.pf.pos[id].qty * px(id); });
    SO.donut("donut", [{ label: "Liquidités", value: S.pf.cash, color: "var(--muted)" }].concat(Object.keys(t).map(function (k) { return { label: TYPES[k].l, value: t[k], color: TYPES[k].c }; })), [String(Object.keys(S.pf.pos).length), "lignes"]);
    var ids = Object.keys(S.pf.pos).sort(function (a, b) { return S.pf.pos[b].qty * px(b) - S.pf.pos[a].qty * px(a); });
    SO.set("positions", ids.length ? '<div class="tbl"><table><thead><tr><th>Actif</th><th class="r">Parts</th><th class="r">Prix de revient</th><th class="r">Cours</th><th class="r">Valeur</th><th class="r">+/− value</th><th class="r">Poids</th></tr></thead><tbody>' + ids.map(function (id) {
      var p = S.pf.pos[id], a = A[id], val = p.qty * px(id), g = val - p.cost;
      return '<tr><td><button class="linkbtn" type="button" data-open="' + id + '"><span class="dot" style="background:' + TYPES[a.type].c + '"></span>' + a.name + '</button></td><td class="r num">' + qf(p.qty) + '</td><td class="r num">' + SO.eur(p.cost / p.qty, 2) + '</td><td class="r num">' + SO.eur(px(id), 2) + '</td><td class="r num">' + SO.eur(val, 2) + '</td><td class="r num ' + (g >= 0 ? "up" : "down") + '">' + SO.sgn(g, function (x) { return SO.eur(x, 2); }) + "<br><small>" + SO.sgn(g / p.cost, function (x) { return SO.pct(x, 1); }) + '</small></td><td class="r num">' + SO.pct(val / v, 1) + "</td></tr>";
    }).join("") + "</tbody></table></div>" : '<div class="empty">Aucune ligne pour l\'instant. Ouvrez l\'onglet Marché pour acheter.</div>');
  }
  function renderMarket() {
    var flt = ($("mkFilter") || {}).value || "all";
    SO.set("market", ASSETS.filter(function (a) { return flt === "all" || a.type === flt; }).map(function (a) {
      var h = S.market.hist[a.id], ch = px(a.id) / h[Math.max(0, h.length - 22)] - 1, held = S.pf.pos[a.id];
      return '<button class="mk" type="button" data-open="' + a.id + '"><span><b>' + a.name + '</b><small><span class="tag">' + TYPES[a.type].l + "</span> " + a.sector + "</small>" + (held ? '<small class="up">Vous en avez pour ' + SO.eur(held.qty * px(a.id), 2) + "</small>" : "") + "</span>" + SO.spark(h.slice(-40)) + '<span class="px">' + SO.eur(px(a.id), 2) + '<small class="' + (ch >= 0 ? "up" : "down") + '">' + SO.sgn(ch, function (x) { return SO.pct(x, 2); }) + " sur 1 mois</small></span></button>";
    }).join(""));
  }
  function renderNews() {
    SO.set("news", S.news.length ? S.news.map(function (n) { return '<div class="news-item"><span class="when">' + dfmt(n.d) + "</span><h3>" + SO.esc(n.t) + '</h3><p class="' + (n.m >= 0 ? "up" : "down") + '"><b>' + (n.a ? A[n.a].name : "Tout le marché") + (n.m >= 0 ? " en hausse" : " en baisse") + "</b></p><p><b>Pourquoi ça bouge :</b> " + SO.esc(n.w) + "</p></div>"; }).join("") : '<div class="empty">Pas encore d\'actualité. Faites avancer le temps : les nouvelles arrivent toutes les quelques semaines.</div>');
  }
  function renderHistory() {
    var tx = S.pf.tx;
    SO.set("history", tx.length ? '<div class="tbl"><table><thead><tr><th>Date</th><th>Opération</th><th>Actif</th><th class="r">Montant</th><th class="r">Frais</th><th class="r">Résultat</th></tr></thead><tbody>' + tx.slice(0, 80).map(function (t) {
      return '<tr><td class="num">' + dfmt(t.d) + "</td><td>" + t.k + "</td><td>" + A[t.id].name + '</td><td class="r num ' + (t.k === "Achat" ? "" : "up") + '">' + (t.k === "Achat" ? "−" : "+") + SO.eur(t.amt, 2) + '</td><td class="r num">' + (t.f ? SO.eur(t.f, 2) : "") + '</td><td class="r num ' + (t.g == null ? "" : t.g >= 0 ? "up" : "down") + '">' + (t.g == null ? "" : SO.sgn(t.g, function (x) { return SO.eur(x, 2); })) + "</td></tr>";
    }).join("") + "</tbody></table></div>" : '<div class="empty">Vos achats, ventes, dividendes et coupons apparaîtront ici.</div>');
  }
  function renderBadges() {
    SO.set("badges", BADGES.map(function (b) { var on = S.badges.indexOf(b.id) >= 0; return '<div class="' + (on ? "on" : "") + '"><span class="m" aria-hidden="true">' + (on ? "✓" : "?") + "</span><span><b>" + b.t + "</b><small>" + b.d + "</small></span></div>"; }).join(""));
    SO.txt("nBadges", S.badges.length + " / " + BADGES.length);
  }
  function renderTick() { renderTop(); if (tab === "pf") renderPortfolio(); if (tab === "mk") renderMarket(); if (tab === "hx") renderHistory(); if (tab === "nw" && S.unread) { S.unread = 0; renderNews(); renderTop(); } if (openId) renderSheet(true); }
  function renderAll() { renderTop(); renderPortfolio(); renderMarket(); renderNews(); renderHistory(); renderBadges(); if (openId) renderSheet(true); }
  // fiche d'un actif
  var amt = "";
  function closeSheet() { openId = null; $("sheetRoot").innerHTML = ""; }
  function renderSheet(update) {
    var a = A[openId], p = S.pf.pos[openId], price = px(openId), h = S.market.hist[openId], ch = price / h[Math.max(0, h.length - 22)] - 1;
    var held = p ? '<div class="out-grid"><div><b>' + qf(p.qty) + ' parts</b><span>' + SO.eur(p.qty * price, 2) + '</span></div><div><b class="' + (p.qty * price >= p.cost ? "up" : "down") + '">' + SO.sgn(p.qty * price - p.cost, function (x) { return SO.eur(x, 2); }) + "</b><span>plus ou moins-value</span></div></div>" : '<p class="hint">Vous ne détenez pas encore cet actif.</p>';
    if (update && $("shPrice")) {
      $("shPrice").textContent = SO.eur(price, 2); SO.set("shHeld", held); SO.txt("shCash", SO.eur(S.pf.cash, 2));
      SO.chart("shChart", { labels: h.slice(-180).map(function (_, i) { return i; }), series: [{ name: a.name, data: h.slice(-180), color: "var(--s3)", area: true }], yMin: Math.min.apply(null, h.slice(-180)) * 0.97, xFmt: function () { return ""; }, tipTitle: function () { return a.name; } });
      sync(); return;
    }
    var tips = { action: "Une action peut beaucoup monter, mais aussi beaucoup baisser. Ne misez jamais tout sur une seule entreprise.", etf: "Un très bon point de départ : une seule ligne vous donne déjà des centaines d'entreprises.", bond: "Idéal pour calmer un portefeuille. Un coupon tombe chaque mois de bourse (21 jours).", gold: "Une petite part d'or, 5 à 10 %, suffit souvent à jouer le rôle d'amortisseur." };
    $("sheetRoot").innerHTML = '<div class="sheet" id="ov"><div role="dialog" aria-modal="true" aria-labelledby="shT"><button class="x" type="button" id="shX" aria-label="Fermer">×</button>' +
      '<span class="tag">' + TYPES[a.type].l + '</span> <span class="tag">risque ' + RISK[a.risk] + '</span><h2 id="shT" style="font-size:1.5rem;margin-top:8px">' + a.name + '</h2><p><b class="num" id="shPrice" style="font-size:1.3rem">' + SO.eur(price, 2) + '</b> <span class="num ' + (ch >= 0 ? "up" : "down") + '">' + SO.sgn(ch, function (x) { return SO.pct(x, 2); }) + " sur 1 mois</span></p>" +
      '<div class="chart" id="shChart"></div><p class="muted" style="margin-top:12px">' + a.about + '</p><p class="callout info" style="margin-top:12px">' + tips[a.type] + "</p>" +
      '<p class="hint" style="margin-top:12px">' + (a.coupon ? "Coupon annuel : " + SO.pct(a.coupon, 1) : a.div ? "Dividende annuel : " + SO.pct(a.div, 1) + " du cours, versé chaque trimestre" : "Pas de dividende") + "</p>" +
      '<div id="shHeld" style="margin-top:12px">' + held + '</div>' +
      '<form id="trade" class="form" style="margin-top:16px"><label>Montant en euros <span class="hint">liquidités : <span id="shCash">' + SO.eur(S.pf.cash, 2) + '</span></span><input type="number" id="amt" min="0" step="0.01" inputmode="decimal" placeholder="Ex. 500" value="' + amt + '"></label>' +
      '<div class="sim-actions"><button type="button" data-q=".1">10 %</button><button type="button" data-q=".25">25 %</button><button type="button" data-q=".5">50 %</button><button type="button" data-q="1">Tout</button></div>' +
      '<p class="hint" id="tInfo"></p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" type="submit" id="bBuy">Acheter</button><button class="btn ghost" type="button" id="bSell">Vendre</button></div></form></div></div>';
    renderSheet(true);
    $("ov").addEventListener("click", function (e) { if (e.target.id === "ov") closeSheet(); });
    $("shX").addEventListener("click", closeSheet);
    $("amt").addEventListener("input", function (e) { amt = e.target.value; sync(); });
    SO.$$("[data-q]", $("sheetRoot")).forEach(function (b) { b.addEventListener("click", function () { var p2 = S.pf.pos[openId], base = S.pf.cash > 0.01 ? S.pf.cash : p2 ? p2.qty * px(openId) : 0; amt = String(Math.floor(base * +b.dataset.q * 100) / 100); $("amt").value = amt; sync(); }); });
    $("trade").addEventListener("submit", function (e) { e.preventDefault(); var x = parseFloat(amt); if (x > 0 && buy(openId, x)) { amt = ""; $("amt").value = ""; sync(); } });
    $("bSell").addEventListener("click", function () { var x = parseFloat(amt); if (x > 0 && sell(openId, x)) { amt = ""; $("amt").value = ""; sync(); } });
    $("shX").focus();
  }
  function sync() {
    var x = parseFloat(amt), p = S.pf.pos[openId], price = px(openId), held = p ? p.qty * price : 0;
    $("bBuy").disabled = !(x > 0 && x <= S.pf.cash + 1e-9); $("bSell").disabled = !(x > 0 && p && x <= held + 1e-9);
    $("tInfo").textContent = !(x > 0) ? "Indiquez un montant, même petit : les fractions de part sont acceptées." : "Soit " + qf((x - fee(x)) / price) + " part(s) à " + SO.eur(price, 2) + (S.fees ? ", frais de " + SO.eur(fee(x), 2) : "") + "." + (x > S.pf.cash + 1e-9 && !(p && x <= held) ? " Liquidités insuffisantes." : "");
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && openId) closeSheet(); });
  document.addEventListener("click", function (e) { var b = e.target.closest("[data-open]"); if (b) { openId = b.dataset.open; amt = ""; renderSheet(false); } });
  SO.tabs("#vpTabs", function (t) { tab = t; if (t === "nw") { S.unread = 0; unlock("news"); save(); } renderAll(); });
  SO.$$("[data-speed]").forEach(function (b) { b.addEventListener("click", function () { setSpeed(+b.dataset.speed); save(); }); });
  SO.$$("[data-jump]").forEach(function (b) { b.addEventListener("click", function () { jump(+b.dataset.jump); }); });
  SO.$$("[data-range]").forEach(function (b) { b.addEventListener("click", function () { range = +b.dataset.range; SO.$$("[data-range]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); renderPortfolio(); }); });
  $("mkFilter").addEventListener("change", renderMarket);
  // démarrage et remise à zéro
  $("start").addEventListener("submit", function (e) {
    e.preventDefault();
    if (S.started && Object.keys(S.pf.pos).length && !confirm("Recommencer efface votre portefeuille virtuel actuel. Continuer ?")) return;
    var cap = SO.num($("capInit").value) || 10000, fees = SO.num($("feesInit").value), prof = (SO.$("input[name=profil]:checked") || {}).value;
    S = fresh(cap, fees); S.started = true; save();
    if (prof && PROFILS[prof]) { var mix = PROFILS[prof].mix; Object.keys(mix).forEach(function (id) { buy(id, cap * mix[id]); }); SO.toast("Portefeuille " + PROFILS[prof].l.toLowerCase() + " constitué. Faites avancer le temps."); }
    else SO.toast("C'est parti : " + SO.eur(cap) + " fictifs à investir.");
    renderBadges(); renderAll(); setSpeed(0);
    var t = document.getElementById("vpTabs"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("capInit").value = S.pf.capital; $("feesInit").value = S.fees;
  renderBadges(); renderAll(); setSpeed(S.speed || 0);
})();
