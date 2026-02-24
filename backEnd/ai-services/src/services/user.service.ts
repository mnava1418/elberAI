import admin from 'firebase-admin'
import ShortTermMemory from '../models/shortTermMemory.model'
import MidTermMemory from '../models/midTermMemory.model'

export const deleteProfile = async (uid: string) => {
    try {
        ShortTermMemory.getInstance().deleteUserSessions(uid)
        MidTermMemory.getInstance().deleteUserMemory(uid)

        const db = admin.database()
        const ref = db.ref(`/${uid}`)
        await ref.remove()       
    } catch (error) {
        console.error(error)
        throw new Error(`Unable to delete profile for:${uid}`)
    }
}