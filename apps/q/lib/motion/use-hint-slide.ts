import { useState, useCallback } from 'react';

/**
 * M9 — 힌트 사용.
 * 힌트 카드 slide-down from top + 잔여 횟수 뱃지 -1 카운트.
 * 280ms emphasis.
 */
export function useHintSlide(initialRemaining: number) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const [isShowing, setIsShowing] = useState(false);

  const useHint = useCallback(() => {
    if (remaining <= 0) return false;
    setRemaining((r) => r - 1);
    setIsShowing(true);
    return true;
  }, [remaining]);

  const dismiss = useCallback(() => setIsShowing(false), []);

  return {
    remaining,
    isShowing,
    useHint,
    dismiss,
    animateClass: 'animate-hint-slide',
    badgeClass: 'bg-pullim-blue-50 text-pullim-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold',
  };
}
