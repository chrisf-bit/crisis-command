import { useEffect, useState } from 'react'

interface GlitchTextProps {
  text: string
  className?: string
  active?: boolean
}

export default function GlitchText({
  text,
  className = '',
  active = true,
}: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false)

  useEffect(() => {
    if (!active) return

    // Trigger glitch periodically
    const interval = setInterval(() => {
      setGlitching(true)
      setTimeout(() => setGlitching(false), 150)
    }, 3000 + Math.random() * 2000)

    // Initial glitch
    setGlitching(true)
    setTimeout(() => setGlitching(false), 300)

    return () => clearInterval(interval)
  }, [active])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {glitching && (
        <>
          <span
            className="absolute inset-0"
            style={{
              color: '#00e5ff',
              animation: 'glitch-1 0.15s linear',
              textShadow: '2px 0 #00e5ff',
            }}
            aria-hidden
          >
            {text}
          </span>
          <span
            className="absolute inset-0"
            style={{
              color: '#ff006e',
              animation: 'glitch-2 0.15s linear',
              textShadow: '-2px 0 #ff006e',
            }}
            aria-hidden
          >
            {text}
          </span>
        </>
      )}
    </span>
  )
}
