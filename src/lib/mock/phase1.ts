/**
 * Phase 1 섹션 — 진단/정복 mock (풀림 Q 전용).
 */

import type { SubjectKey } from './persona';

/** 진단 세션 메타 (인덱스/diagnose) */
export type DiagnosticSession = {
  totalQuestions: number;
  estimatedMin: number;
  /** 적응형 — 현재까지 문항·정답률 따라 다음 문제 선정 */
  isAdaptive: boolean;
  subjects: SubjectKey[];
  description: string;
};

export const quickDiagnostic: DiagnosticSession = {
  totalQuestions: 15,
  estimatedMin: 10,
  isAdaptive: true,
  subjects: ['math', 'english', 'science'],
  description:
    '15문항 맞춤 진단. 정답률에 따라 다음 문제 난이도가 자동 조정돼요. 결과는 실력 점수로 갱신됩니다.',
};

/** 정복 세트 한 개 (오답정복/conquer) — 패턴별 5문제 */
export type ConquestSet = {
  patternId: string;
  patternName: string;
  patternRoot: string;
  totalQuestions: number;
  conquestThreshold: number;
  currentStreak: number;
  attemptsToday: number;
};

export const todayConquestSet: ConquestSet = {
  patternId: 'ep1',
  patternName: '빈칸 추론 — 접속사 논리 관계 파악 미흡',
  patternRoot: 'however/therefore 같은 전환 접속사 뒤 주장 방향 판단 오류',
  totalQuestions: 5,
  conquestThreshold: 3,
  currentStreak: 1,
  attemptsToday: 2,
};
