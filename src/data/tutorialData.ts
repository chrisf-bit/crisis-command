export interface TutorialStep {
  /** Which HUD panel ref to spotlight (null = center screen, no target) */
  target: 'status' | 'comms' | 'inputs' | 'main' | 'kpi' | null
  title: string
  description: string
  icon: string
}

export const tutorialSteps: TutorialStep[] = [
  {
    target: 'status',
    title: 'Mission Control',
    icon: '🎯',
    description: 'Track the current round, phase, and countdown timer.',
  },
  {
    target: 'comms',
    title: 'Comms Feed',
    icon: '📡',
    description: 'Incoming intel, alerts, and outcomes from your team.',
  },
  {
    target: 'inputs',
    title: 'Power Allocation',
    icon: '⚡',
    description: 'Drag dials to focus resources — higher allocation amplifies impact.',
  },
  {
    target: 'main',
    title: 'Decision Theater',
    icon: '🎬',
    description: 'Read briefings, choose responses, and see consequences unfold.',
  },
  {
    target: 'kpi',
    title: 'System Metrics',
    icon: '📊',
    description: 'Four KPIs track organisational health. Watch for impact numbers.',
  },
  {
    target: 'inputs',
    title: 'Resource Strategy',
    icon: '🔗',
    description: 'IT → Regulatory, Comms → Reputation, Ops → Revenue, People → Morale.',
  },
  {
    target: null,
    title: 'Command Ready',
    icon: '🚀',
    description: 'You have the conn. Good luck, Commander.',
  },
]
