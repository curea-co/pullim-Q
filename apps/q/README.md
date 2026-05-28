# apps/q

풀림 Q FE — 학생용 AI 문제 풀이·복습·진단 모듈. Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui.

## 빠른 시작

```bash
bun install                            # repo root에서
bun --filter @pullim-q/q dev           # http://localhost:3031
```

루트 `/` 진입 시 자동으로 `/q` 로 리다이렉트.

## 도메인

| 영역 | 경로 | 설명 |
|---|---|---|
| **infinity** | `/q/infinity` | 무한 문제 풀이 (solve, explain, history, exam) |
| **talk** | `/q/talk` | AI 튜터와 1:1 대화 |
| **analysis** | `/q/analysis` | 실력 진단 (diagnose, ability, process) |
| **review** | `/q/review` | 망각곡선 기반 복습 (conquer, memory, queue) |

## 디렉터리

```
apps/q/
├── app/                # App Router 페이지 + Route Handlers
├── components/         # ui (shadcn) · shell · brand · 도메인별
├── lib/                # db (drizzle) · mock · api · motion · review · store · tokens
├── __tests__/          # Jest 단위 테스트
├── e2e/                # Playwright E2E
├── drizzle/            # 마이그레이션
├── scripts/            # seed · QA
└── public/             # 정적 자산
```

src/ 디렉터리는 사용하지 않는다. `@/*` alias는 `apps/q/` 직속을 가리킨다.

## 명령어

| 작업 | 명령 |
|---|---|
| dev (port 3031) | `bun --filter @pullim-q/q dev` |
| build (standalone) | `bun --filter @pullim-q/q build` |
| start (prod) | `bun --filter @pullim-q/q start` |
| typecheck | `bun --filter @pullim-q/q typecheck` |
| lint | `bun --filter @pullim-q/q lint` |
| test (Jest) | `bun --filter @pullim-q/q test` |
| test E2E (Playwright) | `bun --filter @pullim-q/q test:e2e` |
| DB 시드 | `bun --filter @pullim-q/q db:seed` |
| DB 마이그레이션 생성 | `bun --filter @pullim-q/q db:generate` |
| DB push (로컬) | `bun --filter @pullim-q/q db:push` |
| DB studio | `bun --filter @pullim-q/q db:studio` |

## 기술 스택

- **런타임/패키지 매니저**: Bun 1.3.12
- **웹**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **UI**: shadcn/ui + Base UI (DS 패키지 미사용)
- **상태**: Zustand (로컬/전역), TanStack Query (서버)
- **DB**: PostgreSQL + Drizzle ORM
- **차트**: Recharts
- **수식**: KaTeX
- **테스트**: Jest + RTL (단위), Playwright (E2E)

## 환경 변수

`.env.example` 참조. 주요 값:

- `DATABASE_URL` — Postgres 연결 문자열 (기본: `postgres://pullim:pullim_local@localhost:5433/pullim_q`)

## 도커 빌드

```bash
# 컨텍스트는 monorepo 루트
docker buildx build --platform linux/arm64 -f apps/q/Dockerfile .
```

Next.js standalone 출력 기준. `apps/q/server.js` 가 진입점.

## 현 단계 메모

- BE 미연동 — `lib/mock/*` mock 데이터 + Route Handler 일부
- 인증 미도입 — Phase γ에서 `@pullim-q/auth` 추상화 위에 구현 예정
- i18n / Sentry / analytics 미도입 — 별 트랙
