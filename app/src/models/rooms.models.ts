import { Schema, model } from 'mongoose';

interface Room {
    owner: string;
    play_can_move: string;
    players: object;
    board?: object;
    cards: [number];
}

const schema = new Schema<Room>({
    owner: String,
    play_can_move: String,
    players: Object,
    board: {type: Object, default: null},
    cards: Array,
});

export const RoomModel = model<Room>('Rooms', schema);
