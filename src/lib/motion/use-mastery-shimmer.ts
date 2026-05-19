/**
 * M7 — 마스터리 진행바 채워짐.
 * width 0→target px, gradient shimmer 1회, 800ms standard.
 * 사용: bar 컴포넌트의 className에 추가 + inline style로 width transition.
 */
export function useMasteryShimmer(targetPercent: number) {
  return {
    animateClass: 'animate-mastery-shimmer',
    style: {
      width: `${Math.min(100, Math.max(0, targetPercent))}%`,
      transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundImage:
        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
      backgroundSize: '200% 100%',
    } as React.CSSProperties,
  };
}
