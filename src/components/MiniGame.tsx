import React, { useState, useEffect } from 'react';
import type { MiniGameId } from '../game/types';

interface Props {
  gameId: MiniGameId;
  onComplete: (success: boolean, score: number) => void;
}

// ─────────────────────────────────────────────
// 1. DOCUMENT HUNT — find docs in the room
// ─────────────────────────────────────────────
function DocumentHunt({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const items = [
    { id: 'aadhaar_card', label: 'Aadhaar Card', emoji: '🪪', x: 15, y: 20, found: false },
    { id: 'address_proof', label: 'Address Proof', emoji: '📄', x: 60, y: 55, found: false },
    { id: 'phone', label: 'Smartphone', emoji: '📱', x: 35, y: 70, found: false },
    { id: 'newspaper', label: 'Newspaper', emoji: '📰', x: 75, y: 25, found: false },
    { id: 'red_herring1', label: 'Old Receipt', emoji: '🧾', x: 50, y: 40, found: false },
    { id: 'red_herring2', label: 'Pen', emoji: '🖊️', x: 25, y: 50, found: false },
  ];

  const [found, setFound] = useState<string[]>([]);
  const [time, setTime] = useState(45);
  const [shake, setShake] = useState<string | null>(null);
  const required = ['aadhaar_card', 'address_proof'];

  useEffect(() => {
    if (time <= 0) { onComplete(false, 0); return; }
    const t = setInterval(() => setTime((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  useEffect(() => {
    if (required.every((r) => found.includes(r))) {
      setTimeout(() => onComplete(true, 150 + time * 3), 600);
    }
  }, [found]);

  const handleClick = (itemId: string) => {
    if (found.includes(itemId)) return;
    setFound((p) => [...p, itemId]);
    if (!required.includes(itemId) && itemId.startsWith('red')) {
      setShake(itemId);
      setTimeout(() => setShake(null), 500);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-yellow-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          🏠 DOCUMENT HUNT
        </h3>
        <p className="text-sm text-slate-300">Find your Aadhaar Card and Address Proof before time runs out!</p>
        <div className="flex justify-center items-center gap-4 mt-2">
          <div className="text-red-400 font-bold" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
            ⏱ {time}s
          </div>
          <div className="text-green-400 text-sm">
            Found: {found.filter((f) => required.includes(f)).length}/{required.length} required
          </div>
        </div>
      </div>

      {/* Room */}
      <div
        className="relative rounded-xl overflow-hidden border-2 border-slate-600"
        style={{ height: '280px', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}
      >
        {/* Room furniture hints */}
        <div className="absolute top-4 left-4 w-20 h-16 rounded bg-slate-700 opacity-30 flex items-center justify-center text-3xl">🛏️</div>
        <div className="absolute bottom-4 right-4 w-24 h-10 rounded bg-slate-700 opacity-30 flex items-center justify-center text-2xl">🛋️</div>

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-200 ${
              found.includes(item.id) ? 'opacity-30 scale-75' : 'hover:scale-110 cursor-pointer'
            } ${shake === item.id ? 'animate-bounce' : ''}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            <span className="text-3xl drop-shadow-lg">{item.emoji}</span>
            {!found.includes(item.id) && (
              <span
                className="text-xs text-white bg-black/60 px-1.5 rounded"
                style={{ fontSize: '9px' }}
              >
                {item.label}
              </span>
            )}
            {required.includes(item.id) && !found.includes(item.id) && (
              <span className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            )}
            {found.includes(item.id) && required.includes(item.id) && (
              <span className="text-green-400 text-lg">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Required items checklist */}
      <div className="flex gap-4 mt-3 justify-center">
        {required.map((r) => (
          <div
            key={r}
            className="flex items-center gap-1 text-sm"
            style={{ color: found.includes(r) ? '#4ade80' : '#94a3b8' }}
          >
            <span>{found.includes(r) ? '✅' : '○'}</span>
            <span>{r === 'aadhaar_card' ? 'Aadhaar Card' : 'Address Proof'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. FORM SORTING — drag forms to bins
// ─────────────────────────────────────────────
type FormType = 'form6' | 'form8' | 'form7' | 'form6b';
const FORM_INFO: Record<FormType, { label: string; color: string; emoji: string; desc: string }> = {
  form6: { label: 'Form 6', color: '#4ade80', emoji: '📗', desc: 'New Registration' },
  form8: { label: 'Form 8', color: '#38bdf8', emoji: '📘', desc: 'Corrections' },
  form7: { label: 'Form 7', color: '#f87171', emoji: '📕', desc: 'Deletion Request' },
  form6b: { label: 'Form 6B', color: '#fbbf24', emoji: '📒', desc: 'NRI Registration' },
};

function FormSorting({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const formTypes: FormType[] = ['form6', 'form8', 'form7', 'form6b'];
  const generateForm = () => formTypes[Math.floor(Math.random() * formTypes.length)];

  const [forms, setForms] = useState<Array<{ id: number; type: FormType; placed: boolean }>>(
    Array.from({ length: 10 }, (_, i) => ({ id: i, type: generateForm(), placed: false }))
  );
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (time <= 0) { onComplete(score >= 6, score * 20); return; }
    const t = setInterval(() => setTime((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  const unplaced = forms.filter((f) => !f.placed);
  const current = unplaced[0];

  const handleSort = (binType: FormType) => {
    if (!current) return;
    const correct = current.type === binType;
    if (correct) {
      setScore((p) => p + 1);
      setFeedback({ text: '✅ Correct! ' + FORM_INFO[current.type].desc, ok: true });
    } else {
      setErrors((p) => p + 1);
      setFeedback({ text: `❌ Wrong bin! That was ${FORM_INFO[current.type].label}`, ok: false });
    }
    setForms((p) => p.map((f) => (f.id === current.id ? { ...f, placed: true } : f)));
    setTimeout(() => setFeedback(null), 1200);

    if (unplaced.length === 1) {
      setTimeout(() => onComplete(score + (correct ? 1 : 0) >= 7, (score + (correct ? 1 : 0)) * 20), 800);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full -z-10" />
        <h3 className="text-2xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          FORM SORTING <span className="text-indigo-400">CHALLENGE</span>
        </h3>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold opacity-80">Categorize incoming civic documents</p>
        
        <div className="flex justify-center items-center gap-6 mt-6">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-red-400 font-black" style={{ fontFamily: 'Share Tech Mono, monospace' }}>⏱ {time}s</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-green-400 font-black">✓ {score}</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-red-400 font-black">✗ {errors}</span>
          </div>
          <div className="text-indigo-400 text-xs font-black bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            {unplaced.length} REMAINING
          </div>
        </div>
      </div>

      {/* Current form to sort */}
      <div className="flex justify-center mb-10 perspective-1000">
        {current ? (
          <div
            className="w-44 h-56 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 shadow-2xl transition-all duration-500 animate-float"
            style={{
              background: `linear-gradient(135deg, ${FORM_INFO[current.type].color}33, rgba(15, 23, 42, 0.9))`,
              borderColor: FORM_INFO[current.type].color,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${FORM_INFO[current.type].color}22`,
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
              <span className="text-5xl drop-shadow-lg">{FORM_INFO[current.type].emoji}</span>
            </div>
            <div className="text-center">
              <span className="block text-sm text-white font-black tracking-tight mb-1">UNIDENTIFIED FORM</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">Analyze & Categorize</span>
            </div>
          </div>
        ) : (
          <div className="text-green-400 text-2xl font-black tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>ALL FORMS PROCESSED! 🎉</div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center text-sm font-bold mb-3 py-1.5 rounded-lg ${
            feedback.ok ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Bins */}
      <div className="grid grid-cols-2 gap-4">
        {formTypes.map((ft) => (
          <button
            key={ft}
            onClick={() => handleSort(ft)}
            disabled={!current}
            className="p-5 rounded-2xl border-2 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-30 group relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              borderColor: FORM_INFO[ft].color + '44',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: FORM_INFO[ft].color }} />
            <div className="flex items-center gap-4">
              <div className="text-3xl p-3 rounded-xl bg-black/20">{FORM_INFO[ft].emoji}</div>
              <div className="text-left">
                <div className="text-xs font-black tracking-widest uppercase opacity-60 mb-1" style={{ color: FORM_INFO[ft].color }}>
                  {FORM_INFO[ft].label}
                </div>
                <div className="text-sm font-bold text-white leading-tight">{FORM_INFO[ft].desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. MISINFORMATION STOP
// ─────────────────────────────────────────────
interface NewsItem {
  id: number;
  text: string;
  isFake: boolean;
  flagged: boolean;
}

const NEWS_ITEMS: Array<{ text: string; isFake: boolean }> = [
  { text: '🔴 EVMs are connected to WiFi and can be hacked remotely!', isFake: true },
  { text: '✅ Voter registration deadline for this election is Jan 1st.', isFake: false },
  { text: '🔴 Non-voters will lose their ration cards — share now!', isFake: true },
  { text: '✅ You can report MCC violations via the cVIGIL app.', isFake: false },
  { text: '🔴 Forward this message to vote without going to a booth!', isFake: true },
  { text: '✅ Election Commission has deployed 1 million+ polling staff.', isFake: false },
  { text: '🔴 Party X has already won, results are pre-fixed!', isFake: true },
  { text: '✅ NOTA option is available on every EVM machine.', isFake: false },
  { text: '🔴 You can vote multiple times in different districts!', isFake: true },
  { text: '✅ Voter Helpline number is 1950 for all election queries.', isFake: false },
];

function MisinformationStop({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const [items, setItems] = useState<NewsItem[]>(
    NEWS_ITEMS.sort(() => Math.random() - 0.5)
      .slice(0, 8)
      .map((n, i) => ({ ...n, id: i, flagged: false }))
  );
  const [time, setTime] = useState(50);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (time <= 0) { onComplete(score >= 4, score * 30); return; }
    const t = setInterval(() => setTime((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  const fakeCount = items.filter((i) => i.isFake && !i.flagged).length;

  useEffect(() => {
    if (fakeCount === 0 && items.some((i) => i.isFake)) {
      onComplete(true, score * 30 + time * 4);
    }
  }, [fakeCount]);

  const handleFlag = (id: number, isFake: boolean) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, flagged: true } : i)));
    if (isFake) setScore((p) => p + 1);
    else setScore((p) => Math.max(0, p - 1));
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-red-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          🚫 STOP MISINFORMATION
        </h3>
        <p className="text-sm text-slate-300">Flag the FAKE news items. Don't flag the real ones!</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="text-red-400 font-bold" style={{ fontFamily: 'Share Tech Mono, monospace' }}>⏱ {time}s</div>
          <div className="text-green-400">✓ {score} flagged correctly</div>
          <div className="text-orange-400">{fakeCount} fakes remaining</div>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              item.flagged
                ? item.isFake
                  ? 'border-red-500/30 bg-red-900/20 opacity-50'
                  : 'border-green-500/30 bg-green-900/20 opacity-50'
                : 'border-slate-700 bg-slate-900/80 hover:border-slate-500'
            }`}
          >
            <div className="flex-1 text-sm text-slate-300">{item.text}</div>
            {!item.flagged && (
              <button
                onClick={() => handleFlag(item.id, item.isFake)}
                className="shrink-0 px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
              >
                🚩 Fake
              </button>
            )}
            {item.flagged && (
              <span className={item.isFake ? 'text-red-400 text-sm' : 'text-green-400 text-sm'}>
                {item.isFake ? '🚩 Flagged!' : '✅ Real'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 4. EVM VOTING — step-by-step simulation
// ─────────────────────────────────────────────
const EVM_STEPS = [
  {
    id: 'queue',
    instruction: 'Join the queue at the polling booth entrance',
    visual: '🧑‍🤝‍🧑🧑‍🤝‍🧑🧑‍🤝‍🧑👤',
    action: 'Take your place in line',
    info: 'Polling hours are 7AM to 6PM. Queues are formed orderly. Senior citizens & PWD voters get priority.',
  },
  {
    id: 'id_check',
    instruction: 'Show your Voter ID to the Presiding Officer',
    visual: '🧑‍⚖️ ← 🪪',
    action: 'Present your EPIC card',
    info: '12 alternative IDs accepted: Aadhaar, PAN, Passport, Driving License, Service ID, etc.',
  },
  {
    id: 'roll_check',
    instruction: 'Officer marks your name on the electoral roll',
    visual: '📋 ✓',
    action: 'Wait for confirmation',
    info: 'The officer signs Form 17A — your attendance slip. This prevents double voting.',
  },
  {
    id: 'ink',
    instruction: 'Get indelible ink mark on left index finger',
    visual: '🖊️ → ☝️',
    action: 'Extend your left index finger',
    info: 'Indelible ink lasts 2-3 weeks. It prevents voting twice at different booths.',
  },
  {
    id: 'ballot',
    instruction: 'Press the button next to your chosen candidate on the EVM',
    visual: '🗳️ [  ] [  ] [  ] [NOTA]',
    action: 'Press a candidate button',
    info: 'NOTA is the last option. Your vote is completely secret — no one can see your choice.',
  },
  {
    id: 'vvpat',
    instruction: 'See the VVPAT paper slip appear for 7 seconds',
    visual: '🖨️ → 📄 → 🗑️',
    action: 'Verify your vote on the slip',
    info: 'VVPAT (Voter Verified Paper Audit Trail) confirms your vote. The slip drops into a sealed box automatically.',
  },
];

function EVMVoting({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const [step, setStep] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [vvpatVisible, setVvpatVisible] = useState(false);
  const candidates = ['Candidate A (🌿 Party)', 'Candidate B (⚡ Party)', 'Candidate C (🌊 Party)', 'NOTA'];

  const current = EVM_STEPS[step];

  const handleAction = () => {
    if (step === 4 && selectedCandidate === null) return;
    if (step === 4) {
      setVvpatVisible(true);
      setTimeout(() => {
        setVvpatVisible(false);
        setStep((p) => p + 1);
      }, 2000);
      return;
    }
    if (step >= EVM_STEPS.length - 1) {
      onComplete(true, 200);
      return;
    }
    setStep((p) => p + 1);
    setShowInfo(false);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-cyan-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          🗳️ CASTING YOUR VOTE
        </h3>
        <p className="text-sm text-slate-300">Follow each step of the voting process</p>
        <div className="flex justify-center gap-1 mt-2">
          {EVM_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-8 rounded-full transition-all"
              style={{ background: i < step ? '#4ade80' : i === step ? '#38bdf8' : '#334155' }}
            />
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border p-5 mb-4"
        style={{ background: 'linear-gradient(135deg, #0f2340, #0a1628)', borderColor: '#38bdf888' }}
      >
        <div className="text-center text-4xl mb-3">{current.visual}</div>
        <h4 className="text-base font-bold text-white mb-2 text-center">{current.instruction}</h4>

        {step === 4 && (
          <div className="mt-3 space-y-2">
            {candidates.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCandidate(i)}
                className="w-full p-2 rounded-lg border transition-all text-sm text-left"
                style={{
                  background: selectedCandidate === i ? '#1e3a5f' : '#0d1f3c',
                  borderColor: selectedCandidate === i ? '#38bdf8' : '#1e293b',
                  color: selectedCandidate === i ? '#38bdf8' : '#94a3b8',
                }}
              >
                {i === 3 ? '⊘ ' : `${i + 1}. `}{c}
              </button>
            ))}
          </div>
        )}

        {vvpatVisible && (
          <div
            className="mt-3 p-3 rounded-lg border border-green-500 bg-green-900/30 text-center animate-pulse"
          >
            <div className="text-lg mb-1">🧾 VVPAT Confirmation</div>
            <div className="text-sm text-green-400">
              Your vote for "{candidates[selectedCandidate!]}" has been recorded
            </div>
            <div className="text-xs text-slate-400 mt-1">Slip will auto-drop in 7 seconds...</div>
          </div>
        )}
      </div>

      {showInfo && (
        <div
          className="rounded-xl border p-3 mb-3 text-sm text-slate-300"
          style={{ background: '#0f172a', borderColor: '#6366f144' }}
        >
          <span className="text-purple-400 font-bold">ℹ️ Did you know? </span>
          {current.info}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setShowInfo((p) => !p)}
          className="flex-1 py-2.5 rounded-xl border border-purple-500/50 text-purple-400 text-sm font-bold transition-all hover:bg-purple-900/30"
        >
          {showInfo ? 'Hide' : 'Learn More'} ℹ️
        </button>
        <button
          onClick={handleAction}
          disabled={step === 4 && selectedCandidate === null}
          className="flex-2 py-2.5 px-6 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: '#0ea5e9', color: '#000' }}
        >
          {step >= EVM_STEPS.length - 1 ? '🎉 Voting Complete!' : current.action + ' →'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. BOOTH NAVIGATION — guide lost voters
// ─────────────────────────────────────────────
interface Voter {
  id: number;
  name: string;
  epicPart: string;
  correctBooth: string;
  emoji: string;
  solved: boolean;
}

const BOOTHS = ['Booth 12 - North Hall', 'Booth 23 - City School', 'Booth 38 - Community Center', 'Booth 42 - Civic Hall', 'Booth 67 - Market Square'];

function BoothNavigation({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const [voters] = useState<Voter[]>([
    { id: 1, name: 'Mrs. Lakshmi', epicPart: 'GJ/03/195/221', correctBooth: 'Booth 42 - Civic Hall', emoji: '👩‍🦳', solved: false },
    { id: 2, name: 'Mr. Arjun', epicPart: 'GJ/03/195/047', correctBooth: 'Booth 23 - City School', emoji: '🧔', solved: false },
    { id: 3, name: 'Ms. Divya', epicPart: 'GJ/03/012/183', correctBooth: 'Booth 12 - North Hall', emoji: '👩', solved: false },
  ]);

  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(40);
  const [_solved, setSolved] = useState<number[]>([]);

  useEffect(() => {
    if (time <= 0) { onComplete(score >= 2, score * 80); return; }
    const t = setInterval(() => setTime((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  const current = voters[currentVoterIdx];

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === current.correctBooth;
    if (correct) {
      setScore((p) => p + 1);
      setFeedback('✅ Correct booth! ' + current.name + ' can vote!');
      setSolved((p) => [...p, current.id]);
    } else {
      setFeedback('❌ Wrong booth! Check the EPIC number area code.');
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (currentVoterIdx < voters.length - 1) {
        setCurrentVoterIdx((p) => p + 1);
      } else {
        onComplete(score + (correct ? 1 : 0) >= 2, (score + (correct ? 1 : 0)) * 80);
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-pink-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          🗺️ BOOTH NAVIGATOR
        </h3>
        <p className="text-sm text-slate-300">Help lost voters find their correct polling booth!</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="text-red-400 font-bold" style={{ fontFamily: 'Share Tech Mono, monospace' }}>⏱ {time}s</div>
          <div className="text-green-400">✓ {score}/{voters.length} helped</div>
        </div>
      </div>

      {/* Current voter */}
      <div
        className="rounded-xl border p-4 mb-4"
        style={{ background: '#0f172a', borderColor: '#ec489988' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{current.emoji}</span>
          <div>
            <div className="text-white font-bold">{current.name}</div>
            <div className="text-slate-400 text-sm">
              EPIC: <span className="text-cyan-400 font-mono">{current.epicPart}</span>
            </div>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          "I don't know which booth to go to! Please help me find the right one!"
        </div>
      </div>

      {feedback && (
        <div className={`text-center text-sm font-bold mb-3 py-2 rounded-lg ${feedback.startsWith('✅') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          {feedback}
        </div>
      )}

      {/* Booth selection */}
      <div className="space-y-2 mb-4">
        {BOOTHS.map((booth) => (
          <button
            key={booth}
            onClick={() => setSelected(booth)}
            className="w-full p-2.5 rounded-xl border text-sm text-left transition-all"
            style={{
              background: selected === booth ? '#1e3a5f' : '#0d1f3c',
              borderColor: selected === booth ? '#ec4899' : '#1e293b',
              color: selected === booth ? '#f9a8d4' : '#94a3b8',
            }}
          >
            🏫 {booth}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
        style={{ background: '#ec4899', color: '#fff' }}
      >
        Send Voter to This Booth →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// 6. VOTER HELP — fix missing info
// ─────────────────────────────────────────────
function VoterHelp({ onComplete }: { onComplete: (s: boolean, sc: number) => void }) {
  const problems = [
    {
      citizen: 'Rahul (Name misspelled in roll)',
      emoji: '👦',
      problem: 'His name shows as "Rahool" instead of "Rahul". What form should he submit?',
      options: ['Form 6 (New Registration)', 'Form 8 (Corrections)', 'Form 7 (Deletion)', 'Form 6B (NRI)'],
      correct: 1,
    },
    {
      citizen: 'Sunita (Recently moved)',
      emoji: '👩',
      problem: "Sunita moved to a new constituency 3 months ago. How can she transfer her vote?",
      options: ['Submit Form 6', 'Submit Form 8A (Transfer)', 'Visit any booth', 'She cannot vote'],
      correct: 1,
    },
    {
      citizen: 'Elderly Ramamurthy (Lost Voter ID)',
      emoji: '👴',
      problem: 'Mr. Ramamurthy lost his Voter ID card. Can he still vote?',
      options: ['No, he cannot vote', 'Yes, with 11 alternative IDs (Aadhaar, PAN, etc.)', 'Only if he has a passport', 'Must reregister first'],
      correct: 1,
    },
    {
      citizen: 'First-time voter Priya',
      emoji: '👧',
      problem: 'Priya is 17 years and 8 months. Can she register now?',
      options: ['Yes, right away', 'No, must wait until 18', 'Only if parents consent', 'Must apply in advance'],
      correct: 1,
    },
  ];

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(55);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (time <= 0) { onComplete(score >= 3, score * 60); return; }
    const t = setInterval(() => setTime((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [time]);

  const current = problems[step];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === current.correct;
    if (correct) {
      setScore((p) => p + 1);
      setFeedback('✅ Correct! You helped this citizen successfully!');
    } else {
      setFeedback(`❌ Not quite. The correct answer was: "${current.options[current.correct]}"`);
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (step >= problems.length - 1) {
        onComplete(score + (correct ? 1 : 0) >= 3, (score + (correct ? 1 : 0)) * 60);
      } else {
        setStep((p) => p + 1);
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-teal-400 mb-1" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          🆘 VOTER HELP DESK
        </h3>
        <p className="text-sm text-slate-300">Citizens are confused — use your knowledge to help them!</p>
        <div className="flex justify-center gap-4 mt-2">
          <div className="text-red-400 font-bold" style={{ fontFamily: 'Share Tech Mono, monospace' }}>⏱ {time}s</div>
          <div className="text-green-400">✓ {score}/{problems.length}</div>
          <div className="text-slate-400">Case {step + 1}/{problems.length}</div>
        </div>
      </div>

      <div className="rounded-xl border p-4 mb-4" style={{ background: '#0f172a', borderColor: '#14b8a688' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{current.emoji}</span>
          <div className="font-bold text-white">{current.citizen}</div>
        </div>
        <div className="text-sm text-slate-300">{current.problem}</div>
      </div>

      {feedback && (
        <div className={`text-center text-sm font-bold mb-3 py-2 rounded-lg ${feedback.startsWith('✅') ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          {feedback}
        </div>
      )}

      <div className="space-y-2">
        {current.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={selected !== null}
            className="w-full p-3 rounded-xl border text-sm text-left transition-all disabled:cursor-not-allowed"
            style={{
              background:
                selected === i
                  ? i === current.correct
                    ? '#052e16'
                    : '#450a0a'
                  : '#0d1f3c',
              borderColor:
                selected === i
                  ? i === current.correct
                    ? '#4ade80'
                    : '#f87171'
                  : selected !== null && i === current.correct
                  ? '#4ade80'
                  : '#1e293b',
              color:
                selected === i
                  ? i === current.correct
                    ? '#4ade80'
                    : '#f87171'
                  : '#94a3b8',
            }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MINI-GAME SHELL
// ─────────────────────────────────────────────
export const MiniGame: React.FC<Props> = ({ gameId, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [result, setResult] = useState<{ success: boolean; score: number } | null>(null);

  const introData: Record<MiniGameId, { title: string; desc: string; emoji: string; color: string }> = {
    document_hunt: { title: 'Document Hunt', desc: 'Search your home for voter registration documents before time runs out!', emoji: '🔍', color: '#fbbf24' },
    form_sorting: { title: 'Form Sorting Challenge', desc: 'Help the ERO office sort voter forms into correct categories!', emoji: '📋', color: '#818cf8' },
    misinformation_stop: { title: 'Stop Misinformation!', desc: 'Identify and flag fake election news spreading through the market!', emoji: '🚫', color: '#f87171' },
    evm_voting: { title: 'Cast Your Vote', desc: 'Walk through the complete EVM voting process step by step!', emoji: '🗳️', color: '#38bdf8' },
    booth_navigation: { title: 'Booth Navigator', desc: 'Help lost voters find their correct polling booths!', emoji: '🗺️', color: '#ec4899' },
    voter_help: { title: 'Voter Help Desk', desc: 'Solve citizen problems using your election knowledge!', emoji: '🆘', color: '#14b8a6' },
  };

  const intro = introData[gameId];

  const handleMiniComplete = (success: boolean, score: number) => {
    setResult({ success, score });
    setPhase('result');
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-50 bg-black/90 backdrop-blur-xl"
    >
      <div
        className="w-full max-w-xl mx-4 rounded-3xl overflow-hidden panel relative border-2 border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8)]"
        style={{ background: 'rgba(10, 15, 25, 0.95)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5" style={{ background: `${intro.color}11` }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{intro.emoji}</span>
            <div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>{intro.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: intro.color }} />
                <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase opacity-70">Active Operation</span>
              </div>
            </div>
          </div>
          {phase === 'playing' && (
            <button 
              onClick={() => onComplete(false, 0)}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
            >
              Abort Mission
            </button>
          )}
        </div>

        <div className="p-10 flex flex-col items-center">
          {phase === 'intro' && (
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center bg-white/5 border-2 border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <span className="text-5xl group-hover:scale-110 transition-transform">{intro.emoji}</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>{intro.title.toUpperCase()}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-10 opacity-80">{intro.desc}</p>
              
              <button
                onClick={() => setPhase('playing')}
                className="group relative px-12 py-4 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-500/20"
              >
                <div className="absolute inset-0 transition-opacity opacity-100 group-hover:opacity-90" style={{ background: intro.color }} />
                <span className="relative text-black font-black text-sm tracking-[0.2em]">INITIALIZE MISSION</span>
              </button>
            </div>
          )}

          {phase === 'playing' && (
            <div className="w-full animate-scale-up">
              {gameId === 'document_hunt' && <DocumentHunt onComplete={handleMiniComplete} />}
              {gameId === 'form_sorting' && <FormSorting onComplete={handleMiniComplete} />}
              {gameId === 'misinformation_stop' && <MisinformationStop onComplete={handleMiniComplete} />}
              {gameId === 'evm_voting' && <EVMVoting onComplete={handleMiniComplete} />}
              {gameId === 'booth_navigation' && <BoothNavigation onComplete={handleMiniComplete} />}
              {gameId === 'voter_help' && <VoterHelp onComplete={handleMiniComplete} />}
            </div>
          )}

          {phase === 'result' && result && (
            <div className="text-center animate-bounce-in">
              <div 
                className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl shadow-2xl border-4"
                style={{ 
                  background: result.success ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                  borderColor: result.success ? '#4ade80' : '#f87171',
                  boxShadow: `0 0 40px ${result.success ? '#4ade8033' : '#f8717133'}`
                }}
              >
                {result.success ? '✓' : '✕'}
              </div>
              <h3 className="text-3xl font-black text-white mb-3 tracking-tighter" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {result.success ? 'MISSION SUCCESS' : 'MISSION FAILED'}
              </h3>
              <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-[10px] opacity-70">
                {result.success ? 'Democracy integrity strengthened' : 'Mission parameters not achieved'}
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 inline-block min-w-[240px]">
                <div className="text-[10px] text-slate-500 font-black tracking-[0.3em] mb-2 uppercase">REWARD ISSUED</div>
                <div className="text-5xl font-black text-white" style={{ fontFamily: 'Share Tech Mono, monospace' }}>+{result.score}</div>
                <div className="text-[10px] text-indigo-400 font-black mt-2 tracking-widest">RANK XP POINTS</div>
              </div>

              <br />
              <button
                onClick={() => onComplete(result.success, result.score)}
                className="px-12 py-4 rounded-2xl bg-white text-black font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
              >
                RETURN TO FIELD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
