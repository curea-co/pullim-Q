# 풀림 Q BE 셋업 · 핸드오프

> **문서 버전**: v1.0 · 2026-05-18
> **대상 독자**: BE 작업을 이어받을 개발자 (+ 미래의 자기 자신)
> **선행 문서**: [`proc/spec/2026-05-18_q-be-api-design.md`](../proc/spec/2026-05-18_q-be-api-design.md) (API 설계) · [`proc/research/2026-05-18_q-be-setup-guide.md`](../proc/research/2026-05-18_q-be-setup-guide.md) (셋업 가이드)
> **참고 (sister project handoff)**: [`input/2026-05-18_be-setup-handoff.md`](../input/2026-05-18_be-setup-handoff.md)

---

## 1. 한 줄 요약

풀림 Q 도메인을 위한 **로컬 BE 인프라**(PostgreSQL 16 on Docker + Drizzle ORM on Next.js API routes) 를 깔고, mock 데이터를 그대로 DB 에 시드하는 단계까지 완료. **FE 코드는 아직 mock 에 붙어 있다** — API 교체는 Ph7 에서.

---

## 2. 오늘 한 일 (2026-05-18)

| Phase | PR | 내용 |
|---|---|---|
| **Ph1** | #62 | Drizzle 스키마 10 테이블 · Docker Compose (5433) · API spec · setup guide |
| **Ph2** | (본 PR) | mock → DB seed 스크립트 (`bun run db:seed`, idempotent) |

### Ph1 산출물
- [`drizzle.config.ts`](../drizzle.config.ts)
- [`docker-compose.yml`](../docker-compose.yml) — Postgres 16-alpine (호스트 5433, planner 5432 와 동시 기동 가능)
- [`src/lib/db/schema.ts`](../src/lib/db/schema.ts) — 10 테이블 + relations + 추론 타입
- [`src/lib/db/index.ts`](../src/lib/db/index.ts) — Pool client (Next.js hot reload 누수 방지 `globalThis` cache)
- [`drizzle/0000_easy_exodus.sql`](../drizzle/0000_easy_exodus.sql) — 초기 마이그레이션
- [`.env.example`](../.env.example) — `DATABASE_URL` 템플릿

### Ph2 산출물
- [`scripts/seed.ts`](../scripts/seed.ts) — 10 테이블 idempotent seed

---

## 3. 아키텍처 — DB 만 Docker, BE 는 host

```
┌─── 개발자 머신 (host) ─────────────────┐
│  Next.js dev (bun run dev :3031)
│    ├─ FE pages /q/*
│    ├─ API routes /api/q/*       (Ph3~ 구현 예정)
│    └─ drizzle-kit (generate/migrate/studio)
│           │ pg connection
│           ▼
│  Docker Engine
│    └─ pullim-q-postgres (Postgres 16-alpine, host:5433 → container:5432)
│       volume: ./.docker/postgres   (gitignored)
└────────────────────────────────────────┘
```

**왜 5433** — sister project pullim-planner 가 5432 점유. 같은 머신 동시 기동 가능하도록 5433 매핑. 자세한 배경은 [setup guide §1.2](../proc/research/2026-05-18_q-be-setup-guide.md).

---

## 4. 새 환경에서 처음 한 번 (setup)

```bash
bun install
cp .env.example .env.local
open -a Docker            # Docker daemon 켜기

bun run db:up             # postgres 컨테이너 기동
bun run db:migrate        # 10 테이블 생성
bun run db:seed           # mock 데이터 삽입

bun run db:studio         # 테이블 GUI, https://local.drizzle.studio
bun run dev               # FE + (Ph3 이후) API, http://localhost:3031
```

---

## 5. 명령어 cheatsheet

| 명령 | 설명 | 빈도 |
|---|---|---|
| `bun run db:up` | postgres 컨테이너 시작 | 매일 |
| `bun run db:down` | 컨테이너 종료 (데이터 유지) | 가끔 |
| `bun run db:reset` | 컨테이너 + 볼륨 모두 삭제 후 재기동 | 스키마 깨졌을 때 |
| `bun run db:generate` | `schema.ts` 변경분으로 마이그레이션 SQL 생성 | 스키마 수정 시 |
| `bun run db:migrate` | 생성된 SQL 을 DB 에 적용 | 스키마 수정 시 |
| `bun run db:push` | SQL 생략하고 직접 sync (**dev only**) | 빠른 prototyping |
| `bun run db:seed` | mock → DB 시드 (TRUNCATE 후 재삽입) | 데이터 리셋 시 |
| `bun run db:studio` | DB GUI | 데이터 눈으로 볼 때 |
| `bun run dev` | Next.js dev | 매일 |

---

## 6. DB 스키마 한눈에

10 테이블 — 의존 관계:

```
users ──┬─→ user_curriculum_mastery ──→ curriculum_nodes (self-ref tree)
        ├─→ solve_attempts ──→ wrong_attempt_diagnoses (1:1)
        │         └──→ problems (sku)
        ├─→ theta_snapshots
        ├─→ leitner_cards ──→ error_patterns (set null)
        └─→ memory_items ──→ curriculum_nodes (set null)
```

### 6.1 주요 invariant
- **`users`** — Ph8 까지 단 1행 (`student_001`).
- **`user_curriculum_mastery.mastery`** — 0~1. depth-3 노드만 유효 (app 검증).
- **`solve_attempts.result`** — `'correct'|'wrong'|'partial'`.
- **`wrong_attempt_diagnoses.attemptId`** — `solve_attempts.id` 와 1:1 (PK).
- **`leitner_cards.box`** — 1~5.
- **`memory_items.retention`** — 0~1.

전체 정의는 [`src/lib/db/schema.ts`](../src/lib/db/schema.ts) · 모델 표는 [API spec §2](../proc/spec/2026-05-18_q-be-api-design.md).

---

## 7. seed 가 넣는 데이터 (기준 시각: 2026-05-18 12:00 KST)

| 테이블 | 건수 | 비고 |
|---|---|---|
| `users` | 1 | 서연 (`student_001`) — `currentPersona` |
| `curriculum_nodes` | 151 | 6 과목 트리 flatten, depth 1→2→3 순으로 삽입 (FK 만족) |
| `user_curriculum_mastery` | 17 | mock 노드의 mastery 값 추출, `student_001` 키로 분리 |
| `error_patterns` | 5 | mock `errorPatterns` |
| `problems` | 11 | solveDeck 5 (full) + 6 placeholder (solveHistory·diagnoses 의 SKU 보강) |
| `solve_attempts` | 12 | solveHistory 8 + 합성 4 (h9~h12, diagnosis FK 용) |
| `wrong_attempt_diagnoses` | 7 | mock `wrongAttemptDiagnoses` |
| `theta_snapshots` | 24 | 현재 3 (myAbility) + 8주 trend (math/eng/sci × 7 weeks) |
| `leitner_cards` | 11 | mock `leitnerCards`. `nextReviewInHours` → 절대 timestamp |
| `memory_items` | 7 | mock `memoryQueue`. `daysAgo` + `nextReviewInHours` → 절대 timestamp |

seed 는 **idempotent** — 매 실행마다 10 테이블 TRUNCATE RESTART IDENTITY CASCADE 후 재삽입.

> ⚠ mock 의 `curriculumNodeId` 중 일부가 트리에 없으면 seed 가 `null` 로 떨어뜨림 ([scripts/seed.ts](../scripts/seed.ts) §10).

> ⚠ 합성 attempt (h9~h12) 는 wrongAttemptDiagnoses 의 풍부한 코드 분포를 보존하기 위해 placeholder 로 삽입 — `result='wrong'`, `timeSec=0`, `attemptedAt = NOW - (3 + 2N) days`.

---

## 8. 자주 부딪힐 이슈

| 증상 | 원인 | 조치 |
|---|---|---|
| `docker.sock: no such file` | Docker daemon 안 떠 있음 | `open -a Docker` 후 메뉴바 아이콘이 안정될 때까지 대기 |
| `Conflict. container name "/pullim-q-postgres" is already in use` | 이전 잔존 컨테이너 | `docker rm pullim-q-postgres` 또는 `bun run db:reset` |
| `bind: address already in use` (5433) | 다른 프로세스가 5433 점유 | `lsof -i:5433` 확인 후 정리, 또는 `docker-compose.yml` 포트 변경 |
| `DATABASE_URL is not set` (seed) | `.env.local` 미생성 | `cp .env.example .env.local` |
| `violates foreign key constraint "solve_attempts_sku_problems_sku_fk"` | mock SKU 가 problems 에 없음 | seed §5-b 가 자동 보강. 새 SKU 추가 시 placeholder 로직 검토 |
| Drizzle Studio "Connecting…" 무한 스피너 (Safari/Brave) | localhost 자체서명 인증서 차단 | `brew install mkcert` → `mkcert -install` → studio 재시작. Chrome/Arc/Firefox 는 그냥 됨 |
| Next.js connection pool 누수 (hot reload) | dev 모드에서 module re-eval 시 Pool 중복 생성 | [`src/lib/db/index.ts`](../src/lib/db/index.ts) 의 `globalThis.__pullim_q_pg_pool` cache 가 처리 |

---

## 9. 다음 차례 — Phase 3 (read endpoint)

[`proc/spec/2026-05-18_q-be-api-design.md` §5](../proc/spec/2026-05-18_q-be-api-design.md) 로드맵 참조.

### 구현 대상 (9 endpoint)

| 메서드 · 경로 | 의미 | DB 쿼리 힌트 |
|---|---|---|
| `GET /api/me` | 현재 사용자 + D-day | `db.select().from(users).where(eq(users.id, userId))` |
| `GET /api/q/infinity/today` | 오늘 풀이 KPI + 최근 히스토리 + 추천 해설 | `solve_attempts` 집계 + `problems` join |
| `GET /api/q/infinity/history?limit=20&offset=0` | 풀이 이력 (페이지네이션) | `where(eq(userId)).orderBy(desc(attemptedAt))` |
| `GET /api/q/analysis/abilities` | 과목별 θ 현재 + 8주 trend | `theta_snapshots` GROUP BY subject |
| `GET /api/q/analysis/wrong-reasons?topN=3` | 오답 코드 빈도 Top N | `wrong_attempt_diagnoses` GROUP BY |
| `GET /api/q/analysis/recent-mistakes?limit=10` | 최근 오답 + diagnosis join | `solve_attempts × wrong_attempt_diagnoses` |
| `GET /api/q/review/leitner` | overdue + today + box 분포 | `leitner_cards` filter on `nextReviewAt` |
| `GET /api/q/review/memory` | overdue + today (망각 곡선) | `memory_items` filter on `nextReviewAt` |
| `GET /api/q/review/error-patterns` | 오답 패턴 + 카드 수 join | `error_patterns × leitner_cards` GROUP BY |

### 권장 작업 흐름
1. `src/app/api/me/route.ts` 부터. 가장 단순 (테이블 1개).
2. `infinity/today` → `infinity/history` → `analysis/*` → `review/*` 순.
3. 응답 형식은 [API spec §3](../proc/spec/2026-05-18_q-be-api-design.md) 정의를 따른다.
4. 헤더 `x-user-id` 가 없으면 `student_001` 로 fallback (Ph8 까지 유지).
5. 검증: `curl http://localhost:3031/api/me`.

### 이후
- **Ph4**: write — solve attempt 제출 / leitner box 전이 / theta upsert (트랜잭션)
- **Ph5**: 오답 패턴 user-별 분리 + 카드 박스 자동 전이 batch
- **Ph6**: mastery·θ nightly aggregation, retention 베이지안 재계산
- **Ph7**: FE 의 `from '@/lib/mock'` import → `fetch('/api/q/...')` 점진 교체
- **Ph8**: 인증 (NextAuth v5 / lucia / 자체 — 결정 필요)
- **Ph9**: prod DB (Neon / Supabase / RDS 중 결정)

---

## 10. 관련 파일 한눈에

```
pullim-Q/
├── docker-compose.yml                          # Postgres 컨테이너 정의 (5433:5432)
├── drizzle.config.ts                           # Drizzle Kit 설정
├── .env.example                                # DATABASE_URL 템플릿
├── drizzle/
│   ├── 0000_easy_exodus.sql                    # 초기 마이그레이션 (10 테이블)
│   └── meta/                                   # snapshot, _journal
├── scripts/
│   └── seed.ts                                 # mock → DB seed (idempotent)
├── src/lib/db/
│   ├── schema.ts                               # 10 테이블 + relations
│   └── index.ts                                # Pool + drizzle client
├── input/
│   └── 2026-05-18_be-setup-handoff.md          # sister project (pullim-planner) 참고 handoff
├── proc/
│   ├── spec/2026-05-18_q-be-api-design.md      # 10 entity · 9 endpoint · 9-phase 로드맵
│   └── research/2026-05-18_q-be-setup-guide.md # 셋업 디테일 + 트러블슈팅
└── output/
    └── 2026-05-18_q-be-setup-handoff.md        # ← 이 문서
```

---

## 11. 한 발짝 더 — 미해결 · 결정 보류

- **인증 전략 (Ph8)**: NextAuth.js v5 / lucia-auth / 자체 구현 — 미결.
- **prod DB 선택 (Ph9)**: Neon / Supabase / RDS — 미결.
- **`leitner_cards.problem_sku` FK 추가**: Ph5 문제 카탈로그 정합 후 검토.
- **`error_patterns` user-별 분리**: 멀티 사용자 운영 시 frequency/conquered 분리 필요. Ph5.
- **마이그레이션 정책**: 현재는 dev/prod 모두 `drizzle-kit migrate`. prod 에선 별 release flow 필요.
- **Connection pooling (prod)**: 현재 `pg.Pool max=10`. serverless 환경(Vercel) 에선 pgbouncer 또는 Neon pooling endpoint 검토 필요.
