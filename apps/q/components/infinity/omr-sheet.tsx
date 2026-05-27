'use client';

import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  total: number;
  current: number;
  answers: Record<number, number>;     // problem idx → choice idx
  marked: Set<number>;
  onJump: (idx: number) => void;
  onSubmit: () => void;
};

/**
 * 시험 모드 OMR 답안지.
 * 문제별 5개 버블 + 표식 표시 + 제출 버튼.
 */
export function OmrSheet({ total, current, answers, marked, onJump, onSubmit }: Props) {
  const answered = Object.keys(answers).length;

  return (
    <section className="bg-card flex h-full flex-col overflow-hidden rounded-xl border">
      <header className="bg-pullim-slate-900 flex items-center gap-3 px-4 py-3 text-white">
        <span className="font-mono text-sm font-bold">OMR 답안지</span>
        <span className="bg-white/15 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold">
          {answered}/{total} 마킹
        </span>
        {marked.size > 0 && (
          <span className="bg-pullim-warn ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
            <Flag className="h-2.5 w-2.5" />
            {marked.size} 표식
          </span>
        )}
      </header>

      <ul className="flex-1 overflow-y-auto p-3">
        {Array.from({ length: total }, (_, i) => {
          const ans = answers[i];
          const isCurrent = i === current;
          const isMarked = marked.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-current={isCurrent ? 'true' : undefined}
                className={cn(
                  'group flex w-full items-center gap-2 rounded px-2 py-1.5 transition-colors',
                  isCurrent ? 'bg-pullim-blue-50 ring-pullim-blue-300 ring-1' : 'hover:bg-pullim-slate-50',
                )}
              >
                <span className="text-pullim-slate-700 w-7 shrink-0 font-mono text-xs font-bold">
                  {i + 1}.
                </span>
                <div className="flex flex-1 items-center gap-1">
                  {[0, 1, 2, 3, 4].map(c => (
                    <span
                      key={c}
                      aria-label={['①','②','③','④','⑤'][c]}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-semibold transition-colors',
                        ans === c
                          ? 'bg-pullim-slate-900 text-white'
                          : 'border border-pullim-slate-300 text-pullim-slate-400',
                      )}
                    >
                      {ans === c ? ['①','②','③','④','⑤'][c] : c + 1}
                    </span>
                  ))}
                </div>
                {isMarked && <Flag className="text-pullim-warn h-3 w-3" />}
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="border-pullim-slate-200 border-t p-3">
        <button
          type="button"
          onClick={onSubmit}
          className="bg-pullim-warn-cta-bg hover:bg-pullim-warn-cta-bg/90 w-full rounded-lg py-2.5 text-sm font-bold text-white"
        >
          제출하기 ({answered}/{total} 마킹됨)
        </button>
        <p className="text-pullim-slate-500 mt-1.5 text-center text-[10px]">
          제출하면 자동 채점·풀림 해설이 즉시 공개돼요
        </p>
      </footer>
    </section>
  );
}
