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
        const elberChats = data.chats
        elberChats.sort((a, b) => b.id - a.id)

        const elberChatsMap = new Map<number, ElberChat>()

        elberChats.forEach(chat => {
            elberChatsMap.set(chat.id, chat)
        })
        
        return elberChatsMap
    } catch (error) {
        console.error(error)
        throw new Error('Unable to get chats')
    }
}