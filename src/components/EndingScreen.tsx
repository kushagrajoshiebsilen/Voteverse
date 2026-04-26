import React, { useEffect, useState } from 'react';
import type { GameState } from '../game/types';
import { ITEMS } from '../game/constants';

interface Props {
  state: GameState;
  onReplay: () => void;
}

export const EndingScreen: React.FC<Props> = ({ state, onReplay }) => {
  const [step, setStep] = useState(0);

  const democracyAvg = Math.round(
    (state.democracyMeter.awareness + state.democracyMeter.trust + state.democracyMeter.ethics + state.democracyMeter.turnout) / 4
  );

  const getEnding = () => {
    if (democracyAvg >= 70 && state.reputation >= 150) {
      return {
        title: 'DEMOCRACY CHAMPION',
        desc: 'Your actions transformed the City of Democracy. Voter turnout hit record highs, misinformation was defeated, and every citizen\'s voice was heard. You are a true hero of Indian democracy!',
        emoji: '🏆',
        color: 'var(--saffron)',
        subtitle: 'The Ideal Citizen Ending',
      };
    } else if (democracyAvg >= 50) {
      return {
        title: 'CIVIC HERO',
        desc: 'You made a significant positive impact on the election. Your participation inspired others, and the democratic process ran smoother because of you.',
        emoji: '🌟',
        color: 'var(--teal-light)',
        subtitle: 'The Active Citizen Ending',
      };
    } else {
      return {
        title: 'FIRST STEPS',
        desc: 'You took your first steps in democracy. Every expert was once a beginner. The election happened, and you participated — that matters more than you know.',
        emoji: '🌱',
        color: '#9B8FE0',
        subtitle: 'The Participant Ending',
      };
    }
  };

  const ending = getEnding();

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500);
    const t2 = setTimeout(() => setStep(2), 3000);
    const t3 = setTimeout(() => setStep(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center p-8"
      style={{
        background: 'linear-gradient(180deg, #07090F 0%, #0D1117 100%)',
        overflowY: 'auto',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 india-stripe" />
      <div className="absolute bottom-0 left-0 right-0 h-1 india-stripe" />

      {/* Confetti / particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: i % 3 === 0 ? 'var(--saffron)' : i % 3 === 1 ? 'var(--teal)' : 'var(--india-green-light)',
              opacity: 0.2 + Math.random() * 0.3,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center anim-fade-up">
        {/* Title */}
        <div style={{ fontSize: '72px', marginBottom: '16px', filter: `drop-shadow(0 0 32px ${ending.color}55)` }}>
          {ending.emoji}
        </div>
        
        <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: ending.color, letterSpacing: '0.08em', lineHeight: 1.1, marginBottom: '8px' }}>
          {ending.title}
        </h1>
        <p className="font-mono" style={{ fontSize: '12px', letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: '32px' }}>
          {ending.subtitle.toUpperCase()}
        </p>

        <p className="font-ui" style={{ fontSize: '18px', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 48px' }}>
          {ending.desc}
        </p>

        {/* Stats Grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s var(--ease-out)' }}
        >
          {[
            { label: 'FINAL SCORE', value: state.score, icon: '⭐', color: 'var(--saffron)' },
            { label: 'REPUTATION', value: state.reputation, icon: '🛡', color: 'var(--teal-light)' },
            { label: 'DEMOCRACY %', value: `${democracyAvg}%`, icon: '📈', color: 'var(--india-green-light)' },
            { label: 'ITEMS FOUND', value: `${state.inventory.length}/6`, icon: '🎒', color: '#9B8FE0' },
          ].map((stat, i) => (
            <div
              key={i}
              className="panel-sm"
              style={{ padding: '20px 16px', borderRadius: 'var(--r-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ fontSize: '24px' }}>{stat.icon}</div>
              <div className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Meters */}
        <div
          className="panel-sm"
          style={{
            padding: '32px', borderRadius: 'var(--r-lg)', marginBottom: '48px',
            opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s var(--ease-out)',
          }}
        >
          <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px', letterSpacing: '0.04em' }}>
            DEMOCRACY IMPACT
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              { label: 'Voter Awareness', value: state.democracyMeter.awareness, color: '#9B8FE0' },
              { label: 'Public Trust', value: state.democracyMeter.trust, color: 'var(--teal)' },
              { label: 'Election Ethics', value: state.democracyMeter.ethics, color: 'var(--india-green-light)' },
              { label: 'Voter Turnout', value: state.democracyMeter.turnout, color: 'var(--saffron)' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="font-ui" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: m.color }}>{m.value}%</span>
                </div>
                <div className="meter-track" style={{ height: '6px' }}>
                  <div className="meter-fill" style={{ width: `${m.value}%`, background: `linear-gradient(90deg, ${m.color}88, ${m.color})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease' }}>
          <button
            onClick={onReplay}
            className="btn-cta"
            style={{ padding: '16px 48px', borderRadius: 'var(--r-lg)', fontSize: '16px', letterSpacing: '0.1em' }}
          >
            PLAY AGAIN
          </button>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '24px', letterSpacing: '0.15em' }}>
            🇮🇳 ELECTION COMMISSION OF INDIA · CIVIC EDUCATION
          </div>
        </div>
      </div>
    </div>
  );
};
