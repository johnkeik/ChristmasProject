const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

const server = new https.createServer({
  cert: fs.readFileSync('./ssl/server.crt'),
  key: fs.readFileSync('./ssl/server.key'),
});

const wss = new WebSocket.Server({ server });
let clients = [];

wss.on('connection', (socket) => {
  clients.push(socket);
  const clientIndex = clients.length - 1;
  console.log(`Client ${clientIndex} connected`);

  socket.send(JSON.stringify({ type: 'assignIndex', index: clientIndex }));

  if (clientIndex === 0) {
    socket.send(JSON.stringify({ type: 'startAnimation' }));
  }

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(data);
    if (data.type === 'objectExited') {
      console.log(`Client ${clientIndex} completed animation`);

      const nextClientIndex = (clientIndex + 1) % clients.length;
      const nextClient = clients[nextClientIndex];

      if (nextClient && nextClient.readyState === WebSocket.OPEN) {
        nextClient.send(JSON.stringify({ type: 'startAnimation' }));
      }
    }
  });

  socket.on('close', () => {
    console.log(`Client ${clientIndex} disconnected`);
    clients = clients.filter((client) => client !== socket);
  });
});

server.listen(4201, '0.0.0.0', () => {
    console.log('Server is running on https://0.0.0.0:4201');
});