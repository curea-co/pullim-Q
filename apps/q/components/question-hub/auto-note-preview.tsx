'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, Inbox, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLeitnerStore } from '@/lib/store/leitner-store';
import {
  leitnerMeta,
  wrongReasonCatalog,
  type LeitnerCard,
  type WrongReasonCode,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * advice §4 기능 5 — 자동 오답노트 미리보기.
 * Leitner store에서 현재 sku의 카드 상태를 읽어 BOX·다음 복습·오답 원인을 노출.
 * 마운트 시 toast로 "복습 큐 등록" 안내 (이미 등록된 경우 한 번만, 미존재면 안내 없음).
 */
export function AutoNotePreview({
  sku,
  wrongReasonCodes,
}: {
  sku: string;
  wrongReasonCodes: WrongReasonCode[];
}) {
  const card = useLeitnerStore(s => s.cards.find(c => c.problemSku === sku));
  const toastSentRef = useRef(false);

  useEffect(() => {
    if (toastSentRef.current) return;
    if (!card) return;
    toastSentRef.current = true;
    const interval = leitnerMeta[card.box].interval;
    toast.info('오답노트에 등록됨', {
      description: `BOX ${card.box} · 다음 복습 ${interval} 후`,
      duration: 3500,
    });
  }, [card]);

  return (
    <section
      aria-label="자동 오답노트"
      className="bg-pullim-slate-50 border-pullim-slate-200 rounded-xl border p-4 sm:p-5"
    >
      <header className="mb-3 flex items-center gap-1.5">
        <Inbox className="text-pullim-blue-600 h-4 w-4" aria-hidden />
        <h2 className="text-pullim-slate-900 text-base font-bold tracking-tight">
          자동 오답노트
        </h2>
        <span className="text-pullim-slate-500 ml-auto text-[11px]">
          복습 큐에 자동 등록 — 같은 함정 다시 안 밟게
        </span>
      </header>

      {card ? <CardSummary card={card} codes={wrongReasonCodes} /> : <PendingSummary codes={wrongReasonCodes} />}
    </section>
  );
}

function CardSummary({ card, codes }: { card: LeitnerCard; codes: WrongReasonCode[] }) {
  const meta = leitnerMeta[card.box];
  return (
    <div className="bg-card rounded-xl border p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase',
            card.box <= 2 ? 'bg-pullim-warn-bg text-pullim-warn' : 'bg-pullim-blue-100 text-pullim-blue-700',
          )}
        >
          BOX {card.box}
        </span>
        <span className="text-pullim-slate-500 text-[11px]">{meta.tag}</span>
        <span className="text-pullim-slate-500 ml-auto text-[11px]">
          다음 복습 {meta.interval} 후
        </span>
      </div>

      <p className="text-pullim-slate-800 mt-2 text-sm leading-snug font-semibold">
        {card.summary}
      </p>

      {codes.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {codes.map(code => (
            <li
              key={code}
              className="bg-pullim-warn-bg text-pullim-warn inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
            >
              {wrongReasonCatalog[code].label}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/q/review"
          className="bg-pullim-slate-900 hover:bg-pullim-slate-800 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-colors"
        >
          복습 큐에서 보기
          <ArrowRight className="h-3 w-3" />
        </Link>
        <Link
          href={`/q/infinity/solve?kind=retry&sku=${card.problemSku}`}
          className="bg-card hover:bg-pullim-slate-100 border-pullim-slate-200 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors"
        >
          <Repeat2 className="h-3 w-3" />
          내일까지 기다리지 않고 다시 풀기
        </Link>
      </div>
    </div>
  );
}

function PendingSummary({ codes }: { codes: WrongReasonCode[] }) {
  return (
    <div className="bg-card border-pullim-slate-200 rounded-xl border border-dashed p-3.5">
      <p className="text-pullim-slate-600 text-sm leading-snug">
        이번 시도는 아직 복습 큐에 없어요. 다시 풀어 기록을 남기면 자동 등록돼요.
      </p>
      {codes.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {codes.map(code => (
            <li
              key={code}
              className="bg-pullim-warn-bg text-pullim-warn inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold"
            >
              {wrongReasonCatalog[code].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
