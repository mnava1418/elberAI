import { BACK_URL } from '@env'
import { apiPost } from './network.service';

export const requestAccess = async (email: string) => {
    try {
        const data = await apiPost<{message: string}>(`${BACK_URL}/auth/requestAccess`, { email });
        return data.message;
    } catch (error) {
        console.error('Error al solicitar acceso:', error);
        throw new Error('Error al solicitar acceso para ' + email);
    }
}
