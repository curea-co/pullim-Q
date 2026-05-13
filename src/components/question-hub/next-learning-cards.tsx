'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Calendar, Lightbulb, Sparkles, Target } from 'lucide-react';
import {
  explainLibrary,
  memoryQueue,
  type ExplainContent,
} from '@/lib/mock';
import { useLeitnerStore } from '@/lib/store/leitner-store';
import { cn } from '@/lib/utils';

/**
 * advice §4 기능 5 — 다음 학습 카드 5종.
 *  1) 같은 유형 쉬운 문제
 *  2) 놓친 개념 카드 (memory 큐 직링)
 *  3) 유사 기출 (PatternFamily 에서 1개)
 *  4) 내일 다시 풀 문제 (leitner 큐 — 같은 sku로 ?kind=retry)
 *  5) 배경지식 카드
 */
export function NextLearningCards({
  data,
  sku,
  subject,
}: {
  data: ExplainContent;
  sku: string;
  subject: string;
}) {
  // 1) 같은 유형 쉬운 문제 — advice §4 기능 5: family 중 난이도 낮은 2개
  const easySorted = [...data.family].sort((a, b) => a.difficulty - b.difficulty);
  const easySame1 = easySorted[0];
  const easySame2 = easySorted[1];

  // 2) 놓친 개념 카드 — memoryQueue 중 retention 가장 낮은 1개
  const missedConcept = [...memoryQueue].sort((a, b) => a.retention - b.retention)[0];

  // 3) 유사 기출 — family 중 수능/모평/학평 출처 우선
  const similarExam =
    data.family.find(f => ['수능', '모평', '학평'].includes(f.source)) ?? data.family[1];

  // 4) 내일 다시 풀 문제 — 현재 sku
  const tomorrowRetry = sku;

  // 5) 배경지식 카드 — explainLibrary 에서 같은 과목·다른 sku
  const backgroundEntry = explainLibrary.find(e => e.sku !== sku && e.subject === subject);

  return (
    <section aria-label="다음 학습 카드" className="space-y-3">
      <header className="flex items-center gap-1.5">
        <Sparkles className="text-pullim-blue-600 h-4 w-4" aria-hidden />
        <h2 className="text-pullim-slate-900 text-base font-bold tracking-tight">다음 학습</h2>
        <span className="text-pullim-slate-500 ml-auto text-[11px]">6개 추천 — 한 번에 다 안 해도 돼요</span>
      </header>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {easySame1 && (
          <Card
            kind="easy_same_type"
            icon={Target}
            tone="blue"
            title="같은 유형 쉬운 문제"
            description={easySame1.summary}
            meta={`${easySame1.source} · 난이도 ${easySame1.difficulty.toFixed(2)}`}
            href={`/q/infinity/solve?kind=retry&sku=${easySame1.sku}`}
          />
        )}
        {easySame2 && (
          <Card
            kind="easy_same_type"
            icon={Target}
            tone="blue"
            title="같은 유형 쉬운 문제"
            description={easySame2.summary}
            meta={`${easySame2.source} · 난이도 ${easySame2.difficulty.toFixed(2)}`}
            href={`/q/infinity/solve?kind=retry&sku=${easySame2.sku}`}
          />
        )}
        {missedConcept && (
          <Card
            kind="missed_concept"
            icon={Brain}
            tone="warn"
            title="놓친 개념 카드"
            description={missedConcept.label}
            meta={`잔존 ${Math.round(missedConcept.retention * 100)}% · 만기 ${missedConcept.nextReviewInHours <= 0 ? '지남' : '곧'}`}
            href={`/q/review/memory/${missedConcept.id}`}
          />
        )}
        {similarExam && (
          <Card
            kind="similar_exam"
            icon={Lightbulb}
            tone="slate"
            title="유사 기출"
            description={similarExam.summary}
            meta={`${similarExam.source}${similarExam.year ? ' · ' + similarExam.year : ''}`}
            href={`/q/infinity/solve?kind=retry&sku=${similarExam.sku}`}
          />
        )}
        <TomorrowRetryCard sku={tomorrowRetry} />
        {backgroundEntry && (
          <Card
            kind="background"
            icon={Lightbulb}
            tone="lemon"
            title="배경지식 카드"
            description={backgroundEntry.summary}
            meta={`${backgroundEntry.unit}`}
            href={`/q/analysis/${backgroundEntry.sku}`}
          />
        )}
      </div>
    </section>
  );
}

function TomorrowRetryCard({ sku }: { sku: string }) {
  const card = useLeitnerStore(s => s.cards.find(c => c.problemSku === sku));
  const intervalDesc = card
    ? card.nextReviewInHours <= 0
      ? '오늘 안에 풀어요'
      : card.nextReviewInHours < 48
        ? `${Math.ceil(card.nextReviewInHours / 24)}일 후 복습`
        : `${Math.ceil(card.nextReviewInHours / 24)}일 후`
    : '내일 다시 풀어요';

  return (
    <Card
      kind="tomorrow_retry"
      icon={Calendar}
      tone="blue"
      title="내일 다시 풀 문제"
      description="같은 문제를 한 번 더 — 기억 정착의 핵심"
      meta={intervalDesc}
      href={`/q/infinity/solve?kind=retry&sku=${sku}`}
    />
  );
}

function Card({
  icon: Icon,
  tone,
  title,
  description,
  meta,
  href,
  kind,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: 'blue' | 'warn' | 'slate' | 'lemon';
  title: string;
  description: string;
  meta: string;
  href: string;
  kind: string;
}) {
  const toneClass = {
    blue:  'border-pullim-blue-200 bg-pullim-blue-50/40 hover:border-pullim-blue-300',
    warn:  'border-pullim-warn/30 bg-pullim-warn/5 hover:border-pullim-warn/50',
    slate: 'border-pullim-slate-200 bg-card hover:border-pullim-slate-300',
    lemon: 'border-pullim-lemon-200 bg-pullim-lemon-50/40 hover:border-pullim-lemon-300',
  }[tone];

  const iconColor = {
    blue:  'text-pullim-blue-600',
    warn:  'text-pullim-warn',
    slate: 'text-pullim-slate-500',
    lemon: 'text-pullim-slate-700',
  }[tone];

  return (
    <Link
      href={href}
      data-kind={kind}
      className={cn('group flex h-full flex-col gap-1.5 rounded-2xl border p-3.5 transition-all', toneClass)}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5', iconColor)} aria-hidden />
        <span className="text-pullim-slate-900 text-xs font-bold tracking-tight">{title}</span>
      </div>
      <p className="text-pullim-slate-800 line-clamp-2 text-sm font-semibold leading-snug">
        {description}
      </p>
      <p className="text-pullim-slate-500 text-[11px]">{meta}</p>
      <span className="text-pullim-blue-700 mt-auto inline-flex items-center gap-0.5 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100">
        시작하기
        <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
