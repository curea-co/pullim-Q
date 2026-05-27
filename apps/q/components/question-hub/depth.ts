/**
 * advice §4 기능 2 — 학생 레벨(예상 등급)별 해설 깊이 자동 조절.
 *
 * 1~2등급: 정답 근거 + 같은 유형 전략만 (빠르게)
 * 3~4등급: + 단계별 풀이 + 선지별 판단
 * 5~9등급: + 배경/용어/시각 (충분한 발판)
 */

export type SectionId =
  | 's1' | 's2' | 's3' | 's4' | 's5' | 's6'
  | 's7' | 's8' | 's9' | 's10' | 's11' | 's12';

const SECTION_LABEL: Record<SectionId, string> = {
  s1: 'Hero Recap',
  s2: 'Prologue',
  s3: '4-Path 풀이',
  s4: 'Root Graph',
  s5: 'Error Anatomy',
  s6: '100명의 선택',
  s7: 'Visual Canvas',
  s8: 'Pattern Family',
  s9: 'Feynman Challenge',
  s10: 'Teacher Voices',
  s11: 'History + Real',
  s12: 'Memory Anchor',
};

const OPEN_BY_GRADE: { maxGrade: number; open: SectionId[]; label: string }[] = [
  { maxGrade: 2, open: ['s1', 's8'],                                    label: '상위권 — 정답 근거 + 유형 전략' },
  { maxGrade: 4, open: ['s1', 's3', 's5', 's8'],                        label: '중위권 — 단계별 풀이까지 함께' },
  { maxGrade: 9, open: ['s1', 's3', 's4', 's5', 's7', 's8', 's12'],     label: '하위권 — 배경·용어·시각까지' },
];

/** 등급(1~9)을 받아 sectionId → defaultOpen 여부 매핑 함수 반환 */
export function getDepthRule(grade: number): (id: SectionId) => boolean {
  const rule = OPEN_BY_GRADE.find(r => grade <= r.maxGrade) ?? OPEN_BY_GRADE[OPEN_BY_GRADE.length - 1]!;
  return id => rule.open.includes(id);
}

/** 등급별 펼침 셋 메타 — UI 표시용 */
export function getDepthMeta(grade: number): { open: SectionId[]; label: string; openLabels: string[] } {
  const rule = OPEN_BY_GRADE.find(r => grade <= r.maxGrade) ?? OPEN_BY_GRADE[OPEN_BY_GRADE.length - 1]!;
  return {
    open: rule.open,
    label: rule.label,
    openLabels: rule.open.map(id => SECTION_LABEL[id]),
  };
}
