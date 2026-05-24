import { DefaultEventsMap, Socket, Server } from "socket.io";
import elberListener from './elber.listener';

const socketSetListeners = (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    elberListener(socket)
}

export default socketSetListeners
