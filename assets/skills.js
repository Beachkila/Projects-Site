// Skills page: language filter, and opening a skill when its tile is selected.
// The page works without this file; every skill is listed below the charts.
(function () {
  var chips = document.querySelectorAll(".sk-chip");
  var status = document.getElementById("sk-status");
  var current = "";

  function has(el, lang) {
    var v = el.getAttribute("data-langs") || "";
    return v.split("|").indexOf(lang) !== -1;
  }

  function apply() {
    chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-lang") === current ? "true" : "false"); });
    document.querySelectorAll(".sk-tree .tm").forEach(function (t) {
      t.classList.toggle("dim", !!current && !has(t, current));
    });
    document.querySelectorAll(".sk-lbar rect").forEach(function (r) {
      r.classList.toggle("dim", !!current && r.getAttribute("data-lang") !== current);
    });
    var shown = 0;
    document.querySelectorAll(".sk-card").forEach(function (card) {
      var any = false;
      card.querySelectorAll(".sk-list > li").forEach(function (li) {
        var ok = !current || has(li, current);
        li.hidden = !ok;
        if (ok) { any = true; shown++; }
      });
      var none = card.querySelector(".sk-none");
      if (none) none.hidden = any;
    });
    if (status) {
      status.textContent = current ? "Showing projects that use " + current + "." : "";
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var lang = c.getAttribute("data-lang");
      current = current === lang ? "" : lang;
      apply();
    });
  });

  function openFromHash() {
    var id = decodeURIComponent((location.hash || "").slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === "DETAILS") {
      el.open = true;
      var s = el.querySelector("summary");
      if (s) s.focus({ preventScroll: true });
    }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
