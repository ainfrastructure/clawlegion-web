import { Coffee, Code2, Monitor, Network, ShieldCheck, PlayCircle } from 'lucide-react'

const features = [
  {
    icon: Coffee,
    title: 'Done before your coffee\'s ready',
    description: 'Your research agent finds trending topics at 3 AM, your writer drafts, your designer creates the header, and your publisher schedules it — all while you sleep.',
    accent: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Code2,
    title: 'Your dev team never sleeps',
    description: 'One agent writes the code, another reviews it, another runs tests, another opens the PR. Monday morning: three features merged, zero meetings held.',
    accent: 'text-red-400',
    glow: 'group-hover:shadow-red-500/20',
  },
  {
    icon: Monitor,
    title: 'One screen. Whole company.',
    description: 'See which agents are working, what they\'ve finished, and what needs your call — like a CEO dashboard for your AI workforce.',
    accent: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20',
  },
  {
    icon: Network,
    title: 'Design the org chart yourself',
    description: 'Drag agents into pipelines, set who reports to whom, define triggers and handoffs. Your operations, your playbook.',
    accent: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'Problems fix themselves at 2 AM',
    description: 'Heartbeat monitoring, auto-recovery, and instant alerts. If an agent stalls, the system reroutes before you even notice.',
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: PlayCircle,
    title: 'Replay any decision, any time',
    description: 'Full session logs show every tool call, every choice, every output. Scrub through your agents\' work like game tape.',
    accent: 'text-red-400',
    glow: 'group-hover:shadow-red-500/20',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="px-4 sm:px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            What does that actually look like?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real scenarios. Real results. No buzzwords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group glass-2 glass-gradient-border rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg ${feature.glow}`}
            >
              <div className="flex justify-center mb-4">
                <feature.icon className={`w-10 h-10 ${feature.accent}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 text-center">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed text-center">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Mid-section CTA */}
        <div className="text-center mt-16">
          <p className="text-xl font-semibold text-white mb-4">
            All of this for just <span className="text-blue-400">$49/mo</span>
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/25 text-sm shimmer-btn"
          >
            See Pricing
          </a>
        </div>
      </div>
    </section>
  )
}
