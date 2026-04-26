import React, { useState, useEffect } from 'react';

interface Props {
  onStart: (name: string, avatar: 'hero_m' | 'hero_f') => void;
}

const STORY_LINES = [
  'In a city where democracy was fading...',
  'Where misinformation spread like wildfire...',
  'Where citizens forgot the power of their vote...',
  'One citizen rose to change everything.',
  'That citizen is you.',
];

const AVATARS = [
  {
    id: 'hero_m' as const,
    title: 'The Guardian',
    subtitle: 'Protector of Civic Rights',
    bg: 'linear-gradient(160deg, #0D1E33 0%, #0B1929 100%)',
    accent: '#2ABFBF',
    icon: '⚖️',
    traits: ['Register & verify voters', 'Inspect polling booths', 'Uphold the Model Code'],
    flavor: 'Calm. Institutional. Navy & teal.',
  },
  {
    id: 'hero_f' as const,
    title: 'The Champion',
    subtitle: 'Voice of the People',
    bg: 'linear-gradient(160deg, #1F1508 0%, #1A1008 100%)',
    accent: '#F5A623',
    icon: '📢',
    traits: ['Spread voter awareness', 'Flag misinformation', 'Mobilize youth & communities'],
    flavor: 'Energetic. Movement-driven. Saffron & coral.',
  },
];

export const IntroScreen: React.FC<Props> = ({ onStart }) => {
  const [storyStep, setStoryStep] = useState(-1);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<'hero_m' | 'hero_f'>('hero_m');
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    // Story animation
    STORY_LINES.forEach((_, i) => {
      setTimeout(() => setStoryStep(i), i * 2200 + 600);
    });
    setTimeout(() => setShowCreate(true), STORY_LINES.length * 2200 + 1000);
  }, []);

  useEffect(() => {
    if (showCreate) setTimeout(() => setAnimIn(true), 50);
  }, [showCreate]);

  const selectedAvatar = AVATARS.find(a => a.id === avatar)!;

  const handleStart = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim() || 'Citizen';
    if (finalName.length < 2) return;
    console.log('Starting game as:', finalName, avatar);
    onStart(finalName, avatar);
  };

  // ── CINEMATIC SCREEN ──────────────────────────
  if (!showCreate) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #07090F 0%, #0D1117 100%)' }}
      >
        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              left: `${(i * 19 + 7) % 100}%`,
              top: `${(i * 31 + 11) % 85}%`,
              width: i % 5 === 0 ? '2px' : '1px',
              height: i % 5 === 0 ? '2px' : '1px',
              background: '#E8DCC8',
              animation: `twinkle ${2.5 + (i % 5) * 0.6}s ease-in-out infinite`,
              animationDelay: `${(i * 0.4) % 5}s`,
            }} />
          ))}
        </div>

        {/* India stripe */}
        <div className="absolute top-0 left-0 right-0 h-0.5 india-stripe" />

        {/* Content */}
        <div className="relative z-10 text-center px-8" style={{ maxWidth: '600px' }}>
          {/* Logo */}
          <div className="mb-12">
            <h1
              className="font-display saffron-text"
              style={{ fontSize: 'clamp(38px, 5vw, 60px)', fontWeight: 900, letterSpacing: '0.1em', lineHeight: 1 }}
            >
              VOTEVERSE
            </h1>
            <p
              className="font-mono"
              style={{ fontSize: '11px', letterSpacing: '0.35em', color: 'var(--teal-light)', marginTop: '8px', opacity: 0.7 }}
            >
              CITY OF DEMOCRACY
            </p>
          </div>

          {/* Story lines */}
          <div style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {STORY_LINES.slice(0, storyStep + 1).map((line, i) => {
              const isCurrent = i === storyStep;
              const isLast = i === STORY_LINES.length - 1;
              return (
                <p
                  key={i}
                  className="font-ui"
                  style={{
                    fontSize: isLast ? '22px' : '16px',
                    fontWeight: isLast ? 600 : isCurrent ? 500 : 400,
                    color: isLast && isCurrent
                      ? 'var(--text-primary)'
                      : isCurrent
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                    transition: 'all 0.7s ease',
                    opacity: i < storyStep - 1 ? 0.3 : 1,
                    letterSpacing: isLast ? '0.02em' : '0',
                    animation: isCurrent ? 'fade-up 0.6s var(--ease-out) both' : 'none',
                  }}
                >
                  {isLast && isCurrent ? (
                    <span className="saffron-text font-display" style={{ fontWeight: 700, fontSize: '24px' }}>
                      {line}
                    </span>
                  ) : line}
                </p>
              );
            })}
          </div>

          {storyStep >= 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="btn-ghost font-mono"
              style={{ marginTop: '32px', padding: '8px 20px', borderRadius: '6px', fontSize: '11px', letterSpacing: '0.2em' }}
            >
              SKIP INTRO →
            </button>
          )}
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.06; }
            50% { opacity: 0.45; }
          }
        `}</style>
      </div>
    );
  }

  // ── CHARACTER CREATION SCREEN ──────────────
  return (
    <div
      className="absolute inset-0 flex"
      style={{ background: 'linear-gradient(160deg, #07090F 0%, #0D1117 60%, #0A0F1A 100%)' }}
    >
      {/* India stripe */}
      <div className="absolute top-0 left-0 right-0 h-0.5 india-stripe z-10" />

      {/* Left – branding panel */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: '360px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #0D1117 0%, #07090F 100%)',
          borderRight: '1px solid rgba(232,220,200,0.06)',
          padding: '48px 40px',
        }}
      >
        <div>
          <h1 className="font-display saffron-text" style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1.1 }}>
            VOTEVERSE
          </h1>
          <p className="font-mono" style={{ fontSize: '10px', letterSpacing: '0.3em', color: 'var(--teal)', marginTop: '6px', opacity: 0.7 }}>
            CITY OF DEMOCRACY
          </p>

          <div style={{ marginTop: '48px' }}>
            {[
              { icon: '🗺', label: '5 City Zones', desc: 'Neighborhood to Results' },
              { icon: '💬', label: 'AI-Powered NPCs', desc: 'Gemini-driven dialogue' },
              { icon: '🎮', label: '6 Mini-Games', desc: 'Civic challenges' },
              { icon: '🗳', label: 'Shape Democracy', desc: 'Your choices matter' },
            ].map((f, i) => (
              <div
                key={f.label}
                className="flex items-start gap-3"
                style={{
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(232,220,200,0.05)',
                  animation: `fade-up 0.5s var(--ease-out) both`,
                  animationDelay: `${0.1 + i * 0.08}s`,
                }}
              >
                <span style={{ fontSize: '18px', marginTop: '1px', opacity: 0.7 }}>{f.icon}</span>
                <div>
                  <div className="font-ui" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                  <div className="font-ui" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="india-stripe" style={{ height: '2px', borderRadius: '1px', marginBottom: '12px' }} />
          <p className="font-mono" style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🇮🇳 Election Commission of India<br />Civic Education Initiative
          </p>
        </div>
      </div>

      {/* Right – form panel */}
      <div
        className="flex-1 flex items-center justify-center"
        style={{ padding: '24px' }}
      >
        <div
          className="w-full"
          style={{
            maxWidth: '480px',
            opacity: animIn ? 1 : 0,
            transform: animIn ? 'none' : 'translateY(20px)',
            transition: 'all 0.5s var(--ease-out)',
          }}
        >
          {/* Section header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              Create Your Citizen
            </h2>
            <p className="font-ui" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Choose who you'll be in the City of Democracy
            </p>
          </div>

          {/* Avatar cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            {AVATARS.map((av, i) => {
              const selected = avatar === av.id;
              return (
                <button
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  style={{
                    padding: '20px 16px',
                    borderRadius: '10px',
                    background: selected ? av.bg : 'rgba(12,16,26,0.7)',
                    border: selected ? `2px solid ${av.accent}` : `1px solid rgba(255,255,255,0.07)`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.22s ease',
                    position: 'relative',
                    boxShadow: selected ? `0 0 24px ${av.accent}30, 0 8px 32px rgba(0,0,0,0.5)` : '0 4px 16px rgba(0,0,0,0.3)',
                    animation: `fade-up 0.5s ease ${0.15 + i * 0.1}s both`,
                    outline: 'none',
                  }}
                >
                  {/* Top accent bar */}
                  {selected && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', borderRadius: '10px 10px 0 0', background: `linear-gradient(90deg, ${av.accent}, ${av.accent}66)` }} />
                  )}

                  {/* Selected check */}
                  {selected && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', width: '22px', height: '22px', borderRadius: '50%', background: av.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#000', fontWeight: 700, boxShadow: `0 0 10px ${av.accent}` }}>
                      ✓
                    </div>
                  )}

                  {/* Icon */}
                  <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: selected ? `${av.accent}18` : 'rgba(255,255,255,0.04)', border: selected ? `1px solid ${av.accent}50` : '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '14px', boxShadow: selected ? `0 0 14px ${av.accent}30` : 'none' }}>
                    {av.icon}
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 800, color: selected ? '#F2F4F8' : '#8A9BB0', letterSpacing: '0.02em', marginBottom: '3px' }}>
                    {av.title}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 600, color: selected ? av.accent : '#4A5A70', marginBottom: '2px' }}>
                    {av.subtitle}
                  </div>
                  {'flavor' in av && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: selected ? `${av.accent}99` : '#2E3E52', marginBottom: '12px', fontStyle: 'italic' }}>
                      {(av as typeof av & { flavor: string }).flavor}
                    </div>
                  )}

                  {/* Missions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                    {av.traits.map(t => (
                      <div key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: selected ? '#C4D0DC' : '#3A4A5A', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '4px', height: '4px', borderRadius: '1px', background: selected ? av.accent : '#2A3A4A', flexShrink: 0 }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Name input */}
          <div style={{ marginBottom: '16px', animation: 'fade-up 0.5s var(--ease-out) 0.3s both' }}>
            <label className="font-ui" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.06em' }}>
              YOUR NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="Enter your name..."
              maxLength={16}
              autoFocus
              className="input-field font-ui"
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: 'var(--r-md)',
                fontSize: '15px',
                fontWeight: 500,
              }}
            />
          </div>

          {/* Selected info strip */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--r-sm)',
              background: 'rgba(20,27,45,0.5)',
              border: '1px solid rgba(232,220,200,0.05)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fade-up 0.5s var(--ease-out) 0.35s both',
            }}
          >
            <span style={{ fontSize: '18px' }}>{selectedAvatar.icon}</span>
            <div>
              <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                {name.trim() || 'Citizen'} · {selectedAvatar.title}
              </div>
              <div className="font-ui" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                {selectedAvatar.subtitle}
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => handleStart()}
            disabled={name.trim().length < 2}
            className="btn-cta font-display"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '14px',
              letterSpacing: '0.12em',
              background: selectedAvatar.accent,
              color: '#000',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              opacity: name.trim().length >= 2 ? 1 : 0.4,
              boxShadow: name.trim().length >= 2 ? `0 8px 24px ${selectedAvatar.accent}40` : 'none',
              animation: 'fade-up 0.5s ease 0.4s both',
              transition: 'all 0.2s ease',
              pointerEvents: name.trim().length >= 2 ? 'auto' : 'none',
            }}
          >
            {avatar === 'hero_m' ? 'DEPLOY AS GUARDIAN' : 'RALLY AS CHAMPION'}
          </button>

          <p className="font-mono" style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', animation: 'fade-in 0.5s ease 0.5s both' }}>
            🇮🇳 Powered by Gemini AI · Election Commission of India
          </p>
        </div>
      </div>
    </div>
  );
};
