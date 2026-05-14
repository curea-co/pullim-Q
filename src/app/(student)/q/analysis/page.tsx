import { DiagnosisHero } from '@/components/analysis/diagnosis-hero';
import { AnalysisTwoAxis } from '@/components/analysis/analysis-two-axis';
import { WrongReasonTop3 } from '@/components/analysis/wrong-reason-top3';
import { RecentMistakes } from '@/components/analysis/recent-mistakes';
import { TodayReviewPreview } from '@/components/analysis/today-review-preview';

export default function AnalysisIntroPage() {
  return (
    <div className="space-y-section">
      <DiagnosisHero />
      <AnalysisTwoAxis />
      <WrongReasonTop3 />
      <RecentMistakes />
      <TodayReviewPreview />
    </div>
  );
}
