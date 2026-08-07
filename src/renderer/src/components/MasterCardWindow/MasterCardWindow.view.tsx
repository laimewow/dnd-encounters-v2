import { useMasterCardWindowVM } from './MasterCardWindow.vm'
import type { WindowContentProps } from '../window/WindowContentProps'
import './MasterCardWindow.style.scss'

export const MasterCardWindow = ({ win }: WindowContentProps) => {
    const { data, events } = useMasterCardWindowVM(win.params?.cardId)

    if (!data.card) {
        return (
            <div className="master-card-window">
                <p className="master-card-window__missing">Карточка удалена</p>
            </div>
        )
    }

    return (
        <div className="master-card-window">
            <input
                className="input master-card-window__title"
                value={data.card.title}
                onChange={(e) => events.onTitleChange(e.target.value)}
            />
            <textarea
                className="input master-card-window__text"
                value={data.card.text}
                onChange={(e) => events.onTextChange(e.target.value)}
            />
        </div>
    )
}
