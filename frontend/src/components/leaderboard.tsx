"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LeaderboardEntry, Friend, Leaderboard, UserProfile 
} from '@/types'
import { 
  FaTrophy, FaMedal, FaCrown, FaFire, FaChartLine, FaStar,
  FaUserFriends, FaGift, FaCalendarAlt, FaBolt, FaHeart,
  FaRocket, FaGem, FaLock, FaUsers, FaArrowUp, FaArrowDown
} from 'react-icons/fa'

// 🏆 리더보드 메인 컴포넌트
interface LeaderboardDisplayProps {
  leaderboard: Leaderboard
  currentUserId: string
  onUserClick?: (userId: string) => void
  compact?: boolean
}

export function LeaderboardDisplay({ 
  leaderboard, 
  currentUserId, 
  onUserClick,
  compact = false 
}: LeaderboardDisplayProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Leaderboard['period']>(leaderboard.period)
  const [selectedCategory, setSelectedCategory] = useState<Leaderboard['category']>(leaderboard.category)

  const currentUserEntry = leaderboard.entries.find(entry => entry.userId === currentUserId)
  const topEntries = leaderboard.entries.slice(0, compact ? 5 : 10)

  const periods = [
    { value: 'daily' as const, label: '일일', icon: FaCalendarAlt },
    { value: 'weekly' as const, label: '주간', icon: FaFire },
    { value: 'monthly' as const, label: '월간', icon: FaChartLine },
    { value: 'all_time' as const, label: '전체', icon: FaTrophy }
  ]

  const categories = [
    { value: 'xp' as const, label: 'XP', icon: FaBolt },
    { value: 'streak' as const, label: '연속', icon: FaFire },
    { value: 'quiz_score' as const, label: '퀴즈', icon: FaStar },
    { value: 'points' as const, label: '포인트', icon: FaGem }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <FaCrown className="text-yellow-400 text-xl" />
      case 2: return <FaMedal className="text-gray-300 text-xl" />
      case 3: return <FaMedal className="text-orange-400 text-xl" />
      default: return <span className="text-white/60 font-bold">#{rank}</span>
    }
  }

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
      case 2: return 'from-gray-400/20 to-gray-600/20 border-gray-400/50'
      case 3: return 'from-orange-500/20 to-red-500/20 border-orange-400/50'
      default: return 'from-blue-500/10 to-purple-500/10 border-white/20'
    }
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="text-green-400 text-sm" />
    if (change < 0) return <FaArrowDown className="text-red-400 text-sm" />
    return <span className="text-white/40 text-sm">-</span>
  }

  return (
    <div className="space-y-6">
      {/* 필터 컨트롤 */}
      {!compact && (
        <div className="space-y-4">
          {/* 기간 선택 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {periods.map(period => (
              <motion.button
                key={period.value}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap
                  ${selectedPeriod === period.value 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'glass text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
                onClick={() => setSelectedPeriod(period.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <period.icon className="text-sm" />
                {period.label}
              </motion.button>
            ))}
          </div>

          {/* 카테고리 선택 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <motion.button
                key={category.value}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap
                  ${selectedCategory === category.value 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'glass text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
                onClick={() => setSelectedCategory(category.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <category.icon className="text-sm" />
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* 리더보드 */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <div>
              <h3 className="text-xl font-bold text-white">리더보드</h3>
              <p className="text-white/60 text-sm">
                {periods.find(p => p.value === selectedPeriod)?.label} {' '}
                {categories.find(c => c.value === selectedCategory)?.label} 순위
              </p>
            </div>
          </div>
        </div>

        {/* 상위 3명 포디움 */}
        {!compact && topEntries.length >= 3 && (
          <div className="p-6 bg-gradient-to-b from-yellow-500/10 to-transparent">
            <div className="flex items-end justify-center gap-4 max-w-md mx-auto">
              {/* 2위 */}
              <motion.div
                className="flex-1 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg mb-3 flex items-end justify-center pb-2">
                  <span className="text-2xl font-black text-white">2</span>
                </div>
                <div className="space-y-1">
                  <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2"></div>
                  <div className="font-bold text-white text-sm">{topEntries[1]?.username}</div>
                  <div className="text-gray-300 text-xs">{topEntries[1]?.score.toLocaleString()}</div>
                </div>
              </motion.div>

              {/* 1위 */}
              <motion.div
                className="flex-1 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="h-28 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-lg mb-3 flex items-end justify-center pb-2 relative">
                  <FaCrown className="absolute -top-3 text-yellow-400 text-2xl" />
                  <span className="text-3xl font-black text-white">1</span>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-2 border-4 border-yellow-300"></div>
                  <div className="font-bold text-white">{topEntries[0]?.username}</div>
                  <div className="text-yellow-300 text-sm font-bold">{topEntries[0]?.score.toLocaleString()}</div>
                </div>
              </motion.div>

              {/* 3위 */}
              <motion.div
                className="flex-1 text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="h-16 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg mb-3 flex items-end justify-center pb-2">
                  <span className="text-xl font-black text-white">3</span>
                </div>
                <div className="space-y-1">
                  <div className="w-10 h-10 bg-orange-400 rounded-full mx-auto mb-2"></div>
                  <div className="font-bold text-white text-sm">{topEntries[2]?.username}</div>
                  <div className="text-orange-300 text-xs">{topEntries[2]?.score.toLocaleString()}</div>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* 순위 목록 */}
        <div className="space-y-1">
          {topEntries.map((entry, index) => (
            <motion.div
              key={entry.userId}
              className={`
                flex items-center gap-4 p-4 cursor-pointer
                ${entry.userId === currentUserId ? 'bg-blue-500/20 border-l-4 border-blue-400' : 'hover:bg-white/5'}
                ${index < 3 && !compact ? 'opacity-60' : ''} // 포디움 항목은 반투명
                transition-colors
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: index < 3 && !compact ? 0.6 : 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onUserClick?.(entry.userId)}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              {/* 순위 */}
              <div className="w-12 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* 아바타 */}
              <div className="relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                  ${entry.rank <= 3 ? getRankBackground(entry.rank) : 'bg-gradient-to-br from-blue-500 to-purple-500'}
                `}>
                  {entry.avatar || entry.username.charAt(0).toUpperCase()}
                </div>
                {entry.badge && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
                    {entry.badge}
                  </div>
                )}
              </div>

              {/* 사용자 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white truncate">{entry.username}</span>
                  {entry.level && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium">
                      Lv.{entry.level}
                    </span>
                  )}
                </div>
                <div className="text-white/60 text-sm">
                  {entry.score.toLocaleString()} {categories.find(c => c.value === selectedCategory)?.label}
                </div>
              </div>

              {/* 변화량 */}
              <div className="flex items-center gap-2 text-right">
                {getChangeIcon(entry.change)}
                {entry.change !== 0 && (
                  <span className={`text-sm ${entry.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(entry.change)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 현재 사용자 순위 (목록에 없는 경우) */}
        {currentUserEntry && !topEntries.find(e => e.userId === currentUserId) && (
          <div className="border-t border-white/10 p-4 bg-blue-500/10">
            <div className="text-center text-white/60 text-sm mb-2">내 순위</div>
            <div className="flex items-center gap-4 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <div className="w-8 flex justify-center">
                <span className="text-white font-bold">#{currentUserEntry.rank}</span>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
                {currentUserEntry.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">{currentUserEntry.username}</div>
                <div className="text-blue-300 text-sm">{currentUserEntry.score.toLocaleString()}</div>
              </div>
              {getChangeIcon(currentUserEntry.change)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 🤝 친구 시스템 컴포넌트
interface FriendsSystemProps {
  friends: Friend[]
  onAddFriend?: (username: string) => void
  onRemoveFriend?: (friendId: string) => void
  onChallenge?: (friendId: string) => void
}

export function FriendsSystem({ 
  friends, 
  onAddFriend, 
  onRemoveFriend,
  onChallenge 
}: FriendsSystemProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddFriend, setShowAddFriend] = useState(false)

  const onlineFriends = friends.filter(f => f.isOnline)
  const offlineFriends = friends.filter(f => !f.isOnline)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUserFriends className="text-green-400 text-2xl" />
          <div>
            <h3 className="text-xl font-bold text-white">친구</h3>
            <p className="text-white/60 text-sm">
              {onlineFriends.length}명 온라인 • 총 {friends.length}명
            </p>
          </div>
        </div>
        
        <motion.button
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
          onClick={() => setShowAddFriend(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          친구 추가
        </motion.button>
      </div>

      {/* 친구 추가 모달 */}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-bold text-white mb-4">친구 추가</h4>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="사용자명을 입력하세요"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddFriend(false)}
                    className="flex-1 py-2 text-white/70 hover:text-white transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (searchTerm.trim()) {
                        onAddFriend?.(searchTerm.trim())
                        setSearchTerm('')
                        setShowAddFriend(false)
                      }
                    }}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 온라인 친구들 */}
      {onlineFriends.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            온라인 ({onlineFriends.length})
          </h4>
          <div className="grid gap-3">
            {onlineFriends.map((friend, index) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onChallenge={onChallenge}
                onRemove={onRemoveFriend}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* 오프라인 친구들 */}
      {offlineFriends.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white/70 flex items-center gap-2">
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
            오프라인 ({offlineFriends.length})
          </h4>
          <div className="grid gap-3 opacity-60">
            {offlineFriends.map((friend, index) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={onRemoveFriend}
                index={index + onlineFriends.length}
                isOffline
              />
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && (
        <div className="text-center py-12">
          <FaUsers className="text-6xl text-white/20 mx-auto mb-4" />
          <p className="text-white/60 text-lg mb-4">아직 친구가 없습니다</p>
          <p className="text-white/40 text-sm">친구를 추가하여 함께 학습하고 경쟁해보세요!</p>
        </div>
      )}
    </div>
  )
}

// 친구 카드 컴포넌트
interface FriendCardProps {
  friend: Friend
  onChallenge?: (friendId: string) => void
  onRemove?: (friendId: string) => void
  index: number
  isOffline?: boolean
}

function FriendCard({ friend, onChallenge, onRemove, index, isOffline }: FriendCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className={`
        glass rounded-xl p-4 cursor-pointer group
        ${isOffline ? 'opacity-60' : 'hover:bg-white/10'}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isOffline ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isOffline ? { scale: 1.02 } : {}}
      onClick={() => !isOffline && setShowActions(!showActions)}
    >
      <div className="flex items-center gap-4">
        {/* 아바타 */}
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">
            {friend.avatar || friend.username.charAt(0).toUpperCase()}
          </div>
          {friend.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
          )}
        </div>

        {/* 친구 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white truncate">{friend.username}</span>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
              Lv.{friend.level}
            </span>
          </div>
          <div className="text-white/60 text-sm">
            {friend.isOnline ? '온라인' : `${getRelativeTime(friend.lastActive)} 전 접속`}
          </div>
          {friend.mutualFriends > 0 && (
            <div className="text-white/40 text-xs">
              공통 친구 {friend.mutualFriends}명
            </div>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="text-right">
          {friend.isOnline && (
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <AnimatePresence>
        {showActions && !isOffline && (
          <motion.div
            className="flex gap-2 mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.button
              className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-sm"
              onClick={(e) => {
                e.stopPropagation()
                onChallenge?.(friend.id)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBolt className="inline mr-1" />
              도전하기
            </motion.button>
            <motion.button
              className="px-4 py-2 glass text-white/70 hover:text-white rounded-lg text-sm transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onRemove?.(friend.id)
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              삭제
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 🏆 대회/챌린지 시스템
interface CompetitionSystemProps {
  competitions: Array<{
    id: string
    title: string
    description: string
    type: 'daily' | 'weekly' | 'special'
    participants: number
    maxParticipants?: number
    prize: string
    startDate: string
    endDate: string
    isActive: boolean
    isParticipating: boolean
  }>
  onJoin?: (competitionId: string) => void
  onLeave?: (competitionId: string) => void
}

export function CompetitionSystem({ competitions, onJoin, onLeave }: CompetitionSystemProps) {
  const activeCompetitions = competitions.filter(c => c.isActive)
  const upcomingCompetitions = competitions.filter(c => !c.isActive && new Date(c.startDate) > new Date())

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <FaTrophy className="text-yellow-400 text-2xl" />
        <div>
          <h3 className="text-xl font-bold text-white">대회 & 챌린지</h3>
          <p className="text-white/60 text-sm">다른 사용자들과 경쟁하고 보상을 획득하세요</p>
        </div>
      </div>

      {/* 진행 중인 대회 */}
      {activeCompetitions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white">진행 중</h4>
          <div className="grid gap-4">
            {activeCompetitions.map((competition, index) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={onJoin}
                onLeave={onLeave}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* 예정된 대회 */}
      {upcomingCompetitions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-white/70">예정된 대회</h4>
          <div className="grid gap-4 opacity-75">
            {upcomingCompetitions.map((competition, index) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onJoin={onJoin}
                onLeave={onLeave}
                index={index + activeCompetitions.length}
                isUpcoming
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface CompetitionCardProps {
  competition: any
  onJoin?: (id: string) => void
  onLeave?: (id: string) => void
  index: number
  isUpcoming?: boolean
}

function CompetitionCard({ competition, onJoin, onLeave, index, isUpcoming }: CompetitionCardProps) {
  const typeStyles = {
    daily: 'from-blue-500/20 to-cyan-500/20 border-blue-400/50',
    weekly: 'from-purple-500/20 to-pink-500/20 border-purple-400/50',
    special: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50'
  }

  const typeIcons = {
    daily: FaCalendarAlt,
    weekly: FaFire,
    special: FaCrown
  }

  const TypeIcon = typeIcons[competition.type]

  return (
    <motion.div
      className={`
        glass rounded-2xl p-6 border
        ${typeStyles[competition.type]}
        ${isUpcoming ? 'opacity-60' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isUpcoming ? 0.6 : 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${competition.type === 'daily' ? 'bg-blue-500' : 
            competition.type === 'weekly' ? 'bg-purple-500' : 'bg-yellow-500'}
        `}>
          <TypeIcon className="text-white text-xl" />
        </div>

        {/* 대회 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-white text-lg">{competition.title}</h4>
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${competition.type === 'daily' ? 'bg-blue-500/20 text-blue-300' : 
                competition.type === 'weekly' ? 'bg-purple-500/20 text-purple-300' : 
                'bg-yellow-500/20 text-yellow-300'}
            `}>
              {competition.type === 'daily' ? '일일' : 
               competition.type === 'weekly' ? '주간' : '특별'}
            </span>
          </div>

          <p className="text-white/70 text-sm mb-4 leading-relaxed">
            {competition.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-white/60">참가자</span>
              <div className="font-bold text-white">
                {competition.participants.toLocaleString()}
                {competition.maxParticipants && ` / ${competition.maxParticipants.toLocaleString()}`}명
              </div>
            </div>
            <div>
              <span className="text-white/60">보상</span>
              <div className="font-bold text-yellow-300">{competition.prize}</div>
            </div>
          </div>

          <div className="text-sm text-white/60 mb-4">
            {isUpcoming ? (
              <>시작: {new Date(competition.startDate).toLocaleDateString()}</>
            ) : (
              <>종료: {new Date(competition.endDate).toLocaleDateString()}</>
            )}
          </div>

          {/* 참가/탈퇴 버튼 */}
          {!isUpcoming && (
            <div className="flex gap-3">
              {competition.isParticipating ? (
                <motion.button
                  className="px-6 py-2 bg-red-500/20 border border-red-400/50 text-red-300 rounded-lg font-medium"
                  onClick={() => onLeave?.(competition.id)}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  탈퇴하기
                </motion.button>
              ) : (
                <motion.button
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium"
                  onClick={() => onJoin?.(competition.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaRocket className="inline mr-2" />
                  참가하기
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 유틸리티 함수
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return '방금'
  if (diffInMinutes < 60) return `${diffInMinutes}분`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간`
  return `${Math.floor(diffInMinutes / 1440)}일`
} 