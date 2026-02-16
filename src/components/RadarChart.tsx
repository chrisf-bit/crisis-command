import { useEffect, useState } from 'react'
import type { KPIValues } from '../data/gameData'
import { kpiMeta, type KPIKey } from '../data/gameData'

interface RadarChartProps {
  values: KPIValues
  size?: number
  history?: KPIValues[]
}

export default function RadarChart({ values, size = 280, history }: RadarChartProps) {
  const [scale, setScale] = useState(0)
  const center = size / 2
  const maxR = size / 2 - 40
  const keys = Object.keys(kpiMeta) as KPIKey[]
  const angleStep = (2 * Math.PI) / keys.length
  const startAngle = -Math.PI / 2

  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100)
    return () => clearTimeout(timer)
  }, [])

  function getPoint(index: number, value: number): [number, number] {
    const angle = startAngle + index * angleStep
    const r = (Math.min(value, 100) / 100) * maxR * scale
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  // Grid rings
  const rings = [25, 50, 75, 100]

  // Value polygon
  const polyPoints = keys
    .map((_, i) => getPoint(i, values[keys[i]]))
    .map(([x, y]) => `${x},${y}`)
    .join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={keys
            .map((_, i) => {
              const angle = startAngle + i * angleStep
              const radius = (r / 100) * maxR
              return `${center + radius * Math.cos(angle)},${center + radius * Math.sin(angle)}`
            })
            .join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {keys.map((_, i) => {
        const angle = startAngle + i * angleStep
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + maxR * Math.cos(angle)}
            y2={center + maxR * Math.sin(angle)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        )
      })}

      {/* Historical layers */}
      {history && history.map((snapshot, layerIndex) => {
        const layerPoints = keys
          .map((_, i) => getPoint(i, snapshot[keys[i]]))
          .map(([x, y]) => `${x},${y}`)
          .join(' ')
        const opacity = 0.15 + (layerIndex / Math.max(history.length - 1, 1)) * 0.25
        const strokeOpacity = 0.3 + (layerIndex / Math.max(history.length - 1, 1)) * 0.4
        return (
          <polygon
            key={`history-${layerIndex}`}
            points={layerPoints}
            fill={`rgba(0, 229, 255, ${(opacity * 0.3).toFixed(3)})`}
            stroke={`rgba(0, 229, 255, ${strokeOpacity.toFixed(2)})`}
            strokeWidth="1"
            strokeDasharray="4 2"
            style={{ transition: 'all 1.5s cubic-bezier(0.33, 1, 0.68, 1)' }}
          />
        )
      })}

      {/* Value area */}
      <polygon
        points={polyPoints}
        fill="rgba(0, 229, 255, 0.12)"
        stroke="#00e5ff"
        strokeWidth="2"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.3))',
          transition: 'all 1.5s cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      />

      {/* Value dots */}
      {keys.map((key, i) => {
        const [x, y] = getPoint(i, values[key])
        return (
          <circle
            key={key}
            cx={x}
            cy={y}
            r="4"
            fill={kpiMeta[key].color}
            style={{
              filter: `drop-shadow(0 0 4px ${kpiMeta[key].color})`,
              transition: 'all 1.5s cubic-bezier(0.33, 1, 0.68, 1)',
            }}
          />
        )
      })}

      {/* Labels */}
      {keys.map((key, i) => {
        const angle = startAngle + i * angleStep
        const labelR = maxR + 24
        const lx = center + labelR * Math.cos(angle)
        const ly = center + labelR * Math.sin(angle)
        return (
          <text
            key={key}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={kpiMeta[key].color}
            fontSize="11"
            fontFamily="'Rajdhani', sans-serif"
            fontWeight="600"
          >
            {kpiMeta[key].label}
          </text>
        )
      })}
    </svg>
  )
}
