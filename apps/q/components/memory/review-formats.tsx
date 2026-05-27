import { Layers3, PenLine, CheckSquare, Sparkles, type LucideIcon } from 'lucide-react';
import { reviewFormats } from '@/lib/mock';

const formatIcon: Record<'flashcard' | 'cloze' | 'mcq' | 'rephrase', LucideIcon> = {
  flashcard: Layers3,
  cloze:     PenLine,
  mcq:       CheckSquare,
  rephrase:  Sparkles,
};

/**
 * 4종 복습 형태 — 마스터 4.5.
 * 학생이 형태별 효과를 알고 선택할 수 있게 (메타인지).
 */
export function ReviewFormats() {
  return (
    <section className="bg-card rounded-xl border p-4">
      <header className="mb-3">
        <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
          복습 형태 — 4종 다양화
        </p>
        <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
          같은 내용, 다른 방식으로 다시 만나기
        </h2>
        <p className="text-pullim-slate-500 mt-0.5 text-[11px]">
          AI가 각 항목에 맞는 최적 형태를 자동 선택해요
        </p>
      </header>

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {reviewFormats.map(f => {
          const Icon = formatIcon[f.id];
          return (
          <li key={f.id}>
            <button
              type="button"
              className="bg-pullim-slate-50 hover:border-pullim-blue-300 hover:bg-pullim-blue-50/40 flex h-full w-full flex-col gap-1.5 rounded-xl border border-transparent p-3 text-left transition-all"
            >
              <span className="bg-pullim-blue-50 text-pullim-blue-600 flex h-9 w-9 items-center justify-center rounded-lg">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-pullim-slate-900 text-sm font-bold">{f.label}</div>
                <div className="text-pullim-slate-500 mt-0.5 text-[10px] leading-snug line-clamp-2">
                  {f.description}
                </div>
              </div>
              <div className="border-pullim-slate-200 mt-auto border-t pt-1.5 text-[10px]">
                <div className="text-pullim-slate-500">
                  <strong>적합:</strong> {f.bestFor}
                </div>
                <div className="text-pullim-success font-bold">
                  남은 기억 +{f.effectiveness}%
                </div>
              </div>
            </button>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
