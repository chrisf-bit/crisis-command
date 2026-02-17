import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GridBackground from './components/GridBackground'
import Particles from './components/Particles'
import Scanlines from './components/Scanlines'
import GlitchText from './components/GlitchText'
import RadarChart from './components/RadarChart'
import HUDLayout from './components/HUDLayout'
import StatusBar from './components/StatusBar'
import CommsFeed from './components/CommsFeed'
import MetricsPanel from './components/MetricsPanel'
import ResourceAllocator from './components/ResourceAllocator'
import MainPanel from './components/MainPanel'
import { TrendCharts } from './components/TrendOverlay'
import { TutorialPrompt, TutorialOverlay } from './components/TutorialOverlay'
import { tutorialSteps } from './data/tutorialData'
import { useResourceAllocator } from './hooks/useResourceAllocator'
import { useCommsFeed } from './hooks/useCommsFeed'
import {
  initialKPIs,
  kpiMeta,
  crisisBriefing,
  rounds,
  profiles,
  getProfile,
  type KPIValues,
  type KPIKey,
  type Option,
} from './data/gameData'
import type { Phase } from './types'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const pageTransition = {
  duration: 0.5,
  ease: [0.33, 1, 0.68, 1] as const,
}

function clampKPI(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function applyMultiplier(baseImpact: number, multiplier: number): number {
  if (baseImpact >= 0) {
    return Math.round(baseImpact * multiplier)
  } else {
    // Invert: higher allocation = better protection (less damage)
    const defenseMultiplier = 2.0 - multiplier
    return Math.round(baseImpact * defenseMultiplier)
  }
}

function getPerformanceBand(value: number): { label: string; color: string } {
  if (value <= 30) return { label: 'Critical', color: '#ff1744' }
  if (value <= 55) return { label: 'At Risk', color: '#ffab00' }
  if (value <= 75) return { label: 'Stable', color: '#00e5ff' }
  return { label: 'Strong', color: '#00e676' }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>('title')
  const [roundIndex, setRoundIndex] = useState(0)
  const [kpis, setKpis] = useState<KPIValues>({ ...initialKPIs })
  const [history, setHistory] = useState<KPIValues[]>([{ ...initialKPIs }])
  const [choices, setChoices] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [impacts, setImpacts] = useState<KPIValues | null>(null)
  const [briefingReady, setBriefingReady] = useState(false)
  const [consequenceReady, setConsequenceReady] = useState(false)
  const [countdownMinutes, setCountdownMinutes] = useState(240)
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const impactKey = useRef(0)

  // Panel refs for tutorial spotlight
  const statusRef = useRef<HTMLDivElement>(null)
  const commsRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)

  const resource = useResourceAllocator()
  const comms = useCommsFeed()

  // Countdown timer — 1 real second = 3 simulated minutes
  useEffect(() => {
    if (phase !== 'briefing' && phase !== 'decision' && phase !== 'consequence') return
    if (countdownMinutes <= 0) return

    const interval = setInterval(() => {
      setCountdownMinutes((prev) => Math.max(0, prev - 3))
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, countdownMinutes])

  // Add comms messages on phase transitions
  const prevPhaseRef = useRef<Phase>('title')
  const prevRoundRef = useRef(0)

  useEffect(() => {
    if (phase === 'briefing' && prevPhaseRef.current !== 'briefing') {
      comms.addMessage('SYSTEM', 'Crisis simulation initiated. Standing by for intel.', 'system')
    }
    if (phase === 'decision' && (prevPhaseRef.current !== 'decision' || roundIndex !== prevRoundRef.current)) {
      const round = rounds[roundIndex]
      comms.addMessage(round.source, round.prompt, 'intel')
    }
    prevPhaseRef.current = phase
    prevRoundRef.current = roundIndex
  }, [phase, roundIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── HANDLERS ──
  function startGame() {
    setShowTutorialPrompt(true)
  }

  function startWithTutorial() {
    setShowTutorialPrompt(false)
    setTutorialStep(0)
    setPhase('briefing')
    setShowTutorial(true)
  }

  function skipTutorial() {
    setShowTutorialPrompt(false)
    setPhase('briefing')
  }

  function handleTutorialNext() {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep((prev) => prev + 1)
    } else {
      setShowTutorial(false)
    }
  }

  function handleTutorialSkip() {
    setShowTutorial(false)
  }

  function startDecisions() {
    comms.addMessage('SECURITY', crisisBriefing.headline, 'alert')
    setPhase('decision')
  }

  function handleDecision(option: Option) {
    setSelectedOption(option)
    resource.lock()

    // Apply multiplied impacts
    const multipliedImpact: KPIValues = {
      reputation: applyMultiplier(option.impact.reputation, resource.getMultiplier('comms')),
      revenue: applyMultiplier(option.impact.revenue, resource.getMultiplier('ops')),
      morale: applyMultiplier(option.impact.morale, resource.getMultiplier('people')),
      regulatory: applyMultiplier(option.impact.regulatory, resource.getMultiplier('it')),
    }

    setImpacts(multipliedImpact)
    impactKey.current++

    const newKpis: KPIValues = {
      reputation: clampKPI(kpis.reputation + multipliedImpact.reputation),
      revenue: clampKPI(kpis.revenue + multipliedImpact.revenue),
      morale: clampKPI(kpis.morale + multipliedImpact.morale),
      regulatory: clampKPI(kpis.regulatory + multipliedImpact.regulatory),
    }
    setKpis(newKpis)
    setHistory((prev) => [...prev, newKpis])
    setChoices((prev) => [...prev, option.id])

    comms.addMessage('COMMAND', `Decision: ${option.title}`, 'system')

    setTimeout(() => {
      setPhase('consequence')
    }, 800)
  }

  function handleConsequenceReady() {
    setConsequenceReady(true)
    if (selectedOption) {
      comms.addMessage('OUTCOME', selectedOption.consequence, 'outcome')
    }
  }

  function handleContinue() {
    setConsequenceReady(false)
    setSelectedOption(null)
    setImpacts(null)
    resource.reset()

    if (roundIndex < rounds.length - 1) {
      setRoundIndex((prev) => prev + 1)
      setPhase('decision')
    } else {
      setPhase('debrief')
    }
  }

  function handleRestart() {
    setPhase('title')
    setRoundIndex(0)
    setKpis({ ...initialKPIs })
    setHistory([{ ...initialKPIs }])
    setChoices([])
    setSelectedOption(null)
    setImpacts(null)
    setBriefingReady(false)
    setConsequenceReady(false)
    setCountdownMinutes(240)
    setShowTutorialPrompt(false)
    setShowTutorial(false)
    setTutorialStep(0)
    resource.reset()
    comms.clear()
  }

  const currentRound = rounds[roundIndex]
  const profile = choices.length === 3 ? profiles[getProfile(choices)] : null

  return (
    <div className="relative w-full h-screen flex flex-col">
      <GridBackground />
      <Particles />
      <Scanlines />

      <AnimatePresence mode="wait">
        {/* ════════ TITLE ════════ */}
        {phase === 'title' && (
          <motion.div
            key="title"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider text-center">
                <GlitchText text="CRISIS COMMAND" className="text-cyan-glow" />
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="font-heading text-xl md:text-2xl tracking-[0.3em] uppercase"
              style={{ color: 'rgba(224, 230, 240, 0.5)' }}
            >
              Leadership Under Fire
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              onClick={startGame}
              className="btn-pulse mt-8 px-10 py-4 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-sm tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
            >
              BEGIN SIMULATION
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="absolute bottom-8 font-body text-xs tracking-wider"
            >
              A LEADERSHIP SIMULATION EXPERIENCE
            </motion.p>
          </motion.div>
        )}

        {/* ════════ HUD (BRIEFING / DECISION / CONSEQUENCE) ════════ */}
        {(phase === 'briefing' || phase === 'decision' || phase === 'consequence') && (
          <motion.div
            key="hud"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 z-10"
          >
            <HUDLayout
              statusRef={statusRef}
              commsRef={commsRef}
              inputsRef={inputsRef}
              mainRef={mainRef}
              metricsRef={metricsRef}
              statusBar={
                <StatusBar
                  round={currentRound.id}
                  totalRounds={rounds.length}
                  roundTitle={currentRound.title}
                  countdownMinutes={countdownMinutes}
                  phase={phase}
                />
              }
              commsFeed={<CommsFeed messages={comms.messages} />}
              inputsPanel={
                <ResourceAllocator
                  allocation={resource.allocation}
                  onAllocate={resource.handleSliderChange}
                  locked={resource.locked}
                  getMultiplier={resource.getMultiplier}
                  budgetRemaining={resource.budgetRemaining}
                />
              }
              metricsPanel={
                <MetricsPanel
                  kpis={kpis}
                  impacts={impacts}
                  impactKey={impactKey.current}
                  history={history}
                />
              }
            >
              <MainPanel
                phase={phase}
                round={currentRound}
                selectedOption={selectedOption}
                briefingReady={briefingReady}
                consequenceReady={consequenceReady}
                onStartDecisions={startDecisions}
                onDecision={handleDecision}
                onContinue={handleContinue}
                onBriefingReady={() => setBriefingReady(true)}
                onConsequenceReady={handleConsequenceReady}
              />
            </HUDLayout>
          </motion.div>
        )}

        {/* ════════ DEBRIEF ════════ */}
        {phase === 'debrief' && (
          <motion.div
            key="debrief"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-8"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-center">
                  <GlitchText text="SIMULATION COMPLETE" className="text-cyan-glow" />
                </h1>
              </motion.div>

              {/* Main content — radar + scores + trend */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Radar chart with historical overlays */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <RadarChart values={kpis} size={240} history={history.slice(0, -1)} />
                  </motion.div>

                  {/* Final scores */}
                  <div className="flex flex-col gap-4">
                    {(Object.keys(kpiMeta) as KPIKey[]).map((key, i) => {
                      const band = getPerformanceBand(kpis[key])
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                          className="flex items-center gap-4"
                        >
                          <span
                            className="font-display text-3xl font-black w-16 text-right"
                            style={{ color: kpiMeta[key].color }}
                          >
                            {kpis[key]}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-heading text-sm tracking-wider" style={{ color: 'rgba(224,230,240,0.6)' }}>
                              {kpiMeta[key].label}
                            </span>
                            <span
                              className="font-display text-xs font-bold tracking-widest uppercase"
                              style={{ color: band.color }}
                            >
                              {band.label}
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* Trend charts — one per KPI */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  <TrendCharts history={history} />
                </motion.div>
              </div>

              {/* Profile */}
              {profile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                  className="text-center max-w-lg px-6 py-5 rounded-xl border border-cyan-glow/20 bg-cyan-glow/5"
                >
                  <h3
                    className="font-display text-lg font-bold tracking-wider mb-2"
                    style={{ color: '#00e5ff', textShadow: '0 0 10px rgba(0,229,255,0.3)' }}
                  >
                    {profile.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(224, 230, 240, 0.65)' }}
                  >
                    {profile.description}
                  </p>
                </motion.div>
              )}

              {/* Decision timeline */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="flex items-center gap-2 md:gap-4"
              >
                {choices.map((choiceId, i) => {
                  const round = rounds[i]
                  const option = round.options.find((o) => o.id === choiceId)
                  if (!option) return null
                  return (
                    <div key={choiceId} className="flex items-center gap-2 md:gap-4">
                      {i > 0 && (
                        <div className="w-8 md:w-16 h-px bg-cyan-glow/20" />
                      )}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{option.icon}</span>
                        <span
                          className="font-heading text-xs tracking-wider text-center"
                          style={{ color: 'rgba(224,230,240,0.5)' }}
                        >
                          {option.title}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </motion.div>

              {/* Restart */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.5 }}
                onClick={handleRestart}
                className="btn-pulse px-10 py-3 rounded-lg border border-cyan-glow/50 bg-cyan-glow/10 font-display text-sm tracking-[0.2em] uppercase text-cyan-glow cursor-pointer hover:bg-cyan-glow/20 transition-colors"
              >
                RESTART SIMULATION
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial prompt — overlays title screen */}
      <AnimatePresence>
        {showTutorialPrompt && (
          <TutorialPrompt onTutorial={startWithTutorial} onSkip={skipTutorial} />
        )}
      </AnimatePresence>

      {/* Tutorial overlay — spotlights HUD panels */}
      {showTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          panelRefs={{ status: statusRef, comms: commsRef, inputs: inputsRef, main: mainRef, metrics: metricsRef }}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
        />
      )}
    </div>
  )
}
