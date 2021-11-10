import { BaseRow } from '../../../domain/types'

export interface RankingRaw {
    rank: string
    name: string
    vocation: string
    game_world: string
    level: string
    points: string
}

export interface Ranking {
    rank: number
    character_name: string
    vocation: number
    game_world: string
    level: number
    points: number
}

export interface RankingRow extends Ranking, BaseRow {
    date: Date
}
