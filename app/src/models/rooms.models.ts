import { Schema, model } from 'mongoose';

interface Room {
    owner: string;
    is_start: boolean;
    is_end: boolean;
    max_players_number: number,
    chat_record: [object],
    logs: [object],
    play_can_move: string;
    players: object;
    board: object;
    cards: [number];
    turn: [String];
    end_block_cards: [number];
    gold_index: number,
    win_team: number,
    open_end_cards: [number],
}

const schema = new Schema<Room>({
    owner: String,
    is_start: {type: Boolean, default: false},
    is_end: { type: Boolean, default: false },
    max_players_number: Number,
    chat_record: Array,
    logs: Array,
    play_can_move: String,
    players: Object,
    board: {type: Object, default: {}},
    cards: Array,
    turn: Array,
    end_block_cards: Array,
    gold_index: Number,
    win_team: { type: Number, default: 0 },
    open_end_cards: { type: Array, default: [] },
});

export const RoomModel = model<Room>('Rooms', schema);
