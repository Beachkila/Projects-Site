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
    groups.forEach(function (g) {
      var n = g.querySelectorAll('.tiles > li:not([hidden])').length;
      g.hidden = n === 0;
      var c = g.querySelector('.count');
      if (c) c.textContent = n;
    });
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', (b._type === active.type && b._value === active.value) ? 'true' : 'false');
    });
    if (empty) empty.hidden = shown !== 0;
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

  box.hidden = false;
  apply();
  updateFade();
  revealHash();
})();
