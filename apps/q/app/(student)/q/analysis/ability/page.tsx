import { Activity, ArrowLeft, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { lastDiagnosis } from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { AbilityHero } from '@/components/study-index/ability-hero';
import { MasteryHeatmap } from '@/components/study-index/mastery-heatmap';
import { CognitiveRadar } from '@/components/study-index/cognitive-radar';
import { GrowthTrend } from '@/components/study-index/growth-trend';
import { PrescriptionList } from '@/components/study-index/prescription-list';

/**
 * 풀림 분석 — 능력치 (구 인덱스) 단독 페이지.
 * "내가 무엇을 잘하나" — IRT θ, 단원 마스터리, 처방.
 */
export default function AbilityPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Activity, text: '풀림 분석 → 능력치' }}
        title="내가 무엇을 잘하나"
        description={
          <>
            마지막 진단 <strong className="text-pullim-slate-700">{lastDiagnosis.daysAgo}일 전</strong> · {lastDiagnosis.questionsAnswered}문항 · 단원·사고유형별 정밀 측정
          </>
        }
        action={
          <Link
            href="/q/analysis/diagnose"
            className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white shadow-pullim-sm"
          >
            <RotateCw className="h-4 w-4" />
            재진단 (5분)
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <Link
          href="/q/analysis"
          className="text-pullim-slate-500 hover:text-pullim-blue-600 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="h-3 w-3" />
          분석 소개로
        </Link>
        {/* §2.7 flow audit — 능력치 ↔ 과정 lateral 이동 */}
        <Link
          href="/q/analysis/process"
          className="text-pullim-blue-600 hover:text-pullim-blue-700 inline-flex items-center gap-1 text-xs font-semibold ml-auto"
        >
          과정 (메타인지) 보기
          <ArrowLeft className="h-3 w-3 rotate-180" />
        </Link>
      </div>

      <AbilityHero />
      <GrowthTrend />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MasteryHeatmap />
        <CognitiveRadar />
      </div>

      <PrescriptionList />
    </div>
  );
}
