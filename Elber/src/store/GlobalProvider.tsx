import { createContext, ReactNode, useReducer } from "react";
import { initialSignUpState, SignUpAction, signUpReducer, SignUpState } from "./reducers/signup.reducer";
import { initialUserState, UserAction, userReducer, UserState } from "./reducers/user.reducer";
import { ElberAction, elberReducer, ElberState, initialElberState } from "./reducers/elber.reducer";

type GlobalProviderProps = {
  children: ReactNode;
}

type State = {
    signUp: SignUpState,
    user: UserState,
    elber: ElberState
}

const initialState: State = {
    signUp: initialSignUpState,
    user: initialUserState,
    elber: initialElberState
}

const rootReducer = ({signUp, user, elber}: State, action: SignUpAction | UserAction | ElberAction): State => ({
  signUp: signUpReducer(signUp, action as SignUpAction),
  user: userReducer(user, action as UserAction),
  elber: elberReducer(elber, action as ElberAction)
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