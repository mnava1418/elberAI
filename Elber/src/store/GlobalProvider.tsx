import { createContext, ReactNode, useReducer } from "react";
import { initialSignUpState, SignUpAction, signUpReducer, SignUpState } from "./reducers/signup.reducer";

type GlobalProviderProps = {
  children: ReactNode;
}

type State = {
    signUp: SignUpState
}

const initialState: State = {
    signUp: initialSignUpState
}

const rootReducer = ({signUp}: State, action: SignUpAction): State => ({
  signUp: signUpReducer(signUp, action)
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