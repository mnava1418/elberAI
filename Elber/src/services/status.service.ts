import { BACK_URL } from "@env"
import { AxiosRequestConfig } from "axios"
import { apiGet } from "./network.service"
import { getAuth, getIdToken } from "@react-native-firebase/auth"
import { EndpointsCheck } from "../models/status.model"

const checkEndpoint = async (url: string, name: string, token: string): Promise<EndpointsCheck> => {
    try {
        const config: AxiosRequestConfig = {
            headers: {
                Authorization : `Bearer ${token}`
            },
            timeout: 5000
        }    
        await apiGet<{endPoint: string}>(url, config);
        return {name, isAvailable: true}
    } catch {
        return {name, isAvailable: false}
    }
};

export const checkEndpoints = async (): Promise<EndpointsCheck[]> => {
    try {
        const currentUser = getAuth().currentUser
        
        if(currentUser === null) {
            throw new Error('User not authenticated.');
        }

        const token = await getIdToken(currentUser, true)        

        const result: EndpointsCheck[] = await Promise.all([
            checkEndpoint(`${BACK_URL}/health`, 'API Gateway', token),
            checkEndpoint(`${BACK_URL}/ai/health`, 'AI Services', token),
            checkEndpoint(`${BACK_URL}/auth/health`, 'Auth Services', token),
            checkEndpoint(`${BACK_URL}/notification/health`, 'Notification Services', token),
        ]);

        return result
    } catch (error) {
        throw new Error('Unable to check endpoints status')
    }
}