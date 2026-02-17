import FloatingNumber from './FloatingNumber'
import RadarChart from './RadarChart'
import TrendPanel from './TrendPanel'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface MetricsPanelProps {
  kpis: KPIValues
  impacts: KPIValues | null
  impactKey: number
  history: KPIValues[]
}

const keys = Object.keys(kpiMeta) as KPIKey[]

function KPIRow({ kpiKey, value, impact, impactKey }: {
  kpiKey: KPIKey
  value: number
  impact: number | null
  impactKey: number
}) {
  const meta = kpiMeta[kpiKey]
  const animated = useAnimatedNumber(value)

  return (
    <div className="flex items-center gap-2 px-2 py-1 relative">
      {/* Impact floating number */}
      {impact !== null && impact !== 0 && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10" key={`impact-${kpiKey}-${impactKey}`}>
          <FloatingNumber
            value={impact}
            color={impact > 0 ? '#00e676' : '#ff1744'}
          />
        </div>
      )}

      {/* KPI label */}
      <span
        className="font-heading text-xs font-semibold tracking-wider uppercase flex-1"
        style={{ color: `${meta.color}99` }}
      >
        {meta.label}
      </span>

      {/* Mini bar */}
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(100, animated)}%`,
            background: meta.color,
            boxShadow: `0 0 4px ${meta.color}`,
          }}
        />
      </div>

      {/* Value */}
      <span
        className="font-display text-base font-black w-8 text-right leading-none"
        style={{ color: meta.color, textShadow: `0 0 6px ${meta.color}44` }}
      >
        {animated}
      </span>
    </div>
  )
}

export default function MetricsPanel({ kpis, impacts, impactKey, history }: MetricsPanelProps) {
  return (
    <div className="flex flex-col h-full w-full relative z-[1]">
      {/* Header */}
      <div className="panel-header px-3 pt-2 flex-shrink-0">
        <span
          className="font-display text-[10px] font-bold tracking-[0.25em] uppercase"
          style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
        >
          SYSTEMS
        </span>
      </div>

      {/* KPI rows */}
      <div className="flex flex-col flex-shrink-0">
        {keys.map((key) => (
          <KPIRow
            key={key}
            kpiKey={key}
            value={kpis[key]}
            impact={impacts ? impacts[key] : null}
            impactKey={impactKey}
          />
        ))}
      </div>

      {/* Trend charts — compact */}
      <div className="min-h-0" style={{ flex: '2 1 0%' }}>
        <TrendPanel history={history} />
      </div>

      {/* Radar heatmap — larger */}
      <div className="flex items-center justify-center" style={{ flex: '5 1 0%' }}>
        <RadarChart values={kpis} size={260} />
      </div>
    </div>
  )
}
