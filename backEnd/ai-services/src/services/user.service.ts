import admin from 'firebase-admin'
import ShortTermMemory from '../models/shortTermMemory.model'
import MidTermMemory from '../models/midTermMemory.model'
import { resetProfileData } from './profile.service'

export const deleteProfile = async (uid: string) => {
    try {
        ShortTermMemory.getInstance().deleteUserSessions(uid)
        MidTermMemory.getInstance().deleteUserMemory(uid)

        const db = admin.database()
        const ref = db.ref(`/${uid}`)
        
        await Promise.all([
            resetProfileData(uid),
            ref.remove()
        ])
    } catch (error) {
        console.error(error)
        throw new Error(`Unable to delete profile for:${uid}`)
    }
}