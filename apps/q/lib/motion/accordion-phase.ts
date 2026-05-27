/**
 * M8 — 해설 페이즈 펼침/접힘.
 * height 0↔auto + opacity, chevron rotate 0↔180. 240ms standard.
 * tw-animate-css `accordion-up/down` 클래스를 활용 — 별도 keyframe 불필요.
 *
 * shadcn Accordion 컴포넌트 또는 details/summary 패턴에 적용:
 *   <details className={accordionPhaseClass(isOpen)}>
 */
export function accordionPhaseClass(isOpen: boolean): string {
  return [
    'overflow-hidden transition-all duration-[240ms]',
    isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0',
  ].join(' ');
}

export const accordionChevronClass = 'transition-transform duration-[240ms]';
export function accordionChevronStyle(isOpen: boolean): React.CSSProperties {
  return { transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' };
}
