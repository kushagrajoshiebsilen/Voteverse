/**
 * Test Suite for VoteVerse Core Logic
 * 
 * This file serves as a demonstration of the testing architecture for the project.
 * It focuses on the pure functions in the game reducer to ensure deterministic 
 * state transitions.
 */

import { gameReducer, INITIAL_STATE } from './gameReducer';
import type { GameState, GameAction } from './types';

describe('VoteVerse Reducer Logic', () => {
  
  test('MOVE_PLAYER should update coordinates correctly', () => {
    const action: GameAction = { type: 'MOVE_PLAYER', payload: { x: 100, y: 150 } };
    const newState = gameReducer(INITIAL_STATE, action);
    
    expect(newState.player.pos.x).toBe(100);
    expect(newState.player.pos.y).toBe(150);
  });

  test('ADD_ITEM should uniquely add items to inventory', () => {
    const action: GameAction = { type: 'ADD_ITEM', payload: 'voter_id' };
    const stateWithItem = gameReducer(INITIAL_STATE, action);
    
    expect(stateWithItem.inventory).toContain('voter_id');
    
    // Test idempotency
    const doubleState = gameReducer(stateWithItem, action);
    expect(doubleState.inventory.filter(i => i === 'voter_id').length).toBe(1);
  });

  test('COMPLETE_OBJECTIVE should mark objective as complete and update score', () => {
    const questId = 'gq1_verify';
    const objId = 'o1';
    const action: GameAction = { type: 'COMPLETE_OBJECTIVE', payload: { questId, objId } };
    
    const newState = gameReducer(INITIAL_STATE, action);
    const quest = newState.quests.find(q => q.id === questId);
    const objective = quest?.objectives.find(o => o.id === objId);
    
    expect(objective?.complete).toBe(true);
    expect(newState.score).toBeGreaterThan(INITIAL_STATE.score);
  });

  test('Quest auto-completion and next quest activation', () => {
    let state = INITIAL_STATE;
    const quest = state.quests[0];
    
    // Complete all objectives for the first quest
    quest.objectives.forEach(obj => {
      state = gameReducer(state, { 
        type: 'COMPLETE_OBJECTIVE', 
        payload: { questId: quest.id, objId: obj.id } 
      });
    });
    
    const completedQuest = state.quests.find(q => q.id === quest.id);
    expect(completedQuest?.status).toBe('complete');
    
    // Check if next quest is activated
    const nextQuest = state.quests[1];
    expect(nextQuest.status).toBe('active');
  });

  test('UNLOCK_ZONE should add to unlockedZones array', () => {
    const action: GameAction = { type: 'UNLOCK_ZONE', payload: 'polling' };
    const newState = gameReducer(INITIAL_STATE, action);
    
    expect(newState.unlockedZones).toContain('polling');
  });

});

/**
 * Mocking global objects for browser environment tests
 */
function describe(name: string, fn: () => void) {
  console.log(`\n🧪 Testing: ${name}`);
  fn();
}

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASSED: ${name}`);
  } catch (e) {
    console.error(`  ❌ FAILED: ${name}`);
    console.error(e);
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${expected} but got ${actual}`);
    },
    toContain: (item: any) => {
      if (!actual.includes(item)) throw new Error(`Expected ${actual} to contain ${item}`);
    },
    toBeGreaterThan: (val: number) => {
      if (!(actual > val)) throw new Error(`Expected ${actual} to be greater than ${val}`);
    },
    filter: (fn: any) => actual.filter(fn),
  };
}
