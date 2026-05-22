# 2026-05-18 일일 작업 roll-up

> **출처**: [daily_outcome/2026-05-18.md](../../daily_outcome/2026-05-18.md) 09:30 약속 6건 (룰화 3건 묶음 포함)
> **활성 게이트키퍼**: G1 / G3 / G4
> **선행 carry-over plan**: [2026-05-15_q-coach-fab-mobile-occlusion.md](2026-05-15_q-coach-fab-mobile-occlusion.md) · [2026-05-13_review-priority-queue-scalable-layout.md](2026-05-13_review-priority-queue-scalable-layout.md) · [2026-05-15_daily-rollup.md](../archive/2026-05-15_daily-rollup.md)

## 목표

오전 — CoachFab 자료 산출 + C3 race fix 즉시 머지로 G4·G3 단답 대기를 unblock. 오후 — UX audit 잔여 sweep plan 신설 + 즉시 가능 1건 머지, 단답 도착 순서로 e2e·머지 단계 압축. EOD에 룰화 3건 위치 결정.

## 작업 항목

### 1. CoachFab plan §4.1 자료 산출 (1순위, G4 결정 전 차단 해제)
- [x] [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) 동작 확인 후 `scripts/qa-coach-fab-occlusion-2026-05-18.mjs` 신설해 6 라우트(`/q`, `/q/infinity`, `/q/analysis`, `/q/review`, `/q/analysis/diagnose`, `/q/onboarding`) 모바일 360 캡처 — **FAB 있을 때 / 없을 때 / 44×44 축소 시** 3종 변형 (DOM 변형으로 코드 수정 없이)
- [x] [proc/research/2026-05-18_coach-fab-occlusion/captures/](../research/2026-05-18_coach-fab-occlusion/captures/) 18장 + [measurements.md](../research/2026-05-18_coach-fab-occlusion/measurements.md) — 그대로 6238px²(2.34%) / 44×44 2288px²(0.86%) / 제거 0px²
- [x] [proc/plan/2026-05-15_q-coach-fab-mobile-occlusion.md](../archive/2026-05-15_q-coach-fab-mobile-occlusion.md) §3 캡처 경로(`2026-05-15_coach-fab-occlusion` → `2026-05-18_coach-fab-occlusion`) 정정 + §4.1 자료 산출 [x] 마감 + §5 결정 로그 backfill
- [ ] G4에 자료 + 안1/안2 트레이드오프 제출 → 결정 시 머지 PR, 미응답 시 자료 제출까지로 완료선 박음 (PM 송부 대기)

### 2. C3 ConquerIntroDialog preventDefault race fix (단독 PR 머지)
- [x] [src/components/conqueror/conquer-intro-dialog.tsx](../../src/components/conqueror/conquer-intro-dialog.tsx) `DialogTrigger` → `<button type="button" onClick>` 교체, `setOpen(true)` 명시 분기
- [x] [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) C3 항목 ✅ 해결 backfill (PR #47)
- [x] base=dev PR #47 머지

### 3. UX audit 잔여 Important 5 + Nit 4 sweep plan 신설 + 즉시 가능 1건 머지
- [x] [proc/plan/2026-05-18_q-ux-audit-important-nit-sweep.md](../archive/2026-05-18_q-ux-audit-important-nit-sweep.md) 신설 — Important 5 + Nit 4 각 항목 대응 src/ 경로 + 변경 범위 + §3 진행 전략
- [x] AI 위임: findings.md Important 5 + Nit 4 추출 → 즉시 가능 항목(I1·I2·N3·N4) 분류 (sweep plan §1·§2 에 반영)
- [x] 즉시 가능 I1 머지 — review-conquer "연속 정답 0회" 빨강 → streak 분기(0=slate, ≥1=success pill). sweep plan [x] 마감
- [x] 본 daily-rollup의 1·2·5번 plan들에 cross-reference 1줄 backfill — CoachFab plan(§1) / review-priority plan(§5) / 5-15 daily-rollup / findings.md(sweep plan 링크) 4곳
- [x] EOD `/review` 결과 → [2026-05-18_q-review-followup.md](../archive/2026-05-18_q-review-followup.md) 신설 (Critical 5 + Important 4 일괄 처리, dev 누적 14 PR retrospective)

### 4. C2 hotfix e2e 시험 모드 시나리오 추가 (G3 단답 후 → 2026-05-20 룰 C 발동 머지)
- [x] G3에 "C2 hotfix e2e에 시험 모드(`mode=exam`) 회귀 시나리오 필요한지" 단답 요청 (5-15 carry-over) — 6일차 미도착, 룰 C 발동 사유 충족
- [x] [e2e/q-infinity-solve-mode-exam.spec.ts](../../e2e/q-infinity-solve-mode-exam.spec.ts) 신규 spec — `mode=exam` 분기 시나리오 1건: 시험 모드 토글 → ExamConfirmDialog → 시험 카드 선택 → 시작 → 시험 UI + 잠금 표시
- [x] 셀렉터 안정성 보강 — [src/components/infinity/exam-confirm-dialog.tsx](../../src/components/infinity/exam-confirm-dialog.tsx) ExamRow 에 `data-exam-card={exam.id}` attribute 추가 (5-20 자율 처리). spec 의 `[data-exam-card]` 단일 셀렉터로 fallback 제거.
- [x] base=dev PR #74 머지 (룰 C 발동: G3 6일차 미도착, G1 PR #75 / G4 PR #77 과 동일 패턴)
- [x] 분기 규모 — 1건 시나리오만으로 머지(LeaveGuard popstate / 시험 시간 만료 / 제출 사이클은 G3 회신 도착 시 추가 결정)

### 5. review-priority 다음 단계 — 페이지네이션 본격 · 필터 · 정렬 (G1 합의 후)
- [ ] G1에 "review-priority 다음 단계(페이지네이션 본격·필터·정렬) 진입 합의 1턴" 요청 (5-15 carry-over)
- [ ] G1 합의 시: [proc/plan/2026-05-13_review-priority-queue-scalable-layout.md](2026-05-13_review-priority-queue-scalable-layout.md) 다음 단계 진입 — 페이지네이션 본격(N=10,000+ 가정, MEMORY 룰 적용) + 필터·정렬 first cut PR 머지
- [ ] G1 미응답 시: plan 본문에 "G1 합의 대기" 명시 + 익일 이월, 14:30 보고에 차단 사유 박음

### 6. 룰화 결정 3건 (EOD까지 위치 결정)
- [x] **룰 A**: "plan 회고 정정은 별도 chore PR로 분리" → `daily_outcome/CONVENTION.md` §6.A 신설
- [x] **룰 B**: daily-rollup.md "EOD 체크리스트 마감 의무화" → `daily_outcome/CONVENTION.md` §6.B 신설 + §4.3 자가 점검 체크리스트 항목 추가
- [x] **룰 C**: "두 번째 이월 plan은 첫 단계만이라도 머지" → `daily_outcome/CONVENTION.md` §6.C 신설
- [x] 신설: CONVENTION.md §6 단일 위치로 통합. MEMORY 인덱스 갱신 불필요(프로젝트 워크플로우 룰은 CONVENTION 전속)
- [x] [daily_outcome/2026-05-15.md](../../daily_outcome/2026-05-15.md) §4 배운 점에 룰 A/B/C 결정 결과 1줄 backfill

### 7. BE 셋업 (09:30 외 신규, 오후 추가 요청 — Ph1/Ph2 PR 분리)
- [x] cross-ref backfill — 신규 plan: BE 인프라(Drizzle + Docker Postgres + mock seed). 입력 문서: [input/2026-05-18_be-setup-handoff.md](../../input/2026-05-18_be-setup-handoff.md) (sister project pullim-planner 패턴 차용). spec: [proc/spec/2026-05-18_q-be-api-design.md](../spec/2026-05-18_q-be-api-design.md) · 가이드: [proc/research/2026-05-18_q-be-setup-guide.md](../research/2026-05-18_q-be-setup-guide.md)
- [ ] Ph1 PR (`feat/q-be-ph1-schema-docker`) base=dev — 10 테이블 스키마 + Docker 5433 + drizzle.config + setup guide + api spec
- [ ] Ph2 PR (`feat/q-be-ph2-seed`) base=dev — `scripts/seed.ts` (10테이블 idempotent) + output handoff

## AI 우선 위임

- `scripts/qa-audit-2026-05-14.mjs` 재사용해 6 라우트 모바일 360 캡처 자동화 (FAB 3종 변형) + 가린 픽셀 측정값 산출
- [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) Important 5 + Nit 4 추출 → 변경 범위·즉시 가능 여부 분류 표
- 룰화 후보 3건 박을 위치 비교 — MEMORY feedback / CONVENTION / 일과성 closed 각각의 영향 범위·재발 비용 표

## 예상 블로커

- **G4/G3/G1 단답 주말 lag 누적** — 오전 도착 안 하면 1번(머지 단계)·4번(e2e)·5번(다음 단계 진입) 모두 차단, 자료·plan까지만 진행
- **게이트키퍼 의존 3건 동시 압축** — 단답 도착 시 14:30~17:30 1.5h × 3건 압축 진행 필요. 한 건이라도 14:30 이후 도착하면 익일 이월 발생
- **룰화 3건 오전 일부 소요** — 본문·MEMORY 갱신 시간으로 오전 시간 차감, 1번 자료 산출과 시간 경합
- **C3 race fix는 단답 의존 없음** — G4/G3/G1 lag 시 본 항목 + 1번 자료 + 3번 plan 신설로 오전을 메우는 백업 라인
