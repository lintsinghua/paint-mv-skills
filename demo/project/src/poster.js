// Cover still for the README / MP4 thumbnail: render with node render.mjs --loop=poster --stills=0.4
LOOPS.poster = t => {
  camBegin(960, 560, 1.06);
  const L = streetBack(t, {});
  const ZS = [[690, 720, 2], [720, 610, 2.4], [775, 505, 2.7], [900, 425, 2.3], [1030, 505, 2.7], [1085, 610, 2.4], [1115, 720, 2]];
  ZS.forEach(([x, y, u], i) => ziling(x, y + 8 * Math.sin(t * 3 + i), u * 9, { seed: i, glyph: i % 5, eyes: i % 3 ? 'happy' : 'normal', mouth: 'smile', blush: true, rot: .12 * Math.sin(i * 1.7) }));
  dengdeng(L.light[0], L.light[1], 26, { light: 'green', eyes: 'happy', mouth: 'grin', blush: true, aR: .7, aL: -.2 });
  xiaoye(900, 800, 30, { eyes: 'happy', mouth: 'grin', blush: true, glow: .25, aL: .9, aR: -.2, lookX: -.3 });
  camEnd();
  letter('凌晨录音室', W / 2, 190, 168, '#FFF1C8', { stroke: PAL.ink, rot: -.03, screen: true });
  letter('Midnight Studio', W / 2, 318, 54, '#3FC1C9', { stroke: PAL.ink, rot: -.03, screen: true });
};
LOOPS.poster.len = 1;
