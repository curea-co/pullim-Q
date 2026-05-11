# 2026-05-06 Drift 리포트 (Spec ↔ 실제 코드)

## 목표
방금 생성한 `proc/spec/`이 현재 `web/` 코드와 얼마나 정합하는지 검증하고, 어긋난 부분을 정직하게 기록.

## 작업 항목
- [x] 라우트 정합 확인 — `proc/spec/03-features-and-ia.md` ↔ `web/app/`
- [x] Mock 파일 정합 확인 — `proc/spec/06-content-data.md` ↔ `web/lib/mock/`
- [x] 컴포넌트 정합 확인 — `proc/spec/03·08` ↔ `web/components/`
- [x] 토큰 정합 확인 — `proc/spec/08-design-system.md` ↔ `web/app/globals.css`
- [ ] **다음 작업**: drift 항목을 `/update-spec` 또는 코드 수정으로 해결

---

## 발견된 Drift

### 🔴 Drift 1: 교사 라우트 위치 — spec과 실제 불일치

**spec (`03-features-and-ia.md` 2.2)**:
```
/teacher/classbot/{live,quiz,reports,grading,templates,settings}
```

**실제**:
```
/teacher/{live,quiz,reports,grading,templates,settings}
/teacher/classbot/page.tsx (단일)
/teacher/replay/[id]/page.tsx
```

→ `classbot` 하위가 아니라 `/teacher/*` 직속에 6 운영 라우트가 위치. STATUS.md(2026-04-29) 시점과 현재(2026-05-06) 사이 변경이 있었던 것으로 추정.

**조치 필요**: spec을 코드에 맞춰 갱신 (또는 IA 결정 재확인 후 코드 정렬).

---

### 🟡 Drift 2: 풀림 분석 탭 → 실제로는 별도 라우트

**spec (`03-features-and-ia.md` 2.1, 4.7)**:
```
/q/analysis?tab=ability
/q/analysis?tab=process
```

**실제**:
```
/q/analysis/ability/page.tsx
/q/analysis/process/page.tsx
```

→ 쿼리 탭이 아니라 **분리된 sub-route**. 동작은 비슷하지만 IA 표현이 다름.

**조치 필요**: spec을 코드 기준으로 수정 — `/q/analysis/ability`, `/q/analysis/process`로.

---

### 🟡 Drift 3: 풀림 복습 — `/q/review/master` 부재

**spec (`03-features-and-ia.md` 2.1)**:
```
/q/review/conquer
/q/review/master  (locked)
```

**실제**:
```
/q/review/page.tsx
/q/review/conquer/page.tsx
/q/review/onboarding/page.tsx
```

→ `master/` 폴더 없음. STATUS.md에는 "locked"로 표기되어 있어서 폴더만 만들지 않은 의도된 상태일 수 있음.

**조치 필요**: 의도 확인 후 spec 또는 코드 정렬.

---

### 🟡 Drift 4: 플래너 캘린더 통합 — 옛 라우트 폴더 잔존

**spec (`10-roadmap.md` 2.1)**:
> 옛 `/day`, `/week`, `/month`는 redirect

**실제**:
```
/planner/calendar/page.tsx  ✅ 통합
/planner/day/page.tsx       ⚠️ 여전히 존재
/planner/week/page.tsx      ⚠️ 여전히 존재
/planner/month/page.tsx     ⚠️ 여전히 존재
```

→ STATUS.md 2026-04-27 Audit에서는 "redirect 폴더 6개 삭제"라고 했지만 플래너 day/week/month는 폴더 자체는 남아있고, 안의 page.tsx가 redirect 컴포넌트인 것으로 추정.

**조치 필요**: redirect 페이지 동작 확인. 정상이면 spec에 명시 (옛 라우트는 redirect 페이지로 살아있음).

---

### 🟡 Drift 5: spec에 누락된 신규 라우트 (1주일 사이 추가됨)

다음 라우트는 STATUS.md 시점 이후 추가된 것으로 보이며, spec에 명세되지 않음:

| 라우트 | 추정 역할 |
|------|---------|
| `/store` | 학생 스토어 entry (Phase 3 미구현이지만 페이지는 있음) |
| `/studio` | 학생 스튜디오 entry (Phase 2 미구현이지만 페이지는 있음) |
| `/classbot/discover` | 클래스봇 발견 페이지 |
| `/classbot/onboarding` | 학생 클래스봇 온보딩 |
| `/library/create/[type]` | 라이브러리 4종 생성기 (image/short/audio/card) |
| `/library/storage` | 자료실 (그리드/목록) |
| `/library/visual/[id]` | VLM 카탈로그 상세 |
| `/library/visual/onboarding` | 비주얼 온보딩 |
| `/library/visual/page.tsx` | VLM 카탈로그 |
| `/q/onboarding`, `/q/analysis/onboarding`, `/q/infinity/onboarding`, `/q/review/onboarding`, `/q/talk/onboarding`, `/planner/onboarding` | 각 도메인별 첫 진입 온보딩 |
| `/q/infinity/explain/[sku]` | 문항별 해설 (옛 spec엔 단일 explain) |
| `/q/infinity/exam-result` | 시험 결과 (옛 spec엔 `/q/infinity/exam`) |
| `/teacher/replay/{,[id]}` | 교사용 리플레이 (학생 `/classbot/replay`와 별도) |
| `/teacher/page.tsx` | 교사 홈 (spec에 없음) |

**조치 필요**: `/update-spec`으로 03·04·10 갱신.

---

### 🟢 Drift 6: 라이브러리 IA — spec에 단순화돼 있음

**spec (`03-features-and-ia.md` 2.1)**:
```
/library
/library/[id]
```

**실제**: 위 5번에 나열된 풍부한 라이브러리 라우트 트리.

**조치 필요**: spec의 라이브러리 섹션을 실제 IA로 보강.

---

### 🟢 Drift 7: Mock 파일 — `phase1.ts` 신규

**spec (`06-content-data.md` 11)**: 페르소나·교육과정·기능 등 16개 mock 파일 명시 — `phase1.ts` 미명시.

**실제**: `web/lib/mock/phase1.ts` 존재.

**조치 필요**: phase1.ts 역할 확인 후 spec에 추가.

---

### 🟢 정합 확인된 부분

다음은 spec과 코드가 일치:
- ✅ 디자인 토큰 (모든 컬러·타이포·라운드·그림자 — `08-design-system.md` ↔ `globals.css`)
- ✅ Mock 페르소나 (김수학·서연·하윤·도현·박선생 등) — `06` ↔ `lib/mock/persona.ts`
- ✅ 도메인 컴포넌트 폴더 구조 — `09` ↔ `components/`
- ✅ 통합 shell 컴포넌트 — `09` ↔ `components/shell/`
- ✅ 풀림 무한풀기 sub-route 5개 — `03` ↔ `web/app/(student)/q/infinity/`
- ✅ 봇 빌더 8단계 위저드 — `03` ↔ `/teacher/builder`
- ✅ 플래너 빌더 8단계 — `03` ↔ `/planner/builder`

---

## 비고

### 이 drift의 성격
모두 **명세보다 코드가 앞서간** 양상. 즉 spec(역설계 시점)이 STATUS.md(2026-04-29) 시점을 기반으로 하기 때문에 그 후 1주일의 진화를 반영하지 못함. 이건 본 마이그레이션의 한계가 아니라 **자연스러운 현상**.

### 해결 방향 (사용자 결정 필요)

#### 옵션 A — `/update-spec` 호출로 spec을 코드에 맞춤
- 코드를 진실로 보고 spec 갱신
- "drift = 정상 진화" 관점
- 권장: 새 IA·라우트가 의도된 결정이라면 이 옵션

#### 옵션 B — spec을 의도된 상태로 보고 코드 정렬
- spec을 진실로 보고 코드 수정
- "spec = 의도, 코드 = 임시 일탈" 관점
- 권장: 신규 라우트가 검증되지 않은 실험이라면 이 옵션

#### 옵션 C — 차분 검토
- 항목별로 의도성 확인 (Drift 1~7)
- 의도된 변경: 옵션 A
- 비의도 일탈: 옵션 B

### 미해결 검증 (다음 작업)
- [ ] 실제 코드 동작 확인 (`pnpm dev` 후 라우트 직접 방문)
- [ ] 플래너 day/week/month 페이지가 진짜 redirect인지 확인
- [ ] phase1.ts 역할 파악
- [ ] 신규 라우트 의도성 사용자 확인
