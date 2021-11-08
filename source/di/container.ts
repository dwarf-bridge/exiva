import { container } from 'tsyringe'
import { tokens } from './tokens'
import { Exiva } from '../application/services/exiva'
import { Fetch } from '../application/services/fetch';
import { Postgres } from '../infrastructure/database/postgres';

const Container = container.createChildContainer()

Container.registerSingleton(tokens.Exiva, Exiva)
Container.registerSingleton(tokens.Fetch, Fetch)
Container.registerSingleton(tokens.Postgres, Postgres)

export { Container }