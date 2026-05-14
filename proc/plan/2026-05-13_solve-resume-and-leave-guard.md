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
- [ ] [src/lib/store/solve-session-store.ts](src/lib/store/solve-session-store.ts) 신규
  - `SolveSessionSnapshot` 타입: `{ sessionKey, subject, unitTitle, source, currentIdx, answers, marked, hintsByProblem, total, savedAt }`
  - 액션: `saveSnapshot`, `loadSnapshot`, `clearSnapshot`, `setInProgress(flag)`
  - 셀렉터: `hasResumable`, `isSolvingInProgress`
  - `persist` 미들웨어로 localStorage 동기화 (키: `pullim-q.solve-session.v1`). retry·exam 모드는 저장 제외 (액션에서 분기).

### 2단계 — solve 페이지 sync
- [ ] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx)
  - `useEffect`로 mount 시 `setInProgress(true)`, unmount 시 `false`
  - `currentIdx`/`answers`/`marked`/`hintsByProblem` 변경 시 `saveSnapshot` 호출 (debounce 300ms 또는 변경 즉시)
  - 시험 모드 진입 시 연습 스냅샷 보존, 시험 종료 시 그대로 복귀 가능
  - 정답 도달(마지막 문제 풀고 진행) 시 `clearSnapshot`

### 3단계 — 이어풀기 UI
- [ ] [src/components/infinity/solve-resume-card.tsx](src/components/infinity/solve-resume-card.tsx) 신규
  - 과목·단원·풀이 종류 라벨 + `current/total` + 저장 시각(상대시간)
  - 버튼 3종: **이어풀기** (URL 재구성 후 router.replace + 상태 복원) / **새 세션** (clearSnapshot 후 피커 유지) / **저장 버리기**
- [ ] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx) — picker 상단에 조건부 렌더링
- [ ] URL 복원 흐름: 이어풀기 클릭 시 `?kind=...&subject=...` 재생성 → `replace` → `useEffect`에서 스냅샷의 `currentIdx`/`answers` 등으로 `setState` 일괄 복원 (sessionKey 매칭 시에만)

### 4단계 — 앱 내 nav 가드
- [ ] [src/components/shell/leave-guard.tsx](src/components/shell/leave-guard.tsx) 신규
  - `LeaveGuardProvider` — context에 `confirmNavigate(href)` 노출, 내부적으로 shadcn Dialog 1개 보유
  - `isSolvingInProgress` 셀렉터 구독, false면 가드 패스
  - 모드별 카피: 연습 vs 시험 분기
- [ ] [src/components/shell/app-shell.tsx](src/components/shell/app-shell.tsx) — Provider로 트리 감싸기
- [ ] [src/components/shell/app-sidebar.tsx](src/components/shell/app-sidebar.tsx) · [bottom-nav.tsx](src/components/shell/bottom-nav.tsx) · [app-header.tsx](src/components/shell/app-header.tsx)
  - `<Link>` → 가드 통과하는 `<GuardedLink>` 또는 onClick에서 `confirmNavigate` 호출 후 `e.preventDefault()`

### 5단계 — 브라우저 이탈 가드
- [ ] [solve/page.tsx](src/app/(student)/q/infinity/solve/page.tsx) 내부 hook 또는 [leave-guard.tsx](src/components/shell/leave-guard.tsx)에 통합
  - `beforeunload` 리스너: `isSolvingInProgress`일 때만 `e.preventDefault()` + `returnValue` 설정
  - `popstate` 리스너 — 뒤로가기 1차 차단 + dialog 표시, 확정 시 `history.back()` 다시 호출

### 6단계 — 모드 토글·세션 변경 자체 분기
- [ ] solve 페이지의 `handleChangeSession`·시험 모드 전환·`ExamConfirmDialog` 흐름은 가드 대상 **아님** (페이지 안에서 일어남) — 단, 시험 진입 직전에는 기존 ExamConfirmDialog가 그대로 책임. 연습→시험 전환 시 연습 스냅샷은 보존, 시험 종료 시 자동 복귀 확인.

### 7단계 — 검증
- [ ] `bunx tsc --noEmit && bun run lint && bun run build`
- [ ] `bun dev` (포트 3031) — 시나리오 5종 수동 확인:
  1. free 세션 풀이 중 사이드바 클릭 → dialog → 취소 → 머무름
  2. weak 세션 3문항 풀고 dialog → 확인 → 다른 페이지 → `/q/infinity/solve` 재진입 → 이어풀기 카드 → 복원
  3. 시험 모드 중 dialog 카피가 더 강한 톤으로 나오는지
  4. retry 모드는 가드 없이 통과
  5. 탭 새로고침 시 브라우저 기본 confirm 뜨는지

## 결정 보류 항목

- 저장 만료 정책: 24시간 지난 스냅샷은 자동 폐기? (구현은 1단계에서 `savedAt` 비교 한 줄)
- 모바일 BottomNav도 동일 가드 적용 — 모달 사이즈만 별도 확인
- 시험 모드 부분 저장(마킹·timer) 지원 여부 — **이번 작업에선 미지원**으로 못박음
