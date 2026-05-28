# /q/analysis 진입 비주얼 리디자인

> **대응 src/ 파일** (2026-05-14 기준): 현재 working tree 변경 0개. "새/변경 파일" 절 참고 — `src/components/analysis/diagnosis-hero.tsx`·`analysis-two-axis.tsx` 신규 + `q/analysis/page.tsx`·`wrong-reason-top3.tsx`·`recent-mistakes.tsx` 수정 예정. 단, `q/analysis/page.tsx`·`q/analysis/diagnose/page.tsx` 는 현재 spacing plan에서 `space-y-section` 적용 중 → spacing plan 머지 후 본 plan 진입(파일 충돌 방지).
>
> **게이트키퍼**: G1 (학습자 유형 라벨 + 두 축 시각화 정성 판단) + G4 (FE 구현·반응형 회귀).

## 목표
`/q/analysis` 첫 화면에서 **무엇을 분석했는지(데이터 소스)** 와 **분석의 두 축(어떻게 푸나 / 무엇이 강한가)** 이 5초 안에 들어오도록, 시각화 중심으로 진입 페이지를 재구성한다. 차트는 CSS 가로 막대로 구현하고 별도 라이브러리는 도입하지 않는다. 하위 페이지(`/process`, `/ability`)는 이번 작업 범위 밖이며 CTA만 그대로 연결한다.

## 배경 (현재 문제)
[/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) 현재 구조:

1. `PageHeader` — eyebrow "풀림 분석" + title "내 실력, 두 각도로 보기" + description 한 줄
2. `<WrongReasonTop3 />` — 미니 카드 3개
3. "내 실력 한눈에" section — 풀이 습관 카드 + 단원별 능력치 카드 (텍스트 위주)
4. `<RecentMistakes />` — 다시 봐야 할 문제 4개
5. `<TodayReviewPreview />` — 복습 미리보기 3개

문제:
- "두 각도"가 무엇인지 카피로만 암시 — 시각적으로 안 드러남
- 분석 대상(어떤 데이터를 본 결과인가)이 description 한 줄에 매몰: `마지막 진단 N일 전 · 단원별 실력 + 풀이 습관 종합`
- 풍부한 mock 데이터(`overallMeta.score=67`, `myAbility` 3과목 θ, `metaDimensions` 4차원 vs 또래, `metaCognitionReport.learnerType="정독·신중형 학습자"`)가 작은 글씨로 분산
- 네 섹션이 비슷한 톤·크기의 텍스트 카드 그리드 — 시각 hierarchy 약함, "분석 페이지"라는 인상 약함

## 설계 방침

### 1. "분석 대상" 명시 — Diagnosis Hero
`PageHeader`를 신규 `<DiagnosisHero />`로 교체.

- **학습자 유형 라벨** (`metaCognitionReport.learnerType` = "정독·신중형 학습자") 을 H1급으로 — 분석 결과의 인격화된 한 줄
- **데이터 소스 라인**: "최근 22문항 · 18분 풀이 · 2일 전 진단 + 지난 7일 풀이 데이터" (lastDiagnosis 활용)
- **Stat chip 4개** (가로 strip, 모바일은 2×2):
  - `메타 점수` — `overallMeta.score` (67) · `trend` (+4)
  - `강한 과목` — `myAbility[0]` (과학 +0.65 / 2등급)
  - `살펴볼 차원` — `metaDimensions` warn (인지부하 42 vs 또래 55)
  - `다시 볼 문제` — `wrongAttemptDiagnoses.length` (4문제)
- 좌측에 `ScanSearch` 아이콘 + 작은 eyebrow "풀림 분석"

### 2. "두 축" 시각화 — Two-Axis Visualization
기존 "내 실력 한눈에" 두 카드 그리드를 신규 `<AnalysisTwoAxis />`로 교체. `lg` 이상 1:1 가로 그리드, 그 이하는 세로 stack.

**좌측 카드 — "어떻게 푸나" (메타인지 4차원)**
- 4개 차원 가로 막대 (0~100 스케일):
  - 자신 점수 = 채워진 막대 (tone별 색: `good`→`pullim-blue-600`, `improve`→`pullim-slate-500`, `warn`→`pullim-warn`)
  - 또래 평균(`peer`) = 막대 위 짧은 세로 마커 (∇ 또는 dotted line)
- 각 차원 라인 구성: 라벨 | 막대 | 점수 숫자 | 또래 비교 (예: `vs 또래 55`)
- 약점 차원(`tone === 'warn'`)은 미니 인사이트 한 줄 (`line-clamp-1`) 노출
- 하단 CTA: "풀이 습관 자세히 보기 →" → `/q/analysis/process`

**우측 카드 — "무엇이 강한가" (단원별 θ)**
- 3개 과목 양방향 가로 막대 (θ -1.0 ~ +1.0, 중앙선=0=또래 평균):
  - 양수면 우측, 음수면 좌측으로 막대 — 또래 대비 위치를 좌우 시각으로 표현
  - 양수 = `pullim-blue-600`, 음수 = `pullim-warn` 또는 슬레이트
- 각 라인 구성: 과목 | 좌우 막대 | θ 숫자 | 24h delta (↑/↓) + 등급(`expectedGrade`)
- 하단 CTA: "단원별 자세히 보기 →" → `/q/analysis/ability`

### 3. Action 섹션은 기존 컴포넌트 유지 + 카피 보강
"분석 → 행동" 흐름을 명시하도록 SectionHeading 카피만 다듬는다. 로직/마크업은 그대로.

- `<WrongReasonTop3 />` — h2 그대로, 부제 "**분석에서 발견한** — 한 문제씩 들여다볼 때 먼저 살펴봐요"
- `<RecentMistakes />` — title을 동적 카운트로: "다시 봐야 할 {N}문제"
- `<TodayReviewPreview />` — 변경 없음

### 4. 시각화 구현 방식 (라이브러리 X)
모두 Tailwind + 인라인 style.

- **수평 막대 (메타)**: 컨테이너 `relative h-2 rounded-full bg-pullim-slate-100` + 자식 `h-full rounded-full` `style={{ width: ${score}% }}` + 또래 마커 `absolute h-3 w-0.5 bg-pullim-slate-500` `style={{ left: ${peer}% }}`
- **양방향 막대 (θ)**: 컨테이너 `relative h-2 rounded-full bg-pullim-slate-100` + 중앙 분기선 `absolute left-1/2 w-px h-3 bg-pullim-slate-400` + 양수면 `left-1/2 w-{|θ|*50%}`, 음수면 `right-1/2 w-{|θ|*50%}` (θ 범위 -1~+1 가정, 클램프)
- tone 색 헬퍼는 `analysis/` 내부 `cn` 분기 또는 작은 map 객체로

번들 무영향, 토큰만 사용.

## 새/변경 파일

### 신규
- [src/components/analysis/diagnosis-hero.tsx](src/components/analysis/diagnosis-hero.tsx) — 학습자 유형 라벨 + 데이터 소스 + stat chip 4개
- [src/components/analysis/analysis-two-axis.tsx](src/components/analysis/analysis-two-axis.tsx) — 두 카드 (메타 4차원 + 단원별 θ), 내부에 막대 sub-컴포넌트 인라인

### 수정
- [src/app/(student)/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) — `PageHeader` + "내 실력 한눈에" 섹션 제거 → 신규 두 컴포넌트로 교체
- [src/components/analysis/wrong-reason-top3.tsx](src/components/analysis/wrong-reason-top3.tsx) — 부제 카피만
- [src/components/analysis/recent-mistakes.tsx](src/components/analysis/recent-mistakes.tsx) — 동적 카운트 title

## 작업 항목

### 1단계 — DiagnosisHero
- [x] [src/components/analysis/diagnosis-hero.tsx](src/components/analysis/diagnosis-hero.tsx) 신규 (PR #41)

### 2단계 — AnalysisTwoAxis
- [x] [src/components/analysis/analysis-two-axis.tsx](src/components/analysis/analysis-two-axis.tsx) 신규 (PR #41)

### 3단계 — page.tsx 재구성
- [x] [src/app/(student)/q/analysis/page.tsx](src/app/(student)/q/analysis/page.tsx) `PageHeader` + 기존 "내 실력 한눈에" 섹션 제거, 신규 두 컴포넌트 + 기존 3 섹션 순서 적용 (PR #41)

### 4단계 — 카피 보강
- [x] [wrong-reason-top3.tsx](src/components/analysis/wrong-reason-top3.tsx) 부제 갱신 (PR #41)
- [x] [recent-mistakes.tsx](src/components/analysis/recent-mistakes.tsx) 동적 카운트 title (PR #41)

### 5단계 — 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build` PR #41 통과
- [x] `bun dev` 수동 확인 — `/q/analysis` 첫 화면 정독·신중형 + 메타 67 + 강과학 + 다시볼 4문제 즉시 표시, 모바일 chip 2×2 / 데스크탑 가로 4 정상 (PR #41 머지 시 검증)

## 비범위 (이번 작업 아님)
- `/q/analysis/process`, `/q/analysis/ability` 하위 페이지 — CTA만 유지
- 새 mock 추가 — 기존 데이터만 사용
- 차트 라이브러리(recharts/visx) — CSS 막대로 충분
- 다른 분석 섹션(`<TodayReviewPreview />` 등) 시각화 — 다음 PR

## 클로저 (2026-05-18)

- ✅ **PR #41** (`7cdd90e` 풀림 Q feat — /q/analysis 진입 비주얼 리디자인) 머지로 5 단계 전부 완료
- 후속 발견: 2026-05-18 UX audit sweep plan §2.N4 — DiagnosisHero trend 색 분기 (`+N` success / `-N` danger) 미구현. 별도 sweep PR 후보 (이 plan 범위 밖, 2026-05-18 sweep 으로 이관됨)
- 후속 발견: 2026-05-18 UX audit sweep plan §1.I2 — AnalysisTwoAxis peer 마커 `w-0.5` 가시성 약함 (2026-05-18 sweep 으로 이관됨)
- 후속 발견: 2026-05-18 UX audit sweep plan §1.I4 — 모바일 hero viewport 절반 점유 (2026-05-18 sweep 으로 이관됨)
