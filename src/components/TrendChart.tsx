import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendChartProps {
  history: KPIValues[]
  width?: number
  height?: number
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendChart({ history, width = 480, height = 110 }: TrendChartProps) {
  if (history.length < 2) return null

  const padL = 32
  const padR = 8
  const padT = 8
  const padB = 20
  const chartW = width - padL - padR
  const chartH = height - padT - padB

  function getX(i: number): number {
    return padL + (i / (history.length - 1)) * chartW
  }

  function getY(v: number): number {
    return padT + ((100 - v) / 100) * chartH
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Y-axis grid lines */}
      {[25, 50, 75].map((v) => (
        <g key={v}>
          <line
            x1={padL} y1={getY(v)} x2={width - padR} y2={getY(v)}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
          <text
            x={padL - 4} y={getY(v)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(224,230,240,0.3)" fontSize="9" fontFamily="'Rajdhani', sans-serif"
          >
            {v}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {roundLabels.slice(0, history.length).map((label, i) => (
        <text
          key={i} x={getX(i)} y={height - 4} textAnchor="middle"
          fill="rgba(224,230,240,0.4)" fontSize="9" fontFamily="'Rajdhani', sans-serif"
        >
          {label}
        </text>
      ))}

      {/* One line per KPI */}
      {keys.map((key) => {
        const points = history.map((h, i) => `${getX(i)},${getY(h[key])}`)
        const lastX = getX(history.length - 1)
        const lastY = getY(history[history.length - 1][key])
        return (
          <g key={key}>
            <path
              d={`M ${points.join(' L ')}`}
              fill="none"
              stroke={kpiMeta[key].color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 4px ${kpiMeta[key].color})` }}
            />
            <circle
              cx={lastX} cy={lastY} r="3"
              fill={kpiMeta[key].color}
              style={{ filter: `drop-shadow(0 0 3px ${kpiMeta[key].color})` }}
            />
          </g>
        )
      })}
    </svg>
  )
}
