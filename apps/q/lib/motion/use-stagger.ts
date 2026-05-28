/**
 * M5 — 페이지 진입 카드 stagger.
 * 카드 index i에 대해 delay = i × 40ms, opacity+y(8→0) base 200ms.
 * 인라인 style로 적용. CSS animation은 globals.css `animate-in fade-in slide-in-from-bottom-2`
 * (tw-animate-css)를 활용 가능.
 *
 * 사용:
 *   {items.map((it, i) => (
 *     <Card key={it.id} style={useStaggerDelay(i)} className="animate-in fade-in slide-in-from-bottom-2">
 *   ))}
 */
export function useStaggerDelay(index: number, stepMs = 40): React.CSSProperties {
  return {
    animationDelay: `${index * stepMs}ms`,
    animationDuration: '200ms',
    animationFillMode: 'both',
  };
}
