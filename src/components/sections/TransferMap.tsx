'use client'

import type { Dictionary } from '@/dictionaries'

// Coordinates reprojected from real lat/lng onto a landscape viewBox.
// viewBox: 800 x 380. Vertical spread compressed for a flatter map.
// - Mas Corbella        41.264992, 1.126738    → ( 60,  50)
// - Hotel Félix (Valls) 41.2669387, 1.2483628  → (740,  46)
// - Crisol La Selva     41.2163585, 1.1339289  → (100, 146)
// - Tarragona centre    41.1188392, 1.2449435  → (721, 330)
const P_MAS = { x: 110, y: 58 }
const P_FELIX = { x: 670, y: 54 }
const P_CRISOL = { x: 220, y: 210 }
const P_TARRAGONA = { x: 600, y: 310 }

export function TransferMap({ dict }: { dict: Dictionary }) {
    const m = dict.accommodation.map
    const hotels = dict.accommodation.hotels

    // Dashed route (ida order): Tarragona → Crisol → Félix → Mas Corbella
    const routePath = [
        `M ${P_TARRAGONA.x} ${P_TARRAGONA.y}`,
        `C 490 310 320 260 ${P_CRISOL.x} ${P_CRISOL.y}`,
        `C 260 120 480 15 ${P_FELIX.x} ${P_FELIX.y}`,
        `C 520 10 300 15 ${P_MAS.x} ${P_MAS.y}`,
    ].join(' ')

    return (
        <div className="w-full">
            <div className="relative rounded-2xl overflow-hidden border border-sand bg-sand-light/60">
                <svg
                    viewBox="0 0 800 380"
                    className="w-full h-auto block"
                    role="img"
                    aria-label={m.title}
                >
                    <defs>
                        <pattern id="map-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.7" fill="#5E6B3C" opacity="0.05" />
                        </pattern>
                    </defs>

                    {/* Subtle dots overlay */}
                    <rect width="800" height="380" fill="url(#map-dots)" />

                    {/* Subtle corner stains */}
                    <circle cx="40" cy="30" r="55" fill="#5E6B3C" opacity="0.025" />
                    <circle cx="760" cy="350" r="70" fill="#5E6B3C" opacity="0.02" />

                    {/* Decorative double border */}
                    <rect x="12" y="12" width="776" height="356" fill="none" stroke="#5E6B3C" strokeWidth="1.2" opacity="0.4" rx="14" />
                    <rect x="20" y="20" width="760" height="340" fill="none" stroke="#5E6B3C" strokeWidth="0.5" opacity="0.25" rx="10" strokeDasharray="4 4" />

                    {/* Mountains (Muntanyes de Prades) — between Mas and Félix */}
                    <g opacity="0.28" fill="none" stroke="#5E6B3C" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
                        <path d="M 330 105 L 350 82 L 368 105 L 388 84 L 408 106" />
                        <path d="M 346 105 L 358 94 M 376 105 L 388 96" />
                        <path d="M 418 122 L 436 100 L 454 124" />
                    </g>

                    {/* Waves near Tarragona (coast) */}
                    <g opacity="0.3" fill="none" stroke="#5E6B3C" strokeWidth="0.9" strokeLinecap="round">
                        <path d="M 470 340 Q 485 335 500 340 T 530 340 T 560 340 T 590 340" />
                        <path d="M 490 325 Q 505 320 520 325 T 550 325 T 580 325" />
                    </g>

                    {/* Decorative trees scattered (hinting forest estate) */}
                    <g fill="#5E6B3C" opacity="0.2">
                        <circle cx="380" cy="100" r="2.5" />
                        <circle cx="420" cy="140" r="2.5" />
                        <circle cx="360" cy="180" r="2.2" />
                        <circle cx="480" cy="200" r="2.5" />
                        <circle cx="400" cy="240" r="2.2" />
                        <circle cx="540" cy="270" r="2.5" />
                        <circle cx="320" cy="280" r="2.2" />
                    </g>

                    {/* Dashed route */}
                    <path
                        id="transfer-route"
                        d={routePath}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeWidth="2.4"
                        strokeDasharray="2 9"
                        strokeLinecap="round"
                        opacity="0.75"
                    />

                    {/* VW Combi T1 following the route */}
                    <g>
                        {/* Ground shadow */}
                        <ellipse cx="0" cy="8" rx="13" ry="1.2" fill="#000" opacity="0.12" />

                        {/* Lower body (turquoise) */}
                        <path
                            d="M -13 -1 L 14 -1 L 14 4 Q 14 5 13 5 L -13 5 Q -14 5 -14 4 L -14 0 Q -14 -1 -13 -1 Z"
                            fill="#5BB1A8"
                        />

                        {/* Upper body (cream) with sloped front */}
                        <path
                            d="M -13 -1 L -13 -7 Q -13 -9 -11 -9 L 7 -9 Q 13 -9 14 -4 L 14 -1 Z"
                            fill="#F3ECDB"
                        />

                        {/* Chrome belt line */}
                        <line x1="-14" y1="-1" x2="14" y2="-1" stroke="#A89880" strokeWidth="0.35" />

                        {/* Sloped windshield (front) */}
                        <path
                            d="M 8 -7.5 Q 11 -7.5 12.5 -4.6 L 8 -3.5 Z"
                            fill="#8FB9C1"
                            opacity="0.75"
                        />

                        {/* Side windows (3) */}
                        <rect x="-11" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                        <rect x="-7" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                        <rect x="-3" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />
                        <rect x="1" y="-7" width="3.4" height="4" rx="0.4" fill="#8FB9C1" opacity="0.75" />

                        {/* VW round emblem on front */}
                        <circle cx="12.3" cy="1.2" r="1.1" fill="none" stroke="#F3ECDB" strokeWidth="0.4" />

                        {/* Round headlight */}
                        <circle cx="12.8" cy="3" r="0.75" fill="#FFF7E0" stroke="#A89880" strokeWidth="0.2" />

                        {/* Front bumper */}
                        <rect x="7" y="4" width="7.2" height="1" rx="0.3" fill="#F3ECDB" />

                        {/* Rear wheel */}
                        <circle cx="-8.5" cy="5.2" r="2.6" fill="#2D2A24" />
                        <circle cx="-8.5" cy="5.2" r="1.3" fill="#F3ECDB" />
                        <circle cx="-8.5" cy="5.2" r="0.4" fill="#5E6B3C" />

                        {/* Front wheel */}
                        <circle cx="8.5" cy="5.2" r="2.6" fill="#2D2A24" />
                        <circle cx="8.5" cy="5.2" r="1.3" fill="#F3ECDB" />
                        <circle cx="8.5" cy="5.2" r="0.4" fill="#5E6B3C" />

                        <animateMotion
                            dur="14s"
                            repeatCount="indefinite"
                        >
                            <mpath href="#transfer-route" />
                        </animateMotion>
                    </g>

                    {/* Compass rose bottom-left */}
                    <g transform="translate(72, 310)" opacity="0.6">
                        <circle r="26" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1" />
                        <circle r="20" fill="none" stroke="#5E6B3C" strokeWidth="0.5" strokeDasharray="1 3" />
                        <polygon points="0,-18 3.5,0 0,18 -3.5,0" fill="#5E6B3C" />
                        <polygon points="-18,0 0,-3.5 18,0 0,3.5" fill="#5E6B3C" opacity="0.5" />
                        <circle r="2" fill="#C4714A" />
                        <text x="0" y="-30" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="10" fill="#5E6B3C" fontWeight="500">N</text>
                        <text x="0" y="38" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontSize="10" fill="#5E6B3C" fontWeight="500">S</text>
                        <text x="32" y="3.5" textAnchor="start" fontFamily="'Playfair Display', Georgia, serif" fontSize="10" fill="#5E6B3C" fontWeight="500">E</text>
                        <text x="-32" y="3.5" textAnchor="end" fontFamily="'Playfair Display', Georgia, serif" fontSize="10" fill="#5E6B3C" fontWeight="500">O</text>
                    </g>

                    {/* --- Markers (numbered in outbound order) --- */}

                    {/* 1. Tarragona (bottom-right) — label above marker */}
                    <g>
                        <text x={P_TARRAGONA.x} y={P_TARRAGONA.y - 38} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="500">{m.tarragona_label}</text>
                        <text x={P_TARRAGONA.x} y={P_TARRAGONA.y - 22} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#A89880" letterSpacing="1">{m.tarragona_sub}</text>
                        <circle cx={P_TARRAGONA.x} cy={P_TARRAGONA.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={P_TARRAGONA.x} y={P_TARRAGONA.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="12" fill="#5E6B3C" fontWeight="600">1</text>
                    </g>

                    {/* 2. Crisol La Selva (mid-left) — label below marker */}
                    <g>
                        <circle cx={P_CRISOL.x} cy={P_CRISOL.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={P_CRISOL.x} y={P_CRISOL.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="12" fill="#5E6B3C" fontWeight="600">2</text>
                        <text x={P_CRISOL.x} y={P_CRISOL.y + 42} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="500">{hotels[1].name}</text>
                        <text x={P_CRISOL.x} y={P_CRISOL.y + 56} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#A89880" letterSpacing="1">{hotels[1].location}</text>
                    </g>

                    {/* 3. Hotel Félix (top-right) — label below marker */}
                    <g>
                        <circle cx={P_FELIX.x} cy={P_FELIX.y} r="11" fill="#FDFBF5" stroke="#5E6B3C" strokeWidth="1.8" />
                        <text x={P_FELIX.x} y={P_FELIX.y + 4} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="12" fill="#5E6B3C" fontWeight="600">3</text>
                        <text x={P_FELIX.x} y={P_FELIX.y + 32} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="15" fill="#5E6B3C" fontWeight="500">{hotels[0].name}</text>
                        <text x={P_FELIX.x} y={P_FELIX.y + 46} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#A89880" letterSpacing="1">{hotels[0].location}</text>
                    </g>

                    {/* 4. Mas Corbella (top-left) — treasure X, label below */}
                    <g>
                        <circle cx={P_MAS.x} cy={P_MAS.y} r="17" fill="#FDFBF5" stroke="#C4714A" strokeWidth="2" />
                        <line x1={P_MAS.x - 8} y1={P_MAS.y - 8} x2={P_MAS.x + 8} y2={P_MAS.y + 8} stroke="#C4714A" strokeWidth="2.6" strokeLinecap="round" />
                        <line x1={P_MAS.x - 8} y1={P_MAS.y + 8} x2={P_MAS.x + 8} y2={P_MAS.y - 8} stroke="#C4714A" strokeWidth="2.6" strokeLinecap="round" />
                        <text x={P_MAS.x + 40} y={P_MAS.y + 35} textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="16" fill="#C4714A" fontWeight="600" fontStyle="italic">{m.venue_label}</text>
                        <text x={P_MAS.x + 40} y={P_MAS.y + 49} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#A89880" letterSpacing="1.5">{m.venue_sub}</text>
                    </g>

                    {/* Mas Corbella — pencil sketch below label */}
                    <g
                        transform={`translate(${P_MAS.x - 5} ${P_MAS.y + 82})`}
                        fill="none"
                        stroke="#5E6B3C"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    >
                        {/* Ground line */}
                        <path d="M -32 22 L 32 22" strokeWidth="0.7" opacity="0.55" />
                        <path d="M -30 23.6 Q -15 23.1 0 23.6 Q 15 23.1 30 23.6" strokeWidth="0.35" opacity="0.35" />

                        {/* Cypress tree (left) */}
                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M -27 22 Q -29 15 -28 5 Q -27 -2 -27.5 -7 Q -28 -10 -27 -7" />
                            <path d="M -25 22 Q -24 15 -25 5 Q -26 -2 -25.5 -7" />
                            <path d="M -27 0 L -28 2 M -25.5 -2 L -24.5 0 M -27 8 L -28 10 M -25 10 L -24 12" />
                        </g>

                        {/* Oak tree (right) */}
                        <g strokeWidth="0.5" opacity="0.55">
                            <path d="M 28 22 L 28 8" />
                            <path d="M 28 8 Q 22 6 21 0 Q 22 -5 28 -5 Q 34 -5 34 1 Q 34 7 28 8 Z" />
                            <path d="M 23 -1 Q 25 -3 27 -2" />
                            <path d="M 29 -2 Q 31 -4 33 -2" />
                            <path d="M 24 3 Q 26 1 28 2" />
                            <path d="M 30 3 Q 32 1 33 3" />
                        </g>

                        {/* Roof — low pitched, with tile rows */}
                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -20 -8 L -16 -13 L 16 -13 L 20 -8" />
                            <path d="M -19 -9 L 19 -9" strokeWidth="0.3" opacity="0.55" />
                            <path d="M -18 -10.5 L 18 -10.5" strokeWidth="0.3" opacity="0.5" />
                            <path d="M -17 -12 L 17 -12" strokeWidth="0.3" opacity="0.45" />
                        </g>

                        {/* Small chimney */}
                        <path d="M -10 -13 L -10 -15.5 L -7.5 -15.5 L -7.5 -13" strokeWidth="0.6" opacity="0.7" />

                        {/* Main body walls */}
                        <g strokeWidth="0.7" opacity="0.8">
                            <path d="M -18 22 L -18 -8 L 18 -8 L 18 22" />
                            {/* Floor divider */}
                            <path d="M -18 6 L 18 6" strokeWidth="0.4" opacity="0.55" />
                        </g>

                        {/* Stone texture — short pencil strokes */}
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

                        {/* Upper floor windows (4 small rectangular) */}
                        <g strokeWidth="0.6" opacity="0.75">
                            <rect x="-14" y="-4" width="3" height="4" />
                            <rect x="-7" y="-4" width="3" height="4" />
                            <rect x="4" y="-4" width="3" height="4" />
                            <rect x="11" y="-4" width="3" height="4" />
                            {/* Mullions */}
                            <line x1="-12.5" y1="-4" x2="-12.5" y2="0" strokeWidth="0.28" />
                            <line x1="-5.5" y1="-4" x2="-5.5" y2="0" strokeWidth="0.28" />
                            <line x1="5.5" y1="-4" x2="5.5" y2="0" strokeWidth="0.28" />
                            <line x1="12.5" y1="-4" x2="12.5" y2="0" strokeWidth="0.28" />
                        </g>

                        {/* Ground floor — 2 arched openings (iconic) */}
                        <g strokeWidth="0.7" opacity="0.85">
                            <path d="M -15 22 L -15 14 Q -15 9 -10 9 Q -5 9 -5 14 L -5 22" />
                            <path d="M 5 22 L 5 14 Q 5 9 10 9 Q 15 9 15 14 L 15 22" />
                        </g>

                        {/* Arch shadows — cross-hatching */}
                        <g strokeWidth="0.28" opacity="0.5">
                            <path d="M -13 13 L -7 13" />
                            <path d="M -13 16 L -7 16" />
                            <path d="M -13 19 L -7 19" />
                            <path d="M 7 13 L 13 13" />
                            <path d="M 7 16 L 13 16" />
                            <path d="M 7 19 L 13 19" />
                        </g>

                        {/* Central entrance (door) between arches */}
                        <g strokeWidth="0.6" opacity="0.75">
                            <path d="M -3 22 L -3 12 L 3 12 L 3 22" />
                            <line x1="0" y1="12" x2="0" y2="22" strokeWidth="0.3" opacity="0.55" />
                        </g>

                        {/* Pergola extending right — wooden beams */}
                        <g strokeWidth="0.45" opacity="0.55">
                            <path d="M 18 22 L 27 22" />
                            <path d="M 18 14 L 27 14" />
                            <path d="M 20 22 L 20 14" />
                            <path d="M 24 22 L 24 14" />
                            <path d="M 27 22 L 27 14" />
                            {/* Roof beams on pergola */}
                            <path d="M 18 14 L 19 13 M 22 14 L 23 13 M 26 14 L 27 13" strokeWidth="0.3" />
                        </g>
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
