const WebSocket = require("ws");

const PORT = 8088;
const wss = new WebSocket.Server({ port: PORT });

let instances = [];
let trainPosition = 0; // edw isws prepei na valoume alli arxiki thesi
const speed = 5; // px per frame kai kala isws na to kanoyme kai auto dinamika
const engineWidth = 220.0; // px theoritika
const wagonWidth = 200; // px theoritika
const numberOfWagons = 6.0; // prepei na to doume me posa that ksekiname

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
    });

    ws.on("close", () => {
        const index = instances.findIndex((inst) => inst.ws === ws);
        if (index !== -1) {
            instances.splice(index, 1);
            console.log(`Instance disconnected. Total instances: ${instances.length}`);
        }
    });
});

console.log(`WebSocket server is fucking running on ws://localhost:${PORT}`);
