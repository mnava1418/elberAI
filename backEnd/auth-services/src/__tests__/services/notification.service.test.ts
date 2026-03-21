import axios from 'axios'
import jwt from 'jsonwebtoken'
import sendEmail from '../../services/notification.service'

jest.mock('axios')
jest.mock('jsonwebtoken')

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

describe('notification.service - sendEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(jwt.sign as jest.Mock).mockReturnValue('mock-internal-token')
  })

  it('should sign a JWT and POST to the notification service', async () => {
    ;(axios.post as jest.Mock).mockResolvedValue({ status: 200 })

    await sendEmail('/email/requestAccess', { userEmail: 'a@b.com' })

    expect(jwt.sign).toHaveBeenCalledWith({}, 'test-internal-token', { expiresIn: '10m' })
    expect(axios.post).toHaveBeenCalledWith(
      'http://notification:4043/email/requestAccess',
      { userEmail: 'a@b.com' },
      { headers: { Authorization: 'Bearer mock-internal-token' } }
    )
  })

  it('should not throw when axios returns non-200 status', async () => {
    ;(axios.post as jest.Mock).mockResolvedValue({ status: 500 })

    await expect(sendEmail('/email/requestAccess', {})).resolves.not.toThrow()
  })

  it('should not throw when axios rejects', async () => {
    ;(axios.post as jest.Mock).mockRejectedValue(new Error('Network error'))

    await expect(sendEmail('/email/requestAccess', {})).resolves.not.toThrow()
  })
})
