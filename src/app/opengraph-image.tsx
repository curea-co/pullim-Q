import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '풀림 Q — 문제 풀이·해설·오답·유사문항';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          padding: 72,
          background: 'linear-gradient(135deg, #1E50C9 0%, #3B6FF6 60%, #6B9CF8 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.18)',
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            Q
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#FFE25A',
            }}
          >
            PULLIM · Q
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1.05,
            }}
          >
            풀림 Q
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1.2,
              color: 'rgba(255,255,255,0.92)',
            }}
          >
            문제 풀이 · 해설 · 오답 · 유사문항
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 8,
              fontSize: 22,
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            고등학생을 위한 문제 풀이 LMS
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            fontSize: 18,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 1,
          }}
        >
          q.pullim.co
        </div>
      </div>
    ),
    size,
  );
}
