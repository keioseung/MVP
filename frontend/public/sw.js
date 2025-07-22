const CACHE_NAME = 'ai-mastery-hub-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/auth',
  '/quiz',
  '/ai-info',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  // 정적 자산들
  '/_next/static/css/',
  '/_next/static/js/',
  // 폰트
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://fonts.gstatic.com/',
]

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service Worker: Cached all files')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
})

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Claiming clients')
        return self.clients.claim()
      })
  )
})

// 패치 이벤트 (네트워크 요청 가로채기)
self.addEventListener('fetch', (event) => {
  // API 요청 처리
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 성공적인 API 응답은 캐시하지 않음 (실시간 데이터)
          return response
        })
        .catch(() => {
          // 오프라인일 때 기본 응답 반환
          return new Response(
            JSON.stringify({ 
              error: 'Offline', 
              message: '인터넷 연결을 확인해주세요' 
            }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          )
        })
    )
    return
  }

  // 정적 자산 및 페이지 처리 (Cache First 전략)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 캐시에서 발견되면 즉시 반환
        if (cachedResponse) {
          // 백그라운드에서 업데이트된 버전 확인
          fetch(event.request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone)
                  })
              }
            })
            .catch(() => {
              // 네트워크 오류 무시
            })
          
          return cachedResponse
        }

        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // 응답 복사 (한 번만 사용할 수 있기 때문)
            const responseToCache = response.clone()

            // 캐시에 저장
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
          .catch(() => {
            // 네트워크 실패 시 오프라인 페이지 반환
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
            
            // 이미지 요청 실패 시 기본 이미지 반환
            if (event.request.destination === 'image') {
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">이미지 없음</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              )
            }
          })
      })
  )
})

// 푸시 알림 이벤트
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  let notificationData = {
    title: 'AI 마스터리 허브',
    body: '새로운 알림이 있습니다!',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-96x96.png',
    tag: 'ai-mastery-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: '확인하기',
        icon: '/action-open.png'
      },
      {
        action: 'dismiss',
        title: '닫기',
        icon: '/action-close.png'
      }
    ],
    data: {
      url: '/dashboard'
    }
  }

  // 푸시 데이터가 있으면 파싱
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      console.error('Service Worker: Failed to parse push data', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 탭이 있는지 확인
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // 새 탭에서 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// 백그라운드 동기화 이벤트
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  
  if (event.tag === 'study-progress') {
    event.waitUntil(syncStudyProgress())
  }
})

// 학습 진행률 동기화 함수
async function syncStudyProgress() {
  try {
    // IndexedDB에서 오프라인 데이터 가져오기
    const offlineData = await getOfflineStudyData()
    
    if (offlineData.length > 0) {
      // 서버로 데이터 전송
      const response = await fetch('/api/sync-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: offlineData })
      })

      if (response.ok) {
        // 성공적으로 동기화된 데이터 삭제
        await clearOfflineStudyData()
        console.log('Service Worker: Study progress synced successfully')
      }
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync study progress', error)
    // 동기화 실패 시 재시도를 위해 다시 등록
    self.registration.sync.register('study-progress')
  }
}

// 오프라인 데이터 관리 함수들
async function getOfflineStudyData() {
  // 실제 구현에서는 IndexedDB 사용
  return []
}

async function clearOfflineStudyData() {
  // 실제 구현에서는 IndexedDB 사용
  return Promise.resolve()
}

// 메시지 이벤트 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// 주기적 백그라운드 동기화 (실험적 기능)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered')
  
  if (event.tag === 'daily-check') {
    event.waitUntil(performDailyCheck())
  }
})

async function performDailyCheck() {
  try {
    // 일일 미션 업데이트, 스트릭 확인 등
    const response = await fetch('/api/daily-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      // 새로운 미션이나 업적이 있으면 알림 표시
      if (data.hasNewMissions || data.hasNewAchievements) {
        self.registration.showNotification('AI 마스터리 허브', {
          body: '새로운 일일 미션이 준비되었습니다!',
          icon: '/android-chrome-192x192.png',
          tag: 'daily-missions',
          data: { url: '/dashboard' }
        })
      }
    }
  } catch (error) {
    console.error('Service Worker: Daily check failed', error)
  }
}

// 오류 처리
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error occurred', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled promise rejection', event.reason)
}) 