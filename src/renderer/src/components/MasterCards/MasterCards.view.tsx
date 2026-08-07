import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMasterCardsVM } from './MasterCards.vm'
import { Dialog } from '../common/Dialog/Dialog.view'
import { MASTER_CARD_DRAG_TYPE } from '../../lib/dragTypes'
import type { WindowContentProps } from '../window/WindowContentProps'
import './MasterCards.style.scss'

export const MasterCards = (_props: WindowContentProps) => {
    const { data, events } = useMasterCardsVM()

    if (!data.activeGameId) {
        return (
            <div className="master-cards">
                <p className="master-cards__empty">Сначала выберите активную игру в окне «Игры»</p>
            </div>
        )
    }

    return (
        <div className="master-cards">
            <div className="master-cards__toolbar">
                <button type="button" className="btn btn--primary" onClick={events.openAddDialog}>
                    <Plus size={16} />
                    Карточка
                </button>
            </div>

            <div className="master-cards__list">
                {data.cards.length === 0 && <p className="master-cards__empty">Карточек пока нет</p>}
                {data.cards.map((c) => (
                    <div
                        key={c.id}
                        className="master-cards__card"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData(MASTER_CARD_DRAG_TYPE, c.id)
                            e.dataTransfer.effectAllowed = 'copy'
                        }}
                        title="Можно перетащить на канвас сцены"
                    >
                        <div className="master-cards__card-header">
                            <div className="master-cards__card-title">{c.title}</div>
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.openAsWindow(c)}
                                title="Открыть как окно"
                            >
                                <ExternalLink size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.openEditDialog(c)}
                                title="Редактировать"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                type="button"
                                className="btn btn--icon"
                                onClick={() => events.onRemove(c.id)}
                                title="Удалить"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        {c.text && <p className="master-cards__card-text">{c.text}</p>}
                    </div>
                ))}
            </div>

            <Dialog
                open={data.dialogOpen}
                onClose={events.closeDialog}
                onSubmit={events.submit}
                title={data.editingId ? 'Изменить карточку' : 'Новая карточка'}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeDialog}>
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            disabled={!data.title.trim()}
                            onClick={events.submit}
                        >
                            Сохранить
                        </button>
                    </>
                }
            >
                <label className="field">
                    <span className="field__label">Заголовок</span>
                    <input
                        className="input"
                        autoFocus
                        value={data.title}
                        onChange={(e) => events.setTitle(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Текст</span>
                    <textarea
                        className="input"
                        rows={6}
                        value={data.text}
                        onChange={(e) => events.setText(e.target.value)}
                    />
                </label>
            </Dialog>
        </div>
    )
}
