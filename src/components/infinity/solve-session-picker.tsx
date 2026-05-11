'use client';

import { Target, Lock, ArrowRight } from 'lucide-react';
import {
  subjectLabels,
  type SubjectKey,
} from '@/lib/mock';

type Props = {
  onPickFree: (subject: SubjectKey) => void;
  onPickWeak: (subject: SubjectKey, patternName: string) => void;
};

const FREE_AVAILABLE: SubjectKey[] = ['math', 'english', 'science'];
const FREE_LOCKED: SubjectKey[] = ['korean', 'social', 'history'];

const WEAK_RECOMMENDATIONS: { subject: SubjectKey; patternName: string; count: number; reason: string }[] = [
  { subject: 'math',    patternName: '미적분 — 도함수 부호 변화',  count: 8, reason: '최근 정답률 42%' },
  { subject: 'english', patternName: '독해 — 빈칸 추론 (논지 전환)', count: 5, reason: '최근 정답률 56%' },
];

export function SolveSessionPicker({ onPickFree, onPickWeak }: Props) {
  return (
    <section className="bg-card space-y-4 rounded-2xl border-2 border-dashed p-5">
      <header>
        <p className="text-pullim-blue-600 text-[11px] font-bold tracking-wider uppercase">
          풀이 세션 선택
        </p>
        <h2 className="text-pullim-slate-900 mt-0.5 text-base font-bold tracking-tight">
          오늘 무엇을 풀까요?
        </h2>
        <p className="text-pullim-slate-500 mt-1 text-xs leading-relaxed">
          한 세션 = 한 단원에 집중해서 풀어요. 과목·단원을 정해두고 시작해야 실력이 쌓여요.
        </p>
      </header>

      {WEAK_RECOMMENDATIONS.length > 0 && (
        <div className="space-y-2">
          <div className="text-pullim-warn inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
            <Target className="h-3 w-3" />
            약점 보강 추천 — 분석 데이터 기반
          </div>
          <ul className="space-y-1.5">
            {WEAK_RECOMMENDATIONS.map(w => (
              <li key={w.patternName}>
                <button
                  type="button"
                  onClick={() => onPickWeak(w.subject, w.patternName)}
                  className="hover:border-pullim-warn/50 hover:bg-pullim-warn/5 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
                >
                  <span className="bg-pullim-warn-bg text-pullim-warn flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <Target aria-hidden className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-pullim-slate-900 truncate text-sm font-bold">
                      {w.patternName}
                    </div>
                    <div className="text-pullim-slate-500 text-[11px]">
                      {subjectLabels[w.subject]} · {w.count}문제 · {w.reason}
                    </div>
                  </div>
                  <ArrowRight className="text-pullim-slate-300 h-4 w-4 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-pullim-slate-700 text-[11px] font-bold tracking-wider uppercase">
          자유 풀이 — 과목 선택
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FREE_AVAILABLE.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onPickFree(s)}
              className="hover:border-pullim-blue-300 hover:bg-pullim-blue-50 group flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors"
            >
              <span className="bg-pullim-slate-50 group-hover:bg-pullim-blue-100 text-pullim-slate-700 group-hover:text-pullim-blue-700 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-colors">
                {subjectLabels[s][0]}
              </span>
              <span className="text-pullim-slate-700 text-xs font-bold">
                {subjectLabels[s]}
              </span>
            </button>
          ))}
          {FREE_LOCKED.map(s => (
            <div
              key={s}
              className="bg-pullim-slate-50 flex flex-col items-center gap-1.5 rounded-xl border border-dashed p-3 opacity-60"
            >
              <span className="bg-pullim-slate-100 text-pullim-slate-400 flex h-10 w-10 items-center justify-center rounded-xl">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <span className="text-pullim-slate-400 text-xs font-bold">
                {subjectLabels[s]}
              </span>
              <span className="text-pullim-slate-400 text-[9px]">준비 중</span>
            </div>
          ))}
        </div>
        <p className="text-pullim-slate-400 mt-1 text-[10px]">
          자유 풀이는 AI가 내 실력에 맞게 단원을 자동 섞어줘요.
        </p>
      </div>
    </section>
  );
}
