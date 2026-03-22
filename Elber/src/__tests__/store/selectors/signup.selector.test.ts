import { selectSignUpInfo } from '../../../store/selectors/signup.selector'
import { initialSignUpState, SignUpState } from '../../../store/reducers/signup.reducer'

describe('selectSignUpInfo', () => {
  it('should return the full signup state', () => {
    expect(selectSignUpInfo(initialSignUpState)).toEqual(initialSignUpState)
  })

  it('should return the same reference', () => {
    const state: SignUpState = {
      email: 'a@b.com',
      name: 'Martin',
      password: 'Passw0rd!',
      confirmPassword: 'Passw0rd!',
    }
    expect(selectSignUpInfo(state)).toBe(state)
  })
})
