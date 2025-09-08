import { BACK_URL } from '@env'
import { apiPost } from './network.service';
import { AuthResponse } from '../types/auth.type';
import { signInWithEmailAndPassword, getAuth, signOut } from '@react-native-firebase/auth';
import { logOutUser } from '../store/actions/user.actions';

export const requestAccess = async (email: string) => {
    try {
        const data = await apiPost<{message: string}>(`${BACK_URL}/access/request`, { email });
        return data.message;
    } catch (error) {
        console.error('Error al solicitar acceso:', error);
        throw new Error('Error al solicitar acceso para ' + email);
    }
}

export const validateAccessCode = async (email: string, accessCode: string): Promise<AuthResponse> => {
    try {
        const data = await apiPost<{isValid: boolean, message: string}>(`${BACK_URL}/access/validateCode`, { email, accessCode });
        return {isValid: data.isValid, message: data.message};
    } catch (error) {
        console.error('Error al validar código de acceso:', error);
        throw new Error('Error al validar código de acceso para ' + email);
    }
};

export const signUp = async(email: string, password: string, displayName: string): Promise<{registered: boolean, message: string}> => {
    try {
        const result = await apiPost<{registered: boolean, message: string}>(`${BACK_URL}/user/signUp`, { email, password, displayName });
        return result        
    } catch (error) {
        console.error('Error al crear cuenta:', error)
        throw new Error('Error al crear cuenta.')
    }
}

export const signIn = async (email: string, password: string) => {
    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            throw new Error('¡No has validado tu email carnalito! Echale un vistazo a tu bandeja de entrada.');
        }
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential') {
            throw new Error('¡Uy papá! Esos datos están más chuecos que un trompo.');
        }
        
        throw new Error(error.message || 'Error al iniciar sesión');
    }
}

export const logOut = async (dispatch: React.Dispatch<any>) => {
    try {
        const auth = getAuth();
        if(auth.currentUser) {
            await signOut(auth);
            dispatch(logOutUser());
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        throw new Error('Error al cerrar sesión.');
    }
}