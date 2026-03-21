import request from 'supertest'
import jwt from 'jsonwebtoken'
import * as emailService from '../../services/email.service'

jest.mock('jsonwebtoken')
jest.mock('../../services/email.service')

jest.mock('../../config/index.config', () => ({
  email: {
    cred: '/fake/creds.json',
    from: 'admin@test.com',
    newsletter: 'newsletter@test.com',
    newsletterMembers: ['member1@test.com', 'member2@test.com'],
  },
  auth: { token: 'test-secret' },
  server: { port: 4043 },
}))

import app from '../../app'

const AUTH_HEADER = 'Bearer test-token'

describe('Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(jwt.verify as jest.Mock).mockReturnValue({ uid: 'user-123' })
    ;(emailService.sendEmail as jest.Mock).mockResolvedValue(undefined)
  })

  describe('GET /', () => {
    it('should return the running message', async () => {
      const res = await request(app).get('/').set('Authorization', AUTH_HEADER)
      expect(res.status).toBe(200)
      expect(res.body.message).toBe('ELBER Notification Services is running!')
    })
  })

  describe('GET /health', () => {
    it('should return health status without auth token', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.endPoint).toBe('/notification')
    })
  })

  describe('Auth middleware', () => {
    it('should return 403 when no authorization header is present', async () => {
      const res = await request(app)
        .post('/email/send')
        .send({ to: 'a@b.com', subject: 'Hi', message: 'test' })
      expect(res.status).toBe(403)
      expect(res.body.error).toBe('Invalid Call.')
    })

    it('should return 403 when token is invalid', async () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token')
      })
      const res = await request(app)
        .post('/email/send')
        .set('Authorization', 'Bearer bad-token')
        .send({ to: 'a@b.com', subject: 'Hi', message: 'test' })
      expect(res.status).toBe(403)
    })
  })

  describe('POST /email/requestAccess', () => {
    it('should send 2 emails and return result true', async () => {
      const res = await request(app)
        .post('/email/requestAccess')
        .set('Authorization', AUTH_HEADER)
        .send({ userEmail: 'user@test.com', approveURL: 'http://approve', rejectURL: 'http://reject' })

      expect(res.status).toBe(200)
      expect(res.body.result).toBe(true)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(2)
    })
  })

  describe('POST /email/accessResponse', () => {
    it('should send approval email and return result true', async () => {
      const res = await request(app)
        .post('/email/accessResponse')
        .set('Authorization', AUTH_HEADER)
        .send({ email: 'user@test.com', isApproved: true, accessCode: 1234 })

      expect(res.status).toBe(200)
      expect(res.body.result).toBe(true)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    })

    it('should send rejection email', async () => {
      const res = await request(app)
        .post('/email/accessResponse')
        .set('Authorization', AUTH_HEADER)
        .send({ email: 'user@test.com', isApproved: false, accessCode: null })

      expect(res.status).toBe(200)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /email/verifyAccount', () => {
    it('should send verify email and return result true', async () => {
      const res = await request(app)
        .post('/email/verifyAccount')
        .set('Authorization', AUTH_HEADER)
        .send({ email: 'user@test.com', name: 'Ana', link: 'http://verify' })

      expect(res.status).toBe(200)
      expect(res.body.result).toBe(true)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /email/resetPassword', () => {
    it('should send password reset email and return result true', async () => {
      const res = await request(app)
        .post('/email/resetPassword')
        .set('Authorization', AUTH_HEADER)
        .send({ email: 'user@test.com', recoverLink: 'http://recover' })

      expect(res.status).toBe(200)
      expect(res.body.result).toBe(true)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST /email/send', () => {
    it('should send to a regular email address', async () => {
      const res = await request(app)
        .post('/email/send')
        .set('Authorization', AUTH_HEADER)
        .send({ to: 'regular@test.com', subject: 'Hello', message: 'Test body' })

      expect(res.status).toBe(200)
      expect(res.body.result).toBe(true)
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'regular@test.com' })
      )
    })

    it('should expand newsletter address to member list', async () => {
      const res = await request(app)
        .post('/email/send')
        .set('Authorization', AUTH_HEADER)
        .send({ to: 'newsletter@test.com', subject: 'News', message: 'Content' })

      expect(res.status).toBe(200)
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'member1@test.com,member2@test.com' })
      )
    })
  })
})
