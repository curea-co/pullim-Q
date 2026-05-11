import Link from 'next/link';
import { Wrench, ArrowLeft, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/shell/page-header';

export default function ExternalStudioStubPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: Wrench, text: '풀림 스튜디오' }}
        title="곧 열려요"
        description="문제를 직접 만드는 풀림 스튜디오. 지금은 풀림 Q에서 풀이·분석에만 집중하고 있어요."
      />
      <section className="bg-pullim-blue-50/40 rounded-2xl border border-dashed p-6">
        <h2 className="text-pullim-slate-900 text-base font-bold">스튜디오에서 할 수 있는 것</h2>
        <ul className="text-pullim-slate-700 mt-3 space-y-1.5 text-sm leading-relaxed">
          <li>· 본인 약점에 맞춘 문제를 직접 만들어요</li>
          <li>· 교사·강사라면 반 학생에게 풀이 세트를 발송해요</li>
          <li>· 완성된 문제는 풀림 Q에서 바로 풀이·분석</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/q"
            className="text-pullim-slate-700 hover:bg-pullim-slate-100 inline-flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-sm font-bold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            풀림 Q 홈으로
          </Link>
          <span className="bg-pullim-slate-100 text-pullim-slate-500 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold">
            <ExternalLink className="h-3.5 w-3.5" />
            정식 도메인 준비 중
          </span>
        </div>
      </section>
    </div>
  );
}
