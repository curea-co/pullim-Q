'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, Sparkles, Star, Search, Check, X, ArrowRight, type LucideIcon } from 'lucide-react';
import { explainLibrary, subjectLabels, type SubjectKey, type ExplainEntry } from '@/lib/mock';
import { PageHeader } from '@/components/shell/page-header';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'signature' | 'wrong' | 'correct' | 'unattempted' | SubjectKey;

const filters: { id: Filter; label: string; Icon?: LucideIcon }[] = [
  { id: 'all',         label: '전체' },
  { id: 'signature',   label: '시그니처', Icon: Star },
  { id: 'wrong',       label: '내가 틀린 것' },
  { id: 'correct',     label: '내가 맞은 것' },
  { id: 'unattempted', label: '안 풀어본 것' },
  { id: 'math',        label: '수학' },
  { id: 'english',     label: '영어' },
  { id: 'science',     label: '과학' },
];

export default function ExplainLibraryPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    let list = explainLibrary;
    switch (filter) {
      case 'signature':   list = list.filter(e => e.isSignature); break;
      case 'wrong':       list = list.filter(e => e.myResult === 'wrong'); break;
      case 'correct':     list = list.filter(e => e.myResult === 'correct'); break;
      case 'unattempted': list = list.filter(e => !e.hasMyAttempt); break;
      case 'math': case 'english': case 'science':
        list = list.filter(e => e.subject === filter); break;
    }
    if (q.trim()) {
      const lower = q.toLowerCase();
      list = list.filter(e =>
        e.summary.toLowerCase().includes(lower) ||
        e.unit.toLowerCase().includes(lower) ||
        e.sku.toLowerCase().includes(lower),
      );
    }
    return list;
  }, [filter, q]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Eye, text: '풀림 해설 라이브러리' }}
        title="12-섹션으로 깊게 읽는 해설"
        description={`기존 출판사 해설을 대체하는 풀림 시그니처 · ${explainLibrary.length}개 해설`}
      />

      {/* 시그니처 강조 카드 */}
      <section className="from-pullim-warn/15 to-pullim-warn/5 border-pullim-warn/30 rounded-2xl border bg-gradient-to-br p-4">
        <div className="flex items-start gap-3">
          <span className="bg-pullim-warn flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
              풀림 해설의 12-섹션
            </div>
            <h2 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">
              한 문제를 깊게 — 4개의 풀이 경로 + 100명의 선택 + 3가지 톤의 선생님 해설
            </h2>
            <p className="text-pullim-slate-600 mt-1 text-[11px] leading-relaxed">
              Hero · Prologue · 4-Path Spine · Root Graph · Error Anatomy · 100명의 선택 ·
              Visual Canvas · Pattern Family · Feynman Challenge · Teacher Voices · History+Real · Memory Anchor
            </p>
          </div>
        </div>
      </section>

      {/* 검색 + 필터 */}
      <div className="space-y-2">
        <label className="bg-card border-pullim-slate-200 focus-within:border-pullim-blue-300 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm">
          <Search className="text-pullim-slate-400 h-4 w-4" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="단원·문항·SKU 검색…"
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
              <span className="inline-flex items-center gap-1">
                {f.Icon && <f.Icon className="h-3 w-3 fill-current" aria-hidden />}
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 해설 카드 그리드 */}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(e => <ExplainCard key={e.sku} entry={e} />)}
        {filtered.length === 0 && (
          <li className="text-pullim-slate-400 col-span-full rounded-xl border border-dashed py-10 text-center text-xs">
            조건에 맞는 해설이 없어요
          </li>
        )}
      </ul>
    </div>
  );
}

function ExplainCard({ entry }: { entry: ExplainEntry }) {
  return (
    <li>
      <Link
        href={`/q/infinity/explain/${entry.sku}`}
        className={cn(
          'group bg-card relative flex h-full flex-col gap-2 rounded-xl border p-3.5 transition-all',
          entry.isSignature && 'ring-pullim-warn/40 ring-2',
          'hover:border-pullim-blue-300 hover:shadow-pullim-md',
        )}
      >
        <header className="flex items-center gap-1.5 text-[10px]">
          {entry.isSignature && (
            <span className="bg-pullim-warn inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold text-white">
              <Star className="h-2.5 w-2.5 fill-current" />
              SIGNATURE
            </span>
          )}
          <span className="text-pullim-slate-500 font-mono">{entry.sku}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-pullim-slate-500">
            <Star className="text-pullim-warn h-2.5 w-2.5 fill-current" aria-hidden />
            <span className="font-mono font-bold">{entry.rating}</span>
          </span>
        </header>

        <div>
          <div className="text-pullim-slate-500 text-[10px] font-semibold tracking-wider uppercase">
            {subjectLabels[entry.subject]} · {entry.unit}
          </div>
          <h3 className="text-pullim-slate-900 mt-0.5 line-clamp-2 text-sm font-bold leading-snug">
            {entry.summary}
          </h3>
        </div>

        <footer className="text-pullim-slate-400 mt-auto flex items-center gap-2 text-[10px]">
          {entry.hasMyAttempt && (
            entry.myResult === 'correct' ? (
              <span className="text-pullim-success inline-flex items-center gap-0.5 font-bold">
                <Check className="h-2.5 w-2.5" />
                내가 맞춤
              </span>
            ) : (
              <span className="text-pullim-danger inline-flex items-center gap-0.5 font-bold">
                <X className="h-2.5 w-2.5" />
                내가 틀림
              </span>
            )
          )}
          {!entry.hasMyAttempt && <span>안 풀어본 문제</span>}
          <span className="ml-auto inline-flex items-center gap-0.5">
            <Eye className="h-2.5 w-2.5" aria-hidden />
            {entry.views.toLocaleString()}
          </span>
          <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-blue-500 h-3 w-3 transition-colors" />
        </footer>
      </Link>
    </li>
  );
}
