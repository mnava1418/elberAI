import { validateEmail, validatePassword } from '../../utils/validate'

describe('validateEmail', () => {
  it('should return true for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('should return false when @ is missing', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('should return false when domain is missing', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('should return true for subdomain email', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })
})

describe('validatePassword', () => {
  it('should return true for a strong password', () => {
    expect(validatePassword('Passw0rd')).toBe(true)
  })

  it('should return false when shorter than 8 chars', () => {
    expect(validatePassword('Ab1')).toBe(false)
  })

  it('should return false when missing uppercase letter', () => {
    expect(validatePassword('passw0rd')).toBe(false)
  })

  it('should return false when missing lowercase letter', () => {
    expect(validatePassword('PASSW0RD')).toBe(false)
  })

  it('should return false when missing a digit', () => {
    expect(validatePassword('Password')).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(validatePassword('')).toBe(false)
  })
})
