import { useState, useEffect, useCallback } from 'react';

/**
 * M10 — 큐 chunk 휴식 모달.
 * 풀스크린 dim + 휴식 카드 spring up, 30s ring countdown.
 * 320ms emphasis (mount), countdown은 1s 간격 setInterval.
 */
export function useBreakModal(durationSec = 30) {
  const [isOpen, setIsOpen] = useState(false);
  const [remaining, setRemaining] = useState(durationSec);

  const start = useCallback(() => {
    setRemaining(durationSec);
    setIsOpen(true);
  }, [durationSec]);

  const skip = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setIsOpen(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isOpen]);

  return {
    isOpen,
    remaining,
    start,
    skip,
    animateClass: 'animate-break-spring',
    ringProgress: ((durationSec - remaining) / durationSec) * 100,
  };
}
