"use client"

import { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <main className={`max-w-[1920px] mx-auto px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </main>
  )
}
