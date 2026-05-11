import {
  Clock, AlertCircle, ArrowRight,
  Infinity as InfinityIcon, Target, BarChart3, Sparkles, GraduationCap, Calendar, FileText,
  type LucideIcon,
} from 'lucide-react';
import {
  todayDue, memorySourceMeta, type MemoryItem,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

const sourceIcon: Record<MemoryItem['source'], LucideIcon> = {
  infinity:   InfinityIcon,
  conqueror:  Target,
  index:      BarChart3,
  visual:     Sparkles,
  classbot:   GraduationCap,
  planner:    Calendar,
  exam:       FileText,
};

/**
 * 오늘 복습 큐 — Due 우선 정렬.
 */
export function ReviewQueue() {
  const queue = todayDue();
  const overdue = queue.filter(q => q.nextReviewInHours <= 0);

  return (
    <section className="bg-card rounded-2xl border">
      <header className="flex items-end justify-between border-b p-4">
        <div>
          <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
            복습 큐
          </p>
          <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
            오늘 다시 꺼낼 기억
          </h2>
          <p className="text-pullim-slate-500 mt-0.5 text-[11px]">
            <strong className="text-pullim-danger font-mono">{overdue.length}</strong> 만기
            <span className="mx-1">·</span>
            <strong className="text-pullim-slate-700 font-mono">{queue.length - overdue.length}</strong> 24h 내
          </p>
        </div>
        <button className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-pullim-sm">
          전체 복습 시작
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <ul className="divide-pullim-slate-100 divide-y">
        {queue.map(item => <ReviewRow key={item.id} item={item} />)}
        {queue.length === 0 && (
          <li className="text-pullim-slate-400 px-4 py-6 text-center text-xs">
            오늘 복습할 항목이 없어요. 새로운 학습을 시작해보세요.
          </li>
        )}
      </ul>
    </section>
  );
}

function ReviewRow({ item }: { item: MemoryItem }) {
  const overdue = item.nextReviewInHours <= 0;
  const source = memorySourceMeta[item.source];
  const retentionPct = Math.round(item.retention * 100);
  const retentionTone =
    item.retention < 0.3 ? 'text-pullim-danger'
    : item.retention < 0.5 ? 'text-pullim-warn'
    : 'text-pullim-success';

  const reviewLabel = (() => {
    const h = item.nextReviewInHours;
    if (h <= 0) {
      if (h <= -48) return `${Math.abs(Math.floor(h / 24))}일 지남`;
      if (h <= -24) return '1일 지남';
      if (h <= -1) return `${Math.abs(Math.floor(h))}h 지남`;
      return '지금';
    }
    if (h < 1) return '곧';
    if (h < 24) return `${Math.round(h)}h 후`;
    return `${Math.round(h / 24)}일 후`;
  })();

  return (
    <li className={cn('relative px-4 py-3 transition-colors hover:bg-pullim-slate-50/60')}>
      {overdue && (
        <div aria-hidden className="bg-pullim-danger absolute top-0 bottom-0 left-0 w-0.5" />
      )}

      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="bg-pullim-blue-50 text-pullim-blue-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        >
          {(() => {
            const Icon = sourceIcon[item.source];
            return <Icon className="h-4 w-4" />;
          })()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="bg-pullim-blue-50 text-pullim-blue-700 rounded-full px-1.5 py-0.5 font-bold tracking-wider uppercase">
              {source.label}
            </span>
            <span className="text-pullim-slate-300" aria-hidden>·</span>
            <span className="text-pullim-slate-500">{item.daysAgo}일 전 학습</span>
          </div>
          <div className="text-pullim-slate-900 mt-0.5 text-sm font-semibold">
            {item.label}
          </div>
        </div>

        <div className="text-right">
          <div className={cn('font-mono text-sm font-bold', retentionTone)}>
            {retentionPct}%
          </div>
          <div className={cn(
            'inline-flex items-center gap-0.5 text-[10px] font-mono',
            overdue ? 'text-pullim-danger font-bold' : 'text-pullim-slate-400',
          )}>
            {overdue ? <AlertCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
            {reviewLabel}
          </div>
        </div>
      </div>
    </li>
  );
}
