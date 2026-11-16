/* Aide à la déclaration : ce qu'il faut vérifier selon ce que l'on possède */
(function () {
  "use strict";
  var ITEMS = {
    cto: { t: "Compte-titres chez un courtier français", f: "2042", s: [
      "Votre courtier vous envoie un IFU (imprimé fiscal unique) en février ou mars : les montants sont en principe déjà préremplis sur la déclaration.",
      "Vérifiez les dividendes (case 2DC), les intérêts (2TR), le prélèvement de 12,8 % déjà payé (2CK) et les plus-values nettes (3VG) ou moins-values (3VH).",
      "Par défaut, tout est imposé au prélèvement forfaitaire. La case 2OP permet de choisir le barème pour tous les revenus de placement de l'année : testez-le avec le simulateur d'impôt."] },
    etranger: { t: "Compte chez un courtier ou une banque à l'étranger", f: "2042, 2074, 3916", s: [
      "Rien n'est prérempli : vous reportez vous-même dividendes, intérêts et plus-values à partir des relevés annuels du courtier.",
      "Chaque compte ouvert, détenu ou clos à l'étranger se déclare sur le formulaire 3916, même s'il est vide ou inutilisé. L'oubli coûte 1 500 € par compte (10 000 € pour certains pays).",
      "Les plus-values se calculent sur le formulaire 2074 puis se reportent case 3VG. Un impôt retenu à l'étranger sur les dividendes peut ouvrir droit à un crédit d'impôt (case 2AB), selon la convention fiscale."] },
    pea: { t: "Un PEA", f: "rien ou 2042", s: [
      "Tant que vous ne retirez rien, il n'y a rien à déclarer : les dividendes et plus-values restent dans le plan sans impôt.",
      "Après un retrait, l'établissement calcule et prélève lui-même les prélèvements sociaux. Avant 5 ans, le gain est en plus soumis à l'impôt : il figure sur l'IFU.",
      "Le PEA n'a pas à être déclaré comme compte à l'étranger s'il est ouvert en France."] },
    av: { t: "Une assurance-vie", f: "2042", s: [
      "Sans rachat dans l'année, rien à déclarer.",
      "Après un rachat, l'assureur envoie un IFU. Pour un contrat de plus de 8 ans, vérifiez la case 2CH : c'est elle qui permet l'abattement de 4 600 € (9 200 € pour un couple).",
      "Les prélèvements sociaux (17,2 %) sont prélevés directement par l'assureur."] },
    per: { t: "Un PER", f: "2042", s: [
      "Les versements volontaires de l'année se déclarent cases 6NS, 6NT (ou 6NU) pour être déduits de votre revenu imposable.",
      "Le plafond de déduction disponible figure sur votre dernier avis d'impôt. Il est reportable sur 3 ans.",
      "À la sortie en capital, la part versements est imposée au barème et la part gains au prélèvement forfaitaire."] },
    crypto: { t: "Des cryptomonnaies", f: "2086, 3916-bis", s: [
      "Seules les ventes contre des euros (ou l'achat d'un bien) sont imposables ; un échange entre cryptos ne l'est pas.",
      "Chaque cession imposable se détaille sur le formulaire 2086 ; le gain net se reporte case 3AN (ou la perte case 3BN). Le total des cessions de l'année sous 305 € est exonéré.",
      "Chaque compte ouvert sur une plateforme étrangère se déclare sur le formulaire 3916-bis, même sans cession."] },
    scpi: { t: "Des parts de SCPI", f: "2044", s: [
      "La société de gestion envoie un relevé fiscal avec les revenus fonciers à reporter (formulaire 2044 ou micro-foncier case 4BE sous 15 000 € de loyers).",
      "Les revenus de source étrangère ouvrent souvent droit à un crédit d'impôt : suivez le relevé ligne par ligne."] },
    livret: { t: "Des livrets réglementés (Livret A, LDDS, LEP)", f: "rien", s: [
      "Les intérêts sont exonérés d'impôt et de prélèvements sociaux : rien à déclarer.",
      "Les livrets bancaires ordinaires et les comptes à terme, eux, sont imposés : leurs intérêts figurent sur l'IFU de la banque."] }
  };
  SO.form("#f", function (v) {
    var keys = Object.keys(ITEMS).filter(function (k) { return v[k]; }), forms = {};
    keys.forEach(function (k) { ITEMS[k].f.split(", ").forEach(function (x) { if (x !== "rien" && x !== "rien ou 2042") forms[x] = 1; }); });
    SO.txt("rN", keys.length ? keys.length + " point" + (keys.length > 1 ? "s" : "") + " à vérifier" : "Cochez ce que vous possédez");
    SO.set("rForms", Object.keys(forms).length ? 'Formulaires concernés : <b>' + Object.keys(forms).join(", ") + "</b>" : (keys.length ? "Aucun formulaire particulier." : ""));
    SO.set("out", keys.map(function (k) {
      return '<div class="card" style="padding:18px;margin-top:12px"><h3>' + ITEMS[k].t + ' <span class="tag">' + ITEMS[k].f + '</span></h3><ol class="steps" style="margin-top:12px">' + ITEMS[k].s.map(function (s) { return "<li><span>" + s + "</span></li>"; }).join("") + "</ol></div>";
    }).join("") || '<div class="empty">Cochez au moins une case pour afficher la liste.</div>');
  }, { tool: "declaration" });
})();
