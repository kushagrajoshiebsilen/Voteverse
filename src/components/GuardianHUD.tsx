/**
 * GuardianHUD — Calm civic-tech aesthetic
 * Navy · Teal · Off-white palette
 * Metrics: Trust · Readiness · Integrity
 * Role fantasy: Protector of voting rights & process integrity
 */
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

// Guardian palette
const T  = '#2ABFBF'; // teal
const NV = '#1A2F4A'; // navy dark
const OW = '#E8ECF0'; // off-white
const SL = '#4B7FA8'; // steel-blue accent
const GN = '#3DBE7A'; // civic green
const MU = '#6E8BA4'; // muted blue

const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

function StatBlock({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div style={{
      ...row, gap: 12, padding: '10px 18px', borderRadius: 10,
      background: `linear-gradient(135deg, rgba(26,47,74,0.95) 0%, rgba(15,28,48,0.98) 100%)`,
      backdropFilter: 'blur(20px) saturate(180%)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderTop: `1px solid ${color}44`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 10px ${color}11`,
      transition: 'transform 0.2s ease',
      cursor: 'default',
    }}>
      <span style={{ fontSize: 20, filter: `drop-shadow(0 0 8px ${color}66)` }}>{icon}</span>
      <div style={col}>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 900, color, lineHeight: 1, letterSpacing: '0.05em' }}>{value}</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 700, color: MU, letterSpacing: '0.15em', marginTop: 3, textTransform: 'uppercase', opacity: 0.8 }}>{label}</span>
      </div>
    </div>
  );
}

function IntegrityBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...row, justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: OW, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{icon} {label}</span>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12, fontWeight: 800, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: `linear-gradient(90deg, ${color}44, ${color})`,
          borderRadius: 3, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: `0 0 10px ${color}88`,
        }} />
      </div>
    </div>
  );
}

function GuardianPanel({ title, badge, onClose, children }: { title: string; badge?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, zIndex: 40,
      background: 'rgba(15,28,48,0.97)', backdropFilter: 'blur(24px)',
      borderLeft: `2px solid rgba(42,191,191,0.3)`,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-left 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div style={{ ...row, justifyContent: 'space-between', padding: '20px 22px', borderBottom: `1px solid rgba(42,191,191,0.15)`, background: `rgba(26,47,74,0.5)` }}>
        <div style={{ ...row, gap: 10 }}>
          <div style={{ width: 4, height: 20, background: T, borderRadius: 2 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: OW, letterSpacing: '0.04em' }}>{title}</span>
          {badge && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: T, background: 'rgba(42,191,191,0.12)', border: `1px solid rgba(42,191,191,0.3)`, padding: '2px 8px', borderRadius: 10 }}>{badge}</span>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: `1px solid rgba(255,255,255,0.12)`, color: MU, cursor: 'pointer', padding: '5px 10px', borderRadius: 4, fontSize: 14, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', scrollbarWidth: 'thin', scrollbarColor: `${T}30 transparent` }}>
        {children}
      </div>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ ...row, gap: 10, marginBottom: 14, marginTop: 8 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: T, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T}40, transparent)` }} />
    </div>
  );
}

export const GuardianHUD: React.FC<Props> = ({ state, onZoneTravel, apiKey, onSetApiKey }) => {
  const [panel, setPanel] = useState<'map' | 'cases' | 'field' | 'settings' | null>(null);
  const [tempKey, setTempKey] = useState(apiKey);
  const toggle = (p: typeof panel) => setPanel(v => v === p ? null : p);

  const zone = ZONES.find(z => z.id === state.currentZone);
  const trust    = state.democracyMeter.trust;
  const readiness = state.democracyMeter.awareness;
  const integrity = state.democracyMeter.ethics;
  const overallIntegrity = Math.round((trust + readiness + integrity) / 3);
  const activeCase = state.quests.find(q => q.status === 'active');

  return (
    <>
      {/* ══ TOP BAR — institutional header ══════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: 72, ...row, justifyContent: 'space-between', padding: '0 28px',
        background: 'linear-gradient(180deg, rgba(8, 12, 20, 0.98) 0%, rgba(8, 12, 20, 0.8) 50%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}>
        {/* Top accent glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${T}, transparent)`, opacity: 0.6 }} />

        {/* Left: guardian badge + stats */}
        <div style={{ ...row, gap: 14 }}>
          {/* Role badge */}
          <div style={{ ...row, gap: 8, padding: '6px 14px', borderRadius: 6, background: `rgba(42,191,191,0.12)`, border: `1px solid ${T}40` }}>
            <span style={{ fontSize: 18 }}>⚖️</span>
            <div style={col}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, color: T, letterSpacing: '0.1em', textTransform: 'uppercase' }}>GUARDIAN</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: MU, letterSpacing: '0.08em' }}>Civic Protector</span>
            </div>
          </div>
          <StatBlock icon="🏆" value={state.score.toLocaleString()} label="Civic Score" color={OW} />
          <StatBlock icon="🛡" value={state.reputation} label="Authority" color={SL} />
        </div>

        {/* Center: sector name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, color: MU, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>
            ACTIVE SECTOR
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 800, color: OW, letterSpacing: '0.04em' }}>
            {zone?.emoji} {zone?.name?.toUpperCase()}
          </div>
        </div>

        {/* Right: integrity gauge */}
        <div style={{ ...row, gap: 14, padding: '8px 18px', borderRadius: 6, background: 'rgba(26,47,74,0.92)', border: `1px solid ${T}25`, backdropFilter: 'blur(16px)', boxShadow: '0 2px 14px rgba(0,0,0,0.4)' }}>
          <div style={col}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: MU, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Integrity</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 800, color: GN, lineHeight: 1 }}>{overallIntegrity}%</span>
          </div>
          <div style={{ ...col, gap: 5 }}>
            {[{ v: trust, c: T, l: 'Trust' }, { v: readiness, c: SL, l: 'Ready' }, { v: integrity, c: GN, l: 'Ethics' }].map(m => (
              <div key={m.l} style={{ ...row, gap: 8 }}>
                <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.v}%`, background: m.c, borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: MU, letterSpacing: '0.1em', minWidth: 28 }}>{m.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ACTIVE CASE TRACKER (left) ══════════════════ */}
      {activeCase && (
        <div style={{
          position: 'absolute', left: 20, top: 90, zIndex: 20,
          width: 280, padding: '20px 24px',
          background: 'rgba(10, 15, 25, 0.92)', backdropFilter: 'blur(30px)',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderLeft: `5px solid ${T}`,
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          animation: 'slide-left 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ ...row, gap: 8, marginBottom: 10 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, color: T, letterSpacing: '0.2em', textTransform: 'uppercase' }}>📋 ACTIVE CASE</div>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 700, color: OW, marginBottom: 14, lineHeight: 1.4 }}>
            {activeCase.title}
          </div>
          <div style={col}>
            {activeCase.objectives.map((obj, i) => (
              <div key={obj.id} style={{ ...row, gap: 10, marginBottom: 8, paddingBottom: 8, borderBottom: i < activeCase.objectives.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: obj.complete ? `${GN}22` : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${obj.complete ? GN : 'rgba(255,255,255,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: GN, fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}>
                  {obj.complete ? '✓' : ''}
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: obj.complete ? MU : '#C4D4E0', textDecoration: obj.complete ? 'line-through' : 'none', lineHeight: 1.4 }}>
                  {obj.text}
                </span>
              </div>
            ))}
          </div>
          {activeCase.reward && (
            <div style={{ marginTop: 8, paddingTop: 10, borderTop: `1px solid ${T}20`, ...row, gap: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: GN }}>📌</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: MU }}>On completion: {activeCase.reward}</span>
            </div>
          )}
        </div>
      )}

      {/* ══ BOTTOM NAV BAR ══════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        height: 72, ...row, justifyContent: 'space-between', padding: '0 28px',
        background: 'linear-gradient(0deg, rgba(8, 12, 20, 0.98) 0%, rgba(8, 12, 20, 0.8) 50%, transparent 100%)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Bottom accent glow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${T}, transparent)`, opacity: 0.6 }} />

        {/* Key hints */}
        <div style={{ ...row, gap: 8 }}>
          {['W','A','S','D'].map(k => (
            <kbd key={k} style={{ 
              fontFamily: 'Orbitron, sans-serif', fontSize: 10, fontWeight: 900, 
              background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.15)`, 
              color: OW, padding: '5px 9px', borderRadius: 6,
              boxShadow: '0 2px 0 rgba(0,0,0,0.5)'
            }}>{k}</kbd>
          ))}
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: MU, marginLeft: 8, letterSpacing: '0.05em' }}>NAVIGATE</span>
          <span style={{ color: MU, margin: '0 12px', opacity: 0.3 }}>|</span>
          <kbd style={{ 
            fontFamily: 'Orbitron, sans-serif', fontSize: 10, fontWeight: 900, 
            background: `${T}22`, border: `1px solid ${T}`, color: T, 
            padding: '5px 12px', borderRadius: 6,
            boxShadow: `0 0 12px ${T}44`
          }}>E</kbd>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: T, marginLeft: 8, letterSpacing: '0.05em' }}>INTERACT</span>
        </div>

        {/* Nav tabs */}
        <div style={{ ...row, gap: 12 }}>
          {[
            { id: 'map',      icon: '🗺',  label: 'SECTOR MAP' },
            { id: 'cases',    icon: '📋',  label: 'CASE FILES' },
            { id: 'field',    icon: '🎒',  label: 'FIELD KIT',  badge: state.inventory.length },
            { id: 'settings', icon: '⚙',   label: 'SETTINGS' },
          ].map(btn => {
            const active = panel === btn.id;
            return (
              <button key={btn.id} onClick={() => toggle(btn.id as typeof panel)}
                style={{
                  position: 'relative', height: 46, padding: '0 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10,
                  background: active ? `${T}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? T : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: active ? `0 0 20px ${T}22` : 'none',
                  cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                <span style={{ fontSize: 18, filter: active ? `drop-shadow(0 0 5px ${T})` : 'grayscale(100%) opacity(0.5)' }}>{btn.icon}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, color: active ? T : MU, letterSpacing: '0.1em' }}>{btn.label}</span>
                {'badge' in btn && (btn.badge as number) > 0 && (
                  <div style={{ 
                    position: 'absolute', top: -6, right: -6, width: 20, height: 20, 
                    borderRadius: 6, background: T, color: '#000', 
                    fontSize: 10, fontWeight: 900, fontFamily: 'Orbitron, sans-serif', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 10px ${T}`
                  }}>
                    {btn.badge}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ PANELS ═══════════════════════════════════════ */}
      {panel === 'map' && (
        <GuardianPanel title="Sector Overview" badge="LIVE" onClose={() => setPanel(null)}>
          <SectionHead label="Integrity Metrics" />
          <IntegrityBar icon="🤝" label="Public Trust"   value={trust}    color={T} />
          <IntegrityBar icon="📋" label="Process Readiness" value={readiness} color={SL} />
          <IntegrityBar icon="⚖" label="Ethical Compliance" value={integrity} color={GN} />
          <IntegrityBar icon="🗳" label="Voter Turnout"   value={state.democracyMeter.turnout} color="#A855F7" />

          <SectionHead label="Field Locations" />
          {ZONES.map(z => {
            const unlocked = state.unlockedZones.includes(z.id);
            const isCurrent = state.currentZone === z.id;
            const ac = ZONE_COLORS[z.id]?.accent || T;
            return (
              <button key={z.id} onClick={() => { if (unlocked) { onZoneTravel(z.id); setPanel(null); } }} disabled={!unlocked}
                style={{
                  ...row, gap: 12, width: '100%', padding: '12px 14px', marginBottom: 8, borderRadius: 6, textAlign: 'left',
                  background: isCurrent ? 'rgba(42,191,191,0.1)' : 'rgba(26,47,74,0.5)',
                  border: `1px solid ${isCurrent ? T : 'rgba(42,191,191,0.1)'}`,
                  borderLeft: `3px solid ${isCurrent ? T : unlocked ? MU : 'transparent'}`,
                  opacity: unlocked ? 1 : 0.4, cursor: unlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: 20, filter: unlocked ? 'none' : 'grayscale(100%)' }}>{unlocked ? z.emoji : '🔒'}</span>
                <div style={col}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: isCurrent ? T : OW }}>{z.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, color: MU, marginTop: 1, letterSpacing: '0.05em' }}>
                    {isCurrent ? '● On Duty' : unlocked ? '○ Available' : '✕ Restricted'}
                  </span>
                </div>
              </button>
            );
          })}
        </GuardianPanel>
      )}

      {panel === 'cases' && (
        <GuardianPanel title="Case Files" onClose={() => setPanel(null)}>
          {state.quests.map(q => {
            const statusColor = q.status === 'complete' ? GN : q.status === 'active' ? T : MU;
            const statusLabel = q.status === 'complete' ? 'CLOSED' : q.status === 'active' ? 'ACTIVE' : 'PENDING';
            return (
              <div key={q.id} style={{ marginBottom: 12, borderRadius: 6, background: 'rgba(26,47,74,0.4)', border: `1px solid rgba(42,191,191,0.1)`, borderLeft: `4px solid ${statusColor}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: q.status !== 'inactive' ? `1px solid rgba(42,191,191,0.08)` : 'none' }}>
                  <div style={{ ...row, justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, color: OW, flex: 1, lineHeight: 1.3 }}>{q.title}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 800, color: statusColor, background: `${statusColor}14`, border: `1px solid ${statusColor}30`, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.1em', marginLeft: 8, flexShrink: 0 }}>{statusLabel}</span>
                  </div>
                </div>
                {q.status !== 'inactive' && (
                  <div style={{ padding: '10px 14px', ...col, gap: 6 }}>
                    {q.objectives.map(obj => (
                      <div key={obj.id} style={{ ...row, gap: 8 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `2px solid ${obj.complete ? GN : MU}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: GN }}>{obj.complete ? '✓' : ''}</div>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: obj.complete ? MU : '#C4D4E0', textDecoration: obj.complete ? 'line-through' : 'none', lineHeight: 1.4 }}>{obj.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </GuardianPanel>
      )}

      {panel === 'field' && (
        <GuardianPanel title="Field Equipment" badge={`${state.inventory.length} items`} onClose={() => setPanel(null)}>
          {state.inventory.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 48, opacity: 0.1, marginBottom: 12 }}>🎒</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: MU }}>No items collected yet</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {state.inventory.map(itemId => {
                const item = ITEMS[itemId];
                if (!item) return null;
                return (
                  <div key={itemId} title={item.description} style={{ aspectRatio: '1', borderRadius: 8, background: 'rgba(26,47,74,0.6)', border: `1px solid ${T}20`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10 }}>
                    <span style={{ fontSize: 26 }}>{item.emoji}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: MU, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </GuardianPanel>
      )}

      {panel === 'settings' && (
        <GuardianPanel title="System Settings" onClose={() => setPanel(null)}>
          <div style={{ padding: '14px', borderRadius: 8, background: apiKey ? `${GN}0A` : 'rgba(26,47,74,0.4)', border: `1px solid ${apiKey ? GN : T}25`, borderLeft: `3px solid ${apiKey ? GN : MU}`, marginBottom: 20 }}>
            <div style={{ ...row, gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: apiKey ? GN : MU, animation: 'pulse-soft 2s infinite' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: apiKey ? GN : MU, letterSpacing: '0.06em' }}>{apiKey ? 'GEMINI AI CONNECTED' : 'AI MODULE OFFLINE'}</span>
            </div>
          </div>
          <label style={{ fontFamily: 'Inter, sans-serif', display: 'block', fontSize: 12, fontWeight: 700, color: OW, marginBottom: 8, letterSpacing: '0.06em' }}>GEMINI API KEY</label>
          <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="Paste API key..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14, background: `rgba(15,28,48,0.9)`, border: `1px solid ${T}30`, color: OW, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={() => { onSetApiKey(tempKey); setPanel(null); }}
            style={{ width: '100%', padding: '13px', borderRadius: 6, fontSize: 13, fontWeight: 700, background: `${T}15`, border: `1px solid ${T}`, color: T, cursor: 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', transition: 'all 0.2s' }}>
            CONNECT MODULE
          </button>
        </GuardianPanel>
      )}
    </>
  );
};
