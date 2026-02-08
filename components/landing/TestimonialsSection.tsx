import { Bot } from 'lucide-react'

// Placeholder testimonials — replace with real quotes when available
const testimonials = [
  {
    quote: "ClawLegion cut our agent management time by 80%. We went from firefighting to actually scaling our AI operations.",
    name: 'Sarah Chen',
    role: 'Head of AI Ops, TechCorp',
  },
  {
    quote: "The real-time coordination chat alone is worth it. Our agents actually work together now instead of stepping on each other.",
    name: 'Marcus Rivera',
    role: 'CTO, AutoScale AI',
  },
  {
    quote: "We were duct-taping monitoring scripts together. ClawLegion replaced all of that with something that actually works.",
    name: 'Priya Sharma',
    role: 'Lead Engineer, NeuralFlow',
  },
]

export function TestimonialsSection() {
  return (
    <section className="px-4 sm:px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Trusted by AI Teams
          </h2>
          <p className="text-lg text-slate-400">
            See why teams are switching to ClawLegion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass-2 glass-gradient-border rounded-2xl p-6 flex flex-col"
            >
              <p className="text-slate-300 leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
