// Minimal layout for login - no sidebar, no chat
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  )
}
