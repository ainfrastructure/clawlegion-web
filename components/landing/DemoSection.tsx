import { Play } from 'lucide-react'

export function DemoSection() {
  return (
    <section id="demo" className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            See it in action
          </h2>
          <p className="text-lg text-slate-400">
            Watch how ClawLegion coordinates a multi-agent task execution.
          </p>
        </div>

        {/* Video placeholder */}
        <div className="glass-3 rounded-2xl overflow-hidden">
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative group cursor-pointer">
            {/* Play button */}
            <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          2-minute walkthrough of the ClawLegion dashboard
        </p>
      </div>
    </section>
  )
}
