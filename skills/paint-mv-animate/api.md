# 引擎 API 参考

全部来自项目 `src/` 下的共享文件（与 PDoomVideo 源码一致，只有歌曲常量改为读 `SONG`）。全是全局函数/常量，章节里直接用。
拿不准时直接读源码：`src/core.js`、`src/clawd.js`、`src/cast.js`、`src/props.js`、`src/timeline.js`。
本片自己的角色和场景在 `src/characters.js`、`src/sets.js`，接口写在各函数的头部注释里（约定见 [characters.md](characters.md)）。

## 一帧是怎么画出来的

`draw()`（core.js）每帧：重置 `LETTERS`、`KARAOKE`、`METER_SHOWN = false`、`CAM = null` → `randomSeed(1000 + floor(T * BOIL))`、
`noiseSeed(77)` → 贴纸纹 → `drawWorld(T)` → 合成：WebGL 画面 → 字 → 乘纸颗粒/暗角 → 卡拉 OK 文字。

`drawWorld(t)`（timeline.js）：找到 `start ≤ t < end` 的章节 → 找到起始时间 ≤ t 的最后一个镜头 → `fn(t, t - t0, end - t0)` →
`CAM = null` → `flushLetters()` → 若 `!METER_SHOWN` 画角落计量器 → 在 `WIPES` 附近 ±0.3 s 画笔刷擦除 → `karaoke(t)`。
没有章节覆盖的时刻画 `placeholder(t)`（"(chapter not painted yet)" + 一个跳 idle 的小 Clawd）。

## 常量（core.js / props.js / cast.js）

| 名称 | 值 |
|---|---|
| `W, H` | 1920, 1080 |
| `BPM, BEAT, OFF, DUR` | `SONG.bpm`, `60 / BPM`, `SONG.offset`, `SONG.duration` |
| `BOIL` | 12（jit 每秒重播种次数） |
| `TAU` | 2π |
| `PAL` | paper `#F3EBDC` · ink `#2B2233` · clay `#D97757` · clayDk `#A84D33` · clayLt `#F2A283` · night `#1F2550` · indigo `#2F3C7A` · rose `#E27A92` · ochre `#E8AA38` · sap `#6E9F58` · teal `#3A9C98` · violet `#7B5CA8` · cream `#FFF5E2` · sky `#8EC3E6` |
| `CURTAIN, CURTAIN_DK, GOLD, WOOD, WOOD_DK` | `#B8323F`, `#7A1C2B`, `#E8B23A`, `#B87A4B`, `#7C4A2C` |
| `SKIN, HAIR, COAT, PANTS` | 研究员的肤色/发色/外套/裤子 |
| `T` | 当前渲染时刻（在 `draw()` 期间等于镜头收到的 `t`） |
| `CAM` | 当前相机 `{cx, cy, zoom, rot}` 或 null |
| `METER_SHOWN` | 本帧已有计量器（为 true 时角落计量器不画） |
| `LY, CH, WIPES, METER, LOOPS, CAST, SONG` | 歌词、章节表、擦除时刻、计量器窗口、独立循环、客串角色、歌曲配置 |

## 数学与计时（core.js）

| 函数 | 说明 |
|---|---|
| `clamp(x, a = 0, b = 1)`, `lerp(a, b, x)`, `frac(x)` | 常规 |
| `ease(x)` | smoothstep，自动 clamp |
| `easeIn(x)`, `easeOut(x)` | 三次方 |
| `backOut(x)` | 过冲（s = 1.9） |
| `elasticOut(x)` | 弹性 |
| `hash(i)` | 确定性 [0, 1) 伪随机 |
| `jit(a)` | ±a 的抖动，每秒 12 次重播种（线条"沸腾"） |
| `wob(t, f = 1, ph = 0)` | `sin((t·f + ph)·TAU)` |
| `bpOf(t)` | 拍位置 `(t − OFF) / BEAT` |
| `beatN(t)` | `floor(bpOf(t))` |
| `pulse(t, k = 6)` / `pulse2(t, k = 6)` | 每拍 / 每八分音符为 1 并按 `exp(−frac·k)` 衰减 |
| `seg(t, a, b)` | t 在 [a, b] 的 0..1 进度 |
| `kf(t, keys, e = ease)` | 关键帧 `[[t0, v0], ...]`，值可为数组 |
| `mixCol(a, b, k)` | 十六进制颜色混合 |
| `shakeXY(t, amt)` | 确定性震动 [dx, dy]，按 24 fps 变化 |

## 相机与全屏效果（core.js）

| 函数 | 说明 |
|---|---|
| `camBegin(cx = W/2, cy = H/2, zoom = 1, rot = 0)` | 世界点 (cx, cy) 到屏幕中心；只能一层 |
| `camEnd()` | 恢复 |
| `toScreen(x, y)` | 当前相机下世界坐标 → 屏幕坐标 |
| `flash(k, col = '#FFFDF6')` | 全屏平涂，k > .6 时隐藏角落计量器 |
| `iris(cx, cy, r, col = PAL.ink)` | 圆外全涂；r < 60 隐藏计量器，r < 4 整屏涂满 |
| `irisShape(pts, col = PAL.ink, far = 4000)` | 任意星形轮廓外全涂 |

## 几何与绘制（core.js）

| 函数 | 说明 |
|---|---|
| `rectPts(x, y, w, h, j = 0)` | 8 点矩形，j 为抖动 |
| `ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0)` | 椭圆 |
| `rrPts(x, y, w, h, r, j = 0)` | 圆角矩形 |
| `starPts(cx, cy, r, inner = .38, n = 4, rot = −π/2)` | 星形（n 个角） |
| `heartPts(cx, cy, r, n = 22)`（clawd.js） | 心形，约 2r 宽 |
| `paint(pts, o)` | 见下 |
| `inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5)` | 沿路径的笔画（spline） |

`paint` 选项与默认值：`wash`/`washOp`(255) · `fill`/`fillOp`(170)/`bleed`(.1)/`tex`(.4)/`border`(.35) ·
`hatch: {d, a, o = {rand: .15}, b = 'HB', c = PAL.ink, w = 1}` · `ink`（默认 `PAL.ink`，`null` 不描边）/`sw`(1)/`br`('ink') · `curv`。
轮廓是一整条渐细笔画，不是每边一笔。

笔刷：自定义 `'ink'`（粗 5）、`'inkfine'`（粗 2.6）、`'dry'`（粗 14、毛糙、半透明）；p5.brush 内置 `'2B'`、`'HB'`、`'charcoal'`、
`'marker'`、`'spray'`、`'rotring'`、`'cpencil'`、`'pen'`。（全部笔刷已 `brush.scaleBrushes(5)`。）

## 字（core.js）

| 函数 | 说明 |
|---|---|
| `letter(txt, x, y, size, color, o)` | o：`pop`(0..1 出现进度，backOut)、`rot`、`alpha`、`ink:false`（去掉墨色投影）、`stroke`（描边色）、`font`（CSS 字体串）、`align`、`screen:true`（不跟相机） |
| `letterAt(txt, x, y, size, col, o)`（props.js） | 同 `letter`，世界坐标 |
| `sfx(txt, x, y, size, color, age, o)` | 拟声字；`age` 为出现后秒数，`o.life`(1.2)、`o.rot`(−.08)；age < 0 或 > life 时不画 |
| `flushLetters()` | 立刻把已排队的字合成进画面（之后画的颜料会盖住它们） |

默认字体 Permanent Marker（中日韩字符回退到 ZCOOL KuaiLe）。卡拉 OK 用 Shantell Sans 800（同样回退）。
中日韩字形启动时预加载（歌词、歌名、计量器标签）；章节里要写别的汉字，把它们加进 `song.js` 的 `glyphs`（共享文件，找总控改）。

## Clawd 与通用角色工具（clawd.js）

Clawd 是原作那首歌的角色，也是角色写法的完整参考实现；同一文件里的 `emote()`、`heartPts()`、`mood()`、`move()` 是所有角色通用的工具
（只要角色遵守同样的选项名）。

`clawd(x, y, u, o)`，(x, y) 为两脚间地面点。身体局部坐标：x −5u..5u，y −8u..−2u；眼睛在 x −3u 和 2u（各宽 1u），y −7u..−5u；
腿到 y 0；手臂枢轴 (±4.9u, −4.5u)，长 2.2u。

| 选项 | 说明 |
|---|---|
| `dy`, `sq`, `take` | 竖直偏移（u）、压扁（负为拉长）、mood 给的额外压扁 |
| `rot`, `flip`, `sx`, `sy` | 旋转、镜像、缩放（`sx = cos(相位)` 可做转身） |
| `aL`, `aR` | 手臂角（默认 .2；0 平伸、正抬、负垂） |
| `walk` | 走路相位（腿交替抬起） |
| `noLegs`, `noShadow`, `swMul` | 去腿、去阴影、描边倍数 |
| `col`, `dk`, `lt` | 身体主色/暗部/亮部 |
| `eyes`, `squint`, `lookX`, `lookY`, `seed` | 眼型、眯眼（>.8 变成一条线）、视线、眨眼错相 |
| `mouth`, `blush`, `hat` | 嘴型、腮红、帽子 |
| `lid` | 便当盒嘴张开 0..1 |
| `draw(u, sw)`, `armL(u, sw)`, `armR(u, sw)` | 身体局部配饰钩子、手臂末端道具钩子 |
| `emote`, `emoteK` | 反应符号与弹出进度 |

眼型：normal（会自动眨眼）、look、happy、closed、wink、narrow、angry、scared、spark、red、heart、x、swirl、dot、shades。
嘴型：o、O、smile、grin、flat、wobble、cat。
帽子：party、hard、crown、halo、wizard、hood、top、fedora、band、sweatband、cat、masq、mask、bowtie。
`eyes(u, o, sw)`、`mouth(u, m, sw)`、`hat(u, h, sw)` 本身也是全局函数，可在 `draw` 钩子里复用（例：c08 在钩子里让帽子落下）。

`emote(kind, x, y, s, k)`：sweat、spark、heart、anger、music、swirl、zzz、!、?、!?、!!。

`mood(t, keys)`：`keys = [[t0, eyes, emote?], ...]`。切换前后 0.16 s 闭眼、身体做一个压扁-拉伸的 take、emote 弹出约 1.5 s。
返回 `{eyes, squint, take, emote, emoteK}`。

`move(style, t, seed = 0)` → `{dy, sq, aL, aR, rot, walk, sx, dx}`：bounce、hop、roof、sway、spin（每 4 拍转一圈）、wave、walk、run、
idle、stomp、shimmy、mix（每 8 拍换一种）。`dx` 需自己乘 u 加到 x 上（`dancer` 已处理）。展开进任何遵守约定的角色都能用。
`dancer(x, y, u, style, t, extra)`（= `clawd` + `move`）。

## 研究员（cast.js，参考角色）

`researcher(x, y, s, o)`，约 13.2s 高。局部坐标：脚 y 0、胯 −2.3s、肩 (±1.75s, −7.6s)、头心 (0, −10.7s) 半径 2.35s；
手臂 3.2s 到手心。手臂角约定同 Clawd，默认 −1.25（下垂）。

| 选项 | 说明 |
|---|---|
| `dy`, `sq`, `take`, `rot`, `flip`, `spin` | 姿态；`spin` 0..1 转一圈（压 x） |
| `aL`, `aR`, `walk`, `run`, `sit`, `back` | 手臂、走/跑相位、坐姿、背影 |
| `eyes` | dot（会眨眼）、wide、star、swirl、closed、sad、x、heart、look（+`lookX`/`lookY`）；`squint > .5` 时为 closed |
| `brows`, `mouth` | worried/angry/up；smile/o/O/flat/wobble/grin |
| `hairUp`, `glassesTilt`, `bowtie`, `blush` | 头发竖起、眼镜歪斜（π 为倒戴）、领结、腮红 |
| `coat`, `pants`, `shirt` | 服装颜色 |
| `draw(s, sw)`, `handL(s, sw)`, `handR(s, sw)` | 钩子；手钩子在手心、手臂坐标系里调用 |
| `emote`, `emoteK`, `noShadow` | 同 Clawd |

`researcherDancer(x, y, s, style, t, extra)`。

## 剧场道具（props.js，原作的场景，参考实现）

| 函数 | 说明 |
|---|---|
| `stageBack(t, o)` | `o.backdrop(t)` 或（`o.wall` 墙色 + `o.a`/`o.b` 放射光，每秒转 .12 rad）；`o.floor` 地板色（y 800 起）；`o.spots = [[x, col]]` |
| `stageFront(t, o)` | 两侧幕布与垂幔；`o.curtain` 0..1 合拢；`o.alarm` 0..1 红色警报 |
| `sunburst(cx, cy, a, b, rot = 0, n = 16, r = 2200, op = 120)` | 放射光 |
| `spotlight(x, col = PAL.cream, top = −60)` | 光锥 + 地面光斑（地面 y 860） |
| `meterProp(x, y, s, v, o)` | 计量器，底座在 (x, y)，s = 1 约 560px 高；o：`cracked` 0..1、`glow`、`label`；会设 `METER_SHOWN` |
| `meterColor(v)` | v < 40 绿、< 75 黄、否则红 |
| `pumpProp(x, y, s, h, hoseTo)` | 打气筒，h 为手柄高度 0..1，`hoseTo = [x, y]` 连管 |
| `pumpH(t)` | 手柄高度：拍内 78% 慢慢抬起、22% 快速压下，正好在拍上压到底 |

## 时间线（timeline.js）

| 名称 | 说明 |
|---|---|
| `chapter(name, start, end, shots)` | 注册章节；`shots = [[t0, fn], ...]` 按时间排序 |
| `pdoomAt(t)` | 计量器数值：`SONG.meter` 每个窗口内逐拍阶梯上涨，窗口之间保持；初值 5 |
| `cornerMeter(t)` | 角落计量器（x 1760, y 110），只在窗口内（+0.3 s）且本帧没画 `meterProp` 时出现 |
| `wipe(p, idx)` | 笔刷擦除，`p` 0..1（p = .5 时完全遮住，此刻切换章节）；颜色按 `WIPE_COLS` 轮换 |
| `karaoke(t)` / `drawKaraokeText(c)` | 卡拉 OK 条（y 978 起约 92px 高）与逐字高亮文字（y 1022，奶油色，唱过的部分为赭黄） |
| `LOOPS.name = fn; LOOPS.name.len = 秒` | 独立循环场景（不进正片）：GIF 素材，或角色模型表 `LOOPS.cast`；`render.mjs --loop=name` 渲染一个周期，`--loop=name --sheet=…` 出联系表（时间为循环内时间；没有卡拉 OK、计量器、转场） |
| `placeholder(t)` | 未画章节的占位画面，可用作章节存根的镜头 |

## 渲染钩子（core.js，给 render.mjs 用）

`window.renderAt(t, type = 'image/png', q = .92)` → dataURL；`window.renderSheet(times, cols = 3, w = 640)` → `{url, ms[]}`；
`window.gpuInfo()`；`window.ready`。浏览器里直接打开 `studio.html`（不带 `?render`）会出现拖动条，可逐帧预览（`?t=秒` 指定起点）。
