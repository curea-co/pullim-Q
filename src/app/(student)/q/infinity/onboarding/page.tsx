'use client';

import { useState } from 'react';
import { Infinity, Lightbulb, Eye, Sparkles, Star, SlidersHorizontal, Bot, Timer, BookOpen, BarChart3 } from 'lucide-react';
import { OnboardingTemplate } from '@/components/shell/onboarding-template';
import { MockBrowser } from '@/components/shell/mock-browser';
import { ModeToggle } from '@/components/infinity/mode-toggle';
import type { SolveMode } from '@/lib/mock';

export default function InfinityOnboardingPage() {
  return <Inner />;
}

function Inner() {
  const [mode, setMode] = useState<SolveMode>('practice');

  return (
    <OnboardingTemplate
      featureName="풀림 무한풀기"
      Icon={Infinity}
      identity="내 수준에 맞춘 문제부터 실전 모의고사까지. 한 문제 풀면 12-섹션 깊이 해설로 끝까지 짚어줘요."
      estimatedMin={6}
      steps={[
        {
          Icon: SlidersHorizontal,
          title: '연습 vs 시험 모드 토글',
          description:
            '풀이 워크스페이스 상단에서 두 모드 전환. 연습은 AI 코치 + 5단계 힌트 상시, 시험은 OMR + 타이머 + AI 코치 차단.',
          bullets: [
            '연습: 정답 즉시 공개·해설 즉시·일시정지 자유',
            '시험: 일시정지 불가·해설 차단·AI 감독관 모니터링',
          ],
          cta: { label: '풀이 워크스페이스 열기', href: '/q/infinity/solve' },
          screenshotCaption: '실제 모드 토글 (눌러보세요)',
          screenshot: (
            <MockBrowser label="모드 전환">
              <ModeToggle
                mode={mode}
                onChange={setMode}
                onRequestExam={() => setMode('exam')}
                examInProgress={false}
              />
            </MockBrowser>
          ),
        },
        {
          Icon: Bot,
          title: '연습 모드: AI 코치 + 5단계 힌트',
          description:
            '"도와줘" 버튼을 누를 때마다 힌트 단계가 올라가요. 1단계(방향 제시) → 5단계(해설 공개). 5단계 보면 점수 가중치 ↓ — 공정성.',
          screenshotCaption: 'AI 코치 패널 (5단계 힌트 + 풀림 해설 진입)',
          screenshot: (
            <MockBrowser label="AI 풀이 코치">
              <section className="bg-card rounded-lg p-3 space-y-2">
                <header className="flex items-center gap-1.5">
                  <span className="bg-pullim-blue-600 flex h-6 w-6 items-center justify-center rounded-md text-white">
                    <Sparkles className="h-3 w-3" />
                  </span>
                  <span className="text-pullim-slate-900 text-xs font-bold">풀림 튜터 — Scope L3</span>
                  <span className="bg-pullim-blue-100 text-pullim-blue-700 ml-auto rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold">T2 · Fast</span>
                </header>
                <div className="grid grid-cols-2 gap-1.5">
                  <button className="bg-pullim-blue-50 text-pullim-blue-700 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold">
                    <Lightbulb className="h-3 w-3" />
                    힌트 받기 (2/5)
                  </button>
                  <button className="bg-pullim-warn-bg text-pullim-warn inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold">
                    <Eye className="h-3 w-3" />
                    풀림 해설
                  </button>
                </div>
                <div className="bg-pullim-slate-50 rounded-md p-2 text-[10px] leading-relaxed text-pullim-slate-700">
                  <strong className="text-pullim-blue-700">힌트 1.</strong> 극값을 찾으려면 도함수 부호 변화를 봐야 해요. f′(x)부터 구해볼래?
                </div>
              </section>
            </MockBrowser>
          ),
        },
        {
          Icon: Timer,
          title: '시험 모드: OMR 답안지 + 빨간 타이머',
          description:
            '실전 모의고사 환경. 좌측은 문제, 우측은 OMR. Shift+클릭으로 표식. 큰 빨간 타이머가 일시정지 불가.',
          bullets: ['시험 세트 3종: 평가원 기출 / AI 맞춤 / 강사 수제'],
          screenshotCaption: '시험 모드 OMR + 타이머',
          screenshot: (
            <MockBrowser dark label="시험 진행 중">
              <div className="space-y-2">
                {/* 빨간 타이머 */}
                <div className="bg-pullim-slate-900 rounded-md p-2.5 text-white">
                  <div className="flex items-baseline gap-2">
                    <span className="text-pullim-warn text-[9px] font-bold tracking-wider uppercase">
                      남은 시간
                    </span>
                    <span className="text-pullim-danger font-mono text-2xl font-bold tabular-nums tracking-tight animate-pulse">
                      04:23
                    </span>
                  </div>
                  <div className="text-pullim-slate-400 mt-1 inline-flex items-center gap-1 text-[9px]">
                    <span className="bg-pullim-danger inline-block h-1 w-1 animate-pulse rounded-full" />
                    AI 감독관 모니터링 중 · 탭 이탈 0건
                  </div>
                </div>
                {/* 미니 OMR */}
                <div className="bg-pullim-slate-900 rounded-md p-2 text-white">
                  <div className="text-[9px] font-bold mb-1.5">OMR · 11/30 마킹</div>
                  {[1, 2, 3].map(n => (
                    <div key={n} className="flex items-center gap-1.5 py-0.5">
                      <span className="text-pullim-slate-400 w-5 font-mono text-[10px]">{n}.</span>
                      {[0, 1, 2, 3, 4].map(c => (
                        <span
                          key={c}
                          className={
                            (c === (n - 1)
                              ? 'bg-white text-pullim-slate-900'
                              : 'border border-pullim-slate-600 text-pullim-slate-500') +
                            ' flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px]'
                          }
                        >
                          {c === (n - 1) ? ['①','②','③','④','⑤'][c] : c + 1}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </MockBrowser>
          ),
        },
        {
          Icon: BookOpen,
          title: '풀림 해설 12-섹션 — 시그니처',
          description:
            '한 문제당 12개 인터랙티브 섹션. Hero·Prologue·**4-Path 풀이**·Root Graph·Error Anatomy·**100명의 선택**·Visual·Pattern Family·Feynman·**Teacher Voices**·History+Real·Memory Anchor.',
          signature: true,
          cta: { label: '풀림 해설 라이브러리', href: '/q/infinity/explain' },
          screenshotCaption: '4-Path 풀이 — 같은 답, 4개 경로',
          screenshot: (
            <MockBrowser label="풀림 해설 §3">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { tag: '정석', recommended: true, success: 78 },
                  { tag: '기하직관', recommended: false, success: 65 },
                  { tag: '좌표', recommended: false, success: 41 },
                  { tag: '심화', recommended: false, success: 28 },
                ].map(p => (
                  <div
                    key={p.tag}
                    className={
                      'rounded-lg border p-2 ' +
                      (p.recommended
                        ? 'border-pullim-warn ring-pullim-warn/30 bg-pullim-warn/5 ring-2'
                        : 'border-pullim-slate-200 bg-pullim-slate-50/50')
                    }
                  >
                    <div className="flex items-center gap-1">
                      <span className="bg-pullim-slate-900 rounded px-1 py-0.5 font-mono text-[8px] font-bold text-white">
                        {p.tag}
                      </span>
                      {p.recommended && (
                        <span className="bg-pullim-warn inline-flex items-center justify-center rounded-full px-1 py-0.5 text-white">
                          <Star className="h-2 w-2 fill-current" aria-hidden />
                        </span>
                      )}
                    </div>
                    <div className="text-pullim-slate-700 mt-1 text-[10px] font-semibold">
                      이 경로 정답률 {p.success}%
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-pullim-slate-500 mt-2 text-[10px] text-center">
                + 100명의 선택 · Teacher Voices 3톤 · Memory Anchor 등
              </p>
            </MockBrowser>
          ),
        },
        {
          Icon: BarChart3,
          title: '시험 결과 + 풀이 이력으로 돌아보기',
          description:
            '시험 제출 후 즉시 채점 + 오답 클러스터(패턴별) + 다음 액션 카드. 이력 탭에선 풀어본 문제 검색·필터·북마크.',
          screenshotCaption: '주황 그라데이션 결과 hero',
          screenshot: (
            <MockBrowser label="시험 결과">
              <section className="from-pullim-warn to-pullim-warn/80 rounded-xl bg-gradient-to-br p-3 text-white">
                <div className="text-white/80 text-[9px] font-bold tracking-wider uppercase">
                  원점수
                </div>
                <div className="font-mono text-3xl font-bold leading-none tracking-tight">
                  73<span className="text-base text-white/70">/100</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  예상 등급 <span className="font-mono">3등급</span>
                </div>
                <div className="border-white/20 mt-2 flex items-center gap-2 border-t pt-2 text-[9px]">
                  <Star className="h-3 w-3" />
                  <span>실력 점수 0.35 → 0.42 (+0.07)</span>
                </div>
              </section>
              <p className="text-pullim-slate-500 mt-2 text-[10px]">
                + 오답 클러스터(패턴별) + 다음 액션 카드 3개
              </p>
            </MockBrowser>
          ),
        },
      ]}
      finalCta={{ label: '지금 풀러 가기', href: '/q/infinity/solve' }}
    />
  );
}
