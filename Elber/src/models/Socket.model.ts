import { io, Socket } from "socket.io-client"
import { BACK_URL } from "@env"
import { getAuth } from '@react-native-firebase/auth';
import { ElberAction, ElberResponse } from "./elber.model";
import { ElberMessage } from "../store/reducers/elber.reducer";
import handleElberResponse from "../services/elber.service";

let ERROR_CONNECTION: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {
        message: '¡Pinche conexión se hizo la desaparecida y nos dejó tirados! Pero no te agüites, revisa que todo esté en orden y dale otra chance; que aquí seguimos.'
    }
} 

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
            handleElberResponse('elber:error', dispatch, ERROR_CONNECTION)
        });

        this.socket.on("connect_error", (err) => {                
            console.error('Error connecting to socket:', err.message);
            handleElberResponse('elber:error', dispatch, ERROR_CONNECTION)
        });
    }

    setListeners(dispatch: (value: any) => void) {
        this.setElberListeners(dispatch)
    }

    setElberListeners(dispatch: (value: any) => void) {
        if(this.socket && this.socket.connected ) {
            console.info('Setting Elber listeners...')

            //export type ElberEvent = 'elber:error' |''

            this.socket.off('elber:stream');
            this.socket.off('elber:response');
            this.socket.off('elber:canceled')

            this.socket.on('elber:stream', (response: ElberResponse) => {
                handleElberResponse('elber:stream', dispatch, response)              
            })

            this.socket.on('elber:response', () => {
                handleElberResponse('elber:response', dispatch)
            })

            this.socket.on('elber:canceled', () => {
                handleElberResponse('elber:canceled', dispatch)
            })
        }
    }

    sendMessage(userMessages: ElberMessage[], dispatch: (value: any) => void) {
        const currentUser = getAuth().currentUser
        const elberRequest = [...userMessages].reverse()

        if(this.socket && this.socket.connected && currentUser) {
            this.socket.emit('user:ask', currentUser?.displayName, elberRequest.slice(-12))
        } else {
            handleElberResponse('elber:error', dispatch, ERROR_CONNECTION)
        }
    }

    cancelCall(action: ElberAction, dispatch: (value: any) => void) {
        const currentUser = getAuth().currentUser

        if(this.socket && this.socket.connected && currentUser) {
            this.socket.emit('user:cancel', action )
        } else {
            handleElberResponse('elber:error', dispatch, ERROR_CONNECTION)
        }
    }
}

export default SocketModel