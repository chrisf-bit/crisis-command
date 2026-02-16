import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendChartProps {
  history: KPIValues[]
  width?: number
  height?: number
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendChart({ history, width = 520, height = 200 }: TrendChartProps) {
  if (history.length < 2) return null

  return (
    <div
      className="flex flex-col items-center gap-3 px-6 py-4 rounded-xl"
      style={{
        border: '1px solid rgba(0,229,255,0.2)',
        background: 'rgba(0,229,255,0.03)',
        boxShadow: '0 0 20px rgba(0,229,255,0.05), inset 0 1px 0 rgba(0,229,255,0.08)',
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4))' }} />
        <span
          className="font-display text-sm font-bold tracking-[0.25em] uppercase"
          style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
        >
          PERFORMANCE OVER TIME
        </span>
        <div className="w-12 h-px" style={{ background: 'linear-gradient(270deg, transparent, rgba(0,229,255,0.4))' }} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-5 h-[3px] rounded-full"
              style={{ background: kpiMeta[key].color, boxShadow: `0 0 6px ${kpiMeta[key].color}` }}
            />
            <span
              className="font-heading text-xs tracking-wider font-semibold"
              style={{ color: kpiMeta[key].color }}
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
  const padL = 36
  const padR = 40
  const padT = 12
  const padB = 28
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
        fill="rgba(0,229,255,0.02)" rx="4"
        stroke="rgba(0,229,255,0.06)" strokeWidth="1"
      />

      {/* Y-axis grid lines + labels */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padL} y1={getY(v)} x2={padL + chartW} y2={getY(v)}
            stroke={v === 50 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray={v === 50 ? '4 4' : '2 6'}
          />
          <text
            x={padL - 8} y={getY(v)} textAnchor="end" dominantBaseline="middle"
            fill="rgba(224,230,240,0.4)" fontSize="10" fontFamily="'Rajdhani', sans-serif"
            fontWeight="600"
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
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
          <text
            x={getX(i)} y={height - 6} textAnchor="middle"
            fill="rgba(224,230,240,0.6)" fontSize="11" fontFamily="'Rajdhani', sans-serif"
            fontWeight="700"
          >
            {label}
          </text>
        </g>
      ))}

      {/* Gradient area fills per KPI */}
      <defs>
        {keys.map((key) => (
          <linearGradient key={`grad-${key}`} id={`area-${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kpiMeta[key].color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={kpiMeta[key].color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* One line per KPI */}
      {keys.map((key) => {
        const points = history.map((h, i) => ({ x: getX(i), y: getY(h[key]) }))
        const lineD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
        const areaD = `${lineD} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z`
        const last = points[points.length - 1]
        return (
          <g key={key}>
            {/* Area fill */}
            <path d={areaD} fill={`url(#area-${key})`} />
            {/* Line */}
            <path
              d={lineD}
              fill="none"
              stroke={kpiMeta[key].color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 6px ${kpiMeta[key].color})` }}
            />
            {/* Data point dots */}
            {points.map((p, i) => (
              <g key={i}>
                {i === history.length - 1 && (
                  <circle
                    cx={p.x} cy={p.y} r="6"
                    fill="none"
                    stroke={kpiMeta[key].color}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                )}
                <circle
                  cx={p.x} cy={p.y} r={i === history.length - 1 ? 4 : 2.5}
                  fill={kpiMeta[key].color}
                  style={{ filter: `drop-shadow(0 0 4px ${kpiMeta[key].color})` }}
                />
              </g>
            ))}
            {/* End value label */}
            <text
              x={last.x + 10} y={last.y} dominantBaseline="middle"
              fill={kpiMeta[key].color} fontSize="11" fontFamily="'Rajdhani', sans-serif"
              fontWeight="700"
            >
              {history[history.length - 1][key]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
