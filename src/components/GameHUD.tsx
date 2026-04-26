import React, { useState } from 'react';
import type { GameState } from '../game/types';
import { ITEMS, ZONE_COLORS } from '../game/constants';
import { ZONES } from '../game/worldData';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  apiKey: string;
  onSetApiKey: (key: string) => void;
}

const CYAN = '#00E5FF';
const GOLD = '#FFB800';
const GREEN = '#00FF88';
const PURPLE = '#B042FF';
const DANGER = '#FF3366';

const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const glass = (border = CYAN): React.CSSProperties => ({
  background: 'rgba(8,10,17,0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${border}40`,
  boxShadow: `0 4px 24px rgba(0,0,0,0.7), 0 0 0 1px ${border}10 inset`,
});

// ── Stat chip ────────────────────────────────────────────────
function Stat({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div style={{ ...row, gap: 10, padding: '8px 14px', borderRadius: 6, borderLeft: `3px solid ${color}`, ...glass(color) }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={col}>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 800, color, textShadow: `0 0 8px ${color}80`, lineHeight: 1 }}>{value}</span>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 600, color: '#5A6B8A', letterSpacing: '0.2em', marginTop: 2 }}>{label}</span>
      </div>
    </div>
  );
}

// ── Meter ────────────────────────────────────────────────────
function Meter({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...row, justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.05em' }}>{icon} {label}</span>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, color, textShadow: `0 0 6px ${color}` }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(15,21,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: `linear-gradient(90deg, transparent, ${color})`, borderRadius: 1, transition: 'width 0.8s ease', boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

// ── Side panel ───────────────────────────────────────────────
function Panel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, zIndex: 40,
      ...glass(CYAN),
      borderLeft: `2px solid ${CYAN}40`,
      borderRadius: 0,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-left 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      {/* Header */}
      <div style={{ ...row, justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${CYAN}20`, background: `rgba(0,229,255,0.04)` }}>
        <div style={{ ...row, gap: 10 }}>
          <div style={{ width: 3, height: 18, background: CYAN, borderRadius: 2, boxShadow: `0 0 8px ${CYAN}` }} />
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 13, fontWeight: 700, color: CYAN, letterSpacing: '0.18em', textShadow: `0 0 10px ${CYAN}60` }}>{title}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: `1px solid rgba(255,255,255,0.1)`, color: '#A0ABC0', cursor: 'pointer', padding: '4px 10px', borderRadius: 4, fontSize: 15, lineHeight: 1, transition: 'all 0.2s' }}>✕</button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', scrollbarWidth: 'thin', scrollbarColor: `${CYAN}30 transparent` }}>
        {children}
      </div>
    </div>
  );
}

// ── Section divider ──────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div style={{ ...row, gap: 10, marginBottom: 14, marginTop: 8 }}>
      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 10, color: CYAN, letterSpacing: '0.22em', whiteSpace: 'nowrap', textTransform: 'uppercase', opacity: 0.8 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${CYAN}40, transparent)` }} />
    </div>
  );
}

// ── Minimap ──────────────────────────────────────────────────
function Minimap({ state, zone }: { state: GameState; zone: any }) {
  const mapW = 180; const mapH = 120;
  const scale = 0.12;

  return (
    <div style={{
      position: 'absolute', top: 80, right: 24, zIndex: 20,
      width: mapW, height: mapH, ...glass(CYAN),
      borderRadius: '8px', overflow: 'hidden', padding: 0
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `repeating-linear-gradient(45deg, ${CYAN}, ${CYAN} 1px, transparent 1px, transparent 10px)` }} />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
         {/* Player Dot */}
         <div style={{
           position: 'absolute',
           left: mapW/2 + (state.player.pos.x - state.player.pos.y) * 0.866 * scale - 4,
           top: mapH/2 + (state.player.pos.x + state.player.pos.y) * 0.5 * scale - 4,
           width: 8, height: 8, borderRadius: '50%', background: '#00E5FF',
           boxShadow: '0 0 8px #00E5FF', animation: 'pulse-soft 1.5s infinite', zIndex: 5
         }} />
         
         {/* NPC Blips */}
         {zone.npcs.map((n: any) => (
           <div key={n.id} style={{
             position: 'absolute',
             left: mapW/2 + (n.pos.x - n.pos.y) * 0.866 * scale - 3,
             top: mapH/2 + (n.pos.x + n.pos.y) * 0.5 * scale - 3,
             width: 6, height: 6, borderRadius: '50%', background: '#FFB800',
             boxShadow: '0 0 6px #FFB800', opacity: 0.8
           }} />
         ))}

         {/* Sector Label */}
         <div style={{ position: 'absolute', bottom: 4, right: 6, fontFamily: 'Rajdhani', fontSize: 9, fontWeight: 800, color: CYAN, letterSpacing: '0.1em', opacity: 0.8 }}>
            RADAR_ACTIVE
         </div>
      </div>
    </div>
  );
}

// ── Main HUD ─────────────────────────────────────────────────
export const GameHUD: React.FC<Props> = ({ state, onZoneTravel, apiKey, onSetApiKey }) => {
  const [activePanel, setActivePanel] = useState<'map' | 'quests' | 'inventory' | 'ai' | null>(null);
  const [tempKey, setTempKey] = useState(apiKey);

  const zone = ZONES.find(z => z.id === state.currentZone);
  const zoneColor = ZONE_COLORS[state.currentZone]?.accent || CYAN;
  const activeQuest = state.quests.find(q => q.status === 'active');
  const democracyAvg = Math.round(
    (state.democracyMeter.awareness + state.democracyMeter.trust + state.democracyMeter.ethics + state.democracyMeter.turnout) / 4
  );
  const toggle = (p: typeof activePanel) => setActivePanel(v => v === p ? null : p);

  return (
    <>
      {/* ══ TOP BAR ══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: 68, ...row, justifyContent: 'space-between', padding: '0 24px',
        background: 'linear-gradient(180deg, rgba(3,5,8,0.95) 0%, transparent 100%)',
        backdropFilter: 'blur(4px)',
      }}>
        {/* Neon top strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`, opacity: 0.7 }} />

        {/* Left stats */}
        <div style={{ ...row, gap: 12 }}>
          <Stat icon="✦" value={state.score.toLocaleString()} label="SCORE" color={GOLD} />
          <Stat icon="🛡" value={state.reputation} label="REP" color={CYAN} />
        </div>

        {/* Center zone name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 900, color: zoneColor, letterSpacing: '0.1em', textShadow: `0 0 16px ${zoneColor}`, textTransform: 'uppercase', lineHeight: 1 }}>
            {zone?.emoji} {zone?.name}
          </div>
          <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#5A6B8A', letterSpacing: '0.3em', marginTop: 3 }}>
            CITY OF DEMOCRACY
          </div>
        </div>

        {/* Right: democracy health */}
        <div style={{ ...row, gap: 14, padding: '8px 16px', borderRadius: 6, borderRight: `3px solid ${PURPLE}`, ...glass(PURPLE) }}>
          <div style={col}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: '#5A6B8A', letterSpacing: '0.15em' }}>DEMOCRACY</span>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 900, color: GREEN, textShadow: `0 0 10px ${GREEN}`, lineHeight: 1 }}>{democracyAvg}%</span>
          </div>
          <div style={{ width: 80, height: 6, background: 'rgba(15,21,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${democracyAvg}%`, background: `linear-gradient(90deg, ${DANGER}, ${GOLD}, ${GREEN})`, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {/* ══ RADAR ═══════════════════════════════════════ */}
      <Minimap state={state} zone={zone} />

      {/* ══ QUEST TRACKER (left) ═════════════════════════ */}
      {activeQuest && (
        <div style={{
          position: 'absolute', left: 0, top: 80, zIndex: 20,
          width: 280, padding: '20px 24px',
          background: 'rgba(8, 12, 20, 0.96)',
          backdropFilter: 'blur(32px)',
          borderTop: `1px solid ${GOLD}50`,
          borderRight: `2px solid ${GOLD}`,
          borderBottom: `1px solid ${GOLD}50`,
          borderRadius: '0 16px 16px 0',
          boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 20px ${GOLD}15`,
          animation: 'slide-left 0.4s var(--ease-out) both',
        }}>
          <div style={{ ...row, gap: 10, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: GOLD, boxShadow: `0 0 12px ${GOLD}`, animation: 'pulse-soft 2s infinite' }} />
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 900, color: GOLD, letterSpacing: '0.3em' }}>ACTIVE DIRECTIVE</span>
          </div>
          
          <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 14, fontWeight: 900, color: '#FFF', marginBottom: 18, lineHeight: 1.4, letterSpacing: '0.02em' }}>
            {activeQuest.title}
          </div>

          <div style={col}>
            {activeQuest.objectives.map(obj => {
              const isMissingItem = obj.text.includes('Aadhaar') && !state.inventory.includes('aadhaar_card');
              return (
                <div key={obj.id} style={{ marginBottom: 12 }}>
                  <div style={{ ...row, gap: 12 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: obj.complete ? `${GREEN}25` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${obj.complete ? GREEN : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: GREEN,
                      boxShadow: obj.complete ? `0 0 10px ${GREEN}40` : 'none',
                    }}>
                      {obj.complete ? '✓' : ''}
                    </div>
                    <span style={{ 
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                      color: obj.complete ? '#5A6B8A' : '#F0F4F8', 
                      textDecoration: obj.complete ? 'line-through' : 'none', 
                      lineHeight: 1.5, opacity: obj.complete ? 0.6 : 1
                    }}>
                      {obj.text}
                    </span>
                  </div>
                  
                  {/* Item Requirement Sub-Hint */}
                  {obj.id === 'find_docs' && !obj.complete && (
                    <div style={{ 
                      marginLeft: 30, marginTop: 4, padding: '4px 10px', borderRadius: 4, 
                      background: isMissingItem ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 229, 255, 0.1)',
                      borderLeft: `2px solid ${isMissingItem ? DANGER : CYAN}`,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span style={{ fontSize: 10 }}>{isMissingItem ? '❌' : '📦'}</span>
                      <span style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: isMissingItem ? DANGER : CYAN, letterSpacing: '0.05em' }}>
                        {isMissingItem ? 'MISSING: AADHAAR CARD' : 'ASSET SECURED'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ 
            marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#5A6B8A', fontWeight: 700, letterSpacing: '0.1em' }}>MISSION REWARD</span>
            <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, color: GOLD, fontWeight: 900 }}>{activeQuest.reward}</span>
          </div>
        </div>
      )}

      {/* ══ BOTTOM BAR ═══════════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        height: 72, ...row, justifyContent: 'space-between', padding: '0 24px',
        background: 'linear-gradient(0deg, rgba(3,5,8,0.97) 0%, transparent 100%)',
        backdropFilter: 'blur(4px)',
      }}>
        {/* Neon bottom strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`, opacity: 0.6 }} />

        {/* Controls hint */}
        <div style={{ ...row, gap: 8 }}>
          {['W','A','S','D'].map(k => (
            <kbd key={k} style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fontWeight: 700, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#A0ABC0', padding: '4px 7px', borderRadius: 4 }}>{k}</kbd>
          ))}
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#5A6B8A', letterSpacing: '0.15em', marginLeft: 4 }}>MOVE</span>
          <span style={{ color: '#5A6B8A', margin: '0 6px' }}>·</span>
          <kbd style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 9, fontWeight: 700, background: `${CYAN}18`, border: `1px solid ${CYAN}`, color: CYAN, padding: '4px 9px', borderRadius: 4, boxShadow: `0 0 8px ${CYAN}40` }}>E</kbd>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, color: '#5A6B8A', letterSpacing: '0.15em', marginLeft: 4 }}>INTERACT</span>
        </div>

        {/* Nav buttons */}
        <div style={{ ...row, gap: 10 }}>
          {[
            { id: 'map',       icon: '🌐', label: 'MAP'    },
            { id: 'quests',    icon: '📋', label: 'LOGS'   },
            { id: 'inventory', icon: '📦', label: 'ASSETS', badge: state.inventory.length },
            { id: 'ai',        icon: '🧠', label: 'CORE'   },
          ].map(btn => {
            const active = activePanel === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => toggle(btn.id as typeof activePanel)}
                style={{
                  position: 'relative', width: 66, height: 54,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  borderRadius: 6,
                  background: active ? `rgba(0,229,255,0.12)` : 'rgba(8,10,17,0.85)',
                  border: active ? `1px solid ${CYAN}` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 18px rgba(0,229,255,0.25), inset 0 0 12px rgba(0,229,255,0.08)` : '0 2px 8px rgba(0,0,0,0.5)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: 18, filter: active ? `drop-shadow(0 0 5px ${CYAN})` : 'grayscale(60%) opacity(0.7)', transition: 'all 0.3s' }}>{btn.icon}</span>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: active ? CYAN : '#5A6B8A', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{btn.label}</span>
                {'badge' in btn && (btn.badge as number) > 0 && (
                  <div style={{
                    position: 'absolute', top: -5, right: -5,
                    width: 18, height: 18, borderRadius: 4,
                    background: CYAN, color: '#030508',
                    fontSize: 10, fontWeight: 800, fontFamily: 'Orbitron, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 8px ${CYAN}`,
                  }}>{btn.badge}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ PANELS ═══════════════════════════════════════ */}

      {activePanel === 'map' && (
        <Panel title="SECTOR MAP" onClose={() => setActivePanel(null)}>
          <Divider label="SYSTEM DIAGNOSTICS" />
          <Meter icon="📡" label="Signal"      value={state.democracyMeter.awareness} color={PURPLE} />
          <Meter icon="🛡" label="Integrity"   value={state.democracyMeter.trust}     color={CYAN} />
          <Meter icon="⚖" label="Ethics"      value={state.democracyMeter.ethics}    color={GREEN} />
          <Meter icon="⚡" label="Engagement"  value={state.democracyMeter.turnout}   color={GOLD} />

          <Divider label="AVAILABLE NODES" />
          <div style={col}>
            {ZONES.map(z => {
              const unlocked = state.unlockedZones.includes(z.id);
              const isCurrent = state.currentZone === z.id;
              const ac = ZONE_COLORS[z.id]?.accent || CYAN;
              return (
                <button key={z.id}
                  onClick={() => { if (unlocked) { onZoneTravel(z.id); setActivePanel(null); } }}
                  disabled={!unlocked}
                  style={{
                    ...row, gap: 14, padding: '12px 16px', marginBottom: 8, borderRadius: 6, textAlign: 'left',
                    background: isCurrent ? `${ac}14` : 'rgba(15,21,35,0.6)',
                    border: `1px solid ${isCurrent ? ac : 'rgba(255,255,255,0.06)'}`,
                    borderLeft: `3px solid ${isCurrent ? ac : unlocked ? '#5A6B8A' : 'transparent'}`,
                    opacity: unlocked ? 1 : 0.4, cursor: unlocked ? 'pointer' : 'not-allowed',
                    boxShadow: isCurrent ? `0 0 12px ${ac}20` : 'none',
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{ fontSize: 22, filter: unlocked ? 'none' : 'grayscale(100%)' }}>{unlocked ? z.emoji : '🔒'}</span>
                  <div style={col}>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, color: isCurrent ? ac : '#F0F4F8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{z.name}</span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 600, color: '#5A6B8A', letterSpacing: '0.15em', marginTop: 2 }}>
                      {isCurrent ? '● ACTIVE' : unlocked ? '○ STANDBY' : '✕ OFFLINE'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {activePanel === 'quests' && (
        <Panel title="DIRECTIVE LOGS" onClose={() => setActivePanel(null)}>
          <div style={col}>
            {state.quests.map(q => {
              const accent = q.status === 'complete' ? GREEN : q.status === 'active' ? GOLD : '#5A6B8A';
              return (
                <div key={q.id} style={{
                  padding: '14px 16px', marginBottom: 10, borderRadius: 6,
                  background: q.status === 'complete' ? `${GREEN}08` : q.status === 'active' ? `${GOLD}08` : 'rgba(15,21,35,0.5)',
                  border: `1px solid ${accent}30`, borderLeft: `3px solid ${accent}`,
                }}>
                  <div style={{ ...row, gap: 8, marginBottom: q.status !== 'inactive' ? 10 : 0 }}>
                    <span style={{ fontSize: 15 }}>{q.status === 'complete' ? '🟢' : q.status === 'active' ? '⚡' : '🔒'}</span>
                    <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>{q.title}</span>
                  </div>
                  {q.status !== 'inactive' && (
                    <div style={{ paddingLeft: 22, ...col, gap: 5 }}>
                      {q.objectives.map(obj => (
                        <div key={obj.id} style={{ ...row, gap: 8 }}>
                          <span style={{ fontSize: 10, color: obj.complete ? GREEN : CYAN }}>{obj.complete ? '✓' : '›'}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: obj.complete ? '#5A6B8A' : '#A0ABC0', textDecoration: obj.complete ? 'line-through' : 'none', lineHeight: 1.4 }}>{obj.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {activePanel === 'inventory' && (
        <Panel title="ASSET MANIFEST" onClose={() => setActivePanel(null)}>
          {state.inventory.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 48, opacity: 0.1, marginBottom: 12 }}>📦</div>
              <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, color: '#5A6B8A', letterSpacing: '0.1em' }}>DATABASE EMPTY</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {state.inventory.map(itemId => {
                const item = ITEMS[itemId];
                if (!item) return null;
                return (
                  <div key={itemId} title={item.description} style={{
                    aspectRatio: '1', borderRadius: 6,
                    background: 'linear-gradient(145deg, rgba(15,21,35,0.8), rgba(8,10,17,0.9))',
                    border: `1px solid ${CYAN}25`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 6px', cursor: 'help', transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 28, filter: `drop-shadow(0 0 6px rgba(255,255,255,0.2))` }}>{item.emoji}</span>
                    <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: '#A0ABC0', textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      )}

      {activePanel === 'ai' && (
        <Panel title="NEURAL CORE" onClose={() => setActivePanel(null)}>
          {apiKey ? (
            <div style={{ ...row, gap: 12, padding: '12px 16px', borderRadius: 6, background: `${GREEN}08`, border: `1px solid ${GREEN}40`, borderLeft: `3px solid ${GREEN}`, marginBottom: 22 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, animation: 'pulse-soft 2s infinite', boxShadow: `0 0 10px ${GREEN}` }} />
              <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.1em' }}>CORE ONLINE</span>
            </div>
          ) : (
            <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: '#A0ABC0', marginBottom: 20, lineHeight: 1.6, letterSpacing: '0.03em' }}>
              [WARNING] Neural Core offline. Connect API key to enable dynamic NPC processing.
            </p>
          )}
          <label style={{ fontFamily: 'Orbitron, sans-serif', display: 'block', fontSize: 11, color: CYAN, marginBottom: 8, letterSpacing: '0.18em' }}>AUTHORIZATION KEY</label>
          <input
            type="password" value={tempKey} onChange={e => setTempKey(e.target.value)}
            placeholder="ENTER KEY SEQUENCE..."
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14,
              background: 'rgba(3,5,8,0.9)', border: `1px solid ${CYAN}35`, color: '#F0F4F8',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => { onSetApiKey(tempKey); setActivePanel(null); }}
            style={{
              width: '100%', padding: '14px', borderRadius: 6, fontSize: 13,
              background: `${CYAN}12`, border: `1px solid ${CYAN}`, color: CYAN,
              fontFamily: 'Orbitron, sans-serif', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              boxShadow: `0 0 14px ${CYAN}25`, transition: 'all 0.2s',
            }}
          >
            INITIALIZE CONNECTION
          </button>
        </Panel>
      )}
    </>
  );
};
