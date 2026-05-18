# 풀림 Q — UX audit Important 5 + Nit 4 sweep

> **출처**: [proc/research/2026-05-14_ux-audit/findings.md](../research/2026-05-14_ux-audit/findings.md) 잔여 Important 5 + Nit 4 (Critical 3건은 5-15·5-18 별도 처리)
> **게이트키퍼**: G4 (UI 톤·정보 hierarchy 변경) / G1 (O1 도메인 placeholder 결정)
> **연관 daily-rollup**: [2026-05-18_daily-rollup.md](2026-05-18_daily-rollup.md) §3

## 0. 진행 현황 (2026-05-18)

- [x] I1 — review-conquer "연속 정답 0회" 빨강 제거 ([src/app/(student)/q/review/conquer/page.tsx](../../src/app/\(student\)/q/review/conquer/page.tsx) `Stat` tone 분기 streak 기반)
- [ ] I2 / I3 / I4 / I5 — 아래 §1
- [ ] N1 / N2 / N3 / N4 — 아래 §2

## 1. Important (5건)

### I1 — review-conquer "연속 정답 0회" 빨강 → slate (✅ 2026-05-18, PR #48)

- **위치**: [src/app/(student)/q/review/conquer/page.tsx](../../src/app/\(student\)/q/review/conquer/page.tsx) `Stat` (L295-)
- **변경**: `tone="lemon"` 하드코딩 → `tone={streak >= 1 ? 'success' : undefined}` 분기. `Stat` 에 `tone='success'` (`bg-pullim-success-bg` pill + `text-pullim-success`) 추가
- **결과**: streak 0 → 중립 slate, ≥1 → success 톤 pill. 시작 시점 "실패" 오신호 제거
- **PR**: #48 (본 sweep plan 동봉)

### I2 — AnalysisTwoAxis 또래 마커 가시성

- **위치**: [src/components/analysis/analysis-two-axis.tsx](../../src/components/analysis/analysis-two-axis.tsx) L85-89
- **변경**: `w-0.5` (1px) → `w-1` (2px) + `outline-1 outline-white` 또는 `ring-1 ring-white` stroke 추가
- **즉시 가능** (1파일 ≤5줄)

### I3 — infinity-solve-picker "PRACTICE / EXAM" 영문 약어

- **위치**: [src/components/infinity/mode-toggle.tsx](../../src/components/infinity/mode-toggle.tsx)
- **변경**: 영문 약어 제거 또는 한글 부제로 대체 ("맞춤 문제 + AI 코치" / "랜덤 셔플 + 정답률" 같은 형태)
- **G4 카피 검토 필요** (학생 친화 가이드 §11.1)

### I4 — /q/analysis 모바일 hero viewport 절반 점유

- **위치**: [src/components/analysis/diagnosis-hero.tsx](../../src/components/analysis/diagnosis-hero.tsx) + analysis hero 호출부
- **변경**: 모바일 stat chip padding `p-2.5` → `p-2`, "데이터 소스 라인" 1줄 압축, 학습자 유형 + 4 chip 만 첫 viewport 안에 들어오도록
- **중간 규모** — 캡처 회귀 필요

### I5 — /q/review/memory 단일 학습 첫 화면 비어있음

- **위치**: [src/app/(student)/q/review/memory/](../../src/app/\(student\)/q/review/memory/) (별도 plan 후보)
- **변경**: 진행 표시("전체 N개 중 K번째") + 다음 카드 미리보기 1줄
- **별도 plan 권장** — sweep 범위 밖

## 2. Nit (4건)

### N1 — AI 코치 패널 헤더 "T3 · Deep" 영문 라벨 잔재 확인

- **위치**: [src/components/coach/](../../src/components/coach/) 패널 헤더
- **변경**: 영문 라벨 잔재 grep + 한글화
- **사전 조사 필요** — 실제 영문 라벨 존재 여부 확인 후 진입

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
- **카피 검토 PR**: I3 (G4 카피 합의 후)
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
