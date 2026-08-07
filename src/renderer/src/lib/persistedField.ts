import { field } from 'basic-front'

let cachedInitialState: Record<string, unknown> | null = null

function initialStateFor(key: string): unknown {
    if (!cachedInitialState) {
        cachedInitialState = window.api.getInitialState()
    }
    return cachedInitialState[key]
}

interface RegistryEntry {
    getValue: () => unknown
    setValue: (v: unknown) => void
}

const registry = new Map<string, RegistryEntry>()

export const persistedField = <T>(key: string, initial: T) => {
    const stored = initialStateFor(key)
    const store = field<T>(stored !== undefined ? (stored as T) : initial)
    store.subscribe((s) => window.api.setState(key, s.value))
    registry.set(key, {
        getValue: () => store.getState().value,
        setValue: (v) => store.getState().setValue(v as T),
    })
    return store
}

export function getAllPersistedState(): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, entry] of registry) result[key] = entry.getValue()
    return result
}

export function applyPersistedState(state: Record<string, unknown>): void {
    for (const [key, entry] of registry) {
        if (key in state) entry.setValue(state[key])
    }
}
