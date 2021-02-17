import mongoose, { Schema, Document } from 'mongoose';
const keys = require('../config/keys')

// модель словаря доступных типов поступающих данных
export interface ILocoDanType {
    DAN_TYPE: string
}

const entrySchema = new Schema({
    DAN_TYPE: {
        type: String,
        unique: true
    },
    any: Schema.Types.Mixed
});
// задаем индекс для автоматического удаления записи по указанному сроку
entrySchema.index({ createdAt: 1 }, { expireAfterSeconds: keys.mongo.timeToLiveSeconds })

export default mongoose.model<ILocoDanType & Document>('dan_types', entrySchema);