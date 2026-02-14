import { motion } from 'framer-motion'

interface DecisionCardProps {
  icon: string
  title: string
  description: string
  index: number
  selected: boolean
  dimmed: boolean
  onClick: () => void
  disabled: boolean
}

export default function DecisionCard({
  icon,
  title,
  description,
  index,
  selected,
  dimmed,
  onClick,
  disabled,
}: DecisionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: dimmed ? 0.2 : 1,
        y: 0,
        scale: selected ? 1.05 : 1,
      }}
      transition={{
        delay: index * 0.12,
        duration: 0.5,
        ease: [0.33, 1, 0.68, 1],
      }}
      onClick={onClick}
      disabled={disabled}
      className={`
        decision-card relative flex flex-col items-center gap-3
        px-6 py-6 rounded-xl border cursor-pointer text-center
        w-full max-w-[280px]
        ${
          selected
            ? 'border-cyan-glow bg-cyan-glow/10 shadow-[0_0_30px_rgba(0,229,255,0.2)]'
            : 'border-white/10 bg-white/[0.03] hover:border-cyan-glow/40 hover:bg-cyan-glow/[0.05] hover:shadow-[0_0_20px_rgba(0,229,255,0.1)]'
        }
        ${disabled && !selected ? 'pointer-events-none' : ''}
      `}
    >
      <span className="text-4xl">{icon}</span>
      <h3
        className="font-heading font-bold text-xl tracking-wide"
        style={{ color: selected ? '#00e5ff' : '#e0e6f0' }}
      >
        {title}
      </h3>
      <p className="text-base leading-relaxed" style={{ color: 'rgba(224,230,240,0.6)' }}>
        {description}
      </p>
    </motion.button>
  )
}
