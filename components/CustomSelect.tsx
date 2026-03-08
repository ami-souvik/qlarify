import React from "react"
import { Check, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Custom select component to match the visual
export function CustomSelect({ value, onChange, options, minWidth = "w-auto" }: any) {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const selectedOption = options.find((o: any) => o.value === value) || options[0]

    return (
        <div className={`relative inline-block text-left ${minWidth}`} ref={selectRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-2.5 bg-charcoal px-2.5 py-1.5 rounded-lg text-[14px] font-medium outline-none transition-colors group ${isOpen ? 'text-charcoal dark:text-ivory bg-charcoal dark:bg-charcoal' : 'text-charcoal dark:text-ivory'}`}
            >
                <div className="flex items-center gap-2.5">
                    {selectedOption?.color && (
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: selectedOption.color }} />
                    )}
                    {selectedOption?.label}
                </div>
                <ChevronDown size={16} className="text-slate-400 group-hover:text-charcoal dark:group-hover:text-ivory transition-colors" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#303030] border border-[#EEE9E2] dark:border-white/10 rounded-2xl shadow-xl overflow-y-auto max-h-[300px] z-[200] py-2"
                    >
                        {options.map((opt: any) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[14px] font-medium transition-colors hover:bg-slate-100 dark:hover:bg-[#404040] ${value === opt.value ? 'bg-slate-50 dark:bg-white/5 text-charcoal dark:text-ivory' : 'text-slate-600 dark:text-white/80'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {opt.color ? (
                                        <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: opt.color }} />
                                    ) : null}
                                    {opt.label}
                                </div>
                                {value === opt.value && (
                                    <Check size={16} className="text-charcoal dark:text-ivory" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}