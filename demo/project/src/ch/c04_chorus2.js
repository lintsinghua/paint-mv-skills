// c04_chorus2: Chorus 2, the light bursts out over the city (54.641–75.974). Storyboard § 4.
// Palette: the studio's neon cyan and magenta, then the violet-rose of first light; the recorded light is warm gold.
//   1 · 54.641 gulp    the window's first ray of dawn swells into the chorus beam; the room's paper balls burst and their
//                      字灵 ride it into the mic, which gulps it down; the VU meters shoot through the ceiling, the neon strobes
//   2 · 57.37  tumble  three pratfalls on three beats (cable, paper ball, chair), each landing on a freshly painted
//                      starting line; the drum kids hop in as boosters and rocket 小夜 out of the window
//   3 · 60.27  flight  over the sleeping city trailing the light, wide awake; a dive over the snoring roofs and a roll
//   4 · 62.5   ear     he sings at the tallest building's ear: the ribbon spirals up the tower and goes in; the city wakes
//   5 · 65.44  gather  the ribbon climbs the sky and winds into a ball on the horizon; row after row bounces awake
//   6 · 67.974 corner  灯灯 dances at the street corner, lights flashing on the beat; the noise monsters by the door sway
//   7 · 70.641 party   小夜 drops in; everyone dances, the noise monsters play as a band, the ball's gold fills the frame
// Hand-offs: opens on the studio window's first ray (ch 3 out); ends on flash(1, GOLD = '#FFE6A0') from 75.93 (ch 5 in).
// Perf: the shared sets cost ~0.25 s a frame; crowds of 字灵 use the wash-only miniZ; watercolour fills stay low-poly.
(() => {
  const B = n => OFF + n * BEAT;                       // song time of beat n (B(81) = 54.641, B(113) = 75.974)
  const GOLD = '#FFE6A0', AMBER = '#FFD36B', HONEY = '#F6B94A', PEACH = '#FF9A4A', LIGHT = '#FFF8E6';
  const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const lastHit = (t, hits) => { let h = -99; for (const b of hits) if (b <= t) h = b; return h; };
  const bez = (a, m, b, k) => [(1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * m[0] + k * k * b[0], (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * m[1] + k * k * b[1]];
  const rotV = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  // ---------- paths: Catmull-Rom through control points, arc-length parametrised ----------
  function spline(P, per = 8) {
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const s = k / per, s2 = s * s, s3 = s2 * s, f = (a, b, c, d) => .5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(P[P.length - 1]);
    return out;
  }
  function mkPath(pts, z) {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, len: cum[cum.length - 1], z };
  }
  // point and heading at arc fraction u
  function at(P, u) {
    const L = clamp(u) * P.len; let i = 1; while (i < P.cum.length - 1 && P.cum[i] < L) i++;
    const f = (L - P.cum[i - 1]) / Math.max(1e-6, P.cum[i] - P.cum[i - 1]), a = P.pts[i - 1], b = P.pts[i];
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  // the stretch of P between arc fractions u0..u1, split into runs by the sign of P.z (in front of / behind something);
  // each run keeps the arc fractions a..b it spans
  function runs(P, u0, u1) {
    const L0 = u0 * P.len, L1 = u1 * P.len, out = []; let cur = null;
    const tag = i => !P.z || P.z[clamp(i, 0, P.z.length - 1)] >= 0;
    const add = (p, f, u) => {
      if (!cur || cur.front !== f) { const last = cur && cur.pts[cur.pts.length - 1]; cur = { front: f, pts: last ? [last] : [], a: cur ? cur.b : u, b: u }; out.push(cur); }
      cur.pts.push(p); cur.b = u;
    };
    let i = 0; while (i < P.pts.length - 1 && P.cum[i] < L0) i++;
    const h0 = at(P, u0); add([h0[0], h0[1]], tag(i), u0);
    for (; i < P.pts.length && P.cum[i] < L1; i++) add(P.pts[i], tag(i), P.cum[i] / P.len);
    const h1 = at(P, u1); if (cur) { cur.pts.push([h1[0], h1[1]]); cur.b = u1; }
    return out.filter(r => r.pts.length > 1);
  }

  // ---------- the recorded light ----------
  // a ribbon of light along pts, width w0 at pts[0] → w1 at the end: soft glow, gold body, bright core
  function ribbon(pts, w0, w1, glow = 1, body = GOLD) {
    if (pts.length < 2) return;
    const lo = pts.filter((p, i) => i % 3 === 0 || i === pts.length - 1);
    if (glow > .02 && lo.length > 1) paint(tubePts(lo, w0 * 2.3, w1 * 2.3), { fill: AMBER, fillOp: 75 * glow, bleed: .25, tex: .2, border: .1, ink: null });
    paint(tubePts(pts, w0, w1), { wash: body, washOp: 235, ink: HONEY, sw: .9 });
    paint(tubePts(pts, w0 * .36, w1 * .36), { wash: LIGHT, washOp: 235, ink: null });
  }
  // a cheap wash-only 字灵 (same silhouette as ziling()) for the crowds riding the light; (x, y) = bottom of the flame
  function miniZ(x, y, u, o = {}) {
    if (u < 1.5) return;
    const seed = o.seed || 0, tip = [.35 * u * Math.sin(T * 6 + seed * 2.1), -3.3 * u], sw = clamp(u / 14, .3, .9);
    push(); translate(x, y); if (o.rot) rotate(o.rot);
    if (o.glow) paint(ellPts(0, -1.4 * u, 2.4 * u, 2.4 * u, 10), { wash: AMBER, washOp: 70 * o.glow, ink: null });
    const b = []; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI; b.push([Math.cos(a) * 1.15 * u, -1.15 * u + Math.sin(a) * 1.15 * u]); }
    b.push([-1.05 * u, -1.9 * u], [-.55 * u, -2.7 * u], tip, [.6 * u, -2.6 * u], [1.1 * u, -1.8 * u]);
    paint(b, { wash: ZL.col, ink: u > 5 ? PAL.ink : null, sw, curv: .5 });
    paint(ellPts(0, -.95 * u, .62 * u, .48 * u, 8), { wash: ZL.lt, ink: null });
    if (u > 6) for (const s of [-1, 1]) inkLine([[s * .4 * u - .2 * u, -1.18 * u], [s * .4 * u, -1.42 * u], [s * .4 * u + .2 * u, -1.18 * u]], sw, PAL.ink, 'ink', .3);
    else for (const s of [-1, 1]) paint(ellPts(s * .4 * u, -1.28 * u, .14 * u + .3, .18 * u + .3, 6), { wash: PAL.ink, ink: null });
    pop();
  }
  // the gathered light: tomorrow's sun, in the same layers as the sun of streetBack(); k = extra brightness
  function lightBall(x, y, r, k, t) {
    paint(ellPts(x, y, r * 3.5, r * 3.2, 20), { fill: PEACH, fillOp: 80 + 70 * k, bleed: .3, tex: .2, border: .1, ink: null });
    paint(ellPts(x, y, r * 1.8, r * 1.8, 18), { wash: GOLD, washOp: 110 + 90 * k, fill: '#FFC24A', fillOp: 130, bleed: .25, ink: null });
    paint(ellPts(x, y, r, r, 22), { wash: '#FFD65A', fill: '#FF9A3A', fillOp: 80, tex: .4, border: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(x - r * .3, y - r * .3, r * .35, r * .3, 12), { wash: '#FFF6D8', washOp: 200, ink: null });
    if (r > 34) for (let i = 0; i < 3; i++) {                                        // the 字灵 inside, faintly smiling
      const fx = x + [-.42, .38, 0][i] * r, fy = y + [.12, -.05, .45][i] * r, fr = r * .09;
      for (const s of [-1, 1]) paint(ellPts(fx + s * fr * 1.4, fy, fr * .45, fr * .55, 6), { wash: '#E08A3A', ink: null });
      inkLine([[fx - fr, fy + fr * .9], [fx, fy + fr * 1.5], [fx + fr, fy + fr * .9]], .6, '#E08A3A', 'inkfine', .5);
    }
  }

  // ---------- small painted effects ----------
  function puffs(x, y, age, s = 1, n = 5, col = '#E8DCCB', life = .7) {
    if (age < 0 || age > life) return;
    const k = age / life;
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i + .5) / n * Math.PI, d = (30 + 110 * easeOut(k)) * s, r = (18 + 22 * hash(i * 3.1 + x * .01)) * s * (.7 + .8 * k);
      paint(ellPts(x + Math.cos(a) * d * 1.5, y + Math.sin(a) * d * .35 - 8 * s, r, r * .72, 10, r * .12), { wash: col, washOp: 210 * (1 - k), ink: null });
    }
  }
  const sparkle = (x, y, r, col = LIGHT) => { if (r > .8) paint(starPts(x, y, r, .32, 4), { wash: col, ink: null }); };
  const ringOut = (x, y, r, sq, sw, col) => { if (sw > .15) paint(ellPts(x, y, r, r * sq, 22), { ink: col, sw }); };
  // the sky of first light, in screen space: violet at the top, rose at the horizon, a warm glow where the sun will rise
  function dawnSky(t, dawn, glowX = 1250) {
    paint(rectPts(-60, -60, W + 120, H + 120), { wash: nightCol('skyBot', dawn), ink: null });
    paint(rectPts(-60, -60, W + 120, 640, 6), { fill: nightCol('skyTop', dawn), fillOp: 165, bleed: .12, tex: .25, border: .3, ink: null });
    paint(ellPts(glowX, 930, 1250, 400, 18), { fill: '#FFB08A', fillOp: 45 + 60 * dawn, bleed: .3, tex: .2, border: .1, ink: null });
    for (let i = 0; i < 22; i++) {
      const k = (.6 + .4 * Math.sin(t * 3 + i * 1.7)) * (1 - dawn * 1.5);
      if (k > .05) paint(starPts(hash(i + 3) * W, hash(i + 40) * 380, 4 + 4 * hash(i + 9), .4, 4), { wash: PAL.cream, washOp: 255 * k, ink: null });
    }
  }
  // a row of pale distant buildings, flat silhouettes (cheap), a few lit windows
  function farRow(x0, x1, y0, s, dawn, seed, lit = 0) {
    const col = mixCol(nightCol('far', dawn), nightCol('skyBot', dawn), .3);
    for (let x = x0, i = 0; x < x1; i++) {
      const w = (70 + 90 * hash(seed * 7 + i * 1.3)) * s, h = (150 + 300 * hash(seed * 3 + i * 2.1)) * s;
      paint(rectPts(x, y0 - h, w + 2, h + 500, 1), { wash: col, ink: null });
      if (lit > 0 && hash(seed + i * 4.7) < lit) paint(rectPts(x + w * .4, y0 - h + 22 * s, 12 * s, 15 * s), { wash: NIGHT.win, washOp: 200, ink: null });
      x += w;
    }
  }
  // a skyline() row that stretches and settles on each hit after it has woken (anchored on its ground line)
  function bouncyRow(t, o, hits) {
    const a = t - lastHit(t, hits), b = a < 0 || a > .76 ? 0 : a < .06 ? a / .06 : Math.exp(-(a - .06) * 6) * Math.cos((a - .06) * 20);
    if (Math.abs(b) < .004) { skyline(t, o); return; }
    push(); translate(W / 2, o.y); scale(1 - .04 * b, 1 + .17 * b); translate(-W / 2, -o.y); skyline(t, o); pop();
  }
  // the dawn sky painted in world space (for shots whose camera tilts), horizon at yH
  function skyWorld(t, dawn, x0, x1, y0, yH, glowX) {
    paint(rectPts(x0, y0, x1 - x0, yH - y0 + 600), { wash: nightCol('skyBot', dawn), ink: null });
    paint(rectPts(x0, y0, x1 - x0, yH - 520 - y0, 6), { fill: nightCol('skyTop', dawn), fillOp: 175, bleed: .12, tex: .25, border: .3, ink: null });
    paint(rectPts(x0, yH - 760, x1 - x0, 420, 6), { fill: mixCol(nightCol('skyTop', dawn), nightCol('skyBot', dawn), .5), fillOp: 90, bleed: .12, tex: .25, border: .3, ink: null });
    paint(ellPts(glowX, yH + 120, 1400, 460, 18), { fill: '#FFB08A', fillOp: 60 + 60 * dawn, bleed: .3, tex: .2, border: .1, ink: null });
    for (let i = 0; i < 26; i++) {
      const k = (.6 + .4 * Math.sin(t * 3 + i * 1.7)) * (1 - dawn * 1.4);
      if (k > .05) paint(starPts(lerp(x0, x1, hash(i + 3)), lerp(y0, yH - 700, hash(i + 40)), 5 + 5 * hash(i + 9), .4, 4), { wash: PAL.cream, washOp: 255 * k, ink: null });
    }
  }

  // ---------- studio props ----------
  // a crumpled sheet on (x, y) with an unheard word asleep inside; open 0..1 bursts it into four petals of paper
  function paperBall(x, y, r, open = 0, seed = 0) {
    if (open <= 0) {
      paint(ellPts(x, y - r * .82, r, r * .85, 9, r * .1), { wash: PAL.cream, fill: '#E6D3AE', fillOp: 70, tex: .5, ink: PAL.ink, sw: .75 });
      inkLine([[x - r * .55, y - r * 1.05], [x - r * .1, y - r * .72], [x + r * .35, y - r * 1.1]], .5, '#B59C74', 'inkfine', .2);
      inkLine([[x - r * .3, y - r * .35], [x + r * .45, y - r * .62]], .5, '#B59C74', 'inkfine', .2);
      return;
    }
    const k = easeOut(clamp(open * 1.8));
    for (let p = 0; p < 4; p++) {
      const a = -Math.PI / 2 + (p - 1.5) * .95, rr = r * (.85 + .2 * hash(seed * 4 + p));
      push(); translate(x + Math.cos(a) * r * .55 * k, y - r * .4 * (1 - k) - 2); rotate((a + Math.PI / 2) * (.4 + .6 * k));
      paint([[-rr * .55, 0], [rr * .55, 0], [rr * .35, -rr * (1 - .45 * k)], [-rr * .4, -rr * (.9 - .4 * k)]], { wash: PAL.cream, ink: PAL.ink, sw: .6 });
      pop();
    }
    if (open < .5) paint(starPts(x, y - r, r * (1.2 + 3 * open), .3, 6, seed), { wash: LIGHT, washOp: 255 * (1 - open / .5), ink: null });
  }
  // a starting line painted across the floor (back y0 → front y1), drawn on with k, and its little chequered flag (fk)
  function startLine(x, y0, y1, k, fk, t) {
    if (k <= 0) return;
    const e = easeOut(k), xf = x + (x - 960) * .16, xe = lerp(x, xf, e), ye = lerp(y0, y1, e);
    paint([[x - 9, y0], [x + 9, y0], [xe + 15, ye], [xe - 15, ye]], { wash: PAL.cream, washOp: 240, ink: null });
    if (k < 1) sparkle(xe, ye, 16, LIGHT);
    if (fk <= 0) return;
    const p = backOut(fk), fx = x + 40, top = y0 - 150 * p, fw = 66 * p, fh = 42 * p, wv = Math.sin(T * 11 + x) * 5 * p;
    inkLine([[fx, y0 + 2], [fx, top]], 2, PAL.ink, 'ink', 0);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
      const x0 = fx + i * fw / 3, y0c = top + j * fh / 2 + wv * i / 3;
      paint([[x0, y0c], [x0 + fw / 3, y0c + wv / 3], [x0 + fw / 3, y0c + fh / 2 + wv / 3], [x0, y0c + fh / 2]], { wash: (i + j) % 2 ? PAL.ink : PAL.cream, ink: null });
    }
    paint([[fx, top], [fx + fw, top + wv], [fx + fw, top + fh + wv], [fx, top + fh]], { ink: PAL.ink, sw: .8 });
  }
  // the desk chair (office chair on castors), seen from the side with its backrest on the left; (x, y) = floor under the
  // post. tip 0..~1.45 topples it backwards about its left castor.
  function deskChair(x, y, s, tip = 0) {
    push(); translate(x - 58 * s, y); rotate(-tip); translate(58 * s, 0); scale(s);
    for (const d of [-1, 0, 1]) { inkLine([[0, -22], [d * 58, -8]], 2.6, '#2E2A40', 'ink', 0); paint(ellPts(d * 58, -6, 7, 7, 8), { wash: '#1E1830', ink: null }); }
    paint(rectPts(-6, -98, 12, 78), { wash: '#8E8AA8', ink: PAL.ink, sw: .7 });
    paint(rrPts(-68, -124, 136, 28, 12), { wash: '#7A3E78', fill: '#4A1F4E', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    paint(rectPts(-64, -214, 14, 96), { wash: '#4A4460', ink: PAL.ink, sw: .8 });
    paint(rrPts(-88, -300, 42, 118, 16), { wash: '#7A3E78', fill: '#4A1F4E', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    pop();
  }
  // the studio window's right casement swinging open outwards (k 0..1), hinged on the frame's right edge
  function openPane(win, k) {
    if (k <= 0) return;
    const [x, y, w, h] = win, hx = x + w, px = lerp(x + w / 2, hx, .8 * easeOut(k)), lift = 22 * k;
    paint([[px, y + lift], [hx, y], [hx, y + h], [px, y + h - lift]], { wash: '#CFE6F2', washOp: 90, ink: '#4A3E6E', sw: 3 });
    inkLine([[lerp(px, hx, .25), y + h * .3], [lerp(px, hx, .6), y + h * .14]], 1.4, LIGHT, 'inkfine', 0);
  }

  // ---------- the tallest building ----------
  // tower(t, x, y, s, o): the building with an ear. (x, y) = base centre; s = 1 → 380 wide, 1150 tall to the nightcap's tip.
  // Local v = height above the base: shaft v 0..760 (±165), face block v 720..960 (±190) with window-eyes at v 870 and a
  // mouth at v 790, the ear (a rolled-up awning) on the left at v 860, the nightcap on top. o: wake 0..1 (eyes open, windows
  // light top-down) · cap 0..1 (slides off) · ear 0..1 (glow + wiggle) · dawn. Returns { ear: [x, y], crown: [x, y] }.
  function tower(t, x, y, s, o = {}) {
    const wake = clamp(o.wake || 0), dawn = o.dawn ?? .5, sw = clamp(1.3 * s, .6, 1.6), earK = clamp(o.ear || 0);
    const X = v => x + v * s, Y = v => y - v * s, body = mixCol('#3E3776', '#7E6496', dawn * .5), dk = mixCol(body, '#140F2A', .35);
    const dim = mixCol(body, '#10142E', .5);
    paint(rectPts(X(-165), Y(760), 330 * s, 760 * s + 6, 2), { wash: body, fill: dk, fillOp: 60, tex: .5, border: .3, ink: PAL.ink, sw });
    for (let r = 0; r < 11; r++) for (let c = 0; c < 4; c++) {
      const lit = hash(r * 7.1 + c * 3.3) < .1 || r / 11 < wake * 1.3 - .25 * hash(r * 2.3 + c * 5.9);
      paint(rectPts(X(-128 + c * 70), Y(700 - r * 62), 44 * s, 30 * s), { wash: lit ? NIGHT.win : dim, washOp: lit ? 235 : 210, ink: null });
    }
    // the ear, behind the face block's edge
    const ex = X(-196), ey = Y(862), wig = .1 * earK * Math.sin(t * 34);
    push(); translate(ex, ey); rotate(wig); scale(s);
    if (earK > .02) paint(ellPts(-40, 0, 120, 130, 14), { fill: AMBER, fillOp: 150 * earK, bleed: .3, tex: .2, ink: null });
    const earPts = [[6, -66], [-30, -80], [-66, -56], [-82, -12], [-74, 34], [-48, 70], [-16, 80], [6, 60]];
    paint(earPts, { wash: earK > .3 ? mixCol('#E27A92', GOLD, earK - .3) : '#E27A92', fill: '#B84A6A', fillOp: 50, tex: .5, ink: PAL.ink, sw: sw / s, curv: .45 });
    for (const k of [-44, -14, 16]) inkLine([[-70 + Math.abs(k) * .15, k], [-10, k + 6]], 1, PAL.cream, 'inkfine', .3);
    inkLine([[-8, -42], [-44, -44], [-58, -10], [-44, 24], [-22, 28], [-20, 6], [-34, -4]], 1.6, '#7A2A48', 'ink', .6);
    pop();
    // face block
    const face = rrPts(X(-190), Y(960), 380 * s, 240 * s, 40 * s, 1.5);
    paint(face, { wash: mixCol(body, '#9E86B8', .12), fill: dk, fillOp: 50, tex: .5, border: .3, ink: PAL.ink, sw });
    const open = seg(wake, .3, .55);
    for (const d of [-1, 1]) {
      const cx = X(d * 82), cy = Y(870);
      if (open < .05) inkLine([[cx - 34 * s, cy - 4 * s], [cx, cy + 16 * s], [cx + 34 * s, cy - 4 * s]], sw * 1.5, NIGHT.win, 'ink', .4);
      else {
        paint(ellPts(cx, cy, 34 * s, 40 * s * open, 14), { wash: NIGHT.win, ink: PAL.ink, sw: sw * .8 });
        paint(ellPts(cx + 4 * s, cy + 6 * s * open, 15 * s, 18 * s * open, 10), { wash: PAL.ink, ink: null });
        paint(ellPts(cx + 10 * s, cy - 4 * s * open, 5 * s, 6 * s * open, 8), { wash: PAL.cream, ink: null });
      }
    }
    if (open < .5) { const sn = .5 + .5 * Math.sin(t * 2.4); paint(ellPts(X(0), Y(790), (14 + 8 * sn) * s, (16 + 9 * sn) * s, 12), { wash: '#10142E', ink: NIGHT.win, sw: sw * .6 }); }
    else {
      inkLine([[X(-44), Y(800)], [X(0), Y(772)], [X(44), Y(800)]], sw * 1.6, NIGHT.win, 'ink', .5);
      for (const d of [-1, 1]) paint(ellPts(X(d * 132), Y(812), 26 * s, 13 * s, 10), { fill: PAL.rose, fillOp: 170 * open, bleed: .2, ink: null });
    }
    if (open < .3) for (let k = 0; k < 2; k++) {
      const ph = frac(t * .6 + k * .5);
      letter('z', X(150) + ph * 60 * s, Y(980) - ph * 120 * s, (22 + 20 * ph) * s, PAL.cream, { alpha: Math.sin(ph * Math.PI) * (1 - open / .3), rot: -.2 });
    }
    // the nightcap: slides off to the right and tumbles away
    const c = clamp(o.cap || 0);
    if (c < 1) {
      push(); translate(X(-10) + 300 * s * c, Y(958) + 900 * s * c * c); rotate(-.14 + 2.2 * c); scale(s);
      paint([[-182, 0], [168, -8], [120, -140], [96, -196]], { wash: '#C94F8E', fill: '#8A2E62', fillOp: 60, tex: .5, ink: PAL.ink, sw: sw / s, curv: .3 });
      paint(ellPts(98, -204, 26, 26, 12), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
      paint(rrPts(-190, -18, 364, 34, 14), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
      pop();
    }
    return { ear: [X(-236), Y(862)], crown: [X(0), Y(960)] };
  }

  // =====================================================================================================================
  // 1 · 54.641–57.37 · "把这束光录进声音里面": the first ray swells into the beam; the mic gulps; the meters blow the roof
  // =====================================================================================================================
  const FY1 = 862, U1 = 33, XY1 = 540, MX1 = 780, MS1 = .66, CAP1 = [MX1, FY1 - 480 * MS1];   // mirrored mic: pop filter faces 小夜
  const BEAM = mkPath(spline([[1330, 285], [1190, 395], [1045, 488], [915, 538], [CAP1[0] + 26, CAP1[1]]], 8));
  const beamW = u => lerp(290, 62, Math.pow(u, .8));
  const T_SWELL = B(81), GULPS = [B(82.5), B(83.5), B(84)], VU_HITS = [B(83), B(84), B(84.5)];
  const SWALLOW = mkPath(spline([[MX1, CAP1[1] + 34], [MX1, FY1 - 44], [MX1 - 10, FY1 - 8], [lerp(MX1, 1560, .4), FY1 + 20], [lerp(MX1, 1560, .8), FY1 + 7], [1560, 650]], 6));
  const BALLS1 = [[330, 850, 22], [396, 876, 18], [668, 886, 20], [990, 874, 19], [1072, 852, 22], [168, 874, 20], [1172, 690, 16], [1752, 690, 18], [1808, 690, 15], [1850, 690, 17]];
  const Z1 = BALLS1.map(([x, y, r], i) => ({ x, y, r, i, pop: T_SWELL + .05 + .3 * hash(i * 1.3 + 2), leap: B(82) + .11 * i + .05 * hash(i * 4.1), ue: .1 + .5 * hash(i * 2.7 + 1), side: hash(i * 5.3) - .5, u: 12 + 4 * hash(i * 7.9) }));
  // where a popped 字灵 is: hopping above its ball, flying up to the beam, then riding it into the mic (null once swallowed)
  function z1At(z, t) {
    const a = t - z.pop; if (a < 0) return null;
    const hover = [z.x, z.y - z.r * 1.3 - 40 * backOut(clamp(a / .3)) - 10 * Math.abs(Math.sin(bpOf(t) * Math.PI))];
    if (t < z.leap) return { p: hover, k: 1, rot: .15 * Math.sin(t * 7 + z.i) };
    const f = (t - z.leap) / .42, e = at(BEAM, z.ue), n = [-Math.sin(e[2]), Math.cos(e[2])], w = beamW(z.ue) * .3 * z.side;
    const E = [e[0] + n[0] * w, e[1] + n[1] * w + 20];
    if (f < 1) return { p: bez(hover, [lerp(hover[0], E[0], .5), Math.min(hover[1], E[1]) - 170], E, easeIO(f)), k: 1, rot: .6 * Math.sin(f * Math.PI) * Math.sign(E[0] - hover[0]) };
    const uu = z.ue + (t - z.leap - .42) * .75; if (uu >= 1) return null;
    const q = at(BEAM, uu), nn = [-Math.sin(q[2]), Math.cos(q[2])], ww = beamW(uu) * .3 * z.side * (1 - uu);
    return { p: [q[0] + nn[0] * ww, q[1] + nn[1] * ww + 20 * (1 - uu)], k: 1 - seg(uu, .84, 1), rot: -.25 };
  }
  // the VU bars over the mixer: lit segments stacked above the meter, hotter the higher they go (only the visible ones)
  function vuColumn(x, y0, w, h, yTop = -30) {
    const n = Math.floor(h / 20);
    for (let r = 0; r < n && y0 - 20 * (r + 1) > yTop; r++) paint(rectPts(x, y0 - 20 * (r + 1), w, 16), { wash: r < 3 ? NEON.cyan : r < 6 ? PAL.ochre : NEON.magenta, ink: null });
    if (h > 12 && y0 - h - 12 > yTop) paint(rectPts(x - 2, y0 - h - 12, w + 4, 8), { wash: LIGHT, ink: PAL.ink, sw: .5 });
  }
  // the room is crammed with 字灵: after the ray hits, they pop up everywhere and bounce on the beat
  const CROWD1 = [[118, 902], [212, 896], [288, 906], [462, 900], [716, 904], [858, 898], [936, 906], [1122, 896], [1206, 690], [1308, 600], [1688, 690], [1788, 690], [250, 742], [430, 200], [1262, 584], [1694, 584], [606, 150], [952, 150]];
  function gulpShot(t, lt) {
    const swell = backOut(seg(t, T_SWELL, T_SWELL + .34)), wk = lerp(.3, 1, swell);
    const pull = easeOut(seg(t, T_SWELL + .03, T_SWELL + .66)), drift = ease(seg(t, B(82), 57.37));
    const g = GULPS.reduce((m, b) => t >= b ? Math.max(m, Math.exp(-(t - b) * 7)) : m, 0);
    const nV = VU_HITS.filter(h => t >= h).length, aV = t - lastHit(t, VU_HITS), roof = t >= VU_HITS[2];
    const boom = roof ? Math.exp(-(t - VU_HITS[2]) * 4) : 0;
    const [sx, sy] = shakeXY(t, 2 + 6 * g + 16 * boom);
    camBegin(lerp(1420, 935, pull) - 30 * drift + sx, lerp(372, 520, pull) - 14 * drift + sy, lerp(1.55, 1.03, pull) + .05 * drift + .02 * pulse(t, 7) * (t > B(82) - .05 ? 1 : 0));
    // neon: steady at the cut, then colours swap every beat and flicker on the eighths; strobes once the meters blow
    const bi = beatN(t), pair = [[NEON.cyan, NEON.magenta], [NEON.magenta, AMBER], [AMBER, NEON.cyan]][((bi % 3) + 3) % 3];
    const strobe = t < B(82) ? .85 : roof ? (hash(Math.floor(t * 12) * 3.1) > .4 ? 1.2 : .3) : .5 + .65 * pulse2(t, 6);
    const L = studioBack(t, { dawn: lerp(.42, .44, lt / 2.73), clock: lerp(5.45, 5.5, lt / 2.73), bin: 1, neon: strobe, neonA: t < B(82) ? NEON.cyan : pair[0], neonB: t < B(82) ? NEON.magenta : pair[1], level: t < VU_HITS[0] ? .4 + .5 * pulse(t, 4) : 1 });
    // the window's horizon is pale with morning (as ch 3 left it); the room warms up; the ray comes in through the left pane
    const [wx, wy, ww, wh] = L.window;
    paint(ellPts(wx + ww / 2, wy + wh - 50, ww * .56, wh * .36, 18), { fill: '#FFF1D6', fillOp: 150, bleed: .25, tex: .2, border: .2, ink: null });
    paint(ellPts(990, 520, 980, 470, 16), { fill: HONEY, fillOp: 38 * swell, bleed: .12, tex: .2, border: .1, ink: null });
    paint(ellPts(1318, 300, 70 + 40 * swell, 60 + 30 * swell, 12), { wash: LIGHT, washOp: 150 + 60 * swell, ink: null });
    // the beam: a soft shaft of first light at the cut, a solid river of gold a beat later (3x wider)
    const pts = []; for (let k = 0; k <= 22; k++) { const q = at(BEAM, k / 22); pts.push([q[0], q[1]]); }
    const lo = pts.filter((p, i) => i % 3 === 0 || i === 22);
    paint(tubePts(lo, 290 * wk * 1.25, 62 * wk * 1.6), { fill: HONEY, fillOp: 40 + 45 * swell, bleed: .12, tex: .2, border: .1, ink: null });
    const tube = tubePts(pts, 290 * wk, 62 * wk);
    paint(tube, { wash: mixCol('#FFE9B8', GOLD, swell), washOp: 150 + 70 * swell, ink: null });
    paint(tubePts(pts, 290 * wk * .38, 62 * wk * .45), { wash: LIGHT, washOp: 180 + 50 * swell, ink: null });
    if (swell > .2) { inkLine(tube.slice(0, 23), 1.1 * swell, HONEY, 'inkfine', .5); inkLine(tube.slice(23), 1.1 * swell, HONEY, 'inkfine', .5); }
    for (let j = 0; j < 12; j++) {                                              // motes and sparkles streaming down it
      const uu = frac(hash(j * 3.3) + (t - T_SWELL) * .55), q = at(BEAM, uu), n = (hash(j * 7.1) - .5) * beamW(uu) * wk * .8;
      sparkle(q[0] - Math.sin(q[2]) * n, q[1] + Math.cos(q[2]) * n, (4 + 8 * hash(j)) * (.6 + .4 * Math.sin(t * 9 + j)) * (.4 + .6 * swell));
    }
    // a stream of 字灵 riding the light down into the mic
    if (swell > .35) for (let k = 0; k < 16; k++) {
      const uu = frac(hash(k * 5.1) + (t - T_SWELL) * .5); if (uu > .97) continue;
      const q = at(BEAM, uu), n = (hash(k * 2.3) - .5) * beamW(uu) * wk * .55;
      miniZ(q[0] - Math.sin(q[2]) * n, q[1] + Math.cos(q[2]) * n + 16, (8 + 5 * hash(k * 9.7)) * (1 - .8 * seg(uu, .8, .97)) * clamp((swell - .35) * 3), { seed: k, rot: -.3 + .2 * Math.sin(t * 5 + k) });
    }
    // desk balls (behind the mic), and the crowd of 字灵 that fills the room once the light hits
    for (const z of Z1) if (z.y < 700) paperBall(z.x, z.y, z.r, seg(t, z.pop - .02, z.pop + .4), z.i);
    CROWD1.forEach(([x, y], i) => {
      const a = t - (T_SWELL + .08 + .5 * hash(i * 6.1)); if (a < 0) return;
      const hop = Math.abs(Math.sin((bpOf(t) + hash(i * 2.2)) * Math.PI)), u = (8 + 3 * hash(i * 1.7)) * backOut(clamp(a / .25));
      miniZ(x + 6 * Math.sin(t * 2 + i), y - 22 * hop, u, { seed: i + 40, glow: .7, rot: .2 * Math.sin(t * 4 + i) });
    });
    // the mic (mirrored, so its pop filter faces the singer); on each gulp its capsule swells and a gulp of light runs
    // down the stand and along the cable into the mixer
    push(); translate(MX1, 0); scale(-1, 1); mic(0, FY1, MS1, { on: 1, glow: .45 + .55 * g, cable: [MX1 - 1560, 650] }); pop();
    for (const b of GULPS) {
      const a = t - b; if (a < 0 || a > BEAT / 2 + .05) continue;
      const f = clamp(a / (BEAT / 2)), n = Math.floor(f * (SWALLOW.pts.length - 1)), lit = SWALLOW.pts.slice(0, n + 1);
      if (lit.length > 1) inkLine(lit, 3.2, AMBER, 'ink', .5);
      const q = at(SWALLOW, f); paint(ellPts(q[0], q[1], 30, 30, 10), { wash: AMBER, washOp: 110, ink: null }); paint(ellPts(q[0], q[1], 15, 13, 10), { wash: GOLD, ink: HONEY, sw: .8 });
    }
    if (g > .03) {
      const s = MS1, [cx, cy] = CAP1, bw = 68 * s * (1 + .6 * g), bh = 150 * s * (1 + .16 * g), top = cy - 5 * s - bh / 2;
      paint(rrPts(cx - bw / 2, top, bw, bh, Math.min(bw, bh) * .47), { wash: '#DCE0E8', fill: AMBER, fillOp: 170 * g, tex: .4, ink: PAL.ink, sw: 1.1 });
      for (let k = 0; k < 6; k++) { const yy = top + bh * (k + 1.4) / 8; inkLine([[cx - bw * .36, yy], [cx + bw * .36, yy]], .5, '#7E8698', 'inkfine', 0); }
      paint(rectPts(cx - bw / 2, cy + 6 * s, bw, 14 * s), { wash: NEON.cyan, ink: PAL.ink, sw: .6 });
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + t * 3; sparkle(cx + Math.cos(a) * (bw * .8 + 30 * (1 - g)), cy + Math.sin(a) * (bh * .6 + 20 * (1 - g)), 10 * g); }
    }
    // the VU meters: each hit stacks the bars higher; the third blows them through the ceiling
    if (nV > 0) for (let i = 0; i < 8; i++) {
      const x = 1430 + i * 34;
      let h;
      if (nV < 3) h = 20 * [3.5, 8][nV - 1] * (.55 + .45 * hash(i * 3.7 + nV * 11)) * backOut(clamp(aV / .14)) * (1 - .3 * seg(aV, .14, .33));
      else h = lerp(20 * 8 * (.55 + .45 * hash(i * 3.7 + 22)) * .7, 1000 + 250 * hash(i), easeIn(clamp(aV / (.2 + .1 * hash(i * 5.1)))));
      vuColumn(x, 640, 24, h, CAM.cy - 560 / CAM.zoom);
      if (h > 549) { const a2 = t - (VU_HITS[2] + (.2 + .1 * hash(i * 5.1)) * Math.cbrt(549 / 1100)); for (let k = 0; k < 5; k++) { const ang = -Math.PI / 2 + (hash(i * 9 + k) - .5) * 2.6, d = 20 + 140 * clamp(a2 * 3); sparkle(x + 12 + Math.cos(ang) * d, 91 + Math.sin(ang) * d * .6 + 300 * a2 * a2, 16 * (1 - clamp(a2 * 1.6)), k % 2 ? AMBER : LIGHT); } }
    }
    // floor balls and the popped 字灵
    for (const z of Z1) if (z.y >= 700) paperBall(z.x, z.y, z.r, seg(t, z.pop - .02, z.pop + .4), z.i);
    for (const z of Z1) {
      const s = z1At(z, t); if (!s || s.k < .05) continue;
      ziling(s.p[0], s.p[1], z.u * s.k, { seed: z.i, glyph: z.i % 5, rot: s.rot, eyes: t < z.leap ? (z.i % 3 ? 'happy' : 'normal') : 'happy', mouth: t < z.leap ? 'O' : 'smile', blush: true, glow: .8, sq: .12 * pulse(t, 7) });
    }
    // 小夜 sings into it, fist pumping on the beat; both arms up when the roof goes
    const m = move('bounce', t), md = mood(t, [[54.5, 'closed'], [B(82), 'happy'], [VU_HITS[2], 'spark', 'music']]), pump = pulse(t, 5);
    xiaoye(XY1 + m.dx * U1, FY1, U1, { ...m, ...md, take: md.take * .6, mouth: 'sing', glow: .9 + .3 * pump, blush: true,
      aL: roof ? .8 + .2 * pump : .3 + .65 * pump, aR: roof ? .8 + .2 * pump : .12 + .12 * Math.sin(t * 6) });
    camEnd();
    if (roof) flash(.32 * Math.exp(-(t - VU_HITS[2]) * 10), GOLD);
  }

  // =====================================================================================================================
  // 2 · 57.37–60.27 · "让每次跌倒都成为起点": three falls on three beats, three starting lines, drum-kid boosters, out the window
  // =====================================================================================================================
  const FY2 = 882, U2 = 24, H6 = 6 * U2, HL = 2.3 * U2, IMP = [B(86), B(87), B(88)], T_DK = B(88.5), T_GO = B(89);
  const LINES2 = [880, 1118, 1468], MX2 = 430, BALL2 = [1070, FY2 + 2], CHAIR2 = [1300, FY2 + 2];
  const WIN2 = [1180, 170, 560, 390], OUT2 = [1598, 372];
  // body centre (cx, cy) and spin th through the tumbles (the feet follow); u shrinks as he flies into the window
  function tumble(t) {
    const P = (a, b) => seg(t, a, b), I = Math.PI, bump = a => 20 * Math.abs(Math.sin(a * 12)) * Math.exp(-a * 10);
    if (t < 57.72) { const k = P(57.37, 57.72); return { cx: lerp(560, 735, k), cy: FY2 - H6 - 10 * Math.abs(Math.sin(k * 3.5 * I)), th: .12, run: t * 3 }; }
    if (t < IMP[0]) { const k = easeIn(P(57.72, IMP[0])); return { cx: lerp(735, 880, k), cy: lerp(FY2 - H6, FY2 - HL, k), th: lerp(.12, I / 2, k), fall: 1 }; }
    if (t < 58.27) { const a = t - IMP[0]; return { cx: 880, cy: FY2 - HL - bump(a), th: I / 2, imp: a, lie: 1 }; }
    if (t < 58.5) { const k = P(58.27, 58.5); return { cx: lerp(880, 1032, k), cy: lerp(FY2 - HL, FY2 - H6, k) - 130 * Math.sin(k * I), th: lerp(I / 2, TAU, easeOut(k)), roll: 1 }; }
    if (t < 58.54) return { cx: 1032 + (t - 58.5) * 700, cy: FY2 - H6, th: TAU, run: t * 3 };
    if (t < IMP[1]) { const k = easeIn(P(58.54, IMP[1])); return { cx: lerp(1060, 1118, k), cy: lerp(FY2 - H6, FY2 - HL, k) - 40 * Math.sin(k * I), th: lerp(TAU, 1.5 * I, k), fall: 1, slip: 1 }; }
    if (t < 58.86) { const a = t - IMP[1]; return { cx: 1118, cy: FY2 - HL - bump(a) * .8, th: 1.5 * I, imp: a, lie: 1 }; }
    if (t < 59.03) { const k = P(58.86, 59.03); return { cx: lerp(1118, 1170, k), cy: lerp(FY2 - HL, FY2 - H6, easeOut(k)) - 50 * Math.sin(k * I), th: lerp(1.5 * I, TAU, easeOut(k)), roll: 1 }; }
    if (t < 59.12) { const k = P(59.03, 59.12); return { cx: lerp(1170, 1222, k), cy: FY2 - H6, th: TAU + .15 * k, run: t * 3 }; }
    if (t < IMP[2]) { const k = P(59.12, IMP[2]); return { cx: lerp(1222, 1468, k), cy: lerp(FY2 - H6, FY2 - HL, k * k) - 175 * Math.sin(k * I), th: lerp(TAU + .15, TAU + 2.5 * I, k), fall: 1, spin: 1 }; }
    if (t < 59.5) { const a = t - IMP[2]; return { cx: 1468, cy: FY2 - HL - bump(a) * .9, th: TAU + 2.5 * I, imp: a, lie: 1 }; }
    const TH_C = 2 * TAU + .55;
    if (t < T_GO) {                                            // up into a sprinter's crouch, eyes on the window
      const k = easeOut(P(59.5, 59.66)), sq = .3 * k + .1 * seg(t, 59.7, T_GO);
      const c = [1410 + H6 * (1 - sq) * Math.sin(.55), FY2 - H6 * (1 - sq) * Math.cos(.55)];
      return { cx: lerp(1468, c[0], k), cy: lerp(FY2 - HL, c[1], k), th: lerp(TAU + 2.5 * I, TH_C, k), sq, crouch: 1, shiver: seg(t, 59.72, T_GO) };
    }
    const k = seg(t, T_GO, 60.27), e = Math.pow(k, 1.5), c0 = [1410 + H6 * .6 * Math.sin(.55), FY2 - H6 * .6 * Math.cos(.55)];
    const p = bez(c0, [1520, 600], OUT2, e);
    return { cx: p[0], cy: p[1], th: lerp(TH_C, 2 * TAU + .22, easeOut(k)), sq: lerp(.4, -.32, easeOut(clamp(k * 3))), u: lerp(U2, 9.5, e), fly: 1, k };
  }
  const feetOf = (P, u) => { const sq = P.sq || 0; return [P.cx - 6 * u * (1 - sq) * Math.sin(P.th), P.cy + 6 * u * (1 - sq) * Math.cos(P.th)]; };
  function tumbleShot(t, lt) {
    const P = tumble(t), u = P.u || U2, hitA = t - lastHit(t, IMP), go = t - T_GO;
    const camx = kf(t, [[57.37, 800], [58.0, 940], [58.7, 1150], [59.35, 1330], [T_GO, 1360], [60.27, 1560]], ease);
    const camy = t < T_GO ? 668 : lerp(668, 395, easeIn(seg(t, T_GO, 60.27)));
    const zoom = t < T_GO ? 1.24 + .03 * seg(t, 59.5, T_GO) : lerp(1.27, 1.65, easeIn(seg(t, T_GO, 60.27)));
    const [sx, sy] = shakeXY(t, 2 + 16 * (hitA < .4 ? Math.exp(-hitA * 9) : 0) + (go > 0 ? 18 * Math.exp(-go * 8) : 3 * (P.shiver || 0)));
    camBegin(camx + sx, camy + sy, zoom + .025 * (hitA < .3 ? Math.exp(-hitA * 12) : 0));
    studioBack(t, { dawn: .44, clock: 5.5, bin: .6, neon: .6 + .5 * pulse(t, 5), neonA: beatN(t) % 2 ? NEON.magenta : NEON.cyan, neonB: beatN(t) % 2 ? AMBER : NEON.magenta, level: .45 + .5 * pulse(t, 4) });
    // first light slanting in from the window onto the floor
    paint([[1200, 190], [1440, 190], [1250, 890], [760, 890]], { fill: GOLD, fillOp: 55, bleed: .2, tex: .2, border: .1, ink: null });
    openPane(WIN2, seg(t, 60.03, 60.2));
    // the mic (its cable is the first trip wire) and the paper ball that shoots away underfoot
    push(); translate(MX2, 0); scale(-1, 1); mic(0, FY2, .62, { on: 1, glow: .3, cable: [MX2 - 1560, 650] }); pop();
    const slipA = t - 58.54;
    if (slipA < 0) paperBall(BALL2[0], BALL2[1], 22, 0, 3);
    else if (slipA < .8) { push(); translate(BALL2[0] + 900 * slipA, BALL2[1] - 60 * Math.abs(Math.sin(slipA * 9)) * Math.exp(-slipA * 3)); rotate(slipA * 18); paperBall(0, 22 * .82, 22, 0, 3); pop(); }
    // three starting lines, painted on as he lands on each beat
    LINES2.forEach((x, i) => startLine(x, FY2 - 34, FY2 + 100, seg(t, IMP[i], IMP[i] + .14), seg(t, IMP[i] + .08, IMP[i] + .3), t));
    // the chair: he runs into its backrest and it topples back
    deskChair(CHAIR2[0], CHAIR2[1], .95, 1.45 * backOut(seg(t, 59.14, 59.42)));
    // his shadow on the floor
    const lieK = Math.abs(Math.sin(P.th)), above = Math.max(0, FY2 - HL * lieK - H6 * (1 - lieK) - P.cy);
    if (!P.fly) paint(ellPts(P.cx, FY2 + 6, (3.3 + 3.4 * lieK) * u * (1 - Math.min(.5, above / 400)), .7 * u, 16), { fill: PAL.ink, fillOp: 90 * (1 - Math.min(.7, above / 300)), bleed: .25, tex: .3, border: .1, ink: null });
    // the drum kids: hop in behind his feet, wind up, bang on the beat and ride his heels out of the window
    const F = feetOf(P, u);
    const dks = [['kick', 1318, -1.3], ['snare', 1232, 1.3]];
    if (t > 59.36) dks.forEach(([kind, x1, side], j) => {
      let x, y, du = 13, rot = 0, aA = .3, sq = 0;
      if (t < T_GO) {
        const k = seg(t, 59.36 + j * .04, T_DK), hop = Math.abs(Math.sin(k * 2 * Math.PI));
        x = lerp(960 - j * 70, x1, k); y = FY2 - 130 * hop * (1 - k * .3); sq = k >= 1 ? .25 * Math.exp(-(t - T_DK) * 10) : 0;
        aA = t < T_DK ? .5 : lerp(.3, 1.6, easeOut(seg(t, T_DK + .05, T_GO - .05)));
      } else {
        const [ox, oy] = rotV(side * 1.3 * u, 1.45 * u, P.th); x = F[0] + ox; y = F[1] + oy; du = 13 * u / U2; rot = P.th - .2; aA = go < .08 ? lerp(1.6, -.4, go / .08) : -.4;
        const back = rotV(0, 1, P.th), q = du / 10;
        for (let r = 0; r < 3; r++) { const age = frac(go * 5 + r / 3), d = age * 260 * q; ringOut(x + back[0] * d, y + back[1] * d, (14 + 40 * age) * q, .5, 2.4 * (1 - age), r % 2 ? AMBER : LIGHT); }
        paint([[x - 16 * q, y], [x + 16 * q, y], [x + back[0] * 90 * q, y + back[1] * 90 * q]], { wash: PEACH, washOp: 220, ink: null });
      }
      drumkid(x, y, du, { kind, rot, sq, aL: aA, aR: aA, eyes: t < T_GO ? 'happy' : 'spark', mouth: 'grin', noShadow: t >= T_GO, seed: j });
    });
    // launch blast on the floor
    if (go > 0 && go < .5) { ringOut(1410, FY2 + 8, 60 + 700 * easeOut(go / .5), .16, 5 * (1 - go / .5), AMBER); puffs(1410, FY2, go, 1.4, 6, '#EADCC6', .5); }
    // 小夜: run, trip, splat, roll up, slip, splat, sprint, somersault over the chair, splat, crouch, blast off
    const md = mood(t, [[57.37, 'happy'], [57.78, 'scared'], [IMP[0], 'x'], [58.28, 'happy'], [58.56, 'scared'], [IMP[1], 'x'], [58.88, 'happy'], [59.14, 'scared'], [IMP[2], 'x'], [59.5, 'narrow'], [T_GO, 'spark']]);
    const imp = P.imp != null ? Math.exp(-P.imp * 12) : 0, flail = .9 + .5 * Math.sin(t * 40);
    let aL = -1.2, aR = -1.2, mouth = 'grin', brows = null;                   // (arms above ~1.1 disappear behind his big head)
    if (P.run != null) { aL = .9 * Math.sin(P.run * TAU); aR = -aL; }
    if (P.fall || P.roll) { aL = flail; aR = flail - .3; mouth = 'O'; brows = 'worried'; }
    if (P.lie) { aL = .75 - .5 * imp; aR = .8 - .5 * imp; mouth = 'wobble'; }
    if (P.crouch) { aL = -1.9 + .1 * Math.sin(t * 30); aR = .9; mouth = 'grin'; brows = 'angry'; }
    if (P.fly) { aL = .85; aR = .85; mouth = 'grin'; }
    const sh = (P.shiver || 0) * 2.5;
    xiaoye(F[0] + jit(sh), F[1] + jit(sh), u, { ...md, take: md.take * .5, rot: P.th, sq: P.sq || 0, sx: P.lie ? 1 + .25 * imp : 1, sy: P.lie ? 1 - .2 * imp : 1,
      run: P.run, aL, aR, mouth, brows, blush: true, glow: .6 + .4 * pulse(t, 5), noShadow: true });
    // splats: dust and star-bursts on each landing; speed lines on the blast-off
    IMP.forEach((b, i) => { const a = t - b; puffs(LINES2[i], FY2, a, 1.1, 5); if (a > 0 && a < .25) for (let k = 0; k < 6; k++) { const ang = Math.PI + (k + .5) / 6 * Math.PI, r0 = 60 + 260 * easeOut(a / .25); inkLine([[LINES2[i] + Math.cos(ang) * r0, FY2 - 30 + Math.sin(ang) * r0 * .5], [LINES2[i] + Math.cos(ang) * (r0 + 40), FY2 - 30 + Math.sin(ang) * (r0 + 40) * .5]], 2.2 * (1 - a / .25), PAL.cream, 'ink', 0); } });
    if (P.spin) for (let k = 0; k < 3; k++) { const a0 = P.th - k * .5; inkLine([[P.cx + Math.cos(a0) * 170, P.cy + Math.sin(a0) * 170], [P.cx + Math.cos(a0 - .4) * 170, P.cy + Math.sin(a0 - .4) * 170]], 1.4, PAL.cream, 'ink', .6); }
    if (P.fly) for (let k = 0; k < 9; k++) { const o = (hash(k) - .5) * 260, d = rotV(0, 1, P.th), n = [-d[1], d[0]], b0 = 60 + 260 * frac(hash(k + 9) + t * 4); inkLine([[F[0] + n[0] * o + d[0] * b0, F[1] + n[1] * o + d[1] * b0], [F[0] + n[0] * o + d[0] * (b0 + 180), F[1] + n[1] * o + d[1] * (b0 + 180)]], 1.2, LIGHT, 'inkfine', 0); }
    // the light bursting out through the open pane as he goes
    const burst = seg(t, 60.14, 60.27);
    if (burst > 0) { paint(ellPts(OUT2[0], OUT2[1], 140 + 420 * burst, 120 + 360 * burst, 16), { fill: AMBER, fillOp: 150 * burst, bleed: .3, tex: .2, ink: null }); paint(starPts(OUT2[0], OUT2[1], 120 + 700 * burst, .22, 10, t), { wash: GOLD, washOp: 200 * burst, ink: null }); }
    camEnd();
    flash(.55 * easeIn(seg(t, 60.17, 60.27)), GOLD);
  }

  // =====================================================================================================================
  // 3 · 60.27–62.5 · "城市睡了我还没有闭眼": over the sleeping city, wide awake, trailing the light; a dive and a roll
  // =====================================================================================================================
  const X3 = t => 260 + 820 * (t - 60.27);
  const Y3 = t => kf(t, [[59.2, 640], [60.27, 540], [60.64, 470], [61.08, 700], [61.36, 648], [61.64, 430], [62.05, 470], [62.8, 505]], ease);
  const slope3 = t => Math.atan2(Y3(t + .03) - Y3(t - .03), X3(t + .03) - X3(t - .03));
  const th3 = t => 1.22 + slope3(t) * .85;
  function flyShot(t, lt) {
    const X = X3(t), Y = Y3(t), cx = X + 150, cy = 540 + (Y - 520) * .55, dawn = .44 + .06 * lt / 2.23, u = 29;
    dawnSky(t, dawn);
    paint(ellPts(1650, 250, 130, 130, 18), { fill: PAL.cream, fillOp: 40, bleed: .3, ink: null });            // the setting moon
    paint(ellPts(1650, 250, 58, 58, 20), { wash: '#FFF1C8', washOp: 200, ink: PAL.ink, sw: .8 });
    paint(ellPts(1672, 238, 48, 52, 18), { wash: nightCol('skyTop', dawn), washOp: 200, ink: null });
    const [sx, sy] = shakeXY(t, 1.5 + 2.5 * pulse(t, 6));
    camBegin(cx + sx, cy + sy, 1.05 + .012 * pulse(t, 6), -.015 + .012 * Math.sin(t * 1.3));
    farRow(-1100 + .72 * cx, 1900 + .72 * cx + 900, 905, .5, dawn + .1, 9, .05);
    skyline(t, { y: 1110, s: 1.3, seed: 3, x0: -700, x1: 3300, wake: 0, dawn });
    paint(rectPts(-800, 1104, 4400, 600), { wash: nightCol('near', dawn), ink: null });
    // his trail of light, a few 字灵 riding it; the drum kids thump behind his heels
    const trail = [];
    for (let k = 30; k >= 1; k--) { const tt = t - k * .045, th2 = th3(tt); trail.push([X3(tt) - 7.4 * u * Math.sin(th2), Y3(tt) + 7.4 * u * Math.cos(th2)]); }
    ribbon(trail, 14, 62);
    [9, 15, 21, 27].forEach((k, i) => { const p = trail[30 - k]; if (p) miniZ(p[0], p[1] - 4 + 6 * Math.sin(t * 8 + i), 9, { seed: i + 3, glow: .6 }); });
    const th = th3(t), roll = Math.cos(TAU * easeIO(seg(t, 61.36, 61.92))), F = [X - 6 * u * Math.sin(th), Y + 6 * u * Math.cos(th)];
    [['kick', -1.05], ['snare', 1.05]].forEach(([kind, side], j) => {
      const [ox, oy] = rotV(side * u * roll, 1.25 * u, th), hit = pulse(t - j * BEAT / 2, 8);
      const back = rotV(0, 1, th);
      for (let r = 0; r < 2; r++) { const age = frac(bpOf(t) * 2 + r / 2 + j * .25); ringOut(F[0] + ox + back[0] * age * 240, F[1] + oy + back[1] * age * 240, 12 + 40 * age, .55, 2.6 * (1 - age), r ? AMBER : LIGHT); }
      drumkid(F[0] + ox, F[1] + oy, 12, { kind, rot: th - .25, aL: .3 + 1.1 * hit, aR: .3 + 1.1 * hit, eyes: 'happy', mouth: 'grin', noShadow: true, seed: j + 4 });
    });
    // 小夜, eyes wide open, headphones glowing: fist forward, the other arm laid back along his side
    const md = mood(t, [[60.2, 'scared'], [61.36, 'spark'], [61.95, 'scared']]);
    xiaoye(F[0], F[1], u, { ...md, take: md.take * .5, rot: th, sx: roll, aL: -1.45 + .1 * Math.sin(t * 5), aR: .95 + .1 * Math.sin(t * 4), mouth: t > 61.1 && t < 61.4 ? 'O' : 'grin', blush: true, glow: .85 + .35 * pulse(t, 5), noShadow: true });
    // wind lines
    for (let i = 0; i < 12; i++) { const y = cy - 480 + hash(i * 3.3) * 960, len = 140 + 200 * hash(i * 1.9), x = cx + 1100 - frac(hash(i * 7.1) + t * 1.6) * 2400; inkLine([[x, y], [x + len, y]], .8, i % 3 ? LIGHT : '#B89AD0', 'inkfine', 0); }
    camEnd();
    if (lt < .18) flash(.55 * (1 - lt / .18), GOLD);
  }

  // =====================================================================================================================
  // 4 · 62.5–65.44 · "我要把明天唱到你耳边": the ribbon spirals up the tallest building into its ear; the city wakes up
  // =====================================================================================================================
  const TWX = 1240, TWY = 1150, T_EAR = B(96), C4 = [470, 575];
  const EARP = (() => {                                        // from his mouth, down round the tower, spiralling up into the ear
    const pts = [], z = [], rx = 262, ry = 60, ph0 = 2.35, ph1 = -Math.PI, n = 44, start = [TWX + rx * Math.cos(ph0), 780 + ry * Math.sin(ph0)];
    for (let i = 0; i <= 12; i++) { pts.push(bez([552, 538], [760, 600], start, i / 12)); z.push(1); }
    for (let i = 1; i <= n; i++) {
      const f = i / n, ph = lerp(ph0, ph1, f), x = TWX + rx * Math.cos(ph), y = lerp(780, 290, f) + ry * Math.sin(ph);
      pts.push([x, y]); z.push(Math.sin(ph) < 0 && Math.abs(x - TWX) < (y < TWY - 720 ? 200 : 175) ? -1 : 1);   // hidden only where the tower covers it
    }
    for (const [x, y] of [[TWX - 250, 282], [TWX - 236, 272], [TWX - 226, 284]]) { pts.push([x, y]); z.push(1); }
    return mkPath(pts, z);
  })();
  function earShot(t, lt) {
    const dawn = .5, head = ease(seg(t, 62.56, T_EAR)), tail = Math.pow(seg(t, T_EAR, T_EAR + .5), 1.4);
    const earK = seg(t, T_EAR - .06, T_EAR + .1) * (1 - .5 * seg(t, T_EAR + .6, 65.44)), wake = seg(t, T_EAR + .1, T_EAR + .5);
    const wL = ease(seg(t, T_EAR + .3, T_EAR + .72)), wR = ease(seg(t, T_EAR + .45, 65.44));
    const push1 = easeIO(seg(t, 62.5, T_EAR)), back = ease(seg(t, T_EAR + .1, 65.44));
    dawnSky(t, dawn, 1500);
    const [sx, sy] = shakeXY(t, 1.5 + 5 * earK * (1 - back));
    camBegin(lerp(900, 1000, push1) - 20 * back + sx, lerp(560, 470, push1) + 40 * back + sy, lerp(1, 1.1, push1) - .06 * back + .01 * pulse(t, 6));
    farRow(-600, 2600, 930, .55, dawn + .1, 12, .05 + .5 * wR);
    skyline(t, { y: 1150, s: 1.3, seed: 5, x0: -400, x1: 1010, wake: wL, dawn });
    skyline(t, { y: 1150, s: 1.3, seed: 6, x0: 1470, x1: 2500, wake: wR, dawn });
    // the ribbon: the stretch behind the tower first, then the tower, then the stretch in front
    const R = head > tail + .003 ? runs(EARP, tail, head) : [], wOf = u => lerp(12, 44, clamp(u / .3));
    for (const r of R) if (!r.front) ribbon(r.pts, wOf(r.a), wOf(r.b), .8);
    tower(t, TWX, TWY, 1, { wake, cap: ease(seg(t, T_EAR + .2, 65.44)), ear: earK, dawn });
    for (const r of R) if (r.front) ribbon(r.pts, wOf(r.a), wOf(r.b), .8);
    if (head > tail && head < 1) { const h = at(EARP, head); paint(ellPts(h[0], h[1], 40, 40, 12), { wash: LIGHT, washOp: 220, ink: HONEY, sw: .8 }); sparkle(h[0], h[1], 60 + 14 * Math.sin(t * 20)); }
    for (let k = 0; k < 7; k++) {                                // 字灵 riding the ribbon round the tower (hidden when behind it)
      const uu = lerp(tail, head, frac(hash(k * 2.9) + t * .35)), i = Math.floor(uu * (EARP.pts.length - 1));
      if (head - tail < .02 || EARP.z[i] < -.2 && Math.abs(at(EARP, uu)[0] - TWX) < 190) continue;
      const q = at(EARP, uu); miniZ(q[0], q[1] - 14, 9, { seed: k, glow: .5 });
    }
    // 小夜 hovers on his drum-kid boosters and sings at the ear
    const C = [C4[0], C4[1] + 8 * Math.sin(t * 2.6)], th = .14 + .03 * Math.sin(t * 2), u = 24, F = [C[0] - 6 * u * Math.sin(th), C[1] + 6 * u * Math.cos(th)];
    [['kick', -1.1], ['snare', 1.1]].forEach(([kind, side], j) => {
      const [ox, oy] = rotV(side * u, 1.1 * u, th), hit = pulse(t - j * BEAT / 2, 8), age = frac(bpOf(t) + j * .5);
      ringOut(F[0] + ox, F[1] + oy + 40 + age * 150, 16 + 40 * age, .35, 2.4 * (1 - age), j ? AMBER : LIGHT);
      drumkid(F[0] + ox, F[1] + oy, 11, { kind, rot: th, aL: .3 + 1.1 * hit, aR: .3 + 1.1 * hit, eyes: 'happy', mouth: 'grin', noShadow: true, seed: j + 6 });
    });
    const md = mood(t, [[62.4, 'closed'], [T_EAR + .12, 'happy', 'heart']]);
    xiaoye(F[0], F[1], u, { ...md, rot: th, aL: .75 + .1 * Math.sin(t * 3) + .12 * pulse(t, 5), aR: -.7 + .15 * Math.sin(t * 4), mouth: 'sing', blush: true, glow: 1 + .3 * pulse(t, 5), noShadow: true });
    for (let k = 0; k < 3; k++) { const age = frac(t * 1.2 + k / 3); if (t < T_EAR + .3) emote('music', C[0] + 80 + age * 170, C[1] - 40 - age * 150 + 14 * Math.sin(age * 9), 11, clamp(age * 4) * (1 - age)); }
    camEnd();
  }

  // =====================================================================================================================
  // 5 · 65.44–67.974 · the ribbon climbs the sky and winds into a ball on the horizon; row after row bounces awake
  // =====================================================================================================================
  // The camera follows the light: on the awake tower as the ribbon bursts from its crown, tilting up the spiral with 小夜
  // riding its head, then panning down after it as it dives into the horizon, where it winds into the ball; the rows of
  // buildings in front hop awake near to far on B99.5 (as the ribbon lands), B100, B100.5 and keep bouncing.
  const BALL5 = [1270, 716], TW5 = [360, 1215, .8], T_ARR5 = B(99.5), HOP5 = [B(99.5), B(100), B(100.5), B(101)];
  const GATHER = (() => {
    const crown = [TW5[0], TW5[1] - 960 * TW5[2]], pts = [], n = 60;
    const hs = f => { const ph = Math.PI * .9 - f * TAU * 1.6, r = lerp(210, 280, f); return [560 + r * Math.cos(ph), lerp(340, -330, f) + r * .3 * Math.sin(ph)]; };
    for (let i = 0; i <= 10; i++) pts.push(bez(crown, [crown[0] - 10, crown[1] - 120], hs(0), i / 10));
    for (let i = 1; i <= n; i++) pts.push(hs(i / n));
    const h1 = pts[pts.length - 1]; for (let i = 1; i <= 24; i++) pts.push(bez(h1, [1180, -640], BALL5, i / 24));
    const P = mkPath(pts); P.helixEnd = P.cum[10 + n] / P.len; return P;
  })();
  function gatherShot(t, lt) {
    const dawn = .56 + .06 * lt / 2.53, T_TOP = 66.25;
    const head = t < T_TOP ? lerp(0, GATHER.helixEnd, easeIO(seg(t, 65.44, T_TOP))) : lerp(GATHER.helixEnd, 1, easeIn(seg(t, T_TOP, T_ARR5)));
    const tail = easeIO(seg(t, 66.35, 67.8)), arrived = t >= T_ARR5;
    const hitA = t - lastHit(t, HOP5), beatK = hitA >= 0 && hitA < .5 ? Math.exp(-hitA * 7) : 0;
    const br = 26 + 60 * Math.pow(tail, .8) + (arrived ? 12 * beatK : 0);
    const [cx, cy, z] = kf(t, [[65.44, [640, 560, 1.0]], [66.2, [660, 10, .92]], [66.95, [1100, 540, .9]], [67.974, [1080, 600, .96]]], easeIO);
    const [sx, sy] = shakeXY(t, 1.5 + 8 * beatK);
    camBegin(cx + sx, cy + sy, z + .015 * beatK);
    skyWorld(t, dawn, -600, 2500, -900, 760, BALL5[0]);
    lightBall(BALL5[0], BALL5[1], br, (arrived ? .6 * beatK : 0) + .5 * tail, t);
    if (arrived && t < T_ARR5 + .16) for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r0 = 40 + 380 * easeOut((t - T_ARR5) / .16); sparkle(BALL5[0] + Math.cos(a) * r0, BALL5[1] + Math.sin(a) * r0 * .7, 30 * (1 - (t - T_ARR5) / .16)); }
    // the ribbon with 字灵 riding it; 小夜 at its head up the spiral, then he lets go and floats up out of frame
    if (head > tail + .003) {
      ribbon(runs(GATHER, tail, head)[0].pts, 30, 58, .9);
      for (let k = 0; k < 10; k++) { const q = at(GATHER, lerp(tail, head, frac(hash(k * 4.1) + t * .3))); miniZ(q[0], q[1] - 10, 10, { seed: k + 20, glow: .5 }); }
      if (head < 1) { const h = at(GATHER, head); sparkle(h[0], h[1], 50 + 12 * Math.sin(t * 20)); }
    }
    // the city in front: asleep until its row's hit, then hopping awake near to far and bouncing on
    const wakeAt = b => t >= b ? lerp(.45, 1, ease(seg(t, b, b + .4))) : 0;
    const row = (o, b, hits) => { const w = wakeAt(b); if (w > 0) bouncyRow(t, { ...o, wake: w }, hits.filter(h => h >= b)); else skyline(t, { ...o, wake: 0 }); };
    farRow(-600, 2500, 775, .45, dawn + .12, 31, .08 + .6 * seg(t, B(100.5), B(101)));
    row({ y: 875, s: .7, seed: 21, x0: -500, x1: 2400, dawn: dawn + .08 }, B(100.5), HOP5);
    row({ y: 1010, s: 1.0, seed: 23, x0: -500, x1: 2400, dawn: dawn + .04 }, B(100), HOP5);
    row({ y: 1215, s: 1.45, seed: 25, x0: -500, x1: 2400, dawn }, B(99.5), HOP5);
    tower(t, TW5[0], TW5[1], TW5[2], { wake: 1, cap: 1, ear: .3 + .3 * pulse(t, 5), dawn });
    // 小夜 flies from where he sang onto the ribbon's head as it bursts out, rides it up, then lets go and floats off
    const up = seg(t, T_TOP, 66.95), uX = 17;
    if (up <= 0) {
      const q = at(GATHER, head), q2 = at(GATHER, Math.max(0, head - .01)), grab = ease(seg(t, 65.44, 65.82));
      const th = lerp(.15, Math.atan2(q[1] - q2[1], q[0] - q2[0]) + Math.PI / 2, grab);
      const C = [lerp(150, q[0], grab), lerp(600, q[1] - 30, grab)];
      xiaoye(C[0] - 6 * uX * Math.sin(th), C[1] + 6 * uX * Math.cos(th), uX, { rot: th, aL: lerp(-.6, -1.4, grab), aR: .95, eyes: 'spark', mouth: 'grin', blush: true, glow: 1, noShadow: true });
    } else {
      const p = at(GATHER, GATHER.helixEnd), x = p[0] + 260 * up, y = p[1] - 30 - 380 * easeIn(up);
      xiaoye(x, y, uX, { rot: .25 * Math.sin(up * 8), aL: .85, aR: .7 + .3 * Math.sin(t * 16), eyes: 'happy', mouth: 'grin', blush: true, glow: 1, noShadow: true, emote: 'heart', emoteK: seg(up, 0, .15) * (1 - seg(up, .7, .9)) });
    }
    camEnd();
  }

  // =====================================================================================================================
  // 6 + 7 · 67.974–75.974 · the street corner at dawn: 灯灯 dances, 小夜 drops in (B105), the band plays, the gold fills the frame
  // =====================================================================================================================
  const T_LAND = B(105), XY7 = 745, U7 = 31, BAND = [['horn', 1296], ['clock', 1416], ['bubble', 1536]];
  const ZL7 = Array.from({ length: 8 }, (_, i) => ({ x: [640, 700, 880, 980, 1080, 430, 330, 1210][i], y: [560, 420, 360, 470, 600, 470, 600, 500][i], u: 11 + 3 * hash(i * 3.1), seed: i }));
  function streetCam(t) {
    if (t < T_LAND) { const k = easeIO(seg(t, 67.974, 69.95)); return [lerp(590, 900, k), lerp(560, 540, k), lerp(1.75, 1.0, k)]; }
    return kf(t, [[T_LAND, [900, 540, 1.0]], [71.6, [830, 560, 1.1]], [73.31, [860, 560, 1.1]], [74.1, [1060, 540, 1.04]], [74.8, [980, 500, 1.1]], [75.93, [965, 470, 1.6]]], easeIO);
  }
  // the gathered light peeking over the roofs: a warm glare that brightens with k, slow sunbeams, and at the end (flood)
  // it swells until its gold fills the frame. The glare lies over the violet building faces, where pale gold goes grey:
  // soft fills in dawn rose, turning gold only as it floods.
  function horizonGlow(t, S, k, flood) {
    const [x, y, r] = S, cy = y - r * .85, f2 = flood * flood;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i - 4.5) * .3 + .05 * Math.sin(t * .8 + i), l = r * (3 + 2 * k + 14 * flood), w = .045 + .02 * hash(i);
      paint([[x, cy], [x + Math.cos(a - w) * l, cy + Math.sin(a - w) * l], [x + Math.cos(a + w) * l, cy + Math.sin(a + w) * l]], { wash: i % 2 ? GOLD : LIGHT, washOp: 45 + 45 * k + 120 * flood, ink: null });
    }
    paint(ellPts(x, cy, r * (3 + 16 * f2), r * (1.9 + 12 * f2), 18), { fill: mixCol('#FF8A8A', PEACH, flood), fillOp: 25 + 70 * k + 150 * flood, bleed: .12, tex: .15, border: .1, ink: null });
    paint(ellPts(x, cy - r * .15, r * (1.8 + 12 * f2), r * (1.1 + 9 * f2), 16), { fill: mixCol('#FF9A7A', HONEY, flood), fillOp: 25 + 70 * k + 170 * flood, bleed: .15, tex: .15, border: .05, ink: null });
    paint(ellPts(x, cy - r * .2, r * (1.05 + 8 * f2), r * (.55 + 6 * f2), 16), { fill: mixCol('#FF9AA8', GOLD, flood), fillOp: 45 + 90 * k + 170 * flood, bleed: .15, tex: .15, border: .05, ink: null });
  }
  function street(t) {
    const d = seg(t, 67.974, 75.974), dawn = lerp(.6, .8, d), sunK = lerp(.19, .21, d);   // ch 5 picks the sun up at .21
    const glowUp = easeIn(seg(t, 74.64, 75.93)), bk = pulse(t, 5);
    const [cx, cy, z] = streetCam(t), landA = t - T_LAND, [sx, sy] = shakeXY(t, 1.5 + (landA > 0 && landA < .5 ? 16 * Math.exp(-landA * 7) : 0));
    camBegin(cx + sx, cy + sy, z + .012 * bk);
    const L = streetBack(t, { dawn, wake: 1, sun: sunK, sign: .7 + .3 * bk, onAir: .7 + .3 * pulse2(t, 5) });
    horizonGlow(t, L.sun, d * .8 + .2 * bk, glowUp);
    // 灯灯 dances on its corner: red, green, both, green… one lamp per beat
    const bi = beatN(t), style = ['bounce', 'sway', 'hop', 'sway'][Math.floor((bi - 101) / 4) % 4], m = move(style, t, 2);
    const lamp = ['red', 'green', 'both', 'green'][((bi % 4) + 4) % 4];
    const lookUp = t > 74.64;
    dengdeng(L.light[0] + m.dx * 9, L.light[1], 27, { ...m, light: lamp, glow: 1.1, eyes: lookUp ? 'spark' : 'happy', mouth: 'grin', blush: true,
      aL: lookUp ? 1.4 : m.aL + .4, aR: lookUp ? 1.3 : m.aR + .4 });
    // the noise monsters by the door: swaying at first, then a band keeping the beat
    const band = t > T_LAND + BEAT * 2;
    BAND.forEach(([kind, x], i) => {
      const bm = move(band ? (kind === 'bubble' ? 'hop' : 'bounce') : 'sway', t + i * .08, i);
      const toot = kind === 'horn' ? pulse(t, 7) : kind === 'clock' ? pulse(t - BEAT / 2, 7) : pulse2(t, 7);
      noisy(x + bm.dx * 22, L.ground + 6, 22, { kind, seed: i, dy: bm.dy * .6, sq: bm.sq + (band ? .18 * toot : 0), rot: (kind === 'clock' && band ? .14 * toot * Math.sin(t * 60) : bm.rot),
        eyes: band ? 'happy' : 'closed', mouth: band ? (toot > .5 ? 'O' : 'smile') : 'smile', aL: band ? .4 + 1.1 * toot : .8, aR: band ? .4 + 1.1 * toot : .6 });
      if (band) {
        if (kind === 'horn') for (let r = 0; r < 2; r++) { const age = frac(bpOf(t) + r * .5); ringOut(x + 2.3 * 22 + age * 130, L.ground - 3.2 * 22, 22 + 55 * age, 1.2, 2.8 * (1 - age), r ? AMBER : NEON.magenta); }
        const age = frac(bpOf(t) + i * .33); emote('music', x + 40 + age * 70, L.ground - 150 - age * 90, 12, clamp(age * 5) * (1 - age));
      }
    });
    // the drum kids (after he lands) and the 字灵 dancing in the air
    if (landA > 0) [['kick', 1040], ['snare', 1150]].forEach(([kind, x], j) => {
      const dm = move('hop', t, j), hit = pulse(t - j * BEAT / 2, 8), fall = seg(t, T_LAND - .3, T_LAND);
      drumkid(x + dm.dx * 15, L.ground + 12, 15, { ...dm, kind, aL: .3 + 1.2 * hit, aR: .3 + 1.2 * hit, eyes: lookUp ? 'spark' : 'happy', mouth: 'grin', seed: j + 8, dy: dm.dy - 30 * (1 - fall) });
    });
    ZL7.forEach((q, i) => {
      const enter = landA + .2 - i * .05; if (enter < 0) return;
      const drop = easeOut(clamp(enter / .6)), hop = Math.abs(Math.sin((bpOf(t) + i * .25) * Math.PI));
      ziling(q.x + 20 * Math.sin(t * 1.3 + i), lerp(-80, q.y, drop) - 30 * hop, q.u, { seed: q.seed, glyph: i % 5, eyes: lookUp ? 'spark' : 'happy', mouth: 'smile', blush: true, sq: .15 * pulse(t, 8), rot: .15 * Math.sin(t * 3 + i) });
    });
    // 小夜: drops out of the sky onto the beat, lands in a squash, then dances; everyone looks up at the ball at the end
    if (t > T_LAND - .45) {
      if (landA < 0) {
        const k = seg(t, T_LAND - .45, T_LAND), y = L.ground - (1 - k * k) * 1100;
        xiaoye(XY7, y, U7, { dy: 0, sq: -.18, aL: .85, aR: .85, eyes: 'spark', mouth: 'grin', blush: true, glow: 1, noShadow: k < .6 });
        for (let j = 0; j < 6; j++) inkLine([[XY7 + (j - 2.5) * 40, y - 13 * U7 - 60 - 80 * hash(j)], [XY7 + (j - 2.5) * 40, y - 13 * U7 - 220 - 80 * hash(j)]], 1.2, LIGHT, 'inkfine', 0);
      } else {
        const bar = Math.floor(landA / (BEAT * 4)), dm = move(['hop', 'roof', 'shimmy', 'roof'][Math.min(3, bar)], t, 1);
        const land = Math.exp(-landA * 6) * Math.cos(landA * 18) * .4;
        const md = mood(t, [[T_LAND, 'happy'], [73.31, 'closed'], [74.64, 'spark', 'heart']]);
        const up = a => a > 1 ? .78 + .2 * Math.abs(Math.sin(bpOf(t) * Math.PI)) : a;    // above ~1 his hands hide behind his head
        xiaoye(XY7 + dm.dx * 12 * (landA > .5 ? 1 : 0), L.ground + 10, U7, { ...(landA > .5 ? dm : {}), ...md, sq: landA < .5 ? land : dm.sq, mouth: 'grin', blush: true, glow: 1 + .3 * bk,
          aL: lookUp ? .92 + .08 * bk : landA < .5 ? .9 : up(dm.aL), aR: lookUp ? .92 + .08 * bk : landA < .5 ? .9 : up(dm.aR) });
        puffs(XY7, L.ground + 10, landA, 1.6, 7, '#EFD9C4', .6);
        if (landA < .3) ringOut(XY7, L.ground + 14, 80 + 900 * easeOut(landA / .3), .12, 5 * (1 - landA / .3), GOLD);
      }
    }
    camEnd();
    flash(ease(seg(t, 75.35, 75.93)), GOLD);
  }
  function cornerShot(t) { street(t); }
  function partyShot(t) { street(t); }

  chapter('chorus2', 54.641, 75.974, [[54.641, gulpShot], [57.37, tumbleShot], [60.27, flyShot], [62.5, earShot], [65.44, gatherShot], [B(101), cornerShot], [T_LAND, partyShot]]);
})();
