import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { portableRoot } from './paths'

interface Identified {
    id: string
}

function resourceDir(kind: string): string {
    const dir = join(portableRoot(), 'resources', kind)
    mkdirSync(dir, { recursive: true })
    return dir
}

export function listResources<T extends Identified>(kind: string): T[] {
    const dir = resourceDir(kind)
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
    const items: T[] = []
    for (const file of files) {
        try {
            items.push(JSON.parse(readFileSync(join(dir, file), 'utf-8')) as T)
        } catch (err) {
            console.error(`Failed to read resource ${kind}/${file}:`, err)
        }
    }
    return items
}

export function saveResource<T extends Identified>(kind: string, item: T): T {
    const dir = resourceDir(kind)
    writeFileSync(join(dir, `${item.id}.json`), JSON.stringify(item, null, 2), 'utf-8')
    return item
}

/** Bulk variant of saveResource — avoids one IPC round-trip per item for large imports. */
export function saveManyResources<T extends Identified>(kind: string, items: T[]): T[] {
    const dir = resourceDir(kind)
    for (const item of items) {
        writeFileSync(join(dir, `${item.id}.json`), JSON.stringify(item, null, 2), 'utf-8')
    }
    return items
}

export function removeResource(kind: string, id: string): void {
    const filePath = join(resourceDir(kind), `${id}.json`)
    if (existsSync(filePath)) rmSync(filePath)
}
