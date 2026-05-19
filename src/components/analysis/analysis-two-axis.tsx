import Link from 'next/link';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import {
  metaDimensions,
  myAbility,
  subjectLabels,
  type MetaDimension,
  type AbilityTheta,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * /q/analysis 두 축 시각화 — "어떻게 푸나" (메타 4차원) + "무엇이 강한가" (단원별 θ).
 *
 * plan: proc/plan/2026-05-13_q-analysis-visual-redesign.md §2
 * CSS 가로 막대로 구현 — 라이브러리 X (§4).
 */
export function AnalysisTwoAxis() {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <ProcessCard />
      <AbilityCard />
    </div>
  );
}

/* ─────────────────────────  좌측 — 어떻게 푸나  ───────────────────────── */

function ProcessCard() {
  return (
    <article className="bg-card rounded-xl border p-4 flex flex-col">
      <header className="mb-3">
        <p className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
          어떻게 푸나
        </p>
        <h3 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">메타인지 4차원</h3>
      </header>

      <ul className="flex-1 space-y-3">
        {metaDimensions.map((d) => (
          <li key={d.id}>
            <HorizontalBar dim={d} />
            {d.tone === 'warn' && (
              <p className="text-pullim-warn mt-1 line-clamp-1 text-[10px] leading-snug">
                {d.insight}
              </p>
            )}
          </li>
        ))}
      </ul>

      <Link
        href="/q/analysis/process"
        className="text-pullim-slate-600 hover:text-pullim-blue-600 mt-4 inline-flex items-center gap-0.5 text-xs font-bold hover:underline underline-offset-3"
      >
        풀이 습관 자세히 보기
        <ArrowRight className="h-3 w-3" />
      </Link>
    </article>
  );
}

function HorizontalBar({ dim }: { dim: MetaDimension }) {
  const fillClass =
    dim.tone === 'good' ? 'bg-pullim-blue-600'
    : dim.tone === 'warn' ? 'bg-pullim-warn'
    : 'bg-pullim-slate-500';

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-pullim-slate-900 font-semibold">{dim.label}</span>
        <span className="text-pullim-slate-500 font-mono">
          <span className="text-pullim-slate-900 font-bold">{dim.score}</span>
          <span className="text-pullim-slate-400 mx-1">·</span>
          vs 또래 {dim.peer}
        </span>
      </div>
      <div className="bg-pullim-slate-100 relative h-2 overflow-visible rounded-full">
        <div
          className={cn('h-full rounded-full', fillClass)}
          style={{ width: `${dim.score}%` }}
          aria-hidden
        />
        {/* 또래 마커 */}
        <div
          className="bg-pullim-slate-500 absolute top-1/2 h-3 w-0.5 -translate-y-1/2"
          style={{ left: `${dim.peer}%` }}
          aria-label={`또래 평균 ${dim.peer}`}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────  우측 — 무엇이 강한가  ───────────────────────── */

function AbilityCard() {
  return (
    <article className="bg-card rounded-xl border p-4 flex flex-col">
      <header className="mb-3">
        <p className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
          무엇이 강한가
        </p>
        <h3 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">단원별 실력 점수</h3>
      </header>

      <ul className="flex-1 space-y-3">
        {myAbility.map((a) => (
          <li key={a.subject}>
            <BipolarBar ability={a} />
          </li>
        ))}
      </ul>

      <Link
        href="/q/analysis/ability"
        className="text-pullim-slate-600 hover:text-pullim-blue-600 mt-4 inline-flex items-center gap-0.5 text-xs font-bold hover:underline underline-offset-3"
      >
        단원별 자세히 보기
        <ArrowRight className="h-3 w-3" />
      </Link>
    </article>
  );
}

function BipolarBar({ ability }: { ability: AbilityTheta }) {
  // θ 범위 -1 ~ +1 가정 (clamp)
  const clamped = Math.max(-1, Math.min(1, ability.theta));
  const widthPct = Math.abs(clamped) * 50; // 중앙선 기준 좌/우 최대 50%
  const isPositive = clamped >= 0;
  const fillClass = isPositive ? 'bg-pullim-blue-600' : 'bg-pullim-warn';
  const isUp = ability.delta24h > 0;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="text-pullim-slate-900 font-semibold">
          {subjectLabels[ability.subject]}
        </span>
        <span className="text-pullim-slate-500 font-mono inline-flex items-center gap-1">
          <span className="text-pullim-slate-900 font-bold">
            {isPositive ? '+' : ''}
            {ability.theta.toFixed(2)}
          </span>
          {ability.delta24h !== 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-bold',
                isUp ? 'text-pullim-success' : 'text-pullim-danger',
              )}
            >
              {isUp ? (
                <TrendingUp className="h-2.5 w-2.5" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5" />
              )}
              {ability.delta24h >= 0 ? '+' : ''}
              {ability.delta24h.toFixed(2)}
            </span>
          )}
          <span className="text-pullim-slate-400">·</span>
          <span>{ability.expectedGrade}등급</span>
        </span>
      </div>
      <div className="bg-pullim-slate-100 relative h-2 overflow-visible rounded-full">
        {/* 중앙 분기선 */}
        <div
          className="bg-pullim-slate-400 absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2"
          aria-hidden
        />
        {/* 막대 — 양수면 우측, 음수면 좌측 */}
        <div
          className={cn('absolute top-0 h-full rounded-full', fillClass)}
          style={
            isPositive
              ? { left: '50%', width: `${widthPct}%` }
              : { right: '50%', width: `${widthPct}%` }
          }
          aria-hidden
        />
      </div>
    </div>
  );
}
