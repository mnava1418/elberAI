import { selectIsLoggedIn, selectUserProfile } from '../../../store/selectors/user.selector'
import { initialUserState, UserState } from '../../../store/reducers/user.reducer'

describe('selectIsLoggedIn', () => {
  it('should return false for initial state', () => {
    expect(selectIsLoggedIn(initialUserState)).toBe(false)
  })

  it('should return true when user is logged in', () => {
    const state: UserState = {
      ...initialUserState,
      isLoggedIn: true,
    }
    expect(selectIsLoggedIn(state)).toBe(true)
  })
})

describe('selectUserProfile', () => {
  it('should return empty profile for initial state', () => {
    const profile = selectUserProfile(initialUserState)
    expect(profile.name).toBe('')
    expect(profile.email).toBe('')
  })

  it('should return the current user profile', () => {
    const state: UserState = {
      isLoggedIn: true,
      profile: { name: 'Martin', email: 'martin@test.com' },
    }
    const profile = selectUserProfile(state)
    expect(profile.name).toBe('Martin')
    expect(profile.email).toBe('martin@test.com')
  })
})
