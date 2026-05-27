# apps/q AGENTS.md

> AI 코드 리뷰 에이전트(Codex 등)가 PR을 리뷰할 때 참고하는 가이드라인.

## 앱 개요
- 학생 앱 (Next.js 16 App Router, port 3031)
- API: 현 단계 mock + `lib/api/` 로컬 헬퍼 (BE 미연동, Phase γ에서 `apps/backend` 이식)
- 인증: 미도입 (Phase γ에서 `@pullim-q/auth` 추상화 위에 구현 예정)
- i18n: 미도입 (한국어 하드코딩 허용)
- UI: `@/components/ui/*` (shadcn/ui + Base UI). DS 패키지 미사용
- 관측: Sentry / analytics / remote-config 미도입
- 상태: TanStack Query (서버), Zustand (로컬/전역), useState (UI)
- DB: Drizzle ORM (PostgreSQL)

## 디렉터리 구조 (src/ 없음 — `apps/q/` 직속)

```
apps/q/
├── app/                               # App Router (Container import + Suspense)
│   ├── (student)/q/{infinity,talk,analysis,review}/
│   └── api/                           # Route Handlers
├── components/
│   ├── ui/                            # shadcn/ui 프리미티브
│   ├── shell/ · brand/                # 셸/브랜드
│   ├── infinity/ · coach/ · conqueror/
│   ├── memory/ · study-index/ · xray/ · analysis/
│   └── question-hub/
├── lib/
│   ├── db/                            # drizzle (개발자 전용)
│   ├── api/                           # API 헬퍼 (개발자 전용)
│   ├── mock/                          # mock 데이터
│   ├── motion/ · review/ · store/ · tokens/
│   └── utils.ts
├── __tests__/                         # Jest 단위 테스트
├── e2e/                               # Playwright
├── drizzle/ · scripts/ · public/
└── package.json · jest.config.ts · tsconfig.json
```

---

## Must Fix (병합 차단)

### 1. UI 컴포넌트 소스
- `@/components/ui/*` (shadcn/ui) 사용 — 이 앱은 DS 패키지 미설치
- `lucide-react`, `sonner` 직접 import **허용** (DS 재export 없음)
- ❌ 금지 import:
  - `@pullim/design-system/*` (미설치)
  - `@pullim/ui` (미설치)
  - MUI / FontAwesome 등 미설치 패키지

### 2. i18n
- **i18n 미도입 — 한국어 하드코딩 허용**
- `useTranslations()` / `getTranslations()` / `next-intl` 도입 금지 (Phase 별 트랙)
- 메시지 파일 (`messages/*.json`) 없음

### 3. 관측 / 분석 — 미도입
- ❌ `@sentry/*` import 금지
- ❌ `@pullim/analytics`, `@pullim/remote-config` import 금지
- 에러 처리: `console.error` / `toast.error` 만 사용

### 4. 수정 금지 영역
| 경로 | 이유 |
|---|---|
| `lib/db/` | 스키마/DB 접근 (개발자 전용) |
| `lib/api/` | 개발자 전용 |
| `lib/store/` | 전역 상태 (zustand) |
| `package.json` | 의존성 변경 |
| `next.config.ts` | 설정 변경 |
| `tsconfig.json` | 설정 변경 |
| `drizzle/` | 마이그레이션 보존 |
| `drizzle.config.ts` | DB 설정 |

→ 배포 파이프라인 도입·긴급 이슈 대응 등 예외는 **PR 본문 근거 명시 필수**.

### 5. Container / Presenter 패턴
- `components/<도메인>/`:
  - `containers/` — `"use client"`, 상태·핸들러·mock 호출만. `useState`, `useCallback`, `useRouter`, `useSearchParams`
  - `presenters/` — 순수 렌더링, props 만 받음. `"use client"` 없음 권장
  - `components/` — 도메인 내부 재사용 UI
- `app/*/page.tsx` 는 **Container import + `<Suspense>` 래핑** 만. 로직 금지
- Presenter / components 에서 API 호출 / 전역 상태 / 라우팅 hook 사용 **금지** (간단한 UI 상태 useState 는 허용)

### 6. 데이터 / 인증 레이어
- ❌ `fetch("/api/...")` 직접 호출 금지 → `lib/api/` 헬퍼 사용
- DB 접근: 서버 컴포넌트 / Route Handler 에서 `import { db } from "@/lib/db"` 만 사용 (클라이언트 컴포넌트에서 import 금지)
- 인증 로직 직접 작성 금지 (Phase γ까지는 mock 사용자)

### 7. Mock 데이터
- `lib/mock/*` 한글 데이터 허용 (i18n 예외)
- **Container 에서만** import (Presenter 에서 import 금지)
- Phase γ에서 `apps/backend` API 로 점진 교체 예정 — 새 mock 추가 시 미래 API 시그니처 고려

### 8. 보안
- Secret 하드코딩 금지
- `process.env.*` 직접 참조는 **`NEXT_PUBLIC_*`** 만 허용 (클라이언트)
- 서버 전용 env (DATABASE_URL 등) 는 server-only 모듈에서만

---

## Should Fix (권장 수정)

### 9. 스타일링
- **Tailwind CSS v4 만** (인라인 `style={{...}}` 금지)
- shadcn semantic 토큰 우선: `text-foreground`, `bg-background`, `border-border`
- primitive 토큰 (`text-gray-500`, `bg-white`) 보다 semantic 우선
- `cn` 유틸: `@/lib/utils`
- 모바일 우선 반응형: 기본 → `md:` → `lg:`

### 10. 모바일 대응
- shadcn `Dialog` 가 `mobileFullscreen` 미지원 시: `useSyncExternalStore` 로 isMobile 분기 (JS 레벨)
- ❌ CSS `hidden` 으로 모바일/데스크탑 분기 불가 (모달 portal 과 충돌)
- 모바일 = 풀스크린 `<div>`, 데스크탑 = `<Dialog>`

### 11. 파일 네이밍
- 컴포넌트 파일: **kebab-case.tsx** (현 코드베이스 컨벤션 — `analysis-two-axis.tsx`, `coach-chat.tsx`)
- 훅 파일: **use-X.ts** (kebab-case)
- 유틸 / 스키마: kebab-case 또는 `schema.ts` 고정

### 12. import 경로
- `@/*` = `apps/q/` 루트 alias (src/ 없음)
- `@pullim-q/*` = workspace 패키지 (현재 packages/* 는 빈 placeholder)
- 같은 feature 내부는 상대 경로 허용
- `import type` 사용 (TS 컴파일 최적화)

### 13. 테스트
- **Jest + RTL** (단위 테스트, `bun --filter @pullim-q/q test`)
  - 설정: `apps/q/jest.config.ts` + `apps/q/test/setup.ts`
  - 공통 setup: `<repo-root>/config/jest.setup.ts` (next/navigation mock)
  - `next/navigation` mock 은 전역 자동
  - 컴포넌트 테스트는 RTL `render` + user-event 패턴
- **Playwright** (E2E, `bun --filter @pullim-q/q test:e2e`)
  - 스펙: `e2e/*.spec.ts`

---

## Nit
- 변수명 개선 제안
- 접근성 (aria-*, semantic HTML)
- import 순서 정렬 (외부 → workspace → 내부)
- 중복 로직 추출 제안

---

## 자동 검증 명령

```bash
bun --filter @pullim-q/q typecheck
bun --filter @pullim-q/q lint
bun --filter @pullim-q/q test
bun --filter @pullim-q/q build
```
