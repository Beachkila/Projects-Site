// Stage tabs for the board (Building, Complete). Without this file the stage sections stack.
(function () {
  var list = document.querySelector('.stagetabs[role="tablist"]');
  if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
  list.hidden = false;
  document.body.classList.add('has-stagetabs');
  panels.forEach(function (p, i) {
    p.setAttribute('role', 'tabpanel');
    p.setAttribute('aria-labelledby', tabs[i].id);
  });

  function select(i, focus) {
    tabs.forEach(function (t, j) {
      var on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
    document.dispatchEvent(new CustomEvent('stagetab'));
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

  // Links like #tile-bang (from the spectrum overview) or #stage-complete open the tab that holds the target.
  function fromHash(first) {
    var id = decodeURIComponent((location.hash || '').slice(1));
    var el = id && document.getElementById(id);
    var idx = -1;
    if (el) panels.forEach(function (p, j) { if (p === el || p.contains(el)) idx = j; });
    if (idx === -1) { if (first) select(0, false); return; }
    select(idx, false);
    if (el !== panels[idx]) el.scrollIntoView();
  }
  window.addEventListener('hashchange', function () { fromHash(false); });
  fromHash(true);
})();

// Filters for the board. The board works without this file: you just get the full grouped list.
(function () {
  var box = document.getElementById('filters');
  var status = document.getElementById('filter-status');
  var empty = document.getElementById('no-match');
  var items = Array.prototype.slice.call(document.querySelectorAll('.group .tiles > li'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.group'));
  if (!box || !items.length) return;

  var total = items.length;
  var kindDefs = [
    { key: 'code', label: 'Code' },
    { key: 'art', label: 'Art' },
    { key: 'light', label: 'Light' },
    { key: 'releases', label: 'Has releases' }
  ];

  function kindsOf(li) { return (li.getAttribute('data-kinds') || '').split(' ').filter(Boolean); }
  function tagsOf(li) { var t = li.getAttribute('data-tags') || ''; return t ? t.split('|') : []; }

  var kindCount = {};
  var tagCount = {};
  items.forEach(function (li) {
    kindsOf(li).forEach(function (k) { kindCount[k] = (kindCount[k] || 0) + 1; });
    tagsOf(li).forEach(function (t) { tagCount[t] = (tagCount[t] || 0) + 1; });
  });

  var active = { type: 'all', value: '' };
  var buttons = [];
  var tagToggle = null;
  var panel = null;

  function makeButton(label, type, value) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fbtn';
    b.textContent = label;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { setActive(type, value); });
    b._type = type;
    b._value = value;
    buttons.push(b);
    return b;
  }

  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Filter projects');

  var row = document.createElement('div');
  row.className = 'frow';
  row.appendChild(makeButton('All (' + total + ')', 'all', ''));
  kindDefs.forEach(function (d) {
    if (kindCount[d.key]) row.appendChild(makeButton(d.label + ' (' + kindCount[d.key] + ')', 'kind', d.key));
  });

  var tagNames = Object.keys(tagCount).sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
  if (tagNames.length) {
    tagToggle = document.createElement('button');
    tagToggle.type = 'button';
    tagToggle.className = 'fbtn';
    tagToggle.setAttribute('aria-expanded', 'false');
    tagToggle.setAttribute('aria-controls', 'tagpanel');
    row.appendChild(tagToggle);

    panel = document.createElement('div');
    panel.className = 'tagpanel';
    panel.id = 'tagpanel';
    panel.hidden = true;
    tagNames.forEach(function (t) {
      panel.appendChild(makeButton(t + ' (' + tagCount[t] + ')', 'tag', t));
    });
    tagToggle.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
      renderToggle();
    });
  }

  box.appendChild(row);
  if (panel) box.appendChild(panel);

  function renderToggle() {
    if (!tagToggle) return;
    var on = active.type === 'tag';
    tagToggle.textContent = on ? 'Tags: ' + active.value : 'Tags';
    tagToggle.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
    tagToggle.className = 'fbtn' + (on ? ' has' : '');
  }

  function updateFade() {
    var more = row.scrollWidth - row.clientWidth - row.scrollLeft > 4;
    row.className = 'frow' + (more ? ' fade' : '');
  }
  row.addEventListener('scroll', updateFade);
  window.addEventListener('resize', updateFade);

  function matches(li) {
    if (active.type === 'all') return true;
    if (active.type === 'kind') return kindsOf(li).indexOf(active.value) !== -1;
    return tagsOf(li).indexOf(active.value) !== -1;
  }

  function apply() {
    var shown = 0;
    items.forEach(function (li) {
      var ok = matches(li);
      li.hidden = !ok;
      if (ok) shown++;
    });
    var tabbed = document.body.classList.contains('has-stagetabs');
    var inView = shown;
    groups.forEach(function (g) {
      var n = g.querySelectorAll('.tiles > li:not([hidden])').length;
      var c = g.querySelector('.count');
      if (c) c.textContent = n;
      if (tabbed) {
        // The tabs decide which stage shows; the filter only updates each tab's count.
        var tab = document.querySelector('[aria-controls="' + g.id + '"] .count');
        if (tab) tab.textContent = n;
        if (!g.hidden) inView = n;
      } else {
        g.hidden = n === 0;
      }
    });
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', (b._type === active.type && b._value === active.value) ? 'true' : 'false');
    });
    if (empty) empty.hidden = inView !== 0;
    status.textContent = active.type === 'all' ? '' :
      'Showing ' + shown + ' of ' + total + ' project' + (total === 1 ? '' : 's') + '.';
    renderToggle();
  }

  function setActive(type, value) {
    active = { type: type, value: value };
    if (panel && type !== 'tag') panel.hidden = true;
    if (panel && type === 'tag') panel.hidden = true;
    apply();
  }

  // A link to a tile that a filter is hiding clears the filter first.
  function revealHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.hidden) {
      setActive('all', '');
      el.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('stagetab', apply);

  box.hidden = false;
  apply();
  updateFade();
  revealHash();
})();
