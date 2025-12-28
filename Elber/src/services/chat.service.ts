import { BACK_URL } from "@env"
import { apiGet } from "./network.service"
import { AxiosRequestConfig } from "axios"
import { getAuth, getIdToken } from "@react-native-firebase/auth"
import { ElberChats } from "../models/chat.model"

export const getChats = async() => {
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

        const data = await apiGet<ElberChats>(`${BACK_URL}/ai/chat`, config)
        return data.chats
    } catch (error) {
        console.error(error)
    }
}