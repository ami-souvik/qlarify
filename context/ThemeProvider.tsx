"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

type AccentThemeContextType = {
    color: string;
    setColor: (color: string) => void;
};

const AccentThemeContext = React.createContext<AccentThemeContextType | undefined>(undefined);

export function useAccentTheme() {
    const context = React.useContext(AccentThemeContext);
    if (context === undefined) {
        throw new Error("useAccentTheme must be used within a ThemeProvider");
    }
    return context;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const [color, setColorState] = React.useState('#D97757:#FFEDD4');

    React.useEffect(() => {
        const savedThemeBase = localStorage.getItem('theme-accent-color');
        if (savedThemeBase) {
            setColorState(savedThemeBase);
            const [accent, selection] = savedThemeBase.split(':');
            document.documentElement.style.setProperty('--theme-accent-color', accent);
            document.documentElement.style.setProperty('--theme-selection-color', selection);
        } else {
            const [accent, selection] = '#D97757:#FFEDD4'.split(':');
            document.documentElement.style.setProperty('--theme-accent-color', accent);
            document.documentElement.style.setProperty('--theme-selection-color', selection);
        }
    }, []);

    const setColor = React.useCallback((newColor: string) => {
        setColorState(newColor);
        const [accent, selection] = newColor.split(':');
        localStorage.setItem('theme-accent-color', newColor);
        document.documentElement.style.setProperty('--theme-accent-color', accent);
        document.documentElement.style.setProperty('--theme-selection-color', selection);
    }, []);

    return (
        <NextThemesProvider {...props}>
            <AccentThemeContext.Provider value={{ color, setColor }}>
                {children}
            </AccentThemeContext.Provider>
        </NextThemesProvider>
    );
}
