import { useState, useCallback } from 'react'
import type { ResourceChannel, ResourceAllocation } from '../types'
import { DEFAULT_ALLOCATION } from '../types'

export function useResourceAllocator() {
  const [allocation, setAllocation] = useState<ResourceAllocation>({ ...DEFAULT_ALLOCATION })
  const [locked, setLocked] = useState(false)

  const handleSliderChange = useCallback(
    (channel: ResourceChannel, newValue: number) => {
      if (locked) return
      const clamped = Math.max(0, Math.min(50, newValue))
      setAllocation((prev) => ({ ...prev, [channel]: clamped }))
    },
    [locked],
  )

  const getMultiplier = useCallback(
    (channel: ResourceChannel): number => {
      return Math.min(1.5, 0.5 + allocation[channel] / 50)
    },
    [allocation],
  )

  const lock = useCallback(() => setLocked(true), [])
  const unlock = useCallback(() => setLocked(false), [])

  const reset = useCallback(() => {
    setAllocation({ ...DEFAULT_ALLOCATION })
    setLocked(false)
  }, [])

  return { allocation, handleSliderChange, getMultiplier, locked, lock, unlock, reset }
}
