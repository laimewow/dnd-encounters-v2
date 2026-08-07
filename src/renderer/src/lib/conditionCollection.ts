import type { ParticipantState } from '../domain/types'
import { genId } from './random'

interface ConditionTemplate {
    icon: string
    name: string
}

export const conditionCollection: ConditionTemplate[] = [
    { icon: 'icons/condition/blinded.svg', name: 'Слепота' },
    { icon: 'icons/condition/charmed.svg', name: 'Очарование' },
    { icon: 'icons/condition/deafened.svg', name: 'Глухота' },
    { icon: 'icons/condition/exhaustion.svg', name: 'Истощение' },
    { icon: 'icons/condition/frightened.svg', name: 'Испуг' },
    { icon: 'icons/condition/grappled.svg', name: 'Захват' },
    { icon: 'icons/condition/incapacitated.svg', name: 'Недееспособность' },
    { icon: 'icons/condition/invisible.svg', name: 'Невидимость' },
    { icon: 'icons/condition/paralyzed.svg', name: 'Паралич' },
    { icon: 'icons/condition/petrified.svg', name: 'Окаменелость' },
    { icon: 'icons/condition/poisoned.svg', name: 'Отравление' },
    { icon: 'icons/condition/prone.svg', name: 'Распластанность' },
    { icon: 'icons/condition/restrained.svg', name: 'Ограничение' },
    { icon: 'icons/condition/silenced.svg', name: 'Тишина' },
    { icon: 'icons/condition/sleep.svg', name: 'Сон' },
    { icon: 'icons/condition/stunned.svg', name: 'Оглушение' },
    { icon: 'icons/condition/unconscious.svg', name: 'Бессознательность' },
].sort((a, b) => a.name.localeCompare(b.name))

export const generateParticipantState = (name: string): ParticipantState => {
    const template = conditionCollection.find((p) => p.name === name)
    if (!template) throw new Error(`Unknown condition: ${name}`)
    return { id: genId(), icon: template.icon, name: template.name }
}
