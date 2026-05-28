'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, Eye, Check, X, Sparkles, Lightbulb, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { dueItems, memorySourceMeta } from '@/lib/mock';
import { useMemoryStore } from '@/lib/store/memory-store';
import { PageHeader } from '@/components/shell/page-header';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

type Phase = 'front' | 'back' | 'result';

type ResultState = {
  prevRetention: number;
  newRetention: number;
  prevNextHours: number;
  newNextHours: number;
  remembered: boolean;
  isMastered: boolean;
};

function formatNextReview(hours: number): string {
  if (hours < 1) return '곧 (1시간 안)';
  if (hours < 24) return `${Math.round(hours)}시간 후`;
  const days = Math.round(hours / 24);
  return `${days}일 후`;
}

export default function MemoryRetryPage({ params }: Props) {
  const { id } = use(params);
  const items = useMemoryStore((s) => s.items);
  const item = items.find((m) => m.id === id);
  const applyResult = useMemoryStore((s) => s.applyResult);

  const queue = dueItems(items);
  const queueIndex = queue.findIndex((m) => m.id === id);
  const queueTotal = queue.length;
  const positionLabel =
    queueIndex >= 0 && queueTotal > 0 ? ` · ${queueIndex + 1}/${queueTotal}번째` : '';

  const [phase, setPhase] = useState<Phase>('front');
  const [hintOpen, setHintOpen] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  if (!item) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow={{ icon: Brain, text: '풀림 기억장치' }}
          title="찾을 수 없는 학습 항목"
          description="해당 메모리 카드가 존재하지 않아요. 복습 목록에서 다시 골라주세요."
        />
        <Link
          href="/q/review"
          className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          복습으로 돌아가기
        </Link>
      </div>
    );
  }

  const sourceMeta = memorySourceMeta[item.source];

  function handleAnswer(remembered: boolean) {
    const r = applyResult(id, remembered);
    if (!r) return;
    setResult(r);
    setPhase('result');
    if (r.isMastered) {
      toast.success('마스터 도달!', {
        description: `기억 ${Math.round(r.prevRetention * 100)}% → ${Math.round(r.newRetention * 100)}% · 다음 복습 ${formatNextReview(r.newNextHours)}`,
        duration: 4500,
      });
    } else if (remembered) {
      toast.success(`기억 강화: ${Math.round(r.prevRetention * 100)}% → ${Math.round(r.newRetention * 100)}%`, {
        description: `다음 복습 ${formatNextReview(r.newNextHours)}`,
        duration: 3500,
      });
    } else {
      toast.warning(`기억 약화: ${Math.round(r.prevRetention * 100)}% → ${Math.round(r.newRetention * 100)}%`, {
        description: `1시간 뒤 다시 만나요`,
        duration: 3500,
      });
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Brain, text: '풀림 기억장치 · 단일 학습' }}
        title={item.label}
        description={`출처: ${sourceMeta.label} · 첫 학습 ${item.daysAgo}일 전 · 현재 기억 ${Math.round(item.retention * 100)}%${positionLabel}`}
      />

      <Link
        href="/q/review"
        className="text-pullim-slate-500 hover:text-pullim-slate-900 inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="h-3 w-3" />
        복습 큐로 돌아가기
      </Link>

      {phase === 'front' && (
        <FrontCard
          prompt={item.prompt}
          hint={item.hint}
          hintOpen={hintOpen}
          onToggleHint={() => setHintOpen((v) => !v)}
          onReveal={() => setPhase('back')}
        />
      )}

      {phase === 'back' && (
        <BackCard
          prompt={item.prompt}
          answer={item.answer}
          mnemonic={item.mnemonic}
          onRemembered={() => handleAnswer(true)}
          onForgot={() => handleAnswer(false)}
        />
      )}

      {phase === 'result' && result && (
        <ResultCard
          result={result}
          label={item.label}
          answer={item.answer}
        />
      )}
    </div>
  );
}

/* ─────────────────────────  Front  ───────────────────────── */

function FrontCard({
  prompt, hint, hintOpen, onToggleHint, onReveal,
}: {
  prompt: string; hint?: string;
  hintOpen: boolean; onToggleHint: () => void; onReveal: () => void;
}) {
  return (
    <section className="bg-card rounded-xl border p-5 space-y-4">
      <div className="space-y-2">
        <span className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
          질문
        </span>
        <p className="text-pullim-slate-900 text-base leading-relaxed font-medium">
          {prompt}
        </p>
      </div>

      {hint && (
        <div>
          <button
            type="button"
            onClick={onToggleHint}
            className="text-pullim-blue-600 hover:text-pullim-blue-700 inline-flex items-center gap-1 text-xs font-semibold"
          >
            <Lightbulb className="h-3 w-3" />
            {hintOpen ? '힌트 접기' : '힌트 보기'}
          </button>
          {hintOpen && (
            <p className="text-pullim-slate-700 bg-pullim-blue-50 border-pullim-blue-200 mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed">
              {hint}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onReveal}
        className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white"
      >
        <Eye className="h-4 w-4" />
        답 보기
      </button>
    </section>
  );
}

/* ─────────────────────────  Back  ───────────────────────── */

function BackCard({
  prompt, answer, mnemonic, onRemembered, onForgot,
}: {
  prompt: string; answer: string; mnemonic?: string;
  onRemembered: () => void; onForgot: () => void;
}) {
  return (
    <section className="bg-card rounded-xl border p-5 space-y-4">
      <div className="space-y-1.5">
        <span className="text-pullim-slate-500 text-[10px] font-bold tracking-wider uppercase">
          질문
        </span>
        <p className="text-pullim-slate-700 text-sm leading-relaxed">{prompt}</p>
      </div>

      <div className="bg-pullim-success-bg border-pullim-success/30 space-y-1.5 rounded-xl border-2 p-3">
        <span className="text-pullim-success text-[10px] font-bold tracking-wider uppercase">
          정답
        </span>
        <p className="text-pullim-slate-900 text-sm leading-relaxed font-medium">{answer}</p>
      </div>

      {mnemonic && (
        <div className="bg-pullim-lemon/20 border-pullim-lemon flex items-start gap-2 rounded-lg border px-3 py-2">
          <Sparkles className="text-pullim-lemon-ink mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <span className="text-pullim-lemon-ink text-[10px] font-bold tracking-wider uppercase">
              암기 트릭
            </span>
            <p className="text-pullim-slate-800 text-xs leading-relaxed">{mnemonic}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={onForgot}
          className="border-pullim-danger text-pullim-danger hover:bg-pullim-danger-bg inline-flex items-center justify-center gap-1.5 rounded-xl border-2 px-4 py-3 text-sm font-bold"
        >
          <X className="h-4 w-4" />
          안 나요
        </button>
        <button
          type="button"
          onClick={onRemembered}
          className="bg-pullim-success hover:bg-pullim-success/90 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold text-white"
        >
          <Check className="h-4 w-4" />
          기억나요
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────  Result  ───────────────────────── */

function ResultCard({
  result, label, answer,
}: { result: ResultState; label: string; answer: string }) {
  const prevPct = Math.round(result.prevRetention * 100);
  const newPct = Math.round(result.newRetention * 100);
  const delta = newPct - prevPct;
  const positive = delta >= 0;

  return (
    <div className="space-y-4">
      <section
        className={cn(
          'rounded-xl border-2 p-5 space-y-3',
          positive
            ? 'border-pullim-success bg-pullim-success-bg'
            : 'border-pullim-warn bg-pullim-warn-bg',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-white',
              positive ? 'bg-pullim-success' : 'bg-pullim-warn',
            )}
          >
            {positive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </span>
          <h3
            className={cn(
              'text-base font-bold',
              positive ? 'text-pullim-success' : 'text-pullim-warn',
            )}
          >
            {result.isMastered ? '마스터 도달!' : positive ? '기억 강화 완료' : '한 번 더 만나요'}
          </h3>
        </div>

        <div className="bg-white rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-pullim-slate-500">현재 기억</span>
            <span className="font-mono font-bold tabular-nums">
              <span className="text-pullim-slate-500">{prevPct}%</span>
              <span className="text-pullim-slate-400 mx-1.5">→</span>
              <span className={positive ? 'text-pullim-success' : 'text-pullim-warn'}>
                {newPct}%
              </span>
              <span
                className={cn(
                  'ml-1.5 text-[10px]',
                  positive ? 'text-pullim-success' : 'text-pullim-warn',
                )}
              >
                ({positive ? '+' : ''}{delta}p)
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-pullim-slate-500">다음 복습</span>
            <span className="text-pullim-slate-900 font-mono font-bold tabular-nums">
              {formatNextReview(result.newNextHours)}
            </span>
          </div>
        </div>

        <p className="text-pullim-slate-600 text-xs leading-relaxed">
          <strong className="text-pullim-slate-900">{label}</strong> — {answer}
        </p>
      </section>

      <div className="flex gap-2">
        <Link
          href="/q/review"
          className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-bold text-white"
        >
          <Repeat className="h-4 w-4" />
          복습 큐로 돌아가기
        </Link>
      </div>
    </div>
  );
}
