import { Request, Response } from 'express'
import * as userController from '../../controllers/user.controller'

jest.mock('../../services/user.service', () => ({
  signUp: jest.fn(),
  resetPassword: jest.fn(),
}))

jest.mock('../../config/index.config', () => ({
  firebase: { cred: '/fake/path', db: 'https://test.db' },
  server: { port: 4041, host: 'http://localhost:4041', gateway: 'http://gateway:4040' },
  auth: { token: 'test-jwt-token', internal: 'test-internal-token' },
  notification: { url: 'http://notification:4043', email: { from: 'test@test.com' } },
  gateway: { secret: 'test-gateway-secret' },
}))

import * as userService from '../../services/user.service'

const createMockRes = () => {
  const res = {} as Response
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('user.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    it('should return 200 with result on success', async () => {
      ;(userService.signUp as jest.Mock).mockResolvedValue({ registered: true, message: '' })

      const req = {
        body: { email: 'user@test.com', password: 'Passw0rd!', displayName: 'User' },
      } as Request
      const res = createMockRes()

      await userController.signUp(req, res)

      expect(userService.signUp).toHaveBeenCalledWith('user@test.com', 'Passw0rd!', 'User')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ registered: true, message: '' })
    })

    it('should return 500 on service error', async () => {
      ;(userService.signUp as jest.Mock).mockRejectedValue(new Error('Firebase error'))

      const req = {
        body: { email: 'user@test.com', password: 'Passw0rd!', displayName: 'User' },
      } as Request
      const res = createMockRes()

      await userController.signUp(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Firebase error' })
    })
  })

  describe('resetPassword', () => {
    it('should return 200 with message on success', async () => {
      ;(userService.resetPassword as jest.Mock).mockResolvedValue('Revisa tu correo.')

      const req = { body: { email: 'user@test.com' } } as Request
      const res = createMockRes()

      await userController.resetPassword(req, res)

      expect(userService.resetPassword).toHaveBeenCalledWith('user@test.com')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({ message: 'Revisa tu correo.' })
    })

    it('should return 500 on service error', async () => {
      ;(userService.resetPassword as jest.Mock).mockRejectedValue(new Error('Reset failed'))

      const req = { body: { email: 'user@test.com' } } as Request
      const res = createMockRes()

      await userController.resetPassword(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
