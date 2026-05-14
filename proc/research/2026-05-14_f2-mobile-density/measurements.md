# F-2 모바일 카드 밀도 측정 (before)

> 측정 시점: 2026-05-14
> 대응 plan: [proc/plan/2026-05-14_q-f2-mobile-card-density.md](../../plan/2026-05-14_q-f2-mobile-card-density.md)
> Viewport: chromium 360×740 (Android baseline)
> 캡처: [captures-before/](captures-before/)

## 1. `/q/infinity/solve` — 모드 선택 / 세션 피커

[infinity-solve-360.png](captures-before/infinity-solve-360.png)

| 항목 | 측정값 (대략) |
|---|---|
| PageHeader 높이 (eyebrow + title + description) | ~120px |
| 모드 선택 카드 (연습 / 시험) 묶음 높이 | ~180px (2 옵션 + 카드 padding) |
| "풀이 세션 선택" 섹션 헤딩 + description | ~80px |
| 세션 카드 높이 (단일) | ~80px |
| 카드 padding (수직) | 16px (`p-4` 기준) |
| 카드 사이 gap | 12px (`gap-3`) |
| 1 viewport (740px) 안 노출 | PageHeader + 모드 카드(2 옵션) + 섹션 헤딩 + 세션 카드 2 |
| BottomNav 점유 | ~60px |
| **유효 본문 영역** | 580px (740 − 60 BottomNav − 100 AppHeader) |

**관찰**: 모드 카드가 viewport 1/3을 차지. 본문(세션 피커)이 viewport 하단 1/3 으로 밀려서 세션 2개만 노출. **밀도 빡빡함**.

## 2. `/q/review` — 복습 홈

[review-360.png](captures-before/review-360.png)

| 항목 | 측정값 (대략) |
|---|---|
| PageHeader 높이 (2줄 title 포함) | ~140px |
| KpiBand 높이 (4 KPI, 2×2 그리드) | ~160px |
| "지금 복습할 것" 섹션 헤딩 + description | ~80px |
| 정복 세트 풀기 CTA | ~60px (full width) |
| 큐 행 (queue row) 높이 | ~80px (모바일 2-line 분기 X — 현재 1-line 압박) |
| 1 viewport (740px) 안 노출 | PageHeader + KpiBand 4개 + 섹션 헤딩 + CTA + 큐 행 2 |
| **유효 본문 영역** | 580px |

**관찰**: KpiBand 4개가 viewport 1/4 차지. 정복 세트 CTA + 큐 행이 viewport 끝에서 짤림 (큐 2번 카드만 절반 보임). **가장 빡빡**. 사용자 지적 "10,000개" 시나리오에서 페이지네이션 없는 평면 리스트가 어떻게 깨질지 review-priority-queue plan §1 과 일관된 신호.

## 3. `/q/review/conquer` — 정복 세트 풀이

[review-conquer-360.png](captures-before/review-conquer-360.png)

| 항목 | 측정값 (대략) |
|---|---|
| Breadcrumb (복습 홈으로) | ~40px |
| 패턴 헤더 카드 (정복 세트 칩 + 패턴명 2줄 + 설명) | ~180px |
| stat 3개 (진행/연속/시도) | ~70px |
| 문제 카드 헤더 (SKU + 메타) | ~40px |
| 문제 본문 (수식 1줄) | ~60px |
| 보기 행 높이 | ~50px |
| 보기 사이 gap | 12px (`space-y-3` 추정) |
| 1 viewport (740px) 안 노출 | Breadcrumb + 패턴 헤더 + stat + 문제 본문 + 보기 3개 |
| **유효 본문 영역** | 580px |

**관찰**: 문제 카드가 viewport 1/2 시점에 진입. 보기 3개 노출은 적절. 패턴 헤더가 풀이마다 그대로라 후속 진입(2번째 이상 문제)에선 sticky 또는 collapse 후보. **밀도 적절**.

## 4. 종합 판단 제안

| 라우트 | 현재 밀도 | 비교 권장 |
|---|---|---|
| `/q/infinity/solve` | 빡빡 (모드 카드 큼) | (b) 단계적 — 모드 카드 padding `p-6` → `p-4` 시도, 세션 카드 그대로 |
| `/q/review` | 가장 빡빡 (KpiBand 큼) | (b) 단계적 — KpiBand 1줄 2개 모바일 변형 또는 padding `p-4` → `p-3` 시도 |
| `/q/review/conquer` | 적절 | (a) 유지. 단, 2번째 문제부터 패턴 헤더 sticky/collapse 후속 plan 후보 |

> **G1 판단 필요**: 후보 (a) / (b) / (c) — 본 자료 + 캡처 3장 기반 정성 비교. 권장 = 라우트별 분리 처리 (review = (b), infinity-solve = (b), review-conquer = (a)).

## 5. 다음 단계

- [ ] G1 정성 확인 — review·infinity-solve 카드 밀도 줄임 OK 확인
- [ ] OK 시 별도 PR `feat/q-mobile-card-density-{routes}` — 위 (b) 시도 + after 캡처
- [ ] after 캡처는 `proc/research/2026-05-14_f2-mobile-density/captures-after/` 에 저장
- [ ] 최종 판단 후 `proc/plan/2026-05-14_q-f2-mobile-card-density.md` §6 결과 절 채우고 `[x]` 마감

## 6. 측정 한계 (작성자 주)

- 픽셀 측정은 캡처 시각 분석 — DevTools 정밀 측정 아님. ±4px 오차 가능
- `p-4` 가정은 코드 grep 결과 기반, 실제 적용 padding 은 클래스 합성에 따라 다를 수 있음
- 텍스트 line-height vs font-size 비율은 시각으로 적정 (~1.5~1.7) — 별도 정밀 측정 생략
- 380·414 추가 viewport 캡처는 G1 요청 시 추가 (plan §8 위험 완화)
