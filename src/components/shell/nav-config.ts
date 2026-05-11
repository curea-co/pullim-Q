/**
 * 통합 네비게이션 설정 — 풀림 Q 단일 도메인.
 * 사이드바·하단탭·검색이 모두 이 파일을 참조.
 */

import {
  Home, Infinity, Activity, Target, Brain, Repeat,
  Users, ScanSearch, User,
  Pencil, Eye, History, Award, BookOpen,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  /** 활성 상태로 인식할 추가 prefix */
  matchPrefix?: string[];
  /** 출시 전 잠금 표시 */
  locked?: boolean;
  /** 한 줄 설명 — 검색 결과·툴팁 */
  description?: string;
  /** 섹션 — 이 prefix로 진입하면 사이드바가 children 전용으로 swap */
  children?: NavSubItem[];
};

export type NavSubItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  description?: string;
  locked?: boolean;
};

export type NavGroup = {
  label: string;
  caption?: string;
  items: NavItem[];
};

/** 풀림 Q는 학생 단일 role */
export type Role = 'student';

/** 풀림 Q · 무한풀기 — 풀이 엔진 */
export const infinitySection: NavSubItem[] = [
  { href: '/q/infinity',             label: '홈',           icon: Home,    description: '오늘 풀이 통계 + 빠른 시작' },
  { href: '/q/infinity/solve',       label: '풀이 워크스페이스', icon: Pencil,  description: '연습/시험 모드 통합 풀이' },
  { href: '/q/infinity/explain',     label: '풀림 해설',    icon: Eye,     description: '12-섹션 시그니처 해설' },
  { href: '/q/infinity/exam-result', label: '시험 결과',    icon: Award,   description: '제출 후 채점·분석' },
  { href: '/q/infinity/history',     label: '풀이 이력',    icon: History, description: '풀어본 문제 + 북마크' },
  { href: '/q/infinity/onboarding',  label: '소개하기',       icon: BookOpen, description: '6분 사용법 가이드' },
];

/** 풀림 Q · 분석 — 평가 차원 */
export const analysisSection: NavSubItem[] = [
  { href: '/q/analysis',           label: '홈',           icon: Home,     description: '두 차원 + 처방 미리보기' },
  { href: '/q/analysis/ability',   label: '능력치',       icon: Activity, description: '실력 점수 · 단원 정복도 · 처방' },
  { href: '/q/analysis/process',   label: '과정',         icon: Brain,    description: '메타인지 · 시간 분포 · 패턴' },
  { href: '/q/analysis/diagnose',  label: '진단 시작',     icon: Activity, description: '15문항 적응형 진단' },
  { href: '/q/analysis/history',   label: '진단 이력',     icon: History,  description: '이전 진단 비교', locked: true },
  { href: '/q/analysis/onboarding', label: '소개하기',       icon: BookOpen, description: '4분 사용법 가이드' },
];

/** 풀림 Q · 복습 — 오답 정복 + 망각 곡선 통합 */
export const reviewSection: NavSubItem[] = [
  { href: '/q/review',            label: '홈',            icon: Home,     description: '오늘 우선 큐 + Leitner + 망각 곡선 한눈에' },
  { href: '/q/review/conquer',    label: '정복 세트 풀이', icon: Target,   description: '패턴 맞춤 5문제 풀이' },
  { href: '/q/review/master',     label: '마스터 갤러리',  icon: Award,    description: '정복 완료 패턴 + 스탬프', locked: true },
  { href: '/q/review/onboarding', label: '소개하기',       icon: BookOpen, description: '4분 사용법 가이드' },
];

/** 풀림 Q · 코치 */
export const talkSection: NavSubItem[] = [
  { href: '/q/talk',            label: '홈',      icon: Home,     description: '오늘 통합 메시지 + 채팅' },
  { href: '/q/talk/onboarding', label: '소개하기', icon: BookOpen, description: '3분 사용법 가이드' },
];

/** 풀림 Q 허브 children — 4 서브도메인 진입 */
export const qSection: NavSubItem[] = [
  { href: '/q',            label: '홈',       icon: Home,          description: '4 서브도메인 진입점' },
  { href: '/q/infinity',   label: '무한풀기', icon: Infinity,      description: '연습/시험 모드 통합 풀이' },
  { href: '/q/talk',       label: '코치',     icon: Users,         description: '공부 전반을 봐주는 친구 — 채팅 + 통합 메시지' },
  { href: '/q/analysis',   label: '분석',     icon: ScanSearch,    description: '능력치 + 메타인지 두 차원' },
  { href: '/q/review',     label: '복습',     icon: Repeat,        description: 'Leitner + 망각곡선 통합' },
  { href: '/q/onboarding', label: '소개하기', icon: BookOpen,      description: '4분 사용법 가이드' },
];

/** 사이드바 최상단 별도 항목 — 풀림 Q 메인 */
export const studentHomeItem: NavItem = {
  href: '/q',
  label: '풀림 Q',
  icon: BookOpen,
  description: '풀이·분석·복습·AI 대화 통합',
  children: qSection,
};

/** 단일 도메인 — Q만 노출 */
export const studentDomains: NavItem[] = [studentHomeItem];

/** 호환용 — buildBreadcrumb / findActiveSection 등이 단일 그룹 구조 기대 */
export const studentNav: NavGroup[] = [
  { label: '', items: [studentHomeItem] },
];

export function navForRole(_role: Role): NavGroup[] {
  return studentNav;
}

/** 모바일 하단 4탭 */
export const studentBottomTabs = [
  { href: '/q',           label: 'Q 홈',      icon: Home,       matchPrefix: ['/q'] },
  { href: '/q/infinity',  label: '무한풀기',  icon: Infinity,   matchPrefix: ['/q/infinity'] },
  { href: '/q/analysis',  label: '분석',      icon: ScanSearch, matchPrefix: ['/q/analysis'] },
  { href: '/q/review',    label: '복습',      icon: Repeat,     matchPrefix: ['/q/review'] },
  { href: '/me',          label: '내정보',    icon: User,       matchPrefix: ['/me'] },
] as const;

/** 현재 pathname이 어떤 섹션 안에 있는지 — sidebar swap 판단 */
export function findActiveSection(pathname: string, role: Role): NavItem | undefined {
  const nav = navForRole(role);
  for (const group of nav) {
    for (const item of group.items) {
      if (!item.children) continue;
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return item;
      }
    }
  }
  return undefined;
}

/** 라우트 → 활성 NavItem 찾기 */
export function findActiveNav(pathname: string, role: Role): NavItem | undefined {
  const nav = navForRole(role);
  for (const group of nav) {
    for (const item of group.items) {
      if (pathname === item.href) return item;
    }
  }
  let best: NavItem | undefined;
  let bestLen = 0;
  for (const group of nav) {
    for (const item of group.items) {
      if (pathname.startsWith(item.href + '/') && item.href.length > bestLen) {
        best = item;
        bestLen = item.href.length;
      }
    }
  }
  return best;
}

/** Q sub-section 매핑 — 깊은 경로 breadcrumb 용 */
const subSectionByPrefix: { prefix: string; section: NavSubItem[] }[] = [
  { prefix: '/q/infinity', section: infinitySection },
  { prefix: '/q/talk',     section: talkSection },
  { prefix: '/q/analysis', section: analysisSection },
  { prefix: '/q/review',   section: reviewSection },
];

/** 라우트 → breadcrumb */
export function buildBreadcrumb(pathname: string, _role: Role): { label: string; href?: string }[] {
  const root = { label: '풀림 Q', href: '/q' };
  const trail: { label: string; href?: string }[] = [root];

  if (pathname === root.href || pathname === '/') return trail;

  // Q sub-section 후보를 prefix 매칭 → 깊이 순 정렬
  const candidates: NavSubItem[] = [...qSection];
  for (const s of subSectionByPrefix) {
    if (pathname === s.prefix || pathname.startsWith(s.prefix + '/')) {
      candidates.push(...s.section);
    }
  }

  const seen = new Set<string>([root.href]);
  const matched: NavSubItem[] = [];
  for (const c of candidates) {
    if (seen.has(c.href)) continue;
    if (pathname === c.href || pathname.startsWith(c.href + '/')) {
      seen.add(c.href);
      matched.push(c);
    }
  }
  matched.sort((a, b) => a.href.length - b.href.length);
  for (const m of matched) {
    trail.push({ label: m.label, href: m.href });
  }

  return trail;
}
