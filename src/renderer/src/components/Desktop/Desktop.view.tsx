import type { ComponentType } from 'react'
import { useWindows, type WindowKind } from '../../domain/WindowManager'
import { WindowFrame } from '../window/WindowFrame/WindowFrame.view'
import type { WindowContentProps } from '../window/WindowContentProps'
import { Encounter } from '../Encounter/Encounter.view'
import { Party } from '../Party/Party.view'
import { Settings } from '../Settings/Settings.view'
import { MonsterLibrary } from '../MonsterLibrary/MonsterLibrary.view'
import { Games } from '../Games/Games.view'
import { Scenes } from '../Scenes/Scenes.view'
import { MasterCards } from '../MasterCards/MasterCards.view'
import { PartyMemberCard } from '../PartyMemberCard/PartyMemberCard.view'
import { SceneCanvas } from '../SceneCanvas/SceneCanvas.view'
import { MasterCardWindow } from '../MasterCardWindow/MasterCardWindow.view'
import { MonsterCardWindow } from '../MonsterCardWindow/MonsterCardWindow.view'
import './Desktop.style.scss'

const WINDOW_CONTENT: Record<WindowKind, ComponentType<WindowContentProps>> = {
    combat: Encounter,
    party: Party,
    settings: Settings,
    monsterLibrary: MonsterLibrary,
    games: Games,
    scenes: Scenes,
    masterCards: MasterCards,
    partyMemberCard: PartyMemberCard,
    masterCardWindow: MasterCardWindow,
    monsterCardWindow: MonsterCardWindow,
}

export const Desktop = () => {
    const windows = useWindows()

    return (
        <div className="desktop">
            <SceneCanvas />
            {windows.map((win) => {
                const Content = WINDOW_CONTENT[win.kind]
                if (!Content) return null
                return (
                    <WindowFrame key={win.id} win={win}>
                        <Content win={win} />
                    </WindowFrame>
                )
            })}
        </div>
    )
}
