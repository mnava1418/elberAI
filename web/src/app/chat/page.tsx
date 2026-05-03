'use client'

import { logOut } from '@/services/auth.service'

export default function ChatPage() {
  const handleLogOut = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-zinc-400 dark:text-zinc-500">
      <p>Chat coming soon</p>
      <button
        onClick={handleLogOut}
        className="rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
