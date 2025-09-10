// pttHandler.js
import { v4 as uuidv4 } from 'uuid';

let clients = {}; // { clientId: ws }

/**
 * Broadcast JSON messages (text, control, metadata)
 */
function broadcastMessage(senderId, payload, type, targetIds = []) {
    const msg = JSON.stringify({ senderId, type, payload });

    if (targetIds.length === 0) {
        // Broadcast to all except sender
        Object.entries(clients).forEach(([id, ws]) => {
            if (id !== senderId && ws.readyState === ws.OPEN) {
                ws.send(msg);
            }
        });
    } else {
        // Send to specific targets
        targetIds.forEach(id => {
            if (clients[id] && clients[id].readyState === clients[id].OPEN) {
                clients[id].send(msg);
            }
        });
    }
}

/**
 * Broadcast binary audio chunks
 */
function broadcastAudio(senderId, buffer, targetIds = []) {
    if (targetIds.length === 0) {
        Object.entries(clients).forEach(([id, ws]) => {
            if (id !== senderId && ws.readyState === ws.OPEN) {
                ws.send(buffer);
            }
        });
    } else {
        targetIds.forEach(id => {
            if (clients[id] && clients[id].readyState === clients[id].OPEN) {
                clients[id].send(buffer);
            }
        });
    }
}

/**
 * Handle new client connection
 */
export function handlePTTConnection(ws, wss) {
    const clientId = uuidv4();
    clients[clientId] = ws;
    ws.currentTargets = []; // store active audio targets

    console.log(`Client connected: ${clientId}`);
    ws.send(JSON.stringify({ type: 'id', clientId }));

    ws.on('message', (msg) => {
        // If JSON (string), treat as control/message
        if (typeof msg === 'string') {
            let data;
            try { data = JSON.parse(msg); } catch (e) { return; }

            const { type, targetIds = [], payload } = data;

            if (type === 'start_stream') {
                ws.currentTargets = targetIds; // save audio targets
                console.log(`Client ${clientId} started streaming → targets:`, targetIds);
            } 
            else if (type === 'stop_stream') {
                ws.currentTargets = [];
                console.log(`Client ${clientId} stopped streaming`);
            } 
            else {
                // Normal text/control message
                broadcastMessage(clientId, payload, type, targetIds);
            }
        } 
        
        // If binary, treat as audio chunk
        else if (Buffer.isBuffer(msg)) {
            broadcastAudio(clientId, msg, ws.currentTargets);
        }
    });

    ws.on('close', () => {
        delete clients[clientId];
        console.log(`Client disconnected: ${clientId}`);
    });
}
