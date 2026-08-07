import { Heart, Trash2 } from 'lucide-react'
import { usePartyMemberRowVM } from './PartyMemberRow.vm'
import { ProgressBar } from '../../common/ProgressBar/ProgressBar.view'
import { Dialog } from '../../common/Dialog/Dialog.view'
import { YesNoDialog } from '../../common/YesNoDialog/YesNoDialog.view'
import type { PartyMember } from '../../../domain/types'
import './PartyMemberRow.style.scss'

interface PartyMemberRowProps {
    member: PartyMember
}

export const PartyMemberRow = ({ member }: PartyMemberRowProps) => {
    const { data, events } = usePartyMemberRowVM(member)

    return (
        <div className="party-row">
            <img className="party-row__icon" src={member.icon} alt="" onClick={events.openCard} />
            <div className="party-row__main" onClick={events.openCard}>
                <div className="party-row__name">{member.name}</div>
                <div className="party-row__hp-row">
                    <span className="party-row__hp-text">
                        {member.currentHealth} / {member.maxHealth}
                    </span>
                    <ProgressBar value={member.currentHealth} max={member.maxHealth} />
                </div>
            </div>
            <button type="button" className="btn btn--icon" onClick={events.openHealDialog} title="Изменить HP">
                <Heart size={16} />
            </button>
            <button type="button" className="btn btn--icon" onClick={events.requestDelete} title="Удалить">
                <Trash2 size={16} />
            </button>

            <Dialog
                open={data.hpDialogOpen}
                onClose={events.closeHealDialog}
                onSubmit={events.submitHeal}
                title={`HP: ${member.name}`}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeHealDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitHeal}>
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
                <p className="party-row__hint">Значение прибавляется к текущему HP. 0 — восстановить полностью.</p>
            </Dialog>

            <YesNoDialog
                open={data.deleteConfirmOpen}
                title="Удалить персонажа?"
                message={`«${member.name}» будет удалён из группы.`}
                onConfirm={events.confirmDelete}
                onCancel={events.cancelDelete}
            />
        </div>
    )
}
