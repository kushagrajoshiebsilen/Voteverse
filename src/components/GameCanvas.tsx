import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Zone, NPC, InteractableObject } from '../game/types';
import { PLAYER_SIZE, INTERACT_RADIUS } from '../game/constants';

interface Props {
  state: GameState;
  zone: Zone;
  onInteract: (id: string, type: 'npc' | 'object') => void;
  onPlayerMove: (pos: { x: number; y: number }) => void;
  inputRef: React.MutableRefObject<Set<string>>;
  touchRef: React.MutableRefObject<{ dx: number; dy: number }>;
}

const PLAYER_COLORS: Record<string, string> = {
  hero_m: '#2ABFBF',
  hero_f: '#F5A623',
};

// ── Isometric Configuration ──
const ISO_ANGLE = Math.PI / 6;
const COS_A = Math.cos(ISO_ANGLE);
const SIN_A = Math.sin(ISO_ANGLE);

// Camera deadzone margins
const DEADZONE_W = 200;
const DEADZONE_H = 150;

// Centralized Coordinate Transform
const toIso = (x: number, y: number, camX: number, camY: number) => ({
  ix: (x - y) * COS_A - camX + 600,
  iy: (x + y) * SIN_A - camY + 350
});

// ── UI Helpers ───────────────────────────────────────────────

function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);
  R = Math.min(255, R); G = Math.min(255, G); B = Math.min(255, B);
  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');
  return "#" + RR + GG + BB;
}

// ── Stylized Building Engine ──────────────────────────────

function drawStylizedBuilding(ctx: CanvasRenderingContext2D, building: any, camX: number, camY: number) {
  const { rect, color, roofColor, label, type } = building;
  const w = rect.w;
  const d = rect.d || 100;
  const h = rect.h;

  const v0 = toIso(rect.x, rect.y, camX, camY);
  const v1 = toIso(rect.x + w, rect.y, camX, camY);
  const v2 = toIso(rect.x + w, rect.y + d, camX, camY);
  const v3 = toIso(rect.x, rect.y + d, camX, camY);

  ctx.save();

  // 1. Ground Shadow (Large blurred footprint)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.moveTo(v0.ix, v0.iy); ctx.lineTo(v1.ix, v1.iy);
  ctx.lineTo(v2.ix, v2.iy); ctx.lineTo(v3.ix, v3.iy);
  ctx.closePath(); ctx.fill();

  // 2. Structural Prisms
  const drawPrism = (x: number, y: number, pw: number, pd: number, ph: number, baseColor: string, isRoof = false) => {
    const b0 = toIso(x, y, camX, camY);
    const b1 = toIso(x + pw, y, camX, camY);
    const b2 = toIso(x + pw, y + pd, camX, camY);
    const b3 = toIso(x, y + pd, camX, camY);

    // Left Face
    ctx.fillStyle = shadeColor(baseColor, -30);
    ctx.beginPath();
    ctx.moveTo(b0.ix, b0.iy); ctx.lineTo(b3.ix, b3.iy);
    ctx.lineTo(b3.ix, b3.iy - ph); ctx.lineTo(b0.ix, b0.iy - ph);
    ctx.fill();

    // Front Face
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(b0.ix, b0.iy); ctx.lineTo(b1.ix, b1.iy);
    ctx.lineTo(b1.ix, b1.iy - ph); ctx.lineTo(b0.ix, b0.iy - ph);
    ctx.fill();

    // Top Face
    ctx.fillStyle = isRoof ? roofColor : shadeColor(baseColor, 15);
    ctx.beginPath();
    ctx.moveTo(b0.ix, b0.iy - ph); ctx.lineTo(b1.ix, b1.iy - ph);
    ctx.lineTo(b2.ix, b2.iy - ph); ctx.lineTo(b3.ix, b3.iy - ph);
    ctx.fill();

    // Accent lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Base Volume
  drawPrism(rect.x, rect.y, w, d, h, color, true);

  // Detail Passes based on Type
  if (label.includes("Chai")) {
    // Counter/Stall logic
    drawPrism(rect.x + 10, rect.y - 20, w - 20, 25, h * 0.4, '#B91C1C'); // Stall Counter
    // Hanging Sign
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(v1.ix - 10, v1.iy - h * 0.8, 40, 25);
    ctx.fillStyle = '#000'; ctx.font = '900 8px Orbitron'; ctx.fillText("CHAI", v1.ix - 2, v1.iy - h * 0.8 + 15);
  } else if (label.includes("Apartments") || label.includes("Home")) {
    // Steps/Entrance
    drawPrism(rect.x + w * 0.3, rect.y - 15, 40, 15, 8, '#475569');
    // Doorway recessed
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    const d0 = toIso(rect.x + w * 0.3, rect.y, camX, camY);
    ctx.rect(d0.ix + 5, d0.iy - h * 0.45, 30, h * 0.45);
    ctx.fill();
  }

  // Windows
  ctx.fillStyle = 'rgba(255, 240, 150, 0.2)';
  for (let wx = 30; wx < w - 30; wx += 60) {
    const wp = toIso(rect.x + wx, rect.y, camX, camY);
    ctx.fillRect(wp.ix, wp.iy - h * 0.7, 15, 25);
  }

  // Label (Locked to Facade)
  ctx.fillStyle = '#FFF';
  ctx.font = '900 12px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label.toUpperCase(), (v0.ix + v1.ix)/2, v0.iy - h * 0.85);

  ctx.restore();
}

// ── Character & Object Drawing ───────────────────────────────

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string, time: number, name: string,
  camX: number, camY: number,
  avatar: string = 'hero_m', isWalking: boolean = false
) {
  const { ix, iy } = toIso(x, y, camX, camY);
  const breathe = Math.sin(time * 0.003) * 1.5;
  const bob = isWalking ? Math.abs(Math.sin(time * 0.01)) * -8 : breathe;

  ctx.save();
  ctx.translate(ix, iy); 

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(0, bob);

  // Sprite Base
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(-10, -28, 20, 28, 6); ctx.fill(); // Body
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.roundRect(-9, -46, 18, 18, 10); ctx.fill(); // Head
  
  // Eyes
  const blink = Math.sin(time * 0.005) > 0.95;
  ctx.fillStyle = blink ? '#CBD5E0' : '#1A202C';
  ctx.fillRect(-5, -38, 3, blink ? 1 : 3);
  ctx.fillRect(2, -38, 3, blink ? 1 : 3);

  // Name Tag
  ctx.save();
  ctx.translate(0, -65);
  const tw = ctx.measureText(name.toUpperCase()).width + 12;
  ctx.fillStyle = 'rgba(10, 15, 25, 0.9)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-tw/2, -10, tw, 20, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.font = '900 9px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name.toUpperCase(), 0, 4);
  ctx.restore();

  ctx.restore();
}

function drawObject(ctx: CanvasRenderingContext2D, obj: any, time: number, isNearby: boolean, camX: number, camY: number) {
  const { ix, iy } = toIso(obj.pos.x + obj.size.x/2, obj.pos.y + obj.size.y/2, camX, camY);
  const pulse = Math.sin(time * 0.005) * 0.2;

  ctx.save();
  ctx.translate(ix, iy);
  ctx.fillStyle = '#4ade80';
  ctx.globalAlpha = 0.2 + pulse;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI * 2); ctx.fill();

  if (isNearby) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
    ctx.strokeStyle = '#4ade80';
    ctx.beginPath(); ctx.roundRect(-55, -55, 110, 22, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF';
    ctx.font = '900 9px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[E] ${obj.label.toUpperCase()}`, 0, -40);
  }
  ctx.restore();
}

function drawProp(ctx: CanvasRenderingContext2D, prop: any, time: number, camX: number, camY: number) {
  const { ix, iy } = toIso(prop.pos.x, prop.pos.y, camX, camY);
  ctx.save();
  ctx.translate(ix, iy);

  if (prop.type === 'tree') {
    ctx.fillStyle = '#2B1A12'; ctx.fillRect(-3, -10, 6, 12);
    const colors = ['#064E3B', '#065F46', '#047857'];
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      const bob = Math.sin(time * 0.002 + i) * 2;
      ctx.beginPath(); ctx.arc(0, -25 - i * 12 + bob, 18 - i * 3, 0, Math.PI * 2); ctx.fill();
    });
  } else if (prop.type === 'lamp') {
    ctx.fillStyle = '#334155'; ctx.fillRect(-2, -60, 4, 60);
    ctx.fillStyle = '#FDE68A'; ctx.beginPath(); ctx.arc(0, -60, 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 15; ctx.shadowColor = '#FDE68A'; ctx.stroke();
  }
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, camX: number, camY: number, W: number, H: number, role: string) {
  ctx.fillStyle = '#0B0E14';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;

  const gridSize = 80;
  const startX = Math.floor(camX / gridSize) - 10;
  const startY = Math.floor(camY / gridSize) - 10;

  for (let x = startX; x < startX + 30; x++) {
    const p1 = toIso(x * gridSize, -1000, camX, camY);
    const p2 = toIso(x * gridSize, 2000, camX, camY);
    ctx.beginPath(); ctx.moveTo(p1.ix, p1.iy); ctx.lineTo(p2.ix, p2.iy); ctx.stroke();
  }
  for (let y = startY; y < startY + 30; y++) {
    const p1 = toIso(-1000, y * gridSize, camX, camY);
    const p2 = toIso(2000, y * gridSize, camX, camY);
    ctx.beginPath(); ctx.moveTo(p1.ix, p1.iy); ctx.lineTo(p2.ix, p2.iy); ctx.stroke();
  }

  // Atmospheric Vignette
  const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
  const accent = role === 'guardian' ? 'rgba(0, 229, 255, 0.05)' : 'rgba(245, 166, 35, 0.05)';
  grad.addColorStop(0, accent);
  grad.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ── Main Component ────────────────────────────────────────────

export const GameCanvas: React.FC<Props> = ({ state, zone, onInteract, onPlayerMove, inputRef, touchRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const playerRef = useRef(state.player);
  const cameraRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => { playerRef.current = state.player; }, [state.player]);

  const getNearest = useCallback((px: number, py: number) => {
    let nearest: any = null;
    for (const npc of zone.npcs) {
      const dist = Math.hypot(px - npc.pos.x, py - npc.pos.y);
      if (dist < INTERACT_RADIUS && (!nearest || dist < nearest.dist)) nearest = { id: npc.id, type: 'npc', dist };
    }
    for (const obj of zone.objects) {
      if (!obj.isActive) continue;
      const dist = Math.hypot(px - (obj.pos.x + obj.size.x/2), py - (obj.pos.y + obj.size.y/2));
      if (dist < INTERACT_RADIUS && (!nearest || dist < nearest.dist)) nearest = { id: obj.id, type: 'object', dist };
    }
    return nearest;
  }, [zone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let animFrameId: number;

    const loop = (now: number) => {
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;
      timeRef.current += delta;

      const W = canvas.width;
      const H = canvas.height;
      const player = playerRef.current;
      const cam = cameraRef.current;

      // 1. Camera Logic (Smooth Follow + Deadzone + Clamping)
      const targetIso = {
        ix: (player.pos.x - player.pos.y) * COS_A,
        iy: (player.pos.x + player.pos.y) * SIN_A
      };

      const dx = targetIso.ix - cam.x;
      const dy = targetIso.iy - cam.y;

      // Soft deadzone check
      if (Math.abs(dx) > DEADZONE_W) cam.x += (dx - Math.sign(dx) * DEADZONE_W) * 0.1;
      if (Math.abs(dy) > DEADZONE_H) cam.y += (dy - Math.sign(dy) * DEADZONE_H) * 0.1;

      // World Clamping (Iso bounds)
      cam.x = Math.max(-800, Math.min(800, cam.x));
      cam.y = Math.max(-400, Math.min(400, cam.y));

      ctx.clearRect(0, 0, W, H);

      // 2. Render Pipeline
      drawGround(ctx, cam.x, cam.y, W, H, state.role);

      // Input Movement
      let pdx = 0, pdy = 0;
      if (state.phase === 'playing' || state.phase === 'dialogue') {
        const s = player.speed;
        const k = inputRef.current;
        const t = touchRef.current;
        if (k.has('ArrowLeft') || k.has('a') || k.has('A') || t.dx < -0.2) pdx -= s;
        if (k.has('ArrowRight') || k.has('d') || k.has('D') || t.dx > 0.2) pdx += s;
        if (k.has('ArrowUp') || k.has('w') || k.has('W') || t.dy < -0.2) pdy -= s;
        if (k.has('ArrowDown') || k.has('s') || k.has('S') || t.dy > 0.2) pdy += s;
      }
      const isMoving = Math.abs(pdx) > 0.1 || Math.abs(pdy) > 0.1;

      // Depth Sorted Render List
      const drawList: any[] = [];
      if (zone.props) zone.props.forEach(p => drawList.push({ y: p.pos.y, type: 'prop', data: p }));
      zone.buildings.forEach(b => drawList.push({ y: b.rect.y + (b.rect.d || 100), type: 'building', data: b }));
      zone.npcs.forEach(n => drawList.push({ y: n.pos.y, type: 'npc', data: n }));
      zone.objects.forEach(o => o.isActive && drawList.push({ y: o.pos.y + o.size.y, type: 'object', data: o }));
      drawList.push({ y: player.pos.y, type: 'player', data: player });

      drawList.sort((a, b) => a.y - b.y);

      drawList.forEach(item => {
        switch (item.type) {
          case 'prop': drawProp(ctx, item.data, timeRef.current, cam.x, cam.y); break;
          case 'building': drawStylizedBuilding(ctx, item.data, cam.x, cam.y); break;
          case 'npc': 
            drawCharacter(ctx, item.data.pos.x, item.data.pos.y, item.data.color, timeRef.current, item.data.name, cam.x, cam.y, item.data.avatar, item.data.isMoving);
            break;
          case 'object': 
            const dist = Math.hypot(player.pos.x - (item.data.pos.x + item.data.size.x/2), player.pos.y - (item.data.pos.y + item.data.size.y/2));
            drawObject(ctx, item.data, timeRef.current, dist < INTERACT_RADIUS, cam.x, cam.y); 
            break;
          case 'player': 
            drawCharacter(ctx, item.data.pos.x, item.data.pos.y, PLAYER_COLORS[item.data.avatar] || '#2ABFBF', timeRef.current, item.data.name, cam.x, cam.y, item.data.avatar, isMoving);
            break;
        }
      });

      if (state.phase === 'playing' && (pdx !== 0 || pdy !== 0)) {
        onPlayerMove({ 
          x: Math.max(50, Math.min(1150, player.pos.x + pdx)),
          y: Math.max(150, Math.min(650, player.pos.y + pdy))
        });
      }

      animFrameId = requestAnimationFrame(loop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E' || e.key === ' ') && state.phase === 'playing') {
        const nearest = getNearest(playerRef.current.pos.x, playerRef.current.pos.y);
        if (nearest) onInteract(nearest.id, nearest.type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    animFrameId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zone, state.phase, state.role, onInteract, onPlayerMove, getNearest, inputRef, touchRef]);

  return <canvas ref={canvasRef} width={1200} height={700} className="w-full h-full" />;
};
