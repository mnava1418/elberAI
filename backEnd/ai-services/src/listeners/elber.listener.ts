import { DefaultEventsMap, Socket, Server } from "socket.io";
import { ElberEvent, ElberRequest, ElberResponse, ElberUser } from "../models/elber.model";
import { chat } from "../services/elber.service";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, ongoingConvo: Map<string, {abort?: (() => void) | undefined;}>) => {
    
    const uid = socket.data.user.uid

    const emitResponse = (event: ElberEvent, response: ElberResponse | string) => {
        if(event === 'elber:stream' || event === 'elber:response') {
            io.to(uid).emit(event, response as string);
        } else {
            io.to(uid).emit(event, response as ElberResponse);
        }
    };
    
    socket.on('user:ask', (payload: ElberRequest) => {
        const {userName, text, conversationId} = payload
        const user: ElberUser = {uid, name: userName}
        if(uid) {
            console.info(`Processing ask from ${uid}`)
            chat(user, text, conversationId, emitResponse )
        }
    })
}

export default elberListener
