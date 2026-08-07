import { Eye, Pencil } from 'lucide-react'
import { Background, BackgroundVariant, Controls, ReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSceneCanvasVM } from './SceneCanvas.vm'
import { PrimitiveNode } from './PrimitiveNode.view'
import { PrimitivePalette } from './PrimitivePalette.view'
import { PrimitiveInspector } from './PrimitiveInspector.view'
import { PRIMITIVE_SIZE } from './primitiveConstants'
import './SceneCanvas.style.scss'

const nodeTypes = { primitive: PrimitiveNode }

const SceneCanvasInner = () => {
    const { data, events } = useSceneCanvasVM()

    if (!data.activeGameId) {
        return (
            <div className="scene-canvas">
                <p className="scene-canvas__empty">Сначала выберите активную игру в окне «Игры»</p>
            </div>
        )
    }

    if (!data.scene) {
        return (
            <div className="scene-canvas">
                <p className="scene-canvas__empty">Нет текущей сцены. Выберите её в окне «Сцены»</p>
            </div>
        )
    }

    return (
        <div className="scene-canvas">
            <div className="scene-canvas__toolbar">
                <span className="scene-canvas__scene-name">{data.scene.name}</span>
                <button type="button" className="btn btn--outline" onClick={events.toggleMode}>
                    {data.mode === 'edit' ? <Eye size={16} /> : <Pencil size={16} />}
                    {data.mode === 'edit' ? 'В режим использования' : 'В режим редактирования'}
                </button>
            </div>

            <div className="scene-canvas__viewport" onDragOver={events.onDragOver} onDrop={events.onDrop}>
                <ReactFlow
                    nodes={data.nodes}
                    edges={[]}
                    nodeTypes={nodeTypes}
                    onNodesChange={events.onNodesChange}
                    onNodeDragStop={events.onNodeDragStop}
                    onNodeClick={events.onNodeClick}
                    onNodeDoubleClick={events.onNodeDoubleClick}
                    nodesConnectable={false}
                    elementsSelectable={data.mode === 'edit'}
                    nodeDragThreshold={5}
                    nodeClickDistance={5}
                    deleteKeyCode={null}
                    fitView
                >
                    <Background variant={BackgroundVariant.Lines} gap={PRIMITIVE_SIZE} />
                    <Controls showInteractive={false} />
                </ReactFlow>

                {data.mode === 'edit' && <PrimitivePalette />}
            </div>

            {data.mode === 'edit' && data.selectedPrimitive && (
                <PrimitiveInspector
                    primitive={data.selectedPrimitive}
                    scene={data.scene}
                    scenesForGame={data.scenesForGame}
                    masterCards={data.masterCards}
                    onChange={events.updateSelected}
                    onRemove={events.removeSelected}
                    onRotate={events.rotateSelected}
                    onClose={events.closeInspector}
                />
            )}
        </div>
    )
}

export const SceneCanvas = () => (
    <ReactFlowProvider>
        <SceneCanvasInner />
    </ReactFlowProvider>
)
