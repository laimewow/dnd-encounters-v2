import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { portableRoot } from './paths'

const CANVAS_IMAGES_DIR = 'canvas-images'

/**
 * Saves a dropped/pasted canvas image as a working copy under the portable data
 * dir, so the scene doesn't depend on wherever the original file came from.
 * Returns a relative path (e.g. "canvas-images/<uuid>.png") — the renderer turns
 * that into an app://data/... URL, served by the protocol handler in index.ts.
 */
export function saveCanvasImage(bytes: Buffer, extension: string): string {
    const dir = join(portableRoot(), CANVAS_IMAGES_DIR)
    mkdirSync(dir, { recursive: true })
    const safeExt = extension.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'png'
    const fileName = `${randomUUID()}.${safeExt}`
    writeFileSync(join(dir, fileName), bytes)
    return `${CANVAS_IMAGES_DIR}/${fileName}`
}
