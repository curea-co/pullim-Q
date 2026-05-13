# 풀림 Q advice 정합 보정 (2026-05-12 EOD)

## 목표
오늘 머지된 작업(PR #17/#18/#19/#20/#21) 중 advice 명세와 어긋난 부분 2건 + 거버넌스 문서 누락 2건을 한 묶음 PR로 닫는다. advice의 "거시→미시 → 복습" 닫힌 흐름이 코드에 100% 반영된 상태가 마감 기준.

방향성 출처:
- [input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md](../../input/docs-archive/advice/pullim_q_analysis_보완기능_제안_for_박승훈.md) (이하 "advice")
- [input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md](../../input/docs-archive/advice/pullim_learning_dashboard_faas_project_definition.md) (이하 "FaaS 정의서")

## 작업 항목

### Tier A — 코드 누락 보정 (advice 명세 위반)

#### A.1 다음 학습 카드 5장 → 6장 (advice §4 기능 5 / §5-2)
- [x] [src/components/question-hub/next-learning-cards.tsx](src/components/question-hub/next-learning-cards.tsx) — `easySorted[0]`/`easySorted[1]` 두 장 노출, 총 6장

#### A.2 `/q/analysis` "오늘의 복습 경로" 블록 (advice §5-1 마지막 NEW 블록)
- [x] 신규: [src/components/analysis/today-review-preview.tsx](src/components/analysis/today-review-preview.tsx) — `overdueCards()` + `todayCards()` + `todayDue(memoryQueue)` 합쳐 상위 3장
- [x] [src/app/(student)/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) — `RecentMistakes` 뒤에 `<TodayReviewPreview />` 삽입
- [x] 카드 클릭: leitner → `/q/review`, memory → `/q/review/memory/[id]`

### Tier B — 거버넌스 문서 보정

#### B.1 12-섹션 ↔ advice 7블록 매핑 표 (Gap 3)
- [x] [proc/plan/2026-05-12_question-hub-foundation.md](2026-05-12_question-hub-foundation.md) "현재 코드 ↔ advice 매핑" 절 아래에 7블록 ↔ 12-섹션 매핑 + 수준별 depth 매핑 + 의도된 차이 명시

#### B.2 audit 트랙 ↔ advice 트랙 교차 명시 (Gap 4)
- [x] [proc/research/2026-05-12_design-audit/README.md](../research/2026-05-12_design-audit/README.md) 상단에 "advice 트랙과의 관계" 절 추가
- [x] [proc/plan/2026-05-12_q-design-followup.md](2026-05-12_q-design-followup.md) 목표 절에 트랙 관계 한 줄 추가
- [x] [proc/spec/08-design-system.md §1.7](../spec/08-design-system.md) 출처 라인을 advice 트랙 정합 명시 포함하도록 보강

### Tier C — 검증

#### C.1 회귀 테스트 갱신
- [x] [scripts/qa-analysis-entry.mjs](../../scripts/qa-analysis-entry.mjs) — "6장 카드 모두 노출 (advice §4 기능 5)" + "easy_same_type 2장 (advice 원문)" + "오늘의 복습 경로 섹션/카드/href" 4개 assertion 추가 (42 → **46/46 pass**)
- [x] `bunx tsc --noEmit` 통과
- [x] `bun run lint` — 47 problems (21 errors 전부 pre-existing `input/design-prototype/*`, 내 변경 신규 noise 0)

## 비범위
- advice §4 기능 1·3·4 — 이미 정합 (Gap 없음)
- FaaS 정의서 §5·§11·§12·§20 (LLM 호출 / OCR / 저작권 / B2B) — 데모 비범위 유지
- design-followup plan §4 색 톤 토큰 실제 적용 — 별도 PR (§1.7 후보안 결정만)
- 차주 carry-over 항목 (F-2 밀도 / F-7 전문용어 / F-9 TOC 한·영)

## 진행 순서
1. A.1 (간단한 카드 추가) — Edit 1건
2. A.2 (신규 컴포넌트 + 페이지 삽입) — Write 1건 + Edit 1건
3. B.1·B.2 (문서 4건) — Edit 4건
4. C.1 (회귀 갱신 + 실행)
5. 커밋 → push → PR (base dev) → 머지
