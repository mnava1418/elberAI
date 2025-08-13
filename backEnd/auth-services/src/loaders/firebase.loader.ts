import admin from 'firebase-admin'
import {firebase} from '../config/index.config'

const initFirebase = () => {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(firebase.cred as string),
            databaseURL: firebase.db
        })

        console.info('Firebase Ready!')
    } catch (error) {
        console.error('Unable to initialize firebase', error)
    }
}

export default initFirebase