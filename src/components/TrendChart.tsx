import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendChartProps {
  history: KPIValues[]
  width?: number
  height?: number
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendChart({ history, width = 480, height = 150 }: TrendChartProps) {
  if (history.length < 2) return null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.3))' }} />
        <span
          className="font-display text-xs font-bold tracking-[0.25em] uppercase"
          style={{ color: 'rgba(0,229,255,0.7)' }}
        >
          KPI TREND
        </span>
        <div className="w-8 h-px" style={{ background: 'linear-gradient(270deg, transparent, rgba(0,229,255,0.3))' }} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-0.5 rounded-full"
              style={{ background: kpiMeta[key].color, boxShadow: `0 0 4px ${kpiMeta[key].color}` }}
            />
            <span
              className="font-heading text-[10px] tracking-wider"
              style={{ color: kpiMeta[key].color, opacity: 0.8 }}
            >
              {kpiMeta[key].label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Chart history={history} width={width} height={height} />
    </div>
  )
}

function Chart({ history, width, height }: { history: KPIValues[]; width: number; height: number }) {
  const padL = 32
  const padR = 12
  const padT = 8
  const padB = 22
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
      {/* Chart background */}
      <rect
        x={padL} y={padT} width={chartW} height={chartH}
        fill="rgba(0,229,255,0.02)" rx="2"
      />

      {/* Y-axis grid lines + labels */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padL} y1={getY(v)} x2={padL + chartW} y2={getY(v)}
            stroke={v === 50 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}
            strokeWidth="1"
            strokeDasharray={v === 50 ? undefined : '2 4'}
          />
          <text
            x={padL - 6} y={getY(v)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(224,230,240,0.35)" fontSize="9" fontFamily="'Rajdhani', sans-serif"
          >
            {v}
          </text>
        </g>
      ))}

      {/* Vertical round markers + X-axis labels */}
      {roundLabels.slice(0, history.length).map((label, i) => (
        <g key={i}>
          <line
            x1={getX(i)} y1={padT} x2={getX(i)} y2={padT + chartH}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
          <text
            x={getX(i)} y={height - 4} textAnchor="middle"
            fill="rgba(224,230,240,0.5)" fontSize="10" fontFamily="'Rajdhani', sans-serif"
            fontWeight="600"
          >
            {label}
          </text>
        </g>
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
            {/* Data point dots */}
            {history.map((h, i) => (
              <circle
                key={i}
                cx={getX(i)} cy={getY(h[key])} r={i === history.length - 1 ? 3.5 : 2}
                fill={kpiMeta[key].color}
                style={{ filter: `drop-shadow(0 0 3px ${kpiMeta[key].color})` }}
              />
            ))}
            {/* End value label */}
            <text
              x={lastX + 8} y={lastY} dominantBaseline="middle"
              fill={kpiMeta[key].color} fontSize="9" fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
            >
              {history[history.length - 1][key]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
