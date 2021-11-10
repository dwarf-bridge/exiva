import { BattleEyeStatus, PvPType, ServerCondition, ServerLocation, BaseRow } from '../../../domain/types'

export interface GameWorldRow extends BaseRow {
    name: string
    location: ServerLocation | null
    pvp_type: PvPType | null
    battle_eye: BattleEyeStatus
    server_conditions: ServerCondition[]
}
export interface WorldsSummaryItemRaw {
    name: string
    online_players: string
    location: string
    pvp_type: string
    battle_eye: string | undefined
    aditional_information: string
}

export interface WorldsSummaryRaw {
    regular_worlds: WorldsSummaryItemRaw[]
    tournament_worlds: WorldsSummaryItemRaw[]
}

export interface WorldSummary {
    name: string
    online_players: number
    location: ServerLocation | null
    pvp_type: PvPType | null
    battle_eye: BattleEyeStatus
    server_conditions: ServerCondition[]
    was_online: boolean
}

export interface WorldListSummary {
    regular_worlds: WorldSummary[]
    tournament_worlds: WorldSummary[]
}

export interface GameWorldEntry {
    name: string
    location: ServerLocation
    pvp_type: PvPType
    battle_eye: BattleEyeStatus
    server_conditions: ServerCondition[]
    merged_into: string | null
    merged_at: Date | null
    server_titles: string[]
    is_special_world: Boolean
}
