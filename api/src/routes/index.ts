import { Router } from 'express';
const router = Router()

const getLogsRoute = require('./getLogs')       
const remoteControlRoute = require('./remoteControl')       


router.use('/logs', getLogsRoute)           // маршрут для доступа к логам
router.use('/control', remoteControlRoute)    // маршрут для удаленного управления сервисом

export default router