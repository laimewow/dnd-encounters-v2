import { getAllPersistedState, applyPersistedState } from '../lib/persistedField'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function reviver(_key: string, value: unknown): unknown {
    if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) return date
    }
    return value
}

export const SaveLoad = {
    async exportAll(): Promise<boolean> {
        const json = JSON.stringify(getAllPersistedState(), null, 2)
        return window.api.exportBackup(json)
    },

    async importAll(): Promise<'ok' | 'cancelled' | 'error'> {
        const content = await window.api.importBackup()
        if (content == null) return 'cancelled'
        try {
            const parsed = JSON.parse(content, reviver) as Record<string, unknown>
            applyPersistedState(parsed)
            return 'ok'
        } catch {
            return 'error'
        }
    },
}
