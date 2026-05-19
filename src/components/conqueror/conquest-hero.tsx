import Link from 'next/link';
import { AlertTriangle, Flame, Target } from 'lucide-react';
import { overdueCards, todayCards, conquestStats } from '@/lib/mock';

/**
 * 오늘의 정복 미션 hero — 다크 테마.
 * Overdue 우선, 그 다음 오늘 복습 대상.
 */
export function ConquestHero() {
  const overdue = overdueCards();
  const today = todayCards();

  const mostOverdueHours = overdue[0]?.nextReviewInHours ?? 0;
  const overdueLabel =
    mostOverdueHours <= -48 ? `${Math.abs(Math.floor(mostOverdueHours / 24))}일째`
    : mostOverdueHours <= -24 ? '1일째'
    : `${Math.abs(Math.floor(mostOverdueHours))}시간째`;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-pullim-slate-950 p-5 text-white shadow-xl">
      {/* 배경 장식 */}
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-pullim-blue-500), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(circle, var(--color-pullim-danger), transparent 70%)' }}
      />

      <div className="relative">
        {/* 헤더 */}
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
          <Target className="text-pullim-lemon h-3 w-3" />
          <span className="text-pullim-lemon">오늘의 정복 미션</span>
          <span className="text-white/40">· Leitner 5-box</span>
        </div>

        {/* 메인 숫자 */}
        <div className="mt-3 flex items-end gap-4">
          <div>
            <div className="text-pullim-danger flex items-center gap-1.5 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Overdue
            </div>
            <div className="font-mono text-5xl font-bold tracking-tight">
              {overdue.length}
              <span className="text-pullim-slate-500 text-lg">문제</span>
            </div>
            {overdue.length > 0 && (
              <div className="text-pullim-danger/80 mt-0.5 text-[11px]">
                가장 오래 된 것 <strong>{overdueLabel}</strong> 지남
              </div>
            )}
          </div>
          <div className="text-pullim-slate-600 text-4xl font-mono opacity-40">/</div>
          <div>
            <div className="text-pullim-slate-500 text-xs font-bold">오늘 복습</div>
            <div className="text-pullim-slate-300 font-mono text-3xl font-bold">
              {today.length}
            </div>
          </div>
        </div>

        {/* CTA + 통계 */}
        <div className="border-pullim-slate-800 mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
          <Link
            href="/q/review/conquer"
            className="bg-pullim-lemon text-pullim-lemon-ink inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold shadow-lg shadow-lemon-400/20 hover:scale-[1.02] transition-transform"
          >
            <Flame className="h-4 w-4" />
            지금 정복 시작
          </Link>

          <div className="text-pullim-slate-500 ml-auto flex items-baseline gap-4 text-[11px]">
            <span>
              누적 정복
              <strong className="text-pullim-lemon ml-1 font-mono text-base">{conquestStats.totalConquered}</strong>
            </span>
            <span>
              마스터 스탬프
              <strong className="text-white ml-1 font-mono text-base">{conquestStats.masterStamps}</strong>
            </span>
            <span>
              이번 주 +<strong className="text-pullim-success font-mono">{conquestStats.thisWeekConquered}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
