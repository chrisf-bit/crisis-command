interface FloatingNumberProps {
  value: number
  color: string
  x?: string
  y?: string
}

export default function FloatingNumber({
  value,
  color,
}: FloatingNumberProps) {
  if (value === 0) return null

  const prefix = value > 0 ? '+' : ''

  return (
    <span
      className="float-number inline-block font-display font-bold text-sm"
      style={{
        color,
        textShadow: `0 0 8px ${color}`,
      }}
    >
      {prefix}{value}
    </span>
  )
}
