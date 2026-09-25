#!/usr/bin/env node
// lyrics_to_ly.mjs: turn timed lyrics into the engine's src/lyrics.js (const LY = [[start, end, "text"], ...]).
// Reads LRC, SRT, VTT, TSV ("start<TAB>end<TAB>text" or "start<TAB>text", seconds or mm:ss.xx) and JSON
// ([[start, end, text]] or [{start, end, text}]). Plain untimed text is refused: time it with align_lyrics.py first.
//   node lyrics_to_ly.mjs <file> [--out=src/lyrics.js] [--duration=<song seconds>] [--shift=<seconds, + = later>]
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';

const CJK = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;
const cjkCount = s => (s.match(CJK) || []).length;
// seconds the karaoke needs to sweep a line (same rate as timeline.js), and its on-screen width at 50px
const singTime = s => .45 + (s.length + 3 * cjkCount(s)) * .075;
const widthPx = s => cjkCount(s) * 52 + (s.length - cjkCount(s)) * 25;

function clock(s) {
  const p = String(s).trim().replace(',', '.').split(':').map(Number);
  if (p.some(isNaN)) return NaN;
  return p.reduce((acc, v) => acc * 60 + v, 0);
}
const clean = s => s.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').replace(/\s+/g, ' ').trim();

function parseLRC(text, warn) {
  let offset = 0; const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    const off = raw.match(/^\s*\[offset:\s*([+-]?\d+)\s*\]/i);
    if (off) { offset = +off[1] / 1000; continue; }
    const tags = [...raw.matchAll(/\[(\d+:\d+(?:[.:]\d+)?)\]/g)];
    if (!tags.length) continue;
    const txt = clean(raw.replace(/\[[^\]]*\]/g, '').replace(/<\d+:\d+(?:[.:]\d+)?>/g, ''));
    for (const m of tags) {
      const [mm, rest] = [m[1].split(':')[0], m[1].slice(m[1].indexOf(':') + 1).replace(':', '.')];
      rows.push({ start: +mm * 60 + +rest - offset, text: txt });
    }
  }
  rows.sort((a, b) => a.start - b.start);
  // an empty line marks where the previous line ends; a repeated timestamp is usually a translation line: keep the first
  const out = [];
  for (const r of rows) {
    const prev = out[out.length - 1];
    if (prev && Math.abs(prev.start - r.start) < .005 && r.text) { if (r.text !== prev.text) warn(`dropped a second line at ${r.start.toFixed(2)}s (translation?): "${r.text}"`); continue; }
    if (!r.text) { if (prev && prev.end == null) prev.end = r.start; continue; }
    out.push({ start: r.start, end: null, text: r.text });
  }
  return out;
}

function parseCues(text) {   // SRT and VTT
  const out = [];
  for (const block of text.replace(/\r/g, '').split(/\n\s*\n/)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const i = lines.findIndex(l => l.includes('-->'));
    if (i < 0) continue;
    const [a, b] = lines[i].split('-->').map(s => s.trim().split(/\s+/)[0]);
    const txt = clean(lines.slice(i + 1).join(' '));
    if (txt) out.push({ start: clock(a), end: clock(b), text: txt });
  }
  return out;
}

function parseTSV(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const c = raw.split('\t');
    if (c.length >= 3 && !isNaN(clock(c[1]))) out.push({ start: clock(c[0]), end: clock(c[1]), text: clean(c.slice(2).join(' ')) });
    else if (c.length >= 2) out.push({ start: clock(c[0]), end: null, text: clean(c.slice(1).join(' ')) });
  }
  return out;
}

function parseJSON(text) {
  return JSON.parse(text).map(r => Array.isArray(r) ? { start: +r[0], end: r[1] == null ? null : +r[1], text: clean(String(r[2])) } : { start: +r.start, end: r.end == null ? null : +r.end, text: clean(String(r.text)) });
}

export function parseLyrics(text, name = '', o = {}) {
  const warnings = [], warn = m => warnings.push(m), ext = (name.match(/\.(\w+)$/) || [])[1]?.toLowerCase();
  let rows;
  if (ext === 'json' || /^\s*\[\s*[[{]/.test(text)) rows = parseJSON(text);
  else if (ext === 'srt' || ext === 'vtt' || /-->/.test(text)) rows = parseCues(text);
  else if (ext === 'lrc' || /^\s*\[\d+:\d+/m.test(text)) rows = parseLRC(text, warn);
  else if (ext === 'tsv' || /^\s*[\d.:]+\t/m.test(text)) rows = parseTSV(text);
  else throw new Error(`${name || 'input'} has no timestamps. Time plain lyrics with align_lyrics.py first (it writes an SRT).`);
  rows = rows.filter(r => r.text && isFinite(r.start)).map(r => ({ ...r, start: r.start + (o.shift || 0), end: r.end == null ? null : r.end + (o.shift || 0) }));
  rows.sort((a, b) => a.start - b.start);
  if (!rows.length) throw new Error(`no timed lines found in ${name || 'input'}`);
  const dur = o.duration || Infinity, ly = [];
  rows.forEach((r, i) => {
    const next = i + 1 < rows.length ? rows[i + 1].start : dur;
    let end = r.end;
    if (end == null) end = Math.min(next - .1, r.start + Math.max(2, 2 * singTime(r.text)));   // untimed end: long enough to sing it, not through a break
    if (end > next) { warn(`"${r.text}" overlaps the next line; ended it at ${(next - .05).toFixed(2)}s`); end = next - .05; }
    if (end > dur) { warn(`"${r.text}" runs past the end of the song; clipped`); end = dur; }
    if (r.start < 0 || r.start >= dur) { warn(`dropped "${r.text}": starts at ${r.start.toFixed(2)}s, outside the song`); return; }
    if (end - r.start < .6) warn(`"${r.text}" is only ${(end - r.start).toFixed(2)}s long; its karaoke bar will barely open`);
    if (widthPx(r.text) > 1700) warn(`"${r.text}" is too wide for the karaoke bar (~${widthPx(r.text)}px of 1800); split it into two timed lines`);
    ly.push([+r.start.toFixed(2), +end.toFixed(2), r.text]);
  });
  if (ly.length && ly[0][0] < 1) warn(`the first line starts at ${ly[0][0]}s: the opening shot has almost no time before the karaoke covers the bottom band`);
  return { ly, warnings };
}

export function lyToJs(ly, source = '') {
  const rows = ly.map(([a, b, t]) => `  [${a}, ${b}, ${JSON.stringify(t)}]`);
  return `// lyrics.js: [start, end, text], generated${source ? ` from ${source}` : ''} by lyrics_to_ly.mjs; regenerate it instead of editing by hand.\nconst LY = [\n${rows.join(',\n')}\n];\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
  const file = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!file) { console.error('usage: node lyrics_to_ly.mjs <lyrics.lrc|.srt|.vtt|.tsv|.json> [--out=src/lyrics.js] [--duration=S] [--shift=S]'); process.exit(2); }
  try {
    const { ly, warnings } = parseLyrics(readFileSync(file, 'utf8'), file, { duration: +args.duration || 0, shift: +args.shift || 0 });
    const out = args.out || 'src/lyrics.js';
    writeFileSync(out, lyToJs(ly, basename(file)));
    console.log(`${ly.length} lines → ${out}  (${ly[0][0]}s – ${ly[ly.length - 1][1]}s)`);
    for (const w of warnings) console.log('  warning: ' + w);
  } catch (e) { console.error(e.message); process.exit(1); }
}
