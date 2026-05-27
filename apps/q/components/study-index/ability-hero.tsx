import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { myAbility, subjectLabels } from '@/lib/mock';
import { pullimSubjectColors } from '@/lib/tokens';
import { cn } from '@/lib/utils';

/**
 * θ 능력치 영웅 카드 — 과목 3개 나란히.
 * 단일 숫자 UI 금지 원칙(Q 핸드오프)을 따르되, 데모의 요약 강조를 위해 "현재값 + 추세"로 balance.
 */
export function AbilityHero() {
  return (
    <section className="bg-card rounded-xl border overflow-hidden">
      <div className="border-b p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
              내 학습 체력 (실력 점수)
            </p>
            <h2 className="text-pullim-slate-900 mt-0.5 text-lg font-bold tracking-tight">
              과목별 실시간 실력 점수
            </h2>
          </div>
          <span className="text-pullim-slate-500 text-[10px] font-mono">
            맞춤 추정 · 표준 분포
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-1 divide-y divide-pullim-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {myAbility.map(a => {
          const label = subjectLabels[a.subject];
          const color = pullimSubjectColors[a.subject];
          const isUp = a.delta24h > 0;
          const isDown = a.delta24h < 0;
          const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
          const trendColor = isUp ? 'text-pullim-success' : isDown ? 'text-pullim-danger' : 'text-pullim-slate-400';
          return (
            <li key={a.subject} className="flex flex-col items-center p-4 text-center">
              <span className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
                {label}
              </span>
              <div className="mt-1 flex items-baseline gap-0.5">
                <span className="text-pullim-slate-900 font-mono text-3xl font-bold" style={{ color }}>
                  {a.theta > 0 ? '+' : ''}{a.theta.toFixed(2)}
                </span>
              </div>
              <div className={cn('mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold font-mono', trendColor)}>
                <TrendIcon className="h-3 w-3" />
                {a.delta24h > 0 ? '+' : ''}{a.delta24h.toFixed(2)} (24h)
              </div>
              <div className="mt-2 space-y-0.5 text-[10px]">
                <div className="text-pullim-slate-500">
                  예상 등급 <span className="text-pullim-slate-900 font-bold">{a.expectedGrade}등급</span>
                </div>
                <div className="text-pullim-slate-500">
                  상위 <span className="text-pullim-slate-900 font-bold font-mono">{100 - a.percentile}%</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
