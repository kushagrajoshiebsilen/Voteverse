import type { Zone } from './types';

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
    { rect: { x: 100, y: 150, w: 250, d: 180, h: 90 }, color: '#1E2D3D', roofColor: '#111827', label: 'Residential Wing A', emoji: '🏠', style: 'office' },
    { rect: { x: 500, y: 100, w: 350, d: 220, h: 110 }, color: '#263040', roofColor: '#0F172A', label: 'Community Center', emoji: '🏛️', style: 'office' }
  ],
  props: [
    { id: 'lamp_1', type: 'lamp', pos: { x: 380, y: 340 }, size: { x: 10, y: 10 } },
    { id: 'lamp_2', type: 'lamp', pos: { x: 720, y: 320 }, size: { x: 10, y: 10 } },
    { id: 'bench_1', type: 'bench', pos: { x: 560, y: 480 }, size: { x: 40, y: 10 } },
    { id: 'kiosk_n1', type: 'kiosk', pos: { x: 700, y: 440 }, size: { x: 20, y: 20 } },
  ],
  npcs: [
    {
      id: 'grandma_priya', pos: { x: 400, y: 380 }, name: 'Priya Dadi', role: 'Elder Citizen',
      emoji: '👵', color: '#C8902A', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Priya Dadi',
          text: "Namaste beta! To vote you first need a Voter ID. Have you registered yet? The center is to the East.",
          choices: [
            { text: "How do I register?", next: 'docs', effect: { completeObjective: { questId: 'gq1_verify', objectiveId: 'o1' } } },
            { text: "I'm going now!", next: 'bye' }
          ]
        },
        { id: 'docs', speaker: 'Priya Dadi', text: "Go to the Registration Center with your Aadhaar Card. They'll handle the rest!", next: '__end', effect: { startQuest: 'gq1_verify' } },
        { id: 'bye', speaker: 'Priya Dadi', text: "Good luck! Democracy needs young people like you.", next: '__end' }
      ]
    },
    {
      id: 'youth_raj', pos: { x: 680, y: 460 }, name: 'Raj', role: 'Youth Citizen',
      emoji: '🧑', color: '#5B8FBF', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Raj',
          text: "Hey! I heard you can check voter registration on voters.eci.gov.in. Have you verified yours?",
          choices: [
            { text: "Thanks for the tip!", next: 'tip', effect: { completeObjective: { questId: 'gq1_verify', objectiveId: 'o1' }, updateMeter: { awareness: 5 } } }
          ]
        },
        { id: 'tip', speaker: 'Raj', text: "Great! Head to the Registration Center East. Take your documents!", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'home_shelf', pos: { x: 180, y: 210 }, size: { x: 50, y: 50 }, label: 'Search for Documents', emoji: '📦', isActive: true, zoneId: 'neighborhood', interactAction: { triggerEvent: 'search_shelf', completeObjective: { questId: 'gq1_verify', objectiveId: 'o1' } } },
    { id: 'exit_reg', pos: { x: 950, y: 400 }, size: { x: 60, y: 60 }, label: 'Registration Center →', emoji: '🏛️', isActive: true, zoneId: 'neighborhood', interactAction: { unlockZone: 'registration' } }
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
    { rect: { x: 150, y: 80, w: 800, d: 240, h: 140 }, color: '#1A253A', roofColor: '#0F172A', label: 'Electoral Registration Office', emoji: '🏛️', style: 'office' }
  ],
  props: [
    { id: 'kiosk_r1', type: 'kiosk', pos: { x: 420, y: 360 }, size: { x: 20, y: 20 } },
    { id: 'barrier_r1', type: 'barrier', pos: { x: 500, y: 460 }, size: { x: 60, y: 10 } },
    { id: 'bench_r1', type: 'bench', pos: { x: 380, y: 560 }, size: { x: 40, y: 10 } },
    { id: 'desk_r1', type: 'counter', pos: { x: 620, y: 310 }, size: { x: 80, y: 30 } },
    { id: 'lamp_r1', type: 'lamp', pos: { x: 280, y: 380 }, size: { x: 10, y: 10 } },
  ],
  npcs: [
    {
      id: 'officer_meena', pos: { x: 580, y: 290 }, name: 'Officer Meena', role: 'ERO Officer',
      emoji: '👩‍💼', color: '#8B5CF6', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Officer Meena',
          text: "Welcome to the Registration Office. I can help you get your Voter ID. Do you have your Aadhaar?",
          choices: [
            { text: "Yes, here is my Aadhaar!", next: 'verify', effect: { addItem: 'voter_id', completeObjective: { questId: 'gq1_verify', objectiveId: 'o2' }, updateMeter: { trust: 15 } } },
            { text: "I don't have it yet", next: 'noid' }
          ]
        },
        { id: 'verify', speaker: 'Officer Meena', text: "Excellent! Voter ID issued. You are now a registered voter. Proceed to Campaign Street.", next: '__end', effect: { completeObjective: { questId: 'gq1_verify', objectiveId: 'o3' }, unlockZone: 'campaign' } },
        { id: 'noid', speaker: 'Officer Meena', text: "No problem. Check your home storage and come back. Your Aadhaar should be there.", next: '__end' }
      ]
    },
    {
      id: 'helper_arjun', pos: { x: 380, y: 460 }, name: 'Arjun', role: 'ERO Assistant',
      emoji: '🧑‍💻', color: '#2ABFBF', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Arjun',
          text: "This queue is for document verification. Make sure your address proof is ready along with Aadhaar.",
          choices: [
            { text: "Got it, thanks!", next: 'done', effect: { updateMeter: { awareness: 8 }, completeObjective: { questId: 'gq1_verify', objectiveId: 'o3' } } }
          ]
        },
        { id: 'done', speaker: 'Arjun', text: "Great! The registration takes just 5 minutes. The officer at the counter will help you.", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'notice_board', pos: { x: 250, y: 350 }, size: { x: 50, y: 50 }, label: 'Read Notice Board', emoji: '📋', isActive: true, zoneId: 'registration', interactAction: { triggerEvent: 'read_notice', completeObjective: { questId: 'gq1_verify', objectiveId: 'o2' } } },
    { id: 'exit_camp', pos: { x: 1050, y: 400 }, size: { x: 60, y: 60 }, label: 'Campaign Street →', emoji: '🚩', isActive: true, zoneId: 'registration', interactAction: { unlockZone: 'campaign' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 3: CAMPAIGN STREET
// ──────────────────────────────────────────────
export const campaignZone: Zone = {
  id: 'campaign',
  name: 'Campaign Street',
  description: 'The heart of democratic debate.',
  bgColor: '#1A1C24', accentColor: '#C8902A', emoji: '🚩',
  mapPosition: { x: 600, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 280, y: 80, w: 600, d: 200, h: 120 }, color: '#1E1A10', roofColor: '#0F0D07', label: 'Media & Press Hub', emoji: '📰', style: 'office' }
  ],
  props: [
    { id: 'rally_c1', type: 'counter', pos: { x: 580, y: 340 }, size: { x: 100, y: 40 } },
    { id: 'barrier_c1', type: 'barrier', pos: { x: 400, y: 450 }, size: { x: 80, y: 10 } },
    { id: 'lamp_c1', type: 'lamp', pos: { x: 300, y: 370 }, size: { x: 10, y: 10 } },
    { id: 'kiosk_c1', type: 'kiosk', pos: { x: 800, y: 380 }, size: { x: 20, y: 20 } },
  ],
  npcs: [
    {
      id: 'candidate_rahul', pos: { x: 580, y: 310 }, name: 'Rahul', role: 'Candidate',
      emoji: '🎤', color: '#C8902A', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Rahul',
          text: "My vision for this district is growth! Every citizen deserves education and healthcare. Are you ready to vote?",
          choices: [
            { text: "Tell me about your manifesto", next: 'manifesto', effect: { completeObjective: { questId: 'cq1_mobilize', objectiveId: 'o1' }, updateMeter: { awareness: 12 } } },
            { text: "How do I cast my vote?", next: 'how', effect: { updateMeter: { awareness: 8 } } }
          ]
        },
        { id: 'manifesto', speaker: 'Rahul', text: "5 new schools, 3 hospitals, and clean water for every ward. Democracy works when people engage!", next: '__end', effect: { addItem: 'candidate_flyer' } },
        { id: 'how', speaker: 'Rahul', text: "Head to the Polling Booth with your Voter ID! The booth is East of here.", next: '__end', effect: { unlockZone: 'polling' } }
      ]
    },
    {
      id: 'journalist_priya', pos: { x: 780, y: 400 }, name: 'Priya Reporter', role: 'Journalist',
      emoji: '📰', color: '#6B7A8D', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Priya Reporter',
          text: "Be careful of misinformation! Always verify news from official sources before sharing.",
          choices: [
            { text: "Thanks for the warning!", next: 'done', effect: { completeObjective: { questId: 'cq1_mobilize', objectiveId: 'o2' }, updateMeter: { ethics: 10 } } }
          ]
        },
        { id: 'done', speaker: 'Priya Reporter', text: "Report MCC violations using the cVIGIL app. Democracy depends on honest citizens!", next: '__end', effect: { addItem: 'newspaper' } }
      ]
    }
  ],
  objects: [
    { id: 'banner_c1', pos: { x: 450, y: 460 }, size: { x: 60, y: 40 }, label: 'Inspect Campaign Banner', emoji: '🚩', isActive: true, zoneId: 'campaign', interactAction: { triggerEvent: 'banner_event', completeObjective: { questId: 'cq2_rumor', objectiveId: 'o1' } } },
    { id: 'exit_poll', pos: { x: 1050, y: 400 }, size: { x: 60, y: 60 }, label: 'Polling Pavilion →', emoji: '🗳️', isActive: true, zoneId: 'campaign', interactAction: { unlockZone: 'polling' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 4: POLLING BOOTH
// ──────────────────────────────────────────────
export const pollingZone: Zone = {
  id: 'polling',
  name: 'Polling Pavilion',
  description: 'Cast your vote in a secure environment.',
  bgColor: '#050E0E', accentColor: '#2ABFBF', emoji: '🗳️',
  mapPosition: { x: 800, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 180, y: 130, w: 800, d: 260, h: 110 }, color: '#0D2020', roofColor: '#071414', label: 'Electoral Voting Hall', emoji: '🏢', style: 'office' }
  ],
  props: [
    { id: 'v_booth_1', type: 'kiosk', pos: { x: 380, y: 290 }, size: { x: 30, y: 30 } },
    { id: 'v_booth_2', type: 'kiosk', pos: { x: 580, y: 290 }, size: { x: 30, y: 30 } },
    { id: 'v_booth_3', type: 'kiosk', pos: { x: 780, y: 290 }, size: { x: 30, y: 30 } },
    { id: 'desk_p1', type: 'counter', pos: { x: 580, y: 420 }, size: { x: 80, y: 30 } },
    { id: 'lamp_p1', type: 'lamp', pos: { x: 260, y: 350 }, size: { x: 10, y: 10 } },
  ],
  npcs: [
    {
      id: 'booth_officer', pos: { x: 580, y: 240 }, name: 'Booth Officer', role: 'Election Official',
      emoji: '👮', color: '#2ABFBF', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'Booth Officer',
          text: "Welcome to the Polling Pavilion. Please approach when ready to cast your vote. Your vote is secret and secure.",
          choices: [
            { text: "I'm ready to vote!", next: 'vote', effect: { updateMeter: { turnout: 25 }, completeObjective: { questId: 'gq2_booth', objectiveId: 'o1' } } },
            { text: "How does the EVM work?", next: 'evm', effect: { updateMeter: { awareness: 10 } } }
          ]
        },
        { id: 'vote', speaker: 'Booth Officer', text: "Proceed to Booth 2. Press the button next to your chosen candidate. The VVPAT will confirm your vote.", next: 'inked', effect: { addItem: 'ink_badge', completeObjective: { questId: 'gq2_booth', objectiveId: 'o2' } } },
        { id: 'inked', speaker: 'Booth Officer', text: "Your vote has been cast! You'll receive the ink mark. Results will be announced shortly. Head East!", next: '__end', effect: { unlockZone: 'results', completeObjective: { questId: 'gq2_booth', objectiveId: 'o3' } } },
        { id: 'evm', speaker: 'Booth Officer', text: "The EVM is tamper-proof. A VVPAT slip prints to confirm your vote. Come back when you're ready!", next: '__end' }
      ]
    }
  ],
  objects: [
    { id: 'evm_kiosk', pos: { x: 580, y: 320 }, size: { x: 50, y: 50 }, label: 'Inspect EVM Seal', emoji: '🗳️', isActive: true, zoneId: 'polling', interactAction: { completeObjective: { questId: 'gq2_booth', objectiveId: 'o1' }, updateMeter: { trust: 10 } } },
    { id: 'exit_res', pos: { x: 1050, y: 400 }, size: { x: 60, y: 60 }, label: 'Results Hall →', emoji: '📊', isActive: true, zoneId: 'polling', interactAction: { unlockZone: 'results' } }
  ]
};

// ──────────────────────────────────────────────
// ZONE 5: RESULTS HALL
// ──────────────────────────────────────────────
export const resultsZone: Zone = {
  id: 'results',
  name: 'Democratic Theater',
  description: 'The final tally of the city voice.',
  bgColor: '#0A0818', accentColor: '#C8902A', emoji: '📊',
  mapPosition: { x: 1000, y: 350 },
  unlocked: false,
  buildings: [
    { rect: { x: 80, y: 80, w: 1000, d: 300, h: 200 }, color: '#120E22', roofColor: '#0A0818', label: 'Grand Counting Chamber', emoji: '🏛️', style: 'office' }
  ],
  props: [
    { id: 'screen_r1', type: 'counter', pos: { x: 580, y: 200 }, size: { x: 400, y: 40 } },
    { id: 'lamp_r1', type: 'lamp', pos: { x: 300, y: 340 }, size: { x: 10, y: 10 } },
    { id: 'lamp_r2', type: 'lamp', pos: { x: 860, y: 340 }, size: { x: 10, y: 10 } },
  ],
  npcs: [
    {
      id: 'announcer', pos: { x: 580, y: 250 }, name: 'State Commissioner', role: 'State Commissioner',
      emoji: '🎙️', color: '#C8902A', dir: 'down', currentNode: 'start',
      dialogue: [
        {
          id: 'start', speaker: 'State Commissioner',
          text: "The results are in! The democratic process has been completed with transparency. Every vote counted — including yours.",
          choices: [
            { text: "This was incredible!", next: 'end', effect: { updateMeter: { trust: 20, ethics: 10 }, addReputation: 50 } }
          ]
        },
        { id: 'end', speaker: 'State Commissioner', text: "Congratulations on completing your civic journey. You are now a true guardian of democracy!", choices: [{ text: "Finish Journey ✓", next: '__end', effect: { triggerEvent: 'trigger_ending', addItem: 'champion_medal' } }] }
      ]
    }
  ],
  objects: [
    { id: 'results_board', pos: { x: 580, y: 220 }, size: { x: 80, y: 60 }, label: 'View Election Results', emoji: '📊', isActive: true, zoneId: 'results', interactAction: { triggerEvent: 'show_results', updateMeter: { awareness: 15 } } },
    { id: 'exit_home', pos: { x: 100, y: 420 }, size: { x: 60, y: 60 }, label: '← Return Home', emoji: '🏠', isActive: true, zoneId: 'results', interactAction: { unlockZone: 'neighborhood' } }
  ]
};

export const ZONES: Zone[] = [neighborhoodZone, registrationZone, campaignZone, pollingZone, resultsZone];
