"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DailyMission, Goal, UserProfile } from '@/types'
import { 
  FaBullseye, FaCalendarAlt, FaRocket, FaTrophy, FaGift, FaPlus,
  FaEdit, FaTrash, FaCheck, FaTimes, FaClock, FaFire, FaStar,
  FaChartLine, FaFlag, FaLightbulb, FaGem
} from 'react-icons/fa'

interface GoalsMissionsProps {
  userProfile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
  onClaimReward: (type: 'mission' | 'goal', id: string, reward: any) => void
}

export function GoalsMissions({ userProfile, onUpdateProfile, onClaimReward }: GoalsMissionsProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'goals'>('missions')
  const [missions, setMissions] = useState<DailyMission[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showMissionForm, setShowMissionForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // 미션 데이터 로드 및 생성
  useEffect(() => {
    loadMissions()
    loadGoals()
  }, [])

  const loadMissions = () => {
    const today = new Date().toISOString().split('T')[0]
    const savedMissions = localStorage.getItem(`missions_${today}`)
    
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions))
    } else {
      const newMissions = generateDailyMissions()
      setMissions(newMissions)
      localStorage.setItem(`missions_${today}`, JSON.stringify(newMissions))
    }
  }

  const loadGoals = () => {
    const savedGoals = localStorage.getItem('user_goals')
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }

  const generateDailyMissions = (): DailyMission[] => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return [
      {
        id: 'daily_ai_study',
        name: '오늘의 AI 학습',
        description: 'AI 정보 3개를 학습하세요',
        icon: '🧠',
        type: 'study_ai',
        target: 3,
        current: 0,
        isCompleted: false,
        reward: { xp: 100, points: 25 },
        validUntil: tomorrow.toISOString()
      },
      {
        id: 'daily_quiz',
        name: '오늘의 퀴즈 도전',
        description: '퀴즈 10문제를 풀어보세요',
        icon: '🎯',
        type: 'take_quiz',
        target: 10,
        current: 0,
        isCompleted: false,
        reward: { xp: 150, points: 35 },
        validUntil: tomorrow.toISOString()
      },
      {
        id: 'daily_terms',
        name: '용어 마스터',
        description: '새로운 용어 5개를 학습하세요',
        icon: '📚',
        type: 'learn_terms',
        target: 5,
        current: 0,
        isCompleted: false,
        reward: { xp: 80, points: 20 },
        validUntil: tomorrow.toISOString()
      },
      {
        id: 'daily_streak',
        name: '연속 학습 유지',
        description: '연속 학습 기록을 이어가세요',
        icon: '🔥',
        type: 'streak',
        target: 1,
        current: userProfile.streakDays > 0 ? 1 : 0,
        isCompleted: userProfile.streakDays > 0,
        reward: { xp: 50, points: 15 },
        validUntil: tomorrow.toISOString()
      }
    ]
  }

  const updateMissionProgress = (missionId: string, progress: number) => {
    const updatedMissions = missions.map(mission => {
      if (mission.id === missionId) {
        const newCurrent = Math.min(mission.current + progress, mission.target)
        const wasCompleted = mission.isCompleted
        const isNowCompleted = newCurrent >= mission.target

        if (!wasCompleted && isNowCompleted) {
          // 미션 완료 알림
          setTimeout(() => {
            onClaimReward('mission', mission.id, mission.reward)
          }, 500)
        }

        return {
          ...mission,
          current: newCurrent,
          isCompleted: isNowCompleted
        }
      }
      return mission
    })

    setMissions(updatedMissions)
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`missions_${today}`, JSON.stringify(updatedMissions))
  }

  const createGoal = (goalData: Omit<Goal, 'id' | 'current' | 'isCompleted'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      current: 0,
      isCompleted: false
    }

    const updatedGoals = [...goals, newGoal]
    setGoals(updatedGoals)
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
  }

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal, ...updates }
        
        // 목표 달성 체크
        if (!goal.isCompleted && updatedGoal.current >= updatedGoal.target) {
          updatedGoal.isCompleted = true
          setTimeout(() => {
            onClaimReward('goal', goal.id, goal.reward)
          }, 500)
        }
        
        return updatedGoal
      }
      return goal
    })

    setGoals(updatedGoals)
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals))
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return { expired: true, text: '만료됨' }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return { expired: false, text: `${days}일 ${hours}시간 남음` }
    if (hours > 0) return { expired: false, text: `${hours}시간 남음` }
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { expired: false, text: `${minutes}분 남음` }
  }

  const completedMissions = missions.filter(m => m.isCompleted).length
  const completedGoals = goals.filter(g => g.isCompleted).length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
                      <FaBullseye className="text-blue-400 text-2xl" />
          <h2 className="text-2xl font-bold text-white">목표 & 미션</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FaCheck className="text-green-400" />
              <span className="text-white">{completedMissions} / {missions.length} 미션</span>
            </div>
            <div className="flex items-center gap-1">
              <FaTrophy className="text-yellow-400" />
              <span className="text-white">{completedGoals} / {goals.length} 목표</span>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex bg-white/10 rounded-xl p-1">
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'missions'
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('missions')}
        >
          <FaRocket className="inline mr-2" />
          일일 미션
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'goals'
              ? 'bg-purple-500 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('goals')}
        >
          <FaBullseye className="inline mr-2" />
          목표 관리
        </button>
      </div>

      {/* 일일 미션 탭 */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          {/* 미션 진행률 요약 */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">오늘의 미션 진행률</h3>
              <div className="text-white font-bold">
                {completedMissions} / {missions.length}
              </div>
            </div>
            
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(completedMissions / missions.length) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {completedMissions === missions.length && (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-2" />
                <h4 className="text-xl font-bold text-yellow-300 mb-1">완벽한 하루!</h4>
                <p className="text-white/70">모든 일일 미션을 완료했습니다! 🎉</p>
              </motion.div>
            )}
          </div>

          {/* 미션 목록 */}
          <div className="grid gap-4">
            {missions.map((mission, index) => (
              <motion.div
                key={mission.id}
                className={`
                  glass rounded-2xl p-6 border transition-all
                  ${mission.isCompleted 
                    ? 'border-green-400/30 bg-green-500/10' 
                    : 'border-white/20 hover:border-white/30'
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  {/* 아이콘 */}
                  <div className={`
                    w-16 h-16 rounded-xl flex items-center justify-center text-2xl
                    ${mission.isCompleted 
                      ? 'bg-green-500/20 border border-green-400/30' 
                      : 'bg-blue-500/20 border border-blue-400/30'
                    }
                  `}>
                    {mission.isCompleted ? '✅' : mission.icon}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-bold text-white">{mission.name}</h4>
                      {mission.isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <FaCheck className="text-green-400" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-white/70 mb-4">{mission.description}</p>

                    {/* 진행률 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">진행률</span>
                        <span className="text-white font-bold">
                          {mission.current} / {mission.target}
                        </span>
                      </div>
                      
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`
                            h-full rounded-full
                            ${mission.isCompleted 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }
                          `}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((mission.current / mission.target) * 100, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* 보상 */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <FaRocket className="text-blue-400 text-sm" />
                        <span className="text-white/80 text-sm">{mission.reward.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaGem className="text-purple-400 text-sm" />
                        <span className="text-white/80 text-sm">{mission.reward.points} 포인트</span>
                      </div>
                    </div>
                  </div>

                  {/* 완료/테스트 버튼 */}
                  <div className="flex flex-col gap-2">
                    {!mission.isCompleted && (
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        onClick={() => updateMissionProgress(mission.id, 1)}
                      >
                        테스트
                      </button>
                    )}
                    
                    {mission.isCompleted && (
                      <div className="text-center">
                        <FaTrophy className="text-yellow-400 text-xl mx-auto mb-1" />
                        <div className="text-green-400 text-sm font-bold">완료!</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 목표 관리 탭 */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* 새 목표 추가 버튼 */}
          <div className="flex justify-end">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              onClick={() => setShowGoalForm(true)}
            >
              <FaPlus />
              새 목표 추가
            </button>
          </div>

          {/* 목표 목록 */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <FaBullseye className="text-6xl text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">목표를 설정해보세요!</h3>
              <p className="text-white/60 mb-6">학습 목표를 설정하고 꾸준히 달성해나가세요.</p>
              <button
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                onClick={() => setShowGoalForm(true)}
              >
                첫 번째 목표 만들기
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal, index) => {
                const timeRemaining = getTimeRemaining(goal.deadline)
                const progressPercent = (goal.current / goal.target) * 100

                return (
                  <motion.div
                    key={goal.id}
                    className={`
                      glass rounded-2xl p-6 border transition-all
                      ${goal.isCompleted 
                        ? 'border-yellow-400/30 bg-yellow-500/10' 
                        : timeRemaining.expired
                        ? 'border-red-400/30 bg-red-500/10'
                        : 'border-white/20 hover:border-white/30'
                      }
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${goal.type === 'daily' ? 'bg-green-500/20 text-green-400' :
                              goal.type === 'weekly' ? 'bg-blue-500/20 text-blue-400' :
                              goal.type === 'monthly' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-orange-500/20 text-orange-400'
                            }
                          `}>
                            {goal.type === 'daily' ? '일일' :
                             goal.type === 'weekly' ? '주간' :
                             goal.type === 'monthly' ? '월간' : '커스텀'}
                          </span>
                        </div>
                        <p className="text-white/70 mb-3">{goal.description}</p>

                        {/* 진행률 */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/80">진행률</span>
                            <span className="text-white font-bold">
                              {goal.current} / {goal.target} ({Math.round(progressPercent)}%)
                            </span>
                          </div>
                          
                          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`
                                h-full rounded-full
                                ${goal.isCompleted 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                                }
                              `}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>

                        {/* 마감일 */}
                        <div className="flex items-center justify-between">
                          <div className={`
                            flex items-center gap-1 text-sm
                            ${timeRemaining.expired ? 'text-red-400' : 'text-white/70'}
                          `}>
                            <FaClock />
                            <span>{timeRemaining.text}</span>
                          </div>

                          {/* 보상 */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <FaRocket className="text-blue-400 text-sm" />
                              <span className="text-white/80 text-sm">{goal.reward.xp} XP</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaGem className="text-purple-400 text-sm" />
                              <span className="text-white/80 text-sm">{goal.reward.points} 포인트</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 ml-4">
                        {goal.isCompleted ? (
                          <div className="text-center">
                            <FaTrophy className="text-yellow-400 text-2xl mx-auto mb-1" />
                            <div className="text-yellow-400 text-sm font-bold">달성!</div>
                          </div>
                        ) : (
                          <>
                            <button
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              onClick={() => {
                                setEditingGoal(goal)
                                setShowGoalForm(true)
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              onClick={() => deleteGoal(goal.id)}
                            >
                              <FaTrash />
                            </button>
                            <button
                              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors"
                              onClick={() => updateGoal(goal.id, { current: goal.current + 1 })}
                            >
                              +1
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 목표 생성/편집 모달 */}
      <GoalFormModal
        isOpen={showGoalForm}
        onClose={() => {
          setShowGoalForm(false)
          setEditingGoal(null)
        }}
        onSave={editingGoal ? 
          (goalData) => updateGoal(editingGoal.id, goalData) :
          createGoal
        }
        editingGoal={editingGoal}
      />
    </div>
  )
}

// 목표 생성/편집 모달
interface GoalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goalData: any) => void
  editingGoal?: Goal | null
}

function GoalFormModal({ isOpen, onClose, onSave, editingGoal }: GoalFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'weekly' as Goal['type'],
    target: 10,
    category: 'ai_info' as Goal['category'],
    deadline: ''
  })

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        description: editingGoal.description,
        type: editingGoal.type,
        target: editingGoal.target,
        category: editingGoal.category,
        deadline: editingGoal.deadline.split('T')[0]
      })
    } else {
      // 기본 마감일 설정
      const defaultDeadline = new Date()
      defaultDeadline.setDate(defaultDeadline.getDate() + 7)
      setFormData(prev => ({
        ...prev,
        deadline: defaultDeadline.toISOString().split('T')[0]
      }))
    }
  }, [editingGoal, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const goalData = {
      ...formData,
      deadline: new Date(formData.deadline).toISOString(),
      reward: {
        xp: formData.target * 10,
        points: formData.target * 5
      }
    }

    onSave(goalData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass rounded-2xl p-6 max-w-md w-full border border-white/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-6">
          {editingGoal ? '목표 편집' : '새 목표 만들기'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">목표 이름</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="예: AI 정보 50개 학습하기"
              required
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              placeholder="목표에 대한 상세 설명..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">기간</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="daily">일일</option>
                <option value="weekly">주간</option>
                <option value="monthly">월간</option>
                <option value="custom">커스텀</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">목표값</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">카테고리</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="ai_info">AI 정보</option>
                <option value="quiz">퀴즈</option>
                <option value="terms">용어</option>
                <option value="streak">연속 학습</option>
                <option value="xp">XP</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">마감일</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
          </div>

          {/* 예상 보상 */}
          <div className="glass rounded-lg p-3">
            <h4 className="text-white font-medium mb-2">예상 보상</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <FaRocket className="text-blue-400" />
                <span className="text-white">{formData.target * 10} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <FaGem className="text-purple-400" />
                <span className="text-white">{formData.target * 5} 포인트</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              {editingGoal ? '수정' : '생성'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
} 