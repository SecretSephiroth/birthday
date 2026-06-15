/* ============================================================
   script.js — For Marian · June 16
   Pure vanilla JS, no dependencies.
   ============================================================ */

// ----------------------------------------------------------------
// 1. MEMORIES DATA — captions and image paths
// ----------------------------------------------------------------
const MEMORIES = [
  { src: 'assets/photos/photo_1_Jul_2024.jpg' },
  { src: 'assets/photos/photo_2_Aug_2024.jpg' },
  { src: 'assets/photos/photo_3_Sep_2024.jpg' },
  { src: 'assets/photos/photo_4_Oct_2024.jpg' },
  { src: 'assets/photos/photo_6_Jan_2025.jpg' },
  { src: 'assets/photos/photo_7_Mar_2025.jpg' },
  { src: 'assets/photos/photo_8_May_2025.jpg' },
  { src: 'assets/photos/photo_5_Nov_2024.jpg' }, // moved to last
];

// ----------------------------------------------------------------
// 2. STARFIELD
// ----------------------------------------------------------------
(function () {
  const wrap = document.getElementById('stars');
  if (!wrap) return;
  const n = window.innerWidth < 600 ? 150 : 280;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.6;
    s.style.width  = size + 'px';
    s.style.height = size + 'px';
    s.style.left   = (Math.random() * 100) + '%';
    s.style.top    = (Math.random() * 100) + '%';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.opacity = (Math.random() * 0.5 + 0.3).toString();
    wrap.appendChild(s);
  }
}());

// ----------------------------------------------------------------
// 2b. AUDIO — hide the player if song.mp3 is missing, handle autoplay on interaction
// ----------------------------------------------------------------
(function () {
  const audio = document.getElementById('song-audio');
  if (!audio) return;

  audio.addEventListener('error', function () {
    audio.classList.add('hidden');
  }, { once: true });

  // Browser security blocks autoplay until a user interacts with the page.
  // We attempt to play the song on the first user interaction (click/touch/scroll/key).
  let started = false;
  function startAudio() {
    if (started) return;
    started = true;
    audio.play().then(() => {
      cleanUpListeners();
    }).catch(err => {
      // If play fails (e.g. still blocked), reset flag so next interaction tries again
      started = false;
    });
  }

  function cleanUpListeners() {
    window.removeEventListener('click', startAudio);
    window.removeEventListener('touchstart', startAudio);
    window.removeEventListener('scroll', startAudio);
    window.removeEventListener('keydown', startAudio);
  }

  window.addEventListener('click', startAudio, { passive: true });
  window.addEventListener('touchstart', startAudio, { passive: true });
  window.addEventListener('scroll', startAudio, { passive: true });
  window.addEventListener('keydown', startAudio, { passive: true });

  // Try playing immediately (in case browser settings allow it)
  audio.play().then(() => {
    started = true;
    cleanUpListeners();
  }).catch(() => {});
}());


// ----------------------------------------------------------------
// 3. SCROLL REVEAL
// ----------------------------------------------------------------
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });
  els.forEach(e => io.observe(e));
}());

// ----------------------------------------------------------------
// 4. MEMORIES — build items, then wire up scroll & lightbox
// ----------------------------------------------------------------
(function () {
  const section = document.getElementById('journey-section');
  if (!section) return;

  const container = section.querySelector('.journey-items');
  const svg = section.querySelector('.journey-canvas-svg');

  // Build memory items from data
  MEMORIES.forEach(function (mem, i) {
    const item = document.createElement('div');
    item.className = 'mem-item';
    item.dataset.index = i;

    const wrap = document.createElement('div');
    wrap.className = 'mem-photo-wrap';

    const dot = document.createElement('div');
    dot.className = 'mem-dot';

    const photo = document.createElement('div');
    photo.className = 'mem-photo';

    const img = document.createElement('img');
    img.src     = mem.src;
    img.alt     = 'A memory';
    img.loading = 'lazy';
    img.style.imageRendering = 'auto';

    photo.appendChild(img);
    wrap.appendChild(dot);
    wrap.appendChild(photo);
    // No caption appended — dates removed

    item.appendChild(wrap);
    container.appendChild(item);
  });

  // Collect all rendered items
  const items = Array.from(container.querySelectorAll('.mem-item'));
  const dots  = items.map(it => it.querySelector('.mem-dot'));

  // ---- Constellation SVG path ----
  let raf = 0;

  function getDotCenter(dot) {
    // getBoundingClientRect is viewport-relative; subtracting section rect gives
    // position inside the section's local coordinate space — correct for the
    // absolutely-positioned SVG canvas that fills the section.
    const r  = dot.getBoundingClientRect();
    const sr = section.getBoundingClientRect();
    return {
      x: r.left + r.width  / 2 - sr.left,
      y: r.top  + r.height / 2 - sr.top,   // no scrollTop — rects already account for scroll
    };
  }

  function buildPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const t = 0.4;
      const cp1x = p1.x + (p2.x - p0.x) * t;
      const cp1y = p1.y + (p2.y - p0.y) * t;
      const cp2x = p2.x - (p3.x - p1.x) * t;
      const cp2y = p2.y - (p3.y - p1.y) * t;
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function mkSVGPath(d, strokeW, color) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', color);
    el.setAttribute('stroke-width', strokeW);
    el.setAttribute('stroke-linecap', 'round');
    el.setAttribute('stroke-linejoin', 'round');
    return el;
  }

  function drawConstellation() {
    raf = 0;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const pts = dots.map(d => getDotCenter(d));
    if (pts.length < 2) return;

    const d = buildPath(pts);

    // ── Dotted constellation path — two layers for a soft glow ────
    // Outer halo: wider, very faint
    const halo = mkSVGPath(d, 6, 'rgba(255,220,160,.08)');
    halo.setAttribute('stroke-dasharray', '2 22');
    svg.appendChild(halo);

    // Main dots: small round dots spaced like star-map dashes
    const line = mkSVGPath(d, 2.5, 'rgba(255,238,200,.55)');
    line.setAttribute('stroke-dasharray', '2 22');
    svg.appendChild(line);
  }

  function schedDraw() {
    if (!raf) raf = requestAnimationFrame(drawConstellation);
  }

  // ---- Active memory detection ----
  function updateActiveMemory() {
    const center = window.innerHeight / 2;
    let bestIdx = 0;
    let bestDist = Infinity;

    items.forEach(function (item, i) {
      const r = item.getBoundingClientRect();
      const itemCenter = r.top + r.height / 2;
      const dist = Math.abs(itemCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    items.forEach(function (item, i) {
      item.classList.toggle('active', i === bestIdx);
    });

    schedDraw();
  }

  // Initial render after layout settles
  setTimeout(function () {
    updateActiveMemory();
    drawConstellation();
  }, 200);

  window.addEventListener('scroll',  updateActiveMemory, { passive: true });
  window.addEventListener('resize',  function () {
    drawConstellation();
    updateActiveMemory();
  }, { passive: true });

  // Photos are not clickable — no lightbox

}());

// ----------------------------------------------------------------
// 5. FLOWER MEADOW
// ----------------------------------------------------------------
(function () {
  const meadow  = document.getElementById('meadow');
  if (!meadow)  return;
  const reduce  = window.matchMedia &&
                  window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  const palette = [
    { petal: '#f6a9bd', center: '#ffd07a' },
    { petal: '#f28b86', center: '#ffd98a' },
    { petal: '#e98ab4', center: '#ffcf7a' },
    { petal: '#ffdccb', center: '#f4ad62' },
    { petal: '#f4969f', center: '#ffd584' },
  ];
  const STEM = '#79805c';
  const flowers = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function blossomSVG(cx, cy, color, center, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i;
      s += `<ellipse cx="${cx}" cy="${cy - 15}" rx="8" ry="16" fill="${color}" opacity="0.94" transform="rotate(${a.toFixed(1)} ${cx} ${cy})"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="7" fill="${center}"/>`;
    return s;
  }

  function makeFlower(o) {
    const { w, h } = o;
    const cx = w / 2;
    const by = 22;
    const stem   = `<path d="M${cx} ${h} Q${cx + o.bend} ${h * 0.5} ${cx} ${by}" stroke="${STEM}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    const leafA  = `<ellipse cx="${cx - 8}" cy="${h * 0.58}" rx="9" ry="4.2" fill="${STEM}" transform="rotate(-32 ${cx - 8} ${h * 0.58})"/>`;
    const leafB  = `<ellipse cx="${cx + 8}" cy="${h * 0.72}" rx="9" ry="4.2" fill="${STEM}" transform="rotate(32 ${cx + 8} ${h * 0.72})"/>`;
    const inner  = `<svg class="flower-sway" style="--amp:${o.amp}deg;--dur:${o.dur}s;--delay:${o.delay}s" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${stem}${leafA}${leafB}<g class="blossom">${blossomSVG(cx, by, o.colors.petal, o.colors.center, o.petals)}</g></svg>`;
    const el     = document.createElement('div');
    el.className = 'flower';
    el.style.left           = o.left + '%';
    el.style.width          = w + 'px';
    el.style.height         = h + 'px';
    el.style.marginLeft     = (-w / 2) + 'px';
    el.style.zIndex         = String(60 - Math.round(h));
    el.style.transitionDelay = o.bloomDelay.toFixed(2) + 's';
    el.innerHTML            = `<div class="flower-wind">${inner}</div>`;
    el._color = o.colors.petal;
    meadow.appendChild(el);
    flowers.push(el);
    return el;
  }

  function makeBlade(o) {
    const el = document.createElement('div');
    el.className  = 'blade';
    el.style.left = o.left + '%';
    el.style.marginLeft     = '-7px';
    el.style.transitionDelay = o.bloomDelay.toFixed(2) + 's';
    el.innerHTML  = `<svg style="--amp:${o.amp}deg;--dur:${o.dur}s;--delay:${o.delay}s" width="14" height="${o.h}" viewBox="0 0 14 ${o.h}"><path d="M7 ${o.h} Q${7 + o.bend} ${o.h * 0.4} 7 0" stroke="#717a52" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`;
    meadow.appendChild(el);
  }

  // Grasses
  const count = window.innerWidth < 600 ? 13 : 18;
  for (let g = 0; g < count + 6; g++) {
    makeBlade({ left: rnd(1,99), h: rnd(60,130), bend: rnd(-7,7), amp: rnd(2.5,5), dur: rnd(3.5,5.5), delay: rnd(0,3), bloomDelay: rnd(0,.5) });
  }

  // Flowers
  for (let i = 0; i < count; i++) {
    const slot = (i + 0.5) / count * 100 + rnd(-3, 3);
    makeFlower({
      left:      Math.max(8, Math.min(92, slot)),
      w:         Math.round(rnd(64, 76)),
      h:         Math.round(rnd(120, 210)),
      bend:      rnd(-5, 5),
      petals:    Math.random() < 0.5 ? 6 : 7,
      colors:    palette[i % palette.length],
      amp:       rnd(1.6, 3.4),
      dur:       rnd(4, 6.5),
      delay:     rnd(0, 3.5),
      bloomDelay: i * 0.05,
    });
  }

  // Bloom on scroll into view
  const io = new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      if (en.isIntersecting) { meadow.classList.add('bloomed'); io.disconnect(); }
    });
  }, { threshold: 0.12 });
  io.observe(meadow);

  if (reduce) { meadow.classList.add('bloomed'); return; }

  // Wind from pointer
  let centers = [], pointerX = null, windRaf = 0;
  function measureCenters() {
    centers = flowers.map(f => {
      const r = f.getBoundingClientRect();
      return r.left + r.width / 2;
    });
  }
  function applyWind() {
    windRaf = 0;
    for (let i = 0; i < flowers.length; i++) {
      const wind = flowers[i].firstChild;
      if (pointerX == null) { wind.style.setProperty('--wind', '0deg'); continue; }
      const dx = centers[i] - pointerX;
      const infl = Math.max(0, 1 - Math.abs(dx) / 240);
      const lean = infl * infl * 15 * (dx < 0 ? -1 : 1);
      wind.style.setProperty('--wind', lean.toFixed(1) + 'deg');
    }
  }
  function schedWind() { if (!windRaf) windRaf = requestAnimationFrame(applyWind); }
  window.addEventListener('pointermove', e => { pointerX = e.clientX; schedWind(); }, { passive: true });
  window.addEventListener('pointerleave', ()  => { pointerX = null; schedWind(); });
  window.addEventListener('blur',          ()  => { pointerX = null; schedWind(); });
  window.addEventListener('resize',  measureCenters, { passive: true });
  window.addEventListener('scroll',  measureCenters, { passive: true });
  setTimeout(measureCenters, 900);

  // Petal burst
  function spawnPetal(x, y, color, gentle) {
    const p = document.createElement('div');
    p.className = 'petal';
    const sz = gentle ? rnd(6, 9) : rnd(7, 11);
    p.style.width      = sz + 'px';
    p.style.height     = sz + 'px';
    p.style.background = color;
    p.style.left       = x + 'px';
    p.style.top        = y + 'px';
    const dx  = rnd(-60, 60);
    const dy  = gentle ? rnd(-200, -120) : rnd(-170, -90);
    const dr  = rnd(180, 420) * (Math.random() < .5 ? -1 : 1);
    const dur = gentle ? rnd(4.5, 7) : rnd(2.4, 3.6);
    p.style.setProperty('--dx', dx.toFixed(0) + 'px');
    p.style.setProperty('--dy', dy.toFixed(0) + 'px');
    p.style.setProperty('--dr', dr.toFixed(0) + 'deg');
    p.style.animation = `drift ${dur.toFixed(1)}s ease-out forwards`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000 + 120);
  }

  // Tap → petal burst
  flowers.forEach(f => {
    f.addEventListener('click', function () {
      const r = f.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top  + r.height * 0.14;
      const n = 5 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) spawnPetal(x + rnd(-10, 10), y + rnd(-8, 8), f._color, false);
    });
  });

  // Occasional ambient petal
  (function loop() {
    if (document.hidden || !meadow.classList.contains('bloomed')) return setTimeout(loop, 2500);
    const f = flowers[Math.floor(Math.random() * flowers.length)];
    const r = f.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      spawnPetal(r.left + r.width / 2 + rnd(-6, 6), r.top + r.height * 0.14, f._color, true);
    }
    setTimeout(loop, rnd(2600, 4800));
  }());
}());
