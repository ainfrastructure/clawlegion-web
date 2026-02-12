'use client'

import { Modal } from '@/components/ui/Modal'
import { useContactForm } from '@/hooks/useContactForm'
import { CheckCircle } from 'lucide-react'

type ContactModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { name, setName, email, setEmail, message, setMessage, status, errorMessage, handleSubmit, reset } = useContactForm()

  const handleClose = () => {
    reset()
    onClose()
  }

  if (status === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Message Sent" size="md">
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-slate-300 mb-2">Thanks for reaching out!</p>
          <p className="text-sm text-slate-500">We&apos;ll get back to you as soon as possible.</p>
          <button
            onClick={handleClose}
            className="mt-6 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Contact Us" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-slate-300 mb-1.5">
            Name
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium text-slate-300 mb-1.5">
            Message
          </label>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            required
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 bg-slate-800 border border-white/[0.06] rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 transition-colors resize-none"
          />
          <p className="text-xs text-slate-600 mt-1 text-right">{message.length}/2000</p>
        </div>

        {status === 'error' && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </span>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </Modal>
  )
}
