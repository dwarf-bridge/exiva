import { Fetch } from '../fetch'
import Config, { Database } from '../../../config'
import { inject, injectable } from 'tsyringe'
import { tokens } from '../../../di/tokens'
import cheerio, { load } from 'cheerio'
import { Postgres } from '../../../infrastructure/database/postgres'
import { wait } from '../../../main/utils/wait'

/**
 * Observations
 *
 * It does cost like 50kb each run to save these information;
 * 7200 kb in a day;
 * 216000 kb in a month (216 mb of data storage each month for each server);
 *
 *
 * dwarfbridge.com/exiva?world=Nossobra
 * - Show a graph pointing to players by hour;
 * - Unique players at the World;
 */

export type Page = ReturnType<typeof load>

export type CharacterOnlineRowRaw = {
    character_name: string
    level: string
}

export type CharacterOnlineRow = {
    character_name: string
    level: number
}

export type CharacterOnlineEntry = {
    character_name: string
    character_level: number
    online_at: Date
}

@injectable()
export class Exiva {
    private page: Page | null = null
    private world: { name: string; id: string } | null = null
    private content: CharacterOnlineRow[] = []
    private worlds: { name: string; id: string }[] = []

    constructor(@inject(tokens.Postgres) private db?: Postgres) {}

    public async collect(world: string): Promise<string | undefined> {
        try {
            console.info(`service:exiva:collect | world: ${world}`)
            const result = await Fetch.get(
                Config.ONLINE_CHECKING_URL + `${world}`
            )
            return result.data
        } catch (err) {
            console.log(err)
        }
    }

    public process(page: string): CharacterOnlineRowRaw[] {
        const result: Page = cheerio.load(page)
        this.page = result
        if (this.page) {
            const set = this.page('div.InnerTableContainer tbody')
                .eq(2)
                .contents()
                .toArray()
                .slice(1, -2)

            const characters = set.map((character) => {
                const char_row_node = this.page!(character).contents()

                const character_name = char_row_node.eq(0).text()
                const level = char_row_node.eq(1).text()

                return {
                    character_name,
                    level,
                }
            })

            return characters.filter(
                (char) =>
                    char.character_name.length <= 255 ||
                    isNaN(Number(char.level))
            )
        }

        return []
    }

    public parse(raw: CharacterOnlineRowRaw[]): CharacterOnlineRow[] {
        const content = raw.map((row) => ({
            character_name: row.character_name.trim(),
            level: Number(row.level.trim()),
        }))
        this.content = content
        return content
    }

    public async store(world_id: string) {
        const execution_time = new Date()
        if (this.content.length === 0) {
            console.info('service:online_check | no online players')
            return
        }

        const characterList = this.content.map((entry) => ({
            character_name: entry.character_name,
            character_level: entry.level,
            online_at: execution_time,
            game_world: world_id,
        }))
        await this.db
            ?.instance<CharacterOnlineEntry>('collection.online_checks')
            .insert(characterList)
    }

    public emit() {
        /**
         * Responsabilities
         * - Emit Action Event;
         * - Emit Data;
         * - Store Data (for now);
         */
    }

    public async run() {
        const worlds: { id: string; name: string }[] = await this.db?.instance
            .select('id', 'name')
            .from(`${Database.schema}.game_worlds`)!
        for (let world of worlds) {
            const page = await this.collect(world.name)
            if (page) {
                const processed = this.process(page)
                this.parse(processed)
                await this.store(world.id)
            }
            await wait(100)
        }
        this.emit()
    }
}
