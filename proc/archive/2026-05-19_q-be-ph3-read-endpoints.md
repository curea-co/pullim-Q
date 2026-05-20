# 풀림 Q · BE Ph3 — read endpoint 9건 (2026-05-19)

> **출처**: [output/2026-05-18_q-be-setup-handoff.md §9](../../output/2026-05-18_q-be-setup-handoff.md), [proc/spec/2026-05-18_q-be-api-design.md §3·§5](../spec/2026-05-18_q-be-api-design.md).
> **선행 PR**: #62 (Ph1 schema) → #63 (Ph2 seed). 본 PR base=`feat/q-be-ph2-seed` (stacking).
> **목표**: FE 코드는 그대로 mock 에 붙은 상태 유지. Ph7 에서 점진 교체.

## 작업 항목

### 헬퍼

- [ ] [src/lib/api/user.ts](../../src/lib/api/user.ts) — `resolveUserId(request)` (`x-user-id` 헤더 없으면 `student_001` fallback, Ph8 까지)

### Endpoint (9건, spec §3 응답 형식 준수)

- [ ] [src/app/api/me/route.ts](../../src/app/api/me/route.ts) — User + `dDay` 서버 계산
- [ ] [src/app/api/q/infinity/today/route.ts](../../src/app/api/q/infinity/today/route.ts) — `session` (오늘 KPI: problemsSolved/accuracyToday/hintsUsedToday/estimatedThetaGain), `recentHistory` (최근 5), `recommendedExplains` (shortExplanation 보유 problem 3건)
- [ ] [src/app/api/q/infinity/history/route.ts](../../src/app/api/q/infinity/history/route.ts) — `?limit&offset` 페이지네이션, items + total (메모리 룰: N=10,000+ 가정)
- [ ] [src/app/api/q/analysis/abilities/route.ts](../../src/app/api/q/analysis/abilities/route.ts) — `current` (과목별 최신), `trend` (전체), `diagnosisMeta` (mock fallback — diagnoses 테이블 미존재)
- [ ] [src/app/api/q/analysis/wrong-reasons/route.ts](../../src/app/api/q/analysis/wrong-reasons/route.ts) — `?topN`, `wrongAttemptDiagnoses × solveAttempts` join 후 code aggregate, label 은 mock `wrongReasonCatalog`
- [ ] [src/app/api/q/analysis/recent-mistakes/route.ts](../../src/app/api/q/analysis/recent-mistakes/route.ts) — `?limit`, `solve_attempts.result in ('wrong','partial')` + diagnosis left join
- [ ] [src/app/api/q/review/leitner/route.ts](../../src/app/api/q/review/leitner/route.ts) — overdue / today / byBox / meta (mock `leitnerMeta`)
- [ ] [src/app/api/q/review/memory/route.ts](../../src/app/api/q/review/memory/route.ts) — overdue / today / sourceMeta (mock `memorySourceMeta`)
- [ ] [src/app/api/q/review/error-patterns/route.ts](../../src/app/api/q/review/error-patterns/route.ts) — `error_patterns × leitner_cards` LEFT JOIN GROUP BY → `cardCount` 추가

### 검증

- [ ] `bunx tsc --noEmit`
- [ ] `bun run build`
- [ ] `bun run db:up && bun run db:seed` 한 뒤 `bun dev` → 9 endpoint `curl http://localhost:3031/api/...` 응답 확인
- [ ] `x-user-id: student_001` 없이도 fallback 동작

## 디자인 결정

- **Route handler 는 `export const dynamic = 'force-dynamic'`** — per-user 응답은 캐시 X.
- **응답에 `attemptedAgo`/`daysAgo` 문자열 포함 안 함** — Spec 의 "derived attemptedAgo" 권장이지만 서버측 시간 계산은 timezone drift 위험. ISO timestamp 반환 후 FE 가 상대 시간 표시 담당. (Ph7 migration plan 에서 룰화)
- **`session.totalToday` 같은 목표값** — DB 테이블에 없어 mock 상수 사용 (mock 의 `todaySession.totalToday`). 추후 user_goals 테이블 도입 시 이관.
- **`diagnosisMeta`** — 진단 테이블이 schema 에 없어 mock `lastDiagnosis` 그대로 반환. Ph4+ 진단 history 도입 시 갱신.
- **`wrongReasonCatalog` 의 label** — 정적 catalog (변경 시 코드 수정 필요)이므로 mock import 유지 OK.

## Out of scope

- Write endpoint (Ph4: solve attempt 제출 / leitner box 전이 / theta upsert)
- 인증 (Ph8)
- Ph7 FE migration (mock import → fetch 점진 교체)
- 진단 history 테이블 (Ph4+)
- user_goals 테이블 (totalToday 등 목표값 DB 이관)

## 메모

- PR #62 / #63 머지 후 본 PR 자동 rebase 가능. dev 베이스 동시 OPEN 4개 (#61 / #64 / #62 / #63 / 본 PR).
- Curl 응답 sanity check 결과는 PR description 에 첨부.
