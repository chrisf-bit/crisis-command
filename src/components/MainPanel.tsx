import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypeWriter from './TypeWriter'
import DecisionCard from './DecisionCard'
import Reticle from './hud/Reticle'
import type { Phase } from '../types'
import type { Option, Round } from '../data/gameData'
import { crisisBriefing } from '../data/gameData'

interface MainPanelProps {
  phase: Phase
  round: Round | null
  selectedOption: Option | null
  briefingReady: boolean
  consequenceReady: boolean
  onStartDecisions: () => void
  onDecision: (option: Option) => void
  onContinue: () => void
  onBriefingReady: () => void
  onConsequenceReady: () => void
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

const pageTransition = {
  duration: 0.4,
  ease: [0.33, 1, 0.68, 1] as const,
}

// ── Severity bar for briefing phase ──
function SeverityBar() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth(100), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex items-center gap-4 w-full max-w-md">
      <span className="font-heading text-sm tracking-wider" style={{ color: 'rgba(224,230,240,0.5)' }}>
        SEVERITY
      </span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #00e676, #ffab00, #ff1744)',
            transition: 'width 2s ease-out',
            boxShadow: '0 0 10px rgba(255, 23, 68, 0.4)',
          }}
        />
      </div>
      <span
        className="font-display text-xs font-bold tracking-widest"
        style={{ color: '#ff1744', textShadow: '0 0 8px rgba(255,23,68,0.5)' }}
      >
        CRITICAL
      </span>
    </div>
  )
}

export default function MainPanel({
  phase,
  round,
  selectedOption,
  briefingReady,
  consequenceReady,
  onStartDecisions,
  onDecision,
  onContinue,
  onBriefingReady,
  onConsequenceReady,
}: MainPanelProps) {
  const [promptReady, setPromptReady] = useState(false)

  // Reset prompt state when entering a new decision round
  useEffect(() => {
    if (phase === 'decision') {
      setPromptReady(false)
    }
  }, [phase, round?.id])

  return (
    <div className="flex flex-col items-center justify-center p-6 h-full overflow-hidden relative">
      <Reticle />
      <AnimatePresence mode="wait">
        {/* ═══ BRIEFING ═══ */}
        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center gap-5 max-w-2xl w-full"
          >
            {/* Alert badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="px-5 py-2 rounded-full border border-red-glow/30 bg-red-glow/5"
              style={{ animation: 'flicker 2s ease-in-out infinite' }}
            >
              <span className="font-display text-sm tracking-[0.3em] uppercase text-red-glow">
                ⚠ INCOMING ALERT
              </span>
            </motion.div>

            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-wider text-center text-red-glow">
              <TypeWriter text={crisisBriefing.headline} speed={60} />
            </h2>

            <div
              className="text-center leading-relaxed text-base"
              style={{ color: 'rgba(224, 230, 240, 0.75)' }}
            >
              <TypeWriter
                text={crisisBriefing.body}
                speed={25}
                onComplete={onBriefingReady}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: briefingReady ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex justify-center"
            >
              <SeverityBar />
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: briefingReady ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={onStartDecisions}
              className="btn-pulse mt-2 px-10 py-3 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-sm tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
            >
              RESPOND
            </motion.button>
          </motion.div>
        )}

        {/* ═══ DECISION ═══ */}
        {phase === 'decision' && round && (
          <motion.div
            key={`decision-${round.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center gap-5 w-full"
          >
            {/* Prompt */}
            <div className="text-center max-w-2xl">
              <h2
                className="font-heading text-lg md:text-xl font-semibold leading-relaxed"
                style={{ color: 'rgba(224, 230, 240, 0.9)' }}
              >
                {promptReady ? (
                  round.prompt
                ) : (
                  <TypeWriter text={round.prompt} speed={25} onComplete={() => setPromptReady(true)} />
                )}
              </h2>
            </div>

            {/* ── DECISION CARDS ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: promptReady ? 1 : 0, y: promptReady ? 0 : 12 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full">
                {round.options.map((opt, i) => (
                  <DecisionCard
                    key={opt.id}
                    icon={opt.icon}
                    title={opt.title}
                    description={opt.description}
                    index={i}
                    selected={selectedOption?.id === opt.id}
                    dimmed={!!selectedOption && selectedOption.id !== opt.id}
                    onClick={() => onDecision(opt)}
                    disabled={!!selectedOption}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ CONSEQUENCE ═══ */}
        {phase === 'consequence' && selectedOption && (
          <motion.div
            key={`consequence-${round?.id}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="flex flex-col items-center gap-6 max-w-xl w-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 px-5 py-2 rounded-full border border-cyan-glow/30 bg-cyan-glow/5"
            >
              <span className="text-xl">{selectedOption.icon}</span>
              <span className="font-heading font-bold tracking-wide text-cyan-glow text-base">
                {selectedOption.title}
              </span>
            </motion.div>

            <div
              className="text-center leading-relaxed text-base"
              style={{ color: 'rgba(224, 230, 240, 0.8)' }}
            >
              <TypeWriter
                text={selectedOption.consequence}
                speed={20}
                onComplete={onConsequenceReady}
              />
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: consequenceReady ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              onClick={onContinue}
              className="btn-pulse mt-2 px-10 py-3 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-sm tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
            >
              CONTINUE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
