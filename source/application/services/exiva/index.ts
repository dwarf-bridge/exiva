import { Fetch } from '../fetch'
import Config from '../../../config'
import { inject, injectable } from 'tsyringe'
import { tokens } from '../../../di/tokens'
import cheerio, { load } from 'cheerio'
import { Postgres } from '../../../infrastructure/database/postgres'

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
    private content: CharacterOnlineRow[] = []

    constructor(@inject(tokens.Postgres) private db?: Postgres) {}

    public async collect(world: string): Promise<string | undefined> {
        try {
            const result = await Fetch.get(
                Config.ONLINE_CHECKING_URL + `${world}`
            )
            const page = await result.text()
            return page
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

                return {
                    character_name: char_row_node.eq(0).text(),
                    level: char_row_node.eq(1).text(),
                }
            })

            return characters;
        }
    
        return []
    }

    public parse(raw: CharacterOnlineRowRaw[]): CharacterOnlineRow[] {
        const content = raw.map(row => ({
            character_name: row.character_name.trim(),
            level: Number(row.level.trim())
        }))
        this.content = content
        return content
    }

    public async store() {
        const execution_time = new Date();
        await this.db?.instance<CharacterOnlineEntry>('collection.online_checks').insert(this.content.map(entry => ({
            character_name: entry.character_name,
            character_level: entry.level,
            online_at: execution_time,
        })))
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
        const world = 'Nossobra'
        console.log(`Gathering online checks for ${world} at ${new Date()}`)
        const page = await this.collect(world)

        if (page) {
            console.time('online-checking')
            const processed = this.process(page)
            console.timeEnd('online-checking')
            console.log(processed?.length)
            console.log(processed)
            this.parse(processed)
            this.store();
        }
        this.emit()
        console.log(`Online check for ${world} just completed at ${new Date()}`!)
    }
}
