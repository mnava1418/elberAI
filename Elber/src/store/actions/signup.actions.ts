import { SignUpAction } from "../reducers/signup.reducer"

export const setSignUpEmail = (email: string): SignUpAction => ({
    type: 'SET_EMAIL',
    email
})

export const setSignUpName = (name: string): SignUpAction => ({
    type: 'SET_NAME',
    name
})

export const setSignUpPassword = (password: string): SignUpAction => ({
    type: 'SET_PASSWORD',
    password
})

export const setSignUpConfirmPassword = (confirmPassword: string): SignUpAction => ({
    type: 'SET_CONFIRM_PASSWORD',
    confirmPassword
})

export const cleanSignUpPasswords = (): SignUpAction => ({
    type: 'CLEAN_PASSWORDS'
})