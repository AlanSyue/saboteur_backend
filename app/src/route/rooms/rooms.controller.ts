import { Request, Response } from "express";
import { RoomModel } from "../../models/rooms.models"
import { generateCards, TOOL_CARD_IDS, TEAM_GOOD_SABOTEUR, TEAM_BAD_SABOTEUR } from "../../helpers/common"

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
        is_ban: false,
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
    const room = await RoomModel.findById(roomId);

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

    const hasPlayer = Object.keys(players).includes(name);

    if (hasPlayer) {
        return res.json({ status: '200', data: room });
    }

    if (Object.keys(players).length >= maxPlayersNumber) {
        return res.json({ status: '400' });
    }

    players[name] = {
        team: '',
        cards: [],
        next_player: '',
        socket_id: '',
        is_ban: false
    };

    room['players'] = players;

    await RoomModel.findByIdAndUpdate(roomId, room);

    return res.json({ status: '200', data: room });
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
    const directionCenter: boolean = req.body.center;
    const cardStyle: string = req.body.style;
    const haveToUpdateBoard: boolean = req.body.haveToUpdateBoard ?? true;
    const haveToDeleteCard: boolean = req.body.haveToDeleteCard ?? false;

    let room = await RoomModel.findById(roomId);

    if (room.play_can_move !== name) {
        return res.json({ status: '400' });
    }

    if (room.players[name]['is_ban'] && !TOOL_CARD_IDS.includes(cardId)) {
        return res.json({ status: '400' });
    }

    let board: Map<string, object> = new Map(Object.entries(room.board));
    let cards: number[] = room.cards;
    let players = room.players;
    let playerCards: number[] = players[name]['cards'];
    const goldIndex: number = room.gold_index;
    let openEndCards: number[] = room.open_end_cards;

    if (haveToUpdateBoard) {
        if (!board.has(positionX)) {
            board.set(positionX, {
                [positionY]: {
                    'cardId': cardId,
                    'top': directionTop,
                    'bottom': directionBottom,
                    'left': directionLeft,
                    'right': directionRight,
                    'center': directionCenter,
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
                    'center': directionCenter,
                    'style': cardStyle,
                }
            }

            board.set(positionX, positionData);
        }
    }

    const newCardId: number = cards.shift();

    if (typeof newCardId !== 'undefined') {
        playerCards.splice(playerCards.indexOf(cardId), 1, newCardId);
        players[name]['cards'] = playerCards;
    } else {
        playerCards.splice(playerCards.indexOf(cardId), 1);
    }

    let nextPlayer = await getNextPlayer(
        name,
        players
    );

    let isNoOneCanMove = false
    let finishPosition = [];
    let winTeam: number = 0;

    if (nextPlayer === 'NO_ONE_CAN_MOVE') {
        isNoOneCanMove = true;
        winTeam = parseInt(TEAM_BAD_SABOTEUR);
    }

    let finalBoard = Object.fromEntries(board);

    if (await checkIsFinish({ x: '1', y: '9' }, finalBoard)) {
        finishPosition.push(0);
    }

    if (await checkIsFinish({ x: '3', y: '9' }, finalBoard)) {
        finishPosition.push(1);
    }

    if (await checkIsFinish({ x: '5', y: '9' }, finalBoard)) {
        finishPosition.push(2);
    }
    if (finishPosition.includes(goldIndex)) {
        isNoOneCanMove = true;
        winTeam = parseInt(TEAM_GOOD_SABOTEUR);
        nextPlayer = 'NO_ONE_CAN_MOVE';
    }

    if (!finishPosition.length) {
        openEndCards = [...openEndCards, ...finishPosition];
    }

    await RoomModel.findByIdAndUpdate(roomId, {
        board: finalBoard,
        players: players,
        cards: cards,
        play_can_move: nextPlayer,
        is_end: isNoOneCanMove,
        win_team: winTeam,
        open_end_cards: [...new Set(finishPosition)],
    });

    room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });
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

    if (typeof newCardId !== 'undefined') {
        playerCards.splice(playerCards.indexOf(cardId), 1, newCardId);
        players[name]['cards'] = playerCards;
    } else {
        playerCards.splice(playerCards.indexOf(cardId), 1);
    }

    players[targetName]['tools'] = tools;

    if (Object.values(tools).reduce((a: number, b: number) => a + b) === 0) {
        players[targetName]['is_ban'] = false;
    } else {
        players[targetName]['is_ban'] = true;
    }

    const nextPlayer = await getNextPlayer(
        name,
        players
    );

    let isNoOneCanMove = false
    let winTeam = 0;
    if (nextPlayer === 'NO_ONE_CAN_MOVE') {
        isNoOneCanMove = true;
        winTeam = parseInt(TEAM_BAD_SABOTEUR);
    }

    await RoomModel.findByIdAndUpdate(roomId, {
        players: players,
        cards: cards,
        play_can_move: nextPlayer,
        is_end: isNoOneCanMove,
        win_team: winTeam
    });

    room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });
}

/**
 * @param  {Request} req
 * @param  {Response} res
 * @returns Promise
 */
export const deleteCard = async function (req: Request, res: Response): Promise<Response> {
    const roomId: string = req.params.id;
    const name: string = req.params.name;
    const cardId: number = parseInt(req.body.cardId);

    let room = await RoomModel.findById(roomId);

    if (room.play_can_move !== name) {
        return res.json({ status: '400' });
    }

    let cards: number[] = room.cards;
    let players = room.players;
    let playerCards: number[] = players[name]['cards'];

    const newCardId: number = cards.shift();

    if (typeof newCardId !== 'undefined') {
        playerCards.splice(playerCards.indexOf(cardId), 1, newCardId);
        players[name]['cards'] = playerCards;
    } else {
        playerCards.splice(playerCards.indexOf(cardId), 1);
    }

    const nextPlayer = await getNextPlayer(
        name,
        players
    );

    let isNoOneCanMove = false
    let winTeam = 0;
    if (nextPlayer === 'NO_ONE_CAN_MOVE') {
        isNoOneCanMove = true;
        winTeam = parseInt(TEAM_BAD_SABOTEUR);
    }

    await RoomModel.findByIdAndUpdate(roomId, {
        players: players,
        cards: cards,
        play_can_move: nextPlayer,
        is_end: isNoOneCanMove,
        win_team: winTeam
    });

    room = await RoomModel.findById(roomId);

    return res.json({ status: '200', data: room });

}

export const getNextPlayer = async (currentPlayer: string, players: Object, counter: number = 1): Promise<string> => {
    if (counter > Object.keys(players).length) {
        return 'NO_ONE_CAN_MOVE';
    }
    const nextPlayer = players[currentPlayer]['next_player'];
    const isCurrentPlayerReady = players[currentPlayer]['is_ready'];
    const nextPlayerInfo = players[nextPlayer];
    const nextPlayerCards = nextPlayerInfo.cards;

    if (!nextPlayerCards.length || !nextPlayerInfo['is_ready']) {
        return await getNextPlayer(
            nextPlayer,
            players,
            counter = counter + 1
        );
    }

    return nextPlayer;
}
interface Position {
    x: string,
    y: string
}

const checkIsFinish = async (gold: Position, board: object) => {
    let open: Array<Position> = [{ x: '3', y: '1' }];
    let closed: Array<Position> = [];

    while (open.length > 0) {
        const card = open.pop();

        if (cardEquals(card, gold)) {
            return true;
        }

        closed.push(card);

        const neighbours = getNeighbouringCards(card.x, card.y, board);

        neighbours.forEach(function (neighbour) {
            if (typeof board[neighbour.x] == 'undefined' || typeof board[neighbour.x][neighbour.y] == 'undefined') {
                return;
            }

            const isClosed = !!closed.filter(function (card) {
                return cardEquals(neighbour, card);
            }).length;

            if (isClosed) {
                return;
            }

            neighbour.parent = card;
            open.push(neighbour);
        });
    }

    return false;
}


const cardEquals = (start: Position, goal: Position) => {
    return start.x === goal.x && start.y === goal.y;
}

const getNeighbouringCards = (x: string, y: string, board: object) => {
    let result = [];
    const numberX = parseInt(x);
    const numberY = parseInt(y);

    if (typeof board[x] !== 'undefined' && typeof board[x][y] !== 'undefined') {
        const card = board[x][y];
        if (card.center == 'false') {
            return [];
        }
        if (card.left == 'true' && numberX > 1) {
            result.push({ x: (numberX - 1).toString(), y: y });
        }
        if (card.top == 'true' && numberY > 1) {
            result.push({ x: x, y: (numberY - 1).toString() });
        }
        if (card.right == 'true' && numberX < 5) {
            result.push({ x: (numberX + 1).toString(), y: y });
        }
        if (card.bottom == 'true' && numberY < 9) {
            result.push({ x: x, y: (numberY + 1).toString() });
        }
    }

    return result;
}
