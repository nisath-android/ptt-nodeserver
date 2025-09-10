import { v4 as uuidv4 } from 'uuid';

let clients = {}; // { clientId: ws }

function broadcast(senderId, message, type, targetIds = []) {
    if (targetIds.length === 0) {
        Object.entries(clients).forEach(([id, ws]) => {
            if (id !== senderId && ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ senderId, type, message }));
            }
        });
    } else {
        targetIds.forEach(id => {
            if (clients[id] && clients[id].readyState === clients[id].OPEN) {
                clients[id].send(JSON.stringify({ senderId, type, message }));
            }
        });
    }
}

export function handlePTTConnection(ws, wss) {
    const clientId = uuidv4();
    clients[clientId] = ws;
    console.log(`called handlePTTConnection () => Client connected: ${clientId}`);

    ws.send(JSON.stringify({ type: 'id', clientId }));

    ws.on('message', (msg) => {
        let data;
        try { data = JSON.parse(msg); } catch(e) { return; }

        const { type, targetIds, payload } = data;
        broadcast(clientId, payload, type, targetIds);
    });

    ws.on('close', () => {
        delete clients[clientId];
        console.log(`Client disconnected: ${clientId}`);
    });
}
