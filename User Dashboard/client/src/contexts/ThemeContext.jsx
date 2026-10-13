import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ACCENT_COLORS = {
    cyan: {
        id: 'cyan',
        name: 'Cyber Cyan',
        primary: '#06b6d4',
        border: 'border-cyan-500/40',
        bgGradient: 'from-cyan-500 to-blue-600',
        glow: 'shadow-cyan-500/30',
        text: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    blue: {
        id: 'blue',
        name: 'Electric Blue',
        primary: '#3b82f6',
        border: 'border-blue-500/40',
        bgGradient: 'from-blue-600 to-indigo-600',
        glow: 'shadow-blue-500/30',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    },
    emerald: {
        id: 'emerald',
        name: 'Emerald Neon',
        primary: '#10b981',
        border: 'border-emerald-500/40',
        bgGradient: 'from-emerald-500 to-teal-600',
        glow: 'shadow-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    purple: {
        id: 'purple',
        name: 'Neon Purple',
        primary: '#a855f7',
        border: 'border-purple-500/40',
        bgGradient: 'from-purple-600 to-pink-600',
        glow: 'shadow-purple-500/30',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    amber: {
        id: 'amber',
        name: 'Sunset Amber',
        primary: '#f59e0b',
        border: 'border-amber-500/40',
        bgGradient: 'from-amber-500 to-orange-600',
        glow: 'shadow-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    rose: {
        id: 'rose',
        name: 'Crimson Rose',
        primary: '#f43f5e',
        border: 'border-rose-500/40',
        bgGradient: 'from-rose-500 to-red-600',
        glow: 'shadow-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('isarthi_theme') || 'dark';
    });

    const [accentColor, setAccentColor] = useState(() => {
        return localStorage.getItem('isarthi_accent') || 'cyan';
    });

    useEffect(() => {
        localStorage.setItem('isarthi_theme', theme);
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-theme');
            root.classList.remove('dark-theme');
            document.body.classList.add('light-body');
            document.body.classList.remove('dark-body');
        } else {
            root.classList.add('dark-theme');
            root.classList.remove('light-theme');
            document.body.classList.add('dark-body');
            document.body.classList.remove('light-body');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('isarthi_accent', accentColor);
        document.documentElement.setAttribute('data-accent', accentColor);
    }, [accentColor]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const currentAccent = ACCENT_COLORS[accentColor] || ACCENT_COLORS.cyan;

    return (
        <ThemeContext.Provider value={{
            theme,
            setTheme,
            toggleTheme,
            isDark: theme === 'dark',
            isLight: theme === 'light',
            accentColor,
            setAccentColor,
            currentAccent,
            ACCENT_COLORS
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
