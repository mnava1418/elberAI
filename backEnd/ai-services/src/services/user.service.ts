import admin from 'firebase-admin'
import ShortTermMemory from '../models/shortTermMemory.model'

export const deleteProfile = async (uid: string) => {
    try {
        ShortTermMemory.getInstance().deleteUserSessions(uid)

        const db = admin.database()
        const ref = db.ref(`/${uid}`)
        await ref.remove()       
    } catch (error) {
        console.error(error)
        throw new Error(`Unable to delete profile for:${uid}`)
    }
}