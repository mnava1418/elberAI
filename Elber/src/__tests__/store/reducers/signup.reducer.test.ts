import { signUpReducer, initialSignUpState } from '../../../store/reducers/signup.reducer'

describe('signUpReducer', () => {
  it('should return current state for unknown action', () => {
    const result = signUpReducer(initialSignUpState, { type: 'RESET_SIGNUP_STATE' })
    expect(result).toEqual(initialSignUpState)
  })

  describe('SET_EMAIL', () => {
    it('should update email', () => {
      const result = signUpReducer(initialSignUpState, { type: 'SET_EMAIL', email: 'user@test.com' })
      expect(result.email).toBe('user@test.com')
    })

    it('should not affect other fields', () => {
      const state = { ...initialSignUpState, name: 'Martin' }
      const result = signUpReducer(state, { type: 'SET_EMAIL', email: 'a@b.com' })
      expect(result.name).toBe('Martin')
    })
  })

  describe('SET_NAME', () => {
    it('should update name', () => {
      const result = signUpReducer(initialSignUpState, { type: 'SET_NAME', name: 'Martin' })
      expect(result.name).toBe('Martin')
    })

    it('should not affect other fields', () => {
      const state = { ...initialSignUpState, email: 'a@b.com' }
      const result = signUpReducer(state, { type: 'SET_NAME', name: 'Martin' })
      expect(result.email).toBe('a@b.com')
    })
  })

  describe('SET_PASSWORD', () => {
    it('should update password', () => {
      const result = signUpReducer(initialSignUpState, { type: 'SET_PASSWORD', password: 'Passw0rd!' })
      expect(result.password).toBe('Passw0rd!')
    })
  })

  describe('SET_CONFIRM_PASSWORD', () => {
    it('should update confirmPassword', () => {
      const result = signUpReducer(initialSignUpState, {
        type: 'SET_CONFIRM_PASSWORD',
        confirmPassword: 'Passw0rd!',
      })
      expect(result.confirmPassword).toBe('Passw0rd!')
    })
  })

  describe('CLEAN_PASSWORDS', () => {
    it('should clear password and confirmPassword', () => {
      const state = {
        email: 'a@b.com',
        name: 'Martin',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      }
      const result = signUpReducer(state, { type: 'CLEAN_PASSWORDS' })
      expect(result.password).toBe('')
      expect(result.confirmPassword).toBe('')
    })

    it('should preserve email and name', () => {
      const state = {
        email: 'a@b.com',
        name: 'Martin',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      }
      const result = signUpReducer(state, { type: 'CLEAN_PASSWORDS' })
      expect(result.email).toBe('a@b.com')
      expect(result.name).toBe('Martin')
    })
  })

  describe('RESET_SIGNUP_STATE', () => {
    it('should reset all fields to initial values', () => {
      const state = {
        email: 'a@b.com',
        name: 'Martin',
        password: 'Passw0rd!',
        confirmPassword: 'Passw0rd!',
      }
      const result = signUpReducer(state, { type: 'RESET_SIGNUP_STATE' })
      expect(result).toEqual(initialSignUpState)
    })
  })
})
