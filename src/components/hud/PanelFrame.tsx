import { useRef, useState, useEffect, memo } from 'react'

interface PanelFrameProps {
  variant?: 'default' | 'status' | 'resource'
  label?: string
  sublabel?: string
}

const CY = '#00e5ff'

function makeTicks(start: number, end: number, minor: number, major: number) {
  const ticks: { pos: number; isMajor: boolean }[] = []
  for (let p = start; p < end; p += minor) {
    ticks.push({ pos: p, isMajor: (p - start) % major < minor })
  }
  return ticks
}

export default memo(function PanelFrame({
  variant = 'default',
  label,
  sublabel,
}: PanelFrameProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize({
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w, h } = size
  if (w === 0 || h === 0) return <div ref={ref} className="absolute inset-0 pointer-events-none" />

  const isFlat = variant === 'status' || variant === 'resource'
  const cs = isFlat ? 14 : 26 // corner bracket size
  const csInner = Math.round(cs * 0.6)
  const pad = cs + 14
  const minorTick = 18
  const majorTick = 72

  const topT = makeTicks(pad, w - pad, minorTick, majorTick)
  const botT = makeTicks(pad, w - pad, minorTick, majorTick)
  const leftT = makeTicks(pad, h - pad, minorTick, majorTick)
  const rightT = makeTicks(pad, h - pad, minorTick, majorTick)

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        className="absolute inset-0"
      >
        {/* ═══ CORNER BRACKETS ═══ */}
        {/* Top-left */}
        <g>
          <path d={`M 1,${cs} L 1,1 L ${cs},1`} stroke={CY} strokeOpacity={0.5} strokeWidth={1.5} />
          <path d={`M 5,${csInner} L 5,5 L ${csInner},5`} stroke={CY} strokeOpacity={0.2} strokeWidth={0.75} />
          <circle cx={2} cy={2} r={1.5} fill={CY} fillOpacity={0.8} />
          <line x1={0} y1={cs + 5} x2={6} y2={cs + 5} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
          <line x1={cs + 5} y1={0} x2={cs + 5} y2={6} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
        </g>
        {/* Top-right */}
        <g>
          <path d={`M ${w - 1},${cs} L ${w - 1},1 L ${w - cs},1`} stroke={CY} strokeOpacity={0.5} strokeWidth={1.5} />
          <path d={`M ${w - 5},${csInner} L ${w - 5},5 L ${w - csInner},5`} stroke={CY} strokeOpacity={0.2} strokeWidth={0.75} />
          <circle cx={w - 2} cy={2} r={1.5} fill={CY} fillOpacity={0.8} />
          <line x1={w} y1={cs + 5} x2={w - 6} y2={cs + 5} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
          <line x1={w - cs - 5} y1={0} x2={w - cs - 5} y2={6} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
        </g>
        {/* Bottom-left */}
        <g>
          <path d={`M 1,${h - cs} L 1,${h - 1} L ${cs},${h - 1}`} stroke={CY} strokeOpacity={0.5} strokeWidth={1.5} />
          <path d={`M 5,${h - csInner} L 5,${h - 5} L ${csInner},${h - 5}`} stroke={CY} strokeOpacity={0.2} strokeWidth={0.75} />
          <circle cx={2} cy={h - 2} r={1.5} fill={CY} fillOpacity={0.8} />
          <line x1={0} y1={h - cs - 5} x2={6} y2={h - cs - 5} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
          <line x1={cs + 5} y1={h} x2={cs + 5} y2={h - 6} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
        </g>
        {/* Bottom-right */}
        <g>
          <path d={`M ${w - 1},${h - cs} L ${w - 1},${h - 1} L ${w - cs},${h - 1}`} stroke={CY} strokeOpacity={0.5} strokeWidth={1.5} />
          <path d={`M ${w - 5},${h - csInner} L ${w - 5},${h - 5} L ${w - csInner},${h - 5}`} stroke={CY} strokeOpacity={0.2} strokeWidth={0.75} />
          <circle cx={w - 2} cy={h - 2} r={1.5} fill={CY} fillOpacity={0.8} />
          <line x1={w} y1={h - cs - 5} x2={w - 6} y2={h - cs - 5} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
          <line x1={w - cs - 5} y1={h} x2={w - cs - 5} y2={h - 6} stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
        </g>

        {/* ═══ EDGE TICK MARKS ═══ */}
        {topT.map(({ pos, isMajor }, i) => (
          <line key={`t${i}`} x1={pos} y1={0} x2={pos} y2={isMajor ? 8 : 4}
            stroke={CY} strokeOpacity={isMajor ? 0.25 : 0.1} strokeWidth={isMajor ? 0.8 : 0.5} />
        ))}
        {botT.map(({ pos, isMajor }, i) => (
          <line key={`b${i}`} x1={pos} y1={h} x2={pos} y2={h - (isMajor ? 8 : 4)}
            stroke={CY} strokeOpacity={isMajor ? 0.25 : 0.1} strokeWidth={isMajor ? 0.8 : 0.5} />
        ))}
        {!isFlat && leftT.map(({ pos, isMajor }, i) => (
          <line key={`l${i}`} x1={0} y1={pos} x2={isMajor ? 8 : 4} y2={pos}
            stroke={CY} strokeOpacity={isMajor ? 0.25 : 0.1} strokeWidth={isMajor ? 0.8 : 0.5} />
        ))}
        {!isFlat && rightT.map(({ pos, isMajor }, i) => (
          <line key={`r${i}`} x1={w} y1={pos} x2={w - (isMajor ? 8 : 4)} y2={pos}
            stroke={CY} strokeOpacity={isMajor ? 0.25 : 0.1} strokeWidth={isMajor ? 0.8 : 0.5} />
        ))}

        {/* ═══ EDGE LINES ═══ */}
        <line x1={cs + 2} y1={0.5} x2={w - cs - 2} y2={0.5}
          stroke={CY} strokeOpacity={0.12} strokeWidth={0.5} />
        <line x1={cs + 2} y1={h - 0.5} x2={w - cs - 2} y2={h - 0.5}
          stroke={CY} strokeOpacity={0.08} strokeWidth={0.5} />
        {!isFlat && (
          <>
            <line x1={0.5} y1={cs + 2} x2={0.5} y2={h - cs - 2}
              stroke={CY} strokeOpacity={0.08} strokeWidth={0.5} />
            <line x1={w - 0.5} y1={cs + 2} x2={w - 0.5} y2={h - cs - 2}
              stroke={CY} strokeOpacity={0.08} strokeWidth={0.5} />
          </>
        )}

        {/* ═══ DATA LABELS ═══ */}
        {label && (
          <text
            x={cs + 14}
            y={isFlat ? 10 : 16}
            fill={CY}
            fillOpacity={0.25}
            fontSize={7}
            fontFamily="'Orbitron', sans-serif"
            letterSpacing="0.15em"
          >
            {label}
          </text>
        )}
        {sublabel && (
          <text
            x={w - cs - 14}
            y={h - (isFlat ? 5 : 8)}
            fill={CY}
            fillOpacity={0.15}
            fontSize={6}
            fontFamily="'Orbitron', sans-serif"
            letterSpacing="0.1em"
            textAnchor="end"
          >
            {sublabel}
          </text>
        )}

        {/* ═══ ANIMATED PULSE DOT — travels along top edge ═══ */}
        {!isFlat && (
          <circle r={1.5} fill={CY}>
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path={`M ${pad},1 L ${w - pad},1`}
            />
            <animate
              attributeName="opacity"
              values="0.7;0.15;0.7"
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* ═══ CORNER ACCENT DOTS (mid-edge) ═══ */}
        <circle cx={w / 2} cy={1} r={1} fill={CY} fillOpacity={0.35} />
        <circle cx={w / 2} cy={h - 1} r={1} fill={CY} fillOpacity={0.2} />
        {!isFlat && (
          <>
            <circle cx={1} cy={h / 2} r={1} fill={CY} fillOpacity={0.2} />
            <circle cx={w - 1} cy={h / 2} r={1} fill={CY} fillOpacity={0.2} />
          </>
        )}
      </svg>
    </div>
  )
})
