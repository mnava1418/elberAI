import admin from 'firebase-admin'
import ShortTermMemory from '../models/shortTermMemory.model'
import MidTermMemory from '../models/midTermMemory.model'
import { resetProfileData } from './profile.service'
import LongTermMemory from '../models/longTermMemory.model'
import { UserData } from '../models/elber.model'

export const fetchUserData = async (userId: string): Promise<UserData[]> => {
    const ltm = new LongTermMemory()
    const data = await ltm.getUserData(userId)
    return data.slice(0, 10)
}

export const deleteAllUserData = async (userId: string): Promise<void> => {
    const ltm = new LongTermMemory()
    await ltm.resetMemory(userId)
}

export const deleteUserDataByItems = async (userId: string, dataToDelete: string[]): Promise<boolean> => {
    const ltm = new LongTermMemory()
    let memoryIds: string[] = []

    for (const item of dataToDelete) {
        const memories = await ltm.getMemory(userId, item)
        memoryIds = [...memoryIds, ...memories.map((m) => m.id)]
    }

    if (memoryIds.length > 0) {
        await ltm.deleteMemories(userId, memoryIds)
        return true
    }

    return false
}

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