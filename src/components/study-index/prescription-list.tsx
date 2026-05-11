import Link from 'next/link';
import {
  ArrowRight, Clock, TrendingUp, Lock,
  Target, Sparkles, Infinity as InfinityIcon, BookOpen, type LucideIcon,
} from 'lucide-react';
import { prescriptions, type Prescription } from '@/lib/mock';
import { cn } from '@/lib/utils';

const channelIconMap: Record<Prescription['channel'], LucideIcon> = {
  conqueror: Target,
  visual:    Sparkles,
  infinity:  InfinityIcon,
  store:     BookOpen,
};

const priorityMeta = {
  1: { label: '지금 바로',  className: 'bg-pullim-danger text-white' },
  2: { label: '이번 주',    className: 'bg-pullim-warn text-white' },
  3: { label: '여유 될 때', className: 'bg-pullim-slate-200 text-pullim-slate-700' },
} as const;

/**
 * 처방 리스트 — 마스터 4.2 "3축 연동 처방".
 * 약점 → 무한풀기/비주얼/오답정복/스토어로 자동 연결.
 */
export function PrescriptionList() {
  return (
    <section>
      <header className="mb-3">
        <p className="text-pullim-blue-600 text-[10px] font-bold tracking-wider uppercase">
          AI 처방 ·  Tier 3 Deep
        </p>
        <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
          당신에게 필요한 학습 경로
        </h2>
        <p className="text-pullim-slate-500 mt-0.5 text-xs">
          진단 결과 기반 4개 처방 · 예상 실력 점수 상승분 합계 <strong className="text-pullim-blue-600 font-mono">+0.51</strong>
        </p>
      </header>

      <ul className="space-y-2">
        {prescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} />)}
      </ul>
    </section>
  );
}

function PrescriptionCard({ rx }: { rx: Prescription }) {
  const p = priorityMeta[rx.priority];
  const locked = rx.channel === 'store';
  const routeMap = {
    infinity:  '/q/infinity/solve',
    visual:    '/library/visual',
    conqueror: '/q/review',
    store:     '#',
  };

  const ChannelIcon = channelIconMap[rx.channel];

  const inner = (
    <>
      <span
        aria-hidden
        className="bg-pullim-blue-50 text-pullim-blue-700 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      >
        <ChannelIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold', p.className)}>
            {p.label}
          </span>
          <span className="text-pullim-blue-700 bg-pullim-blue-50 rounded-full px-1.5 py-0.5 text-[9px] font-bold">
            → {rx.channelLabel}
          </span>
          {locked && (
            <span className="text-pullim-slate-500 inline-flex items-center gap-0.5 text-[9px] font-bold">
              <Lock className="h-2.5 w-2.5" />
              준비 중
            </span>
          )}
        </div>

        <h3 className="text-pullim-slate-900 mt-1 text-sm font-bold">
          {rx.targetLabel}
        </h3>
        <p className="text-pullim-slate-600 mt-0.5 line-clamp-2 text-[11px] leading-snug">
          {rx.description}
        </p>

        <div className="mt-1.5 flex items-center gap-3 text-[10px]">
          <span className="text-pullim-slate-500 inline-flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {rx.effortMin}분
          </span>
          <span className="text-pullim-success inline-flex items-center gap-0.5 font-bold">
            <TrendingUp className="h-2.5 w-2.5" />
            실력 점수 +{rx.expectedThetaGain.toFixed(2)} 예상
          </span>
        </div>
      </div>

      {!locked && (
        <ArrowRight className="text-pullim-slate-300 group-hover:text-pullim-blue-500 h-4 w-4 mt-1.5 transition-colors shrink-0" />
      )}
    </>
  );

  const baseClass =
    'bg-card group flex items-start gap-3 rounded-xl border p-3.5 transition-all';
  const cardClass = cn(
    baseClass,
    locked ? 'opacity-65 cursor-not-allowed' : 'hover:border-pullim-blue-300 hover:shadow-pullim-md',
  );

  return (
    <li>
      {locked ? (
        <div className={cardClass} aria-disabled>{inner}</div>
      ) : (
        <Link href={routeMap[rx.channel]} className={cardClass}>{inner}</Link>
      )}
    </li>
  );
}
