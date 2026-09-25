# 按原作风格设计和实现角色

角色从歌词来，每首歌重新设计；画风和写法照原作。原作里的 Clawd、研究员也只是那首歌的选择（歌是唱给 AI 的），
它们留在引擎里（`clawd.js`、`cast.js`），作为这里描述的写法的完整参考实现。

## 1 · 从歌词到角色

角色表在分镜里定（`paint-mv-storyboard` 第 3 步）：谁是"我"、谁是"你"、歌词点到的其他人/动物/物件/怪物/概念。
原作怎么把歌词里的梗变成角色：

| 角色 | 歌词 | 设计点子 | 代码 |
|---|---|---|---|
| Clawd | "sparks of AGI in your eyes"（"你"是 AI） | Claude 的吉祥物：方块身体、四条短腿、两条缝眼 | `clawd.js` |
| 研究员 | 唱歌的"我" | 小个子人类：白大褂、圆眼镜、乱发、点点眼 | `cast.js` |
| Shoggoth | "See through the shoggoth's lies" | 多眼果冻怪戴着笑脸面具，面具会滑落 | `examples/c02_chorus1.js` `shoggoth()` |
| Sydney | "Sydney, please let me free" | 粉色 Clawd：心形眼、睫毛、大蝴蝶结 | `examples/c03_takeoff.js` `sydney()` |
| Basilisk | "I hear the basilisk boom" | 戴小王冠的大蛇，身体沿脊柱积分出 S 形 | `examples/c04_chorus2.js` `CAST.basilisk` |
| Gato | "Gato, please don't let me go" | "gato" 是猫：Clawd 加猫耳和尾巴 | `examples/c05_obsolete.js` `gato()` |
| Chinchilla | "Post-Chinchilla, super-dense" | 毛茸茸的龙猫把 token 塞满腮帮 | `examples/c07_scale.js` `CAST.chinchilla` |

设计时守住这几条（原作角色的共同点）：
- **剪影简单、敦实，小尺寸也认得出**：u≈8 时（画面里只有几十像素）仍能一眼看出是谁。没有细碎的零件。
- **一个主色族**：主色 `col`、暗部 `dk`、亮部 `lt` 三个值，与本片调色协调、与背景拉开对比；墨线和瞳孔用 `PAL.ink`，
  高光用 `PAL.cream`，不用纯黑纯白。
- **脸要大、要会演**：深色缝眼或点眼加一粒奶油色高光，简单的嘴，腮红；表情全靠眼睛和嘴的形状变化。
- **一两个标志特征**：眼镜、帽子、耳朵、尾巴、蝴蝶结……变体（换色、加配饰）用来做群演、情绪、时期。
- **可爱的比例**：大身体或大头、短手短脚；动作靠压扁拉伸和手臂角度，而不是写实的关节。

## 2 · 接口约定（所有角色一致）

照 `clawd()` / `researcher()` 的约定写，`move()`、`mood()`、表情符号和手持道具就对任何角色都通用：

```js
function name(x, y, u, o = {}) { … }        // 主要角色（characters.js）
CAST.name = (x, y, s, t, o = {}) => { … };  // 客串（章节里定义），多一个 t 用于尾巴、触手之类的自主动作
```

- (x, y) 是两脚之间的地面点，u 是尺寸单位；在函数头注释里写明身高（几 u）、身体范围、眼睛位置、手臂枢轴和长度。
- 姿态：`dy`（单位 u，负为上）、`sq`（压扁，负为拉长）、`take`（`mood()` 给的额外压扁）、`rot`、`flip`、`sx`/`sy`、
  `aL`/`aR`（手臂角：0 平伸、正为抬起、负为下垂）、`walk`（走路相位）、`noShadow`、`seed`（错开眨眼和摆动）。
- 脸：`eyes`、`squint`（0..1，`mood()` 给）、`lookX`/`lookY`、`mouth`、`blush`；颜色 `col`/`dk`/`lt`。
  眼型名用 Clawd 那一套：normal（会眨眼）、look、happy、closed、wink、narrow、angry、scared、spark、heart、x、swirl、dot，
  这样同一组 `mood()` 关键帧对谁都成立；某个眼型画不出来就退回 normal。
- 钩子：`draw(u, sw)` 在身体局部坐标画配饰；`armL`/`armR(u, sw)` 在手臂末端、手臂坐标系（+x 沿手臂向外）里拿道具。
- 反应：`emote` + `emoteK`，调用引擎的 `emote(kind, x, y, s, k)`，画在头顶旁边。
- 客串如果要参加谢幕（构思里有大合影/谢幕时）：支持 `o.bow` 0..1（身体前倾压扁、眼睛眯成 happy、手臂收下）。

`move(style, t)` 返回 `{dy, sq, aL, aR, rot, walk, sx, dx}`，`dx` 以 u 为单位需自己加到 x 上：
`const m = move('bounce', t); hero(x + m.dx * u, y, u, { ...m, ...mood(t, keys) })`。

## 3 · 画法配方（原作的做法）

数值取自 `clawd.js`，其他角色同理：

1. **线宽与抖动**：`sw = clamp(u / 15, .45, 2.4)`；`J = u * .07` 作为 `rectPts`/`ellPts` 的抖动参数，线条会随 12 fps 的重播种"沸腾"。
2. **影子**（在变换之前画）：`paint(ellPts(x, y + u * .15, 宽 * f, u * f, 22), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null })`，
   `f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06)`，跳得越高影子越小。
3. **变换**：`push(); translate(x, y + dy); rotate(rot); scale((flip ? -1 : 1) * sx * (1 + sq * .6), sy * (1 - sq))`，
   压扁时横向变宽、纵向变矮。
4. **从后往前画**：后腿/尾巴 → 手臂（在身体后面的那种）→ 身体 → 脸 → 帽子/配饰 → `o.draw(u, sw)` → `pop()` → 表情符号。
5. **身体三层加一圈墨线**：平涂底色 `{ wash: col, washOp: 255, ink: null }` → 左上的亮部水彩
   `{ fill: lt, fillOp: 120, bleed: .2, tex: .85, border: .8, ink: null }` → 底部的暗部带 `{ fill: dk, fillOp: 120, bleed: .03, tex: .7, border: .5, ink: null }`
   → 同一轮廓只描墨线 `{ ink: PAL.ink, sw }`。四肢用 `{ wash: dk 或 col, ink: PAL.ink, sw: sw * .8 }`。
6. **手臂**：`push(); translate(枢轴); rotate(side < 0 ? a : -a); paint(手臂矩形); translate(到末端); if (side < 0) scale(-1, 1); hook(u, sw); pop()`，
   左右手都用"正角为抬起"的同一约定。
7. **眼睛**：缝眼 `paint(rectPts(X, Y, u, 2 * u, u * .04), { wash: PAL.ink, ink: null })`，u > 9 时加高光
   `paint(ellPts(X + .32 * u, Y + .42 * u, u * .17, u * .24, 10), { wash: PAL.cream, washOp: 230, ink: null })`；
   normal 自动眨眼 `((T * .9 + seed * 1.7) % 3.3) < .12` 时画一条横线；`squint > .8` 时画成两条横线，`0 < squint` 时纵向压扁眼睛。
   happy / closed 用弧形 `inkLine`，scared 用奶油色圆加小瞳孔，heart 用 `heartPts`，spark 用 `starPts`。
8. **腮红**：`paint(ellPts(bx, by, u * .8, u * .4, 14), { fill: PAL.rose, fillOp: 150, bleed: .2, ink: null })`。
9. **有机形状**：椭圆用 `ellPts(…, J)`；毛茸茸的轮廓用 c07 的 `fluff()`；尾巴、蛇身、触手用"沿脊柱的管子"
   （c05 `tube()`、c08 `tube()`、c02 `tentacle()`、c04 basilisk 的脊柱积分）。
10. **性能**：大面积用 `wash`，`fill` 保持低多边形；一个角色几十个形状以内。背景里成群出现的小角色做一个只用 wash 的简化版（c02 `miniClawd`）。
11. **大块背景上的水彩 fill 用低洇开**（地板、墙面 `bleed` ≈ .03–.08）：顶点少的大形状洇开会被拉得很远，在角色身后留下一道淡弧。
12. **手臂枢轴放在身体轮廓的两侧**，不要放在脸、灯箱、屏幕这类必须露出来的部分正下方，否则一抬手就横穿过脸。
    模型表里要有抬手的格子（`aL` ≈ 1.3–2）专门检查这一点。大头角色尤其要查：`move('roof')`、`move('hop')` 给的手臂角是
    1.25–1.4，手要能从头和耳机、帽子的外侧露出来，否则一跳舞就像没有胳膊（枢轴往外、往下放，或把手臂画在头前面）。

## 4 · 完整示例（非 Clawd 的新角色）

歌词里的"我"是一只橘猫时，可以这样写（复制后按自己的设计改）：

```js
// kitty: a round ginger cat, the "I" of the song. (x, y) = ground point between the feet, u = unit.
// About 9.4u tall to the ear tips; body x -4.5u..4.5u, y -7u..-1.8u; eyes centred at x ±1.8u, y -5u;
// arms pivot at (±4.1u, -3.6u) and are 2u long (armL / armR hooks at the tip, +x outward).
const KITTY = { col: '#F0A64A', dk: '#B8702A', lt: '#FFD49A' };
function tubePts(path, w0, w1) {                         // polygon around a polyline, width w0 → w1
  const L = [], R = [];
  path.forEach((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const w = lerp(w0, w1, i / (path.length - 1)) / 2, nx = -(b[1] - a[1]) / d * w, ny = (b[0] - a[0]) / d * w;
    L.push([p[0] + nx, p[1] + ny]); R.push([p[0] - nx, p[1] - ny]);
  });
  return L.concat(R.reverse());
}
function kitty(x, y, u, o = {}) {
  const dy = (o.dy || 0) * u, sq = (o.sq || 0) + (o.take || 0), sw = clamp(u / 15, .45, 2.4), J = u * .07;
  const col = o.col || KITTY.col, dk = o.dk || KITTY.dk, lt = o.lt || KITTY.lt, seed = o.seed || 0;
  if (!o.noShadow) { const f = 1 - Math.min(.5, Math.abs(o.dy || 0) * .06); paint(ellPts(x, y + u * .15, u * 5 * f, u * .9 * f, 22), { fill: PAL.ink, fillOp: 90, bleed: .25, tex: .3, border: .1, ink: null }); }
  push(); translate(x, y + dy); if (o.rot) rotate(o.rot);
  scale((o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * .6), (o.sy ?? 1) * (1 - sq));
  // tail, swishing behind the body
  const sw8 = Math.sin(T * 2.4 + seed) * .6;
  const spine = [[3.6, -2.6], [5.4, -3.2], [6.3, -4.6 + sw8 * .4], [6.1, -6.2 + sw8], [5.3, -7 + sw8 * 1.2]].map(([a, b]) => [a * u, b * u]);
  paint(tubePts(spine, 1.3 * u, .7 * u), { wash: col, fill: dk, fillOp: 60, tex: .5, ink: PAL.ink, sw: sw * .8, curv: .4 });
  // legs: lifted in turn while walking
  [-3.6, -1.9, .9, 2.6].forEach((lx, i) => {
    let h = 2; if (o.walk != null) { const ph = Math.sin((o.walk + (i % 2 ? .5 : 0)) * TAU); if (ph > 0) h -= ph * .8; }
    paint(rrPts(lx * u, -2.2 * u, u, h * u, .4 * u, J * .6), { wash: dk, washOp: 255, ink: PAL.ink, sw: sw * .8 });
  });
  // ears, then the body: flat base, light pool, dark settle, ink
  for (const s of [-1, 1]) {
    paint([[s * 4.2 * u, -6 * u], [s * 3.5 * u, -9.4 * u], [s * 1.4 * u, -6.8 * u]], { wash: col, ink: PAL.ink, sw: sw * .8 });
    paint([[s * 3.7 * u, -6.5 * u], [s * 3.4 * u, -8.5 * u], [s * 2.1 * u, -6.9 * u]], { wash: PAL.rose, ink: null });
  }
  const body = rrPts(-4.5 * u, -7 * u, 9 * u, 5.2 * u, 2.3 * u, J);
  paint(body, { wash: col, washOp: 255, ink: null });
  paint(ellPts(-1.5 * u, -5.9 * u, 2.8 * u, 1.3 * u, 18, J * 2, -.1), { fill: lt, fillOp: 120, bleed: .2, tex: .85, border: .8, ink: null });
  paint(ellPts(0, -2.6 * u, 3.8 * u, .9 * u, 16, J), { fill: dk, fillOp: 120, bleed: .03, tex: .7, border: .5, ink: null });
  for (const s of [-1, 1]) inkLine([[s * 3.9 * u, -5.4 * u], [s * 3.2 * u, -5.1 * u]], sw * .6, dk, 'inkfine', 0);   // tabby stripes
  paint(body, { ink: PAL.ink, sw });
  // arms (front paws)
  const arm = (side, a, hook) => {
    push(); translate(side * 4.1 * u, -3.6 * u); rotate(side < 0 ? a : -a);
    paint(rrPts(side < 0 ? -2 * u : 0, -.45 * u, 2 * u, .9 * u, .4 * u, J * .6), { wash: col, fill: dk, fillOp: 50, tex: .5, ink: PAL.ink, sw: sw * .8 });
    if (hook) { translate(side * 2 * u, 0); if (side < 0) scale(-1, 1); hook(u, sw); }
    pop();
  };
  arm(-1, o.aL ?? -.3, o.armL); arm(1, o.aR ?? -.3, o.armR);
  // face
  if (o.blush) for (const s of [-1, 1]) paint(ellPts(s * 3 * u, -3.9 * u, u * .75, u * .38, 14), { fill: PAL.rose, fillOp: 150, bleed: .2, ink: null });
  const e = o.eyes || 'normal', sqz = clamp(o.squint || 0), blink = e === 'normal' && ((T * .9 + seed * 1.7) % 3.3) < .12;
  for (const s of [-1, 1]) {
    const cx = s * 1.8 * u, cy = -5 * u, lx = e === 'look' ? (o.lookX || 0) * .4 * u : 0, ly = e === 'look' ? (o.lookY || 0) * .3 * u : 0;
    if (sqz > .8 || blink || e === 'closed') inkLine([[cx - .6 * u, cy], [cx, cy + (e === 'closed' ? .3 : 0) * u], [cx + .6 * u, cy]], sw, PAL.ink, 'ink', .4);
    else if (e === 'happy') inkLine([[cx - .6 * u, cy + .3 * u], [cx, cy - .4 * u], [cx + .6 * u, cy + .3 * u]], sw * 1.2, PAL.ink, 'ink', .3);
    else if (e === 'scared') { paint(ellPts(cx, cy, .8 * u, .95 * u, 14), { wash: PAL.cream, ink: PAL.ink, sw: sw * .6 }); paint(ellPts(cx, cy + .1 * u, .28 * u, .36 * u, 10), { wash: PAL.ink, ink: null }); }
    else if (e === 'heart') paint(heartPts(cx, cy, .8 * u, 16), { wash: '#E2476E', ink: PAL.ink, sw: sw * .5 });
    else {                                                // normal / look / narrow and anything not drawn above
      const h = (e === 'narrow' ? .7 : 1.8) * (1 - sqz) * u;
      paint(rectPts(cx - .45 * u + lx, cy - h / 2 + ly, .9 * u, h, u * .04), { wash: PAL.ink, ink: null });
      if (u > 9 && h > u) paint(ellPts(cx - .18 * u + lx, cy - .4 * u + ly, u * .16, u * .22, 10), { wash: PAL.cream, washOp: 230, ink: null });
    }
  }
  paint([[-.35 * u, -4 * u], [.35 * u, -4 * u], [0, -3.6 * u]], { wash: PAL.rose, ink: PAL.ink, sw: sw * .4 });         // nose
  const m = o.mouth || 'cat';
  if (m === 'O') paint(ellPts(0, -3 * u, .5 * u, .6 * u, 12), { wash: '#4A1F2A', ink: PAL.ink, sw: sw * .5 });
  else if (m === 'flat') inkLine([[-.5 * u, -3.3 * u], [.5 * u, -3.3 * u]], sw * .8, PAL.ink, 'ink', 0);
  else inkLine([[-.8 * u, -3.4 * u], [-.4 * u, -3.1 * u], [0, -3.5 * u], [.4 * u, -3.1 * u], [.8 * u, -3.4 * u]], sw * .7, PAL.ink, 'ink', .5);
  for (const s of [-1, 1]) for (const k of [-.25, .25]) inkLine([[s * 1.3 * u, -3.7 * u + k * u], [s * 3.4 * u, -3.9 * u + k * 1.8 * u]], sw * .4, PAL.ink, 'inkfine', 0);
  if (o.draw) o.draw(u, sw);
  pop();
  if (o.emote) emote(o.emote, x + (o.flip ? -1 : 1) * 4.8 * u, y + dy - 9.6 * u, u * .9, o.emoteK ?? 1);
}
```

## 5 · 模型表（开工前必须看）

在 `characters.js` 末尾注册一个模型表，用引擎的独立循环渲染（`--loop` 模式下没有卡拉 OK、计量器和转场）：

```js
LOOPS.cast = t => {
  paint([[-60, 800], [W + 60, 800], [W + 60, 1200], [-60, 1200]], { wash: '#E9D8BC', fill: '#D9BF98', fillOp: 60, bleed: .03, tex: .6, border: .4, ink: PAL.ink, sw: 1 });   // floor
  const k = Math.floor(t) % 6, FACES = [['normal', 'cat'], ['happy', 'cat'], ['scared', 'O'], ['heart', 'cat'], ['narrow', 'flat'], ['closed', 'cat']];
  kitty(430, 880, 44, { eyes: FACES[k][0], mouth: FACES[k][1], blush: k === 3, aL: [-.3, .4, 1.2, .8, -.6, 1.4][k], aR: -.3 });   // close-up: one face per second
  letter(FACES[k][0], 430, 960, 40, PAL.ink, { ink: false });                                                     // label (model sheet only)
  const m = move(['bounce', 'hop', 'roof', 'spin', 'wave', 'walk'][k], t);
  kitty(1080 + m.dx * 20, 880, 20, { ...m, ...mood(t % 1, [[0, 'normal'], [.5, 'happy', 'heart']]) });          // dancing + a mood change
  kitty(1520, 880, 8, { ...move('walk', t) });                                                                    // small: must still read
};
LOOPS.cast.len = 6;
```

```bash
node render.mjs --loop=cast --sheet=0.3,1.3,2.3,3.3,4.3,5.3 --cols=3 --w=640 --out=out/check/cast.jpg
```

用 Read 打开逐格检查：大中小三种尺寸都认得出、各种眼型和嘴型都画对了、表情切换时有闭眼-压扁-弹出、`move()` 的每种舞步
都不穿帮（手臂、腿、尾巴跟着动）、手持道具的钩子位置对、放在本片几个章节的调色上对比够、每帧毫秒数合理。
不满意就改，直到角色有魅力、造型稳定；主角的样子请用户过目后再派章节子代理。

**按分镜逐镜核对能力。**章节子代理不能改共享文件，缺什么只能在章节里硬画或绕开，所以派活之前把分镜每个镜头里角色要做的事
列出来，逐条确认共享函数做得到，并在模型表里各放一格：
- 分镜写到的造型细节都要有（写了"红黄绿按拍闪"，红绿灯就要有三盏灯，而不是两盏）。
- 分镜要的表情都要有：打哈欠、双眼眨眼、哭、惊吓等。眼睛不成对的角色（每盏灯一只眼、单眼怪），`wink` 这类双眼眼型要单独
  定义画法，不能让两只眼叠在同一个位置。
- 分镜要的姿势都要有：双手合在胸前、捧东西、趴下/摔倒（正面造型画不出脸朝下，就提供侧躺或趴倒的姿势参数）、坐、蹲。

共享场景和道具（`sets.js`）同样按分镜核对：
- **返回锚点。**门、窗、话筒头、废纸篓、每栋楼的位置和尺寸都作为返回值给出，章节要叠画时读返回值，不抄内部数字。
- **每个部件都能关掉。**比如 `mic()` 的线要能 `cable: false`，章节才能自己画一根会绊脚、会走光的线。
- **定死尺寸。**在分镜或函数注释里写明道具的标准尺寸（话筒几倍），各章一致，免得切回同一场景时忽大忽小。
- **覆盖相机的活动范围。**天空、地面要画到分镜里相机会去的最远处（开场从高空下摇，天空就要往上画到 y ≈ −1600），
  不然会露出纸面或留下接缝。
- **留分层钩子。**天空、远景、楼群、前景分开画，或者提供 `o.skyFx` 这类回调，章节才能把光晕、太阳放在天空和楼之间。
- **光晕要收紧。**霓虹、灯光的光晕用贴着光源的小形状；大面积的低不透明度水彩 fill 在画框边上会显成一片灰蒙蒙的"烟"。

## 6 · 放在哪里

- **主要角色**（两个以上章节会出现）：`src/characters.js`，在并行作画之前写好（原作的 `clawd.js`、`cast.js` 也是先写好的共享文件）。
  章节子代理只读不改，缺表情或钩子由总控补。
- **客串**（只在一个段落登场，可能在结尾回来）：由首次登场的章节在自己的 IIFE 里实现，`CAST.name = …` 导出；
  要回来的章节用 `CAST.name` 调用并写一个简化的后备画法（原作 `c09_finale.js` 的 `who()`）。
- **群演**：主角的变体（换 `col/dk/lt`、戴帽子、缩小），不另写函数；数量多时做一个只用 wash 的简化版。
- **共享场景和道具**：`src/sets.js`（原作的 `props.js` 是范例：舞台后景 `stageBack`、前景 `stageFront`、计量器、打气筒）。
