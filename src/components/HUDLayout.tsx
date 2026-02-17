import type { ReactNode, RefObject } from 'react'
import PanelFrame from './hud/PanelFrame'

interface HUDLayoutProps {
  statusBar: ReactNode
  commsFeed: ReactNode
  inputsPanel: ReactNode
  kpiPanel: ReactNode
  trendsPanel: ReactNode
  children: ReactNode
  statusRef?: RefObject<HTMLDivElement | null>
  commsRef?: RefObject<HTMLDivElement | null>
  inputsRef?: RefObject<HTMLDivElement | null>
  mainRef?: RefObject<HTMLDivElement | null>
  kpiRef?: RefObject<HTMLDivElement | null>
  trendsRef?: RefObject<HTMLDivElement | null>
}

export default function HUDLayout({
  statusBar,
  commsFeed,
  inputsPanel,
  kpiPanel,
  trendsPanel,
  children,
  statusRef,
  commsRef,
  inputsRef,
  mainRef,
  kpiRef,
  trendsRef,
}: HUDLayoutProps) {
  return (
    <div className="hud-grid hud-frame">
      {/* SVG noise filter — used by panels for grain texture */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="hud-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>

      {/* Extra corner brackets (TR + BL) */}
      <div
        className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
        style={{ zIndex: 20, borderTop: '2px solid rgba(0,229,255,0.5)', borderRight: '2px solid rgba(0,229,255,0.5)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none"
        style={{ zIndex: 20, borderBottom: '2px solid rgba(0,229,255,0.5)', borderLeft: '2px solid rgba(0,229,255,0.5)' }}
      />

      <div ref={statusRef} className="hud-status hud-panel">
        <PanelFrame variant="status" label="SYS.CMD" sublabel="PORT:7742" />
        {statusBar}
      </div>

      <div ref={commsRef} className="hud-comms hud-panel hud-panel-scan">
        <PanelFrame label="COMMS.FEED" sublabel="FREQ:142.8" />
        <div className="hud-panel-noise" />
        {commsFeed}
      </div>

      <div ref={trendsRef} className="hud-trends hud-panel hud-panel-scan">
        <PanelFrame label="KPI.TREND" sublabel="ANALYSIS" />
        <div className="hud-panel-noise" />
        {trendsPanel}
      </div>

      <div ref={inputsRef} className="hud-inputs hud-panel hud-panel-scan">
        <PanelFrame label="PWR.ALLOC" sublabel="BUDGET:100" />
        <div className="hud-panel-noise" />
        {inputsPanel}
      </div>

      <div ref={mainRef} className="hud-scenarios hud-panel hud-panel-scan">
        <PanelFrame label="MAIN.DISPLAY" sublabel="RES:1920x1080" />
        <div className="hud-panel-noise" />
        {children}
      </div>

      <div ref={kpiRef} className="hud-kpi hud-panel hud-panel-scan">
        <PanelFrame label="SYS.METRICS" sublabel="UPTIME:99.7%" />
        <div className="hud-panel-noise" />
        {kpiPanel}
      </div>
    </div>
  )
}
