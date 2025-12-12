import { DefaultEventsMap, Socket, Server } from "socket.io";
import quickChat from "../services/quickChat.service";
import { ElberEvent, ElberMessage, ElberRequest, ElberResponse, ElberUser } from "../models/elber.model";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, ongoingConvo: Map<string, {abort?: (() => void) | undefined;}>) => {
    
    const uid = socket.data.user.uid

    const emitResponse = (event: ElberEvent, response: ElberResponse | string) => {
        if(event === 'elber:stream' || event === 'elber:response') {
            io.to(uid).emit(event, response as string);
        } else {
            io.to(uid).emit(event, response as ElberResponse);
        }
    };
    
    socket.on('user:ask', (name: string, messages: ElberMessage[]) => {
        const user: ElberUser = {uid, name}
        const elberRequest: ElberRequest[] = messages.map(message => ({role: message.role, content: message.content}))
        
        if(uid) {
            console.info(`Processing ask from ${uid}`)
            quickChat(user, elberRequest, ongoingConvo, emitResponse)
        }
    })
}

export default elberListener
