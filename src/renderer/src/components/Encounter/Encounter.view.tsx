import { Dices, DoorOpen, Play, Plus, SkipForward } from 'lucide-react'
import { useEncounterVM } from './Encounter.vm'
import { EncounterParticipant } from './EncounterParticipant/EncounterParticipant.view'
import { MonsterPicker } from './MonsterPicker/MonsterPicker.view'
import { Dialog } from '../common/Dialog/Dialog.view'
import { YesNoDialog } from '../common/YesNoDialog/YesNoDialog.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import './Encounter.style.scss'

export const Encounter = (_props: WindowContentProps) => {
    const { data, events } = useEncounterVM()

    return (
        <div className="encounter">
            <div className="encounter__toolbar">
                {!data.encounter && (
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={events.onStart}
                        disabled={!data.activeGameId}
                    >
                        <Play size={16} />
                        Начать бой
                    </button>
                )}

                {data.encounter && (data.encounter.stage === 0 || data.encounter.stage === 2) && (
                    <button type="button" className="btn btn--primary" onClick={events.onAdvancePhase}>
                        <Play size={16} />
                        Продолжить
                    </button>
                )}

                {data.encounter && (
                    <button
                        type="button"
                        className="btn btn--outline"
                        ref={data.addMonsterButtonRef}
                        onClick={events.openMonsterPicker}
                    >
                        <Plus size={16} />
                        Монстр
                    </button>
                )}

                {data.encounter?.stage === 0 && (
                    <button type="button" className="btn btn--outline" onClick={events.onRollForNpc}>
                        <Dices size={16} />
                        Инициатива
                    </button>
                )}

                {data.encounter?.stage === 1 && (
                    <button type="button" className="btn btn--outline" onClick={events.onNextTurn}>
                        <SkipForward size={16} />
                        Следующий ход
                    </button>
                )}

                {data.encounter?.stage === 1 && (
                    <button type="button" className="btn btn--outline" onClick={events.onRunAwayRequest}>
                        <DoorOpen size={16} />
                        Бежать
                    </button>
                )}
            </div>

            <div className="encounter__message">{data.message}</div>

            <div className="encounter__participants">
                {data.encounter?.participants.map((p) => (
                    <EncounterParticipant
                        key={p.id}
                        participant={p}
                        stage={data.encounter!.stage}
                        selected={data.selected?.id === p.id}
                    />
                ))}
            </div>

            <MonsterPicker
                anchorEl={data.addMonsterButtonRef.current}
                open={data.monsterPickerOpen}
                onClose={events.closeMonsterPicker}
            />

            <YesNoDialog
                open={data.runAwayConfirmOpen}
                title="Сбежать?"
                message="Бой будет завершён без результатов."
                onConfirm={events.onRunAwayConfirm}
                onCancel={events.onRunAwayCancel}
            />

            <Dialog
                open={data.hpDialogOpen}
                onClose={events.closeHpDialog}
                onSubmit={events.submitHpDialog}
                title={`HP: ${data.selected?.name ?? ''}`}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeHpDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitHpDialog}>
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
            </Dialog>

            <Dialog
                open={data.maxHpDialogOpen}
                onClose={events.closeMaxHpDialog}
                onSubmit={events.submitMaxHpDialog}
                title={`Макс. HP: ${data.selected?.name ?? ''}`}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeMaxHpDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitMaxHpDialog}>
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

            <Dialog
                open={data.initiativeDialogOpen}
                onClose={events.closeInitiativeDialog}
                onSubmit={events.submitInitiativeDialog}
                title={`Инициатива: ${data.selected?.name ?? ''}`}
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeInitiativeDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitInitiativeDialog}>
                            Применить
                        </button>
                    </>
                }
            >
                <input
                    className="input"
                    type="number"
                    autoFocus
                    value={data.initiativeInput}
                    onChange={(e) => events.setInitiativeInput(e.target.value)}
                />
            </Dialog>
        </div>
    )
}
