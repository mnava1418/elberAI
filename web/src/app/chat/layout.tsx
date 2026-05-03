'use client'

import useAuthGuard from '@/hooks/useAuthGuard'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  useAuthGuard()
  return <>{children}</>
}
