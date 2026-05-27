import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '풀림 Q — 문제 풀이·해설·오답·유사문항';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 동적 OG 이미지 — 카카오톡·슬랙·Twitter/X 임베드 시 노출.
// 풀림 블루 그라디언트 + 레몬 옐로우 액센트 + 3단 카피 + 풀림 Q 핵심 기능.
export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'linear-gradient(135deg, #1E50C9 0%, #3B6FF6 55%, #6B9CF8 100%)',
          color: 'white',
          fontFamily:
            'system-ui, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
          position: 'relative',
        }}
      >
        {/* 우상단 글로우 — 레몬 옐로우 발광 */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            right: -220,
            width: 640,
            height: 640,
            borderRadius: 999,
            background:
              'radial-gradient(circle, rgba(255,226,90,0.28) 0%, transparent 70%)',
          }}
        />

        {/* 좌하단 글로우 — 화이트 발광 */}
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -180,
            width: 520,
            height: 520,
            borderRadius: 999,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          }}
        />

        {/* 상단 로고 영역 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 76,
              height: 76,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.16)',
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            Q
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 4,
                color: '#FFE25A',
                textTransform: 'uppercase',
              }}
            >
              Pullim · Q
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              by curea
            </div>
          </div>
        </div>

        {/* 중앙 헤드라인 — 3단 카피 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 116,
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1.02,
              color: 'white',
            }}
          >
            풀림 Q
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 46,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.94)',
              lineHeight: 1.25,
            }}
          >
            문제 풀이 · 해설 · 오답 · 유사문항
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 26,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.5,
              maxWidth: 940,
            }}
          >
            AI가 내 실력에 맞는 문제를 골라주고, 12-섹션 해설로 깊이 이해하고,
            틀린 문제는 자동 정복 큐로
          </div>
        </div>

        {/* 하단 액센트 + 도메인 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                background: '#FFE25A',
              }}
            />
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              무한 학습 · 코치 토크 · X-Ray 분석
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            pullim-q.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
