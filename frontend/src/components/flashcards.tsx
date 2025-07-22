"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Flashcard } from '@/types'
import { 
  FaArrowLeft, FaArrowRight, FaRedo, FaShuffle, FaCheck, FaTimes, 
  FaHeart, FaStar, FaLightbulb, FaBookOpen, FaEye, FaEyeSlash 
} from 'react-icons/fa'

interface FlashcardStudyProps {
  flashcards: Flashcard[]
  onComplete?: (results: StudyResults) => void
  onUpdateCard?: (cardId: string, isCorrect: boolean) => void
  showProgress?: boolean
  autoAdvance?: boolean
  studyMode?: 'normal' | 'review' | 'difficult'
}

interface StudyResults {
  totalCards: number
  correctCards: number
  timeSpent: number
  cardsStudied: Flashcard[]
}

export function FlashcardStudy({ 
  flashcards,
  onComplete,
  onUpdateCard,
  showProgress = true,
  autoAdvance = false,
  studyMode = 'normal'
}: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyResults, setStudyResults] = useState<StudyResults>({
    totalCards: flashcards.length,
    correctCards: 0,
    timeSpent: 0,
    cardsStudied: []
  })
  const [startTime] = useState(Date.now())
  const [shuffledCards, setShuffledCards] = useState(flashcards)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  const currentCard = shuffledCards[currentIndex]
  const isLastCard = currentIndex === shuffledCards.length - 1

  // 카드 셞플
  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowAnswer(false)
  }

  // 다음 카드로 이동
  const nextCard = () => {
    if (isLastCard) {
      // 학습 완료
      const results: StudyResults = {
        ...studyResults,
        timeSpent: Math.floor((Date.now() - startTime) / 1000)
      }
      onComplete?.(results)
    } else {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  // 이전 카드로 이동
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  // 카드 뒤집기
  const flipCard = () => {
    setIsFlipped(!isFlipped)
    if (!showAnswer) {
      setShowAnswer(true)
    }
  }

  // 정답/오답 처리
  const handleAnswer = (isCorrect: boolean) => {
    if (currentCard) {
      onUpdateCard?.(currentCard.id, isCorrect)
      setStudyResults(prev => ({
        ...prev,
        correctCards: prev.correctCards + (isCorrect ? 1 : 0),
        cardsStudied: [...prev.cardsStudied, currentCard]
      }))
    }
    
    if (autoAdvance) {
      setTimeout(nextCard, 1000)
    }
  }

  // 드래그 핸들러
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold) {
      setDragDirection('right')
      handleAnswer(true)
    } else if (info.offset.x < -threshold) {
      setDragDirection('left')
      handleAnswer(false)
    }
    
    setTimeout(() => setDragDirection(null), 500)
  }

  // 키보드 단축키
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ': // 스페이스바: 카드 뒤집기
          e.preventDefault()
          flipCard()
          break
        case 'ArrowLeft': // 왼쪽 화살표: 이전 카드
          prevCard()
          break
        case 'ArrowRight': // 오른쪽 화살표: 다음 카드
          nextCard()
          break
        case '1': // 1: 어려움
          showAnswer && handleAnswer(false)
          break
        case '2': // 2: 쉬움
          showAnswer && handleAnswer(true)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showAnswer, currentIndex])

  if (!currentCard) {
    return (
      <div className="text-center py-20">
        <FaBookOpen className="text-6xl text-white/30 mx-auto mb-4" />
        <p className="text-white/60 text-lg">플래시카드가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 진행률 및 컨트롤 */}
      {showProgress && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold">
              {currentIndex + 1} / {shuffledCards.length}
            </span>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          <button
            onClick={shuffleCards}
            className="glass p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FaShuffle className="text-white" />
          </button>
        </div>
      )}

      {/* 메인 카드 */}
      <div className="relative h-96 perspective-1000">
        <motion.div
          className="relative w-full h-full cursor-pointer preserve-3d"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          onClick={flipCard}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          whileDrag={{ scale: 1.05 }}
        >
          {/* 앞면 (질문) */}
          <div className={`
            absolute inset-0 backface-hidden rounded-2xl
            glass border-2 border-white/20 p-8
            flex flex-col justify-center items-center text-center
            ${dragDirection === 'right' ? 'border-green-400/50 bg-green-500/10' : ''}
            ${dragDirection === 'left' ? 'border-red-400/50 bg-red-500/10' : ''}
          `}>
            <div className="mb-4">
              <div className="inline-block px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
                {currentCard.category}
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed">
              {currentCard.front}
            </h2>
            
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FaEye className="text-blue-400" />
              <span>카드를 탭하여 답 확인</span>
            </div>

            {/* 난이도 표시 */}
            <div className="absolute top-4 right-4">
              <div className={`
                px-2 py-1 rounded-lg text-xs font-bold
                ${currentCard.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : ''}
                ${currentCard.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                ${currentCard.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : ''}
              `}>
                {currentCard.difficulty === 'easy' ? '쉬움' : 
                 currentCard.difficulty === 'medium' ? '보통' : '어려움'}
              </div>
            </div>
          </div>

          {/* 뒷면 (답) */}
          <div className={`
            absolute inset-0 backface-hidden rounded-2xl rotate-y-180
            glass border-2 border-white/20 p-8
            flex flex-col justify-center items-center text-center
            ${dragDirection === 'right' ? 'border-green-400/50 bg-green-500/10' : ''}
            ${dragDirection === 'left' ? 'border-red-400/50 bg-red-500/10' : ''}
          `}>
            <div className="mb-4">
              <FaLightbulb className="text-yellow-400 text-2xl mx-auto mb-4" />
            </div>
            
            <p className="text-xl md:text-2xl text-white mb-6 leading-relaxed">
              {currentCard.back}
            </p>

            {/* 태그 */}
            {currentCard.tags && currentCard.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {currentCard.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-white/60 text-sm">
              <FaEyeSlash className="text-purple-400" />
              <span>좌우로 드래그하여 난이도 평가</span>
            </div>
          </div>
        </motion.div>

        {/* 드래그 힌트 */}
        <AnimatePresence>
          {showAnswer && !autoAdvance && (
            <motion.div
              className="absolute -bottom-16 left-0 right-0 flex justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.div
                className="flex items-center gap-2 text-red-400"
                animate={{ x: dragDirection === 'left' ? -10 : 0 }}
              >
                <FaTimes />
                <span className="text-sm">어려움</span>
              </motion.div>
              
              <motion.div
                className="flex items-center gap-2 text-green-400"
                animate={{ x: dragDirection === 'right' ? 10 : 0 }}
              >
                <span className="text-sm">쉬움</span>
                <FaCheck />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 답변 버튼 (모바일용) */}
      {showAnswer && !autoAdvance && (
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            className="flex-1 max-w-xs glass rounded-xl p-4 text-red-400 border border-red-400/30 hover:bg-red-500/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(false)}
          >
            <FaTimes className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-bold">어려움</div>
            <div className="text-xs text-white/60">다시 학습 필요</div>
          </motion.button>
          
          <motion.button
            className="flex-1 max-w-xs glass rounded-xl p-4 text-green-400 border border-green-400/30 hover:bg-green-500/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(true)}
          >
            <FaCheck className="mx-auto mb-2 text-xl" />
            <div className="text-sm font-bold">쉬움</div>
            <div className="text-xs text-white/60">잘 기억함</div>
          </motion.button>
        </motion.div>
      )}

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <motion.button
          className="glass p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
          onClick={prevCard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft className="text-white" />
        </motion.button>

        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm">
            정답률: {studyResults.cardsStudied.length > 0 
              ? Math.round((studyResults.correctCards / studyResults.cardsStudied.length) * 100)
              : 0}%
          </span>
        </div>

        <motion.button
          className="glass p-3 rounded-lg"
          onClick={nextCard}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowRight className="text-white" />
        </motion.button>
      </div>

      {/* 키보드 단축키 안내 */}
      <div className="text-center text-white/40 text-xs space-y-1">
        <div>키보드 단축키: 스페이스(뒤집기) | ←→(이동) | 1(어려움) | 2(쉬움)</div>
      </div>
    </div>
  )
}

// 플래시카드 생성/편집 컴포넌트
interface FlashcardEditorProps {
  card?: Flashcard
  onSave: (card: Omit<Flashcard, 'id'>) => void
  onCancel: () => void
}

export function FlashcardEditor({ card, onSave, onCancel }: FlashcardEditorProps) {
  const [formData, setFormData] = useState({
    front: card?.front || '',
    back: card?.back || '',
    category: card?.category || '',
    difficulty: card?.difficulty || 'medium' as const,
    tags: card?.tags || []
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.front.trim() && formData.back.trim()) {
      onSave({
        ...formData,
        correctCount: card?.correctCount || 0,
        totalCount: card?.totalCount || 0
      })
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-xl font-bold text-white mb-6">
        {card ? '플래시카드 편집' : '새 플래시카드 만들기'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 앞면 (질문) */}
        <div>
          <label className="block text-white font-medium mb-2">
            앞면 (질문)
          </label>
          <textarea
            value={formData.front}
            onChange={(e) => setFormData(prev => ({ ...prev, front: e.target.value }))}
            className="w-full h-24 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="질문을 입력하세요..."
            required
          />
        </div>

        {/* 뒷면 (답) */}
        <div>
          <label className="block text-white font-medium mb-2">
            뒷면 (답)
          </label>
          <textarea
            value={formData.back}
            onChange={(e) => setFormData(prev => ({ ...prev, back: e.target.value }))}
            className="w-full h-24 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="답을 입력하세요..."
            required
          />
        </div>

        {/* 카테고리 및 난이도 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">
              카테고리
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="예: AI 기초, 머신러닝"
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              난이도
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
          </div>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-white font-medium mb-2">
            태그
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="태그 입력 후 Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              추가
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-white/70 hover:text-white transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
          >
            {card ? '수정' : '생성'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

// CSS for 3D effects
const style = `
  .preserve-3d {
    transform-style: preserve-3d;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  .perspective-1000 {
    perspective: 1000px;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = style
  document.head.appendChild(styleSheet)
} 