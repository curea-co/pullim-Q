# 풀림 Q — "CUREA DEEP — 패턴 맞춤 5문제 풀이" 이동 전 안내 다이얼로그

> **대응 src/ 파일** (2026-05-14 기준): 현재 working tree 변경 0개. §3.4·§3.5 명시 파일이 작업 시 신규로 잡힘 — `components/conqueror/conquer-intro-dialog.tsx` 신규 + `error-pattern-list.tsx` 수정 + `q/review/conquer/page.tsx` `?patternId=` 시그니처 확장.
>
> **게이트키퍼**: G4 (다이얼로그 UI·접근성·localStorage 키 prefix) + G1 (마이크로카피 §3.3 확정).

## 1. 배경 / 문제 정의

`/q/review` 홈 우측 "내가 자주 틀리는 패턴" 카드([src/components/conqueror/error-pattern-list.tsx:66-72](../../src/components/conqueror/error-pattern-list.tsx#L66-L72)) 의 CTA 버튼 라벨:

> **CUREA DEEP — 패턴 맞춤 5문제 풀이**

이 버튼은 `/q/review/conquer` 로 직격 이동([src/app/(student)/q/review/conquer/page.tsx](../../src/app/(student)/q/review/conquer/page.tsx))하고, 도착지는:

- **다크 톤 워크룸 (Tier 3 "정복" 모드)** — 라이트 베이스인 review 홈과 톤이 급변
- **5문항 연속 풀이** — 중도 이탈 시 진행 상태 관리는 sessionStorage 한 줄에 의존(현재 미구현 가정)
- **3회 연속 정답 시 "패턴 정복" 스탬프** — 게임화 규칙이 클릭 후에야 학습됨
- 즉시 채점 + Toast — 시험과 다른 "분석/정복" 모드라는 사실 사전 인지 없음

**유저 지적 (2026-05-13)** — "버튼만 보고 어디로 가는지 감이 안 잡힌다. 팝업으로 사용자에게 먼저 인지시키고 이동시켜라."

추가로 "CUREA DEEP" 이라는 라벨은:
- 학생 입장에서 어떤 기능인지 1차 추론 불가 (브랜드 코드명일 뿐)
- "맞춤 5문제 풀이" 부분만 보면 일반 문제 풀이로 오해 가능

따라서 **이동 전 짧은 안내 다이얼로그**로 (a) 어디로 가는지 (b) 무엇이 일어나는지 (c) 시작·취소 두 선택지를 명시한다.

## 2. 원칙

1. **사용자는 멍청이 — 친절·예측가능성 최우선.** 모드 전환은 이동 전 안내가 디폴트.
2. **다이얼로그는 광고가 아니다.** 본문은 3가지 핵심만(텍스트 4~6줄), 일러스트 과대 노출 금지.
3. **첫 진입은 강제 노출, 이후는 학생이 선택.** 같은 패턴에 두 번째 이상 진입 시 "다음부터 보지 않기" 옵션 활성. 단, 학습 효과에 핵심적이지 않은 경우에만.
4. **모바일 우선.** 360px에서 다이얼로그가 화면을 압도하지 않고, 닫기/시작 두 버튼이 엄지로 도달.
5. **다이얼로그 = 게이트, 본문은 항상 같은 톤.** 학습이 끝난 학생도 다시 봤을 때 정보 가치가 있어야 함(규칙 환기).

## 3. 다이얼로그 명세

### 3.1 트리거

- `/q/review` 의 "내가 자주 틀리는 패턴" 카드 안 CTA 버튼 클릭 ([src/components/conqueror/error-pattern-list.tsx:66-72](../../src/components/conqueror/error-pattern-list.tsx#L66-L72))
- 클릭 시점에 **`<Link>` 를 `<button>` 으로 교체** — 라우팅은 다이얼로그의 "시작" 버튼에서만 수행

### 3.2 레이아웃 (모바일 우선, 360px 기준)

```
┌──────────────────────────────────────┐
│  [×]                                  │
│                                       │
│  🎯  정복 모드 시작                    │
│      패턴: {p.name}                   │
│  ────────────────────────────────────  │
│  • 5문항 연속 풀이 (이동 가능)         │
│  • 3회 연속 정답 → 패턴 정복 스탬프    │
│  • 분석·복습·플래너에 결과 자동 반영   │
│                                       │
│  소요 시간: 약 5~8분                   │
│                                       │
│  ┌──────────────┐  ┌────────────────┐ │
│  │   취소        │  │   시작하기 →   │ │
│  └──────────────┘  └────────────────┘ │
│                                       │
│  □ 다음부터 보지 않기                  │
└──────────────────────────────────────┘
```

- 헤더: 아이콘 + "정복 모드 시작" + 1줄 부제(패턴명)
- 본문: 3가지 bullet (행위·보상·연쇄효과) + 1줄 소요시간
- 액션: 좌 "취소"(secondary) / 우 "시작하기 →"(primary, `pullim-blue-600`)
- 옵션: 하단 작은 체크박스 "다음부터 보지 않기" — 첫 진입은 비활성(체크해도 다음 같은 패턴부터 적용)
- 닫기: 우상단 × + ESC + 백드롭 클릭(데스크탑) 모두 = "취소"
- 모바일에서 `Sheet` 변형(아래에서 슬라이드) 대신 **중앙 모달 유지** — 다이얼로그 의도가 "주의 환기"라서 화면 중앙 우선

### 3.3 마이크로카피 (확정)

```
타이틀:     정복 모드 시작
부제:       {p.name}
본문 (3 bullets):
  • 5문항 연속 풀이 — 중간에 멈추고 이어 풀 수 있어요
  • 3회 연속 정답이면 패턴 정복 스탬프
  • 결과는 분석·복습·플래너에 바로 반영돼요
부가:       소요 시간 약 5~8분
주 액션:    시작하기 →
보조 액션:  취소
체크박스:   다음부터 같은 안내 보지 않기
```

- "CUREA DEEP" 라벨은 다이얼로그 본문에서 **제외**. 학생은 기능을 이해해야지 코드명을 외울 필요 없음.
- 진입 트리거 버튼 라벨도 후속에서 정리할 여지: "맞춤 5문제 정복 시작 →" 같은 동사형이 더 친절. (이 plan §7에 별도 항목)

### 3.4 컴포넌트

- 신규: [src/components/conqueror/conquer-intro-dialog.tsx](../../src/components/conqueror/conquer-intro-dialog.tsx)
  - props: `{ pattern: ErrorPattern; trigger: ReactNode; }` 또는 `open/onOpenChange` controlled 둘 다 지원
  - 내부에서 `useRouter().push('/q/review/conquer?patternId=…')` 호출
  - shadcn/ui `Dialog` 사용 ([src/components/ui/dialog.tsx](../../src/components/ui/dialog.tsx))
- 수정: [src/components/conqueror/error-pattern-list.tsx](../../src/components/conqueror/error-pattern-list.tsx) — `<Link>` 를 `<ConquerIntroDialog>` trigger 로 감싼 `<button>` 으로 교체

### 3.5 라우팅·상태

- `/q/review/conquer` 가 `?patternId=` 를 받아 해당 패턴 컨텍스트로 시작하도록 확장 (현재 mock 의 `todayConquestSet` 고정 — 후속에서 패턴별 분기 가능. 이 plan은 라우트 시그니처만 정리)
- "다음부터 보지 않기" 상태:
  - localStorage 키 `pullim.q.conquer.intro.dismissed` (boolean 또는 `Record<patternId, true>`)
  - 첫 진입 시 항상 노출. 체크박스 ON + "시작하기" 클릭 시 그 패턴(또는 전체)에 대해 저장.
  - **추천**: 체크박스 단위는 "전체"(=모든 패턴). 패턴별로 다이얼로그 다시 보고 싶어할 가능성 낮음. 향후 데이터 보고 변경 여지.

### 3.6 빈도 가드 — 다이얼로그 광고화 방지

- 다이얼로그 본문 텍스트는 항상 동일 (광고 카피처럼 매 진입 다른 문구로 변하지 않음)
- 일러스트/이미지 사용 안 함. 아이콘 1개 + 텍스트만.
- 본문 ≤ 6줄, 액션 ≤ 2개 + 체크박스 1개 (스펙 위반 시 리뷰 차단)

## 4. 접근성

- `Dialog`(Radix 기반 shadcn) 의 디폴트 포커스 트랩 + 백드롭 + ESC 닫기 사용
- 트리거 버튼: `aria-haspopup="dialog"`, `aria-expanded` (Radix가 자동 처리)
- 타이틀: `<DialogTitle>` 로 마운트, `<DialogDescription>` 에 부제+본문
- 주 액션 버튼은 다이얼로그 오픈 시 **포커스 디폴트 = "취소"** (실수 진입 방지). 키보드 학생은 Tab → "시작하기"
  - 학생 도메인 가이드 §11.1 "친절" 우선. 데스크탑 학생이 Enter 연타로 사고 진입하는 케이스 차단.

## 5. 적용 범위 (이번 plan)

- `/q/review` 의 "내가 자주 틀리는 패턴" 카드 CTA 1군데
- 패턴 카드별로 다이얼로그 인스턴스 (props 로 해당 `pattern` 주입)

## 6. 비범위

- 다른 라우트 (`/q/review/conquer` 내부 액션, `/q/infinity` 등) 의 모드 전환 다이얼로그는 별도 plan
- 다이얼로그 A/B 텍스트 테스트 — 다이얼로그 본문 변형은 차후 데이터로
- 패턴별 "이 다이얼로그만 끄기" 단위 — 일단 전역 1 flag
- 라우트 시그니처 `?patternId=` 의 **실제 처리** (mock 고정 큐 분기). 이 plan은 다이얼로그 게이트만.

## 7. 후속 — 같이 보면 좋은 디테일

- CTA 라벨에서 "CUREA DEEP" 제거 또는 작게 → "패턴 맞춤 5문제 정복 시작 →" 등 동사 우선
- "내가 자주 틀리는 패턴" 카드 자체에 진행도(현재 정복도 X/Y) 가 이미 있음 — 다이얼로그 본문에서 "지금 X/Y → 도달 가능 Z" 같은 1줄 진행 텍스트 추가 검토

## 8. 검증

- **정적**: `bunx tsc --noEmit && bun run lint && bun run build`
- **시각·동작 (라이브)**: `bun dev` → `/q/review` 에서:
  - 패턴 카드 CTA 클릭 시 다이얼로그가 정확히 1회 오픈
  - "시작하기" → `/q/review/conquer` (현재 동일 경로)로 push
  - "취소" / × / ESC / 백드롭 클릭 모두 다이얼로그 close 만 (이동 X)
  - "다음부터 보지 않기" ON + 시작 → 재진입 시 다이얼로그 skip, 곧장 `/q/review/conquer`
  - localStorage 비운 후 다시 표시
  - 모바일 360px / 데스크탑 1280px 두 viewport
  - 키보드: Tab/Shift+Tab 포커스 트랩, ESC 닫힘, 디폴트 포커스 = "취소"
- **DS 준수**: [proc/spec/08-design-system.md](../spec/08-design-system.md) §14.1 (한 화면 ≤4 색 강조), §7.3 (Primary CTA 1개 — 다이얼로그 안 "시작하기" 1개만 풀채도) 자가 점검

## 9. 위험과 완화

- **위험**: 다이얼로그가 거추장스럽다는 피드백.
  - 완화: "다음부터 보지 않기" 옵션 + 본문 ≤ 6줄 ≤ 3 bullet 엄수.
- **위험**: localStorage 키가 다른 도메인 dismissed flag 와 충돌.
  - 완화: 키 prefix `pullim.q.` 유지. 신규 키는 모두 이 prefix 강제 (CLAUDE.md/AGENTS.md 가이드 적용).
- **위험**: "다음부터 보지 않기" 체크 후 학생이 규칙을 잊고 잘못 진입.
  - 완화: 정복 모드 워크룸 내부 헤더에 이미 규칙 요약(3회 연속 정답 → 정복) 노출되어 있음([src/app/(student)/q/review/conquer/page.tsx:181-205](../../src/app/(student)/q/review/conquer/page.tsx#L181-L205)) — 게이트 우회해도 규칙은 다시 보임.
