import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(
  target: number,
  duration: number = 1200,
): number {
  const [current, setCurrent] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    const diff = target - from
    if (diff === 0) return

    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = Math.round(from + diff * eased)
      setCurrent(value)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        prevRef.current = target
      }
    }

    requestAnimationFrame(step)
  }, [target, duration])

  return current
}
