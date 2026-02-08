export function LogoBar() {
  return (
    <section className="px-4 sm:px-6 py-16 border-t border-white/[0.04] border-b border-b-white/[0.04]">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-8">
          Powering agent fleets at
        </p>
        <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-8 rounded bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
