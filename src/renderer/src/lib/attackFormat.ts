import type { MonsterAttack } from '../domain/types'

/** "+4 1d6+2" / "+4 1d6-1" / "+4 1d6" (damageBonus omitted when 0). */
export const formatAttack = (attack: MonsterAttack): string => {
    const damageBonus =
        attack.damageBonus > 0 ? `+${attack.damageBonus}` : attack.damageBonus < 0 ? `${attack.damageBonus}` : ''
    return `+${attack.attackBonus} ${attack.damageRoll}${damageBonus}`
}
