"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBell, FaRocket, FaTrophy, FaFire, FaCalendarAlt, FaBrain, 
  FaClock, FaUsers, FaChartLine, FaGem, FaStar, FaBookOpen,
  FaHeart, FaLightbulb, FaPuzzlePiece, FaSparkles, FaGift,
  FaHeadphones, FaGamepad, FaMedal, FaRandom
} from 'react-icons/fa'

// 새로운 컴포넌트들 import
import { LevelXPDisplay, StreakCounter, PointsDisplay, BadgeGrid, MissionCard, AchievementCard } from '@/components/gamification-ui'
import { LearningHeatmap, MobileHeatmap } from '@/components/heatmap'
import { FlashcardStudy } from '@/components/flashcards'
import { WordSearchPuzzle, MatchingGame } from '@/components/puzzles'
import { LeaderboardDisplay, FriendsSystem, CompetitionSystem } from '@/components/leaderboard'
import { PomodoroTimer, SmartReminders, StudyCalendar } from '@/components/smart-reminders'
import { NotificationCenter, useNotifications } from '@/components/notification-system'
import { useGamification, useMissions, useReviewSystem } from '@/hooks/use-gamification'

export default function Dashboard() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>('')
  const [activeSection, setActiveSection] = useState<string>('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 게임화 시스템 훅들
  const { 
    profile, 
    isLoading: gamificationLoading,
    addXP, 
    addPoints, 
    unlockBadge, 
    updateAchievement, 
    updateStreak 
  } = useGamification(sessionId)

  const { missions, updateMissionProgress } = useMissions(sessionId)
  const { reviewItems, getDueReviews } = useReviewSystem(sessionId)
  const { addNotification, showToast, showAchievement, showLevelUp } = useNotifications()

  // 초기화
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId')
    if (!storedSessionId) {
      router.push('/auth')
      return
    }
    
    setSessionId(storedSessionId)
    updateStreak() // 스트릭 업데이트
    setIsLoading(false)
  }, [router])

  // 메뉴 섹션들
  const sections = [
    { 
      id: 'overview', 
      label: '개요', 
      icon: FaRocket, 
      color: 'from-blue-500 to-cyan-500',
      description: '전체 학습 현황과 진행상황'
    },
    { 
      id: 'study', 
      label: '학습', 
      icon: FaBrain, 
      color: 'from-green-500 to-emerald-500',
      description: 'AI 정보, 퀴즈, 플래시카드 학습'
    },
    { 
      id: 'games', 
      label: '게임', 
      icon: FaGamepad, 
      color: 'from-purple-500 to-pink-500',
      description: '퍼즐, 워드서치, 매칭게임'
    },
    { 
      id: 'social', 
      label: '소셜', 
      icon: FaUsers, 
      color: 'from-orange-500 to-red-500',
      description: '친구, 랭킹, 대회 시스템'
    },
    { 
      id: 'focus', 
      label: '집중', 
      icon: FaClock, 
      color: 'from-red-500 to-pink-500',
      description: '뽀모도로, 알림, 캘린더'
    },
    { 
      id: 'progress', 
      label: '진행률', 
      icon: FaChartLine, 
      color: 'from-yellow-500 to-orange-500',
      description: '학습 분석, 히트맵, 통계'
    }
  ]

  if (isLoading || gamificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <motion.div
          className="glass rounded-2xl p-8 text-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <FaRocket className="text-6xl text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">학습 환경을 준비중입니다...</p>
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>프로필을 로드할 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const dueReviews = getDueReviews()
  const unreadNotifications = 0 // 실제 구현에서는 알림 개수

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/5 rounded-full animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* 헤더 */}
        <header className="glass border-b border-white/10 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* 로고 및 사용자 정보 */}
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                >
                  <FaRocket className="text-white text-xl" />
                </motion.div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-white">AI 마스터리 허브</h1>
                  <p className="text-white/60 text-sm">안녕하세요, {sessionId}님!</p>
                </div>
              </div>

              {/* 메인 스탯 (모바일 최적화) */}
              <div className="flex items-center gap-3 md:gap-6">
                <LevelXPDisplay profile={profile} size="small" />
                <div className="hidden sm:block">
                  <StreakCounter 
                    streakDays={profile.streakDays} 
                    maxStreak={profile.maxStreak} 
                    size="small" 
                  />
                </div>
                <PointsDisplay points={profile.points} size="small" showIcon={false} />
                
                {/* 알림 버튼 */}
                <motion.button
                  className="relative p-3 glass rounded-xl"
                  onClick={() => setShowNotifications(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaBell className="text-blue-400 text-lg" />
                  {unreadNotifications > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </motion.div>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* 섹션 네비게이션 */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap
                    ${activeSection === section.id 
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg` 
                      : 'glass text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <section.icon className="text-lg" />
                  <span className="hidden sm:inline">{section.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent(activeSection, {
                profile,
                missions,
                dueReviews,
                sessionId,
                addXP,
                addPoints,
                updateMissionProgress,
                showToast,
                showAchievement
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 알림 센터 */}
      <NotificationCenter 
        show={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  )
}

// 섹션 콘텐츠 렌더링 함수
function renderSectionContent(section: string, props: any) {
  const { profile, missions, dueReviews, sessionId } = props

  switch (section) {
    case 'overview':
      return <OverviewSection {...props} />
    case 'study':
      return <StudySection {...props} />
    case 'games':
      return <GamesSection {...props} />
    case 'social':
      return <SocialSection {...props} />
    case 'focus':
      return <FocusSection {...props} />
    case 'progress':
      return <ProgressSection {...props} />
    default:
      return <OverviewSection {...props} />
  }
}

// 📊 개요 섹션
function OverviewSection({ profile, missions, dueReviews, addXP, updateMissionProgress }: any) {
  const todayMissions = missions.filter((m: any) => !m.isCompleted).slice(0, 3)
  const completedToday = missions.filter((m: any) => m.isCompleted).length

  return (
    <div className="space-y-6">
      {/* 빠른 스탯 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="glass rounded-2xl p-6 text-center border border-blue-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <FaTrophy className="text-yellow-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{profile.level}</div>
          <div className="text-white/60 text-sm">레벨</div>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-6 text-center border border-green-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <FaFire className="text-orange-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{profile.streakDays}</div>
          <div className="text-white/60 text-sm">연속 학습</div>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-6 text-center border border-purple-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <FaGem className="text-purple-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{profile.points.toLocaleString()}</div>
          <div className="text-white/60 text-sm">포인트</div>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-6 text-center border border-red-400/30"
          whileHover={{ scale: 1.02 }}
        >
          <FaHeart className="text-red-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{dueReviews.length}</div>
          <div className="text-white/60 text-sm">복습 대기</div>
        </motion.div>
      </div>

      {/* 오늘의 미션 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FaStar className="text-yellow-400" />
            오늘의 미션
          </h3>
          <span className="text-white/60 text-sm">{completedToday}/{missions.length} 완료</span>
        </div>

        <div className="grid gap-4">
          {todayMissions.length > 0 ? (
            todayMissions.map((mission: any) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                compact
                onClaim={(mission) => {
                  addXP(mission.reward.xp, `미션: ${mission.name}`)
                  updateMissionProgress(mission.id, mission.target - mission.current)
                }}
              />
            ))
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <FaSparkles className="text-6xl text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg mb-2">모든 미션을 완료했습니다!</p>
              <p className="text-white/40 text-sm">내일 새로운 미션이 기다리고 있어요</p>
            </div>
          )}
        </div>
      </div>

      {/* 배지 및 업적 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaMedal className="text-yellow-400" />
            최근 배지
          </h3>
          <div className="glass rounded-xl p-4">
            <BadgeGrid 
              badges={profile.badges.slice(-6)} 
              maxDisplay={6}
              size="medium"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaTrophy className="text-purple-400" />
            진행 중인 업적
          </h3>
          <div className="space-y-3">
            {profile.achievements
              .filter((a: any) => !a.isCompleted)
              .slice(0, 2)
              .map((achievement: any) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                compact
              />
            ))}
          </div>
        </div>
      </div>

      {/* 모바일 히트맵 */}
      <div className="block md:hidden">
        <MobileHeatmap data={[]} months={3} />
      </div>
    </div>
  )
}

// 📚 학습 섹션
function StudySection({ addXP, addPoints, updateMissionProgress, showToast }: any) {
  const [activeStudyMode, setActiveStudyMode] = useState('ai-info')

  const studyModes = [
    { id: 'ai-info', label: 'AI 정보', icon: FaBrain, path: '/ai-info' },
    { id: 'quiz', label: '퀴즈', icon: FaSparkles, path: '/quiz' },
    { id: 'flashcards', label: '플래시카드', icon: FaBookOpen, component: 'flashcards' },
    { id: 'review', label: '복습', icon: FaRandom, component: 'review' }
  ]

  return (
    <div className="space-y-6">
      {/* 학습 모드 선택 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {studyModes.map((mode) => (
          <motion.button
            key={mode.id}
            className={`
              glass rounded-2xl p-6 text-center border transition-all
              ${activeStudyMode === mode.id 
                ? 'border-blue-400/50 bg-blue-500/10' 
                : 'border-white/10 hover:border-white/20'
              }
            `}
            onClick={() => {
              if (mode.path) {
                window.location.href = mode.path
              } else {
                setActiveStudyMode(mode.id)
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <mode.icon className={`
              text-3xl mx-auto mb-3
              ${activeStudyMode === mode.id ? 'text-blue-400' : 'text-white/60'}
            `} />
            <div className="font-bold text-white mb-1">{mode.label}</div>
            <div className="text-white/60 text-sm">
              {mode.id === 'ai-info' ? 'AI 지식 학습' :
               mode.id === 'quiz' ? '퀴즈 풀기' :
               mode.id === 'flashcards' ? '카드 암기' : '복습하기'}
            </div>
          </motion.button>
        ))}
      </div>

      {/* 학습 콘텐츠 */}
      {activeStudyMode === 'flashcards' && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">플래시카드 학습</h3>
          <FlashcardStudy
            flashcards={[]} // 실제 데이터로 교체
            onComplete={(results) => {
              addXP(results.correctCards * 10, '플래시카드 학습')
              addPoints(results.correctCards * 5)
              showToast(`${results.correctCards}/${results.totalCards} 카드를 학습했습니다!`)
            }}
            onUpdateCard={(cardId, isCorrect) => {
              if (isCorrect) {
                updateMissionProgress('learn_terms', 1)
              }
            }}
          />
        </div>
      )}

      {activeStudyMode === 'review' && (
        <div className="glass rounded-2xl p-6">
          <div className="text-center py-12">
            <FaLightbulb className="text-6xl text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">복습할 항목이 없습니다</p>
            <p className="text-white/40 text-sm">더 많이 학습하여 복습 항목을 만들어보세요!</p>
          </div>
        </div>
      )}
    </div>
  )
}

// 🎮 게임 섹션
function GamesSection({ addXP, addPoints, showToast }: any) {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  const games = [
    { 
      id: 'word-search', 
      label: '워드서치', 
      icon: FaPuzzlePiece, 
      description: 'AI 용어를 찾아보세요',
      difficulty: 'medium' as const
    },
    { 
      id: 'matching', 
      label: '매칭게임', 
      icon: FaHeart, 
      description: '용어와 정의를 매칭하세요',
      difficulty: 'easy' as const  
    }
  ]

  const mockWords = ['AI', 'Machine Learning', 'Deep Learning', 'Neural Network', 'Algorithm']
  const mockPairs = [
    { term: 'AI', definition: 'Artificial Intelligence' },
    { term: 'ML', definition: 'Machine Learning' },
    { term: 'DL', definition: 'Deep Learning' }
  ]

  return (
    <div className="space-y-6">
      {!activeGame ? (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">학습 게임</h2>
            <p className="text-white/60">재미있게 놀면서 학습하세요!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {games.map((game) => (
              <motion.button
                key={game.id}
                className="glass rounded-2xl p-8 text-center border border-white/10 hover:border-purple-400/30 hover:bg-purple-500/5 transition-all"
                onClick={() => setActiveGame(game.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <game.icon className="text-6xl text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{game.label}</h3>
                <p className="text-white/60 mb-4">{game.description}</p>
                <div className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${game.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                    game.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'}
                `}>
                  {game.difficulty === 'easy' ? '쉬움' : 
                   game.difficulty === 'medium' ? '보통' : '어려움'}
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setActiveGame(null)}
              className="glass p-3 rounded-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← 돌아가기
            </motion.button>
            <h3 className="text-xl font-bold text-white">
              {games.find(g => g.id === activeGame)?.label}
            </h3>
          </div>

          <div className="glass rounded-2xl p-6">
            {activeGame === 'word-search' && (
              <WordSearchPuzzle
                words={mockWords}
                difficulty="medium"
                onComplete={(time, score) => {
                  addXP(score / 10, '워드서치 완료')
                  addPoints(score / 20)
                  showToast(`${score}점 획득! (${time}초)`)
                  setActiveGame(null)
                }}
              />
            )}

            {activeGame === 'matching' && (
              <MatchingGame
                pairs={mockPairs}
                difficulty="easy"
                onComplete={(time, score) => {
                  addXP(score / 10, '매칭게임 완료')
                  addPoints(score / 20)
                  showToast(`${score}점 획득! (${time}초)`)
                  setActiveGame(null)
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// 👥 소셜 섹션
function SocialSection(props: any) {
  const [activeTab, setActiveTab] = useState('leaderboard')

  const tabs = [
    { id: 'leaderboard', label: '랭킹', icon: FaTrophy },
    { id: 'friends', label: '친구', icon: FaUsers },
    { id: 'competitions', label: '대회', icon: FaMedal }
  ]

  // 모의 데이터
  const mockLeaderboard = {
    period: 'weekly' as const,
    category: 'xp' as const,
    entries: [
      { rank: 1, userId: 'user1', username: '김학습', avatar: '', level: 15, score: 12500, change: 2 },
      { rank: 2, userId: 'user2', username: '이공부', avatar: '', level: 12, score: 11200, change: -1 },
      { rank: 3, userId: 'user3', username: '박지식', avatar: '', level: 14, score: 10800, change: 1 }
    ],
    lastUpdated: new Date().toISOString()
  }

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'glass text-white/70 hover:text-white'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'leaderboard' && (
        <LeaderboardDisplay
          leaderboard={mockLeaderboard}
          currentUserId={props.sessionId}
        />
      )}

      {activeTab === 'friends' && (
        <FriendsSystem
          friends={[]}
          onAddFriend={(username) => props.showToast(`${username}님께 친구 요청을 보냈습니다`)}
          onChallenge={(friendId) => props.showToast('도전장을 보냈습니다!')}
        />
      )}

      {activeTab === 'competitions' && (
        <CompetitionSystem
          competitions={[]}
          onJoin={(id) => props.showToast('대회에 참가했습니다!')}
        />
      )}
    </div>
  )
}

// 🎯 집중 섹션
function FocusSection(props: any) {
  const [activeTab, setActiveTab] = useState('pomodoro')

  const tabs = [
    { id: 'pomodoro', label: '뽀모도로', icon: FaClock },
    { id: 'reminders', label: '알림', icon: FaBell },
    { id: 'calendar', label: '캘린더', icon: FaCalendarAlt }
  ]

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                : 'glass text-white/70 hover:text-white'
              }
            `}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'pomodoro' && (
        <PomodoroTimer
          preferences={props.profile.preferences}
          onComplete={(type) => {
            if (type === 'work') {
              props.addXP(50, '뽀모도로 완료')
              props.updateMissionProgress('focus_time', 25)
            }
          }}
        />
      )}

      {activeTab === 'reminders' && (
        <SmartReminders
          reminders={props.profile.preferences.studyReminders}
          onAdd={(reminder) => props.showToast('새 알림이 추가되었습니다')}
          onEdit={(id, reminder) => props.showToast('알림이 수정되었습니다')}
          onDelete={(id) => props.showToast('알림이 삭제되었습니다')}
          onToggle={(id) => props.showToast('알림 상태가 변경되었습니다')}
        />
      )}

      {activeTab === 'calendar' && (
        <StudyCalendar
          studyData={{}}
          reminders={props.profile.preferences.studyReminders}
          onDateClick={(date) => props.showToast(`${date} 학습 내역을 확인하세요`)}
        />
      )}
    </div>
  )
}

// 📈 진행률 섹션
function ProgressSection(props: any) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">학습 분석</h2>
        <p className="text-white/60">상세한 학습 통계와 진행상황을 확인하세요</p>
      </div>

      {/* 데스크톱 히트맵 */}
      <div className="hidden md:block">
        <LearningHeatmap
          data={[]}
          onDateClick={(date, data) => props.showToast(`${date} 학습 내역`)}
        />
      </div>

      {/* 모바일 히트맵 */}
      <div className="block md:hidden">
        <MobileHeatmap data={[]} months={6} />
      </div>

      {/* 추가 통계 카드들 */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 text-center">
          <FaChartLine className="text-blue-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">85%</div>
          <div className="text-white/60 text-sm">평균 정답률</div>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <FaClock className="text-green-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">2.5h</div>
          <div className="text-white/60 text-sm">일일 평균 학습</div>
        </div>
        
        <div className="glass rounded-xl p-6 text-center">
          <FaTrophy className="text-yellow-400 text-3xl mx-auto mb-3" />
          <div className="text-2xl font-bold text-white mb-1">{props.profile.achievements.filter((a: any) => a.isCompleted).length}</div>
          <div className="text-white/60 text-sm">달성한 업적</div>
        </div>
      </div>
    </div>
  )
} 