import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * Where this app's mutable data (state + user resource library) lives.
 * - Windows packaged builds: a `data` folder next to the .exe, so the whole
 *   win-unpacked folder stays self-contained/portable (copy it anywhere,
 *   nothing lives in %APPDATA%).
 * - Linux packaged builds: shipped as an AppImage, which runs from a
 *   temp-mounted squashfs — process.execPath points into that mount, not the
 *   actual .AppImage file, so "next to the executable" isn't a stable
 *   location there. Use a fixed folder in the user's home directory instead.
 * - Dev: Electron's per-app userData dir — there's no meaningful "next to
 *   the executable" in dev (that's the shared electron binary inside
 *   node_modules, wiped by every npm install).
 */
export function portableRoot(): string {
    let dir: string
    if (!app.isPackaged) {
        dir = app.getPath('userData')
    } else if (process.platform === 'linux') {
        dir = join(homedir(), 'dnd-encounters-data')
    } else {
        dir = join(dirname(process.execPath), 'data')
    }
    mkdirSync(dir, { recursive: true })
    return dir
}
