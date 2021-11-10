import { Database } from '../../config'
import knex, { Knex } from 'knex'
import { injectable } from 'tsyringe'
import { wait } from '../../main/utils/wait'

@injectable()
export class Postgres {
    public instance: Knex

    constructor() {
        const config =
            process.env.NODE_ENV === 'production'
                ? Database.config.production
                : Database.config.development
        this.instance = knex({
            client: 'postgresql',
            connection: config.connection,
            pool: config.pool,
            acquireConnectionTimeout: 2000,
            ...config,
        })
    }

    public async isAvailable() {
        const MAX_RETRIES = 5
        for (let trial = 1; trial <= MAX_RETRIES; trial++) {
            try {
                console.log(`infra:database | connection trial no. ${trial}`)
                await this.instance.raw('SELECT NOW();')
                console.info('infra:database | connected')
                return true
            } catch (err) {
                await wait(2000)
            }
        }

        return false
    }
}
