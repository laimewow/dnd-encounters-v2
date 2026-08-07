import { persistedField } from '../lib/persistedField'
import { genId } from '../lib/random'
import type { Game } from './types'

const _games = persistedField<Game[]>('games', [])
const _activeGameId = persistedField<string | null>('activeGameId', null)

export const useGames = () => _games((s) => s.value)
export const useActiveGameId = () => _activeGameId((s) => s.value)
export const useActiveGame = () => {
    const games = useGames()
    const activeId = useActiveGameId()
    return games.find((g) => g.id === activeId) ?? null
}

function setGames(update: (games: Game[]) => Game[]) {
    _games.getState().setValue(update(_games.getState().value))
}

function setActive(id: string | null) {
    _activeGameId.getState().setValue(id)
}

export const Games = {
    useGames,
    useActiveGameId,
    useActiveGame,

    all(): Game[] {
        return _games.getState().value
    },

    activeId(): string | null {
        return _activeGameId.getState().value
    },

    add(name: string, description: string): Game {
        const game: Game = { id: genId(), name, description, createdAt: new Date().toISOString() }
        setGames((games) => [...games, game])
        if (!_activeGameId.getState().value) setActive(game.id)
        return game
    },

    update(id: string, patch: Partial<Pick<Game, 'name' | 'description'>>) {
        setGames((games) => games.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    },

    remove(id: string) {
        setGames((games) => games.filter((g) => g.id !== id))
        if (_activeGameId.getState().value === id) setActive(null)
    },

    setActive,
}
