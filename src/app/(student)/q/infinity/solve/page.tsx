'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Infinity, ArrowRight, ArrowLeft, BookOpen, Check, X, Target } from 'lucide-react';
import { toast } from 'sonner';
import {
  type SolveMode, type MockExam, solveDeck, modeFeatureMap, featureLabels,
  type FeatureKey, type SolveProblem,
  subjectLabels, type SubjectKey,
  patternNameForSku, subjectForSku,
  leitnerMeta, type LeitnerBox,
} from '@/lib/mock';
import { useLeitnerStore } from '@/lib/store/leitner-store';
import { useSolveSessionStore } from '@/lib/store/solve-session-store';
import { SolveResumeCard } from '@/components/infinity/solve-resume-card';
import { ModeToggle } from '@/components/infinity/mode-toggle';
import { ExamConfirmDialog } from '@/components/infinity/exam-confirm-dialog';
import { ExamStatusBar } from '@/components/infinity/exam-status-bar';
import { ProblemDisplay } from '@/components/infinity/problem-display';
import { CoachPane } from '@/components/infinity/coach-pane';
import { OmrSheet } from '@/components/infinity/omr-sheet';
import { SolveSessionBar, type SolveSourceMeta } from '@/components/infinity/solve-session-bar';
import { SolveSessionPicker } from '@/components/infinity/solve-session-picker';
import { FullscreenToggle } from '@/components/infinity/fullscreen-toggle';
import { PageHeader } from '@/components/shell/page-header';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

type SolveSession = {
  subject: SubjectKey;
  unitTitle: string;
  source: SolveSourceMeta;
  total: number;
};

function deriveSessionFromParams(params: URLSearchParams): SolveSession | null {
  const kind = params.get('kind');
  if (!kind) return null;

  if (kind === 'retry') {
    const sku = params.get('sku');
    if (!sku) return null;
    const sample = solveDeck.find(p => p.sku === sku);
    const subject =
      sample?.subject ?? (params.get('subject') as SubjectKey | null) ?? subjectForSku(sku) ?? null;
    if (!subject) return null;
    const pattern = patternNameForSku(sku);
    return {
      subject,
      unitTitle: sample?.unit ?? pattern ?? '오답 다시 풀기',
      source: { kind: 'retry', sku, patternName: pattern },
      total: 1,
    };
  }

  const subject = params.get('subject') as SubjectKey | null;
  if (!subject) return null;
  const sample = solveDeck.find(p => p.subject === subject);

  if (kind === 'free') {
    return {
      subject,
      unitTitle: sample?.unit ?? `${subjectLabels[subject]} · 적응형 자유 풀이`,
      source: { kind: 'free' },
      total: 5,
    };
  }
  if (kind === 'weak') {
    const pattern = params.get('pattern') ?? '약점 보강';
    return {
      subject,
      unitTitle: pattern,
      source: { kind: 'weak', patternName: pattern },
      total: 5,
    };
  }
  return null;
}

export default function InfinitySolvePage() {
  return (
    <Suspense fallback={null}>
      <InfinitySolveInner />
    </Suspense>
  );
}

function InfinitySolveInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const session = useMemo(
    () => deriveSessionFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const sessionKey = session
    ? session.source.kind === 'retry'
      ? `retry:${session.source.sku}`
      : `${session.source.kind}:${session.subject}:${'patternName' in session.source ? session.source.patternName : 'free'}`
    : 'none';

  const sessionDeck: SolveProblem[] = useMemo(() => {
    if (!session) return [];
    if (session.source.kind === 'retry') {
      const sku = session.source.sku;
      const found = solveDeck.find(p => p.sku === sku);
      if (found) return [found];
      const fallback = solveDeck.filter(p => p.subject === session.subject);
      return fallback.length > 0 ? [fallback[0]!] : [];
    }
    const filtered = solveDeck.filter(p => p.subject === session.subject);
    return filtered.length > 0 ? filtered : solveDeck;
  }, [session]);

  const applyLeitnerResult = useLeitnerStore(s => s.applyResult);
  const saveSnapshot = useSolveSessionStore(s => s.saveSnapshot);
  const clearSnapshot = useSolveSessionStore(s => s.clearSnapshot);
  const setInProgress = useSolveSessionStore(s => s.setInProgress);
  const persistedSnapshot = useSolveSessionStore(s => s.snapshot);

  const [mode, setMode] = useState<SolveMode>('practice');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);
  const [examRemaining, setExamRemaining] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [hintsByProblem, setHintsByProblem] = useState<Record<string, number>>({});
  const [prevSessionKey, setPrevSessionKey] = useState(sessionKey);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryBoxMove, setRetryBoxMove] = useState<{
    prevBox: LeitnerBox; newBox: LeitnerBox; isMaster: boolean; correct: boolean;
  } | null>(null);

  if (prevSessionKey !== sessionKey) {
    setPrevSessionKey(sessionKey);
    // sessionKey 가 저장된 snapshot 과 정확히 일치하면 자동 복원, 아니면 리셋.
    if (persistedSnapshot && persistedSnapshot.sessionKey === sessionKey) {
      setCurrentIdx(persistedSnapshot.currentIdx);
      setAnswers(persistedSnapshot.answers);
      setMarked(new Set(persistedSnapshot.marked));
      setHintsByProblem(persistedSnapshot.hintsByProblem);
    } else {
      setCurrentIdx(0);
      setAnswers({});
      setMarked(new Set());
      setHintsByProblem({});
    }
    setRetryBoxMove(null);
  }

  // plan §3 — 풀이 중일 때만 LeaveGuard 활성. 연습+세션 모드일 때.
  const isResumableSession =
    !!session &&
    mode === 'practice' &&
    (session.source.kind === 'free' || session.source.kind === 'weak');

  useEffect(() => {
    if (!isResumableSession) {
      setInProgress(false);
      return;
    }
    setInProgress(true);
    return () => setInProgress(false);
  }, [isResumableSession, setInProgress]);

  // 풀이 상태 변경 시 snapshot 저장 (연습+세션 모드 한정).
  useEffect(() => {
    if (!isResumableSession || !session) return;
    // 진행이 전혀 없는 빈 시작 상태는 굳이 저장 안 함 (오류 시 stale 노출 방지)
    if (currentIdx === 0 && Object.keys(answers).length === 0) return;
    saveSnapshot({
      sessionKey,
      subject: session.subject,
      unitTitle: session.unitTitle,
      source: session.source,
      currentIdx,
      answers,
      marked: Array.from(marked),
      hintsByProblem,
      total: session.total,
    });
  }, [isResumableSession, session, sessionKey, currentIdx, answers, marked, hintsByProblem, saveSnapshot]);

  // 마지막 문제 완답 시 snapshot 폐기.
  useEffect(() => {
    if (!isResumableSession || !session) return;
    const answered = Object.keys(answers).length;
    if (answered >= session.total) clearSnapshot();
  }, [answers, isResumableSession, session, clearSnapshot]);

  function handleAdvanceHint(sku: string, max: number) {
    setHintsByProblem(prev => {
      const cur = prev[sku] ?? 0;
      if (cur >= max) return prev;
      return { ...prev, [sku]: cur + 1 };
    });
  }

  const examInProgress = mode === 'exam' && !!activeExam;
  const totalProblems = activeExam ? activeExam.problemCount : (session?.total ?? 0);
  const problem: SolveProblem | null =
    sessionDeck.length > 0 ? sessionDeck[currentIdx % sessionDeck.length]! : null;

  const blockedToast = useMemo(() => (key: FeatureKey) => {
    const allowed = modeFeatureMap[mode][key];
    if (allowed) return;
    const otherMode: SolveMode = mode === 'practice' ? 'exam' : 'practice';
    toast.warning(`${featureLabels[key]} 사용 불가`, {
      description: `${mode === 'practice' ? '연습' : '시험'} 모드에서는 차단된 기능이에요. 필요하면 ${otherMode === 'practice' ? '연습' : '시험'} 모드로 전환하세요.`,
      duration: 3000,
    });
  }, [mode]);

  function handlePickFree(subject: SubjectKey) {
    const params = new URLSearchParams();
    params.set('kind', 'free');
    params.set('subject', subject);
    router.replace(`/q/infinity/solve?${params.toString()}`);
  }

  function handlePickWeak(subject: SubjectKey, patternName: string) {
    const params = new URLSearchParams();
    params.set('kind', 'weak');
    params.set('subject', subject);
    params.set('pattern', patternName);
    router.replace(`/q/infinity/solve?${params.toString()}`);
  }

  function handleChangeSession() {
    router.replace('/q/infinity/solve');
  }

  function handleEnterExam(exam: MockExam) {
    setMode('exam');
    setActiveExam(exam);
    setExamRemaining(exam.duration * 60);
    setCurrentIdx(0);
    setAnswers({});
    setMarked(new Set());
    toast.success('시험 모드 시작', {
      description: `${exam.title} · ${exam.duration}분 · ${exam.problemCount}문항. AI 코치·힌트·해설은 제출 후 공개돼요.`,
      duration: 4500,
    });
  }

  function handleExitExam() {
    setMode('practice');
    setActiveExam(null);
    toast.success('연습 모드로 돌아왔어요', {
      description: 'AI 코치, 5단계 힌트, 풀림 해설을 다시 사용할 수 있어요.',
      duration: 3000,
    });
  }

  function handleSubmit() {
    const answered = Object.keys(answers).length;
    toast.info('시험 제출 (데모)', {
      description: `${answered}/${totalProblems} 마킹 · 자동 채점·풀림 해설 12-섹션이 곧 공개돼요.`,
      duration: 4500,
    });
    handleExitExam();
  }

  function handleSelect(choiceIdx: number) {
    const alreadyAnswered = answers[currentIdx] !== undefined;
    setAnswers(a => ({ ...a, [currentIdx]: choiceIdx }));

    // retry 모드 — 첫 선택일 때만 Leitner 박스 전이 적용
    if (
      !alreadyAnswered &&
      mode === 'practice' &&
      session?.source.kind === 'retry' &&
      problem
    ) {
      const correct = choiceIdx === problem.answerIndex;
      const result = applyLeitnerResult(session.source.sku, correct);
      if (result) {
        setRetryBoxMove({ ...result, correct });
        const meta = leitnerMeta[result.newBox];
        if (result.isMaster) {
          toast.success(`마스터 임박! BOX ${result.prevBox} → BOX 5`, {
            description: `${meta.tag} · 다음 복습 ${meta.interval} 후`,
            duration: 4500,
          });
        } else if (correct) {
          toast.success(`BOX ${result.prevBox} → BOX ${result.newBox} 이동`, {
            description: `정복 진행 · 다음 복습 ${meta.interval} 후`,
            duration: 3500,
          });
        } else {
          toast.warning(`BOX ${result.prevBox} → BOX 1 복귀`, {
            description: `다음 복습 ${leitnerMeta[1].interval} 후 다시 풀어요`,
            duration: 3500,
          });
        }
      }
    }
  }

  function handleToggleMark() {
    if (mode === 'practice') {
      blockedToast('mark');
      return;
    }
    setMarked(m => {
      const next = new Set(m);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  }

  function go(delta: number) {
    setCurrentIdx(i => Math.max(0, Math.min(totalProblems - 1, i + delta)));
  }

  const headerTitle =
    mode === 'exam' && activeExam ? activeExam.title :
    session ? `${subjectLabels[session.subject]} · ${session.unitTitle}` :
    '오늘 무엇을 풀까요?';

  const headerDescription =
    mode === 'exam'
      ? undefined
      : session
        ? '연습 모드 — AI 코치 + 5단계 힌트가 옆에서 도와줘요.'
        : '한 세션을 골라 시작해 주세요. 플래너 블록·약점 보강·자유 풀이 중 선택할 수 있어요.';

  return (
    <div
      className={cn(
        'space-y-4',
        isFullscreen && 'fixed inset-0 z-50 overflow-auto bg-pullim-slate-50 p-4 lg:p-8',
      )}
    >
      {!isFullscreen && (
        <PageHeader
          eyebrow={{ icon: Infinity, text: '풀이 워크스페이스' }}
          title={headerTitle}
          description={headerDescription}
        />
      )}

      <div className="flex items-center justify-end">
        <FullscreenToggle isOn={isFullscreen} onToggle={setIsFullscreen} />
      </div>

      {/* 세션 컨텍스트 — 활성 세션이면 바, 아니면 picker */}
      {session && mode === 'practice' && (
        <SolveSessionBar
          subject={session.subject}
          unitTitle={session.unitTitle}
          source={session.source}
          current={Math.min(currentIdx + 1, session.total)}
          answered={Object.keys(answers).length}
          total={session.total}
          onChange={handleChangeSession}
        />
      )}

      {/* 모드 토글 — 시험 모드는 세션 없이도 가능 (모의고사 세트 별도) */}
      <ModeToggle
        mode={mode}
        onChange={setMode}
        onRequestExam={() => setConfirmOpen(true)}
        examInProgress={examInProgress}
      />
      <ExamConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleEnterExam}
        currentSubject={session?.subject}
      />

      {/* 연습 모드 — 세션 없고 저장된 세션 있으면 이어풀기 카드 (plan §2 분기 2) */}
      {mode === 'practice' && !session && persistedSnapshot && (
        <SolveResumeCard snapshot={persistedSnapshot} />
      )}

      {/* 연습 모드 — 세션 없으면 picker */}
      {mode === 'practice' && !session && (
        <SolveSessionPicker onPickFree={handlePickFree} onPickWeak={handlePickWeak} />
      )}

      {/* 연습 모드 — 세션 있으면 워크스페이스 */}
      {mode === 'practice' && session && problem && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <ProblemDisplay
                problem={problem}
                index={currentIdx}
                total={totalProblems}
                selected={answers[currentIdx]}
                onSelect={handleSelect}
                examMode={false}
                revealed={answers[currentIdx] !== undefined}
                correctAnswer={problem.answerIndex}
              />
              {answers[currentIdx] !== undefined && (
                <AnswerFeedback
                  isCorrect={answers[currentIdx] === problem.answerIndex}
                  sku={problem.sku}
                  shortExplain={problem.shortExplanation}
                  correctIndex={problem.answerIndex}
                  subject={problem.subject}
                  patternName={patternNameForSku(problem.sku) ?? problem.unit}
                  hideSimilarCta={
                    session?.source.kind === 'weak' &&
                    session.source.patternName === (patternNameForSku(problem.sku) ?? problem.unit)
                  }
                  boxMove={session?.source.kind === 'retry' ? retryBoxMove : null}
                />
              )}
              <PracticeBottomBar
                currentIdx={currentIdx}
                total={totalProblems}
                answered={answers[currentIdx] !== undefined}
                onPrev={() => go(-1)}
                onNext={() => go(1)}
              />
            </div>
            <div className="lg:sticky lg:top-12 lg:self-start">
              <CoachPane
                problem={problem}
                hintIndex={hintsByProblem[problem.sku] ?? 0}
                onAdvanceHint={() => handleAdvanceHint(problem.sku, problem.hints.length)}
              />
            </div>
          </div>
        </>
      )}

      {/* 시험 모드 */}
      {mode === 'exam' && (
        <>
          <ExamStatusBar
            totalSec={(activeExam?.duration ?? 100) * 60}
            remainingSec={examRemaining}
            onTimeout={handleSubmit}
          />
          {problem && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,320px)]">
              <div className="space-y-3">
                <ProblemDisplay
                  problem={problem}
                  index={currentIdx}
                  total={totalProblems}
                  selected={answers[currentIdx]}
                  onSelect={handleSelect}
                  examMode={true}
                  marked={marked.has(currentIdx)}
                  onToggleMark={handleToggleMark}
                />
                <div className="bg-pullim-slate-100 text-pullim-slate-500 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed py-3 px-3 text-center text-xs w-full">
                  <Lock className="h-3.5 w-3.5" />
                  시험 모드 — AI 코치·힌트·풀림 해설 모두 차단. 제출 후 공개.
                </div>
                <ExamBottomBar
                  currentIdx={currentIdx}
                  total={totalProblems}
                  onPrev={() => go(-1)}
                  onNext={() => go(1)}
                />
              </div>
              <div className="lg:sticky lg:top-12 lg:self-start">
                <OmrSheet
                  total={totalProblems}
                  current={currentIdx}
                  answers={answers}
                  marked={marked}
                  onJump={setCurrentIdx}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

function AnswerFeedback({
  isCorrect, sku, shortExplain, correctIndex, subject, patternName, hideSimilarCta, boxMove,
}: {
  isCorrect: boolean; sku: string; shortExplain: string; correctIndex: number;
  subject: SubjectKey; patternName: string; hideSimilarCta?: boolean;
  boxMove?: { prevBox: LeitnerBox; newBox: LeitnerBox; isMaster: boolean; correct: boolean } | null;
}) {
  const similarHref =
    `/q/infinity/solve?kind=weak&subject=${subject}&pattern=${encodeURIComponent(patternName)}`;
  return (
    <section
      className={
        'rounded-xl border-2 p-3 ' +
        (isCorrect
          ? 'border-pullim-success bg-pullim-success-bg'
          : 'border-pullim-danger bg-pullim-danger-bg')
      }
    >
      <div className="flex items-center gap-2">
        <span
          className={
            'flex h-7 w-7 items-center justify-center rounded-full text-white ' +
            (isCorrect ? 'bg-pullim-success' : 'bg-pullim-danger')
          }
        >
          {isCorrect ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
        </span>
        <h3 className={'text-sm font-bold ' + (isCorrect ? 'text-pullim-success' : 'text-pullim-danger')}>
          {isCorrect ? '정답!' : '아쉬워요'}
        </h3>
        <span className="text-pullim-slate-500 ml-auto text-[10px]">
          정답 <span className="font-mono font-bold">{['①','②','③','④','⑤'][correctIndex]}</span>
        </span>
      </div>
      {boxMove && (
        <div
          className={
            'mt-2 flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 text-[11px] ' +
            (boxMove.correct
              ? 'border-pullim-success/40 text-pullim-success'
              : 'border-pullim-warn/40 text-pullim-warn')
          }
        >
          <Target className="h-3 w-3 shrink-0" />
          {boxMove.isMaster ? (
            <span>
              <strong>마스터 임박!</strong> BOX {boxMove.prevBox} → BOX 5 · 다음 복습 {leitnerMeta[5].interval} 후
            </span>
          ) : boxMove.correct ? (
            <span>
              <strong>BOX {boxMove.prevBox} → BOX {boxMove.newBox}</strong> 이동 · 다음 복습 {leitnerMeta[boxMove.newBox].interval} 후
            </span>
          ) : (
            <span>
              <strong>BOX {boxMove.prevBox} → BOX 1</strong> 복귀 · 다음 복습 {leitnerMeta[1].interval} 후
            </span>
          )}
        </div>
      )}
      <p className="text-pullim-slate-700 mt-2 rounded bg-white p-2 text-xs leading-relaxed">
        <strong>한 줄 해설:</strong> {shortExplain}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Link
          href={`/q/infinity/explain/${sku}`}
          className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
        >
          <BookOpen className="h-3 w-3" />
          풀림 해설 12-섹션 자세히 보기
        </Link>
        {!hideSimilarCta && (
          <Link
            href={similarHref}
            className={
              'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ' +
              (isCorrect
                ? 'bg-pullim-slate-100 hover:bg-pullim-slate-200 text-pullim-slate-700'
                : 'bg-pullim-warn hover:bg-pullim-warn/90 text-white')
            }
          >
            <Target className="h-3 w-3" />
            이 패턴 더 풀기
          </Link>
        )}
      </div>
    </section>
  );
}

function PracticeBottomBar({
  currentIdx, total, answered, onPrev, onNext,
}: {
  currentIdx: number; total: number; answered: boolean;
  onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="bg-card flex items-center gap-2 rounded-xl border p-2.5">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIdx === 0}
        className="hover:bg-pullim-slate-50 disabled:opacity-30 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
      >
        <ArrowLeft className="h-3 w-3" />
        이전
      </button>
      <div className="text-pullim-slate-500 flex-1 text-center text-[11px]">
        {answered ? <span className="text-pullim-success font-semibold">정답 확인 중</span> : '풀이 중'}
        <span className="mx-1.5">·</span>
        <span className="font-mono">{currentIdx + 1}/{total}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="bg-pullim-blue-600 hover:bg-pullim-blue-700 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
      >
        다음 문제
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function ExamBottomBar({
  currentIdx, total, onPrev, onNext,
}: {
  currentIdx: number; total: number;
  onPrev: () => void; onNext: () => void;
}) {
  return (
    <div className="bg-card flex items-center gap-2 rounded-xl border p-2.5">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentIdx === 0}
        className="hover:bg-pullim-slate-50 disabled:opacity-30 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
      >
        <ArrowLeft className="h-3 w-3" />
        이전 문항
      </button>
      <div className="text-pullim-slate-500 flex-1 text-center text-[11px] font-mono">
        문항 {currentIdx + 1} / {total}
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIdx === total - 1}
        className="bg-pullim-warn hover:bg-pullim-warn/90 disabled:opacity-30 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
      >
        다음 문항
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}
