import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { GameState, Zone } from '../game/types';
import { INTERACT_RADIUS } from '../game/constants';

interface Props {
  state: GameState;
  zone: Zone;
  onInteract: (id: string, type: 'npc' | 'object') => void;
  onPlayerMove: (pos: { x: number; y: number }, z: number) => void;
  inputRef: React.MutableRefObject<Set<string>>;
  touchRef: React.MutableRefObject<{ dx: number; dy: number }>;
}

const ISO_ANGLE = Math.PI / 6;
const COS = Math.cos(ISO_ANGLE);
const SIN = Math.sin(ISO_ANGLE);

// Flat isometric projection
const toIso = (x: number, y: number, z: number = 0) => ({
  x: (x - y) * COS + 600,
  y: (x + y) * SIN - z + 250,
});

// Style constants from reference
const C = {
  ground: '#698784',
  path: '#7D9A98',
  wallExt: '#354052',
  wallTop: '#212936',
  wallInt: '#526175',
  floor: '#869A9E',
  outline: '#151A22',
  wood: '#C5905E',
  woodDark: '#9E6E42',
  plant: '#649E94',
  accent: '#F3B760',
  labelBg: '#212936',
  labelText: '#A0ADC0',
};

// --- Drawing Helpers ---

function drawPoly(ctx: CanvasRenderingContext2D, points: {x:number, y:number}[], fill: string, stroke = C.outline) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function drawIsoBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, d: number, h: number, colors: { top: string, left: string, right: string }) {
  const p0 = toIso(x, y, 0);
  const p1 = toIso(x + w, y, 0);
  const p2 = toIso(x + w, y + d, 0);
  const p3 = toIso(x, y + d, 0);
  
  const t0 = toIso(x, y, h);
  const t1 = toIso(x + w, y, h);
  const t2 = toIso(x + w, y + d, h);
  const t3 = toIso(x, y + d, h);

  drawPoly(ctx, [p3, p2, t2, t3], colors.left);
  drawPoly(ctx, [p0, p3, t3, t0], colors.right);
  drawPoly(ctx, [t0, t1, t2, t3], colors.top);
}

function drawBuildingWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, d: number, h: number, isVertical: boolean) {
  const th = 10;
  if (isVertical) {
    drawIsoBlock(ctx, x, y, th, d, h, { top: C.wallTop, left: C.wallExt, right: C.wallInt });
  } else {
    drawIsoBlock(ctx, x, y, w, th, h, { top: C.wallTop, left: C.wallInt, right: C.wallExt });
  }
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawIsoBlock(ctx, x, y, 60, 20, 25, { top: C.wood, left: C.woodDark, right: C.woodDark });
  drawIsoBlock(ctx, x + 10, y + 5, 10, 10, 15, { top: '#444', left: '#222', right: '#333' });
}

function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawIsoBlock(ctx, x, y, 40, 15, 10, { top: C.wood, left: C.woodDark, right: C.woodDark });
  drawIsoBlock(ctx, x, y, 40, 4, 25, { top: C.wood, left: C.woodDark, right: C.woodDark });
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawIsoBlock(ctx, x, y, 15, 15, 15, { top: '#A56A4B', left: '#824E34', right: '#824E34' });
  const p = toIso(x + 7.5, y + 7.5, 25);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = C.plant; ctx.fill();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = '#E2A981', suit: string = '#4A5568', isNearest = false, dir = 'down', moving = false, t = 0) {
  const p = toIso(x, y, 0);
  
  // Ambient idle or walk cycle
  const speed = moving ? 0.015 : 0.003;
  const amp = moving ? 2 : 0.5;
  const bob = Math.sin(t * speed) * amp;
  
  // Shadow pulses slightly
  const shadowScale = 1 + (bob * 0.1);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 * shadowScale, 4 * shadowScale, 0, 0, Math.PI*2); ctx.fill();

  if (isNearest) {
    // Pulse highlight
    const pulse = 1 + Math.sin(t * 0.005) * 0.2;
    ctx.strokeStyle = `rgba(243, 183, 96, ${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 16 * pulse, 8 * pulse, 0, 0, Math.PI*2); ctx.stroke();
    drawLabel(ctx, x, y, "[ E ] INTERACT", 60 + bob, C.accent);
  }

  // Legs animation
  let lLegY = 0, rLegY = 0;
  if (moving) {
    lLegY = Math.sin(t * speed) * 3;
    rLegY = -Math.sin(t * speed) * 3;
  }
  ctx.fillStyle = '#2D3748'; 
  ctx.fillRect(p.x - 4, p.y - 12 + lLegY, 3, 12 - lLegY); 
  ctx.fillRect(p.x + 1, p.y - 12 + rLegY, 3, 12 - rLegY);
  
  // Body
  ctx.fillStyle = suit;
  ctx.beginPath(); ctx.roundRect(p.x - 6, p.y - 28 + bob, 12, 16, 3); ctx.fill();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1; ctx.stroke();
  
  // Head
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(p.x, p.y - 34 + bob, 6, 0, Math.PI*2); ctx.fill();
  ctx.stroke();

  // Face direction indicator (visor/eyes)
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  if (dir === 'down') ctx.fillRect(p.x - 4, p.y - 36 + bob, 4, 2);
  else if (dir === 'right') ctx.fillRect(p.x + 1, p.y - 36 + bob, 4, 2);
  else if (dir === 'left') ctx.fillRect(p.x - 6, p.y - 37 + bob, 2, 2);
  // 'up' faces away
}

function drawKioskLight(ctx: CanvasRenderingContext2D, x: number, y: number, z: number, t: number) {
  const p = toIso(x, y, z);
  const glow = Math.abs(Math.sin(t * 0.003));
  ctx.fillStyle = `rgba(100, 158, 148, ${0.4 + glow * 0.6})`;
  ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `rgba(100, 158, 148, ${0.1 + glow * 0.2})`;
  ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI*2); ctx.fill();
}

function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, z: number = 80, textColor = C.labelText) {
  const p = toIso(x, y, z);
  ctx.font = '600 10px Inter, sans-serif';
  const width = ctx.measureText(text).width + 12;
  
  ctx.fillStyle = C.labelBg;
  ctx.strokeStyle = C.outline;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(p.x - width/2, p.y - 10, width, 20, 4); 
  ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, p.x, p.y + 1);
}

function drawFlagPole(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawIsoBlock(ctx, x-10, y-10, 20, 20, 5, { top: '#888', left: '#666', right: '#777' });
  const bottom = toIso(x, y, 5);
  const top = toIso(x, y, 100);
  ctx.beginPath(); ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(top.x, top.y);
  ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(top.x + 30, top.y + 10); ctx.lineTo(top.x, top.y + 25);
  ctx.fillStyle = '#4B5E72'; ctx.fill();
  ctx.stroke();
}

// --- Main Render ---

export const GameCanvas: React.FC<Props> = ({ state, zone, onInteract, inputRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Local mutable state for smooth movement
  const pos = useRef({ x: 220, y: 160 }); // Start in civic plaza
  const dir = useRef('down');
  const moving = useRef(false);
  const nearestRef = useRef<{ id: string, type: 'npc'|'object' } | null>(null);

  const C_ZONE = {
    ...C,
    ground: zone.bgColor || C.ground,
    accent: zone.accentColor || C.accent,
  };

  const getNearest = useCallback((px: number, py: number) => {
    let nearest: any = null;
    for (const n of zone.npcs) {
      const d = Math.hypot(px-n.pos.x, py-n.pos.y);
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist))
        nearest = { id:n.id, type:'npc', dist:d };
    }
    for (const o of zone.objects) {
      if (!o.isActive) continue;
      const d = Math.hypot(px-o.pos.x, py-o.pos.y);
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist))
        nearest = { id:o.id, type:'object', dist:d };
    }
    return nearest;
  }, [zone]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && nearestRef.current) {
        onInteract(nearestRef.current.id, nearestRef.current.type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInteract]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    let raf: number;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(now - last, 50); last = now;
      
      // Update Player
      if (state.phase === 'playing') {
        const s = 3.5;
        const k = inputRef.current;
        let dx = 0, dy = 0;
        if (k.has('ArrowLeft') || k.has('a') || k.has('A')) dx -= s;
        if (k.has('ArrowRight') || k.has('d') || k.has('D')) dx += s;
        if (k.has('ArrowUp') || k.has('w') || k.has('W')) dy -= s;
        if (k.has('ArrowDown') || k.has('s') || k.has('S')) dy += s;

        if (dx !== 0 || dy !== 0) {
          moving.current = true;
          if (Math.abs(dx) > Math.abs(dy)) {
            dir.current = dx > 0 ? 'right' : 'left';
          } else {
            dir.current = dy > 0 ? 'down' : 'up';
          }
          pos.current.x += dx;
          pos.current.y += dy;
        } else {
          moving.current = false;
        }

        // Map Boundary Clamping
        pos.current.x = Math.max(-80, Math.min(580, pos.current.x));
        pos.current.y = Math.max(-130, Math.min(480, pos.current.y));
      }

      const nearest = getNearest(pos.current.x, pos.current.y);
      nearestRef.current = nearest;

      // Clear
      ctx.fillStyle = C_ZONE.ground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Paths
      const path1 = [toIso(-100, 100, 0), toIso(500, 100, 0), toIso(500, 150, 0), toIso(-100, 150, 0)];
      const path2 = [toIso(200, -100, 0), toIso(250, -100, 0), toIso(250, 500, 0), toIso(200, 500, 0)];
      drawPoly(ctx, path1, C.path, '');
      drawPoly(ctx, path2, C.path, '');
      drawPoly(ctx, [toIso(150,50), toIso(300,50), toIso(300,200), toIso(150,200)], C.path, '');

      // --- BUILDING 1: REGISTRATION OFFICE ---
      drawPoly(ctx, [toIso(-50,-100), toIso(150,-100), toIso(150,50), toIso(-50,50)], C.floor, C.outline);
      drawBuildingWall(ctx, -50, -100, 200, 10, 80, false);
      drawBuildingWall(ctx, -50, -100, 10, 150, 80, true);
      drawDesk(ctx, 20, -50);
      drawBench(ctx, 0, 10);
      drawPlant(ctx, 130, -80);
      drawPlant(ctx, 130, 30);
      drawBuildingWall(ctx, 150, -100, 10, 50, 80, true);
      drawBuildingWall(ctx, -50, 50, 80, 10, 80, false);
      drawLabel(ctx, 50, -50, "REGISTRATION OFFICE");

      // --- BUILDING 2: INFO KIOSK ---
      drawPoly(ctx, [toIso(180,-150), toIso(320,-150), toIso(320,-20), toIso(180,-20)], C.floor, C.outline);
      drawBuildingWall(ctx, 180, -150, 140, 10, 80, false);
      drawBuildingWall(ctx, 180, -150, 10, 130, 80, true);
      drawDesk(ctx, 220, -100);
      drawBuildingWall(ctx, 320, -150, 10, 130, 80, true);
      drawBuildingWall(ctx, 180, -20, 50, 10, 80, false);
      drawLabel(ctx, 250, -100, "INFO KIOSK - AVAILABLE");

      // --- BUILDING 3: VOTING CENTER ---
      drawPoly(ctx, [toIso(350,-150), toIso(600,-150), toIso(600,80), toIso(350,80)], C.floor, C.outline);
      drawBuildingWall(ctx, 350, -150, 250, 10, 100, false);
      drawBuildingWall(ctx, 350, -150, 10, 230, 100, true);
      drawDesk(ctx, 400, -80);
      drawDesk(ctx, 500, -20);
      drawBuildingWall(ctx, 600, -150, 10, 230, 100, true);
      drawBuildingWall(ctx, 350, 80, 100, 10, 100, false);
      drawLabel(ctx, 475, -50, "VOTING CENTER", 120);
      drawKioskLight(ctx, 420, -50, 25, now);
      drawKioskLight(ctx, 520, 10, 25, now + 1000);

      // --- BUILDING 4: POLLING STATIONS ---
      drawPoly(ctx, [toIso(350,120), toIso(550,120), toIso(550,250), toIso(350,250)], C.floor, C.outline);
      drawBuildingWall(ctx, 350, 120, 200, 10, 60, false);
      drawBuildingWall(ctx, 350, 120, 10, 130, 60, true);
      drawBuildingWall(ctx, 550, 120, 10, 130, 60, true);
      drawBuildingWall(ctx, 350, 250, 80, 10, 60, false);
      drawLabel(ctx, 450, 150, "POLLING STATIONS", 90);

      // --- CIVIC PLAZA ---
      drawFlagPole(ctx, 225, 125);
      drawBench(ctx, 180, 70);
      drawBench(ctx, 260, 170);
      drawLabel(ctx, 225, 125, "CIVIC PLAZA", 30);

      // --- DYNAMIC NPCs & Player ---
      // We render them according to painter's algorithm by Y value
      const entities = [];
      zone.npcs.forEach(n => entities.push({ y: n.pos.y, type: 'npc', data: n }));
      entities.push({ y: pos.current.y, type: 'player', data: pos.current });
      
      entities.sort((a,b) => a.y - b.y);

      entities.forEach(ent => {
        if (ent.type === 'npc') {
          const n = ent.data;
          const isNear = nearest?.id === n.id;
          // NPCs get a slight random offset to their animation phase based on their X coordinate
          drawCharacter(ctx, n.pos.x, n.pos.y, n.color, '#3A485A', isNear, n.dir, false, now + n.pos.x * 10);
        } else {
          // Player
          const pColor = state.player.avatar === 'hero_m' ? C_ZONE.accent : '#FCD34D';
          drawCharacter(ctx, pos.current.x, pos.current.y, pColor, '#223040', false, dir.current, moving.current, now);
        }
      });

      // Objects highlight
      zone.objects.forEach(o => {
        if (nearest?.id === o.id) {
          drawLabel(ctx, o.pos.x, o.pos.y, `[ E ] ${o.label}`, 50, C_ZONE.accent);
        }
      });

    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.phase, getNearest, zone]);

  return <canvas ref={canvasRef} width={1200} height={800} style={{ width: '100%', height: '100%' }} />;
};
