import {
    WorldsSummaryRaw,
    WorldsSummaryItemRaw,
    WorldListSummary,
} from './types'
import {
    PvPType,
    ServerLocation,
    BattleEyeStatus,
    ServerCondition,
} from '../../../domain/types'

export class worlds_summary_parser {
    private raw: WorldsSummaryRaw
    constructor(raw: WorldsSummaryRaw) {
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

    public parse(): WorldListSummary {
        const { regular_worlds, tournament_worlds } = this.raw
        return {
            regular_worlds: this.parse_worlds(regular_worlds),
            tournament_worlds: this.parse_worlds(tournament_worlds),
        }
    }

    private parse_worlds(summary: WorldsSummaryItemRaw[]) {
        return summary.map((raw_world) => {
            const {
                aditional_information,
                online_players,
                battle_eye,
                location,
                name,
                pvp_type,
            } = raw_world

            const formatted_online_players_amount = this.format_online_players(
                online_players
            )
            return {
                name: name.toLocaleLowerCase(),
                location: this.format_server_location(location),
                pvp_type: this.format_pvp_type(pvp_type),
                online_players: formatted_online_players_amount,
                battle_eye: this.format_battle_eye_state(battle_eye),
                server_conditions: this.format_aditional_information(
                    aditional_information
                ),
                was_online:
                    online_players.trim() !== 'off',
            }
        })
    }

    private format_online_players(online_players_amount: string) {
        if (online_players_amount.trim() === 'off') {
            return 0
        }

        return this.to_number(online_players_amount)
    }

    private format_pvp_type(unformatted_pvp_type: string): PvPType | null {
        switch (unformatted_pvp_type) {
            case 'Open PvP':
                return PvPType['open']
            case 'Retro Open PvP':
                return PvPType['retro-open']
            case 'Retro Hardcore PvP':
                return PvPType['retro-hardcore']
            case 'Optional PvP':
                return PvPType['optional']
            case 'Hardcore PvP':
                return PvPType['hardcore']
            default:
                return null
        }
    }

    private format_server_location(
        unformatted_server_location: string
    ): ServerLocation | null {
        switch (unformatted_server_location) {
            case 'Europe':
                return ServerLocation['europe']
            case 'North America':
                return ServerLocation['north-america']
            case 'South America':
                return ServerLocation['south-america']
            default:
                return null
        }
    }

    private format_battle_eye_state(
        battle_eye_state: string | undefined
    ): BattleEyeStatus {
        if (battle_eye_state?.includes('icon_battleyeinitial')) {
            return BattleEyeStatus['fully-protected']
        } else if (battle_eye_state?.includes('icon_battleye')) {
            return BattleEyeStatus['protected']
        } else {
            return BattleEyeStatus['inactive']
        }
    }

    private format_aditional_information(
        aditional_information: string
    ): ServerCondition[] {
        const formatted_aditional_information: ServerCondition[] = []
        if (aditional_information.includes('blocked')) {
            formatted_aditional_information.push(ServerCondition['blocked'])
        }

        if (aditional_information.includes('premium')) {
            formatted_aditional_information.push(ServerCondition['premium'])
        }

        if (aditional_information.includes('locked')) {
            formatted_aditional_information.push(ServerCondition['locked'])
        }
        if (aditional_information.includes('experimental')) {
            formatted_aditional_information.push(
                ServerCondition['experimental']
            )
        }

        if (aditional_information.includes('restricted Store products')) {
            formatted_aditional_information.push(
                ServerCondition['store_restricted_products']
            )
        }

        return formatted_aditional_information
    }
}
