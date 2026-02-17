import { useRef, useCallback } from 'react'
import FloatingNumber from './FloatingNumber'
import RadarChart from './RadarChart'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import type { ResourceChannel, ResourceAllocation } from '../types'
import { RESOURCE_CHANNELS, CHANNEL_META, CHANNEL_KPI_MAP, TOTAL_BUDGET } from '../types'
import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface MetricsPanelProps {
  allocation: ResourceAllocation
  onAllocate: (channel: ResourceChannel, value: number) => void
  locked: boolean
  getMultiplier: (channel: ResourceChannel) => number
  kpis: KPIValues
  impacts: KPIValues | null
  impactKey: number
}

// ── Arc geometry (compact) ──
const ARC_CX = 55
const ARC_CY = 48
const ARC_R = 36
const ARC_STROKE = 6
const START_ANGLE = -135
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

const TICKS = Array.from({ length: 21 }, (_, i) => ({
  angle: START_ANGLE + ((i * 5) / 100) * TOTAL_SWEEP,
  isMajor: i % 5 === 0,
}))

// ── Channel Card ──
function ChannelCard({
  channel,
  value,
  multiplier,
  locked,
  onAllocate,
  kpiKey,
  kpiValue,
  impact,
  impactKey,
}: {
  channel: ResourceChannel
  value: number
  multiplier: number
  locked: boolean
  onAllocate: (channel: ResourceChannel, value: number) => void
  kpiKey: KPIKey
  kpiValue: number
  impact: number | null
  impactKey: number
}) {
  const meta = CHANNEL_META[channel]
  const kpi = kpiMeta[kpiKey]
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const animatedKPI = useAnimatedNumber(kpiValue)

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
      const sx = 110 / rect.width
      const sy = 80 / rect.height
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
    <div
      className={`flex flex-col items-center rounded overflow-hidden ${locked ? 'opacity-30' : ''}`}
      style={{
        border: `1px solid ${meta.color}20`,
        background: `${meta.color}06`,
      }}
    >
      {/* Channel label row */}
      <div
        className="flex items-center justify-between w-full px-2 py-0.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${meta.color}15` }}
      >
        <span
          className="font-display text-[9px] font-bold tracking-[0.1em] uppercase"
          style={{ color: meta.color }}
        >
          {meta.icon} {meta.label}
        </span>
        <span
          className="font-display text-[9px] font-bold"
          style={{ color: multColor }}
        >
          {multiplier.toFixed(1)}x
        </span>
      </div>

      {/* Arc gauge + KPI readout */}
      <div className="flex items-center w-full flex-1 min-h-0 px-1">
        {/* Arc gauge */}
        <div className="flex-shrink-0" style={{ width: '55%' }}>
          <svg
            ref={svgRef}
            viewBox="0 0 110 80"
            className={`w-full ${locked ? 'pointer-events-none' : 'cursor-pointer'}`}
            style={{ filter: locked ? 'none' : `drop-shadow(0 0 8px ${meta.color}15)` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {/* Tick marks */}
            {TICKS.map(({ angle, isMajor }, i) => {
              const inner = polar(ARC_CX, ARC_CY, ARC_R + 1, angle)
              const outer = polar(ARC_CX, ARC_CY, ARC_R + (isMajor ? 7 : 4), angle)
              return (
                <line
                  key={i}
                  x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke={meta.color}
                  strokeOpacity={isMajor ? 0.35 : 0.1}
                  strokeWidth={isMajor ? 0.7 : 0.4}
                />
              )
            })}

            {/* Background arc */}
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
                  style={{ filter: `drop-shadow(0 0 4px ${meta.color}80)` }}
                />
                {capPos && (
                  <circle
                    cx={capPos.x} cy={capPos.y} r={3.5}
                    fill={meta.color}
                    opacity={0.9}
                    style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}
                  />
                )}
              </>
            )}

            {/* Center value */}
            <text
              x={ARC_CX} y={ARC_CY + 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={meta.color}
              fontSize={16}
              fontFamily="'Orbitron', sans-serif"
              fontWeight={900}
              style={{ filter: `drop-shadow(0 0 6px ${meta.color}50)` }}
            >
              {value}%
            </text>
          </svg>
        </div>

        {/* KPI readout */}
        <div className="flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5 relative">
          {/* Impact floating number */}
          {impact !== null && impact !== 0 && (
            <div className="absolute -top-2 z-10" key={`impact-${kpiKey}-${impactKey}`}>
              <FloatingNumber
                value={impact}
                color={impact > 0 ? '#00e676' : '#ff1744'}
              />
            </div>
          )}

          <span
            className="font-display text-[8px] tracking-[0.12em] uppercase"
            style={{ color: 'rgba(224,230,240,0.4)' }}
          >
            → {kpi.label}
          </span>
          <span
            className="font-display text-2xl font-black leading-none"
            style={{ color: kpi.color, textShadow: `0 0 8px ${kpi.color}44` }}
          >
            {animatedKPI}
          </span>
          {/* Mini bar gauge */}
          <div className="w-full max-w-[60px] h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, animatedKPI)}%`,
                background: kpi.color,
                boxShadow: `0 0 4px ${kpi.color}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Budget Bar ──
function BudgetBar({ locked }: { locked: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0">
      <span
        className="font-display text-[9px] font-bold tracking-[0.2em] uppercase flex-shrink-0"
        style={{ color: locked ? 'rgba(255,23,68,0.5)' : 'rgba(0,229,255,0.7)' }}
      >
        {locked ? '● LOCKED' : 'CRISIS BUDGET'}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, #00e5ff, #00e676)',
            boxShadow: '0 0 6px rgba(0,229,255,0.4)',
          }}
        />
      </div>
      <span
        className="font-display text-[9px] font-bold"
        style={{ color: 'rgba(0,229,255,0.5)' }}
      >
        {TOTAL_BUDGET}
      </span>
    </div>
  )
}

// ── Main Component ──
export default function MetricsPanel({
  allocation,
  onAllocate,
  locked,
  getMultiplier,
  kpis,
  impacts,
  impactKey,
}: MetricsPanelProps) {
  return (
    <div className="flex flex-col h-full w-full relative z-[1]">
      {/* Budget header */}
      <BudgetBar locked={locked} />

      {/* 2x2 grid of channel cards */}
      <div className="grid grid-cols-2 gap-1.5 px-2 flex-1 min-h-0">
        {RESOURCE_CHANNELS.map((channel) => {
          const kpiKey = CHANNEL_KPI_MAP[channel]
          return (
            <ChannelCard
              key={channel}
              channel={channel}
              value={allocation[channel]}
              multiplier={getMultiplier(channel)}
              locked={locked}
              onAllocate={onAllocate}
              kpiKey={kpiKey}
              kpiValue={kpis[kpiKey]}
              impact={impacts ? impacts[kpiKey] : null}
              impactKey={impactKey}
            />
          )
        })}
      </div>

      {/* Compact radar */}
      <div className="flex items-center justify-center py-1 flex-shrink-0">
        <RadarChart values={kpis} size={140} />
      </div>
    </div>
  )
}
