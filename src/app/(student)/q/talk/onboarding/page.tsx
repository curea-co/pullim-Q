import { Users, Sparkles, MessageCircle, Compass, Puzzle } from 'lucide-react';
import { OnboardingTemplate } from '@/components/shell/onboarding-template';
import { MockBrowser } from '@/components/shell/mock-browser';

export default function CoachOnboardingPage() {
  return (
    <OnboardingTemplate
      featureName="풀림 코치"
      Icon={Users}
      identity="공부 방향이 막힐 때 물어볼 수 있는 한 명의 친구. 한 문제만 막혔을 땐 풀이 워크스페이스 옆 패널에서 바로 도움받을 수 있어요."
      estimatedMin={3}
      steps={[
        {
          Icon: Compass,
          title: '오늘 코치가 본 것 — 통합 메시지',
          description:
            '코치는 내 풀이·오답·실력 변화를 종합해서 "오늘 두 가지를 챙겨주세요" 같은 한 마디로 정리해줘요. 채팅으로 이어서 더 물어볼 수 있어요.',
          signature: true,
          cta: { label: '코치 만나러 가기', href: '/q/talk' },
          screenshotCaption: '오늘 코치가 본 것',
          screenshot: (
            <MockBrowser label="코치 한 마디">
              <section className="bg-pullim-blue-50 border-pullim-blue-100 rounded-lg border p-3">
                <div className="text-pullim-blue-700 inline-flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase">
                  <Sparkles className="h-3 w-3" />
                  오늘 코치가 본 것
                </div>
                <h3 className="text-pullim-slate-900 mt-1.5 text-sm font-bold tracking-tight">
                  오늘 두 가지를 챙겨주세요
                </h3>
                <p className="text-pullim-slate-700 mt-1.5 text-[11px] leading-relaxed">
                  영어 빈칸 추론 +14p · 한 번 더 굳히기. <br />
                  미분 부호 변화 5번째 막힘 · 비주얼로 시각화 후 적응형 풀이.
                </p>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: MessageCircle,
          title: '코치에게 자유롭게 물어보세요',
          description:
            '"이번 주 뭐부터 할까?", "오답 정리 어떻게 해?", "수능까지 어떻게 준비하지?" 처럼 공부 전반이 막힐 때 물어보세요. 답을 바로 주지 않고 같이 길을 잡아줘요.',
          screenshotCaption: '코치 채팅',
          screenshot: (
            <MockBrowser label="코치와 대화">
              <ul className="space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="bg-pullim-slate-100 text-pullim-slate-700 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold">
                    나
                  </span>
                  <p className="bg-pullim-slate-50 rounded-lg px-2 py-1.5 text-[10px] leading-snug">
                    이번 주 뭐부터 할까?
                  </p>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="bg-pullim-blue-100 text-pullim-blue-700 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-bold">
                    코치
                  </span>
                  <p className="bg-pullim-blue-50 text-pullim-blue-900 rounded-lg px-2 py-1.5 text-[10px] leading-snug">
                    영어 빈칸 추론은 정답률 78%로 정착 단계예요. 수학 미분 부호 변화가 다섯 번째 막혔으니, 비주얼 한 번 보고 적응형 풀이 5문제 권해요.
                  </p>
                </li>
              </ul>
            </MockBrowser>
          ),
        },
        {
          Icon: Puzzle,
          title: '한 문제만 안 풀릴 땐? 풀이 워크스페이스 옆 패널',
          description:
            '"이 문제 막혔어"는 코치가 아니라 무한풀기 풀이 화면 옆 AI 코치 패널이 담당해요. 5단계 힌트로 답을 바로 주지 않고 사고를 끌어줘요.',
          cta: { label: '무한풀기 시작', href: '/q/infinity/solve' },
          screenshotCaption: '풀이 워크스페이스 옆 — 5단계 힌트',
          screenshot: (
            <MockBrowser label="풀이 화면 우측">
              <section className="bg-card rounded-lg border p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="bg-pullim-blue-600 text-white inline-flex h-5 w-5 items-center justify-center rounded">
                    <MessageCircle className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-pullim-slate-900 text-[10px] font-bold">AI 풀이 코치</span>
                </div>
                <ol className="mt-2 grid grid-cols-5 gap-1">
                  {[
                    { lv: 1, reached: true },
                    { lv: 2, reached: true },
                    { lv: 3, current: true },
                    { lv: 4 },
                    { lv: 5, isDanger: true },
                  ].map(s => (
                    <li key={s.lv} className="flex flex-col items-center">
                      <span
                        className={
                          'flex h-5 w-5 items-center justify-center rounded-full font-mono text-[9px] font-bold ' +
                          (s.reached
                            ? 'bg-pullim-blue-600 text-white'
                            : s.current
                              ? 'ring-pullim-blue-400 bg-pullim-blue-100 text-pullim-blue-700 ring-2'
                              : s.isDanger
                                ? 'bg-pullim-warn text-white opacity-50'
                                : 'border border-pullim-slate-200 bg-white text-pullim-slate-400')
                        }
                      >
                        {s.lv}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="text-pullim-slate-500 mt-2 text-[9px] text-center">
                  방향 제시 → 핵심 → 단서 → 거의 정답 → 해설 공개
                </p>
              </section>
            </MockBrowser>
          ),
        },
      ]}
      finalCta={{ label: '풀림 코치 시작하기', href: '/q/talk' }}
    />
  );
}
