import { Schema, model } from 'mongoose';

interface Bbs {
    nickname: string;
    type: string;
    content: string;
    created_date: string;
}

const schema = new Schema<Bbs>({
    nickname: String,
    type: String,
    content: String,
    created_date: String,
});

export const BbsModel = model<Bbs>('Bbs', schema);
