const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

const server = new https.createServer({
  cert: fs.readFileSync('./ssl/server.crt'),
  key: fs.readFileSync('./ssl/server.key'),
});

const wss = new WebSocket.Server({ server });
let clients = [];

const calculateWidthSum = () => {
  return clients.reduce((sum, client) => sum + (client.width || 0), 0);
};

// Function to broadcast the width sum to all clients
const broadcastWidthSum = () => {
  const widthSum = calculateWidthSum();
  console.log(`Total width sum: ${widthSum}`);
  clients.forEach((client) => {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ type: 'widthSum', widthSum }));
    }
  });
};

wss.on('connection', (socket) => {
  const client = { socket, width: null };
  clients.push(client);
  const clientIndex = clients.length - 1;
  console.log(`Client ${clientIndex} connected`);

  socket.send(JSON.stringify({ type: 'assignIndex', index: clientIndex }));

  if (clientIndex === 0) {
    socket.send(JSON.stringify({ type: 'startAnimation' }));
  }

  socket.on('message', (message) => {
    const data = JSON.parse(message);
    console.log(data);
    console.log("🚀 ~ socket.on ~ data:", data, socket)

    if(data.type === 'screenWidth'){
      client.width = data.width;
      console.log(`Client ${clientIndex} screen width: ${client.width}`);

      broadcastWidthSum();
    }
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
    clients = clients.filter((client) => client.socket !== socket);
    broadcastWidthSum();
  });
});

server.listen(4201, '0.0.0.0', () => {
    console.log('Server is running on https://0.0.0.0:4201');
});