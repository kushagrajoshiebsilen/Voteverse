import React from 'react';
import type { GameState } from '../game/types';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  children?: React.ReactNode;
}

const C = {
  bg: '#698784', // Map background slate-teal
  panelBg: '#212936', // Dark blue-grey
  panelBorder: '#354052', // Lighter border
  accent: '#F3B760', // Warm amber/yellow
  text: '#FFFFFF',
  textDim: '#A0ADC0',
  textMuted: '#68778D',
  success: '#68A096', // Muted teal for checkmarks
};

// Bracketed text component
const BracketText = ({ children, color = C.textDim, style }: { children: React.ReactNode; color?: string, style?: React.CSSProperties }) => (
  <span style={{ color, letterSpacing: '0.05em', ...style }}>
    [{children}]
  </span>
);

export const DashboardHUD: React.FC<Props> = ({ state, onZoneTravel, children }) => {
  const quest = state.quests.find(q => q.status === 'active');
  const level = Math.max(1, Math.floor(state.reputation / 100) + 1);

  const completedObj = quest?.objectives.filter(o => o.complete).length || 0;
  const totalObj = quest?.objectives.length || 1;
  const progressPct = quest ? (completedObj / totalObj) * 100 : 100;
  
  const currentTask = quest?.objectives.find(o => !o.complete)?.text || "WAITING FOR ORDERS";

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      backgroundColor: C.bg,
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      fontSize: 12,
      fontWeight: 500,
      textTransform: 'uppercase',
      color: C.text,
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      {/* CANVAS LAYER */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        {children}
      </div>

      {/* ─── TOP BAR ─── */}
      <div style={{
        position: 'absolute', top: 12, left: 16, right: 16, height: 48,
        backgroundColor: C.panelBg,
        borderRadius: 8,
        border: `1px solid ${C.panelBorder}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: C.accent, fontSize: 20 }}>☑</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.05em' }}>VOTE VERSE</div>
        </div>

        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          <BracketText color={C.accent}>LEVEL {level} | DISTRICT OBSERVER</BracketText>
          <BracketText>POPULATION: {(12500 + state.reputation * 10).toLocaleString()}</BracketText>
          <BracketText>FUNDS: ${(25000 + state.score * 10).toLocaleString()}</BracketText>
          <BracketText>ELECTION CYCLE: 2 DAYS LEFT</BracketText>
          <BracketText>TIME: 14:30</BracketText>
        </div>
      </div>

      {/* ─── LEFT MISSION COLUMN ─── */}
      <div style={{
        position: 'absolute', top: 76, left: 16, width: 340,
        display: 'flex', flexDirection: 'column', gap: 12,
        pointerEvents: 'auto',
      }}>
        {/* Active Missions Panel */}
        <div style={{
          backgroundColor: C.panelBg,
          borderRadius: 8,
          border: `1px solid ${C.panelBorder}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          padding: 16,
        }}>
          <BracketText color={C.accent} style={{ display: 'block', marginBottom: 16 }}>MISSIONS - ACTIVE</BracketText>
          
          <BracketText color={C.textDim} style={{ display: 'block', marginBottom: 4 }}>MISSION: {quest?.title.toUpperCase() || 'STANDBY'}</BracketText>
          
          <div style={{ color: C.textDim, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>GOAL: {quest?.description.toUpperCase() || 'AWAITING MISSION'}</span>
            <span>({completedObj}/{totalObj})</span>
          </div>

          <div style={{ height: 6, backgroundColor: C.panelBorder, borderRadius: 3, marginBottom: 20, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: C.accent, borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quest ? quest.objectives.map((obj, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ 
                  width: 16, height: 16, borderRadius: '50%', 
                  border: `1.5px solid ${obj.complete ? C.success : C.textMuted}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.success, fontSize: 10
                }}>
                  {obj.complete && '✓'}
                </div>
                <BracketText color={obj.complete ? C.textDim : C.textMuted}>{obj.text.toUpperCase()}</BracketText>
              </div>
            )) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${C.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.success, fontSize: 10 }}>✓</div>
                  <BracketText color={C.textDim}>RESOLVE LOCAL DISPUTES</BracketText>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${C.success}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.success, fontSize: 10 }}>✓</div>
                  <BracketText color={C.textDim}>INCREASE ENGAGEMENT</BracketText>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Current Task Panel */}
        <div style={{
          backgroundColor: C.panelBg,
          borderRadius: 8,
          border: `1px solid ${C.panelBorder}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          padding: 16,
        }}>
          <BracketText color={C.accent} style={{ display: 'block', marginBottom: 8 }}>CURRENT TASK:</BracketText>
          <span style={{ color: C.textDim }}>{currentTask.toUpperCase()}</span>
        </div>
      </div>

      {/* ─── BOTTOM ACTION DOCK ─── */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        pointerEvents: 'auto',
      }}>
        <div style={{ color: C.accent, marginBottom: 4, paddingLeft: 4 }}>ACTION DOCK</div>
        
        <div style={{
          backgroundColor: C.panelBg,
          borderRadius: 8,
          border: `1px solid ${C.panelBorder}`,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
        }}>
          {[
            { icon: '👥', label: 'DEPLOY TEAM' },
            { icon: '!', label: 'RESOLVE ISSUE' },
            { icon: '🔍', label: 'REVIEW DATA' },
            { icon: '📄', label: 'VIEW REPORTS' },
            { icon: '✉️', label: 'MESSAGES' },
            { icon: '🗺️', label: 'MAP VIEW' },
            { icon: '⚙️', label: 'SETTINGS' },
          ].map((btn, i) => (
            <button key={i} aria-label={btn.label} style={{
              flex: 1,
              backgroundColor: '#2A3441',
              border: 'none',
              borderRadius: 6,
              padding: '12px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              color: C.textDim,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#323E4D'; e.currentTarget.style.color = C.accent; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2A3441'; e.currentTarget.style.color = C.textDim; }}
            onFocus={(e) => { e.currentTarget.style.backgroundColor = '#323E4D'; e.currentTarget.style.color = C.accent; }}
            onBlur={(e) => { e.currentTarget.style.backgroundColor = '#2A3441'; e.currentTarget.style.color = C.textDim; }}
            onClick={() => {
              if (btn.label === 'MAP VIEW') {
                const zones = ['neighborhood', 'polling', 'campaign', 'registration', 'results'];
                const currentIndex = zones.indexOf(state.currentZone);
                const nextZone = zones[(currentIndex + 1) % zones.length];
                onZoneTravel(nextZone);
              }
            }}
            >
              <span style={{ fontSize: 20, filter: 'sepia(1) hue-rotate(-30deg) saturate(3) brightness(0.9) opacity(0.8)' }}>{btn.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{btn.label}</span>
            </button>
          ))}
          
          {/* Right side icon */}
          <div style={{
            width: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#3A485A', fontSize: 32
          }}>
            ✦
          </div>
        </div>
      </div>

      {/* ─── MINIMAP (BOTTOM RIGHT) ─── */}
      <div style={{
        position: 'absolute', bottom: 124, right: 16,
        width: 180, height: 120,
        backgroundColor: '#2C3645',
        borderRadius: 8,
        border: `1px solid ${C.panelBorder}`,
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        padding: 4
      }}>
        <div style={{ width: '100%', height: '100%', backgroundColor: '#212936', borderRadius: 4, position: 'relative' }}>
          {/* Fake minimap content matching reference */}
          <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 30, backgroundColor: '#3A485A' }} />
          <div style={{ position: 'absolute', top: 10, right: 20, width: 50, height: 40, backgroundColor: '#3A485A' }} />
          <div style={{ position: 'absolute', bottom: 15, left: 50, width: 60, height: 25, backgroundColor: '#3A485A' }} />
          {/* Vertical dividing line */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: 1, backgroundColor: '#698784', opacity: 0.5 }} />
          {/* Player dot */}
          <div style={{ position: 'absolute', top: '50%', left: '55%', width: 4, height: 4, backgroundColor: C.accent, borderRadius: '50%', boxShadow: `0 0 6px ${C.accent}` }} />
        </div>
      </div>

    </div>
  );
};
