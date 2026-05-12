import Link from 'next/link';
import { BookOpen, Compass, ArrowRight, Pin, Calendar, MessageCircleQuestion } from 'lucide-react';
import { type ExplainContent } from '@/lib/mock';
import { cn } from '@/lib/utils';

/**
 * advice §4 기능 3 + §5-2 우측 패널.
 * 데스크탑 sticky / 모바일 Sheet 컨테이너 안에서 같은 콘텐츠 재사용.
 */
export function LearningMaterialsPanel({
  data,
  sku,
  className,
  layout = 'sticky',
}: {
  data: ExplainContent;
  sku: string;
  className?: string;
  /** 'sticky'는 데스크탑 사이드, 'flat'은 모바일 Sheet 내부 */
  layout?: 'sticky' | 'flat';
}) {
  const coachHref = (term: string) =>
    `/q/talk?context=${encodeURIComponent(sku)}&topic=${encodeURIComponent(term)}`;

  return (
    <div
      className={cn(
        'space-y-3',
        layout === 'sticky' && 'sticky top-12',
        className,
      )}
    >
      {/* 선수 개념 */}
      <Card title="선수 개념" icon={BookOpen} subtitle="이 문제 전에 굳어 있어야 하는 것">
        <ul className="space-y-1.5">
          {data.rootGraph.prerequisites.map(p => (
            <ConceptRow key={p.id} label={p.label} coachHref={coachHref(p.label)} />
          ))}
        </ul>
      </Card>

      {/* 한 줄 암기문 */}
      <Card title="암기 닻" icon={Pin} subtitle="이 한 줄만 남으면 OK">
        <p className="text-pullim-slate-900 text-sm font-bold leading-snug">
          {data.memoryAnchor.line}
        </p>
        <p className="text-pullim-slate-500 mt-2 inline-flex items-center gap-1 text-[11px]">
          <Calendar className="h-3 w-3" aria-hidden />
          다음 복습 {data.memoryAnchor.nextReviewIn}
        </p>
      </Card>

      {/* 이어지는 개념 */}
      <Card title="이어지는 개념" icon={Compass} subtitle="이 문제 뒤에 만나는 것">
        <ul className="space-y-1.5">
          {data.rootGraph.nextUses.map(n => (
            <ConceptRow key={n.id} label={n.label} coachHref={coachHref(n.label)} muted />
          ))}
        </ul>
      </Card>

      {/* 패널 전체에 대한 코치 진입 */}
      <Link
        href={`/q/talk?context=${encodeURIComponent(sku)}`}
        className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-colors"
      >
        <MessageCircleQuestion className="h-4 w-4" />
        코치에게 더 묻기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function Card({
  title, subtitle, icon: Icon, children,
}: {
  title: string; subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card rounded-xl border p-3.5">
      <header className="mb-2 flex items-center gap-1.5">
        <Icon className="text-pullim-blue-600 h-3.5 w-3.5" aria-hidden />
        <h4 className="text-pullim-slate-900 text-xs font-bold tracking-tight">{title}</h4>
        <span className="text-pullim-slate-400 ml-auto text-[10px]">{subtitle}</span>
      </header>
      {children}
    </section>
  );
}

function ConceptRow({
  label, coachHref, muted,
}: {
  label: string; coachHref: string; muted?: boolean;
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        className={cn(
          'h-1 w-1 shrink-0 rounded-full',
          muted ? 'bg-pullim-slate-300' : 'bg-pullim-blue-500',
        )}
        aria-hidden
      />
      <span className="text-pullim-slate-800 flex-1 truncate text-xs font-semibold">
        {label}
      </span>
      <Link
        href={coachHref}
        aria-label={`${label} — 코치에게 더 묻기`}
        className="hover:bg-pullim-slate-100 text-pullim-slate-400 hover:text-pullim-blue-600 inline-flex items-center rounded p-0.5"
      >
        <MessageCircleQuestion className="h-3 w-3" aria-hidden />
      </Link>
    </li>
  );
}
