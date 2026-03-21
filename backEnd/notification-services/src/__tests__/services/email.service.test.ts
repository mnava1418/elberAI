import nodemailer from 'nodemailer'
import fs from 'fs'
import { sendEmail } from '../../services/email.service'
import { EmailMessageType } from '../../types/email.type'

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}))

jest.mock('fs')

jest.mock('../../config/index.config', () => ({
  email: {
    cred: '/fake/path/credentials.json',
    from: 'admin@test.com',
    newsletter: 'newsletter@test.com',
    newsletterMembers: ['member1@test.com', 'member2@test.com'],
  },
  auth: { token: 'test-secret' },
}))

describe('email.service', () => {
  const mockSendMail = jest.fn()
  const mockClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ client_id: 'test-client', private_key: 'test-key' })
    )
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
      close: mockClose,
    })
    mockSendMail.mockResolvedValue({ messageId: 'msg-001' })
  })

  describe('sendEmail', () => {
    it('should set "to" for a single recipient', async () => {
      await sendEmail({
        to: 'user@test.com',
        subject: 'Test',
        messageType: EmailMessageType.UserRequestAccess,
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'user@test.com' })
      )
      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.bcc).toBeUndefined()
    })

    it('should set "bcc" for multiple recipients', async () => {
      await sendEmail({
        to: 'a@test.com,b@test.com',
        subject: 'Newsletter',
        messageType: EmailMessageType.OpenEmail,
        message: 'Hello everyone',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ bcc: ['a@test.com', 'b@test.com'] })
      )
      const callArgs = mockSendMail.mock.calls[0][0]
      expect(callArgs.to).toBeUndefined()
    })

    it('should use the correct "from" address', async () => {
      await sendEmail({
        to: 'user@test.com',
        subject: 'Test',
        messageType: EmailMessageType.UserRequestAccess,
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: '"Elber" <admin@test.com>' })
      )
    })

    it('should close the transporter after a successful send', async () => {
      await sendEmail({
        to: 'user@test.com',
        subject: 'Test',
        messageType: EmailMessageType.UserRequestAccess,
      })
      await new Promise((resolve) => setImmediate(resolve))

      expect(mockClose).toHaveBeenCalled()
    })

    it('should close the transporter after a send error', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'))

      await sendEmail({
        to: 'user@test.com',
        subject: 'Test',
        messageType: EmailMessageType.UserAccessDenied,
      })
      await new Promise((resolve) => setImmediate(resolve))

      expect(mockClose).toHaveBeenCalled()
    })

    it('should reject when the credential file cannot be read', async () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found')
      })

      await expect(
        sendEmail({
          to: 'user@test.com',
          subject: 'Test',
          messageType: EmailMessageType.UserRequestAccess,
        })
      ).rejects.toThrow('File not found')
    })

    it('should throw when email credentials path is not defined', async () => {
      jest.resetModules()
      jest.doMock('../../config/index.config', () => ({
        email: { cred: undefined, from: 'admin@test.com' },
        auth: { token: 'test-secret' },
      }))

      const { sendEmail: sendEmailFresh } = await import('../../services/email.service')

      await expect(
        sendEmailFresh({
          to: 'user@test.com',
          subject: 'Test',
          messageType: EmailMessageType.UserRequestAccess,
        })
      ).rejects.toThrow()
    })
  })

  describe('getMessage (tested via sendEmail html)', () => {
    const cases = [
      {
        label: 'UserRequestAccess',
        input: { messageType: EmailMessageType.UserRequestAccess },
        contains: 'solicitud de acceso',
      },
      {
        label: 'AdminRequestAccess',
        input: {
          messageType: EmailMessageType.AdminRequestAccess,
          payload: { userEmail: 'u@t.com', approveURL: 'http://approve', rejectURL: 'http://reject' },
        },
        contains: 'u@t.com',
      },
      {
        label: 'UserAccessGranted',
        input: { messageType: EmailMessageType.UserAccessGranted, payload: { code: 9999 } },
        contains: '9999',
      },
      {
        label: 'UserAccessDenied',
        input: { messageType: EmailMessageType.UserAccessDenied },
        contains: 'rechazado',
      },
      {
        label: 'VerifyEmail',
        input: {
          messageType: EmailMessageType.VerifyEmail,
          payload: { name: 'Ana', link: 'http://verify' },
        },
        contains: 'Ana',
      },
      {
        label: 'RecoverPassword',
        input: {
          messageType: EmailMessageType.RecoverPassword,
          payload: { recoverLink: 'http://recover' },
        },
        contains: 'http://recover',
      },
      {
        label: 'OpenEmail',
        input: { messageType: EmailMessageType.OpenEmail, message: 'Custom message' },
        contains: 'Custom message',
      },
    ]

    cases.forEach(({ label, input, contains }) => {
      it(`should generate correct HTML for ${label}`, async () => {
        await sendEmail({ to: 'u@t.com', subject: 'S', ...input })

        const html = mockSendMail.mock.calls[0][0].html
        expect(html).toContain(contains)
      })
    })

    it('should return empty string for unknown message type', async () => {
      await sendEmail({
        to: 'u@t.com',
        subject: 'S',
        messageType: 999 as EmailMessageType,
      })

      const html = mockSendMail.mock.calls[0][0].html
      expect(html).toBe('')
    })
  })
})
