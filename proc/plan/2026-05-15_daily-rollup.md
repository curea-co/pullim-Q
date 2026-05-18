# 2026-05-15 일일 작업 roll-up

> **출처**: [daily_outcome/2026-05-15.md](../../daily_outcome/2026-05-15.md) 09:30 약속 6건
> **활성 게이트키퍼**: G1 / G3 / G4
> **carry-over 추적**: [2026-05-18_daily-rollup.md](2026-05-18_daily-rollup.md) — 5-15 미머지 항목(CoachFab 머지·C3 race·UX audit 잔여·룰화 3건)이 5-18 약속으로 이월됨.

## 목표

오전 — C2 hotfix 처리로 production 학생 가둠 버그 해소. 오후 — 잔여 5건 압축 처리. review-priority-queue 진입 실패 시 정량 사유로 차주 이월 박음.

## 작업 항목

### 1. C2 LeaveGuard 가둠 버그 hotfix (최우선)
- [ ] [src/components/shell/leave-guard.tsx](../../src/components/shell/leave-guard.tsx) L95-114 popstate 사이클 fix — `__back__` 분기 `setInProgress(false)` 선행 → 다음 frame `history.back()`, listener once + cleanup
- [ ] e2e `q-infinity-solve`에 "브라우저 back으로 이탈 가능" 시나리오 1건 추가
- [ ] base=dev hotfix PR 머지

### 2. C1 CoachFab 모바일 점유 plan 신설
- [ ] `proc/plan/2026-05-15_q-coach-fab-mobile-occlusion.md` 신설
- [ ] G4 선택지 안1(BottomNav 5번째 슬롯 "코치" 통합 + FAB `md:` 데스크탑 전용) / 안2(모바일 icon-only 44×44 축소) 명시
- [ ] G4 결정 시 머지 PR, 미결정 시 plan 본문에 "결정 대기" + 익일 이월

### 3. q-color-saturation-rebalance §5 회고 정정 + PR-C 단독 머지
- [ ] [proc/plan/2026-05-13_q-color-saturation-rebalance.md](2026-05-13_q-color-saturation-rebalance.md) §5에 실제 머지 PR #34/35/36/39 ↔ 계획 PR-A~E 대응표 추가
- [ ] PR-C 잔여·PR-E 범위 치환(시그니처 ring 데코 제거) 회고 단락 추가
- [ ] PR-C 단독 머지 PR (`from-warn-* → warn-bg` sweep, qa-design-capture 회귀 통과)

### 4. UX audit 산출 3 untracked 처리 + 어제 carry-over plan backfill
- [ ] `proc/research/2026-05-14_ux-audit/` · `_post-merge-visual/` · `scripts/qa-audit-2026-05-14.mjs` commit / .gitignore 결정 PR 1건 머지
- [ ] [proc/plan/2026-05-14_q-f2-mobile-card-density.md](2026-05-14_q-f2-mobile-card-density.md) 상단에 `> 같은 날 추가 산출: proc/research/2026-05-14_ux-audit/ — UX audit 자기검증` 1줄 backfill (어제 5-14 룰 첫 적용)

### 5. review-priority-queue 진입 (5-13 → 5-14 → 5-15, 두 번째 이월 위기)
- [ ] [proc/plan/2026-05-13_review-priority-queue-scalable-layout.md](2026-05-13_review-priority-queue-scalable-layout.md) §1~§3 정독
- [ ] 첫 단계(8개 하드 컷 제거 + 페이지네이션 기본 골격) PR 1건 머지
- [ ] 시간상 미진입 시 14:30 보고에 "차주 이월" + 정량 사유(시간 부족 X분 / 우선순위 항목 N개) 명시

### 6. 어제(5-14) 17:30 미작성 섹션 처리
- [ ] [daily_outcome/2026-05-14.md](../../daily_outcome/2026-05-14.md)에 `## 17:30 Daily Outcome 제출 — 2026-05-14\n\n(미작성)` append (CONVENTION §1 룰)

## AI 우선 위임

- [src/components/shell/leave-guard.tsx](../../src/components/shell/leave-guard.tsx) L95-114 정독 후 popstate 사이클 fix diff 초안 (의존성 배열 정리 + once listener + cleanup)
- q-color-saturation-rebalance §5 회고 정정 단락 초안 — git log + plan §5 cross-reference로 실제 머지 PR ↔ 계획 PR 매칭표 자동 산출
- 6개 라우트(`/q`, `/q/infinity`, `/q/analysis`, `/q/review`, `/q/analysis/diagnose`, `/q/onboarding`) 모바일 360 캡처 — CoachFab 점유 정량화(가린 픽셀 · CTA 가시성)

## 예상 블로커

- C2 hotfix + e2e 회귀 + 캡처 sanity로 오전 시간 대부분 소요 → 나머지 4건 오후 압축
- G4 응답 지연 시 C1 CoachFab plan 신설까지만 가능, 머지는 익일 이월
- 5번 미진입 시 차주 이월 강제 — 사유를 정량으로 박아야 패턴화된 회피로 안 보임
- C3 ConquerIntroDialog preventDefault race · Important 5건 · Nit 4건은 본 스코프 밖, 시간 남으면 추가 진입
