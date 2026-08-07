import { Games } from './Games'
import { PartyMembers } from './PartyMembers'
import { Scenes } from './Scenes'
import { WindowManager } from './WindowManager'

/**
 * One-shot fixup for data saved before games existed: park any pre-existing
 * party members without a gameId into a freshly created default game instead
 * of silently hiding them once party reads become game-scoped.
 */
export function runStartupMigration(): void {
    Scenes.ensurePrimitivesField()
    Scenes.ensureRotationField()
    Scenes.ensureMasterCardIdsField()
    WindowManager.pruneStaleWindows()

    if (Games.all().length > 0) return
    const ungamed = PartyMembers.all().filter((m) => !m.gameId)
    if (ungamed.length === 0) return

    const game = Games.add('Моя игра', '')
    for (const member of ungamed) {
        PartyMembers.update(member.id, { gameId: game.id })
    }
}
