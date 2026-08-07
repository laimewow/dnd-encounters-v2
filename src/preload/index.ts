import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
    getInitialState: (): Record<string, unknown> => ipcRenderer.sendSync('state:getAll'),
    setState: (key: string, value: unknown): void => {
        ipcRenderer.send('state:set', key, value)
    },
    exportBackup: (json: string): Promise<boolean> => ipcRenderer.invoke('backup:export', json),
    importBackup: (): Promise<string | null> => ipcRenderer.invoke('backup:import'),
    resources: {
        listSync: (kind: string): unknown[] => ipcRenderer.sendSync('resources:listSync', kind),
        save: (kind: string, item: unknown): Promise<unknown> => ipcRenderer.invoke('resources:save', kind, item),
        remove: (kind: string, id: string): Promise<void> => ipcRenderer.invoke('resources:remove', kind, id),
        saveMany: (kind: string, items: unknown[]): Promise<unknown[]> =>
            ipcRenderer.invoke('resources:saveMany', kind, items),
    },
    monsterImport: {
        pickFolder: (): Promise<string | null> => ipcRenderer.invoke('monsters:pickImportFolder'),
        readFolder: (folderPath: string): Promise<{ raw: unknown; iconDataUrl: string | null }[]> =>
            ipcRenderer.invoke('monsters:readImportFolder', folderPath),
    },
}

try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
} catch (error) {
    console.error(error)
}

export type Api = typeof api
