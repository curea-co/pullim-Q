import { Sparkles, Plus, Clock, RotateCcw, Pause, Moon, type LucideIcon } from 'lucide-react';
import { actionSuggestions } from '@/lib/mock';

const iconByKey: Record<'review' | 'pause' | 'night', LucideIcon> = {
  review: RotateCcw,
  pause:  Pause,
  night:  Moon,
};

/**
 * AI 자동 제안 카드 — 레몬 배경.
 * 분석 데이터 기반 다음 학습 액션 추천.
 */
export function ActionSuggestions() {
  return (
    <section className="bg-pullim-lemon/15 border-pullim-lemon-ink/20 rounded-xl border p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="bg-pullim-lemon-ink text-pullim-lemon flex h-9 w-9 items-center justify-center rounded-xl">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-pullim-lemon-ink text-[10px] font-bold tracking-wider uppercase">
            AI 자동 제안
          </p>
          <h2 className="text-pullim-slate-900 text-sm font-bold">
            다음 학습 액션
          </h2>
        </div>
      </header>

      <ul className="space-y-2">
        {actionSuggestions.map(s => {
          const Icon = iconByKey[s.iconKey];
          return (
          <li key={s.id}>
            <article className="bg-white hover:shadow-pullim-md group flex items-start gap-3 rounded-xl border border-pullim-lemon-ink/15 p-3 transition-all">
              <span aria-hidden className="bg-pullim-lemon/30 text-pullim-lemon-ink flex h-9 w-9 items-center justify-center rounded-lg">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-pullim-slate-900 text-sm font-bold">{s.title}</h3>
                <p className="text-pullim-slate-600 mt-0.5 text-[11px] leading-snug">{s.reason}</p>

                <div className="text-pullim-slate-500 mt-1.5 inline-flex items-center gap-2 text-[10px]">
                  <span className="bg-pullim-blue-50 text-pullim-blue-700 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-bold">
                    <Clock className="h-2.5 w-2.5" />
                    {s.plannerBlock.duration}분
                  </span>
                  <span>{s.plannerBlock.time}</span>
                  <span className="text-pullim-slate-300">·</span>
                  <span>{s.plannerBlock.feature}</span>
                </div>
              </div>

              <button
                type="button"
                className="bg-pullim-lemon text-pullim-lemon-ink hover:bg-pullim-lemon/90 inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors"
              >
                <Plus className="h-4 w-4" />
                오늘 학습에 추가
              </button>
            </article>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
