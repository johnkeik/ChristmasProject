const WebSocket = require("ws");
const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');

const app = express();
app.use('/clientImages', express.static(path.join(__dirname, 'clientImages')));

const PORT = 4201;
const server = new https.createServer({
    cert: fs.readFileSync('./ssl/server.crt'),
    key: fs.readFileSync('./ssl/server.key'),
  }, app);

const wss = new WebSocket.Server({server});

let instances = [];
let trainPosition = 0; // edw isws prepei na valoume alli arxiki thesi
const speed = 5; // px per frame kai kala isws na to kanoyme kai auto dinamika
const engineWidth = 220.0; // px theoritika
const wagonWidth = 200; // px theoritika
const numberOfWagons = 6.0; // prepei na to doume me posa that ksekiname

let passengerFileNames = [];
let passengerPaths = [];

function calculateTrainWidth() {
    return engineWidth + wagonWidth * numberOfWagons;
}

function calculateVirtualScreenWidth() {
    return instances.reduce((total, instance) => total + instance.screenWidth, 0);
}

function broadcastTrainPosition() {
    const virtualScreenWidth = calculateVirtualScreenWidth();

    instances.forEach((instance, index) => {
        if (instance.ws.readyState === WebSocket.OPEN) {
            instance.ws.send(
                JSON.stringify({
                    event: "UPDATE_POSITION",
                    trainPosition,
                    trainWidth: calculateTrainWidth(),
                    wagonWidth,
                    engineWidth,
                    numberOfWagons,
                    virtualScreenWidth,
                    instanceIndex: index,
                })
            );
        }
    });
}

setInterval(() => {
    if (instances.length === 0) return;

    const virtualScreenWidth = calculateVirtualScreenWidth();

    trainPosition += speed;

    if (trainPosition > virtualScreenWidth) {
        if (instances.length > 1) {
            trainPosition = 0;
        } else {
            trainPosition = -calculateTrainWidth();
        }
    }
    // we need to think about this maybe?????
    broadcastTrainPosition();
}, 1000 / 60);

wss.on("connection", (ws) => {
    const instance = { ws, screenWidth: 800 };
    instances.push(instance);

    console.log(`New instance gamw. Total instances: ${instances.length}`);

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.event === "UPDATE_SCREEN_WIDTH") {
            instance.screenWidth = data.screenWidth;
            console.log(`Instance ${instances.indexOf(instance)} updated screen width to ${data.screenWidth}px`);
        }

        if (data.event === 'IMAGE' && data.imageData) {
            // Extract the base64 image data (remove the data URL prefix)
            const base64Image = data.imageData.split(';base64,').pop();
            
            // Create a buffer from the base64 string
            const buffer = Buffer.from(base64Image, 'base64');
            
            const imageName = `passenger${passengerFileNames.length}.png`;
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
                passengerFileNames.push(imageName);
                console.log('Ela kai ta names', passengerFileNames);
                passengerPaths.push(filePath);
                console.log('Ela kai ta names', 
                    passengerPaths
                );
              }
            });
        }
    });

    ws.on("close", () => {
        const index = instances.findIndex((inst) => inst.ws === ws);
        if (index !== -1) {
            instances.splice(index, 1);
            console.log(`Instance disconnected. Total instances: ${instances.length}`);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`WebSocket server is fucking running on https://IP:${PORT}`);
});

