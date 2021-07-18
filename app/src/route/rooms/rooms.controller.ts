import { Request, Response } from "express";
import { RoomModel } from "../../models/rooms.models"

export const create = async function (req: Request, res: Response) {
    const name = req.body.name;
    let players = {};
    players[name] = {
        team: '',
        cards: [],
        next_player: '',
    };

    const room = await new RoomModel({
        owner: name,
        play_can_move: '',
        players: players,
    }).save();

    return res.json({ status: '200', data: {
        room_id : room.id
    }});
};

export const startGame = async function (req: Request, res: Response) {
    const roomId = req.params.id;
    const joinPlayers = req.params.players;

    const room = await RoomModel.findById(roomId);
    let players = room.players;

    return res.json({
        status: '200', data: {
            room_id: room.id
        }
    });
};

export const getRoomInfo = async function (req: Request, res: Response) {
    const roomId = req.params.id;

    const room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });
};

export const joinPlayers = async function (req: Request, res: Response) {
    const roomId = req.params.id;
    const name = req.body.name;

    let room = await RoomModel.findById(roomId);
    let players = room.players;

    players[name] = {
        team: '',
        cards: [],
        next_player: '',
    };

    room['players'] = players;

    await RoomModel.findByIdAndUpdate(roomId, room);

    return res.json({ status: '200'});
};

export const getPlayerInfo = async function (req: Request, res: Response) {
    const roomId = req.params.id;
    const name = req.params.name;

    let room = await RoomModel.findById(roomId);
    let player = room.players[name];

    return res.json({ status: '200', data: player });
};

export const updateCard = async function (req: Request, res: Response) {
    const roomId = req.params.id;
    const name = req.params.name;
    const cardId = req.body.cardId;
    const board = req.body.board;

    let room = await RoomModel.findById(roomId);
    let player = room.players[name];

    return res.json({ status: '200', data: player });
};
