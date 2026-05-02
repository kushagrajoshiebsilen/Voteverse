import type { Zone } from './types';

// We merge all NPCs into the neighborhood zone so the player can interact with the whole 1:1 map.
export const neighborhoodZone: Zone = {
  id: 'neighborhood',
  name: 'Voter Neighborhood',
  description: 'Your home district. Start your democratic journey here.',
  bgColor: '#698784', accentColor: '#F3B760', emoji: '🏘️',
  mapPosition: { x: 200, y: 350 },
  unlocked: true,
  buildings: [], // Handled by GameCanvas rendering directly
  props: [],
  npcs: [
    {
      id: 'officer_meena', pos: { x: 40, y: -30 }, name: 'Officer Meena', role: 'ERO Officer',
      emoji: '👩‍💼', color: '#8B5CF6', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Officer Meena',
          text: "Welcome to the Registration Office. Do you have your Aadhaar?",
          choices: [
            { text: "Yes, here is my Aadhaar!", next: 'verify', effect: { addItem: 'voter_id', completeObjective: { questId: 'gq1_verify', objectiveId: 'o2' }, updateMeter: { trust: 15 } } },
            { text: "I don't have it yet", next: 'noid' }
          ]
        },
        { id: 'verify', speaker: 'Officer Meena', text: "Excellent! Voter ID issued.", next: '__end', effect: { completeObjective: { questId: 'gq1_verify', objectiveId: 'o3' } } },
        { id: 'noid', speaker: 'Officer Meena', text: "Come back when you have it.", next: '__end' }
      ]
    },
    {
      id: 'grandma_priya', pos: { x: 220, y: 160 }, name: 'Priya Dadi', role: 'Elder Citizen',
      emoji: '👵', color: '#C8902A', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Priya Dadi',
          text: "Namaste beta! To vote you first need a Voter ID. The center is to the North-West.",
          choices: [
            { text: "How do I register?", next: 'docs', effect: { completeObjective: { questId: 'gq1_verify', objectiveId: 'o1' } } }
          ]
        },
        { id: 'docs', speaker: 'Priya Dadi', text: "Go to the Registration Center.", next: '__end', effect: { startQuest: 'gq1_verify' } }
      ]
    },
    {
      id: 'booth_officer', pos: { x: 420, y: -60 }, name: 'Booth Officer', role: 'Election Official',
      emoji: '👮', color: '#2ABFBF', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Booth Officer',
          text: "Welcome to the Polling Pavilion. Cast your vote securely.",
          choices: [
            { text: "I'm ready to vote!", next: 'vote', effect: { updateMeter: { turnout: 25 }, completeObjective: { questId: 'gq2_booth', objectiveId: 'o1' } } }
          ]
        },
        { id: 'vote', speaker: 'Booth Officer', text: "Proceed to Booth 2.", next: '__end', effect: { addItem: 'ink_badge', completeObjective: { questId: 'gq2_booth', objectiveId: 'o2' } } }
      ]
    }
  ],
  objects: [
    { id: 'home_shelf', pos: { x: 240, y: -80 }, size: { x: 40, y: 40 }, label: 'Info Kiosk', emoji: '📦', isActive: true, zoneId: 'neighborhood', interactAction: { triggerEvent: 'search_shelf', completeObjective: { questId: 'gq1_verify', objectiveId: 'o1' } } },
    { id: 'evm_kiosk', pos: { x: 480, y: 180 }, size: { x: 40, y: 40 }, label: 'Ballot Box', emoji: '🗳️', isActive: true, zoneId: 'neighborhood', interactAction: { completeObjective: { questId: 'gq2_booth', objectiveId: 'o3' }, updateMeter: { trust: 10 } } }
  ]
};

export const registrationZone = { ...neighborhoodZone, id: 'registration' as const };
export const campaignZone = { ...neighborhoodZone, id: 'campaign' as const };
export const pollingZone = { ...neighborhoodZone, id: 'polling' as const };
export const resultsZone = { ...neighborhoodZone, id: 'results' as const };

export const ZONES: Zone[] = [neighborhoodZone, registrationZone, campaignZone, pollingZone, resultsZone];
