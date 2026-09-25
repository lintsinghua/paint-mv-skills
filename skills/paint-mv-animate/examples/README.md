# 原作章节（PDoomVideo，《I'm Upping My P(doom)》，156.6 s，88 BPM，首拍 0.21 s）

原作的九个章节文件，是这套引擎下的参考实现。本仓库不包含它们：`paint-mv/scripts/fetch_upstream.mjs`（`new_project.mjs`
第一次运行时自动调用）会从 PDoomVideo 按固定提交拉下来放到这里。文件很长（500–900 行），按需搜函数名读，不要整篇通读。
原作分镜见 `paint-mv-storyboard/pdoom-storyboard.md`（每个镜头的设计意图都在那里）。
角色、场景和梗都属于那首歌；学的是画法、镜头、转场和表演。几个客串（shoggoth、Sydney、basilisk、Gato、chinchilla）
正好示范了怎样把歌词里的梗设计成角色，见 `../characters.md` 第 1 节。

| 文件 | 时间 · 调色 | 镜头函数（按顺序）与看点 |
|---|---|---|
| `c01_lab.js` | 0–23 · 夜靛蓝、台灯赭黄、显示器青 | `curtainUp` 幕布拉开、标题画在背景布上、活板门弹出 · `labOver` 过肩推镜 + 前景视差、睡醒的 mood · `sparks` 眼睛变星星、按拍的烟花 · `reaction` 电路藤蔓生长（`partial`）、椅子按拍后退（`kf`）· `shrug` 眨眼、图表弹出、钻进图表 · `lossRide` 沿函数曲线滑雪、悬崖边晃、坠落溅水 · `burst` 显示器鼓胀、碎玻璃、冲出屏幕并长大 · `boss` 老板椅转身揭晓、马克杯按拍堆高、便当盒嘴吱呀张开 · `chase` 史酷比式三门追逐（按拍）、破门 · `chomp` 大嘴合上变黑 + CHOMP |
| `c02_chorus1.js` | 23–38.5 · 玫瑰与赭黄放射光 | `upping` 嘴形遮罩揭幕、骑打气筒、计量器、合唱队、气团沿软管 · `foom` 火箭点火、FOOM、跟着俯仰上天 · `chineseRoom` 撞进纸屋、纸条沿贝塞尔轨迹传递、规则书翻页 · `shrooms` 彩虹隧道、蘑菇按拍弹跳、漩涡吸入、笑脸诞生 · `shoggothShot` 面具滑落、跃起扯掉、光圈收进眼睛 · `shinigami` 红黑、速度楔、甩镜、倒计时、弹跳苹果 · `danceBreak` 波浪式转圈、机器人舞（八分音符）、彩纸爆发。导出 `CAST.shoggoth`；`miniClawd` 省性能 |
| `c03_takeoff.js` | 38.5–59 · 晨空蓝 → 速度 → 玫瑰粉 | `gymShot` 跑步机、写字板/秒表手持道具、推到旋钮 · `dialShot` 旋钮被撞、表盘弹性打满、警报 · `holeShot` 黑洞沿螺线吸走道具、研究员像旗子一样飘、钻进黑洞 · `rideShot` 横向视差、等高线山丘、超车火车和喷气机、每拍长大、甩镜 · `atomsShot` 研究员散成点 → 拼成回形针 → 复原 · `assembleShot` 房间逐条拼装、心形笼子落下 · `sydneyShot` 按拍抱笼 · `ringShot` 戒指盒、从栏杆间挤出 · `bubbleShot` 心形泡泡长到盖满画面。导出 `CAST.sydney` |
| `c04_chorus2.js` | 59–73 · 竞技场，转太空紫与金 | `shotPump` 仰拍楼高 Clawd 双打气筒、按拍焰火、观众、戳破泡泡 · `shotBasilisk` 地面隆起、BOOM、木板飞溅、GPU 投喂节奏、蛇怪咀嚼 · `shotMoon` 沿股价样条冲上月球、插旗 · `shotOmega` 星系螺旋汇聚成一点、白光 · `shotGPU` 里程表进位（`letter` 滚轮）、确定性弹跳"零"、计量器叮 · `shotVault` 3D 环绕揭晓：金库没有后墙。导出 `CAST.basilisk` |
| `c05_obsolete.js` | 73–95.4 · 羊皮纸博物馆、赭黄公路 | `mlp` 舞者就是神经网络、前向/反向脉冲、相机跟着脉冲、指挥被电 · `museum` 老机器熄灭、防尘布沿弧线盖上、蜘蛛弹落 · `road` 弯路样条、正面卡丁车、急弯甩镜、刹车痕、研究员被甩出 · `cdr` 睡着的云朵保安、探照灯下垂、原地甜甜圈、喇叭 · `cliff` 抓住、每拍松一根手指、激光点、扑 · `fall` 俯视深渊环、研究员缩小、眼镜飞起、光圈收成夜色。导出 `CAST.gato`；`tube`/`spline`/`along`/`cPt` 工具 |
| `c06_chorus3.js` | 95.4–109.4 · 钢灰，转爵士蓝 | `plop` 从顶棚坠进回形针堆、机器按拍吐回形针 · `flood` 回形针海上涨、卷浪、冲浪 · `killswitch` 空转的椅子、按钮、回形针风滚草 · `beach` 度假的两位无视震动的手机 · `planetShot` 手动相机拉远到回形针星球、导火索火花、划火柴、BOOM · `blues` 爵士酒吧、两束追光锁定 90°、萨克斯音符按拍飘起。`clipPoly`/`densify`/`subPath` 工具 |
| `c07_scale.js` | 109.4–123.5 · 数据中心青、安全橙 | `tower` 自相似无限叠罗汉、加速俯仰、注意力弧线 · `disobey` 响片训练：坐/转/握手（半拍）、墨镜落下、抱臂 · `chinchillaShot` 龙猫把 token 吸进腮帮、Clawd 压成发光方块、砸穿地板 · `fences` 方块绕角翻滚、三种护栏按拍撞碎、跟拍 · `aisle` 透视推轨穿过机房、灯一路亮起、LED 按拍闪 · `rlhf` 克隆评委的拇指牌乱翻、画面倾斜、红潮淹没。导出 `CAST.chinchilla` |
| `c08_chorus4.js` | 123.5–140.5 · 警报红与黑 | `redAlert` 警报光束、八分音符弹跳、按拍玻璃开裂、贴创可贴 · `loom` 织布梭按拍飞、未来之树生长、一枝冲向镜头 · `flashback` 棕褐老胶片、黑板、伸长手臂写答案、胶片烧穿 · `recursion` 屏幕空间无限拉远、脚手架木板按拍落位 · `ilya` 门缝透光、偷看、SLAM + 锁链挂锁 · `darkness` 一束追光、黑暗里的眼睛 · `reveal` 拉开：原来是舞台，巨型 Clawd 戏服裂开、场务搬走布景。另有 `LOOPS.recursion` |
| `c09_finale.js` | 140.5–结束 · 深红与金 | `runOn` 全体从两侧跑上台、活板门升起 · `bows` 鞠躬沿队列传递、相机跟着、观众抛玫瑰 · `encore` 计量器被打成气球、POP · `finale` 跳跃波浪、彩纸炮、ta-da · `curtainFall` 大幕落下带标题和一行署名、偷看挥手、渐隐到纸色。`who()` 统一调度 `CAST`，缺失时有后备画法 |
