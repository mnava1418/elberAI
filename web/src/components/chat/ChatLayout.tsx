'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile top bar */}
        <div className="flex items-center px-4 py-3 md:hidden border-b border-[var(--color-secondary)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--color-subtitle)] hover:text-[var(--color-text)]"
            aria-label="Abrir menú"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
        </div>

        <ChatWindow />
      </div>
    </div>
  )
}
