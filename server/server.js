const WebSocket = require("ws");
const fs = require("fs");
const https = require("https");
const path = require("path");
const express = require("express");

const app = express();
app.use("/clientImages", express.static(path.join(__dirname, "clientImages")));

const PORT = 4201;
const server = new https.createServer(
  {
    cert: fs.readFileSync("./ssl/server.crt"),
    key: fs.readFileSync("./ssl/server.key"),
  },
  app
);

const wss = new WebSocket.Server({ server });

let passengerFileNames = [];

const imagesDir = path.join(__dirname, 'clientImages');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
} else {
  // Read existing files from the directory and populate the array
  const files = fs.readdirSync(imagesDir);
  files.forEach((file) => {
    if (file.endsWith('.png')) {
      passengerFileNames.push(file);
    }
  });
}

console.log('Existing images:', passengerFileNames);

let instances = [];
let trainPosition = 0; // edw isws prepei na valoume alli arxiki thesi
const speed = 5; // px per frame kai kala isws na to kanoyme kai auto dinamika
const engineWidth = 220.0; // px theoritika
const wagonWidth = 200; // px theoritika
let numberOfWagons = Math.ceil(passengerFileNames.length / 5); // prepei na to doume me posa that ksekiname
let stationIsSet = false;


function calculateTrainWidth() {
  return engineWidth + wagonWidth * numberOfWagons;
}

function calculateVirtualScreenWidth() {
  return instances.reduce((total, instance) => total + instance.screenWidth, 0);
}

function broadcastTrainPosition() {
  const trainWidth = calculateTrainWidth();
  const virtualScreenWidth = calculateVirtualScreenWidth();

  instances.forEach((instance, index) => {
    const instanceStart = instances
      .slice(0, index)
      .reduce((total, inst) => total + inst.screenWidth, 0);

    const localPosition = trainPosition - instanceStart;

    const trainEnd = localPosition + trainWidth;
    const isVisible = trainEnd > 0 && localPosition < instance.screenWidth;

    if (isVisible && instance.ws.readyState === WebSocket.OPEN) {
      instance.ws.send(
        JSON.stringify({
          event: "UPDATE_POSITION",
          trainPosition,
          trainWidth,
          wagonWidth,
          engineWidth,
          numberOfWagons,
          virtualScreenWidth,
          localPosition,
          instanceIndex: index,
          passengerImages: passengerFileNames
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
    trainPosition = -calculateTrainWidth();
  }

  broadcastTrainPosition();
}, 1000 / 60);
wss.on("connection", (ws) => {
  const instance = { ws, screenWidth: 800 };
  if (instances.length === 0 && !stationIsSet) {
    ws.send(JSON.stringify({ event: "SET_STATION" }));
    stationIsSet = true;
  } else {
    instances.push(instance);
  }

  console.log(`New instance gamw. Total instances: ${instances.length}`);

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.event === "UPDATE_SCREEN_WIDTH") {
      instance.screenWidth = data.screenWidth;
      console.log(
        `Instance ${instances.indexOf(instance)} updated screen width to ${
          data.screenWidth
        }px`
      );
    }

    if (data.event === "SAVE_IMAGE" && data.imageData) {
      // Extract the base64 image data (remove the data URL prefix)
      const base64Image = data.imageData.split(";base64,").pop();

      // Create a buffer from the base64 string
      const buffer = Buffer.from(base64Image, "base64");

      const imageName = `passenger${passengerFileNames.length}.png`;
      // Define the file path where the image will be saved
      const filePath = path.join(__dirname, "clientImages", imageName);

      // Ensure the uploads directory exists
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Write the image buffer to a file
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          console.error("Error saving image:", err);
        } else {
          console.log("Image saved successfully");
          passengerFileNames.push(imageName);
          numberOfWagons = Math.ceil(passengerFileNames.length / 5);
          ws.send(JSON.stringify({
            event: 'PASSENGER_IMAGES',
            passengerImages: passengerFileNames
          }))
        }
      });
    }
  });

  ws.on("close", () => {
    const index = instances.findIndex((inst) => inst.ws === ws);
    if (index !== -1) {
      instances.splice(index, 1);
      console.log(
        `Instance disconnected. Total instances: ${instances.length}`
      );
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server is fucking running on https://{{IP}}:${PORT}`);
});
