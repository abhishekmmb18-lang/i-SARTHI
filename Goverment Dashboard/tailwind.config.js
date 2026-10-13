/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    50: '#f0f5ff',
                    100: '#e0ebff',
                    200: '#c7d9fe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#0f274e',
                    950: '#081329',
                },
                chakra: {
                    500: '#000080',
                    600: '#002060',
                    700: '#0a1d4a',
                },
                tricolour: {
                    saffron: '#FF9933',
                    saffronDark: '#D96500',
                    green: '#138808',
                    greenDark: '#0D6005',
                    blue: '#000080',
                },
                gov: {
                    bg: '#f8fafc',
                    surface: '#ffffff',
                    border: '#e2e8f0',
                    text: '#0f172a',
                    muted: '#64748b'
                }
            },
            fontFamily: {
                sans: ['"Noto Sans Devanagari"', 'Inter', 'sans-serif'],
                hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
                latin: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
