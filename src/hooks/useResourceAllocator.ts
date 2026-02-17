import { useState, useCallback } from 'react'
import type { ResourceChannel, ResourceAllocation } from '../types'
import {
  DEFAULT_ALLOCATION,
  RESOURCE_CHANNELS,
  TOTAL_BUDGET,
  MIN_ALLOCATION,
  MAX_ALLOCATION,
} from '../types'

export function useResourceAllocator() {
  const [allocation, setAllocation] = useState<ResourceAllocation>({ ...DEFAULT_ALLOCATION })
  const [locked, setLocked] = useState(false)

  const handleSliderChange = useCallback(
    (channel: ResourceChannel, newValue: number) => {
      if (locked) return

      setAllocation((prev) => {
        const clamped = Math.max(MIN_ALLOCATION, Math.min(MAX_ALLOCATION, Math.round(newValue)))
        const oldValue = prev[channel]
        const delta = clamped - oldValue
        if (delta === 0) return prev

        const others = RESOURCE_CHANNELS.filter((c) => c !== channel)
        const next = { ...prev, [channel]: clamped }

        // Distribute -delta across other channels proportionally
        let toDistribute = -delta
        let pool = others.reduce((sum, c) => sum + (prev[c] - MIN_ALLOCATION), 0)

        // If increasing and others have no room above min, clamp
        if (toDistribute < 0 && pool === 0) return prev

        for (let i = 0; i < others.length; i++) {
          const c = others[i]
          if (i === others.length - 1) {
            // Last channel absorbs rounding remainder
            next[c] = Math.max(MIN_ALLOCATION, prev[c] + toDistribute)
          } else {
            const available = prev[c] - MIN_ALLOCATION
            const share =
              pool > 0
                ? Math.round(toDistribute * (available / pool))
                : Math.round(toDistribute / (others.length - i))
            const newVal = Math.max(MIN_ALLOCATION, prev[c] + share)
            const actualChange = newVal - prev[c]
            next[c] = newVal
            toDistribute -= actualChange
            pool -= available
          }
        }

        // Verify total = TOTAL_BUDGET (fix rounding)
        const total = RESOURCE_CHANNELS.reduce((sum, c) => sum + next[c], 0)
        if (total !== TOTAL_BUDGET) {
          // Adjust the last non-min channel
          const diff = TOTAL_BUDGET - total
          for (let i = others.length - 1; i >= 0; i--) {
            const c = others[i]
            const adjusted = next[c] + diff
            if (adjusted >= MIN_ALLOCATION && adjusted <= MAX_ALLOCATION) {
              next[c] = adjusted
              break
            }
          }
        }

        return next
      })
    },
    [locked],
  )

  const getMultiplier = useCallback(
    (channel: ResourceChannel): number => {
      return Math.min(1.5, 0.5 + allocation[channel] / 50)
    },
    [allocation],
  )

  const totalUsed = RESOURCE_CHANNELS.reduce((sum, c) => sum + allocation[c], 0)

  const lock = useCallback(() => setLocked(true), [])
  const unlock = useCallback(() => setLocked(false), [])

  const reset = useCallback(() => {
    setAllocation({ ...DEFAULT_ALLOCATION })
    setLocked(false)
  }, [])

  return { allocation, handleSliderChange, getMultiplier, totalUsed, locked, lock, unlock, reset }
}
