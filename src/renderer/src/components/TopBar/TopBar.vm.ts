import { useEffect, useRef, useState } from 'react'
import { WorldClock, useWorldClock } from '../../domain/WorldClock'
import { useEncounter } from '../../domain/Encounter'
import { PartyMembers } from '../../domain/PartyMembers'
import { useActiveGameId } from '../../domain/Games'

function formatClock(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatSinceRest(ms: number): string {
    const totalMinutes = Math.floor(Math.max(0, ms) / 60000)
    const days = Math.floor(totalMinutes / (60 * 24))
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
    return `${days} дн ${hours} ч`
}

export const useTopBarVM = () => {
    const clock = useWorldClock()
    const encounter = useEncounter()
    const activeGameId = useActiveGameId()

    const [launcherAnchor, setLauncherAnchor] = useState<HTMLElement | null>(null)
    const [clockMenuAnchor, setClockMenuAnchor] = useState<HTMLElement | null>(null)
    const [weatherMenuAnchor, setWeatherMenuAnchor] = useState<HTMLElement | null>(null)
    const [brightnessMenuAnchor, setBrightnessMenuAnchor] = useState<HTMLElement | null>(null)

    const [restHoursDialogOpen, setRestHoursDialogOpen] = useState(false)
    const [restHoursInput, setRestHoursInput] = useState('8')
    const [pendingRestHours, setPendingRestHours] = useState(8)
    const [restConfirmOpen, setRestConfirmOpen] = useState(false)
    const [healAllConfirmOpen, setHealAllConfirmOpen] = useState(false)

    const [flash, setFlash] = useState(false)
    const prevTimeRef = useRef(clock.date.getTime())
    useEffect(() => {
        const time = clock.date.getTime()
        if (time === prevTimeRef.current) return
        prevTimeRef.current = time
        setFlash(true)
        const timer = setTimeout(() => setFlash(false), 400)
        return () => clearTimeout(timer)
    }, [clock.date])

    const openLauncherMenu = (el: HTMLElement) => setLauncherAnchor(el)
    const closeLauncherMenu = () => setLauncherAnchor(null)

    const openClockMenu = (el: HTMLElement) => setClockMenuAnchor(el)
    const closeClockMenu = () => setClockMenuAnchor(null)
    const openWeatherMenu = (el: HTMLElement) => setWeatherMenuAnchor(el)
    const closeWeatherMenu = () => setWeatherMenuAnchor(null)
    const openBrightnessMenu = (el: HTMLElement) => setBrightnessMenuAnchor(el)
    const closeBrightnessMenu = () => setBrightnessMenuAnchor(null)

    const onResetSeconds = () => {
        WorldClock.resetSeconds()
        closeClockMenu()
    }
    const onModTime = (seconds: number) => {
        WorldClock.modTime(seconds)
        closeClockMenu()
    }
    const onSetWeather = (weather: string) => {
        WorldClock.setWeather(weather)
        closeWeatherMenu()
    }
    const onSetBrightness = (brightness: string) => {
        WorldClock.setBrightness(brightness)
        closeBrightnessMenu()
    }

    const onRestClick = () => {
        if (encounter) return
        setRestHoursInput('8')
        setRestHoursDialogOpen(true)
    }
    const closeRestHoursDialog = () => setRestHoursDialogOpen(false)
    const submitRestHours = () => {
        const hours = Number(restHoursInput)
        setRestHoursDialogOpen(false)
        if (Number.isNaN(hours)) return
        setPendingRestHours(hours)
        setRestConfirmOpen(true)
    }
    const confirmRest = () => {
        WorldClock.longRest(pendingRestHours)
        setRestConfirmOpen(false)
        setHealAllConfirmOpen(true)
    }
    const cancelRest = () => setRestConfirmOpen(false)
    const confirmHealAll = () => {
        if (activeGameId) PartyMembers.healAll(activeGameId)
        setHealAllConfirmOpen(false)
    }
    const cancelHealAll = () => setHealAllConfirmOpen(false)

    const sinceRestMs = clock.date.getTime() - clock.lastRest.getTime()

    const data = {
        clockText: formatClock(clock.date),
        flash,
        weather: clock.weather,
        brightness: clock.brightness,
        sinceRestText: formatSinceRest(sinceRestMs),
        restDisabled: !!encounter,
        launcherAnchor,
        clockMenuAnchor,
        weatherMenuAnchor,
        brightnessMenuAnchor,
        restHoursDialogOpen,
        restHoursInput,
        restConfirmOpen,
        healAllConfirmOpen,
        pendingRestHours,
    }

    const events = {
        openLauncherMenu,
        closeLauncherMenu,
        openClockMenu,
        closeClockMenu,
        onResetSeconds,
        onModTime,
        openWeatherMenu,
        closeWeatherMenu,
        onSetWeather,
        openBrightnessMenu,
        closeBrightnessMenu,
        onSetBrightness,
        onRestClick,
        closeRestHoursDialog,
        submitRestHours,
        setRestHoursInput,
        confirmRest,
        cancelRest,
        confirmHealAll,
        cancelHealAll,
    }

    return { data, events }
}
