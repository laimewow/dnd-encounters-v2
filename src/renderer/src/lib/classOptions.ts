import type { UnitClassOption } from '../domain/types'

export const classOptions: UnitClassOption[] = [
    { value: 'artificer', label: 'Изобретатель', iconUrl: 'icons/class/artificer.svg' },
    { value: 'barbarian', label: 'Варвар', iconUrl: 'icons/class/barbarian.svg' },
    { value: 'cleric', label: 'Жрец', iconUrl: 'icons/class/cleric.svg' },
    { value: 'druid', label: 'Друид', iconUrl: 'icons/class/druid.svg' },
    { value: 'fighter', label: 'Воин', iconUrl: 'icons/class/fighter.svg' },
    { value: 'monk', label: 'Монах', iconUrl: 'icons/class/monk.svg' },
    { value: 'paladin', label: 'Паладин', iconUrl: 'icons/class/paladin.svg' },
    { value: 'ranger', label: 'Следопыт', iconUrl: 'icons/class/ranger.svg' },
    { value: 'rogue', label: 'Плут', iconUrl: 'icons/class/rogue.svg' },
    { value: 'sorcerer', label: 'Чародей', iconUrl: 'icons/class/sorcerer.svg' },
    { value: 'warlock', label: 'Колдун', iconUrl: 'icons/class/warlock.svg' },
    { value: 'wizard', label: 'Волшебник', iconUrl: 'icons/class/wizard.svg' },
].sort((a, b) => a.label.localeCompare(b.label))

export const findClassOption = (value: string): UnitClassOption | undefined =>
    classOptions.find((o) => o.value === value)
