"use client"

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Notification, Badge, GameAchievement } from '@/types'
import { 
  FaBell, FaTrophy, FaStar, FaFire, FaGift, FaInfoCircle,
  FaExclamationTriangle, FaCheckCircle, FaTimes, FaMagic
} from 'react-icons/fa'

// 알림 컨텍스트
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  showToast: (message: string, type?: ToastType) => void
  showAchievement: (achievement: GameAchievement) => void
  showBadgeUnlock: (badge: Badge) => void
  showLevelUp: (newLevel: number, rewards?: { xp: number, points: number }) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// 알림 프로바이더
interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [achievementPopup, setAchievementPopup] = useState<GameAchievement | null>(null)
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null)
  const [levelUpPopup, setLevelUpPopup] = useState<{ level: number, rewards?: { xp: number, points: number } } | null>(null)

  // 알림 추가
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    }
    
    setNotifications(prev => [notification, ...prev])
    
    // 자동으로 토스트 메시지도 표시
    if (notificationData.type !== 'system') {
      showToast(notificationData.title, getToastTypeFromNotification(notificationData.type))
    }
  }, [])

  // 알림 제거
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // 읽음 처리
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])

  // 모든 알림 제거
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // 토스트 메시지
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const toast: Toast = {
      id: `toast_${Date.now()}_${Math.random()}`,
      message,
      type,
      createdAt: Date.now()
    }
    
    setToasts(prev => [...prev, toast])
    
    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 3000)
  }, [])

  // 업적 팝업
  const showAchievement = useCallback((achievement: GameAchievement) => {
    setAchievementPopup(achievement)
    showToast(`🏆 업적 달성: ${achievement.name}`, 'success')
  }, [showToast])

  // 배지 언락 팝업
  const showBadgeUnlock = useCallback((badge: Badge) => {
    setBadgePopup(badge)
    showToast(`🎖️ 새 배지: ${badge.name}`, 'success')
  }, [showToast])

  // 레벨업 팝업
  const showLevelUp = useCallback((newLevel: number, rewards?: { xp: number, points: number }) => {
    setLevelUpPopup({ level: newLevel, rewards })
    showToast(`🎉 레벨 ${newLevel} 달성!`, 'success')
  }, [showToast])

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    showToast,
    showAchievement,
    showBadgeUnlock,
    showLevelUp
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} onRemove={(id) => 
        setToasts(prev => prev.filter(t => t.id !== id))
      } />
      
      {/* 업적 팝업 */}
      <AchievementPopup 
        achievement={achievementPopup} 
        onClose={() => setAchievementPopup(null)} 
      />
      
      {/* 배지 팝업 */}
      <BadgeUnlockPopup 
        badge={badgePopup} 
        onClose={() => setBadgePopup(null)} 
      />
      
      {/* 레벨업 팝업 */}
      <LevelUpPopup 
        levelData={levelUpPopup} 
        onClose={() => setLevelUpPopup(null)} 
      />
    </NotificationContext.Provider>
  )
}

// 🔔 알림 센터 컴포넌트
interface NotificationCenterProps {
  show: boolean
  onClose: () => void
}

export function NotificationCenter({ show, onClose }: NotificationCenterProps) {
  const { notifications, removeNotification, markAsRead, clearAll } = useNotifications()
  
  const unreadCount = notifications.filter(n => !n.isRead).length
  const groupedNotifications = groupNotificationsByDate(notifications)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return FaTrophy
      case 'reminder': return FaBell
      case 'social': return FaStar
      case 'system': return FaInfoCircle
      default: return FaBell
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement': return 'text-yellow-400'
      case 'reminder': return 'text-blue-400'
      case 'social': return 'text-green-400'
      case 'system': return 'text-purple-400'
      default: return 'text-white'
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* 알림 패널 */}
          <motion.div
            className="fixed top-0 right-0 w-full max-w-md h-full bg-gray-900 border-l border-white/10 z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <FaBell className="text-blue-400 text-xl" />
                <div>
                  <h3 className="text-lg font-bold text-white">알림</h3>
                  {unreadCount > 0 && (
                    <p className="text-white/60 text-sm">읽지 않은 알림 {unreadCount}개</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    모두 삭제
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <FaBell className="text-6xl text-white/20 mb-4" />
                  <p className="text-white/60 text-lg mb-2">알림이 없습니다</p>
                  <p className="text-white/40 text-sm">새로운 알림이 오면 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date} className="space-y-2">
                      <h4 className="text-sm font-medium text-white/60 sticky top-0 bg-gray-900 py-2">
                        {formatNotificationDate(date)}
                      </h4>
                      
                      <AnimatePresence>
                        {dateNotifications.map((notification, index) => {
                          const Icon = getNotificationIcon(notification.type)
                          return (
                            <motion.div
                              key={notification.id}
                              className={`
                                glass rounded-xl p-4 cursor-pointer border
                                ${notification.isRead 
                                  ? 'border-white/10 opacity-75' 
                                  : 'border-blue-400/30 bg-blue-500/5'
                                }
                                hover:bg-white/5 transition-colors
                              `}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.1 }}
                              onClick={() => {
                                if (!notification.isRead) {
                                  markAsRead(notification.id)
                                }
                                if (notification.actionUrl) {
                                  // 링크로 이동
                                  window.location.href = notification.actionUrl
                                }
                              }}
                              layout
                            >
                              <div className="flex items-start gap-3">
                                <div className={`${getNotificationColor(notification.type)}`}>
                                  <Icon className="text-lg" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h5 className={`
                                    font-medium mb-1
                                    ${notification.isRead ? 'text-white/70' : 'text-white'}
                                  `}>
                                    {notification.title}
                                  </h5>
                                  <p className={`
                                    text-sm leading-relaxed
                                    ${notification.isRead ? 'text-white/50' : 'text-white/70'}
                                  `}>
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-white/40 mt-1 block">
                                    {formatTime(notification.createdAt)}
                                  </span>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeNotification(notification.id)
                                  }}
                                  className="p-1 text-white/40 hover:text-white transition-colors"
                                >
                                  <FaTimes className="text-sm" />
                                </button>
                              </div>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 🍞 토스트 타입 및 인터페이스
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  createdAt: number
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastMessage
            key={toast.id}
            toast={toast}
            onRemove={() => onRemove(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastMessageProps {
  toast: Toast
  onRemove: () => void
}

function ToastMessage({ toast, onRemove }: ToastMessageProps) {
  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500/20 to-emerald-500/20 border-green-400/50',
          icon: FaCheckCircle,
          iconColor: 'text-green-400'
        }
      case 'error':
        return {
          bg: 'from-red-500/20 to-pink-500/20 border-red-400/50',
          icon: FaTimes,
          iconColor: 'text-red-400'
        }
      case 'warning':
        return {
          bg: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50',
          icon: FaExclamationTriangle,
          iconColor: 'text-yellow-400'
        }
      default:
        return {
          bg: 'from-blue-500/20 to-purple-500/20 border-blue-400/50',
          icon: FaInfoCircle,
          iconColor: 'text-blue-400'
        }
    }
  }

  const { bg, icon: Icon, iconColor } = getToastStyle(toast.type)

  return (
    <motion.div
      className={`
        glass rounded-xl p-4 border backdrop-blur-md shadow-xl
        bg-gradient-to-r ${bg}
        max-w-sm cursor-pointer
      `}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      onClick={onRemove}
    >
      <div className="flex items-start gap-3">
        <Icon className={`${iconColor} text-lg flex-shrink-0 mt-0.5`} />
        <p className="text-white text-sm leading-relaxed flex-1">{toast.message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-white/40 hover:text-white transition-colors flex-shrink-0"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </motion.div>
  )
}

// 🏆 업적 달성 팝업
interface AchievementPopupProps {
  achievement: GameAchievement | null
  onClose: () => void
}

function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  if (!achievement) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass rounded-3xl p-8 border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-center max-w-md"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 반짝임 효과 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
            animate={{ x: [-100, 400] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          <div className="relative z-10">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4" />
            </motion.div>
            
            <h3 className="text-2xl font-black text-white mb-2">업적 달성!</h3>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-3xl">{achievement.icon}</span>
              <h4 className="text-xl font-bold text-white">{achievement.name}</h4>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              {achievement.description}
            </p>
            
            {/* 보상 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-3">
                <FaStar className="text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">+{achievement.reward.xp}</div>
                <div className="text-xs text-white/60">XP</div>
              </div>
              <div className="glass rounded-xl p-3">
                <FaGift className="text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">+{achievement.reward.points}</div>
                <div className="text-xs text-white/60">포인트</div>
              </div>
            </div>
            
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold shadow-lg"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              확인
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 🎖️ 배지 언락 팝업
interface BadgeUnlockPopupProps {
  badge: Badge | null
  onClose: () => void
}

function BadgeUnlockPopup({ badge, onClose }: BadgeUnlockPopupProps) {
  if (!badge) return null

  const rarityColors = {
    common: 'from-gray-400/20 to-gray-600/20 border-gray-400/50',
    rare: 'from-blue-400/20 to-blue-600/20 border-blue-400/50',
    epic: 'from-purple-400/20 to-purple-600/20 border-purple-400/50',
    legendary: 'from-yellow-400/20 to-orange-500/20 border-yellow-400/50'
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`
            glass rounded-3xl p-8 border-2 text-center max-w-md
            bg-gradient-to-br ${rarityColors[badge.rarity]}
          `}
          initial={{ scale: 0, y: -100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-2xl font-black text-white mb-4">새 배지 획득!</h3>
          
          <motion.div
            className={`
              w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl
              bg-gradient-to-br ${badge.rarity === 'legendary' ? 'from-yellow-400 to-orange-500' :
                                 badge.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
                                 badge.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
                                 'from-gray-400 to-gray-600'}
            `}
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {badge.icon}
          </motion.div>
          
          <h4 className="text-xl font-bold text-white mb-2">{badge.name}</h4>
          <p className="text-white/80 mb-4 leading-relaxed">{badge.description}</p>
          
          <div className={`
            inline-block px-3 py-1 rounded-full text-sm font-medium mb-6
            ${badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
              badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
              badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
              'bg-gray-500/20 text-gray-300'}
          `}>
            {badge.rarity === 'legendary' ? '전설' :
             badge.rarity === 'epic' ? '영웅' :
             badge.rarity === 'rare' ? '희귀' : '일반'}
          </div>
          
          <motion.button
            className={`
              px-8 py-3 rounded-xl font-bold shadow-lg text-white
              bg-gradient-to-r ${badge.rarity === 'legendary' ? 'from-yellow-500 to-orange-500' :
                                 badge.rarity === 'epic' ? 'from-purple-500 to-purple-600' :
                                 badge.rarity === 'rare' ? 'from-blue-500 to-blue-600' :
                                 'from-gray-500 to-gray-600'}
            `}
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            확인
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 🎉 레벨업 팝업
interface LevelUpPopupProps {
  levelData: { level: number, rewards?: { xp: number, points: number } } | null
  onClose: () => void
}

function LevelUpPopup({ levelData, onClose }: LevelUpPopupProps) {
  if (!levelData) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass rounded-3xl p-8 border-2 border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-center max-w-md"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaStar className="text-6xl text-blue-400 mx-auto mb-4" />
          </motion.div>
          
          <h3 className="text-2xl font-black text-white mb-2">레벨업!</h3>
          
          <div className="text-6xl font-black text-white mb-4">
            {levelData.level}
          </div>
          
          <p className="text-white/80 mb-6">
            축하합니다! 레벨 {levelData.level}에 도달했습니다!
          </p>
          
          {levelData.rewards && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass rounded-xl p-3">
                <FaStar className="text-blue-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">+{levelData.rewards.xp}</div>
                <div className="text-xs text-white/60">보너스 XP</div>
              </div>
              <div className="glass rounded-xl p-3">
                <FaGift className="text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">+{levelData.rewards.points}</div>
                <div className="text-xs text-white/60">보너스 포인트</div>
              </div>
            </div>
          )}
          
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            계속하기
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// 유틸리티 함수들
function getToastTypeFromNotification(type: Notification['type']): ToastType {
  switch (type) {
    case 'achievement': return 'success'
    case 'reminder': return 'info'
    case 'social': return 'info'
    case 'system': return 'warning'
    default: return 'info'
  }
}

function groupNotificationsByDate(notifications: Notification[]): Record<string, Notification[]> {
  return notifications.reduce((groups, notification) => {
    const date = notification.createdAt.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
    return groups
  }, {} as Record<string, Notification[]>)
}

function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateString === today.toISOString().split('T')[0]) {
    return '오늘'
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return '어제'
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
  return `${Math.floor(diffInMinutes / 1440)}일 전`
} 