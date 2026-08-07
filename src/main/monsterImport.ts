import { dialog, BrowserWindow } from 'electron'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const IMAGE_EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg']

const MIME_BY_EXTENSION: Record<string, string> = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
}

export interface RawMonsterImportEntry {
    /** Parsed JSON contents, shape unknown/unvalidated here — the renderer maps it. */
    raw: unknown
    iconDataUrl: string | null
}

export async function pickMonsterImportFolder(window: BrowserWindow): Promise<string | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Выберите папку с монстрами',
        properties: ['openDirectory'],
    })
    if (canceled || filePaths.length === 0) return null
    return filePaths[0]
}

function findMatchingImage(folderPath: string, baseName: string): string | null {
    for (const ext of IMAGE_EXTENSIONS) {
        const imgPath = join(folderPath, `${baseName}${ext}`)
        if (existsSync(imgPath)) {
            const buf = readFileSync(imgPath)
            return `data:${MIME_BY_EXTENSION[ext]};base64,${buf.toString('base64')}`
        }
    }
    return null
}

/** Reads every *.json file in a folder plus its same-named image (if any, not always present). */
export function readMonsterImportFolder(folderPath: string): RawMonsterImportEntry[] {
    const files = readdirSync(folderPath)
    const jsonFiles = files.filter((f) => f.toLowerCase().endsWith('.json'))
    const entries: RawMonsterImportEntry[] = []

    for (const jsonFile of jsonFiles) {
        try {
            const raw = JSON.parse(readFileSync(join(folderPath, jsonFile), 'utf-8'))
            const baseName = jsonFile.slice(0, -extname(jsonFile).length)
            entries.push({ raw, iconDataUrl: findMatchingImage(folderPath, baseName) })
        } catch (err) {
            console.error(`Failed to read monster import file ${jsonFile}:`, err)
        }
    }

    return entries
}
