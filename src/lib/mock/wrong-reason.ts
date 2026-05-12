/**
 * 오답 원인 fallback taxonomy — FaaS 정의서 §8.1 10종.
 *
 * 콘텐츠 파트너(advice 김의연·최선혜/선애 트랙)에서 v1이 도착하기 전까지의 placeholder.
 * 도착 시 `oneLineMessage`·`subjectExamples`·`nextStepHint`만 덮어쓰면 코드 변경 없이 교체 가능.
 *
 * 출처: input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md §8.1
 */

import type { SubjectKey } from './persona';

export const WRONG_REASON_CODES = [
  '지문_근거_놓침',
  '단어_의미_오해',
  '선지_범위_과대해석',
  '조건_누락',
  '개념_혼동',
  '계산_실수',
  '자료_해석_순서_오류',
  '유형_전략_모름',
  '배경지식_부족',
  '문장_구조_해석_실패',
] as const;

export type WrongReasonCode = (typeof WRONG_REASON_CODES)[number];

export type WrongReasonEntry = {
  code: WrongReasonCode;
  label: string;
  /** 학생에게 한 줄로 보여줄 메시지 */
  oneLineMessage: string;
  /** 과목별 발현 예시 — 학생 주 과목에 맞춰 노출 */
  subjectExamples: Partial<Record<SubjectKey, string>>;
  /** "다음에 같은 실수를 줄이는 방법" 1줄 (FaaS §8.1 기능 1 화면 요소) */
  nextStepHint: string;
};

export const wrongReasonCatalog: Record<WrongReasonCode, WrongReasonEntry> = {
  지문_근거_놓침: {
    code: '지문_근거_놓침',
    label: '지문 근거 놓침',
    oneLineMessage: '정답을 가리키는 지문 단서를 끝까지 따라가지 않았어요.',
    subjectExamples: {
      korean: '지문 중반의 "그러나" 뒤 주장이 정답 근거였는데, 도입 사례만 보고 골랐어요.',
      english: 'However 절에 핵심 단서가 있었는데, 앞 문장만 보고 빈칸 의미를 정했어요.',
      social: '자료(가)의 단서를 자료(나)에서 다시 확인하는 절차를 건너뛰었어요.',
    },
    nextStepHint: '정답을 정하기 전, 지문에서 근거 문장을 손가락으로 짚어보세요.',
  },
  단어_의미_오해: {
    code: '단어_의미_오해',
    label: '단어 의미 오해',
    oneLineMessage: '핵심 단어를 평소 쓰던 다른 뜻으로 해석했어요.',
    subjectExamples: {
      english: '"cumulative(누적적인)"를 "결정적인"으로 잘못 받아들였어요.',
      korean: '"역설"을 "반대"라는 좁은 뜻으로 사용해 글의 주제를 비틀었어요.',
      math: '"적어도"를 "정확히"로 받아들여 여사건 풀이를 놓쳤어요.',
    },
    nextStepHint: '낯선 단어가 있으면 문맥에서 동의어 후보를 먼저 떠올려보세요.',
  },
  선지_범위_과대해석: {
    code: '선지_범위_과대해석',
    label: '선지 범위 과대 해석',
    oneLineMessage: '선지에 적힌 범위·일반화를 실제보다 넓게 받아들였어요.',
    subjectExamples: {
      korean: '"모든 사례에서"라는 강한 단정을 지문이 말하지 않았는데도 정답으로 받아들였어요.',
      science: '"항상 비례"한다는 표현을, 조건 구간 안에서만 비례하는 자료에 그대로 적용했어요.',
      social: '"전체 경향"을 일부 표본의 추세로 단정해 골랐어요.',
    },
    nextStepHint: '"모두/항상/언제나"가 들어간 선지는 반례를 한 번 떠올려보세요.',
  },
  조건_누락: {
    code: '조건_누락',
    label: '조건 누락',
    oneLineMessage: '문제 조건을 끝까지 읽지 않고 풀이를 시작했어요.',
    subjectExamples: {
      math: '"단, x ≥ 0" 조건을 건너뛰어 음수 해까지 정답으로 포함했어요.',
      science: '"등속 운동" 조건을 빠뜨려 가속도가 있는 풀이로 갔어요.',
      english: '"단어 형태 변형 불가" 조건을 보지 못해 동사 형태를 바꿔 적었어요.',
    },
    nextStepHint: '문제를 다 푼 뒤, 조건이 적힌 줄로 한 번 더 돌아가 확인하세요.',
  },
  개념_혼동: {
    code: '개념_혼동',
    label: '개념 혼동',
    oneLineMessage: '닮았지만 다른 두 개념을 같은 것으로 다뤘어요.',
    subjectExamples: {
      math: '"극값의 x좌표(위치)"와 "극값(함수값)"을 같은 숫자로 적었어요.',
      science: '"속도"와 "가속도"를 같은 방향으로만 변한다고 가정했어요.',
      history: '"갑오개혁"과 "을미개혁"의 추진 주체를 뒤바꿨어요.',
    },
    nextStepHint: '닮은 개념 두 개를 한 줄로 정의하고, 차이를 한 단어로 적어보세요.',
  },
  계산_실수: {
    code: '계산_실수',
    label: '계산 실수',
    oneLineMessage: '풀이 방향은 맞았지만 계산 단계에서 어긋났어요.',
    subjectExamples: {
      math: 'f(1) = 1 − 3 + 1 = −1을 +1로 부호를 바꿔 적었어요.',
      science: '단위 환산(cm → m)에서 100배가 아니라 10배만 곱했어요.',
      social: '백분율 계산에서 분모와 분자를 뒤바꿔 적었어요.',
    },
    nextStepHint: '풀이 마지막 줄을 다시 한 번 손으로 짚으며 검산하세요.',
  },
  자료_해석_순서_오류: {
    code: '자료_해석_순서_오류',
    label: '자료 해석 순서 오류',
    oneLineMessage: '표·그래프를 잘못된 순서로 읽어 결론이 어긋났어요.',
    subjectExamples: {
      social: '연도별 그래프인데 좌→우(과거→현재) 대신 우→좌로 추세를 해석했어요.',
      science: '그래프의 가로축이 시간이라는 것을 놓치고 세로축 값만 비교했어요.',
      math: '확률분포표에서 행 합 대신 열 합을 1로 두고 풀었어요.',
    },
    nextStepHint: '자료를 보기 전, 가로/세로축과 단위를 먼저 소리 내어 읽어보세요.',
  },
  유형_전략_모름: {
    code: '유형_전략_모름',
    label: '유형 전략 모름',
    oneLineMessage: '문제 유형에 맞는 접근 순서가 아직 정해져 있지 않아요.',
    subjectExamples: {
      english: '빈칸 추론에서 "역접 연결어 → 빈칸 뒤 문장 우선" 순서가 굳어지지 않았어요.',
      math: '극값 문제에서 "도함수 → 부호 변화 표 → 함수값" 순서를 건너뛰었어요.',
      korean: '<보기> 문제에서 <보기>의 관점을 지문에 투영하는 순서를 놓쳤어요.',
    },
    nextStepHint: '같은 유형 3문항을 풀이 순서 5단계로 적어보면 굳어져요.',
  },
  배경지식_부족: {
    code: '배경지식_부족',
    label: '배경지식 부족',
    oneLineMessage: '지문이 전제한 사전 지식이 부족해서 해석이 흔들렸어요.',
    subjectExamples: {
      korean: '"훈민정음 해례본"의 시대 배경을 몰라 글의 어조를 오해했어요.',
      english: '"Industrial Revolution"의 시대 배경 없이 글의 비유 의도를 놓쳤어요.',
      science: '"엔트로피"를 단순히 "무질서"로만 알고 있어 닫힌계 조건을 못 봤어요.',
    },
    nextStepHint: '낯선 고유명사나 시대 배경이 나오면 한 줄 메모로 적어두세요.',
  },
  문장_구조_해석_실패: {
    code: '문장_구조_해석_실패',
    label: '문장 구조 해석 실패',
    oneLineMessage: '복잡한 문장의 주어·동사 짝을 잘못 묶었어요.',
    subjectExamples: {
      english: '관계대명사 절 안의 동사를 주절 동사로 착각해 시제를 맞췄어요.',
      korean: '"~로 인해 ~하게 된"의 인과 방향을 반대로 해석했어요.',
      social: '"A는 B에 비해 C보다 크다"의 비교 대상을 한 단계 건너뛰어 묶었어요.',
    },
    nextStepHint: '긴 문장을 만나면 주어와 본동사에 동그라미부터 쳐보세요.',
  },
};

/** 한 시도당 노출 코드 최대 2개 (FaaS §8.1 기능 1 — hero 카드 상위 2개) */
export function pickPrimaryReasons(codes: WrongReasonCode[]): WrongReasonCode[] {
  return codes.slice(0, 2);
}

/**
 * 학생의 최근 오답 시도 진단.
 * solveHistory(infinity.ts)의 'wrong' / 'partial' 항목과 1:1 매핑.
 */
export type WrongAttemptDiagnosis = {
  /** solveHistory.id 와 동일 */
  attemptId: string;
  sku: string;
  /** 학생이 고른 답 (0-indexed) */
  selectedIndex: number;
  /** 정답 (0-indexed) */
  correctIndex: number;
  /** 진단된 오답 원인 — 최대 2개, 빈도순 */
  wrongReasonCodes: WrongReasonCode[];
  /** 문제 한 줄 요약 — 카드 표시용 */
  summary: string;
};

export const wrongAttemptDiagnoses: WrongAttemptDiagnosis[] = [
  {
    attemptId: 'h2',
    sku: 'Q-MATH-CALC-0042',
    selectedIndex: 1,
    correctIndex: 0,
    wrongReasonCodes: ['개념_혼동', '유형_전략_모름'],
    summary: 'f(x) = x³ − 3x + 1의 극댓값과 극솟값',
  },
  {
    attemptId: 'h5',
    sku: 'Q-ENG-VOC-0872',
    selectedIndex: 3,
    correctIndex: 0,
    wrongReasonCodes: ['단어_의미_오해'],
    summary: 'make a ____ to leave the company — 연어 선택',
  },
  {
    attemptId: 'h6',
    sku: 'Q-MATH-CALC-0028',
    selectedIndex: 2,
    correctIndex: 1,
    wrongReasonCodes: ['조건_누락', '계산_실수'],
    summary: '4차함수의 극값과 변곡점 — 부분 정답',
  },
  // 추가 5개 — 10종 분포 보이기 위한 가상 시도 (history에는 없는 과거 풀이)
  {
    attemptId: 'h9',
    sku: 'Q-ENG-RDG-1212',
    selectedIndex: 2,
    correctIndex: 0,
    wrongReasonCodes: ['지문_근거_놓침', '문장_구조_해석_실패'],
    summary: '글의 순서 — 역접 연결어 단서 추적',
  },
  {
    attemptId: 'h10',
    sku: 'Q-SCI-PHY-0301',
    selectedIndex: 3,
    correctIndex: 2,
    wrongReasonCodes: ['자료_해석_순서_오류'],
    summary: 'v-t 그래프 — 가속도 부호 판단',
  },
  {
    attemptId: 'h11',
    sku: 'Q-KOR-RDG-0455',
    selectedIndex: 0,
    correctIndex: 3,
    wrongReasonCodes: ['선지_범위_과대해석'],
    summary: '비문학 — "모든 사례에서"를 받아들인 함정',
  },
  {
    attemptId: 'h12',
    sku: 'Q-SOC-HIST-0188',
    selectedIndex: 1,
    correctIndex: 2,
    wrongReasonCodes: ['배경지식_부족', '개념_혼동'],
    summary: '갑오개혁 vs 을미개혁 — 추진 주체',
  },
];

/**
 * 최근 N개 오답을 빈도 기준으로 집계.
 * 같은 코드 내림차순, 동률은 최근(배열 끝) 우선.
 */
export function aggregateRecentWrongReasons(
  diagnoses: WrongAttemptDiagnosis[] = wrongAttemptDiagnoses,
  topN = 3,
): { code: WrongReasonCode; count: number }[] {
  const counts = new Map<WrongReasonCode, number>();
  for (const d of diagnoses) {
    for (const code of d.wrongReasonCodes) {
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
