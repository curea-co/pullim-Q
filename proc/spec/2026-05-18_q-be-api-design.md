# 풀림 Q — BE 설계 spec (FE mock → BE 정합)

> 2026-05-18 작성 · BE 1차 정합 입력 · pullim-planner BE-setup 패턴 차용
> 선행 문서: [input/2026-05-18_be-setup-handoff.md](../../input/2026-05-18_be-setup-handoff.md) (sister project handoff)
> 셋업 가이드: [proc/research/2026-05-18_q-be-setup-guide.md](../research/2026-05-18_q-be-setup-guide.md)

---

## 결정 사항

| 항목 | 채택 | 이유 |
|---|---|---|
| 로컬 DB | **PostgreSQL 16** (Docker) | sister project(pullim-planner) 와 동일 패턴 · JSON·array 타입으로 `choices`·`hints` 등 정합 · Vercel Postgres·Supabase·Neon 이식 쉬움 |
| 호스트 포트 | **5433** | planner(5432)와 동시 기동 가능. 컨테이너 내부는 5432 유지 |
| ORM | **Drizzle** | TypeScript-first · SQL-near 표현 · schema-as-code → CLI migration |
| API 스타일 | **Next.js API routes 단일 repo** | 현 repo 그대로 (`/api/q/*`). FE·BE 타입 공유 쉬움 |
| 패키지 매니저 | **bun** (project 기본) | planner 와 동일 |
| 인증 | 1차는 mock 사용자 1명 (`student_001`) 고정 | NextAuth/lucia 도입은 Ph8 별 spec |
| 마이그레이션 | **drizzle-kit** generate + migrate | `bun run db:generate` → SQL diff → `bun run db:migrate` |

---

## 1. Entity 모델 (관계도)

```
                    ┌────────────────────────────────────┐
                    │  User (student_001)                 │
                    │  examDate / focusSubjects / streak  │
                    └────────────┬───────────────────────┘
                                 │
        ┌────────────────────────┼──────────────────────────────┐
        ▼                        ▼                              ▼
┌──────────────────┐  ┌──────────────────┐         ┌──────────────────────┐
│ SolveAttempt     │  │ ThetaSnapshot    │         │ UserCurriculumMastery │
│ (history)        │  │ (subject × time) │         │ (per-user mastery)    │
└────┬─────────────┘  └──────────────────┘         └──────────┬───────────┘
     │ 1:1                                                    │ N:1
     ▼                                                        ▼
┌──────────────────────┐                          ┌──────────────────────┐
│ WrongAttemptDiagnosis│                          │ CurriculumNode       │
│ (FaaS 10-code)       │                          │ (self-ref tree)      │
└──────────────────────┘                          └──────────────────────┘
                                                              ▲ (N:1, set null)
        ┌──────────────────────────────────┐                  │
        ▼                                  ▼                  │
┌──────────────────┐               ┌──────────────────┐       │
│ LeitnerCard      │──N:1─────────▶│ ErrorPattern     │       │
│ (Box 1-5)        │   (set null)  │ (catalog)        │       │
└──────────────────┘               └──────────────────┘       │
                                                              │
                              ┌───────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ MemoryItem       │
                    │ (forgetting Q)   │
                    └──────────────────┘

   ┌──────────────────┐
   │ Problem (sku)    │  ← solve_attempts.sku 가 참조
   │ (SKU master)     │
   └──────────────────┘
```

핵심 도메인:
- **User**: 학생 페르소나 1명 (`student_001`, mock `currentPersona`)
- **CurriculumNode**: 3-depth 교육과정 트리 (mock `allCurricula`, 6 과목)
- **UserCurriculumMastery**: 사용자×노드 마스터리 0~1 (depth-3 만)
- **Problem**: 문제 SKU 마스터 (mock `solveDeck`)
- **SolveAttempt**: 풀이 시도 1건 (mock `solveHistory`)
- **WrongAttemptDiagnosis**: 오답 1건의 FaaS §8.1 10종 진단 (mock `wrongAttemptDiagnoses`)
- **ThetaSnapshot**: IRT θ 시계열 (현재 + 8주 누적, mock `myAbility` + `thetaTrend`)
- **ErrorPattern**: 오답 패턴 카탈로그 (mock `errorPatterns`)
- **LeitnerCard**: 5-box 오답 정복 카드 (mock `leitnerCards`)
- **MemoryItem**: 망각 곡선 복습 큐 (mock `memoryQueue`)

### 1.1 시간 정합 — 왜 절대 timestamp 인가

mock 의 `attemptedAgo: "12분 전"` / `nextReviewInHours: -8` / `daysAgo: 3` 은 *호출 시점* 기준 상대값. BE 에서는 모두 절대 `timestamp with time zone` 으로 저장하고, 표시용 상대값은 서버 응답 시점 또는 클라이언트에서 계산.

→ seed 시 "오늘"을 2026-05-18 12:00 KST 로 고정해 역산.

### 1.2 mastery 를 curriculum_nodes 가 아닌 별 테이블로 분리한 이유

mock 은 `CurriculumNode.mastery` 옵셔널 필드로 박았지만, BE 에선:
- mastery 는 본질적으로 *학생별* 값 — 노드 정의(공용 카탈로그)와 lifecycle 다름
- 멀티 사용자 확장 시 node 행 폭증 / 충돌 방지
- 운영 시 `solve_attempts` aggregation 으로 nightly 재계산 (Ph6+)

→ `user_curriculum_mastery (user_id, node_id) PK` 로 분리.

### 1.3 wrong_attempt_diagnoses 가 sku·correctIndex 를 안 들고 있는 이유

mock 의 `WrongAttemptDiagnosis` 는 `sku`·`selectedIndex`·`correctIndex` 를 중복 보유 (UI 편의). BE 에선 `solve_attempts × problems` join 으로 재구성 가능 → 정규화 차원에서 제거. `summary`·`wrongReasonCodes[]` 만 저장.

### 1.4 problems 와 leitner_cards.problemSku 의 FK 미설정

mock 의 `leitnerCards` 일부 SKU 는 `solveDeck`(=problems seed 출처) 에 없는 미정의 문항(Q-MATH-CALC-0051, Q-ENG-RDG-1189 등). seed 가 깨지지 않도록 `leitner_cards.problem_sku` 는 FK 없이 text 로만 저장. Ph5+ 문제 카탈로그가 정합되면 FK 추가 검토.

---

## 2. DB Schema (Drizzle)

[`src/lib/db/schema.ts`](../../src/lib/db/schema.ts) 참조. 10 테이블 요약:

| 테이블 | PK | 주요 인덱스 | mock 출처 |
|---|---|---|---|
| `users` | `id` | — | `persona.ts > currentPersona` |
| `curriculum_nodes` | `id` | `(subject, depth)`, `parent_id` | `curriculum.ts > allCurricula` |
| `user_curriculum_mastery` | `(user_id, node_id)` | — | `curriculum.ts > node.mastery` |
| `problems` | `sku` | `subject` | `infinity.ts > solveDeck` |
| `error_patterns` | `id` | `code` UNIQUE | `conqueror.ts > errorPatterns` |
| `solve_attempts` | `id` | `(user_id, attempted_at)`, `sku` | `infinity.ts > solveHistory` |
| `wrong_attempt_diagnoses` | `attempt_id` | — | `wrong-reason.ts > wrongAttemptDiagnoses` |
| `theta_snapshots` | `id` | `(user_id, subject, recorded_at)` | `irt.ts > myAbility + thetaTrend` |
| `leitner_cards` | `id` | `(user_id, next_review_at)`, `(user_id, box)` | `conqueror.ts > leitnerCards` |
| `memory_items` | `id` | `(user_id, next_review_at)`, `(user_id, source)` | `memory.ts > memoryQueue` |

마이그레이션 SQL: [`drizzle/0000_easy_exodus.sql`](../../drizzle/0000_easy_exodus.sql)

---

## 3. API 응답 형식 — Ph3 read endpoint

모든 endpoint 는 `Content-Type: application/json`. 헤더 `x-user-id` 미설정 시 `student_001` fallback (Ph8 까지).

### 3.1 `GET /api/me`

```ts
{
  id: 'student_001',
  name: '서연',
  grade: '고2',
  track: '이과',
  examDate: '2026-06-04',
  examLabel: '6월 모의평가',
  focusSubjects: ['math', 'english', 'science'],
  dDay: 17,                        // 서버 계산
  streakDays: 17,
}
```

### 3.2 `GET /api/q/infinity/today`

```ts
{
  session: {                       // mock 의 todaySession
    problemsSolved: 12,
    totalToday: 30,
    accuracyToday: 75,
    estimatedThetaGain: 0.08,
    hintsUsedToday: 4,
  },
  recentHistory: SolveAttempt[],   // 최근 5건 (with derived attemptedAgo)
  recommendedExplains: Problem[],  // 학생 약점 기반 3건
}
```

### 3.3 `GET /api/q/infinity/history?limit=20&offset=0`

페이지네이션 (메모리 룰: N=10,000+ 가정). `SolveAttempt[]` + total.

### 3.4 `GET /api/q/analysis/abilities`

```ts
{
  current: AbilityTheta[],           // 과목별 최신
  trend: ThetaTrendPoint[],          // 8주
  diagnosisMeta: {
    completedAt: '2026-04-22',
    daysAgo: 2,
    durationMin: 18,
    questionsAnswered: 22,
    nextRecommendedIn: 5,
  }
}
```

### 3.5 `GET /api/q/analysis/wrong-reasons?topN=3`

```ts
{ topReasons: { code: WrongReasonCode, count: number, label: string }[] }
```

### 3.6 `GET /api/q/analysis/recent-mistakes?limit=10`

오답·partial 만 + diagnosis join.

### 3.7 `GET /api/q/review/leitner`

```ts
{
  overdue: LeitnerCard[],          // next_review_at < now
  today:   LeitnerCard[],          // < now + 24h
  byBox:   Record<1|2|3|4|5, number>,
  meta:    typeof leitnerMeta,     // 정적
}
```

### 3.8 `GET /api/q/review/memory`

```ts
{
  overdue: MemoryItem[],           // next_review_at < now
  today:   MemoryItem[],
  sourceMeta: typeof memorySourceMeta,
}
```

### 3.9 `GET /api/q/review/error-patterns`

`ErrorPattern[]` 전체 + 카드 개수 join.

---

## 4. 도메인 invariant

- **`users`**: Ph8 까지 단 1행 (`student_001`).
- **`user_curriculum_mastery`**: `(user_id, node_id)` 1행. mastery 0~1. depth-3 노드만 유효 (애플리케이션 레벨 검증).
- **`solve_attempts.result`**: enum `'correct'|'wrong'|'partial'`. `'wrong'`/`'partial'` 만 `wrong_attempt_diagnoses` 매칭 가능.
- **`leitner_cards.box`**: 1~5. streak 가 3 도달 시 box +1 (애플리케이션 규칙, mock `leitnerMeta`).
- **`memory_items.retention`**: 0~1. 베이지안 추정값 (Ph6 재계산 잡).
- **`wrong_attempt_diagnoses.wrongReasonCodes`**: 최대 2개 (FaaS §8.1 hero 카드 노출 제약).
- **`theta_snapshots`**: 같은 `(user_id, subject, recorded_at)` 중복 시도 시 upsert (Ph4 정책).

---

## 5. Phase 로드맵

| Phase | 목표 | 산출 | 상태 |
|---|---|---|---|
| **Ph1** | 스키마 + Docker + spec + setup guide | 본 PR | 진행 중 |
| **Ph2** | mock → DB seed (idempotent) | `scripts/seed.ts` | 다음 PR |
| **Ph3** | Read endpoint 9개 (§3) | `src/app/api/...` | BE 이어받기 |
| **Ph4** | Write — solve attempt 제출 / leitner box 전이 / theta upsert | API + 트랜잭션 | |
| **Ph5** | 오답 패턴 user-별 분리 + 카드 박스 자동 전이 batch | schema 확장 + cron | |
| **Ph6** | mastery·θ nightly aggregation, retention 베이지안 재계산 | scheduled job | |
| **Ph7** | FE 의 `from '@/lib/mock'` import 를 `fetch('/api/q/...')` 로 점진 교체 | FE 작업 | |
| **Ph8** | 인증 (NextAuth v5 vs lucia vs 자체) — 결정 필요 | spec + 구현 | |
| **Ph9** | prod DB (Neon / Supabase / RDS 후보) | infra | |

---

## 6. 미해결 / 결정 보류

- **인증 전략 (Ph8)**: NextAuth v5 / lucia-auth / 자체 구현 — 미결.
- **prod DB (Ph9)**: Neon (serverless Postgres) / Supabase / RDS — 미결.
- **`leitner_cards.problem_sku` FK 추가**: Ph5 문제 카탈로그 정합 후 검토.
- **`error_patterns` user-별 분리**: 멀티 사용자 운영 시 frequency/conquered 분리 필요. Ph5.
- **Connection pooling (prod)**: 현재 `pg.Pool max=10`. serverless(Vercel) 환경에선 pgbouncer 또는 Neon pooling endpoint 검토.
- **마이그레이션 정책**: dev 는 `drizzle-kit migrate`. prod 는 별 release flow 필요.

---

## 7. 참고

- sister project handoff: [input/2026-05-18_be-setup-handoff.md](../../input/2026-05-18_be-setup-handoff.md)
- 전체 tech stack: [proc/spec/09-tech-stack.md](./09-tech-stack.md)
- mock 시드 위치: [proc/spec/06-content-data.md](./06-content-data.md)
