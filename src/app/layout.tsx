import type { Metadata, Viewport } from 'next';
import { Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Pretendard는 globals.css의 CDN @import로 로드 (한글 가변폰트).
// 영문 모노스페이스는 next/font로 자체 호스팅.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BRAND = '풀림 Q';
const TAGLINE = '문제 풀이·해설·오답·유사문항';
const DESCRIPTION =
  '풀림 Q는 고등학생을 위한 문제 풀이 LMS. AI가 내 실력에 맞는 문제를 골라주고, 12-섹션 해설로 깊이 이해하고, 틀린 문제는 자동 정복 큐로, 유사 문항으로 패턴까지 다집니다. 무한 학습·코치 토크·X-Ray 분석으로 약점을 정조준하세요.';

// metadataBase: OG/Twitter 카드 절대경로 해석에 사용. Vercel 기본 배포 도메인 기준.
export const metadata: Metadata = {
  metadataBase: new URL('https://pullim-q.vercel.app'),
  title: {
    default: `${BRAND} — ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND,
  keywords: [
    '풀림 Q',
    'Pullim Q',
    '풀림',
    '문제 풀이',
    '문제풀이 LMS',
    'AI 문제집',
    'AI 해설',
    '오답노트',
    '오답 정복',
    '유사문항',
    '고등학생 문제집',
    '수능 대비',
    '내신 대비',
  ],
  authors: [{ name: 'curea' }],
  creator: 'curea',
  publisher: 'curea',
  formatDetection: { telephone: false, email: false, address: false },
  category: 'education',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    siteName: BRAND,
    title: `${BRAND} — ${TAGLINE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND} — ${TAGLINE}`,
    description: DESCRIPTION,
    creator: '@curea',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3B6FF6',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-full font-sans">
        <TooltipProvider delay={120}>{children}</TooltipProvider>
        <Toaster position="top-center" closeButton richColors />
      </body>
    </html>
  );
}
