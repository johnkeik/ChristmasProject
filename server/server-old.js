const WebSocket = require('ws');
const fs = require('fs');
const https = require('https');
const path = require('path');

const server = new https.createServer({
  cert: fs.readFileSync('./ssl/server.crt'),
  key: fs.readFileSync('./ssl/server.key'),
});

const wss = new WebSocket.Server({ server });
let clients = [];

let passengers = [];

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
    if (data.type === 'image' && data.imageData) {
      // Extract the base64 image data (remove the data URL prefix)
      const base64Image = data.imageData.split(';base64,').pop();
      
      // Create a buffer from the base64 string
      const buffer = Buffer.from(base64Image, 'base64');
      
      const imageName = `passenger${passengers.length}.png`;
      // Define the file path where the image will be saved
      const filePath = path.join(__dirname, 'clientImages', imageName);
      
      // Ensure the uploads directory exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Write the image buffer to a file
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error('Error saving image:', err);
        } else {
          console.log('Image saved successfully');
          passengers.push(imageName);
          console.log(passengers)
        }
      });
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