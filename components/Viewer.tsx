import React from 'react';
import { Upload } from 'lucide-react';
import { PatientMetadata, ToolType } from '../types';

interface ViewerProps {
    viewerRef: React.RefObject<HTMLDivElement>;
    selectedFile: File | null;
    metadata: PatientMetadata | null;
    activeTool: ToolType;
    onMouseDown: (e: React.MouseEvent) => void;
}

const Viewer: React.FC<ViewerProps> = ({
    viewerRef,
    selectedFile,
    metadata,
    activeTool,
    onMouseDown
}) => {
    return (
        <main className="flex-1 bg-black relative flex items-center justify-center group overflow-hidden">
            <div
                ref={viewerRef}
                onMouseDown={onMouseDown}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full cursor-crosshair viewer-canvas animate-fade-in bg-[#0a0a0a] relative"
            />

            {!selectedFile && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 pointer-events-none animate-fade-in">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-blue-600/5 flex items-center justify-center border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-20" />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-slate-300 font-bold font-heading text-lg">Empty Viewer</h3>
                        <p className="text-slate-500 font-medium text-sm">Drag and drop or select a DICOM scan to begin analysis</p>
                    </div>
                </div>
            )}

            {/* Modern Overlays */}
            {selectedFile && (
                <div className="absolute top-6 right-6 pointer-events-none space-y-2 text-right">
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-3 rounded-xl shadow-2xl animate-slide-in">
                        <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest mb-1">Technical Specs</p>
                        <div className="space-y-1 font-mono text-[11px] text-slate-400">
                            <p>RES: <span className="text-slate-200">512x512</span></p>
                            <p>TYPE: <span className="text-slate-200">{metadata?.modality || '---'}</span></p>
                            <p>DEPTH: <span className="text-slate-200">16-BIT</span></p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tool Indicator Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-slate-900/80 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl uppercase tracking-widest flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Mode: {activeTool}
            </div>

            {/* Vignette effect */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]" />
        </main>
    );
};

export default Viewer;
