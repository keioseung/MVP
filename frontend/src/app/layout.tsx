import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI 마스터리 허브 - 인공지능 학습 플랫폼',
  description: '게임화된 AI 학습 경험으로 인공지능을 마스터하세요. 퀴즈, 플래시카드, 랭킹 시스템과 함께하는 최고의 학습 플랫폼',
  keywords: ['AI', '인공지능', '학습', '교육', '퀴즈', '플래시카드', '게임화'],
  authors: [{ name: 'AI Mastery Hub Team' }],
  creator: 'AI Mastery Hub',
  publisher: 'AI Mastery Hub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI 마스터리 허브',
  },
  openGraph: {
    type: 'website',
    siteName: 'AI 마스터리 허브',
    title: 'AI 마스터리 허브 - 인공지능 학습 플랫폼',
    description: '게임화된 AI 학습 경험으로 인공지능을 마스터하세요',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI 마스터리 허브',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI 마스터리 허브 - 인공지능 학습 플랫폼',
    description: '게임화된 AI 학습 경험으로 인공지능을 마스터하세요',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        {/* PWA 관련 메타 태그 */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI 마스터리 허브" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* 성능 최적화 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* SEO 및 보안 */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* 모바일 최적화 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="AI 마스터리 허브" />
        
        {/* 스플래시 스크린 이미지들 */}
        <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
        <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
        
        {/* PWA 설치 배너를 위한 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA 설치 배너 로직
              let deferredPrompt;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                // 설치 배너 표시 로직
                const installBanner = document.createElement('div');
                installBanner.innerHTML = \`
                  <div class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 shadow-2xl border border-white/20 backdrop-blur-md">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h4 class="text-white font-bold text-sm">앱으로 설치하기</h4>
                        <p class="text-white/80 text-xs">더 빠르고 편리한 학습을 위해 앱을 설치하세요</p>
                      </div>
                      <button onclick="installPWA()" class="px-4 py-2 bg-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/30 transition-colors">
                        설치
                      </button>
                      <button onclick="this.parentElement.parentElement.remove()" class="p-2 text-white/60 hover:text-white transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                \`;
                document.body.appendChild(installBanner);
                
                // 3초 후 자동 페이드인
                setTimeout(() => {
                  installBanner.style.opacity = '0';
                  installBanner.style.transform = 'translateY(100%)';
                  installBanner.style.transition = 'all 0.3s ease';
                  setTimeout(() => {
                    installBanner.style.opacity = '1';
                    installBanner.style.transform = 'translateY(0)';
                  }, 100);
                }, 3000);
              });
              
              window.installPWA = async () => {
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    console.log('PWA 설치됨');
                  }
                  deferredPrompt = null;
                }
              };
              
              // 서비스 워커 등록
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // 온라인/오프라인 상태 감지
              window.addEventListener('online', () => {
                const toast = document.createElement('div');
                toast.innerHTML = \`
                  <div class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    인터넷 연결이 복구되었습니다
                  </div>
                \`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
              });
              
              window.addEventListener('offline', () => {
                const toast = document.createElement('div');
                toast.innerHTML = \`
                  <div class="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    인터넷 연결이 끊어졌습니다
                  </div>
                \`;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
              });
            `,
          }}
        />
      </body>
    </html>
  )
}

// 글로벌 CSS 추가 애니메이션
const globalStyles = `
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
    }
  }
  
  .animate-slide-up {
    animation: slide-up 0.6s ease-out;
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }
  
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  
  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(59, 130, 246, 0.7);
  }
  
  /* 선택 영역 스타일링 */
  ::selection {
    background: rgba(59, 130, 246, 0.3);
    color: white;
  }
  
  /* 포커스 스타일링 */
  .focus-ring:focus {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 2px;
  }
  
  /* 터치 디바이스 최적화 */
  @media (hover: none) and (pointer: coarse) {
    .hover\\:scale-105:hover {
      transform: none;
    }
    
    .hover\\:bg-white\\/10:hover {
      background-color: transparent;
    }
  }
  
  /* 고대비 모드 지원 */
  @media (prefers-contrast: high) {
    .glass {
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid white;
    }
    
    .text-white\\/60 {
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  /* 애니메이션 줄이기 설정 */
  @media (prefers-reduced-motion: reduce) {
    .animate-slide-up,
    .animate-shimmer,
    .animate-float,
    .animate-glow {
      animation: none;
    }
    
    * {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }
` 