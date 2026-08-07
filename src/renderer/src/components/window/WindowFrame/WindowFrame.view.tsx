import type { ReactNode } from 'react'
import { Minus, X } from 'lucide-react'
import { WindowManager, useIsWindowFocused, type WindowInstance } from '../../../domain/WindowManager'
import { useWindowDrag } from './useWindowDrag'
import { useWindowResize } from './useWindowResize'
import './WindowFrame.style.scss'

interface WindowFrameProps {
    win: WindowInstance
    children: ReactNode
}

export const WindowFrame = ({ win, children }: WindowFrameProps) => {
    const focused = useIsWindowFocused(win.id)

    const drag = useWindowDrag(win.x, win.y, {
        onMove: (x, y) => WindowManager.move(win.id, x, y),
        onDragStart: () => WindowManager.focus(win.id),
    })
    const resize = useWindowResize(win.width, win.height, {
        onResize: (width, height) => WindowManager.resize(win.id, width, height),
    })

    if (win.minimized) return null

    return (
        <div
            className={`window-frame${focused ? ' window-frame--focused' : ''}`}
            style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }}
            onPointerDownCapture={() => WindowManager.focus(win.id)}
        >
            <div className="window-frame__titlebar" onPointerDown={drag.onPointerDown}>
                <span className="window-frame__title">{win.title}</span>
                <div className="window-frame__controls">
                    <button
                        className="window-frame__control"
                        onClick={() => WindowManager.minimize(win.id)}
                        aria-label="Свернуть"
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        className="window-frame__control window-frame__control--close"
                        onClick={() => WindowManager.close(win.id)}
                        aria-label="Закрыть"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
            <div className="window-frame__body">{children}</div>
            <div className="window-frame__resize-handle" onPointerDown={resize.onPointerDown} />
        </div>
    )
}
