import { useState, useCallback } from 'react'
import type { CommMessage, CommMessageType } from '../types'

let msgCounter = 0

export function useCommsFeed() {
  const [messages, setMessages] = useState<CommMessage[]>([])

  const addMessage = useCallback(
    (source: string, text: string, type: CommMessageType) => {
      msgCounter++
      setMessages((prev) => [
        {
          id: `msg-${msgCounter}`,
          source,
          text,
          type,
        },
        ...prev,
      ])
    },
    [],
  )

  const clear = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, addMessage, clear }
}
