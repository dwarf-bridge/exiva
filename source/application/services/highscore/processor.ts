import { CharacterVocation, Page } from '../../../domain/types'
import { RankingRaw } from './types'

export class highscore_processor {
    private page: Page
    constructor(page: Page) {
        this.page = page
    }

    public process() {
        return this.process_experience_ranking()
    }

    private process_experience_ranking(): RankingRaw[] {
        const ranking_page = this.page('div.TableContentContainer tbody')
            .eq(0)
            .contents()
            .toArray()
            .slice(1, -1)
            .map((row) => {
                const elements = this.page(row).contents()

                return {
                    rank: elements.eq(0).text(),
                    name: elements.eq(1).children().text(),
                    vocation: elements.eq(2).text(),
                    game_world: elements.eq(3).text(),
                    level: elements.eq(4).text(),
                    points: elements.eq(5).text(),
                }
            })

        return ranking_page
    }
}
