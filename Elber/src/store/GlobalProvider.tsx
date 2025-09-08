import { createContext, ReactNode, useReducer } from "react";
import { initialSignUpState, SignUpAction, signUpReducer, SignUpState } from "./reducers/signup.reducer";
import { initialUserState, UserAction, userReducer, UserState } from "./reducers/user.reducer";

type GlobalProviderProps = {
  children: ReactNode;
}

type State = {
    signUp: SignUpState,
    user: UserState
}

const initialState: State = {
    signUp: initialSignUpState,
    user: initialUserState
}

const rootReducer = ({signUp, user}: State, action: SignUpAction | UserAction): State => ({
  signUp: signUpReducer(signUp, action as SignUpAction),
  user: userReducer(user, action as UserAction)
});

export const GlobalContext = createContext<{state: State, dispatch: React.Dispatch<any>}>({state: initialState, dispatch: () => null});

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};