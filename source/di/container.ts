import { container } from 'tsyringe'
import { tokens } from './tokens'
import { Exiva } from '../application/services/exiva'
import { Fetch } from '../application/services/fetch';
import { Postgres } from '../infrastructure/database/postgres';
import { HighscoreCollector } from '../application/services/highscore';
import { WorldCollector } from '../application/services/worlds';

const Container = container.createChildContainer()

Container.registerSingleton(tokens.Exiva, Exiva)
Container.register(tokens.HighscoreCollector, HighscoreCollector)
Container.register(tokens.WorldCollector, WorldCollector)
Container.registerSingleton(tokens.Fetch, Fetch)
Container.registerSingleton(tokens.Postgres, Postgres)

export { Container }