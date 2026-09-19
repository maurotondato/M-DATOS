/* =========================================================
   M·DATOS — interacciones de la página
   ========================================================= */
(function () {
  'use strict';

  var CFG = window.MD_CONFIG || {};
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------
     1. Datos de contacto inyectados desde config.js
     --------------------------------------------------- */
  var waNum  = String(CFG.whatsapp || '').replace(/\D/g, '');
  var waHref = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(CFG.whatsappMsg || 'Hola M·DATOS');
  var mail   = CFG.email || '';
  var telTxt = CFG.telefonoVisible || ('+' + waNum);

  $$('[data-wa]').forEach(function (a) {
    a.href = waHref;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-mail]').forEach(function (a) {
    a.href = 'mailto:' + mail;
    if (a.textContent.trim() === 'Cargando…' || a.dataset.mail === 'text') a.textContent = mail;
    else if (a.textContent.trim() === 'Email') { /* deja la etiqueta del footer */ }
  });
  $$('[data-tel]').forEach(function (a) {
    a.href = 'tel:+' + waNum;
    if (a.textContent.trim() === 'Cargando…') a.textContent = telTxt;
  });

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------------------------------------------
     2. Header: fondo al scrollear
     --------------------------------------------------- */
  var hdr = $('#hdr');
  function onScroll() {
    hdr.classList.toggle('is-stuck', scrollY > 24);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------
     3. Menú móvil
     --------------------------------------------------- */
  var burger = $('#burger'), nav = $('#nav');
  function closeNav() {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeNav();
  });
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* ---------------------------------------------------
     4. Reveal al entrar en pantalla
     --------------------------------------------------- */
  var targets = $$('.reveal, .step');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------
     5. Nav activo según la sección visible
     --------------------------------------------------- */
  var links = $$('.nav a[href^="#"]:not(.btn)');
  var secs  = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a, i) { a.classList.toggle('is-active', secs[i] === en.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { if (s) spy.observe(s); });
  }

  /* ---------------------------------------------------
     6. Brillo que sigue al puntero en las tarjetas
     --------------------------------------------------- */
  if (matchMedia('(hover:hover)').matches) {
    $$('.card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------------------------------------------
     7. Contadores de la sección Nosotros
     --------------------------------------------------- */
  var counters = $$('[data-count]');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function runCounter(el) {
    var end = parseFloat(el.dataset.count) || 0;
    var sfx = el.dataset.suffix || '+';
    if (reduced) { el.textContent = end + sfx; return; }
    var dur = 1400, t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e) + (k === 1 ? sfx : '');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------------------------------------------------
     8. Marquee: duplica el contenido para loop continuo
     --------------------------------------------------- */
  var track = $('.marquee__track');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------------------------------------------------
     9. FAQ: solo un panel abierto por vez
     --------------------------------------------------- */
  var faqs = $$('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------------------------------------------------
     10. Formulario
     --------------------------------------------------- */
  var form = $('#form'), msg = $('#formMsg');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'form__msg';
      msg.textContent = '';

      /* honeypot antispam */
      if (form._gotcha.value) return;

      /* validación */
      var bad = false;
      $$('[required]', form).forEach(function (f) {
        var ok = f.value.trim() !== '' && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value));
        f.closest('.field').classList.toggle('is-bad', !ok);
        if (!ok && !bad) { bad = true; f.focus(); }
      });
      if (bad) {
        msg.className = 'form__msg bad';
        msg.textContent = 'Revisá los campos marcados, por favor.';
        return;
      }

      var d = new FormData(form);
      var btn = $('button[type="submit"]', form);
      var endpoint = CFG.formEndpoint || 'mailto';

      /* --- sin endpoint: se arma un mail con todo cargado --- */
      if (endpoint === 'mailto') {
        var cuerpo =
          'Nombre: '   + (d.get('nombre')   || '-') + '\n' +
          'Empresa: '  + (d.get('empresa')  || '-') + '\n' +
          'Email: '    + (d.get('email')    || '-') + '\n' +
          'Teléfono: ' + (d.get('telefono') || '-') + '\n' +
          'Servicio: ' + (d.get('servicio') || '-') + '\n\n' +
          (d.get('mensaje') || '');
        location.href = 'mailto:' + mail +
          '?subject=' + encodeURIComponent('Consulta web — ' + (d.get('nombre') || '')) +
          '&body=' + encodeURIComponent(cuerpo);
        msg.className = 'form__msg ok';
        msg.textContent = 'Abrimos tu cliente de correo con la consulta lista para enviar.';
        return;
      }

      /* --- con endpoint: envío en segundo plano --- */
      btn.disabled = true;
      var label = $('span', btn);
      var prev = label.textContent;
      label.textContent = 'Enviando…';

      d.append('_subject', 'Consulta desde la web de M·DATOS');

      fetch(endpoint, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
        .then(function () {
          form.reset();
          msg.className = 'form__msg ok';
          msg.textContent = '¡Listo! Recibimos tu consulta. Te respondemos dentro del día hábil.';
        })
        .catch(function () {
          msg.className = 'form__msg bad';
          msg.innerHTML = 'No pudimos enviarlo. Escribinos por <a href="' + waHref +
            '" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:' + mail + '">' + mail + '</a>.';
        })
        .then(function () {
          btn.disabled = false;
          label.textContent = prev;
        });
    });

    $$('.field input, .field select, .field textarea', form).forEach(function (f) {
      f.addEventListener('input', function () { f.closest('.field').classList.remove('is-bad'); });
    });
  }
})();
