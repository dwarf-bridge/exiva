import { highscore_processor } from './processor'
import { highscore_parser } from './parser'
// import { game_worlds_repository } from '../../../domain/services/game_worlds/infrastructure'
import { Ranking } from './types'
import { inject, injectable } from 'tsyringe'

import cheerio, { load } from 'cheerio'
export type Page = ReturnType<typeof load>
import Config, { Database } from '../../../config'
import { Fetch } from '../fetch'
import { tokens } from '../../../di/tokens'
import { Postgres } from '../../../infrastructure/database/postgres'
import { Container } from '../../../di/container'
import { WorldCollector } from '../worlds'
import { wait } from '../../../main/utils/wait'

const mount_highscore_uri = (
    world: string,
    category: string,
    vocation: string,
    page: number
) => {
    return `${Config.HIGHSCORE_URL}&world=${world}&category=${category}&profession=${vocation}&currentpage=${page}&beprotection=-1`
}

export const get_highscore_page = async (
    world: string,
    category: string,
    vocation: string,
    page: number
) => {
    console.log(`Requesting to ${Config.HIGHSCORE_URL}`)
    console.info(
        'world:',
        world,
        '\n',
        'category:',
        category,
        '\n',
        'vocation',
        vocation,
        '\n',
        'page',
        page
    )
    return Fetch.get(mount_highscore_uri(world, category, vocation, page))
}
/**
 * Current issues:
 *  - Failures keep a endless loop.
 */

type World = { id: string; name: string }
@injectable()
export class HighscoreCollector {
    private world: string | null = null
    private worlds: { id: string; name: string }[] = []
    private ranking_pages: string[] = []
    private rankings: Ranking[] = []
    private category: number = 6;
    private categories: { category: string, reference: number }[] = [];

    constructor(@inject(tokens.Postgres) private db?: Postgres) {}

    public setWorld(world: string) {
        this.world = world
        this.ranking_pages = []
        this.rankings = []
        this.categories = []
        return this
    }

    public async collect(game_world_name: string) {
        this.categories = await this.db?.instance
            .select('category', 'reference')
            .from(`${Database.schema}.highscore_categories`)!

        const maxPage = 20
        for (let page = 1; page <= maxPage; page++) {
            try {
                const ranking_page = await get_highscore_page(
                    game_world_name,
                    this.category.toString(),
                    '0',
                    page
                )

                if (ranking_page.status === 403) {
                    this.handle_prohibited_access()
                }

                this.ranking_pages.push(ranking_page.data)
                await wait(100)
            } catch (err) {
                await this.handle_timeout_request()
            }
        }
        return this.ranking_pages
    }

    public process(): Ranking[] {
        if (this.ranking_pages.length) {
            this.rankings = this.ranking_pages
                .map((ranking_page) => {
                    const page: Page = cheerio.load(ranking_page)
                    const processed_highscore = new highscore_processor(
                        page
                    ).process()
                    const parsed_highscore = new highscore_parser(
                        processed_highscore
                    ).parse()
                    return parsed_highscore
                })
                .flat()
        }

        return this.rankings
    }

    public async collect_and_process(world: World) {
        await this.collect(world.name)
        this.process()
        await this.store(world.id)
    }

    private async store(game_world_id: string) {
        const rankings = this.rankings.map((rank) => {
            return {
                ...rank,
                date: new Date(),
                game_world: game_world_id,
                category: this.category,
            }
        })

        await this.db?.instance('collection.highscores').insert(rankings)
    }

    private async handle_prohibited_access() {
        console.error(
            `Retrying highscore at ${new Date()} because of prohibited access`
        )
        // return this.collect()
    }

    private async handle_timeout_request() {
        console.error(
            `Retrying highscore at ${new Date()} because of timeout request`
        )
        // return this.collect()
    }

    public async run() {
        const worlds: { id: string; name: string }[] = await this.db?.instance
        .select('id', 'name')
        .from(`${Database.schema}.game_worlds`)!
        console.info("worlds", worlds.length)
        for (let world of worlds) {
            await this.collect_and_process(world)
        }
    }
}
