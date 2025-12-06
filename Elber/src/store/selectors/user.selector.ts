import { UserProfile, UserState } from "../reducers/user.reducer";

export const selectIsLoggedIn = (state: UserState): boolean => state.isLoggedIn;

export const selectUserProfile = (state: UserState): UserProfile => state.profile

