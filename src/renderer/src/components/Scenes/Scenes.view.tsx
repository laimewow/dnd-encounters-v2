import { Check, ExternalLink, Minus, Pencil, Plus, Swords, Trash2, X } from 'lucide-react'
import { summarizePlan, useScenesVM } from './Scenes.vm'
import { Dialog } from '../common/Dialog/Dialog.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import type { MasterCard } from '../../domain/types'
import './Scenes.style.scss'

export const Scenes = (_props: WindowContentProps) => {
    const { data, events } = useScenesVM()

    if (!data.activeGameId) {
        return (
            <div className="scenes">
                <p className="scenes__empty">Сначала выберите активную игру в окне «Игры»</p>
            </div>
        )
    }

    return (
        <div className="scenes">
            <div className="scenes__toolbar">
                <button type="button" className="btn btn--primary" onClick={events.openAddScene}>
                    <Plus size={16} />
                    Сцена
                </button>
            </div>

            <div className="scenes__list">
                {data.scenes.length === 0 && <p className="scenes__empty">Сцен пока нет</p>}
                {data.scenes.map((scene) => {
                    const isActive = scene.id === data.activeSceneId
                    return (
                    <div key={scene.id} className={`scenes__card${isActive ? ' scenes__card--active' : ''}`}>
                        <div className="scenes__card-header">
                            <div className="scenes__card-title">{scene.name}</div>
                            {isActive ? (
                                <span className="scenes__active-badge">
                                    <Check size={14} />
                                    Текущая сцена
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn--outline"
                                    onClick={() => events.onSetActiveScene(scene.id)}
                                >
                                    Сделать текущей
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.openEditScene(scene)}
                                title="Редактировать"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.removeScene(scene.id)}
                                title="Удалить"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {scene.description && <p className="scenes__card-description">{scene.description}</p>}

                        <span className="scenes__section-label">Энкаунтеры</span>
                        <div className="scenes__plans">
                            {scene.plannedEncounters.map((plan) => (
                                <div key={plan.id} className="scenes__plan-row">
                                    <div className="scenes__plan-info">
                                        <div className="scenes__plan-name">{plan.name}</div>
                                        <div className="scenes__plan-summary">
                                            {summarizePlan(plan.monsters, data.monsterLibrary)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn--icon"
                                        onClick={() => events.startPlan(plan.monsters)}
                                        title="Начать бой"
                                    >
                                        <Swords size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn--icon"
                                        onClick={() => events.removePlan(scene.id, plan.id)}
                                        title="Удалить"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn--outline scenes__add-plan"
                                onClick={() => events.openAddPlan(scene.id)}
                            >
                                <Plus size={14} />
                                План энкаунтера
                            </button>
                        </div>

                        <span className="scenes__section-label">Карточки мастера</span>
                        <div className="scenes__master-cards">
                            {scene.masterCardIds
                                .map((id) => data.masterCards.find((c) => c.id === id))
                                .filter((c): c is MasterCard => !!c)
                                .map((card) => (
                                    <div key={card.id} className="scenes__master-card-row">
                                        <div className="scenes__master-card-title">{card.title}</div>
                                        <button
                                            type="button"
                                            className="btn btn--icon"
                                            onClick={() => events.onOpenMasterCard(card)}
                                            title="Открыть как окно"
                                        >
                                            <ExternalLink size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn--icon"
                                            onClick={() => events.onUnlinkMasterCard(scene.id, card.id)}
                                            title="Отвязать"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            {data.masterCards.length > scene.masterCardIds.length && (
                                <select
                                    className="select scenes__add-master-card"
                                    value=""
                                    onChange={(e) => {
                                        if (e.target.value) events.onLinkMasterCard(scene.id, e.target.value)
                                    }}
                                >
                                    <option value="">+ Карточка мастера</option>
                                    {data.masterCards
                                        .filter((c) => !scene.masterCardIds.includes(c.id))
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                </select>
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>

            <Dialog
                open={data.sceneDialogOpen}
                onClose={events.closeSceneDialog}
                onSubmit={events.submitScene}
                title={data.editingSceneId ? 'Изменить сцену' : 'Новая сцена'}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeSceneDialog}>
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            disabled={!data.sceneName.trim()}
                            onClick={events.submitScene}
                        >
                            Сохранить
                        </button>
                    </>
                }
            >
                <label className="field">
                    <span className="field__label">Название</span>
                    <input
                        className="input"
                        autoFocus
                        value={data.sceneName}
                        onChange={(e) => events.setSceneName(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Описание</span>
                    <textarea
                        className="input"
                        rows={3}
                        value={data.sceneDescription}
                        onChange={(e) => events.setSceneDescription(e.target.value)}
                    />
                </label>
            </Dialog>

            <Dialog
                open={!!data.planDialogSceneId}
                onClose={events.closePlanDialog}
                title="Новый план энкаунтера"
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closePlanDialog}>
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            disabled={!data.planName.trim()}
                            onClick={events.submitPlan}
                        >
                            Сохранить
                        </button>
                    </>
                }
            >
                <input
                    className="input"
                    placeholder="Название"
                    autoFocus
                    value={data.planName}
                    onChange={(e) => events.setPlanName(e.target.value)}
                />
                <input
                    className="input"
                    placeholder="Поиск монстра"
                    value={data.planSearch}
                    onChange={(e) => events.setPlanSearch(e.target.value)}
                />
                <div className="scenes__monster-list">
                    {data.filteredPlanMonsters.map((m) => (
                        <div key={m.id} className="scenes__monster-row">
                            <span className="scenes__monster-name">{m.name}</span>
                            <div className="scenes__counter">
                                <button
                                    type="button"
                                    className="btn btn--icon"
                                    onClick={() => events.decrementPlanMonster(m.id)}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="scenes__count">{data.planCounts[m.id] ?? 0}</span>
                                <button
                                    type="button"
                                    className="btn btn--icon"
                                    onClick={() => events.incrementPlanMonster(m.id)}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Dialog>
        </div>
    )
}
