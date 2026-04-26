import type { Quest } from './types';

export const TILE = 48;
export const WORLD_W = 1200;
export const WORLD_H = 800;
export const PLAYER_SPEED = 3.2;
export const PLAYER_SIZE = 36;
export const INTERACT_RADIUS = 70;
export const NPC_WALK_SPEED = 0.8;

export const ZONE_COLORS: Record<string, { bg: string; accent: string; sky: string }> = {
  neighborhood: { bg: '#1a2e1a', accent: '#4ade80', sky: '#0f2d0f' },
  registration: { bg: '#1a1a2e', accent: '#818cf8', sky: '#0d0d2e' },
  campaign: { bg: '#2e1a1a', accent: '#f97316', sky: '#1a0a0a' },
  polling: { bg: '#1a2535', accent: '#38bdf8', sky: '#0a1520' },
  results: { bg: '#2e2a0f', accent: '#fbbf24', sky: '#1a1500' },
};

export const GUARDIAN_INITIAL_QUESTS: Quest[] = [
  {
    id: 'gq1_verify',
    title: 'Process Verification',
    description: 'Establish trust by verifying documents and assisting with lawful registration.',
    zone: 'neighborhood',
    status: 'inactive',
    objectives: [
      { id: 'o1', text: 'Help 3 neighbors check their Voter ID', complete: false },
      { id: 'o2', text: 'Verify document proofs at the center', complete: false },
      { id: 'o3', text: 'Ensure the registration line is orderly', complete: false },
    ],
    reward: 'Seal of Integrity',
  },
  {
    id: 'gq2_booth',
    title: 'Booth Integrity',
    description: 'Inspect the polling center to ensure all safeguards are in place.',
    zone: 'polling',
    status: 'inactive',
    objectives: [
      { id: 'o1', text: 'Inspect the EVM seal integrity', complete: false },
      { id: 'o2', text: 'Verify the VVPAT display function', complete: false },
      { id: 'o3', text: 'Cross-reference the voter list', complete: false },
    ],
    reward: 'Inspector Badge',
  },
];

export const CHAMPION_INITIAL_QUESTS: Quest[] = [
  {
    id: 'cq1_mobilize',
    title: 'Community Spark',
    description: 'Ignite interest in the election and help citizens understand their power.',
    zone: 'neighborhood',
    status: 'inactive',
    objectives: [
      { id: 'o1', text: 'Talk to 5 youth citizens about voting', complete: false },
      { id: 'o2', text: 'Clear up rumors at the tea stall', complete: false },
      { id: 'o3', text: 'Distribute 3 awareness flyers', complete: false },
    ],
    reward: 'Speaker Horn',
  },
  {
    id: 'cq2_rumor',
    title: 'Misinfo Strike',
    description: 'Identify and expose false narratives spreading in the market.',
    zone: 'campaign',
    status: 'inactive',
    objectives: [
      { id: 'o1', text: 'Flag the fake news banner', complete: false },
      { id: 'o2', text: 'Counter the rumor spreader in Sector 2', complete: false },
      { id: 'o3', text: 'Post correct info on the digital board', complete: false },
    ],
    reward: 'Truth Seeker Medal',
  },
];

export const INITIAL_QUESTS = GUARDIAN_INITIAL_QUESTS; // Legacy fallback

export const GEMINI_API_KEY_PLACEHOLDER = 'YOUR_GEMINI_API_KEY';

export const ITEMS: Record<string, { label: string; emoji: string; description: string }> = {
  aadhaar_card: { label: 'Aadhaar Card', emoji: '🪪', description: 'Your national identity proof.' },
  address_proof: { label: 'Address Proof', emoji: '📄', description: 'Utility bill showing your address.' },
  voter_id: { label: 'Voter ID Card', emoji: '🗳️', description: 'Your official EPIC voter card.' },
  form6: { label: 'Form 6', emoji: '📋', description: 'Application form for new voter registration.' },
  democracy_badge: { label: 'Democracy Badge', emoji: '🏅', description: 'Awarded for civic courage.' },
  ink_badge: { label: 'Ink-Marked Badge', emoji: '☑️', description: 'You voted! Wear it with pride.' },
  newspaper: { label: 'Newspaper', emoji: '📰', description: 'Contains news about the upcoming election.' },
  candidate_flyer: { label: 'Candidate Flyer', emoji: '📜', description: 'Campaign material from a candidate.' },
  phone: { label: 'Smartphone', emoji: '📱', description: 'You can use Voter Helpline 1950 or the Voter Helpline App.' },
  champion_medal: { label: 'Democracy Champion', emoji: '🏆', description: 'You completed VoteVerse!' },
};

export const ZONE_SPAWN_POSITIONS: Record<string, { x: number; y: number }> = {
  neighborhood: { x: 300, y: 400 },
  registration: { x: 200, y: 350 },
  campaign: { x: 250, y: 400 },
  polling: { x: 200, y: 380 },
  results: { x: 300, y: 350 },
};

export const MINI_GAME_CONFIGS = {
  document_hunt: {
    timeLimit: 45,
    requiredDocs: ['aadhaar_card', 'address_proof'],
    description: 'Find your documents scattered around the room before time runs out!',
  },
  form_sorting: {
    timeLimit: 60,
    formsCount: 12,
    description: 'Sort voter registration forms into correct piles as fast as you can!',
  },
  misinformation_stop: {
    timeLimit: 50,
    fakeCount: 5,
    description: 'Identify and flag fake news banners spreading through the market!',
  },
  evm_voting: {
    timeLimit: 30,
    description: 'Follow the correct EVM voting procedure step by step!',
  },
  booth_navigation: {
    timeLimit: 40,
    description: 'Guide lost citizens to their correct polling booths!',
  },
  voter_help: {
    timeLimit: 55,
    description: 'Help citizens with missing voter information find their details!',
  },
};
