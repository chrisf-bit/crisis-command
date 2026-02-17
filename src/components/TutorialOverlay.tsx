import { useState, useEffect, useCallback, useRef, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tutorialSteps, type TutorialStep } from '../data/tutorialData'

// ── Panel ref map type ──
export type PanelRefs = {
  status: RefObject<HTMLDivElement | null>
  comms: RefObject<HTMLDivElement | null>
  inputs: RefObject<HTMLDivElement | null>
  main: RefObject<HTMLDivElement | null>
  metrics: RefObject<HTMLDivElement | null>
}

// ═══════════════════════════════════════════════
//  Tutorial Prompt — shown over title screen
// ═══════════════════════════════════════════════
interface TutorialPromptProps {
  onTutorial: () => void
  onSkip: () => void
}

export function TutorialPrompt({ onTutorial, onSkip }: TutorialPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(10,14,23,0.85)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col items-center gap-6 px-10 py-8 rounded-xl border border-cyan-glow/30 bg-[rgba(10,14,23,0.95)]"
        style={{ boxShadow: '0 0 40px rgba(0,229,255,0.1), inset 0 1px 0 rgba(0,229,255,0.1)' }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">🎮</span>
          <h2
            className="font-display text-xl font-bold tracking-[0.2em] uppercase"
            style={{ color: '#00e5ff', textShadow: '0 0 12px rgba(0,229,255,0.4)' }}
          >
            FIRST TIME?
          </h2>
          <p className="font-body text-sm text-center" style={{ color: 'rgba(224,230,240,0.5)' }}>
            Get a quick tour of the command interface
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onTutorial}
            className="btn-pulse px-8 py-3 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-sm tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
          >
            SHOW ME AROUND
          </button>
          <button
            onClick={onSkip}
            className="px-8 py-3 rounded-lg border border-white/10 bg-white/[0.03] font-display text-sm tracking-[0.2em] uppercase cursor-pointer hover:border-white/20 hover:bg-white/[0.06] transition-colors"
            style={{ color: 'rgba(224,230,240,0.5)' }}
          >
            JUMP STRAIGHT IN
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════
//  Tutorial Overlay — spotlight + tooltip
// ═══════════════════════════════════════════════
interface TutorialOverlayProps {
  step: number
  panelRefs: PanelRefs
  onNext: () => void
  onSkip: () => void
}

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function TutorialOverlay({ step, panelRefs, onNext, onSkip }: TutorialOverlayProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  const [ready, setReady] = useState(false)
  const currentStep: TutorialStep = tutorialSteps[step]
  const isLast = step === tutorialSteps.length - 1

  const measureTarget = useCallback(() => {
    if (!currentStep.target) {
      setRect(null)
      return
    }
    const ref = panelRefs[currentStep.target]
    if (!ref?.current) {
      setRect(null)
      return
    }
    const el = ref.current
    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [currentStep.target, panelRefs])

  // Measure on mount and step change (delay on first step to let HUD animate in)
  const hasSettled = useRef(false)
  useEffect(() => {
    if (!hasSettled.current) {
      // Wait for HUD entrance animation (500ms) before first measurement
      const timer = setTimeout(() => {
        hasSettled.current = true
        measureTarget()
        setReady(true)
      }, 550)
      return () => clearTimeout(timer)
    }
    measureTarget()
  }, [measureTarget])

  // Re-measure on resize
  useEffect(() => {
    window.addEventListener('resize', measureTarget)
    return () => window.removeEventListener('resize', measureTarget)
  }, [measureTarget])

  // Tooltip positioning
  const tooltipStyle = (): React.CSSProperties => {
    if (!rect) {
      // Center of screen for null-target steps
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const pad = 16
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Prefer placing below, then above, then right, then left
    if (rect.top + rect.height + pad + 180 < vh) {
      // Below
      return {
        position: 'fixed',
        top: rect.top + rect.height + pad,
        left: Math.max(pad, Math.min(vw - 340, centerX - 160)),
      }
    }
    if (rect.top - pad - 180 > 0) {
      // Above
      return {
        position: 'fixed',
        top: rect.top - pad - 160,
        left: Math.max(pad, Math.min(vw - 340, centerX - 160)),
      }
    }
    if (rect.left + rect.width + pad + 320 < vw) {
      // Right
      return {
        position: 'fixed',
        top: Math.max(pad, Math.min(vh - 200, centerY - 80)),
        left: rect.left + rect.width + pad,
      }
    }
    // Left
    return {
      position: 'fixed',
      top: Math.max(pad, Math.min(vh - 200, centerY - 80)),
      left: Math.max(pad, rect.left - pad - 320),
    }
  }

  if (!ready) return null

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: 'auto' }}>
      {/* Dimming backdrop with spotlight cutout via clip-path */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(10,14,23,0.82)',
          clipPath: rect
            ? `polygon(
                0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
                ${rect.left}px ${rect.top}px,
                ${rect.left}px ${rect.top + rect.height}px,
                ${rect.left + rect.width}px ${rect.top + rect.height}px,
                ${rect.left + rect.width}px ${rect.top}px,
                ${rect.left}px ${rect.top}px
              )`
            : undefined,
        }}
      />

      {/* Spotlight glow border */}
      {rect && (
        <div
          className="absolute pointer-events-none rounded-lg"
          style={{
            top: rect.top - 2,
            left: rect.left - 2,
            width: rect.width + 4,
            height: rect.height + 4,
            border: '2px solid rgba(0,229,255,0.5)',
            boxShadow: '0 0 20px rgba(0,229,255,0.2), inset 0 0 20px rgba(0,229,255,0.05)',
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={{ ...tooltipStyle(), maxWidth: 320 }}
          className="flex flex-col gap-3 px-6 py-5 rounded-xl border border-cyan-glow/30 bg-[rgba(10,14,23,0.95)]"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentStep.icon}</span>
              <h3
                className="font-display text-base font-bold tracking-[0.15em] uppercase"
                style={{ color: '#00e5ff', textShadow: '0 0 8px rgba(0,229,255,0.3)' }}
              >
                {currentStep.title}
              </h3>
            </div>
            <span
              className="font-display text-xs tracking-wider"
              style={{ color: 'rgba(224,230,240,0.3)' }}
            >
              {step + 1}/{tutorialSteps.length}
            </span>
          </div>

          <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(224,230,240,0.7)' }}>
            {currentStep.description}
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onSkip}
              className="font-display text-xs tracking-[0.15em] uppercase cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: 'rgba(224,230,240,0.3)' }}
            >
              SKIP TOUR
            </button>
            <button
              onClick={onNext}
              className="px-5 py-2 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-xs tracking-[0.15em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
            >
              {isLast ? 'BEGIN' : 'NEXT'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
