import { DefaultEventsMap, Socket, Server } from "socket.io";
import quickChat from "../services/quickChat.service";
import { ElberAction, ElberEvent, ElberMessage, ElberRequest, ElberResponse, ElberUser } from "../models/elber.model";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, ongoingConvo: Map<string, {abort?: (() => void) | undefined;}>) => {
    
    const uid = socket.data.user.uid

    const emitResponse = (event: ElberEvent, response: ElberResponse) => {
        io.to(uid).emit(event, response);
    };
    
    socket.on('user:ask', (name: string, messages: ElberMessage[]) => {
        const user: ElberUser = {uid, name}
        const elberRequest: ElberRequest[] = messages.map(message => ({role: message.role, content: message.content}))
        
        if(uid) {
            console.info(`Processing ask from ${uid}`)
            quickChat(user, elberRequest, ongoingConvo, emitResponse)
        }
    })

    socket.on("user:cancel", (action: ElberAction) => {
        console.info(`Received cancel request for ${uid}`);
        
        try { 
            const conversation = ongoingConvo.get(uid);
            if (conversation?.abort) {
                console.info(`Executing abort for ${uid}`);
                conversation.abort();
            } else {
                console.info(`No active conversation found for ${uid}`);
            }
        } catch (error) {
            // Log but don't crash - cancellation errors are expected
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Expected error during cancellation for ${uid}:`, errorMessage);
        }
        
        // Always emit the canceled response and clean up
        const elberResponse: ElberResponse = { action, payload: {}}
        emitResponse('elber:canceled', elberResponse)
        ongoingConvo.delete(uid);
    });
}

export default elberListener