import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypeWriter from './TypeWriter'
import type { CommMessage } from '../types'

interface CommsFeedProps {
  messages: CommMessage[]
}

export default function CommsFeed({ messages }: CommsFeedProps) {
  const visible = messages.slice(0, 5)
  const [typedIds, setTypedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (messages.length === 0) {
      setTypedIds(new Set())
    }
  }, [messages.length])

  const latestId = visible[0]?.id
  const isLatestTyping = latestId && !typedIds.has(latestId)

  return (
    <div className="flex flex-col p-4 gap-2 h-full">
      {/* Header with extending line */}
      <div className="panel-header">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: '#00e5ff',
            boxShadow: '0 0 8px rgba(0,229,255,0.6)',
            animation: 'flicker 2s ease-in-out infinite',
          }}
        />
        <span
          className="font-display text-xs font-bold tracking-[0.25em] uppercase flex-shrink-0"
          style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
        >
          COMMS
        </span>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-3 flex-1">
        <AnimatePresence initial={false}>
          {visible.map((msg, i) => {
            const isLatest = i === 0 && isLatestTyping
            const opacity = 1 - i * 0.15

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                className={`border-l-2 pl-3 comm-${msg.type}`}
              >
                <span
                  className="font-display text-[11px] tracking-[0.2em] uppercase block mb-0.5"
                  style={{ color: 'rgba(224,230,240,0.4)' }}
                >
                  {msg.source}
                </span>
                <span
                  className="font-body text-sm leading-snug line-clamp-3 block"
                  style={{ color: `rgba(224,230,240,${0.5 + (1 - i / 5) * 0.35})` }}
                >
                  {isLatest ? (
                    <TypeWriter
                      text={msg.text}
                      speed={15}
                      onComplete={() =>
                        setTypedIds((prev) => new Set([...prev, msg.id]))
                      }
                    />
                  ) : (
                    msg.text
                  )}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
