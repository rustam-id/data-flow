const keys = require('../config/keys')
import axios from '../utils/axios';
import { startByCron, tryItAgain } from '../decorators'
import Logger from '../utils/logger';
import DTListSchema, { ILocoDanType } from '../models/DTList';
import EntrySchema from '../models/locoDataEntry';
import MongoDB from './mongoDB'
import LaterPool from './laterPool'
import { ILaterPool } from '../models/laterPoolEntry';

/*
    DataFlow:
    Сервис для управления чтением и записью поступаюших данных.
    Управляет остальными сервисами, задается основной порядок и условия чтения/записи.
*/

class DataFlow {
    constructor() { }
    // управляющая ф-я  получения и записи поступающих данных по cron
    @startByCron(keys.schedules.daily)
    static async handleDataFlow() {
        // повторное получение не загруженных dan type за прошедшие дни
        const laterPoolDanTypes = await LaterPool.getLaterPoolDanTypes()
        if (laterPoolDanTypes.length) {
            laterPoolDanTypes.forEach(async (danType: any) => {
                const url = `${keys.NiFiParams.NiFiURL}${danType.DAN_TYPE}&fromdate=${danType.fromdate}&todate=${danType.todate}`
                let receivedDataFlow = await DataFlow.getDataFlow({ url })
                if (receivedDataFlow) {
                    const type: string = `data_flow from LaterPool danType: ${danType.DAN_TYPE} за ${danType.fromdate}`
                    await MongoDB.uploadEntries({ data: receivedDataFlow, schema: EntrySchema, type })
                        .then((_: any) => LaterPool.deleteLaterPoolDanType(danType))
                        .catch((e: Error) => Logger.error(`services.dataFlow.handleDataFlow: ошибка записи поступающих данных за прошедшие дни из Later Pool: ${e}`))
                } else {
                    Logger.error(`services.dataFlow.handleDataFlow: Данные за прошедшие дни из Later Pool не получены. API ${url} request failed. `)
                }
            })
        }
        // получение доступных dan type
        let receivedDanTypes = await DataFlow.getDataFlow({ url: keys.NiFiParams.danTypesListURL })
        if (receivedDanTypes) {
            // DTListSchema.collection.drop();
            const type: string = `доступные dan_types`
            await MongoDB.uploadEntries({ data: receivedDanTypes, schema: DTListSchema, type })
        }
        // const receivedDanTypes: ILocoDanType[] = [{ DAN_TYPE: 'loco_26' }]    // костыль пока не работают все типы

        // получение поступающих данных по dan type за последние сутки
        if (receivedDanTypes.length) {
            receivedDanTypes.forEach(async (danType: ILocoDanType) => {
                let receivedDataFlow = await DataFlow.getDataFlow({ url: keys.NiFiParams.NiFiURL + danType.DAN_TYPE })
                if (receivedDataFlow) {
                    const type: string = `Поступившие по danType: ${danType.DAN_TYPE} за прошедшие сутки`
                    await MongoDB.uploadEntries({ data: receivedDataFlow, schema: EntrySchema, type })
                } else {
                    // создание пула по данным, не полученным с сервера (для последующих повторных попыток)
                    LaterPool.createLaterPool(danType)
                }
            })
        } else {
            Logger.error(`services.dataFlow.handleDataFlow: Доступные за прошедшие сутки dan_type не получены. API ${keys.NiFiParams.danTypesListURL} request failed.`)
        }
    }
    // получение данных из nifi
    @tryItAgain(keys.NiFiParams.attemptsNumber, keys.NiFiParams.delayBetweenRequests)
    static async getDataFlow({ url }: { url: string }) {
        axios.defaults.headers.common['APIKey'] = keys.NiFiParams.APIKey
        return axios.get(url, {
            timeout: keys.NiFiParams.timeoutMs,
        })
            .then((response) => {
                Logger.info(response.data.length
                    ? `API ${url} request done: ${response.data.length} записей получено`
                    : `API ${url} request done: для запрашиваемого типа записей не содержится`);
                Logger.info(`API ${url} время ожидания ответа: ${response.responseTime?.toFixed(2)} секунд`);
                return response.data
            })
            .catch(err => {
                Logger.error(`services.dataflow.getDataFlow.get: API ${url} ошибка запроса: ${err}`)
                return false
            })
    }
}

export default DataFlow