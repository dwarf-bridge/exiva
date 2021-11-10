import { worlds_summary_processor } from './processor'
import { worlds_summary_parser } from './parser'
import { Page } from '../../../domain/types'
import cheerio from 'cheerio'
import { WorldSummary, GameWorldRow, GameWorldEntry } from './types'
import { Fetch } from '../fetch'
import config from '../../../config'
import { inject, injectable } from 'tsyringe'
import { tokens } from '../../../di/tokens'
import { Postgres } from '../../../infrastructure/database/postgres'
 
export const get_worlds = async () => {
    return Fetch.get(config.WORLDS_URL)
}

@injectable()
export class WorldCollector {
    private world_page: string | null = null
    private summaries: WorldSummary[] = []
    private regular_worlds: WorldSummary[] = []
    private tournament_worlds: WorldSummary[] = []
    constructor(@inject(tokens.Postgres) private db?: Postgres) {}

    /**
     * Collect the General World Summary page from offical website;
     * @returns the page as string
     */
    public async collect() {
        try {
            const worlds_page_request = await get_worlds()

            if (worlds_page_request.status === 403) {
                this.handle_prohibited_access()
            }

            this.world_page = await worlds_page_request.data;

            return this.world_page
        } catch (err) {
            await this.handle_timeout_request()
        }
    }

    public async process() {
        if (this.world_page) {
            const page: Page = cheerio.load(this.world_page)
            const processed_worlds = new worlds_summary_processor(
                page
            ).process()
            const {
                regular_worlds,
                tournament_worlds,
            } = new worlds_summary_parser(processed_worlds).parse()

            this.summaries = [...regular_worlds, ...tournament_worlds]
            this.regular_worlds = regular_worlds;
            this.tournament_worlds = tournament_worlds;
        }
    }
    
    public async populate_game_worlds() {
        await this.collect()
        this.process()
    }

    private async handle_prohibited_access() {
        console.error(
            `Retrying world_summary at ${new Date()} because of prohibited access`
        )
    }

    private async handle_timeout_request() {
        console.error(
            `Retrying world_summary at ${new Date()} because of timeout request`
        )
    }

    public async store() {
        const rworlds: GameWorldEntry[] = this.regular_worlds.map(world => ({
            name: world.name,
            battle_eye: world.battle_eye!,
            location: world.location!,
            pvp_type: world.pvp_type!,
            server_conditions: world.server_conditions,
            merged_into: null,
            merged_at: null,
            is_special_world: false,
            server_titles: []
        }))

        const tworlds: GameWorldEntry[] = this.tournament_worlds.map(world => ({
            name: world.name,
            battle_eye: world.battle_eye!,
            location: world.location!,
            pvp_type: world.pvp_type!,
            server_conditions: world.server_conditions,
            merged_into: null,
            merged_at: null,
            is_special_world: true,
            server_titles: []
        }))
        await this.db?.instance<GameWorldEntry>('collection.game_worlds').insert(rworlds).onConflict("name")
        .ignore();
        await this.db?.instance<GameWorldEntry>('collection.game_worlds').insert(tworlds).onConflict("name")
        .ignore();
    }

    public async collect_and_process() {
        await this.collect()
        this.process()
        this.store()
    }

    /**
     * Obtém dos registros salvos no Banco de Dados
     * as informações de summary dos Mundos
     */
    public async get_worlds_summary(since: Date | null, until: Date | null) {
        /**
         * # Todo: Get from Worlds Summary Repository
         */

        return {
            name: 'Nossobra',
            time_series: [
                {
                    online_players: 100,
                    verified_at: new Date(),
                },
            ],
            location: 'south-america',
            pvp_type: 'retro-open',
            aditional_information: [],
        }
    }

    public async run() {
        await this.collect_and_process()
        return
    }
}
