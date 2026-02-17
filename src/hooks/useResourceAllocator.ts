import { useState, useCallback } from 'react'
import type { ResourceChannel, ResourceAllocation } from '../types'
import { DEFAULT_ALLOCATION, RESOURCE_CHANNELS, TOTAL_BUDGET } from '../types'

export function useResourceAllocator() {
  const [allocation, setAllocation] = useState<ResourceAllocation>({ ...DEFAULT_ALLOCATION })
  const [locked, setLocked] = useState(false)

  const handleSliderChange = useCallback(
    (channel: ResourceChannel, newValue: number) => {
      if (locked) return

      setAllocation((prev) => {
        const clamped = Math.max(0, Math.min(100, Math.round(newValue)))
        const othersTotal = RESOURCE_CHANNELS
          .filter((c) => c !== channel)
          .reduce((sum, c) => sum + prev[c], 0)

        // Can't exceed total budget
        const maxAllowed = TOTAL_BUDGET - othersTotal
        const final = Math.min(clamped, maxAllowed)

        if (final === prev[channel]) return prev
        return { ...prev, [channel]: final }
      })
    },
    [locked],
  )

  const getMultiplier = useCallback(
    (channel: ResourceChannel): number => {
      return Math.min(1.5, 0.5 + allocation[channel] / 100)
    },
    [allocation],
  )

  const totalUsed = RESOURCE_CHANNELS.reduce((sum, c) => sum + allocation[c], 0)
  const budgetRemaining = TOTAL_BUDGET - totalUsed

  const lock = useCallback(() => setLocked(true), [])
  const unlock = useCallback(() => setLocked(false), [])

  const reset = useCallback(() => {
    setAllocation({ ...DEFAULT_ALLOCATION })
    setLocked(false)
  }, [])

  return { allocation, handleSliderChange, getMultiplier, totalUsed, budgetRemaining, locked, lock, unlock, reset }
}
