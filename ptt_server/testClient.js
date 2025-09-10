import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
    console.log('Connected to PTT server');

    // Send a test message
    ws.send(JSON.stringify({ type: 'text', payload: 'Hello from client' }));
});

ws.on('message', (msg) => {
    console.log('Received:', msg.toString());
});

ws.on('close', () => console.log('Disconnected'));
ws.on('error', (err) => console.error(err));
