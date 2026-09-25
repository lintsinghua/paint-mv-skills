# 节拍与歌词对时（细节）

引擎只认两样时间：一条**恒定速度的拍网格**（`song.js` 的 `bpm` + `offset`，拍点 = `offset + n × 60/bpm`）和
**每句歌词的起止时间**（`lyrics.js` 的 `LY`）。所有打点、舞步、卡拉 OK 都由它们决定，所以动画开工前必须把它们弄对。

## analyze_audio.mjs

```bash
node <SKILLS>/paint-mv/scripts/analyze_audio.mjs song.mp3            # 可读报告
node <SKILLS>/paint-mv/scripts/analyze_audio.mjs song.mp3 --json     # JSON（new_project.mjs 存为 assets/analysis.json）
node <SKILLS>/paint-mv/scripts/analyze_audio.mjs song.mp3 --bpm=88   # 指定速度，只拟合首拍
```

做法：ffmpeg 解码成 22050 Hz 单声道 → 40 个对数频带的谱通量作起音包络 → 自相关（以 120 BPM 为中心、一个八度宽的先验）
选速度 → 在 ±4% 内拟合恒定网格，BPM 精确到 0.01、首拍精确到约 1 ms → 整数或 .5 BPM 拟合得几乎一样好时取整
（`song.js` 存的是取整后的值，首拍按它重新拟合）。

报告怎么读：
- `tempo candidates`：候选速度和相对强度。标了 **AMBIGUOUS** 表示有一个 2:1 或 3:2 关系的对手几乎一样强，
  光凭音频分不出拍子在哪一层（例如满是均匀三连音的歌，88 和 132 BPM 都成立）；脚本取最接近 95 BPM 舞步脉搏的那个。
  两种网格的拍点都踩在真实起音上，选错只是舞步快慢不同，不会失步。拿不准就请用户看一段对拍短片（见 paint-mv-render）。
- `beat 0 could also be at … ← AMBIGUOUS phase`：在半拍或三分之一拍之外还有几乎一样强的起音（反拍很重、或满是三连音），
  哪个位置才是拍头只是猜测。选错会让所有打点整体早或晚半拍/三分之一拍。同样请用户看对拍短片，用 `--offset=S` 选定。
  原作歌曲就是这种情况：首选 0.247 s，备选 0.474 / 0.02 s，原作手定的 0.21 s 最接近首选。
- `grid drift`：每 32 拍局部最佳相位相对全曲网格的偏移（ms）。稳定的歌都在几 ms 内；超过约 45 ms 会警告：
  这首歌速度不恒定（现场录音、渐快渐慢），恒定网格在那些段落会漂，那里的打点要按听感手动定时间，别用 `B(n)`。
- `bars start on beats ≡ k (mod 4)`：小节起点的猜测（按底鼓落点），置信度低时只作参考。
- `loudness per bar`：每小节响度条形图，找前奏、主歌、副歌、间奏、尾奏的边界。

精度（实测）：合成点击音轨的首拍误差 1 ms；原作歌曲测出 88 BPM（与原作一致，并正确报出 88/132 歧义），
首拍 0.247 s（原作手定 0.21 s，差 37 ms，不到 24 fps 的一帧）。需要时在 `song.js` 里微调 `offset`，一帧约 0.042 s。

## lyrics_to_ly.mjs

```bash
node <SKILLS>/paint-mv/scripts/lyrics_to_ly.mjs lyrics.lrc --out=src/lyrics.js --duration=<song.js 的 duration> [--shift=0.2]
```

| 格式 | 说明 |
|---|---|
| LRC | `[mm:ss.xx]歌词`；支持一行多个时间标签、`[offset:±ms]`、逐字 `<mm:ss.xx>` 标签（会去掉）；**空时间行 `[mm:ss.xx]` 表示上一句在此结束**；同一时间戳的第二行（常见的翻译行）会丢弃并警告 |
| SRT / VTT | 每条字幕的起止时间直接用；多行文字合成一行 |
| TSV | `起<TAB>止<TAB>歌词` 或 `起<TAB>歌词`（秒或 mm:ss.xx） |
| JSON | `[[起, 止, "歌词"]]` 或 `[{start, end, text}]` |
| 纯文本 | 拒绝，先用 align_lyrics.py 打轴 |

没有结束时间（普通 LRC）时：结束 = min(下一句开始 − 0.1 s, 开始 + max(2 s, 2 × 扫字时间))，
这样卡拉 OK 不会一直挂过间奏。实测在原作歌词上，只有开始时间的 LRC 结束时间平均偏差 0.32 s（间奏前的句子最多拖 2.5 s）；
加上空时间行标出间奏开始后偏差 ≤ 0.1 s。

会给出警告的情况：句子重叠（自动截短）、短于 0.6 s（卡拉 OK 条几乎打不开）、太宽放不进卡拉 OK 条
（50px 字号下约 70 个拉丁字符或 33 个汉字，需要拆成两句）、超出歌曲时长、第一句早于 1 s。

## align_lyrics.py（只有纯文本歌词时）

```bash
uv run --python 3.12 --with faster-whisper --with zhconv python <SKILLS>/paint-mv/scripts/align_lyrics.py \
    song.mp3 lyrics.txt --out assets/lyrics.srt --lang zh --model small --words assets/words.json
```

- 歌词文本：**每行一句，按演唱顺序写全**，重复的副歌每唱一次就写一次。`[Chorus]`、`(Verse 2)`、`【副歌】`、`Chorus:` 这类段落标记会被跳过。
  歌名、作词作曲这类**不唱的行要删掉**，否则会被当成第一句去找时间。
- 做法：faster-whisper 带词级时间戳转写（从不跳过"无人声"窗口：音乐常骗过静音检测，漏掉一个 30 s 窗口就丢掉后面所有句子），
  再把已知歌词和转写结果按字符序列对齐（difflib），唱错/听错的词由邻居带出时间；听不到的句子按字数分摊到前后句之间。
  修正了 Whisper 的几个常见毛病：停顿后第一个词把停顿"吞"进自己的时长（按词长封顶）、同一个词复读（只留第一个）、
  零时长的词（成串出现时是幻觉出来的"背诵"，丢掉不用）；一句里匹配上的字挤在比人能唱的还短的时间里
  （每个汉字不到约 0.08 s、每个字母不到约 0.03 s）就当这句没听到。
- 默认不给识别器提示。`--prompt` 把歌词作为 `hotwords` 提示每个窗口：生僻词和专有名词听得更准，但识别器可能在器乐段
  "背"出歌词（实测一首中文说唱：305 个词里 138 个零时长，整段副歌被挤到同一时刻）。超过 20% 的词没有时长时脚本会警告，
  建议换另一种模式或更大的模型。
- 输出每句的听到比例；`← weak`（听到不足一半）和 `← neighbour of a weak line`（它的邻居，时间常被挤歪）要人工复核。
- `--words` 缓存转写结果：改了歌词文本再对齐只要几秒。缓存与 `--prompt`、`--model` 无关，换模式或模型时换个缓存文件名。
- 精度（实测，原作歌曲、small 模型）：句首误差中位数 0.34 s，46 句里 32 句在 0.5 s 内（带 `--prompt`：0.31 s、31 句），
  所有误差超过 1 s 的句子都被标出。
  想更准用 `--model medium` 或 `large-v3`（下载更大、更慢）；最好的办法仍是拿到现成的 LRC（音乐平台的歌词文件）。
- 首次运行会下载模型（small 约 0.5 GB）。Hugging Face 慢就设 `HF_ENDPOINT=https://hf-mirror.com`。
  繁体输出靠 zhconv 统一成简体再匹配（去掉 `--with zhconv` 也能跑，只是繁简不会互认）。

结果是 SRT，接着用 lyrics_to_ly.mjs 转成 `src/lyrics.js`（`new_project.mjs --lyrics=assets/lyrics.srt` 会自动做）。

## 中日韩歌词

模板在拉丁字体后面加了 ZCOOL KuaiLe 作中日韩字符的回退（卡拉 OK、`letter()` 都生效），启动时预加载歌词、歌名、
计量器标签和 `SONG.glyphs` 用到的字形，保证并行渲染的每一帧都是同一种字体。章节里要写不在这些文字里的汉字时，
把它们加进 `song.js` 的 `glyphs`。卡拉 OK 扫字速度按一个汉字约等于四个拉丁字母计。
