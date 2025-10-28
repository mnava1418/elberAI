import { IMessage } from "react-native-gifted-chat";
import { ElberAction } from "../reducers/elber.reducer";

 export const logOutElber = (): ElberAction => ({
    type: 'LOG_OUT'
 })

 export const isWaitingForElber = (isWaiting: boolean): ElberAction => ({
    type: 'WAITING_FOR_ELBER',
    isWaiting
 })

 export const addChatMessage = (newMessage: IMessage): ElberAction => ({
   type: 'ADD_CHAT_MESSAGE',
   newMessage
 })