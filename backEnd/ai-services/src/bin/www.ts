import app from '../app'
import http from 'http'
import {server} from '../config/index.config'
import socketLoader from '../loaders/socket.loader';

const PORT = server.port || 4042;

const initApps = () => {
    socketLoader()
}

const startServer = () => {
  app.set('port', PORT);
  const server = http.createServer(app);
  
  //Loaders
  initApps()

  server.listen(PORT);
  server.on('listening', onListening);
}

const onListening = () => {
  console.info('AI Service listening on port: ' + PORT);
}

startServer()