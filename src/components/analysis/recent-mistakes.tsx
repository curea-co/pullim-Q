import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';
import {
  explainLibrary,
  solveDeck,
  subjectLabels,
  wrongAttemptDiagnoses,
  wrongReasonCatalog,
  type WrongAttemptDiagnosis,
  type WrongReasonCode,
} from '@/lib/mock';
import { SectionHeading } from '@/components/shell/section-heading';
import { cn } from '@/lib/utils';

/**
 * `/q/analysis` 하단 — 다시 봐야 할 문제 카드 리스트.
 * advice §5-1 의 [NEW] 세 번째 블록 ("최근 오답 카드 3~5개").
 *
 * 카드 클릭 → 미시 학습 허브 (Phase 1 도착 전까지는 `/q/infinity/explain/[sku]`).
 * Phase 1.4에서 308 redirect로 `/q/analysis/[questionId]` 흡수.
 */
export function RecentMistakes({ limit = 4 }: { limit?: number }) {
  const items = wrongAttemptDiagnoses.slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section id="recent-mistakes" aria-label="다시 봐야 할 문제">
      <SectionHeading
        title="다시 봐야 할 문제"
        description="최근 오답을 한 문제씩 들여다보세요"
      />
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(item => (
          <MistakeCard key={item.attemptId} diagnosis={item} />
        ))}
      </ul>
    </section>
  );
}

function MistakeCard({ diagnosis }: { diagnosis: WrongAttemptDiagnosis }) {
  const meta = resolveMeta(diagnosis);
  const href = `/q/infinity/explain/${diagnosis.sku}`;

  return (
    <li>
      <Link
        href={href}
        className={cn(
          'bg-card hover:border-pullim-blue-300 hover:shadow-pullim-sm group flex h-full flex-col gap-2 rounded-2xl border p-4 transition-all',
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-pullim-slate-400 font-mono text-[10px] tracking-wider uppercase">
            {meta.skuLabel}
          </span>
          <span className="text-pullim-slate-500 text-[11px]">
            {meta.subjectLabel} · {meta.unit}
          </span>
        </div>
        <p className="text-pullim-slate-900 line-clamp-2 text-sm font-bold leading-snug">
          {diagnosis.summary}
        </p>
        <ul className="flex flex-wrap gap-1">
          {diagnosis.wrongReasonCodes.map(code => (
            <ReasonChip key={code} code={code} />
          ))}
        </ul>
        <div className="text-pullim-blue-700 mt-auto inline-flex items-center gap-0.5 text-xs font-bold">
          <RotateCcw className="h-3 w-3" />
          이 문제 풀이 다시 보기
          <ArrowRight className="ml-0.5 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </li>
  );
}

function ReasonChip({ code }: { code: WrongReasonCode }) {
  const entry = wrongReasonCatalog[code];
  return (
    <li className="bg-pullim-warn-bg text-pullim-warn inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide">
      {entry.label}
    </li>
  );
}

/** SKU → subject·unit 라벨 + 짧은 SKU 라벨 해석 */
function resolveMeta(diagnosis: WrongAttemptDiagnosis): {
  skuLabel: string;
  subjectLabel: string;
  unit: string;
} {
  const fromExplain = explainLibrary.find(e => e.sku === diagnosis.sku);
  if (fromExplain) {
    return {
      skuLabel: shortenSku(fromExplain.sku),
      subjectLabel: subjectLabels[fromExplain.subject],
      unit: fromExplain.unit,
    };
  }
  const fromDeck = solveDeck.find(p => p.sku === diagnosis.sku);
  if (fromDeck) {
    return {
      skuLabel: shortenSku(fromDeck.sku),
      subjectLabel: subjectLabels[fromDeck.subject],
      unit: fromDeck.unit,
    };
  }
  // explain 라이브러리·solveDeck 둘 다 없는 가상 시도 — SKU 패턴에서 과목 추정
  return {
    skuLabel: shortenSku(diagnosis.sku),
    subjectLabel: subjectFromSku(diagnosis.sku),
    unit: unitFromSku(diagnosis.sku),
  };
}

function shortenSku(sku: string): string {
  const parts = sku.split('-');
  return parts.length >= 4 ? `${parts[1]}·${parts[2]}` : sku;
}

function subjectFromSku(sku: string): string {
  if (sku.includes('-MATH-')) return subjectLabels.math;
  if (sku.includes('-ENG-')) return subjectLabels.english;
  if (sku.includes('-SCI-')) return subjectLabels.science;
  if (sku.includes('-KOR-')) return subjectLabels.korean;
  if (sku.includes('-SOC-') || sku.includes('-HIST-')) return subjectLabels.social;
  return '기타';
}

function unitFromSku(sku: string): string {
  if (sku.includes('RDG')) return '독해';
  if (sku.includes('VOC')) return '어휘';
  if (sku.includes('CALC')) return '미적분';
  if (sku.includes('PROB')) return '확률과 통계';
  if (sku.includes('PHY')) return '물리';
  if (sku.includes('HIST')) return '한국사';
  return '연습';
}
