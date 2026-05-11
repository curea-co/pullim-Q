/**
 * 풀림 오답정복 — Leitner 5-box + 에러 패턴 mock.
 * 03_스터디_마스터.md 4.3 + 09_Q_핸드오프.md 4.5, 7.3~7.4 기반.
 */

import type { SubjectKey } from './persona';

/** Leitner 박스 레벨 — 복습 주기 */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export const leitnerMeta: Record<LeitnerBox, { interval: string; days: number; tag: string }> = {
  1: { interval: '1일',  days: 1,  tag: '긴급 · 최근 실패'      },
  2: { interval: '3일',  days: 3,  tag: '단기 강화'            },
  3: { interval: '7일',  days: 7,  tag: '중기 저장'            },
  4: { interval: '14일', days: 14, tag: '장기 저장'            },
  5: { interval: '30일', days: 30, tag: '유지만 · 마스터 임박' },
};

/** 에러 패턴 — Q 7.4 */
export type ErrorPatternId = string;

export type ErrorPattern = {
  id: ErrorPatternId;
  code: string;          // ENG_BLANK_LOGIC_001
  subject: SubjectKey;
  name: string;
  rootCause: string;
  /** 최근 30일 발생 횟수 */
  frequency: number;
  /** 전체 정복 대상 수 */
  totalQuestions: number;
  /** 이미 정복한 수 */
  conquered: number;
  /** 난이도 범위 */
  difficultyRange: [number, number];
};

export const errorPatterns: ErrorPattern[] = [
  {
    id: 'ep1',
    code: 'ENG_BLANK_LOGIC_001',
    subject: 'english',
    name: '빈칸 추론 — 접속사 논리 관계 파악 미흡',
    rootCause: 'however/therefore 같은 전환 접속사 뒤 주장 방향 판단 오류',
    frequency: 7,
    totalQuestions: 12,
    conquered: 3,
    difficultyRange: [0.5, 0.7],
  },
  {
    id: 'ep2',
    code: 'MATH_BOUNDARY_003',
    subject: 'math',
    name: '경계 조건 누락 — 정의역·치역 체크 생략',
    rootCause: 'x ≥ 0 조건을 빠뜨리거나 극값 후보를 범위 밖에서 선택',
    frequency: 5,
    totalQuestions: 8,
    conquered: 2,
    difficultyRange: [0.6, 0.9],
  },
  {
    id: 'ep3',
    code: 'MATH_SIGN_CHANGE_002',
    subject: 'math',
    name: '부호 변화 생략 — f\'(x) = 0이면 무조건 극값으로 착각',
    rootCause: 'f\'(x) = 0 인 점에서 부호가 바뀌지 않으면 극값이 아니라는 점 놓침',
    frequency: 4,
    totalQuestions: 6,
    conquered: 4,
    difficultyRange: [0.4, 0.7],
  },
  {
    id: 'ep4',
    code: 'ENG_VOCAB_COLLOC_004',
    subject: 'english',
    name: '어휘 — 연어(collocation) 혼동',
    rootCause: 'make a decision / take a decision 등 문맥별 동사 선택 오류',
    frequency: 4,
    totalQuestions: 10,
    conquered: 1,
    difficultyRange: [0.3, 0.6],
  },
  {
    id: 'ep5',
    code: 'SCI_PHYS_EQUIL_005',
    subject: 'science',
    name: '평형 vs 가속도 혼동',
    rootCause: '알짜힘 = 0 (평형)인 경우에도 속도가 존재할 수 있음을 놓침',
    frequency: 3,
    totalQuestions: 5,
    conquered: 2,
    difficultyRange: [0.5, 0.8],
  },
];

/** 오답 카드 (Leitner) */
export type LeitnerCard = {
  id: string;
  problemSku: string;
  subject: SubjectKey;
  summary: string;
  errorPatternId: ErrorPatternId;
  box: LeitnerBox;
  /** 연속 성공 */
  streak: number;
  /** 다음 복습까지 (시간 단위, 음수면 overdue) */
  nextReviewInHours: number;
  /** 첫 오답 발생 N일 전 */
  firstMissedAgo: number;
  /** 총 시도 횟수 */
  attempts: number;
  /** 마지막 결과 */
  lastResult: 'correct' | 'wrong' | 'fresh';
};

export const leitnerCards: LeitnerCard[] = [
  // Overdue — 우선 표시
  { id: 'lc1', problemSku: 'Q-ENG-RDG-1205', subject: 'english', summary: '빈칸 추론 — however 뒤 주장 방향',            errorPatternId: 'ep1', box: 1, streak: 0, nextReviewInHours: -8,  firstMissedAgo: 2, attempts: 2, lastResult: 'wrong' },
  { id: 'lc2', problemSku: 'Q-MATH-CALC-0042', subject: 'math',  summary: 'f(x) = x³ − 3x + 1의 극값',                  errorPatternId: 'ep3', box: 1, streak: 0, nextReviewInHours: -2,  firstMissedAgo: 1, attempts: 1, lastResult: 'wrong' },
  { id: 'lc3', problemSku: 'Q-ENG-RDG-1208', subject: 'english', summary: '빈칸 추론 — therefore 지시 대상',             errorPatternId: 'ep1', box: 2, streak: 1, nextReviewInHours: -24, firstMissedAgo: 5, attempts: 3, lastResult: 'correct' },
  // 오늘 복습
  { id: 'lc4', problemSku: 'Q-MATH-CALC-0051', subject: 'math',  summary: '정적분의 기하적 의미 — 범위 주의',            errorPatternId: 'ep2', box: 2, streak: 1, nextReviewInHours: 4,   firstMissedAgo: 4, attempts: 2, lastResult: 'correct' },
  { id: 'lc5', problemSku: 'Q-ENG-VOC-0872', subject: 'english', summary: 'make/take decision 연어 구분',               errorPatternId: 'ep4', box: 1, streak: 0, nextReviewInHours: 6,   firstMissedAgo: 3, attempts: 2, lastResult: 'wrong' },
  { id: 'lc6', problemSku: 'Q-SCI-PHY-0231', subject: 'science', summary: '엘리베이터 가속 시 수직항력',                 errorPatternId: 'ep5', box: 2, streak: 1, nextReviewInHours: 2,   firstMissedAgo: 7, attempts: 3, lastResult: 'correct' },
  // BOX 3~4
  { id: 'lc7', problemSku: 'Q-MATH-CALC-0038', subject: 'math',  summary: '접선의 기울기와 도함수 값',                  errorPatternId: 'ep3', box: 3, streak: 2, nextReviewInHours: 48,  firstMissedAgo: 10, attempts: 4, lastResult: 'correct' },
  { id: 'lc8', problemSku: 'Q-ENG-RDG-1189', subject: 'english', summary: '빈칸 추론 — nonetheless',                   errorPatternId: 'ep1', box: 3, streak: 2, nextReviewInHours: 72,  firstMissedAgo: 12, attempts: 4, lastResult: 'correct' },
  { id: 'lc9', problemSku: 'Q-MATH-CALC-0025', subject: 'math',  summary: '역함수의 미분 계수',                         errorPatternId: 'ep2', box: 4, streak: 3, nextReviewInHours: 168, firstMissedAgo: 18, attempts: 5, lastResult: 'correct' },
  { id: 'lc10', problemSku: 'Q-ENG-VOC-0854', subject: 'english', summary: 'pay attention to 구문',                    errorPatternId: 'ep4', box: 4, streak: 3, nextReviewInHours: 240, firstMissedAgo: 22, attempts: 5, lastResult: 'correct' },
  // BOX 5 — 마스터 임박
  { id: 'lc11', problemSku: 'Q-MATH-CALC-0012', subject: 'math', summary: '합성함수의 미분',                           errorPatternId: 'ep3', box: 5, streak: 4, nextReviewInHours: 480, firstMissedAgo: 28, attempts: 7, lastResult: 'correct' },
];

/** 박스별 개수 */
export function countByBox(cards: LeitnerCard[] = leitnerCards): Record<LeitnerBox, number> {
  const base: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const c of cards) base[c.box]++;
  return base;
}

/** Overdue 카드만 */
export function overdueCards(cards: LeitnerCard[] = leitnerCards): LeitnerCard[] {
  return cards.filter(c => c.nextReviewInHours < 0)
    .sort((a, b) => a.nextReviewInHours - b.nextReviewInHours);
}

/** 오늘(24h 내) 복습 대상 */
export function todayCards(cards: LeitnerCard[] = leitnerCards): LeitnerCard[] {
  return cards.filter(c => c.nextReviewInHours >= 0 && c.nextReviewInHours <= 24);
}

/** SKU → 에러 패턴 이름 매핑 (오답 카드 기준) */
export function patternNameForSku(sku: string): string | undefined {
  const card = leitnerCards.find(c => c.problemSku === sku);
  if (!card) return undefined;
  return errorPatterns.find(p => p.id === card.errorPatternId)?.name;
}

/** SKU → 과목 매핑 (오답 카드 기준) */
export function subjectForSku(sku: string): SubjectKey | undefined {
  return leitnerCards.find(c => c.problemSku === sku)?.subject;
}

/** 누적 정복 통계 */
export const conquestStats = {
  totalConquered: 23,
  thisWeekConquered: 6,
  masterStamps: 2,
  totalAttempts: 147,
  successRate: 64,  // %
  patternsActive: errorPatterns.length,
  patternsResolved: 3,
};
