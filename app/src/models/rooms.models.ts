import { Schema, model } from 'mongoose';

interface Room {
    owner: string;
    is_start: boolean;
    max_players_number: number,
    chat_record: [object],
    logs: [object],
    play_can_move: string;
    players: object;
    board: object;
    cards: [number];
    turn: [String];
    end_block_cards: [number];
}

const schema = new Schema<Room>({
    owner: String,
    is_start: {type: Boolean, default: false},
    max_players_number: Number,
    chat_record: Array,
    logs: Array,
    play_can_move: String,
    players: Object,
    board: {type: Object, default: {}},
    cards: Array,
    turn: Array,
    end_block_cards: Array,
});

export const RoomModel = model<Room>('Rooms', schema);
