import admin from 'firebase-admin'

export const deleteProfile = async (uid: string) => {
    try {
        const db = admin.database()
        const ref = db.ref(`/${uid}`)
        await ref.remove()       
    } catch (error) {
        console.error(error)
        throw new Error(`Unable to delete profile for:${uid}`)
    }
}