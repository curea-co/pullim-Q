import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookmarkPlus, GraduationCap, Share2, Star, Eye, Target, MessageCircleQuestion } from 'lucide-react';
import {
  currentPersona,
  explainLibrary,
  explainSampleMathCalc,
  myAbility,
  patternNameForSku,
  solveDeck,
  subjectLabels,
  wrongAttemptDiagnoses,
} from '@/lib/mock';
import { AnchorNav } from '@/components/question-hub/anchor-nav';
import { getDepthMeta, getDepthRule } from '@/components/question-hub/depth';
import { LearningMaterialsPanel } from '@/components/question-hub/learning-materials-panel';
import { MobilePanelTrigger } from '@/components/question-hub/mobile-panel-trigger';
import {
  HeroRecap, Prologue, FourPathSpine, RootGraph, ErrorAnatomy,
  HundredChoices, VisualCanvas, PatternFamily, FeynmanChallenge,
  TeacherVoices, HistoryReal, MemoryAnchor,
} from '@/components/question-hub/sections';
import { WrongReasonHero } from '@/components/question-hub/wrong-reason-hero';

export function generateStaticParams() {
  // 데모는 explainLibrary 의 SKU 들만 정적 생성
  return explainLibrary.map(e => ({ questionId: e.sku }));
}

type Props = {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function QuestionHubPage({ params, searchParams }: Props) {
  const { questionId } = await params;
  const { from } = await searchParams;
  const entry = explainLibrary.find(e => e.sku === questionId);
  if (!entry) notFound();

  const problem = solveDeck.find(p => p.sku === questionId);
  const statement = problem?.statement ?? '문제 발문 (데모용 — 풀이 deck에 등록되지 않음)';
  const choices = problem?.choices ?? ['보기 1', '보기 2', '보기 3', '보기 4', '보기 5'];

  // 12-섹션 데이터 — 데모는 sampleMathCalc 재사용
  const data = explainSampleMathCalc;

  // 오답 원인 진단 매칭 — 같은 SKU의 최근 시도
  const diagnosis = wrongAttemptDiagnoses.find(d => d.sku === questionId);
  const primarySubject = currentPersona.focusSubjects[0];

  // advice §4 기능 2 — 학생 등급별 depth 자동 펼침 (D2 결정 반영)
  const ability = myAbility.find(a => a.subject === entry.subject);
  const predictedGrade = ability?.expectedGrade ?? 5;
  const depth = getDepthRule(predictedGrade);
  const depthMeta = getDepthMeta(predictedGrade);

  const isFromLibrary = from === 'library';

  return (
    <div className="space-y-4">
      <header>
        <Link
          href={isFromLibrary ? '/q/infinity/explain' : '/q/analysis'}
          className="text-pullim-slate-500 hover:text-pullim-blue-600 mb-2 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ArrowLeft className="h-3 w-3" />
          {isFromLibrary ? '해설 라이브러리' : '풀림 분석'}
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
              <span>문제 단위 학습 허브</span>
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

      {/* advice §4 기능 1 — 오답 원인 진단 hero */}
      {diagnosis && (
        <WrongReasonHero
          diagnosis={diagnosis}
          studentChoice={choices[diagnosis.selectedIndex]}
          correctChoice={choices[diagnosis.correctIndex]}
          primarySubject={primarySubject}
        />
      )}

      {/* 학생 등급 기반 펼침 상태 안내 */}
      <p
        aria-label="해설 펼침 자동 조절 안내"
        className="text-pullim-slate-500 inline-flex items-center gap-1.5 text-[11px]"
      >
        <GraduationCap className="h-3 w-3" aria-hidden />
        예상 {predictedGrade}등급 — {depthMeta.label} ({depthMeta.openLabels.length}개 섹션 자동 펼침)
      </p>

      {/* 12-섹션 본문 — 좌측 anchor / 가운데 본문 / 우측 학습 재료 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_300px]">
        <aside className="hidden lg:block">
          <div className="bg-card sticky top-12 rounded-xl border p-2">
            <div className="text-pullim-slate-500 px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
              12-섹션
            </div>
            <AnchorNav />
          </div>
        </aside>

        <div className="space-y-4">
          <HeroRecap data={data} problemStatement={statement} choices={choices} defaultOpen={depth('s1')} />
          <Prologue data={data} defaultOpen={depth('s2')} />
          <FourPathSpine paths={data.paths} defaultOpen={depth('s3')} />
          <RootGraph data={data} defaultOpen={depth('s4')} />
          <ErrorAnatomy data={data} defaultOpen={depth('s5')} />
          <HundredChoices data={data} choices={choices} defaultOpen={depth('s6')} />
          <VisualCanvas data={data} defaultOpen={depth('s7')} />
          <PatternFamily data={data} defaultOpen={depth('s8')} />
          <FeynmanChallenge data={data} defaultOpen={depth('s9')} />
          <TeacherVoices data={data} defaultOpen={depth('s10')} />
          <HistoryReal data={data} defaultOpen={depth('s11')} />
          <MemoryAnchor data={data} defaultOpen={depth('s12')} />
        </div>

        <aside aria-label="학습 재료 패널" className="hidden lg:block">
          <LearningMaterialsPanel data={data} sku={entry.sku} />
        </aside>
      </div>

      {/* 모바일 — 우측 패널 대신 sticky 트리거 + Sheet */}
      <MobilePanelTrigger data={data} sku={entry.sku} />

      {/* 다음 행동 */}
      <section className="from-pullim-blue-600 to-pullim-blue-500 rounded-2xl bg-gradient-to-br p-5 text-white">
        <h2 className="text-lg font-bold tracking-tight">다음 행동</h2>
        <p className="text-pullim-blue-100 mt-1 text-sm">
          이 문제 단서를 더 굳히려면 같은 유형으로 더 풀거나, 막힌 부분은 코치에게 물어봐요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/q/infinity/solve?kind=weak&subject=${entry.subject}&pattern=${encodeURIComponent(patternNameForSku(entry.sku) ?? entry.unit)}`}
            className="text-pullim-blue-700 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold transition-colors"
          >
            <Target className="h-4 w-4" />
            이 유형으로 더 풀기
          </Link>
          <Link
            href={`/q/infinity/solve?kind=retry&sku=${entry.sku}`}
            className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            이 문제 다시 풀기
          </Link>
          <Link
            href={`/q/talk?context=${encodeURIComponent(entry.sku)}`}
            className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            <MessageCircleQuestion className="h-4 w-4" />
            코치에게 더 묻기
          </Link>
          <Link
            href="/q/review"
            className="bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors"
          >
            풀림 복습으로
          </Link>
        </div>
      </section>
    </div>
  );
}
