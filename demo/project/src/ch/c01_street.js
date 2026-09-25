// c01_street: 1 · The 2 am street → the studio (0–22.641). Storyboard § 1 · night indigo, signal red and green, desk-lamp ochre.
//   nightOpen  0–6          crane down out of the night onto the opening composition (streetBack, camera 960,540 zoom 1, 灯灯 u 26 at
//                           `light`; chapter 5 pulls back to it): the city snores in nightcaps, the neon title stutters on with the beat,
//                           灯灯 does one enormous yawn, 小夜 strolls in from the left
//   hello      6–11.96      tracking: he nods along to his headphones and waves; 灯灯 looks both ways and sneaks him a green wink
//   overhead   11.96–14.17  high angle: the red light is the only light on the street; the clock tower ticks onto two; he pats the
//                           pole, it nods off
//   slam       14.17–17.06  the day's noise chases him; he slams the studio door on the beat; the noise splats on it, then sits down
//                           on the step to wait; the camera pushes into the keyhole
//   drums      17.06–19.67  through the keyhole: nodding off at the mic; a cutaway of his headphone cup where the drum kids whack the
//                           driver on the beat, every hit knocking his eyelids open; he shakes it off and stands up straight
//   words      19.67–22.641 the paper balls glow, the unheard words peek out, he cups a warm one, the rest circle him and pour into the
//                           mic; the last one in clicks its ON ring on, white flash (chapter 2 opens in it)
// Street scale: 小夜 u 17 (the studio door is 220 px tall). Studio scale: 小夜 u 38 beside mic(760, 830, 1).
(() => {
  const B = n => OFF + n * BEAT;   // B(1) 1.31 · B(5) 3.97 · B(9) 6.64 · B(13) 9.31 · B(17) 11.97 · B(21) 14.64 · B(25) 17.31 · B(29) 19.97 · B(33) 22.64
  const U = 17, DU = 26, SU = 38;
  const MIC = [760, 830], CAP = [760, 350];            // studioBack().mic, and the capsule centre of mic(…, 1)
  const DOOR_TEAL = '#2A6C73';
  const glow = (x, y, rx, ry, col, op, bl = .3) => { if (op > 1) paint(ellPts(x, y, rx, ry, 18), { fill: col, fillOp: op, bleed: bl, tex: .2, border: .1, ink: null }); };
  const since = (t, hits) => { let a = 9; for (const h of hits) if (t >= h) a = t - h; return a; };

  // the neon title stutters on with the beat through bar 2, then stays lit, breathing on the beat
  const FLICK = [[B(3), .5, 16], [B(3) + .1, .3, 20], [B(4), .8, 10], [B(4) + .09, .2, 18], [B(4) + .19, .7, 8], [B(5), 1, 3.5], [B(5.5), .75, 5]];
  const signAt = t => { if (t >= B(6)) return .85 + .15 * pulse(t, 5); let v = 0; for (const [a, k, d] of FLICK) if (t >= a) v = Math.max(v, k * Math.exp(-(t - a) * d)); return v; };

  // 小夜 strolling to the beat: a step and a nod on every beat, arms swinging low, headphones throbbing
  function strollPose(t) {
    const bp = bpOf(t), s1 = Math.sin(bp * Math.PI);
    return { walk: bp / 2, dy: -Math.abs(s1) * .45, sq: .05 * pulse(t, 8), rot: .03 * s1, aL: -1.15 + .3 * s1, aR: -1.15 - .3 * s1, glow: .4 * pulse(t, 4) };
  }

  // =====================================================================================================================
  // 1 · Out of the night (0–6): crane down from the stars onto the sleeping street.
  const HI_STARS = Array.from({ length: 22 }, (_, i) => [hash(i + 300) * 2400 - 250, -1180 + hash(i + 340) * 760, 4 + 6 * hash(i + 380)]);
  const WISPS = [[640, -820, 520, 42], [1820, -900, 460, 38], [-80, -1010, 400, 34]];
  function highSky(t) {                                 // the night above streetBack's sky, which stops at y -400
    paint(rectPts(-520, -1600, W + 1040, 1300), { wash: NIGHT.skyBot, fill: NIGHT.skyTop, fillOp: 220, bleed: .2, tex: .35, border: .3, ink: null });
    HI_STARS.forEach(([x, y, r], i) => { const k = .55 + .45 * Math.sin(t * 2.4 + i * 1.9); paint(starPts(x, y, r, .4, 4), { wash: PAL.cream, washOp: 255 * k, ink: null }); });
    for (const [x, y, rx, ry] of WISPS) glow(x + t * 9, y, rx, ry, '#46508E', 60, .2);
  }
  // a moonlit cloud bank the camera sinks through; its body is opaque and covers y -400, where the two skies meet
  const PUFFS = Array.from({ length: 17 }, (_, i) => [-760 + i * 205 + hash(i + 500) * 70, 50 + 90 * hash(i + 520)]);   // x, billow height
  const bankTop = dx => { const p = []; for (let x = -780; x <= W + 780; x += 40) { let h = 16; for (const [px, r] of PUFFS) { const q = (x - dx - px) / (1.3 * r); if (q * q < 1) h = Math.max(h, r * Math.sqrt(1 - q * q)); } p.push([x, -440 - h]); } return p; };
  const LOOSE = [[300, -300, 1], [1700, -285, 1.15], [-40, -330, .85], [1420, -540, .8], [640, -720, .65], [2000, -640, .7]];   // x, y, size
  const LOBES = [[-70, 8, 82, 34], [0, -12, 104, 50], [82, 6, 78, 34]];
  function cloudBank(t) {
    const dx = t * 8, top = bankTop(dx), bot = [];
    for (let x = W + 780; x >= -780; x -= 80) bot.push([x, -358 + 14 * Math.abs(Math.sin((x - dx) * .013 + 1))]);   // soft scalloped underside
    paint([...top, ...bot], { wash: '#2D3771', fill: '#3B4686', fillOp: 110, bleed: .03, tex: .7, border: .2, ink: null, curv: .4 });
    paint([...top, ...top.slice().reverse().map(([x, y]) => [x, y + 42])], { fill: '#7C88CC', fillOp: 90, bleed: .04, tex: .5, border: .5, ink: null, curv: .4 });   // moonlit tops
    paint([...bot, ...bot.slice().reverse().map(([x, y]) => [x, y - 30])], { fill: '#26306A', fillOp: 60, bleed: .05, tex: .5, border: .1, ink: null, curv: .4 });   // shaded underside
    inkLine(top, 1.2, '#B4BEF0', 'inkfine', .4);        // moonlit rim
    for (const [x0, y0, s] of LOOSE) {                  // loose billows around the bank
      const x = x0 + t * 14 * s;
      for (const [ox, oy, rx, ry] of LOBES) paint(ellPts(x + ox * s, y0 + oy * s, rx * s, ry * s, 18), { wash: '#2D3771', fill: '#3B4686', fillOp: 100, bleed: .03, tex: .6, ink: null });
      for (const [ox, oy, rx, ry] of LOBES) paint(ellPts(x + ox * s, y0 + (oy - ry * .4) * s, rx * .78 * s, ry * .45 * s, 14), { fill: '#7C88CC', fillOp: 80, bleed: .04, tex: .5, ink: null });
      for (const [ox, oy, rx, ry] of LOBES) { const arc = []; for (let k = 0; k <= 6; k++) { const a = Math.PI + .35 + k / 6 * (Math.PI - .7); arc.push([x + (ox + Math.cos(a) * rx) * s, y0 + (oy + Math.sin(a) * ry) * s]); } inkLine(arc, 1, '#B4BEF0', 'inkfine', .5); }
    }
  }
  const yawnFace = (k, t) => (u, sw) => {               // 灯灯's jaw drops into a yawn (k 0..1): the box stretches down and a big mouth opens in it
    if (k < .03) return;
    const by = -6.9 * u + .95 * u * k, my = (-7.67 * u + by) / 2, rx = (.55 + .6 * k) * u, ry = (.15 + .56 * k) * u;
    paint(rrPts(-2.1 * u, -7.7 * u, 4.2 * u, by + 7.7 * u, .9 * u), { wash: DD.col, ink: null });
    paint(rectPts(-2 * u, by - .72 * u, 4 * u, .62 * u), { fill: DD.dk, fillOp: 110, bleed: .03, tex: .7, border: .5, ink: null });
    inkLine([[-2.1 * u, -7.8 * u], [-2.1 * u, by - .8 * u], [-1.55 * u, by - .04 * u], [0, by], [1.55 * u, by - .04 * u], [2.1 * u, by - .8 * u], [2.1 * u, -7.8 * u]], sw, PAL.ink, 'ink', .45);
    paint(ellPts(0, my, rx, ry, 18), { wash: '#3E1522', ink: PAL.ink, sw: sw * .8 });
    if (k > .3) paint(ellPts(0, my + ry * .52, rx * .55, ry * .34, 12), { wash: '#F07A92', ink: null });
    const tk = seg(t, 4.8, 5.3);                        // a tear squeezed out of the red lamp
    if (k > .6 && tk > 0 && tk < 1) { const x = 1.3 * u, y = lerp(-11.4, -10.2, tk) * u; paint([[x, y - .38 * u], [x + .22 * u, y + .04 * u], [x, y + .24 * u], [x - .22 * u, y + .04 * u]], { wash: PAL.sky, fill: '#FFFFFF', fillOp: 70, ink: PAL.ink, sw: sw * .45, curv: .7 }); }
  };
  function nightOpen(t, lt, dur) {
    const k = ease(seg(t, 0, 4.7)), z = lerp(.84, 1, k) + .008 * seg(t, 4.7, 6), cy = lerp(-560, 540, k), cx = lerp(1060, 960, k);
    camBegin(cx, cy, z, 0);
    const top = cy - 540 / z;
    if (top < -390) highSky(t);
    const ss = seg(t, B(1) - .12, B(1) + .4);           // a shooting star on the first downbeat
    if (ss > 0 && ss < 1) {
      const P = f => [lerp(160, 1180, f), lerp(-960, -660, f)], h = P(easeOut(ss)), tl = P(easeOut(Math.max(0, ss - .3)));
      inkLine([tl, [(tl[0] + h[0]) / 2, (tl[1] + h[1]) / 2], h], 2.2 * (1 - ss * .7), PAL.cream, 'ink', 0);
      paint(starPts(h[0], h[1], 16 * (1 - ss * .5), .35, 4), { wash: PAL.cream, ink: null });
    }
    const L = streetBack(t, { sign: signAt(t), onAir: 0 });
    if (top < -220) cloudBank(t);
    // 灯灯 dozes at the corner, then one enormous yawn (jaw drops, arms up, stretched tall, trembling), snaps shut on B(7), smacks
    const yk = ease(seg(t, 4.25, 4.8)) * (1 - easeIn(seg(t, 5.12, B(7)))), sm = t > B(7) ? .12 * Math.exp(-(t - B(7)) * 8) * Math.cos((t - B(7)) * 30) : 0;
    const dm = mood(t, [[0, 'sleepy'], [4.3, 'closed'], [5.42, 'sleepy', 'zzz'], [5.78, 'look']]);
    glow(L.light[0], L.ground + 12, 210, 44, DD.red, 70, .2);
    dengdeng(L.light[0], L.ground, DU, { ...dm, light: 'red', lookX: -1, lookY: .2, mouth: 'flat', glow: .85 + .15 * Math.sin(t * 1.7),
      dy: -.3 * yk, sq: -.13 * yk + sm, rot: -.045 * yk + .012 * Math.sin(t * 1.3), aL: lerp(-.7, 1.35, yk) + .06 * Math.sin(t * 34) * yk, aR: lerp(-.7, 1.4, yk) - .06 * Math.sin(t * 31) * yk, draw: yawnFace(yk, t) });
    const ba = t - B(7);                                // the last of the yawn, puffed out
    if (ba > 0 && ba < .8) glow(L.light[0] + 22 + ba * 50, L.ground - 7.3 * DU - ba * 90, 16 + 30 * ba, 11 + 20 * ba, PAL.cream, 110 * (1 - ba / .8), .25);
    // 小夜 strolls in from the left
    if (t > 4.95) xiaoye(lerp(-110, 60, seg(t, 4.95, 6)), L.ground, U, { ...strollPose(t), eyes: 'happy', mouth: 'smile' });
    camEnd();
    flash(.8 * (1 - ease(seg(t, 0, 1.1))), '#10143A');   // out of the night: frame 0 is the top of the crane, stars just showing
  }

  // =====================================================================================================================
  // 2 · Hello (6–11.96): tracking 小夜 up to the corner; 灯灯 checks both ways and gives him one beat of green.
  const GREEN = [B(15), B(16)];                          // 10.64–11.31
  function hello(t, lt, dur) {
    const e = ease(lt / dur), X = t < 8.3 ? lerp(60, 420, (t - 6) / 2.3) : lerp(420, 452, easeOut(seg(t, 8.3, 8.72)));
    camBegin(lerp(330, 522, ease(seg(t, 6, 9.2))) + 14 * e, lerp(600, 588, e), lerp(1.45, 1.62, e), 0);
    const L = streetBack(t, { sign: signAt(t), onAir: 0 }), lx = L.light[0], gy = L.ground;
    const gk = t >= GREEN[0] && t < GREEN[1] ? 1 - seg(t, GREEN[1] - .12, GREEN[1]) : 0;
    glow(lx, gy + 14, 250, 48, DD.red, 70 * (1 - gk), .2);
    if (gk > 0) glow((lx + X) / 2, gy + 16, 360, 62, DD.green, 130 * gk, .2);
    // 灯灯: dozing → notices him → waves back → looks left, right → green and a wink → red again
    const look = t < B(13) ? -.6 : t < B(13.5) ? -1 : t < B(14) ? 1 : -.7;
    const dm = mood(t, [[6, 'sleepy'], [8.25, 'normal', '!'], [B(13), 'look'], [GREEN[0], 'happy', 'spark'], [GREEN[1], 'normal'], [11.5, 'sleepy']]);
    const cheer = gk > 0 ? backOut(seg(t, GREEN[0], GREEN[0] + .25)) : 0, peek = ease(seg(t, B(13) - .1, B(13) + .08)) * (1 - ease(seg(t, B(14), B(14) + .2)));
    dengdeng(lx, gy, DU, { ...dm, light: gk > 0 ? 'green' : 'red', lookX: look, lookY: .1, blush: gk > 0,
      mouth: gk > 0 ? 'grin' : t > B(14) && t < GREEN[0] ? 'smile' : 'flat',
      dy: -.5 * peek - .45 * cheer, rot: -.05 * peek * look + .01 * Math.sin(t * 1.3), sq: gk > 0 ? -.12 * Math.exp(-(t - GREEN[0]) * 5) : 0,
      aL: gk > 0 ? lerp(-.7, 1.25, cheer) : t > 8.6 && t < 9.5 ? .45 + .35 * Math.sin((t - 8.6) * 11) : -.7, aR: gk > 0 ? lerp(-.7, 1.25, cheer) : -.7 });
    // 小夜: strolls in nodding to the beat, waves, watches it look around, and jumps for his green light
    const walking = t < 8.72, bp = bpOf(t), s1 = Math.sin(bp * Math.PI), swing = walking ? 1 : .6;
    const wave = ease(seg(t, 8.45, 8.7)) * (1 - ease(seg(t, 9.35, 9.6)));
    const yay = t >= GREEN[0] ? backOut(seg(t, GREEN[0], GREEN[0] + .22)) * (1 - ease(seg(t, GREEN[1], GREEN[1] + .3))) : 0, hop = seg(t, GREEN[0], GREEN[0] + .4);
    const xm = mood(t, [[6, 'happy'], [8.35, 'normal'], [B(12), 'happy'], [B(13), 'look'], [GREEN[0], 'spark', 'heart'], [GREEN[1], 'happy', 'music']]);
    xiaoye(X, gy, U, { ...xm, lookX: look * .8, lookY: -.3, walk: walking ? bp / 2 : null,
      mouth: wave > .1 || t > GREEN[0] ? 'grin' : 'smile', blush: wave > .1 || t > GREEN[0],
      dy: (hop > 0 && hop < 1 ? -2.4 * Math.sin(hop * Math.PI) : 0) - Math.abs(s1) * (walking ? .45 : .3),
      sq: .05 * pulse(t, 8) + (hop >= 1 && t < GREEN[0] + .8 ? .22 * Math.exp(-(t - GREEN[0] - .4) * 9) : 0), rot: .03 * s1,
      aL: lerp(-1.15 + .3 * s1 * swing, 1.3, yay), aR: lerp(lerp(-1.15 - .3 * s1 * swing, 1.15 + .3 * Math.sin((t - 8.45) * 15), wave), 1.3, yay),
      glow: .4 * pulse(t, 4) + .6 * yay });
    if (gk > 0) glow(X, gy - 6.5 * U, 4.2 * U, 6.5 * U, DD.green, 45 * gk, .25);    // lit up green
    camEnd();
  }

  // =====================================================================================================================
  // 3 · From above (11.96–14.17): the whole street dark but the red light; the clock tower ticks onto two; pat, pat, nod off.
  const OHB = [[-300, 330, 150, 72, 0, 0], [50, 250, 196, 64, 1, '#C94F8E'], [320, 290, 132, 74, 0, 0], [630, 240, 174, 62, 1, '#3FC1C9'],
    [890, 310, 124, 72, 0, PAL.ochre], [1220, 150, 162, 60, 0, 0], [1600, 290, 184, 66, 1, '#C94F8E'], [1910, 360, 146, 72, 0, 0]];   // x, w, facade h, roof depth, face, nightcap
  const TW = [1385, 1575, -40], CLK = [1480, 64];
  const PATS = [B(19), B(19.5)], NODS = [B(19) + .06, B(19.5) + .06, B(20)];
  function capLying(x, y, s, col, rot) {                 // a nightcap slumped on a roof
    push(); translate(x, y); rotate(rot);
    paint([[-24 * s, 0], [24 * s, 0], [8 * s, -40 * s]], { wash: col, ink: PAL.ink, sw: .8 });
    paint(rectPts(-26 * s, -4 * s, 52 * s, 8 * s), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    paint(ellPts(8 * s, -42 * s, 7 * s, 7 * s, 8), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    pop();
  }
  function fromAbove(t) {
    // rooftops receding beyond the row
    paint(rectPts(-600, -700, W + 1200, 1000), { wash: '#161A3C', fill: '#232A58', fillOp: 90, bleed: .05, tex: .6, border: .3, ink: null });
    for (let i = 0; i < 15; i++) {
      const x = -520 + i * 200 + hash(i + 70) * 60, y = -30 + hash(i + 71) * 70, w = 120 + hash(i + 72) * 60;
      paint([[x + 14, y - 44], [x + w - 14, y - 44], [x + w, y], [x, y]], { wash: '#2C3466', ink: '#141838', sw: .7 });
    }
    // the facades across the street, foreshortened, their roofs seen from above
    for (const [x, w, h, d, face, cap] of OHB) {
      const top = 330 - h, cx = x + w / 2;
      paint([[x + w * .07, top - d], [x + w * .93, top - d], [x + w, top], [x, top]], { wash: '#434C86', fill: '#5A64A2', fillOp: 45, tex: .5, ink: PAL.ink, sw: 1 });
      paint(rectPts(x, top, w, h, 1.5), { wash: '#262D5E', fill: '#1C2250', fillOp: 70, tex: .5, border: .3, ink: PAL.ink, sw: 1.1 });
      const cols = Math.max(2, Math.floor(w / 52));
      for (let r = face ? 1 : 0; r < 2; r++) for (let c = 0; c < cols; c++) paint(rectPts(x + (c + .5) * w / cols - 9, top + 24 + r * h * .45, 18, 22), { wash: '#151938', ink: null });
      if (face) {                                        // asleep
        const ey = top + 34, ex = Math.min(w * .2, 34), sn = .5 + .5 * Math.sin(t * 2.2 + x);
        for (const s of [-1, 1]) inkLine([[cx + s * ex - 12, ey], [cx + s * ex, ey + 7], [cx + s * ex + 12, ey]], 1.1, '#A9A4D6', 'ink', .4);
        paint(ellPts(cx, ey + 28, 5 + 3 * sn, 6 + 3 * sn, 10), { wash: '#10142E', ink: '#A9A4D6', sw: .5 });
        for (let k = 0; k < 2; k++) { const ph = frac(t * .6 + hash(x) + k * .5); letter('z', cx + 20 + ph * 40, top - d - 6 - ph * 70, 16 + 14 * ph, PAL.cream, { alpha: Math.sin(ph * Math.PI) * .9, rot: -.2 }); }
      }
      if (cap) capLying(x + w * .66, top - d * .45, 1, cap, -.5);
    }
    // the clock tower, ticking onto two
    const [t0, t1, tt] = TW, mid = (t0 + t1) / 2;
    paint([[mid, tt - 210], [t1 - 30, tt - 66], [t0 + 30, tt - 66]], { wash: '#3A4380', fill: '#5A64A2', fillOp: 40, tex: .5, ink: PAL.ink, sw: 1 });
    paint([[t0 + 14, tt - 66], [t1 - 14, tt - 66], [t1, tt], [t0, tt]], { wash: '#434C86', ink: PAL.ink, sw: 1 });
    paint(rectPts(t0, tt, t1 - t0, 330 - tt, 1.5), { wash: '#2A3164', fill: '#1C2250', fillOp: 70, tex: .5, border: .3, ink: PAL.ink, sw: 1.2 });
    for (const yy of [210, 270]) for (const xx of [t0 + 40, t1 - 58]) paint(rectPts(xx, yy, 18, 30), { wash: '#151938', ink: null });
    const [kx, ky] = CLK, tick = backOut(seg(t, B(18), B(18) + .16)), am = -Math.PI / 2 - (1 - tick) * TAU / 30, ah = -Math.PI / 6;
    paint(ellPts(kx, ky, 84, 76, 24), { wash: '#39407A', ink: PAL.ink, sw: 1.2 });
    paint(ellPts(kx, ky, 72, 65, 24), { wash: '#EBDDBA', fill: '#C9B98E', fillOp: 55, tex: .5, ink: PAL.ink, sw: 1.1 });
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; inkLine([[kx + Math.cos(a) * 56, ky + Math.sin(a) * 51], [kx + Math.cos(a) * 66, ky + Math.sin(a) * 60]], i % 3 ? .5 : 1, PAL.ink, 'inkfine', 0); }
    inkLine([[kx, ky], [kx + Math.cos(ah) * 36, ky + Math.sin(ah) * 33]], 2.4, PAL.ink, 'ink', 0);
    inkLine([[kx, ky], [kx + Math.cos(am) * 54, ky + Math.sin(am) * 50]], 1.6, PAL.ink, 'ink', 0);
    paint(ellPts(kx, ky, 6, 6, 8), { wash: PAL.ink, ink: null });
    const da = t - B(18);                                // bong
    if (da > 0 && da < .9) for (let r = 0; r < 3; r++) { const rr = 96 + (da - r * .14) * 260; if (rr > 96) paint(ellPts(kx, ky, rr, rr * .9, 28), { ink: PAL.cream, sw: 1.3 * (1 - da / .9), br: 'inkfine' }); }
    flushLetters();                                       // the zzz belong to the rooftops
    // far pavement, the curb, the road with its crossing, the near pavement
    paint([[-600, 330], [W + 600, 330], [W + 600, 480], [-600, 480]], { wash: '#2E3058', fill: '#23264A', fillOp: 70, bleed: .04, tex: .7, border: .3, ink: PAL.ink, sw: 1 });
    paint([[-600, 480], [W + 600, 480], [W + 600, 500], [-600, 500]], { wash: '#4A4E7E', ink: PAL.ink, sw: .9 });
    paint([[-600, 500], [W + 600, 500], [W + 600, 1500], [-600, 1500]], { wash: '#1E1E3A', fill: '#15152C', fillOp: 70, bleed: .04, tex: .7, border: .3, ink: PAL.ink, sw: 1 });
    for (let i = 0; i < 7; i++) { const xb = 300 + i * 78, xt = lerp(xb, 960, .16); paint([[xt, 512], [xt + 40, 512], [xb + 48, 990], [xb, 990]], { wash: '#77739A', washOp: 220, ink: null }); }
    for (let x = -500; x < W + 500; x += 250) if (x < 200 || x > 900) paint(rectPts(x, 760, 120, 14, 1), { wash: '#8E8AA8', washOp: 170, ink: null });
    paint([[-600, 1020], [W + 600, 1020], [W + 600, 1500], [-600, 1500]], { wash: '#2E3058', fill: '#23264A', fillOp: 70, bleed: .04, tex: .7, border: .3, ink: PAL.ink, sw: 1 });
    // a street lamp, switched off
    paint(rectPts(1128, 200, 12, 268, 1), { wash: '#2E3358', ink: PAL.ink, sw: .8 });
    paint(rrPts(1098, 180, 72, 30, 10), { wash: '#2E3358', ink: PAL.ink, sw: .8 });
    paint(ellPts(1134, 208, 20, 7, 10), { wash: '#55597A', ink: null });
  }
  const patArm = t => {                                  // 小夜's right hand: lift, pat on the beat, lift, pat, rest
    const a0 = t - PATS[0], a1 = t - PATS[1];
    if (a0 < -.35) return -1.15;
    if (a0 < -.15) return lerp(-1.15, .8, ease(seg(a0, -.35, -.15)));
    if (a0 < 0) return lerp(.8, 0, easeIn(seg(a0, -.15, 0)));
    if (a1 < -.15) return lerp(0, .75, ease(seg(a0, .05, .18)));
    if (a1 < 0) return lerp(.75, 0, easeIn(seg(a1, -.15, 0)));
    return lerp(0, -1.15, ease(seg(a1, .25, .55)));
  };
  const lampTop = (u, sw) => paint(ellPts(0, -13.55 * u, 1.75 * u, .42 * u, 16), { wash: DD.lt, fill: DD.col, fillOp: 60, ink: PAL.ink, sw: sw * .6 });   // seen from above
  function overhead(t, lt, dur) {
    const e = ease(lt / dur);
    camBegin(lerp(900, 792, e), 468, lerp(.98, 1.2, e), lerp(-.03, -.008, e));
    fromAbove(t);
    const rp = .85 + .15 * pulse(t, 3);                  // the red light: the only light on the whole street
    glow(705, 300, 280, 190, DD.red, 40 * rp, .2);
    glow(705, 580, 640, 250, DD.red, 60 * rp, .2);
    glow(705, 505, 330, 120, '#FF5A6A', 80 * rp, .2);
    let nod = 0;
    NODS.forEach((n, i) => { const a = t - n; if (a >= 0) nod = Math.max(nod, i < 2 ? Math.sin(Math.min(1, a / .45) * Math.PI) * .7 : easeOut(a / .3)); });
    const dm = mood(t, [[11.96, 'sleepy'], [NODS[2], 'closed', 'zzz']]);
    dengdeng(705, 458, 19, { ...dm, squint: Math.max(dm.squint, .7 * nod), light: 'red', mouth: nod > .5 ? 'wobble' : 'flat', dy: .35 * nod, sq: .1 * nod, rot: .04 * nod + .01 * Math.sin(t * 1.4), aL: -.75, aR: -.75 - .2 * nod, draw: lampTop });
    const xm = mood(t, [[11.96, 'look'], [PATS[0] - .05, 'happy']]), pa = since(t, PATS);
    xiaoye(640, 474, 12.5, { ...xm, lookX: .9, lookY: -1, mouth: 'smile', blush: t > PATS[0], dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .3, aR: patArm(t), aL: -1.15 });
    if (pa < .16) paint(starPts(704, 390, 14 + 16 * (1 - pa / .16), .4, 5, pa * 4), { wash: PAL.cream, ink: null });
    camEnd();
  }

  // =====================================================================================================================
  // 4 · The door (14.17–17.06): the day's noise gives chase; SLAM on the beat; they splat, then sit on the step and wait.
  const NZK = ['horn', 'clock', 'bubble'], NZ0 = [330, 212, 100], NZV = 640, NU = 18;
  const SPLAT = [[B(23) + .04, 1400, 628], [B(23) + .1, 1446, 690], [B(23) + .16, 1404, 742]];   // [time, x, y] of each splat on the door
  const SEAT = [1300, 1362, 1424], PEEL = 16.28, LAND = 16.56, KH = [1478, 700];                // seats stay clear of the keyhole
  function keyholePts(cx, cy, r) {
    const p = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI / 2 + .55 + i / 16 * (TAU - 1.1); p.push([cx + Math.cos(a) * r, cy - .4 * r + Math.sin(a) * r]); }
    p.push([cx + .62 * r, cy + 1.7 * r], [cx - .62 * r, cy + 1.7 * r]);
    return p;
  }
  function leafOver(door) {                             // streetBack's door leaf again, over whoever stands in the doorway
    const dx = 1340, w = 160 * (1 - .85 * door);
    paint([[dx, 562], [dx + w, 562 - 16 * door], [dx + w, 782 + 8 * door], [dx, 782]], { wash: '#2F7F86', fill: '#1F4F56', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.1 });
    if (w > 60) paint(ellPts(dx + w - 22, 676, 8, 8, 10), { wash: PAL.ochre, ink: PAL.ink, sw: .6 });
  }
  function noiseAt(i, t) {                               // [x, y, options] of noise i: chase, leap, splat, slide off, sit and wait
    const [ts, px, py] = SPLAT[i], tl = ts - .24, tp = PEEL + i * .05, tg = LAND + i * .05, base = { kind: NZK[i], seed: i * 2.3 };
    if (t < tl) return [NZ0[i] + NZV * (t - 14.17), 800, { ...base, noise: 1, walk: t * 3.2 + i * .3, dy: -Math.abs(Math.sin(t * 10 + i * 1.3)) * 1.3, rot: .1, eyes: 'angry', mouth: 'O' }];
    if (t < ts) { const k = seg(t, tl, ts), x0 = NZ0[i] + NZV * (tl - 14.17); return [lerp(x0, px, k), lerp(800, py + 44, k) - Math.sin(k * Math.PI) * 80, { ...base, noise: 1, sq: -.22, rot: .35 * k, eyes: 'angry', mouth: 'O', noShadow: k > .3 }]; }
    if (t < tp) { const w = Math.exp(-(t - ts) * 14) * Math.cos((t - ts) * 50); return [px, py + 44, { ...base, sx: 1.6 + .15 * w, sy: .56 - .08 * w, rot: (i - 1) * .12, eyes: 'x', mouth: 'O', noShadow: true }]; }
    if (t < tg) { const k = easeIn(seg(t, tp, tg)); return [lerp(px, SEAT[i], k), lerp(py + 44, 800, k), { ...base, sx: lerp(1.6, 1, k), sy: lerp(.56, 1, k), rot: (i - 1) * .12 * (1 - k) + .12 * Math.sin(k * 8), eyes: 'swirl', mouth: 'O', noShadow: k < .85 }]; }
    const a = t - tg, st = i === 1 && t > B(24) - .1 ? move('stomp', t) : null, up = t > B(24) && t < B(24) + .5;
    return [SEAT[i], 800, { ...base, sq: .28 * Math.exp(-a * 7) * Math.cos(a * 20) + (st ? st.sq : .06), dy: st ? st.dy : 0, rot: st ? st.rot : 0,
      aL: st ? st.aL : -.15, aR: st ? st.aR : -.15, eyes: up ? 'look' : i === 1 ? 'angry' : 'narrow', lookX: .7, lookY: -1, mouth: 'grumpy', noise: i === 1 ? .35 : 0,
      emote: i === 1 ? 'anger' : null, emoteK: seg(a, .3, .5) * (1 - seg(t, 16.72, 16.82)) }];
  }
  function slam(t, lt, dur) {
    const S = B(23), sa = t - S;                          // 15.97: the door slams
    const door = t < 15.12 ? 0 : t < 15.86 ? easeOut(seg(t, 15.12, 15.28)) : 1 - easeIn(seg(t, 15.86, S));
    const ap = ease(seg(t, 14.17, 15.3)), set = ease(seg(t, 16.1, 16.7)), dv = seg(t, 16.72, 17.06), dk = ease(seg(t, 16.7, 17));
    let cx = lerp(930, 1350, ap), cy = 622, z = 1.3;
    const punch = sa >= 0 ? backOut(seg(t, S, S + .14)) : 0;   // the slam punches in on the door so the splats read
    cx = lerp(cx, 1420, punch); cy = lerp(cy, 684, punch); z = lerp(z, 1.78, punch);
    cx = lerp(cx, 1420, set); cy = lerp(cy, 668, set); z = lerp(z, 1.55, set);
    cx = lerp(cx, KH[0], dk); cy = lerp(cy, KH[1], dk); z = lerp(z, 7, easeIn(dv));   // last frame ≈ zoom 6.2: keyhole r ≈ 46 px, where shot 5's iris starts
    const bump = SPLAT.some(([ts]) => t >= ts && t < ts + .1) ? 6 : 0;
    const [sx, sy] = sa >= 0 ? shakeXY(t, 24 * Math.exp(-sa * 7) + bump) : [0, 0];
    camBegin(cx + sx, cy + sy, z, sa >= 0 ? .012 * Math.exp(-sa * 6) * Math.sin(sa * 40) : 0);
    const buzz = sa >= 0 && sa < .3 && hash(Math.floor(t * 24)) > .45 ? .25 : 1;          // the neon title rattles
    const onAir = t < B(24) ? 0 : t < B(24) + .07 ? 1 : t < B(24) + .13 ? .15 : 1;           // recording: do not disturb
    streetBack(t, { sign: signAt(t) * buzz, onAir, door });
    if (door > .02) glow(1420, 800, 170, 30, '#FFD98A', 110 * door, .2);                     // warm light spilling out
    if (sa >= 0) {                                        // lights on inside: glowing keyhole, a line of light under the door
      const kl = ease(seg(t, 16.3, 16.6)), kp = ease(seg(t, 16.62, 17.0));
      glow(KH[0], KH[1] + 2, 26 + 12 * kl + 20 * kp, 30 + 12 * kl + 20 * kp, '#FFD98A', 130 * kl, .2);
      for (let i = 0; i < 6; i++) {                       // light leaking out, drawing the eye in
        const a = i / 6 * TAU + .3 + .1 * Math.sin(t * 2 + i), L = 30 + 50 * kp;
        if (kp > .02) paint([[KH[0], KH[1]], [KH[0] + Math.cos(a - .1) * L, KH[1] + Math.sin(a - .1) * L], [KH[0] + Math.cos(a + .1) * L, KH[1] + Math.sin(a + .1) * L]], { fill: '#FFE9B0', fillOp: 70 * kp, bleed: .1, tex: .2, border: .1, ink: null });
      }
      paint(keyholePts(KH[0], KH[1], 7.5), { wash: mixCol('#1A1426', '#FFE9B0', kl), ink: PAL.ink, sw: .6 });
      if (kl > 0) paint(rectPts(1344, 778, 152, 4), { wash: '#FFD98A', washOp: 220 * kl, ink: null });
    }
    // 灯灯 at the corner gets a fright as the noise tears past
    glow(560, 802, 210, 44, DD.red, 70, .2);
    const dm = mood(t, [[14.17, 'sleepy'], [14.36, 'scared', 'sweat']]);
    dengdeng(560, 790, DU, { ...dm, light: 'red', mouth: t > 14.36 ? 'O' : 'flat', aL: t > 14.36 ? 1.3 + .1 * Math.sin(t * 30) : -.7, aR: t > 14.36 ? 1.3 - .1 * Math.sin(t * 30) : -.7, sq: t > 14.36 ? -.1 * Math.exp(-(t - 14.36) * 6) : 0, rot: -.04 * seg(t, 14.36, 14.6) });
    // 小夜: startled, dashes for the door, ducks in, waves bye-bye — SLAM
    if (t < 15.28) {
      const run = seg(t, 14.28, 15.2), X = lerp(715, 1418, run), running = t >= 14.28 && t < 15.2;
      const xm = mood(t, [[14.17, 'scared', '!'], [14.9, 'scared', 'sweat']]);
      if (running) for (let k = 0; k < 4; k++) inkLine([[X - 64 - k * 12, 750 - k * 42], [X - 180 - k * 34, 750 - k * 42]], .9, PAL.cream, 'inkfine', 0);
      xiaoye(X, 790, U, { ...xm, mouth: 'O', brows: 'worried', glow: .3, rot: running ? .12 : -.06,
        dy: running ? -Math.abs(Math.sin(t * 16)) * .6 : -1.2 * Math.sin(seg(t, 14.17, 14.3) * Math.PI),
        run: running ? t * 2.6 : null, walk: running ? t * 2.6 : null,
        aL: running ? -.4 + .8 * Math.sin(t * 16) : 1.1, aR: running ? -.4 - .8 * Math.sin(t * 16) : 1.1 });
    } else if (t < S) {
      const k = seg(t, 15.28, 15.45);
      xiaoye(lerp(1418, 1432, k), lerp(790, 781, k), lerp(U, 15.5, k), { eyes: 'happy', mouth: 'grin', blush: true, noShadow: true, glow: .3,
        aL: -1.15, aR: t > 15.45 ? 1.2 + .3 * Math.sin((t - 15.45) * 18) : lerp(-1.15, 1.2, k), dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .2 });
      if (door < 1) leafOver(door);
    }
    // the noise: chase, leap, splat, slide off, sit on the step and wait
    for (let i = 0; i < 3; i++) { const [x, y, o] = noiseAt(i, t); noisy(x, y, NU, o); }
    if (sa >= 0 && sa < .3) for (let i = 0; i < 14; i++) {                                  // slam shockwave
      const a = i / 14 * TAU + .1, r0 = 160 + sa * 700, r1 = r0 + 90 * (1 - sa / .3);
      inkLine([[1420 + Math.cos(a) * r0, 672 + Math.sin(a) * r0 * .85], [1420 + Math.cos(a) * r1, 672 + Math.sin(a) * r1 * .85]], 1.4, PAL.cream, 'ink', 0);
    }
    if (sa >= 0 && sa < .8) for (let i = 0; i < 6; i++) {                                   // dust
      const d = easeOut(sa / .8), px = lerp(1320, 1520, i / 5) + (i - 2.5) * 50 * d;
      glow(px, 790 - 30 * d * hash(i), 40 + 50 * d, 26 + 22 * d, '#A09AB8', 140 * (1 - sa / .8), .3);
    }
    for (const [ts, px, py] of SPLAT) {                                                     // splat: a small burst and speed-ring
      const a = t - ts; if (a < 0 || a > .2) continue;
      for (let k = 0; k < 8; k++) { const an = k / 8 * TAU + ts, r0 = 58 + a * 260, r1 = r0 + 22 * (1 - a / .2); inkLine([[px + Math.cos(an) * r0, py + 24 + Math.sin(an) * r0 * .6], [px + Math.cos(an) * r1, py + 24 + Math.sin(an) * r1 * .6]], 1.1, PAL.cream, 'ink', 0); }
    }
    camEnd();
  }

  // =====================================================================================================================
  // 5 · The beat keeps him going (17.06–19.67): in through the keyhole; a cutaway of the headphone cup.
  const HITS = [B(26), B(26.5), B(27), B(27.5)];          // 17.97 18.31 18.64 18.97
  const KICK = [B(26), B(27), B(27.5)], SNARE = [B(26.5), B(27), B(27.5)], UP = B(28);   // 19.31: up straight
  function stickTip(x, y, u, kind, side, a) {             // where a drum kid's stick ends (same transforms as drumkid())
    const ax = (kind === 'kick' ? 2.45 : 2.4) * u, ay = (kind === 'kick' ? -3.4 : -3.3) * u;
    const hx = x + side * (ax + 1.8 * u * Math.cos(a)), hy = y + ay - 1.8 * u * Math.sin(a);
    return [hx + side * 2.05 * u * Math.cos(a - .5), hy - 2.05 * u * Math.sin(a - .5)];
  }
  function strokeA(t, hits, lo, hi) {                     // arm angle: lifted, a fast down stroke onto the beat, a moment on the drum
    let prev = null, next = null; for (const h of hits) { if (h <= t) prev = h; else if (next == null) next = h; }
    const a = prev == null ? 9 : t - prev;
    if (a < .09) return lo;
    if (next != null && next - t < .15) return lerp(hi, lo, easeIn(1 - (next - t) / .15));
    return lerp(lo, hi, easeOut(clamp((a - .09) / .18)));
  }
  function cutaway(t, P, open) {                          // screen space: the cup sliced open beside his head
    const C = [1455, 470], R = 345, Rs = R * open;
    const dx = P[0] - C[0], dy = P[1] - C[1], d = Math.hypot(dx, dy), th = Math.atan2(dy, dx), al = Math.acos(clamp(Rs / d, 0, 1));
    const T1 = [C[0] + Rs * Math.cos(th + al), C[1] + Rs * Math.sin(th + al)], T2 = [C[0] + Rs * Math.cos(th - al), C[1] + Rs * Math.sin(th - al)];
    paint([P, T1, C, T2], { fill: XY.phones, fillOp: 70 * Math.min(1, open), bleed: .08, tex: .3, border: .2, ink: null });
    inkLine([P, T1], 1.2, PAL.ink, 'ink', 0); inkLine([P, T2], 1.2, PAL.ink, 'ink', 0);
    push(); translate(C[0], C[1]); scale(open); translate(-C[0], -C[1]);
    const [cx, cy] = C, Ri = R - 26, ha = since(t, HITS), bu = 1 + .1 * Math.exp(-ha * 14);
    paint(ellPts(cx, cy, R, R, 40), { wash: XY.phones, fill: XY.phonesDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.8 });
    paint(ellPts(cx, cy, Ri, Ri, 40), { wash: '#16353F', fill: '#24525A', fillOp: 80, bleed: .08, tex: .6, border: .5, ink: PAL.ink, sw: 1.2 });
    const dcx = cx, dcy = cy - 10;                        // the driver: the drum they all play
    paint(ellPts(dcx, dcy, 112 * bu, 112 * bu, 26), { wash: '#2E3A56', ink: PAL.ink, sw: 1.1 });
    paint(ellPts(dcx, dcy, 92 * bu, 92 * bu, 26), { wash: '#56607E', fill: '#3A4460', fillOp: 60, tex: .5, ink: PAL.ink, sw: .9 });
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; inkLine([[dcx + Math.cos(a) * 42 * bu, dcy + Math.sin(a) * 42 * bu], [dcx + Math.cos(a) * 88 * bu, dcy + Math.sin(a) * 88 * bu]], .5, '#8E96B0', 'inkfine', 0); }
    paint(ellPts(dcx, dcy, 38 * bu, 38 * bu, 18), { wash: '#A6AEC4', ink: PAL.ink, sw: .8 });
    paint(ellPts(dcx - 12, dcy - 13, 12, 9, 10), { wash: PAL.cream, washOp: 200, ink: null });
    if (ha < .45) for (let r = 0; r < 2; r++) { const rr = 118 + (ha - r * .08) * 480; if (rr > 118 && rr < Ri - 12) paint(ellPts(dcx, dcy, rr, rr, 30), { ink: '#7FE8EE', sw: 1.4 * (1 - ha / .45), br: 'inkfine' }); }
    const fy = cy + 205, a0 = Math.asin(205 / Ri), fl = [];
    for (let i = 0; i <= 12; i++) { const a = a0 + i / 12 * (Math.PI - 2 * a0); fl.push([cx + Math.cos(a) * Ri, cy + Math.sin(a) * Ri]); }
    paint(fl, { wash: '#2A2E4A', fill: '#1C1F36', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1 });
    const ku = 23, su = 24, kx = cx - 150, sx2 = cx + 152, aK = strokeA(t, KICK, .72, 1.45), aS = strokeA(t, SNARE, .72, 1.45);
    const hk = since(t, KICK), hs = since(t, SNARE);
    drumkid(kx, fy + 2, ku, { kind: 'kick', aR: aK, aL: .7 + .5 * Math.sin(bpOf(t) * Math.PI * 2), eyes: hk < .25 ? 'happy' : 'normal', mouth: 'grin', dy: -.5 * Math.abs(Math.sin(bpOf(t) * Math.PI)), sq: .15 * Math.exp(-hk * 12) });
    drumkid(sx2, fy + 2, su, { kind: 'snare', aL: aS, aR: .7 + .5 * Math.sin(bpOf(t) * Math.PI * 2 + 1), eyes: hs < .25 ? 'happy' : 'normal', mouth: 'grin', dy: -.5 * Math.abs(Math.sin(bpOf(t) * Math.PI + .6)), sq: .15 * Math.exp(-hs * 12) });
    for (const [a, x, u, kind, side, aa] of [[hk, kx, ku, 'kick', 1, aK], [hs, sx2, su, 'snare', -1, aS]]) if (a < .16) {
      const tip = stickTip(x, fy + 2, u, kind, side, aa);
      paint(starPts(tip[0], tip[1], 12 + 30 * (1 - a / .16), .38, 6, a * 3), { wash: PAL.cream, fill: '#FFD98A', fillOp: 90, ink: PAL.ink, sw: .6 });
    }
    paint(ellPts(cx, cy, Ri, Ri, 40), { ink: PAL.ink, sw: 1.4 });
    pop();
    if (open > .8 && ha < .16) for (let k = 0; k < 3; k++) {  // the hit travels down the beam to his ear
      const f = easeOut(ha / .16), rr = lerp(d - R * .9, 34, f) + k * 26;
      const arc = []; for (let j = -4; j <= 4; j++) { const a = th + Math.PI + j * .09; arc.push([P[0] + Math.cos(a) * rr, P[1] + Math.sin(a) * rr]); }
      inkLine(arc, 1.6, '#BFF6F8', 'ink', .5);
    }
  }
  function drums(t, lt, dur) {
    const ha = since(t, HITS), hk = ha < .6 ? Math.exp(-ha * 9) : 0, [shx, shy] = shakeXY(t, 8 * hk), k = ease(lt / 2.3);
    camBegin(lerp(742, 716, k) + shx, lerp(470, 462, k) + shy, lerp(1.52, 1.64, k) - .1 * ease(seg(t, UP, 19.67)), 0);
    studioBack(t, {});
    mic(MIC[0], MIC[1], 1, {});
    // 小夜 at the mic: eyelids at war; each hit knocks them open; a head-shake; then up straight, fired up
    const sleepy = t < UP, nod = t < B(26) ? Math.exp(-Math.pow((t - B(25) - .12) / .17, 2)) : 0;
    const shk = seg(t, B(27.5) + .12, UP - .02), sh = shk > 0 && shk < 1 ? Math.sin(shk * 26) * .13 * (1 - shk) : 0;
    const popK = sleepy && ha < .3 ? 1 - ha / .3 : 0, stand = t >= UP ? backOut(seg(t, UP, UP + .25)) : 0;
    let eyes, squint = 0;
    if (!sleepy) eyes = t < UP + .45 ? 'normal' : 'happy';
    else if (shk > 0) eyes = 'swirl';
    else if (popK > 0) eyes = 'scared';
    else { eyes = 'sleepy'; squint = Math.min(1, .25 + .3 * (.5 + .5 * Math.sin(t * 6.5)) + .6 * nod); }
    const dy = sleepy ? .18 + .35 * nod - .25 * popK : -.3 * stand;
    xiaoye(560, 830, SU, { eyes, squint, mouth: !sleepy ? 'grin' : popK > 0 ? 'O' : 'flat', brows: !sleepy ? 'angry' : popK > 0 ? 'up' : null, blush: !sleepy,
      dy, sq: sleepy ? .04 - .16 * popK : -.08 * stand * (1 - seg(t, UP + .25, UP + .5)), rot: sleepy ? .045 * Math.sin(t * 2.1) + .07 * nod + sh : 0,
      aL: sleepy ? -1.3 + .5 * popK : -1.15, aR: sleepy ? -1.3 + .5 * popK : lerp(-1.15, 1.1, stand), glow: .9 * hk + (sleepy ? 0 : .7 + .3 * pulse(t, 4)),
      emote: t < B(26) ? 'zzz' : !sleepy ? 'music' : null, emoteK: t < B(26) ? seg(t, 17.3, 17.5) * (1 - seg(t, B(26) - .15, B(26))) : seg(t, UP + .2, UP + .4) });
    const cup = toScreen(560 + 2.45 * SU, 830 + dy * SU - 9.3 * SU);
    camEnd();
    flushLetters();
    const open = backOut(seg(t, B(25.5), B(25.5) + .3)) * (1 - easeIn(seg(t, 19.08, 19.3)));
    if (open > .01) cutaway(t, cup, open);
    const kr = 50 * Math.pow(30, seg(t, 17.06, 17.38));  // the keyhole we came through: warm light first, then the room
    if (kr < 1400) { flash(1 - ease(seg(t, 17.06, 17.24)), '#FFE9B0'); irisShape(keyholePts(960, 540, kr), DOOR_TEAL); }
  }

  // =====================================================================================================================
  // 6 · Every unheard word is still warm (19.67–22.641): they wake in the paper balls, circle him, pour into the mic.
  const ZN = 7, HELD = 2, ORB = [560, 830 - 6.6 * SU], ON = B(32);   // 21.97: the last word goes in and the ON ring clicks on
  const WORDS = Array.from({ length: ZN }, (_, i) => ({ bx: 204 + (i % 5) * 26 + (i % 2) * 6, pop: 19.76 + i * .12, u: 12 + (i % 3) * 2.5, seed: i * 1.7 + .4,
    r: 178 + (i % 3) * 32, e: .34 + .1 * (i % 2), ph: i / ZN * TAU + .4, dive: 21.38 + i * .045 }));
  const REACH = [384, 514], CATCH = B(30.5), LET_GO = 21.62;
  const orbitAt = (w, t) => { const a = w.ph + (t - 20.8) * 3.3; return [ORB[0] + Math.cos(a) * w.r, ORB[1] + Math.sin(a) * w.r * w.e, Math.sin(a)]; };
  function wordAt(w, i, t) {                              // [x, y, scale, depth] of an unheard word, or null (asleep, in his hands, or gone in)
    if (t < w.pop) return null;
    const pk = backOut(seg(t, w.pop, w.pop + .3)), fx = w.bx + Math.sin(t * 3 + w.seed) * 14, fy = lerp(752, 704, pk) - Math.max(0, t - w.pop - .3) * 120;
    if (i === HELD) {
      if (t < CATCH) { const k = ease(seg(t, w.pop + .4, CATCH - .06)); return [lerp(fx, REACH[0], k), lerp(fy, REACH[1], k), pk, 1]; }
      if (t < LET_GO) return null;
      const k = easeIn(seg(t, LET_GO, ON)); if (k >= 1) return null;
      const hy = 830 - 5.2 * SU - 1.4 * SU;
      return [lerp(560, CAP[0], k), lerp(hy, CAP[1], k) - Math.sin(k * Math.PI) * 60, lerp(1, .45, k), 1];
    }
    const o = orbitAt(w, t), bl = ease(seg(t, w.pop + .5, 20.9 + i * .04));
    let x = lerp(fx, o[0], bl), y = lerp(fy, o[1], bl), s = pk, dp = bl > .5 ? o[2] : 1;
    const k = easeIn(seg(t, w.dive, w.dive + .34));
    if (k >= 1) return null;
    if (k > 0) { x = lerp(x, CAP[0], k); y = lerp(y, CAP[1], k) - Math.sin(k * Math.PI) * 70; s = lerp(1, .4, k); dp = 1; }
    return [x, y, s, dp];
  }
  function drawWord(w, i, t, p) {
    const [x, y, s] = p;
    if (i !== HELD || t < CATCH) {                        // a light trail behind it
      const tr = [.12, .08, .04].map(d => wordAt(w, i, t - d)).filter(q => q);
      if (tr.length > 1 && t > w.pop + .45) inkLine([...tr.map(q => [q[0], q[1] - 1.5 * w.u * q[2]]), [x, y - 1.5 * w.u * s]], 1.3 * s, '#FFD98A', 'inkfine', .5);
    }
    ziling(x, y, w.u * s, { seed: w.seed, glyph: i % 5, eyes: t < w.pop + .25 ? 'closed' : i % 3 === 0 ? 'happy' : 'normal', mouth: 'smile', blush: i % 2 === 0, rot: .15 * Math.sin(t * 5 + i) });
  }
  const binFront = () => paint([[170, 740], [330, 740], [312, 830], [188, 830]], { wash: '#4A5A7A', fill: '#2E3A56', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });   // studioBack's bin, again, over the words peeking out
  const cupped = (t, lift) => (u, sw) => {                // both hands held together in front of his chest, a warm word in them
    const hy = -5.2 * u - lift * 1.4 * u;
    for (const s of [-1, 1]) paint(ellPts(s * .8 * u, hy + .2 * u, .62 * u, .52 * u, 12), { wash: XY.col, fill: XY.dk, fillOp: 50, ink: PAL.ink, sw: sw * .7 });
    if (t < LET_GO) {
      ziling(0, hy + .4 * u, 16, { seed: 7, glyph: 1, eyes: 'happy', mouth: 'smile', blush: true, dy: -.25 * Math.abs(Math.sin(bpOf(t) * Math.PI)) });
      for (let k = 0; k < 3; k++) {                       // still warm: short curls of steam off his palms
        const ph = frac(t * 1.3 + k / 3), x0 = (k - 1) * .75 * u, y0 = hy - .2 * u - ph * 1.1 * u, wv = Math.sin(ph * 6 + k * 2) * .18 * u;
        inkLine([[x0, y0 + .35 * u], [x0 + wv, y0], [x0 - wv, y0 - .35 * u]], sw * 1.1 * Math.sin(ph * Math.PI) + .05, PAL.cream, 'ink', .6);
      }
    }
    for (const s of [-1, 1]) paint(ellPts(s * .42 * u, hy + .35 * u, .6 * u, .44 * u, 12), { wash: XY.skin, ink: PAL.ink, sw: sw * .6 });
  };
  function words(t, lt, dur) {
    const k1 = ease(seg(t, 19.67, 20.9)), k2 = ease(seg(t, 21.55, 22.35));
    let cx = lerp(390, 540, k1), cy = lerp(655, 560, k1), z = lerp(1.5, 1.22, k1);
    cx = lerp(cx, 732, k2); cy = lerp(cy, 400, k2); z = lerp(z, 1.62, k2);
    camBegin(cx, cy, z, 0);
    studioBack(t, { bin: ease(seg(t, 19.72, 20.5)) });
    for (const w of WORDS) { const a = t - w.pop; if (a > -.12 && a < .7) glow(w.bx, 728, 64, 50, '#FFD98A', 170 * (a < 0 ? 1 + a / .12 : Math.exp(-a * 3)), .25); }
    const entered = WORDS.filter((w, i) => i === HELD ? t >= ON : t >= w.dive + .34).length;
    mic(MIC[0], MIC[1], 1, { on: t >= ON ? 1 : 0, glow: entered / ZN });
    const P = WORDS.map((w, i) => wordAt(w, i, t));
    const peeking = (w, p) => p && t < w.pop + .45;
    WORDS.forEach((w, i) => { if (P[i] && P[i][3] < 0) drawWord(w, i, t, P[i]); });     // behind him
    WORDS.forEach((w, i) => { if (peeking(w, P[i])) drawWord(w, i, t, P[i]); });
    if (WORDS.some((w, i) => peeking(w, P[i]))) binFront();
    // 小夜: looks at the glowing bin, wonder, reaches, cups one close (it's warm), offers it up to the mic, fired up
    const reach = t >= B(30) && t < CATCH ? easeOut(seg(t, B(30), B(30) + .22)) : 0, holding = t >= CATCH && t < 21.75, lift = ease(seg(t, 21.42, LET_GO));
    const xm = mood(t, [[19.67, 'normal'], [19.95, 'look'], [20.35, 'spark', '!'], [CATCH, 'happy', 'heart'], [LET_GO, 'look'], [ON, 'spark', 'music']]);
    const lk = t < LET_GO ? [-1, .5] : [.8, -1];
    xiaoye(560, 830, SU, { ...xm, lookX: lk[0], lookY: lk[1], mouth: t < 20.35 ? 'smile' : t < CATCH ? 'O' : t < LET_GO ? 'smile' : 'grin', blush: t > CATCH,
      dy: -Math.abs(Math.sin(bpOf(t) * Math.PI)) * .25, sq: holding ? .04 : 0,
      aL: holding ? -2.05 : lerp(-1.15, .45, reach), aR: holding ? -2.05 : t > 21.75 ? lerp(-1.15, .7, ease(seg(t, 21.75, 21.95))) : -1.15,
      glow: .3 + .5 * pulse(t, 4), draw: holding ? cupped(t, lift) : null });
    WORDS.forEach((w, i) => { if (P[i] && P[i][3] >= 0 && !peeking(w, P[i])) drawWord(w, i, t, P[i]); });   // in front
    const oa = t - ON;                                    // click: the ON ring lights up
    if (oa >= 0 && oa < .25) paint(starPts(CAP[0], CAP[1] + 13, 30 + 90 * easeOut(oa / .25), .3, 8, oa * 2), { wash: '#E8FFFF', washOp: 255 * (1 - oa / .25), ink: null });
    const fl = seg(t, 22.16, 22.5);                       // …and the light bursts out of it
    if (fl > 0) for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU + .2, wd = .07 + .03 * hash(i), L2 = 150 + 2200 * easeIn(fl);
      paint([[CAP[0], CAP[1]], [CAP[0] + Math.cos(a - wd) * L2, CAP[1] + Math.sin(a - wd) * L2], [CAP[0] + Math.cos(a + wd) * L2, CAP[1] + Math.sin(a + wd) * L2]], { wash: '#FFFDF6', washOp: 210 * fl, ink: null });
    }
    camEnd();
    flushLetters();
    flash(ease(seg(t, 22.3, 22.57)));                     // white: chapter 2 opens in this flash
  }

  chapter('street', 0, 22.641, [[0, nightOpen], [6.0, hello], [11.96, overhead], [14.17, slam], [17.06, drums], [19.67, words]]);
})();
