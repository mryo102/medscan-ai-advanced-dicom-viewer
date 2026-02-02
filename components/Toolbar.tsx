import React from 'react';
import {
    Sun,
    ZoomIn,
    Move,
    RefreshCw,
    Maximize,
    Menu
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
    activeTool: ToolType;
    setActiveTool: (tool: ToolType) => void;
    onReset: () => void;
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    fileName: string | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
    activeTool,
    setActiveTool,
    onReset,
    onToggleSidebar,
    isSidebarOpen,
    fileName
}) => {
    return (
        <nav className="h-16 border-b border-white/5 bg-slate-900/40 backdrop-blur-xl flex items-center px-4 md:px-6 justify-between z-10">
            <div className="flex items-center gap-1.5 md:gap-3">
                {!isSidebarOpen && (
                    <button
                        onClick={onToggleSidebar}
                        className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-300 hover:text-white transition-all active:scale-95"
                    >
                        <Menu size={18} />
                    </button>
                )}

                <div className="flex bg-slate-950/40 p-1 rounded-2xl border border-white/5 items-center">
                    <ToolButton
                        active={activeTool === 'window'}
                        onClick={() => setActiveTool('window')}
                        icon={<Sun size={18} />}
                        label="Windowing"
                    />
                    <ToolButton
                        active={activeTool === 'zoom'}
                        onClick={() => setActiveTool('zoom')}
                        icon={<ZoomIn size={18} />}
                        label="Zoom"
                    />
                    <ToolButton
                        active={activeTool === 'pan'}
                        onClick={() => setActiveTool('pan')}
                        icon={<Move size={18} />}
                        label="Pan"
                    />
                    <div className="w-[1px] h-4 bg-slate-800 mx-2" />
                    <button
                        onClick={onReset}
                        className="p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-all active:scale-95"
                        title="Reset View"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="hidden sm:flex items-center gap-6">
                {fileName && (
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Scanning File</span>
                        <span className="text-xs font-mono text-slate-300 truncate max-w-[150px]">{fileName}</span>
                    </div>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all">
                    <Maximize size={14} /> Fullscreen
                </button>
            </div>
        </nav>
    );
};

interface ToolButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 group relative ${active
                ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/30'
                : 'hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
        title={label}
    >
        {icon}
        {active && <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">{label}</span>}
    </button>
);

export default Toolbar;
