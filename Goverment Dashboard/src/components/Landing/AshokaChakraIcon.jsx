import React from 'react';

/**
 * 24-spoke Ashoka Chakra decorative motif
 * Designed in compliance with project demonstration guidelines (custom decorative vector)
 */
export default function AshokaChakraIcon({ className = 'w-12 h-12', color = '#000080' }) {
    // Generate 24 spokes at 15-degree intervals (360 / 24 = 15 deg)
    const spokes = Array.from({ length: 24 }, (_, i) => i * 15);

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="अशोक चक्र रूपांकन"
            role="img"
        >
            {/* Outer double decorative ring */}
            <circle cx="50" cy="50" r="47" stroke={color} strokeWidth="3" />
            <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="1" strokeDasharray="1.5 2" />

            {/* Central hub circles */}
            <circle cx="50" cy="50" r="10" stroke={color} strokeWidth="2.5" fill="#ffffff" />
            <circle cx="50" cy="50" r="4.5" fill={color} />

            {/* 24 Radial Spokes with traditional teardrop/triangular shape */}
            {spokes.map((angle) => (
                <g key={angle} transform={`rotate(${angle} 50 50)`}>
                    {/* Main radial spoke line */}
                    <line
                        x1="50"
                        y1="40"
                        x2="50"
                        y2="6.5"
                        stroke={color}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    {/* Spoke tip dot near the rim */}
                    <circle cx="50" cy="8.5" r="1.3" fill={color} />
                </g>
            ))}
        </svg>
    );
}
