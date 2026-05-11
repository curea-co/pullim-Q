@AGENTS.md

# 풀림 Q 작업 가이드

이 프로젝트는 **풀림 Q 단독 워크스페이스**. 풀림 스터디 데모에서 Q 도메인만 추출했으며, 다른 도메인(플래너·라이브러리·클래스봇·스튜디오·스토어)의 페이지·컴포넌트·mock·메타데이터는 모두 제거됨.

## 1. 도메인 범위

| 영역 | 경로 |
|---|---|
| **풀림 Q 페이지** | `src/app/(student)/q/{infinity,talk,analysis,review,onboarding}/` |
| **풀림 Q 컴포넌트** | `src/components/{infinity,coach,conqueror,memory,study-index,xray}/` |
| **풀림 Q mock** | `src/lib/mock/{infinity,coach,tutor,conqueror,memory,irt,xray,phase1}.ts` |

학생 홈 `/`은 `/q`로 redirect.

## 2. 공유 영역 (자유롭게 편집)

- `src/components/shell/*` — AppHeader, AppSidebar, BottomNav, nav-config 등 셸 골격 (Q 전용으로 단순화됨)
- `src/components/ui/*` — shadcn/ui 프리미티브
- `src/components/study/coming-soon.tsx` — `/me` 페이지 placeholder (다른 study 컴포넌트는 모두 제거)
- `src/components/brand/*` — 로고
- `src/lib/mock/{features,domains,persona,curriculum}.ts` — Q 메타 + 공통 데이터
- `src/lib/tokens/*`, `src/lib/utils.ts`
- `src/app/layout.tsx`, `src/app/(student)/layout.tsx`
- `next.config.ts`, `eslint.config.mjs`, `package.json`, `tsconfig.json`

## 3. mock 구조

`lib/mock/index.ts`는 Q 도메인이 사용하는 mock만 barrel export. 정리 시 함께 갱신.

## 4. 도구 보조

| 상황 | 도구 |
|---|---|
| 검증 (라이브) | `bun dev` 또는 docker compose 후 `/qa` |
| 검증 (정적) | `bunx tsc --noEmit && bun run lint && bun run build` |
| 도메인 추가 시 | 원본 데모 (`/Users/curea/dev_git/[260506] pullim-study-demo`) 에서 해당 도메인 복사 |
