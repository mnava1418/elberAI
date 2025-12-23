import { DefaultEventsMap, Socket, Server } from "socket.io";
import { ElberEvent, ElberResponse, ElberUser } from "../models/elber.model";
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
    
    socket.on('user:ask', (name: string, text: string) => {
        const user: ElberUser = {uid, name}
        if(uid) {
            console.info(`Processing ask from ${uid}`)
            chat(user, text, emitResponse )
        }
    })
}

export default elberListener
