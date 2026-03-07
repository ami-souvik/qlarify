"use client"

import * as React from "react"
import {
    Settings, Bell, Zap, Grid, Database, Shield, Users, User, X, ChevronDown, Play, ShieldAlert
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"

const ACCENT_COLORS = [
    { name: 'Terracotta', color: '#D97757', value: '#D97757' },
    { name: 'Orange', color: '#EA580C', value: '#EA580C' },
    { name: 'Ocean', color: '#3B82F6', value: '#3B82F6' },
    { name: 'Forest', color: '#10B981', value: '#10B981' },
    { name: 'Amethyst', color: '#8B5CF6', value: '#8B5CF6' },
    { name: 'Rose', color: '#F43F5E', value: '#F43F5E' },
]

const SIDEBAR_ITEMS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personalization', label: 'Personalization', icon: Zap },
    { id: 'apps', label: 'Apps', icon: Grid },
    { id: 'data', label: 'Data controls', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'parental', label: 'Parental controls', icon: Users },
    { id: 'account', label: 'Account', icon: User },
]

// Custom select component to match the visual
function NativeSelect({ value, onChange, options, minWidth = "w-32" }: any) {
    return (
        <div className="relative inline-block text-left">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`appearance-none bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 px-3 py-1.5 pr-8 rounded-lg text-sm font-medium text-charcoal dark:text-ivory outline-none cursor-pointer ${minWidth}`}
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#252525] text-charcoal dark:text-ivory font-medium">
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
    )
}

export function SettingsDialog() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { theme, setTheme } = useTheme()
    const [accent, setAccent] = React.useState('#D97757')
    const [activeTab, setActiveTab] = React.useState('general')

    React.useEffect(() => {
        const savedThemeBase = localStorage.getItem('theme-accent-color')
        if (savedThemeBase) {
            setAccent(savedThemeBase)
            document.documentElement.style.setProperty('--theme-accent-color', savedThemeBase)
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
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                            className="relative w-full max-w-4xl h-[85vh] sm:h-[640px] flex bg-[#F9F9F9] dark:bg-[#1E1E1E] border border-[#EEE9E2] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                        >
                            {/* Left Sidebar */}
                            <div className="w-64 flex-shrink-0 border-r border-[#EEE9E2] dark:border-white/10 bg-[#F9F9F9] dark:bg-[#151515] p-3 flex flex-col pt-16 relative">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-5 left-5 p-2 text-slate-500 hover:text-charcoal dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <nav className="space-y-1 mt-4">
                                    {SIDEBAR_ITEMS.map((item) => {
                                        const Icon = item.icon
                                        const isActive = activeTab === item.id
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setActiveTab(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${isActive
                                                        ? 'bg-slate-200/60 dark:bg-white/10 text-charcoal dark:text-ivory'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                                    }`}
                                            >
                                                <Icon size={18} className={isActive ? "text-charcoal dark:text-ivory" : "text-slate-500 dark:text-slate-400"} />
                                                {item.label}
                                            </button>
                                        )
                                    })}
                                </nav>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col bg-white dark:bg-[#1E1E1E] overflow-y-auto">
                                <div className="p-10 max-w-3xl w-full mx-auto">
                                    <h1 className="text-[22px] font-medium text-charcoal dark:text-ivory mb-8">
                                        {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
                                    </h1>

                                    {activeTab === 'general' ? (
                                        <div className="space-y-6">
                                            {/* MFA Banner */}
                                            <div className="relative border border-[#EEE9E2] dark:border-white/5 bg-slate-50 dark:bg-[#202020] rounded-2xl p-6 mb-8">
                                                <button className="absolute top-4 right-4 text-slate-400 hover:text-charcoal dark:hover:text-white transition-colors">
                                                    <X size={16} />
                                                </button>
                                                <div className="flex gap-4">
                                                    <div className="mt-1 text-charcoal dark:text-ivory">
                                                        <ShieldAlert size={28} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-charcoal dark:text-ivory text-[15px] mb-2">Secure your account</h3>
                                                        <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-5 max-w-md leading-relaxed">
                                                            Add multi-factor authentication (MFA), like a passkey or text message, to help protect your account when logging in.
                                                        </p>
                                                        <button className="px-4 py-2 hover:bg-slate-200/50 dark:bg-[#2A2A2A] border border-slate-300 dark:border-white/10 dark:hover:bg-white/10 text-charcoal dark:text-ivory text-sm font-medium rounded-full transition-colors">
                                                            Set up MFA
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Settings List */}
                                            <div className="divide-y divide-[#EEE9E2] dark:divide-white/5">

                                                {/* Appearance */}
                                                <div className="py-4 flex items-center justify-between">
                                                    <span className="text-sm text-charcoal dark:text-ivory">Appearance</span>
                                                    <NativeSelect
                                                        value={theme || 'system'}
                                                        onChange={(val: string) => setTheme(val)}
                                                        options={[
                                                            { label: 'System', value: 'system' },
                                                            { label: 'Light', value: 'light' },
                                                            { label: 'Dark', value: 'dark' }
                                                        ]}
                                                    />
                                                </div>

                                                {/* Accent Color */}
                                                <div className="py-4 flex items-center justify-between">
                                                    <span className="text-sm text-charcoal dark:text-ivory">Accent color</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: accent }} />
                                                        <NativeSelect
                                                            value={accent}
                                                            onChange={(val: string) => handleAccentChange(val)}
                                                            options={ACCENT_COLORS.map(c => ({ label: c.name, value: c.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Language */}
                                                <div className="py-4 flex items-center justify-between">
                                                    <span className="text-sm text-charcoal dark:text-ivory">Language</span>
                                                    <NativeSelect
                                                        value="auto"
                                                        onChange={() => { }}
                                                        options={[{ label: 'Auto-detect', value: 'auto' }]}
                                                    />
                                                </div>

                                                {/* Spoken Language */}
                                                <div className="py-5 flex items-start justify-between">
                                                    <div className="max-w-[70%]">
                                                        <span className="text-sm text-charcoal dark:text-ivory block mb-1">Spoken language</span>
                                                        <p className="text-[13px] text-slate-500 dark:text-slate-400">
                                                            For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                                                        </p>
                                                    </div>
                                                    <NativeSelect
                                                        value="auto"
                                                        onChange={() => { }}
                                                        options={[{ label: 'Auto-detect', value: 'auto' }]}
                                                    />
                                                </div>

                                                {/* Voice */}
                                                <div className="py-4 flex items-center justify-between">
                                                    <span className="text-sm text-charcoal dark:text-ivory">Voice</span>
                                                    <div className="flex items-center gap-3">
                                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#EEE9E2] dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#444444] text-charcoal dark:text-ivory text-sm font-medium rounded-full transition-colors">
                                                            <Play size={12} className="fill-current" />
                                                            Play
                                                        </button>
                                                        <NativeSelect
                                                            value="maple"
                                                            onChange={() => { }}
                                                            options={[{ label: 'Maple', value: 'maple' }]}
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 text-sm">
                                            Settings for {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label} will appear here.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
