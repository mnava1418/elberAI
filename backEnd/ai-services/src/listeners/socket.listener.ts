import { DefaultEventsMap, Socket, Server } from "socket.io";
import elberListener from './elber.listener';

const socketSetListeners = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, ongoingConvo: Map<string, {abort?: (() => void) | undefined;}>) => {
    elberListener(io, socket, ongoingConvo)
}

export default socketSetListeners
