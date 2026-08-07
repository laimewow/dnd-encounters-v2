import { field } from 'basic-front'
import { genId } from '../lib/random'
import type { MonsterResource } from './types'

/** Backfills fields added after some monster resource files were already saved to disk. */
function withDefaults(monster: MonsterResource): MonsterResource {
    return {
        ...monster,
        armorClass: monster.armorClass ?? 10,
        attacks: monster.attacks ?? [],
        notes: monster.notes ?? '',
    }
}

const _monsters = field<MonsterResource[]>(
    (window.api.resources.listSync('monsters') as MonsterResource[]).map(withDefaults),
)

export const useMonsterLibrary = () => _monsters((s) => s.value)

export const MonsterLibrary = {
    useMonsterLibrary,

    all(): MonsterResource[] {
        return _monsters.getState().value
    },

    findById(id: string): MonsterResource | undefined {
        return _monsters.getState().value.find((m) => m.id === id)
    },

    async add(monster: Omit<MonsterResource, 'id'>) {
        const saved = (await window.api.resources.save('monsters', { ...monster, id: genId() })) as MonsterResource
        _monsters.getState().setValue([..._monsters.getState().value, saved])
    },

    async update(monster: MonsterResource) {
        await window.api.resources.save('monsters', monster)
        _monsters.getState().setValue(_monsters.getState().value.map((m) => (m.id === monster.id ? monster : m)))
    },

    async remove(id: string) {
        await window.api.resources.remove('monsters', id)
        _monsters.getState().setValue(_monsters.getState().value.filter((m) => m.id !== id))
    },

    /** Bulk-adds monsters, skipping any whose name already exists so re-running an import is safe. */
    async importMany(monsters: Omit<MonsterResource, 'id'>[]): Promise<{ imported: number; skipped: number }> {
        const existingNames = new Set(_monsters.getState().value.map((m) => m.name))
        const toAdd: MonsterResource[] = []
        let skipped = 0

        for (const monster of monsters) {
            if (existingNames.has(monster.name)) {
                skipped++
                continue
            }
            existingNames.add(monster.name)
            toAdd.push({ ...monster, id: genId() })
        }

        if (toAdd.length > 0) {
            const saved = (await window.api.resources.saveMany('monsters', toAdd)) as MonsterResource[]
            _monsters.getState().setValue([..._monsters.getState().value, ...saved])
        }

        return { imported: toAdd.length, skipped }
    },
}
