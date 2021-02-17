import mongoose, { Schema, Document } from 'mongoose';
const keys = require('../config/keys')

// модель словаря доступных типов поступающих данных
export interface ILaterPool {
    DAN_TYPE: string,
    fromdate: string,
    todate: string,
}

const laterPoolSchema = new Schema({
    DAN_TYPE: {
        type: String
    },
    fromdate: String,
    todate: String,
});

// индекс для автоматического удаления записи по указанному сроку
laterPoolSchema.index({ createdAt: 1 }, { expireAfterSeconds: keys.mongo.timeToLiveLaterPool })
// индекс для уникального сочетания DAN_TYPE и fromdate
laterPoolSchema.index({ DAN_TYPE: 1, fromdate: 1 }, { unique: true });

export default mongoose.model<ILaterPool & Document>('later_pool', laterPoolSchema);