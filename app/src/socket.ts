import { RoomModel } from "./models/rooms.models"
import { Server, Socket } from "socket.io";

export const startSocketServer = async (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://127.0.0.1:5500",
            methods: ["GET", "POST"]
        },
    });

    io.on("connection", async (socket: Socket) => {
        socket.on('join', async (data) => {
            const roomId = data.roomId;
            const nickname = data.nickname;

            socket.join(roomId);

            let room = await RoomModel.findById(roomId);
            let players = room.players;

            players[nickname]['socketId'] = socket.id;
            room.players = players;
            await RoomModel.findByIdAndUpdate(room.id, room);

            socket.to(roomId).emit('roomInfo', JSON.stringify(room));
        });

        socket.on('showRole', async (data) => {
            const roomId = data.roomId;
            const isShow = data.show;

            socket.to(roomId).emit('showRole', JSON.stringify({
                show: isShow,
            }));
        });

        socket.on('startGame', async (data) => {
            const roomId = data.roomId;
            
            let room = await RoomModel.findById(roomId);
            let players = room.players;

            for (const [nickname, info] of Object.entries(players)) {
                players[nickname]['is_ready'] = true;
            }

            await RoomModel.findByIdAndUpdate(room.id, { players: players });

            socket.to(roomId).emit('startGame', JSON.stringify({
                roomId : roomId,
            }));
        });

        socket.on('sendMessage', async (data) => {
            const roomId = data.roomId;
            const nickname = data.nickname;
            const content = data.content;

            if (content.trim() === '') {
                return;
            }

            let room = await RoomModel.findById(roomId);
            let chatRecord = room.chat_record;

            chatRecord.push({
                nickname : nickname,
                content: content,
            });

            await RoomModel.findByIdAndUpdate(room.id, { chat_record : chatRecord});

            socket.emit('sendMessage', JSON.stringify({
                chatRecord: {
                    nickname: nickname,
                    content: content,
                }
            }));

            socket.to(roomId).emit('sendMessage', JSON.stringify({
                chatRecord: {
                    nickname: nickname,
                    content: content,
                }
            }));
        });

        socket.on('disconnecting', async () => {
            const roomInfo = socket.rooms.values();
            const socketId = roomInfo.next().value;
            const roomId = roomInfo.next().value;

            let room = await RoomModel.findById(roomId);
            let players = room.players;

            for (const [nickname, info] of Object.entries(players)) {
                if (
                    info.socketId === socketId
                    && typeof info.is_ready !== 'undefined'
                    && !info.is_ready
                ) {
                    delete players[nickname];
                }
            }

            room.players = players;

            await RoomModel.findByIdAndUpdate(room.id, { players: players });

            socket.to(roomId).emit('roomInfo', JSON.stringify(room));
        });
    });
};


