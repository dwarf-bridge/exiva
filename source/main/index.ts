import 'reflect-metadata'
import { Container } from '../di/container'
import { tokens } from '../di/tokens'
import { Exiva } from '../application/services/exiva'
import { HighscoreCollector } from '../application/services/highscore'
import { WorldCollector } from '../application/services/worlds'
import { Postgres } from '../infrastructure/database/postgres'
import { Database } from '../config'
import cron from 'node-cron'
import dotenv from 'dotenv'

dotenv.config()

const exiva = Container.resolve(tokens.Exiva) as Exiva
const highscore = Container.resolve(
    tokens.HighscoreCollector
) as HighscoreCollector
const worlds = Container.resolve(tokens.WorldCollector) as WorldCollector
const database = Container.resolve(tokens.Postgres) as Postgres

/**
 * É possível obter quem está caçando (top 1000)
 * porque os dados da tabela de highscore é atualizado;
 */
console.info('service:collector')
;(async () => {
    const isAvailable = await database.isAvailable()
    if (isAvailable) {
        console.time('database:migrations')
        await database.instance.migrate.latest()
        console.timeEnd('database:migrations')
        console.time('service:world')
        const worldsList = await database.instance
            .select('id', 'name')
            .from(`${Database.schema}.game_worlds`)!
        console.timeEnd('service:world')
        if (!worldsList.length) {
            const worlds = Container.resolve(
                tokens.WorldCollector
            ) as WorldCollector
            await worlds.run()
            console.info('service:collector:worlds:done')
        }

        // cron.schedule(
        //     '0 0 9 * * *',
        //     async () => {
        //         console.time('services:worlds-collector')
        //         await worlds.run()
        //         console.timeEnd('services:worlds-collector')
        //     },
        //     {
        //         scheduled: true,
        //         timezone: 'America/Sao_Paulo',
        //     }
        // )
        // cron.schedule(
        //     '*/5 * * * *',
        //     async () => {
        //         console.time('services:highscore-collector')
        //         await highscore.setWorld('Nossobra').run()
        //         console.timeEnd('services:highscore-collector')
        //     },
        //     {
        //         scheduled: true,
        //         timezone: 'America/Sao_Paulo',
        //     }
        // )
        cron.schedule(
            '*/15 * * * *',
            async () => {
                console.time('services:exiva')
                await exiva.run()
                console.timeEnd('services:exiva')
            },
            {
                scheduled: true,
                timezone: 'America/Sao_Paulo',
            }
        )
    } else {
        process.exit(1)
    }
})()
