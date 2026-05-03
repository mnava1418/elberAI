import type { Metadata } from 'next'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Elber — Tu Asistente Personal de IA',
  description: 'Elber es tu asistente personal de IA con memoria persistente, streaming en tiempo real y búsqueda web integrada.',
  openGraph: {
    title: 'Elber — Tu Asistente Personal de IA',
    description: 'Elber es tu asistente personal de IA con memoria persistente, streaming en tiempo real y búsqueda web integrada.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}
