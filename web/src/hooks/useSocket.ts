'use client'

import { useEffect } from 'react'
import SocketManager from '@/services/socket.service'

export default function useSocket() {
  useEffect(() => {
    SocketManager.getInstance().connect()
    return () => SocketManager.getInstance().disconnect()
  }, [])
}
