// sets.js: the places and props this song returns to in more than one chapter (the chorus home set, a recurring motif),
// designed from its lyrics and shared by every chapter. Same conventions as props.js: world coordinates of a 1920x1080
// frame, backgrounds painted larger than the frame so camera moves and shakes never show an edge, a back layer drawn
// before the characters and a front layer after them.
//
//   skyline(t, o)      the sleeping city ("城市睡了"): wakes up with o.wake
//   streetBack(t, o)   the 2 am street (chapters 1, 4, 5): the same framing at night and at dawn (o.dawn); returns its layout
//   studioBack(t, o)   the recording studio, the chorus home set (chapters 1–4); returns its layout
//   mic(x, y, s, o)    the studio microphone on its stand; returns the capsule centre
// Check them with: node render.mjs --loop=sets --sheet=0.5,1.5,2.5,3.5,4.5,5.5 --cols=3 --out=out/check/sets.jpg

const NIGHT = { skyTop: '#161B40', skyBot: '#2E3A78', near: '#262E5E', far: '#3A4580', win: '#FFD98A', road: '#2B2C4A', walk: '#4A4E78' };
const DAWN = { skyTop: '#F7A58C', skyBot: '#FFD58F', near: '#6F5F8E', far: '#B99AB8', road: '#8E7E9A', walk: '#C9A9A4' };
const TWILIGHT = { skyTop: '#5A3F8A', skyBot: '#D9719A' };           // the sky passes through violet-rose, not grey
const NEON = { cyan: '#4FE0E8', magenta: '#FF5FB0' };
const nightCol = (k, dawn) => { dawn = clamp(dawn); const m = TWILIGHT[k]; return !m ? mixCol(NIGHT[k], DAWN[k], dawn) : dawn < .5 ? mixCol(NIGHT[k], m, dawn * 2) : mixCol(m, DAWN[k], dawn * 2 - 1); };

// ---------- the sleeping city ----------
// skyline(t, o): buildings standing on y = o.y (720) from x = o.x0 to o.x1 (the whole frame plus margins), scaled by o.s (1).
// o.wake 0..1: asleep (window-eyes shut, nightcaps, zzz, few lit windows) → awake (eyes open, caps slide off, windows lit).
// o.dawn 0..1 warms the colours. o.seed picks a different row. o.faces false for a plain skyline.
function skyline(t, o = {}) {
  const y0 = o.y ?? 720, x0 = o.x0 ?? -300, x1 = o.x1 ?? W + 300, s = o.s ?? 1, wake = clamp(o.wake || 0), dawn = clamp(o.dawn || 0), seed = o.seed ?? 3;
  const far = nightCol('far', dawn), near = nightCol('near', dawn), sw = clamp(1.1 * s, .5, 1.4);
  // far row: pale flat silhouettes
  for (let x = x0, i = 0; x < x1; i++) {
    const w = (70 + 90 * hash(seed * 7 + i * 1.3)) * s, h = (140 + 240 * hash(seed * 3 + i * 2.1)) * s;
    paint(rectPts(x, y0 - h - 40 * s, Math.min(w, x1 - x), h + 40 * s, 1), { wash: far, ink: null });
    x += w;
  }
  // near row: buildings with windows; some have sleepy faces and nightcaps
  for (let x = x0 + 30 * s, i = 0; x < x1 - 40 * s; i++) {
    const w = Math.min((110 + 110 * hash(seed * 5 + i * 3.7)) * s, x1 - x), h = (110 + 230 * hash(seed * 11 + i * 1.9)) * s, top = y0 - h;
    paint(rectPts(x, top, w, h + 4, 1.5 * s), { wash: near, fill: mixCol(near, '#000000', .25), fillOp: 50, tex: .5, border: .3, ink: PAL.ink, sw });
    const face = o.faces !== false && w > 120 * s && hash(seed + i * 5.3) > .4;
    const cols = Math.max(2, Math.floor(w / (34 * s))), rows = Math.max(2, Math.floor(h / (46 * s)));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = x + (c + .5) * w / cols - 7 * s, wy = top + 18 * s + r * 44 * s;
      if (face && r === 0) continue;                                  // the top row is the face
      const lit = hash(seed * 13 + i * 7 + r * 3 + c) < .1 + .75 * wake;
      paint(rectPts(wx, wy, 14 * s, 18 * s), { wash: lit ? NIGHT.win : mixCol(near, '#10142E', .5), washOp: lit ? 230 : 200, ink: null });
    }
    if (face) {
      const cx = x + w / 2, ey = top + 34 * s, ex = Math.min(w * .22, 30 * s), awake = wake > .5;
      for (const d of [-1, 1]) {
        if (awake) { paint(ellPts(cx + d * ex, ey, 9 * s, 11 * s, 10), { wash: NIGHT.win, ink: PAL.ink, sw: sw * .7 }); paint(ellPts(cx + d * ex, ey + 2 * s, 4 * s, 5 * s, 8), { wash: PAL.ink, ink: null }); }
        else inkLine([[cx + d * ex - 10 * s, ey], [cx + d * ex, ey + 6 * s], [cx + d * ex + 10 * s, ey]], sw, NIGHT.win, 'ink', .4);
      }
      const snore = .5 + .5 * Math.sin(t * 2.2 + i);
      if (awake) inkLine([[cx - 10 * s, ey + 18 * s], [cx, ey + 24 * s], [cx + 10 * s, ey + 18 * s]], sw, NIGHT.win, 'ink', .5);
      else paint(ellPts(cx, ey + 22 * s, (4 + 3 * snore) * s, (5 + 3 * snore) * s, 10), { wash: '#10142E', ink: NIGHT.win, sw: sw * .5 });
      // nightcap: slides off and falls as the city wakes
      const off = seg(wake, .45, .9), capX = cx + w * .1 + off * 90 * s, capY = top - 2 * s + off * off * 160 * s;
      if (off < 1) {
        push(); translate(capX, capY); rotate(-.25 + off * 2.2);
        paint([[-26 * s, 0], [26 * s, 0], [8 * s, -44 * s]], { wash: ['#C94F8E', '#3FC1C9', PAL.ochre][i % 3], ink: PAL.ink, sw: sw * .7 });
        paint(ellPts(8 * s, -46 * s, 7 * s, 7 * s, 8), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
        paint(rectPts(-28 * s, -4 * s, 56 * s, 8 * s), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
        pop();
      }
      if (!awake && o.zzz !== false) for (let k = 0; k < 2; k++) {
        const ph = frac(t * .6 + hash(i * 3.1) + k * .5);
        letter('z', cx + 14 * s + ph * 40 * s, top - 20 * s - ph * 90 * s, (16 + 14 * ph) * s, PAL.cream, { alpha: Math.sin(ph * Math.PI) * (1 - wake * 2), rot: -.2 });
      }
    }
    x += w + (8 + 30 * hash(i * 9.1)) * s;
  }
  if (wake < .5 && o.zzz !== false) flushLetters();                 // the zzz belong to the city, under whatever comes next
}

// ---------- the 2 am street ----------
// streetBack(t, o): o.dawn 0..1 (night → morning, same framing) · o.wake 0..1 (the skyline) · o.sign 0..1 (the neon title sign
// over the studio door) · o.door 0..1 (door open) · o.onAir 0..1 (the lamp by the door) · o.sun 0..1 (the rising light: 0 hidden
// behind the skyline, 1 high in the sky; o.sunX, default 960). Returns { ground: 790, light: [560, 790], door: [1420, 780],
// sun: [x, y, r] }. The traffic light itself is a character (dengdeng), placed by the chapter at `light`.
function streetBack(t, o = {}) {
  const dawn = clamp(o.dawn || 0), sunK = clamp(o.sun || 0), sunX = o.sunX ?? 960;
  paint(rectPts(-400, -400, W + 800, 1300), { wash: nightCol('skyBot', dawn), ink: null });
  paint(rectPts(-400, -400, W + 800, 780, 6), { fill: nightCol('skyTop', dawn), fillOp: 220, bleed: .2, tex: .35, border: .3, ink: null });
  for (let i = 0; i < 34; i++) {                                                     // stars fade out at dawn
    const k = (.6 + .4 * Math.sin(t * 3 + i * 1.7)) * (1 - dawn * 1.4);
    if (k > .05) paint(starPts(hash(i) * 2200 - 140, hash(i + 40) * 520 - 60, 5 + 5 * hash(i + 9), .4, 4), { wash: PAL.cream, washOp: 255 * k, ink: null });
  }
  if (dawn < .8) {                                                                   // the moon sets
    const mx = 1640, my = 180 + dawn * 300, a = 1 - dawn / .8;
    paint(ellPts(mx, my, 150, 150, 20), { fill: PAL.cream, fillOp: 50 * a, bleed: .3, ink: null });
    paint(ellPts(mx, my, 70, 70, 22), { wash: '#FFF1C8', washOp: 255 * a, ink: PAL.ink, sw: .9 });
    paint(ellPts(mx + 26, my - 14, 58, 62, 20), { wash: nightCol('skyTop', dawn), washOp: 255 * a, ink: null });  // crescent
  }
  const sun = [sunX, lerp(820, 300, easeOut(sunK)), 130];
  if (sunK > 0) {                                                                    // the light he recorded, rising
    paint(ellPts(sun[0], sun[1], sun[2] * 3.4, sun[2] * 3.2, 22), { fill: '#FF9A4A', fillOp: 150 * sunK, bleed: .3, tex: .2, border: .1, ink: null });
    paint(ellPts(sun[0], sun[1], sun[2] * 1.8, sun[2] * 1.8, 20), { wash: '#FFE6A0', washOp: 150 * sunK, fill: '#FFC24A', fillOp: 160 * sunK, bleed: .25, ink: null });
    paint(ellPts(sun[0], sun[1], sun[2], sun[2], 26), { wash: '#FFD65A', fill: '#FF9A3A', fillOp: 90, tex: .4, border: .5, ink: PAL.ink, sw: 1.2 });
    paint(ellPts(sun[0] - sun[2] * .3, sun[1] - sun[2] * .3, sun[2] * .35, sun[2] * .3, 14), { wash: '#FFF6D8', washOp: 200, ink: null });
  }
  skyline(t, { y: 730, wake: o.wake || 0, dawn });
  // street lamp with its warm cone (off by morning)
  const lampOn = 1 - dawn;
  if (lampOn > .02) paint([[230, 330], [290, 330], [470, 800], [50, 800]], { fill: '#FFD98A', fillOp: 60 * lampOn, bleed: .1, tex: .2, border: .1, ink: null });
  paint(rectPts(252, 330, 14, 470, 1), { wash: '#3A3F63', ink: PAL.ink, sw: .9 });
  paint(rrPts(220, 300, 80, 40, 14), { wash: '#3A3F63', ink: PAL.ink, sw: .9 });
  paint(ellPts(260, 338, 26, 10, 12), { wash: lampOn > .5 ? '#FFF1C8' : '#8E8A96', ink: null });
  // the studio building: brick front, a lit window upstairs, the door with the neon title sign and the ON AIR lamp
  const brick = mixCol('#7A4A5E', '#C9887A', dawn);
  paint(rectPts(1150, 280, 640, 520, 2), { wash: brick, fill: mixCol(brick, '#2A1830', .4), fillOp: 70, tex: .7, border: .5, ink: PAL.ink, sw: 1.3 });
  for (let r = 0; r < 9; r++) inkLine([[1160, 320 + r * 52], [1780, 322 + r * 52]], .45, mixCol(brick, '#2A1830', .5), 'inkfine', 0);
  paint(rectPts(1200, 330, 130, 120, 2), { wash: dawn > .5 ? '#B8D8F0' : '#FFD98A', fill: '#F6B94A', fillOp: 60 * (1 - dawn), ink: PAL.ink, sw: 1 });
  inkLine([[1265, 330], [1265, 450]], .8, PAL.ink, 'ink', 0);
  paint(rectPts(1620, 330, 120, 120, 2), { wash: '#1E2346', fill: '#3A4580', fillOp: 60, ink: PAL.ink, sw: 1 });
  const dx = 1340, dw = 160, door = clamp(o.door || 0);
  paint(rectPts(dx - 14, 548, dw + 28, 240, 2), { wash: '#2E2438', ink: PAL.ink, sw: 1.1 });   // frame
  paint(rectPts(dx, 562, dw, 220), { wash: door > .02 ? '#FFD98A' : '#241C33', fill: '#F6B94A', fillOp: door > .02 ? 90 : 0, ink: null });   // doorway (warm inside)
  const dwOpen = dw * (1 - .85 * door);
  paint([[dx, 562], [dx + dwOpen, 562 - 16 * door], [dx + dwOpen, 782 + 8 * door], [dx, 782]], { wash: '#2F7F86', fill: '#1F4F56', fillOp: 70, tex: .6, ink: PAL.ink, sw: 1.1 });
  if (dwOpen > 60) paint(ellPts(dx + dwOpen - 22, 676, 8, 8, 10), { wash: PAL.ochre, ink: PAL.ink, sw: .6 });
  paint(rectPts(dx - 30, 782, dw + 60, 18, 1), { wash: '#6E6480', ink: PAL.ink, sw: .9 });   // step
  const air = clamp(o.onAir ?? 1);
  if (air > .02) paint(ellPts(1560, 610, 60, 60, 16), { fill: '#FF4A5E', fillOp: 110 * air, bleed: .3, ink: null });
  paint(ellPts(1560, 610, 22, 22, 14), { wash: air > .3 ? '#FF6A78' : '#7A3A44', ink: PAL.ink, sw: .9 });
  const sign = clamp(o.sign ?? 1);
  paint(rrPts(1260, 440, 320, 90, 16), { wash: '#1E1830', ink: PAL.ink, sw: 1.1 });
  if (sign > .02) {
    paint(ellPts(1420, 485, 230, 90, 18), { fill: NEON.magenta, fillOp: 90 * sign, bleed: .3, tex: .2, ink: null });
    letter(SONG.title, 1420, 486, 62, mixCol('#6A3A5E', '#FFE6F4', sign), { ink: false, stroke: sign > .3 ? NEON.magenta : null, rot: -.02 });
  } else letter(SONG.title, 1420, 486, 62, '#6A3A5E', { ink: false, rot: -.02 });
  // sidewalk, curb, road with a zebra crossing at the corner
  paint([[-400, 742], [W + 400, 738], [W + 400, 1500], [-400, 1500]], { wash: nightCol('walk', dawn), fill: mixCol(nightCol('walk', dawn), '#10142E', .3), fillOp: 50, bleed: .04, tex: .7, border: .4, ink: PAL.ink, sw: 1.2 });
  paint([[-400, 810], [W + 400, 806], [W + 400, 1500], [-400, 1500]], { wash: nightCol('road', dawn), fill: mixCol(nightCol('road', dawn), '#000000', .3), fillOp: 50, bleed: .04, tex: .7, border: .4, ink: PAL.ink, sw: 1.2 });
  for (let i = 0; i < 6; i++) paint(rectPts(400 + i * 70, 832, 44, 170, 2), { wash: mixCol('#C9C4D8', '#FFF6E8', dawn), washOp: 200, ink: null });
  for (let x = -300; x < W + 300; x += 220) if (x < 360 || x > 840) paint(rectPts(x, 930, 110, 12, 1), { wash: PAL.cream, washOp: 190, ink: null });
  flushLetters();                                                    // the sign is painted on the building, under the characters
  return { ground: 790, light: [560, 790], door: [1420, 780], sun };
}

// ---------- the studio ----------
// studioBack(t, o): foam walls, neon strips, the window onto the city, the desk with the mixer (VU meters), desk lamp, bin,
// wall clock. o.neon 0..1 (default 1) with o.neonA / o.neonB colours · o.level 0..1 (VU bars; default bounces on the beat)
// · o.dawn 0..1 and o.wake 0..1 (sky and city in the window) · o.bin 0..1 (paper balls glowing) · o.clock (hour, default 2).
// Returns { floor: 830, mic: [760, 830], window: [x, y, w, h], bin: [250, 830], mixer: [x, y], clock: [x, y] }.
function studioBack(t, o = {}) {
  const neon = o.neon ?? 1, A = o.neonA || NEON.cyan, Bc = o.neonB || NEON.magenta, dawn = clamp(o.dawn || 0);
  paint(rectPts(-400, -400, W + 800, 1300), { wash: '#2A2452', fill: '#3A2F6A', fillOp: 90, bleed: .05, tex: .7, border: .3, ink: null });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {                        // foam panels
    const px = 40 + c * 158, py = 150 + r * 150;
    paint(rrPts(px, py, 140, 132, 18, 3), { wash: (r + c) % 2 ? '#342C62' : '#2F285A', ink: '#1E1840', sw: .7 });
    inkLine([[px + 24, py + 30], [px + 116, py + 102]], .4, '#403670', 'inkfine', 0);
  }
  for (const [x0, x1, col] of [[40, 1110, A], [1170, 1880, Bc]]) {                  // neon strips
    if (neon > .02) paint(ellPts((x0 + x1) / 2, 92, (x1 - x0) * .55, 90, 16), { fill: col, fillOp: 80 * neon, bleed: .3, tex: .2, ink: null });
    paint(rrPts(x0, 80, x1 - x0, 22, 11), { wash: mixCol('#3A3060', col, .3 + .7 * neon), ink: PAL.ink, sw: .9 });
    paint(rrPts(x0 + 8, 85, x1 - x0 - 16, 8, 4), { wash: mixCol(col, '#FFFFFF', .5 * neon), washOp: 200 * neon, ink: null });
  }
  // the window onto the city
  const win = [1180, 170, 560, 390];
  paint(rectPts(win[0], win[1], win[2], win[3]), { wash: nightCol('skyBot', dawn), fill: nightCol('skyTop', dawn), fillOp: 150, bleed: .15, tex: .3, ink: null });
  for (let i = 0; i < 10; i++) { const k = 1 - dawn * 1.4; if (k > .05) paint(starPts(win[0] + 30 + hash(i + 3) * (win[2] - 60), win[1] + 20 + hash(i + 8) * 150, 4 + 3 * hash(i), .4, 4), { wash: PAL.cream, washOp: 255 * k, ink: null }); }
  skyline(t, { y: win[1] + win[3] - 6, x0: win[0] + 6, x1: win[0] + win[2] - 6, s: .5, wake: o.wake || 0, dawn, seed: 8 });
  paint(rectPts(win[0] - 14, win[1] - 14, win[2] + 28, win[3] + 28, 2), { ink: PAL.ink, sw: 2.2 });
  paint(rectPts(win[0] - 18, win[1] + win[3], win[2] + 36, 24, 2), { wash: '#4A3E6E', ink: PAL.ink, sw: 1 });
  inkLine([[win[0] + win[2] / 2, win[1]], [win[0] + win[2] / 2, win[1] + win[3]]], 2.4, '#4A3E6E', 'ink', 0);
  // wall clock (hands at o.clock hours)
  const ck = [430, 250], hr = o.clock ?? 2;
  paint(ellPts(ck[0], ck[1], 52, 52, 20), { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; inkLine([[ck[0] + Math.cos(a) * 40, ck[1] + Math.sin(a) * 40], [ck[0] + Math.cos(a) * 46, ck[1] + Math.sin(a) * 46]], .5, PAL.ink, 'inkfine', 0); }
  const ah = (hr % 12) / 12 * TAU - Math.PI / 2, am = frac(hr) * TAU - Math.PI / 2;
  inkLine([[ck[0], ck[1]], [ck[0] + Math.cos(ah) * 26, ck[1] + Math.sin(ah) * 26]], 1.6, PAL.ink, 'ink', 0);
  inkLine([[ck[0], ck[1]], [ck[0] + Math.cos(am) * 38, ck[1] + Math.sin(am) * 38]], 1, PAL.ink, 'ink', 0);
  // floor and rug
  paint([[-400, 830], [W + 400, 826], [W + 400, 1500], [-400, 1500]], { wash: '#3A2C4A', fill: '#24182E', fillOp: 60, bleed: .04, tex: .7, border: .4, ink: PAL.ink, sw: 1.2 });
  paint(ellPts(800, 900, 520, 70, 22), { wash: '#6A3060', fill: '#C94F8E', fillOp: 50, tex: .6, ink: PAL.ink, sw: .9 });
  // desk with the mixer and a glowing laptop, desk lamp
  paint(rectPts(1150, 690, 720, 34, 2), { wash: '#6E4A3E', fill: '#4A2E26', fillOp: 60, tex: .6, ink: PAL.ink, sw: 1.1 });
  for (const lx of [1180, 1820]) paint(rectPts(lx, 724, 26, 110), { wash: '#4A2E26', ink: PAL.ink, sw: .9 });
  const mx = 1560, my = 690, lv = clamp(o.level ?? (.35 + .6 * pulse(t, 4)));
  paint([[mx - 170, my], [mx + 170, my], [mx + 150, my - 60], [mx - 150, my - 60]], { wash: '#2E2A40', ink: PAL.ink, sw: 1 });
  for (let i = 0; i < 8; i++) {
    const on = (i + 1) / 8 <= lv, c = i < 5 ? NEON.cyan : i < 7 ? PAL.ochre : NEON.magenta;
    paint(rectPts(mx - 130 + i * 34, my - 50, 24, 16), { wash: on ? c : '#403A58', ink: null });
    inkLine([[mx - 118 + i * 34, my - 28], [mx - 118 + i * 34, my - 6]], .7, '#8E8AA8', 'inkfine', 0);
  }
  paint([[1280, 690], [1400, 690], [1390, 600], [1270, 600]], { wash: '#1E2346', fill: NEON.cyan, fillOp: 60, ink: PAL.ink, sw: 1 });
  paint(ellPts(1335, 640, 90, 70, 14), { fill: NEON.cyan, fillOp: 40, bleed: .3, ink: null });
  paint([[1180, 690], [1210, 690], [1230, 600], [1260, 560]], { ink: '#8E8AA8', sw: 1.2 });
  paint([[1238, 548], [1290, 560], [1276, 590], [1226, 578]], { wash: PAL.ochre, ink: PAL.ink, sw: .8 });
  paint([[1250, 590], [1276, 592], [1320, 690], [1190, 690]], { fill: '#FFD98A', fillOp: 70, bleed: .1, tex: .2, ink: null });
  // the bin full of paper balls (the unheard words sleep in them)
  const bk = clamp(o.bin || 0);
  if (bk > .02) paint(ellPts(250, 740, 150, 110, 16), { fill: '#F6B94A', fillOp: 100 * bk, bleed: .3, ink: null });
  for (let i = 0; i < 5; i++) paint(ellPts(200 + i * 26 + (i % 2) * 6, 736 - (i % 3) * 14, 22, 18, 10, 3), { wash: bk > .3 ? mixCol(PAL.cream, '#FFD98A', bk) : PAL.cream, ink: PAL.ink, sw: .7 });
  paint([[170, 740], [330, 740], [312, 830], [188, 830]], { wash: '#4A5A7A', fill: '#2E3A56', fillOp: 60, tex: .5, ink: PAL.ink, sw: 1.1 });
  return { floor: 830, mic: [760, 830], window: win, bin: [250, 830], mixer: [mx, my - 40], clock: ck };
}

// ---------- the microphone ----------
// mic(x, y, s, o): (x, y) = floor point of the stand, s = scale (1 → about 560 px to the top of the capsule). o.on 0..1 lights
// the ring on the capsule (cyan); o.glow 0..1 a warm glow around it; o.cable [x, y] where the cable goes (default the mixer).
// Returns [cx, cy], the capsule centre, for light beams that pour into it.
function mic(x, y, s = 1, o = {}) {
  const sw = clamp(1.2 * s, .5, 1.8), cx = x, cy = y - 480 * s, on = clamp(o.on || 0), glow = clamp(o.glow || 0);
  const cab = o.cable || [1560, 650];
  inkLine([[x + 20 * s, y - 10 * s], [lerp(x, cab[0], .4), y + 30 * s], [lerp(x, cab[0], .8), y + 10 * s], [cab[0], cab[1]]], 2.4 * s, '#1E1830', 'ink', .7);
  for (const d of [-1, 0, 1]) inkLine([[x, y - 60 * s], [x + d * 80 * s, y]], 2.6 * s, '#3A3F63', 'ink', 0);
  paint(rectPts(x - 7 * s, cy + 40 * s, 14 * s, y - 60 * s - cy - 40 * s), { wash: '#5A6080', ink: PAL.ink, sw: sw * .6 });
  if (glow > .02) paint(ellPts(cx, cy, 190 * s, 190 * s, 18), { fill: '#FFD36B', fillOp: 120 * glow, bleed: .3, tex: .2, border: .1, ink: null });
  if (on > .02) paint(ellPts(cx, cy, 110 * s, 130 * s, 16), { fill: NEON.cyan, fillOp: 90 * on, bleed: .3, ink: null });
  paint(ellPts(cx, cy + 20 * s, 62 * s, 34 * s, 16), { ink: '#8E8AA8', sw: sw * .8 });                      // shock mount
  paint(rrPts(cx - 34 * s, cy - 80 * s, 68 * s, 150 * s, 32 * s), { wash: '#C9CED6', fill: '#8E96A8', fillOp: 60, tex: .5, ink: PAL.ink, sw });
  for (let k = 0; k < 6; k++) inkLine([[cx - 26 * s, cy - 60 * s + k * 16 * s], [cx + 26 * s, cy - 60 * s + k * 16 * s]], .5, '#7E8698', 'inkfine', 0);
  paint(rectPts(cx - 34 * s, cy + 6 * s, 68 * s, 14 * s), { wash: on > .3 ? NEON.cyan : '#3A3F63', ink: PAL.ink, sw: sw * .5 });
  paint(ellPts(cx - 12 * s, cy - 50 * s, 8 * s, 18 * s, 8), { wash: '#FFFFFF', washOp: 170, ink: null });
  // pop filter in front
  inkLine([[cx + 40 * s, cy + 50 * s], [cx + 90 * s, cy + 10 * s]], 1.2 * s, '#3A3F63', 'ink', .4);
  paint(ellPts(cx + 96 * s, cy - 10 * s, 44 * s, 58 * s, 16), { wash: '#1E1830', washOp: 120, ink: PAL.ink, sw: sw * .8 });
  return [cx, cy];
}

// check scene: node render.mjs --loop=sets --sheet=0.5,1.5,2.5,3.5,4.5,5.5 --cols=3 --out=out/check/sets.jpg
LOOPS.sets = t => {
  if (t < 2) { const L = streetBack(t, { sign: .6 + .4 * pulse(t, 4) }); dengdeng(L.light[0], L.light[1], 26, { light: 'red', eyes: 'sleepy', mouth: 'O' }); }
  else if (t < 4) { const k = t - 2, L = streetBack(t, { dawn: k / 2, wake: k / 2, sun: k / 2, sign: 1 - k / 2 }); dengdeng(L.light[0], L.light[1], 26, { light: k > 1 ? 'green' : 'red', eyes: 'happy', mouth: 'grin' }); }
  else { const L = studioBack(t, { bin: t > 5 ? 1 : 0, dawn: t > 5 ? .6 : 0 }); mic(L.mic[0], L.mic[1], 1, { on: t > 5 ? 1 : 0, glow: t > 5 ? 1 : 0 }); xiaoye(560, 830, 22, { ...move('bounce', t), mouth: 'sing', glow: 1 }); }
};
LOOPS.sets.len = 6;
