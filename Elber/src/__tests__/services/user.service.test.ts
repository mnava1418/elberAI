import { deleteProfile } from '../../services/user.service'

jest.mock('@env', () => ({
  BACK_URL: 'http://localhost:4040',
  SOCKET_URL: 'http://localhost:4042',
}))

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(),
  getIdToken: jest.fn(),
}))

jest.mock('../../services/network.service', () => ({
  apiDelete: jest.fn(),
}))

import { getAuth, getIdToken } from '@react-native-firebase/auth'
import { apiDelete } from '../../services/network.service'

const mockCurrentUser = { uid: 'user-123' }

describe('user.service - deleteProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getAuth as jest.Mock).mockReturnValue({ currentUser: mockCurrentUser })
    ;(getIdToken as jest.Mock).mockResolvedValue('mock-firebase-token')
  })

  it('should call apiDelete and return success message', async () => {
    ;(apiDelete as jest.Mock).mockResolvedValue({ response: 'deleted' })

    const result = await deleteProfile()

    expect(apiDelete).toHaveBeenCalledWith(
      expect.stringContaining('/ai/user'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-firebase-token' },
      })
    )
    expect(result).toBe('Listo! Tu perfil se eliminó correctamente.')
  })

  it('should throw when user is not authenticated', async () => {
    ;(getAuth as jest.Mock).mockReturnValue({ currentUser: null })

    await expect(deleteProfile()).rejects.toThrow(
      'No pude eliminar tu perfil. Por favor intenta nuevamente.'
    )
  })

  it('should throw when apiDelete fails', async () => {
    ;(apiDelete as jest.Mock).mockRejectedValue(new Error('Server error'))

    await expect(deleteProfile()).rejects.toThrow(
      'No pude eliminar tu perfil. Por favor intenta nuevamente.'
    )
  })
})
