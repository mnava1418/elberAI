import { BACK_URL } from '@env'
import { apiPost } from './network.service';
import { AuthResponse } from '../types/auth.type';

export const requestAccess = async (email: string) => {
    try {
        const data = await apiPost<{message: string}>(`${BACK_URL}/auth/requestAccess`, { email });
        return data.message;
    } catch (error) {
        console.error('Error al solicitar acceso:', error);
        throw new Error('Error al solicitar acceso para ' + email);
    }
}

export const validateAccessCode = async (email: string, accessCode: string): Promise<AuthResponse> => {
    try {
        const data = await apiPost<{isValid: boolean, message: string}>(`${BACK_URL}/auth/validateAccessCode`, { email, accessCode });
        return {isValid: data.isValid, message: data.message};
    } catch (error) {
        console.error('Error al validar código de acceso:', error);
        throw new Error('Error al validar código de acceso para ' + email);
    }
};
