'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, X, Repeat, Target, Unlock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { subjectLabels } from '@/lib/mock';
import {
  useSolveSessionStore,
  type SolveSessionSnapshot,
  SNAPSHOT_TTL_HOURS,
} from '@/lib/store/solve-session-store';

function relativeTime(savedAt: number): string {
  const diff = Date.now() - savedAt;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < SNAPSHOT_TTL_HOURS) return `${hrs}시간 전`;
  return `${SNAPSHOT_TTL_HOURS}시간 이상 전`;
}

function sourceUrl(snap: SolveSessionSnapshot): string {
  const params = new URLSearchParams();
  if (snap.source.kind === 'free') {
    params.set('kind', 'free');
    params.set('subject', snap.subject);
  } else if (snap.source.kind === 'weak') {
    params.set('kind', 'weak');
    params.set('subject', snap.subject);
    params.set('pattern', snap.source.patternName);
  } else if (snap.source.kind === 'retry') {
    params.set('kind', 'retry');
    params.set('sku', snap.source.sku);
    params.set('subject', snap.subject);
  }
  return `/q/infinity/solve?${params.toString()}`;
}

function SourceIcon({ source }: { source: SolveSessionSnapshot['source'] }) {
  if (source.kind === 'weak') return <Target className="h-3.5 w-3.5" aria-hidden />;
  if (source.kind === 'retry') return <Repeat className="h-3.5 w-3.5" aria-hidden />;
  return <Unlock className="h-3.5 w-3.5" aria-hidden />;
}

function sourceLabel(source: SolveSessionSnapshot['source']): string {
  if (source.kind === 'weak') return `약점 보강 — ${source.patternName}`;
  if (source.kind === 'retry') return `오답 다시 풀기 — ${source.patternName ?? source.sku}`;
  return '자유 풀이';
}

/**
 * /q/infinity/solve 진입 시 저장된 세션이 있으면 노출.
 * 이어풀기 / 새 세션 / 저장 버리기 3택.
 *
 * plan §3 — 이어풀기 진입 분기 2번.
 * "저장 버리기" 는 컨트롤드 Dialog 로 확인 (iOS 네이티브 confirm 의 a11y/ESC 부재 회피).
 */
export function SolveResumeCard({ snapshot }: { snapshot: SolveSessionSnapshot }) {
  const router = useRouter();
  const clearSnapshot = useSolveSessionStore((s) => s.clearSnapshot);
  const [discardOpen, setDiscardOpen] = useState(false);

  function handleConfirmDiscard() {
    clearSnapshot();
    setDiscardOpen(false);
  }

  return (
    <section className="bg-pullim-blue-50 border-pullim-blue-200 rounded-2xl border p-4">
      <header className="mb-2 flex items-baseline gap-2">
        <span className="text-pullim-blue-700 inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
          <Play className="h-3 w-3" />
          이어풀기
        </span>
        <span className="text-pullim-slate-500 text-[11px]">
          {relativeTime(snapshot.savedAt)} 저장됨
        </span>
      </header>

      <div className="text-pullim-slate-900 text-base font-bold tracking-tight">
        {subjectLabels[snapshot.subject]} · {snapshot.unitTitle}
      </div>
      <div className="text-pullim-slate-600 mt-0.5 inline-flex items-center gap-1 text-xs">
        <SourceIcon source={snapshot.source} />
        {sourceLabel(snapshot.source)}
        <span className="text-pullim-slate-400">·</span>
        <span className="font-mono">
          {Math.min(snapshot.currentIdx + 1, snapshot.total)}/{snapshot.total} 진행
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => router.replace(sourceUrl(snapshot))}
          className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold text-white"
        >
          <Play className="h-3.5 w-3.5" />
          이어풀기
        </button>
        <button
          type="button"
          onClick={() => clearSnapshot()}
          className="border-pullim-slate-200 text-pullim-slate-700 hover:bg-pullim-slate-50 inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold"
        >
          새 세션
        </button>
        <button
          type="button"
          onClick={() => setDiscardOpen(true)}
          className="text-pullim-slate-500 hover:text-pullim-danger inline-flex items-center gap-1 text-xs font-semibold"
        >
          <X className="h-3 w-3" />
          저장 버리기
        </button>
      </div>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-pullim-slate-900 text-base font-bold tracking-tight">
              저장된 진행을 버릴까요?
            </DialogTitle>
            <DialogDescription className="text-pullim-slate-600 mt-1 text-xs">
              이어풀기 카드가 사라지고 되돌릴 수 없어요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDiscardOpen(false)}
              className="border-pullim-slate-200 text-pullim-slate-700 hover:bg-pullim-slate-50 flex-1 inline-flex min-h-11 items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleConfirmDiscard}
              className="bg-pullim-danger text-white hover:bg-pullim-danger/90 flex-1 inline-flex min-h-11 items-center justify-center rounded-xl px-3 py-2.5 text-sm font-bold"
            >
              버리기
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
