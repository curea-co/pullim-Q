import { ScanSearch, TrendingUp, Timer, RotateCcw, Compass, Brain, type LucideIcon } from 'lucide-react';
import { metaDimensions, overallMeta } from '@/lib/mock';
import { cn } from '@/lib/utils';

const toneClass = {
  good:    'text-pullim-success',
  warn:    'text-pullim-warn',
  improve: 'text-pullim-danger',
} as const;

const toneBg = {
  good:    'bg-pullim-success-bg text-pullim-success',
  warn:    'bg-pullim-warn-bg text-pullim-warn',
  improve: 'bg-pullim-danger-bg text-pullim-danger',
} as const;

/** id별 lucide 아이콘 매핑 — Layer 1 §14.1: lucide 단독 + 이모지 사용 금지 */
const dimIcon: Record<string, LucideIcon> = {
  time:       Timer,
  self_check: RotateCcw,
  strategy:   Compass,
  load:       Brain,
};

/**
 * 메타인지 종합 hero — 4차원 점수 + 종합.
 * Layer 1 §14.1: 한 화면 단일 톤 — 라이트 베이스로 통일.
 */
export function MetaHero() {
  const angle = (overallMeta.score / 100) * 360;

  return (
    <section className="bg-card relative overflow-hidden rounded-2xl border p-5">
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[auto_1fr]">
        {/* 종합 도넛 */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative flex h-32 w-32 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--color-pullim-blue-500) ${angle}deg, var(--color-pullim-slate-100) 0deg)`,
            }}
          >
            <div className="bg-card flex h-24 w-24 flex-col items-center justify-center rounded-full shadow-pullim-xs">
              <span className="text-pullim-slate-900 font-mono text-3xl font-bold tracking-tight">{overallMeta.score}</span>
              <span className="text-pullim-slate-400 text-[10px] tracking-wider">/ 100</span>
            </div>
          </div>
          <div className="text-pullim-success inline-flex items-center gap-1 text-xs font-bold">
            <TrendingUp className="h-3 w-3" />
            {overallMeta.trend}
          </div>
        </div>

        {/* 4차원 */}
        <div>
          <div className="text-pullim-blue-600 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <ScanSearch className="h-3 w-3" />
            메타인지 종합
          </div>
          <h2 className="text-pullim-slate-900 mt-1 text-xl font-bold tracking-tight">
            “어떻게 푸는가” — 풀이 과정 분석
          </h2>
          <p className="text-pullim-slate-500 mt-1 text-xs">
            {overallMeta.rank} · 한국 에듀테크 첫 시도 (Q 5.3)
          </p>

          {/* 4차원 미니 카드 */}
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {metaDimensions.map(d => {
              const Icon = dimIcon[d.id] ?? Brain;
              return (
                <li key={d.id} className="bg-pullim-slate-50 rounded-lg p-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="text-pullim-blue-600 h-3.5 w-3.5" />
                    <span className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
                      {d.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className={cn('font-mono text-base font-bold', toneClass[d.tone])}>
                      {d.score}
                    </span>
                    <span className="text-pullim-slate-400 text-[10px]">vs {d.peer}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** 4차원 상세 카드 — hero 다음 섹션 */
export function MetaDetailCards() {
  return (
    <section>
      <h2 className="text-pullim-slate-900 mb-3 text-sm font-bold tracking-tight">
        4가지 메타인지 차원
      </h2>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {metaDimensions.map(d => {
          const Icon = dimIcon[d.id] ?? Brain;
          return (
            <li key={d.id} className="bg-card flex items-start gap-3 rounded-xl border p-3.5">
              <span
                aria-hidden
                className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', toneBg[d.tone])}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-pullim-slate-900 text-sm font-bold">{d.label}</h3>
                  <span className={cn('font-mono text-sm font-bold', toneClass[d.tone])}>
                    {d.score}
                  </span>
                  <span className="text-pullim-slate-400 text-[10px]">또래 {d.peer}</span>
                </div>
                <p className="text-pullim-slate-600 mt-0.5 text-[11px] leading-relaxed">
                  {d.insight}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
