'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { requestAccess, validateAccessCode, signUp } from '@/services/auth.service'

const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/

type Step = 1 | 2 | 3 | 4

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const clearError = () => setError('')

  // ── Step 1: request access ───────────────────────────────────
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setLoading(true)
    try {
      await requestAccess(email)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al solicitar acceso')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: validate code ────────────────────────────────────
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (code.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos.')
      return
    }
    setLoading(true)
    try {
      const res = await validateAccessCode(email, code)
      if (!res.isValid) {
        setError(res.message || 'Código inválido.')
        return
      }
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al validar el código')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: create account ───────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (!name.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    if (!PASSWORD_RE.test(password)) {
      setError('El password debe tener al menos 8 caracteres, incluyendo letras y números.')
      return
    }
    if (password !== confirmPassword) {
      setError('Los passwords no coinciden.')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, name.trim())
      setStep(4)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const leftHeadings: Record<Step, { title: string; accent: string; body: string }> = {
    1: {
      title: 'únete a',
      accent: 'elber.',
      body: 'Empieza con tu correo. Te mandamos un código para verificar que eres tú.',
    },
    2: {
      title: 'revisa tu',
      accent: 'correo.',
      body: 'Te enviamos un código de 6 dígitos. Ingrésalo para continuar.',
    },
    3: {
      title: 'casi',
      accent: 'listo.',
      body: 'Elige tu nombre y contraseña. Después de esto ya eres parte.',
    },
    4: {
      title: '¡ya',
      accent: 'estás!',
      body: 'Revisa tu bandeja de entrada para verificar tu correo y luego inicia sesión.',
    },
  }

  const { title, accent, body } = leftHeadings[step]

  return (
    <div className="relative flex flex-1 overflow-hidden bg-[var(--color-bg)]">
      {/* ── Brand panel ──────────────────────────────────────── */}
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
              <Image src="/logo-elber.png" alt="" width={36} height={36} className="relative z-10" />
              <span
                aria-hidden
                className="absolute -inset-2 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)' }}
              />
            </span>
            <span className="italic text-lg font-medium tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Elber
            </span>
          </Link>

          <div className="flex-1 flex flex-col justify-center mt-12">
            <h1
              className="text-5xl lg:text-[64px] leading-[0.95] tracking-[-0.03em] font-medium text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
              <br />
              <span className="italic gradient-text">{accent}</span>
            </h1>
            <p className="mt-5 max-w-[360px] text-base leading-relaxed text-[var(--color-dim)]">{body}</p>

            {/* Step indicator */}
            <div className="mt-10 flex items-center gap-2">
              {([1, 2, 3] as const).map((s) => (
                <span
                  key={s}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: step >= s ? 28 : 8,
                    background: step > s
                      ? 'var(--color-dim)'
                      : step === s
                      ? 'var(--color-cyan)'
                      : 'var(--color-border)',
                  }}
                />
              ))}
            </div>
          </div>

          <div
            className="text-[11.5px] tracking-wider text-[var(--color-dimmer)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            elber.dev — v1.0
          </div>
        </div>
      </div>

      {/* ── Form panel ───────────────────────────────────────── */}
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
          <Link href="/" className="md:hidden inline-flex items-center gap-2.5 mb-7 text-[var(--color-text)]">
            <span className="relative inline-block w-9 h-9">
              <Image src="/logo-elber.png" alt="" width={36} height={36} className="relative z-10" />
              <span
                aria-hidden
                className="absolute -inset-2 rounded-full"
                style={{ background: 'radial-gradient(circle, var(--color-glow) 0%, transparent 70%)' }}
              />
            </span>
            <span className="italic text-lg font-medium tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Elber
            </span>
          </Link>

          {step === 1 && <StepEmail email={email} setEmail={setEmail} loading={loading} error={error} onSubmit={handleRequestAccess} />}
          {step === 2 && <StepCode code={code} setCode={setCode} loading={loading} error={error} onSubmit={handleValidateCode} onBack={() => { setStep(1); clearError() }} />}
          {step === 3 && <StepAccount name={name} setName={setName} password={password} setPassword={setPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} loading={loading} error={error} onSubmit={handleSignUp} />}
          {step === 4 && <StepWelcome name={name} />}

          {step !== 4 && (
            <div
              className="mt-8 pt-5 border-t border-[var(--color-border)] text-center text-[11.5px] tracking-wider text-[var(--color-dimmer)]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              ¿ya tienes cuenta?{' '}
              <Link href="/login" className="hover:text-[var(--color-dim)] transition">
                inicia sesión →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Step components ──────────────────────────────────────────────

function StepEmail({
  email, setEmail, loading, error, onSubmit,
}: {
  email: string
  setEmail: (v: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <>
      <h2
        className="text-3xl font-medium tracking-[-0.03em] text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Solicitar <span className="italic text-[var(--color-cyan)]">acceso</span>
      </h2>
      <p className="mt-2 mb-7 text-sm text-[var(--color-dim)]">Ingresa tu correo para empezar.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} placeholder="tu@email.com" />
        <ErrorBox message={error} />
        <SubmitButton loading={loading} label="Solicitar acceso" loadingLabel="Enviando..." />
      </form>
    </>
  )
}

function StepCode({
  code, setCode, loading, error, onSubmit, onBack,
}: {
  code: string
  setCode: (v: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}) {
  const handleCodeChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 6)
    setCode(digits)
  }

  return (
    <>
      <h2
        className="text-3xl font-medium tracking-[-0.03em] text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Código de <span className="italic text-[var(--color-cyan)]">acceso</span>
      </h2>
      <p className="mt-2 mb-7 text-sm text-[var(--color-dim)]">Revisaste tu bandeja de entrada, ¿verdad?</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          id="code"
          label="Código (6 dígitos)"
          type="text"
          autoComplete="one-time-code"
          value={code}
          onChange={handleCodeChange}
          placeholder="123456"
          inputMode="numeric"
        />
        <ErrorBox message={error} />
        <SubmitButton loading={loading} label="Validar código" loadingLabel="Validando..." />
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[var(--color-dim)] hover:text-[var(--color-text)] transition text-center"
        >
          ← cambiar email
        </button>
      </form>
    </>
  )
}

function StepAccount({
  name, setName, password, setPassword, confirmPassword, setConfirmPassword,
  loading, error, onSubmit,
}: {
  name: string
  setName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <>
      <h2
        className="text-3xl font-medium tracking-[-0.03em] text-[var(--color-text)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Crear <span className="italic text-[var(--color-cyan)]">cuenta</span>
      </h2>
      <p className="mt-2 mb-7 text-sm text-[var(--color-dim)]">Ya casi. Elige tu nombre y contraseña.</p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field id="name" label="Nombre" type="text" autoComplete="name" value={name} onChange={setName} placeholder="¿Cómo te llamas?" maxLength={30} />
        <Field id="password" label="Contraseña" type="password" autoComplete="new-password" value={password} onChange={setPassword} placeholder="mín. 8 chars, letras y números" />
        <Field id="confirm-password" label="Confirmar contraseña" type="password" autoComplete="new-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
        <ErrorBox message={error} />
        <SubmitButton loading={loading} label="Crear cuenta" loadingLabel="Creando cuenta..." />
      </form>
    </>
  )
}

function StepWelcome({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2
          className="text-3xl font-medium tracking-[-0.03em] text-[var(--color-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ¡Bienvenido,{' '}
          <span className="italic text-[var(--color-cyan)]">{name}!</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-dim)]">
          Ya estás registrado. Échale un ojo al mensajito que te mandamos y regresa conmigo para iniciar sesión. ¡Te veo pronto!
        </p>
      </div>

      <div
        className="flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm leading-snug"
        style={{
          background: 'rgba(0,230,180,0.07)',
          border: '1px solid rgba(0,230,180,0.2)',
          color: 'var(--color-cyan)',
        }}
      >
        <span className="mt-px">✓</span>
        <span>Revisa tu bandeja de entrada para verificar tu correo antes de iniciar sesión.</span>
      </div>

      <Link
        href="/login"
        className="gradient-accent inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-[var(--color-bg)] text-[15px] font-semibold hover:opacity-95 transition"
        style={{ boxShadow: '0 10px 36px var(--color-glow)' }}
      >
        Ir al login <span>→</span>
      </Link>
    </div>
  )
}

// ── Shared UI ────────────────────────────────────────────────────

function Field({
  id, label, type, value, onChange, placeholder, autoComplete, maxLength, inputMode,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
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
          maxLength={maxLength}
          inputMode={inputMode}
          required
          className="w-full bg-transparent outline-none text-[15px] text-[var(--color-text)] px-4 py-3.5 placeholder:text-[var(--color-dimmer)]"
        />
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm leading-snug"
      style={{
        background: 'rgba(255,122,142,0.08)',
        border: '1px solid rgba(255,122,142,0.2)',
        color: '#ff7a8e',
      }}
    >
      <span className="mt-px">⚠</span>
      <span>{message}</span>
    </div>
  )
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
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
          {loadingLabel}
        </>
      ) : (
        <>
          {label} <span>→</span>
        </>
      )}
    </button>
  )
}
