// Opens timeline thumbnails full size in a pop-up with the caption.
// Without this file, each thumbnail is a plain link to the full image.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('a.th'));
  if (!links.length) return;
  var dlg = document.createElement('dialog');
  if (typeof dlg.showModal !== 'function') return;

  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image');
  dlg.innerHTML =
    '<form method="dialog" class="lbbar"><button class="lbclose" aria-label="Close image">Close</button></form>' +
    '<img alt=""><p class="lbcap"></p>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('img');
  var cap = dlg.querySelector('.lbcap');
  var opener = null;

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      opener = a;
      img.src = a.getAttribute('href');
      img.alt = a.getAttribute('data-alt') || '';
      var c = a.getAttribute('data-cap') || '';
      cap.textContent = c;
      cap.hidden = !c;
      dlg.showModal();
    });
  });

  // Tapping the dark area outside the picture closes it.
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () {
    img.removeAttribute('src');
    if (opener) opener.focus();
  });
})();
