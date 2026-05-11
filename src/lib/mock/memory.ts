/**
 * 풀림 기억장치 — 망각 곡선 + 복습 큐 샘플.
 * 에빙하우스 기반 + 개인별 파라미터 (마스터 4.5).
 */

export type MemoryItem = {
  id: string;
  /** 학습 항목 라벨 */
  label: string;
  /** 출처 기능 (어떤 기능에서 학습/오답이 흘러왔는지) */
  source: 'infinity' | 'conqueror' | 'index' | 'visual' | 'classbot' | 'planner' | 'exam';
  /** 첫 학습 시점 (일 단위 상대) */
  daysAgo: number;
  /** 현재 잔존 확률 (0~1) — 베이지안 추정값 */
  retention: number;
  /** 다음 복습까지 남은 시간 (시간 단위, 음수면 이미 만기) */
  nextReviewInHours: number;
  curriculumNodeId?: string;
};

export const memoryQueue: MemoryItem[] = [
  { id: 'm1', label: '지수함수의 정의역·치역',     source: 'infinity',   daysAgo: 1,  retention: 0.92, nextReviewInHours: 22, curriculumNodeId: 'math.exp_log.def' },
  { id: 'm2', label: '관계대명사 that vs which',   source: 'conqueror',  daysAgo: 3,  retention: 0.71, nextReviewInHours: -2, curriculumNodeId: 'eng.grammar.relative' },
  { id: 'm3', label: '뉴턴 제2법칙 F = ma 활용',   source: 'visual',     daysAgo: 5,  retention: 0.58, nextReviewInHours: 6,  curriculumNodeId: 'sci.phy.mechanics.newton' },
  { id: 'm4', label: '빈칸 추론 — 접속사 단서',    source: 'conqueror',  daysAgo: 7,  retention: 0.43, nextReviewInHours: -8, curriculumNodeId: 'eng.blank.unit' },
  { id: 'm5', label: '극한값의 정의 (ε-δ)',        source: 'visual',     daysAgo: 10, retention: 0.31, nextReviewInHours: 0,  curriculumNodeId: 'math.lim_continuity' },
  { id: 'm6', label: '단어: ambiguous',             source: 'infinity',   daysAgo: 14, retention: 0.27, nextReviewInHours: -24, curriculumNodeId: 'eng.vocab.high' },
  { id: 'm7', label: '확률분포 — 정규분포 표준화', source: 'index',      daysAgo: 21, retention: 0.20, nextReviewInHours: -48, curriculumNodeId: 'math.statistics.dist' },
];

/** 망각 곡선용 시계열 (D-day, 잔존확률) */
export type ForgettingPoint = { day: number; baseRetention: number; personalRetention: number };

export const forgettingCurve: ForgettingPoint[] = [
  { day: 0,  baseRetention: 1.00, personalRetention: 1.00 },
  { day: 1,  baseRetention: 0.50, personalRetention: 0.62 },
  { day: 2,  baseRetention: 0.35, personalRetention: 0.51 },
  { day: 4,  baseRetention: 0.25, personalRetention: 0.42 },
  { day: 7,  baseRetention: 0.21, personalRetention: 0.38 },
  { day: 14, baseRetention: 0.18, personalRetention: 0.35 },
  { day: 30, baseRetention: 0.15, personalRetention: 0.32 },
];

/** 만기 항목 */
export function dueItems(items: MemoryItem[] = memoryQueue): MemoryItem[] {
  return items.filter(i => i.nextReviewInHours <= 0).sort((a, b) => a.retention - b.retention);
}

/** 24시간 내 만기 — 오늘 복습 큐 */
export function todayDue(items: MemoryItem[] = memoryQueue): MemoryItem[] {
  return items.filter(i => i.nextReviewInHours <= 24).sort((a, b) => a.nextReviewInHours - b.nextReviewInHours);
}

/** 출처별 메타 (마스터 4.5 — 크로스앱 이벤트 버스) */
export const memorySourceMeta: Record<MemoryItem['source'], { label: string; color: string }> = {
  infinity:   { label: '풀림 무한풀기', color: 'var(--color-pullim-blue-600)' },
  conqueror:  { label: '풀림 오답정복', color: 'var(--color-pullim-danger)' },
  index:      { label: '풀림 인덱스',   color: 'var(--color-pullim-blue-400)' },
  visual:     { label: '풀림 비주얼',   color: 'var(--color-pullim-blue-300)' },
  classbot:   { label: '풀림 클래스봇', color: 'var(--color-pullim-success)' },
  planner:    { label: '풀림 플래너',   color: 'var(--color-pullim-warn)' },
  exam:       { label: '풀림 모의고사', color: 'var(--color-pullim-blue-700)' },
};

/** 개인 망각 파라미터 — 베이지안 추정 */
export const personalForgettingProfile = {
  /** 개인 망각 속도 (1.0이 평균. 1보다 작으면 더 잘 기억) */
  decayRate: 0.83,
  /** 평균 대비 30일 잔존 우위 (백분율 포인트) */
  retentionAdvantageVsPeer: 17,
  /** 현재까지 학습한 항목 수 */
  totalItems: 1287,
  /** 마스터 단계 도달 (3회 연속 정답으로 BOX 5 진입) */
  mastered: 412,
  /** 6개월 사용 시 누적될 데이터 수 (예측) */
  projected6mo: 4500,
  /** 30일 잔존확률 — 평균 vs 나 */
  retention30d: { peer: 0.15, me: 0.32 },
};

/** 복습 형태 4종 — 마스터 4.5 (플래시카드, 빈칸, 객관식, 유사 문제) */
export type ReviewFormat = {
  id: 'flashcard' | 'cloze' | 'mcq' | 'rephrase';
  label: string;
  description: string;
  bestFor: string;
  /** 평균 효과 (해당 학습자 기준 잔존 향상 %) */
  effectiveness: number;
};

export const reviewFormats: ReviewFormat[] = [
  {
    id: 'flashcard',
    label: '플래시카드',
    description: '앞면 → 뒷면. 빠른 인출 연습',
    bestFor: '용어·공식·정의 암기',
    effectiveness: 18,
  },
  {
    id: 'cloze',
    label: '빈칸 채우기',
    description: '문맥 안에서 핵심어 빈칸',
    bestFor: '맥락 기반 어휘·문법',
    effectiveness: 24,
  },
  {
    id: 'mcq',
    label: '객관식 재출제',
    description: '같은 개념 새 문제',
    bestFor: '응용·식별 능력 강화',
    effectiveness: 22,
  },
  {
    id: 'rephrase',
    label: 'AI 변형 문제',
    description: 'CUREA DEEP이 같은 패턴 새 문항 생성',
    bestFor: '깊은 이해·전이 학습',
    effectiveness: 31,
  },
];

/** 7일 메모리 유입량 (출처별 누적) */
export const weeklyInflow: { day: string; total: number; byBig: number; bySmall: number }[] = [
  { day: '월', total: 18, byBig: 12, bySmall: 6 },
  { day: '화', total: 22, byBig: 14, bySmall: 8 },
  { day: '수', total: 31, byBig: 22, bySmall: 9 },
  { day: '목', total: 14, byBig: 8,  bySmall: 6 },
  { day: '금', total: 27, byBig: 18, bySmall: 9 },
  { day: '토', total: 35, byBig: 25, bySmall: 10 },
  { day: '일', total: 19, byBig: 11, bySmall: 8 },
];

/** 출처별 이번주 누적 — 도넛/리스트용 */
export const inflowBySource: { source: MemoryItem['source']; count: number }[] = [
  { source: 'infinity',  count: 58 },
  { source: 'conqueror', count: 34 },
  { source: 'visual',    count: 22 },
  { source: 'classbot',  count: 18 },
  { source: 'index',     count: 12 },
  { source: 'exam',      count: 9 },
  { source: 'planner',   count: 5 },
];
