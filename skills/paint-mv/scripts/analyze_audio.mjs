#!/usr/bin/env node
// analyze_audio.mjs: measure what src/song.js needs from a song: its duration and one constant beat grid (BPM plus the
// time of beat 0, so beats fall at offset + n * 60 / bpm), with a downbeat guess and a loudness-per-bar profile that
// helps find the song's sections. Needs ffmpeg on PATH.
//   node analyze_audio.mjs <audio> [--json] [--bpm=<force tempo>] [--min=60] [--max=200]
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const SR = 22050, N = 1024, HOP = 256, FPS = SR / HOP;
const LAT = .014;   // the detector fires this much before a sharp hit (measured on a synthetic click track)

export function decode(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 2 ** 30 });
  if (r.error) throw new Error(`cannot run ffmpeg (${r.error.message}); install it and put it on PATH`);
  if (r.status) throw new Error(`ffmpeg could not decode ${file}:\n${r.stderr}`);
  const b = r.stdout;
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + (b.length & ~3)));
}

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = p + len / 2, tr = re[q] * cr - im[q] * ci, ti = re[q] * ci + im[q] * cr;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

// Log-band spectral flux: 40 log-spaced bands from 40 Hz to 10 kHz, in dB, summed positive change per frame.
// Also returns the flux of the bands under 150 Hz (kick drum) and the RMS of every frame.
export function onsets(x) {
  const nF = Math.max(0, Math.floor((x.length - N) / HOP) + 1), NB = 40;
  const edges = Array.from({ length: NB + 1 }, (_, b) => Math.round(40 * Math.pow(10000 / 40, b / NB) * N / SR));
  const win = Float64Array.from({ length: N }, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / N));
  const re = new Float64Array(N), im = new Float64Array(N), prev = new Float64Array(NB), cur = new Float64Array(NB);
  const env = new Float32Array(nF), low = new Float32Array(nF), rms = new Float32Array(nF);
  for (let f = 0; f < nF; f++) {
    let e2 = 0;
    for (let i = 0; i < N; i++) { const v = x[f * HOP + i]; e2 += v * v; re[i] = v * win[i]; im[i] = 0; }
    rms[f] = Math.sqrt(e2 / N);
    fft(re, im);
    let flux = 0, lf = 0;
    for (let b = 0; b < NB; b++) {
      let e = 0;
      for (let k = edges[b]; k < Math.max(edges[b] + 1, edges[b + 1]); k++) e += re[k] * re[k] + im[k] * im[k];
      cur[b] = 10 * Math.log10(1e-10 + e);
      const d = f ? Math.max(0, cur[b] - prev[b]) : 0;
      flux += d; if (edges[b + 1] * SR / N <= 150) lf += d;
    }
    env[f] = flux; low[f] = lf; prev.set(cur);
  }
  return { env: smooth(env, 1.5), low: smooth(low, 1.5), rms };
}

function smooth(a, sigma) {
  const r = Math.ceil(sigma * 3), k = Array.from({ length: 2 * r + 1 }, (_, i) => Math.exp(-((i - r) ** 2) / (2 * sigma * sigma)));
  const ks = k.reduce((p, q) => p + q, 0), out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) { let s = 0; for (let j = -r; j <= r; j++) s += (a[i + j] ?? 0) * k[j + r]; out[i] = s / ks; }
  return out;
}

const tOf = f => (f * HOP + N / 2) / SR + LAT;                  // time of the onset measured in frame f
const bpmOf = lag => 60 * FPS / lag;

// Mean envelope height at phi, phi + P, phi + 2P, ... (frames, linear interpolation).
function gridScore(e, P, phi, from = 0, to = e.length - 1) {
  let s = 0, n = 0;
  for (let t = phi + Math.ceil((from - phi) / P) * P; t < to; t += P) { const i = Math.floor(t), f = t - i; s += e[i] * (1 - f) + e[i + 1] * f; n++; }
  return n ? s / n : 0;
}
function bestPhase(e, P, step, lo = 0, hi = P, from, to) {
  let best = -1, phi = lo;
  for (let p = lo; p < hi; p += step) { const s = gridScore(e, P, p, from, to); if (s > best) { best = s; phi = p; } }
  return { phi, score: best };
}

// Tempo: autocorrelation of the envelope weighted by a log-normal prior around 120 BPM (one octave wide). When a rival at
// a simple ratio (2:1, 3:2, ...) is nearly as strong, the metre is ambiguous from the audio alone (e.g. an even triplet
// groove fits 88 and 132 equally); take the one nearest a 95 BPM dance pulse and flag it. Then a constant-grid fit around
// the pick sets BPM to ~0.01 and the phase to ~1 ms.
export function beatGrid(e, o = {}) {
  const minB = o.min || 60, maxB = o.max || 200, n = e.length;
  let m = 0; for (const v of e) m += v; m /= n;
  const lo = Math.floor(bpmOf(maxB)), hi = Math.ceil(bpmOf(minB)), ac = new Float64Array(hi + 2);
  for (let L = lo; L <= hi + 1; L++) { let s = 0; for (let i = 0; i + L < n; i++) s += (e[i] - m) * (e[i + L] - m); ac[L] = s / (n - L); }
  const prior = b => Math.exp(-.5 * Math.log2(b / 120) ** 2);
  const cands = [];
  for (let L = lo + 1; L <= hi; L++) if (ac[L] > ac[L - 1] && ac[L] >= ac[L + 1] && ac[L] > 0) {
    const d = (ac[L - 1] - ac[L + 1]) / (2 * (ac[L - 1] - 2 * ac[L] + ac[L + 1]) || 1), lag = L + clamp(d, -.5, .5);
    cands.push({ bpm: bpmOf(lag), w: ac[L] * prior(bpmOf(lag)) });
  }
  if (!cands.length && !o.bpm) throw new Error('no periodicity found (is the file silent or not music?)');
  cands.sort((a, b) => b.w - a.w);
  const top = cands[0] || { bpm: o.bpm, w: 1 };
  const simple = r => [2, 1 / 2, 3 / 2, 2 / 3, 3, 1 / 3].some(q => Math.abs(r / q - 1) < .03);
  const rivals = cands.filter(c => c !== top && c.w >= .65 * top.w && simple(c.bpm / top.bpm));
  const b0 = o.bpm || [top, ...rivals].sort((a, b) => Math.abs(Math.log2(a.bpm / 95)) - Math.abs(Math.log2(b.bpm / 95)))[0].bpm;
  let best = { bpm: b0, ...bestPhase(e, 60 * FPS / b0, 1) };
  if (!o.bpm) {
    for (let b = b0 * .96; b <= b0 * 1.04; b += .05) { const r = bestPhase(e, 60 * FPS / b, 1); if (r.score > best.score) best = { bpm: b, ...r }; }
    for (let b = best.bpm - .1; b <= best.bpm + .1; b += .002) { const r = bestPhase(e, 60 * FPS / b, .05, best.phi - 1.5, best.phi + 1.5); if (r.score > best.score) best = { bpm: b, ...r }; }
  }
  // song.js stores a rounded tempo: prefer a whole or half BPM when it fits (almost) as well, then re-fit the phase to it
  const fitAt = b => { const P = 60 * FPS / b; return { bpm: b, P, ...bestPhase(e, P, .02, best.phi - 3, best.phi + 3) }; };
  const exact = fitAt(Math.round(best.bpm * 100) / 100);
  const pick = o.bpm ? fitAt(o.bpm) : [Math.round(best.bpm), Math.round(best.bpm * 2) / 2].map(fitAt).find(f => f.score >= exact.score * .995) || exact;
  const alt = cands.slice(0, 4).map(c => ({ bpm: +c.bpm.toFixed(2), rel: +(c.w / top.w).toFixed(2) }));
  // which onset in the beat is beat 0? a half- or third-beat shift that scores almost as well means the phase is a guess
  const shifts = [1 / 2, 1 / 3, 2 / 3].map(f => ({ f, ...bestPhase(e, pick.P, .05, pick.phi + f * pick.P - 1, pick.phi + f * pick.P + 1) }))
    .filter(r => r.score >= .9 * pick.score);
  return { bpm: pick.bpm, P: pick.P, phi: pick.phi, alternates: alt, ambiguous: !o.bpm && rivals.length > 0, phaseRivals: shifts.map(r => r.phi) };
}

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

export function analyze(file, o = {}) {
  const x = decode(file), duration = x.length / SR;
  if (duration < 5) throw new Error(`${file} is only ${duration.toFixed(2)} s long`);
  const { env, low, rms } = onsets(x);
  const g = beatGrid(env, o);
  const bpm = g.bpm, beat = 60 / bpm;
  const wrap = phi => { const v = ((tOf(phi) % beat) + beat) % beat; return v > beat - .005 ? 0 : +v.toFixed(3); };
  const offset = wrap(g.phi), offsetRivals = g.phaseRivals.map(wrap);
  // drift: best local phase (same period) in 32-beat windows; a steady grid stays within a few ms everywhere
  const drift = [];
  for (let w0 = g.phi; w0 + 32 * g.P < env.length; w0 += 32 * g.P) {
    const r = bestPhase(env, g.P, .1, g.phi - g.P / 4, g.phi + g.P / 4, w0, w0 + 32 * g.P);
    drift.push(Math.round((r.phi - g.phi) / FPS * 1000));
  }
  // downbeat: which beat (mod 4) gets the most kick-drum onset, with a little help from the full-band envelope
  const beats = [];
  for (let t = offset; t < duration; t += beat) beats.push(t);
  const at = (a, t) => { const f = (t - LAT) * SR / HOP - N / 2 / HOP, i = Math.floor(f); return i < 0 || i + 1 >= a.length ? 0 : a[i] + (a[i + 1] - a[i]) * (f - i); };
  const ph = [0, 1, 2, 3].map(p => { let l = 0, b = 0, n = 0; beats.forEach((t, i) => { if (i % 4 === p) { l += at(low, t); b += at(env, t); n++; } }); return { p, s: l / n / (mean(low) || 1) + .5 * b / n / (mean(env) || 1) }; });
  ph.sort((a, b) => b.s - a.s);
  const downbeat = ph[0].p, dbConf = +(1 - ph[1].s / ph[0].s).toFixed(2);
  // loudness per bar (bar k = beats downbeat + 4k .. + 4k + 3), in dB relative to the loudest bar
  const bars = [];
  for (let k = 0, t0 = offset + downbeat * beat - 4 * beat; t0 < duration; k++, t0 += 4 * beat) {
    const f0 = Math.max(0, Math.floor(t0 * FPS)), f1 = Math.min(rms.length, Math.floor((t0 + 4 * beat) * FPS));
    if (f1 <= f0) continue;
    let s = 0; for (let f = f0; f < f1; f++) s += rms[f] * rms[f];
    bars.push({ bar: k, t: +Math.max(0, t0).toFixed(2), db: 10 * Math.log10(1e-12 + s / (f1 - f0)) });
  }
  const top = Math.max(...bars.map(b => b.db));
  bars.forEach(b => { b.db = +(b.db - top).toFixed(1); });
  return {
    file, duration: +duration.toFixed(3), bpm, beat: +beat.toFixed(4), offset: +offset.toFixed(3), bar: +(4 * beat).toFixed(4),
    downbeat, downbeatConfidence: dbConf, alternates: g.alternates, tempoAmbiguous: g.ambiguous, offsetRivals, driftMs: drift, bars
  };
}
const mean = a => { let s = 0; for (const v of a) s += v; return s / a.length; };

export function report(a) {
  const L = [];
  L.push(`${a.file}`);
  L.push(`  duration ${a.duration} s · ${a.bpm} BPM (beat ${a.beat} s, bar ${a.bar} s) · beat 0 at ${a.offset} s`);
  L.push(`  beats fall at ${a.offset} + n × ${a.beat} s; bars start on beats ≡ ${a.downbeat} (mod 4) (confidence ${a.downbeatConfidence})`);
  L.push(`  tempo candidates: ${a.alternates.map(c => `${c.bpm} (${c.rel})`).join(', ')}${a.tempoAmbiguous ? `  ← AMBIGUOUS metre: picked the one nearest a 95 BPM dance pulse; force another with --bpm=N` : ''}`);
  if (a.offsetRivals.length) L.push(`  beat 0 could also be at ${a.offsetRivals.join(' or ')} s  ← AMBIGUOUS phase: onsets are about as strong there (even off-beats/triplets); pick by ear with --offset=S`);
  const dmax = Math.max(0, ...a.driftMs.map(Math.abs));
  L.push(`  grid drift per 32 beats (ms): ${a.driftMs.join(' ')}${dmax > 45 ? '  ← NOT steady: the constant grid drifts here; cue hits by ear in those sections' : ''}`);
  L.push('  loudness per bar (dB below the loudest bar):');
  for (const b of a.bars) L.push(`  ${String(b.bar).padStart(4)}  ${b.t.toFixed(2).padStart(7)} s  ${b.db.toFixed(1).padStart(6)}  ${'█'.repeat(Math.max(0, Math.round((30 + b.db) / 1.5)))}`);
  return L.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
  const file = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!file) { console.error('usage: node analyze_audio.mjs <audio> [--json] [--bpm=N] [--min=60] [--max=200]'); process.exit(2); }
  try {
    const a = analyze(file, { bpm: args.bpm ? +args.bpm : 0, min: +(args.min || 60), max: +(args.max || 200) });
    if (args.json) console.log(JSON.stringify(a, null, 2)); else console.log(report(a));
  } catch (e) { console.error(e.message); process.exit(1); }
}
