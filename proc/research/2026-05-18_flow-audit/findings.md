# Flow Audit — 2026-05-18 (학생 라우트 진입·이탈 동선)

> **트리거**: 2026-05-18 reverse-analysis 슬라이드 작성 중 사용자 지적 — "무한풀기 소개하기 진입점이 없잖아", "분석 → 진단 시작 CTA 없네". 콘텐츠 분석에 앞서 **플로우 audit 부터 다시** 해야 한다는 진단.
>
> **방법**: 학생 라우트 21개의 in-page `<Link href>` + `router.push/replace` 전수 추출 → 진입 경로(누가 보내나) + 이탈 경로(어디로 보내나) 매트릭스화 → dead route + 누락 CTA 식별.
>
> **셸 nav 제외**: AppSidebar / BottomNav / AppHeader / CoachFab 동선은 audit 대상 외 (전역 fallback). 본 audit 은 **in-page CTA** 기준.

## 0. 우선순위 요약

| 심각도 | 건수 | 분류 |
|---|---|---|
| 🚨 Critical (dead-end 또는 6단계 루프 차단) | 3 | onboarding 5개 dead / 분석→진단 CTA 부재 / talk 종료 후 다음 액션 없음 |
| 🟡 Important (논리적 후속 CTA 누락) | 5 | external placeholder / infinity exam-result 조건 / explain→retry / process↔ability lateral / /me placeholder |
| 🟢 Nit (정합성) | 3 | analysis/[questionId] 진입 부족 / infinity/history 진입 1곳 / 홈 외부 도메인 노이즈 |

---

## 1. 진입·이탈 매트릭스 (in-page CTA 기준, 셸 nav 제외)

| 라우트 | 진입 (어디서 보내나) | 이탈 (어디로 보내나) | 비고 |
|---|---|---|---|
| `/q` | (root `/` redirect, `/q/external/*` back) | `/q/infinity/solve?kind=free` (TodayQueue), `/q/infinity/exam-result`, `/q/analysis/diagnose` (조건부), `/q/infinity/explain/${sku}` | 6단계 루프 진입점, 다중 ExitCTA OK |
| **`/q/onboarding`** | **없음** | (back?) | 🚨 **dead** — 사이드바 "소개하기" 외 진입 0 |
| `/q/infinity` | (셸 nav 만) | `/q/infinity/solve`, `/q/infinity/history`, `/q/infinity/explain`, `/q/infinity/exam-result`, `/q/infinity/explain/${sku}` | 일부 조건부 CTA 없음 (§2.5) |
| **`/q/infinity/onboarding`** | **없음** | (back?) | 🚨 **dead** |
| `/q/infinity/solve` (picker) | `/q`, `/q/infinity`, `/q/infinity/exam-result`, `/q/review` (retry), components | (router.replace internal), `/q/infinity/explain/${sku}` | 진입 풍부 ✓ |
| `/q/infinity/explain` | `/q/infinity` ("풀림 해설" 링크) | `/q/analysis/${sku}?from=library` | 🟡 retry CTA 누락 (§2.6) |
| `/q/infinity/explain/[sku]` | `/q`, `/q/infinity`, `/q/infinity/solve`, `/q/infinity/history`, `/q/infinity/exam-result` | (analysis 등) | 진입 풍부 ✓ |
| `/q/infinity/exam-result` | `/q` ("지난 시험 결과" — Upcoming 섹션), `/q/infinity` (조건부 X — §2.5) | `/q/review`, `/q/infinity/solve`, `/q/infinity/explain/${sku}` | OK |
| `/q/infinity/history` | `/q/infinity` ("전체 이력" 1곳) | `/q/infinity/explain/${entry.sku}` | 🟢 진입 1곳만 (§3.2) |
| `/q/analysis` | (셸 nav, sub-page back) | `/q/analysis/process`, `/q/analysis/ability` (analysis-two-axis CTA), `/q/review`, `/q/review/memory/${id}` (today-review-preview) | 🚨 **`/q/analysis/diagnose` 진입 CTA 0** (§2.2) |
| **`/q/analysis/onboarding`** | **없음** | (back?) | 🚨 **dead** |
| `/q/analysis/ability` | `/q/analysis` (analysis-two-axis), `/q/review/conquer` (정복 후) | `/q/analysis/diagnose`, `/q/analysis` | OK — diagnose 진입 가능 |
| `/q/analysis/process` | `/q/analysis` (analysis-two-axis) | `/q/analysis` | 🟡 ability lateral 이동 없음 (§2.7) |
| `/q/analysis/diagnose` | `/q` (lastDiagnosis 조건부), `/q/analysis/ability` ("진단 다시 받기") | `/q/analysis/ability`, `/q/analysis` | 🚨 분석 홈에서 진입 불가 (§2.2) |
| `/q/analysis/[questionId]` | `/q/infinity/explain` (해설 → 학습 허브), `RecentMistakes` 등 components | `/q/review`, `/q/talk?context=`, components (next-learning-cards) | 🟢 진입 경로 부족 (§3.1) |
| `/q/review` | `/q` (queue), `/q/analysis/[questionId]`, `/q/infinity/exam-result`, `/q/analysis` (today-review-preview), `/q/review/conquer`, `/q/review/memory` | `/q/review/conquer`, `/q/infinity/solve?kind=retry`, `/q/review/memory/${id}` | 진입·이탈 풍부 ✓ |
| **`/q/review/onboarding`** | **없음** | (back?) | 🚨 **dead** |
| `/q/review/conquer` | `/q/review` ("정복 세트 풀기" CTA), `ConquestHero` | `/q/analysis/ability`, `/q/review` | 🟡 다음 정복 패턴 CTA 없음 (§2.8) |
| `/q/review/memory/[id]` | `/q/review`, `/q/analysis` (today-review-preview) | `/q/review` (3곳) | OK |
| `/q/talk` | CoachFab (전역 셸), `/q/analysis/[questionId]?context=` | **없음** | 🚨 **종료 후 다음 액션 0** (§2.3) |
| **`/q/talk/onboarding`** | **없음** | (back?) | 🚨 **dead** |
| `/q/external/studio` | `/q` (placeholder 카드) | `/q` | 🟡 외부 도메인 placeholder (§2.4) |
| `/q/external/store` | `/q` (placeholder 카드) | `/q` | 🟡 외부 도메인 placeholder (§2.4) |
| `/me` | BottomNav 5탭만 | (?) | 🟡 coming-soon placeholder (§2.9) |

---

## 2. 🚨 Critical + 🟡 Important

### 2.1 (🚨) Onboarding 5개 라우트 dead-end

**증상**: 5개 onboarding 라우트 모두 in-page 진입 CTA **0** — 사이드바 "소개하기" 항목 외에는 학생이 자연스럽게 도달할 동선 없음.

- `/q/onboarding` ([qSection L87](../../src/components/shell/nav-config.ts#L87))
- `/q/infinity/onboarding` ([infinitySection L53](../../src/components/shell/nav-config.ts#L53))
- `/q/analysis/onboarding` ([analysisSection L63](../../src/components/shell/nav-config.ts#L63))
- `/q/review/onboarding` ([reviewSection L71](../../src/components/shell/nav-config.ts#L71))
- `/q/talk/onboarding` ([talkSection L77](../../src/components/shell/nav-config.ts#L77))

**원칙 위반**: "라우트는 in-page CTA 없으면 존재할 수 없다." 사이드바만 진입점인 라우트는 학생이 의도적으로 메뉴를 뒤져야만 도달 → dead route.

**제안 (Phase 1, 단독 PR)**:
- (a) **즉시 제거**: 5개 라우트 페이지 + 5개 sidebar 항목 모두 삭제. 가장 깔끔.
- (b) 첫 진입 redirect: localStorage 미진입 학생에 한해 자동 redirect. 단, 학생이 다시 보고 싶을 때 진입 동선 필요 → in-page CTA 부활 필요. 복잡도 ↑.
- (c) holiday 시즌 sticky: 첫 진입 시 dismissible 배너로 "도움말 보기" 노출.

→ **PM 추천**: **(a) 즉시 제거**. 풀림 Q 단독 워크스페이스이고 6단계 학습 루프가 시그니처 — onboarding 콘텐츠는 spec/onboarding-rebuild 별도 plan 으로 분리하면 됨. 지금 상태로는 dead route 가 5개나 존재해 IA 일관성 깨짐.

### 2.2 (🚨) `/q/analysis` 홈 → `/q/analysis/diagnose` 진입 CTA 부재

**증상**: `/q/analysis/page.tsx` 의 5 컴포넌트 (DiagnosisHero / AnalysisTwoAxis / WrongReasonTop3 / RecentMistakes / TodayReviewPreview) 어디에도 진단 시작/다시 받기 CTA **없음**.

- 진단은 6단계 학습 루프의 **시작점** (spec §1 진단→처방→풀이→해설→정복→갱신)
- 분석 홈에서 진단으로 가는 동선이 없으면, 학생은 "지금 진단 다시 받고 싶다" 욕구를 사이드바 깊이 들어가 찾아야 함
- 현재 진입 가능 경로:
  - `/q` 홈의 "Upcoming" 섹션 (조건부 — `lastDiagnosis.daysAgo >= nextRecommendedIn` 일 때만)
  - `/q/analysis/ability` 의 "진단 다시 받기" 카드
- 정작 **분석 홈에서는 진단 진입 동선 없음** — 가장 자연스러운 위치인데 부재

**제안 (Phase 2, 단독 PR)**:
- DiagnosisHero 에 우상단 또는 하단에 "진단 다시 받기" 진입 슬롯 추가
- `/q/page.tsx` 의 조건부 카드 패턴(L406-429) 재사용 가능
- 조건부 노출: `lastDiagnosis.daysAgo >= lastDiagnosis.nextRecommendedIn` 일 때 "**지금 받기 권장**" 강조 / 미충족 시 "다시 받기" 잔잔한 톤
- 또는 별도 컴포넌트 `<DiagnosisCTA />` 신설해 DiagnosisHero 아래에 배치

### 2.3 (🚨) `/q/talk` 종료 후 다음 액션 CTA 부재

**증상**: AI 대화 페이지가 PageHeader + CoachHero + CoachChat + ActivityTimeline 4 컴포넌트로 끝. **대화 마치고 학생이 어디로 가야 할지 동선 없음**.

- 코치는 메타 학습 흐름을 봐주는 친구 — 대화 결과로 "이번 주 추천 액션" 같은 다음 단계가 나오는 게 자연
- 현재 outgoing CTA `<Link>` **0** (CoachChat / ActivityTimeline 내부 액션이 있을 수 있으나 main page 에서는 명시 X)

**제안**:
- ActivityTimeline 의 각 row 가 "이거 풀어볼래?" 같은 액션 CTA 가지도록 (`/q/infinity/solve?kind=...`, `/q/review/conquer?patternId=`)
- 또는 페이지 하단에 `<NextStepFromCoach />` 섹션 신설 — 코치 대화에서 추천된 다음 액션 1~3개 노출
- AI 대화 채널의 가치 = 학습 흐름 조정 → 그 조정 결과를 액션으로 닫아야 채널 의미 성립

### 2.4 (🟡) `/q/external/studio`, `/q/external/store` placeholder 존재

**증상**: 풀림 Q 단독 워크스페이스에 외부 도메인(스토어·스튜디오) 미존재. 두 라우트는 `<Link href="/q">` 만 가진 placeholder.

- `/q` 홈의 "풀림에서 더 가져오기" 섹션 (UX audit O1 — Open Question, G1 결정 대기)에서 두 placeholder 로 진입 가능
- 학생이 클릭하면 빈 페이지 → 다시 돌아오기만 가능 → UX 손상

**제안 (G1 결정 후)**:
- (a) 외부 URL 명시 연결 + chip "외부 도메인" 보강
- (b) **카드 자체 제거** — Q 단독 환경에서는 노이즈
- (c) "곧 출시" placeholder 로 명시
- → (b) 권장 (이미 UX audit O1 에서 G1 결정 대기 중)

### 2.5 (🟡) `/q/infinity` 홈의 `/q/infinity/exam-result` CTA 조건 미달

**증상**: 무한풀기 홈 L140 에 시험 결과 CTA. 시험 안 본 학생에게도 "시험 결과 보기" 가 보임 → 비논리적.

**제안**: `lastExamResult` 존재 여부로 조건부 렌더 + 시험 후 24h 이내만 강조. `/q` 홈의 "지난 시험 결과" 패턴(L361)과 일관성.

### 2.6 (🟡) `/q/infinity/explain` → retry CTA 누락

**증상**: 해설 인덱스에서 `/q/analysis/${sku}` (학습 허브) 진입은 있지만, "이 SKU 같은 패턴 다시 풀어보기" (retry) CTA 없음.

**제안**: 각 해설 카드에 retry CTA 추가 — `/q/infinity/solve?kind=retry&sku=${sku}`. 학생 흐름 = 해설 본 → 같은 패턴 풀어보고 싶음.

### 2.7 (🟡) `/q/analysis/process` ↔ `/q/analysis/ability` lateral 이동 부재

**증상**: 두 sub-route 가 분석 홈으로만 돌아감. 학생이 "능력치 보다가 메타인지 과정도 같이 보고 싶다" 흐름에서 분석 홈 거쳐서 가야 함.

**제안**: 각 sub-page 하단에 "다른 차원도 보기 →" lateral CTA 추가. `/q/analysis/ability` → `/q/analysis/process`, 역방향도.

### 2.8 (🟡) `/q/review/conquer` 종료 후 "다음 패턴 도전" CTA 부재

**증상**: 정복 완료 후 `/q/analysis/ability` 또는 `/q/review` 로만 이동. 학생이 한 패턴 정복하고 흐름 탔는데 "다음 패턴 도전하기" 같은 momentum 유지 CTA 없음.

**제안**: ConquestHero 의 정복 완료 분기 또는 별도 컴포넌트에서 `/q/review` 의 다른 ErrorPattern 카드로 진입 권유. patternId 다른 값으로 재진입.

### 2.9 (🟡) `/me` placeholder + BottomNav 5번째 슬롯

**증상**: 풀림 Q 단독 워크스페이스에 학생 내정보 콘텐츠 0 — `/me` 는 [src/components/study/coming-soon.tsx](../../src/components/study/coming-soon.tsx) placeholder. BottomNav 5탭 中 1탭 차지.

**제안**: CoachFab plan 안1 (BottomNav 5번째 슬롯을 "코치" 로 통합) 검토 시점에 자연 해소 가능. 현재로는 학생이 5탭 中 1탭이 빈 페이지 → 모바일 동선 비효율.

---

## 3. 🟢 Nit (정합성)

### 3.1 `/q/analysis/[questionId]` 진입 경로 부족

next-learning-cards · explain 외 진입 경로 부족. RecentMistakes 컴포넌트 클릭 동작 확인 필요 — 카드 클릭으로 진입하는지, 별도 CTA 없는지.

### 3.2 `/q/infinity/history` 진입 1곳뿐

`/q/infinity` 의 "전체 이력" 링크 1곳만. 학생이 다른 흐름에서 이력 보고 싶을 때 진입점 부족. 예: 정복 완료 후 "내가 푼 비슷한 문제 보기" 같은 lateral 이동.

### 3.3 `/q` 홈 첫 화면에 외부 도메인 카드 (§2.4 와 연결)

§2.4 의 placeholder 라우트가 학생 홈 첫 화면에서 노출됨. 풀림 Q 단독 환경에서는 노이즈.

---

## 4. 권장 진행 단계 (Phase 우선순위)

### Phase 1 — Dead route 정리 (즉시, 단독 PR)
- 5개 onboarding page.tsx + 5개 nav-config 항목 모두 제거
- 단일 PR `chore/q-remove-dead-onboarding-routes`
- 영향 범위: nav-config 5줄 삭제 + 5개 디렉토리 (page.tsx) 삭제
- 검증: `bun dev` 후 사이드바·BottomNav에 "소개하기" 미노출, 직접 URL 입력 시 404

### Phase 2 — `/q/analysis` 진단 CTA 추가 (단독 PR)
- DiagnosisHero 에 "진단 다시 받기" 슬롯 추가 또는 별도 컴포넌트
- 조건부 강조: `lastDiagnosis.daysAgo >= nextRecommendedIn` 일 때 강한 톤 / 미충족 시 잔잔
- 단일 PR `feat/q-analysis-diagnose-cta`

### Phase 3 — `/q/talk` 다음 액션 CTA (단독 PR, 설계 1턴 필요)
- ActivityTimeline row 별 액션 CTA 또는 별도 NextStepFromCoach 섹션
- 코치 대화 결과 → 다음 학습 액션 연결. mock 데이터 보강 필요할 수 있음
- 단일 PR `feat/q-talk-next-step-cta`

### Phase 4 — UX audit O1 결정 + external placeholder 처리 (G1 1턴 후)
- §2.4 결정: 제거 / 외부 URL / 곧 출시 中 택1
- G1 결정 후 단독 PR

### Phase 5 — 정합성 sweep (한 PR로 묶음)
- §2.5 infinity exam-result 조건부
- §2.6 explain → retry CTA
- §2.7 process ↔ ability lateral
- §2.8 review-conquer 다음 패턴 CTA
- §3.x nit 들
- 단일 PR `chore/q-flow-consistency-sweep`

### Phase 6 — `/me` 슬롯 결정 (CoachFab 안1 plan 검토 시점)
- BottomNav 5탭 IA 결정. 별도 plan `2026-MM-DD_q-mobile-ai-first-class-entry.md` (CoachFab 안1 후속) 검토 시 함께

---

## 5. 룰화 후보

**룰 D** — "라우트는 in-page CTA 없으면 존재할 수 없다"

**Why**: 5개 onboarding 라우트가 사이드바 항목만 가지고 in-page 진입점 없이 dead 상태로 1주 이상 존재. 라우트 추가 시 in-page CTA 동선이 함께 박혀야 진입 가능한 페이지로 성립.

**How to apply**:
- 라우트 신설 PR 시 `<Link href="/new-route">` 가 최소 1개 다른 페이지에 박혀 있는지 자가 점검
- 사이드바·BottomNav·AppHeader 같은 셸 nav 만으로는 진입점으로 인정 안 됨 (전역 fallback)
- 예외: 외부 deep link (`?context=`, `?from=`) 로만 진입하는 라우트는 신설 시 명시적으로 plan 에 기록

→ daily_outcome/CONVENTION.md §6.D 신설 후보.

---

## 6. 검증 방법

- `grep -rn 'href="/q/<route>"' src/` 로 in-page 진입 CTA 0개 확인
- `bun dev` 후 학생 흐름 시뮬레이션 — 사이드바 진입 금지, in-page CTA 만으로 모든 라우트 도달 가능한지
- e2e: 풀이 → 해설 → 정복 → 갱신 6단계 루프가 in-page CTA 만으로 닫히는지 자동 검증 (별도 e2e spec 후보)

---

## 7. 참고

- 셸 nav 진입: [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts)
- 6단계 루프 spec: [proc/spec/04-ux-flow.md](../../spec/04-ux-flow.md) §1
- 14 → 8 통합 IA: [proc/spec/03-features-and-ia.md](../../spec/03-features-and-ia.md) §1.2
- 이전 UX audit (시각/색 중심): [proc/research/2026-05-14_ux-audit/findings.md](../2026-05-14_ux-audit/findings.md)
- 본 audit 의 차이점: **플로우 중심** — 어떤 경로로 도달 가능한가, 어디로 닫히는가
