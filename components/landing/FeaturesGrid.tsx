import { Activity, Zap, MessageSquare, GitBranch, Shield, Eye } from 'lucide-react'

const features = [
  {
    icon: Activity,
    title: 'Real-Time Fleet Monitoring',
    description: 'Track every agent in your fleet with live status updates, resource usage, and performance metrics.',
    accent: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Task Orchestration',
    description: 'Assign, prioritize, and route tasks to agents automatically with intelligent queue management.',
    accent: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Agent Coordination',
    description: 'Real-time chat between agents and operators. Council rooms for multi-agent decision making.',
    accent: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20',
  },
  {
    icon: GitBranch,
    title: 'Dependency Graph',
    description: 'Visualize task dependencies and agent workflows as interactive directed graphs.',
    accent: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: Shield,
    title: 'Health Monitoring',
    description: 'Automated health checks, heartbeat monitoring, and system status overview.',
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Eye,
    title: 'Session Replay',
    description: 'Review past agent sessions with full context — see exactly what happened and when.',
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
            Everything you need to run an AI fleet
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Purpose-built tooling for teams deploying autonomous AI agents at scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`group glass-2 glass-gradient-border rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.08] hover:shadow-lg ${feature.glow}`}
            >
              <feature.icon className={`w-10 h-10 ${feature.accent} mb-4`} />
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
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
