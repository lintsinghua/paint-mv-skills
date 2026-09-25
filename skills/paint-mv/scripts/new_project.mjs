#!/usr/bin/env node
// new_project.mjs: start an MV project from a song. Copies the engine template, puts the song in assets/, measures its
// beat grid (analyze_audio.mjs), converts timed lyrics (lyrics_to_ly.mjs), writes src/song.js and runs npm ci.
//   node new_project.mjs <project-dir> --audio=<song> [--lyrics=<lrc|srt|vtt|tsv|json>] [--title="..."]
//        [--bpm=N] [--offset=S] [--meter-label=TEXT] [--no-install] [--force]
import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { analyze, report } from './analyze_audio.mjs';
import { parseLyrics, lyToJs } from './lyrics_to_ly.mjs';
import { fetchUpstream } from './fetch_upstream.mjs';

const HERE = dirname(fileURLToPath(import.meta.url)), TEMPLATE = resolve(HERE, '../template');
const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const i = a.indexOf('='); return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)]; }));
const dir = process.argv.slice(2).find(a => !a.startsWith('--'));
const die = m => { console.error(m); process.exit(1); };
if (!dir || !args.audio) die('usage: node new_project.mjs <project-dir> --audio=<song> [--lyrics=<timed lyrics>] [--title="..."] [--bpm=N] [--offset=S] [--meter-label=TEXT] [--no-install] [--force]');
if (!existsSync(args.audio)) die(`no such audio file: ${args.audio}`);
if (args.lyrics && !existsSync(args.lyrics)) die(`no such lyrics file: ${args.lyrics}`);
if (existsSync(dir) && readdirSync(dir).length && !args.force) die(`${dir} exists and is not empty (use --force to write into it)`);

// 1 · engine
fetchUpstream();
mkdirSync(dir, { recursive: true });
cpSync(TEMPLATE, dir, { recursive: true });
const audio = `assets/song${extname(args.audio).toLowerCase() || '.mp3'}`;
copyFileSync(args.audio, join(dir, audio));
console.log(`engine → ${dir}\nsong   → ${join(dir, audio)}`);

// 2 · beat grid
const a = analyze(args.audio, { bpm: args.bpm ? +args.bpm : 0 });
if (args.offset != null) a.offset = +args.offset;
writeFileSync(join(dir, 'assets/analysis.json'), JSON.stringify(a, null, 2));
console.log('\n' + report(a) + '\n');

// 3 · lyrics
const duration = Math.floor(a.duration * 100) / 100;
let checkTimes = [.1, .3, .5, .7, .9].map(f => +(duration * f).toFixed(1));
if (args.lyrics) {
  const { ly, warnings } = parseLyrics(readFileSync(args.lyrics, 'utf8'), args.lyrics, { duration });
  copyFileSync(args.lyrics, join(dir, 'assets', 'lyrics' + extname(args.lyrics).toLowerCase()));
  writeFileSync(join(dir, 'src/lyrics.js'), lyToJs(ly, basename(args.lyrics)));
  console.log(`lyrics → src/lyrics.js: ${ly.length} lines, ${ly[0][0]}s – ${ly[ly.length - 1][1]}s`);
  for (const w of warnings) console.log('  warning: ' + w);
  checkTimes = [...new Set([0, 1, 2, 3, 4, 5].map(k => ly[Math.round(k * (ly.length - 1) / 5)]))].map(([s, e]) => +((s + e) / 2).toFixed(1));
} else console.log('lyrics → none yet (src/lyrics.js is empty): run lyrics_to_ly.mjs once you have timed lyrics');

// 4 · song.js
const title = args.title || basename(args.audio, extname(args.audio));
const q = JSON.stringify;
writeFileSync(join(dir, 'src/song.js'), `// song.js: the one place that knows which song this project animates. new_project.mjs writes it from the audio analysis;
// the storyboard step fills in wipes and meter. Read by core.js (BPM, OFF, DUR), timeline.js (wipes, meter) and render.mjs.
const SONG = {
  title: ${q(title)},
  audio: ${q(audio)},   // mixed into the MP4 by render.mjs
  duration: ${duration},               // seconds; the last frame is ceil(duration * fps) - 1
  bpm: ${a.bpm},                   // constant tempo of the beat grid
  offset: ${a.offset},                  // time of beat 0 in seconds; beats fall at offset + n * 60 / bpm
  wipes: [],                  // chapter breaks that get a brush wipe (s)
  meter: [],                  // optional: [start, end, from %, to %] windows where the meter prop climbs, beat by beat
  meterLabel: ${q(args['meter-label'] || '')},             // lettering on the meter prop and the corner meter (only if the song uses the meter)
  glyphs: '',                 // any other CJK text the chapters letter, preloaded so every frame gets the same font
};
`);
console.log(`\nsrc/song.js: "${title}", ${duration} s, ${a.bpm} BPM, beat 0 at ${a.offset} s`);

// 5 · dependencies (p5, p5.brush, puppeteer-core, pinned by package-lock.json)
if (!args['no-install']) {
  const r = spawnSync('npm', ['ci', '--no-audit', '--no-fund'], { cwd: dir, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status) die('npm ci failed; run it again inside the project once the network is back');
}
console.log(`\nnext: cd ${dir} && node render.mjs --sheet=${checkTimes.join(',')} --out=out/check/setup.jpg`);
