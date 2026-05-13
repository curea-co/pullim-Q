import { ScanSearch, Clock, Plus, TrendingUp, Target, BarChart3, Brain, Zap, Repeat } from 'lucide-react';
import { OnboardingTemplate } from '@/components/shell/onboarding-template';
import { MockBrowser } from '@/components/shell/mock-browser';
import { AbilityHero } from '@/components/study-index/ability-hero';
import { CognitiveRadar } from '@/components/study-index/cognitive-radar';

export default function AnalysisOnboardingPage() {
  return (
    <OnboardingTemplate
      featureName="풀림 분석"
      Icon={ScanSearch}
      identity="시험 점수보다 정확하게, 내 실력이 진짜 늘고 있는지 그래프로 보여드려요. 자주 하는 실수 패턴까지 같이 추적돼요."
      estimatedMin={4}
      steps={[
        {
          Icon: Target,
          title: '진단 시작 (15문항 맞춤)',
          description:
            '먼저 진단을 해야 실력 점수가 측정돼요. 15문항이 정답률에 따라 난이도가 자동 조정되는 맞춤 진단.',
          cta: { label: '진단 시작하기', href: '/q/analysis/diagnose' },
          screenshotCaption: '진단 진행 중 — 실시간 실력 점수 갱신',
          screenshot: (
            <MockBrowser label="study/analysis/diagnose">
              <section className="bg-card rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-pullim-slate-100 h-1.5 flex-1 overflow-hidden rounded-full">
                    <div className="bg-pullim-blue-500 h-full w-1/3 rounded-full" />
                  </div>
                  <span className="text-pullim-slate-700 font-mono text-xs font-bold">5/15</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <div className="bg-pullim-slate-50 rounded p-1.5">
                    <div className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase">응답</div>
                    <div className="text-pullim-slate-900 font-mono font-bold">5건</div>
                  </div>
                  <div className="bg-pullim-blue-50 rounded p-1.5">
                    <div className="text-pullim-blue-700 text-[9px] font-bold tracking-wider uppercase">실력 점수</div>
                    <div className="text-pullim-blue-600 font-mono font-bold">+0.42</div>
                  </div>
                  <div className="bg-pullim-slate-50 rounded p-1.5">
                    <div className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase">모델</div>
                    <div className="text-pullim-blue-700 font-mono font-bold">AI 맞춤</div>
                  </div>
                </div>
                <div className="text-pullim-slate-400 text-[9px] italic text-center">
                  매 문항 응답마다 실력 점수 실시간 갱신
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: BarChart3,
          title: '능력치 (What) — 무엇을 잘하나',
          description:
            '실력 점수 + 예상 등급 + 단원별 정복도 히트맵 + 사고유형 레이더(내 vs 또래) + AI 처방 4종.',
          bullets: [
            '실력 점수: -3 ~ +3 (맞춤 추정)',
            '히트맵: 5단계 색상 (강점·취약·약점)',
          ],
          cta: { label: '능력치 페이지로', href: '/q/analysis/ability' },
          screenshotCaption: '실제 실력 점수 영웅 카드 (3과목)',
          screenshot: (
            <MockBrowser label="study/analysis/ability">
              <AbilityHero />
            </MockBrowser>
          ),
        },
        {
          Icon: Brain,
          title: '과정 (How) — 어떻게 푸나',
          description:
            '풀이 시간·선지 변경·읽기 패턴을 데이터화해 메타인지 4차원 점수 + 시간 분포 + 시간대별 정답률 + 찍기 탐지 + 학습자 유형 리포트.',
          signature: true,
          cta: { label: '과정 페이지로', href: '/q/analysis/process' },
          screenshotCaption: '실제 사고유형 레이더 (내 vs 또래)',
          screenshot: (
            <MockBrowser label="study/analysis/process">
              <CognitiveRadar />
            </MockBrowser>
          ),
        },
        {
          Icon: Zap,
          title: 'AI 처방 → 1-tap 실행',
          description:
            '두 차원 데이터를 합쳐 자동 제안 4종 — 약점 단원→복습, 개념 보충→비주얼, 풀이 추천→무한풀기, 추천 교재→스토어. 플래너에 1-tap 추가.',
          screenshotCaption: '레몬 액션 카드 (플래너 1-tap)',
          screenshot: (
            <MockBrowser label="AI 자동 제안">
              <article className="bg-pullim-lemon/15 border-pullim-lemon-ink/15 rounded-lg border p-3">
                <div className="flex items-start gap-2">
                  <Repeat aria-hidden className="text-pullim-warn h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-pullim-slate-900 text-xs font-bold">“검토 5초 챌린지” 시작</h4>
                    <p className="text-pullim-slate-600 mt-0.5 text-[10px]">
                      선지 변경 빈도가 또래보다 23% 낮음
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[9px]">
                      <span className="bg-pullim-blue-50 text-pullim-blue-700 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold">
                        <Clock className="h-2 w-2" />
                        25분
                      </span>
                      <span className="text-pullim-slate-500">내일 18:00 · 풀림 무한풀기</span>
                    </div>
                  </div>
                  <button className="bg-pullim-lemon text-pullim-lemon-ink inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-bold">
                    <Plus className="h-2.5 w-2.5" />
                    플래너에
                  </button>
                </div>
              </article>
              <div className="text-pullim-slate-400 mt-2 inline-flex items-center gap-1 text-[9px]">
                <TrendingUp className="h-2.5 w-2.5" />
                예상 효과 실력 점수 +0.18
              </div>
            </MockBrowser>
          ),
        },
      ]}
      finalCta={{ label: '풀림 분석 둘러보기', href: '/q/analysis' }}
    />
  );
}
