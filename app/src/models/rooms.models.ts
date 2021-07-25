import { Schema, model } from 'mongoose';

interface Room {
    owner: string;
    max_players_number: number,
    chat_record: [object],
    play_can_move: string;
    players: object;
    board?: object;
    cards: [number];
}

const schema = new Schema<Room>({
    owner: String,
    max_players_number: Number,
    chat_record: Array,
    play_can_move: String,
    players: Object,
    board: {type: Object, default: null},
    cards: Array,
});

export const RoomModel = model<Room>('Rooms', schema);
