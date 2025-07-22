"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HeatmapData, DailyStats } from '@/types'
import { FaCalendarAlt, FaFire, FaChartLine, FaInfoCircle } from 'react-icons/fa'

interface LearningHeatmapProps {
  data: HeatmapData[]
  year?: number
  onDateClick?: (date: string, data: HeatmapData) => void
  className?: string
}

export function LearningHeatmap({ 
  data, 
  year = new Date().getFullYear(),
  onDateClick,
  className = ''
}: LearningHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<HeatmapData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null)

  // 연도별 데이터 생성 (365일)
  const yearData = useMemo(() => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    const yearDays: HeatmapData[] = []

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const existingData = data.find(d => d.date === dateStr)
      
      yearDays.push(existingData || {
        date: dateStr,
        value: 0,
        details: { aiInfo: 0, quiz: 0, terms: 0, studyTime: 0 }
      })
    }

    return yearDays
  }, [data, year])

  // 주별로 그룹화
  const weekData = useMemo(() => {
    const weeks: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []
    
    // 첫 주의 빈 날들 채우기
    const firstDay = new Date(year, 0, 1)
    const firstDayOfWeek = firstDay.getDay() // 0: 일요일
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        value: -1, // 빈 셀 표시
        details: { aiInfo: 0, quiz: 0, terms: 0, studyTime: 0 }
      })
    }

    yearData.forEach((day, index) => {
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    // 마지막 주의 빈 날들 채우기
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push({
        date: '',
        value: -1,
        details: { aiInfo: 0, quiz: 0, terms: 0, studyTime: 0 }
      })
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }, [yearData, year])

  // 강도별 색상 및 클래스
  const getIntensityStyle = (value: number) => {
    if (value === -1) return 'bg-transparent' // 빈 셀
    if (value === 0) return 'bg-white/5 border-white/10'
    if (value === 1) return 'bg-green-200/20 border-green-400/30'
    if (value === 2) return 'bg-green-300/30 border-green-400/40'
    if (value === 3) return 'bg-green-400/40 border-green-400/50'
    if (value === 4) return 'bg-green-500/50 border-green-400/60'
    return 'bg-green-600/60 border-green-400/70'
  }

  const getIntensityGlow = (value: number) => {
    if (value <= 1) return ''
    if (value === 2) return 'shadow-sm shadow-green-400/20'
    if (value === 3) return 'shadow-md shadow-green-400/30'
    if (value === 4) return 'shadow-lg shadow-green-400/40'
    return 'shadow-xl shadow-green-500/50'
  }

  // 통계 계산
  const stats = useMemo(() => {
    const totalDays = yearData.filter(d => d.value > 0).length
    const totalStudyTime = yearData.reduce((sum, d) => sum + d.details.studyTime, 0)
    const currentStreak = calculateCurrentStreak(yearData)
    const longestStreak = calculateLongestStreak(yearData)
    const averageIntensity = totalDays > 0 ? yearData.reduce((sum, d) => sum + d.value, 0) / totalDays : 0

    return {
      totalDays,
      totalStudyTime,
      currentStreak,
      longestStreak,
      averageIntensity: Math.round(averageIntensity * 10) / 10
    }
  }, [yearData])

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-blue-400 text-xl" />
          <h3 className="text-xl font-bold text-white">{year}년 학습 활동</h3>
        </div>
        
        {/* 범례 */}
        <div className="flex items-center gap-2 text-sm text-white/60">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm border ${getIntensityStyle(level)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* 히트맵 */}
      <div className="glass rounded-2xl p-6 overflow-x-auto">
        <div className="min-w-[800px] space-y-2">
          {/* 월 레이블 */}
          <div className="flex gap-1 mb-2 ml-8">
            {months.map((month, index) => (
              <div key={month} className="flex-1 text-center">
                <span className="text-xs text-white/60 font-medium">{month}</span>
              </div>
            ))}
          </div>

          {/* 요일 레이블과 히트맵 그리드 */}
          <div className="flex gap-1">
            {/* 요일 레이블 */}
            <div className="flex flex-col gap-1 w-6">
              {weekdays.map((day, index) => (
                <div key={day} className="h-3 flex items-center justify-center">
                  {index % 2 === 1 && (
                    <span className="text-xs text-white/60 font-medium">{day}</span>
                  )}
                </div>
              ))}
            </div>

            {/* 히트맵 그리드 */}
            <div className="flex-1 grid grid-cols-53 gap-1">
              {weekData.map((week, weekIndex) =>
                week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      w-3 h-3 rounded-sm border cursor-pointer relative
                      ${getIntensityStyle(day.value)} ${getIntensityGlow(day.value)}
                      ${day.value >= 0 ? 'hover:scale-125 hover:z-10' : 'cursor-default'}
                      transition-all duration-200
                    `}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: (weekIndex * 7 + dayIndex) * 0.001,
                      duration: 0.2 
                    }}
                    whileHover={day.value >= 0 ? { scale: 1.3, zIndex: 10 } : {}}
                    onHoverStart={() => day.value >= 0 && setHoveredCell(day)}
                    onHoverEnd={() => setHoveredCell(null)}
                    onClick={() => {
                      if (day.value >= 0) {
                        setSelectedCell(day)
                        onDateClick?.(day.date, day)
                      }
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 툴팁 */}
        {hoveredCell && hoveredCell.value >= 0 && (
          <motion.div
            className="absolute z-50 glass rounded-lg p-3 border border-white/20 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="text-white text-sm font-bold mb-1">
              {new Date(hoveredCell.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </div>
            <div className="space-y-1 text-xs text-white/70">
              <div>🧠 AI 정보: {hoveredCell.details.aiInfo}개</div>
              <div>🎯 퀴즈: {hoveredCell.details.quiz}문제</div>
              <div>📚 용어: {hoveredCell.details.terms}개</div>
              <div>⏱️ 학습 시간: {hoveredCell.details.studyTime}분</div>
            </div>
            {hoveredCell.value === 0 && (
              <div className="text-white/50 text-xs mt-1">학습 활동 없음</div>
            )}
          </motion.div>
        )}
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="glass rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <FaCalendarAlt className="text-blue-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.totalDays}</div>
          <div className="text-sm text-white/60">총 학습일</div>
        </motion.div>

        <motion.div
          className="glass rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <FaFire className="text-orange-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.currentStreak}</div>
          <div className="text-sm text-white/60">현재 연속</div>
        </motion.div>

        <motion.div
          className="glass rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <FaChartLine className="text-green-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.longestStreak}</div>
          <div className="text-sm text-white/60">최고 연속</div>
        </motion.div>

        <motion.div
          className="glass rounded-xl p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <FaInfoCircle className="text-purple-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{stats.averageIntensity}</div>
          <div className="text-sm text-white/60">평균 강도</div>
        </motion.div>
      </div>

      {/* 상세 정보 (선택된 날짜) */}
      {selectedCell && selectedCell.value >= 0 && (
        <motion.div
          className="glass rounded-2xl p-6 border border-blue-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">
              {new Date(selectedCell.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </h4>
            <button
              className="text-white/60 hover:text-white transition-colors"
              onClick={() => setSelectedCell(null)}
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {selectedCell.details.aiInfo}
              </div>
              <div className="text-sm text-white/60">AI 정보 학습</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {selectedCell.details.quiz}
              </div>
              <div className="text-sm text-white/60">퀴즈 문제</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {selectedCell.details.terms}
              </div>
              <div className="text-sm text-white/60">용어 학습</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {selectedCell.details.studyTime}
              </div>
              <div className="text-sm text-white/60">학습 시간(분)</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// 현재 연속 학습일 계산
function calculateCurrentStreak(data: HeatmapData[]): number {
  const today = new Date().toISOString().split('T')[0]
  const todayIndex = data.findIndex(d => d.date === today)
  
  if (todayIndex === -1) return 0
  
  let streak = 0
  for (let i = todayIndex; i >= 0; i--) {
    if (data[i].value > 0) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// 최장 연속 학습일 계산
function calculateLongestStreak(data: HeatmapData[]): number {
  let longestStreak = 0
  let currentStreak = 0
  
  data.forEach(day => {
    if (day.value > 0) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  return longestStreak
}

// 학습 강도 계산 (0-4)
export function calculateIntensity(details: { aiInfo: number, quiz: number, terms: number, studyTime: number }): number {
  const score = details.aiInfo * 2 + details.quiz * 0.1 + details.terms * 0.5 + details.studyTime * 0.1
  
  if (score === 0) return 0
  if (score <= 2) return 1
  if (score <= 5) return 2
  if (score <= 10) return 3
  return 4
}

// 모바일용 간소화된 히트맵
interface MobileHeatmapProps {
  data: HeatmapData[]
  months?: number // 최근 N개월 표시
}

export function MobileHeatmap({ data, months = 6 }: MobileHeatmapProps) {
  const recentData = useMemo(() => {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    return data.filter(d => new Date(d.date) >= startDate)
  }, [data, months])

  const weekData = useMemo(() => {
    const weeks: HeatmapData[][] = []
    let currentWeek: HeatmapData[] = []
    
    recentData.forEach((day) => {
      const dayOfWeek = new Date(day.date).getDay()
      
      // 새로운 주 시작
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
      
      currentWeek.push(day)
    })
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }
    
    return weeks.slice(-20) // 최근 20주만 표시
  }, [recentData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-white">최근 학습 활동</h4>
        <div className="flex items-center gap-1 text-xs text-white/60">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2 h-2 rounded-sm ${getIntensityStyle(level)}`}
            />
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-20 gap-1">
          {weekData.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  w-2 h-2 rounded-sm
                  ${getIntensityStyle(day.value)}
                  ${day.value > 0 ? getIntensityGlow(day.value) : ''}
                `}
                title={`${day.date}: ${day.value > 0 ? '학습함' : '학습 안함'}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function getIntensityStyle(value: number): string {
  if (value === 0) return 'bg-white/5'
  if (value === 1) return 'bg-green-200/30'
  if (value === 2) return 'bg-green-300/40'
  if (value === 3) return 'bg-green-400/50'
  if (value === 4) return 'bg-green-500/60'
  return 'bg-green-600/70'
}

function getIntensityGlow(value: number): string {
  if (value <= 1) return ''
  if (value === 2) return 'shadow-sm shadow-green-400/20'
  if (value === 3) return 'shadow-md shadow-green-400/30'
  return 'shadow-lg shadow-green-400/40'
} 