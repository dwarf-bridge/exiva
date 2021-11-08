import 'reflect-metadata'
import { Container } from '../di/container'
import { tokens } from '../di/tokens'
import { Exiva } from '../application/services/exiva'
import cron from 'node-cron'

const exiva = Container.resolve(tokens.Exiva) as Exiva

cron.schedule('*/10 * * * *', () => {
    exiva.run()
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
})
