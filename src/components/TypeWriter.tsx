import { useEffect, useRef, useState } from 'react'

interface TypeWriterProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
  startDelay?: number
}

export default function TypeWriter({
  text,
  speed = 30,
  className = '',
  onComplete,
  startDelay = 0,
}: TypeWriterProps) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayed('')
    setStarted(false)

    const delayTimer = setTimeout(() => {
      setStarted(true)
    }, startDelay)

    return () => clearTimeout(delayTimer)
  }, [text, startDelay])

  useEffect(() => {
    if (!started) return

    let index = 0
    setDisplayed('')

    const interval = setInterval(() => {
      index++
      setDisplayed(text.slice(0, index))
      if (index >= text.length) {
        clearInterval(interval)
        onCompleteRef.current?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, started])

  return (
    <span className={className}>
      {displayed}
      {started && displayed.length < text.length && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom"
          style={{
            background: '#00e5ff',
            animation: 'flicker 0.8s step-end infinite',
          }}
        />
      )}
    </span>
  )
}
