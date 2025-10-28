import { UserAction, UserProfile } from "../reducers/user.reducer";

export const logInUser = (profile: UserProfile): UserAction => ({
    type: 'LOG_IN',
    profile
});

export const logOutUser = (): UserAction => ({
    type: 'LOG_OUT'
});
