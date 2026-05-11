import { Repeat, Trophy, Target, Brain, Shuffle } from 'lucide-react';
import { OnboardingTemplate } from '@/components/shell/onboarding-template';
import { MockBrowser } from '@/components/shell/mock-browser';
import { LeitnerBoxes } from '@/components/conqueror/leitner-boxes';
import { ForgettingCurveChart } from '@/components/memory/forgetting-curve-chart';
import { ReviewFormats } from '@/components/memory/review-formats';

export default function ReviewOnboardingPage() {
  return (
    <OnboardingTemplate
      featureName="풀림 복습"
      Icon={Repeat}
      identity="틀린 문제는 자동 정복 큐로, 배운 것은 잊을 만하면 다시 만나요. 오답노트 직접 안 써도 돼요."
      estimatedMin={4}
      steps={[
        {
          Icon: Target,
          title: '틀린 것 (Leitner 5-box)',
          description:
            '오답이 발생하면 자동으로 BOX 1로. 1회 정답 → BOX 2 (3일 후 재출제). 실패하면 BOX 1 복귀. BOX 5(30일)까지 가면 마스터.',
          bullets: [
            'BOX 1 (1일) · BOX 2 (3일) · BOX 3 (7일)',
            'BOX 4 (14일) · BOX 5 (30일) · 5회 연속 → 마스터',
          ],
          cta: { label: '복습 홈으로', href: '/q/review' },
          screenshotCaption: '실제 Leitner 5박스 (다크 테마)',
          screenshot: (
            <MockBrowser label="Leitner 5-box">
              <LeitnerBoxes />
            </MockBrowser>
          ),
        },
        {
          Icon: Trophy,
          title: '정복 세트 풀이 — 3회 연속 정답이 정복',
          description:
            'AI가 같은 패턴의 5문제를 묶어 정복 세트로. 3회 연속 정답 시 정복 스탬프 획득. 깔끔한 라이트 워크룸으로 사고 흐름에 집중.',
          signature: true,
          cta: { label: '정복 세트 시작', href: '/q/review/conquer' },
          screenshotCaption: '정복 진행 — 연속 카운트',
          screenshot: (
            <MockBrowser label="정복 세트 풀이">
              <section className="bg-card rounded-lg border p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[9px]">
                  <span className="bg-pullim-danger-bg text-pullim-danger inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold">
                    <span className="text-[8px]">정복 세트</span>
                  </span>
                  <span className="text-pullim-slate-400 font-mono">ENG_BLANK_LOGIC_001</span>
                </div>
                <h4 className="text-pullim-slate-900 text-sm font-bold tracking-tight">빈칸 추론 — 접속사 논리 관계</h4>
                <div className="grid grid-cols-3 gap-2 border-t border-pullim-slate-200 pt-2">
                  <div>
                    <div className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase">진행</div>
                    <div className="text-pullim-slate-900 font-mono text-base font-bold">2/5</div>
                  </div>
                  <div>
                    <div className="text-pullim-blue-700 text-[9px] font-bold tracking-wider uppercase">연속 정답</div>
                    <div className="text-pullim-lemon-ink font-mono text-base font-bold">2회</div>
                    <div className="text-pullim-slate-400 text-[8px]">정복까지 1회</div>
                  </div>
                  <div>
                    <div className="text-pullim-slate-500 text-[9px] font-bold tracking-wider uppercase">시도</div>
                    <div className="text-pullim-slate-900 font-mono text-base font-bold">2회</div>
                  </div>
                </div>
                <div className="bg-pullim-lemon text-pullim-lemon-ink mt-2 flex items-center gap-1 rounded-md p-1.5 text-[10px] font-bold">
                  <Trophy className="h-3 w-3" />
                  1회 더 맞히면 정복 스탬프!
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: Brain,
          title: '모든 학습 (망각 곡선)',
          description:
            '에빙하우스 + 개인 파라미터 베이지안 추정. 풀림 무한풀기·분석·비주얼·클래스봇에서 발생한 모든 학습이 자동 등록.',
          cta: { label: '복습 홈으로', href: '/q/review' },
          screenshotCaption: '실제 망각 곡선 (평균 vs 개인)',
          screenshot: (
            <MockBrowser label="망각 곡선">
              <ForgettingCurveChart />
            </MockBrowser>
          ),
        },
        {
          Icon: Shuffle,
          title: '4종 복습 형태 자동 선택',
          description:
            'AI가 항목별 최적 형태 선택. 플래시카드(빠른 인출) / 빈칸 채우기(맥락) / 객관식 재출제(응용) / AI 변형 문제(전이 학습).',
          screenshotCaption: '4종 복습 형태 카드',
          screenshot: (
            <MockBrowser label="복습 형태 — 4종 다양화">
              <ReviewFormats />
            </MockBrowser>
          ),
        },
      ]}
      finalCta={{ label: '풀림 복습 시작하기', href: '/q/review' }}
    />
  );
}
