# 2026-05-27 — pullim-planner 정렬 plan (Q 도메인 적응)

> 정본: [pullim-planner](https://github.com/curea-co/pullim-planner) 의 두 plan
> - [2026-05-26_pullim-be-adoption.md](https://github.com/curea-co/pullim-planner/blob/dev/proc/plan/2026-05-26_pullim-be-adoption.md) — BE Phase α~η
> - [2026-05-26_container-presenter-adoption.md](https://github.com/curea-co/pullim-planner/blob/dev/proc/plan/2026-05-26_container-presenter-adoption.md) — FE Container/Presenter Phase 1~5
>
> 정렬 목표: `pullim-Q` 가 pullim-planner 의 BE/FE 패턴을 그대로 채택하되, Q 도메인 특수성(drizzle 잔존·infinity/coach/conqueror/memory/xray/irt/phase1 등 분석 도메인 다발·exam 모드)을 반영해 적응시킨다.

## 1. 목표

**최종 모습** — pullim-planner 와 같은 형태:

- `apps/q/` FE 가 **Container/Presenter + `features/<domain>/`** 컨벤션을 따른다 (`components/{infinity,coach,conqueror,memory,xray,study-index,analysis,question-hub}/` 8 폴더를 `components/features/q-*/` 로 재편)
- `apps/backend/` BE 가 **NestJS 11 + TypeORM 0.3 + clean architecture** (controller / use-cases / service / interface / infrastructure) + **`common/` 토대**(bootstrap·filters·guards·interceptors·swagger)를 보유
- `apps/q/drizzle*`, `apps/q/lib/db/`, `apps/q/app/api/` 를 **완전 폐기**하고 BE 가 `apps/backend/src/modules/q/` 단일 집결지로 전환
- `apps/q/lib/mock/` 의 13 시그니처 전체에 대응하는 entity / repository / service / use-case / controller 보유 (Q-FE 의 mock 직접 import 0건이 종착점, FE 는 `@pullim-q/api-client` 만 사용)
- 루트 `CLAUDE.md`·`AGENTS.md`·`apps/q/CLAUDE.md`·`apps/q/AGENTS.md`·`apps/backend/CLAUDE.md`(신규) 가 새 구조·컨벤션을 반영

**완료 기준** (이 plan 전체):

- `find apps/q/components/features -type d` 가 `q-home / q-infinity / q-coach / q-conqueror / q-memory / q-xray / q-study-index / q-analysis / q-question-hub` 폴더를 반환
- `grep -r "from '@/lib/mock" apps/q/components apps/q/app` 결과 0건
- `rg "drizzle-orm" apps/q` 결과 0건 (서브패스 `drizzle-orm/pg-core`·`drizzle-orm/node-postgres` 포함)
- `apps/backend/src/modules/q/` 가 read+mutation endpoint 전체에 대해 use-case+service+repository 분리 보유
- `bun run typecheck` 5 워크스페이스 전부 통과 (`@pullim-q/{q,backend,types,api-client,auth}`) + `bun run lint && bun run test` 는 `apps/{q,backend}` 2 워크스페이스 통과 (`packages/*` 는 typecheck 만 — planner 기준과 동일)
- `proc/spec/2026-05-18_q-be-api-design.md` §결정 사항의 ORM 행이 **TypeORM 0.3**, API 스타일 행이 **NestJS 11 — apps/backend** 로 갱신

---

## 2. 배경 — 컨텍스트

### 2.1 D-Lite 직전 상태 (현재)

`refactor/monorepo-migration` 머지 이후 본 plan 진입 시점 스냅샷:

| 항목 | 상태 |
|---|---|
| mini-monorepo (`apps/{q,backend}` + `packages/{api-client,auth,types}`) | 완료 |
| Jest 셋업 | 부분 — `apps/q/jest.config.ts` 만 (backend·packages 측 Jest 설정·테스트 파일 부재, Phase β/δ 등에서 신규 추가 필요) |
| drizzle ORM | **잔존** — `apps/q/drizzle/`, `apps/q/drizzle.config.ts`, `apps/q/lib/db/{schema,index}.ts` (10 tables) |
| Next.js API routes | **잔존** — `apps/q/app/api/me/route.ts`, `/api/q/{analysis,review,infinity}/...` 9건 (drizzle 직접 호출) |
| FE mock | **잔존** — `apps/q/lib/mock/{persona,curriculum,features,domains,memory,irt,tutor,conqueror,infinity,coach,xray,phase1,wrong-reason}.ts` 13개 |
| Container/Presenter | **미도입** — 모든 페이지가 `'use client'` + mock 직접 import |
| `apps/backend/` 내용 | NestJS skeleton 만 (`main.ts`, `app.module.ts`, `app.controller.ts`) — 도메인 모듈 0건 |
| `packages/{types,api-client,auth}` | 빈 placeholder (`src/index.ts` exports 만) |
| port | q FE 3031, backend 4031, Postgres 5433 (planner 와 충돌 회피) |

### 2.2 planner 와의 핵심 차이 (적응 포인트)

| 축 | pullim-planner | pullim-Q |
|---|---|---|
| 도메인 수 | **1개** (planner) | **8개** (infinity / coach / conqueror / memory / xray / study-index / analysis / question-hub) |
| ORM 시작점 | drizzle 자산 4 PR 누적 (Ph1~Ph4) | drizzle 자산 자체는 비슷, 그러나 **read endpoint 9 + mutation 0** (planner 는 read 3 + mutation 6) |
| FE 페이지 수 | 6 페이지 (manage·new·edit·planner·onboarding·reports) | **16 페이지** (q hub + 4 도메인 index + 11 sub-route) |
| 800줄급 logic 보유 | `manage/[id]/edit/page.tsx` 239줄 최대 | `infinity/solve/page.tsx` **643줄** + `review/page.tsx` 440줄 + `review/conquer/page.tsx` 338줄 + `review/memory/[id]/page.tsx` 328줄 + `q/page.tsx` 326줄 |
| 특수 UI 모드 | (없음) | **exam mode** — `infinity/solve` 가 풀이/시험 토글, 시험 모드는 AI 코치·힌트·해설 차단 (시험 종료까지 Container 가 진입 가드 보유) |
| 분석 도메인 깊이 | (없음) | **IRT θ / 메타인지 / 시간분포 / 추측탐지** — `xray` + `study-index` + `analysis` 가 한 도메인 묶음 |

### 2.3 planner 가 채택한 결정 — 본 plan 에서도 그대로 차용

- **옵션 A 응답 envelope** (`{success, data}` / `{success, error}`) — planner 2026-05-26 G3 게이트 해소 결정 그대로
- **bun 유지 + workspace** — pnpm 분기 안 함. NestJS 호환 spike 는 Phase β 진입 직후 30분
- **MockAuthGuard** — `X-User-Id` 헤더 → fallback `student_001`. `packages/auth` MockAuthProvider 추상화 위에 헤더 가드. 인증 ph 미차용
- **Cls 채택, Redis·JWT·BullMQ 보류**
- **Data Mapper TypeORM**
- **에러 코드 도메인 prefix 대문자** (`Q_INFINITY_NOT_FOUND`, `Q_MEMORY_VALIDATION_FAILED`, ...) — planner 의 `PLANNER_*` 자리에 Q 도메인 prefix

---

## 3. 현 상태 vs planner 갭 매트릭스

| 항목 | planner 상태 (정본) | Q 현 상태 | 갭 크기 |
|---|---|---|---|
| **모노레포** (`apps/*` + `packages/*` + turbo + bun workspace) | 완료 | 완료 (D-Lite) | 0 |
| **Jest** (4 워크스페이스) | 완료 | 완료 (D-Lite) | 0 |
| **shadcn 컨벤션** (`@/components/ui/*` + `cn`) | 완료 (단, planner 는 `@pullim/design-system` 계획) | 완료 (`apps/q/components/ui/` 17개) | 0 — Q 는 DS 도입 비목표 |
| **Container/Presenter** (`features/<domain>/{containers,presenters,components,hooks}/`) | Phase 1~3 완료 (planner-reports, planner-manage, planner-home, planner-onboarding) | **0건** — `components/{infinity,coach,...}/` 평면 구조, 페이지가 mock·router·state 직접 보유 | **대형 갭** — Phase 1~5 전체 적용 필요 |
| **BE common 패턴** (`apps/backend/src/common/{bootstrap,filters,interceptors,guards,decorators,dto,swagger,validation-messages,utils,interfaces,infrastructure}/`) | Phase β 완료 | **부재** — NestJS skeleton 만 | **대형 갭** — Phase β 통째 |
| **BE entity** (`apps/backend/src/entities/*.entity.ts` + TypeORM 0.3 migrations) | Phase γ 완료 (9 entity) | **부재** — drizzle 10 tables 만 잔존 | **대형 갭** — Phase γ 통째 |
| **BE 도메인 모듈** (`apps/backend/src/modules/<domain>/{controller,use-cases,service,interface,infrastructure}/`) | planner 1개 모듈 read 3 + mutation 6 완료 (Phase δ·ε) | **부재** | **대형 갭** — Q 는 4 모듈 (`infinity`, `analysis`, `review`, `coach`) read 9 + mutation 0~N |
| **drizzle → TypeORM 이식** | 완료 (스키마 byte-equal diff 0) | **미시작** — drizzle 잔존, TypeORM 미도입 | **대형 갭** |
| **FE mock 제거** | Phase η 진행 중 (`@pullim-planner/api-client` 전환) | **미시작** — 페이지·컴포넌트가 `@/lib/mock` 직접 import | **대형 갭** |
| **`@vercel/analytics`** | 일부 도입 (planner FE) | **미도입** | 비목표 — 별 트랙 |
| **앱별 docs** (`apps/{q,backend}/CLAUDE.md`, `AGENTS.md`) | `apps/planner/CLAUDE.md`, `AGENTS.md` 완비 | `apps/q/CLAUDE.md`·`AGENTS.md` 완비 (D-Lite). `apps/backend/CLAUDE.md` **부재** | 소형 — Phase β PR 에 동봉 |
| **응답 envelope** (`{success, data}` / `{success, error}` + ResponseInterceptor + 2 Filter) | 옵션 A 채택, 적용 완료 | **불일치** — 현 `apps/q/app/api/*` 의 raw JSON (`{ data: T }` / `{ error: {...} }`) | 중형 — Phase β 에서 일괄 |

---

## 4. 비목표 (scope out)

- **`@pullim/design-system` 도입** — Q 는 자체 shadcn/ui + Base UI 로컬 프리미티브 사용. DS 차용은 별 트랙 (`apps/q/CLAUDE.md` 명시)
- **i18n / next-intl 도입** — `apps/q/CLAUDE.md` 에 "한국어 하드코딩 허용" 명문화됨. 본 plan 범위 밖
- **Sentry / `@pullim/analytics` / `@pullim/remote-config`** — 미설치 유지 (`apps/q/CLAUDE.md` §관측 미도입)
- **AWS ECS · 배포 인프라** — 별 트랙
- **Q 외 새 도메인 추가** (user / workbook / lecture / payment 등 — pullim 정본 도메인) — planner 정렬이 끝난 다음 트랙
- **mock 의 의미 변경** — 본 plan 은 mock 시그니처 → entity 매핑이지, mock 데이터의 의미·구조를 재설계하는 작업이 아님 (mock 은 entity 매핑이 끝나기 전까지 진실의 원천)
- **`packages/design-tokens` 류 분리** — `apps/q/lib/tokens/` 잔존, Q 단일 도메인 락인이라 패키지화 ROI 낮음
- **실인증** (NextAuth / Passport JWT / RLS) — MockAuthGuard 유지
- **Redis · BullMQ · 외부 큐** — 미도입

---

## 5. 최종 디렉터리 구조 (after)

```
pullim-Q/
├── apps/
│   ├── q/                                  # Next.js 16 (port 3031)
│   │   ├── app/
│   │   │   ├── (student)/q/
│   │   │   │   ├── page.tsx                # <Suspense><QHubContainer /></Suspense>
│   │   │   │   ├── infinity/
│   │   │   │   │   ├── page.tsx            # <InfinityHomeContainer />
│   │   │   │   │   ├── solve/page.tsx      # <SolveContainer />  (← 643줄 분리)
│   │   │   │   │   ├── explain/page.tsx
│   │   │   │   │   ├── history/page.tsx
│   │   │   │   │   └── exam-result/page.tsx
│   │   │   │   ├── talk/page.tsx           # <CoachContainer />
│   │   │   │   ├── analysis/
│   │   │   │   │   ├── page.tsx            # <AnalysisIntroContainer />
│   │   │   │   │   ├── diagnose/page.tsx   # <DiagnoseContainer />
│   │   │   │   │   ├── ability/page.tsx
│   │   │   │   │   ├── process/page.tsx
│   │   │   │   │   └── [questionId]/page.tsx
│   │   │   │   └── review/
│   │   │   │       ├── page.tsx            # <ReviewHubContainer /> (← 440줄)
│   │   │   │       ├── conquer/page.tsx    # <ConquerContainer /> (← 338줄)
│   │   │   │       ├── queue/page.tsx
│   │   │   │       └── memory/[id]/page.tsx (← 328줄)
│   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── q-infinity/{containers,presenters,components,hooks}/
│   │   │   │   ├── q-coach/{containers,presenters,components}/
│   │   │   │   ├── q-conqueror/{containers,presenters,components}/
│   │   │   │   ├── q-memory/{containers,presenters,components}/
│   │   │   │   ├── q-xray/{containers,presenters,components}/
│   │   │   │   ├── q-study-index/{containers,presenters,components}/
│   │   │   │   ├── q-analysis/{containers,presenters,components}/
│   │   │   │   ├── q-question-hub/{containers,presenters,components}/
│   │   │   │   └── q-home/{containers,presenters,components}/  # /q hub 326줄
│   │   │   ├── shared/                      # 진짜 순수 뷰만 (Q 도 비어 시작)
│   │   │   ├── shell/                       # AppHeader/AppSidebar/BottomNav/PageHeader 등 13개
│   │   │   ├── ui/                          # shadcn 17개
│   │   │   └── brand/                       # 1개
│   │   ├── lib/{tokens,utils.ts,review,store,motion,api}/
│   │   ├── (drizzle/, drizzle.config.ts, lib/db/, lib/mock/, app/api/ — Phase γ~η 진행에 따라 폐기)
│   │   ├── next.config.ts / eslint.config.mjs / jest.config.ts / tsconfig.json
│   │   └── package.json (@pullim-q/q)
│   └── backend/                            # NestJS 11 (port 4031)
│       ├── src/
│       │   ├── common/{bootstrap,filters,guards,interceptors,decorators,dto,swagger,validation-messages,utils,subscribers,interfaces,infrastructure,constants}/
│       │   ├── config/{database,timezone,swagger}.config.ts
│       │   ├── database/{data-source.ts, database.module.ts, migrations/, seeds/}
│       │   ├── entities/
│       │   │   ├── user.entity.ts
│       │   │   ├── curriculum-node.entity.ts
│       │   │   ├── user-curriculum-mastery.entity.ts
│       │   │   ├── problem.entity.ts
│       │   │   ├── error-pattern.entity.ts
│       │   │   ├── solve-attempt.entity.ts
│       │   │   ├── wrong-attempt-diagnosis.entity.ts
│       │   │   ├── theta-snapshot.entity.ts
│       │   │   ├── leitner-card.entity.ts
│       │   │   └── memory-item.entity.ts
│       │   ├── modules/q/
│       │   │   ├── infinity/{controller, use-cases, service, interface, infrastructure}/
│       │   │   ├── analysis/{controller, use-cases, service, interface, infrastructure}/
│       │   │   ├── review/{controller, use-cases, service, interface, infrastructure}/
│       │   │   ├── coach/{controller, use-cases, service, interface, infrastructure}/  # tutor mock 시그니처 흡수
│       │   │   ├── me/{controller, use-cases, service}/
│       │   │   └── q.module.ts             # 4 sub-module + me aggregator
│       │   ├── app.controller.ts / app.module.ts / main.ts
│       ├── test/
│       ├── nest-cli.json / tsconfig.json / tsconfig.build.json / eslint.config.mjs
│       ├── CLAUDE.md (신규 — Phase β PR 에 동봉)
│       └── package.json (@pullim-q/backend)
├── packages/
│   ├── types/                              # Q 도메인 BE↔FE 공유 타입
│   │   └── src/{index.ts, infinity.ts, analysis.ts, review.ts, coach.ts, persona.ts, curriculum.ts, irt.ts}
│   ├── api-client/                         # fetch 래퍼 + Q endpoint 함수
│   │   └── src/{index.ts, infinity.ts, analysis.ts, review.ts, coach.ts, me.ts, envelope.ts}
│   └── auth/                               # IAuthProvider + MockAuthProvider
│       └── src/{index.ts, types.ts, service.ts, providers/mock.ts}
├── proc/                                   # 그대로
├── input/                                  # 그대로
├── docker-compose.yml                      # Postgres 5433 그대로
├── turbo.json / tsconfig.base.json / package.json / bun.lock
├── CLAUDE.md / AGENTS.md / README.md
```

폐기 대상 (각 Phase 에서 단계적 제거):

- Phase γ 머지 시: `apps/q/drizzle/`, `apps/q/drizzle.config.ts` (마이그레이션 자산만 — TypeORM 으로 byte-equal 이식 완료 후) + 같은 PR 에서 `apps/q/package.json` 의 `db:generate` / `db:migrate` / `db:push` / `db:studio` / `db:seed` 스크립트 제거 + `apps/q/scripts/seed.ts` 제거 (또는 `apps/backend/src/database/seeds/` 로 이식) — drizzle-kit 의존 스크립트가 잔존하면 PR 머지 직후 깨지므로 한 묶음
- Phase η 완료 시 (PR 마지막 단계, 동일 PR 내): `apps/q/app/api/` 전체 + `apps/q/lib/db/{schema,index}.ts` + `apps/q/lib/mock/` 전체 — 셋은 **한 묶음**으로 제거 (`apps/q/app/api/*/route.ts` 가 `@/lib/db` 와 `drizzle-orm` 을 직접 import 하므로, lib/db 만 먼저 빼면 route 가 즉시 깨짐)
- **Phase η 완료 직후** (드리즐 직접 호출이 모두 사라진 시점): `apps/q/package.json` 의 `drizzle-orm` / `drizzle-kit` / `pg` / `@types/pg` 제거 — Phase α·β·γ 단계에서는 **제외** (drizzle 자산이 여전히 import 되는 동안 의존성을 빼면 빌드가 실패함)

---

## 6. Phase 분할 — Q 에 적응한 단계

각 Phase = 1 PR (Phase 2 와 Phase γ 는 1~2 PR 분할 가능). Codex Review 통과 필수 (사용자 메모리 룰).

### FE Container/Presenter 트랙 (planner Phase 1~5 대응)

#### Phase 1 — 컨벤션 문서화 + 파일럿 1 페이지 (PR #1)

가장 작은 페이지로 패턴 검증. Q 에서 80줄+ 미만이지만 도메인 로직이 명확한 후보:

- 후보 평가:
  - `q/analysis/page.tsx` (17줄, 컴포넌트 5개 mount 만) — **너무 thin, 검증 가치 낮음**
  - `q/talk/page.tsx` (24줄, 코치 chat 마운트) — **너무 thin**
  - `q/analysis/process/page.tsx` (58줄, mock import 1개 — `lastDiagnosis`) — **파일럿 부적합** (router·state 없음)
  - `q/analysis/ability/page.tsx` (66줄, `lastDiagnosis` 1개, 라우팅 보유) — **파일럿 후보 A**
  - `q/review/queue/page.tsx` (92줄, store 2개 + unifiedQueue 호출) — **파일럿 후보 B**
  - `q/infinity/page.tsx` (154줄, mock 5개 + section 4개) — **파일럿 후보 C**

  → **사용자 결정 필요** (§10 다음 단계). default 추천: 후보 B (`review/queue`) — 적당한 logic + store 보유 + 회귀 위험 낮음

- 문서:
  - `AGENTS.md` 에 §Container/Presenter 컨벤션 표 추가 (planner AGENTS.md 의 표 그대로 차용, "planner-*" 를 "q-*" 로 치환)
  - `CLAUDE.md` §1 도메인 범위 표에 `apps/q/components/features/q-*/{containers,presenters,components,hooks}/` 추가
  - `apps/q/CLAUDE.md` 에 cross-feature import 정책 + `shared/` 정책 추가

- 파일럿 코드:
  - `apps/q/components/features/q-<도메인>/containers/<페이지명>Container.tsx` 신규 (Container 순수성: 마크업 0줄, 원시값 props 만 전달)
  - `apps/q/components/features/q-<도메인>/presenters/<페이지명>Presenter.tsx` 신규
  - 원본 `components/<도메인>/*.tsx` → `features/q-<도메인>/components/*` git mv (5~7 파일)
  - `page.tsx` → Server Component 화 (`'use client'` 제거) + `<Suspense><...Container /></Suspense>`

- 완료 기준:
  - `bun run typecheck && bun run lint` 4 워크스페이스 0 error
  - `bun run dev:q` 후 `/q/<라우트>` 동작 회귀 0 (수동 + Playwright 1 케이스)
  - PR 본문에 before/after 라인 수 + 차용한 planner 파일 링크

#### Phase 2 — 가장 큰 페이지 (`infinity/solve` 643줄 → Container/Presenter) (PR #2 — 1~2 PR 가능)

Q 도메인 최대 logic 보유. planner 의 `manage/[id]/edit/page.tsx` (239줄) 보다 2.7배. 가장 큰 위험.

- **진입 전 prerequisite**:
  - `infinity/solve/page.tsx` 의 핵심 state·effect 매핑 (`useLeitnerStore`, `useSolveSessionStore`, exam mode 토글 가드, `OmrSheet`, `SolveSessionPicker`, `LeaveGuard`)
  - exam mode 진입 가드 — Container 책임 영역 확정 (시험 시작 전 dialog, 시험 중 코치/힌트 차단 분기, 시험 종료 라우팅)
  - `SolveResumeCard` ↔ session store 동기화 위치 결정 (Container vs Presenter)
  - 643줄 → Container ~250줄 / Presenter ~350줄 / hooks ~50줄 분할 견적

- 리팩터링:
  - `features/q-infinity/containers/SolveContainer.tsx` (state + router + searchParams + 이벤트 핸들러 + exam guard)
  - `features/q-infinity/presenters/SolvePresenter.tsx` (header + ProblemDisplay + CoachPane + OmrSheet + SolveSessionBar grid)
  - `features/q-infinity/hooks/use-solve-session.ts` (session 로딩 + resume 로직)
  - `features/q-infinity/hooks/use-exam-mode.ts` (exam 진입/이탈 + 차단 분기)
  - 기존 `apps/q/components/infinity/*` (10개) → `features/q-infinity/components/*`
  - `infinity/solve/page.tsx` → Server Component + `<Suspense><SolveContainer /></Suspense>`

- 완료 기준:
  - typecheck/lint/test 통과
  - exam mode 골든패스 (시작 → 풀이 → 제출) Playwright 통과
  - leave-guard popstate 회귀 0
  - PR 본문에 before/after 라인 + Container/Presenter 책임 매트릭스

#### Phase 3 — 나머지 큰 페이지 (`review` 라인업 + `q hub`) (PR #3)

- `q/review/page.tsx` (440줄) → `ReviewHubContainer` + `ReviewHubPresenter`
- `q/review/conquer/page.tsx` (338줄) → `ConquerContainer` + `ConquerPresenter`
- `q/review/memory/[id]/page.tsx` (328줄) → `MemoryDetailContainer` + `MemoryDetailPresenter`
- `q/review/queue/page.tsx` → (Phase 1 후보 B 인 경우 이미 완료, 아니면 본 phase 에서)
- `q/page.tsx` (326줄) → `QHubContainer` + `QHubPresenter` (`pickNowAction` 로직은 `features/q-home/lib/pick-now-action.ts` 로 추출)
- 기존 `apps/q/components/{conqueror,memory,question-hub}/*` → 각 `features/q-*/components/*`
- 검증: `/q`, `/q/review`, `/q/review/conquer`, `/q/review/queue`, `/q/review/memory/<id>` 5 라우트 동작

#### Phase 4 — 잔여 페이지 (`analysis` 4 페이지 + `infinity` 인덱스·history·exam-result·explain) (PR #4)

- `q/infinity/page.tsx` (154줄) → `InfinityHomeContainer` + `InfinityHomePresenter`
- `q/infinity/history/page.tsx` (167줄) → `HistoryContainer` + `HistoryPresenter`
- `q/infinity/exam-result/page.tsx` (183줄) → `ExamResultContainer` + `ExamResultPresenter`
- `q/infinity/explain/page.tsx` (190줄) → `ExplainContainer` + `ExplainPresenter`
- `q/analysis/page.tsx` (17줄, thin) → 그대로 두되 컴포넌트만 `features/q-analysis/components/*` 로 이동
- `q/analysis/diagnose/page.tsx` (299줄) → `DiagnoseContainer` + `DiagnosePresenter`
- `q/analysis/ability/page.tsx`, `q/analysis/process/page.tsx`, `q/analysis/[questionId]/page.tsx` → (Phase 1 후보 A 잔여분 처리)
- `q/talk/page.tsx` (24줄, thin) → `apps/q/components/coach/*` → `features/q-coach/components/*` 이동, 컨테이너화는 logic 0 이므로 생략 가능
- 기존 `apps/q/components/{analysis,study-index,xray,coach}/*` 전부 `features/q-*/components/*` 로 이동

#### Phase 5 — 문서 마감 (PR #5)

- `CLAUDE.md` §1 도메인 범위 표 최종본 (`apps/q/components/features/q-*` 경로)
- `apps/q/CLAUDE.md` 의 `components/{infinity,coach,...}` 참조 전부 `components/features/q-*` 로 갱신
- `apps/q/AGENTS.md` 에 Container/Presenter 컨벤션 표 (planner AGENTS.md 와 동일 톤)
- `README.md` 폴더 구조 다이어그램 갱신
- `bunx tsc --noEmit && bun run lint` 잔여 import 경로 0 error

---

### BE adoption 트랙 (planner Phase α~η 대응)

#### Phase α — 모노레포 재편 (이미 D-Lite 완료)

- 본 plan 진입 시점에 이미 머지됨 (`refactor/monorepo-migration`)
- 추가 작업: **없음** (단 §5 의 "폐기 대상" 중 drizzle npm 의존성 (`drizzle-orm` / `drizzle-kit` / `pg` / `@types/pg`) 제거는 Phase η 완료 직후, `apps/backend/CLAUDE.md` 신규 작성은 Phase β PR 에 동봉)

#### Phase β — pullim common 패턴 차용 (PR #β)

planner Phase β 와 거의 1:1. 차이는 에러 코드 prefix 만 (`PLANNER_*` → `Q_*`).

- `apps/backend/src/common/` 전부 — bootstrap(setupGlobal/Security/Logging/Swagger) / filters(AllExceptionsFilter + HttpExceptionFilter) / interceptors(ResponseInterceptor) / decorators / dto / validation-messages / swagger / utils / interfaces(BaseRepositoryInterface) / infrastructure(BaseRepository) / constants(error-messages.constant.ts — `Q_INFINITY_NOT_FOUND` 등)
- `apps/backend/src/config/{database,timezone,swagger}.config.ts`
- `apps/backend/src/database/{data-source.ts, database.module.ts, migrations/}` 빈 스캐폴딩
- `nestjs-cls` 글로벌 등록, 3 전역 (1 filter + 1 filter + 1 interceptor) 등록
- `MockAuthGuard` (`X-User-Id` 헤더 → fallback `student_001`)
- `RolesGuard` 차용하되 비활성

- 완료 기준:
  - `bun run dev:backend` → `http://localhost:4031/api-docs` Swagger UI 노출
  - 임의 throw → `AllExceptionsFilter` 응답 일관 `{success: false, error: {...}}`
  - `X-User-Id` 헤더 가드 동작 (헤더 미존재 → `student_001` fallback)
  - 30분 bun + NestJS spike 결과 PR 본문에 명시 (실패 시 backend node + pnpm 분기 — planner 결정 그대로 적용)

#### Phase γ — Q entity 설계 + 마이그레이션 1개 (PR #γ — 1~2 PR 가능)

mock 시그니처 ↔ TypeORM entity 매핑 매트릭스 + 첫 마이그레이션. drizzle schema 와 byte-equal.

- `apps/backend/src/entities/` (10 entity — drizzle `apps/q/lib/db/schema.ts` 기반 1:1):
  - `user.entity.ts` (mock `currentPersona`)
  - `curriculum-node.entity.ts` (자기참조 트리)
  - `user-curriculum-mastery.entity.ts`
  - `problem.entity.ts` (SKU master)
  - `error-pattern.entity.ts` (catalog)
  - `solve-attempt.entity.ts`
  - `wrong-attempt-diagnosis.entity.ts` (FaaS 10-code)
  - `theta-snapshot.entity.ts`
  - `leitner-card.entity.ts`
  - `memory-item.entity.ts`

- mock 시그니처 → entity 매핑 매트릭스 (PR 본문에 포함):

  | mock 파일 | 시그니처 | entity 매핑 | 잔존 여부 |
  |---|---|---|---|
  | `persona.ts` | `currentPersona` | `user.entity.ts` | Phase η 까지 잔존 |
  | `curriculum.ts` | `allCurricula` | `curriculum-node.entity.ts` | Phase η 까지 잔존 |
  | `irt.ts` | `myAbility`, `thetaTrend`, `probCorrect()` | `theta-snapshot.entity.ts` + `probCorrect` 는 FE 유틸로 잔존 | mock 함수는 FE 잔존 |
  | `infinity.ts` | `solveDeck`, `solveHistory`, `todaySession`, `lastExamResult` | `solve-attempt.entity.ts` + `problem.entity.ts` | Phase η 까지 잔존 |
  | `conqueror.ts` | `conquestStats`, `errorPatterns` | `error-pattern.entity.ts` + view aggregate | Phase η 까지 잔존 |
  | `memory.ts` | `memoryItems`, `dueItems()`, `forgettingCurve` | `memory-item.entity.ts` + view | Phase η 까지 잔존 |
  | `wrong-reason.ts` | `wrongReasonCatalog`, `wrongAttemptDiagnoses` | `wrong-attempt-diagnosis.entity.ts` + 카탈로그는 상수 | catalog 는 BE 상수로, 진단 row 는 entity |
  | `tutor.ts` | `tutorMessages`, `tutorPersonas` | (보류 — coach 모듈에서 별 entity 필요 여부 판정) | Phase ζ 결정 |
  | `coach.ts` | `coachHero`, `activityTimeline` | (보류 — read-only aggregate 가능성) | Phase ζ 결정 |
  | `xray.ts` | `metaCognitionData`, `timeDistribution`, `hourlyAccuracy` | `solve-attempt.entity.ts` aggregate view | mock 함수는 BE 이식 |
  | `phase1.ts` | `quickDiagnostic` | (보류) | Phase ζ 결정 |
  | `features.ts` | `featureLabels`, `modeFeatureMap` | **entity 부재 — BE 상수로 이식** | Phase ζ 에서 상수로 |
  | `domains.ts` | Q 도메인 메타 | **entity 부재 — BE 상수로 이식** | Phase ζ 에서 상수로 |

- TypeORM 마이그레이션 1개 — 기존 drizzle SQL (`apps/q/drizzle/0000_easy_exodus.sql`) 과 동등
- seed: `apps/backend/src/database/seeds/` 신설, drizzle seed (없다면 mock 으로부터 derive) 를 TypeORM repo 로 재작성

- 완료 기준:
  - `bun run migration:run:backend` → 기존 drizzle 스키마와 `pg_dump --schema-only` diff 0
  - seed 실행 시 `users` 1행 + `curriculum_nodes` N행 + `solve_attempts` M행 (mock 과 동등)
  - `apps/q/drizzle/`, `apps/q/drizzle.config.ts` 폐기 (이 PR 또는 다음 PR)

#### Phase δ — Q read endpoint 9건 이식 (PR #δ)

현 `apps/q/app/api/` 의 9 endpoint 를 NestJS controller 로 1:1 이식. 응답 envelope 는 옵션 A 새로 기록.

- `apps/backend/src/modules/q/`:
  - `me/` — `GET /api/me` (`MeController` + `GetMeUseCase`)
  - `infinity/` —
    - `GET /api/q/infinity/today` (`GetTodayInfinityUseCase`)
    - `GET /api/q/infinity/history` (`GetInfinityHistoryUseCase`)
  - `analysis/` —
    - `GET /api/q/analysis/wrong-reasons` (`GetWrongReasonsUseCase`)
    - `GET /api/q/analysis/abilities` (`GetAbilitiesUseCase`)
    - `GET /api/q/analysis/recent-mistakes` (`GetRecentMistakesUseCase`)
  - `review/` —
    - `GET /api/q/review/error-patterns` (`GetErrorPatternsUseCase`)
    - `GET /api/q/review/memory` (`GetMemoryItemsUseCase`)
    - `GET /api/q/review/leitner` (`GetLeitnerCardsUseCase`)
- 각 모듈마다 `service`, `interface/<x>-repository.interface.ts`, `infrastructure/<x>.repository.ts` 구조

- 완료 기준:
  - 9 endpoint 모두 Testcontainers 통합 테스트 통과 (planner 와 동일 패턴)
  - 응답 envelope `{success: true, data: ...}` snapshot 기록
  - FE 는 아직 `apps/q/app/api/*` 호출 또는 mock 사용 (Phase η 까지 잔존)

#### Phase ε — Q mutation endpoint 이식 (PR #ε)

현 Q FE 는 store 기반 mutation 만 (`useLeitnerStore`, `useMemoryStore`, `useSolveSessionStore`) — BE 에 noop. 본 Phase 에서 신설할 mutation:

- `POST /api/q/infinity/solve-attempts` — 풀이 결과 저장 (`solve-attempt.entity` insert + theta 재계산 트리거)
- `PATCH /api/q/review/leitner/:id` — Leitner box 이동 (Box 1~5)
- `POST /api/q/review/memory/:id/review` — 기억 카드 review 기록 + 다음 review 시각 계산
- `POST /api/q/analysis/diagnose` — 진단 시작·종료 (theta snapshot + wrongAttemptDiagnosis batch)
- `PATCH /api/q/me` — persona focus subject / preferred study time 갱신

- 각각 use-case + service + DTO + `class-validator`
- 에러 코드 prefix `Q_INFINITY_*` / `Q_REVIEW_*` / `Q_ANALYSIS_*` / `Q_USER_*`
- 5 에러 코드 (`*_NOT_FOUND`, `*_VALIDATION_FAILED`, `*_CONFLICT`, `*_FORBIDDEN`, `COMMON_UNKNOWN_ERROR`) — planner §6.2 매핑 표 그대로

- 완료 기준:
  - 5 endpoint 통합 테스트 통과
  - 검증 규칙 매트릭스 PR 본문 포함 (path-aware validation 정보 손실 인정 + envelope 흡수)

#### Phase ζ — mock 잔여 시그니처 BE 이식 (PR #ζ — 1~2 PR 가능)

`coach.ts`, `tutor.ts`, `phase1.ts`, `features.ts`, `domains.ts` — read API 미노출 시그니처들.

- **진입 전 prerequisite**: mock 매핑 매트릭스 재작성 (G3·PM 합의 게이트). Q 는 planner 보다 mock 시그니처가 많아 본 Phase 에서 "어디까지 BE 이식하고 어디부터 FE 상수로 잔존" 결정 필요
- 후보 결정:
  - `features.ts`, `domains.ts` → **BE 상수로 이식** (도메인 메타 — `apps/backend/src/modules/q/_meta/` 또는 packages/types 상수)
  - `tutor.ts`, `coach.ts` → **coach 모듈 신설** (`coachHero`, `activityTimeline` aggregate read endpoint)
  - `phase1.ts` (`quickDiagnostic`) → diagnose 흐름 일부, Phase ε `POST /api/q/analysis/diagnose` 에 흡수 가능 여부 재평가
- 결정 후 PR

#### Phase η — FE mock 제거 → `@pullim-q/api-client` 전환 (PR #η — 1~2 PR 가능)

- `packages/api-client/src/` 본격 구현:
  - `envelope.ts` (`{success, data}` 언래핑 + `{success, error}` 변환 → throw `ApiError`)
  - `me.ts`, `infinity.ts`, `analysis.ts`, `review.ts`, `coach.ts` (Phase δ·ε·ζ endpoint 1:1)
  - `client.ts` (fetch wrapper + `X-User-Id` 헤더 자동 주입)
- `packages/types/src/` 본격 구현 (BE entity DTO 와 1:1 type)
- `packages/auth/src/` MockAuthProvider 구현 (Phase β 의 MockAuthGuard 와 짝)
- `apps/q/` 모든 mock import 지점 (`@/lib/mock/...`) 을 `@pullim-q/api-client` 호출로 치환
  - Container 가 데이터 fetch (Server Component fetch 또는 Server Action) — Phase 1~5 에서 이미 Container 분리되어 있어 변환점 명확
  - Server Component 에서 `headers()` 로 `X-User-Id` 읽고 server-side fetch
  - Client Component (store 기반 mutation) 는 `@pullim-q/api-client` client-side 호출
- mock 파일 (`apps/q/lib/mock/*`) 자체는 **마지막 PR** 에서만 제거 (회귀 안전망)
- `apps/q/app/api/` 전체 폐기 (NestJS 가 이미 대체)
- `apps/q/lib/db/` 폐기, `drizzle-orm`/`drizzle-kit`/`pg`/`@types/pg` 의존성 제거

- 완료 기준:
  - `grep -r "from '@/lib/mock" apps/q/components apps/q/app` 0건
  - `rg "drizzle-orm" apps/q` 0건 (서브패스 포함)
  - `apps/q/app/api/` 디렉터리 부재
  - 16 페이지 전체 회귀 0 (수동 + Playwright 골든패스 4 케이스: infinity solve / review hub / analysis ability / q hub)

---

## 7. 리스크 매트릭스

| 리스크 | 영향 | 대응 |
|---|---|---|
| **`infinity/solve` 643줄 분리 — exam mode 가드 + leave-guard popstate + session resume 의 분기 보존 어려움** | Phase 2 의 가장 큰 위험. 시험 모드 차단 분기를 Container 로 옮기다가 회귀 발생 시 시험 진실성 깨짐 | Phase 2 진입 전 prerequisite 로 state machine 다이어그램 작성. exam mode 진입·이탈 골든패스 Playwright 케이스 사전 작성. hooks 로 `use-exam-mode` 추출하여 단위 테스트 가능하게 |
| **bun + NestJS 호환성** — planner 정본 결정과 동일하나 Q backend 는 아직 spike 미진행 | Phase β 진입 자체 막힐 가능성 | Phase β 진입 직후 30분 spike (`bun --watch apps/backend/src/main.ts` + `nest start --watch`). 실패 시 backend node + pnpm 분기 — planner 결정 그대로 자동 적용, 사용자 재합의 불요 |
| **drizzle schema (10 tables) ↔ TypeORM entity 매핑 정확도** — planner 보다 entity 수 많음 | Phase γ 에서 byte-equal 실패 가능성 | `pg_dump --schema-only` diff PR 본문 첨부 + 매핑 매트릭스 review |
| **mock 시그니처 13개 → entity 매핑의 모호성** — planner 6개 mock 의 2배. 특히 `coach`, `tutor`, `xray` 는 aggregate view 성격 강함 | Phase γ·ζ 진척 둔화 | §6 Phase γ 의 매핑 매트릭스 표 + Phase ζ 진입 전 G3 합의 게이트 |
| **응답 envelope 변경 — 현 `apps/q/app/api/*` 의 raw JSON 9 endpoint** | Phase δ 에서 envelope 적용 시 FE 측 `res.data` 접근부 일괄 분기 필요 | planner 결정 그대로 — 옵션 A 자동 채택, FE 분기 갱신은 Phase η 에서 일괄 |
| **Container/Presenter 변환 페이지 수 16개 + 컴포넌트 폴더 9개** — planner 6 페이지·4 폴더의 ~3배 분량 | Phase 1~5 전체 진척 둔화, PR 사이즈 부풀어오름 | Phase 2/3/4 각각 PR 1~2개 분할. cross-feature import (planner-reports → planner-home 패턴) 활용 — Q 에서는 `q-analysis` 가 `q-xray`/`q-study-index` widget 빌려오기 가능 |
| **drizzle 잔존 기간 (Phase α 머지 후 ~ Phase γ 머지 전)** — 그 사이 새 API endpoint 추가되면 두 ORM 동시 존재 | drizzle 새 호출 추가 시 Phase γ 작업량 누적 | Phase α 머지 직후 "drizzle freeze" 명시 — 새 API route 추가 금지 룰 PR 본문에 명시 |
| **store 기반 mutation (Leitner/Memory/SolveSession) 의 BE 이식 시점** — 현재 store 가 진실의 원천, BE 이식 시 store ↔ BE 동기화 정책 결정 필요 | Phase ε·η 전반 | Phase ε 진입 전 store optimistic update + BE confirm 정책 합의 게이트 |
| **plan 자체의 PR 12~14개 분량** (FE 5 + BE 5~7) — planner 7개의 2배 | 중간에 우선순위 변동 시 정체 | 각 PR 본문에 본 plan §6 단계 링크. FE 트랙과 BE 트랙은 독립 진행 가능 (Phase 1~5 와 Phase β~η 는 PR 차원에서 병렬). PM 이 중간에 stop 가능 |

---

## 8. 게이트키퍼 합의 포인트

planner 정본의 §7 과 동일 구조:

- **G3 (BE 게이트키퍼)** — Phase ζ 진입 시점에서 mock 매핑 매트릭스 재확정 (어디까지 entity / 어디부터 상수). Phase ε 진입 시점에서 store ↔ BE 동기화 정책 합의. Phase β·γ·δ 는 planner 결정 그대로 적용, 게이트 부재
- **G4 (FE 게이트키퍼)** — Phase η 진입 시점에서 데이터 페칭 패턴 확정 (Server Component fetch vs Server Action vs client `@pullim-q/api-client`). envelope 분기 처리 합의
- **G1** — 본 plan 은 내부 구조 작업이므로 §6 진척 보고 시점에 일괄

본 plan 은 **Phase α 는 이미 완료, Phase β·1·2·3·4·5·γ·δ 는 G3·G4 합의 게이트 부재 상태로 연속 진입 가능**. Phase ε·ζ·η 는 위 합의 게이트 통과 후 진입.

---

## 9. 본 plan 완료 정의

§1 "완료 기준" 6줄 모두 충족 시 — 사용자 명시("archive 로 옮겨")가 있을 때만 `proc/archive/2026-05-27_planner-alignment.md` 로 이동 (메모리 룰 `feedback_plan_archive.md` 기준).

planner 와 마찬가지로:

- 각 Phase PR 머지 시 본 plan 파일에 진척 체크박스 추가
- 전체 완료 시점에 사용자에게 archive 여부 확인

---

## 10. 다음 단계

본 plan 동의 시 — Phase 1 (FE 파일럿) 또는 Phase β (BE common 차용) 진입. 사용자 결정 필요 항목:

1. **첫 Phase 진입 방향** — FE 트랙 (Phase 1) 우선 vs BE 트랙 (Phase β) 우선 vs 병렬
2. **Phase 1 파일럿 페이지** — 후보 A (`analysis/ability` 66줄, mock 1개, route 보유) / 후보 B (`review/queue` 92줄, store 2개) / 후보 C (`infinity` 인덱스 154줄, mock 5개) 중 어느 것
3. **drizzle freeze 룰 명문화 시점** — Phase α 머지 직후 vs Phase β 진입 시점

본 3개 결정 — 사용자 응답 대기.
