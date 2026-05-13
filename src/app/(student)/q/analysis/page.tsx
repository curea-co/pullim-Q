import Link from 'next/link';
import { ScanSearch, ArrowRight, AlertTriangle } from 'lucide-react';
import { lastDiagnosis, myAbility, subjectLabels, metaDimensions, overallMeta } from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { SectionHeading } from '@/components/shell/section-heading';
import { WrongReasonTop3 } from '@/components/analysis/wrong-reason-top3';
import { RecentMistakes } from '@/components/analysis/recent-mistakes';
import { TodayReviewPreview } from '@/components/analysis/today-review-preview';

export default function AnalysisIntroPage() {
  const topAbility = myAbility[0]!;
  const weakDim = metaDimensions.find(d => d.tone === 'warn' || d.tone === 'improve');

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={{ icon: ScanSearch, text: '풀림 분석' }}
        title="내 실력, 두 각도로 보기"
        description={`마지막 진단 ${lastDiagnosis.daysAgo}일 전 · 단원별 실력 + 풀이 습관 종합`}
      />

      <WrongReasonTop3 />

      <section>
        <SectionHeading
          title="내 실력 한눈에"
          description="강한 과목과 개선 포인트를 같이 봐요"
        />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Primary — 풀이 습관 종합 (P-7: 단일 Primary CTA) */}
          <Link
            href="/q/analysis/process"
            className="bg-pullim-blue-50/60 ring-pullim-blue-200 hover:bg-pullim-blue-50 hover:ring-pullim-blue-300 hover:shadow-pullim-md group rounded-2xl ring-2 p-5 transition-all"
          >
            <div className="text-pullim-blue-700 text-[10px] font-bold tracking-wider uppercase">
              풀이 습관 종합
            </div>
            <div className="text-pullim-slate-900 mt-1 text-base font-bold">
              {overallMeta.score}/100 ({overallMeta.rank})
            </div>
            {weakDim && (
              <>
                <div className="text-pullim-warn mt-2 inline-flex items-center gap-1 text-xs font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  살펴봐요: {weakDim.label} ({weakDim.score} vs 또래 {weakDim.peer})
                </div>
                <p className="text-pullim-slate-600 mt-2 line-clamp-2 text-[11px] leading-relaxed">
                  {weakDim.insight}
                </p>
              </>
            )}
            <div className="text-pullim-blue-700 mt-3 inline-flex items-center gap-0.5 text-xs font-bold">
              풀이 습관 자세히
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          {/* Secondary — 단원별 능력치 */}
          <Link
            href="/q/analysis/ability"
            className="bg-card hover:border-pullim-blue-300 hover:shadow-pullim-sm group rounded-2xl border p-4 transition-all"
          >
            <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
              현재 강한 과목
            </div>
            <div className="text-pullim-slate-900 mt-1 text-sm font-bold">
              {subjectLabels[topAbility.subject]}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-pullim-slate-700 font-mono text-2xl font-bold">
                +{topAbility.theta.toFixed(2)}
              </span>
              <span className="text-pullim-slate-400 text-[11px]">
                예상 {topAbility.expectedGrade}등급 · 상위 {100 - topAbility.percentile}%
              </span>
            </div>
            <div className="text-pullim-slate-500 mt-3 inline-flex items-center gap-0.5 text-[11px] font-semibold">
              단원별 자세히
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </section>

      <RecentMistakes />

      {/* advice §5-1 마지막 [NEW] 블록 — 오늘의 복습 경로 (복습 탭 미리보기 2~3개) */}
      <TodayReviewPreview />
    </div>
  );
}
