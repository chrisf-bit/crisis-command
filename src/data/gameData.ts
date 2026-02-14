export interface KPIValues {
  reputation: number
  revenue: number
  morale: number
  regulatory: number
}

export interface Option {
  id: string
  icon: string
  title: string
  description: string
  impact: KPIValues
  consequence: string
}

export interface Round {
  id: number
  title: string
  prompt: string
  source: string
  options: Option[]
}

export const initialKPIs: KPIValues = {
  reputation: 72,
  revenue: 85,
  morale: 68,
  regulatory: 60,
}

export const kpiMeta = {
  reputation: { label: 'Reputation', color: '#00e5ff' },
  revenue: { label: 'Revenue Impact', color: '#00e676' },
  morale: { label: 'Staff Morale', color: '#ffab00' },
  regulatory: { label: 'Regulatory Standing', color: '#b388ff' },
} as const

export type KPIKey = keyof typeof kpiMeta

export const crisisBriefing = {
  headline: 'MAJOR DATA BREACH DETECTED',
  body: 'At 03:47 GMT, your security team detected unauthorized access to customer databases. Early estimates suggest 2.3 million records may be compromised. The breach is still active. News outlets are beginning to ask questions.',
}

export const rounds: Round[] = [
  {
    id: 1,
    title: 'FIRST RESPONSE',
    source: 'CISO',
    prompt:
      'Your CISO is on the line. How do you respond in the first 30 minutes?',
    options: [
      {
        id: '1a',
        icon: '🔒',
        title: 'Lock It Down',
        description:
          'Immediately shut down all external-facing systems. Maximum containment, but operations halt.',
        impact: { reputation: 8, revenue: -15, morale: 5, regulatory: 10 },
        consequence:
          'Systems go dark within minutes. Customers see maintenance pages. Your security team gains full control of the environment. Operations grind to a halt — but the bleeding stops. The board is notified. The clock is ticking.',
      },
      {
        id: '1b',
        icon: '🎯',
        title: 'Surgical Strike',
        description:
          'Isolate only the compromised servers. Keep most services running while the team investigates.',
        impact: { reputation: 3, revenue: -5, morale: -5, regulatory: 2 },
        consequence:
          "Your team works through the night to isolate affected segments. Most customer-facing services stay online. But the investigation is slower — and there's a nagging risk you haven't found everything yet. Staff are anxious.",
      },
      {
        id: '1c',
        icon: '👁️',
        title: 'Monitor & Trace',
        description:
          "Keep systems running but deploy honeypots. Try to identify the attackers before they know you're onto them.",
        impact: { reputation: -10, revenue: 2, morale: -10, regulatory: -8 },
        consequence:
          "The honeypots are deployed. Your threat intelligence team begins tracking the intruders' movements. But every minute the breach remains active, more data leaks. Your legal counsel is deeply uncomfortable. The risk is enormous.",
      },
    ],
  },
  {
    id: 2,
    title: 'COMMUNICATIONS',
    source: 'PR TEAM',
    prompt:
      "A journalist from the Financial Times has the story. They're publishing in 90 minutes. What's your public response?",
    options: [
      {
        id: '2a',
        icon: '📢',
        title: 'Get Ahead Of It',
        description:
          'Issue a full public statement before the article drops. Transparent, detailed, accountable.',
        impact: { reputation: 12, revenue: -8, morale: 8, regulatory: 15 },
        consequence:
          'Your statement hits the wire 45 minutes before the FT article. The narrative is yours. Customers appreciate the candour. Regulators note your proactive disclosure. The stock dips, but analysts call it "well-managed."',
      },
      {
        id: '2b',
        icon: '🤝',
        title: 'Controlled Release',
        description:
          'Brief the journalist directly. Give them an exclusive with your side of the story.',
        impact: { reputation: 5, revenue: -3, morale: 0, regulatory: 5 },
        consequence:
          "The FT runs a balanced piece. Your quotes feature prominently. Other outlets pick it up but the tone is measured. It's not a victory — but it's not a disaster either. The board appreciates the tactical approach.",
      },
      {
        id: '2c',
        icon: '🤐',
        title: 'Say Nothing Yet',
        description:
          'Wait until you have the full picture. Prepare a comprehensive response for after market close.',
        impact: { reputation: -15, revenue: -2, morale: -8, regulatory: -12 },
        consequence:
          'The FT article drops. It\'s devastating. "Company refuses to comment on massive data breach." Social media erupts. Your silence is interpreted as guilt. Regulators issue a formal inquiry notice within hours.',
      },
    ],
  },
  {
    id: 3,
    title: 'THE BOARD CALL',
    source: 'BOARD',
    prompt:
      'Emergency board meeting. The chair wants accountability and a recovery plan. What do you present?',
    options: [
      {
        id: '3a',
        icon: '⚖️',
        title: 'Full Accountability',
        description:
          'Accept responsibility, present root cause analysis, propose a £20M security overhaul with external audit.',
        impact: { reputation: 10, revenue: -12, morale: 10, regulatory: 12 },
        consequence:
          'The room falls silent as you take personal responsibility. Then the chair nods. "This is leadership." The £20M commitment is approved unanimously. Your team feels supported. The market respects the decisive action.',
      },
      {
        id: '3b',
        icon: '🛡️',
        title: 'Blame & Contain',
        description:
          'Frame this as a sophisticated state-level attack. Emphasise that no system is impervious. Propose modest security uplift.',
        impact: { reputation: -5, revenue: 5, morale: -12, regulatory: -8 },
        consequence:
          'Some board members buy it. Others exchange glances. Your CISO looks uncomfortable — they know the real vulnerabilities. Staff morale plummets as rumours of scapegoating spread. The modest budget is approved, but trust erodes.',
      },
      {
        id: '3c',
        icon: '🚀',
        title: 'Strategic Pivot',
        description:
          'Use the crisis as a catalyst. Propose accelerating your digital transformation roadmap with security at its core.',
        impact: { reputation: 6, revenue: -8, morale: 3, regulatory: 6 },
        consequence:
          "A bold play. The board is intrigued. You paint a picture of a more resilient, modern organisation emerging from this crisis. It's ambitious and the timeline is aggressive — but it gives everyone something to rally behind.",
      },
    ],
  },
]

export type ProfileKey = 'steady' | 'disruptor' | 'pragmatist'

export const profiles: Record<
  ProfileKey,
  { title: string; description: string }
> = {
  steady: {
    title: 'The Steady Hand',
    description:
      'You prioritised trust and transparency, even at a cost. In a crisis, people follow leaders who tell the truth.',
  },
  disruptor: {
    title: 'The Disruptor',
    description:
      'You saw crisis as opportunity and moved fast. Bold decisions carry bold risks — but fortune favours the brave.',
  },
  pragmatist: {
    title: 'The Pragmatist',
    description:
      'You balanced competing pressures with calculated trade-offs. Not every decision was popular, but each was deliberate.',
  },
}

export function getProfile(choices: string[]): ProfileKey {
  const cautious = ['1a', '2a', '3a']
  const bold = ['1c', '2c', '3b']

  let cautiousCount = 0
  let boldCount = 0

  choices.forEach((c) => {
    if (cautious.includes(c)) cautiousCount++
    if (bold.includes(c)) boldCount++
  })

  if (cautiousCount >= 2) return 'steady'
  if (boldCount >= 2) return 'disruptor'
  return 'pragmatist'
}
