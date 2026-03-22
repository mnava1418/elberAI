import {
  validateMandatoryField,
  validateEmail,
  validateLength,
  validateNumeric,
  validatePassword,
  validateConfirmPassword,
} from '../../services/validation.service'

describe('validateMandatoryField', () => {
  it('should return true for a non-empty string', () => {
    expect(validateMandatoryField('hello')).toBe(true)
  })

  it('should return false for an empty string', () => {
    expect(validateMandatoryField('')).toBe(false)
  })

  it('should return false for a whitespace-only string', () => {
    expect(validateMandatoryField('   ')).toBe(false)
  })

  it('should return true for a string with leading/trailing spaces but content', () => {
    expect(validateMandatoryField('  hello  ')).toBe(true)
  })
})

describe('validateEmail', () => {
  it('should return true for a valid email', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('should return true for a subdomain email', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  it('should return false when missing @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('should return false when missing domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('should return false when missing TLD', () => {
    expect(validateEmail('user@domain')).toBe(false)
  })

  it('should return false for an empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('should return false for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })
})

describe('validateLength', () => {
  it('should return true when trimmed length matches', () => {
    expect(validateLength('123456', 6)).toBe(true)
  })

  it('should return false when length is shorter', () => {
    expect(validateLength('123', 6)).toBe(false)
  })

  it('should return false when length is longer', () => {
    expect(validateLength('1234567', 6)).toBe(false)
  })

  it('should trim before checking length', () => {
    expect(validateLength('  123456  ', 6)).toBe(true)
  })

  it('should return true for empty string with length 0', () => {
    expect(validateLength('', 0)).toBe(true)
  })
})

describe('validateNumeric', () => {
  it('should return true for a numeric string', () => {
    expect(validateNumeric('123456')).toBe(true)
  })

  it('should return false for a string with letters', () => {
    expect(validateNumeric('123abc')).toBe(false)
  })

  it('should return false for an empty string', () => {
    expect(validateNumeric('')).toBe(false)
  })

  it('should return false for a string with spaces', () => {
    expect(validateNumeric('123 456')).toBe(false)
  })

  it('should return false for a string with special characters', () => {
    expect(validateNumeric('123-456')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('should return true for a valid password with letters and numbers', () => {
    expect(validatePassword('Password1')).toBe(true)
  })

  it('should return true for a password with special characters', () => {
    expect(validatePassword('Pass@word1')).toBe(true)
  })

  it('should return false when shorter than 8 characters', () => {
    expect(validatePassword('Pass1')).toBe(false)
  })

  it('should return false when only letters (no digit)', () => {
    expect(validatePassword('PasswordOnly')).toBe(false)
  })

  it('should return false when only digits (no letter)', () => {
    expect(validatePassword('12345678')).toBe(false)
  })

  it('should return false for an empty string', () => {
    expect(validatePassword('')).toBe(false)
  })

  it('should return true for exactly 8 characters with letter and digit', () => {
    expect(validatePassword('Passwor1')).toBe(true)
  })
})

describe('validateConfirmPassword', () => {
  it('should return true when both passwords match', () => {
    expect(validateConfirmPassword('Password1', 'Password1')).toBe(true)
  })

  it('should return false when passwords do not match', () => {
    expect(validateConfirmPassword('Password1', 'Password2')).toBe(false)
  })

  it('should return false when one is empty', () => {
    expect(validateConfirmPassword('Password1', '')).toBe(false)
  })

  it('should return true when both are empty strings', () => {
    expect(validateConfirmPassword('', '')).toBe(true)
  })

  it('should be case sensitive', () => {
    expect(validateConfirmPassword('password1', 'Password1')).toBe(false)
  })
})
