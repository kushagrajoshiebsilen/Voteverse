export type ZoneId = 'neighborhood' | 'registration' | 'campaign' | 'polling' | 'results';

export type Direction = 'up' | 'down' | 'left' | 'right' | 'idle';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player {
  pos: Vec2;
  z: number; // Altitude (Jump Height)
  dir: Direction;
  speed: number;
  frame: number;
  animTimer: number;
  name: string;
  avatar: 'hero_m' | 'hero_f';
}

export interface NPC {
  id: string;
  pos: Vec2;
  name: string;
  role: string;
  emoji: string;
  color: string;
  dialogue: DialogueNode[];
  currentNode: string;
  hasQuest?: string;
  questComplete?: boolean;
  dir: Direction;
  walkPattern?: Vec2[];
  walkIndex?: number;
  walkTimer?: number;
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker: string;
  choices?: DialogueChoice[];
  effect?: GameEffect;
  next?: string;
}

export interface DialogueChoice {
  text: string;
  next: string;
  effect?: GameEffect;
  requires?: string;
}

export interface GameEffect {
  addItem?: string;
  removeItem?: string;
  updateMeter?: Partial<DemocracyMeter>;
  completeQuest?: string;
  startQuest?: string;
  unlockZone?: ZoneId;
  startMiniGame?: MiniGameId;
  addReputation?: number;
  triggerEvent?: string;
  geminiCall?: string;
}

export type MiniGameId =
  | 'document_hunt'
  | 'form_sorting'
  | 'misinformation_stop'
  | 'evm_voting'
  | 'booth_navigation'
  | 'voter_help';

export interface Quest {
  id: string;
  title: string;
  description: string;
  zone: ZoneId;
  status: 'inactive' | 'active' | 'complete';
  objectives: QuestObjective[];
  reward?: string;
}

export interface QuestObjective {
  id: string;
  text: string;
  complete: boolean;
}

export interface InteractableObject {
  id: string;
  pos: Vec2;
  size: Vec2;
  label: string;
  emoji: string;
  interactAction: GameEffect;
  hint?: string;
  zoneId: ZoneId;
  isActive: boolean;
  glowing?: boolean;
}

export interface DemocracyMeter {
  awareness: number;
  trust: number;
  ethics: number;
  turnout: number;
}

export type PlayerRole = 'guardian' | 'champion';

export interface GameState {
  phase: 'intro' | 'naming' | 'playing' | 'dialogue' | 'miniGame' | 'transition' | 'ending';
  role: PlayerRole;
  currentZone: ZoneId;
  unlockedZones: ZoneId[];
  player: Player;
  inventory: string[];
  quests: Quest[];
  democracyMeter: DemocracyMeter;
  reputation: number;
  activeNPCId: string | null;
  activeDialogueNodeId: string;
  activeMiniGame: MiniGameId | null;
  completedQuests: string[];
  flags: Record<string, boolean>;
  geminiMessages: GeminiMessage[];
  score: number;
  playTime: number;
  endings: string[];
}

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Zone {
  id: ZoneId;
  name: string;
  description: string;
  bgColor: string;
  accentColor: string;
  emoji: string;
  mapPosition: Vec2;
  unlocked: boolean;
  buildings: Building[];
  npcs: NPC[];
  objects: InteractableObject[];
  props: EnvProp[];
  ambientEvents?: AmbientEvent[];
}

export interface EnvProp {
  id: string;
  type: 'tree' | 'bench' | 'lamp' | 'flower_pot' | 'fence' | 'trash_bin' | 'poster' | 'crossing' | 'sidewalk';
  pos: Vec2;
  size: Vec2;
  style?: string;
}

export interface Building {
  rect: Rect;
  color: string;
  roofColor: string;
  label: string;
  emoji: string;
  doorRect?: Rect;
}

export interface AmbientEvent {
  id: string;
  type: 'banner' | 'crowd' | 'vehicle' | 'rain';
  pos: Vec2;
  message?: string;
}

export interface MiniGameState {
  id: MiniGameId;
  phase: 'intro' | 'playing' | 'success' | 'failed';
  timer: number;
  maxTimer: number;
  score: number;
  data: Record<string, unknown>;
}

export type GameAction =
  | { type: 'SET_PHASE'; payload: GameState['phase'] }
  | { type: 'MOVE_PLAYER'; payload: Vec2 }
  | { type: 'SET_ZONE'; payload: ZoneId }
  | { type: 'UNLOCK_ZONE'; payload: ZoneId }
  | { type: 'ADD_ITEM'; payload: string }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_ACTIVE_NPC'; payload: string | null }
  | { type: 'SET_DIALOGUE_NODE'; payload: string }
  | { type: 'START_MINI_GAME'; payload: MiniGameId }
  | { type: 'END_MINI_GAME'; payload: { success: boolean; scoreBonus?: number } }
  | { type: 'UPDATE_DEMOCRACY'; payload: Partial<DemocracyMeter> }
  | { type: 'COMPLETE_QUEST'; payload: string }
  | { type: 'COMPLETE_OBJECTIVE'; payload: { questId: string; objId: string } }
  | { type: 'START_QUEST'; payload: string }
  | { type: 'SET_FLAG'; payload: { key: string; value: boolean } }
  | { type: 'ADD_REPUTATION'; payload: number }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SET_PLAYER_AVATAR'; payload: 'hero_m' | 'hero_f' }
  | { type: 'SET_ROLE'; payload: PlayerRole }
  | { type: 'ADD_GEMINI_MESSAGE'; payload: GeminiMessage }
  | { type: 'TICK'; payload: number }
  | { type: 'SET_ENDING'; payload: string };
