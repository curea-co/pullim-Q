# 2026-05-22 일일 작업 roll-up

> **출처**: [daily_outcome/2026-05-22.md](../../daily_outcome/2026-05-22.md) 09:30 약속 6건 (5-21 전량 미진입 carry-over)
> **활성 게이트키퍼**: G1 / G3 / G4
> **선행 carry-over plan**: [2026-05-18_q-ux-audit-important-nit-sweep.md](../archive/2026-05-18_q-ux-audit-important-nit-sweep.md) · [2026-05-20_mobile-ai-1st-class-entry.md](../archive/2026-05-20_mobile-ai-1st-class-entry.md)

## 목표

5-21 6건 전량 미진입 → 오늘 6건 동시 압축. **룰 C 발동 PR 2건(N2·mobile-ai-1st-class) 선행** 으로 G1·G4 단답 의존 차단 해제, **I4·codex-review.yml** 오전 병행, **I5 plan·단답 채널 점검**은 오후 마감. CONVENTION §6.E `.github/workflows/` 적용 여부 결정도 codex-review.yml 처리와 함께 EOD까지.

## 작업 항목

### 1. codex-review.yml M 상태 처리 + §6.E 적용 범위 명시
- [x] [.github/workflows/codex-review.yml](../../.github/workflows/codex-review.yml) M 상태 해소 — Codex 3차 리뷰 반영 보안 개선 commit 채택
- [x] PR #82 머지 (base=dev) — `chore/q-codex-review-yml-3rd-pass`
- [x] [daily_outcome/CONVENTION.md](../../daily_outcome/CONVENTION.md) §6.E How to apply 목록에 `.github/workflows/` 추가 (로컬 only, daily_outcome 디렉토리는 gitignore)

### 2. UX audit I4 — /q/analysis 모바일 hero viewport 압축
- [x] [src/components/analysis/diagnosis-hero.tsx](../../src/components/analysis/diagnosis-hero.tsx) chip padding `p-2.5`→`p-2` (모바일) + 데이터 소스 라인 압축 + section/h1/ul 모바일 spacing 축소
- [x] PR #83 머지 (base=dev) — `feat/q-ux-audit-i4-analysis-hero-mobile`
- [x] 모바일 360 캡처 회귀 — 2026-05-26 17:30 회귀 캡처 완료 ([proc/research/2026-05-26_carry-over-regression/A_q-analysis_mobile360.png](../research/2026-05-26_carry-over-regression/A_q-analysis_mobile360.png)). `/q/analysis/Q-MATH-CALC-0042` 360×800 viewport에서 chip `p-2` padding · "내 답/정답" 분리 · "개념 혼동/유형 전략 모름" chip · 데이터 소스 라인 압축 모두 정상 렌더 확인 (이월 4일차 마감)
- [x] sweep plan [2026-05-18_q-ux-audit-important-nit-sweep.md](../archive/2026-05-18_q-ux-audit-important-nit-sweep.md) §0 I4 [x] 마감 + §5 결정 로그 backfill (본 chore PR 동봉)

### 3. UX audit N2 — G1 8일차 룰 C 발동, D-day 임계값 잠정 락인
- [x] [src/app/(student)/q/page.tsx](../../src/app/\(student\)/q/page.tsx) `ddayToneClass(dday)` helper 신설 + `DDayHero` / `UpcomingSection` 두 곳 적용 (D-3 danger / D-7 warn / 그 외 fallback)
- [x] PR #84 머지 (base=dev) — `feat/q-ux-audit-n2-dday-rule-c-lockin`. "G1 8일차 룰 C 발동, D-7 warn / D-3 danger" 본문 명시
- [x] sweep plan §0 N2 [x] 마감 + §5 결정 로그 backfill (본 chore PR 동봉)
- [x] mock persona D-9/D-13 **평시 톤 부분 회귀** (N2 임계값 분기 검증은 별도 follow-up) — 2026-05-26 17:30 회귀 캡처 완료. 검증 범위: D-13(시뮬)·D-9(실측) 모두 dark blue footer 안 `text-pullim-lemon` flat 톤으로 렌더, warn/danger 미발동(평시 톤) 회귀 확인. **검증 범위 밖**: PR #96 `/q` 홈 재설계에서 N2 `ddayToneClass(dday)` 헬퍼 자체가 제거됨 → D-7 warn / D-3 danger 임계값 분기 동작은 본 항목 [x] 마감 범위에 포함되지 않으며, 본 항목의 [x] 는 "평시 톤 영역(warn/danger 미발동) 회귀" 한정 기준으로만 마감. **N2 임계값 분기 follow-up은 별도 후속 항목 [ ] 으로 분리** (아래 신규 [ ] 항목 참고). 캡처 산출물 4종:
  - D-9 실측 데스크탑 1280×2400 fullPage — [proc/research/2026-05-26_carry-over-regression/B_q-home_dday-fallback.png](../research/2026-05-26_carry-over-regression/B_q-home_dday-fallback.png) (today=2026-05-26, `examDate=2026-06-04`)
  - D-9 실측 모바일 360×800 — [proc/research/2026-05-26_carry-over-regression/B_q-home_mobile360.png](../research/2026-05-26_carry-over-regression/B_q-home_mobile360.png)
  - **D-13 시뮬 데스크탑 1280×2400 fullPage** — [proc/research/2026-05-26_carry-over-regression/B_q-home_D13-sim_desktop.png](../research/2026-05-26_carry-over-regression/B_q-home_D13-sim_desktop.png) (`examDate=2026-06-08` 임시 변경 → 캡처 후 즉시 원복, dark footer에 "D-13" 라임 톤 표시 확인)
  - **D-13 시뮬 모바일 360×800** — [proc/research/2026-05-26_carry-over-regression/B_q-home_D13-sim_mobile360.png](../research/2026-05-26_carry-over-regression/B_q-home_D13-sim_mobile360.png)
  - (이월 4일차 마감, 회귀 범위는 "평시 톤 발동 없음" 으로 한정 / N2 헬퍼 PR #96 제거 follow-up 분리)
- [ ] **N2 임계값 분기 follow-up** — PR #96 `/q` 홈 재설계에서 `ddayToneClass(dday)` 제거됨 → D-7 warn / D-3 danger 분기를 dark footer D-day 영역에 재적용할지(혹은 헬퍼 제거를 의도된 단순화로 확정할지) 결정 + 결정 시 [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) N2 항목에 결정 로그 박기. 본 항목은 본 daily-rollup archive PR 범위 밖이며, **archive 이관 후에도 N2 락인 전체 회귀가 아직 미완임을 후속 독자에게 명시하기 위해 분리 등록** (Codex 리뷰 4차 권고 반영).

### 4. mobile-ai-1st-class — G4 8일차 룰 C 발동, 1단계 stub 머지
- [x] [src/components/shell/nav-config.ts](../../src/components/shell/nav-config.ts) `studentBottomTabs` 5번째 슬롯 추가 (`/q/talk` · `풀림 AI` · `Sparkles` · `matchPrefix: ['/q/talk']`)
- [x] [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) `GRID_COLS_BY_LENGTH` lookup 5탭 대응 확인 — 추가 변경 불필요
- [x] [src/components/shell/coach-fab.tsx](../../src/components/shell/coach-fab.tsx) `hidden md:flex` 적용 (모바일 비노출, 데스크탑 라벨 pill 유지)
- [x] PR #85 머지 (base=dev) — `feat/q-mobile-ai-1st-class-stage-1`. "G4 8일차 룰 C 발동, 1단계 stub 머지" 본문 명시
- [x] plan [2026-05-20_mobile-ai-1st-class-entry.md](../archive/2026-05-20_mobile-ai-1st-class-entry.md) §0.1 + §0.2 backfill (본 chore PR 동봉)

### 5. 단답 채널 자체 점검 — G1/G3/G4 9일차
- [x] PM 직접 확인 — 2026-05-26 단답 채널 일괄 회신 도착 (14일차에서 해소). G1/G3/G4 6항 일괄 답변 수신: G1 페이지네이션 디폴트=20 / F-2 a안 유지, G3 페이지네이션 API 시그니처 합의 Y / C2 e2e 시험모드 회귀 시나리오 추가 N, G4 F-2 a안 동의 / I5 1단계 룰 C 발동 retroactive Y
- [x] 17:30 §3 또는 §4에 결과 한 줄 박음 — 2026-05-26 daily_outcome 17:30 보고 §4 (배운 점) 에 "단답 채널 회신 = G1·G3·G4 6항 일괄 답변 도착 (14일차 해소). 룰 C 잠정 락인 2건(review-priority §0.1·I5 §0) 정식 승인 승급, F-2 plan a안 결정으로 닫음" 박기 예정 — [chore/q-2026-05-26-gate-decisions-backfill] PR로 review-priority/F-2/I5 plan + findings.md 일괄 backfill 처리

### 6. I5 plan 신설 — /q/review/memory 단일 학습 화면 밀도
- [x] [proc/plan/2026-05-22_q-memory-single-screen-density.md](../plan/2026-05-22_q-memory-single-screen-density.md) 신설 — 현황·방향·단계·AI 위임·위험·결정 로그 풀세트
- [x] sweep plan §0 I5 항목을 별도 plan 링크로 마감 표시 (commit a7ab2d0)

## AI 우선 위임

- I4 padding `p-2.5` → `p-2` + 데이터 소스 라인 압축 diff 초안 (1파일 ≤8줄)
- N2 `ddayTone(dday)` helper 초안 + DDayHero / UpcomingSection 두 곳에 적용 diff (1파일 ≤15줄)
- mobile-ai-1st-class 1단계 diff — nav-config 5번째 슬롯 + coach-fab `hidden md:flex` (2~3 파일 ≤8줄)
- I5 plan 초안 — sweep plan §1 I5 분리 발췌 + 현황·방향·단계·위험 양식 채우기

## 예상 블로커

- 6건 압축 — N2·mobile-ai-1st-class 룰 C 발동 PR 머지 순서 결정 필요. 두 건 모두 단답 채널 의존 X (잠정 락인 진입 사유 충족 = §6.C·§6.E 룰 C 패턴) → 오전 병행 가능
- codex-review.yml — diff 내용은 보안 강화로 discard 손실 큼 → commit + §6.E 정정 동봉 권장. 단 `.github/workflows/` 가 §6.E 명시 목록에 미포함이라 §6.E How to apply 정정 1줄 동봉
- 단답 채널 점검 — 9일차 미수행 누적. PM 자체 액션 미실행 시 게이트 의존 결정 이월 계속 누적 위험
- 1번 codex-review.yml + 4번 mobile-ai-1st-class 둘 다 셸/인프라 영역 PR — 머지 순서·conflict 점검 필요
