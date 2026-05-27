import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SubjectKey } from '@/lib/mock';
import type { SolveSourceMeta } from '@/components/infinity/solve-session-bar';

/**
 * /q/infinity/solve 이어풀기 + 이탈 가드 스토어.
 *
 * plan: proc/plan/2026-05-13_solve-resume-and-leave-guard.md
 * - 연습 모드 (free / weak) 만 저장. retry / exam 모드는 미저장.
 * - 24h 지난 snapshot 은 hasResumable 단계에서 stale 판정 → 자동 폐기.
 * - isSolvingInProgress 는 LeaveGuard / beforeunload 가드 분기에 사용.
 */

export type SolveSessionSnapshot = {
  sessionKey: string;
  subject: SubjectKey;
  unitTitle: string;
  source: SolveSourceMeta;
  currentIdx: number;
  answers: Record<number, number>;
  marked: number[]; // Set 직렬화 → number[]
  hintsByProblem: Record<string, number>;
  total: number;
  savedAt: number; // epoch ms
};

/** snapshot 보존 시간 (hour). 결합된 UI 카피("24시간 이상 전")도 본 상수로부터 derive. */
export const SNAPSHOT_TTL_HOURS = 24;
const SNAPSHOT_TTL_MS = SNAPSHOT_TTL_HOURS * 60 * 60 * 1000;

const STORAGE_KEY = 'pullim-q.solve-session.v1';

type SolveSessionState = {
  snapshot: SolveSessionSnapshot | null;
  inProgress: boolean;
};

type SolveSessionActions = {
  saveSnapshot: (snap: Omit<SolveSessionSnapshot, 'savedAt'>) => void;
  loadSnapshot: () => SolveSessionSnapshot | null;
  clearSnapshot: () => void;
  setInProgress: (flag: boolean) => void;
  hasResumable: () => boolean;
};

export const useSolveSessionStore = create<SolveSessionState & SolveSessionActions>()(
  persist(
    (set, get) => ({
      snapshot: null,
      inProgress: false,

      saveSnapshot(snap) {
        set({ snapshot: { ...snap, savedAt: Date.now() } });
      },

      loadSnapshot() {
        const cur = get().snapshot;
        if (!cur) return null;
        if (Date.now() - cur.savedAt > SNAPSHOT_TTL_MS) {
          set({ snapshot: null });
          return null;
        }
        return cur;
      },

      clearSnapshot() {
        set({ snapshot: null });
      },

      setInProgress(flag) {
        set({ inProgress: flag });
      },

      hasResumable() {
        const cur = get().snapshot;
        if (!cur) return false;
        return Date.now() - cur.savedAt <= SNAPSHOT_TTL_MS;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // inProgress 는 휘발성 — 새로고침 시 false 로 시작
      partialize: (s) => ({ snapshot: s.snapshot }),
      // SolveSessionSnapshot 스키마 변경 시 기존 localStorage 가 폐기되도록 version 박음.
      version: 1,
      migrate: (_persisted, version) => {
        if (version !== 1) return { snapshot: null };
        return _persisted as { snapshot: SolveSessionSnapshot | null };
      },
    },
  ),
);

// Cross-tab 1차 동기화 — 다른 탭에서 snapshot 변경 시 현재 탭이 stale 한 채로 머무는 걸 막음.
// 본격적인 충돌 해소 (per-tab UUID, last-writer warning) 는 후속 작업.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    void useSolveSessionStore.persist.rehydrate();
  });
}
