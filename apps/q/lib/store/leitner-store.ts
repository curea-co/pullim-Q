import { create } from 'zustand';
import {
  leitnerCards as seedLeitnerCards,
  leitnerMeta,
  type LeitnerBox,
  type LeitnerCard,
} from '@/lib/mock/conqueror';

type LeitnerState = {
  cards: LeitnerCard[];
};

type LeitnerActions = {
  applyResult: (
    sku: string,
    correct: boolean,
  ) => { prevBox: LeitnerBox; newBox: LeitnerBox; isMaster: boolean } | null;
  reset: () => void;
};

function nextBox(box: LeitnerBox, correct: boolean): LeitnerBox {
  if (!correct) return 1;
  if (box >= 5) return 5;
  return (box + 1) as LeitnerBox;
}

function seedCards(): LeitnerCard[] {
  return seedLeitnerCards.map((c) => ({ ...c }));
}

export const useLeitnerStore = create<LeitnerState & LeitnerActions>()((set, get) => ({
  cards: seedCards(),

  applyResult: (sku, correct) => {
    const cards = get().cards;
    const idx = cards.findIndex((c) => c.problemSku === sku);
    if (idx < 0) return null;

    const prev = cards[idx]!;
    const newBox = nextBox(prev.box, correct);
    const updated: LeitnerCard = {
      ...prev,
      box: newBox,
      streak: correct ? prev.streak + 1 : 0,
      attempts: prev.attempts + 1,
      lastResult: correct ? 'correct' : 'wrong',
      nextReviewInHours: leitnerMeta[newBox].days * 24,
    };
    const next = cards.slice();
    next[idx] = updated;
    set({ cards: next });

    return {
      prevBox: prev.box,
      newBox,
      isMaster: correct && newBox === 5,
    };
  },

  reset: () => set({ cards: seedCards() }),
}));
