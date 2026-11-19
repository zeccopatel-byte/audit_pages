(function () {
  const lerp = (a, b, k) => a + (b - a) * k;
  const mix = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
  const SIG = [255, 75, 31], ION = [31, 221, 255], WHT = [245, 243, 240], SLT = [143, 147, 143];
  const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;
  let grain = null;
  const getGrain = () => { if (grain) return grain; grain = document.createElement('canvas'); grain.width = grain.height = 160;
    const g = grain.getContext('2d'), d = g.createImageData(160, 160);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); return grain; };

  const COLS = 12, ROWS = 7, HUMAN = 5 * COLS + 7;
  const PAL = [SIG, [255, 150, 120], WHT, [140, 215, 240], ION, [150, 140, 200], SIG];
  const pal = g => { const f = g * (PAL.length - 1), i = Math.floor(f); return mix(PAL[i], PAL[i + 1], f - i); };
  const seed = Array.from({ length: COLS * ROWS }, (_, i) => Math.sin(i * 91.7) * .5 + .5);
  function drawRatio(s, T) {
    const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
    const x0 = 18, y0 = 44, gw = w - 36, gh = h * .59 - 14 - y0, cw = gw / COLS, ch = gh / ROWS;
    const ax = lerp(.5 + .35 * Math.sin(T * .4), s.px, s.hv), ay = lerp(.3 + .2 * Math.cos(T * .53), s.py, s.hv);
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c; if (i === COLS * ROWS - 1) continue;
      const x = x0 + c * cw, y = y0 + r * ch, cx = (x + cw / 2) / w, cy = (y + ch / 2) / h;
      if (i === HUMAN) { const p = .5 + .5 * Math.sin(T * 2.2);
        ctx.strokeStyle = rgba(WHT, .9); ctx.lineWidth = 1; ctx.strokeRect(x + 2.5, y + 2.5, cw - 5, ch - 5);
        ctx.fillStyle = rgba(WHT, .55 + .4 * p); ctx.fillRect(x + cw * .32, y + ch * .28, cw * .36, ch * .44); continue; }
      const d = Math.hypot((cx - ax) * w / h, cy - ay);
      let v = .5 + .5 * Math.sin(c * .7 + r * .45 + T * 1.1 + seed[i] * 6) * Math.cos(c * .23 - T * .6);
      v = Math.min(1, v * .75 + Math.exp(-d * d / .02) * .9);
      const flick = seed[i] > .92 ? (Math.sin(T * 9 + i) > .6 ? 1 : 0) : 0;
      const col = pal(((c / COLS) * .55 + (r / ROWS) * .45 + T * .06 + Math.sin(c * .4 + T * .5) * .06 + 10) % 1);
      if (v > .55 || flick) { ctx.fillStyle = rgba(mix(col, SLT, .15 * (1 - v)), .45 + .55 * v); ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); }
      else if (v > .18) { const bw = Math.max(1.5, cw * .14); ctx.fillStyle = rgba(WHT, .25 + v); ctx.fillRect(x + 1 + (cw - bw) * seed[i] * .9, y + 1, bw, ch - 2); }
      else { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); }
    }
  }
  function drawGlow(s, T) {
    const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#F5F3F0'; ctx.fillRect(0, 0, w, h);
    const br = Math.sin(T * .8) * .5 + .5;
    const cx = w * (.5 + (s.px - .5) * .22 * s.hv), cy = h * (1.16 - .03 * br - (.5 - s.py) * .05 * s.hv), R = Math.max(w, h * .66) * (.98 + .04 * br);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    g.addColorStop(0, 'rgba(10,120,220,1)'); g.addColorStop(.42, 'rgba(31,170,255,1)'); g.addColorStop(.6, 'rgba(31,221,255,1)');
    g.addColorStop(.7, 'rgba(255,140,110,1)'); g.addColorStop(.77, 'rgba(255,75,31,.95)'); g.addColorStop(.86, 'rgba(255,120,80,.35)'); g.addColorStop(1, 'rgba(245,243,240,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .55;
    ctx.fillStyle = ctx.createPattern(getGrain(), 'repeat'); ctx.translate((T * 7) % 160, 0); ctx.fillRect(-160, 0, w + 320, h); ctx.restore();
  }
  const N = 10, SAFE = new Set([23, 58, 86]);
  function drawGrid(s, T) {
    const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
    const x0 = 26, y0 = 50, gw = w - 52, gh = h * .59 - 22 - y0, sx = gw / (N - 1), sy = gh / (N - 1), cell = Math.min(sx, sy);
    const ax = lerp(.5 + .32 * Math.sin(T * .37), s.px, s.hv), ay = lerp(.32 + .16 * Math.sin(T * .51 + 1), s.py, s.hv);
    ctx.lineWidth = 1;
    for (let i = 0; i < N; i++) { ctx.strokeStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath(); ctx.moveTo(x0 - sx * .6, y0 + i * sy); ctx.lineTo(x0 + gw + sx * .6, y0 + i * sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0 + i * sx, y0 - sy * .6); ctx.lineTo(x0 + i * sx, y0 + gh + sy * .6); ctx.stroke(); }
    const R2 = Math.pow(cell * 2.4, 2);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const i = r * N + c, x = x0 + c * sx, y = y0 + r * sy, safe = SAFE.has(i), col = safe ? ION : SIG;
      const k = Math.exp(-(Math.pow(x - ax * w, 2) + Math.pow(y - ay * h, 2)) / R2), pulse = .5 + .5 * Math.sin(T * 2 + i * .7);
      if (k > .12) { const rad = cell * .44 * Math.min(1, k * 1.3);
        ctx.fillStyle = '#0B0B0C'; ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.fill();
        ctx.strokeStyle = rgba(col, .25 + .6 * k); ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.stroke(); }
      const g = ctx.createRadialGradient(x, y, 0, x, y, 3 + 9 * k); g.addColorStop(0, rgba(col, .9)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 3 + 9 * k, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgba(k > .6 ? WHT : col, .55 + .45 * Math.max(k, safe ? pulse : 0)); ctx.beginPath(); ctx.arc(x, y, 1.6 + 1.2 * k, 0, 6.283); ctx.fill();
      if (k > .55) { const a = 2 + 3 * k; ctx.strokeStyle = rgba(WHT, (k - .55) * 1.6); ctx.beginPath(); ctx.moveTo(x - a - 5, y); ctx.lineTo(x - 5, y); ctx.moveTo(x + 5, y); ctx.lineTo(x + a + 5, y); ctx.stroke(); }
    }
  }
  function dotMatrix(s, T, cols, rows, total, hot, safe) {
    const { ctx, w, h } = s; ctx.clearRect(0, 0, w, h);
    const x0 = 24, x1 = w - 24, y1 = h - 52, y0 = Math.max(h * .56, y1 - (x1 - x0) * rows / cols);
    const gx = (x1 - x0) / (cols - 1), gy = (y1 - y0) / (rows - 1), r = Math.max(1.2, Math.min(gx, gy) * .13);
    const fill = s.k == null ? 1 : s.k, lit = Math.round(total * fill);
    const hx = s.px * w, hy = s.py * h;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const n = j * cols + i; if (n >= total + (safe ? safe.size : 0) - (safe ? 0 : 0) && n >= cols * rows) continue;
      const x = x0 + i * gx, y = y0 + j * gy, isSafe = safe && safe.has(n), isHot = hot === n;
      const on = n < lit || isSafe || isHot;
      const near = s.hv * Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / 1800);
      const wave = .5 + .5 * Math.sin(T * 1.6 - i * .35 - j * .2);
      let col = isSafe || isHot ? (isHot ? WHT : ION) : SIG, a;
      if (n >= total && !isSafe && !isHot) { col = WHT; a = .06; }
      else if (!on) { a = .08; }
      else a = isSafe || isHot ? .6 + .3 * (.5 + .5 * Math.sin(T * 2.4 + n)) : .22 + .18 * wave;
      a = Math.min(1, a + near * .45);
      ctx.fillStyle = rgba(col, a); ctx.beginPath(); ctx.arc(x, y, r * (1 + near * .5), 0, 6.283); ctx.fill();
    }
  }
  const S97 = new Set([23, 58, 86]);
  const drawD82 = (s, T) => dotMatrix(s, T, 12, 7, 83, 82, null);
  const drawD97 = (s, T) => dotMatrix(s, T, 10, 10, 100, -1, S97);
  const S92 = new Set([7, 23, 34, 46, 58, 71, 86, 93]);
  const drawD92 = (s, T) => dotMatrix(s, T, 10, 10, 100, -1, S92);
  const DRAW = { ratio: drawRatio, glow: drawGlow, grid: drawGrid, none: () => {}, dots82: drawD82, dots97: drawD97, dots92: drawD92 };

  window.AvStatCards = { mount(root) {
    const cards = [...root.querySelectorAll('[data-sk]')], ros = [];
    const st = cards.map(el => {
      const cv = el.querySelector('canvas'), ctx = cv.getContext('2d'), shine = el.querySelector('[data-shine]');
      const s = { el, cv, ctx, shine, kind: el.dataset.sk, w: 0, h: 0, px: .5, py: .5, hover: 0, hv: 0, rx: 0, ry: 0 };
      const size = () => { const r = el.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); s.w = r.width; s.h = r.height; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
      const ro = new ResizeObserver(size); ro.observe(el); ros.push(ro); size();
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); s.px = (e.clientX - r.left) / r.width; s.py = (e.clientY - r.top) / r.height; s.hover = 1;
        if (shine) { shine.style.opacity = '1'; shine.style.background = `radial-gradient(60% 50% at ${s.px * 100}% ${s.py * 100}%, rgba(255,255,255,.10), transparent 70%)`; } });
      el.addEventListener('pointerleave', () => { s.hover = 0; if (shine) shine.style.opacity = '0'; });
      return s;
    });
    const nums = [...root.querySelectorAll('[data-to]')]; let cs = null, vis = false;
    const setNums = k => nums.forEach(n => { const v = +n.dataset.to * (1 - Math.pow(1 - k, 3)); n.textContent = n.dataset.dec ? v.toFixed(+n.dataset.dec) : Math.round(v); });
    setNums(0);
    const io = new IntersectionObserver(es => { vis = es.some(e => e.isIntersecting); if (vis && cs === null && !root._counted) { root._counted = 1; cs = performance.now(); } }, { threshold: .2 });
    io.observe(root);
    let raf = 0, dead = false; const t0 = performance.now();
    const loop = now => { if (dead) return; raf = requestAnimationFrame(loop); if (!vis) return; const T = (now - t0) / 1000; const kc = cs !== null ? Math.min(1, (now - cs) / 1600) : (root._counted ? 1 : 0);
      st.forEach((s, idx) => { s.hv = lerp(s.hv, s.hover, .08);
        const tx = lerp(Math.sin(T * .6 + idx * 1.7) * 1.2, (.5 - s.py) * 12, s.hv), ty = lerp(Math.cos(T * .5 + idx) * 1.2, (s.px - .5) * 14, s.hv);
        s.rx = lerp(s.rx, tx, .1); s.ry = lerp(s.ry, ty, .1);
        s.el.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) translateZ(${(s.hv * 18).toFixed(1)}px)`;
        s.k = kc; DRAW[s.kind](s, T + idx * 3); });
      if (cs !== null) { const k = Math.min(1, (now - cs) / 1600); setNums(k); if (k >= 1) cs = null; } };
    raf = requestAnimationFrame(loop);
    return () => { dead = true; cancelAnimationFrame(raf); io.disconnect(); ros.forEach(r => r.disconnect()); };
  } };
})();
