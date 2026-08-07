import { dialog, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'

export async function exportBackup(window: BrowserWindow, json: string): Promise<boolean> {
    const { canceled, filePath } = await dialog.showSaveDialog(window, {
        title: 'Сохранить резервную копию',
        defaultPath: `dnd-encounters-backup-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (canceled || !filePath) return false
    await writeFile(filePath, json, 'utf-8')
    return true
}

export async function importBackup(window: BrowserWindow): Promise<string | null> {
    const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        title: 'Открыть резервную копию',
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (canceled || filePaths.length === 0) return null
    return readFile(filePaths[0], 'utf-8')
}
