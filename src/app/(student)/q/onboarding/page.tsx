import {
  BookOpen,
  Library,
  BarChart3,
  MessageCircle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { OnboardingTemplate } from '@/components/shell/onboarding-template';
import { MockBrowser } from '@/components/shell/mock-browser';

export default function QOnboardingPage() {
  return (
    <OnboardingTemplate
      featureName="풀림 Q"
      Icon={BookOpen}
      identity="문제 풀고, 막히면 묻고, 오답은 자동으로 복습. 시험 준비에 필요한 게 한 곳에 모여 있어요."
      estimatedMin={4}
      steps={[
        {
          Icon: BookOpen,
          title: '한 문제를 12섹션으로 깊게 풀어드려요',
          description:
            '다른 문제집은 답 + 짧은 풀이로 끝. 풀림은 한 문제마다 4가지 풀이법, 같은 문제 푼 친구들의 선택 분포, 선생님 3명의 다른 톤 해설까지 — 한 문제를 끝까지 짚어줘요.',
          signature: true,
          bullets: [
            '연습 모드 — 막히면 5단계 힌트 (답을 바로 알려주지 않아요)',
            '시험 모드 — 모의고사처럼 OMR · 타이머 · 부정행위 자동 감지',
            '풀고 나면 풀림 해설 12섹션이 자동으로 열려요',
          ],
          cta: { label: '문제 풀러 가기', href: '/q/infinity' },
          screenshotCaption: '연습 모드 + 풀림 해설 12섹션',
          screenshot: (
            <MockBrowser label="문제 풀이 화면">
              <section className="space-y-2">
                <div className="bg-pullim-slate-50 grid grid-cols-2 rounded-lg p-1">
                  <div className="bg-card text-pullim-blue-700 rounded-md px-2 py-1.5 text-center text-[11px] font-bold shadow-sm">
                    연습 모드
                  </div>
                  <div className="text-pullim-slate-500 px-2 py-1.5 text-center text-[11px] font-semibold">
                    시험 모드
                  </div>
                </div>
                <div className="bg-pullim-warn-bg flex items-center gap-2 rounded-md p-2">
                  <span className="bg-pullim-warn flex h-6 w-6 items-center justify-center rounded text-white shrink-0">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
                      풀림 해설
                    </div>
                    <div className="text-pullim-slate-900 truncate text-[11px] font-bold">
                      답이 아니라 풀이 과정 12섹션
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  {['4가지 풀이법', '친구들의 선택', '선생님 3톤'].map(t => (
                    <div
                      key={t}
                      className="bg-pullim-slate-100 text-pullim-slate-700 rounded px-1 py-1 text-[10px] font-semibold"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: Library,
          title: '오답노트, 더 이상 직접 안 써도 돼요',
          description:
            '수기 오답노트 한 번도 끝까지 채워본 적 없죠. 풀림은 틀린 문제를 1일 → 3일 → 7일 → 14일 → 30일 간격으로 자동 다시 보여줘요. 까먹기 직전에 만나니까 외우는 것보다 훨씬 오래 남아요.',
          bullets: [
            '망각 곡선에 맞춘 5단계 자동 스케줄',
            '맞으면 다음 단계, 틀리면 1일 단계로 다시',
            '5단계까지 끝내면 ‘마스터’ 도장 — 더 이상 안 잊어버려요',
          ],
          cta: { label: '복습 보러 가기', href: '/q/review' },
          screenshotCaption: '1일에서 30일까지, 5단계 자동 복습',
          screenshot: (
            <MockBrowser dark label="오답 자동 복습">
              <section className="space-y-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { b: 1, count: 12, tag: '1일',  fill: 'bg-pullim-danger' },
                    { b: 2, count: 8,  tag: '3일',  fill: 'bg-pullim-warn' },
                    { b: 3, count: 5,  tag: '7일',  fill: 'bg-pullim-blue-400' },
                    { b: 4, count: 3,  tag: '14일', fill: 'bg-pullim-blue-600' },
                    { b: 5, count: 2,  tag: '30일', fill: 'bg-pullim-lemon', master: true },
                  ].map(({ b, count, tag, fill, master }) => (
                    <div
                      key={b}
                      className="bg-pullim-slate-900 ring-pullim-slate-800 flex flex-col items-center rounded-md p-1.5 text-center ring-1"
                    >
                      <div
                        className={`${fill} flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold ${master ? 'text-pullim-lemon-ink' : 'text-white'}`}
                      >
                        {master ? <Trophy className="h-3.5 w-3.5" /> : b}
                      </div>
                      <div className="mt-1 font-mono text-base font-bold text-white">{count}</div>
                      <div className="text-pullim-slate-400 text-[9px]">{tag}</div>
                    </div>
                  ))}
                </div>
                <div className="text-pullim-slate-400 flex items-center justify-center gap-2 text-[10px]">
                  <span><span className="text-pullim-success">맞으면</span> 다음 단계</span>
                  <span>·</span>
                  <span><span className="text-pullim-danger">틀리면</span> 1일로</span>
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: BarChart3,
          title: '내가 진짜 늘고 있는지, 그래프로 보여드려요',
          description:
            '한 시험 점수에 흔들릴 필요 없어요. 매주 풀이 데이터로 실력 점수가 갱신되니까, 한 달 뒤엔 진짜 변화가 보여요. 약한 단원은 색깔 지도로 한눈에.',
          bullets: [
            '12주 실력 추이 — 시험 한 번에 흔들리지 않는 안정 지표',
            '단원별 색깔 지도 — 약한 곳이 한눈에',
            '약점 단원은 자동으로 복습 블록까지 만들어줘요',
          ],
          cta: { label: '내 실력 보기', href: '/q/analysis' },
          screenshotCaption: '12주 동안 변화한 내 실력',
          screenshot: (
            <MockBrowser label="내 실력 그래프">
              <section className="bg-card rounded-lg p-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
                      내 실력 점수
                    </div>
                    <div className="text-pullim-slate-900 mt-0.5 font-mono text-2xl font-bold tabular-nums">
                      1.32
                    </div>
                  </div>
                  <div className="text-pullim-success text-[11px] font-bold">
                    +0.07 / 주
                  </div>
                </div>
                <svg viewBox="0 0 120 40" className="mt-2 w-full" aria-hidden>
                  <line x1="0" y1="12" x2="120" y2="12" strokeDasharray="2 2" className="stroke-pullim-warn/50" />
                  <text x="118" y="10" className="fill-pullim-warn font-mono text-[7px]" textAnchor="end">
                    수능 1등급 수준
                  </text>
                  <polyline
                    fill="none"
                    strokeWidth="2"
                    className="stroke-pullim-blue-500"
                    points="0,32 15,30 30,27 45,24 60,22 75,20 90,18 105,16 120,15"
                  />
                  <circle cx="120" cy="15" r="2.5" className="fill-pullim-blue-600" />
                </svg>
                <div className="text-pullim-slate-500 mt-1.5 text-[10px] text-center">
                  최근 12주 — 꾸준히 오르는 중
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: MessageCircle,
          title: '막힐 땐 AI가 옆에 있어요',
          description:
            '이 한 문제가 안 풀릴 땐 튜터에게, 이번 주 뭐부터 할지 막막할 땐 코치에게. 둘 다 답을 바로 알려주지 않고 스스로 답에 닿게 도와줘요.',
          bullets: [
            '튜터 — 한 문제 옆에서 5단계 힌트로 끌어줘요',
            '코치 — 공부 전반, 약점 처방과 계획까지',
          ],
          cta: { label: 'AI에게 물어보기', href: '/q/talk' },
          screenshotCaption: '튜터(한 문제) · 코치(공부 전반)',
          screenshot: (
            <MockBrowser label="AI에게 물어보기">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-pullim-slate-100 rounded-lg p-2.5">
                  <div className="text-pullim-slate-700 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                    <MessageCircle className="h-3 w-3" />
                    튜터
                  </div>
                  <div className="text-pullim-slate-900 mt-1 text-[11px] font-bold">
                    이 한 문제만 안 풀릴 때
                  </div>
                  <div className="text-pullim-slate-500 mt-1 text-[10px] leading-snug">
                    답을 바로 안 줘요.
                    <br />5단계 힌트로 끌어줘요.
                  </div>
                </div>
                <div className="bg-pullim-blue-50 rounded-lg p-2.5">
                  <div className="text-pullim-blue-700 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3" />
                    코치
                  </div>
                  <div className="text-pullim-blue-900 mt-1 text-[11px] font-bold">
                    공부 전반이 막힐 때
                  </div>
                  <div className="text-pullim-slate-600 mt-1 text-[10px] leading-snug">
                    “이번 주 뭐부터 할까?”
                    <br />“오답 정리 어떻게 해?”
                  </div>
                </div>
              </div>
              <p className="text-pullim-slate-400 mt-2 text-center text-[10px]">
                문제 풀다 막히면 옆 패널에서 바로 호출할 수 있어요
              </p>
            </MockBrowser>
          ),
        },
      ]}
      finalCta={{ label: '풀림 Q 시작하기', href: '/q' }}
    />
  );
}
