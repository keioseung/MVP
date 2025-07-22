"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StudyReminder, UserPreferences } from '@/types'
import type { Notification } from '@/types'
import { 
  FaBell, FaClock, FaPlay, FaPause, FaStop, FaUndo,
  FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaCoffee,
  FaBrain, FaLeaf, FaSun, FaMoon, FaVolumeUp, FaVolumeOff
} from 'react-icons/fa'

// 🍅 뽀모도로 타이머 컴포넌트
interface PomodoroTimerProps {
  onComplete?: (type: 'work' | 'break') => void
  preferences: UserPreferences
}

export function PomodoroTimer({ onComplete, preferences }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25분 기본
  const [isRunning, setIsRunning] = useState(false)
  const [currentMode, setCurrentMode] = useState<'work' | 'short' | 'long'>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const modes = {
    work: { duration: 25 * 60, label: '집중', color: 'from-red-500 to-pink-500', icon: FaBrain },
    short: { duration: 5 * 60, label: '짧은 휴식', color: 'from-green-500 to-emerald-500', icon: FaCoffee },
    long: { duration: 15 * 60, label: '긴 휴식', color: 'from-blue-500 to-cyan-500', icon: FaLeaf }
  }

  const currentModeData = modes[currentMode]

  // 타이머 로직
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    // 사운드 재생
    if (preferences.soundEffects) {
      playCompletionSound()
    }

    // 다음 모드 자동 설정
    if (currentMode === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'long' : 'short'
      setCurrentMode(nextMode)
      setTimeLeft(modes[nextMode].duration)
      onComplete?.('work')
    } else {
      setCurrentMode('work')
      setTimeLeft(modes.work.duration)
      onComplete?.('break')
    }

    // 브라우저 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('뽀모도로 완료!', {
        body: currentMode === 'work' ? '휴식 시간입니다' : '집중 시간입니다',
        icon: '/icon-192x192.png'
      })
    }
  }

  const playCompletionSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {
        // 오디오 재생 실패 시 무시
      })
    } catch (error) {
      // 오디오 파일이 없는 경우 무시
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    return ((currentModeData.duration - timeLeft) / currentModeData.duration) * 100
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(currentModeData.duration)
  }

  const switchMode = (mode: 'work' | 'short' | 'long') => {
    setIsRunning(false)
    setCurrentMode(mode)
    setTimeLeft(modes[mode].duration)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaClock className="text-red-400 text-2xl" />
          <div>
            <h3 className="text-xl font-bold text-white">뽀모도로 타이머</h3>
            <p className="text-white/60 text-sm">집중력 향상을 위한 시간 관리</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">완료:</span>
          <span className="text-white font-bold">{completedPomodoros}</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < completedPomodoros % 4 ? 'bg-red-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 메인 타이머 */}
      <motion.div
        className={`
          glass rounded-3xl p-8 border-2 border-white/10
          bg-gradient-to-br ${currentModeData.color} bg-opacity-10
        `}
        layout
      >
        {/* 모드 선택 */}
        <div className="flex gap-2 mb-8 justify-center">
          {Object.entries(modes).map(([key, mode]) => {
            const ModeIcon = mode.icon
            return (
              <motion.button
                key={key}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
                  ${currentMode === key 
                    ? `bg-gradient-to-r ${mode.color} text-white` 
                    : 'glass text-white/70 hover:text-white'
                  }
                `}
                onClick={() => switchMode(key as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ModeIcon />
                {mode.label}
              </motion.button>
            )
          })}
        </div>

        {/* 원형 진행률 */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* 배경 원 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            {/* 진행률 원 */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 45 * (1 - getProgress() / 100)
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* 시간 표시 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-6xl font-black text-white mb-2"
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="text-white/60 text-lg font-medium">
              {currentModeData.label}
            </div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-4">
          <motion.button
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={resetTimer}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaUndo className="text-xl" />
          </motion.button>

          <motion.button
            className={`
              w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl
              bg-gradient-to-r ${currentModeData.color} shadow-lg
            `}
            onClick={toggleTimer}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRunning ? <FaPause /> : <FaPlay className="ml-1" />}
          </motion.button>

          <motion.button
            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setIsRunning(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaStop className="text-xl" />
          </motion.button>
        </div>
      </motion.div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{completedPomodoros}</div>
          <div className="text-white/60 text-sm">오늘 완료</div>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {Math.floor(completedPomodoros * 25 / 60)}h {(completedPomodoros * 25) % 60}m
          </div>
          <div className="text-white/60 text-sm">집중 시간</div>
        </div>
        
        <div className="glass rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {completedPomodoros > 0 ? Math.round((completedPomodoros / 8) * 100) : 0}%
          </div>
          <div className="text-white/60 text-sm">목표 달성</div>
        </div>
      </div>
    </div>
  )
}

// 🔔 스마트 알림 시스템
interface SmartRemindersProps {
  reminders: StudyReminder[]
  onAdd: (reminder: Omit<StudyReminder, 'id'>) => void
  onEdit: (id: string, reminder: Partial<StudyReminder>) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

export function SmartReminders({ reminders, onAdd, onEdit, onDelete, onToggle }: SmartRemindersProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaBell className="text-blue-400 text-2xl" />
          <div>
            <h3 className="text-xl font-bold text-white">학습 알림</h3>
            <p className="text-white/60 text-sm">규칙적인 학습을 위한 스마트 알림</p>
          </div>
        </div>
        
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus />
          알림 추가
        </motion.button>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-3">
        <AnimatePresence>
          {reminders.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              className={`
                glass rounded-xl p-4 border
                ${reminder.isActive ? 'border-blue-400/30 bg-blue-500/5' : 'border-white/10 opacity-60'}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: reminder.isActive ? 1 : 0.6, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <div className="flex items-center gap-4">
                {/* 시간 */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{reminder.time}</div>
                  <div className="text-white/60 text-xs">
                    {reminder.days.length === 7 ? '매일' : 
                     reminder.days.map(d => weekDays[d]).join(', ')}
                  </div>
                </div>

                {/* 메시지 */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{reminder.message}</p>
                  <div className="flex gap-1 mt-1">
                    {reminder.days.map(day => (
                      <span
                        key={day}
                        className={`
                          w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                          ${reminder.isActive ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/60'}
                        `}
                      >
                        {weekDays[day]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 컨트롤 */}
                <div className="flex items-center gap-2">
                  <motion.button
                    className={`
                      w-12 h-6 rounded-full relative transition-colors
                      ${reminder.isActive ? 'bg-blue-500' : 'bg-white/20'}
                    `}
                    onClick={() => onToggle(reminder.id)}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      animate={{ x: reminder.isActive ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                  
                  <button
                    onClick={() => setEditingId(reminder.id)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <FaEdit />
                  </button>
                  
                  <button
                    onClick={() => onDelete(reminder.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reminders.length === 0 && (
          <div className="text-center py-12">
            <FaBell className="text-6xl text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">설정된 알림이 없습니다</p>
            <p className="text-white/40 text-sm">학습 알림을 설정하여 규칙적으로 공부해보세요!</p>
          </div>
        )}
      </div>

      {/* 알림 추가/편집 폼 */}
      <ReminderForm
        show={showAddForm || !!editingId}
        reminder={editingId ? reminders.find(r => r.id === editingId) : undefined}
        onSave={(reminderData) => {
          if (editingId) {
            onEdit(editingId, reminderData)
            setEditingId(null)
          } else {
            onAdd(reminderData)
            setShowAddForm(false)
          }
        }}
        onCancel={() => {
          setShowAddForm(false)
          setEditingId(null)
        }}
      />
    </div>
  )
}

// 알림 추가/편집 폼 컴포넌트
interface ReminderFormProps {
  show: boolean
  reminder?: StudyReminder
  onSave: (reminder: Omit<StudyReminder, 'id'>) => void
  onCancel: () => void
}

function ReminderForm({ show, reminder, onSave, onCancel }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    time: reminder?.time || '09:00',
    days: reminder?.days || [1, 2, 3, 4, 5], // 평일 기본
    message: reminder?.message || '학습할 시간입니다! 📚',
    isActive: reminder?.isActive ?? true
  })

  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.days.length > 0 && formData.message.trim()) {
      onSave(formData)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="glass rounded-2xl p-6 w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-white mb-6">
              {reminder ? '알림 편집' : '새 알림 추가'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 시간 선택 */}
              <div>
                <label className="block text-white font-medium mb-2">시간</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 요일 선택 */}
              <div>
                <label className="block text-white font-medium mb-3">반복 요일</label>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <motion.button
                      key={index}
                      type="button"
                      className={`
                        h-10 rounded-lg font-bold text-sm
                        ${formData.days.includes(index)
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }
                      `}
                      onClick={() => toggleDay(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {day}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 메시지 */}
              <div>
                <label className="block text-white font-medium mb-2">알림 메시지</label>
                <input
                  type="text"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="학습 알림 메시지를 입력하세요"
                  required
                />
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 text-white/70 hover:text-white transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  {reminder ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 📅 학습 캘린더 컴포넌트
interface StudyCalendarProps {
  studyData: { [date: string]: { duration: number, activities: string[] } }
  onDateClick?: (date: string) => void
  reminders: StudyReminder[]
}

export function StudyCalendar({ studyData, onDateClick, reminders }: StudyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // 이전 달의 빈 날들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const getDateString = (day: number | null) => {
    if (!day) return ''
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month, day).toISOString().split('T')[0]
  }

  const hasStudyData = (dateString: string) => {
    return studyData[dateString]?.duration > 0
  }

  const hasReminder = (day: number | null) => {
    if (!day) return false
    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay()
    return reminders.some(r => r.isActive && r.days.includes(dayOfWeek))
  }

  const getIntensity = (dateString: string) => {
    const data = studyData[dateString]
    if (!data) return 0
    if (data.duration < 30) return 1
    if (data.duration < 60) return 2
    if (data.duration < 120) return 3
    return 4
  }

  const intensityColors = [
    'bg-white/5',
    'bg-green-200/20',
    'bg-green-300/30',
    'bg-green-400/40',
    'bg-green-500/50'
  ]

  const days = getDaysInMonth(currentDate)
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-green-400 text-2xl" />
          <div>
            <h3 className="text-xl font-bold text-white">학습 캘린더</h3>
            <p className="text-white/60 text-sm">학습 활동과 알림을 한눈에 확인</p>
          </div>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <motion.button
            onClick={goToPreviousMonth}
            className="p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ←
          </motion.button>
          
          <h4 className="text-xl font-bold text-white">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h4>
          
          <motion.button
            onClick={goToNextMonth}
            className="p-2 text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            →
          </motion.button>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-white/60 font-medium text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateString = getDateString(day)
            const intensity = day ? getIntensity(dateString) : 0
            const isToday = day && 
              new Date().toISOString().split('T')[0] === dateString
            
            return (
              <motion.div
                key={index}
                className={`
                  relative h-12 border-r border-b border-white/5 cursor-pointer
                  ${day ? 'hover:bg-white/10' : ''}
                  ${isToday ? 'bg-blue-500/20' : ''}
                  ${day ? intensityColors[intensity] : ''}
                `}
                onClick={() => {
                  if (day) {
                    setSelectedDate(dateString)
                    onDateClick?.(dateString)
                  }
                }}
                whileHover={day ? { scale: 1.05 } : {}}
              >
                {day && (
                  <>
                    <div className={`
                      absolute top-1 left-1 text-sm font-medium
                      ${isToday ? 'text-blue-300 font-bold' : 'text-white'}
                    `}>
                      {day}
                    </div>
                    
                    {/* 학습 데이터 표시 */}
                    {hasStudyData(dateString) && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    
                    {/* 알림 표시 */}
                    {hasReminder(day) && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                    )}
                    
                    {/* 오늘 표시 */}
                    {isToday && (
                      <div className="absolute inset-x-1 bottom-0 h-1 bg-blue-400 rounded-full"></div>
                    )}
                  </>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 선택된 날짜 상세 정보 */}
      {selectedDate && studyData[selectedDate] && (
        <motion.div
          className="glass rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-bold text-white">
              {new Date(selectedDate).toLocaleDateString('ko-KR')}
            </h5>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/70">학습 시간</span>
              <span className="text-white font-bold">{studyData[selectedDate].duration}분</span>
            </div>
            
            <div>
              <span className="text-white/70">활동</span>
              <div className="mt-1 space-y-1">
                {studyData[selectedDate].activities.map((activity, index) => (
                  <div key={index} className="text-sm text-white bg-white/10 rounded px-2 py-1">
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 범례 */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-white/60">학습 강도:</span>
          <div className="flex gap-1">
            {intensityColors.slice(1).map((color, index) => (
              <div key={index} className={`w-3 h-3 rounded-sm ${color}`} />
            ))}
          </div>
          <span className="text-white/60">높음</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-white/60">학습 완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-white/60">알림 설정</span>
          </div>
        </div>
      </div>
    </div>
  )
} 