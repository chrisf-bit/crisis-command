import KPIGauge from './KPIGauge'
import FloatingNumber from './FloatingNumber'
import RadarChart from './RadarChart'
import { kpiMeta, type KPIValues, type KPIKey } from '../data/gameData'

interface KPIPanelProps {
  kpis: KPIValues
  impacts: KPIValues | null
  impactKey: number
  showRadar?: boolean
}

const keys = Object.keys(kpiMeta) as KPIKey[]

export default function KPIPanel({ kpis, impacts, impactKey, showRadar = true }: KPIPanelProps) {
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

      {/* Gauges — 70% of available height */}
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

      {/* Radar heatmap — 30% of available height */}
      {showRadar && (
        <div className="flex items-center justify-center" style={{ flex: '3 1 0%' }}>
          <RadarChart values={kpis} size={180} />
        </div>
      )}
    </div>
  )
}
