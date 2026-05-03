'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import useUserStore from '@/store/useUserStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        useUserStore.getState().logIn({
          name: user.displayName ?? user.email ?? '',
          email: user.email ?? '',
        })
        if (pathname === '/login') {
          router.replace('/chat')
        }
      } else {
        useUserStore.getState().logOut()
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  return <>{children}</>
}
