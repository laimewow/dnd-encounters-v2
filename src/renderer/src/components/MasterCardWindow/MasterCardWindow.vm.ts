import { MasterCards, useMasterCards } from '../../domain/MasterCards'

export const useMasterCardWindowVM = (cardId: string | undefined) => {
    const cards = useMasterCards()
    const card = cards.find((c) => c.id === cardId) ?? null

    const onTitleChange = (title: string) => {
        if (cardId) MasterCards.update(cardId, { title })
    }
    const onTextChange = (text: string) => {
        if (cardId) MasterCards.update(cardId, { text })
    }

    const data = { card }
    const events = { onTitleChange, onTextChange }

    return { data, events }
}
