import { useState, useCallback } from 'react';

/**
 * M1 — 정답 제출 → 정답 reveal.
 * 선지 카드 border `success.fg 3px`, ✓ 아이콘 spring scale(0→1.1→1), confetti.
 * 사용: const { isRevealed, reveal, animateClass } = useCorrectAnswerReveal();
 *       <Card className={isRevealed ? animateClass : ''}>
 */
export function useCorrectAnswerReveal() {
  const [isRevealed, setIsRevealed] = useState(false);

  const reveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const reset = useCallback(() => {
    setIsRevealed(false);
  }, []);

  return {
    isRevealed,
    reveal,
    reset,
    animateClass: 'animate-correct-pop',
    cardBorderClass: 'border-pullim-success-fg border-[3px]',
  };
}
