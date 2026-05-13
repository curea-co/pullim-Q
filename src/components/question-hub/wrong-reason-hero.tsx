import { AlertTriangle, Compass } from 'lucide-react';
import {
  pickPrimaryReasons,
  wrongReasonCatalog,
  type WrongAttemptDiagnosis,
  type WrongReasonCode,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * advice §4 기능 1 — 오답 원인 진단 hero 카드.
 * 미시 학습 허브(`/q/analysis/[questionId]`) 최상단에 위치.
 *
 * 학생이 고른 답 / 정답 / wrongReasonCodes 최대 2개 / nextStepHint 1줄.
 */
export function WrongReasonHero({
  diagnosis,
  studentChoice,
  correctChoice,
  primarySubject,
}: {
  diagnosis: WrongAttemptDiagnosis;
  /** 선지 텍스트 (학생이 고른 답) — 없으면 인덱스만 표시 */
  studentChoice?: string;
  correctChoice?: string;
  /** 주 과목 — subjectExamples 노출용 */
  primarySubject?: keyof (typeof wrongReasonCatalog)['지문_근거_놓침']['subjectExamples'];
}) {
  const codes = pickPrimaryReasons(diagnosis.wrongReasonCodes);
  if (codes.length === 0) return null;

  return (
    <section
      aria-label="오답 원인 진단"
      className="border-pullim-warn/40 bg-pullim-warn/5 rounded-2xl border-2 p-4 sm:p-5"
    >
      <header className="flex items-center gap-1.5">
        <AlertTriangle className="text-pullim-warn h-4 w-4" aria-hidden />
        <span className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
          오답 원인 진단
        </span>
        <span className="text-pullim-slate-500 ml-auto text-[11px]">
          한 번에 다 펼치지 않고, 원인부터 짚어요
        </span>
      </header>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AnswerCard
          tone="wrong"
          label="내 답"
          index={diagnosis.selectedIndex}
          text={studentChoice}
        />
        <AnswerCard
          tone="correct"
          label="정답"
          index={diagnosis.correctIndex}
          text={correctChoice}
        />
      </div>

      <ul className="mt-3 space-y-2">
        {codes.map(code => (
          <ReasonRow key={code} code={code} primarySubject={primarySubject} />
        ))}
      </ul>
    </section>
  );
}

function AnswerCard({
  tone,
  label,
  index,
  text,
}: {
  tone: 'wrong' | 'correct';
  label: string;
  index: number;
  text?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-3',
        tone === 'correct'
          ? 'border-pullim-success bg-pullim-success-bg'
          : 'border-pullim-danger bg-pullim-danger-bg',
      )}
    >
      <div
        className={cn(
          'text-[10px] font-bold tracking-wider uppercase',
          tone === 'correct' ? 'text-pullim-success' : 'text-pullim-danger',
        )}
      >
        {label} {choiceMark(index)}
      </div>
      {text && (
        <div className="text-pullim-slate-900 mt-1 line-clamp-2 text-sm font-bold leading-snug">
          {text}
        </div>
      )}
    </div>
  );
}

function ReasonRow({
  code,
  primarySubject,
}: {
  code: WrongReasonCode;
  primarySubject?: keyof (typeof wrongReasonCatalog)['지문_근거_놓침']['subjectExamples'];
}) {
  const entry = wrongReasonCatalog[code];
  const example = primarySubject
    ? entry.subjectExamples[primarySubject]
    : Object.values(entry.subjectExamples)[0];

  return (
    <li className="bg-card flex items-start gap-2 rounded-xl border p-3">
      <span className="bg-pullim-warn-bg text-pullim-warn mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide">
        {entry.label}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-pullim-slate-900 text-sm leading-snug font-semibold">
          {entry.oneLineMessage}
        </p>
        {example && (
          <p className="text-pullim-slate-600 mt-1 text-[11px] leading-relaxed">
            예: {example}
          </p>
        )}
        <p className="text-pullim-blue-700 mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold">
          <Compass className="h-3 w-3" aria-hidden />
          {entry.nextStepHint}
        </p>
      </div>
    </li>
  );
}

function choiceMark(index: number): string {
  return ['①', '②', '③', '④', '⑤'][index] ?? `(${index + 1})`;
}
