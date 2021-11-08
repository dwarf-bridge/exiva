import dotenv from 'dotenv'
import { Knex } from 'knex';

dotenv.config()

export default {
    BASE_URL: 'https://www.tibia.com',
    MAX_BATCH_REQUESTS: 5,
    DATABASE_USER: 'tibia',
    DATABASE_PASSWD: 'tibia',
    AUCTION_DIRECTORY: 'auction/',
    WORLDS_URL: '/community/?subtopic=worlds',
    ONLINE_CHECKING_URL: '/community/?subtopic=worlds&world=',
    HIGHSCORE_URL: '/community/?subtopic=highscores',
    IS_HIGHSCORE_ENABLED: true,
    IS_ONLINE_CHECKING_ENABLED: true,
    IS_AUCTION_ENABLED: true,
    IS_GAMEWORLDS_CHECKING_ENABLED: true,
    IS_DEBUG: true,
}

export namespace Database {
    export const schema = 'collection';
    export const config: { development: Knex.Config, production: Knex.Config } = {
        development: {
            client: 'postgresql',
            connection: {
                host: process.env.DATABASE_HOSTNAME,
                database: process.env.DATABASE_NAME,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                port: Number(process.env.DATABASE_PORT),
            },
            pool: {
                min: Number(process.env.DATABASE_POOL_MIN || 0),
                max: Number(process.env.DATABASE_POOL_MAX || 10),
            },
            migrations: {
                directory: 'migrations',
                tableName: 'knex_migrations',
            },
        },
        production: {
            client: 'postgresql',
            connection: {
                host: process.env.DATABASE_HOSTNAME,
                database: process.env.DATABASE_NAME,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                port: Number(process.env.DATABASE_PORT),
            },
            pool: {
                min: Number(process.env.DATABASE_POOL_MIN),
                max: Number(process.env.DATABASE_POOL_MAX),
            },
            migrations: {
                directory: 'migrations',
                tableName: 'knex_migrations',
            },
        },
    }
}

export namespace Redis {
    export const url = process.env.REDIS_URL
}
