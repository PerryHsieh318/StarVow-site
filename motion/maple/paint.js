import {noise} from "../galaxy.js";

export const TAU = Math.PI * 2;
export function wave(t) { return .5 + .5 * Math.sin(t); }
export function envelope(u) { return Math.sin(Math.PI * u) ** 2; }

// Shift the texture coordinates a strip at a time. The silhouette and the painted
// highlights travel at different scales, even while the emitter is stationary.
export function flowTexture(ctx, image, x, y, width, height, time, strength, steps) {
  if (!image.complete || !image.naturalWidth) return;
  for (let i = 0; i < steps; i++) {
    const u = (i + .5) / steps;
    const warp = noise(4 * u - time * .55, time * .17);
    const detail = noise(11 * u + warp * 2, time * .38);
    const offset = strength * ((warp - .5) * 1.5 + (detail - .5) * .6);
    const stretch = strength * Math.sin(u * 8 - time) * .65;
    const sx = Math.floor(image.width * i / steps);
    const ex = Math.floor(image.width * (i + 1) / steps);
    ctx.drawImage(image, sx, 0, ex - sx, image.height,
      x + sx / image.width * width, y + offset - stretch / 2,
      (ex - sx) / image.width * width + .07, height + stretch);
  }
}

export function glint(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x,y-size); ctx.quadraticCurveTo(x,y-.1*size,x+.62*size,y);
  ctx.quadraticCurveTo(x,y+.1*size,x,y+size);
  ctx.quadraticCurveTo(x,y+.1*size,x-.62*size,y);
  ctx.quadraticCurveTo(x,y-.1*size,x,y-size); ctx.fill();
}

// A bright head, narrow middle and pointed tail give the dart a direction.
export function dart(ctx, x, y, length, radius, angle, edge, core) {
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  const fill = ctx.createLinearGradient(-length,0,0,0);
  fill.addColorStop(0,"transparent"); fill.addColorStop(.55,edge); fill.addColorStop(1,core);
  ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(-length,0);
  ctx.quadraticCurveTo(-radius*2,-radius*1.8,0,0);
  ctx.quadraticCurveTo(-radius*2,radius*1.8,-length,0); ctx.fill(); ctx.restore();
}
