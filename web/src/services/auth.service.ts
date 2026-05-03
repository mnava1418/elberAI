import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

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
