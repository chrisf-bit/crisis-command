interface SparklineProps {
  data: number[]
  color: string
  width?: number
  height?: number
}

export default function Sparkline({ data, color, width = 80, height = 20 }: SparklineProps) {
  if (data.length < 2) return null

  const padX = 3
  const padY = 3
  const innerW = width - padX * 2
  const innerH = height - padY * 2

  const points = data.map((v, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + ((100 - v) / 100) * innerH,
  }))

  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padY} L ${points[0].x},${height - padY} Z`
  const last = points[points.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mt-0.5">
      {/* Area fill */}
      <path
        d={areaD}
        fill={color}
        opacity="0.1"
      />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
      {/* End dot */}
      <circle
        cx={last.x}
        cy={last.y}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}
