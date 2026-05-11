'use client';

import { useMemo, useState } from 'react';
import { allCurricula, subjectLabels, type CurriculumNode } from '@/lib/mock';
import { cn } from '@/lib/utils';

type SubjectTab = keyof typeof allCurricula;
const subjects: SubjectTab[] = ['math', 'english', 'science'];

const heatBuckets = [
  { min: 0,    max: 0.2,  color: 'var(--color-pullim-heat-5)', label: '심한 약점' },
  { min: 0.2,  max: 0.4,  color: 'var(--color-pullim-heat-4)', label: '약점' },
  { min: 0.4,  max: 0.6,  color: 'var(--color-pullim-heat-3)', label: '취약' },
  { min: 0.6,  max: 0.8,  color: 'var(--color-pullim-heat-2)', label: '보통' },
  { min: 0.8,  max: 1.01, color: 'var(--color-pullim-heat-0)', label: '강점' },
];

function masteryColor(m?: number) {
  if (m === undefined) return 'var(--color-pullim-slate-200)';
  const bucket = heatBuckets.find(b => m >= b.min && m < b.max);
  return bucket?.color ?? 'var(--color-pullim-heat-3)';
}

/**
 * 단원별 마스터리 히트맵 — 마스터 4.2 "단원별 히트맵" 시그니처.
 * L2 단원 → L3 성취 기준 계층 표시.
 */
export function MasteryHeatmap() {
  const [active, setActive] = useState<SubjectTab>('math');

  const tree = useMemo(() => {
    const curr = allCurricula[active];
    const l2nodes = curr.nodes.filter(n => n.depth === 2);
    return l2nodes.map(l2 => ({
      l2,
      children: curr.nodes.filter(n => n.depth === 3 && n.parent === l2.id),
    }));
  }, [active]);

  return (
    <section className="bg-card rounded-2xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            3단계 단원 정복도
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            단원별 학습 상태
          </h2>
        </div>

        <div className="bg-pullim-slate-100 inline-flex rounded-full p-0.5 text-xs">
          {subjects.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(s)}
              className={cn(
                'rounded-full px-3 py-1 font-semibold transition-all',
                active === s
                  ? 'bg-white text-pullim-slate-900 shadow-pullim-xs'
                  : 'text-pullim-slate-500',
              )}
            >
              {subjectLabels[s]}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {tree.map(({ l2, children }) => (
          <div key={l2.id}>
            <h3 className="text-pullim-slate-700 mb-1.5 text-xs font-bold">
              {l2.label}
            </h3>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {children.map(node => <HeatCell key={node.id} node={node} />)}
            </ul>
          </div>
        ))}

        {/* 범례 */}
        <div className="border-t border-pullim-slate-100 -mx-4 -mb-4 flex flex-wrap items-center gap-3 px-4 py-3 bg-pullim-slate-50/50 rounded-b-2xl">
          <span className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
            범례
          </span>
          {heatBuckets.map(b => (
            <span key={b.label} className="text-pullim-slate-600 inline-flex items-center gap-1 text-[11px]">
              <span className="h-3 w-3 rounded-sm" style={{ background: b.color }} />
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeatCell({ node }: { node: CurriculumNode }) {
  const m = node.mastery;
  const pct = m !== undefined ? Math.round(m * 100) : 0;
  const textLight = m !== undefined && m < 0.4;

  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-lg px-2.5 py-2 transition-transform hover:scale-[1.01]"
        style={{ background: masteryColor(m) }}
      >
        <span className={cn('flex-1 truncate text-xs font-semibold', textLight ? 'text-white' : 'text-pullim-slate-800')}>
          {node.label}
        </span>
        <span className={cn('font-mono text-xs font-bold', textLight ? 'text-white/90' : 'text-pullim-slate-800')}>
          {pct}%
        </span>
      </div>
    </li>
  );
}
