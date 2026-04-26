import React, { useState } from 'react';
import type { GameState } from '../game/types';
import { ZONES } from '../game/worldData';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  children?: React.ReactNode;
}

const COLORS = {
  bg: '#1A1D24',
  panel: '#21262D',
  accent: '#2DD4BF',
  green: '#4ADE80',
  red: '#F87171',
  yellow: '#FACC15',
  text: '#FFFFFF',
  muted: '#8B949E',
  border: '#30363D'
};

const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLORS.panel,
      borderRadius: '12px',
      padding: '16px',
      border: `1px solid ${COLORS.border}`,
      ...style
    }}>
      {children}
    </div>
  );
}

function StatItem({ icon, value, label, color = COLORS.text }: { icon?: string; value: string; label: string; color?: string }) {
  return (
    <div style={{ ...row, gap: '12px' }}>
      {icon && <span style={{ fontSize: '24px', color }}>{icon}</span>}
      <div style={col}>
        <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '18px', color, fontWeight: 800 }}>{value}</span>
      </div>
    </div>
  );
}

export const DashboardHUD: React.FC<Props> = ({ state, onZoneTravel, children }) => {
  const activeQuest = state.quests.find(q => q.status === 'active');
  const democracyAvg = Math.round(
    (state.democracyMeter.awareness + state.democracyMeter.trust + state.democracyMeter.ethics + state.democracyMeter.turnout) / 4
  );

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'grid',
      gridTemplateAreas: `
        "top top top"
        "left center right"
        "bottom bottom bottom"
      `,
      gridTemplateColumns: '320px 1fr 280px',
      gridTemplateRows: '80px 1fr 100px',
      gap: '16px',
      padding: '16px',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* ══ TOP BAR ══ */}
      <Panel style={{ gridArea: 'top', ...row, justifyContent: 'space-between', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ ...row, gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>VoteVerse</span>
        </div>

        {/* Stats */}
        <div style={{ ...row, gap: '32px' }}>
          <StatItem icon="☀️" label="Day" value="14" color={COLORS.yellow} />
          <div style={{ width: '1px', height: '30px', background: COLORS.border }} />
          <StatItem icon="👥" label="Population" value="8.5M" color={COLORS.accent} />
          <div style={{ width: '1px', height: '30px', background: COLORS.border }} />
          <StatItem icon="👍" label="Approval" value={`${democracyAvg}%`} color={COLORS.green} />
          <div style={{ width: '1px', height: '30px', background: COLORS.border }} />
          <StatItem icon="🪙" label="Resources" value={`${state.score.toLocaleString()}`} color={COLORS.yellow} />
          <div style={{ width: '1px', height: '30px', background: COLORS.border }} />
          <StatItem icon="💲" label="Budget" value={`$7.4B`} color={COLORS.green} />
        </div>

        {/* Time Controls */}
        <div style={{ ...row, gap: '12px', background: COLORS.bg, padding: '8px 12px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.muted }}>🕑 08:00 AM</span>
          <div style={{ ...row, gap: '4px' }}>
            <button style={{ background: COLORS.panel, border: 'none', color: '#FFF', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>▶</button>
            <button style={{ background: COLORS.panel, border: 'none', color: '#FFF', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>⏸</button>
          </div>
        </div>
      </Panel>

      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{ gridArea: 'left', ...col, gap: '16px' }}>
        {/* Mission Card */}
        <Panel style={{ flex: 1, ...col }}>
          <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: 700 }}>CURRENT OBJECTIVE:</span>
          <span style={{ fontSize: '16px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', color: COLORS.text }}>
            {activeQuest ? activeQuest.title : "MAINTAIN DEMOCRACY"}
          </span>
          
          <div style={{ ...col, gap: '8px', flex: 1 }}>
            {activeQuest ? activeQuest.objectives.map((obj, i) => (
              <div key={i} style={{ ...row, gap: '10px', padding: '12px', background: obj.complete ? 'rgba(45, 212, 191, 0.1)' : COLORS.bg, border: `1px solid ${obj.complete ? COLORS.accent : COLORS.border}`, borderRadius: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${obj.complete ? COLORS.accent : COLORS.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {obj.complete && <span style={{ color: COLORS.accent, fontSize: '12px' }}>✓</span>}
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: obj.complete ? COLORS.accent : COLORS.text }}>{obj.text}</span>
              </div>
            )) : (
              <div style={{ fontSize: '12px', color: COLORS.muted }}>No active missions.</div>
            )}
          </div>

          <div style={{ marginTop: 'auto' }}>
            <div style={{ height: '6px', background: COLORS.bg, borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ width: activeQuest ? '45%' : '100%', height: '100%', background: COLORS.accent, borderRadius: '3px' }} />
            </div>
            <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: 600 }}>{activeQuest ? '45%' : '100%'} COMPLETE</span>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel style={{ height: '140px', ...col, gap: '8px' }}>
          {[
            { msg: 'EVENT: ELECTION RALLY IN SECTOR 2', color: COLORS.yellow },
            { msg: 'ALERT: PROTESTS AT CITY HALL', color: COLORS.red },
            { msg: 'UPDATE: NEW POLICIES DRAFTED', color: COLORS.accent }
          ].map((n, i) => (
            <div key={i} style={{ ...row, gap: '8px', padding: '8px 12px', background: COLORS.bg, borderRadius: '6px', borderLeft: `3px solid ${n.color}` }}>
              <span style={{ fontSize: '12px' }}>🔔</span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: COLORS.muted }}>{n.msg}</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* ══ CENTER MAP AREA ══ */}
      <div style={{
        gridArea: 'center',
        borderRadius: '12px',
        border: `1px solid ${COLORS.border}`,
        overflow: 'hidden',
        position: 'relative',
        background: '#030508' // Fallback for canvas
      }}>
        {children}
        
        {/* Optional: Map Overlay Elements (like glowing dots) could go here if we wanted to fake a 2D map over the canvas */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' }} />
      </div>

      {/* ══ RIGHT SIDEBAR ══ */}
      <div style={{ gridArea: 'right', ...col, gap: '16px' }}>
        {/* Kempact Status */}
        <Panel style={{ ...col, gap: '16px' }}>
          <div style={{ ...row, gap: '12px', paddingBottom: '16px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👨‍💼</div>
            <div style={{ ...col }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>LEADER</span>
              <span style={{ fontSize: '10px', color: COLORS.green }}>ACTIVE</span>
            </div>
          </div>

          <div style={{ ...col, gap: '12px' }}>
            <StatItem icon="💵" label="Campaign Fund" value="STABLE" color={COLORS.green} />
            <StatItem icon="🙂" label="Public Sentiment" value="MODERATE" color={COLORS.yellow} />
            <StatItem icon="🔥" label="Opponent Activity" value="HIGH" color={COLORS.red} />
          </div>
        </Panel>

        {/* Approval Trend Chart */}
        <Panel style={{ flex: 1, ...col }}>
          <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: 700, marginBottom: '12px' }}>APPROVAL TREND</span>
          <div style={{ flex: 1, background: `linear-gradient(0deg, rgba(45, 212, 191, 0.2) 0%, transparent 100%)`, borderRadius: '6px', border: `1px solid ${COLORS.border}`, position: 'relative', overflow: 'hidden' }}>
            {/* Fake Chart SVG */}
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <path d="M0,50 L0,40 L20,35 L40,45 L60,25 L80,30 L100,10 L100,50 Z" fill="rgba(45,212,191,0.1)" />
              <path d="M0,40 L20,35 L40,45 L60,25 L80,30 L100,10" fill="none" stroke={COLORS.accent} strokeWidth="2" />
            </svg>
          </div>
        </Panel>

        {/* Resource Gain Chart */}
        <Panel style={{ flex: 1, ...col }}>
          <span style={{ fontSize: '10px', color: COLORS.muted, fontWeight: 700, marginBottom: '12px' }}>RESOURCE GAIN</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '8px', border: `1px solid ${COLORS.border}`, borderRadius: '6px' }}>
            {[30, 50, 40, 80, 60, 90].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(0deg, ${COLORS.yellow}, rgba(250, 204, 21, 0.4))`, borderRadius: '2px 2px 0 0' }} />
            ))}
          </div>
        </Panel>
      </div>

      {/* ══ BOTTOM BAR ══ */}
      <div style={{ gridArea: 'bottom', ...row, gap: '12px', justifyContent: 'center' }}>
        {[
          { icon: '📊', label: 'OVERVIEW' },
          { icon: '📢', label: 'CAMPAIGN' },
          { icon: '📄', label: 'POLICY' },
          { icon: '✨', label: 'CONFIRM ACTION', primary: true },
          { icon: '💰', label: 'FINANCE' },
          { icon: '💬', label: 'DEBATES' },
          { icon: '👥', label: 'STAFF' },
          { icon: '✉️', label: 'MESSAGES' }
        ].map((btn, i) => (
          <button key={i} style={{
            flex: btn.primary ? 2 : 1,
            height: '100%',
            background: btn.primary ? `linear-gradient(180deg, rgba(45, 212, 191, 0.2), rgba(45, 212, 191, 0.05))` : COLORS.panel,
            border: `1px solid ${btn.primary ? COLORS.accent : COLORS.border}`,
            borderRadius: '12px',
            color: COLORS.text,
            ...col, alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: btn.primary ? `0 0 20px rgba(45, 212, 191, 0.2)` : 'none'
          }}>
            <span style={{ fontSize: btn.primary ? '0' : '20px' }}>{btn.primary ? '' : btn.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em', color: btn.primary ? COLORS.text : COLORS.muted }}>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
