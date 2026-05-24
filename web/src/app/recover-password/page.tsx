'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resetPassword } from '@/services/auth.service'

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const msg = await resetPassword(email)
      setMessage(msg)
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Error al recuperar contraseña'
      setError(text)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-1 overflow-hidden bg-[var(--color-bg)]">
      {/* ── Brand panel ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden hidden md:flex md:flex-1 lg:flex-[1.1] flex-col px-8 lg:px-14 py-10 lg:py-14 border-r border-[var(--color-border)]">
        <span
          aria-hidden
          className="orb"
          style={{
            width: 700,
            height: 700,
            top: '30%',
            left: '30%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.22,
            background:
              'radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)',
          }}
        />
        <span
          aria-hidden
          className="orb"
          style={{
            width: 600,
            height: 600,
            top: '80%',
            left: '80%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.16,
            background:
              'radial-gradient(circle, var(--color-cyan) 0%, var(--color-violet) 35%, transparent 65%)',
          }}
        />

        <div className="relative z-10 flex flex-col h-full">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[var(--color-text)] w-fit">
            <span className="relative inline-block w-9 h-9">
              <Image
                src="/logo-elber.png"
                alt=""
                width={36}
                height={36}
                className="relative z-10"
              />
              <span
                aria-hidden
                className="absolute -inset-2 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)',
                }}
              />
            </span>
            <span
              className="italic text-lg font-medium tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Elber
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center mt-12">
            <h1
              className="text-5xl lg:text-[64px] leading-[0.95] tracking-[-0.03em] font-medium text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              tranquilo,
              <br />
              <span className="italic gradient-text">pasa.</span>
            </h1>
            <p className="mt-5 max-w-[360px] text-base leading-relaxed text-[var(--color-dim)]">
              Mándanos tu correo y te enviamos el link para recuperar tu acceso. En un momento estás de vuelta.
            </p>
          </div>

          <div
            className="text-[11.5px] tracking-wider text-[var(--color-dimmer)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            elber.dev — v1.0
          </div>
        </div>
      </div>

      {/* ── Form panel ─────────────────────────────────────────────── */}
      <div className="relative flex flex-1 items-center justify-center px-5 sm:px-10 py-10 sm:py-14 bg-[var(--color-bg)]">
        <span
          aria-hidden
          className="orb md:hidden"
          style={{
            width: 500,
            height: 500,
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.18,
            background:
              'radial-gradient(circle, var(--color-violet) 0%, var(--color-cyan) 35%, transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full max-w-[380px]">
          {/* Mobile logo */}
          <Link
            href="/"
            className="md:hidden inline-flex items-center gap-2.5 mb-7 text-[var(--color-text)]"
          >
            <span className="relative inline-block w-9 h-9">
              <Image
                src="/logo-elber.png"
                alt=""
                width={36}
                height={36}
                className="relative z-10"
              />
              <span
                aria-hidden
                className="absolute -inset-2 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)',
                }}
              />
            </span>
            <span
              className="italic text-lg font-medium tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Elber
            </span>
          </Link>

          <h2
            className="text-3xl font-medium tracking-[-0.03em] text-[var(--color-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Recuperar{' '}
            <span className="italic text-[var(--color-cyan)]">contraseña</span>
          </h2>
          <p className="mt-2 mb-7 text-sm text-[var(--color-dim)]">
            Te mandamos el link por correo.
          </p>

          {message ? (
            <div
              className="flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-snug"
              style={{
                background: 'rgba(0,230,180,0.07)',
                border: '1px solid rgba(0,230,180,0.2)',
                color: 'var(--color-cyan)',
              }}
            >
              <span className="mt-px">✓</span>
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                placeholder="tu@email.com"
              />

              {error && (
                <div
                  className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm leading-snug"
                  style={{
                    background: 'rgba(255,122,142,0.08)',
                    border: '1px solid rgba(255,122,142,0.2)',
                    color: '#ff7a8e',
                  }}
                >
                  <span className="mt-px">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="gradient-accent mt-2 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-[var(--color-bg)] text-[15px] font-semibold disabled:opacity-70 disabled:cursor-wait hover:opacity-95 transition"
                style={{ boxShadow: '0 10px 36px var(--color-glow)' }}
              >
                {loading ? (
                  <>
                    <span
                      aria-hidden
                      className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent"
                      style={{ animation: 'elber-spin 0.7s linear infinite' }}
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    Recuperar contraseña <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div
            className="mt-8 pt-5 border-t border-[var(--color-border)] text-center text-[11.5px] tracking-wider text-[var(--color-dimmer)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <Link href="/login" className="hover:text-[var(--color-dim)] transition">
              ← volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-xs uppercase tracking-wider text-[var(--color-dim)]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </label>
      <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-2)] transition focus-within:border-[var(--color-cyan)] focus-within:[box-shadow:0_0_0_4px_var(--color-glow-soft)]">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full bg-transparent outline-none text-[15px] text-[var(--color-text)] px-4 py-3.5 placeholder:text-[var(--color-dimmer)]"
        />
      </div>
    </div>
  )
}
