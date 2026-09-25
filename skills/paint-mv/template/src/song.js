// song.js: the one place that knows which song this project animates. new_project.mjs writes it from the audio analysis;
// the storyboard step fills in wipes and meter. Read by core.js (BPM, OFF, DUR), timeline.js (wipes, meter) and render.mjs.
const SONG = {
  title: 'Untitled',
  audio: 'assets/song.mp3',   // mixed into the MP4 by render.mjs
  duration: 60,               // seconds; the last frame is ceil(duration * fps) - 1
  bpm: 120,                   // constant tempo of the beat grid
  offset: 0,                  // time of beat 0 in seconds; beats fall at offset + n * 60 / bpm
  wipes: [],                  // chapter breaks that get a brush wipe (s)
  meter: [],                  // optional: [start, end, from %, to %] windows where the meter prop climbs, beat by beat
  meterLabel: '',             // lettering on the meter prop and the corner meter (only if the song uses the meter)
  glyphs: '',                 // any other CJK text the chapters letter, preloaded so every frame gets the same font
};
