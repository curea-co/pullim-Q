'use client';

import { RefreshCw, Repeat, Target, Unlock } from 'lucide-react';
import { subjectLabels, type SubjectKey } from '@/lib/mock';

export type SolveSourceMeta =
  | { kind: 'free' }
  | { kind: 'weak'; patternName: string }
  | { kind: 'retry'; sku: string; patternName?: string };

type Props = {
  subject: SubjectKey;
  unitTitle: string;
  source: SolveSourceMeta;
  /** 현재 보고 있는 문제 번호 (1-indexed) — "X/N" 표시용 */
  current: number;
  /** 지금까지 답한 문제 개수 — 진행률·진행 바 기준 */
  answered: number;
  total: number;
  onChange: () => void;
};

function SourceLabel({ source }: { source: SolveSourceMeta }) {
  if (source.kind === 'weak') {
    return (
      <span className="inline-flex items-center gap-1">
        <Target className="h-3 w-3" aria-hidden />
        약점 보강 — {source.patternName}
      </span>
    );
  }
  if (source.kind === 'retry') {
    return (
      <span className="inline-flex items-center gap-1">
        <Repeat className="h-3 w-3" aria-hidden />
        오답 다시 풀기{source.patternName ? ` — ${source.patternName}` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <Unlock className="h-3 w-3" aria-hidden />
      자유 풀이
    </span>
  );
}

export function SolveSessionBar({
  subject, unitTitle, source, current, answered, total, onChange,
}: Props) {
  const subjectLabel = subjectLabels[subject];
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <section className="bg-card rounded-2xl border p-3.5 shadow-pullim-sm">
      <div className="flex items-start gap-3">
        <span className="bg-pullim-blue-100 text-pullim-blue-700 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
          {subjectLabel[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
            지금 풀고 있어요
          </div>
          <h3 className="text-pullim-slate-900 mt-0.5 truncate text-sm font-bold tracking-tight">
            {subjectLabel} · {unitTitle}
          </h3>
          <div className="text-pullim-slate-500 mt-0.5 truncate text-[11px]">
            <SourceLabel source={source} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <div className="text-pullim-slate-900 font-mono text-sm font-bold tabular-nums">
              {current}/{total}
            </div>
            <div className="text-pullim-slate-500 text-[10px]">{pct}% 완료</div>
          </div>
          <button
            type="button"
            onClick={onChange}
            className="bg-pullim-slate-100 hover:bg-pullim-slate-200 text-pullim-slate-700 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            변경
          </button>
        </div>
      </div>
      <div className="bg-pullim-slate-100 mt-3 h-1.5 overflow-hidden rounded-full">
        <div
          className="bg-pullim-blue-500 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}
