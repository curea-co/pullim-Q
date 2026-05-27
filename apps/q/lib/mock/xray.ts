/**
 * 풀림 풀이분석 (Process X-Ray) — 풀이 과정 메타인지 분석.
 * 03_스터디_마스터.md 5.3 + 09_Q 핸드오프 4.7 기반.
 *
 * 인덱스가 "무엇을 잘하나"라면 풀이분석은 "어떻게 푸나" — 같은 데이터의 다른 차원.
 */

/** 메타인지 4차원 — 종합 점수 산출 */
export type MetaDimension = {
  id: string;
  label: string;
  /** 0~100 */
  score: number;
  /** 또래 평균 */
  peer: number;
  /** 한 줄 진단 */
  insight: string;
  /** good / warn / improve */
  tone: 'good' | 'warn' | 'improve';
};

export const metaDimensions: MetaDimension[] = [
  {
    id: 'time',
    label: '시간 관리',
    score: 78,
    peer: 65,
    insight: '쉬운 문제는 빠르게, 어려운 문제는 충분히 — 시간 배분 양호',
    tone: 'good',
  },
  {
    id: 'self_check',
    label: '자기 점검',
    score: 54,
    peer: 60,
    insight: '선지 변경이 너무 적어요. 첫 직감만 따르는 경향 — 검토 습관 보강',
    tone: 'improve',
  },
  {
    id: 'strategy',
    label: '전략 선택',
    score: 71,
    peer: 58,
    insight: '문제 유형별로 다른 풀이 전략 시도. 4-Path 활용도 평균 이상',
    tone: 'good',
  },
  {
    id: 'load',
    label: '인지 부하 인식',
    score: 42,
    peer: 55,
    insight: '어려운 문제에서 멈추지 않고 밀어붙이는 경향. 잠시 호흡할 타이밍 학습 필요',
    tone: 'warn',
  },
];

/** 종합 메타인지 점수 (가중 평균) */
export const overallMeta = {
  score: Math.round(
    metaDimensions.reduce((s, d) => s + d.score, 0) / metaDimensions.length,
  ),
  trend: '+4 (지난 7일)',
  rank: '상위 32%',
};

/** 풀이 시간 분포 — 최근 40문항 */
export type TimeDistPoint = {
  idx: number;
  expectedSec: number;
  actualSec: number;
  isCorrect: boolean;
  /** 찍기 의심 (시간 < 30% expected + 빠른 응답) */
  isGuess: boolean;
};

function makeTimeDist(): TimeDistPoint[] {
  const base = [60, 90, 120, 75, 100, 45, 80, 110, 55, 95];
  const arr: TimeDistPoint[] = [];
  for (let i = 0; i < 40; i++) {
    const expected = base[i % base.length];
    // deterministic perturbation
    const factor = 0.3 + ((i * 13 + 7) % 17) / 10; // 0.3~2.0
    const actual = Math.round(expected * factor);
    const isCorrect = (i * 7 + 3) % 5 !== 0;
    const isGuess = factor < 0.4;
    arr.push({ idx: i + 1, expectedSec: expected, actualSec: actual, isCorrect, isGuess });
  }
  return arr;
}

export const timeDistribution = makeTimeDist();

/** 시간대별 정답률 — 7시~23시 */
export type HourlyAccuracy = {
  hour: number;
  accuracy: number;     // %
  problemCount: number;
};

export const hourlyAccuracy: HourlyAccuracy[] = [
  { hour: 7,  accuracy: 62, problemCount: 8 },
  { hour: 8,  accuracy: 71, problemCount: 12 },
  { hour: 9,  accuracy: 78, problemCount: 14 },  // 피크
  { hour: 10, accuracy: 73, problemCount: 10 },
  { hour: 11, accuracy: 65, problemCount: 7 },
  { hour: 12, accuracy: 52, problemCount: 4 },   // 점심
  { hour: 13, accuracy: 58, problemCount: 6 },
  { hour: 14, accuracy: 68, problemCount: 9 },
  { hour: 15, accuracy: 64, problemCount: 8 },
  { hour: 16, accuracy: 60, problemCount: 5 },
  { hour: 17, accuracy: 55, problemCount: 7 },
  { hour: 18, accuracy: 67, problemCount: 12 },
  { hour: 19, accuracy: 82, problemCount: 18 },  // 저녁 피크 ★
  { hour: 20, accuracy: 79, problemCount: 22 },
  { hour: 21, accuracy: 74, problemCount: 19 },
  { hour: 22, accuracy: 65, problemCount: 11 },
  { hour: 23, accuracy: 48, problemCount: 4 },
];

/** 찍기 탐지 결과 */
export type GuessDetection = {
  totalGuesses: number;
  weeklyGuesses: number;
  /** 찍기인데 맞춘 비율 */
  luckyHitRate: number;
  /** 찍기 의심 영역 */
  hotspots: { label: string; count: number }[];
};

export const guessDetection: GuessDetection = {
  totalGuesses: 4,
  weeklyGuesses: 12,
  luckyHitRate: 34,
  hotspots: [
    { label: '영어 빈칸 추론 (시간 부족)', count: 5 },
    { label: '수학 적분의 활용 (어려움)',   count: 4 },
    { label: '물리 파동 (개념 미숙)',       count: 3 },
  ],
};

/** 메타인지 리포트 — AI 생성 텍스트 */
export const metaCognitionReport = {
  learnerType: '정독·신중형 학습자',
  description:
    '발문을 처음부터 끝까지 정독하고 한 번에 답을 결정하는 패턴이에요. ' +
    '시간 배분은 우수하지만, 선지 변경이 적어 첫 직감의 함정에 걸리는 경우가 있습니다. ' +
    '특히 영어 빈칸 추론에서 처음 고른 답을 거의 그대로 유지해요.',
  strengths: [
    '쉬운 문제 처리 속도가 또래 +25%',
    '저녁 19~21시 정답률 +14p (집중력 피크 활용 잘함)',
    '4-Path 풀이 시도 — 다양한 전략 활용',
  ],
  weaknesses: [
    '선지 변경 빈도가 또래 -23% (검토 습관 약함)',
    '어려운 문제에서 시간 70%↑ 사용 후 막힘 — 호흡 부재',
    '점심·새벽 시간대 정답률 급락 (50%대) — 학습 회피 시간',
  ],
  signature: 'Q 핸드오프 5.3 — 한국 에듀테크 첫 시도',
};

/** AI 자동 제안 — 플래너 블록 자동 배정 가능 */
export type ActionSuggestion = {
  id: string;
  /** 시각 신호 (lucide icon 키) */
  iconKey: 'review' | 'pause' | 'night';
  title: string;
  reason: string;
  /** 플래너에 추가될 블록 정보 */
  plannerBlock: {
    duration: number;     // 분
    time: string;         // "내일 17:30"
    feature: string;
  };
};

export const actionSuggestions: ActionSuggestion[] = [
  {
    id: 'as1',
    iconKey: 'review',
    title: '"검토 5초 챌린지" 시작하기',
    reason: '선지 변경 빈도가 또래보다 23% 낮음. 풀이 후 5초 검토 습관 도입',
    plannerBlock: { duration: 25, time: '내일 18:00', feature: '풀림 무한풀기 (검토 모드)' },
  },
  {
    id: 'as2',
    iconKey: 'pause',
    title: '"호흡 블록" 추가',
    reason: '어려운 문제에서 멈추지 않고 밀어붙임 — 인지 부하 관리 필요',
    plannerBlock: { duration: 10, time: '저녁 학습 중간', feature: '풀림 비주얼 (개념 시각화)' },
  },
  {
    id: 'as3',
    iconKey: 'night',
    title: '저녁 7~9시 골드 타임 굳히기',
    reason: '이 시간대 정답률 +14p · 어려운 문제를 이때로 자동 이동',
    plannerBlock: { duration: 60, time: '매일 19:00', feature: '풀림 플래너 (자동 재배치)' },
  },
];