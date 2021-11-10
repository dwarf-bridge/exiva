import 'reflect-metadata'
import { Container } from '../di/container'
import { tokens } from '../di/tokens'
import { Exiva } from '../application/services/exiva'
import { HighscoreCollector } from '../application/services/highscore'
import { WorldCollector } from '../application/services/worlds'
import cron from 'node-cron'

const exiva = Container.resolve(tokens.Exiva) as Exiva
const highscore = Container.resolve(tokens.HighscoreCollector) as HighscoreCollector
const worlds = Container.resolve(tokens.WorldCollector) as WorldCollector

/**
 * É possível obter quem está caçando (top 1000)
 * porque os dados da tabela de highscore é atualizado;
 */
console.info('Collector is now running...');
// worlds.run()
cron.schedule(
    '0 0 9 * * *',
    () => {
        console.info('World Summaries is now running');
        worlds.run()
        console.info('World Summaries just completed');
    },
    {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
    }
)

console.info("Highscore is running")
highscore.setWorld('Nossobra').run()
cron.schedule(
    '*/20 * * * *',
    () => {
        highscore.setWorld('Nossobra').run()
    },
    {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
    }
)

console.info("Exiva is running")
cron.schedule(
    '*/15 * * * *',
    () => {
        exiva.run()
    },
    {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
    }
)
