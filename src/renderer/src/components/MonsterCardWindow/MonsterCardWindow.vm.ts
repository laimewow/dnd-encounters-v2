import { useMonsterLibrary } from '../../domain/MonsterLibrary'

export const useMonsterCardWindowVM = (monsterId: string | undefined) => {
    const monsters = useMonsterLibrary()
    const monster = monsters.find((m) => m.id === monsterId) ?? null

    const data = { monster }

    return { data }
}
