const keys = require('../config/keys')
import expressLoader from './express';
import mongooseLoader from './mongoose';
import express from 'express';
import Logger from '../utils/logger';
import DataFlow from '../services/dataFlow';

export default async ({ expressApp }: { expressApp: express.Application }): Promise<void> => {
    try {
        const mongoConnection = await mongooseLoader();
        Logger.info('MongoDB подключена');
    } catch (error) {
        Logger.error(`loaders.index: MongoDB connection error: ${error}`);
    }

    await expressLoader({ app: expressApp });
    Logger.info('Express подключен');

    // запуск чтения/записи поступающих данных
    await DataFlow.handleDataFlow()

};