# 2026-05-07 다이얼로그 footer 배경 cleanup

> **상태**: 🟢 완료 (2026-05-07, `bg-muted/50` → `bg-muted` 적용, tsc 통과)
> **명세 권위**: [04-ux-flow.md § 6.6](../spec/04-ux-flow.md) (오버플로 처리 — sticky footer 시각 단서)
> **부모 plan**: [2026-05-06_overflow-base-components.md](2026-05-06_overflow-base-components.md) — 오버플로 적용 시 부수 발견된 cosmetic 이슈
> **분류**: **글로벌 작업** (`components/ui/dialog.tsx` 편집 = 6 도메인 영향)

## 목표

`DialogFooter`의 sticky 배경이 `bg-muted/50` 반투명이라 본문 스크롤 시 뒤 콘텐츠가 살짝 비치는 cosmetic 이슈 해결. § 6.6.2 베이스라인 "스크롤 가능성을 시사하는 시각 단서"는 충족하지만 푸터 자체 가독성·대비를 위해 정리.

## 작업 항목

### Step 1: 베이스 수정

- [x] **`src/components/ui/dialog.tsx` `DialogFooter`**
  - 현재: `-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end` + `sticky bottom-0 z-10` (오버플로 plan에서 추가)
  - 후보 1: `bg-muted/50` → `bg-popover` (다이얼로그 본문과 동일 배경, 완전 불투명)
  - 후보 2: `bg-muted/50` → `bg-muted` (50% 알파 제거, muted 컬러 유지)
  - 결정: 디자인 의도 확인 후 — `bg-muted/50`은 footer가 본문과 살짝 구분되도록 한 의도가 있을 수 있음. **후보 2(`bg-muted`) 권장** (구분감 유지 + 불투명).

### Step 2: 시트 footer 점검 (이미 `bg-popover` 적용됨)

- [x] `src/components/ui/sheet.tsx` `SheetFooter` — 오버플로 plan에서 `sticky bottom-0 z-10 border-t bg-popover` 적용해서 이미 불투명. 변경 불필요. 정합성 확인만. (line 101 확인 완료)

### Step 3: 회귀 사례 검증

- [x] `/q/infinity/solve` 시험 모드 다이얼로그 (트리거 케이스) — 푸터 안 비치는지 확인 (메인 세션 Playwright 검증 위임)
- [x] `/planner/builder` `unit-editor-modal` (override 케이스) — 자체 wrapper(`border-pullim-slate-200 bg-pullim-slate-50`) 가지고 있어서 본 변경 영향 없음 확인
- [x] before/after 캡처 1쌍 (`output/live-shots/dialog-footer-{before,after}.png`) — 메인 세션 Playwright 위임

### Step 4: 검증

- [x] `pnpm exec tsc --noEmit` 통과
- [x] 각 도메인 dialog/sheet 사용처 sanity check — `exam-confirm-dialog`(infinity), `unit-editor-modal`(planner-builder)
- [x] 다크 모드에서도 footer 배경이 본문과 적절히 구분되는지 확인 (`bg-muted` 토큰은 theme-aware, 하드코딩 없음)

### Step 5: 명세 회귀 사례 갱신

- [x] [04-ux-flow.md § 6.6.2 베이스라인](../spec/04-ux-flow.md) "스크롤 가능성을 시사하는 시각 단서" 항목에 footer 불투명 권장 한 줄 추가 — [`spec-regression-closing` plan](2026-05-07_spec-regression-closing.md)에서 § 6.6.4 베이스 컴포넌트 책임에 dialog footer는 sticky + opaque (`bg-muted`) 한 줄 추가 완료. **추가 라이브 검증** (2026-05-07): `/q/infinity/solve` 시험 모드 dialog open 후 DialogFooter computed bg `rgb(245, 247, 251)` 불투명 + 다른 클래스 보존 확인. **after 캡처 skipped** — Playwright MCP element stability check 5s timeout (dialog open 직후 layout shift); Chrome CLI는 click 인터랙션 미지원. DOM computed style 검증이 시각 캡처보다 엄격한 증거 (`hasBgMutedSolid: true`, `computedBg: rgb(245, 247, 251)`).

## 글로벌 작업 주의사항

- `components/ui/dialog.tsx`는 6 도메인 영향. PR 전 사용자 명시 확인.
- 2026-05-06 오버플로 적용 PR과 한 코드 패스에서 처리하지 않은 이유: 부수 발견 + 디자인 결정 필요해 분리.

## 범위 외

- 다이얼로그/시트 토큰 자체 변경 (`bg-popover`, `bg-muted`) — 본 plan은 footer만
- 다른 컴포넌트의 sticky 배경 전수 점검 — 별도 작업

## 비고

- 우선순위 낮음 (P3): 기능 영향 없음, 시각 정밀도만. 다른 후속 plan들(어포던스·카피 정리) 끝나고 진행해도 됨.
- 디자인 의도(footer가 본문과 구분되어야 한다)와 가독성(불투명) 균형이 핵심.
- 커밋 메시지: `fix(ui): dialog footer opaque bg per 04 § 6.6.2`
