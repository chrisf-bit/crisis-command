import { useRef, useCallback } from 'react'
import type { ResourceChannel, ResourceAllocation } from '../types'
import { RESOURCE_CHANNELS, CHANNEL_META, CHANNEL_KPI_MAP, TOTAL_BUDGET } from '../types'
import { kpiMeta } from '../data/gameData'

interface ResourceAllocatorProps {
  allocation: ResourceAllocation
  onAllocate: (channel: ResourceChannel, value: number) => void
  locked: boolean
  getMultiplier: (channel: ResourceChannel) => number
  budgetRemaining: number
}

// ── Arc geometry ──
const ARC_CX = 70
const ARC_CY = 60
const ARC_R = 46
const ARC_STROKE = 7
const START_ANGLE = -135 // 0° = top, clockwise positive
const END_ANGLE = 135
const TOTAL_SWEEP = 270

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(startAngle: number, endAngle: number) {
  const s = polar(ARC_CX, ARC_CY, ARC_R, endAngle)
  const e = polar(ARC_CX, ARC_CY, ARC_R, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${ARC_R} ${ARC_R} 0 ${large} 0 ${e.x} ${e.y}`
}

// Tick marks — 21 ticks (values 0,5,10,...,100), major every 25
const TICKS = Array.from({ length: 21 }, (_, i) => ({
  angle: START_ANGLE + ((i * 5) / 100) * TOTAL_SWEEP,
  isMajor: (i * 5) % 25 === 0,
}))

// ── Arc Gauge Component ──
function ArcGauge({
  channel,
  value,
  multiplier,
  locked,
  onAllocate,
}: {
  channel: ResourceChannel
  value: number
  multiplier: number
  locked: boolean
  onAllocate: (channel: ResourceChannel, value: number) => void
}) {
  const meta = CHANNEL_META[channel]
  const kpiLabel = kpiMeta[CHANNEL_KPI_MAP[channel]].label
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const isBoosted = multiplier > 1.05
  const isReduced = multiplier < 0.95
  const multColor = isBoosted ? '#00e676' : isReduced ? '#ff1744' : meta.color

  const valueAngle = START_ANGLE + (value / 100) * TOTAL_SWEEP
  const bgArc = arcPath(START_ANGLE, END_ANGLE)
  const fillArc = value > 0 ? arcPath(START_ANGLE, valueAngle) : ''
  const capPos = value > 0 ? polar(ARC_CX, ARC_CY, ARC_R, valueAngle) : null

  const angleFromPointer = useCallback(
    (e: React.PointerEvent) => {
      if (locked || !svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const sx = 140 / rect.width
      const sy = 100 / rect.height
      const mx = (e.clientX - rect.left) * sx - ARC_CX
      const my = (e.clientY - rect.top) * sy - ARC_CY
      let angle = (Math.atan2(mx, -my) * 180) / Math.PI
      if (angle > END_ANGLE) angle = END_ANGLE
      if (angle < START_ANGLE) angle = START_ANGLE
      const pct = (angle - START_ANGLE) / TOTAL_SWEEP
      onAllocate(channel, Math.round(pct * 100))
    },
    [channel, locked, onAllocate],
  )

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if (locked) return
      dragging.current = true
      ;(e.target as Element).setPointerCapture(e.pointerId)
      angleFromPointer(e)
    },
    [locked, angleFromPointer],
  )

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      angleFromPointer(e)
    },
    [angleFromPointer],
  )

  const onUp = useCallback(() => {
    dragging.current = false
  }, [])

  return (
    <div className={`flex flex-col items-center gap-0.5 ${locked ? 'opacity-30' : ''}`}>
      <svg
        ref={svgRef}
        viewBox="0 0 140 100"
        className={`w-full ${locked ? 'pointer-events-none' : 'cursor-pointer'}`}
        style={{ filter: locked ? 'none' : `drop-shadow(0 0 12px ${meta.color}15)` }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Outer tick marks */}
        {TICKS.map(({ angle, isMajor }, i) => {
          const inner = polar(ARC_CX, ARC_CY, ARC_R + 2, angle)
          const outer = polar(ARC_CX, ARC_CY, ARC_R + (isMajor ? 9 : 5), angle)
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={meta.color}
              strokeOpacity={isMajor ? 0.35 : 0.1}
              strokeWidth={isMajor ? 0.8 : 0.5}
            />
          )
        })}

        {/* Background arc track */}
        <path
          d={bgArc}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={ARC_STROKE}
          fill="none"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        {value > 0 && (
          <>
            <path
              d={fillArc}
              stroke={meta.color}
              strokeWidth={ARC_STROKE}
              fill="none"
              strokeLinecap="round"
              opacity={0.85}
              style={{ filter: `drop-shadow(0 0 6px ${meta.color}80)` }}
            />
            {/* End-cap glow */}
            {capPos && (
              <circle
                cx={capPos.x}
                cy={capPos.y}
                r={4.5}
                fill={meta.color}
                opacity={0.9}
                style={{ filter: `drop-shadow(0 0 8px ${meta.color})` }}
              />
            )}
          </>
        )}

        {/* Center icon */}
        <text
          x={ARC_CX}
          y={ARC_CY - 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
        >
          {meta.icon}
        </text>

        {/* Center value */}
        <text
          x={ARC_CX}
          y={ARC_CY + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={meta.color}
          fontSize={20}
          fontFamily="'Orbitron', sans-serif"
          fontWeight={900}
          style={{ filter: `drop-shadow(0 0 8px ${meta.color}50)` }}
        >
          {value}%
        </text>

        {/* Multiplier */}
        <text
          x={ARC_CX}
          y={ARC_CY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={multColor}
          fontSize={9}
          fontFamily="'Orbitron', sans-serif"
          fontWeight={700}
        >
          {multiplier.toFixed(1)}x
        </text>
      </svg>

      {/* Channel label */}
      <span
        className="font-heading text-sm font-semibold tracking-wider uppercase text-center leading-none"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>

      {/* Target KPI */}
      <span
        className="font-display text-[10px] tracking-[0.15em] uppercase"
        style={{ color: 'rgba(224,230,240,0.3)' }}
      >
        → {kpiLabel}
      </span>
    </div>
  )
}

// ── Main Component ──
export default function ResourceAllocator({
  allocation,
  onAllocate,
  locked,
  getMultiplier,
  budgetRemaining,
}: ResourceAllocatorProps) {
  const pct = ((TOTAL_BUDGET - budgetRemaining) / TOTAL_BUDGET) * 100
  const isLow = budgetRemaining <= 20
  const barColor = isLow
    ? 'linear-gradient(90deg, #ff1744, #ff6333)'
    : 'linear-gradient(90deg, #00e5ff, #00e676)'

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 py-3 gap-2 relative z-[1]">
      {/* Budget header */}
      <div className="flex items-center gap-3 w-full">
        <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.3))' }} />
        <span
          className="font-display text-xs font-bold tracking-[0.25em] uppercase flex-shrink-0"
          style={{ color: locked ? 'rgba(255,23,68,0.5)' : 'rgba(0,229,255,0.7)' }}
        >
          {locked ? '● LOCKED' : 'BUDGET'}
        </span>
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${100 - pct}%`,
              background: barColor,
              boxShadow: isLow ? '0 0 6px rgba(255,23,68,0.4)' : '0 0 6px rgba(0,229,255,0.4)',
            }}
          />
        </div>
        <span
          className="font-display text-[10px] font-bold tabular-nums"
          style={{ color: isLow ? '#ff1744' : 'rgba(0,229,255,0.5)' }}
        >
          {budgetRemaining}
        </span>
      </div>

      {/* Dials row — fills available space */}
      <div className="grid grid-cols-4 gap-4 w-full flex-1 items-center">
        {RESOURCE_CHANNELS.map((channel) => (
          <ArcGauge
            key={channel}
            channel={channel}
            value={allocation[channel]}
            multiplier={getMultiplier(channel)}
            locked={locked}
            onAllocate={onAllocate}
          />
        ))}
      </div>

      {/* Hint text */}
      {!locked && (
        <span
          className="font-body text-xs text-center"
          style={{ color: 'rgba(224,230,240,0.3)' }}
        >
          Drag dials to allocate — budget shared across all channels
        </span>
      )}
    </div>
  )
}
