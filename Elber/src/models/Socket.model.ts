import { io, Socket } from "socket.io-client"
import { BACK_URL } from "@env"
import { getAuth } from '@react-native-firebase/auth';
import { addChatMessage, isWaitingForElber } from "../store/actions/elber.actions";
import { IMessage } from "react-native-gifted-chat";

class SocketModel {
    private socket: Socket | null
    private static instance: SocketModel

    constructor() {
        this.socket = null
    }

    static getInstance(): SocketModel {
        if(!SocketModel.instance) {
            SocketModel.instance = new SocketModel()
        }

        return SocketModel.instance
    }

    disconnect() {
        if(this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    async connect(dispatch: (value: any) => void) {  
        if(this.socket && this.socket.connected) {
            console.info('Socket already connected...')
            return
        }
        
        const currentUser = getAuth().currentUser

        if(currentUser === null) {
            throw new Error('User not authenticated.');
        }                
        
        const token = await currentUser.getIdToken()

        if (this.socket) {
            this.disconnect()
        }

        this.socket = io(BACK_URL, {
            path: '/socket.io',
            transports: ["websocket"],
            forceNew: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            extraHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        this.socket.on("connect", () => {
            console.info('Connected to socket:', this.socket!.id)    
            this.setListeners(dispatch)                        
        });

        this.socket.on("disconnect", () => {                
            console.info('Disconnected from socket...')    
        });

        this.socket.on("connect_error", (err) => {                
            console.error('Error connecting to socket:', err.message);
        });
    }

    setListeners(dispatch: (value: any) => void) {
        this.setElberListeners(dispatch)
    }

    setElberListeners(dispatch: (value: any) => void) {
        if(this.socket && this.socket.connected ) {
            console.info('Setting Elber listeners...')

            this.socket.off('elber:response');

            this.socket.on('elber:response', (responseText: string) => {
                const timeStamp = new Date().getTime()
                const newMessage: IMessage = {
                    _id: `elber:${timeStamp}`,
                    text: responseText,
                    createdAt: timeStamp,
                    user: {
                        _id: 'elber'
                    }
                }
                
                dispatch(isWaitingForElber(false))
                dispatch(addChatMessage(newMessage))
            })
        }
    }

    sendMessage(userMessage: string) {
        const currentUser = getAuth().currentUser

        if(this.socket && this.socket.connected && currentUser) {
            this.socket.emit('elber:ask', userMessage)
        } else {
            console.log('Unable to send message')
        }
    }
}

export default SocketModel