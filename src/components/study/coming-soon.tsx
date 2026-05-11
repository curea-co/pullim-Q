import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { features } from '@/lib/mock';

export function ComingSoon({
  slug,
  title,
  tagline,
}: {
  slug?: string;
  title?: string;
  tagline?: string;
}) {
  const feature = slug ? features.find(f => f.slug === slug) : undefined;
  const heading = title ?? feature?.name ?? '준비 중';
  const sub = tagline ?? feature?.tagline ?? '곧 만나요';

  return (
    <div className="bg-card flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border p-8 text-center">
      <span className="bg-pullim-blue-50 text-pullim-blue-600 mb-4 rounded-full px-3 py-1 text-xs font-semibold">
        준비 중
      </span>
      <h1 className="text-pullim-slate-900 text-xl font-bold tracking-tight">
        {heading}
      </h1>
      <p className="text-pullim-slate-500 mt-1.5 max-w-sm text-sm">{sub}</p>
      <Link
        href="/"
        className="text-pullim-blue-600 mt-6 inline-flex items-center gap-1 text-sm font-semibold"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
