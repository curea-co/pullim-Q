/**
 * IRT (Item Response Theory) 샘플.
 * 풀림 무한풀기·인덱스의 핵심 데이터 구조.
 */

import type { SubjectKey } from './persona';

/** 학생 능력치 θ (theta). 보통 -3 ~ +3 표준정규 */
export type AbilityTheta = {
  subject: SubjectKey;
  theta: number;          // 현재 추정값
  se: number;             // 표준오차
  /** 예상 등급 (1~9) */
  expectedGrade: number;
  /** 최근 24시간 변화량 */
  delta24h: number;
  /** 백분위 */
  percentile: number;
};

export const myAbility: AbilityTheta[] = [
  { subject: 'math',    theta:  0.42, se: 0.18, expectedGrade: 3, delta24h: +0.08, percentile: 67 },
  { subject: 'english', theta: -0.21, se: 0.22, expectedGrade: 4, delta24h: -0.03, percentile: 41 },
  { subject: 'science', theta:  0.65, se: 0.20, expectedGrade: 2, delta24h: +0.12, percentile: 75 },
];

/** IRT 3PL 모델 정답 확률 */
export function probCorrect(theta: number, a: number, b: number, c: number): number {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

/** ZPD (근접발달영역) — 학생 θ 기준 정답확률 0.6~0.8 구간 문제 선별용 */
export function inZpd(theta: number, b: number, a = 1.0, c = 0.2): boolean {
  const p = probCorrect(theta, a, b, c);
  return p >= 0.6 && p <= 0.8;
}

/** 난이도 레벨 (1~5) — UI 표시용 */
export function difficultyLevel(b: number): 1 | 2 | 3 | 4 | 5 {
  if (b < -1.5) return 1;
  if (b < -0.5) return 2;
  if (b < 0.5)  return 3;
  if (b < 1.5)  return 4;
  return 5;
}

export const difficultyLabel = ['', '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'] as const;

/** 사고유형별 능력 (레이더차트용, 0~100) */
export type CognitiveDimension = {
  axis: string;
  value: number;
  /** 또래 평균 — 비교선 */
  peer: number;
};

export const cognitiveBySubject: Record<SubjectKey, CognitiveDimension[]> = {
  math: [
    { axis: '계산력',     value: 78, peer: 65 },
    { axis: '추론력',     value: 52, peer: 62 },  // 약점
    { axis: '도형감각',   value: 68, peer: 60 },
    { axis: '응용력',     value: 44, peer: 58 },  // 약점
    { axis: '추상력',     value: 71, peer: 63 },
    { axis: '문제해석',   value: 63, peer: 67 },
  ],
  english: [
    { axis: '어휘',       value: 62, peer: 70 },
    { axis: '어법',       value: 81, peer: 68 },
    { axis: '독해 속도',  value: 55, peer: 65 },
    { axis: '추론',       value: 34, peer: 60 },  // 심한 약점
    { axis: '비판적 사고', value: 49, peer: 58 },
    { axis: '문맥 파악',   value: 58, peer: 62 },
  ],
  science: [
    { axis: '개념 이해',  value: 74, peer: 64 },
    { axis: '실험 해석',  value: 66, peer: 61 },
    { axis: '수식 활용',  value: 58, peer: 59 },
    { axis: '논리 추론',  value: 51, peer: 58 },
    { axis: '자료 해석',  value: 69, peer: 63 },
    { axis: '모델링',     value: 43, peer: 55 },  // 약점
  ],
  korean:  [],
  social:  [],
  history: [],
};

/** θ 주간 추세 — 성장 추적 (최근 8주) */
export type ThetaTrendPoint = {
  week: string;    // "4w전"
  math: number;
  english: number;
  science: number;
};

export const thetaTrend: ThetaTrendPoint[] = [
  { week: '8주전', math: -0.12, english: -0.45, science: 0.21 },
  { week: '7주전', math: -0.05, english: -0.39, science: 0.28 },
  { week: '6주전', math:  0.08, english: -0.33, science: 0.35 },
  { week: '5주전', math:  0.15, english: -0.30, science: 0.42 },
  { week: '4주전', math:  0.22, english: -0.27, science: 0.48 },
  { week: '3주전', math:  0.28, english: -0.25, science: 0.55 },
  { week: '2주전', math:  0.35, english: -0.23, science: 0.60 },
  { week: '지금',  math:  0.42, english: -0.21, science: 0.65 },
];

/** 진단 세션 메타 */
export const lastDiagnosis = {
  completedAt: '2026-04-22',       // 2일 전
  daysAgo: 2,
  durationMin: 18,
  questionsAnswered: 22,
  nextRecommendedIn: 5,            // D-N 후 재진단 권장
};

/** 처방 — 3축 연계 CTA */
export type Prescription = {
  id: string;
  priority: 1 | 2 | 3;
  /** 약점 단원 id */
  targetNodeId: string;
  targetLabel: string;
  /** 예상 θ 상승량 */
  expectedThetaGain: number;
  /** 예상 소요 시간 (분) */
  effortMin: number;
  /** 연계 기능 — consumer가 lucide icon 매핑에 사용 */
  channel: 'infinity' | 'visual' | 'conqueror' | 'store';
  channelLabel: string;
  description: string;
};

export const prescriptions: Prescription[] = [
  {
    id: 'rx1',
    priority: 1,
    targetNodeId: 'eng.blank.unit',
    targetLabel: '영어 — 빈칸 추론',
    expectedThetaGain: 0.18,
    effortMin: 180,
    channel: 'conqueror',
    channelLabel: '풀림 오답정복',
    description: '5회 연속 정답 → 정복 스탬프. 접속사 논리 관계 패턴 집중 훈련.',
  },
  {
    id: 'rx2',
    priority: 1,
    targetNodeId: 'math.calc_int.application',
    targetLabel: '수학 — 적분의 활용',
    expectedThetaGain: 0.15,
    effortMin: 240,
    channel: 'visual',
    channelLabel: '풀림 비주얼',
    description: '도형·면적 VLM 3종 + 적분 시각화 시뮬레이션으로 개념 체득.',
  },
  {
    id: 'rx3',
    priority: 2,
    targetNodeId: 'math.calc_diff.application',
    targetLabel: '수학 — 미분의 응용',
    expectedThetaGain: 0.10,
    effortMin: 120,
    channel: 'infinity',
    channelLabel: '풀림 무한풀기',
    description: '적응형 난이도 30문제. IRT 기반 ZPD 문제 자동 선별.',
  },
  {
    id: 'rx4',
    priority: 3,
    targetNodeId: 'eng.vocab.high',
    targetLabel: '영어 — 수능 빈출 어휘',
    expectedThetaGain: 0.08,
    effortMin: 90,
    channel: 'store',
    channelLabel: '풀림 스토어',
    description: '"EBS 수능완성 어휘 팩" 추천 · 진단 기반 타겟팅 구매',
  },
];
