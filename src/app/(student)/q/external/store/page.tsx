import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/shell/page-header';

export default function ExternalStoreStubPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={{ icon: ShoppingBag, text: '풀림 스토어' }}
        title="곧 열려요"
        description="문제집·교습서를 사고 파는 풀림 스토어. 지금은 풀림 Q에서 풀이·분석에만 집중하고 있어요."
      />
      <section className="bg-pullim-blue-50/40 rounded-2xl border border-dashed p-6">
        <h2 className="text-pullim-slate-900 text-base font-bold">스토어에서 할 수 있는 것</h2>
        <ul className="text-pullim-slate-700 mt-3 space-y-1.5 text-sm leading-relaxed">
          <li>· 풀림이 검증한 문제집·교습서를 사서 풀어요</li>
          <li>· 사용자가 만든 양질의 문제 세트도 함께</li>
          <li>· 산 책을 Q에서 풀면 오답·해설·유사문항 자동 분석</li>
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
