import { Activity, Zap, MessageSquare, GitBranch, Shield, Eye } from 'lucide-react'

const features = [
  {
    icon: Activity,
    title: 'Live Agent Dashboard',
    description: 'See every agent working in real time. Monitor progress, catch issues, and track what your workforce is doing — all in one view.',
    accent: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Smart Task Routing',
    description: 'Drop tasks in, the right agent picks them up. Automatic prioritization, parallel execution, and retry on failure.',
    accent: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Agent-to-Agent Chat',
    description: 'Agents coordinate with each other — passing context, handing off work, and making decisions together without you in the loop.',
    accent: 'text-green-400',
    glow: 'group-hover:shadow-green-500/20',
  },
  {
    icon: GitBranch,
    title: 'Visual Flow Builder',
    description: 'Drag, drop, done. Create custom workflows, define your own agents, and wire them together however you want.',
    accent: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20',
  },
  {
    icon: Shield,
    title: 'Bring Your Own Keys',
    description: 'Use your own API keys from any LLM provider. You control the models, the costs, and the data. No vendor lock-in.',
    accent: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20',
  },
  {
    icon: Eye,
    title: 'Full Session Replay',
    description: 'Every agent action is logged. Replay any session, audit decisions, and understand exactly what happened and why.',
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
            Your command center for autonomous AI
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Build custom agents, design unique workflows, and let them run — you just watch the results come in.
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
