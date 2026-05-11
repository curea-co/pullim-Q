'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History as HistoryIcon, Check, X, BookmarkCheck, Search, Eye, Clock, TrendingUp, TrendingDown, Lightbulb,
} from 'lucide-react';
import { solveHistory, subjectLabels, type SubjectKey, type SolveHistoryEntry } from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'correct' | 'wrong' | 'partial' | 'bookmarked' | SubjectKey;

const filters: { id: Filter; label: string }[] = [
  { id: 'all',        label: '전체' },
  { id: 'correct',    label: '정답' },
  { id: 'wrong',      label: '오답' },
  { id: 'partial',    label: '부분 정답' },
  { id: 'bookmarked', label: '북마크' },
  { id: 'math',       label: '수학' },
  { id: 'english',    label: '영어' },
  { id: 'science',    label: '과학' },
];

export default function HistoryPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    let list = solveHistory;
    switch (filter) {
      case 'correct':    list = list.filter(h => h.result === 'correct'); break;
      case 'wrong':      list = list.filter(h => h.result === 'wrong'); break;
      case 'partial':    list = list.filter(h => h.result === 'partial'); break;
      case 'bookmarked': list = list.filter(h => h.isBookmarked); break;
      case 'math': case 'english': case 'science':
        list = list.filter(h => h.subject === filter); break;
    }
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(h => h.unit.toLowerCase().includes(lower) || h.sku.toLowerCase().includes(lower));
    }
    return list;
  }, [filter, q]);

  const correctCount = solveHistory.filter(h => h.result === 'correct').length;
  const wrongCount = solveHistory.filter(h => h.result === 'wrong').length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: HistoryIcon, text: '풀이 이력' }}
        title="풀어본 모든 문제"
        description={`정답 ${correctCount} · 오답 ${wrongCount} · 전체 ${solveHistory.length}건 (최근 7일)`}
      />

      {/* 검색 + 필터 */}
      <div className="space-y-2">
        <label className="bg-card border-pullim-slate-200 focus-within:border-pullim-blue-300 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Search className="text-pullim-slate-400 h-4 w-4" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="단원·SKU 검색…"
            className="flex-1 bg-transparent outline-none placeholder:text-pullim-slate-400"
          />
        </label>
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={String(f.id)}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                filter === f.id
                  ? 'bg-pullim-slate-900 text-white'
                  : 'bg-pullim-slate-100 text-pullim-slate-600 hover:bg-pullim-slate-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 이력 리스트 */}
      <ul className="bg-card divide-pullim-slate-100 overflow-hidden rounded-2xl border divide-y">
        {filtered.map(h => <HistoryRow key={h.id} entry={h} />)}
        {filtered.length === 0 && (
          <li className="text-pullim-slate-400 px-4 py-8 text-center text-xs">
            조건에 맞는 풀이가 없어요
          </li>
        )}
      </ul>
    </div>
  );
}

function HistoryRow({ entry }: { entry: SolveHistoryEntry }) {
  const isCorrect = entry.result === 'correct';
  const isWrong = entry.result === 'wrong';
  const isUp = entry.thetaDelta > 0;

  return (
    <li className="hover:bg-pullim-slate-50 px-4 py-3 transition-colors">
      <div className="flex items-center gap-3">
        {/* 결과 아이콘 */}
        <span className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          isCorrect ? 'bg-pullim-success-bg text-pullim-success'
          : isWrong  ? 'bg-pullim-danger-bg text-pullim-danger'
          : 'bg-pullim-warn-bg text-pullim-warn',
        )}>
          {isCorrect ? <Check className="h-4 w-4" /> : isWrong ? <X className="h-4 w-4" /> : <span className="text-xs font-bold">~</span>}
        </span>

        {/* 메타 — Layer 1 §14.1 hierarchy 2단계 */}
        <div className="min-w-0 flex-1">
          {/* Primary: 단원 + 시간 */}
          <div className="text-pullim-slate-900 flex items-center gap-1.5 text-sm font-semibold">
            <span className="truncate">{entry.unit}</span>
            <span className="text-pullim-slate-400 font-mono text-xs font-medium">
              {Math.floor(entry.timeSec / 60)}:{String(entry.timeSec % 60).padStart(2, '0')}
            </span>
            {entry.isBookmarked && <BookmarkCheck className="text-pullim-blue-500 h-3 w-3" />}
          </div>
          {/* Secondary: 과목 · SKU · 힌트 · 시각 */}
          <div className="text-pullim-slate-400 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px]">
            <span>{subjectLabels[entry.subject]}</span>
            <span className="text-pullim-slate-300" aria-hidden>·</span>
            <span className="font-mono">{entry.sku}</span>
            {entry.hintsUsed > 0 && (
              <>
                <span className="text-pullim-slate-300" aria-hidden>·</span>
                <span className="inline-flex items-center gap-0.5">
                  <Lightbulb className="h-2.5 w-2.5" />
                  힌트 {entry.hintsUsed}회
                </span>
              </>
            )}
            <span className="text-pullim-slate-300" aria-hidden>·</span>
            <span>{entry.attemptedAgo}</span>
          </div>
        </div>

        {/* θ 변화 */}
        <div className="text-right">
          <div className={cn(
            'inline-flex items-center gap-0.5 font-mono text-xs font-bold',
            isUp ? 'text-pullim-success' : 'text-pullim-danger',
          )}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {entry.thetaDelta >= 0 ? '+' : ''}{entry.thetaDelta.toFixed(2)}
          </div>
          <Link
            href={`/q/infinity/explain/${entry.sku}`}
            className="text-pullim-blue-600 mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-bold hover:underline"
          >
            <Eye className="h-2.5 w-2.5" />
            해설
          </Link>
        </div>
      </div>
    </li>
  );
}
