export interface TutorialStep {
  /** Which HUD panel ref to spotlight (null = center screen, no target) */
  target: 'status' | 'comms' | 'inputs' | 'main' | 'metrics' | null
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
    title: 'Budget Allocation',
    icon: '⚡',
    description: 'Split your crisis budget across four channels. More budget = bigger impact, but others lose out.',
  },
  {
    target: 'main',
    title: 'Decision Theater',
    icon: '🎬',
    description: 'Read briefings, choose responses, and see consequences unfold.',
  },
  {
    target: 'metrics',
    title: 'System Metrics',
    icon: '📊',
    description: 'KPI values update in real time. Switch between RADAR and TRENDS tabs to see overall health or track changes over time.',
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
