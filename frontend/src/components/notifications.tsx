"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Notification } from '@/types'
import { 
  FaBell, FaTrophy, FaGift, FaUserFriends, FaCog, FaFire,
  FaRocket, FaGem, FaStar, FaHeart, FaLightbulb, FaCheck,
  FaTimes, FaEllipsisV, FaTrash, FaMarkdown
} from 'react-icons/fa'

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onDeleteNotification: (notificationId: string) => void
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationCenter({ 
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationClick 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'achievement' | 'social'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 필터링된 알림
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'achievement') return notification.type === 'achievement'
    if (filter === 'social') return notification.type === 'social'
    return true
  })

  const getNotificationIcon = (notification: Notification) => {
    const iconClass = "text-lg"
    
    switch (notification.type) {
      case 'achievement':
        if (notification.icon) return <span className={iconClass}>{notification.icon}</span>
        return <FaTrophy className={`${iconClass} text-yellow-400`} />
      case 'reminder':
        return <FaBell className={`${iconClass} text-blue-400`} />
      case 'social':
        return <FaUserFriends className={`${iconClass} text-green-400`} />
      case 'system':
        return <FaCog className={`${iconClass} text-gray-400`} />
      default:
        return <FaBell className={`${iconClass} text-blue-400`} />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-yellow-400/30 bg-yellow-500/10'
      case 'reminder': return 'border-blue-400/30 bg-blue-500/10'
      case 'social': return 'border-green-400/30 bg-green-500/10'
      case 'system': return 'border-gray-400/30 bg-gray-500/10'
      default: return 'border-white/20 bg-white/5'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    onNotificationClick?.(notification)
    if (notification.actionUrl) {
      // 네비게이션 로직
      window.location.href = notification.actionUrl
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 알림 버튼 */}
      <motion.button
        className="relative p-2 glass rounded-lg hover:bg-white/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaBell className="text-white text-xl" />
        
        {/* 알림 배지 */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 알림 드롭다운 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 top-full mt-2 w-80 md:w-96 glass rounded-2xl border border-white/20 shadow-2xl z-50 max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 헤더 */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">알림</h3>
                {unreadCount > 0 && (
                  <button
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    onClick={onMarkAllAsRead}
                  >
                    모두 읽음
                  </button>
                )}
              </div>

              {/* 필터 */}
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {[
                  { key: 'all', label: '전체' },
                  { key: 'unread', label: '안읽음' },
                  { key: 'achievement', label: '업적' },
                  { key: 'social', label: '소셜' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    className={`flex-1 py-1 px-2 rounded-md text-xs font-medium transition-all ${
                      filter === key 
                        ? 'bg-blue-500 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => setFilter(key as any)}
                  >
                    {label}
                    {key === 'unread' && unreadCount > 0 && (
                      <span className="ml-1 text-xs">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-white/60">
                  <FaBell className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>알림이 없습니다</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      className={`
                        relative p-3 rounded-xl border cursor-pointer transition-all
                        ${notification.isRead 
                          ? 'bg-white/5 border-white/10' 
                          : getNotificationColor(notification.type)
                        }
                        hover:bg-white/10
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* 읽지 않음 표시 */}
                      {!notification.isRead && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}

                      <div className="flex gap-3">
                        {/* 아이콘 */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification)}
                        </div>

                        {/* 내용 */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium mb-1 ${
                            notification.isRead ? 'text-white/80' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm leading-relaxed ${
                            notification.isRead ? 'text-white/60' : 'text-white/80'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-white/50 mt-2">
                            {new Date(notification.createdAt).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex-shrink-0">
                          <button
                            className="text-white/40 hover:text-white/70 transition-colors p-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteNotification(notification.id)
                            }}
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-white/10 text-center">
                <button
                  className="text-white/60 hover:text-white transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  알림 센터 닫기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 토스트 알림 컴포넌트
interface ToastNotificationProps {
  notification: Notification
  onClose: () => void
  duration?: number
}

export function ToastNotification({ notification, onClose, duration = 5000 }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 border-yellow-400/50'
      case 'reminder':
        return 'bg-gradient-to-r from-blue-500/90 to-purple-500/90 border-blue-400/50'
      case 'social':
        return 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 border-green-400/50'
      default:
        return 'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400/50'
    }
  }

  return (
    <motion.div
      className={`
        fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl border backdrop-blur-lg
        shadow-2xl ${getToastStyle(notification.type)}
      `}
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 text-2xl">
          {notification.icon || getNotificationIcon(notification)}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white mb-1">{notification.title}</h4>
          <p className="text-white/90 text-sm leading-relaxed">{notification.message}</p>
        </div>

        {/* 닫기 버튼 */}
        <button
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          onClick={onClose}
        >
          <FaTimes />
        </button>
      </div>

      {/* 진행률 바 */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  )
}

// 알림 관리 훅
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toastQueue, setToastQueue] = useState<Notification[]>([])

  // 새 알림 추가
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    }

    setNotifications(prev => [newNotification, ...prev])
    
    // 토스트 표시 (achievement, reminder 타입만)
    if (['achievement', 'reminder'].includes(notification.type)) {
      setToastQueue(prev => [...prev, newNotification])
    }
  }

  // 알림 읽음 처리
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  // 알림 삭제
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  // 토스트 제거
  const removeToast = (notificationId: string) => {
    setToastQueue(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }

  // 특정 타입 알림 생성 헬퍼
  const showAchievementNotification = (title: string, message: string, icon?: string) => {
    addNotification({
      type: 'achievement',
      title,
      message,
      icon: icon || '🏆'
    })
  }

  const showLevelUpNotification = (level: number) => {
    addNotification({
      type: 'achievement',
      title: '레벨 업!',
      message: `축하합니다! 레벨 ${level}에 도달했습니다.`,
      icon: '🎉'
    })
  }

  const showStreakNotification = (days: number) => {
    addNotification({
      type: 'achievement',
      title: '연속 학습 달성!',
      message: `${days}일 연속 학습을 달성했습니다! 🔥`,
      icon: '🔥'
    })
  }

  const showBadgeNotification = (badgeName: string) => {
    addNotification({
      type: 'achievement',
      title: '새 배지 획득!',
      message: `"${badgeName}" 배지를 획득했습니다!`,
      icon: '🏅'
    })
  }

  const showFriendNotification = (friendName: string, action: string) => {
    addNotification({
      type: 'social',
      title: '친구 활동',
      message: `${friendName}님이 ${action}`,
      icon: '👥'
    })
  }

  const showReminderNotification = (message: string) => {
    addNotification({
      type: 'reminder',
      title: '학습 알림',
      message,
      icon: '⏰'
    })
  }

  return {
    notifications,
    toastQueue,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    removeToast,
    // 헬퍼 함수들
    showAchievementNotification,
    showLevelUpNotification,
    showStreakNotification,
    showBadgeNotification,
    showFriendNotification,
    showReminderNotification
  }
}

// 전역 토스트 컨테이너
export function ToastContainer() {
  const { toastQueue, removeToast } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toastQueue.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastNotification
              notification={notification}
              onClose={() => removeToast(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function getNotificationIcon(notification: Notification) {
  return <FaBell className="text-blue-400" />
} 