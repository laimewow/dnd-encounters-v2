import { readFileSync, writeFile, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { portableRoot } from './paths'

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function reviver(_key: string, value: unknown): unknown {
    if (typeof value === 'string' && ISO_DATE_RE.test(value)) {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) return date
    }
    return value
}

function statePath(): string {
    return join(portableRoot(), 'app-state.json')
}

let cache: Record<string, unknown> = {}
let writeTimer: NodeJS.Timeout | null = null

export function loadState(): Record<string, unknown> {
    try {
        const raw = readFileSync(statePath(), 'utf-8')
        cache = JSON.parse(raw, reviver) as Record<string, unknown>
    } catch {
        cache = {}
    }
    return cache
}

export function getState(): Record<string, unknown> {
    return cache
}

export function setState(key: string, value: unknown): void {
    cache[key] = value
    scheduleWrite()
}

function scheduleWrite(): void {
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
        writeTimer = null
        writeFile(statePath(), JSON.stringify(cache, null, 2), 'utf-8', (err) => {
            if (err) console.error('Failed to persist app state:', err)
        })
    }, 300)
}

export function flushState(): void {
    if (writeTimer) {
        clearTimeout(writeTimer)
        writeTimer = null
    }
    try {
        writeFileSync(statePath(), JSON.stringify(cache, null, 2), 'utf-8')
    } catch (err) {
        console.error('Failed to flush app state:', err)
    }
}
