import admin from 'firebase-admin';

export const validateFBToken = async (token: string) => {
    try {
        const user = await admin.auth().verifyIdToken(token)
        return user        
    } catch (error) {
        throw(new Error('Authentication error'))
    }
}