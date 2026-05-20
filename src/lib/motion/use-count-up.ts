import { useEffect, useState } from 'react';
import { prefersReducedMotion } from './index';

/**
 * M4 — 점수 노출 카운트업.
 * 0 → target 까지 duration 동안 ease-out (cubic). 끝나면 stop.
 * prefers-reduced-motion 시 즉시 target.
 */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // reduced motion: animation 없이 1회 최종값 — cascade 없음
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
      return;
    }
    if (target === 0) {
      setValue(0);
      return;
    }
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return value;
}
