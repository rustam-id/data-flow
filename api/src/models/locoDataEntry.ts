import mongoose, { Schema, Document } from 'mongoose';
const keys = require('../config/keys')

// модель единичной записи поступающих данных
export interface ILocoDataItem {
    [propName: string]: string;
}

const entrySchema = new Schema({
    any: Schema.Types.Mixed
}, { strict: false });
// задаем индекс для автоматического удаления записи по указанному сроку
entrySchema.index({ createdAt: 1 }, { expireAfterSeconds: keys.mongo.timeToLiveSeconds })

export default mongoose.model<ILocoDataItem & Document>(keys.NiFiParams.NiFiDataset, entrySchema);