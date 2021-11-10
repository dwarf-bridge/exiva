import { RankingRaw, Ranking } from './types'
import { CharacterVocation } from '../../../domain/types'

export class highscore_parser {
    private raw: RankingRaw[]
    constructor(raw: RankingRaw[]) {
        this.raw = raw
    }

    private to_number(text: string) {
        return Number(this.strip(text))
    }

    private to_float(text: string) {
        return Number(text)
    }

    private strip(text: string) {
        return text.replace(/[-.,]/g, '')
    }

    private enumerate_vocation(vocation: CharacterVocation) {
        switch (vocation) {
            case 'None':
                return 0
            case 'Druid':
                return 1
            case 'Elder Druid':
                return 2
            case 'Knight':
                return 3
            case 'Elite Knight':
                return 4
            case 'Paladin':
                return 5
            case 'Royal Paladin':
                return 6
            case 'Sorcerer':
                return 7
            case 'Master Sorcerer':
                return 8
            default:
                return 0
        }
    }

    public parse(): Ranking[] {
        return this.parse_ranking(this.raw)
    }

    private parse_ranking(raw: RankingRaw[]): Ranking[] {
        return raw.map((element) => {
            return {
                rank: this.to_number(element.rank),
                character_name: element.name.trim(),
                vocation: this.enumerate_vocation(element.vocation.trim() as CharacterVocation),
                game_world: element.game_world.trim().toLocaleLowerCase(),
                level: this.to_number(element.level),
                points: this.to_number(element.points),
            }
        })
    }
}
