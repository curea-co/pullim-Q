# 2026-05-06 오버플로 베이스 컴포넌트 적용

> **상태**: ✅ 완료 (코드 + 라이브 검증, 2026-05-07)
> **명세 권위**: [04-ux-flow.md § 6.6](../spec/04-ux-flow.md), [08-design-system.md § 7.1](../spec/08-design-system.md)
> **트리거 사건**: `/q/infinity/solve` 시험 모드 다이얼로그가 viewport 초과(1271px vs 812px) → 헤더·푸터 양쪽 잘림
> **분류**: **글로벌 작업** (`components/ui/*` 편집 = 6 도메인 전체 영향)
>
> **적용 요약 (2026-05-06)**
> - `src/components/ui/dialog.tsx`: `DialogContent`에 `max-h-[calc(100dvh-2rem)] overflow-y-auto` 추가, `DialogHeader`에 `sticky top-0 z-10 bg-popover pb-2`, `DialogFooter`에 `sticky bottom-0 z-10` 추가 (기존 `-mx-4 -mb-4 bg-muted/50 border-t` 보존).
> - `src/components/ui/sheet.tsx`: `SheetContent`에 `overflow-y-auto` + 좌우는 `h-[100dvh]`, 상하는 `max-h-[100dvh]` 적용. `SheetHeader`에 `sticky top-0 z-10 bg-popover`, `SheetFooter`에 `sticky bottom-0 z-10 border-t bg-popover` 추가.
> - `src/components/ui/dropdown-menu.tsx`: skip — 기존에 `max-h-(--available-height) overflow-y-auto` 이미 적용되어 § 6.6 충족.
> - `src/components/ui/popover.tsx`, `src/components/ui/select.tsx`: 파일 자체가 존재하지 않음 (현재 코드베이스 미사용). 새 파일 생성은 본 plan 범위 외 — 향후 도입 시 동일 패턴 적용 필요.
> **라이브 검증 결과 (2026-05-07)**
> - 트리거 케이스 `/q/infinity/solve` → "시험 모드" 다이얼로그
>   - mobile `375×667`: top=16, bottom=651, height=635 (`max-h: 635px`, `overflow-y: auto`) → 헤더·푸터 살아 있고 본문만 스크롤 ✓
>   - desktop `1280×720`: top=16, bottom=704, height=688 → 동일 ✓
> - 캡처: [output/live-shots/exam-dialog-after-mobile.png](../../output/live-shots/exam-dialog-after-mobile.png), [exam-dialog-after-desktop.png](../../output/live-shots/exam-dialog-after-desktop.png)
> - 콘솔 에러: 0건
> - 부수 발견: sticky footer의 `bg-muted/50` 반투명 때문에 스크롤 시 뒤 콘텐츠가 살짝 비침. 기능 영향 없음, 후속 cleanup 후보 (footer 배경을 `bg-popover` 또는 fully opaque로 검토).
> - **추가 fix (2026-05-07)**: `DialogContent`의 X 닫기 버튼이 sticky 헤더(z-10)에 가려져 비가시 → `absolute top-2 right-2` → `absolute top-2 right-2 z-20`으로 z-index 보정. 보조 캡처: [output/live-shots/overflow-fix/dialog-compact-final.png](../../output/live-shots/overflow-fix/dialog-compact-final.png), [dialog-comfortable-final.png](../../output/live-shots/overflow-fix/dialog-comfortable-final.png).

## 목표

§ 6.6 오버플로 처리 규칙을 5개 베이스 컴포넌트의 **기본 동작**으로 박는다. 페이지·도메인 컴포넌트가 매번 `max-h`를 덧붙이지 않아도 viewport 초과 시 헤더·푸터가 살아남고 본문만 스크롤되도록 한다.

## 작업 항목

### Step 1: 베이스 5종 수정

- [x] **`components/ui/dialog.tsx` `DialogContent`**
  - 적용: `max-h-[calc(100dvh-2rem)] overflow-y-auto` (기존 `grid gap-4` 구조 유지 — 자식 sticky로 처리하는 게 회귀 위험 최소).
  - `DialogHeader`: `sticky top-0 z-10 bg-popover pb-2` (negative margin은 추가하지 않음 — `p-0` 등 override 시 깨지지 않도록).
  - `DialogFooter`: `sticky bottom-0 z-10` 추가 (기존 `-mx-4 -mb-4 border-t bg-muted/50 p-4` 보존).
- [x] **`components/ui/sheet.tsx`**
  - `SheetContent`: `overflow-y-auto` 추가, 좌우는 `h-[100dvh]` (기존 `h-full`에서 `dvh`로 격상), 상하는 `max-h-[100dvh]` 추가.
  - `SheetHeader`: `sticky top-0 z-10 bg-popover`.
  - `SheetFooter`: `sticky bottom-0 z-10 border-t bg-popover`.
- [x] **`components/ui/popover.tsx`** — skip (파일 미존재. 현 코드베이스에서 popover primitive 미사용. 새 파일 생성은 본 plan 범위 외.)
- [x] **`components/ui/dropdown-menu.tsx`** — skip (Base UI `Menu.Positioner` + `Popup`이 이미 `max-h-(--available-height) overflow-y-auto` 적용하여 § 6.6 자동 충족.)
- [x] **`components/ui/select.tsx`** — skip (파일 미존재. 동상.)

> Base UI 활용: dropdown-menu는 collision detection으로 자동 처리 → 추가 작업 없음. dialog/sheet은 콘텐츠 길이 자유여서 우리 쪽에서 max-h + 스크롤 + sticky를 직접 박음.

### Step 2: 회귀 점검 — 도메인별 다이얼로그·시트 사용처

- [x] `grep -r "DialogContent\|SheetContent\|PopoverContent" src/`로 사용처 전수 확인
  - 사용처 3곳 발견:
    - `src/components/shell/mobile-drawer.tsx` (Sheet, side="left", `w-72 p-0 flex flex-col`) — 햄버거 사이드바. 자체 `flex flex-col` + 헤더 + sidebar(flex-1)로 이미 안전 구조.
    - `src/components/planner-builder/unit-editor-modal.tsx` (Dialog, `flex max-h-[85vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0`) — 자체 `max-h-[85vh]` + `overflow-hidden` + 본문 wrapper `flex-1 overflow-y-auto p-5` 적용 중. **베이스 변경에 영향 없음** (override가 base보다 우선, sticky는 overflow-hidden 하의 자식에서 무해).
    - `src/components/infinity/exam-confirm-dialog.tsx` (Dialog, `sm:max-w-lg`) — **트리거 사례.** override 없으니 베이스 동작 그대로 적용 → 헤더·푸터 sticky + max-h + overflow-y-auto가 자동 작동.
- [x] 각 사용처의 자체 `max-h`/`overflow` 클래스 — **제거하지 않고 그대로 유지** (안전 변화 우선; tailwind-merge로 base 덮어씀이 검증됨). 후속 cleanup PR에서 정리 가능.
- [x] **모든 도메인에서** 오버플로 정상 동작 확인:
  - 풀림 플래너 (블록 편집 시트, 보고서 다이얼로그) — unit-editor-modal 외 dialog/sheet 사용처 없음. override 케이스라 베이스 변경에 영향 없음 확인.
  - 풀림 Q (시험 모드 다이얼로그, 풀이 세션 picker) — `/q/infinity/solve` 트리거 케이스 라이브 검증 통과.
  - 풀림 클래스봇 (학생/교사) — dialog/sheet 사용처 없음.
  - 풀림 라이브러리 (자료 상세, 만들기 모달) — dialog/sheet 사용처 없음.

### Step 3: 라이브 검증 (2026-05-07 통과)

- [x] **트리거 사례 검증**: `/q/infinity/solve` → "시험 모드" 클릭 → 다이얼로그
  - viewport `375×667` (Compact): 헤더·푸터 살아 있고 시험 세트 리스트만 스크롤 ✓
  - viewport `1280×720` (Comfortable): 동일 ✓
- [x] after 캡처: [output/live-shots/exam-dialog-after-mobile.png](../../output/live-shots/exam-dialog-after-mobile.png), [exam-dialog-after-desktop.png](../../output/live-shots/exam-dialog-after-desktop.png)
- [x] 콘솔 에러 0건 확인
- [x] 다른 도메인 sanity check — 회귀 점검 표 3건 모두 정상

### Step 4: 명세 회귀 사례 갱신

- [ ] [04-ux-flow.md § 6.6.3 적용 예시](../spec/04-ux-flow.md) 표에 "수정 완료" 표기 또는 결과 캡처 링크 추가 (선택 작업, 명세 명확성 보강)

## 검증 기준

§ 6.6.4 검증 항목 (라이브 검증 통과):
- [x] 헤더(타이틀)에 즉시 도달 가능
- [x] 푸터(CTA)에 스크롤 없이 또는 한 번의 스크롤로 도달
- [x] 가로 스크롤 미발생
- [x] `dvh` 단위 적용 (모바일 주소창 동적 변화 대응)

## 범위 외

- **버튼 어포던스 정리** — [별도 plan](2026-05-06_button-affordance-q-domain.md)
- **카피 정리(θ, 한자어)** — [별도 plan](2026-05-06_copy-cleanup-jargon-and-hanja.md)
- 무한 스크롤 패턴(피드·타임라인) — § 6.6.2에서 별개 명세 대상으로 명시. 본 plan 범위 아님.

## 비고

- 한 PR로 처리 권장 — 5개 베이스가 같은 규칙을 따라가는 게 일관성. 베이스 1개씩 쪼개면 회귀 점검 비용이 더 커짐.
- 커밋 메시지에 명세 인용: `feat(ui): dialog max-h + sticky header/footer (04 § 6.6)`

### 회귀 점검 결과 (Step 2)

| 사용처 | 자체 `max-h`/overflow | 처리 |
|---|---|---|
| `src/components/shell/mobile-drawer.tsx` (SheetContent) | 없음 | 베이스 자동 적용. SheetHeader sticky로 사이드바 스크롤 시 로고/역할 토글 고정. |
| `src/components/planner-builder/unit-editor-modal.tsx` (DialogContent) | `flex max-h-[85vh] flex-col overflow-hidden p-0` + 본문 wrapper `flex-1 overflow-y-auto` | 자체 처리 우선. 베이스 sticky는 overflow-hidden 하에서 no-op. tw-merge로 충돌 없음. |
| `src/components/infinity/exam-confirm-dialog.tsx` (DialogContent) | `sm:max-w-lg`만 | 베이스 자동 적용. 트리거 케이스 — 시험 세트 N개 + 차단/활성 grid + 룰 박스가 viewport 초과 시 헤더(시험 모드 시작?) + 푸터(취소/시험 시작) 살아남고 본문만 스크롤. |

### TS 검증

- `pnpm exec tsc --noEmit` 통과 (2026-05-06).

### 사람이 라이브 검증할 트리거 케이스

1. `/q/infinity/solve` → "시험 모드" 클릭 → exam-confirm-dialog 노출
   - viewport `375×667` (Compact 최소): 헤더·푸터 살아 있고 시험 세트 리스트만 스크롤되는지
   - viewport `1280×720` (Comfortable 최소): 동일
2. 모바일 햄버거 메뉴 → MobileDrawer (Sheet left) 열기 → 사이드바 스크롤 시 헤더 sticky
3. `/planner/builder` → unit-editor-modal 열기 → 단원 검색·선택 시 본문만 스크롤, 헤더·푸터 고정 (override 케이스, 베이스 변경 후에도 정상 동작 확인)
