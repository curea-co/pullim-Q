# 풀림 Q — BE 셋업 가이드 (로컬 Docker + Drizzle)

> 2026-05-18 작성 · API 설계: [proc/spec/2026-05-18_q-be-api-design.md](../spec/2026-05-18_q-be-api-design.md)
> sister project handoff (동일 패턴): [input/2026-05-18_be-setup-handoff.md](../../input/2026-05-18_be-setup-handoff.md)

---

## 0. 한 줄 요약

풀림 Q 도메인을 위한 **로컬 BE 인프라**(PostgreSQL 16 on Docker + Drizzle ORM on Next.js API routes)를 깔고, mock 데이터를 DB 에 시드까지 가능한 상태. **FE 코드는 아직 mock 에 붙어 있다** — API 교체는 Ph7 에서.

---

## 1. 아키텍처 — DB 만 Docker, BE 는 host

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

### 1.1 왜 이렇게

- **DB 만 컨테이너**: 버전 고정 · 데이터 격리 · 팀 환경 동일. 컨테이너 재시작이 코드에 영향 0.
- **BE 는 host bun**: hot reload 즉시 (ms), IDE 디버거 그대로.
- `bun run db:*` 는 모두 `docker compose` 또는 `drizzle-kit` 호출 wrapper.

### 1.2 왜 호스트 포트 5433 인가

sister project (**pullim-planner**) 가 5432 를 점유하므로, 같은 머신에서 동시 기동 가능하도록 Q 는 **5433** 으로 매핑. 컨테이너 내부는 표준 5432 유지.

```yaml
# docker-compose.yml
ports:
  - "5433:5432"      # host:container
```

`.env.local` 의 `DATABASE_URL` 도 5433 으로 박혀 있음.

---

## 2. 새 환경에서 처음 한 번 (setup)

```bash
# 1. 의존성
bun install

# 2. 환경 변수
cp .env.example .env.local

# 3. Docker daemon 켜기 (Docker Desktop 또는 OrbStack)
open -a Docker            # OrbStack 사용자는 open -a OrbStack

# 4. DB 컨테이너 + 스키마
bun run db:up             # postgres 컨테이너 기동
bun run db:migrate        # 10 테이블 생성

# 5. (Ph2 이후) seed
bun run db:seed           # mock → DB 삽입

# 6. (선택) Studio 또는 dev server
bun run db:studio         # 테이블 GUI, https://local.drizzle.studio
bun run dev               # FE + (Ph3 이후) API, http://localhost:3031
```

---

## 3. 명령어 cheatsheet

| 명령 | 설명 | 빈도 |
|---|---|---|
| `bun run db:up` | postgres 컨테이너 시작 | 매일 |
| `bun run db:down` | 컨테이너 종료 (데이터 유지) | 가끔 |
| `bun run db:reset` | 컨테이너 + 볼륨 모두 삭제 후 재기동 | 스키마 깨졌을 때 |
| `bun run db:generate` | `schema.ts` 변경분으로 마이그레이션 SQL 생성 | 스키마 수정 시 |
| `bun run db:migrate` | 생성된 SQL 을 DB 에 적용 | 스키마 수정 시 |
| `bun run db:push` | SQL 생략하고 직접 sync (**dev only**) | 빠른 prototyping |
| `bun run db:seed` | mock → DB 시드 (TRUNCATE 후 재삽입) | 데이터 리셋 시 (Ph2) |
| `bun run db:studio` | DB GUI | 데이터 눈으로 볼 때 |
| `bun run dev` | Next.js dev | 매일 |

---

## 4. DB 스키마 한눈에

10 테이블 — 의존 관계:

```
users ──┬─→ user_curriculum_mastery ──→ curriculum_nodes (self-ref tree)
        ├─→ solve_attempts ──→ wrong_attempt_diagnoses (1:1)
        │         └──→ problems (sku)
        ├─→ theta_snapshots
        ├─→ leitner_cards ──→ error_patterns (set null)
        └─→ memory_items ──→ curriculum_nodes (set null)
```

### 4.1 invariant 요약

- **`users`** — Ph8 까지 단 1행 (`student_001`).
- **`user_curriculum_mastery.mastery`** — 0~1. depth-3 노드만 유효 (app 검증).
- **`solve_attempts.result`** — `'correct'|'wrong'|'partial'`.
- **`wrong_attempt_diagnoses.attemptId`** — `solve_attempts.id` 와 1:1 (PK).
- **`leitner_cards.box`** — 1~5. streak 3 도달 시 box +1.
- **`memory_items.retention`** — 0~1.

전체 정의는 [`src/lib/db/schema.ts`](../../src/lib/db/schema.ts) · 모델 표는 [API spec §2](../spec/2026-05-18_q-be-api-design.md).

---

## 5. 자주 부딪힐 이슈 (예상)

| 증상 | 원인 | 조치 |
|---|---|---|
| `docker.sock: no such file` | Docker daemon 안 떠 있음 | `open -a Docker` 후 메뉴바 아이콘 안정될 때까지 대기 |
| `Conflict. container name "/pullim-q-postgres" is already in use` | 이전 잔존 컨테이너 | `docker rm pullim-q-postgres` 또는 `bun run db:reset` |
| `bind: address already in use` (5433) | 다른 프로세스가 5433 점유 | `lsof -i:5433` 확인 후 정리, 또는 `docker-compose.yml` 포트 변경 |
| `DATABASE_URL is not set` (seed) | `.env.local` 미생성 | `cp .env.example .env.local` |
| `connection refused` (migrate) | 컨테이너 health 체크 전에 접근 | `docker ps` 로 `(healthy)` 확인 후 재시도 (보통 5-10s) |
| Drizzle Studio "Connecting…" 무한 스피너 (Safari/Brave) | localhost 자체서명 인증서 차단 | `brew install mkcert` → `mkcert -install` → studio 재시작. Chrome/Arc/Firefox 는 그냥 됨 |
| Next.js connection pool 누수 (hot reload) | dev 모드에서 module re-eval 시 Pool 중복 생성 | [`src/lib/db/index.ts`](../../src/lib/db/index.ts) 의 `globalThis.__pullim_q_pg_pool` cache 가 처리 |
| `bun install` 시 `drizzle-kit` 버전 못 찾음 | npm 에 명시한 minor 가 아직 없음 | latest 확인: `npm view drizzle-kit version` → package.json 갱신 |

---

## 6. 다음 차례 — Phase 3 (read endpoint)

[API spec §3](../spec/2026-05-18_q-be-api-design.md) 9 endpoint 참조.

### 권장 작업 흐름
1. `src/app/api/me/route.ts` 부터. 가장 단순 (테이블 1개).
2. `infinity/today` → `infinity/history` → `analysis/*` → `review/*` 순.
3. 응답 형식은 spec §3 그대로 따른다.
4. 헤더 `x-user-id` 미설정 시 `student_001` fallback (Ph8 까지 유지).
5. 검증:
   ```bash
   curl http://localhost:3031/api/me
   curl http://localhost:3031/api/q/infinity/today
   ```

### Sample endpoint skeleton

```ts
// src/app/api/me/route.ts
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const FALLBACK_USER_ID = 'student_001';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') ?? FALLBACK_USER_ID;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const dDay = Math.ceil(
    (new Date(user.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return NextResponse.json({ ...user, dDay });
}
```

---

## 7. 관련 파일

```
pullim-Q/
├── docker-compose.yml                          # Postgres 컨테이너 정의 (5433:5432)
├── drizzle.config.ts                           # Drizzle Kit 설정
├── .env.example                                # DATABASE_URL 템플릿
├── drizzle/
│   ├── 0000_easy_exodus.sql                    # 초기 마이그레이션 (10 테이블)
│   └── meta/                                   # snapshot, _journal
├── scripts/
│   └── seed.ts                                 # mock → DB seed (Ph2)
├── src/lib/db/
│   ├── schema.ts                               # 10 테이블 + relations + 추론 타입
│   └── index.ts                                # Pool + drizzle client (hot reload cache)
└── proc/
    ├── spec/2026-05-18_q-be-api-design.md      # 10 entity · 9 endpoint · 9-phase roadmap
    └── research/2026-05-18_q-be-setup-guide.md # ← 이 문서
```
