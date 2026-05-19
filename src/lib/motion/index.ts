/**
 * 풀림 Q 모션 토큰 + M1~M10 카탈로그 헬퍼 (08-design-system.md §10).
 * CSS 변수와 동기 — globals.css `@theme inline` 안 `--motion-*` / `--animate-*`.
 *
 * 사용 패턴
 * - 단순 keyframe: className에 `animate-correct-pop` 등 (Tailwind v4 토큰 인식)
 * - state 기반 훅: useTimerPulse / useCountUp 등 import
 *
 * Spec §10.3.1 prefers-reduced-motion: globals.css media rule이 일괄 차단.
 */

export const motionDuration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export const motionEasing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  emphasis: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { useCorrectAnswerReveal } from './use-correct-answer-reveal';
export { useWrongAnswerShake } from './use-wrong-answer-shake';
export { useTimerPulse } from './use-timer-pulse';
export { useCountUp } from './use-count-up';
export { useStaggerDelay } from './use-stagger';
export { useStreakBump } from './use-streak-bump';
export { useMasteryShimmer } from './use-mastery-shimmer';
export { accordionPhaseClass } from './accordion-phase';
export { useHintSlide } from './use-hint-slide';
export { useBreakModal } from './use-break-modal';
