"use client"

import { useState, useEffect, useCallback } from 'react'
import { UserProfile, Badge, GameAchievement, DailyMission, Goal, StudySession, ReviewItem } from '@/types'

// 🎮 게임화 시스템 훅
export function useGamification(sessionId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 프로필 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem(`profile_${sessionId}`)
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        // 초기 프로필 생성
        const initialProfile: UserProfile = {
          level: 1,
          xp: 0,
          totalXp: 0,
          streakDays: 0,
          maxStreak: 0,
          points: 0,
          badges: [],
          achievements: getInitialAchievements(),
          preferences: getDefaultPreferences()
        }
        setProfile(initialProfile)
        localStorage.setItem(`profile_${sessionId}`, JSON.stringify(initialProfile))
      }
      setIsLoading(false)
    }
  }, [sessionId])

  // 프로필 저장
  const saveProfile = useCallback((newProfile: UserProfile) => {
    setProfile(newProfile)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`profile_${sessionId}`, JSON.stringify(newProfile))
    }
  }, [sessionId])

  // XP 추가 및 레벨업 체크
  const addXP = useCallback((amount: number, source: string = '') => {
    if (!profile) return

    const newXp = profile.xp + amount
    const newTotalXp = profile.totalXp + amount
    const newLevel = calculateLevel(newTotalXp)
    const leveledUp = newLevel > profile.level

    const updatedProfile = {
      ...profile,
      xp: newLevel > profile.level ? newXp - getXPRequiredForLevel(newLevel) : newXp,
      totalXp: newTotalXp,
      level: newLevel
    }

    saveProfile(updatedProfile)

    // 레벨업 알림 및 보상
    if (leveledUp) {
      showLevelUpNotification(newLevel)
      grantLevelUpRewards(newLevel)
    }

    // XP 획득 알림
    showXPNotification(amount, source)

    return { leveledUp, newLevel }
  }, [profile, saveProfile])

  // 포인트 추가
  const addPoints = useCallback((amount: number) => {
    if (!profile) return
    
    const updatedProfile = {
      ...profile,
      points: profile.points + amount
    }
    saveProfile(updatedProfile)
    showPointsNotification(amount)
  }, [profile, saveProfile])

  // 배지 언락
  const unlockBadge = useCallback((badgeId: string) => {
    if (!profile) return

    const badge = getAllBadges().find(b => b.id === badgeId)
    if (!badge || profile.badges.find(b => b.id === badgeId)) return

    const newBadge: Badge = {
      ...badge,
      unlockedAt: new Date().toISOString()
    }

    const updatedProfile = {
      ...profile,
      badges: [...profile.badges, newBadge]
    }
    saveProfile(updatedProfile)
    showBadgeUnlockedNotification(newBadge)
  }, [profile, saveProfile])

  // 업적 진행률 업데이트
  const updateAchievement = useCallback((achievementId: string, progress: number) => {
    if (!profile) return

    const updatedAchievements = profile.achievements.map(achievement => {
      if (achievement.id === achievementId) {
        const newProgress = Math.min(progress, achievement.maxProgress)
        const wasCompleted = achievement.isCompleted
        const isNowCompleted = newProgress >= achievement.maxProgress

        if (!wasCompleted && isNowCompleted) {
          // 업적 완료 보상 지급
          addXP(achievement.reward.xp, `업적: ${achievement.name}`)
          addPoints(achievement.reward.points)
          
          if (achievement.reward.badges) {
            achievement.reward.badges.forEach(badgeId => unlockBadge(badgeId))
          }

          showAchievementCompletedNotification(achievement)
        }

        return {
          ...achievement,
          progress: newProgress,
          isCompleted: isNowCompleted,
          completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : achievement.completedAt
        }
      }
      return achievement
    })

    const updatedProfile = {
      ...profile,
      achievements: updatedAchievements
    }
    saveProfile(updatedProfile)
  }, [profile, saveProfile, addXP, addPoints, unlockBadge])

  // 스트릭 업데이트
  const updateStreak = useCallback(() => {
    if (!profile) return

    const today = new Date().toISOString().split('T')[0]
    const lastStudyDate = localStorage.getItem(`lastStudyDate_${sessionId}`)
    
    if (lastStudyDate === today) return // 오늘 이미 업데이트됨

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreakDays = profile.streakDays

    if (lastStudyDate === yesterdayStr) {
      // 연속 학습
      newStreakDays = profile.streakDays + 1
    } else if (lastStudyDate && lastStudyDate < yesterdayStr) {
      // 스트릭 끊김
      newStreakDays = 1
    } else if (!lastStudyDate) {
      // 첫 학습
      newStreakDays = 1
    }

    const newMaxStreak = Math.max(profile.maxStreak, newStreakDays)

    const updatedProfile = {
      ...profile,
      streakDays: newStreakDays,
      maxStreak: newMaxStreak
    }

    saveProfile(updatedProfile)
    localStorage.setItem(`lastStudyDate_${sessionId}`, today)

    // 스트릭 관련 업적 업데이트
    updateAchievement('streak_7', newStreakDays >= 7 ? 1 : 0)
    updateAchievement('streak_30', newStreakDays >= 30 ? 1 : 0)
    updateAchievement('streak_100', newStreakDays >= 100 ? 1 : 0)

    // 스트릭 알림
    if (newStreakDays > 1) {
      showStreakNotification(newStreakDays)
    }
  }, [profile, saveProfile, sessionId, updateAchievement])

  return {
    profile,
    isLoading,
    addXP,
    addPoints,
    unlockBadge,
    updateAchievement,
    updateStreak,
    saveProfile
  }
}

// 🎯 미션 시스템 훅
export function useMissions(sessionId: string) {
  const [missions, setMissions] = useState<DailyMission[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadMissions()
      loadGoals()
    }
  }, [sessionId])

  const loadMissions = () => {
    const today = new Date().toISOString().split('T')[0]
    const savedMissions = localStorage.getItem(`missions_${sessionId}_${today}`)
    
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions))
    } else {
      // 새로운 일일 미션 생성
      const newMissions = generateDailyMissions()
      setMissions(newMissions)
      localStorage.setItem(`missions_${sessionId}_${today}`, JSON.stringify(newMissions))
    }
  }

  const loadGoals = () => {
    const savedGoals = localStorage.getItem(`goals_${sessionId}`)
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }

  const updateMissionProgress = useCallback((missionId: string, progress: number) => {
    const updatedMissions = missions.map(mission => {
      if (mission.id === missionId) {
        const newCurrent = Math.min(mission.current + progress, mission.target)
        const isCompleted = newCurrent >= mission.target && !mission.isCompleted

        if (isCompleted) {
          // 미션 완료 보상
          showMissionCompletedNotification(mission)
        }

        return {
          ...mission,
          current: newCurrent,
          isCompleted: newCurrent >= mission.target
        }
      }
      return mission
    })

    setMissions(updatedMissions)
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`missions_${sessionId}_${today}`, JSON.stringify(updatedMissions))
  }, [missions, sessionId])

  return {
    missions,
    goals,
    updateMissionProgress,
    loadMissions,
    loadGoals
  }
}

// 🔄 복습 시스템 훅
export function useReviewSystem(sessionId: string) {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`reviewItems_${sessionId}`)
      if (saved) {
        setReviewItems(JSON.parse(saved))
      }
    }
  }, [sessionId])

  const addReviewItem = useCallback((item: Omit<ReviewItem, 'id' | 'lastReviewed' | 'nextReview'>) => {
    const newItem: ReviewItem = {
      ...item,
      id: `${item.type}_${item.contentId}_${Date.now()}`,
      lastReviewed: new Date().toISOString(),
      nextReview: calculateNextReview(1), // 초기 난이도 1
      correctCount: 0,
      totalCount: 0,
      isActive: true
    }

    const updatedItems = [...reviewItems, newItem]
    setReviewItems(updatedItems)
    localStorage.setItem(`reviewItems_${sessionId}`, JSON.stringify(updatedItems))
  }, [reviewItems, sessionId])

  const updateReviewItem = useCallback((itemId: string, isCorrect: boolean) => {
    const updatedItems = reviewItems.map(item => {
      if (item.id === itemId) {
        const newCorrectCount = item.correctCount + (isCorrect ? 1 : 0)
        const newTotalCount = item.totalCount + 1
        const accuracy = newCorrectCount / newTotalCount
        
        // 망각곡선 기반 다음 복습 일정 계산
        const newDifficulty = calculateDifficulty(accuracy, item.difficulty)
        const nextReview = calculateNextReview(newDifficulty)

        return {
          ...item,
          correctCount: newCorrectCount,
          totalCount: newTotalCount,
          difficulty: newDifficulty,
          lastReviewed: new Date().toISOString(),
          nextReview
        }
      }
      return item
    })

    setReviewItems(updatedItems)
    localStorage.setItem(`reviewItems_${sessionId}`, JSON.stringify(updatedItems))
  }, [reviewItems, sessionId])

  const getDueReviews = () => {
    const now = new Date().toISOString()
    return reviewItems.filter(item => item.isActive && item.nextReview <= now)
  }

  return {
    reviewItems,
    addReviewItem,
    updateReviewItem,
    getDueReviews
  }
}

// 유틸리티 함수들
function calculateLevel(totalXp: number): number {
  // 레벨별 필요 XP: 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, ...
  let level = 1
  let requiredXp = 0
  
  while (totalXp >= requiredXp) {
    level++
    requiredXp += getXPRequiredForLevel(level)
  }
  
  return level - 1
}

function getXPRequiredForLevel(level: number): number {
  return 100 + (level - 1) * 50 + Math.floor((level - 1) / 5) * 100
}

function calculateNextReview(difficulty: number): string {
  const intervals = [1, 3, 7, 14, 30, 90] // 일 단위
  const index = Math.min(Math.floor(difficulty) - 1, intervals.length - 1)
  const days = intervals[Math.max(0, index)]
  
  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + days)
  return nextReview.toISOString()
}

function calculateDifficulty(accuracy: number, currentDifficulty: number): number {
  if (accuracy >= 0.9) return Math.min(currentDifficulty + 1, 5)
  if (accuracy >= 0.7) return currentDifficulty
  return Math.max(currentDifficulty - 1, 1)
}

function getInitialAchievements(): GameAchievement[] {
  return [
    {
      id: 'first_study',
      name: '첫 걸음',
      description: '첫 AI 정보를 학습하세요',
      icon: '🎯',
      progress: 0,
      maxProgress: 1,
      isCompleted: false,
      reward: { xp: 50, points: 10 }
    },
    {
      id: 'streak_7',
      name: '일주일 도전',
      description: '7일 연속 학습하세요',
      icon: '🔥',
      progress: 0,
      maxProgress: 1,
      isCompleted: false,
      reward: { xp: 200, points: 50, badges: ['streak_master'] }
    },
    {
      id: 'quiz_master',
      name: '퀴즈 마스터',
      description: '퀴즈 100문제를 맞히세요',
      icon: '🧠',
      progress: 0,
      maxProgress: 100,
      isCompleted: false,
      reward: { xp: 500, points: 100, badges: ['quiz_expert'] }
    }
  ]
}

function getDefaultPreferences() {
  return {
    theme: 'dark' as const,
    language: 'ko' as const,
    notifications: {
      daily: true,
      weekly: true,
      achievements: true,
      reminders: true
    },
    studyReminders: [],
    soundEffects: true,
    animations: true
  }
}

function getAllBadges(): Badge[] {
  return [
    {
      id: 'streak_master',
      name: '연속 학습자',
      description: '7일 연속 학습 달성',
      icon: '🔥',
      rarity: 'rare',
      category: 'streak',
      unlockedAt: ''
    },
    {
      id: 'quiz_expert',
      name: '퀴즈 전문가',
      description: '퀴즈 100문제 정답',
      icon: '🧠',
      rarity: 'epic',
      category: 'quiz',
      unlockedAt: ''
    }
  ]
}

function generateDailyMissions(): DailyMission[] {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  return [
    {
      id: 'daily_study',
      name: '오늘의 학습',
      description: 'AI 정보 3개를 학습하세요',
      icon: '📚',
      type: 'study_ai',
      target: 3,
      current: 0,
      isCompleted: false,
      reward: { xp: 100, points: 20 },
      validUntil: tomorrow.toISOString()
    },
    {
      id: 'daily_quiz',
      name: '오늘의 퀴즈',
      description: '퀴즈 10문제를 풀어보세요',
      icon: '🎯',
      type: 'take_quiz',
      target: 10,
      current: 0,
      isCompleted: false,
      reward: { xp: 150, points: 30 },
      validUntil: tomorrow.toISOString()
    }
  ]
}

// 알림 함수들
function showLevelUpNotification(level: number) {
  // 실제 구현에서는 toast나 modal을 사용
  console.log(`🎉 레벨 ${level}로 승급!`)
}

function showXPNotification(amount: number, source: string) {
  console.log(`+${amount} XP ${source ? `(${source})` : ''}`)
}

function showPointsNotification(amount: number) {
  console.log(`+${amount} 포인트`)
}

function showBadgeUnlockedNotification(badge: Badge) {
  console.log(`🏆 새 배지 획득: ${badge.name}`)
}

function showAchievementCompletedNotification(achievement: GameAchievement) {
  console.log(`✨ 업적 달성: ${achievement.name}`)
}

function showStreakNotification(days: number) {
  console.log(`🔥 ${days}일 연속 학습!`)
}

function showMissionCompletedNotification(mission: DailyMission) {
  console.log(`✅ 미션 완료: ${mission.name}`)
}

function grantLevelUpRewards(level: number) {
  // 레벨업 보상 지급 로직
  console.log(`레벨 ${level} 보상 지급`)
} 