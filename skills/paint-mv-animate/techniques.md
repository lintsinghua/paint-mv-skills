# 技法目录（从原作九个章节提炼）

每条都指向 `examples/` 里的具体函数。例子里的时间、拍号属于原曲（88 BPM，首拍 0.21 s），角色（Clawd、研究员、客串）、
剧场舞台、计量器也属于原曲；换成本片从歌词设计的角色和场景，做法照抄。章节总览见 [examples/README.md](examples/README.md)。

## 1. 文件骨架

```js
(() => {
  const B = n => OFF + n * BEAT;                        // 第 n 拍的时间；允许小数拍 B(166.5)
  const RED = '#E0283F', MAROON = '#4A1F2A';           // 本章调色
  const T_IGN = B(37), ROOM_Y = -3300;                  // 事件时间与布景常量写成具名常量
  function helper(...) { ... }                          // 私有道具/布景/角色
  function shotA(t, lt, dur) { ... }
  chapter('chorus1', 23.0, 38.5, [[23.0, shotA], [24.5, shotB], ...]);
  CAST.shoggoth = shoggoth;                             // 只导出终场要用的客串
})();
```

- 事件表：连续几拍上的动作写成数组 `const TOSS = [B(20), B(21), B(22)]`（c01 `boss`）、`const hits = [B(172), B(173), B(174)]`（c07 `fences`），
  用 `hits.filter(h => h <= t).pop()` 找最近一次打点，用 `t - lastHit` 做衰减。
- 静态几何在 IIFE 加载时预计算一次：c01 `VINES`、c03 `RDOTS`/`CLIP`、c04 `STOCK`（样条 + 累积弧长）、c08 `TREE`/`STARS`。
- 头部注释写明章节时间、调色、镜头列表；有性能取舍时也写上（c02 开头的 Perf note）。

## 2. 一个镜头的标准顺序

```
camBegin(...)            // 相机：每个镜头都在动
  背景/布景（比画面大，留出相机移动和震动的余量，如 rectPts(-700, -700, W+1400, H+1400)）
  道具 → 角色（从后到前）→ 特效
  stageFront(t, {})      // 剧场镜头最后画幕布
camEnd()
flushLetters()           // 需要时：让之后的屏幕层盖住字
屏幕空间叠加：iris / irisShape / flash / 甩镜条纹
```

典型：c02 `upping`、c04 `shotPump`、c09 `finale`。整镜进度用 `const e = ease(lt / dur)`。

## 3. 卡拍与动作表演

- 打点：`pulse(t, k)` 给相机缩放、压扁、光晕加一个每拍的冲击（`zoom + .015 * hit`、`sq: .3 * pulse(t, 10)`）；八分音符用 `pulse2`。
- 拍内相位：`frac(bpOf(t))` 驱动循环动作，例：c02 `upping` 里 Clawd 骑在打气筒手柄上"弹簧高跷"，在拍上砸下；
  c08 `pogo()` 按八分音符弹跳；c04 `jetEnv()` 让焰火在拍上喷发再衰减。
- `pumpH(t)` 驱动打气筒（每拍压到底）；c04 `shotPump` 用反三角函数让 Clawd 的手正好握住两个手柄。
- 预备 → 动作 → 过冲 → 回弹：起跳前先蹲（`sq` 变大，c02 `shoggothShot` 的 `T_JUMP`），落地用 `backOut`/`elasticOut`，
  余震用 `Math.exp(-age * k) * Math.cos(age * w)`（c02 `chineseRoom` 的 `roomDY`、c03 `atomsShot` 的 take）。
- 每拍长大一次：`grown(t)` 累加 `backOut((t - B(b)) / .24)`（c03 `rideShot`）；c01 `chase` 里每次出门 Clawd 更大（`CU` 数组）。
- 抛物线与飞散：c07 `fly(x0, y0, vx, vy, age, g)`；碎片/彩纸用 `hash(i)` 定初速度（c01 `curtainUp`、c02 `danceBreak`、c07 `fences`）。
- 路径运动：样条 + 弧长参数化后按进度取点（c04 `atL(L)` 沿股价线冲上月球，c05 `along(P, k)`，c06 `pointAt` 导火索火花）。

## 4. 相机语言（每个镜头都要动）

| 手法 | 做法 | 例子 |
|---|---|---|
| 推 | `camBegin(lerp(...), lerp(...), lerp(1, 1.32, e))` | c01 `labOver`（前景研究员另算视差） |
| 打点震动 | `const [sx, sy] = shakeXY(t, 20 * (1 - seg(t, hit, hit + .4)))` 加到 cx/cy | c01 `burst`、c04 `shotBasilisk` |
| 俯仰穿过高大世界 | 世界往负 y 延伸，相机 cy 跟着目标；只画可见的那一段 | c02 `foom`（`foomCamY`、`skyWorld(y0, y1)`） |
| 甩镜 | 相机 x 在 0.2–0.3 s 内移动上千像素 + 横向色条/速度线 | c02 `shinigami`、c03 `rideShot` → `whipStreaks` |
| 钻进物体 | 缩放到 3–8 倍对准一点，接 iris 或下一镜 | c01 `shrug` 钻进图表、c03 `holeShot` 钻进黑洞 |
| 连续拉远 | 自相似结构，在屏幕空间按比例画以保持墨线粗细 | c08 `recursion`、c07 `tower` |
| 环绕 | 自写 3D 投影 `P(X, Y, Z)` + 面按深度排序 | c04 `shotVault`（绕到背后：金库没有后墙） |
| 透视推轨 | `pr(X, Y, Z) = [VX + X*F/Z, VY - Y*F/Z]` | c07 `aisle` |
| 手动相机（极大缩放） | `V = {cx, cy, z}`，`SX/SY` 换算，`clipPoly` 裁剪巨型多边形，`zw(sw)` 缩放笔画 | c06 `planetShot` |
| 视差 | 背景层按相机位移的 0.1–0.3 倍移动 | c03 `rideShot`（`contourHills(D * .12)`）、c07 `fences` |
| 跟拍 | 相机 x 跟随角色，前方留空 | c07 `fences`（`camX = max(x0 + 300, X + 180)`） |

## 5. 有动机的转场

章节之间只有 `SONG.wipes` 里的少数几处用笔刷擦除（时间线自动画）；其余切换都要由画面里的动作带过去。
**相邻两章的交接帧必须一致**（同样的颜色/遮罩状态），在分镜的"出"列约定好。

| 转场 | 做法 | 例子 |
|---|---|---|
| 大嘴合上变黑 → 从嘴里张开 | `irisShape(rrPts(...))` 收拢 + 牙齿三角；下一章用超椭圆 `irisShape` 张开 | c01 `chomp` → c02 `mouthReveal` |
| 光圈收到眼睛上 | `iris(960, 540, lerp(1150, 0, easeIn(k)), 色)` | c02 `shoggothShot` 结尾、c05 `fall` |
| 色闪 | 上一镜末尾 `flash(ease(seg(t, a, b)), RED)`，下一镜开头 `flash(1 - seg(...), RED)` | c02 `shinigami` → `danceBreak`、c07 → c08 |
| 甩镜条纹 | 屏幕空间整屏涂色 + 长条色带，强度随进度 | c03 `whipStreaks`、c05 `streaks(k, vert)` |
| 钻入 + 张开光圈 | 上镜放大到黑洞中心，下镜以扩张的 `iris` 环开场 | c03 `holeShot` → `rideShot` 开头 |
| 泡泡盖满画面 → 下一章戳破 | 心形泡泡指数增长盖满；下一章 `irisShape` 锯齿破洞扩张 + 水滴碎膜 | c03 `bubbleShot` → c04 `bubblePop` |
| 液面淹没画面 | 波浪多边形从底部升满 + 色闪 | c07 `rlhf` 红潮、c06 `flood` 回形针海 |
| 白闪爆炸 → 烟散新场景 | `flash` 峰值切换，新场景开头 `flash(1 - ease(...))` + 烟团淡出 | c06 `planetShot` → `blues` |
| 金光爆发 | 星形光芒扩大到满屏，下一镜从 `flash` 淡入 | c07 `aisle` → `rlhf` |
| 胶片烧穿 | 同心不规则环扩大 | c08 `flashback` → `recursion` |
| 摔门入黑、一束追光、拉开揭晓 | `darkAround(coneHole())` 挖出光锥 | c08 `ilya` → `darkness` → `reveal` |
| 幕布开合 | `stageFront(t, { curtain })`；片尾大幕落下 + 渐隐到纸色 | c01 `curtainUp`、c09 `curtainFall` |
| 暗接暗 | 上章光圈收成夜色；下章从同色的舞台顶棚往下坠 | c05 `fall` → c06 `plop` |

## 6. 表演

以下做法对任何遵守角色约定（[characters.md](characters.md) 第 2 节）的角色都适用，例子里是原作的角色。

- 情绪切换一律 `mood()`：`...mood(t, [[t0, 'normal'], [t1, 'scared', '!'], [t2, 'happy', 'spark']])` 展开进角色。
  研究员的眼型名不同，用映射（c03 `moodR`）：`const m = mood(t, keys); ({ eyes: m.eyes, squint: m.squint, take: m.take * .8, emote: m.emote, emoteK: m.emoteK })`，
  并且 keys 里用研究员的眼型名（dot、wide、star…）。
- emote 的出现窗口：`emoteK: seg(t, a, a + .25) * (1 - seg(t, b, b + .3))`。
- 惊吓：`sq` 压扁 take、研究员 `hairUp`、`glassesTilt`、`brows: 'worried'`、`mouth: 'O'`；汗珠用 emote 或自己画甩出的水滴（c01 `reaction`）。
- 手持道具：`armR: (u) => mug(u * .9, u * .5, u / 34, PAL.teal)`（c01 `boss`）；要让道具保持竖直，在钩子里先抵消手臂角：
  c03 `upL`/`upR`、c07 `paddle(armA, …)`（`rotate(armA)`）。
- 身体局部配饰用 `draw` 钩子：c02 `strap`（绑带）、c03 `sydBow`/`sydLashes`、c05 `tutu`、c07 抱臂、c08 婴儿卷毛与在钩子里落下的帽子。
- 算身体某点的世界坐标：c05 `cPt(x, y, u, o, lx, ly)`（与 `clawd()` 的变换一致）；手尖公式见 c02 `shoggothShot`、c06 `handL`。
- 换色变体：`col/dk/lt`（c03 Sydney 粉色、c08 婴儿棕褐色、c02 `shinigami` 暗红剪影）。
- 转身：`sx = Math.cos(相位 * TAU)`（c01 老板椅转身、c02 舞蹈转圈、c07 `disobey` 扭头不理）。
- 客串角色：签名 `(x, y, s, t, o)`，支持 `o.bow`；在首次登场的章节里定义并 `CAST.name = fn` 导出
  （c02 shoggoth、c03 sydney、c04 basilisk、c05 gato、c07 chinchilla，每一个都是把一句歌词里的梗画成角色）；
  终场 c09 `who()` 调用它们，缺失时用自带的后备画法。

## 7. 副歌主场景的延续与升级

原作的副歌主场景是剧场舞台：四段副歌回到同一个舞台（`stageBack`/`stageFront` + 计量器 + 打气筒），每次加码。
新歌的主场景从歌词来（写在 `sets.js`），加码的做法照这里：
c02 `upping` 派对放射光 → c04 `shotPump` 竞技场（`arenaBack` 紫金放射光 + `beams` 摇灯 + `pyro` 焰火 + `crowd` 观众剪影 + `bigFront` 放大台口）
→ c06 `plop` 钢灰舞台（打气筒升级成回形针机 `machine`）→ c08 `redAlert` 红色警报（`sirenBeams`、`beacons`、`meterDamage` 玻璃裂纹 + 创可贴）。
计量器 `meterProp(x, y, s, pdoomAt(t), { glow: .9 * pulse(t, 4) })`，数值由 `SONG.meter` 驱动逐拍上涨。

## 8. 特效词汇

彩纸（`hash` 驱动，`scale(1, cos(...))` 翻转）· 星星/闪光（`starPts`）· 烟/尘（低不透明度 `fill` 椭圆，随 age 变大变淡）·
速度线（`inkLine`）· 飞溅（c01 `lossRide` 结尾）· 碎玻璃/木板（c01 `burst`、c04 `planks`）· 烟柱只画可见段（c02 `foom`）·
光晕（大号低不透明度 fill 椭圆）· 爱心气泡按拍爆开（c03 `beatHearts`）· 滚动计数器（c04 `shotGPU` 用 `letter` 画滚轮数字）·
倒计时数字（c02 `shinigami`）· 拟声字只在关键处（FOOM、BOOM、CHOMP、SLAM、POP…）。

## 9. 确定性与状态

- 没有 `Math.random()`：逐物体用 `hash(i)`；"每 1/12 秒变一次"的闪烁用 `hash(Math.floor(t * BOIL) * k + i)`（c02 `boilN`）；
  逐帧闪烁用 `Math.floor(t * 24)`（c08 `flashback` 老胶片）。
- 需要"物理模拟"时每帧从头按固定步长重算（c04 `gumball`，dt = 1/60）——开销随 t 增长，只用于短镜头。
- 镜头之间不传状态：下一镜需要的起始姿态，用同一个纯函数在 t0 处求值，或写成共享常量。

## 10. 分层与字

- 中途 `flushLetters()`：让后画的颜料盖住字。c01 `curtainUp`（标题画在背景布上，被 Clawd 和幕布挡住）、
  c02 `upping`（计量器上的字在嘴形遮罩之下）、c04 `shotPump`（在泡泡膜之下）、c06 `flood`（回形针海淹没字）。
- 字自动跟随相机，坐标给世界坐标；不想被相机缩放裁掉用 `screen: true`（c08 `ilya` 的 SLAM!）。
- 相机结束后仍要在屏幕上对准世界里的某点：先 `toScreen(x, y)` 取屏幕坐标再 `camEnd()`（c08 `loom` 的 `raceBranch`）。
- 画面被全屏内容占满（回忆、黑屏）时设 `METER_SHOWN = true` 隐藏角落计量器（c08 `loom`/`flashback`/`ilya`）。

## 11. 性能

- 水彩 `fill` 的开销随顶点数增长：大面积、多顶点的形状用 `wash`，`fill` 保持低多边形（c02 开头注释）。
- 背景小角色用只有平涂的简化版（c02 `miniClawd`）。
- 只画看得见的东西：c02 `skyWorld(y0, y1)`、c07 `tower` 的 `vis`、c06 `onScr` 剔除、c04 `shotGPU` 过滤出画的球。
- 小而快动的道具给 `cheap` 画法（c08 `door(t, { cheap: true, lite: true })`）。
- 联系表打印每帧 ms：目标 ≤ 2.5 s，超过 4 s 必须优化。

## 12. 独立循环（可选，不进正片）

`LOOPS.name = fn; LOOPS.name.len = 秒;`，`fn(t)` 里 t 是循环时间，首尾帧必须相同。`node render.mjs --loop=name` 渲一个周期的 PNG。
例：c08 `recursionLoop`（无限拉远，三层一循环）。
