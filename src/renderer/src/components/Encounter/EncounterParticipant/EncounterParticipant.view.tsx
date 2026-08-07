import { BookOpen, Heart, Maximize2, Sparkles } from 'lucide-react'
import { useEncounterParticipantVM } from './EncounterParticipant.vm'
import { Chip } from '../../common/Chip/Chip.view'
import { ProgressBar } from '../../common/ProgressBar/ProgressBar.view'
import { Dialog } from '../../common/Dialog/Dialog.view'
import { ParticipantStateMenu } from '../ParticipantState/ParticipantStateMenu.view'
import { formatAttack } from '../../../lib/attackFormat'
import type { EncounterParticipant as EncounterParticipantType } from '../../../domain/types'
import './EncounterParticipant.style.scss'

interface EncounterParticipantProps {
    participant: EncounterParticipantType
    stage: number
    selected: boolean
}

export const EncounterParticipant = ({ participant, stage, selected }: EncounterParticipantProps) => {
    const { data, events } = useEncounterParticipantVM(participant)
    const dead = participant.health <= 0

    const cardClass = [
        'participant-card',
        selected && 'participant-card--selected',
        participant.friendly && 'participant-card--friendly',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={cardClass} onMouseEnter={events.onSelect}>
            <div className={`participant-card__arrow${participant.currentTurn ? ' participant-card__arrow--active' : ''}`} />

            <img className="participant-card__icon" src={participant.icon} alt="" />

            {stage === 0 ? (
                <input
                    className="input participant-card__initiative-input"
                    value={data.initiativeInput}
                    onChange={(e) => events.onInitiativeChange(e.target.value)}
                    onBlur={events.onInitiativeBlur}
                />
            ) : (
                <div className="participant-card__initiative">{participant.initiative}</div>
            )}

            <div className="participant-card__main">
                <div className={`participant-card__name${dead ? ' participant-card__name--dead' : ''}`}>
                    {participant.name}
                </div>
                <div className="participant-card__hp-row">
                    {participant.friendly && (
                        <span className="participant-card__hp-text">
                            {participant.health} / {participant.maxHealth}
                        </span>
                    )}
                    <ProgressBar value={participant.health} max={participant.maxHealth} />
                    {data.monster && (
                        <span className="participant-card__ac" title="Класс брони">
                            КД {data.monster.armorClass}
                        </span>
                    )}
                </div>
                <div className="participant-card__chips">
                    <Chip active={participant.actionUsed} onClick={events.onToggleAction} title="Действие">
                        Д
                    </Chip>
                    <Chip active={participant.bonusActionUsed} onClick={events.onToggleBonus} title="Бонусное действие">
                        Б
                    </Chip>
                    <Chip active={participant.delayedActionUsed} onClick={events.onToggleDelayed} title="Реакция">
                        Р
                    </Chip>
                    {participant.states.map((s) => (
                        <Chip key={s.id} onClick={() => events.onRemoveState(s.id)} title={s.name}>
                            <img className="icon-img" src={s.icon} alt={s.name} />
                        </Chip>
                    ))}
                </div>
                {data.monster && data.monster.attacks.length > 0 && (
                    <div className="participant-card__attacks">
                        {data.monster.attacks.map((a) => (
                            <span key={a.id} className="participant-card__attack" title={a.notes || undefined}>
                                {a.name ? `${a.name} ` : ''}
                                {formatAttack(a)}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="participant-card__actions">
                {data.monster && (
                    <button
                        type="button"
                        className="btn btn--icon"
                        onClick={events.onShowCard}
                        title="Показать карточку"
                    >
                        <BookOpen size={16} />
                    </button>
                )}
                <button type="button" className="btn btn--icon" onClick={events.openHpDialog} title="Изменить HP">
                    <Heart size={16} />
                </button>
                <button type="button" className="btn btn--icon" onClick={events.openMaxHpDialog} title="Изменить макс. HP">
                    <Maximize2 size={16} />
                </button>
                <button
                    type="button"
                    className="btn btn--icon"
                    onClick={(e) => events.openAddStateMenu(e.currentTarget)}
                    title="Добавить состояние"
                >
                    <Sparkles size={16} />
                </button>
            </div>

            <Dialog
                open={data.hpDialogOpen}
                onClose={events.closeHpDialog}
                onSubmit={events.submitHp}
                title="Изменить HP"
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeHpDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitHp}>
                            Применить
                        </button>
                    </>
                }
            >
                <input
                    className="input"
                    type="number"
                    autoFocus
                    value={data.hpInput}
                    onChange={(e) => events.setHpInput(e.target.value)}
                />
                <p className="participant-card__hint">Значение прибавляется к текущему HP. 0 — восстановить полностью.</p>
            </Dialog>

            <Dialog
                open={data.maxHpDialogOpen}
                onClose={events.closeMaxHpDialog}
                onSubmit={events.submitMaxHp}
                title="Изменить макс. HP"
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeMaxHpDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitMaxHp}>
                            Применить
                        </button>
                    </>
                }
            >
                <input
                    className="input"
                    type="number"
                    autoFocus
                    value={data.maxHpInput}
                    onChange={(e) => events.setMaxHpInput(e.target.value)}
                />
            </Dialog>

            <ParticipantStateMenu
                anchorEl={data.addStateAnchor}
                open={!!data.addStateAnchor}
                onClose={events.closeAddStateMenu}
                onPick={events.onAddState}
            />
        </div>
    )
}
