import { DefaultEventsMap, Socket, Server } from "socket.io";

const elberListener = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on('elber:ask', (userMessage: string) => {
        console.log('User Message', userMessage)
        io.to(socket.data.uuid).emit("elber:response", "Ya te vi qlito!");
    })
}

export default elberListener