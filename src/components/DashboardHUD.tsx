import React, { useState } from 'react';
import type { GameState } from '../game/types';
import { ZONES } from '../game/worldData';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  children?: React.ReactNode;
}

/* ─── Design Tokens ─────────────────────────────────────── */
const BG       = '#1A1D24';
const PANEL    = '#21272F';
const PANEL_L  = '#252C37';
const BORDER   = '#2E3744';
const TEXT     = '#E2E8F0';
const MUTED    = '#6B7A8D';
const ACCENT   = '#4ADE80';      // green checkmarks / active
const GOLD     = '#F5A623';      // icons / highlights
const RED      = '#EF4444';      // alerts
const TEAL     = '#2DD4BF';      // map / trends
const BLUE     = '#60A5FA';      // voter density
const CONFIRM  = '#2C3D2C';      // confirm action bg

const f = (s: React.CSSProperties): React.CSSProperties => s;
const row  = f({ display: 'flex', alignItems: 'center' });
const col  = f({ display: 'flex', flexDirection: 'column' });
const bold = (size: number, color = TEXT): React.CSSProperties =>
  ({ fontWeight: 700, fontSize: size, color, fontFamily: "'Inter', sans-serif" });

/* ─── Tiny sub-components ───────────────────────────────── */
function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.12em',
      textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", ...style }}>
      {children}
    </div>
  );
}

function StatBlock({ icon, label, value, valueColor = TEXT }:
  { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ ...row, gap: 10 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div style={col}>
        <Label>{label}</Label>
        <span style={{ ...bold(17, valueColor), lineHeight: 1.1 }}>{value}</span>
      </div>
    </div>
  );
}

function MiniBar({ value, color, total = 100 }: { value: number; color: string; total?: number }) {
  return (
    <div style={{ height: 5, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${(value / total) * 100}%`, height: '100%', background: color,
        borderRadius: 3, boxShadow: `0 0 8px ${color}88`, transition: 'width 1s ease' }} />
    </div>
  );
}

function CheckRow({ text, done }: { text: string; done: boolean }) {
  return (
    <div style={{ ...row, gap: 10, padding: '8px 12px', borderRadius: 6,
      background: done ? 'rgba(74,222,128,0.06)' : PANEL_L,
      border: `1px solid ${done ? 'rgba(74,222,128,0.2)' : BORDER}`,
      marginBottom: 6 }}>
      <div style={{ width: 16, height: 16, borderRadius: 4,
        border: `1.5px solid ${done ? ACCENT : BORDER}`,
        background: done ? 'rgba(74,222,128,0.15)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {done && <span style={{ color: ACCENT, fontSize: 10, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: done ? MUTED : TEXT,
        textDecoration: done ? 'line-through' : 'none',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        fontFamily: "'Inter', sans-serif" }}>
        {text}
      </span>
      <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: 3,
        border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 8, color: MUTED }}>▾</span>
      </div>
    </div>
  );
}

function ApprovalChart() {
  const pts = [40, 48, 42, 58, 52, 64, 60];
  const max = 80, min = 30;
  const w = 180, h = 60;
  const toY = (v: number) => h - ((v - min) / (max - min)) * h;
  const d = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${toY(v)}`).join(' L ');
  const area = `M ${d} L ${w},${h} L 0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0.35" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#agrad)" />
      <polyline points={d} fill="none" stroke={TEAL} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((v, i) => (
        <circle key={i} cx={(i / (pts.length - 1)) * w} cy={toY(v)} r={3}
          fill={TEAL} stroke={BG} strokeWidth={1.5} />
      ))}
    </svg>
  );
}

function ResourceChart() {
  const bars = [0.35, 0.55, 0.42, 0.78, 0.62, 0.88];
  const w = 180, h = 60;
  const bw = (w / bars.length) - 6;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="rgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD} stopOpacity="1" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {bars.map((v, i) => {
        const bh = v * h;
        const x = i * (w / bars.length) + 3;
        return <rect key={i} x={x} y={h - bh} width={bw} height={bh}
          fill="url(#rgrad)" rx={2} />;
      })}
    </svg>
  );
}

function ActionBtn({ icon, label, active, badge, onClick }:
  { icon: string; label: string; active?: boolean; badge?: number; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 80, height: '100%',
      background: active ? CONFIRM : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? ACCENT + '60' : BORDER}`,
      borderRadius: 8, cursor: 'pointer',
      ...col, alignItems: 'center', justifyContent: 'center', gap: 7,
      transition: 'all 0.2s', position: 'relative',
      boxShadow: active ? `0 0 24px ${ACCENT}22` : 'none',
    }}>
      {badge !== undefined && badge > 0 && (
        <div style={{ position: 'absolute', top: 6, right: 8, width: 16, height: 16,
          borderRadius: '50%', background: RED, color: '#fff',
          fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge}
        </div>
      )}
      <span style={{ fontSize: 20, lineHeight: 1, filter: active ? 'none' : 'grayscale(60%)' }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
        color: active ? TEXT : MUTED, fontFamily: "'Inter', sans-serif",
        textTransform: 'uppercase' }}>
        {label}
      </span>
    </button>
  );
}

/* ─── Main HUD ──────────────────────────────────────────── */
export const DashboardHUD: React.FC<Props> = ({ state, onZoneTravel, children }) => {
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const activeQuest = state.quests.find(q => q.status === 'active');
  const doneCount   = activeQuest?.objectives.filter(o => o.complete).length ?? 0;
  const totalCount  = activeQuest?.objectives.length ?? 1;
  const progress    = Math.round((doneCount / totalCount) * 100);
  const dmAvg       = Math.round((state.democracyMeter.awareness + state.democracyMeter.trust +
                        state.democracyMeter.ethics + state.democracyMeter.turnout) / 4);
  const zone        = ZONES.find(z => z.id === state.currentZone);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: BG,
      display: 'grid',
      gridTemplateRows: '64px 1fr 88px',
      gridTemplateColumns: '1fr',
      fontFamily: "'Inter', sans-serif",
      color: TEXT, overflow: 'hidden',
    }}>

      {/* ══════════════ TOP STATS BAR ══════════════════════ */}
      <div style={{
        gridRow: 1, gridColumn: 1,
        ...row, justifyContent: 'space-between',
        background: PANEL, borderBottom: `1px solid ${BORDER}`,
        padding: '0 24px', gap: 0,
      }}>
        {/* Logo */}
        <div style={{ ...row, gap: 10, minWidth: 160, borderRight: `1px solid ${BORDER}`, paddingRight: 24, marginRight: 24, height: '100%' }}>
          <div style={{ width: 30, height: 30, borderRadius: 6,
            background: 'linear-gradient(135deg, #F5A623, #E8821A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900 }}>✓</div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>VoteVerse</span>
        </div>

        {/* Stats strip */}
        <div style={{ ...row, flex: 1, gap: 0, justifyContent: 'center' }}>
          {[
            { icon: '☀️', label: 'Day:', value: '14' },
            { icon: '👥', label: 'Population:', value: '8.5M', color: BLUE },
            { icon: '👍', label: 'Approval:', value: `${dmAvg}%`, color: ACCENT },
            { icon: '💰', label: 'Resources:', value: `${(state.score / 100).toFixed(1)}M`, color: GOLD },
            { icon: '💵', label: 'Budget:', value: '$7.4B', color: ACCENT },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, height: 36, background: BORDER, margin: '0 24px' }} />}
              <StatBlock icon={s.icon} label={s.label} value={s.value} valueColor={s.color} />
            </React.Fragment>
          ))}
        </div>

        {/* Time + controls */}
        <div style={{ ...row, gap: 12, borderLeft: `1px solid ${BORDER}`, paddingLeft: 24, marginLeft: 24, height: '100%' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED }}>🕐 08:00 AM</span>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
            borderRadius: 5, color: TEXT, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>▶</button>
          <button style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${BORDER}`,
            borderRadius: 5, color: TEXT, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>⏸</button>
        </div>
      </div>

      {/* ══════════════ MIDDLE ROW ═════════════════════════ */}
      <div style={{
        gridRow: 2, gridColumn: 1,
        display: 'grid',
        gridTemplateColumns: '320px 1fr 260px',
        gap: 0, overflow: 'hidden',
      }}>

        {/* ─── LEFT: Mission Card + Notifications ─── */}
        <div style={{ ...col, gap: 0, borderRight: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          {/* Mission Card */}
          <div style={{ flex: 1, padding: '20px 18px', ...col, gap: 0, overflow: 'auto',
            scrollbarWidth: 'none' }}>
            <Label style={{ marginBottom: 8 }}>Current Objective:</Label>
            <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 20 }}>
              {activeQuest ? activeQuest.title.toUpperCase() : 'MISSION 1: WIN THE CAPITAL CITY DISTRICTS'}
            </div>

            <div style={{ ...col, gap: 0, marginBottom: 18 }}>
              {activeQuest ? activeQuest.objectives.map((o, i) => (
                <CheckRow key={i} text={o.text} done={o.complete} />
              )) : (
                <>
                  <CheckRow text="Rally in District A" done={true} />
                  <CheckRow text="Secure Key Endorsements" done={false} />
                  <CheckRow text="Host Debate at University" done={false} />
                </>
              )}
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 6 }}>
              <MiniBar value={progress} color={GOLD} />
            </div>
            <Label style={{ color: GOLD }}>{progress}% Complete</Label>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: BORDER, margin: '0 18px' }} />

          {/* Notifications */}
          <div style={{ padding: '14px 18px', ...col, gap: 8 }}>
            {[
              `EVENT: PROTESTS IN ${zone?.name?.toUpperCase() ?? 'SECTOR 7'}`,
              'ALERT: OPPONENT RALLY NEARBY',
              'UPDATE: VOTER REG. DEADLINE SOON',
            ].map((msg, i) => (
              <div key={i} style={{ ...row, gap: 10, padding: '8px 12px',
                background: 'rgba(239,68,68,0.06)', borderRadius: 6,
                border: `1px solid rgba(239,68,68,0.15)` }}>
                <span style={{ fontSize: 11, color: i === 0 ? GOLD : RED }}>⚠</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.04em' }}>{msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CENTER: Playable Map ─── */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#0D1017' }}>
          {/* Game Canvas */}
          <div style={{ position: 'absolute', inset: 0 }}>
            {children}
          </div>
          {/* Gradient vignette */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(13,16,23,0.7) 100%)' }} />
          {/* Map label */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.15em',
            textTransform: 'uppercase', pointerEvents: 'none' }}>
            ▲ PLAYABLE MAP ▲
          </div>
        </div>

        {/* ─── RIGHT: Kempact + Charts ─── */}
        <div style={{ ...col, gap: 0, borderLeft: `1px solid ${BORDER}`, overflow: 'hidden' }}>

          {/* Kempact Status */}
          <div style={{ padding: '20px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ ...row, gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: PANEL_L,
                border: `2px solid ${BORDER}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, position: 'relative' }}>
                👤
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10,
                  borderRadius: '50%', background: ACCENT, border: `2px solid ${BG}` }} />
              </div>
              <div style={col}>
                <Label>Kempact Status</Label>
              </div>
            </div>

            {[
              { icon: '💰', label: 'Campaign Fund:', value: 'STABLE', color: ACCENT },
              { icon: '😐', label: 'Public Sentiment:', value: 'MODERATE', color: GOLD },
              { icon: '🔥', label: 'Opponent Activity:', value: 'HIGH', color: RED },
            ].map((item, i) => (
              <div key={i} style={{ ...row, gap: 8, marginBottom: i < 2 ? 10 : 0 }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <div style={col}>
                  <Label>{item.label}</Label>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.color,
                    letterSpacing: '0.06em' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Approval Trend */}
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}` }}>
            <Label style={{ marginBottom: 12 }}>Approval Trend</Label>
            <ApprovalChart />
          </div>

          {/* Resource Gain */}
          <div style={{ padding: '16px 18px', flex: 1 }}>
            <Label style={{ marginBottom: 12 }}>Resource Gain</Label>
            <ResourceChart />
          </div>
        </div>
      </div>

      {/* ══════════════ BOTTOM ACTION DOCK ════════════════ */}
      <div style={{
        gridRow: 3, gridColumn: 1,
        ...row, gap: 8, padding: '10px 16px',
        background: PANEL, borderTop: `1px solid ${BORDER}`,
      }}>
        {[
          { icon: '📊', label: 'Overview', id: 'overview' },
          { icon: '📢', label: 'Campaign', id: 'campaign' },
        ].map(b => (
          <ActionBtn key={b.id} icon={b.icon} label={b.label}
            active={activeBtn === b.id}
            onClick={() => setActiveBtn(v => v === b.id ? null : b.id)} />
        ))}

        {/* Spacer group */}
        <ActionBtn icon="📄" label="Policy" active={activeBtn === 'policy'}
          onClick={() => setActiveBtn(v => v === 'policy' ? null : 'policy')} />

        {/* CONFIRM ACTION — hero button */}
        <button style={{
          flex: 2, height: '100%', borderRadius: 8, cursor: 'pointer',
          background: 'linear-gradient(180deg, rgba(74,222,128,0.18), rgba(74,222,128,0.08))',
          border: `1.5px solid ${ACCENT}55`,
          boxShadow: `0 0 30px ${ACCENT}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
          color: TEXT, fontSize: 14, fontWeight: 800, letterSpacing: '0.08em',
          textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
          transition: 'all 0.2s',
        }}>
          ✦ CONFIRM ACTION
        </button>

        {[
          { icon: '💰', label: 'Finance', id: 'finance' },
          { icon: '💬', label: 'Debates', id: 'debates' },
          { icon: '👥', label: 'Staff', id: 'staff' },
          { icon: '✉️', label: 'Message Center', id: 'messages', badge: 3 as number | undefined },
        ].map(b => (
          <ActionBtn key={b.id} icon={b.icon} label={b.label} badge={b.badge}
            active={activeBtn === b.id}
            onClick={() => setActiveBtn(v => v === b.id ? null : b.id)} />
        ))}

        {/* Star icon */}
        <div style={{ width: 48, height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: MUTED, fontSize: 24, flexShrink: 0 }}>✦</div>
      </div>

    </div>
  );
};
