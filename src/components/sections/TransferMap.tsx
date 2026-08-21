'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import type { Dictionary } from '@/dictionaries'

// --- Landscape (desktop) layout — viewBox 800 x 380 ---
const L = {
    MAS: { x: 110, y: 58 },
    FELIX: { x: 670, y: 54 },
    CRISOL: { x: 220, y: 210 },
    TARRAGONA: { x: 600, y: 310 },
}

// --- Portrait (mobile) layout — viewBox 420 x 680 ---
const P = {
    MAS: { x: 85, y: 80 },
    FELIX: { x: 340, y: 100 },
    CRISOL: { x: 100, y: 310 },
    TARRAGONA: { x: 340, y: 570 },
}

// --- Day / night cycle -----------------------------------------------------
// One 30s loop retells the transfer: the combi leaves Tarragona at first light,
// climbs to Mas Corbella while the sun rises (ida, 11:30), waits there through
// midday and drives back down under the stars (vuelta, 23:00).
const CYCLE = '30s'
const MIDDAY = 11.4 // seconds into the loop: parked at the venue, guests out, sun at its highest

// --- The stops -------------------------------------------------------------
// The combi waits at every pick-up while people get on (ida) or off (vuelta).
const PARK = 0.03 // it halts just short of a marker, so it never covers the number
const DWELL = 0.04 // how long it waits at a pick-up
const LEAVES_HOME = 0.05 // departs Tarragona
const REACHES_VENUE = 0.32
// The party runs until dark: the combi only heads home once night has fallen,
// and the farmhouse sends it off with fireworks
const FIREWORKS = 0.58
const LEAVES_VENUE = 0.66
const BACK_HOME = 0.95

// `at` is where the hotel sits along the route, `halt` where the combi pulls up:
// a bus-length away, on whichever side leaves the marker and its label visible.
type Stop = { at: number; halt: number }
// `turns` are the points where the route doubles back horizontally, measured on
// the path. Both routes set off leftwards, so the combi faces left until the first.
type Route = { crisol: Stop; felix: Stop; turns: number[] }

const LANDSCAPE_ROUTE: Route = {
    crisol: { at: 0.2705, halt: 0.2514 },
    felix: { at: 0.6135, halt: 0.5944 },
    turns: [0.2706, 0.6136],
}
const PORTRAIT_ROUTE: Route = {
    crisol: { at: 0.3725, halt: 0.4015 },
    felix: { at: 0.722, halt: 0.751 },
    turns: [0.3861, 0.7219],
}

const round4 = (n: number) => +n.toFixed(4)

/**
 * Turns the stop positions into the combi's keyPoints/keyTimes plus the instant
 * it pulls into each hotel, so passengers and marker pulses hang off one clock.
 */
function schedule({ crisol, felix, turns }: Route) {
    const stopC = crisol.halt
    const stopF = felix.halt
    const legs = [stopC - PARK, stopF - stopC, 1 - PARK - stopF]
    const span = 1 - 2 * PARK
    const out = (REACHES_VENUE - LEAVES_HOME - 2 * DWELL) / span
    const back = (BACK_HOME - LEAVES_VENUE - 2 * DWELL) / span

    const crisolOut = round4(LEAVES_HOME + out * legs[0])
    const felixOut = round4(crisolOut + DWELL + out * legs[1])
    const felixBack = round4(LEAVES_VENUE + back * legs[2])
    const crisolBack = round4(felixBack + DWELL + back * legs[1])
    const wait = (t: number) => round4(t + DWELL)

    const points = [PARK, PARK, stopC, stopC, stopF, stopF, 1 - PARK, 1 - PARK, stopF, stopF, stopC, stopC, PARK, PARK]
    const times = [
        0, LEAVES_HOME,
        crisolOut, wait(crisolOut), felixOut, wait(felixOut),
        REACHES_VENUE, LEAVES_VENUE,
        felixBack, wait(felixBack), crisolBack, wait(crisolBack),
        BACK_HOME, 1,
    ]

    return {
        keyPoints: points.join(';'),
        keyTimes: times.join(';'),
        facing: facingKeyframes(points, times, turns),
        crisol: [crisolOut, crisolBack] as [number, number],
        felix: [felixOut, felixBack] as [number, number],
    }
}

const PIVOT = 0.012 // how long the combi takes to swing round, as a fraction of the loop

/**
 * Which way the combi points at every moment: the way it is travelling along the
 * route (out or back) combined with whether the route runs left or right there.
 * Every change becomes a pair of scale keyframes, so the flip reads as the combi
 * pivoting on the spot rather than snapping.
 */
function facingKeyframes(points: number[], times: number[], turns: number[]) {
    // Both routes set off leftwards: an even number of turns behind us means left
    const runsRight = (u: number) => turns.filter((turn) => turn < u).length % 2 === 1

    const changes: { at: number; right: boolean }[] = []
    for (let i = 1; i < points.length; i++) {
        const [u0, u1, t0, t1] = [points[i - 1], points[i], times[i - 1], times[i]]
        if (u0 === u1) continue // waiting at a stop

        const forward = u1 > u0
        const crossed = turns
            .filter((turn) => turn > Math.min(u0, u1) && turn < Math.max(u0, u1))
            .sort((a, b) => (forward ? a - b : b - a))

        for (const u of [u0, ...crossed]) {
            const at = t0 + ((t1 - t0) * (u - u0)) / (u1 - u0)
            const ahead = forward ? u + 0.0001 : u - 0.0001
            changes.push({ at: round4(at), right: runsRight(ahead) === forward })
        }
    }

    // Back in Tarragona it swings round again, ready for the next morning
    const first = changes[0]
    if (changes[changes.length - 1].right !== first.right) {
        changes.push({ at: round4((BACK_HOME + 1) / 2), right: first.right })
    }

    const keyTimes = [0]
    const values = [first.right ? '1 1' : '-1 1']
    for (const change of changes.slice(1)) {
        const value = change.right ? '1 1' : '-1 1'
        if (value === values[values.length - 1]) continue

        // centred on the turn, so it is side-on exactly where the road doubles back
        const from = Math.max(round4(change.at - PIVOT / 2), round4(keyTimes[keyTimes.length - 1] + 0.001))
        keyTimes.push(from, Math.max(round4(change.at + PIVOT / 2), round4(from + 0.001)))
        values.push(values[values.length - 1], value)
    }
    keyTimes.push(1)
    values.push(values[values.length - 1])

    return { keyTimes: keyTimes.join(';'), values: values.join(';') }
}

/**
 * A track that sits still all day and only misbehaves on the way home, easing
 * off over the last few steps as the combi pulls into Tarragona.
 */
function onTheWayHome(from: number, to: number, steps: number, still: string, step: (i: number, settling: number) => string) {
    const keyTimes = [0, from]
    const values = [still, still]

    for (let i = 1; i <= steps; i++) {
        keyTimes.push(round4(from + ((to - from) * i) / (steps + 1)))
        values.push(step(i, Math.min(1, (steps + 1 - i) / 3)))
    }

    keyTimes.push(to, 1)
    values.push(still, still)
    return { keyTimes: keyTimes.join(';'), values: values.join(';') }
}

// How hard the combi leans on each lurch, in degrees, cycled for an uneven gait
const LURCHES = [4, 2.8, 5.6, 3.2, 6.4, 2.4, 4.8]

// It rocks over its wheels, like the party it is carrying...
const DRUNKEN_SWAY = onTheWayHome(LEAVES_VENUE, BACK_HOME, 20, '0 0 5', (i, settling) =>
    `${round4(LURCHES[i % LURCHES.length] * (i % 2 ? 1 : -1) * settling)} 0 5`)

// ...and bounces on a different beat, so the two never quite line up
const DRUNKEN_BOUNCE = onTheWayHome(LEAVES_VENUE, BACK_HOME, 13, '0 0', (i, settling) =>
    `0 ${round4(-0.9 * (i % 2 ? 1 : 0.3) * settling)}`)

type Timing = { keyTimes: string; values: string }

// Guests waiting at a hotel: they board on the way up, come back on the way down
const waitingAt = ([out, back]: [number, number]): Timing => ({
    keyTimes: `0;${out};${round4(out + DWELL)};${back};${round4(back + DWELL)};1`,
    values: '0.85;0.85;0;0;0.85;0.85',
})
const WAITING_IN_TARRAGONA: Timing = {
    keyTimes: `0;${LEAVES_HOME};${BACK_HOME};${round4(BACK_HOME + 0.03)};1`,
    values: '0.85;0;0;0.85;0.85',
}
// Guests spill out when the combi arrives, stay in front of the house through
// the whole party and the fireworks, and climb back aboard as it pulls away
const AT_THE_VENUE: Timing = {
    keyTimes: `0;${REACHES_VENUE};${round4(REACHES_VENUE + 0.03)};${round4(LEAVES_VENUE - 0.03)};${LEAVES_VENUE};1`,
    values: '0;0;0.85;0.85;0;0',
}

// The shadow swings with the sun: long at dawn, short at midday, long at dusk
const SHADOW_TIMES = '0;0.09;0.18;0.28;0.4;0.5;0.58;1'

// Night veil over the paper — kept light so the ink stays readable
const NIGHT_TIMES = '0;0.06;0.16;0.4;0.54;0.62;1'
const NIGHT_OPACITY = '0.42;0.32;0;0;0.32;0.42;0.42'
// Anything that only shines at night: stars, headlights, lit windows
const NIGHT_LIGHTS = '0.9;0.7;0;0;0.7;0.9;0.9'
// Warm sunrise / sunset wash
const WARM_TIMES = '0;0.08;0.2;0.38;0.5;0.6;1'
const WARM_OPACITY = '0;0.18;0.05;0.05;0.22;0;0'

const SUN_FADE_TIMES = '0;0.09;0.4;0.52;1'
const SUN_FADE = '0;1;1;0;0'
const MOON_FADE_TIMES = '0;0.52;0.62;0.96;1'
const MOON_FADE = '0;0;0.9;0.9;0'
const MOON_TIMES = '0;0.5;1'
// The moon is already well up when it appears, and keeps climbing all night
const MOON_KEY_POINTS = '0.25;0.35;0.72'

type Star = [x: number, y: number, r: number]

function crescent(r: number) {
    return `M 0 ${-r} A ${r} ${r} 0 1 0 0 ${r} A ${r * 1.5} ${r * 1.5} 0 0 1 0 ${-r} Z`
}

function sunRays(r: number) {
    return Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        return {
            key: i,
            x1: +(cos * r * 1.45).toFixed(2),
            y1: +(sin * r * 1.45).toFixed(2),
            x2: +(cos * r * 2.05).toFixed(2),
            y2: +(sin * r * 2.05).toFixed(2),
        }
    })
}

// --- Sky: the sun rises over the sea (bottom right) and sets inland ---------
const LANDSCAPE_ARC = 'M 720 330 Q 400 -170 80 300'
const LANDSCAPE_STARS: Star[] = [
    [60, 60, 1.2], [104, 180, 1], [150, 44, 1.4], [196, 80, 0.9], [248, 150, 1.1],
    [276, 52, 1.3], [318, 26, 1], [352, 196, 1.2], [404, 64, 0.9], [430, 148, 1.4],
    [468, 32, 1.1], [492, 96, 1], [520, 220, 1.3], [556, 58, 1.2], [588, 140, 0.9],
    [604, 196, 1.1], [640, 246, 1.3], [672, 150, 1], [700, 60, 1.4], [726, 214, 1.1],
    [748, 120, 0.9], [268, 300, 1.2], [180, 336, 1], [404, 330, 1.1],
]

// Portrait has no room for a full arc: the sun climbs the right edge with the
// combi and slides back down the same way as it drives home.
const PORTRAIT_ARC = 'M 352 596 C 380 482 382 312 336 208'
const PORTRAIT_STARS: Star[] = [
    [40, 120, 1.1], [152, 60, 1.3], [224, 88, 1], [286, 44, 1.2], [386, 60, 1.1],
    [392, 146, 1.3], [40, 200, 1], [112, 214, 1.2], [300, 168, 0.9], [386, 240, 1.3],
    [44, 272, 1.1], [152, 258, 0.9], [286, 252, 1.2], [390, 320, 1], [46, 360, 1.3],
    [130, 372, 1], [228, 352, 1.1], [318, 368, 1.2], [392, 412, 1], [60, 432, 1.2],
    [168, 448, 0.9], [262, 428, 1.3], [382, 468, 1.1], [44, 506, 1], [130, 540, 1.2],
    [212, 520, 0.9], [300, 560, 1.1], [390, 600, 1.3],
]

/** Anything that only lights up after sunset: bus windows, headlights, the house. */
function NightLight({ children }: { children: ReactNode }) {
    return (
        <g fill="#FFE2A0" stroke="none" opacity="0">
            <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={NIGHT_TIMES} values={NIGHT_LIGHTS} />
            {children}
        </g>
    )
}

/** A ring that flares out of a stop when the combi pulls in — twice per loop. */
function StopPulse({ cx, cy, r, at, color = '#5E6B3C' }: { cx: number; cy: number; r: number; at: [number, number]; color?: string }) {
    const flare = 0.04
    const [out, back] = at
    const keyTimes = `0;${out};${round4(out + flare)};${round4(out + flare + 0.001)};${back};${round4(back + flare)};1`

    return (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="1.4" opacity="0">
            <animate attributeName="r" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={keyTimes} values={`${r};${r};${r * 2.1};${r};${r};${r * 2.1};${r}`} />
            <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={keyTimes} values="0;0.5;0;0;0.5;0;0" />
        </circle>
    )
}

// Two grown-ups and a kid, drawn in the same pencil as the rest of the map
const GUESTS = [
    { dx: -5.5, h: 1 },
    { dx: 0, h: 1.08 },
    { dx: 5, h: 0.72 },
]

/** Guests at a stop: they fade out as they board and back in when dropped off. */
function Passengers({ x, y, timing, scale = 1 }: { x: number; y: number; timing: Timing; scale?: number }) {
    return (
        <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#5E6B3C" strokeWidth="0.75" fill="none" strokeLinecap="round" opacity="0">
            <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={timing.keyTimes} values={timing.values} />
            {GUESTS.map((g) => (
                <g key={g.dx} transform={`translate(${g.dx} 0) scale(${g.h})`}>
                    <circle cx="0" cy="-4.6" r="1.15" fill="#FDFBF5" />
                    <path d="M 0 -3.4 L 0 -1 M -1.5 -2.7 L 1.5 -2.7 M 0 -1 L -1.3 0.8 M 0 -1 L 1.3 0.8" />
                </g>
            ))}
        </g>
    )
}

// A burst is twelve spokes with a ring of embers falling between them
const SPOKES = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6
    return { key: i, cos: +Math.cos(angle).toFixed(3), sin: +Math.sin(angle).toFixed(3) }
})
const EMBERS = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i + 0.5) * Math.PI) / 6
    return { key: i, cos: +Math.cos(angle).toFixed(3), sin: +Math.sin(angle).toFixed(3) }
})

const RISE = 0.014 // how long a rocket takes to climb, as a fraction of the loop
const BLOOM = 0.05 // and how long its burst hangs in the sky

type Burst = { x: number; y: number; r: number; after: number; color: string }

/**
 * The send-off: rockets climb from the farmhouse and burst over it in the last
 * moments of the party, just before the combi pulls away. Silent all day, like
 * everything else here, because the whole map runs off one 30s loop.
 */
function Fireworks({ from, bursts }: { from: { x: number; y: number }; bursts: Burst[] }) {
    return (
        <g>
            {bursts.map((burst) => {
                const lit = round4(FIREWORKS + burst.after)
                const opens = round4(lit + RISE)
                const fades = round4(opens + BLOOM)

                return (
                    <g key={`${burst.x}-${burst.y}`}>
                        {/* the rocket climbing */}
                        <circle r="1.1" fill="#EFBB78" opacity="0">
                            <animate attributeName="cx" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={`0;${lit};${opens};1`} values={`${from.x};${from.x};${burst.x};${burst.x}`} />
                            <animate attributeName="cy" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={`0;${lit};${opens};1`} values={`${from.y};${from.y};${burst.y};${burst.y}`} />
                            <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={`0;${lit};${round4(lit + 0.002)};${round4(opens - 0.002)};${opens};1`} values="0;0;0.9;0.9;0;0" />
                        </circle>

                        {/* and the burst it opens into */}
                        <g transform={`translate(${burst.x} ${burst.y})`}>
                            <g opacity="0" stroke={burst.color} strokeWidth="1.3" strokeLinecap="round" fill={burst.color}>
                                <animateTransform attributeName="transform" type="scale" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={`0;${opens};${round4(opens + 0.014)};${fades};1`} values="0.15;0.15;1;1.3;1.3" />
                                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={`0;${opens};${round4(opens + 0.006)};${round4(opens + 0.022)};${fades};1`} values="0;0;0.95;0.8;0;0" />
                                <circle r={round4(burst.r * 0.85)} stroke="none" opacity="0.15" />
                                {SPOKES.map(({ key, cos, sin }) => (
                                    <g key={key}>
                                        <line x1={round4(cos * burst.r * 0.3)} y1={round4(sin * burst.r * 0.3)} x2={round4(cos * burst.r)} y2={round4(sin * burst.r)} />
                                        <circle cx={round4(cos * burst.r)} cy={round4(sin * burst.r)} r="1.1" stroke="none" />
                                    </g>
                                ))}
                                {EMBERS.map(({ key, cos, sin }) => (
                                    <circle key={key} cx={round4(cos * burst.r * 0.62)} cy={round4(sin * burst.r * 0.62)} r="0.9" stroke="none" opacity="0.8" />
                                ))}
                            </g>
                        </g>
                    </g>
                )
            })}
        </g>
    )
}

/** A curl of smoke drawn in pencil, rising from the farmhouse chimney. */
function ChimneySmoke({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x} ${y})`} stroke="#5E6B3C" fill="none" strokeWidth="0.35" strokeLinecap="round">
            {[0, 2, 4].map((delay) => (
                <path key={delay} d="M 0 0 q 2 -1.8 0.5 -3.6 q -1.6 -2 0.4 -3.8" opacity="0">
                    <animateTransform attributeName="transform" type="translate" values="0 0;-1.4 -9" dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;0.6;0" dur="6s" begin={`${delay}s`} repeatCount="indefinite" />
                </path>
            ))}
        </g>
    )
}

/**
 * SMIL ignores prefers-reduced-motion, so freeze the whole map at midday —
 * combi parked at Mas Corbella, sun high — for anyone who asks for less motion.
 */
function useStillWhenReducedMotion() {
    const ref = useRef<SVGSVGElement>(null)

    useEffect(() => {
        const svg = ref.current
        if (!svg) return

        const query = window.matchMedia('(prefers-reduced-motion: reduce)')
        const apply = () => {
            if (query.matches) {
                svg.setCurrentTime(MIDDAY)
                svg.pauseAnimations()
            } else {
                svg.unpauseAnimations()
            }
        }

        apply()
        query.addEventListener('change', apply)
        return () => query.removeEventListener('change', apply)
    }, [])

    return ref
}

/**
 * Sky layers for a map: the night veil, the dawn/dusk glow, the stars and the
 * sun + moon travelling `arc`. Everything shares the same 30s loop as the bus,
 * so sunrise happens on the way up and sunset on the way back.
 */
function SkyCycle({
    id,
    width,
    height,
    arc,
    stars,
    sunKeyPoints,
    sunKeyTimes,
    sunR = 13,
    moonR = 9,
}: {
    id: string
    width: number
    height: number
    arc: string
    stars: Star[]
    sunKeyPoints: string
    sunKeyTimes: string
    sunR?: number
    moonR?: number
}) {
    const arcId = `sky-arc-${id}`

    return (
        <>
            {/* Night veil */}
            <rect width={width} height={height} fill="#0E2F8C">
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={NIGHT_TIMES} values={NIGHT_OPACITY} />
            </rect>

            {/* Sunrise / sunset glow */}
            <rect width={width} height={height} fill="#E9A45E">
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={WARM_TIMES} values={WARM_OPACITY} />
            </rect>

            {/* Stars */}
            <g fill="#FDFBF5">
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={NIGHT_TIMES} values={NIGHT_LIGHTS} />
                {stars.map(([x, y, r]) => (
                    <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
                ))}
            </g>

            {/* Path the sun and the moon travel (invisible) */}
            <path id={arcId} d={arc} fill="none" stroke="none" />

            {/* Sun */}
            <g>
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={SUN_FADE_TIMES} values={SUN_FADE} />
                <circle r={sunR * 2.9} fill="#E9A45E" opacity="0.09" />
                <circle r={sunR * 1.8} fill="#E9A45E" opacity="0.13" />
                <g stroke="#C4714A" strokeWidth="0.7" strokeLinecap="round" opacity="0.45">
                    {sunRays(sunR).map((ray) => (
                        <line key={ray.key} x1={ray.x1} y1={ray.y1} x2={ray.x2} y2={ray.y2} />
                    ))}
                </g>
                <circle r={sunR} fill="#EFBB78" stroke="#C4714A" strokeWidth="0.7" opacity="0.85" />
                <animateMotion dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyPoints={sunKeyPoints} keyTimes={sunKeyTimes}>
                    <mpath href={`#${arcId}`} />
                </animateMotion>
            </g>

            {/* Moon */}
            <g>
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={MOON_FADE_TIMES} values={MOON_FADE} />
                <g transform="rotate(-20)">
                    <circle r={moonR * 2.4} fill="#DCE4F2" opacity="0.12" />
                    <path d={crescent(moonR)} fill="#F6F1E2" stroke="#A89880" strokeWidth="0.4" />
                </g>
                <animateMotion dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyPoints={MOON_KEY_POINTS} keyTimes={MOON_TIMES}>
                    <mpath href={`#${arcId}`} />
                </animateMotion>
            </g>
        </>
    )
}

/** The VW combi doing the round trip: up at daylight, back with the lights on. */
function Combi({ routeId, keyPoints, keyTimes, facing }: { routeId: string; keyPoints: string; keyTimes: string; facing: Timing }) {
    return (
        <g>
            {/* Shadow: long at sunrise, short at midday, long the other way at dusk */}
            <ellipse cy="8" ry="1.2" fill="#000">
                <animate attributeName="cx" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={SHADOW_TIMES} values="0;-10;-5;0;5;10;0;0" />
                <animate attributeName="rx" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={SHADOW_TIMES} values="13;20;15;11;15;20;13;13" />
                <animate attributeName="opacity" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={SHADOW_TIMES} values="0.05;0.1;0.13;0.15;0.13;0.09;0.05;0.05" />
            </ellipse>
            {/* Pivots wherever the road doubles back, so it always faces the way it goes */}
            <g>
                <animateTransform attributeName="transform" type="scale" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={facing.keyTimes} values={facing.values} />
                <animateTransform attributeName="transform" type="translate" additive="sum" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={DRUNKEN_BOUNCE.keyTimes} values={DRUNKEN_BOUNCE.values} />
                {/* And rocks all the way home, like the party it is carrying */}
                <g>
                    <animateTransform attributeName="transform" type="rotate" dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyTimes={DRUNKEN_SWAY.keyTimes} values={DRUNKEN_SWAY.values} />
                    <path d="M -13 -1 L 14 -1 L 14 4 Q 14 5 13 5 L -13 5 Q -14 5 -14 4 L -14 0 Q -14 -1 -13 -1 Z" fill="#5BB1A8" />
                    <path d="M -13 -1 L -13 -7 Q -13 -9 -11 -9 L 7 -9 Q 13 -9 14 -4 L 14 -1 Z" fill="#F3ECDB" />
                    <line x1="-14" y1="-1" x2="14" y2="-1" stroke="#A89880" strokeWidth="0.35" />
                    <path d="M 8 -7.5 Q 11 -7.5 12.5 -4.6 L 8 -3.5 Z" fill="#8FB9C1" opacity="0.75" />
                    <rect x="-11" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                    <rect x="-7" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                    <rect x="-3" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                    <rect x="1" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                    {/* Windows lit after sunset */}
                    <NightLight>
                        <path d="M 8 -7.5 Q 11 -7.5 12.5 -4.6 L 8 -3.5 Z" />
                        <rect x="-11" y="-7" width="3.4" height="4" rx="0.4" />
                        <rect x="-7" y="-7" width="3.4" height="4" rx="0.4" />
                        <rect x="-3" y="-7" width="3.4" height="4" rx="0.4" />
                        <rect x="1" y="-7" width="3.4" height="4" rx="0.4" />
                    </NightLight>
                    <circle cx="12.3" cy="1.2" r="1.1" fill="none" stroke="#F3ECDB" strokeWidth="0.4" />
                    <circle cx="12.8" cy="3" r="0.75" fill="#FFF7E0" stroke="#A89880" strokeWidth="0.2" />
                    {/* Headlight glow after sunset */}
                    <NightLight>
                        <circle cx="14.2" cy="2.8" r="3" opacity="0.3" />
                        <circle cx="13.2" cy="2.9" r="1.5" opacity="0.9" />
                    </NightLight>
                    <rect x="7" y="4" width="7.2" height="1" rx="0.3" fill="#F3ECDB" />
                    <circle cx="-8.5" cy="5.2" r="2.6" fill="#2D2A24" />
                    <circle cx="-8.5" cy="5.2" r="1.3" fill="#F3ECDB" />
                    <circle cx="-8.5" cy="5.2" r="0.4" fill="#5E6B3C" />
                    <circle cx="8.5" cy="5.2" r="2.6" fill="#2D2A24" />
                    <circle cx="8.5" cy="5.2" r="1.3" fill="#F3ECDB" />
                    <circle cx="8.5" cy="5.2" r="0.4" fill="#5E6B3C" />
                </g>
            </g>
            <animateMotion dur={CYCLE} repeatCount="indefinite" calcMode="linear" keyPoints={keyPoints} keyTimes={keyTimes}>
                <mpath href={`#${routeId}`} />
            </animateMotion>
        </g>
    )
}

export function TransferMap({ dict }: { dict: Dictionary }) {
    const m = dict.accommodation.map
    const hotels = dict.accommodation.hotels
    const portraitRef = useStillWhenReducedMotion()
    const landscapeRef = useStillWhenReducedMotion()
    const landscapeTrip = schedule(LANDSCAPE_ROUTE)
    const portraitTrip = schedule(PORTRAIT_ROUTE)

    // Routes (ida order): Tarragona → Crisol → Félix → Mas Corbella
    const landscapeRoute = [
        `M ${L.TARRAGONA.x} ${L.TARRAGONA.y}`,
        `C 490 310 320 260 ${L.CRISOL.x} ${L.CRISOL.y}`,
        `C 260 120 480 15 ${L.FELIX.x} ${L.FELIX.y}`,
        `C 520 10 300 15 ${L.MAS.x} ${L.MAS.y}`,
    ].join(' ')

    const portraitRoute = [
        `M ${P.TARRAGONA.x} ${P.TARRAGONA.y}`,
        `C 280 520 130 420 ${P.CRISOL.x} ${P.CRISOL.y}`,
        `C 70 230 330 190 ${P.FELIX.x} ${P.FELIX.y}`,
        `C 310 60 120 40 ${P.MAS.x} ${P.MAS.y}`,
    ].join(' ')

    return (
        <div className="w-full">
            <div className="relative overflow-hidden bg-sand-light/60 border border-sand rounded-2xl">
                {/* ------- PORTRAIT MAP (mobile) ------- */}
                <svg
                    ref={portraitRef}
                    viewBox="0 0 420 680"
                    className="w-full h-auto block md:hidden"
                    role="img"
                    aria-label={m.title}
                >
                    <defs>
                        <pattern id="map-dots-p" width="22" height="22" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.7" fill="#5E6B3C" opacity="0.05" />
                        </pattern>
                    </defs>

                    <rect width="420" height="680" fill="url(#map-dots-p)" />

                    {/* Corner stains */}
                    <circle cx="40" cy="40" r="55" fill="#5E6B3C" opacity="0.025" />
                    <circle cx="390" cy="640" r="65" fill="#5E6B3C" opacity="0.02" />

                    {/* Sunrise on the way up, sunset on the way back */}
                    <SkyCycle
                        id="p"
                        width={420}
                        height={680}
                        arc={PORTRAIT_ARC}
                        stars={PORTRAIT_STARS}
                        sunKeyPoints="0;1;1;0;0"
                        sunKeyTimes="0;0.32;0.4;0.56;1"
                        sunR={11}
                        moonR={8}
                    />

                    {/* Decorative double border */}
                    <rect x="12" y="12" width="396" height="656" fill="none" stroke="#5E6B3C" strokeWidth="1.2" opacity="0.4" rx="14" />
                    <rect x="20" y="20" width="380" height="640" fill="none" stroke="#5E6B3C" strokeWidth="0.5" opacity="0.25" rx="10" strokeDasharray="4 4" />

                    {/* Mountains — straddling the route between Crisol and Félix */}
                    <g opacity="0.3" fill="none" stroke="#5E6B3C" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                        <path d="M 170 228 L 192 200 L 212 228 L 234 202 L 254 230" />
                        <path d="M 186 228 L 200 212 M 220 228 L 234 214" />
                    </g>

                    {/* Waves (near Tarragona) */}
                    <g opacity="0.3" fill="none" stroke="#5E6B3C" strokeWidth="0.9" strokeLinecap="round">
                        <path d="M 240 608 Q 255 603 270 608 T 300 608 T 330 608 T 360 608" />
                        <path d="M 260 624 Q 275 619 290 624 T 320 624 T 350 624" />
                    </g>

                    {/* Dashed route */}
                    <path
                        id="transfer-route-portrait"
                        d={portraitRoute}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeWidth="2.4"
                        strokeDasharray="2 9"
                        strokeLinecap="round"
                        opacity="0.75"
                    />

                    {/* VW Combi doing the round trip */}
                    <Combi routeId="transfer-route-portrait" keyPoints={portraitTrip.keyPoints} keyTimes={portraitTrip.keyTimes} facing={portraitTrip.facing} />

                    {/* Guests waiting at each stop, and the ring that flares when the combi pulls in */}
                    <StopPulse cx={P.TARRAGONA.x} cy={P.TARRAGONA.y} r={13} at={[0.005, BACK_HOME]} />
                    <StopPulse cx={P.CRISOL.x} cy={P.CRISOL.y} r={13} at={portraitTrip.crisol} />
                    <StopPulse cx={P.FELIX.x} cy={P.FELIX.y} r={13} at={portraitTrip.felix} />
                    <StopPulse cx={P.MAS.x} cy={P.MAS.y} r={18} at={[REACHES_VENUE, LEAVES_VENUE]} color="#C4714A" />
                    <Passengers x={306} y={574} timing={WAITING_IN_TARRAGONA} />
                    <Passengers x={66} y={314} timing={waitingAt(portraitTrip.crisol)} />
                    <Passengers x={306} y={104} timing={waitingAt(portraitTrip.felix)} />
                    <Passengers x={80} y={207} timing={AT_THE_VENUE} scale={0.9} />

                    {/* End of the party: fireworks over Mas Corbella */}
                    <Fireworks
                        from={{ x: 74, y: 158 }}
                        bursts={[
                            { x: 152, y: 168, r: 15, after: 0, color: '#EFBB78' },
                            { x: 206, y: 126, r: 12, after: 0.026, color: '#C4714A' },
                            { x: 140, y: 92, r: 12, after: 0.05, color: '#FDFBF5' },
                        ]}
                    />

                    {/* Compass rose bottom-left */}
                    <g transform="translate(58, 620)" opacity="0.6">
                        <circle r="26" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1" />
                        <circle r="20" fill="none" stroke="#5E6B3C" strokeWidth="0.5" strokeDasharray="1 3" />
                        <polygon points="0,-18 3.5,0 0,18 -3.5,0" fill="#5E6B3C" />
                        <polygon points="-18,0 0,-3.5 18,0 0,3.5" fill="#5E6B3C" opacity="0.5" />
                        <circle r="2" fill="#C4714A" />
                        <text x="0" y="-30" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">N</text>
                        <text x="0" y="38" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">S</text>
                        <text x="32" y="4" textAnchor="start" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">E</text>
                        <text x="-32" y="4" textAnchor="end" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">O</text>
                    </g>

                    {/* Markers */}
                    {/* 1. Tarragona (bottom-right) — label above */}
                    <g>
                        <text x={P.TARRAGONA.x} y={P.TARRAGONA.y - 60} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="20" fill="#5E6B3C" fontWeight="500">{m.tarragona_label}</text>
                        <text x={P.TARRAGONA.x} y={P.TARRAGONA.y - 42} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="#A89880" letterSpacing="1">{m.tarragona_sub}</text>
                        <circle cx={P.TARRAGONA.x} cy={P.TARRAGONA.y} r="13" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="2" />
                        <text x={P.TARRAGONA.x} y={P.TARRAGONA.y + 5} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="600">1</text>
                    </g>

                    {/* 2. Crisol La Selva — label to the right of marker */}
                    <g>
                        <circle cx={P.CRISOL.x} cy={P.CRISOL.y} r="13" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="2" />
                        <text x={P.CRISOL.x} y={P.CRISOL.y + 5} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="600">2</text>
                        <text x={P.CRISOL.x + 22} y={P.CRISOL.y + 3} textAnchor="start" fontFamily="'Playfair Display', serif" fontSize="20" fill="#5E6B3C" fontWeight="500">{hotels[1].name}</text>
                        <text x={P.CRISOL.x + 22} y={P.CRISOL.y + 21} textAnchor="start" fontFamily="Inter, sans-serif" fontSize="14" fill="#A89880" letterSpacing="1">{hotels[1].location}</text>
                    </g>

                    {/* 3. Hotel Félix — label below */}
                    <g>
                        <circle cx={P.FELIX.x} cy={P.FELIX.y} r="13" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="2" />
                        <text x={P.FELIX.x} y={P.FELIX.y + 5} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="600">3</text>
                        <text x={P.FELIX.x} y={P.FELIX.y + 42} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="20" fill="#5E6B3C" fontWeight="500">{hotels[0].name}</text>
                        <text x={P.FELIX.x} y={P.FELIX.y + 60} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="#A89880" letterSpacing="1">{hotels[0].location}</text>
                    </g>

                    {/* 4. Mas Corbella — treasure X, label below */}
                    <g>
                        <circle cx={P.MAS.x} cy={P.MAS.y} r="18" fill="#FDFBF5" stroke="#C4714A" strokeWidth="2.2" />
                        <line x1={P.MAS.x - 9} y1={P.MAS.y - 9} x2={P.MAS.x + 9} y2={P.MAS.y + 9} stroke="#C4714A" strokeWidth="2.8" strokeLinecap="round" />
                        <line x1={P.MAS.x - 9} y1={P.MAS.y + 9} x2={P.MAS.x + 9} y2={P.MAS.y - 9} stroke="#C4714A" strokeWidth="2.8" strokeLinecap="round" />
                        <text x={P.MAS.x} y={P.MAS.y + 44} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="20" fill="#C4714A" fontWeight="600" fontStyle="italic">{m.venue_label}</text>
                        <text x={P.MAS.x} y={P.MAS.y + 62} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="#A89880" letterSpacing="1.5">{m.venue_sub}</text>
                    </g>

                    {/* Mas Corbella — small pencil sketch just below "La casa" */}
                    <g
                        transform={`translate(${P.MAS.x} ${P.MAS.y + 95})`}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    >
                        {/* Ground line */}
                        <path d="M -38 24 L 38 24" strokeWidth="0.7" opacity="0.55" />

                        {/* Cypress (left) */}
                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M -32 24 Q -34 16 -33 4 Q -32 -3 -32.5 -8 Q -33 -11 -32 -8" />
                            <path d="M -30 24 Q -29 16 -30 4 Q -31 -3 -30.5 -8" />
                        </g>

                        {/* Oak (right) */}
                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M 32 24 L 32 9" />
                            <path d="M 32 9 Q 26 7 25 1 Q 26 -4 32 -4 Q 38 -4 38 2 Q 38 8 32 9 Z" />
                        </g>

                        {/* Roof */}
                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -22 -8 L -18 -14 L 18 -14 L 22 -8" />
                            <path d="M -21 -9.5 L 21 -9.5" strokeWidth="0.3" opacity="0.5" />
                            <path d="M -19 -11.5 L 19 -11.5" strokeWidth="0.3" opacity="0.45" />
                        </g>

                        {/* Chimney */}
                        <path d="M -12 -14 L -12 -17 L -9 -17 L -9 -14" strokeWidth="0.6" opacity="0.7" />

                        {/* Body */}
                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -20 24 L -20 -8 L 20 -8 L 20 24" />
                            <path d="M -20 6 L 20 6" strokeWidth="0.4" opacity="0.55" />
                        </g>

                        {/* Upper windows */}
                        <g strokeWidth="0.6" opacity="0.75">
                            <rect x="-16" y="-4" width="3.5" height="5" />
                            <rect x="-8" y="-4" width="3.5" height="5" />
                            <rect x="4.5" y="-4" width="3.5" height="5" />
                            <rect x="12.5" y="-4" width="3.5" height="5" />
                        </g>

                        {/* Arches */}
                        <g strokeWidth="0.7" opacity="0.85">
                            <path d="M -16 24 L -16 15 Q -16 9 -11 9 Q -6 9 -6 15 L -6 24" />
                            <path d="M 6 24 L 6 15 Q 6 9 11 9 Q 16 9 16 15 L 16 24" />
                        </g>

                        {/* Arch shadows */}
                        <g strokeWidth="0.28" opacity="0.5">
                            <path d="M -14 14 L -8 14" />
                            <path d="M -14 17 L -8 17" />
                            <path d="M -14 20 L -8 20" />
                            <path d="M 8 14 L 14 14" />
                            <path d="M 8 17 L 14 17" />
                            <path d="M 8 20 L 14 20" />
                        </g>

                        {/* Central door */}
                        <path d="M -3 24 L -3 13 L 3 13 L 3 24" strokeWidth="0.6" opacity="0.75" />

                        {/* The house wakes up at dusk — the party is inside */}
                        <NightLight>
                            <rect x="-16" y="-4" width="3.5" height="5" />
                            <rect x="-8" y="-4" width="3.5" height="5" />
                            <rect x="4.5" y="-4" width="3.5" height="5" />
                            <rect x="12.5" y="-4" width="3.5" height="5" />
                            <g opacity="0.72">
                                <path d="M -16 24 L -16 15 Q -16 9 -11 9 Q -6 9 -6 15 L -6 24 Z" />
                                <path d="M 6 24 L 6 15 Q 6 9 11 9 Q 16 9 16 15 L 16 24 Z" />
                                <path d="M -3 24 L -3 13 L 3 13 L 3 24 Z" />
                            </g>
                            <ellipse cx="0" cy="25" rx="22" ry="3.4" opacity="0.25" />
                        </NightLight>

                        <ChimneySmoke x={-10.5} y={-17.5} />
                    </g>
                </svg>

                {/* ------- LANDSCAPE MAP (desktop) ------- */}
                <svg
                    ref={landscapeRef}
                    viewBox="0 0 800 380"
                    className="w-full h-auto hidden md:block"
                    role="img"
                    aria-label={m.title}
                >
                    <defs>
                        <pattern id="map-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.7" fill="#5E6B3C" opacity="0.05" />
                        </pattern>
                    </defs>

                    <rect width="800" height="380" fill="url(#map-dots)" />

                    <circle cx="40" cy="30" r="55" fill="#5E6B3C" opacity="0.025" />
                    <circle cx="760" cy="350" r="70" fill="#5E6B3C" opacity="0.02" />

                    {/* Sunrise on the way up, sunset on the way back */}
                    <SkyCycle
                        id="l"
                        width={800}
                        height={380}
                        arc={LANDSCAPE_ARC}
                        stars={LANDSCAPE_STARS}
                        sunKeyPoints="0;1;1"
                        sunKeyTimes="0;0.56;1"
                    />

                    <rect x="12" y="12" width="776" height="356" fill="none" stroke="#5E6B3C" strokeWidth="1.2" opacity="0.4" rx="14" />
                    <rect x="20" y="20" width="760" height="340" fill="none" stroke="#5E6B3C" strokeWidth="0.5" opacity="0.25" rx="10" strokeDasharray="4 4" />

                    {/* Mountains */}
                    <g opacity="0.28" fill="none" stroke="#5E6B3C" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                        <path d="M 330 105 L 350 82 L 368 105 L 388 84 L 408 106" />
                        <path d="M 346 105 L 358 94 M 376 105 L 388 96" />
                        <path d="M 418 122 L 436 100 L 454 124" />
                    </g>

                    {/* Waves near Tarragona */}
                    <g opacity="0.3" fill="none" stroke="#5E6B3C" strokeWidth="0.9" strokeLinecap="round">
                        <path d="M 470 340 Q 485 335 500 340 T 530 340 T 560 340 T 590 340" />
                        <path d="M 490 325 Q 505 320 520 325 T 550 325 T 580 325" />
                    </g>

                    {/* Trees */}
                    <g fill="#5E6B3C" opacity="0.2">
                        <circle cx="380" cy="100" r="2.5" />
                        <circle cx="420" cy="140" r="2.5" />
                        <circle cx="360" cy="180" r="2.2" />
                        <circle cx="480" cy="200" r="2.5" />
                        <circle cx="400" cy="240" r="2.2" />
                        <circle cx="540" cy="270" r="2.5" />
                        <circle cx="320" cy="280" r="2.2" />
                    </g>

                    <path
                        id="transfer-route"
                        d={landscapeRoute}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeWidth="2.4"
                        strokeDasharray="2 9"
                        strokeLinecap="round"
                        opacity="0.75"
                    />

                    {/* VW Combi doing the round trip */}
                    <Combi routeId="transfer-route" keyPoints={landscapeTrip.keyPoints} keyTimes={landscapeTrip.keyTimes} facing={landscapeTrip.facing} />

                    {/* Guests waiting at each stop, and the ring that flares when the combi pulls in */}
                    <StopPulse cx={L.TARRAGONA.x} cy={L.TARRAGONA.y} r={11} at={[0.005, BACK_HOME]} />
                    <StopPulse cx={L.CRISOL.x} cy={L.CRISOL.y} r={11} at={landscapeTrip.crisol} />
                    <StopPulse cx={L.FELIX.x} cy={L.FELIX.y} r={11} at={landscapeTrip.felix} />
                    <StopPulse cx={L.MAS.x} cy={L.MAS.y} r={17} at={[REACHES_VENUE, LEAVES_VENUE]} color="#C4714A" />
                    <Passengers x={568} y={314} timing={WAITING_IN_TARRAGONA} />
                    <Passengers x={188} y={213} timing={waitingAt(landscapeTrip.crisol)} />
                    <Passengers x={700} y={58} timing={waitingAt(landscapeTrip.felix)} />
                    <Passengers x={100} y={170} timing={AT_THE_VENUE} scale={0.9} />

                    {/* End of the party: fireworks over Mas Corbella */}
                    <Fireworks
                        from={{ x: 96, y: 124 }}
                        bursts={[
                            { x: 54, y: 84, r: 16, after: 0, color: '#EFBB78' },
                            { x: 188, y: 116, r: 13, after: 0.026, color: '#C4714A' },
                            { x: 110, y: 26, r: 11, after: 0.05, color: '#FDFBF5' },
                        ]}
                    />

                    {/* Compass */}
                    <g transform="translate(72, 310)" opacity="0.6">
                        <circle r="26" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1" />
                        <circle r="20" fill="none" stroke="#5E6B3C" strokeWidth="0.5" strokeDasharray="1 3" />
                        <polygon points="0,-18 3.5,0 0,18 -3.5,0" fill="#5E6B3C" />
                        <polygon points="-18,0 0,-3.5 18,0 0,3.5" fill="#5E6B3C" opacity="0.5" />
                        <circle r="2" fill="#C4714A" />
                        <text x="0" y="-30" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">N</text>
                        <text x="0" y="38" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">S</text>
                        <text x="32" y="3.5" textAnchor="start" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">E</text>
                        <text x="-32" y="3.5" textAnchor="end" fontFamily="'Playfair Display', Georgia, serif" fontSize="12" fill="#5E6B3C" fontWeight="500">O</text>
                    </g>

                    {/* Markers */}
                    <g>
                        <text x={L.TARRAGONA.x} y={L.TARRAGONA.y - 38} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="17" fill="#5E6B3C" fontWeight="500">{m.tarragona_label}</text>
                        <text x={L.TARRAGONA.x} y={L.TARRAGONA.y - 22} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#A89880" letterSpacing="1">{m.tarragona_sub}</text>
                        <circle cx={L.TARRAGONA.x} cy={L.TARRAGONA.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={L.TARRAGONA.x} y={L.TARRAGONA.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="13" fill="#5E6B3C" fontWeight="600">1</text>
                    </g>

                    <g>
                        <circle cx={L.CRISOL.x} cy={L.CRISOL.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={L.CRISOL.x} y={L.CRISOL.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="13" fill="#5E6B3C" fontWeight="600">2</text>
                        <text x={L.CRISOL.x} y={L.CRISOL.y + 42} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="17" fill="#5E6B3C" fontWeight="500">{hotels[1].name}</text>
                        <text x={L.CRISOL.x} y={L.CRISOL.y + 56} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#A89880" letterSpacing="1">{hotels[1].location}</text>
                    </g>

                    <g>
                        <circle cx={L.FELIX.x} cy={L.FELIX.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={L.FELIX.x} y={L.FELIX.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="13" fill="#5E6B3C" fontWeight="600">3</text>
                        <text x={L.FELIX.x} y={L.FELIX.y + 32} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="17" fill="#5E6B3C" fontWeight="500">{hotels[0].name}</text>
                        <text x={L.FELIX.x} y={L.FELIX.y + 46} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#A89880" letterSpacing="1">{hotels[0].location}</text>
                    </g>

                    <g>
                        <circle cx={L.MAS.x} cy={L.MAS.y} r="17" fill="#FDFBF5" stroke="#C4714A" strokeWidth="2" />
                        <line x1={L.MAS.x - 8} y1={L.MAS.y - 8} x2={L.MAS.x + 8} y2={L.MAS.y + 8} stroke="#C4714A" strokeWidth="2.6" strokeLinecap="round" />
                        <line x1={L.MAS.x - 8} y1={L.MAS.y + 8} x2={L.MAS.x + 8} y2={L.MAS.y - 8} stroke="#C4714A" strokeWidth="2.6" strokeLinecap="round" />
                        <text x={L.MAS.x + 40} y={L.MAS.y + 35} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="18" fill="#C4714A" fontWeight="600" fontStyle="italic">{m.venue_label}</text>
                        <text x={L.MAS.x + 40} y={L.MAS.y + 49} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#A89880" letterSpacing="1.5">{m.venue_sub}</text>
                    </g>

                    {/* Pencil sketch of Mas Corbella */}
                    <g
                        transform={`translate(${L.MAS.x - 5} ${L.MAS.y + 82})`}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    >
                        <path d="M -32 22 L 32 22" strokeWidth="0.7" opacity="0.55" />
                        <path d="M -30 23.6 Q -15 23.1 0 23.6 Q 15 23.1 30 23.6" strokeWidth="0.35" opacity="0.35" />

                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M -27 22 Q -29 15 -28 5 Q -27 -2 -27.5 -7 Q -28 -10 -27 -7" />
                            <path d="M -25 22 Q -24 15 -25 5 Q -26 -2 -25.5 -7" />
                            <path d="M -27 0 L -28 2 M -25.5 -2 L -24.5 0 M -27 8 L -28 10 M -25 10 L -24 12" />
                        </g>

                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M 28 22 L 28 8" />
                            <path d="M 28 8 Q 22 6 21 0 Q 22 -5 28 -5 Q 34 -5 34 1 Q 34 7 28 8 Z" />
                            <path d="M 23 -1 Q 25 -3 27 -2" />
                            <path d="M 29 -2 Q 31 -4 33 -2" />
                            <path d="M 24 3 Q 26 1 28 2" />
                            <path d="M 30 3 Q 32 1 33 3" />
                        </g>

                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -20 -8 L -16 -13 L 16 -13 L 20 -8" />
                            <path d="M -19 -9 L 19 -9" strokeWidth="0.3" opacity="0.55" />
                            <path d="M -18 -10.5 L 18 -10.5" strokeWidth="0.3" opacity="0.5" />
                            <path d="M -17 -12 L 17 -12" strokeWidth="0.3" opacity="0.45" />
                        </g>

                        <path d="M -10 -13 L -10 -15.5 L -7.5 -15.5 L -7.5 -13" strokeWidth="0.6" opacity="0.7" />

                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -18 22 L -18 -8 L 18 -8 L 18 22" />
                            <path d="M -18 6 L 18 6" strokeWidth="0.4" opacity="0.55" />
                        </g>

                        <g strokeWidth="0.32" opacity="0.4">
                            <path d="M -15 -5 L -12 -5" />
                            <path d="M -10 -3 L -7 -3" />
                            <path d="M -4 -6 L -1 -6" />
                            <path d="M 2 -4 L 5 -4" />
                            <path d="M 8 -5 L 11 -5" />
                            <path d="M 13 -3 L 16 -3" />
                            <path d="M -16 -1 L -13 -1" />
                            <path d="M -9 -1 L -6 -1" />
                            <path d="M 4 0 L 7 0" />
                            <path d="M 10 0 L 13 0" />
                            <path d="M -17 9 L -14 9" />
                            <path d="M 14 9 L 17 9" />
                            <path d="M -17 13 L -14 13" />
                            <path d="M 14 13 L 17 13" />
                            <path d="M -17 17 L -14 17" />
                            <path d="M 14 17 L 17 17" />
                            <path d="M -17 20 L -14 20" />
                            <path d="M 14 20 L 17 20" />
                        </g>

                        <g strokeWidth="0.6" opacity="0.75">
                            <rect x="-14" y="-4" width="3" height="4" />
                            <rect x="-7" y="-4" width="3" height="4" />
                            <rect x="4" y="-4" width="3" height="4" />
                            <rect x="11" y="-4" width="3" height="4" />
                            <line x1="-12.5" y1="-4" x2="-12.5" y2="0" strokeWidth="0.28" />
                            <line x1="-5.5" y1="-4" x2="-5.5" y2="0" strokeWidth="0.28" />
                            <line x1="5.5" y1="-4" x2="5.5" y2="0" strokeWidth="0.28" />
                            <line x1="12.5" y1="-4" x2="12.5" y2="0" strokeWidth="0.28" />
                        </g>

                        <g strokeWidth="0.7" opacity="0.85">
                            <path d="M -15 22 L -15 14 Q -15 9 -10 9 Q -5 9 -5 14 L -5 22" />
                            <path d="M 5 22 L 5 14 Q 5 9 10 9 Q 15 9 15 14 L 15 22" />
                        </g>

                        <g strokeWidth="0.28" opacity="0.5">
                            <path d="M -13 13 L -7 13" />
                            <path d="M -13 16 L -7 16" />
                            <path d="M -13 19 L -7 19" />
                            <path d="M 7 13 L 13 13" />
                            <path d="M 7 16 L 13 16" />
                            <path d="M 7 19 L 13 19" />
                        </g>

                        <g strokeWidth="0.6" opacity="0.75">
                            <path d="M -3 22 L -3 12 L 3 12 L 3 22" />
                            <line x1="0" y1="12" x2="0" y2="22" strokeWidth="0.3" opacity="0.55" />
                        </g>

                        <g strokeWidth="0.45" opacity="0.55">
                            <path d="M 18 22 L 27 22" />
                            <path d="M 18 14 L 27 14" />
                            <path d="M 20 22 L 20 14" />
                            <path d="M 24 22 L 24 14" />
                            <path d="M 27 22 L 27 14" />
                            <path d="M 18 14 L 19 13 M 22 14 L 23 13 M 26 14 L 27 13" strokeWidth="0.3" />
                        </g>

                        {/* The house wakes up at dusk — the party is inside */}
                        <NightLight>
                            <rect x="-14" y="-4" width="3" height="4" />
                            <rect x="-7" y="-4" width="3" height="4" />
                            <rect x="4" y="-4" width="3" height="4" />
                            <rect x="11" y="-4" width="3" height="4" />
                            <g opacity="0.72">
                                <path d="M -15 22 L -15 14 Q -15 9 -10 9 Q -5 9 -5 14 L -5 22 Z" />
                                <path d="M 5 22 L 5 14 Q 5 9 10 9 Q 15 9 15 14 L 15 22 Z" />
                                <path d="M -3 22 L -3 12 L 3 12 L 3 22 Z" />
                            </g>
                            <ellipse cx="0" cy="23" rx="20" ry="3" opacity="0.25" />
                        </NightLight>

                        <ChimneySmoke x={-8.75} y={-16} />
                    </g>
                </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-8 border-t-2 border-dashed border-olive/70" />
                    <span className="font-sans text-xs text-stone">{m.legend_route}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-terracotta bg-sand-light text-terracotta text-[11px] font-bold leading-none">
                        ×
                    </span>
                    <span className="font-sans text-xs text-stone">{m.legend_venue}</span>
                </div>
            </div>
        </div>
    )
}
