const keys = require('../config/keys')
import { Router, Request, Response } from 'express'

const router = Router();


router.post('/:variable', async (request: Request, response: Response) => {
    let variable: any = request.params.variable || ''
    if (request.body.value === undefined) {
        response.send(`Current ${variable} value is ${process.env[request.params.variable]}`)
    } else {
        process.env[variable] = request.body.value
        response.send(`Variable ${variable} set ${request.body.value}`)
    }
})

module.exports = router