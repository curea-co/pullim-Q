import { useState, useEffect, useCallback } from 'react';

/**
 * M6 — 스트릭 +1.
 * 뱃지 spring scale(1→1.15→1) + brand glow + 텍스트 flip. 600ms emphasis.
 * 호출부: 스트릭 카운트 증가 시 trigger() → 600ms 후 자동 해제.
 */
export function useStreakBump() {
  const [isBumping, setIsBumping] = useState(false);

  const trigger = useCallback(() => {
    setIsBumping(true);
  }, []);

  useEffect(() => {
    if (!isBumping) return;
    const t = setTimeout(() => setIsBumping(false), 620);
    return () => clearTimeout(t);
  }, [isBumping]);

  return {
    isBumping,
    trigger,
    animateClass: isBumping ? 'animate-streak-bump' : '',
  };
}
