// characters.js: this song's main cast, designed from its lyrics (STORYBOARD.md, cast table) and shared by every chapter.
// Written before the chapters are painted. One function per character, same contract as clawd() / researcher():
//   name(x, y, u, o): (x, y) is the ground point between the feet, u the size unit, o the pose / face / hook options,
//   so move(), mood(), emote and hand hooks work on everyone. See paint-mv-animate/characters.md.
// Register a model sheet as LOOPS.cast and check the cast with
//   node render.mjs --loop=cast --sheet=0,1,2,3,4,5 --cols=3 --out=out/check/cast.jpg
//
// Eye names (all characters): normal, look (+lookX/lookY), happy, closed, wink, narrow, angry, scared, spark, heart, x, swirl,
// dot, sleepy. Anything a character can't draw falls back to normal.

// polygon around a polyline, width w0 → w1 (tails, headphone bands, light ribbons)
function tubePts(path, w0, w1 = w0) {
  const L = [], R = [];
  path.forEach((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const w = lerp(w0, w1, i / Math.max(1, path.length - 1)) / 2, nx = -(b[1] - a[1]) / d * w, ny = (b[0] - a[0]) / d * w;
    L.push([p[0] + nx, p[1] + ny]); R.push([p[0] - nx, p[1] - ny]);
  });
  return L.concat(R.reverse());
}

// A pair of cartoon eyes centred at (cx ± dx, cy); r = eye radius. Shared by the whole cast so faces act alike.
function castEyes(cx, cy, dx, r, o, sw, lidCol) {
  const e = o.eyes || 'normal', sqz = clamp(o.squint || 0), seed = o.seed || 0;
  const blink = (e === 'normal' || e === 'dot' || e === 'look') && ((T * .85 + seed * 1.37) % 3.6) < .12;
  const lx = e === 'look' ? (o.lookX || 0) * r * .6 : 0, ly = e === 'look' ? (o.lookY || 0) * r * .5 : 0;
  for (const s of [-1, 1]) {
    const x = cx + s * dx, y = cy;
    if (sqz > .8 || blink || e === 'closed') { inkLine([[x - r, y - r * .1], [x, y + r * .45], [x + r, y - r * .1]], sw, PAL.ink, 'ink', .4); continue; }
    if (e === 'happy' || (e === 'wink' && s > 0)) { inkLine([[x - r, y + r * .35], [x, y - r * .6], [x + r, y + r * .35]], sw * 1.2, PAL.ink, 'ink', .3); continue; }
    if (e === 'scared') { paint(ellPts(x, y, r * 1.15, r * 1.3, 14), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 }); paint(ellPts(x + lx, y + r * .1, r * .38, r * .45, 10), { wash: PAL.ink, ink: null }); continue; }
    if (e === 'heart') { paint(heartPts(x, y, r * 1.15, 16), { wash: '#E2476E', ink: PAL.ink, sw: sw * .5 }); continue; }
    if (e === 'spark') { paint(starPts(x, y, r * 1.5 * (1 + .12 * Math.sin(T * 14 + s)), .4, 4), { wash: PAL.cream, fill: PAL.ochre, fillOp: 80, ink: PAL.ink, sw: sw * .5 }); continue; }
    if (e === 'x') { inkLine([[x - r * .7, y - r * .7], [x + r * .7, y + r * .7]], sw, PAL.ink, 'ink', 0); inkLine([[x + r * .7, y - r * .7], [x - r * .7, y + r * .7]], sw, PAL.ink, 'ink', 0); continue; }
    if (e === 'swirl') { const sp = []; for (let k = 0; k < 14; k++) { const a = k * .8 + T * 7 * s, rr = k * .07 * r; sp.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } inkLine(sp, sw * .6, PAL.ink, 'inkfine', .6); continue; }
    const h = (e === 'narrow' ? .45 : 1) * (1 - sqz * .8);
    paint(ellPts(x + lx, y + ly, r * .72, r * .95 * h, 12), { wash: PAL.ink, ink: null });
    if (r > 5 && h > .6) paint(ellPts(x + lx + r * .22, y + ly - r * .3, r * .22, r * .26, 8), { wash: PAL.cream, washOp: 230, ink: null });
    if (e === 'sleepy') { paint([[x - r * 1.05, y - r * 1.1], [x + r * 1.05, y - r * 1.1], [x + r * 1.05, y + r * .05], [x - r * 1.05, y + r * .05]], { wash: lidCol, ink: null }); inkLine([[x - r * .9, y + r * .05], [x + r * .9, y + r * .05]], sw * .8, PAL.ink, 'ink', 0); }
    if (e === 'angry') inkLine([[x - s * r * 1.1, y - r * 1.5], [x + s * r * .6, y - r * .9]], sw * 1.1, PAL.ink, 'ink', 0);
  }
}

// ======================================================================================================================
// 小夜 xiaoye: the "I" of the song, a night-owl rapper with oversized headphones.
// xiaoye(x, y, u, o): (x, y) = ground point between the feet, u = unit. About 12.3u tall to the top of the headphone band.
// Local coords: feet y 0, hips -3u, shoulders (±1.8u, -6.8u), head centre (0, -9.4u) radius 2.35u, eyes at (±.85u, -9.2u),
// headphone cups at (±2.45u, -9.3u). Arms pivot at the shoulders and are 3.15u long to the hand centre; handL / handR hooks are
// called at the hand centre in arm space (+x outward). Arm angles as Clawd: 0 out, + raised, about -1.2 hanging (default).
// o: dy sq take rot flip sx sy aL aR walk run noShadow seed · eyes squint lookX lookY mouth ('smile' 'grin' 'o' 'O' 'flat'
//    'wobble' 'cat' 'sing') blush brows ('worried' 'angry' 'up') · hood (up) · phones (default true) glow (headphones 0..1)
//    · col dk lt (hoodie) · draw(u, sw) handL handR · emote emoteK
// ======================================================================================================================
const XY = { col: '#C94F8E', dk: '#8A2E62', lt: '#F08FBF', skin: '#F2C4A0', hair: '#2B2440', pants: '#34306E', phones: '#3FC1C9', phonesDk: '#1F7F86' };
function xiaoye(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .06;
  const col = o.col || XY.col, dk = o.dk || XY.dk, lt = o.lt || XY.lt;
  if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06); paint(ellPts(x, y + u * .12, u * 3.3 * f, u * .75 * f, 20), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null }); }
  push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), (o.sy ?? 1) * (1 - sq));
  // legs and sneakers
  for (const [side, i] of [[-1, 0], [1, 1]]) {
    let h = 3, a = 0;
    if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .9; }
    if (o.run != null) a = Math.sin((o.run + (i ? .5 : 0)) * TAU) * .55;
    push(); translate(side * .85 * u, -3 * u); rotate(a);
    paint(rrPts(-.55 * u, 0, 1.1 * u, h * u, .4 * u, J * .5), { wash: XY.pants, fill: PAL.night, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .7 });
    paint(rrPts(-.75 * u + side * .15 * u, (h - .6) * u, 1.65 * u, .8 * u, .38 * u), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 });
    paint(rectPts(-.7 * u + side * .15 * u, (h - .02) * u, 1.55 * u, .2 * u), { wash: col, ink: null });
    pop();
  }
  // arms (behind the hoodie edge): sleeve + hand
  const arm = (side, a, hook) => {
    push(); translate(side * 1.8 * u, -6.8 * u); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -2.95 * u : -.1 * u, -.52 * u, 3.05 * u, 1.04 * u, .45 * u, J * .5), { wash: col, fill: dk, fillOp: 45, tex: .5, ink: PAL.ink, sw: sw * .75 });
    translate(side * 3.15 * u, 0);
    paint(ellPts(0, 0, .58 * u, .58 * u, 12), { wash: XY.skin, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? -1.2, o.handL); arm(1, o.aR ?? -1.2, o.handR);
  // hood (down) behind the neck, then the hoodie: flat base, light pool, dark hem band, pocket, strings, ink
  if (!o.hood) paint(ellPts(0, -7.35 * u, 2.05 * u, .85 * u, 16, J), { wash: dk, ink: PAL.ink, sw: sw * .7 });
  const body = [[-1.95 * u, -7.4 * u], [1.95 * u, -7.4 * u], [2.35 * u, -4.2 * u], [2.3 * u, -2.7 * u], [-2.3 * u, -2.7 * u], [-2.35 * u, -4.2 * u]];
  paint(body, { wash: col, washOp: 255, ink: null, curv: .25 });
  paint(ellPts(-.7 * u, -6.1 * u, 1.3 * u, .9 * u, 14, J * 2, -.2), { fill: lt, fillOp: 120, bleed: .2, tex: .85, border: .8, ink: null });
  paint(rectPts(-2.2 * u, -3.4 * u, 4.4 * u, .75 * u, J), { fill: dk, fillOp: 130, bleed: .03, tex: .7, border: .5, ink: null });
  inkLine([[-1.3 * u, -3.5 * u], [-1 * u, -4.9 * u], [1 * u, -4.9 * u], [1.3 * u, -3.5 * u]], sw * .5, dk, 'inkfine', .2);
  for (const s of [-1, 1]) inkLine([[s * .45 * u, -7.2 * u], [s * .5 * u, -6 * u]], sw * .55, PAL.cream, 'inkfine', 0);
  paint(body, { ink: PAL.ink, sw, curv: .25 });
  // head: neck, face, hair with messy bangs
  const hy = -9.4 * u, R = 2.35 * u;
  paint(rectPts(-.45 * u, -7.9 * u, .9 * u, .7 * u), { wash: XY.skin, ink: null });
  paint(ellPts(0, hy, R, R * .97, 24, J * .5), { wash: XY.skin, fill: '#E9A98A', fillOp: 45, tex: .6, border: .5, ink: PAL.ink, sw: sw * .85 });
  const hair = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI * 1.05 + i / 12 * Math.PI * .9; hair.push([Math.cos(a) * R * 1.07, hy + Math.sin(a) * R * 1.06]); }
  hair.push([1.95 * u, hy - .55 * u], [1.3 * u, hy - 1.25 * u], [.75 * u, hy - .6 * u], [.1 * u, hy - 1.35 * u], [-.55 * u, hy - .65 * u], [-1.2 * u, hy - 1.3 * u], [-2 * u, hy - .45 * u]);
  paint(hair, { wash: XY.hair, fill: PAL.violet, fillOp: 40, tex: .6, ink: PAL.ink, sw: sw * .7 });
  inkLine([[.3 * u, hy - 2.4 * u], [.7 * u, hy - 3.1 * u], [1.25 * u, hy - 2.9 * u]], sw * 1.1, XY.hair, 'ink', .6);   // cowlick
  if (o.hood) {   // hood up: a band around the top of the head
    const hp = [];
    for (let i = 0; i <= 14; i++) { const a = Math.PI * .9 + i / 14 * Math.PI * 1.2; hp.push([Math.cos(a) * R * 1.28, hy + Math.sin(a) * R * 1.25]); }
    for (let i = 14; i >= 0; i--) { const a = Math.PI * .9 + i / 14 * Math.PI * 1.2; hp.push([Math.cos(a) * R * 1.02, hy + Math.sin(a) * R * 1.0]); }
    paint(hp, { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .8 });
  }
  // face
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * 1.45 * u, hy + .7 * u, .5 * u, .28 * u, 12), { fill: PAL.rose, fillOp: 160, bleed: .2, ink: null });
  castEyes(0, hy + .2 * u, .85 * u, .36 * u, o, sw, XY.skin);
  if (o.brows) for (const s of [-1, 1]) {
    const tilt = o.brows === 'worried' ? -s * .3 : o.brows === 'angry' ? s * .35 : 0, lift = o.brows === 'up' ? -.3 * u : 0;
    inkLine([[s * .85 * u - .4 * u, hy - .72 * u + lift + tilt * u * .5], [s * .85 * u + .4 * u, hy - .72 * u + lift - tilt * u * .5]], sw * .8, XY.hair, 'ink', 0);
  }
  const my = hy + 1.25 * u, m = o.mouth || 'smile';
  if (m === 'smile') inkLine([[-.5 * u, my - .08 * u], [0, my + .25 * u], [.5 * u, my - .08 * u]], sw * .7, PAL.ink, 'ink', .6);
  else if (m === 'grin') paint([[-.7 * u, my - .15 * u], [.7 * u, my - .15 * u], [.45 * u, my + .45 * u], [-.45 * u, my + .45 * u]], { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5, curv: .4 });
  else if (m === 'o') paint(ellPts(0, my + .1 * u, .25 * u, .3 * u, 10), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .4 });
  else if (m === 'O') paint(ellPts(0, my + .2 * u, .5 * u, .62 * u, 14), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5 });
  else if (m === 'sing') { const k = .35 + .65 * pulse2(T, 5); paint(ellPts(0, my + .15 * u, .42 * u, .15 * u + .45 * u * k, 14), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5 }); }
  else if (m === 'flat') inkLine([[-.4 * u, my], [.4 * u, my]], sw * .7, PAL.ink, 'ink', 0);
  else if (m === 'wobble') inkLine([[-.6 * u, my], [-.3 * u, my - .15 * u], [0, my], [.3 * u, my - .15 * u], [.6 * u, my]], sw * .6, PAL.ink, 'ink', .3);
  else if (m === 'cat') inkLine([[-.55 * u, my - .05 * u], [-.27 * u, my + .2 * u], [0, my - .05 * u], [.27 * u, my + .2 * u], [.55 * u, my - .05 * u]], sw * .6, PAL.ink, 'ink', .5);
  // the oversized headphones (the signature): band over the head, big cups over the ears
  if (o.phones !== false) {
    const band = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; band.push([Math.cos(a) * 2.45 * u, hy - .2 * u + Math.sin(a) * 2.75 * u]); }
    paint(tubePts(band, .6 * u), { wash: XY.phonesDk, ink: PAL.ink, sw: sw * .7 });
    const g = clamp(o.glow || 0);
    for (const s of [-1, 1]) {
      if (g > .02) paint(ellPts(s * 2.45 * u, hy + .1 * u, 1.9 * u, 2.2 * u, 16), { fill: XY.phones, fillOp: 110 * g, bleed: .3, tex: .2, ink: null });
      paint(rrPts(s * 2.45 * u - .8 * u, hy - 1.05 * u, 1.6 * u, 2.3 * u, .7 * u, J * .4), { wash: XY.phones, fill: XY.phonesDk, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8 });
      paint(ellPts(s * 2.45 * u + s * .1 * u, hy + .1 * u, .45 * u, .75 * u, 12), { wash: g > .02 ? '#E8FFFF' : XY.phonesDk, ink: null });
    }
  }
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 3 * u, y + (o.dy || 0) * u - 12.6 * u, u * .95, o.emoteK ?? 1);
}

// ======================================================================================================================
// 灯灯 dengdeng: the yellow traffic light, the only other one awake. Its two lamps are its eyes: the lit one is open.
// dengdeng(x, y, u, o): (x, y) = ground point under the base, u = unit. About 13.6u tall.
// Local coords: base y 0, pole up to -7u, lamp box x -2.1u..2.1u, y -13.6u..-6.9u; red lamp centre (0, -11.75u), green lamp
// (0, -8.85u), radius 1.05u; mouth at (0, -7.45u). Arms pivot at the box sides (±2.05u, -8.3u) and are 2.3u long; armL / armR
// hooks at the tip.
// o: light 'red' (default) | 'green' | 'both' | 'off' · glow 0..1 (default 1) · dy sq take rot flip sx sy aL aR walk noShadow
//    seed · eyes squint lookX lookY mouth ('smile' 'o' 'O' 'flat' 'wobble' 'grin') blush · draw armL armR · emote emoteK
// ======================================================================================================================
const DD = { col: '#F2C53D', dk: '#B8861C', lt: '#FFE8A3', pole: '#4F5A72', visor: '#39405A', red: '#E83A4A', green: '#3DC47A' };
function dengdeng(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .05, light = o.light || 'red', glow = o.glow ?? 1;
  const col = o.col || DD.col, dk = o.dk || DD.dk, lt = o.lt || DD.lt;
  if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06); paint(ellPts(x, y + u * .12, u * 2.8 * f, u * .6 * f, 18), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null }); }
  push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), (o.sy ?? 1) * (1 - sq));
  // two little feet (lift in turn when walking) and the base plate
  [-1, 1].forEach((s, i) => {
    let lift = 0; if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) lift = ph * .7; }
    paint(ellPts(s * .95 * u, -.3 * u - lift * u, .75 * u, .35 * u, 12), { wash: DD.visor, ink: PAL.ink, sw: sw * .6 });
  });
  paint(rrPts(-1.2 * u, -.9 * u, 2.4 * u, .6 * u, .25 * u), { wash: DD.pole, ink: PAL.ink, sw: sw * .7 });
  // arms on the box sides (drawn after the box, so the shoulders sit on its edges)
  const arm = (side, a, hook) => {
    push(); translate(side * 2.05 * u, -8.3 * u); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -2.3 * u : 0, -.28 * u, 2.3 * u, .56 * u, .28 * u, J * .5), { wash: col, ink: PAL.ink, sw: sw * .6 });
    translate(side * 2.3 * u, 0);
    paint(ellPts(0, 0, .45 * u, .45 * u, 10), { wash: col, fill: dk, fillOp: 50, ink: PAL.ink, sw: sw * .6 });
    if (hook) { if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  // pole
  paint(rectPts(-.4 * u, -7.1 * u, .8 * u, 6.3 * u, J * .4), { wash: DD.pole, ink: PAL.ink, sw: sw * .7 });
  inkLine([[-.15 * u, -6.9 * u], [-.15 * u, -1.1 * u]], sw * .5, '#8E9AB6', 'inkfine', 0);
  // lamp glow behind the box
  const lampY = { red: -11.75 * u, green: -8.85 * u }, lampOn = k => light === 'both' || light === k;
  for (const k of ['red', 'green']) if (lampOn(k) && glow > .02) paint(ellPts(0, lampY[k], 3.6 * u, 3.4 * u, 18), { fill: DD[k], fillOp: 90 * glow, bleed: .3, tex: .2, border: .1, ink: null });
  // the lamp box: flat base, light pool, dark settle, ink
  const box = rrPts(-2.1 * u, -13.6 * u, 4.2 * u, 6.7 * u, 1 * u, J);
  paint(box, { wash: col, washOp: 255, ink: null });
  paint(ellPts(-.8 * u, -12.4 * u, 1 * u, 1.9 * u, 14, J * 2), { fill: lt, fillOp: 130, bleed: .2, tex: .85, border: .8, ink: null });
  paint(rectPts(-2 * u, -7.7 * u, 4 * u, .7 * u, J), { fill: dk, fillOp: 120, bleed: .03, tex: .7, border: .5, ink: null });
  paint(box, { ink: PAL.ink, sw });
  // lamps with visors; the lit lamp holds an open eye, the dark one sleeps
  for (const k of ['red', 'green']) {
    const ly = lampY[k], on = lampOn(k), r = 1.05 * u;
    paint(ellPts(0, ly, r * 1.12, r * 1.12, 18), { wash: DD.visor, ink: PAL.ink, sw: sw * .6 });
    paint(ellPts(0, ly, r, r, 18), { wash: on ? DD[k] : mixCol(DD[k], DD.visor, .7), fill: on ? PAL.cream : PAL.ink, fillOp: on ? 70 : 30, tex: .4, ink: null });
    const vis = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; vis.push([Math.cos(a) * r * 1.3, ly - r * .15 + Math.sin(a) * r * 1.05]); }
    vis.push([r * 1.3, ly - r * .05], [-r * 1.3, ly - r * .05]);
    paint(vis, { wash: DD.visor, ink: PAL.ink, sw: sw * .6, curv: .3 });
    if (on) castEyes(0, ly + r * .15, 0, r * .42, { ...o, eyes: o.eyes || 'normal' }, sw * .9, DD[k]);
    else inkLine([[-r * .45, ly + r * .1], [0, ly + r * .35], [r * .45, ly + r * .1]], sw * .8, PAL.ink, 'ink', .4);
  }
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * 1.55 * u, -8.2 * u, .35 * u, .2 * u, 10), { fill: PAL.rose, fillOp: 170, bleed: .2, ink: null });
  const my = -7.45 * u, m = o.mouth || 'smile';
  if (m === 'smile') inkLine([[-.45 * u, my - .08 * u], [0, my + .18 * u], [.45 * u, my - .08 * u]], sw * .7, PAL.ink, 'ink', .6);
  else if (m === 'O') paint(ellPts(0, my + .05 * u, .38 * u, .3 * u, 12), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5 });
  else if (m === 'o') paint(ellPts(0, my, .2 * u, .17 * u, 10), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .4 });
  else if (m === 'grin') paint([[-.55 * u, my - .15 * u], [.55 * u, my - .15 * u], [.35 * u, my + .25 * u], [-.35 * u, my + .25 * u]], { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5, curv: .4 });
  else if (m === 'wobble') inkLine([[-.5 * u, my], [-.25 * u, my - .12 * u], [0, my], [.25 * u, my - .12 * u], [.5 * u, my]], sw * .6, PAL.ink, 'ink', .3);
  else inkLine([[-.35 * u, my], [.35 * u, my]], sw * .7, PAL.ink, 'ink', 0);
  arm(-1, o.aL ?? -.7, o.armL); arm(1, o.aR ?? -.7, o.armR);
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 2.7 * u, y + (o.dy || 0) * u - 14.2 * u, u * .9, o.emoteK ?? 1);
}

// ======================================================================================================================
// 字灵 ziling: an unheard word, still warm. A little flame with a face and one ink stroke of a character on it.
// ziling(x, y, u, o): (x, y) = bottom of the flame, u = unit. About 3.3u tall, with a halo of light (o.glow 0..1, default 1).
// Cheap enough to draw a dozen at once. o: dy sq take rot flip sx sy · eyes squint mouth ('smile' 'o' 'O' 'flat') blush
//    · glyph (0..4, which stroke) · col dk lt · seed (wobble phase) · draw · emote emoteK
// ======================================================================================================================
const ZL = { col: '#F6B94A', dk: '#E07A3A', lt: '#FFF3CF' };
function ziling(x, y, u, o = {}) {
  const sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 12, .4, 1.8), seed = o.seed || 0, glow = o.glow ?? 1;
  const col = o.col || ZL.col, dk = o.dk || ZL.dk, lt = o.lt || ZL.lt;
  push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .5), (o.sy ?? 1) * (1 - sq));
  if (glow > .02) paint(ellPts(0, -1.4 * u, 2.6 * u, 2.6 * u, 16), { fill: col, fillOp: 80 * glow, bleed: .3, tex: .2, border: .1, ink: null });
  const tip = [.35 * u * Math.sin(T * 6 + seed * 2.1), -3.3 * u], body = [];
  for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; body.push([Math.cos(a) * 1.15 * u, -1.15 * u + Math.sin(a) * 1.15 * u]); }
  body.push([-1.05 * u, -1.9 * u], [-.55 * u, -2.7 * u], tip, [.6 * u, -2.6 * u], [1.1 * u, -1.8 * u]);
  paint(body, { wash: col, washOp: 255, ink: null, curv: .5 });
  paint(ellPts(0, -.95 * u, .7 * u, .55 * u, 12), { fill: lt, fillOp: 170, bleed: .15, tex: .5, border: .6, ink: null });
  const G = [[[-.5, -2.1], [.4, -2.3]], [[-.1, -2.6], [-.3, -1.9], [-.6, -1.6]], [[.1, -2.5], [.35, -2.0]], [[-.45, -2.2], [.2, -2.2], [0, -1.8]], [[-.4, -1.9], [0, -2.5], [.35, -1.9]]][(o.glyph ?? Math.floor(hash(seed * 3.3) * 5)) % 5];
  inkLine(G.map(([a, b]) => [a * u, b * u]), sw * .9, dk, 'ink', .3);
  paint(body, { ink: PAL.ink, sw: sw * .8, curv: .5 });
  castEyes(0, -1.25 * u, .4 * u, .18 * u, o, sw * .8, col);
  const my = -.75 * u, m = o.mouth || 'smile';
  if (m === 'smile') inkLine([[-.22 * u, my - .04 * u], [0, my + .1 * u], [.22 * u, my - .04 * u]], sw * .6, PAL.ink, 'ink', .6);
  else if (m === 'O' || m === 'o') paint(ellPts(0, my, (m === 'O' ? .18 : .1) * u, (m === 'O' ? .2 : .11) * u, 8), { wash: '#6A2A35', ink: null });
  else inkLine([[-.16 * u, my], [.16 * u, my]], sw * .6, PAL.ink, 'ink', 0);
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * .7 * u, -.9 * u, .2 * u, .11 * u, 8), { fill: PAL.rose, fillOp: 170, ink: null });
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + 1.6 * u, y + (o.dy || 0) * u - 3.6 * u, u * .6, o.emoteK ?? 1);
}

// ======================================================================================================================
// 鼓点仔 drumkid: the beat in the headphones. kind 'kick' (default): a bass drum seen head-on, about 6.4u tall; kind 'snare':
// a snare drum from the side, about 4.9u tall. A drumstick in each hand (o.sticks === false hides them).
// drumkid(x, y, u, o): (x, y) = ground point. Arms pivot at the body sides (kick ±2.45u, -3.4u; snare ±2.4u, -3.3u) and are
// 1.8u long; armL / armR hooks at the tip (after the stick). o: kind · dy sq take rot flip sx sy aL aR walk noShadow seed
//    · eyes squint lookX lookY mouth ('smile' 'grin' 'o' 'O' 'flat') blush · col dk lt · sticks · draw armL armR · emote emoteK
// ======================================================================================================================
const DK = { kick: { col: '#3FC1C9', dk: '#1F7F86', lt: '#A6ECEF' }, snare: { col: '#C94F8E', dk: '#8A2E62', lt: '#F08FBF' }, head: '#FFF3DE', chrome: '#D6DCE6', stick: '#E3C08A' };
function drumkid(x, y, u, o = {}) {
  const kind = o.kind || 'kick', K = DK[kind], sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .05;
  const col = o.col || K.col, dk = o.dk || K.dk, lt = o.lt || K.lt;
  if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06); paint(ellPts(x, y + u * .12, u * 2.8 * f, u * .6 * f, 18), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null }); }
  push(); translate(x, y + (o.dy || 0) * u); if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  [-1, 1].forEach((s, i) => {   // stubby legs
    let h = 1.3; if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .5; }
    paint(rrPts(s * .9 * u - .35 * u, -1.35 * u, .7 * u, h * u, .3 * u), { wash: dk, ink: PAL.ink, sw: sw * .6 });
  });
  const cy = kind === 'kick' ? -3.4 * u : -3.3 * u, ax = kind === 'kick' ? 2.45 * u : 2.4 * u;
  const arm = (side, a, hook) => {
    push(); translate(side * ax, cy); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -1.8 * u : 0, -.25 * u, 1.8 * u, .5 * u, .25 * u), { wash: dk, ink: PAL.ink, sw: sw * .6 });
    translate(side * 1.8 * u, 0);
    if (o.sticks !== false) { push(); if (side < 0) scale(-1, 1); rotate(.5); inkLine([[0, 0], [2 * u, 0]], sw * 1.6, K === DK.kick ? DK.stick : DK.stick, 'ink', 0); paint(ellPts(2.05 * u, 0, .22 * u, .22 * u, 8), { wash: DK.stick, ink: PAL.ink, sw: sw * .4 }); pop(); }
    paint(ellPts(0, 0, .38 * u, .38 * u, 10), { wash: lt, ink: PAL.ink, sw: sw * .5 });
    if (hook) { if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? .3, o.armL); arm(1, o.aR ?? .3, o.armR);
  let faceY;
  if (kind === 'kick') {
    paint(ellPts(0, cy, 2.5 * u, 2.5 * u, 26, J), { wash: col, fill: dk, fillOp: 60, tex: .6, border: .5, ink: PAL.ink, sw });
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + .2; paint(rectPts(Math.cos(a) * 2.3 * u - .15 * u, cy + Math.sin(a) * 2.3 * u - .15 * u, .3 * u, .3 * u), { wash: DK.chrome, ink: PAL.ink, sw: sw * .3 }); }
    paint(ellPts(0, cy, 2.05 * u, 2.05 * u, 24, J * .6), { wash: DK.head, fill: '#EAD9BD', fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .7 });
    paint(ellPts(-.7 * u, cy - .8 * u, .9 * u, .55 * u, 12, 0, -.4), { fill: PAL.cream, fillOp: 120, bleed: .2, ink: null });
    faceY = cy - .1 * u;
  } else {
    const top = cy - 1.3 * u, bot = cy + 1.3 * u;
    paint(rrPts(-2.4 * u, top, 4.8 * u, 2.6 * u, .45 * u, J), { wash: col, fill: dk, fillOp: 55, tex: .6, border: .5, ink: PAL.ink, sw });
    paint(ellPts(-.9 * u, top + .75 * u, 1.1 * u, .4 * u, 12), { fill: lt, fillOp: 130, bleed: .2, tex: .8, ink: null });
    for (const yy of [top, bot - .38 * u]) paint(rrPts(-2.5 * u, yy, 5 * u, .38 * u, .18 * u), { wash: DK.chrome, ink: PAL.ink, sw: sw * .5 });
    const z = []; for (let k = 0; k <= 10; k++) z.push([-2.1 * u + k * .42 * u, (k % 2 ? top + .5 * u : bot - .5 * u)]);
    inkLine(z, sw * .45, DK.chrome, 'inkfine', 0);
    faceY = cy;
  }
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * 1.15 * u, faceY + .45 * u, .35 * u, .2 * u, 10), { fill: PAL.rose, fillOp: 170, bleed: .2, ink: null });
  castEyes(0, faceY - .25 * u, .7 * u, .3 * u, o, sw, kind === 'kick' ? DK.head : col);
  const my = faceY + .55 * u, m = o.mouth || 'smile';
  if (m === 'grin') paint([[-.55 * u, my - .12 * u], [.55 * u, my - .12 * u], [.35 * u, my + .32 * u], [-.35 * u, my + .32 * u]], { wash: '#6A2A35', ink: PAL.ink, sw: sw * .5, curv: .4 });
  else if (m === 'O' || m === 'o') paint(ellPts(0, my + .08 * u, (m === 'O' ? .35 : .2) * u, (m === 'O' ? .42 : .22) * u, 12), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .4 });
  else if (m === 'flat') inkLine([[-.35 * u, my], [.35 * u, my]], sw * .7, PAL.ink, 'ink', 0);
  else inkLine([[-.45 * u, my - .06 * u], [0, my + .2 * u], [.45 * u, my - .06 * u]], sw * .7, PAL.ink, 'ink', .6);
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 2.8 * u, y + (o.dy || 0) * u - (kind === 'kick' ? 6.6 : 5.2) * u, u * .8, o.emoteK ?? 1);
}

// ======================================================================================================================
// 嘈杂怪 noisy: the day's noise, shut outside the door. kind 'horn' (ochre car horn), 'clock' (rose alarm clock) or 'bubble'
// (cream speech bubble full of scribble). About 5.2u tall.
// noisy(x, y, u, o): (x, y) = ground point. o.noise 0..1 shakes it and adds sound lines. Arms pivot at the body sides and are
// 1.5u long. o: kind · noise · dy sq take rot flip sx sy aL aR walk noShadow seed · eyes squint lookX lookY mouth ('grumpy'
//    'O' 'smile' 'flat') · col dk lt · draw armL armR · emote emoteK. Default face: grumpy, eyes 'angry'.
// ======================================================================================================================
const NZ = { horn: { col: '#E8AA38', dk: '#A8711C', lt: '#FFD98A' }, clock: { col: '#D9485E', dk: '#8E2438', lt: '#F7A0AC' }, bubble: { col: '#FFF1DC', dk: '#C9B28E', lt: '#FFFFFF' } };
function noisy(x, y, u, o = {}) {
  const kind = o.kind || 'horn', K = NZ[kind], nz = clamp(o.noise || 0), seed = o.seed || 0;
  const sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .07;
  const col = o.col || K.col, dk = o.dk || K.dk, lt = o.lt || K.lt;
  if (!o.noShadow) paint(ellPts(x, y + u * .12, u * 2.6, u * .55, 16), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null });
  push(); translate(x + nz * Math.sin(T * 55 + seed) * .25 * u, y + (o.dy || 0) * u); rotate((o.rot || 0) + nz * .08 * Math.sin(T * 47 + seed));
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  [-1, 1].forEach((s, i) => {
    let h = 1.2; if (o.walk != null) { const ph = Math.sin((o.walk + (i ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .5; }
    inkLine([[s * .7 * u, -1.2 * u], [s * .75 * u, -(1.2 - h) * u - .05 * u]], sw * 1.1, PAL.ink, 'ink', 0);
    paint(ellPts(s * .95 * u, -(1.2 - h) * u, .45 * u, .22 * u, 10), { wash: PAL.ink, ink: null });
  });
  const arm = (side, a) => {
    push(); translate(side * 1.9 * u, -3 * u); rotate(side < 0 ? a : -a);
    inkLine([[0, 0], [side * 1.5 * u, 0]], sw * 1.1, PAL.ink, 'ink', 0);
    paint(ellPts(side * 1.55 * u, 0, .3 * u, .3 * u, 8), { wash: col, ink: PAL.ink, sw: sw * .5 });
    const hook = side < 0 ? o.armL : o.armR;
    if (hook) { translate(side * 1.55 * u, 0); if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? .5 + nz * .6 * Math.sin(T * 30 + seed)); arm(1, o.aR ?? .5 - nz * .6 * Math.sin(T * 30 + seed));
  let fx = 0, fy = -3.3 * u, er = .26 * u;
  if (kind === 'horn') {
    paint([[-2 * u, -4.1 * u], [.6 * u, -3.9 * u], [2.3 * u, -4.9 * u], [2.3 * u, -1.5 * u], [.6 * u, -2.5 * u], [-2 * u, -2.3 * u]], { wash: col, fill: dk, fillOp: 55, tex: .6, border: .5, ink: PAL.ink, sw, curv: .2 });
    paint(ellPts(2.3 * u, -3.2 * u, .55 * u, 1.7 * u, 14, J * .4), { wash: dk, fill: PAL.ink, fillOp: 40, ink: PAL.ink, sw: sw * .8 });
    paint(ellPts(-1 * u, -3.7 * u, .8 * u, .35 * u, 10), { fill: lt, fillOp: 130, bleed: .2, ink: null });
    fx = -.6 * u; fy = -3.2 * u;
  } else if (kind === 'clock') {
    for (const s of [-1, 1]) paint(ellPts(s * 1.25 * u, -5 * u, .75 * u, .5 * u, 12), { wash: DK.chrome, ink: PAL.ink, sw: sw * .6 });
    inkLine([[0, -5.4 * u], [0, -4.8 * u]], sw, PAL.ink, 'ink', 0);
    paint(ellPts(0, -3.1 * u, 1.95 * u, 1.9 * u, 22, J * .5), { wash: col, fill: dk, fillOp: 50, tex: .6, ink: PAL.ink, sw });
    paint(ellPts(0, -3.1 * u, 1.5 * u, 1.45 * u, 20), { wash: PAL.cream, ink: PAL.ink, sw: sw * .5 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; inkLine([[Math.cos(a) * 1.25 * u, -3.1 * u + Math.sin(a) * 1.2 * u], [Math.cos(a) * 1.4 * u, -3.1 * u + Math.sin(a) * 1.35 * u]], sw * .4, PAL.ink, 'inkfine', 0); }
    inkLine([[0, -3.1 * u], [.55 * u, -3.4 * u]], sw * .8, PAL.ink, 'ink', 0);     // two o'clock
    inkLine([[0, -3.1 * u], [0, -4.1 * u]], sw * .6, PAL.ink, 'ink', 0);
    fy = -2.75 * u; er = .22 * u;
  } else {
    const b = ellPts(0, -3.3 * u, 2.4 * u, 1.75 * u, 20, J * .6);
    paint([[-1.2 * u, -1.9 * u], [-1.9 * u, -1.2 * u], [-.4 * u, -1.7 * u]], { wash: col, ink: PAL.ink, sw: sw * .8 });
    paint(b, { wash: col, fill: dk, fillOp: 40, tex: .6, border: .5, ink: PAL.ink, sw });
    const z = []; for (let k = 0; k <= 8; k++) z.push([-1.5 * u + k * .38 * u, -2.6 * u + (k % 2 ? -.35 : .25) * u + Math.sin(T * 20 + k) * .06 * u * (1 + nz * 3)]);
    inkLine(z, sw * .7, PAL.ink, 'ink', .2);
    fy = -3.75 * u;
  }
  castEyes(fx, fy, .55 * u, er, { ...o, eyes: o.eyes || 'angry' }, sw, col);
  const my = fy + .6 * u, m = o.mouth || 'grumpy';
  if (m === 'O') paint(ellPts(fx, my + .1 * u, .32 * u, .38 * u, 12), { wash: '#6A2A35', ink: PAL.ink, sw: sw * .4 });
  else if (m === 'smile') inkLine([[fx - .35 * u, my - .05 * u], [fx, my + .18 * u], [fx + .35 * u, my - .05 * u]], sw * .7, PAL.ink, 'ink', .6);
  else if (m === 'flat') inkLine([[fx - .3 * u, my], [fx + .3 * u, my]], sw * .7, PAL.ink, 'ink', 0);
  else inkLine([[fx - .35 * u, my + .12 * u], [fx, my - .08 * u], [fx + .35 * u, my + .12 * u]], sw * .7, PAL.ink, 'ink', .6);
  if (o.draw) o.draw(u, sw);
  pop();
  if (nz > .05) for (let k = 0; k < 3; k++) {   // sound lines
    const a = -.9 + k * .45, r0 = 2.9 * u + frac(T * 3 + k / 3) * 1.2 * u;
    inkLine([[x + Math.cos(a) * r0, y - 3.4 * u + Math.sin(a) * r0], [x + Math.cos(a) * (r0 + .8 * u), y - 3.4 * u + Math.sin(a) * (r0 + .8 * u)]], sw * 1.2 * nz, PAL.ink, 'ink', 0);
    inkLine([[x - Math.cos(a) * r0, y - 3.4 * u + Math.sin(a) * r0], [x - Math.cos(a) * (r0 + .8 * u), y - 3.4 * u + Math.sin(a) * (r0 + .8 * u)]], sw * 1.2 * nz, PAL.ink, 'ink', 0);
  }
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 2.4 * u, y + (o.dy || 0) * u - 5.8 * u, u * .75, o.emoteK ?? 1);
}

// ======================================================================================================================
// Model sheet. node render.mjs --loop=cast --sheet=0.3,1.3,2.3,3.3,4.3,5.3 --cols=3 --w=640 --out=out/check/cast.jpg
// ======================================================================================================================
LOOPS.cast = t => {
  paint(rectPts(-60, -60, W + 120, 860), { wash: '#2A2F5E', fill: PAL.indigo, fillOp: 90, bleed: .05, tex: .6, border: .3, ink: null });
  paint([[-60, 800], [W + 60, 800], [W + 60, 1200], [-60, 1200]], { wash: '#E9D8BC', fill: '#D9BF98', fillOp: 60, bleed: .03, tex: .6, border: .4, ink: PAL.ink, sw: 1 });
  const k = Math.floor(t) % 6;
  const F = [['normal', 'smile'], ['happy', 'grin'], ['scared', 'O'], ['sleepy', 'flat'], ['spark', 'sing'], ['closed', 'cat']][k];
  xiaoye(300, 900, 40, { eyes: F[0], mouth: F[1], blush: k === 1, glow: k === 4 ? 1 : 0, aL: [-1.2, .6, 1.3, -1.2, .9, -.3][k], aR: [-1.2, -.4, 1.3, -1.2, 1.2, -1.2][k], hood: k === 5 });
  letter(F[0] + ' · ' + F[1], 300, 985, 32, PAL.ink, { ink: false });
  const m = move(['walk', 'bounce', 'hop', 'roof', 'shimmy', 'run'][k], t);
  xiaoye(620 + m.dx * 16, 900, 16, { ...m, walk: m.walk ?? undefined, ...mood(t % 1, [[0, 'normal'], [.5, 'happy', 'music']]) });
  dengdeng(900, 900, 34, { light: ['red', 'red', 'green', 'both', 'green', 'off'][k], eyes: ['sleepy', 'normal', 'happy', 'scared', 'heart', 'closed'][k], mouth: ['O', 'smile', 'grin', 'O', 'smile', 'flat'][k], aL: [.1, 1.3, .6, 1.4, 1.1, -.7][k] + .2 * Math.sin(t * 6), aR: -.6, blush: k === 4 });
  for (let i = 0; i < 5; i++) ziling(1180 + i * 70, 760 - 40 * Math.sin(t * 2 + i), 12 + (i % 2) * 5, { seed: i, glyph: i, eyes: ['normal', 'happy', 'closed', 'normal', 'heart'][(i + k) % 5] });
  const d = move('bounce', t);
  drumkid(1300, 900, 20, { ...d, kind: 'kick', aL: .4 + .8 * pulse(t, 8), aR: .4 + .8 * pulse(t, 8), eyes: k % 2 ? 'happy' : 'normal', mouth: 'grin' });
  drumkid(1480, 900, 20, { ...move('hop', t, 1), kind: 'snare', aL: .9 * pulse(t, 8), aR: .9 * pulse(t, 8), mouth: 'O' });
  for (const [i, kd] of ['horn', 'clock', 'bubble'].entries()) noisy(1620 + i * 110, 900, 16, { kind: kd, noise: k < 3 ? 1 : 0, eyes: k >= 4 ? 'closed' : k === 3 ? 'happy' : 'angry', mouth: k >= 4 ? 'flat' : k === 3 ? 'smile' : 'O', seed: i, emote: k >= 4 && i === 1 ? 'zzz' : null });
  xiaoye(1780, 700, 7, { ...move('walk', t) });
};
LOOPS.cast.len = 6;
