import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Zone, NPC, InteractableObject } from '../game/types';
import { PLAYER_SIZE, INTERACT_RADIUS } from '../game/constants';

interface Props {
  state: GameState;
  zone: Zone;
  onInteract: (id: string, type: 'npc' | 'object') => void;
  onPlayerMove: (pos: { x: number; y: number }, z: number) => void;
  inputRef: React.MutableRefObject<Set<string>>;
  touchRef: React.MutableRefObject<{ dx: number; dy: number }>;
}

const PLAYER_COLORS: Record<string, string> = {
  hero_m: '#2ABFBF',
  hero_f: '#F5A623',
};

const ISO_ANGLE = Math.PI / 6;
const COS_A = Math.cos(ISO_ANGLE);
const SIN_A = Math.sin(ISO_ANGLE);
const DEADZONE_W = 200;
const DEADZONE_H = 150;

const toIso = (x: number, y: number, camX: number, camY: number) => ({
  ix: (x - y) * COS_A - camX + 600,
  iy: (x + y) * SIN_A - camY + 350
});

function drawLightBloom(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number, camX: number, camY: number) {
  const { ix, iy } = toIso(x, y, camX, camY);
  const grad = ctx.createRadialGradient(ix, iy, 0, ix, iy, radius);
  grad.addColorStop(0, color + '66');
  grad.addColorStop(0.5, color + '22');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(ix, iy, radius, 0, Math.PI * 2); ctx.fill();
}

function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);
  R = Math.floor(R * (100 + percent) / 100);
  G = Math.floor(G * (100 + percent) / 100);
  B = Math.floor(B * (100 + percent) / 100);
  R = Math.min(255, R); G = Math.min(255, G); B = Math.min(255, B);
  return "#" + R.toString(16).padStart(2, '0') + G.toString(16).padStart(2, '0') + B.toString(16).padStart(2, '0');
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, z: number,
  color: string, time: number, name: string,
  role: string,
  camX: number, camY: number,
  isWalking: boolean = false
) {
  const { ix, iy } = toIso(x, y, camX, camY);
  const seed = (x * 7 + y * 13) % 1000;
  const breathe = Math.sin((time + seed) * 0.002) * 1.5;
  const sway = isWalking ? 0 : Math.sin((time + seed) * 0.001) * 2;
  const bob = isWalking ? Math.abs(Math.sin(time * 0.015)) * -8 : breathe;

  ctx.save();
  ctx.translate(ix, iy - z);
  ctx.rotate(sway * Math.PI / 180);

  // Shadow (on ground)
  ctx.save();
  ctx.translate(0, z);
  const shadowS = Math.max(0.4, 1 - (z / 150));
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, 0, 18 * shadowS, 9 * shadowS, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  ctx.translate(0, bob);

  // Limbs Logic
  const swing = isWalking ? Math.sin(time * 0.015) : 0;
  const armSwing = isWalking ? Math.sin(time * 0.015) * 12 : breathe * 3;

  // Legs (Darker)
  ctx.fillStyle = shadeColor(color, -25);
  // Left Leg
  ctx.beginPath(); ctx.roundRect(-8, -4, 6, isWalking ? 6 + swing * 4 : 6, 2); ctx.fill();
  // Right Leg
  ctx.beginPath(); ctx.roundRect(2, -4, 6, isWalking ? 6 - swing * 4 : 6, 2); ctx.fill();

  // Torso
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(-11, -30, 22, 28, 8); ctx.fill();

  // Arms
  ctx.fillStyle = color;
  // Left Arm
  ctx.save(); ctx.translate(-13, -22 + armSwing); ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  // Right Arm
  ctx.save(); ctx.translate(13, -22 - armSwing); ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  // Head
  const isOfficer = role.includes('Officer') || role.includes('ERO');
  ctx.fillStyle = isOfficer ? '#E2E8F0' : '#F8FAFC';
  ctx.beginPath(); ctx.roundRect(-10, -48, 20, 20, 10); ctx.fill();

  if (isOfficer) {
    // Add Officer Cap / Badge hint
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-10, -52, 20, 6);
    ctx.fillStyle = '#FCD34D';
    ctx.fillRect(-2, -50, 4, 3);
  }

  // Face
  const blink = Math.sin(time * 0.005) > 0.96;
  ctx.fillStyle = blink ? '#CBD5E0' : '#1A202C';
  ctx.fillRect(-5, -40, 3, blink ? 1 : 3);
  ctx.fillRect(3, -40, 3, blink ? 1 : 3);

  // Label
  ctx.save();
  ctx.translate(0, -70);
  const tw = ctx.measureText(name.toUpperCase()).width + 12;
  ctx.fillStyle = 'rgba(10,15,25,0.9)';
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.roundRect(-tw/2, -10, tw, 20, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FFF';
  ctx.font = '900 9px Orbitron'; ctx.textAlign='center'; ctx.fillText(name.toUpperCase(), 0, 4);
  ctx.restore();

  ctx.restore();
}

function drawStylizedBuilding(ctx: CanvasRenderingContext2D, building: any, camX: number, camY: number) {
  const { rect, color, roofColor, label, style } = building;
  const v0 = toIso(rect.x, rect.y, camX, camY);
  const v1 = toIso(rect.x + rect.w, rect.y, camX, camY);
  const v2 = toIso(rect.x + rect.w, rect.y + rect.d, camX, camY);
  const v3 = toIso(rect.x, rect.y + rect.d, camX, camY);
  const h = rect.h;

  ctx.save();
  // ── Civic Base / Shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.moveTo(v0.ix, v0.iy); ctx.lineTo(v1.ix, v1.iy); ctx.lineTo(v2.ix, v2.iy); ctx.lineTo(v3.ix, v3.iy); ctx.fill();

  const drawFace = (p1: any, p2: any, ph: number, c: string, isFront = false) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(p1.ix, p1.iy); ctx.lineTo(p2.ix, p2.iy);
    ctx.lineTo(p2.ix, p2.iy - ph); ctx.lineTo(p1.ix, p1.iy - ph);
    ctx.fill();

    if (isFront && style === 'office') {
      // Add Windows
      ctx.fillStyle = 'rgba(176, 224, 230, 0.4)';
      for (let i = 0.1; i < 0.9; i += 0.2) {
        const wx = p1.ix + (p2.ix - p1.ix) * i;
        const wy = p1.iy + (p2.iy - p1.iy) * i;
        ctx.fillRect(wx - 5, wy - ph + 20, 10, 30);
      }
    }
  };

  drawFace(v0, v3, h, shadeColor(color, -40)); // Left
  drawFace(v0, v1, h, color, true); // Front
  
  // Columns / Pillars for Civic Look
  if (style === 'office') {
    ctx.fillStyle = shadeColor(color, 20);
    for (let i = 0; i <= 1; i += 0.5) {
      const px = v0.ix + (v1.ix - v0.ix) * i;
      const py = v0.iy + (v1.iy - v0.iy) * i;
      ctx.fillRect(px - 4, py - h, 8, h);
    }
  }

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(v0.ix, v0.iy - h); ctx.lineTo(v1.ix, v1.iy - h);
  ctx.lineTo(v2.ix, v2.iy - h); ctx.lineTo(v3.ix, v3.iy - h);
  ctx.fill();

  // Official Signage
  ctx.fillStyle = '#FFF'; ctx.font = '900 12px Orbitron'; ctx.textAlign='center';
  ctx.fillText(label.toUpperCase(), (v0.ix+v1.ix)/2, v0.iy - h - 10);
  ctx.restore();
}

function drawProp(ctx: CanvasRenderingContext2D, prop: any, camX: number, camY: number) {
  const { ix, iy } = toIso(prop.pos.x, prop.pos.y, camX, camY);
  ctx.save();
  ctx.translate(ix, iy);

  if (prop.type === 'bench') {
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(-20, -10, 40, 4); // Seat
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(-20, -10, 2, 10); ctx.fillRect(18, -10, 2, 10); // Legs
  } else if (prop.type === 'counter') {
    ctx.fillStyle = '#1E293B';
    ctx.beginPath(); ctx.roundRect(-40, -30, 80, 30, 4); ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.fillRect(-40, -30, 80, 2); // Top ledge
  } else if (prop.type === 'kiosk') {
    ctx.fillStyle = '#334155'; ctx.fillRect(-8, -45, 16, 45); // Body
    ctx.fillStyle = '#00E5FF'; ctx.globalAlpha = 0.6;
    ctx.fillRect(-6, -40, 12, 15); // Screen
  } else if (prop.type === 'barrier') {
    ctx.strokeStyle = '#FCD34D'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-30, -15); ctx.lineTo(30, -15); ctx.stroke();
    ctx.fillStyle = '#334155'; ctx.fillRect(-30, -15, 4, 15); ctx.fillRect(26, -15, 4, 15);
  } else if (prop.type === 'lamp') {
    ctx.fillStyle = '#1F2937'; ctx.fillRect(-2, -60, 4, 60);
    ctx.fillStyle = '#FCD34D'; ctx.beginPath(); ctx.arc(0, -60, 6, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
}

function drawObject(ctx: CanvasRenderingContext2D, obj: any, time: number, isNearby: boolean, camX: number, camY: number) {
  const { ix, iy } = toIso(obj.pos.x + obj.size.x/2, obj.pos.y + obj.size.y/2, camX, camY);
  ctx.save();
  ctx.translate(ix, iy);
  
  if (obj.id.includes('exit')) {
    const gh = 80; const gw = 60;
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.globalAlpha = 0.5 + Math.sin(time*0.005)*0.2;
    ctx.beginPath(); ctx.moveTo(-gw/2,0); ctx.lineTo(-gw/2,-gh); ctx.lineTo(gw/2,-gh); ctx.lineTo(gw/2,0); ctx.stroke();
    const ay = -gh/2 + Math.sin(time*0.01)*8;
    ctx.fillStyle = '#4ade80'; ctx.beginPath(); ctx.moveTo(0, ay+8); ctx.lineTo(12, ay); ctx.lineTo(-12, ay); ctx.fill();
  } else {
    ctx.fillStyle = '#4ade80'; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI*2); ctx.fill();
  }

  if (isNearby) {
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(10,15,25,0.85)'; ctx.strokeStyle = '#4ade80';
    ctx.beginPath(); ctx.roundRect(-55, -55, 110, 22, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF'; ctx.font = '900 9px Orbitron'; ctx.textAlign='center'; ctx.fillText(`[E] ${obj.label.toUpperCase()}`, 0, -40);
  }
  ctx.restore();
}

function drawGround(ctx: CanvasRenderingContext2D, camX: number, camY: number, W: number, H: number, zone: any, time: number) {
  ctx.fillStyle = '#05070A'; ctx.fillRect(0,0,W,H);
  
  // Ambient Grid
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)'; ctx.lineWidth = 1;
  const sz = 80;
  for(let x=-5; x<25; x++){
    const p1 = toIso(x*sz, -400, camX, camY); const p2 = toIso(x*sz, 1200, camX, camY);
    ctx.beginPath(); ctx.moveTo(p1.ix, p1.iy); ctx.lineTo(p2.ix, p2.iy); ctx.stroke();
  }
  for(let y=-5; y<25; y++){
    const p1 = toIso(-400, y*sz, camX, camY); const p2 = toIso(1200, y*sz, camX, camY);
    ctx.beginPath(); ctx.moveTo(p1.ix, p1.iy); ctx.lineTo(p2.ix, p2.iy); ctx.stroke();
  }

  // Street Lamp Blooms
  zone.props.forEach((p: any) => {
    if (p.type === 'lamp') {
      const flicker = Math.sin(time * 0.01 + p.pos.x) * 0.1 + 0.9;
      drawLightBloom(ctx, p.pos.x, p.pos.y, '#FCD34D', 150 * flicker, camX, camY);
    }
  });
}

export const GameCanvas: React.FC<Props> = ({ state, zone, onInteract, onPlayerMove, inputRef, touchRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const playerRef = useRef(state.player);
  const cameraRef = useRef({ x: 0, y: 0 });
  const vzRef = useRef(0);
  
  useEffect(() => { playerRef.current = state.player; }, [state.player]);

  const getNearest = useCallback((px: number, py: number) => {
    let nearest: any = null;
    for (const n of zone.npcs) {
      const d = Math.hypot(px - n.pos.x, py - n.pos.y);
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist)) nearest = { id: n.id, type: 'npc', dist: d };
    }
    for (const o of zone.objects) {
      if (!o.isActive) continue;
      const d = Math.hypot(px - (o.pos.x + o.size.x/2), py - (o.pos.y + o.size.y/2));
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist)) nearest = { id: o.id, type: 'object', dist: d };
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

      const player = playerRef.current;
      const cam = cameraRef.current;

      // Physics: Jump
      let nextZ = player.z;
      if (nextZ > 0 || vzRef.current !== 0) {
        vzRef.current -= 0.8; // Gravity
        nextZ += vzRef.current;
        if (nextZ <= 0) { nextZ = 0; vzRef.current = 0; }
      }

      // Camera
      const targetIso = { ix: (player.pos.x - player.pos.y) * COS_A, iy: (player.pos.x + player.pos.y) * SIN_A };
      const dx = targetIso.ix - cam.x; const dy = targetIso.iy - cam.y;
      if (Math.abs(dx) > DEADZONE_W) cam.x += (dx - Math.sign(dx) * DEADZONE_W) * 0.15;
      if (Math.abs(dy) > DEADZONE_H) cam.y += (dy - Math.sign(dy) * DEADZONE_H) * 0.15;

      // Camera Shake logic
      const shake = vzRef.current < -5 && nextZ === 0 ? 8 : 0;
      const shakeX = (Math.random() - 0.5) * shake;
      const shakeY = (Math.random() - 0.5) * shake;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(shakeX, shakeY);

      drawGround(ctx, cam.x, cam.y, canvas.width, canvas.height, zone, timeRef.current);

      // Input
      let pdx = 0, pdy = 0;
      if (state.phase === 'playing') {
        const s = player.speed; const k = inputRef.current;
        if (k.has('ArrowLeft') || k.has('a') || k.has('A')) pdx -= s;
        if (k.has('ArrowRight') || k.has('d') || k.has('D')) pdx += s;
        if (k.has('ArrowUp') || k.has('w') || k.has('W')) pdy -= s;
        if (k.has('ArrowDown') || k.has('s') || k.has('S')) pdy += s;
        if (k.has(' ') && nextZ === 0) vzRef.current = 12; // Jump Impulse
      }
      const isMoving = Math.abs(pdx) > 0.1 || Math.abs(pdy) > 0.1;

      // Render List
      const list: any[] = [];
      zone.buildings.forEach(b => list.push({ y: b.rect.y + b.rect.d, type: 'building', data: b }));
      zone.npcs.forEach(n => list.push({ y: n.pos.y, type: 'npc', data: n }));
      zone.objects.forEach(o => o.isActive && list.push({ y: o.pos.y + o.size.y, type: 'object', data: o }));
      list.push({ y: player.pos.y, type: 'player', data: player });
      list.sort((a,b) => a.y - b.y);

      list.forEach(item => {
        if (item.type === 'building') drawStylizedBuilding(ctx, item.data, cam.x, cam.y);
        else if (item.type === 'prop') drawProp(ctx, item.data, cam.x, cam.y);
        else if (item.type === 'npc') drawCharacter(ctx, item.data.pos.x, item.data.pos.y, 0, item.data.color, timeRef.current, item.data.name, item.data.role, cam.x, cam.y);
        else if (item.type === 'object') {
          const d = Math.hypot(player.pos.x - (item.data.pos.x+item.data.size.x/2), player.pos.y - (item.data.pos.y+item.data.size.y/2));
          drawObject(ctx, item.data, timeRef.current, d < INTERACT_RADIUS, cam.x, cam.y);
        }
        else if (item.type === 'player') drawCharacter(ctx, player.pos.x, player.pos.y, player.z, PLAYER_COLORS[player.avatar] || '#2ABFBF', timeRef.current, player.name, 'Citizen', cam.x, cam.y, isMoving);
      });

      ctx.restore(); // End Shake

      if (state.phase === 'playing' && (pdx !== 0 || pdy !== 0 || nextZ !== player.z)) {
        onPlayerMove({ x: Math.max(50, Math.min(1150, player.pos.x + pdx)), y: Math.max(150, Math.min(650, player.pos.y + pdy)) }, nextZ);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && state.phase === 'playing') {
        const n = getNearest(playerRef.current.pos.x, playerRef.current.pos.y);
        if (n) onInteract(n.id, n.type);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    animFrameId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animFrameId); window.removeEventListener('keydown', handleKeyDown); };
  }, [zone, state.phase, onInteract, onPlayerMove, getNearest, inputRef, touchRef]);

  return <canvas ref={canvasRef} width={1200} height={700} className="w-full h-full" />;
};
