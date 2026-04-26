/**
 * RoleIntro — Full-screen role briefing shown ONCE when game starts.
 * Guardian: calm civic-tech, navy/teal brief
 * Champion: energetic movement, saffron/coral rally
 */
import React, { useState, useEffect } from 'react';
import type { PlayerRole } from '../game/types';

interface Props {
  role: PlayerRole;
  playerName: string;
  onComplete: () => void;
}

const GUARDIAN_LINES = [
  { text: 'The system depends on guardians.', delay: 0 },
  { text: 'People come to you when the process breaks down.', delay: 1200 },
  { text: 'You verify. You protect. You enforce.', delay: 2600 },
  { text: 'Democracy is only as strong as its safeguards.', delay: 4000 },
];

const CHAMPION_LINES = [
  { text: 'The streets are where democracy lives.', delay: 0 },
  { text: 'People are confused, misinformed, left behind.', delay: 1200 },
  { text: 'You rally. You expose. You mobilize.', delay: 2600 },
  { text: 'Your voice is your most powerful weapon.', delay: 4000 },
];

const GUARDIAN_MISSIONS = [
  { icon: '📋', title: 'Verify voter registrations', desc: 'Help citizens confirm their eligibility' },
  { icon: '🏛', title: 'Inspect polling booths',     desc: 'Ensure process compliance and safety' },
  { icon: '⚖️', title: 'Uphold the Model Code',     desc: 'Identify and report violations' },
  { icon: '🛡', title: 'Protect civic rights',       desc: 'No voter should be turned away' },
];

const CHAMPION_MISSIONS = [
  { icon: '📢', title: 'Spread voter awareness',    desc: 'Reach every unregistered citizen' },
  { icon: '🚩', title: 'Flag misinformation',       desc: 'Expose fake news and false narratives' },
  { icon: '👥', title: 'Mobilize youth voters',     desc: 'Turn apathy into participation' },
  { icon: '📱', title: 'Digital outreach',          desc: 'Use cVIGIL and Voter Helpline' },
];

export const RoleIntro: React.FC<Props> = ({ role, playerName, onComplete }) => {
  const [step, setStep] = useState(-1);
  const [showMissions, setShowMissions] = useState(false);
  const [ready, setReady] = useState(false);

  const isGuardian = role === 'guardian';
  const lines      = isGuardian ? GUARDIAN_LINES : CHAMPION_LINES;
  const missions   = isGuardian ? GUARDIAN_MISSIONS : CHAMPION_MISSIONS;

  // Guardian: navy / teal
  const bg1   = isGuardian ? '#0B1929' : '#13100E';
  const bg2   = isGuardian ? '#0F2035' : '#1A1208';
  const acc   = isGuardian ? '#2ABFBF' : '#F5A623';
  const acc2  = isGuardian ? '#4B7FA8' : '#E8634A';
  const ow    = isGuardian ? '#E8ECF0' : '#F2EDE4';
  const mu    = isGuardian ? '#6E8BA4' : '#8A7B6A';
  const icon  = isGuardian ? '⚖️' : '📢';
  const title = isGuardian ? 'GUARDIAN' : 'CHAMPION';
  const sub   = isGuardian ? 'Protector of Civic Rights' : 'Voice of the People';
  const missionTitle = isGuardian ? 'YOUR ASSIGNMENT' : 'YOUR CAMPAIGN';
  const cta   = isGuardian ? 'BEGIN DUTY' : 'TAKE THE STAGE';

  useEffect(() => {
    lines.forEach((l, i) => {
      setTimeout(() => setStep(i), l.delay + 400);
    });
    setTimeout(() => setShowMissions(true), 5800);
    setTimeout(() => setReady(true), 6400);
  }, []);

  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: `radial-gradient(ellipse at 40% 30%, ${bg2} 0%, ${bg1} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: isGuardian
          ? `repeating-linear-gradient(0deg, ${acc} 0, ${acc} 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, ${acc} 0, ${acc} 1px, transparent 1px, transparent 60px)`
          : `repeating-radial-gradient(circle at 50% 50%, ${acc} 0, transparent 2px, transparent 40px)`,
        pointerEvents: 'none',
      }} />

      {/* Top and bottom accent bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${acc}, ${acc2}, ${acc})` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${acc2}, ${acc}, ${acc2})` }} />

      <div style={{ width: '100%', maxWidth: 800, padding: '0 32px', ...col, alignItems: 'center' }}>

        {/* Role badge */}
        <div style={{
          ...row, gap: 16, marginBottom: 32,
          padding: '16px 32px', borderRadius: 12,
          background: `${acc}14`, border: `2px solid ${acc}`,
          boxShadow: isGuardian ? `0 0 40px ${acc}20` : `0 8px 40px ${acc}25`,
          animation: 'fade-up 0.6s ease both',
        }}>
          <span style={{ fontSize: 52, filter: `drop-shadow(0 0 16px ${acc}80)` }}>{icon}</span>
          <div style={col}>
            <span style={{ fontSize: 11, fontWeight: 700, color: mu, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>ROLE ASSIGNMENT</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: acc, letterSpacing: '0.08em', lineHeight: 1, fontFamily: isGuardian ? 'Inter, sans-serif' : 'Inter, sans-serif' }}>{title}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: mu, marginTop: 4, letterSpacing: '0.06em' }}>{sub}</span>
          </div>
        </div>

        {/* Player greeting */}
        <div style={{ fontSize: 14, color: mu, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 28, animation: 'fade-up 0.6s 0.2s ease both' }}>
          Welcome, <span style={{ color: ow, fontWeight: 700 }}>{playerName}</span>
        </div>

        {/* Cinematic lines */}
        <div style={{ ...col, alignItems: 'center', gap: 10, minHeight: 140, marginBottom: 32, width: '100%', maxWidth: 560, textAlign: 'center' }}>
          {lines.slice(0, step + 1).map((l, i) => (
            <p key={i} style={{
              fontSize: i === step ? (isGuardian ? 20 : 22) : 16,
              fontWeight: i === step ? 700 : 400,
              color: i === step ? ow : mu,
              lineHeight: 1.5,
              opacity: step - i > 1 ? 0.35 : 1,
              transition: 'all 0.6s ease',
              animation: i === step ? 'fade-up 0.5s ease both' : 'none',
            }}>
              {l.text}
            </p>
          ))}
        </div>

        {/* Mission cards */}
        {showMissions && (
          <div style={{ width: '100%', animation: 'fade-up 0.5s ease both' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: acc, letterSpacing: '0.3em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>
              {missionTitle}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {missions.map((m, i) => (
                <div key={i} style={{
                  ...col, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 8,
                  background: `${acc}09`, border: `1px solid ${acc}25`,
                  borderTop: `3px solid ${i % 2 === 0 ? acc : acc2}`,
                  animation: `fade-up 0.5s ${0.1 + i * 0.08}s ease both`,
                }}>
                  <span style={{ fontSize: 22, marginBottom: 8, filter: `drop-shadow(0 0 4px ${acc}60)` }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ow, marginBottom: 4, lineHeight: 1.3 }}>{m.title}</span>
                  <span style={{ fontSize: 11, color: mu, lineHeight: 1.4 }}>{m.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA button */}
        {ready && (
          <button onClick={onComplete} style={{
            marginTop: 28, padding: '16px 48px', borderRadius: 8,
            fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: isGuardian ? `${acc}18` : `linear-gradient(90deg, ${acc}25, ${acc2}20)`,
            border: `2px solid ${acc}`, color: acc,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            boxShadow: `0 0 24px ${acc}30`,
            transition: 'all 0.2s ease',
            animation: 'fade-up 0.5s ease both',
          }}>
            {cta} →
          </button>
        )}

        {/* Skip */}
        {step >= 0 && !ready && (
          <button onClick={() => { setStep(lines.length - 1); setTimeout(() => { setShowMissions(true); setReady(true); }, 300); }}
            style={{ marginTop: 24, background: 'none', border: 'none', color: mu, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 12, letterSpacing: '0.1em' }}>
            skip intro →
          </button>
        )}
      </div>
    </div>
  );
};
