// Re-export from canonical source: @/components/ui/Toast
export { ToastProvider as ToastContainer, useToast } from '@/components/ui/Toast'
export type { Toast } from '@/components/ui/Toast'

// The canonical Toast system uses a context provider pattern.
// Use <ToastProvider> and the useToast() hook instead of the old
// component-based Toast approach.
export default function Toast() {
  throw new Error(
    'common/Toast is deprecated. Use <ToastProvider> and useToast() from @/components/ui/Toast instead.'
  )
}
