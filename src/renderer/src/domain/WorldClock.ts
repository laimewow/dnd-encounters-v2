import { persistedField } from '../lib/persistedField'
import type { WorldClockData } from './types'

const initialDate = new Date()
initialDate.setHours(8, 0, 0, 0)

const _clock = persistedField<WorldClockData>('worldClock', {
    date: initialDate,
    weather: 'ясно',
    brightness: 'светло',
    lastRest: initialDate,
})

export const useWorldClock = () => _clock((s) => s.value)

function update(patch: Partial<WorldClockData>) {
    _clock.getState().setValue(patch)
}

export const WorldClock = {
    useWorldClock,

    setWeather(weather: string) {
        update({ weather })
    },

    setBrightness(brightness: string) {
        update({ brightness })
    },

    resetSeconds() {
        const date = new Date(_clock.getState().value.date)
        date.setSeconds(0)
        update({ date })
    },

    modTime(seconds: number) {
        const date = new Date(_clock.getState().value.date)
        date.setSeconds(date.getSeconds() + seconds)
        update({ date })
    },

    longRest(hours: number) {
        const date = new Date(_clock.getState().value.date)
        date.setHours(date.getHours() + hours)
        date.setSeconds(0)
        update({ date, lastRest: new Date(date) })
    },
}
