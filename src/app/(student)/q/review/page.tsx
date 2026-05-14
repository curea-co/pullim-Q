'use client';

import Link from 'next/link';
import { Repeat, Brain, AlertTriangle, Award, Trophy, Flame, Target } from 'lucide-react';
import {
  conquestStats, personalForgettingProfile,
  overdueCards, todayCards, leitnerMeta,
  dueItems, todayDue, memorySourceMeta,
  forgettingCurve,
  wrongAttemptDiagnoses, wrongReasonCatalog,
  type MemoryItem, type LeitnerBox, type LeitnerCard,
} from '@/lib/mock';
import { useLeitnerStore } from '@/lib/store/leitner-store';
import { useMemoryStore } from '@/lib/store/memory-store';
import { PageHeader } from '@/components/shell/page-header';
import { SectionHeading } from '@/components/shell/section-heading';
import { ErrorPatternList } from '@/components/conqueror/error-pattern-list';
import { ReviewFormats } from '@/components/memory/review-formats';
import { cn } from '@/lib/utils';

type QueueItem =
  | { kind: 'leitner'; key: string; sku: string; subject: string; summary: string; box: LeitnerBox; hours: number }
  | { kind: 'memory';  key: string; id: string; label: string; source: MemoryItem['source']; retention: number; hours: number };

function unifiedQueue(cards: LeitnerCard[], memoryItems: MemoryItem[]): QueueItem[] {
  const wrong: QueueItem[] = cards.map(c => ({
    kind: 'leitner',
    key: `lc-${c.id}`,
    sku: c.problemSku,
    subject: c.subject,
    summary: c.summary,
    box: c.box,
    hours: c.nextReviewInHours,
  }));
  const memory: QueueItem[] = memoryItems.map(m => ({
    kind: 'memory',
    key: `mq-${m.id}`,
    id: m.id,
    label: m.label,
    source: m.source,
    retention: m.retention,
    hours: m.nextReviewInHours,
  }));
  // 24시간 안 + overdue만 — overdue 가장 먼저
  return [...wrong, ...memory]
    .filter(i => i.hours <= 24)
    .sort((a, b) => a.hours - b.hours);
}

const subjectShort: Record<string, string> = {
  math: '수', english: '영', science: '과', korean: '국', social: '사', history: '한',
};

export default function ReviewPage() {
  const cards = useLeitnerStore(s => s.cards);
  const memoryItems = useMemoryStore(s => s.items);
  const overdueLeitner = overdueCards(cards);
  const todayLeitner = todayCards(cards);
  const overdueMemory = dueItems(memoryItems).filter(i => i.nextReviewInHours < 0);
  const dueMemory = todayDue(memoryItems);
  const queue = unifiedQueue(cards, memoryItems).slice(0, 8);
  const totalToday = todayLeitner.length + dueMemory.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={{ icon: Repeat, text: '풀림 복습' }}
        title="틀린 것 + 잊을 위험 — 한 곳에서 한눈에"
        description={`지금 시간 지난 항목 ${overdueLeitner.length + overdueMemory.length}개 · 오늘 복습 대기 ${totalToday}개`}
      />

      <KpiBand
        overdue={overdueLeitner.length + overdueMemory.length}
        today={totalToday}
        totalConquered={conquestStats.totalConquered}
        retention={Math.round(personalForgettingProfile.retention30d.me * 100)}
      />

      <PriorityQueue queue={queue} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeitnerSummary />
        <ForgettingSummary />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ErrorPatternList />
        <ReviewFormats />
      </div>
    </div>
  );
}

/* ─────────────────────────  KPI Band  ───────────────────────── */

function KpiBand({
  overdue, today, totalConquered, retention,
}: {
  overdue: number; today: number;
  totalConquered: number; retention: number;
}) {
  return (
    <section className="bg-card rounded-2xl border p-4">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <Kpi
          Icon={AlertTriangle}
          label="시간 지남"
          value={`${overdue}`}
          sub="잊기 직전"
          accent={overdue > 0 ? 'warn' : undefined}
        />
        <Kpi
          Icon={Repeat}
          label="오늘 복습"
          value={`${today}`}
          sub="24시간 안"
        />
        <Kpi
          Icon={Award}
          label="누적 정복"
          value={`${totalConquered}`}
          sub="문제"
          accent="success"
        />
        <Kpi
          Icon={Brain}
          label="30일 남은 기억"
          value={`${retention}%`}
          sub={`또래 +${retention - Math.round(personalForgettingProfile.retention30d.peer * 100)}p`}
          accent="lemon"
        />
      </ul>
    </section>
  );
}

function Kpi({
  Icon, label, value, sub, accent,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string;
  accent?: 'warn' | 'lemon' | 'success';
}) {
  const valueClass =
    accent === 'warn' ? 'text-pullim-warn'
    : accent === 'lemon' ? 'text-pullim-lemon-ink'
    : accent === 'success' ? 'text-pullim-success'
    : 'text-pullim-slate-900';
  const iconBgClass =
    accent === 'warn' ? 'bg-pullim-warn-bg text-pullim-warn'
    : accent === 'lemon' ? 'bg-pullim-lemon/30 text-pullim-lemon-ink'
    : accent === 'success' ? 'bg-pullim-success-bg text-pullim-success'
    : 'bg-pullim-blue-50 text-pullim-blue-600';
  return (
    <li className="flex items-center gap-2">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', iconBgClass)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase truncate">
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn('font-mono text-lg font-bold tabular-nums', valueClass)}>
            {value}
          </span>
          <span className="text-pullim-slate-400 text-[10px]">{sub}</span>
        </div>
      </div>
    </li>
  );
}

/* ─────────────────────────  지금 우선 큐  ───────────────────────── */

function PriorityQueue({ queue }: { queue: QueueItem[] }) {
  return (
    <section>
      <SectionHeading
        title="지금 복습할 것"
        description="시간 지난 오답 + 잊을 위험이 큰 항목을 한 큐로 정렬"
        action={
          <Link
            href="/q/review/conquer"
            className="bg-pullim-lemon text-pullim-lemon-ink hover:bg-pullim-lemon/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
          >
            <Flame className="h-4 w-4" />
            정복 세트 풀기
          </Link>
        }
      />
      {queue.length === 0 ? (
        <div className="bg-pullim-slate-50 text-pullim-slate-500 rounded-xl border border-dashed p-4 text-center text-xs">
          오늘 복습할 항목이 없어요. 새 문제 풀러 가세요.
        </div>
      ) : (
        <ol className="space-y-1.5">
          {queue.map((item, i) => <QueueRow key={item.key} item={item} index={i} />)}
        </ol>
      )}
    </section>
  );
}

function QueueRow({ item, index }: { item: QueueItem; index: number }) {
  const isOverdue = item.hours < 0;
  const overdueLabel =
    item.hours < 0
      ? `${Math.abs(Math.floor(item.hours))}시간 지남`
      : item.hours === 0
        ? '지금'
        : `${Math.floor(item.hours)}시간 후`;

  if (item.kind === 'leitner') {
    const meta = leitnerMeta[item.box];
    return (
      <li>
        <Link
          href={`/q/infinity/solve?kind=retry&sku=${item.sku}`}
          className={cn(
            'group flex items-center gap-3 rounded-xl border p-3 transition-colors',
            isOverdue
              ? 'border-pullim-warn/40 bg-pullim-warn/5 hover:border-pullim-warn'
              : 'bg-card hover:border-pullim-blue-300',
          )}
        >
          <span className="bg-pullim-slate-100 text-pullim-slate-600 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold">
            {index + 1}
          </span>
          <span className="bg-pullim-warn-bg text-pullim-warn inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
            <Target className="h-2.5 w-2.5" />
            오답
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-pullim-slate-900 truncate text-xs font-bold">{item.summary}</div>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-pullim-slate-600 text-[11px] font-semibold">
                BOX {item.box}
              </span>
              <span className="text-pullim-slate-300" aria-hidden>·</span>
              <span className="text-pullim-slate-400 text-[10px]">
                {subjectShort[item.subject] ?? item.subject} · {meta.interval}
              </span>
              <WrongReasonChip sku={item.sku} />
            </div>
          </div>
          <span className={cn(
            'shrink-0 font-mono text-[10px] font-semibold',
            isOverdue ? 'text-pullim-warn' : 'text-pullim-slate-500',
          )}>
            {overdueLabel}
          </span>
          <span className="bg-pullim-blue-600 group-hover:bg-pullim-blue-700 text-white inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors">
            <Repeat className="h-2.5 w-2.5" />
            다시 풀기
          </span>
        </Link>
      </li>
    );
  }
  const sourceMeta = memorySourceMeta[item.source];
  return (
    <li>
      <Link
        href={`/q/review/memory/${item.id}`}
        className={cn(
          'group flex items-center gap-3 rounded-xl border p-3 transition-colors',
          isOverdue
            ? 'border-pullim-warn/40 bg-pullim-warn/5 hover:border-pullim-warn'
            : 'bg-card hover:border-pullim-blue-300',
        )}
      >
        <span className="bg-pullim-slate-100 text-pullim-slate-600 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold">
          {index + 1}
        </span>
        <span className="bg-pullim-blue-50 text-pullim-blue-700 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold">
          <Brain className="h-2.5 w-2.5" />
          기억
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-pullim-slate-900 truncate text-xs font-bold">{item.label}</div>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-pullim-slate-600 text-[11px] font-semibold">
              남은 기억 {Math.round(item.retention * 100)}%
            </span>
            <span className="text-pullim-slate-300" aria-hidden>·</span>
            <span className="text-pullim-slate-400 text-[10px]">
              {sourceMeta.label}
            </span>
          </div>
        </div>
        <span className={cn(
          'shrink-0 font-mono text-[10px] font-semibold',
          isOverdue ? 'text-pullim-warn' : 'text-pullim-slate-500',
        )}>
          {overdueLabel}
        </span>
        <span className="bg-pullim-blue-600 group-hover:bg-pullim-blue-700 text-white inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors">
          <Brain className="h-2.5 w-2.5" />
          기억 학습
        </span>
      </Link>
    </li>
  );
}

/** Phase 2.2 — 우선 큐 leitner 행에 오답 원인 한 칩 노출 (메타 풍부화 확인용) */
function WrongReasonChip({ sku }: { sku: string }) {
  const diagnosis = wrongAttemptDiagnoses.find(d => d.sku === sku);
  const code = diagnosis?.wrongReasonCodes[0];
  if (!code) return null;
  return (
    <>
      <span className="text-pullim-slate-300" aria-hidden>·</span>
      <span className="bg-pullim-warn-bg text-pullim-warn inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide">
        {wrongReasonCatalog[code].label}
      </span>
    </>
  );
}

/* ─────────────────────────  Leitner 5-Box 미니  ───────────────────────── */

function LeitnerSummary() {
  const cards = useLeitnerStore(s => s.cards);
  const counts: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  cards.forEach(c => { counts[c.box]++; });
  const total = cards.length;

  // IRT 5단계 ramp + 마스터(BOX 5)는 레몬 단일 강조 (Layer 1: ≤4 색)
  const boxFill: Record<LeitnerBox, string> = {
    1: 'bg-pullim-blue-100 text-pullim-blue-800',
    2: 'bg-pullim-blue-200 text-pullim-blue-800',
    3: 'bg-pullim-blue-400 text-white',
    4: 'bg-pullim-blue-700 text-white',
    5: 'bg-pullim-lemon text-pullim-lemon-ink',
  };

  return (
    <article className="bg-card rounded-2xl border p-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
            Leitner 5-Box
          </p>
          <h3 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">틀린 문제 정복 진행도</h3>
        </div>
        <div className="text-pullim-slate-500 text-[11px]">
          전체 <strong className="text-pullim-slate-900 font-mono">{total}</strong>개
        </div>
      </header>
      <ol className="mt-3 grid grid-cols-5 gap-1.5">
        {([1, 2, 3, 4, 5] as LeitnerBox[]).map(b => {
          const meta = leitnerMeta[b];
          const isMaster = b === 5;
          return (
            <li
              key={b}
              className="bg-pullim-slate-50 ring-pullim-slate-200 flex flex-col items-center rounded-md p-1.5 text-center ring-1"
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold',
                  boxFill[b],
                )}
              >
                {isMaster ? <Trophy className="h-4 w-4" /> : b}
              </div>
              <div className="text-pullim-slate-900 mt-1 font-mono text-base font-bold">{counts[b]}</div>
              <div className="text-pullim-slate-400 text-[9px]">{meta.interval}</div>
            </li>
          );
        })}
      </ol>
      <p className="text-pullim-slate-500 mt-2.5 text-center text-[10px]">
        <span className="text-pullim-success">맞으면</span> 다음 박스 ·
        <span className="text-pullim-danger ml-1">틀리면</span> 1일로 ·
        <span className="text-pullim-lemon-ink ml-1 font-semibold">5단계 5회</span> 성공 시 마스터
      </p>
    </article>
  );
}

/* ─────────────────────────  망각 곡선 미니  ───────────────────────── */

function ForgettingSummary() {
  const me = personalForgettingProfile.retention30d.me;
  const peer = personalForgettingProfile.retention30d.peer;
  const delta = Math.round((me - peer) * 100);

  const w = 320;
  const h = 100;
  const padX = 12;
  const padY = 8;
  const points = forgettingCurve;
  const x = (i: number) => padX + (i / (points.length - 1)) * (w - padX * 2);
  const y = (v: number) => padY + (1 - v) * (h - padY * 2);

  const personalPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.personalRetention)}`).join(' ');
  const basePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.baseRetention)}`).join(' ');

  return (
    <article className="bg-card rounded-2xl border p-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-pullim-slate-600 text-[10px] font-bold tracking-wider uppercase">
            망각 곡선 — 30일 후
          </p>
          <h3 className="text-pullim-slate-900 mt-0.5 text-sm font-bold">
            남은 기억 {Math.round(me * 100)}%
            <span className="text-pullim-success ml-1.5 text-xs font-bold">
              (+{delta}p vs 또래)
            </span>
          </h3>
        </div>
        <div className="text-pullim-slate-500 text-[11px]">
          누적 <strong className="text-pullim-slate-900 font-mono">{personalForgettingProfile.totalItems.toLocaleString()}</strong>개
        </div>
      </header>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full" aria-hidden>
        <line x1={padX} y1={y(0)} x2={w - padX} y2={y(0)} className="stroke-pullim-slate-200" />
        <path d={basePath} fill="none" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-pullim-slate-300" />
        <path d={personalPath} fill="none" strokeWidth="2.5" className="stroke-pullim-blue-500" />
        <circle cx={x(points.length - 1)} cy={y(points[points.length - 1]!.personalRetention)} r="3" className="fill-pullim-blue-600" />
      </svg>
      <div className="text-pullim-slate-400 mt-1 flex items-center justify-center gap-3 text-[10px]">
        <span className="inline-flex items-center gap-1">
          <span className="bg-pullim-blue-500 h-0.5 w-3" /> 내 곡선
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="border-pullim-slate-300 h-0.5 w-3 border-t border-dashed" /> 평균
        </span>
      </div>
    </article>
  );
}
