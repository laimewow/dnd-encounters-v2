import { MonsterLibrary, useMonsterLibrary } from '../../../domain/MonsterLibrary'
import { Encounter } from '../../../domain/Encounter'
import { generateMonsterFromResource } from '../../../lib/monsterCollection'

export const useMonsterPickerVM = (onClose: () => void) => {
    const monsters = useMonsterLibrary()

    const onPickMonster = (id: string) => {
        const monster = MonsterLibrary.findById(id)
        if (monster) Encounter.addParticipant(generateMonsterFromResource(monster))
        onClose()
    }

    const data = { monsters }
    const events = { onPickMonster }

    return { data, events }
}
