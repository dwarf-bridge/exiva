import { Database } from '../../config'
import knex, { Knex } from 'knex'
import { injectable } from 'tsyringe'

@injectable()
export class Postgres {
    public instance: Knex

    constructor() {
        const config = process.env.NODE_ENV === 'production' ? Database.config.production : Database.config.development
        this.instance = knex({
            client: 'postgresql',
            connection: config.connection,
            pool: config.pool,
            acquireConnectionTimeout: 2000,
        })
    }
}
