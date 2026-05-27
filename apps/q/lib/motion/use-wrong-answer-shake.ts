import { useState, useCallback, useEffect } from 'react';

/**
 * M2 — 정답 제출 → 오답.
 * 선택 카드 shake X(-6→6→-3→0), border `danger.fg 2px`, 350ms standard.
 * shake 1회만 — 부정 피드백 절제.
 */
export function useWrongAnswerShake() {
  const [isShaking, setIsShaking] = useState(false);

  const shake = useCallback(() => {
    setIsShaking(true);
  }, []);

  useEffect(() => {
    if (!isShaking) return;
    const t = setTimeout(() => setIsShaking(false), 360);
    return () => clearTimeout(t);
  }, [isShaking]);

  return {
    isShaking,
    shake,
    animateClass: isShaking ? 'animate-shake-x' : '',
    cardBorderClass: 'border-pullim-danger-fg border-2',
  };
}
