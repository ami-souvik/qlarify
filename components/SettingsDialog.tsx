"use client"

import * as React from "react"
import { Settings, Moon, Sun, Monitor, X, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

const ACCENT_COLORS = [
    { name: 'Terracotta', color: '#D97757' },
    { name: 'Ocean', color: '#3B82F6' },
    { name: 'Forest', color: '#10B981' },
    { name: 'Amethyst', color: '#8B5CF6' },
    { name: 'Rose', color: '#F43F5E' },
]

export function SettingsDialog() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { theme, setTheme } = useTheme()
    const [accent, setAccent] = React.useState('#D97757')

    React.useEffect(() => {
        const saved = localStorage.getItem('theme-accent-color')
        if (saved) {
            setAccent(saved)
            document.documentElement.style.setProperty('--theme-accent-color', saved)
        }
    }, [])

    const handleAccentChange = (color: string) => {
        setAccent(color)
        localStorage.setItem('theme-accent-color', color)
        document.documentElement.style.setProperty('--theme-accent-color', color)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-500 hover:text-charcoal dark:text-slate-400 dark:hover:text-white hover:bg-ivory dark:hover:bg-charcoal rounded-xl transition-all"
                aria-label="Open settings"
            >
                <Settings className="h-4 w-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-charcoal/40 dark:bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-sm bg-white dark:bg-charcoal border border-[#EEE9E2] dark:border-white/10 rounded-3xl shadow-2xl p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-charcoal dark:text-ivory tracking-tight">Settings</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 -mr-2 text-slate-400 hover:text-charcoal dark:hover:text-white rounded-xl transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Theme Selector */}
                            <div className="mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Theme Preferences</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${theme === 'system' ? 'border-terracotta bg-orange-50 dark:bg-terracotta/10 text-terracotta' : 'border-[#EEE9E2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500'}`}
                                    >
                                        <Monitor size={18} />
                                        <span className="text-[10px] font-bold">System</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${theme === 'light' ? 'border-terracotta bg-orange-50 dark:bg-terracotta/10 text-terracotta' : 'border-[#EEE9E2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500'}`}
                                    >
                                        <Sun size={18} />
                                        <span className="text-[10px] font-bold">Light</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${theme === 'dark' ? 'border-terracotta bg-orange-50 dark:bg-terracotta/10 text-terracotta' : 'border-[#EEE9E2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-500'}`}
                                    >
                                        <Moon size={18} />
                                        <span className="text-[10px] font-bold">Dark</span>
                                    </button>
                                </div>
                            </div>

                            {/* Accent Color Selector */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Accent Color</p>
                                <div className="flex flex-wrap gap-3">
                                    {ACCENT_COLORS.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => handleAccentChange(c.color)}
                                            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm ${accent === c.color ? 'outline outline-2 outline-offset-2' : ''}`}
                                            style={{
                                                backgroundColor: c.color,
                                                outlineColor: c.color
                                            }}
                                            title={c.name}
                                        >
                                            {accent === c.color && (
                                                <Check size={14} className="text-white drop-shadow-md" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
