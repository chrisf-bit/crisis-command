import KPIGauge from './KPIGauge'
import FloatingNumber from './FloatingNumber'
import RadarChart from './RadarChart'
import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface KPIPanelProps {
  kpis: KPIValues
  impacts: KPIValues | null
  impactKey: number
  showRadar?: boolean
  history?: KPIValues[]
  onShowTrends?: () => void
}

const keys = Object.keys(kpiMeta) as KPIKey[]

export default function KPIPanel({ kpis, impacts, impactKey, showRadar = true, history, onShowTrends }: KPIPanelProps) {
  const hasTrend = history && history.length > 1

  return (
    <div className="flex flex-col items-center p-4 gap-2 h-full">
      {/* Header with extending line */}
      <div className="panel-header self-stretch">
        <span
          className="font-display text-[10px] font-bold tracking-[0.25em] uppercase flex-shrink-0"
          style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.4)' }}
        >
          SYSTEMS
        </span>
      </div>

      {/* Gauges */}
      <div className="flex flex-col items-center justify-center gap-1" style={{ flex: '7 1 0%' }}>
        {keys.map((key) => (
          <div key={key} className="relative flex flex-col items-center">
            {impacts && impacts[key] !== 0 && (
              <div className="absolute -top-4 z-10" key={`impact-${key}-${impactKey}`}>
                <FloatingNumber
                  value={impacts[key]}
                  color={impacts[key] > 0 ? '#00e676' : '#ff1744'}
                />
              </div>
            )}
            <KPIGauge
              label={kpiMeta[key].label}
              value={kpis[key]}
              color={kpiMeta[key].color}
              size={120}
            />
          </div>
        ))}
      </div>

      {/* Bottom section — radar + trends button */}
      <div className="flex flex-col items-center gap-2" style={{ flex: '3 1 0%' }}>
        {showRadar && (
          <div className="flex items-center justify-center flex-1">
            <RadarChart values={kpis} size={160} />
          </div>
        )}
        {hasTrend && onShowTrends && (
          <button
            onClick={onShowTrends}
            className="px-4 py-1.5 rounded-md border border-cyan-glow/30 bg-cyan-glow/5 font-display text-[10px] tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/15 transition-colors"
            style={{ textShadow: '0 0 8px rgba(0,229,255,0.3)' }}
          >
            VIEW TRENDS
          </button>
        )}
      </div>
    </div>
  )
}
