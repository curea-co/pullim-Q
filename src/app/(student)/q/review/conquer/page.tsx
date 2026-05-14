'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Target, ArrowRight, ArrowLeft, Trophy, Flame, Check, X as XIcon, AlertTriangle,
  TrendingUp, BarChart3, Sparkles, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { todayConquestSet, errorPatterns, solveDeck } from '@/lib/mock';
import { ProblemDisplay } from '@/components/infinity/problem-display';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * 정복 세트 풀이 — 다크 테마 워크룸.
 * 3회 연속 정답 시 정복 스탬프.
 */
export default function ConquerSetPage() {
  const set = todayConquestSet;
  const pattern = errorPatterns.find(p => p.id === set.patternId)!;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState(0);
  const [conquered, setConquered] = useState(false);
  const [setComplete, setSetComplete] = useState(false);

  const problem = solveDeck[currentIdx % solveDeck.length]!;
  const answered = answers[currentIdx] !== undefined;
  const isCorrect = answered && answers[currentIdx] === problem.answerIndex;
  const isWrong   = answered && answers[currentIdx] !== problem.answerIndex;

  const progress = ((currentIdx) / set.totalQuestions) * 100;

  function handleSelect(choiceIdx: number) {
    if (answered) return;
    setAnswers(a => ({ ...a, [currentIdx]: choiceIdx }));
    const correct = choiceIdx === problem.answerIndex;
    setStreak(s => correct ? s + 1 : 0);

    setTimeout(() => {
      if (correct) {
        if (streak + 1 >= set.conquestThreshold) {
          setConquered(true);
          toast.success('🏆 패턴 정복!', {
            description: `${set.conquestThreshold}회 연속 정답 — 정복 스탬프 획득. 마스터 갤러리에 추가됐어요.`,
            duration: 4000,
          });
        } else {
          toast.success('정답!', {
            description: `연속 ${streak + 1}회 — ${set.conquestThreshold - streak - 1}회 더 맞히면 정복`,
            duration: 1800,
          });
        }
      } else {
        toast.error('아쉬워요', {
          description: '연속 카운트가 0으로 리셋. 풀이 분석을 보고 다시 도전해봐요.',
          duration: 2500,
        });
      }
    }, 200);
  }

  function handleNext() {
    if (currentIdx >= set.totalQuestions - 1) {
      setSetComplete(true);
      toast.info('정복 세트 완료', {
        description: `최종 연속 ${streak}회. 분석·복습이 자동 갱신됐어요.`,
        duration: 3000,
      });
      return;
    }
    setCurrentIdx(i => i + 1);
  }

  // 세트 완료 — 갱신 시각화 화면
  if (setComplete) {
    const masteryBefore = 30;
    const masteryAfter = conquered ? 65 : 45;
    const masteryDelta = masteryAfter - masteryBefore;
    const correctTotal = Object.entries(answers).filter(([idx, choice]) => {
      const p = solveDeck[Number(idx) % solveDeck.length]!;
      return choice === p.answerIndex;
    }).length;

    return (
      <div className="space-y-section">
        <header className="bg-pullim-blue-50 ring-pullim-blue-200 relative overflow-hidden rounded-2xl ring-2 p-6">
          <div className="text-pullim-blue-700 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
            {conquered ? <><Trophy className="h-3 w-3" /> 패턴 정복!</> : <><Sparkles className="h-3 w-3" /> 세트 완료</>}
          </div>
          <h1 className="text-pullim-slate-900 mt-1 text-2xl font-bold tracking-tight">{set.patternName}</h1>
          <p className="text-pullim-slate-600 mt-1 text-sm">
            {correctTotal}/{set.totalQuestions} 정답 · 최종 연속 {streak}회
          </p>

          <section className="bg-card mt-5 rounded-xl border p-4">
            <div className="text-pullim-blue-700 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <TrendingUp className="h-3 w-3" />
              정복도 갱신
            </div>
            <div className="mt-2 flex items-baseline gap-3 font-mono">
              <span className="text-pullim-slate-400 text-2xl">{masteryBefore}%</span>
              <ArrowRight className="text-pullim-slate-400 h-5 w-5" />
              <span className="text-pullim-blue-700 text-4xl font-bold tracking-tight">{masteryAfter}%</span>
              <span className="bg-pullim-success-bg text-pullim-success rounded-full px-2 py-0.5 text-xs font-bold">
                +{masteryDelta}p
              </span>
            </div>
            <p className="text-pullim-slate-600 mt-2 text-[11px]">
              풀림 분석의 약점 카드에 즉시 반영. 다음 진단 시 정확도 ±0.05 → ±0.03으로 정밀해져요.
            </p>
          </section>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/q/analysis/ability"
              className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              분석에서 갱신 확인
            </Link>
            <Link
              href="/q/review"
              className="border-pullim-blue-300 text-pullim-blue-700 hover:bg-pullim-blue-100 inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              복습 홈으로
            </Link>
          </div>
        </header>

        <section className="bg-card rounded-2xl border p-4">
          <h3 className="text-pullim-slate-900 mb-2 text-sm font-bold">자동으로 일어난 일</h3>
          <ul className="space-y-1.5 text-[11px]">
            <li className="text-pullim-slate-700 flex items-center gap-2">
              <Check className="text-pullim-success h-3 w-3 shrink-0" />
              <span>풀림 <strong>분석</strong>의 약점 단원 mastery {masteryBefore}% → {masteryAfter}% 갱신</span>
            </li>
            <li className="text-pullim-slate-700 flex items-center gap-2">
              <Check className="text-pullim-success h-3 w-3 shrink-0" />
              <span>풀림 <strong>복습</strong> Leitner 박스 +1 승급 (1박스 → 2박스)</span>
            </li>
            <li className="text-pullim-slate-700 flex items-center gap-2">
              <Check className="text-pullim-success h-3 w-3 shrink-0" />
              <span>풀림 <strong>플래너</strong>가 다음 주 이 패턴 시간 가중치 -10% 자동 조정</span>
            </li>
            {conquered && (
              <li className="text-pullim-slate-700 flex items-center gap-2">
                <Trophy className="text-pullim-warn h-3 w-3 shrink-0" />
                <span>정복 스탬프 +1 (마스터 갤러리에 추가)</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 정복 워크룸 헤더 — 라이트 통일 (Layer 1 단일 톤 룰) */}
      <header className="bg-card relative overflow-hidden rounded-2xl border p-5">
        <Link
          href="/q/review"
          className="text-pullim-slate-500 hover:text-pullim-blue-600 mb-2 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="h-3 w-3" />
          복습 홈으로
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
          <span className="bg-pullim-danger-bg text-pullim-danger inline-flex items-center gap-1 rounded-full px-2 py-0.5">
            <Target className="h-2.5 w-2.5" />
            정복 세트
          </span>
          <span className="text-pullim-slate-400 font-mono">{pattern.code}</span>
        </div>

        <h1 className="text-pullim-slate-900 mt-1.5 text-xl font-bold tracking-tight">{set.patternName}</h1>
        <p className="text-pullim-slate-600 mt-1 text-xs leading-relaxed inline-flex items-baseline gap-1">
          <Lightbulb className="text-pullim-warn h-3 w-3 shrink-0 translate-y-0.5" />
          <span>{set.patternRoot}</span>
        </p>

        {/* 진행 + streak */}
        <div className="border-pullim-slate-200 mt-4 grid grid-cols-3 gap-3 border-t pt-3">
          <Stat label="진행" value={`${currentIdx + 1}/${set.totalQuestions}`} sub="문항" />
          <Stat
            label="연속 정답"
            value={`${streak}회`}
            sub={`정복까지 ${Math.max(0, set.conquestThreshold - streak)}회`}
            tone="lemon"
          />
          <Stat label="이번 주 시도" value={`${set.attemptsToday}회`} sub="이 패턴" />
        </div>

        {conquered && (
          <div className="bg-pullim-lemon text-pullim-lemon-ink mt-3 flex items-center gap-2 rounded-xl p-3 text-sm font-bold">
            <Trophy className="h-4 w-4" />
            패턴 정복 완료 — 마스터 갤러리에 스탬프 추가됨
          </div>
        )}
      </header>

      {/* 진행 바 */}
      <Progress value={progress} className="h-1.5" />

      {/* 문제 — 다크 톤 컨테이너 */}
      <ProblemDisplay
        problem={problem}
        index={currentIdx}
        total={set.totalQuestions}
        selected={answers[currentIdx]}
        onSelect={handleSelect}
        examMode={false}
      />

      {/* 즉시 채점 결과 */}
      {answered && (
        <section
          className={cn(
            'rounded-xl border-2 p-3.5',
            isCorrect ? 'border-pullim-success bg-pullim-success-bg' : 'border-pullim-danger bg-pullim-danger-bg',
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-white',
                isCorrect ? 'bg-pullim-success' : 'bg-pullim-danger',
              )}
            >
              {isCorrect ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
            </span>
            <div className="flex-1">
              <h3 className={cn('text-sm font-bold', isCorrect ? 'text-pullim-success' : 'text-pullim-danger')}>
                {isCorrect ? '정답!' : '아쉬워요'}
              </h3>
              <p className="text-pullim-slate-700 mt-0.5 text-xs">
                {isCorrect ? '연속 카운트 +1' : '연속 카운트 리셋 — 0회'}
                <span className="mx-1">·</span>
                정답: <span className="font-mono font-bold">{['①','②','③','④','⑤'][problem.answerIndex]}</span>
              </p>
            </div>
          </div>
          <p className="text-pullim-slate-700 mt-2 text-xs leading-relaxed bg-white rounded-md p-2">
            <strong>한 줄 해설:</strong> {problem.shortExplanation}
          </p>
        </section>
      )}

      {/* 다음 액션 */}
      <div className="bg-card flex items-center justify-between rounded-xl border p-2.5">
        <span className="text-pullim-slate-500 inline-flex items-center gap-1 text-[11px]">
          <Flame className="text-pullim-warn h-3 w-3" />
          연속 <strong className="text-pullim-slate-900 font-mono">{streak}</strong>회
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!answered}
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-all',
            answered
              ? isWrong
                ? 'bg-pullim-warn text-white hover:bg-pullim-warn/90'
                : 'bg-pullim-lemon text-pullim-lemon-ink hover:bg-pullim-lemon/90'
              : 'bg-pullim-slate-100 text-pullim-slate-400 cursor-not-allowed',
          )}
        >
          {currentIdx >= set.totalQuestions - 1 ? (
            <>
              <Trophy className="h-3.5 w-3.5" />
              세트 종료
            </>
          ) : isWrong ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5" />
              다시 도전 (다음 문항)
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

function Stat({
  label, value, sub, tone,
}: {
  label: string; value: string; sub?: string; tone?: 'lemon';
}) {
  const valueClass = tone === 'lemon' ? 'text-pullim-lemon-ink' : 'text-pullim-slate-900';
  return (
    <div>
      <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">{label}</div>
      <div className={`mt-0.5 font-mono text-base font-bold ${valueClass}`}>{value}</div>
      {sub && <div className="text-pullim-slate-400 text-[10px]">{sub}</div>}
    </div>
  );
}
