import {
    Clock,
    Cloud,
    CloudFog,
    CloudLightning,
    CloudRain,
    Coffee,
    Flashlight,
    Gamepad2,
    LayoutGrid,
    Lightbulb,
    LightbulbOff,
    MapPinned,
    NotebookText,
    PawPrint,
    Settings as SettingsIcon,
    Sun,
    Swords,
    Users,
    type LucideIcon,
} from 'lucide-react'
import { useTopBarVM } from './TopBar.vm'
import { Menu } from '../common/Menu/Menu.view'
import { Dialog } from '../common/Dialog/Dialog.view'
import { YesNoDialog } from '../common/YesNoDialog/YesNoDialog.view'
import { WindowManager, type WindowKind } from '../../domain/WindowManager'
import './TopBar.style.scss'

const WEATHER_ICONS: Record<string, LucideIcon> = {
    ясно: Sun,
    тучи: Cloud,
    дождь: CloudRain,
    гроза: CloudLightning,
    туман: CloudFog,
}
const WEATHER_OPTIONS = Object.keys(WEATHER_ICONS)

const BRIGHTNESS_ICONS: Record<string, LucideIcon> = {
    светло: Lightbulb,
    полумрак: Flashlight,
    темно: LightbulbOff,
}
const BRIGHTNESS_OPTIONS = Object.keys(BRIGHTNESS_ICONS)

interface LauncherItem {
    kind: WindowKind
    title: string
    icon: LucideIcon
    width?: number
    height?: number
}

const LAUNCHER_SECTIONS: { label: string; items: LauncherItem[] }[] = [
    {
        label: 'Игра',
        items: [
            { kind: 'games', title: 'Игры', icon: Gamepad2, width: 420, height: 480 },
            { kind: 'combat', title: 'Бой', icon: Swords, width: 640, height: 600 },
            { kind: 'party', title: 'Группа', icon: Users, width: 420, height: 520 },
            { kind: 'scenes', title: 'Сцены', icon: MapPinned, width: 480, height: 560 },
            { kind: 'masterCards', title: 'Карточки мастера', icon: NotebookText, width: 420, height: 520 },
        ],
    },
    {
        label: 'Общее',
        items: [
            { kind: 'monsterLibrary', title: 'Монстры', icon: PawPrint, width: 420, height: 480 },
            { kind: 'settings', title: 'Настройки', icon: SettingsIcon, width: 420, height: 480 },
        ],
    },
]

export const TopBar = () => {
    const { data, events } = useTopBarVM()
    const WeatherIcon = WEATHER_ICONS[data.weather] ?? Sun
    const BrightnessIcon = BRIGHTNESS_ICONS[data.brightness] ?? Lightbulb

    return (
        <div className="top-bar">
            <button
                type="button"
                className="btn btn--outline"
                onClick={(e) => events.openLauncherMenu(e.currentTarget)}
            >
                <LayoutGrid size={16} />
                Открыть окно
            </button>
            <Menu anchorEl={data.launcherAnchor} open={!!data.launcherAnchor} onClose={events.closeLauncherMenu}>
                {LAUNCHER_SECTIONS.map((section) => (
                    <div key={section.label}>
                        <div className="menu__section">{section.label}</div>
                        {section.items.map(({ kind, title, icon: Icon, width, height }) => (
                            <button
                                key={kind}
                                type="button"
                                className="menu__item"
                                onClick={() => {
                                    WindowManager.open(kind, { title, width, height })
                                    events.closeLauncherMenu()
                                }}
                            >
                                <Icon size={16} />
                                {title}
                            </button>
                        ))}
                    </div>
                ))}
            </Menu>

            <div className="top-bar__spacer" />

            <button
                type="button"
                className={`top-bar__clock${data.flash ? ' top-bar__clock--flash' : ''}`}
                onClick={(e) => events.openClockMenu(e.currentTarget)}
            >
                <Clock size={14} />
                {data.clockText}
            </button>
            <Menu anchorEl={data.clockMenuAnchor} open={!!data.clockMenuAnchor} onClose={events.closeClockMenu}>
                <button type="button" className="menu__item" onClick={events.onResetSeconds}>
                    Сбросить секунды
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(1)}>
                    +1 сек
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(-1)}>
                    -1 сек
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(60)}>
                    +1 мин
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(-60)}>
                    -1 мин
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(3600)}>
                    +1 час
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(-3600)}>
                    -1 час
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(86400)}>
                    +1 день
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(-86400)}>
                    -1 день
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(2592000)}>
                    +1 месяц
                </button>
                <button type="button" className="menu__item" onClick={() => events.onModTime(-2592000)}>
                    -1 месяц
                </button>
            </Menu>

            <button
                type="button"
                className="btn btn--icon"
                onClick={(e) => events.openWeatherMenu(e.currentTarget)}
                title="Погода"
            >
                <WeatherIcon size={16} />
            </button>
            <Menu anchorEl={data.weatherMenuAnchor} open={!!data.weatherMenuAnchor} onClose={events.closeWeatherMenu}>
                {WEATHER_OPTIONS.map((w) => {
                    const Icon = WEATHER_ICONS[w]
                    return (
                        <button key={w} type="button" className="menu__item" onClick={() => events.onSetWeather(w)}>
                            <Icon size={16} />
                            {w}
                        </button>
                    )
                })}
            </Menu>

            <button
                type="button"
                className="btn btn--icon"
                onClick={(e) => events.openBrightnessMenu(e.currentTarget)}
                title="Освещённость"
            >
                <BrightnessIcon size={16} />
            </button>
            <Menu
                anchorEl={data.brightnessMenuAnchor}
                open={!!data.brightnessMenuAnchor}
                onClose={events.closeBrightnessMenu}
            >
                {BRIGHTNESS_OPTIONS.map((b) => {
                    const Icon = BRIGHTNESS_ICONS[b]
                    return (
                        <button
                            key={b}
                            type="button"
                            className="menu__item"
                            onClick={() => events.onSetBrightness(b)}
                        >
                            <Icon size={16} />
                            {b}
                        </button>
                    )
                })}
            </Menu>

            <button
                type="button"
                className="top-bar__rest"
                onClick={events.onRestClick}
                disabled={data.restDisabled}
                title={data.restDisabled ? 'Недоступно во время боя' : 'Долгий отдых'}
            >
                <Coffee size={14} />
                {data.sinceRestText}
            </button>

            <Dialog
                open={data.restHoursDialogOpen}
                onClose={events.closeRestHoursDialog}
                onSubmit={events.submitRestHours}
                title="Долгий отдых"
                actions={
                    <>
                        <button type="button" className="btn btn--outline" onClick={events.closeRestHoursDialog}>
                            Отмена
                        </button>
                        <button type="button" className="btn btn--primary" onClick={events.submitRestHours}>
                            Далее
                        </button>
                    </>
                }
            >
                <label className="field">
                    <span className="field__label">Часов</span>
                    <input
                        className="input"
                        type="number"
                        autoFocus
                        value={data.restHoursInput}
                        onChange={(e) => events.setRestHoursInput(e.target.value)}
                    />
                </label>
            </Dialog>

            <YesNoDialog
                open={data.restConfirmOpen}
                title="Долгий отдых"
                message={`Пройдёт ${data.pendingRestHours} ч. Продолжить?`}
                onConfirm={events.confirmRest}
                onCancel={events.cancelRest}
            />

            <YesNoDialog
                open={data.healAllConfirmOpen}
                title="Восстановить группу?"
                message="Не забудьте восстановить половину кубиков хитов! Восстановить HP всей группе до максимума?"
                onConfirm={events.confirmHealAll}
                onCancel={events.cancelHealAll}
            />
        </div>
    )
}
