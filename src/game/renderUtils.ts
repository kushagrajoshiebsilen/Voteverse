import type { Vec2 } from './types';

/**
 * Utility functions for rendering isometric shapes and entities on HTML5 Canvas.
 * Designed for the "VoteVerse" tactical command interface.
 */

/**
 * Isometric Projection Constants
 */
export const ISO_CONFIG = {
  TILE_W: 64,
  TILE_H: 32,
  ORIGIN_X: 600,
  ORIGIN_Y: 200,
};

/**
 * Converts 2D grid coordinates to Isometric screen coordinates.
 */
export function toIso(x: number, y: number, z: number = 0): Vec2 {
  return {
    x: ISO_CONFIG.ORIGIN_X + (x - y),
    y: ISO_CONFIG.ORIGIN_Y + (x + y) / 2 - z,
  };
}

/**
 * Draws a filled polygon on the canvas.
 */
export function drawPoly(ctx: CanvasRenderingContext2D, points: Vec2[], fill: string, stroke: string, lineWidth: number = 1.5) {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

/**
 * Draws an isometric building wall.
 */
export function drawBuildingWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, z: number, isRight: boolean, color: string = '#354052', outline: string = '#4A5568') {
  const p1 = toIso(x, y, 0);
  const p2 = isRight ? toIso(x, y + h, 0) : toIso(x + w, y, 0);
  const p3 = isRight ? toIso(x, y + h, z) : toIso(x + w, y, z);
  const p4 = toIso(x, y, z);

  drawPoly(ctx, [p1, p2, p3, p4], color, outline);
}

/**
 * Draws an isometric desk object.
 */
export function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const floor = toIso(x, y, 0);
  const top = [toIso(x, y, 20), toIso(x + 40, y, 20), toIso(x + 40, y + 25, 20), toIso(x, y + 25, 20)];
  
  // Legs
  ctx.strokeStyle = '#4A5568';
  ctx.lineWidth = 2;
  [ [0,0], [40,0], [40,25], [0,25] ].forEach(offset => {
    const pBase = toIso(x + offset[0], y + offset[1], 0);
    const pTop = toIso(x + offset[0], y + offset[1], 20);
    ctx.beginPath(); ctx.moveTo(pBase.x, pBase.y); ctx.lineTo(pTop.x, pTop.y); ctx.stroke();
  });
  
  drawPoly(ctx, top, '#2D3748', '#4A5568');
}

/**
 * Draws an isometric bench object.
 */
export function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const top = [toIso(x, y, 12), toIso(x + 60, y, 12), toIso(x + 60, y + 15, 12), toIso(x, y + 15, 12)];
  drawPoly(ctx, top, '#3A485A', '#4A5568');
  [ [5,2], [55,2], [55,13], [5,13] ].forEach(offset => {
    const pB = toIso(x + offset[0], y + offset[1], 0);
    const pT = toIso(x + offset[0], y + offset[1], 12);
    ctx.beginPath(); ctx.moveTo(pB.x, pB.y); ctx.lineTo(pT.x, pT.y); ctx.strokeStyle='#2D3748'; ctx.stroke();
  });
}

/**
 * Draws a potted plant decoration.
 */
export function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const p = toIso(x, y, 0);
  ctx.fillStyle = '#4A3728'; // Pot
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#68A096'; // Leaves
  ctx.beginPath(); ctx.arc(p.x, p.y - 12, 10, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.stroke();
}

/**
 * Draws a flagpole with a tactical banner.
 */
export function drawFlagPole(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const base = toIso(x, y, 0);
  const tip = toIso(x, y, 100);
  ctx.strokeStyle = '#CBD5E0'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();
  ctx.fillStyle = '#F3B760';
  ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(tip.x + 30, tip.y + 10); ctx.lineTo(tip.x, tip.y + 20); ctx.fill();
}
