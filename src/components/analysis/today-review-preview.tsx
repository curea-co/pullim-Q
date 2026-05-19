import Link from 'next/link';
import { AlertTriangle, ArrowRight, Brain, Calendar } from 'lucide-react';
import {
  leitnerMeta,
  memoryQueue,
  overdueCards,
  todayCards,
  todayDue,
  type LeitnerCard,
  type MemoryItem,
} from '@/lib/mock';
import { SectionHeading } from '@/components/shell/section-heading';
import { cn } from '@/lib/utils';

/**
 * `/q/analysis` 하단 — 오늘의 복습 경로 (advice §5-1 마지막 [NEW] 블록).
 * 복습 탭 망각곡선·Leitner 큐를 2~3개로 미리 보여줌. 카드 클릭 시 복습 진입.
 *
 * 우선순위: overdue Leitner → today Leitner → today Memory
 */
export function TodayReviewPreview({ limit = 3 }: { limit?: number }) {
  const previews = pickTopPreviews(limit);
  if (previews.length === 0) return null;

  return (
    <section id="today-review-preview" aria-label="오늘의 복습 경로">
      <SectionHeading
        title="오늘의 복습 경로"
        description="망각곡선·Leitner 큐에서 가장 먼저 챙겨야 할 항목"
      />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {previews.map(p => (
          <li key={p.key}>
            <PreviewCard preview={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

type Preview =
  | { key: string; kind: 'leitner_overdue'; card: LeitnerCard }
  | { key: string; kind: 'leitner_today';   card: LeitnerCard }
  | { key: string; kind: 'memory_today';    item: MemoryItem };

function pickTopPreviews(limit: number): Preview[] {
  const overdue = overdueCards();
  const todayLeitner = todayCards();
  const todayMemory  = todayDue(memoryQueue);

  const all: Preview[] = [
    ...overdue.map<Preview>(card => ({ key: `lo-${card.id}`, kind: 'leitner_overdue', card })),
    ...todayLeitner.map<Preview>(card => ({ key: `lt-${card.id}`, kind: 'leitner_today', card })),
    ...todayMemory.map<Preview>(item => ({ key: `mt-${item.id}`, kind: 'memory_today', item })),
  ];

  return all.slice(0, limit);
}

function PreviewCard({ preview }: { preview: Preview }) {
  if (preview.kind === 'leitner_overdue' || preview.kind === 'leitner_today') {
    const isOverdue = preview.kind === 'leitner_overdue';
    const { card } = preview;
    const meta = leitnerMeta[card.box];
    return (
      <Link
        href="/q/review"
        className={cn(
          'group flex h-full flex-col gap-1.5 rounded-2xl border p-3.5 transition-all',
          isOverdue
            ? 'border-pullim-warn/40 bg-pullim-warn/5 hover:border-pullim-warn/60'
            : 'bg-card hover:border-pullim-blue-300 hover:shadow-pullim-sm',
        )}
      >
        <div className="flex items-center gap-1.5">
          {isOverdue
            ? <AlertTriangle className="text-pullim-warn h-3.5 w-3.5" aria-hidden />
            : <Calendar className="text-pullim-blue-600 h-3.5 w-3.5" aria-hidden />}
          <span className={cn(
            'text-[10px] font-bold tracking-wider uppercase',
            isOverdue ? 'text-pullim-warn' : 'text-pullim-blue-700',
          )}>
            {isOverdue ? '복습 시간 지남' : '오늘 복습'}
          </span>
          <span className="text-pullim-slate-500 ml-auto font-mono text-[10px]">
            BOX {card.box}
          </span>
        </div>
        <p className="text-pullim-slate-900 line-clamp-2 text-sm font-semibold leading-snug">
          {card.summary}
        </p>
        <p className="text-pullim-slate-500 text-[11px]">
          {meta.tag} · 다음 복습 {meta.interval} 후
        </p>
        <span className="text-pullim-blue-700 mt-auto inline-flex items-center gap-0.5 text-[11px] font-bold">
          복습 큐에서 풀기
          <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    );
  }

  const { item } = preview;
  const retentionPct = Math.round(item.retention * 100);
  return (
    <Link
      href={`/q/review/memory/${item.id}`}
      className="bg-card hover:border-pullim-blue-300 hover:shadow-pullim-sm group flex h-full flex-col gap-1.5 rounded-2xl border p-3.5 transition-all"
    >
      <div className="flex items-center gap-1.5">
        <Brain className="text-pullim-warn h-3.5 w-3.5" aria-hidden />
        <span className="text-pullim-warn text-[10px] font-bold tracking-wider uppercase">
          오늘 기억 재학습
        </span>
        <span className="text-pullim-slate-500 ml-auto font-mono text-[10px]">
          {retentionPct}%
        </span>
      </div>
      <p className="text-pullim-slate-900 line-clamp-2 text-sm font-semibold leading-snug">
        {item.label}
      </p>
      <p className="text-pullim-slate-500 text-[11px]">
        {item.source} · 만기 {item.nextReviewInHours <= 0 ? '지남' : '곧'}
      </p>
      <span className="text-pullim-blue-700 mt-auto inline-flex items-center gap-0.5 text-[11px] font-bold">
        한 장 복습하기
        <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
