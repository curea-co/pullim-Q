import { create } from 'zustand';
import { memoryQueue as seedMemoryQueue, type MemoryItem } from '@/lib/mock/memory';

type MemoryState = {
  items: MemoryItem[];
};

type ApplyResult = {
  prevRetention: number;
  newRetention: number;
  prevNextHours: number;
  newNextHours: number;
  remembered: boolean;
  isMastered: boolean;
};

type MemoryActions = {
  applyResult: (id: string, remembered: boolean) => ApplyResult | null;
  reset: () => void;
};

/** SRS-style 간격 갱신:
 *  - 기억나요: retention +0.15(상한 1.0), 다음 복습은 이전 interval × 2 (최소 24h)
 *  - 안 나요: retention -0.25(하한 0.0), 다음 복습은 1h (즉시 재시도)
 *  마스터 임박 기준: retention ≥ 0.85 + 기억나요
 */
function applyTransition(item: MemoryItem, remembered: boolean) {
  const prevRetention = item.retention;
  const prevNextHours = item.nextReviewInHours;
  let newRetention: number;
  let newNextHours: number;
  if (remembered) {
    newRetention = Math.min(1, prevRetention + 0.15);
    // 음수(overdue) 카드는 base를 24h로 보고 2배 적용
    const base = Math.max(prevNextHours, 24);
    newNextHours = base * 2;
  } else {
    newRetention = Math.max(0, prevRetention - 0.25);
    newNextHours = 1;
  }
  return { prevRetention, newRetention, prevNextHours, newNextHours };
}

function seedItems(): MemoryItem[] {
  return seedMemoryQueue.map((m) => ({ ...m }));
}

export const useMemoryStore = create<MemoryState & MemoryActions>()((set, get) => ({
  items: seedItems(),

  applyResult: (id, remembered) => {
    const items = get().items;
    const idx = items.findIndex((m) => m.id === id);
    if (idx < 0) return null;

    const prev = items[idx]!;
    const t = applyTransition(prev, remembered);
    const updated: MemoryItem = {
      ...prev,
      retention: t.newRetention,
      nextReviewInHours: t.newNextHours,
    };
    const next = items.slice();
    next[idx] = updated;
    set({ items: next });

    return {
      ...t,
      remembered,
      isMastered: remembered && t.newRetention >= 0.85,
    };
  },

  reset: () => set({ items: seedItems() }),
}));
