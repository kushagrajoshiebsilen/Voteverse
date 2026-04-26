import type { GameState } from './types';

// ──────────────────────────────────────────────
// Gemini API integration (function-calling style)
// Replace GEMINI_API_KEY with your actual key to
// enable live AI dialogue generation.
// Falls back to rich pre-written responses when
// the key is not set.
// ──────────────────────────────────────────────

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Tool definitions for Gemini function calling
const GAME_TOOLS = [
  {
    name: 'getPlayerState',
    description: 'Get current player stats, inventory, and zone',
    parameters: {
      type: 'object',
      properties: {
        field: { type: 'string', enum: ['inventory', 'reputation', 'zone', 'quests', 'democracy'] },
      },
      required: ['field'],
    },
  },
  {
    name: 'updateQuest',
    description: 'Update quest objective status',
    parameters: {
      type: 'object',
      properties: {
        questId: { type: 'string' },
        objectiveId: { type: 'string' },
        status: { type: 'string', enum: ['complete', 'failed'] },
      },
      required: ['questId', 'objectiveId', 'status'],
    },
  },
  {
    name: 'generateNpcDialogue',
    description: 'Generate contextual NPC dialogue based on player state',
    parameters: {
      type: 'object',
      properties: {
        npcRole: { type: 'string' },
        topic: { type: 'string' },
        playerHasItem: { type: 'boolean' },
        playerReputation: { type: 'number' },
      },
      required: ['npcRole', 'topic'],
    },
  },
  {
    name: 'evaluateChoice',
    description: 'Evaluate player choice and return consequences',
    parameters: {
      type: 'object',
      properties: {
        choiceText: { type: 'string' },
        context: { type: 'string' },
        ethicsImpact: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
      },
      required: ['choiceText', 'context'],
    },
  },
  {
    name: 'spawnScenario',
    description: 'Create a new scenario event in the world',
    parameters: {
      type: 'object',
      properties: {
        scenarioType: {
          type: 'string',
          enum: ['voter_crisis', 'campaign_violation', 'booth_problem', 'counting_dispute'],
        },
        urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
      },
      required: ['scenarioType', 'urgency'],
    },
  },
  {
    name: 'awardBadge',
    description: 'Award a civic badge to the player',
    parameters: {
      type: 'object',
      properties: {
        badgeId: { type: 'string' },
        reason: { type: 'string' },
      },
      required: ['badgeId', 'reason'],
    },
  },
  {
    name: 'updateDemocracyMeter',
    description: 'Update the city democracy meter values',
    parameters: {
      type: 'object',
      properties: {
        awareness: { type: 'number', minimum: -20, maximum: 20 },
        trust: { type: 'number', minimum: -20, maximum: 20 },
        ethics: { type: 'number', minimum: -20, maximum: 20 },
        turnout: { type: 'number', minimum: -20, maximum: 20 },
      },
    },
  },
];

// ──────────────────────────────────────────────
// Offline NPC dialogue library (fallback)
// ──────────────────────────────────────────────
const FALLBACK_RESPONSES: Record<string, string[]> = {
  registration_officer: [
    "Welcome, citizen! To register as a voter, you'll need Form 6, your Aadhaar card, and address proof. The Election Commission makes it easy — have you gathered your documents?",
    "Remember, you must be 18 years of age on the qualifying date — January 1st of the year — to register. Your vote is your voice!",
    "The NVSP portal also allows online registration at voters.eci.gov.in. But since you're here, I'll process your form personally!",
  ],
  campaign_worker: [
    "The Model Code of Conduct kicks in the moment the election schedule is announced. No political parties can use government resources for campaigning. Keep that in mind!",
    "Did you know candidates must submit an account of election expenses? Transparency is the backbone of democracy!",
    "Every voter has the right to know their candidate's background. Check the affidavits on the ECI website!",
  ],
  booth_officer: [
    "Please show your Voter ID or any of the 12 alternative identity documents. Your EPIC number helps us locate you on the electoral roll.",
    "The EVM is tamper-proof. Each unit has a unique identifier and is randomized across booths. The VVPAT gives you the paper confirmation of your vote.",
    "Voting is secret. No one, not even the booth officer, can see whom you voted for. Your choice is protected by law.",
  ],
  elderly_voter: [
    "In my village, people walked 10 kilometers to vote in 1952. Today we have booths within 2 kilometers of every home — what a change!",
    "I always say: not voting is a vote for whoever wins. Exercise your right, beta!",
  ],
  misinformation_spreader: [
    "Have you heard? They're changing the EVM results at night! It's all rigged!",
    "Someone told me you don't need to vote — just share this message and it counts!",
    "I heard non-voters will lose their ration card! Quick, spread the word!",
  ],
  journalist: [
    "I'm covering the election for City Daily. The Systematic Voters Education and Electoral Participation program — SVEEP — has increased first-time voter registration by 40% this year!",
    "The Election Commission deployed over 1 million polling staff across the country. That's democracy in action!",
  ],
  default: [
    "Voting is the cornerstone of democracy. Every citizen's voice matters!",
    "Have you checked if you're on the electoral roll? Use the Voter Helpline 1950!",
    "Democracy is not just about casting a vote — it's about making an informed choice.",
  ],
};

function getFallbackResponse(npcRole: string, topic?: string): string {
  const responses =
    FALLBACK_RESPONSES[npcRole] || FALLBACK_RESPONSES[topic || ''] || FALLBACK_RESPONSES['default'];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ──────────────────────────────────────────────
// Main Gemini call function
// ──────────────────────────────────────────────
export async function callGemini(
  prompt: string,
  gameState: GameState,
  apiKey?: string
): Promise<{ text: string; functionCall?: { name: string; args: Record<string, unknown> } }> {
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    // Simulate realistic AI thinking time
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    return { text: getFallbackResponse('default') };
  }

  const systemContext = `You are the Game Master of "VoteVerse: City of Democracy", an interactive civic education game set in India. 
The player is ${gameState.player.name} in the ${gameState.currentZone} zone.
Player stats: reputation=${gameState.reputation}, inventory=[${gameState.inventory.join(', ')}]
Democracy Meter: awareness=${gameState.democracyMeter.awareness}, trust=${gameState.democracyMeter.trust}, ethics=${gameState.democracyMeter.ethics}, turnout=${gameState.democracyMeter.turnout}
Respond as in-world characters using natural conversational dialogue. Keep responses under 80 words. Be educational about India's election process while staying in character.`;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemContext + '\n\n' + prompt }] },
        ],
        tools: [{ functionDeclarations: GAME_TOOLS }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.functionCall) {
      return { text: '', functionCall: part.functionCall };
    }
    if (part?.text) {
      return { text: part.text };
    }
    throw new Error('No valid response');
  } catch {
    await new Promise((r) => setTimeout(r, 300));
    return { text: getFallbackResponse('default') };
  }
}

// ──────────────────────────────────────────────
// Generate NPC dialogue (with context)
// ──────────────────────────────────────────────
export async function generateNpcDialogue(
  npcRole: string,
  topic: string,
  playerHasItems: string[],
  apiKey?: string
): Promise<string> {
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
    return getFallbackResponse(npcRole, topic);
  }

  const prompt = `As a ${npcRole} in an Indian election-themed game, say something helpful about "${topic}" to the player who has: ${playerHasItems.join(', ') || 'no items yet'}. Max 60 words, stay in character.`;

  try {
    const result = await callGemini(prompt, {} as GameState, apiKey);
    return result.text || getFallbackResponse(npcRole, topic);
  } catch {
    return getFallbackResponse(npcRole, topic);
  }
}

// ──────────────────────────────────────────────
// Evaluate player choice ethics
// ──────────────────────────────────────────────
export async function evaluatePlayerChoice(
  choice: string,
  context: string,
  apiKey?: string
): Promise<{ consequence: string; ethicsScore: number }> {
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    await new Promise((r) => setTimeout(r, 300));
    const goodChoices = ['report', 'help', 'vote', 'honest', 'correct', 'verify'];
    const isGood = goodChoices.some((w) => choice.toLowerCase().includes(w));
    return {
      consequence: isGood
        ? 'Your civic action strengthens democracy in the city!'
        : 'This choice could undermine public trust in the process.',
      ethicsScore: isGood ? 10 : -8,
    };
  }

  const prompt = `Player chose: "${choice}" in context: "${context}". Rate this civic decision and give one sentence consequence. Format: CONSEQUENCE: [text] | SCORE: [number -20 to 20]`;

  try {
    const result = await callGemini(prompt, {} as GameState, apiKey);
    const text = result.text;
    const consequenceMatch = text.match(/CONSEQUENCE:\s*(.+?)(?:\||\n|$)/i);
    const scoreMatch = text.match(/SCORE:\s*(-?\d+)/i);

    return {
      consequence: consequenceMatch?.[1]?.trim() || 'Your action affects the city.',
      ethicsScore: parseInt(scoreMatch?.[1] || '0'),
    };
  } catch {
    return { consequence: 'Your choice shapes the city.', ethicsScore: 5 };
  }
}
