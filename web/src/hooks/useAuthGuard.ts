'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useUserStore from '@/store/useUserStore'

export default function useAuthGuard() {
  const router = useRouter()
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login')
    }
  }, [isLoggedIn, router])
}
