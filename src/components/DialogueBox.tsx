import React, { useState, useEffect, useRef } from 'react';
import type { GameState, DialogueChoice } from '../game/types';
import { ZONES } from '../game/worldData';

interface Props {
  state: GameState;
  onChoice: (choice: DialogueChoice) => void;
  onClose: () => void;
  geminiText?: string;
  isGeminiLoading?: boolean;
}

const ZONE_ACCENT: Record<string, string> = {
  neighborhood: '#00FF88',
  registration: '#B042FF',
  campaign:     '#FFB800',
  polling:      '#00E5FF',
  results:      '#FF6B00',
};

export const DialogueBox: React.FC<Props> = ({ state, onChoice, onClose, geminiText, isGeminiLoading }) => {
  const [displayed, setDisplayed] = useState('');
  const [typing, setTyping]       = useState(false);
  const [glitch, setGlitch]       = useState(false);
  const fullRef  = useRef('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zone = ZONES.find(z => z.id === state.currentZone);
  const npc  = zone?.npcs.find(n => n.id === state.activeNPCId);
  if (!npc) return null;

  const node = npc.dialogue.find(d => d.id === state.activeDialogueNodeId);
  if (!node) return null;

  const roleAccent = state.role === 'guardian' ? '#2ABFBF' : '#F5A623';
  const zoneAccent = ZONE_ACCENT[state.currentZone] || '#00E5FF';
  const accent     = roleAccent; // Use role-based accent for consistency
  const rawText    = geminiText || node.text;

  // Typewriter
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    fullRef.current = rawText;
    setDisplayed('');
    setTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(fullRef.current.slice(0, i));
      if (i >= fullRef.current.length) { setTyping(false); clearInterval(timerRef.current!); }
    }, 16);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [rawText, state.activeDialogueNodeId]);

  // Random glitch flash on text start
  useEffect(() => {
    if (!typing) return;
    const g = setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), 80); }, 100);
    return () => clearTimeout(g);
  }, [state.activeDialogueNodeId]);

  const skip = () => {
    if (!typing) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayed(fullRef.current);
    setTyping(false);
  };

  const showChoices  = !typing && !isGeminiLoading && node.choices && node.choices.length > 0;
  const showContinue = !typing && !isGeminiLoading && (!node.choices || node.choices.length === 0);

  const col: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center' };

  return (
    <div style={{
      position: 'absolute', inset: '0 0 0 0',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 20px 80px', zIndex: 30, pointerEvents: 'none',
    }}>
      <div style={{
        width: '100%', maxWidth: 840, pointerEvents: 'all',
        animation: 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both',
      }}>

        {/* ── NPC header ── */}
        <div style={{ ...row, alignItems: 'flex-end', gap: 0, marginBottom: -1, position: 'relative', zIndex: 1 }}>

          {/* Portrait */}
          <div style={{
            width: 76, height: 68, flexShrink: 0,
            background: `linear-gradient(160deg, ${accent}20, rgba(8,10,17,0.98))`,
            border: `1px solid ${accent}`,
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, position: 'relative',
            boxShadow: `0 0 24px ${accent}30, inset 0 0 20px rgba(0,0,0,0.5)`,
          }}>
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 12, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: '4px 0 0 0', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, borderRadius: '0 4px 0 0', opacity: 0.8 }} />
            {npc.emoji}
            {/* Online dot */}
            <div style={{ position: 'absolute', bottom: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: '#00FF88', boxShadow: '0 0 6px #00FF88', animation: 'pulse-soft 2s infinite' }} />
          </div>

          {/* Name tab */}
          <div style={{
            flex: 1, height: 48, padding: '0 20px',
            background: `linear-gradient(90deg, ${accent}18 0%, rgba(8,10,17,0.97) 70%)`,
            border: `1px solid ${accent}`,
            borderBottom: 'none', borderLeft: 'none',
            borderRadius: '0 8px 0 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={col}>
              <span style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: 15, fontWeight: 700,
                color: glitch ? '#fff' : '#F0F4F8', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1,
                textShadow: glitch ? `3px 0 #FF3366, -3px 0 ${accent}` : 'none',
                transition: 'color 0.05s, text-shadow 0.05s',
              }}>{npc.name}</span>
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, fontWeight: 700, color: accent, letterSpacing: '0.2em', marginTop: 3, textTransform: 'uppercase', opacity: 0.9 }}>{npc.role}</span>
            </div>
            {/* Mode badge */}
            <div style={{ ...row, gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: geminiText ? '#B042FF' : '#00E5FF', boxShadow: `0 0 6px ${geminiText ? '#B042FF' : '#00E5FF'}`, animation: 'pulse-soft 2s infinite' }} />
              <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: '#A0ABC0', letterSpacing: '0.15em' }}>{geminiText ? 'AI MODE' : 'SCRIPTED'}</span>
            </div>
          </div>
        </div>

        {/* ── Main panel ── */}
        <div style={{
          background: 'rgba(8,10,17,0.95)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: `1px solid ${accent}`,
          borderRadius: '0 0 10px 10px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Accent top strip */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, ${accent}66, transparent)` }} />

          {/* CRT scanlines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px)',
            pointerEvents: 'none', zIndex: 1,
          }} />

          <div style={{ padding: '22px 26px 20px', position: 'relative', zIndex: 2 }}>

            {/* Text area */}
            <div style={{ minHeight: 76, marginBottom: showChoices || showContinue ? 18 : 8, cursor: typing ? 'pointer' : 'default' }} onClick={skip}>
              {isGeminiLoading ? (
                <div style={{ ...row, gap: 12, padding: '12px 0' }}>
                  {[0, 150, 300].map(d => (
                    <div key={d} style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #00E5FF', animation: `pulse-soft 0.9s ease-in-out ${d}ms infinite` }} />
                  ))}
                  <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, color: '#5A6B8A', letterSpacing: '0.1em' }}>PROCESSING...</span>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.75, color: '#F0F4F8', fontWeight: 400, margin: 0 }}>
                    {displayed}
                    {typing && (
                      <span style={{ display: 'inline-block', width: 2, height: '1em', background: accent, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'pulse-soft 0.6s step-end infinite', boxShadow: `0 0 5px ${accent}` }} />
                    )}
                  </p>
                  {typing && (
                    <span style={{ position: 'absolute', bottom: 0, right: 0, fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: '#5A6B8A', letterSpacing: '0.18em' }}>
                      [CLICK TO SKIP]
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Choices */}
            {showChoices && (
              <div style={col}>
                {node.choices!.map((choice, i) => {
                  const enabled = !choice.requires || state.inventory.includes(choice.requires);
                  return (
                    <button key={i} onClick={() => enabled && onChoice(choice)} disabled={!enabled}
                      style={{
                        ...row, gap: 14,
                        padding: '12px 18px', marginBottom: 8, borderRadius: 6, textAlign: 'left',
                        background: 'rgba(15,21,35,0.7)',
                        border: `1px solid rgba(0,229,255,0.14)`,
                        borderLeft: `3px solid ${enabled ? accent : '#5A6B8A'}`,
                        color: enabled ? '#F0F4F8' : '#5A6B8A',
                        cursor: enabled ? 'pointer' : 'not-allowed',
                        opacity: enabled ? 1 : 0.4,
                        transition: 'all 0.2s ease',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      onMouseEnter={e => { if (enabled) { (e.currentTarget as HTMLElement).style.background = `rgba(0,229,255,0.08)`; (e.currentTarget as HTMLElement).style.borderColor = `${accent}70`; }}}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,21,35,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,229,255,0.14)'; }}
                    >
                      <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 11, fontWeight: 700, color: enabled ? accent : '#5A6B8A', minWidth: 26, textShadow: enabled ? `0 0 6px ${accent}` : 'none' }}>
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span style={{ fontSize: 14, lineHeight: 1.5, flex: 1 }}>{choice.text}</span>
                      {!enabled && choice.requires && (
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, fontWeight: 700, color: '#FF3366', border: '1px solid #FF3366', padding: '2px 7px', borderRadius: 3, letterSpacing: '0.1em', flexShrink: 0 }}>LOCKED</span>
                      )}
                      {enabled && <span style={{ color: accent, opacity: 0.5, fontSize: 18, marginLeft: 'auto' }}>›</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Continue */}
            {showContinue && (
              <div style={{ ...row, justifyContent: 'flex-end', gap: 14 }}>
                <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 11, fontWeight: 600, color: '#5A6B8A', letterSpacing: '0.18em' }}>PRESS E OR CLICK</span>
                <button onClick={onClose} style={{
                  padding: '11px 30px', borderRadius: 6, fontSize: 13,
                  background: `${accent}12`, border: `1px solid ${accent}`, color: accent,
                  fontFamily: 'Orbitron, sans-serif', fontWeight: 700, cursor: 'pointer',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  boxShadow: `0 0 14px ${accent}25`, transition: 'all 0.2s',
                }}>
                  CONTINUE →
                </button>
              </div>
            )}
          </div>

          {/* Bottom-right corner accent */}
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, borderRadius: '4px 0 0 0', opacity: 0.4, zIndex: 3 }} />
        </div>
      </div>
    </div>
  );
};
