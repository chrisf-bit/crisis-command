import { motion } from 'framer-motion'
import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface TrendOverlayProps {
  history: KPIValues[]
  onClose: () => void
}

const keys = Object.keys(kpiMeta) as KPIKey[]
const roundLabels = ['Start', 'R1', 'R2', 'R3']

export default function TrendOverlay({ history, onClose }: TrendOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(10,14,23,0.88)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col items-center gap-4 p-6 rounded-xl"
        style={{
          border: '1px solid rgba(0,229,255,0.2)',
          background: 'rgba(10,14,23,0.97)',
          boxShadow: '0 0 40px rgba(0,229,255,0.08), inset 0 1px 0 rgba(0,229,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4))' }} />
          <span
            className="font-display text-sm font-bold tracking-[0.25em] uppercase"
            style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
          >
            TREND ANALYSIS
          </span>
          <div className="w-10 h-px" style={{ background: 'linear-gradient(270deg, transparent, rgba(0,229,255,0.4))' }} />
        </div>

        {/* 2x2 grid of individual KPI charts */}
        <div className="grid grid-cols-2 gap-3">
          {keys.map((key) => (
            <SingleKPIChart
              key={key}
              kpiKey={key}
              history={history}
            />
          ))}
        </div>

        {/* Close hint */}
        <span
          className="font-body text-[10px] tracking-wider"
          style={{ color: 'rgba(224,230,240,0.3)' }}
        >
          Click anywhere to close
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ── Individual KPI chart ── */
function SingleKPIChart({ kpiKey, history }: { kpiKey: KPIKey; history: KPIValues[] }) {
  const meta = kpiMeta[kpiKey]
  const data = history.map((h) => h[kpiKey])
  const current = data[data.length - 1]
  const start = data[0]
  const delta = current - start

  const width = 260
  const height = 140
  const padL = 32
  const padR = 12
  const padT = 8
  const padB = 22
  const chartW = width - padL - padR
  const chartH = height - padT - padB

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
      className="flex flex-col gap-1 px-3 py-2 rounded-lg"
      style={{
        border: `1px solid ${meta.color}22`,
        background: `${meta.color}08`,
      }}
    >
      {/* Header: label + current value + delta */}
      <div className="flex items-center justify-between">
        <span
          className="font-display text-xs font-bold tracking-[0.15em] uppercase"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-display text-lg font-black"
            style={{ color: meta.color, textShadow: `0 0 8px ${meta.color}44` }}
          >
            {current}
          </span>
          <span
            className="font-display text-xs font-bold"
            style={{ color: delta >= 0 ? '#00e676' : '#ff1744' }}
          >
            {delta >= 0 ? '+' : ''}{delta}
          </span>
        </div>
      </div>

      {/* Chart */}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Background */}
        <rect
          x={padL} y={padT} width={chartW} height={chartH}
          fill={`${meta.color}05`} rx="3"
          stroke={`${meta.color}10`} strokeWidth="0.5"
        />

        {/* Gradient fill */}
        <defs>
          <linearGradient id={`overlay-grad-${kpiKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={meta.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={meta.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid + labels */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={padL} y1={getY(v)} x2={padL + chartW} y2={getY(v)}
              stroke={v === 50 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}
              strokeWidth="0.5"
              strokeDasharray={v === 50 ? '3 3' : '2 6'}
            />
            <text
              x={padL - 6} y={getY(v)} textAnchor="end" dominantBaseline="middle"
              fill="rgba(224,230,240,0.35)" fontSize="9" fontFamily="'Rajdhani', sans-serif"
              fontWeight="600"
            >
              {v}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {roundLabels.slice(0, data.length).map((label, i) => (
          <g key={i}>
            <line
              x1={getX(i)} y1={padT} x2={getX(i)} y2={padT + chartH}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"
            />
            <text
              x={getX(i)} y={height - 5} textAnchor="middle"
              fill="rgba(224,230,240,0.5)" fontSize="10" fontFamily="'Rajdhani', sans-serif"
              fontWeight="700"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={`url(#overlay-grad-${kpiKey})`} />

        {/* Line */}
        <path
          d={lineD}
          fill="none"
          stroke={meta.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}
        />

        {/* Data dots with value labels */}
        {points.map((p, i) => (
          <g key={i}>
            {i === points.length - 1 && (
              <circle cx={p.x} cy={p.y} r="7" fill="none" stroke={meta.color} strokeWidth="1" opacity="0.25" />
            )}
            <circle
              cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5}
              fill={meta.color}
              style={{ filter: `drop-shadow(0 0 4px ${meta.color})` }}
            />
            {/* Value label at each point */}
            <text
              x={p.x} y={p.y - 8} textAnchor="middle"
              fill={meta.color} fontSize="9" fontFamily="'Rajdhani', sans-serif"
              fontWeight="700" opacity="0.8"
            >
              {data[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ── Exported for debrief screen ── */
export function TrendCharts({ history }: { history: KPIValues[] }) {
  if (history.length < 2) return null

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4))' }} />
        <span
          className="font-display text-sm font-bold tracking-[0.25em] uppercase"
          style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
        >
          PERFORMANCE OVER TIME
        </span>
        <div className="w-10 h-px" style={{ background: 'linear-gradient(270deg, transparent, rgba(0,229,255,0.4))' }} />
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {keys.map((key) => (
          <SingleKPIChart key={key} kpiKey={key} history={history} />
        ))}
      </div>
    </div>
  )
}
