import { useCallback } from 'react'
import type { Phase } from '../types'

interface StatusBarProps {
  round: number
  totalRounds: number
  roundTitle: string
  countdownMinutes: number
  phase: Phase
}

export default function StatusBar({
  round,
  totalRounds,
  roundTitle,
  countdownMinutes,
  phase,
}: StatusBarProps) {
  const formatCountdown = useCallback((mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
  }, [])

  const timerColor =
    countdownMinutes > 120 ? '#00e676' : countdownMinutes > 60 ? '#ffab00' : '#ff1744'

  return (
    <div className="flex items-center justify-between px-8 h-full">
      {/* Left — title with decorative markers */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-1 h-3" style={{ background: '#00e5ff', boxShadow: '0 0 6px rgba(0,229,255,0.5)' }} />
          <div className="w-1 h-2" style={{ background: 'rgba(0,229,255,0.4)' }} />
        </div>
        <span
          className="font-display text-base font-bold tracking-[0.25em] uppercase"
          style={{ color: '#00e5ff', textShadow: '0 0 12px rgba(0,229,255,0.4)' }}
        >
          CRISIS COMMAND
        </span>
      </div>

      {/* Center — round info with brackets */}
      <div className="flex items-center gap-2">
        <span style={{ color: 'rgba(0,229,255,0.3)' }} className="font-display text-xs">[</span>
        <span
          className="font-display text-sm tracking-[0.3em] uppercase font-medium"
          style={{ color: 'rgba(0, 229, 255, 0.6)' }}
        >
          {phase === 'briefing'
            ? 'INCOMING BRIEFING'
            : phase === 'consequence'
              ? `ROUND ${round}/${totalRounds} — OUTCOME`
              : `ROUND ${round}/${totalRounds} — ${roundTitle}`}
        </span>
        <span style={{ color: 'rgba(0,229,255,0.3)' }} className="font-display text-xs">]</span>
      </div>

      {/* Right — countdown */}
      <div className="flex items-center gap-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: timerColor,
            boxShadow: `0 0 8px ${timerColor}`,
            animation: 'flicker 1.5s ease-in-out infinite',
          }}
        />
        <span className="countdown-mono text-xs" style={{ color: 'rgba(224,230,240,0.4)' }}>
          MARKETS OPEN IN
        </span>
        <span className="countdown-mono text-base font-bold" style={{ color: timerColor, textShadow: `0 0 8px ${timerColor}40` }}>
          {formatCountdown(countdownMinutes)}
        </span>
      </div>
    </div>
  )
}
