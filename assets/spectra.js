// Tabs for the Light, Code and Art sections. Without this file all three sections show in a row.
(function () {
  var list = document.querySelector('.tabs[role="tablist"]');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  list.hidden = false;
  document.body.classList.add('has-tabs');

  function select(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      select(i, false);
      history.replaceState(null, '', '#' + panels[i].id);
    });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length, to = -1;
      if (k === 'ArrowRight') to = (i + 1) % n;
      else if (k === 'ArrowLeft') to = (i - 1 + n) % n;
      else if (k === 'Home') to = 0;
      else if (k === 'End') to = n - 1;
      if (to >= 0) { e.preventDefault(); select(to, true); }
    });
  });

  // Links like #code-bang or #panel-art open the tab that holds the target.
  function fromHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    var el = id && document.getElementById(id);
    var idx = 0;
    if (el) {
      panels.forEach(function (p, j) { if (p === el || p.contains(el)) idx = j; });
    }
    select(idx, false);
    if (el && el !== panels[idx]) el.scrollIntoView();
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
