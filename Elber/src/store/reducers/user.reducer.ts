export type UserProfile = {
    name: string;
    email: string;
}

export type UserState = {
    profile: UserProfile;
    isLoggedIn: boolean;
}

export const initialUserState: UserState = {
    profile: {
        name: '',
        email: ''
    },
    isLoggedIn: false,
}

export type UserAction =
| { type: 'LOG_IN'; profile: UserProfile }
| { type: 'LOG_OUT' }

export const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'LOG_IN':
            return { ...state, profile: action.profile, isLoggedIn: true };
        case 'LOG_OUT':
            return { ...initialUserState };
        default:
            return state;
    }
};