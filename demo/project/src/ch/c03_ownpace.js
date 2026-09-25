// c03_ownpace: Verse 2, "my own pace" (43.974–54.641). Storyboard § 3. Violet and gold, turning cyan with the dawn.
// One shot per lyric line, four bars from B(65):
//   gateShot    43.974  the applause gate (golden posts, a snooty face on the arch, three rows of clapping gloves) blocks the
//                       red carpet; a roped-in queue waves tickets. 小夜 strolls past in front, shrugs on B(67) and walks round
//                       it; on B(68) the gloves freeze wide open in mid-air and the queue's jaws drop. Opens under the brush wipe.
//   raceShot    46.8    a race track: a sports car, a sprinter and a rocket roar past on the beats; he strolls, stops mid-stride,
//                       a tape measure hops out of his pocket and zips heel to toe on B(71), he nods on B(72), walks on at B(73).
//   mirrorShot  49.48   back in the studio, close on the mic: his reflection in the chrome grille starts talking on B(74);
//                       hand on heart and two earnest nods on B(75); the reflection gives a thumbs up on B(76). Push in.
//   lapseShot   52.03   time-lapse at a low desk, pulling back from the blank page: pages fill with ink and get balled up
//                       (thrown on B(78)–B(80), landing half a beat later), 字灵 doze in the pile, the clock spins 2:00 → 5:27,
//                       the window sky goes indigo → pale, the neon turns gold/violet → cyan/magenta; the first ray of morning
//                       comes through the left pane of studioBack's window onto the finished page. Ends on the standard studio
//                       framing with studioBack's dawn .42 / clock 5.45 / bin 1 and the ray's glare at (1318, 300), as ch4 opens.
// Cameos (private to this chapter): the applause gate, the sports car, the rocket, the sprinter.
(() => {
  const B = n => OFF + n * BEAT;                                        // song time of beat n
  const VIO_DK = '#231A4E', VIO = '#4A3690';
  const GOLD = '#F2C14E', GOLD_DK = '#A97A22', GOLD_LT = '#FFE6A3', ROSE = '#B23A74', ROSE_DK = '#6E1E48';
  const GLOVE_DK = '#E2D2B6', NEON_GOLD = '#FFC857', NEON_VIO = '#B07CFF', CHROME = '#C9CED6', CHROME_DK = '#8E96A8';
  const HONEY = '#F6B94A', RAY = '#FFE6A0', RAY_LT = '#FFF8E6';          // first light (same family as ch4's beam)
  const puff = (x, y, r, col = PAL.cream, op = 200) => paint(ellPts(x, y, r, r * .85, 12, r * .06), { wash: col, washOp: op, ink: null });
  const sparkle = (x, y, r, col = PAL.cream) => paint(starPts(x, y, r, .32, 4), { wash: col, ink: PAL.ink, sw: .5 });
  const upR = (a, fn) => (u, sw) => { rotate(a); fn(u, sw); };        // hold a prop upright in xiaoye's right-hand hook
  const dip = (t, t0, len = .28) => t > t0 ? Math.sin(clamp((t - t0) / len) * Math.PI) : 0;   // one smooth down-and-up
  const arcPt = (a, b, h, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - h * 4 * k * (1 - k)];
  const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const lin = x => x;

  // =====================================================================================================
  // 1) THE APPLAUSE GATE  43.974–46.8  "不必把谁的掌声当作通行证"
  // =====================================================================================================
  const GT = { x: 1300, y: 756, hw: 172, top: 420 };                   // gate centre, ground, half-width to the post centres, post top
  const T_SHRUG = B(67), T_FRZ = B(68);
  const ROWS = [-110, -200, -290];                                     // glove rows above the gate's ground
  const QUEUE = [
    { x: 1058, u: 19.5, col: '#8C7BB8', dk: '#5A4A86', lt: '#B9ABE0' },
    { x: 968, u: 20.5, col: '#5E9FA8', dk: '#3A6A72', lt: '#9CCFD4' },
    { x: 880, u: 19, col: '#C99A4E', dk: '#8A6424', lt: '#EBC98A' },
    { x: 792, u: 20, col: '#A8698E', dk: '#6E3A5C', lt: '#D9A0C0' },
    { x: 706, u: 19.5, col: '#6E8CC4', dk: '#3E5A8E', lt: '#A9C2EC' },
  ];
  const Y1 = 910, U1 = 26, QY = 752;
  const xAt1 = t => kf(t, [[43.974, 780], [45.18, 1040], [45.62, 1066], [46.8, 1400]], lin);

  // a big cartoon glove seen from the thumb side, cuff at (0, 0), pointing +x, about 128s long; splay 0..1 fans the fingers
  function glove(s, sw, splay = 0) {
    paint(rrPts(-14 * s, -27 * s, 30 * s, 54 * s, 12 * s), { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8 });
    if (splay > .04) {
      for (let k = 0; k < 4; k++) {
        push(); translate(44 * s, 4 * s); rotate((k - 1.6) * .38 * splay);
        paint(rrPts(0, -9 * s, 82 * s, 18 * s, 9 * s), { wash: PAL.cream, fill: GLOVE_DK, fillOp: 40, tex: .4, ink: PAL.ink, sw: sw * .75 });
        pop();
      }
      paint(ellPts(38 * s, 2 * s, 32 * s, 26 * s, 14), { wash: PAL.cream, fill: GLOVE_DK, fillOp: 30, ink: PAL.ink, sw: sw * .8 });
    } else {
      paint([[14 * s, -24 * s], [88 * s, -26 * s], [116 * s, -20 * s], [128 * s, -4 * s], [120 * s, 12 * s], [92 * s, 21 * s], [14 * s, 24 * s]],
        { wash: PAL.cream, fill: GLOVE_DK, fillOp: 45, tex: .5, ink: PAL.ink, sw, curv: .45 });
      for (const k of [-7, 6]) inkLine([[76 * s, k * s], [114 * s, k * .7 * s]], sw * .5, PAL.ink, 'inkfine', .3);
    }
    push(); translate(40 * s, -20 * s); rotate(.55 - .45 * splay);                                   // thumb
    paint(rrPts(-10 * s, -38 * s, 22 * s, 42 * s, 11 * s), { wash: PAL.cream, fill: GLOVE_DK, fillOp: 40, tex: .4, ink: PAL.ink, sw: sw * .8 });
    pop();
  }
  // the gloves clap on every beat (palms meet on the beat), rows rippling bottom to top; at T_FRZ they jerk wide open
  // and stay there, trembling
  const clapPh = (t, row) => frac(bpOf(t) - row * .08);
  function clapA(t, row) {
    const ph = clapPh(t, row), a = ph < .3 ? easeOut(ph / .3) : 1 - easeIn((ph - .3) / .7);
    const f = backOut(seg(t, T_FRZ - .1, T_FRZ + .12));
    return lerp(.46 * a, .72, f) + (t > T_FRZ ? .025 * Math.sin(t * 60 + row * 2) : 0);
  }
  function applauseGate(t, o = {}) {
    const { x, y, hw, top } = GT, sw = 1.2, bp = bpOf(t);
    paint(ellPts(x, y - 240, 380, 310, 20), { fill: GOLD_LT, fillOp: 60, bleed: .3, tex: .2, border: .1, ink: null });     // glow
    for (const s of [-1, 1]) {                                                                                         // posts
      const px = x + s * hw;
      paint(ellPts(px, y + 4, 70, 14, 14), { fill: PAL.ink, fillOp: 80, bleed: .2, tex: .3, border: .1, ink: null });
      paint(rrPts(px - 32, top, 64, y - top, 14, 2), { wash: GOLD, fill: GOLD_DK, fillOp: 70, tex: .6, border: .5, ink: null });
      paint(rectPts(px - 24, top + 24, 14, y - top - 60, 2), { fill: GOLD_LT, fillOp: 150, bleed: .1, tex: .6, border: .6, ink: null });
      paint(rrPts(px - 32, top, 64, y - top, 14), { ink: PAL.ink, sw });
      for (const yy of [top + 36, y - 74]) paint(rrPts(px - 38, yy, 76, 18, 6), { wash: VIO, ink: PAL.ink, sw: sw * .7 });
      paint(rrPts(px - 44, y - 26, 88, 28, 8), { wash: GOLD_DK, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(px, top - 18, 26, 26, 14, 1), { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .4, ink: PAL.ink, sw: sw * .8 });
    }
    // the arch with chasing marquee bulbs
    const arc = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; arc.push([x + Math.cos(a) * hw, top - 12 + Math.sin(a) * 118]); }
    paint(tubePts(arc, 48), { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, border: .5, ink: PAL.ink, sw });
    inkLine(arc.map(([ax, ay]) => [ax, ay + 6]), 5, VIO, 'ink', .5);
    for (let i = 1; i < 16; i++) {
      const [bx, by] = arc[i], lit = (i + Math.floor(bp * 2)) % 3 === 0;
      if (lit) paint(ellPts(bx, by - 8, 17, 17, 10), { fill: GOLD_LT, fillOp: 150, bleed: .2, ink: null });
      paint(ellPts(bx, by - 8, 7, 7, 8), { wash: lit ? PAL.cream : '#C9A45A', ink: PAL.ink, sw: .5 });
    }
    // the gatekeeper's face on a medallion at the top, with a top hat, a moustache and a bow tie
    const mx = x, my = top - 140 - (o.jolt || 0) * 10;
    paint(rrPts(mx - 30, my - 136, 60, 60, 8), { wash: VIO_DK, fill: VIO, fillOp: 50, tex: .5, ink: PAL.ink, sw });
    paint(rectPts(mx - 30, my - 96, 60, 11), { wash: GOLD, ink: null });
    paint(rrPts(mx - 52, my - 82, 104, 14, 7), { wash: VIO_DK, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(mx, my, 78, 74, 24, 1.5), { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, border: .5, ink: PAL.ink, sw });
    paint(ellPts(mx, my, 62, 58, 22, 1), { wash: PAL.cream, fill: GOLD_LT, fillOp: 70, tex: .4, ink: PAL.ink, sw: sw * .7 });
    castEyes(mx, my - 14, 24, 10, { eyes: o.eyes || 'narrow', squint: o.squint || 0, lookX: o.lookX || 0, lookY: o.lookY || 0, seed: 5 }, sw, PAL.cream);
    if (o.mouth === 'O') paint(ellPts(mx, my + 34, 13, 15, 12), { wash: '#6A2A35', ink: PAL.ink, sw: .8 });
    else inkLine([[mx - 12, my + 32], [mx + 12, my + 30]], 1.3, PAL.ink, 'ink', 0);
    for (const s of [-1, 1]) inkLine([[mx, my + 14], [mx + s * 16, my + 9], [mx + s * 30, my + 16], [mx + s * 36, my + 5]], 3.4, VIO_DK, 'ink', .5);
    for (const s of [-1, 1]) paint([[mx, my + 76], [mx + s * 34, my + 62], [mx + s * 34, my + 92]], { wash: ROSE, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(mx, my + 77, 9, 9, 8), { wash: ROSE_DK, ink: PAL.ink, sw: .6 });
    // three rows of gloves on hinges; they clap palm to palm in the middle of the gate
    ROWS.forEach((ry, row) => {
      const a = clapA(t, row), py = y + ry;
      for (const d of [-1, 1]) {
        push(); translate(x + d * (hw - 32), py); scale(-d, 1); rotate(-a);
        paint(rrPts(-6, -18, 40, 36, 14), { wash: VIO, fill: VIO_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: .9 });
        translate(30, 0); glove(.86, 1.05, o.splay || 0);
        pop();
      }
      const ph = clapPh(t, row);                                                                     // clap marks
      if (t < T_FRZ - .1 && ph < .16) for (const s of [-1, 1]) for (const k of [-1, 0, 1]) {
        const ang = s * Math.PI / 2 + k * .5, r0 = 34 + ph * 120;
        inkLine([[x + Math.cos(ang) * r0 * .6, py + Math.sin(ang) * r0], [x + Math.cos(ang) * (r0 * .6 + 10), py + Math.sin(ang) * (r0 + 16)]], 1.6, GOLD_LT, 'ink', 0);
      }
    });
    return [mx, my];
  }

  const ticket = (u, sw) => {
    push(); rotate(-.25);
    paint(rrPts(-.3 * u, -2.3 * u, 2.9 * u, 1.55 * u, .25 * u), { wash: GOLD, fill: GOLD_DK, fillOp: 40, tex: .4, ink: PAL.ink, sw: sw * .7 });
    paint(starPts(1.25 * u, -1.52 * u, .52 * u, .45, 5), { wash: PAL.cream, ink: null });
    inkLine([[.45 * u, -2.2 * u], [.45 * u, -.85 * u]], sw * .4, GOLD_DK, 'inkfine', 0);
    pop();
  };
  function stanchions(x0, x1, y, t) {
    const posts = []; for (let x = x0; x <= x1; x += 170) posts.push(x);
    for (let i = 0; i + 1 < posts.length; i++) {
      const a = posts[i], b = posts[i + 1], sag = 24 + 4 * Math.sin(t * 3 + i), path = [];
      for (let k = 0; k <= 8; k++) { const f = k / 8; path.push([lerp(a, b, f), y - 60 + Math.sin(f * Math.PI) * sag]); }
      paint(tubePts(path, 11), { wash: ROSE, fill: ROSE_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: .8 });
    }
    for (const x of posts) {
      paint(ellPts(x, y + 2, 24, 7, 10), { wash: GOLD_DK, ink: PAL.ink, sw: .7 });
      paint(rectPts(x - 6, y - 66, 12, 66, 1), { wash: GOLD, fill: GOLD_DK, fillOp: 50, ink: PAL.ink, sw: .8 });
      paint(ellPts(x, y - 70, 11, 11, 10), { wash: GOLD, ink: PAL.ink, sw: .7 });
    }
  }
  function gateWorld(t, cx) {
    const par = k => (cx - 960) * (1 - k);                               // shift a layer so it moves k times as fast as the ground
    paint(rectPts(-500, -400, W + 1500, 1000), { wash: '#5A3E98', ink: null });
    paint(rectPts(-500, -400, W + 1500, 700, 6), { fill: VIO_DK, fillOp: 220, bleed: .2, tex: .35, border: .3, ink: null });
    paint(ellPts(1250 + par(.3), 560, 950, 200, 20), { fill: '#E07AA8', fillOp: 70, bleed: .3, tex: .2, border: .1, ink: null });
    for (let i = 0; i < 22; i++) {
      const k = .55 + .45 * Math.sin(t * 3.1 + i * 2.3);
      paint(starPts(hash(i * 3.7) * 2600 - 300 + par(.08), hash(i * 5.1) * 380 - 30, 5 + 6 * hash(i + 2), .38, 4), { wash: i % 3 ? PAL.cream : GOLD_LT, washOp: 255 * k, ink: null });
    }
    for (const s of [-1, 1]) {                                          // premiere spotlights sweeping behind the gate
      const bx = GT.x + s * 330 + par(.6), by = 560, a = -Math.PI / 2 + s * (.34 + .22 * Math.sin(t * 1.7 + s));
      const L = 1300, w0 = 24, w1 = 230, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
      paint([[bx + nx * w0, by + ny * w0], [bx + dx * L + nx * w1, by + dy * L + ny * w1], [bx + dx * L - nx * w1, by + dy * L - ny * w1], [bx - nx * w0, by - ny * w0]],
        { fill: GOLD_LT, fillOp: 70, bleed: .15, tex: .2, border: .2, ink: null });
    }
    for (let i = 0; i < 18; i++) {                                      // far city
      const w = 110 + 90 * hash(i * 2.3), h = 70 + 170 * hash(i * 4.1), bx = -320 + i * 190 + par(.3);
      paint(rectPts(bx, 562 - h, w, h + 10, 1), { wash: '#3A2C72', ink: null });
      for (let k = 0; k < 3; k++) if (hash(i * 9 + k) < .45) paint(rectPts(bx + 18 + k * 28, 562 - h + 22 + (k % 2) * 30, 10, 14), { wash: GOLD_LT, washOp: 200, ink: null });
    }
    paint([[-500, 560], [W + 1000, 556], [W + 1000, 1500], [-500, 1500]], { wash: '#5D4C92', fill: '#3C2E6E', fillOp: 60, bleed: .04, tex: .7, border: .4, ink: PAL.ink, sw: 1 });
    paint([[-500, 840], [W + 1000, 840], [W + 1000, 1500], [-500, 1500]], { fill: '#8A78C0', fillOp: 70, bleed: .04, tex: .5, border: .3, ink: null });
    paint(ellPts(GT.x, 764, 420, 60, 18), { fill: GOLD_LT, fillOp: 60, bleed: .2, tex: .3, ink: null });
    paint([[-500, 718], [W + 1000, 718], [W + 1000, 784], [-500, 784]], { wash: ROSE, fill: ROSE_DK, fillOp: 50, bleed: .04, tex: .6, border: .4, ink: PAL.ink, sw: 1 });
    for (const yy of [726, 776]) inkLine([[-500, yy], [W + 1000, yy]], 1.2, GOLD, 'ink', 0);
  }

  function gateShot(t, lt, dur) {
    const e = ease(lt / dur), cx = lerp(930, 1520, e);
    const hit = t >= T_FRZ ? Math.exp(-(t - T_FRZ) * 9) : 0, [sx, sy] = shakeXY(t, 6 * hit);
    camBegin(cx + sx, lerp(574, 566, e) + sy, lerp(1.16, 1.2, e) + .01 * pulse(t, 8), 0);
    gateWorld(t, cx);
    const xX = xAt1(t), bp = bpOf(t);
    // the gate: snooty while it applauds, watches him go round, gasps when the gloves freeze
    const gm = mood(t, [[43.9, 'narrow'], [T_SHRUG + .1, 'look'], [T_FRZ, 'scared', '!']]);
    const [mx, my] = applauseGate(t, { ...gm, lookX: gm.eyes === 'look' ? clamp((xX - GT.x) / 300, -1, 1) : -.7, lookY: gm.eyes === 'look' ? 1 : .6,
      mouth: t > T_FRZ ? 'O' : 'flat', splay: ease(seg(t, T_FRZ - .06, T_FRZ + .1)), jolt: hit });
    if (gm.emote) emote(gm.emote, mx + 104, my - 58, 22, gm.emoteK);
    if (t > B(69) - .1) for (const s of [-1, 1]) emote('sweat', GT.x + s * 124, GT.y + ROWS[2] - 70, 13, seg(t, B(69) - .1, B(69) + .15));
    // the queue: tickets up, hopping on the beat; they turn to watch him, then gape and let the tickets droop
    QUEUE.forEach((q, i) => {
      const m = move('hop', t, i), hopK = t < T_SHRUG ? .35 : .08, tS = T_FRZ + i * .05;
      const watch = seg(t, T_SHRUG + i * .06, T_SHRUG + .25 + i * .06), drop = ease(seg(t, tS, tS + .16));
      const md = mood(t, [[43.9, 'look'], [tS, 'scared']]);
      const aR = lerp(1.05 + .2 * Math.sin(bp * TAU + i), -.95, drop);
      xiaoye(q.x, QY, q.u, { phones: false, col: q.col, dk: q.dk, lt: q.lt, seed: i + 1, dy: m.dy * hopK, sq: m.sq * hopK,
        eyes: md.eyes, squint: md.squint, take: md.take, lookX: lerp(.8, clamp((xX - q.x) / 160, -1, 1), watch), lookY: lerp(-.7, .6, watch),
        mouth: t >= tS ? 'O' : i % 2 ? 'smile' : 'o', aL: -1.1, aR, handR: upR(aR, ticket) });
    });
    stanchions(-360, 1060, 798, t);
    // 小夜: strolls in, shrugs on the beat, walks round the gate
    const shK = backOut(seg(t, T_SHRUG - .12, T_SHRUG + .06)) * (1 - ease(seg(t, T_SHRUG + .32, T_SHRUG + .5)));
    const md = mood(t, [[43.9, 'happy'], [44.9, 'look'], [T_SHRUG - .1, 'closed'], [T_SHRUG + .45, 'happy', 'music']]);
    const walking = shK < .3, sb = Math.sin(bp * TAU), u = U1;
    xiaoye(xX, Y1, u, { ...md, lookX: .8, lookY: -.45, seed: 7, walk: walking ? bp : null, dy: walking ? -Math.abs(sb) * .5 : -.3 * shK, sq: -.05 * shK + (md.take || 0), take: 0,
      aL: lerp(-1.05 + .35 * sb, -.2, shK), aR: lerp(-1.05 - .35 * sb, -.2, shK), rot: .09 * shK,
      mouth: shK > .15 ? 'cat' : md.eyes === 'look' ? 'flat' : 'smile' });
    if (shK > .45) for (const s of [-1, 1]) {
      const bx = xX + s * 2.7 * u, by = Y1 - 8.4 * u;
      inkLine([[bx, by], [bx + s * 10, by - 16]], 1.4, PAL.ink, 'ink', 0);
      inkLine([[bx + s * 20, by + 6], [bx + s * 32, by - 8]], 1.4, PAL.ink, 'ink', 0);
    }
    camEnd();
  }

  // =====================================================================================================
  // 2) THE RACE TRACK  46.8–49.48  "也不拿别人的速度丈量人生"
  // =====================================================================================================
  const T_STOP = 47.62, T_TAPE = B(71), T_NOD = B(72), T_GO = B(73);
  const RACERS = [[47.0, 'car'], [B(70), 'runner'], [B(71) + .06, 'rocket'], [B(72), 'car2'], [B(73) + .02, 'runner']];
  const SPEED = { car: 3200, car2: 3600, runner: 2200, rocket: 3800 };
  const Y2 = 932, U2 = 30, CY2 = 652, Z2 = 1.32;
  const xAt2 = t => kf(t, [[46.8, 660], [T_STOP, 752], [T_GO + .05, 760], [49.48, 818]], lin);
  const cam2 = t => 857 + (xAt2(t) - 660) * .9;                       // he stays left of centre, the camera creeps with him

  function raceWorld(t, cx, cheer) {
    const par = k => (cx - 960) * (1 - k);
    paint(rectPts(-500, -400, W + 1200, 1100), { wash: '#6F8CC4', ink: null });
    paint(rectPts(-500, -400, W + 1200, 700, 6), { fill: VIO, fillOp: 210, bleed: .2, tex: .35, border: .3, ink: null });
    // grandstand with a bobbing crowd
    const gx = par(.5);
    paint(rectPts(-500 + gx, 330, W + 1400, 290, 2), { wash: '#3E3272', fill: VIO_DK, fillOp: 60, tex: .6, ink: PAL.ink, sw: 1 });
    paint(rectPts(-500 + gx, 312, W + 1400, 30, 1), { wash: GOLD, ink: PAL.ink, sw: .9 });
    for (let i = 0; i < 30; i++) { const px = -480 + gx + i * 110; paint([[px, 342], [px + 55, 342], [px + 27, 382]], { wash: i % 2 ? ROSE : '#3FA8A0', ink: PAL.ink, sw: .6 }); }
    const CROWD = ['#E27A92', '#F2C14E', '#8EC3E6', '#C6B1EC', '#3FA8A0', '#FFF5E2'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 26; i++) {
      const hx = -470 + gx + i * 104 + (r % 2) * 52, hy = 430 + r * 58 - 12 * pulse(t + hash(i * 3 + r) * .3, 6) - 18 * cheer * Math.abs(Math.sin(t * 20 + i));
      paint(ellPts(hx, hy + 22, 24, 16, 10), { wash: CROWD[(i + r * 2) % 6], ink: null });
      paint(ellPts(hx, hy, 15, 16, 10), { wash: '#F2C4A0', ink: PAL.ink, sw: .5 });
    }
    paint(rectPts(-500 + gx, 600, W + 1400, 26, 1), { wash: VIO_DK, ink: PAL.ink, sw: .8 });
    // barrier wall, track, lane lines, near curb
    for (let i = 0; i < 20; i++) paint(rectPts(-500 + i * 180, 618, 180, 44), { wash: i % 2 ? PAL.cream : GOLD, ink: null });
    inkLine([[-500, 618], [W + 1300, 618]], 1.1, PAL.ink, 'ink', 0);
    paint([[-500, 662], [W + 1300, 662], [W + 1300, 1500], [-500, 1500]], { wash: '#463C74', fill: '#2E2654', fillOp: 60, bleed: .04, tex: .7, border: .4, ink: PAL.ink, sw: 1.1 });
    for (const ly of [752, 862]) for (let x = -520; x < W + 1300; x += 150) paint(rectPts(x, ly - 4, 84, 8), { wash: PAL.cream, washOp: 210, ink: null });
    paint([[-500, 980], [W + 1300, 980], [W + 1300, 1500], [-500, 1500]], { wash: '#3A9C98', fill: '#2A6E6A', fillOp: 50, bleed: .04, tex: .6, ink: PAL.ink, sw: 1 });
  }
  // the sports car: a gold wedge with a determined windshield face; x = front bumper, y = road, roaring to the right
  function sportsCar(x, y, s, t, col = GOLD, dk = GOLD_DK) {
    push(); translate(x, y); scale(s);
    const sw = 1.2;
    for (let k = 0; k < 4; k++) { const a = frac(t * 6 + k / 4); puff(-390 - a * 320, -36 - a * 34, 14 + a * 34, '#E9E0F4', 200 * (1 - a)); }
    for (let k = 0; k < 6; k++) { const yy = -126 + k * 20, len = 220 + 180 * hash(k * 3.1); inkLine([[-400 - len, yy], [-380, yy]], 1.2, k % 2 ? PAL.cream : GOLD_LT, 'inkfine', 0); }
    paint(ellPts(-180, 2, 210, 12, 14), { fill: PAL.ink, fillOp: 90, bleed: .2, tex: .2, ink: null });
    const body = [[-372, -30], [-374, -72], [-300, -90], [-205, -96], [-150, -140], [-70, -142], [-8, -98], [30, -78], [36, -42], [22, -24], [-372, -24]];
    paint(body, { wash: col, washOp: 255, ink: null, curv: .25 });
    paint(ellPts(-240, -78, 110, 11, 12), { fill: PAL.cream, fillOp: 120, bleed: .2, ink: null });
    paint([[-372, -60], [36, -54], [36, -45], [-372, -48]], { wash: VIO, ink: null });
    paint(body, { ink: PAL.ink, sw, curv: .25 });
    paint([[-374, -86], [-396, -122], [-332, -122], [-320, -90]], { wash: dk, ink: PAL.ink, sw: sw * .8 });
    paint([[-142, -134], [-76, -136], [-20, -98], [-152, -98]], { wash: '#2E2A58', fill: '#4FE0E8', fillOp: 40, ink: PAL.ink, sw: sw * .8 });
    castEyes(-92, -114, 24, 10, { eyes: 'angry', seed: 9 }, sw * .9, '#2E2A58');
    paint([[2, -60], [34, -58], [32, -34], [4, -34]], { wash: '#6A2A35', ink: PAL.ink, sw: sw * .7 });
    for (let k = 0; k < 3; k++) paint(rectPts(6 + k * 9, -58, 7, 9), { wash: PAL.cream, ink: null });
    for (const wx of [-292, -62]) {
      paint(ellPts(wx, -26, 34, 34, 16), { wash: '#2A2440', ink: PAL.ink, sw });
      paint(ellPts(wx, -26, 16, 16, 12), { wash: CHROME, ink: PAL.ink, sw: sw * .6 });
      for (let k = 0; k < 3; k++) { const b = -t * 40 + k * TAU / 3; inkLine([[wx, -26], [wx + Math.cos(b) * 14, -26 + Math.sin(b) * 14]], .8, PAL.ink, 'inkfine', 0); }
    }
    pop();
  }
  // the rocket: cream body, gold nose, violet fins, a gritted grin; x = nose tip, y = centre line, flying right
  function rocket(x, y, s, t) {
    push(); translate(x, y); scale(s);
    for (let k = 0; k < 6; k++) { const a = frac(t * 5 + k / 6); puff(-430 - a * 640, Math.sin(k * 2.3 + t * 4) * 16, 22 + a * 52, '#EFE6F7', 210 * (1 - a)); }
    const fl = 120 + 40 * Math.sin(t * 50);
    paint([[-330, -32], [-330 - fl, 0], [-330, 32]], { wash: '#FF8A3D', ink: null });
    paint([[-330, -20], [-330 - fl * .7, 0], [-330, 20]], { wash: GOLD, ink: null });
    paint([[-330, -9], [-330 - fl * .4, 0], [-330, 9]], { wash: PAL.cream, ink: null });
    for (let k = 0; k < 5; k++) { const yy = -60 + k * 30, len = 260 + 200 * hash(k * 5.3); inkLine([[-340 - len, yy], [-340, yy]], 1.2, PAL.cream, 'inkfine', 0); }
    for (const s2 of [-1, 1]) paint([[-240, s2 * 40], [-344, s2 * 96], [-322, s2 * 38]], { wash: VIO, ink: PAL.ink, sw: 1 });
    const body = [[-330, -44], [-120, -48], [-40, -36], [0, 0], [-40, 36], [-120, 48], [-330, 44]];
    paint(body, { wash: PAL.cream, fill: '#D8CCE8', fillOp: 60, tex: .5, ink: null, curv: .35 });
    paint([[-110, -47], [-40, -36], [0, 0], [-40, 36], [-110, 47]], { wash: GOLD, ink: null, curv: .35 });
    paint(rectPts(-250, -46, 26, 92), { wash: '#3FA8A0', ink: null });
    paint(body, { ink: PAL.ink, sw: 1.2, curv: .35 });
    castEyes(-160, -10, 18, 8, { eyes: 'angry', seed: 3 }, 1, PAL.cream);
    paint([[-176, 12], [-144, 12], [-150, 24], [-170, 24]], { wash: '#6A2A35', ink: PAL.ink, sw: .7 });
    pop();
  }
  // a teal sprinter (a hoodie kid, no headphones), sweatband on, speed lines behind
  function sprinter(x, y, u, t) {
    const bp = bpOf(t) * 3;
    for (let k = 0; k < 5; k++) { const yy = y - 3 * u - k * 1.7 * u, len = 200 + 140 * hash(k * 2.7); inkLine([[x - 3 * u - len, yy], [x - 3 * u, yy]], 1.1, PAL.cream, 'inkfine', 0); }
    xiaoye(x, y, u, { phones: false, col: '#3FA8A0', dk: '#1F6F6A', lt: '#8FE0D8', run: bp, rot: .2, dy: -Math.abs(Math.sin(bp * TAU)) * .6, seed: 11,
      aL: .9 * Math.sin(bp * TAU), aR: -.9 * Math.sin(bp * TAU), eyes: 'angry', mouth: 'grin',
      draw: (uu, sw) => {
        paint(rrPts(-2.05 * uu, -11.35 * uu, 4.1 * uu, .8 * uu, .35 * uu), { wash: GOLD, ink: PAL.ink, sw: sw * .6 });
        for (const k of [0, 1]) paint([[-1.9 * uu, -11.1 * uu], [-3.3 * uu - k * .3 * uu, -11.5 * uu + k * .9 * uu + Math.sin(t * 30 + k) * .2 * uu], [-3.1 * uu - k * .3 * uu, -10.8 * uu + k * .9 * uu]], { wash: GOLD, ink: PAL.ink, sw: sw * .5 });
      } });
    for (let k = 0; k < 2; k++) { const a = frac(t * 4 + k * .5); paint(ellPts(x - 2.5 * u - a * 4 * u, y - 11 * u + a * 2 * u, .3 * u, .42 * u, 8), { wash: PAL.sky, ink: PAL.ink, sw: .5 }); }
  }
  // the tape measure: case at x1 (front toe), the tape runs back towards x0 (back heel) by ext 0..1
  function tapeMeasure(x0, x1, y, ext) {
    const xe = lerp(x1, x0, ext);
    if (ext > .01) {
      paint([[xe, y - 7], [x1, y - 8], [x1, y + 6], [xe, y + 7]], { wash: '#F4D35E', ink: PAL.ink, sw: .8 });
      for (let x = x1 - 14; x > xe + 3; x -= 14) inkLine([[x, y - 7], [x, y + ((x1 - x) % 70 < 14 ? 5 : -1)]], .7, PAL.ink, 'inkfine', 0);
      paint(rectPts(xe - 8, y - 13, 9, 22), { wash: '#9AA0B0', ink: PAL.ink, sw: .7 });
    }
    tapeCase(x1, y);
  }
  function tapeCase(x, y, rot = 0) {
    push(); translate(x, y); rotate(rot);
    paint(rrPts(-6, -54, 64, 58, 14), { wash: GOLD, fill: GOLD_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
    paint(ellPts(26, -25, 17, 17, 14), { wash: PAL.cream, ink: PAL.ink, sw: .7 });
    paint(rectPts(12, -63, 26, 11, 1), { wash: '#6E5A2A', ink: PAL.ink, sw: .6 });
    pop();
  }

  function raceShot(t, lt, dur) {
    const cx = cam2(t), bp = bpOf(t);
    let near = 0;
    for (const [tc, kind] of RACERS) near = Math.max(near, Math.exp(-Math.abs(t - tc) * 7) * (kind === 'runner' ? 1 : .6));
    const [sx, sy] = shakeXY(t, 5 * near);
    camBegin(cx + sx, CY2 + sy, Z2, 0);
    raceWorld(t, cx, near);
    const at = (tc, kind, off) => cam2(tc) + off + SPEED[kind] * (t - tc);
    for (const [tc, kind] of RACERS) {
      if (kind === 'rocket') { const rx = at(tc, kind, 190); if (Math.abs(rx - cx) < 1400) rocket(rx, 440 + 16 * Math.sin(t * 8), .92, t); }
      if (kind === 'car' || kind === 'car2') { const rx = at(tc, kind, 190); if (Math.abs(rx - cx) < 1400) sportsCar(rx, 722, 1.0, t, kind === 'car' ? GOLD : '#E0506A', kind === 'car' ? GOLD_DK : '#8E2438'); }
    }
    for (const [tc, kind] of RACERS) if (kind === 'runner') { const rx = at(tc, kind, 0); if (Math.abs(rx - cx) < 1200) sprinter(rx, 826, 20, t); }
    // each one that roars past leaves a gust that tugs at him (he doesn't mind)
    let gust = 0;
    for (const [tc] of RACERS) if (t > tc - .05) gust += Math.exp(-(t - tc + .05) * 5) * Math.sin((t - tc + .05) * 14);
    // his footprints behind him
    const xX = xAt2(t);
    for (let fx = 120, i = 0; fx < xX - 70; fx += 74, i++) paint(ellPts(fx, Y2 + 6 + (i % 2 ? -7 : 7), 16, 6, 10), { wash: '#2E2654', washOp: 200, ink: null });
    // the stride, the tape, the nod
    const stride = backOut(seg(t, T_STOP - .08, T_STOP + .1)) * (1 - ease(seg(t, T_GO - .04, T_GO + .1)));
    const walking = stride < .05, run = Math.asin(clamp(stride)) / TAU;
    const heel = xX - 3.25 * U2, toe = xX + 3.2 * U2;
    const land = T_TAPE - .1, ext = easeOut(seg(t, T_TAPE - .06, T_TAPE + .08)) * (1 - easeIn(seg(t, T_GO - .02, T_GO + .1)));
    if (t >= land && t < T_GO + .1) tapeMeasure(heel, toe, Y2, ext);
    const nods = dip(t, T_NOD, .24) + dip(t, T_NOD + BEAT / 2, .24);
    const md = mood(t, [[46.7, 'happy'], [T_STOP - .05, 'look'], [T_NOD - .04, 'happy', 'spark'], [T_GO + .15, 'happy', 'music']]);
    const sb = Math.sin(bp * Math.PI);
    xiaoye(xX, Y2, U2, { ...md, lookX: .15, lookY: 1, seed: 4, walk: walking ? bp / 2 : null, run: walking ? null : run, rot: .04 * gust,
      dy: walking ? -Math.abs(sb) * .4 : .44 * clamp(stride) + .25 * nods, sq: .05 * nods + (md.take || 0), take: 0,
      aL: walking ? -1.1 + .3 * sb : -.95, aR: walking ? -1.1 - .3 * sb : -.95, mouth: md.eyes === 'look' ? 'o' : 'smile', blush: t > T_NOD });
    // the case hops out of his pocket onto the ground, and back in again
    const outK = seg(t, T_TAPE - .42, land), inK = seg(t, T_GO + .1, T_GO + .36), pocket = [xX - 20, Y2 - 4.2 * U2];
    if (outK > 0 && outK < 1) { const [px, py] = arcPt(pocket, [toe, Y2], 90, easeIn(outK)); tapeCase(px, py, outK * 5); }
    if (inK > 0 && inK < 1) { const [px, py] = arcPt([toe, Y2], pocket, 90, easeOut(inK)); tapeCase(px, py, -inK * 5); }
    const tick = seg(t, T_TAPE + .06, T_TAPE + .4);
    if (tick > 0 && tick < 1) { sparkle(heel - 8, Y2 - 26, 30 * Math.sin(tick * Math.PI), GOLD_LT); sparkle(toe + 30, Y2 - 80, 20 * Math.sin(tick * Math.PI), PAL.cream); }
    camEnd();
  }

  // =====================================================================================================
  // 3) THE MIC GRILLE  49.48–52.03  "话筒前的我学着对自己诚恳"
  // =====================================================================================================
  const T_TALK = B(74), T_HEART = B(75), T_THUMB = B(76);
  const MC = { x: 1330, top: 96, r: 196, band: 712, bot: 860 };      // close-up capsule (foreground coords): dome top, half-width, band, bottom
  const MC_C = MC.top + MC.r;                                          // centre of the dome
  const halfAt = y => y >= MC_C ? MC.r : Math.sqrt(Math.max(0, MC.r * MC.r - (MC_C - y) * (MC_C - y)));
  function capsulePts() {
    const p = [];
    for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; p.push([MC.x + Math.cos(a) * MC.r, MC_C + Math.sin(a) * MC.r]); }
    p.push([MC.x + MC.r, MC.bot], [MC.x + MC.r * .86, MC.bot + 40], [MC.x - MC.r * .86, MC.bot + 40], [MC.x - MC.r, MC.bot]);
    return p;
  }
  const thumbUp = (u, sw) => paint(rrPts(-.24 * u, -1.35 * u, .48 * u, 1 * u, .24 * u), { wash: XY.skin, ink: PAL.ink, sw: sw * .6 });
  // his hand pressed to his chest: a forearm folded across from the side (the real right arm is tucked behind the body)
  const heartHand = k => (u, sw) => {
    if (k < .02) return;
    const ex = 2.2 * u, ey = -4.9 * u, hx = lerp(ex, .6 * u, k), hy = lerp(ey, -6.1 * u, k);
    paint(tubePts([[ex, ey], [hx, hy]], 1.05 * u), { wash: XY.col, fill: XY.dk, fillOp: 45, tex: .5, ink: PAL.ink, sw: sw * .75 });
    paint(ellPts(hx, hy, .62 * u, .58 * u, 12), { wash: XY.skin, ink: PAL.ink, sw: sw * .6 });
    for (const k2 of [-1, 0, 1]) inkLine([[hx - .1 * u + k2 * .05 * u, hy - .35 * u + k2 * .25 * u], [hx - .5 * u, hy - .3 * u + k2 * .25 * u]], sw * .4, PAL.ink, 'inkfine', 0);
  };

  function mirrorShot(t, lt, dur) {
    const e = ease(lt / dur);
    // the studio behind, zoomed and hazed (framed below the neon strip)
    camBegin(lerp(890, 910, e), 420, lerp(1.7, 1.76, e), 0);
    studioBack(t, { neonA: NEON_GOLD, neonB: NEON_VIO, neon: .3, level: .3 + .5 * pulse(t, 5), bin: .2 });
    camEnd();
    paint(rectPts(-60, -60, W + 120, H + 120), { fill: '#241A4E', fillOp: 110, bleed: .02, tex: .3, border: .1, ink: null });
    for (let i = 0; i < 7; i++) {
      const bx = hash(i * 4.3) * 1900 + 20 * Math.sin(t * .8 + i), by = 120 + hash(i * 7.9) * 560, r = 40 + 50 * hash(i * 2.2);
      paint(ellPts(bx, by, r, r, 16), { fill: i % 2 ? GOLD_LT : NEON_VIO, fillOp: 55, bleed: .2, tex: .2, ink: null });
    }
    camBegin(lerp(980, 1010, e), lerp(540, 500, e), lerp(1.0, 1.1, e), 0);
    // the mic: stand, capsule body
    paint(rectPts(MC.x - 20, MC.bot + 30, 40, 500, 1), { wash: '#5A6080', ink: PAL.ink, sw: 1.2 });
    const cap = capsulePts();
    paint(cap, { wash: CHROME, fill: CHROME_DK, fillOp: 60, tex: .5, border: .5, ink: null });
    // the reflection in the dome: a curved slice of the violet room with its gold neon, and his own face looking back
    const RX = MC.x + 4, RY = MC_C + 26, rx = 168, ry = 196;
    paint(ellPts(RX, RY, rx, ry, 28), { wash: '#3A2F6A', fill: '#241A4E', fillOp: 80, tex: .4, ink: null });
    inkLine([[RX - 160, RY - 70], [RX - 60, RY - 176], [RX + 70, RY - 178], [RX + 158, RY - 80]], 8, NEON_GOLD, 'ink', .6);
    paint([[RX + 70, RY - 120], [RX + 132, RY - 96], [RX + 138, RY - 30], [RX + 78, RY - 46]], { wash: '#8E6AA8', ink: null, curv: .3 });
    const ur = 34, HY = MC_C + 8, talking = t > T_TALK && t < T_HEART + .3, thumbK = backOut(seg(t, T_THUMB - .06, T_THUMB + .14));
    const rm = mood(t, [[49.4, 'look'], [T_TALK - .02, 'normal'], [T_THUMB - .04, 'happy']]);
    const aRr = lerp(-1.2, .55, thumbK);
    xiaoye(RX, HY + 9.4 * ur, ur, { ...rm, flip: true, lookX: .8, lookY: .1, noShadow: true, seed: 3, sx: 1.15,
      dy: talking ? -.25 * pulse2(t, 7) : 0, mouth: talking ? 'sing' : t > T_THUMB ? 'grin' : 'flat', brows: talking ? 'up' : null,
      aL: -1.2, aR: aRr, handR: thumbK > .1 ? upR(aRr, thumbUp) : null, emote: null });
    // below the face the chrome is plain; the silver tint, the mesh and the glare run over everything
    paint([[MC.x - MC.r, RY + 150], [MC.x - 80, RY + 186], [MC.x + 80, RY + 186], [MC.x + MC.r, RY + 150], [MC.x + MC.r, MC.band], [MC.x - MC.r, MC.band]],
      { wash: CHROME, fill: CHROME_DK, fillOp: 50, tex: .5, ink: null, curv: .3 });
    paint(ellPts(RX, RY, rx, ry, 24), { wash: '#C9CED6', washOp: 70, ink: null });
    for (let y = MC.top + 12; y < MC.band - 6; y += 16) { const hw = halfAt(y) - 4; if (hw > 8) inkLine([[MC.x - hw, y], [MC.x + hw, y]], .55, '#7E8698', 'inkfine', 0); }
    for (let i = -8; i <= 8; i++) {
      const x = MC.x + Math.sin(i / 9 * Math.PI / 2) * (MC.r - 6), y0 = MC_C - Math.sqrt(Math.max(0, MC.r * MC.r - (x - MC.x) ** 2)) + 6;
      inkLine([[x, y0], [x, MC.band - 6]], .55, '#7E8698', 'inkfine', 0);
    }
    paint([[MC.x - 170, MC_C + 10], [MC.x - 150, MC_C - 120], [MC.x - 124, MC_C - 150], [MC.x - 132, MC_C + 150], [MC.x - 156, MC_C + 250]], { wash: PAL.cream, washOp: 130, ink: null, curv: .5 });
    paint(ellPts(MC.x + 110, MC.top + 70, 26, 14, 10, 0, -.6), { wash: PAL.cream, washOp: 150, ink: null });
    if (talking) for (let k = 0; k < 3; k++) {                                            // its words, spilling out at him
      const a = Math.PI + (k - 1) * .45, r0 = 96 + 34 * pulse2(t + k * .05, 5), mxy = [RX, HY + 1.35 * ur];
      inkLine([[mxy[0] + Math.cos(a) * r0, mxy[1] + Math.sin(a) * r0], [mxy[0] + Math.cos(a) * (r0 + 30), mxy[1] + Math.sin(a) * (r0 + 30)]], 2.4, PAL.cream, 'ink', 0);
    }
    if (thumbK > .2) sparkle(MC.x + 118, MC.top + 90, 36 * Math.sin(seg(t, T_THUMB, T_THUMB + .6) * Math.PI), PAL.cream);
    // band with the ON ring, lower body, outline, shock-mount ring
    paint(rectPts(MC.x - MC.r, MC.band, MC.r * 2, 46), { wash: '#4FE0E8', fill: '#1F7F86', fillOp: 40, tex: .4, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(MC.x, MC.band + 22, MC.r * 1.3, 64, 16), { fill: '#4FE0E8', fillOp: 45, bleed: .3, ink: null });
    paint([[MC.x - MC.r, MC.band + 46], [MC.x + MC.r, MC.band + 46], [MC.x + MC.r, MC.bot], [MC.x - MC.r, MC.bot]], { wash: '#AEB4C0', fill: CHROME_DK, fillOp: 60, tex: .5, ink: null });
    paint(cap, { ink: PAL.ink, sw: 2.2 });
    paint(ellPts(MC.x, MC.bot - 12, MC.r * 1.22, 54, 22), { ink: '#8E8AA8', sw: 2.4 });
    // 小夜, close: startled when it talks, hand on heart and two earnest nods, then a warm smile
    const u = 60, X = 560, Y = 1034;
    const md = mood(t, [[49.4, 'look'], [T_TALK + .02, 'scared', '!'], [T_TALK + .42, 'look'], [T_HEART - .04, 'closed'], [T_THUMB + .08, 'happy', 'heart']]);
    const handK = ease(seg(t, T_HEART - .12, T_HEART + .06));
    const nods = dip(t, T_HEART + .02, .3) + dip(t, T_HEART + BEAT / 2 + .02, .3);
    xiaoye(X, Y, u, { ...md, lookX: md.eyes === 'look' ? .9 : 0, lookY: -.15, seed: 6, rot: -.03 + .02 * nods,
      mouth: t < T_TALK ? 'flat' : t < T_TALK + .42 ? 'o' : t < T_THUMB + .08 ? 'flat' : 'smile',
      brows: t > T_TALK && t < T_HEART ? 'up' : null, blush: t > T_THUMB,
      dy: .22 * nods, sq: .04 * nods + (md.take || 0), take: 0,
      aL: -1.25, aR: lerp(-1.2, -Math.PI, handK), draw: heartHand(handK) });
    camEnd();
  }

  // =====================================================================================================
  // 4) TIME-LAPSE AT THE DESK  52.03–54.641  "从一张白纸写到窗外亮起清晨"
  // =====================================================================================================
  const T4 = 52.03, T_END = 54.641, THROW = [B(78), B(79), B(80)], FLY = BEAT / 2, T_DONE = 54.36, T_RAY = 54.1;
  const DK = { x: 990, top: 796, y: 912, u: 30 };                      // the low desk (centre, back edge of the top); 小夜 sits behind it
  const HAND_UP = [DK.x - 97, DK.y - 9.6 * DK.u];                     // his throwing (left) hand
  const PILE = [[136, 836, 24], [362, 842, 22], [214, 718, 23], [104, 850, 20], [268, 712, 24], [396, 850, 21], [306, 722, 22],
    [240, 686, 23], [160, 800, 22], [286, 680, 21], [340, 808, 22], [262, 652, 22], [196, 760, 20], [226, 636, 21]];
  const THROW_TO = [3, 6, 9];                                          // the pile slot each throw lands in
  const PILE_T = [0, 0, 0, B(78) + FLY, 52.42, 52.8, B(79) + FLY, 53.1, 53.45, B(80) + FLY, 53.85, 54.12, 54.24, 54.46];   // when each ball joins
  const ZL_AT = [[182, 742, 0], [318, 698, 2], [124, 822, 4]];          // 字灵 dozing in the pile
  const SRC = [1318, 300];                                              // where the first light pours through the left pane (ch4's glare)
  const paperQ = () => { const x = DK.x, y = DK.top; return [[x - 124, y + 10], [x + 80, y + 6], [x + 104, y + 66], [x - 132, y + 70]]; };
  const onPaper = (q, uu, vv) => L2(L2(q[0], q[1], uu), L2(q[3], q[2], uu), vv);

  function lapseState(t) {
    let d = 0; while (d < 3 && t >= THROW[d]) d++;
    const d0 = d === 0 ? T4 : THROW[d - 1] + .08, d1 = d < 3 ? THROW[d] : T_DONE, n = d < 3 ? 5 : 7;
    const wEnd = d < 3 ? d1 - .14 : d1;
    return { d, n, prog: clamp((t - d0) / (wEnd - d0)), crumple: d < 3 ? seg(t, d1 - .14, d1) : 0, since: d > 0 ? t - THROW[d - 1] : 9 };
  }
  // camera: close on the blank page, pulled back by B(78), then settling on the standard studio framing at the cut
  const MID4 = [945, 578, 1.13];                                         // wide enough for the clock, the pile and the window
  const lapseCam = t => t < THROW[0] ? kf(t, [[T4, [990, 766, 2.35]], [THROW[0], MID4]], ease) : kf(t, [[THROW[0], MID4], [T_END, [960, 540, 1.0]]], ease);
  // a low kotatsu-style desk: a gold quilt hangs from the top to the floor and hides his crossed legs
  function lowDesk(x, top) {
    const bw = 216, fw = 244, d = 70, fl = 962, hem = [];
    for (let k = 0; k <= 10; k++) hem.push([lerp(x + fw + 22, x - fw - 22, k / 10), fl + 6 * Math.sin(k * 1.9) + (k % 2 ? 4 : -2)]);
    const quilt = [[x - fw - 4, top + d + 8], [x + fw + 4, top + d + 8], ...hem];
    paint(quilt, { wash: '#E0A84A', fill: '#B8862B', fillOp: 60, tex: .6, border: .5, ink: PAL.ink, sw: 1, curv: .2 });
    for (const f of [.3, .7]) inkLine([[lerp(x - fw, x + fw, f), top + d + 12], [lerp(x - fw - 14, x + fw + 14, f), fl - 4]], 2.2, PAL.cream, 'ink', .2);
    inkLine([[x - fw - 10, top + d + 50], [x + fw + 10, top + d + 50]], 2.2, VIO, 'ink', .2);
    paint([[x - fw, top + d], [x + fw, top + d], [x + fw - 4, top + d + 18], [x - fw + 4, top + d + 18]], { wash: '#6E4A3E', fill: '#4A2E26', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1 });
    paint([[x - bw, top], [x + bw, top], [x + fw, top + d], [x - fw, top + d]], { wash: '#9A6A52', fill: '#6E4A3E', fillOp: 50, tex: .6, border: .5, ink: PAL.ink, sw: 1.1 });
  }
  function paperBall(x, y, r, seed, glow = 0) {
    if (glow > .02) paint(ellPts(x, y, r * 1.9, r * 1.7, 12), { fill: HONEY, fillOp: 70 * glow, bleed: .3, tex: .2, ink: null });
    paint(ellPts(x, y, r, r * .9, 10, r * .12), { wash: PAL.cream, fill: '#E3D6BE', fillOp: 50, tex: .5, ink: PAL.ink, sw: .7 });
    inkLine([[x - r * .5, y - r * .2 + hash(seed) * 4], [x - r * .05, y + r * .15], [x + r * .45, y - r * .25]], .5, '#9A8C74', 'inkfine', .3);
  }
  // one line of scribble on the page, drawn up to fraction f
  function scribble(q, i, n, f, col, sw = 1.1) {
    if (f <= 0) return;
    const vv = .16 + .7 * i / Math.max(1, n - 1), pts = [], m = 9, u1 = .1 + .8 * (.75 + .25 * hash(i * 7.7));
    for (let k = 0; k <= m * f; k++) { const [px, py] = onPaper(q, lerp(.1, u1, k / m), vv); pts.push([px, py + (hash(i * 13 + k) - .5) * 5]); }
    if (pts.length > 1) inkLine(pts, sw, col, 'inkfine', .4);
  }
  // the writing forearm (drawn over the desk) from the shoulder to the pen
  function foreArm(sx, sy, hx, hy, u, pencil) {
    paint(tubePts([[sx, sy], [hx, hy]], 1.05 * u), { wash: XY.col, fill: XY.dk, fillOp: 45, tex: .5, ink: PAL.ink, sw: .9 });
    paint(ellPts(hx, hy, .6 * u, .55 * u, 12), { wash: XY.skin, ink: PAL.ink, sw: .8 });
    if (pencil) { inkLine([[hx - 4, hy + 2], [hx - 24, hy + 26]], 3.4, GOLD, 'ink', 0); inkLine([[hx - 24, hy + 26], [hx - 28, hy + 31]], 1.7, PAL.ink, 'ink', 0); }
  }
  // the window's sky goes pale at the horizon: soft fills kept inside the frame
  function paleDawn(k, win) {
    if (k < .02) return;
    const [wx, wy, ww, wh] = win;
    paint(rectPts(wx + 8, wy + wh * .28, ww - 16, wh * .72 - 10), { fill: '#FFE3D0', fillOp: 70 * k, bleed: .02, tex: .2, border: .1, ink: null });
    paint(rectPts(wx + 8, wy + wh * .56, ww - 16, wh * .44 - 10), { fill: RAY_LT, fillOp: 110 * k, bleed: .02, tex: .2, border: .1, ink: null });
  }
  // the first ray of morning: glare in the left pane, a warm gold-cream shaft growing down behind him onto the desk
  const RAY_S = [[SRC[0] - 70, SRC[1] - 48], [SRC[0] + 92, SRC[1] + 150]], RAY_E = [[DK.x - 214, DK.top + 12], [DK.x + 132, DK.top + 72]];
  function rayShaft(k, t) {
    if (k < .01) return;
    const [s0, s1] = RAY_S, f0 = L2(s0, RAY_E[0], k), f1 = L2(s1, RAY_E[1], k), band = (a, b) => [L2(s0, s1, a), L2(s0, s1, b), L2(f0, f1, b), L2(f0, f1, a)];
    paint(ellPts(SRC[0], SRC[1], 150, 130, 16), { fill: HONEY, fillOp: 70 * k, bleed: .2, tex: .2, border: .1, ink: null });
    paint([s0, s1, f1, f0], { fill: HONEY, fillOp: 90 * k, bleed: .08, tex: .2, border: .15, ink: null });
    paint(band(.12, .88), { wash: RAY, washOp: 120 * k, ink: null });
    paint(band(.34, .66), { wash: RAY_LT, washOp: 150 * k, ink: null });
    for (const a of [.22, .5, .78]) inkLine([L2(s0, s1, a), L2(f0, f1, a + .03)], 1.2, RAY_LT, 'inkfine', 0);
    for (let i = 0; i < 14; i++) {                                                         // dust motes drifting in the light
      const a = hash(i * 3.1), b = frac(hash(i * 5.7) + t * .15);
      if (b < k) { const p = L2(L2(s0, s1, a), L2(f0, f1, a), b / Math.max(k, .01)); paint(starPts(p[0], p[1], (4 + 5 * hash(i)) * Math.sin(b * Math.PI), .35, 4), { wash: RAY_LT, ink: null }); }
    }
    paint(ellPts(SRC[0], SRC[1], 70, 60, 12), { wash: RAY_LT, washOp: 150 * k, ink: null });
  }
  // where it lands: a warm pool on the desk top and the page (drawn over the desk)
  function rayPool(k) {
    const pool = seg(k, .7, 1); if (pool <= 0) return;
    paint([[DK.x - 214, DK.top + 8], [DK.x + 120, DK.top + 4], [DK.x + 150, DK.top + 68], [DK.x - 226, DK.top + 70]], { fill: RAY_LT, fillOp: 150 * pool, bleed: .08, tex: .2, ink: null });
    paint([[DK.x - 150, DK.top + 14], [DK.x + 60, DK.top + 10], [DK.x + 80, DK.top + 62], [DK.x - 160, DK.top + 64]], { wash: RAY, washOp: 70 * pool, ink: null });
  }

  function lapseShot(t, lt, dur) {
    const S = lapseState(t), [ccx, ccy, cz] = lapseCam(t);
    const dawn = .42 * ease(seg(t, 52.2, 54.5)), neonK = ease(seg(t, 52.5, 54.2)), rayK = easeOut(seg(t, T_RAY, T_RAY + .42));
    camBegin(ccx, ccy, cz, 0);
    const clock = 2 + 3.45 * seg(t, T4, 54.6);
    const L = studioBack(t, { dawn, clock, neon: lerp(1, .85, seg(t, 54.2, 54.6)), neonA: mixCol(NEON_GOLD, NEON.cyan, neonK), neonB: mixCol(NEON_VIO, NEON.magenta, neonK),
      level: .15 + .7 * hash(Math.floor(t * 12)), bin: .3 + .7 * seg(t, T4, 54.6) });
    paleDawn(ease(seg(t, 53.0, 54.45)), L.window);
    // the clock hands blur as they fly round
    const am = frac(clock) * TAU - Math.PI / 2, [ckx, cky] = L.clock, fan = [[ckx, cky]];
    for (let k = 0; k <= 6; k++) { const a = am - .9 + k * .15; fan.push([ckx + Math.cos(a) * 36, cky + Math.sin(a) * 36]); }
    if (t < 54.52) paint(fan, { wash: PAL.ink, washOp: 50, ink: null });
    mic(L.mic[0], L.mic[1], 1, { on: .2 + .8 * rayK });
    // the overflowing pile round the bin, with 字灵 dozing in it (they wake in the morning light)
    const wakeZ = seg(t, T_RAY + .3, T_RAY + .45);
    ZL_AT.forEach(([zx, zy, g], i) => ziling(zx, zy, 9, { seed: i + 2, glyph: g, glow: .7 + .3 * wakeZ, eyes: wakeZ > .5 ? 'happy' : 'closed', mouth: wakeZ > .5 ? 'smile' : 'flat', dy: -.3 * wakeZ }));
    PILE.forEach(([px, py, r], i) => {
      const pt = PILE_T[i]; if (t < pt) return;
      const thrown = THROW_TO.includes(i), pop = thrown ? 1 : backOut(seg(t, pt, pt + .1));
      const bounce = thrown ? Math.exp(-(t - pt) * 10) * Math.abs(Math.sin((t - pt) * 22)) * 18 : 0;
      paperBall(px, py - bounce, r * pop, i, .3);
    });
    emote('zzz', ZL_AT[0][0] + 20, ZL_AT[0][1] - 40, 8, 1 - wakeZ);
    // a thrown ball in flight to the pile: leaves his hand on the beat, lands half a beat later, trailing motion lines
    THROW.forEach((b, j) => {
      const tgt = PILE[THROW_TO[j]], k = seg(t, b, b + FLY); if (k <= 0 || k >= 1) return;
      const at = kk => arcPt(HAND_UP, [tgt[0], tgt[1]], 250, clamp(kk));      // a low lob that passes under the mic capsule
      for (const off of [-12, 12]) inkLine([.3, .2, .1].map(d => { const [px, py] = at(k - d); return [px, py + off]; }), 1.6, PAL.cream, 'inkfine', .5);
      const [bx, by] = at(k);
      push(); translate(bx, by); rotate(k * 9); paperBall(0, 0, tgt[2], j); pop();
    });
    // 小夜 at the desk, in time-lapse stutter
    const { x, top, y, u } = DK, since = S.since, done = t > T_DONE;
    const stut = hash(Math.floor(t * 8) * 7.3 + S.d * 3.1);
    let pose = 'write';
    if (since < .16) pose = 'throw';
    else if (S.crumple > 0) pose = 'crumple';
    else if (done || rayK > .55) pose = 'done';
    else if (stut > .86) pose = S.d > 0 ? 'yawn' : 'think';
    else if (stut > .72) pose = 'think';
    else if (stut > .56) pose = 'write2';
    const hideL = pose !== 'yawn' && pose !== 'throw', hideR = pose !== 'yawn' && pose !== 'think';
    const P = {
      write: { eyes: 'look', lookX: .2, lookY: 1, mouth: 'flat', rot: -.03 },
      write2: { eyes: 'look', lookX: -.3, lookY: 1, mouth: 'o', rot: .04, dy: .08 },
      think: { eyes: 'look', lookX: .5, lookY: -1, mouth: 'wobble', aR: 1.35 },
      yawn: { eyes: 'closed', mouth: 'O', aL: 1.35, aR: 1.35, sq: -.05 },
      crumple: { eyes: 'narrow', mouth: 'wobble', brows: 'angry', sq: .04 },
      throw: { eyes: 'closed', mouth: 'smile', aL: 1.1, rot: -.05 },
      done: { eyes: rayK > .6 ? 'spark' : 'look', lookX: .8, lookY: -1, mouth: rayK > .6 ? 'grin' : 'o', blush: true, glow: .6 * rayK },
    }[pose];
    const tired = S.d === 2 && pose === 'write' && stut < .2;
    rayShaft(rayK, t);
    const lit = seg(rayK, .5, 1);
    if (lit > 0) paint(ellPts(x + 20, y - 9 * u, 4.2 * u, 3.8 * u, 16), { fill: HONEY, fillOp: 110 * lit, bleed: .2, tex: .2, border: .1, ink: null });
    xiaoye(x, y, u, { seed: 2, noShadow: true, ...P, eyes: tired ? 'sleepy' : P.eyes, aL: hideL ? Math.PI : P.aL, aR: hideR ? -Math.PI : P.aR });
    lowDesk(x, top);
    rayPool(rayK);
    // the page: this draft's lines, the pen at the end of the current one; crumpling squeezes it into a ball
    const q = paperQ(), cq = L2(q[0], q[2], .5);
    const shrink = 1 - .85 * easeIn(S.crumple), fresh = S.d > 0 ? backOut(seg(t, THROW[S.d - 1] + .06, THROW[S.d - 1] + .18)) : 1;
    const qs = q.map(([px, py]) => [cq[0] + (px - cq[0]) * shrink * fresh, cq[1] + (py - cq[1]) * shrink * fresh]);
    if (S.d === 0 || since > .06) {
      const lines = S.prog * S.n, glowK = seg(rayK, .6, 1);
      paint(qs, { wash: mixCol(PAL.cream, RAY_LT, glowK), fill: mixCol('#EFE3CC', RAY, glowK), fillOp: 40 + 60 * glowK, tex: .4, ink: PAL.ink, sw: .8 });
      for (let i = 0; i < S.n; i++) scribble(qs, i, S.n, clamp(lines - i), mixCol(PAL.ink, GOLD_DK, glowK), 1.1 + .4 * glowK);
      if (S.crumple > .3) paperBall(cq[0], cq[1], 22 * S.crumple, 9);
    }
    const shL = [x - 1.8 * u, y - 6.8 * u], shR = [x + 1.8 * u, y - 6.8 * u];
    if (hideL) foreArm(shL[0], shL[1], x - 160 + (pose === 'crumple' ? 96 : 0), top + 42, u, false);
    if (hideR) {
      const cur = Math.min(S.n - 1, Math.floor(S.prog * S.n)), f = frac(S.prog * S.n);
      let [px, py] = onPaper(qs, .1 + .7 * f, .16 + .7 * cur / (S.n - 1));
      if (pose === 'crumple') [px, py] = [cq[0] + 36, cq[1] - 4];
      if (pose === 'done') [px, py] = [x + 116, top + 46];
      foreArm(shR[0], shR[1], px + 14, py - 18, u, pose !== 'crumple' && pose !== 'done');
    }
    camEnd();
    flash(.04 * hash(Math.floor(t * 12) * 3.3) * (1 - rayK), '#FFF6E0');                    // time-lapse exposure flicker
  }

  chapter('ownpace', 43.974, 54.641, [[43.974, gateShot], [46.8, raceShot], [49.48, mirrorShot], [52.03, lapseShot]]);
})();
