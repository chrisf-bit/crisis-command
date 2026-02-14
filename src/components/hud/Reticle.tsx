import { memo } from 'react'

const CY = '#00e5ff'
const S = 300 // viewBox size
const C = S / 2 // center

export default memo(function Reticle() {
  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      style={{ zIndex: 1, opacity: 0.06 }}
    >
      <svg
        width="60%"
        height="60%"
        viewBox={`0 0 ${S} ${S}`}
        fill="none"
        style={{ maxWidth: 400, maxHeight: 400 }}
      >
        {/* Concentric circles */}
        <circle cx={C} cy={C} r={130} stroke={CY} strokeWidth={0.5} strokeDasharray="4 8" />
        <circle cx={C} cy={C} r={95} stroke={CY} strokeWidth={0.5} strokeDasharray="2 6" />
        <circle cx={C} cy={C} r={60} stroke={CY} strokeWidth={0.5} strokeDasharray="6 4" />
        <circle cx={C} cy={C} r={25} stroke={CY} strokeWidth={0.5} />
        <circle cx={C} cy={C} r={3} fill={CY} fillOpacity={0.5} />

        {/* Crosshair lines */}
        <line x1={C} y1={10} x2={C} y2={S - 10} stroke={CY} strokeWidth={0.4} strokeDasharray="8 16" />
        <line x1={10} y1={C} x2={S - 10} y2={C} stroke={CY} strokeWidth={0.4} strokeDasharray="8 16" />

        {/* Diagonal lines */}
        <line x1={40} y1={40} x2={S - 40} y2={S - 40} stroke={CY} strokeWidth={0.3} strokeDasharray="4 12" opacity={0.5} />
        <line x1={S - 40} y1={40} x2={40} y2={S - 40} stroke={CY} strokeWidth={0.3} strokeDasharray="4 12" opacity={0.5} />

        {/* Cardinal data points */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x = C + 130 * Math.cos(rad)
          const y = C + 130 * Math.sin(rad)
          return <circle key={deg} cx={x} cy={y} r={2.5} fill={CY} fillOpacity={0.4} />
        })}

        {/* Intercardinal data points */}
        {[45, 135, 225, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const x = C + 95 * Math.cos(rad)
          const y = C + 95 * Math.sin(rad)
          return <circle key={deg} cx={x} cy={y} r={1.5} fill={CY} fillOpacity={0.3} />
        })}

        {/* Rotating indicator ring */}
        <g style={{ transformOrigin: `${C}px ${C}px`, animation: 'hud-rotate 40s linear infinite' }}>
          {/* Arrow markers at cardinal points on outer ring */}
          <polygon points={`${C},15 ${C + 5},25 ${C - 5},25`} fill={CY} fillOpacity={0.35} />
          <polygon points={`${C},${S - 15} ${C + 5},${S - 25} ${C - 5},${S - 25}`} fill={CY} fillOpacity={0.35} />
          <polygon points={`15,${C} 25,${C - 5} 25,${C + 5}`} fill={CY} fillOpacity={0.35} />
          <polygon points={`${S - 15},${C} ${S - 25},${C - 5} ${S - 25},${C + 5}`} fill={CY} fillOpacity={0.35} />
        </g>

        {/* Counter-rotating inner ring */}
        <g style={{ transformOrigin: `${C}px ${C}px`, animation: 'hud-rotate-reverse 25s linear infinite' }}>
          <circle cx={C} cy={C} r={42} stroke={CY} strokeWidth={0.4} strokeDasharray="3 9" />
          {[0, 60, 120, 180, 240, 300].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x = C + 42 * Math.cos(rad)
            const y = C + 42 * Math.sin(rad)
            return <circle key={deg} cx={x} cy={y} r={1} fill={CY} fillOpacity={0.5} />
          })}
        </g>

        {/* Small data readouts */}
        <text x={C + 100} y={C - 100} fill={CY} fillOpacity={0.3} fontSize={6}
          fontFamily="'Orbitron', sans-serif" letterSpacing="0.1em">
          POS.01
        </text>
        <text x={C - 130} y={C + 110} fill={CY} fillOpacity={0.3} fontSize={6}
          fontFamily="'Orbitron', sans-serif" letterSpacing="0.1em">
          POS.02
        </text>
        <text x={C + 85} y={C + 105} fill={CY} fillOpacity={0.25} fontSize={5}
          fontFamily="'Orbitron', sans-serif" letterSpacing="0.1em">
          TRACK: ACTIVE
        </text>
      </svg>
    </div>
  )
})
