const keys = require('../config/keys')
import Logger from '../utils/logger';
import { ILocoDanType } from '../models/DTList';
import moment from 'moment'
import LaterPoolSchema, { ILaterPool } from '../models/laterPoolEntry';
import MongoDB from './mongoDB'
import { Document } from 'mongoose';

/* 
    LaterPool:
    Сервис для обработки  случаев, когда не удалось загрузить поступающие данные в штатном режиме.
    Признаки пропущенных данных пишутся в БД для последующих повторных попыток.
*/

export default class LaterPool {
    constructor() { }
    // создание пула по данным, не полученным с сервера
    static async createLaterPool(danType: ILocoDanType) {
        Logger.info(`Dan type ${danType.DAN_TYPE} добавлен в LaterPool`)
        const start = moment().startOf('day').format(keys.NiFiParams.timestampFormat);
        const end = moment().endOf('day').format(keys.NiFiParams.timestampFormat);
        const data: ILaterPool = {
            fromdate: start,
            todate: end,
            ...danType,
        }
        const type: string = `danType: ${danType.DAN_TYPE} в LaterPool`
        await MongoDB.uploadEntries({ data: [data], schema: LaterPoolSchema, type })
    }
    static async getLaterPoolDanTypes() {
        const danTypes: ILaterPool[] = await LaterPoolSchema.find()
        Logger.info(danTypes.length
            ? `Получено ${danTypes.length} значений dan_type из очереди LaterPool`
            : `Значений dan_type в очереди LaterPool не содержится`);
        return danTypes
    }
    static async deleteLaterPoolDanType(deletedDanType: Document) {
        const result = await LaterPoolSchema.findOneAndDelete({ _id: deletedDanType._id }, (err: Error, res: any) => {
            return res
        })
        return result
    }

}

