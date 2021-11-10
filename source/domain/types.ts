import { load } from 'cheerio'

export type Page = ReturnType<typeof load>

export interface BaseRow {
    created_at?: Date
    updated_at?: Date
    deleted_at?: Date | null
}

export interface Character {
    name: string
    level: number
    vocation: CharacterVocation
    gender: CharacterGender
    game_world: GameWorld
}

export type CharacterVocation =
    | 'None'
    | 'Druid'
    | 'Elder Druid'
    | 'Knight'
    | 'Elite Knight'
    | 'Paladin'
    | 'Royal Paladin'
    | 'Sorcerer'
    | 'Master Sorcerer'

export enum Charms {
    'Adrenaline Burst' = 'Adrenaline Burst',
    Bless = 'Bless',
    Cleanse = 'Cleanse',
    Cripple = 'Cripple',
    Curse = 'Curse',
    Dodge = 'Dodge',
    Enflame = 'Enflame',
    Freeze = 'Freeze',
    Gut = 'Gut',
    'Low Blow' = 'Low Blow',
    Numb = 'Numb',
    Parry = 'Parry',
    Poison = 'Poison',
    Wound = 'Wound',
    Zap = 'Zap',
    Scavenge = 'Scavenge',
}

export enum CharacterGender {
    Male = 'Male',
    Female = 'Female',
}

export enum GameWorld {
    Relembra = 'Relembra',
    Nossobra = 'Nossobra',
}

export enum PvPType {
    'open' = 'open',
    'optional' = 'optional',
    'retro-hardcore' = 'retro-hardcore',
    'hardcore' = 'hardcore',
    'retro-open' = 'retro-open',
}

export enum ServerLocation {
    'europe' = 'europe',
    'north-america' = 'north-america',
    'south-america' = 'south-america',
}

export enum BattleEyeStatus {
    'fully-protected' = 'fully-protected',
    'protected' = 'protected',
    'inactive' = 'inactive',
}

export enum ServerCondition {
    'blocked' = 'blocked',
    'premium' = 'premium',
    'locked' = 'locked',
    'experimental' = 'experimental',
    'store_restricted_products' = 'store_restricted_products',
}
