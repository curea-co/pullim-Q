# 풀림 Q · /review out-of-scope 일괄 처리 (2026-05-19)

> **출처**: 2026-05-18 `/review` 결과 (PR #61) 의 "Out of scope" 묶음.
> **PR base**: `dev`. PR #61 이 머지된 뒤에는 충돌 없이 rebase 가능 (서로 다른 라인/파일/관심사).
> **연계**: [2026-05-18_q-review-followup.md](2026-05-18_q-review-followup.md) §"Out of scope".

## 목표

PR #61 의 in-scope (Critical 5 + Important 4) 외에 review 단계에서 별도 plan 으로 미뤘던 5건을 일괄 마감. 이후 신규 feature 진입 전 회귀선 청소 완료.

## 작업 항목

### O1. LeaveGuard bfcache pageshow re-arm

Safari/Firefox bfcache 복원 시 useEffect 가 재실행되지 않아 sentinel pushState 와 popstateBlocked ref 상태가 어긋날 수 있음. `pageshow` 리스너 추가로 `event.persisted === true` 시 sentinel 재배치.

- [ ] [src/components/shell/leave-guard.tsx](../../src/components/shell/leave-guard.tsx) — popstate useEffect 옆에 pageshow useEffect 추가

### O2. solve-resume-card `window.confirm` → 컨트롤드 Dialog

iOS Safari 네이티브 confirm 은 ESC 동작 없고 a11y label 부재 → WCAG 미달. shadcn/base-ui Dialog 로 교체.

- [ ] [src/components/infinity/solve-resume-card.tsx](../../src/components/infinity/solve-resume-card.tsx) — `useState<boolean>` 추가, `window.confirm(...)` 호출 제거, Dialog primitive 로 "저장 버리기" 확인 모달 구성

### O3. solve-session-store cross-tab `storage` 이벤트 동기화

다른 탭에서 snapshot 변경 시 현재 탭이 stale state 로 보지 않도록 storage 이벤트 리스너 추가. BroadcastChannel 보다 단순한 1차 동기화 (cross-tab UUID coordination 은 본 범위 밖).

- [ ] [src/lib/store/solve-session-store.ts](../../src/lib/store/solve-session-store.ts) — 모듈 로드 시 `window.addEventListener('storage', ...)` 등록, key 일치 시 `useSolveSessionStore.persist.rehydrate()`

### O4. 모바일 터치 타겟 44px sweep

`shell/coach-fab.tsx` 가 이미 `h-[44px]` 명시한 룰을 다른 진입점들에도 일관 적용.

- [ ] [src/components/infinity/solve-resume-card.tsx](../../src/components/infinity/solve-resume-card.tsx) — "이어풀기" / "새 세션" 버튼 `py-2` → `py-2.5 min-h-11`
- [ ] [src/components/conqueror/conquer-intro-dialog.tsx](../../src/components/conqueror/conquer-intro-dialog.tsx) — trigger 버튼 (`px-2.5 py-1`) → `px-3 py-2 min-h-9` (chip 형태 유지하면서 ≥36px 보장)
- [ ] [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) — Link 에 `min-h-11` 명시 (현재 ~44 인데 폰트 변경 시 회귀 방지)
- [ ] [src/components/coach/activity-timeline.tsx](../../src/components/coach/activity-timeline.tsx) — CTA chip `px-1.5 py-0.5 text-[10px]` → `px-2 py-1.5 text-[11px] min-h-8`

### O5. Bottom-nav `grid-cols-N` 데이터 결합

탭 개수가 nav-config 와 연동되도록.

- [ ] [src/components/shell/bottom-nav.tsx](../../src/components/shell/bottom-nav.tsx) — `grid-cols-4` 하드코딩 → `studentBottomTabs.length` lookup (`{3:'grid-cols-3', 4:'grid-cols-4', 5:'grid-cols-5'}`)

### O6. SNAPSHOT_TTL 매직 넘버 결합

`solve-session-store.ts` 의 `SNAPSHOT_TTL_MS` 와 `solve-resume-card.tsx` 의 `"24시간 이상 전"` 카피가 따로 박혀 있어 24h tune 시 한쪽이 거짓말 가능.

- [ ] [src/lib/store/solve-session-store.ts](../../src/lib/store/solve-session-store.ts) — `SNAPSHOT_TTL_HOURS` 상수 추가하고 export
- [ ] [src/components/infinity/solve-resume-card.tsx](../../src/components/infinity/solve-resume-card.tsx) — relativeTime 의 24h 분기와 카피를 상수로부터 derive

## 검증

- [ ] `bunx tsc --noEmit`
- [ ] `bun run build`
- [ ] `bun dev` 후 /q/infinity/solve 진입 → "저장 버리기" 클릭 시 Dialog 노출, ESC 로 닫힘
- [ ] 모바일 360 화면에서 BottomNav · solve-resume-card · ActivityTimeline CTA · ConquerIntroDialog trigger 모두 ≥36px 이상

## Out of scope (이번 PR 에서도 다시 미룸)

- **I3 hydrate race**: persist 비동기 수화 → 첫 마운트 빈 state 가 save effect 로 stale 덮어쓰는 경로 의심 (재현 e2e 없음). solve/page.tsx 의 restore 로직 큰 surgery 필요 → 별도 investigation 필요
- **solve-resume-card relativeTime `Date.now()` in render**: useState+useEffect 로 옮기는 게 정석이지만 모바일 SSR 안전성 영향 미미 → 후속
- **leave-guard 버튼 시각 위계 (계속 풀기 ↔ 나가기)**: taste call, G4 결정 사항
- **DRY: diagnose overdue 로직 (DiagnosisHero ↔ q/page.tsx)**: 헬퍼 추출 가능하지만 변경 risk vs 이득 작음
- **module boundary: solve-session-store ← components/ 타입 의존**: SolveSourceMeta 위치 이동 필요, 별도 리팩토링 PR

## 메모

- PR #61 와 동시에 OPEN 가능. 머지 순서: #61 먼저 → 본 PR rebase → 본 PR 머지. 둘 다 dev 베이스.
- conquer-intro-dialog 는 양 PR 이 모두 건드리지만 라인 겹침 없음 (DISMISS_KEY: 15 vs trigger button: 69).
