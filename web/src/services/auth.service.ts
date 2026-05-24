import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { BACK_URL } from '@/lib/constants'

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    if (!userCredential.user.emailVerified) {
      throw new Error('¡No has validado tu email carnalito! Echale un vistazo a tu bandeja de entrada.')
    }
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      throw new Error('¡Uy papá! Esos datos están más chuecos que un trompo.')
    }
    throw new Error(error.message || 'Error al iniciar sesión')
  }
}

export const logOut = async () => {
  try {
    if (auth.currentUser) {
      await signOut(auth)
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    throw new Error('Error al cerrar sesión.')
  }
}

export const resetPassword = async (email: string): Promise<string> => {
  const res = await fetch(`${BACK_URL}/auth/user/resetPassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al recuperar contraseña')
  return data.message
}

export const requestAccess = async (email: string): Promise<string> => {
  const res = await fetch(`${BACK_URL}/auth/access/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al solicitar acceso')
  return data.message
}

export const validateAccessCode = async (
  email: string,
  accessCode: string
): Promise<{ isValid: boolean; message: string }> => {
  const res = await fetch(`${BACK_URL}/auth/access/validateCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, accessCode }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al validar el código')
  return data
}

export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<{ registered: boolean; message: string }> => {
  const res = await fetch(`${BACK_URL}/auth/user/signUp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error al registrar cuenta')
  return data
}
