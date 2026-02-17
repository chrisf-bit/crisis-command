import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendPanelProps {
  history: KPIValues[]
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendPanel({ history }: TrendPanelProps) {
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

  const padL = 28
  const padR = 8
  const padT = 6
  const padB = 18
  const vbW = 200
  const vbH = 100
  const chartW = vbW - padL - padR
  const chartH = vbH - padT - padB

  // Always use 4-point scale (Start, R1, R2, R3) so chart doesn't jump around
  function getX(i: number): number {
    return padL + (i / 3) * chartW
  }

  function getY(v: number): number {
    return padT + ((100 - v) / 100) * chartH
  }

  const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }))
  const hasLine = points.length > 1
  const lineD = hasLine ? `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}` : ''
  const areaD = hasLine ? `${lineD} L ${points[points.length - 1].x},${padT + chartH} L ${points[0].x},${padT + chartH} Z` : ''

  return (
    <div
      className="flex flex-col rounded overflow-hidden min-h-0"
      style={{
        border: `1px solid ${meta.color}20`,
        background: `${meta.color}06`,
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-2 py-1 flex-shrink-0" style={{ borderBottom: `1px solid ${meta.color}15` }}>
        <span
          className="font-display text-[11px] font-bold tracking-[0.12em] uppercase"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="font-display text-base font-black leading-none"
            style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}44` }}
          >
            {current}
          </span>
          {delta !== 0 && (
            <span
              className="font-display text-[11px] font-bold leading-none"
              style={{ color: delta > 0 ? '#00e676' : '#ff1744' }}
            >
              {delta > 0 ? '+' : ''}{delta}
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
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
                x={padL - 4} y={getY(v)} textAnchor="end" dominantBaseline="middle"
                fill="rgba(224,230,240,0.35)" fontSize="10" fontFamily="'Rajdhani', sans-serif"
                fontWeight="600"
              >
                {v}
              </text>
            </g>
          ))}

          {/* All 4 X-axis labels — future ones faded */}
          {roundLabels.map((label, i) => (
            <text
              key={i}
              x={getX(i)} y={vbH - 3} textAnchor="middle"
              fill={i < data.length ? 'rgba(224,230,240,0.5)' : 'rgba(224,230,240,0.15)'}
              fontSize="10" fontFamily="'Rajdhani', sans-serif"
              fontWeight="700"
            >
              {label}
            </text>
          ))}

          {/* Area fill (only when we have a line) */}
          {hasLine && <path d={areaD} fill={`url(#panel-grad-${kpiKey})`} />}

          {/* Line (only when 2+ points) */}
          {hasLine && (
            <path
              d={lineD}
              fill="none"
              stroke={meta.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 0 3px ${meta.color})` }}
            />
          )}

          {/* Data dots with values */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x} cy={p.y} r={i === points.length - 1 ? 3 : 2}
                fill={meta.color}
                style={{ filter: `drop-shadow(0 0 2px ${meta.color})` }}
              />
              <text
                x={p.x} y={p.y - 6} textAnchor="middle"
                fill={meta.color} fontSize="9" fontFamily="'Rajdhani', sans-serif"
                fontWeight="700" opacity="0.8"
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
