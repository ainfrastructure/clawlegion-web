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

            {/* Dashboard screenshot */}
            <div className="aspect-video relative overflow-hidden bg-slate-950">
              <img
                src="/demo-poster.jpg"
                alt="AI Legion dashboard — multi-agent coordination interface"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
