/* =========================================================
   Prueba-A — JS principal
   - Fondo responsivo por orientación (bg-landscape.png / bg-portrait.png)
   - Videos YouTube centrados (si usas .video-frame; nocookie + origin + referrerpolicy)
   - Unificación defensiva de botones “X años”
   - NO borra background-image (solo background-color en contenedores tipo “card”)
   - Galerías responsivas (grid / masonry) + marca orientación de imágenes
   ========================================================= */

(function () {
  /* ---------- Utilidades ---------- */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else { fn(); }
  }
  function getOriginSafe() {
    try { return location.origin || 'https://albertcari.github.io'; }
    catch { return 'https://albertcari.github.io'; }
  }

  /* ---------- FONDO: refuerzo JS para rutas correctas + cambio de orientación ---------- */
  function setResponsivePageBackground() {
    var pageBg = document.querySelector('.page.page--with-bg');
    if (!pageBg) return;

    // Desde /pages/ → ../assets/images/… ; desde raíz → ./assets/images/…
    var inPages = location.pathname.indexOf('/pages/') !== -1;
    var base = inPages ? '../assets/images/' : './assets/images/';
    var LAND = base + 'bg-landscape.png';
    var PORT = base + 'bg-portrait.png';

    var mq = window.matchMedia('(orientation: portrait)');
    var apply = function(){
      var url = mq.matches ? PORT : LAND;
      // No tocamos otras propiedades, sólo la imagen:
      pageBg.style.backgroundImage = 'url("' + url + '")';
      pageBg.style.backgroundRepeat = 'no-repeat';
      pageBg.style.backgroundPosition = 'center';
      pageBg.style.backgroundSize = 'cover';
    };
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply); // Safari antiguo
  }

  /* ---------- Videos YouTube (si usas .video-frame) ---------- */
  function initVideoEmbeds() {
    var frames = document.querySelectorAll('.video-frame');
    if (!frames.length) return;

    var ORIGIN = getOriginSafe();
    frames.forEach(function (slot) {
      var id = slot.getAttribute('data-video');
      if (!id) return;

      var aspect = (slot.getAttribute('data-aspect') || '16:9').trim();
      var ratio = aspect.split(':');
      var w = parseInt(ratio[0], 10) || 16;
      var h = parseInt(ratio[1], 10) || 9;

      var wrapper = document.createElement('div');
      wrapper.className = 'video-wrapper';
      wrapper.setAttribute('data-aspect', w + ':' + h);

      var params = new URLSearchParams({
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        enablejsapi: '1',
        origin: ORIGIN
      });
      var src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?' + params.toString();

      var iframe = document.createElement('iframe');
      iframe.setAttribute('src', src);
      iframe.setAttribute('title', 'Video de YouTube');
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen', '');

      iframe.addEventListener('error', function () {
        showVideoFallback(slot, id);
      });

      wrapper.appendChild(iframe);
      slot.replaceWith(wrapper);
    });
  }
  function showVideoFallback(anchorNode, videoId) {
    var box = document.createElement('div');
    box.className = 'video-fallback';
    box.innerHTML =
      'No se pudo cargar el reproductor. ' +
      'Puede que un bloqueador o la configuración del navegador haya impedido el embed. ' +
      'Ábrelo en YouTube: <a href="https://youtu.be/' + encodeURIComponent(videoId) + '" target="_blank" rel="noopener">ver video</a>.';
    (anchorNode.parentNode || document.body).appendChild(box);
  }

  /* ---------- Botones “X años” (defensivo si aparecen sueltos) ---------- */
  function unifyAgeButtons() {
    var links = Array.from(document.querySelectorAll('a'));
    links.forEach(function (a) {
      var txt = (a.textContent || '').trim().toLowerCase();
      if (!txt) return;
      var matched = /\b(\d+)\s*años\b/.test(txt) || /\baños\s*(\d+)\b/.test(txt);
      if (matched && !a.classList.contains('btn')) {
        a.classList.add('btn', 'btn--age');
      }
    });
  }

  /* ---------- Limpieza de background-color en contenedores tipo “card” de íconos ---------- */
  function clearIconBackgrounds() {
    var imgs = document.querySelectorAll('img[alt*="Jugando" i], img[alt*="Lalito" i]');
    imgs.forEach(function (img) {
      var p = img.parentElement;
      if (!p) return;
      var cs = getComputedStyle(p);
      var looksLikeCard =
        (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
        (cs.boxShadow && cs.boxShadow !== 'none') ||
        (cs.borderStyle && cs.borderStyle !== 'none');
      if (looksLikeCard) {
        p.style.backgroundColor = 'transparent'; // ¡no tocamos background-image!
        p.style.boxShadow = 'none';
        p.style.border = '0';
      }
    });
  }

  /* ---------- Galerías responsivas + orientación ---------- */
  function initGalleries() {
    var galleries = document.querySelectorAll('.gallery, .galeria, .photos, [data-gallery]');
    if (!galleries.length) {
      document.querySelectorAll('section, div, ul').forEach(function (node) {
        var imgs = node.querySelectorAll(':scope > img, :scope > a > img, :scope > figure > img');
        if (imgs.length >= 6 && !node.classList.contains('no-auto-gallery')) {
          node.classList.add('gallery');
          galleries = document.querySelectorAll('.gallery, .galeria, .photos, [data-gallery]');
        }
      });
    }
    galleries.forEach(function (gal) {
      gal.classList.add('gallery-ready');
      if (gal.getAttribute('data-gallery') === 'masonry') gal.classList.add('masonry');
      var imgs = gal.querySelectorAll('img');
      imgs.forEach(function (img) {
        if (img.complete) markOrientation(img);
        else img.addEventListener('load', function(){ markOrientation(img); }, { once:true });
      });
    });
  }
  function markOrientation(img) {
    if (!img.naturalWidth || !img.naturalHeight) return;
    var cls = (img.naturalWidth >= img.naturalHeight) ? 'is-landscape' : 'is-portrait';
    img.classList.add(cls);
  }

  /* ---------- Centrado defensivo de videos ---------- */
  function forceCenteredVideos() {
    document.querySelectorAll('.video-wrapper').forEach(function (vw) {
      vw.style.marginLeft = 'auto';
      vw.style.marginRight = 'auto';
      vw.style.float = 'none';
      var parent = vw.parentElement;
      if (!parent) return;
      var cp = getComputedStyle(parent);
      if (cp.display.includes('grid') || cp.display.includes('flex')) {
        vw.style.alignSelf = 'center';
        vw.style.justifySelf = 'center';
      }
    });
  }

  /* ---------- Lanzamiento ---------- */
  onReady(function () {
    setResponsivePageBackground();  // <— usa bg-landscape.png / bg-portrait.png según orientación
    initVideoEmbeds();
    unifyAgeButtons();
    clearIconBackgrounds();
    initGalleries();
    forceCenteredVideos();
  });
})();
