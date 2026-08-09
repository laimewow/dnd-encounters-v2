import { createContext, useContext } from 'react'

export interface SceneCanvasContextValue {
    sceneId: string | null
    mode: 'edit' | 'use'
}

/**
 * Scene id + edit/use mode, for custom node renderers (line endpoints, image resize
 * handle) that need to commit a domain update directly on drag-release and only show
 * their reshape handles in edit mode. Deliberately NOT passed via a node's `data` —
 * data must stay reference-equal to the primitive object itself (see
 * SceneCanvas.vm.ts's `syncNodes`), so any extra payload there would defeat that and
 * reintroduce the node-visibility-flicker bug it fixes.
 */
const SceneCanvasContext = createContext<SceneCanvasContextValue>({ sceneId: null, mode: 'use' })

export const SceneCanvasProvider = SceneCanvasContext.Provider

export const useSceneCanvasContext = () => useContext(SceneCanvasContext)
