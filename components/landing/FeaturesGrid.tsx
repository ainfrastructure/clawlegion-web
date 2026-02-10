import { Pencil, Code2, LayoutDashboard, Workflow, HeartPulse, Film } from 'lucide-react'

const features = [
  {
    icon: Pencil,
    title: 'Launch a blog post while you sleep',
    description: 'One agent researches, another writes, another designs the header, another schedules it. You wake up to a published post.',
    accent: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Code2,
    title: 'Ship code without a standup',
    description: 'Agents plan, build, test, and open PRs — coordinating like a dev team, minus the meetings.',
    accent: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Know what\'s happening in 3 seconds',
    description: 'Live dashboard shows every agent\'s status, current task, and what needs your attention. One glance.',
    accent: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20',
  },
  {
    icon: Workflow,
    title: 'Your workflow, your rules',
    description: 'Drag-and-drop pipeline builder. Pick which agents do what, in what order. Customize everything.',
    accent: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: HeartPulse,
    title: 'Nothing breaks without you knowing',
    description: 'Health monitoring, heartbeat checks, automatic alerts. If an agent stutters, you know before it matters.',
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Film,
    title: 'Full receipts on everything',
    description: 'Session replay shows every decision, every tool call, every result. Total transparency — no black boxes.',
    accent: 'text-pink-400',
    glow: 'group-hover:shadow-pink-500/20',
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
