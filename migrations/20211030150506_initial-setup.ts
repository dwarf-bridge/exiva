import { Knex } from 'knex'
import { Database } from '../source/config'
import MigrationUtils from '../source/infrastructure/database/utils/migration'

export async function up(knex: Knex): Promise<void> {
    console.info("Applying migrations...")
    const schema = MigrationUtils.schema(knex)
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    await knex.raw(`CREATE SCHEMA IF NOT EXISTS ${Database.schema};`)
    await knex.schema
        .withSchema(Database.schema)
        .createTable('vocations', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)

            table.enum('name', [
                'None',
                'Druid',
                'Elder Druid',
                'Knight',
                'Elite Knight',
                'Paladin',
                'Royal Paladin',
                'Sorcerer',
                'Master Sorcerer',
            ]).notNullable()
            table.integer('reference').notNullable()
        })

        await knex('vocations').withSchema(Database.schema).insert([
            { name: 'None', reference: 0 },
            { name: 'Druid', reference: 1 },
            { name: 'Elder Druid', reference: 2 },
            { name: 'Knight', reference: 3 },
            { name: 'Elite Knight', reference: 4 },
            { name: 'Paladin', reference: 5 },
            { name: 'Royal Paladin', reference: 6 },
            { name: 'Sorcerer', reference: 7 },
            { name: 'Master Sorcerer', reference: 8 },
        ])
    /**
     * World Summary
     */
    await knex.schema
        .withSchema(Database.schema)
        .createTable('world_summaries', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)

            table.string('world_name').notNullable().comment(`World's name.`)

            table
                .string('online_players')
                .notNullable()
                .comment('Online players at this very moment.')
        })

    /**
     * Game Worlds
     */
    await knex.schema
        .withSchema(Database.schema)
        .createTable('game_worlds', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)

            table.string('name').notNullable().comment('Game World name')
            table
                .enum('battle_eye', [
                    'fully-protected',
                    'protected',
                    'inactive',
                ])
                .notNullable()
                .comment("Battle Eye's status")
            table
                .enum('pvp_type', [
                    'open',
                    'optional',
                    'retro-hardcore',
                    'hardcore',
                    'retro-open',
                ])
                .notNullable()
                .comment('PvP Status of this World')
            table
                .enum('location', ['europe', 'north-america', 'south-america'])
                .notNullable()
                .comment("This World's location")
            table
                .specificType('server_conditions', 'text ARRAY')
                .notNullable()
                .comment('Conditions applied to this game server')
        })

    /**
     * Highscores
     */
    await knex.schema
        .withSchema(Database.schema)
        .createTable('highscores', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)

            table
                .integer('rank')
                .notNullable()
                .comment('Player rank at the time')
            table.string('name').notNullable().comment("Player's name")
            table.integer('level').notNullable().comment("Player's level")
            table.bigInteger('points').notNullable().comment("Player's point")
            table.date('date').notNullable().comment('Date of current rank')
            table
                .uuid('game_world')
                .notNullable()
                .comment('Game World')
                .references('id')
                .inTable(`${Database.schema}.game_worlds`)
            table.integer('vocation').notNullable().comment("Player's vocation")
        })

    // Online Characters Entries
    await knex.schema
        .withSchema(Database.schema)
        .createTable('online_checks', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)

            table.string('character_name').notNullable().comment("Character's name")
            table.integer('character_level').notNullable().comment("Character's level")
            table.datetime('online_at').notNullable().comment("Character was online at this datetime")
        })

    await knex.schema
        .withSchema(Database.schema)
        .createTable('actions', (table) => {
            const columns = schema(table)
            columns.primaryUuid()

            table.timestamps(true, true)
            
            table.string('action_name').notNullable().comment("Action's name")
            table.string('world_name').notNullable().comment("World's name")
            table.datetime('executed_at').notNullable().comment("Execution datetime")
        })
        console.info("The migrations has been applied.")
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.withSchema(Database.schema).dropTable('world_summaries')
    await knex.schema.withSchema(Database.schema).dropTable('highscores')
    await knex.schema.withSchema(Database.schema).dropTable('game_worlds')
    await knex.schema.withSchema(Database.schema).dropTable('vocations')
}
