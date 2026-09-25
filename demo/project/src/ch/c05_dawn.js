// c05_dawn: morning at the same crossing (75.974 – DUR + 1). Storyboard § 5 · dawn peach, rose and gold.
// Bookend of chapter 1's opening: streetBack's default layout, camera centre (960, 540), zoom 1, Dengdeng at L.light.
//   sunrise  75.974  the gold that ended chapter 4 gathers back into the rising sun (the light he recorded: word-spirits
//                    smile inside it); Dengdeng yawns one last red yawn and pops green (B117); the city opens its eyes and
//                    stretches (B118); the noise monsters snore against the studio door
//   morning  B121    Xiaoye flings the door open (the monsters tumble onto their backs, still asleep), stretches, hops over
//                    them, waves to Dengdeng and walks off on the beat into the morning, the word-spirits hopping after him;
//                    the title sign pops off in the sun (B125); the camera pulls back to the opening framing, fade to paper
(() => {
  const B = n => OFF + n * BEAT;
  const GOLD = '#FFE6A0', DDU = 26, XU = 16, NU = 16, ZU = 12;          // GOLD: chapter 4 ends on flash(1, '#FFE6A0')
  const T0 = 75.974, T_GREEN = B(117), T_WAKE = B(118), T_DOOR = B(121), T_HOP = B(123), T_LAND = B(124), T_SIGN = B(125);
  const FADE0 = 85.35, FADE1 = 86.55;

  // ---------- the sun (streetBack puts it at y = lerp(820, 300, easeOut(o.sun)); these ask for a height instead) ----------
  const sunK = y => 1 - Math.cbrt(clamp((y - 300) / 520));
  const sunY = t => t < T_DOOR ? lerp(556, 336, (ease(seg(t, T0, T_DOOR)) + easeOut(seg(t, T0, T_DOOR))) / 2)   // 556: o.sun .21, where chapter 4 leaves it
    : lerp(336, 304, ease(seg(t, T_DOOR, B(128.5))));

  // the light he recorded: word-spirits smiling inside the sun. [dx, dy, u] at sun radius 130
  const SPIRITS = [[0, 22, 22], [-64, 28, 14], [56, -46, 13]];
  function sunSpirits(S, t, k) {
    if (k < .02) return;
    const [sx, sy, r] = S, line = mixCol('#FFC24A', '#B8502A', k);
    SPIRITS.forEach(([dx, dy, u0], i) => {
      const u = u0 * r / 130, x = sx + dx * r / 130, fy = sy + dy * r / 130 + Math.sin(t * 2.1 + i * 1.9) * 3, b = fy + 1.25 * u, pts = [];
      for (let j = 0; j <= 8; j++) { const a = j / 8 * Math.PI; pts.push([x + Math.cos(a) * 1.15 * u, b - 1.15 * u + Math.sin(a) * 1.15 * u]); }
      pts.push([x - 1.05 * u, b - 1.9 * u], [x - .55 * u, b - 2.7 * u], [x + .3 * u * Math.sin(t * 5 + i * 2), b - 3.3 * u], [x + .6 * u, b - 2.6 * u], [x + 1.1 * u, b - 1.8 * u]);
      paint(pts, { fill: '#FFF6DA', fillOp: 170 * k, bleed: .08, tex: .3, border: .5, ink: line, sw: u / 20, br: 'inkfine', curv: .5 });
      const sw = u / 11;
      for (const e of [-1, 1]) inkLine([[x + e * .42 * u - .24 * u, fy + .08 * u], [x + e * .42 * u, fy - .2 * u], [x + e * .42 * u + .24 * u, fy + .08 * u]], sw, line, 'ink', .3);
      inkLine([[x - .28 * u, fy + .45 * u], [x, fy + .66 * u], [x + .28 * u, fy + .45 * u]], sw * .85, line, 'ink', .6);
      for (const e of [-1, 1]) paint(ellPts(x + e * .8 * u, fy + .4 * u, .2 * u, .12 * u, 8), { fill: PAL.rose, fillOp: 150 * k, bleed: .1, ink: null });
    });
  }
  // bloom over the rooftops and a slow fan of rays in the sky
  function sunLight(S, t, k) {
    if (k < .02) return;
    const [sx, sy] = S;
    paint(ellPts(sx, sy, 330, 315, 20), { fill: '#FFE3A0', fillOp: 60 * k, bleed: .3, tex: .2, border: .1, ink: null });
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI + .55 + i * (Math.PI - 1.1) / 6 + .04 * Math.sin(t * .6 + i), w = .026 + .014 * hash(i + 3), r0 = 150, r1 = 1500;
      paint([[sx + Math.cos(a - w) * r0, sy + Math.sin(a - w) * r0], [sx + Math.cos(a - w * 1.7) * r1, sy + Math.sin(a - w * 1.7) * r1],
        [sx + Math.cos(a + w * 1.7) * r1, sy + Math.sin(a + w * 1.7) * r1], [sx + Math.cos(a + w) * r0, sy + Math.sin(a + w) * r0]],
        { fill: '#FFF4D6', fillOp: (100 + 35 * hash(i + 7)) * k, bleed: .06, tex: .3, border: .25, ink: null });
    }
  }

  // ---------- the waking city: face buildings of skyline()'s default layout (seed 3, y 730) stretch overhead ----------
  // #6's right arm is behind the studio, so only its left one shows
  const STRETCH = [{ x: -36, x2: 177, top: 409, sides: [-1, 1], t0: T_WAKE + .04 }, { x: 1025, x2: 1223, top: 475, sides: [-1], t0: T_WAKE + .3 }];
  const wakeAt = t => t < T_WAKE ? .49 * seg(t, B(115), T_WAKE) : .5 + .5 * ease(seg(t, T_WAKE, B(120)));
  function stretchArms(t, dawn) {
    const col = nightCol('near', dawn);
    for (const b of STRETCH) {
      const k = backOut(seg(t, b.t0, b.t0 + .35)) * (1 - ease(seg(t, b.t0 + 1.2, b.t0 + 1.55)));
      if (k < .02) continue;
      const cx = (b.x + b.x2) / 2, reach = Math.sin(t * 40) * 3 * seg(t, b.t0 + .35, b.t0 + 1.1);   // the trembling top of a good stretch
      for (const s of b.sides) {
        const ex = s < 0 ? b.x : b.x2, sh = [ex, b.top + 44];
        const el = [ex + s * 30 * k, b.top + 44 - 85 * k], hd = [lerp(ex, cx + s * 16, k), b.top + 44 - (154 + reach) * k];
        paint(tubePts([sh, el, hd], 26, 20), { wash: col, ink: PAL.ink, sw: 1.1, curv: .5 });
        paint(ellPts(hd[0], hd[1], 15, 14, 12), { wash: col, ink: PAL.ink, sw: 1 });
      }
      const yawn = 1 - ease(seg(t, b.t0 + .7, b.t0 + 1.1));                       // a big yawn over the waking smile
      if (yawn > .05) paint(ellPts(cx, b.top + 56, 8 + 5 * yawn, 6 + 9 * yawn, 12), { wash: '#3A1E2E', ink: PAL.ink, sw: .8 });
    }
  }

  // ---------- Dengdeng: one last red yawn, pops green on the downbeat, waves Xiaoye off ----------
  const DD_KEYS = [[T0, 'sleepy'], [B(116), 'look', '!'], [T_GREEN, 'happy', 'spark'], [B(119.5), 'normal'], [B(125), 'happy', 'heart']];
  function traffic(t, L) {
    const bp = bpOf(t), o = { light: t < T_GREEN ? 'red' : 'green', mouth: 'flat', aL: -.85, aR: -.85, rot: 0, dy: 0, sq: 0, ...mood(t, DD_KEYS) };
    o.lookX = .75; o.lookY = -.65;
    if (t < B(116)) {
      o.rot = .03 * Math.sin(bp * Math.PI * .5);
      const yw = ease(seg(t, B(114), B(114.7))) * (1 - ease(seg(t, B(115.2), B(115.8))));
      o.aL = o.aR = lerp(-.85, 1.15, yw); o.sq = -.1 * yw; if (yw > .3) o.mouth = 'O';
    } else if (t < T_GREEN) { o.mouth = 'o'; o.aL = o.aR = -.35; o.dy = -.3 * ease(seg(t, B(116), B(116.3))); }
    else if (t < T_WAKE) {
      const age = t - T_GREEN, p = seg(age, 0, BEAT * .85);
      o.dy = -Math.sin(p * Math.PI) * 1.4; o.sq += p >= 1 ? .2 * Math.exp(-(age - BEAT * .85) * 10) : -.08 * Math.sin(p * Math.PI);
      o.aL = o.aR = 1.35; o.mouth = 'grin'; o.blush = true;
    } else {
      const m = move('bounce', t);
      o.dy = m.dy * (t < T_DOOR ? .45 : .2); o.sq += m.sq; o.aL = t < T_DOOR ? m.aL : -.55; o.aR = t < T_DOOR ? m.aR : -.55;
      if (t > B(125)) { o.aR = 1.2 + .45 * Math.sin((t - B(125)) * 16); o.rot = -.05; }   // waving him off
      o.mouth = t < B(119.5) || t > B(125) ? 'grin' : 'smile'; o.blush = true;
    }
    if (t >= T_GREEN) o.glow = 1 + .9 * Math.exp(-(t - T_GREEN) * 5);
    dengdeng(L.light[0], L.light[1], DDU, o);
    const age = t - T_GREEN;                                                     // "ding" lines as the green lamp pops on
    if (age > 0 && age < .4) {
      const cx = L.light[0], cy = L.light[1] - 8.85 * DDU + o.dy * DDU, r0 = 48 + age * 210, r1 = r0 + 34 * (1 - age / .4);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; inkLine([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], 2.2 * (1 - age / .4) + .4, i % 2 ? DD.green : PAL.cream, 'ink', 0); }
    }
  }

  // ---------- the noise monsters: asleep against the door, flipped onto their backs when it opens, still asleep ----------
  // lie: [x, rot, dy] resting on the ground (upside down needs dy ≈ −body height, on its side ≈ −half its width)
  const NAP = [
    { kind: 'horn', x: 1372, rot: .15, lie: [1350, Math.PI - .25, -4.7] },
    { kind: 'clock', x: 1432, rot: -.03, lie: [1415, 1.5, -1.95] },
    { kind: 'bubble', x: 1494, rot: -.17, lie: [1520, -2.8, -4.8] },
  ];
  function snore(x, y, s, t, seed) {
    for (let k = 0; k < 2; k++) {
      const ph = frac(t * .55 + hash(seed * 3.1) + k * .5);
      letter('z', x + ph * 30, y - ph * 70, s * (.8 + .6 * ph), PAL.cream, { alpha: Math.sin(ph * Math.PI), rot: -.2 });
    }
  }
  function napping(t) {
    NAP.forEach((m, i) => {
      const hitT = T_DOOR + .05 + i * .04, p = seg(t, hitT, hitT + .45), breath = Math.sin(t * 2.3 + i * 2.1);
      const [lx, lrot, ldy] = m.lie, x = lerp(m.x, lx, easeOut(p)), y = 797 + (i === 1 ? 15 : 9) * p;
      noisy(x, y, NU, { kind: m.kind, seed: i, rot: lerp(m.rot, lrot, backOut(p)), dy: -Math.sin(p * Math.PI) * 2.4 + ldy * ease(p),
        sq: .045 * breath, eyes: 'closed', mouth: i === 1 && breath > .3 ? 'O' : 'flat', aL: -.8, aR: -.8, noShadow: p > 0 && p < 1 });
      if (i !== 1) snore(x + (i ? 24 : -14), y - 95 + 25 * p, 22, t, i);
    });
    const age = t - (T_DOOR + .45);                                               // dust as they land
    if (age > 0 && age < .6) for (let k = 0; k < 4; k++) {
      const r = 18 + age * 70;
      paint(ellPts(1340 + k * 60 + (k - 1.5) * age * 60, 804 - age * 20, r, r * .6, 10), { fill: '#FFF1DC', fillOp: 120 * (1 - age / .6), bleed: .2, tex: .3, ink: null });
    }
  }

  // ---------- Xiaoye's morning ----------
  function kidPos(t) {
    if (t < T_HOP) return [1438, 782, 0];
    if (t < T_LAND) { const p = seg(t, T_HOP, T_LAND); return [lerp(1438, 1262, ease(p)), lerp(782, 806, p), -Math.sin(p * Math.PI) * 4.8]; }
    const w = bpOf(t) - 124, d = w < 1 ? 40 * w * w : 80 * (w - .5);
    return [1262 - d, 806, 0];
  }
  const KID_KEYS = [[T_DOOR, 'normal'], [B(121.4), 'closed'], [B(122.8), 'look'], [T_LAND, 'happy', 'music']];
  function kid(t) {
    if (t < T_DOOR + .08) return;                                                // still behind the door
    const bp = bpOf(t), [x, y, hop] = kidPos(t), o = { dy: hop, sq: 0, aL: -1.2, aR: -1.2, mouth: 'smile', lookX: -.3, lookY: .9, ...mood(t, KID_KEYS) };
    o.aR = lerp(.15, -1.2, ease(seg(t, T_DOOR + .15, B(121.4))));                 // the push that flung the door open
    const st = ease(seg(t, B(121.4), B(121.95))) * (1 - ease(seg(t, B(122.4), B(122.8))));
    if (st > 0) { o.aL = o.aR = lerp(-1.2, .88, st); o.sq = -.13 * st; o.dy = -.25 * st; o.rot = .03 * Math.sin(t * 9) * st; if (st > .4) o.mouth = 'O'; }   // higher than ~1 hides the hands behind his head
    if (t >= B(122.8) && t < T_HOP) { o.sq = .14 * ease(seg(t, B(122.8), T_HOP)); o.mouth = 'cat'; o.aL = o.aR = -1.0; }
    if (t >= T_HOP && t < T_LAND) { const p = seg(t, T_HOP, T_LAND); o.sq = -.1 * Math.sin(p * Math.PI); o.aL = o.aR = .35; o.mouth = 'o'; }
    if (t >= T_LAND) {
      const age = t - T_LAND, go = seg(bp, 124, 124.6), s1 = Math.sin(bp * Math.PI);
      o.sq = .22 * Math.exp(-age * 9); o.walk = bp / 2; o.dy = -Math.abs(s1) * .6 * go;
      o.aL = -1.15 + .35 * s1 * go; o.aR = -1.15 - .35 * s1 * go; o.mouth = 'smile'; o.glow = .6 * pulse(t, 4);
      const wv = ease(seg(t, B(124.15), B(124.5))) * (1 - ease(seg(t, B(125.5), B(125.9))));
      if (wv > 0) { o.aL = lerp(o.aL, .75 + .3 * Math.sin((t - B(124.15)) * 17), wv); o.mouth = 'grin'; }
    }
    xiaoye(x, y, XU, o);
  }
  // the word-spirits hop out of the doorway after him and follow him like ducklings, one hop per beat
  function spirit(t, k) {
    const t0 = B(121.8) + k * .2, lag = .5 + k * .3, [px, py, hop] = kidPos(t - lag);
    const spread = (k - 2) * 24 * (1 - seg(t - lag, T_HOP, T_LAND)), bf = frac(bpOf(t) + k * .2);
    ziling(px + spread + 8, py, ZU * backOut(seg(t, t0, t0 + .3)), { dy: hop * XU / ZU - Math.sin(bf * Math.PI) * 2.2, sq: .25 * Math.max(0, 1 - bf * 5),
      seed: k, glyph: k, eyes: k % 2 ? 'happy' : 'normal', glow: .9 });
  }

  // ---------- the title sign pops off in the sunlight ----------
  const signAt = t => t < T_SIGN - .22 ? .9 + .1 * pulse(t, 4) : t < T_SIGN ? (Math.floor(t * 18) % 2 ? .25 : 1) : 0;
  function signPop(t) {
    const age = t - T_SIGN;
    if (age < 0 || age > .35) return;
    const k = 1 - age / .35;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI * .9 + i * Math.PI * .8 / 6, r0 = 175 + age * 160, cx = 1420, cy = 485;
      inkLine([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .45], [cx + Math.cos(a) * (r0 + 40 * k), cy + Math.sin(a) * (r0 + 40 * k) * .45]], 2 * k + .4, PAL.ink, 'ink', 0);
    }
    paint(starPts(1575, 452, 34 * backOut(age / .12) * k, .35, 4), { wash: PAL.cream, fill: '#FF9ACB', fillOp: 90, ink: PAL.ink, sw: .7 });
  }

  // =================================================================================================
  // 75.974 · Sunrise over the crossing, framed like the opening
  // =================================================================================================
  function sunrise(t, lt, dur) {
    const e = ease(lt / dur), hit = t > T_GREEN ? Math.exp(-(t - T_GREEN) * 7) : 0;
    camBegin(lerp(960, 925, e), lerp(540, 528, e), lerp(1, 1.05, e) + .018 * hit, 0);
    const dawn = lerp(.8, 1, ease(seg(t, T0, B(119)))), sy = sunY(t);
    const L = streetBack(t, { dawn, wake: wakeAt(t), sun: sunK(sy), sign: signAt(t), onAir: 1 });
    const S = L.sun;
    sunLight(S, t, ease(seg(sy, 470, 380)));
    sunSpirits(S, t, ease(seg(sy, 405, 372)));
    stretchArms(t, dawn);
    traffic(t, L);
    napping(t);
    const g = seg(t, T0, T0 + 2);                                                  // the gold gathers back into the sun
    if (g < 1) for (const [rk, op] of [[1, .45], [.6, .75], [.34, 1]]) {
      const R = lerp(1700, 330, easeOut(g)) * rk;
      paint(ellPts(S[0], S[1], R, R * .92, 22), { fill: GOLD, fillOp: 190 * op * (1 - easeIn(g)), bleed: .12, tex: .2, border: .15, ink: null });
    }
    camEnd();
    flushLetters();
    flash(1 - ease(seg(t, T0 + .05, T0 + .75)), GOLD);
  }

  // =================================================================================================
  // 81.31 · Out of the door, over the monsters, into the morning; back to the opening framing, fade to paper
  // =================================================================================================
  function morning(t, lt, dur) {
    const push = seg(t, T_DOOR, T_HOP), back = ease(seg(t, T_HOP, B(126.3))), kick = t > T_DOOR ? Math.exp(-(t - T_DOOR) * 9) : 0;
    const [shx, shy] = shakeXY(t, 9 * kick);
    camBegin(lerp(1368 - 18 * push, 960, back) + shx, lerp(646 - 8 * push, 540, back) + shy, lerp(1.62 + .06 * push, 1, back), 0);
    const L = streetBack(t, { dawn: 1, wake: 1, sun: sunK(sunY(t)), sign: signAt(t), door: easeOut(seg(t, T_DOOR, T_DOOR + .2)), onAir: t < T_DOOR + .25 ? 1 : 0 });
    sunLight(L.sun, t, 1);
    sunSpirits(L.sun, t, 1);
    traffic(t, L);
    signPop(t);
    const [, ky] = kidPos(t), actors = [[805, () => napping(t)], [ky + .5, () => kid(t)]];   // back to front by ground line
    for (let k = 0; k < 5; k++) if (t >= B(121.8) + k * .2) actors.push([kidPos(t - .5 - k * .3)[1] - .1 * k, () => spirit(t, k)]);
    actors.sort((a, b) => a[0] - b[0]).forEach(a => a[1]());
    camEnd();
    flushLetters();
    flash(ease(seg(t, FADE0, FADE1)), PAL.paper);
  }

  chapter("dawn", 75.974, DUR + 1, [[75.974, sunrise], [T_DOOR, morning]]);
})();
