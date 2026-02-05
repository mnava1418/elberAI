import { DefaultEventsMap, Socket, Server } from "socket.io";
import { ElberEvent, ElberRequest, ElberUser } from "../models/elber.model";
import { chat } from "../services/elber.service";
import { saveChatMessage } from "../services/chat.service";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    
    const uid = socket.data.user.uid

    const emitChatResponse = (event: ElberEvent, chatId: number, text: string) => {        
        io.to(uid).emit(event, chatId, text);
    };
    
    socket.on('user:ask', (payload: ElberRequest) => {
        const {text, chatId} = payload
        payload.user.uid = uid
        
        if(uid) {
            console.info(`Processing ask from ${uid}`)                        

            saveChatMessage(uid, chatId, "user", text)
            .catch(error => {
                console.error(error)
            })
            
            chat(payload, emitChatResponse)
        }
    })
}

export default elberListener
