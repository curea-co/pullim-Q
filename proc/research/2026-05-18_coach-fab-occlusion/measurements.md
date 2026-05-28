# CoachFab 모바일 점유 측정 — 2026-05-18

> mobile 360×740 viewport · 6 라우트 × 3 변형 (FAB 그대로 / 제거 / 44×44 축소)
> 캡처: `captures/{route}-{variant}.png` (18장)

## 변형별 가린 픽셀 (viewport 점유 = w × h)

| 라우트 | FAB 그대로 (px²) | FAB 제거 (px²) | FAB 44×44 (px²) |
|---|---:|---:|---:|
| q-home | 6238 | 0 | 2288 |
| q-infinity | 6238 | 0 | 2288 |
| q-analysis | 6238 | 0 | 2288 |
| q-review | 6238 | 0 | 2288 |
| q-analysis-diagnose | 6238 | 0 | 2288 |
| q-onboarding | 6238 | 0 | 2288 |

## 정리

- viewport 총 점유: 360 × 740 = 266,400 px²
- FAB 그대로 평균 가린 면적: **6238 px²** (viewport 의 2.34%)
- FAB 44×44 평균 가린 면적: **2288 px²** (viewport 의 0.86%)
- FAB 제거: 0 px² (안1 BottomNav 통합 시 모바일 점유 0)

## G4 의사결정 보조

- **안1 (BottomNav 5번째 슬롯 통합 + FAB md: 데스크탑 전용)** → 가린 픽셀 0
- **안2 (모바일 44×44 icon-only 축소)** → 가린 픽셀 약 50% 감소(텍스트 라벨 손실)
- 캡처를 비교해 마지막 카드 CTA 가시성 영향을 함께 검토