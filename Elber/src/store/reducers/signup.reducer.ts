export type SignUpState = {
    email: string,
    name: string,
    password: string,
    confirmPassword: string
}

export const initialSignUpState: SignUpState = {
    confirmPassword: '',
    email: '',
    name: '',
    password: '',
}

export type SignUpAction = 
| {type: 'SET_EMAIL', email: string}
| {type: 'SET_NAME', name: string}
| {type: 'RESET_SIGNUP_STATE'}

export const signUpReducer = (state: SignUpState, action: SignUpAction): SignUpState => {
    switch (action.type) {
        case 'SET_EMAIL':
            return {...state, email: action.email}
        case 'SET_NAME':
            return {...state, name: action.name}
        case 'RESET_SIGNUP_STATE':
            return {...initialSignUpState}
        default:
            return state
    }
}