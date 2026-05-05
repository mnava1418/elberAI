import request from 'supertest'
import admin from 'firebase-admin'

// Mock http-proxy-middleware before app is loaded so routes don't try to proxy
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(
    () => (req: any, res: any, next: any) => res.status(200).json({ proxied: true })
  ),
}))

jest.mock('firebase-admin', () => ({
  __esModule: true,
  default: {
    auth: jest.fn(),
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
  },
}))

jest.mock('../../config/index.config', () => ({
  gateway: { secret: 'test-gateway-secret' },
  paths: {
    auth_services: 'http://auth:4041',
    ai_services: 'http://ai:4042',
    notification_services: 'http://notification:4043',
  },
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4040, host: 'http://localhost:4040' },
  web: { origin: 'http://localhost:3000' },
}))

import app from '../../app'

describe('Routes Integration', () => {
  const mockVerifyIdToken = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(admin.auth as jest.Mock).mockReturnValue({ verifyIdToken: mockVerifyIdToken })
  })

  describe('GET /', () => {
    it('should return the gateway running message', async () => {
      const res = await request(app).get('/')
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('ELBER API Gateway is running!')
    })
  })

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.endPoint).toBe('/apiGateway')
    })
  })

  describe('/auth routes (no auth required)', () => {
    it('should proxy auth requests without validating Firebase token', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'a@b.com' })
      expect(res.status).toBe(200)
      expect(res.body.proxied).toBe(true)
      expect(mockVerifyIdToken).not.toHaveBeenCalled()
    })
  })

  describe('/ai routes (Firebase auth required)', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const res = await request(app).get('/ai/chat')
      expect(res.status).toBe(401)
      expect(res.body.error).toBe('Unauthorized user.')
    })

    it('should return 401 when token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'))

      const res = await request(app)
        .get('/ai/chat')
        .set('Authorization', 'Bearer bad-token')

      await new Promise((r) => setImmediate(r))
      expect(res.status).toBe(401)
    })

    it('should proxy the request when token is valid', async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: 'user-123' })

      const res = await request(app)
        .get('/ai/chat')
        .set('Authorization', 'Bearer valid-token')

      expect(res.status).toBe(200)
      expect(res.body.proxied).toBe(true)
    })
  })

  describe('/notification routes (no auth required)', () => {
    it('should proxy notification requests without Firebase auth', async () => {
      const res = await request(app).post('/notification/email/send').send({ to: 'a@b.com' })
      expect(res.status).toBe(200)
      expect(res.body.proxied).toBe(true)
      expect(mockVerifyIdToken).not.toHaveBeenCalled()
    })
  })
})
