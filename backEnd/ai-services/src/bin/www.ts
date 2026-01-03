import app from '../app'
import http from 'http'
import {server} from '../config/index.config'
import socketLoader from '../loaders/socket.loader';
import initFirebase from '../loaders/firebase.loader';
import cleanOldSessions from '../loaders/sessionHandler.loader';

const PORT = server.port || 4042;

// Global error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
    if (error.name === 'APIUserAbortError' || error.constructor?.name === 'APIUserAbortError') {
        console.info('Caught APIUserAbortError - ignoring as this is expected during stream cancellation');
        return;
    }
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    if (reason && typeof reason === 'object' && 
        ((reason as any).name === 'APIUserAbortError' || (reason as any).constructor?.name === 'APIUserAbortError')) {
        console.info('Caught unhandled APIUserAbortError rejection - ignoring as this is expected during stream cancellation');
        return;
    }
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const initApps = (server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) => {
    socketLoader(server)    
    initFirebase()
    cleanOldSessions
}

const startServer = () => {
  app.set('port', PORT);
  const server = http.createServer(app);
    
  //Loaders
  initApps(server)
  
  server.listen(PORT);
  server.on('listening', onListening);  
}

const onListening = () => {
  console.info('AI Service listening on port: ' + PORT);
}

startServer()