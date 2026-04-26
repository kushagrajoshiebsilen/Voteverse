import React, { useEffect, useState } from 'react';
import type { ZoneId } from '../game/types';
import { ZONE_COLORS } from '../game/constants';
import { ZONES } from '../game/worldData';

interface Props { toZone: ZoneId; onComplete: () => void; }

const ZONE_FLAVOR: Record<string, string> = {
  neighborhood: 'Democracy begins at your doorstep — in the streets you call home.',
  registration: 'The first act of power: making your existence count.',
  campaign:     'Signal vs. noise. Truth vs. manipulation. Choose wisely.',
  polling:      'The sacred moment arrives. Your vote is your sovereign choice.',
  results:      'Every node has spoken. Every signal has been tallied.',
};

const ZONE_PROTOCOL: Record<string, string> = {
  neighborhood: 'SECTOR_ALPHA',
  registration: 'SECTOR_BETA',
  campaign:     'SECTOR_GAMMA',
  polling:      'SECTOR_DELTA',
  results:      'SECTOR_OMEGA',
};

export const ZoneTransition: React.FC<Props> = ({ toZone, onComplete }) => {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const [progress, setProgress] = useState(0);
  const [glitchText, setGlitchText] = useState(false);
  const zone   = ZONES.find(z => z.id === toZone);
  const colors = ZONE_COLORS[toZone];
  const accent = colors?.accent || '#00E5FF';
  const flavor = ZONE_FLAVOR[toZone] || '';
  const protocol = ZONE_PROTOCOL[toZone] || 'SECTOR_??';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(onComplete, 3400);
    // Random glitch flicker
    const glitch = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 80);
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(glitch); };
  }, []);

  useEffect(() => {
    if (phase !== 'hold') return;
    const start = Date.now();
    const dur = 2200;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [phase]);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${colors?.bg || '#080A11'}ee 0%, #030508 100%)`,
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'enter' ? 'none' : 'opacity 0.55s ease',
      }}
    >
      {/* Perspective grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Horizontal scan line sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)`,
        pointerEvents: 'none',
      }} />

      {/* Top + bottom neon bars */}
      <div className="tech-stripe absolute top-0 left-0 right-0" style={{ height: '3px' }} />
      <div className="tech-stripe absolute bottom-0 left-0 right-0" style={{ height: '3px' }} />

      {/* Side vertical bars */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg, transparent, ${accent}, transparent)`, opacity: 0.5 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg, transparent, ${accent}, transparent)`, opacity: 0.5 }} />

      {/* Content */}
      <div
        className="relative z-10 text-center"
        style={{
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'scale(0.95) translateY(16px)' : 'scale(1) translateY(0)',
          transition: 'all 0.5s var(--ease-out)',
        }}
      >
        {/* Protocol ID */}
        <div className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.4em', color: 'var(--text-muted)', marginBottom: '20px', textTransform: 'uppercase' }}>
          {protocol} · INITIALIZING
        </div>

        {/* Zone emoji with glow */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '28px',
            filter: `drop-shadow(0 0 30px ${accent}88)`,
            animation: 'pulse-soft 3s ease-in-out infinite',
          }}
        >
          {zone?.emoji}
        </div>

        {/* "Entering Zone" label */}
        <div className="font-display" style={{ fontSize: '12px', letterSpacing: '0.5em', color: accent, opacity: 0.6, marginBottom: '10px', textTransform: 'uppercase' }}>
          ACCESSING NODE
        </div>

        {/* Zone name — with glitch */}
        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(26px, 4vw, 48px)',
            fontWeight: 900,
            letterSpacing: '0.12em',
            color: glitchText ? '#fff' : accent,
            textShadow: glitchText
              ? `3px 0 #FF3366, -3px 0 #00E5FF, 0 0 20px ${accent}`
              : `0 0 40px ${accent}66, 0 0 10px ${accent}44`,
            marginBottom: '16px',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            transition: 'color 0.05s, text-shadow 0.05s',
          }}
        >
          {zone?.name?.toUpperCase()}
        </h2>

        {/* Flavor text */}
        <p className="font-ui" style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.7, margin: '0 auto 32px' }}>
          {flavor}
        </p>

        {/* Progress bar */}
        <div style={{ width: '280px', margin: '0 auto', opacity: phase === 'enter' ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.2em' }}>NODE SYNC</span>
            <span className="font-display" style={{ fontSize: '12px', color: accent, textShadow: `0 0 5px ${accent}` }}>{Math.round(progress * 100)}%</span>
          </div>
          <div className="meter-track" style={{ height: '4px' }}>
            <div
              className="meter-fill"
              style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, transparent, ${accent})`, color: accent }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
