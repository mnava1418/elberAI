import { createContext, ReactNode, useReducer } from "react";
import { initialSignUpState, SignUpAction, signUpReducer, SignUpState } from "./reducers/signup.reducer";
import { initialUserState, UserAction, userReducer, UserState } from "./reducers/user.reducer";
import { ElberAction, elberReducer, ElberState, initialElberState } from "./reducers/elber.reducer";
import { ChatAction, chatReducer, ChatState, initialChatState } from "./reducers/chat.reducer";

type GlobalProviderProps = {
  children: ReactNode;
}

type State = {
    signUp: SignUpState,
    user: UserState,
    elber: ElberState
    chat: ChatState
}

const initialState: State = {
    signUp: initialSignUpState,
    user: initialUserState,
    elber: initialElberState,
    chat: initialChatState
}

const rootReducer = ({signUp, user, elber, chat}: State, action: SignUpAction | UserAction | ElberAction | ChatAction): State => ({
  signUp: signUpReducer(signUp, action as SignUpAction),
  user: userReducer(user, action as UserAction),
  elber: elberReducer(elber, action as ElberAction),
  chat: chatReducer(chat, action as ChatAction)
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