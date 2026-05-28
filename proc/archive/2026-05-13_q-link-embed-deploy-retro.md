# 풀림 Q — 2026-05-13 링크 임베드 배포 trial 회고

## 컨텍스트
링크 임베드 메타데이터 풍부화([PR #24](https://github.com/curea-co/pullim-Q/pull/24)) 직후, Vercel production 배포와 Slack 임베드 검증 과정에서 진단을 다섯 차례 잘못함. 사용자 즉각 지적으로 진짜 원인이 드러남. 본 문서는 실제 처리된 변경, 잘못된 가설들, 진짜 원인, 그리고 다음에 적용할 행동 규칙을 기록.

## 실제 처리된 변경
- [PR #24](https://github.com/curea-co/pullim-Q/pull/24) — 메타데이터 풍부화 (layout / manifest / opengraph-image / twitter-image / verify-brand-meta 27항목). [proc/plan/2026-05-13_q-link-embed-metadata.md](../2026-05-13_q-link-embed-metadata.md) 기반
- [PR #27](https://github.com/curea-co/pullim-Q/pull/27) — dev → main 30 커밋 동기화. 발견: `main`이 초기 워크스페이스 추출 이후 한 번도 갱신 안 됨. Vercel production이 2일 전 첫 deploy 그대로였음
- 수동 `vercel --prod` 트리거 — 발견: main 머지 후에도 자동 production deploy 트리거 안 됨. 새 deploy `dpl_GLNjFGFv3EBNqqPwWuRS5RMum6tV` 띄움
- 최종 확인: Slack 임베드 "풀림 Q — 문제 풀이·해설·오답·유사문항" 정상 노출 (사용자 확인)

## 잘못된 가설 시간선

| # | 가설 | 사용자 지적 | 사실 |
|---|---|---|---|
| 1 | Cloudflare 용어 "Attack Challenge Mode"가 Vercel에도 있다 | "vercel에 attack challenge mode같은거 없어" | Vercel 정식 명칭은 **Attack Mode**. Cloudflare 용어를 가져옴 |
| 2 | 대시보드 Settings → Security에 토글 있다 | "Settings - Security 에 접근하면 ... 밖에 없어. 적어도 웹 서칭은 좀 해봐라" | 실제 위치는 **별도 사이드바 Firewall 탭 → Bot Management**. 추측 안내 |
| 3 | Attack Mode가 켜져 있다 | "이미 기본값이 꺼져있는 상태인데" | 기본 off. CLI도 동작 거부함 (`dangerous_operation_requires_user`) |
| 4 | 메신저 캐시(첫 3시간 옛 메타) 단독 원인 | "다른 도메인은 다 돌아가는데 너만 안돌아가면 코드 차이를 분석하는 게 우선" | classbot도 첫 deploy 시점 옛 메타 동일. 단독 원인 아님 |
| 5 | Slack 봇 만들기 / 새 alias 도메인 추가 제안 | "도메인을 추가한다느니... 그냥 원인 분석이나 먼저 해" | 진단 전 회피책 제안. 부담만 안김 |

## 진짜 원인
같은 머신·같은 시각·같은 `Slackbot-LinkExpanding 1.0` UA로 1:1 페치 비교:

```
pullim-q.vercel.app/q          → HTTP 403  "Vercel Security Checkpoint"
pullim-classbot.vercel.app/classbot  → HTTP 200  "풀림 클래스봇 — 교사가 만드는 AI 학습 교실" (정상 head)
```

**pullim-q 프로젝트에만 firewall/protection이 봇 UA를 challenge로 차단**. classbot은 동일 조건에 정상 응답. 그 결과 Slack 봇이 우리 production HTML에 접근 자체 못함 → Slack 캐시가 "첫 deploy 시점에 마침 통과했던 옛 메타"로 박힘 → 새 메타로 영원히 갱신 못함.

이 차이는 `vercel project inspect` CLI에는 안 보였음 (CLI는 General/Framework Settings만 표시). Vercel **Firewall 탭** 또는 **Deployment Protection** 설정의 프로젝트별 차이로 추정. 사용자 측 처리로 정상화됨.

## 코드/history 측 확인 (둘 다 동일)
- `src/app/layout.tsx` 메타 정의, `src/app/(student)/layout.tsx` 메타 없음, `src/app/(student)/q/page.tsx` 메타 없음 — 정상 chain
- pullim-q 첫 deploy 시점 layout.tsx (`a0f9556`): `title: '풀림 스터디 — AI 학습 파트너'`
- classbot 첫 deploy 시점 layout.tsx (`223c178`): `title: '풀림 스터디 — AI 학습 파트너'` (동일)
- 두 프로젝트 모두 rename 커밋 보유 (Q: `bad7da0`, CB: `7db23a3`)
- 두 프로젝트 모두 `/` → 자기 경로 307 redirect 동일
- → **코드/history 차이로는 차이 설명 불가**. 외부 설정 차이만 남음

## 회고 — 5가지 실수
1. **정상 동료 프로젝트와 1:1 비교를 진단 후반부에야 함.** 같은 머신·같은 UA로 양쪽 페치하면 5분 안에 "Q만 403, CB는 200" 드러났을 일. 처음부터 했어야 함.
2. **추측한 도메인 용어/메뉴 위치를 그대로 안내.** Cloudflare "Attack Challenge Mode" → Vercel에 가져다 씀. Settings → Security 위치도 본인 확인 없이 단정.
3. **사용자 "기본 off" 답변을 받자 즉시 캐시 이론으로 갈아탐.** 가설을 갈아탈 때 추가 검증 없이 다음 가설을 단정. 가설 전환마다 1단계 검증 필요.
4. **진단 미완 상태에서 사용자 부담 큰 회피책 제안.** "Slack 봇 만들기 5분 셋업", "새 alias 도메인 추가 1분" 등. 사용자 입장: 원인도 모르면서 회피책 요청.
5. **WebFetch 한계(head 짤림)를 진단 도구 부족으로 받아들이고 인프라 의심으로 직행.** curl이 403 받았을 때 "내 IP가 rate limit 걸렸다"로 단정. 같은 머신의 classbot이 200 받는다는 사실을 확인했으면 IP 가설 즉시 깨졌을 것.

## Learning to apply (다음 발생 시)

- **인프라 의심 진단 첫 번째 단계는 "같은 환경의 정상 동료" 1:1 비교**. 같은 팀/플랫폼에 정상 동작하는 프로젝트가 있으면, 가장 먼저 동일 조건(같은 UA, 같은 시각, 같은 머신)으로 페치해서 응답이 같은지부터 본다.
- **외부 도메인 용어와 메뉴 위치는 공식 문서 + 사용자 확인 둘 다 통과해야 안내.** 추측한 경로를 단정 톤으로 알려주지 말 것.
- **가설 전환 시점마다 최소 한 가지 추가 검증.** "off라고 답을 받음" → 다음 가설 직행 금지. "그러면 다음 후보는 X. 검증을 위해 Y를 확인" 한 번 더.
- **회피책(URL 변경, 별도 봇, alias 추가)은 원인 확정 후에만 제안.** 진단 중에 회피책을 던지면 사용자는 "원인도 모르면서"를 듣게 됨.
- **curl 차단 = 우리 IP 차단 단정 금지.** 같은 머신에서 정상 동료 프로젝트 페치 결과가 다르면 IP 가설 즉시 깨짐.
