'use client'

import { useState } from 'react'
import { Play, Maximize2, X } from 'lucide-react'

export function DemoSection() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const VideoContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div className={`${fullscreen ? '' : 'glass-3 rounded-2xl overflow-hidden'} relative group`}>
      <div className={`${fullscreen ? 'w-full h-full' : 'aspect-video'} flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative cursor-pointer`}>
        {/* Placeholder — replace with actual video/embed */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          {/* Fake browser chrome */}
          <div className={`${fullscreen ? 'w-[90%] h-[85%]' : 'w-[85%] h-[80%]'} glass-2 rounded-xl overflow-hidden border border-white/[0.06]`}>
            <div className="h-8 bg-slate-800/80 flex items-center px-3 gap-2 border-b border-white/[0.04]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-3 py-0.5 rounded bg-slate-700/50 text-[10px] text-slate-400">
                  app.clawlegion.com/dashboard
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center h-[calc(100%-2rem)]">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-20">🤖</div>
                <p className="text-sm text-slate-600">Dashboard Screenshot</p>
              </div>
            </div>
          </div>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full bg-blue-600/90 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>

        {/* Expand button */}
        {!fullscreen && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFullscreen(true)
            }}
            className="absolute top-3 right-3 z-20 p-2 glass-2 rounded-lg text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            title="View fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <section id="demo" className="px-4 sm:px-6 py-24 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Watch It Work
            </h2>
            <p className="text-lg text-slate-400">
              See how AI Legion coordinates a real multi-agent task from start to finish.
            </p>
          </div>

          <VideoContent />

          <p className="text-center text-sm text-slate-500 mt-4">
            2-minute walkthrough of the AI Legion dashboard
          </p>
        </div>
      </section>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-[110] p-3 glass-2 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-[95vw] h-[90vh]">
            <VideoContent fullscreen />
          </div>
        </div>
      )}
    </>
  )
}
