import { UserState } from "../reducers/user.reducer";

export const selectIsLoggedIn = (state: UserState): boolean => state.isLoggedIn;