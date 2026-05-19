import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  aggregateRecentWrongReasons,
  currentPersona,
  wrongReasonCatalog,
  type WrongReasonCode,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * `/q/analysis` 상단 — 최근 오답 원인 Top 3 미니카드.
 * advice §5-1 의 [NEW] 첫 번째 블록.
 *
 * 코드별 빈도 + 학생 주 과목(persona.focusSubjects[0])에 맞춘 예시 한 줄.
 */
export function WrongReasonTop3() {
  const top = aggregateRecentWrongReasons(undefined, 3);
  const primarySubject = currentPersona.focusSubjects[0];

  if (top.length === 0) return null;

  return (
    <section aria-label="최근 오답 원인">
      <div className="mb-2 flex items-center gap-1.5">
        <AlertTriangle className="text-pullim-warn h-3.5 w-3.5" aria-hidden />
        <h2 className="text-pullim-slate-900 text-sm font-bold tracking-tight">
          최근 오답 원인 Top 3
        </h2>
        <span className="text-pullim-slate-500 text-[11px]">
          — 분석에서 발견한 · 한 문제씩 들여다볼 때 먼저 살펴봐요
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {top.map((entry, i) => (
          <ReasonCard
            key={entry.code}
            rank={i + 1}
            code={entry.code}
            count={entry.count}
            subject={primarySubject}
          />
        ))}
      </div>
    </section>
  );
}

function ReasonCard({
  rank,
  code,
  count,
  subject,
}: {
  rank: number;
  code: WrongReasonCode;
  count: number;
  subject: typeof currentPersona.focusSubjects[number];
}) {
  const entry = wrongReasonCatalog[code];
  const example = entry.subjectExamples[subject] ?? Object.values(entry.subjectExamples)[0];

  return (
    <Link
      href="#recent-mistakes"
      aria-label={`${entry.label} — 다시 봐야 할 문제로 이동`}
      className={cn(
        'bg-card hover:border-pullim-warn/40 hover:shadow-pullim-sm group rounded-2xl border p-3 transition-all',
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="bg-pullim-warn-bg text-pullim-warn inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold">
          {rank}
        </span>
        <span className="text-pullim-slate-900 text-sm font-bold tracking-tight">
          {entry.label}
        </span>
        <span className="text-pullim-slate-500 ml-auto font-mono text-[11px]">
          {count}회
        </span>
      </div>
      {example && (
        <p className="text-pullim-slate-600 mt-1.5 line-clamp-2 text-[11px] leading-relaxed">
          예: {example}
        </p>
      )}
      <div className="text-pullim-blue-700 mt-2 inline-flex items-center gap-0.5 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
        이 원인의 문제 보기
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
