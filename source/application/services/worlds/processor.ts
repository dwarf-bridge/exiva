import { Page } from '../../../domain/types'
import { WorldsSummaryRaw, WorldsSummaryItemRaw } from './types'

export class worlds_summary_processor {
    private page: Page
    constructor(page: Page) {
        this.page = page
    }

    public process(): WorldsSummaryRaw {
        return {
            regular_worlds: this.process_general_worlds(),
            tournament_worlds: this.process_tournament_worlds()
        }
    }

    private process_general_worlds(): WorldsSummaryItemRaw[] {
        const general_worlds_list_page = this.page('div.TableContentContainer tbody').eq(2).contents().toArray().slice(1, -1)
        const general_worlds_processed = general_worlds_list_page.map(world => {
            const world_item = this.page(world)
            
            const processed_world = {
                name: world_item.contents().eq(0).text(),
                online_players: world_item.contents().eq(1).text(),
                location: world_item.contents().eq(2).text(),
                pvp_type: world_item.contents().eq(3).text(),
                battle_eye: world_item.contents().eq(4).find('span img').attr('src'),
                aditional_information: world_item.contents().eq(5).text()
            }
            return processed_world
        })
        return general_worlds_processed
    }

    private process_tournament_worlds(): WorldsSummaryItemRaw[] {
        const tournament_worlds_list = this.page('div.TableContentContainer tbody').eq(4).contents().toArray().slice(1, -1)
        const tournament_world_processed = tournament_worlds_list.map(world => {
            const world_item = this.page(world)
            
            const processed_world = {
                name: world_item.contents().eq(0).text(),
                online_players: world_item.contents().eq(1).text(),
                location: world_item.contents().eq(2).text(),
                pvp_type: world_item.contents().eq(3).text(),
                battle_eye: world_item.contents().eq(4).find('span img').attr('src'),
                aditional_information: world_item.contents().eq(5).text()
            }
            return processed_world
        })

        return tournament_world_processed
    }
}
