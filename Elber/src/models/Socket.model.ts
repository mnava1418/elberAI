import { io, Socket } from "socket.io-client"
import { SOCKET_URL } from "@env"
import { getAuth, getIdToken } from '@react-native-firebase/auth';
import { ElberAction, ElberResponse } from "./elber.model";
import { ElberMessage } from "../store/reducers/elber.reducer";
import handleElberResponse from "../services/elber.service";

let ERROR_CONNECTION: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {
        message: '¡Pinche conexión se hizo la desaparecida y nos dejó tirados! Intenta de nuevo.'
    }
} 

let ERROR_ELBER: ElberResponse = {
    action: ElberAction.CHAT_TEXT,
    payload: {
        message: "No manches, se me hizo bolas el engrudo! Dame un minuto pa' recomponerme."
    }
} 

class SocketModel {
    private socket: Socket | null
    private static instance: SocketModel
    private reportDisconnect: boolean

    constructor() {
        this.socket = null
        this.reportDisconnect = false
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
        
        if (this.socket) {
            this.disconnect()
        }

        this.socket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ["websocket"],
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelayMax: 500,
            timeout: 2000,
            auth: async (cb) => {
                const user = getAuth().currentUser
                const token = user ? await getIdToken(user, true) : null
                cb({ token })
            }
        });

        this.socket.on("connect", () => {
            console.info('Connected to socket:', this.socket!.id)    
            this.setListeners(dispatch)       
            this.reportDisconnect = false                 
        });

        this.socket.on("disconnect", () => {                
            console.info('Disconnected from socket...')
        });

        this.socket.on("connect_error", (err) => {                
            console.error('Error connecting to socket:', err.message);

            if(!this.reportDisconnect) {
                handleElberResponse('elber:error', dispatch, ERROR_CONNECTION)
            }

            this.reportDisconnect = true
        });
    }

    setListeners(dispatch: (value: any) => void) {
        this.setElberListeners(dispatch)
    }

    setElberListeners(dispatch: (value: any) => void) {
        if(this.socket && this.socket.connected ) {
            console.info('Setting Elber listeners...')

            this.socket.off('elber:stream');
            this.socket.off('elber:response');
            this.socket.off('elber:canceled');
            this.socket.off('elber:error');

            this.socket.on('elber:stream', (response: string) => {
                handleElberResponse('elber:stream', dispatch, response)              
            })

            this.socket.on('elber:response', () => {
                handleElberResponse('elber:response', dispatch)
            })

            this.socket.on('elber:canceled', () => {
                handleElberResponse('elber:canceled', dispatch)
            })

            this.socket.on('elber:error', (response: ElberResponse) => {
                console.error(response)
                handleElberResponse('elber:error', dispatch, ERROR_ELBER)
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