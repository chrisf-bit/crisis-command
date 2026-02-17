import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface MiniTrendChartProps {
  history: KPIValues[]
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function MiniTrendChart({ history }: MiniTrendChartProps) {
  if (history.length < 2) return null

  const width = 240
  const height = 160
  const padL = 28
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
    <div
      className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg w-full"
      style={{
        border: '1px solid rgba(0,229,255,0.15)',
        background: 'rgba(0,229,255,0.02)',
      }}
    >
      {/* Title */}
      <span
        className="font-display text-[9px] font-bold tracking-[0.2em] uppercase"
        style={{ color: 'rgba(0,229,255,0.6)' }}
      >
        KPI TREND
      </span>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
        {keys.map((key) => (
          <div key={key} className="flex items-center gap-1">
            <div
              className="w-3 h-[2px] rounded-full"
              style={{ background: kpiMeta[key].color, boxShadow: `0 0 4px ${kpiMeta[key].color}` }}
            />
            <span
              className="font-heading text-[8px] tracking-wider font-semibold"
              style={{ color: kpiMeta[key].color, opacity: 0.8 }}
            >
              {kpiMeta[key].label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background */}
        <rect
          x={padL} y={padT} width={chartW} height={chartH}
          fill="rgba(0,229,255,0.02)" rx="2"
          stroke="rgba(0,229,255,0.05)" strokeWidth="0.5"
        />

        {/* Y-axis grid + labels */}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1={padL} y1={getY(v)} x2={padL + chartW} y2={getY(v)}
              stroke={v === 50 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
            <text
              x={padL - 4} y={getY(v)} textAnchor="end" dominantBaseline="middle"
              fill="rgba(224,230,240,0.35)" fontSize="8" fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {roundLabels.slice(0, history.length).map((label, i) => (
          <g key={i}>
            <line
              x1={getX(i)} y1={padT} x2={getX(i)} y2={padT + chartH}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
            />
            <text
              x={getX(i)} y={height - 4} textAnchor="middle"
              fill="rgba(224,230,240,0.5)" fontSize="9" fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Area fill gradients */}
        <defs>
          {keys.map((key) => (
            <linearGradient key={`mini-grad-${key}`} id={`mini-area-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={kpiMeta[key].color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={kpiMeta[key].color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Lines */}
        {keys.map((key) => {
          const points = history.map((h, i) => ({ x: getX(i), y: getY(h[key]) }))
          const lineD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
          const areaD = `${lineD} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z`
          const last = points[points.length - 1]
          return (
            <g key={key}>
              <path d={areaD} fill={`url(#mini-area-${key})`} />
              <path
                d={lineD}
                fill="none"
                stroke={kpiMeta[key].color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 3px ${kpiMeta[key].color})` }}
              />
              {/* Data dots */}
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 1.5}
                  fill={kpiMeta[key].color}
                  style={{ filter: `drop-shadow(0 0 2px ${kpiMeta[key].color})` }}
                />
              ))}
              {/* Current value at end */}
              <text
                x={last.x + 1} y={last.y - 6} textAnchor="middle"
                fill={kpiMeta[key].color} fontSize="8" fontFamily="'Rajdhani', sans-serif"
                fontWeight="700"
              >
                {history[history.length - 1][key]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
