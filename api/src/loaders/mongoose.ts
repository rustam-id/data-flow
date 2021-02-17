import mongoose from 'mongoose';
import { Db } from 'mongodb';
const keys = require('../config/keys')

export default async (): Promise<Db> => {
    const connection = await mongoose.connect(keys.mongo.mongoURL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });
    return connection.connection.db;
};