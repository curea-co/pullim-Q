import { Brain, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shell/page-header';
import { MetaHero, MetaDetailCards } from '@/components/xray/meta-hero';
import { TimeDistributionChart } from '@/components/xray/time-distribution';
import { HourlyAccuracyChart } from '@/components/xray/hourly-accuracy';
import { GuessingDetector } from '@/components/xray/guessing-detector';
import { MetaCognitionReport } from '@/components/xray/metacognition-report';
import { ActionSuggestions } from '@/components/xray/action-suggestions';

/**
 * 풀림 분석 — 과정 (구 풀이분석) 단독 페이지.
 * "내가 어떻게 푸나" — 메타인지, 시간 분포, 패턴.
 */
export default function ProcessPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Brain, text: '풀림 분석 → 과정' }}
        title="내가 어떻게 푸나 (메타인지)"
        description="한국 에듀테크 첫 시도 · 풀이 시간·선지 변경·읽기 패턴 등 풀이 과정 자체를 데이터화"
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
          href="/q/analysis/ability"
          className="text-pullim-blue-600 hover:text-pullim-blue-700 inline-flex items-center gap-1 text-xs font-semibold ml-auto"
        >
          능력치 보기
          <ArrowLeft className="h-3 w-3 rotate-180" />
        </Link>
      </div>

      <MetaHero />
      <MetaDetailCards />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TimeDistributionChart />
        <HourlyAccuracyChart />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr]">
        <GuessingDetector />
        <MetaCognitionReport />
      </div>

      <ActionSuggestions />
    </div>
  );
}
