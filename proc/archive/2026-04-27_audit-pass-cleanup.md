# 2026-04-27 종합 Audit 통과 정리

## 목표
풀림 스터디 도메인 출시 전 7개 축 검증 통과 — 라우트·네이밍·라이브러리·페르소나·lint·build·redirect 모두 클린.

## 작업 항목
- [x] `pnpm lint` 0 errors / 0 warnings 달성
  - [x] react/no-unescaped-entities 16건 정리
  - [x] react-hooks/static-components 3건 정리
  - [x] set-state-in-effect 1건 정리
  - [x] unused imports 22건 정리
- [x] `pnpm build` 50개 라우트 prerender 정상 (옛 redirect 6개 폴더 삭제 후)
- [x] BottomNav `/q/tutor`, `/q/coach` → `/q/talk` 통합 (matchPrefix)
- [x] "Visual Lab" 영문 코드명 노출 제거 → "풀림 비주얼"
- [x] 옛 라우트 직링 11건 → 새 라우트로 교체
  - [x] `/q/index` → `/q/analysis`
  - [x] `/q/conqueror` → `/q/review/wrong`
  - [x] `/q/memory` → `/q/review`
  - [x] `/q/tutor` → `/q/talk/tutor`
- [x] 옛 기능명 학생 UI 잔재 일괄 정리
  - [x] "인덱스" → "분석"
  - [x] "오답정복" → "복습 정복"
  - [x] "기억장치" → "복습"
  - [x] "수학랩" → "수학 필기 인식"
  - [x] "풀림 코치" → "풀림 AI 대화 코치 모드"
- [x] 옛 라우트 redirect 폴더 6개 삭제
  - [x] `/q/index`
  - [x] `/q/conqueror` (+conquer/master)
  - [x] `/q/memory`
  - [x] `/q/xray`
  - [x] `/q/tutor`
  - [x] `/q/coach`
  - 외부 북마크 안전망 제거 (내부 직링 0건 확인 후)
- [x] `mathlab` Future 카드 제거
  - [x] features.ts에서 풀림 수학랩 항목 삭제 (비주얼에 흡수)
  - [x] 학생 대시보드 "준비 중"은 `room` + `voice` 2개만 남김
- [x] Mock 페르소나 일관성 검증 통과
  - [x] 김수학·수학이 형 일관
  - [x] 서연·하윤·도현·고2-A반 일관

## 비고

### Audit 정정 사항
- audit이 dead로 분류한 mock export 4개 (`countByBox`, `pickAgentForQuestion`, `demoReplies`, `forgettingCurve`)는 실제로는 `LeitnerBoxes` / `CoachChat` / `ForgettingCurveChart` 컴포넌트에서 모두 사용 중 — false positive. 정리 불필요.
