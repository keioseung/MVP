"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Puzzle } from '@/types'
import { 
  FaPuzzlePiece, FaClock, FaTrophy, FaRocket, FaStar,
  FaCheckCircle, FaTimesCircle, FaRandom, FaLightbulb
} from 'react-icons/fa'

// 워드 서치 퍼즐 컴포넌트
interface WordSearchProps {
  words: string[]
  onComplete: (time: number, score: number) => void
  difficulty: 'easy' | 'medium' | 'hard'
}

export function WordSearchPuzzle({ words, onComplete, difficulty }: WordSearchProps) {
  const gridSize = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 15
  const [grid, setGrid] = useState<string[][]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)

  // 그리드 생성
  useEffect(() => {
    generateGrid()
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [words, gridSize])

  const generateGrid = () => {
    const newGrid: string[][] = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill('')
    )

    // 단어 배치
    const directions = [
      [0, 1], [1, 0], [1, 1], [-1, 1], // 가로, 세로, 대각선
      [0, -1], [-1, 0], [-1, -1], [1, -1]
    ]

    const placedWords: string[] = []

    words.forEach(word => {
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < 50) {
        const direction = directions[Math.floor(Math.random() * directions.length)]
        const startRow = Math.floor(Math.random() * gridSize)
        const startCol = Math.floor(Math.random() * gridSize)
        
        if (canPlaceWord(newGrid, word, startRow, startCol, direction)) {
          placeWord(newGrid, word, startRow, startCol, direction)
          placedWords.push(word)
          placed = true
        }
        attempts++
      }
    })

    // 빈 칸에 랜덤 문자 채우기
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        }
      }
    }

    setGrid(newGrid)
  }

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: number[]) => {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + direction[0] * i
      const newCol = col + direction[1] * i
      
      if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize) {
        return false
      }
      
      if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
        return false
      }
    }
    return true
  }

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: number[]) => {
    for (let i = 0; i < word.length; i++) {
      const newRow = row + direction[0] * i
      const newCol = col + direction[1] * i
      grid[newRow][newCol] = word[i]
    }
  }

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells([{row, col}])
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting) {
      setSelectedCells(prev => {
        if (prev.length === 0) return [{row, col}]
        
        const start = prev[0]
        const cells: {row: number, col: number}[] = []
        
        // 직선 경로 계산
        const deltaRow = row - start.row
        const deltaCol = col - start.col
        const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
        
        if (steps === 0) return [{row, col}]
        
        const stepRow = deltaRow / steps
        const stepCol = deltaCol / steps
        
        for (let i = 0; i <= steps; i++) {
          cells.push({
            row: Math.round(start.row + stepRow * i),
            col: Math.round(start.col + stepCol * i)
          })
        }
        
        return cells
      })
    }
  }

  const handleCellMouseUp = () => {
    if (selectedCells.length > 1) {
      const selectedWord = selectedCells.map(cell => 
        grid[cell.row]?.[cell.col] || ''
      ).join('')
      
      const reverseWord = selectedWord.split('').reverse().join('')
      
      if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
        setFoundWords(prev => [...prev, selectedWord])
      } else if (words.includes(reverseWord) && !foundWords.includes(reverseWord)) {
        setFoundWords(prev => [...prev, reverseWord])
      }
    }
    
    setIsSelecting(false)
    setSelectedCells([])
  }

  // 게임 완료 체크
  useEffect(() => {
    if (foundWords.length === words.length) {
      const score = Math.max(1000 - timeElapsed * 10, 100)
      onComplete(timeElapsed, score)
    }
  }, [foundWords, words.length, timeElapsed, onComplete])

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    // 찾은 단어에 포함된 셀인지 확인하는 로직
    return false // 간단화를 위해 false 반환
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FaClock className="text-blue-400" />
          <span className="text-white font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="text-white/70">
          {foundWords.length} / {words.length} 단어 발견
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 워드 서치 그리드 */}
        <div className="lg:col-span-2">
          <div 
            className="inline-grid gap-1 p-4 glass rounded-2xl select-none"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            onMouseLeave={() => {
              setIsSelecting(false)
              setSelectedCells([])
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    w-6 h-6 md:w-8 md:h-8 flex items-center justify-center
                    rounded-md font-bold text-sm cursor-pointer
                    transition-all duration-200
                    ${isCellSelected(rowIndex, colIndex) 
                      ? 'bg-blue-500 text-white scale-110' 
                      : isCellInFoundWord(rowIndex, colIndex)
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                  onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleCellMouseUp}
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIndex * gridSize + colIndex) * 0.01 }}
                >
                  {cell}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* 단어 목록 */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FaPuzzlePiece className="text-purple-400" />
            찾을 단어들
          </h3>
          <div className="space-y-2">
            {words.map((word, index) => (
              <motion.div
                key={word}
                className={`
                  p-3 rounded-lg border transition-all
                  ${foundWords.includes(word)
                    ? 'bg-green-500/20 border-green-400/50 text-green-300'
                    : 'bg-white/10 border-white/20 text-white'
                  }
                `}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{word}</span>
                  {foundWords.includes(word) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <FaCheckCircle className="text-green-400" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 매칭 게임 컴포넌트
interface MatchingGameProps {
  pairs: { term: string, definition: string }[]
  onComplete: (time: number, score: number) => void
  difficulty: 'easy' | 'medium' | 'hard'
}

export function MatchingGame({ pairs, onComplete, difficulty }: MatchingGameProps) {
  const [cards, setCards] = useState<{id: string, content: string, type: 'term' | 'definition', pairId: string, isFlipped: boolean, isMatched: boolean}[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [matches, setMatches] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)

  // 카드 초기화
  useEffect(() => {
    const newCards = pairs.flatMap((pair, index) => [
      {
        id: `term-${index}`,
        content: pair.term,
        type: 'term' as const,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false
      },
      {
        id: `def-${index}`,
        content: pair.definition,
        type: 'definition' as const,
        pairId: `pair-${index}`,
        isFlipped: false,
        isMatched: false
      }
    ])

    // 카드 섞기
    const shuffledCards = newCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)

    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [pairs])

  // 카드 클릭 처리
  const handleCardClick = (cardId: string) => {
    if (selectedCards.length >= 2) return
    if (selectedCards.includes(cardId)) return
    if (cards.find(c => c.id === cardId)?.isMatched) return

    const newSelectedCards = [...selectedCards, cardId]
    setSelectedCards(newSelectedCards)

    // 카드 뒤집기
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ))

    if (newSelectedCards.length === 2) {
      setAttempts(prev => prev + 1)
      
      setTimeout(() => {
        checkMatch(newSelectedCards)
      }, 1000)
    }
  }

  const checkMatch = (selectedCardIds: string[]) => {
    const [card1, card2] = selectedCardIds.map(id => 
      cards.find(card => card.id === id)!
    )

    const isMatch = card1.pairId === card2.pairId

    if (isMatch) {
      // 매치 성공
      setCards(prev => prev.map(card => 
        selectedCardIds.includes(card.id) 
          ? { ...card, isMatched: true }
          : card
      ))
      setMatches(prev => [...prev, card1.pairId])
    } else {
      // 매치 실패 - 카드 뒤집기
      setCards(prev => prev.map(card => 
        selectedCardIds.includes(card.id) 
          ? { ...card, isFlipped: false }
          : card
      ))
    }

    setSelectedCards([])
  }

  // 게임 완료 체크
  useEffect(() => {
    if (matches.length === pairs.length) {
      const accuracy = pairs.length / attempts
      const timeBonus = Math.max(0, 300 - timeElapsed)
      const score = Math.round(accuracy * 1000 + timeBonus)
      onComplete(timeElapsed, score)
    }
  }, [matches.length, pairs.length, attempts, timeElapsed, onComplete])

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <FaClock className="text-blue-400" />
            <span className="text-white font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTrophy className="text-yellow-400" />
            <span className="text-white">{matches.length} / {pairs.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/70">시도: {attempts}</span>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`
              relative h-24 md:h-32 cursor-pointer rounded-xl
              preserve-3d transition-all duration-500
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
            `}
            onClick={() => handleCardClick(card.id)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* 앞면 (뒷면) */}
            <div className={`
              absolute inset-0 backface-hidden rounded-xl
              glass border-2 border-white/20 p-3
              flex items-center justify-center
              ${card.type === 'term' ? 'bg-blue-500/10' : 'bg-purple-500/10'}
            `}>
              <div className="text-center">
                <div className={`
                  w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center
                  ${card.type === 'term' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-purple-500 text-white'
                  }
                `}>
                  {card.type === 'term' ? 'T' : 'D'}
                </div>
                <div className="text-xs text-white/60">
                  {card.type === 'term' ? '용어' : '정의'}
                </div>
              </div>
            </div>

            {/* 뒷면 (내용) */}
            <div className={`
              absolute inset-0 backface-hidden rounded-xl rotate-y-180
              border-2 p-3 flex items-center justify-center text-center
              ${card.isMatched 
                ? 'bg-green-500/20 border-green-400/50' 
                : selectedCards.includes(card.id)
                ? 'bg-yellow-500/20 border-yellow-400/50'
                : card.type === 'term'
                ? 'bg-blue-500/20 border-blue-400/50'
                : 'bg-purple-500/20 border-purple-400/50'
              }
            `}>
              <p className={`
                text-white text-xs md:text-sm font-medium leading-tight
                ${card.content.length > 50 ? 'text-xs' : ''}
              `}>
                {card.content}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 진행률 표시 */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">진행률</span>
          <span className="text-white">{Math.round((matches.length / pairs.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(matches.length / pairs.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

// 퍼즐 완료 결과 화면
interface PuzzleResultProps {
  type: 'word_search' | 'matching'
  score: number
  time: number
  onRestart: () => void
  onNext?: () => void
}

export function PuzzleResult({ type, score, time, onRestart, onNext }: PuzzleResultProps) {
  const getGrade = (score: number) => {
    if (score >= 900) return { grade: 'S', color: 'text-yellow-400', message: '완벽해요!' }
    if (score >= 800) return { grade: 'A', color: 'text-green-400', message: '훌륭해요!' }
    if (score >= 700) return { grade: 'B', color: 'text-blue-400', message: '잘했어요!' }
    if (score >= 600) return { grade: 'C', color: 'text-purple-400', message: '괜찮아요!' }
    return { grade: 'D', color: 'text-red-400', message: '다시 도전해보세요!' }
  }

  const { grade, color, message } = getGrade(score)

  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 등급 */}
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
      >
        <div className={`text-8xl font-black ${color} relative z-10`}>
          {grade}
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: [-100, 100] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* 메시지 */}
      <motion.h2
        className="text-2xl font-bold text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {message}
      </motion.h2>

      {/* 점수 및 시간 */}
      <motion.div
        className="grid grid-cols-2 gap-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="glass rounded-xl p-4">
          <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{score}</div>
          <div className="text-sm text-white/60">점수</div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <FaClock className="text-blue-400 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-white/60">시간</div>
        </div>
      </motion.div>

      {/* 버튼 */}
      <motion.div
        className="flex gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.button
          className="px-6 py-3 glass rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
          onClick={onRestart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRedo className="inline mr-2" />
          다시 도전
        </motion.button>
        
        {onNext && (
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
            onClick={onNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaRocket className="inline mr-2" />
            다음 단계
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
} 