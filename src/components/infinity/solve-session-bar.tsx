'use client';

import { RefreshCw, Target, Unlock } from 'lucide-react';
import { subjectLabels, type SubjectKey } from '@/lib/mock';

export type SolveSourceMeta =
  | { kind: 'free' }
  | { kind: 'weak'; patternName: string };

type Props = {
  subject: SubjectKey;
  unitTitle: string;
  source: SolveSourceMeta;
  current: number;
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
  return (
    <span className="inline-flex items-center gap-1">
      <Unlock className="h-3 w-3" aria-hidden />
      자유 풀이
    </span>
  );
}

export function SolveSessionBar({
  subject, unitTitle, source, current, total, onChange,
}: Props) {
  const subjectLabel = subjectLabels[subject];
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <section className="bg-card rounded-2xl border p-3.5 shadow-pullim-sm">
      <div className="flex items-start gap-3">
        <span className="bg-pullim-blue-100 text-pullim-blue-700 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
          {subjectLabel[0]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-pullim-slate-400 text-[10px] font-bold tracking-wider uppercase">
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
            <div className="text-pullim-slate-400 text-[10px]">{pct}% 완료</div>
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
