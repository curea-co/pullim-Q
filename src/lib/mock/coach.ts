/**
 * 풀림 코치 (Agent Orchestra) — 6 에이전트 mock.
 * 03_스터디_마스터.md 5.2 기반.
 *
 * 코치는 단독 기능이 아니라 다른 5개 기능 위에서 도는 메타 layer.
 * 각 에이전트는 다른 기능의 엔진 역할을 함.
 */

export type AgentId =
  | 'planning'      // 플래닝 — 풀림 플래너 엔진
  | 'tutor'         // 튜터 — 풀림 튜터
  | 'motivation'    // 모티베이션 — streak·번아웃·감정
  | 'analysis'      // 분석 — 풀림 인덱스 엔진
  | 'curation'      // 큐레이션 — 스토어/스튜디오 추천
  | 'orchestrator'; // 코치 — 5명 통합 (한 목소리)

export type SignalTone = 'good' | 'warn' | 'info' | 'urgent' | 'celebrate';

export type Agent = {
  id: AgentId;
  name: string;
  role: string;
  /** 연동된 기능 */
  linkedFeatureLabel: string;
  linkedHref?: string;
  /** 현재 핵심 신호 */
  currentSignal: string;
  signalTone: SignalTone;
  /** 오늘 발생시킨 액티비티 수 */
  activityToday: number;
  /** AI 모델 Tier */
  tier: 'T1' | 'T2' | 'T3';
  /** 카드 액센트 컬러 (CSS 변수명) */
  accentVar: string;
};

export const agents: Agent[] = [
  {
    id: 'orchestrator',
    name: '코치',
    role: '6명을 통합해 학생에게 한 목소리로',
    linkedFeatureLabel: '메타 — 모든 기능 위에',
    currentSignal:
      '이번 주 영어 +5%, 수학 미분 약점 잡기 중. 오늘 21:20 미분 미니 모의 권장.',
    signalTone: 'info',
    activityToday: 8,
    tier: 'T3',
    accentVar: 'var(--color-pullim-blue-700)',
  },
  {
    id: 'planning',
    name: '플래닝',
    role: '시간 블록·일/주/월 학습 계획',
    linkedFeatureLabel: '풀림 플래너',
    linkedHref: '/planner',
    currentSignal: '오늘 7개 블록 중 4개 진행 · 21:20 미분 모의시험까지 여유',
    signalTone: 'info',
    activityToday: 6,
    tier: 'T2',
    accentVar: 'var(--color-pullim-warn)',
  },
  {
    id: 'tutor',
    name: '풀이 패턴',
    role: '풀이 데이터에서 약점 패턴 감지',
    linkedFeatureLabel: '풀림 무한풀기 — 솔브',
    linkedHref: '/q/infinity/solve',
    currentSignal: '도함수 단원에서 부호 변화 누락 패턴 5번째 — 비주얼 추천 대기 중',
    signalTone: 'warn',
    activityToday: 12,
    tier: 'T2',
    accentVar: 'var(--color-pullim-blue-500)',
  },
  {
    id: 'motivation',
    name: '모티베이션',
    role: '동기 부여·이탈 방지',
    linkedFeatureLabel: '플래너 번아웃·streak',
    linkedHref: '/planner/calendar',
    currentSignal: '🔥 17일 연속 학습 — 역대 최장 기록 갱신!',
    signalTone: 'celebrate',
    activityToday: 4,
    tier: 'T1',
    accentVar: 'var(--color-pullim-lemon-ink)',
  },
  {
    id: 'analysis',
    name: '분석',
    role: '실력 점수 추세·약점 진단·성적 예측',
    linkedFeatureLabel: '풀림 분석',
    linkedHref: '/q/analysis',
    currentSignal:
      '영어 빈칸 추론 정답률 64% → 78% (+14p). 수학 적분은 -3p, 추가 보강 필요.',
    signalTone: 'good',
    activityToday: 9,
    tier: 'T3',
    accentVar: 'var(--color-pullim-success)',
  },
  {
    id: 'curation',
    name: '큐레이션',
    role: '스토어·스튜디오 맞춤 콘텐츠',
    linkedFeatureLabel: '풀림 스토어 (준비 중)',
    currentSignal:
      '"EBS 수능완성 영어 어휘" 추천 — 당신의 빈칸 약점에 맞춤 (₩9,900)',
    signalTone: 'info',
    activityToday: 3,
    tier: 'T2',
    accentVar: 'var(--color-pullim-blue-300)',
  },
];

/** Orchestrator의 통합 메시지 — 6 에이전트의 신호를 종합 */
export type IntegratedMessage = {
  headline: string;
  body: string;
  contributingAgents: AgentId[];
  cta: { label: string; href: string };
};

export const integratedToday: IntegratedMessage = {
  headline: '오늘 두 가지를 챙겨주세요',
  body:
    '🎯 영어 빈칸 추론은 이번 주 +14p로 성과 분명해요. 한 번 더 정복 세트로 굳히고, ' +
    '⚠ 미분 부호 변화는 같은 패턴에서 5번째 막혔어요. 비주얼로 시각화한 뒤 적응형 풀이 권장.',
  contributingAgents: ['analysis', 'tutor', 'curation', 'planning'],
  cta: { label: '추천 학습 경로 시작', href: '/q/review/wrong' },
};

/** 에이전트 활동 타임라인 — 오늘 */
export type AgentActivity = {
  id: string;
  agentId: AgentId;
  timestamp: string;     // "HH:MM"
  message: string;
  /** 학생이 인지함 */
  acknowledged: boolean;
};

export const todayActivities: AgentActivity[] = [
  { id: 'a1',  agentId: 'motivation',   timestamp: '07:55', message: '🌅 좋은 아침! 17일 연속 시작하기', acknowledged: true },
  { id: 'a2',  agentId: 'curation',     timestamp: '09:15', message: '📚 오답 정복 큐 3개 만기 — 우선순위 1순위는 영어 빈칸 추론', acknowledged: true },
  { id: 'a3',  agentId: 'analysis',     timestamp: '11:42', message: '📈 영어 정답률 78% 돌파 — 4월 첫 진단 대비 +12p', acknowledged: true },
  { id: 'a4',  agentId: 'planning',     timestamp: '14:45', message: '📅 오후 컨디션 보통 → 어려운 블록 18:25로 자동 이동', acknowledged: true },
  { id: 'a5',  agentId: 'tutor',        timestamp: '17:32', message: '💡 도함수 부호 변화 누락 패턴 — 5번째 막힘. 비주얼 추천 준비됨', acknowledged: false },
  { id: 'a6',  agentId: 'orchestrator', timestamp: '18:10', message: '🎼 영어 vs 수학 균형 권장 — 오늘 영어 1시간, 수학 2시간 배분 검토', acknowledged: false },
  { id: 'a7',  agentId: 'motivation',   timestamp: '19:00', message: '🔥 미분 모의 시작 직전 — 컨디션 점검할 타이밍', acknowledged: false },
  { id: 'a8',  agentId: 'curation',     timestamp: '19:18', message: '✦ 적분 시각화 VLM 3종 자동 추천 (스튜디오 김수학)', acknowledged: false },
];

/** 통합 채팅 — 시작 메시지 + 빠른 질문 */
export const coachGreeting =
  '안녕 서연! 나는 풀림 코치야. 6명의 전문가(플래닝·튜터·모티베이션·분석·큐레이션·코치)가 ' +
  '뒤에서 협업하고 있어. 자유롭게 질문해주면 가장 알맞은 에이전트가 답할게.';

export const quickQuestions: { text: string; preferAgent: AgentId }[] = [
  { text: '오늘 학습 평가해줘',           preferAgent: 'analysis' },
  { text: '내일 일정 미리 알려줘',         preferAgent: 'planning' },
  { text: '나 잘하고 있는 거 맞아?',       preferAgent: 'motivation' },
  { text: '미분 다시 어디부터 봐야 해?',    preferAgent: 'tutor' },
  { text: '영어 단어집 추천해줘',          preferAgent: 'curation' },
];

/** 자유 질문 → 에이전트 응답 매칭 (데모용) */
export function pickAgentForQuestion(q: string): AgentId {
  const lower = q.toLowerCase();
  if (lower.match(/일정|계획|시간|블록/)) return 'planning';
  if (lower.match(/힌트|풀이|어려|문제|개념/)) return 'tutor';
  if (lower.match(/잘하|힘들|지친|streak|연속|동기/)) return 'motivation';
  if (lower.match(/정답률|θ|점수|약점|성적|분석/)) return 'analysis';
  if (lower.match(/추천|교재|책|단어|어휘/)) return 'curation';
  return 'orchestrator';
}

/** 빠른 질문에 대한 데모 응답 */
export const demoReplies: Record<string, { agent: AgentId; reply: string }> = {
  '오늘 학습 평가해줘': {
    agent: 'analysis',
    reply:
      '오늘 4시간 30분 학습, 정답률 78%, 실력 점수 +0.08. 영어 정답률이 어제보다 +5%야. ' +
      '특히 빈칸 추론에서 접속사 단서 패턴을 잘 잡고 있어. 미분만 한 번 더 보강하면 좋겠어.',
  },
  '내일 일정 미리 알려줘': {
    agent: 'planning',
    reply:
      '내일 8개 블록 (오늘과 비슷). 오늘 미분 막힌 거 반영해서 18:25–19:25에 비주얼 미분 시각화 추가했어. ' +
      '플래너에서 미리보기 가능해.',
  },
  '나 잘하고 있는 거 맞아?': {
    agent: 'motivation',
    reply:
      '서연! 17일 연속 학습 중이야 — 우리 데이터 기준 상위 8% 끈기. 영어 빈칸은 4월 들어 +14p 성장. 진심으로 잘하고 있어 🙌',
  },
  '미분 다시 어디부터 봐야 해?': {
    agent: 'tutor',
    reply:
      '도함수의 부호 변화부터 다시 시작하자. 너는 f\'(x) = 0까진 잘 풀어. 그 다음 단계, 부호 변화 표 그리는 5초 습관이 빠져있어. ' +
      '풀림 비주얼의 미분 시뮬레이션 5분만 만져보고 와.',
  },
  '영어 단어집 추천해줘': {
    agent: 'curation',
    reply:
      '네 빈칸 추론 패턴(접속사 논리 관계)에 맞춰 "EBS 수능완성 영어 어휘 - 논리 어휘 편" 추천. ' +
      '12,000원, 풀림 스토어에서 바로 학습 가능. 14일 효과 추적도 함께.',
  },
};