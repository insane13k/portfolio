/* Aryan Arora — portfolio motion. Progressive enhancement only: the page works without this file.
   One shared rAF loop drives every scroll/pointer effect; layout is measured on resize/load/fonts only. */
(function () {
  'use strict';
  var d = document, h = d.documentElement, w = window;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
  var mm = function (q) { return !!(w.matchMedia && w.matchMedia(q).matches); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var RM = !h.classList.contains('motion');
  var FINE = mm('(hover: hover) and (pointer: fine)');

  var sy = w.scrollY || 0, lastSy = sy, vel = 0, vh = w.innerHeight, vw = w.innerWidth;
  var docH = 1, pin = false, dirty = true, isReady = false;

  /* ---------- Ready + intro loader ---------- */
  function ready() {
    if (isReady) return;
    isReady = true;
    h.classList.add('ready');
    dirty = true;
  }
  var loader = $('.loader');
  if (loader && h.classList.contains('is-loading')) {
    try { sessionStorage.setItem('aa-run', '1'); } catch (e) {}
    var lNum = $('.loader-num', loader), lFill = $('.loader-fill', loader);
    var t0 = performance.now(), dur = t0 > 1100 ? 250 : 700;
    var step = function (now) {
      var p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
      lNum.textContent = ('00' + Math.round(e * 100)).slice(-3);
      lFill.style.transform = 'scaleX(' + e.toFixed(3) + ')';
      if (p < 1) { requestAnimationFrame(step); return; }
      h.classList.add('loader-out');
      ready();
      setTimeout(function () { h.classList.remove('is-loading', 'loader-out'); }, 600);
    };
    requestAnimationFrame(step);
  } else {
    h.classList.remove('is-loading');
    requestAnimationFrame(ready);
  }

  /* ---------- Element cache ---------- */
  var secs = $$('main > section[data-shape]');
  var secTop = [];
  var hero = $('.hero'), heroIn = $('.hero-inner'), heroH = 1, heroP = -1;
  var bar = $('.progress-bar');
  var navLinks = $$('.nav a[data-nav]'), curNav = -1;
  var hud = $('.hud'), hudCount = $('.hud-count'), hudRows = $$('[data-hud]');
  var passed = [], nPassed = 0, hudT;

  var lead = $('.scrub'), leadTop = 0, leadH = 1;
  var scrolly = $('.scrolly'), rig = $('.phones-rig'), fig = $('.phones'), beats = $$('.beat');
  var stepN = $('.beat-step-n'), stepBar = $('.beat-step-bar span'), scTop = 0, scH = 1, figTop = 0, figH = 1, rigP = -1, curBeat = -1;
  var hs = $('.hscroll'), hsStage = $('.hscroll-stage'), hsTrack = $('.hscroll-track'), hsProg = $('.hscroll-progress span');
  var hsTop = 0, hsH = 1, hsStageH = 1, hsDist = 0;
  var tl = $('.timeline'), tlLine = $('.tl-line'), tlDot = $('.tl-dot'), tlTop = 0, tlH = 1;
  var cards = $$('.card').map(function (c) {
    return { el: c, t: $('.tilt', c), top: 0, h: 1, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, r: null };
  });
  var marquee = $('.marquee'), marTop = 0, marBot = 0;
  var rows = $$('.marquee-row').map(function (r) {
    var dir = +r.getAttribute('data-dir') || -1;
    return { track: $('.marquee-track', r), copy: $('.marquee-copy', r), dir: dir, x: 0, w: 0 };
  });

  /* ---------- Split the About lead into words for the scrubbed reveal ---------- */
  if (lead && !RM) {
    var words = lead.textContent.trim().split(/\s+/);
    lead.textContent = '';
    words.forEach(function (wd, i) {
      var s = d.createElement('span');
      s.className = 'w';
      s.style.setProperty('--i', i);
      s.textContent = wd;
      lead.appendChild(s);
      if (i < words.length - 1) lead.appendChild(d.createTextNode(' '));
    });
    lead.style.setProperty('--n', words.length);
    lead.style.setProperty('--p', 0);
  }

  /* ---------- Measurement (never inside the loop) ---------- */
  function pageTop(el) { return el.getBoundingClientRect().top + sy; }
  function measure() {
    vw = w.innerWidth; vh = w.innerHeight; sy = w.scrollY || 0;
    pin = vw >= 860 && !RM;
    if (hs && hsTrack && hsStage && !RM) {
      hsDist = Math.max(0, hsTrack.scrollWidth - hsStage.clientWidth);
      hs.style.setProperty('--hs-h', Math.round(hsDist + hsStage.offsetHeight) + 'px');
    }
    secs.forEach(function (s, i) { secTop[i] = pageTop(s); });
    if (hero) heroH = Math.max(1, hero.offsetHeight);
    if (lead) { leadTop = pageTop(lead); leadH = lead.offsetHeight; }
    if (scrolly) { scTop = pageTop(scrolly); scH = scrolly.offsetHeight; }
    if (fig) { figTop = pageTop(fig); figH = fig.offsetHeight; }
    if (hs) { hsTop = pageTop(hs); hsH = hs.offsetHeight; hsStageH = hsStage.offsetHeight; }
    if (tl) { tlTop = pageTop(tl); tlH = Math.max(1, tl.offsetHeight); }
    cards.forEach(function (c) { c.top = pageTop(c.el); c.h = c.el.offsetHeight; c.r = null; });
    if (marquee) { marTop = pageTop(marquee); marBot = marTop + marquee.offsetHeight; }
    rows.forEach(function (r) {
      r.w = r.copy ? r.copy.offsetWidth : 0;
      if (r.dir > 0 && r.x === 0) r.x = -r.w;
    });
    docH = Math.max(h.scrollHeight, d.body.scrollHeight);
    rigP = heroP = -1;
    dirty = true;
  }

  /* ---------- Test-run HUD ---------- */
  function pass(i) {
    if (passed[i]) return;
    passed[i] = 1;
    nPassed++;
    secs[i].classList.add('passed');
    if (hudRows[i]) hudRows[i].classList.add('pass');
    if (hudCount) hudCount.textContent = nPassed + '/6 passed';
    if (hud && i > 0) {
      /* open the list for a moment so the tick is seen landing */
      hud.classList.add('open');
      clearTimeout(hudT);
      hudT = setTimeout(function () { hud.classList.remove('open'); }, 2600);
    }
    if (nPassed === secs.length && hud) {
      setTimeout(function () {
        hud.classList.add('all');
        hudCount.textContent = 'ALL CHECKS PASSED';
        setTimeout(function () { hud.classList.remove('all'); hudCount.textContent = nPassed + '/6 passed'; }, 3400);
      }, 650);
    }
  }

  /* ---------- Scroll-driven effects (called from the loop when scroll/layout changed) ---------- */
  function scrollFx() {
    var max = Math.max(1, docH - vh), i, p;
    if (bar) bar.style.transform = 'scaleX(' + clamp(sy / max, 0, 1).toFixed(4) + ')';

    var cur = 0, atEnd = sy >= max - 4;
    for (i = 0; i < secs.length; i++) {
      var rt = secTop[i] - sy;
      if (rt <= vh * .4) cur = i;
      if (isReady && !passed[i] && (rt <= vh * .55 || (atEnd && rt < vh))) pass(i);
    }
    if (cur !== curNav) {
      curNav = cur;
      navLinks.forEach(function (a) {
        if (+a.getAttribute('data-nav') === cur) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    if (RM) return;

    // Hero parallax out
    p = clamp(sy / heroH, 0, 1);
    if (heroIn && p !== heroP) {
      heroP = p;
      heroIn.style.transform = p ? 'translate3d(0,' + (-p * 140).toFixed(1) + 'px,0) scale(' + (1 - p * .06).toFixed(4) + ')' : '';
      heroIn.style.opacity = p ? clamp(1 - p * 1.15, 0, 1).toFixed(3) : '';
    }

    // About word scrub
    if (lead) {
      var lt = leadTop - sy;
      if (lt < vh * 1.2 && lt + leadH > -vh * .2) {
        lead.style.setProperty('--p', clamp((vh * .85 - lt) / (vh * .4 + leadH), 0, 1).toFixed(3));
      }
    }

    // Protein Plate phones + beats
    if (rig) {
      var pp = pin ? clamp((sy - scTop) / Math.max(1, scH - vh), 0, 1)
                   : clamp((vh - (figTop - sy)) / (vh + figH), 0, 1);
      if (pp !== rigP) {
        rigP = pp;
        var k = pin ? 1 : .7, a = pp < .5 ? pp * 2 : (pp - .5) * 2;
        var ry = (pp < .5 ? lerp(-32, 0, a) : lerp(0, 26, a)) * k;
        var rx = (pp < .5 ? lerp(10, 0, a) : lerp(0, -5, a)) * k;
        rig.style.transform = 'rotateY(' + ry.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg)';
        rig.style.setProperty('--gx', (100 - pp * 100).toFixed(1) + '%');
        if (pin) {
          var act = 0;
          beats.forEach(function (b, j) {
            var dd = pp * 3 - (j + .5);
            if ((j === 0 && dd < 0) || (j === beats.length - 1 && dd > 0)) dd = 0;
            var o = clamp((.47 - Math.abs(dd)) / .16, 0, 1); /* one beat is fully gone before the next arrives */
            b.style.setProperty('--o', o.toFixed(3));
            b.style.setProperty('--y', (-dd * 60).toFixed(1) + 'px');
            if (o > .5) act = j;
          });
          if (act !== curBeat && stepN) { curBeat = act; stepN.textContent = act + 1; }
          if (stepBar) stepBar.style.transform = 'scaleX(' + pp.toFixed(3) + ')';
        }
      }
    }

    // Horizontal process track
    if (hsDist && sy > hsTop - vh && sy < hsTop + hsH) {
      var hp = clamp((sy - hsTop) / Math.max(1, hsH - hsStageH), 0, 1);
      hsTrack.style.transform = 'translate3d(' + (-hp * hsDist).toFixed(1) + 'px,0,0)';
      if (hsProg) hsProg.style.transform = 'scaleX(' + hp.toFixed(4) + ')';
    }

    // Timeline line + riding dot
    if (tl && tlLine) {
      var tp = clamp((vh * .62 - (tlTop - sy)) / tlH, 0, 1);
      tlLine.style.transform = 'scaleY(' + tp.toFixed(4) + ')';
      if (tlDot) tlDot.style.transform = 'translate3d(0,' + (tp * (tlH - 16)).toFixed(1) + 'px,0)';
    }

    // Touch: scroll-driven card tilt
    if (!FINE) {
      cards.forEach(function (c) {
        var mid = c.top - sy + c.h / 2;
        if (mid > -c.h && mid < vh + c.h) {
          var q = clamp((mid - vh / 2) / vh, -1, 1);
          c.t.style.transform = 'rotateX(' + (q * 9).toFixed(2) + 'deg) rotateY(' + (q * -3).toFixed(2) + 'deg)';
        }
      });
    }
  }

  /* ---------- Marquee (velocity-reactive drift) ---------- */
  function marqueeFx(dt) {
    if (RM || !rows.length || sy + vh < marTop - 50 || sy > marBot + 50) return;
    var speed = (.7 + Math.min(Math.abs(vel) * .45, 28)) * dt;
    var sk = clamp(-vel * .3, -9, 9).toFixed(2);
    rows.forEach(function (r) {
      if (!r.w) return;
      r.x += r.dir * speed;
      if (r.x <= -r.w) r.x += r.w;
      else if (r.x > 0) r.x -= r.w;
      r.track.style.transform = 'translate3d(' + r.x.toFixed(2) + 'px,0,0) skewX(' + sk + 'deg)';
    });
  }

  /* ---------- Custom cursor ---------- */
  var cur = null, mx = -100, my = -100, rx = -100, ry2 = -100;
  if (FINE && !RM) {
    cur = { dot: d.createElement('div'), ring: d.createElement('div') };
    cur.dot.className = 'cursor-dot';
    cur.ring.className = 'cursor-ring';
    cur.ring.innerHTML = '<i></i>';
    cur.dot.setAttribute('aria-hidden', 'true');
    cur.ring.setAttribute('aria-hidden', 'true');
    cur.label = cur.ring.firstChild;
    d.body.appendChild(cur.dot);
    d.body.appendChild(cur.ring);
    w.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (mx < -50) { rx = e.clientX; ry2 = e.clientY; }
      mx = e.clientX; my = e.clientY;
      if (!h.classList.contains('cursor-on')) h.classList.add('has-cursor', 'cursor-on');
    }, { passive: true });
    d.addEventListener('pointerout', function (e) { if (!e.relatedTarget) h.classList.remove('cursor-on'); });
    d.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('a, button, [data-cursor]');
      var lab = t && t.getAttribute('data-cursor');
      h.classList.toggle('cursor-hover', !!t);
      h.classList.toggle('cursor-label', !!lab);
      cur.label.textContent = lab || '';
    });
    d.addEventListener('pointerdown', function () { h.classList.add('cursor-down'); });
    d.addEventListener('pointerup', function () { h.classList.remove('cursor-down'); });
  }
  function cursorFx(dt) {
    if (!cur || mx < -50) return;
    rx = lerp(rx, mx, clamp(.2 * dt, 0, 1));
    ry2 = lerp(ry2, my, clamp(.2 * dt, 0, 1));
    cur.dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    cur.ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry2.toFixed(1) + 'px,0)';
  }

  /* ---------- Pointer tilt cards (spring) + magnetic buttons ---------- */
  var hoverCard = null;
  if (FINE && !RM) {
    cards.forEach(function (c) {
      c.el.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        hoverCard = c; c.r = null;
        c.t.style.setProperty('--go', 1);
      });
      c.el.addEventListener('pointermove', function (e) {
        if (hoverCard !== c) return;
        if (!c.r) c.r = c.el.getBoundingClientRect();
        var px = clamp((e.clientX - c.r.left) / c.r.width, 0, 1), py = clamp((e.clientY - c.r.top) / c.r.height, 0, 1);
        c.tx = (.5 - py) * 14;
        c.ty = (px - .5) * 18;
        c.t.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        c.t.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      c.el.addEventListener('pointerleave', function () {
        if (hoverCard === c) hoverCard = null;
        c.tx = c.ty = 0;
        c.t.style.setProperty('--go', 0);
      });
    });
    $$('.magnetic').forEach(function (b) {
      var r = null;
      b.addEventListener('pointerenter', function () { r = b.getBoundingClientRect(); });
      b.addEventListener('pointermove', function (e) {
        if (!r) return;
        var x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        b.style.transform = 'translate3d(' + (x * .22).toFixed(1) + 'px,' + (y * .32).toFixed(1) + 'px,0)';
      });
      b.addEventListener('pointerleave', function () { r = null; b.style.transform = ''; });
    });
  }
  function tiltFx(dt) {
    if (!FINE || RM) return;
    cards.forEach(function (c) {
      var ex = c.tx - c.x, ey = c.ty - c.y;
      if (Math.abs(ex) < .01 && Math.abs(ey) < .01 && Math.abs(c.vx) < .01 && Math.abs(c.vy) < .01) return;
      c.vx = (c.vx + ex * .07 * dt) * .8;
      c.vy = (c.vy + ey * .07 * dt) * .8;
      c.x += c.vx; c.y += c.vy;
      c.t.style.transform = 'rotateX(' + c.x.toFixed(2) + 'deg) rotateY(' + c.y.toFixed(2) + 'deg)';
    });
  }

  /* ---------- The single loop ---------- */
  var tPrev = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    var dt = tPrev ? Math.min(4, (t - tPrev) / 16.667) : 1;
    tPrev = t;
    vel = lerp(vel, sy - lastSy, .15);
    lastSy = sy;
    if (Math.abs(vel) < .01) vel = 0;
    if (dirty) { dirty = false; scrollFx(); }
    marqueeFx(dt);
    cursorFx(dt);
    tiltFx(dt);
  }

  /* ---------- Reveals: IntersectionObserver + sweep failsafe ---------- */
  var revs = $$('[data-reveal]');
  $$('[data-reveal="stagger"]').forEach(function (c) {
    [].forEach.call(c.children, function (k, i) { k.style.setProperty('--i', i); });
  });
  function show(el, i) {
    if (el.classList.contains('in')) return;
    if (i) {
      el.style.transitionDelay = Math.min(i * 90, 450) + 'ms';
      setTimeout(function () { el.style.transitionDelay = ''; }, 1800);
    }
    el.classList.add('in');
  }
  function sweep() {
    revs.forEach(function (el) {
      if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh) show(el);
    });
  }
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (e.isIntersecting) { show(e.target, n++); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    revs.forEach(function (el) { io.observe(el); });
  } else {
    revs.forEach(function (el) { show(el); });
  }

  /* ---------- Mobile menu: aria-expanded, Escape, focus trap, scroll lock ---------- */
  var menuBtn = $('.menu-btn'), menu = $('#menu'), menuOpen = false;
  function setMenu(o, refocus) {
    menuOpen = o;
    h.classList.toggle('menu-open', o);
    menuBtn.setAttribute('aria-expanded', String(o));
    $('.menu-btn-label', menuBtn).textContent = o ? 'Close' : 'Menu';
    if (o) setTimeout(function () { var f = $('a', menu); if (f) f.focus(); }, 60);
    else if (refocus) menuBtn.focus();
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!menuOpen, true); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
    d.addEventListener('keydown', function (e) {
      if (!menuOpen) return;
      if (e.key === 'Escape') { setMenu(false, true); return; }
      if (e.key !== 'Tab') return;
      var f = [menuBtn].concat($$('a', menu)), a = d.activeElement, first = f[0], last = f[f.length - 1];
      if (f.indexOf(a) < 0) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && a === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Motion prompt (shown when the device asks for reduced motion and no choice is stored) ---------- */
  var ask = $('.motion-ask'), askNo = $('.motion-ask-no');
  if (ask && askNo) askNo.addEventListener('click', function () {
    try { localStorage.setItem('aa-motion', 'off'); } catch (e) {}
    h.classList.remove('ask-motion');
  });

  /* ---------- Copy email ---------- */
  var copyBtn = $('.copy-btn'), copyStatus = $('.copy-status');
  if (copyBtn && navigator.clipboard && w.isSecureContext) {
    copyBtn.hidden = false;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.getAttribute('data-copy')).then(function () {
        copyBtn.textContent = 'Copied ✓';
        copyStatus.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; copyStatus.textContent = ''; }, 2200);
      }, function () {
        copyStatus.textContent = 'Copy failed — select the address instead';
      });
    });
  }

  /* ---------- Listeners ---------- */
  var sweepT, resizeT;
  w.addEventListener('scroll', function () {
    sy = w.scrollY || 0;
    dirty = true;
    if (hoverCard) hoverCard.r = null;
    clearTimeout(sweepT);
    sweepT = setTimeout(sweep, 180);
  }, { passive: true });
  w.addEventListener('resize', function () {
    var nw = w.innerWidth, nh = w.innerHeight;
    // Mobile URL-bar show/hide changes only the height a little: keep the cached layout.
    if (!FINE && nw === vw && Math.abs(nh - vh) < 140) return;
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      measure();
      if (menuOpen && w.innerWidth >= 860) setMenu(false, false);
    }, 140);
  }, { passive: true });
  w.addEventListener('load', function () { measure(); sweep(); });
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure);
  if ('ResizeObserver' in w) {
    var roT;
    new ResizeObserver(function () { clearTimeout(roT); roT = setTimeout(measure, 200); }).observe(d.getElementById('main'));
  }

  measure();
  requestAnimationFrame(frame);
  w.AA = 1;
})();
