import {
  userRequestAccessTemplate,
  adminRequestAccessTemplate,
  acceptAccessTemplate,
  rejectAccessTemplate,
  verifyEmailTemplate,
  recoverPasswordTemplate,
} from '../../templates/email.template'

describe('Email Templates', () => {
  describe('userRequestAccessTemplate', () => {
    it('should return an HTML string', () => {
      const result = userRequestAccessTemplate()
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should mention access request', () => {
      const result = userRequestAccessTemplate()
      expect(result).toContain('solicitud de acceso')
    })
  })

  describe('adminRequestAccessTemplate', () => {
    const userEmail = 'user@test.com'
    const approveUrl = 'https://example.com/approve'
    const rejectUrl = 'https://example.com/reject'

    it('should return an HTML string', () => {
      const result = adminRequestAccessTemplate(userEmail, approveUrl, rejectUrl)
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should include the user email', () => {
      const result = adminRequestAccessTemplate(userEmail, approveUrl, rejectUrl)
      expect(result).toContain(userEmail)
    })

    it('should include the approve URL', () => {
      const result = adminRequestAccessTemplate(userEmail, approveUrl, rejectUrl)
      expect(result).toContain(approveUrl)
    })

    it('should include the reject URL', () => {
      const result = adminRequestAccessTemplate(userEmail, approveUrl, rejectUrl)
      expect(result).toContain(rejectUrl)
    })
  })

  describe('acceptAccessTemplate', () => {
    it('should return an HTML string', () => {
      const result = acceptAccessTemplate(12345)
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should include the access code', () => {
      const result = acceptAccessTemplate(99999)
      expect(result).toContain('99999')
    })
  })

  describe('rejectAccessTemplate', () => {
    it('should return an HTML string', () => {
      const result = rejectAccessTemplate()
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should mention rejection', () => {
      const result = rejectAccessTemplate()
      expect(result).toContain('rechazado')
    })
  })

  describe('verifyEmailTemplate', () => {
    it('should return an HTML string', () => {
      const result = verifyEmailTemplate('Test', 'https://verify.com')
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should include the user name', () => {
      const result = verifyEmailTemplate('Martín', 'https://verify.com')
      expect(result).toContain('Martín')
    })

    it('should include the verification link', () => {
      const link = 'https://verify.example.com/token=abc123'
      const result = verifyEmailTemplate('Ana', link)
      expect(result).toContain(link)
    })

    it('should fall back to "compa" when name is empty', () => {
      const result = verifyEmailTemplate('', 'https://verify.com')
      expect(result).toContain('compa')
    })
  })

  describe('recoverPasswordTemplate', () => {
    it('should return an HTML string', () => {
      const result = recoverPasswordTemplate('https://recover.com')
      expect(result).toContain('<!DOCTYPE html>')
    })

    it('should include the recovery link', () => {
      const link = 'https://recover.example.com/token=xyz'
      const result = recoverPasswordTemplate(link)
      expect(result).toContain(link)
    })
  })
})
