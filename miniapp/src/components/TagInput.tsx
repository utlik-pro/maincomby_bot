import React, { useState, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  maxTags?: number
  maxTagLength?: number
  className?: string
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Добавить...',
  label,
  maxTags = 10,
  maxTagLength = 30,
  className = '',
}) => {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sanitizeTag = (tag: string): string => {
    // Remove potentially dangerous characters and trim
    return tag
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove special chars
      .trim()
      .slice(0, maxTagLength)
  }

  const addTag = (tagValue: string) => {
    const trimmed = sanitizeTag(tagValue)
    setError(null)

    if (!trimmed) {
      return
    }

    if (trimmed.length > maxTagLength) {
      setError(`Максимум ${maxTagLength} символов`)
      return
    }

    if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setError('Такой тег уже есть')
      return
    }

    if (tags.length >= maxTags) {
      setError(`Максимум ${maxTags} тегов`)
      return
    }

    onTagsChange([...tags, trimmed])
    setInput('')
  }

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
    setError(null)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag when backspace is pressed with empty input
      removeTag(tags.length - 1)
    }
  }

  const handleAddClick = () => {
    addTag(input)
    inputRef.current?.focus()
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}

      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence mode="popLayout">
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent/20 text-accent rounded-xl text-sm font-medium"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="p-0.5 rounded-full hover:bg-accent/30 transition-colors"
                aria-label={`Удалить ${tag}`}
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input field */}
      {tags.length < maxTags && (
        <div className="relative flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxTagLength}
            className="flex-1 bg-bg-card text-white px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-accent placeholder:text-gray-500 text-sm"
            aria-label={label || 'Добавить тег'}
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            disabled={!input.trim()}
            className="px-3 py-2.5 bg-accent text-bg rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Добавить тег"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      )}

      {/* Counter and error */}
      <div className="flex justify-between items-center mt-1.5">
        {error ? (
          <p className="text-danger text-xs">{error}</p>
        ) : (
          <span />
        )}
        <span className="text-xs text-gray-500">
          {tags.length}/{maxTags}
        </span>
      </div>
    </div>
  )
}

export default TagInput
