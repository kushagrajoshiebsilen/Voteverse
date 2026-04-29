import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Zone } from '../game/types';
import { INTERACT_RADIUS } from '../game/constants';

interface Props {
  state: GameState; zone: Zone;
  onInteract: (id: string, type: 'npc' | 'object') => void;
  onPlayerMove: (pos: { x: number; y: number }, z: number) => void;
  inputRef: React.MutableRefObject<Set<string>>;
  touchRef: React.MutableRefObject<{ dx: number; dy: number }>;
}

// ── Iso constants ─────────────────────────
const ISO_ANGLE = Math.PI / 6;
const COS_A = Math.cos(ISO_ANGLE);
const SIN_A = Math.sin(ISO_ANGLE);
const DEADZONE_W = 180, DEADZONE_H = 130;

const toIso = (x: number, y: number, cx: number, cy: number) => ({
  ix: (x - y) * COS_A - cx + 600,
  iy: (x + y) * SIN_A - cy + 350,
});

function shade(hex: string, p: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, Math.floor(((n >> 16) & 0xff) * (1 + p / 100))));
  const g = Math.min(255, Math.max(0, Math.floor(((n >> 8)  & 0xff) * (1 + p / 100))));
  const b = Math.min(255, Math.max(0, Math.floor((n & 0xff)         * (1 + p / 100))));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Ground + ambient grid ─────────────────
function drawGround(ctx: CanvasRenderingContext2D, cx: number, cy: number, W: number, H: number, zone: any, t: number) {
  // Base fill
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#080B12');
  bg.addColorStop(1, '#050710');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Floor tiles — dark teal-tinted grid
  const sz = 80;
  for (let gx = -4; gx < 20; gx++) {
    for (let gy = -4; gy < 20; gy++) {
      const p0 = toIso(gx*sz, gy*sz, cx, cy);
      const p1 = toIso((gx+1)*sz, gy*sz, cx, cy);
      const p2 = toIso((gx+1)*sz, (gy+1)*sz, cx, cy);
      const p3 = toIso(gx*sz, (gy+1)*sz, cx, cy);
      const alt = (gx + gy) % 2 === 0;
      ctx.fillStyle = alt ? '#0B0F18' : '#0D1120';
      ctx.beginPath();
      ctx.moveTo(p0.ix,p0.iy); ctx.lineTo(p1.ix,p1.iy);
      ctx.lineTo(p2.ix,p2.iy); ctx.lineTo(p3.ix,p3.iy);
      ctx.closePath(); ctx.fill();
      // Grid lines
      ctx.strokeStyle = 'rgba(42,191,191,0.04)'; ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Ambient lamp blooms
  zone.props?.forEach((p: any) => {
    if (p.type !== 'lamp') return;
    const flicker = 0.85 + Math.sin(t * 0.01 + p.pos.x) * 0.15;
    const { ix, iy } = toIso(p.pos.x, p.pos.y, cx, cy);
    const g = ctx.createRadialGradient(ix, iy, 0, ix, iy, 160 * flicker);
    g.addColorStop(0, 'rgba(200,144,42,0.18)');
    g.addColorStop(0.4, 'rgba(200,144,42,0.06)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(ix, iy, 160 * flicker, 0, Math.PI * 2); ctx.fill();
  });
}

// ── Civic building ────────────────────────
function drawBuilding(ctx: CanvasRenderingContext2D, b: any, cx: number, cy: number, t: number) {
  const { rect, color, roofColor, label } = b;
  const h = rect.h;
  const v = (x: number, y: number) => toIso(x, y, cx, cy);
  const v0=v(rect.x,rect.y), v1=v(rect.x+rect.w,rect.y);
  const v2=v(rect.x+rect.w,rect.y+rect.d), v3=v(rect.x,rect.y+rect.d);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.moveTo(v0.ix,v0.iy+4); ctx.lineTo(v1.ix,v1.iy+4);
  ctx.lineTo(v2.ix,v2.iy+4); ctx.lineTo(v3.ix,v3.iy+4);
  ctx.closePath(); ctx.fill();

  const drawFace = (a: any, b2: any, col: string, front = false) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(a.ix,a.iy); ctx.lineTo(b2.ix,b2.iy);
    ctx.lineTo(b2.ix,b2.iy-h); ctx.lineTo(a.ix,a.iy-h);
    ctx.closePath(); ctx.fill();

    if (front) {
      // Structural edge
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
      ctx.stroke();
      // Window rows
      ctx.fillStyle = 'rgba(42,191,191,0.12)';
      const wSlots = Math.floor(rect.w / 90);
      for (let wi = 0; wi < wSlots; wi++) {
        const t2 = (wi + 0.5) / wSlots;
        const wx = a.ix + (b2.ix - a.ix) * t2;
        const wy = a.iy + (b2.iy - a.iy) * t2;
        ctx.fillRect(wx - 8, wy - h + 25, 14, 22);
        ctx.fillRect(wx - 8, wy - h + 58, 14, 22);
      }
    }
  };

  // Faces
  const leftCol  = shade(color, -35);
  const frontCol = color;
  drawFace(v0, v3, leftCol);
  drawFace(v0, v1, frontCol, true);

  // Pillars on front face
  ctx.fillStyle = shade(color, 15);
  for (let pi = 0; pi <= 1; pi += 0.5) {
    const px = v0.ix + (v1.ix - v0.ix) * pi;
    const py = v0.iy + (v1.iy - v0.iy) * pi;
    ctx.fillRect(px - 3, py - h, 6, h);
  }

  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(v0.ix,v0.iy-h); ctx.lineTo(v1.ix,v1.iy-h);
  ctx.lineTo(v2.ix,v2.iy-h); ctx.lineTo(v3.ix,v3.iy-h);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(42,191,191,0.1)'; ctx.lineWidth=1; ctx.stroke();

  // Label
  const midX = (v0.ix+v1.ix)/2, midY = v0.iy - h - 12;
  ctx.save();
  ctx.font = '700 10px "Rajdhani", monospace';
  ctx.textAlign = 'center';
  const tw = ctx.measureText(label.toUpperCase()).width;
  ctx.fillStyle = 'rgba(8,12,20,0.85)';
  ctx.strokeStyle = 'rgba(42,191,191,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(midX-tw/2-8, midY-11, tw+16, 18, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(label.toUpperCase(), midX, midY+2);
  ctx.restore();
}

// ── Prop: lamp, bench, counter, kiosk, barrier ────
function drawProp(ctx: CanvasRenderingContext2D, prop: any, cx: number, cy: number, t: number) {
  const { ix, iy } = toIso(prop.pos.x, prop.pos.y, cx, cy);
  ctx.save(); ctx.translate(ix, iy);

  if (prop.type === 'lamp') {
    ctx.strokeStyle = '#2A3A4A'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(10, -62); ctx.stroke();
    const flick = 0.7 + Math.sin(t*0.01+prop.pos.x)*0.3;
    ctx.fillStyle = `rgba(200,144,42,${flick})`;
    ctx.beginPath(); ctx.arc(10, -62, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = `rgba(200,144,42,${flick*0.3})`;
    ctx.beginPath(); ctx.arc(10, -62, 14, 0, Math.PI*2); ctx.fill();
  } else if (prop.type === 'bench') {
    ctx.fillStyle = '#1C2A38';
    ctx.beginPath(); ctx.roundRect(-22,-8,44,6,2); ctx.fill();
    ctx.fillStyle = '#152030';
    ctx.fillRect(-20, -2, 4, 8); ctx.fillRect(16, -2, 4, 8);
  } else if (prop.type === 'counter') {
    // Service desk — dark steel with teal accent strip
    ctx.fillStyle = '#182030';
    ctx.beginPath(); ctx.roundRect(-42,-28,84,28,3); ctx.fill();
    ctx.fillStyle = 'rgba(42,191,191,0.3)';
    ctx.fillRect(-42, -29, 84, 3);
    // Monitor hint
    ctx.fillStyle = '#0D1828';
    ctx.beginPath(); ctx.roundRect(-10,-48,20,16,2); ctx.fill();
    ctx.fillStyle = 'rgba(42,191,191,0.5)';
    ctx.fillRect(-8,-46,16,12);
  } else if (prop.type === 'kiosk') {
    ctx.fillStyle = '#182030';
    ctx.beginPath(); ctx.roundRect(-10,-50,20,50,3); ctx.fill();
    const sc = 0.8 + Math.sin(t*0.003)*0.2;
    ctx.fillStyle = `rgba(42,191,191,${sc*0.6})`;
    ctx.beginPath(); ctx.roundRect(-7,-44,14,20,2); ctx.fill();
    ctx.fillStyle = `rgba(42,191,191,${sc*0.15})`;
    ctx.beginPath(); ctx.arc(0,-34,20,0,Math.PI*2); ctx.fill();
  } else if (prop.type === 'barrier') {
    ctx.strokeStyle = '#C8902A'; ctx.lineWidth = 2.5;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(-32,-12); ctx.lineTo(32,-12); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#2A3A4A';
    ctx.fillRect(-34,-12,5,12); ctx.fillRect(29,-12,5,12);
  }
  ctx.restore();
}

// ── Interactable object (exit portal / prop) ──
function drawObject(ctx: CanvasRenderingContext2D, obj: any, t: number, nearby: boolean, cx: number, cy: number) {
  const { ix, iy } = toIso(obj.pos.x+obj.size.x/2, obj.pos.y+obj.size.y/2, cx, cy);
  ctx.save(); ctx.translate(ix, iy);

  if (obj.id.includes('exit')) {
    const pulse = Math.sin(t*0.004)*0.3+0.7;
    ctx.strokeStyle = `rgba(42,191,191,${pulse})`; ctx.lineWidth = 1.5;
    const r = 28; const pts = 6;
    ctx.beginPath();
    for (let i=0;i<pts;i++) {
      const a = (i/pts)*Math.PI*2 - Math.PI/2;
      i===0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r*0.5) : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r*0.5);
    }
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = `rgba(42,191,191,${pulse*0.08})`;
    ctx.fill();
    const ay = -18 + Math.sin(t*0.008)*5;
    ctx.fillStyle = `rgba(42,191,191,${pulse})`;
    ctx.beginPath(); ctx.moveTo(0,ay+7); ctx.lineTo(8,ay); ctx.lineTo(-8,ay); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = 'rgba(42,191,191,0.15)';
    ctx.beginPath(); ctx.ellipse(0,0,24,12,0,0,Math.PI*2); ctx.fill();
  }

  if (nearby) {
    ctx.fillStyle = 'rgba(8,12,20,0.9)'; ctx.strokeStyle='rgba(42,191,191,0.6)'; ctx.lineWidth=1;
    const lw = 110;
    ctx.beginPath(); ctx.roundRect(-lw/2,-50,lw,18,3); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#CBD5E1'; ctx.font='700 9px Rajdhani,monospace'; ctx.textAlign='center';
    ctx.fillText(`[E] ${obj.label.toUpperCase()}`, 0, -38);
  }
  ctx.restore();
}

// ── NPC character ─────────────────────────
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, z: number, color: string,
  t: number, name: string, role: string,
  cx: number, cy: number, moving = false
) {
  const { ix, iy } = toIso(x, y, cx, cy);
  const seed = (x*7+y*13)%1000;
  const breathe = Math.sin((t+seed)*0.0018)*1.2;
  const bob = moving ? Math.abs(Math.sin(t*0.014))*-6 : breathe;
  const swing = moving ? Math.sin(t*0.014)*10 : 0;

  ctx.save(); ctx.translate(ix, iy-z);

  // Ground shadow
  ctx.save(); ctx.translate(0, z);
  const ss = Math.max(0.3, 1-(z/120));
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0,0,14*ss,7*ss,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.translate(0, bob);

  // Legs
  const legCol = shade(color, -30);
  ctx.fillStyle = legCol;
  ctx.beginPath(); ctx.roundRect(-7,-4,5,moving?6+Math.sin(t*0.014)*3:6,1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(2,-4,5,moving?6-Math.sin(t*0.014)*3:6,1); ctx.fill();

  // Body
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(-9,-28,18,24,5); ctx.fill();

  // Teal accent stripe on torso
  ctx.fillStyle = 'rgba(42,191,191,0.35)';
  ctx.fillRect(-9,-20,18,3);

  // Arms
  ctx.fillStyle = color;
  ctx.save(); ctx.translate(-11,-18+swing); ctx.beginPath(); ctx.ellipse(0,0,3,6,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(11,-18-swing);  ctx.beginPath(); ctx.ellipse(0,0,3,6,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Head
  const isOfficer = role.includes('Officer')||role.includes('ERO');
  ctx.fillStyle = '#CDD5E0';
  ctx.beginPath(); ctx.roundRect(-8,-44,16,16,8); ctx.fill();
  if (isOfficer) {
    ctx.fillStyle='#1A2B3C'; ctx.fillRect(-8,-47,16,5);
    ctx.fillStyle='#C8902A'; ctx.fillRect(-2,-46,4,3);
  }

  // Eyes — blink
  const blink = Math.sin(t*0.004)>0.95;
  ctx.fillStyle = '#0D1828';
  ctx.fillRect(-4,-38,2, blink?1:3);
  ctx.fillRect(2,-38,2, blink?1:3);

  // Nameplate
  ctx.save(); ctx.translate(0,-60);
  ctx.font='700 8px Rajdhani,monospace'; ctx.textAlign='center';
  const nw = ctx.measureText(name.toUpperCase()).width+12;
  ctx.fillStyle='rgba(8,12,20,0.88)';
  ctx.strokeStyle='rgba(42,191,191,0.4)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.roundRect(-nw/2,-9,nw,16,2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#CBD5E1';
  ctx.fillText(name.toUpperCase(), 0, 3);
  ctx.restore();

  ctx.restore();
}

// ── Main component ────────────────────────
export const GameCanvas: React.FC<Props> = ({ state, zone, onInteract, onPlayerMove, inputRef, touchRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef   = useRef(0);
  const playerRef = useRef(state.player);
  const camRef    = useRef({ x:0, y:0 });
  const vzRef     = useRef(0);

  useEffect(() => { playerRef.current = state.player; }, [state.player]);

  const getNearest = useCallback((px: number, py: number) => {
    let nearest: any = null;
    for (const n of zone.npcs) {
      const d = Math.hypot(px-n.pos.x, py-n.pos.y);
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist))
        nearest = { id:n.id, type:'npc', dist:d };
    }
    for (const o of zone.objects) {
      if (!o.isActive) continue;
      const d = Math.hypot(px-(o.pos.x+o.size.x/2), py-(o.pos.y+o.size.y/2));
      if (d < INTERACT_RADIUS && (!nearest || d < nearest.dist))
        nearest = { id:o.id, type:'object', dist:d };
    }
    return nearest;
  }, [zone]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf: number, last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(now-last, 50); last=now; timeRef.current+=dt;
      const t = timeRef.current;
      const player = playerRef.current;
      const cam = camRef.current;
      const W = canvas.width, H = canvas.height;

      // Gravity / jump
      let nz = player.z;
      if (nz>0 || vzRef.current!==0) {
        vzRef.current -= 0.8; nz += vzRef.current;
        if (nz<=0) { nz=0; vzRef.current=0; }
      }

      // Camera
      const ti = { ix:(player.pos.x-player.pos.y)*COS_A, iy:(player.pos.x+player.pos.y)*SIN_A };
      const dx = ti.ix - cam.x, dy = ti.iy - cam.y;
      if (Math.abs(dx)>DEADZONE_W) cam.x += (dx - Math.sign(dx)*DEADZONE_W)*0.12;
      if (Math.abs(dy)>DEADZONE_H) cam.y += (dy - Math.sign(dy)*DEADZONE_H)*0.12;

      const shake = vzRef.current<-5 && nz===0 ? 6 : 0;
      ctx.clearRect(0,0,W,H);
      ctx.save();
      ctx.translate((Math.random()-0.5)*shake, (Math.random()-0.5)*shake);

      drawGround(ctx, cam.x, cam.y, W, H, zone, t);

      // Input
      let pdx=0, pdy=0;
      if (state.phase==='playing') {
        const s = player.speed, k = inputRef.current;
        if (k.has('ArrowLeft')||k.has('a')||k.has('A')) pdx-=s;
        if (k.has('ArrowRight')||k.has('d')||k.has('D')) pdx+=s;
        if (k.has('ArrowUp')||k.has('w')||k.has('W')) pdy-=s;
        if (k.has('ArrowDown')||k.has('s')||k.has('S')) pdy+=s;
        if ((k.has(' '))&&nz===0) vzRef.current=12;
        // touch
        pdx += touchRef.current.dx * s;
        pdy += touchRef.current.dy * s;
      }
      const moving = Math.abs(pdx)>0.1||Math.abs(pdy)>0.1;

      // Render list — painter's algorithm
      const list: any[] = [];
      zone.buildings.forEach(b => list.push({ y:b.rect.y+b.rect.d, type:'building', data:b }));
      zone.props?.forEach((p: any) => list.push({ y:p.pos.y, type:'prop', data:p }));
      zone.npcs.forEach(n => list.push({ y:n.pos.y, type:'npc', data:n }));
      zone.objects.forEach(o => o.isActive && list.push({ y:o.pos.y+o.size.y, type:'object', data:o }));
      list.push({ y:player.pos.y, type:'player', data:player });
      list.sort((a,b) => a.y-b.y);

      list.forEach(item => {
        if (item.type==='building') drawBuilding(ctx, item.data, cam.x, cam.y, t);
        else if (item.type==='prop') drawProp(ctx, item.data, cam.x, cam.y, t);
        else if (item.type==='npc') drawCharacter(ctx, item.data.pos.x, item.data.pos.y, 0,
          item.data.color, t, item.data.name, item.data.role, cam.x, cam.y);
        else if (item.type==='object') {
          const d = Math.hypot(player.pos.x-(item.data.pos.x+item.data.size.x/2),
                               player.pos.y-(item.data.pos.y+item.data.size.y/2));
          drawObject(ctx, item.data, t, d<INTERACT_RADIUS, cam.x, cam.y);
        } else if (item.type==='player') {
          const pcol = player.avatar==='hero_m' ? '#2ABFBF' : '#C8902A';
          drawCharacter(ctx, player.pos.x, player.pos.y, player.z, pcol, t,
            player.name, 'Citizen', cam.x, cam.y, moving);
        }
      });

      ctx.restore();

      if (state.phase==='playing' && (pdx!==0||pdy!==0||nz!==player.z)) {
        onPlayerMove({
          x: Math.max(50, Math.min(1150, player.pos.x+pdx)),
          y: Math.max(150, Math.min(650, player.pos.y+pdy)),
        }, nz);
      }

      raf = requestAnimationFrame(loop);
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.key==='e'||e.key==='E') && state.phase==='playing') {
        const n = getNearest(playerRef.current.pos.x, playerRef.current.pos.y);
        if (n) onInteract(n.id, n.type);
      }
    };
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', onKey); };
  }, [zone, state.phase, onInteract, onPlayerMove, getNearest, inputRef, touchRef]);

  return <canvas ref={canvasRef} width={1200} height={700} className="w-full h-full" />;
};
