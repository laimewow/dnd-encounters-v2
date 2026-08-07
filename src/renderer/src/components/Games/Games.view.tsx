import { Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { useGamesVM } from './Games.vm'
import { Dialog } from '../common/Dialog/Dialog.view'
import { YesNoDialog } from '../common/YesNoDialog/YesNoDialog.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import './Games.style.scss'

export const Games = (_props: WindowContentProps) => {
    const { data, events } = useGamesVM()

    return (
        <div className="games">
            <div className="games__toolbar">
                <button type="button" className="btn btn--primary" onClick={events.openAddDialog}>
                    <Plus size={16} />
                    Новая игра
                </button>
            </div>

            <div className="games__list">
                {data.games.length === 0 && <p className="games__empty">Игр пока нет</p>}
                {data.games.map((g) => {
                    const active = g.id === data.activeGameId
                    return (
                        <div key={g.id} className={`games__row${active ? ' games__row--active' : ''}`}>
                            <div className="games__info">
                                <div className="games__name">{g.name}</div>
                                {g.description && <div className="games__description">{g.description}</div>}
                            </div>
                            {active ? (
                                <span className="games__active-badge">
                                    <Check size={14} />
                                    Активна
                                </span>
                            ) : (
                                <button type="button" className="btn btn--outline" onClick={() => events.onSetActive(g.id)}>
                                    Сделать активной
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.openEditDialog(g)}
                                title="Редактировать"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.requestDelete(g.id)}
                                title="Удалить"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )
                })}
            </div>

            <Dialog
                open={data.dialogOpen}
                onClose={events.closeDialog}
                onSubmit={events.submit}
                title={data.editingId ? 'Изменить игру' : 'Новая игра'}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeDialog}>
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            disabled={!data.name.trim()}
                            onClick={events.submit}
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
                        value={data.name}
                        onChange={(e) => events.setName(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Описание</span>
                    <textarea
                        className="input"
                        rows={3}
                        value={data.description}
                        onChange={(e) => events.setDescription(e.target.value)}
                    />
                </label>
            </Dialog>

            <YesNoDialog
                open={!!data.deleteConfirmId}
                title="Удалить игру?"
                message="Группа, сцены и карточки мастера этой игры будут удалены вместе с ней."
                onConfirm={events.confirmDelete}
                onCancel={events.cancelDelete}
            />
        </div>
    )
}
