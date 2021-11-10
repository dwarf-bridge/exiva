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
import { stringify } from 'querystring'

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

    public async collect() {
        // this.worlds = await new game_worlds_repository().getAll()
        this.worlds = await this.db?.instance
            .select('id', 'name')
            .from(`${Database.schema}.game_worlds`)!
        this.categories = await this.db?.instance
            .select('category', 'reference')
            .from(`${Database.schema}.highscore_categories`)!

        if (!this.world) {
            console.info('Set a world.')
            return
        }

        const maxPage = 20
        for (let page = 1; page <= maxPage; page++) {
            try {
                const ranking_page = await get_highscore_page(
                    this.world,
                    this.category.toString(),
                    '0',
                    page
                )

                if (ranking_page.status === 403) {
                    this.handle_prohibited_access()
                }

                this.ranking_pages.push(await ranking_page.text())
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

    public async collect_and_process() {
        await this.collect()
        this.process()
        await this.store()
    }

    private async store() {
        const rankings = this.rankings.map((rank) => {
            return {
                ...rank,
                date: new Date(),
                game_world: this.worlds.find(
                    (world) => world.name === rank.game_world
                )?.id!,
                category: this.category,
            }
        })

        await this.db?.instance('collection.highscores').insert(rankings)
    }

    private async handle_prohibited_access() {
        console.error(
            `Retrying online_checker_service at ${new Date()} because of prohibited access`
        )
        return this.collect()
    }

    private async handle_timeout_request() {
        console.error(
            `Retrying online_checker_service at ${new Date()} because of timeout request`
        )
        return this.collect()
    }

    public run() {
        this.collect_and_process()
    }
}
