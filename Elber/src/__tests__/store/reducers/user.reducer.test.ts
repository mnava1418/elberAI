import { userReducer, initialUserState } from '../../../store/reducers/user.reducer'

describe('userReducer', () => {
  it('should return current state for unknown action', () => {
    const result = userReducer(initialUserState, { type: 'LOG_OUT' })
    expect(result).toEqual(initialUserState)
  })

  describe('LOG_IN', () => {
    it('should set profile and isLoggedIn to true', () => {
      const profile = { name: 'Martin', email: 'martin@test.com' }
      const result = userReducer(initialUserState, { type: 'LOG_IN', profile })
      expect(result.isLoggedIn).toBe(true)
      expect(result.profile.name).toBe('Martin')
      expect(result.profile.email).toBe('martin@test.com')
    })

    it('should update profile when called again', () => {
      const first = { name: 'Martin', email: 'martin@test.com' }
      const second = { name: 'Ana', email: 'ana@test.com' }
      let state = userReducer(initialUserState, { type: 'LOG_IN', profile: first })
      state = userReducer(state, { type: 'LOG_IN', profile: second })
      expect(state.profile.name).toBe('Ana')
    })
  })

  describe('LOG_OUT', () => {
    it('should reset to initial state', () => {
      const loggedIn = userReducer(initialUserState, {
        type: 'LOG_IN',
        profile: { name: 'Martin', email: 'martin@test.com' },
      })
      const result = userReducer(loggedIn, { type: 'LOG_OUT' })
      expect(result.isLoggedIn).toBe(false)
      expect(result.profile.name).toBe('')
      expect(result.profile.email).toBe('')
    })
  })
})
