#!/usr/bin/env node
// fetch_upstream.mjs: fills in the parts of these skills that are PDoomVideo's own source code, which this repository
// does not redistribute. Clones JohnHeibel/PDoomVideo at a pinned commit, copies the engine files into paint-mv/template
// and applies template.patch (the song.js / macOS / CJK changes), copies the nine original chapters into
// paint-mv-animate/examples and the original storyboard into paint-mv-storyboard/pdoom-storyboard.md.
//   node fetch_upstream.mjs [--force]
// new_project.mjs runs it automatically the first time. Needs git and patch.
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const UPSTREAM = 'https://github.com/JohnHeibel/PDoomVideo.git';
export const COMMIT = 'dff37f6b154e21dc21d9f27509debb059c5e0206';

const HERE = dirname(fileURLToPath(import.meta.url)), SKILLS = resolve(HERE, '../..');
const TEMPLATE = join(SKILLS, 'paint-mv/template'), CACHE = join(SKILLS, 'paint-mv/upstream');
const ENGINE = ['render.mjs', 'studio.html', 'src/core.js', 'src/timeline.js', 'src/props.js', 'src/clawd.js', 'src/cast.js'];

const git = (args, cwd) => {
  const r = spawnSync('git', args, { cwd, stdio: 'inherit' });
  if (r.status) throw new Error(`git ${args.join(' ')} failed`);
};

export function upstreamReady() {
  return ENGINE.every(f => existsSync(join(TEMPLATE, f))) && existsSync(join(SKILLS, 'paint-mv-animate/examples/c09_finale.js'));
}

export function fetchUpstream({ force = false } = {}) {
  if (upstreamReady() && !force) return;
  if (!existsSync(join(CACHE, '.git'))) {
    rmSync(CACHE, { recursive: true, force: true });
    console.log(`fetching ${UPSTREAM} @ ${COMMIT.slice(0, 7)}`);
    git(['clone', '--quiet', UPSTREAM, CACHE]);
  }
  git(['-c', 'advice.detachedHead=false', 'checkout', '--quiet', COMMIT], CACHE);

  for (const f of ENGINE) { mkdirSync(dirname(join(TEMPLATE, f)), { recursive: true }); copyFileSync(join(CACHE, f), join(TEMPLATE, f)); }
  const p = spawnSync('patch', ['-p1', '-s', '-N', '-i', join(SKILLS, 'paint-mv/template.patch')], { cwd: TEMPLATE, stdio: 'inherit' });
  if (p.status) throw new Error('applying template.patch failed');

  const EX = join(SKILLS, 'paint-mv-animate/examples');
  for (const f of readdirSync(join(CACHE, 'src/ch')).filter(f => f.endsWith('.js'))) copyFileSync(join(CACHE, 'src/ch', f), join(EX, f));
  copyFileSync(join(CACHE, 'STORYBOARD.md'), join(SKILLS, 'paint-mv-storyboard/pdoom-storyboard.md'));
  console.log('upstream PDoomVideo files in place (template engine, examples/, pdoom-storyboard.md)');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) fetchUpstream({ force: process.argv.includes('--force') });
