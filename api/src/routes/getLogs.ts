const keys = require('../config/keys')
import { Router, Request, Response } from 'express'

const router = Router();
const path = require('path')


router.get('/:type', async (request: Request, response: Response) => {
    // путь для общих логов
    let filePath = path.join(__dirname, keys.logs.combinedLogsPath);
    if (request.params.type === 'error') {
        // логи ошибок
        filePath = path.join(__dirname, keys.logs.errorLogsPath);
    }
    response.sendFile(filePath)
})

module.exports = router