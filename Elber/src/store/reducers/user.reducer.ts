export type UserProfile = {
    name: string;
    email: string;
}

export type UserState = {
    profile: UserProfile;
    isLoggedIn: boolean;
    isWaitingForElber: boolean
}

export const initialUserState: UserState = {
    profile: {
        name: '',
        email: ''
    },
    isLoggedIn: false,
    isWaitingForElber: false,
}

export type UserAction =
| { type: 'LOG_IN'; profile: UserProfile }
| { type: 'WAITING_FOR_ELBER'; isWaiting: boolean }
| { type: 'LOG_OUT' }

export const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case 'LOG_IN':
            return { ...state, profile: action.profile, isLoggedIn: true };
        case 'WAITING_FOR_ELBER':
            return {...state, isWaitingForElber: action.isWaiting}
        case 'LOG_OUT':
            return { ...initialUserState };
        default:
            return state;
    }
};