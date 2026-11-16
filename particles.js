/* Particle stage — raw WebGL, no library.
   One cloud of points morphs between 3D shapes as the chapters scroll by.
   Sections opt in with: data-shape, data-px, data-py, data-ps, data-pa. */
(function () {
  'use strict';

  var canvas = document.getElementById('stage');
  if (!canvas) return;
  var gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
  } catch (e) { /* no WebGL */ }
  if (!gl) { canvas.style.display = 'none'; return; }

  var root = document.documentElement;
  var reduce = !root.classList.contains('motion');
  var small = window.innerWidth < 860;
  var N = small ? 5200 : 12000;
  var TAU = Math.PI * 2;

  /* Deterministic random so the sculpture looks the same on every visit. */
  var seed = 20261116;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /* ---------- Shapes: each returns Float32Array(N * 3), roughly unit radius ---------- */

  function planet() {
    var a = new Float32Array(N * 3), shell = Math.floor(N * 0.74), i, y, r, th;
    for (i = 0; i < N; i++) {
      if (i < shell) {
        y = 1 - 2 * (i + 0.5) / shell;
        r = Math.sqrt(1 - y * y);
        th = i * 2.399963;
        var k = 0.92 + rnd() * 0.04;
        a[i * 3] = Math.cos(th) * r * k; a[i * 3 + 1] = y * k; a[i * 3 + 2] = Math.sin(th) * r * k;
      } else {
        /* tilted orbital ring */
        th = rnd() * TAU;
        r = 1.32 + (rnd() - 0.5) * 0.34 * rnd();
        var x = Math.cos(th) * r, z = Math.sin(th) * r, yy = (rnd() - 0.5) * 0.03;
        var c = Math.cos(0.42), s = Math.sin(0.42);
        a[i * 3] = x * c - yy * s; a[i * 3 + 1] = x * s + yy * c; a[i * 3 + 2] = z;
      }
    }
    return a;
  }

  /* A plate seen from above: concentric rings, a raised rim, and a mound of food. Lies in XZ. */
  function plate() {
    var a = new Float32Array(N * 3), i, r, th, y;
    for (i = 0; i < N; i++) {
      var pick = rnd();
      th = rnd() * TAU;
      if (pick < 0.5) {
        var ring = Math.floor(Math.sqrt(rnd()) * 8);
        r = 0.36 + ring * 0.085 + (rnd() - 0.5) * 0.012;
        y = 0.2 * r * r * r - 0.08;
      } else if (pick < 0.78) {
        r = 1.08 + (rnd() - 0.5) * 0.07;
        y = 0.17 + rnd() * 0.05;
      } else {
        /* hemisphere mound in the middle */
        var u = rnd(), v = rnd(), rad = 0.3 * Math.cbrt(rnd());
        var ph = Math.acos(u);
        r = Math.sin(ph) * rad; y = Math.cos(ph) * rad * 1.1 - 0.07; th = v * TAU;
      }
      a[i * 3] = Math.cos(th) * r * 1.12; a[i * 3 + 1] = y; a[i * 3 + 2] = Math.sin(th) * r * 1.12;
    }
    return a;
  }

  function helix() {
    var a = new Float32Array(N * 3), i, t, ang, r = 0.5;
    for (i = 0; i < N; i++) {
      if (rnd() < 0.8) {
        t = rnd();
        ang = t * Math.PI * 5 + (rnd() < 0.5 ? 0 : Math.PI);
        a[i * 3] = Math.cos(ang) * r + (rnd() - 0.5) * 0.05;
        a[i * 3 + 1] = (t - 0.5) * 2.6 + (rnd() - 0.5) * 0.03;
        a[i * 3 + 2] = Math.sin(ang) * r + (rnd() - 0.5) * 0.05;
      } else {
        /* rungs joining the two strands */
        t = (Math.floor(rnd() * 26) + 0.5) / 26;
        ang = t * Math.PI * 5;
        var u = (rnd() * 2 - 1) * r;
        a[i * 3] = Math.cos(ang) * u; a[i * 3 + 1] = (t - 0.5) * 2.6; a[i * 3 + 2] = Math.sin(ang) * u;
      }
    }
    return a;
  }

  /* Flat shapes: draw to a small 2D canvas, then scatter the points over the filled pixels. */
  function fromDrawing(draw, scale) {
    var S = 256, c = document.createElement('canvas'), a = new Float32Array(N * 3), i;
    c.width = c.height = S;
    var ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return planet();
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
    draw(ctx, S);
    var px = ctx.getImageData(0, 0, S, S).data, pts = [];
    for (i = 0; i < S * S; i++) if (px[i * 4 + 3] > 120) pts.push(i);
    if (pts.length < 50) return planet();
    for (i = 0; i < N; i++) {
      var p = pts[Math.floor(rnd() * pts.length)];
      var x = (p % S) + rnd(), y = Math.floor(p / S) + rnd();
      a[i * 3] = (x / (S / 2) - 1) * scale;
      a[i * 3 + 1] = -(y / (S / 2) - 1) * scale;
      a[i * 3 + 2] = (rnd() - 0.5) * 0.16;
    }
    return a;
  }

  function glyph(text, family) {
    return function (ctx, S) {
      var size = 200;
      ctx.font = '900 ' + size + 'px ' + family;
      var mt = ctx.measureText(text), w = mt.width || 1;
      var h = (mt.actualBoundingBoxAscent + mt.actualBoundingBoxDescent) || size * 0.75;
      size = size * Math.min((S * 0.9) / w, (S * 0.86) / h);
      ctx.font = '900 ' + size + 'px ' + family;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, S / 2, S / 2 + size * 0.04);
    };
  }

  function checkMark(ctx) {
    ctx.lineWidth = 30; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(46, 136); ctx.lineTo(104, 194); ctx.lineTo(214, 68); ctx.stroke();
  }

  var SANS = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
  var SHAPES = {
    sphere: { make: planet, spin: 1, tilt: 0.32 },
    aa:     { make: function () { return fromDrawing(glyph('AA', SANS), 1.2); }, spin: 0, tilt: 0.05 },
    plate:  { make: plate, spin: 1, tilt: 0.7 },
    helix:  { make: helix, spin: 1, tilt: 0.18 },
    check:  { make: function () { return fromDrawing(checkMark, 1.15); }, spin: 0, tilt: 0.05 },
    at:     { make: function () { return fromDrawing(glyph('@', SANS), 1.2); }, spin: 0, tilt: 0.05 }
  };

  /* ---------- Stops: one per section that names a shape ---------- */

  var stops = [].slice.call(document.querySelectorAll('[data-shape]')).map(function (el) {
    var d = el.dataset, def = SHAPES[d.shape] ? d.shape : 'sphere';
    function num(v, f) { v = parseFloat(v); return isNaN(v) ? f : v; }
    return { el: el, shape: def, x: num(d.px, 0), y: num(d.py, 0), s: num(d.ps, 1), a: num(d.pa, 1), top: 0 };
  });
  if (!stops.length) stops = [{ el: document.body, shape: 'sphere', x: 0, y: 0, s: 1, a: 1, top: 0 }];

  /* ---------- GL program ---------- */

  var VS = [
    'attribute vec3 aFrom; attribute vec3 aTo; attribute vec2 aRand;',
    'uniform float uMix, uTime, uUnit, uSize, uAlpha, uScale, uIntro;',
    'uniform vec2 uRes, uOffset, uPointer;',
    'uniform vec4 uRot;',
    'varying vec3 vCol; varying float vA;',
    'vec3 rot(vec3 p, float ay, float ax){',
    '  float c = cos(ay), s = sin(ay);',
    '  p = vec3(c*p.x + s*p.z, p.y, c*p.z - s*p.x);',
    '  c = cos(ax); s = sin(ax);',
    '  return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z);',
    '}',
    'void main(){',
    '  float st = 0.6;',
    '  float m = clamp(uMix*(1.0 + st) - aRand.x*st, 0.0, 1.0);',
    '  m = m*m*(3.0 - 2.0*m);',
    '  vec3 a = rot(aFrom, uRot.x, uRot.y);',
    '  vec3 b = rot(aTo, uRot.z, uRot.w);',
    '  vec3 dir = vec3(sin(aRand.x*91.7), cos(aRand.y*47.3), sin(aRand.x*13.1 + aRand.y*29.0));',
    '  float burst = sin(m*3.14159265);',
    '  vec3 p = mix(a, b, m);',
    '  p += dir*(burst*0.42 + 0.014*sin(uTime*1.3 + aRand.y*40.0) + (1.0 - uIntro)*(1.0 - uIntro)*2.6);',
    '  p *= uScale;',
    '  float d = 3.4 - p.z;',
    '  float f = 2.1/d;',
    '  vec2 px = vec2(uUnit/uRes.x, uUnit/uRes.y);',
    '  vec2 ndc = p.xy*f*px + uOffset;',
    '  vec2 dl = (ndc - uPointer)/px;',
    '  ndc += normalize(dl + 1e-5)*exp(-dot(dl, dl)*10.0)*0.075*px;',
    '  gl_Position = vec4(ndc, 0.0, 1.0);',
    '  gl_PointSize = uSize*(0.55 + aRand.y*1.0)*f*(1.0 + burst*0.7);',
    '  float k = fract(aRand.x*7.31 + aRand.y*3.17);',
    '  vec3 c1 = vec3(1.0, 0.70, 0.28), c2 = vec3(1.0, 0.36, 0.33), c3 = vec3(0.48, 0.38, 1.0);',
    '  vCol = mix(mix(c1, c2, smoothstep(0.0, 0.6, k)), c3, smoothstep(0.58, 1.0, k));',
    '  float depth = clamp((p.z + 1.4)/2.8, 0.0, 1.0);',
    '  vA = uAlpha*(0.38 + 0.92*depth)*uIntro*(1.0 - 0.6*burst);',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'varying vec3 vCol; varying float vA;',
    'void main(){',
    '  vec2 c = gl_PointCoord - 0.5;',
    '  float a = smoothstep(0.25, 0.0, dot(c, c));',
    '  gl_FragColor = vec4(vCol*a*vA, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
  var prog = gl.createProgram();
  if (!vs || !fs) { canvas.style.display = 'none'; return; }
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return; }
  gl.useProgram(prog);

  var loc = {};
  ['aFrom', 'aTo', 'aRand'].forEach(function (n) { loc[n] = gl.getAttribLocation(prog, n); });
  ['uMix', 'uTime', 'uUnit', 'uSize', 'uAlpha', 'uScale', 'uIntro', 'uRes', 'uOffset', 'uPointer', 'uRot']
    .forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });

  /* Build each distinct shape once. */
  var buffers = {};
  stops.forEach(function (s) {
    if (buffers[s.shape]) return;
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, SHAPES[s.shape].make(), gl.STATIC_DRAW);
    buffers[s.shape] = b;
  });
  var rand = new Float32Array(N * 2);
  for (var i = 0; i < N * 2; i++) rand[i] = rnd();
  var randBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, randBuf);
  gl.bufferData(gl.ARRAY_BUFFER, rand, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc.aRand);
  gl.vertexAttribPointer(loc.aRand, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(loc.aFrom);
  gl.enableVertexAttribArray(loc.aTo);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(7 / 255, 7 / 255, 10 / 255, 1);

  var boundSeg = -1;
  function bindSegment(seg) {
    if (seg === boundSeg) return;
    boundSeg = seg;
    var a = stops[seg], b = stops[Math.min(seg + 1, stops.length - 1)];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[a.shape]);
    gl.vertexAttribPointer(loc.aFrom, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[b.shape]);
    gl.vertexAttribPointer(loc.aTo, 3, gl.FLOAT, false, 0, 0);
  }

  /* ---------- Sizing and measuring ---------- */

  var W = 0, H = 0, dpr = 1, unit = 1, vh = window.innerHeight;
  function resize(force) {
    var w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    if (!force && w === W && Math.abs(h - H) < 120) return;
    W = w; H = h;
    small = w < 860;
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    unit = Math.min(w, h);
  }
  function measure() {
    var y = window.pageYOffset || root.scrollTop || 0;
    vh = window.innerHeight;
    stops.forEach(function (s) { s.top = s.el.getBoundingClientRect().top + y; });
    stops[0].top = Math.min(stops[0].top, 0);
  }
  resize(true); measure();
  window.addEventListener('resize', function () { resize(false); measure(); }, { passive: true });
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  setTimeout(measure, 1500);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);

  /* ---------- Input ---------- */

  var ptr = { x: 9, y: 9, tx: 9, ty: 9, rx: 0, ry: 0, trx: 0, try_: 0 };
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    ptr.tx = e.clientX / window.innerWidth * 2 - 1;
    ptr.ty = -(e.clientY / window.innerHeight * 2 - 1);
    ptr.trx = ptr.tx; ptr.try_ = ptr.ty;
  }, { passive: true });
  document.addEventListener('mouseleave', function () { ptr.tx = 9; ptr.ty = 9; });

  /* ---------- Frame loop ---------- */

  var progress = 0, spin = 0, lastY = window.pageYOffset || 0, vel = 0;
  var last = performance.now(), t0 = last, running = true, frames = 0, slow = 0, count = N;

  function target(y) {
    var mid = y + vh * 0.5, i = 0;
    for (var k = 0; k < stops.length; k++) if (stops[k].top <= mid) i = k;
    if (i >= stops.length - 1) return stops.length - 1;
    var next = stops[i + 1];
    var win = Math.max(1, Math.min(vh * 0.85, next.top - stops[i].top));
    var t = (mid - (next.top - win)) / win;
    return i + Math.max(0, Math.min(1, t));
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    var time = (now - t0) / 1000;

    /* Drop half the points if the device is clearly struggling. */
    if (frames < 90) {
      frames++;
      if (dt > 0.034) slow++;
      if (frames === 90 && slow > 45) count = Math.floor(N / 2);
    }

    var y = window.pageYOffset || root.scrollTop || 0;
    /* clamp so a jump (nav link, Home/End) can't whip the sculpture around */
    vel = lerp(vel, Math.max(-70, Math.min(70, y - lastY)), 0.2); lastY = y;

    var want = target(y);
    progress = reduce ? want : lerp(progress, want, 1 - Math.pow(0.0015, dt));
    if (Math.abs(want - progress) < 0.0005) progress = want;

    var seg = Math.min(Math.floor(progress), Math.max(0, stops.length - 2));
    var mix = Math.max(0, Math.min(1, progress - seg));
    if (stops.length < 2) { seg = 0; mix = 0; }
    bindSegment(seg);
    var A = stops[seg], B = stops[Math.min(seg + 1, stops.length - 1)];
    var e = mix * mix * (3 - 2 * mix);

    if (!reduce) spin += dt * 0.24;
    spin += vel * 0.0022;
    ptr.x = lerp(ptr.x, ptr.tx, 0.12); ptr.y = lerp(ptr.y, ptr.ty, 0.12);
    ptr.rx = lerp(ptr.rx, ptr.trx, 0.05); ptr.ry = lerp(ptr.ry, ptr.try_, 0.05);
    var sway = (reduce ? 0 : Math.sin(time * 0.55) * 0.38) + ptr.rx * 0.45 + vel * 0.004;
    var sa = SHAPES[A.shape], sb = SHAPES[B.shape];

    var narrow = small ? 1 : 0;
    var ox = narrow ? 0 : lerp(A.x, B.x, e);
    var oy = lerp(A.y, B.y, e) + (narrow ? 0.08 : 0);
    var sc = lerp(A.s, B.s, e) * (narrow ? 0.92 : 1);
    var al = lerp(A.a, B.a, e) * (narrow ? 0.62 : 1);
    /* on phones the hero keeps the sculpture bright behind the name, then it settles back */
    if (narrow && seg === 0) al = lerp(0.66, al, e);

    var intro = reduce ? 1 : Math.min(1, time / 1.9);
    intro = 1 - Math.pow(1 - intro, 3);

    gl.uniform1f(loc.uMix, mix);
    gl.uniform1f(loc.uTime, reduce ? 0 : time);
    gl.uniform1f(loc.uUnit, unit * dpr);
    gl.uniform1f(loc.uSize, Math.max(2.2, unit * dpr / 135));
    gl.uniform1f(loc.uAlpha, al);
    gl.uniform1f(loc.uScale, sc);
    gl.uniform1f(loc.uIntro, intro);
    gl.uniform2f(loc.uRes, canvas.width, canvas.height);
    gl.uniform2f(loc.uOffset, ox, oy);
    gl.uniform2f(loc.uPointer, ptr.x, ptr.y);
    gl.uniform4f(loc.uRot,
      sa.spin ? spin : sway, sa.tilt - ptr.ry * 0.25,
      sb.spin ? spin : sway, sb.tilt - ptr.ry * 0.25);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  /* No visibility handling needed: browsers already pause requestAnimationFrame in background tabs,
     and dt is clamped, so the sculpture simply carries on when the tab comes back. */
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault(); running = false; canvas.style.display = 'none'; root.classList.remove('gl');
  });

  root.classList.add('gl');
  requestAnimationFrame(frame);
})();
