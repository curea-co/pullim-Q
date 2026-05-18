/**
 * 풀림 무한풀기 — IRT 적응형 풀이 + 모의고사 통합 데이터.
 * 03_스터디_마스터.md 4.1 + 09_Q_핸드오프.md 4.2 기반.
 */

import type { SubjectKey } from './persona';

/** 풀이 모드 — 연습/시험 토글 */
export type SolveMode = 'practice' | 'exam';

export const solveModeMeta: Record<SolveMode, {
  label: string;
  shortLabel: string;
  description: string;
}> = {
  practice: {
    label: '연습 모드',
    shortLabel: '연습',
    description: '내 실력에 맞는 적응형 문제 · AI 코치 상시 가능 · 정답·해설 즉시',
  },
  exam: {
    label: '시험 모드',
    shortLabel: '시험',
    description: '실전 모의고사 · 타이머 일시정지 불가 · AI 코치·힌트·해설 차단',
  },
};

/** 모드별 사용 가능/차단 기능 (UX 명시용) */
export type FeatureKey =
  | 'ai_coach' | 'hints' | 'explanation' | 'instant_grading'
  | 'pause' | 'mark' | 'pattern_link' | 'self_pace'
  | 'timer' | 'omr' | 'proctor';

export const modeFeatureMap: Record<SolveMode, Partial<Record<FeatureKey, boolean>>> = {
  practice: {
    ai_coach: true,
    hints: true,
    explanation: true,
    instant_grading: true,
    pause: true,
    pattern_link: true,
    self_pace: true,
    mark: false,
    timer: false,
    omr: false,
    proctor: false,
  },
  exam: {
    ai_coach: false,
    hints: false,
    explanation: false,
    instant_grading: false,
    pause: false,
    pattern_link: false,
    self_pace: false,
    mark: true,
    timer: true,
    omr: true,
    proctor: true,
  },
};

export const featureLabels: Record<FeatureKey, string> = {
  ai_coach:        'AI 코치 패널',
  hints:           '5단계 힌트',
  explanation:     '풀림 해설 (12-섹션)',
  instant_grading: '정답 즉시 공개',
  pause:           '일시정지·다시 풀기',
  pattern_link:    '오답 패턴 자동 연결',
  self_pace:       '자기 페이스 풀이',
  mark:            'OMR 표식 (Shift+클릭)',
  timer:           '시험 타이머 (큰 숫자)',
  omr:             'OMR 답안지',
  proctor:         'AI 감독관 (탭 이탈 감지)',
};

/** 풀이 데크 — 연습 모드 적응형 풀이용 5문항 */
export type SolveProblem = {
  sku: string;
  subject: SubjectKey;
  unit: string;
  /** IRT b 난이도 */
  difficulty: number;
  statement: string;
  choices: string[];
  answerIndex: number;
  /** 5단계 힌트 progression */
  hints: string[];
  /** 짧은 해설 (1줄) */
  shortExplanation: string;
  /** 예상 풀이 시간 (초) */
  expectedSec: number;
};

export const solveDeck: SolveProblem[] = [
  {
    sku: 'Q-MATH-CALC-0042',
    subject: 'math',
    unit: '미적분 / 도함수의 활용',
    difficulty: 0.85,
    statement: '함수 f(x) = x³ − 3x + 1의 극댓값과 극솟값을 구하시오.',
    choices: [
      '극댓값 3, 극솟값 −1',
      '극댓값 1, 극솟값 −3',
      '극댓값 0, 극솟값 0',
      '극댓값 3, 극솟값 1',
      '극값을 갖지 않는다',
    ],
    answerIndex: 0,
    hints: [
      '극값을 찾으려면 함수의 어떤 성질을 봐야 할까?',
      '이 문제는 도함수의 부호 변화를 묻고 있어',
      'f′(x) = 0이 되는 x를 먼저 찾아봐',
      'x = 1, x = -1에서 부호 변화 방향이 어떻게 되지?',
      '부호 변화 표를 그려서 극대·극소 위치 확인',
    ],
    shortExplanation: 'f′(x) = 3(x−1)(x+1). x = −1에서 극대, x = 1에서 극소.',
    expectedSec: 90,
  },
  {
    sku: 'Q-ENG-RDG-1208',
    subject: 'english',
    unit: '독해 / 빈칸 추론',
    difficulty: 0.62,
    statement:
      '다음 빈칸에 들어갈 말로 가장 적절한 것은? "Innovation is rarely linear; it is, however, ____ in the sense that ideas accumulate before producing breakthroughs."',
    choices: ['random', 'cumulative', 'instant', 'isolated', 'predictable'],
    answerIndex: 1,
    hints: [
      '문맥에서 핵심이 되는 단어가 어디 있을까?',
      'however 뒤에 오는 주장 방향을 살펴봐',
      '"ideas accumulate"가 빈칸과 어떤 관계일까?',
      'accumulate → 누적되다. 같은 의미의 형용사는?',
      'cumulative = 누적적인. 정답: ②',
    ],
    shortExplanation: '"ideas accumulate" → 누적적(cumulative). however 절의 주장과 일치.',
    expectedSec: 110,
  },
  {
    sku: 'Q-MATH-PROB-0019',
    subject: 'math',
    unit: '확률과 통계 / 확률분포',
    difficulty: 0.55,
    statement: '확률변수 X가 정규분포 N(50, 10²)을 따를 때, P(X ≥ 70)의 근삿값은?',
    choices: ['0.0228', '0.1587', '0.3413', '0.4772', '0.5000'],
    answerIndex: 0,
    hints: [
      '먼저 표준화 식 Z = (X − μ)/σ 적용',
      'Z = (70 − 50) / 10 = 2',
      'P(Z ≥ 2)를 표준정규분포표에서 찾아봐',
      'P(Z ≥ 2) ≈ 1 − 0.9772',
      '0.0228 (정답: ①)',
    ],
    shortExplanation: 'Z = 2일 때 P(Z ≥ 2) ≈ 0.0228.',
    expectedSec: 75,
  },
  {
    sku: 'Q-SCI-PHY-0231',
    subject: 'science',
    unit: '물리Ⅰ / 역학과 에너지',
    difficulty: 0.72,
    statement:
      '엘리베이터가 위 방향으로 등가속도 a로 운동할 때, 질량 m인 사람에게 작용하는 수직항력 N의 크기는?',
    choices: ['mg', 'm(g + a)', 'm(g − a)', 'ma', 'mg − ma'],
    answerIndex: 1,
    hints: [
      '사람에게 작용하는 힘들을 그려봐',
      '뉴턴 제2법칙 적용 — 알짜힘 = ma',
      'N − mg = ma 식 세우기',
      'N에 대해 정리하면?',
      'N = m(g + a). 정답: ②',
    ],
    shortExplanation: 'N − mg = ma → N = m(g + a).',
    expectedSec: 95,
  },
  {
    sku: 'Q-ENG-VOC-0872',
    subject: 'english',
    unit: '어휘 / 연어',
    difficulty: 0.40,
    statement: 'Choose the best word: "She made a difficult ____ to leave the company."',
    choices: ['decision', 'thinking', 'dream', 'option', 'choosing'],
    answerIndex: 0,
    hints: [
      '"made a ___" 구문에서 흔히 쓰이는 명사는?',
      'decision은 make와 자주 쓰이는 연어',
      '다른 보기들이 어색한 이유 — choosing(동명사) / option(have an option)',
      '"make a decision"이 가장 자연스러움',
      '정답: ①',
    ],
    shortExplanation: 'make a decision — 결정을 내리다 (관용 연어).',
    expectedSec: 50,
  },
];

/** 모의고사 — 시험 모드용 세트 */
export type MockExam = {
  id: string;
  title: string;
  /** 디스플레이 라벨 (예: '수학', '물리Ⅰ', '영어 독해') */
  subject: string;
  /** 필터링용 과목 키 — 풀이 세션 과목과 매칭 */
  subjectKey: SubjectKey;
  duration: number;       // 분
  problemCount: number;
  totalScore: number;
  origin: 'past_actual' | 'studio' | 'ai_generated';
  description: string;
};

export const availableExams: MockExam[] = [
  // ─── 수학 ───
  {
    id: 'me1',
    title: '2025 6월 모의평가 — 수학',
    subject: '수학',
    subjectKey: 'math',
    duration: 100,
    problemCount: 30,
    totalScore: 100,
    origin: 'past_actual',
    description: '평가원 기출 복원. 실제 시험 환경 재현.',
  },
  {
    id: 'me2',
    title: 'AI 맞춤 — 미적분 약점 보강',
    subject: '미적분',
    subjectKey: 'math',
    duration: 50,
    problemCount: 15,
    totalScore: 50,
    origin: 'ai_generated',
    description: '내 진단 결과를 반영한 약점 집중 모의.',
  },
  {
    id: 'me3',
    title: '김수학 선생님 수제 — 미적분 III장',
    subject: '미적분',
    subjectKey: 'math',
    duration: 30,
    problemCount: 10,
    totalScore: 50,
    origin: 'studio',
    description: '학원 강사 수제 문항 + 해설.',
  },
  // ─── 영어 ───
  {
    id: 'me4',
    title: '2025 9월 모의평가 — 영어',
    subject: '영어',
    subjectKey: 'english',
    duration: 70,
    problemCount: 45,
    totalScore: 100,
    origin: 'past_actual',
    description: '평가원 기출 복원 · 듣기 17 + 독해 28.',
  },
  {
    id: 'me5',
    title: 'AI 맞춤 — 빈칸 추론 집중',
    subject: '영어 독해',
    subjectKey: 'english',
    duration: 30,
    problemCount: 10,
    totalScore: 50,
    origin: 'ai_generated',
    description: '논지 전환 단서 패턴이 약한 학생을 위한 보강 세트.',
  },
  {
    id: 'me6',
    title: '박영어 선생님 수제 — 어법 30선',
    subject: '영어',
    subjectKey: 'english',
    duration: 25,
    problemCount: 30,
    totalScore: 50,
    origin: 'studio',
    description: '관계대명사·시제·태 등 어법 빈출 30개.',
  },
  // ─── 과학 ───
  {
    id: 'me7',
    title: '2025 학력평가 — 물리Ⅰ',
    subject: '물리Ⅰ',
    subjectKey: 'science',
    duration: 30,
    problemCount: 20,
    totalScore: 50,
    origin: 'past_actual',
    description: '학평 기출 복원 · 역학·전자기 비중.',
  },
  {
    id: 'me8',
    title: 'AI 맞춤 — 뉴턴 운동 법칙',
    subject: '물리Ⅰ',
    subjectKey: 'science',
    duration: 25,
    problemCount: 10,
    totalScore: 50,
    origin: 'ai_generated',
    description: '약점 단원 집중 보강 — 자유낙하·작용반작용.',
  },
  {
    id: 'me9',
    title: '김과학 선생님 수제 — 통합과학 단원평가',
    subject: '통합과학',
    subjectKey: 'science',
    duration: 30,
    problemCount: 15,
    totalScore: 50,
    origin: 'studio',
    description: '학원 강사 수제 문항 + 풀림 해설.',
  },
];

/** 미니 KPI — 풀이 진행 상태 */
export type SolveSession = {
  problemsSolved: number;
  totalToday: number;
  accuracyToday: number;
  estimatedThetaGain: number;   // 오늘 예상 θ 증가
  hintsUsedToday: number;
  patternsCovered: number;
};

export const todaySession: SolveSession = {
  problemsSolved: 12,
  totalToday: 30,
  accuracyToday: 75,
  estimatedThetaGain: 0.08,
  hintsUsedToday: 4,
  patternsCovered: 6,
};

/** ───── 풀림 해설 12-섹션 ───── */

/** 4-Path Solution Spine — 같은 답, 4개 독립 경로 */
export type SolutionPath = {
  id: string;
  name: string;
  tag: '정석' | '기하직관' | '좌표' | '심화' | '대수';
  estimatedSec: number;
  elegance: number;       // 0~5
  generalization: number; // 0~5
  recommended: boolean;
  /** 해당 경로 사용자 중 정답률 */
  successRate: number;
  steps: { description: string; cite?: string }[];
};

/** 100명의 선택 — 선지별 분포 + 심리적 이유 */
export type ChoicePsychology = {
  index: number;
  pct: number;
  reason: string;
  isAnswer: boolean;
};

/** Teacher Voice — 같은 해설 3톤 */
export type TeacherVoice = {
  tone: '정석' | '친구' | '스파르타';
  emoji: string;
  text: string;
};

/** Pattern Family — 친척 문제 */
export type RelatedProblem = {
  sku: string;
  source: '수능' | '모평' | '학평' | '스튜디오' | 'AI 예측';
  year?: string;
  difficulty: number;
  summary: string;
};

/** 풀림 해설 — 12-섹션 통합 */
export type ExplainContent = {
  /** 문제 SKU */
  sku: string;
  /** 1. Hero Recap */
  myAnswer: number;          // 학생 답
  correctAnswer: number;
  /** 2. Prologue */
  prologue: string;
  /** 3. 4-Path */
  paths: SolutionPath[];
  /** 4. Textbook Root Graph (간단 — 선수/이/후속) */
  rootGraph: {
    prerequisites: { id: string; label: string }[];
    current: { id: string; label: string };
    nextUses: { id: string; label: string }[];
  };
  /** 5. Error Anatomy */
  errorAnatomy: {
    studentMistake: string;
    correctApproach: string;
    annotations: { lineNo: number; note: string; isWrong: boolean }[];
  };
  /** 6. 100명의 선택 */
  choices: ChoicePsychology[];
  /** 7. Visual Canvas — placeholder (interactive SVG 텍스트 설명) */
  visualHint: string;
  /** 8. Pattern Family */
  family: RelatedProblem[];
  /** 9. Feynman — challenge prompt + 평가 체크리스트 */
  feynman: {
    prompt: string;
    checklist: string[];
  };
  /** 10. Teacher Voices */
  teacherVoices: TeacherVoice[];
  /** 11. History + Real-World */
  historyReal: {
    history: string;
    realWorld: string;
  };
  /** 12. Memory Anchor */
  memoryAnchor: {
    line: string;
    nextReviewIn: string;  // "1일 후" etc
  };
};

/** 데모용: Q-MATH-CALC-0042 (극값 문제)의 12-섹션 */
export const explainSampleMathCalc: ExplainContent = {
  sku: 'Q-MATH-CALC-0042',
  myAnswer: 1, // ② 극댓값 1, 극솟값 -3 (오답)
  correctAnswer: 0, // ① 극댓값 3, 극솟값 -1
  prologue:
    '도함수의 부호 변화로 함수의 증감을 판단하는 능력은 수능 미적분의 가장 자주 출제되는 주제예요. ' +
    '이 문제는 "f′(x) = 0이면 무조건 극값"이라는 흔한 오개념을 시험하기 위해 의도적으로 설계됐어요.',
  paths: [
    {
      id: 'p1', name: '도함수의 부호 분석', tag: '정석', estimatedSec: 90,
      elegance: 4, generalization: 5, recommended: true, successRate: 78,
      steps: [
        { description: 'f′(x) = 3x² − 3 = 3(x − 1)(x + 1) 로 인수분해', cite: '미적분 §3.1.2 p.74' },
        { description: 'f′(x) = 0  →  x = -1, 1' },
        { description: '부호 표를 그려서 부호 변화 확인 (+ → −는 극대, − → +는 극소)' },
        { description: 'x = -1에서 극대, x = 1에서 극소' },
        { description: 'f(-1) = 3, f(1) = -1' },
      ],
    },
    {
      id: 'p2', name: '그래프 개형 시각화', tag: '기하직관', estimatedSec: 120,
      elegance: 3, generalization: 3, recommended: false, successRate: 65,
      steps: [
        { description: 'f(x) = x³ − 3x + 1은 3차함수이며 최고차항 계수 양수' },
        { description: '극값을 갖는 3차함수는 항상 좌극대·우극소 또는 그 반대' },
        { description: 'f′(x) = 0의 두 근 x = ±1을 좌극대·우극소로 식별' },
        { description: '극값 계산: f(-1) = 3 (극대), f(1) = -1 (극소)' },
      ],
    },
    {
      id: 'p3', name: 'f(0)·f\'(0) 부호 추정', tag: '좌표', estimatedSec: 100,
      elegance: 2, generalization: 2, recommended: false, successRate: 41,
      steps: [
        { description: 'f(0) = 1, f′(0) = -3 → 원점 근처에서 감소 중' },
        { description: '감소 끝나는 지점이 극소 → x = 1' },
        { description: '증가 시작 직전 지점이 극대 → x = -1' },
        { description: 'f(-1) = 3, f(1) = -1' },
      ],
    },
    {
      id: 'p4', name: 'AM-GM 적용 (대수)', tag: '심화', estimatedSec: 140,
      elegance: 5, generalization: 4, recommended: false, successRate: 28,
      steps: [
        { description: 'x³ − 3x를 AM-GM 변형: x ≥ 0일 때 x³ + (-3x) ≥ -2|x|^(3/2) · 형태 분석' },
        { description: '실수 전체 영역에선 정석 풀이가 효율적 — 대수적 풀이는 일반화에 유리' },
        { description: '극값 위치는 부호 변화로 확인 후 함수값 대입' },
      ],
    },
  ],
  rootGraph: {
    prerequisites: [
      { id: 'pre1', label: '미분의 정의' },
      { id: 'pre2', label: '도함수 계산' },
      { id: 'pre3', label: '인수분해' },
      { id: 'pre4', label: '함수의 증감' },
    ],
    current: { id: 'curr', label: '도함수의 부호와 극값' },
    nextUses: [
      { id: 'n1', label: '함수의 그래프 개형' },
      { id: 'n2', label: '최댓값·최솟값' },
      { id: 'n3', label: '방정식·부등식의 응용' },
    ],
  },
  errorAnatomy: {
    studentMistake: 'f′(x) = 0 이 되는 x를 찾았지만, x = -1과 x = 1에서 함수값을 대입할 때 부호 변화 표를 안 그리고 추측. ②번 (극댓값 1, 극솟값 -3)은 두 극값을 뒤바꾼 패턴.',
    correctApproach: 'f′(x) = 0을 푼 후 반드시 부호 변화 표를 그려 극대·극소를 식별. 함수값(극값)은 그 다음 단계.',
    annotations: [
      { lineNo: 1, note: 'OK: 도함수 정확히 구함', isWrong: false },
      { lineNo: 2, note: 'OK: f′(x) = 0 정확히 풂', isWrong: false },
      { lineNo: 3, note: '⚠ 부호 변화 표 생략 — 극대·극소 식별 누락', isWrong: true },
      { lineNo: 4, note: '⚠ 극값 위치(x값)와 극값(f(x)값) 혼동', isWrong: true },
    ],
  },
  choices: [
    { index: 0, pct: 54, reason: '✓ 정답 — 부호 변화 표를 정확히 작성한 학생들', isAnswer: true },
    { index: 1, pct: 22, reason: '극댓값과 극솟값의 위치(x값)를 그대로 극값(f(x)값)으로 기재. 흔한 혼동.', isAnswer: false },
    { index: 2, pct: 6,  reason: 'f(0) = 1을 극값으로 오인. 도함수를 안 구한 학생.', isAnswer: false },
    { index: 3, pct: 14, reason: 'f(1) = -1 대신 부호 부주의로 +1로 계산. 계산 실수.', isAnswer: false },
    { index: 4, pct: 4,  reason: '3차함수 모양 추정만으로 단조함수로 잘못 판단. 미분 자체를 안 함.', isAnswer: false },
  ],
  visualHint: 'f′(x) = 3(x²−1) 그래프는 x = ±1에서 0을 통과. 통과 방향(+→− 또는 −→+)이 극대·극소를 결정. 인터랙티브 슬라이더로 부호 변화를 체험.',
  family: [
    { sku: 'Q-MATH-CALC-0019', source: '수능', year: '2024', difficulty: 0.62, summary: 'f(x) = -x³ + 3x²의 극값 — 부호 반대 케이스' },
    { sku: 'Q-MATH-CALC-0028', source: '모평', year: '2025', difficulty: 0.71, summary: '4차함수 극값과 변곡점의 관계' },
    { sku: 'Q-MATH-CALC-0033', source: '학평', year: '2025', difficulty: 0.55, summary: '도함수 그래프만 보고 극값 위치 찾기' },
    { sku: 'Q-MATH-CALC-0041', source: 'AI 예측', difficulty: 0.78, summary: '매개변수 a 포함 — 극값 조건' },
    { sku: 'Q-MATH-CALC-0047', source: '스튜디오', difficulty: 0.65, summary: '실생활 응용 (롤러코스터 높이의 극값)' },
  ],
  feynman: {
    prompt: '왜 f′(x) = 0이라고 무조건 극값이 아닐까? 2분 안에 친구에게 설명해보세요.',
    checklist: [
      '"부호 변화"라는 용어를 사용했는가',
      '반례(y = x³ at x = 0)를 들었는가',
      '극대·극소를 명확히 구분했는가',
      '함수값 vs x좌표를 혼동하지 않았는가',
    ],
  },
  teacherVoices: [
    {
      tone: '정석',
      emoji: '🎓',
      text:
        '극값은 도함수의 부호가 변하는 곳에서만 발생합니다. f′(x) = 0인 점을 찾았다면 반드시 부호 변화 표를 작성하고, 부호가 +에서 −로 바뀌면 극대, −에서 +로 바뀌면 극소입니다. 부호가 변하지 않으면 극값이 아닌 변곡점일 수 있습니다.',
    },
    {
      tone: '친구',
      emoji: '🙌',
      text:
        '야 이거 진짜 함정이야. f\'(x) = 0이면 일단 의심해. 그 점 좌우로 부호가 정말 바뀌는지 봐야 돼. y = x³ 같은 거는 x = 0에서 f\'(0) = 0이지만 그냥 통과하잖아. 부호 표 5초 그리는 게 답이야.',
    },
    {
      tone: '스파르타',
      emoji: '🔥',
      text:
        '부호 변화 표 안 그리면 무조건 틀린다. f′(x) = 0 푸는 건 누구나 한다. 거기서 끝낸 학생 70%가 ②번 같은 함정에 빠진다. 표 그리는 데 10초 걸린다. 그 10초가 4점이다.',
    },
  ],
  historyReal: {
    history:
      '극값 개념은 17세기 페르마(Fermat)가 "최댓값·최솟값에서 접선 기울기가 0"이라는 통찰을 발표한 데서 시작했어요. 이후 라이프니츠와 뉴턴이 미분 개념을 정립하면서 도함수의 부호 변화로 극값을 판단하는 방법이 일반화됐습니다.',
    realWorld:
      '경제학에서는 한계비용·한계수익이 0이 되는 지점이 이윤 극대화 지점. 머신러닝 경사 하강법(gradient descent)도 ∇f = 0인 지점을 찾는 알고리즘. 부호 변화를 확인하지 않으면 안장점(saddle point)에 갇혀 학습이 멈춰요.',
  },
  memoryAnchor: {
    line: '부호 변화 없으면 극값 없음. f′ = 0은 시작일 뿐.',
    nextReviewIn: '1일 후',
  },
};

/** 풀림 해설 라이브러리 — 작성된 해설 목록 */
export type ExplainEntry = {
  sku: string;
  subject: SubjectKey;
  unit: string;
  difficulty: number;
  summary: string;
  rating: number;          // 0~5
  views: number;
  hasMyAttempt: boolean;
  myResult?: 'correct' | 'wrong';
  isSignature: boolean;    // CUREA 공식 검수
};

export const explainLibrary: ExplainEntry[] = [
  { sku: 'Q-MATH-CALC-0042', subject: 'math',    unit: '미적분 / 도함수의 활용',     difficulty: 0.85, summary: 'f(x) = x³ − 3x + 1의 극값', rating: 4.8, views: 2401, hasMyAttempt: true, myResult: 'wrong', isSignature: true },
  { sku: 'Q-ENG-RDG-1208',   subject: 'english', unit: '독해 / 빈칸 추론',           difficulty: 0.62, summary: 'cumulative — innovation 빈칸', rating: 4.6, views: 1820, hasMyAttempt: true, myResult: 'correct', isSignature: true },
  { sku: 'Q-MATH-PROB-0019', subject: 'math',    unit: '확률과 통계 / 확률분포',     difficulty: 0.55, summary: '정규분포 N(50, 10²) 표준화', rating: 4.4, views: 1502, hasMyAttempt: true, myResult: 'correct', isSignature: false },
  { sku: 'Q-SCI-PHY-0231',   subject: 'science', unit: '물리Ⅰ / 역학과 에너지',     difficulty: 0.72, summary: '엘리베이터 수직항력', rating: 4.7, views: 980, hasMyAttempt: true, myResult: 'correct', isSignature: true },
  { sku: 'Q-ENG-VOC-0872',   subject: 'english', unit: '어휘 / 연어',                difficulty: 0.40, summary: 'make a decision 연어', rating: 4.2, views: 612, hasMyAttempt: true, myResult: 'wrong', isSignature: false },
  { sku: 'Q-MATH-CALC-0028', subject: 'math',    unit: '미적분 / 4차함수 극값',     difficulty: 0.71, summary: '4차함수 극값과 변곡점', rating: 4.5, views: 1320, hasMyAttempt: false, isSignature: true },
  { sku: 'Q-ENG-RDG-1212',   subject: 'english', unit: '독해 / 글의 순서',           difficulty: 0.58, summary: '문맥 단서로 글의 순서 추론', rating: 4.3, views: 870, hasMyAttempt: false, isSignature: false },
];

/** 풀이 이력 */
export type SolveHistoryEntry = {
  id: string;
  sku: string;
  subject: SubjectKey;
  unit: string;
  result: 'correct' | 'wrong' | 'partial';
  timeSec: number;
  hintsUsed: number;
  thetaDelta: number;
  attemptedAgo: string;     // "방금" / "12분 전" / "어제"
  isBookmarked: boolean;
};

export const solveHistory: SolveHistoryEntry[] = [
  { id: 'h1',  sku: 'Q-ENG-RDG-1208',   subject: 'english', unit: '빈칸 추론',     result: 'correct', timeSec: 95,  hintsUsed: 0, thetaDelta: +0.04, attemptedAgo: '12분 전',   isBookmarked: false },
  { id: 'h2',  sku: 'Q-MATH-CALC-0042', subject: 'math',    unit: '도함수 극값',   result: 'wrong',   timeSec: 142, hintsUsed: 2, thetaDelta: -0.06, attemptedAgo: '20분 전',   isBookmarked: true  },
  { id: 'h3',  sku: 'Q-MATH-PROB-0019', subject: 'math',    unit: '정규분포',     result: 'correct', timeSec: 78,  hintsUsed: 1, thetaDelta: +0.03, attemptedAgo: '1시간 전',  isBookmarked: false },
  { id: 'h4',  sku: 'Q-SCI-PHY-0231',   subject: 'science', unit: '뉴턴 운동',    result: 'correct', timeSec: 102, hintsUsed: 0, thetaDelta: +0.05, attemptedAgo: '2시간 전',  isBookmarked: false },
  { id: 'h5',  sku: 'Q-ENG-VOC-0872',   subject: 'english', unit: '어휘 연어',    result: 'wrong',   timeSec: 38,  hintsUsed: 1, thetaDelta: -0.02, attemptedAgo: '어제',      isBookmarked: false },
  { id: 'h6',  sku: 'Q-MATH-CALC-0028', subject: 'math',    unit: '4차 극값',     result: 'partial', timeSec: 180, hintsUsed: 3, thetaDelta: +0.01, attemptedAgo: '어제',      isBookmarked: true  },
  { id: 'h7',  sku: 'Q-ENG-RDG-1212',   subject: 'english', unit: '글의 순서',     result: 'correct', timeSec: 110, hintsUsed: 0, thetaDelta: +0.03, attemptedAgo: '2일 전',    isBookmarked: false },
  { id: 'h8',  sku: 'Q-MATH-CALC-0019', subject: 'math',    unit: '극값 부호 반대', result: 'correct', timeSec: 88,  hintsUsed: 0, thetaDelta: +0.04, attemptedAgo: '2일 전',    isBookmarked: false },
];

/** 시험 결과 (제출 후 화면) */
export type ExamResult = {
  examId: string;
  examTitle: string;
  submittedAt: string;       // ISO
  duration: number;
  totalMinutes: number;
  problemCount: number;
  correct: number;
  wrong: number;
  unanswered: number;
  rawScore: number;
  estimatedGrade: number;
  thetaBefore: number;
  thetaAfter: number;
  /** 오답 클러스터 — 같은 패턴끼리 묶음 */
  errorClusters: { pattern: string; count: number; skus: string[] }[];
  /** 시간 활용 */
  timeUsedMin: number;
  proctorEvents: number;     // 탭 이탈 등
};

export const lastExamResult: ExamResult = {
  examId: 'me1',
  examTitle: '2025 6월 모의평가 — 수학',
  submittedAt: '2026-04-26T15:42:00',
  duration: 100,
  totalMinutes: 92,
  problemCount: 30,
  correct: 22,
  wrong: 7,
  unanswered: 1,
  rawScore: 73,
  estimatedGrade: 3,
  thetaBefore: 0.35,
  thetaAfter: 0.42,
  errorClusters: [
    { pattern: '경계 조건 누락', count: 3, skus: ['Q-MATH-CALC-0028', 'Q-MATH-CALC-0033', 'Q-MATH-PROB-0019'] },
    { pattern: '부호 변화 생략', count: 2, skus: ['Q-MATH-CALC-0042', 'Q-MATH-CALC-0019'] },
    { pattern: '계산 실수',      count: 2, skus: ['Q-MATH-PROB-0019', 'Q-MATH-CALC-0028'] },
  ],
  timeUsedMin: 92,
  proctorEvents: 0,
};
