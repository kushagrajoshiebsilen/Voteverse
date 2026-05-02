import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Zone } from '../game/types';
import { INTERACT_RADIUS } from '../game/constants';
import { toIso, drawPoly, drawBuildingWall, drawDesk, drawBench, drawPlant, drawFlagPole } from '../game/renderUtils';

interface Props {
  state: GameState;
  zone: Zone;
  onInteract: (id: string, type: 'npc' | 'object') => void;
  onPlayerMove: (pos: { x: number; y: number }, z: number) => void;
  inputRef: React.MutableRefObject<Set<string>>;
  touchRef: React.MutableRefObject<{ dx: number; dy: number }>;
}

/**
 * Styling constants for the canvas world.
 */
const C = {
  path: '#3F4E5F',
  floor: '#2D3748',
  outline: '#151A22',
  accent: '#F3B760',
  labelText: '#CBD5E0',
  plant: '#68A096',
  ground: '#698784',
};

/**
 * Renders a character (Player or NPC) with a bobbing animation and direction indicator.
 */
function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = '#E2A981', suit: string = '#4A5568', isNearest = false, dir = 'down', moving = false, t = 0) {
  const p = toIso(x, y, 0);
  
  const speed = moving ? 0.015 : 0.003;
  const amp = moving ? 2 : 0.5;
  const bob = Math.sin(t * speed) * amp;
  
  // Shadow
  const shadowScale = 1 + (bob * 0.1);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 8 * shadowScale, 4 * shadowScale, 0, 0, Math.PI*2); ctx.fill();

  if (isNearest) {
    const pulse = 1 + Math.sin(t * 0.005) * 0.2;
    ctx.strokeStyle = `rgba(243, 183, 96, ${0.5 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(p.x, p.y, 16 * pulse, 8 * pulse, 0, 0, Math.PI*2); ctx.stroke();
    drawLabel(ctx, x, y, "[ E ] INTERACT", 60 + bob, C.accent);
  }

  // Legs
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

  // Visor
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  if (dir === 'down') ctx.fillRect(p.x - 4, p.y - 36 + bob, 4, 2);
  else if (dir === 'right') ctx.fillRect(p.x + 1, p.y - 36 + bob, 4, 2);
  else if (dir === 'left') ctx.fillRect(p.x - 6, p.y - 37 + bob, 2, 2);
}

/**
 * Draws a tactical label in world space.
 */
function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, z: number = 80, textColor = C.labelText) {
  const p = toIso(x, y, z);
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, p.x, p.y);
}

/**
 * Main game canvas component.
 */
export const GameCanvas: React.FC<Props> = ({ state, zone, onInteract, onPlayerMove, inputRef, touchRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef(state.player);

  useEffect(() => { playerRef.current = state.player; }, [state.player]);

  const getNearest = useCallback(() => {
    const p = playerRef.current.pos;
    let nearest: { id: string; type: 'npc' | 'object'; dist: number } | null = null;
    let minDist = INTERACT_RADIUS;

    zone.npcs.forEach(n => {
      const d = Math.hypot(n.pos.x - p.x, n.pos.y - p.y);
      if (d < minDist) { minDist = d; nearest = { id: n.id, type: 'npc', dist: d }; }
    });
    zone.objects.forEach(o => {
      if (!o.isActive) return;
      const d = Math.hypot(o.pos.x - p.x, o.pos.y - p.y);
      if (d < minDist) { minDist = d; nearest = { id: o.id, type: 'object', dist: d }; }
    });
    return nearest;
  }, [zone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let lastT = performance.now();

    const loop = (t: number) => {
      const dt = t - lastT;
      lastT = t;

      if (state.phase === 'playing') {
        const input = inputRef.current;
        const touch = touchRef.current;
        let dx = 0, dy = 0;
        if (input.has('ArrowUp') || input.has('w')) dy -= 1;
        if (input.has('ArrowDown') || input.has('s')) dy += 1;
        if (input.has('ArrowLeft') || input.has('a')) dx -= 1;
        if (input.has('ArrowRight') || input.has('d')) dx += 1;

        if (touch.dx !== 0 || touch.dy !== 0) { dx = touch.dx; dy = touch.dy; }

        if (dx !== 0 || dy !== 0) {
          const speed = 0.15 * dt;
          const mag = Math.hypot(dx, dy);
          const nx = playerRef.current.pos.x + (dx / mag) * speed;
          const ny = playerRef.current.pos.y + (dy / mag) * speed;
          
          // Clamp to boundaries
          const cx = Math.max(-450, Math.min(450, nx));
          const cy = Math.max(-450, Math.min(450, ny));
          onPlayerMove({ x: cx, y: cy }, 0);
        }

        if (input.has('e') || input.has('E')) {
          const n = getNearest();
          if (n) {
            onInteract(n.id, n.type);
            input.delete('e'); input.delete('E');
          }
        }
      }

      // Render
      const C_ZONE = { ...C, ground: zone.bgColor || C.ground, accent: zone.accentColor || C.accent };
      ctx.fillStyle = C_ZONE.ground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor
      const f1 = toIso(-500, -500), f2 = toIso(500, -500), f3 = toIso(500, 500), f4 = toIso(-500, 500);
      drawPoly(ctx, [f1, f2, f3, f4], C_ZONE.ground, C_ZONE.outline);
      
      // Grid
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 1;
      for(let i=-500; i<=500; i+=100) {
        const s1 = toIso(i, -500), e1 = toIso(i, 500);
        ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(e1.x, e1.y); ctx.stroke();
        const s2 = toIso(-500, i), e2 = toIso(500, i);
        ctx.beginPath(); ctx.moveTo(s2.x, s2.y); ctx.lineTo(e2.x, e2.y); ctx.stroke();
      }

      // Entities
      const nearest = getNearest();
      zone.props.forEach(p => {
        if(p.type === 'bench') drawBench(ctx, p.pos.x, p.pos.y);
        if(p.type === 'flower_pot') drawPlant(ctx, p.pos.x, p.pos.y);
        if(p.type === 'lamp') drawFlagPole(ctx, p.pos.x, p.pos.y);
      });

      zone.npcs.forEach(n => {
        drawCharacter(ctx, n.pos.x, n.pos.y, n.color, '#3A485A', nearest?.id === n.id, n.dir, false, t);
        drawLabel(ctx, n.pos.x, n.pos.y, n.name, 50);
      });

      zone.objects.forEach(o => {
        if (!o.isActive) return;
        drawDesk(ctx, o.pos.x, o.pos.y);
        drawLabel(ctx, o.pos.x, o.pos.y, o.label, 40);
      });

      const p = playerRef.current;
      const isMoving = dx !== 0 || dy !== 0;
      drawCharacter(ctx, p.pos.x, p.pos.y, '#F3B760', '#2D3748', false, p.dir, isMoving, t);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.phase, getNearest, zone, onInteract, onPlayerMove, inputRef, touchRef]);

  return <canvas ref={canvasRef} aria-label={`Tactical view of ${zone.name}`} role="application" tabIndex={0} width={1200} height={800} style={{ width: '100%', height: '100%', outline: 'none' }} />;
};
