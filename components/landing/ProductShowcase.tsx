import { Bot } from 'lucide-react'

export function ProductShowcase() {
  return (
    <section className="relative px-4 sm:px-6 pb-24 mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="animate-float">
          {/* Browser frame */}
          <div className="glass-3 rounded-2xl overflow-hidden glow-blue">
            {/* Chrome bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="glass-1 rounded-md px-3 py-1 text-xs text-slate-500 text-center max-w-md mx-auto">
                  app.clawlegion.com/dashboard
                </div>
              </div>
            </div>

            {/* Screenshot placeholder */}
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
              <div className="text-center">
                <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm">Dashboard Screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
