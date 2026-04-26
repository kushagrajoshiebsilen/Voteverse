import React, { useState } from 'react';
import type { GameState } from '../game/types';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  children?: React.ReactNode;
}

const COLORS = {
  panel: 'rgba(28, 34, 46, 0.92)',
  borderMuted: 'rgba(255, 255, 255, 0.1)',
  borderAccent: '#FCA5A5', // Soft orange/peach
  textMain: '#E2E8F0',
  textAccent: '#FDBA74', // Orange/gold text
  textMuted: '#94A3B8'
};

const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

function FloatingPanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.panel,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${COLORS.borderMuted}`,
      borderRadius: '8px',
      padding: '16px',
      ...style
    }}>
      {children}
    </div>
  );
}

export const DashboardHUD: React.FC<Props> = ({ state, children }) => {
  const activeQuest = state.quests.find(q => q.status === 'active');
  const level = Math.floor(state.reputation / 100) + 1;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      fontFamily: "'Inter', monospace",
      pointerEvents: 'none', // Let clicks pass through to canvas
      overflow: 'hidden'
    }}>
      {/* ── CANVAS UNDERNEATH ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
        {children}
      </div>

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'absolute', top: '16px', left: '16px', right: '16px',
        height: '48px', ...row, justifyContent: 'space-between',
        background: COLORS.panel, backdropFilter: 'blur(10px)',
        border: `1px solid ${COLORS.borderMuted}`, borderRadius: '8px',
        padding: '0 24px', pointerEvents: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Logo */}
        <div style={{ ...row, gap: '12px' }}>
          <div style={{ color: COLORS.textAccent, fontSize: '20px', filter: 'drop-shadow(0 0 4px rgba(253,186,116,0.5))' }}>☑</div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: COLORS.textMain, letterSpacing: '0.05em' }}>VOTE VERSE</span>
        </div>

        {/* Stats */}
        <div style={{ ...row, gap: '24px', fontSize: '12px', color: COLORS.textAccent, fontWeight: 600, letterSpacing: '0.05em' }}>
          <span>[LEVEL {level} | DISTRICT OBSERVER]</span>
          <span>[POPULATION: {(8500 + state.reputation * 10).toLocaleString()}]</span>
          <span>[FUNDS: ${(state.score * 10).toLocaleString()}]</span>
          <span>[ELECTION CYCLE: {Math.max(1, 14 - Math.floor(state.score/500))} DAYS LEFT]</span>
          <span>[TIME: 14:30]</span>
        </div>
      </div>

      {/* ── LEFT SIDEBAR (Missions) ── */}
      <div style={{
        position: 'absolute', top: '80px', left: '16px', width: '320px',
        ...col, gap: '16px', pointerEvents: 'auto'
      }}>
        <FloatingPanel style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: COLORS.textAccent, fontWeight: 600, marginBottom: '16px', letterSpacing: '0.05em' }}>
            [MISSIONS - ACTIVE]
          </div>
          
          <div style={{ borderBottom: `1px solid ${COLORS.borderMuted}`, paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: COLORS.textMain, fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>
              [MISSION: {activeQuest ? activeQuest.title.toUpperCase() : "MAINTAIN DEMOCRACY"}]
            </div>
            <div style={{ fontSize: '10px', color: COLORS.textMuted, marginBottom: '12px', letterSpacing: '0.05em' }}>
              GOAL: COMPLETE OBJECTIVES ({activeQuest ? activeQuest.objectives.filter(o => o.complete).length : 0}/{activeQuest ? activeQuest.objectives.length : 0})
            </div>
            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: activeQuest ? `${(activeQuest.objectives.filter(o => o.complete).length / activeQuest.objectives.length) * 100}%` : '100%', 
                height: '100%', background: COLORS.textAccent, borderRadius: '3px',
                boxShadow: `0 0 10px ${COLORS.textAccent}`
              }} />
            </div>
          </div>

          <div style={{ ...col, gap: '10px' }}>
            {activeQuest ? activeQuest.objectives.map((obj, i) => (
              <div key={i} style={{ ...row, gap: '8px' }}>
                <div style={{ 
                  width: '14px', height: '14px', borderRadius: '50%', 
                  border: `1px solid ${obj.complete ? COLORS.textAccent : COLORS.textMuted}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {obj.complete && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS.textAccent }} />}
                </div>
                <span style={{ fontSize: '10px', color: obj.complete ? COLORS.textMuted : COLORS.textMain, letterSpacing: '0.05em', textDecoration: obj.complete ? 'line-through' : 'none' }}>
                  [{obj.text.toUpperCase()}]
                </span>
              </div>
            )) : (
              <span style={{ fontSize: '10px', color: COLORS.textMuted }}>[NO ACTIVE MISSIONS]</span>
            )}
          </div>
        </FloatingPanel>

        <FloatingPanel>
          <div style={{ fontSize: '10px', color: COLORS.textAccent, fontWeight: 600, marginBottom: '4px', letterSpacing: '0.05em' }}>
            [CURRENT TASK:
          </div>
          <div style={{ fontSize: '11px', color: COLORS.textMain, fontWeight: 700, letterSpacing: '0.05em' }}>
            EXPLORE THE DISTRICT]
          </div>
        </FloatingPanel>
      </div>

      {/* ── BOTTOM DOCK ── */}
      <div style={{
        position: 'absolute', bottom: '16px', left: '16px', right: '16px',
        ...col, gap: '4px', pointerEvents: 'auto'
      }}>
        <div style={{ fontSize: '10px', color: COLORS.textAccent, fontWeight: 600, letterSpacing: '0.05em', paddingLeft: '8px' }}>
          ACTION DOCK
        </div>
        <div style={{
          height: '70px', ...row, gap: '8px',
          background: COLORS.panel, backdropFilter: 'blur(10px)',
          border: `1px solid ${COLORS.borderMuted}`, borderRadius: '8px',
          padding: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {[
            { icon: '👥', label: 'DEPLOY TEAM' },
            { icon: '❗', label: 'RESOLVE ISSUE' },
            { icon: '🔍', label: 'REVIEW DATA' },
            { icon: '📄', label: 'VIEW REPORTS' },
            { icon: '✉️', label: 'MESSAGES' },
            { icon: '🗺️', label: 'MAP VIEW' },
            { icon: '⚙️', label: 'SETTINGS' }
          ].map((btn, i) => (
            <button key={i} style={{
              flex: 1, height: '100%',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${COLORS.borderMuted}`,
              borderRadius: '6px',
              ...col, alignItems: 'center', justifyContent: 'center', gap: '6px',
              cursor: 'pointer', transition: 'all 0.2s',
              color: COLORS.textMain
            }}>
              <span style={{ fontSize: '18px', filter: 'grayscale(100%) brightness(1.5)' }}>{btn.icon}</span>
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em', color: COLORS.textMain }}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MINIMAP (Bottom Right) ── */}
      <div style={{
        position: 'absolute', bottom: '110px', right: '16px',
        width: '200px', height: '140px',
        background: COLORS.panel, backdropFilter: 'blur(10px)',
        border: `1px solid ${COLORS.borderMuted}`, borderRadius: '8px',
        pointerEvents: 'auto', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
         {/* Fake radar background */}
         <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `repeating-linear-gradient(45deg, ${COLORS.textAccent}, ${COLORS.textAccent} 1px, transparent 1px, transparent 10px)` }} />
         {/* Player Dot */}
         <div style={{
           position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
           width: '6px', height: '6px', borderRadius: '50%', background: COLORS.textAccent,
           boxShadow: `0 0 8px ${COLORS.textAccent}`, animation: 'pulse-soft 1.5s infinite'
         }} />
      </div>

    </div>
  );
};

