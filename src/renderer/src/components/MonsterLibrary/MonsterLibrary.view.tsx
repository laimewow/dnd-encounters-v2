import { ExternalLink, FolderInput, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMonsterLibraryVM } from './MonsterLibrary.vm'
import { Dialog } from '../common/Dialog/Dialog.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import './MonsterLibrary.style.scss'

export const MonsterLibrary = (_props: WindowContentProps) => {
    const { data, events } = useMonsterLibraryVM()

    return (
        <div className="monster-library">
            <div className="monster-library__toolbar">
                <div className="monster-library__toolbar-row">
                    <button type="button" className="btn btn--primary" onClick={events.openAddDialog}>
                        <Plus size={16} />
                        Добавить
                    </button>
                    <button
                        type="button"
                        className="btn btn--outline"
                        onClick={events.importFromFolder}
                        disabled={data.importing}
                    >
                        <FolderInput size={16} />
                        {data.importing ? 'Импорт...' : 'Импорт из папки'}
                    </button>
                </div>
                <label className="monster-library__search">
                    <Search size={16} />
                    <input
                        className="input"
                        placeholder="Поиск монстра..."
                        value={data.search}
                        onChange={(e) => events.setSearch(e.target.value)}
                    />
                </label>
            </div>

            <div className="monster-library__list">
                {data.monsters.length === 0 && (
                    <p className="monster-library__empty">
                        {data.search ? 'Ничего не найдено' : 'Библиотека монстров пуста'}
                    </p>
                )}
                {data.monsters.map((m) => (
                    <div key={m.id} className="monster-library__row">
                        <img className="monster-library__icon" src={m.iconUrl} alt="" />
                        <div className="monster-library__name">{m.name}</div>
                        <div className="monster-library__hp">
                            HP: {m.baseHealth} · КД: {m.armorClass}
                        </div>
                        <button
                            type="button"
                            className="btn btn--icon"
                            onClick={() => events.openAsWindow(m)}
                            title="Открыть как окно"
                        >
                            <ExternalLink size={16} />
                        </button>
                        <button
                            type="button"
                            className="btn btn--icon"
                            onClick={() => events.openEditDialog(m)}
                            title="Редактировать"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            type="button"
                            className="btn btn--icon"
                            onClick={() => events.onRemove(m.id)}
                            title="Удалить"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <Dialog
                open={data.dialogOpen}
                onClose={events.closeDialog}
                onSubmit={events.submit}
                title={data.editingId ? 'Изменить монстра' : 'Новый монстр'}
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
                    <span className="field__label">Имя</span>
                    <input
                        className="input"
                        autoFocus
                        value={data.name}
                        onChange={(e) => events.setName(e.target.value)}
                    />
                </label>
                <label className="field">
                    <span className="field__label">Иконка (URL)</span>
                    <input
                        className="input"
                        value={data.iconUrl}
                        onChange={(e) => events.setIconUrl(e.target.value)}
                    />
                </label>
                <div className="field-row">
                    <label className="field">
                        <span className="field__label">Базовое HP</span>
                        <input
                            className="input"
                            type="number"
                            value={data.baseHealth}
                            onChange={(e) => events.setBaseHealth(e.target.value)}
                        />
                    </label>
                    <label className="field">
                        <span className="field__label">Класс брони</span>
                        <input
                            className="input"
                            type="number"
                            value={data.armorClass}
                            onChange={(e) => events.setArmorClass(e.target.value)}
                        />
                    </label>
                </div>

                <div className="field">
                    <span className="field__label">Атаки</span>
                    <div className="monster-library__attacks">
                        {data.attacks.map((a) => (
                            <div key={a.id} className="monster-library__attack">
                                <div className="field-row">
                                    <label className="field">
                                        <span className="field__label">Название</span>
                                        <input
                                            className="input"
                                            value={a.name}
                                            onChange={(e) => events.updateAttack(a.id, { name: e.target.value })}
                                        />
                                    </label>
                                    <label className="field">
                                        <span className="field__label">Бонус атаки</span>
                                        <input
                                            className="input"
                                            type="number"
                                            value={a.attackBonus}
                                            onChange={(e) =>
                                                events.updateAttack(a.id, { attackBonus: Number(e.target.value) || 0 })
                                            }
                                        />
                                    </label>
                                </div>
                                <div className="field-row">
                                    <label className="field">
                                        <span className="field__label">Ролл урона</span>
                                        <input
                                            className="input"
                                            placeholder="1d6"
                                            value={a.damageRoll}
                                            onChange={(e) => events.updateAttack(a.id, { damageRoll: e.target.value })}
                                        />
                                    </label>
                                    <label className="field">
                                        <span className="field__label">Бонус урона</span>
                                        <input
                                            className="input"
                                            type="number"
                                            value={a.damageBonus}
                                            onChange={(e) =>
                                                events.updateAttack(a.id, { damageBonus: Number(e.target.value) || 0 })
                                            }
                                        />
                                    </label>
                                </div>
                                <label className="field">
                                    <span className="field__label">Заметки к атаке</span>
                                    <textarea
                                        className="input"
                                        rows={2}
                                        value={a.notes}
                                        onChange={(e) => events.updateAttack(a.id, { notes: e.target.value })}
                                    />
                                </label>
                                <button
                                    type="button"
                                    className="btn btn--outline monster-library__attack-remove"
                                    onClick={() => events.removeAttack(a.id)}
                                >
                                    <Trash2 size={14} />
                                    Удалить атаку
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" className="btn btn--outline" onClick={events.addAttack}>
                        <Plus size={14} />
                        Атака
                    </button>
                </div>

                <label className="field">
                    <span className="field__label">Заметки</span>
                    <textarea
                        className="input"
                        rows={3}
                        value={data.notes}
                        onChange={(e) => events.setNotes(e.target.value)}
                    />
                </label>
            </Dialog>
        </div>
    )
}
