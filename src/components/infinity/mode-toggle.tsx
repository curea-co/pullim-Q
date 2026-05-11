'use client';

import { Pencil, Timer, AlertTriangle } from 'lucide-react';
import { type SolveMode, solveModeMeta } from '@/lib/mock';
import { cn } from '@/lib/utils';

type Props = {
  mode: SolveMode;
  /** 시험 모드 → 연습 전환 시 직접 호출. 연습 → 시험은 confirm dialog 후 호출. */
  onChange: (m: SolveMode) => void;
  onRequestExam: () => void;
  examInProgress: boolean;
};

const modes: { id: SolveMode; Icon: typeof Pencil }[] = [
  { id: 'practice', Icon: Pencil },
  { id: 'exam',     Icon: Timer },
];

/**
 * 연습/시험 모드 토글 — 가시적으로 큰 토글, 선택 모드는 색상으로 강조.
 * 시험 진행 중에는 모드 전환 잠금.
 */
export function ModeToggle({ mode, onChange, onRequestExam, examInProgress }: Props) {
  return (
    <section className={cn(
      'rounded-2xl border-2 p-1.5 transition-colors',
      mode === 'exam'
        ? 'border-pullim-warn/40 bg-pullim-warn/5'
        : 'border-pullim-blue-200 bg-pullim-blue-50/40',
    )}>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {modes.map(({ id, Icon }) => {
          const meta = solveModeMeta[id];
          const active = mode === id;
          const accent = id === 'exam' ? 'warn' : 'blue';
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (active) return;
                if (id === 'exam') {
                  onRequestExam();
                } else {
                  onChange(id);
                }
              }}
              disabled={examInProgress && id === 'practice'}
              aria-pressed={active}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
                active && accent === 'blue' && 'bg-pullim-blue-600 text-white shadow-lg shadow-blue-500/30',
                active && accent === 'warn' && 'bg-pullim-warn text-white shadow-lg shadow-amber-500/30',
                !active && 'text-pullim-slate-700 hover:bg-white/60',
                examInProgress && id === 'practice' && 'cursor-not-allowed opacity-50',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl',
                  active ? 'bg-white/20' : 'bg-pullim-slate-100',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold whitespace-nowrap">{meta.label}</span>
                  {active && (
                    <span className="rounded-sm bg-white/25 px-1 py-0.5 font-mono text-[8px] font-bold tracking-wider whitespace-nowrap">
                      {meta.badge}
                    </span>
                  )}
                </div>
                <div className={cn(
                  'mt-0.5 text-[11px] leading-snug line-clamp-2',
                  active ? 'opacity-90' : 'text-pullim-slate-500',
                )}>
                  {meta.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {examInProgress && (
        <div className="bg-pullim-warn text-white mt-1.5 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase animate-pulse">
          <AlertTriangle className="h-3 w-3" aria-hidden />
          시험 진행 중 — 제출 전까지 모드 변경 불가
        </div>
      )}
    </section>
  );
}
