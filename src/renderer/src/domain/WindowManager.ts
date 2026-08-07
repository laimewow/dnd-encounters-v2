import { persistedField } from '../lib/persistedField'

export type WindowKind =
    | 'combat'
    | 'party'
    | 'settings'
    | 'monsterLibrary'
    | 'games'
    | 'scenes'
    | 'masterCards'
    | 'partyMemberCard'
    | 'masterCardWindow'
    | 'monsterCardWindow'

const KNOWN_KINDS: readonly WindowKind[] = [
    'combat',
    'party',
    'settings',
    'monsterLibrary',
    'games',
    'scenes',
    'masterCards',
    'partyMemberCard',
    'masterCardWindow',
    'monsterCardWindow',
]

export interface WindowInstance {
    id: string
    kind: WindowKind
    title: string
    params?: Record<string, string>
    x: number
    y: number
    width: number
    height: number
    zIndex: number
    minimized: boolean
}

interface WindowGeometry {
    x: number
    y: number
    width: number
    height: number
}

interface OpenOptions {
    title: string
    params?: Record<string, string>
    width?: number
    height?: number
    instanceKey?: string
}

const _windows = persistedField<WindowInstance[]>('windows', [])
// Remembers where a window was last placed so reopening it after a close
// restores that position/size instead of resetting to a fresh cascade spot.
const _lastGeometry = persistedField<Record<string, WindowGeometry>>('windowGeometry', {})

export const useWindows = () => _windows((s) => s.value)

function setWindows(update: (windows: WindowInstance[]) => WindowInstance[]) {
    _windows.getState().setValue(update(_windows.getState().value))
}

function rememberGeometry(id: string, geometry: WindowGeometry) {
    _lastGeometry.getState().setValue({ ..._lastGeometry.getState().value, [id]: geometry })
}

function focusWindow(id: string) {
    setWindows((windows) => {
        if (!windows.some((w) => w.id === id)) return windows
        const maxZ = windows.length ? Math.max(...windows.map((w) => w.zIndex)) : 0
        return windows.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1, minimized: false } : w))
    })
}

export const WindowManager = {
    useWindows,

    open(kind: WindowKind, opts: OpenOptions): string {
        const id = opts.instanceKey ? `${kind}:${opts.instanceKey}` : kind
        const windows = _windows.getState().value
        const existing = windows.find((w) => w.id === id)
        if (existing) {
            focusWindow(id)
            return id
        }

        const maxZ = windows.length ? Math.max(...windows.map((w) => w.zIndex)) : 0
        const cascade = (windows.length % 8) * 24
        const remembered = _lastGeometry.getState().value[id]
        const win: WindowInstance = {
            id,
            kind,
            title: opts.title,
            params: opts.params,
            x: remembered?.x ?? 90 + cascade,
            y: remembered?.y ?? 70 + cascade,
            width: remembered?.width ?? opts.width ?? 480,
            height: remembered?.height ?? opts.height ?? 420,
            zIndex: maxZ + 1,
            minimized: false,
        }
        setWindows((ws) => [...ws, win])
        return id
    },

    close(id: string) {
        const win = _windows.getState().value.find((w) => w.id === id)
        if (win) rememberGeometry(id, { x: win.x, y: win.y, width: win.width, height: win.height })
        setWindows((windows) => windows.filter((w) => w.id !== id))
    },

    focus: focusWindow,

    move(id: string, x: number, y: number) {
        setWindows((windows) => windows.map((w) => (w.id === id ? { ...w, x, y } : w)))
    },

    resize(id: string, width: number, height: number) {
        setWindows((windows) => windows.map((w) => (w.id === id ? { ...w, width, height } : w)))
    },

    minimize(id: string) {
        setWindows((windows) => windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)))
    },

    /** One-shot fixup: drops persisted windows whose kind no longer exists (e.g. a WindowKind that was removed from the app). */
    pruneStaleWindows() {
        setWindows((windows) => windows.filter((w) => KNOWN_KINDS.includes(w.kind)))
    },
}

export const useFocusedWindowId = (): string | null => {
    const windows = useWindows()
    const visible = windows.filter((w) => !w.minimized)
    if (visible.length === 0) return null
    return visible.reduce((top, w) => (w.zIndex > top.zIndex ? w : top)).id
}

export const useIsWindowFocused = (id: string): boolean => useFocusedWindowId() === id
