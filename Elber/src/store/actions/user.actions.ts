import { UserAction, UserProfile } from "../reducers/user.reducer";

export const logInUser = (profile: UserProfile): UserAction => ({
    type: 'LOG_IN',
    profile
});

export const logOutUser = (): UserAction => ({
    type: 'LOG_OUT'
});

export const isWaitingForElber = (isWaiting: boolean): UserAction => ({
    type: 'WAITING_FOR_ELBER',
    isWaiting
})