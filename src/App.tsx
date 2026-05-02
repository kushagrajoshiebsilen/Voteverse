import React, { useReducer, useRef, useCallback, useEffect, useState } from 'react';
import { gameReducer, INITIAL_STATE } from './game/gameReducer';
import { ZONES } from './game/worldData';
import type { DialogueChoice, GameEffect, ZoneId, MiniGameId } from './game/types';
import type { Notification } from './components/GameNotification';
import { GameCanvas } from './components/GameCanvas';
import { DialogueBox } from './components/DialogueBox';
import { DashboardHUD } from './components/DashboardHUD';
import { RoleIntro } from './components/RoleIntro';
import { MiniGame } from './components/MiniGame';
import { IntroScreen } from './components/IntroScreen';
import { EndingScreen } from './components/EndingScreen';
import { ZoneTransition } from './components/ZoneTransition';
import { GameNotification } from './components/GameNotification';
import { generateNpcDialogue } from './game/gemini';

// ────────────────────────────────────────────────
// Apply a GameEffect to the game state via dispatch
// ────────────────────────────────────────────────
function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingTransition, setPendingTransition] = useState<ZoneId | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiText, setGeminiText] = useState<string | undefined>(undefined);
  const [roleIntroShown, setRoleIntroShown] = useState(false);

  const inputRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<{ dx: number; dy: number; startX: number; startY: number }>({
    dx: 0,
    dy: 0,
    startX: 0,
    startY: 0,
  });

  const notifId = useRef(0);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id = `notif_${notifId.current++}`;
    setNotifications((p) => [...p.slice(-4), { ...n, id }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
  }, []);

  // ── Apply game effects ──────────────────────────
  const applyEffect = useCallback(
    (effect?: GameEffect) => {
      if (!effect) return;

      if (effect.addItem) {
        dispatch({ type: 'ADD_ITEM', payload: effect.addItem });
        const ITEMS: Record<string, { label: string; emoji: string }> = {
          aadhaar_card: { label: 'Aadhaar Card', emoji: '🪪' },
          address_proof: { label: 'Address Proof', emoji: '📄' },
          voter_id: { label: 'Voter ID Card', emoji: '🗳️' },
          form6: { label: 'Form 6', emoji: '📋' },
          democracy_badge: { label: 'Democracy Badge', emoji: '🏅' },
          ink_badge: { label: 'Ink-Marked Badge', emoji: '☑️' },
          newspaper: { label: 'Newspaper', emoji: '📰' },
          candidate_flyer: { label: 'Candidate Flyer', emoji: '📜' },
          phone: { label: 'Smartphone', emoji: '📱' },
          champion_medal: { label: 'Democracy Champion', emoji: '🏆' },
        };
        const item = ITEMS[effect.addItem];
        if (item) {
          addNotification({
            type: 'item',
            title: 'ITEM OBTAINED',
            message: `${item.emoji} ${item.label} added to your bag!`,
            emoji: item.emoji,
          });
        }
      }

      if (effect.removeItem) {
        dispatch({ type: 'REMOVE_ITEM', payload: effect.removeItem });
      }

      if (effect.updateMeter) {
        dispatch({ type: 'UPDATE_DEMOCRACY', payload: effect.updateMeter });
        const vals = Object.values(effect.updateMeter);
        const positive = vals.filter((v) => (v || 0) > 0).reduce((a, b) => a + (b || 0), 0);
        if (positive > 0) {
          addNotification({
            type: 'democracy',
            title: 'DEMOCRACY METER +',
            message: `Your actions strengthened the city! +${positive} to democracy metrics`,
            emoji: '📈',
          });
        }
      }

      if (effect.completeQuest) {
        dispatch({ type: 'COMPLETE_QUEST', payload: effect.completeQuest });
        addNotification({
          type: 'quest',
          title: 'QUEST COMPLETE!',
          message: 'You completed a civic mission! +200 score',
          emoji: '✅',
        });
      }

      if (effect.completeObjective) {
        const { questId, objectiveId } = effect.completeObjective;
        // Auto-activate quest if still inactive
        dispatch({ type: 'START_QUEST', payload: questId });
        dispatch({ type: 'COMPLETE_OBJECTIVE', payload: { questId, objId: objectiveId } });
        addNotification({
          type: 'reputation',
          title: 'OBJECTIVE COMPLETE',
          message: '+25 score. Keep going!',
          emoji: '☑️',
        });
      }


      if (effect.startQuest) {
        dispatch({ type: 'START_QUEST', payload: effect.startQuest });
        const quest = state.quests.find((q) => q.id === effect.startQuest);
        if (quest && quest.status === 'inactive') {
          addNotification({
            type: 'quest',
            title: 'NEW QUEST!',
            message: quest.title,
            emoji: '📜',
          });
        }
      }

      if (effect.unlockZone) {
        dispatch({ type: 'UNLOCK_ZONE', payload: effect.unlockZone });
        const zone = ZONES.find((z) => z.id === effect.unlockZone);
        if (zone) {
          addNotification({
            type: 'achievement',
            title: 'ZONE UNLOCKED!',
            message: `${zone.emoji} ${zone.name} is now accessible!`,
            emoji: '🗺️',
          });
        }
      }

      if (effect.startMiniGame) {
        dispatch({ type: 'START_MINI_GAME', payload: effect.startMiniGame });
      }

      if (effect.addReputation) {
        dispatch({ type: 'ADD_REPUTATION', payload: effect.addReputation });
        addNotification({
          type: 'reputation',
          title: 'REPUTATION +',
          message: `+${effect.addReputation} reputation points earned!`,
          emoji: '🛡️',
        });
      }

      if (effect.triggerEvent === 'go_registration' || effect.unlockZone === 'registration') {
        setPendingTransition('registration');
        dispatch({ type: 'SET_PHASE', payload: 'transition' });
      } else if (effect.triggerEvent === 'go_campaign' || effect.unlockZone === 'campaign') {
        setPendingTransition('campaign');
        dispatch({ type: 'SET_PHASE', payload: 'transition' });
      } else if (effect.triggerEvent === 'go_polling' || effect.unlockZone === 'polling') {
        setPendingTransition('polling');
        dispatch({ type: 'SET_PHASE', payload: 'transition' });
      } else if (effect.triggerEvent === 'go_results' || effect.unlockZone === 'results') {
        setPendingTransition('results');
        dispatch({ type: 'SET_PHASE', payload: 'transition' });
      } else if (effect.triggerEvent === 'trigger_ending') {
        dispatch({ type: 'SET_ENDING', payload: 'main' });
      } else if (effect.triggerEvent === 'search_shelf') {
        // Fail-safe: Guarantee item if on quest
        if (!state.inventory.includes('aadhaar_card')) {
          dispatch({ type: 'ADD_ITEM', payload: 'aadhaar_card' });
          addNotification({
            type: 'achievement',
            title: 'ASSET RECOVERED',
            message: 'Aadhaar Card found! Proceed to Registration.',
            emoji: '🪪',
          });
        }
      } else if (effect.triggerEvent === 'read_notice') {
        addNotification({
          type: 'democracy',
          title: 'NOTICE READ',
          message: 'Election notice read! Awareness +5. Check registration deadlines!',
          emoji: '📌',
        });
      } else if (effect.triggerEvent === 'use_nvsp') {
        addNotification({
          type: 'democracy',
          title: 'NVSP PORTAL',
          message: 'voters.eci.gov.in — 900M+ registered voters in India!',
          emoji: '💻',
        });
      } else if (effect.triggerEvent === 'use_cvigil') {
        addNotification({
          type: 'achievement',
          title: 'cVIGIL REPORTED!',
          message: 'MCC violation reported! Officers respond within 100 minutes.',
          emoji: '📱',
        });
      } else if (effect.triggerEvent === 'banner_event') {
        addNotification({
          type: 'warning',
          title: 'SUSPICIOUS BANNER',
          message: 'This could be a Model Code of Conduct violation!',
          emoji: '🚩',
        });
      } else if (effect.triggerEvent === 'show_results') {
        addNotification({
          type: 'democracy',
          title: 'RESULTS DECLARED',
          message: 'Democratic process complete! Every vote counted transparently.',
          emoji: '📊',
        });
      }
    },
    [state.quests, addNotification]
  );

  // ── Dialogue choice handler ──────────────────────
  const handleDialogueChoice = useCallback(
    async (choice: DialogueChoice) => {
      applyEffect(choice.effect);

      if (choice.next === '__end') {
        dispatch({ type: 'SET_ACTIVE_NPC', payload: null });
        setGeminiText(undefined);
        return;
      }

      dispatch({ type: 'SET_DIALOGUE_NODE', payload: choice.next });
      setGeminiText(undefined);

      // Try Gemini for dynamic dialogue
      const zone = ZONES.find((z) => z.id === state.currentZone);
      const npc = zone?.npcs.find((n) => n.id === state.activeNPCId);
      if (npc && apiKey) {
        setGeminiLoading(true);
        try {
          const text = await generateNpcDialogue(
            npc.role,
            choice.text,
            state.inventory,
            apiKey
          );
          // Only use Gemini text if it's significantly different from a short filler
          if (text && text.length > 40) {
            setGeminiText(text);
          }
        } catch {
          // fallback to written dialogue
        } finally {
          setGeminiLoading(false);
        }
      }
    },
    [state.currentZone, state.activeNPCId, state.inventory, apiKey, applyEffect]
  );

  // ── Close dialogue ──────────────────────────────
  const handleCloseDialogue = useCallback(() => {
    const zone = ZONES.find((z) => z.id === state.currentZone);
    const npc = zone?.npcs.find((n) => n.id === state.activeNPCId);
    const node = npc?.dialogue.find((d) => d.id === state.activeDialogueNodeId);

    // Apply node effect if any
    if (node?.effect) {
      applyEffect(node.effect);
    }

    // Check next
    if (node?.next && node.next !== '__end') {
      dispatch({ type: 'SET_DIALOGUE_NODE', payload: node.next });
    } else {
      dispatch({ type: 'SET_ACTIVE_NPC', payload: null });
      setGeminiText(undefined);
    }
  }, [state.currentZone, state.activeNPCId, state.activeDialogueNodeId, applyEffect]);

  // ── Interact handler ─────────────────────────────
  const handleInteract = useCallback(
    (id: string, type: 'npc' | 'object') => {
      if (state.phase !== 'playing') return;

      if (type === 'npc') {
        dispatch({ type: 'SET_ACTIVE_NPC', payload: id });
        addNotification({
          type: 'reputation',
          title: 'NPC INTERACTION',
          message: 'Talking to a citizen...',
          emoji: '💬',
        });
      } else {
        const zone = ZONES.find((z) => z.id === state.currentZone);
        const obj = zone?.objects.find((o) => o.id === id);
        if (obj) {
          applyEffect(obj.interactAction);
        }
      }
    },
    [state.phase, state.currentZone, applyEffect, addNotification]
  );

  // ── Player movement ──────────────────────────────
  const handlePlayerMove = useCallback(
    (pos: { x: number; y: number }, z: number) => {
      dispatch({ type: 'MOVE_PLAYER', payload: { pos, z } });
    },
    []
  );

  // ── Zone travel (from map) ───────────────────────
  const handleZoneTravel = useCallback(
    (zoneId: string) => {
      if (state.unlockedZones.includes(zoneId as ZoneId)) {
        setPendingTransition(zoneId as ZoneId);
        dispatch({ type: 'SET_PHASE', payload: 'transition' });
      }
    },
    [state.unlockedZones]
  );

  // ── Mini-game complete ───────────────────────────
  const handleMiniGameComplete = useCallback(
    (success: boolean, score: number) => {
      const activeGame = state.activeMiniGameId;
      dispatch({ type: 'END_MINI_GAME', payload: { success, scoreBonus: score } });
      
      if (success) {
        // Reward mapping
        if (activeGame === 'document_hunt') {
          dispatch({ type: 'ADD_ITEM', payload: 'aadhaar_card' });
          addNotification({
            type: 'achievement',
            title: 'DOCUMENT RECOVERED!',
            message: 'Aadhaar Card added to inventory. You can now register!',
            emoji: '🪪',
          });
        } else if (activeGame === 'form_sorting') {
          dispatch({ type: 'ADD_ITEM', payload: 'form6' });
        }

        addNotification({
          type: 'achievement',
          title: 'CHALLENGE COMPLETE!',
          message: `+${score} points earned! Democracy grows stronger!`,
          emoji: '🎉',
        });
      }
    },
    [state.activeMiniGameId, dispatch, addNotification]
  );

  // ── Zone transition complete ─────────────────────
  const handleTransitionComplete = useCallback(() => {
    if (pendingTransition) {
      dispatch({ type: 'SET_ZONE', payload: pendingTransition });
      setPendingTransition(null);
    }
  }, [pendingTransition]);

  // ── Keyboard input ────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      inputRef.current.add(e.key);
      // Map key
      if (e.key === 'm' || e.key === 'M') {
        // Handled by HUD internally
      }
    };
    const up = (e: KeyboardEvent) => {
      inputRef.current.delete(e.key);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // ── Touch controls ────────────────────────────────
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchRef.current = { dx: 0, dy: 0, startX: t.clientX, startY: t.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const dx = (t.clientX - touchRef.current.startX) / 30;
      const dy = (t.clientY - touchRef.current.startY) / 30;
      touchRef.current = { ...touchRef.current, dx: Math.max(-1, Math.min(1, dx)), dy: Math.max(-1, Math.min(1, dy)) };
    };
    const handleTouchEnd = () => {
      touchRef.current = { dx: 0, dy: 0, startX: 0, startY: 0 };
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // ── Play timer ────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'playing' && state.phase !== 'dialogue') return;
    const t = setInterval(() => dispatch({ type: 'TICK', payload: 1000 }), 1000);
    return () => clearInterval(t);
  }, [state.phase]);

  // ── Game start ────────────────────────────────────
  // ── Game start ────────────────────────────────────
  const handleGameStart = useCallback((name: string, avatar: 'hero_m' | 'hero_f') => {
    // 1. Set data first
    setPendingTransition('neighborhood');
    setRoleIntroShown(false);
    
    // 2. Dispatch state updates
    dispatch({ type: 'SET_PLAYER_NAME', payload: name || 'Citizen' });
    dispatch({ type: 'SET_PLAYER_AVATAR', payload: avatar });
    dispatch({ type: 'SET_ROLE', payload: avatar === 'hero_m' ? 'guardian' : 'champion' });
    
    // 3. Final phase shift
    dispatch({ type: 'SET_PHASE', payload: 'transition' });
  }, []);

  // ── Replay ─────────────────────────────────────────
  const handleReplay = useCallback(() => {
    window.location.reload();
  }, []);

  const currentZone = ZONES.find((z) => z.id === state.currentZone) || ZONES[0];

  return (
    <div
      style={{
        position: 'relative', width: '100vw', height: '100vh',
        overflow: 'hidden', background: '#698784',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >

      {/* ── INTRO SCREEN ─────────────────────────────── */}
      {state.phase === 'intro' || state.phase === 'naming' ? (
        <IntroScreen onStart={handleGameStart} />
      ) : null}

      {/* ── MAIN GAME WORLD ──────────────────────────── */}
      {(state.phase === 'playing' || state.phase === 'dialogue' || state.phase === 'miniGame') && (
        <>
          <DashboardHUD state={state} onZoneTravel={handleZoneTravel}>
            <GameCanvas
              state={state}
              zone={currentZone}
              onInteract={handleInteract}
              onPlayerMove={handlePlayerMove}
              inputRef={inputRef}
              touchRef={touchRef as React.MutableRefObject<{ dx: number; dy: number }>}
            />
          </DashboardHUD>

          {/* Role intro cinematic — shown once after first load */}
          {!roleIntroShown && (
            <RoleIntro
              role={state.role}
              playerName={state.player.name}
              onComplete={() => setRoleIntroShown(true)}
            />
          )}
        </>
      )}

      {/* ── DIALOGUE OVERLAY ─────────────────────────── */}
      {state.phase === 'dialogue' && state.activeNPCId && (
        <DialogueBox
          state={state}
          onChoice={handleDialogueChoice}
          onClose={handleCloseDialogue}
          geminiText={geminiText}
          isGeminiLoading={geminiLoading}
        />
      )}

      {/* ── MINI-GAME OVERLAY ────────────────────────── */}
      {state.phase === 'miniGame' && state.activeMiniGame && (
        <MiniGame gameId={state.activeMiniGame as MiniGameId} onComplete={handleMiniGameComplete} />
      )}

      {/* ── ZONE TRANSITION ──────────────────────────── */}
      {state.phase === 'transition' && pendingTransition && (
        <ZoneTransition toZone={pendingTransition} onComplete={handleTransitionComplete} />
      )}

      {/* ── ENDING SCREEN ────────────────────────────── */}
      {state.phase === 'ending' && (
        <EndingScreen state={state} onReplay={handleReplay} />
      )}

    </div>
  );
}

export default App;
