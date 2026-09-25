// c02_chorus1: Chorus 1, recording the light (22.641–43.974). Storyboard § 2. Neon cyan and magenta, warm gold light.
// Shots: out of the ON-light flash the mic drinks a golden whirlpool of zilings, every gulp runs down the cable and slams
// the meters · snag, SPLAT, a start line, blast off · face squashed on the window over the sleeping city · the song flies
// out as a ribbon into the tallest building's ear and the camera rides it back in · studio dance party · the room heaves,
// the noisies sway at the door, the door bursts and the light fills the frame (brush wipe at 43.974).
(() => {
  const B = n => OFF + n * BEAT;                       // song time of beat n (beat 33 = 22.641 … beat 65 = 43.974)
  const CY = NEON.cyan, MG = NEON.magenta, GOLD = '#F6B94A', GOLD_L = '#FFD36B', GOLD_C = '#FFF1C8', AMBER = '#E08A2E';
  const boilN = t => Math.floor(t * BOIL);

  // ======================================================================================================================
  // path helpers
  // ======================================================================================================================
  function smooth(P, n = 6) {                          // Catmull-Rom through the points
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[Math.max(0, i - 1)], b = P[i], c = P[i + 1], d = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < n; k++) {
        const u = k / n, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map(j => .5 * (2 * b[j] + (c[j] - a[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * u3)));
      }
    }
    out.push(P[P.length - 1].slice(0, 2));
    return out;
  }
  function lens(P) { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; }
  function at(P, L, d) {                               // [x, y, heading] at arc length d
    d = clamp(d, 0, L[L.length - 1]); let i = 1; while (i < L.length - 1 && L[i] < d) i++;
    const f = (d - L[i - 1]) / ((L[i] - L[i - 1]) || 1);
    return [lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f), Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0])];
  }
  function sub(P, L, d0, d1) {                         // the stretch of path between arc lengths d0 and d1
    const out = [at(P, L, d0)];
    for (let i = 0; i < P.length; i++) if (L[i] > d0 && L[i] < d1) out.push(P[i]);
    out.push(at(P, L, d1));
    return out;
  }
  function tubeW(path, ws) {                           // polygon around a polyline, one width per point
    const A = [], Z = [];
    path.forEach((p, i) => {
      const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const w = Math.max(.5, ws[i]) / 2, nx = -(b[1] - a[1]) / d * w, ny = (b[0] - a[0]) / d * w;
      A.push([p[0] + nx, p[1] + ny]); Z.push([p[0] - nx, p[1] - ny]);
    });
    return A.concat(Z.reverse());
  }
  // a band of warm light along a path: soft glow, amber edge, gold body, cream core (washes only: these have many vertices)
  function lightBand(path, ws, op = 1) {
    if (path.length < 2) return;
    paint(tubeW(path, ws.map(w => w * 2.3 + 18)), { wash: GOLD_L, washOp: 50 * op, ink: null });
    paint(tubeW(path, ws.map(w => w + 5)), { wash: AMBER, washOp: 190 * op, ink: null });
    paint(tubeW(path, ws), { wash: GOLD, washOp: 245 * op, ink: null });
    paint(tubeW(path, ws.map(w => w * .42)), { wash: GOLD_C, washOp: 235 * op, ink: null });
  }
  const glowDot = (x, y, r, op = 1) => { paint(ellPts(x, y, r * 2.4, r * 2.2, 12), { fill: GOLD_L, fillOp: 90 * op, bleed: .3, tex: .2, border: .1, ink: null }); paint(ellPts(x, y, r, r, 12), { wash: GOLD_C, washOp: 250 * op, ink: null }); };
  const sparkle = (x, y, r, rot, col = GOLD_C) => paint(starPts(x, y, r, .32, 4, rot), { wash: col, ink: null });
  function rings(x, y, age, life, r0, r1, cols, sq = .8) {   // sound waves rippling out
    if (age < 0 || age > life) return;
    const k = age / life;
    for (let j = 0; j < 2; j++) {
      const q = clamp(k * 1.15 - j * .15); if (q <= 0 || q >= 1) continue;
      const r = lerp(r0, r1, easeOut(q));
      paint(ellPts(x, y, r, r * sq, 30), { ink: cols[j % cols.length], sw: 2.6 * (1 - q) + .3, br: 'ink' });
    }
  }
  function puff(x, y, r, op, col = '#E9DDF0') { if (op > 4 && r > 2) paint(ellPts(x, y, r, r * .8, 12, r * .06), { fill: col, fillOp: op, bleed: .2, tex: .4, border: .4, ink: null }); }
  function note(x, y, s, rot, col) {                   // a painted eighth note, head at (x, y)
    push(); translate(x, y); rotate(rot); scale(s);
    inkLine([[9, -2], [9, -44], [26, -30]], 2.2, PAL.ink, 'ink', .2);
    paint(ellPts(0, 0, 12, 9, 12, 0, -.35), { wash: col, ink: PAL.ink, sw: .8 });
    pop();
  }

  // ======================================================================================================================
  // the studio pieces this chapter moves: the mic at studioBack's spot, its cable (drawn here so it can snag a foot and
  // carry light), dengdeng on the street corner seen through the right pane of the window
  // ======================================================================================================================
  const MIC = [760, 830], MS = .72, CAP = [MIC[0], MIC[1] - 480 * MS], MIXER = [1560, 650];
  const CAB0 = [MIC[0] + 20 * MS, MIC[1] - 10 * MS];
  const CABLE_K = [CAB0, [796, 862], [900, 884], [1060, 886], [1250, 882], [1420, 866], [1508, 800], [1548, 712], MIXER];
  const ROUTE = smooth([[CAP[0], CAP[1] + 60 * MS], [MIC[0], MIC[1] - 70 * MS], [MIC[0] + 6, MIC[1] - 30 * MS], ...CABLE_K], 6), ROUTE_L = lens(ROUTE);
  function cablePts(snag) {                            // snag = [x, y, k]: the cable lifted to a foot
    if (!snag || snag[2] <= 0) return smooth(CABLE_K, 5);
    const [sx, sy, k] = snag, P = CABLE_K.filter(p => Math.abs(p[0] - sx) > 70);
    const yc = x => { const i = CABLE_K.findIndex(p => p[0] > x); const a = CABLE_K[Math.max(0, i - 1)], b = CABLE_K[Math.max(1, i)]; return lerp(a[1], b[1], clamp((x - a[0]) / ((b[0] - a[0]) || 1))); };
    const ins = [[sx - 70, lerp(yc(sx - 70), sy, .25 * k)], [sx, lerp(yc(sx), sy, k)], [sx + 70, lerp(yc(sx + 70), sy, .25 * k)]];
    const Q = P.concat(ins).sort((a, b) => a[0] - b[0]);
    Q[0] = CAB0; return smooth(Q, 5);
  }
  function cable(snag) { inkLine(cablePts(snag), 2.4 * MS, '#1E1830', 'ink', .2); }
  const studioMic = (o = {}) => mic(MIC[0], MIC[1], MS, { cable: [MIC[0] + 44, MIC[1] + 26], ...o });
  function capsuleGulp(b) {                            // mic()'s capsule redrawn swollen with a mouthful of light (b 0..1)
    if (b < .03) return;
    const s = MS, [cx, cy] = CAP, sw = clamp(1.2 * s, .5, 1.8);
    push(); translate(cx, cy - 5 * s); scale(1 + .2 * b, 1 - .09 * b); translate(-cx, -(cy - 5 * s));
    paint(rrPts(cx - 34 * s, cy - 80 * s, 68 * s, 150 * s, 32 * s), { wash: mixCol('#C9CED6', GOLD_L, .55 * b), ink: PAL.ink, sw });
    paint(ellPts(cx, cy - 20 * s, 26 * s, 50 * s, 12), { fill: GOLD_C, fillOp: 200 * b, bleed: .2, tex: .3, ink: null });
    for (let k = 0; k < 6; k++) inkLine([[cx - 26 * s, cy - 60 * s + k * 16 * s], [cx + 26 * s, cy - 60 * s + k * 16 * s]], .5, mixCol('#7E8698', AMBER, b), 'inkfine', 0);
    paint(rectPts(cx - 34 * s, cy + 6 * s, 68 * s, 14 * s), { wash: CY, ink: PAL.ink, sw: sw * .5 });
    paint(ellPts(cx - 12 * s, cy - 50 * s, 8 * s, 18 * s, 8), { wash: '#FFFFFF', washOp: 170, ink: null });
    pop();
  }
  const DDW = [1625, 553], DDU = 9.5;
  const ddWin = o => dengdeng(DDW[0], DDW[1], DDU, o);

  // ======================================================================================================================
  // 1 · 22.641–25.41 "把这束光录进声音里面": out of the ON-light flash, the words he sings pour out as a golden whirlpool of
  // zilings; the mic drinks it like water. Each gulp (beats 34–37) runs down the stand and the cable into the mixer:
  // the meters slam to the top, sound rings ripple out.
  // ======================================================================================================================
  const XS = [1085, 860], XU = 37;
  const GULPS = [B(34), B(35), B(36), B(37)], RUN = BEAT * .92;
  const ARRIVE = GULPS.map(g => g + RUN);
  function vortexPt(q, t) {                            // q 0 = at his mouth … 1 = inside the capsule
    const a = .47 + q * TAU * 1.15 + .06 * Math.sin(t * 3.1 + q * 8), r = 330 * Math.pow(1 - q, .85);
    return [CAP[0] + Math.cos(a) * r, CAP[1] + 12 * (1 - q) + Math.sin(a) * r * .46, Math.sin(a)];
  }
  // a mouthful swelling along the last stretch in the quarter second before each gulp
  const swallowQ = t => { const g = GULPS.find(g => t > g - .28 && t <= g + .02); return g == null ? -1 : lerp(.5, 1, seg(t, g - .28, g)); };
  const vortexW = (q, sq) => (14 + 40 * clamp(q * 6) * (1 - q * .72)) * (1 + (sq < 0 ? 0 : .7 * Math.exp(-Math.pow((q - sq) * 11, 2))));
  // the whirlpool from q0 to q1, split into the runs behind (sin < 0) and in front (sin > 0) of the mic and the singer
  function vortexRuns(t, q0, q1) {
    const runs = [[], []], sq = swallowQ(t); let cur = null;
    for (let i = 0; i <= 44; i++) {
      const q = lerp(q0, q1, i / 44), p = vortexPt(q, t), s = p[2] > 0 ? 1 : 0, w = vortexW(q, sq);
      if (!cur || cur.side !== s) {                    // neighbouring runs overlap by one segment so the band stays whole
        const nr = { side: s, pts: [], ws: [] };
        if (cur) { cur.pts.push(p); cur.ws.push(w); nr.pts.push(cur.pts[cur.pts.length - 2]); nr.ws.push(cur.ws[cur.ws.length - 2]); runs[cur.side].push(cur); }
        cur = nr;
      }
      cur.pts.push(p); cur.ws.push(w);
    }
    if (cur) runs[cur.side].push(cur);
    return runs.map(rs => rs.filter(r => r.pts.length > 1));
  }
  function flowMarks(t, q0, q1, side) {                // cream dashes sliding down the whirlpool: it is being drunk
    for (let j = 0; j < 16; j++) {
      const q = frac((t - 22.641) * .75 + j / 16); if (q < q0 || q + .03 > q1) continue;
      const a = vortexPt(q, t), b = vortexPt(q + .03, t); if ((a[2] > 0 ? 1 : 0) !== side) continue;
      inkLine([a, b], 2.2 * (1 - q * .5), GOLD_C, 'ink', 0);
    }
  }
  const ZN = 10;
  function vortexZilings(t, conv, side) {              // zilings riding the whirlpool (converging from a loose orbit at the start)
    const ts = t - 22.641;
    for (let i = 0; i < ZN; i++) {
      const q = frac(ts * .38 + i / ZN); if (q > .95) continue;
      const v = vortexPt(q, t), b = ease(clamp(conv * 1.5 - i * .05));
      const fa = i / ZN * TAU + t * 1.1, F = [CAP[0] + 170 + 430 * Math.cos(fa), CAP[1] + 40 + 230 * Math.sin(fa)];
      const x = lerp(F[0], v[0], b), y = lerp(F[1], v[1], b), front = b > .5 ? v[2] > 0 : Math.sin(fa) > 0;
      if ((front ? 1 : 0) !== side) continue;
      const u = lerp(16, 6, Math.pow(q, 1.2)) * lerp(1.1, 1, b);
      ziling(x, y + 1.4 * u, u, { seed: i, glyph: i % 5, eyes: i % 3 ? 'happy' : 'normal', mouth: i % 2 ? 'O' : 'smile', rot: .25 * Math.sin(t * 5 + i), glow: .8 });
    }
  }
  function recordShot(t, lt) {
    const bp = bpOf(t), conv = ease(seg(t, 22.641, 23.35));
    const lastG = GULPS.filter(g => g <= t).pop(), gk = lastG != null ? Math.exp(-(t - lastG) * 6) : 0;
    const lastA = ARRIVE.filter(a => a <= t).pop(), aAge = lastA != null ? t - lastA : 9;
    const slam = aAge < .14 ? 1 : Math.exp(-(aAge - .14) * 4);
    const k1 = ease(seg(t, 22.641, 23.55)), k2 = ease(seg(t, 23.55, 25.41));
    const [sx, sy] = shakeXY(t, 3 * gk + 4 * (aAge < .2 ? 1 - aAge / .2 : 0));
    camBegin(lerp(lerp(800, 935, k1), 1040, k2) + sx, lerp(lerp(508, 572, k1), 590, k2) + sy, lerp(lerp(2.15, 1.18, k1), 1.07, k2) + .012 * pulse(t, 6), 0);
    studioBack(t, { level: lastA != null ? .3 + .7 * slam : .3 + .12 * pulse(t, 4), neon: .8 + .2 * pulse(t, 4), bin: .5 });
    ddWin({ light: 'red', eyes: 'sleepy', mouth: 'O', aL: -.6, aR: -.7 + .1 * Math.sin(t * 2), dy: -.2 * Math.abs(Math.sin(bp * Math.PI)) });
    cable();
    // the gulp running down the stand and along the cable, a glowing stretch trailing behind it
    GULPS.forEach(g => {
      const k = (t - g) / RUN; if (k <= 0 || k >= 1) return;
      const d = ROUTE_L[ROUTE_L.length - 1] * (easeIn(k) * .35 + k * .65), tail = sub(ROUTE, ROUTE_L, Math.max(0, d - 190), d);
      paint(tubeW(tail, tail.map((p, i) => 3 + 17 * i / (tail.length - 1))), { wash: GOLD_L, washOp: 210, ink: null });
      const p = at(ROUTE, ROUTE_L, d); glowDot(p[0], p[1], 15);
      sparkle(p[0] + 14 * Math.cos(t * 30), p[1] - 18 + 8 * Math.sin(t * 23), 11, t * 9);
    });
    const runs = vortexRuns(t, 0, conv);
    for (const r of runs[0]) lightBand(r.pts, r.ws, .95);
    flowMarks(t, 0, conv, 0);
    vortexZilings(t, conv, 0);
    studioMic({ on: 1, glow: .35 + .65 * gk });
    capsuleGulp(gk);
    // the singer: eyes shut on the first words, then happy; one hand at the headphones, the other offering the words
    const m = move('bounce', t), md = mood(t, [[22.641, 'closed'], [B(35) + .12, 'happy', 'music']]);
    xiaoye(XS[0], XS[1], XU, { dy: m.dy * .4, sq: m.sq * .7, rot: .03 * Math.sin(bp * Math.PI) - .03, aL: .55 + .1 * Math.sin(t * 5), aR: .95 + .08 * Math.sin(t * 4), ...md, mouth: 'sing', glow: .45 + .55 * pulse(t, 5), blush: true });
    for (const r of runs[1]) lightBand(r.pts, r.ws, 1);
    flowMarks(t, 0, conv, 1);
    vortexZilings(t, conv, 1);
    // gulp: a ring off the capsule; arrival: the mixer lights up, notes pop out and rings roll across the room
    GULPS.forEach(g => rings(CAP[0], CAP[1], t - g, .6, 60, 190, [CY, GOLD_L]));
    ARRIVE.forEach((a, i) => {
      const age = t - a; if (age < 0 || age > 1.3) return;
      if (age < .35) paint(ellPts(MIXER[0], MIXER[1] - 20, 200, 80, 14), { wash: GOLD_L, washOp: 110 * (1 - age / .35), ink: null });
      rings(MIXER[0], MIXER[1] - 20, age, 1.05, 120, 430, i % 2 ? [MG, CY] : [CY, MG], .55);
      for (let j = 0; j < 3; j++) { const k = clamp(age / 1.1 - j * .08); if (k > 0 && k < 1) note(MIXER[0] - 110 + j * 110 + 40 * Math.sin(k * 5 + j), MIXER[1] - 70 - 300 * easeOut(k), .9 + .3 * (1 - k), .25 * Math.sin(t * 6 + j), [GOLD_C, CY, MG][(i + j) % 3]); }
    });
    camEnd();
    flash(1 - ease(seg(t, 22.641, 22.97)));
  }

  // ======================================================================================================================
  // 2 · 25.41–28.25 "让每次跌倒都成为起点": grooving sideways, the cable snags his foot (beat 38), SPLAT flat on the floor
  // (beat 39, "跌倒"); a start line chalks itself at his fingertips, a flag pops up, dengdeng flashes green; he springs up
  // into a sprinter's crouch (beat 40) and blasts off on beat 41, the camera whips after him.
  // ======================================================================================================================
  const T_SNAG = B(38), T_FALL = B(39), T_UP = B(40), T_GO = B(41);
  const LINE_X = 1680, X_LIE = 1188, X_SET = 1465;
  function sprinter(t) {                               // xiaoye's pose and place through the shot
    const u = XU;
    if (t < T_SNAG) {                                  // grooving sideways to the right, still singing
      const k = seg(t, 25.41, T_SNAG), m = move('walk', t);
      return { x: lerp(XS[0], 1150, ease(k)), o: { walk: m.walk, dy: m.dy, aL: .6 + .5 * Math.sin(bpOf(t) * Math.PI), aR: .9 - .5 * Math.sin(bpOf(t) * Math.PI), eyes: 'happy', mouth: 'sing', glow: .6, blush: true } };
    }
    if (t < T_FALL) {                                  // snagged: lurch, windmill, topple forward
      const k = seg(t, T_SNAG, T_FALL), lurch = backOut(seg(t, T_SNAG, T_SNAG + .2)) * .32, fall = easeIn(seg(t, T_SNAG + .28, T_FALL));
      const md = mood(t, [[T_SNAG - .3, 'happy'], [T_SNAG + .02, 'scared', '!']]);
      return { x: 1150 + 40 * k, o: { rot: lerp(lurch + .06 * Math.sin(t * 30), Math.PI / 2, fall), dy: -3.25 * fall, aL: 1.1 + 1.3 * Math.sin(t * 27), aR: 1.1 - 1.3 * Math.sin(t * 27 + 1.3), ...md, mouth: 'O', glow: .3, emote: md.emote, emoteK: md.emoteK * (1 - fall) } };
    }
    if (t < T_UP) {                                    // SPLAT, dazed on the floor
      const age = t - T_FALL, flat = .3 * Math.exp(-age * 8) * Math.cos(age * 26);
      return { x: X_LIE, o: { rot: Math.PI / 2, dy: -3.25 + .15 * Math.exp(-age * 10), sq: -flat, aL: 1.45, aR: 1.5, eyes: 'swirl', mouth: 'wobble', glow: .2 } };
    }
    if (t < T_GO) {                                    // spring up on beat 40, crouch into the set stance, then wind up: legs spin in place
      const k = seg(t, T_UP, T_UP + .26), up = backOut(k), hop = Math.sin(clamp(k) * Math.PI) * 1.1;
      const set = ease(seg(t, T_UP + .15, T_UP + .27)), wind = seg(t, T_GO - .22, T_GO), md = mood(t, [[T_UP - .5, 'swirl'], [T_UP + .05, 'narrow']]);
      return { x: lerp(X_LIE, X_SET, ease(k)) + (set > .9 ? jit(1.5 + 3 * wind) : 0), o: { rot: lerp(Math.PI / 2, .4, up) - .12 * wind, dy: lerp(-3.25, 0, clamp(k * 1.5)) - hop - .5 * wind * Math.abs(Math.sin(t * 40)), sq: .32 * set * (1 - .5 * wind) - .1 * (1 - set) * Math.sin(k * Math.PI), run: wind > 0 ? t * 9 : .25 * set, aL: lerp(1.4, 1.2, up), aR: lerp(1.4, -1.0, up) + .5 * wind, ...md, eyes: md.eyes === 'narrow' ? 'look' : md.eyes, lookX: 1, lookY: .3, brows: 'angry', mouth: wind > 0 ? 'grin' : 'flat', glow: .5 + .5 * wind } };
    }
    const age = t - T_GO;                              // GO: stretch and blast off to the right
    return { x: X_SET + 3300 * Math.pow(age, 1.2), o: { rot: .3, run: t * 4.5, dy: -Math.abs(Math.sin(t * 28)) * .6, sq: -.2 * Math.exp(-age * 7), aL: 1.2 * Math.sin(t * 28), aR: -1.2 * Math.sin(t * 28), eyes: 'narrow', brows: 'angry', mouth: 'grin', glow: 1 } };
  }
  function whipStreaks(k, cols) {                      // screen space: the camera whips so fast the frame smears into bands
    if (k <= .01) return;
    flash(.6 * k, '#3A2F6A');
    for (let i = 0; i < 16; i++) {
      const y = hash(i * 3.3 + 1) * 1160 - 40, h = (16 + 60 * hash(i * 5.1 + 2)) * (.4 + .6 * k), x = -700 + hash(i * 7.7) * 500;
      paint(rectPts(x, y, W + 1400, h, 5), { wash: cols[i % cols.length], washOp: 215 * k, ink: null });
      if (i % 3 === 0) inkLine([[x + 300, y + h / 2], [x + 1900, y + h / 2]], .6, PAL.ink, 'inkfine', 0);
    }
  }
  function startLine(t) {                              // a checkered race strip chalks itself across the floor, back to front
    const k = ease(seg(t, 26.86, 27.16)); if (k <= 0) return;
    const a = [LINE_X + 30, 836], b = [LINE_X - 44, 1050], n = 9, cw = 34;
    for (let i = 0; i < n; i++) {
      const q0 = i / n, q1 = (i + 1) / n; if (q0 > k) break;
      const q1k = Math.min(q1, k), P = q => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)], p0 = P(q0), p1 = P(q1k), w = cw * lerp(.8, 1.15, q0);
      for (const c of [0, 1]) paint([[p0[0] - w + c * w, p0[1]], [p0[0] + c * w, p0[1]], [p1[0] + c * w, p1[1]], [p1[0] - w + c * w, p1[1]]], { wash: (i + c) % 2 ? PAL.ink : PAL.cream, washOp: 235, ink: null });
    }
    const e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    inkLine([[a[0] - cw * .8, a[1]], [e[0] - cw * 1.1, e[1]]], .8, PAL.ink, 'inkfine', 0);
    inkLine([[a[0] + cw * .8, a[1]], [e[0] + cw * 1.1, e[1]]], .8, PAL.ink, 'inkfine', 0);
    if (k < 1) puff(e[0], e[1], 34, 160, PAL.cream);
    // the little flag at the back end of the strip
    const f = backOut(seg(t, 27.12, 27.34)); if (f <= .02) return;
    const fx = a[0] + 36, fy = a[1] + 2, wave = Math.sin(t * 9) * 8 + (t > T_GO ? 22 * Math.exp(-(t - T_GO) * 3) * Math.sin(t * 30) : 0);
    push(); translate(fx, fy); scale(f);
    inkLine([[0, 0], [0, -120]], 1.3, '#4F5A72', 'ink', 0);
    paint([[0, -120], [70 + wave * .3, -104 + wave], [0, -80]], { wash: MG, fill: PAL.rose, fillOp: 60, ink: PAL.ink, sw: .8, curv: .15 });
    paint(starPts(24, -101 + wave * .4, 10, .42, 5), { wash: GOLD_C, ink: null });
    paint(ellPts(0, -122, 5, 5, 8), { wash: GOLD, ink: PAL.ink, sw: .5 });
    pop();
  }
  function tripShot(t, lt) {
    const bp = bpOf(t), P = sprinter(t), u = XU;
    const fallAge = t - T_FALL, hitK = fallAge > 0 ? Math.exp(-fallAge * 7) : 0, goAge = t - T_GO;
    const kA = ease(seg(t, 25.41, T_FALL)), kB = ease(seg(t, T_FALL, T_GO)), kC = ease(seg(t, T_GO, 28.25));
    const [sx, sy] = shakeXY(t, 16 * hitK + (goAge > 0 && goAge < .3 ? 6 : 0));
    const cx = lerp(lerp(lerp(1040, 1265, kA), 1330, kB), 1440, kC), cy = lerp(lerp(lerp(590, 655, kA), 690, kB), 660, kC);
    camBegin(cx + sx, cy + sy, lerp(lerp(lerp(1.07, 1.12, kA), 1.17, kB), 1.12, kC) + .04 * hitK, 0);
    studioBack(t, { neon: .85 + .15 * pulse(t, 4), bin: .5 });
    // dengdeng: dozing on red, then flashes green ("go on!") as the start line appears
    const green = t > 27.02, gk = green ? Math.exp(-(t - 27.02) * 2.5) : 0;
    if (green) paint(ellPts(DDW[0], DDW[1] - 8.85 * DDU, 70 + 60 * gk, 70 + 60 * gk, 14), { fill: '#3DC47A', fillOp: 90 + 100 * gk, bleed: .3, tex: .2, ink: null });
    ddWin(green ? { light: 'green', eyes: 'happy', mouth: 'grin', aL: 1.2 + .4 * Math.sin(t * 14), aR: 1.1 - .3 * Math.sin(t * 14), dy: -Math.abs(Math.sin(bp * Math.PI)) * 1.2, emote: 'spark', emoteK: seg(t, 27.05, 27.25) * (1 - seg(t, 27.9, 28.1)) }
                 : { light: 'red', eyes: t > 26.7 ? 'look' : 'sleepy', lookX: -1, lookY: .6, mouth: t > T_FALL ? 'O' : 'flat', aL: -.6, aR: -.7 });
    // the cable, snagged on his foot from beat 38 until he hits the floor
    const snagK = t > T_SNAG && t < T_FALL + .1 ? backOut(seg(t, T_SNAG, T_SNAG + .12)) * (1 - seg(t, T_FALL - .05, T_FALL + .1)) : 0;
    const fx = P.x - .9 * u + (P.o.rot ? Math.sin(P.o.rot) * .5 * u : 0);
    cable(snagK > 0 ? [fx, 852 - 60 * seg(t, T_SNAG + .25, T_FALL), snagK] : null);
    // the last of the whirlpool drains into the mic
    const drain = ease(seg(t, 25.41, 25.95));
    if (drain < 1) { const runs = vortexRuns(t, drain, 1); for (const r of [...runs[0], ...runs[1]]) lightBand(r.pts, r.ws, 1 - drain * .5); }
    studioMic({ on: 1, glow: .3 * (1 - drain) + .15 });
    startLine(t);
    // impact splash and dust from the SPLAT, dust from the launch
    if (fallAge > 0 && fallAge < .3) { const k = fallAge / .3; paint(starPts(X_LIE + 260, 820, 110 + 120 * easeOut(k), .5, 9, .2), { wash: GOLD_C, washOp: 190 * (1 - k), ink: null }); }
    if (fallAge > 0 && fallAge < .7) for (let i = 0; i < 6; i++) { const k = fallAge / .7, px = X_LIE + 20 + i * 70 + (i - 2.5) * 50 * k; puff(px, 858 - 30 * k - 10 * (i % 2), (30 + 26 * (i % 3)) * (.5 + k), 170 * (1 - k)); }
    const windAge = t - (T_GO - .22);
    if (windAge > 0 && goAge < 0) for (let i = 0; i < 4; i++) { const k = frac(windAge * 5 + i / 4); puff(X_SET - 40 - 120 * k, 850 - 30 * k, 18 + 26 * k, 180 * (1 - k)); }
    if (goAge > 0 && goAge < .6) for (let i = 0; i < 5; i++) { const k = goAge / .6; puff(X_SET - 20 - i * 46 - 160 * k, 850 - 20 * (i % 2) - 40 * k, (26 + 12 * i) * (.6 + k), 190 * (1 - k)); }
    // speed lines trailing him
    if (goAge > 0) for (let i = 0; i < 7; i++) { const y = 560 + i * 44 + 10 * Math.sin(i * 3), L = 180 + 140 * hash(i), x1 = P.x - 3.5 * u - hash(i + 4) * 60; inkLine([[x1 - L * clamp(goAge * 5), y], [x1, y]], 1.2, i % 2 ? CY : GOLD_C, 'inkfine', 0); }
    xiaoye(P.x, XS[1], u, P.o);
    // stars circling his head while he's down
    if (t > T_FALL && t < T_UP + .1) for (let i = 0; i < 3; i++) {
      const a = t * 7 + i * TAU / 3, hx = X_LIE + 9.4 * u, hy = XS[1] - 3.25 * u - 3.4 * u;
      paint(starPts(hx + Math.cos(a) * 2.6 * u, hy + Math.sin(a) * .7 * u, 13 + 3 * Math.sin(a), .45, 5, a), { wash: GOLD_L, ink: PAL.ink, sw: .6 });
    }
    camEnd();
    flushLetters();
    whipStreaks(ease(seg(t, 28.06, 28.25)), [GOLD, CY, MG, '#4A3C8A']);
  }

  // ======================================================================================================================
  // the night city from outside the studio window (shots 3–4): sleeping rows, the tallest tower with a rolled-up "ear"
  // window, the studio's brick wall with a sash window and his face in it
  // ======================================================================================================================
  const WIN = [1340, 280, 500, 500], RAIL = 462, WSILL = WIN[1] + WIN[3];   // window x, y, w, h; meeting rail; sill
  const FACE = [1590, 655], FU = 44, FACE_Y = FACE[1] + 9.4 * FU;            // his head centre, unit, feet (below the sill)
  const TOWER = [110, 470, 170], EAR = [505, 400];                           // tower x0, x1, roof; ear canal
  const BRICK = '#7A4A5E', BRICK_DK = '#3E2436', TWR = '#303A6E', TWR_DK = '#1E2450';
  function nightSky(t) {
    paint(rectPts(-900, -800, W + 1800, 2600), { wash: '#2E3A78', ink: null });
    paint(rectPts(-900, -800, W + 1800, 1250, 6), { fill: '#161B40', fillOp: 220, bleed: .2, tex: .35, border: .3, ink: null });
    for (let i = 0; i < 44; i++) paint(starPts(hash(i + 7) * 3000 - 700, hash(i + 57) * 700 - 250, 5 + 6 * hash(i + 19), .4, 4), { wash: PAL.cream, washOp: 255 * (.6 + .4 * Math.sin(t * 3 + i * 1.7)), ink: null });
    const mx = 880, my = 140;
    paint(ellPts(mx, my, 150, 150, 18), { fill: PAL.cream, fillOp: 45, bleed: .3, ink: null });
    paint(ellPts(mx, my, 64, 64, 22), { wash: '#FFF1C8', ink: PAL.ink, sw: .9 });
    paint(ellPts(mx + 26, my - 14, 54, 58, 20), { wash: '#1B2149', ink: null });
  }
  function tower(t, o = {}) {                          // o.smile 0..1 (it smiles in its sleep), o.glow 0..1 (the ear lit)
    const [x0, x1, top] = TOWER, cx = (x0 + x1) / 2, smile = clamp(o.smile || 0), glow = clamp(o.glow || 0), bp = bpOf(t);
    inkLine([[cx, top - 190], [cx, top - 70]], 2.4, '#8E9AB6', 'ink', 0);
    paint(ellPts(cx, top - 194, 9, 9, 10), { wash: Math.sin(t * 5) > 0 ? '#FF5A6A' : '#7A3A44', ink: PAL.ink, sw: .6 });
    paint(rectPts(cx - 110, top - 74, 220, 80, 2), { wash: TWR, fill: TWR_DK, fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.2 });
    paint(rectPts(x0, top, x1 - x0, 1500, 2), { wash: TWR, fill: TWR_DK, fillOp: 70, tex: .6, border: .4, ink: PAL.ink, sw: 1.3 });
    for (let r = 0; r < 13; r++) for (let c = 0; c < 5; c++) {
      const lit = hash(r * 7 + c * 3 + 1) < .2 + .5 * smile * (r < 4 ? 1 : 0);
      paint(rectPts(x0 + 30 + c * 64, top + 270 + r * 62, 26, 36), { wash: lit ? NIGHT.win : '#1A1F42', washOp: lit ? 230 : 210, ink: null });
    }
    // the face: window-eyes shut, a snoring mouth; in its dream the mouth curls into a smile and it blushes
    for (const s of [-1, 1]) inkLine([[cx + s * 72 - 30, top + 96], [cx + s * 72, top + 112 + 6 * smile], [cx + s * 72 + 30, top + 96]], 3, NIGHT.win, 'ink', .4);
    if (smile > .02) for (const s of [-1, 1]) paint(ellPts(cx + s * 118, top + 150, 34, 18, 12), { fill: PAL.rose, fillOp: 170 * smile, bleed: .2, ink: null });
    const snore = .5 + .5 * Math.sin(t * 2.4), my = top + 176;
    if (smile < .5) paint(ellPts(cx, my, 16 + 10 * snore, 20 + 10 * snore, 12), { wash: '#10142E', ink: NIGHT.win, sw: 1 });
    else inkLine([[cx - 50, my - 12], [cx, my + 18 * smile], [cx + 50, my - 12]], 3.2, NIGHT.win, 'ink', .6);
    // the nightcap, drooping off the crown; its pompom bobs
    const bob = smile > 0 ? Math.sin(t * 9) * 10 * Math.exp(-(t - 32.64) * 2) : Math.sin(bp * Math.PI) * 4;
    paint([[cx - 128, top - 70], [cx + 128, top - 70], [cx + 170, top - 190 + bob], [cx + 60, top - 150]], { wash: '#C94F8E', fill: '#8A2E62', fillOp: 50, tex: .5, ink: PAL.ink, sw: 1.1, curv: .3 });
    paint(rrPts(cx - 136, top - 84, 272, 26, 12), { wash: PAL.cream, ink: PAL.ink, sw: .9 });
    paint(ellPts(cx + 176, top - 196 + bob, 20, 20, 12), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    // the ear: a half-round bay window on the side, its blind rolled into a curl like a helix; the canal is the dark pane
    const [ex, ey] = EAR, outer = [], inner = [];
    for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + i / 14 * Math.PI; outer.push([x1 - 4 + Math.cos(a) * 100, ey + Math.sin(a) * 130]); inner.push([x1 - 4 + Math.cos(a) * 66, ey + 12 + Math.sin(a) * 90]); }
    if (glow > .02) paint(ellPts(ex + 20, ey, 170, 190, 18), { wash: GOLD_L, washOp: 80 * glow, ink: null });
    paint(outer, { wash: mixCol(TWR, '#4A5690', .4), fill: TWR_DK, fillOp: 40, ink: PAL.ink, sw: 1.4, curv: .4 });
    paint(inner, { wash: mixCol('#161A38', GOLD_L, glow), ink: PAL.ink, sw: 1, curv: .4 });
    // the blind rolled up along the rim like a helix, the canal (the open pane) where the song goes in
    const curl = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI * 1.05; curl.push([x1 - 4 + Math.cos(a) * 84, ey + Math.sin(a) * 112]); }
    inkLine(curl, 5, PAL.cream, 'ink', .5);
    const roll = []; for (let i = 0; i <= 14; i++) { const a = -Math.PI * .5 + i * .5, r = 22 - i * 1.3; roll.push([x1 + 12 + Math.cos(a) * r, ey - 92 + Math.sin(a) * r]); }
    inkLine(roll, 4, PAL.cream, 'ink', .5);
    paint(ellPts(ex + 8, ey + 18, 17, 24, 12), { wash: glow > .02 ? GOLD_C : '#0C0F24', ink: PAL.ink, sw: .8 });
    // zzz while it sleeps, notes once it smiles
    for (let k = 0; k < 2; k++) {
      const ph = frac(t * .55 + k * .5), x = cx + 60 + ph * 70, y = top + 150 - ph * 170, a = Math.sin(ph * Math.PI);
      if (smile < .5) letter('z', x, y, 30 + 22 * ph, PAL.cream, { alpha: a, rot: -.2 });
      else note(x, y, .9 + .3 * ph, .2 * Math.sin(t * 4 + k), k ? CY : GOLD_C);
    }
  }
  function cityBack(t, o = {}) {
    nightSky(t);
    skyline(t, { y: 900, x0: -900, x1: 1320, s: .8, seed: 21, faces: false, zzz: false });
    tower(t, o);
    skyline(t, { y: 1210, x0: -700, x1: 1250, s: 1.8, seed: 4 });
  }
  const wallPiece = (x, y, w, h) => {
    if (w <= 0 || h <= 0) return;
    paint(rectPts(x, y, w, h, 1), { wash: BRICK, fill: mixCol(BRICK, '#2A1830', .4), fillOp: 70, bleed: .04, tex: .7, border: .5, ink: null });
    for (let yy = Math.ceil((y - 120) / 52) * 52 + 132; yy < y + h; yy += 52) inkLine([[x + 4, yy], [x + w - 4, yy + 2]], .45, mixCol(BRICK, '#2A1830', .5), 'inkfine', 0);
  };
  // the studio wall and its sash window; inside() paints him and the mug; o.open 0..1 lifts the lower sash;
  // o.press [k, fog] leaves his squashed face and breath on the lower pane
  function facade(t, o, inside) {
    const [wx, wy, ww, wh] = WIN, open = o.open || 0, F0 = 1200, F1 = 2800;
    wallPiece(F0, 120, wx - 22 - F0, 1500);
    wallPiece(wx + ww + 22, 120, F1 - wx - ww - 22, 1500);
    wallPiece(wx - 22, 120, ww + 44, wy - 22 - 120);
    inkLine([[F0, 110], [F0, 1500]], 1.4, PAL.ink, 'ink', 0);
    paint(rectPts(F0 - 20, 92, F1 - F0 + 40, 40, 2), { wash: BRICK_DK, ink: PAL.ink, sw: 1.2 });
    // the room behind the glass: foam panels, neon light, the warm light of the words around him
    paint(rectPts(wx, wy, ww, wh), { wash: '#2F285A', ink: null });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) paint(rrPts(wx + 14 + c * 122, wy + 18 + r * 152, 106, 130, 14, 2), { wash: (r + c) % 2 ? '#342C62' : '#2B2458', ink: '#1E1840', sw: .6 });
    paint(ellPts(wx + 80, wy + 20, 220, 110, 14), { fill: CY, fillOp: 70, bleed: .3, tex: .2, ink: null });
    paint(ellPts(wx + ww - 80, wy + 20, 220, 110, 14), { fill: MG, fillOp: 70, bleed: .3, tex: .2, ink: null });
    paint(ellPts(FACE[0], FACE[1] + 40, 250, 220, 16), { fill: GOLD_L, fillOp: 55, bleed: .3, tex: .2, ink: null });
    inside();
    // glass: the fixed upper sash and the lower sash (shoots up into the wall when opened), glare kept off his face,
    // a little squashed nose and breath fog on the pane
    const lowTop = lerp(RAIL, RAIL - (WSILL - RAIL) - 24, open), lowBot = lowTop + (WSILL - RAIL);
    const glass = (y0, y1) => {
      paint(rectPts(wx, y0, ww, y1 - y0), { wash: '#A8EEF2', washOp: 26, ink: null });
      paint([[wx + 22, y1], [wx + 70, y1], [wx + 120, y0], [wx + 72, y0]], { wash: PAL.cream, washOp: 50, ink: null });
      paint([[wx + ww - 96, y1], [wx + ww - 80, y1], [wx + ww - 30, y0], [wx + ww - 46, y0]], { wash: PAL.cream, washOp: 44, ink: null });
    };
    glass(wy, RAIL);
    glass(lowTop, lowBot);
    if (o.press && o.press[0] > .02) {
      const [k, fog] = o.press, px = FACE[0], py = FACE[1] + (lowTop - RAIL);
      paint(ellPts(px, py + .7 * FU, .48 * FU * k, .27 * FU * k, 12), { wash: '#F6C3AE', washOp: 190, ink: '#C98A70', sw: .7 });
      if (fog > .02) paint(ellPts(px, py + 1.9 * FU, (1.05 + .3 * fog) * FU, .5 * FU, 12), { fill: '#FFFFFF', fillOp: 80 * fog, bleed: .3, tex: .3, ink: null });
    }
    const bar = (x, y, w, h) => paint(rectPts(x, y, w, h), { wash: '#3A2E4A', ink: PAL.ink, sw: .9 });
    bar(wx, RAIL - 14, ww, 14);                                                // upper sash bottom rail
    bar(wx, lowTop, ww, 16); bar(wx, lowBot - 20, ww, 20);                     // lower sash rails
    bar(wx, lowTop, 12, lowBot - lowTop); bar(wx + ww - 12, lowTop, 12, lowBot - lowTop);
    if (open > 0) wallPiece(wx - 22, 120, ww + 44, wy - 22 - 120);           // the raised sash disappears into the wall
    wallPiece(wx - 22, WSILL, ww + 44, 1300);                                  // under the sill: hides his legs
    bar(wx - 22, wy - 22, ww + 44, 22); bar(wx - 22, wy, 22, wh); bar(wx + ww, wy, 22, wh);
    paint(rectPts(wx - 44, WSILL - 6, ww + 88, 28, 2), { wash: '#4A3E6E', ink: PAL.ink, sw: 1.1 });
  }
  function mug(x, y, s, t) {                           // (x, y) = bottom centre; about 76 × 86 at s = 1; steaming
    const sw = clamp(1.1 * s, .5, 1.6);
    for (let k = 0; k < 3; k++) {
      const ph = frac(t * .5 + k / 3), P = [];
      for (let j = 0; j <= 7; j++) { const q = j / 7; P.push([x + (k - 1) * 16 * s + Math.sin(q * 5 + t * 2.6 + k * 2) * 12 * s * (.4 + q), y - 96 * s - (q * 110 + ph * 70) * s]); }
      inkLine(P, 1.4 * s * Math.sin(ph * Math.PI) + .1, PAL.cream, 'dry', .5);
    }
    paint(ellPts(x + 40 * s, y - 46 * s, 20 * s, 24 * s, 14), { ink: PAL.ink, sw: sw * 2.4 });
    paint(ellPts(x + 40 * s, y - 46 * s, 20 * s, 24 * s, 14), { ink: CY, sw: sw * 1.3 });
    paint(rrPts(x - 38 * s, y - 86 * s, 76 * s, 86 * s, 14 * s), { wash: CY, fill: '#1F7F86', fillOp: 60, tex: .5, ink: PAL.ink, sw });
    paint(rectPts(x - 38 * s, y - 62 * s, 76 * s, 14 * s), { wash: MG, ink: null });
    paint(ellPts(x, y - 86 * s, 36 * s, 8 * s, 14), { wash: '#5A3424', ink: PAL.ink, sw: sw * .6 });
    paint(heartPts(x, y - 30 * s, 13 * s), { wash: PAL.cream, ink: null });
  }
  // his hands over the headphone cups, index and middle finger spread in a V around each eye, stretching the lids open
  function fingers(x, hy, u, k, sxF) {
    if (k <= .02) return;
    for (const s of [-1, 1]) {
      const ex = x + s * .85 * u * sxF, ey = hy + .2 * u, hx = x + s * 2.75 * u * sxF, hyy = hy + .35 * u;
      for (const [d0, d1] of [[-.35, -.6], [.35, .66]]) {
        const base = [hx - s * .3 * u, hyy + d0 * u], tip = [lerp(base[0], ex + s * .05 * u, k), lerp(base[1], ey + d1 * u, k)];
        const dx = tip[0] - base[0], dy = tip[1] - base[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * .2 * u, ny = dx / L * .2 * u;
        paint([[base[0] + nx * 1.2, base[1] + ny * 1.2], [tip[0] + nx, tip[1] + ny], [tip[0] + dx / L * .2 * u, tip[1] + dy / L * .2 * u], [tip[0] - nx, tip[1] - ny], [base[0] - nx * 1.2, base[1] - ny * 1.2]], { wash: XY.skin, ink: PAL.ink, sw: 1, curv: .35 });
        paint(ellPts(tip[0] - dx / L * .1 * u, tip[1] - dy / L * .1 * u, .12 * u, .09 * u, 8), { wash: '#FBE3D2', ink: null });   // fingernail
      }
      paint(ellPts(hx, hyy, .95 * u, 1.05 * u, 14), { wash: XY.skin, fill: '#E9A98A', fillOp: 50, tex: .4, ink: PAL.ink, sw: 1 });   // the hand
      paint(rrPts(hx - .55 * u, hyy + .7 * u, 1.1 * u, 1.3 * u, .4 * u), { wash: XY.col, ink: PAL.ink, sw: .9 });                  // cuff
    }
  }

  // ======================================================================================================================
  // 3 · 28.25–30.52 "城市睡了我还没有闭眼": out of the whip, the whole city asleep in nightcaps, one lit window. He pops
  // up and squashes his face on the glass (beat 42); his eyelids droop… and on beat 44 ("闭眼") his fingers prop them wide
  // open. The mug steams on the sill. The camera pushes in on the window.
  // ======================================================================================================================
  const T_SMUSH = B(42), T_PROP = B(44);
  function windowShot(t, lt) {
    const k = ease(seg(t, 28.95, 29.95)), sm = t > T_SMUSH ? .045 + .1 * Math.exp(-(t - T_SMUSH) * 7) * Math.cos((t - T_SMUSH) * 22) : 0;
    const [sx, sy] = shakeXY(t, t > T_SMUSH && t < T_SMUSH + .25 ? 5 : 0);
    camBegin(lerp(900 + 60 * seg(t, 28.25, 28.95), 1590, k) + sx, lerp(545, 640, k) + sy, lerp(.95, 1.95, k) + .04 * seg(t, 29.95, 30.52), 0);
    cityBack(t);
    const md = mood(t, [[28.25, 'look'], [29.3, 'sleepy'], [T_PROP, 'scared']]), prop = backOut(seg(t, T_PROP - .1, T_PROP + .1));
    const pop = backOut(seg(t, 28.36, T_SMUSH)), nod = t > 29.3 && t < T_PROP ? Math.sin((t - 29.3) * 5) * .05 : 0;
    facade(t, { press: [t > T_SMUSH ? 1 : 0, t > T_SMUSH ? .4 + .6 * pulse(t, 3) : 0] }, () => {
      const sxF = 1 + sm;
      xiaoye(FACE[0], FACE_Y, FU, { dy: (1 - pop) * 7, sx: sxF, sy: 1 - sm * .7, rot: nod, noShadow: true,
        ...md, lookX: -1, lookY: .2, brows: prop > .5 ? 'angry' : null, mouth: prop > .5 ? 'wobble' : t > T_SMUSH ? 'flat' : 'o', glow: .7, blush: true });
      fingers(FACE[0], FACE[1] + (1 - pop) * 7 * FU, FU, clamp(prop), sxF);
      mug(1778, WSILL, 1, t);
    });
    // the glass shivers where his face hits it
    const wa = t - T_SMUSH; if (wa > 0 && wa < .35) paint(ellPts(FACE[0], FACE[1] + 40, 120 + 500 * wa, 90 + 380 * wa, 24), { ink: PAL.cream, sw: 2.4 * (1 - wa / .35) });
    if (prop > .9 && t - T_PROP < .6) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * .5, d = 150 + 260 * (t - T_PROP); sparkle(FACE[0] + Math.cos(a) * d, FACE[1] - 30 + Math.sin(a) * d * .7, 16 * (1 - (t - T_PROP) / .6), t * 6 + i); }
    camEnd();
    whipStreaks(1 - ease(seg(t, 28.25, 28.45)), [GOLD, CY, MG, '#4A3C8A']);
  }

  // ======================================================================================================================
  // 4 · 30.52–33.54 "我要把明天唱到你耳边": the lower sash slams up (beat 45) and his song flies out as a ribbon of light,
  // skims the sleeping roofs and curls into the tallest tower's ear on beat 48 ("耳"); the tower smiles in its dream.
  // The camera rides the ribbon back to the window and dives in (gold flash into the dance party).
  // ======================================================================================================================
  const T_OPEN = B(45), T_EAR = B(48), T_LAUNCH = T_OPEN + .06;
  const RIB_A = smooth([[FACE[0] - 10, FACE[1] + 58], [1470, 730], [1330, 700], [1185, 640], [1030, 605], [880, 620], [760, 590], [680, 520], [618, 418]], 7);
  const RIB_C = []; for (let i = 1; i <= 30; i++) { const q = i / 30, a = -q * TAU * 1.05, r = 105 * Math.pow(1 - q, 1.1) + 2; RIB_C.push([EAR[0] + 8 + Math.cos(a) * r * (1 - .35 * q), EAR[1] + 18 + Math.sin(a) * r * .9]); }
  const RIB = RIB_A.concat(RIB_C), RIB_L = lens(RIB), RIB_T = RIB_L[RIB_L.length - 1];
  const ribHead = t => RIB_T * (t < T_LAUNCH ? 0 : t >= T_EAR ? 1 : .5 - .5 * Math.cos(Math.pow(seg(t, T_LAUNCH, T_EAR), .9) * Math.PI));
  function ribbon(t, h, op = 1) {
    if (h < 6) return;
    const P = sub(RIB, RIB_L, 0, h), L = lens(P);
    const ws = P.map((p, i) => (30 + 12 * Math.sin(L[i] * .02 - t * 8)) * clamp(L[i] / 90, .4, 1) * clamp((h - L[i]) / 120, .3, 1));
    lightBand(P, ws, op);
    for (let j = 0; j < 9; j++) {                      // notes and little zilings riding out along it
      const d = frac(t * .45 + j / 9) * h; if (d < 60 || d > h - 40) continue;
      const p = at(RIB, RIB_L, d), wob = Math.sin(t * 6 + j) * 16;
      if (j % 3 === 2) ziling(p[0], p[1] + wob + 13, 9.5, { seed: j + 20, glyph: j % 5, eyes: 'happy', mouth: 'O', glow: .7, rot: .3 * Math.sin(t * 5 + j) });
      else note(p[0], p[1] - 30 + wob, .95, .3 * Math.sin(t * 5 + j), [GOLD_C, CY, MG][j % 3]);
    }
    if (h < RIB_T - 2) { const p = at(RIB, RIB_L, h); glowDot(p[0], p[1], 22); sparkle(p[0], p[1], 46, t * 5); sparkle(p[0] - 50 * Math.cos(p[2]), p[1] - 50 * Math.sin(p[2]) + 20, 18, -t * 7, GOLD_L); }
  }
  const CAM4 = [[30.52, [1590, 640, 1.99]], [T_OPEN, [1590, 648, 2.05]], [31.25, [1250, 610, 1.1]], [31.95, [840, 545, 1.0]], [32.52, [470, 360, 1.3]], [33.0, [455, 350, 1.4]]];
  function songShot(t, lt) {
    const bp = bpOf(t), h = ribHead(t), open = t < T_OPEN ? 0 : backOut(seg(t, T_OPEN, T_OPEN + .14));
    const earAge = t - T_EAR, smile = ease(seg(t, T_EAR + .05, T_EAR + .3)), glow = earAge > 0 ? .55 + .45 * Math.exp(-earAge * 4) : 0;
    let cam;
    if (t < 33.0) cam = kf(t, CAM4);
    else {                                             // ride the ribbon back to the window, then dive in
      const k = seg(t, 33.0, 33.54), p = at(RIB, RIB_L, RIB_T * (1 - ease(k)));
      cam = [lerp(455, p[0], ease(seg(k, 0, .25))), lerp(350, p[1], ease(seg(k, 0, .25))), lerp(1.4, 1.02, ease(seg(k, 0, .35))) * Math.pow(3.3, easeIn(seg(k, .5, 1)))];
    }
    const [sx, sy] = shakeXY(t, t > T_OPEN && t < T_OPEN + .2 ? 7 : 0);
    camBegin(cam[0] + sx, cam[1] + sy, cam[2] + .01 * pulse(t, 6), 0);
    cityBack(t, { smile, glow });
    facade(t, { open, press: [1 - seg(t, 30.52, T_OPEN), .3 * (1 - seg(t, 30.52, T_OPEN))] }, () => {
      const inhale = seg(t, 30.52, T_OPEN), m = move('bounce', t), md = mood(t, [[30.3, 'scared'], [30.57, 'closed'], [T_OPEN + .02, 'happy']]);
      xiaoye(FACE[0], FACE_Y, FU, { dy: m.dy * .25 - .15 * inhale, sq: -.06 * inhale + .08 * (t > T_OPEN ? Math.exp(-(t - T_OPEN) * 8) : 0), rot: .04 * Math.sin(bp * Math.PI), noShadow: true,
        ...md, mouth: t < T_OPEN ? 'o' : 'sing', aL: -1.2, aR: t > T_OPEN ? .5 + .2 * Math.sin(t * 4) : -1.2, glow: 1, blush: true });
      fingers(FACE[0], FACE[1], FU, 1 - ease(seg(t, 30.52, 30.64)), 1.045);
      mug(1778, WSILL, 1, t);
    });
    ribbon(t, h);
    // as the head skims the roofs, glitter falls on them; in the ear, a burst of light and a heart
    if (earAge > 0 && earAge < .5) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, d = 60 + 260 * easeOut(earAge / .5); sparkle(EAR[0] + Math.cos(a) * d, EAR[1] + Math.sin(a) * d, 20 * (1 - earAge / .5), a); }
    if (earAge > .15) emote('heart', TOWER[0] + 330, TOWER[2] - 30, 30, seg(earAge, .15, .4));
    camEnd();
    const v = t > 33.0 ? Math.sin(seg(t, 33.0, 33.4) * Math.PI) : 0;
    if (v > .05) for (let i = 0; i < 14; i++) { const y = hash(i * 3.1 + boilN(t)) * H, x = hash(i * 7.3 + 2) * W, L = 900 * v; inkLine([[x - L / 2, y], [x + L / 2, y]], 1.4, i % 2 ? GOLD_C : CY, 'inkfine', 0); }
    flash(ease(seg(t, 33.34, 33.54)), '#FFE3A0');
  }

  // ======================================================================================================================
  // the party in the studio (shots 5–6a): neon strips swap colour on every beat, a comet of light laps the room once a bar,
  // zilings ring the lead, the drum kids circle and drum, dengdeng dances in the window flashing red / amber / green
  // ======================================================================================================================
  const NEONS = [[CY, MG], [MG, GOLD_L], [GOLD_L, CY], [MG, CY]];
  const DX = [1030, 935], DU = 36;
  function splitRuns(pts, ws, front) {                 // [behind, in front] runs of a band, one segment of overlap at the joins
    const runs = [[], []]; let cur = null;
    for (let i = 0; i < pts.length; i++) {
      const s = front(i) ? 1 : 0;
      if (!cur || cur.side !== s) {
        const nr = { side: s, pts: [], ws: [] };
        if (cur) { cur.pts.push(pts[i]); cur.ws.push(ws[i]); nr.pts.push(pts[i - 1]); nr.ws.push(ws[i - 1]); runs[cur.side].push(cur); }
        cur = nr;
      }
      cur.pts.push(pts[i]); cur.ws.push(ws[i]);
    }
    if (cur) runs[cur.side].push(cur);
    return runs.map(rs => rs.filter(r => r.pts.length > 1));
  }
  function comet(t, phase, len, w, cx, cy, rx, ry, speed = 1) {
    const th = bpOf(t) * TAU / 4 * speed + phase, pts = [], ws = [], A = [];
    for (let i = 0; i <= 30; i++) { const a = th - len * (1 - i / 30); A.push(a); pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); ws.push(w * (.12 + .88 * Math.pow(i / 30, .8))); }
    return { runs: splitRuns(pts, ws, i => Math.sin(A[i]) > 0), head: pts[30], front: Math.sin(th) > 0 };
  }
  function drawComet(c, side, op = 1) {
    for (const r of c.runs[side]) lightBand(r.pts, r.ws, op);
    if (c.front === !!side) { glowDot(c.head[0], c.head[1], 18, op); sparkle(c.head[0], c.head[1], 40, T * 6); }
  }
  function zilingRing(t, side, n, cx, cy, rx, ry, spin, spinPh) {
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + t * spin, s = Math.sin(a); if ((s > 0 ? 1 : 0) !== side) continue;
      const hop = Math.abs(Math.sin(bpOf(t) * Math.PI + i * .8)), sp = spinPh ? spinPh(i) : 0;
      ziling(cx + Math.cos(a) * rx, cy + s * ry - hop * 34, 14 + 3 * s, { seed: i + 40, glyph: i % 5, eyes: i % 2 ? 'happy' : 'normal', mouth: i % 3 ? 'smile' : 'O', rot: .3 * Math.sin(t * 4 + i) + sp * TAU, sq: .12 * pulse(t, 8), glow: .9, blush: i % 2 === 0 });
    }
  }
  function drumCircle(t, side, cx, cy, rx, ry, frenzy, spinPh) {
    [['kick', 0], ['snare', Math.PI]].forEach(([kind, ph], j) => {
      const a = bpOf(t) * TAU / 8 + ph, s = Math.sin(a); if ((s > 0 ? 1 : 0) !== side) return;
      const m = move('hop', t, j), off = j ? BEAT / 2 : 0, k = frenzy ? 2 : 1, sp = spinPh ? spinPh(j) : 0;
      drumkid(cx + Math.cos(a) * rx, cy + s * ry, 21 * (1 + .14 * s), { ...m, walk: undefined, kind, sx: sp > 0 && sp < 1 ? Math.cos(sp * TAU) : 1,
        aL: .15 + 1.25 * Math.exp(-frac(bpOf(t - off) * k) * 7), aR: .15 + 1.25 * Math.exp(-frac(bpOf(t - off) * k + .5) * 7), eyes: 'happy', mouth: 'grin', blush: true });
    });
  }
  function ddParty(t) {
    const bn = beatN(t), bp = bpOf(t), light = ['red', 'both', 'green', 'both'][((bn % 4) + 4) % 4], m = move('bounce', t, 2), hit = pulse(t, 5);
    if (light === 'both') paint(ellPts(DDW[0], DDW[1] - 10.3 * DDU, 50 + 26 * hit, 62 + 26 * hit, 16), { wash: '#FFB84A', washOp: 120, ink: null });
    ddWin({ light, eyes: 'happy', mouth: 'grin', dy: m.dy, sq: m.sq, rot: .1 * Math.sin(bp * Math.PI), aL: 1 + .7 * Math.sin(bp * Math.PI), aR: 1 - .7 * Math.sin(bp * Math.PI), blush: true });
  }
  function danceMove(t) {
    const bp = bpOf(t);
    if (bp < 51) return move('bounce', t);
    if (bp < 53 || (bp >= 57 && bp < 59)) return move('roof', t);
    if (bp < 55) { const m = move('shimmy', t), ph = seg(bp, 53, 54); return { ...m, sx: ph > 0 && ph < 1 ? Math.cos(ph * TAU) : 1, dy: m.dy - Math.sin(ph * Math.PI) * 2.4 }; }
    const m = move('hop', t); return bp >= 59 ? { ...m, dy: m.dy * 1.35, aL: m.aL + .4, aR: m.aR + .4 } : m;
  }
  const spinWave = i => seg(bpOf(T), 53 + i * .12, 53.85 + i * .12);          // the spin wave travels through the dancers
  // o.big 0..1 (shot 6a): the room heaves on the beat, the light builds, a second comet, drumming on eighth notes
  function party(t, o = {}) {
    const bp = bpOf(t), big = o.big || 0, bn = beatN(t), [nA, nB] = NEONS[((bn % 4) + 4) % 4];
    const ft = frac(bp) * BEAT, heave = big * Math.exp(-ft * 6) * Math.cos(ft * 11);
    push(); translate(960, 1080); scale(1 + .05 * heave, 1 - .085 * heave); translate(-960, -1080);
    studioBack(t, { neonA: nA, neonB: nB, neon: .65 + .35 * pulse(t, 4), bin: .7, level: .35 + .65 * pulse(t, 4) });
    ddParty(t);
    cable();
    const C1 = comet(t, 0, 2.1, 40 + 16 * big, 960, 470, 790, 150), C2 = big > 0 ? comet(t, Math.PI, 2.1, 34 + 14 * big, 960, 430, 700, 190, 1.5) : null;
    drawComet(C1, 0, .95); if (C2) drawComet(C2, 0, .9);
    zilingRing(t, 0, 8, DX[0], 700, 450, 120, 1.25 + .8 * big, spinWave);
    drumCircle(t, 0, DX[0], 948, 570, 55, big > 0, spinWave);
    push(); translate(MIC[0], MIC[1]); rotate(.06 * Math.sin(bp * Math.PI)); translate(-MIC[0], -MIC[1]); studioMic({ on: 1, glow: .3 + .4 * pulse(t, 4) }); pop();
    const m = danceMove(t), md = mood(t, [[33.54, 'happy'], [B(53) - .05, 'spark', 'spark'], [B(55), 'happy', 'music'], [B(59), 'spark']]);
    xiaoye(DX[0] + m.dx * DU, DX[1], DU, { ...m, walk: undefined, ...md, mouth: 'grin', glow: .5 + .5 * pulse(t, 4), blush: true });
    drumCircle(t, 1, DX[0], 948, 570, 55, big > 0, spinWave);
    zilingRing(t, 1, 8, DX[0], 700, 450, 120, 1.25 + .8 * big, spinWave);
    drawComet(C1, 1); if (C2) drawComet(C2, 1, .9);
    // glitter drifting down; sound rings off the mixer on every beat
    for (let i = 0; i < 26; i++) {
      const v = 120 + 120 * hash(i + .4), x = hash(i + 3.1) * 2100 - 90 + Math.sin(t * 1.5 + i) * 30, y = ((hash(i + .7) * 1250 + (t - 33.54) * v) % 1250) - 120;
      sparkle(x, y, 9 + 7 * hash(i + 9), t * 3 + i, [GOLD_C, CY, MG, GOLD_L][i % 4]);
    }
    rings(MIXER[0], MIXER[1] - 20, ft, .45, 60, 190 + 90 * big, bn % 2 ? [MG, CY] : [CY, MG], .5);
    if (big > 0) paint(rectPts(-400, -400, W + 800, H + 800), { wash: '#FFD9A0', washOp: 50 * big * seg(t, 38.641, 41.308), ink: null });
    pop();
  }

  // ======================================================================================================================
  // 5 · 33.54–38.641 (instrumental) the studio dance party: out of the gold flash the camera pulls back from him; he leads
  // big while everyone dances around him; a spin wave on beat 53, all jump from 55; the camera drifts to the window to
  // catch dengdeng dancing, then back for the jump.
  // ======================================================================================================================
  const CAM5 = [[33.54, [1030, 620, 2.0]], [34.35, [960, 560, 1.0]], [36.64, [960, 552, 1.05]], [37.3, [1240, 500, 1.3]], [37.95, [1220, 505, 1.32]], [38.641, [960, 560, 1.02]]];
  function partyShot(t, lt) {
    const c = kf(t, CAM5), bp = bpOf(t);
    camBegin(c[0] + 8 * Math.sin(bp * Math.PI / 2), c[1], c[2] + .015 * pulse(t, 6), .01 * Math.sin(bp * Math.PI / 4));
    party(t);
    camEnd();
    flash(1 - ease(seg(t, 33.54, 33.86)), '#FFE3A0');
  }

  // ======================================================================================================================
  // 6a · 38.641–41.308 bigger: the whole room heaves on the beat, a second comet, the light building up
  // ======================================================================================================================
  function heaveShot(t, lt) {
    const bp = bpOf(t), k = ease(seg(t, 38.641, 41.308));
    const [sx, sy] = shakeXY(t, 6 * pulse(t, 8));
    camBegin(960 + sx, lerp(560, 540, k) + sy, lerp(1.02, 1.1, k) + .025 * pulse(t, 6), .02 * Math.sin(bp * Math.PI / 2));
    party(t, { big: .6 + .4 * k });
    camEnd();
  }

  // ======================================================================================================================
  // 6b · 41.308–43.974 outside the studio door: the building thumps; the door bangs open a crack on beats 61 and 62 and
  // the noisies waiting outside try to stay grumpy… on beat 63 the door bursts, light and zilings pour out, they give in
  // and sway; the light swells until it fills the frame (brush wipe at 43.974).
  // ======================================================================================================================
  const DOOR_C = [1420, 672], T_BURST = B(63);
  function doorShot(t, lt) {
    const bp = bpOf(t), bangs = [B(61), B(62)], lastBang = bangs.filter(b => b <= t).pop(), bangAge = lastBang != null ? t - lastBang : 9;
    const bAge = t - T_BURST, burst = bAge < 0 ? 0 : backOut(seg(bAge, 0, .18)), grow = ease(seg(t, T_BURST, 43.75));
    const door = bAge >= 0 ? clamp(burst) : .35 * Math.exp(-bangAge * 6);
    const k = ease(seg(t, 41.308, 43.974));
    const [sx, sy] = shakeXY(t, 9 * Math.exp(-bangAge * 8) + (bAge > 0 ? 14 * Math.exp(-bAge * 5) : 0));
    camBegin(lerp(1250, 1330, k) + sx, lerp(652, 660, k) + sy, lerp(1.66, 1.85, k) + .02 * pulse(t, 6), 0);
    streetBack(t, { door, sign: 1, onAir: .6 + .4 * pulse(t, 4) });
    // the building thumps with the music: its windows flash neon on the beat, sound lines off its corners
    const bn = beatN(t), hit = pulse(t, 5), wc = [CY, MG, GOLD_L][((bn % 3) + 3) % 3];
    paint(rectPts(1200, 330, 130, 120), { wash: wc, washOp: 150 * hit, ink: null });
    paint(rectPts(1620, 330, 120, 120), { wash: wc, washOp: 170 * hit, ink: null });
    for (const [cx, cy, d] of [[1150, 330, -1], [1790, 330, 1]]) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + d * (.4 + i * .35), r0 = 40 + 50 * (1 - hit); inkLine([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * (r0 + 60), cy + Math.sin(a) * (r0 + 60)]], 2.4 * hit + .2, PAL.cream, 'ink', 0); }
    // the light pouring out of the doorway: rays, a beam across the pavement, then everything
    if (door > .05 && bAge < 0) paint([[1345, 782], [1495, 782], [1560, 830], [1290, 830]], { fill: GOLD_L, fillOp: 160 * door, bleed: .1, tex: .2, ink: null });
    if (bAge > 0) {
      const R = 500 + 2600 * grow;
      for (let i = 0; i < 14; i++) { const a0 = i / 14 * TAU + t * .5, a1 = a0 + TAU / 14 * .55; paint([DOOR_C, [DOOR_C[0] + Math.cos(a0) * R, DOOR_C[1] + Math.sin(a0) * R], [DOOR_C[0] + Math.cos(a1) * R, DOOR_C[1] + Math.sin(a1) * R]], { wash: i % 2 ? GOLD_L : '#FFE9A8', washOp: 75 + 75 * grow, ink: null }); }
      for (const [r, col, op] of [[1, '#FFB84A', 60], [.62, GOLD_L, 120], [.34, GOLD_C, 215]]) paint(ellPts(DOOR_C[0], DOOR_C[1], (230 + 1000 * grow) * r, (250 + 900 * grow) * r, 26), { wash: col, washOp: op, ink: null });
      paint([[1340, 782], [1500, 782], [1720, 910], [1100, 910]], { wash: GOLD_L, washOp: 170, ink: null });
      for (let i = 0; i < 7; i++) {                  // zilings riding the light out into the street
        const a = bAge - i * .07; if (a <= 0) continue;
        const dir = -Math.PI / 2 + (i - 3) * .42, d = 520 * easeOut(Math.min(1, a * 1.3)) + 90 * a;
        ziling(DOOR_C[0] + Math.cos(dir) * d, DOOR_C[1] + 40 + Math.sin(dir) * d * .8 + 14, 16, { seed: i + 60, glyph: i % 5, eyes: 'happy', mouth: 'O', rot: a * 6 * (i % 2 ? 1 : -1), glow: 1 });
      }
      for (let j = 0; j < 4; j++) { const a = bAge - j * .1; if (a > 0) note(DOOR_C[0] - 200 + j * 130, DOOR_C[1] - 60 - 320 * easeOut(Math.min(1, a)), 1.2, .3 * Math.sin(t * 5 + j), [GOLD_C, CY, MG][j % 3]); }
    }
    // the noisies in a row by the door: grumpy through the bangs, then they can't help it
    ['horn', 'clock', 'bubble'].forEach((kind, i) => {
      const x = 1045 + i * 108, md = mood(t, [[41.308, 'angry'], [B(62) + i * .04, 'narrow'], [T_BURST + i * .06, 'happy', i === 1 ? 'music' : null]]);
      const tap = t > B(62) && bAge < 0 ? Math.abs(Math.sin(bp * TAU)) * .25 : 0, jolt = Math.exp(-bangAge * 10) * (bAge < 0 ? 1 : 0);
      const m = bAge > 0 ? move('sway', t, i) : null;
      noisy(x + (m ? m.dx * 22 : 0), 800, 22, { kind, seed: i, ...md, dy: -tap - jolt * .6, sq: (md.take || 0) - jolt * .15, rot: m ? m.rot : 0,
        aL: m ? m.aL : .1, aR: m ? m.aR : .1, mouth: bAge > 0 ? 'smile' : i === 2 ? 'flat' : null });
    });
    camEnd();
    flash(ease(seg(t, 43.28, 43.72)), '#FFF1C8');
  }

  chapter('chorus1', 22.641, 43.974, [[22.641, recordShot], [25.41, tripShot], [28.25, windowShot], [30.52, songShot], [33.54, partyShot], [38.641, heaveShot], [41.308, doorShot]]);
})();
