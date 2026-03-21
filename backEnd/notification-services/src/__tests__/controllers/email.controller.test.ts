import { Request, Response } from 'express'
import { EmailMessageType } from '../../types/email.type'
import * as emailService from '../../services/email.service'
import {
  requestAccess,
  accessRespose,
  verifyAccount,
  resetPassword,
  send,
} from '../../controllers/email.controller'

jest.mock('../../services/email.service')

jest.mock('../../config/index.config', () => ({
  email: {
    from: 'admin@test.com',
    newsletter: 'newsletter@test.com',
    newsletterMembers: ['member1@test.com', 'member2@test.com'],
  },
  auth: { token: 'test-secret' },
}))

const createMockRes = () => {
  const res = {} as Response
  res.json = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe('email.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requestAccess', () => {
    it('should send 2 emails (user + admin)', () => {
      const req = {
        body: {
          userEmail: 'user@test.com',
          approveURL: 'http://approve',
          rejectURL: 'http://reject',
        },
      } as unknown as Request
      const res = createMockRes()

      requestAccess(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledTimes(2)
    })

    it('should send user email with UserRequestAccess type', () => {
      const req = {
        body: { userEmail: 'user@test.com', approveURL: 'http://approve', rejectURL: 'http://reject' },
      } as unknown as Request
      const res = createMockRes()

      requestAccess(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          messageType: EmailMessageType.UserRequestAccess,
        })
      )
    })

    it('should send admin email with AdminRequestAccess type including payload', () => {
      const req = {
        body: { userEmail: 'user@test.com', approveURL: 'http://approve', rejectURL: 'http://reject' },
      } as unknown as Request
      const res = createMockRes()

      requestAccess(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'admin@test.com',
          messageType: EmailMessageType.AdminRequestAccess,
          payload: { userEmail: 'user@test.com', approveURL: 'http://approve', rejectURL: 'http://reject' },
        })
      )
    })

    it('should respond with { result: true }', () => {
      const req = {
        body: { userEmail: 'u@t.com', approveURL: 'http://a', rejectURL: 'http://r' },
      } as unknown as Request
      const res = createMockRes()

      requestAccess(req, res)

      expect(res.json).toHaveBeenCalledWith({ result: true })
    })
  })

  describe('accessRespose', () => {
    it('should send UserAccessGranted email with access code when approved', () => {
      const req = {
        body: { email: 'user@test.com', isApproved: true, accessCode: 1234 },
      } as unknown as Request
      const res = createMockRes()

      accessRespose(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          messageType: EmailMessageType.UserAccessGranted,
          payload: { code: 1234 },
        })
      )
    })

    it('should send UserAccessGranted email without code when accessCode is null', () => {
      const req = {
        body: { email: 'user@test.com', isApproved: true, accessCode: null },
      } as unknown as Request
      const res = createMockRes()

      accessRespose(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          messageType: EmailMessageType.UserAccessGranted,
          payload: undefined,
        })
      )
    })

    it('should send UserAccessDenied email when rejected', () => {
      const req = {
        body: { email: 'user@test.com', isApproved: false, accessCode: null },
      } as unknown as Request
      const res = createMockRes()

      accessRespose(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          messageType: EmailMessageType.UserAccessDenied,
        })
      )
    })

    it('should respond with { result: true }', () => {
      const req = {
        body: { email: 'u@t.com', isApproved: false, accessCode: null },
      } as unknown as Request
      const res = createMockRes()

      accessRespose(req, res)

      expect(res.json).toHaveBeenCalledWith({ result: true })
    })
  })

  describe('verifyAccount', () => {
    it('should send VerifyEmail with name and link', () => {
      const req = {
        body: { email: 'user@test.com', name: 'Ana', link: 'http://verify' },
      } as unknown as Request
      const res = createMockRes()

      verifyAccount(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          messageType: EmailMessageType.VerifyEmail,
          payload: { name: 'Ana', link: 'http://verify' },
        })
      )
    })

    it('should respond with { result: true }', () => {
      const req = {
        body: { email: 'u@t.com', name: 'X', link: 'http://l' },
      } as unknown as Request
      const res = createMockRes()

      verifyAccount(req, res)

      expect(res.json).toHaveBeenCalledWith({ result: true })
    })
  })

  describe('resetPassword', () => {
    it('should send RecoverPassword email with recoverLink', () => {
      const req = {
        body: { email: 'user@test.com', recoverLink: 'http://recover' },
      } as unknown as Request
      const res = createMockRes()

      resetPassword(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          messageType: EmailMessageType.RecoverPassword,
          payload: { recoverLink: 'http://recover' },
        })
      )
    })

    it('should respond with { result: true }', () => {
      const req = {
        body: { email: 'u@t.com', recoverLink: 'http://r' },
      } as unknown as Request
      const res = createMockRes()

      resetPassword(req, res)

      expect(res.json).toHaveBeenCalledWith({ result: true })
    })
  })

  describe('send', () => {
    it('should send OpenEmail to the given address', () => {
      const req = {
        body: { to: 'regular@test.com', subject: 'Hello', message: 'Test body' },
      } as unknown as Request
      const res = createMockRes()

      send(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'regular@test.com',
          subject: 'Hello',
          message: 'Test body',
          messageType: EmailMessageType.OpenEmail,
        })
      )
    })

    it('should expand newsletter address to joined member list', () => {
      const req = {
        body: { to: 'newsletter@test.com', subject: 'News', message: 'Content' },
      } as unknown as Request
      const res = createMockRes()

      send(req, res)

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'member1@test.com,member2@test.com',
        })
      )
    })

    it('should respond with { result: true }', () => {
      const req = {
        body: { to: 'a@b.com', subject: 'Hi', message: 'Msg' },
      } as unknown as Request
      const res = createMockRes()

      send(req, res)

      expect(res.json).toHaveBeenCalledWith({ result: true })
    })
  })
})
