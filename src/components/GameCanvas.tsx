import React, { useRef, useEffect } from 'react';
import type { GameState, Zone } from '../game/types';

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

  // Left face
  drawPoly(ctx, [p3, p2, t2, t3], colors.left);
  // Right face
  drawPoly(ctx, [p0, p3, t3, t0], colors.right);
  // Top face
  drawPoly(ctx, [t0, t1, t2, t3], colors.top);
}

function drawBuildingWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, d: number, h: number, isVertical: boolean) {
  const th = 10; // wall thickness
  if (isVertical) {
    drawIsoBlock(ctx, x, y, th, d, h, { top: C.wallTop, left: C.wallExt, right: C.wallInt });
  } else {
    drawIsoBlock(ctx, x, y, w, th, h, { top: C.wallTop, left: C.wallInt, right: C.wallExt });
  }
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number) {
  drawIsoBlock(ctx, x, y, 60, 20, 25, { top: C.wood, left: C.woodDark, right: C.woodDark });
  // computer
  drawIsoBlock(ctx, x + 10, y + 5, 10, 10, 15, { top: '#444', left: '#222', right: '#333' });
}

function drawBench(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // seat
  drawIsoBlock(ctx, x, y, 40, 15, 10, { top: C.wood, left: C.woodDark, right: C.woodDark });
  // back
  drawIsoBlock(ctx, x, y, 40, 4, 25, { top: C.wood, left: C.woodDark, right: C.woodDark });
}

function drawPlant(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // pot
  drawIsoBlock(ctx, x, y, 15, 15, 15, { top: '#A56A4B', left: '#824E34', right: '#824E34' });
  // leaves
  const p = toIso(x + 7.5, y + 7.5, 25);
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.fillStyle = C.plant; ctx.fill();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, color: string = '#E2A981', suit: string = '#4A5568') {
  const p = toIso(x, y, 0);
  
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y, 8, 4, 0, 0, Math.PI*2); ctx.fill();

  // Legs
  ctx.fillStyle = '#2D3748'; ctx.fillRect(p.x - 4, p.y - 12, 3, 12); ctx.fillRect(p.x + 1, p.y - 12, 3, 12);
  
  // Body
  ctx.fillStyle = suit;
  ctx.beginPath(); ctx.roundRect(p.x - 6, p.y - 28, 12, 16, 3); ctx.fill();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1; ctx.stroke();
  
  // Head
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(p.x, p.y - 34, 6, 0, Math.PI*2); ctx.fill();
  ctx.stroke();
}

function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, z: number = 80) {
  const p = toIso(x, y, z);
  ctx.font = '600 10px Inter, sans-serif';
  const width = ctx.measureText(text).width + 12;
  
  ctx.fillStyle = C.labelBg;
  ctx.strokeStyle = C.outline;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(p.x - width/2, p.y - 10, width, 20, 4); 
  ctx.fill(); ctx.stroke();
  
  ctx.fillStyle = C.labelText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, p.x, p.y + 1);
}

function drawFlagPole(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Base
  drawIsoBlock(ctx, x-10, y-10, 20, 20, 5, { top: '#888', left: '#666', right: '#777' });
  // Pole
  const bottom = toIso(x, y, 5);
  const top = toIso(x, y, 100);
  ctx.beginPath(); ctx.moveTo(bottom.x, bottom.y); ctx.lineTo(top.x, top.y);
  ctx.strokeStyle = '#999'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = C.outline; ctx.lineWidth = 1; ctx.stroke();
  // Flag
  ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(top.x + 30, top.y + 10); ctx.lineTo(top.x, top.y + 25);
  ctx.fillStyle = '#4B5E72'; ctx.fill();
  ctx.stroke();
}

// --- Main Render ---

export const GameCanvas: React.FC<Props> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    
    // Clear
    ctx.fillStyle = C.ground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paths
    const path1 = [toIso(-100, 100, 0), toIso(500, 100, 0), toIso(500, 150, 0), toIso(-100, 150, 0)];
    const path2 = [toIso(200, -100, 0), toIso(250, -100, 0), toIso(250, 500, 0), toIso(200, 500, 0)];
    drawPoly(ctx, path1, C.path, '');
    drawPoly(ctx, path2, C.path, '');
    
    // Civic Plaza Base
    drawPoly(ctx, [toIso(150,50), toIso(300,50), toIso(300,200), toIso(150,200)], C.path, '');

    // --- BUILDING 1: REGISTRATION OFFICE (Left) ---
    // Floor
    drawPoly(ctx, [toIso(-50,-100), toIso(150,-100), toIso(150,50), toIso(-50,50)], C.floor, C.outline);
    // Back walls
    drawBuildingWall(ctx, -50, -100, 200, 10, 80, false);
    drawBuildingWall(ctx, -50, -100, 10, 150, 80, true);
    // Interior
    drawDesk(ctx, 20, -50);
    drawCharacter(ctx, 40, -30, '#E2A981', '#3B82F6'); // Worker
    drawCharacter(ctx, 60, -10, '#D49A76', '#10B981'); // Citizen
    drawBench(ctx, 0, 10);
    drawPlant(ctx, 130, -80);
    drawPlant(ctx, 130, 30);
    // Front walls (partial)
    drawBuildingWall(ctx, 150, -100, 10, 50, 80, true);
    drawBuildingWall(ctx, -50, 50, 80, 10, 80, false);
    drawLabel(ctx, 50, -50, "REGISTRATION OFFICE");

    // --- BUILDING 2: INFO KIOSK (Top Middle) ---
    drawPoly(ctx, [toIso(180,-150), toIso(320,-150), toIso(320,-20), toIso(180,-20)], C.floor, C.outline);
    drawBuildingWall(ctx, 180, -150, 140, 10, 80, false);
    drawBuildingWall(ctx, 180, -150, 10, 130, 80, true);
    drawDesk(ctx, 220, -100);
    drawCharacter(ctx, 240, -80);
    drawBuildingWall(ctx, 320, -150, 10, 130, 80, true);
    drawBuildingWall(ctx, 180, -20, 50, 10, 80, false);
    drawLabel(ctx, 250, -100, "INFO KIOSK - AVAILABLE");

    // --- BUILDING 3: VOTING CENTER (Top Right) ---
    drawPoly(ctx, [toIso(350,-150), toIso(600,-150), toIso(600,80), toIso(350,80)], C.floor, C.outline);
    drawBuildingWall(ctx, 350, -150, 250, 10, 100, false);
    drawBuildingWall(ctx, 350, -150, 10, 230, 100, true);
    drawDesk(ctx, 400, -80);
    drawCharacter(ctx, 420, -60);
    drawCharacter(ctx, 420, -40, '#FFD', '#EAB308');
    drawDesk(ctx, 500, -20);
    drawCharacter(ctx, 520, 0);
    drawBuildingWall(ctx, 600, -150, 10, 230, 100, true);
    drawBuildingWall(ctx, 350, 80, 100, 10, 100, false);
    drawLabel(ctx, 475, -50, "VOTING CENTER", 120);

    // --- BUILDING 4: POLLING STATIONS (Bottom Right) ---
    drawPoly(ctx, [toIso(350,120), toIso(550,120), toIso(550,250), toIso(350,250)], C.floor, C.outline);
    drawBuildingWall(ctx, 350, 120, 200, 10, 60, false);
    drawBuildingWall(ctx, 350, 120, 10, 130, 60, true);
    drawCharacter(ctx, 420, 180);
    drawCharacter(ctx, 480, 180);
    drawBuildingWall(ctx, 550, 120, 10, 130, 60, true);
    drawBuildingWall(ctx, 350, 250, 80, 10, 60, false);
    drawLabel(ctx, 450, 150, "POLLING STATIONS", 90);
    drawLabel(ctx, 520, 150, "BALLOT BOX", 90);

    // --- CIVIC PLAZA (Center) ---
    drawFlagPole(ctx, 225, 125);
    drawBench(ctx, 180, 70);
    drawBench(ctx, 260, 170);
    drawCharacter(ctx, 220, 160, '#FCD34D', '#8B5CF6'); // Observer 1
    drawCharacter(ctx, 240, 160, '#FDBA74', '#14B8A6'); // Observer 2
    drawLabel(ctx, 225, 125, "CIVIC PLAZA", 30);
    drawLabel(ctx, 230, 160, "OBSERVER", 40);

    // Some exterior details
    drawLabel(ctx, 560, 50, "CITIZEN: JOHN D.", 40);
    drawCharacter(ctx, 560, 50);

  }, []);

  return <canvas ref={canvasRef} width={1200} height={800} style={{ width: '100%', height: '100%' }} />;
};
