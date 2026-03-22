import {
  requestAccess,
  validateAccessCode,
  signUp,
  resetPassword,
  signIn,
  logOut,
} from '../../services/auth.service'

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}))

jest.mock('../../services/network.service', () => ({
  apiPost: jest.fn(),
}))

jest.mock('../../models/Socket.model', () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn().mockReturnValue({ disconnect: jest.fn() }),
  },
}))

jest.mock('../../store/actions/user.actions', () => ({
  logOutUser: jest.fn().mockReturnValue({ type: 'LOG_OUT' }),
}))

jest.mock('../../store/actions/elber.actions', () => ({
  logOutElber: jest.fn().mockReturnValue({ type: 'LOG_OUT' }),
}))

jest.mock('../../store/actions/chat.actions', () => ({
  logOutChat: jest.fn().mockReturnValue({ type: 'LOG_OUT' }),
}))

import { getAuth, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth'
import { apiPost } from '../../services/network.service'
import SocketModel from '../../models/Socket.model'

const mockDisconnect = jest.fn()
const mockCurrentUser = { uid: 'user-123', emailVerified: true }

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser })
    ;(SocketModel.getInstance as jest.Mock).mockReturnValue({ disconnect: mockDisconnect })
  })

  describe('requestAccess', () => {
    it('should return message on success', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ message: 'Tu solicitud fue recibida.' })

      const result = await requestAccess('user@test.com')

      expect(apiPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/access/request'),
        { email: 'user@test.com' }
      )
      expect(result).toBe('Tu solicitud fue recibida.')
    })

    it('should throw on apiPost failure', async () => {
      ;(apiPost as jest.Mock).mockRejectedValue(new Error('Server error'))

      await expect(requestAccess('user@test.com')).rejects.toThrow(
        'Error al solicitar acceso para user@test.com'
      )
    })
  })

  describe('validateAccessCode', () => {
    it('should return isValid and message on success', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ isValid: true, message: '' })

      const result = await validateAccessCode('user@test.com', '123456')

      expect(apiPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/access/validateCode'),
        { email: 'user@test.com', accessCode: '123456' }
      )
      expect(result).toEqual({ isValid: true, message: '' })
    })

    it('should return isValid false with message on invalid code', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ isValid: false, message: 'Código inválido' })

      const result = await validateAccessCode('user@test.com', '000000')

      expect(result.isValid).toBe(false)
      expect(result.message).toBe('Código inválido')
    })

    it('should throw on failure', async () => {
      ;(apiPost as jest.Mock).mockRejectedValue(new Error('Error'))

      await expect(validateAccessCode('user@test.com', '111')).rejects.toThrow(
        'Error al validar código de acceso para user@test.com'
      )
    })
  })

  describe('signUp', () => {
    it('should return registered result on success', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ registered: true, message: '' })

      const result = await signUp('user@test.com', 'Passw0rd!', 'Martin')

      expect(apiPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/user/signUp'),
        { email: 'user@test.com', password: 'Passw0rd!', displayName: 'Martin' }
      )
      expect(result.registered).toBe(true)
    })

    it('should return registered false with message when not approved', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ registered: false, message: 'Not approved yet' })

      const result = await signUp('user@test.com', 'Passw0rd!', 'Martin')

      expect(result.registered).toBe(false)
      expect(result.message).toBe('Not approved yet')
    })

    it('should throw on apiPost failure', async () => {
      ;(apiPost as jest.Mock).mockRejectedValue(new Error('Server error'))

      await expect(signUp('user@test.com', 'Passw0rd!', 'Martin')).rejects.toThrow(
        'Error al crear cuenta.'
      )
    })
  })

  describe('resetPassword', () => {
    it('should return message on success', async () => {
      ;(apiPost as jest.Mock).mockResolvedValue({ message: 'Revisa tu correo.' })

      const result = await resetPassword('user@test.com')

      expect(apiPost).toHaveBeenCalledWith(
        expect.stringContaining('/auth/user/resetPassword'),
        { email: 'user@test.com' }
      )
      expect(result).toBe('Revisa tu correo.')
    })

    it('should throw on failure', async () => {
      ;(apiPost as jest.Mock).mockRejectedValue(new Error('Error'))

      await expect(resetPassword('user@test.com')).rejects.toThrow(
        'Error al solicitar recuperación de password.'
      )
    })
  })

  describe('signIn', () => {
    it('should sign in successfully when email is verified', async () => {
      ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { emailVerified: true },
      })

      await expect(signIn('user@test.com', 'Passw0rd!')).resolves.not.toThrow()

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'user@test.com',
        'Passw0rd!'
      )
    })

    it('should throw when email is not verified', async () => {
      ;(signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
        user: { emailVerified: false },
      })

      await expect(signIn('user@test.com', 'Passw0rd!')).rejects.toThrow(
        'No has validado tu email'
      )
    })

    it('should throw friendly message on invalid credentials', async () => {
      const error = { code: 'auth/invalid-credential' }
      ;(signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error)

      await expect(signIn('user@test.com', 'wrongpass')).rejects.toThrow('chuecos')
    })

    it('should rethrow original message on other errors', async () => {
      const error = { message: 'Too many requests' }
      ;(signInWithEmailAndPassword as jest.Mock).mockRejectedValue(error)

      await expect(signIn('user@test.com', 'Passw0rd!')).rejects.toThrow('Too many requests')
    })
  })

  describe('logOut', () => {
    it('should disconnect socket, sign out, and dispatch actions', async () => {
      ;(signOut as jest.Mock).mockResolvedValue(undefined)
      const dispatch = jest.fn()

      await logOut(dispatch)

      expect(mockDisconnect).toHaveBeenCalled()
      expect(signOut).toHaveBeenCalled()
      expect(dispatch).toHaveBeenCalledTimes(3)
    })

    it('should do nothing when no current user', async () => {
      ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })
      const dispatch = jest.fn()

      await logOut(dispatch)

      expect(mockDisconnect).not.toHaveBeenCalled()
      expect(dispatch).not.toHaveBeenCalled()
    })

    it('should throw when signOut fails', async () => {
      ;(signOut as jest.Mock).mockRejectedValue(new Error('Sign out error'))
      const dispatch = jest.fn()

      await expect(logOut(dispatch)).rejects.toThrow('Error al cerrar sesión.')
    })
  })
})
