import Sound from 'react-native-sound'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { elberIsTalking } from '../store/actions/elber.actions'

Sound.setCategory('Playback')

class AudioQueue {
    private static instance: AudioQueue
    private queue: string[] = []
    private isPlaying = false
    private currentSound: Sound | null = null
    private cancelled = false

    static getInstance(): AudioQueue {
        if (!AudioQueue.instance) {
            AudioQueue.instance = new AudioQueue()
        }
        return AudioQueue.instance
    }

    addChunk(base64: string, dispatch: (value: any) => void) {
        if (this.cancelled) return
        this.queue.push(base64)
        if (!this.isPlaying) {
            this.playNext(dispatch)
        }
    }

    resume() {
        this.cancelled = false
    }

    stop() {
        this.cancelled = true
        this.queue = []
        this.isPlaying = false
        if (this.currentSound) {
            this.currentSound.stop()
            this.currentSound.release()
            this.currentSound = null
        }
    }

    private playNext(dispatch: (value: any) => void) {
        if (this.queue.length === 0) {
            this.isPlaying = false
            dispatch(elberIsTalking(false))
            return
        }

        this.isPlaying = true
        const base64 = this.queue.shift()!
        const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/elber_${Date.now()}.mp3`

        ReactNativeBlobUtil.fs.writeFile(path, base64, 'base64')
            .then(() => {
                const sound = new Sound(path, '', (error) => {
                    if (error) {
                        console.error('Error cargando audio:', error)
                        ReactNativeBlobUtil.fs.unlink(path).catch(() => {})
                        this.playNext(dispatch)
                        return
                    }

                    this.currentSound = sound
                    sound.play(() => {
                        sound.release()
                        this.currentSound = null
                        ReactNativeBlobUtil.fs.unlink(path).catch(() => {})
                        this.playNext(dispatch)
                    })
                })
            })
            .catch((error) => {
                console.error('Error escribiendo archivo de audio:', error)
                this.playNext(dispatch)
            })
    }
}

export default AudioQueue
