'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { PageHeader } from '@/components/shell/page-header';
import { useLeitnerStore } from '@/lib/store/leitner-store';
import { useMemoryStore } from '@/lib/store/memory-store';
import { unifiedQueue, type QueueItem } from '@/lib/review/unified-queue';

// 룰 C 1단계 — `/q/review/queue` 라우트 진입점.
// 페이지네이션·필터·정렬·검색은 후속 단계 (G3·G4 합의 도착 후).
// daily 2026-05-19 룰 C 발동, plan §0 참조.
export default function ReviewQueuePage() {
  return (
    <div className="space-y-section">
      <div className="text-pullim-slate-700 text-xs">
        <Link href="/q/review" className="hover:text-pullim-slate-900 inline-flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          복습 홈으로
        </Link>
      </div>
      <PageHeader
        title="전체 복습 큐"
        description="시간 지난 오답 + 잊을 위험이 큰 항목 전체 — 페이지네이션·필터·정렬은 다음 단계 (G3·G4 합의 후)"
      />
      <QueueListShell />
    </div>
  );
}

function QueueListShell() {
  const cards = useLeitnerStore(s => s.cards);
  const memoryItems = useMemoryStore(s => s.items);
  const queue = unifiedQueue(cards, memoryItems);

  return (
    <section>
      <div className="text-pullim-slate-500 mb-3 text-xs">
        총 <strong className="text-pullim-slate-900">{queue.length}</strong>개
        <span className="text-pullim-slate-400 ml-2">
          필터/정렬 컨트롤은 다음 단계
        </span>
      </div>
      {queue.length === 0 ? (
        <div className="bg-pullim-slate-50 text-pullim-slate-500 rounded-xl border border-dashed p-4 text-center text-xs">
          전체 큐가 비어 있어요. 새 문제를 풀어보세요.
        </div>
      ) : (
        <ol className="space-y-1.5">
          {queue.map((item, i) => <QueueRowMini key={item.key} item={item} index={i} />)}
        </ol>
      )}
    </section>
  );
}

function QueueRowMini({ item, index }: { item: QueueItem; index: number }) {
  const isOverdue = item.hours < 0;
  const label = item.kind === 'leitner' ? item.summary : item.label;
  const subject = item.kind === 'leitner' ? item.subject : 'memory';
  const hoursLabel =
    item.hours < 0
      ? `${Math.abs(Math.floor(item.hours))}시간 지남`
      : item.hours === 0
        ? '지금'
        : `${Math.ceil(item.hours)}시간 안`;
  return (
    <li className="bg-card flex items-center gap-3 rounded-xl border px-3 py-2 text-sm">
      <span className="text-pullim-slate-400 w-5 text-right text-xs">{index + 1}</span>
      <span
        className={
          'text-[10px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ' +
          (item.kind === 'leitner'
            ? 'bg-pullim-warn/10 text-pullim-warn'
            : 'bg-pullim-blue-50 text-pullim-blue-600')
        }
      >
        {item.kind === 'leitner' ? '오답' : '기억'}
      </span>
      <span className="min-w-0 flex-1 truncate text-pullim-slate-900">{label}</span>
      <span className="text-pullim-slate-500 text-xs">{subject}</span>
      <span
        className={
          'text-xs ' + (isOverdue ? 'text-pullim-warn font-bold' : 'text-pullim-slate-500')
        }
      >
        {hoursLabel}
      </span>
    </li>
  );
}
