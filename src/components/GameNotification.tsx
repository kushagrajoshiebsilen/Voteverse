import React, { useEffect, useState } from 'react';

export interface Notification {
  id: string;
  type: 'item' | 'quest' | 'democracy' | 'reputation' | 'achievement' | 'warning';
  title: string;
  message: string;
  emoji: string;
}

interface Props {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const TYPE_STYLE: Record<Notification['type'], { accent: string; borderColor: string }> = {
  item:        { accent: '#FFB800', borderColor: 'rgba(255,184,0,0.4)' },
  quest:       { accent: '#B042FF', borderColor: 'rgba(176,66,255,0.4)' },
  democracy:   { accent: '#00FF88', borderColor: 'rgba(0,255,136,0.4)' },
  reputation:  { accent: '#00E5FF', borderColor: 'rgba(0,229,255,0.4)' },
  achievement: { accent: '#FFB800', borderColor: 'rgba(255,184,0,0.5)' },
  warning:     { accent: '#FF3366', borderColor: 'rgba(255,51,102,0.4)' },
};

function Toast({ n, onDismiss }: { n: Notification; onDismiss: (id: string) => void }) {
  const [show, setShow] = useState(false);
  const s = TYPE_STYLE[n.type];

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 30);
    const t2 = setTimeout(() => {
      setShow(false);
      setTimeout(() => onDismiss(n.id), 400);
    }, 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '0',
        borderRadius: '6px',
        overflow: 'hidden',
        background: 'rgba(8, 10, 17, 0.92)',
        border: `1px solid ${s.borderColor}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.7), 0 0 15px ${s.accent}20`,
        maxWidth: '300px',
        minWidth: '220px',
        opacity: show ? 1 : 0,
        transform: show ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.96)',
        transition: 'opacity 0.35s ease, transform 0.35s var(--ease-out)',
        cursor: 'pointer',
      }}
      onClick={() => { setShow(false); setTimeout(() => onDismiss(n.id), 300); }}
    >
      {/* Left neon bar */}
      <div style={{
        width: '4px',
        background: `linear-gradient(180deg, ${s.accent}, ${s.accent}55)`,
        flexShrink: 0,
        boxShadow: `0 0 10px ${s.accent}`,
      }} />

      <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 }}>
        {/* Emoji with glow */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '6px', flexShrink: 0,
          background: `${s.accent}15`, border: `1px solid ${s.accent}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', boxShadow: `inset 0 0 10px ${s.accent}10`
        }}>
          {n.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-display"
            style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
              color: s.accent, marginBottom: '4px', textTransform: 'uppercase',
              textShadow: `0 0 8px ${s.accent}`,
            }}
          >
            {n.title}
          </div>
          <div
            className="font-ui"
            style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}
          >
            {n.message}
          </div>
        </div>
      </div>

      {/* Top shimmer line */}
      <div style={{
        position: 'absolute',
        top: 0, left: '4px', right: 0, height: '1px',
        background: `linear-gradient(90deg, ${s.accent}80, transparent)`,
      }} />
    </div>
  );
}

export const GameNotification: React.FC<Props> = ({ notifications, onDismiss }) => (
  <div
    className="absolute z-30 pointer-events-none"
    style={{ top: '72px', right: '14px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}
  >
    {notifications.map(n => (
      <div key={n.id} style={{ pointerEvents: 'auto', position: 'relative' }}>
        <Toast n={n} onDismiss={onDismiss} />
      </div>
    ))}
  </div>
);
