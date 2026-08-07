import { persistedField } from '../lib/persistedField'
import { genId } from '../lib/random'
import { Scenes } from './Scenes'
import type { MasterCard } from './types'

const _cards = persistedField<MasterCard[]>('masterCards', [])

export const useMasterCards = () => _cards((s) => s.value)
export const useMasterCardsForGame = (gameId: string | null) => {
    const cards = useMasterCards()
    return gameId ? cards.filter((c) => c.gameId === gameId) : []
}

function setCards(update: (cards: MasterCard[]) => MasterCard[]) {
    _cards.getState().setValue(update(_cards.getState().value))
}

export const MasterCards = {
    useMasterCards,
    useMasterCardsForGame,

    add(gameId: string, title: string, text: string): MasterCard {
        const card: MasterCard = { id: genId(), gameId, title, text }
        setCards((cards) => [...cards, card])
        return card
    },

    update(id: string, patch: Partial<Pick<MasterCard, 'title' | 'text'>>) {
        setCards((cards) => cards.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    },

    remove(id: string) {
        setCards((cards) => cards.filter((c) => c.id !== id))
        Scenes.unlinkMasterCardEverywhere(id)
    },

    removeForGame(gameId: string) {
        setCards((cards) => cards.filter((c) => c.gameId !== gameId))
    },
}
