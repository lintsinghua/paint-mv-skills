#!/usr/bin/env python3
"""align_lyrics.py: time plain lyrics (one sung line per text line) against the song and write an SRT that
lyrics_to_ly.mjs turns into src/lyrics.js.

faster-whisper transcribes the song with word timestamps; the known lyrics are then matched to the transcript character
by character (difflib), so misheard words still get timed by their neighbours. Lines it could not hear are placed in the
gap between their neighbours and flagged. Run it through uv so the dependencies install on demand:

  uv run --python 3.12 --with faster-whisper --with zhconv python align_lyrics.py song.mp3 lyrics.txt \\
      --out lyrics.srt [--lang zh] [--model small] [--words words.json] [--prompt]

--words caches the transcript, so re-aligning after fixing the lyrics text takes seconds instead of minutes.
Section markers such as [Chorus], (Verse 2), 【副歌】 or "Chorus:" are skipped. Models download from Hugging Face on first
use (small ~0.5 GB, medium ~1.5 GB, large-v3 ~3 GB); set HF_ENDPOINT=https://hf-mirror.com if that is slow.
"""
import argparse
import difflib
import json
import os
import re
import statistics
import sys

CJK = re.compile(r'[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]')
MARKER = re.compile(r'^\s*(\[[^\]]*\]|\([^)]*\)|【[^】]*】|(verse|chorus|bridge|intro|outro|hook|pre-chorus)\s*\d*\s*:?)\s*$', re.I)

try:
    from zhconv import convert as _zh
    def simplify(s): return _zh(s, 'zh-cn')
except ImportError:
    def simplify(s): return s


def norm_chars(s):
    """Characters that take part in matching: CJK characters and lowercase letters/digits."""
    s = simplify(s).lower()
    return [c for c in s if CJK.match(c) or c.isalnum()]


def read_lines(path):
    lines = []
    with open(path, encoding='utf-8') as f:
        for raw in f:
            t = raw.strip()
            if not t or MARKER.match(t):
                continue
            if norm_chars(t):
                lines.append(t)
    return lines


def transcribe(audio, model_name, lang, device, hint):
    from faster_whisper import WhisperModel
    model = WhisperModel(model_name, device=device, compute_type='int8' if device in ('cpu', 'auto') else 'float16',
                         cpu_threads=os.cpu_count() or 4)
    # Music fools the no-speech detector, and one skipped window loses every line after it: never skip. `hotwords`
    # (only with --prompt) re-primes every 30 s window with the lyrics; it helps with odd words but can make the model
    # recite the whole lyric sheet over an instrumental, so it is off by default.
    segments, info = model.transcribe(audio, language=lang, word_timestamps=True, vad_filter=False, beam_size=5,
                                      condition_on_previous_text=False, no_speech_threshold=None, hotwords=hint)
    words = [(w.start, w.end, w.word) for s in segments for w in (s.words or [])]
    return words, info


def align(lines, words):
    # lyric side: every matchable character with its line; transcript side: characters timed by spreading each word
    L, owner = [], []
    for i, t in enumerate(lines):
        for c in norm_chars(t):
            L.append(c)
            owner.append(i)
    A, at, last = [], [], None
    for s, e, w in words:
        cs = norm_chars(w)
        # a word with no duration carries no timing (and whole runs of them are hallucinated recitation); "just, just,
        # just, just" is Whisper looping on a word: keep the first
        if not cs or e - s < .02 or cs == last:
            continue
        last = cs
        # Whisper stretches the first word after a pause back over the pause: keep its end, cap how long it can last
        cjk = sum(1 for c in cs if CJK.match(c))
        cap = .7 * cjk + (.4 + .1 * (len(cs) - cjk) if len(cs) > cjk else 0)
        s = max(s, e - cap)
        for k, c in enumerate(cs):
            A.append(c)
            at.append((s + (e - s) * k / len(cs), s + (e - s) * (k + 1) / len(cs)))
    hit = {}
    for i, j, n in difflib.SequenceMatcher(None, L, A, autojunk=False).get_matching_blocks():
        for k in range(n):
            hit[i + k] = at[j + k]
    durs = [b - a for a, b in hit.values() if b > a]
    cdur = statistics.median(durs) if durs else .25
    first = {}
    for idx, ln in enumerate(owner):
        first.setdefault(ln, idx)
    out = []
    for ln, text in enumerate(lines):
        i0 = first[ln]
        n = sum(1 for o in owner if o == ln)
        m = [(k - i0, hit[k]) for k in range(i0, i0 + n) if k in hit]
        if m:   # drop matches that wandered far from the line's median time
            med = statistics.median(t[0] for _, t in m)
            m = [(k, t) for k, t in m if abs(t[0] - med) < 6]
        cov = len(m) / n
        if cov >= .2:
            (k0, t0), (k1, t1) = m[0], m[-1]
            # nobody sings faster than ~0.08 s per CJK character or ~0.03 s per letter: a tighter match landed on a
            # garbled stretch
            if t1[1] - t0[0] < sum(.08 if CJK.match(c) else .03 for c in L[i0 + k0:i0 + k1 + 1]):
                cov = 0
        if cov < .2:
            out.append([None, None, text, cov])
            continue
        out.append([max(0, t0[0] - k0 * cdur), t1[1] + (n - 1 - k1) * cdur, text, cov])
    # unheard lines: share the gap between the known neighbours in proportion to their length
    i = 0
    while i < len(out):
        if out[i][0] is not None:
            i += 1
            continue
        j = i
        while j < len(out) and out[j][0] is None:
            j += 1
        a = out[i - 1][1] if i else 0.0
        b = out[j][0] if j < len(out) else a + sum(len(r[2]) for r in out[i:j]) * cdur * 1.5
        w = [len(norm_chars(r[2])) for r in out[i:j]]
        x = a
        for r, k in zip(out[i:j], w):
            span = (b - a) * k / sum(w)
            r[0], r[1] = x + .05, x + span - .05
            x += span
        i = j
    # no overlaps, nothing shorter than 0.5 s
    for k in range(len(out)):
        if k and out[k][0] < out[k - 1][1] + .05:
            out[k][0] = out[k - 1][1] + .05
        out[k][1] = max(out[k][1], out[k][0] + .5)
    for k in range(len(out) - 1):
        if out[k][1] > out[k + 1][0] - .05:
            out[k][1] = max(out[k][0] + .3, out[k + 1][0] - .05)
    return out


def srt_time(s):
    ms = int(round(s * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('audio')
    ap.add_argument('lyrics', help='UTF-8 text, one sung line per line')
    ap.add_argument('--out', default='lyrics.srt')
    ap.add_argument('--lang', default=None, help='language code (zh, en, ja, ...); detected when omitted')
    ap.add_argument('--model', default='small', help='tiny | base | small | medium | large-v3')
    ap.add_argument('--device', default='auto', help='auto | cpu | cuda')
    ap.add_argument('--prompt', action='store_true', help='prime the recogniser with the lyrics (hotwords): better on odd '
                                                          'words, but it can recite lyrics over instrumentals')
    ap.add_argument('--words', help='cache of the transcript (JSON): reused if it exists, written otherwise, so '
                                    'realigning edited lyrics skips the slow transcription')
    a = ap.parse_args()

    lines = read_lines(a.lyrics)
    if not lines:
        sys.exit(f'no lyric lines in {a.lyrics}')
    if a.words and os.path.exists(a.words):
        with open(a.words, encoding='utf-8') as f:
            words = [tuple(w) for w in json.load(f)]
        print(f'reusing {len(words)} transcribed words from {a.words}', file=sys.stderr)
    else:
        hint = ' '.join(dict.fromkeys(lines)) if a.prompt else None   # choruses once; the model keeps what fits
        print(f'transcribing {a.audio} with faster-whisper {a.model} …', file=sys.stderr)
        words, info = transcribe(a.audio, a.model, a.lang, a.device, hint)
        print(f'  language {info.language} ({info.language_probability:.2f}), {len(words)} words heard', file=sys.stderr)
        if a.words:
            with open(a.words, 'w', encoding='utf-8') as f:
                json.dump(words, f, ensure_ascii=False)
    flat = sum(1 for s, e, _ in words if e - s < .02)
    if words and flat > .2 * len(words):
        print(f'  warning: {flat} of {len(words)} words have no duration (hallucinated or garbled stretches); '
              f'those were ignored. If lines look wrong, retry {"without" if a.prompt else "with"} --prompt or a larger --model.',
              file=sys.stderr)
    rows = align(lines, words)
    with open(a.out, 'w', encoding='utf-8') as f:
        for i, (s, e, t, _) in enumerate(rows, 1):
            f.write(f'{i}\n{srt_time(s)} --> {srt_time(e)}\n{t}\n\n')
    # a weakly heard line also skews its neighbours (the recogniser smears their words over the gap): check those too
    weak = {i for i, r in enumerate(rows) if r[3] < .5}
    check = weak | {j for i in weak for j in (i - 1, i + 1) if 0 <= j < len(rows)}
    print(f'{len(rows)} lines → {a.out}; {len(weak)} weakly heard, {len(check)} to check by ear:', file=sys.stderr)
    for i, (s, e, t, c) in enumerate(rows):
        flag = '  ← weak' if i in weak else '  ← neighbour of a weak line' if i in check else ''
        print(f'  {s:7.2f} – {e:7.2f}  {c:4.0%}  {t}{flag}', file=sys.stderr)


if __name__ == '__main__':
    main()
