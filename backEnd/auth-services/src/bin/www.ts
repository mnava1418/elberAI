import app from '../app'
import http from 'http'
import {server} from '../config/index.config'
import initFirebase from '../loaders/firebase.loader';

const PORT = server.port || 4041;

const initApps = () => {
  initFirebase()
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
  console.info('Auth Service listening on port: ' + PORT);
}

startServer()