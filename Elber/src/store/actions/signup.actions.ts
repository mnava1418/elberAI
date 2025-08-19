import { SignUpAction } from "../reducers/signup.reducer"

export const setSignUpEmail = (email: string): SignUpAction => ({
    type: 'SET_EMAIL',
    email
})

export const setSignUpName = (name: string): SignUpAction => ({
    type: 'SET_NAME',
    name
})