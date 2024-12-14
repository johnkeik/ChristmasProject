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
let randomImageIndexes = [];

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
      randomImageIndexes.push(Math.floor(Math.random() * 4));
    }
  });
}

console.log('Existing images:', passengerFileNames);

let instances = [];
let trainPosition = 0; // edw isws prepei na valoume alli arxiki thesi
const speed = 7; // px per frame kai kala isws na to kanoyme kai auto dinamika
const engineWidth = 450.0; // px theoritika
const wagonWidth = 260.0; // px theoritika
const stellaWidth = 450.0;

let stationIsSet = false;

function calculateTrainWidth() {
  return stellaWidth + engineWidth + wagonWidth * passengerFileNames.length;
}

function calculateVirtualScreenWidth() {
  return instances.reduce((total, instance) => total + instance.screenWidth, 0);
}

function broadcastTrainPosition() {
  const trainWidth = calculateTrainWidth();
  const virtualScreenWidth = calculateVirtualScreenWidth();

  instances.forEach((instance, index) => {
    const instanceStart = instances.slice(0, index).reduce((total, inst) => total + inst.screenWidth, 0);
    const instanceEnd = instanceStart + instance.screenWidth;

    // Calculate local position relative to the current instance
    let localPosition = trainPosition - instanceStart;

    if (trainPosition > virtualScreenWidth - trainWidth) {
      const newStart = -virtualScreenWidth + trainPosition;
      if (index === 0) {
        localPosition = newStart;
      } else {
        if (newStart + trainWidth > instanceStart) {
          localPosition = newStart - instanceStart;
        }

      }
    }
    // Check if the train is visible on this instance's screen
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
          stellaWidth,
          numberOfWagons: passengerFileNames.length,
          virtualScreenWidth,
          localPosition,
          instanceIndex: index,
          passengerImages: passengerFileNames,
          randomImageIndexes: randomImageIndexes
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
    trainPosition = 0;
  }

  broadcastTrainPosition();
}, 1000 / 40);
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
        `Instance ${instances.indexOf(instance)} updated screen width to ${data.screenWidth
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
          randomImageIndexes.push(Math.floor(Math.random() * 4));
          ws.send(JSON.stringify({
            event: 'PASSENGER_IMAGES',
            passengerImages: passengerFileNames,
            randomImageIndexes: randomImageIndexes
          }))
        }
      });
    }
  });

  ws.on("close", () => {
    if (instances.length === 0) {
      stationIsSet = false;
    } else {
      const index = instances.findIndex((inst) => inst.ws === ws);
      if (index !== -1) {
        instances.splice(index, 1);
        if (instances.length === 0) {
          stationIsSet = false;
        }
        console.log(
          `Instance disconnected. Total instances: ${instances.length}`
        );
      }
    }


  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server is fucking running on https://{{IP}}:${PORT}`);
});
