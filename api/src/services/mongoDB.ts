import Logger from '../utils/logger';

/*
    MongoDB:
    Сервис для обращений к БД.
    Оптимизация структур данных перед записью.
*/

export default class MongoDB {
    constructor() { }
    // запись полученных данных в БД
    static async uploadEntries({ data: uploadedData, schema, type = '' }: { data: any[], schema: any, type?: string }) {
        Logger.info(`MongoDB загрузка ${type} началась:  ${Date()}`)
        if (Array.isArray(uploadedData)) {
            if (!uploadedData.length) {
                throw new Error(`MongoDB попытка сформировать пустую запись`)
            }
            Logger.info(`Записей ${type} для загрузки в MongoDB: ${uploadedData.length}`)
            await this.bulkHandler(uploadedData, schema)
                .then((_: any) => Logger.info(`MongoDB загрузка ${type} успешно завершена: ${Date()}`))
                .catch((e: Error) => Logger.error(`services.mongoDB.uploadEntries: MongoDB ошибка загрузки ${type}: ${e}`))
        }
    }
    // обработчик для разбивки и загрузки крупных массивов
    static async bulkHandler(uploadedData: any[], schema: any) {
        let toInsert = [];
        for (let i = 0; i < uploadedData.length; i++) {
            toInsert.push(uploadedData[i]);
            const isLastItem = i === uploadedData.length - 1;
            if (i % 100 === 0 || isLastItem) {
                await schema.insertMany(toInsert);
                toInsert = [];
            }
        }
    }
}
