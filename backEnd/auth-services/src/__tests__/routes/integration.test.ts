import request from 'supertest'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken')

jest.mock('../../services/auth.service', () => ({
  requestAccess: jest.fn(),
  reviewAccess: jest.fn(),
  validateAccessCode: jest.fn(),
  generateToken: jest.fn().mockReturnValue('mock-token'),
  getRequestStatus: jest.fn(),
}))

jest.mock('../../services/user.service', () => ({
  signUp: jest.fn(),
  resetPassword: jest.fn(),
}))

jest.mock('../../services/notification.service', () => jest.fn().mockResolvedValue(undefined))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    database: jest.fn(),
    auth: jest.fn(),
  },
}))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

import app from '../../app'
import * as authService from '../../services/auth.service'
import * as userService from '../../services/user.service'

const GATEWAY_SECRET = 'test-gateway-secret'

describe('Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/health')
        .set('x-api-gateway-secret', GATEWAY_SECRET)

      expect(res.status).toBe(200)
      expect(res.body.endPoint).toBe('/auth')
    })
  })

  describe('proxy_validate middleware', () => {
    it('should return 403 when gateway secret is missing', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(403)
    })

    it('should return 403 when gateway secret is wrong', async () => {
      const res = await request(app)
        .get('/health')
        .set('x-api-gateway-secret', 'wrong-secret')
      expect(res.status).toBe(403)
    })
  })

  describe('POST /access/request', () => {
    it('should return 200 with message', async () => {
      ;(authService.requestAccess as jest.Mock).mockResolvedValue({
        status: 'pending',
        message: 'Tu solicitud está en la fila.',
      })

      const res = await request(app)
        .post('/access/request')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Tu solicitud está en la fila.')
    })

    it('should return 500 on service error', async () => {
      ;(authService.requestAccess as jest.Mock).mockRejectedValue(new Error('DB error'))

      const res = await request(app)
        .post('/access/request')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(500)
    })
  })

  describe('POST /access/validateCode', () => {
    it('should return 200 with validation result', async () => {
      ;(authService.validateAccessCode as jest.Mock).mockResolvedValue({ isValid: true, message: '' })

      const res = await request(app)
        .post('/access/validateCode')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'user@test.com', accessCode: '123456' })

      expect(res.status).toBe(200)
      expect(res.body.isValid).toBe(true)
    })
  })

  describe('GET /access/review', () => {
    it('should return 401 when token query param is missing', async () => {
      const res = await request(app)
        .get('/access/review')
        .set('x-api-gateway-secret', GATEWAY_SECRET)

      expect(res.status).toBe(401)
    })

    it('should return 200 when token is valid', async () => {
      ;(jwt.verify as jest.Mock).mockReturnValue({ email: 'user@test.com', isApproved: true })
      ;(authService.reviewAccess as jest.Mock).mockResolvedValue(undefined)

      const res = await request(app)
        .get('/access/review?token=valid-token')
        .set('x-api-gateway-secret', GATEWAY_SECRET)

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Revisión de acceso completada.')
    })

    it('should return 401 when token is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token')
      })

      const res = await request(app)
        .get('/access/review?token=bad-token')
        .set('x-api-gateway-secret', GATEWAY_SECRET)

      expect(res.status).toBe(401)
    })
  })

  describe('POST /user/signUp', () => {
    it('should return 200 on successful signUp', async () => {
      ;(userService.signUp as jest.Mock).mockResolvedValue({ registered: true, message: '' })

      const res = await request(app)
        .post('/user/signUp')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'new@test.com', password: 'Passw0rd!', displayName: 'New User' })

      expect(res.status).toBe(200)
      expect(res.body.registered).toBe(true)
    })

    it('should return 500 on signUp error', async () => {
      ;(userService.signUp as jest.Mock).mockRejectedValue(new Error('Firebase error'))

      const res = await request(app)
        .post('/user/signUp')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'new@test.com', password: 'Passw0rd!', displayName: 'New User' })

      expect(res.status).toBe(500)
    })
  })

  describe('POST /user/resetPassword', () => {
    it('should return 200 with message', async () => {
      ;(userService.resetPassword as jest.Mock).mockResolvedValue('Revisa tu correo.')

      const res = await request(app)
        .post('/user/resetPassword')
        .set('x-api-gateway-secret', GATEWAY_SECRET)
        .send({ email: 'user@test.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toBe('Revisa tu correo.')
    })
  })
})
