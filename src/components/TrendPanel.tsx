import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendPanelProps {
  history: KPIValues[]
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendPanel({ history }: TrendPanelProps) {
  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 gap-2">
        <div className="panel-header self-stretch">
          <span
            className="font-display text-[10px] font-bold tracking-[0.25em] uppercase flex-shrink-0"
            style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
          >
            TRENDS
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span
            className="font-body text-xs tracking-wider"
            style={{ color: 'rgba(224,230,240,0.25)' }}
          >
            Data available after Round 1
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-3 gap-1.5">
      {/* Header */}
      <div className="panel-header self-stretch flex-shrink-0">
        <span
          className="font-display text-[10px] font-bold tracking-[0.25em] uppercase flex-shrink-0"
          style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
        >
          TRENDS
        </span>
      </div>

      {/* 2x2 chart grid — fills remaining space */}
      <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0">
        {keys.map((key) => (
          <PanelChart key={key} kpiKey={key} history={history} />
        ))}
      </div>
    </div>
  )
}

function PanelChart({ kpiKey, history }: { kpiKey: KPIKey; history: KPIValues[] }) {
  const meta = kpiMeta[kpiKey]
  const data = history.map((h) => h[kpiKey])
  const current = data[data.length - 1]
  const start = data[0]
  const delta = current - start

  const padL = 24
  const padR = 6
  const padT = 4
  const padB = 16
  // Use viewBox for scaling — SVG stretches to fill container
  const vbW = 200
  const vbH = 100
  const chartW = vbW - padL - padR
  const chartH = vbH - padT - padB

  function getX(i: number): number {
    return padL + (i / Math.max(data.length - 1, 1)) * chartW
  }

  function getY(v: number): number {
    return padT + ((100 - v) / 100) * chartH
  }

  const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }))
  const lineD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
  const areaD = `${lineD} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z`

  return (
    <div
      className="flex flex-col rounded overflow-hidden min-h-0"
      style={{
        border: `1px solid ${meta.color}20`,
        background: `${meta.color}06`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-2 py-0.5 flex-shrink-0" style={{ borderBottom: `1px solid ${meta.color}15` }}>
        <span
          className="font-display text-[9px] font-bold tracking-[0.12em] uppercase"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="font-display text-sm font-black leading-none"
            style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}44` }}
          >
            {current}
          </span>
          <span
            className="font-display text-[9px] font-bold leading-none"
            style={{ color: delta >= 0 ? '#00e676' : '#ff1744' }}
          >
            {delta >= 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>

      {/* Chart — stretches to fill remaining space */}
      <div className="flex-1 min-h-0 px-0.5 pb-0.5">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id={`panel-grad-${kpiKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={meta.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y grid */}
          {[0, 50, 100].map((v) => (
            <g key={v}>
              <line
                x1={padL} y1={getY(v)} x2={padL + chartW} y2={getY(v)}
                stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <text
                x={padL - 3} y={getY(v)} textAnchor="end" dominantBaseline="middle"
                fill="rgba(224,230,240,0.3)" fontSize="7" fontFamily="'Rajdhani', sans-serif"
                fontWeight="600"
              >
                {v}
              </text>
            </g>
          ))}

          {/* X labels */}
          {roundLabels.slice(0, data.length).map((label, i) => (
            <text
              key={i}
              x={getX(i)} y={vbH - 3} textAnchor="middle"
              fill="rgba(224,230,240,0.4)" fontSize="7" fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
            >
              {label}
            </text>
          ))}

          {/* Area */}
          <path d={areaD} fill={`url(#panel-grad-${kpiKey})`} />

          {/* Line */}
          <path
            d={lineD}
            fill="none"
            stroke={meta.color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 3px ${meta.color})` }}
          />

          {/* Dots with values */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={i === points.length - 1 ? 2.5 : 1.5}
                fill={meta.color}
                style={{ filter: `drop-shadow(0 0 2px ${meta.color})` }}
              />
              <text
                x={p.x} y={p.y - 5} textAnchor="middle"
                fill={meta.color} fontSize="6" fontFamily="'Rajdhani', sans-serif"
                fontWeight="700" opacity="0.7"
              >
                {data[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
