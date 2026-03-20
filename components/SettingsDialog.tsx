"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
    Settings, Bell, Zap, Grid, Database, Shield, Users, User, X, ChevronDown, Play, Check
} from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useAccentTheme } from "@/context/ThemeProvider"
import { CustomSelect } from "./CustomSelect"

const ACCENT_COLORS = [
    { label: 'Terracotta', color: '#D97757', value: '#D97757:#FFEDD4' },
    { label: 'Ocean', color: '#3B82F6', value: '#3B82F6:#A9CAFF' },
    { label: 'Forest', color: '#10B981', value: '#10B981:#AAF4DC' },
    { label: 'Amethyst', color: '#8B5CF6', value: '#8B5CF6:#D8C7FE' },
    { label: 'Rose', color: '#F43F5E', value: '#F43F5E:#FFB8C4' },
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

export function SettingsDialog() {
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const { theme, setTheme } = useTheme()
    const { color, setColor } = useAccentTheme()
    const [activeTab, setActiveTab] = React.useState('general')

    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-500 hover:text-charcoal dark:text-slate-400 dark:hover:text-white hover:bg-ivory dark:hover:bg-charcoal rounded-xl transition-all"
                aria-label="Open settings"
            >
                <Settings className="h-4 w-4" />
            </button>

            {mounted ? createPortal(
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
                                className="relative w-full max-w-2xl h-[85vh] sm:h-[640px] flex bg-[#F9F9F9] dark:bg-[#1E1E1E] border border-[#EEE9E2] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10"
                            >
                                {/* Left Sidebar */}
                                <div className="w-48 flex-shrink-0 border-r border-[#EEE9E2] dark:border-white/10 bg-[#F9F9F9] dark:bg-[#151515] p-3 flex flex-col pt-12 relative">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-4 left-4 p-2 text-slate-500 hover:text-charcoal dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
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
                                    <div className="p-4 max-w-3xl w-full mx-auto">
                                        <h1 className="pb-4 text-[22px] font-medium text-charcoal dark:text-ivory border-b border-[#EEE9E2] dark:border-white/5">
                                            {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
                                        </h1>

                                        {activeTab === 'general' ? (
                                            <div className="space-y-6">
                                                {/* Settings List */}
                                                <div className="divide-y divide-[#EEE9E2] dark:divide-white/5">

                                                    {/* Appearance */}
                                                    <div className="py-4 flex items-center justify-between relative z-[60]">
                                                        <span className="text-[14px] text-charcoal dark:text-ivory">Appearance</span>
                                                        <CustomSelect
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
                                                    <div className="py-4 flex items-center justify-between relative z-[50]">
                                                        <span className="text-[14px] text-charcoal dark:text-ivory">Accent color</span>
                                                        <CustomSelect
                                                            value={color}
                                                            onChange={(val: string) => setColor(val)}
                                                            options={ACCENT_COLORS}
                                                        />
                                                    </div>

                                                    {/* Language */}
                                                    <div className="py-4 flex items-center justify-between relative z-[40]">
                                                        <span className="text-[14px] text-charcoal dark:text-ivory">Language</span>
                                                        <CustomSelect
                                                            value="auto"
                                                            onChange={() => { }}
                                                            options={[{ label: 'Auto-detect', value: 'auto' }]}
                                                        />
                                                    </div>

                                                    {/* Spoken Language */}
                                                    <div className="py-5 flex items-start justify-between relative z-[30]">
                                                        <div className="max-w-[70%]">
                                                            <span className="text-[14px] text-charcoal dark:text-ivory block mb-1">Spoken language</span>
                                                            <p className="text-[13px] text-slate-500 dark:text-slate-400">
                                                                For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.
                                                            </p>
                                                        </div>
                                                        <CustomSelect
                                                            value="auto"
                                                            onChange={() => { }}
                                                            options={[{ label: 'Auto-detect', value: 'auto' }]}
                                                        />
                                                    </div>

                                                    {/* Voice */}
                                                    <div className="py-4 flex items-center justify-between relative z-[20]">
                                                        <span className="text-[14px] text-charcoal dark:text-ivory">Voice</span>
                                                        <div className="flex items-center gap-3">
                                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#EEE9E2] dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#444444] text-charcoal dark:text-ivory text-sm font-medium rounded-full transition-colors">
                                                                <Play size={12} className="fill-current" />
                                                                Play
                                                            </button>
                                                            <CustomSelect
                                                                value="maple"
                                                                onChange={() => { }}
                                                                options={[{ label: 'Maple', value: 'maple' }]}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-500 text-sm my-6">
                                                Settings for {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label} will appear here.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div >
                    )
                    }
                </AnimatePresence >
                , document.body) : null}
        </>
    )
}
