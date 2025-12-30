import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: '다낭 여행 트래커',
    template: '%s | 다낭 여행 트래커',
  },
  description: '2026년 1월 다낭 여행의 실시간 진행 상황을 추적하는 PWA 웹앱. GPS 위치 추적, 체크인 기능, Google Maps 연동으로 여행을 더욱 편리하게 관리하세요.',
  keywords: [
    '다낭여행',
    '여행트래커',
    '여행일정',
    '다낭여행앱',
    '여행진척도',
    'PWA',
    '베트남여행',
    '다낭',
    'GPS추적',
    '여행관리',
  ],
  authors: [{ name: '다낭 여행 트래커' }],
  creator: '다낭 여행 트래커',
  publisher: '다낭 여행 트래커',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '다낭여행',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: '다낭 여행 트래커',
    description: '2026년 1월 다낭 여행의 실시간 진행 상황을 추적하는 PWA 웹앱',
    siteName: '다낭 여행 트래커',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: '다낭 여행 트래커 아이콘',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: '다낭 여행 트래커',
    description: '2026년 1월 다낭 여행의 실시간 진행 상황을 추적하는 PWA 웹앱',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1a202c' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
