import { RoomModel } from "./models/rooms.models"
import { Server, Socket } from "socket.io";
import { shuffleArray, GAME_SETTING, settingConfigInterface, generateTeams, TEAM_GOOD_SABOTEUR, TEAM_BAD_SABOTEUR } from "./helpers/common";

export const startSocketServer = async (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
    });

    io.on("connection", async (socket: Socket) => {
        socket.on('join', async (data) => {
            const roomId = data.roomId;
            const nickname = data.nickname;

            let room = await RoomModel.findById(roomId);
            let players = room.players;
            
            if (Object.keys(players).length > room.max_players_number || ! Object.keys(players).includes(nickname)) {
                socket.emit('initError', JSON.stringify({
                    'message': '此房間已額滿',
                    'redirect': true,
                }));
                return;
            }
            socket.join(roomId);

            players[nickname]['socket_id'] = socket.id;
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

        socket.on('initGame', async (data) => {
            const roomId = data.roomId;

            let room = await RoomModel.findById(roomId);
            const maxPlayersNumber = room.max_players_number;
            let players = room.players;
            if (Object.keys(players).length < 3) {
                socket.emit('initError', JSON.stringify({
                    'message' : '玩家人數需大於 3 人才能開始',
                    'redirect': false,
                }));
                return;
            }
            let turn: any[] = shuffleArray(Object.keys(players));
            let endBlockCards: number[] = shuffleArray([1, 2, 3]);
            let cards: any[] = room.cards;

            const gameSetting: settingConfigInterface = GAME_SETTING[maxPlayersNumber];

            let teams: string[] = generateTeams(gameSetting.team[TEAM_GOOD_SABOTEUR], gameSetting.team[TEAM_BAD_SABOTEUR]);

            for (const [nickname, info] of Object.entries(players)) {
                const turnNumber = turn.indexOf(nickname);
                const nextPlayer = turnNumber === (maxPlayersNumber - 1) ? turn[0] : turn[turnNumber + 1];
                players[nickname]['next_player'] = nextPlayer;

                cards = shuffleArray(cards);
                teams = shuffleArray(teams);

                players[nickname]['team'] = teams.pop();
                players[nickname]['cards'] = cards.splice(0, gameSetting.cardsNumber);
                players[nickname]['tools'] = {
                    'ax' : 0,
                    'lamp' : 0,
                    'car' : 0,
                }
                players[nickname]['is_ready'] = true;
            }

            await RoomModel.findByIdAndUpdate(room.id, {
                is_start: true,
                end_block_cards: endBlockCards,
                turn: turn,
                players: players,
                cards: cards,
                play_can_move: turn[0],
            });

            socket.to(roomId).emit('initGame', JSON.stringify({
                room: room,
            }));

            socket.emit('initGame', JSON.stringify({
                room: room,
            }));
        });

        socket.on('startGame', async (data) => {
            socket.to(data.roomId).emit('startGame', {});
        });

        socket.on('getRoomInfo', async (data) => {
            const roomId: string = data.roomId;
            let room = await RoomModel.findById(roomId);

            socket.to(roomId).emit('getRoomInfo', JSON.stringify({
                room: room,
            }));
        });

        socket.on('getDeleteBlock', async (data) => {
            const roomId: string = data.roomId;
            const deleteBlockId: string = data.deleteBlockId;
            let room = await RoomModel.findById(roomId);
            console.log({
                room: room,
                deleteBlockId: deleteBlockId,
            });
            socket.to(roomId).emit('getDeleteBlock', JSON.stringify({
                room: room,
                deleteBlockId: deleteBlockId,
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
                nickname: nickname,
                content: content,
            });

            await RoomModel.findByIdAndUpdate(room.id, { chat_record: chatRecord });

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

        socket.on('recordLog', async (data) => {
            const roomId = data.roomId;
            const nickname = data.nickname;
            const message = data.message;

            let room = await RoomModel.findById(roomId);
            let logs = room.logs;

            logs.push({
                nickname: nickname,
                message: message,
            });

            if (logs.length > 3) {
                logs.shift();
            }

            await RoomModel.findByIdAndUpdate(room.id, { logs: logs });

            socket.emit('recordLog', JSON.stringify({
                logs: logs
            }));

            socket.to(roomId).emit('recordLog', JSON.stringify({
                logs: logs
            }));
        });

        socket.on('disconnecting', async () => {
            const roomInfo = socket.rooms.values();
            console.log('disconnect', roomInfo);
            const socketId = roomInfo.next().value;
            const roomId = roomInfo.next().value;
            if (roomId === 'undefined') {
                return;
            }
            let room = await RoomModel.findById(roomId);
            let players = room.players;

            for (const [nickname, info] of Object.entries(players)) {
                if (
                    info.socket_id === socketId
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

