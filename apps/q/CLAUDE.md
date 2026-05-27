# apps/q

풀림 Q FE — Next.js 16 (App Router), port 3031. 학생용 AI 문제 풀이·복습·진단 모듈.

## UI 컴포넌트 — shadcn/ui 사용

이 앱은 **shadcn/ui + Base UI** 로컬 프리미티브 기반이다. (pullim 정본의 `@pullim/design-system` 미사용 — 추후 별 트랙)

```
@/components/ui/*       ← shadcn/ui 프리미티브 (Button, Card, Dialog, Input, Tabs 등)
lucide-react            ← 아이콘 (DS 재export 없음 — 직접 import 허용)
sonner                  ← toast (DS 재export 없음 — 직접 import 허용)
@base-ui/react          ← 일부 복합 컴포넌트
```

- DS 패키지(`@pullim/design-system`) 미설치 — import 시도 금지
- 새 shadcn 컴포넌트는 `bunx shadcn@latest add <name>` 로 추가 (components.json 의 css 경로 `app/globals.css` 확인)
- `cn` → `@/lib/utils`

## i18n — 미도입

- 사용자 노출 텍스트 **한국어 하드코딩** 허용 (next-intl 미설치)
- 추후 i18n 도입은 별 트랙으로 진행 — 현 단계에서는 `useTranslations()` 패턴 도입 금지
- 영어 메시지가 필요한 경우에도 하드코딩

## 관측 — 미도입

- **Sentry 미설치** — `@sentry/*` import 금지, `logService` 패턴 미사용
- 분석/원격 설정(`@pullim/analytics`, `@pullim/remote-config`) 미설치
- 에러는 `console.error` 또는 `toast.error` 로만 처리

## 데이터 레이어 — Drizzle ORM

```
apps/q/lib/db/schema.ts   ← drizzle 스키마 (PostgreSQL)
apps/q/lib/db/index.ts    ← db 인스턴스 (export const db)
apps/q/drizzle/           ← 마이그레이션 SQL + 메타
apps/q/drizzle.config.ts  ← drizzle-kit 설정 (schema: ./lib/db/schema.ts)
```

- DB 접근은 `import { db } from "@/lib/db"` 만 사용
- 스키마 변경 시 `bun run db:generate` → `bun run db:push` (로컬) / `bun run db:migrate` (배포)
- 시드: `bun run db:seed`

## Mock 잔존 — Phase γ에서 BE 이식 예정

```
apps/q/lib/mock/
├── infinity.ts · coach.ts · tutor.ts · conqueror.ts
├── memory.ts · irt.ts · xray.ts · phase1.ts
├── features.ts · domains.ts · persona.ts · curriculum.ts · wrong-reason.ts
└── index.ts (barrel export)
```

- 현 단계에서는 페이지/컴포넌트가 `@/lib/mock/*` 에서 직접 import
- Phase γ에서 `apps/backend` (NestJS 11, port 4031) 로 점진 이식 예정
- Container 에서만 mock import 권장 (Presenter 에서는 props 로 전달)

## 디렉터리 구조

```
apps/q/
├── app/                           # App Router (no src/)
│   ├── (student)/q/{infinity,talk,analysis,review}/   # Q 도메인 페이지
│   ├── api/                       # Route Handlers
│   ├── layout.tsx · globals.css · manifest.ts
│   └── opengraph-image.tsx · twitter-image.tsx
├── components/
│   ├── ui/                        # shadcn/ui 프리미티브 (수정 가능, 셸 공유)
│   ├── shell/                     # AppHeader, AppSidebar, BottomNav 등
│   ├── brand/                     # 로고
│   ├── infinity/ · coach/ · conqueror/
│   ├── memory/ · study-index/ · xray/ · analysis/
│   └── question-hub/
├── lib/
│   ├── db/                        # drizzle (개발자 전용)
│   ├── api/                       # API 헬퍼 (개발자 전용)
│   ├── mock/                      # mock 데이터
│   ├── motion/ · review/ · store/ · tokens/
│   └── utils.ts                   # cn 등
├── drizzle/                       # 마이그레이션
├── scripts/                       # seed, QA 스크립트
├── e2e/                           # Playwright
├── public/
├── package.json · tsconfig.json
├── next.config.ts · postcss.config.mjs · eslint.config.mjs
├── drizzle.config.ts · components.json
└── Dockerfile
```

## 수정 금지 영역

| 경로                    | 이유              |
| ----------------------- | ----------------- |
| `lib/db/`               | 스키마/DB 접근    |
| `lib/api/`              | 개발자 전용       |
| `lib/store/`            | 전역 상태 (zustand) |
| `package.json`          | 의존성 변경 금지  |
| `next.config.ts`        | 설정 변경 금지    |
| `tsconfig.json`         | 설정 변경 금지    |
| `drizzle/`              | 마이그레이션 보존 |
| `drizzle.config.ts`     | DB 설정           |

## Container/Presenter 패턴

```
components/<도메인>/
├── containers/     ← 상태, 핸들러, mock 호출. "use client"
├── presenters/     ← 순수 렌더링. props만 받음
└── components/     ← 소형 재사용 UI
```

- `app/(student)/q/<도메인>/page.tsx` 는 Container만 import + Suspense 래핑
- Container에서 `useState`/`useCallback`/`useRouter` 사용
- Presenter / 하위 컴포넌트에서 API 호출 / 전역 상태 / 라우팅 hook 사용 금지 (간단한 UI 상태 useState 는 허용)

## 코드 패턴

### 허용

```tsx
const [isOpen, setIsOpen] = useState(false);
import { getMockInfinity } from "@/lib/mock/infinity";
import { Button } from "@/components/ui/button";  // shadcn (DS 아님)
import { Search } from "lucide-react";            // 직접 import OK
import { toast } from "sonner";                   // 직접 import OK
import { db } from "@/lib/db";                    // server-only
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
```

### 금지

```tsx
import { Button } from "@pullim/design-system";        // 미설치
import { useTranslations } from "next-intl";          // 미도입
import * as Sentry from "@sentry/nextjs";             // 미도입
fetch("/api/...");                                    // API 헬퍼 사용 (lib/api/)
```

## 스타일링

- Tailwind CSS v4 만 사용 (인라인 style 금지)
- 모바일 우선 반응형: 기본 → `md:` → `lg:`
- shadcn semantic 토큰: `text-foreground`, `bg-background`, `border-border`
- primitive 토큰(`text-gray-500` 등)보다 semantic 토큰 우선

## 테스트

- **Jest + RTL** (단위 테스트): `bun --filter @pullim-q/q test`
  - 설정: `jest.config.ts`, `test/setup.ts`
  - 공통 mock: `<repo-root>/config/jest.setup.ts` (next/navigation 등)
- **Playwright** (E2E): `bun --filter @pullim-q/q test:e2e`
  - 스펙: `e2e/*.spec.ts`

## 커밋 전 확인

- `bun --filter @pullim-q/q typecheck` 통과
- `bun --filter @pullim-q/q lint` 통과
- `bun --filter @pullim-q/q test` 통과
- shadcn 외 컴포넌트 소스 import 없는지 확인 (DS 패키지 import 금지)

## 명령어

| 작업                    | 명령                                       |
| ----------------------- | ------------------------------------------ |
| dev (port 3031)         | `bun run dev:q`                            |
| build (standalone)      | `bun run build:q`                          |
| typecheck               | `bun --filter @pullim-q/q typecheck`       |
| lint                    | `bun --filter @pullim-q/q lint`            |
| test (Jest)             | `bun --filter @pullim-q/q test`            |
| test E2E (Playwright)   | `bun --filter @pullim-q/q test:e2e`        |
| DB 시드                 | `bun --filter @pullim-q/q db:seed`         |
| DB 마이그레이션 생성    | `bun --filter @pullim-q/q db:generate`     |
| DB push (로컬)          | `bun --filter @pullim-q/q db:push`         |
