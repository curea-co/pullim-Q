# 풀림 Q

풀림 스터디 데모에서 **풀림 Q 도메인만 추출**한 단일 도메인 워크스페이스.
원본: `/Users/curea/dev_git/[260506] pullim-study-demo`

## 풀림 Q 도메인이란?

학생용 AI 기반 문제 풀이·복습·진단 모듈. 4개 하위 영역으로 구성:

| 하위 영역 | 경로 | 설명 |
|---|---|---|
| **infinity** | `/q/infinity` | 무한 문제 풀이 (solve, explain, history, exam) |
| **talk** | `/q/talk` | AI 튜터와 1:1 대화 |
| **analysis** | `/q/analysis` | 실력 진단 (diagnose, ability, process) |
| **review** | `/q/review` | 망각곡선 기반 복습 (conquer) |

루트 `/` 진입 시 자동으로 `/q`로 리다이렉트.

## 구조

```
pullim-Q/
├── input/       # 입력·참고 데이터 (SPARK)
├── proc/        # 명령 처리 규칙
│   ├── spec/        # 설계 명세
│   ├── plan/        # 작업 계획
│   ├── archive/     # 비활성 문서
│   ├── research/    # 조사·분석 결과
│   └── knowhow/     # 재사용 프롬프트
├── output/      # 출력 데이터
├── public/      # 정적 자산
└── src/
    ├── app/
    │   ├── layout.tsx, globals.css
    │   └── (student)/
    │       ├── layout.tsx, page.tsx (→ /q redirect), me/
    │       └── q/                 # 풀림 Q 페이지 (4개 sub-domain + onboarding)
    ├── components/
    │   ├── shell/, ui/, study/coming-soon, brand/   # 공유 컴포넌트
    │   ├── infinity/, coach/, conqueror/             # Q 도메인 컴포넌트
    │   ├── memory/, study-index/, xray/
    └── lib/
        ├── utils.ts
        ├── tokens/
        └── mock/                  # Q 도메인 + 공유 mock만 (다른 도메인 mock 모두 제거)
```

## 시작

```bash
bun install
bun dev   # http://localhost:3030
```

## 기술 스택

- **런타임/패키지 매니저**: Bun
- **웹**: Next.js 16 (App Router) + React 19 + TypeScript + TailwindCSS 4
- **UI**: shadcn/ui + Base UI
- **상태**: Zustand, TanStack Query
- **차트**: Recharts
- **수식**: KaTeX

## 추출 범위 메모

- ✅ Q 페이지·컴포넌트·mock 모두 복사
- ✅ 공유 영역(shell, ui, brand, tokens, utils) 유지
- ✅ 다른 도메인(planner, library, classbot, studio, store, parent, teacher) 페이지·컴포넌트·mock·nav·메타데이터 모두 제거
- ✅ Role 시스템(student/teacher/parent) → student 단일로 단순화 (role-switcher 제거)
- ✅ Q 컴포넌트 내부의 cross-domain 참조(플래너 블록 연동 등) 정리
- ✅ PR 자동 리뷰: `.github/workflows/codex-review.yml` (Codex 한국어 인라인 리뷰)
