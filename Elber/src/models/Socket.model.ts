import { io, Socket } from "socket.io-client"
import { SOCKET_URL } from "@env"
import { getAuth, getIdToken } from '@react-native-firebase/auth';
import { ElberRequest } from "./elber.model";
import handleChatResponse from "../services/elber.service";
import { ElberMessage } from "./chat.model";

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
        
        if (this.socket) {
            this.disconnect()
        }

        this.socket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ["websocket"],
            forceNew: false,
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

            this.socket.removeAllListeners();           

            this.socket.on('elber:stream', (chatId: number, text: string) => {
                handleChatResponse(dispatch, 'elber:stream', {chatId, text})              
            })

            this.socket.on('elber:response', (chatId: number, text: string) => {
                handleChatResponse(dispatch, 'elber:response', {chatId, text} )
            })

            this.socket.on('elber:title', (chatId: number, text: string) => {
                handleChatResponse(dispatch, 'elber:title', {chatId, text})
            })

            this.socket.on('elber:error', (chatId: number, text: string) => {
                console.error(text)
                handleChatResponse(dispatch, 'elber:error',  {chatId, text: "No manches, se me hizo bolas el engrudo! Dame un minuto pa' recomponerme." })
            })
        }
    }

    sendMessage(chatId: number, title: string, userMessage: ElberMessage, dispatch: (value: any) => void) {
        const currentUser = getAuth().currentUser
        
        if(this.socket && this.socket.connected && currentUser) {
            const elberRequest: ElberRequest = {
                chatId,
                text: userMessage.content,
                userName: currentUser.displayName || '',
                title
            }
            this.socket.emit('user:ask', elberRequest )
        } else {
            handleChatResponse(dispatch, 'elber:error',  {chatId, text: "¡Pinche conexión se hizo la desaparecida y nos dejó tirados! Intenta de nuevo." })
        }
    }
}

export default SocketModel