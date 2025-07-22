"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTrophy, FaFire, FaStar, FaGem, FaCrown, FaRocket, 
  FaThumbsUp, FaHeart, FaBolt, FaLock, FaLightbulb,
  FaChartLine, FaMedal, FaGift
} from 'react-icons/fa'
import { UserProfile, Badge, GameAchievement, DailyMission } from '@/types'

// 🎮 레벨 & XP 디스플레이 컴포넌트
interface LevelXPDisplayProps {
  profile: UserProfile
  showDetailed?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LevelXPDisplay({ 
  profile, 
  showDetailed = false, 
  size = 'medium',
  className = ''
}: LevelXPDisplayProps) {
  const currentLevelXP = getXPRequiredForLevel(profile.level)
  const nextLevelXP = getXPRequiredForLevel(profile.level + 1)
  const progressPercent = (profile.xp / nextLevelXP) * 100

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 레벨 뱃지 */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={`
            w-12 h-12 ${size === 'large' ? 'w-16 h-16' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'}
            bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 
            rounded-full flex items-center justify-center
            shadow-lg shadow-orange-500/30 border-2 border-white/20
            ${getLevelGlow(profile.level)}
          `}>
            <span className={`font-black text-white ${
              size === 'large' ? 'text-xl' : size === 'small' ? 'text-sm' : 'text-base'
            }`}>
              {profile.level}
            </span>
          </div>
          {/* 레벨 크라운 효과 */}
          {profile.level >= 10 && (
            <FaCrown className="absolute -top-1 -right-1 text-yellow-300 text-xs animate-pulse" />
          )}
        </div>

        {/* XP 진행률 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold text-white ${sizeClasses[size]}`}>
              Level {profile.level}
            </span>
            {showDetailed && (
              <span className="text-white/60 text-sm">
                ({profile.xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP)
              </span>
            )}
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {showDetailed && (
            <div className="text-xs text-white/60 mt-1">
              다음 레벨까지 {(nextLevelXP - profile.xp).toLocaleString()} XP
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 🔥 스트릭 카운터 컴포넌트
interface StreakCounterProps {
  streakDays: number
  maxStreak: number
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
}

export function StreakCounter({ 
  streakDays, 
  maxStreak, 
  size = 'medium',
  animated = true 
}: StreakCounterProps) {
  const [displayCount, setDisplayCount] = useState(0)

  useEffect(() => {
    if (animated) {
      let current = 0
      const increment = Math.ceil(streakDays / 20)
      const timer = setInterval(() => {
        current += increment
        if (current >= streakDays) {
          current = streakDays
          clearInterval(timer)
        }
        setDisplayCount(current)
      }, 50)
      return () => clearInterval(timer)
    } else {
      setDisplayCount(streakDays)
    }
  }, [streakDays, animated])

  const sizeClasses = {
    small: { container: 'p-3', icon: 'text-lg', text: 'text-sm', number: 'text-xl' },
    medium: { container: 'p-4', icon: 'text-xl', text: 'text-base', number: 'text-2xl' },
    large: { container: 'p-6', icon: 'text-2xl', text: 'text-lg', number: 'text-3xl' }
  }

  const classes = sizeClasses[size]

  return (
    <motion.div
      className={`glass rounded-2xl ${classes.container} text-center relative overflow-hidden group`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 불꽃 아이콘 */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <FaFire className={`${classes.icon} text-orange-500 mx-auto mb-2`} />
      </motion.div>

      {/* 스트릭 수 */}
      <motion.div
        className={`${classes.number} font-black text-white mb-1`}
        key={displayCount}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      >
        {displayCount}
      </motion.div>

      <div className={`${classes.text} text-white/70 font-medium`}>
        연속 학습
      </div>

      {/* 최고 기록 */}
      {maxStreak > streakDays && (
        <div className="text-xs text-white/50 mt-1">
          최고: {maxStreak}일
        </div>
      )}

      {/* 새 기록 표시 */}
      {streakDays > 0 && streakDays === maxStreak && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full"
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ type: "spring", delay: 0.5 }}
        >
          신기록!
        </motion.div>
      )}
    </motion.div>
  )
}

// 🏆 포인트 디스플레이 컴포넌트
interface PointsDisplayProps {
  points: number
  animated?: boolean
  showIcon?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function PointsDisplay({ 
  points, 
  animated = true, 
  showIcon = true,
  size = 'medium'
}: PointsDisplayProps) {
  const [displayPoints, setDisplayPoints] = useState(0)

  useEffect(() => {
    if (animated) {
      let current = 0
      const increment = Math.ceil(points / 30)
      const timer = setInterval(() => {
        current += increment
        if (current >= points) {
          current = points
          clearInterval(timer)
        }
        setDisplayPoints(current)
      }, 30)
      return () => clearInterval(timer)
    } else {
      setDisplayPoints(points)
    }
  }, [points, animated])

  const sizeClasses = {
    small: { text: 'text-lg', icon: 'text-base' },
    medium: { text: 'text-xl', icon: 'text-lg' },
    large: { text: 'text-2xl', icon: 'text-xl' }
  }

  const classes = sizeClasses[size]

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {showIcon && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaGem className={`${classes.icon} text-purple-400`} />
        </motion.div>
      )}
      <motion.span
        className={`${classes.text} font-bold text-white`}
        key={displayPoints}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {displayPoints.toLocaleString()}
      </motion.span>
    </motion.div>
  )
}

// 🎖️ 배지 그리드 컴포넌트
interface BadgeGridProps {
  badges: Badge[]
  maxDisplay?: number
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  onBadgeClick?: (badge: Badge) => void
}

export function BadgeGrid({ 
  badges, 
  maxDisplay = 6, 
  size = 'medium',
  animated = true,
  onBadgeClick 
}: BadgeGridProps) {
  const displayBadges = badges.slice(0, maxDisplay)
  const remainingCount = Math.max(0, badges.length - maxDisplay)

  const sizeClasses = {
    small: { container: 'w-8 h-8', icon: 'text-sm', grid: 'grid-cols-6' },
    medium: { container: 'w-12 h-12', icon: 'text-base', grid: 'grid-cols-4' },
    large: { container: 'w-16 h-16', icon: 'text-lg', grid: 'grid-cols-3' }
  }

  const classes = sizeClasses[size]

  const rarityStyles = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  }

  return (
    <div className={`grid ${classes.grid} gap-2`}>
      <AnimatePresence>
        {displayBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`
              ${classes.container} relative rounded-full cursor-pointer
              bg-gradient-to-br ${rarityStyles[badge.rarity]}
              flex items-center justify-center shadow-lg
              hover:scale-110 active:scale-95 transition-transform
              border-2 border-white/20
            `}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ 
              delay: animated ? index * 0.1 : 0,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            onClick={() => onBadgeClick?.(badge)}
            whileHover={{ 
              scale: 1.1,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`${classes.icon}`}>{badge.icon}</span>
            
            {/* 레어도 반짝임 효과 */}
            {badge.rarity === 'legendary' && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-500/30"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 더 많은 배지 표시 */}
      {remainingCount > 0 && (
        <motion.div
          className={`
            ${classes.container} rounded-full
            bg-white/10 border-2 border-white/20 border-dashed
            flex items-center justify-center text-white/60
            cursor-pointer hover:bg-white/20 transition-colors
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`${classes.icon} font-bold`}>+{remainingCount}</span>
        </motion.div>
      )}
    </div>
  )
}

// 🎯 일일 미션 카드 컴포넌트
interface MissionCardProps {
  mission: DailyMission
  onClaim?: (mission: DailyMission) => void
  compact?: boolean
}

export function MissionCard({ mission, onClaim, compact = false }: MissionCardProps) {
  const progressPercent = (mission.current / mission.target) * 100
  const isCompleted = mission.isCompleted

  return (
    <motion.div
      className={`
        glass rounded-2xl border border-white/10 overflow-hidden
        ${compact ? 'p-4' : 'p-6'}
        ${isCompleted ? 'border-green-400/30 bg-green-500/10' : 'hover:border-white/20'}
        group relative
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* 완료 효과 */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`
            ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl
            bg-gradient-to-br from-blue-500 to-purple-500
            flex items-center justify-center flex-shrink-0
          `}>
            <span className={`${compact ? 'text-lg' : 'text-xl'}`}>{mission.icon}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-white ${compact ? 'text-sm' : 'text-base'} mb-1`}>
              {mission.name}
            </h3>
            <p className={`text-white/70 ${compact ? 'text-xs' : 'text-sm'} leading-relaxed`}>
              {mission.description}
            </p>
          </div>

          {/* 완료 체크 */}
          {isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <FaThumbsUp className="text-green-400 text-xl" />
            </motion.div>
          )}
        </div>

        {/* 진행률 */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-white/80 ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
              진행률
            </span>
            <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
              {mission.current} / {mission.target}
            </span>
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`
                absolute inset-y-0 left-0 rounded-full
                ${isCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'}
              `}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {!isCompleted && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
        </div>

        {/* 보상 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                              <FaLightbulb className="text-blue-400 text-sm" />
              <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
                {mission.reward.xp} XP
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FaGem className="text-purple-400 text-sm" />
              <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
                {mission.reward.points}
              </span>
            </div>
          </div>

          {/* 보상 받기 버튼 */}
          {isCompleted && onClaim && (
            <motion.button
              className={`
                px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500
                text-white font-bold rounded-lg shadow-lg
                hover:from-green-600 hover:to-emerald-600
                ${compact ? 'text-xs px-3 py-1' : 'text-sm'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onClaim(mission)}
            >
              보상 받기
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 🏆 업적 진행률 카드
interface AchievementCardProps {
  achievement: GameAchievement
  compact?: boolean
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100

  return (
    <motion.div
      className={`
        glass rounded-2xl border border-white/10 overflow-hidden relative
        ${compact ? 'p-4' : 'p-6'}
        ${achievement.isCompleted ? 'border-yellow-400/30 bg-yellow-500/10' : 'hover:border-white/20'}
        group
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* 완료 광채 효과 */}
      {achievement.isCompleted && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-yellow-400/20"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl
            ${achievement.isCompleted 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
              : 'bg-gradient-to-br from-gray-500 to-gray-600'}
            flex items-center justify-center flex-shrink-0
            ${achievement.isCompleted ? 'animate-pulse' : ''}
          `}>
            <span className={`${compact ? 'text-lg' : 'text-xl'}`}>{achievement.icon}</span>
          </div>
          
          <div className="flex-1">
            <h3 className={`font-bold text-white ${compact ? 'text-sm' : 'text-base'} mb-1`}>
              {achievement.name}
            </h3>
            <p className={`text-white/70 ${compact ? 'text-xs' : 'text-sm'}`}>
              {achievement.description}
            </p>
          </div>

          {achievement.isCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <FaTrophy className="text-yellow-400 text-xl" />
            </motion.div>
          )}
        </div>

        {/* 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${compact ? 'text-xs' : 'text-sm'} font-medium`}>
              진행률
            </span>
            <span className={`text-white font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
              {achievement.progress} / {achievement.maxProgress}
            </span>
          </div>
          
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`
                absolute inset-y-0 left-0 rounded-full
                ${achievement.isCompleted 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'}
              `}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 🎊 XP/레벨업 애니메이션 컴포넌트
interface XPAnimationProps {
  amount: number
  show: boolean
  onComplete: () => void
  source?: string
}

export function XPAnimation({ amount, show, onComplete, source }: XPAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/2 left-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%' }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: '-60%'
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5, 
            y: '-80%'
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onAnimationComplete={() => setTimeout(onComplete, 1000)}
        >
          <div className="glass rounded-2xl p-4 border-2 border-blue-400/50 bg-blue-500/20 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <FaLightbulb className="text-blue-400 text-2xl mx-auto mb-2" />
            </motion.div>
            <div className="text-white font-bold text-xl">+{amount} XP</div>
            {source && (
              <div className="text-white/70 text-sm mt-1">{source}</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 유틸리티 함수들
function getXPRequiredForLevel(level: number): number {
  return 100 + (level - 1) * 50 + Math.floor((level - 1) / 5) * 100
}

function getLevelGlow(level: number): string {
  if (level >= 50) return 'shadow-2xl shadow-purple-500/50 animate-pulse'
  if (level >= 25) return 'shadow-xl shadow-blue-500/40'
  if (level >= 10) return 'shadow-lg shadow-orange-500/30'
  return 'shadow-md shadow-yellow-500/20'
}

// 애니메이션 스타일
const styles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`

// 스타일 주입
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
} 