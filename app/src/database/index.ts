import { connect } from 'mongoose';

export const connectDB = async () => {
    await connect('mongodb://mongo:27017/saboteur', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
};
