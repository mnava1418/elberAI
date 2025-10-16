import admin from 'firebase-admin';

export const validateFBToken = async (authToken: string) => {
    try {
        const token = authToken.split(' ')[1]
        const user = await admin.auth().verifyIdToken(token as string)
        return user        
    } catch (error) {
        throw(new Error('Authentication error.'))
    }
}