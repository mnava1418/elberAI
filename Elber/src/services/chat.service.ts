import { BACK_URL } from "@env"
import { apiGet } from "./network.service"
import { AxiosRequestConfig } from "axios"
import { getAuth, getIdToken } from "@react-native-firebase/auth"
import { ElberChat } from "../models/chat.model"

export const getChats = async(): Promise<Map<number, ElberChat>> => {
    try {
        const currentUser = getAuth().currentUser

        if(currentUser === null) {
            throw new Error('User not authenticated.');
        }

        const token = await getIdToken(currentUser, true)

        const config: AxiosRequestConfig = {
            headers: {
                Authorization : `Bearer ${token}`
            }
        }

        const data = await apiGet<{chats: ElberChat[]}>(`${BACK_URL}/ai/chat`, config)
        const elberChats = new Map<number, ElberChat>()

        data.chats.forEach(chat => {
            chat.messages.sort((a, b) => b.createdAt - a.createdAt)
            elberChats.set(chat.id, chat)
        })
        
        return elberChats
    } catch (error) {
        console.error(error)
        throw new Error('Unable to get chats')
    }
}