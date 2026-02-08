import { Upload, Settings, Monitor } from 'lucide-react'

const steps = [
  {
    icon: Upload,
    title: 'Deploy Your Agents',
    description: 'Connect your AI agents using our lightweight SDK. Supports any framework.',
    step: '01',
  },
  {
    icon: Settings,
    title: 'Configure Your Fleet',
    description: 'Set up task queues, health checks, and coordination channels from the dashboard.',
    step: '02',
  },
  {
    icon: Monitor,
    title: 'Command & Monitor',
    description: 'Watch your fleet execute tasks in real-time. Intervene when needed, let them run when not.',
    step: '03',
  },
]

export function HowItWorks() {
  return (
    <section className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Up and running in minutes
          </h2>
          <p className="text-lg text-slate-400">
            Three steps from zero to a fully monitored AI fleet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px border-t border-dashed border-white/[0.1]" />

          {steps.map((step) => (
            <div key={step.step} className="relative text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-3 mb-6 relative z-10">
                <step.icon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-xs font-mono text-blue-400/60 mb-2">{step.step}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
