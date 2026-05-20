import Link from 'next/link';
import { ScanSearch, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import {
  metaCognitionReport,
  lastDiagnosis,
  overallMeta,
  myAbility,
  metaDimensions,
  subjectLabels,
  wrongAttemptDiagnoses,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * /q/analysis 진입 시 학습자 정체성·데이터 소스·4 stat 을 5초 안에 전달.
 *
 * plan: proc/plan/2026-05-13_q-analysis-visual-redesign.md §1
 */
export function DiagnosisHero() {
  const topAbility = [...myAbility].sort((a, b) => b.theta - a.theta)[0];
  const weakDim = metaDimensions.find((d) => d.tone === 'warn');
  const wrongCount = wrongAttemptDiagnoses.length;

  return (
    <section className="bg-pullim-blue-50 border-pullim-blue-100 relative overflow-hidden rounded-xl border p-6">
      <div className="relative">
        <p className="text-pullim-blue-700 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          <ScanSearch className="h-3 w-3" />
          풀림 분석
        </p>
        <h1 className="text-pullim-slate-900 mt-2 text-2xl font-bold tracking-tight">
          {metaCognitionReport.learnerType}
        </h1>
        <p className="text-pullim-slate-600 mt-1.5 text-xs leading-relaxed">
          최근 {lastDiagnosis.questionsAnswered}문항 · {lastDiagnosis.durationMin}분 풀이 ·{' '}
          {lastDiagnosis.daysAgo}일 전 진단 + 지난 7일 풀이 데이터
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip
            label="메타 점수"
            value={`${overallMeta.score}/100`}
            sub={overallMeta.trend}
            Icon={Sparkles}
            tone="primary"
          />
          {topAbility && (
            <StatChip
              label="강한 과목"
              value={`${subjectLabels[topAbility.subject]} +${topAbility.theta.toFixed(2)}`}
              sub={`${topAbility.expectedGrade}등급`}
              tone="primary"
            />
          )}
          {weakDim && (
            <StatChip
              label="살펴볼 차원"
              value={weakDim.label}
              sub={`${weakDim.score} vs 또래 ${weakDim.peer}`}
              Icon={AlertTriangle}
              tone="warn"
            />
          )}
          <StatChip
            label="다시 볼 문제"
            value={`${wrongCount}문제`}
            sub="이번 주"
            tone="primary"
          />
        </ul>

        <DiagnoseCTA />
      </div>
    </section>
  );
}

/**
 * 진단 다시 받기 CTA — 분석 홈에서 /q/analysis/diagnose 진입 동선.
 *
 * 기준: lastDiagnosis.daysAgo vs nextRecommendedIn
 *  · overdue (>=) → 강한 톤 "지금 받기 권장"
 *  · 미충족  (<)  → 잔잔한 톤 "진단 다시 받기"
 *
 * audit: proc/research/2026-05-18_flow-audit/findings.md §2.2 (Critical)
 */
function DiagnoseCTA() {
  const overdue = lastDiagnosis.daysAgo >= lastDiagnosis.nextRecommendedIn;
  return (
    <Link
      href="/q/analysis/diagnose"
      className={cn(
        'mt-4 group flex items-center gap-3 rounded-xl border p-3 transition-colors',
        overdue
          ? 'border-pullim-blue-300 bg-pullim-blue-50 hover:bg-pullim-blue-100'
          : 'bg-card border-pullim-blue-100 hover:border-pullim-blue-300',
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          overdue
            ? 'bg-pullim-blue-600 text-white'
            : 'bg-pullim-blue-50 text-pullim-blue-700',
        )}
      >
        <ScanSearch className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-[10px] font-bold tracking-wider uppercase',
            overdue ? 'text-pullim-blue-700' : 'text-pullim-slate-600',
          )}
        >
          {overdue ? '지금 받기 권장' : '진단'}
        </div>
        <h4 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">
          {overdue ? '지금 진단 받기' : '진단 다시 받기'}
        </h4>
        <div className="text-pullim-slate-500 text-[11px]">
          {overdue
            ? `마지막 진단 ${lastDiagnosis.daysAgo}일 전 · 권장 주기 ${lastDiagnosis.nextRecommendedIn}일 경과`
            : `마지막 진단 ${lastDiagnosis.daysAgo}일 전 · 18분이면 끝나요`}
        </div>
      </div>
      <ArrowRight
        className={cn(
          'mt-1 h-4 w-4 shrink-0 transition-colors',
          overdue
            ? 'text-pullim-blue-500 group-hover:text-pullim-blue-700'
            : 'text-pullim-slate-300 group-hover:text-pullim-blue-500',
        )}
      />
    </Link>
  );
}

function StatChip({
  label,
  value,
  sub,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  Icon?: React.ComponentType<{ className?: string }>;
  tone: 'primary' | 'warn';
}) {
  return (
    <li className="bg-card border-pullim-blue-100 rounded-lg border p-2.5">
      <div className="text-pullim-slate-600 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
        {Icon && (
          <Icon
            className={`h-3 w-3 ${tone === 'warn' ? 'text-pullim-warn' : 'text-pullim-blue-500'}`}
          />
        )}
        {label}
      </div>
      <div className="text-pullim-slate-900 mt-0.5 text-sm font-bold tracking-tight">
        {value}
      </div>
      <div
        className={cn(
          'text-[10px]',
          sub.startsWith('+')
            ? 'text-pullim-success font-bold'
            : sub.startsWith('-')
              ? 'text-pullim-danger font-bold'
              : 'text-pullim-slate-500',
        )}
      >
        {sub}
      </div>
    </li>
  );
}
