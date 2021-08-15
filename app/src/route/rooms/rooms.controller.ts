import { Request, Response } from "express";
import { RoomModel } from "../../models/rooms.models"
import { generateCards } from "../../helpers/common"

/**
 * @param  {Request} req
 * @param  {Response} res
 * @returns Promise
 */
export const create = async function (req: Request, res: Response): Promise<Response> {
    const name: string = req.body.name;
    const maxPlayersNumber: number = req.body.maxPlayersNumber;
    let players: Object = {};

    players[name] = {
        team: '',
        cards: [],
        next_player: '',
    };

    const room = await new RoomModel({
        owner: name,
        max_players_number: maxPlayersNumber,
        play_can_move: '',
        cards: generateCards(),
        players: players,
    }).save();

    return res.json({
        status: '200', data: {
            room_id: room.id
        }
    });
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
    const maxPlayersNumber = room.max_players_number;

    if (Object.keys(players).length >= maxPlayersNumber) {
        return res.json({ status: '400' });
    }

    players[name] = {
        team: '',
        cards: [],
        next_player: '',
        socket_id: '',
    };

    room['players'] = players;

    await RoomModel.findByIdAndUpdate(roomId, room);

    return res.json({ status: '200' });
};

export const getPlayerInfo = async function (req: Request, res: Response) {
    const roomId = req.params.id;
    const name = req.params.name;

    let room = await RoomModel.findById(roomId);
    let player = room.players[name];

    return res.json({ status: '200', data: player });
};

/**
 * @param  {Request} req
 * @param  {Response} res
 * @returns Promise
 */
export const putCard = async function (req: Request, res: Response): Promise<Response> {
    const roomId: string = req.params.id;
    const name: string = req.params.name;
    const cardId: number = parseInt(req.body.cardId);
    const positionX: string = req.body.positionX;
    const positionY: string = req.body.positionY;
    const directionTop: boolean = req.body.top;
    const directionBottom: boolean = req.body.bottom;
    const directionLeft: boolean = req.body.left;
    const directionRight: boolean = req.body.right;
    const cardStyle: string = req.body.style;
    const haveToUpdateBoard: boolean = req.body.haveToUpdateBoard ?? true;
    const haveToDeleteCard: boolean = req.body.haveToDeleteCard ?? false;

    let room = await RoomModel.findById(roomId);

    if (room.play_can_move !== name) {
        return res.json({ status: '400' });
    }

    let board: Map<string, object> = new Map(Object.entries(room.board));
    let cards: number[] = room.cards;
    let players = room.players;
    let playerCards: number[] = players[name]['cards'];

    if (haveToUpdateBoard) {
        if (!board.has(positionX)) {
            board.set(positionX, {
                [positionY]: {
                    'cardId': cardId,
                    'top': directionTop,
                    'bottom': directionBottom,
                    'left': directionLeft,
                    'right': directionRight,
                    'style': cardStyle,
                }
            });
        } else {
            let positionData = board.get(positionX);
            if (haveToDeleteCard) {
                delete positionData[positionY];
            } else {
                positionData[positionY] = {
                    'cardId': cardId,
                    'top': directionTop,
                    'bottom': directionBottom,
                    'left': directionLeft,
                    'right': directionRight,
                    'style': cardStyle,
                }
            }

            board.set(positionX, positionData);
        }
    }

    const newCardId: number = cards.shift();
    playerCards.splice(playerCards.indexOf(cardId), 1, newCardId);
    players[name]['cards'] = playerCards;

    await RoomModel.findByIdAndUpdate(roomId, {
        board: Object.fromEntries(board),
        players: players,
        cards: cards,
        play_can_move: players[name]['next_player'],
    });

    room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });
}

interface toolsInterface {
    ax: number,
    lamp: number,
    car: number,
}

/**
 * @param  {Request} req
 * @param  {Response} res
 * @returns Promise
 */
export const updateTools = async function (req: Request, res: Response): Promise<Response> {
    const roomId: string = req.params.id;
    const name: string = req.params.name;
    const cardId: number = parseInt(req.body.cardId);
    const targetName: string = req.body.targetName;
    const tools = req.body.tools;

    let room = await RoomModel.findById(roomId);

    if (room.play_can_move !== name) {
        return res.json({ status: '400' });
    }
    let cards: number[] = room.cards;
    let players = room.players;
    let playerCards: number[] = players[name]['cards'];

    const newCardId: number = cards.shift();
    playerCards.splice(playerCards.indexOf(cardId), 1, newCardId);
    players[name]['cards'] = playerCards;
    players[targetName]['tools'] = tools;

    await RoomModel.findByIdAndUpdate(roomId, {
        players: players,
        cards: cards,
        play_can_move: players[name]['next_player'],
    });

    room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });
}
