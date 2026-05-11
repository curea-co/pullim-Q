'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo } from 'react';
import { ArrowRight, ExternalLink, Package, ShoppingBag, Wrench } from 'lucide-react';
import {
  PULLIM_DOMAINS,
  parseReferrer,
  readRecentReferrers,
  trackReferrer,
  type ReferrerKind,
  type ReferrerMeta,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

export function CrossDomainSlot() {
  return (
    <Suspense fallback={null}>
      <CrossDomainSlotInner />
    </Suspense>
  );
}

function CrossDomainSlotInner() {
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const referrer = useMemo<ReferrerMeta>(() => parseReferrer(params), [params]);
  const recent = useMemo<ReferrerKind[]>(() => readRecentReferrers(), []);

  // 사이드 이펙트만 — state 갱신 없음
  useEffect(() => {
    trackReferrer(referrer);
  }, [referrer]);

  const { entryDomain, hintDomain } = useMemo(() => {
    if (referrer.kind === 'studio') return { entryDomain: 'studio' as const, hintDomain: 'store' as const };
    if (referrer.kind === 'store')  return { entryDomain: 'store'  as const, hintDomain: 'studio' as const };
    // direct: 최근 출처 기반, 없으면 store 우선
    const last = recent[0];
    if (last === 'studio') return { entryDomain: 'studio' as const, hintDomain: 'store' as const };
    return { entryDomain: 'store' as const, hintDomain: 'studio' as const };
  }, [referrer, recent]);

  return (
    <section suppressHydrationWarning>
      <SlotHeading />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <EntryContextCard referrer={referrer} entryDomain={entryDomain} />
        <CrossDomainHintCard hintDomain={hintDomain} referrer={referrer} />
      </div>
    </section>
  );
}

function SlotHeading() {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="bg-pullim-blue-500 h-2 w-2 rounded-full" />
      <Package className="text-pullim-blue-600 h-3.5 w-3.5" aria-hidden />
      <h2 className="text-pullim-slate-900 text-sm font-bold tracking-tight">풀림에서 더 가져오기</h2>
      <span className="text-pullim-slate-400 text-[11px]">— 새 문제도, 좋은 책도 풀러 와요</span>
    </div>
  );
}

/* ─────────────────────────  Entry Context Card  ───────────────────────── */

function EntryContextCard({
  referrer, entryDomain,
}: { referrer: ReferrerMeta; entryDomain: 'studio' | 'store' }) {
  const copy = pickEntryCopy(referrer, entryDomain);
  const isTeacher = referrer.kind === 'studio' && referrer.authorType === 'teacher';

  return (
    <article className={cn(
      'flex flex-col gap-2 rounded-2xl border-2 p-4',
      isTeacher
        ? 'border-pullim-warn/40 bg-pullim-warn/5'
        : 'border-pullim-blue-200 bg-pullim-blue-50/30',
    )}>
      <div className="flex items-center gap-1.5">
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
          isTeacher
            ? 'bg-pullim-warn-bg text-pullim-warn'
            : 'bg-pullim-blue-100 text-pullim-blue-700',
        )}>
          {entryDomain === 'studio' ? <Wrench className="h-2.5 w-2.5" /> : <ShoppingBag className="h-2.5 w-2.5" />}
          {copy.eyebrow}
        </span>
      </div>
      <h3 className="text-pullim-slate-900 text-base font-bold tracking-tight">
        {copy.title}
      </h3>
      <p className="text-pullim-slate-600 text-sm leading-snug">{copy.description}</p>
      <Link
        href={copy.cta.href}
        className={cn(
          'mt-1 inline-flex items-center gap-1 self-start rounded-full px-4 py-2 text-sm font-bold text-white transition-colors',
          isTeacher
            ? 'bg-pullim-warn hover:bg-pullim-warn/90'
            : 'bg-pullim-blue-600 hover:bg-pullim-blue-700',
        )}
      >
        {copy.cta.label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}

/* ─────────────────────────  Cross Domain Hint Card  ───────────────────────── */

function CrossDomainHintCard({
  hintDomain, referrer,
}: { hintDomain: 'studio' | 'store'; referrer: ReferrerMeta }) {
  const copy = pickHintCopy(hintDomain, referrer);
  const domainMeta = PULLIM_DOMAINS[hintDomain];

  return (
    <article className="bg-card flex flex-col gap-2 rounded-2xl border p-4">
      <div className="flex items-center gap-1.5">
        <span className="bg-pullim-slate-100 text-pullim-slate-700 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          {hintDomain === 'studio' ? <Wrench className="h-2.5 w-2.5" /> : <ShoppingBag className="h-2.5 w-2.5" />}
          {domainMeta.name}
        </span>
      </div>
      <h3 className="text-pullim-slate-900 text-base font-bold tracking-tight">
        {copy.title}
      </h3>
      <p className="text-pullim-slate-600 text-sm leading-snug">{copy.description}</p>
      <Link
        href={domainMeta.href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-pullim-slate-100 hover:bg-pullim-slate-200 text-pullim-slate-800 group mt-1 inline-flex items-center gap-1 self-start rounded-full px-4 py-2 text-sm font-bold transition-colors"
      >
        {copy.cta}
        <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
      </Link>
    </article>
  );
}

/* ─────────────────────────  Copy  ───────────────────────── */

type EntryCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
};

function pickEntryCopy(referrer: ReferrerMeta, entryDomain: 'studio' | 'store'): EntryCopy {
  if (referrer.kind === 'studio' && referrer.authorType === 'self') {
    return {
      eyebrow: '스튜디오에서 옴',
      title: '방금 만든 세트, 바로 풀어볼까요',
      description: '자작 문제 세트 · 약점 보강에 좋아요',
      cta: { label: '세트 풀기', href: '/q/infinity/solve' },
    };
  }
  if (referrer.kind === 'studio' && referrer.authorType === 'teacher') {
    const name = referrer.authorName ?? '선생님';
    return {
      eyebrow: `${name}이 보냄`,
      title: `${name}이 만든 세트 도착`,
      description: '약속한 풀이 시작해요 · 결과는 선생님께 전달',
      cta: { label: '세트 풀기', href: '/q/infinity/solve' },
    };
  }
  if (referrer.kind === 'store' && referrer.mode === 'owned') {
    const title = referrer.productTitle ?? '구매한 책';
    return {
      eyebrow: '스토어에서 옴',
      title: `${title} 풀기`,
      description: 'Q에서 풀면 오답·해설·유사문항 자동 분석',
      cta: { label: '책 풀기', href: '/q/infinity/solve' },
    };
  }
  if (referrer.kind === 'store' && referrer.mode === 'trial') {
    return {
      eyebrow: '스토어 체험',
      title: '2문항으로 분위기 보기',
      description: '마음에 들면 사서 전 세트 풀어보세요',
      cta: { label: '체험 시작', href: '/q/infinity/solve' },
    };
  }
  // direct
  if (entryDomain === 'store') {
    return {
      eyebrow: '이번 주 인기',
      title: '스토어 인기 문제집 둘러보기',
      description: '풀림 검증 + 사용자 평점 높은 책',
      cta: { label: '스토어 가보기', href: PULLIM_DOMAINS.store.href },
    };
  }
  return {
    eyebrow: '이번 주 인기',
    title: '스튜디오 인기 세트 둘러보기',
    description: '다른 학생·교사가 만든 약점 보강 세트',
    cta: { label: '스튜디오 가보기', href: PULLIM_DOMAINS.studio.href },
  };
}

type HintCopy = {
  title: string;
  description: string;
  cta: string;
};

function pickHintCopy(hintDomain: 'studio' | 'store', referrer: ReferrerMeta): HintCopy {
  if (hintDomain === 'store') {
    if (referrer.kind === 'studio') {
      return {
        title: '검증된 문제집·교습서',
        description: '직접 만든 문제 외에도, 풀림이 큐레이션한 문제집을 Q에서 그대로 풀이·분석',
        cta: '스토어 둘러보기',
      };
    }
    return {
      title: '검증된 문제집·교습서',
      description: '풀림이 검증한 문제집을 사서 Q에서 풀고 자동 분석받기',
      cta: '스토어 둘러보기',
    };
  }
  if (referrer.kind === 'store') {
    return {
      title: '내가 풀고 싶은 문제, 직접 만들기',
      description: '약점에 맞춰 문제를 만들고 Q로 가져와 풀어요',
      cta: '스튜디오 가보기',
    };
  }
  return {
    title: '내가 풀고 싶은 문제, 직접 만들기',
    description: '약점 보강 문제를 만들어 Q에서 바로 풀이',
    cta: '스튜디오 가보기',
  };
}

