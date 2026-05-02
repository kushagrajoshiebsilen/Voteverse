import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ZONES } from './game/worldData';
import type { ZoneId, MiniGameId } from './game/types';
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
import { useGameEngine } from './hooks/useGameEngine';

/**
 * VoteVerse: Tactical Civic Command
 * The main application entry point. Orchestrates the game world, HUD, and UI overlays.
 * Refactored for maximum readability and modularity using the useGameEngine hook.
 */
function App() {
  // --- Global Services Config ---
  const [apiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  
  // --- Notifications State ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifId = useRef(0);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    const id = `notif_${notifId.current++}`;
    setNotifications((p) => [...p.slice(-4), { ...n, id }]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((p) => p.filter((n) => n.id !== id));
  }, []);

  // --- RPG Engine & Core Logic ---
  const { 
    state, 
    dispatch, 
    applyEffect, 
    handleDialogueChoice, 
    geminiLoading, 
    geminiText, 
    setGeminiText 
  } = useGameEngine(apiKey, addNotification);

  // --- Local UI State ---
  const [pendingTransition, setPendingTransition] = useState<ZoneId | null>(null);
  const [roleIntroShown, setRoleIntroShown] = useState(false);
  const inputRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<{ dx: number; dy: number; startX: number; startY: number }>({ dx: 0, dy: 0, startX: 0, startY: 0 });

  // --- Interactive Handlers ---
  const handleInteract = useCallback((id: string, type: 'npc' | 'object') => {
    if (state.phase !== 'playing') return;
    if (type === 'npc') {
      dispatch({ type: 'SET_ACTIVE_NPC', payload: id });
    } else {
      const zone = ZONES.find((z) => z.id === state.currentZone);
      const obj = zone?.objects.find((o) => o.id === id);
      if (obj) applyEffect(obj.interactAction);
    }
  }, [state.phase, state.currentZone, applyEffect, dispatch]);

  const handleCloseDialogue = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_NPC', payload: null });
    setGeminiText(undefined);
  }, [dispatch, setGeminiText]);

  const handleZoneTravel = useCallback((zoneId: string) => {
    setPendingTransition(zoneId as ZoneId);
    dispatch({ type: 'SET_PHASE', payload: 'transition' });
  }, [dispatch]);

  const handleMiniGameComplete = useCallback((success: boolean, score: number) => {
    dispatch({ type: 'END_MINI_GAME', payload: { success, scoreBonus: score } });
  }, [dispatch]);

  const handleTransitionComplete = useCallback(() => {
    if (pendingTransition) {
      dispatch({ type: 'SET_ZONE', payload: pendingTransition });
      setPendingTransition(null);
    }
  }, [pendingTransition, dispatch]);

  const handleGameStart = useCallback((name: string, avatar: 'hero_m' | 'hero_f') => {
    dispatch({ type: 'SET_PLAYER_NAME', payload: name || 'Citizen' });
    dispatch({ type: 'SET_PLAYER_AVATAR', payload: avatar });
    dispatch({ type: 'SET_ROLE', payload: avatar === 'hero_m' ? 'guardian' : 'champion' });
    setPendingTransition('neighborhood');
    dispatch({ type: 'SET_PHASE', payload: 'transition' });
  }, [dispatch]);

  // --- Global Timers & Inputs ---
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const t = setInterval(() => dispatch({ type: 'TICK', payload: 1000 }), 1000);
    return () => clearInterval(t);
  }, [state.phase, dispatch]);

  const currentZone = ZONES.find((z) => z.id === state.currentZone) || ZONES[0];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#212936' }}>
      
      {/* ─── UI Overlays & States ─── */}
      {(state.phase === 'intro' || state.phase === 'naming') && <IntroScreen onStart={handleGameStart} />}

      {(state.phase === 'playing' || state.phase === 'dialogue' || state.phase === 'miniGame') && (
        <>
          <DashboardHUD state={state} onZoneTravel={handleZoneTravel}>
            <GameCanvas
              state={state}
              zone={currentZone}
              onInteract={handleInteract}
              onPlayerMove={(pos, z) => dispatch({ type: 'MOVE_PLAYER', payload: { pos, z } })}
              inputRef={inputRef}
              touchRef={touchRef as React.MutableRefObject<{ dx: number; dy: number }>}
            />
          </DashboardHUD>
          {!roleIntroShown && <RoleIntro role={state.role} playerName={state.player.name} onComplete={() => setRoleIntroShown(true)} />}
        </>
      )}

      {state.phase === 'dialogue' && state.activeNPCId && (
        <DialogueBox state={state} onChoice={handleDialogueChoice} onClose={handleCloseDialogue} geminiText={geminiText} isGeminiLoading={geminiLoading} />
      )}

      {state.phase === 'miniGame' && state.activeMiniGame && (
        <MiniGame gameId={state.activeMiniGame as MiniGameId} onComplete={handleMiniGameComplete} />
      )}

      {state.phase === 'transition' && pendingTransition && (
        <ZoneTransition toZone={pendingTransition} onComplete={handleTransitionComplete} />
      )}

      {state.phase === 'ending' && <EndingScreen state={state} onReplay={() => window.location.reload()} />}

      {/* ─── Global Notifications ─── */}
      <div style={{ position: 'absolute', top: 100, right: 20, zIndex: 100, pointerEvents: 'none' }}>
        {notifications.map((n) => (
          <GameNotification key={n.id} notification={n} onDismiss={dismissNotification} />
        ))}
      </div>

    </div>
  );
}

export default App;
