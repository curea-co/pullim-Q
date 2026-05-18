# /q/infinity/solve 이어풀기 & 이탈 가드

> **대응 src/ 파일** (2026-05-14 기준): 현재 working tree 변경 0개. "작업 항목"에 명시된 파일이 작업 시 신규로 잡힘 — `solve-session-store.ts`·`solve-resume-card.tsx`·`leave-guard.tsx` 신규 + `solve/page.tsx`·`app-shell.tsx`·`app-sidebar.tsx`·`bottom-nav.tsx`·`app-header.tsx` 수정.
>
> **게이트키퍼**: G3 (저장 정책·시험 모드 부분 저장 비범위 확정) + G4 (가드 UX·BottomNav 회귀) + G1 (이어풀기 카드 카피).

## 목표
풀이 중 페이지 이탈 시 진행 상태를 자동 저장하고, 다시 들어왔을 때 "이어풀기"로 복귀할 수 있게 한다. 사이드바·BottomNav·뒤로가기·탭 닫기로 빠져나가려 할 때 confirm 모달로 한 번 멈춘다.

## 배경 (현재 문제)

- [src/app/(student)/q/infinity/solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx) 의 풀이 상태(`currentIdx`, `answers`, `marked`, `hintsByProblem`, `mode`, `activeExam`, `examRemaining`)가 전부 로컬 useState — 페이지 떠나면 증발.
- 사이드바([app-sidebar.tsx](src/components/shell/app-sidebar.tsx))·BottomNav([bottom-nav.tsx](src/components/shell/bottom-nav.tsx))는 일반 `<Link>` — 풀이 중이어도 무경고로 이탈.
- 시험 모드는 타이머까지 돌아가서 이탈 시 손실이 더 큼. 연습/시험 분기 정책이 달라야 함.

## 설계 방침

### 분기 1 — 세션 종류별 저장 정책
| 종류 | 저장 | 이탈 시 메시지 |
|---|---|---|
| 연습 · free / weak | **저장** (자동) | "지금까지 푼 N문항이 저장돼요. 나갈까요?" |
| 연습 · retry (단일문항) | **저장 안 함** | 짧으니 가드 없이 통과 |
| 시험 모드 | **저장 안 함** (타이머 정합성 우선) | "시험은 중단됩니다. 지금 나가면 마킹 결과가 사라져요." (강조 톤) |

### 분기 2 — 이어풀기 진입
`/q/infinity/solve` 도착 시 분기:
1. URL 파라미터로 세션이 명시되어 있으면 → 그 세션 시작 (기존 동작)
2. 파라미터 없고 저장된 세션 있으면 → 피커 위에 **이어풀기 카드** 노출 (이어풀기 / 새 세션 / 저장 버리기 3택)
3. 파라미터·저장 둘 다 없으면 → 기존 피커 (변경 없음)

### 분기 3 — 이탈 트리거 3종
- **앱 내 nav 클릭** (사이드바, BottomNav, AppHeader 링크): `LeaveGuardLink` 또는 가드 컨텍스트가 `<Link>`를 가로채 confirm dialog → 확인 시 `router.push`
- **브라우저 뒤로가기**: `history.pushState` + `popstate` 리스너로 한 번 잡아서 dialog
- **탭 닫기 / 새로고침**: `beforeunload` 이벤트 — 브라우저 기본 confirm (커스텀 메시지 미지원이라 정책상 OK)

가드 동작 여부는 zustand의 `isSolvingInProgress` 셀렉터로만 판단. 풀이 페이지에서 mount/unmount 시 flag on/off.

## 작업 항목

### 1단계 — 저장소 (zustand persist)
- [x] [src/lib/store/solve-session-store.ts](src/lib/store/solve-session-store.ts) 신규 (PR #42)

### 2단계 — solve 페이지 sync
- [x] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx) mount/unmount setInProgress, 진행 변경 시 saveSnapshot, 시험 모드 분기, 도달 시 clearSnapshot (PR #42)

### 3단계 — 이어풀기 UI
- [x] [src/components/infinity/solve-resume-card.tsx](src/components/infinity/solve-resume-card.tsx) 신규 + picker 상단 조건부 렌더 + URL 재구성 복원 (PR #42)

### 4단계 — 앱 내 nav 가드
- [x] [src/components/shell/leave-guard.tsx](src/components/shell/leave-guard.tsx) 신규 + app-shell Provider + sidebar/bottom-nav/header `<Link>` 가드 wrapping (PR #42)

### 5단계 — 브라우저 이탈 가드
- [x] `beforeunload` + `popstate` 리스너 통합 (PR #42). **5-15 hotfix PR #43**: popstate 사이클 결함 fix — `__back__` 분기에서 `setInProgress(false)` 선행 후 다음 frame `history.back()`, listener once + cleanup

### 6단계 — 모드 토글·세션 변경 자체 분기
- [x] solve 페이지 내부 액션은 가드 대상 외, 시험 진입은 ExamConfirmDialog 책임, 연습↔시험 스냅샷 보존 흐름 검증 (PR #42)

### 7단계 — 검증
- [x] `bunx tsc --noEmit && bun run lint && bun run build` PR #42·#43 통과
- [x] `bun dev` 시나리오 5종 수동 확인 — PR #42 머지 시점 통과 + PR #43 hotfix 후 popstate 시나리오 재확인 e2e 추가

## 결정 보류 항목

- 저장 만료 정책: 24시간 지난 스냅샷은 자동 폐기? (구현은 1단계에서 `savedAt` 비교 한 줄)
- 모바일 BottomNav도 동일 가드 적용 — 모달 사이즈만 별도 확인
- 시험 모드 부분 저장(마킹·timer) 지원 여부 — **이번 작업에선 미지원**으로 못박음

## 클로저 (2026-05-18)

- ✅ **PR #42** (`69202d7` 풀림 Q feat — /q/infinity/solve 이어풀기 + 이탈 가드) 머지로 §1~§7 7 단계 전부 완료
- ✅ **PR #43** (`fee160b` 풀림 Q hotfix — LeaveGuard popstate 사이클) — production 학생 가둠 버그 hotfix + e2e 시나리오 1건 추가
- 후속 결정 보류 항목 3건은 별도 추적 (이 plan 의 클로저 범위 밖):
  - 저장 만료 24h 자동 폐기 — 향후 데이터 보고 결정
  - 모바일 BottomNav 가드 — 현재 동일 가드 적용 중, 모달 사이즈 별도 polish 후보
  - 시험 모드 부분 저장 — 명시적 미지원, 후속 plan 없음
