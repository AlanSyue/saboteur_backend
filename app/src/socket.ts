import { RoomModel } from "./models/rooms.models"

export const connectSocket = async (server) => {
    const SocketServer = require('ws').Server
    var wss = new SocketServer({ server })

    wss.on('connection', ws => {
        ws.on("message", async (message) => {
            const roomId = message;
            const room = await RoomModel.findById(roomId);
            ws.send(JSON.stringify(room));
        })
        ws.on('close', () => {
            console.log('Close connected')
        })
    })
};


