'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, ArrowRight, Pause, Sparkles, TrendingUp, Trophy, BarChart3, Check, Target, BookOpen, Timer, Hash, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { quickDiagnostic, solveDeck, subjectLabels } from '@/lib/mock';
import { ProblemDisplay } from '@/components/infinity/problem-display';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/shell/page-header';
import { aiTierMeta } from '@/lib/tokens/tier';
import { cn } from '@/lib/utils';

export default function DiagnoseStartPage() {
  const total = quickDiagnostic.totalQuestions;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [estimatedTheta, setEstimatedTheta] = useState(0.42);
  const [thetaBefore] = useState(0.42);

  const problem = solveDeck[currentIdx % solveDeck.length]!;
  const progress = ((currentIdx) / total) * 100;
  const answered = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([idx, choice]) => {
    const p = solveDeck[Number(idx) % solveDeck.length]!;
    return choice === p.answerIndex;
  }).length;

  function handleSelect(choiceIdx: number) {
    setAnswers(a => ({ ...a, [currentIdx]: choiceIdx }));
    // 데모용: 정답·오답에 따라 theta 미세 조정
    const isCorrect = choiceIdx === problem.answerIndex;
    setEstimatedTheta(t => isCorrect ? Math.min(2.4, t + 0.02) : Math.max(-2.4, t - 0.015));
  }

  function handleNext() {
    if (currentIdx >= total - 1) {
      setCompleted(true);
      toast.success('진단 완료', {
        description: `실력 점수 ${thetaBefore.toFixed(2)} → ${estimatedTheta.toFixed(2)}. 결과 확인 후 약점 페이지로 이동.`,
        duration: 3500,
      });
      return;
    }
    setCurrentIdx(i => i + 1);
  }

  function handlePause() {
    toast.warning('진단 일시정지', {
      description: '진행 상태는 저장돼요. 분석 홈에서 이어할 수 있어요.',
      duration: 2500,
    });
  }

  // 완료 화면 — 실력 변화·약점 요약
  if (completed) {
    const thetaDelta = estimatedTheta - thetaBefore;
    const accuracyPct = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={{ icon: Trophy, text: '진단 완료' }}
          title="실력 점수가 갱신됐어요"
          description={`${total}문항 · 정답률 ${accuracyPct}% · 맞춤 추정`}
        />

        <section className="bg-pullim-blue-50 ring-pullim-blue-200 relative overflow-hidden rounded-2xl ring-2 p-6">
          <p className="text-pullim-blue-700 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <TrendingUp className="h-3 w-3" />
            실력 점수 갱신
          </p>
          <div className="mt-2 flex items-baseline gap-3 font-mono">
            <span className="text-pullim-slate-400 text-2xl">{thetaBefore.toFixed(2)}</span>
            <ArrowRight className="text-pullim-slate-400 h-5 w-5" />
            <span className="text-pullim-blue-700 text-4xl font-bold tracking-tight">{estimatedTheta.toFixed(2)}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', thetaDelta >= 0 ? 'bg-pullim-success-bg text-pullim-success' : 'bg-pullim-danger-bg text-pullim-danger')}>
              {thetaDelta >= 0 ? '+' : ''}{thetaDelta.toFixed(2)}
            </span>
          </div>

          <ul className="mt-5 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <Bullet Icon={Check}     label="정답" value={`${correctCount}/${total}`} />
            <Bullet Icon={BarChart3} label="정답률" value={`${accuracyPct}%`} />
            <Bullet Icon={Target}    label="추정 정확도" value="±0.18" />
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/q/analysis/ability"
              className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              약점·처방 4종 보러가기
            </Link>
            <Link
              href="/q/analysis"
              className="border-pullim-blue-300 text-pullim-blue-700 hover:bg-pullim-blue-100 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              분석 홈
            </Link>
          </div>
        </section>

        <section className="bg-card rounded-2xl border p-4">
          <h3 className="text-pullim-slate-900 mb-2 text-sm font-bold tracking-tight">다음으로 할 것</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">1</span>
              <span className="text-pullim-slate-700"><strong>능력치 페이지</strong>에서 갱신된 실력 점수·등급·단원 정복도 확인</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">2</span>
              <span className="text-pullim-slate-700"><strong>AI 처방 4종</strong> 중 1순위(빨간 배지)부터 시작 — 무한풀기/비주얼/복습 정복/스토어</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">3</span>
              <span className="text-pullim-slate-700"><strong>플래너</strong>가 자동으로 약점 단원에 시간 가중치 +30%를 적용</span>
            </li>
          </ul>
        </section>
      </div>
    );
  }

  // 시작 전 인트로 화면
  if (!started) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow={{ icon: Activity, text: '진단 시작' }}
          title="15문항 맞춤 진단"
          description={`${quickDiagnostic.estimatedMin}분 예상 · 맞춤 난이도 — 정답률에 따라 다음 문제 난이도 자동 조정`}
        />

        <section className="bg-pullim-blue-50 ring-pullim-blue-200 relative overflow-hidden rounded-2xl ring-2 p-6">
          <p className="text-pullim-blue-700 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="h-3 w-3" />
            시작 전 안내
          </p>
          <h2 className="text-pullim-slate-900 mt-1.5 text-xl font-bold tracking-tight xl:text-2xl">
            지금 실력 점수 추정을 더 정확하게 만들어요
          </h2>
          <p className="text-pullim-slate-600 mt-2 text-sm leading-relaxed">{quickDiagnostic.description}</p>

          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
            <Bullet Icon={BookOpen} label="과목" value={quickDiagnostic.subjects.map(s => subjectLabels[s]).join(' · ')} />
            <Bullet Icon={Timer}    label="예상 시간" value={`${quickDiagnostic.estimatedMin}분`} />
            <Bullet Icon={Hash}     label="문항 수" value={`${total}문항`} />
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStarted(true);
                toast.info('진단 시작', { description: '집중 모드로 풀어주세요. 일시정지 가능해요.', duration: 2500 });
              }}
              className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <Activity className="h-4 w-4" />
              시작하기
            </button>
            <Link
              href="/q/analysis"
              className="border-pullim-blue-300 text-pullim-blue-700 hover:bg-pullim-blue-100 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              분석 홈으로
            </Link>
          </div>
        </section>

        {/* 진단의 의미 안내 */}
        <section className="bg-card rounded-2xl border p-4">
          <h3 className="text-pullim-slate-900 mb-2 text-sm font-bold tracking-tight">진단으로 무엇을 얻나요?</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">1</span>
              <span className="text-pullim-slate-700"><strong>실력 점수 갱신</strong> — 과목별 맞춤 추정 + 추정 정확도 상승</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">2</span>
              <span className="text-pullim-slate-700"><strong>처방 4종 자동 생성</strong> — 약점 → 무한풀기/복습/비주얼/스토어</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-pullim-blue-50 text-pullim-blue-700 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">3</span>
              <span className="text-pullim-slate-700"><strong>플래너 재최적화</strong> — 약한 단원에 시간 가중 배분</span>
            </li>
          </ul>
        </section>
      </div>
    );
  }

  // 진단 진행 화면
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Activity, text: '진단 진행 중' }}
        title={`문항 ${currentIdx + 1} / ${total}`}
        description={`맞춤 진단 — 다음 문제는 답에 따라 자동 선정 · 진행률 ${Math.round(progress)}%`}
        action={
          <button
            type="button"
            onClick={handlePause}
            className="bg-pullim-slate-100 hover:bg-pullim-slate-200 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold"
          >
            <Pause className="h-3.5 w-3.5" />
            일시정지
          </button>
        }
      />

      {/* 진행 + 미니 KPI */}
      <section className="bg-card rounded-2xl border p-3.5">
        <div className="flex items-center gap-3">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-pullim-slate-700 font-mono text-sm font-bold">{currentIdx + 1}/{total}</span>
        </div>
        <div className="text-pullim-slate-500 mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div className="bg-pullim-slate-50 rounded-lg px-2 py-1.5">
            <div className="text-[9px] font-bold tracking-wider uppercase">현재 응답</div>
            <div className="text-pullim-slate-900 font-mono text-sm font-bold">{answered}건</div>
          </div>
          <div className="bg-pullim-slate-50 rounded-lg px-2 py-1.5">
            <div className="text-[9px] font-bold tracking-wider uppercase">실력 점수 (실시간)</div>
            <div className="text-pullim-blue-600 font-mono text-sm font-bold">+{estimatedTheta.toFixed(2)}</div>
          </div>
          <div className="bg-pullim-slate-50 rounded-lg px-2 py-1.5">
            <div className="text-[9px] font-bold tracking-wider uppercase">추정 모델</div>
            <div className="font-mono text-sm font-bold" style={{ color: aiTierMeta.T2.color }}>T2 맞춤</div>
          </div>
        </div>
      </section>

      {/* 문제 표시 */}
      <ProblemDisplay
        problem={problem}
        index={currentIdx}
        total={total}
        selected={answers[currentIdx]}
        onSelect={handleSelect}
        examMode={false}
      />

      {/* 액션 */}
      <div className="bg-card flex items-center justify-between rounded-xl border p-2.5">
        <span className="text-pullim-slate-500 text-[11px]">
          {answers[currentIdx] !== undefined ? (
            <span className="text-pullim-success inline-flex items-center gap-1 font-semibold">
              <Check className="h-3 w-3" aria-hidden />
              응답 저장됨
            </span>
          ) : (
            '한 선지를 선택해주세요'
          )}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={answers[currentIdx] === undefined}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-all',
            answers[currentIdx] !== undefined
              ? 'bg-pullim-blue-600 text-white hover:bg-pullim-blue-700'
              : 'bg-pullim-slate-100 text-pullim-slate-400 cursor-not-allowed',
          )}
        >
          {currentIdx >= total - 1 ? (
            <>
              <TrendingUp className="h-3.5 w-3.5" />
              결과 리포트 보기
            </>
          ) : (
            <>
              다음 문항
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Bullet({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="bg-pullim-blue-100/60 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5">
        <Icon className="text-pullim-blue-600 h-3.5 w-3.5" />
        <span className="text-pullim-blue-700 text-[10px] font-bold tracking-wider uppercase">{label}</span>
      </div>
      <div className="text-pullim-slate-900 mt-0.5 text-sm font-bold">{value}</div>
    </li>
  );
}
