import type { Zone, NPC, InteractableObject } from './types';

// ──────────────────────────────────────────────
// ZONE 1: NEIGHBORHOOD
// ──────────────────────────────────────────────
export const neighborhoodZone: Zone = {
  id: 'neighborhood',
  name: 'Voter Neighborhood',
  description: 'Your home district. Start your democratic journey here.',
  bgColor: '#0B0E14', accentColor: '#2ABFBF', emoji: '🏘️',
  mapPosition: { x: 200, y: 350 },
  unlocked: true,
  buildings: [
    { rect: { x: 100, y: 150, w: 250, d: 180, h: 90 }, color: '#334155', roofColor: '#1E293B', label: 'Residential Wing A', emoji: '🏠', style: 'office' },
    { rect: { x: 450, y: 120, w: 350, d: 220, h: 110 }, color: '#475569', roofColor: '#0F172A', label: 'Chai Point Corner', emoji: '☕', style: 'office' }
  ],
  props: [
    { id: 'lamp_1', type: 'lamp', pos: { x: 400, y: 350 }, size: { x: 10, y: 10 } },
    { id: 'lamp_2', type: 'lamp', pos: { x: 850, y: 350 }, size: { x: 10, y: 10 } },
    { id: 'bench_1', type: 'bench', pos: { x: 600, y: 500 }, size: { x: 40, y: 10 } }
  ],
  npcs: [
    {
      id: 'grandma_priya', pos: { x: 550, y: 350 }, name: 'Priya Dadi', role: 'Elder Citizen', emoji: '👵', color: '#f59e0b', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Priya Dadi', text: "Namaste beta! To vote, you first need to register at the Administrative Center to the East.",
          choices: [
            { text: "Where are my docs?", next: 'docs', effect: { startQuest: 'q1_register' } },
            { text: "I'm going now!", next: 'bye' }
          ]
        },
        { id: 'docs', speaker: 'Priya Dadi', text: "Check your storage shelf in the house. Your Aadhaar is there!", next: '__end' },
        { id: 'bye', speaker: 'Priya Dadi', text: "Good luck! The future is in your hands.", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'home_shelf', pos: { x: 200, y: 220 }, size: { x: 40, y: 40 }, label: 'Storage Shelf', emoji: '📦', isActive: true, zoneId: 'neighborhood', interactAction: { triggerEvent: 'search_shelf' } },
    { id: 'exit_reg', pos: { x: 950, y: 380 }, size: { x: 60, y: 60 }, label: 'To Registration Center', emoji: '🏛️', isActive: true, zoneId: 'neighborhood', interactAction: { unlockZone: 'registration' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 2: REGISTRATION CENTER
// ──────────────────────────────────────────────
export const registrationZone: Zone = {
  id: 'registration',
  name: 'Registration Center',
  description: 'Official Administrative Complex.',
  bgColor: '#0F172A', accentColor: '#8B5CF6', emoji: '🏛️',
  mapPosition: { x: 400, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 200, y: 100, w: 800, d: 220, h: 140 }, color: '#334155', roofColor: '#1E293B', label: 'Electoral Registration Office', emoji: '🏛️', style: 'office' }
  ],
  props: [
    { id: 'kiosk_1', type: 'kiosk', pos: { x: 450, y: 380 }, size: { x: 20, y: 20 } },
    { id: 'barrier_1', type: 'barrier', pos: { x: 500, y: 460 }, size: { x: 60, y: 10 } },
    { id: 'bench_1', type: 'bench', pos: { x: 400, y: 580 }, size: { x: 40, y: 10 } },
    { id: 'desk_1', type: 'counter', pos: { x: 600, y: 320 }, size: { x: 80, y: 30 } }
  ],
  npcs: [
    {
      id: 'officer_meena', pos: { x: 600, y: 280 }, name: 'Officer Meena', role: 'ERO Assistant', emoji: '👩‍💼', color: '#8b5cf6', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Officer Meena', text: "Welcome. Present your Aadhaar Card to receive your Voter ID.",
          choices: [
            { text: "Here is my Aadhaar!", next: 'verify', requires: 'aadhaar_card', effect: { completeQuest: 'q1_register', addItem: 'voter_id' } }
          ]
        },
        { id: 'verify', speaker: 'Officer Meena', text: "Verified. You are now a registered voter! Head East to Campaign Street.", choices: [{ text: "Proceed", next: 'done', effect: { unlockZone: 'campaign' } }] },
        { id: 'done', speaker: 'Officer Meena', text: "The candidates are waiting.", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'exit_camp', pos: { x: 1100, y: 400 }, size: { x: 60, y: 60 }, label: 'To Campaign Street', emoji: '🚩', isActive: true, zoneId: 'registration', interactAction: { unlockZone: 'campaign' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 3: CAMPAIGN STREET
// ──────────────────────────────────────────────
export const campaignZone: Zone = {
  id: 'campaign',
  name: 'Campaign Street',
  description: 'The heart of democratic debate.',
  bgColor: '#1A1C24', accentColor: '#FFB800', emoji: '🚩',
  mapPosition: { x: 600, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 300, y: 100, w: 600, d: 200, h: 120 }, color: '#451A03', roofColor: '#78350F', label: 'Media & Press Hub', emoji: '📰', style: 'office' }
  ],
  props: [
    { id: 'rally_1', type: 'counter', pos: { x: 600, y: 350 }, size: { x: 100, y: 40 } },
    { id: 'barrier_c1', type: 'barrier', pos: { x: 400, y: 450 }, size: { x: 80, y: 10 } },
    { id: 'lamp_c1', type: 'lamp', pos: { x: 300, y: 380 }, size: { x: 10, y: 10 } }
  ],
  npcs: [
    {
      id: 'candidate_rahul', pos: { x: 600, y: 300 }, name: 'Rahul', role: 'Candidate', emoji: '🎤', color: '#FFB800', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Rahul', text: "My vision for this district is growth! Are you ready to vote for progress?",
          choices: [
            { text: "What about education?", next: 'edu', effect: { updateMeter: { awareness: 10 } } },
            { text: "How do I vote?", next: 'how' }
          ]
        },
        { id: 'edu', speaker: 'Rahul', text: "We will build 5 new schools! Education is the backbone of democracy.", next: '__end' },
        { id: 'how', speaker: 'Rahul', text: "The Polling Booth is further East. You'll need your Voter ID!", next: '__end', effect: { unlockZone: 'polling' } }
      ]
    }
  ],
  objects: [
    { id: 'exit_poll', pos: { x: 1100, y: 400 }, size: { x: 60, y: 60 }, label: 'To Polling Booth', emoji: '🗳️', isActive: true, zoneId: 'campaign', interactAction: { unlockZone: 'polling' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 4: POLLING BOOTH
// ──────────────────────────────────────────────
export const pollingZone: Zone = {
  id: 'polling',
  name: 'Polling Pavilion',
  description: 'Cast your vote in a secure environment.',
  bgColor: '#064E3B', accentColor: '#10B981', emoji: '🗳️',
  mapPosition: { x: 800, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 200, y: 150, w: 800, d: 250, h: 100 }, color: '#064E3B', roofColor: '#065F46', label: 'Electoral Voting Hall', emoji: '🏢', style: 'office' }
  ],
  props: [
    { id: 'v_booth_1', type: 'kiosk', pos: { x: 400, y: 300 }, size: { x: 30, y: 30 } },
    { id: 'v_booth_2', type: 'kiosk', pos: { x: 600, y: 300 }, size: { x: 30, y: 30 } },
    { id: 'v_booth_3', type: 'kiosk', pos: { x: 800, y: 300 }, size: { x: 30, y: 30 } }
  ],
  npcs: [
    {
      id: 'booth_officer', pos: { x: 600, y: 250 }, name: 'Booth Officer', role: 'Election Official', emoji: '👮', color: '#10B981', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Booth Officer', text: "Please present your Voter ID for the ink mark and access to the EVM.",
          choices: [
            { text: "I have my Voter ID!", next: 'vote', requires: 'voter_id', effect: { updateMeter: { turnout: 25 } } }
          ]
        },
        { id: 'vote', speaker: 'Booth Officer', text: "Proceed to Booth 2. Your vote is your power!", choices: [{ text: "Cast Vote", next: 'done', effect: { unlockZone: 'results' } }] },
        { id: 'done', speaker: 'Booth Officer', text: "Thank you for voting. Check the Results Hall to the East.", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'exit_res', pos: { x: 1100, y: 400 }, size: { x: 60, y: 60 }, label: 'To Results Hall', emoji: '📊', isActive: true, zoneId: 'polling', interactAction: { unlockZone: 'results' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 5: RESULTS HALL
// ──────────────────────────────────────────────
export const resultsZone: Zone = {
  id: 'results',
  name: 'Democratic Theater',
  description: 'The final tally of the city voice.',
  bgColor: '#4C1D95', accentColor: '#D946EF', emoji: '📊',
  mapPosition: { x: 1000, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 100, y: 100, w: 1000, d: 300, h: 200 }, color: '#2E1065', roofColor: '#4C1D95', label: 'Grand Counting Chamber', emoji: '🏛️', style: 'office' }
  ],
  props: [
    { id: 'screen_1', type: 'counter', pos: { x: 600, y: 200 }, size: { x: 400, y: 40 } }
  ],
  npcs: [
    {
      id: 'announcer', pos: { x: 600, y: 250 }, name: 'Announcer', role: 'State Commissioner', emoji: '🎙️', color: '#D946EF', dir: 'down', currentNode: 'start',
      dialogue: [
        { id: 'start', speaker: 'Announcer', text: "The results are in! Democracy has won today. You played your part!", next: 'end' },
        { id: 'end', speaker: 'Announcer', text: "Thank you for completing your journey as a first-time voter.", choices: [{ text: "Finish Journey", next: '__end', effect: { triggerEvent: 'trigger_ending' } }] }
      ]
    }
  ],
  objects: [
    { id: 'exit_home', pos: { x: 100, y: 400 }, size: { x: 60, y: 60 }, label: 'Return Home', emoji: '🏠', isActive: true, zoneId: 'results', interactAction: { unlockZone: 'neighborhood' } }
  ]
};

export const ZONES: Zone[] = [neighborhoodZone, registrationZone, campaignZone, pollingZone, resultsZone];
