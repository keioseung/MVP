// 🎯 AI Info Types
export interface TermItem {
  term: string
  description: string
}

export interface AIInfoItem {
  title: string
  content: string
  terms?: TermItem[]
}

export interface AIInfoCreate {
  date: string
  infos: AIInfoItem[]
}

export interface AIInfo {
  id: number
  title: string
  content: string
  keywords: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: string
}

// 🧩 Quiz Types
export interface Quiz {
  id: number
  topic: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
  created_at: string
  title?: string
  type?: 'multiple_choice' | 'true_false' | 'fill_blank'
  options?: string[]
  correct_answer?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface QuizCreate {
  topic: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
}

// 📊 User Progress Types
export interface UserProgress {
  [date: string]: number[] | any
  terms_by_date?: { [date: string]: any[] }
  quiz_score_by_date?: { [date: string]: any[] }
  sessionId?: string
}

export interface UserProgressExtra {
  terms_by_date?: { [date: string]: any[] }
  quiz_score_by_date?: { [date: string]: any[] }
}

export interface UserStats {
  total_learned: number
  streak_days: number
  last_learned_date: string | null
  quiz_score: number
  achievements: string[]
  today_ai_info?: number
  today_terms?: number
  today_quiz_score?: number
  today_quiz_correct?: number
  today_quiz_total?: number
  total_terms_learned?: number
  total_terms_available?: number
  total_ai_info_available?: number
  cumulative_quiz_score?: number
  total_quiz_correct?: number
  total_quiz_questions?: number
  max_streak?: number
}

// 📝 Prompt Types
export interface Prompt {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export interface PromptCreate {
  title: string
  content: string
  category: string
}

// 📚 Base Content Types
export interface BaseContent {
  id: number
  title: string
  content: string
  category: string
  created_at: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  tags?: string[]
}

export interface BaseContentCreate {
  title: string
  content: string
  category: string
}

// 📰 News Types
export interface NewsItem {
  title: string
  content: string
  link: string
}

// 👤 User Types
export interface User {
  id?: string
  username: string
  password?: string
  email?: string
  role: 'admin' | 'user'
  createdAt?: string
  lastLoginAt?: string
  profile?: UserProfile
}

// 🎮 게임화 시스템 타입들
export interface UserProfile {
  avatar?: string
  level: number
  xp: number
  totalXp: number
  streakDays: number
  maxStreak: number
  points: number
  badges: Badge[]
  achievements: GameAchievement[]
  preferences: UserPreferences
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: string
  category: 'learning' | 'streak' | 'quiz' | 'social' | 'achievement'
}

export interface GameAchievement {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  maxProgress: number
  isCompleted: boolean
  completedAt?: string
  reward: {
    xp: number
    points: number
    badges?: string[]
  }
}

// Legacy Achievement Type (기존 호환성용)
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: 'ko' | 'en'
  notifications: {
    daily: boolean
    weekly: boolean
    achievements: boolean
    reminders: boolean
  }
  studyReminders: StudyReminder[]
  soundEffects: boolean
  animations: boolean
}

export interface StudyReminder {
  id: string
  time: string
  days: number[] // 0-6 (일-토)
  message: string
  isActive: boolean
}

// 🎯 미션 & 목표 시스템
export interface DailyMission {
  id: string
  name: string
  description: string
  icon: string
  type: 'study_ai' | 'take_quiz' | 'learn_terms' | 'streak' | 'points'
  target: number
  current: number
  isCompleted: boolean
  reward: {
    xp: number
    points: number
    badges?: string[]
  }
  validUntil: string
}

export interface Goal {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  target: number
  current: number
  category: 'ai_info' | 'quiz' | 'terms' | 'streak' | 'xp'
  deadline: string
  isCompleted: boolean
  reward: {
    xp: number
    points: number
    badges?: string[]
  }
}

// 🔄 복습 시스템
export interface ReviewItem {
  id: string
  type: 'quiz' | 'term' | 'ai_info'
  contentId: string | number
  lastReviewed: string
  nextReview: string
  difficulty: number // 1-5 (쉬움-어려움)
  correctCount: number
  totalCount: number
  isActive: boolean
}

export interface StudySession {
  id: string
  startTime: string
  endTime?: string
  duration?: number
  itemsStudied: number
  correctAnswers: number
  totalQuestions: number
  xpEarned: number
  pointsEarned: number
  type: 'ai_info' | 'quiz' | 'review' | 'flashcard'
}

// 🏅 랭킹 & 경쟁 시스템
export interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all_time'
  category: 'xp' | 'streak' | 'quiz_score' | 'points'
  entries: LeaderboardEntry[]
  lastUpdated: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string
  level: number
  score: number
  change: number // 순위 변동
  badge?: string // 특별 배지
}

export interface Friend {
  id: string
  username: string
  avatar?: string
  level: number
  isOnline: boolean
  lastActive: string
  mutualFriends: number
}

// 📊 학습 분석 & 통계
export interface LearningStats {
  dailyStats: DailyStats[]
  weeklyStats: WeeklyStats[]
  monthlyStats: MonthlyStats[]
  categoryStats: CategoryStats[]
  streakHistory: StreakHistory[]
  heatmapData: HeatmapData[]
}

export interface DailyStats {
  date: string
  aiInfoCount: number
  quizCount: number
  termsLearned: number
  studyTime: number
  xpEarned: number
  streakDay: boolean
}

export interface WeeklyStats {
  week: string
  totalStudyTime: number
  averageScore: number
  itemsCompleted: number
  xpEarned: number
  streakDays: number
}

export interface MonthlyStats {
  month: string
  totalStudyTime: number
  averageScore: number
  itemsCompleted: number
  xpEarned: number
  streakDays: number
  goalsAchieved: number
}

export interface CategoryStats {
  category: string
  totalTime: number
  accuracy: number
  itemsCompleted: number
  averageDifficulty: number
  strongestArea: string
  weakestArea: string
}

export interface StreakHistory {
  startDate: string
  endDate: string
  days: number
  isActive: boolean
}

export interface HeatmapData {
  date: string
  value: number // 0-4 (활동 강도)
  details: {
    aiInfo: number
    quiz: number
    terms: number
    studyTime: number
  }
}

// 🎨 학습 콘텐츠 확장
export interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  lastReviewed?: string
  nextReview?: string
  correctCount: number
  totalCount: number
  tags: string[]
}

export interface Puzzle {
  id: string
  type: 'crossword' | 'word_search' | 'matching'
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number
  data: any // 퍼즐별 데이터 구조
  isCompleted: boolean
  bestTime?: number
  attempts: number
}

// 🔔 알림 시스템
export interface Notification {
  id: string
  type: 'achievement' | 'reminder' | 'social' | 'system'
  title: string
  message: string
  icon?: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  data?: any
}

// 📱 PWA & 앱 설정
export interface AppSettings {
  version: string
  isInstalled: boolean
  lastSync: string
  offlineMode: boolean
  cacheSize: number
  autoSync: boolean
  dataUsage: {
    images: boolean
    videos: boolean
    sounds: boolean
  }
} 