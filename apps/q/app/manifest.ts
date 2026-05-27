import type { MetadataRoute } from 'next';

// PWA manifest — 홈 화면 추가·앱 등록 시 사용.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '풀림 Q — 문제 풀이·해설·오답·유사문항',
    short_name: '풀림 Q',
    description:
      '고등학생을 위한 문제 풀이 LMS. AI 해설·오답 정복·유사문항으로 약점을 정조준.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F4F7FE',
    theme_color: '#3B6FF6',
    lang: 'ko-KR',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32 48x48',
        type: 'image/x-icon',
      },
    ],
  };
}
