@AGENTS.md

# 풀림 Q 작업 가이드 (모노레포)

이 리포는 [curea-co/pullim](https://github.com/curea-co/pullim) 의 BE 구조를 차용한 **bun workspace 모노레포**. 풀림 Q는 풀림 스터디 데모에서 추출된 단독 도메인으로, 본 리포는 향후 `pullim` 플랫폼에 흡수되기 전 단계의 단독 운영체.

> 도메인 구체 룰(UI 소스, 수정 금지 영역, 코드 패턴, 테스트 등)은 [`apps/q/CLAUDE.md`](./apps/q/CLAUDE.md) 참조.

## 0. 모노레포 구조

```
pullim-Q/
├── apps/
│   ├── q/              # Next.js 16 (App Router) — 풀림 Q FE
│   └── backend/        # NestJS 11 — Q 도메인 BE (Phase β 이후 본격)
├── packages/
│   ├── types/          # BE↔FE 공유 타입 (현재 빈 placeholder)
│   ├── api-client/     # FE → BE fetch 래퍼 (현재 빈 placeholder)
│   └── auth/           # IAuthProvider 추상화 + MockAuthProvider (현재 빈 placeholder)
├── proc/               # plan / spec / knowhow
├── input/              # 기획 문서
├── turbo.json
├── tsconfig.base.json
├── package.json        # workspace root
└── bun.lock
```

## 1. 도메인 범위

| 영역 | 경로 |
|---|---|
| **풀림 Q 페이지** | `apps/q/app/(student)/q/{infinity,talk,analysis,review}/` |
| **풀림 Q 컴포넌트** | `apps/q/components/{infinity,coach,conqueror,memory,study-index,xray}/` |
| **풀림 Q mock** | `apps/q/lib/mock/{infinity,coach,tutor,conqueror,memory,irt,xray,phase1}.ts` |

학생 홈 `/`은 `/q`로 redirect.

## 2. 공유 영역 (자유롭게 편집)

- `apps/q/components/shell/*` — AppHeader, AppSidebar, BottomNav, nav-config 등 셸 골격 (Q 전용으로 단순화됨)
- `apps/q/components/ui/*` — shadcn/ui 프리미티브
- `apps/q/components/brand/*` — 로고
- `apps/q/lib/mock/{features,domains,persona,curriculum}.ts` — Q 메타 + 공통 데이터
- `apps/q/lib/tokens/*`, `apps/q/lib/utils.ts`
- `apps/q/app/layout.tsx`, `apps/q/app/(student)/layout.tsx`
- `apps/q/{next.config.ts, eslint.config.mjs, package.json, tsconfig.json}`

## 3. mock 구조

`apps/q/lib/mock/index.ts`는 Q 도메인이 사용하는 mock만 barrel export. 정리 시 함께 갱신.

## 4. 명령어

| 작업 | 명령 |
|---|---|
| 의존성 설치 | `bun install` |
| Q FE dev (port 3031) | `bun run dev:q` |
| Backend dev (port 4031) | `bun run dev:backend` |
| 둘 다 dev (turbo 병렬) | `bun run dev` |
| Q build (standalone) | `bun run build:q` |
| Backend build | `bun run build:backend` |
| 전체 build | `bun run build` |
| 전체 typecheck | `bun run typecheck` |
| 전체 lint | `bun run lint` |

특정 워크스페이스에만 명령 실행:
```
bun --filter @pullim-q/q <script>
bun --filter @pullim-q/backend <script>
```

## 5. 도구 보조

| 상황 | 도구 |
|---|---|
| 검증 (라이브) | `bun run dev:q` 또는 docker compose 후 `/qa` |
| 검증 (정적) | `bun run typecheck && bun run lint && bun run build:q` |
| 도메인 추가 시 | 원본 데모 (`/Users/curea/dev_git/[260506] pullim-study-demo`) 에서 해당 도메인 복사 |

## 6. 글로벌 작업 (사용자 명시 확인 필요)

- root 파일(`package.json`, `turbo.json`, `tsconfig.base.json`) 편집
- `.github/workflows/**` 편집
- `packages/*` 내부 인터페이스 변경 (apps 양쪽 영향)
- `apps/backend/src/{common,config,database}/*` 편집 (BE 전역 영향, Phase β 이후)
- 새 도메인 모듈 추가
- 이 가이드 / AGENTS.md / README.md 편집
