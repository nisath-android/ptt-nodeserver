import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';   // <- named import
import { handlePTTConnection } from './ws/pttHandler.js';
import mediaRouter from './controllers/mediaController.js';
import config from './config.js';

const app = express();
app.use(express.json());
app.use('/uploads', express.static(config.UPLOAD_DIR));
app.use('/media', mediaRouter);

const server = http.createServer(app);
//const wss = new WebSocketServer({ server });   // <- use WebSocketServer
const wss = new WebSocketServer({ server, host: '0.0.0.0' });

wss.on('connection', (ws) => handlePTTConnection(ws, wss));

server.listen(config.PORT, () => {
    console.log(`PTT server running on port ${config.PORT}`);
});
