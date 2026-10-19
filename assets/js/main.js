(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var siblings = Array.prototype.indexOf.call(entry.target.parentNode.children, entry.target);
        entry.target.style.transitionDelay = Math.min(siblings, 4) * 80 + 'ms';
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (link && entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) navObs.observe(section);
    });
  }

  /* ---------- Typing effect ---------- */
  var typed = document.querySelector('.typed');
  if (typed && !reduceMotion) {
    var words = JSON.parse(typed.getAttribute('data-words'));
    var w = 0, i = words[0].length, deleting = true;
    (function tick() {
      var word = words[w];
      typed.textContent = word.slice(0, i);
      var delay = deleting ? 35 : 70;
      if (deleting && i === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      else if (!deleting && i === words[w].length) { deleting = true; delay = 2000; }
      i += deleting ? -1 : 1;
      if (i < 0) i = 0;
      setTimeout(tick, delay);
    })();
  }

  /* ---------- Count-up stats ---------- */
  var counters = document.querySelectorAll('.count');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, target = +el.getAttribute('data-target'), start = null;
        (function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1200, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
        countObs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = '0'; countObs.observe(c); });
  }

  /* ---------- Card spotlight + tilt ---------- */
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  document.querySelectorAll('.tilt').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (finePointer && !reduceMotion) {
        var rx = ((y / r.height) - 0.5) * -6, ry = ((x / r.width) - 0.5) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      }
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  /* ---------- Copy link (posts) ---------- */
  document.querySelectorAll('.copy-link').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(btn.getAttribute('data-url')).then(function () {
        btn.textContent = 'copied ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = 'copy link'; btn.classList.remove('copied'); }, 1800);
      });
    });
  });

  /* ---------- Background network canvas ---------- */
  var canvas = document.getElementById('bg-canvas');
  if (!canvas || reduceMotion) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var nodes = [], W = 0, H = 0, mouse = { x: -9999, y: -9999 }, running = true;
  var LINK = 140;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(90, (W * H) / 16000));
    nodes = [];
    for (var n = 0; n < count; n++) {
      nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
    }
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (var a = 0; a < nodes.length; a++) {
      var p = nodes[a];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      var dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.sqrt(dxm * dxm + dym * dym);
      if (dm < 180) {
        ctx.strokeStyle = 'rgba(45,240,200,' + (0.35 * (1 - dm / 180)) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }

      for (var b = a + 1; b < nodes.length; b++) {
        var q = nodes[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          ctx.strokeStyle = 'rgba(90,170,220,' + (0.14 * (1 - Math.sqrt(d) / LINK)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(45,240,200,0.55)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  window.addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });

  resize();
  requestAnimationFrame(draw);
})();
