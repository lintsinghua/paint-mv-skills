// characters.js: this song's main cast, designed from its lyrics (STORYBOARD.md, cast table) and shared by every chapter.
// Written before the chapters are painted. One function per character, same contract as clawd() / researcher():
//   name(x, y, u, o): (x, y) is the ground point between the feet, u the size unit, o the pose / face / hook options,
//   so move(), mood(), emote and hand hooks work on everyone. See paint-mv-animate/characters.md.
// Register a model sheet as LOOPS.cast and check the cast with
//   node render.mjs --loop=cast --sheet=0,1,2,3,4,5 --cols=3 --out=out/check/cast.jpg
