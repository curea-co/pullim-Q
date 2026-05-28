'use client';

import { Bookmark, Flag } from 'lucide-react';
import { type SolveProblem, difficultyLabel, difficultyLevel, subjectLabels } from '@/lib/mock';
import { cn } from '@/lib/utils';

type Props = {
  problem: SolveProblem;
  index: number;
  total: number;
  selected?: number;
  onSelect: (idx: number) => void;
  /** 시험 모드: 정답 비공개·표식 가능 */
  examMode: boolean;
  marked?: boolean;
  onToggleMark?: () => void;
  /** 채점 후 정답 reveal (연습 모드). 시험 모드에서는 무시. */
  correctAnswer?: number;
  revealed?: boolean;
};

/**
 * 문제 표시 — 페이퍼 텍스처 (튜터 ProblemPaper 변형).
 * 시험 모드에서는 표식(Shift+클릭) 활성화, 정답 비공개.
 */
export function ProblemDisplay({
  problem, index, total, selected, onSelect, examMode, marked, onToggleMark,
  correctAnswer, revealed,
}: Props) {
  const lvl = difficultyLevel(problem.difficulty);
  // 연습 모드 정답 reveal (M1/M2 모션, spec §10.3)
  const showReveal = !examMode && revealed && typeof correctAnswer === 'number';
  const selectedIsCorrect = showReveal && selected === correctAnswer;
  const selectedIsWrong = showReveal && typeof selected === 'number' && selected !== correctAnswer;

  return (
    <article
      className="border-pullim-slate-200 bg-card relative overflow-hidden rounded-xl border shadow-pullim-sm"
      style={{
        backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, rgba(59, 111, 246, 0.06) 27px, rgba(59, 111, 246, 0.06) 28px)`,
      }}
    >
      <div aria-hidden className="absolute top-0 bottom-0 left-7 w-px bg-pullim-danger/40" />

      <div className="px-5 py-4 pl-10">
        {/* 메타 */}
        <header className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-wider uppercase">
          <span className="bg-pullim-slate-900 rounded px-1.5 py-0.5 font-mono text-white">
            {problem.sku}
          </span>
          <span className="text-pullim-slate-500">{problem.unit}</span>
          <span className="text-pullim-slate-300">·</span>
          <span className="text-pullim-slate-500">{subjectLabels[problem.subject]}</span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="text-pullim-slate-500 font-mono text-[10px]">
              {index + 1}/{total}
            </span>
            <span className="text-pullim-slate-300">·</span>
            <span
              className="inline-flex items-center gap-1 text-pullim-slate-600"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: `var(--color-pullim-lvl-${lvl})` }}
              />
              {difficultyLabel[lvl]}
            </span>
            {examMode && onToggleMark && (
              <button
                type="button"
                onClick={onToggleMark}
                aria-pressed={marked}
                aria-label={marked ? '표식 해제' : '표식 추가'}
                className={cn(
                  'ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors',
                  marked
                    ? 'bg-pullim-warn text-white'
                    : 'bg-pullim-slate-100 text-pullim-slate-500 hover:bg-pullim-slate-200',
                )}
              >
                <Flag className="h-3 w-3" />
              </button>
            )}
            {!examMode && (
              <button
                type="button"
                aria-label="북마크"
                className="text-pullim-slate-400 hover:text-pullim-blue-500 ml-1 inline-flex h-6 w-6 items-center justify-center"
              >
                <Bookmark className="h-3.5 w-3.5" />
              </button>
            )}
          </span>
        </header>

        {/* 발문 */}
        <p className="text-pullim-slate-900 mt-3 text-sm leading-7 font-medium">
          {problem.statement}
        </p>

        {/* 5지 선다 */}
        <ol className="mt-3 space-y-1.5">
          {problem.choices.map((c, i) => {
            const isSelected = selected === i;
            // reveal 상태
            const isCorrectAnswer = showReveal && i === correctAnswer;
            const animateOnSelf =
              showReveal && isSelected
                ? selectedIsCorrect
                  ? 'animate-correct-pop'
                  : 'animate-shake-x'
                : '';
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  disabled={showReveal}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition-colors',
                    animateOnSelf,
                    showReveal
                      ? isCorrectAnswer
                        ? 'border-pullim-success-fg bg-pullim-success-bg border-[3px] font-semibold'
                        : isSelected && selectedIsWrong
                          ? 'border-pullim-danger-fg bg-pullim-danger-bg/40 text-pullim-danger-fg border-2 font-semibold'
                          : 'text-pullim-slate-600'
                      : isSelected
                        ? examMode
                          ? 'bg-pullim-warn/15 text-pullim-warn font-semibold'
                          : 'bg-pullim-blue-50 text-pullim-blue-900 font-semibold'
                        : 'text-pullim-slate-800 hover:bg-pullim-slate-50',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
                      showReveal
                        ? isCorrectAnswer
                          ? 'bg-pullim-success-fg text-white'
                          : isSelected && selectedIsWrong
                            ? 'bg-pullim-danger-fg text-white'
                            : 'border border-pullim-slate-300 text-pullim-slate-500'
                        : isSelected
                          ? examMode
                            ? 'bg-pullim-warn text-white'
                            : 'bg-pullim-blue-600 text-white'
                          : 'border border-pullim-slate-300 text-pullim-slate-600',
                    )}
                  >
                    {['①', '②', '③', '④', '⑤'][i]}
                  </span>
                  <span>{c}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}
