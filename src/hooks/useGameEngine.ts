import { useReducer, useCallback, useState } from 'react';
import { gameReducer, INITIAL_STATE } from '../game/gameReducer';
import { ZONES } from '../game/worldData';
import type { GameEffect, DialogueChoice, ZoneId, MiniGameId } from '../game/types';
import { generateNpcDialogue } from '../game/gemini';

/**
 * Custom hook that encapsulates the entire VoteVerse RPG engine.
 * Handles state management, effect application, and AI dialogue triggers.
 * This separation of concerns improves code maintainability and testability.
 */
export function useGameEngine(apiKey: string, addNotification: (n: any) => void) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiText, setGeminiText] = useState<string | undefined>(undefined);
  
  /**
   * Processes a GameEffect and triggers corresponding state updates and notifications.
   */
  const applyEffect = useCallback((effect?: GameEffect) => {
    if (!effect) return;

    if (effect.addItem) {
      dispatch({ type: 'ADD_ITEM', payload: effect.addItem });
      addNotification({
        type: 'item',
        title: 'ITEM OBTAINED',
        message: `New asset added to your inventory!`,
        emoji: '📦',
      });
    }

    if (effect.updateMeter) {
      dispatch({ type: 'UPDATE_DEMOCRACY', payload: effect.updateMeter });
    }

    if (effect.completeObjective) {
      dispatch({ type: 'START_QUEST', payload: effect.completeObjective.questId });
      dispatch({ type: 'COMPLETE_OBJECTIVE', payload: { 
        questId: effect.completeObjective.questId, 
        objId: effect.completeObjective.objectiveId 
      } });
    }

    if (effect.startQuest) {
      dispatch({ type: 'START_QUEST', payload: effect.startQuest });
    }

    if (effect.unlockZone) {
      dispatch({ type: 'UNLOCK_ZONE', payload: effect.unlockZone });
    }

    if (effect.startMiniGame) {
      dispatch({ type: 'START_MINI_GAME', payload: effect.startMiniGame });
    }

    if (effect.addReputation) {
      dispatch({ type: 'ADD_REPUTATION', payload: effect.addReputation });
    }
    
    // Auto-transition on zone events
    if (effect.triggerEvent && effect.triggerEvent.startsWith('go_')) {
      const zoneId = effect.triggerEvent.replace('go_', '');
      dispatch({ type: 'SET_PHASE', payload: 'transition' });
    }
  }, [addNotification]);

  /**
   * Handles player choices in the dialogue system, including AI dialogue generation.
   */
  const handleDialogueChoice = useCallback(async (choice: DialogueChoice) => {
    applyEffect(choice.effect);

    if (choice.next === '__end') {
      dispatch({ type: 'SET_ACTIVE_NPC', payload: null });
      setGeminiText(undefined);
      return;
    }

    dispatch({ type: 'SET_DIALOGUE_NODE', payload: choice.next });
    setGeminiText(undefined);
    
    // Trigger Gemini AI for dynamic follow-up if an API key is present
    if (apiKey) {
      setGeminiLoading(true);
      try {
        const zone = ZONES.find(z => z.id === state.currentZone);
        const npc = zone?.npcs.find(n => n.id === state.activeNPCId);
        if (npc) {
          const text = await generateNpcDialogue(npc.role, choice.text, state.inventory, apiKey);
          if (text && text.length > 20) {
            setGeminiText(text);
          }
        }
      } catch (err) {
        console.warn("Gemini Dialogue Error:", err);
      } finally {
        setGeminiLoading(false);
      }
    }
  }, [state.currentZone, state.activeNPCId, state.inventory, apiKey, applyEffect]);

  return {
    state,
    dispatch,
    applyEffect,
    handleDialogueChoice,
    geminiLoading,
    geminiText,
    setGeminiText,
  };
}
