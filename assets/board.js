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

  function makeRow(labelText, btns) {
    var row = document.createElement('div');
    row.className = 'frow';
    var lab = document.createElement('span');
    lab.className = 'lab';
    lab.textContent = labelText;
    row.appendChild(lab);
    btns.forEach(function (b) { row.appendChild(b); });
    return row;
  }

  box.setAttribute('role', 'group');
  box.setAttribute('aria-label', 'Filter projects');

  var kindButtons = [makeButton('All (' + total + ')', 'all', '')];
  kindDefs.forEach(function (d) {
    if (kindCount[d.key]) kindButtons.push(makeButton(d.label + ' (' + kindCount[d.key] + ')', 'kind', d.key));
  });
  box.appendChild(makeRow('Show', kindButtons));

  var tagNames = Object.keys(tagCount).sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; });
  if (tagNames.length) {
    box.appendChild(makeRow('Tags', tagNames.map(function (t) {
      return makeButton(t + ' (' + tagCount[t] + ')', 'tag', t);
    })));
  }

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
    if (active.type === 'all') {
      status.textContent = '';
    } else {
      status.textContent = 'Showing ' + shown + ' of ' + total + ' project' + (total === 1 ? '' : 's') + '.';
    }
  }

  function setActive(type, value) {
    active = { type: type, value: value };
    apply();
  }

  box.hidden = false;
  apply();
})();
