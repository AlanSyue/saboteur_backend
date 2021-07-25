import { Schema, model } from 'mongoose';

interface Bbs {
    nickname: string;
    type: string;
    content: string;
}

const schema = new Schema<Bbs>({
    nickname: String,
    type: String,
    content: String,
});

export const BbsModel = model<Bbs>('Bbs', schema);
