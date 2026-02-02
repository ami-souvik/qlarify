import React from 'react';
import { Palette, GitCommit, Type, Box as BoxIcon } from 'lucide-react';

interface VisualControlsProps {
    theme: 'light' | 'dark' | 'neutral';
    edgeStyle: 'default' | 'straight' | 'step';
    onThemeChange: (t: 'light' | 'dark' | 'neutral') => void;
    onEdgeStyleChange: (s: 'default' | 'straight' | 'step') => void;
}

export default function VisualControls({ theme, edgeStyle, onThemeChange, onEdgeStyleChange }: VisualControlsProps) {
    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur shadow-lg rounded-2xl border border-slate-200 p-2 flex gap-4 animate-in slide-in-from-bottom-5">
            {/* Theme Selector */}
            <div className="flex items-center gap-2">
                <Palette size={16} className="text-slate-400" />
                <div className="flex gap-1">
                    <button
                        onClick={() => onThemeChange('light')}
                        className={`w-6 h-6 rounded-full border-2 ${theme === 'light' ? 'border-indigo-600' : 'border-transparent'} bg-white shadow-sm ring-1 ring-slate-200`}
                        title="Light Theme"
                    />
                    <button
                        onClick={() => onThemeChange('neutral')}
                        className={`w-6 h-6 rounded-full border-2 ${theme === 'neutral' ? 'border-indigo-600' : 'border-transparent'} bg-slate-100 shadow-sm ring-1 ring-slate-200`}
                        title="Neutral Theme"
                    />
                    <button
                        onClick={() => onThemeChange('dark')}
                        className={`w-6 h-6 rounded-full border-2 ${theme === 'dark' ? 'border-indigo-600' : 'border-transparent'} bg-slate-800 shadow-sm ring-1 ring-slate-200`}
                        title="Dark Theme"
                    />
                </div>
            </div>
        </div>
    );
}
