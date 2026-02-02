import React from 'react';
import {
    Upload,
    History,
    Info,
    Brain,
    ChevronLeft,
    RefreshCw,
    Activity
} from 'lucide-react';
import { PatientMetadata, ScanRecord } from '../types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    metadata: PatientMetadata | null;
    history: ScanRecord[];
    isAnalyzing: boolean;
    analysisText: string;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRunAnalysis: () => void;
    onHistorySelect: (scan: ScanRecord) => void;
    selectedFile: File | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    setIsOpen,
    metadata,
    history,
    isAnalyzing,
    analysisText,
    onFileSelect,
    onRunAnalysis,
    onHistorySelect,
    selectedFile
}) => {
    if (!isOpen) return null;

    return (
        <aside className="w-80 h-full glass-effect border-r border-slate-700/50 flex flex-col z-20 animate-fade-in">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                        <Activity className="text-blue-400 w-5 h-5" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight font-heading text-white">MedScan AI</h1>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                {/* Upload Section */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-heading px-1">
                        Actions
                    </h2>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="p-3 bg-slate-800 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                            </div>
                            <p className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Upload DICOM</p>
                        </div>
                        <input type="file" className="hidden" accept=".dcm,*" onChange={onFileSelect} />
                    </label>
                </section>

                {/* History Section */}
                {history.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-heading px-1 flex items-center gap-2">
                            <History className="w-3 h-3" /> Recent Scans
                        </h2>
                        <div className="space-y-2">
                            {history.map((scan) => (
                                <div
                                    key={scan.id}
                                    className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all cursor-pointer group"
                                    onClick={() => onHistorySelect(scan)}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                            {scan.patient_name || 'Anonymous'}
                                        </span>
                                        <span className="text-[9px] text-slate-500 font-medium">
                                            {new Date(scan.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-slate-700/50 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                            {scan.modality}
                                        </span>
                                        {scan.analyses && scan.analyses.length > 0 && (
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Patient Data Section */}
                {metadata && (
                    <section className="space-y-4 animate-slide-in">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-heading px-1 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Patient Data
                        </h2>
                        <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 space-y-3">
                            {[
                                { label: 'Name', value: metadata.name },
                                { label: 'Patient ID', value: metadata.id },
                                { label: 'Birthday', value: metadata.birthDate },
                                { label: 'Modality', value: metadata.modality },
                                { label: 'Study Date', value: metadata.studyDate },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</span>
                                    <span className="text-xs text-slate-200 font-medium truncate">{item.value || '---'}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* AI Analysis Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-heading flex items-center gap-2">
                            <Brain className="w-3 h-3" /> AI Insights
                        </h2>
                        {selectedFile && (
                            <button
                                onClick={onRunAnalysis}
                                disabled={isAnalyzing}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                            >
                                {isAnalyzing ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Brain size={12} />}
                                {isAnalyzing ? 'Analyzing' : 'Analyze'}
                            </button>
                        )}
                    </div>

                    <div className={`relative rounded-2xl border transition-all duration-300 ${analysisText ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-800/30 border-slate-700/50'
                        }`}>
                        <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto text-xs leading-relaxed custom-scrollbar">
                            {isAnalyzing ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-4 bg-slate-900/40 rounded-2xl backdrop-blur-sm z-10 font-heading">
                                    <div className="relative">
                                        <div className="w-10 h-10 border-2 border-blue-500/20 rounded-full" />
                                        <RefreshCw className="w-5 h-5 animate-spin text-blue-400 absolute top-2.5 left-2.5" />
                                    </div>
                                    <p className="text-blue-400 font-semibold animate-pulse tracking-wide">Processing Scan...</p>
                                </div>
                            ) : analysisText ? (
                                <div className="text-slate-300 space-y-2 whitespace-pre-wrap">
                                    {analysisText}
                                </div>
                            ) : (
                                <div className="text-slate-500 italic text-center py-6">
                                    Select a scan and click 'Analyze' to generate AI insights.
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className="p-4 border-t border-slate-700/50 text-[9px] font-bold text-slate-500 text-center tracking-widest uppercase bg-slate-900/40">
                MedScan AI v1.0 • Research Use Only
            </div>
        </aside>
    );
};

export default Sidebar;
