import { getAuth, getIdToken } from "@react-native-firebase/auth";
import { AxiosRequestConfig } from "axios";
import { apiDelete } from "./network.service";
import { BACK_URL } from "@env";

export const deleteProfile = async (): Promise<string> => {
    try {
        const currentUser = getAuth().currentUser
        
        if(currentUser === null) {
            throw new Error('User not authenticated.');
        }

        const token = await getIdToken(currentUser, true)

        const config: AxiosRequestConfig = {
            headers: {
                Authorization : `Bearer ${token}`
            },
        }       
        
        const url = `${BACK_URL}/ai/user`;
        await apiDelete<{response: string}>(url, config)
        return 'Listo! Tu perfil se eliminó correctamente.'
    } catch (error: any) {
        console.error('Error al borrar perfil:', error);
        throw new Error('No pude eliminar tu perfil. Por favor intenta nuevamente.');
    }
}