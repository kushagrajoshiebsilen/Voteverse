/**
 * ChampionHUD — Energetic public-movement aesthetic
 * Charcoal · Saffron · Warm Coral · Off-white palette
 * Metrics: Influence · Momentum · Participation
 * Role fantasy: Voice of the people, turnout mobilizer, misinformation fighter
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

// Champion palette
const SF  = '#F5A623'; // saffron
const CO  = '#E8634A'; // warm coral
const CH  = '#1E1E24'; // charcoal dark
const OW  = '#F2EDE4'; // warm off-white
const AM  = '#F5A623'; // amber
const MU  = '#8A7B6A'; // muted warm

const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

function PowerStat({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div style={{
      ...row, gap: 12, padding: '10px 18px', borderRadius: 10,
      background: `linear-gradient(135deg, rgba(40,30,20,0.95) 0%, rgba(22,20,26,0.98) 100%)`,
      backdropFilter: 'blur(20px) saturate(160%)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderTop: `1px solid ${color}44`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), inset 0 0 12px ${color}11`,
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

function MomentumBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
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

function ChampionPanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 320, zIndex: 40,
      background: 'rgba(22,20,26,0.97)', backdropFilter: 'blur(24px)',
      borderLeft: `3px solid ${SF}`,
      display: 'flex', flexDirection: 'column',
      animation: 'slide-left 0.35s cubic-bezier(0.16,1,0.3,1) both',
    }}>
      <div style={{ ...row, justifyContent: 'space-between', padding: '20px 22px', borderBottom: `1px solid rgba(245,166,35,0.2)`, background: `linear-gradient(90deg, ${SF}10, transparent)` }}>
        <div style={{ ...row, gap: 10 }}>
          <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${SF}, ${CO})`, borderRadius: 2 }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 800, color: OW, letterSpacing: '0.02em' }}>{title}</span>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: `1px solid rgba(255,255,255,0.1)`, color: MU, cursor: 'pointer', padding: '5px 10px', borderRadius: 4, fontSize: 14, lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', scrollbarWidth: 'thin', scrollbarColor: `${SF}30 transparent` }}>
        {children}
      </div>
    </div>
  );
}

function SectionHead({ label }: { label: string }) {
  return (
    <div style={{ ...row, gap: 10, marginBottom: 14, marginTop: 6 }}>
      <div style={{ width: 12, height: 2, background: SF, borderRadius: 1 }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, color: SF, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${SF}30, transparent)` }} />
    </div>
  );
}

export const ChampionHUD: React.FC<Props> = ({ state, onZoneTravel, apiKey, onSetApiKey }) => {
  const [panel, setPanel] = useState<'map' | 'missions' | 'toolkit' | 'settings' | null>(null);
  const [tempKey, setTempKey] = useState(apiKey);
  const toggle = (p: typeof panel) => setPanel(v => v === p ? null : p);

  const zone = ZONES.find(z => z.id === state.currentZone);
  const influence    = state.democracyMeter.awareness;
  const momentum     = state.democracyMeter.turnout;
  const participation = state.democracyMeter.trust;
  const overallPower = Math.round((influence + momentum + participation) / 3);
  const activeMission = state.quests.find(q => q.status === 'active');

  return (
    <>
      {/* ══ TOP BAR — people-movement energy ════════════ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: 72, ...row, justifyContent: 'space-between', padding: '0 28px',
        background: 'linear-gradient(180deg, rgba(12, 10, 15, 0.98) 0%, rgba(12, 10, 15, 0.8) 50%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}>
        {/* Top accent glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${SF}, transparent)`, opacity: 0.6 }} />

        {/* Left: champion badge + stats */}
        <div style={{ ...row, gap: 14 }}>
          <div style={{ ...row, gap: 8, padding: '6px 14px', borderRadius: 6, background: `linear-gradient(90deg, ${SF}18, ${CO}10)`, border: `1px solid ${SF}40` }}>
            <span style={{ fontSize: 20 }}>📢</span>
            <div style={col}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, color: SF, letterSpacing: '0.12em', textTransform: 'uppercase' }}>CHAMPION</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: MU, letterSpacing: '0.06em' }}>Voice of the People</span>
            </div>
          </div>
          <PowerStat icon="🔥" value={state.score.toLocaleString()} label="Impact"    color={SF} />
          <PowerStat icon="📣" value={state.reputation}             label="Reach"    color={CO} />
        </div>

        {/* Center: movement / zone */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: MU, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 3 }}>
            CURRENT GROUND
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 900, color: OW, letterSpacing: '0.02em' }}>
            {zone?.emoji} {zone?.name}
          </div>
        </div>

        {/* Right: movement power */}
        <div style={{ ...row, gap: 14, padding: '8px 18px', borderRadius: 6, background: 'rgba(30,30,36,0.92)', border: `1px solid ${SF}25`, backdropFilter: 'blur(16px)', boxShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>
          <div style={col}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, color: MU, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Movement</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 900, color: SF, lineHeight: 1 }}>{overallPower}%</span>
          </div>
          <div style={{ ...col, gap: 5 }}>
            {[{ v: influence, c: AM, l: 'Influence' }, { v: momentum, c: CO, l: 'Momentum' }, { v: participation, c: '#A855F7', l: 'Turnout' }].map(m => (
              <div key={m.l} style={{ ...row, gap: 8 }}>
                <div style={{ width: 56, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.v}%`, background: m.c, borderRadius: 3, transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: MU, letterSpacing: '0.08em', minWidth: 48 }}>{m.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ACTIVE MISSION (left) ══════════════════════ */}
      {activeMission && (
        <div style={{
          position: 'absolute', left: 20, top: 90, zIndex: 20,
          width: 280, padding: '20px 24px',
          background: 'rgba(12, 10, 15, 0.92)', backdropFilter: 'blur(30px)',
          border: `1px solid rgba(255,255,255,0.08)`,
          borderLeft: `5px solid ${SF}`,
          borderRadius: 12,
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          animation: 'slide-left 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ ...row, gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: SF, animation: 'pulse-soft 1.5s infinite', boxShadow: `0 0 8px ${SF}` }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, color: SF, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Active Mission</span>
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 800, color: OW, marginBottom: 12, lineHeight: 1.4 }}>
            {activeMission.title}
          </div>
          {activeMission.objectives.map((obj, i) => (
            <div key={obj.id} style={{ ...row, gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                background: obj.complete ? `${SF}20` : 'rgba(255,255,255,0.04)',
                border: `2px solid ${obj.complete ? SF : 'rgba(255,255,255,0.15)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: SF, fontWeight: 700, transition: 'all 0.3s',
              }}>
                {obj.complete ? '✓' : i + 1}
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: obj.complete ? MU : OW, textDecoration: obj.complete ? 'line-through' : 'none', lineHeight: 1.4, opacity: obj.complete ? 0.7 : 1 }}>
                {obj.text}
              </span>
            </div>
          ))}
          {activeMission.reward && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${SF}25`, ...row, gap: 6 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: CO }}>🎯 {activeMission.reward}</span>
            </div>
          )}
        </div>
      )}

      {/* ══ BOTTOM NAV BAR ══════════════════════════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        height: 72, ...row, justifyContent: 'space-between', padding: '0 28px',
        background: 'linear-gradient(0deg, rgba(12, 10, 15, 0.98) 0%, rgba(12, 10, 15, 0.8) 50%, transparent 100%)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Bottom accent glow */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, transparent, ${SF}, transparent)`, opacity: 0.6 }} />

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
            background: `${SF}22`, border: `1px solid ${SF}`, color: SF, 
            padding: '5px 12px', borderRadius: 6,
            boxShadow: `0 0 12px ${SF}44`
          }}>E</kbd>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, color: SF, marginLeft: 8, letterSpacing: '0.05em' }}>INTERACT</span>
        </div>

        {/* Nav tabs */}
        <div style={{ ...row, gap: 12 }}>
          {[
            { id: 'map',      icon: '🗺',  label: 'GROUND MAP' },
            { id: 'missions', icon: '🎯',  label: 'MISSION BOARD' },
            { id: 'toolkit',  icon: '🧰',  label: 'ACTIVIST KIT',  badge: state.inventory.length },
            { id: 'settings', icon: '⚙',   label: 'SETTINGS' },
          ].map(btn => {
            const active = panel === btn.id;
            return (
              <button key={btn.id} onClick={() => toggle(btn.id as typeof panel)}
                style={{
                  position: 'relative', height: 46, padding: '0 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  borderRadius: 10,
                  background: active ? `${SF}15` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? SF : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: active ? `0 0 20px ${SF}22` : 'none',
                  cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                <span style={{ fontSize: 18, filter: active ? `drop-shadow(0 0 5px ${SF})` : 'grayscale(100%) opacity(0.5)' }}>{btn.icon}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, color: active ? SF : MU, letterSpacing: '0.1em' }}>{btn.label}</span>
                {'badge' in btn && (btn.badge as number) > 0 && (
                  <div style={{ 
                    position: 'absolute', top: -6, right: -6, width: 20, height: 20, 
                    borderRadius: 6, background: SF, color: '#000', 
                    fontSize: 10, fontWeight: 900, fontFamily: 'Orbitron, sans-serif', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 10px ${SF}`
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
        <ChampionPanel title="Ground Map" onClose={() => setPanel(null)}>
          <SectionHead label="Movement Power" />
          <MomentumBar icon="📡" label="Influence Reach"  value={influence}    color={AM} />
          <MomentumBar icon="⚡" label="Momentum"         value={momentum}     color={CO} />
          <MomentumBar icon="🤝" label="Participation"    value={participation} color="#A855F7" />
          <MomentumBar icon="⚖" label="Ethical Standing" value={state.democracyMeter.ethics} color="#22D3EE" />

          <SectionHead label="Locations" />
          {ZONES.map(z => {
            const unlocked = state.unlockedZones.includes(z.id);
            const isCurrent = state.currentZone === z.id;
            return (
              <button key={z.id} onClick={() => { if (unlocked) { onZoneTravel(z.id); setPanel(null); } }} disabled={!unlocked}
                style={{
                  ...row, gap: 12, width: '100%', padding: '12px 14px', marginBottom: 8, borderRadius: 6, textAlign: 'left',
                  background: isCurrent ? `${SF}12` : 'rgba(30,30,36,0.6)',
                  border: `1px solid ${isCurrent ? SF : 'rgba(245,166,35,0.1)'}`,
                  borderLeft: `4px solid ${isCurrent ? SF : unlocked ? MU : 'transparent'}`,
                  opacity: unlocked ? 1 : 0.4, cursor: unlocked ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: 20 }}>{unlocked ? z.emoji : '🔒'}</span>
                <div style={col}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 800, color: isCurrent ? SF : OW }}>{z.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 500, color: MU, marginTop: 2 }}>
                    {isCurrent ? '🔥 Active Ground' : unlocked ? '○ Available' : '✕ Locked'}
                  </span>
                </div>
              </button>
            );
          })}
        </ChampionPanel>
      )}

      {panel === 'missions' && (
        <ChampionPanel title="Mission Board" onClose={() => setPanel(null)}>
          {state.quests.map(q => {
            const sc = q.status === 'complete' ? '#22D3EE' : q.status === 'active' ? SF : MU;
            return (
              <div key={q.id} style={{ marginBottom: 12, borderRadius: 8, background: q.status === 'active' ? `linear-gradient(135deg, ${SF}08, ${CO}05)` : 'rgba(30,30,36,0.5)', border: `1px solid ${sc}25`, borderLeft: `4px solid ${sc}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ ...row, justifyContent: 'space-between', marginBottom: q.status !== 'inactive' ? 10 : 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 800, color: OW, flex: 1, lineHeight: 1.3 }}>{q.title}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 800, color: sc, background: `${sc}15`, border: `1px solid ${sc}30`, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.1em', marginLeft: 8, flexShrink: 0 }}>
                      {q.status === 'complete' ? 'DONE' : q.status === 'active' ? 'LIVE' : 'QUEUED'}
                    </span>
                  </div>
                  {q.status !== 'inactive' && (
                    <div style={col}>
                      {q.objectives.map(obj => (
                        <div key={obj.id} style={{ ...row, gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, background: obj.complete ? `${SF}20` : 'transparent', border: `2px solid ${obj.complete ? SF : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: SF, fontWeight: 700 }}>{obj.complete ? '✓' : ''}</div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: obj.complete ? MU : OW, textDecoration: obj.complete ? 'line-through' : 'none', lineHeight: 1.4 }}>{obj.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </ChampionPanel>
      )}

      {panel === 'toolkit' && (
        <ChampionPanel title="Activist Toolkit" onClose={() => setPanel(null)}>
          {state.inventory.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <div style={{ fontSize: 48, opacity: 0.12, marginBottom: 12 }}>🧰</div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: MU }}>No tools collected yet</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: MU, marginTop: 6, opacity: 0.6 }}>Engage with citizens to earn items</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {state.inventory.map(itemId => {
                const item = ITEMS[itemId];
                if (!item) return null;
                return (
                  <div key={itemId} title={item.description} style={{ aspectRatio: '1', borderRadius: 8, background: `linear-gradient(145deg, rgba(30,30,36,0.8), rgba(22,20,26,0.9))`, border: `1px solid ${SF}20`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 10 }}>
                    <span style={{ fontSize: 26 }}>{item.emoji}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600, color: MU, textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </ChampionPanel>
      )}

      {panel === 'settings' && (
        <ChampionPanel title="Settings" onClose={() => setPanel(null)}>
          <div style={{ padding: '14px', borderRadius: 8, background: apiKey ? 'rgba(34,211,238,0.06)' : 'rgba(30,30,36,0.5)', border: `1px solid ${apiKey ? '#22D3EE' : MU}25`, borderLeft: `4px solid ${apiKey ? '#22D3EE' : MU}`, marginBottom: 20 }}>
            <div style={{ ...row, gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: apiKey ? '#22D3EE' : MU, animation: 'pulse-soft 2s infinite' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 700, color: apiKey ? '#22D3EE' : MU }}>{apiKey ? 'GEMINI AI ACTIVE' : 'AI OFFLINE'}</span>
            </div>
          </div>
          <label style={{ fontFamily: 'Inter, sans-serif', display: 'block', fontSize: 12, fontWeight: 700, color: OW, marginBottom: 8 }}>GEMINI API KEY</label>
          <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="Paste your key..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 6, fontSize: 13, marginBottom: 14, background: 'rgba(15,13,18,0.9)', border: `1px solid ${SF}30`, color: OW, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          <button onClick={() => { onSetApiKey(tempKey); setPanel(null); }}
            style={{ width: '100%', padding: '13px', borderRadius: 6, fontSize: 13, fontWeight: 800, background: `linear-gradient(90deg, ${SF}20, ${CO}15)`, border: `1px solid ${SF}`, color: SF, cursor: 'pointer', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em', transition: 'all 0.2s' }}>
            ACTIVATE AI
          </button>
        </ChampionPanel>
      )}
    </>
  );
};
