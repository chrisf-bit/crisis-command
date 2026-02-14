import { useAnimatedNumber } from '../hooks/useAnimatedNumber'

interface KPIGaugeProps {
  label: string
  value: number
  color: string
  size?: number
}

export default function KPIGauge({
  label,
  value,
  color,
  size = 120,
}: KPIGaugeProps) {
  const animatedValue = useAnimatedNumber(value)
  const clampedValue = Math.max(0, Math.min(100, animatedValue))

  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius // semi-circle
  const offset = circumference - (clampedValue / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size / 2 + 16}
        viewBox={`0 0 ${size} ${size / 2 + 16}`}
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.33, 1, 0.68, 1)',
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
        {/* Value text */}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          fill={color}
          fontSize="26"
          fontFamily="'Orbitron', sans-serif"
          fontWeight="700"
        >
          {animatedValue}
        </text>
      </svg>
      <span
        className="text-sm font-heading tracking-wider uppercase"
        style={{ color: 'rgba(224, 230, 240, 0.6)' }}
      >
        {label}
      </span>
    </div>
  )
}
