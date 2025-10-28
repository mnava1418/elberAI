import { DefaultEventsMap, Socket, Server } from "socket.io";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on('elber:ask', (userMessage: string) => {
        const uid = socket.data.user.uid

        if(uid) {
            io.to(uid).emit("elber:response", "Ya te vi qlito! " + userMessage);
        }
    })
}

export default elberListener