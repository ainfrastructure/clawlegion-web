import { Bot, ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 landing-grid-bg" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-sm font-medium text-blue-300">Private Beta — Now Open</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
          Command Your
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            AI Fleet
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          The control plane for autonomous AI agents. Monitor, coordinate, and manage
          your AI workforce from a single command center.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#early-access"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25 text-base"
          >
            Request Early Access
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="#demo"
            className="px-8 py-4 glass-2 hover:bg-white/[0.08] text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-base"
          >
            <Play className="w-5 h-5" />
            Watch Demo
          </a>
        </div>

        {/* Social proof hint */}
        <div className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-950 flex items-center justify-center"
              >
                <Bot className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
          <span>Join 50+ teams in the private beta</span>
        </div>
      </div>
    </section>
  )
}
