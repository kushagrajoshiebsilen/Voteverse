import type { GameState, GameAction, DemocracyMeter } from './types';
import { GUARDIAN_INITIAL_QUESTS, CHAMPION_INITIAL_QUESTS, PLAYER_SPEED, ZONE_SPAWN_POSITIONS, INITIAL_QUESTS } from './constants';

export const INITIAL_STATE: GameState = {
  phase: 'intro',
  role: 'guardian',
  currentZone: 'neighborhood',
  unlockedZones: ['neighborhood'],
  player: {
    pos: { x: 300, y: 400 },
    z: 0,
    dir: 'down',
    speed: PLAYER_SPEED,
    frame: 0,
    animTimer: 0,
    name: 'Citizen',
    avatar: 'hero_m',
  },
  inventory: [],
  quests: INITIAL_QUESTS,
  democracyMeter: {
    awareness: 20,
    trust: 25,
    ethics: 30,
    turnout: 10,
  },
  reputation: 0,
  activeNPCId: null,
  activeDialogueNodeId: 'start',
  activeMiniGame: null,
  completedQuests: [],
  flags: {},
  geminiMessages: [],
  score: 0,
  playTime: 0,
  endings: [],
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function mergeMeter(current: DemocracyMeter, update: Partial<DemocracyMeter>): DemocracyMeter {
  return {
    awareness: clamp((current.awareness || 0) + (update.awareness || 0), 0, 100),
    trust: clamp((current.trust || 0) + (update.trust || 0), 0, 100),
    ethics: clamp((current.ethics || 0) + (update.ethics || 0), 0, 100),
    turnout: clamp((current.turnout || 0) + (update.turnout || 0), 0, 100),
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'MOVE_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          pos: action.payload.pos,
          z: action.payload.z ?? state.player.z,
        },
      };

    case 'JUMP_PLAYER':
      if (state.player.z > 0) return state; // Prevent double jump
      return {
        ...state,
        player: {
          ...state.player,
          z: 0.1, // Trigger jump cycle
        }
      };

    case 'SET_ZONE': {
      const spawnPos = ZONE_SPAWN_POSITIONS[action.payload] || { x: 300, y: 400 };
      return {
        ...state,
        currentZone: action.payload,
        phase: 'playing',
        player: {
          ...state.player,
          z: 0,
          pos: spawnPos,
        },
      };
    }

    case 'UNLOCK_ZONE':
      if (state.unlockedZones.includes(action.payload)) return state;
      return {
        ...state,
        unlockedZones: [...state.unlockedZones, action.payload],
      };

    case 'ADD_ITEM':
      if (state.inventory.includes(action.payload)) return state;
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
        score: state.score + 50,
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter((i) => i !== action.payload),
      };

    case 'SET_ACTIVE_NPC':
      return {
        ...state,
        activeNPCId: action.payload,
        activeDialogueNodeId: 'start',
        phase: action.payload ? 'dialogue' : 'playing',
      };

    case 'SET_DIALOGUE_NODE':
      return { ...state, activeDialogueNodeId: action.payload };

    case 'START_MINI_GAME':
      return { ...state, activeMiniGame: action.payload, phase: 'miniGame' };

    case 'END_MINI_GAME': {
      const bonus = action.payload.scoreBonus || 0;
      return {
        ...state,
        activeMiniGame: null,
        phase: 'playing',
        score: state.score + bonus,
        democracyMeter: action.payload.success
          ? mergeMeter(state.democracyMeter, { awareness: 5, trust: 5 })
          : state.democracyMeter,
      };
    }

    case 'UPDATE_DEMOCRACY':
      return {
        ...state,
        democracyMeter: mergeMeter(state.democracyMeter, action.payload),
        score: state.score + Object.values(action.payload).reduce((a, b) => a + Math.max(0, b || 0), 0) * 5,
      };

    case 'COMPLETE_QUEST': {
      const updated = state.quests.map((q) =>
        q.id === action.payload
          ? { ...q, status: 'complete' as const, objectives: q.objectives.map((o) => ({ ...o, complete: true })) }
          : q
      );
      return {
        ...state,
        quests: updated,
        completedQuests: state.completedQuests.includes(action.payload)
          ? state.completedQuests
          : [...state.completedQuests, action.payload],
        score: state.score + 200,
        reputation: state.reputation + 30,
      };
    }

    case 'COMPLETE_OBJECTIVE': {
      const updated = state.quests.map((q) =>
        q.id === action.payload.questId
          ? {
              ...q,
              objectives: q.objectives.map((o) =>
                o.id === action.payload.objId ? { ...o, complete: true } : o
              ),
            }
          : q
      );
      return { ...state, quests: updated, score: state.score + 25 };
    }

    case 'START_QUEST': {
      const updated = state.quests.map((q) =>
        q.id === action.payload && q.status === 'inactive' ? { ...q, status: 'active' as const } : q
      );
      return { ...state, quests: updated };
    }

    case 'SET_FLAG':
      return { ...state, flags: { ...state.flags, [action.payload.key]: action.payload.value } };

    case 'ADD_REPUTATION':
      return {
        ...state,
        reputation: clamp(state.reputation + action.payload, 0, 1000),
        score: state.score + action.payload * 2,
      };

    case 'ADD_SCORE':
      return { ...state, score: state.score + action.payload };

    case 'SET_PLAYER_NAME':
      return { ...state, player: { ...state.player, name: action.payload } };

    case 'SET_PLAYER_AVATAR':
      return { ...state, player: { ...state.player, avatar: action.payload } };

    case 'SET_ROLE': {
      const quests = action.payload === 'guardian' ? GUARDIAN_INITIAL_QUESTS : CHAMPION_INITIAL_QUESTS;
      // Mark the first quest as active automatically
      const updatedQuests = quests.map((q, i) => i === 0 ? { ...q, status: 'active' as const } : q);
      return { 
        ...state, 
        role: action.payload,
        quests: updatedQuests
      };
    }

    case 'ADD_GEMINI_MESSAGE':
      return {
        ...state,
        geminiMessages: [...state.geminiMessages.slice(-20), action.payload],
      };

    case 'TICK':
      return { ...state, playTime: state.playTime + action.payload };

    case 'SET_ENDING':
      return {
        ...state,
        phase: 'ending',
        endings: state.endings.includes(action.payload) ? state.endings : [...state.endings, action.payload],
      };

    default:
      return state;
  }
}
