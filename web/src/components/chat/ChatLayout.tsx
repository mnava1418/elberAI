'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'

export default function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden bg-[var(--color-bg)]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Chat area */}
      <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
    </div>
  )
}
