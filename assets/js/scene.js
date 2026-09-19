/* =========================================================
   M·DATOS — Fondo animado
   Un único canvas que encadena tres escenas según el scroll:
     A. Red de datos que forma el isotipo M y se dispersa
     B. Grilla en perspectiva con pulsos de luz
     C. Aurora líquida azul
   Sin dependencias. Canvas 2D, DPR-aware, ~60fps.
   ========================================================= */
(function () {
  'use strict';

  var cv = document.getElementById('fx');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', { alpha: true });

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, DPR = 1;
  var mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  var scroll = 0;          // 0..1 progreso del documento
  var scrollSmooth = 0;
  var t0 = performance.now();
  var running = true;

  /* ---------- utilidades ---------- */
  function lerp(a, b, k) { return a + (b - a) * k; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  /* rampa suave entre a y b */
  function ramp(v, a, b) {
    if (b === a) return v < a ? 0 : 1;
    var k = clamp((v - a) / (b - a), 0, 1);
    return k * k * (3 - 2 * k);
  }
  /* peso de una escena: sube de a1→a2, se mantiene, baja de b1→b2 */
  function band(v, a1, a2, b1, b2) { return ramp(v, a1, a2) * (1 - ramp(v, b1, b2)); }

  /* =======================================================
     ESCENA A — red de datos + isotipo
     ======================================================= */
  var P = [];              // partículas
  var COUNT = 0;
  var LINK = 0;            // distancia de conexión
  var grid = null, cols = 0, rows = 0, cell = 0;
  var logoReady = false;
  var box = null;            // caja donde se arma el isotipo

  function particleCount() {
    var a = W * H;
    if (W < 620) return 700;
    if (W < 1100) return 1150;
    return Math.min(2400, Math.round(a / 750));
  }

  function makeParticles() {
    COUNT = particleCount();
    LINK = W < 620 ? 62 : 80;   // distancia máxima (estado disperso)
    P = [];
    for (var i = 0; i < COUNT; i++) {
      P.push({
        tx: Math.random() * W, ty: Math.random() * H,   // destino (isotipo)
        hx: Math.random() * W, hy: Math.random() * H,   // posición libre
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        sp: 0.18 + Math.random() * 0.5,                  // velocidad de deriva
        ph: Math.random() * Math.PI * 2,
        amp: 10 + Math.random() * 46,
        s: Math.random() < 0.12 ? 2.8 : 1.6,             // tamaño
        deg: 0,                                          // enlaces usados en el frame
        r: 90, g: 170, b: 255, a: 0.9,
        on: false                                        // pertenece al logo
      });
    }
    sampleLogo();
  }

  /* lee el PNG del isotipo y reparte partículas sobre sus píxeles,
     heredando el degradado real del logo */
  var logoImg = new Image();
  logoImg.src = 'assets/brand/mark.png';
  logoImg.onload = function () { logoReady = true; sampleLogo(); };

  function sampleLogo() {
    if (!logoReady || !P.length) return;

    var narrow = W < 860;
    var boxW = narrow ? W * 0.74 : Math.min(W * 0.36, 470);
    var scale = boxW / logoImg.width;
    var boxH = logoImg.height * scale;
    var ox = narrow ? (W - boxW) / 2 : W * 0.76 - boxW / 2;
    var oy = narrow ? H * 0.53 - boxH / 2 : H * 0.48 - boxH / 2;

    box = { x: ox, y: oy, w: boxW, h: boxH };

    var sw = Math.max(2, Math.round(boxW / 3));
    var sh = Math.max(2, Math.round(boxH / 3));
    var off = document.createElement('canvas');
    off.width = sw; off.height = sh;
    var oc = off.getContext('2d', { willReadFrequently: true });
    oc.drawImage(logoImg, 0, 0, sw, sh);

    var data;
    try { data = oc.getImageData(0, 0, sw, sh).data; }
    catch (e) { return; }  // canvas "tainted": seguimos sin isotipo

    var pts = [];
    for (var y = 0; y < sh; y++) {
      for (var x = 0; x < sw; x++) {
        var i = (y * sw + x) * 4;
        if (data[i + 3] > 130) {
          pts.push([x / sw, y / sh, data[i], data[i + 1], data[i + 2]]);
        }
      }
    }
    if (!pts.length) return;

    /* barajado para que el muestreo sea parejo */
    for (var j = pts.length - 1; j > 0; j--) {
      var k = (Math.random() * (j + 1)) | 0, tmp = pts[j]; pts[j] = pts[k]; pts[k] = tmp;
    }

    var use = Math.min(P.length, Math.round(P.length * 0.80));
    for (var n = 0; n < P.length; n++) {
      var p = P[n];
      if (n < use) {
        var q = pts[n % pts.length];
        p.tx = ox + q[0] * boxW;
        p.ty = oy + q[1] * boxH;
        p.r = q[2]; p.g = q[3]; p.b = q[4];
        p.on = true;
      } else {
        p.tx = Math.random() * W; p.ty = Math.random() * H;
        p.r = 70; p.g = 150; p.b = 240;
        p.on = false;
      }
      p.hx = Math.random() * W;
      p.hy = Math.random() * H;
    }
  }

  function buildGrid() {
    cell = LINK;
    cols = Math.ceil(W / cell) + 1;
    rows = Math.ceil(H / cell) + 1;
    grid = new Array(cols * rows);
    for (var i = 0; i < grid.length; i++) grid[i] = [];
  }

  function drawNetwork(alpha, time) {
    if (alpha <= 0.002) return;

    /* 0 = formado (isotipo) · 1 = disperso (red libre) */
    var disperse = ramp(scrollSmooth, 0.015, 0.16);
    /* con el isotipo formado los enlaces son cortos (dibujan la M);
       al dispersarse se estiran y arman la red */
    var link = LINK * (0.40 + disperse * 0.60);
    var px = mouse.x * (14 + disperse * 26);
    var py = mouse.y * (14 + disperse * 26);

    for (var i = 0; i < grid.length; i++) grid[i].length = 0;

    var i2, p;
    for (i2 = 0; i2 < P.length; i2++) {
      p = P[i2];
      p.deg = 0;
      var wob = Math.sin(time * p.sp + p.ph);
      var fx = p.hx + Math.cos(time * p.sp * 0.7 + p.ph) * p.amp;
      var fy = p.hy + wob * p.amp;

      p.x = lerp(p.tx, fx, disperse) + px * (p.on ? 1 : 0.45);
      p.y = lerp(p.ty, fy, disperse) + py * (p.on ? 1 : 0.45);

      /* repulsión del puntero */
      if (mouse.active) {
        var dx = p.x - mouse.px, dy = p.y - mouse.py;
        var d2 = dx * dx + dy * dy;
        if (d2 < 15000 && d2 > 1) {
          var f = (15000 - d2) / 15000;
          var d = Math.sqrt(d2);
          p.x += (dx / d) * f * 34;
          p.y += (dy / d) * f * 34;
        }
      }

      if (p.x > -60 && p.x < W + 60 && p.y > -60 && p.y < H + 60) {
        var cx = (p.x / cell) | 0, cy = (p.y / cell) | 0;
        if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) grid[cy * cols + cx].push(p);
      }
    }

    /* conexiones — 3 tramos de opacidad para no tocar el estado por línea */
    var linkA = alpha * (0.52 - disperse * 0.26);
    if (linkA > 0.004) {
      var buckets = [[], [], []];
      var L2 = link * link;
      var MAXDEG = 3;
      for (var cy2 = 0; cy2 < rows; cy2++) {
        for (var cx2 = 0; cx2 < cols; cx2++) {
          var a = grid[cy2 * cols + cx2];
          if (!a.length) continue;
          for (var o = 0; o < 4; o++) {
            var nx = cx2 + (o === 0 ? 0 : o === 1 ? 1 : o === 2 ? -1 : 1);
            var ny = cy2 + (o === 0 ? 0 : o === 1 ? 0 : 1);
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            var b = grid[ny * cols + nx];
            if (!b.length) continue;
            var same = (o === 0);
            for (var m = 0; m < a.length; m++) {
              for (var n2 = same ? m + 1 : 0; n2 < b.length; n2++) {
                var q1 = a[m], q2 = b[n2];
                var ddx = q1.x - q2.x, ddy = q1.y - q2.y;
                var dd = ddx * ddx + ddy * ddy;
                if (dd < L2 && q1.deg < MAXDEG && q2.deg < MAXDEG) {
                  q1.deg++; q2.deg++;
                  var k = dd / L2;
                  buckets[k < 0.33 ? 0 : k < 0.66 ? 1 : 2].push(q1, q2);
                }
              }
            }
          }
        }
      }
      var strengths = [1, 0.58, 0.24];
      for (var s = 0; s < 3; s++) {
        var arr = buckets[s];
        if (!arr.length) continue;
        ctx.globalAlpha = linkA * strengths[s];
        ctx.strokeStyle = '#3FA6FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var v = 0; v < arr.length; v += 2) {
          ctx.moveTo(arr[v].x, arr[v].y);
          ctx.lineTo(arr[v + 1].x, arr[v + 1].y);
        }
        ctx.stroke();
      }
    }

    /* el isotipo real, que se disuelve a medida que la red se dispersa */
    var form = 1 - disperse;
    if (box && logoReady && form > 0.01) {
      ctx.save();
      ctx.globalAlpha = alpha * form * (W < 860 ? 0.30 : 0.62);
      var gw = box.w * (1 + (1 - form) * 0.12);
      var gh = box.h * (1 + (1 - form) * 0.12);
      ctx.drawImage(logoImg,
        box.x + px - (gw - box.w) / 2,
        box.y + py - (gh - box.h) / 2, gw, gh);
      ctx.restore();
    }

    /* puntos */
    ctx.globalAlpha = 1;
    for (var z = 0; z < P.length; z++) {
      p = P[z];
      var op = alpha * (p.on ? 1 : 0.5) * (0.72 + 0.28 * Math.sin(time * 1.4 + p.ph));
      if (op <= 0.01) continue;
      ctx.fillStyle = 'rgba(' + p.r + ',' + p.g + ',' + p.b + ',' + op.toFixed(3) + ')';
      var sz = p.s * (1.3 - disperse * 0.42);
      ctx.fillRect(p.x, p.y, sz, sz);
    }

    /* halo del isotipo mientras está formado */
    var halo = alpha * (1 - disperse) * 0.72;
    if (halo > 0.01) {
      var narrow = W < 860;
      var hx = narrow ? W * 0.5 : W * 0.76;
      var hy = narrow ? H * 0.53 : H * 0.48;
      var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.min(W, H) * 0.42);
      g.addColorStop(0, 'rgba(0,150,255,' + (halo * 0.5).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,150,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* =======================================================
     ESCENA B — grilla en perspectiva + pulsos
     ======================================================= */
  var pulses = [];
  function makePulses() {
    pulses = [];
    for (var i = 0; i < 9; i++) {
      pulses.push({ lane: (Math.random() * 22 | 0) - 11, t: Math.random(), sp: 0.07 + Math.random() * 0.16 });
    }
  }

  function drawGrid(alpha, time, dt) {
    if (alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = alpha;

    var hz = H * 0.46 + mouse.y * 26;           // horizonte
    var vpx = W * 0.5 + mouse.x * 60;           // punto de fuga
    var spread = W * 1.5;

    /* resplandor del horizonte */
    var gg = ctx.createLinearGradient(0, hz - H * 0.3, 0, hz + H * 0.12);
    gg.addColorStop(0, 'rgba(0,90,210,0)');
    gg.addColorStop(0.78, 'rgba(0,120,255,.16)');
    gg.addColorStop(1, 'rgba(0,200,255,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, hz - H * 0.3, W, H * 0.42);

    /* líneas que van al punto de fuga */
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(80,170,255,.2)';
    ctx.beginPath();
    for (var i = -11; i <= 11; i++) {
      var bx = vpx + (i / 11) * spread;
      ctx.moveTo(vpx, hz);
      ctx.lineTo(bx, H + 40);
    }
    ctx.stroke();

    /* líneas transversales, espaciadas en perspectiva y en movimiento */
    var off = (time * 0.11) % 1;
    ctx.strokeStyle = 'rgba(80,170,255,.16)';
    ctx.beginPath();
    for (var r = 0; r < 26; r++) {
      var k = (r + off) / 26;
      var yy = hz + (H - hz + 40) * (k * k * k);
      if (yy > H + 40) continue;
      ctx.moveTo(0, yy);
      ctx.lineTo(W, yy);
    }
    ctx.stroke();

    /* pulsos de datos bajando por las líneas */
    for (var p = 0; p < pulses.length; p++) {
      var q = pulses[p];
      q.t += q.sp * dt;
      if (q.t > 1) { q.t = 0; q.lane = (Math.random() * 22 | 0) - 11; q.sp = 0.07 + Math.random() * 0.16; }
      var e = q.t * q.t * q.t;
      var x1 = lerp(vpx, vpx + (q.lane / 11) * spread, e);
      var y1 = lerp(hz, H + 40, e);
      var e2 = Math.max(0, e - 0.055);
      var x2 = lerp(vpx, vpx + (q.lane / 11) * spread, e2);
      var y2 = lerp(hz, H + 40, e2);

      var lg = ctx.createLinearGradient(x2, y2, x1, y1);
      lg.addColorStop(0, 'rgba(0,212,255,0)');
      lg.addColorStop(1, 'rgba(120,235,255,.95)');
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1 + e * 2.4;
      ctx.beginPath();
      ctx.moveTo(x2, y2); ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    /* estrellas sobre el horizonte */
    ctx.fillStyle = 'rgba(160,215,255,.5)';
    for (var s = 0; s < 46; s++) {
      var sx = ((s * 97.13) % 1) * W;
      var sy = ((s * 41.77) % 1) * hz * 0.92;
      var tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.9 + s));
      ctx.globalAlpha = alpha * tw * 0.6;
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }
    ctx.restore();
  }

  /* =======================================================
     ESCENA C — aurora líquida
     ======================================================= */
  var blobs = [
    { h: '0,190,255', r: 0.62, sx: 0.09, sy: 0.07, px: 0.30, py: 0.40, a: 0.24 },
    { h: '0,110,255', r: 0.74, sx: 0.06, sy: 0.11, px: 0.72, py: 0.55, a: 0.24 },
    { h: '0,60,190',  r: 0.86, sx: 0.04, sy: 0.05, px: 0.50, py: 0.78, a: 0.22 },
    { h: '90,220,255',r: 0.44, sx: 0.13, sy: 0.09, px: 0.84, py: 0.22, a: 0.17 },
    { h: '0,150,255', r: 0.52, sx: 0.10, sy: 0.13, px: 0.16, py: 0.72, a: 0.18 }
  ];

  function drawAurora(alpha, time) {
    if (alpha <= 0.002) return;
    var D = Math.max(W, H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      var x = W * (b.px + Math.sin(time * b.sx + i * 1.7) * 0.16) + mouse.x * (24 + i * 9);
      var y = H * (b.py + Math.cos(time * b.sy + i * 2.3) * 0.14) + mouse.y * (20 + i * 7);
      var rad = D * b.r * (0.86 + 0.14 * Math.sin(time * 0.17 + i));
      var g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(' + b.h + ',' + (b.a * alpha).toFixed(3) + ')');
      g.addColorStop(0.45, 'rgba(' + b.h + ',' + (b.a * alpha * 0.28).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + b.h + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    /* líneas de datos finas atravesando la aurora */
    ctx.save();
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = 'rgba(150,225,255,.34)';
    ctx.lineWidth = 1;
    for (var l = 0; l < 5; l++) {
      var yy = H * (0.18 + l * 0.17) + Math.sin(time * 0.5 + l) * 30;
      ctx.beginPath();
      for (var x2 = 0; x2 <= W; x2 += 24) {
        var y2 = yy + Math.sin(x2 * 0.004 + time * 0.65 + l * 1.4) * (16 + l * 7);
        if (x2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  /* =======================================================
     Bucle
     ======================================================= */
  var last = 0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;
    var time = (now - t0) / 1000;

    scrollSmooth += (scroll - scrollSmooth) * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    var s = scrollSmooth;
    var wA = band(s, -1, 0, 0.20, 0.40);   // red de datos
    var wB = band(s, 0.20, 0.40, 0.58, 0.76); // grilla
    var wC = ramp(s, 0.58, 0.80);          // aurora

    drawAurora(wC, time);
    drawGrid(wB, time, dt);
    drawNetwork(wA, time);

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function drawStatic() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawAurora(0.5, 0);
    drawNetwork(1, 0);
    ctx.globalAlpha = 1;
  }

  /* =======================================================
     Eventos
     ======================================================= */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth || window.innerWidth;
    H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    makeParticles();
    buildGrid();
    makePulses();
    if (reduced) drawStatic();
  }

  var rt;
  addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 180);
  }, { passive: true });

  addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - innerHeight;
    scroll = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  }, { passive: true });

  addEventListener('pointermove', function (e) {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
    mouse.px = e.clientX; mouse.py = e.clientY;
    mouse.active = e.pointerType === 'mouse';
  }, { passive: true });

  addEventListener('pointerleave', function () { mouse.active = false; }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; }
    else if (!reduced && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });

  resize();
  logoImg.complete && (logoReady = true, sampleLogo());

  if (reduced) {
    running = false;
    setTimeout(drawStatic, 120);
  } else {
    requestAnimationFrame(frame);
  }
})();
