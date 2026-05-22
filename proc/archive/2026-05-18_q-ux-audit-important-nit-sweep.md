# 풀림 Q — UX audit Important 5 + Nit 4 sweep

> **출처**: [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) 잔여 Important 5 + Nit 4 (Critical 3건은 5-15·5-18 별도 처리)
> **게이트키퍼**: G4 (UI 톤·정보 hierarchy 변경) / G1 (O1 도메인 placeholder 결정)
> **연관 daily-rollup**: [2026-05-18_daily-rollup.md](2026-05-18_daily-rollup.md) §3

## 0. 진행 현황 (2026-05-18)

- [x] I1 — review-conquer "연속 정답 0회" 빨강 제거 ([src/app/(student)/q/review/conquer/page.tsx](../../src/app/\(student\)/q/review/conquer/page.tsx) `Stat` tone 분기 streak 기반)
- [x] I2 — AnalysisTwoAxis 또래 마커 `w-0.5`→`w-1` + slate-0 outline-1 + slate-500→slate-700 (2026-05-19)
- [x] I3 — mode-toggle `badge` "PRACTICE"/"EXAM" 영문 약어 필드 자체 제거 (G1 위임 → PM 결정)
- [x] N1 — `agent-card.tsx:81` `<span>Orchestrator</span>` 라벨 삭제 (G1 위임 → PM 결정)
- [x] N3 — review-conquer SKU 카드 흑색 배경 — 2026-05-20 검증 결과 흑색 배경 영역 부재 (5-19 design audit a11y AA sweep 흡수 추정). finding stale 처리
- [x] N4 — DiagnosisHero `StatChip.sub` `+/-` 시작 시 success/danger 색 자동 분기 (2026-05-20)
- [x] I4 — 2026-05-22 PR #83 머지 (모바일 hero viewport 압축: chip padding p-2.5→p-2, 데이터 소스 라인 압축, section p-6→p-5 sm:p-6)
- [x] I5 — 별도 plan 분리 ([2026-05-22_q-memory-single-screen-density.md](../plan/2026-05-22_q-memory-single-screen-density.md))
- [x] N2 — 2026-05-22 G1 8일차 룰 C 발동 잠정 락인 PR #84 머지 (`ddayToneClass` helper: D-3 danger / D-7 warn / 그 외 fallback)

## 1. Important (5건)

### I1 — review-conquer "연속 정답 0회" 빨강 → slate (✅ 2026-05-18, PR #48)

- **위치**: [src/app/(student)/q/review/conquer/page.tsx](../../src/app/\(student\)/q/review/conquer/page.tsx) `Stat` (L295-)
- **변경**: `tone="lemon"` 하드코딩 → `tone={streak >= 1 ? 'success' : undefined}` 분기. `Stat` 에 `tone='success'` (`bg-pullim-success-bg` pill + `text-pullim-success`) 추가
- **결과**: streak 0 → 중립 slate, ≥1 → success 톤 pill. 시작 시점 "실패" 오신호 제거
- **PR**: #48 (본 sweep plan 동봉)

### I2 — AnalysisTwoAxis 또래 마커 가시성 (✅ 2026-05-19)

- **위치**: [src/components/analysis/analysis-two-axis.tsx](../../src/components/analysis/analysis-two-axis.tsx) L85-90
- **변경**: `w-0.5` (1px) → `w-1` (2px), `bg-pullim-slate-500` → `bg-pullim-slate-700` (콘트라스트), `outline-1 outline-pullim-slate-0` (흰색 stroke 1px) 추가
- **PR**: 별도 sweep (design audit PR-1~5 미흡수, daily 2026-05-19 carry-over)

### I3 — infinity-solve-picker "PRACTICE / EXAM" 영문 약어 (✅ 2026-05-18)

- **위치**: [src/lib/mock/infinity.ts](../../src/lib/mock/infinity.ts) `solveModeMeta.badge` + [src/components/infinity/mode-toggle.tsx](../../src/components/infinity/mode-toggle.tsx) L71-75
- **변경**: `badge` 필드 자체 제거 — `label`(연습/시험 모드) + `description`(상세 한글) + 배경 색상으로 이미 3겹 신호, badge 는 redundant. 활성 모드 시 mock-data pill 렌더 제거
- **결정**: G1 위임 → PM (a) badge 자체 제거 채택. 학생 친화 가이드 §11.1 부합

### I4 — /q/analysis 모바일 hero viewport 절반 점유

- **위치**: [src/components/analysis/diagnosis-hero.tsx](../../src/components/analysis/diagnosis-hero.tsx) + analysis hero 호출부
- **변경**: 모바일 stat chip padding `p-2.5` → `p-2`, "데이터 소스 라인" 1줄 압축, 학습자 유형 + 4 chip 만 첫 viewport 안에 들어오도록
- **중간 규모** — 캡처 회귀 필요

### I5 — /q/review/memory 단일 학습 첫 화면 비어있음

- **위치**: [src/app/(student)/q/review/memory/](../../src/app/\(student\)/q/review/memory/) (별도 plan 후보)
- **변경**: 진행 표시("전체 N개 중 K번째") + 다음 카드 미리보기 1줄
- **별도 plan 권장** — sweep 범위 밖

## 2. Nit (4건)

### N1 — AI 코치 패널 헤더 영문 라벨 잔재 확인 (✅ 2026-05-18)

- **사전 조사 결과** (2026-05-18 grep `coach/` · `conqueror/` · `infinity/` · `app/(student)/q/talk/`): 사용자 노출 영문 라벨 **1건**만 발견
  - [src/components/coach/agent-card.tsx:81](../../src/components/coach/agent-card.tsx#L81) — `<span>Orchestrator</span>` (`isOrchestrator` 분기 tier 뱃지)
  - 다른 영문 잔재 없음: `coach-pane.tsx` "풀림 튜터" + "빠른 응답" / `coach-hero.tsx` / `coach-chat.tsx` / `activity-timeline.tsx` 모두 한글 OK
  - audit 가 짚은 "T3 · Deep" 은 코드에서 확인 안 됨 — `aiTierMeta.T2.bg` 같은 데이터 키 참조뿐, 노출 라벨 X
- **변경**: G1 위임 → PM (c) 라벨 삭제 채택. 사유: 카드 자체가 `isOrchestrator ? 'text-white'` + accent 배경으로 이미 orchestrator 신호 운반 → 10px 영문 라벨은 정보 0, 노이즈만
- **결과**: `agent-card.tsx:80-82` `isOrchestrator && (<span>Orchestrator</span>)` 블록 제거

### N2 — q-home "D-21" blue-700 텍스트 색 → 시급도 분기

- **위치**: q-home 환경 텍스트 D-day 렌더링부
- **변경**: D-7 이내 warn, D-3 이내 danger 동적 분기
- **로직 결정 1턴 필요** (분기 기준 임계값)

### N3 — review-conquer SKU 카드 헤더 시각 무게

- **위치**: [src/app/(student)/q/review/conquer/page.tsx](../../src/app/\(student\)/q/review/conquer/page.tsx) — `Q-MATH-CALC-0042` 흑색 배경 영역
- **변경**: `bg-pullim-slate-900 text-white` → `bg-slate-100 text-slate-700` 톤다운
- **즉시 가능** (1파일 ≤3줄)

### N4 — DiagnosisHero 메타 점수 trend 색 신호

- **위치**: [src/components/analysis/diagnosis-hero.tsx:41](../../src/components/analysis/diagnosis-hero.tsx#L41)
- **변경**: `sub={overallMeta.trend}` 가 `+` 시작 시 `text-pullim-success`, `-` 시작 시 `text-pullim-danger` 분기
- **즉시 가능** (1파일 ≤5줄)

## 3. 진행 전략

- **단발 PR 묶음**: I2 + N3 + N4 한 PR (즉시 가능 3건, 1파일 ≤5줄씩 — `chore/q-ux-audit-quick-polish`)
- **카피 검토 PR**: ✅ 완료 — I3 + N1 G1 카피 sweep 한 PR 머지 (G1 위임 → PM 채택)
- **중간 규모 PR**: I4 (캡처 회귀 동반)
- **별도 plan**: I5 — `2026-05-DD_q-memory-single-screen-density.md` 신설
- **사전 조사**: N1 — 영문 라벨 grep 후 별도 PR 또는 본 sweep 동봉
- **로직 결정**: N2 — D-day 임계값 G1 합의 후

## 4. AI 우선 위임

- N1 영문 라벨 grep: `coach/` · `conqueror/` · `infinity/` 디렉토리에서 영문 단어 노출 라벨 추출
- I2 / N3 / N4 한 PR 코드 diff 초안 (3개 파일, 합산 ≤15줄)
- I4 모바일 캡처 회귀: `scripts/qa-audit-2026-05-14.mjs` mobile 360 viewport 만 분석 페이지에 대해 재실행

## 5. 결정 로그

- 2026-05-18 — sweep plan 신설. I1 본 PR 동봉 머지. 잔여 8건은 §3 진행 전략대로 분할.
- 2026-05-18 (오후) — N1 사전 조사 완료. `agent-card.tsx:81` `Orchestrator` 1건 hit. I3 와 묶어 "G1 카피 sweep" 1 PR 로 처리 권장.
- 2026-05-18 (오후, G1 위임) — N1 + I3 PM 채택: 둘 다 영문 라벨/badge 단순 삭제. 사유: 시각 처리·라벨·description 이 이미 신호 운반, 영문은 redundant.
- 2026-05-19 — I2 별도 sweep 머지(PR #73). design audit PR-1~5 미흡수 확인 후 진행.
- 2026-05-20 — N3 finding 검증: review-conquer/conqueror 영역에 `bg-pullim-slate-900` 흑색 배경 영역 0건. SKU 표시는 `text-pullim-slate-400 font-mono` 톤 통일 상태. **N3 stale 처리** — 5-19 design audit a11y AA sweep(PR-2/5)에 흡수 추정.
- 2026-05-20 — N4 PM 자율 처리. `StatChip.sub` 자체에 `+` → `text-pullim-success font-bold`, `-` → `text-pullim-danger font-bold` 3-way 분기. 다른 sub("1등급", "이번 주" 등)은 기본 slate-500 유지. trend 외 sub에 +/- 시작값이 들어올 가능성 낮아 안전.
- 2026-05-20 — N2 G1 D-day 임계값 합의 6일차 미도착 → 룰 C 발동 후보 등록. 다음 진입 시 잠정 락인(D-7 warn / D-3 danger)으로 첫 단계 머지.
- 2026-05-22 — I5 분리 plan 신설 ([2026-05-22_q-memory-single-screen-density.md](../plan/2026-05-22_q-memory-single-screen-density.md)). sweep §0 I5 이 plan 으로 위임 마감.
- 2026-05-22 — I4 PR #83 머지. 모바일 hero viewport 압축: chip padding `p-2.5`→`p-2` (모바일), 데이터 소스 라인 mt/text/leading 축소 + "지난 7일 풀이 데이터" → "7일 데이터" 압축, section padding `p-6`→`p-5 sm:p-6`, h1 mt-2→mt-1.5, chip ul mt-4→mt-3 sm:mt-4. sm: 부터 기존 톤 복원으로 데스크탑 regression 없음.
- 2026-05-22 — N2 G1 8일차 룰 C 발동 잠정 락인 PR #84 머지. `ddayToneClass(dday)` helper 신설 (D-3 이내 danger / D-7 이내 warn / 그 외 undefined fallback). `DDayHero` strong 과 `UpcomingSection` 카드 헤더 2곳 적용. mock persona D-13 → 평시 톤 유지(blue-700/slate-600). G1 회신 도착 시 임계값 재조정 가능.
