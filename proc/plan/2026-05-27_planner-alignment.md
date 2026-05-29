# 2026-05-27 — pullim-planner 정렬 plan (Q 도메인 적응)

**상태**: **PROPOSAL — 정렬 목표 문서. 실행 게이트 아님.**

## 0. 권위 우선순위 (Authority Order) — 반드시 먼저 읽을 것

본 plan 은 Q 도메인의 **정렬 목표 제안서** 다. 실행 게이트로 채택된 적은 없으며 다음 우선순위로 해석한다:

1. **루트 `AGENTS.md` / `CLAUDE.md`** — 현행 운영 규칙. 본 문서가 충돌하는 항목은 항상 패배.
2. **`proc/spec/`** — Q 도메인 SOT (특히 `2026-05-18_q-be-api-design.md`). 본 plan 은 spec 변경 제안일 뿐.
3. **이미 채택된 다른 plan** (`2026-05-26_*` 등). 본 plan 이 충돌하면 패배.
4. **본 plan** — PROPOSAL.

**패배 사례** (codex R1~R6 누적 지적 흡수):
- 본 plan 의 bun 단일 워크스페이스 가정 vs pnpm fallback 언급 — 현행 bun 결정 우선. pnpm 전환은 별도 인프라 결정 PR 통해서만.
- `lib/db/` Drizzle 즉시 폐기 vs 단계적 entity 동등성 검증 후 폐기 — 후자 우선, **제거는 Phase η**(§5 "폐기 대상"의 레거시 `app/api`+`lib/db`+drizzle 자산 일괄 제거 시점). γ 에서는 TypeORM entity 를 추가만 하고 drizzle 는 동결·유지. 본 plan 의 시점 표기는 정렬 목표일 뿐.
- FE Container 의 서버/클라이언트 책임 — 본 plan §내에서 모순이 발견되면 `2026-05-26_container-presenter-adoption.md` (planner 정본) 와 Next.js 16 server-first 기본을 우선.
- drizzle 검증 명령 (`rg "drizzle-orm" apps/q`) 누락 케이스 / 완료 기준 워크스페이스 수 표기 모순 / 루트 lint·test 범위 서술 모순 — 정정은 후속 spec 갱신 PR 에서.

본 plan 의 머지는 **자동 실행 게이트를 열지 않는다**. spec 갱신(`proc/spec/2026-05-18_q-be-api-design.md` ORM·API 행)은 **별도 선행 PR 이 아니라 Phase 1(컨벤션 문서화 PR)의 산출물**로 수행한다 — 단 **Phase 1 에서는 ORM·API 행을 "proposal (β spike 검증 대기)" 상태로만** 기재하고(아직 검증 안 된 BE 전제를 SOT 로 확정하지 않기 위함 — §0 authority), **정본 확정은 Phase β 의 bun+NestJS spike 성공 후**에 한다. 즉 Phase 1 PR 이 컨벤션 문서화와 함께 spec 에 proposal 행을 추가하고, 그 머지 이후에 BE/FE 마이그레이션 Phase(β·γ·δ…)가 진입하며, β spike 성공 시점에 proposal → 정본 전환이 일어난다. (실행 순서는 Phase 1 → β(spike·정본 전환) → 이후 phase 단일 흐름. 별도 spec PR 을 따로 만들 필요는 없다.)

---

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
- `apps/q/lib/mock/` 의 13 시그니처의 데이터 전체가 BE surface (entity/use-case/controller 직접 매핑 또는 BE 상수·aggregate view 로 흡수) 로 옮겨져 Q-FE 의 `lib/mock` 직접 import 0건이 종착점, FE 데이터는 `@pullim-q/api-client` 만 사용. (유일 예외: `probCorrect()` 같은 순수 stateless 수식은 데이터가 아니므로 `@/lib/mock` 밖 공유 유틸로 *이동* — 역시 `lib/mock` import 0건 만족. 시그니처별 정확한 처리 방식은 §6 Phase γ 매핑표에 명시)
- 루트 `CLAUDE.md`·`AGENTS.md`·`apps/q/CLAUDE.md`·`apps/q/AGENTS.md`·`apps/backend/CLAUDE.md`(신규) 가 새 구조·컨벤션을 반영

**완료 기준** (이 plan 전체):

- `find apps/q/components/features -mindepth 1 -maxdepth 1 -type d` 가 정확히 `q-home / q-infinity / q-coach / q-conqueror / q-memory / q-xray / q-study-index / q-analysis / q-question-hub` 9개 top-level feature 폴더만 반환 (하위 `containers/`·`presenters/`·`components/` 까지 세지 않도록 `-maxdepth 1` 로 top-level 만 검사)
- `rg '@/lib/mock' apps/q --glob '!**/node_modules/**' --glob '!**/lib/mock/**'` 결과 0건 — **`apps/q` 전체**(components·app 뿐 아니라 `lib/**`·`features/*/lib`·`features/*/server` 등 런타임 경로 전부)에서 `@/lib/mock` 직접 import 0건. (검색 루트가 `apps/q` 이므로 exclude glob 은 루트 상대 경로 패턴 `**/lib/mock/**` 으로 — `apps/q/lib/mock/**` 같은 절대 prefix 는 매치 안 됨. single/double quote·`import`·`export ... from`·서브패스 import 전부 포함. `lib/mock/` 디렉터리 자신은 제외 — η 마지막 PR 에서 통째 삭제되므로)
- `rg "drizzle-orm" apps/q` 결과 0건 (서브패스 `drizzle-orm/pg-core`·`drizzle-orm/node-postgres` 포함)
- `apps/backend/src/modules/q/` 가 read+mutation endpoint 전체에 대해 use-case+service+repository 분리 보유
- 검증 명령 (루트):
  - `bun run typecheck` (= `turbo typecheck`) — 5 워크스페이스 전부 (`@pullim-q/{q,backend,types,api-client,auth}`) 통과
  - `bun run lint` 와 `bun run test` — **5 워크스페이스 전부** (`@pullim-q/{q,backend,types,api-client,auth}`) 통과. 루트 `package.json` 에는 이미 `"lint": "turbo lint"` / `"test": "turbo test"` 가, `turbo.json` 에는 `test`/`lint` task 가 **존재**하므로 루트 파이프라인 정비는 불필요. 다만 Phase η 가 `packages/{types,api-client,auth}` 를 placeholder → **본격 구현**으로 전환하므로, **Phase η 작업 항목에 해당 packages 의 `lint`/`test` 스크립트 추가를 포함**하고(현재 packages 엔 `typecheck` 만 있음) 완료 기준도 5 워크스페이스 lint/test 통과로 고정한다. (packages 가 본 plan 산출물인 이상 검증 범위에서 제외하면 깨진 패키지 코드로도 완료 판정될 수 있으므로 제외하지 않는다.)
- `proc/spec/2026-05-18_q-be-api-design.md` §결정 사항의 ORM 행이 **TypeORM 0.3**, API 스타일 행이 **NestJS 11 — apps/backend** 로 **정본 확정**(Phase 1 의 proposal 행 → Phase β spike 성공 후 정본 전환된 상태. 본 §1 완료 기준은 plan 전체 완료 시점 기준이므로 이미 β 통과 후 — §6 Phase 1·Phase β 참조)

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
| Container/Presenter | **미도입** — `/q` 이하 `page.tsx` 16개 중 `'use client'` 선언 8개, `@/lib/mock` 직접 import 12개 (`analysis/page.tsx`·`talk/page.tsx` 등은 thin mount 라 예외). Container/Presenter 분리는 0건 |
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
| **Jest** | 완료 (5 워크스페이스 jest config + 테스트 보유) | **부분** — `apps/q/jest.config.ts` 만, backend/packages 설정·테스트 부재 | 중형 갭 — Phase β (backend) / Phase η (packages) 에서 신규 추가 |
| **shadcn 컨벤션** (`@/components/ui/*` + `cn`) | 완료 (단, planner 는 `@pullim/design-system` 계획) | 완료 (`apps/q/components/ui/` 17개) | 0 — Q 는 DS 도입 비목표 |
| **Container/Presenter** (`features/<domain>/{containers,presenters,components,hooks,lib,server}/` — `lib/` 는 React 훅이 아닌 순수 유틸/도출 로직 전용(옵션), `server/` 는 RSC ServerWrapper·server-only prefetch 전용(옵션, Phase η 데이터 주입 패턴)) | Phase 1~3 완료 (planner-reports, planner-manage, planner-home, planner-onboarding) | **0건** — `components/{infinity,coach,...}/` 평면 구조, 페이지가 mock·router·state 직접 보유 | **대형 갭** — Phase 1~5 전체 적용 필요 |
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
│   │   │   │   └── q-home/{containers,presenters,components,lib}/  # /q hub 326줄 (lib/ = pickNowAction 등 순수 로직)
│   │   │   │   # 옵션 하위: lib/ (순수 유틸) · server/ (RSC ServerWrapper·prefetch — Phase η 데이터 주입). 필요 feature 만 추가
│   │   │   ├── shared/                      # 진짜 순수 뷰만 (Q 도 비어 시작)
│   │   │   ├── shell/                       # AppHeader/AppSidebar/BottomNav/PageHeader 등 13개
│   │   │   ├── ui/                          # shadcn 17개
│   │   │   └── brand/                       # 1개
│   │   ├── lib/{tokens,utils.ts,review,store,motion}/   # lib/api 는 제외 — η 에서 @pullim-q/api-client 로 대체·제거 (§0 최종 목표 'FE 데이터는 api-client 만')
│   │   ├── (drizzle/, drizzle.config.ts, lib/db/(디렉터리 전체), lib/mock/, lib/api/, app/api/ — Phase γ~η 진행에 따라 폐기)
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

- Phase γ 머지 시: **(자산 제거 없음)** TypeORM entity 를 drizzle schema 와 byte-equal 로 *추가*만 한다. `apps/q/drizzle/`·`drizzle.config.ts`·`db:*` 스크립트·`scripts/seed.ts` 는 **제거하지 않고 Phase η 까지 유지** — γ~η 사이에는 FE 의 `apps/q/app/api/*` + `lib/db` 레거시 Drizzle 경로가 아직 실서비스/회귀검증 경로로 살아 있으므로(아래 "Phase η 완료 시" 일괄 제거 항목 및 §6 Phase δ 완료 기준 참조), 그 스키마를 regenerate·seed 할 공식 수단(drizzle-kit·seed.ts)을 같이 남겨 둬야 한다. **단 γ 머지 이후 레거시 drizzle schema 는 동결 — 변경 금지**(§11 "drizzle 잔존 기간" 리스크의 drizzle freeze 룰). δ·ε·ζ 의 TypeORM schema/view 변경은 레거시 drizzle 경로에 영향 주지 않는다.
- Phase η 완료 시 (PR 마지막 단계, 동일 PR 내): `apps/q/app/api/` 전체 + **`apps/q/lib/db/` 디렉터리 전체**(schema/index 뿐 아니라 보조 헬퍼·후속 추가 파일 포함 — 디렉터리 부재가 목표, §0 최종 목표) + `apps/q/lib/mock/` 전체 + **`apps/q/lib/api/` 전체**(api-client 로 대체) + **`apps/q/drizzle/` + `drizzle.config.ts` + `db:*` 스크립트 + `scripts/seed.ts`** — 모두 **한 묶음**으로 제거 (`apps/q/app/api/*/route.ts` 가 `@/lib/db` 와 `drizzle-orm` 을 직접 import 하고, drizzle-kit 스크립트는 drizzle schema 를 전제하므로, 레거시 경로가 사라지는 η 에서 일괄 제거해야 중간 상태가 깨지지 않음)
- **Phase η 의 마지막 PR 내** (위 자산·import 제거와 동일 PR, 드리즐 직접 호출이 모두 사라진 직후 같은 커밋): `apps/q/package.json` 의 `drizzle-orm` / `drizzle-kit` / `pg` / `@types/pg` 제거 — Phase α·β·γ 단계에서는 **제외** (drizzle 자산이 여전히 import 되는 동안 의존성을 빼면 빌드 실패). **η 완료 기준 `rg "drizzle-orm" apps/q` 0건 은 `apps/q/package.json` 도 포함하므로, 의존성 제거를 η 완료 *판정 안*(같은 PR)에 둬야 grep 이 통과한다** — "완료 직후"가 아니라 "완료 PR 내".

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
  - `AGENTS.md` 에 §Container/Presenter 컨벤션 표 추가 (planner AGENTS.md 의 표 그대로 차용, "planner-*" 를 "q-*" 로 치환) + **page 규칙 확장 명시**: `app/*/page.tsx` 는 "Container *또는* feature ServerWrapper 를 import + `<Suspense>` 래핑만, 자체 로직 금지" (server prefetch 필요 페이지는 ServerWrapper 경유 — Phase η 데이터 주입 패턴 전제)
  - `CLAUDE.md` §1 도메인 범위 표에 `apps/q/components/features/q-*/{containers,presenters,components,hooks,lib,server}/` 추가 (`lib/` = 순수 유틸/도출 로직(옵션), `server/` = RSC ServerWrapper·server-only prefetch(옵션, Phase η 데이터 주입))
  - `apps/q/CLAUDE.md` 에 cross-feature import 정책 + `shared/` 정책 추가
  - **`proc/spec/2026-05-18_q-be-api-design.md` 갱신** (§1 완료 기준 항목) — §결정 사항의 ORM 행 → **TypeORM 0.3**, API 스타일 행 → **NestJS 11 — apps/backend**. **단 Phase 1 단계에서는 이 두 행을 "proposal (Phase β spike 검증 대기)" 상태로만 기재**한다 — §0 authority 상 spec 이 plan 보다 상위 SOT 이므로, 아직 검증되지 않은 bun+NestJS 11 전제를 Phase 1 에서 확정(SOT)하면 β spike 실패 시 SOT 만 먼저 뒤집힌다. **확정(proposal → 정본) 전환은 Phase β 의 bun+NestJS spike 성공 직후** 해당 β PR 안에서(또는 β 머지 직후 후속 커밋) 수행한다(§6 Phase β 완료 기준·§8 게이트 참조). 즉 Phase 1 PR 은 spec 에 "proposal 행 추가"까지만 포함하고, FE 컨벤션·디렉터리 작업 등 BE 전제에 의존하지 않는 항목만 정본화한다 (별도 선행 PR 아님 — Phase 1 에 동봉하되 BE 행만 조건부)

- 파일럿 코드:
  - `apps/q/components/features/q-<도메인>/containers/<페이지명>Container.tsx` 신규 (Container 순수성: 마크업 0줄, 원시값 props 만 전달)
  - `apps/q/components/features/q-<도메인>/presenters/<페이지명>Presenter.tsx` 신규
  - 원본 `components/<도메인>/*.tsx` → `features/q-<도메인>/components/*` git mv (5~7 파일)
  - `page.tsx` → Server Component 화 (`'use client'` 제거) + `<Suspense><...Container /></Suspense>`

- 완료 기준:
  - `bun --filter @pullim-q/q typecheck && bun --filter @pullim-q/q lint` 0 error (Phase 1 은 FE 한정 게이트 — 전체 5 워크스페이스 게이트는 §1 plan 전체 완료 기준에서 검증)
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
- `q/page.tsx` (326줄) → `QHubContainer` + `QHubPresenter` (`pickNowAction` 순수 로직은 feature 컨벤션의 `lib/` 계층(§1·§5 에 정의)인 `features/q-home/lib/pick-now-action.ts` 로 추출)
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
- `q/talk/page.tsx` (24줄, thin) → `apps/q/components/coach/*` → `features/q-coach/components/*` 이동. **얇은 페이지라도 컨테이너화 생략 없음** — `apps/q/AGENTS.md`(`app/*/page.tsx` 는 Container import + `<Suspense>` 래핑만, 로직 금지) 와 §5 트리(`talk/page.tsx # <CoachContainer />`)에 맞춰 `CoachContainer` 를 둔다 (logic 0 이면 Container 가 Presenter 에 빈 props 만 전달하는 형태)
- 기존 `apps/q/components/{analysis,study-index,xray,coach}/*` 전부 `features/q-*/components/*` 로 이동

#### Phase 5 — 문서 마감 (PR #5)

- `CLAUDE.md` §1 도메인 범위 표 최종본 (`apps/q/components/features/q-*` 경로)
- `apps/q/CLAUDE.md` 의 `components/{infinity,coach,...}` 참조 전부 `components/features/q-*` 로 갱신
- `apps/q/AGENTS.md` 에 Container/Presenter 컨벤션 표 (planner AGENTS.md 와 동일 톤)
- `README.md` 폴더 구조 다이어그램 갱신
- `bun --filter @pullim-q/q typecheck && bun --filter @pullim-q/q lint` 잔여 import 경로 0 error (루트에는 `tsconfig.json` 이 없고 `tsconfig.base.json` 만 있어 `bunx tsc --noEmit` 는 Q import 검증 전에 종료하므로, 워크스페이스 typecheck 스크립트로 검사한다)

---

### BE adoption 트랙 (planner Phase α~η 대응)

#### Phase α — 모노레포 재편 (이미 D-Lite 완료)

- 본 plan 진입 시점에 이미 머지됨 (`refactor/monorepo-migration`)
- 추가 작업: **없음** (단 §5 의 "폐기 대상" 중 drizzle npm 의존성 (`drizzle-orm` / `drizzle-kit` / `pg` / `@types/pg`) 제거는 Phase η 마지막 PR 내(완료 판정 전 같은 커밋), `apps/backend/CLAUDE.md` 신규 작성은 Phase β PR 에 동봉)

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
  - 30분 bun + NestJS spike 결과 PR 본문에 명시. spike 는 Phase β PR 의 **첫 작업**이며 (PR 착수는 게이트 없이 가능 — §12 게이트키퍼 합의 섹션 참조), **spike 성공이 Phase β 완료(머지)의 전제**다 — 이 PR 안에서는 어떤 경우에도 package manager 를 바꾸지 않는다(§2.3 `bun 유지, pnpm 분기 안 함` 결정 = §0 authority). spike 실패 시: 이 Phase β PR 은 보류하고, package manager 정책 변경(backend 만 node + pnpm 분기) 또는 NestJS 버전 다운은 **별도 인프라 결정 PR** 에서만 처리한다(상단 authority 와 동일 규칙). 즉 fallback 은 Phase β 흐름 안 자동 분기가 아니라 별도 PR 게이트다.

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
  | `irt.ts` | `myAbility`, `thetaTrend`, `probCorrect()` | data(`myAbility`/`thetaTrend`) → `theta-snapshot.entity.ts`. `probCorrect()` 는 순수 IRT 수식(데이터 아님) → `@/lib/mock` 밖의 공유 유틸(`packages/types` 또는 `features/*/lib/`)로 **이동** | `lib/mock` import 0건 유지 (데이터는 BE, 순수 수식은 비-mock 유틸로 이전) |
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

- 본 Phase 작업 항목에 `apps/backend/package.json` 에 `migration:run` / `migration:generate` / `migration:revert` 스크립트 신규 정의 포함 (TypeORM CLI 직접 호출 — `typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts` 형태, planner `apps/backend/package.json` 패턴 그대로)
- 완료 기준:
  - `bun --cwd apps/backend run migration:run` → 기존 drizzle 스키마와 `pg_dump --schema-only` diff 0
  - seed 실행 시 `users` 1행 + `curriculum_nodes` N행 + `solve_attempts` M행 (mock 과 동등)
  - **drizzle 자산(`apps/q/drizzle/`, `drizzle.config.ts`, `db:*` 스크립트, `apps/q/scripts/seed.ts`)은 이 Phase γ 에서 제거하지 않는다** — γ~η 사이 FE 레거시 Drizzle 경로(`app/api/*` + `lib/db`)가 살아 있어 회귀검증·regenerate 수단이 필요하므로, 이들은 `app/api`·`lib/db` 와 함께 **Phase η 에서 일괄 제거**(§5 "폐기 대상" 과 일관). γ 머지 이후 레거시 drizzle schema 는 **동결**(§11 drizzle freeze 룰)

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

- **진입 전 prerequisite**: mock 매핑 매트릭스 재작성 (G3·PM 합의 게이트). **종착점은 §1 목표 그대로 — `apps/q/lib/mock/` 직접 import 0건.** 13 시그니처의 *데이터*는 전부 BE surface 로 흡수되고, 어떤 데이터도 FE `lib/mock` 상수로 잔존하지 않는다. 유일한 예외는 `probCorrect()` 같은 **순수 stateless 수식(데이터 아님)** 으로, 이는 `@/lib/mock` 밖의 공유 유틸(`packages/types` 또는 `features/*/lib/`)로 *이동*하여 마찬가지로 `lib/mock` import 0건을 만족한다. 본 Phase 에서 결정하는 것은 "FE 잔존 여부"가 아니라 **각 데이터 시그니처를 BE surface 의 어느 형태(entity+use-case+controller / BE 상수 `_meta` / aggregate read endpoint)로 흡수할지** 형태 선택뿐이다.
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
- **`packages/{types,api-client,auth}` 각각에 `lint`/`test` 스크립트 추가** (본격 구현과 동시) — §1 완료 기준의 5 워크스페이스 lint/test 게이트가 이 packages 를 포함하므로, 스크립트 부재 상태로 두지 않는다
- `apps/q/` 모든 mock import 지점 (`@/lib/mock/...`) 을 `@pullim-q/api-client` 호출로 치환:
  - **데이터 주입 패턴 = Server Wrapper** (Client→Server import 불가 문제 해소). RSC 규칙상 Client Component(Container)는 Server Component 를 import 할 수 없으므로, prefetch 는 **page.tsx 가 import 하는 별도 Server Wrapper(Server Component, `'use server'` 아님 — 기본 RSC)** 가 담당한다. 데이터 흐름: `page.tsx` → `<FooServerWrapper/>` import (page.tsx 는 여전히 thin: server wrapper + `<Suspense>` 만, 자체 로직 0) → ServerWrapper 가 `headers()` 로 `X-User-Id` 읽고 server-side prefetch → `<Suspense><FooContainer initialData={...}/></Suspense>` 렌더 → Container(Client)는 주입받은 `initialData` 사용. **이를 위해 Phase 1 의 `apps/q/AGENTS.md` 갱신에 "page.tsx 는 Container *또는* 그 feature 의 ServerWrapper 를 import + `<Suspense>` 래핑만" 으로 page 규칙을 명시 확장**(데이터 prefetch 가 필요한 페이지만 ServerWrapper 경유)한다. ServerWrapper 는 `features/q-*/` 의 server 모듈(예: `features/q-*/server/<name>.tsx`).
  - **Container (Client Component, `'use client'`)** — Phase 1~5 정의 그대로: state + router + searchParams + 이벤트 핸들러. 초기 데이터는 **ServerWrapper 가 props(`initialData`)로 주입**한 값을 사용 + client-side mutation 시 `@pullim-q/api-client` 호출
  - **CORS/프록시 구성 (η 완료 조건 + Phase β 작업)** — `apps/q/app/api/` 프록시 제거 후 브라우저가 FE(3031) → Nest BE(4031) 로 직접 호출하므로, 그리고 `X-User-Id` 커스텀 헤더로 preflight 가 발생하므로, **둘 중 하나를 명시 구성**해야 mutation 이 브라우저에서 막히지 않는다: (a) **Nest BE 의 CORS allowlist** 에 FE origin(`http://localhost:3031` 및 배포 도메인) + `X-User-Id` 허용 헤더 등록(`apps/backend` Phase β 작업), 또는 (b) **Next `rewrites()` 프록시**(`/api/* → 4031`)로 same-origin 유지(`apps/q/next.config.ts`). η 완료 조건에 "FE mutation 이 실제 브라우저에서 성공(preflight 포함)" 을 포함한다.
  - **Presenter** — 무변. Container 가 주입한 props 만 사용
- mock 파일 (`apps/q/lib/mock/*`) 자체는 **마지막 PR** 에서만 제거 (회귀 안전망)
- `apps/q/app/api/` 전체 폐기 (NestJS 가 이미 대체)
- `apps/q/lib/db/` 폐기, `drizzle-orm`/`drizzle-kit`/`pg`/`@types/pg` 의존성 제거

- 완료 기준:
  - `rg '@/lib/mock' apps/q --glob '!**/node_modules/**' --glob '!**/lib/mock/**'` 0건 — `apps/q` 전체 런타임 경로(`lib/`·`features/*/server` 등 포함, §1 완료 기준과 동일. exclude glob 은 루트 상대 `**/lib/mock/**`) (single/double quote·`export ... from`·서브패스 import 전부 포함)
  - `rg "drizzle-orm" apps/q` 0건 (서브패스 포함) — `apps/q/package.json` 의존성도 이 PR 내에서 제거되어야 통과 (§5 "폐기 대상"의 의존성 제거 항목)
  - `apps/q/app/api/` · **`apps/q/lib/db/`** · `apps/q/lib/api/` · `apps/q/lib/mock/` · `apps/q/drizzle/` 디렉터리 **전부 부재** (`test ! -d apps/q/lib/db` 등 — 일부 파일만 남는 부분 삭제 불가, 디렉터리 부재가 목표 §0 최종 목표)
  - 16 페이지 전체 회귀 0 (수동 + Playwright 골든패스 4 케이스: infinity solve / review hub / analysis ability / q hub)

---

## 7. 리스크 매트릭스

| 리스크 | 영향 | 대응 |
|---|---|---|
| **`infinity/solve` 643줄 분리 — exam mode 가드 + leave-guard popstate + session resume 의 분기 보존 어려움** | Phase 2 의 가장 큰 위험. 시험 모드 차단 분기를 Container 로 옮기다가 회귀 발생 시 시험 진실성 깨짐 | Phase 2 진입 전 prerequisite 로 state machine 다이어그램 작성. exam mode 진입·이탈 골든패스 Playwright 케이스 사전 작성. hooks 로 `use-exam-mode` 추출하여 단위 테스트 가능하게 |
| **bun + NestJS 호환성** — planner 정본 결정과 동일하나 Q backend 는 아직 spike 미진행 | Phase β 진입 자체 막힐 가능성 | Phase β 진입 직후 30분 spike (`bun --watch apps/backend/src/main.ts` + `nest start --watch`). **spike 성공이 Phase β 전제이며, Phase β PR 안에서는 package manager 를 바꾸지 않는다.** 실패 시 Phase β 보류 → package manager 변경(backend 만 node + pnpm 분기) 또는 NestJS 버전 다운은 **별도 인프라 결정 PR** 로만 처리 (§0 authority 의 pnpm 전환 규칙과 동일 — Phase β 내 자동 분기 금지) |
| **drizzle schema (10 tables) ↔ TypeORM entity 매핑 정확도** — planner 보다 entity 수 많음 | Phase γ 에서 byte-equal 실패 가능성 | `pg_dump --schema-only` diff PR 본문 첨부 + 매핑 매트릭스 review |
| **mock 시그니처 13개 → entity 매핑의 모호성** — planner 6개 mock 의 2배. 특히 `coach`, `tutor`, `xray` 는 aggregate view 성격 강함 | Phase γ·ζ 진척 둔화 | §6 Phase γ 의 매핑 매트릭스 표 + Phase ζ 진입 전 G3 합의 게이트 |
| **응답 envelope 변경 — 현 `apps/q/app/api/*` 의 raw JSON 9 endpoint** | Phase δ 에서 envelope 적용 시 FE 측 `res.data` 접근부 일괄 분기 필요 | planner 결정 그대로 — 옵션 A 자동 채택, FE 분기 갱신은 Phase η 에서 일괄 |
| **Container/Presenter 변환 페이지 수 16개 + 컴포넌트 폴더 9개** — planner 6 페이지·4 폴더의 ~3배 분량 | Phase 1~5 전체 진척 둔화, PR 사이즈 부풀어오름 | Phase 2/3/4 각각 PR 1~2개 분할. cross-feature import (planner-reports → planner-home 패턴) 활용 — Q 에서는 `q-analysis` 가 `q-xray`/`q-study-index` widget 빌려오기 가능 |
| **drizzle 잔존 기간 (현재 ~ Phase η 완료)** — 레거시 `app/api/*`+`lib/db` 가 η 까지 살아 있어, 그 사이 새 Drizzle route/API 가 추가되면 dual-ORM surface 가 증식 | drizzle 새 호출 추가 시 η 제거 범위 흔들림 | **"drizzle freeze" 기간 = 본 plan 합의 시점(즉시 — Phase α 는 이미 완료) ~ Phase η 완료**(레거시 `app/api`+`lib/db` 제거 시점)로 잡는다. 이 기간 내내 (1) 새 drizzle route/API 추가 금지, (2) γ 머지 이후 레거시 drizzle schema 변경 금지 — 두 룰을 각 PR 본문에 명시. (freeze 를 γ 에서 끝내면 δ·ε·ζ 동안 dual-ORM 이 다시 늘 수 있으므로 η 완료까지 유지) |
| **store 기반 mutation (Leitner/Memory/SolveSession) 의 BE 이식 시점** — 현재 store 가 진실의 원천, BE 이식 시 store ↔ BE 동기화 정책 결정 필요 | Phase ε·η 전반 | Phase ε 진입 전 store optimistic update + BE confirm 정책 합의 게이트 |
| **plan 자체의 PR 12~14개 분량** (FE 5 + BE 5~7) — planner 7개의 2배 | 중간에 우선순위 변동 시 정체 | 각 PR 본문에 본 plan §6 단계 링크. FE 트랙과 BE 트랙은 독립 진행 가능 (Phase 1~5 와 Phase β~η 는 PR 차원에서 병렬). PM 이 중간에 stop 가능 |

---

## 8. 게이트키퍼 합의 포인트

planner 정본의 §7 과 동일 구조:

- **G3 (BE 게이트키퍼)** — Phase ζ 진입 시점에서 mock 매핑 매트릭스 재확정 (어디까지 entity / 어디부터 상수). Phase ε 진입 시점에서 store ↔ BE 동기화 정책 합의. Phase β·γ·δ 는 planner 결정 그대로 적용, 게이트 부재
- **G4 (FE 게이트키퍼)** — Phase η 진입 시점에서 **§6 Phase η 에 이미 고정된 Server Wrapper 패턴(`page.tsx → ServerWrapper → Container(initialData)`)의 채택 확인 + CORS/프록시 방식((a) Nest CORS allowlist vs (b) Next `rewrites()` 프록시) 선택 + envelope 분기 처리 합의**. (데이터 페칭 *방식 자체*는 §6 Phase η 에서 Server Wrapper 로 확정돼 있으므로 G4 는 이를 재검토하는 열린 선택 게이트가 아니라 **채택 확인 + 잔여 구성(CORS/프록시·envelope) 결정** 게이트다 — 문서 내 의사결정 순서 일관)
- **G1** — 본 plan 은 내부 구조 작업이므로 §6 진척 보고 시점에 일괄

본 plan 은 **Phase α 는 이미 완료, Phase 1 이 첫 단계(FE 컨벤션 + spec 갱신)이며, 그 머지 후 Phase β·2·3·4·γ 가 G3·G4 *기술* 합의 게이트 없이 *착수* 가능** (Phase 1 의 spec 갱신 머지가 모든 BE/FE 마이그레이션 phase 의 선행 조건 — §0(권위 우선순위)·§10. 따라서 β 도 Phase 1 머지 후에 열린다). **단 phase 간 산출물 의존 순서는 지켜야 한다(게이트 부재 ≠ 무순서 병렬)**: δ 는 γ 의 entity/repository 골격 머지 후에만 착수, Phase 5(문서 마감)는 Phase 2~4 의 실제 경로 이동 완료 후에만 착수. Phase ε·ζ·η 는 위 합의 게이트 통과 + 선행 phase(δ 등) 완료 후 진입.

> ⚠ **단 기술 게이트(G3·G4) 부재 ≠ 무승인 착수.** 현행 루트 `CLAUDE.md` 의 **글로벌 작업 사용자 승인 규칙은 별도로 그대로 적용**된다 — 루트 문서 수정, `packages/*` 인터페이스 변경, `apps/backend/src/{common,config,database}/*` 편집 등은 사용자 명시 확인 필요. 본 plan 의 Phase 1/5(루트·CLAUDE.md·AGENTS.md 갱신), β(`apps/backend/src/common` 등 신설), γ(`database`), η(`packages/*` 본격 구현)는 정확히 이 범주를 포함하므로, 해당 PR 은 기술 게이트와 무관하게 **루트 승인 규칙을 먼저 충족**해야 착수한다. (이 문장은 §0 authority 의 루트 규칙 우선과 일관 — plan 이 루트 승인 규칙을 우회하지 않는다.)

단 **Phase β 는 "착수"와 "완료(머지)"의 조건이 다르다**: 게이트 없이 *착수*(PR open)는 가능하나, PR 진입 직후 30분 bun+NestJS spike 가 첫 작업이며 **spike 성공이 Phase β 완료(머지)의 전제**다(§6 Phase β 완료 기준 참조). spike 실패 시 해당 Phase β PR 은 보류되고 package manager 변경은 별도 인프라 결정 PR 로 분리된다. 즉 β 는 "바로 착수 가능하되, spike 성공 없이는 머지 불가"인 단계로 정의한다.

---

## 9. 본 plan 완료 정의

§1 "완료 기준" 6줄 모두 충족 시 — 사용자 명시("archive 로 옮겨")가 있을 때만 `proc/archive/2026-05-27_planner-alignment.md` 로 이동 (메모리 룰 `feedback_plan_archive.md` 기준).

planner 와 마찬가지로:

- 각 Phase PR 머지 시 본 plan 파일에 진척 체크박스 추가
- 전체 완료 시점에 사용자에게 archive 여부 확인

---

## 10. 다음 단계

본 plan 동의 시 — **Phase 1(FE 컨벤션 문서화 + spec 갱신)이 항상 선행**한다. §0(권위 우선순위, "후속 마이그레이션 PR 은 spec 갱신 PR 을 통해서만 진입")·§8 대로 Phase 1 PR 의 spec 갱신 머지가 이후 모든 BE/FE 마이그레이션 phase(β·γ·δ·1차 이후 FE…)의 선행 조건이기 때문이다. 사용자 결정 필요 항목:

1. **Phase 1 이후의 진입 순서** — Phase 1 머지 후 BE 트랙(β) 먼저 vs FE 트랙(Phase 2~5) 먼저 vs 병렬. (Phase 1 자체는 선택지가 아니라 항상 첫 단계 — β·병렬 옵션은 모두 "Phase 1 spec 머지 후" 를 전제로 한다. Phase 1 보다 β 를 먼저 여는 선택지는 §0/§8 선행 조건과 충돌하므로 제외)
2. **Phase 1 파일럿 페이지** — 후보 A (`analysis/ability` 66줄, mock 1개, route 보유) / 후보 B (`review/queue` 92줄, store 2개) / 후보 C (`infinity` 인덱스 154줄, mock 5개) 중 어느 것
3. **drizzle freeze 룰 명문화 시점** — **지금 즉시(본 plan 합의 시점)** vs Phase β 진입 시점 (Phase α 는 이미 D-Lite 로 완료됐으므로 "α 머지 직후" 는 소급일 뿐 — enforce 가능한 앞 시점만 선택지로 남김. freeze 종료는 §11 "drizzle 잔존 기간" 리스크 대로 Phase η 완료로 고정 — 레거시 `app/api`+`lib/db` 제거 시점)

본 3개 결정 — 사용자 응답 대기.
