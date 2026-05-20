'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  availableExams, modeFeatureMap, featureLabels,
  subjectLabels,
  type FeatureKey, type MockExam, type SubjectKey,
} from '@/lib/mock';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (exam: MockExam) => void;
  /** 현재 풀이 세션 과목 — 매칭되는 시험 세트만 우선 노출 */
  currentSubject?: SubjectKey;
};

export function ExamConfirmDialog({
  open, onOpenChange, onConfirm, currentSubject,
}: Props) {
  const matched = currentSubject
    ? availableExams.filter(e => e.subjectKey === currentSubject)
    : availableExams;
  const others = currentSubject
    ? availableExams.filter(e => e.subjectKey !== currentSubject)
    : [];

  const defaultId = matched[0]?.id ?? others[0]?.id ?? '';

  const [selectedId, setSelectedId] = useState<string>(defaultId);
  const [showOthers, setShowOthers] = useState(false);
  const [prevSubject, setPrevSubject] = useState(currentSubject);

  if (prevSubject !== currentSubject) {
    setPrevSubject(currentSubject);
    setSelectedId(defaultId);
    setShowOthers(false);
  }

  const selected = availableExams.find(e => e.id === selectedId);

  const blockedFeatures = (Object.keys(modeFeatureMap.practice) as FeatureKey[])
    .filter(k => modeFeatureMap.practice[k] && !modeFeatureMap.exam[k]);
  const enabledFeatures = (Object.keys(modeFeatureMap.exam) as FeatureKey[])
    .filter(k => modeFeatureMap.exam[k] && !modeFeatureMap.practice[k]);

  const subjectLabel = currentSubject ? subjectLabels[currentSubject] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="bg-pullim-warn flex h-8 w-8 items-center justify-center rounded-lg text-white">
              <AlertTriangle className="h-4 w-4" />
            </span>
            시험 모드를 시작할까요?
          </DialogTitle>
          <DialogDescription className="pt-1">
            실전 환경에서 모의고사를 풀어요. 시험 도중에는 일부 기능이 차단됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-pullim-slate-500 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase">
            <span>
              {subjectLabel ? `${subjectLabel} 시험 세트` : '시험 세트'}
            </span>
            {subjectLabel && (
              <span className="text-pullim-blue-600 normal-case font-semibold tracking-normal">
                현재 풀이 과목 기준 {matched.length}개
              </span>
            )}
          </div>

          {matched.length === 0 ? (
            <div className="bg-pullim-slate-50 text-pullim-slate-500 rounded-lg border border-dashed p-4 text-center text-xs">
              {subjectLabel} 시험 세트는 아직 준비 중이에요.
              <br />
              아래에서 다른 과목 시험을 골라 볼 수 있어요.
            </div>
          ) : (
            matched.map(exam => (
              <ExamRow
                key={exam.id}
                exam={exam}
                selected={selectedId === exam.id}
                onSelect={() => setSelectedId(exam.id)}
              />
            ))
          )}

          {others.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowOthers(s => !s)}
                className="text-pullim-slate-500 hover:text-pullim-slate-700 inline-flex items-center gap-1 text-[11px] font-semibold"
              >
                {showOthers ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                다른 과목 시험 {others.length}개 {showOthers ? '접기' : '보기'}
              </button>
              {showOthers && (
                <div className="space-y-2 pt-1">
                  {others.map(exam => (
                    <ExamRow
                      key={exam.id}
                      exam={exam}
                      selected={selectedId === exam.id}
                      onSelect={() => setSelectedId(exam.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-pullim-danger mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <X className="h-3 w-3" />
              차단되는 기능
            </div>
            <ul className="space-y-0.5">
              {blockedFeatures.map(k => (
                <li key={k} className="text-pullim-slate-600 flex items-start gap-1.5 text-[11px]">
                  <X className="text-pullim-danger mt-0.5 h-2.5 w-2.5 shrink-0" />
                  {featureLabels[k]}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-pullim-success mb-1.5 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Check className="h-3 w-3" />
              활성되는 기능
            </div>
            <ul className="space-y-0.5">
              {enabledFeatures.map(k => (
                <li key={k} className="text-pullim-slate-600 flex items-start gap-1.5 text-[11px]">
                  <Check className="text-pullim-success mt-0.5 h-2.5 w-2.5 shrink-0" />
                  {featureLabels[k]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-pullim-warn-bg text-pullim-warn rounded-lg px-3 py-2 text-[11px] leading-relaxed">
          <strong>시험 룰</strong> · 일시정지 불가 · 탭 이탈 자동 기록 · 제출 전까지 모드 변경 불가 ·
          제출 후 즉시 채점·해설 공개
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-pullim-slate-100 hover:bg-pullim-slate-200 rounded-lg px-3.5 py-2 text-sm font-semibold"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onConfirm(selected);
              onOpenChange(false);
            }}
            className="bg-pullim-warn-cta-bg hover:bg-pullim-warn-cta-bg/90 disabled:opacity-50 disabled:pointer-events-none rounded-lg px-3.5 py-2 text-sm font-bold text-white"
          >
            시험 시작{selected ? ` (${selected.duration}분)` : ''}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ExamRow({
  exam, selected, onSelect,
}: {
  exam: MockExam; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-exam-card={exam.id}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-lg border-2 px-3 py-2.5 text-left transition-all',
        selected
          ? 'border-pullim-warn bg-pullim-warn/5'
          : 'border-pullim-slate-200 hover:border-pullim-slate-400',
      )}
    >
      <span className="bg-pullim-slate-100 mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold">
        {exam.origin === 'past_actual' ? '기출' : exam.origin === 'studio' ? '강사' : 'AI'}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-pullim-slate-900 text-sm font-bold">{exam.title}</div>
        <div className="text-pullim-slate-500 text-[11px]">{exam.description}</div>
        <div className="text-pullim-slate-700 mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {exam.duration}분
          </span>
          <span>· {exam.problemCount}문항</span>
          <span>· {exam.totalScore}점 만점</span>
        </div>
      </div>
    </button>
  );
}
