import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookmarkPlus, Share2, Star, Eye } from 'lucide-react';
import {
  explainLibrary, explainSampleMathCalc, solveDeck, subjectLabels,
} from '@/lib/mock';
import { AnchorNav } from '@/components/infinity/explain/anchor-nav';
import {
  HeroRecap, Prologue, FourPathSpine, RootGraph, ErrorAnatomy,
  HundredChoices, VisualCanvas, PatternFamily, FeynmanChallenge,
  TeacherVoices, HistoryReal, MemoryAnchor,
} from '@/components/infinity/explain/sections';

export function generateStaticParams() {
  // 데모는 첫 번째 SKU만 실제 12-섹션 구현, 나머지는 placeholder
  return explainLibrary.map(e => ({ sku: e.sku }));
}

type Props = { params: Promise<{ sku: string }> };

export default async function ExplainDetailPage({ params }: Props) {
  const { sku } = await params;
  const entry = explainLibrary.find(e => e.sku === sku);
  if (!entry) notFound();

  // 문제 발문·선지 — solveDeck에서 매칭, 없으면 sample
  const problem = solveDeck.find(p => p.sku === sku);
  const statement = problem?.statement ?? '문제 발문 (데모용 — 풀이 deck에 등록되지 않음)';
  const choices = problem?.choices ?? ['보기 1', '보기 2', '보기 3', '보기 4', '보기 5'];

  // 12-섹션 데이터 — 데모는 sampleMathCalc 사용 (실제론 SKU별로 별도)
  const data = explainSampleMathCalc;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <header>
        <Link
          href="/q/infinity/explain"
          className="text-pullim-slate-500 hover:text-pullim-blue-600 mb-2 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="h-3 w-3" />
          해설 라이브러리
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
              <span className="bg-pullim-slate-900 rounded px-1.5 py-0.5 font-mono text-white">
                {entry.sku}
              </span>
              <span className="text-pullim-slate-500">{subjectLabels[entry.subject]} · {entry.unit}</span>
              {entry.isSignature && (
                <span className="bg-pullim-warn inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-white">
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden />
                  SIGNATURE
                </span>
              )}
            </div>
            <h1 className="text-pullim-slate-900 mt-1 text-2xl font-bold tracking-tight">
              {entry.summary}
            </h1>
            <p className="text-pullim-slate-500 mt-0.5 inline-flex items-center gap-1 text-xs">
              <span>풀림 해설 12-섹션</span>
              <span aria-hidden>·</span>
              <Star className="text-pullim-warn h-3 w-3 fill-current" aria-hidden />
              <span>{entry.rating}</span>
              <span aria-hidden>·</span>
              <Eye className="h-3 w-3" aria-hidden />
              <span>{entry.views.toLocaleString()}회 조회</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button className="bg-pullim-slate-100 hover:bg-pullim-slate-200 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold">
              <BookmarkPlus className="h-3.5 w-3.5" />
              북마크
            </button>
            <button className="bg-pullim-slate-100 hover:bg-pullim-slate-200 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold">
              <Share2 className="h-3.5 w-3.5" />
              공유
            </button>
          </div>
        </div>
      </header>

      {/* 와이드 2-col: 좌측 sticky anchor nav, 우측 12-섹션 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
        {/* 좌측 anchor */}
        <aside className="hidden lg:block">
          <div className="bg-card sticky top-12 rounded-xl border p-2">
            <div className="text-pullim-slate-500 px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
              12 섹션
            </div>
            <AnchorNav />
          </div>
        </aside>

        {/* 우측 본문 — 12 섹션 순차 */}
        <div className="space-y-4">
          <HeroRecap data={data} problemStatement={statement} choices={choices} />
          <Prologue data={data} />
          <FourPathSpine paths={data.paths} />
          <RootGraph data={data} />
          <ErrorAnatomy data={data} />
          <HundredChoices data={data} choices={choices} />
          <VisualCanvas data={data} />
          <PatternFamily data={data} />
          <FeynmanChallenge data={data} />
          <TeacherVoices data={data} />
          <HistoryReal data={data} />
          <MemoryAnchor data={data} />
        </div>
      </div>

      {/* 다음 액션 */}
      <section className="from-pullim-blue-600 to-pullim-blue-500 rounded-2xl bg-gradient-to-br p-5 text-white">
        <h2 className="text-lg font-bold tracking-tight">다음 행동</h2>
        <p className="text-pullim-blue-100 mt-1 text-sm">
          이 해설을 다 봤다면, 같은 패턴 친척 문제를 풀어 정복도를 올려요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/q/infinity/solve"
            className="text-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold transition-colors"
          >
            친척 문제 풀어보기
          </Link>
          <Link
            href="/q/review"
            className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            풀림 복습으로
          </Link>
          <Link
            href="/q/review"
            className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            풀림 복습에 저장
          </Link>
        </div>
      </section>
    </div>
  );
}
