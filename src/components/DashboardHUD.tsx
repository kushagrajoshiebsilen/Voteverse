import React from 'react';
import type { GameState } from '../game/types';
import { ZONES } from '../game/worldData';

interface Props {
  state: GameState;
  onZoneTravel: (zoneId: string) => void;
  children?: React.ReactNode;
}

// ── Palette: dark navy / charcoal / teal / muted amber ──
const C = {
  bg:        'rgba(10, 14, 20, 0.0)',   // fully transparent — shows canvas
  panelBg:   'rgba(12, 17, 26, 0.88)',  // deep navy glass
  border:    'rgba(45, 212, 191, 0.15)',// teal border
  borderDim: 'rgba(255,255,255,0.05)',
  teal:      '#2ABFBF',
  amber:     '#C8902A',
  text:      '#CBD5E1',
  dim:       '#4B5E72',
  green:     '#2A7A5A',
  red:       '#7A2A2A',
  white:     '#E8ECF0',
};

const row: React.CSSProperties = { display:'flex', alignItems:'center' };
const col: React.CSSProperties = { display:'flex', flexDirection:'column' };
const mono = (sz: number, color = C.text): React.CSSProperties => ({
  fontFamily: "'Rajdhani', 'Orbitron', monospace",
  fontSize: sz, color, fontWeight: 600, letterSpacing: '0.06em',
});

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ ...mono(9, C.teal), letterSpacing: '0.18em',
      textTransform: 'uppercase', opacity: 0.75 }}>
      {children}
    </span>
  );
}

function GlassPanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.panelBg,
      backdropFilter: 'blur(14px) saturate(160%)',
      border: `1px solid ${C.border}`,
      borderRadius: 4,
      ...style,
    }}>
      {children}
    </div>
  );
}

function BarMeter({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 3, background: 'rgba(0,0,0,0.5)', borderRadius: 2 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color,
        borderRadius: 2, boxShadow: `0 0 6px ${color}88`, transition: 'width 0.8s' }} />
    </div>
  );
}

export const DashboardHUD: React.FC<Props> = ({ state, onZoneTravel, children }) => {
  const [panel, setPanel] = React.useState<string | null>(null);
  const quest   = state.quests.find(q => q.status === 'active');
  const zone    = ZONES.find(z => z.id === state.currentZone);
  const trust   = state.democracyMeter.trust;
  const readiness = state.democracyMeter.awareness;
  const ethics  = state.democracyMeter.ethics;
  const level   = Math.max(1, Math.floor(state.reputation / 100) + 1);

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden',
      fontFamily: "'Rajdhani', 'Inter', sans-serif" }}>

      {/* ── CANVAS LAYER ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'auto' }}>
        {children}
      </div>

      {/* ── SCANLINES OVERLAY ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)',
        zIndex: 5 }} />

      {/* ════════════ TOP BAR ════════════ */}
      <div style={{
        position:'absolute', top:0, left:0, right:0, zIndex:10, height:52,
        ...row, justifyContent:'space-between', padding:'0 20px',
        background:'rgba(8,11,18,0.94)', borderBottom:`1px solid ${C.border}`,
        backdropFilter:'blur(16px)', pointerEvents:'auto',
      }}>
        {/* Top accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent, ${C.teal}, transparent)`, opacity:0.6 }} />

        {/* Logo + Level */}
        <div style={{ ...row, gap:14 }}>
          <div style={{ ...row, gap:8, padding:'4px 12px', borderRadius:3,
            background:`rgba(42,191,191,0.08)`, border:`1px solid ${C.border}` }}>
            <span style={{ fontSize:14, color:C.teal }}>⚖</span>
            <span style={{ ...mono(14, C.white), fontWeight:800, letterSpacing:'0.12em' }}>VOTE VERSE</span>
          </div>
          <div style={{ ...col, gap:1 }}>
            <Tag>Level {level} — District Observer</Tag>
            <Tag style={{ opacity:0.5 } as React.CSSProperties}>{zone?.name?.toUpperCase()}</Tag>
          </div>
        </div>

        {/* Stats */}
        <div style={{ ...row, gap:0 }}>
          {[
            { label:'POPULATION', val:`${(8500 + state.reputation * 10).toLocaleString()}`, color:C.teal },
            { label:'FUNDS',      val:`$${(state.score * 10).toLocaleString()}`,             color:C.amber },
            { label:'ELECTION',   val:`${Math.max(1, 14 - Math.floor(state.score/500))}D LEFT`, color:C.text },
            { label:'TIME',       val:'14:30',                                                color:C.dim },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width:1, height:30, background:C.borderDim, margin:'0 20px' }} />}
              <div style={col}>
                <Tag>{s.label}</Tag>
                <span style={{ ...mono(15, s.color), lineHeight:1.1 }}>{s.val}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Score */}
        <div style={{ ...row, gap:10 }}>
          <div style={{ ...col, alignItems:'flex-end' }}>
            <Tag>Civic Score</Tag>
            <span style={{ ...mono(16, C.white), fontWeight:800 }}>{state.score.toLocaleString()}</span>
          </div>
          <div style={{ ...col, alignItems:'flex-end' }}>
            <Tag>Authority</Tag>
            <span style={{ ...mono(16, C.teal) }}>{state.reputation}</span>
          </div>
        </div>
      </div>

      {/* ════════════ LEFT PANEL ════════════ */}
      <div style={{
        position:'absolute', top:68, left:16, width:268, zIndex:10,
        ...col, gap:10, pointerEvents:'auto',
      }}>
        {/* Active Mission */}
        <GlassPanel style={{ padding:'16px 18px' }}>
          <div style={{ ...row, gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:16, background:C.teal, borderRadius:2 }} />
            <Tag>Missions — Active</Tag>
          </div>
          {quest ? (
            <>
              <div style={{ ...mono(13, C.white), fontWeight:700, marginBottom:4, lineHeight:1.3 }}>
                {quest.title.toUpperCase()}
              </div>
              <div style={{ fontSize:10, color:C.dim, marginBottom:12, letterSpacing:'0.04em' }}>
                GOAL: {quest.objectives.filter(o=>o.complete).length}/{quest.objectives.length} OBJECTIVES
              </div>
              {/* progress */}
              <BarMeter value={quest.objectives.filter(o=>o.complete).length}
                max={quest.objectives.length} color={C.amber} />
              <div style={{ marginTop:12, ...col, gap:7 }}>
                {quest.objectives.map((o, i) => (
                  <div key={i} style={{ ...row, gap:8 }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', flexShrink:0,
                      border:`1.5px solid ${o.complete ? C.teal : C.dim}`,
                      background: o.complete ? `${C.teal}22` : 'transparent',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {o.complete && <div style={{ width:6, height:6, borderRadius:'50%', background:C.teal }} />}
                    </div>
                    <span style={{ fontSize:10, color: o.complete ? C.dim : C.text,
                      textDecoration: o.complete ? 'line-through' : 'none',
                      letterSpacing:'0.05em', textTransform:'uppercase' }}>
                      {o.text}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <span style={{ fontSize:11, color:C.dim }}>[NO ACTIVE MISSIONS]</span>
          )}
        </GlassPanel>

        {/* Current Task */}
        <GlassPanel style={{ padding:'12px 18px' }}>
          <Tag style={{ display:'block' as const, marginBottom:4 }}>Current Task</Tag>
          <div style={{ ...mono(12, C.white), fontWeight:700 }}>
            {quest?.objectives.find(o => !o.complete)?.text?.toUpperCase() ?? 'PATROL THE DISTRICT'}
          </div>
        </GlassPanel>

        {/* Integrity meters */}
        <GlassPanel style={{ padding:'14px 18px' }}>
          <Tag style={{ display:'block' as const, marginBottom:12 }}>Integrity Index</Tag>
          {[
            { label:'Public Trust', val:trust,    color:C.teal },
            { label:'Readiness',    val:readiness, color:'#5B8FBF' },
            { label:'Ethics',       val:ethics,    color:C.amber },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: i<2 ? 10 : 0 }}>
              <div style={{ ...row, justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:10, color:C.dim, letterSpacing:'0.08em', textTransform:'uppercase' }}>{m.label}</span>
                <span style={{ ...mono(11, m.color) }}>{m.val}%</span>
              </div>
              <BarMeter value={m.val} color={m.color} />
            </div>
          ))}
        </GlassPanel>
      </div>

      {/* ════════════ BOTTOM NAV ════════════ */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:10, height:64,
        ...row, justifyContent:'space-between', padding:'0 20px',
        background:'rgba(8,11,18,0.94)', borderTop:`1px solid ${C.border}`,
        backdropFilter:'blur(16px)', pointerEvents:'auto',
      }}>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg, transparent, ${C.teal}, transparent)`, opacity:0.4 }} />

        {/* Key hints */}
        <div style={{ ...row, gap:8 }}>
          {['W','A','S','D'].map(k => (
            <kbd key={k} style={{ ...mono(10, C.white), padding:'4px 8px', borderRadius:3,
              background:'rgba(255,255,255,0.04)', border:`1px solid ${C.borderDim}`,
              boxShadow:'0 2px 0 rgba(0,0,0,0.5)' }}>{k}</kbd>
          ))}
          <span style={{ ...mono(10, C.dim), marginLeft:6 }}>NAVIGATE</span>
          <span style={{ color:C.borderDim, margin:'0 10px' }}>|</span>
          <kbd style={{ ...mono(10, C.teal), padding:'4px 12px', borderRadius:3,
            background:`${C.teal}11`, border:`1px solid ${C.teal}`,
            boxShadow:`0 0 10px ${C.teal}33` }}>E</kbd>
          <span style={{ ...mono(10, C.teal), marginLeft:6 }}>INTERACT</span>
        </div>

        {/* Action buttons */}
        <div style={{ ...row, gap:8 }}>
          {[
            { id:'map',    icon:'🗺',  label:'MAP' },
            { id:'quest',  icon:'📋',  label:'MISSIONS', badge: state.quests.filter(q=>q.status==='active').length },
            { id:'inv',    icon:'🎒',  label:'FIELD KIT', badge: state.inventory.length },
          ].map(btn => {
            const active = panel === btn.id;
            return (
              <button key={btn.id} onClick={() => setPanel(v => v===btn.id ? null : btn.id)}
                style={{
                  height:44, padding:'0 18px', ...row, gap:8, position:'relative',
                  borderRadius:4, cursor:'pointer', transition:'all 0.2s',
                  background: active ? `${C.teal}12` : 'rgba(255,255,255,0.02)',
                  border:`1px solid ${active ? C.teal : C.borderDim}`,
                  boxShadow: active ? `0 0 18px ${C.teal}22` : 'none',
                }}>
                {btn.badge !== undefined && btn.badge > 0 && (
                  <div style={{ position:'absolute', top:-5, right:-5, width:16, height:16,
                    borderRadius:'50%', background:C.teal, color:'#000',
                    fontSize:9, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {btn.badge}
                  </div>
                )}
                <span style={{ fontSize:16, filter: active ? 'none' : 'grayscale(80%)' }}>{btn.icon}</span>
                <span style={{ ...mono(9, active ? C.teal : C.dim) }}>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════ SIDE PANELS (Map / Quests / Kit) ════════════ */}
      {panel && (
        <div style={{
          position:'absolute', top:52, right:0, bottom:64, width:300, zIndex:10,
          background:'rgba(8,12,20,0.97)', backdropFilter:'blur(20px)',
          borderLeft:`1px solid ${C.border}`, pointerEvents:'auto',
          ...col,
        }}>
          <div style={{ ...row, justifyContent:'space-between', padding:'16px 18px',
            borderBottom:`1px solid ${C.borderDim}` }}>
            <div style={{ ...row, gap:8 }}>
              <div style={{ width:3, height:14, background:C.teal, borderRadius:1 }} />
              <Tag>{panel === 'map' ? 'Sector Map' : panel === 'quest' ? 'Mission Log' : 'Field Kit'}</Tag>
            </div>
            <button onClick={() => setPanel(null)}
              style={{ background:'none', border:`1px solid ${C.borderDim}`, color:C.dim,
                padding:'3px 8px', borderRadius:3, cursor:'pointer', fontSize:13 }}>✕</button>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', scrollbarWidth:'none' }}>
            {panel === 'map' && (
              <div style={{ ...col, gap:8 }}>
                {ZONES.map(z => {
                  const unlocked = state.unlockedZones.includes(z.id as any);
                  const current  = state.currentZone === z.id;
                  return (
                    <button key={z.id} disabled={!unlocked}
                      onClick={() => { if(unlocked) { onZoneTravel(z.id); setPanel(null); }}}
                      style={{ ...row, gap:12, width:'100%', padding:'10px 12px', textAlign:'left',
                        borderRadius:4, cursor: unlocked ? 'pointer' : 'not-allowed',
                        background: current ? `${C.teal}10` : 'rgba(255,255,255,0.02)',
                        border:`1px solid ${current ? C.teal : C.borderDim}`,
                        borderLeft:`3px solid ${current ? C.teal : unlocked ? C.dim : 'transparent'}`,
                        opacity: unlocked ? 1 : 0.35, transition:'all 0.2s' }}>
                      <span style={{ fontSize:18 }}>{unlocked ? z.emoji : '🔒'}</span>
                      <div style={col}>
                        <span style={{ ...mono(12, current ? C.teal : C.white) }}>{z.name}</span>
                        <span style={{ fontSize:9, color:C.dim, letterSpacing:'0.08em' }}>
                          {current ? '● ON DUTY' : unlocked ? '○ AVAILABLE' : '✕ RESTRICTED'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {panel === 'quest' && (
              <div style={{ ...col, gap:10 }}>
                {state.quests.map(q => {
                  const sc = q.status==='complete' ? C.teal : q.status==='active' ? C.amber : C.dim;
                  return (
                    <div key={q.id} style={{ borderRadius:4, border:`1px solid ${C.borderDim}`,
                      borderLeft:`3px solid ${sc}`, overflow:'hidden' }}>
                      <div style={{ padding:'10px 12px' }}>
                        <div style={{ ...row, justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ ...mono(12, C.white), flex:1 }}>{q.title}</span>
                          <span style={{ fontSize:8, color:sc, letterSpacing:'0.1em',
                            background:`${sc}14`, border:`1px solid ${sc}22`,
                            padding:'2px 6px', borderRadius:10, marginLeft:8 }}>
                            {q.status.toUpperCase()}
                          </span>
                        </div>
                        {q.status !== 'inactive' && q.objectives.map((o, i) => (
                          <div key={i} style={{ ...row, gap:8, marginTop:6 }}>
                            <div style={{ width:10, height:10, borderRadius:'50%', flexShrink:0,
                              border:`1.5px solid ${o.complete ? C.teal : C.dim}` }} />
                            <span style={{ fontSize:10, color: o.complete ? C.dim : C.text,
                              textDecoration: o.complete ? 'line-through' : 'none' }}>{o.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {panel === 'inv' && (
              state.inventory.length === 0
                ? <div style={{ textAlign:'center', paddingTop:40 }}>
                    <div style={{ fontSize:36, opacity:0.1 }}>🎒</div>
                    <span style={{ ...mono(11, C.dim) }}>NO ITEMS COLLECTED</span>
                  </div>
                : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                    {state.inventory.map(id => (
                      <div key={id} style={{ aspectRatio:'1', borderRadius:4,
                        background:'rgba(255,255,255,0.03)', border:`1px solid ${C.borderDim}`,
                        display:'flex', flexDirection:'column', alignItems:'center',
                        justifyContent:'center', gap:6, padding:8 }}>
                        <span style={{ fontSize:22 }}>📄</span>
                        <span style={{ fontSize:9, color:C.dim, textAlign:'center', letterSpacing:'0.08em',
                          textTransform:'uppercase' }}>{id.replace(/_/g,' ')}</span>
                      </div>
                    ))}
                  </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
