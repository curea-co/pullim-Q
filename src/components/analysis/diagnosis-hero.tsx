import { ScanSearch, AlertTriangle, Sparkles } from 'lucide-react';
import {
  metaCognitionReport,
  lastDiagnosis,
  overallMeta,
  myAbility,
  metaDimensions,
  subjectLabels,
  wrongAttemptDiagnoses,
} from '@/lib/mock';

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
    <section className="bg-pullim-blue-50 border-pullim-blue-100 relative overflow-hidden rounded-2xl border p-6">
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
      </div>
    </section>
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
      <div className="text-pullim-slate-500 text-[10px]">{sub}</div>
    </li>
  );
}
