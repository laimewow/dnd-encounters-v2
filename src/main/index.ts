import { app, shell, BrowserWindow, ipcMain, protocol, net } from 'electron'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { loadState, getState, setState, flushState } from './stateStore'
import { exportBackup, importBackup } from './backup'
import { listResources, saveResource, saveManyResources, removeResource } from './resourceStore'
import { pickMonsterImportFolder, readMonsterImportFolder } from './monsterImport'

// Production loads the renderer through this custom scheme instead of file://.
// react-router's createBrowserRouter (used internally by basic-front's
// configureYottaEntrypoint) reads window.location.pathname to match routes;
// under file://, that pathname is the full absolute disk path and never
// matches a route like "/", which made every production launch 404.
// Loading "app://renderer/" keeps location.pathname === "/" while this
// handler serves the actual built files underneath.
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
        },
    },
])

function registerAppProtocol(): void {
    protocol.handle('app', (request) => {
        const url = new URL(request.url)
        const relativePath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname)
        const filePath = join(__dirname, '../renderer', relativePath)
        return net.fetch(pathToFileURL(filePath).toString())
    })
}

function createWindow(): BrowserWindow {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 960,
        minWidth: 960,
        minHeight: 600,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            sandbox: false,
            contextIsolation: true,
        },
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.on('before-input-event', (_event, input) => {
        if (input.type === 'keyDown' && input.key === 'F12') {
            mainWindow.webContents.toggleDevTools()
        }
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadURL('app://renderer/')
    }

    return mainWindow
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.laimex.dnd-encounters')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    registerAppProtocol()
    loadState()

    ipcMain.on('state:getAll', (event) => {
        event.returnValue = getState()
    })

    ipcMain.on('state:set', (_event, key: string, value: unknown) => {
        setState(key, value)
    })

    ipcMain.on('resources:listSync', (event, kind: string) => {
        event.returnValue = listResources(kind)
    })

    ipcMain.handle('resources:save', (_event, kind: string, item: { id: string }) => saveResource(kind, item))

    ipcMain.handle('resources:remove', (_event, kind: string, id: string) => {
        removeResource(kind, id)
    })

    ipcMain.handle('resources:saveMany', (_event, kind: string, items: { id: string }[]) =>
        saveManyResources(kind, items),
    )

    ipcMain.handle('monsters:pickImportFolder', async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window) return null
        return pickMonsterImportFolder(window)
    })

    ipcMain.handle('monsters:readImportFolder', (_event, folderPath: string) => readMonsterImportFolder(folderPath))

    ipcMain.handle('backup:export', async (event, json: string) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window) return false
        return exportBackup(window, json)
    })

    ipcMain.handle('backup:import', async (event) => {
        const window = BrowserWindow.fromWebContents(event.sender)
        if (!window) return null
        return importBackup(window)
    })

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    flushState()
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('before-quit', () => {
    flushState()
})
